import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Auditoria de Protocolo Go-Live e Publicação - TASK-44", () => {
  it("deve validar que o manual de go-live docs/GO-LIVE.md existe no repositório", () => {
    const docPath = path.resolve(__dirname, "../../docs/GO-LIVE.md");
    expect(fs.existsSync(docPath)).toBe(true);
  });

  it("deve validar que o manual de go-live cobre todas as seções obrigatórias exigidas", () => {
    const docPath = path.resolve(__dirname, "../../docs/GO-LIVE.md");
    const content = fs.readFileSync(docPath, "utf-8");

    // Validação de seções críticas do Go-Live
    expect(content).toContain("Planejamento e Janela de Deploy");
    expect(content).toContain("Estágio 1: Pré-Go-Live");
    expect(content).toContain("Estágio 2: Durante o Deploy");
    expect(content).toContain("Estágio 3: Pós-Go-Live");
    expect(content).toContain("Critérios de Decisão (Go/No-Go)");
    expect(content).toContain("Protocolo de Rollback Imediato");
    expect(content).toContain("pnpm db:backup");
    expect(content).toContain("pnpm db:deploy");
  });
});
