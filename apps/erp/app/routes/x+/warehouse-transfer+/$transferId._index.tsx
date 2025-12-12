import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { path } from "~/utils/path";

export async function loader({ params }: LoaderFunctionArgs) {
  const { transferId } = params;
  if (!transferId) throw new Error("Could not find transferId");
  throw redirect(path.to.warehouseTransferDetails(transferId));
}
