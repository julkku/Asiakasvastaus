import Link from "next/link";
import { ReactNode } from "react";

import { requireUser } from "@/lib/auth";
import { getEntitlementSummary } from "@/lib/entitlement";

const navLinks = [
  { href: "/app/new", label: "Uusi vastaus" },
  { href: "/app/history", label: "Tallennetut" },
  { href: "/app/profile", label: "Profiili" },
];

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const entitlement = await getEntitlementSummary(user.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/app/new" className="group">
              <p className="text-base font-semibold text-slate-900 transition group-hover:text-slate-700">
                Asiakasvastaus
              </p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </Link>

            <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-transparent px-3 py-1 transition hover:border-slate-200 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:ring-offset-2"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              {entitlement.subscription.isActive ? (
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                  Tilaus aktiivinen
                </span>
              ) : entitlement.trial.isActive ? (
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                  Ilmainen kokeilu – {entitlement.trial.daysLeft}{" "}
                  {entitlement.trial.daysLeft === 1
                    ? "päivä"
                    : "päivää"} jäljellä
                </span>
              ) : (
                <Link
                  href="/pricing?from=profile"
                  className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2"
                >
                  Tilaa
                </Link>
              )}

              <form action="/logout" method="post">
                <button
                  type="submit"
                  className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:ring-offset-2"
                >
                  Kirjaudu ulos
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
