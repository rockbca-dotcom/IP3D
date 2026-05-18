/**
 * tests/payments.test.ts — ARQUIVO LEGADO PRESERVADO
 *
 * Este arquivo existe para manter compatibilidade com referências externas.
 * Os testes originais foram PRESERVADOS INTEGRALMENTE aqui (5/5 passando).
 * Versão expandida com mais cobertura em: tests/unit/payments-provider.test.ts
 *
 * NÃO remover este arquivo — ele é coberto pelo glob tests/**\/*.test.ts
 */

import { test } from "vitest";
import assert from "node:assert/strict";
import { normalizeProviderName } from "@/lib/payments/provider-utils";
import { mapInfinityStatus } from "@/lib/payments/status";

test("normalizeProviderName falls back to mercadopago", () => {
  assert.equal(normalizeProviderName(undefined), "mercadopago");
  assert.equal(normalizeProviderName(""), "mercadopago");
  assert.equal(normalizeProviderName("unknown"), "mercadopago");
});

test("normalizeProviderName accepts infinitypay", () => {
  assert.equal(normalizeProviderName("infinitypay"), "infinitypay");
  assert.equal(normalizeProviderName("InfinityPay"), "infinitypay");
});

test("mapInfinityStatus handles approved and paid fallback", () => {
  assert.equal(mapInfinityStatus("approved", 0), "APPROVED");
  assert.equal(mapInfinityStatus(undefined, 100), "APPROVED");
});

test("mapInfinityStatus handles rejected statuses", () => {
  assert.equal(mapInfinityStatus("rejected", 0), "REJECTED");
  assert.equal(mapInfinityStatus("cancelled", 0), "REJECTED");
  assert.equal(mapInfinityStatus("refunded", 0), "REJECTED");
  assert.equal(mapInfinityStatus("charged_back", 0), "REJECTED");
});

test("mapInfinityStatus defaults to pending", () => {
  assert.equal(mapInfinityStatus("processing", 0), "PAYMENT_PENDING");
  assert.equal(mapInfinityStatus(undefined, 0), "PAYMENT_PENDING");
});
