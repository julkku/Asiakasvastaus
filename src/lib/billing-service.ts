import "server-only";

import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { organizationProfiles, stripeEvents } from "@/db/schema";
import { stripeClient, appUrl } from "@/lib/stripe";

export async function getOrCreateStripeCustomer({
  billingEntityId,
  email,
}: {
  billingEntityId: string;
  email?: string | null;
}) {
  const entity = await db.query.organizationProfiles.findFirst({
    where: eq(organizationProfiles.id, billingEntityId),
  });

  if (!entity) {
    throw new Error("Billing-entityä ei löytynyt.");
  }

  if (entity.stripeCustomerId) {
    return entity.stripeCustomerId;
  }

  const stripe = stripeClient();
  const customer = await stripe.customers.create({
    email: email ?? undefined,
    name: entity.companyName,
    metadata: {
      organizationProfileId: entity.id,
      userId: entity.userId,
    },
  });

  await db
    .update(organizationProfiles)
    .set({ stripeCustomerId: customer.id })
    .where(eq(organizationProfiles.id, entity.id));

  return customer.id;
}

export async function createCheckoutSession({
  customerId,
  billingEntityId,
}: {
  customerId: string;
  billingEntityId?: string;
}) {
  const stripe = stripeClient();
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    throw new Error("Missing STRIPE_PRICE_ID");
  }

  const base = appUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${base}/billing/success`,
    cancel_url: `${base}/billing/cancelled`,
    allow_promotion_codes: false,
    client_reference_id: billingEntityId,
  });

  if (!session.url) {
    throw new Error("Stripe session missing url");
  }

  return session.url;
}

export async function createBillingPortalSession({
  customerId,
  returnPath = "/settings",
}: {
  customerId: string;
  returnPath?: string;
}) {
  const stripe = stripeClient();
  const base = appUrl();
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${base}${returnPath}`,
  });

  if (!portal.url) {
    throw new Error("Stripe portal missing url");
  }

  return portal.url;
}

export async function markStripeEventProcessed(eventId: string) {
  try {
    await db.insert(stripeEvents).values({
      id: nanoid(),
      eventId,
      createdAt: Date.now(),
    });
    return true;
  } catch (error) {
    const message = String(error);
    if (message.includes("UNIQUE constraint failed")) {
      return false;
    }
    throw error;
  }
}
