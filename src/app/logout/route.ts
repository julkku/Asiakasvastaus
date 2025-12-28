import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { clearSessionCookie, deleteSessionByToken } from "@/lib/auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (token) {
    await deleteSessionByToken(token);
  }

  await clearSessionCookie();

  return NextResponse.redirect(new URL("/login", request.url));
}
