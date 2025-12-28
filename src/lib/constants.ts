export const toneOptions = ["RAUHOITTAVA", "NEUTRAALI", "JAMAKKA"] as const;

export type ToneOption = (typeof toneOptions)[number];
