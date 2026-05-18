/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import EstoquePage from "@/app/admin/(dashboard)/estoque/page";

// Mock do Next.js Navigation
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock do next/image para evitar erros no JSDOM
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

describe("Painel de Estoque Administrativo (UI)", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("deve exibir o estado de loading inicialmente", async () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof global.fetch; // Promessa eterna
    render(<EstoquePage />);
    
    // O loading renderiza a tabela inicialmente
    const tableElement = screen.getByRole("table");
    expect(tableElement).toBeDefined();
  });

  it("deve exibir produtos com estoque retornados pela API", async () => {
    const mockProductsResponse = {
      products: [
        {
          id: "p1",
          name: "Filamento PLA Azul",
          slug: "filamento-pla-azul",
          sku: "PLA-BLU-1",
          image: null,
          stockQuantity: 15,
          active: true,
          category: { name: "Filamentos" },
        },
      ],
      pagination: { totalPages: 1, total: 1 },
      summary: { zeroStock: 0, lowStock: 0, threshold: 5 },
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProductsResponse),
      })
    ) as unknown as typeof global.fetch;

    render(<EstoquePage />);

    await waitFor(() => {
      expect(screen.getByText("Filamento PLA Azul")).toBeDefined();
      expect(screen.getByText("PLA-BLU-1")).toBeDefined();
      expect(screen.getByText("15")).toBeDefined();
      expect(screen.getByText("OK")).toBeDefined();
    });
  });

  it("deve exibir estado vazio se não houver produtos", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ products: [], pagination: {}, summary: {} }),
      })
    ) as unknown as typeof global.fetch;

    render(<EstoquePage />);

    await waitFor(() => {
      expect(screen.getByText("Nenhum produto encontrado")).toBeDefined();
    });
  });

  it("deve abrir o modal de ajuste e exibir dados corretos do produto", async () => {
    const mockProduct = {
      id: "p1",
      name: "Filamento PLA Azul",
      slug: "filamento-pla-azul",
      sku: "PLA-BLU-1",
      image: null,
      stockQuantity: 15,
      active: true,
      category: { name: "Filamentos" },
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          products: [mockProduct],
          pagination: { total: 1, totalPages: 1 },
          summary: { zeroStock: 0, lowStock: 0, threshold: 5 },
        }),
      })
    ) as unknown as typeof global.fetch;

    render(<EstoquePage />);

    await waitFor(() => {
      expect(screen.getByTitle("Ajustar estoque")).toBeDefined();
    });

    fireEvent.click(screen.getByTitle("Ajustar estoque"));

    await waitFor(() => {
      expect(screen.getByText("Ajustar Estoque")).toBeDefined();
      expect(screen.getAllByText("Filamento PLA Azul")).toHaveLength(2);
      expect(screen.getByText("Estoque atual:")).toBeDefined();
    });
  });

  it("deve preencher a movimentação manual com motivo e enviar dados válidos", async () => {
    const mockProduct = {
      id: "p1",
      name: "Filamento PLA Azul",
      sku: "PLA-BLU-1",
      image: null,
      stockQuantity: 15,
      active: true,
      category: null,
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          products: [mockProduct],
          pagination: { total: 1, totalPages: 1 },
          summary: { zeroStock: 0, lowStock: 0, threshold: 5 },
        }),
      })
    ) as unknown as typeof global.fetch;

    render(<EstoquePage />);

    await waitFor(() => {
      expect(screen.getByTitle("Ajustar estoque")).toBeDefined();
    });

    fireEvent.click(screen.getByTitle("Ajustar estoque"));

    // Preencher a quantidade no input
    const qtyInput = screen.getByPlaceholderText("Ex.: 10 ou -5") as HTMLInputElement;
    fireEvent.change(qtyInput, { target: { value: "10" } });

    // Preencher o motivo (obrigatório)
    const reasonInput = screen.getByPlaceholderText("Ex.: Entrada de NF 1234, Quebra, Inventário…") as HTMLInputElement;
    fireEvent.change(reasonInput, { target: { value: "Entrada de mercadoria" } });

    let postCallArgs: RequestInit | null = null;
    global.fetch = vi.fn((url: string, options?: RequestInit) => {
      if (url.includes("/api/admin/inventory") && options?.method === "POST") {
        postCallArgs = options;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ products: [], pagination: {}, summary: {} }),
      });
    }) as unknown as typeof global.fetch;

    fireEvent.click(screen.getByRole("button", { name: /confirmar ajuste/i }));

    await waitFor(() => {
      expect(postCallArgs).not.toBeNull();
      const body = JSON.parse(postCallArgs!.body as string);
      expect(body.productId).toBe("p1");
      expect(body.action).toBe("MANUAL");
      expect(body.quantity).toBe(10);
      expect(body.reason).toBe("Entrada de mercadoria");
    });
  });

  it("deve exibir erro vindo do backend amigavelmente na interface", async () => {
    const mockProduct = {
      id: "p1",
      name: "Filamento PLA Azul",
      sku: "PLA-BLU-1",
      image: null,
      stockQuantity: 15,
      active: true,
      category: null,
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          products: [mockProduct],
          pagination: { total: 1, totalPages: 1 },
          summary: { zeroStock: 0, lowStock: 0, threshold: 5 },
        }),
      })
    ) as unknown as typeof global.fetch;

    render(<EstoquePage />);

    await waitFor(() => {
      expect(screen.getByTitle("Ajustar estoque")).toBeDefined();
    });

    fireEvent.click(screen.getByTitle("Ajustar estoque"));

    const qtyInput = screen.getByPlaceholderText("Ex.: 10 ou -5") as HTMLInputElement;
    fireEvent.change(qtyInput, { target: { value: "-20" } }); // Saída excessiva

    const reasonInput = screen.getByPlaceholderText("Ex.: Entrada de NF 1234, Quebra, Inventário…") as HTMLInputElement;
    fireEvent.change(reasonInput, { target: { value: "Saída" } });

    global.fetch = vi.fn((url: string, options?: RequestInit) => {
      if (url.includes("/api/admin/inventory") && options?.method === "POST") {
        return Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({
            success: false,
            error: {
              code: "BAD_REQUEST",
              message: "Ajuste resultaria em estoque negativo (-5)",
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ products: [], pagination: {}, summary: {} }),
      });
    }) as unknown as typeof global.fetch;

    fireEvent.click(screen.getByRole("button", { name: /confirmar ajuste/i }));

    await waitFor(() => {
      expect(screen.getByText("Ajuste resultaria em estoque negativo (-5)")).toBeDefined();
    });
  });

  it("deve renderizar o histórico de movimentações com os saldos calculados", async () => {
    const mockProduct = {
      id: "p1",
      name: "Filamento PLA Azul",
      sku: "PLA-BLU-1",
      image: null,
      stockQuantity: 15,
      active: true,
      category: null,
    };

    global.fetch = vi.fn((url: string) => {
      if (url.includes("productId=p1")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            logs: [
              {
                id: "log1",
                change: 10,
                quantity: 10,
                type: "ADJUSTMENT",
                reason: "NF Entrada",
                previousStock: 5,
                newStock: 15,
                createdAt: new Date().toISOString(),
              },
            ],
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          products: [mockProduct],
          pagination: { total: 1, totalPages: 1 },
          summary: { zeroStock: 0, lowStock: 0, threshold: 5 },
        }),
      });
    }) as unknown as typeof global.fetch;

    render(<EstoquePage />);

    await waitFor(() => {
      expect(screen.getByTitle("Ver histórico")).toBeDefined();
    });

    fireEvent.click(screen.getByTitle("Ver histórico"));

    await waitFor(() => {
      expect(screen.getByText("Histórico de Estoque")).toBeDefined();
      expect(screen.getByText("NF Entrada")).toBeDefined();
      expect(screen.getByText("+10")).toBeDefined();
      expect(screen.getByText("Saldo: 5 un. → 15 un.")).toBeDefined();
    });
  });
});
