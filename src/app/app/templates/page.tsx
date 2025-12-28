import { getAllTemplates } from "@/lib/templates";
import { requireUser } from "@/lib/auth";
import { getEntitlementSummary } from "@/lib/entitlement";

export default async function TemplatesPage() {
  const user = await requireUser();
  const entitlement = await getEntitlementSummary(user.id);
  const templateList = await getAllTemplates();

  return (
    <div className="space-y-6">
      {!entitlement.isEntitled ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Käyttö vaatii aktiivisen tilauksen. Tilaa profiilista jatkaaksesi.
        </div>
      ) : null}
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">
          Mallipohjat
        </h1>
        <p className="text-sm text-slate-600">
          Kaikki valmiit tilanteet ja niihin kuuluvat kentät.
        </p>
      </div>

      <div className="space-y-4">
        {templateList.map((template) => (
          <div
            key={template.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {template.key}
                </p>
                <h2 className="text-xl font-semibold text-slate-900">
                  {template.title}
                </h2>
              </div>
              <span className="text-xs text-slate-500">
                {template.fields.length} kenttää
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {template.description}
            </p>
            <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
              {template.fields.map((field) => (
                <div
                  key={field.key}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                >
                  <p className="font-medium text-slate-900">{field.label}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    {field.type} {field.required ? "· pakollinen" : ""}
                  </p>
                  {field.helpText ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {field.helpText}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
