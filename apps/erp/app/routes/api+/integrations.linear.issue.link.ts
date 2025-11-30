import { requirePermissions } from "@carbon/auth/auth.server";
import { LinearClient, linkActionToLinearIssue } from "@carbon/ee/linear";
import type { ActionFunction, LoaderFunction } from "@vercel/remix";

const linear = new LinearClient();

export const action: ActionFunction = async ({ request }) => {
	const { companyId, client } = await requirePermissions(request, {});
	const form = await request.formData();

	const actionId = form.get("actionId");
	const issueId = form.get("issueId");

	if (!actionId || !issueId) {
		return { success: false, message: "Missing required fields" };
	}

	await linkActionToLinearIssue(client, companyId, actionId as string, issueId as string);

	return { success: true, message: "Linked successfully" };
};

export const loader: LoaderFunction = async ({ request }) => {
	const { companyId, client } = await requirePermissions(request, {});
	const url = new URL(request.url);

	const query = url.searchParams.get("linear-query") as string;
	const actionId = url.searchParams.get("actionId") as string;

	const result = await client
		.from("nonConformanceActionTask")
		.select("externalId")
		.eq("companyId", companyId)
		.eq("id", actionId)
		.single();

	const externalId = result.data?.externalId as { linear?: string } | null;
	const issues = await linear.listIssues(companyId, query);

	if (!externalId?.linear)  return { issues, linked: null };

	const linked = await linear.getIssueById(companyId, externalId.linear);

	return { issues, linked };
};
