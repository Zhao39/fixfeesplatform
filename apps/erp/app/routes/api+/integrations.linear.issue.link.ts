import { getAppUrl } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { LinearClient, linkActionToLinearIssue } from "@carbon/ee/linear";
import { type ActionFunction, type LoaderFunction, json } from "@vercel/remix";

const linear = new LinearClient();

export const action: ActionFunction = async ({ request }) => {
  const { companyId, client } = await requirePermissions(request, {});
  const form = await request.formData();

  const actionId = form.get("actionId") as string;
  const issueId = form.get("issueId") as string;

  if (!actionId || !issueId) {
    return { success: false, message: "Missing required fields" };
  }

  const issue = await linear.getIssueById(companyId, issueId);

  const email = issue?.assignee?.email ?? "";

  const assignee = await client.from("user").select("id").eq("email", email).single();

  const linked = await linkActionToLinearIssue(client, companyId, {
    actionId,
    issueId,
    assignee: assignee.data ? assignee.data.id : null,
    dueDate: issue?.dueDate,
  });

  const nonConformanceId = linked.data?.[0].nonConformanceId;

  const url = getAppUrl() + `/x/issue/${nonConformanceId}/details`;

  await linear.createAttachmentLink(companyId, {
    issueId: issueId as string,
    url,
    title: "Linked Carbon Issue",
  });

  return json({ success: true, message: "Linked successfully" });
};

export const loader: LoaderFunction = async ({ request }) => {
  const { companyId, client } = await requirePermissions(request, {});
  const url = new URL(request.url);

  const query = url.searchParams.get("search") as string;
  const actionId = url.searchParams.get("actionId") as string;

  const result = await client
    .from("nonConformanceActionTask")
    .select("externalId")
    .eq("companyId", companyId)
    .eq("id", actionId)
    .single();

  const externalId = result.data?.externalId as { linear?: string } | null;
  const issues = await linear.listIssues(companyId, query);

  if (!externalId?.linear) return { issues, linked: null };

  const linked = await linear.getIssueById(companyId, externalId.linear);

  return json({ issues, linked });
};
