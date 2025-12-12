import { handleRequest } from "@vercel/react-router/entry.server";
import { type EntryContext } from "react-router";

export default async function (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext
) {
  return handleRequest(
    request,
    responseStatusCode,
    responseHeaders,
    reactRouterContext
  );
}
