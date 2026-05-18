/**
 * tests/unit/utils.test.ts
 *
 * Testes unitários de src/lib/utils.ts
 *
 * Camada: UNIT — sem dependências externas, sem I/O, sem banco.
 * Padrão Red→Green→Refactor: cada test descreve um comportamento.
 */

import { test, describe } from "vitest";
import assert from "node:assert/strict";
import { formatBRL, generateOrderCode } from "@/lib/utils";
import { assertOrderCode } from "../helpers/assert.js";

describe("formatBRL", () => {
  test("formata valor positivo em reais brasileiros", () => {
    const result = formatBRL(199.9);
    // O formato exato varia por locale do SO, mas deve conter "199" e ","
    assert.ok(typeof result === "string", "deve retornar string");
    assert.ok(result.includes("199"), `deve conter o valor 199, recebido: "${result}"`);
    assert.ok(result.includes("R$") || result.includes("BRL"), `deve conter símbolo de moeda, recebido: "${result}"`);
  });

  test("formata zero como R$ 0,00", () => {
    const result = formatBRL(0);
    assert.ok(typeof result === "string");
    assert.ok(result.includes("0"), `deve conter 0, recebido: "${result}"`);
  });

  test("retorna null para null", () => {
    assert.equal(formatBRL(null), null);
  });

  test("retorna null para undefined", () => {
    assert.equal(formatBRL(undefined), null);
  });

  test("formata valores decimais com centavos", () => {
    const result = formatBRL(1234.56);
    assert.ok(typeof result === "string");
    // Deve conter "1" e "234" de alguma forma
    assert.ok(result.replace(/\D/g, "").includes("123456"), `deve conter dígitos de 1234,56, recebido: "${result}"`);
  });
});

describe("generateOrderCode", () => {
  test("gera código com prefixo padrão GT-", () => {
    const code = generateOrderCode();
    assertOrderCode(code, "código gerado");
    assert.ok(code.startsWith("GT-"), `deve começar com "GT-", recebido: "${code}"`);
  });

  test("respeita prefixo customizado", () => {
    const code = generateOrderCode("PD");
    assert.ok(code.startsWith("PD-"), `deve começar com "PD-", recebido: "${code}"`);
    assertOrderCode(code, "código com prefixo custom");
  });

  test("o sufixo numérico tem 6 dígitos", () => {
    const code = generateOrderCode();
    const [, suffix] = code.split("-");
    assert.equal(suffix.length, 6, `sufixo deve ter 6 dígitos, recebido: "${suffix}"`);
    assert.match(suffix, /^\d{6}$/, "sufixo deve ser numérico");
  });

  test("dois códigos gerados consecutivamente são diferentes com alta probabilidade", () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateOrderCode()));
    // Com range de 900.000 valores, 20 amostras devem produzir pelo menos 15 únicos
    assert.ok(codes.size >= 15, `devem haver códigos variados, recebido apenas ${codes.size} únicos em 20 chamadas`);
  });
});
