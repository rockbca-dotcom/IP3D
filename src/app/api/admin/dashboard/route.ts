import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-utils";
import { z } from "zod";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";

const querySchema = z.object({
  period: z.enum(["today", "7d", "30d", "custom"]).default("30d"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/dashboard
 * Retorna os indicadores e KPIs em tempo real para o Dashboard Administrativo.
 */
export async function GET(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.parse(Object.fromEntries(searchParams.entries()));

    const now = new Date();
    let startDate: Date;
    let endDate = now;

    if (parsed.period === "today") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (parsed.period === "7d") {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (parsed.period === "30d") {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (parsed.period === "custom") {
      if (!parsed.startDate || !parsed.endDate) {
        return apiError(
          "Para o período customizado, as datas de início e fim são obrigatórias.",
          "BAD_REQUEST",
          400
        );
      }
      startDate = new Date(parsed.startDate);
      endDate = new Date(parsed.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return apiError("Datas fornecidas inválidas.", "BAD_REQUEST", 400);
      }
      if (startDate > endDate) {
        return apiError(
          "A data de início deve ser menor ou igual à data de fim.",
          "BAD_REQUEST",
          400
        );
      }
    } else {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Executa as agregacoes de alta performance em paralelo no banco de dados
    const [
      totalOrders,
      pendingOrders,
      approvedOrders,
      rejectedOrders,
      revenueAggregate,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      pageViewsCount,
      clicksCount,
      recentOrdersRaw,
      recentInventoryLogs,
      topSoldItems,
      insufficientStockOrders,
      outOfStockActiveProducts
    ] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
      prisma.order.count({ where: { status: "PENDING", createdAt: { gte: startDate, lte: endDate } } }),
      prisma.order.count({ where: { paymentStatus: "APPROVED", createdAt: { gte: startDate, lte: endDate } } }),
      prisma.order.count({ where: { OR: [ { status: "CANCELLED" }, { paymentStatus: "REJECTED" } ], createdAt: { gte: startDate, lte: endDate } } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "APPROVED", createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.product.count({ where: { active: true } }),
      prisma.product.count({ where: { active: true, stockQuantity: { gt: 0, lte: 5 } } }),
      prisma.product.count({ where: { active: true, stockQuantity: { lte: 0 } } }),
      prisma.pageView.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
      prisma.click.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
      prisma.order.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        take: 5,
        select: {
          id: true,
          code: true,
          customerName: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" }
      }),
      prisma.inventoryLog.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: {
              name: true,
              sku: true,
            }
          }
        }
      }),
      prisma.orderItem.groupBy({
        by: ["productId", "name", "sku"],
        where: {
          order: {
            paymentStatus: "APPROVED",
            createdAt: { gte: startDate, lte: endDate }
          }
        },
        _sum: {
          quantity: true,
          total: true
        },
        orderBy: {
          _sum: {
            quantity: "desc"
          }
        },
        take: 5
      }),
      prisma.order.findMany({
        where: { notes: { contains: "ESTOQUE INSUFICIENTE" } },
        select: { id: true, code: true, customerName: true, notes: true, createdAt: true },
        take: 5,
        orderBy: { createdAt: "desc" }
      }),
      prisma.product.findMany({
        where: { active: true, stockQuantity: { lte: 0 } },
        select: { id: true, name: true, sku: true },
        take: 5,
        orderBy: { createdAt: "desc" }
      })
    ]);

    const approvedRevenue = Number(revenueAggregate._sum.total || 0);
    const ticketAverage = approvedOrders > 0 ? (approvedRevenue / approvedOrders) : 0;

    const recentOrders = recentOrdersRaw.map((o) => ({
      ...o,
      total: Number(o.total)
    }));

    const topSoldProducts = topSoldItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      sku: item.sku,
      quantity: item._sum.quantity || 0,
      total: Number(item._sum.total || 0)
    }));

    // Formata alertas operacionais
    const alerts: Array<{
      type: "ORDER_STOCK_ERROR" | "PRODUCT_OUT_OF_STOCK";
      message: string;
      referenceId: string;
      createdAt: Date;
    }> = [];

    insufficientStockOrders.forEach(o => {
      alerts.push({
        type: "ORDER_STOCK_ERROR",
        message: `Pedido ${o.code} (${o.customerName}) possui alerta de estoque insuficiente.`,
        referenceId: o.id,
        createdAt: o.createdAt
      });
    });

    outOfStockActiveProducts.forEach(p => {
      alerts.push({
        type: "PRODUCT_OUT_OF_STOCK",
        message: `Produto "${p.name}" (SKU: ${p.sku || "N/A"}) está totalmente sem estoque.`,
        referenceId: p.id,
        createdAt: new Date()
      });
    });

    return apiSuccess({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        approvedOrders,
        rejectedOrders,
        approvedRevenue,
        ticketAverage,
        activeProducts,
        lowStockProducts,
        outOfStockProducts,
        pageViewsCount,
        clicksCount,
      },
      recentOrders,
      recentInventoryLogs,
      topSoldProducts,
      alerts
    });
  } catch (error) {
    return handleApiError(error);
  }
}
