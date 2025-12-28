import "server-only";

import { createHmac } from "node:crypto";

import { env } from "@/env";

export function hmacSha256(value: string) {
  return createHmac("sha256", env.SESSION_SECRET).update(value).digest("hex");
}
