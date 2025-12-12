import {
  POSTHOG_API_HOST,
  POSTHOG_PROJECT_PUBLIC_KEY,
  VERCEL_URL
} from "@carbon/auth";
import posthog from "posthog-js";
import { Fragment, startTransition, useEffect } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

function PosthogInit() {
  useEffect(() => {
    if (VERCEL_URL && !VERCEL_URL?.includes("localhost")) {
      posthog.init(POSTHOG_PROJECT_PUBLIC_KEY, {
        api_host: POSTHOG_API_HOST,
        autocapture: false,
        capture_pageview: false
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
