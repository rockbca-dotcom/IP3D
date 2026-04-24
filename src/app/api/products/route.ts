import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeProduct(product: any) {
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured");
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { active: true };
    const andConditions: Record<string, unknown>[] = [];
    
    if (featured === "true") {
      where.featured = true;
    }

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
          { shortDescription: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { category: { name: { contains: search, mode: "insensitive" } } },
          { categories: { some: { category: { name: { contains: search, mode: "insensitive" } } } } },
        ]
      });
    }
    
    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
      });
      if (category) {
        andConditions.push({
          OR: [
            { categoryId: category.id },
            { categories: { some: { categoryId: category.id } } }
          ]
        });
      }
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          image: true,
          gallery: true,
          priceOriginal: true,
          pricePromo: true,
          pixPrice: true,
          installments: true,
          installmentValue: true,
          stockQuantity: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
          categories: {
            select: {
              category: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ 
      products: products.map(serializeProduct), 
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}
