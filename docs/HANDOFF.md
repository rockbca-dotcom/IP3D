# Manual de Handoff Operacional e Entrega Final - IP3D

## Visão Geral e Arquitetura do Sistema
- Estado técnico atual: testes e build validados em 18/05/2026.

## Rotinas Operacionais e Comandos Principais
```bash
pnpm db:backup
pnpm db:restore --file backups/arquivo.sql --confirm
pnpm db:deploy
pnpm seed:dev
pnpm build
```

## Troubleshooting Rápido
- Sem `DATABASE_URL`, sitemap usa fallback estático no build.

## Índice Final e Mapa de Documentos
- README.md
- docs/PR-EVIDENCIAS-GOLD-RELEASE.md
- docs/ACEITE-FINAL.md
- docs/ENCERRAMENTO-ROADMAP.md

## Checklist de Entrega Final
- `pnpm test` -> 341/341
- `pnpm lint` -> 0 errors
- `pnpm build` -> exit code 0
