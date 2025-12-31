import "server-only";

import { env } from "@/env";
import nodemailer from "nodemailer";

type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
};

function redactSmtpUrl(raw: string) {
  try {
    const url = new URL(raw);
    if (url.username) {
      url.username = "REDACTED";
    }
    if (url.password) {
      url.password = "REDACTED";
    }
    return url.toString();
  } catch {
    return "INVALID_SMTP_URL";
  }
}

function buildTransport(smtpUrl: string) {
  const url = new URL(smtpUrl);
  const secure = url.protocol === "smtps:";
  const host = url.hostname;
  const port = url.port ? Number(url.port) : secure ? 465 : 587;

  const user = decodeURIComponent(url.username || "");
  const pass = url.password ? decodeURIComponent(url.password) : user;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass } : undefined,
  });
}

export async function sendEmail({ to, subject, text }: SendEmailParams) {
  if (!env.SMTP_URL || !env.EMAIL_FROM) {
    console.log("DEV_EMAIL (SMTP not configured)", { to, subject, text });
    return { ok: true as const, skipped: true as const };
  }

  const redacted = redactSmtpUrl(env.SMTP_URL);

  console.log("EMAIL_SEND_ATTEMPT", {
    to,
    subject,
    from: env.EMAIL_FROM,
    smtp: redacted,
  });

  try {
    const transport = buildTransport(env.SMTP_URL);
    await transport.verify();

    const info = await transport.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      text,
    });

    console.log("EMAIL_SEND_SUCCESS", {
      to,
      subject,
      messageId: info.messageId,
      response: info.response,
    });

    return {
      ok: true as const,
      skipped: false as const,
      messageId: info.messageId,
    };
  } catch (err) {
    console.error("EMAIL_SEND_ERROR", {
      to,
      subject,
      smtp: redacted,
      error:
        err instanceof Error
          ? { name: err.name, message: err.message, stack: err.stack }
          : err,
    });
    throw err;
  }
}
