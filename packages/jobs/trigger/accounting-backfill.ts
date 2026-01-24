import { getCarbonServiceRole } from "@carbon/auth";
import {
  getPostgresClient,
  getPostgresConnectionPool,
} from "@carbon/database/client";
import {
  getAccountingIntegration,
  getProviderIntegration,
  ProviderID,
  SyncFactory,
  type XeroProvider,
} from "@carbon/ee/accounting";
import { logger, task } from "@trigger.dev/sdk/v3";
import { PostgresDriver, sql } from "kysely";
import z from "zod";

const BackfillPayloadSchema = z.object({
  companyId: z.string(),
  provider: z.nativeEnum(ProviderID),
  batchSize: z.number().default(50),
  pageSize: z.number().default(100),
  entityTypes: z
    .object({
      customers: z.boolean().default(true),
      vendors: z.boolean().default(true),
      items: z.boolean().default(true),
    })
    .default({}),
  conflictResolution: z.enum(["skip", "overwrite", "merge"]).default("merge"),
});

export type BackfillPayload = z.input<typeof BackfillPayloadSchema>;
type ParsedBackfillPayload = z.output<typeof BackfillPayloadSchema>;

interface EntitySyncResult {
  pulled: number;
  pushed: number;
}

interface BackfillResult {
  customers: EntitySyncResult;
  vendors: EntitySyncResult;
  items: EntitySyncResult;
  totalPulled: number;
  totalPushed: number;
  pages: {
    contacts: number;
    items: number;
  };
}

/**
 * Get local entity IDs that don't have an externalId for the given provider
 */
async function getUnsyncedEntityIds(
  // Using any to avoid CJS/ESM Kysely type conflicts
  kysely: any,
  table: "customer" | "supplier" | "item",
  companyId: string,
  providerId: string,
  limit: number
): Promise<string[]> {
  const result = await kysely
    .selectFrom(table)
    .select("id")
    .where("companyId", "=", companyId)
    .where((eb: any) =>
      eb.or([
        eb("externalId", "is", null),
        eb(sql.raw(`"externalId"->'${providerId}'->>'id'`), "is", null),
      ])
    )
    .limit(limit)
    .execute();

  return result.map((r: { id: string }) => r.id);
}

