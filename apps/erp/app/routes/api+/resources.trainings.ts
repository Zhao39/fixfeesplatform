import { getCarbonServiceRole } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import type { LoaderFunctionArgs } from "react-router";
import { getOutstandingTrainingsForUser } from "~/modules/resources";

export async function loader({ request }: LoaderFunctionArgs) {
  const { companyId, userId } = await requirePermissions(request, {});

  return await getOutstandingTrainingsForUser(
    getCarbonServiceRole(),
    companyId,
    userId
  );
}
