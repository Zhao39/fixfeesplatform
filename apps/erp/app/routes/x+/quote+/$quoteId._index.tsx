import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { path } from "~/utils/path";

export async function loader({ params }: LoaderFunctionArgs) {
  const { quoteId } = params;
  if (!quoteId) throw new Error("Could not find quoteId");
  throw redirect(path.to.quoteDetails(quoteId));
}
