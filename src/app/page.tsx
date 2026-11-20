import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser, homeFor } from "@/lib/auth";
import HomeClient from "./HomeClient";

// Login persistence: a signed-in visitor who opens the site (typing the address, a bookmark,
// or a link from elsewhere) goes straight to their dashboard. Clicking "Home" inside the site
// still shows this page.
export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    const h = await headers();
    const referer = h.get("referer");
    let fromThisSite = false;
    try {
      fromThisSite = !!referer && new URL(referer).host === h.get("host");
    } catch {
      fromThisSite = false;
    }
    if (!fromThisSite) redirect(homeFor(user));
  }
  return <HomeClient signedIn={!!user} />;
}
