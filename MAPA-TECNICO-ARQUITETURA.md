# Mapa Técnico & Arquitetura - IP3D Platform

**Data:** 15 de Março de 2026
**Tecnologia Stack:** Next.js 16 + TypeScript + Tailwind CSS v4 + Prisma ORM
**Servidor:** Running on http://localhost:3003 ✅

---

## 🗂️ Estrutura de Diretórios

```
D:\IP3D Node\site_limpo-main\site_limpo-main\
├── src/
│   ├── app/
│   │   ├── (site)/                    # Site principal (rotas públicas)
│   │   │   ├── layout.tsx             # Layout base site
│   │   │   └── page.tsx               # Home page (SSR com produtos)
│   │   │
│   │   ├── admin/                     # Painel administrativo (/admin)
│   │   │   └── layout.tsx             # Layout admin com sidebar
│   │   │
│   │   ├── api/                       # API routes
│   │   │   ├── seed-home              # Seed para popular dados
│   │   │   └── [...]                  # Outras rotas API
│   │   │
│   │   ├── login/                     # Login e setup
│   │   │   └── page.tsx
│   │   │   └── setup/                 # Setup inicial (criar super admin)
│   │   │
│   │   ├── layout.tsx                 # Root layout (RootLayout)
│   │   ├── not-found.tsx              # 404 page
│   │   ├── robots.ts                  # SEO: robots.txt
│   │   └── sitemap.ts                 # SEO: sitemap.xml
│   │
│   ├── components/
│   │   ├── admin/                     # Componentes do painel
│   │   │   ├── AdminSidebar.tsx       # Menu esquerdo
│   │   │   ├── AdminTopbar.tsx        # Topbar com usuário
│   │   │   ├── ImageUpload.tsx        # Upload de imagens
│   │   │   ├── Modal.tsx              # Modal genérico
│   │   │   ├── RichTextEditor.tsx     # Editor de texto rico (TipTap)
│   │   │   ├── SEOFields.tsx          # Campos SEO (title, meta, og)
│   │   │   └── SEOIndicator.tsx       # Indicador de SEO score
│   │   │
│   │   ├── blocks/                    # Renderização dinâmica
│   │   │   └── BlockRenderer.tsx      # Renderiza blocos por tipo
│   │   │
│   │   ├── layout/                    # Layout components
│   │   │   ├── Header.tsx             # Cabeçalho (logo, nav, search)
│   │   │   └── Footer.tsx             # Rodapé com links
│   │   │
│   │   ├── sections/                  # Seções estáticas
│   │   │   └── [...componentes]       # Fallback components
│   │   │
│   │   ├── site/                      # Componentes específicos site
│   │   │   └── HomeShowcase.tsx       # Showcase de produtos na home
│   │   │
│   │   ├── DynamicFavicon.tsx         # Favicon dinâmico
│   │   ├── DynamicScripts.tsx         # Scripts dinâmicos (GA, tracking)
│   │   ├── TrackingScripts.tsx        # Scripts de tracking
│   │   └── shipping-calculator.tsx    # Calculadora de frete
│   │
│   ├── lib/
│   │   ├── prisma.ts                  # Cliente Prisma singleton
│   │   ├── auth.ts                    # Autenticação (iron-session)
│   │   ├── session.ts                 # Gerenciamento de sessão
│   │   ├── seo.ts                     # Metadata SEO por site/LP
│   │   └── getPageData.ts             # Leitura de páginas dinâmicas
│   │
│   └── middleware.ts                  # Roteamento por domínio
│
├── prisma/
│   ├── schema.prisma                  # ⚠️ MISSING (causa erro em build)
│   └── [migrations]/                  # Histórico de migrações
│
├── public/
│   ├── images/
│   │   ├── banner1.png                # Hero banner
│   │   ├── impressora3d.png           # Imagem de produto
│   │   ├── Captura_de_tela_2026-02-28_210120-removebg-preview.webp
│   │   └── [...]                      # Outras imagens
│   └── [...]
│
├── docs/                              # Documentação
│   ├── TEMPLATES-E-BLOCOS.md          # Guia de blocos
│   ├── ROTAS-E-APIS.md                # Mapa de rotas
│   ├── CHECKLIST-NOVO-SITE.md         # Checklist adaptação
│   └── ARQUITETURA.md                 # Detalhes arquitetura
│
├── scripts/                           # Scripts utilitários
│   └── [...]
│
├── package.json                       # Dependências do projeto
├── tsconfig.json                      # Configuração TypeScript
├── next.config.ts                     # Configuração Next.js
├── tailwind.config.js                 # Configuração Tailwind CSS v4
├── postcss.config.mjs                 # Configuração PostCSS
├── components.json                    # CLI shadcn/ui config
├── eslint.config.mjs                  # ESLint rules
├── .env                               # Variáveis de ambiente
├── .env.example                       # Exemplo .env
├── .gitignore                         # Git ignore rules
├── pnpm-lock.yaml                     # Lock file PNPM
├── pnpm-workspace.yaml                # Workspace config
├── ecosystem.config.js                # PM2 config (para produção)
├── README.md                          # Documentação principal
└── DEPLOY.md                          # Guia deploy

```

