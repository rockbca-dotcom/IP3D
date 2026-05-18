/**
 * tests/integration/checkout-validation.test.ts
 *
 * Testes de integração da função prepareCheckout usando Vitest.
 *
 * Camada: INTEGRATION — testa a função completa com todas as suas validações
 * e lógica de negócio, mas com o Prisma mockado.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeCheckoutPayload, makeCustomer, makeShipping, makePrismaProduct, makeItem } from "../helpers/fixtures";
import { assertHasKeys, assertOrderCode } from "../helpers/assert";

// ---------------------------------------------------------------------------
// Mock do Prisma
// ---------------------------------------------------------------------------

const mockProducts = [makePrismaProduct()];
const mockOrderCreate = {
  id: "order_int_001",
  code: "GT-100001",
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: vi.fn(async () => mockProducts),
    },
    order: {
      create: vi.fn(async (args: any) => ({
        ...mockOrderCreate,
        ...args.data,
      })),
    },
  },
}));

// Importação após mock
import { prepareCheckout } from "@/lib/payments/checkout";

describe("prepareCheckout — integração", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lança erro quando items está vazio", async () => {
    const payload = makeCheckoutPayload({ items: [] });
    await expect(prepareCheckout(payload)).rejects.toThrow(/carrinho não pode estar vazio/);
  });

  it("lança erro quando customer.name está vazio", async () => {
    const payload = makeCheckoutPayload({ customer: makeCustomer({ name: "" }) });
    await expect(prepareCheckout(payload)).rejects.toThrow(/Nome muito curto/);
  });

  it("lança erro para email inválido", async () => {
    const payload = makeCheckoutPayload({ customer: makeCustomer({ email: "invalido" }) });
    await expect(prepareCheckout(payload)).rejects.toThrow(/E-mail inválido/);
  });

  it("lança erro quando frete é inválido (price: -1)", async () => {
    const payload = makeCheckoutPayload({ shipping: makeShipping({ price: -1 }) });
    await expect(prepareCheckout(payload)).rejects.toThrow(/Preço do frete inválido/);
  });

  it("retorna PreparedCheckout com todas as chaves esperadas", async () => {
    const result = await prepareCheckout(makeCheckoutPayload());
    assertHasKeys(result, ["order", "items", "customer", "shipping", "siteUrl"], "PreparedCheckout");
    assertOrderCode(result.order.code);
  });

  it("calcula subtotal e total corretamente", async () => {
    const payload = makeCheckoutPayload({
      items: [makeItem({ quantity: 2 })],
      shipping: makeShipping({ price: 29.9 }),
    });

    const result = await prepareCheckout(payload);

    // No fixture o preço é 199.9. Total: (199.9 * 2) + 29.9 = 399.8 + 29.9 = 429.7
    expect(result.order.subtotal).toBe(399.8);
    expect(result.order.shippingCost).toBe(29.9);
    expect(result.order.total).toBeCloseTo(429.7);
  });
});
