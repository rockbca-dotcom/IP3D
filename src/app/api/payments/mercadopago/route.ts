import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { preferenceClient } from "@/lib/mercadopago";
import { generateOrderCode } from "@/lib/utils";

interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

interface CheckoutCustomer {
  name: string;
  email: string;
  phone?: string;
}

interface CheckoutShipping {
  cep: string;
  serviceCode: string;
  serviceName: string;
  deliveryDays: number;
  price: number;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    number: string;
    complement?: string | null;
  };
}

interface CheckoutPayload {
  items: CheckoutItemInput[];
  customer: CheckoutCustomer;
  shipping: CheckoutShipping;
}

interface NormalizedCheckoutItem {
  productId: string;
  quantity: number;
}

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

  if (!hasAddress) {
    return "Endereco incompleto para calcular frete.";
  }

  if (!shipping.serviceCode || !shipping.serviceName) {
    return "Opcao de frete invalida.";
  }

  const shippingPrice = getShippingPrice(shipping);
  if (!Number.isFinite(shippingPrice) || shippingPrice <= 0) {
    return "Valor de frete invalido.";
  }

  return null;
}

export async function POST(request: NextRequest) {
  if (!preferenceClient) {
    return NextResponse.json({ error: "Mercado Pago nao configurado." }, { status: 500 });
  }

  try {
    const { items, customer, shipping }: CheckoutPayload = await request.json();

    const normalizedItems: NormalizedCheckoutItem[] = normalizeItems(items || []);

    if (!normalizedItems.length) {
      return NextResponse.json({ error: "Itens nao enviados." }, { status: 400 });
    }

    if (!customer?.name?.trim() || !customer?.email?.trim()) {
      return NextResponse.json({ error: "Nome e e-mail sao obrigatorios." }, { status: 400 });
    }

    if (!isValidEmail(customer.email)) {
      return NextResponse.json({ error: "E-mail invalido." }, { status: 400 });
    }

    const shippingValidationError = validateShipping(shipping);
    if (shippingValidationError) {
      return NextResponse.json({ error: shippingValidationError }, { status: 400 });
    }

    const shippingCost = getShippingPrice(shipping);
    const productIds = normalizedItems.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productById = new Map(products.map((product) => [product.id, product]));

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: "Um ou mais produtos nao foram encontrados." }, { status: 404 });
    }

    const orderItems = normalizedItems.map((item) => {
      const product = productById.get(item.productId);
      if (!product) throw new CheckoutError(`Produto nao encontrado: ${item.productId}`, 404);

      const unitPrice = product.pricePromo ?? product.priceOriginal ?? product.pixPrice;
      if (!unitPrice) throw new CheckoutError(`Produto sem preco: ${product.name}`);

      if ((product.stockQuantity ?? 0) < item.quantity) {
        throw new CheckoutError(`Estoque insuficiente para ${product.name}.`);
      }

      const lineTotal = Number(unitPrice) * item.quantity;

      return {
        product,
        quantity: item.quantity,
        unitPrice: Number(unitPrice),
        lineTotal,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const total = subtotal + shippingCost;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3003";
    const notificationUrl =
      process.env.MERCADO_PAGO_WEBHOOK_URL || `${siteUrl.replace(/\/$/, "")}/api/payments/mercadopago/webhook`;

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

    const backUrls = {
      success: `${siteUrl}/checkout/sucesso?pedido=${order.code}`,
      failure: `${siteUrl}/checkout/erro?pedido=${order.code}`,
      pending: `${siteUrl}/checkout/pendente?pedido=${order.code}`,
    };

    const isLocalhost = /localhost|127\.0\.0\.1/i.test(siteUrl);
    const preferenceItems = [
      ...orderItems.map((item) => ({
        id: item.product.id,
        title: item.product.name,
        quantity: item.quantity,
        currency_id: "BRL" as const,
        unit_price: Number(item.unitPrice.toFixed(2)),
      })),
      {
        id: `shipping-${shipping.serviceCode}`,
        title: `Frete ${shipping.serviceName}`,
        quantity: 1,
        currency_id: "BRL" as const,
        unit_price: Number(shippingCost.toFixed(2)),
      },
    ];

    const preference = await preferenceClient.create({
      body: {
        items: preferenceItems,
        payer: {
          name: customer.name.trim(),
          email: customer.email.trim(),
          phone: customer.phone ? { number: customer.phone } : undefined,
        },
        metadata: {
          orderId: order.id,
          orderCode: order.code,
          shippingCode: shipping.serviceCode,
          shippingService: shipping.serviceName,
        },
        external_reference: order.code,
        back_urls: backUrls,
        auto_return: isLocalhost ? undefined : "approved",
        notification_url: notificationUrl,
      },
    });

    if (preference?.id) {
      await prisma.order.update({
        where: { id: order.id },
        data: { mpPreferenceId: preference.id },
      });
    }

    return NextResponse.json({
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      orderCode: order.code,
      subtotal,
      shippingCost,
      total,
    });
  } catch (error) {
    console.error("Mercado Pago preference error:", error);
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Erro ao criar preferencia.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