---

## 🚀 Stack Técnico

### Frontend Framework
```
Next.js 16.0.8
├─ App Router (não Pages Router)
├─ Server Components (RSC)
├─ Dynamic imports / Suspense
└─ Image optimization built-in

React 19.2.1
├─ Functional components
├─ Hooks (useState, useEffect, etc)
└─ Server/Client boundaries
```

### Styling
```
Tailwind CSS v4
├─ Utility-first CSS
├─ Custom color tokens (via config)
├─ Dark mode support (class strategy)
└─ PostCSS 4 integration

Framer Motion 12.23.26
├─ Animações suaves
├─ Gestos e interações
└─ Orchestração de animações
```

### Components & UI
```
Radix UI (headless components)
├─ @radix-ui/react-dialog
├─ @radix-ui/react-label
├─ @radix-ui/react-select
└─ @radix-ui/react-slot

Icons
├─ lucide-react (55 ícones)
├─ react-icons (FontAwesome, Material)
└─ SVG assets (public/)
```

### Forms & Validation
```
React Hook Form 7.68.0
├─ Gerenciamento de estado de form
├─ Performance otimizado
└─ Integração com Zod

@hookform/resolvers 5.2.2
├─ Validação com Zod/Yup
└─ Error handling

Zod 4.1.13
├─ Type-safe validation
├─ Schema definitions
└─ Runtime validation
```

### Rich Text Editing
```
TipTap 3.19.0
├─ @tiptap/react
├─ @tiptap/starter-kit
├─ @tiptap/extension-link
├─ @tiptap/extension-image
├─ @tiptap/extension-underline
└─ @tiptap/extension-placeholder
```

### Backend & Database
```
Prisma 5.22.0
├─ ORM type-safe
├─ Schema-driven
├─ Migrations
└─ ⚠️ PROBLEMA: schema.prisma está faltando!

PostgreSQL (Neon)
├─ Database remoto
├─ Pool connection
└─ CONNECTION: postgresql://...

@prisma/client 5.22.0
├─ Runtime queries
└─ Type inference
```

### Authentication & Sessions
```
iron-session 8.0.4
├─ Sessões seguras (cookies criptografados)
├─ Admin auth
└─ Password-less cookie storage

bcryptjs 3.0.3
├─ Hash de senhas
├─ Segurança
└─ Compatível com Node.js
```

### Upload & Storage
```
@vercel/blob 2.0.0
├─ Upload server-side
├─ Token generation
├─ CDN automático
└─ Integração Next.js nativa
```

### Payment Processing
```
mercadopago 2.12.0
├─ Checkout integrado
├─ Pagamentos via cartão
├─ Webhooks para confirmação
└─ Credenciais em .env
```

### Shipping & Logistics
```
node-correios 3.0.2
├─ Integração com Correios
├─ Cálculo de frete
└─ Rastreamento (possível)
```

### Utilities
```
class-variance-authority 0.7.1
├─ CVA para variants de componentes
├─ Type-safe styling
└─ Pattern factory

clsx 2.1.1
├─ Conditional classNames
└─ Performance

tailwind-merge 3.4.0
├─ Merge Tailwind classes
├─ Evita conflicts
└─ Priority correct
```

---

## 📊 Modelo de Dados (Prisma Schema)

### ⚠️ PROBLEMA CRÍTICO

**O arquivo `prisma/schema.prisma` está FALTANDO!**

Isso causa erro em `pnpm build`:
```
error Command failed with exit code 1.
prisma generate -> failed
```

**Tabelas Esperadas (baseado em código):**

