"use server";

import { NextResponse } from "next/server";
import { z } from "zod";

import {
  buildResponseInput,
  getDefaultModel,
  getOpenAIClient,
} from "@/lib/ai/generateReply";
import { getOrganizationProfile } from "@/lib/organization";
import { getTemplateByKey, type TemplateField } from "@/lib/templates";
import { getUserFromSessionCookie } from "@/lib/auth";
import {
  assertCanGenerate,
  isEmailNotVerifiedError,
  isPaywallError,
} from "@/lib/entitlement";
import { trackEvent } from "@/lib/usageEvents";

const requestSchema = z.object({
  templateKey: z.string().min(1),
  input: z.record(z.any()),
});

const CONTINUATION_MAX_OUTPUT_TOKENS = 350;
const CONTINUATION_TAIL_CHARS = 2000;

function getMaxOutputTokens(templateKey: string) {
  switch (templateKey) {
    case "REKLAMAATIO_VIKA":
      return 1100;
    case "ASIAKAS_TYYTYMATON":
      return 900;
    default:
      return 800;
  }
}

function isLikelyTruncated(text: string) {
  const trimmed = text.trimEnd();
  if (!trimmed) {
    return false;
  }
  if (/[.!?…]$/.test(trimmed)) {
    return false;
  }
  const tail = trimmed.slice(-60);
  if (/Ystävällisin terveisin/i.test(tail)) {
    return false;
  }
  return /[a-zA-Z0-9äöåÄÖÅ]$/.test(trimmed);
}

export async function POST(request: Request) {
  const t0 = Date.now();
  const user = await getUserFromSessionCookie();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  let parsedBody: z.infer<typeof requestSchema>;
  try {
    const json = await request.json();
    parsedBody = requestSchema.parse(json);
  } catch {
    return new Response("Virheellinen pyyntö.", { status: 400 });
  }

  const templatePromise = getTemplateByKey(parsedBody.templateKey);
  const profilePromise = getOrganizationProfile(user.id);
  const entitlementPromise = assertCanGenerate(user.id);

  const template = await templatePromise;
  if (!template) {
    return new Response("Mallipohjaa ei löytynyt.", { status: 404 });
  }

  const profile = await profilePromise;
  if (!profile) {
    return new Response("Onboarding puuttuu.", { status: 400 });
  }

  try {
    await entitlementPromise;
  } catch (error) {
    if (await isEmailNotVerifiedError(error)) {
      return new Response(
        "Vahvista sähköpostisi ennen palvelun käyttöä. Tarkista sähköposti ja klikkaa vahvistuslinkkiä.",
        { status: 403 },
      );
    }
    if (await isPaywallError(error)) {
      return new Response(
        "Käyttö vaatii aktiivisen tilauksen tai käynnissä olevan kokeilun.",
        { status: 403 },
      );
    }
    throw error;
  }

  const input = { ...parsedBody.input };
  if (typeof input.customerMessage === "string") {
    const trimmed = input.customerMessage.trim();
    if (trimmed) {
      input.customerMessage = trimmed;
    } else {
      delete input.customerMessage;
    }
  } else if ("customerMessage" in input) {
    delete input.customerMessage;
  }

  const missingField = template.fields.find(
    (field: TemplateField) =>
      field.required &&
      (typeof input?.[field.key] !== "string" || !input?.[field.key]?.trim()),
  );

  if (missingField) {
    return new Response(`${missingField.label} on pakollinen.`, {
      status: 400,
    });
  }

  void trackEvent({
    eventName: "template_used",
    userId: user.id,
    context: { templateKey: template.key },
  });
  void trackEvent({ eventName: "response_created", userId: user.id });

  const encoder = new TextEncoder();
  const [client, defaultModel, messages] = await Promise.all([
    getOpenAIClient(),
    getDefaultModel(),
    buildResponseInput({ template, profile, input }),
  ]);

  const stream = new ReadableStream({
    async start(controller) {
      let loggedFirstChunk = false;
      let loggedDone = false;
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(
            `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
          ),
        );
      };
      const logDone = () => {
        if (loggedDone) {
          return;
        }
        loggedDone = true;
        const tDone = Date.now();
        console.log("[generate] done ms:", tDone - t0);
        console.log("[generate] total ms:", tDone - t0);
      };

      const streamResponse = async ({
        inputMessages,
        maxOutputTokens,
      }: {
        inputMessages: typeof messages;
        maxOutputTokens: number;
      }) => {
        let text = "";
        let finishReason: string | null = null;
        let model: string | null = null;
        let hadError = false;
        const responseStream = await client.responses.stream({
          model: defaultModel,
          input: inputMessages,
          max_output_tokens: maxOutputTokens,
          reasoning: { effort: "low" },
        });

        for await (const event of responseStream) {
          if (!loggedFirstChunk) {
            loggedFirstChunk = true;
            const tFirstChunk = Date.now();
            console.log("[generate] first OpenAI chunk ms:", tFirstChunk - t0);
          }
          if (event.type === "response.output_text.delta") {
            text += event.delta ?? "";
            send("delta", { text: event.delta });
          } else if (event.type === "response.completed") {
            finishReason =
              (event.response?.output?.[0] as { finish_reason?: string })
                ?.finish_reason ??
              (event.response as { finish_reason?: string })?.finish_reason ??
              null;
            model = event.response.model ?? defaultModel;
            responseStream.controller.abort();
            return { text, finishReason, model, hadError };
          } else if (event.type === "error") {
            send("error", {
              message: "Generointi epäonnistui. Yritä uudelleen.",
            });
            hadError = true;
            responseStream.controller.abort();
            return { text, finishReason, model, hadError };
          }
        }
        return { text, finishReason, model, hadError };
      };

      try {
        send("status", { state: "starting" });
        const tBeforeOpenAI = Date.now();
        console.log("[generate] before OpenAI ms:", tBeforeOpenAI - t0);

        const maxOutputTokens = getMaxOutputTokens(template.key);
        const first = await streamResponse({
          inputMessages: messages,
          maxOutputTokens,
        });
        if (first.hadError) {
          controller.close();
          logDone();
          return;
        }

        let didContinue = false;
        let finalModel = first.model ?? defaultModel;
        const needsContinuation =
          first.finishReason === "length" ||
          (!first.finishReason && isLikelyTruncated(first.text));

        if (needsContinuation && first.text.trim().length > 0 && !didContinue) {
          didContinue = true;
          const tail = first.text.slice(-CONTINUATION_TAIL_CHARS);
          const continuationMessages = [
            ...messages,
            {
              role: "developer" as const,
              content: [
                {
                  type: "input_text" as const,
                  text: "Jatka täsmälleen siitä mihin teksti jäi. Älä toista aiempaa. Kirjoita loppuun ja päätä kohteliaaseen lopetukseen.",
                },
              ],
            },
            {
              role: "user" as const,
              content: [
                {
                  type: "input_text" as const,
                  text: `Tässä on vastaus tähän asti:\n${tail}`,
                },
              ],
            },
          ];
          const continued = await streamResponse({
            inputMessages: continuationMessages,
            maxOutputTokens: CONTINUATION_MAX_OUTPUT_TOKENS,
          });
          if (continued.hadError) {
            controller.close();
            logDone();
            return;
          }
          finalModel = continued.model ?? finalModel;
        }

        send("done", { model: finalModel });
        controller.close();
        logDone();
      } catch (error) {
        console.error("Streaming error", error);
        send("error", {
          message: "Generointi epäonnistui. Yritä uudelleen.",
        });
        controller.close();
        logDone();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
