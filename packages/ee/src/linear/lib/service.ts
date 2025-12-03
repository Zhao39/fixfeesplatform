import type { Database } from "@carbon/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getLinearIntegration(client: SupabaseClient<Database>, companyId: string) {
  return await client.from("companyIntegration").select("*").eq("companyId", companyId).eq("id", "linear").limit(1);
}

export function linkActionToLinearIssue(
  client: SupabaseClient<Database>,
  companyId: string,
  input: {
    actionId: string;
    issueId: string;
    assignee?: string | null;
    dueDate?: string | null;
  }
) {
  return client
    .from("nonConformanceActionTask")
    .update({
      externalId: { linear: input.issueId },
      assignee: input.assignee,
      dueDate: input.dueDate,
    })
    .eq("companyId", companyId)
    .eq("id", input.actionId)
    .select("nonConformanceId");
}

export const getCompanyEmployees = async (client: SupabaseClient<Database>, companyId: string, emails: string[]) => {
  const users = await client
    .from("userToCompany")
    .select("userId,user(email)")
    .eq("companyId", companyId)
    .eq("role", "employee")
    .in("user.email", emails);

  return users.data ?? [];
};