```prisma
model Product {
  id            String      @id @default(cuid())
  name          String
  slug          String      @unique
  shortDescription String?
  image         String?
  priceOriginal Decimal?
  pricePromo    Decimal?
  pixPrice      Decimal?
  stockQuantity Int?
  active        Boolean     @default(true)
  featured      Boolean     @default(false)
  category      Category?   @relation(fields: [categoryId], references: [id])
  categoryId    String?
  categories    ProductCategory[]
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model Category {
  id        String     @id @default(cuid())
  name      String
  slug      String     @unique
  active    Boolean    @default(true)
  order     Int        @default(0)
  parentId  String?
  parent    Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryHierarchy")
  products  Product[]
}

model ProductCategory {
  productId  String
  categoryId String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  @@id([productId, categoryId])
}

model User {
  id       String  @id @default(cuid())
  email    String  @unique
  password String  // bcrypt hash
  role     String  @default("user")  // "user" | "admin" | "super_admin"
}

model Page {
  id       String  @id @default(cuid())
  slug     String  @unique
  title    String
  blocks   Block[]
}

model Block {
  id     String @id @default(cuid())
  type   String // "hero" | "carousel" | "products" | "text" etc
  data   Json   // Dados dinâmicos por tipo
  pageId String
  page   Page   @relation(fields: [pageId], references: [id], onDelete: Cascade)
}
```

---

## 🔄 Fluxo de Dados

### Home Page Rendering (Server-Side)

```typescript
// src/app/(site)/page.tsx

1. getHomeBlocks()
   └─ Buscar blocos dinâmicos do CMS (Page model)
   └─ Retorna [] (Page model removido do schema)

2. Promise.all() - Paralelo:
   ├─ prisma.category.findMany()
   │  └─ Categorias ativas com subcategorias
   │
   ├─ prisma.product.findMany({ featured: true })
   │  └─ Produtos destacados (take: 8)
   │
   └─ prisma.product.findMany({ orderBy: createdAt })
      └─ Produtos recentes (take: 8)

3. normalizeProducts()
   └─ Mapeia dados Prisma → ProductCard type

4. categoryProductEntries
   └─ Busca produtos por categoria (showcase):
      ├─ "componentes-bambu-lab"
      ├─ "componentes-creality"
      ├─ "componentes-universais"
      ├─ "impressoras-3d"
      └─ "personalizados"

5. Return <HomeShowcase />
   └─ Renderiza com dados agregados
```

### Admin Authentication Flow

```
1. GET /login
   └─ Check cookie admin-session
   └─ Redirect /admin if valid

2. POST /api/auth/login
   ├─ Validate email + password
   ├─ Hash password with bcryptjs
   ├─ Create session cookie (iron-session)
   └─ Return 200 OK

3. GET /admin
   └─ Middleware validates session
   └─ Show AdminLayout + sidebar
```

### Product Purchase Flow (Mercado Pago)

```
1. User clicks "Comprar Agora"
   └─ Add to cart (client state)

2. POST /api/checkout
   ├─ Create Mercado Pago preference
   ├─ Return checkout URL
   └─ Redirect to Mercado Pago

3. User completes payment
   └─ Mercado Pago redirects to success page

4. POST /api/webhooks/mercadopago
   ├─ Validate signature
   ├─ Update order status
   └─ Send confirmation email
```

---

## 🌐 Roteamento & Páginas

### Rotas Públicas (Site)

```
GET /                           # Home (renderiza HomeShowcase)
GET /produtos                   # Catálogo de produtos
GET /produtos/[slug]            # Detalhe do produto
GET /marcas                     # Página de marcas
GET /blog                       # Listagem de artigos
GET /blog/[slug]                # Artigo individual
GET /blog/categorias            # Categorias de blog
GET /contato                    # Formulário contato
GET /sobre                      # Sobre a empresa
GET /manutencao                 # Página manutenção
GET /faq                        # Perguntas frequentes
GET /garantia                   # Política garantia
GET /categorias                 # Todas as categorias
GET /p/[slug]                   # Páginas dinâmicas (CMS)
```

### Rotas Admin (Privadas)

```
GET /admin                      # Dashboard
GET /admin/produtos             # Manage products
GET /admin/categorias           # Manage categories
GET /admin/blog                 # Manage blog
GET /admin/paginas              # Manage pages (CMS)
GET /admin/banners              # Manage banners
GET /admin/configuracoes        # Settings (SEO, scripts)
```

### Auth Routes

```
GET /login                      # Login form
GET /login/setup                # Setup first super admin
POST /api/auth/login            # Login endpoint
POST /api/auth/logout           # Logout endpoint
```

### API Endpoints

```
GET  /api/seed-home?page=home   # Seed initial data
POST /api/products              # Create product (admin)
GET  /api/products              # List products
PUT  /api/products/[id]         # Update product (admin)
DELETE /api/products/[id]       # Delete product (admin)

POST /api/checkout              # Iniciar checkout Mercado Pago
POST /api/webhooks/mercadopago  # Webhook confirmação pagamento
```

