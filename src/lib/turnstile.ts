import "server-only";

import { env } from "@/env";

type TurnstileResult = {
  success: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp?: string | null,
) {
  if (!env.TURNSTILE_SECRET_KEY) {
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "CAPTCHA puuttuu." };
  }

  const formData = new FormData();
  formData.append("secret", env.TURNSTILE_SECRET_KEY);
  formData.append("response", token);
  if (remoteIp) {
    formData.append("remoteip", remoteIp);
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
    },
  );

  const data = (await response.json()) as TurnstileResult;
  if (!data.success) {
    return { success: false, error: "CAPTCHA epäonnistui." };
  }

  return { success: true };
}
