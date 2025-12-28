import { notFound, redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { getDraftById } from "@/lib/drafts";
import { CopyButton } from "./CopyButton";
import { getEntitlementSummary } from "@/lib/entitlement";

function prettyPrintInput(jsonString: string) {
  try {
    return JSON.stringify(JSON.parse(jsonString), null, 2);
  } catch {
    return jsonString;
  }
}

function parseInputObject(jsonString: string) {
  try {
    const parsed = JSON.parse(jsonString) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

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
  if (!entitlement.isEntitled) {
    redirect("/pricing");
  }
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
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          {draft.templateKey}
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          {draft.templateTitle}
        </h1>
        <p className="text-sm text-slate-600">
          Luotu {formatDate(draft.createdAt)} · Malli {draft.model}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Syötetiedot</h2>
          {(() => {
            const parsed = parseInputObject(draft.input);
            const message =
              parsed && typeof parsed.customerMessage === "string"
                ? parsed.customerMessage.trim()
                : "";
            if (!message) {
              return null;
            }
            return (
              <div className="mt-3 rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-800">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Asiakkaan viesti
                </p>
                <p className="mt-2 whitespace-pre-line">{message}</p>
              </div>
            );
          })()}
          <pre className="mt-3 whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm text-slate-700">
            {(() => {
              const parsed = parseInputObject(draft.input);
              if (parsed && "customerMessage" in parsed) {
                const rest = { ...parsed };
                delete rest.customerMessage;
                return JSON.stringify(rest, null, 2);
              }
              return prettyPrintInput(draft.input);
            })()}
          </pre>
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Generoitu vastaus
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
