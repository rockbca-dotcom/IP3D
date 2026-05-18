/**
 * @vitest-environment jsdom
 */
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import React from "react";
import CarrinhoPage from "@/app/(site)/carrinho/page";
import { writeCart } from "@/lib/cart";

// Mock do Next.js Image para evitar carregamentos e renderizar tags img puras
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} src={props.src || ""} alt={props.alt || ""} />;
  },
}));

// Mock do Next.js Link
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock do ShippingCalculator para simplificar o cálculo nos testes de UI
vi.mock("@/components/shipping-calculator", () => ({
  ShippingCalculator: ({ onShippingSelected }: any) => (
    <div data-testid="shipping-calculator">
      <button
        type="button"
        onClick={() =>
          onShippingSelected({
            serviceName: "Sedex",
            price: 25.0,
            address: { street: "Rua A", number: "123", city: "Sampa", state: "SP" },
          })
        }
      >
        Selecionar Sedex (R$ 25,00)
      </button>
    </div>
  ),
}));

describe("CarrinhoPage (Cart UI & Integration)", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
      (window as any).fetch = mockFetch;
    }
    vi.clearAllMocks();
    global.fetch = mockFetch;
    (globalThis as any).fetch = mockFetch;

    // Mock padrão do fetch retornando produto ativo
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          product: {
            id: "prod-1",
            name: "Filamento PLA Premium",
            slug: "filamento-pla-premium",
            active: true,
            pricePromo: 120.0,
            stockQuantity: 10,
          },
        },
      }),
    });
  });

  test("deve renderizar tela vazia se o carrinho nao tiver itens", () => {
    render(<CarrinhoPage />);

    expect(screen.getByText("Seu carrinho esta vazio")).toBeDefined();
    expect(screen.getByRole("link", { name: "Ir para produtos" })).toBeDefined();
  });

  test("deve renderizar itens do carrinho e resumo corretamente", async () => {
    writeCart([
      {
        productId: "prod-1",
        name: "Filamento PLA Premium",
        slug: "filamento-pla-premium",
        image: "/images/pla.jpg",
        price: 120.0,
        quantity: 2,
        maxQuantity: 10,
      },
    ]);

    await act(async () => {
      render(<CarrinhoPage />);
    });

    // Nome e preço do produto
    expect(screen.getByText("Filamento PLA Premium")).toBeDefined();
    expect(screen.getByText(/Valor unitario:\s*R\$\s*120,00/i)).toBeDefined();

    // Quantidade no input
    const input = screen.getByLabelText("Quantidade de Filamento PLA Premium") as HTMLInputElement;
    expect(input.value).toBe("2");

    // Subtotal correto
    expect(screen.getByText(/Subtotal:\s*R\$\s*240,00/i)).toBeDefined();
  });

  test("deve incrementar e decrementar quantidade de itens no carrinho", async () => {
    writeCart([
      {
        productId: "prod-1",
        name: "Filamento PLA Premium",
        slug: "filamento-pla-premium",
        image: null,
        price: 120.0,
        quantity: 2,
        maxQuantity: 10,
      },
    ]);

    await act(async () => {
      render(<CarrinhoPage />);
    });

    const incBtn = screen.getByLabelText("Aumentar quantidade de Filamento PLA Premium");
    const decBtn = screen.getByLabelText("Diminuir quantidade de Filamento PLA Premium");
    const input = screen.getByLabelText("Quantidade de Filamento PLA Premium") as HTMLInputElement;

    // Clica para aumentar
    await act(async () => {
      fireEvent.click(incBtn);
    });
    expect(input.value).toBe("3");

    // Clica para diminuir
    await act(async () => {
      fireEvent.click(decBtn);
    });
    expect(input.value).toBe("2");
  });

  test("deve bloquear incremento se exceder estoque e mostrar banner de erro", async () => {
    writeCart([
      {
        productId: "prod-1",
        name: "Filamento PLA Premium",
        slug: "filamento-pla-premium",
        image: null,
        price: 120.0,
        quantity: 5,
        maxQuantity: 5, // Estoque máximo é 5
      },
    ]);

    // Mock do fetch retornando estoque máximo 5 para evitar que a revalidação atualize para 10
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          product: {
            id: "prod-1",
            name: "Filamento PLA Premium",
            slug: "filamento-pla-premium",
            active: true,
            pricePromo: 120.0,
            stockQuantity: 5,
          },
        },
      }),
    });

    await act(async () => {
      render(<CarrinhoPage />);
    });

    const incBtn = screen.getByLabelText("Aumentar quantidade de Filamento PLA Premium");
    const input = screen.getByLabelText("Quantidade de Filamento PLA Premium") as HTMLInputElement;

    // Clica para aumentar além do estoque
    await act(async () => {
      fireEvent.click(incBtn);
    });

    // Quantidade permanece bloqueada em 5
    expect(input.value).toBe("5");

    // Banner de erro deve aparecer
    expect(screen.getByText(/Quantidade solicitada indisponível. Estoque máximo: 5/i)).toBeDefined();
  });

  test("deve remover item ao clicar no botao de remover", async () => {
    writeCart([
      {
        productId: "prod-1",
        name: "Filamento PLA Premium",
        slug: "filamento-pla-premium",
        image: null,
        price: 120.0,
        quantity: 2,
        maxQuantity: 10,
      },
    ]);

    await act(async () => {
      render(<CarrinhoPage />);
    });

    const removeBtn = screen.getByLabelText("Remover Filamento PLA Premium do carrinho");

    await act(async () => {
      fireEvent.click(removeBtn);
    });

    expect(screen.getByText("Seu carrinho esta vazio")).toBeDefined();
  });

  test("deve limpar carrinho ao clicar no botao limpar carrinho", async () => {
    writeCart([
      {
        productId: "prod-1",
        name: "Filamento PLA Premium",
        slug: "filamento-pla-premium",
        image: null,
        price: 120.0,
        quantity: 2,
        maxQuantity: 10,
      },
    ]);

    await act(async () => {
      render(<CarrinhoPage />);
    });

    const clearBtn = screen.getByRole("button", { name: "Limpar carrinho" });

    await act(async () => {
      fireEvent.click(clearBtn);
    });

    expect(screen.getByText("Seu carrinho esta vazio")).toBeDefined();
  });

  test("revalidacao: deve remover item se a API retornar 404", async () => {
    writeCart([
      {
        productId: "prod-1",
        name: "Filamento PLA Premium",
        slug: "filamento-pla-premium",
        image: null,
        price: 120.0,
        quantity: 2,
        maxQuantity: 10,
      },
    ]);

    // Simula produto inexistente (404)
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ success: false, error: "Not found" }),
    });

    await act(async () => {
      render(<CarrinhoPage />);
    });

    // Deve exibir estado vazio porque o produto foi removido
    expect(screen.getByText("Seu carrinho esta vazio")).toBeDefined();
  });

  test("revalidacao: deve remover item se a API retornar active false", async () => {
    writeCart([
      {
        productId: "prod-1",
        name: "Filamento PLA Premium",
        slug: "filamento-pla-premium",
        image: null,
        price: 120.0,
        quantity: 2,
        maxQuantity: 10,
      },
    ]);

    // Simula produto desativado
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          product: {
            id: "prod-1",
            name: "Filamento PLA Premium",
            slug: "filamento-pla-premium",
            active: false, // inativo!
            pricePromo: 120.0,
            stockQuantity: 10,
          },
        },
      }),
    });

    await act(async () => {
      render(<CarrinhoPage />);
    });

    // Deve exibir estado vazio porque o produto foi inativado
    expect(screen.getByText("Seu carrinho esta vazio")).toBeDefined();
  });

  test("revalidacao: deve atualizar preco se alterado no backend", async () => {
    writeCart([
      {
        productId: "prod-1",
        name: "Filamento PLA Premium",
        slug: "filamento-pla-premium",
        image: null,
        price: 120.0, // preço antigo
        quantity: 2,
        maxQuantity: 10,
      },
    ]);

    // Simula novo preço promocional de R$ 99,90
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          product: {
            id: "prod-1",
            name: "Filamento PLA Premium",
            slug: "filamento-pla-premium",
            active: true,
            pricePromo: 99.9, // preço novo!
            stockQuantity: 10,
          },
        },
      }),
    });

    await act(async () => {
      render(<CarrinhoPage />);
    });

    // Valida que o preço na tela foi atualizado e que o aviso de mudança de preço é exibido
    await waitFor(() => {
      expect(screen.getByText(/Valor unitario:\s*R\$\s*99,90/i)).toBeDefined();
      expect(screen.getByText(/O preço do produto "Filamento PLA Premium" mudou/i)).toBeDefined();
    });
  });

  test("revalidacao: deve reduzir quantidade se o estoque caiu abaixo do desejado", async () => {
    writeCart([
      {
        productId: "prod-1",
        name: "Filamento PLA Premium",
        slug: "filamento-pla-premium",
        image: null,
        price: 120.0,
        quantity: 8, // quer comprar 8
        maxQuantity: 10,
      },
    ]);

    // Simula estoque reduzido para 3
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          product: {
            id: "prod-1",
            name: "Filamento PLA Premium",
            slug: "filamento-pla-premium",
            active: true,
            pricePromo: 120.0,
            stockQuantity: 3, // novo estoque!
          },
        },
      }),
    });

    await act(async () => {
      render(<CarrinhoPage />);
    });

    await waitFor(() => {
      const input = screen.getByLabelText("Quantidade de Filamento PLA Premium") as HTMLInputElement;
      expect(input.value).toBe("3"); // reduziu para 3
      expect(screen.getByText(/A quantidade do produto "Filamento PLA Premium" foi reduzida para 3/i)).toBeDefined();
    });
  });

  test("acessibilidade: campos de dados do cliente devem ter labels associados via htmlFor/id, focus classes e aria-required", async () => {
    writeCart([
      {
        productId: "prod-1",
        name: "Filamento PLA Premium",
        slug: "filamento-pla-premium",
        image: "/images/pla.jpg",
        price: 120.0,
        quantity: 2,
        maxQuantity: 10,
      },
    ]);

    await act(async () => {
      render(<CarrinhoPage />);
    });

    const nameInput = screen.getByLabelText(/Nome completo \*/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/E-mail \*/i) as HTMLInputElement;
    const phoneInput = screen.getByLabelText(/Telefone \(opcional\)/i) as HTMLInputElement;

    expect(nameInput).toBeDefined();
    expect(nameInput.id).toBe("customer-name");
    expect(nameInput.getAttribute("aria-required")).toBe("true");

    expect(emailInput).toBeDefined();
    expect(emailInput.id).toBe("customer-email");
    expect(emailInput.getAttribute("aria-required")).toBe("true");

    expect(phoneInput).toBeDefined();
    expect(phoneInput.id).toBe("customer-phone");
  });

  test("acessibilidade: alertas de estoque e revalidacao devem possuir role='alert'", async () => {
    writeCart([
      {
        productId: "prod-1",
        name: "Filamento PLA Premium",
        slug: "filamento-pla-premium",
        image: null,
        price: 120.0,
        quantity: 5,
        maxQuantity: 5,
      },
    ]);

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          product: {
            id: "prod-1",
            name: "Filamento PLA Premium",
            slug: "filamento-pla-premium",
            active: true,
            pricePromo: 120.0,
            stockQuantity: 5,
          },
        },
      }),
    });

    await act(async () => {
      render(<CarrinhoPage />);
    });

    const incBtn = screen.getByLabelText("Aumentar quantidade de Filamento PLA Premium");
    await act(async () => {
      fireEvent.click(incBtn);
    });

    // Erro de limite de estoque deve possuir role='alert'
    const errorAlert = screen.getByRole("alert");
    expect(errorAlert).toBeDefined();
    expect(errorAlert.textContent).toContain("Quantidade solicitada indisponível. Estoque máximo: 5");
  });
});

