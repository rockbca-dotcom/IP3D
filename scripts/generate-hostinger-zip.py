#!/usr/bin/env python3
"""Gera hostinger-deploy.zip para deploy manual na Hostinger.

Usa somente biblioteca padrão do Python para evitar depender de node_modules.
"""

from __future__ import annotations

import os
import stat
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "hostinger-deploy.zip"

IGNORED_DIRS = {
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
}

IGNORED_FILES = {
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    ".env.test",
    ".ds_store",
    "desktop.ini",
    "thumbs.db",
    "hostinger-deploy.zip",
    "ip3d-production.zip",
    "check-products.js",
    "products-report.js",
    "remove-background.js",
    "temp-prisma-check.js",
    "update-product-images.js",
    "start-local-server.cmd",
    "start-local-server.ps1",
    "start-local-server.vbs",
}


def should_ignore(path: Path) -> bool:
    rel = path.relative_to(ROOT)
    parts = [p.lower() for p in rel.parts]
    name = path.name.lower()

    if any(part in IGNORED_DIRS for part in parts):
        return True
    if name in IGNORED_FILES:
        return True
    if name.endswith((".log", ".tsbuildinfo", ".zip")):
        return True
    if name.startswith("tmp-"):
        return True
    return False


def add_entry(zipf: zipfile.ZipFile, path: Path, arcname: str, is_dir: bool = False) -> None:
    info = zipfile.ZipInfo(arcname)
    info.create_system = 3
    mode = 0o755 if is_dir else 0o644
    file_type = stat.S_IFDIR if is_dir else stat.S_IFREG
    info.external_attr = (file_type | mode) << 16

    if is_dir:
        zipf.writestr(info, b"")
    else:
        with path.open("rb") as src:
            zipf.writestr(info, src.read(), compress_type=zipfile.ZIP_DEFLATED)


def main() -> None:
    if OUT.exists():
        OUT.unlink()

    files = 0
    dirs = 0
    ignored = 0

    with zipfile.ZipFile(OUT, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
        for current, dirnames, filenames in os.walk(ROOT):
            current_path = Path(current)

            kept_dirs = []
            for dirname in dirnames:
                dir_path = current_path / dirname
                if should_ignore(dir_path):
                    ignored += 1
                else:
                    kept_dirs.append(dirname)
                    rel = dir_path.relative_to(ROOT).as_posix() + "/"
                    add_entry(zipf, dir_path, rel, is_dir=True)
                    dirs += 1
            dirnames[:] = kept_dirs

            for filename in filenames:
                file_path = current_path / filename
                if should_ignore(file_path):
                    ignored += 1
                    continue
                rel = file_path.relative_to(ROOT).as_posix()
                add_entry(zipf, file_path, rel)
                files += 1

    size_mb = OUT.stat().st_size / 1024 / 1024
    print(f"Created: {OUT}")
    print(f"Size: {size_mb:.1f} MB")
    print(f"Directories: {dirs}")
    print(f"Files: {files}")
    print(f"Ignored: {ignored}")


if __name__ == "__main__":
    main()
