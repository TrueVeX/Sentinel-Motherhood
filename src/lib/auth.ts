import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { read, update } from "./store";

export type Role = "mother" | "professional" | "admin";
export type Journey = "pregnancy" | "birth" | "motherhood";

type StoredUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  journey: Journey | null;
  dueDate: string | null;
  babyBirthDate: string | null;
  onboarded: boolean;
  /** Empty for accounts created with Google or Apple until a password is set. */
  passwordHash: string;
  salt: string;
  /** The Google / Apple account IDs this user can sign in with. */
  google?: string;
  apple?: string;
  createdAt: string;
};
export type Provider = "google" | "apple";
export type User = Omit<StoredUser, "passwordHash" | "salt" | "google" | "apple"> & {
  hasPassword: boolean;
  linked: Provider[];
};

type Session = { tokenHash: string; userId: string; expires: number };

const USERS = { list: [] as StoredUser[] };
const SESSIONS = { list: [] as Session[] };
export const SESSION_COOKIE = "sm_session";
const SESSION_DAYS = 30;

const hash = (password: string, salt: string) => crypto.scryptSync(password, salt, 64).toString("hex");
const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
const strip = ({ passwordHash, salt: _s, google, apple, ...user }: StoredUser): User => ({
  ...user,
  hasPassword: !!passwordHash,
  linked: [...(google ? ["google" as const] : []), ...(apple ? ["apple" as const] : [])]
});

export const JOURNEYS: Record<Journey, { title: string; text: string; icon: string }> = {
  pregnancy: { title: "Pregnancy journey", text: "Track your pregnancy week by week, follow baby’s development and celebrate milestones.", icon: "✳" },
  birth: { title: "Birth journey", text: "Prepare for delivery with your hospital checklist, appointments and birth plan.", icon: "⌂" },
  motherhood: { title: "Motherhood journey", text: "Newborn care, feeding guidance and your baby’s development milestones.", icon: "☼" }
};

export async function createUser(input: {
  name: string;
  email: string;
  password?: string;
  role: Role;
  google?: string;
  apple?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const salt = crypto.randomBytes(16).toString("hex");
  let created: StoredUser | null = null;
  await update("users", USERS, (db) => {
    if (db.list.some((u) => u.email === email)) return db;
    created = {
      id: crypto.randomUUID(),
      email,
      name: input.name.trim(),
      // The very first account becomes the admin, so the project owner can manage the site.
      role: db.list.length === 0 ? "admin" : input.role,
      journey: null,
      dueDate: null,
      babyBirthDate: null,
      onboarded: false,
      passwordHash: input.password ? hash(input.password, salt) : "",
      salt,
      ...(input.google ? { google: input.google } : {}),
      ...(input.apple ? { apple: input.apple } : {}),
      createdAt: new Date().toISOString()
    };
    return { list: [...db.list, created] };
  });
  return created ? strip(created) : null;
}

export async function checkPassword(email: string, password: string): Promise<User | null> {
  const db = await read("users", USERS);
  const user = db.list.find((u) => u.email === email.trim().toLowerCase());
  if (!user || !user.passwordHash) {
    hash(password, "timing-equaliser");
    return null;
  }
  const a = Buffer.from(hash(password, user.salt), "hex");
  const b = Buffer.from(user.passwordHash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? strip(user) : null;
}

export async function setPassword(userId: string, password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  await update("users", USERS, (db) => ({
    list: db.list.map((u) => (u.id === userId ? { ...u, salt, passwordHash: hash(password, salt) } : u))
  }));
}

/**
 * Signing in with Google or Apple. Finds the account already linked to that provider ID; otherwise
 * links an existing account with the same *verified* email; otherwise creates a new account.
 */
export async function signInWithProvider(input: {
  provider: Provider;
  subject: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
}): Promise<{ user: User; isNew: boolean } | null> {
  const email = input.email?.trim().toLowerCase() || null;
  let found: StoredUser | null = null;
  await update("users", USERS, (db) => {
    const byProvider = db.list.find((u) => u[input.provider] === input.subject);
    if (byProvider) {
      found = byProvider;
      return db;
    }
    const byEmail = email && input.emailVerified ? db.list.find((u) => u.email === email) : undefined;
    if (byEmail) {
      found = { ...byEmail, [input.provider]: input.subject };
      return { list: db.list.map((u) => (u.id === byEmail.id ? found! : u)) };
    }
    return db;
  });
  if (found) return { user: strip(found), isNew: false };

  const fallbackEmail = `${input.provider}-${input.subject}@users.sentinel.invalid`;
  const created = await createUser({
    name: input.name?.trim().slice(0, 60) || "Sentinel member",
    // A new account needs an email nobody else has; use a placeholder if the provider gave none.
    email: email && !(await read("users", USERS)).list.some((u) => u.email === email) ? email : fallbackEmail,
    role: "mother",
    [input.provider]: input.subject
  });
  return created ? { user: created, isNew: true } : null;
}

export async function updateUser(userId: string, changes: Partial<Omit<User, "id" | "createdAt" | "hasPassword" | "linked">>) {
  await update("users", USERS, (db) => ({ list: db.list.map((u) => (u.id === userId ? { ...u, ...changes } : u)) }));
}

export async function listUsers(): Promise<User[]> {
  return (await read("users", USERS)).list.map(strip);
}

export async function deleteUser(userId: string) {
  await update("users", USERS, (db) => ({ list: db.list.filter((u) => u.id !== userId) }));
  await update("sessions", SESSIONS, (db) => ({ list: db.list.filter((s) => s.userId !== userId) }));
}

// Sessions: the browser keeps a random token in a cookie; the server only stores its hash.
export async function startSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  await update("sessions", SESSIONS, (db) => ({
    list: [...db.list.filter((s) => s.expires > Date.now()), { tokenHash: sha256(token), userId, expires }]
  }));
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const tokenHash = sha256(token);
    await update("sessions", SESSIONS, (db) => ({ list: db.list.filter((s) => s.tokenHash !== tokenHash) }));
  }
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const tokenHash = sha256(token);
  const session = (await read("sessions", SESSIONS)).list.find((s) => s.tokenHash === tokenHash);
  if (!session || session.expires < Date.now()) return null;
  const user = (await read("users", USERS)).list.find((u) => u.id === session.userId);
  return user ? strip(user) : null;
}

/** The page the visitor asked for (set by middleware), so login can send them back there. */
export async function currentPath() {
  return (await headers()).get("x-pathname") || "/dashboard";
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(await currentPath())}`);
  return user;
}

export async function requireRole(...roles: Role[]): Promise<User> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard?notice=no-access");
  return user;
}

/** Only allow redirects back to pages on this site (never to another website). */
export function safeNext(next: unknown): string | null {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  if (/^\/(login|signup)(\/|\?|$)/.test(next)) return null;
  return next;
}

export function homeFor(user: User) {
  return user.onboarded ? "/dashboard" : "/onboarding";
}

export function pregnancyWeek(user: Pick<User, "dueDate">): number | null {
  if (!user.dueDate) return null;
  const due = new Date(`${user.dueDate}T00:00:00`);
  const days = 280 - Math.round((due.getTime() - Date.now()) / 86400000);
  if (days < 0 || days > 44 * 7) return null;
  return Math.max(1, Math.min(42, Math.floor(days / 7)));
}
