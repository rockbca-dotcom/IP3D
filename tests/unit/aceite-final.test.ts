import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Auditoria de Termo de Aceite Executivo e Entrega - TASK-47", () => {
  it("deve validar que o manual de aceite docs/ACEITE-FINAL.md existe no repositório", () => {
    const docPath = path.resolve(__dirname, "../../docs/ACEITE-FINAL.md");
    expect(fs.existsSync(docPath)).toBe(true);
  });

  it("deve validar que o manual de aceite cobre todas as seções obrigatórias exigidas", () => {
    const docPath = path.resolve(__dirname, "../../docs/ACEITE-FINAL.md");
    const content = fs.readFileSync(docPath, "utf-8");

    // Validação de seções críticas do manual de aceite executivo
    expect(content).toContain("Resumo Executivo e Escopo Entregue");
    expect(content).toContain("Status Técnico de Qualidade e Sprints");
    expect(content).toContain("Checklist Executivo de Aceite Final");
    expect(content).toContain("Gestão de Pendências e Riscos Aceitos");
    expect(content).toContain("Termo Formal de Aprovação e Assinatura");
    expect(content).toContain("Representante de Engenharia / Tech Lead (IP3D)");
    expect(content).toContain("Representante de Negócios / Product Owner (IP3D)");
    expect(content).toContain("Diretoria Executiva / Stakeholder (IP3D)");
  });
});
