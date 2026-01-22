import { getCarbonServiceRole } from "@carbon/auth";
import {
  getPostgresClient,
  getPostgresConnectionPool
} from "@carbon/database/client";
import {
  getAccountingIntegration,
  getProviderIntegration,
  ProviderID,
  SyncFactory
} from "@carbon/ee/accounting";
import { logger, task } from "@trigger.dev/sdk/v3";
import { PostgresDriver } from "kysely";
import z from "zod";

const BackfillPayloadSchema = z.object({
  companyId: z.string(),
  provider: z.nativeEnum(ProviderID),
  entityTypes: z
    .object({
      customers: z.boolean().default(true),
      vendors: z.boolean().default(true)
    })
    .default({})
});

export type BackfillPayload = z.infer<typeof BackfillPayloadSchema>;

export const accountingBackfillTask = task({
  id: "accounting-backfill",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 60000,
    randomize: true
  },
  run: async (input: BackfillPayload) => {
    const payload = BackfillPayloadSchema.parse(input);
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
    );

    const pool = getPostgresConnectionPool(1);
    const kysely = getPostgresClient(pool, PostgresDriver);

    try {
      const syncer = SyncFactory.getSyncer("customer", {
        database: kysely,
        companyId: payload.companyId,
        provider,
        config: provider.getSyncConfig("customer")
      });

      let page = 1;
      let hasMore = true;
      let totalSynced = 0;

      while (hasMore) {
        logger.info(`Fetching contacts page ${page}`);
        const response = await provider.listContacts({ page });

        if (response.contacts.length === 0) break;

        // Filter by entity type flags
        const contacts = response.contacts.filter((c) => {
          if (payload.entityTypes.customers && c.IsCustomer) return true;
          if (payload.entityTypes.vendors && c.IsSupplier) return true;
          return false;
        });

        if (contacts.length > 0) {
          const ids = contacts.map((c) => c.ContactID);
          const result = await syncer.pullBatchFromAccounting(ids);
          totalSynced += result.successCount;
          logger.info(`Page ${page}: synced ${result.successCount} contacts`);
        }

        hasMore = response.hasMore;
        page++;
      }

      return { totalSynced, pages: page - 1 };
    } finally {
      await pool.end();
    }
  }
});
