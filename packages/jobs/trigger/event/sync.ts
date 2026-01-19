import { logger, task } from "@trigger.dev/sdk";
import { z } from "zod";

const syncPayloadSchema = z.object({
  records: z.array(z.any()),
});

export type SyncPayload = z.infer<typeof syncPayloadSchema>;

// 3. Sync Worker (Batch Optimized)
export const syncTask = task({
  id: "event-handler-sync",
  run: async (payload: SyncPayload) => {
    logger.info(
      `Syncing ${payload.records.length} records`
    );

    console.dir(payload, { depth: null });
    // Implement sync logic here
  },
});
