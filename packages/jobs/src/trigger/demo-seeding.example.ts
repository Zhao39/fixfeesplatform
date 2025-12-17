/**
 * Demo Data Seeding - Trigger.dev Task
 *
 * This task seeds demo data for a company based on their selected industry and modules.
 * It runs in the background to avoid blocking the signup flow.
 *
 * Usage:
 * ```typescript
 * import { seedDemoData } from '@carbon/jobs';
 *
 * // Trigger the job
 * await seedDemoData.trigger({
 *   companyId: company.id,
 *   industryId: 'cnc',
 *   modules: ['Sales', 'Purchasing', 'Parts', 'Inventory'],
 *   userId: user.id
 * });
 * ```
 */

import { createClient } from "@supabase/supabase-js";
import { task } from "@trigger.dev/sdk/v3";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    ctx.logger.info("Starting demo data seeding", {
      companyId,
      industryId,
      modules,
      userId
    });

    // 1. Create a seed run record for tracking
    const { data: seedRun, error: seedRunError } = await supabase
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
      ctx.logger.error("Failed to create seed run record", {
        error: seedRunError
      });
      throw seedRunError;
    }

    ctx.logger.info("Created seed run record", { seedRunId: seedRun.id });

    try {
      // 2. Call the seeding procedure
      ctx.logger.info("Calling seed_demo procedure");

      const { error: seedError } = await supabase.rpc("seed_demo", {
        p_company_id: companyId,
        p_industry_id: industryId,
        p_module_ids: modules,
        p_seeded_by: userId
      });

      if (seedError) {
        throw seedError;
      }

      // 3. Get statistics about what was seeded
      const { data: stats } = await supabase.rpc("get_demo_statistics", {
        p_company_id: companyId
      });

      ctx.logger.info("Demo data seeded successfully", { stats });

      // 4. Update seed run status to done
      await supabase
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
      ctx.logger.error("Failed to seed demo data", { error });

      // Update seed run status to failed
      await supabase
        .from("demoSeedRun")
        .update({
          status: "failed",
          error: {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
          },
          finishedAt: new Date().toISOString()
        })
        .eq("id", seedRun.id);

      throw error;
    }
  }
});

/**
 * Cleanup Demo Data - Trigger.dev Task
 *
 * This task removes untouched demo data for a company.
 * Useful for cleaning up after a trial period or when a company starts using real data.
 */
export const cleanupDemoData = task({
  id: "cleanup-demo-data",
  run: async (
    payload: {
      companyId: string;
      modules?: string[];
      includeTouched?: boolean;
    },
    { ctx }
  ) => {
    const { companyId, modules, includeTouched = false } = payload;

    ctx.logger.info("Starting demo data cleanup", {
      companyId,
      modules,
      includeTouched
    });

    try {
      if (modules && modules.length > 0) {
        // Cleanup specific modules
        for (const module of modules) {
          ctx.logger.info(`Cleaning up ${module} module`);

          if (module === "Sales") {
            await supabase.rpc("cleanup_sales_demo_untouched", {
              p_company_id: companyId
            });
          } else if (module === "Purchasing") {
            await supabase.rpc("cleanup_purchasing_demo_untouched", {
              p_company_id: companyId
            });
          } else if (module === "Parts") {
            await supabase.rpc("cleanup_parts_demo_untouched", {
              p_company_id: companyId
            });
          } else if (module === "Inventory") {
            await supabase.rpc("cleanup_inventory_demo_untouched", {
              p_company_id: companyId
            });
          }
        }
      } else {
        // Cleanup all demo data
        ctx.logger.info("Cleaning up all demo data");

        await supabase.rpc("cleanup_all_demo_data", {
          p_company_id: companyId,
          p_include_touched: includeTouched
        });
      }

      // Get statistics after cleanup
      const { data: stats } = await supabase.rpc("get_demo_statistics", {
        p_company_id: companyId
      });

      ctx.logger.info("Demo data cleanup completed", { stats });

      return {
        success: true,
        companyId,
        statistics: stats
      };
    } catch (error) {
      ctx.logger.error("Failed to cleanup demo data", { error });
      throw error;
    }
  }
});

