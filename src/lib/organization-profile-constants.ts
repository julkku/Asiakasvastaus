export const industryOptions = [
  "KAUPPA",
  "RAKENTAMINEN_REMONTOINTI",
  "PALVELUT_KULUTTAJILLE",
  "PALVELUT_YRITYKSILLE",
  "IT_DIGIPALVELUT",
  "TERVEYS_HYVINVOINTI",
  "KOULUTUS_VALMENNUS",
  "KIINTEISTOT_ASUMINEN",
  "RAVINTOLA_MATKAILU",
  "TALOUS_LAKI_ASIANTUNTIJA",
  "YHDISTYS_JARJESTO",
  "MUU",
] as const;

export const communicationRoleOptions = [
  "ASIAKASPALVELU",
  "MYYNTI",
  "TEKNINEN_TUKI",
  "JOHTO",
] as const;

export const refundPolicyOptions = [
  "EI_LUVATA",
  "TAPAUSKOHTAINEN",
  "NORMAALI",
] as const;

export const cautionLevelOptions = [
  "ERITTAIN_VAROVAINEN",
  "TASAPAINOINEN",
  "SUORASUKAINEN",
] as const;

export type IndustryOption = (typeof industryOptions)[number];
export type CommunicationRoleOption = (typeof communicationRoleOptions)[number];
export type RefundPolicyOption = (typeof refundPolicyOptions)[number];
export type CautionLevelOption = (typeof cautionLevelOptions)[number];

export function getIndustryLabel(value: IndustryOption) {
  switch (value) {
    case "KAUPPA":
      return "Kauppa (verkkokauppa / kivijalka)";
    case "RAKENTAMINEN_REMONTOINTI":
      return "Rakentaminen ja remontointi";
    case "PALVELUT_KULUTTAJILLE":
      return "Palvelut kuluttajille";
    case "PALVELUT_YRITYKSILLE":
      return "Palvelut yrityksille";
    case "IT_DIGIPALVELUT":
      return "IT ja digipalvelut";
    case "TERVEYS_HYVINVOINTI":
      return "Terveys ja hyvinvointi";
    case "KOULUTUS_VALMENNUS":
      return "Koulutus ja valmennus";
    case "KIINTEISTOT_ASUMINEN":
      return "Kiinteistöt ja asuminen";
    case "RAVINTOLA_MATKAILU":
      return "Ravintola ja matkailu";
    case "TALOUS_LAKI_ASIANTUNTIJA":
      return "Talous, laki ja asiantuntijapalvelut";
    case "YHDISTYS_JARJESTO":
      return "Yhdistys / järjestö";
    default:
      return "Muu";
  }
}

export function getCommunicationRoleLabel(value: CommunicationRoleOption) {
  switch (value) {
    case "ASIAKASPALVELU":
      return "Asiakaspalvelu";
    case "MYYNTI":
      return "Myynti";
    case "TEKNINEN_TUKI":
      return "Tekninen tuki";
    case "JOHTO":
      return "Johto / vastuuhenkilö";
    default:
      return value;
  }
}

export function getRefundPolicyLabel(value: RefundPolicyOption) {
  switch (value) {
    case "EI_LUVATA":
      return "Hyvityksiä ei luvata viesteissä.";
    case "TAPAUSKOHTAINEN":
      return "Hyvitykset käsitellään tapauskohtaisesti.";
    default:
      return "Hyvitykset ovat osa normaalia asiakaspalvelua.";
  }
}

export function getCautionLevelLabel(value: CautionLevelOption) {
  switch (value) {
    case "ERITTAIN_VAROVAINEN":
      return "Erittäin varovainen";
    case "TASAPAINOINEN":
      return "Tasapainoinen";
    default:
      return "Suorasukainen mutta asiallinen";
  }
}
