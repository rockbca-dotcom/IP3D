import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWeb3FormNotification } from "@/lib/notifications";
import { formatBRL } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Webhook signature verification — Mercado Pago canonical algorithm
// Docs: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
//
// Required env vars:
//   MERCADO_PAGO_WEBHOOK_SECRET  — secret key configured in MP dashboard for
//                                   this webhook endpoint (NOT the access token)
//
// In development (NODE_ENV !== "production"), if the secret is absent the
// check is skipped with a warning so that manual testing remains possible.
// In production the handler fails closed (401) when the secret is missing.
// ---------------------------------------------------------------------------

const WEBHOOK_REPLAY_WINDOW_SECONDS = 300; // reject webhooks older than 5 min

async function verifyWebhookSignature(request: NextRequest): Promise<boolean> {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[webhook] MERCADO_PAGO_WEBHOOK_SECRET is not set. " +
          "Configure it in the Mercado Pago dashboard and add it to env. Rejecting."
      );
      return false;
    }
    // Development fallback: MP cannot reach localhost, allow without signature.
    console.warn(
      "[webhook] MERCADO_PAGO_WEBHOOK_SECRET not set — skipping signature check (development only)."
    );
    return true;
  }

  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  if (!xSignature) {
    console.warn("[webhook] Rejected: missing x-signature header.");
    return false;
  }

  // Parse "ts=<timestamp>,v1=<hmac>" from x-signature header.
  const sigParts: Record<string, string> = {};
  for (const segment of xSignature.split(",")) {
    const eqIdx = segment.indexOf("=");
    if (eqIdx === -1) continue;
    sigParts[segment.slice(0, eqIdx).trim()] = segment.slice(eqIdx + 1).trim();
  }

  const ts = sigParts["ts"];
  const v1 = sigParts["v1"];

  if (!ts || !v1) {
    console.warn("[webhook] Rejected: malformed x-signature header (missing ts or v1).");
    return false;
  }

  // Replay-attack guard: reject webhooks with a stale timestamp.
  const tsNum = parseInt(ts, 10);
  if (
    !Number.isFinite(tsNum) ||
    Math.abs(Date.now() / 1000 - tsNum) > WEBHOOK_REPLAY_WINDOW_SECONDS
  ) {
    console.warn(`[webhook] Rejected: stale or invalid timestamp (ts=${ts}).`);
    return false;
  }

  // data.id comes from the query parameter in the webhook notification URL,
  // NOT from the request body — this is the canonical MP approach.
  const { searchParams } = new URL(request.url);
  const dataId = searchParams.get("data.id");

  // Build the canonical manifest exactly as MP specifies.
  // Fields are included only when present; order matters.
  const manifestParts: string[] = [];
  if (dataId) manifestParts.push(`id:${dataId}`);
  if (xRequestId) manifestParts.push(`request-id:${xRequestId}`);
  manifestParts.push(`ts:${ts}`);
  const manifest = manifestParts.join(";") + ";";

  const expectedHex = createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    const expectedBuf = Buffer.from(expectedHex, "utf8");
    const receivedBuf = Buffer.from(v1, "utf8");

    // Lengths must match before timingSafeEqual to avoid throwing.
    if (expectedBuf.length !== receivedBuf.length) {
      console.warn("[webhook] Rejected: signature length mismatch.");
      return false;
    }

    return timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    console.warn("[webhook] Rejected: signature comparison error.");
    return false;
  }
}

// ---------------------------------------------------------------------------
// Business logic — unchanged from original
// ---------------------------------------------------------------------------

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
      "Pagamento aprovado no Mercado Pago.",
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

  if (!order) {
    console.warn(`Order not found for orderId: ${orderId}`);
    return;
  }

  if (order.paymentStatus === "APPROVED") {
    return;
  }

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
    console.error("Failed to send approved order notification:", error);
  }
}

async function handlePaymentFailed(orderId: string, paymentStatus: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    console.warn(`Order not found for orderId: ${orderId}`);
    return;
  }

  if (order.paymentStatus === "REJECTED") {
    return;
  }

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
    console.error("Failed to send payment rejection notification:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const isValid = await verifyWebhookSignature(request);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const notification = await request.json();
    const type = notification?.type;
    const paymentId = notification?.data?.id;

    if (type !== "payment" || !paymentId) {
      return NextResponse.json({ received: true });
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json({ error: "Mercado Pago access token is missing." }, { status: 500 });
    }

    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!paymentResponse.ok) {
      const details = await paymentResponse.text();
      console.error("Failed to fetch payment details:", details);
      return NextResponse.json({ error: "Failed to fetch payment details." }, { status: 500 });
    }

    const payment = await paymentResponse.json();
    const preferenceId = payment.preference_id;
    const externalReference = payment.external_reference;

    const order = await prisma.order.findFirst({
      where: preferenceId
        ? { mpPreferenceId: preferenceId }
        : externalReference
          ? { code: externalReference }
          : undefined,
    });

    if (!order) {
      console.warn(`Order not found for payment ${paymentId}. preference_id=${preferenceId}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { mpPaymentId: String(paymentId) },
    });

    switch (payment.status) {
      case "approved":
        await handlePaymentApproved(order.id);
        break;
      case "rejected":
      case "cancelled":
      case "refunded":
      case "charged_back":
        await handlePaymentFailed(order.id, payment.status);
        break;
      default:
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: "PENDING",
            paymentStatus: "PAYMENT_PENDING",
          },
        });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
