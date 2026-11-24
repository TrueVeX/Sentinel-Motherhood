import { NextResponse } from "next/server";
import { startSession } from "@/lib/auth";
import { claimHandoff, isAppId } from "@/lib/app-signin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/auth/app/finish?id=… → opened by the desktop app once the person confirmed in the browser.
// Signs the app's own window in, then goes to their dashboard (or wherever they were heading).
export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const claimed = isAppId(id) ? await claimHandoff(id) : null;
  if (!claimed) return NextResponse.redirect(new URL("/login?error=oauth-expired", url), 303);
  await startSession(claimed.userId);
  return NextResponse.redirect(new URL(claimed.next, url), 303);
}
