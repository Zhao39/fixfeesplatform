import type { Database } from "@carbon/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getLinearIntegration(client: SupabaseClient<Database>, companyId: string) {
	return await client.from("companyIntegration").select("*").eq("companyId", companyId).eq("id", "linear").limit(1);
}

export function linkActionToLinearIssue(
	client: SupabaseClient<Database>,
	companyId: string,
	actionId: string,
	issueId: string
) {
	return client
		.from("nonConformanceActionTask")
		.update({
			externalId: { linear: issueId },
		})
		.eq("companyId", companyId)
		.eq("id", actionId)
		.select("nonConformanceId");
}

export const getCompanyEmployees = async (client: SupabaseClient<Database>, companyId: string) => {
	const userToCompany = await client
		.from("userToCompany")
		.select("userId")
		.eq("companyId", companyId)
		.eq("role", "employee");

	const userIds = userToCompany.data?.map((utc) => utc.userId) || [];

	const employees = await client.from("user").select("id,email").in("id", userIds);

	return employees.data || [];
};
