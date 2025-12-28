import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { getDraftsForUser } from "@/lib/drafts";
import { getEntitlementSummary } from "@/lib/entitlement";
import { redirect } from "next/navigation";

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString("fi-FI", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function HistoryPage() {
  const user = await requireUser();
  const entitlement = await getEntitlementSummary(user.id);
  if (!entitlement.isEntitled) {
    redirect("/pricing");
  }
  const drafts = await getDraftsForUser(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Tallennetut vastaukset</h1>
        <p className="text-sm text-slate-600">
          Viimeisimmät Asiakasvastaukset.
        </p>
      </div>

      {drafts.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Ei vielä luonnoksia. Aloita valitsemalla tilanne sivulta &quot;Uusi&quot;.
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <Link
              key={draft.id}
              href={`/app/history/${draft.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  {draft.templateTitle}
                </h2>
                <span className="text-xs text-slate-500">
                  {formatDate(draft.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {draft.output.slice(0, 120)}
                {draft.output.length > 120 ? "…" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
