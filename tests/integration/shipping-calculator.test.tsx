/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { ShippingCalculator } from "@/components/shipping-calculator";

describe("ShippingCalculator Component (UI & Integration)", () => {
  const originalFetch = global.fetch;
  const mockOnShippingSelected = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("deve aplicar máscara XXXXX-XXX dinamicamente ao digitar o CEP", () => {
    render(<ShippingCalculator onShippingSelected={mockOnShippingSelected} />);
    const input = screen.getByPlaceholderText("Digite seu CEP") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "16200000" } });
    expect(input.value).toBe("16200-000");

    fireEvent.change(input, { target: { value: "abc123def45" } });
    expect(input.value).toBe("12345");
  });

  it("deve exibir indicador de loading durante a consulta à API de frete", async () => {
    let resolveRequest: any;
    const promise = new Promise((resolve) => {
      resolveRequest = resolve;
    });

    global.fetch = vi.fn().mockImplementation(() => promise);

    render(<ShippingCalculator onShippingSelected={mockOnShippingSelected} />);
    const input = screen.getByPlaceholderText("Digite seu CEP");
    const button = screen.getByRole("button", { name: "Calcular" });

    fireEvent.change(input, { target: { value: "16200-000" } });
    fireEvent.click(button);

    // Deve exibir reticências ou loading
    expect(screen.getByRole("button", { name: "..." })).toBeDefined();

    // Resolvendo a promessa com sucesso
    await act(async () => {
      resolveRequest({
        ok: true,
        json: () =>
          Promise.resolve({
            cepDestino: "16200000",
            endereco: { logradouro: "Rua Teste", bairro: "Centro", cidade: "Birigui", uf: "SP" },
            opcoes: [{ servico: "PAC", codigo: "04510", valor: "18,50", prazo: "3" }],
          }),
      });
    });

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: "..." })).toBeNull();
    });
  });

  it("deve renderizar opções de frete recebidas com sucesso", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          cepDestino: "16200000",
          endereco: { logradouro: "Rua Teste", bairro: "Centro", cidade: "Birigui", uf: "SP" },
          opcoes: [
            { servico: "PAC", codigo: "04510", valor: "18,50", prazo: "3" },
            { servico: "SEDEX", codigo: "04014", valor: "28,50", prazo: "1" },
          ],
        }),
    });

    render(<ShippingCalculator onShippingSelected={mockOnShippingSelected} />);
    const input = screen.getByPlaceholderText("Digite seu CEP");
    const button = screen.getByRole("button", { name: "Calcular" });

    fireEvent.change(input, { target: { value: "16200000" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("Rua Teste, Centro - Birigui/SP")).toBeDefined();
      expect(screen.getByText("PAC")).toBeDefined();
      expect(screen.getByText("R$ 18,50")).toBeDefined();
      expect(screen.getByText("SEDEX")).toBeDefined();
      expect(screen.getByText("R$ 28,50")).toBeDefined();
    });
  });

  it("deve exibir erro amigável na tela se o CEP for inexistente ou inválido", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({
          success: false,
          error: { code: "BAD_REQUEST", message: "CEP não encontrado ou inválido." },
        }),
    });

    render(<ShippingCalculator onShippingSelected={mockOnShippingSelected} />);
    const input = screen.getByPlaceholderText("Digite seu CEP");
    const button = screen.getByRole("button", { name: "Calcular" });

    fireEvent.change(input, { target: { value: "99999-999" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("CEP não encontrado ou inválido.")).toBeDefined();
    });
  });

  it("deve permitir preenchimento do número e seleção de frete, disparando o callback do pai", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          cepDestino: "16200000",
          endereco: { logradouro: "Rua Teste", bairro: "Centro", cidade: "Birigui", uf: "SP" },
          opcoes: [
            { servico: "PAC", codigo: "04510", valor: "18,50", prazo: "3" },
            { servico: "SEDEX", codigo: "04014", valor: "28,50", prazo: "1" },
          ],
        }),
    });

    render(<ShippingCalculator onShippingSelected={mockOnShippingSelected} />);
    const input = screen.getByPlaceholderText("Digite seu CEP");
    const button = screen.getByRole("button", { name: "Calcular" });

    fireEvent.change(input, { target: { value: "16200000" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("PAC")).toBeDefined();
    });

    // Encontrar os campos de endereço preenchíveis
    const inputNumero = screen.getByPlaceholderText("Ex.: 123");
    const inputComplemento = screen.getByPlaceholderText("Apto, bloco, referência...");

    fireEvent.change(inputNumero, { target: { value: "456" } });
    fireEvent.change(inputComplemento, { target: { value: "Apto 21" } });

    // Clicar na opção SEDEX
    const botaoSedex = screen.getByText("SEDEX").closest("button");
    expect(botaoSedex).toBeDefined();

    if (botaoSedex) {
      fireEvent.click(botaoSedex);
    }

    await waitFor(() => {
      // Callback deve ser chamado com os dados selecionados estruturados
      expect(mockOnShippingSelected).toHaveBeenCalledWith(
        expect.objectContaining({
          cep: "16200000",
          serviceCode: "04014",
          serviceName: "SEDEX",
          price: 28.5,
          address: expect.objectContaining({
            street: "Rua Teste",
            neighborhood: "Centro",
            city: "Birigui",
            state: "SP",
            number: "456",
            complement: "Apto 21",
          }),
        })
      );
    });
  });

  it("deve limpar a seleção e erros se o usuário começar a digitar um novo CEP", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          cepDestino: "16200000",
          endereco: { logradouro: "Rua Teste", bairro: "Centro", cidade: "Birigui", uf: "SP" },
          opcoes: [{ servico: "PAC", codigo: "04510", valor: "18,50", prazo: "3" }],
        }),
    });

    render(<ShippingCalculator onShippingSelected={mockOnShippingSelected} />);
    const input = screen.getByPlaceholderText("Digite seu CEP");
    const button = screen.getByRole("button", { name: "Calcular" });

    fireEvent.change(input, { target: { value: "16200000" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("PAC")).toBeDefined();
    });

    // Alterar o CEP no input
    fireEvent.change(input, { target: { value: "01001" } });

    // Resultados de frete e CEP devem sumir da tela
    expect(screen.queryByText("PAC")).toBeNull();
    expect(screen.queryByText("Rua Teste, Centro - Birigui/SP")).toBeNull();
    expect(mockOnShippingSelected).toHaveBeenLastCalledWith(null);
  });

  it("deve limpar resultados e redefinir seleção local se a prop itemsHash sofrer alteração", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          cepDestino: "16200000",
          endereco: { logradouro: "Rua Teste", bairro: "Centro", cidade: "Birigui", uf: "SP" },
          opcoes: [{ servico: "PAC", codigo: "04510", valor: "18,50", prazo: "3" }],
        }),
    });

    const { rerender } = render(
      <ShippingCalculator itemsHash="prod-1-qty-2" onShippingSelected={mockOnShippingSelected} />
    );
    const input = screen.getByPlaceholderText("Digite seu CEP");
    const button = screen.getByRole("button", { name: "Calcular" });

    fireEvent.change(input, { target: { value: "16200000" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("PAC")).toBeDefined();
    });

    // Renderizar novamente com um novo itemsHash (quantidade de itens no carrinho mudou)
    rerender(<ShippingCalculator itemsHash="prod-1-qty-3" onShippingSelected={mockOnShippingSelected} />);

    // Resultados de cálculo anteriores devem ser limpos imediatamente
    expect(screen.queryByText("PAC")).toBeNull();
    expect(mockOnShippingSelected).toHaveBeenLastCalledWith(null);
  });
});
