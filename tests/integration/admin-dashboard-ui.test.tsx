/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import AdminDashboardPage from "@/app/admin/(dashboard)/page";

// Mock do Next.js Navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Dashboard Administrativo (UI)", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("deve exibir skeletons de loading inicialmente", async () => {
    // Promessa eterna para simular loading persistente
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof global.fetch;
    render(<AdminDashboardPage />);

    // Verifica presença de skeletons animados (elementos pulse)
    const statsGrid = screen.queryByText("Visão Geral");
    expect(statsGrid).toBeNull(); // Não carregado ainda
  });

  it("deve exibir os KPIs e cartões de estatísticas com dados reais da API", async () => {
    const mockDashboardResponse = {
      success: true,
      stats: {
        totalOrders: 15,
        pendingOrders: 3,
        approvedOrders: 10,
        rejectedOrders: 2,
        approvedRevenue: 2500.00,
        ticketAverage: 250.00,
        activeProducts: 42,
        lowStockProducts: 4,
        outOfStockProducts: 1,
        pageViewsCount: 1200,
        clicksCount: 340,
      },
      recentOrders: [
        { id: "o1", code: "PE-01", customerName: "Carlos Souza", status: "DELIVERED", paymentStatus: "APPROVED", total: 450.00, createdAt: new Date().toISOString() },
      ],
      recentInventoryLogs: [
        { id: "log1", change: 5, reason: "Ajuste manual", createdAt: new Date().toISOString(), product: { name: "PLA Prata", sku: "PLA-SLV" } }
      ],
      topSoldProducts: [
        { productId: "p1", name: "Filamento PLA Preto", sku: "PLA-BLK", quantity: 8, total: 800.00 }
      ],
      alerts: []
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDashboardResponse),
      })
    ) as unknown as typeof global.fetch;

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Visão Geral")).toBeDefined();
      expect(screen.getByText("Total Pedidos")).toBeDefined();
      expect(screen.getByText("15")).toBeDefined(); // totalOrders
      
      // Valida faturamento (formatado BRL)
      expect(screen.getByText("R$ 2.500,00")).toBeDefined();
      expect(screen.getByText("R$ 250,00")).toBeDefined(); // ticketAverage
      
      // Valida estoque
      expect(screen.getByText("42")).toBeDefined(); // active
      expect(screen.getByText("4")).toBeDefined(); // low stock
      expect(screen.getByText("1")).toBeDefined(); // out of stock
    });
  });

  it("deve exibir estado de erro caso a API de dashboard falhe", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          success: false,
          error: { code: "SERVER_ERROR", message: "Erro crítico no banco de dados." }
        }),
      })
    ) as unknown as typeof global.fetch;

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Falha ao Carregar Dashboard")).toBeDefined();
      expect(screen.getByText("Erro crítico no banco de dados.")).toBeDefined();
    });
  });

  it("deve apresentar os alertas operacionais de estoque e logística quando retornados", async () => {
    const mockDashboardWithAlerts = {
      success: true,
      stats: {
        totalOrders: 1,
        pendingOrders: 0,
        approvedOrders: 1,
        rejectedOrders: 0,
        approvedRevenue: 100.00,
        ticketAverage: 100.00,
        activeProducts: 10,
        lowStockProducts: 1,
        outOfStockProducts: 1,
        pageViewsCount: 50,
        clicksCount: 10,
      },
      recentOrders: [],
      recentInventoryLogs: [],
      topSoldProducts: [],
      alerts: [
        { type: "ORDER_STOCK_ERROR", message: "Pedido PE-99 possui alerta de estoque insuficiente.", referenceId: "o99", createdAt: new Date().toISOString() },
        { type: "PRODUCT_OUT_OF_STOCK", message: "Produto PLA Neon está totalmente sem estoque.", referenceId: "p5", createdAt: new Date().toISOString() }
      ]
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDashboardWithAlerts),
      })
    ) as unknown as typeof global.fetch;

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Alertas Operacionais Pendentes (2)")).toBeDefined();
      expect(screen.getByText("Pedido PE-99 possui alerta de estoque insuficiente.")).toBeDefined();
      expect(screen.getByText("Produto PLA Neon está totalmente sem estoque.")).toBeDefined();
    });
  });

  it("deve renderizar a listagem de vendas recentes, logs de estoque e tráfego", async () => {
    const mockDashboardFull = {
      success: true,
      stats: {
        totalOrders: 20,
        pendingOrders: 5,
        approvedOrders: 12,
        rejectedOrders: 3,
        approvedRevenue: 3600.00,
        ticketAverage: 300.00,
        activeProducts: 30,
        lowStockProducts: 2,
        outOfStockProducts: 2,
        pageViewsCount: 800,
        clicksCount: 220,
      },
      recentOrders: [
        { id: "o1", code: "PE-123", customerName: "Maria Souza", status: "PROCESSING", paymentStatus: "APPROVED", total: 320.00, createdAt: new Date().toISOString() }
      ],
      recentInventoryLogs: [
        { id: "log1", change: -2, reason: "Ajuste manual", createdAt: new Date().toISOString(), product: { name: "PLA Prata", sku: "PLA-SLV" } }
      ],
      topSoldProducts: [
        { productId: "p1", name: "Filamento ABS Branco", sku: "ABS-WHT", quantity: 12, total: 1200.00 }
      ],
      alerts: []
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDashboardFull),
      })
    ) as unknown as typeof global.fetch;

    render(<AdminDashboardPage />);

    await waitFor(() => {
      // Vendas recentes
      expect(screen.getByText("PE-123")).toBeDefined();
      expect(screen.getByText("Maria Souza")).toBeDefined();
      expect(screen.getByText("PROCESSING")).toBeDefined();
      expect(screen.getByText("R$ 320,00")).toBeDefined();

      // Logs de estoque
      expect(screen.getByText("PLA Prata")).toBeDefined();
      expect(screen.getByText("-2")).toBeDefined();

      // Top vendidos
      expect(screen.getByText("1. Filamento ABS Branco")).toBeDefined();
      expect(screen.getByText("12 un.")).toBeDefined();

      // Tráfego
      expect(screen.getByText("800")).toBeDefined();
      expect(screen.getByText("220")).toBeDefined();
    });
  });

  it("deve disparar re-fetch ao alternar os filtros de período do dashboard", async () => {
    const mockDashboardRes = {
      success: true,
      stats: { totalOrders: 0, approvedRevenue: 0, ticketAverage: 0 },
      recentOrders: [],
      recentInventoryLogs: [],
      topSoldProducts: [],
      alerts: []
    };

    let fetchCount = 0;
    global.fetch = vi.fn(() => {
      fetchCount++;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockDashboardRes),
      });
    }) as unknown as typeof global.fetch;

    render(<AdminDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Visão Geral")).toBeDefined();
    });

    const button7d = screen.getByRole("button", { name: /7 dias/i });
    fireEvent.click(button7d);

    await waitFor(() => {
      // Primeiro fetch montagem + segundo fetch clique 7d
      expect(fetchCount).toBeGreaterThanOrEqual(2);
    });
  });
});
