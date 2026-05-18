import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Definição dos mocks de banco do Prisma
const mockPageViewDeleteMany = vi.fn();
const mockPageViewCount = vi.fn();
const mockClickDeleteMany = vi.fn();
const mockClickCount = vi.fn();
const mockDisconnect = vi.fn();

vi.mock("@prisma/client", () => {
  return {
    PrismaClient: class {
      pageView = {
        deleteMany: mockPageViewDeleteMany,
        count: mockPageViewCount,
      };
      click = {
        deleteMany: mockClickDeleteMany,
        count: mockClickCount,
      };
      $disconnect = mockDisconnect;
    },
  };
});

describe("Script de Retenção e Limpeza — scripts/analytics-cleanup.ts", () => {
  const originalArgv = process.argv;
  const originalExit = process.exit;
  const originalEnv = process.env.ANALYTICS_RETENTION_DAYS;

  beforeEach(() => {
    vi.clearAllMocks();
    process.exit = vi.fn() as any;
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.argv = originalArgv;
    process.exit = originalExit;
    process.env.ANALYTICS_RETENTION_DAYS = originalEnv;
    // Reseta o cache de modulos para permitir multiplos imports dinamicos do script executável
    vi.resetModules();
  });

  it("deve executar em modo dry-run (simulação) contando registros sem apagar dados do banco", async () => {
    process.argv = ["node", "scripts/analytics-cleanup.ts", "--days", "180", "--dry-run"];
    
    mockPageViewCount.mockResolvedValue(150);
    mockClickCount.mockResolvedValue(45);

    // Import dinâmico dispara a função main do script executável
    await import("../../scripts/analytics-cleanup");

    expect(mockPageViewCount).toHaveBeenCalled();
    expect(mockClickCount).toHaveBeenCalled();
    expect(mockPageViewDeleteMany).not.toHaveBeenCalled();
    expect(mockClickDeleteMany).not.toHaveBeenCalled();
    expect(process.exit).not.toHaveBeenCalled();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("deve executar a limpeza real e apagar dados de analytics anteriores à data de corte", async () => {
    process.argv = ["node", "scripts/analytics-cleanup.ts", "--days", "90"];

    mockPageViewDeleteMany.mockResolvedValue({ count: 50 });
    mockClickDeleteMany.mockResolvedValue({ count: 15 });

    await import("../../scripts/analytics-cleanup");

    expect(mockPageViewDeleteMany).toHaveBeenCalledWith({
      where: {
        createdAt: {
          lt: expect.any(Date),
        },
      },
    });

    expect(mockClickDeleteMany).toHaveBeenCalledWith({
      where: {
        createdAt: {
          lt: expect.any(Date),
        },
      },
    });

    // Garante que o cálculo da data de corte (approx 90 dias atrás) foi feito corretamente
    const calledDate = mockPageViewDeleteMany.mock.calls[0][0].where.createdAt.lt;
    const diffTime = Math.abs(Date.now() - calledDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    expect(diffDays).toBeGreaterThanOrEqual(89);
    expect(diffDays).toBeLessThanOrEqual(91);

    expect(process.exit).not.toHaveBeenCalled();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it("deve falhar e chamar process.exit(1) caso a flag --days possua formato não numérico", async () => {
    process.argv = ["node", "scripts/analytics-cleanup.ts", "--days", "invalido"];

    await import("../../scripts/analytics-cleanup");

    expect(process.exit).toHaveBeenCalledWith(1);
    expect(mockPageViewDeleteMany).not.toHaveBeenCalled();
    expect(mockClickDeleteMany).not.toHaveBeenCalled();
  });

  it("deve falhar e chamar process.exit(1) caso a flag --days possua valor negativo ou igual a zero", async () => {
    process.argv = ["node", "scripts/analytics-cleanup.ts", "--days", "-10"];

    await import("../../scripts/analytics-cleanup");

    expect(process.exit).toHaveBeenCalledWith(1);

    vi.resetModules();
    process.argv = ["node", "scripts/analytics-cleanup.ts", "--days", "0"];
    
    await import("../../scripts/analytics-cleanup");
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("deve utilizar a variável de ambiente ANALYTICS_RETENTION_DAYS como fallback de configuração", async () => {
    process.argv = ["node", "scripts/analytics-cleanup.ts"];
    process.env.ANALYTICS_RETENTION_DAYS = "30";

    mockPageViewDeleteMany.mockResolvedValue({ count: 10 });
    mockClickDeleteMany.mockResolvedValue({ count: 5 });

    await import("../../scripts/analytics-cleanup");

    expect(mockPageViewDeleteMany).toHaveBeenCalled();
    
    const calledDate = mockPageViewDeleteMany.mock.calls[0][0].where.createdAt.lt;
    const diffTime = Math.abs(Date.now() - calledDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    expect(diffDays).toBeGreaterThanOrEqual(29);
    expect(diffDays).toBeLessThanOrEqual(31);

    expect(process.exit).not.toHaveBeenCalled();
  });
});
