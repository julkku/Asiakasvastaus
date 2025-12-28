import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { getDraftById } from "@/lib/drafts";
import { CopyButton } from "./CopyButton";
import { getEntitlementSummary } from "@/lib/entitlement";

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString("fi-FI", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function DraftDetailPage({
  params,
}: {
  params: Promise<{ draftId?: string }>;
}) {
  const user = await requireUser();
  const entitlement = await getEntitlementSummary(user.id);
  const resolvedParams = await params;
  if (!resolvedParams?.draftId) {
    notFound();
  }
  const draft = await getDraftById(user.id, resolvedParams.draftId);

  if (!draft) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {!entitlement.isEntitled ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Käyttö vaatii aktiivisen tilauksen. Tilaa profiilista jatkaaksesi.
        </div>
      ) : null}
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">
          {draft.templateTitle}
        </h1>
        <p className="text-sm text-slate-600">
          Luotu {formatDate(draft.createdAt)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Asiakasvastaus
            </h2>
            <CopyButton text={draft.output} />
          </div>
          <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-800">
            <p className="whitespace-pre-line">{draft.output}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
