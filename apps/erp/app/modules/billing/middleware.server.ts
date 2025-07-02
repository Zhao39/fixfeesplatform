import type { Database } from "@carbon/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import { json } from "@vercel/remix";
import { checkUsageLimits } from "./usage.server";

export class UsageLimitError extends Error {
  constructor(message: string, public limitType: "users" | "tasks" | "aiTokens") {
    super(message);
    this.name = "UsageLimitError";
  }
}

export async function requireUsageLimit(
  client: SupabaseClient<Database>,
  companyId: string,
  limitType: "users" | "tasks" | "aiTokens",
  amount: number = 1
) {
  const limits = await checkUsageLimits(client, companyId);

  switch (limitType) {
    case "users":
      if (!limits.canAddUsers || limits.usersLeft < amount) {
        throw new UsageLimitError(
          `Cannot add ${amount} user(s). You have ${limits.usersLeft} user slots remaining. Please upgrade your plan to add more users.`,
          "users"
        );
      }
      break;
    case "tasks":
      if (!limits.canCreateTasks || limits.tasksLeft < amount) {
        throw new UsageLimitError(
          `Cannot create ${amount} task(s). You have ${limits.tasksLeft} tasks remaining this month. Please upgrade your plan for more tasks.`,
          "tasks"
        );
      }
      break;
    case "aiTokens":
      if (!limits.canUseAiTokens || limits.aiTokensLeft < amount) {
        throw new UsageLimitError(
          `Cannot use ${amount} AI token(s). You have ${limits.aiTokensLeft} tokens remaining this month. Please upgrade your plan for more AI tokens.`,
          "aiTokens"
        );
      }
      break;
  }
}

export function handleUsageLimitError(error: unknown) {
  if (error instanceof UsageLimitError) {
    return json(
      {
        error: {
          name: "Usage Limit Exceeded",
          message: error.message,
          limitType: error.limitType,
        },
      },
      { status: 403 }
    );
  }
  throw error;
}

export async function withUsageTracking<T>(
  client: SupabaseClient<Database>,
  companyId: string,
  limitType: "users" | "tasks" | "aiTokens",
  amount: number,
  operation: () => Promise<T>
): Promise<T> {
  // Check limits before operation
  await requireUsageLimit(client, companyId, limitType, amount);
  
  // Execute the operation
  const result = await operation();
  
  // Track usage after successful operation
  switch (limitType) {
    case "users":
      const { trackUserAddition } = await import("./usage.server");
      await trackUserAddition(client, companyId);
      break;
    case "tasks":
      const { trackTaskCreation } = await import("./usage.server");
      await trackTaskCreation(client, companyId, amount);
      break;
    case "aiTokens":
      const { trackAiTokenUsage } = await import("./usage.server");
      await trackAiTokenUsage(client, companyId, amount);
      break;
  }
  
  return result;
}