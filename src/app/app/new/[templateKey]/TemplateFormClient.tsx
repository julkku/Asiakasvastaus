"use client";

import { FormEvent, useState, useTransition } from "react";

import { saveDraftAction } from "./actions";
import type { TrialStatus } from "@/lib/trial";

type TemplateField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { label: string; value: string }[];
};

type TemplateFormClientProps = {
  templateKey: string;
  title: string;
  description: string;
  fields: TemplateField[];
  entitlement: {
    isEntitled: boolean;
    trialStatus: TrialStatus;
    isEmailVerified: boolean;
  };
};

const globalCustomerMessageField: TemplateField = {
  key: "customerMessage",
  label: "Asiakkaan viesti (valinnainen)",
  type: "textarea",
  required: false,
  helpText:
    "Liitä asiakkaan alkuperäinen viesti, jos se on saatavilla. Voit jättää tyhjäksi.",
};

const customerMessageExcludedTemplates = new Set([
  "PERUUTUS_YRITYS",
  "VIRHE_YRITYS",
]);

function hasCustomerMessage(fields: TemplateField[]) {
  return fields.some((field) => field.key === "customerMessage");
}

function shouldShowGlobalCustomerMessage(
  templateKey: string,
  fields: TemplateField[],
) {
  return (
    !customerMessageExcludedTemplates.has(templateKey) &&
    !hasCustomerMessage(fields)
  );
}

function getTrimmedValue(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function buildInput(
  fields: TemplateField[],
  formData: FormData,
  includeGlobalCustomerMessage: boolean,
) {
  const input: Record<string, string> = {};
  const fieldKeys = new Set(fields.map((field) => field.key));
  if (includeGlobalCustomerMessage && !fieldKeys.has("customerMessage")) {
    const message = getTrimmedValue(formData, "customerMessage");
    if (message) {
      input.customerMessage = message;
    }
  }

  fields.forEach((field) => {
    const value = getTrimmedValue(formData, field.key);
    input[field.key] = value;
  });

  return input;
}

function normalizeCustomerMessage(input: Record<string, string>) {
  if (!input.customerMessage) {
    return input;
  }
  const trimmed = input.customerMessage.trim();
  if (!trimmed) {
    const rest = { ...input };
    delete rest.customerMessage;
    return rest;
  }
  return { ...input, customerMessage: trimmed };
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("copy failed", error);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
      disabled={!text}
    >
      {copied ? "Kopioitu!" : "Kopioi"}
    </button>
  );
}

