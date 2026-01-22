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
import type {
  Accounting,
  AccountingSyncPayload,
  ProviderCredentials,
  ProviderIntegrationMetadata
} from "./types";

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

export const upsertAccountingCustomer = async (
  tx: KyselyTx,
  remote: Accounting.Contact,
  payload: AccountingSyncPayload
) => {
  const contact = await tx
    .selectFrom("contact")
    .select(["id", "companyId", "email"])
    .where((eq) => {
      const clauses = [eq("companyId", "=", payload.companyId)];

      if (remote.email) {
        clauses.push(eq("email", "=", remote.email));
      }

      return eq.and(clauses);
    })
    .executeTakeFirst();

  if (contact) {
    await tx
      .updateTable("contact")
      .set({
        email: remote.email ?? contact.email,
        firstName: remote.firstName ?? null,
        lastName: remote.lastName ?? null,
        isCustomer: remote.isCustomer,
        externalId: sql`jsonb_set("externalId", '{${
          payload.provider
        }}', ${sql.raw(
          JSON.stringify({
            id: remote.id,
            lastSyncedAt: new Date().toISOString(),
            provider: payload.provider
          })
        )}::jsonb, true)`
      })
      .where((eq) =>
        eq.and([
          eq("companyId", "=", contact.companyId),
          eq("email", "=", contact.id)
        ])
      )
      .execute();
  }

  const inserted = await tx
    .insertInto("contact")
    .values({
      companyId: payload.companyId,
      email: remote.email ?? null,
      firstName: remote.firstName ?? null,
      lastName: remote.lastName ?? null,
      workPhone: remote.homePhone ? remote.homePhone : null,
      mobilePhone: remote.mobilePhone ? remote.mobilePhone : null,
      isCustomer: remote.isCustomer,
      externalId: {
        [payload.provider]: {
          id: remote.id,
          lastSyncedAt: new Date().toISOString(),
          provider: payload.provider
        }
      }
    })
    .execute();

  return inserted;
};

/**
 * Atomically upserts a customer from accounting provider data
 * @returns The customer ID (existing or newly created)
 */
export const upsertCustomerFromAccounting = async (
  tx: KyselyTx,
  remote: Accounting.Contact,
  payload: AccountingSyncPayload,
  id?: string,
  conflictResolution: "skip" | "overwrite" | "merge" = "merge"
): Promise<string> => {
  if (id) {
    // Skip strategy: don't update existing customer
    if (conflictResolution === "skip") {
      return id;
    }

    const result = await tx
      .updateTable("customer")
      .set({
        name: remote.name,
        externalId: sql`COALESCE("externalId", '{}'::jsonb) || ${JSON.stringify(
          {
            [payload.provider]: {
              id: remote.id,
              lastSyncedAt: new Date().toISOString(),
              provider: payload.provider
            }
          }
        )}::jsonb`
      })
      .where((eq) =>
        eq.and([eq("companyId", "=", payload.companyId), eq("id", "=", id)])
      )
      .returning("id")
      .executeTakeFirstOrThrow();

    return result.id;
  }

  const customer = await tx
    .insertInto("customer")
    .values({
      companyId: payload.companyId,
      name: remote.name,
      externalId: {
        [payload.provider]: {
          id: remote.id,
          lastSyncedAt: new Date().toISOString(),
          provider: payload.provider
        }
      }
    })
    .returning("id")
    .executeTakeFirst();

  if (!customer?.id) {
    throw new Error("Failed to create customer");
  }

  return customer.id;
};

/**
 * Atomically upserts a contact and links it to a customer
 * Handles conflict resolution for existing contacts with the same email
 */
