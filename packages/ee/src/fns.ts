import { integrations } from ".";
import type { IntegrationOptions } from "./types";

const withServerOnly = () => {
  if (typeof document !== "undefined") {
    throw new Error(
      `Server only integration hooks cannot be used in the browser`
    );
  }
};

export function defineIntegration(options: IntegrationOptions) {
  return {
    ...options,
    get onInstall() {
      withServerOnly();
      return options.onInstall;
    },
    get onUninstall() {
      withServerOnly();
      return options.onUninstall;
    },
    get onHealthcheck() {
      withServerOnly();
      return options.onHealthcheck;
    }
  };
}

export const getIntegrationConfigById = (
  id: string
): IntegrationOptions | undefined => {
  return integrations.find((integration) => integration.id === id);
};
