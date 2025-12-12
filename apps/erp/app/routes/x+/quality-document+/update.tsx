import { requirePermissions } from "@carbon/auth/auth.server";
import { type ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const { client, userId } = await requirePermissions(request, {
    update: "quality"
  });

  const formData = await request.formData();
  const ids = formData.getAll("ids");
  const field = formData.get("field");
  const value = formData.get("value");

  if (typeof field !== "string" || typeof value !== "string") {
    return { error: { message: "Invalid form data" }, data: null };
  }

  switch (field) {
    case "content":
    case "name":
    case "status":
      return await client
        .from("qualityDocument")
        .update({
          [field]: value,
          updatedBy: userId,
          updatedAt: new Date().toISOString()
        })
        .in("id", ids as string[]);
    case "tags":
      return await client
        .from("qualityDocument")
        .update({
          [field]: formData.getAll("value") as string[],
          updatedBy: userId,
          updatedAt: new Date().toISOString()
        })
        .in("id", ids as string[]);

    default:
      return { error: { message: "Invalid field" }, data: null };
  }
}
