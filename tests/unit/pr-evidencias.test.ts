import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Auditoria de Relatório de Evidências de Gold Release - TASK-48-PR", () => {
  it("deve validar que o manual de evidências docs/PR-EVIDENCIAS-GOLD-RELEASE.md existe no repositório", () => {
    const docPath = path.resolve(__dirname, "../../docs/PR-EVIDENCIAS-GOLD-RELEASE.md");
    expect(fs.existsSync(docPath)).toBe(true);
  });

  it("deve validar que o manual de evidências cobre todas as seções obrigatórias exigidas", () => {
    const docPath = path.resolve(__dirname, "../../docs/PR-EVIDENCIAS-GOLD-RELEASE.md");
    const content = fs.readFileSync(docPath, "utf-8");

    // Validação de seções críticas do manual de evidências de release
    expect(content).toContain("Evidências Técnicas e Operacionais de Gold Release");
    expect(content).toContain("Dados Cronológicos da Validação");
    expect(content).toContain("Prisma Schema Validation");
    expect(content).toContain("Prisma Client Generation");
    expect(content).toContain("Execução de Testes Automatizados");
    expect(content).toContain("Análise Estática de Código");
    expect(content).toContain("Declaração do Technical Freeze e Segurança");
    expect(content).toContain("Confirmação de Não-Merge");
    expect(content).toContain("Confirmação de Não-Deploy");
  });
});
