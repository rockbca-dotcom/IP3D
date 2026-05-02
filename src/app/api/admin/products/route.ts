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

export async function GET(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { slug: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          categories: { include: { category: true } },
          specifications: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const data = await request.json();

    const product = await prisma.product.create({
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
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}
