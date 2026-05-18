# Matriz de Comandos — IP3D

> Validada em: 2026-05-16 | Node.js v24.15.0 | pnpm v11.1.2 | Prisma 5.22.0

---

## Pré-requisitos

| Ferramenta | Versão mínima recomendada | Como instalar |
|---|---|---|
| Node.js | 20 LTS (testado com 24.15.0) | `winget install OpenJS.NodeJS.LTS` |
| pnpm | 9+ (testado com 11.1.2) | `npm install -g pnpm` |
| PostgreSQL | 14+ | Neon / Supabase / Railway / local |

> **Windows:** após instalar Node.js, abra um novo terminal para o PATH ser atualizado.
> Se `npm` falhar com "scripts desabilitados", execute uma vez:
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force`

---

## Setup inicial (primeira vez)

```bash
# 1. Clonar e entrar no repositório
git clone <repo> ip3d && cd ip3d

# 2. Copiar variáveis de ambiente
copy .env.example .env
# Editar .env com valores reais (ver docs/AMBIENTE-LOCAL.md)

# 3. Instalar dependências (inclui prisma generate via postinstall)
pnpm install

# 4. Aprovar builds de dependências nativas (somente na 1ª vez)
pnpm approve-builds
# Selecionar tudo (tecla 'a') e confirmar com 'y'

# 5. Criar schema no banco (sem migrations ainda)
pnpm exec prisma db push

# 6. Criar usuário admin inicial
node scripts/create-admin.js

# 7. Seed de dados iniciais (opcional)
pnpm seed:prod
```

---

## Comandos do dia a dia

### Desenvolvimento

```bash
pnpm dev
# Inicia o servidor em http://localhost:3003
# Hot reload via Turbopack (Next.js 16)
```

### Testes

```bash
pnpm test
# Runner: node:test nativo via tsx
# Arquivo: tests/**/*.test.ts
# Resultado esperado: 5 pass, 0 fail

# Resultado da validação TASK-01:
# ✔ normalizeProviderName falls back to mercadopago (3.2ms)
# ✔ normalizeProviderName accepts infinitypay (11.3ms)
# ✔ mapInfinityStatus handles approved and paid fallback (0.37ms)
# ✔ mapInfinityStatus handles rejected statuses (0.22ms)
# ✔ mapInfinityStatus defaults to pending (0.26ms)
# tests 5 | pass 5 | fail 0
```

### Lint

```bash
pnpm lint
# ESLint 9 + eslint-config-next
# Estado atual (TASK-01): 12 erros + 52 warnings (ver Bloqueios)
# Os 11 erros de require() são de scripts/*.js (CJS esperado)
# O erro de setState é em Header.tsx:105 (para corrigir em tarefa futura)
```

### Build de produção

```bash
pnpm build
# Executa: prisma generate && next build
# Turbopack · TypeScript ignorado (ignoreBuildErrors: true)
# Resultado TASK-01: ✓ exit 0, 67 páginas compiladas em ~22s
```

### Iniciar servidor de produção (após build)

```bash
pnpm start
# next start — porta padrão 3000
# Para Hostinger/VPS com PM2:
pm2 start ecosystem.config.js
```

---

## Banco de dados

```bash
# Aplicar schema ao banco (sem histórico de migração)
pnpm exec prisma db push

# ⚠ Não existe prisma/migrations — apenas schema único
# Para inspecionar o banco:
pnpm exec prisma studio

# Gerar Prisma Client manualmente (normalmente automático no install/build)
pnpm exec prisma generate
```

---

## Seeds

```bash
# Seed básico de componentes de configuração
pnpm seed

# Seed completo de produção (banners, categorias, produtos demo)
pnpm seed:prod

# Setup completo do banco (db push + seed:prod)
pnpm db:setup
```

---

## Deploy

```bash
# Gerar ZIP otimizado para Hostinger (caminhos POSIX)
pnpm deploy:hostinger
# Saída: arquivo .zip pronto para upload no painel Hostinger

# Deploy via PM2 (VPS/servidor dedicado)
pm2 start ecosystem.config.js
pm2 save
```

---

## Comandos utilitários de scripts

```bash
# Criar usuário administrador
node scripts/create-admin.js

# Seed completo (todas as entidades)
node scripts/seed-all.js

# Seed de configurações do site
node scripts/seed-site-config.js

# Seed de blocos de página
node scripts/seed-page-blocks.js
```

---

## Bloqueios conhecidos (estado TASK-01)

| ID | Tipo | Descrição | Tarefa para resolver |
|---|---|---|---|
| BLK-01 | Build | `next.config.ts`: `typescript.ignoreBuildErrors: true` — erros de tipo silenciados | TASK-futura |
| BLK-02 | Lint | 11× `require()` em `scripts/*.js` — ESLint aplica regra CJS sobre arquivos Node | TASK-futura (ignorar via `.eslintignore`) |
| BLK-03 | Lint | `setState` síncrono em `Header.tsx:105` — 1 erro real de React | TASK-futura |
| BLK-04 | Banco | `prisma/migrations/` inexistente — usando `db push` sem histórico | TASK-futura (migrar para `prisma migrate`) |
| BLK-05 | CI/CD | `.github/workflows/` inexistente — sem pipeline automatizado | TASK-futura |
| BLK-06 | Testes | Cobertura ≈ 0% — somente 5 casos unitários de payments | TASK-02+ |
| BLK-07 | Warning | Next.js 16.0.8 tem vulnerabilidade de segurança — atualizar para 16.2.6+ | TASK-futura |
| BLK-08 | Warning | `middleware` file convention deprecated — renomear para `proxy` no Next.js 16 | TASK-futura |
