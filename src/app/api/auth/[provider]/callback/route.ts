import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { homeFor, safeNext, signInWithProvider, startSession, type Provider } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { callbackUrl, decodeState, exchangeCode, isConfigured, sameSecret, stateCookieName } from "@/lib/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROVIDERS: Provider[] = ["google", "apple"];

async function finish(request: Request, provider: string, fields: { code?: string | null; state?: string | null; error?: string | null; user?: string | null }) {
  const url = new URL(request.url);
  const toLogin = (error: string) => NextResponse.redirect(new URL(`/login?error=${error}`, url), 303);
  if (!PROVIDERS.includes(provider as Provider)) return toLogin("oauth-failed");
  const p = provider as Provider;
  if (!isConfigured(p)) return toLogin(`${p}-not-setup`);

  const jar = await cookies();
  const saved = decodeState(jar.get(stateCookieName(p))?.value);
  jar.delete({ name: stateCookieName(p), path: "/api/auth" });

  if (fields.error) return toLogin("oauth-cancelled");
  // The state must match the one we sent, so nobody can trick a browser into someone else's sign-in.
  if (!saved || !fields.state || !fields.code || !sameSecret(saved.state, fields.state)) return toLogin("oauth-expired");

  try {
    const identity = await exchangeCode(p, fields.code, callbackUrl(p, request), saved);
    // Apple only sends the person's name the very first time, as a separate form field.
    if (p === "apple" && !identity.name && fields.user) {
      try {
        const n = JSON.parse(fields.user)?.name;
        identity.name = [n?.firstName, n?.lastName].filter(Boolean).join(" ") || null;
      } catch {
        /* no name given */
      }
    }

    const result = await signInWithProvider({ provider: p, ...identity });
    if (!result) return toLogin("oauth-failed");
    await startSession(result.user.id);
    if (result.isNew) {
      await notify(result.user.id, `Welcome to Sentinel, ${result.user.name.split(" ")[0]}! Finish setting up your profile.`, "/onboarding");
    }
    const next = safeNext(saved.next);
    const target = result.user.onboarded
      ? next ?? homeFor(result.user)
      : next?.startsWith("/onboarding") ? next : "/onboarding"; // keep a journey picked on sign-up
    return NextResponse.redirect(new URL(target, url), 303);
  } catch (e) {
    console.error(`${p} sign-in failed:`, e instanceof Error ? e.message : e);
    return toLogin("oauth-failed");
  }
}

// Google comes back with a normal link.
export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const q = new URL(request.url).searchParams;
  return finish(request, provider, { code: q.get("code"), state: q.get("state"), error: q.get("error") });
}

// Apple comes back by posting a form.
export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const form = await request.formData().catch(() => null);
  const get = (k: string) => (form?.get(k) as string | null) ?? null;
  return finish(request, provider, { code: get("code"), state: get("state"), error: get("error"), user: get("user") });
}
