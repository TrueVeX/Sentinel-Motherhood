import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { safeNext, type Provider } from "@/lib/auth";
import { authorizeUrl, callbackUrl, encodeState, isConfigured, newState, stateCookieName } from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROVIDERS: Provider[] = ["google", "apple"];

// GET /api/auth/google/start?next=/journal → off to Google (or Apple), remembering where to come back to.
export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const url = new URL(request.url);
  if (!PROVIDERS.includes(provider as Provider)) return NextResponse.redirect(new URL("/login", url), 303);
  const p = provider as Provider;
  if (!isConfigured(p)) return NextResponse.redirect(new URL(`/login?error=${p}-not-setup`, url), 303);

  const state = newState(safeNext(url.searchParams.get("next")) ?? "", p === "google");
  (await cookies()).set(stateCookieName(p), encodeState(state), {
    httpOnly: true,
    path: "/api/auth",
    maxAge: 600,
    // Apple sends people back with a cross-site form POST, which only carries SameSite=None cookies.
    sameSite: p === "apple" ? "none" : "lax",
    secure: p === "apple" || url.protocol === "https:"
  });
  return NextResponse.redirect(authorizeUrl(p, callbackUrl(p, request), state), 303);
}
