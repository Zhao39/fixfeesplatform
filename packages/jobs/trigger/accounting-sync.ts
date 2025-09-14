import { getCarbonServiceRole } from "@carbon/auth";
import type { Database } from "@carbon/database";
import type { CoreProvider, ProviderConfig } from "@carbon/ee/accounting";
import { QuickBooksProvider } from "@carbon/ee/quickbooks";
import { XeroProvider } from "@carbon/ee/xero";

import type { SupabaseClient } from "@supabase/supabase-js";
import { task } from "@trigger.dev/sdk/v3";
import z from "zod";

// Flexible payload interface to support different accounting systems and sync types
export interface AccountingSyncPayload {
  companyId: string;
  provider: "quickbooks" | "xero" | "sage";
  syncType: "webhook" | "scheduled" | "manual";
  syncDirection: "from_accounting" | "to_accounting" | "bidirectional";
  entities: AccountingEntity[];
  metadata?: {
    tenantId?: string;
    webhookId?: string;
    userId?: string;
    [key: string]: any;
  };
}

export interface AccountingEntity {
  entityType: "customer" | "vendor" | "invoice" | "bill" | "payment" | "item";
  entityId: string;
  operation: "create" | "update" | "delete" | "sync";
  externalId?: string;
  syncToken?: string;
  data?: any;
}

const metadataSchema = z.object({
  refreshToken: z.string().optional(),
  accessToken: z.string(),
  expiresAt: z.string().datetime(),
  tenantId: z.string().optional(),
});