export const upsertContactAndLinkToCustomer = async (
  tx: KyselyTx,
  remote: Accounting.Contact,
  customerId: string,
  payload: AccountingSyncPayload,
  conflictResolution: "skip" | "overwrite" | "merge" = "merge"
): Promise<void> => {
  let insertQuery = tx.insertInto("contact").values({
    companyId: payload.companyId,
    email: remote.email ?? null,
    firstName: remote.firstName ?? null,
    lastName: remote.lastName ?? null,
    workPhone: remote.workPhone ?? null,
    mobilePhone: remote.mobilePhone ?? null,
    homePhone: remote.homePhone ?? null,
    fax: remote.fax ?? null,
    isCustomer: true,
    externalId: {
      [payload.provider]: {
        id: remote.id,
        lastSyncedAt: new Date().toISOString(),
        provider: payload.provider
      }
    }
  });

  // Apply conflict resolution strategy
  if (conflictResolution === "skip") {
    insertQuery = insertQuery.onConflict((oc) =>
      oc
        .columns(["companyId", "isCustomer", "email"])
        .where((eq) => eq("email", "is not", null))
        .doNothing()
    );
  } else if (conflictResolution === "overwrite") {
    insertQuery = insertQuery.onConflict((oc) =>
      oc
        .columns(["companyId", "isCustomer", "email"])
        .where((eq) => eq("email", "is not", null))
        .doUpdateSet({
          firstName: sql`EXCLUDED."firstName"`,
          lastName: sql`EXCLUDED."lastName"`,
          workPhone: sql`EXCLUDED."workPhone"`,
          mobilePhone: sql`EXCLUDED."mobilePhone"`,
          homePhone: sql`EXCLUDED."homePhone"`,
          fax: sql`EXCLUDED."fax"`,
          externalId: sql`EXCLUDED."externalId"`
        })
    );
  } else {
    // merge strategy (default)
    insertQuery = insertQuery.onConflict((oc) =>
      oc
        .columns(["companyId", "isCustomer", "email"])
        .where((eq) => eq("email", "is not", null))
        .doUpdateSet({
          firstName: sql`COALESCE(EXCLUDED."firstName", contact."firstName")`,
          lastName: sql`COALESCE(EXCLUDED."lastName", contact."lastName")`,
          workPhone: sql`COALESCE(EXCLUDED."workPhone", contact."workPhone")`,
          mobilePhone: sql`COALESCE(EXCLUDED."mobilePhone", contact."mobilePhone")`,
          homePhone: sql`COALESCE(EXCLUDED."homePhone", contact."homePhone")`,
          fax: sql`COALESCE(EXCLUDED."fax", contact."fax")`,
          externalId: sql`contact."externalId" || EXCLUDED."externalId"`
        })
    );
  }

  const contact = await insertQuery.returningAll().executeTakeFirst();

  if (!contact?.id) {
    throw new Error("Failed to upsert contact");
  }

  const connection = {
    contactId: contact.id,
    customerId
  };

  const linked = await tx
    .updateTable("customerContact")
    .set(connection)
    .where((eq) => eq("customerId", "=", customerId))
    .executeTakeFirst();

  if (!linked.numUpdatedRows) {
    await tx.insertInto("customerContact").values(connection).execute();
  }
};

/**
 * Atomically upserts a supplier from accounting provider data
 * @returns The supplier ID (existing or newly created)
 */
export const upsertSupplierFromAccounting = async (
  tx: KyselyTx,
  remote: Accounting.Contact,
  payload: AccountingSyncPayload,
  id?: string,
  conflictResolution: "skip" | "overwrite" | "merge" = "merge"
): Promise<string> => {
  if (id) {
    // Skip strategy: don't update existing supplier
    if (conflictResolution === "skip") {
      return id;
    }

    const result = await tx
      .updateTable("supplier")
      .set({
        name: remote.name,
        externalId: sql`COALESCE("externalId", '{}'::jsonb) || ${JSON.stringify(
          {
            [payload.provider]: {
              id: remote.id,
              lastSyncedAt: new Date().toISOString(),
              provider: payload.provider
            }
          }
        )}::jsonb`
      })
      .where((eq) =>
        eq.and([eq("companyId", "=", payload.companyId), eq("id", "=", id)])
      )
      .returning("id")
      .executeTakeFirstOrThrow();

    return result.id;
  }

  const supplier = await tx
    .insertInto("supplier")
    .values({
      companyId: payload.companyId,
      name: remote.name,
      externalId: {
        [payload.provider]: {
          id: remote.id,
          lastSyncedAt: new Date().toISOString(),
          provider: payload.provider
        }
      }
    })
    .returning("id")
    .executeTakeFirst();

  if (!supplier?.id) {
    throw new Error("Failed to create supplier");
  }

  return supplier.id;
};

