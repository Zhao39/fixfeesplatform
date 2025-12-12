import { error } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { flash } from "@carbon/auth/session.server";
import { arrayToTree } from "performant-array-to-tree";
import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import type { Group } from "~/modules/users";

export async function loader({ request }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    role: "employee"
  });

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const type = searchParams.get("type");

  const query = client.from("groups").select("*").eq("companyId", companyId);

  if (type === "employee") {
    query.eq("isCustomerOrgGroup", false);
    query.eq("isSupplierOrgGroup", false);
  } else if (type === "customer") {
    query.eq("isCustomerTypeGroup", true);
  } else if (type === "supplier") {
    query.eq("isSupplierTypeGroup", true);
  }

  const groups = await query;

  if (groups.error) {
    return data(
      { groups: [], error: groups.error },
      await flash(request, error(groups.error, "Failed to load groups"))
    );
  }

  return {
    groups: arrayToTree(groups.data) as Group[]
  };
}
