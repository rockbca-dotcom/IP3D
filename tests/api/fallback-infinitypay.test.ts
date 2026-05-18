import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getPaymentProvider, getPaymentProviderName } from "@/lib/payments/provider";
import { getInfinityPayProvider } from "@/lib/payments/providers/infinitypay-provider";
import { getMercadoPagoProvider } from "@/lib/payments/providers/mercadopago-provider";
import { POST as infinityCheckoutPost } from "@/app/api/payments/infinitypay/route";
import { POST as infinityWebhookPost } from "@/app/api/payments/infinitypay/webhook/route";
import { POST as checkoutPost } from "@/app/api/payments/checkout/route";
import { CheckoutError } from "@/lib/payments/checkout";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Mocks dinâmicos de Variáveis de Ambiente usando hoisting do Vitest
// ---------------------------------------------------------------------------

const { mockEnv } = vi.hoisted(() => {
  return {
    mockEnv: {
      PAYMENT_PROVIDER: "infinitypay" as any,
      INFINITYPAY_HANDLE: "handle-123" as string | undefined,
      INFINITYPAY_API_KEY: "key-123" as string | undefined,
      MERCADO_PAGO_ACCESS_TOKEN: "mp-token-123" as string | undefined,
    },
  };
});

vi.mock("@/lib/env", () => ({
  env: {
    get PAYMENT_PROVIDER() {
      return mockEnv.PAYMENT_PROVIDER;
    },
    get INFINITYPAY_HANDLE() {
      return mockEnv.INFINITYPAY_HANDLE;
    },
    get INFINITYPAY_API_KEY() {
      return mockEnv.INFINITYPAY_API_KEY;
    },
    get MERCADO_PAGO_ACCESS_TOKEN() {
      return mockEnv.MERCADO_PAGO_ACCESS_TOKEN;
    },
    NODE_ENV: "test",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  },
}));

// ---------------------------------------------------------------------------
// Mocks de Banco de Dados (Prisma)
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
    },
  },
}));

describe("InfinityPay Fallback Formal - TASK-27", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.PAYMENT_PROVIDER = "infinitypay";
    mockEnv.INFINITYPAY_HANDLE = "handle-123";
    mockEnv.INFINITYPAY_API_KEY = "key-123";
    mockEnv.MERCADO_PAGO_ACCESS_TOKEN = "mp-token-123";

    // Setup mock padrão do pedido para a rota genérica de checkout
    vi.spyOn(prisma.order, "findUnique").mockImplementation(async () => {
      return {
        id: "order-123",
        code: "GT-123456",
        status: "PENDING",
        paymentStatus: "PAYMENT_PENDING",
        subtotal: 100,
        shippingCost: 20,
        total: 120,
        notes: "Frete: SEDEX (123)",
        customerName: "Carlos Pereira",
        customerEmail: "carlos@teste.com",
        customerPhone: "11999998888",
        shippingZip: "01310100",
        shippingStreet: "Avenida Paulista",
        shippingNumber: "1000",
        shippingCity: "São Paulo",
        shippingState: "SP",
        items: [
          {
            id: "item-1",
            productId: "prod-1",
            name: "Produto 1",
            sku: "prod-1",
            quantity: 2,
            unitPrice: 50,
            total: 100,
          },
        ],
      } as any;
    });
  });

  describe("Provider Factory & Provedor (InfinityPay)", () => {
    it("deve selecionar InfinityPay quando configurado e com chaves de ambiente válidas", () => {
      const name = getPaymentProviderName();
      expect(name).toBe("infinitypay");

      const provider = getPaymentProvider();
      expect(provider).toBe(getInfinityPayProvider());
    });

    it("deve lançar erro PROVIDER_NOT_CONFIGURED (500) caso as chaves estejam ausentes e InfinityPay esteja ativo", () => {
      mockEnv.INFINITYPAY_HANDLE = undefined; // simula ausência de variáveis

      expect(() => getPaymentProvider()).toThrowError(
        new CheckoutError(
          "O provedor InfinityPay está selecionado mas não foi configurado devidamente no ambiente do servidor.",
          500,
          "PROVIDER_NOT_CONFIGURED"
        )
      );
    });

    it("deve falhar controladamente com 501 / NOT_IMPLEMENTED ao chamar createCheckout no provedor InfinityPay", async () => {
      const provider = getInfinityPayProvider();

      await expect(provider.createCheckout({} as any)).rejects.toThrowError(
        new CheckoutError(
          "A integração com InfinityPay não está ativa ou está descontinuada. Use o Mercado Pago como provedor principal.",
          501,
          "NOT_IMPLEMENTED"
        )
      );
    });
  });

  describe("Endpoints de API (Rotas Exclusivas)", () => {
    it("deve retornar erro HTTP 501 Not Implemented no endpoint de checkout /api/payments/infinitypay", async () => {
      const res = await infinityCheckoutPost();
      const body = await res.json();

      expect(res.status).toBe(501);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("NOT_IMPLEMENTED");
      expect(body.error.message).toContain("não está ativa ou está descontinuada");
    });

    it("deve retornar erro HTTP 501 Not Implemented no endpoint de webhook /api/payments/infinitypay/webhook", async () => {
      const res = await infinityWebhookPost();
      const body = await res.json();

      expect(res.status).toBe(501);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("NOT_IMPLEMENTED");
      expect(body.error.message).toContain("não está ativo ou está descontinuada");
    });
  });

  describe("Integração com Rota de Checkout Genérica (/api/payments/checkout)", () => {
    it("deve falhar de forma amigável com status 501 quando InfinityPay for o provedor ativo", async () => {
      const req = new NextRequest("http://localhost/api/payments/checkout", {
        method: "POST",
        body: JSON.stringify({ orderId: "order-123" }),
      });

      const res = await checkoutPost(req);
      const body = await res.json();

      expect(res.status).toBe(501);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("NOT_IMPLEMENTED");
      expect(body.error.message).toContain("não está ativa ou está descontinuada");
    });

    it("deve continuar selecionando e executando o Mercado Pago perfeitamente quando for o provedor ativo", async () => {
      mockEnv.PAYMENT_PROVIDER = "mercadopago";

      // Mocka o checkout do Mercado Pago para retornar uma URL fictícia
      const mpProvider = getMercadoPagoProvider();
      vi.spyOn(mpProvider, "createCheckout").mockResolvedValueOnce({
        redirectUrl: "https://sandbox.mercadopago.com.br/checkout/123",
        providerOrderId: "pref-123",
        initPoint: "https://www.mercadopago.com.br/checkout/123",
        sandboxInitPoint: "https://sandbox.mercadopago.com.br/checkout/123",
      });

      const req = new NextRequest("http://localhost/api/payments/checkout", {
        method: "POST",
        body: JSON.stringify({ orderId: "order-123" }),
      });

      const res = await checkoutPost(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.provider).toBe("mercadopago");
      expect(body.redirectUrl).toBe("https://sandbox.mercadopago.com.br/checkout/123");
    });
  });
});
