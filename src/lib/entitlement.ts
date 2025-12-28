import "server-only";

import { getTrialStatus } from "@/lib/trial";
import { getEmailVerificationStatus } from "@/lib/email-verification";
import { getBillingEntityForUser } from "@/lib/billing";
import { hasActiveSubscription } from "@/lib/subscription";

export async function getEntitlementSummary(userId: string) {
  const trial = await getTrialStatus(userId);
  const emailStatus = await getEmailVerificationStatus(userId);
  const billingEntity = await getBillingEntityForUser(userId);
  const subscriptionActive = hasActiveSubscription(billingEntity);
  const isEntitled = trial.isActive || subscriptionActive;

  return {
    trial,
    subscription: {
      isActive: subscriptionActive,
      status: billingEntity?.subscriptionStatus ?? null,
      currentPeriodEnd: billingEntity?.currentPeriodEnd ?? null,
    },
    isEntitled,
    emailStatus,
  };
}

export async function assertEntitled(userId: string) {
  const summary = await getEntitlementSummary(userId);
  if (!summary.isEntitled) {
    throw new Error("PAYWALL");
  }
  return summary;
}

export async function assertCanGenerate(userId: string) {
  const summary = await getEntitlementSummary(userId);
  if (!summary.emailStatus.isVerified) {
    throw new Error("EMAIL_NOT_VERIFIED");
  }
  if (!summary.isEntitled) {
    throw new Error("PAYWALL");
  }
  return summary;
}

export async function isEmailNotVerifiedError(error: unknown) {
  return error instanceof Error && error.message === "EMAIL_NOT_VERIFIED";
}

export async function isPaywallError(error: unknown) {
  return error instanceof Error && error.message === "PAYWALL";
}
