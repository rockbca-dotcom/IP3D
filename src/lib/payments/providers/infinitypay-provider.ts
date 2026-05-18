import type { PaymentProvider, PreparedCheckout, ProviderCheckoutResponse } from "@/lib/payments/types";
import { CheckoutError } from "@/lib/payments/checkout";

class InfinityPayProvider implements PaymentProvider {
  async createCheckout(_input: PreparedCheckout): Promise<ProviderCheckoutResponse> {
    throw new CheckoutError(
      "A integração com InfinityPay não está ativa ou está descontinuada. Use o Mercado Pago como provedor principal.",
      501,
      "NOT_IMPLEMENTED"
    );
  }
}

const provider = new InfinityPayProvider();

export function getInfinityPayProvider() {
  return provider;
}
