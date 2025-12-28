import "server-only";

import { headers } from "next/headers";

export async function getRequestIp() {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }
  const realIp = headerList.get("x-real-ip");
  if (realIp) {
    return realIp;
  }
  return null;
}
