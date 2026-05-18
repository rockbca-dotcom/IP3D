import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseSeedArgs, validateEnvironment } from "../../scripts/seed-utils";
import { isPasswordSecure } from "../../scripts/create-admin";

describe("Seed Utilities - Validação de Ambiente e Argumentos", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`Process exited with code ${code}`);
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("deve analisar corretamente as flags --confirm e --dry-run", () => {
    const res1 = parseSeedArgs(["--confirm"]);
    expect(res1.confirm).toBe(true);
    expect(res1.dryRun).toBe(false);

    const res2 = parseSeedArgs(["--dry-run"]);
    expect(res2.confirm).toBe(false);
    expect(res2.dryRun).toBe(true);

    const res3 = parseSeedArgs(["--confirm", "--dry-run"]);
    expect(res3.confirm).toBe(true);
    expect(res3.dryRun).toBe(true);
  });

  it("deve rejeitar se DATABASE_URL estiver ausente", () => {
    delete process.env.DATABASE_URL;
    expect(() => validateEnvironment("teste-seed.js", { confirm: false, dryRun: false }))
      .toThrow("Process exited with code 1");
  });

  it("deve rejeitar se DATABASE_URL estiver malformada", () => {
    process.env.DATABASE_URL = "invalid-format";
    expect(() => validateEnvironment("teste-seed.js", { confirm: false, dryRun: false }))
      .toThrow("Process exited with code 1");
  });

  it("deve bloquear execução em produção sem a flag --confirm", () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/db";
    process.env.NODE_ENV = "production";
    
    expect(() => validateEnvironment("teste-seed.js", { confirm: false, dryRun: false }))
      .toThrow("Process exited with code 1");
  });

  it("deve permitir execução em produção se houver --confirm", () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/db";
    process.env.NODE_ENV = "production";
    
    expect(() => validateEnvironment("teste-seed.js", { confirm: true, dryRun: false }))
      .not.toThrow();
  });

  it("deve permitir execução em produção se for --dry-run", () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/db";
    process.env.NODE_ENV = "production";
    
    expect(() => validateEnvironment("teste-seed.js", { confirm: false, dryRun: true }))
      .not.toThrow();
  });
});

describe("Create Admin - Requisitos de Senha Segura", () => {
  it("deve validar força de senha com sucesso", () => {
    expect(isPasswordSecure("Ip3d@2026")).toBe(false); // menos de 12 caracteres
    expect(isPasswordSecure("ip3d@202612345")).toBe(false); // sem maiúscula
    expect(isPasswordSecure("IP3D@202612345")).toBe(false); // sem minúscula
    expect(isPasswordSecure("Ip3d2026123456")).toBe(false); // sem caractere especial
    expect(isPasswordSecure("Ip3d_Grande_2026")).toBe(true); // atende a todos os requisitos
  });
});
