export const metadata = {
  title: "Käyttöehdot - Asiakasvastaus",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Asiakasvastaus
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Käyttöehdot
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Viimeksi päivitetty: 2025-12-28
          </p>

          <section className="mt-6 space-y-3 text-sm text-slate-700">
            <h2 className="text-lg font-semibold text-slate-900">
              1. Soveltamisala ja palvelun kuvaus
            </h2>
            <p>
              Näitä käyttöehtoja sovelletaan Asiakasvastaus-palvelun käyttöön.
              Palvelu tarjoaa työkalun asiakasviestintään liittyvien vastausten
              luonnosteluun ja hallintaan.
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              2. Tilin luominen ja käyttäjän vastuut
            </h2>
            <p>
              Käyttäjä vastaa antamiensa tietojen oikeellisuudesta sekä
              tunnustensa suojaamisesta. Käyttäjä sitoutuu käyttämään palvelua
              voimassa olevan lainsäädännön ja näiden ehtojen mukaisesti.
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              3. Sallittu ja kielletty käyttö
            </h2>
            <p>
              Palvelua saa käyttää ainoastaan sen tarkoituksen mukaisesti.
              Kiellettyä on mm. palvelun häirintä, tietoturvan vaarantaminen,
              toisten käyttäjien tietojen luvaton käsittely tai lainvastainen
              sisältö.
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              4. Tilaukset, hinnoittelu ja maksut
            </h2>
            <p>
              Maksut käsitellään Stripe-palvelun kautta. Tilaukset laskutetaan
              valitun laskutuskauden mukaisesti ja ne uusiutuvat automaattisesti
              ellei tilausta peruta. Kuitti toimitetaan sähköpostitse maksun
              yhteydessä.
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              5. Irtisanominen ja pääsyn päättyminen
            </h2>
            <p>
              Käyttäjä voi perua tilauksen milloin tahansa. Palvelun käyttöoikeus
              jatkuu laskutuskauden loppuun. Tilauksen päätyttyä pääsy palveluun
              lakkaa, ja käyttäjä vastaa omien tietojensa talteenotosta.
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              6. Palvelun muutokset ja saatavuus
            </h2>
            <p>
              Palvelua kehitetään jatkuvasti ja sisältöä voidaan muuttaa.
              Tavoitteena on hyvä saatavuus, mutta palvelulle ei anneta erillistä
              saatavuuslupausta.
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              7. Immateriaalioikeudet
            </h2>
            <p>
              Palvelun sisältö ja ohjelmisto ovat palveluntarjoajan tai sen
              lisenssinantajien omaisuutta. Käyttäjälle myönnetään rajoitettu,
              ei-yksinomainen oikeus käyttää palvelua näiden ehtojen mukaisesti.
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              8. Vastuunrajoitus
            </h2>
            <p>
              Palvelu tarjotaan siinä kunnossa kuin se on. Palveluntarjoaja ei
              vastaa epäsuorista vahingoista, eikä vastuuta muodostu enempää kuin
              mitä pakottava lainsäädäntö edellyttää. Käyttäjä vastaa palvelun
              kautta luotujen sisältöjen asianmukaisuudesta.
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              9. Henkilötiedot ja tietosuoja
            </h2>
            <p>
              Henkilötietojen käsittelystä kerrotaan tietosuojaselosteessa.
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              10. Sovellettava laki ja riitojen ratkaisu
            </h2>
            <p>
              Ehtoihin sovelletaan Suomen lakia. Mahdolliset riidat pyritään
              ratkaisemaan ensisijaisesti neuvotteluin ja tarvittaessa
              suomalaisessa toimivaltaisessa tuomioistuimessa.
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              11. Yhteystiedot
            </h2>
            <p>Palvelun tarjoaja:</p>
            <p>Palvelu: Asiakasvastaus</p>
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
          </section>
        </div>
      </div>
    </main>
  );
}
