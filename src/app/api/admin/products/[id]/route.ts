import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, apiSuccess, notFound, conflict } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

// Schema de validação para produtos (PUT)
const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  features: z.array(z.string()).optional().default([]),
  image: z.string().optional().nullable(),
  gallery: z.array(z.string()).optional().default([]),
  catalog: z.string().optional().nullable(),
  warranty: z.string().optional().nullable(),
  video: z.string().optional().nullable(),
  featured: z.boolean().optional().default(false),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  active: z.boolean().optional().default(true),
  priceOriginal: z.number().nonnegative().optional().nullable(),
  pricePromo: z.number().nonnegative().optional().nullable(),
  pixPrice: z.number().nonnegative().optional().nullable(),
  installments: z.number().int().positive().optional().nullable(),
  installmentValue: z.number().nonnegative().optional().nullable(),
  stockQuantity: z.number().int().nonnegative().default(0),
  sku: z.string().optional().nullable(),
  weight: z.number().nonnegative().optional().nullable(),
  length: z.number().int().nonnegative().optional().nullable(),
  width: z.number().int().nonnegative().optional().nullable(),
  height: z.number().int().nonnegative().optional().nullable(),
  categoryIds: z.array(z.string()).optional().default([]),
  specifications: z.array(z.object({
    label: z.string(),
    value: z.string(),
  })).optional().default([]),
});

// Schema de validação para PATCH (active)
const productPatchSchema = z.object({
  active: z.boolean({ required_error: "Status active é obrigatório" }),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        categories: { include: { category: true } },
        specifications: true,
      },
    });

    if (!product) {
      return notFound("Produto não encontrado.");
    }

    return apiSuccess({ product });
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
    const json = await request.json();
    const data = productSchema.parse(json);
    const { categoryIds, specifications, ...rest } = data;

    // Verificar se o produto existe
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) {
      return notFound("Produto não encontrado.");
    }

    const product = await prisma.$transaction(async (tx) => {
      // Remover relações existentes
      await tx.productCategory.deleteMany({ where: { productId: id } });
      await tx.specification.deleteMany({ where: { productId: id } });

      // Atualizar produto e recriar relações
      return tx.product.update({
        where: { id },
        data: {
          ...rest,
          sku: rest.sku?.trim() || null,
          categoryId: categoryIds[0] || null,
          categories: categoryIds.length
            ? {
                create: categoryIds.map((categoryId: string) => ({ categoryId })),
              }
            : undefined,
          specifications: specifications.length
            ? {
                create: specifications.map((spec) => ({
                  label: spec.label,
                  value: spec.value,
                })),
              }
            : undefined,
        },
        include: {
          category: true,
          categories: { include: { category: true } },
          specifications: true,
        },
      });
    });

    return apiSuccess({ success: true, product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id } = await params;
    const json = await request.json();
    const data = productPatchSchema.parse(json);

    // Verificar se o produto existe
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) {
      return notFound("Produto não encontrado.");
    }

    const product = await prisma.product.update({
      where: { id },
      data: { active: data.active },
    });

    return apiSuccess({ success: true, product });
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

    // Verificar se o produto existe
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) {
      return notFound("Produto não encontrado.");
    }

    // Proteger contra deleção se o produto possuir itens de pedido vinculados
    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
      return conflict("Produto possui pedidos vinculados e não pode ser excluído. Inative-o em vez de excluir.");
    }

    await prisma.$transaction(async (tx) => {
      // Deletar relações antes de deletar o produto
      await tx.productCategory.deleteMany({ where: { productId: id } });
      await tx.specification.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });

    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
