import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as mpPost } from "@/app/api/payments/mercadopago/route";
import { POST as checkoutPost } from "@/app/api/payments/checkout/route";

// ---------------------------------------------------------------------------
// Variáveis Dinâmicas para Controle de Mocks
// ---------------------------------------------------------------------------

let orderDb: any = null;
let updatedOrderData: any = null;
let mockAccessToken: string | undefined = "mp-test-token-123";
let mockNodeEnv: "development" | "production" | "test" = "test";
let mockPreferenceCreateResponse: any = {
  id: "pref-123456",
  init_point: "https://www.mercadopago.com.br/checkout/start?pref_id=pref-123456",
  sandbox_init_point: "https://sandbox.mercadopago.com.br/checkout/start?pref_id=pref-123456",
};
let mockPreferenceCreateError: Error | null = null;

// ---------------------------------------------------------------------------
// Mocking Prisma
// ---------------------------------------------------------------------------

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: vi.fn(async () => orderDb),
      update: vi.fn(async (args: any) => {
        updatedOrderData = args.data;
        return {
          ...orderDb,
          ...args.data,
        };
      }),
      create: vi.fn(async (args: any) => ({
        id: "order-legacy-123",
        code: "GT-LEGACY",
        subtotal: 90.0,
        shippingCost: 15.0,
        total: 105.0,
        ...args.data,
      })),
    },
    product: {
      findMany: vi.fn(async () => [
        {
          id: "77c5ef44-77bf-4f24-9b24-4fef8e7cc226",
          name: "Filamento PLA",
          slug: "filamento-pla",
          priceOriginal: 100.0,
          pricePromo: 90.0,
          pixPrice: 85.0,
          stockQuantity: 10,
          active: true,
        },
      ]),
    },
  },
}));

// ---------------------------------------------------------------------------
// Mocking Env
// ---------------------------------------------------------------------------

vi.mock("@/lib/env", () => ({
  env: {
    get MERCADO_PAGO_ACCESS_TOKEN() { return mockAccessToken; },
    get PAYMENT_PROVIDER() { return "mercadopago"; },
    get NEXT_PUBLIC_SITE_URL() { return "https://ip3d.com.br"; },
    get NODE_ENV() { return mockNodeEnv; },
  },
}));

// ---------------------------------------------------------------------------
// Mocking Mercado Pago SDK
// ---------------------------------------------------------------------------

vi.mock("@/lib/mercadopago", () => ({
  get preferenceClient() {
    if (!mockAccessToken) return null;
    return {
      create: vi.fn(async () => {
        if (mockPreferenceCreateError) {
          throw mockPreferenceCreateError;
        }
        return mockPreferenceCreateResponse;
      }),
    };
  },
}));

// ---------------------------------------------------------------------------
// Auxiliares de Fixtures
// ---------------------------------------------------------------------------

const makeValidDbOrder = (overrides = {}) => ({
  id: "order-cuid-001",
  code: "GT-001234",
  customerName: "Carlos Pereira",
  customerEmail: "carlos@teste.com",
  customerPhone: "11999998888",
  shippingStreet: "Rua das Oliveiras",
  shippingNumber: "150",
  shippingCity: "São Paulo",
  shippingState: "SP",
  shippingZip: "01310100",
  notes: "Frete: SEDEX (SEDEX) | Bairro: Bela Vista",
  status: "PENDING",
  paymentStatus: "PAYMENT_PENDING",
  subtotal: 180.00,
  shippingCost: 20.00,
  total: 200.00,
  items: [
    {
      id: "item-001",
      orderId: "order-cuid-001",
      productId: "77c5ef44-77bf-4f24-9b24-4fef8e7cc226",
      name: "Filamento PLA",
      sku: "filamento-pla",
      quantity: 2,
      unitPrice: 90.00,
      total: 180.00,
    },
  ],
  ...overrides,
});

