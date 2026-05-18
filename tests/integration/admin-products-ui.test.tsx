/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import ProdutosPage from "@/app/admin/(dashboard)/produtos/page";

// Mock do Next.js Navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: mockPush }),
}));

// Mock do next/image para evitar erros no JSDOM
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock do Framer Motion
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useInView: () => true,
    motion: {
      div: ({ children, "data-testid": testId, ...props }: React.HTMLAttributes<HTMLDivElement> & { "data-testid"?: string } & Record<string, unknown>) => (
        <div data-testid={testId} {...props}>{children}</div>
      ),
    },
  };
});

describe("Painel de Produtos Administrativo (UI)", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("deve exibir o estado de loading inicialmente", async () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof global.fetch; // Promessa que nunca resolve
    render(<ProdutosPage />);
    expect(screen.getByText("Carregando...")).toBeDefined();
  });

  it("deve exibir produtos retornados pela API com sucesso", async () => {
    const mockProductsResponse = {
      products: [
        {
          id: "p1",
          name: "Impressora 3D Creality",
          slug: "impressora-3d-creality",
          priceOriginal: 2999.00,
          pricePromo: 2799.00,
          stockQuantity: 5,
          active: true,
          categories: [],
        },
      ],
      pagination: { totalPages: 1 },
    };

    global.fetch = vi.fn((url: string) => {
      if (url.includes("/api/admin/categories")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ categories: [] }) });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProductsResponse),
      });
    }) as unknown as typeof global.fetch;

    render(<ProdutosPage />);

    await waitFor(() => {
      expect(screen.queryByText("Carregando...")).toBeNull();
      expect(screen.getByText("Impressora 3D Creality")).toBeDefined();
      expect(screen.getByText("impressora-3d-creality")).toBeDefined();
    });
  });

  it("deve exibir estado vazio caso não haja produtos cadastrados", async () => {
    global.fetch = vi.fn((url: string) => {
      if (url.includes("/api/admin/categories")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ categories: [] }) });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ products: [], pagination: { totalPages: 0 } }),
      });
    }) as unknown as typeof global.fetch;

    render(<ProdutosPage />);

    await waitFor(() => {
      expect(screen.getByText("Nenhum produto encontrado")).toBeDefined();
    });
  });

  it("deve abrir o modal de criação ao clicar em Novo Produto", async () => {
    global.fetch = vi.fn((url: string) => {
      if (url.includes("/api/admin/categories")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ categories: [] }) });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ products: [], pagination: { totalPages: 0 } }),
      });
    }) as unknown as typeof global.fetch;

    render(<ProdutosPage />);

    await waitFor(() => {
      expect(screen.getByText("Novo Produto")).toBeDefined();
    });

    const user = userEvent.setup();
    const btn = screen.getByRole("button", { name: /novo produto/i });
    await user.click(btn);

    await waitFor(() => {
      expect(screen.getByText("Nome *")).toBeDefined();
      expect(screen.getByText("Descrição Completa")).toBeDefined();
    });
  });

  it("deve preencher o formulário e enviar requisição POST válida ao salvar", async () => {
    global.fetch = vi.fn((url: string) => {
      if (url.includes("/api/admin/categories")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ categories: [] }) });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ products: [], pagination: { totalPages: 0 } }),
      });
    }) as unknown as typeof global.fetch;

    render(<ProdutosPage />);

    await waitFor(() => {
      expect(screen.getByText("Novo Produto")).toBeDefined();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /novo produto/i }));

    const nameLabel = screen.getByText("Nome *");
    const nameInput = nameLabel.nextElementSibling as HTMLInputElement;
    await user.type(nameInput, "Novo Filamento PLA");

    const basePriceLabel = screen.getByText("Preço base (R$)");
    const basePriceInput = basePriceLabel.nextElementSibling as HTMLInputElement;
    await user.type(basePriceInput, "120");

    const stockLabel = screen.getByText("Estoque");
    const stockInput = stockLabel.nextElementSibling as HTMLInputElement;
    await user.type(stockInput, "50");

    // Mockar requisição POST de sucesso
    let postCallArgs: RequestInit | null = null;
    global.fetch = vi.fn((url: string, options?: RequestInit) => {
      if (url.includes("/api/admin/products") && options?.method === "POST") {
        postCallArgs = options;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ products: [], pagination: { totalPages: 0 } }),
      });
    }) as unknown as typeof global.fetch;

    const saveBtn = screen.getByRole("button", { name: /salvar/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(postCallArgs).not.toBeNull();
      const payload = JSON.parse(postCallArgs.body);
      expect(payload.name).toBe("Novo Filamento PLA");
      expect(payload.priceOriginal).toBe(120);
      expect(payload.stockQuantity).toBe(50);
    });
  });

  it("deve exibir mensagem amigável de erro vinda da API no Toast caso a requisição falhe", async () => {
    global.fetch = vi.fn((url: string) => {
      if (url.includes("/api/admin/categories")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ categories: [] }) });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ products: [], pagination: { totalPages: 0 } }),
      });
    }) as unknown as typeof global.fetch;

    render(<ProdutosPage />);

    await waitFor(() => {
      expect(screen.getByText("Novo Produto")).toBeDefined();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /novo produto/i }));

    const nameLabel = screen.getByText("Nome *");
    const nameInput = nameLabel.nextElementSibling as HTMLInputElement;
    await user.type(nameInput, "Produto Falho");

    // Mockar requisição de erro com padrão estruturado api-utils
    global.fetch = vi.fn((url: string, options?: RequestInit) => {
      if (options?.method === "POST") {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({
            success: false,
            error: {
              code: "BAD_REQUEST",
              message: "Erro de validação: Nome do produto já existe.",
            },
          }),
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }) as unknown as typeof global.fetch;

    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(screen.getByText("Erro de validação: Nome do produto já existe.")).toBeDefined();
    });
  });
});
