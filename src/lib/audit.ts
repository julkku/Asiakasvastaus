"use server";

import "server-only";

import { nanoid } from "nanoid";

import { db } from "@/db/client";
import { auditEvents } from "@/db/schema";

export async function createAuditEvent({
  userId,
  type,
  metadata,
}: {
  userId: string;
  type: string;
  metadata: Record<string, unknown>;
}) {
  await db.insert(auditEvents).values({
    id: nanoid(),
    userId,
    type,
    metadata: JSON.stringify(metadata),
    createdAt: Date.now(),
  });
}
