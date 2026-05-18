import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { handleApiError, apiSuccess, apiError } from "@/lib/api-utils";
import { prepareCheckout } from "@/lib/payments/checkout";
import { getMercadoPagoProvider } from "@/lib/payments/providers/mercadopago-provider";
import { z } from "zod";

const orderIdSchema = z.object({
  orderId: z.string().min(1, "ID do pedido é obrigatório"),
});

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Se o payload contiver orderId, usamos o fluxo de pedido existente (Flow B)
    if (payload && typeof payload === "object" && "orderId" in payload) {
      // 1. Validar orderId com Zod
      const parsed = orderIdSchema.parse(payload);
      const { orderId } = parsed;

      // 2. Verificar se o provider está habilitado por env
      if (!env.MERCADO_PAGO_ACCESS_TOKEN) {
        return apiError("Token de acesso do Mercado Pago não configurado.", "PROVIDER_NOT_CONFIGURED", 500);
      }

      // 3. Buscar pedido no banco de dados
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        return apiError("Pedido solicitado não encontrado.", "NOT_FOUND", 404);
      }

      // 4. Validar status do pedido
      if (order.status !== "PENDING" || order.paymentStatus !== "PAYMENT_PENDING") {
        return apiError("Este pedido já foi pago ou cancelado.", "CONFLICT", 409);
      }

      // 5. Validar se o pedido possui itens
      if (order.items.length === 0) {
        return apiError("O pedido não possui itens.", "CONFLICT", 409);
      }

      // 6. Extrair detalhes do frete dos notes
      const notesStr = order.notes || "";
      let serviceName = "Padrão";
      let serviceCode = "STANDARD";
      let complement: string | null = null;
      let neighborhood = "";

      if (notesStr.startsWith("Frete: ")) {
        const match = notesStr.match(/^Frete:\s*([^|]+)/);
        if (match) {
          const fullService = match[1].trim();
          const parensMatch = fullService.match(/^([^\(]+)\s*\(([^)]+)\)/);
          if (parensMatch) {
            serviceName = parensMatch[1].trim();
            serviceCode = parensMatch[2].trim();
          } else {
            serviceName = fullService;
            serviceCode = fullService;
          }
        }
        
        const compMatch = notesStr.match(/Complemento:\s*([^|]+)/);
        if (compMatch) {
          complement = compMatch[1].trim();
        }
        const neighMatch = notesStr.match(/Bairro:\s*([^|]+)/);
        if (neighMatch) {
          neighborhood = neighMatch[1].trim();
        }
      }

      // 7. Mapear para PreparedCheckout
      const prepared = {
        order: {
          id: order.id,
          code: order.code,
          subtotal: Number(order.subtotal),
          shippingCost: Number(order.shippingCost || 0),
          total: Number(order.total),
        },
        items: order.items.map((item) => ({
          product: {
            id: item.productId,
            name: item.name,
            slug: item.sku || "",
          },
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          lineTotal: Number(item.total),
        })),
        customer: {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone || undefined,
        },
        shipping: {
          cep: order.shippingZip || "",
          serviceCode,
          serviceName,
          deliveryDays: 0,
          price: Number(order.shippingCost || 0),
          address: {
            street: order.shippingStreet || "",
            number: order.shippingNumber || "",
            neighborhood,
            city: order.shippingCity || "",
            state: order.shippingState || "",
            complement,
          },
        },
        siteUrl: env.NEXT_PUBLIC_SITE_URL,
      };

      // 8. Chamar o provedor de pagamentos Mercado Pago
      const checkout = await getMercadoPagoProvider().createCheckout(prepared);

      const isProd = env.NODE_ENV === "production";
      const checkoutUrl = isProd 
        ? (checkout.initPoint || checkout.sandboxInitPoint || checkout.redirectUrl)
        : (checkout.sandboxInitPoint || checkout.initPoint || checkout.redirectUrl);

      return apiSuccess({
        success: true,
        checkoutUrl,
        preferenceId: checkout.providerOrderId ?? null,
        orderId: order.id,
        initPoint: checkout.initPoint || "",
        sandboxInitPoint: checkout.sandboxInitPoint || "",
        init_point: checkout.initPoint || "",
        sandbox_init_point: checkout.sandboxInitPoint || "",
        orderCode: order.code,
        subtotal: prepared.order.subtotal,
        shippingCost: prepared.order.shippingCost,
        total: prepared.order.total,
      });
    }

    // Se NÃO contiver orderId, usamos o fluxo legado (criação dinâmica do pedido)
    // Para manter retrocompatibilidade absoluta e garantir que nenhum teste legado quebre.
    const prepared = await prepareCheckout(payload);
    const checkout = await getMercadoPagoProvider().createCheckout(prepared);

    const isProd = env.NODE_ENV === "production";
    const checkoutUrl = isProd 
      ? (checkout.initPoint || checkout.sandboxInitPoint || checkout.redirectUrl)
      : (checkout.sandboxInitPoint || checkout.initPoint || checkout.redirectUrl);

    return apiSuccess({
      success: true,
      checkoutUrl,
      preferenceId: checkout.providerOrderId ?? null,
      initPoint: checkout.initPoint || checkout.redirectUrl || "",
      sandboxInitPoint: checkout.sandboxInitPoint || "",
      init_point: checkout.initPoint || checkout.redirectUrl || "",
      sandbox_init_point: checkout.sandboxInitPoint || "",
      orderCode: prepared.order.code,
      subtotal: prepared.order.subtotal,
      shippingCost: prepared.order.shippingCost,
      total: prepared.order.total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
