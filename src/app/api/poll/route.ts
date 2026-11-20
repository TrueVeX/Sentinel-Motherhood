import { getCurrentUser } from "@/lib/auth";
import { read, update } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CHOICES = ["yes", "maybe", "no"] as const;
type Choice = (typeof CHOICES)[number];
const EMPTY = { yes: 0, maybe: 0, no: 0 };

export async function GET() {
  return Response.json(await read("poll", EMPTY), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const choice = body?.choice as Choice;
  if (!CHOICES.includes(choice)) return Response.json({ error: "bad_choice" }, { status: 400 });
  const counts = await update("poll", EMPTY, (c) => ({ ...c, [choice]: c[choice] + 1 }));
  return Response.json(counts);
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return Response.json({ error: "admin_only" }, { status: 403 });
  return Response.json(await update("poll", EMPTY, () => EMPTY));
}
