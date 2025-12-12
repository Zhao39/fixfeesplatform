import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { path } from "~/utils/path";

export async function loader({ params }: LoaderFunctionArgs) {
  const { supplierId } = params;
  if (!supplierId) throw new Error("Could not find supplierId");
  throw redirect(path.to.supplierDetails(supplierId));
}
