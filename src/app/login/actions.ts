"use server";

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { z } from "zod";
import { cookies } from "next/headers";

import { getDb } from "@/db/client";
import { users } from "@/db/schema";
import {
  createSession,
  hashPassword,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { getRequestIp } from "@/lib/request";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { checkRegistrationThrottle } from "@/lib/registration-limits";
import { isTrialDeviceKnown, recordTrialDevice } from "@/lib/trial-device";
import { createEmailVerification, resendVerificationEmail } from "@/lib/email-verification";
import { randomBytes } from "node:crypto";
import { env } from "@/env";

export type ActionState = {
  error?: string;
  success?: string;
  email?: string;
  trialAlreadyUsed?: boolean;
};

export type ResendVerificationState = {
  error?: string;
  success?: string;
  email?: string;
};

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}

const registerSchema = z.object({
  name: z.string().trim().max(120).optional(),
  email: z.string().email("Anna kelvollinen sähköpostiosoite").toLowerCase(),
  password: z
    .string()
    .min(8, "Salasanan pitää olla vähintään 8 merkkiä pitkä")
    .max(128, "Salasana saa olla enintään 128 merkkiä pitkä"),
  turnstileToken: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Anna kelvollinen sähköpostiosoite").toLowerCase(),
  password: z.string().min(8, "Salasanan pitää olla vähintään 8 merkkiä pitkä"),
});

export async function registerAction(_: ActionState, formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: getValue(formData, "name"),
    email: getValue(formData, "email"),
    password: getValue(formData, "password"),
    turnstileToken: getValue(formData, "cf-turnstile-response"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Virheellinen syöte." };
  }

  const { email, name, password, turnstileToken } = parsed.data;

  const ip = await getRequestIp();
  const throttle = await checkRegistrationThrottle(ip);
  if (!throttle.allowed) {
    return {
      error: "Rekisteröintejä on liikaa samasta IP-osoitteesta. Yritä myöhemmin uudelleen.",
    };
  }

  const turnstile = await verifyTurnstileToken(turnstileToken, ip);
  if (!turnstile.success) {
    return { error: turnstile.error ?? "CAPTCHA epäonnistui." };
  }

  const db = getDb();
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return { error: "Sähköposti on jo rekisteröity." };
  }

  const passwordHash = await hashPassword(password);
  const now = Date.now();
  const userId = nanoid();

  const cookieStore = await cookies();
  let deviceId = cookieStore.get("trial_device_id")?.value;
  if (!deviceId) {
    deviceId = randomBytes(32).toString("hex");
    cookieStore.set("trial_device_id", deviceId, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const isDeviceKnown = await isTrialDeviceKnown(deviceId);
  const trialStartsAt = now;
  const trialEndsAt = !isDeviceKnown
    ? now + 7 * 24 * 60 * 60 * 1000
    : now;

  await db.insert(users).values({
    id: userId,
    email,
    name: name?.length ? name : null,
    passwordHash,
    createdAt: now,
    trialStartedAt: trialStartsAt,
    trialEndsAt: trialEndsAt,
    emailVerifiedAt: null,
  });

  if (!isDeviceKnown) {
    await recordTrialDevice({ deviceId, userId });
  }

  const session = await createSession(userId);
  await setSessionCookie(session.token, session.expiresAt);

  await createEmailVerification(userId, email);

  return {
    success:
      "Vahvistuslinkki on lähetetty sähköpostiisi. Tarkista sähköposti ja klikkaa vahvistuslinkkiä.",
    email,
    trialAlreadyUsed: isDeviceKnown,
  };
}

export async function loginAction(_: ActionState, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: getValue(formData, "email"),
    password: getValue(formData, "password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Virheelliset tunnukset.",
    };
  }

  const { email, password } = parsed.data;

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    return { error: "Virheellinen sähköposti tai salasana." };
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) {
    return { error: "Virheellinen sähköposti tai salasana." };
  }

  const session = await createSession(user.id);
  await setSessionCookie(session.token, session.expiresAt);

  redirect("/app/new");
}

export async function resendVerificationAction(_: ActionState, formData: FormData) {
  const email = getValue(formData, "email");
  if (!email) {
    return { error: "Anna sähköpostiosoite." };
  }

  await resendVerificationEmail(email);
  return {
    success:
      "Jos sähköposti on rekisteröity, vahvistuslinkki on lähetetty uudelleen.",
    email,
  };
}
