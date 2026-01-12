/**
 * Task to sync entities from accounting providers to Carbon
 */
import { getCarbonServiceRole } from "@carbon/auth";
import {
  getPostgresClient,
  getPostgresConnectionPool,
} from "@carbon/database/client";
import {
  AccountingEntity,
  AccountingSyncSchema,
  EntityMap,
  getAccountingIntegration,
  getEntityWithExternalId,
  getProviderIntegration,
  RatelimitError,
  SyncFn,
  upsertContactAndLinkToCustomer,
  upsertCustomerFromAccounting,
} from "@carbon/ee/accounting";
import { logger, task } from "@trigger.dev/sdk";
import { PostgresDriver } from "kysely";
import z from "zod";

const PayloadSchema = AccountingSyncSchema.extend({
  syncDirection: AccountingSyncSchema.shape.syncDirection.exclude([
    "to-accounting",
  ]),
});

type Payload = z.infer<typeof PayloadSchema>;

const pool = getPostgresConnectionPool(1);

const kysely = getPostgresClient(pool, PostgresDriver);

const UPSERT_MAP: Record<keyof EntityMap, SyncFn> = {
  async customer({ client, entity, payload, provider }) {
    try {
      const customer = await getEntityWithExternalId(
        client,
        "customer",
        payload.companyId,
        provider.id,
        { externalId: entity.entityId }
      );

      // Fetch from provider
      const remote = await provider.contacts.get(entity.entityId);

      logger.info(`Upserting customer with contact id: ${remote.id}`, remote);

      await kysely.transaction().execute(async (tx) => {
        if (!customer) {
          logger.info(`Customer ${entity.entityId} not found, creating...`);
        }

        // Atomically upsert customer and get the customer ID
        const customerId = await upsertCustomerFromAccounting(
          tx,
          remote,
          { companyId: payload.companyId, provider: provider.id },
          customer?.id
        );

        logger.info(`Customer ID: ${customerId}`);

        // Atomically upsert contact and link to customer
        await upsertContactAndLinkToCustomer(tx, remote, customerId, {
          companyId: payload.companyId,
          provider: provider.id,
        });

        logger.info(`Successfully synced customer ${entity.entityId}`);
      });
    } catch (error) {
      logger.error(
        `Failed to upsert customer ${error.message}`
      );

      return {
        id: entity.entityId,
        message: `Failed to upsert customer: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }

    return {
      id: entity.entityId,
      message: "Created successfully",
    };
  },
  async vendor({ client, entity, payload, provider }) {},
};

const DELETE_MAP: Record<keyof EntityMap, SyncFn> = {
  async customer({ client, entity, payload, provider }) {
    const customer = await getEntityWithExternalId(
      client,
      "customer",
      payload.companyId,
      provider.id,
      { id: entity.entityId }
    );

    // if (customer.error || !customer.data) {
    //   throw new Error(`Customer ${entity.entityId} not found`);
    // }

    // const externalId = customer.data.externalId[provider.id];

    return {
      id: entity.entityId,
      message: "Deleted successfully",
    };
  },
  async vendor({ client, entity, payload, provider }) {},
};

export const fromAccountsSyncTask = task({
  id: "from-accounting-sync",
  retry: { maxAttempts: 2, randomize: true },
  // catchError(err)  {
  //   if (err instanceof RatelimitError) {
  //     return {
  //       retryAt: err.retryAt,
  //     };
  //   }

  //   return {
  //     skipRetrying: true,
  //   };
  // },
  run: async (input: Payload) => {
    const payload = PayloadSchema.parse(input);

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
      integration.config
    );

    const results = {
      success: [] as any[],
      failed: [] as { entity: AccountingEntity; error: string }[],
    };

    for (const entity of payload.entities) {
      try {
        const isUpsert =
          entity.operation === "create" ||
          entity.operation === "update" ||
          entity.operation === "sync";

        const handler = isUpsert
          ? UPSERT_MAP[entity.entityType]
          : DELETE_MAP[entity.entityType];

        const result = await handler({
          client,
          kysely,
          entity,
          provider,
          payload: { syncDirection: payload.syncDirection, ...payload },
        });

        logger.info("Result:", { result });

        results.success.push(result);
      } catch (error) {
        console.error(
          `Failed to process ${entity.entityType} ${entity.entityId}:`,
          error
        );

        results.failed.push({
          entity,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },
});
