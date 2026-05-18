import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiSuccess, handleApiError, badRequest, conflict } from "@/lib/api-utils";
import { z } from "zod";

const categoryCreateSchema = z.object({
  name: z.string({ required_error: "Nome é obrigatório" }).min(1, "Nome é obrigatório"),
  slug: z.string({ required_error: "Slug é obrigatório" })
    .min(1, "Slug é obrigatório")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido. Use apenas letras minúsculas, números e hifens"),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
  parentId: z.string().nullable().optional(),
});

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        children: {
          orderBy: [{ order: "asc" }, { name: "asc" }],
          include: {
            _count: { select: { productCategories: true } },
          },
        },
        _count: { select: { productCategories: true } },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });
    return apiSuccess({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const body = await request.json();
    const validatedData = categoryCreateSchema.parse(body);

    // 1. Slug único
    const existing = await prisma.category.findUnique({
      where: { slug: validatedData.slug },
    });
    if (existing) {
      return conflict("Já existe uma categoria com este slug.");
    }

    // 2. ParentId existe
    if (validatedData.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: validatedData.parentId },
      });
      if (!parent) {
        return badRequest("Categoria pai não encontrada.");
      }
    }

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        image: validatedData.image || null,
        color: validatedData.color || null,
        icon: validatedData.icon || null,
        order: validatedData.order,
        active: validatedData.active,
        parentId: validatedData.parentId || null,
      },
    });

    return apiSuccess({ success: true, category }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
