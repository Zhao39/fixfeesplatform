import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { path } from "~/utils/path";

export async function loader({ params }: LoaderFunctionArgs) {
  const { personId } = params;
  if (!personId) throw new Error("Could not find personId");
  throw redirect(path.to.personDetails(personId));
}
