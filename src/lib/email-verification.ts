import "server-only";

import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";

import { db } from "@/db/client";
import { emailVerificationTokens, users } from "@/db/schema";
import { hmacSha256 } from "@/lib/security";
import { sendEmail } from "@/lib/mailer";
import { env } from "@/env";
import { isDevEmailVerificationEnabled } from "@/lib/dev-email-verification";

const DEFAULT_APP_URL = "http://localhost:3000";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export async function createEmailVerification(userId: string, email: string) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hmacSha256(rawToken);
  const now = Date.now();

  await db.insert(emailVerificationTokens).values({
    id: nanoid(),
    userId,
    tokenHash,
    expiresAt: now + TOKEN_TTL_MS,
    createdAt: now,
  });

  const appUrl = env.APP_URL ?? DEFAULT_APP_URL;
  const verifyUrl = `${appUrl}/verify-email?token=${rawToken}`;

  await sendEmail({
    to: email,
    subject: "Vahvista sähköpostisi",
    text: `Vahvista sähköpostisi Asiakasvastaus-palveluun: ${verifyUrl}`,
  });

  if (isDevEmailVerificationEnabled()) {
    return verifyUrl;
  }

  return null;
}

export async function verifyEmailToken(rawToken: string) {
  const tokenHash = hmacSha256(rawToken);
  const now = Date.now();

  const token = await db.query.emailVerificationTokens.findFirst({
    where: eq(emailVerificationTokens.tokenHash, tokenHash),
  });

  if (!token || token.expiresAt < now) {
    return { success: false };
  }

  await db
    .update(users)
    .set({ emailVerifiedAt: now })
    .where(eq(users.id, token.userId));

  await db
    .delete(emailVerificationTokens)
    .where(eq(emailVerificationTokens.id, token.id));

  return { success: true, userId: token.userId };
}

export async function getEmailVerificationStatus(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { emailVerifiedAt: true },
  });
  return { isVerified: Boolean(user?.emailVerifiedAt) };
}

export async function resendVerificationEmail(email: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (!user) {
    return null;
  }
  return createEmailVerification(user.id, user.email);
}
