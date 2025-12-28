import "server-only";

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";

import {
  findBillingEntityByCustomerId,
  updateBillingEntity,
} from "@/lib/billing";
import { stripeClient } from "@/lib/stripe";
import { markStripeEventProcessed } from "@/lib/billing-service";
import { trackEvent } from "@/lib/usageEvents";

export const runtime = "nodejs";

async function applySubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  const billingEntity = await findBillingEntityByCustomerId(customerId);
  if (!billingEntity) {
    return;
  }
  const currentPeriodEnd = (subscription as { current_period_end?: number })
    .current_period_end;
  await updateBillingEntity(billingEntity.id, {
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    currentPeriodEnd: currentPeriodEnd ? currentPeriodEnd * 1000 : null,
  });
}

export async function POST(request: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response(
      "STRIPE_WEBHOOK_SECRET puuttuu. Webhook ei ole konfiguroitu.",
      { status: 500 },
    );
  }
  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return new Response("Missing Stripe signature", { status: 400 });
  }

  const rawBody = await request.text();
  let stripe;
  try {
    stripe = stripeClient();
  } catch (error) {
    console.error("stripe webhook config error", error);
    return new Response("Stripe ei ole konfiguroitu.", { status: 500 });
  }
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("stripe webhook signature verification failed", error);
    return new Response("Invalid signature", { status: 400 });
  }

  const shouldProcess = await markStripeEventProcessed(event.id);
  if (!shouldProcess) {
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (!session.customer || !session.subscription) {
          break;
        }
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId,
        );
        await applySubscriptionUpdate(subscription);
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer.id;
        if (customerId) {
          const billingEntity =
            await findBillingEntityByCustomerId(customerId);
          if (
            billingEntity &&
            (subscription.status === "active" ||
              subscription.status === "trialing")
          ) {
            void trackEvent({
              eventName: "subscription_started",
              userId: billingEntity.userId,
            });
          }
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await applySubscriptionUpdate(subscription);
        break;
      }
      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionValue = (
          invoice as { subscription?: string | Stripe.Subscription }
        ).subscription;
        if (!subscriptionValue) {
          break;
        }
        const subscriptionId =
          typeof subscriptionValue === "string"
            ? subscriptionValue
            : subscriptionValue.id;
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId,
        );
        await applySubscriptionUpdate(subscription);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("stripe webhook handling failed", error);
  }

  return NextResponse.json({ received: true });
}
