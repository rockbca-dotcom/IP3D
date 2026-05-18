/**
 * tests/helpers/assert.ts
 *
 * Asserts customizados para o domínio do IP3D.
 *
 * Constroem sobre node:assert/strict e adicionam mensagens de erro
 * legíveis e verificações de domínio específico.
 */

import assert from "node:assert/strict";

// ---------------------------------------------------------------------------
// Asserts de objeto / shape
// ---------------------------------------------------------------------------

/**
 * Verifica que um objeto contém todas as chaves esperadas.
 * Útil para checar contratos de API sem importar dependências de schema.
 */
export function assertHasKeys<T extends object>(obj: T, keys: (keyof T)[], label = "object"): void {
  for (const key of keys) {
    assert.ok(
      key in obj,
      `${label} deve conter a chave "${String(key)}" — recebido: ${JSON.stringify(Object.keys(obj))}`
    );
  }
}

/**
 * Verifica que um valor é uma string não vazia.
 */
export function assertNonEmptyString(value: unknown, label = "value"): void {
  assert.ok(typeof value === "string", `${label} deve ser string, recebido: ${typeof value}`);
  assert.ok(value.trim().length > 0, `${label} não deve ser string vazia`);
}

/**
 * Verifica que um valor é um número positivo (> 0).
 */
export function assertPositiveNumber(value: unknown, label = "value"): void {
  assert.ok(typeof value === "number", `${label} deve ser number, recebido: ${typeof value}`);
  assert.ok(Number.isFinite(value), `${label} deve ser finito, recebido: ${value}`);
  assert.ok(value > 0, `${label} deve ser > 0, recebido: ${value}`);
}

// ---------------------------------------------------------------------------
// Asserts de domínio de pagamento
// ---------------------------------------------------------------------------

export type InternalPaymentStatus = "APPROVED" | "REJECTED" | "PAYMENT_PENDING";

const VALID_PAYMENT_STATUSES: InternalPaymentStatus[] = ["APPROVED", "REJECTED", "PAYMENT_PENDING"];

/**
 * Verifica que um valor é um status de pagamento interno válido.
 */
export function assertValidPaymentStatus(value: unknown, label = "paymentStatus"): void {
  assert.ok(
    VALID_PAYMENT_STATUSES.includes(value as InternalPaymentStatus),
    `${label} deve ser um dos valores [${VALID_PAYMENT_STATUSES.join(", ")}], recebido: "${value}"`
  );
}

// ---------------------------------------------------------------------------
// Asserts de resposta de API (shape de erro e sucesso)
// ---------------------------------------------------------------------------

export interface ApiErrorShape {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Verifica que um objeto tem a shape de erro estruturada da API do IP3D.
 */
export function assertApiError(body: unknown, label = "response"): asserts body is ApiErrorShape {
  assert.ok(body !== null && typeof body === "object", `${label} deve ser um objeto`);
  const b = body as any;
  assert.strictEqual(b.success, false, `${label}.success deve ser false`);
  assert.ok(b.error && typeof b.error === "object", `${label}.error deve ser um objeto`);
  assertNonEmptyString(b.error.code, `${label}.error.code`);
  assertNonEmptyString(b.error.message, `${label}.error.message`);
}

// ---------------------------------------------------------------------------
// Asserts de order code
// ---------------------------------------------------------------------------

/**
 * Verifica que um código de pedido segue o padrão XX-NNNNNN.
 */
export function assertOrderCode(code: unknown, label = "orderCode"): void {
  assertNonEmptyString(code, label);
  assert.match(
    code as string,
    /^[A-Z]{2}-\d{6}$/,
    `${label} deve seguir o padrão XX-NNNNNN, recebido: "${code}"`
  );
}
