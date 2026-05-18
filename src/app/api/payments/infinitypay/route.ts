import { apiError } from "@/lib/api-utils";

export async function POST() {
  return apiError(
    "A integração com InfinityPay não está ativa ou está descontinuada. Use o Mercado Pago como provedor principal.",
    "NOT_IMPLEMENTED",
    501
  );
}
