import { NextResponse } from "next/server";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { openNotification } from "@/lib/notify";

// Clicking a notification: mark it read, then go to the content it's about.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  const url = new URL(request.url);
  if (!user) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(url.pathname)}`, url));
  const { id } = await params;
  const href = await openNotification(user.id, id);
  return NextResponse.redirect(new URL(safeNext(href) ?? "/notifications", url));
}
