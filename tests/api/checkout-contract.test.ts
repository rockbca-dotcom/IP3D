/**
 * tests/api/checkout-contract.test.ts
 *
 * Testes de contrato da API POST /api/payments/checkout usando Vitest.
 */

import { describe, it, expect, vi } from "vitest";
import { makeCheckoutPayload, makePrismaProduct, TEST_ORDER_CODE } from "../helpers/fixtures";
import { assertApiError, assertHasKeys } from "../helpers/assert";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: vi.fn(async () => [makePrismaProduct()]),
    },
    order: {
      create: vi.fn(async (args: any) => ({
        id: "order_api_001",
        code: TEST_ORDER_CODE,
        ...args.data,
      })),
    },
  },
}));

vi.mock("@/lib/payments/provider", () => ({
  normalizeProviderName: vi.fn((v: string | undefined) => 
    (v || "").toLowerCase() === "infinitypay" ? "infinitypay" : "mercadopago"
  ),
  getPaymentProviderName: vi.fn(() => "mercadopago"),
  getPaymentProvider: vi.fn(() => ({
    createCheckout: vi.fn(async () => ({
      redirectUrl: "https://mp.test/redirect/123",
      providerOrderId: "pref_test_001",
    })),
  })),
}));

// Importação do handler
import { POST } from "@/app/api/payments/checkout/route";

function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3003/api/payments/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/payments/checkout — contrato de API", () => {
  it("retorna 400 quando items está vazio", async () => {
    const res = await POST(makeRequest(makeCheckoutPayload({ items: [] })) as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    assertApiError(body);
  });

  it("retorna 200 com shape completa de sucesso", async () => {
    const res = await POST(makeRequest(makeCheckoutPayload()) as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    assertHasKeys(body, ["provider", "redirectUrl", "orderCode", "subtotal", "shippingCost", "total"]);
    expect(body.redirectUrl).toContain("https://mp.test/redirect/123");
  });

  it("total é consistente com subtotal + frete", async () => {
    const res = await POST(makeRequest(makeCheckoutPayload()) as any);
    const body = await res.json();
    expect(body.total).toBe(body.subtotal + body.shippingCost);
  });
});
