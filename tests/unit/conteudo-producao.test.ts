import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Auditoria de Revisão de Conteúdo e SEO de Produção - TASK-45", () => {
  it("deve validar que o manual de conteúdo docs/CONTEUDO-PRODUCAO.md existe no repositório", () => {
    const docPath = path.resolve(__dirname, "../../docs/CONTEUDO-PRODUCAO.md");
    expect(fs.existsSync(docPath)).toBe(true);
  });

  it("deve validar que o manual de conteúdo cobre todas as seções obrigatórias exigidas", () => {
    const docPath = path.resolve(__dirname, "../../docs/CONTEUDO-PRODUCAO.md");
    const content = fs.readFileSync(docPath, "utf-8");

    // Validação de seções críticas de Conteúdo e SEO
    expect(content).toContain("Checklist de Catálogo e Produtos");
    expect(content).toContain("Banners, Home e CMS Dinâmico");
    expect(content).toContain("Otimização de SEO e Links");
    expect(content).toContain("Textos Legais e Termos");
    expect(content).toContain("Critérios Go/No-Go de Conteúdo");
    expect(content).toContain("politica-de-privacidade");
    expect(content).toContain("termos-de-uso");
  });
});
