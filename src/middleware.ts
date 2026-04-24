import { unsealData } from "iron-session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionOptions, SessionData } from "@/lib/session";

// ---------------------------------------------------------------------------
// NOTE ON EDGE RUNTIME COMPATIBILITY
//
// This middleware runs on the Next.js Edge runtime. As a result:
//
//   1. `cookies()` from "next/headers" is NOT available here.
//      Therefore `getSession()` / `isAdmin()` from "@/lib/auth" cannot be
//      called from middleware (they use next/headers internally).
//
//   2. `getIronSession(request.cookies, ...)` does NOT work either — the
//      Next.js `RequestCookies` type is structurally incompatible with
//      iron-session's `CookieStore` interface (different `set` signatures).
//
//   3. The correct Edge-compatible approach is to read the raw cookie value
//      and call `unsealData()` directly. This uses the same AES-256-GCM /
//      Web Crypto API mechanism as `getIronSession`, works in Edge, and
//      is TypeScript strict clean.
//
// SECURITY ARCHITECTURE:
//   1. This middleware: unsealData() → cryptographic iron-session validation
//      → early UX redirect before layout renders
//   2. (dashboard)/layout.tsx: getSession() → second validation layer
//   3. /api/admin/* routes: requireAdmin() → authoritative security boundary
//      for all data mutations and reads
// ---------------------------------------------------------------------------

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Skip login routes
  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // Protect admin routes — validate the iron-session cookie cryptographically.
  // Fail closed: any error (wrong secret, corrupted cookie, missing SESSION_SECRET,
  // forged cookie, expired seal) results in a redirect to /login.
  if (pathname.startsWith("/admin")) {
    try {
      const cookie = request.cookies.get(sessionOptions.cookieName);

      if (!cookie?.value) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      // unsealData() decrypts and verifies the iron-session cookie.
      // It uses the same AES-256-GCM mechanism as getIronSession, including
      // embedded TTL validation (expires sealed data older than maxAge).
      // Throws if the password is wrong, cookie is corrupted, or seal is expired.
      const session = await unsealData<SessionData>(cookie.value, {
        password: sessionOptions.password,
      });

      if (
        !session.isLoggedIn ||
        (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")
      ) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch {
      // Covers: wrong/missing SESSION_SECRET, corrupted cookie,
      // forged value, expired session, iron-session validation errors.
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
