import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionOptions, SessionData, defaultSession } from "./session";
import { getSupabaseAdmin, getSupabaseConfigError } from "./supabase";
import { UserRole } from "@prisma/client";

export async function getSession(): Promise<SessionData> {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    return defaultSession;
  }

  return session;
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true;
}

/**
 * Valida se o usuário tem uma das roles permitidas e está ativo no banco.
 * Uses Supabase PostgREST (HTTP) to verify against the database.
 */
export async function hasRole(allowedRoles: UserRole[]): Promise<boolean> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.role) return false;

  const isRoleAllowed = allowedRoles.includes(session.role as UserRole);
  if (!isRoleAllowed) return false;

  // Authoritative check: verify the user still exists and is active via Supabase
  try {
    if (getSupabaseConfigError()) return false;

    const supabaseAdmin = getSupabaseAdmin();
    const { data: user, error } = await supabaseAdmin
      .from("User")
      .select("active, role")
      .eq("id", session.userId)
      .single();

    if (error || !user || !user.active) return false;

    // Validate role hasn't changed since session was created
    return allowedRoles.includes(user.role as UserRole);
  } catch (error) {
    console.error("[AUTH] Erro ao validar permissões no banco:", error);
    return false;
  }
}

export async function isAdmin(): Promise<boolean> {
  return hasRole(["ADMIN", "SUPER_ADMIN"]);
}

export async function isSuperAdmin(): Promise<boolean> {
  return hasRole(["SUPER_ADMIN"]);
}

export async function isEditor(): Promise<boolean> {
  return hasRole(["EDITOR", "ADMIN", "SUPER_ADMIN"]);
}

export async function requireEditor(): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 }
    );
  }
  const ok = await isEditor();
  if (!ok) {
    return NextResponse.json(
      { error: "Acesso negado. Requer privilégios de Editor ou superior." },
      { status: 403 }
    );
  }
  return null;
}

export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 }
    );
  }
  const ok = await isAdmin();
  if (!ok) {
    return NextResponse.json(
      { error: "Acesso negado. Requer privilégios administrativos." },
      { status: 403 }
    );
  }
  return null;
}

export async function requireSuperAdmin(): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 }
    );
  }
  const ok = await isSuperAdmin();
  if (!ok) {
    return NextResponse.json(
      { error: "Acesso negado. Requer privilégios de Super Admin." },
      { status: 403 }
    );
  }
  return null;
}

export async function requireAnyRole(roles: UserRole[]): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json(
      { error: "Não autenticado." },
      { status: 401 }
    );
  }
  const ok = await hasRole(roles);
  if (!ok) {
    return NextResponse.json(
      { error: `Acesso negado. Requer uma das roles: ${roles.join(", ")}` },
      { status: 403 }
    );
  }
  return null;
}
