/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProductClient, { Product } from "@/app/(site)/produtos/[slug]/ProductClient";
import * as cartLib from "@/lib/cart";
import React from "react";

// Mock do framer-motion
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

// Espionando o addToCart
const addToCartSpy = vi.spyOn(cartLib, "addToCart").mockImplementation(() => {});

const mockValidProduct: Product = {
  id: "prod-1",
  name: "Filamento PLA Premium",
  slug: "filamento-pla-premium",
  shortDescription: "Filamento de alta resistência",
  description: "<p>Descrição longa do filamento</p>",
  image: "/images/pla.jpg",
  gallery: ["/images/pla-2.jpg"],
  features: ["Eco-friendly", "Fácil impressão"],
  video: null,
  catalog: null,
  warranty: "3 meses",
  priceOriginal: 150,
  pricePromo: 120,
  pixPrice: 114,
  installments: 3,
  installmentValue: 40,
  stockQuantity: 10,
  category: { id: "cat-1", name: "Filamentos", slug: "filamentos" },
  specifications: [{ label: "Material", value: "PLA" }],
  brands: [],
};

describe("ProductClient (PDP UI)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o produto válido corretamente exibindo preço e especificações", async () => {
    const user = userEvent.setup();
    render(
      <ProductClient 
        product={mockValidProduct} 
        relatedProducts={[]} 
        initialWhatsappPhone="5511999999999" 
      />
    );

    // Nome (Heading H1)
    expect(screen.getByRole("heading", { name: "Filamento PLA Premium", level: 1 })).toBeDefined();
    
    // Preço (R$ 120,00)
    const priceElement = screen.getByTestId("product-price");
    expect(priceElement.textContent).toMatch(/R\$\s*120,00/);

    // Abre o modal de especificações
    const infoBtn = screen.getByRole("button", { name: /Informações Técnicas/i });
    await user.click(infoBtn);

    // Especificação agora visível
    expect(screen.getByText("Material")).toBeDefined();
    expect(screen.getByText("PLA")).toBeDefined();
  });

  it("deve exibir fallback acessível quando a imagem não existir", () => {
    const noImageProduct = { ...mockValidProduct, image: "", gallery: [] };
    render(
      <ProductClient 
        product={noImageProduct} 
        relatedProducts={[]} 
        initialWhatsappPhone="5511999999999" 
      />
    );

    expect(screen.getByText("Sem imagem disponível")).toBeDefined();
  });

  it("deve desabilitar compra e exibir 'Esgotado' quando estoque for 0", () => {
    const noStockProduct = { ...mockValidProduct, stockQuantity: 0 };
    render(
      <ProductClient 
        product={noStockProduct} 
        relatedProducts={[]} 
        initialWhatsappPhone="5511999999999" 
      />
    );

    const btn = screen.getByTestId("add-to-cart-btn") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    expect(btn.textContent).toContain("Esgotado");

    const stockInfo = screen.getByTestId("product-stock");
    expect(stockInfo.textContent).toContain("Produto esgotado");
  });

  it("deve chamar addToCart do helper correto quando clicado", async () => {
    const user = userEvent.setup();
    render(
      <ProductClient 
        product={mockValidProduct} 
        relatedProducts={[]} 
        initialWhatsappPhone="5511999999999" 
      />
    );

    const btn = screen.getByTestId("add-to-cart-btn");
    await user.click(btn);

    expect(addToCartSpy).toHaveBeenCalledTimes(1);
    expect(addToCartSpy).toHaveBeenCalledWith({
      productId: mockValidProduct.id,
      name: mockValidProduct.name,
      slug: mockValidProduct.slug,
      image: mockValidProduct.image,
      price: mockValidProduct.pricePromo, // basePrice
      quantity: 1,
      maxQuantity: mockValidProduct.stockQuantity,
    });
    
    expect(screen.getByRole("alert").textContent).toBe("Produto adicionado ao carrinho!");
  });
});
