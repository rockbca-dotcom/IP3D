import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseArgs as parseBackupArgs, getDatabaseConfig as getBackupConfig } from "../../scripts/backup-db";
import { parseArgs as parseRestoreArgs, getDatabaseConfig as getRestoreConfig } from "../../scripts/restore-db";

describe("Script de Backup - Validação de Argumentos e Configuração", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("deve analisar corretamente os argumentos do backup", () => {
    const res1 = parseBackupArgs(["--dry-run"]);
    expect(res1.dryRun).toBe(true);
    expect(res1.output).toBeNull();

    const res2 = parseBackupArgs(["--output", "meu_caminho.sql"]);
    expect(res2.dryRun).toBe(false);
    expect(res2.output).toBe("meu_caminho.sql");

    const res3 = parseBackupArgs(["--dry-run", "--output", "teste.sql"]);
    expect(res3.dryRun).toBe(true);
    expect(res3.output).toBe("teste.sql");
  });

  it("deve extrair credenciais do banco corretamente a partir da DATABASE_URL", () => {
    process.env.DATABASE_URL = "postgresql://meu_usuario:minha_senha_123@dbhost.com:9999/meu_banco";

    const config = getBackupConfig();
    expect(config.username).toBe("meu_usuario");
    expect(config.password).toBe("minha_senha_123");
    expect(config.host).toBe("dbhost.com");
    expect(config.port).toBe("9999");
    expect(config.database).toBe("meu_banco");
  });

  it("deve lançar erro se DATABASE_URL estiver ausente ou inválida", () => {
    delete process.env.DATABASE_URL;
    expect(() => getBackupConfig()).toThrow("DATABASE_URL não está configurada");

    process.env.DATABASE_URL = "invalid-url-format";
    expect(() => getBackupConfig()).toThrow("DATABASE_URL com formato inválido");
  });
});

describe("Script de Restauração - Validação de Argumentos e Confirmação", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("deve analisar corretamente os argumentos da restauração", () => {
    const res1 = parseRestoreArgs(["--file", "dump.sql", "--confirm"]);
    expect(res1.file).toBe("dump.sql");
    expect(res1.confirm).toBe(true);
    expect(res1.dryRun).toBe(false);

    const res2 = parseRestoreArgs(["--file", "outro.sql", "--dry-run"]);
    expect(res2.file).toBe("outro.sql");
    expect(res2.confirm).toBe(false);
    expect(res2.dryRun).toBe(true);
  });

  it("deve extrair credenciais do banco no restore com sucesso", () => {
    process.env.DATABASE_URL = "postgresql://prod_user:prod_pass@127.0.0.1:5432/prod_db";

    const config = getRestoreConfig();
    expect(config.username).toBe("prod_user");
    expect(config.password).toBe("prod_pass");
    expect(config.host).toBe("127.0.0.1");
    expect(config.port).toBe("5432");
    expect(config.database).toBe("prod_db");
  });
});
