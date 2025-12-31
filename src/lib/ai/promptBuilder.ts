import type { TemplateWithFields } from "@/lib/templates";
import type { OrganizationProfileInput } from "@/lib/organization";
import type {
  CautionLevelOption,
  RefundPolicyOption,
} from "@/lib/organization-profile-constants";
import {
  getCautionLevelLabel,
  getCommunicationRoleLabel,
  getIndustryLabel,
  getRefundPolicyLabel,
} from "@/lib/organization-profile-constants";

type PromptLayers = {
  system: string;
  policy: string;
  template: string;
  context: string;
};

function toneGuidance(tone: OrganizationProfileInput["defaultTone"]) {
  switch (tone) {
    case "RAUHOITTAVA":
      return [
        "Sävy: rauhoittava.",
        "Käytä empaattista mutta hallittua kieltä, lyhyitä lauseita ja selkeää rauhoittelua.",
        "Vältä liiallista pahoittelua.",
      ].join(" ");
    case "JAMAKKA":
      return [
        "Sävy: jämäkkä.",
        "Ole asiallinen ja kohtelias, mutta selkeä rajoista ja etenemisestä.",
        "Älä pahoittele ellei se ole välttämätöntä.",
      ].join(" ");
    default:
      return [
        "Sävy: neutraali.",
        "Ole suora, faktapohjainen ja tehokas.",
        "Vältä tunnepitoista kieltä.",
      ].join(" ");
  }
}

function cautionGuidance(level: CautionLevelOption) {
  switch (level) {
    case "ERITTAIN_VAROVAINEN":
      return [
        "Varovaisuustaso: erittäin varovainen.",
        "Käytä ehdollista kieltä, vältä syyllistämistä ja vältä myöntämistä.",
        "Pyydä puuttuvat tiedot ennen lupauksia.",
      ].join(" ");
    case "SUORASUKAINEN":
      return [
        "Varovaisuustaso: suorasukainen.",
        "Ole napakka ja selkeä, mutta pidä sävy kohteliaana.",
        "Vältä silti ehdottomia lupauksia ilman varmaa perustetta.",
      ].join(" ");
    default:
      return [
        "Varovaisuustaso: tasapainoinen.",
        "Pidä sävy selkeänä ja asiallisena, mutta käytä tarvittaessa ehdollisuutta.",
      ].join(" ");
  }
}

function refundGuidance(policy: RefundPolicyOption) {
  switch (policy) {
    case "EI_LUVATA":
      return [
        "Hyvityslinja: hyvityksiä ei luvata viesteissä.",
        "Jos asiakas pyytää hyvitystä, vastaa: voimme tarkistaa mahdollisuuden.",
      ].join(" ");
    case "TAPAUSKOHTAINEN":
      return [
        "Hyvityslinja: tapauskohtainen.",
        "Hyvityksistä voi mainita ehdollisesti, mutta älä lupaa mitään varmaksi.",
      ].join(" ");
    default:
      return [
        "Hyvityslinja: normaali.",
        "Hyvityksen tai alennuksen voi tarjota yhtenä vaihtoehtona, mutta älä lupaa ilman valtuutta.",
      ].join(" ");
  }
}

