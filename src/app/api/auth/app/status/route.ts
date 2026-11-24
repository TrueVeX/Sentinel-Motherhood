import { NextResponse } from "next/server";
import { handoffStatus, isAppId } from "@/lib/app-signin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/auth/app/status?id=… → the desktop app checks whether its browser sign-in is done.
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  const status = isAppId(id) ? await handoffStatus(id) : "gone";
  return NextResponse.json({ status }, { headers: { "Cache-Control": "no-store" } });
}
