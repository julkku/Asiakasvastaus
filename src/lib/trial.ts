"use server";

import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { users } from "@/db/schema";

const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type TrialStatus = {
  isActive: boolean;
  daysLeft: number;
  endsAt: number | null;
};

export async function startTrialForUser(userId: string) {
  const now = Date.now();
  await db
    .update(users)
    .set({
      trialStartedAt: now,
      trialEndsAt: now + TRIAL_DURATION_MS,
    })
    .where(eq(users.id, userId));
}

export async function getTrialStatus(userId: string): Promise<TrialStatus> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      trialStartedAt: true,
      trialEndsAt: true,
    },
  });

  const endsAt = user?.trialEndsAt ?? null;
  if (!endsAt) {
    return { isActive: true, daysLeft: 7, endsAt: null };
  }

  const remainingMs = endsAt - Date.now();
  const daysLeft = Math.max(0, Math.ceil(remainingMs / DAY_IN_MS));

  return {
    isActive: remainingMs > 0,
    daysLeft,
    endsAt,
  };
}

export async function assertTrialActive(userId: string) {
  const status = await getTrialStatus(userId);
  if (!status.isActive) {
    throw new Error("Trial expired");
  }
  return status;
}

export async function isTrialExpiredError(error: unknown) {
  return error instanceof Error && error.message === "Trial expired";
}
