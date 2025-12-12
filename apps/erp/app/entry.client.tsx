import { POSTHOG_API_HOST, POSTHOG_PROJECT_PUBLIC_KEY } from "@carbon/auth";
import posthog from "posthog-js";
import { Fragment, startTransition, useEffect } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

function PosthogInit() {
  useEffect(() => {
    if (!window?.location.href.includes("localhost")) {
      posthog.init(POSTHOG_PROJECT_PUBLIC_KEY, {
        api_host: POSTHOG_API_HOST
      });
    }
  }, []);
  return null;
}

startTransition(() => {
  hydrateRoot(
    document,
    <Fragment>
      <HydratedRouter />
      <PosthogInit />
    </Fragment>
  );
});
