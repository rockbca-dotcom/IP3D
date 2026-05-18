/**
 * Script unificado de seed para produção.
 * Executa todos os seeds na ordem correta para configurar um banco novo.
 *
 * Uso: node scripts/seed-production.js
 *
 * Todos os seeds são idempotentes (usam upsert), então é seguro rodar
 * múltiplas vezes sem duplicar dados.
 */

const { execSync } = require("child_process");
const path = require("path");
const { parseSeedArgs, validateEnvironment } = require("./seed-utils");

function run() {
  const options = parseSeedArgs(process.argv.slice(2));
  validateEnvironment("seed-production.js", options);

  console.log("🚀 Iniciando seed de produção...\n");

  if (options.dryRun) {
    console.log("[SIMULAÇÃO] Modo dry-run ativo. Nenhuma operação executada no banco de dados.");
    return;
  }

  const scripts = [
    "seed-all.js",          // categorias, produtos, specs, admin user
    "seed-site-config.js",  // header, footer, settings, banners, home sections
    "seed-page-blocks.js",  // blocos padrão para páginas do sistema
    "create-admin.js",      // garante admin existe com senha padrão
  ];

  const passArgs = process.argv.slice(2).join(" ");

  for (const script of scripts) {
    const scriptPath = path.join(__dirname, script);
    console.log(`▶ Executando ${script}...`);
    try {
      execSync(`node "${scriptPath}" ${passArgs}`, { stdio: "inherit" });
      console.log(`✅ ${script} concluído.\n`);
    } catch (error) {
      console.error(`❌ Erro em ${script}:`, error.message);
      process.exit(1);
    }
  }

  console.log("🎉 Seed de produção finalizado com sucesso!");
}

if (require.main === module) {
  run();
}

module.exports = { run };
