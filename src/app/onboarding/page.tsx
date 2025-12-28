import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { getOrganizationProfile } from "@/lib/organization";
import { ProfileForm } from "@/components/profile-form";
import { completeOnboardingAction } from "./actions";

export default async function OnboardingPage() {
  const user = await requireUser();
  const profile = await getOrganizationProfile(user.id);

  if (profile) {
    redirect("/app/new");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
      <ProfileForm
        action={completeOnboardingAction}
        title="Viimeistele profiilisi"
        description="Lisää yrityksen tiedot, jotta voimme räätälöidä vastauskirjeet automaattisesti."
        submitLabel="Tallenna ja jatka"
      />
    </div>
  );
}
