import { redirect } from "next/navigation";

import { getUserFromSessionCookie } from "@/lib/auth";

export default async function Home() {
  const user = await getUserFromSessionCookie();

  redirect(user ? "/app/new" : "/login");
}
