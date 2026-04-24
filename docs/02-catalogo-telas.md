# 02 - Catalogo de Telas

## Resumo
- Total mapeado: 29 telas/areas principais.
- Site publico: 14
- Fluxos de autenticacao: 2
- Admin: 13

## Site publico

| ID | Tela/Rota | Objetivo | Regras chave |
|---|---|---|---|
| S01 | `/` | Home institucional e comercial | Carrega layout dinamico e secoes de destaque |
| S02 | `/produtos` | Listar catalogo | Busca e navegacao por itens |
| S03 | `/produtos/[slug]` | Detalhar produto | Exibe informacoes comerciais e imagens |
| S04 | `/categorias` | Mostrar categorias | Navegacao por agrupamento |
| S05 | `/categorias/[slug]` | Filtrar por categoria | Lista produtos por categoria |
| S06 | `/marcas` | Apresentar marcas | Conteudo e vinculo com catalogo |
| S07 | `/blog` | Listagem de posts | Navegacao editorial |
| S08 | `/blog/[slug]` | Detalhe de post | Conteudo completo e metadados |
| S09 | `/blog/categorias` | Navegar por categorias do blog | Filtro editorial |
| S10 | `/contato` | Captacao de contato | Envio para endpoint de leads |
| S11 | `/sobre` | Conteudo institucional | Blocos editaveis via CMS |
| S12 | `/faq` | Perguntas frequentes | Blocos proprios de FAQ |
| S13 | `/garantia` | Politicas e suporte | Conteudo e CTA |
| S14 | `/p/[slug]` | Pagina dinamica | Renderizacao via blocos CMS |

## Autenticacao

| ID | Tela/Rota | Objetivo | Regras chave |
|---|---|---|---|
| A01 | `/login` | Login administrativo | Sessao obrigatoria para admin |
| A02 | `/login/setup` | Setup inicial | Cria primeiro usuario privilegiado |

## Admin Backoffice

| ID | Tela/Rota | Objetivo | Regras chave |
|---|---|---|---|
| W01 | `/admin` | Dashboard inicial | Entrada das operacoes |
| W02 | `/admin/home` | Gerenciar conteudo da home | Atualizacao de secoes |
| W03 | `/admin/paginas` | CRUD de paginas | Base para editor visual |
| W04 | `/admin/editor/[pageId]` | Editar blocos da pagina | Ordenacao/ativacao de blocos |
| W05 | `/admin/produtos` | CRUD de produtos | Catalogo comercial |
| W06 | `/admin/categorias` | CRUD de categorias | Classificacao de produtos |
| W07 | `/admin/marcas` | CRUD de marcas | Organizacao institucional |
| W08 | `/admin/blog` | CRUD de posts/blog | Conteudo editorial |
| W09 | `/admin/banners` | Gerenciar banners | Destaques visuais |
| W10 | `/admin/parceiros` | Gerenciar parceiros | Blocos e exibicao parceiros |
| W11 | `/admin/cabecalho` | Configurar header | Layout global editavel |
| W12 | `/admin/rodape` | Configurar footer | Layout global editavel |
| W13 | `/admin/configuracoes` | Parametros globais | SEO, scripts e ajustes do site |

## Vinculo entre telas e modulos
- AUTH: A01, A02 e todas as rotas `/admin/*`.
- CMS: S01, S11, S14, W03, W04, W11, W12.
- CATALOGO: S02-S06, W05-W07.
- BLOG: S07-S09, W08.
- LEADS/INTEGRACOES: S10, W13.
- SEO/MULTI-CONTEXTO: S01-S14, W13.
