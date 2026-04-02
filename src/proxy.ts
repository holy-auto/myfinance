import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/login", "/api/auth", "/api/debug", "/api/debug-auth"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files and API health check
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/api/health"
  ) {
    return NextResponse.next();
  }

  // next-auth v5 (Auth.js) のセッションCookie名
  // HTTP環境: authjs.session-token
  // HTTPS環境: __Secure-authjs.session-token
  const secureCookieName = "__Secure-authjs.session-token";
  const regularCookieName = "authjs.session-token";

  const sessionCookie =
    req.cookies.get(secureCookieName) ?? req.cookies.get(regularCookieName);

  if (!sessionCookie?.value) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
