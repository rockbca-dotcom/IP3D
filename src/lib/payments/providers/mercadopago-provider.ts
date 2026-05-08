import { prisma } from "@/lib/prisma";
import { preferenceClient } from "@/lib/mercadopago";
import type { PaymentProvider, PreparedCheckout, ProviderCheckoutResponse } from "@/lib/payments/types";

class MercadoPagoProvider implements PaymentProvider {
  async createCheckout(input: PreparedCheckout): Promise<ProviderCheckoutResponse> {
    if (!preferenceClient) {
      throw new Error("Mercado Pago nao configurado.");
    }

    const notificationUrl =
      process.env.MERCADO_PAGO_WEBHOOK_URL ||
      `${input.siteUrl.replace(/\/$/, "")}/api/payments/mercadopago/webhook`;

    const backUrls = {
      success: `${input.siteUrl}/checkout/sucesso?pedido=${input.order.code}`,
      failure: `${input.siteUrl}/checkout/erro?pedido=${input.order.code}`,
      pending: `${input.siteUrl}/checkout/pendente?pedido=${input.order.code}`,
    };

    const isLocalhost = /localhost|127\.0\.0\.1/i.test(input.siteUrl);
    const preferenceItems = [
      ...input.items.map((item) => ({
        id: item.product.id,
        title: item.product.name,
        quantity: item.quantity,
        currency_id: "BRL" as const,
        unit_price: Number(item.unitPrice.toFixed(2)),
      })),
      {
        id: `shipping-${input.shipping.serviceCode}`,
        title: `Frete ${input.shipping.serviceName}`,
        quantity: 1,
        currency_id: "BRL" as const,
        unit_price: Number(input.order.shippingCost.toFixed(2)),
      },
    ];

    const preference = await preferenceClient.create({
      body: {
        items: preferenceItems,
        payer: {
          name: input.customer.name,
          email: input.customer.email,
          phone: input.customer.phone ? { number: input.customer.phone } : undefined,
        },
        metadata: {
          orderId: input.order.id,
          orderCode: input.order.code,
          shippingCode: input.shipping.serviceCode,
          shippingService: input.shipping.serviceName,
        },
        external_reference: input.order.code,
        back_urls: backUrls,
        auto_return: isLocalhost ? undefined : "approved",
        notification_url: notificationUrl,
      },
    });

    if (preference?.id) {
      await prisma.order.update({
        where: { id: input.order.id },
        data: {
          mpPreferenceId: preference.id,
          paymentProvider: "mercadopago",
          providerOrderId: preference.id,
        },
      });
    }

    return {
      redirectUrl: preference.init_point || preference.sandbox_init_point || "",
      providerOrderId: preference.id ?? null,
    };
  }
}

const provider = new MercadoPagoProvider();

export function getMercadoPagoProvider() {
  return provider;
}
