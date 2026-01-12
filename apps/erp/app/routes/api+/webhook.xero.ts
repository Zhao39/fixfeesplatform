/**
 * Xero Webhook Handler
 *
 * This endpoint receives webhook notifications from Xero when entities
 * (contacts, invoices, etc.) are created, updated, or deleted in Xero.
 *
 * The webhook handler implements Xero's intent-to-receive workflow:
 * 1. Validates the webhook signature for security
 * 2. Returns HTTP 200 for valid signatures (intent-to-receive)
 * 3. Once Xero confirms the webhook is working, processes actual events
 * 4. Looks up the company integration by Xero tenant ID
 * 5. Triggers background sync jobs to process the entity changes
 *
 * Supported entity types:
 * - Contact: Synced to Carbon's customer/supplier table (based on IsCustomer/IsSupplier flags)
 * - Invoice: Synced to Carbon's invoice table
 *
 * The actual sync logic is handled asynchronously by the accounting-sync
 * background job to prevent webhook timeouts and ensure reliability.
 */

import { getCarbonServiceRole, XERO_WEBHOOK_SECRET } from "@carbon/auth";
import {
  AccountingEntity,
  AccountingSyncPayload,
  getProviderIntegration,
  ProviderCredentials,
  ProviderID,
  XeroProvider
} from "@carbon/ee/accounting";
import { tasks } from "@trigger.dev/sdk/v3";
import crypto from "crypto";
import { type ActionFunctionArgs, data } from "react-router";
import { z } from "zod";

export const config = {
  runtime: "nodejs"
};

const WebhookSchema = z.object({
  entropy: z.string().optional(),
  events: z.array(
    z.object({
      tenantId: z.string(),
      eventCategory: z.enum(["ITEM", "CONTACT"]),
      eventType: z.enum(["CREATE", "UPDATE", "DELETE"]),
      resourceId: z.string(),
      eventDateUtc: z.string()
    })
  ),
  firstEventSequence: z.number(),
  lastEventSequence: z.number()
});

function verifySignature(payload: string, header: string) {
  if (!XERO_WEBHOOK_SECRET) {
    console.warn("XERO_WEBHOOK_SECRET is not configured");
    return payload;
  }

  const hmac = crypto
    .createHmac("sha256", XERO_WEBHOOK_SECRET)
    .update(payload, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(header));
}

async function fetchContactAndDetermineType(
  companyId: string,
  tenantId: string,
  contactId: string,
  serviceRole: any
): Promise<{
  entityType: "customer" | "vendor" | "both";
  isCustomer: boolean;
  isSupplier: boolean;
}> {
  try {
    // Get the Xero integration credentials
    const integration = await serviceRole
      .from("companyIntegration")
      .select("*")
      .eq("companyId", companyId)
      .eq("id", XeroProvider.id)
      .single();

    if (integration.error || !integration.data) {
      throw new Error("Xero integration not found");
    }

    const metadata = integration.data.metadata || {};

    const { accessToken, refreshToken } = metadata;

    if (!accessToken) {
      throw new Error("No access token available for Xero integration");
    }

    const creds: ProviderCredentials = {
      type: "oauth2",
      accessToken,
      refreshToken,
      tenantId
    };

    const provider = getProviderIntegration(
      serviceRole,
      companyId,
      XeroProvider.id,
      creds
    );

    const contact = await provider.contacts.get(contactId);

    const isCustomer = contact.isCustomer;
    const isSupplier = contact.isVendor;

    // Determine entity type based on flags
    let entityType: "customer" | "vendor" | "both";

    if (isCustomer && isSupplier) {
      entityType = "both";
    } else if (isSupplier) {
      entityType = "vendor";
    } else {
      // Default to customer if only customer or neither flag is set
      entityType = "customer";
    }

    return { entityType, isCustomer, isSupplier };
  } catch (error) {
    console.error(`Error fetching contact ${contactId}:`, error);
    // Default to customer if we can't fetch the contact
    return { entityType: "customer", isCustomer: true, isSupplier: false };
  }
}

