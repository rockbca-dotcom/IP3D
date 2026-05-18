import { getMercadoPagoProvider } from "@/lib/payments/providers/mercadopago-provider";
import { getInfinityPayProvider } from "@/lib/payments/providers/infinitypay-provider";
import type { PaymentProvider } from "@/lib/payments/types";
import { CheckoutError } from "@/lib/payments/checkout";
import { env } from "@/lib/env";

export function getPaymentProviderName() {
  return env.PAYMENT_PROVIDER;
}

export function getPaymentProvider(): PaymentProvider {
  const providerName = getPaymentProviderName();
  if (providerName === "infinitypay") {
    // Validar presença de credenciais sem expor seus valores
    const handle = env.INFINITYPAY_HANDLE;
    const apiKey = env.INFINITYPAY_API_KEY;
    if (!handle || !apiKey) {
      throw new CheckoutError(
        "O provedor InfinityPay está selecionado mas não foi configurado devidamente no ambiente do servidor.",
        500,
        "PROVIDER_NOT_CONFIGURED"
      );
    }
    return getInfinityPayProvider();
  }
  return getMercadoPagoProvider();
}
