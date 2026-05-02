import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// First-time admin bootstrap endpoint — public by design, self-locking by DB.
//
// Security model:
//
//   POST — creates a SUPER_ADMIN only when NO admin exists in the database.
//     The existence check and the INSERT run inside a Serializable transaction.
//     PostgreSQL's SSI (Serializable Snapshot Isolation) guarantees that two
//     concurrent requests cannot both observe "no admin" and both succeed:
//     one commits, the other receives a serialization error (P2034) and is
//     returned as HTTP 400 — fail-closed, no duplicate super-admin created.
//
//   GET — disabled in production (returns 404).
//     In development, returns { hasAdmin: bool } to support the setup UI.
//     Exposing this in production reveals bootstrap state to anonymous actors:
//     { hasAdmin: false } is a precise signal that the setup POST is exploitable.
//     After bootstrap, the self-locking DB guard makes POST harmless, but the
//     information leak is unnecessary — production deployments have no reason
//     to expose it.
//
// Self-locking lifecycle:
//   1. Fresh deploy       → POST creates SUPER_ADMIN. Route becomes inert.
//   2. Admin exists       → POST always returns 400. Endpoint is permanently safe.
//   3. All admins deleted → POST becomes active again.
//      Mitigation: recreate admins via a direct DB script, not via this endpoint.
//      Set SETUP_ENABLED env-var documentation here if re-bootstrap is ever needed.
//
// Env-vars required: none (same DB connection as the rest of the app).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// In-process rate limiter for setup attempts.
//
// Stricter than the login limiter (3 vs 5 attempts) because setup is a
// one-shot sensitive endpoint that should only ever be called a handful of
// times in the lifetime of the application.
//
// Same per-process limitation as the login rate limiter: each server instance
// maintains its own Map. Replace with a shared store (Redis / DB) if multi-
// instance deployments require coordinated rate limiting.
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 3;            // stricter than login (5)

interface AttemptRecord {
  count: number;
  resetAt: number; // epoch ms when the window expires
}

const setupAttemptMap = new Map<string, AttemptRecord>();

function getClientIP(request: NextRequest): string {
  // x-forwarded-for may contain a comma-separated list; take the first (client) IP.
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown";
}

function getRateLimitState(ip: string): { limited: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const record = setupAttemptMap.get(ip);

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

function recordAttempt(ip: string): void {
  const now = Date.now();
  const record = setupAttemptMap.get(ip);

  if (!record || record.resetAt <= now) {
    setupAttemptMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    record.count += 1;
  }
}

// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // Rate limit check — applied before any body parsing or DB access.
  // Incremented on every request unconditionally: unlike the login limiter,
  // there is no "clear on success" here because the endpoint self-locks after
  // the first admin is created regardless of the counter state.
  const ip = getClientIP(request);
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
  recordAttempt(ip);
  try {
    const { email, password, name } = await request.json();

    // Input validation — performed before any DB access or expensive hashing.
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 8 caracteres" },
        { status: 400 }
      );
    }

    // Hash before the transaction — bcrypt is CPU-bound async work that cannot
    // run inside a DB transaction. The hash is computed optimistically; if the
    // transaction reveals an existing admin, the hash is discarded (no side-effect).
    const hashedPassword = await bcrypt.hash(password, 12);

    // Serializable transaction — closes the TOCTOU race condition.
    //
    // Without this, two concurrent requests could both observe "no admin" at
    // READ COMMITTED isolation and both proceed to create a SUPER_ADMIN, leaving
    // an attacker-controlled super-admin in the database alongside the legitimate one.
    //
    // With SERIALIZABLE, PostgreSQL's SSI detects the phantom-read dependency and
    // aborts one of the two transactions with a serialization error (Prisma P2034).
    // That error is caught below and returned as HTTP 400.
    const user = await prisma.$transaction(
      async (tx) => {
        const existingAdmin = await tx.user.findFirst({
          where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
        });

        if (existingAdmin) {
          throw new Error("ADMIN_EXISTS");
        }

        return tx.user.create({
          data: {
            email,
            password: hashedPassword,
            name: name || "Administrador",
            role: "SUPER_ADMIN",
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

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
    // Explicit admin-exists signal thrown from inside the transaction.
    if (error instanceof Error && error.message === "ADMIN_EXISTS") {
      return NextResponse.json(
        { error: "Um administrador já existe" },
        { status: 400 }
      );
    }

    // Serialization failure from PostgreSQL SSI (concurrent race → one loser).
    // Treat as "admin already exists" — safe, user-friendly, no retry needed.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return NextResponse.json(
        { error: "Um administrador já existe" },
        { status: 400 }
      );
    }

    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Erro ao criar administrador" },
      { status: 500 }
    );
  }
}

// GET — disabled in production to prevent bootstrap-state disclosure.
//
// In development: returns { hasAdmin: bool } for the setup UI to auto-redirect
// to /login if the system is already bootstrapped.
//
// In production: returns 404. The SetupPage handles this gracefully — the
// catch block exits the loading state and renders the form. If the user
// submits and an admin already exists, POST returns 400 "Um administrador já existe".
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    });

    return NextResponse.json({
      hasAdmin: !!existingAdmin,
    });
  } catch {
    return NextResponse.json({ hasAdmin: false });
  }
}
