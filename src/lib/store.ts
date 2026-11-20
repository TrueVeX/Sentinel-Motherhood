import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";

/**
 * A tiny document database. Each "table" (users, sessions, poll, …) is one JSON value.
 *
 * - Online (Vercel): stored in Upstash Redis, connected through the Vercel Marketplace.
 *   Vercel can't keep files between requests, so this is required there.
 * - On this laptop without Redis settings: stored as files in the .data folder.
 */

// The Vercel Marketplace sets KV_REST_API_*; a direct Upstash setup uses UPSTASH_REDIS_REST_*.
const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const PREFIX = "sentinel:";

let redis: Redis | null = null;
function getRedis() {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  // Created on first use, so building the site never needs the database.
  if (!redis) redis = new Redis({ url: REDIS_URL, token: REDIS_TOKEN, automaticDeserialization: false });
  return redis;
}

export function storageMode() {
  return getRedis() ? "redis" : "files";
}

function parse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

// ---------- Files (local) ----------
const DIR = path.join(process.cwd(), ".data");

async function readFileValue(name: string) {
  try {
    return await readFile(path.join(DIR, `${name}.json`), "utf8");
  } catch {
    return null;
  }
}

async function writeFileValue(name: string, value: unknown) {
  await mkdir(DIR, { recursive: true });
  await writeFile(path.join(DIR, `${name}.json`), JSON.stringify(value, null, 2));
}

// Within one server, updates run one at a time so two visitors saving together don't overwrite each other.
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
}

// ---------- Redis (online) ----------
// Save only if nobody else saved since we read (checked with a version number), all in one step.
const SAVE_IF_UNCHANGED = `
local current = redis.call('GET', KEYS[2]) or '0'
if current ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[1], ARGV[2])
redis.call('INCR', KEYS[2])
return 1`;

async function updateRedis<T>(db: Redis, name: string, fallback: T, change: (current: T) => T): Promise<T> {
  const key = PREFIX + name;
  const versionKey = `${key}:version`;
  // Several servers can run at once online; if another one saved first, read again and retry.
  for (let attempt = 0; attempt < 10; attempt++) {
    const [raw, version] = await db.mget<(string | null)[]>(key, versionKey);
    const next = change(parse(raw, fallback));
    const saved = await db.eval(SAVE_IF_UNCHANGED, [key, versionKey], [String(version ?? "0"), JSON.stringify(next)]);
    if (Number(saved) === 1) return next;
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 60 * (attempt + 1)));
  }
  throw new Error(`Couldn't save ${name}: too many people saving at once. Please try again.`);
}

// ---------- Public API ----------
export async function read<T>(name: string, fallback: T): Promise<T> {
  const db = getRedis();
  const raw = db ? await db.get<string>(PREFIX + name) : await readFileValue(name);
  return parse(raw, fallback);
}

export function update<T>(name: string, fallback: T, change: (current: T) => T): Promise<T> {
  return serial(async () => {
    const db = getRedis();
    if (db) return updateRedis(db, name, fallback, change);
    const next = change(parse(await readFileValue(name), fallback));
    await writeFileValue(name, next);
    return next;
  });
}
