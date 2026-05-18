/**
 * tests/unit/payments-provider.test.ts
 *
 * Testes unitários dos utilitários de pagamento: normalizeProviderName e mapInfinityStatus.
 * Conteúdo migrado e expandido a partir de tests/payments.test.ts (legado).
 *
 * Camada: UNIT — sem I/O, sem banco, sem rede.
 */

import { test, describe } from "vitest";
import assert from "node:assert/strict";
import { normalizeProviderName } from "@/lib/payments/provider-utils";
import { getPaymentProviderName } from "@/lib/payments/provider";
import { mapInfinityStatus } from "@/lib/payments/status";
import { assertValidPaymentStatus } from "../helpers/assert";
import "../helpers/env";

describe("normalizeProviderName", () => {
  test("retorna mercadopago como fallback para undefined", () => {
    assert.equal(normalizeProviderName(undefined), "mercadopago");
  });

  test("retorna mercadopago como fallback para string vazia", () => {
    assert.equal(normalizeProviderName(""), "mercadopago");
  });

  test("retorna mercadopago como fallback para valor desconhecido", () => {
    assert.equal(normalizeProviderName("unknown"), "mercadopago");
    assert.equal(normalizeProviderName("stripe"), "mercadopago");
    assert.equal(normalizeProviderName("paypal"), "mercadopago");
  });

  test("aceita 'infinitypay' em lowercase", () => {
    assert.equal(normalizeProviderName("infinitypay"), "infinitypay");
  });

  test("aceita 'InfinityPay' case-insensitive", () => {
    assert.equal(normalizeProviderName("InfinityPay"), "infinitypay");
    assert.equal(normalizeProviderName("INFINITYPAY"), "infinitypay");
    assert.equal(normalizeProviderName("  InfinityPay  "), "infinitypay");
  });

  test("resultado sempre é um ProviderName válido", () => {
    const validProviders = ["mercadopago", "infinitypay"];
    const testValues = [undefined, "", "unknown", "mercadopago", "infinitypay", "InfinityPay"];
    for (const value of testValues) {
      const result = normalizeProviderName(value);
      assert.ok(validProviders.includes(result), `"${value}" deve retornar um provider válido, recebido: "${result}"`);
    }
  });
});

describe("getPaymentProviderName", () => {
  test("lê PAYMENT_PROVIDER do ambiente de teste (mercadopago)", () => {
    // env.ts configura PAYMENT_PROVIDER=mercadopago por padrão
    const name = getPaymentProviderName();
    assert.equal(name, "mercadopago");
  });

  test("lê PAYMENT_PROVIDER do ambiente de teste (mercadopago)", () => {
    // env.ts configura PAYMENT_PROVIDER=mercadopago por padrão no setup de testes
    const name = getPaymentProviderName();
    assert.equal(name, "mercadopago");
  });
});

describe("mapInfinityStatus", () => {
  test("retorna APPROVED para status 'approved'", () => {
    const result = mapInfinityStatus("approved", 0);
    assertValidPaymentStatus(result);
    assert.equal(result, "APPROVED");
  });

  test("retorna APPROVED quando paidAmount > 0 (independente do status textual)", () => {
    assert.equal(mapInfinityStatus(undefined, 100), "APPROVED");
    assert.equal(mapInfinityStatus("processing", 1), "APPROVED");
    assert.equal(mapInfinityStatus("pending", 0.01), "APPROVED");
  });

  test("retorna REJECTED para status de rejeição", () => {
    const rejectedStatuses = ["rejected", "cancelled", "refunded", "charged_back"];
    for (const status of rejectedStatuses) {
      const result = mapInfinityStatus(status, 0);
      assertValidPaymentStatus(result);
      assert.equal(result, "REJECTED", `"${status}" deve mapear para REJECTED`);
    }
  });

  test("retorna PAYMENT_PENDING como default para status desconhecido", () => {
    assert.equal(mapInfinityStatus("processing", 0), "PAYMENT_PENDING");
    assert.equal(mapInfinityStatus(undefined, 0), "PAYMENT_PENDING");
    assert.equal(mapInfinityStatus(null, 0), "PAYMENT_PENDING");
    assert.equal(mapInfinityStatus("", 0), "PAYMENT_PENDING");
  });

  test("resultado sempre é um status interno válido", () => {
    const inputs = [
      ["approved", 0],
      [undefined, 100],
      ["rejected", 0],
      ["processing", 0],
      ["charged_back", 0],
    ] as const;

    for (const [status, amount] of inputs) {
      assertValidPaymentStatus(mapInfinityStatus(status, amount));
    }
  });
});
