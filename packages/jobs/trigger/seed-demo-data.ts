/**
 * Demo Data Seeding - Trigger.dev Task
 *
 * This task seeds demo data for a company based on their selected industry and modules.
 * It runs in the background to avoid blocking the onboarding flow.
 */

import { getCarbonServiceRole } from "@carbon/auth";
import { task } from "@trigger.dev/sdk/v3";

export interface SeedDemoDataPayload {
  companyId: string;
  industryId: string;
  modules: string[];
  userId: string;
}

export const seedDemoData = task({
  id: "seed-demo-data",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000
  },
  run: async (payload: SeedDemoDataPayload, { ctx }) => {
    const { companyId, industryId, modules, userId } = payload;

    console.info("Starting demo data seeding", {
      companyId,
      industryId,
      modules,
      userId
    });

    const client = getCarbonServiceRole();

    try {
      // 1. Create a seed run record for tracking
      const { data: seedRun, error: seedRunError } = await client
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
        console.error("Failed to create seed run record", {
          error: seedRunError
        });
        throw seedRunError;
      }

      console.info("Created seed run record", { seedRunId: seedRun.id });

      // 2. Call the seeding procedure
      console.info("Calling seed_demo procedure");

      const { error: seedError } = await client.rpc("seed_demo", {
        p_company_id: companyId,
        p_industry_id: industryId,
        p_module_ids: modules,
        p_seeded_by: userId
      });

      if (seedError) {
        throw seedError;
      }

      // 3. Get statistics about what was seeded
      const { data: stats } = await client.rpc("get_demo_statistics", {
        p_company_id: companyId
      });

      console.info("Demo data seeded successfully", { stats });

      // 4. Update seed run status to done
      await client
        .from("demoSeedRun")
        .update({
          status: "done",
          finishedAt: new Date().toISOString()
        })
        .eq("id", seedRun.id);

      // 5. Return summary
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

      // Try to update seed run status to failed (best effort)
      try {
        const { data: existingRun } = await client
          .from("demoSeedRun")
          .select("id")
          .eq("companyId", companyId)
          .order("createdAt", { ascending: false })
          .limit(1)
          .single();

        if (existingRun) {
          await client
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
