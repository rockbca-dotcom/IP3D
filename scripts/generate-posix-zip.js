/**
 * Gera um ZIP para deploy na Hostinger com permissões POSIX corretas.
 * - Diretórios: 755
 * - Arquivos: 644
 *
 * Uso: node scripts/generate-posix-zip.js
 */

const fs = require("fs");
const archiver = require("archiver");
const path = require("path");

const sourceDir = path.resolve(__dirname, "..");
const outPath = path.join(sourceDir, "hostinger-deploy.zip");
const output = fs.createWriteStream(outPath);
const archive = archiver("zip", { zlib: { level: 9 } });

let fixedDirs = 0;
let fixedFiles = 0;
let ignoredEntries = 0;

const ignoredDirectories = new Set([
  ".claude",
  ".git",
  ".next",
  ".pnpm-store",
  "node_modules",
  "docs",
  "coverage",
  "out",
  "build",
  ".vercel",
  "temp",
  "tmp",
  "reports",
  "archive",
  "archives",
  "produtos",
]);

const ignoredFiles = new Set([
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.test",
  ".ds_store",
  "desktop.ini",
  "hostinger-deploy.zip",
  "ip3d-production.zip",
  "thumbs.db",
  "check-products.js",
  "products-report.js",
  "remove-background.js",
  "temp-prisma-check.js",
  "update-product-images.js",
  "start-local-server.cmd",
  "start-local-server.ps1",
  "start-local-server.vbs",
]);

const ignoredMatchers = [/\.log$/i, /\.tsbuildinfo$/i, /\.zip$/i, /^tmp-/i];

function shouldIgnore(relativePath, stat) {
  const normalizedPath = relativePath.split(path.sep).join("/");
  const entryName = path.basename(relativePath).toLowerCase();
  const segments = normalizedPath.split("/");

  if (ignoredFiles.has(entryName)) return true;
  if (ignoredMatchers.some((p) => p.test(entryName) || p.test(normalizedPath))) return true;
  if (stat.isDirectory() && ignoredDirectories.has(entryName)) return true;

  return segments.some((seg) => ignoredDirectories.has(seg.toLowerCase()));
}

function addDirectoryRecursively(currentPath, zipPath = "") {
  const items = fs.readdirSync(currentPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(currentPath, item.name);
    const relativeZipPath = zipPath ? `${zipPath}/${item.name}` : item.name;
    const stat = fs.lstatSync(fullPath);

    if (shouldIgnore(relativeZipPath, stat)) {
      ignoredEntries++;
      continue;
    }

    if (stat.isDirectory()) {
      archive.append("", { name: `${relativeZipPath}/`, mode: 0o755 });
      fixedDirs++;
      addDirectoryRecursively(fullPath, relativeZipPath);
      continue;
    }

    archive.file(fullPath, { name: relativeZipPath, mode: 0o644 });
    fixedFiles++;
  }
}

output.on("close", () => {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(1);
  console.log(`\n✅ Archive created: ${outPath}`);
  console.log(`   Size: ${sizeMB} MB`);
  console.log("\n--- Packaging Report ---");
  console.log(`   Directories (755): ${fixedDirs}`);
  console.log(`   Files (644):       ${fixedFiles}`);
  console.log(`   Ignored:           ${ignoredEntries}`);
});

archive.on("warning", (err) => {
  if (err.code === "ENOENT") { console.warn(err); return; }
  throw err;
});

archive.on("error", (err) => { throw err; });

archive.pipe(output);

console.log("📦 Building Hostinger deployment ZIP with POSIX permissions...");
addDirectoryRecursively(sourceDir);
archive.finalize();
