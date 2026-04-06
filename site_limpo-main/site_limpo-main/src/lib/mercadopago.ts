import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

if (!accessToken && process.env.NODE_ENV !== "production") {
  console.warn("MERCADO_PAGO_ACCESS_TOKEN is not configured. Mercado Pago integration will be disabled.");
}

const config = accessToken ? new MercadoPagoConfig({ accessToken }) : null;

export const preferenceClient = config ? new Preference(config) : null;
export const paymentClient = config ? new Payment(config) : null;
