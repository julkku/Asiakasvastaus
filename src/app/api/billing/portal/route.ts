"use server";

import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { appUrl } from "@/lib/stripe";
import {
  createBillingPortalSession,
} from "@/lib/billing-service";
import { getBillingEntityForUser } from "@/lib/billing";

export async function POST() {
  const user = await requireUser();
  const billingEntity = await getBillingEntityForUser(user.id);
  if (!billingEntity?.stripeCustomerId) {
    return NextResponse.redirect(new URL("/pricing", appUrl()), 303);
  }

  const url = await createBillingPortalSession({
    customerId: billingEntity.stripeCustomerId,
    returnPath: "/app/profile",
  });

  return NextResponse.redirect(url, 303);
}
