import Link from "next/link";

export default function BillingSuccessPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">
          Maksettu
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Kiitos tilauksesta!
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Tilauksesi aktivoidaan pian. Voit palata sovellukseen.
        </p>
      </div>

      <Link
        href="/app/new"
        className="inline-flex h-11 items-center justify-center rounded-md bg-black px-6 text-sm font-semibold text-white transition hover:bg-black/90"
      >
        Siirry sovellukseen
      </Link>
    </div>
  );
}
