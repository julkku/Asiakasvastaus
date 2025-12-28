import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db/client";
import { templates } from "@/db/schema";

const formFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "textarea", "select"]),
  required: z.boolean().optional().default(false),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  options: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      }),
    )
    .optional(),
});

export type TemplateField = z.infer<typeof formFieldSchema>;

export type TemplateWithFields = typeof templates.$inferSelect & {
  fields: TemplateField[];
};

const templateOrder = [
  "ASIAKAS_TYYTYMATON",
  "HINNASTO_LASKUTUS",
  "HYVITYSPYYNTO",
  "PERUUTUS_PALAUTUS",
  "REKLAMAATIO_VIKA",
  "TOIMITUSVIIVE",
  "VARAUS_AIKATAULU",
  "VIESTI_EPASELVA",
  "PERUUTUS_YRITYS",
  "VIRHE_YRITYS",
];

const templateOrderIndex = new Map(
  templateOrder.map((key, index) => [key, index]),
);

function parseFields(formSchema: string) {
  let schemaJson: unknown;
  try {
    schemaJson = JSON.parse(formSchema);
  } catch {
    throw new Error("Invalid template schema JSON");
  }
  const parsed = z.array(formFieldSchema).safeParse(schemaJson);
  if (!parsed.success) {
    throw new Error("Invalid template schema");
  }
  return parsed.data;
}

export async function getAllTemplates() {
  const result = await db
    .select()
    .from(templates)
    .orderBy(templates.title);

  const parsed = result.map<TemplateWithFields>((template) => ({
    ...template,
    fields: parseFields(template.formSchema),
  }));

  return parsed.sort((first, second) => {
    const firstIndex = templateOrderIndex.get(first.key);
    const secondIndex = templateOrderIndex.get(second.key);
    if (firstIndex !== undefined || secondIndex !== undefined) {
      if (firstIndex === undefined) {
        return 1;
      }
      if (secondIndex === undefined) {
        return -1;
      }
      return firstIndex - secondIndex;
    }
    return first.title.localeCompare(second.title, "fi");
  });
}

export async function getTemplateByKey(key: string) {
  if (typeof key !== "string") {
    return null;
  }
  const normalizedKey = key.trim().toUpperCase();
  if (!normalizedKey) {
    return null;
  }
  const template = await db.query.templates.findFirst({
    where: eq(templates.key, normalizedKey),
  });
  if (!template) {
    return null;
  }
  return { ...template, fields: parseFields(template.formSchema) };
}

export async function getTemplateById(id: string) {
  const template = await db.query.templates.findFirst({
    where: eq(templates.id, id),
  });
  if (!template) {
    return null;
  }
  return { ...template, fields: parseFields(template.formSchema) };
}