describe("API Pagamentos - Mercado Pago Sandbox & Preferência", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderDb = null;
    updatedOrderData = null;
    mockAccessToken = "mp-test-token-123";
    mockNodeEnv = "test";
    mockPreferenceCreateError = null;
    mockPreferenceCreateResponse = {
      id: "pref-123456",
      init_point: "https://www.mercadopago.com.br/checkout/start?pref_id=pref-123456",
      sandbox_init_point: "https://sandbox.mercadopago.com.br/checkout/start?pref_id=pref-123456",
    };
  });

  describe("POST /api/payments/mercadopago (Novo fluxo com orderId)", () => {
    it("deve criar uma preferência para um pedido válido no banco e persistir os IDs", async () => {
      orderDb = makeValidDbOrder();

      const req = new NextRequest("http://localhost/api/payments/mercadopago", {
        method: "POST",
        body: JSON.stringify({ orderId: "order-cuid-001" }),
      });

      const res = await mpPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Como estamos em ambiente test/dev, checkoutUrl deve ser o sandbox_init_point
      expect(data.checkoutUrl).toBe("https://sandbox.mercadopago.com.br/checkout/start?pref_id=pref-123456");
      expect(data.preferenceId).toBe("pref-123456");
      expect(data.orderId).toBe("order-cuid-001");
      expect(data.subtotal).toBe(180.00);
      expect(data.total).toBe(200.00);

      // Atesta persistência no banco de dados
      expect(updatedOrderData).toBeDefined();
      expect(updatedOrderData.mpPreferenceId).toBe("pref-123456");
      expect(updatedOrderData.paymentProvider).toBe("mercadopago");
      expect(updatedOrderData.providerOrderId).toBe("pref-123456");
    });

    it("deve dar preferência para init_point quando o ambiente for produção", async () => {
      mockNodeEnv = "production";
      orderDb = makeValidDbOrder();

      const req = new NextRequest("http://localhost/api/payments/mercadopago", {
        method: "POST",
        body: JSON.stringify({ orderId: "order-cuid-001" }),
      });

      const res = await mpPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      // Em produção, deve usar init_point
      expect(data.checkoutUrl).toBe("https://www.mercadopago.com.br/checkout/start?pref_id=pref-123456");
    });

    it("deve retornar 404 Not Found se o pedido não for localizado no banco de dados", async () => {
      orderDb = null; // Pedido não existe

      const req = new NextRequest("http://localhost/api/payments/mercadopago", {
        method: "POST",
        body: JSON.stringify({ orderId: "order-inexistente" }),
      });

      const res = await mpPost(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("deve retornar 409 Conflict se o pedido já estiver pago ou cancelado", async () => {
      orderDb = makeValidDbOrder({
        status: "DELIVERED",
        paymentStatus: "APPROVED",
      });

      const req = new NextRequest("http://localhost/api/payments/mercadopago", {
        method: "POST",
        body: JSON.stringify({ orderId: "order-cuid-001" }),
      });

      const res = await mpPost(req);
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("CONFLICT");
      expect(data.error.message).toContain("pago ou cancelado");
    });

    it("deve retornar 409 Conflict se o pedido não contiver nenhum item associado", async () => {
      orderDb = makeValidDbOrder({
        items: [],
      });

      const req = new NextRequest("http://localhost/api/payments/mercadopago", {
        method: "POST",
        body: JSON.stringify({ orderId: "order-cuid-001" }),
      });

      const res = await mpPost(req);
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("CONFLICT");
      expect(data.error.message).toContain("não possui itens");
    });

    it("deve retornar 500 se o token de acesso do Mercado Pago estiver ausente", async () => {
      mockAccessToken = undefined; // Token ausente
      orderDb = makeValidDbOrder();

      const req = new NextRequest("http://localhost/api/payments/mercadopago", {
        method: "POST",
        body: JSON.stringify({ orderId: "order-cuid-001" }),
      });

      const res = await mpPost(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("PROVIDER_NOT_CONFIGURED");
      expect(data.error.message).toContain("não configurado");
    });

    it("deve retornar 500 se a chamada ao SDK do Mercado Pago falhar", async () => {
      mockPreferenceCreateError = new Error("SDK timeout error");
      orderDb = makeValidDbOrder();

      const req = new NextRequest("http://localhost/api/payments/mercadopago", {
        method: "POST",
        body: JSON.stringify({ orderId: "order-cuid-001" }),
      });

      const res = await mpPost(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("SERVER_ERROR");
      expect(data.error.message).not.toContain("mp-test-token"); // Não vaza segredos
    });
  });

  describe("POST /api/payments/checkout (Compatibilidade com Rota Legada)", () => {
    it("deve criar preferência a partir do payload legando mantendo a rota verde", async () => {
      const payload = {
        items: [{ productId: "77c5ef44-77bf-4f24-9b24-4fef8e7cc226", quantity: 1 }],
        customer: { name: "Maria Lima", email: "maria@teste.com", phone: "11988887777" },
        shipping: {
          cep: "01310100",
          price: 15.0,
          serviceCode: "PAC",
          serviceName: "PAC",
          address: { street: "Paulista", number: "1000", city: "São Paulo", state: "SP" },
        },
      };

      const req = new NextRequest("http://localhost/api/payments/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const res = await checkoutPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.provider).toBe("mercadopago");
      expect(data.redirectUrl).toBe("https://sandbox.mercadopago.com.br/checkout/start?pref_id=pref-123456");
      expect(data.orderCode).toBeDefined();
      expect(data.orderCode.startsWith("GT-")).toBe(true);
      expect(data.subtotal).toBe(90.0);
      expect(data.total).toBe(105.0);
    });

    it("deve aceitar orderId na rota genérica de checkout e funcionar perfeitamente", async () => {
      orderDb = makeValidDbOrder();

      const req = new NextRequest("http://localhost/api/payments/checkout", {
        method: "POST",
        body: JSON.stringify({ orderId: "order-cuid-001" }),
      });

      const res = await checkoutPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.provider).toBe("mercadopago");
      expect(data.redirectUrl).toBe("https://sandbox.mercadopago.com.br/checkout/start?pref_id=pref-123456");
      expect(data.orderCode).toBe("GT-001234");
      expect(data.subtotal).toBe(180.00);
      expect(data.total).toBe(200.00);
      expect(data.providerOrderId).toBe("pref-123456");
    });
  });
});
