import { NextRequest, NextResponse } from "next/server";
import { prepareCheckout, toCheckoutErrorResponse } from "@/lib/payments/checkout";
import { getMercadoPagoProvider } from "@/lib/payments/providers/mercadopago-provider";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const prepared = await prepareCheckout(payload);
    const checkout = await getMercadoPagoProvider().createCheckout(prepared);

    return NextResponse.json({
      preferenceId: checkout.providerOrderId ?? null,
      initPoint: checkout.redirectUrl,
      sandboxInitPoint: null,
      orderCode: prepared.order.code,
      subtotal: prepared.order.subtotal,
      shippingCost: prepared.order.shippingCost,
      total: prepared.order.total,
    });
  } catch (error) {
    const checkoutError = toCheckoutErrorResponse(error);
    return NextResponse.json({ error: checkoutError.message }, { status: checkoutError.status });
  }
}
