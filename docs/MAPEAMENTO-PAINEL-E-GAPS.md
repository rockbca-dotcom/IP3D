# Mapeamento do Painel e Gaps Finais

## Resumo

Este documento consolida o que o cliente já consegue editar sozinho pelo painel do IP3D, o que depende de cadastro operacional e quais pontos ainda permanecem como conteúdo estrutural em código.

## Já editável no painel

### Estrutura global

- `Cabeçalho`
  - logos
  - subtítulos
  - links de navegação
  - botões CTA
  - e-mail, telefone e cidade
- `Rodapé`
  - logo
  - descrição
  - contatos
  - grupos de links
  - redes sociais
  - copyright
- `Scripts`
  - códigos de analytics, pixels e scripts customizados
- `Configurações`
  - configurações globais e SEO do site

### Home

- `Banners`
  - títulos, subtítulos, descrições, botões, mídia e ordem
- `Home`
  - seção `why-choose-us`
    - título, subtítulo, descrição
    - features com `icon`, `title`, `description`
    - estatísticas com `value`, `label`
  - seção `maintenance-preview`
    - título, subtítulo, descrição
    - serviços com `icon`, `title`, `description`
    - botão e link
  - seção `catalog-cta`
    - título, subtítulo, descrição
    - telefone exibido
    - telefone para link
    - mensagem de WhatsApp
    - texto do botão catálogo
    - texto do botão consultor

### Catálogo

- `Produtos`
  - nome, slug, descrições
  - imagem principal, galeria, vídeo, catálogo, garantia
  - preços, Pix, estoque, destaque, ativo
  - SEO
  - categoria principal e categorias relacionadas
- `Categorias`
  - nome, slug, descrição, imagem, cor, ícone, ordem, ativo
- `Estoque`
  - movimentações e ajustes

### Páginas

- `Páginas CMS`
  - páginas institucionais e páginas customizadas via blocos
- `Página Personalizados`
  - hero image
  - hero tagline
  - hero title
  - hero highlight
  - hero description
  - CTA title
  - CTA description
  - lista de diferenciais
  - lista de etapas do processo

## Depende de cadastro operacional

- Home pública
  - vitrines de produto dependem de produtos e categorias ativos no catálogo
- Página `personalizados`
  - o portfólio depende de produtos reais cadastrados na categoria `personalizados`
- Página de produto e listagens
  - dependem de produto ativo, slug válido, imagem e preço quando aplicável

## Dependia de código antes desta entrega

- Home pública
  - catálogo fallback rico com produtos fictícios/hardcoded quando não havia banco utilizável
  - spotlight hardcoded injetando item mesmo sem produto real
- Página `personalizados`
  - portfólio inicial hardcoded com itens seedados no front
  - ausência de produto era mascarada por conteúdo fake
- Painel
  - `home-sections` expunha só parte dos campos que o runtime já suportava
  - `page-personalizados` não tinha tela dedicada no admin

## Fechado nesta entrega

- Home não injeta mais catálogo hardcoded quando o banco não está disponível
- Home trata falta de dados com estado controlado sem “produtos fantasmas”
- `personalizados` usa apenas produtos reais da categoria correspondente
- `personalizados` mostra estado vazio explícito quando não há produtos publicados
- painel ganhou edição completa de `page-personalizados` via `LayoutConfig`
- painel da Home passou a editar arrays ricos de features, stats e services
- `homeSections` SSR voltou a ser renderizado na Home pública, fazendo o painel refletir no site

## Gaps residuais conscientes

- `HomeShowcase` ainda possui conteúdo estrutural hardcoded para composição visual:
  - slides default do hero
  - cards estáticos de categorias
  - banner promocional fixo
  - mapa da impressora e hotspots
- esses pontos não bloqueiam a autonomia operacional principal do cliente, mas ainda são backlog se o objetivo for zerar dependência de código na Home

## Recomendação comercial e operacional

- Para operação diária do cliente, o painel já cobre o essencial sem necessidade de reimplementação
- Para uma segunda rodada opcional, o próximo pacote natural é transformar os blocos visuais fixos restantes da Home em conteúdo 100% administrável
