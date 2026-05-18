/**
 * Script de Restauração Seguro do PostgreSQL para IP3D
 * Executa psql utilizando as configurações extraídas de DATABASE_URL.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const url = require("url");

function parseArgs(args) {
  const options = {
    dryRun: false,
    file: null,
    confirm: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dry-run") {
      options.dryRun = true;
    } else if (args[i] === "--confirm") {
      options.confirm = true;
    } else if (args[i] === "--file" && args[i + 1]) {
      options.file = args[i + 1];
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
  console.log("=== INICIANDO RESTAURAÇÃO SEGURA DO BANCO DE DADOS ===");
  
  const options = parseArgs(process.argv.slice(2));
  
  if (!options.file) {
    console.error("[ERRO CRÍTICO] Arquivo de restore não informado. Use: node scripts/restore-db.js --file <caminho_do_dump.sql>");
    process.exit(1);
  }

  const absoluteFilePath = path.resolve(options.file);
  if (!fs.existsSync(absoluteFilePath)) {
    console.error(`[ERRO CRÍTICO] O arquivo especificado não foi encontrado: ${absoluteFilePath}`);
    process.exit(1);
  }

  let config;
  try {
    config = getDatabaseConfig();
  } catch (err) {
    console.error(`[ERRO CRÍTICO] ${err.message}`);
    process.exit(1);
  }

  const maskedPassword = config.password ? "*****" : "(sem senha)";
  console.log(`- Host: ${config.host}`);
  console.log(`- Porta: ${config.port}`);
  console.log(`- Banco: ${config.database}`);
  console.log(`- Usuário: ${config.username}`);
  console.log(`- Senha: ${maskedPassword}`);
  console.log(`- Origem: ${absoluteFilePath}`);

  const envVars = { ...process.env };
  if (config.password) {
    envVars.PGPASSWORD = config.password;
  }

  // Comando psql limpo para restaurar dump
  const cmd = `psql -h "${config.host}" -p "${config.port}" -U "${config.username}" -d "${config.database}" -f "${absoluteFilePath}"`;
  
  // Versão mascarada para logs de produção
  const maskedCmd = cmd.replace(new RegExp(config.password, "g"), "*****");
  
  console.log(`\n[COMANDO RESTORE] ${maskedCmd}`);

  if (options.dryRun) {
    console.log("\n[SIMULAÇÃO] Modo dry-run ativo. Nenhuma operação executada no banco de dados.");
    return { success: true, dryRun: true, absoluteFilePath };
  }

  if (!options.confirm) {
    console.error("\n[ALERTA DE SEGURANÇA CRÍTICO] Esta operação é altamente destrutiva!");
    console.error("Para restaurar de verdade e sobrescrever o banco, você DEVE passar a flag '--confirm'.");
    console.error("Exemplo: node scripts/restore-db.js --file <caminho_do_dump.sql> --confirm\n");
    process.exit(1);
  }

  try {
    // Verificar se psql está instalado
    try {
      execSync("psql --version", { stdio: "ignore" });
    } catch {
      throw new Error("Ferramenta 'psql' não está instalada ou não foi localizada no PATH do sistema.");
    }

    console.log("\nExecutando psql restore...");
    execSync(cmd, { env: envVars, stdio: "inherit" });
    console.log(`\n[SUCESSO] Restauração concluída com sucesso a partir de: ${absoluteFilePath}`);
    return { success: true, dryRun: false, absoluteFilePath };
  } catch (err) {
    console.error(`\n[ERRO NA RESTAURAÇÃO DO BANCO] ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}

module.exports = { parseArgs, getDatabaseConfig, run };
