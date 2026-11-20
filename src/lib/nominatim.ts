// Talks to OpenStreetMap's free place search (Nominatim).
// Their rules: identify the app, max 1 request per second, and cache results.
const BASE = "https://nominatim.openstreetmap.org";
const USER_AGENT = "SentinelMotherhood-ScienceFair/1.0";
const CACHE_MS = 60 * 60 * 1000;

const cache = new Map<string, { at: number; data: unknown }>();
let queue: Promise<unknown> = Promise.resolve();
let lastCall = 0;

export async function nominatim<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = `${BASE}${path}?${new URLSearchParams(params)}`;
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.data as T;

  const run = queue.then(async () => {
    const wait = lastCall + 1100 - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastCall = Date.now();
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "en" },
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) throw new Error(`nominatim ${res.status}`);
    const data = await res.json();
    cache.set(url, { at: Date.now(), data });
    return data as T;
  });
  queue = run.catch(() => undefined);
  return run;
}

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}
