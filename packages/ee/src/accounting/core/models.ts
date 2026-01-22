import z from "zod";
import type {
  AccountingEntity,
  AccountingEntityType,
  EntityDefinition,
  GlobalSyncConfig
} from "./types";

function withNullable<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((v) => (v === undefined ? null : v), schema.nullish());
}

export enum ProviderID {
  XERO = "xero"
  // QUICKBOOKS = "quickbooks"
  // SAGE = "sage",
}

/**
 * Schemas for shared provider entities and credentials.
 */

export const ProviderCredentialsSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("oauth2"),
    accessToken: z.string(),
    refreshToken: z.string().optional(),
    expiresAt: z.string().datetime().optional(),
    scope: z.array(z.string()).optional(),
    tenantId: z.string().optional()
  })
]);

export const ExternalIdSchema = z.object({
  [`${ProviderID.XERO}`]: z.object({
    id: z.string(),
    provider: z.literal(ProviderID.XERO),
    metadata: z.record(z.any()).optional()
  })
  // [`${ProviderID.QUICKBOOKS}`]: z.object({
  //   id: z.string(),
  //   provider: z.literal(ProviderID.QUICKBOOKS),
  //   metadata: z.record(z.any()).optional()
  // })
});

/**
 * Direction of data flow.
 */
export const SyncDirectionSchema = z.enum([
  "two-way",
  "push-to-accounting",
  "pull-from-accounting"
]);

export const AccountingSyncSchema = z.object({
  companyId: z.string(),
  provider: z.nativeEnum(ProviderID),
  syncType: z.enum(["webhook", "scheduled", "trigger"]),
  syncDirection: SyncDirectionSchema,
  entities: z.array(z.custom<AccountingEntity>()),
  metadata: z.record(z.any()).optional()
});

export const ENTITY_DEFINITIONS: Record<
  AccountingEntityType,
  EntityDefinition
> = {
  customer: {
    label: "Customers",
    type: "master",
    supportedDirections: [
      "two-way",
      "push-to-accounting",
      "pull-from-accounting"
    ]
  },
  vendor: {
    label: "Vendors",
    type: "master",
    supportedDirections: [
      "two-way",
      "push-to-accounting",
      "pull-from-accounting"
    ]
  },
  item: {
    label: "Items / Products",
    type: "master",
    supportedDirections: ["two-way", "push-to-accounting"]
  },
  employee: {
    label: "Employees",
    type: "master",
    supportedDirections: ["two-way", "push-to-accounting"]
  },
  purchaseOrder: {
    label: "Purchase Orders",
    type: "transaction",
    dependsOn: ["vendor", "item"],
    supportedDirections: ["push-to-accounting"]
  },
  bill: {
    label: "Bills (Purchase Invoices)",
    type: "transaction",
    dependsOn: ["vendor", "item"],
    supportedDirections: ["two-way", "push-to-accounting"]
  },
  salesOrder: {
    label: "Sales Orders",
    type: "transaction",
    dependsOn: ["customer", "item"],
    supportedDirections: ["push-to-accounting"]
  },
  invoice: {
    label: "Sales Invoices",
    type: "transaction",
    dependsOn: ["customer", "item"],
    supportedDirections: ["two-way", "push-to-accounting"]
  },
  payment: {
    label: "Payments",
    type: "transaction",
    dependsOn: ["invoice", "bill"],
    supportedDirections: ["pull-from-accounting"]
  },
  inventoryAdjustment: {
    label: "Inventory Adjustments",
    type: "transaction",
    dependsOn: ["item"],
    supportedDirections: ["push-to-accounting"]
  }
};

/**
 * Default Safe Configuration
 */
