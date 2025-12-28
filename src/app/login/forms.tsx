"use client";

import Link from "next/link";
import Script from "next/script";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  loginAction,
  registerAction,
  resendVerificationAction,
} from "./actions";
import type { ActionState, ResendVerificationState } from "./actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="inline-flex h-10 w-full items-center justify-center rounded-md bg-black text-sm font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Please wait..." : label}
    </button>
  );
}

export function AuthForms({ turnstileSiteKey }: { turnstileSiteKey: string }) {
  const [registerState, registerFormAction] = useActionState<
    ActionState,
    FormData
  >(
    registerAction,
    {},
  );
  const [loginState, loginFormAction] = useActionState<
    ActionState,
    FormData
  >(
    loginAction,
    {},
  );
  const [resendState, resendFormAction] = useActionState<
    ResendVerificationState,
    FormData
  >(resendVerificationAction, {});

  return (
    <div className="min-h-screen bg-slate-50">
      {turnstileSiteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      ) : null}
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16 sm:px-8">
        <header className="space-y-2 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Asiakasvastaus
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">
            Sign in or create your account
          </h1>
          <p className="text-sm text-slate-600">
            Access the private app area with your email and password.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Create an account
            </h2>
            <p className="mb-4 text-sm text-slate-600">
              New here? Register to get started.
            </p>
            <form action={registerFormAction} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-900">
                  Name <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="Ada Lovelace"
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
              {turnstileSiteKey ? (
                <div>
                  <div
                    className="cf-turnstile"
                    data-sitekey={turnstileSiteKey}
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  CAPTCHA ei ole käytössä tässä ympäristössä.
                </p>
              )}
              {registerState?.error && (
                <p className="text-sm font-medium text-red-600">
                  {registerState.error}
                </p>
              )}
              {registerState?.success && (
                <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  <p>{registerState.success}</p>
                  {registerState.trialAlreadyUsed ? (
                    <p className="mt-1 text-xs">
                      Kokeilu on jo käytetty tällä laitteella. Voit silti
                      kirjautua sisään ja jatkaa tilaamalla.
                    </p>
                  ) : null}
                </div>
              )}
              <SubmitButton label="Create account" />
            </form>

            {registerState?.success ? (
              <form action={resendFormAction} className="mt-3">
                <input
                  type="hidden"
                  name="email"
                  value={registerState.email ?? ""}
                />
                {resendState?.error ? (
                  <p className="mb-2 text-sm font-medium text-red-600">
                    {resendState.error}
                  </p>
                ) : null}
                {resendState?.success ? (
                  <p className="mb-2 text-sm text-emerald-700">
                    {resendState.success}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Lähetä vahvistuslinkki uudelleen
                </button>
              </form>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Log in</h2>
            <p className="mb-4 text-sm text-slate-600">
              Already have access? Sign in below.
            </p>
            <form action={loginFormAction} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-900">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-900">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none"
                />
              </div>
              {loginState?.error && (
                <p className="text-sm font-medium text-red-600">
                  {loginState.error}
                </p>
              )}
              <SubmitButton label="Sign in" />
            </form>
            <p className="mt-4 text-xs text-slate-500">
              By continuing you agree to the{" "}
              <Link
                href="#"
                className="font-medium text-slate-900 underline-offset-2 hover:underline"
              >
                Terms of Service
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
