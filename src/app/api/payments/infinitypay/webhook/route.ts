import { apiError } from "@/lib/api-utils";

export async function POST() {
  return apiError(
    "O webhook do InfinityPay não está ativo ou está descontinuada.",
    "NOT_IMPLEMENTED",
    501
  );
}
