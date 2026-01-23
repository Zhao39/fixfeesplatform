import { error, getCarbonServiceRole, success } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { flash } from "@carbon/auth/session.server";
import { validationError, validator } from "@carbon/form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData, useNavigate } from "react-router";
import { useUrlParams } from "~/hooks";
import { approvalRuleValidator, upsertApprovalRule } from "~/modules/approvals";
import ApprovalRuleDrawer from "~/modules/approvals/ui/ApprovalRuleDrawer";
import { getParams, path } from "~/utils/path";

export async function loader({ request }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "settings",
    role: "employee"
  });

  const url = new URL(request.url);
  const documentType = url.searchParams.get("documentType") as
    | "purchaseOrder"
    | "qualityDocument"
    | null;

  if (
    !documentType ||
    !["purchaseOrder", "qualityDocument"].includes(documentType)
  ) {
    throw redirect(
      path.to.approvalSettings,
      await flash(request, error(null, "Invalid document type"))
    );
  }

  const groupsResult = await client
    .from("group")
    .select("id, name")
    .eq("companyId", companyId)
    .eq("isCustomerOrgGroup", false)
    .eq("isSupplierOrgGroup", false);

  return {
    rule: null,
    documentType,
    groups: groupsResult.data ?? []
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const { companyId, userId } = await requirePermissions(request, {
    update: "settings",
    role: "employee"
  });

  const serviceRole = getCarbonServiceRole();

  const formData = await request.formData();
  const validation = await validator(approvalRuleValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const result = await upsertApprovalRule(serviceRole, {
    createdBy: userId,
    companyId,
    name: validation.data.name,
    documentType: validation.data.documentType,
    enabled: validation.data.enabled,
    approverGroupIds: validation.data.approverGroupIds || [],
    defaultApproverId: validation.data.defaultApproverId,
    lowerBoundAmount: validation.data.lowerBoundAmount ?? 0,
    upperBoundAmount: validation.data.upperBoundAmount ?? null,
    escalationDays: validation.data.escalationDays
  });

  if (result.error) {
    throw redirect(
      `${path.to.newApprovalRule(validation.data.documentType)}?${getParams(request)}`,
      await flash(request, error(result.error, result.error.message))
    );
  }

  throw redirect(
    `${path.to.approvalSettings}?${getParams(request)}`,
    await flash(request, success("Approval rule created"))
  );
}

export default function NewApprovalRuleRoute() {
  const { rule, documentType, groups } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [params] = useUrlParams();
  const onClose = () =>
    navigate(`${path.to.approvalSettings}?${params.toString()}`);

  return (
    <ApprovalRuleDrawer
      rule={rule}
      documentType={documentType!}
      groups={groups}
      onClose={onClose}
    />
  );
}
