import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { NextRequest } from "next/server";
import { createHmac } from "crypto";
import { POST as mpWebhookPost } from "@/app/api/payments/mercadopago/webhook/route";

// ---------------------------------------------------------------------------
// Variáveis de Controle e mocks dinâmicos do Banco de Dados
// ---------------------------------------------------------------------------

let mockOrders: any[] = [];
let mockProducts: any[] = [];
let mockInventoryLogs: any[] = [];
let mockUpdatedOrders: any[] = [];
let mockUpdatedProducts: any[] = [];

const prismaMock = {
  order: {
    findUnique: vi.fn(async (args) => {
      const o = mockOrders.find((x) => x.id === args.where.id);
      if (!o) return null;
      const clone = JSON.parse(JSON.stringify(o));
      for (const item of clone.items || []) {
        const prod = mockProducts.find((p) => p.id === item.productId);
        if (prod) {
          item.product = JSON.parse(JSON.stringify(prod));
        }
      }
      return clone;
    }),
    update: vi.fn(async (args) => {
      const idx = mockOrders.findIndex((x) => x.id === args.where.id);
      if (idx !== -1) {
        mockOrders[idx] = { ...mockOrders[idx], ...args.data };
        mockUpdatedOrders.push(mockOrders[idx]);
        return JSON.parse(JSON.stringify(mockOrders[idx]));
      }
      throw new Error("Order not found");
    }),
    findFirst: vi.fn(async (args) => {
      const search = args.where?.OR || [];
      let found: any = null;
      for (const cond of search) {
        if (cond.mpPreferenceId) {
          const o = mockOrders.find((x) => x.mpPreferenceId === cond.mpPreferenceId);
          if (o) { found = o; break; }
        }
        if (cond.code) {
          const o = mockOrders.find((x) => x.code === cond.code);
          if (o) { found = o; break; }
        }
        if (cond.id) {
          const o = mockOrders.find((x) => x.id === cond.id);
          if (o) { found = o; break; }
        }
        if (cond.mpPaymentId) {
          const o = mockOrders.find((x) => x.mpPaymentId === cond.mpPaymentId);
          if (o) { found = o; break; }
        }
      }
      if (!found) return null;
      const clone = JSON.parse(JSON.stringify(found));
      for (const item of clone.items || []) {
        const prod = mockProducts.find((p) => p.id === item.productId);
        if (prod) {
          item.product = JSON.parse(JSON.stringify(prod));
        }
      }
      return clone;
    }),
  },
  product: {
    update: vi.fn(async (args) => {
      const idx = mockProducts.findIndex((x) => x.id === args.where.id);
      if (idx !== -1) {
        mockProducts[idx] = { ...mockProducts[idx], ...args.data };
        mockUpdatedProducts.push(mockProducts[idx]);
        return JSON.parse(JSON.stringify(mockProducts[idx]));
      }
      throw new Error("Product not found");
    }),
  },
  inventoryLog: {
    create: vi.fn(async (args) => {
      const newLog = { id: `log-${Date.now()}-${Math.random()}`, ...args.data };
      mockInventoryLogs.push(newLog);
      return JSON.parse(JSON.stringify(newLog));
    }),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: vi.fn(async (args) => prismaMock.order.findUnique(args)),
      update: vi.fn(async (args) => prismaMock.order.update(args)),
      findFirst: vi.fn(async (args) => prismaMock.order.findFirst(args)),
    },
    product: {
      update: vi.fn(async (args) => prismaMock.product.update(args)),
    },
    inventoryLog: {
      create: vi.fn(async (args) => prismaMock.inventoryLog.create(args)),
    },
    $transaction: vi.fn(async (callback) => {
      return await callback(prismaMock);
    }),
  },
}));

// ---------------------------------------------------------------------------
// Mocks dinâmicos de Variáveis de Ambiente (env)
// ---------------------------------------------------------------------------

let mockAccessToken: string | undefined = "mp-test-token-123";
let mockWebhookSecret: string | undefined = "mp-test-secret-123";
let mockValidateSignature: boolean | string = "true";

vi.mock("@/lib/env", () => ({
  env: {
    get MERCADO_PAGO_ACCESS_TOKEN() {
      return mockAccessToken;
    },
    get MERCADO_PAGO_WEBHOOK_SECRET() {
      return mockWebhookSecret;
    },
    get MERCADO_PAGO_VALIDATE_WEBHOOK_SIGNATURE() {
      return mockValidateSignature;
    },
    NODE_ENV: "test",
  },
}));

