import "server-only";

import { nanoid } from "nanoid";

import { getDb } from "@/db/client";
import { usageEvents } from "@/db/schema";

type UsageEventInput = {
  eventName: string;
  userId?: string | null;
  context?: Record<string, string>;
};

export async function trackEvent({
  eventName,
  userId,
  context,
}: UsageEventInput) {
  try {
    const db = getDb();
    const sanitizedContext = context
      ? JSON.stringify(context)
      : null;

    await db.insert(usageEvents).values({
      id: nanoid(),
      eventName,
      userId: userId ?? null,
      context: sanitizedContext,
      createdAt: Date.now(),
    });
  } catch (error) {
    console.error("usage event tracking failed", error);
  }
}
