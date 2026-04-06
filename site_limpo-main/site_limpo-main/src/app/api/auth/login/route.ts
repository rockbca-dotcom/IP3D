import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

// ---------------------------------------------------------------------------
// In-process rate limiter for login attempts.
//
// Tracks failed attempts per client IP. On reaching RATE_LIMIT_MAX_ATTEMPTS
// within RATE_LIMIT_WINDOW_MS, subsequent requests receive HTTP 429 until
// the window resets.
//
// Limitation: this counter is per-process. In multi-instance or serverless
// (cold-start) deployments each instance has its own Map. Protection is
// still meaningful against rapid brute-force within a single warm instance.
// For shared-state rate limiting, replace loginAttemptMap with a Prisma
// table or an Upstash Redis client and keep the rest of the logic unchanged.
//
// No env-vars required for this implementation.
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5;

interface AttemptRecord {
  count: number;
  resetAt: number; // epoch ms when the window expires
}

const loginAttemptMap = new Map<string, AttemptRecord>();

function getClientIP(request: NextRequest): string {
  // x-forwarded-for may contain a comma-separated list; take the first (client) IP.
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown";
}

function getRateLimitState(ip: string): { limited: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const record = loginAttemptMap.get(ip);

  if (!record || record.resetAt <= now) {
    return { limited: false, retryAfterSeconds: 0 };
  }

  if (record.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000),
    };
  }

  return { limited: false, retryAfterSeconds: 0 };
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = loginAttemptMap.get(ip);

  if (!record || record.resetAt <= now) {
    loginAttemptMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    record.count += 1;
  }
}

function clearAttempts(ip: string): void {
  loginAttemptMap.delete(ip);
}

// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  // Check rate limit before any DB access.
  const { limited, retryAfterSeconds } = getRateLimitState(ip);
  if (limited) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Unified "invalid credentials" response for all failure cases:
    //   - user not found
    //   - wrong password
    //   - correct credentials but insufficient role
    //
    // Returning different errors (e.g. 403 for wrong role) would allow an
    // attacker to confirm that an email+password pair is valid even without
    // admin access (user-enumeration via role leak).
    //
    // All three paths record a failed attempt to prevent brute-force even
    // when the attacker happens to know a non-admin account's password.

    // user.active === false → conta inativada pelo SUPER_ADMIN.
    // Retorna a mesma mensagem genérica para não vazar se a conta existe.
    if (!user || !user.password || user.active === false) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      recordFailedAttempt(ip);
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // Successful login — clear the attempt counter for this IP.
    clearAttempts(ip);

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    session.userId = user.id;
    session.email = user.email;
    session.name = user.name || undefined;
    session.role = user.role;
    session.isLoggedIn = true;

    await session.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