/**
 * Atomically upserts a contact and links it to a supplier
 * Handles conflict resolution for existing contacts with the same email
 */
export const upsertContactAndLinkToSupplier = async (
  tx: KyselyTx,
  remote: Accounting.Contact,
  supplierId: string,
  payload: AccountingSyncPayload,
  conflictResolution: "skip" | "overwrite" | "merge" = "merge"
): Promise<void> => {
  let insertQuery = tx.insertInto("contact").values({
    companyId: payload.companyId,
    email: remote.email ?? null,
    firstName: remote.firstName ?? null,
    lastName: remote.lastName ?? null,
    workPhone: remote.workPhone ?? null,
    mobilePhone: remote.mobilePhone ?? null,
    homePhone: remote.homePhone ?? null,
    fax: remote.fax ?? null,
    externalId: {
      [payload.provider]: {
        id: remote.id,
        lastSyncedAt: new Date().toISOString(),
        provider: payload.provider
      }
    }
  });

  // Apply conflict resolution strategy
  if (conflictResolution === "skip") {
    insertQuery = insertQuery.onConflict((oc) =>
      oc
        .columns(["companyId", "email"])
        .where((eq) => eq("email", "is not", null))
        .doNothing()
    );
  } else if (conflictResolution === "overwrite") {
    insertQuery = insertQuery.onConflict((oc) =>
      oc
        .columns(["companyId", "email"])
        .where((eq) => eq("email", "is not", null))
        .doUpdateSet({
          firstName: sql`EXCLUDED."firstName"`,
          lastName: sql`EXCLUDED."lastName"`,
          workPhone: sql`EXCLUDED."workPhone"`,
          mobilePhone: sql`EXCLUDED."mobilePhone"`,
          homePhone: sql`EXCLUDED."homePhone"`,
          fax: sql`EXCLUDED."fax"`,
          externalId: sql`EXCLUDED."externalId"`
        })
    );
  } else {
    // merge strategy (default)
    insertQuery = insertQuery.onConflict((oc) =>
      oc
        .columns(["companyId", "email"])
        .where((eq) => eq("email", "is not", null))
        .doUpdateSet({
          firstName: sql`COALESCE(EXCLUDED."firstName", contact."firstName")`,
          lastName: sql`COALESCE(EXCLUDED."lastName", contact."lastName")`,
          workPhone: sql`COALESCE(EXCLUDED."workPhone", contact."workPhone")`,
          mobilePhone: sql`COALESCE(EXCLUDED."mobilePhone", contact."mobilePhone")`,
          homePhone: sql`COALESCE(EXCLUDED."homePhone", contact."homePhone")`,
          fax: sql`COALESCE(EXCLUDED."fax", contact."fax")`,
          externalId: sql`contact."externalId" || EXCLUDED."externalId"`
        })
    );
  }

  const contact = await insertQuery.returningAll().executeTakeFirst();

  if (!contact?.id) {
    throw new Error("Failed to upsert contact");
  }

  const connection = {
    contactId: contact.id,
    supplierId
  };

  const linked = await tx
    .updateTable("supplierContact")
    .set(connection)
    .where((eq) => eq("supplierId", "=", supplierId))
    .executeTakeFirst();

  if (!linked.numUpdatedRows) {
    await tx.insertInto("supplierContact").values(connection).execute();
  }
};
