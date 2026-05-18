import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

import { env } from "@/lib/env";

const accessToken = env.MERCADO_PAGO_ACCESS_TOKEN;

const config = accessToken ? new MercadoPagoConfig({ accessToken }) : null;

export const preferenceClient = config ? new Preference(config) : null;
export const paymentClient = config ? new Payment(config) : null;
