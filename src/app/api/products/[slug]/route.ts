import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SerializableProduct = {
  priceOriginal?: unknown;
  pricePromo?: unknown;
  pixPrice?: unknown;
  installments?: unknown;
  installmentValue?: unknown;
  stockQuantity?: unknown;
} & Record<string, unknown>;

function serializeProduct(product: SerializableProduct | null) {
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

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        specifications: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
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
          take: 3,
        })
      : [];

    return NextResponse.json({ product: serializeProduct(product), relatedProducts: relatedProducts.map(serializeProduct) });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 });
  }
}
