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

const scripts = [
  "seed-all.js",          // categorias, produtos, specs, admin user
  "seed-site-config.js",  // header, footer, settings, banners, home sections
  "seed-page-blocks.js",  // blocos padrão para páginas do sistema
  "create-admin.js",      // garante admin existe com senha padrão
];

console.log("🚀 Iniciando seed de produção...\n");

for (const script of scripts) {
  const scriptPath = path.join(__dirname, script);
  console.log(`▶ Executando ${script}...`);
  try {
    execSync(`node "${scriptPath}"`, { stdio: "inherit" });
    console.log(`✅ ${script} concluído.\n`);
  } catch (error) {
    console.error(`❌ Erro em ${script}:`, error.message);
    process.exit(1);
  }
}

console.log("🎉 Seed de produção finalizado com sucesso!");
