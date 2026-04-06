import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function parseDecimal(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const numberValue = typeof value === "string" ? Number(value.replace(",", ".")) : Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function parseInteger(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const numberValue = typeof value === "string" ? parseInt(value, 10) : Number(value);
  return Number.isNaN(numberValue) ? fallback : numberValue;
}

function parseIntegerNullable(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const numberValue = typeof value === "string" ? parseInt(value, 10) : Number(value);
  return Number.isNaN(numberValue) ? null : numberValue;
}

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
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 });
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
    const data = await request.json();

    // Remove existing relations
    await prisma.productCategory.deleteMany({ where: { productId: id } });
    await prisma.specification.deleteMany({ where: { productId: id } });

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        shortDescription: data.shortDescription,
        description: data.description,
        features: data.features || [],
        image: data.image,
        gallery: data.gallery || [],
        catalog: data.catalog || null,
        warranty: data.warranty || null,
        video: data.video,
        featured: data.featured || false,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        metaKeywords: data.metaKeywords || null,
        ogImage: data.ogImage || null,
        active: data.active ?? true,
        priceOriginal: parseDecimal(data.priceOriginal),
        pricePromo: parseDecimal(data.pricePromo),
        pixPrice: parseDecimal(data.pixPrice),
        installments: parseIntegerNullable(data.installments),
        installmentValue: parseDecimal(data.installmentValue),
        stockQuantity: parseInteger(data.stockQuantity, 0),
        sku:           data.sku?.trim()   || null,
        weight:        parseDecimal(data.weight),
        length:        parseIntegerNullable(data.length),
        width:         parseIntegerNullable(data.width),
        height:        parseIntegerNullable(data.height),
        categoryId: data.categoryIds?.[0] || null,
        categories: data.categoryIds?.length
          ? {
              create: data.categoryIds.map((categoryId: string) => ({ categoryId })),
            }
          : undefined,
        specifications: data.specifications?.length
          ? {
              create: data.specifications.map((spec: { label: string; value: string }) => ({
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

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
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
    const data = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: { active: data.active },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error patching product:", error);
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
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

    // Protect against deletion if product has order items
    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
      return NextResponse.json(
        { error: "Produto possui pedidos vinculados e não pode ser excluído. Inative-o em vez de excluir." },
        { status: 409 }
      );
    }

    // Delete relations before deleting product
    await prisma.productCategory.deleteMany({ where: { productId: id } });
    await prisma.specification.deleteMany({ where: { productId: id } });

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Erro ao deletar produto" }, { status: 500 });
  }
}
