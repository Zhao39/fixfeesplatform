import type { Database } from "@carbon/database";
import type { KyselyDatabase, KyselyTx } from "@carbon/database/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Kysely } from "kysely";
import { sql } from "kysely";
import { XeroProvider } from "../providers/xero";
import type { ProviderID } from "./models";
import {
  DEFAULT_SYNC_CONFIG,
  ExternalIdSchema,
  ProviderIntegrationMetadataSchema
} from "./models";
import type { ProviderCredentials, ProviderIntegrationMetadata } from "./types";

export const getAccountingIntegration = async <T extends ProviderID>(
  client: SupabaseClient<Database>,
  companyOrTenantId: string,
  provider: T
) => {
  const integration = await client
    .from("companyIntegration")
    .select("*")
    .eq("id", provider)
    .or(
      `companyId.eq.${companyOrTenantId},metadata->credentials->>tenantId.eq.${companyOrTenantId}`
    )
    .single();

  console.log(
    "Fetched integration for",
    provider,
    "and ID",
    companyOrTenantId,
    integration
  );

  if (integration.error || !integration.data) {
    throw new Error(
      `No ${provider} integration found for company or tenant ${companyOrTenantId}`
    );
  }

  const config = ProviderIntegrationMetadataSchema.safeParse(
    integration.data.metadata
  );

  if (!config.success) {
    console.dir(config.error, { depth: null });
    throw new Error("Invalid provider config");
  }

  return {
    ...integration.data,
    id: provider as T,
    metadata: config.data
  } as const;
};

export const getProviderIntegration = (
  client: SupabaseClient<Database>,
  companyId: string,
  provider: ProviderID,
  config?: ProviderIntegrationMetadata
) => {
  const { accessToken, refreshToken, tenantId } = config?.credentials || {};

  const syncConfig = DEFAULT_SYNC_CONFIG; // TODO use config?.syncConfig to make it configurable

  // Create a callback function to update the integration metadata when tokens are refreshed
  const onTokenRefresh = async (auth: ProviderCredentials) => {
    try {
      console.log("Refreshing tokens for", provider, "integration");
      const update: ProviderCredentials = {
        ...auth,
        expiresAt:
          auth.expiresAt || new Date(Date.now() + 3600000).toISOString(), // Default to 1 hour if not provided
        tenantId: auth.tenantId || tenantId
      };

      await client
        .from("companyIntegration")
        .update({ metadata: { ...config, credentials: update } })
        .eq("companyId", companyId)
        .eq("id", provider);
    } catch (error) {
      console.error(
        `Failed to update ${provider} integration metadata:`,
        error
      );
    }
  };

  switch (provider) {
    // case "quickbooks": {
    //   const environment = process.env.QUICKBOOKS_ENVIRONMENT as
    //     | "production"
    //     | "sandbox";
    //   return new QuickBooksProvider({
    //     companyId,
    //     tenantId,
    //     environment: environment || "sandbox",
    //     clientId: process.env.QUICKBOOKS_CLIENT_ID!,
    //     clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
    //     redirectUri: process.env.QUICKBOOKS_REDIRECT_URI,
    //     onTokenRefresh
    //   });
    // }
    case "xero":
      return new XeroProvider({
        companyId,
        tenantId,
        accessToken,
        refreshToken,
        clientId: process.env.XERO_CLIENT_ID!,
        clientSecret: process.env.XERO_CLIENT_SECRET!,
        redirectUri: process.env.XERO_REDIRECT_URI,
        syncConfig,
        onTokenRefresh
      });
    // Add other providers as needed
    // case "sage":
    //   return new SageProvider(config);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};

export const getContactFromExternalId = async (
  client: SupabaseClient<Database>,
  companyId: string,
  provider: ProviderID,
  id: string
) => {
  const contact = await client
    .from("contact")
    .select("*")
    .eq("companyId", companyId)
    .eq("externalId->>provider", provider)
    .eq("externalId->>id", id)
    .single();

  if (contact.error || !contact.data) {
    return null;
  }

  const externalId = await ExternalIdSchema.safeParseAsync(
    contact.data.externalId
  );

  if (!externalId.success) {
    throw new Error("Invalid external ID format");
  }

  return {
    ...contact.data,
    externalId
  };
};

type TablesWithExternalId = {
  [K in keyof Database["public"]["Tables"]]: Database["public"]["Tables"][K]["Row"] extends {
    externalId: unknown;
  }
    ? K
    : never;
}[keyof Database["public"]["Tables"]];

type EntityWithParsedExternalId<T extends TablesWithExternalId> = Omit<
  Database["public"]["Tables"][T]["Row"],
  "externalId"
> & {
  externalId: typeof ExternalIdSchema._type;
};

// Internal helper for Kysely implementation
export async function getAccountingEntity<T extends TablesWithExternalId>(
  client: Kysely<KyselyDatabase> | KyselyTx,
  table: T,
  companyId: string,
  provider: ProviderID,
  select: { externalId: string } | { id: string }
): Promise<EntityWithParsedExternalId<T> | null> {
  let query = client
    .selectFrom(table as keyof KyselyDatabase)
    .selectAll()
    .where("companyId", "=", companyId)
    .where(sql`"externalId"->${provider}->>'provider'`, "=", provider);

  if ("id" in select) {
    query = query.where("id", "=", select.id);
  }

  if ("externalId" in select) {
    query = query.where(
      sql`"externalId"->${provider}->>'id'`,
      "=",
      select.externalId
    );
  }

  const entry = await query.executeTakeFirst();

  if (!entry) {
    return null;
  }

  const externalId = await ExternalIdSchema.safeParseAsync(
    (entry as any).externalId
  );

  if (!externalId.success) {
    throw new Error("Invalid external ID format");
  }

  return {
    ...(entry as unknown as Omit<
      Database["public"]["Tables"][T]["Row"],
      "externalId"
    >),
    externalId: externalId.data
  };
}

/**
 * Updates the externalId JSONB field for an entity, merging with existing data
 */
export async function updateAccountingEntityExternalId<
  T extends TablesWithExternalId
>(
  client: Kysely<KyselyDatabase> | KyselyTx,
  table: T,
  entityId: string,
  provider: ProviderID,
  remoteId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await client
    .updateTable(table as keyof KyselyDatabase)
    .set({
      externalId: sql`COALESCE("externalId", '{}'::jsonb) || ${JSON.stringify({
        [provider]: {
          id: remoteId,
          provider,
          lastSyncedAt: new Date().toISOString(),
          ...(metadata ?? {})
        }
      })}::jsonb`
    })
    .where("id", "=", entityId)
    .execute();
}

/**
 * Removes the external ID link for a specific provider from an entity
 */
export async function unlinkAccountingEntityExternalId<
  T extends TablesWithExternalId
>(
  client: Kysely<KyselyDatabase> | KyselyTx,
  table: T,
  entityId: string,
  provider: ProviderID
): Promise<void> {
  await client
    .updateTable(table as keyof KyselyDatabase)
    .set({
      externalId: sql`"externalId" - ${provider}`
    })
    .where("id", "=", entityId)
    .execute();
}
