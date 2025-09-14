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
import { tasks } from "@trigger.dev/sdk/v3";
import type { ActionFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import crypto from "crypto";
import { z } from "zod";

export const config = {
  runtime: "nodejs",
};

const xeroEventValidator = z.object({
  events: z.array(
    z.object({
      tenantId: z.string(),
      eventCategory: z.enum(["INVOICE", "CONTACT"]),
      eventType: z.enum(["CREATE", "UPDATE", "DELETE"]),
      resourceId: z.string(),
      eventDateUtc: z.string(),
    })
  ),
  firstEventSequence: z.number(),
  lastEventSequence: z.number(),
});

function verifyXeroSignature(payload: string, signature: string): boolean {
  if (!XERO_WEBHOOK_SECRET) {
    console.warn("XERO_WEBHOOK_SECRET is not set");
    return true;
  }

  const expectedSignature = crypto
    .createHmac("sha256", XERO_WEBHOOK_SECRET)
    .update(payload)
    .digest("base64");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

async function triggerAccountingSync(
  companyId: string,
  tenantId: string,
  entities: Array<{
    entityType: "customer" | "vendor" | "invoice";
    entityId: string;
    operation: "create" | "update" | "delete";
  }>
) {
  // Prepare the payload for the accounting sync job
  const payload = {
    companyId,
    provider: "xero" as const,
    syncType: "webhook" as const,
    syncDirection: "from_accounting" as const,
    entities: entities.map((entity) => ({
      entityType: entity.entityType,
      entityId: entity.entityId,
      operation: entity.operation,
      externalId: entity.entityId, // In Xero, the resource ID is the external ID
    })),
    metadata: {
      tenantId: tenantId,
      webhookId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    },
  };

  // Trigger the background job using Trigger.dev
  const handle = await tasks.trigger("accounting-sync", payload);

  console.log(
    `Triggered accounting sync job ${handle.id} for ${entities.length} entities`
  );

  return handle;
}

export async function action({ request, params }: ActionFunctionArgs) {
  // Get the raw payload for signature verification
  const payloadText = await request.text();

  // Verify webhook signature for security (Xero's intent-to-receive workflow)
  const signatureHeader = request.headers.get("x-xero-signature");

  if (!signatureHeader) {
    console.warn("Xero webhook received without signature");
    return json(
      {
        success: false,
        error: "Missing signature",
      },
      { status: 401 }
    );
  }

  const requestIsValid = verifyXeroSignature(payloadText, signatureHeader);

  if (!requestIsValid) {
    console.error("Xero webhook signature verification failed");
    return json(
      {
        success: false,
        error: "Invalid signature",
      },
      { status: 401 }
    );
  }

  // If payload is empty or just contains intent-to-receive data, return 200
  if (!payloadText || payloadText.trim() === "" || payloadText === "{}") {
    console.log("Xero intent-to-receive webhook confirmed");
    return new Response("", { status: 200 });
  }

  // Parse and validate the webhook payload for actual events
  let payload;
  try {
    payload = JSON.parse(payloadText);
  } catch (error) {
    console.error("Failed to parse webhook payload:", error);
    return json(
      {
        success: false,
        error: "Invalid JSON payload",
      },
      { status: 400 }
    );
  }

  const parsedPayload = xeroEventValidator.safeParse(payload);

  if (!parsedPayload.success) {
    console.error("Invalid Xero webhook payload:", parsedPayload.error);
    return json(
      {
        success: false,
        error: "Invalid payload format",
      },
      { status: 400 }
    );
  }

  console.log(
    "Processing Xero webhook with",
    parsedPayload.data.events.length,
    "events"
  );

  const serviceRole = await getCarbonServiceRole();
  const events = parsedPayload.data.events;
  const syncJobs = [];
  const errors = [];

  // Group events by tenant ID for efficient processing
  const eventsByTenant = events.reduce((acc, event) => {
    if (!acc[event.tenantId]) {
      acc[event.tenantId] = [];
    }
    acc[event.tenantId].push(event);
    return acc;
  }, {} as Record<string, typeof events>);

  // Process events for each tenant
  for (const [tenantId, tenantEvents] of Object.entries(eventsByTenant)) {
    try {
      // Find the company integration for this Xero tenant
      const companyIntegration = await serviceRole
        .from("companyIntegration")
        .select("companyId")
        .eq("metadata->>tenantId", tenantId)
        // @ts-ignore
        .eq("id", "xero")
        .single();

      if (companyIntegration.error || !companyIntegration.data?.companyId) {
        console.error(`No Xero integration found for tenant ${tenantId}`);
        errors.push({
          tenantId,
          error: "Integration not found",
        });
        continue;
      }

      const companyId = companyIntegration.data.companyId;

      // Group entities by type for efficient batch processing
      const entitiesToSync: Array<{
        entityType: "customer" | "vendor" | "invoice";
        entityId: string;
        operation: "create" | "update" | "delete";
      }> = [];

      for (const event of tenantEvents) {
        const { resourceId, eventCategory, eventType } = event;

        // Log each entity change for debugging
        console.log(
          `Xero ${eventType}: ${eventCategory} ${resourceId} (tenant: ${tenantId})`
        );

        // Map Xero entity types to our internal types
        if (eventCategory === "CONTACT") {
          // For contacts, we'll need to determine if it's a customer or vendor
          // during the sync process by checking the IsCustomer/IsSupplier flags
          // For now, we'll default to customer and let the sync job handle it
          entitiesToSync.push({
            entityType: "customer",
            entityId: resourceId,
            operation: eventType.toLowerCase() as
              | "create"
              | "update"
              | "delete",
          });
        } else if (eventCategory === "INVOICE") {
          entitiesToSync.push({
            entityType: "invoice",
            entityId: resourceId,
            operation: eventType.toLowerCase() as
              | "create"
              | "update"
              | "delete",
          });
        } else {
          console.log(`Skipping unsupported entity type: ${eventCategory}`);
        }
      }

      // Trigger background sync job if there are entities to process
      if (entitiesToSync.length > 0) {
        try {
          const jobHandle = await triggerAccountingSync(
            companyId,
            tenantId,
            entitiesToSync
          );
          syncJobs.push({
            id: jobHandle.id,
            companyId,
            tenantId,
            entityCount: entitiesToSync.length,
          });
        } catch (error) {
          console.error("Failed to trigger sync job:", error);
          errors.push({
            tenantId,
            error:
              error instanceof Error ? error.message : "Failed to trigger job",
          });
        }
      }
    } catch (error) {
      console.error("Error processing events for tenant:", tenantId, error);
      errors.push({
        tenantId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Return detailed response
  return json({
    success: errors.length === 0,
    jobsTriggered: syncJobs.length,
    jobs: syncJobs,
    errors: errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  });
}
