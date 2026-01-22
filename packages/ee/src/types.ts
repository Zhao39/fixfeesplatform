import type { ZodType } from "zod";

export type IntegrationAction = {
  id: string;
  label: string;
  description: string;
  endpoint: string;
};

/**
 * Enhanced option type for select fields.
 * Supports both simple strings (backwards compatible) and objects with label/description.
 */
export type IntegrationSettingOption =
  | string
  | {
      value: string;
      label: string;
      description?: string;
    };

/**
 * Definition for an integration setting field.
 */
export type IntegrationSetting = {
  /** Field name used in form data and metadata storage */
  name: string;
  /** Display label for the field */
  label: string;
  /** Optional help text shown below the field */
  description?: string;
  /** Optional group name for organizing settings into collapsible sections */
  group?: string;
  /** Field input type */
  type: "text" | "switch" | "processes" | "options" | "array";
  /** Options for 'options' type fields */
  listOptions?: IntegrationSettingOption[];
  /** Whether the field is required */
  required: boolean;
  /** Default value for the field */
  value: unknown;
};

export type IntegrationConfig = {
  name: string;
  id: string;
  active: boolean;
  category: string;
  logo: React.FC<React.ComponentProps<"svg">>;
  shortDescription: string;
  description: string;
  setupInstructions?: React.FC<{ companyId: string }>;
  images: string[];
  settings: IntegrationSetting[];
  schema: ZodType;
  oauth?: {
    authUrl: string;
    clientId: string;
    redirectUri: string;
    scopes: string[];
    tokenUrl: string;
  };
  actions?: IntegrationAction[];
};

export interface IntegrationOptions extends IntegrationConfig {
  /**
   * Lifecycle hooks
   */
  // Client only hooks
  onClientInstall?: () => void | Promise<void>;
  onClientUninstall?: () => void | Promise<void>;

  // Server only hooks
  onHealthcheck?: (
    companyId: string,
    metadata: Record<string, unknown>
  ) => Promise<boolean>;
  onInstall?: (companyId: string) => void | Promise<void>;
  onUninstall?: (companyId: string) => void | Promise<void>;
}
