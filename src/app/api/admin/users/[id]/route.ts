import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin, getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function countActiveSuperAdmins(): Promise<number> {
  return prisma.user.count({
    where: { role: "SUPER_ADMIN", active: true },
  });
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id:        true,
      name:      true,
      email:     true,
      role:      true,
      active:    true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// ─── PUT — atualiza usuário ───────────────────────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  const session = await getSession();

  const { id } = await params;
  const body = await request.json();
  const { name, email, password, role, active } = body;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  // ── Proteção: último SUPER_ADMIN ────────────────────────────────────────────
  const isDowngrading = role && role !== "SUPER_ADMIN" && existing.role === "SUPER_ADMIN";
  const isDeactivating = active === false && existing.active === true && existing.role === "SUPER_ADMIN";

  if (isDowngrading || isDeactivating) {
    const superAdminCount = await countActiveSuperAdmins();
    if (superAdminCount <= 1) {
      return NextResponse.json(
        {
          error:
            "Operação bloqueada: este é o último SUPER_ADMIN ativo. " +
            "Promova outro usuário antes de alterar este.",
        },
        { status: 409 }
      );
    }
  }

  // ── Proteção: não pode auto-inativar/auto-rebaixar ──────────────────────────
  if (session && id === session.userId) {
    if (active === false || (role && role !== existing.role && role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { error: "Você não pode inativar ou rebaixar a própria conta" },
        { status: 409 }
      );
    }
  }

  // ── Validações ───────────────────────────────────────────────────────────────
  if (role && !["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(role)) {
    return NextResponse.json({ error: "Papel inválido" }, { status: 400 });
  }

  if (password !== undefined && password !== "" && password.length < 8) {
    return NextResponse.json(
      { error: "A nova senha deve ter no mínimo 8 caracteres" },
      { status: 400 }
    );
  }

  if (email) {
    const emailConflict = await prisma.user.findFirst({
      where: { email: email.toLowerCase().trim(), NOT: { id } },
    });
    if (emailConflict) {
      return NextResponse.json(
        { error: "E-mail já está em uso por outro usuário" },
        { status: 409 }
      );
    }
  }

  // ── Build update data ────────────────────────────────────────────────────────
  const updateData: {
    name?: string | null;
    email?: string;
    role?: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
    active?: boolean;
    password?: string;
  } = {};

  if (name !== undefined) updateData.name  = name?.trim() || null;
  if (email)              updateData.email = email.toLowerCase().trim();
  if (role)               updateData.role  = role as "SUPER_ADMIN" | "ADMIN" | "EDITOR";
  if (active !== undefined) updateData.active = Boolean(active);
  if (password && password.length >= 8) {
    updateData.password = await bcrypt.hash(password, 12);
  }

  const updated = await prisma.user.update({
    where: { id },
    data:  updateData,
    select: {
      id:        true,
      name:      true,
      email:     true,
      role:      true,
      active:    true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ success: true, user: updated });
}

// ─── DELETE — inativa usuário (soft delete) ───────────────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  const session = await getSession();

  const { id } = await params;

  // Não pode inativar a si mesmo
  if (session && id === session.userId) {
    return NextResponse.json(
      { error: "Você não pode inativar a própria conta" },
      { status: 409 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  // Proteção: último SUPER_ADMIN
  if (existing.role === "SUPER_ADMIN" && existing.active) {
    const count = await countActiveSuperAdmins();
    if (count <= 1) {
      return NextResponse.json(
        {
          error:
            "Operação bloqueada: este é o último SUPER_ADMIN ativo. " +
            "Promova outro usuário antes de inativar este.",
        },
        { status: 409 }
      );
    }
  }

  // Inativa em vez de apagar — preserva integridade referencial
  await prisma.user.update({
    where: { id },
    data:  { active: false },
  });

  return NextResponse.json({ success: true, message: "Usuário inativado" });
}
