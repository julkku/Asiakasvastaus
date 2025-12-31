import "server-only";

import nodemailer from "nodemailer";

import { env } from "@/env";

type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail({ to, subject, text }: SendEmailParams) {
  if (!env.SMTP_URL || !env.EMAIL_FROM) {
    console.log("DEV_EMAIL", { to, subject, text });
    return;
  }

  try {
    const transport = nodemailer.createTransport(env.SMTP_URL);
    await transport.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      text,
    });
  } catch (error) {
    console.error("SMTP send failed", error);
    throw error;
  }
}
