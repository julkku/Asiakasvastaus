export const metadata = {
  title: "Yrityksen tiedot - Asiakasvastaus",
};

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Asiakasvastaus
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Yritystiedot
          </h1>

          <div className="mt-6 space-y-3 text-sm text-slate-700">
            <p>
              Palvelun käyttöä koskevat ehdot löytyvät käyttöehdoista ja
              henkilötietojen käsittely tietosuojaselosteesta.
            </p>
            <p>
              Palvelu: Asiakasvastaus
            </p>
            <p>
              Yhteys:{" "}
              <a className="font-medium underline" href="mailto:info@asiakasvastaus.fi">
                info@asiakasvastaus.fi
              </a>
              .
            </p>
            <p>Y-tunnus: 3581511-1</p>
            <p>Osoite: Kuoppamäenkuja 3 B 11, 20400 Turku</p>
            <p>Yhteydenotot ensisijaisesti sähköpostitse.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
