import { NextRequest, NextResponse } from "next/server";
import { prepareCheckout, toCheckoutErrorResponse } from "@/lib/payments/checkout";
import { getInfinityPayProvider } from "@/lib/payments/providers/infinitypay-provider";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const prepared = await prepareCheckout(payload);
    const checkout = await getInfinityPayProvider().createCheckout(prepared);

    return NextResponse.json({
      provider: "infinitypay",
      redirectUrl: checkout.redirectUrl,
      orderCode: prepared.order.code,
      subtotal: prepared.order.subtotal,
      shippingCost: prepared.order.shippingCost,
      total: prepared.order.total,
      providerOrderId: checkout.providerOrderId ?? null,
    });
  } catch (error) {
    const checkoutError = toCheckoutErrorResponse(error);
    return NextResponse.json({ error: checkoutError.message }, { status: checkoutError.status });
  }
}
