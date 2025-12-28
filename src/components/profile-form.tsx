"use client";

import { useActionState } from "react";

import type { ProfileFormState } from "@/lib/profile-form-state";
import { toneOptions } from "@/lib/constants";
import {
  cautionLevelOptions,
  communicationRoleOptions,
  getCautionLevelLabel,
  getCommunicationRoleLabel,
  getIndustryLabel,
  getRefundPolicyLabel,
  industryOptions,
  refundPolicyOptions,
} from "@/lib/organization-profile-constants";

type ProfileFormProps = {
  action: (
    state: ProfileFormState,
    formData: FormData,
  ) => Promise<ProfileFormState>;
  defaultValues?: {
    companyName?: string | null;
    teitittely?: boolean | null;
    defaultTone?: string | null;
    industry?: string | null;
    communicationRole?: string | null;
    refundPolicy?: string | null;
    cautionLevel?: string | null;
    forbiddenPhrases?: string[] | null;
    signature?: string | null;
  };
  title: string;
  description?: string;
  submitLabel: string;
};

const initialState: ProfileFormState = {};

export function ProfileForm({
  action,
  defaultValues,
  title,
  description,
  submitLabel,
}: ProfileFormProps) {
  const [state, dispatch] = useActionState(action, initialState);

  return (
    <div className="max-w-2xl space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description ? (
          <p className="text-sm text-slate-900">{description}</p>
        ) : null}
      </div>

      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
          {state.success}
        </p>
      ) : null}

      <form action={dispatch} className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-slate-900">
            Yrityksen nimi
          </label>
          <input
            name="companyName"
            defaultValue={defaultValues?.companyName ?? ""}
            required
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
          <input
            id="teitittely"
            name="teitittely"
            type="checkbox"
            defaultChecked={Boolean(defaultValues?.teitittely)}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <label htmlFor="teitittely" className="text-sm font-medium text-slate-900">
            Käytä teitittelyä (muuten sinutellaan).
          </label>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Sävy</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {toneOptions.map((tone) => (
              <label
                key={tone}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
              >
                <input
                  type="radio"
                  name="defaultTone"
                  value={tone}
                  defaultChecked={
                    defaultValues?.defaultTone
                      ? defaultValues.defaultTone === tone
                      : tone === "NEUTRAALI"
                  }
                  className="text-slate-900 focus:ring-slate-900"
                />
                <span>
                  {tone === "RAUHOITTAVA"
                    ? "Rauhoittava"
                    : tone === "NEUTRAALI"
                      ? "Neutraali"
                      : "Jämäkkä"}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-900">
            Allekirjoitus
          </label>
          <textarea
            name="signature"
            required
            defaultValue={defaultValues?.signature ?? ""}
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-800">
            Esim. &quot;Ystävällisin terveisin, Anna / Asiakasvastaus&quot;
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-900">
            Toimiala
          </label>
          <select
            name="industry"
            defaultValue={defaultValues?.industry ?? "MUU"}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none"
          >
            {industryOptions.map((option) => (
              <option key={option} value={option}>
                {getIndustryLabel(option)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-900">
            Viestinnän rooli
          </label>
          <select
            name="communicationRole"
            defaultValue={defaultValues?.communicationRole ?? "ASIAKASPALVELU"}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none"
          >
            {communicationRoleOptions.map((option) => (
              <option key={option} value={option}>
                {getCommunicationRoleLabel(option)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">Hyvityslinja</p>
          <div className="mt-2 grid gap-2">
            {refundPolicyOptions.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
              >
                <input
                  type="radio"
                  name="refundPolicy"
                  value={option}
                  defaultChecked={
                    defaultValues?.refundPolicy
                      ? defaultValues.refundPolicy === option
                      : option === "EI_LUVATA"
                  }
                  className="mt-1 text-slate-900 focus:ring-slate-900"
                />
                <span>{getRefundPolicyLabel(option)}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">
            Varovaisuustaso
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {cautionLevelOptions.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900"
              >
                <input
                  type="radio"
                  name="cautionLevel"
                  value={option}
                  defaultChecked={
                    defaultValues?.cautionLevel
                      ? defaultValues.cautionLevel === option
                      : option === "TASAPAINOINEN"
                  }
                  className="text-slate-900 focus:ring-slate-900"
                />
                <span>{getCautionLevelLabel(option)}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-900">
            Vältettävät ilmaukset (valinnainen)
          </label>
          <textarea
            name="forbiddenPhrases"
            rows={4}
            defaultValue={(defaultValues?.forbiddenPhrases ?? []).join("\n")}
            placeholder="Kirjoita yksi ilmaus per rivi"
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-500">
            Vastauksissa pyritään välttämään näitä ilmauksia.
          </p>
        </div>


        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-black text-sm font-semibold text-white transition hover:bg-black/90"
        >
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
