import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// ─────────────────────────────────────────────────────────────────────────────
// /api/admin/users   [SUPER_ADMIN only]
//
// GET  → lista paginada de usuários (sem expor password)
// POST → cria novo usuário
//
// Segurança:
//  • requireSuperAdmin() bloqueia qualquer role < SUPER_ADMIN com 403
//  • passwords nunca são retornados nas respostas
//  • bcrypt 12 rounds no hash
// ─────────────────────────────────────────────────────────────────────────────

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  if (session.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Acesso negado — apenas SUPER_ADMIN" },
      { status: 403 }
    );
  }
  return null;
}

// ─── GET — lista usuários ─────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const search = (searchParams.get("search") ?? "").trim();
  const role   = searchParams.get("role") ?? "";

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name:  { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role && ["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(role)) {
    where.role = role as "SUPER_ADMIN" | "ADMIN" | "EDITOR";
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id:        true,
        name:      true,
        email:     true,
        role:      true,
        active:    true,
        createdAt: true,
        updatedAt: true,
        // password NÃO é retornado — nunca
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// ─── POST — cria usuário ──────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const body = await request.json();
  const { name, email, password, role = "ADMIN" } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "E-mail e senha são obrigatórios" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "A senha deve ter no mínimo 8 caracteres" },
      { status: 400 }
    );
  }

  if (!["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(role)) {
    return NextResponse.json({ error: "Papel inválido" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existing) {
    return NextResponse.json(
      { error: "E-mail já está em uso" },
      { status: 409 }
    );
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name:     name?.trim() || null,
      email:    email.toLowerCase().trim(),
      password: hashed,
      role:     role as "SUPER_ADMIN" | "ADMIN" | "EDITOR",
      active:   true,
    },
    select: {
      id:        true,
      name:      true,
      email:     true,
      role:      true,
      active:    true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, user }, { status: 201 });
}
