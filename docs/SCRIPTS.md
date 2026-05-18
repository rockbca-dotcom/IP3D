# Guia de Scripts e Utilitários — IP3D

Este documento classifica e descreve os scripts disponíveis no diretório `scripts/`.

---

## Scripts Oficiais (via pnpm/npm)

Estes scripts são chamados diretamente pelo `package.json` e são fundamentais para o ciclo de vida do projeto.

| Atalho | Comando Real | Finalidade | Ambiente |
| :--- | :--- | :--- | :--- |
| `pnpm seed` | `node scripts/seed-all.js` | Popula categorias, produtos, specs e admin básico. | Dev / Staging |
| `pnpm seed:dev` | `node scripts/seed-production.js` | Executa todos os seeds padrão para ambiente de desenvolvimento. | Dev |
| `pnpm seed:prod` | `node scripts/seed-production.js` | Executa todos os seeds (all + site config + blocks + admin) na sequência correta. | Prod / Staging |
| `pnpm seed:prod:safe` | `node scripts/seed-production.js --confirm` | Executa o seed de produção aplicando a confirmação obrigatória de segurança. | Prod / Staging |
| `pnpm create-admin:safe` | `node scripts/create-admin.js` | Cria ou atualiza o super-administrador inicial aplicando regras rígidas de senhas. | Prod / Dev / Staging |
| `npm run db:setup` | `prisma migrate deploy && node scripts/seed-production.js` | Sincroniza schema e popula banco do zero com segurança. | Dev / Staging / Prod |
| `npm run deploy:hostinger` | `node scripts/generate-posix-zip.js` | Gera pacote ZIP otimizado para deploy. | Local |
| `pnpm analytics:cleanup` | `tsx scripts/analytics-cleanup.ts` | Remove registros de PageView/Click expirados por idade. | Dev / Prod |
| `pnpm analytics:cleanup:dry-run` | `tsx scripts/analytics-cleanup.ts --dry-run` | Simula a exclusão de analytics sem deletar do banco. | Dev / Prod |
| `pnpm db:backup` | `node scripts/backup-db.js` | Executa backup (pg_dump) seguro e automatizado do banco. | Prod / Homolog |
| `pnpm db:backup:dry-run` | `node scripts/backup-db.js --dry-run` | Simula a execução do pg_dump mascarando a senha. | Prod / Homolog |
| `pnpm db:restore` | `node scripts/restore-db.js --file <caminho>` | Executa restauração (psql) exigindo confirmação explícita. | Prod / Homolog |
| `pnpm db:restore:dry-run` | `node scripts/restore-db.js --file <caminho> --dry-run` | Simula a restauração sem afetar dados físicos do banco. | Prod / Homolog |

---

## Utilitários de Operação e Admin

Scripts de uso manual para tarefas específicas de administração do sistema.

### `scripts/backup-db.js`
- **Finalidade**: Executa a cópia de segurança estrutural e de dados (dump SQL) da base de dados PostgreSQL.
- **Segurança**:
  - Extrai as credenciais com segurança diretamente de `DATABASE_URL`.
  - Mascara senhas e tokens de banco em todas as saídas de console e logs.
  - Suporta `--dry-run` para simulação.
  - Salva na pasta `/backups/` que está listada no `.gitignore` global.
- **Quando usar**: Diariamente via Cron Job automatizado ou antes de deploys de migrações críticas.
- **Ambiente**: Produção e Homologação.
- **Risco**: Nulo (operação somente-leitura).

### `scripts/restore-db.js`
- **Finalidade**: Realiza a restauração estrutural e de dados de um arquivo dump SQL.
- **Segurança**:
  - Valida a presença física do arquivo antes de acionar o CLI do `psql`.
  - **Exige Confirmação Estrita:** Requer obrigatoriamente a flag `--confirm` para execução física destrutiva, impedindo sobrescritas acidentais de banco de dados.
  - Suporta `--dry-run` para auditar a string final do comando sem aplicá-la.
- **Quando usar**: Em testes periódicos de restore (DR) ou em casos severos de desastre (Incident Response).
- **Ambiente**: Produção, Homologação e Dev.
- **Risco**: Alto (sobrescreve tabelas físicas). Exige precaução e flag `--confirm`.

### `scripts/analytics-cleanup.ts`
- **Finalidade**: Aplica a política de retenção da LGPD para registros antigos de tráfego (`PageView`) e conversões (`Click`).
- **Segurança**:
  - Aceita customização da janela de retenção via flag `--days` ou ENV `ANALYTICS_RETENTION_DAYS`.
  - Suporta modo simulação `--dry-run` para auditar a quantidade de registros elegíveis a exclusão.
  - Não apaga dados operacionais de usuários, pedidos ou estoque.
