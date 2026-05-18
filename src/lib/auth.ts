import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionOptions, SessionData, defaultSession } from "./session";
import { prisma } from "./prisma";
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
 */
export async function hasRole(allowedRoles: UserRole[]): Promise<boolean> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.role) return false;

  const isRoleAllowed = allowedRoles.includes(session.role as UserRole);
  if (!isRoleAllowed) return false;

  // Authoritative check: verify the user still exists and is active in DB.
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { active: true, role: true },
    });
    
    if (!user || !user.active) return false;
    
    // Opcional: Validar se a role no banco ainda é a mesma da sessão 
    // (prevenindo privilégios elevados se a role mudou mas o cookie não expirou)
    return allowedRoles.includes(user.role);
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

/**
 * Exige que o usuário seja EDITOR, ADMIN ou SUPER_ADMIN.
 */
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

/**
 * Exige que o usuário seja ADMIN ou SUPER_ADMIN.
 */
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

/**
 * Exige que o usuário seja SUPER_ADMIN.
 */
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

/**
 * Exige qualquer uma das roles especificadas.
 */
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
