import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface CleanupOptions {
  days: number;
  dryRun: boolean;
}

/**
 * Faz o parse e validação dos argumentos da CLI de forma robusta e segura.
 */
function parseArgs(): CleanupOptions | null {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  // Localiza e valida parametro --days
  const daysIndex = args.indexOf("--days");
  let daysStr = "";

  if (daysIndex !== -1 && daysIndex + 1 < args.length) {
    daysStr = args[daysIndex + 1];
  } else if (process.env.ANALYTICS_RETENTION_DAYS) {
    daysStr = process.env.ANALYTICS_RETENTION_DAYS;
  }

  // Janela padrão de retenção: 180 dias
  let days = 180;

  if (daysStr) {
    const parsed = Number(daysStr);
    if (isNaN(parsed) || !Number.isInteger(parsed) || parsed <= 0) {
      console.error("[ERRO] O parâmetro '--days' deve ser um número inteiro positivo maior que zero.");
      process.exit(1);
      return null;
    }
    days = parsed;
  }

  return { days, dryRun };
}

async function main() {
  const options = parseArgs();
  if (!options) return;

  const { days, dryRun } = options;

  // Calcula a data de corte (cutoff date)
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  console.log("=== Política de Retenção e Limpeza de Analytics IP3D ===");
  console.log(`[*] Janela de retenção: ${days} dias`);
  console.log(`[*] Data de corte (anterior a): ${cutoffDate.toISOString()}`);
  console.log(`[*] Modo: ${dryRun ? "SIMULAÇÃO (Dry-Run)" : "EXECUÇÃO REAL"}`);
  console.log("---------------------------------------------------------");

  try {
    if (dryRun) {
      // Simulação: Apenas conta os registros que seriam excluídos
      const pageViewsCount = await prisma.pageView.count({
        where: { createdAt: { lt: cutoffDate } },
      });

      const clicksCount = await prisma.click.count({
        where: { createdAt: { lt: cutoffDate } },
      });

      console.log(`[SIMULADO] ${pageViewsCount} registros de PageView antigos seriam apagados.`);
      console.log(`[SIMULADO] ${clicksCount} registros de Click antigos seriam apagados.`);
      console.log("[+] Dry-run finalizado com sucesso. Nenhuma alteração foi gravada no banco.");
    } else {
      // Execução Real: Executa a remoção do banco
      const pageViewsResult = await prisma.pageView.deleteMany({
        where: { createdAt: { lt: cutoffDate } },
      });

      const clicksResult = await prisma.click.deleteMany({
        where: { createdAt: { lt: cutoffDate } },
      });

      console.log(`[SUCESSO] ${pageViewsResult.count} registros de PageView antigos foram removidos.`);
      console.log(`[SUCESSO] ${clicksResult.count} registros de Click antigos foram removidos.`);
      console.log("[+] Limpeza concluída com sucesso. Banco de dados otimizado!");
    }
  } catch (error: any) {
    console.error("[FALHA] Ocorreu um erro operacional no banco de dados:", error.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
