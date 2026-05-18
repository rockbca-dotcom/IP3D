import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-utils";

interface RawProductInput {
  priceOriginal?: number | string | object | null;
  pricePromo?: number | string | object | null;
  pixPrice?: number | string | object | null;
  installments?: number | null;
  installmentValue?: number | string | object | null;
  stockQuantity?: number | null;
  [key: string]: unknown;
}

// Schema de validação para query params
const productsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(9),
  search: z.string().min(2, "Busca muito curta").max(50).optional(),
  category: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "name_asc", "featured"]).default("newest"),
});

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = productsQuerySchema.parse(Object.fromEntries(searchParams));
    const { page, limit, search, category, featured, minPrice, maxPrice, sort } = query;

    const skip = (page - 1) * limit;

    // Filtros base
    const where: Prisma.ProductWhereInput = { active: true };
    const andConditions: Prisma.ProductWhereInput[] = [];

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (search) {
      andConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { shortDescription: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { category: { name: { contains: search, mode: "insensitive" } } },
        ]
      });
    }

    if (category) {
      andConditions.push({
        OR: [
          { category: { slug: category } },
          { categories: { some: { category: { slug: category } } } }
        ]
      });
    }

    if (minPrice !== undefined) {
      andConditions.push({
        OR: [
          { pricePromo: { gte: minPrice } },
          { priceOriginal: { gte: minPrice }, pricePromo: null }
        ]
      });
    }

    if (maxPrice !== undefined) {
      andConditions.push({
        OR: [
          { pricePromo: { lte: maxPrice } },
          { priceOriginal: { lte: maxPrice }, pricePromo: null }
        ]
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Ordenação
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { priceOriginal: "asc" };
    else if (sort === "price_desc") orderBy = { priceOriginal: "desc" };
    else if (sort === "name_asc") orderBy = { name: "asc" };
    else if (sort === "featured") orderBy = { featured: "desc" };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          image: true,
          priceOriginal: true,
          pricePromo: true,
          pixPrice: true,
          installments: true,
          installmentValue: true,
          stockQuantity: true,
          featured: true,
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
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return apiSuccess({
      success: true,
      data: {
        items: products.map(serializeProduct),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        }
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
