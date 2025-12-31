import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters long"),
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required").optional(),
  OPENAI_MODEL: z.string().min(1).default("gpt-5-mini"),
  APP_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().min(1).optional(),
  TURNSTILE_SITE_KEY: z.string().min(1).optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
  SMTP_URL: z.string().min(1).optional(),
  DEBUG_EMAIL_SECRET: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_PRICE_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  DEV_EMAIL_VERIFICATION_MODE: z
    .enum(["link", "button", "off"])
    .optional()
    .default("off"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

function optionalEnv(value: string | undefined) {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL ?? "gpt-5-mini",
  APP_URL: optionalEnv(process.env.APP_URL),
  NEXT_PUBLIC_APP_URL: optionalEnv(process.env.NEXT_PUBLIC_APP_URL),
  TURNSTILE_SITE_KEY: optionalEnv(process.env.TURNSTILE_SITE_KEY),
  TURNSTILE_SECRET_KEY: optionalEnv(process.env.TURNSTILE_SECRET_KEY),
  EMAIL_FROM: optionalEnv(process.env.EMAIL_FROM),
  SMTP_URL: optionalEnv(process.env.SMTP_URL),
  DEBUG_EMAIL_SECRET: optionalEnv(process.env.DEBUG_EMAIL_SECRET),
  STRIPE_SECRET_KEY: optionalEnv(process.env.STRIPE_SECRET_KEY),
  STRIPE_WEBHOOK_SECRET: optionalEnv(process.env.STRIPE_WEBHOOK_SECRET),
  STRIPE_PRICE_ID: optionalEnv(process.env.STRIPE_PRICE_ID),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalEnv(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  ),
  DEV_EMAIL_VERIFICATION_MODE:
    process.env.DEV_EMAIL_VERIFICATION_MODE ?? "off",
  NODE_ENV: process.env.NODE_ENV ?? "development",
});
