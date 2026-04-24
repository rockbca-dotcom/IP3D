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
]);

const ignoredFiles = new Set([
  ".env",
  ".ds_store",
  ".npmrc",
  "desktop.ini",
  "hostinger-deploy.zip",
  "thumbs.db",
]);

const ignoredMatchers = [/\.log$/i, /\.tsbuildinfo$/i, /\.zip$/i, /^tmp-/i];

function shouldIgnore(relativePath, stat) {
  const normalizedPath = relativePath.split(path.sep).join("/");
  const entryName = path.basename(relativePath).toLowerCase();
  const segments = normalizedPath.split("/");

  if (ignoredFiles.has(entryName)) {
    return true;
  }

  if (ignoredMatchers.some((pattern) => pattern.test(entryName) || pattern.test(normalizedPath))) {
    return true;
  }

  if (stat.isDirectory() && ignoredDirectories.has(entryName)) {
    return true;
  }

  return segments.some((segment) => ignoredDirectories.has(segment.toLowerCase()));
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
  console.log(`\nArchive created successfully: ${outPath}`);
  console.log(`Total bytes: ${archive.pointer()}`);
  console.log("\n--- Packaging Report ---");
  console.log(`Directories normalized to 755: ${fixedDirs}`);
  console.log(`Files normalized to 644: ${fixedFiles}`);
  console.log(`Ignored entries: ${ignoredEntries}`);
});

archive.on("warning", (err) => {
  if (err.code === "ENOENT") {
    console.warn(err);
    return;
  }

  throw err;
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);

console.log("Building Hostinger deployment ZIP with clean source files...");
addDirectoryRecursively(sourceDir);
archive.finalize();
