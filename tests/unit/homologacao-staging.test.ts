import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Auditoria de Homologação Funcional E2E em Staging - TASK-41", () => {
  it("deve validar que o manual de homologação de staging existe no diretório docs", () => {
    const docPath = path.resolve(__dirname, "../../docs/HOMOLOGACAO-STAGING.md");
    expect(fs.existsSync(docPath)).toBe(true);
  });

  it("deve validar que o manual de staging cobre todas as seções obrigatórias exigidas", () => {
    const docPath = path.resolve(__dirname, "../../docs/HOMOLOGACAO-STAGING.md");
    const content = fs.readFileSync(docPath, "utf-8");

    // Validação das seções críticas do roteiro
    expect(content).toContain("Roteiro Funcional E2E");
    expect(content).toContain("Mercado Pago Sandbox");
    expect(content).toContain("Simulação de Webhook");
    expect(content).toContain("InventoryLog");
    expect(content).toContain("Checklist de Evidências Obrigatórias");
    expect(content).toContain("Critérios de Go/No-Go");
    expect(content).toContain("Procedimento de Rollback de Homologação");
  });
});
