import crypto from "node:crypto";
import type { Provider } from "./auth";

/**
 * "Sign in with Google" and "Sign in with Apple" (OpenID Connect, authorization-code flow).
 *
 * 1. /api/auth/<provider>/start  — remember a random `state` + `nonce` in a short-lived cookie and
 *    send the visitor to Google/Apple.
 * 2. /api/auth/<provider>/callback — check `state`, swap the one-time `code` for an ID token
 *    directly with Google/Apple (server to server, over HTTPS), check the token is for this app,
 *    then sign the visitor in.
 */

const GOOGLE = {
  authorize: "https://accounts.google.com/o/oauth2/v2/auth",
  token: "https://oauth2.googleapis.com/token",
  issuers: ["https://accounts.google.com", "accounts.google.com"]
};
const APPLE = {
  authorize: "https://appleid.apple.com/auth/authorize",
  token: "https://appleid.apple.com/auth/token",
  issuers: ["https://appleid.apple.com"]
};

export function isConfigured(provider: Provider) {
  if (provider === "google") return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  return !!(process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY);
}

/** Which buttons to show. In development they always show, so the setup can be tested. */
export function enabledProviders() {
  const dev = process.env.NODE_ENV === "development";
  return { google: dev || isConfigured("google"), apple: dev || isConfigured("apple") };
}

/** The address Google/Apple send people back to. Must match what's registered with them exactly. */
export function callbackUrl(provider: Provider, request: Request) {
  const base = process.env.APP_URL?.replace(/\/$/, "") || new URL(request.url).origin;
  return `${base}/api/auth/${provider}/callback`;
}

const random = () => crypto.randomBytes(24).toString("base64url");

export type OAuthState = { state: string; nonce: string; verifier?: string; next: string };

export function newState(next: string, withPkce: boolean): OAuthState {
  return { state: random(), nonce: random(), next, ...(withPkce ? { verifier: random() + random() } : {}) };
}

export const stateCookieName = (provider: Provider) => `sm_oauth_${provider}`;
export const encodeState = (s: OAuthState) => Buffer.from(JSON.stringify(s)).toString("base64url");
export function decodeState(value: string | undefined): OAuthState | null {
  if (!value) return null;
  try {
    const s = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    return typeof s.state === "string" && typeof s.nonce === "string" ? s : null;
  } catch {
    return null;
  }
}

export function sameSecret(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export function authorizeUrl(provider: Provider, redirectUri: string, s: OAuthState) {
  if (provider === "google") {
    const challenge = crypto.createHash("sha256").update(s.verifier!).digest("base64url");
    return `${GOOGLE.authorize}?${new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state: s.state,
      nonce: s.nonce,
      code_challenge: challenge,
      code_challenge_method: "S256",
      prompt: "select_account"
    })}`;
  }
  // Apple posts the result back as a form when asking for name + email.
  return `${APPLE.authorize}?${new URLSearchParams({
    client_id: process.env.APPLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    response_mode: "form_post",
    scope: "name email",
    state: s.state,
    nonce: s.nonce
  })}`;
}

/** Apple's "client secret" is a short-lived token signed with the private key from the Apple Developer site. */
function appleClientSecret() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "ES256", kid: process.env.APPLE_KEY_ID! };
  const payload = {
    iss: process.env.APPLE_TEAM_ID!,
    iat: now,
    exp: now + 300,
    aud: "https://appleid.apple.com",
    sub: process.env.APPLE_CLIENT_ID!
  };
  const part = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const data = `${part(header)}.${part(payload)}`;
  // Keys pasted into env settings often have "\n" written out; turn them back into real line breaks.
  const key = process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const signature = crypto.sign("sha256", Buffer.from(data), { key, dsaEncoding: "ieee-p1363" });
  return `${data}.${signature.toString("base64url")}`;
}

export type Identity = { subject: string; email: string | null; emailVerified: boolean; name: string | null };

/** Swap the one-time code for the user's identity, and check the ID token is genuinely for this app. */
export async function exchangeCode(provider: Provider, code: string, redirectUri: string, s: OAuthState): Promise<Identity> {
  const cfg = provider === "google" ? GOOGLE : APPLE;
  const clientId = provider === "google" ? process.env.GOOGLE_CLIENT_ID! : process.env.APPLE_CLIENT_ID!;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: provider === "google" ? process.env.GOOGLE_CLIENT_SECRET! : appleClientSecret(),
    ...(s.verifier ? { code_verifier: s.verifier } : {})
  });
  const res = await fetch(cfg.token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body,
    signal: AbortSignal.timeout(15000)
  });
  const json = (await res.json().catch(() => ({}))) as { id_token?: string; error?: string };
  if (!res.ok || !json.id_token) throw new Error(`token exchange failed (${res.status} ${json.error ?? ""})`);

  // The ID token came straight from the provider over HTTPS, so its contents can be trusted;
  // still check it was issued to this app, for this sign-in, and hasn't expired.
  const [, payloadPart] = json.id_token.split(".");
  const claims = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as Record<string, unknown>;
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!cfg.issuers.includes(String(claims.iss))) throw new Error("wrong issuer");
  if (!aud.includes(clientId)) throw new Error("token not for this app");
  if (typeof claims.exp !== "number" || claims.exp * 1000 < Date.now() - 60_000) throw new Error("token expired");
  if (claims.nonce !== undefined && claims.nonce !== s.nonce) throw new Error("nonce mismatch");
  if (typeof claims.sub !== "string" || !claims.sub) throw new Error("no account id");

  return {
    subject: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    emailVerified: claims.email_verified === true || claims.email_verified === "true",
    name: typeof claims.name === "string" ? claims.name : null
  };
}
