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

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "",
  cookieName: "admin-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};
