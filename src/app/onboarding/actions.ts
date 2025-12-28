"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import {
  parseProfileForm,
  upsertOrganizationProfile,
} from "@/lib/organization";
import type { ProfileFormState } from "@/lib/profile-form-state";

export async function completeOnboardingAction(
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
  redirect("/app/new");
  return {};
}
