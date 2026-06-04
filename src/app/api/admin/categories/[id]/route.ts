import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiSuccess, handleApiError, badRequest, conflict, notFound } from "@/lib/api-utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const categoryUpdateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  slug: z.string()
    .min(1, "Slug é obrigatório")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido. Use apenas letras minúsculas, números e hifens")
    .optional(),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
  parentId: z.string().nullable().optional(),
});

async function wouldCreateCycle(categoryId: string, targetParentId: string): Promise<boolean> {
  if (categoryId === targetParentId) return true;
  let currentId = targetParentId;
  while (currentId) {
    const parentCat = await prisma.category.findUnique({
      where: { id: currentId },
      select: { parentId: true }
    });
    if (!parentCat) break;
    if (parentCat.parentId === categoryId) return true;
    currentId = parentCat.parentId || "";
  }
  return false;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: { parent: true, children: true },
    });

    if (!category) {
      return notFound("Categoria não encontrada.");
    }

    return apiSuccess({ category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = categoryUpdateSchema.parse(body);

    // 1. Categoria existe
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return notFound("Categoria não encontrada.");
    }

    // 2. Slug único
    if (validatedData.slug && validatedData.slug !== category.slug) {
      const existing = await prisma.category.findUnique({
        where: { slug: validatedData.slug },
      });
      if (existing) {
        return conflict("Já existe uma categoria com este slug.");
      }
    }

    // 3. Validações de Pai e Ciclos
    if (validatedData.parentId !== undefined && validatedData.parentId !== null) {
      const parentId = validatedData.parentId || null;
      if (parentId) {
        if (parentId === id) {
          return badRequest("Uma categoria não pode ser pai dela mesma.");
        }

        const parent = await prisma.category.findUnique({ where: { id: parentId } });
        if (!parent) {
          return badRequest("Categoria pai não encontrada.");
        }

        if (await wouldCreateCycle(id, parentId)) {
          return badRequest("Esta alteração criaria um ciclo na árvore de categorias.");
        }
      }
    }

    const updateData: Partial<z.infer<typeof categoryUpdateSchema>> = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.slug !== undefined) updateData.slug = validatedData.slug;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.image !== undefined) updateData.image = validatedData.image;
    if (validatedData.color !== undefined) updateData.color = validatedData.color;
    if (validatedData.icon !== undefined) updateData.icon = validatedData.icon;
    if (validatedData.order !== undefined) updateData.order = validatedData.order;
    if (validatedData.active !== undefined) updateData.active = validatedData.active;
    if (validatedData.parentId !== undefined) updateData.parentId = validatedData.parentId || null;

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return apiSuccess({ success: true, category: updatedCategory });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id } = await params;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return notFound("Categoria não encontrada.");
    }

    // Protect against deletion if category has products or subcategories
    const [productCatCount, directProductCount, childrenCount] = await Promise.all([
      prisma.productCategory.count({ where: { categoryId: id } }),
      prisma.product.count({ where: { categoryId: id } }),
      prisma.category.count({ where: { parentId: id } }),
    ]);

    if (productCatCount + directProductCount > 0) {
      return conflict(
        "Não é possível excluir uma categoria que possui produtos vinculados. Remova os produtos primeiro ou inative a categoria."
      );
    }

    if (childrenCount > 0) {
      return conflict(
        "Não é possível excluir uma categoria que possui subcategorias. Exclua as subcategorias primeiro."
      );
    }

    await prisma.category.delete({ where: { id } });

    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
