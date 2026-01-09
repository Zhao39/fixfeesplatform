import { getCarbonServiceRole } from "@carbon/auth";
import { getPostgresClient, getPostgresConnectionPool } from "@carbon/database/client";
import {
  createDemoSeeder,
  type DemoModule,
  type Industry
} from "@carbon/database/seed/demo";
import { task } from "@trigger.dev/sdk/v3";
import { PostgresDriver } from "kysely";

export interface SeedDemoDataPayload {
  companyId: string;
  industryId: string;
  modules?: string[];
  userId: string;
}


export const seedDemoData = task({
  id: "seed-demo-data",
  retry: { maxAttempts: 3, factor: 2, minTimeoutInMs: 1000, maxTimeoutInMs: 10000 },
  run: async (payload: SeedDemoDataPayload) => {
    const { companyId, industryId, userId } = payload;
    const modules = payload.modules ?? ["Sales", "Purchasing", "Parts", "Inventory"];

    console.info("Starting demo data seeding", { companyId, industryId, modules, userId });

    const supabaseClient = getCarbonServiceRole();

    try {
      const { data: seedRun, error: seedRunError } = await supabaseClient
        .from("demoSeedRun")
        .insert({
          companyId,
          requestedBy: userId,
          industryId,
          requestedModules: modules,
          status: "running",
          startedAt: new Date().toISOString()
        })
        .select()
        .single();

      if (seedRunError) {
        console.error("Failed to create seed run record", { error: seedRunError });
        throw seedRunError;
      }

      const seeder = createDemoSeeder(getPostgresClient(getPostgresConnectionPool(5), PostgresDriver));

      await seeder.seedDemo({
        companyId,
        industryId: industryId as Industry,
        moduleIds: modules as DemoModule[]
      });

      const stats = await seeder.getDemoStatistics(companyId);
      console.info("Demo data seeded successfully", { stats });

      await supabaseClient
        .from("demoSeedRun")
        .update({ status: "done", finishedAt: new Date().toISOString() })
        .eq("id", seedRun.id);

      return {
        success: true,
        seedRunId: seedRun.id,
        companyId,
        industryId,
        modules,
        statistics: stats
      };
    } catch (error) {
      console.error("Failed to seed demo data", { error });

      try {
        const { data: existingRun } = await supabaseClient
          .from("demoSeedRun")
          .select("id")
          .eq("companyId", companyId)
          .order("createdAt", { ascending: false })
          .limit(1)
          .single();

        if (existingRun) {
          await supabaseClient
            .from("demoSeedRun")
            .update({
              status: "failed",
              error: error instanceof Error ? error.message : "Unknown error",
              finishedAt: new Date().toISOString()
            })
            .eq("id", existingRun.id);
        }
      } catch (updateError) {
        console.error("Failed to update seed run status", { updateError });
      }

      throw error;
    }
  }
});
