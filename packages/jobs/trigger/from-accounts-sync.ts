import {
  AccountingEntity,
  AccountingSyncSchema,
  getAccountingIntegration,
  getProviderIntegration,
} from "@carbon/ee/accounting";
import { task } from "@trigger.dev/sdk";
import z from "zod";
import { getCarbonServiceRole } from "@carbon/auth";

const PayloadSchema = AccountingSyncSchema.extend({
  syncDirection: z.enum(["bi-directional", "from-accounts"]),
});

export const fromAccountsSyncTask = task({
  id: "from-accounting-sync",
  run: async (input: z.infer<typeof PayloadSchema>) => {
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
        // results.success.push(result);
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
