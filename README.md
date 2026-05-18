# IP3D - Storefront + CMS (Next.js)

Projeto de e-commerce com painel administrativo, CMS por blocos, checkout com provedores de pagamento e API interna em Next.js.

## Stack
- Next.js 16 + React 19 + TypeScript
- Prisma + PostgreSQL
- Vitest + Testing Library
- ESLint

## Setup local
```bash
pnpm install
cp .env.example .env
pnpm dev
```

Servidor local padrao: `http://localhost:3003`

## Comandos de qualidade
```bash
pnpm lint
pnpm test
pnpm build
```

## Estado tecnico validado (18/05/2026)
- `pnpm test`: **341 testes passando** (53 arquivos de teste).
- `pnpm lint`: **0 erros** (warnings nao bloqueantes ainda existentes).
- `pnpm build`: **sucesso** com fallback de sitemap para ambientes sem `DATABASE_URL`.

## CI
Workflow em `.github/workflows/ci.yml` com:
- install
- `prisma validate`
- `prisma generate`
- `pnpm db:deploy`
- `pnpm seed:dev`
- `pnpm test:coverage`
- `pnpm lint`
- `pnpm build`

## Pagamentos
- Provedor principal: Mercado Pago
- Fallback: InfinityPay
- Checkout principal: `POST /api/payments/checkout`

## Documentacao principal
- `docs/AMBIENTE-LOCAL.md`
- `docs/TESTES.md`
- `docs/RELEASE-CANDIDATE.md`
- `docs/HOMOLOGACAO-STAGING.md`
- `docs/CHECKLIST-PRODUCAO.md`
- `docs/HANDOFF.md`
