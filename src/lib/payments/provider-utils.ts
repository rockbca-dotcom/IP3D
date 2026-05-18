/**
 * src/lib/payments/provider-utils.ts
 *
 * Utilitários simples para normalização de nomes de provedores,
 * separados para evitar dependências circulares com o módulo de env.
 */

export type ProviderName = "mercadopago" | "infinitypay";

export function normalizeProviderName(value: string | undefined): ProviderName {
  const normalized = (value || "").trim().toLowerCase();
  return normalized === "infinitypay" ? "infinitypay" : "mercadopago";
}
