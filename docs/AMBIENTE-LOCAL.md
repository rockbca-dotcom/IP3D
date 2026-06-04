# Checklist de Ambiente Local — IP3D

> Referência: TASK-01 | Validado em 2026-05-16

Use este checklist antes de iniciar o desenvolvimento ou ao configurar uma nova máquina.

---

## 1. Runtime e ferramentas

- [ ] **Node.js ≥ 20 LTS** instalado e acessível no PATH
  ```bash
  node --version   # esperado: v20.x ou superior
  ```
  > Versão testada: v24.15.0
  > Instalar: `winget install OpenJS.NodeJS.LTS`

- [ ] **pnpm ≥ 9** instalado globalmente
  ```bash
  pnpm --version   # esperado: 9.x ou superior
  ```
  > Versão testada: v11.1.2
  > Instalar: `npm install -g pnpm`

- [ ] **Windows — ExecutionPolicy** configurada (apenas uma vez por máquina)
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
  ```

- [ ] **Git** configurado com nome e e-mail
  ```bash
  git config --global user.name "Seu Nome"
  git config --global user.email "seu@email.com"
  ```

---

## 2. Arquivo `.env` local

Copiar o template e preencher **todos os valores obrigatórios**:

```bash
copy .env.example .env
```

### Variáveis obrigatórias (sem estas o app não inicia)

- [ ] **`SESSION_SECRET`** — segredo de sessão admin (mínimo 32 caracteres aleatórios)
  ```bash
  # Gerar um valor seguro:
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  > ⚠ NUNCA use um valor fixo ou público. Sem isso, o login admin não funciona.

- [ ] **`DATABASE_URL`** — connection string PostgreSQL
  ```
  DATABASE_URL="postgresql://usuario:senha@host:5432/ip3d"
  ```
  > Opções: Neon (recomendado para dev/staging), Supabase, Railway, PostgreSQL local.
  > Para Neon: https://neon.tech → criar projeto → copiar connection string.

- [ ] **`NEXT_PUBLIC_SITE_URL`** — URL pública sem barra final
  ```
  NEXT_PUBLIC_SITE_URL=http://localhost:3003
  ```
  > Em produção: `https://seudominio.com.br`

- [ ] **`NEXT_PUBLIC_SUPABASE_URL`** — URL do projeto Supabase usada pelo auth/health
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
  ```

- [ ] **`SUPABASE_SERVICE_ROLE_KEY`** — service role key do Supabase
  ```
  SUPABASE_SERVICE_ROLE_KEY=eyJ...
  ```
  > Sem essas duas variáveis, o login admin, a validação de sessão e o `/api/health` falham.

---

### Variáveis de upload (obrigatória para imagens de produtos)

- [ ] **`BLOB_READ_WRITE_TOKEN`** — token do Vercel Blob Storage
  ```
  BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
  ```
  > Obter em: https://vercel.com → seu projeto → Storage → Blob → Token
  > Sem este token, o upload de imagens falha silenciosamente.

---

### Variáveis de pagamento (configurar conforme o gateway ativo)

- [ ] **`PAYMENT_PROVIDER`** — gateway ativo
  ```
  PAYMENT_PROVIDER=mercadopago   # ou: infinitypay
  ```

#### Se `PAYMENT_PROVIDER=mercadopago`:

- [ ] **`MERCADO_PAGO_ACCESS_TOKEN`** — token de acesso MP
  > Obter em: https://www.mercadopago.com.br/developers → Credenciais
- [ ] **`MERCADO_PAGO_WEBHOOK_SECRET`** — segredo do webhook MP
  > Configurar em: MP Dashboard → Notificações → Webhooks → Chave secreta
- [ ] **`MERCADO_PAGO_VALIDATE_WEBHOOK_SIGNATURE`** — `true` em produção, `false` em dev

#### Se `PAYMENT_PROVIDER=infinitypay`:

- [ ] **`INFINITYPAY_HANDLE`**
- [ ] **`INFINITYPAY_API_KEY`**
- [ ] **`INFINITYPAY_WEBHOOK_URL`**
- [ ] **`INFINITYPAY_REDIRECT_URL`**
- [ ] **`INFINITYPAY_WEBHOOK_SECRET`**

---

### Variáveis de e-mail / notificações (pelo menos uma opção necessária)

#### Opção A — SMTP (preferida):

- [ ] **`SMTP_HOST`** — ex: `smtp.gmail.com`, `smtp.sendgrid.net`
- [ ] **`SMTP_PORT`** — ex: `587` (TLS) ou `465` (SSL)
- [ ] **`SMTP_USER`** — e-mail de envio
- [ ] **`SMTP_PASS`** — senha ou App Password
- [ ] **`SMTP_FROM`** — remetente (ex: `"IP3D" <contato@ip3d.com.br>`)
- [ ] **`SALES_NOTIFICATION_EMAIL`** — destinatário das notificações de venda

#### Opção B — Web3Forms (fallback se SMTP não configurado):

- [ ] **`WEB3FORMS_ACCESS_KEY`** — chave da conta Web3Forms
  > Obter em: https://web3forms.com

---

## 3. Banco de dados

- [ ] Banco PostgreSQL acessível a partir do `DATABASE_URL` configurado

- [ ] Schema aplicado ao banco:
  ```bash
  pnpm exec prisma db push
  ```

- [ ] *(Opcional)* Visualizar banco com Prisma Studio:
  ```bash
  pnpm exec prisma studio
  # Abre em http://localhost:5555
  ```

---

## 4. Verificação final do ambiente

Execute estes comandos na ordem para confirmar que tudo está ok:

```bash
# Versões
node --version          # ✓ v20.x ou superior
pnpm --version          # ✓ 9.x ou superior

# Instalar dependências
pnpm install            # ✓ Done, sem ERR_PNPM_IGNORED_BUILDS

# Gerar cliente Prisma
pnpm exec prisma generate   # ✓ Generated Prisma Client

# Rodar testes
pnpm test               # ✓ 5 pass, 0 fail

# Lint (estado atual tem warnings, não bloqueia dev)
pnpm lint               # ⚠ 12 erros conhecidos (ver docs/COMANDOS.md#bloqueios)

# Build de produção (DATABASE_URL necessário para sitemap completo)
pnpm build              # ✓ exit 0 (sem DB: sitemap falha mas build conclui)

# Iniciar dev server
pnpm dev                # Acessa: http://localhost:3003
```

---

## 5. Acesso ao painel admin

Após configurar o banco e rodar `db push`:

```bash
# Criar usuário admin
node scripts/create-admin.js

# Acessar
http://localhost:3003/login
```

> O admin inicial tem role `ADMIN`. Para `SUPER_ADMIN`, editar diretamente no banco ou pelo Prisma Studio.
> Antes de testar login, confirme também que a tabela `User` existe no banco configurado e contém `password`, `role` e `active`.

---

## Referências

- [docs/COMANDOS.md](./COMANDOS.md) — Matriz completa de comandos
- [.env.example](./../.env.example) — Template de variáveis de ambiente
- [docs/ARQUITETURA.md](./ARQUITETURA.md) — Visão geral da arquitetura
