import { requireUser } from "@/lib/auth";
import { getOrganizationProfile } from "@/lib/organization";
import { ProfileForm } from "@/components/profile-form";
import { saveProfileAction } from "./actions";
import { getEntitlementSummary } from "@/lib/entitlement";
import { DevEmailVerificationPanel } from "@/components/dev-email-verification-panel";
import { getDevEmailVerificationMode } from "@/lib/dev-email-verification";
import { getBillingEntityForUser } from "@/lib/billing";
import { isStripeConfigured } from "@/lib/stripe";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; billing?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const profile = await getOrganizationProfile(user.id);
  const entitlement = await getEntitlementSummary(user.id);
  const billingEntity = await getBillingEntityForUser(user.id);
  const stripeEnabled = isStripeConfigured();
  const devMode = getDevEmailVerificationMode();

  return (
    <div className="space-y-6">
      {params?.saved ? (
        <div className="max-w-2xl rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm">
          Profiili päivitetty onnistuneesti.
        </div>
      ) : null}
      {params?.billing === "active" ? (
        <div className="max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">
          Tilaus on jo aktiivinen.
        </div>
      ) : null}
      <DevEmailVerificationPanel
        isVerified={entitlement.emailStatus.isVerified}
        mode={devMode}
      />
      <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Tilaus</h2>
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          {entitlement.subscription.isActive ? (
            <p className="text-emerald-700">Tilaus on aktiivinen.</p>
          ) : entitlement.trial.isActive ? (
            <p>
              Ilmainen kokeilu on käynnissä, {entitlement.trial.daysLeft}{" "}
              {entitlement.trial.daysLeft === 1 ? "päivä" : "päivää"} jäljellä.
            </p>
          ) : (
            <p className="text-red-700">
              Ilmainen kokeilu on päättynyt. Tilaa jatkaaksesi käyttöä.
            </p>
          )}
        </div>

        {stripeEnabled ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {!entitlement.subscription.isActive ? (
              <a
                href="/pricing"
                className="rounded-md bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-black/90"
              >
                Tilaa
              </a>
            ) : null}
            {billingEntity?.stripeCustomerId ? (
              <form action="/api/billing/portal" method="post">
                <button
                  type="submit"
                  className="rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-slate-100"
                >
                  Hallinnoi tilausta
                </button>
              </form>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-xs text-slate-500">
            Maksullisuus ei ole vielä käytössä tässä ympäristössä.
          </p>
        )}
      </div>

      <ProfileForm
        action={saveProfileAction}
        defaultValues={{
          companyName: profile?.companyName ?? "",
          teitittely: profile?.teitittely ?? false,
          defaultTone: profile?.defaultTone ?? "NEUTRAALI",
          industry: profile?.industry ?? "MUU",
          communicationRole: profile?.communicationRole ?? "ASIAKASPALVELU",
          refundPolicy: profile?.refundPolicy ?? "EI_LUVATA",
          cautionLevel: profile?.cautionLevel ?? "TASAPAINOINEN",
          forbiddenPhrases: profile?.forbiddenPhrases ?? [],
          signature: profile?.signature ?? "",
        }}
        title="Organisaatioprofiili"
        description="Nämä tiedot vaikuttavat jokaiseen Asiakasvastaukseen."
        submitLabel="Tallenna muutokset"
      />
    </div>
  );
}
