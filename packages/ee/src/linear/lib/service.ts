import type { Database } from "@carbon/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import z from "zod";
import { LinearWorkStateType, mapLinearStatusToCarbonStatus } from "./utils";

export const LinearIssueSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  state: z.object({
    name: z.string(),
    color: z.string(),
    type: z.nativeEnum(LinearWorkStateType),
  }),
  identifier: z.string(),
  dueDate: z.string().nullish(),
  assignee: z
    .object({
      email: z.string(),
    })
    .nullish(),
});

export async function getLinearIntegration(
  client: SupabaseClient<Database>,
  companyId: string
) {
  return await client
    .from("companyIntegration")
    .select("*")
    .eq("companyId", companyId)
    .eq("id", "linear")
    .limit(1);
}

export function linkActionToLinearIssue(
  client: SupabaseClient<Database>,
  companyId: string,
  input: {
    actionId: string;
    issue: z.infer<typeof LinearIssueSchema>;
    assignee?: string | null;
  }
) {
  const { data, success } = LinearIssueSchema.safeParse(input.issue);

  if (!success) return null;

  return client
    .from("nonConformanceActionTask")
    .update({
      externalId: {
        linear: data,
      },
      assignee: input.assignee,
      status: mapLinearStatusToCarbonStatus(data.state.type!),
      dueDate: data.dueDate,
    })
    .eq("companyId", companyId)
    .eq("id", input.actionId)
    .select("nonConformanceId");
}

export const getCompanyEmployees = async (
  client: SupabaseClient<Database>,
  companyId: string,
  emails: string[]
) => {
  const users = await client
    .from("userToCompany")
    .select("userId,user(email)")
    .eq("companyId", companyId)
    .eq("role", "employee")
    .in("user.email", emails);

  return users.data ?? [];
};

export function unlinkActionFromLinearIssue(
  client: SupabaseClient<Database>,
  companyId: string,
  input: {
    actionId: string;
    assignee?: string | null;
  }
) {
  return client
    .from("nonConformanceActionTask")
    .update({
      externalId: {
        linear: undefined,
      },
    })
    .eq("companyId", companyId)
    .eq("id", input.actionId)
    .select("nonConformanceId");
}
