/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ProductsPage from "@/app/(site)/produtos/page";
import React from "react";

// Mock do Next.js Navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: mockPush }),
}));

// Mock do Framer Motion para evitar delays e problemas de IntersectionObserver
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useInView: () => true, // Sempre visível para testes
    motion: {
      div: ({ children, "data-testid": testId, ...props }: React.HTMLAttributes<HTMLDivElement> & { "data-testid"?: string } & Record<string, unknown>) => (
        <div data-testid={testId} {...props}>{children}</div>
      ),
    },
  };
});

describe("Página de Produtos (UI)", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("deve exibir o estado de loading inicialmente", async () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof global.fetch; // Promessa pendente infinita
    render(<ProductsPage />);
    expect(screen.getByTestId("loading-state")).toBeDefined();
  });

  it("deve exibir produtos quando a API retornar sucesso", async () => {
    const mockApiResponse = {
      success: true,
      data: {
        items: [
          { id: "1", name: "Produto Teste 1", slug: "produto-teste-1", priceOriginal: 100 },
        ],
        pagination: { totalPages: 1, total: 1, page: 1 },
      },
    };

    global.fetch = vi.fn((url: string) => {
      if (url.includes("/api/categories") || url.includes("/api/pages")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockApiResponse) });
    }) as unknown as typeof global.fetch;

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.queryByTestId("loading-state")).toBeNull();
      expect(screen.getByTestId("product-grid")).toBeDefined();
      expect(screen.getByText("Produto Teste 1")).toBeDefined();
    });
  });

  it("deve exibir o estado vazio quando a API retornar 0 itens", async () => {
    const mockEmptyResponse = {
      success: true,
      data: { items: [], pagination: { totalPages: 1, total: 0 } },
    };

    global.fetch = vi.fn((url: string) => {
      if (url.includes("/api/categories") || url.includes("/api/pages")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve(mockEmptyResponse) });
    }) as unknown as typeof global.fetch;

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeDefined();
      expect(screen.getByText("Nenhum produto encontrado.")).toBeDefined();
    });
  });

  it("deve exibir o estado de erro quando a requisição falhar (ex: 500)", async () => {
    global.fetch = vi.fn((url: string) => {
      if (url.includes("/api/products")) {
        return Promise.resolve({ ok: false, status: 500 });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as unknown as typeof global.fetch;

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("error-state")).toBeDefined();
      expect(screen.getByText("Ops! Ocorreu um problema.")).toBeDefined();
    });
  });

  it("deve renderizar botões de paginação quando houver múltiplas páginas", async () => {
    const mockPagiResponse = {
      success: true,
      data: {
        items: [{ id: "1", name: "Pagina 1", slug: "p1" }],
        pagination: { totalPages: 3, total: 30, page: 1 },
      },
    };

    global.fetch = vi.fn((url: string) => {
      if (url.includes("/api/products")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPagiResponse) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as unknown as typeof global.fetch;

    render(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByTestId("pagination-controls")).toBeDefined();
      expect(screen.getByRole("button", { name: "Página 2" })).toBeDefined();
    });
  });

  it("deve disparar nova requisição de API com os parâmetros de ordenação", async () => {
    let lastFetchedUrl = "";
    global.fetch = vi.fn((url: string) => {
      if (url.includes("/api/products")) {
        lastFetchedUrl = url;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { items: [], pagination: {} } }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as unknown as typeof global.fetch;

    render(<ProductsPage />);

    await waitFor(() => {
      expect(lastFetchedUrl).toContain("sort=newest");
    });

    const user = userEvent.setup();
    const select = screen.getByLabelText("Ordenar produtos");
    
    await user.selectOptions(select, "price_asc");

    await waitFor(() => {
      expect(lastFetchedUrl).toContain("sort=price_asc");
    });
  });
});
