import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { confirmHandoff, HANDOFF_COOKIE } from "@/lib/app-signin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/auth/app/confirm → the "Yes, sign in the app" button on /app-signin.
export async function POST(request: Request) {
  const ticket = (await cookies()).get(HANDOFF_COOKIE)?.value;
  const ok = await confirmHandoff(ticket);
  return NextResponse.redirect(new URL(ok ? "/app-signin?done=1" : "/app-signin", request.url), 303);
}
