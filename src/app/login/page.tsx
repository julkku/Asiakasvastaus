import { redirect } from "next/navigation";

import { getUserFromSessionCookie } from "@/lib/auth";
import { AuthForms } from "./forms";
import { env } from "@/env";

export default async function LoginPage() {
  const user = await getUserFromSessionCookie();

  if (user) {
    redirect("/app/new");
  }

  return <AuthForms turnstileSiteKey={env.TURNSTILE_SITE_KEY ?? ""} />;
}
