import test from "node:test";
import assert from "node:assert/strict";
import { normalizeProviderName } from "@/lib/payments/provider";
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
