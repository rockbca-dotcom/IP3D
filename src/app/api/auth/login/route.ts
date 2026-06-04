import { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";
import { handleApiError, apiSuccess, unauthorized, apiError } from "@/lib/api-utils";
import { getSupabaseAdmin, getSupabaseConfigError } from "@/lib/supabase";

// Schema de validação para o login
const loginSchema = z.object({
  email: z.string().email("E-mail inválido").transform(v => v.toLowerCase().trim()),
  password: z.string().min(1, "Senha é obrigatória"),
});

// ---------------------------------------------------------------------------
// In-process rate limiter for login attempts
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
interface AttemptRecord { count: number; resetAt: number; }
const loginAttemptMap = new Map<string, AttemptRecord>();

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown";
}

function getRateLimitState(ip: string): { limited: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const record = loginAttemptMap.get(ip);
  if (!record || record.resetAt <= now) return { limited: false, retryAfterSeconds: 0 };
  if (record.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return { limited: true, retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000) };
  }
  return { limited: false, retryAfterSeconds: 0 };
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const record = loginAttemptMap.get(ip);
  if (!record || record.resetAt <= now) {
    loginAttemptMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else { record.count += 1; }
}

function clearAttempts(ip: string): void { loginAttemptMap.delete(ip); }

// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);

  const { limited, retryAfterSeconds } = getRateLimitState(ip);
  if (limited) {
    return apiError("Muitas tentativas. Tente novamente mais tarde.", "TOO_MANY_REQUESTS", 429);
  }

  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);
    const supabaseConfigError = getSupabaseConfigError();

    if (supabaseConfigError) {
      return apiError(
        "Integração com Supabase não configurada.",
        "SUPABASE_NOT_CONFIGURED",
        503,
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Fetch user via Supabase PostgREST (HTTP) — works in Vercel serverless
    const { data: user, error: dbError } = await supabaseAdmin
      .from("User")
      .select("id, email, name, role, password, active")
      .eq("email", email)
      .single();

    if (dbError || !user || !user.password || user.active === false) {
      recordFailedAttempt(ip);
      return unauthorized("Credenciais inválidas");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      recordFailedAttempt(ip);
      return unauthorized("Credenciais inválidas");
    }

    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      recordFailedAttempt(ip);
      return unauthorized("Credenciais inválidas");
    }

    clearAttempts(ip);

    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    session.userId = user.id;
    session.email = user.email;
    session.name = user.name || undefined;
    session.role = user.role;
    session.isLoggedIn = true;
    await session.save();

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
    return handleApiError(error);
  }
}
