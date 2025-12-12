import { error } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { flash } from "@carbon/auth/session.server";
import type { LoaderFunctionArgs } from "react-router";
import { data } from "react-router";
import { getServicesList } from "~/modules/items";

export async function loader({ request }: LoaderFunctionArgs) {
  const { client, companyId } = await requirePermissions(request, {
    view: "parts"
  });

  const services = await getServicesList(client, companyId);
  if (services.error) {
    return data(
      services,
      await flash(request, error(services.error, "Failed to get services"))
    );
  }

  return services;
}