/**
 * Reseed Demo Module - Trigger.dev Task
 *
 * This task removes untouched demo data for a module and reseeds it with fresh data.
 * Useful when templates are updated or when a user wants to reset a module.
 */
export const reseedDemoModule = task({
  id: "reseed-demo-module",
  run: async (
    payload: {
      companyId: string;
      moduleId: string;
      templateSetId: string;
      userId: string;
    },
    { ctx }
  ) => {
    const { companyId, moduleId, templateSetId, userId } = payload;

    ctx.logger.info("Starting demo module reseed", {
      companyId,
      moduleId,
      templateSetId
    });

    try {
      // Call the reseed procedure (cleanup + seed)
      await supabase.rpc("reseed_demo_module", {
        p_company_id: companyId,
        p_module_id: moduleId,
        p_template_set_id: templateSetId,
        p_seeded_by: userId
      });

      // Get statistics after reseed
      const { data: stats } = await supabase.rpc("get_demo_statistics", {
        p_company_id: companyId
      });

      ctx.logger.info("Demo module reseeded successfully", { stats });

      return {
        success: true,
        companyId,
        moduleId,
        statistics: stats
      };
    } catch (error) {
      ctx.logger.error("Failed to reseed demo module", { error });
      throw error;
    }
  }
});

/**
 * Lock Demo Data - Trigger.dev Task
 *
 * This task locks demo data to prevent cleanup.
 * Useful when a company starts using demo data for real and wants to keep it.
 */
export const lockDemoData = task({
  id: "lock-demo-data",
  run: async (
    payload: {
      companyId: string;
      moduleId?: string;
    },
    { ctx }
  ) => {
    const { companyId, moduleId } = payload;

    ctx.logger.info("Locking demo data", { companyId, moduleId });

    try {
      await supabase.rpc("lock_demo_data", {
        p_company_id: companyId,
        p_module_id: moduleId || null
      });

      // Get status after locking
      const { data: status } = await supabase.rpc("get_demo_status", {
        p_company_id: companyId
      });

      ctx.logger.info("Demo data locked successfully", { status });

      return {
        success: true,
        companyId,
        moduleId,
        status
      };
    } catch (error) {
      ctx.logger.error("Failed to lock demo data", { error });
      throw error;
    }
  }
});

/**
 * Example: Integrate with company signup
 *
 * ```typescript
 * // In your signup handler
 * export async function createCompany(data: SignupData) {
 *   // 1. Create company and user
 *   const company = await db.company.create({ ... });
 *   const user = await db.user.create({ ... });
 *
 *   // 2. If user selected demo data, trigger seeding
 *   if (data.seedDemoData) {
 *     await seedDemoData.trigger({
 *       companyId: company.id,
 *       industryId: data.industry,
 *       modules: data.selectedModules,
 *       userId: user.id
 *     });
 *   }
 *
 *   return { company, user };
 * }
 * ```
 */

/**
 * Example: Scheduled cleanup of old demo data
 *
 * ```typescript
 * import { schedules } from "@trigger.dev/sdk/v3";
 *
 * export const cleanupOldDemoData = schedules.task({
 *   id: "cleanup-old-demo-data",
 *   cron: "0 2 * * 0", // Every Sunday at 2 AM
 *   run: async (payload, { ctx }) => {
 *     // Find companies with old untouched demo data
 *     const { data: companies } = await supabase
 *       .from('demoSeedState')
 *       .select('companyId')
 *       .eq('status', 'done')
 *       .lt('seededAt', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()) // 90 days old
 *       .is('lockedAt', null);
 *
 *     // Cleanup each company
 *     for (const { companyId } of companies || []) {
 *       await cleanupDemoData.trigger({
 *         companyId,
 *         includeTouched: false
 *       });
 *     }
 *   }
 * });
 * ```
 */
