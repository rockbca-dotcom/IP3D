/**
 * Script de Backup Seguro do PostgreSQL para IP3D
 * Executa pg_dump utilizando as configurações extraídas de DATABASE_URL.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const url = require("url");

function parseArgs(args) {
  const options = {
    dryRun: false,
    output: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dry-run") {
      options.dryRun = true;
    } else if (args[i] === "--output" && args[i + 1]) {
      options.output = args[i + 1];
      i++;
    }
  }

  return options;
}

function getDatabaseConfig() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error("A variável de ambiente DATABASE_URL não está configurada.");
  }

  try {
    const parsed = new url.URL(dbUrl);
    return {
      username: parsed.username,
      password: parsed.password ? decodeURIComponent(parsed.password) : "",
      host: parsed.hostname,
      port: parsed.port || "5432",
      database: parsed.pathname.slice(1)
    };
  } catch (err) {
    throw new Error("DATABASE_URL com formato inválido.");
  }
}

function run() {
  console.log("=== INICIANDO BACKUP SEGURO DO BANCO DE DADOS ===");
  
  const options = parseArgs(process.argv.slice(2));
  let config;
  try {
    config = getDatabaseConfig();
  } catch (err) {
    console.error(`[ERRO CRÍTICO] ${err.message}`);
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
  const defaultDir = path.join(process.cwd(), "backups");
  
  if (!fs.existsSync(defaultDir) && !options.dryRun) {
    fs.mkdirSync(defaultDir, { recursive: true });
  }

  const outputPath = options.output || path.join(defaultDir, `ip3d_backup_${timestamp}.sql`);
  
  // Mascarar senha para exibição segura nos logs de CI/CD
  const maskedPassword = config.password ? "*****" : "(sem senha)";
  console.log(`- Host: ${config.host}`);
  console.log(`- Porta: ${config.port}`);
  console.log(`- Banco: ${config.database}`);
  console.log(`- Usuário: ${config.username}`);
  console.log(`- Senha: ${maskedPassword}`);
  console.log(`- Destino: ${outputPath}`);

  // Comando pg_dump limpo e seguro
  // pg_dump -h <host> -p <port> -U <user> -d <dbname> -F p -f <output>
  const envVars = { ...process.env };
  if (config.password) {
    envVars.PGPASSWORD = config.password;
  }

  const cmd = `pg_dump -h "${config.host}" -p "${config.port}" -U "${config.username}" -d "${config.database}" -F p -f "${outputPath}"`;
  
  // Versão mascarada para logs de produção
  const maskedCmd = cmd.replace(new RegExp(config.password, "g"), "*****");
  
  console.log(`\n[COMANDO] ${maskedCmd}`);

  if (options.dryRun) {
    console.log("\n[SIMULAÇÃO] Modo dry-run ativo. Nenhuma operação executada.");
    return { success: true, dryRun: true, outputPath };
  }

  try {
    // Verificar se pg_dump está instalado
    try {
      execSync("pg_dump --version", { stdio: "ignore" });
    } catch {
      throw new Error("Ferramenta 'pg_dump' não está instalada ou não foi localizada no PATH do sistema.");
    }

    console.log("\nExecutando pg_dump...");
    execSync(cmd, { env: envVars, stdio: "inherit" });
    console.log(`\n[SUCESSO] Backup concluído com sucesso e salvo em: ${outputPath}`);
    return { success: true, dryRun: false, outputPath };
  } catch (err) {
    console.error(`\n[ERRO NA EXECUÇÃO DO BACKUP] ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}

module.exports = { parseArgs, getDatabaseConfig, run };
