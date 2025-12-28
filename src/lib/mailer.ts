import "server-only";

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

  console.warn("SMTP_URL configured but email transport not implemented.");
  console.log("DEV_EMAIL", { to, subject, text });
}
