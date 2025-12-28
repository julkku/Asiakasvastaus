import "server-only";

import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { registrationIpLimits } from "@/db/schema";
import { hmacSha256 } from "@/lib/security";

const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;

export async function checkRegistrationThrottle(ip: string | null) {
  const db = getDb();
  if (!ip) {
    return { allowed: true };
  }

  const ipHash = hmacSha256(ip);
  const existing = await db.query.registrationIpLimits.findFirst({
    where: eq(registrationIpLimits.ipHash, ipHash),
  });

  const now = Date.now();

  if (!existing || now - existing.windowStart > WINDOW_MS) {
    await db
      .insert(registrationIpLimits)
      .values({
        id: nanoid(),
        ipHash,
        windowStart: now,
        count: 1,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: registrationIpLimits.ipHash,
        set: {
          windowStart: now,
          count: 1,
          updatedAt: now,
        },
      });
    return { allowed: true };
  }

  const nextCount = existing.count + 1;
  await db
    .update(registrationIpLimits)
    .set({ count: nextCount, updatedAt: now })
    .where(eq(registrationIpLimits.id, existing.id));

  if (nextCount > MAX_PER_WINDOW) {
    return { allowed: false };
  }

  return { allowed: true };
}
