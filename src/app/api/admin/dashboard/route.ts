import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-utils";
import { withSchemaCompatibilityFallback } from "@/lib/prisma-schema-compat";
import { z } from "zod";

const querySchema = z.object({
  period: z.enum(["today", "7d", "30d", "custom"]).default("30d"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const dynamic = "force-dynamic";

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
          "Para o periodo customizado, as datas de inicio e fim sao obrigatorias.",
          "BAD_REQUEST",
          400
        );
      }

      startDate = new Date(parsed.startDate);
      endDate = new Date(parsed.endDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return apiError("Datas fornecidas invalidas.", "BAD_REQUEST", 400);
      }

      if (startDate > endDate) {
        return apiError(
          "A data de inicio deve ser menor ou igual a data de fim.",
          "BAD_REQUEST",
          400
        );
      }
    } else {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

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
      outOfStockActiveProducts,
    ] = await Promise.all([
      withSchemaCompatibilityFallback(
        () => prisma.order.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
        0
      ),
      withSchemaCompatibilityFallback(
        () => prisma.order.count({ where: { status: "PENDING", createdAt: { gte: startDate, lte: endDate } } }),
        0
      ),
      withSchemaCompatibilityFallback(
        () => prisma.order.count({ where: { paymentStatus: "APPROVED", createdAt: { gte: startDate, lte: endDate } } }),
        0
      ),
      withSchemaCompatibilityFallback(
        () =>
          prisma.order.count({
            where: {
              OR: [{ status: "CANCELLED" }, { paymentStatus: "REJECTED" }],
              createdAt: { gte: startDate, lte: endDate },
            },
          }),
        0
      ),
      withSchemaCompatibilityFallback(
        () =>
          prisma.order.aggregate({
            _sum: { total: true },
            where: { paymentStatus: "APPROVED", createdAt: { gte: startDate, lte: endDate } },
          }),
        { _sum: { total: 0 } }
      ),
      withSchemaCompatibilityFallback(() => prisma.product.count({ where: { active: true } }), 0),
      withSchemaCompatibilityFallback(
        () => prisma.product.count({ where: { active: true, stockQuantity: { gt: 0, lte: 5 } } }),
        0
      ),
      withSchemaCompatibilityFallback(
        () => prisma.product.count({ where: { active: true, stockQuantity: { lte: 0 } } }),
        0
      ),
      withSchemaCompatibilityFallback(
        () => prisma.pageView.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
        0
      ),
      withSchemaCompatibilityFallback(
        () => prisma.click.count({ where: { createdAt: { gte: startDate, lte: endDate } } }),
        0
      ),
      withSchemaCompatibilityFallback(
        () =>
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
            orderBy: { createdAt: "desc" },
          }),
        []
      ),
      withSchemaCompatibilityFallback(
        () =>
          prisma.inventoryLog.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: {
              product: {
                select: {
                  name: true,
                  sku: true,
                },
              },
            },
          }),
        []
      ),
      withSchemaCompatibilityFallback(
        () =>
          prisma.orderItem.groupBy({
            by: ["productId", "name", "sku"],
            where: {
              order: {
                paymentStatus: "APPROVED",
                createdAt: { gte: startDate, lte: endDate },
              },
            },
            _sum: {
              quantity: true,
              total: true,
            },
            orderBy: {
              _sum: {
                quantity: "desc",
              },
            },
            take: 5,
          }),
        []
      ),
      withSchemaCompatibilityFallback(
        () =>
          prisma.order.findMany({
            where: { notes: { contains: "ESTOQUE INSUFICIENTE" } },
            select: { id: true, code: true, customerName: true, notes: true, createdAt: true },
            take: 5,
            orderBy: { createdAt: "desc" },
          }),
        []
      ),
      withSchemaCompatibilityFallback(
        () =>
          prisma.product.findMany({
            where: { active: true, stockQuantity: { lte: 0 } },
            select: { id: true, name: true, sku: true },
            take: 5,
            orderBy: { createdAt: "desc" },
          }),
        []
      ),
    ]);

    const approvedRevenue = Number(revenueAggregate._sum.total || 0);
    const ticketAverage = approvedOrders > 0 ? approvedRevenue / approvedOrders : 0;

    const recentOrders = recentOrdersRaw.map((order) => ({
      ...order,
      total: Number(order.total),
    }));

    const topSoldProducts = topSoldItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      sku: item.sku,
      quantity: item._sum.quantity || 0,
      total: Number(item._sum.total || 0),
    }));

    const alerts: Array<{
      type: "ORDER_STOCK_ERROR" | "PRODUCT_OUT_OF_STOCK";
      message: string;
      referenceId: string;
      createdAt: Date;
    }> = [];

    insufficientStockOrders.forEach((order) => {
      alerts.push({
        type: "ORDER_STOCK_ERROR",
        message: `Pedido ${order.code} (${order.customerName}) possui alerta de estoque insuficiente.`,
        referenceId: order.id,
        createdAt: order.createdAt,
      });
    });

    outOfStockActiveProducts.forEach((product) => {
      alerts.push({
        type: "PRODUCT_OUT_OF_STOCK",
        message: `Produto "${product.name}" (SKU: ${product.sku || "N/A"}) esta totalmente sem estoque.`,
        referenceId: product.id,
        createdAt: new Date(),
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
      alerts,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