export const DEFAULT_SYNC_CONFIG: GlobalSyncConfig = {
  entities: {
    customer: {
      enabled: true,
      direction: "two-way",
      owner: "carbon"
    },
    vendor: { enabled: true, direction: "two-way", owner: "carbon" },
    item: { enabled: false, direction: "two-way", owner: "carbon" },
    employee: {
      enabled: false,
      direction: "push-to-accounting",
      owner: "carbon"
    },
    purchaseOrder: {
      enabled: false,
      direction: "push-to-accounting",
      owner: "carbon"
    },
    bill: { enabled: false, direction: "two-way", owner: "carbon" },
    salesOrder: {
      enabled: false,
      direction: "push-to-accounting",
      owner: "carbon"
    },
    invoice: { enabled: false, direction: "two-way", owner: "carbon" },
    payment: {
      enabled: false,
      direction: "pull-from-accounting",
      owner: "accounting"
    },
    inventoryAdjustment: {
      enabled: false,
      direction: "push-to-accounting",
      owner: "carbon"
    }
  }
};

// ============================================================================
// 4. VALIDATION LOGIC
// ============================================================================

export function validateSyncConfig(config: GlobalSyncConfig): string[] {
  const errors: string[] = [];

  // 1. Validate Dependencies (Always Enforced)
  (Object.keys(config.entities) as AccountingEntityType[]).forEach((entity) => {
    const entityConfig = config.entities[entity];
    const definition = ENTITY_DEFINITIONS[entity];

    if (entityConfig.enabled && definition.dependsOn) {
      definition.dependsOn.forEach((dependency) => {
        if (!config.entities[dependency].enabled) {
          errors.push(
            `Cannot enable '${definition.label}': Missing dependency '${ENTITY_DEFINITIONS[dependency].label}'.`
          );
        }
      });
    }
  });

  // 2. Validate Directions
  (Object.keys(config.entities) as AccountingEntityType[]).forEach((entity) => {
    const entityConfig = config.entities[entity];
    const definition = ENTITY_DEFINITIONS[entity];

    if (
      entityConfig.enabled &&
      !definition.supportedDirections.includes(entityConfig.direction)
    ) {
      errors.push(
        `Entity '${definition.label}' does not support direction '${
          entityConfig.direction
        }'. Supported: ${definition.supportedDirections.join(", ")}`
      );
    }
  });

  return errors;
}

const createEntityConfigSchema = () =>
  z.object({
    enabled: z.boolean(),
    direction: SyncDirectionSchema,
    owner: z.enum(["carbon", "accounting"]),
    syncFromDate: z.string().datetime().optional()
  });

export const SyncConfigSchema = z.object({
  entities: z.object({
    customer: createEntityConfigSchema(),
    vendor: createEntityConfigSchema(),
    item: createEntityConfigSchema(),
    employee: createEntityConfigSchema(),
    purchaseOrder: createEntityConfigSchema(),
    bill: createEntityConfigSchema(),
    salesOrder: createEntityConfigSchema(),
    invoice: createEntityConfigSchema(),
    payment: createEntityConfigSchema(),
    inventoryAdjustment: createEntityConfigSchema()
  })
});

export const ProviderIntegrationMetadataSchema = z.object({
  syncConfig: SyncConfigSchema,
  credentials: ProviderCredentialsSchema.optional()
});

// /********************************************************\
// *               Accounting Entity Schemas                *
// \********************************************************/

export const ContactSchema = z.object({
  id: z.string(),
  name: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  companyId: z.string(),
  email: z.string().optional(),
  website: withNullable(z.string().url()),
  taxId: withNullable(z.string()),
  currencyCode: z.string().default("USD"),
  balance: z.number().nullish(),
  creditLimit: z.number().nullish(),
  paymentTerms: z.string().nullish(),
  updatedAt: z.string().datetime(),
  workPhone: withNullable(z.string()),
  mobilePhone: withNullable(z.string()),
  fax: withNullable(z.string()),
  homePhone: withNullable(z.string()),
  isVendor: z.boolean(),
  isCustomer: z.boolean(),
  addresses: z.array(
    z.object({
      label: z.string().nullish(),
      type: z.string().nullish(),
      line1: z.string().nullish(),
      line2: z.string().nullish(),
      city: z.string().nullish(),
      country: z.string().nullish(),
      region: z.string().nullish(),
      postalCode: z.string().nullish()
    })
  ),
  raw: z.record(z.any())
});
