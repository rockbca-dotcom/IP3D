import { SessionOptions } from "iron-session";

export interface SessionData {
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

// ---------------------------------------------------------------------------
// SESSION_SECRET is the HMAC key used by iron-session to sign and encrypt
// the admin-session cookie. It MUST be set via environment variable.
//
// Required: SESSION_SECRET — a random string of at least 32 characters.
//           Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
//
// If SESSION_SECRET is not set:
//   - iron-session will throw at getIronSession() call time (password < 32 chars)
//   - All auth operations fail closed (401 / redirect to login)
//   - No session can be forged or validated
//
// DO NOT add a fallback value here. A public/hardcoded fallback allows
// anyone who reads the source to forge valid admin session cookies.
// ---------------------------------------------------------------------------

// IMPORTANT: this module is imported by src/middleware.ts, which runs in the
// Edge runtime on every request. Do NOT import the global env validator here:
// it requires unrelated server-only variables (DATABASE_URL, payment creds, etc.)
// and can crash the middleware at module-evaluation time, turning a missing env
// into a site-wide 500 (MIDDLEWARE_INVOCATION_FAILED).
//
// Keep this file limited to the session vars required by auth itself.
const sessionSecret = process.env.SESSION_SECRET ?? "";
const isProduction = process.env.NODE_ENV === "production";

export const sessionOptions: SessionOptions = {
  password: sessionSecret,
  cookieName: "ip3d-admin-session",
  cookieOptions: {
    // secure: true only in production (HTTPS required)
    secure: isProduction,
    // httpOnly: prevent client-side JS access
    httpOnly: true,
    // sameSite: "lax" protects against CSRF while allowing some cross-site nav
    sameSite: "lax",
    // explicit path to restrict cookie scope
    path: "/",
    // maxAge: 7 days
    maxAge: 60 * 60 * 24 * 7,
  },
};
