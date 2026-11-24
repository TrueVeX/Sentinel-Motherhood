import crypto from "node:crypto";
import { read, update } from "./store";

/**
 * Google and Apple don't allow signing in inside the desktop app's window, so the app opens the
 * normal browser instead. This "hand-off" carries that sign-in back into the app:
 *
 * 1. The app makes a secret id and a 6-digit code, opens the browser with both, and shows the code.
 * 2. After Google/Apple, the browser shows the same code and asks "Sign in the Sentinel app?".
 * 3. Once confirmed, the app (which keeps checking with its secret id) opens /api/auth/app/finish,
 *    which signs the app in. Each hand-off works once and expires after 10 minutes.
 */
type Handoff = { idHash: string; ticketHash: string; userId: string; code: string; next: string; confirmed: boolean; expires: number };

const TABLE = { list: [] as Handoff[] };
const LIFETIME = 10 * 60 * 1000;
export const HANDOFF_COOKIE = "sm_app_signin";

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");
const live = (h: Handoff) => h.expires > Date.now();

export const isAppId = (v: unknown): v is string => typeof v === "string" && /^[a-f0-9]{64}$/.test(v);
export const isAppCode = (v: unknown): v is string => typeof v === "string" && /^[0-9]{6}$/.test(v);

/** Called after Google/Apple sign-in in the browser. Returns a ticket for the browser's cookie. */
export async function createHandoff(appId: string, code: string, userId: string, next: string) {
  const ticket = crypto.randomBytes(32).toString("hex");
  const idHash = sha256(appId);
  await update("app-signins", TABLE, (db) => ({
    list: [
      ...db.list.filter((h) => live(h) && h.idHash !== idHash),
      { idHash, ticketHash: sha256(ticket), userId, code, next, confirmed: false, expires: Date.now() + LIFETIME }
    ]
  }));
  return ticket;
}

/** What the browser's confirm page shows. */
export async function handoffForTicket(ticket: string | undefined) {
  if (!ticket) return null;
  const ticketHash = sha256(ticket);
  return (await read("app-signins", TABLE)).list.find((h) => h.ticketHash === ticketHash && live(h)) ?? null;
}

/** The person confirmed in the browser that the code matches their app. */
export async function confirmHandoff(ticket: string | undefined) {
  if (!ticket) return false;
  const ticketHash = sha256(ticket);
  let found = false;
  await update("app-signins", TABLE, (db) => ({
    list: db.list.filter(live).map((h) => {
      if (h.ticketHash !== ticketHash) return h;
      found = true;
      return { ...h, confirmed: true };
    })
  }));
  return found;
}

/** The app checks in: still waiting, ready to finish, or gone (expired / cancelled). */
export async function handoffStatus(appId: string): Promise<"waiting" | "ready" | "gone"> {
  const idHash = sha256(appId);
  const h = (await read("app-signins", TABLE)).list.find((x) => x.idHash === idHash && live(x));
  return !h ? "gone" : h.confirmed ? "ready" : "waiting";
}

/** Used once by the app to finish signing in. Removes the hand-off. */
export async function claimHandoff(appId: string): Promise<{ userId: string; next: string } | null> {
  const idHash = sha256(appId);
  let claimed: Handoff | null = null;
  await update("app-signins", TABLE, (db) => ({
    list: db.list.filter((h) => {
      if (h.idHash === idHash && h.confirmed && live(h)) {
        claimed = h;
        return false;
      }
      return live(h);
    })
  }));
  const c = claimed as Handoff | null;
  return c ? { userId: c.userId, next: c.next } : null;
}