export const accountingSyncTask = task({
  id: "accounting-sync",
  run: async (payload: AccountingSyncPayload) => {
    const { companyId, provider, syncDirection, entities, metadata } = payload;

    const client = getCarbonServiceRole();

    // Get the company integration details
    const companyIntegration = await client
      .from("companyIntegration")
      .select("*")
      .eq("companyId", companyId)
      .eq("id", provider)
      .single();

    if (companyIntegration.error || !companyIntegration.data) {
      throw new Error(
        `No ${provider} integration found for company ${companyId}`
      );
    }

    const providerConfig: ProviderConfig = metadataSchema.safeParse(
      companyIntegration.data.metadata
    );

    if (!providerConfig.success) {
      console.error(providerConfig.error);
      throw new Error("Invalid provider config");
    }

    const accountingProvider = await initializeProvider(
      provider,
      providerConfig.data
    );

    const results = {
      success: [] as any[],
      failed: [] as { entity: AccountingEntity; error: string }[],
    };

    for (const entity of entities) {
      try {
        const result = await processEntity(
          client,
          accountingProvider,
          entity,
          syncDirection,
          companyId,
          metadata
        );
        results.success.push(result);
      } catch (error) {
        results.failed.push({
          entity,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        console.error(
          `Failed to process ${entity.entityType} ${entity.entityId}:`,
          error
        );
      }
    }

    return results;
  },
});

async function initializeProvider(
  provider: string,
  config: z.infer<typeof metadataSchema>
): Promise<CoreProvider> {
  const { accessToken, refreshToken, tenantId } = config;

  switch (provider) {
    case "quickbooks": {
      const config: ProviderConfig = {
        clientId: process.env.QUICKBOOKS_CLIENT_ID!,
        clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET!,
        redirectUri: process.env.QUICKBOOKS_REDIRECT_URI,
        environment:
          (process.env.QUICKBOOKS_ENVIRONMENT as "production" | "sandbox") ||
          "sandbox",
        accessToken,
        refreshToken,
        tenantId,
      };

      const qbProvider = new QuickBooksProvider(config);
      return qbProvider;
    }
    case "xero": {
      const config: ProviderConfig = {
        clientId: process.env.XERO_CLIENT_ID!,
        clientSecret: process.env.XERO_CLIENT_SECRET!,
        redirectUri: process.env.XERO_REDIRECT_URI,
        accessToken,
        refreshToken,
        tenantId,
      };

      const xeroProvider = new XeroProvider(config);
      return xeroProvider;
    }
    // Add other providers as needed
    // case "sage":
    //   return new SageProvider(config);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

async function processEntity(
  client: SupabaseClient<Database>,
  provider: CoreProvider,
  entity: AccountingEntity,
  syncDirection: "from_accounting" | "to_accounting" | "bidirectional",
  companyId: string,
  metadata?: any
): Promise<any> {
  const { entityType, entityId, operation, externalId } = entity;

  if (
    syncDirection === "from_accounting" ||
    syncDirection === "bidirectional"
  ) {
    if (
      operation === "create" ||
      operation === "update" ||
      operation === "sync"
    ) {
      switch (entityType) {
        case "customer":
          return await syncCustomerFromAccounting(
            client,
            provider,
            entityId,
            companyId,
            operation
          );
        case "vendor":
          return await syncVendorFromAccounting(
            client,
            provider,
            entityId,
            companyId,
            operation
          );
      }
    } else if (operation === "delete") {
      switch (entityType) {
        case "customer":
          return await deactivateCustomer(client, companyId, externalId);
        case "vendor":
          return await deactivateSupplier(client, companyId, externalId);
      }
    }
  }

  if (syncDirection === "to_accounting" || syncDirection === "bidirectional") {
    if (operation === "create" || operation === "update") {
      switch (entityType) {
        case "customer":
          return await syncCustomerToAccounting(
            client,
            provider,
            entityId,
            companyId,
            externalId
          );
        case "vendor":
          return await syncVendorToAccounting(
            client,
            provider,
            entityId,
            companyId,
            externalId
          );
      }
    }
  }

  throw new Error(
    `Unsupported operation ${operation} for ${entityType} in direction ${syncDirection}`
  );
}

async function syncCustomerFromAccounting(
  client: SupabaseClient<Database>,
  provider: CoreProvider,
  externalId: string,
  companyId: string,
  operation: "create" | "update" | "sync"
): Promise<any> {
  const accountingCustomer = await provider.getCustomer(externalId);

  const existingCustomer = await client
    .from("customer")
    .select("*")
    .eq("companyId", companyId)
    .eq("externalId->>externalId", externalId)
    .single();

  const customerData: Database["public"]["Tables"]["customer"]["Insert"] = {
    companyId,
    name: accountingCustomer.name ?? accountingCustomer.displayName,
    phone: accountingCustomer.phone?.number || null,
    website: accountingCustomer.website || null,
    taxId: accountingCustomer.taxNumber || null,
    currencyCode: accountingCustomer.currency || "USD",
    externalId: {
      externalId,
      syncToken: (accountingCustomer as any).syncToken,
      accountingProvider: provider.getProviderInfo().name,
      lastSyncedAt: new Date().toISOString(),
      accountingData: {
        displayName: accountingCustomer.displayName,
        balance: accountingCustomer.balance,
        creditLimit: accountingCustomer.creditLimit,
        paymentTerms: accountingCustomer.paymentTerms,
      },
    },
    updatedAt: new Date().toISOString(),
  };

  let customerId: string;

  if (existingCustomer.data) {
    // Update existing customer
    const result = await client
      .from("customer")
      .update(customerData)
      .eq("id", existingCustomer.data.id)
      .select()
      .single();

    if (result.error) throw result.error;
    customerId = result.data.id;
  } else {
    // Create new customer
    const result = await client
      .from("customer")
      .insert({
        ...customerData,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (result.error) throw result.error;
    customerId = result.data.id;
  }

  // Sync addresses if available
  if (accountingCustomer.addresses && accountingCustomer.addresses.length > 0) {
    for (const address of accountingCustomer.addresses) {
      if (address.country) {
        const country = await client
          .from("country")
          .select("alpha2")
          .eq("name", address.country)
          .maybeSingle();
        if (country.data) {
          address.country = country.data?.alpha2;
        }
      }

      const addressData = {
        companyId,
        addressLine1: address.street || "",
        addressLine2: address.street2 || null,
        city: address.city || "",
        stateProvince: address.state || null,
        postalCode: address.postalCode || null,
        countryCode: address.country || null,
      };

      // Check if address exists
      const existingAddress = await client
        .from("address")
        .select("*")
        .eq("companyId", companyId)
        .eq("addressLine1", addressData.addressLine1)
        .eq("city", addressData.city)
        .maybeSingle();

      let addressId: string;

      if (existingAddress?.data) {
        addressId = existingAddress.data.id;
      } else {
        const newAddress = await client
          .from("address")
          .insert(addressData)
          .select()
          .single();

        if (newAddress.error) throw newAddress.error;
        addressId = newAddress.data.id;
      }

      // Link address to customer
      const locationType = address.type === "billing" ? "Billing" : "Shipping";

      const customerLocation = await client.from("customerLocation").upsert(
        {
          customerId,
          addressId,
          name: locationType,
        },
        {
          onConflict: "addressId,customerId",
          ignoreDuplicates: true,
        }
      );

      if (customerLocation.error) console.error(customerLocation.error);
    }
  }

  return {
    customerId,
    externalId,
    operation,
    status: "success",
  };
}

async function syncVendorFromAccounting(
  client: SupabaseClient<Database>,
  provider: CoreProvider,
  externalId: string,
  companyId: string,
  operation: "create" | "update" | "sync"
): Promise<any> {
  // Fetch vendor from accounting system
  const accountingVendor = await provider.getVendor(externalId);

  // Check if supplier exists in Carbon (by external ID)
  const existingSupplier = await client
    .from("supplier")
    .select("*")
    .eq("companyId", companyId)
    .eq("externalId->>externalId", externalId)
    .single();

  const supplierData: Database["public"]["Tables"]["supplier"]["Insert"] = {
    companyId,
    name: accountingVendor.name ?? accountingVendor.displayName,
    phone: accountingVendor.phone?.number || null,
    website: accountingVendor.website || null,
    taxId: accountingVendor.taxNumber || null,
    currencyCode: accountingVendor.currency || "USD",
    externalId: {
      externalId,
      syncToken: (accountingVendor as any).syncToken,
      accountingProvider: provider.getProviderInfo().name,
      lastSyncedAt: new Date().toISOString(),
      accountingData: {
        displayName: accountingVendor.displayName,
        balance: accountingVendor.balance,
        paymentTerms: accountingVendor.paymentTerms,
      },
    },
    updatedAt: new Date().toISOString(),
  };

  let supplierId: string;

  if (existingSupplier.data) {
    // Update existing supplier
    const result = await client
      .from("supplier")
      .update(supplierData)
      .eq("id", existingSupplier.data.id)
      .select()
      .single();

    if (result.error) throw result.error;
    supplierId = result.data.id;
  } else {
    // Create new supplier
    const result = await client
      .from("supplier")
      .insert({
        ...supplierData,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (result.error) throw result.error;
    supplierId = result.data.id;
  }

  if (accountingVendor.addresses && accountingVendor.addresses.length > 0) {
    for (const address of accountingVendor.addresses) {
      if (address.country) {
        const country = await client
          .from("country")
          .select("alpha2")
          .eq("name", address.country)
          .maybeSingle();

        if (country.data) {
          address.country = country.data?.alpha2;
        }
      }
      const addressData = {
        companyId,
        addressLine1: address.street || "",
        addressLine2: address.street2 || null,
        city: address.city || "",
        stateProvince: address.state || null,
        postalCode: address.postalCode || null,
        countryCode: address.country || null,
      };

      // Check if address exists
      const existingAddress = await client
        .from("address")
        .select("*")
        .eq("companyId", companyId)
        .eq("addressLine1", addressData.addressLine1)
        .eq("city", addressData.city)
        .maybeSingle();

      let addressId: string;

      if (existingAddress?.data) {
        addressId = existingAddress.data.id;
      } else {
        const newAddress = await client
          .from("address")
          .insert(addressData)
          .select()
          .single();

        if (newAddress.error) throw newAddress.error;
        addressId = newAddress.data.id;
      }

      // Link address to supplier
      const locationType = address.type === "billing" ? "Billing" : "Shipping";

      const supplierLocation = await client.from("supplierLocation").upsert(
        {
          supplierId,
          addressId,
          name: locationType,
        },
        {
          onConflict: "addressId,supplierId",
        }
      );

      if (supplierLocation.error) console.error(supplierLocation.error);
    }
  }

  return {
    supplierId,
    externalId,
    operation,
    status: "success",
  };
}

async function syncCustomerToAccounting(
  client: SupabaseClient<Database>,
  provider: CoreProvider,
  customerId: string,
  companyId: string,
  externalId?: string
): Promise<any> {
  // Fetch customer from Carbon
  const customer = await client
    .from("customer")
    .select("*, customerLocation(*, address(*))")
    .eq("id", customerId)
    .eq("companyId", companyId)
    .single();

  if (customer.error || !customer.data) {
    throw new Error(`Customer ${customerId} not found`);
  }

  // Transform Carbon customer to accounting format
  const accountingCustomerData = {
    name: customer.data.name,
    phone: customer.data.phone
      ? { number: customer.data.phone, type: "work" as any }
      : undefined,
    website: customer.data.website || undefined,
    taxNumber: customer.data.taxId || undefined,
    currency: customer.data.currencyCode || "USD",
    isActive: true,
    addresses: (customer.data.customerLocation || [])
      .map((loc: any) => ({
        type: loc.name === "Billing" ? "billing" : "shipping",
        street: loc.address?.addressLine1,
        street2: loc.address?.addressLine2,
        city: loc.address?.city,
        state: loc.address?.state,
        postalCode: loc.address?.postalCode,
        country: loc.address?.country,
      }))
      .filter((addr: any) => addr.street),
  };

  let result;
  if (externalId) {
    // Update existing customer in accounting system
    result = await provider.updateCustomer(externalId, accountingCustomerData);
  } else {
    // Create new customer in accounting system
    result = await provider.createCustomer(accountingCustomerData);
  }

  // Update Carbon customer with external ID
  await client
    .from("customer")
    .update({
      externalId: {
        ...((customer.data.externalId as any) || {}),
        externalId: result.id,
        syncToken: (result as any).syncToken,
        accountingProvider: provider.getProviderInfo().name,
        lastSyncedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    })
    .eq("id", customerId);

  return {
    customerId,
    externalId: result.id,
    operation: externalId ? "update" : "create",
    status: "success",
  };
}

async function syncVendorToAccounting(
  client: SupabaseClient<Database>,
  provider: CoreProvider,
  supplierId: string,
  companyId: string,
  externalId?: string
): Promise<any> {
  // Fetch supplier from Carbon
  const supplier = await client
    .from("supplier")
    .select("*, supplierLocation(*, address(*))")
    .eq("id", supplierId)
    .eq("companyId", companyId)
    .single();

  if (supplier.error || !supplier.data) {
    throw new Error(`Supplier ${supplierId} not found`);
  }

  // Transform Carbon supplier to accounting vendor format
  const accountingVendorData = {
    name: supplier.data.name,
    email: undefined,
    phone: supplier.data.phone
      ? { number: supplier.data.phone, type: "work" as any }
      : undefined,
    website: supplier.data.website || undefined,
    taxNumber: supplier.data.taxId || undefined,
    currency: supplier.data.currencyCode || "USD",
    isActive: true,
    addresses: (supplier.data.supplierLocation || [])
      .map((loc: any) => ({
        type: "billing" as any,
        street: loc.address?.addressLine1,
        street2: loc.address?.addressLine2,
        city: loc.address?.city,
        state: loc.address?.state,
        postalCode: loc.address?.postalCode,
        country: loc.address?.country,
      }))
      .filter((addr: any) => addr.street),
  };

  let result;
  if (externalId) {
    // Update existing vendor in accounting system
    result = await provider.updateVendor(externalId, accountingVendorData);
  } else {
    // Create new vendor in accounting system
    result = await provider.createVendor(accountingVendorData);
  }

  // Update Carbon supplier with external ID
  await client
    .from("supplier")
    .update({
      externalId: {
        ...((supplier.data.externalId as any) || {}),
        externalId: result.id,
        syncToken: (result as any).syncToken,
        accountingProvider: provider.getProviderInfo().name,
        lastSyncedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    })
    .eq("id", supplierId);

  return {
    supplierId,
    externalId: result.id,
    operation: externalId ? "update" : "create",
    status: "success",
  };
}

async function deactivateCustomer(
  client: SupabaseClient<Database>,
  companyId: string,
  externalId?: string
): Promise<any> {
  if (!externalId) {
    throw new Error("External ID required for deactivation");
  }

  const result = await client
    .from("customer")
    .update({
      active: false,
      updatedAt: new Date().toISOString(),
    })
    .eq("companyId", companyId)
    .eq("externalId->>externalId", externalId)
    .select()
    .single();

  if (result.error) throw result.error;

  return {
    customerId: result.data.id,
    externalId,
    operation: "delete",
    status: "deactivated",
  };
}

async function deactivateSupplier(
  client: SupabaseClient<Database>,
  companyId: string,
  externalId?: string
): Promise<any> {
  if (!externalId) {
    throw new Error("External ID required for deactivation");
  }

  const result = await client
    .from("supplier")
    .update({
      active: false,
      updatedAt: new Date().toISOString(),
    })
    .eq("companyId", companyId)
    .eq("externalId->>externalId", externalId)
    .select()
    .single();

  if (result.error) throw result.error;

  return {
    supplierId: result.data.id,
    externalId,
    operation: "delete",
    status: "deactivated",
  };
}
