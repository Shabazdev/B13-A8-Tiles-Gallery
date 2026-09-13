/**
 * Middleware — edge-level protected route guard.
 * Checks for the Better Auth session cookie and redirects unauthenticated
 * users to /login (with a ?from= param so they return after signing in).
 *
 * Full server-side session verification also happens in the protected
 * page components themselves (defence in depth).
 */

import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/my-profile/:path*",
    "/update-profile/:path*",
    "/tile/:path*",
  ],
};
