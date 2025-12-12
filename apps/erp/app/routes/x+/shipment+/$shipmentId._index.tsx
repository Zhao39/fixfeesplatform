import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { path } from "~/utils/path";

export async function loader({ params }: LoaderFunctionArgs) {
  const { shipmentId } = params;
  if (!shipmentId) throw new Error("Could not find shipmentId");
  throw redirect(path.to.shipmentDetails(shipmentId));
}