export function TemplateFormClient({
  templateKey,
  title,
  description,
  fields,
  entitlement,
}: TemplateFormClientProps) {
  const [generatedText, setGeneratedText] = useState("");
  const [inputValues, setInputValues] = useState<Record<string, string> | null>(
    null,
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const isEntitled = entitlement.isEntitled;
  const isEmailVerified = entitlement.isEmailVerified;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isStreaming) {
      return;
    }

    if (!isEmailVerified) {
      setError(
        "Vahvista sähköpostisi ennen palvelun käyttöä. Tarkista sähköposti ja klikkaa vahvistuslinkkiä.",
      );
      return;
    }

    if (!isEntitled) {
      setError(
        "Käyttö vaatii aktiivisen tilauksen tai käynnissä olevan kokeilun.",
      );
      return;
    }

    const formData = new FormData(event.currentTarget);
    const showGlobalCustomerMessage = shouldShowGlobalCustomerMessage(
      templateKey,
      fields,
    );
    const input = normalizeCustomerMessage(
      buildInput(fields, formData, showGlobalCustomerMessage),
    );

    const missingField = fields.find(
      (field) => field.required && !input[field.key]?.trim(),
    );
    if (missingField) {
      setError(`${missingField.label} on pakollinen.`);
      return;
    }

    setInputValues(input);
    setGeneratedText("");
    setIsStreaming(true);
    setIsComplete(false);
    setModel(null);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateKey,
          input,
        }),
      });

      if (!response.ok || !response.body) {
        const message = await response.text();
        throw new Error(message || "Generointi epäonnistui.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processBuffer = () => {
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const chunk = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);

          const lines = chunk.split("\n");
          let eventName = "";
          let data = "";

          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventName = line.replace("event:", "").trim();
            } else if (line.startsWith("data:")) {
              data += line.replace("data:", "").trim();
            }
          }

          if (eventName === "delta") {
            try {
              const payload = JSON.parse(data);
              const text = payload?.text ?? "";
              if (text) {
                setGeneratedText((prev) => prev + text);
              }
            } catch {
              // ignore parse error
            }
          } else if (eventName === "done") {
            try {
              const payload = JSON.parse(data || "{}");
              setModel(payload?.model ?? null);
            } catch {
              setModel(null);
            }
            setIsStreaming(false);
            setIsComplete(true);
          } else if (eventName === "error") {
            try {
              const payload = JSON.parse(data || "{}");
              setError(
                payload?.message ?? "Generointi epäonnistui. Yritä uudelleen.",
              );
            } catch {
              setError("Generointi epäonnistui. Yritä uudelleen.");
            }
            setIsStreaming(false);
            setIsComplete(false);
          }

          boundary = buffer.indexOf("\n\n");
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        processBuffer();
      }

      buffer += decoder.decode();
      processBuffer();

      setIsStreaming(false);
    } catch (err) {
      console.error(err);
      setError("Generointi epäonnistui. Yritä uudelleen.");
      setIsStreaming(false);
    }
  };

  const handleSave = () => {
    if (!inputValues || !generatedText.trim()) {
      setError("Ei tallennettavaa luonnosta.");
      return;
    }
    startSaving(async () => {
      try {
        await saveDraftAction({
          templateKey,
          input: inputValues,
          output: generatedText,
          model: model ?? undefined,
        });
      } catch (err) {
        console.error(err);
        setError("Tallennus epäonnistui.");
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-600">{description}</p>

        {shouldShowGlobalCustomerMessage(templateKey, fields) ? (
          <div>
            <label className="text-sm font-semibold text-slate-900">
              {globalCustomerMessageField.label}
            </label>
            <textarea
              name={globalCustomerMessageField.key}
              placeholder={globalCustomerMessageField.placeholder}
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none"
              rows={5}
            />
            {globalCustomerMessageField.helpText ? (
              <p className="mt-1 text-xs text-slate-500">
                {globalCustomerMessageField.helpText}
              </p>
            ) : null}
          </div>
        ) : null}

        {fields.map((field) => (
          <div key={field.key}>
            <label className="text-sm font-semibold text-slate-900">
              {field.label}{" "}
              {field.required ? (
                <span className="text-red-500">*</span>
              ) : null}
            </label>
            {field.type === "textarea" ? (
              <textarea
                name={field.key}
                required={field.required}
                placeholder={field.placeholder}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none"
                rows={5}
              />
            ) : field.type === "select" ? (
              <select
                name={field.key}
                required={field.required}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Valitse
                </option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                name={field.key}
                type="text"
                required={field.required}
                placeholder={field.placeholder}
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none"
              />
            )}
            {field.helpText ? (
              <p className="mt-1 text-xs text-slate-500">{field.helpText}</p>
            ) : null}
          </div>
        ))}

        {error ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        {!isEmailVerified ? (
          <div className="rounded-lg border border-dashed border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">Vahvista sähköpostisi.</p>
            <p className="mt-1">
              Tarkista sähköposti ja klikkaa vahvistuslinkkiä ennen palvelun
              käyttöä.
            </p>
            <p className="mt-2 text-xs text-amber-700">
              Jos linkki ei näy, pyydä uusi vahvistus kirjautumissivulta.
            </p>
          </div>
        ) : !isEntitled ? (
          <div className="rounded-lg border border-dashed border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Käyttö vaatii aktiivisen tilauksen.</p>
            <p className="mt-1">
              Tilaa Asiakasvastaus jatkaaksesi käyttöä.
            </p>
          </div>
        ) : null}

        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-black text-sm font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isStreaming || !isEntitled || !isEmailVerified}
        >
          {isStreaming ? "Luodaan vastausta…" : "Luo vastaus"}
        </button>
      </form>

      <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Vastaus</p>
            <p className="text-xs text-slate-500">
              {isStreaming
                ? "Kirjoitetaan vastausta..."
                : isComplete
                  ? "Valmis vastaus"
                  : ""}
            </p>
          </div>
          <CopyButton text={generatedText} />
        </div>

        <textarea
          className="mt-3 flex-1 resize-y rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
          placeholder="Valmis vastaus muodostuu tähän."
          value={generatedText}
          onChange={(event) => setGeneratedText(event.target.value)}
          rows={10}
          readOnly={isStreaming}
        />

        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={
              !isComplete ||
              isSaving ||
              isStreaming ||
              !generatedText ||
              !isEntitled ||
              !isEmailVerified
            }
          >
            {isSaving ? "Tallennetaan..." : "Tallenna vastaus"}
          </button>
          {model ? (
            <p className="text-center text-xs text-slate-500">
              Malli: {model}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
