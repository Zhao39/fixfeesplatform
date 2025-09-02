import { getCarbonServiceRole } from "@carbon/auth";

import type { ActionFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import crypto from "crypto";
import { z } from "zod";

export const config = {
  runtime: "nodejs",
};

const integrationValidator = z.object({
  webhookToken: z.string(),
});

function verifyQuickBooksSignature(
  payload: string,
  signature: string,
  webhookToken: string
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", webhookToken)
    .update(payload)
    .digest("base64");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const serviceRole = await getCarbonServiceRole();

  const payload = await request.json();
  console.log({ payload });

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
  //   const signatureHeader = request.headers.get("intuit-signature");

  //   if (!signatureHeader) {
  //     return json({ success: false }, { status: 401 });
  //   }

  //   if (
  //     !verifyQuickBooksSignature(payloadText, signatureHeader, webhookToken)
  //   ) {
  //     return json({ success: false }, { status: 401 });
  //   }

  //   const payload = JSON.parse(payloadText);
  //   console.log("QuickBooks webhook payload", payload);

  //   await tasks.trigger<typeof quickbooksTask>("quickbooks", {
  //     companyId,
  //     payload,
  //   });

  return json({ success: true });
}
