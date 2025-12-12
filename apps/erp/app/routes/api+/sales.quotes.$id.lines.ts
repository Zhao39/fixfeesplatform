import { requirePermissions } from "@carbon/auth/auth.server";
import type { LoaderFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import { getQuoteLinesList } from "~/modules/sales";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "sales"
  });

  const { id } = params;
  if (!id) return { data: [], error: null };

  return await getQuoteLinesList(client, id);
}
