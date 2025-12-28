import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { getAllTemplates } from "@/lib/templates";
import { getEntitlementSummary } from "@/lib/entitlement";
import { redirect } from "next/navigation";

export default async function NewDraftPage() {
  const user = await requireUser();
  const templateList = await getAllTemplates();
  const entitlement = await getEntitlementSummary(user.id);

  if (!entitlement.isEntitled) {
    redirect("/pricing");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">
          Valitse tilanne, johon haluat vastauksen
        </h1>
      </div>

      {!entitlement.emailStatus.isVerified ? (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          <p className="text-base font-semibold">Vahvista sähköpostisi.</p>
          <p className="mt-1">
            Tarkista sähköposti ja klikkaa vahvistuslinkkiä ennen palvelun
            käyttöä.
          </p>
        </div>
      ) : null}

      {!entitlement.isEntitled ? (
        <div className="rounded-2xl border border-dashed border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p className="text-base font-semibold">
            Käyttö vaatii aktiivisen tilauksen.
          </p>
          <p className="mt-1">
            Tilaa Asiakasvastaus jatkaaksesi käyttöä.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {templateList.map((template) => (
          <Link
            key={template.id}
            href={`/app/new/${template.key}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:ring-offset-2"
          >
            <h2 className="text-xl font-semibold text-slate-900">
              {template.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {template.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
