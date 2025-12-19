import { getCarbonServiceRole } from "@carbon/auth";
import {
  AccountingEntity,
  AccountingSyncSchema,
  getAccountingIntegration,
  getProviderIntegration,
  SyncFn,
} from "@carbon/ee/accounting";
import { task } from "@trigger.dev/sdk";
import z from "zod";

const PayloadSchema = AccountingSyncSchema.extend({
  syncDirection: z.enum(["bi-directional", "to-accounts"]),
});

type Payload = z.infer<typeof PayloadSchema>;

const MAPPING: Record<"customer" | "vendor", SyncFn> = {
  async customer({ client, entity, payload, provider }) {
    // Fetch customer from Carbon
    const customer = await client
      .from("customer")
      .select("*, customerLocation(*, address(*))")
      .eq("id", entity.data.companyId)
      .eq("companyId", payload.companyId)
      .single();

    if (customer.error || !customer.data) {
      throw new Error(`Customer ${entity.entityId} not found`);
    }

    return {};
  },
  async vendor({ client, entity, payload, provider }) {},
};

export const toAccountsSyncTask = task({
  id: "to-accounting-sync",
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
        let result;

        const isUpsert =
          entity.operation === "create" ||
          entity.operation === "update" ||
          entity.operation === "sync";

        if (isUpsert) {
          result = await handleEntityUpsert(client, entity, provider);
        } else {
          result = await handleEntityDelete(client, entity, provider);
        }

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
