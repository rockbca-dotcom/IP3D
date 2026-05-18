/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import CategoriasPage from "@/app/admin/(dashboard)/categorias/page";

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

describe("Painel de Categorias Administrativo (UI)", () => {
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
    render(<CategoriasPage />);
    expect(screen.getByText("Carregando...")).toBeDefined();
  });

  it("deve exibir categorias retornadas pela API com sucesso", async () => {
    const mockCategoriesResponse = {
      categories: [
        {
          id: "c1",
          name: "Filamentos",
          slug: "filamentos",
          description: "Filamentos 3D",
          image: null,
          color: "#3B82F6",
          icon: null,
          order: 1,
          active: true,
          parentId: null,
          parent: null,
          children: [
            {
              id: "c2",
              name: "Filamento PLA",
              slug: "filamento-pla",
              description: "Pla filamentos",
              image: null,
              color: null,
              icon: null,
              order: 1,
              active: true,
              parentId: "c1",
              _count: { productCategories: 5 },
            },
          ],
          _count: { productCategories: 2 },
        },
      ],
    };

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockCategoriesResponse),
      })
    ) as unknown as typeof global.fetch;

    render(<CategoriasPage />);

    await waitFor(() => {
      expect(screen.queryByText("Carregando...")).toBeNull();
      expect(screen.getByText("Filamentos")).toBeDefined();
      expect(screen.getByText("filamentos")).toBeDefined();
      expect(screen.getByText("Filamento PLA")).toBeDefined();
      expect(screen.getByText("filamento-pla")).toBeDefined();
    });
  });

  it("deve exibir estado vazio caso não haja categorias", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ categories: [] }),
      })
    ) as unknown as typeof global.fetch;

    render(<CategoriasPage />);

    await waitFor(() => {
      expect(screen.queryByText("Carregando...")).toBeNull();
      expect(screen.getByText("Nenhuma categoria cadastrada")).toBeDefined();
    });
  });

  it("deve abrir o modal de criação ao clicar em Nova Categoria", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ categories: [] }),
      })
    ) as unknown as typeof global.fetch;

    render(<CategoriasPage />);

    await waitFor(() => {
      expect(screen.getByText("Nova Categoria")).toBeDefined();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /nova categoria/i }));

    await waitFor(() => {
      expect(screen.getByText("Nome *")).toBeDefined();
      expect(screen.getByText("Slug")).toBeDefined();
    });
  });

  it("deve preencher o formulário e enviar requisição POST válida ao salvar", async () => {
    global.fetch = vi.fn((url: string) => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ categories: [] }),
      });
    }) as unknown as typeof global.fetch;

    render(<CategoriasPage />);

    await waitFor(() => {
      expect(screen.getByText("Nova Categoria")).toBeDefined();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /nova categoria/i }));

    const nameLabel = screen.getByText("Nome *");
    const nameInput = nameLabel.nextElementSibling as HTMLInputElement;
    await user.type(nameInput, "Impressoras 3D");

    // Mockar requisição POST de sucesso
    let postCallArgs: RequestInit | null = null;
    global.fetch = vi.fn((url: string, options?: RequestInit) => {
      if (url.includes("/api/admin/categories") && options?.method === "POST") {
        postCallArgs = options;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, category: { id: "c-new", name: "Impressoras 3D", slug: "impressoras-3d" } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ categories: [] }),
      });
    }) as unknown as typeof global.fetch;

    await user.click(screen.getByRole("button", { name: /^salvar$/i }));

    await waitFor(() => {
      expect(postCallArgs).not.toBeNull();
      const body = JSON.parse(postCallArgs!.body as string);
      expect(body.name).toBe("Impressoras 3D");
      expect(body.slug).toBe("impressoras-3d");
    });
  });

  it("deve exibir mensagem amigável de erro vinda da API no Toast caso a requisição falhe", async () => {
    global.fetch = vi.fn(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ categories: [] }),
      });
    }) as unknown as typeof global.fetch;

    render(<CategoriasPage />);

    await waitFor(() => {
      expect(screen.getByText("Nova Categoria")).toBeDefined();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /nova categoria/i }));

    const nameLabel = screen.getByText("Nome *");
    const nameInput = nameLabel.nextElementSibling as HTMLInputElement;
    await user.type(nameInput, "Impressoras 3D");

    // Mockar requisição POST com erro 409 estruturado
    const mockErrorResponse = {
      success: false,
      error: {
        code: "CONFLICT",
        message: "Já existe uma categoria com este slug.",
      },
    };

    global.fetch = vi.fn((url: string, options?: RequestInit) => {
      if (url.includes("/api/admin/categories") && options?.method === "POST") {
        return Promise.resolve({
          ok: false,
          status: 409,
          json: () => Promise.resolve(mockErrorResponse),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ categories: [] }),
      });
    }) as unknown as typeof global.fetch;

    await user.click(screen.getByRole("button", { name: /^salvar$/i }));

    await waitFor(() => {
      expect(screen.getByText("Já existe uma categoria com este slug.")).toBeDefined();
    });
  });
});
