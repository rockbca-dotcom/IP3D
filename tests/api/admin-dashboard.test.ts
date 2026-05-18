import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
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

describe("API de Dashboard Administrativo — GET /api/admin/dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("RBAC e Segurança", () => {
    it("deve rejeitar com 401 se o usuário não estiver autenticado", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(
        NextResponse.json({ error: "Não autenticado." }, { status: 401 })
      );

      const res = await getDashboard(makeRequest("http://localhost/api/admin/dashboard"));
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe("Não autenticado.");
    });

    it("deve rejeitar com 403 se o usuário for EDITOR", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(
        NextResponse.json({ error: "Acesso negado." }, { status: 403 })
      );

      const res = await getDashboard(makeRequest("http://localhost/api/admin/dashboard"));
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe("Acesso negado.");
    });
  });

  describe("Cálculos de KPIs e Agregações", () => {
    it("deve retornar estatísticas completas agregadas com faturamento e ticket médio corretos", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      // Mocks de contagem
      vi.mocked(prisma.order.count)
        .mockResolvedValueOnce(10) // totalOrders
        .mockResolvedValueOnce(3)  // pendingOrders
        .mockResolvedValueOnce(5)  // approvedOrders
        .mockResolvedValueOnce(2); // rejectedOrders

      vi.mocked(prisma.order.aggregate).mockResolvedValue({
        _sum: { total: 1000.00 },
      } as any);

      vi.mocked(prisma.product.count)
        .mockResolvedValueOnce(50) // activeProducts
        .mockResolvedValueOnce(4)  // lowStockProducts
        .mockResolvedValueOnce(2); // outOfStockProducts

      vi.mocked(prisma.pageView.count).mockResolvedValue(250);
      vi.mocked(prisma.click.count).mockResolvedValue(80);

      // Mocks de listas
      vi.mocked(prisma.order.findMany)
        .mockResolvedValueOnce([
          { id: "o1", code: "PE1", customerName: "Maria Silva", status: "PENDING", paymentStatus: "PAYMENT_PENDING", total: 150.00, createdAt: new Date() },
        ] as any) // recentOrdersRaw
        .mockResolvedValueOnce([]); // insufficientStockOrders

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
      expect(data.stats.approvedRevenue).toBe(1000.00);
      expect(data.stats.ticketAverage).toBe(200.00); // 1000.00 / 5
      expect(data.stats.activeProducts).toBe(50);
      expect(data.stats.lowStockProducts).toBe(4);
      expect(data.stats.outOfStockProducts).toBe(2);
      expect(data.stats.pageViewsCount).toBe(250);
      expect(data.stats.clicksCount).toBe(80);
      expect(data.recentOrders).toHaveLength(1);
    });

    it("deve retornar ticket médio = 0 se não houver faturamento aprovado ou pedidos aprovados", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      vi.mocked(prisma.order.count)
        .mockResolvedValueOnce(5) // totalOrders
        .mockResolvedValueOnce(5) // pendingOrders
        .mockResolvedValueOnce(0) // approvedOrders (zero)
        .mockResolvedValueOnce(0); // rejectedOrders

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
  });

  describe("Validação de Período", () => {
    it("deve retornar erro 400 se o período informado for inválido", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      const res = await getDashboard(makeRequest("http://localhost/api/admin/dashboard?period=90d"));
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("BAD_REQUEST");
    });

    it("deve retornar erro 400 se o período for custom mas startDate ou endDate estiverem ausentes", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      const res = await getDashboard(makeRequest("http://localhost/api/admin/dashboard?period=custom"));
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("BAD_REQUEST");
      expect(data.error.message).toContain("obrigatórias");
    });

    it("deve aceitar período customizado com datas válidas e consistentes", async () => {
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

  describe("Privacidade e Proteção de Dados de Clientes", () => {
    it("não deve expor informações sensíveis como endereço completo, telefone ou documento de clientes na lista de vendas recentes", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      vi.mocked(prisma.order.count).mockResolvedValue(0);
      vi.mocked(prisma.order.aggregate).mockResolvedValue({ _sum: { total: null } } as any);
      vi.mocked(prisma.product.count).mockResolvedValue(0);
      vi.mocked(prisma.pageView.count).mockResolvedValue(0);
      vi.mocked(prisma.click.count).mockResolvedValue(0);

      // Simula retorno seguro com select restrito
      const mockRecentOrders = [
        {
          id: "o1",
          code: "PE1",
          customerName: "Maria Silva",
          status: "PENDING",
          paymentStatus: "PAYMENT_PENDING",
          total: 150.00,
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
      
      // Garante que campos sensíveis de privacidade não foram vazados
      expect(data.recentOrders[0]).not.toHaveProperty("customerEmail");
      expect(data.recentOrders[0]).not.toHaveProperty("customerPhone");
      expect(data.recentOrders[0]).not.toHaveProperty("document");
      expect(data.recentOrders[0]).not.toHaveProperty("shippingStreet");
      expect(data.recentOrders[0]).not.toHaveProperty("shippingCity");
    });
  });
});
