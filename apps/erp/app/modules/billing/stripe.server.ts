import { STRIPE_SECRET_KEY } from "@carbon/auth";
import Stripe from "stripe";

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export async function createCustomer(params: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Customer> {
  return await stripe.customers.create(params);
}

export async function createSubscription(params: {
  customer: string;
  items: Array<{
    price: string;
    quantity?: number;
  }>;
  trial_period_days?: number;
  metadata?: Record<string, string>;
}): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.create(params);
}

export async function createPaymentIntent(params: {
  amount: number;
  currency: string;
  customer?: string;
  setup_future_usage?: "on_session" | "off_session";
  metadata?: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.create(params);
}

export async function createSetupIntent(params: {
  customer: string;
  usage: "on_session" | "off_session";
  metadata?: Record<string, string>;
}): Promise<Stripe.SetupIntent> {
  return await stripe.setupIntents.create(params);
}

export async function updateSubscription(
  subscriptionId: string,
  params: Stripe.SubscriptionUpdateParams
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, params);
}

export async function cancelSubscription(
  subscriptionId: string,
  params?: { at_period_end?: boolean }
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.cancel(subscriptionId, params);
}

export async function getCustomer(
  customerId: string
): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
  return await stripe.customers.retrieve(customerId);
}

export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function getPaymentMethods(
  customerId: string
): Promise<Stripe.PaymentMethod[]> {
  const { data } = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });
  return data;
}

export async function detachPaymentMethod(
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> {
  return await stripe.paymentMethods.detach(paymentMethodId);
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}