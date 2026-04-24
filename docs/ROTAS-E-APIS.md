# Rotas e APIs

Contexto funcional principal:
- `docs/01-visao-produto-e-modulos.md`
- `docs/02-catalogo-telas.md`

## Rotas Web

## Publicas

- `/`
- `/blog`
- `/blog/[slug]`
- `/blog/categorias`
- `/categorias`
- `/contato`
- `/faq`
- `/garantia`
- `/parceiro`
- `/manutencao`
- `/marcas`
- `/p/[slug]`
- `/produtos`
- `/produtos/[slug]`
- `/salao-de-beleza`
- `/sobre`
- `/spa`
- `/tricologia`

## Login e admin

- `/login`
- `/login/setup`
- `/admin`
- `/admin/banners`
- `/admin/blog`
- `/admin/cabecalho`
- `/admin/catalogo`
- `/admin/configuracoes`
- `/admin/editor/[pageId]`
- `/admin/home`
- `/admin/marcas`
- `/admin/paginas`
- `/admin/paginas/[id]`
- `/admin/parceiros`
- `/admin/produtos`
- `/admin/relatorios`
- `/admin/rodape`
- `/admin/scripts`

## APIs (metodos)

## Admin

- `/api/admin/banners` `[GET, POST]`
- `/api/admin/banners/[id]` `[GET, PUT, DELETE]`
- `/api/admin/blog` `[GET, POST]`
- `/api/admin/blog/[id]` `[GET, PUT, DELETE]`
- `/api/admin/blog/categories` `[GET, POST, PUT, DELETE]`
- `/api/admin/blog/tags` `[GET, POST, PUT, DELETE]`
- `/api/admin/brands` `[GET, POST]`
- `/api/admin/brands/[id]` `[GET, PUT, DELETE]`
- `/api/admin/catalogs` `[GET, POST]`
- `/api/admin/catalogs/[id]` `[PUT, DELETE]`
- `/api/admin/categories` `[GET, POST]`
- `/api/admin/categories/[id]` `[GET, PUT, DELETE]`
- `/api/admin/home-sections` `[GET, POST]`
- `/api/admin/layout` `[GET, PUT]`
- `/api/admin/pages` `[GET, POST]`
- `/api/admin/pages/[id]` `[GET, PUT, DELETE]`
- `/api/admin/partners` `[GET, POST]`
- `/api/admin/partners/[id]` `[PUT, DELETE]`
- `/api/admin/products` `[GET, POST]`
- `/api/admin/products/[id]` `[GET, PUT, DELETE]`
- `/api/admin/reports` `[GET]`
- `/api/admin/scripts` `[GET, POST]`
- `/api/admin/scripts/[id]` `[GET, PUT, DELETE]`
- `/api/admin/settings` `[GET, POST]`

## Auth

- `/api/auth/forgot-password` `[POST]`
- `/api/auth/login` `[POST]`
- `/api/auth/logout` `[POST]`
- `/api/auth/session` `[GET]`
- `/api/auth/setup` `[POST, GET]`

## Publico / frontend

- `/api/banners` `[GET]`
- `/api/blog` `[GET]`
- `/api/blog/[slug]` `[GET, POST]`
- `/api/blog/categories` `[GET]`
- `/api/brands` `[GET]`
- `/api/categories` `[GET]`
- `/api/home-sections` `[GET]`
- `/api/leads` `[POST]`
- `/api/layout` `[GET]`
- `/api/pages/[slug]` `[GET]`
- `/api/products` `[GET]`
- `/api/products/[slug]` `[GET]`
- `/api/products/search` `[GET]`
- `/api/scripts` `[GET]`
- `/api/seed-home` `[GET]`
- `/api/upload` `[POST, DELETE]`
- `/api/upload/client` `[POST]`

## Metadados

- `/robots.txt` (gerado por `src/app/robots.ts`)
- `/sitemap.xml` (gerado por `src/app/sitemap.ts`)
