"use server";

import "server-only";

import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { createHmac, randomBytes } from "node:crypto";

import { db } from "@/db/client";
import { env } from "@/env";
import { sessions, users } from "@/db/schema";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

function hashToken(token: string) {
  return createHmac("sha256", env.SESSION_SECRET).update(token).digest("hex");
}

function getCookieOptions(expiresAt: number) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)),
  };
}

export async function hashPassword(password: string) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const now = Date.now();
  const expiresAt = now + SESSION_DURATION_MS;

  await db.insert(sessions).values({
    id: nanoid(),
    tokenHash,
    userId,
    createdAt: now,
    expiresAt,
  });

  return { token, expiresAt };
}

export async function deleteSessionByToken(token: string) {
  const tokenHash = hashToken(token);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export async function getUserFromSessionCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);
  const now = Date.now();

  const [session] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)),
    )
    .limit(1);

  if (!session) {
    return null;
  }

  return session;
}

export async function requireUser() {
  const user = await getUserFromSessionCookie();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function setSessionCookie(token: string, expiresAt: number) {
  const cookieStore = await cookies();
  cookieStore.set("session", token, getCookieOptions(expiresAt));
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
