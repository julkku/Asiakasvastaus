"use server";

import "server-only";

import OpenAI from "openai";

import { env } from "@/env";
import type { TemplateWithFields } from "@/lib/templates";
import type { OrganizationProfileInput } from "@/lib/organization";
import { buildPromptLayers } from "@/lib/ai/promptBuilder";

const DEFAULT_MODEL_VALUE = env.OPENAI_MODEL || "gpt-5-mini";

export async function getDefaultModel() {
  return DEFAULT_MODEL_VALUE;
}

export async function getOpenAIClient() {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  return new OpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
}

export async function buildResponseInput({
  template,
  profile,
  input,
}: {
  template: TemplateWithFields;
  profile: OrganizationProfileInput;
  input: Record<string, string>;
}) {
  const layers = buildPromptLayers({ template, profile, input });

  return [
    {
      role: "system" as const,
      content: [
        {
          type: "input_text" as const,
          text: `SYSTEM LAYER\n${layers.system}`,
        },
      ],
    },
    {
      role: "developer" as const,
      content: [
        {
          type: "input_text" as const,
          text: `POLICY LAYER\n${layers.policy}`,
        },
      ],
    },
    {
      role: "developer" as const,
      content: [
        {
          type: "input_text" as const,
          text: `TEMPLATE LAYER\n${layers.template}`,
        },
      ],
    },
    {
      role: "user" as const,
      content: [
        {
          type: "input_text" as const,
          text: `CONTEXT LAYER\n${layers.context}`,
        },
      ],
    },
  ];
}

export async function generateReply({
  template,
  profile,
  input,
}: {
  template: TemplateWithFields;
  profile: OrganizationProfileInput;
  input: Record<string, string>;
}) {
  const client = await getOpenAIClient();
  const model = await getDefaultModel();

  const response = await client.responses.create({
    model,
    input: await buildResponseInput({ template, profile, input }),
  });

  const text = response.output_text?.trim();

  if (!text) {
    throw new Error("OpenAI ei palauttanut vastausta");
  }

  return {
    text,
    model: response.model ?? model,
  };
}
