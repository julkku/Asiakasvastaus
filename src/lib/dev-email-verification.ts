import "server-only";

import { env } from "@/env";

export type DevEmailVerificationMode = "link" | "button" | "off";

export function getDevEmailVerificationMode(): DevEmailVerificationMode {
  if (env.NODE_ENV !== "development") {
    return "off";
  }
  return (env.DEV_EMAIL_VERIFICATION_MODE ?? "off") as DevEmailVerificationMode;
}

export function isDevEmailVerificationEnabled() {
  return getDevEmailVerificationMode() !== "off";
}
