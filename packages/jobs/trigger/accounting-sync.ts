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
  syncType: "webhook" | "scheduled" | "trigger";
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
      client,
      companyId,
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
  client: SupabaseClient<Database>,
  companyId: string,
  provider: string,
  config: z.infer<typeof metadataSchema>
): Promise<CoreProvider> {
  const { accessToken, refreshToken, tenantId } = config;

  // Create a callback function to update the integration metadata when tokens are refreshed
  const onTokenRefresh = async (auth) => {
    try {
      const newMetadata = {
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        expiresAt:
          auth.expiresAt?.toISOString() ||
          new Date(Date.now() + 3600000).toISOString(), // Default to 1 hour if not provided
        tenantId: auth.tenantId || tenantId,
      };

      await client
        .from("companyIntegration")
        .update({ metadata: newMetadata })
        .eq("companyId", companyId)
        .eq("id", provider);

      console.log(
        `Updated ${provider} integration metadata for company ${companyId}`
      );
    } catch (error) {
      console.error(
        `Failed to update ${provider} integration metadata:`,
        error
      );
    }
  };

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
        companyId,
        integrationId: provider,
        onTokenRefresh,
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
        companyId,
        integrationId: provider,
        onTokenRefresh,
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
        case "invoice":
          return await syncInvoiceFromAccounting(
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

  const providerName = provider.getProviderInfo().name.toLowerCase();

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

  // Sync contact information if email is available
  if (accountingCustomer.email) {
    try {
      // Check if contact already exists by external ID
      const existingContactQuery = await client
        .from("contact")
        .select(
          `
          id,
          customerContact!inner(
            id,
            customerId
          )
        `
        )
        .eq("companyId", companyId)
        .eq(`externalId->>${providerName}Id`, externalId)
        .single();

      let contactId: string;

      if (!existingContactQuery.data) {
        // Try to find contact by email
        const contactByEmail = await client
          .from("contact")
          .select("id")
          .eq("companyId", companyId)
          .eq("email", accountingCustomer.email)
          .eq("isCustomer", true)
          .maybeSingle();

        if (contactByEmail.data) {
          contactId = contactByEmail.data.id;

          // Update the contact with external ID
          await client
            .from("contact")
            .update({
              externalId: {
                [`${providerName}Id`]: externalId,
              },
            })
            .eq("id", contactId);
        } else {
          // Create new contact
          const firstName = accountingCustomer.firstName;
          const lastName = accountingCustomer.lastName;

          const newContact = await client
            .from("contact")
            .insert({
              companyId,
              firstName,
              lastName,
              email: accountingCustomer.email,
              isCustomer: true,
              workPhone: accountingCustomer.phone?.number || null,
              externalId: {
                [`${providerName}Id`]: externalId,
              },
            })
            .select()
            .single();

          if (newContact.error) {
            console.error("Failed to create contact:", newContact.error);
          } else {
            contactId = newContact.data.id;
          }
        }

        // Create customerContact relationship if contact was created/found
        if (contactId) {
          // Check if customerContact already exists
          const existingCustomerContact = await client
            .from("customerContact")
            .select("id")
            .eq("customerId", customerId)
            .eq("contactId", contactId)
            .maybeSingle();

          if (!existingCustomerContact.data) {
            const newCustomerContact = await client
              .from("customerContact")
              .insert({
                customerId,
                contactId,
              })
              .select()
              .single();

            if (newCustomerContact.error) {
              console.error(
                "Failed to create customerContact:",
                newCustomerContact.error
              );
            }
          }
        }
      } else {
        // Contact exists, check if linked to this customer
        const customerContact = existingContactQuery.data.customerContact?.find(
          (cc: any) => cc.customerId === customerId
        );

        if (!customerContact) {
          // Link existing contact to customer
          const newCustomerContact = await client
            .from("customerContact")
            .insert({
              customerId,
              contactId: existingContactQuery.data.id,
            })
            .select()
            .single();

          if (newCustomerContact.error) {
            console.error(
              "Failed to link contact to customer:",
              newCustomerContact.error
            );
          }
        }
      }
    } catch (error) {
      console.error("Error syncing customer contact:", error);
    }
  }

  // Sync addresses if available
  if (accountingCustomer.addresses && accountingCustomer.addresses.length > 0) {
    for (const address of accountingCustomer.addresses) {
      // Skip if no valid address data (need at least street and city or state)
      if (!address.street || (!address.city && !address.state)) {
        console.log(
          "Skipping address creation - missing required fields (street and city/state)"
        );
        continue;
      }

      if (address.country && address.country.length === 3) {
        const country = await client
          .from("country")
          .select("alpha2")
          .eq("alpha3", address.country)
          .maybeSingle();
        if (country.data) {
          address.country = country.data?.alpha2;
        }
      }

      if (address.country && address.country.length > 3) {
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
        addressLine1: address.street,
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

  const providerName = provider.getProviderInfo().name.toLowerCase();

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

  // Sync contact information if email is available
  if (accountingVendor.email) {
    try {
      // Check if contact already exists by external ID
      const existingContactQuery = await client
        .from("contact")
        .select(
          `
          id,
          supplierContact!inner(
            id,
            supplierId
          )
        `
        )
        .eq("companyId", companyId)
        .eq(`externalId->>${providerName}Id`, externalId)
        .single();

      let contactId: string;

      if (!existingContactQuery.data) {
        // Try to find contact by email
        const contactByEmail = await client
          .from("contact")
          .select("id")
          .eq("companyId", companyId)
          .eq("email", accountingVendor.email)
          .eq("isCustomer", false)
          .maybeSingle();

        if (contactByEmail.data) {
          contactId = contactByEmail.data.id;

          // Update the contact with external ID
          await client
            .from("contact")
            .update({
              externalId: {
                [`${providerName}Id`]: externalId,
              },
            })
            .eq("id", contactId);
        } else {
          // Create new contact
          const firstName = accountingVendor.firstName;
          const lastName = accountingVendor.lastName;

          const newContact = await client
            .from("contact")
            .insert({
              companyId,
              firstName,
              lastName,
              email: accountingVendor.email,
              isCustomer: false,
              workPhone: accountingVendor.phone?.number || null,
              externalId: {
                [`${providerName}Id`]: externalId,
              },
            })
            .select()
            .single();

          if (newContact.error) {
            console.error("Failed to create contact:", newContact.error);
          } else {
            contactId = newContact.data.id;
          }
        }

        // Create supplierContact relationship if contact was created/found
        if (contactId) {
          // Check if supplierContact already exists
          const existingSupplierContact = await client
            .from("supplierContact")
            .select("id")
            .eq("supplierId", supplierId)
            .eq("contactId", contactId)
            .maybeSingle();

          if (!existingSupplierContact.data) {
            const newSupplierContact = await client
              .from("supplierContact")
              .insert({
                supplierId,
                contactId,
              })
              .select()
              .single();

            if (newSupplierContact.error) {
              console.error(
                "Failed to create supplierContact:",
                newSupplierContact.error
              );
            }
          }
        }
      } else {
        // Contact exists, check if linked to this supplier
        const supplierContact = existingContactQuery.data.supplierContact?.find(
          (sc: any) => sc.supplierId === supplierId
        );

        if (!supplierContact) {
          // Link existing contact to supplier
          const newSupplierContact = await client
            .from("supplierContact")
            .insert({
              supplierId,
              contactId: existingContactQuery.data.id,
            })
            .select()
            .single();

          if (newSupplierContact.error) {
            console.error(
              "Failed to link contact to supplier:",
              newSupplierContact.error
            );
          }
        }
      }
    } catch (error) {
      console.error("Error syncing supplier contact:", error);
    }
  }

  if (accountingVendor.addresses && accountingVendor.addresses.length > 0) {
    for (const address of accountingVendor.addresses) {
      // Skip if no valid address data (need at least street and city or state)
      if (!address.street || (!address.city && !address.state)) {
        console.log(
          "Skipping address creation - missing required fields (street and city/state)"
        );
        continue;
      }

      if (address.country && address.country.length === 3) {
        const country = await client
          .from("country")
          .select("alpha2")
          .eq("alpha3", address.country)
          .maybeSingle();
        if (country.data) {
          address.country = country.data?.alpha2;
        }
      }

      if (address.country && address.country.length > 3) {
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
        addressLine1: address.street,
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

async function syncInvoiceFromAccounting(
  client: SupabaseClient<Database>,
  provider: CoreProvider,
  externalId: string,
  companyId: string,
  operation: "create" | "update" | "sync"
): Promise<any> {
  // Fetch invoice from accounting system
  const invoiceData = await provider.getInvoice(externalId);
  const accountingInvoice = invoiceData.Invoices?.[0];

  if (!accountingInvoice) {
    throw new Error(`Invoice ${externalId} not found`);
  }

  console.log(
    `Processing invoice ${externalId} of type ${accountingInvoice.Type} for contact ${accountingInvoice.Contact?.ContactID}`
  );

  // Invoice processing would typically include:
  // 1. Creating/updating the invoice record
  // 2. Processing line items
  // 3. Handling payments and status updates

  // For now, we'll focus on ensuring the related contact is synced
  // The actual invoice sync logic would be implemented based on your invoice table schema

  return {
    invoiceId: externalId,
    contactId: accountingInvoice.Contact?.ContactID,
    invoiceType: accountingInvoice.Type,
    operation,
    status: "processed",
    message:
      "Invoice processed, related contact should be synced via webhook handler",
  };
}
