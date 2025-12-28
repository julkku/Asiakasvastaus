import Link from "next/link";

import { verifyEmailToken } from "@/lib/email-verification";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params?.token ?? "";

  let success = false;
  if (token) {
    const result = await verifyEmailToken(token);
    success = result.success;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            {success ? "Sähköposti vahvistettu" : "Vahvistus epäonnistui"}
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            {success
              ? "Kiitos! Voit nyt käyttää Asiakasvastausta."
              : "Vahvistuslinkki on vanhentunut tai virheellinen."}
          </p>
          <Link
            href="/app/new"
            className="mt-4 inline-flex rounded-md bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Siirry sovellukseen
          </Link>
        </div>
      </div>
    </div>
  );
}
