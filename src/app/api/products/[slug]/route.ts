import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError, notFound } from "@/lib/api-utils";

interface RawProductInput {
  priceOriginal?: number | string | object | null;
  pricePromo?: number | string | object | null;
  pixPrice?: number | string | object | null;
  installments?: number | null;
  installmentValue?: number | string | object | null;
  stockQuantity?: number | null;
  [key: string]: unknown;
}

function serializeProduct(product: RawProductInput) {
  if (!product) return product;
  return {
    ...product,
    priceOriginal: product.priceOriginal ? Number(product.priceOriginal) : null,
    pricePromo: product.pricePromo ? Number(product.pricePromo) : null,
    pixPrice: product.pixPrice ? Number(product.pixPrice) : null,
    installments: product.installments ?? null,
    installmentValue: product.installmentValue ? Number(product.installmentValue) : null,
    stockQuantity: product.stockQuantity ?? 0,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findFirst({
      where: { slug, active: true },
      include: {
        category: true,
        specifications: {
          orderBy: { name: "asc" }
        },
      },
    });

    if (!product) {
      return notFound("Produto não encontrado");
    }

    // Get related products (same category, excluding current)
    const relatedProducts = product.categoryId
      ? await prisma.product.findMany({
          where: {
            categoryId: product.categoryId,
            id: { not: product.id },
            active: true,
          },
          include: {
            category: true,
          },
          take: 4, // Aumentado para 4 para flexibilidade de grid
          orderBy: { createdAt: "desc" }
        })
      : [];

    return apiSuccess({
      success: true,
      data: {
        product: serializeProduct(product),
        relatedProducts: relatedProducts.map(serializeProduct)
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
