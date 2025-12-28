import "server-only";

import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { trialDevices } from "@/db/schema";
import { hmacSha256 } from "@/lib/security";

export async function isTrialDeviceKnown(deviceId: string) {
  const db = getDb();
  const deviceIdHash = hmacSha256(deviceId);
  const existing = await db.query.trialDevices.findFirst({
    where: eq(trialDevices.deviceIdHash, deviceIdHash),
  });

  if (existing) {
    return true;
  }

  return false;
}

export async function recordTrialDevice({
  deviceId,
  userId,
}: {
  deviceId: string;
  userId: string;
}) {
  const db = getDb();
  const deviceIdHash = hmacSha256(deviceId);
  await db.insert(trialDevices).values({
    id: nanoid(),
    deviceIdHash,
    firstUserId: userId,
    firstSeenAt: Date.now(),
  });
}
