import { getCarbonServiceRole, QUICKBOOKS_WEBHOOK_SECRET } from "@carbon/auth";

import type { ActionFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import crypto from "crypto";
import { z } from "zod";

export const config = {
  runtime: "nodejs",
};

const quickbooksEventValidator = z.object({
  eventNotifications: z.array(
    z.object({
      realmId: z.string(),
      dataChangeEvent: z.object({
        entities: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            operation: z.enum(["Create", "Update", "Delete"]),
          })
        ),
      }),
    })
  ),
});

function verifyQuickBooksSignature(
  payload: string,
  signature: string
): boolean {
  if (!QUICKBOOKS_WEBHOOK_SECRET) {
    console.warn("QUICKBOOKS_WEBHOOK_SECRET is not set");
    return true;
  }

  const expectedSignature = crypto
    .createHmac("sha256", QUICKBOOKS_WEBHOOK_SECRET)
    .update(payload)
    .digest("base64");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const serviceRole = await getCarbonServiceRole();

  const payload = await request.clone().json();

  const parsedPayload = quickbooksEventValidator.safeParse(payload);
  if (!parsedPayload.success) {
    return json({ success: false }, { status: 400 });
  }

  const payloadText = await request.text();
  const signatureHeader = request.headers.get("intuit-signature");

  if (!signatureHeader) {
    return json({ success: false }, { status: 401 });
  }

  const requestIsValid = verifyQuickBooksSignature(
    payloadText,
    signatureHeader
  );

  if (!requestIsValid) {
    return json({ success: false }, { status: 401 });
  }

  const events = parsedPayload.data.eventNotifications;
  for await (const event of events) {
    const { realmId, dataChangeEvent } = event;

    const companyIntegration = await serviceRole
      .from("companyIntegration")
      .select("*")
      .eq("metadata->>tenantId", realmId)
      .eq("id", "quickbooks")
      .single();

    console.log({ companyIntegration });

    const { entities } = dataChangeEvent;
    for await (const entity of entities) {
      const { id, name, operation } = entity;
      console.log({ realmId, id, name, operation });
    }
  }

  // const quickbooksIntegration = await serviceRole
  //   .from("companyIntegration")
  //   .select("*")
  //   .eq("metadata->>tenantId", realmId)
  //   .eq("id", "quickbooks")
  //   .single();

  // try {
  //   const { webhookToken } = integrationValidator.parse(
  //     quickbooksIntegration.data.metadata
  //   );

  //   const payloadText = await request.text();
  //

  //   const payload = JSON.parse(payloadText);
  //   console.log("QuickBooks webhook payload", payload);

  //   await tasks.trigger<typeof quickbooksTask>("quickbooks", {
  //     companyId,
  //     payload,
  //   });

  return json({ success: true });
}
