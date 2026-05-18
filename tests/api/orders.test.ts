import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as orderPost } from "@/app/api/orders/route";

// ---------------------------------------------------------------------------
// Mocking Prisma
// ---------------------------------------------------------------------------

const mockProduct1 = {
  id: "prod-001",
  name: "Filamento PLA Premium",
  slug: "filamento-pla-premium",
  priceOriginal: 199.90,
  pricePromo: 179.90,
  pixPrice: null,
  stockQuantity: 10,
  active: true,
};

const mockProduct2 = {
  id: "prod-002",
  name: "Bico Hotend Vulcano",
  slug: "bico-hotend-vulcano",
  priceOriginal: 45.00,
  pricePromo: null,
  pixPrice: 39.90,
  stockQuantity: 5,
  active: true,
};

// Variáveis dinâmicas para controle do comportamento do mock
let productsDb: any[] = [];
let recentOrdersDb: any[] = [];
let shouldFailCreate = false;
let createdOrderData: any = null;
let transactionExecuted = false;

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(async (callback) => {
      transactionExecuted = true;
      const txMock = {
        product: {
          findMany: vi.fn(async () => productsDb),
        },
        order: {
          findMany: vi.fn(async () => recentOrdersDb),
          create: vi.fn(async (args) => {
            if (shouldFailCreate) {
              throw new Error("DB_SAVE_FAILED");
            }
            createdOrderData = args.data;
            return {
              id: "order-cuid-123",
              code: "GT-123456",
              createdAt: new Date(),
              ...args.data,
              items: args.data.items.create.map((item: any, idx: number) => ({
                id: `item-cuid-${idx}`,
                ...item,
              })),
            };
          }),
        },
      };
      return callback(txMock);
    }),
  },
}));

describe("API Pedidos - POST /api/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    productsDb = [mockProduct1, mockProduct2];
    recentOrdersDb = [];
    shouldFailCreate = false;
    createdOrderData = null;
    transactionExecuted = false;
  });

  const makeValidPayload = (overrides = {}) => ({
    customer: {
      name: "Maria de Sousa",
      email: "maria@teste.com",
      phone: "11988887777",
    },
    address: {
      cep: "01310100",
      street: "Avenida Paulista",
      number: "2000",
      complement: "Sala 5B",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
    },
    shipping: {
      optionSelected: "SEDEX",
      price: 25.00,
      deliveryDays: 2,
    },
    items: [
      {
        productId: "prod-001",
        quantity: 2,
      },
      {
        slug: "bico-hotend-vulcano",
        quantity: 1,
      },
    ],
    ...overrides,
  });

  it("deve criar um pedido com sucesso recalculando os preços a partir do banco", async () => {
    const payload = makeValidPayload();

    const req = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const res = await orderPost(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.order).toBeDefined();
    expect(data.order.id).toBe("order-cuid-123");
    
    // Subtotal esperado: (179.90 * 2) + (45.00 * 1) = 359.80 + 45.00 = 404.80
    // Total esperado: 404.80 + 25.00 (frete) = 429.80
    expect(data.order.subtotal).toBe(404.80);
    expect(data.order.shippingCost).toBe(25.00);
    expect(data.order.total).toBe(429.80);
    expect(data.order.status).toBe("PENDING");
    expect(data.order.paymentStatus).toBe("PAYMENT_PENDING");

    expect(data.items).toHaveLength(2);
    expect(data.items[0].unitPrice).toBe(179.90); // pricePromo
    expect(data.items[1].unitPrice).toBe(45.00);  // priceOriginal
    expect(transactionExecuted).toBe(true);
  });

  it("deve ignorar qualquer preço unitário ou total que venha no payload do cliente", async () => {
    const payload = makeValidPayload({
      items: [
        {
          productId: "prod-001",
          quantity: 2,
          unitPrice: 10.00,
          total: 20.00,
        },
      ],
    });

    // Como no payload do Zod não aceitamos bico-hotend-vulcano neste teste, limpamos dos produtos mockados
    productsDb = [mockProduct1];

    const req = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const res = await orderPost(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.order.subtotal).toBe(179.90 * 2);
    expect(data.items[0].unitPrice).toBe(179.90);
  });

  it("deve retornar 409 Conflict se houver estoque insuficiente de algum item", async () => {
    const payload = makeValidPayload({
      items: [
        {
          productId: "prod-001",
          quantity: 11,
        },
      ],
    });

    const req = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const res = await orderPost(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("OUT_OF_STOCK");
    expect(data.error.message).toContain("Estoque insuficiente");
    expect(createdOrderData).toBeNull();
  });

  it("deve retornar 400 Bad Request se algum produto estiver inativo no banco", async () => {
    productsDb = [
      { ...mockProduct1, active: false },
      mockProduct2,
    ];

    const payload = makeValidPayload();

    const req = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const res = await orderPost(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("INACTIVE_PRODUCT");
    expect(data.error.message).toContain("Produto inativo");
  });

  it("deve retornar 404 Not Found se algum produto/item não for localizado no banco de dados", async () => {
    productsDb = [mockProduct2];

    const payload = makeValidPayload();

    const req = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const res = await orderPost(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("PRODUCT_NOT_FOUND");
  });

  it("deve retornar 400 Bad Request para payload estruturalmente inválido (Zod)", async () => {
    const payload = makeValidPayload({
      customer: {
        name: "M",
        email: "email-invalido",
      },
      address: {
        cep: "123",
      },
    });

    const req = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const res = await orderPost(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("BAD_REQUEST");
  });

  it("deve barrar criação com 409 Conflict se houver double-click / pedido idêntico em menos de 1 minuto", async () => {
    recentOrdersDb = [
      {
        id: "order-recent-001",
        customerEmail: "maria@teste.com",
        status: "PENDING",
        createdAt: new Date(),
        items: [
          {
            productId: "prod-001",
            quantity: 2,
          },
          {
            productId: "prod-002",
            quantity: 1,
          },
        ],
      },
    ];

    const payload = makeValidPayload();

    const req = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const res = await orderPost(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("DUPLICATE_ORDER");
    expect(data.error.message).toContain("pedido idêntico em andamento");
  });

  it("deve desfazer toda a operação de transação sem salvar nada se a gravação final falhar", async () => {
    shouldFailCreate = true;
    productsDb = [mockProduct1];

    const payload = makeValidPayload({
      items: [{ productId: "prod-001", quantity: 1 }],
    });

    const req = new NextRequest("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const res = await orderPost(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("SERVER_ERROR");
  });
});
