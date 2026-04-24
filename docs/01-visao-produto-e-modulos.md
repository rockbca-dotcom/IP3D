# 01 - Visao do Produto e Modulos Core

## Produto
IP3D e uma plataforma de e-commerce com CMS administrativo para operacao de catalogo, conteudo institucional, blog, captacao de leads e configuracao de layout dinamico por blocos.

## Metas do ciclo atual
- Consolidar o app Next.js na raiz do repositorio com estrutura limpa.
- Padronizar a operacao do admin para paginas, produtos, blog, marcas e parceiros.
- Garantir rastreabilidade documental para setup, arquitetura e APIs.
- Reduzir ruido operacional removendo artefatos temporarios e arquivos de analise legados.

## Perfis de usuario
- Visitante: navega no site, consulta produtos, marcas, blog e envia leads.
- Operador Admin: administra conteudo, catalogo, layout e scripts via painel.
- Super Admin: configura autenticao inicial, parametros globais e governanca do ambiente.

## Modulos core

### AUTH - Autenticacao admin
- Setup inicial em `/login/setup`.
- Login por sessao para acesso a `/admin/*`.
- Protecao de rotas administrativas por cookie de sessao.

### CMS - Paginas e blocos
- CRUD de paginas no admin.
- Editor visual por blocos com templates reutilizaveis.
- Renderizacao dinamica no site via leitura de blocos ativos.

### CATALOGO - Produtos e marcas
- CRUD de produtos, categorias e marcas.
- Rotas publicas de listagem e detalhe de produto.
- Suporte a ativos de imagem e materiais de catalogo.

### BLOG - Conteudo editorial
- CRUD de posts, categorias e tags.
- Rotas publicas de blog e detalhe por slug.
- Apoio de SEO por conteudo.

### LEADS E INTEGRACOES
- Endpoint de leads para formularios do site.
- Upload e scripts dinamicos configuraveis pelo admin.
- Integracoes operacionais via variaveis de ambiente.

### SEO E MULTI-CONTEXTO
- Configuracoes de SEO por contexto de site/LP.
- Middleware de roteamento por dominio e contexto.
- Geração de `robots.txt` e `sitemap.xml`.

## Stack de referencia
- Frontend/SSR: Next.js (App Router) + React + TypeScript.
- Estilo/UI: Tailwind CSS + componentes UI locais.
- Persistencia: Prisma + banco SQL.
- Sessao: iron-session.
- Upload: Vercel Blob + endpoints internos.

## Fronteiras de dominio
- `src/app/(site)`: experiencia publica.
- `src/app/admin`: operacao de backoffice.
- `src/app/api`: contratos internos para admin e frontend.
- `src/components`: blocos, layout, secoes e UI compartilhada.
- `scripts/maintenance`: utilitarios de manutencao operacional.