---

## 🔧 Configurações Importantes

### .env Variáveis

```env
# Session
SESSION_SECRET=Kp8h2Zt7Qm4L9Xc3Vf0Jw1N6Rs5Ty8Ub
# ⚠️ IMPORTANTE: Gerar novo secret em PRODUÇÃO

# Upload (Vercel Blob)
BLOB_READ_WRITE_TOKEN=vercel_blob_token_here

# Public URL
NEXT_PUBLIC_SITE_URL=http://localhost:3004

# Database (PostgreSQL - Neon)
DATABASE_URL=postgresql://neondb_owner:...@ep-round-unit-aihuyq8r-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-8688187103036728-...
MERCADO_PAGO_PUBLIC_KEY=APP_USR-45512a4d-1174-41fc-...
MERCADO_PAGO_WEBHOOK_SECRET=<escolha-um-segredo-forte>
```

### Tailwind Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Custom brand colors
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  darkMode: 'class',
}
```

### Next.js Config

```ts
// next.config.ts
export default {
  images: {
    remotePatterns: [
      { hostname: 'blob.vercel.com' },
      // Permitir imagens do Vercel Blob
    ],
  },
}
```

---

## 🐛 Problemas Conhecidos

### 1. ⚠️ Schema Prisma Faltando

**Erro:** `prisma generate` falha
```
pnpm build fails because prisma/schema.prisma is missing
```

**Solução:**
- Recuperar schema do histórico Git
- Ou recriar schema baseado no código

### 2. ⚠️ Lint Errors Legados

**Erro:** `pnpm lint` retorna warnings/errors
```
ESLint detects issues in legacy code
```

**Solução:**
- Rodar `pnpm lint --fix` para auto-correct
- Manualmente revisar warnings complexos

### 3. ⚠️ TypeScript Errors (34MB log)

**Arquivo:** `tsc_errors.log` (34MB)
```
Múltiplos erros de type checking
```

**Recomendação:**
- Analisar erros por categoria
- Aplicar fixes incrementalmente
- Considerar `skipLibCheck: true` se necessário

---

## 📈 Métricas & Performance

### Bundle Size (Estimado)

```
Next.js Core:       ~45KB gzip
React:              ~40KB gzip
Tailwind CSS:       ~12KB gzip (tree-shaken)
Framer Motion:      ~25KB gzip
Radix UI:           ~15KB gzip
Other:              ~20KB gzip
─────────────────────────────
Total (JS):         ~157KB gzip

CSS:                ~25KB gzip
─────────────────────────────
TOTAL:              ~182KB gzip
```

**Status:** ✅ Aceitável para e-commerce

### Build Time

```
pnpm build (local):
├─ Prisma generate: ~2s (se schema existe)
├─ Next.js compile: ~15-30s
└─ Total: ~20-45s

Deploy Vercel:
├─ Build: ~2-3 min
├─ Edge functions: ~30s
└─ Deployment: ~1 min
```

---

## 🚀 Deployment

### Opções Recomendadas

1. **Vercel (RECOMENDADO)**
   - Nativo para Next.js
   - Serverless functions
   - CDN global automático
   - Integração GitHub contínua
   - Env vars gerenciadas

2. **Self-hosted (VPS)**
   - PM2 para process management
   - Nginx reverse proxy
   - Let's Encrypt para SSL
   - Ver: `ecosystem.config.js` e `DEPLOY.md`

3. **Docker**
   - Dockerfile fornecido (se houver)
   - Containerização
   - Easy scaling

### Pre-deployment Checklist

```
□ Prisma schema.prisma criado
□ pnpm build executa sem erro
□ Variáveis .env configuradas (prod)
□ DATABASE_URL aponta para prod DB
□ BLOB_READ_WRITE_TOKEN válido
□ Mercado Pago credenciais válidas
□ SESSION_SECRET novo gerado (32+ chars)
□ DNS apontando para servidor
□ SSL certificate instalado
□ Backups automatizados configurados
```

---

## 📚 Documentação Relacionada

Dentro do projeto:
- `docs/ARQUITETURA.md` - Detalhes arquitetura
- `docs/TEMPLATES-E-BLOCOS.md` - Guia de blocos CMS
- `docs/ROTAS-E-APIS.md` - Mapa completo de rotas
- `docs/CHECKLIST-NOVO-SITE.md` - Checklist customização
- `README.md` - Documentação principal
- `DEPLOY.md` - Guia deploy

---

**Documento gerado:** 15 de Março de 2026
**Versão:** 1.0 - Mapa Técnico Completo