- **Quando usar**: Periodicamente via cron job ou agendamento de servidor. Consulte [ANALYTICS-RETENCAO.md](./ANALYTICS-RETENCAO.md) para política de privacidade completa.
- **Ambiente**: Produção e Homologação.
- **Risco**: Baixo (afeta apenas tabelas de analytics secundárias).

### `scripts/create-admin.js`
- **Finalidade**: Garante que um usuário `SUPER_ADMIN` existe para o setup do e-commerce.
- **Segurança**:
  - Se um admin já existir, o script aborta. Para resetar a senha de admin existente, use a flag `--force`.
  - **Hardening em Produção:** Se `NODE_ENV="production"`, o script rejeita sumariamente a senha padrão (`Ip3d@2026`) ou qualquer senha fraca. A senha deve possuir no mínimo 12 caracteres, contendo maiúscula, minúscula, número e caractere especial.
  - Exige a flag `--confirm` em produção.
  - Suporta a flag `--dry-run` para simulação inofensiva.
  - Não expõe ou loga senhas em stdout nos logs de produção.
- **Quando usar**: Primeiro setup do painel de administração ou reset emergencial de senhas de administradores.
- **Ambiente**: Qualquer.
- **Risco**: Baixo.

### `scripts/seed-production.js`
- **Finalidade**: Script mestre que executa a esteira inteira de seeds (`seed-all.js`, `seed-site-config.js`, `seed-page-blocks.js`, `create-admin.js`) na sequência correta para configurar um novo banco.
- **Segurança**:
  - **Bloqueio de Produção:** Se `NODE_ENV="production"`, recusa a execução a menos que `--confirm` seja informado.
  - Repassa todas as flags (`--confirm`, `--dry-run`) recursivamente para os scripts filhos.
- **Ambiente**: Qualquer.
- **Risco**: Alto em produção (operação reconstrutiva).

### `scripts/seed-all.js`
- **Finalidade**: Popula as tabelas essenciais (categorias de produtos, listagem oficial de produtos, especificações técnicas dos produtos e admin básico).
- **Segurança**:
  - Idempotente (utiliza upserts no Prisma).
  - Exige `--confirm` se executado sob `NODE_ENV="production"`.
  - Suporta `--dry-run` para auditar a quantidade de registros sem gravar fisicamente.
  - Oculta/mascara a senha padrão do administrador no log final de conclusão quando em produção.
- **Risco**: Médio em produção (pode atualizar dados cadastrais de produtos ativos).

### `scripts/seed-site-config.js`
- **Finalidade**: Popula as configurações estéticas de Layout (Header/Footer), Banners rotativos da Home, e seções da Home.
- **Segurança**:
  - Idempotente (upsert).
  - Exige `--confirm` se executado sob `NODE_ENV="production"`.
  - Suporta `--dry-run` para simulação.
- **Risco**: Médio em produção (sobrescreve banners customizados ativos).

### `scripts/seed-page-blocks.js`
- **Finalidade**: Configura os blocos dinâmicos do editor visual do admin para as páginas institucionais (Home, Sobre, Contato, 404) caso estejam sem blocos.
- **Segurança**:
  - Só injeta blocos padrão se a página correspondente estiver completamente vazia, preservando edições manuais feitas pelo admin no painel.
  - Exige `--confirm` sob `NODE_ENV="production"`.
  - Suporta `--dry-run` para simulação.
- **Risco**: Baixo.

### `scripts/update-product-images.js`
- **Finalidade**: Sincroniza caminhos de imagens físicas alocadas localmente com os registros de produtos no banco.
- **Segurança**:
  - Exige `--confirm` sob `NODE_ENV="production"`.
  - Suporta `--dry-run` para simular as associações de arquivos a slugs.
- **Ambiente**: Qualquer.
- **Risco**: Médio (atualização massiva de registros de imagem).

---

## Scripts Arquivados (`scripts/archived/`)

Estes scripts foram movidos para a pasta `archived` por serem temporários, pontuais ou de uso único. **Não devem ser usados em produção** sem revisão prévia.

- `maintenance/`: Scripts de carga de dados e processamento de imagens feitos durante o desenvolvimento inicial.
- `attach-images-to-product.js`: Exemplo de script com IDs fixos para teste.
- `remove-background.js`: Utilitário de processamento de imagem via `sharp`.

---

## Regras de Segurança

1. **Produção**: Sempre use `npm run seed:prod` para garantir que o site tenha as seções e banners mínimos.
2. **Secrets**: Os scripts utilizam a `DATABASE_URL` do ambiente. Certifique-se de que o `.env` está correto antes de rodar.
3. **CJS vs ESM**: A maioria dos scripts usa CommonJS (`require`) para compatibilidade direta com `node`. Novos scripts devem preferencialmente seguir este padrão ou usar `tsx`.
