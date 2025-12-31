import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getOrganizationProfile } from "@/lib/organization";
import { env } from "@/env";
import { appUrl, isStripeConfigured, stripeClient } from "@/lib/stripe";
import {
  createCheckoutSession,
  getOrCreateStripeCustomer,
} from "@/lib/billing-service";
import { getBillingEntityForUser } from "@/lib/billing";
import { hasActiveSubscription } from "@/lib/subscription";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  if (!isStripeConfigured() || !env.STRIPE_PRICE_ID) {
    return new Response("Stripe ei ole konfiguroitu.", { status: 400 });
  }

  const user = await requireUser();
  const billingEntity = await getBillingEntityForUser(user.id);
  if (hasActiveSubscription(billingEntity)) {
    return NextResponse.redirect(
      new URL("/app/profile?billing=active", appUrl()),
      303,
    );
  }

  const profile = await getOrganizationProfile(user.id);
  if (!profile) {
    return NextResponse.redirect(new URL("/onboarding", appUrl()), 303);
  }

  if (billingEntity?.stripeCustomerId) {
    const stripe = stripeClient();
    const subscriptions = await stripe.subscriptions.list({
      customer: billingEntity.stripeCustomerId,
      status: "all",
      limit: 1,
    });
    const hasExisting = subscriptions.data.some((subscription) =>
      ["active", "trialing", "past_due", "unpaid", "incomplete"].includes(
        subscription.status,
      ),
    );
    if (hasExisting) {
      return NextResponse.redirect(
        new URL("/app/profile?billing=active", appUrl()),
        303,
      );
    }
  }

  const customerId = await getOrCreateStripeCustomer({
    billingEntityId: profile.id,
    email: user.email,
  });

  const url = await createCheckoutSession({
    customerId,
    billingEntityId: profile.id,
  });

  return NextResponse.redirect(url, 303);
}
