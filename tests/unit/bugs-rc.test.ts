import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Auditoria de Gestão de Bugs e Estabilização de RC - TASK-42", () => {
  it("deve validar que o manual de gestão de bugs docs/BUGS-RC.md existe no repositório", () => {
    const docPath = path.resolve(__dirname, "../../docs/BUGS-RC.md");
    expect(fs.existsSync(docPath)).toBe(true);
  });

  it("deve validar que o manual de bugs cobre todas as seções obrigatórias exigidas", () => {
    const docPath = path.resolve(__dirname, "../../docs/BUGS-RC.md");
    const content = fs.readFileSync(docPath, "utf-8");

    // Validação das seções e campos do checklist de triagem
    expect(content).toContain("Fluxo de Triagem");
    expect(content).toContain("SLAs de Correção");
    expect(content).toContain("Template Oficial de Bug Report");
    expect(content).toContain("Critérios de Reteste e Regressão");
    expect(content).toContain("Declaração Formal de Technical Freeze");
    expect(content).toContain("vX.Y.Z-rcN");
  });
});
