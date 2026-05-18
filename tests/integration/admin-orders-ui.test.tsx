/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import VendasPage from "@/app/admin/(dashboard)/vendas/page";

// Mock do Next.js Navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Painel de Pedidos/Vendas Administrativo (UI)", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const mockOrdersResponse = {
    orders: [
      {
        id: "o1",
        code: "PE-1001",
        customerName: "Lucas Pinheiro",
        customerEmail: "lucas@example.com",
        customerPhone: "11988887777",
        document: "123.456.789-00",
        shippingStreet: "Av Paulista",
        shippingNumber: "1000",
        shippingCity: "São Paulo",
        shippingState: "SP",
        shippingZip: "01311-100",
        notes: "Entregar na recepção",
        status: "PENDING",
        paymentStatus: "PAYMENT_PENDING",
        subtotal: 100.0,
        shippingCost: 15.0,
        discount: 0.0,
        total: 115.0,
        createdAt: "2026-05-17T12:00:00Z",
        items: [
          {
            id: "i1",
            name: "Filamento PLA Preto",
            sku: "FIL-PLA-PR",
            quantity: 2,
            unitPrice: 50.0,
            total: 100.0,
          },
        ],
      },
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    },
  };

  function mockDefaultFetchResponses(customOrders: any = mockOrdersResponse) {
    global.fetch = vi.fn((url: string) => {
      if (url.includes("/api/auth/me")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ userId: "u1", role: "ADMIN", email: "admin@ip3d.com" }),
        });
      }
      if (url.includes("/api/admin/orders")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(customOrders),
        });
      }
      return Promise.reject(new Error("Unmocked fetch url: " + url));
    }) as unknown as typeof global.fetch;
  }

  it("deve exibir o estado de loading inicialmente", async () => {
    // Promessa que nunca resolve para manter loading ativo
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof global.fetch;
    
    await act(async () => {
      render(<VendasPage />);
    });
    
    expect(screen.getByText(/Vendas/)).toBeDefined();
    // Elementos do skeleton ou tabela com loading
    expect(screen.queryByText("PE-1001")).toBeNull();
  });

  it("deve exibir a tabela preenchida com pedidos quando carregada com sucesso", async () => {
    mockDefaultFetchResponses();
    
    await act(async () => {
      render(<VendasPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("PE-1001")).toBeDefined();
      expect(screen.getByText("Lucas Pinheiro")).toBeDefined();
      expect(screen.getByText("PENDING")).toBeDefined();
      expect(screen.getByText("PAYMENT_PENDING")).toBeDefined();
    });
  });

  it("deve exibir estado de erro caso a requisição de API falhe", async () => {
    global.fetch = vi.fn((url: string) => {
      if (url.includes("/api/auth/me")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ userId: "u1", role: "ADMIN", email: "admin@ip3d.com" }),
        });
      }
      return Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Erro interno do servidor." }),
      });
    }) as unknown as typeof global.fetch;

    await act(async () => {
      render(<VendasPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Erro ao carregar dados do servidor")).toBeDefined();
    });
  });

  it("deve exibir estado vazio se não houver pedidos registrados", async () => {
    mockDefaultFetchResponses({ orders: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } });
    
    await act(async () => {
      render(<VendasPage />);
    });

    await waitFor(() => {
      expect(screen.getByText("Nenhum pedido encontrado.")).toBeDefined();
    });
  });

  it("deve abrir o modal de detalhes com informações completas ao clicar em Visualizar", async () => {
    mockDefaultFetchResponses();
    
    await act(async () => {
      render(<VendasPage />);
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /visualizar/i })).toBeDefined();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /visualizar/i }));
    });

    await waitFor(() => {
      expect(screen.getAllByText(/PE-1001/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Lucas Pinheiro/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Filamento PLA Preto/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("deve exibir botões de transição adequados e disparar PATCH ao clicar", async () => {
    mockDefaultFetchResponses();
    
    await act(async () => {
      render(<VendasPage />);
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /visualizar/i })).toBeDefined();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /visualizar/i }));
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /preparar envio/i })).toBeDefined();
    });

    // Mock do PATCH com sucesso
    let patchCallArgs: any = null;
    global.fetch = vi.fn((url: string, options?: RequestInit) => {
      if (url.includes("/api/auth/me")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ userId: "u1", role: "ADMIN", email: "admin@ip3d.com" }),
        });
      }
      if (url.includes("/api/admin/orders/o1") && options?.method === "PATCH") {
        patchCallArgs = JSON.parse(options.body as string);
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              order: { ...mockOrdersResponse.orders[0], status: "PROCESSING" },
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockOrdersResponse),
      });
    }) as unknown as typeof global.fetch;

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /preparar envio/i }));
    });

    await waitFor(() => {
      expect(patchCallArgs).not.toBeNull();
      expect(patchCallArgs.status).toBe("PROCESSING");
      expect(screen.getByText("Status do pedido atualizado com sucesso para PROCESSING.")).toBeDefined();
    });
  });

  it("deve exibir erro caso o clique na transição retorne falha da API", async () => {
    mockDefaultFetchResponses();
    
    await act(async () => {
      render(<VendasPage />);
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /visualizar/i })).toBeDefined();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /visualizar/i }));
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /preparar envio/i })).toBeDefined();
    });

    // Mock do PATCH com erro 409
    global.fetch = vi.fn((url: string, options?: RequestInit) => {
      if (url.includes("/api/auth/me")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ userId: "u1", role: "ADMIN", email: "admin@ip3d.com" }),
        });
      }
      if (url.includes("/api/admin/orders/o1") && options?.method === "PATCH") {
        return Promise.resolve({
          ok: false,
          status: 409,
          json: () =>
            Promise.resolve({
              error: {
                message: "Transição de status inválida",
              },
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockOrdersResponse),
      });
    }) as unknown as typeof global.fetch;

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /preparar envio/i }));
    });

    await waitFor(() => {
      expect(screen.getByText("Transição de status inválida")).toBeDefined();
    });
  });
});
