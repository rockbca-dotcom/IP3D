import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import { handleApiError, apiSuccess, apiError } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

// Schema de validação para criação de usuário
const userCreateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("E-mail inválido").trim().toLowerCase(),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"], { errorMap: () => ({ message: "Papel inválido" }) }).default("ADMIN"),
});

// ─── GET — lista usuários ─────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  try {
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
      where.role = role as Role;
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
        },
        orderBy: [{ role: "asc" }, { name: "asc" }],
        skip:  (page - 1) * limit,
        take:  limit,
      }),
      prisma.user.count({ where }),
    ]);

    return apiSuccess({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ─── POST — cria usuário ──────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { name, email, password, role } = userCreateSchema.parse(body);

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name:     name?.trim() || null,
        email,
        password: hashed,
        role:     role as Role,
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

    return apiSuccess({ success: true, user }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

