import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOrderCode } from "@/lib/utils";

// Schema de validação para o checkout
export const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid("ID de produto inválido"),
    quantity: z.number().int().positive("A quantidade deve ser maior que zero"),
  })).min(1, "O carrinho não pode estar vazio"),
  customer: z.object({
    name: z.string().min(2, "Nome muito curto").trim(),
    email: z.string().email("E-mail inválido").trim().toLowerCase(),
    phone: z.string().optional(),
  }),
  shipping: z.object({
    cep: z.string().length(8, "CEP deve ter 8 dígitos"),
    price: z.number().nonnegative("Preço do frete inválido"),
    serviceCode: z.string().min(1, "Código do serviço é obrigatório"),
    serviceName: z.string().min(1, "Nome do serviço é obrigatório"),
    deliveryDays: z.number().optional(),
    address: z.object({
      street: z.string().min(1, "Rua é obrigatória").trim(),
      number: z.string().min(1, "Número é obrigatório").trim(),
      complement: z.string().optional(),
      city: z.string().min(1, "Cidade é obrigatória").trim(),
      state: z.string().length(2, "UF inválida").trim().toUpperCase(),
    })
  })
});

// ---------------------------------------------------------------------------

export class CheckoutError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = "CHECKOUT_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function prepareCheckout(payload: unknown) {
  // 1. Validação estrutural inicial (Zod)
  const validated = checkoutSchema.parse(payload);
  const { items, customer, shipping } = validated;

  // 2. Normalização de itens (agrupar duplicados)
  const groupedItems = new Map<string, number>();
  for (const item of items) {
    groupedItems.set(item.productId, (groupedItems.get(item.productId) || 0) + item.quantity);
  }
  const normalizedItems = Array.from(groupedItems.entries()).map(([productId, quantity]) => ({ productId, quantity }));

  // 3. Validação de negócio (Estoque e Preços)
  const productIds = normalizedItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  
  const productById = new Map(products.map((product) => [product.id, product]));

  if (products.length !== productIds.length) {
    throw new CheckoutError("Um ou mais produtos não foram encontrados.", 404, "PRODUCT_NOT_FOUND");
  }

  const orderItems = normalizedItems.map((item) => {
    const product = productById.get(item.productId)!;
    const unitPrice = product.pricePromo ?? product.priceOriginal ?? product.pixPrice;
    
    if (!unitPrice) throw new CheckoutError(`Produto sem preço: ${product.name}`);
    if ((product.stockQuantity ?? 0) < item.quantity) {
      throw new CheckoutError(`Estoque insuficiente para ${product.name}.`, 409, "OUT_OF_STOCK");
    }

    return {
      product: { id: product.id, name: product.name, slug: product.slug },
      quantity: item.quantity,
      unitPrice: Number(unitPrice),
      lineTotal: Number(unitPrice) * item.quantity,
    };
  });

  const { env } = await import("@/lib/env");
  const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const total = subtotal + shipping.price;

  // 4. Criação do pedido (DB)
  const order = await prisma.order.create({
    data: {
      code: generateOrderCode(),
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone || null,
      shippingStreet: shipping.address.street,
      shippingNumber: shipping.address.number,
      shippingCity: shipping.address.city,
      shippingState: shipping.address.state,
      shippingZip: shipping.cep,
      notes: `Frete: ${shipping.serviceName} (${shipping.serviceCode})${
        shipping.address.complement ? ` Complemento: ${shipping.address.complement}` : ""
      }`,
      subtotal,
      shippingCost: shipping.price,
      total,
      paymentStatus: "PAYMENT_PENDING",
      status: "PENDING",
      items: {
        create: orderItems.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          sku: item.product.slug,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.lineTotal,
        })),
      },
    },
  });

  return {
    order: { id: order.id, code: order.code, subtotal, shippingCost: shipping.price, total },
    items: orderItems,
    customer,
    shipping,
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
  };
}

export function toCheckoutErrorResponse(error: unknown) {
  if (error instanceof CheckoutError) {
    return {
      message: error.message,
      status: error.status,
    };
  }
  
  if (error instanceof z.ZodError) {
    return {
      message: error.errors[0]?.message || "Dados de checkout inválidos.",
      status: 400,
    };
  }
  
  return {
    message: error instanceof Error ? error.message : "Erro interno no checkout.",
    status: 500,
  };
}


