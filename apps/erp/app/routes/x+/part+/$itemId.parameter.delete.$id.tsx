import { assertIsPost, notFound } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import type { ActionFunctionArgs } from "react-router";
import { deleteConfigurationParameter } from "~/modules/items";

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client } = await requirePermissions(request, {
    delete: "parts"
  });

  const { id } = params;
  if (!id) throw notFound("id not found");

  const remove = await deleteConfigurationParameter(client, id);

  if (remove.error) {
    return {
      success: false,
      error: "Failed to delete configuration parameter"
    };
  }

  return {
    success: true
  };
}
