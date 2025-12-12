import { requirePermissions } from "@carbon/auth/auth.server";
import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const { client } = await requirePermissions(request, {
    delete: "sales"
  });

  const formData = await request.formData();
  const id = formData.get("id") as string;

  if (!id) {
    return data(
      { error: "Operation ID is required" },
      {
        status: 400
      }
    );
  }

  const { error } = await client.from("quoteOperation").delete().eq("id", id);

  if (error) {
    return data(
      { success: false, error: error.message },
      {
        status: 400
      }
    );
  }

  return { success: true };
}
