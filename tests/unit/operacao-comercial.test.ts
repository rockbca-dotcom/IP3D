import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Auditoria de Operação Comercial e Pós-Venda - TASK-46", () => {
  it("deve validar que o manual comercial docs/OPERACAO-COMERCIAL.md existe no repositório", () => {
    const docPath = path.resolve(__dirname, "../../docs/OPERACAO-COMERCIAL.md");
    expect(fs.existsSync(docPath)).toBe(true);
  });

  it("deve validar que o manual comercial cobre todas as seções obrigatórias exigidas", () => {
    const docPath = path.resolve(__dirname, "../../docs/OPERACAO-COMERCIAL.md");
    const content = fs.readFileSync(docPath, "utf-8");

    // Validação de seções críticas do manual comercial
    expect(content).toContain("Protocolo Financeiro");
    expect(content).toContain("Protocolo Fiscal");
    expect(content).toContain("SLAs e Canais de Atendimento");
    expect(content).toContain("Fluxo Operacional de Pedidos");
    expect(content).toContain("Go/No-Go de Liberação Comercial");
    expect(content).toContain("PENDING");
    expect(content).toContain("PROCESSING");
    expect(content).toContain("SHIPPED");
    expect(content).toContain("DELIVERED");
  });
});
