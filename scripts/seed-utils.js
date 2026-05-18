/**
 * Utilitários Compartilhados de Segurança para Seeds e Scripts Operacionais do IP3D
 */

const url = require("url");

function parseSeedArgs(args) {
  return {
    confirm: args.includes("--confirm"),
    dryRun: args.includes("--dry-run"),
  };
}

function validateEnvironment(scriptName, options) {
  const isProd = process.env.NODE_ENV === "production";
  
  if (!process.env.DATABASE_URL) {
    console.error(`[ERRO CRÍTICO] DATABASE_URL não está configurada para o script: ${scriptName}`);
    process.exit(1);
  }

  try {
    new url.URL(process.env.DATABASE_URL);
  } catch (err) {
    console.error(`[ERRO CRÍTICO] DATABASE_URL com formato inválido para o script: ${scriptName}`);
    process.exit(1);
  }

  if (isProd && !options.confirm && !options.dryRun) {
    console.error(`\n[ALERTA DE SEGURANÇA CRÍTICO] Execução de seed em PRODUÇÃO detectada no script: ${scriptName}!`);
    console.error("Esta operação é perigosa e pode modificar dados existentes.");
    console.error("Para prosseguir, você DEVE passar a flag '--confirm'.");
    console.error(`Exemplo: node scripts/${scriptName} --confirm\n`);
    process.exit(1);
  }
}

module.exports = {
  parseSeedArgs,
  validateEnvironment
};
