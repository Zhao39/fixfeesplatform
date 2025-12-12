import type { LoaderFunction } from "react-router";
import { redirect } from "react-router";
import { path } from "~/utils/path";

export const loader: LoaderFunction = async ({ request }) => {
  return redirect(path.to.operations);
};
