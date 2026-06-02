/**
 * tests/unit/env-validation.test.ts
 *
 * Testes unitários para a validação de variáveis de ambiente.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateEnv } from "@/lib/env";

describe("validateEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    // Restaura env básico para cada teste
    process.env = {
      ...originalEnv,
      NODE_ENV: "development",
      DATABASE_URL: "postgresql://localhost:5432/test",
      SESSION_SECRET: "a_very_long_secret_with_more_than_32_chars",
      PAYMENT_PROVIDER: "mercadopago",
      MERCADO_PAGO_ACCESS_TOKEN: "TEST-TOKEN",
    };
  });

  it("valida com sucesso um ambiente completo", () => {
    const config = validateEnv();
    expect(config.PAYMENT_PROVIDER).toBe("mercadopago");
    expect(config.SESSION_SECRET).toBe(process.env.SESSION_SECRET);
  });

  it("lança erro se DATABASE_URL estiver ausente", () => {
    delete process.env.DATABASE_URL;
    process.env.NODE_ENV = "development"; // Força validação (isTest=false)
    expect(() => validateEnv()).toThrow(/DATABASE_URL/);
  });

  it("lança erro se SESSION_SECRET for menor que 32 caracteres", () => {
    process.env.SESSION_SECRET = "curto";
    process.env.NODE_ENV = "development";
    expect(() => validateEnv()).toThrow(/32 caracteres/);
  });

  it("lança erro se SESSION_SECRET for placeholder em produção", () => {
    process.env.SESSION_SECRET = "CHANGE_ME_IN_PRODUCTION_MUST_BE_32_CHARS";
    process.env.NODE_ENV = "production";
    expect(() => validateEnv()).toThrow(/inseguro/);
  });

  it("exige MERCADO_PAGO_ACCESS_TOKEN se o provider for mercadopago", () => {
    process.env.PAYMENT_PROVIDER = "mercadopago";
    delete process.env.MERCADO_PAGO_ACCESS_TOKEN;
    process.env.NODE_ENV = "development";
    expect(() => validateEnv()).toThrow(/MERCADO_PAGO_ACCESS_TOKEN/);
  });

  it("exige INFINITYPAY_HANDLE se o provider for infinitypay", () => {
    process.env.PAYMENT_PROVIDER = "infinitypay";
    delete process.env.INFINITYPAY_HANDLE;
    process.env.NODE_ENV = "development";
    expect(() => validateEnv()).toThrow(/INFINITYPAY_HANDLE/);
  });

  it("não lança erro em ambiente de teste (isTest=true)", () => {
    process.env.NODE_ENV = "test";
    delete process.env.DATABASE_URL;
    // No modo test, a função retorna strings vazias em vez de lançar erro para não quebrar runners
    const config = validateEnv();
    expect(config.DATABASE_URL).toBe("");
  });

  it("singleton env tolera imports globais com envs ausentes em produção", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.DATABASE_URL;
    delete process.env.MERCADO_PAGO_ACCESS_TOKEN;

    vi.resetModules();
    const mod = await import("@/lib/env");

    expect(mod.env.NODE_ENV).toBe("production");
    expect(mod.env.DATABASE_URL).toBe("");
    expect(mod.env.MERCADO_PAGO_ACCESS_TOKEN).toBeUndefined();
  });
});
