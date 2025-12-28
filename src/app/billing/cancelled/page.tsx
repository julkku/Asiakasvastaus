import Link from "next/link";

export default function BillingCancelledPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
          Peruttu
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Maksu keskeytettiin
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Maksua ei veloitettu. Voit yrittää uudelleen, kun olet valmis.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/pricing"
          className="inline-flex h-11 items-center justify-center rounded-md bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/90"
        >
          Yritä uudelleen
        </Link>
        <Link
          href="/app/new"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Palaa sovellukseen
        </Link>
      </div>
    </div>
  );
}
