import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { searchParams } = new URL(request.url);
    const paymentStatus = searchParams.get("paymentStatus");
    const orderStatus = searchParams.get("orderStatus");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const skip = Math.max(0, (page - 1) * limit);

    const where: {
      paymentStatus?: "PAYMENT_PENDING" | "APPROVED" | "REJECTED" | "REFUNDED" | "CHARGEBACK";
      status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    } = {};

    if (paymentStatus) {
      where.paymentStatus = paymentStatus as typeof where.paymentStatus;
    }

    if (orderStatus) {
      where.status = orderStatus as typeof where.status;
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

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return NextResponse.json({ error: "Erro ao buscar pedidos." }, { status: 500 });
  }
}