// ---------------------------------------------------------------------------
// Mock do Fetch Global para simular API do Mercado Pago
// ---------------------------------------------------------------------------

let mockPaymentResponse: any = {
  status: "approved",
  preference_id: "pref-123",
  external_reference: "GT-001234",
};
let mockPaymentStatus = 200;
let mockPaymentErrorText = "";

const originalFetch = global.fetch;

beforeAll(() => {
  global.fetch = vi.fn(async (url: any) => {
    if (typeof url === "string" && url.includes("api.mercadopago.com/v1/payments/")) {
      return {
        ok: mockPaymentStatus >= 200 && mockPaymentStatus < 300,
        status: mockPaymentStatus,
        json: async () => mockPaymentResponse,
        text: async () => mockPaymentErrorText || JSON.stringify(mockPaymentResponse),
      } as any;
    }
    return originalFetch(url);
  });
});

afterAll(() => {
  global.fetch = originalFetch;
});

// ---------------------------------------------------------------------------
// Helpers de Fixtures
// ---------------------------------------------------------------------------

const productUuid = "77c5ef44-77bf-4f24-9b24-4fef8e7cc226";

const makeValidProduct = (overrides = {}) => ({
  id: productUuid,
  name: "Filamento PLA Pro",
  slug: "filamento-pla-pro",
  stockQuantity: 10,
  active: true,
  ...overrides,
});

const makeValidOrder = (overrides = {}) => ({
  id: "order-cuid-001",
  code: "GT-001234",
  customerName: "Carlos Pereira",
  customerEmail: "carlos@teste.com",
  customerPhone: "11999998888",
  notes: "Frete: SEDEX",
  status: "PENDING",
  paymentStatus: "PAYMENT_PENDING",
  subtotal: 90.0,
  shippingCost: 15.0,
  total: 105.0,
  mpPreferenceId: "pref-123",
  mpPaymentId: null,
  items: [
    {
      id: "item-001",
      productId: productUuid,
      name: "Filamento PLA Pro",
      sku: "filamento-pla-pro",
      quantity: 2,
      unitPrice: 45.0,
      total: 90.0,
      product: makeValidProduct(),
    },
  ],
  ...overrides,
});

// Helper para gerar assinaturas reais e válidas conforme algoritmo do MP
function createSignatureHeaders(dataId: string, requestId: string, ts: string, secret: string) {
  const manifestParts = [];
  if (dataId) manifestParts.push(`id:${dataId}`);
  if (requestId) manifestParts.push(`request-id:${requestId}`);
  manifestParts.push(`ts:${ts}`);
  const manifest = manifestParts.join(";") + ";";

  const v1 = createHmac("sha256", secret).update(manifest).digest("hex");
  return {
    "x-signature": `ts=${ts},v1=${v1}`,
    "x-request-id": requestId,
  };
}

