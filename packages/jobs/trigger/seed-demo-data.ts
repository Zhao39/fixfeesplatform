/**
 * Demo Data Seeding - Trigger.dev Task
 *
 * This task seeds demo data for a company based on their selected industry and modules.
 * It runs in the background to avoid blocking the onboarding flow.
 */

import { getCarbonServiceRole } from "@carbon/auth";
import {
  createDemoSeeder,
  type DemoModule,
  type Industry
} from "@carbon/database/seed/demo";
import { task } from "@trigger.dev/sdk/v3";
import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";

export interface SeedDemoDataPayload {
  companyId: string;
  industryId: string;
  /** Optional - defaults to all modules if not provided */
  modules?: string[];
  userId: string;
}


function createKyselyDb(): Kysely<any> {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    throw new Error("SUPABASE_DB_URL environment variable is not set");
  }

  // Use connection pooler port for Supabase
  const poolerUrl = connectionString.includes("supabase.co")
    ? connectionString.replace("5432", "6543")
    : connectionString;

  const pool = new pg.Pool({
    connectionString: poolerUrl,
    max: 5
  });

  return new Kysely<any>({
    dialect: new PostgresDialect({ pool })
  });
}

export const seedDemoData = task({
  id: "seed-demo-data",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000
  },
  run: async (payload: SeedDemoDataPayload) => {
    const { companyId, industryId, userId } = payload;
    // Default to all modules if not provided
    const modules = payload.modules ?? [
      "Sales",
      "Purchasing",
      "Parts",
      "Inventory"
    ];

    console.info("Starting demo data seeding", {
      companyId,
      industryId,
      modules,
      userId
    });

    const supabaseClient = getCarbonServiceRole();
    let kyselyDb: Kysely<any> | null = null;

    try {
      // 1. Create a seed run record for tracking
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
        console.error("Failed to create seed run record", {
          error: seedRunError
        });
        throw seedRunError;
      }

      console.info("Created seed run record", { seedRunId: seedRun.id });

      // 2. Create Kysely database connection and seeder
      kyselyDb = createKyselyDb();
      const seeder = createDemoSeeder(kyselyDb);

      // 3. Seed demo data using the Kysely-based seeder
      console.info("Starting demo data seeding with Kysely seeder");

      await seeder.seedDemo({
        companyId,
        industryId: industryId as Industry,
        moduleIds: modules as DemoModule[],
        seededBy: userId
      });

      // 4. Get statistics about what was seeded
      const stats = await seeder.getDemoStatistics(companyId);

      console.info("Demo data seeded successfully", { stats });

      // 5. Update seed run status to done
      await supabaseClient
        .from("demoSeedRun")
        .update({
          status: "done",
          finishedAt: new Date().toISOString()
        })
        .eq("id", seedRun.id);

      // 6. Return summary
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
    } finally {
      // Clean up database connection
      if (kyselyDb) {
        await kyselyDb.destroy();
      }
    }
  }
});
