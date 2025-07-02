import type { Database } from "@carbon/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export const planTemplateValidator = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().optional(),
  planType: z.enum(["Trial", "Per User", "Flat Fee"]),
  stripePriceId: z.string().min(1, { message: "Stripe Price ID is required" }),
  stripeProductId: z
    .string()
    .min(1, { message: "Stripe Product ID is required" }),
  pricePerUser: z.number().optional(),
  flatPrice: z.number().optional(),
  includedUsers: z.number().default(1),
  includedTasks: z.number().default(10000),
  includedAiTokens: z.number().default(1000000),
  trialDays: z.number().optional(),
  active: z.boolean().default(true),
});

export type PlanTemplate = z.infer<typeof planTemplateValidator>;

export async function getPlanTemplates(client: SupabaseClient<Database>) {
  return client
    .from("planTemplate")
    .select("*")
    .eq("active", true)
    .order("flatPrice", { ascending: true });
}

export async function getCompanyPlan(
  client: SupabaseClient<Database>,
  companyId: string
) {
  return client
    .from("companyPlan")
    .select("*, planTemplate!inner(*)")
    .eq("companyId", companyId)
    .single();
}

export async function createCompanyPlan(
  client: SupabaseClient<Database>,
  data: {
    companyId: string;
    planTemplateId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripeSubscriptionStatus: string;
    subscriptionStartDate: string;
    trialEndDate?: string;
    billingCycle: string;
  }
) {
  const planTemplate = await client
    .from("planTemplate")
    .select("*")
    .eq("id", data.planTemplateId)
    .single();

  if (planTemplate.error) {
    return planTemplate;
  }

  const companyPlan = await client
    .from("companyPlan")
    .insert({
      ...data,
      planType: planTemplate.data.planType,
      pricePerUser: planTemplate.data.pricePerUser,
      flatPrice: planTemplate.data.flatPrice,
      includedUsers: planTemplate.data.includedUsers,
      includedTasks: planTemplate.data.includedTasks,
      includedAiTokens: planTemplate.data.includedAiTokens,
      tasksLimit: planTemplate.data.includedTasks,
      aiTokensLimit: planTemplate.data.includedAiTokens,
    })
    .select()
    .single();

  if (companyPlan.error) {
    return companyPlan;
  }

  // Initialize usage tracking
  const usage = await client.from("companyUsage").insert({
    companyId: data.companyId,
    users: 0,
    tasks: 0,
    aiTokens: 0,
    nextResetDatetime: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(), // 30 days from now
  });

  if (usage.error) {
    return usage;
  }

  return companyPlan;
}

export async function updateCompanyPlan(
  client: SupabaseClient<Database>,
  companyId: string,
  data: Partial<Database["public"]["Tables"]["companyPlan"]["Update"]>
) {
  const companyPlan = await client
    .from("companyPlan")
    .update(data)
    .eq("companyId", companyId)
    .select()
    .single();

  if (companyPlan.error) {
    return companyPlan;
  }

  return companyPlan;
}

export async function getCompanyUsage(
  client: SupabaseClient<Database>,
  companyId: string
) {
  const usage = await client
    .from("companyUsage")
    .select("*")
    .eq("companyId", companyId)
    .single();

  if (usage.error) {
    return usage;
  }

  return usage;
}

export async function createBillingEvent(
  client: SupabaseClient<Database>,
  data: {
    companyId: string;
    eventType: string;
    stripeEventId?: string;
    amount?: number;
    currency?: string;
    metadata?: Record<string, any>;
  }
) {
  const event = await client
    .from("billingEvent")
    .insert(data)
    .select()
    .single();

  if (event.error) {
    return event;
  }

  return event;
}