export async function action({ request }: ActionFunctionArgs) {
  // Get the raw payload for signature verification
  const payloadText = await request.text();

  // Verify webhook signature for security (Xero's intent-to-receive workflow)
  if (XERO_WEBHOOK_SECRET) {
    // If payload is empty or just contains intent-to-receive data, return 200
    if (!payloadText || payloadText.trim() === "" || payloadText === "{}") {
      return new Response("", { status: 200 });
    }

    const signature = request.headers.get("x-xero-signature");

    if (!signature) {
      return data(
        { success: false, error: "Missing signature" },
        { status: 401 }
      );
    }

    const isValid = verifySignature(payloadText, signature);

    if (!isValid) {
      return data(
        {
          success: false,
          error: "Invalid signature"
        },
        { status: 401 }
      );
    }
  }

  // Parse and validate the webhook payload for actual events
  let payload;
  try {
    payload = JSON.parse(payloadText);
  } catch (error) {
    console.error("Failed to parse webhook payload:", error);
    return data(
      {
        success: false,
        error: "Invalid JSON payload"
      },
      { status: 401 }
    );
  }

  const parsed = WebhookSchema.safeParse(payload);

  if (!parsed.success) {
    console.error("Invalid Xero webhook payload:", parsed.error);
    return data(
      {
        success: false,
        error: "Invalid payload format"
      },
      { status: 401 }
    );
  }

  console.log(
    "Processing Xero webhook with",
    parsed.data.events.length,
    "events"
  );

  const serviceRole = await getCarbonServiceRole();
  const events = parsed.data.events;
  const syncJobs = [];
  const errors = [];

  // Group events by tenant ID for efficient processing
  const eventsByTenant = events.reduce(
    (acc, event) => {
      if (!acc[event.tenantId]) {
        acc[event.tenantId] = [];
      }
      acc[event.tenantId].push(event);
      return acc;
    },
    {} as Record<string, typeof events>
  );

  // Process events for each tenant
  for (const [tenantId, tenantEvents] of Object.entries(eventsByTenant)) {
    try {
      // Find the company integration for this Xero tenant by checking metadata
      const { data: integrations } = await serviceRole
        .from("companyIntegration")
        .select("*")
        .eq("id", "xero" as any);

      if (!integrations || integrations.length === 0) {
        console.error(`No Xero integration found for tenant ${tenantId}`);
        errors.push({
          tenantId,
          error: "Integration not found"
        });
        continue;
      }

      // Find the integration that matches this tenant ID
      const found = integrations.find(
        (integration: any) => integration.metadata?.tenantId === tenantId
      );

      if (!found) {
        console.error(`No Xero integration found for tenant ${tenantId}`);
        errors.push({
          tenantId,
          error: "Tenant ID not found in integrations"
        });
        continue;
      }

      const companyId = found.companyId;

      // Group entities by type for efficient batch processing
      const entities: Array<AccountingEntity> = [];

      for (const event of tenantEvents) {
        const { resourceId, eventCategory } = event;

        const operation = event.eventType.toLowerCase() as Lowercase<
          AccountingEntity["operation"]
        >;

        // Log each entity change for debugging
        console.log(
          `Xero ${operation}: ${eventCategory} ${resourceId} (tenant: ${tenantId})`
        );

        switch (eventCategory) {
          case "CONTACT":
            {
              // Fetch the contact from Xero to determine if it's a customer or vendor
              const contactInfo = await fetchContactAndDetermineType(
                companyId,
                tenantId,
                resourceId,
                serviceRole
              );

              // If the contact is both customer and supplier, sync to both tables
              if (contactInfo.entityType === "both") {
                // Add as customer
                entities.push({
                  operation,
                  entityType: "customer",
                  entityId: resourceId
                });

                // Add as vendor
                entities.push({
                  operation,
                  entityType: "vendor",
                  entityId: resourceId
                });
              } else {
                // Add as either customer or vendor based on the determination
                entities.push({
                  operation,
                  entityType: contactInfo.entityType,
                  entityId: resourceId
                });
              }
            }
            break;
        }
      }

      // Trigger background sync job if there are entities to process
      if (entities.length > 0) {
        try {
          // Prepare the payload for the accounting sync job
          const payload: AccountingSyncPayload = {
            companyId,
            provider: ProviderID.XERO,
            syncType: "webhook",
            syncDirection: "from-accounting",
            entities,
            metadata: {
              tenantId: tenantId,
              raw: parsed.data
            }
          };

          console.dir(payload, { depth: null });

          // Trigger the background job using Trigger.dev
          const handle = await tasks.trigger("from-accounting-sync", payload, {
            tags: [ProviderID.XERO, payload.syncType],
            concurrencyKey: `from-accounting-sync:${companyId}`
          });

          console.log(
            `Triggered accounting sync job ${handle.id} for ${entities.length} entities`
          );

          syncJobs.push({
            id: handle.id,
            companyId,
            tenantId,
            entityCount: entities.length
          });
        } catch (error) {
          console.error("Failed to trigger sync job:", error);
          errors.push({
            tenantId,
            error:
              error instanceof Error ? error.message : "Failed to trigger job"
          });
        }
      }
    } catch (error) {
      console.error("Error processing events for tenant:", tenantId, error);
      errors.push({
        tenantId,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  // Return detailed response
  return {
    success: errors.length === 0,
    jobsTriggered: syncJobs.length,
    jobs: syncJobs,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString()
  };
}
