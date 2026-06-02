/**
 * src/lib/env.ts
 *
 * Validação centralizada e type-safe das variáveis de ambiente do IP3D.
 * Este arquivo garante que o sistema não inicie em produção com configurações
 * críticas ausentes ou inseguras.
 */

import { normalizeProviderName } from "./payments/provider-utils";

export type PaymentProvider = "mercadopago" | "infinitypay";

interface EnvConfig {
  // Core
  DATABASE_URL: string;
  SESSION_SECRET: string;
  NEXT_PUBLIC_SITE_URL: string;
  NODE_ENV: "development" | "production" | "test";

  // Payment General
  PAYMENT_PROVIDER: PaymentProvider;

  // Mercado Pago
  MERCADO_PAGO_ACCESS_TOKEN?: string;
  MERCADO_PAGO_WEBHOOK_SECRET?: string;
  MERCADO_PAGO_WEBHOOK_URL?: string;

  // InfinityPay
  INFINITYPAY_HANDLE?: string;
  INFINITYPAY_API_KEY?: string;
  INFINITYPAY_WEBHOOK_SECRET?: string;
  INFINITYPAY_REDIRECT_URL?: string;
  INFINITYPAY_WEBHOOK_URL?: string;

  // Notifications (Optional with fallbacks)
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM?: string;
  WEB3FORMS_ACCESS_KEY?: string;
  SALES_NOTIFICATION_EMAIL?: string;
  ADMIN_SETUP_SECRET?: string;
}

/**
 * Valida e extrai as variáveis de ambiente.
 * Lança erro em caso de inconsistência crítica.
 */
function buildEnvConfig(options?: { strict?: boolean }): EnvConfig {
  const strict = options?.strict ?? true;
  const nodeEnv = (process.env.NODE_ENV || "development") as EnvConfig["NODE_ENV"];
  const isProd = nodeEnv === "production";
  const isTest = nodeEnv === "test";
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  const allowMissing = !strict || isTest || isBuild;

  // Helpers de erro
  const missing = (key: string) => {
    if (allowMissing) return ""; // Não trava testes, build ou imports globais tolerantes
    throw new Error(`❌ Variável de ambiente obrigatória ausente: ${key}`);
  };

  // 1. Core
  const DATABASE_URL = process.env.DATABASE_URL || missing("DATABASE_URL");
  const SESSION_SECRET = process.env.SESSION_SECRET || missing("SESSION_SECRET");
  const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  // Validação SESSION_SECRET (Segurança)
  if (strict && !isTest && !isBuild && SESSION_SECRET.length < 32) {
    throw new Error("❌ SESSION_SECRET deve ter pelo menos 32 caracteres para garantir a segurança da sessão.");
  }
  if (strict && isProd && (
    SESSION_SECRET === "super-secret-placeholder" || 
    SESSION_SECRET === "CHANGE_ME_IN_PRODUCTION" ||
    SESSION_SECRET === "CHANGE_ME_IN_PRODUCTION_MUST_BE_32_CHARS"
  )) {
    throw new Error("❌ SESSION_SECRET inseguro detectado em ambiente de produção. Por favor, gere um segredo real.");
  }

  // 2. Pagamentos
  const PAYMENT_PROVIDER = normalizeProviderName(process.env.PAYMENT_PROVIDER) as PaymentProvider;

  const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const MERCADO_PAGO_WEBHOOK_SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  const MERCADO_PAGO_VALIDATE_WEBHOOK_SIGNATURE = process.env.MERCADO_PAGO_VALIDATE_WEBHOOK_SIGNATURE;

  const INFINITYPAY_HANDLE = process.env.INFINITYPAY_HANDLE;
  const INFINITYPAY_API_KEY = process.env.INFINITYPAY_API_KEY;
  const INFINITYPAY_WEBHOOK_SECRET = process.env.INFINITYPAY_WEBHOOK_SECRET;

  // Validação condicional por Provider
  if (strict && !isTest && !isBuild) {
    if (PAYMENT_PROVIDER === "mercadopago") {
      if (!MERCADO_PAGO_ACCESS_TOKEN) missing("MERCADO_PAGO_ACCESS_TOKEN");
    } else if (PAYMENT_PROVIDER === "infinitypay") {
      if (!INFINITYPAY_HANDLE) missing("INFINITYPAY_HANDLE");
      if (!INFINITYPAY_API_KEY) missing("INFINITYPAY_API_KEY");
    }
  }

  // 3. Notificações
  const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;

  return {
    DATABASE_URL,
    SESSION_SECRET,
    NEXT_PUBLIC_SITE_URL,
    NODE_ENV: nodeEnv,
    PAYMENT_PROVIDER,
    MERCADO_PAGO_ACCESS_TOKEN,
    MERCADO_PAGO_WEBHOOK_SECRET,
    MERCADO_PAGO_VALIDATE_WEBHOOK_SIGNATURE,
    MERCADO_PAGO_WEBHOOK_URL: process.env.MERCADO_PAGO_WEBHOOK_URL,
    INFINITYPAY_HANDLE,
    INFINITYPAY_API_KEY,
    INFINITYPAY_WEBHOOK_SECRET,
    INFINITYPAY_REDIRECT_URL: process.env.INFINITYPAY_REDIRECT_URL,
    INFINITYPAY_WEBHOOK_URL: process.env.INFINITYPAY_WEBHOOK_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM || process.env.SMTP_USER,
    WEB3FORMS_ACCESS_KEY: process.env.WEB3FORMS_ACCESS_KEY,
    SALES_NOTIFICATION_EMAIL: process.env.SALES_NOTIFICATION_EMAIL || process.env.NOTIFICATION_EMAIL,
    ADMIN_SETUP_SECRET: process.env.ADMIN_SETUP_SECRET,
  };
}

export function validateEnv(): EnvConfig {
  return buildEnvConfig({ strict: true });
}

// Singleton tipado para uso no servidor.
// Deve ser tolerante para não derrubar imports globais, páginas públicas,
// middleware ou deploys inteiros por causa de envs opcionais/feature-specific.
export const env = buildEnvConfig({ strict: false });
