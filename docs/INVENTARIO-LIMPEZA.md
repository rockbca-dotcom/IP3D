# Inventario de Limpeza do Repositorio

## Data
- 2026-04-24

## Objetivo
Registrar os itens removidos do versionamento durante a reorganizacao estrutural e padronizacao do IP3D.

## Arquivamento externo
- Pasta de arquivo historico: `C:\Users\RUI FRANCISCO\Desktop\IP3D_ARCHIVE_20260424-171940`

## Itens removidos da raiz e arquivados externamente
- Relatorios de analise, sumarios e recomendacoes em `.md` e `.txt`.
- Arquivos de apoio em `.pdf` e `.csv`.
- Captura de imagem avulsa (`.jpeg`).
- Logs de servidor (`dev-server.*.log`).
- Scripts ad hoc de operacao (`codex_*.ps1`, `create_report.py`, `_serve.js`).
- Pasta `remote_work/` com artefatos de depuracao e extracoes.
- Camada duplicada legada `site_limpo-main/`.

## Itens reorganizados internamente
- Conteudo util de `temp/` movido para `scripts/maintenance/`.
- Pasta `temp/` removida apos migracao.
- Diretorios vazios legados (`Ip3D`, `IP3D-ATT`) removidos.

## Higiene de workspace
- Arquivos `desktop.ini` removidos recursivamente do repositório.
- `.gitignore` atualizado para prevenir reincidencia de artefatos locais.
