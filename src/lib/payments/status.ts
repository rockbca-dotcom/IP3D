export type InternalPaymentStatus = "APPROVED" | "REJECTED" | "PAYMENT_PENDING";

export function mapInfinityStatus(rawStatus: string | null | undefined, paidAmount?: number | null): InternalPaymentStatus {
  const normalized = (rawStatus || "").trim().toLowerCase();
  if (normalized === "approved" || Number(paidAmount || 0) > 0) {
    return "APPROVED";
  }

  if (["rejected", "cancelled", "refunded", "charged_back"].includes(normalized)) {
    return "REJECTED";
  }

  return "PAYMENT_PENDING";
}
