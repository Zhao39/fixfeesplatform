import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { path } from "~/utils/path";

export async function loader({ params }: LoaderFunctionArgs) {
  const { receiptId } = params;
  if (!receiptId) throw new Error("Could not find receiptId");
  throw redirect(path.to.receiptDetails(receiptId));
}
