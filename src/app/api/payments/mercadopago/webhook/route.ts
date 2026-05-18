import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWeb3FormNotification } from "@/lib/notifications";
import { formatBRL } from "@/lib/utils";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const WEBHOOK_REPLAY_WINDOW_SECONDS = 300; // rejeitar webhooks com mais de 5 minutos

async function verifyWebhookSignature(request: NextRequest): Promise<boolean> {
  const validateSignature =
    process.env.MERCADO_PAGO_VALIDATE_WEBHOOK_SIGNATURE === "true" ||
    env.MERCADO_PAGO_VALIDATE_WEBHOOK_SIGNATURE === "true" ||
    process.env.MERCADO_PAGO_VALIDATE_WEBHOOK_SIGNATURE === true;

  if (!validateSignature) {
    logger.info(
      "[webhook] Validação de assinatura de webhook desativada (MERCADO_PAGO_VALIDATE_WEBHOOK_SIGNATURE não é true). Pulando verificação."
    );
    return true;
  }

  const secret = env.MERCADO_PAGO_WEBHOOK_SECRET;

  if (!secret) {
    if (env.NODE_ENV === "production") {
      logger.error(
        "[webhook] MERCADO_PAGO_WEBHOOK_SECRET não está definido, mas a validação de assinatura está ativa. Rejeitando."
      );
      return false;
    }
    // Fallback em ambiente de testes/desenvolvimento
    logger.warn(
      "[webhook] MERCADO_PAGO_WEBHOOK_SECRET não definido — pulando validação de assinatura (fallback de desenvolvimento/testes)."
    );
    return true;
  }

  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  if (!xSignature) {
    logger.warn("[webhook] Rejeitado: header x-signature ausente.");
    return false;
  }

  // Parse "ts=<timestamp>,v1=<hmac>" do header x-signature.
  const sigParts: Record<string, string> = {};
  for (const segment of xSignature.split(",")) {
    const eqIdx = segment.indexOf("=");
    if (eqIdx === -1) continue;
    sigParts[segment.slice(0, eqIdx).trim()] = segment.slice(eqIdx + 1).trim();
  }

  const ts = sigParts["ts"];
  const v1 = sigParts["v1"];

  if (!ts || !v1) {
    logger.warn("[webhook] Rejeitado: header x-signature malformado (faltando ts ou v1).");
    return false;
  }

  // Replay attack guard: rejeitar webhooks com timestamp antigo
  const tsNum = parseInt(ts, 10);
  if (
    !Number.isFinite(tsNum) ||
    Math.abs(Date.now() / 1000 - tsNum) > WEBHOOK_REPLAY_WINDOW_SECONDS
  ) {
    logger.warn(`[webhook] Rejeitado: timestamp antigo ou inválido (ts=${ts}).`);
    return false;
  }

  const { searchParams } = new URL(request.url);
  const dataId = searchParams.get("data.id");

  // Construir manifesto canônico do Mercado Pago
  const manifestParts: string[] = [];
  if (dataId) manifestParts.push(`id:${dataId}`);
  if (xRequestId) manifestParts.push(`request-id:${xRequestId}`);
  manifestParts.push(`ts:${ts}`);
  const manifest = manifestParts.join(";") + ";";

  const expectedHex = createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    const expectedBuf = Buffer.from(expectedHex, "utf8");
    const receivedBuf = Buffer.from(v1, "utf8");

    if (expectedBuf.length !== receivedBuf.length) {
      logger.warn("[webhook] Rejeitado: tamanho de assinatura incompatível.");
      return false;
    }

    return timingSafeEqual(expectedBuf, receivedBuf);
  } catch {
    logger.warn("[webhook] Rejeitado: erro na comparação de assinatura.");
    return false;
  }
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
    order.shippingNumber ? `Número: ${order.shippingNumber}` : null,
    order.shippingCity ? `Cidade: ${order.shippingCity}` : null,
    order.shippingState ? `UF: ${order.shippingState}` : null,
    order.shippingZip ? `CEP: ${order.shippingZip}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" | ") : "Endereço não informado";
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
      `Telefone: ${order.customerPhone || "Não informado"}`,
      `Endereço: ${parseAddress(order)}`,
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

async function handlePaymentApproved(orderId: string, paymentId: string, preferenceId?: string) {
  const result = await prisma.$transaction(async (tx) => {
    // 1. Obter estado do pedido de forma isolada dentro da transação para evitar concorrência
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      throw new Error(`Order ${orderId} não encontrada na transação.`);
    }

    // 2. Idempotência: se o pedido já está pago, não fazer nada
    if (order.paymentStatus === "APPROVED") {
      return { alreadyApproved: true, order };
    }

    // 3. Validar se todos os itens têm estoque suficiente antes de deduzir qualquer unidade
    for (const item of order.items) {
      const product = item.product;
      if (!product) {
        throw new Error(`Produto associado ao item ${item.id} não foi encontrado.`);
      }

      if (product.stockQuantity < item.quantity) {
        // Estoque insuficiente detectado!
        return { stockInsufficient: true, product, order };
      }
    }

    // 4. Executar a dedução e a criação do InventoryLog atomicamente para cada item
    for (const item of order.items) {
      const product = item.product;
      const newStock = Math.max(0, product.stockQuantity - item.quantity);

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

    // 5. Atualizar pedido para status PROCESSING e APPROVED
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PROCESSING",
        paymentStatus: "APPROVED",
        mpPaymentId: String(paymentId),
        providerOrderId: preferenceId || order.mpPreferenceId || order.code,
        providerTransactionId: String(paymentId),
        providerRawStatus: "approved",
      },
    });

    return { success: true, order: updatedOrder };
  });

  // 6. Tratar erro de estoque fora da transação de baixa (marcando notes sem deduzir nada)
  if (result.stockInsufficient) {
    const originalNotes = result.order.notes || "";
    const attentionMsg = `[ATENÇÃO: ESTOQUE INSUFICIENTE] Pagamento aprovado no Mercado Pago (ID: ${paymentId}), mas o estoque de "${result.product.name}" era insuficiente (Disponível: ${result.product.stockQuantity}, Requerido: ${result.order.items.find((i) => i.productId === result.product.id)?.quantity || 0}).`;

    await prisma.order.update({
      where: { id: result.order.id },
      data: {
        notes: originalNotes ? `${attentionMsg} | ${originalNotes}` : attentionMsg,
        mpPaymentId: String(paymentId),
        providerTransactionId: String(paymentId),
        providerRawStatus: "approved_stock_insufficient",
      },
    });

    logger.warn(attentionMsg);
    return;
  }

  // 7. Disparar notificação caso a transação de aprovação seja executada pela primeira vez
  if (result.success) {
    try {
      await notifyApprovedOrder(result.order.id);
    } catch (error) {
      logger.error("Falha ao enviar notificação de aprovação do pedido", error);
    }
  }
}

async function handlePaymentFailed(orderId: string, paymentStatus: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    logger.warn(`Order não encontrada para o ID: ${orderId}`);
    return;
  }

  // Garantir que pedidos já aprovados ou rejeitados não sofram rollback acidental por webhooks atrasados
  if (order.paymentStatus === "APPROVED" || order.paymentStatus === "REJECTED") {
    return;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      status: "CANCELLED",
      paymentStatus: "REJECTED",
      providerRawStatus: paymentStatus,
    },
  });

  try {
    await sendWeb3FormNotification({
      subject: `Pagamento não aprovado: ${order.code}`,
      message: `Pedido ${order.code} do cliente ${order.customerName} foi marcado como ${paymentStatus}.`,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
    });
  } catch (error) {
    logger.error("Falha ao enviar notificação de rejeição de pagamento", error);
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

    const accessToken = env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Mercado Pago access token is missing." },
        { status: 500 }
      );
    }

    const paymentResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!paymentResponse.ok) {
      const details = await paymentResponse.text();
      logger.error("Failed to fetch payment details", null, { details });
      return NextResponse.json(
        { error: "Failed to fetch payment details." },
        { status: 500 }
      );
    }

    const payment = await paymentResponse.json();
    const preferenceId = payment.preference_id;
    const externalReference = payment.external_reference;

    // Busca flexível de pedidos para máxima resiliência técnica
    const searchConditions: Array<{
      mpPreferenceId?: string;
      code?: string;
      id?: string;
      mpPaymentId?: string;
    }> = [];
    if (preferenceId) searchConditions.push({ mpPreferenceId: preferenceId });
    if (externalReference) {
      searchConditions.push({ code: externalReference });
      searchConditions.push({ id: externalReference });
    }
    searchConditions.push({ mpPaymentId: String(paymentId) });

    const order = await prisma.order.findFirst({
      where: {
        OR: searchConditions,
      },
    });

    if (!order) {
      logger.warn(
        `Order não localizada para o paymentId=${paymentId}, preferenceId=${preferenceId}, externalReference=${externalReference}`
      );
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Persistir os metadados brutos recebidos antes do processamento principal (idempotência inicial)
    await prisma.order.update({
      where: { id: order.id },
      data: {
        mpPaymentId: String(paymentId),
        paymentProvider: "mercadopago",
        providerOrderId: preferenceId || order.mpPreferenceId || order.code,
        providerTransactionId: String(paymentId),
        providerRawStatus: payment.status || null,
      },
    });

    // Se o pedido já estava aprovado antes, retornar recebido imediatamente (idempotência absoluta)
    if (order.paymentStatus === "APPROVED") {
      return NextResponse.json({ received: true });
    }

    switch (payment.status) {
      case "approved":
        await handlePaymentApproved(order.id, String(paymentId), preferenceId);
        break;
      case "rejected":
      case "cancelled":
      case "refunded":
      case "charged_back":
        await handlePaymentFailed(order.id, payment.status);
        break;
      default:
        if (order.paymentStatus !== "APPROVED" && order.paymentStatus !== "REJECTED") {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "PENDING",
              paymentStatus: "PAYMENT_PENDING",
            },
          });
        }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("Webhook error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
