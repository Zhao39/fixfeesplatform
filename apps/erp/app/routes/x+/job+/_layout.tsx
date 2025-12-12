import { requirePermissions } from "@carbon/auth/auth.server";
import type { LoaderFunctionArgs, MetaFunction } from "@vercel/remix";
import { json, Outlet } from "react-router";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";

export const meta: MetaFunction = () => {
  return [{ title: "Carbon | Jobs" }];
};

export const handle: Handle = {
  breadcrumb: "Production",
  to: path.to.production,
  module: "production"
};

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermissions(request, {
    view: "production"
  });

  return json({});
}

export default function JobRoute() {
  return <Outlet />;
}
