import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { GET as getDashboard } from "@/app/api/admin/dashboard/route";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      count: vi.fn(),
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
    product: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    pageView: {
      count: vi.fn(),
    },
    click: {
      count: vi.fn(),
    },
    inventoryLog: {
      findMany: vi.fn(),
    },
    orderItem: {
      groupBy: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  requireAdmin: vi.fn(),
}));

function makeRequest(url: string) {
  return new NextRequest(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}

describe("API de Dashboard Administrativo - GET /api/admin/dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("RBAC e seguranca", () => {
    it("deve rejeitar com 401 se o usuario nao estiver autenticado", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(
        NextResponse.json({ error: "Nao autenticado." }, { status: 401 })
      );

      const res = await getDashboard(makeRequest("http://localhost/api/admin/dashboard"));
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe("Nao autenticado.");
    });

    it("deve rejeitar com 403 se o usuario for EDITOR", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(
        NextResponse.json({ error: "Acesso negado." }, { status: 403 })
      );

      const res = await getDashboard(makeRequest("http://localhost/api/admin/dashboard"));
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe("Acesso negado.");
    });
  });

  describe("Calculos de KPIs e agregacoes", () => {
    it("deve retornar estatisticas completas agregadas com faturamento e ticket medio corretos", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      vi.mocked(prisma.order.count)
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(2);

      vi.mocked(prisma.order.aggregate).mockResolvedValue({
        _sum: { total: 1000.0 },
      } as any);

      vi.mocked(prisma.product.count)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(4)
        .mockResolvedValueOnce(2);

      vi.mocked(prisma.pageView.count).mockResolvedValue(250);
      vi.mocked(prisma.click.count).mockResolvedValue(80);

      vi.mocked(prisma.order.findMany)
        .mockResolvedValueOnce([
          {
            id: "o1",
            code: "PE1",
            customerName: "Maria Silva",
            status: "PENDING",
            paymentStatus: "PAYMENT_PENDING",
            total: 150.0,
            createdAt: new Date(),
          },
        ] as any)
        .mockResolvedValueOnce([]);

      vi.mocked(prisma.inventoryLog.findMany).mockResolvedValue([]);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);

      const res = await getDashboard(makeRequest("http://localhost/api/admin/dashboard?period=7d"));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.stats.totalOrders).toBe(10);
      expect(data.stats.pendingOrders).toBe(3);
      expect(data.stats.approvedOrders).toBe(5);
      expect(data.stats.rejectedOrders).toBe(2);
      expect(data.stats.approvedRevenue).toBe(1000);
      expect(data.stats.ticketAverage).toBe(200);
      expect(data.stats.activeProducts).toBe(50);
      expect(data.stats.lowStockProducts).toBe(4);
      expect(data.stats.outOfStockProducts).toBe(2);
      expect(data.stats.pageViewsCount).toBe(250);
      expect(data.stats.clicksCount).toBe(80);
      expect(data.recentOrders).toHaveLength(1);
    });

    it("deve retornar ticket medio 0 se nao houver faturamento aprovado ou pedidos aprovados", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      vi.mocked(prisma.order.count)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      vi.mocked(prisma.order.aggregate).mockResolvedValue({
        _sum: { total: null },
      } as any);

      vi.mocked(prisma.product.count).mockResolvedValue(0);
      vi.mocked(prisma.pageView.count).mockResolvedValue(0);
      vi.mocked(prisma.click.count).mockResolvedValue(0);
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);
      vi.mocked(prisma.inventoryLog.findMany).mockResolvedValue([]);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);

      const res = await getDashboard(makeRequest("http://localhost/api/admin/dashboard?period=30d"));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.stats.approvedRevenue).toBe(0);
      expect(data.stats.ticketAverage).toBe(0);
    });

    it("deve degradar com zeros e listas vazias quando o banco estiver com schema legado", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      const schemaError = new Prisma.PrismaClientKnownRequestError("legacy schema", {
        code: "P2021",
        clientVersion: "5.22.0",
      });

      vi.mocked(prisma.order.count).mockRejectedValue(schemaError);
      vi.mocked(prisma.order.aggregate).mockRejectedValue(schemaError);
      vi.mocked(prisma.order.findMany).mockRejectedValue(schemaError);
      vi.mocked(prisma.product.count).mockRejectedValue(schemaError);
      vi.mocked(prisma.product.findMany).mockRejectedValue(schemaError);
      vi.mocked(prisma.pageView.count).mockRejectedValue(schemaError);
      vi.mocked(prisma.click.count).mockRejectedValue(schemaError);
      vi.mocked(prisma.inventoryLog.findMany).mockRejectedValue(schemaError);
      vi.mocked(prisma.orderItem.groupBy).mockRejectedValue(schemaError);

      const res = await getDashboard(makeRequest("http://localhost/api/admin/dashboard"));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.stats).toEqual({
        totalOrders: 0,
        pendingOrders: 0,
        approvedOrders: 0,
        rejectedOrders: 0,
        approvedRevenue: 0,
        ticketAverage: 0,
        activeProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        pageViewsCount: 0,
        clicksCount: 0,
      });
      expect(data.recentOrders).toEqual([]);
      expect(data.recentInventoryLogs).toEqual([]);
      expect(data.topSoldProducts).toEqual([]);
      expect(data.alerts).toEqual([]);
    });
  });

  describe("Validacao de periodo", () => {
    it("deve retornar erro 400 se o periodo informado for invalido", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      const res = await getDashboard(makeRequest("http://localhost/api/admin/dashboard?period=90d"));
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("BAD_REQUEST");
    });

    it("deve retornar erro 400 se o periodo for custom mas startDate ou endDate estiverem ausentes", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      const res = await getDashboard(makeRequest("http://localhost/api/admin/dashboard?period=custom"));
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("BAD_REQUEST");
      expect(data.error.message).toContain("obrigatorias");
    });

    it("deve aceitar periodo customizado com datas validas e consistentes", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      vi.mocked(prisma.order.count).mockResolvedValue(0);
      vi.mocked(prisma.order.aggregate).mockResolvedValue({ _sum: { total: null } } as any);
      vi.mocked(prisma.product.count).mockResolvedValue(0);
      vi.mocked(prisma.pageView.count).mockResolvedValue(0);
      vi.mocked(prisma.click.count).mockResolvedValue(0);
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);
      vi.mocked(prisma.inventoryLog.findMany).mockResolvedValue([]);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);

      const url = "http://localhost/api/admin/dashboard?period=custom&startDate=2026-05-01&endDate=2026-05-15";
      const res = await getDashboard(makeRequest(url));

      expect(res.status).toBe(200);
      expect(prisma.order.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          }),
        })
      );
    });
  });

  describe("Privacidade", () => {
    it("nao deve expor informacoes sensiveis na lista de vendas recentes", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      vi.mocked(prisma.order.count).mockResolvedValue(0);
      vi.mocked(prisma.order.aggregate).mockResolvedValue({ _sum: { total: null } } as any);
      vi.mocked(prisma.product.count).mockResolvedValue(0);
      vi.mocked(prisma.pageView.count).mockResolvedValue(0);
      vi.mocked(prisma.click.count).mockResolvedValue(0);

      const mockRecentOrders = [
        {
          id: "o1",
          code: "PE1",
          customerName: "Maria Silva",
          status: "PENDING",
          paymentStatus: "PAYMENT_PENDING",
          total: 150.0,
          createdAt: new Date(),
        },
      ];

      vi.mocked(prisma.order.findMany)
        .mockResolvedValueOnce(mockRecentOrders as any)
        .mockResolvedValueOnce([]);

      vi.mocked(prisma.inventoryLog.findMany).mockResolvedValue([]);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);

      const res = await getDashboard(makeRequest("http://localhost/api/admin/dashboard"));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.recentOrders[0]).toHaveProperty("code");
      expect(data.recentOrders[0]).toHaveProperty("customerName");
      expect(data.recentOrders[0]).toHaveProperty("total");
      expect(data.recentOrders[0]).not.toHaveProperty("customerEmail");
      expect(data.recentOrders[0]).not.toHaveProperty("customerPhone");
      expect(data.recentOrders[0]).not.toHaveProperty("document");
      expect(data.recentOrders[0]).not.toHaveProperty("shippingStreet");
      expect(data.recentOrders[0]).not.toHaveProperty("shippingCity");
    });
  });
});
