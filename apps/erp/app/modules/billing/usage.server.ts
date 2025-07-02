import type { Database } from "@carbon/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getCompanyPlan, getCompanyUsage } from "./billing.service";

export async function trackUserAddition(
  client: SupabaseClient<Database>,
  companyId: string
) {
  // Increment user count
  const { data: newUserCount, error: rpcError } = await client.rpc(
    "increment_users",
    {
      company_id: companyId,
    }
  );

  if (rpcError) {
    console.error("Error incrementing users:", rpcError);
    return;
  }

  const { error } = await client
    .from("companyUsage")
    .update({
      users: newUserCount,
      updatedAt: new Date().toISOString(),
    })
    .eq("companyId", companyId);

  if (error) {
    console.error("Error tracking user addition:", error);
  }
}

export async function trackTaskCreation(
  client: SupabaseClient<Database>,
  companyId: string,
  taskCount: number = 1
) {
  // Increment task count
  const { data: newTaskCount, error: rpcError } = await client.rpc(
    "increment_tasks",
    {
      company_id: companyId,
      count: taskCount,
    }
  );

  if (rpcError) {
    console.error("Error incrementing tasks:", rpcError);
    return;
  }

  const { error } = await client
    .from("companyUsage")
    .update({
      tasks: newTaskCount,
      updatedAt: new Date().toISOString(),
    })
    .eq("companyId", companyId);

  if (error) {
    console.error("Error tracking task creation:", error);
  }
}

export async function trackAiTokenUsage(
  client: SupabaseClient<Database>,
  companyId: string,
  tokenCount: number
) {
  // Increment AI token count
  const { data: newTokenCount, error: rpcError } = await client.rpc(
    "increment_ai_tokens",
    {
      company_id: companyId,
      count: tokenCount,
    }
  );

  if (rpcError) {
    console.error("Error incrementing AI tokens:", rpcError);
    return;
  }

  const { error } = await client
    .from("companyUsage")
    .update({
      aiTokens: newTokenCount,
      updatedAt: new Date().toISOString(),
    })
    .eq("companyId", companyId);

  if (error) {
    console.error("Error tracking AI token usage:", error);
  }
}

export async function checkUsageLimits(
  client: SupabaseClient<Database>,
  companyId: string
): Promise<{
  canAddUsers: boolean;
  canCreateTasks: boolean;
  canUseAiTokens: boolean;
  usersLeft: number;
  tasksLeft: number;
  aiTokensLeft: number;
}> {
  const [planResult, usageResult] = await Promise.all([
    getCompanyPlan(client, companyId),
    getCompanyUsage(client, companyId),
  ]);

  const plan = planResult.data;
  const usage = usageResult.data;

  if (!plan || !usage) {
    return {
      canAddUsers: false,
      canCreateTasks: false,
      canUseAiTokens: false,
      usersLeft: 0,
      tasksLeft: 0,
      aiTokensLeft: 0,
    };
  }

  const usersLeft = Math.max(0, plan.includedUsers - usage.users);
  const tasksLeft = Math.max(0, plan.tasksLimit - usage.tasks);
  const aiTokensLeft = Math.max(0, plan.aiTokensLimit - usage.aiTokens);

  return {
    canAddUsers: usersLeft > 0,
    canCreateTasks: tasksLeft > 0,
    canUseAiTokens: aiTokensLeft > 0,
    usersLeft,
    tasksLeft,
    aiTokensLeft,
  };
}

export async function resetMonthlyUsage(
  client: SupabaseClient<Database>,
  companyId: string
) {
  const nextResetDate = new Date();
  nextResetDate.setMonth(nextResetDate.getMonth() + 1);

  const { error } = await client
    .from("companyUsage")
    .update({
      tasks: 0,
      aiTokens: 0,
      nextResetDatetime: nextResetDate.toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .eq("companyId", companyId);

  if (error) {
    console.error("Error resetting monthly usage:", error);
    throw error;
  }
}
