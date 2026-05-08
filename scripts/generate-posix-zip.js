/**
 * Gera um ZIP para deploy na Hostinger sem depender de node_modules.
 *
 * Este wrapper chama o script Python com biblioteca padrão, mantendo:
 * - Diretórios: 755
 * - Arquivos: 644
 * - Exclusão de .git, node_modules, .env, caches, builds e temporários
 *
 * Uso: npm run deploy:hostinger
 */

const { execFileSync } = require("node:child_process");
const path = require("node:path");

const scriptPath = path.resolve(__dirname, "generate-hostinger-zip.py");

try {
  execFileSync("python3", [scriptPath], { stdio: "inherit" });
} catch (error) {
  console.error("Falha ao gerar o ZIP da Hostinger.");
  process.exit(error.status || 1);
}
