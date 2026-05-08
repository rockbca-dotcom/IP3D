import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWeb3FormNotification } from "@/lib/notifications";
import { mapInfinityStatus } from "@/lib/payments/status";
import { formatBRL } from "@/lib/utils";

interface InfinityWebhookPayload {
  order_nsu?: string;
  transaction_nsu?: string;
  invoice_slug?: string;
  capture_method?: string;
  amount?: number;
  paid_amount?: number;
  status?: string;
}

function parseAddress(order: {
  shippingStreet: string | null;
  shippingNumber: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
}) {
  const parts = [
    order.shippingStreet ? `Rua: ${order.shippingStreet}` : null,
    order.shippingNumber ? `Numero: ${order.shippingNumber}` : null,
    order.shippingCity ? `Cidade: ${order.shippingCity}` : null,
    order.shippingState ? `UF: ${order.shippingState}` : null,
    order.shippingZip ? `CEP: ${order.shippingZip}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" | ") : "Endereco nao informado";
}

async function notifyApprovedOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  const itemsList = order.items
    .map((item) => `${item.quantity}x ${item.name} - ${formatBRL(Number(item.total))}`)
    .join("\n");
  const shippingCost = order.shippingCost ? Number(order.shippingCost) : 0;

  await sendWeb3FormNotification({
    subject: `Pedido pago com sucesso: ${order.code}`,
    message: [
      `Pedido: ${order.code}`,
      `Cliente: ${order.customerName}`,
      `E-mail: ${order.customerEmail}`,
      `Telefone: ${order.customerPhone || "Nao informado"}`,
      `Endereco: ${parseAddress(order)}`,
      "",
      "Itens:",
      itemsList,
      "",
      `Subtotal: ${formatBRL(Number(order.subtotal))}`,
      `Frete: ${formatBRL(shippingCost)}`,
      `Total: ${formatBRL(Number(order.total))}`,
      "",
      "Pagamento aprovado no InfinityPay.",
    ].join("\n"),
    customerName: order.customerName,
    customerEmail: order.customerEmail,
  });
}

async function handlePaymentApproved(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) return;
  if (order.paymentStatus === "APPROVED") return;

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const product = item.product;
      if (!product) continue;

      const newStock = Math.max(0, (product.stockQuantity ?? 0) - item.quantity);
      await tx.product.update({
        where: { id: product.id },
        data: { stockQuantity: newStock },
      });

      await tx.inventoryLog.create({
        data: {
          productId: product.id,
          change: -item.quantity,
          reason: `Pedido ${order.code} aprovado`,
          referenceId: order.id,
          type: "ORDER",
        },
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PROCESSING",
        paymentStatus: "APPROVED",
      },
    });
  });

  try {
    await notifyApprovedOrder(order.id);
  } catch (error) {
    console.error("Failed to send InfinityPay approved notification:", error);
  }
}

async function handlePaymentFailed(orderId: string, paymentStatus: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });
  if (!order) return;
  if (order.paymentStatus === "REJECTED") return;

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "CANCELLED",
      paymentStatus: "REJECTED",
    },
  });

  try {
    await sendWeb3FormNotification({
      subject: `Pagamento nao aprovado: ${order.code}`,
      message: `Pedido ${order.code} do cliente ${order.customerName} foi marcado como ${paymentStatus}.`,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
    });
  } catch (error) {
    console.error("Failed to send InfinityPay rejection notification:", error);
  }
}

function safeHeader(request: NextRequest, names: string[]) {
  for (const name of names) {
    const value = request.headers.get(name);
    if (value) return value;
  }
  return null;
}

function verifySignature(rawBody: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    const expectedBuf = Buffer.from(expected, "utf8");
    const receivedBuf = Buffer.from(signature, "utf8");
    if (expectedBuf.length !== receivedBuf.length) return false;
    return timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const secret = process.env.INFINITYPAY_WEBHOOK_SECRET;
    const signature = safeHeader(request, ["x-infinitypay-signature", "x-signature"]);

    if (secret) {
      if (!signature || !verifySignature(rawBody, signature, secret)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === "production") {
      console.error("INFINITYPAY_WEBHOOK_SECRET is missing in production.");
      return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
    }

    const payload = JSON.parse(rawBody) as InfinityWebhookPayload;
    const orderCode = payload.order_nsu;
    if (!orderCode) {
      return NextResponse.json({ success: false, message: "order_nsu ausente." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { code: orderCode },
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Pedido nao encontrado." }, { status: 404 });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentProvider: "infinitypay",
        providerOrderId: payload.invoice_slug || order.code,
        providerTransactionId: payload.transaction_nsu || null,
        providerPaymentMethod: payload.capture_method || null,
        providerRawStatus: payload.status || null,
      },
    });

    const normalizedStatus = (payload.status || "").toLowerCase();
    const mappedStatus = mapInfinityStatus(payload.status, payload.paid_amount);

    if (mappedStatus === "APPROVED") {
      await handlePaymentApproved(order.id);
    } else if (mappedStatus === "REJECTED") {
      await handlePaymentFailed(order.id, normalizedStatus || "failed");
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PENDING",
          paymentStatus: "PAYMENT_PENDING",
        },
      });
    }

    return NextResponse.json({ success: true, message: null });
  } catch (error) {
    console.error("InfinityPay webhook error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
