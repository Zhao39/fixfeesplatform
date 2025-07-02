import { STRIPE_WEBHOOK_SECRET } from "@carbon/auth";
import { getCarbonServiceRole } from "@carbon/auth/auth.server";
import type { ActionFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import Stripe from "stripe";
import { 
  constructWebhookEvent, 
  updateCompanyPlan,
  createBillingEvent 
} from "~/modules/billing";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = constructWebhookEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return json({ error: "Invalid signature" }, { status: 400 });
  }

  const client = getCarbonServiceRole();

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const companyId = subscription.metadata.companyId;

        if (companyId) {
          await updateCompanyPlan(client, companyId, {
            stripeSubscriptionStatus: subscription.status,
            updatedAt: new Date().toISOString(),
          });

          await createBillingEvent(client, {
            companyId,
            eventType: event.type,
            stripeEventId: event.id,
            metadata: {
              subscriptionId: subscription.id,
              status: subscription.status,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const companyId = subscription.metadata.companyId;

        if (companyId) {
          await updateCompanyPlan(client, companyId, {
            stripeSubscriptionStatus: "canceled",
            updatedAt: new Date().toISOString(),
          });

          await createBillingEvent(client, {
            companyId,
            eventType: event.type,
            stripeEventId: event.id,
            metadata: {
              subscriptionId: subscription.id,
              status: "canceled",
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const companyId = invoice.subscription_details?.metadata?.companyId;

        if (companyId && invoice.amount_paid) {
          await createBillingEvent(client, {
            companyId,
            eventType: event.type,
            stripeEventId: event.id,
            amount: invoice.amount_paid / 100, // Convert from cents
            currency: invoice.currency,
            metadata: {
              invoiceId: invoice.id,
              subscriptionId: invoice.subscription,
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const companyId = invoice.subscription_details?.metadata?.companyId;

        if (companyId) {
          await createBillingEvent(client, {
            companyId,
            eventType: event.type,
            stripeEventId: event.id,
            amount: invoice.amount_due / 100, // Convert from cents
            currency: invoice.currency,
            metadata: {
              invoiceId: invoice.id,
              subscriptionId: invoice.subscription,
              attemptCount: invoice.attempt_count,
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return json({ error: "Webhook processing failed" }, { status: 500 });
  }
}