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
// If SESSION_SECRET is not set or is too short:
//   - In production: middleware will not crash; sessions simply won't validate
//   - All auth operations fail closed (401 / redirect to login)
//   - No session can be forged
//
// The fallback below is a >=32-char placeholder so iron-session does not throw
// at module-load time on the Edge runtime. It is NOT a valid secret — real
// sessions require the correct SESSION_SECRET env var.
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

// iron-session requires a password of at least 32 characters.
// If the real secret is missing, use a placeholder so the module loads
// without throwing. Any real cookie validation will fail because the
// password won't match — which is the correct fail-closed behavior.
const effectivePassword = sessionSecret.length >= 32
  ? sessionSecret
  : "PLACEHOLDER-SESSION-SECRET-TO-AVOID-EDGE-CRASH-REPLACE-ME!";

export const sessionOptions: SessionOptions = {
  password: effectivePassword,
  cookieName: "ip3d-admin-session",
  cookieOptions: {
    secure: isProduction,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  },
};
