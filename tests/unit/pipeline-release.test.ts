import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Auditoria de Pipeline CI/CD, Deploy e Release - TASK-40", () => {
  it("deve validar que o arquivo workflow ci.yml existe e cobre todas as etapas de qualidade obrigatórias", () => {
    const ciPath = path.resolve(__dirname, "../../.github/workflows/ci.yml");
    expect(fs.existsSync(ciPath)).toBe(true);

    const ciContent = fs.readFileSync(ciPath, "utf-8");

    // Etapas cruciais de setup e qualidade
    expect(ciContent).toContain("actions/checkout");
    expect(ciContent).toContain("pnpm install");
    expect(ciContent).toContain("prisma validate");
    expect(ciContent).toContain("prisma generate");
    expect(ciContent).toContain("pnpm db:deploy");
    expect(ciContent).toContain("pnpm seed:dev");
    expect(ciContent).toContain("pnpm test:coverage");
    expect(ciContent).toContain("pnpm lint");
    expect(ciContent).toContain("pnpm build");
  });

  it("deve validar que o package.json possui os atalhos operacionais de deploy, backup/restore e seeds seguros", () => {
    const packageJsonPath = path.resolve(__dirname, "../../package.json");
    expect(fs.existsSync(packageJsonPath)).toBe(true);

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const scripts = packageJson.scripts || {};

    // Comandos de resiliência e segurança
    expect(scripts["db:backup"]).toBeDefined();
    expect(scripts["db:backup:dry-run"]).toBeDefined();
    expect(scripts["db:restore"]).toBeDefined();
    expect(scripts["db:restore:dry-run"]).toBeDefined();
    expect(scripts["db:deploy"]).toBeDefined();
    
    // Comandos de seeds e admin seguros
    expect(scripts["seed:dev"]).toBeDefined();
    expect(scripts["seed:prod"]).toBeDefined();
    expect(scripts["seed:prod:safe"]).toBeDefined();
    expect(scripts["create-admin:safe"]).toBeDefined();

    // Comandos de empacotamento
    expect(scripts["deploy:hostinger"]).toBeDefined();
  });

  it("deve validar a existência dos manuais de deploy, segurança, release candidate, homologação, gestão de bugs, handoff, go-live e conteúdo na pasta de documentações", () => {
    const documents = [
      "docs/CHECKLIST-PRODUCAO.md",
      "docs/SCRIPTS.md",
      "docs/VARIAVEIS-AMBIENTE.md",
      "docs/RELEASE-CANDIDATE.md",
      "docs/HOMOLOGACAO-STAGING.md",
      "docs/BUGS-RC.md",
      "docs/HANDOFF.md",
      "docs/GO-LIVE.md",
      "docs/CONTEUDO-PRODUCAO.md",
      "docs/OPERACAO-COMERCIAL.md",
      "docs/ACEITE-FINAL.md",
      "docs/ENCERRAMENTO-ROADMAP.md",
      "docs/PR-EVIDENCIAS-GOLD-RELEASE.md",
      "DEPLOY.md"
    ];

    documents.forEach((doc) => {
      const docPath = path.resolve(__dirname, `../../${doc}`);
      expect(fs.existsSync(docPath)).toBe(true);
    });
  });
});
