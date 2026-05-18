import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Auditoria de Relatório de Encerramento do Roadmap - TASK-48", () => {
  it("deve validar que o manual de encerramento docs/ENCERRAMENTO-ROADMAP.md existe no repositório", () => {
    const docPath = path.resolve(__dirname, "../../docs/ENCERRAMENTO-ROADMAP.md");
    expect(fs.existsSync(docPath)).toBe(true);
  });

  it("deve validar que o manual de encerramento cobre todas as seções obrigatórias exigidas", () => {
    const docPath = path.resolve(__dirname, "../../docs/ENCERRAMENTO-ROADMAP.md");
    const content = fs.readFileSync(docPath, "utf-8");

    // Validação de seções críticas do manual de encerramento do roadmap
    expect(content).toContain("Relatório de Encerramento do Roadmap");
    expect(content).toContain("Garantias de Qualidade e Confiabilidade Técnica");
    expect(content).toContain("Mapa de Manuais e Documentos Criados");
    expect(content).toContain("Declaração Formal de Fechamento de Sprints e Freeze");
    expect(content).toContain("Decreto Formal de Autorização de Go-Live");
    expect(content).toContain("100% de conclusão");
    expect(content).toContain("48/48");
    expect(content).toContain("GOLD RELEASE");
  });
});
