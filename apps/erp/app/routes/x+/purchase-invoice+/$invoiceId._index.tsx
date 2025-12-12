import { notFound } from "@carbon/auth";
import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { path } from "~/utils/path";

export async function loader({ params }: LoaderFunctionArgs) {
  const { invoiceId } = params;
  if (!invoiceId) throw notFound("Could not find invoiceId");
  throw redirect(path.to.purchaseInvoiceDetails(invoiceId));
}
