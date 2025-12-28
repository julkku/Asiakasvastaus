import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

import { getDb } from "../src/db/client";
import { templates } from "../src/db/schema";

type TemplateField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "select";
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: { label: string; value: string }[];
};

type TemplateSeed = {
  key: string;
  title: string;
  description: string;
  formSchema: TemplateField[];
  basePromptText: string;
};

const templateSeeds: TemplateSeed[] = [
  {
    key: "TOIMITUSVIIVE",
    title: "Toimitusviive",
    description:
      "Vastaa asiakkaalle, kun tilaus on myöhässä tai toimitusaika venyy.",
    formSchema: [
      {
        key: "customerMessage",
        label: "Asiakkaan viesti (valinnainen)",
        type: "textarea",
        required: false,
        placeholder: "Kopioi asiakkaan lähettämä viesti tai yhteenveto",
        helpText:
          "Liitä asiakkaan alkuperäinen viesti, jos se on saatavilla. Voit jättää tyhjäksi.",
      },
      {
        key: "orderOrCaseId",
        label: "Tilaus-/tapausnumero",
        type: "text",
        placeholder: "#123456",
      },
      {
        key: "timeframe",
        label: "Arvioitu aikataulu",
        type: "text",
        placeholder: 'Esim. "lähetys ensi maanantaina"',
      },
      {
        key: "companyOffer",
        label: "Yrityksen tarjoama ratkaisu",
        type: "text",
        placeholder:
          "Esim. hyvitys, seuranta tai varavaihtoehto (yrityksen ehdotus)",
      },
    ],
    basePromptText:
      "Asiakas odottaa toimitusta. Myönnä viive rehellisesti, kerro syy vain jos se on varmasti totta ja tarjoa konkreettinen seuraava askel. Kerro selkeä uusi aikataulu tai miten tarkennus saadaan. Varmista, että asiakas kokee tulevansa kuulluksi.",
  },
  {
    key: "REKLAMAATIO_VIKA",
    title: "Reklamaatio / tuotevika",
    description:
      "Käsittele reklamaatio, jossa tuote on viallinen tai ei toimi odotetusti.",
    formSchema: [
      {
        key: "customerMessage",
        label: "Asiakkaan viesti (valinnainen)",
        type: "textarea",
        required: false,
        helpText:
          "Liitä asiakkaan alkuperäinen viesti, jos se on saatavilla. Voit jättää tyhjäksi.",
      },
      {
        key: "productName",
        label: "Tuote",
        type: "text",
        placeholder: 'Esim. "SmartLamp X1"',
      },
      {
        key: "orderOrCaseId",
        label: "Tilaus-/tapausnumero",
        type: "text",
      },
      {
        key: "companyOffer",
        label: "Yrityksen tarjoama ratkaisu",
        type: "text",
        placeholder: "Uusi tuote, korjaus, hyvitys tms.",
      },
    ],
    basePromptText:
      "Kyseessä on reklamaatio. Pyydä lisäkuvia tai tarkennusta vain jos se on välttämätöntä. Korosta, että asia otetaan vakavasti ja kerro miten etenemme, esim. palautuslomake, tarkastus tai uusi tuote. Vältä syyttelyä.",
  },
  {
    key: "HYVITYSPYYNTO",
    title: "Hyvityspyyntö",
    description:
      "Asiakas pyytää korvausta tai alennusta.",
    formSchema: [
      {
        key: "customerMessage",
        label: "Asiakkaan viesti (valinnainen)",
        type: "textarea",
        required: false,
        helpText:
          "Liitä asiakkaan alkuperäinen viesti, jos se on saatavilla. Voit jättää tyhjäksi.",
      },
      {
        key: "customerRequest",
        label: "Tilanteen kuvaus (valinnainen)",
        type: "textarea",
        required: false,
        helpText:
          "Kuvaa lyhyesti, mitä asiakas toivoo tai mitä on tapahtunut. Voit jättää tyhjäksi, jos liitit asiakkaan viestin.",
      },
      {
        key: "impact",
        label: "Vaikutus asiakkaalle",
        type: "text",
        placeholder: "Lyhyt kuvaus tilanteen vaikutuksesta",
      },
      {
        key: "companyPolicy",
        label: "Yrityksen linjaus hyvityksistä",
        type: "textarea",
        placeholder: "Tiivistelmä politiikasta",
      },
      {
        key: "offeredCompensation",
        label: "Tarjottu hyvitys",
        type: "text",
        placeholder: "Esim. 20 € alennus tai lisäpalvelu",
      },
    ],
    basePromptText:
      "Asiakas pyytää hyvitystä. Kerro lyhyesti, miten tilanne arvioitiin ja mitä hyvityksiä voidaan tarjota. Jos hyvitystä ei voida antaa, perustele empaattisesti. Tarjoa vaihtoehtoista hyötyä tai jatkotoimea.",
  },
  {
    key: "PERUUTUS_PALAUTUS",
    title: "Peruutus tai palautus",
    description:
      "Vastaa asiakkaalle tilauksen peruutuksesta tai palautuksesta.",
    formSchema: [
      {
        key: "customerMessage",
        label: "Asiakkaan viesti (valinnainen)",
        type: "textarea",
        required: false,
        helpText:
          "Liitä asiakkaan alkuperäinen viesti, jos se on saatavilla. Voit jättää tyhjäksi.",
      },
      {
        key: "customerRequest",
        label: "Tilanteen kuvaus (valinnainen)",
        type: "textarea",
        required: false,
        helpText:
          "Kuvaa lyhyesti peruutus-/palautustilanne. Voit jättää tyhjäksi, jos liitit asiakkaan viestin.",
      },
      {
        key: "orderOrCaseId",
        label: "Tilausnumero",
        type: "text",
      },
      {
        key: "orderStatus",
        label: "Tilauksen status",
        type: "text",
        placeholder: 'Esim. "lähetetty / varastolla"',
      },
      {
        key: "returnInstructions",
        label: "Palautusohjeet",
        type: "textarea",
        placeholder: "Lyhyt ohjeistus pakkaamisesta, osoitteesta jne.",
      },
    ],
    basePromptText:
      "Asiakas haluaa perua tai palauttaa tilauksen. Kerro ystävällisesti, miten etenemme ja mitä tietoja tai toimenpiteitä tarvitaan. Jos palautus kustannetaan asiakkaan toimesta, kerro se selkeästi. Muista vahvistaa, milloin hyvitys käsitellään.",
  },
  {
    key: "HINNASTO_LASKUTUS",
    title: "Hinnasto / laskutus",
    description:
      "Selvitä asiakkaan laskutukseen, veloituksiin tai hinnoitteluun liittyvä kysymys.",
    formSchema: [
      {
        key: "customerQuestion",
        label: "Tilanteen kuvaus (valinnainen)",
        type: "textarea",
        required: false,
        helpText:
          "Kuvaa lyhyesti, mikä laskussa askarruttaa. Voit jättää tyhjäksi, jos liitit asiakkaan viestin.",
      },
      {
        key: "invoiceId",
        label: "Lasku-/sopimusnumero",
        type: "text",
      },
      {
        key: "charges",
        label: "Kyseiset veloitukset",
        type: "textarea",
        placeholder: "Erittele summat tai tuotteet",
      },
      {
        key: "nextSteps",
        label: "Tarjottu jatkotoimi",
        type: "text",
        placeholder: "Esim. uusi lasku, tarkistus, hyvitys",
      },
    ],
    basePromptText:
      "Asiakas kysyy laskusta tai hinnoittelusta. Selitä veloitukset selkeästi. Tarjoa toimenpide, joka vie asiaa eteenpäin (tarkistus, oikaisu, maksuohje). Ole erityisen täsmällinen numeroiden kanssa.",
  },
  {
    key: "VARAUS_AIKATAULU",
    title: "Varaus / aikataulu",
    description:
      "Vastaa ajanvaraukseen, aikatauluun tai kalenterimuutokseen liittyvään viestiin.",
    formSchema: [
      {
        key: "customerRequest",
        label: "Tilanteen kuvaus (valinnainen)",
        type: "textarea",
        required: false,
        helpText:
          "Kuvaa lyhyesti, mitä aikaa/varausta halutaan muuttaa. Voit jättää tyhjäksi, jos liitit asiakkaan viestin.",
      },
      {
        key: "currentTime",
        label: "Nykyinen aika / varaus",
        type: "text",
        placeholder: "Esim. 12.3. klo 10",
      },
      {
        key: "availableSlots",
        label: "Vaihtoehtoiset ajat",
        type: "textarea",
        placeholder: "Listaa 1–3 sopivaa vaihtoehtoa",
      },
      {
        key: "additionalInfo",
        label: "Lisätiedot",
        type: "text",
        placeholder: "Tarvittavat valmistelut yms.",
      },
    ],
    basePromptText:
      "Asiakas haluaa varata tai siirtää ajan. Ehdota selkeästi vaihtoehdot ja kerro, miten muutos vahvistetaan. Jos aikaa ei voida tarjota, tarjoa seuraavaksi paras ratkaisu tai jonotus.",
  },
  {
    key: "ASIAKAS_TYYTYMATON",
    title: "Asiakas tyytymätön",
    description:
      "Hallitse tilanne, jossa asiakas on yleisesti tyytymätön palveluun.",
    formSchema: [
      {
        key: "customerFeedback",
        label: "Tilanteen kuvaus (valinnainen)",
        type: "textarea",
        required: false,
        helpText:
          "Kuvaa lyhyesti, mistä tyytymättömyys johtuu. Voit jättää tyhjäksi, jos liitit asiakkaan viestin.",
      },
      {
        key: "rootCause",
        label: "Taustatiedot",
        type: "textarea",
        placeholder: "Lyhyt selitys tilanteen syystä",
      },
      {
        key: "resolutionPlan",
        label: "Ratkaisuehdotus",
        type: "textarea",
        placeholder: "Miten tilanne hoidetaan",
      },
      {
        key: "followUpOwner",
        label: "Kuka hoitaa jatkon",
        type: "text",
        placeholder: "Nimi/sähköposti tai tiimi",
      },
    ],
    basePromptText:
      "Asiakas on yleisesti tyytymätön palveluun. Kiitä palautteesta ja tunnista asiakkaan kokemus lyhyesti. Pahoittele korkeintaan kerran ja vain tarvittaessa (vältä ylipahoittelua). Älä syyllistä ketään. Älä lupaa hyvityksiä. Pyydä korkeintaan 2–3 täsmällistä tarkennusta vain jos se on välttämätöntä asian selvittämiseksi. Kerro selkeä eteneminen: mitä tarkistamme ja mikä on seuraava askel. Jos 'Kuka hoitaa jatkon' on annettu, nimeä se. Muuten käytä muotoa 'asiakaspalvelumme palaa asiaan'. Pidä viesti lyhyenä ja jämäkkänä, ilman sisäistä 'toimenpidesuunnitelma'-jargonia.",
  },
  {
    key: "VIESTI_EPASELVA",
    title: "Viesti epäselvä",
    description:
      "Asiakkaan viesti on epäselvä, joten pyydä lisätietoja hienovaraisesti.",
    formSchema: [
      {
        key: "customerMessage",
        label: "Asiakkaan viesti (valinnainen)",
        type: "textarea",
        required: false,
        helpText:
          "Liitä asiakkaan alkuperäinen viesti, jos se on saatavilla. Voit jättää tyhjäksi.",
      },
      {
        key: "missingInfo",
        label: "Puuttuvat tiedot",
        type: "textarea",
        placeholder: "Mitä tarvitsemme, jotta asia selviää",
      },
      {
        key: "nextSteps",
        label: "Seuraava askel",
        type: "text",
        placeholder: "Esim. tiimin tarkistus, soitto tms.",
      },
    ],
    basePromptText:
      "Asiakkaan viesti on vajaa. Pyydä kohteliaasti lisätietoja ja kerro, miksi tiedot tarvitaan. Kerro myös, mitä tapahtuu, kun tiedot on saatu.",
  },
  {
    key: "PERUUTUS_YRITYS",
    title: "Peruminen yrityksen toimesta",
    description:
      "Vastaa asiakkaalle, kun tilausta ei voida toimittaa tai palvelua toteuttaa ja yritys peruu.",
    formSchema: [
      {
        key: "orderNumber",
        label: "Tilaus-/tapausnumero",
        type: "text",
      },
      {
        key: "cancellationReason",
        label: "Syy perumiseen (lyhyesti)",
        type: "textarea",
        required: true,
      },
      {
        key: "companyOffer",
        label: "Yrityksen tarjoama vaihtoehto (valinnainen)",
        type: "textarea",
      },
      {
        key: "refundInfo",
        label: "Maksun palautus (valinnainen)",
        type: "textarea",
        placeholder: "Esim. palautus 2–5 arkipäivässä",
      },
      {
        key: "whoHandlesFollowUp",
        label: "Kuka hoitaa jatkon (valinnainen)",
        type: "text",
      },
    ],
    basePromptText:
      "Yritys peruu tilauksen tai palvelun, koska toimitus/toteutus ei onnistu. Kerro peruminen selkeästi ja lyhyesti (mitä perutaan ja miksi yleistasolla). Pahoittele korkeintaan kerran. Älä syyllistä asiakasta. Älä esitä perumista asiakkaan pyyntönä. Tarjoa mahdollinen vaihtoehto (uusi aikataulu/korvaava vaihtoehto) vain jos se on annettu syötteissä. Kerro selkeästi, mitä tapahtuu maksun suhteen (palautus/oikaisu ja arvioitu aikataulu, jos annettu). Pidä sävy asiallisena ja rauhallisena. Lopuksi kerro seuraava askel ja miten asiakas voi vastata.",
  },
  {
    key: "VIRHE_YRITYS",
    title: "Virhe yrityksen puolelta",
    description:
      "Vastaa asiakkaalle, kun yritys on tehnyt virheen ja se tulee myöntää ja korjata asiallisesti.",
    formSchema: [
      {
        key: "customerFeedback",
        label: "Tilanteen kuvaus",
        type: "textarea",
        required: false,
        helpText:
          "Kuvaa lyhyesti tilanne omin sanoin. Voit jättää tämän tyhjäksi, jos asiakkaan viesti on jo liitetty.",
      },
      {
        key: "backgroundInfo",
        label: "Taustatiedot (valinnainen)",
        type: "textarea",
      },
      {
        key: "fixPlan",
        label: "Korjaava toimenpide (valinnainen)",
        type: "textarea",
      },
      {
        key: "companyOffer",
        label: "Yrityksen tarjoama hyvitys tai kompromissi (valinnainen)",
        type: "textarea",
      },
      {
        key: "whoHandlesFollowUp",
        label: "Kuka hoitaa jatkon (valinnainen)",
        type: "text",
      },
    ],
    basePromptText:
      "Yritys on tehnyt virheen. Tavoite on myöntää virhe asiallisesti, korjata tilanne ja säilyttää luottamus. Käytä 'Tilanteen kuvaus' -kenttää tapahtumien pohjana. Jos asiakkaan viesti on annettu, vastaa siihen. Jos asiakkaan viestiä ei ole annettu, kirjoita viesti puhtaana ilmoituksena (älä kiitä yhteydenotosta). Pahoittele korkeintaan kerran ja vältä ylipahoittelua (ei 'vilpittömästi', 'syvästi', 'erittäin'). Kerro korjaava toimenpide ja aikataulu vain siltä osin kuin ne on annettu syötteissä. Älä lupaa hyvitystä, ellei yritys tarjoa sitä syötteissä. Jos 'Kuka hoitaa jatkon' on annettu, nimeä se; muuten käytä muotoa 'asiakaspalvelumme palaa asiaan'. Pidä vastaus lyhyenä, selkokielisenä ja rauhallisena.",
  },
];

async function seedTemplates() {
  const db = getDb();
  for (const seed of templateSeeds) {
    const existing = await db.query.templates.findFirst({
      where: eq(templates.key, seed.key),
    });

    if (existing) {
      await db
        .update(templates)
        .set({
          title: seed.title,
          description: seed.description,
          formSchema: JSON.stringify(seed.formSchema),
          basePromptText: seed.basePromptText,
        })
        .where(eq(templates.id, existing.id));
      continue;
    }

    await db.insert(templates).values({
      id: nanoid(),
      key: seed.key,
      title: seed.title,
      description: seed.description,
      formSchema: JSON.stringify(seed.formSchema),
      basePromptText: seed.basePromptText,
      createdAt: Date.now(),
    });
  }
}

seedTemplates()
  .then(() => {
    console.log("Templates seeded");
    process.exit(0);
  })
  .catch((error) => {
    console.error("db:seed failed", error);
    process.exit(1);
  });
