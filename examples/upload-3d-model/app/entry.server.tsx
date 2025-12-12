import { ServerRouter } from "react-router";
import type { EntryContext } from "@vercel/remix";
import { handleRequest } from "@vercel/remix";



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
    <ServerRouter context={reactRouterContext} url={request.url} />
  );
}
