"use server";

import { requireUser } from "@/lib/auth";
import { upsertOrganizationProfile } from "@/lib/organization"; 
import { parseProfileForm } from "@/lib/organization";

export async function saveOrganizationProfileAction(formData: FormData) {
  const user = await requireUser();

  const parsed = parseProfileForm(formData);
  if (!parsed.success) {
    return { ok: false as const, error: "Tarkista kentät ja yritä uudelleen." };
  }

  await upsertOrganizationProfile(user.id, parsed.data);

  return { ok: true as const };
}
