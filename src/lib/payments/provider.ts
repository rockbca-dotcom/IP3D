import { getMercadoPagoProvider } from "@/lib/payments/providers/mercadopago-provider";
import { getInfinityPayProvider } from "@/lib/payments/providers/infinitypay-provider";
import type { PaymentProvider } from "@/lib/payments/types";

export type ProviderName = "mercadopago" | "infinitypay";

export function normalizeProviderName(value: string | undefined): ProviderName {
  const normalized = (value || "").trim().toLowerCase();
  return normalized === "infinitypay" ? "infinitypay" : "mercadopago";
}

export function getPaymentProviderName() {
  return normalizeProviderName(process.env.PAYMENT_PROVIDER);
}

export function getPaymentProvider(): PaymentProvider {
  const providerName = getPaymentProviderName();
  if (providerName === "infinitypay") return getInfinityPayProvider();
  return getMercadoPagoProvider();
}
