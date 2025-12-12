import type { EntryContext } from "react-router";
import { handleRequest, ServerRouter } from "react-router";



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
