import { NextResponse } from "next/server";

import { env } from "@/env";
import { sendEmail } from "@/lib/mailer";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret =
    req.headers.get("DEBUG_EMAIL_SECRET") ?? url.searchParams.get("secret");
  const to = url.searchParams.get("to");
  const subject =
    url.searchParams.get("subject") ?? "Asiakasvastaus debug email";
  const text = url.searchParams.get("text") ?? "Debug email test.";

  if (!env.DEBUG_EMAIL_SECRET) {
    return NextResponse.json(
      { error: "DEBUG_EMAIL_SECRET not set" },
      { status: 500 },
    );
  }
  if (secret !== env.DEBUG_EMAIL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!to) {
    return NextResponse.json({ error: "Missing ?to=" }, { status: 400 });
  }

  await sendEmail({ to, subject, text });
  return NextResponse.json({ ok: true });
}
