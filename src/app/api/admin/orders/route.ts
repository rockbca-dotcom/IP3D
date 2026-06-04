import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { z } from "zod";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(OrderStatus).optional(),
  orderStatus: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.parse(Object.fromEntries(searchParams.entries()));

    const page = parsed.page;
    const limit = parsed.limit;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    const statusFilter = parsed.status || parsed.orderStatus;
    if (statusFilter) {
      where.status = statusFilter;
    }

    if (parsed.paymentStatus) {
      where.paymentStatus = parsed.paymentStatus;
    }

    if (parsed.search) {
      const searchTerm = parsed.search.trim();
      where.OR = [
        { code: { contains: searchTerm, mode: "insensitive" } },
        { customerName: { contains: searchTerm, mode: "insensitive" } },
        { customerEmail: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return apiSuccess({
      orders,
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
