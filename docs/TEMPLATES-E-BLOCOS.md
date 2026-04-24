# Templates e Blocos

Referencias de produto e escopo:
- `docs/01-visao-produto-e-modulos.md`
- `docs/04-conformidade-seguranca-e-escopo.md`

## Conceito

A base usa blocos de conteudo para montar paginas dinamicas.
Cada bloco tem:
- `type`
- `content` (JSON)
- `order`
- `active`

O editor visual do admin define e persiste esses blocos.

## Blocos por categoria (editor visual)

## Hero

- `hero-slider`
- `hero`

## Conteudo

- `featured-products`
- `why-choose-us`
- `parceiro-partnership`
- `maintenance-preview`
- `features`
- `cards`

## Midia

- `gallery`
- `video`

## CTA

- `catalog-cta`
- `cta`

## Basico

- `text`

## Contato

- `contact-hero`
- `contact-options`
- `contact-info`

## Manutencao

- `maintenance-hero`
- `maintenance-services`
- `maintenance-benefits`
- `maintenance-cta`
- `maintenance-faq`

## Produtos

- `products-hero`
- `products-grid`
- `products-cta`

## Marcas

- `brands-hero`
- `brands-section`
- `brands-partnership`
- `brands-cta`

## Sobre

- `about-hero`
- `about-mission`
- `about-values`
- `about-partnership`
- `about-cta`

## Parceiro

- `parceiro-hero`
- `parceiro-essencia`
- `parceiro-brasil`
- `parceiro-headspa`
- `parceiro-design`
- `parceiro-catalogo`

## FAQ

- `faq-hero`
- `faq-items`
- `faq-cta`

## Garantia

- `garantia-hero`
- `garantia-info`
- `garantia-cta`

## Blog

- `blog-settings`

## Sistema

- `lp-404-content`

## Observacoes importantes

- Nem todo bloco e renderizado pelo mesmo componente.
- `BlockRenderer` cobre os blocos genericos e varias paginas dinamicas.
- Algumas paginas (ex.: Parceiro, FAQ, Garantia, Blog, 404) leem blocos/configs com logica propria.
- A rota `/api/seed-home` popula templates base para slugs principais (`home`, `contato`, `manutencao`, `produtos`, `marcas`, `sobre`, `parceiro`).

## Onde editar

- Lista de paginas: `/admin/paginas`
- Editor visual de uma pagina: `/admin/editor/[pageId]`
