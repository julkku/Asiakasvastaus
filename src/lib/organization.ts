import "server-only";

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";

import { getDb } from "@/db/client";
import { organizationProfiles } from "@/db/schema";
import { ToneOption, toneOptions } from "@/lib/constants";
import {
  industryOptions,
  communicationRoleOptions,
  refundPolicyOptions,
  cautionLevelOptions,
  type IndustryOption,
  type CommunicationRoleOption,
  type RefundPolicyOption,
  type CautionLevelOption,
  getIndustryLabel,
  getCommunicationRoleLabel,
  getRefundPolicyLabel,
  getCautionLevelLabel,
} from "@/lib/organization-profile-constants";

export const organizationProfileInputSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, "Yrityksen nimi on pakollinen."),
  teitittely: z.boolean(),
  defaultTone: z.enum(toneOptions),
  industry: z.enum(industryOptions),
  communicationRole: z.enum(communicationRoleOptions),
  refundPolicy: z.enum(refundPolicyOptions),
  cautionLevel: z.enum(cautionLevelOptions),
  forbiddenPhrases: z
    .array(z.string().min(1))
    .max(20)
    .default([]),
  terminology: z
    .record(z.string().min(1), z.string().min(1))
    .default({}),
  signature: z
    .string()
    .trim()
    .min(1, "Allekirjoitus ei voi olla tyhjä."),
});

export type OrganizationProfileInput = z.infer<
  typeof organizationProfileInputSchema
>;

type ParsedProfile = OrganizationProfileInput & {
  id: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
};

function parseForbiddenPhrases(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0)
      .slice(0, 20);
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 20);
  }
  return [];
}

function parseTerminology(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const entries = Object.entries(value);
    const result: Record<string, string> = {};
    for (const [key, val] of entries) {
      if (typeof key === "string" && typeof val === "string") {
        const trimmedKey = key.trim();
        const trimmedVal = val.trim();
        if (trimmedKey && trimmedVal) {
          result[trimmedKey] = trimmedVal;
        }
      }
    }
    return result;
  }
  if (typeof value === "string") {
    const result: Record<string, string> = {};
    const lines = value.split("\n");
    for (const line of lines) {
      const [left, right] = line.split("=");
      if (!left || !right) {
        continue;
      }
      const key = left.trim();
      const val = right.trim();
      if (key && val) {
        result[key] = val;
      }
    }
    return result;
  }
  return {};
}

function parseJsonField<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeIndustry(value: string | null | undefined): IndustryOption {
  switch (value) {
    case "AUTOKAUPPA":
    case "VERKKOKAUPPA":
      return "KAUPPA";
    case "PALVELUYRITYS":
      return "PALVELUT_KULUTTAJILLE";
    case "IT_SAAS":
      return "IT_DIGIPALVELUT";
    case "TERVEYSPALVELUT":
      return "TERVEYS_HYVINVOINTI";
    case "KIINTEISTOT":
      return "KIINTEISTOT_ASUMINEN";
    case "KAUPPA":
    case "RAKENTAMINEN_REMONTOINTI":
    case "PALVELUT_KULUTTAJILLE":
    case "PALVELUT_YRITYKSILLE":
    case "IT_DIGIPALVELUT":
    case "TERVEYS_HYVINVOINTI":
    case "KOULUTUS_VALMENNUS":
    case "KIINTEISTOT_ASUMINEN":
    case "RAVINTOLA_MATKAILU":
    case "TALOUS_LAKI_ASIANTUNTIJA":
    case "YHDISTYS_JARJESTO":
      return value;
    default:
      return "MUU";
  }
}

export async function getOrganizationProfile(userId: string) {
  const db = getDb();
  const profile = await db.query.organizationProfiles.findFirst({
    where: eq(organizationProfiles.userId, userId),
  });

  if (!profile) {
    return null;
  }

  const forbiddenRaw = parseJsonField<string[]>(
    profile.forbiddenPhrases,
    [],
  );
  const terminologyRaw = parseJsonField<Record<string, string>>(
    profile.terminology,
    {},
  );

  return {
    id: profile.id,
    userId: profile.userId,
    companyName: profile.companyName,
    teitittely: profile.teitittely,
    defaultTone: profile.defaultTone as ToneOption,
    industry: normalizeIndustry(profile.industry),
    communicationRole: (profile.communicationRole ??
      "ASIAKASPALVELU") as CommunicationRoleOption,
    refundPolicy: (profile.refundPolicy ?? "EI_LUVATA") as RefundPolicyOption,
    cautionLevel: (profile.cautionLevel ??
      "TASAPAINOINEN") as CautionLevelOption,
    forbiddenPhrases: parseForbiddenPhrases(forbiddenRaw),
    terminology: parseTerminology(terminologyRaw),
    signature: profile.signature,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  } satisfies ParsedProfile;
}

export async function upsertOrganizationProfile(
  userId: string,
  data: OrganizationProfileInput,
) {
  const db = getDb();
  const now = Date.now();
  const existing = await getOrganizationProfile(userId);
  const forbiddenPhrases = parseForbiddenPhrases(data.forbiddenPhrases);
  const terminology = parseTerminology(data.terminology);

  if (existing) {
    await db
      .update(organizationProfiles)
      .set({
        companyName: data.companyName,
        teitittely: data.teitittely,
        defaultTone: data.defaultTone,
        industry: data.industry,
        communicationRole: data.communicationRole,
        refundPolicy: data.refundPolicy,
        cautionLevel: data.cautionLevel,
        forbiddenPhrases: JSON.stringify(forbiddenPhrases),
        terminology: JSON.stringify(terminology),
        signature: data.signature,
        updatedAt: now,
      })
      .where(eq(organizationProfiles.id, existing.id));
    return existing.id;
  }

  const id = nanoid();
  await db.insert(organizationProfiles).values({
    id,
    userId,
    companyName: data.companyName,
    teitittely: data.teitittely,
    defaultTone: data.defaultTone,
    industry: data.industry,
    communicationRole: data.communicationRole,
    refundPolicy: data.refundPolicy,
    cautionLevel: data.cautionLevel,
    forbiddenPhrases: JSON.stringify(forbiddenPhrases),
    terminology: JSON.stringify(terminology),
    signature: data.signature,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export function parseProfileForm(formData: FormData) {
  const forbiddenText =
    typeof formData.get("forbiddenPhrases") === "string"
      ? (formData.get("forbiddenPhrases") as string)
      : "";
  const terminologyText =
    typeof formData.get("terminology") === "string"
      ? (formData.get("terminology") as string)
      : "";

  return organizationProfileInputSchema.safeParse({
    companyName: formData.get("companyName"),
    teitittely: formData.get("teitittely") === "on",
    defaultTone: formData.get("defaultTone"),
    industry: formData.get("industry"),
    communicationRole: formData.get("communicationRole"),
    refundPolicy: formData.get("refundPolicy"),
    cautionLevel: formData.get("cautionLevel"),
    forbiddenPhrases: parseForbiddenPhrases(forbiddenText),
    terminology: parseTerminology(terminologyText),
    signature: formData.get("signature"),
  });
}

export function getToneLabel(tone: ToneOption) {
  switch (tone) {
    case "RAUHOITTAVA":
      return "Rauhoittava";
    case "NEUTRAALI":
      return "Neutraali";
    case "JAMAKKA":
      return "Jämäkkä";
    default:
      return tone;
  }
}

export {
  industryOptions,
  communicationRoleOptions,
  refundPolicyOptions,
  cautionLevelOptions,
  getIndustryLabel,
  getCommunicationRoleLabel,
  getRefundPolicyLabel,
  getCautionLevelLabel,
};
