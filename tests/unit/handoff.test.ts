import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Auditoria de Handoff Operacional e Entrega Final - TASK-43", () => {
  it("deve validar que o manual de handoff docs/HANDOFF.md existe no repositório", () => {
    const docPath = path.resolve(__dirname, "../../docs/HANDOFF.md");
    expect(fs.existsSync(docPath)).toBe(true);
  });

  it("deve validar que o manual de handoff cobre todas as seções obrigatórias exigidas", () => {
    const docPath = path.resolve(__dirname, "../../docs/HANDOFF.md");
    const content = fs.readFileSync(docPath, "utf-8");

    // Validação de seções críticas do handoff
    expect(content).toContain("Visão Geral e Arquitetura do Sistema");
    expect(content).toContain("Rotinas Operacionais e Comandos Principais");
    expect(content).toContain("Troubleshooting Rápido");
    expect(content).toContain("Índice Final e Mapa de Documentos");
    expect(content).toContain("Checklist de Entrega Final");
    expect(content).toContain("db:backup");
    expect(content).toContain("db:restore");
  });
});
