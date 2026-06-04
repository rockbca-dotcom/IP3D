import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleApiError, apiSuccess } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

// Schema de validação para produtos
const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório"),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional().default([]),
  image: z.string().optional(),
  gallery: z.array(z.string()).optional().default([]),
  catalog: z.string().optional().nullable(),
  warranty: z.string().optional().nullable(),
  video: z.string().optional(),
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

export async function GET(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10")));
    const search = (searchParams.get("search") || "").trim();

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { slug: { contains: search, mode: "insensitive" as const } },
            { sku: { contains: search, mode: "insensitive" as const } },
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

    return apiSuccess({
      products,
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

export async function POST(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const json = await request.json();
    const data = productSchema.parse(json);
    const { categoryIds, specifications, ...rest } = data;

    const product = await prisma.product.create({
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

    return apiSuccess({ success: true, product }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

