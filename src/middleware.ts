import { NextResponse, type NextRequest } from "next/server";

const PRIVATE = ["/dashboard", "/onboarding", "/journal", "/community", "/appointments", "/profile", "/settings", "/admin", "/notifications"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPrivate = PRIVATE.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // Quick check: no session cookie at all → straight to login, remembering where they were going.
  if (isPrivate && !request.cookies.has("sm_session")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  // Pass the requested path to pages, so a full session check can send people back after login.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname + search);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
