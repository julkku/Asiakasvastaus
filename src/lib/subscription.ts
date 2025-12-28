export function hasActiveSubscription(entity: {
  subscriptionStatus?: string | null;
  currentPeriodEnd?: number | null;
} | null) {
  const status = entity?.subscriptionStatus;
  if (status !== "active" && status !== "trialing") {
    return false;
  }
  const periodEnd = entity?.currentPeriodEnd ?? null;
  if (!periodEnd) {
    return true;
  }
  return periodEnd > Date.now();
}
