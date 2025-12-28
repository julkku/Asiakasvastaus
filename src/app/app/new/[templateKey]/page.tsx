import { notFound } from "next/navigation";

import { getOrganizationProfile } from "@/lib/organization";
import { requireUser } from "@/lib/auth";
import { getTemplateByKey } from "@/lib/templates";
import { TemplateFormClient } from "./TemplateFormClient";
import { getEntitlementSummary } from "@/lib/entitlement";
import { trackEvent } from "@/lib/usageEvents";

export default async function TemplateFormPage({
  params,
}: {
  params: Promise<{ templateKey?: string }>;
}) {
  const user = await requireUser();
  const resolvedParams = await params;
  if (!resolvedParams?.templateKey) {
    notFound();
  }
  const template = await getTemplateByKey(resolvedParams.templateKey);

  if (!template) {
    notFound();
  }

  const profile = await getOrganizationProfile(user.id);
  if (!profile) {
    redirect("/onboarding");
  }

  const entitlement = await getEntitlementSummary(user.id);
  const clientEntitlement = {
    isEntitled: entitlement.isEntitled,
    trialStatus: entitlement.trial,
    isEmailVerified: entitlement.emailStatus.isVerified,
  };

  void trackEvent({
    eventName: "card_clicked",
    userId: user.id,
    context: { cardKey: template.key },
  });

  return (
    <TemplateFormClient
      templateKey={template.key}
      title={template.title}
      description={template.description}
      fields={template.fields}
      entitlement={clientEntitlement}
    />
  );
}
