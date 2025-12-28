import "server-only";

import Stripe from "stripe";

import { env } from "@/env";

let stripeClientInstance: Stripe | null = null;

export function stripeClient() {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }
  if (!stripeClientInstance) {
    stripeClientInstance = new Stripe(key, {
      apiVersion: "2024-06-20" as Stripe.LatestApiVersion,
    });
  }
  return stripeClientInstance;
}

export function appUrl() {
  return (
    env.APP_URL ??
    env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function getStripe() {
  return stripeClient();
}

export function isStripeConfigured() {
  return Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_ID);
}

export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  billingEntityId,
}: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  billingEntityId?: string;
}) {
  const stripe = stripeClient();
  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: billingEntityId,
  });
}

export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const stripe = stripeClient();
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export function getStripeWebhookSecret() {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET");
  }
  return env.STRIPE_WEBHOOK_SECRET;
}
