import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { getEntitlementSummary } from "@/lib/entitlement";
import { isStripeConfigured } from "@/lib/stripe";

export default async function PricingPage() {
  const user = await requireUser();
  const entitlement = await getEntitlementSummary(user.id);
  const stripeEnabled = isStripeConfigured();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Hinnoittelu
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Jatka Asiakasvastauksen käyttöä
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Yksi selkeä paketti, kuukausilaskutus.
        </p>
      </div>

      {!stripeEnabled ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Stripe-avaimia ei ole asetettu. Maksaminen ei ole käytössä tässä
          ympäristössä.
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Asiakasvastaus
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Kaikki ominaisuudet, rajaton käyttö.
            </p>
          </div>
          <div className="text-right">
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
          <Link
            href="/app/new"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Palaa sovellukseen
          </Link>
        </div>
      </div>
    </div>
  );
}
