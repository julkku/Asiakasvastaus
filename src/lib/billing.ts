import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { organizationProfiles } from "@/db/schema";
import { env } from "@/env";
import { getStripe } from "@/lib/stripe";

export type BillingEntity = {
  id: string;
  userId: string;
  companyName: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: number | null;
};

export function getAppUrl() {
  return env.APP_URL ?? env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function getBillingEntityForUser(userId: string) {
  const profile = await db.query.organizationProfiles.findFirst({
    where: eq(organizationProfiles.userId, userId),
  });
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    userId: profile.userId,
    companyName: profile.companyName,
    stripeCustomerId: profile.stripeCustomerId ?? null,
    stripeSubscriptionId: profile.stripeSubscriptionId ?? null,
    subscriptionStatus: profile.subscriptionStatus ?? null,
    currentPeriodEnd: profile.currentPeriodEnd ?? null,
  } satisfies BillingEntity;
}

export async function getOrCreateCustomer({
  billingEntity,
  userEmail,
}: {
  billingEntity: BillingEntity;
  userEmail: string;
}) {
  if (billingEntity.stripeCustomerId) {
    return billingEntity.stripeCustomerId;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: userEmail,
    name: billingEntity.companyName,
    metadata: {
      organizationProfileId: billingEntity.id,
      userId: billingEntity.userId,
    },
  });

  await updateBillingEntity(billingEntity.id, {
    stripeCustomerId: customer.id,
  });

  return customer.id;
}

export async function findBillingEntityByCustomerId(customerId: string) {
  const profile = await db.query.organizationProfiles.findFirst({
    where: eq(organizationProfiles.stripeCustomerId, customerId),
  });
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    userId: profile.userId,
    companyName: profile.companyName,
    stripeCustomerId: profile.stripeCustomerId ?? null,
    stripeSubscriptionId: profile.stripeSubscriptionId ?? null,
    subscriptionStatus: profile.subscriptionStatus ?? null,
    currentPeriodEnd: profile.currentPeriodEnd ?? null,
  } satisfies BillingEntity;
}

export async function updateBillingEntity(
  id: string,
  data: Partial<Pick<
    BillingEntity,
    | "stripeCustomerId"
    | "stripeSubscriptionId"
    | "subscriptionStatus"
    | "currentPeriodEnd"
  >>,
) {
  await db
    .update(organizationProfiles)
    .set({
      stripeCustomerId: data.stripeCustomerId,
      stripeSubscriptionId: data.stripeSubscriptionId,
      subscriptionStatus: data.subscriptionStatus,
      currentPeriodEnd: data.currentPeriodEnd,
    })
    .where(eq(organizationProfiles.id, id));
}

export function hasActiveSubscription(entity: BillingEntity | null) {
  if (!entity?.subscriptionStatus) {
    return false;
  }
  const status = entity.subscriptionStatus;
  if (status !== "active" && status !== "trialing") {
    return false;
  }
  if (!entity.currentPeriodEnd) {
    return true;
  }
  return entity.currentPeriodEnd > Date.now();
}