export const accountingBackfillTask = task({
  id: "accounting-backfill",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 60000,
    randomize: true,
  },
  run: async (input: BackfillPayload) => {
    const payload: ParsedBackfillPayload = BackfillPayloadSchema.parse(input);
    const client = getCarbonServiceRole();

    const integration = await getAccountingIntegration(
      client,
      payload.companyId,
      payload.provider
    );

    const provider = getProviderIntegration(
      client,
      payload.companyId,
      integration.id,
      integration.metadata
    ) as XeroProvider;

    const pool = getPostgresConnectionPool(1);
    const kysely = getPostgresClient(pool, PostgresDriver);

    const result: BackfillResult = {
      customers: { pulled: 0, pushed: 0 },
      vendors: { pulled: 0, pushed: 0 },
      items: { pulled: 0, pushed: 0 },
      totalPulled: 0,
      totalPushed: 0,
      pages: { contacts: 0, items: 0 },
    };

    try {
      // Create syncers for enabled entity types with their respective configs
      const customerSyncer = payload.entityTypes.customers
        ? SyncFactory.getSyncer("customer", {
            database: kysely,
            companyId: payload.companyId,
            provider,
            config: provider.getSyncConfig("customer"),
          })
        : null;

      const vendorSyncer = payload.entityTypes.vendors
        ? SyncFactory.getSyncer("vendor", {
            database: kysely,
            companyId: payload.companyId,
            provider,
            config: provider.getSyncConfig("vendor"),
          })
        : null;

      const itemSyncer = payload.entityTypes.items
        ? SyncFactory.getSyncer("item", {
            database: kysely,
            companyId: payload.companyId,
            provider,
            config: provider.getSyncConfig("item"),
          })
        : null;

      // ============================================================
      // PHASE 1: Pull from accounting (contacts)
      // ============================================================
      if (customerSyncer || vendorSyncer) {
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          logger.info(`[PULL] Fetching contacts page ${page}`);
          const response = await provider.listContacts({ page });

          if (response.contacts.length === 0) break;

          // Process customers if enabled
          if (customerSyncer) {
            const customers = response.contacts.filter((c) => c.IsCustomer);
            if (customers.length > 0) {
              const ids = customers.map((c) => c.ContactID);
              const syncResult = await customerSyncer.pullBatchFromAccounting(
                ids
              );
              result.customers.pulled += syncResult.successCount;
              logger.info(
                `[PULL] Page ${page}: pulled ${syncResult.successCount} customers`
              );
            }
          }

          // Process vendors if enabled
          if (vendorSyncer) {
            const vendors = response.contacts.filter(
              (c) => c.IsSupplier && !c.IsCustomer
            );
            if (vendors.length > 0) {
              const ids = vendors.map((c) => c.ContactID);
              const syncResult = await vendorSyncer.pullBatchFromAccounting(
                ids
              );
              result.vendors.pulled += syncResult.successCount;
              logger.info(
                `[PULL] Page ${page}: pulled ${syncResult.successCount} vendors`
              );
            }
          }

          hasMore = response.hasMore;
          page++;
        }
        result.pages.contacts = page - 1;
      }

      // ============================================================
      // PHASE 1: Pull from accounting (items)
      // ============================================================
      if (itemSyncer) {
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          logger.info(`[PULL] Fetching items page ${page}`);
          const response = await provider.listItems({ page });

          if (response.items.length === 0) break;

          const ids = response.items.map((item) => item.ItemID);
          const syncResult = await itemSyncer.pullBatchFromAccounting(ids);
          result.items.pulled += syncResult.successCount;
          logger.info(
            `[PULL] Page ${page}: pulled ${syncResult.successCount} items`
          );

          hasMore = response.hasMore;
          page++;
        }
        result.pages.items = page - 1;
      }

      // ============================================================
      // PHASE 2: Push to accounting (local entities without externalId)
      // ============================================================

      // Push customers
      if (customerSyncer) {
        logger.info("[PUSH] Starting customer push to accounting");
        let hasMore = true;

        while (hasMore) {
          const unsyncedIds = await getUnsyncedEntityIds(
            kysely,
            "customer",
            payload.companyId,
            provider.id,
            payload.batchSize
          );

          if (unsyncedIds.length === 0) {
            hasMore = false;
            break;
          }

          const syncResult = await customerSyncer.pushBatchToAccounting(
            unsyncedIds
          );
          result.customers.pushed += syncResult.successCount;
          logger.info(
            `[PUSH] Pushed ${syncResult.successCount} customers to accounting`
          );

          // If we got fewer than batchSize, we're done
          if (unsyncedIds.length < payload.batchSize) {
            hasMore = false;
          }
        }
      }

      // Push vendors
      if (vendorSyncer) {
        logger.info("[PUSH] Starting vendor push to accounting");
        let hasMore = true;

        while (hasMore) {
          const unsyncedIds = await getUnsyncedEntityIds(
            kysely,
            "supplier",
            payload.companyId,
            provider.id,
            payload.batchSize
          );

          if (unsyncedIds.length === 0) {
            hasMore = false;
            break;
          }

          const syncResult = await vendorSyncer.pushBatchToAccounting(
            unsyncedIds
          );
          result.vendors.pushed += syncResult.successCount;
          logger.info(
            `[PUSH] Pushed ${syncResult.successCount} vendors to accounting`
          );

          if (unsyncedIds.length < payload.batchSize) {
            hasMore = false;
          }
        }
      }

      // Push items
      if (itemSyncer) {
        logger.info("[PUSH] Starting item push to accounting");
        let hasMore = true;

        while (hasMore) {
          const unsyncedIds = await getUnsyncedEntityIds(
            kysely,
            "item",
            payload.companyId,
            provider.id,
            payload.batchSize
          );

          if (unsyncedIds.length === 0) {
            hasMore = false;
            break;
          }

          const syncResult = await itemSyncer.pushBatchToAccounting(
            unsyncedIds
          );
          result.items.pushed += syncResult.successCount;
          logger.info(
            `[PUSH] Pushed ${syncResult.successCount} items to accounting`
          );

          if (unsyncedIds.length < payload.batchSize) {
            hasMore = false;
          }
        }
      }

      // Calculate totals
      result.totalPulled =
        result.customers.pulled + result.vendors.pulled + result.items.pulled;
      result.totalPushed =
        result.customers.pushed + result.vendors.pushed + result.items.pushed;

      logger.info(
        `[COMPLETE] Backfill finished. Pulled: ${result.totalPulled}, Pushed: ${result.totalPushed}`
      );

      return result;
    } finally {
      await pool.end();
    }
  },
});
