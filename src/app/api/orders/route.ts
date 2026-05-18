import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateOrderCode } from "@/lib/utils";
import { handleApiError, apiSuccess, apiError } from "@/lib/api-utils";
import { rateLimiter } from "@/lib/rate-limit";

// Schema de validação Zod para criação de pedido
const orderCreateSchema = z.object({
  customer: z.object({
    name: z.string().min(2, "Nome muito curto").trim(),
    email: z.string().email("E-mail inválido").trim().toLowerCase(),
    phone: z.string().optional(),
  }),
  address: z.object({
    cep: z.string().length(8, "CEP deve ter 8 dígitos"),
    street: z.string().min(1, "Rua é obrigatória").trim(),
    number: z.string().min(1, "Número é obrigatório").trim(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().min(1, "Cidade é obrigatória").trim(),
    state: z.string().length(2, "UF inválida").trim().toUpperCase(),
  }),
  shipping: z.object({
    optionSelected: z.string().min(1, "Opção de frete é obrigatória"),
    price: z.number().nonnegative("Preço do frete inválido"),
    deliveryDays: z.number().int().positive("Prazo de entrega inválido").optional(),
  }),
  items: z.array(
    z.object({
      productId: z.string().optional(),
      slug: z.string().optional(),
      quantity: z.number().int().positive("A quantidade deve ser maior que zero"),
    })
  ).min(1, "O carrinho não pode estar vazio"),
});

export class OrderError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 400, code = "ORDER_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimiter(request, "orders", {
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimitResult.success) {
    return apiError(
      "Muitas tentativas de criação de pedido. Tente novamente mais tarde.",
      "TOO_MANY_REQUESTS",
      429
    );
  }

  try {
    const payload = await request.json();

    // 1. Validação estrutural do payload (Zod)
    const validated = orderCreateSchema.parse(payload);
    const { customer, address, shipping, items } = validated;

    // 2. Normalização de itens (agrupar quantidades para produtos duplicados)
    const groupedItems = new Map<string, number>();
    for (const item of items) {
      const key = item.productId || item.slug;
      if (!key) {
        throw new OrderError("Cada item deve fornecer o ID ou slug do produto.", 400, "INVALID_ITEM");
      }
      groupedItems.set(key, (groupedItems.get(key) || 0) + item.quantity);
    }

    // 3. Execução Transacional Atômica no Banco de Dados
    const order = await prisma.$transaction(async (tx) => {
      // 3.1. Obter chaves consultadas
      const keys = Array.from(groupedItems.keys());
      const products = await tx.product.findMany({
        where: {
          OR: [
            { id: { in: keys } },
            { slug: { in: keys } },
          ],
        },
      });

      // Mapear produtos por id e por slug para acesso rápido e seguro
      const productMap = new Map<string, typeof products[0]>();
      for (const p of products) {
        productMap.set(p.id, p);
        productMap.set(p.slug, p);
      }

      // 3.2. Validar se todos os itens foram localizados
      if (products.length < groupedItems.size) {
        const missingKeys = keys.filter((key) => !productMap.has(key));
        throw new OrderError(
          `Um ou mais produtos não foram encontrados: ${missingKeys.join(", ")}`,
          404,
          "PRODUCT_NOT_FOUND"
        );
      }

      // 3.3. Validar atividade e estoque disponível (sem baixar o estoque)
      const finalOrderItems = [];
      let subtotal = 0;

      for (const [key, qty] of groupedItems.entries()) {
        const product = productMap.get(key)!;

        if (!product.active) {
          throw new OrderError(`Produto inativo: ${product.name}`, 400, "INACTIVE_PRODUCT");
        }

        if (product.stockQuantity < qty) {
          throw new OrderError(
            `Estoque insuficiente para ${product.name}. Disponível: ${product.stockQuantity}, Solicitado: ${qty}`,
            409,
            "OUT_OF_STOCK"
          );
        }

        // 3.4. Obter preço oficial do banco (ignorar preço enviado pelo cliente)
        const unitPriceDecimal = product.pricePromo ?? product.priceOriginal ?? product.pixPrice;
        if (!unitPriceDecimal) {
          throw new OrderError(`Produto sem preço configurado: ${product.name}`, 400, "MISSING_PRICE");
        }

        const unitPrice = Number(unitPriceDecimal);
        const lineTotal = unitPrice * qty;
        subtotal += lineTotal;

        finalOrderItems.push({
          productId: product.id,
          name: product.name,
          sku: product.slug, // Salvar slug do produto como SKU de snapshot
          quantity: qty,
          unitPrice,
          total: lineTotal,
        });
      }

      // 3.5. Computar total oficial
      const total = subtotal + shipping.price;

      // 3.6. Proteção temporal contra double-clicks (idempotência de 1 minuto)
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      const recentOrders = await tx.order.findMany({
        where: {
          customerEmail: customer.email,
          status: "PENDING",
          createdAt: { gte: oneMinuteAgo },
        },
        include: {
          items: true,
        },
      });

      const isDuplicate = recentOrders.some((recentOrder) => {
        if (recentOrder.items.length !== groupedItems.size) return false;

        for (const item of finalOrderItems) {
          const matchedItem = recentOrder.items.find(
            (ri) => ri.productId === item.productId
          );
          if (!matchedItem || matchedItem.quantity !== item.quantity) {
            return false;
          }
        }
        return true;
      });

      if (isDuplicate) {
        throw new OrderError(
          "Já existe um pedido idêntico em andamento. Por favor, aguarde um instante.",
          409,
          "DUPLICATE_ORDER"
        );
      }

      // 3.7. Gravação Transacional do Pedido e de seus itens
      const createdOrder = await tx.order.create({
        data: {
          code: generateOrderCode(),
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone || null,
          shippingStreet: address.street,
          shippingNumber: address.number,
          shippingCity: address.city,
          shippingState: address.state,
          shippingZip: address.cep,
          notes: `Frete: ${shipping.optionSelected}${
            address.complement ? ` | Complemento: ${address.complement}` : ""
          }${
            address.neighborhood ? ` | Bairro: ${address.neighborhood}` : ""
          }`,
          subtotal,
          shippingCost: shipping.price,
          total,
          status: "PENDING",
          paymentStatus: "PAYMENT_PENDING",
          items: {
            create: finalOrderItems,
          },
        },
        include: {
          items: true,
        },
      });

      return createdOrder;
    });

    // 4. Retornar dados oficiais calculados pelo servidor
    return apiSuccess({
      success: true,
      order: {
        id: order.id,
        code: order.code,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        total: Number(order.total),
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
      },
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
