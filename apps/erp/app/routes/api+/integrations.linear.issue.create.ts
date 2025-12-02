import { requirePermissions } from "@carbon/auth/auth.server";
import { ActionFunction, LoaderFunction } from "@vercel/remix";
import { getCompanyEmployees, LinearClient, linkActionToLinearIssue } from "@carbon/ee/linear";
import { getAppUrl } from "@carbon/auth";

const linear = new LinearClient();

export const action: ActionFunction = async ({ request }) => {
	const data = await request.formData();

	const { companyId, client } = await requirePermissions(request, {});

	const actionId = data.get("actionId") as string;
	const teamId = data.get("teamId") as string;
	const title = data.get("title") as string;
	const description = data.get("description") as string;
	const assigneeId = data.get("assignee") as string;

	const issue = await linear.createIssue(companyId, {
		teamId,
		title,
		description,
		assigneeId,
	});

	const linked = await linkActionToLinearIssue(client, companyId, actionId as string, issue.id as string);
	const nonConformanceId = linked.data?.[0].nonConformanceId;

	const url = getAppUrl() + `/x/issue/${nonConformanceId}/details`;

	await linear.createAttachmentLink(companyId, {
		issueId: issue.id,
		url,
		title: "Linked Carbon Issue",
	});

	return new Response("Linear issue created");
};

export const loader: LoaderFunction = async ({ request }) => {
	const { companyId, client } = await requirePermissions(request, {});

	const url = new URL(request.url);

	const teamId = url.searchParams.get("teamId") as string;
	const teams = await linear.listTeams(companyId);

	if (teamId) {
		const members = teamId ? await linear.listTeamMembers(companyId, teamId) : [];
		const employees = await getCompanyEmployees(client, companyId);
		// I am sure we can improve this filtering step
		return { teams, members: members.filter((m) => employees.some((v) => v.email === m.email)) };
	}

	return { teams };
};
