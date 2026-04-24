# 03 - Planejamento de Sprints (Reorganizacao e Padronizacao)

## Visao geral
- Sprint 1: reorganizacao estrutural do repositorio.
- Sprint 2: limpeza de artefatos e governanca.
- Sprint 3: padronizacao documental e validacoes tecnicas.

## Sprint 1 - Estrutura e base tecnica

### Objetivos
- Trazer o app para a raiz do repositorio.
- Eliminar camada duplicada de diretorios.
- Preservar historico Git sem reescrita.

### Entregaveis
- Projeto Next.js operando a partir da raiz.
- Diretorio legado duplicado removido do workspace.
- Estrutura principal estabilizada (`src`, `public`, `docs`, `scripts`, `prisma`).

### Criterios de aceite
- Arquivos da aplicacao deixam de depender de `site_limpo-main/site_limpo-main`.
- `git status` reflete migracao de caminho sem perda de conteudo.

## Sprint 2 - Limpeza e operacao

### Objetivos
- Retirar do versionamento artefatos nao essenciais.
- Arquivar historico operacional fora do repo com rastreabilidade.
- Consolidar scripts de manutencao.

### Entregaveis
- Arquivo externo de arquivo historico com timestamp.
- Inventario de limpeza documentando itens removidos do Git.
- `scripts/maintenance` com utilitarios reaproveitaveis.
- Remocao de artefatos `desktop.ini` e logs temporarios.

### Criterios de aceite
- Nao ha PDFs/CSVs/logs legados na raiz versionada.
- Pasta `temp` removida apos migracao de utilitarios relevantes.
- `.gitignore` cobre artefatos locais recorrentes.

## Sprint 3 - Documentacao e validacao

### Objetivos
- Adotar modelo documental de 4 arquivos base.
- Manter e conectar docs tecnicas existentes.
- Validar saude minima do projeto apos reorganizacao.

### Entregaveis
- `docs/01` a `docs/04` publicados e alinhados ao IP3D.
- README com indice atualizado e nova estrutura.
- Validacao de install/dev/lint/build e smoke de rotas criticas.

### Criterios de aceite
- Links README -> docs funcionais.
- Estrutura e setup descritos de forma coerente com a raiz atual.
- Pendencias conhecidas registradas sem bloquear rastreabilidade.
