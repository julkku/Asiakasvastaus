"use server";

import { redirect } from "next/navigation";

import { getDefaultModel } from "@/lib/ai/generateReply";
import { createAuditEvent } from "@/lib/audit";
import { createDraft } from "@/lib/drafts";
import { requireUser } from "@/lib/auth";
import { getTemplateByKey } from "@/lib/templates";

type SaveDraftPayload = {
  templateKey: string;
  input: Record<string, string>;
  output: string;
  model?: string;
};

export async function saveDraftAction({
  templateKey,
  input,
  output,
  model,
}: SaveDraftPayload) {
  const user = await requireUser();
  const template = await getTemplateByKey(templateKey);
  if (!template) {
    throw new Error("Mallipohjaa ei löytynyt.");
  }

  if (!output?.trim()) {
    throw new Error("Luonnosta ei voi tallentaa ilman sisältöä.");
  }

  const fallbackModel = await getDefaultModel();
  const draftId = await createDraft({
    userId: user.id,
    templateId: template.id,
    input,
    output,
    model: model ?? fallbackModel,
  });

  await createAuditEvent({
    userId: user.id,
    type: "AI_DRAFT_CREATED",
      metadata: {
        templateKey: template.key,
        model: model ?? fallbackModel,
      },
  });

  redirect(`/app/history/${draftId}`);
}
