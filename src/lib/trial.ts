"use server";

import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { users } from "@/db/schema";

const TRIAL_DURATION_MS = 3 * 24 * 60 * 60 * 1000;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type TrialStatus = {
  isActive: boolean;
  daysLeft: number;
  endsAt: number | null;
};

export async function startTrialForUser(userId: string) {
  const db = getDb();
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
  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      trialStartedAt: true,
      trialEndsAt: true,
    },
  });

  const endsAt = user?.trialEndsAt ?? null;
  const startedAt = user?.trialStartedAt ?? null;
  const derivedEndsAt =
    !endsAt && startedAt ? startedAt + TRIAL_DURATION_MS : null;
  const resolvedEndsAt = endsAt ?? derivedEndsAt;
  if (!resolvedEndsAt) {
    return { isActive: false, daysLeft: 0, endsAt: null };
  }

  const remainingMs = resolvedEndsAt - Date.now();
  const daysLeft = Math.max(0, Math.ceil(remainingMs / DAY_IN_MS));

  return {
    isActive: remainingMs > 0,
    daysLeft,
    endsAt: resolvedEndsAt,
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
