"use client";

import { useActionState, useState } from "react";

import {
  createDevVerificationLinkAction,
  devVerifyNowAction,
} from "@/app/app/profile/actions";

type DevEmailVerificationPanelProps = {
  isVerified: boolean;
  mode: "link" | "button" | "off";
};

type DevState = {
  error?: string;
  link?: string;
  success?: string;
};

const initialState: DevState = {};

export function DevEmailVerificationPanel({
  isVerified,
  mode,
}: DevEmailVerificationPanelProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [linkState, linkAction] = useActionState(
    createDevVerificationLinkAction,
    initialState,
  );
  const [verifyState, verifyAction] = useActionState(
    devVerifyNowAction,
    initialState,
  );

  if (isVerified || mode === "off") {
    return null;
  }

  const link = linkState?.link;

  const handleCopy = async () => {
    if (!link) {
      return;
    }
    await navigator.clipboard.writeText(link);
    setCopyState("copied");
    setTimeout(() => setCopyState("idle"), 1500);
  };

  return (
    <div className="max-w-2xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800 shadow-sm">
      <p className="text-base font-semibold">
        Vahvista sähköpostisi (DEV)
      </p>
      <p className="mt-1">
        Tämä työkalu on käytössä vain kehitysympäristössä.
      </p>

      {mode === "link" ? (
        <form action={linkAction} className="mt-3 space-y-3">
          <button
            type="submit"
            className="rounded-md bg-amber-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Luo vahvistuslinkki (DEV)
          </button>

          {linkState?.error ? (
            <p className="text-xs text-red-700">{linkState.error}</p>
          ) : null}

          {link ? (
            <div className="rounded-md border border-amber-200 bg-white px-3 py-2 text-xs text-slate-800">
              <p className="break-all">{link}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {copyState === "copied" ? "Kopioitu" : "Kopioi"}
                </button>
                <a
                  href={link}
                  className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  Avaa linkki
                </a>
              </div>
            </div>
          ) : null}
        </form>
      ) : (
        <form action={verifyAction} className="mt-3 space-y-2">
          <button
            type="submit"
            className="rounded-md bg-amber-600 px-4 py-2 text-xs font-semibold text-white"
          >
            Vahvista nyt (DEV)
          </button>
          {verifyState?.error ? (
            <p className="text-xs text-red-700">{verifyState.error}</p>
          ) : null}
          {verifyState?.success ? (
            <p className="text-xs text-emerald-700">{verifyState.success}</p>
          ) : null}
        </form>
      )}
    </div>
  );
}
