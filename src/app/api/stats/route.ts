import { getCurrentUser } from "@/lib/auth";
import { read, update } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMPTY_STATS = { visits: 0, questions: 0, aiAnswers: 0, offlineAnswers: 0 };
type Stats = typeof EMPTY_STATS;
const EVENTS: Record<string, keyof Stats> = {
  visit: "visits",
  offline: "offlineAnswers"
};

export async function GET() {
  return Response.json(await read("stats", EMPTY_STATS), { headers: { "Cache-Control": "no-store" } });
}

// The browser reports a visit once per session, and when it falls back to an offline answer.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const key = EVENTS[body?.event];
  if (!key) return Response.json({ error: "bad_event" }, { status: 400 });
  return Response.json(await update("stats", EMPTY_STATS, (s) => ({ ...s, [key]: s[key] + 1 })));
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return Response.json({ error: "admin_only" }, { status: 403 });
  return Response.json(await update("stats", EMPTY_STATS, () => EMPTY_STATS));
}
