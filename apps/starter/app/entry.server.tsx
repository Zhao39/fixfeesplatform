import type { OperatingSystemPlatform } from "@carbon/react";
import { OperatingSystemContextProvider } from "@carbon/react";
import { I18nProvider } from "@react-aria/i18n";
import { parseAcceptLanguage } from "intl-parse-accept-language";
import type { EntryContext } from "react-router";
import { handleRequest, ServerRouter } from "react-router";

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
    remixServer
  );
}
