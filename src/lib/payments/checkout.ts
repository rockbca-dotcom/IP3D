import { prisma } from "@/lib/prisma";
import { generateOrderCode } from "@/lib/utils";
import type {
  CheckoutItemInput,
  CheckoutPayload,
  CheckoutShipping,
  PreparedCheckout,
  PreparedOrderItem,
} from "@/lib/payments/types";

class CheckoutError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeItems(items: CheckoutItemInput[]) {
  const grouped = new Map<string, number>();

  for (const item of items) {
    if (!item?.productId) continue;
    const quantity = Number.isFinite(item.quantity) ? Math.floor(item.quantity) : 0;
    if (quantity <= 0) continue;
    grouped.set(item.productId, (grouped.get(item.productId) || 0) + quantity);
  }

  return Array.from(grouped.entries()).map(([productId, quantity]) => ({ productId, quantity }));
}

function getShippingPrice(shipping: CheckoutShipping) {
  const parsedPrice = Number(shipping.price);
  return Number.isFinite(parsedPrice) ? parsedPrice : NaN;
}

function validateShipping(shipping: CheckoutShipping | undefined) {
  if (!shipping) return "Frete nao informado.";

  const hasAddress =
    shipping.cep &&
    shipping.address?.street &&
    shipping.address?.number &&
    shipping.address?.city &&
    shipping.address?.state;

  if (!hasAddress) return "Endereco incompleto para calcular frete.";
  if (!shipping.serviceCode || !shipping.serviceName) return "Opcao de frete invalida.";

  const shippingPrice = getShippingPrice(shipping);
  if (!Number.isFinite(shippingPrice) || shippingPrice <= 0) return "Valor de frete invalido.";

  return null;
}

export async function prepareCheckout(payload: CheckoutPayload): Promise<PreparedCheckout> {
  const { items, customer, shipping } = payload;
  const normalizedItems = normalizeItems(items || []);

  if (!normalizedItems.length) throw new CheckoutError("Itens nao enviados.");
  if (!customer?.name?.trim() || !customer?.email?.trim()) {
    throw new CheckoutError("Nome e e-mail sao obrigatorios.");
  }
  if (!isValidEmail(customer.email)) throw new CheckoutError("E-mail invalido.");

  const shippingValidationError = validateShipping(shipping);
  if (shippingValidationError) throw new CheckoutError(shippingValidationError);

  const shippingCost = getShippingPrice(shipping);
  const productIds = normalizedItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  if (products.length !== productIds.length) {
    throw new CheckoutError("Um ou mais produtos nao foram encontrados.", 404);
  }

  const orderItems: PreparedOrderItem[] = normalizedItems.map((item) => {
    const product = productById.get(item.productId);
    if (!product) throw new CheckoutError(`Produto nao encontrado: ${item.productId}`, 404);

    const unitPrice = product.pricePromo ?? product.priceOriginal ?? product.pixPrice;
    if (!unitPrice) throw new CheckoutError(`Produto sem preco: ${product.name}`);
    if ((product.stockQuantity ?? 0) < item.quantity) {
      throw new CheckoutError(`Estoque insuficiente para ${product.name}.`);
    }

    const lineTotal = Number(unitPrice) * item.quantity;

    return {
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
      },
      quantity: item.quantity,
      unitPrice: Number(unitPrice),
      lineTotal,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const total = subtotal + shippingCost;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3003";

  const order = await prisma.order.create({
    data: {
      code: generateOrderCode(),
      customerName: customer.name.trim(),
      customerEmail: customer.email.trim(),
      customerPhone: customer.phone?.trim() || null,
      shippingStreet: shipping.address.street.trim(),
      shippingNumber: shipping.address.number.trim(),
      shippingCity: shipping.address.city.trim(),
      shippingState: shipping.address.state.trim(),
      shippingZip: shipping.cep.replace(/\D/g, ""),
      notes: `Frete: ${shipping.serviceName} (${shipping.serviceCode}) - prazo estimado ${shipping.deliveryDays} dia(s).${
        shipping.address.complement ? ` Complemento: ${shipping.address.complement}` : ""
      }`,
      subtotal,
      shippingCost,
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
    order: {
      id: order.id,
      code: order.code,
      subtotal,
      shippingCost,
      total,
    },
    items: orderItems,
    customer: {
      name: customer.name.trim(),
      email: customer.email.trim(),
      phone: customer.phone?.trim(),
    },
    shipping,
    siteUrl,
  };
}

export function toCheckoutErrorResponse(error: unknown) {
  if (error instanceof CheckoutError) {
    return { status: error.status, message: error.message };
  }

  return {
    status: 500,
    message: error instanceof Error ? error.message : "Erro ao iniciar o checkout.",
  };
}
