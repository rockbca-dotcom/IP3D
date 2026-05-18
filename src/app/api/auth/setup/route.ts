import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { handleApiError, apiSuccess, apiError, unauthorized, badRequest, notFound } from "@/lib/api-utils";

// Schema de validação para o setup
const setupSchema = z.object({
  email: z.string().trim().toLowerCase().email("Formato de email inválido"),
  password: z.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, "A senha deve ter no mínimo 8 caracteres, incluindo letras e números"),
  name: z.string().optional(),
});

// ---------------------------------------------------------------------------
// First-time admin bootstrap endpoint... (lógica mantida)
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 3;
interface AttemptRecord { count: number; resetAt: number; }
const setupAttemptMap = new Map<string, AttemptRecord>();

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown";
}

function getRateLimitState(ip: string): { limited: boolean; retryAfterSeconds: number } {
  if (process.env.VITEST || process.env.NODE_ENV === "test") return { limited: false, retryAfterSeconds: 0 };
  const now = Date.now();
  const record = setupAttemptMap.get(ip);
  if (!record || record.resetAt <= now) return { limited: false, retryAfterSeconds: 0 };
  if (record.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return { limited: true, retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000) };
  }
  return { limited: false, retryAfterSeconds: 0 };
}

function recordAttempt(ip: string): void {
  const now = Date.now();
  const record = setupAttemptMap.get(ip);
  if (!record || record.resetAt <= now) {
    setupAttemptMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else { record.count += 1; }
}

// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const { limited, retryAfterSeconds } = getRateLimitState(ip);
  if (limited) {
    return apiError("Muitas tentativas. Tente novamente mais tarde.", "TOO_MANY_REQUESTS", 429);
  }
  recordAttempt(ip);

  try {
    const body = await request.json();
    const { email, password, name } = setupSchema.parse(body);

    const setupSecret = env.ADMIN_SETUP_SECRET;
    const clientSecret = request.headers.get("X-Setup-Secret");

    if (setupSecret && clientSecret !== setupSecret) {
      console.warn(`[SETUP] Tentativa de setup sem segredo válido do IP: ${ip}`);
      return unauthorized("Acesso não autorizado. Chave de setup inválida.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(
      async (tx) => {
        const existingAdmin = await tx.user.findFirst({
          where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
        });

        if (existingAdmin) throw new Error("ADMIN_EXISTS");

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

    return apiSuccess({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ADMIN_EXISTS") {
      return badRequest("Um administrador já existe");
    }
    // O handleApiError já trata Prisma P2034 (Serialization failure)
    return handleApiError(error);
  }
}

export async function GET() {
  if (process.env.NODE_ENV === "production") return notFound("Not found");

  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    });
    return apiSuccess({ hasAdmin: !!existingAdmin });
  } catch (error) {
    return apiSuccess({ hasAdmin: false });
  }
}

