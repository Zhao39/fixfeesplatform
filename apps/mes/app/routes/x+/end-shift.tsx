import { requirePermissions } from "@carbon/auth/auth.server";
import { getLocalTimeZone, now } from "@internationalized/date";
import type { ActionFunctionArgs } from "react-router";
import { data } from "react-router";
import { endProductionEvents } from "~/services/operations.service";

export async function action({ request }: ActionFunctionArgs) {
  const { client, companyId, userId } = await requirePermissions(request, {});
  const formData = await request.formData();
  const timezone = formData.get("timezone") as string | null;

  const updates = await endProductionEvents(client, {
    companyId,
    employeeId: userId,
    endTime: now(timezone ?? getLocalTimeZone()).toAbsoluteString()
  });

  if (updates.error) {
    return data(
      { success: false, message: updates.error.message },
      { status: 500 }
    );
  }

  return { success: true, message: "Successfully ended shift" };
}
