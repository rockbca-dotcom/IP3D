import type { PaymentProvider, PreparedCheckout, ProviderCheckoutResponse } from "@/lib/payments/types";
import { prisma } from "@/lib/prisma";

interface InfinityPayCreateLinkResponse {
  url?: string;
  slug?: string;
}

class InfinityPayProvider implements PaymentProvider {
  async createCheckout(input: PreparedCheckout): Promise<ProviderCheckoutResponse> {
    const handle = process.env.INFINITYPAY_HANDLE;
    const apiKey = process.env.INFINITYPAY_API_KEY;

    if (!handle || !apiKey) {
      throw new Error("InfinityPay nao configurado. Defina INFINITYPAY_HANDLE e INFINITYPAY_API_KEY.");
    }

    const redirectUrl =
      process.env.INFINITYPAY_REDIRECT_URL || `${input.siteUrl.replace(/\/$/, "")}/checkout/pendente`;
    const webhookUrl =
      process.env.INFINITYPAY_WEBHOOK_URL ||
      `${input.siteUrl.replace(/\/$/, "")}/api/payments/infinitypay/webhook`;

    const items = [
      ...input.items.map((item) => ({
        quantity: item.quantity,
        price: Math.round(item.unitPrice * 100),
        description: item.product.name,
      })),
      {
        quantity: 1,
        price: Math.round(input.order.shippingCost * 100),
        description: `Frete ${input.shipping.serviceName}`,
      },
    ];

    const response = await fetch("https://api.checkout.infinitepay.io/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        handle,
        redirect_url: redirectUrl,
        webhook_url: webhookUrl,
        order_nsu: input.order.code,
        customer: {
          name: input.customer.name,
          email: input.customer.email,
          phone_number: input.customer.phone || undefined,
        },
        address: {
          cep: input.shipping.cep.replace(/\D/g, ""),
          number: input.shipping.address.number,
          complement: input.shipping.address.complement || undefined,
        },
        items,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`InfinityPay checkout error: ${details}`);
    }

    const data = (await response.json()) as InfinityPayCreateLinkResponse;
    if (!data.url) {
      throw new Error("InfinityPay nao retornou url de checkout.");
    }

    await prisma.order.update({
      where: { id: input.order.id },
      data: {
        paymentProvider: "infinitypay",
        providerOrderId: data.slug || input.order.code,
      },
    });

    return {
      redirectUrl: data.url,
      providerOrderId: data.slug || input.order.code,
    };
  }
}

const provider = new InfinityPayProvider();

export function getInfinityPayProvider() {
  return provider;
}
