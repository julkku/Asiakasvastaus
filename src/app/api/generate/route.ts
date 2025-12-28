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

export async function POST(request: Request) {
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

  const template = await getTemplateByKey(parsedBody.templateKey);
  if (!template) {
    return new Response("Mallipohjaa ei löytynyt.", { status: 404 });
  }

  const profile = await getOrganizationProfile(user.id);
  if (!profile) {
    return new Response("Onboarding puuttuu.", { status: 400 });
  }

  try {
    await assertCanGenerate(user.id);
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
  const client = await getOpenAIClient();
  const defaultModel = await getDefaultModel();
  const messages = await buildResponseInput({
    template,
    profile,
    input,
  });

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(
            `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
          ),
        );
      };

      try {
        send("status", { state: "starting" });
        const responseStream = await client.responses.stream({
          model: defaultModel,
          input: messages,
        });

        for await (const event of responseStream) {
          if (event.type === "response.output_text.delta") {
            send("delta", { text: event.delta });
          } else if (event.type === "response.completed") {
            send("done", {
              model: event.response.model ?? defaultModel,
            });
            responseStream.controller.abort();
            controller.close();
            return;
          } else if (event.type === "error") {
            send("error", {
              message: "Generointi epäonnistui. Yritä uudelleen.",
            });
            responseStream.controller.abort();
            controller.close();
            return;
          }
        }
        controller.close();
      } catch (error) {
        console.error("Streaming error", error);
        send("error", {
          message: "Generointi epäonnistui. Yritä uudelleen.",
        });
        controller.close();
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
