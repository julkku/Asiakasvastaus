import Link from "next/link";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { getEntitlementSummary } from "@/lib/entitlement";
import { isStripeConfigured } from "@/lib/stripe";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const user = await requireUser();
  const entitlement = await getEntitlementSummary(user.id);
  const stripeEnabled = isStripeConfigured();

  if (params?.from !== "profile") {
    redirect(entitlement.isEntitled ? "/app/new" : "/app/profile");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Hinnoittelu
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Jatka Asiakasvastauksen käyttöä
          </h1>
          <p className="text-sm text-slate-600">
            Yksi selkeä paketti, kuukausilaskutus.
          </p>
        </header>

        {!stripeEnabled ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Stripe-avaimia ei ole asetettu. Maksaminen ei ole käytössä tässä
            ympäristössä.
          </div>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Asiakasvastaus
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Kaikki ominaisuudet, rajaton käyttö.
              </p>
              {entitlement.subscription.isActive ? (
                <span className="mt-3 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                  Tilaus aktiivinen
                </span>
              ) : null}
            </div>
            <div className="text-left sm:text-right">
              <p className="text-3xl font-semibold text-slate-900">14,99 €</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                / kk
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <form action="/api/billing/checkout" method="post">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-md bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={!stripeEnabled || entitlement.subscription.isActive}
              >
                {entitlement.subscription.isActive
                  ? "Tilaus on aktiivinen"
                  : "Tilaa nyt"}
              </button>
            </form>
            {entitlement.isEntitled ? (
              <Link
                href="/app/new"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Palaa sovellukseen
              </Link>
            ) : (
              <Link
                href="/app/profile"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Siirry profiiliin
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