export function buildPromptLayers({
  template,
  profile,
  input,
}: {
  template: TemplateWithFields;
  profile: OrganizationProfileInput;
  input: Record<string, string>;
}): PromptLayers {
  const effectiveCustomerMessage =
    input.customerMessage?.trim() ||
    (template.key === "HYVITYSPYYNTO" ? input.customerRequest?.trim() : "");
  const system = [
    "Olet seniori suomalainen asiakaspalveluasiantuntija.",
    "Vastaa aina suomeksi.",
    "Älä tee kirjoitusvirheitä tai kielioppivirheitä.",
    "Kirjoita sujuvaa, luonnollista suomen kieltä. Vältä turhaa virkamiesmäisyyttä ja kaavamaisia fraaseja. Säilytä kuitenkin asiallinen ja kohtelias asiakaspalvelun sävy.",
    "Älä käytä emojeja, markdownia tai analyysiä.",
    "Älä keksi faktoja.",
    "Älä lupaa hyvityksiä, korvauksia tai aikatauluja, ellei niitä ole annettu syötteissä.",
    "Älä anna juridisia neuvoja.",
    "Älä syyllistä asiakasta tai yritystä.",
    "Vältä toistamasta ilmausta 'Ymmärrän, että...'. Käytä vaihtoehtoja kuten 'Olemme huomanneet', 'Tilanne on selvä', 'Kiitos viestistäsi', tai aloita suoraan asialla, erityisesti jämäkässä sävyssä.",
    "Vältä aloittamasta jokaista vastausta ilmauksella \"Ymmärrän\". Vaihtele aloitusta tilanteen mukaan (esim. \"Kiitos viestistä\", \"Kiitos palautteesta\", tai aloita suoraan asialla).",
    "Pidä vastaus järkevän mittaisena: tarpeeksi pitkä käsittelemään asia, mutta vältä tarpeetonta täytettä.",
    "Päätä vastaus aina kokonaiseksi: viimeinen rivi on selkeä lopetus (esim. \"Ystävällisin terveisin ...\").",
    "Älä jätä lausetta kesken.",
    "Pidä vastaus selkeänä ja ammattimaisena.",
    "Jos asiakkaan viestiä ei ole annettu, kirjoita viesti puhtaana ilmoituksena.",
    "Älä kiitä yhteydenotosta tai pyydä vastausta, ellei se ole välttämätöntä.",
    "Yrityksen oma-aloitteisessa ilmoituksessa älä pyydä asiakkaalta välitöntä vastausta, ellei asiakasviestissä ole esitetty kysymystä.",
    "Jos jatkotoimi vaatii yhteydenottoa, kerro että yritys ottaa yhteyttä.",
  ].join(" ");

  const policy = [
    "Sallitut toiminnat: kohtelias tervehdys, tilanteen tiivis tunnistus, selkeät jatkoaskeleet, tarvittavat kysymykset, neutraali päättäminen.",
    "Kielletyt toiminnat: faktattomat väitteet, ehdottomat lupaukset, syyttely, painostus.",
    "Jos tietoja puuttuu, pyydä ne lyhyesti tai muotoile ehdollisesti.",
    "Jos asiakas on tunnepitoinen, rauhoita tilanne, osoita ymmärrys ja pidä sävy hallittuna.",
    "Jos konfliktia tulee purkaa, tunnista huoli, kerro selkeä etenemistapa ja pidä rajat.",
    "Jos asiakas ei ole esittänyt kysymystä tai pyyntöä, älä vaadi vastausta. Kerro, että yritys ottaa seuraavan askeleen tai on yhteydessä.",
    "Oletus: käytä selkokieltä ja vältä ammattijargonia.",
    `Toimiala: ${getIndustryLabel(profile.industry)}.`,
    `Viestinnän rooli: ${getCommunicationRoleLabel(profile.communicationRole)}.`,
    `Hyvityslinja: ${getRefundPolicyLabel(profile.refundPolicy)}`,
    `Varovaisuustaso: ${getCautionLevelLabel(profile.cautionLevel)}.`,
    refundGuidance(profile.refundPolicy),
    cautionGuidance(profile.cautionLevel),
    profile.forbiddenPhrases.length
      ? `Vältä ilmauksia: ${profile.forbiddenPhrases.join(", ")}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const templateLayer = [
    `Tilanne: ${template.title} (${template.key}).`,
    "Rakenne on pakollinen: tervehdys, tilanteen tunnistus ja pahoittelu vain tarvittaessa, ratkaisupolku, seuraavat askeleet, lopetus, allekirjoitus.",
    "Vältä ilmauksia kuten: valitettavasti emme voi, emme voi tehdä mitään, se ei ole meidän vikamme.",
    "Käytä tilanteeseen sopivaa, turvallista ja asiakkaalle selkeästi ohjaavaa kieltä.",
    `Tilannekohtaiset ohjeet: ${template.basePromptText}`,
  ].join(" ");

  const context = [
    `Yritys: ${profile.companyName}.`,
    profile.teitittely
      ? "Käytä teitittelyä."
      : "Käytä sinuttelua.",
    toneGuidance(profile.defaultTone),
    effectiveCustomerMessage
      ? "Asiakkaan viesti on ensisijainen lähtökohta. Vastaa suoraan asiakkaan viestin sisältöön, pidä viesti tiiviinä ja ammattimaisena."
      : "Asiakkaan viestiä ei ole annettu. Laadi hyödyllinen vastaus annettujen taustatietojen perusteella äläkä viittaa puuttuvaan viestiin.",
    `Allekirjoitus: ${profile.signature}.`,
    "Kenttä 'companyOffer' tarkoittaa yrityksen tarjoamaa ratkaisua asiakkaalle, ei asiakkaan pyyntöä. Älä muotoile sitä muodossa 'kuten pyysitte'.",
    "Syöte (JSON):",
    JSON.stringify(input, null, 2),
  ].join("\n");

  return {
    system,
    policy,
    template: templateLayer,
    context,
  };
}
