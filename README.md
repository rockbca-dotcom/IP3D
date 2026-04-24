# IP3D - Base de E-commerce + CMS (Next.js)

Repositorio consolidado com aplicacao Next.js na raiz, painel administrativo, CMS por blocos, catalogo de produtos, blog e APIs internas.

## Stack
- Next.js + React + TypeScript
- Tailwind CSS
- Prisma
- iron-session
- Vercel Blob

## Estrutura principal
```text
src/                 # app, APIs e componentes
public/              # assets publicos
docs/                # documentacao funcional e tecnica
scripts/             # scripts de apoio
scripts/maintenance/ # scripts operacionais pontuais
prisma/              # schema e recursos de banco
```

## Setup rapido
```bash
pnpm install
cp .env.example .env
pnpm dev
```

Servidor padrao: `http://localhost:3003`

## Primeiros passos no admin
- Acesse `/login/setup` para criar o primeiro usuario.
- Entre em `/login` e siga para `/admin`.

## Documentacao principal (modelo base)
- [01 - Visao do Produto e Modulos Core](docs/01-visao-produto-e-modulos.md)
- [02 - Catalogo de Telas](docs/02-catalogo-telas.md)
- [03 - Planejamento de Sprints](docs/03-planejamento-sprints.md)
- [04 - Conformidade, Seguranca e Fora de Escopo](docs/04-conformidade-seguranca-e-escopo.md)

## Documentacao tecnica complementar
- [Arquitetura](docs/ARQUITETURA.md)
- [Rotas e APIs](docs/ROTAS-E-APIS.md)
- [Templates e Blocos](docs/TEMPLATES-E-BLOCOS.md)
- [Checklist de Novo Site](docs/CHECKLIST-NOVO-SITE.md)
- [Inventario de Limpeza](docs/INVENTARIO-LIMPEZA.md)

## Scripts
- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm lint`
