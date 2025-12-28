"use server";

import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { db } from "@/db/client";
import { drafts, templates } from "@/db/schema";

export async function createDraft({
  userId,
  templateId,
  input,
  output,
  model,
}: {
  userId: string;
  templateId: string;
  input: Record<string, string>;
  output: string;
  model: string;
}) {
  const id = nanoid();
  await db.insert(drafts).values({
    id,
    userId,
    templateId,
    input: JSON.stringify(input),
    output,
    model,
    createdAt: Date.now(),
  });
  return id;
}

export async function getDraftsForUser(userId: string) {
  return db
    .select({
      id: drafts.id,
      createdAt: drafts.createdAt,
      output: drafts.output,
      model: drafts.model,
      templateTitle: templates.title,
      templateKey: templates.key,
    })
    .from(drafts)
    .innerJoin(templates, eq(drafts.templateId, templates.id))
    .where(eq(drafts.userId, userId))
    .orderBy(desc(drafts.createdAt));
}

export async function getDraftById(userId: string, draftId: string) {
  const [result] = await db
    .select({
      id: drafts.id,
      createdAt: drafts.createdAt,
      input: drafts.input,
      output: drafts.output,
      model: drafts.model,
      templateTitle: templates.title,
      templateKey: templates.key,
    })
    .from(drafts)
    .innerJoin(templates, eq(drafts.templateId, templates.id))
    .where(and(eq(drafts.userId, userId), eq(drafts.id, draftId)));

  return result ?? null;
}
