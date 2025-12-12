import type { OperatingSystemPlatform } from "@carbon/react";
import { OperatingSystemContextProvider } from "@carbon/react";
import { I18nProvider } from "@react-aria/i18n";
import { handleRequest } from "@vercel/react-router/entry.server";
import { parseAcceptLanguage } from "intl-parse-accept-language";
import type { EntryContext } from "react-router";
import { ServerRouter } from "react-router";

export default async function (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext
) {
  const acceptLanguage = request.headers.get("accept-language");
  const locales = parseAcceptLanguage(acceptLanguage, {
    validate: Intl.DateTimeFormat.supportedLocalesOf
  });

  // get whether it's a mac or pc from the headers
  const platform: OperatingSystemPlatform = request.headers
    .get("user-agent")
    ?.includes("Mac")
    ? "mac"
    : "windows";

  // TODO: @brad - Need to figure out how to pass remixServer to handleRequest
  let remixServer = (
    <OperatingSystemContextProvider platform={platform}>
      <I18nProvider locale={locales?.[0] ?? "en-US"}>
        <ServerRouter context={reactRouterContext} url={request.url} />
      </I18nProvider>
    </OperatingSystemContextProvider>
  );

  return handleRequest(
    request,
    responseStatusCode,
    responseHeaders,
    reactRouterContext
  );
}
