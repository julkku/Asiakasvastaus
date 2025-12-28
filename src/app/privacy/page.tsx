export const metadata = {
  title: "Tietosuojaseloste - Asiakasvastaus",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-16">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Asiakasvastaus
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Tietosuojaseloste
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Viimeksi päivitetty: 2025-12-28
          </p>

          <section className="mt-6 space-y-3 text-sm text-slate-700">
            <h2 className="text-lg font-semibold text-slate-900">
              1. Rekisterinpitäjä ja yhteystiedot
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

            <h2 className="text-lg font-semibold text-slate-900">
              2. Käsittelyn tarkoitukset ja oikeusperusteet
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Tilin hallinta ja palvelun tarjoaminen (sopimus).</li>
              <li>Maksut ja laskutus (sopimus ja lakisääteinen velvoite).</li>
              <li>Asiakastuki ja viestintä (oikeutettu etu).</li>
              <li>Palvelun kehitys ja tietoturva (oikeutettu etu).</li>
            </ul>

            <h2 className="text-lg font-semibold text-slate-900">
              3. Käsiteltävät tietoryhmät
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Nimi (valinnainen) ja sähköposti.</li>
              <li>Kirjautumistiedot ja palvelun käyttöön liittyvät tiedot.</li>
              <li>Maksuihin liittyvät tunnistetiedot (Stripe).</li>
            </ul>
            <p>
              Maksukorttitietoja ei tallenneta Asiakasvastaus-palveluun.
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              4. Tietolähteet
            </h2>
            <p>
              Tiedot saadaan käyttäjältä itseltään sekä Stripe-maksupalvelusta
              maksun yhteydessä.
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              5. Vastaanottajat ja käsittelijät
            </h2>
            <p>
              Palvelun teknisiä alihankkijoita ovat esimerkiksi hosting- ja
              tietokantapalvelut. Maksut käsitellään Stripe-palvelussa.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Stripe (maksujen käsittely).</li>
              <li>Vercel (hosting).</li>
              <li>Neon (tietokanta).</li>
              <li>OpenAI (palvelun toiminnallisuudet).</li>
            </ul>

            <h2 className="text-lg font-semibold text-slate-900">
              6. Tietojen säilytysajat
            </h2>
            <p>
              Tietoja säilytetään niin kauan kuin tili on aktiivinen ja
              kohtuullisen ajan sen jälkeen. Laskutus- ja kuittitietoja
              säilytetään kirjanpitovelvoitteen mukaisesti.
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              7. Rekisteröidyn oikeudet
            </h2>
            <p>
              Rekisteröidyllä on oikeus tarkastaa tietonsa, oikaista virheelliset
              tiedot, pyytää tietojen poistamista, rajoittaa käsittelyä,
              vastustaa käsittelyä sekä pyytää tietojen siirtoa soveltuvin osin.
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              8. Tietoturva
            </h2>
            <p>
              Henkilötietoja käsitellään luottamuksellisesti ja suojataan
              asianmukaisin teknisin ja organisatorisin toimenpitein.
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              9. Evästeet
            </h2>
            <p>
              Palvelu käyttää välttämättömiä evästeitä istunnon ylläpitämiseen.
              Markkinointi- tai seurantaa koskevia evästeitä ei käytetä.
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              10. Yhteydenotto ja valitusoikeus
            </h2>
            <p>
              Tietosuojaan liittyvissä kysymyksissä voit ottaa yhteyttä
              sähköpostitse. Rekisteröidyllä on oikeus tehdä valitus
              Tietosuojavaltuutetun toimistoon.
            </p>

            <h2 className="text-lg font-semibold text-slate-900">
              11. Muutokset selosteeseen
            </h2>
            <p>
              Päivitämme selostetta tarvittaessa. Ajantasainen versio on aina
              saatavilla tällä sivulla.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