describe("Mercado Pago Webhook API Endpoint - TASK-26", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOrders = [makeValidOrder()];
    mockProducts = [makeValidProduct()];
    mockInventoryLogs = [];
    mockUpdatedOrders = [];
    mockUpdatedProducts = [];

    mockAccessToken = "mp-test-token-123";
    mockWebhookSecret = "mp-test-secret-123";
    mockValidateSignature = "true";

    mockPaymentResponse = {
      status: "approved",
      preference_id: "pref-123",
      external_reference: "GT-001234",
    };
    mockPaymentStatus = 200;
    mockPaymentErrorText = "";
  });

  describe("Validação de Assinatura (Segurança)", () => {
    it("deve retornar 401 Unauthorized se a validação estiver ativa e a assinatura for inválida", async () => {
      const req = new NextRequest("http://localhost/api/payments/mercadopago/webhook?data.id=99999", {
        method: "POST",
        headers: {
          "x-signature": "ts=1234567,v1=invalid_hmac",
          "x-request-id": "req-999",
        },
        body: JSON.stringify({ type: "payment", data: { id: "99999" } }),
      });

      const res = await mpWebhookPost(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe("Invalid signature");
    });

    it("deve pular a validação com sucesso se a flag de validação estiver desativada", async () => {
      mockValidateSignature = "false"; // desativa

      const req = new NextRequest("http://localhost/api/payments/mercadopago/webhook?data.id=99999", {
        method: "POST",
        headers: {
          "x-signature": "invalid_or_missing",
        },
        body: JSON.stringify({ type: "payment", data: { id: "99999" } }),
      });

      const res = await mpWebhookPost(req);
      expect(res.status).not.toBe(401);
    });
  });

  describe("Cenários de Pagamento Aprovado e Estoque", () => {
    it("deve processar pagamento aprovado, baixar estoque do produto e registrar InventoryLog na transação", async () => {
      const dataId = "payment-12345";
      const ts = Math.floor(Date.now() / 1000).toString();
      const sigHeaders = createSignatureHeaders(dataId, "req-001", ts, "mp-test-secret-123");

      const req = new NextRequest(
        `http://localhost/api/payments/mercadopago/webhook?data.id=${dataId}`,
        {
          method: "POST",
          headers: sigHeaders as any,
          body: JSON.stringify({ type: "payment", data: { id: dataId } }),
        }
      );

      const res = await mpWebhookPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.received).toBe(true);

      // Verifica que o estoque do produto baixou de 10 para 8 (pedido comprou 2 unidades)
      expect(mockProducts[0].stockQuantity).toBe(8);

      // Verifica que o log de inventário foi gerado com as informações corretas
      expect(mockInventoryLogs).toHaveLength(1);
      expect(mockInventoryLogs[0].productId).toBe(productUuid);
      expect(mockInventoryLogs[0].change).toBe(-2);
      expect(mockInventoryLogs[0].type).toBe("ORDER");
      expect(mockInventoryLogs[0].referenceId).toBe("order-cuid-001");

      // Verifica que o pedido mudou para PROCESSING e APPROVED
      expect(mockOrders[0].status).toBe("PROCESSING");
      expect(mockOrders[0].paymentStatus).toBe("APPROVED");
      expect(mockOrders[0].mpPaymentId).toBe(dataId);
    });

    it("deve garantir idempotência absoluta para eventos duplicados sem re-deduzir estoque ou duplicar logs", async () => {
      const dataId = "payment-12345";
      const ts = Math.floor(Date.now() / 1000).toString();
      const sigHeaders = createSignatureHeaders(dataId, "req-001", ts, "mp-test-secret-123");

      // Primeiro envio do webhook (aprova)
      const req1 = new NextRequest(
        `http://localhost/api/payments/mercadopago/webhook?data.id=${dataId}`,
        {
          method: "POST",
          headers: sigHeaders as any,
          body: JSON.stringify({ type: "payment", data: { id: dataId } }),
        }
      );
      await mpWebhookPost(req1);

      expect(mockProducts[0].stockQuantity).toBe(8);
      expect(mockInventoryLogs).toHaveLength(1);

      // Segundo envio idêntico do webhook (duplicado)
      const req2 = new NextRequest(
        `http://localhost/api/payments/mercadopago/webhook?data.id=${dataId}`,
        {
          method: "POST",
          headers: sigHeaders as any,
          body: JSON.stringify({ type: "payment", data: { id: dataId } }),
        }
      );
      const res2 = await mpWebhookPost(req2);
      const data2 = await res2.json();

      expect(res2.status).toBe(200);
      expect(data2.received).toBe(true);

      // O estoque continua em 8 (não baixou de novo) e logs continuam como 1 (não duplicou)
      expect(mockProducts[0].stockQuantity).toBe(8);
      expect(mockInventoryLogs).toHaveLength(1);
    });

    it("deve abortar baixa de estoque inteiramente e marcar notes com erro/atenção se o estoque for insuficiente", async () => {
      // Definir estoque do produto abaixo do solicitado (pedido quer 2 unidades, mas só tem 1 disponível)
      mockProducts[0].stockQuantity = 1;

      const dataId = "payment-12345";
      const ts = Math.floor(Date.now() / 1000).toString();
      const sigHeaders = createSignatureHeaders(dataId, "req-001", ts, "mp-test-secret-123");

      const req = new NextRequest(
        `http://localhost/api/payments/mercadopago/webhook?data.id=${dataId}`,
        {
          method: "POST",
          headers: sigHeaders as any,
          body: JSON.stringify({ type: "payment", data: { id: dataId } }),
        }
      );

      const res = await mpWebhookPost(req);
      await res.json();

      expect(res.status).toBe(200);

      // O estoque do produto deve continuar intacto (não sofreu baixa parcial nem ficou negativo!)
      expect(mockProducts[0].stockQuantity).toBe(1);

      // Nenhum log de inventário deve ser criado
      expect(mockInventoryLogs).toHaveLength(0);

      // O pedido continua como PENDING e PAYMENT_PENDING para supervisão manual
      expect(mockOrders[0].status).toBe("PENDING");
      expect(mockOrders[0].paymentStatus).toBe("PAYMENT_PENDING");

      // Notes do pedido deve conter a mensagem explicativa de erro/atenção de estoque
      expect(mockOrders[0].notes).toContain("[ATENÇÃO: ESTOQUE INSUFICIENTE]");
    });
  });

  describe("Cenários de Pagamentos Não Aprovados", () => {
    it("deve apenas atualizar status informativo do pedido e não deduzir estoque em caso de pagamento pendente", async () => {
      mockPaymentResponse.status = "pending"; // pagamento pendente

      const dataId = "payment-12345";
      const ts = Math.floor(Date.now() / 1000).toString();
      const sigHeaders = createSignatureHeaders(dataId, "req-001", ts, "mp-test-secret-123");

      const req = new NextRequest(
        `http://localhost/api/payments/mercadopago/webhook?data.id=${dataId}`,
        {
          method: "POST",
          headers: sigHeaders as any,
          body: JSON.stringify({ type: "payment", data: { id: dataId } }),
        }
      );

      const res = await mpWebhookPost(req);
      expect(res.status).toBe(200);

      // Estoque e logs continuam intocados
      expect(mockProducts[0].stockQuantity).toBe(10);
      expect(mockInventoryLogs).toHaveLength(0);

      // Status mantido como pendente
      expect(mockOrders[0].status).toBe("PENDING");
      expect(mockOrders[0].paymentStatus).toBe("PAYMENT_PENDING");
    });

    it("deve marcar pedido como CANCELLED/REJECTED e não deduzir estoque em caso de pagamento rejeitado/cancelado", async () => {
      mockPaymentResponse.status = "rejected"; // pagamento rejeitado

      const dataId = "payment-12345";
      const ts = Math.floor(Date.now() / 1000).toString();
      const sigHeaders = createSignatureHeaders(dataId, "req-001", ts, "mp-test-secret-123");

      const req = new NextRequest(
        `http://localhost/api/payments/mercadopago/webhook?data.id=${dataId}`,
        {
          method: "POST",
          headers: sigHeaders as any,
          body: JSON.stringify({ type: "payment", data: { id: dataId } }),
        }
      );

      const res = await mpWebhookPost(req);
      expect(res.status).toBe(200);

      // Estoque e logs continuam intocados
      expect(mockProducts[0].stockQuantity).toBe(10);
      expect(mockInventoryLogs).toHaveLength(0);

      // Status deve mudar para CANCELLED e REJECTED
      expect(mockOrders[0].status).toBe("CANCELLED");
      expect(mockOrders[0].paymentStatus).toBe("REJECTED");
    });
  });

  describe("Segurança contra vazamento de tokens e tratamento de falhas", () => {
    it("deve retornar erro 500 amigável e seguro caso o provedor externo do Mercado Pago responda com falha", async () => {
      mockPaymentStatus = 502; // timeout/bad gateway do provedor
      mockPaymentErrorText = "Internal Mercado Pago Timeout Error";

      const dataId = "payment-12345";
      const ts = Math.floor(Date.now() / 1000).toString();
      const sigHeaders = createSignatureHeaders(dataId, "req-001", ts, "mp-test-secret-123");

      const req = new NextRequest(
        `http://localhost/api/payments/mercadopago/webhook?data.id=${dataId}`,
        {
          method: "POST",
          headers: sigHeaders as any,
          body: JSON.stringify({ type: "payment", data: { id: dataId } }),
        }
      );

      const res = await mpWebhookPost(req);
      const data = await res.json();

      expect(res.status).toBe(500);
      // Deve retornar uma mensagem segura e NÃO vazar a resposta bruta do provedor que contém segredos
      expect(data.error).toBe("Failed to fetch payment details.");
      expect(JSON.stringify(data)).not.toContain("Internal Mercado Pago Timeout Error");
    });
  });
});
