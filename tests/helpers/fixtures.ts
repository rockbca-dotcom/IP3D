/**
 * tests/helpers/fixtures.ts
 *
 * Fixtures reutilizáveis para testes do IP3D.
 *
 * Use factory functions (não objetos estáticos) para garantir
 * que cada teste receba uma instância independente, evitando
 * mutação acidental entre casos de teste.
 */

import type {
  CheckoutCustomer,
  CheckoutShipping,
  CheckoutPayload,
  CheckoutItemInput,
  PreparedCheckout,
  PreparedOrderItem,
} from "@/lib/payments/types";

// ---------------------------------------------------------------------------
// Primitivos reutilizáveis
// ---------------------------------------------------------------------------

export const TEST_PRODUCT_ID = "550e8400-e29b-41d4-a716-446655440000";
export const TEST_ORDER_ID = "a80e423f-b084-4f05-8729-e09884ada423";
export const TEST_ORDER_CODE = "GT-123456";

// ---------------------------------------------------------------------------
// Customer fixtures
// ---------------------------------------------------------------------------

export function makeCustomer(overrides?: Partial<CheckoutCustomer>): CheckoutCustomer {
  return {
    name: "João da Silva",
    email: "joao@teste.com.br",
    phone: "11999999999",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Shipping fixtures
// ---------------------------------------------------------------------------

export function makeShipping(overrides?: Partial<CheckoutShipping>): CheckoutShipping {
  return {
    cep: "01310100",
    serviceCode: "04014",
    serviceName: "SEDEX",
    deliveryDays: 3,
    price: 29.9,
    address: {
      street: "Avenida Paulista",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      number: "1000",
      complement: "",
    },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Item fixtures
// ---------------------------------------------------------------------------

export function makeItem(overrides?: Partial<CheckoutItemInput>): CheckoutItemInput {
  return {
    productId: TEST_PRODUCT_ID,
    quantity: 1,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Payload completo
// ---------------------------------------------------------------------------

export function makeCheckoutPayload(overrides?: Partial<CheckoutPayload>): CheckoutPayload {
  return {
    items: [makeItem()],
    customer: makeCustomer(),
    shipping: makeShipping(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Produto simulado (forma que Prisma retornaria)
// ---------------------------------------------------------------------------

export function makePrismaProduct(overrides?: Record<string, unknown>) {
  return {
    id: TEST_PRODUCT_ID,
    name: "Produto Teste",
    slug: "produto-teste",
    priceOriginal: 199.9,
    pricePromo: null,
    pixPrice: null,
    stockQuantity: 10,
    active: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// PreparedCheckout simulado (resultado de prepareCheckout)
// ---------------------------------------------------------------------------

export function makePreparedCheckout(overrides?: Partial<PreparedCheckout>): PreparedCheckout {
  const item: PreparedOrderItem = {
    product: { id: TEST_PRODUCT_ID, name: "Produto Teste", slug: "produto-teste" },
    quantity: 1,
    unitPrice: 199.9,
    lineTotal: 199.9,
  };

  return {
    order: {
      id: TEST_ORDER_ID,
      code: TEST_ORDER_CODE,
      subtotal: 199.9,
      shippingCost: 29.9,
      total: 229.8,
    },
    items: [item],
    customer: makeCustomer(),
    shipping: makeShipping(),
    siteUrl: "http://localhost:3003",
    ...overrides,
  };
}
