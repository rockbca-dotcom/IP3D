import { NextRequest, NextResponse } from "next/server";
import { prepareCheckout, toCheckoutErrorResponse } from "@/lib/payments/checkout";
import { getPaymentProvider, getPaymentProviderName } from "@/lib/payments/provider";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const prepared = await prepareCheckout(payload);
    const providerName = getPaymentProviderName();
    const provider = getPaymentProvider();
    const checkout = await provider.createCheckout(prepared);

    if (!checkout.redirectUrl) {
      return NextResponse.json({ error: "Nao foi possivel gerar o link de pagamento." }, { status: 500 });
    }

    return NextResponse.json({
      provider: providerName,
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
