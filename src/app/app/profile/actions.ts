"use server";

import { requireUser } from "@/lib/auth";
import { parseProfileForm, upsertOrganizationProfile } from "@/lib/organization";
import type { ProfileFormState } from "@/lib/profile-form-state";
import { redirect } from "next/navigation";
import {
  createEmailVerification,
} from "@/lib/email-verification";
import {
  getDevEmailVerificationMode,
  isDevEmailVerificationEnabled,
} from "@/lib/dev-email-verification";
import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function saveProfileAction(
  _: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await requireUser();
  const parsed = parseProfileForm(formData);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Virhe lomakkeessa.",
    };
  }

  await upsertOrganizationProfile(user.id, parsed.data);
  redirect("/app/profile?saved=1");
  return {};
}

type DevVerificationState = {
  error?: string;
  link?: string;
  success?: string;
};

export async function createDevVerificationLinkAction(): Promise<DevVerificationState> {
  const user = await requireUser();
  const mode = getDevEmailVerificationMode();

  if (!isDevEmailVerificationEnabled() || mode !== "link") {
    return { error: "DEV-vahvistus ei ole käytössä." };
  }

  const link = await createEmailVerification(user.id, user.email);
  if (!link) {
    return { error: "Vahvistuslinkkiä ei voitu luoda." };
  }

  return { link };
}

export async function devVerifyNowAction(): Promise<DevVerificationState> {
  const user = await requireUser();
  const mode = getDevEmailVerificationMode();

  if (!isDevEmailVerificationEnabled() || mode !== "button") {
    return { error: "DEV-vahvistus ei ole käytössä." };
  }

  const now = Date.now();
  const db = getDb();
  await db
    .update(users)
    .set({ emailVerifiedAt: now })
    .where(eq(users.id, user.id));

  return { success: "Sähköposti vahvistettu (DEV)." };
}
