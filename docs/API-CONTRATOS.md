# Contratos de API — IP3D

Este documento descreve os contratos (payloads, respostas, autenticação) das APIs do IP3D.

---

## Padrões Globais

- **Formato**: JSON (Content-Type: `application/json`)
- **Autenticação Admin**: Cookies baseados em `iron-session` (`ip3d-admin-session`).
- **Sucesso**: Status `200/201`. Resposta contém `{ success: true, data: ... }` ou os dados diretos.
- **Erros Padronizados**:
  ```json
  {
    "success": false,
    "error": {
      "code": "BAD_REQUEST | NOT_FOUND | UNAUTHORIZED | ...",
      "message": "Descrição amigável do erro",
      "details": [ { "path": "field", "message": "reason" } ]
    }
  }
  ```
- **Validação**: Todos os endpoints de escrita utilizam **Zod** para validação de payload.

---

## 1. Pagamentos & Checkout

### `POST /api/payments/checkout`
Inicia a criação de um pedido (legado) ou processa um pedido pendente pré-existente (novo fluxo), gerando o link de pagamento no provedor ativo.

- **Acesso**: Público.
- **Suporte Duplo (Contratos)**:
  - **Fluxo A (Novo / Preferencial)**: Envia apenas o ID do pedido existente.
    ```json
    {
      "orderId": "uuid-do-pedido"
    }
    ```
  - **Fluxo B (Legado / Carrinho)**: Envia o payload completo do carrinho de compras.
    ```json
    {
      "items": [{ "productId": "uuid", "quantity": 1 }],
      "customer": { "name": "Nome", "email": "email@test.com", "phone": "11999999999" },
      "shipping": { "cep": "00000000", "price": 25.50, "serviceCode": "03220", "serviceName": "SEDEX", "address": { "street": "Rua", "number": "123", "city": "São Paulo", "state": "SP" } }
    }
    ```
- **Sucesso (200)**:
  ```json
  {
    "provider": "mercadopago",
    "redirectUrl": "https://sandbox.mercadopago.com/...", // Sandbox em dev/test, Oficial em produção
    "orderCode": "GT-123456",
    "subtotal": 100.00,
    "shippingCost": 25.50,
    "total": 125.50,
    "providerOrderId": "pref-123",
    "orderId": "uuid-do-pedido",
    "initPoint": "...",
    "sandboxInitPoint": "..."
  }
  ```
- **Erros**:
  - `400 Bad Request`: Payload malformado ou ID de pedido inválido.
  - `404 Not Found`: Pedido ou produtos associados não encontrados.
  - `409 Conflict`: Pedido sem itens ou já pago/cancelado (diferente de `PENDING`/`PAYMENT_PENDING`).
  - `500 Server Error`: Provedor ativo não configurado ou falha de comunicação/SDK.

---

### `POST /api/payments/mercadopago`
Gera a preferência de pagamento no Mercado Pago estritamente para um pedido pré-existente (Flow B) ou dinamicamente (Flow A).

- **Acesso**: Público.
- **Contratos (Dual)**:
  - **Fluxo Principal**: `{ "orderId": "uuid" }`
  - **Fluxo Legado**: `{ "items": [...], "customer": { ... }, "shipping": { ... } }`
- **Sucesso (200)**:
  ```json
  {
    "success": true,
    "checkoutUrl": "https://sandbox.mercadopago.com.br/...",
    "preferenceId": "pref-123456",
    "orderId": "order-cuid-001",
    "initPoint": "https://www.mercadopago.com.br/...",
    "sandboxInitPoint": "https://sandbox.mercadopago.com.br/...",
    "init_point": "...",
    "sandbox_init_point": "...",
    "orderCode": "GT-123456",
    "subtotal": 100.00,
    "shippingCost": 25.50,
    "total": 125.50
  }
  ```
- **Comportamento do Sandbox**:
  - Em ambientes de desenvolvimento (`development`) e teste (`test`), o `checkoutUrl` prioritário retornado será o `sandboxInitPoint` (`sandbox_init_point`).
  - Em ambientes de produção (`production`), o `checkoutUrl` retornado será o `initPoint` (`init_point`).
- **Erros**:
  - `400 Bad Request`: ID inválido ou ausente.
  - `404 Not Found`: Pedido inexistente no banco.
  - `409 Conflict`: Pedido sem itens ou já pago/cancelado.
  - `500 Server Error`: Token `MERCADO_PAGO_ACCESS_TOKEN` ausente ou falha no SDK.

---

### `POST /api/payments/mercadopago/webhook`
Recebe notificações de status em tempo real do Mercado Pago de forma robusta e idempotente.

- **Acesso**: Público (Protegido por assinatura HMAC `x-signature` se `MERCADO_PAGO_VALIDATE_WEBHOOK_SIGNATURE=true`).
- **Headers Requeridos (se validação ativa)**:
  - `x-signature`: Assinatura canônica contendo timestamp (`ts=...`) e hash HMAC (`v1=...`).
  - `x-request-id`: ID de rastreamento do Mercado Pago.
- **Efeitos Transacionais (Aprovado)**:
  - Executa sob transação isolada (`prisma.$transaction`).
  - Atualiza status do pedido para `PROCESSING` e status do pagamento para `APPROVED`.
  - Registra o ID de transação (`mpPaymentId` e `providerTransactionId`).
  - Deduz a quantidade vendida de `Product.stockQuantity` (o estoque físico nunca fica negativo).
  - Cria um registro de `InventoryLog` do tipo `ORDER` para cada item vendido.
  - Envia notificação por e-mail ao cliente.
- **Tratamento de Estoque Insuficiente**:
  - Se o estoque for menor que o requerido para qualquer produto do pedido, a transação aborta integralmente. O pedido permanece `PENDING` / `PAYMENT_PENDING` (não sofre baixa parcial nem fica negativo), e uma marcação de erro (`[ATENÇÃO: ESTOQUE INSUFICIENTE]`) é prefixada nas `notes` para intervenção manual imediata.
- **Idempotência Rigorosa**:
  - Eventos duplicados com o mesmo `paymentId` ou chamadas tardias sobre pedidos já aprovados (`APPROVED`) retornam sucesso imediato (`200 OK`) sem re-deduzir estoque ou duplicar logs.
- **Pagamentos Não Aprovados**:
  - Se o status for rejeitado (`rejected`, `cancelled`, etc.), atualiza o pedido para `CANCELLED` e `paymentStatus` para `REJECTED`, sem baixar estoque ou criar logs.
- **Erros**:
  - Retorna `401 Unauthorized` para assinaturas inválidas se ativo.
  - Retorna `500 Internal Server Error` amigável e blindado se o provedor estiver instável, sem vazar tokens/secrets ou logs internos.

---

### Provedor InfinityPay (Fallback Formal)

O provedor **InfinityPay** está marcado de forma explícita e controlada como **indisponível** (Fallback Formal). Qualquer tentativa de integração ou notificação sobre este gateway falhará de forma limpa e segura.

#### `POST /api/payments/infinitypay`
Checkout direto do provedor InfinityPay (Desativado).

- **Acesso**: Público.
- **Resposta de Erro Estrita (501)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_IMPLEMENTED",
      "message": "A integração com InfinityPay não está ativa ou está descontinuada. Use o Mercado Pago como provedor principal."
    }
  }
  ```

#### `POST /api/payments/infinitypay/webhook`
Recebimento de notificações de pagamento do InfinityPay (Desativado).

- **Acesso**: Público.
- **Resposta de Erro Estrita (501)**:
  ```json
  {
    "success": false,
    "error": {
      "code": "NOT_IMPLEMENTED",
      "message": "O webhook do InfinityPay não está ativo ou está descontinuada."
    }
  }
  ```

---

## 2. Autenticação

### `POST /api/auth/login`
- **Payload**: `{ "email": "...", "password": "..." }`
- **Sucesso**: `{ "success": true, "user": { ... } }` + Cookie `ip3d-admin-session`.
- **Proteção**: Rate limit por IP (5 tentativas / 15 min).
- **Dependências operacionais**: `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` configurados no servidor.

### `GET /api/auth/session`
- **Auth**: Lê o cookie de sessão e valida o usuário no banco.
- **Sucesso**: `{ "isLoggedIn": true, "userId": "...", "email": "...", "name": "...", "role": "ADMIN|SUPER_ADMIN|EDITOR" }`
- **Sem sessão válida**: `{ "isLoggedIn": false }`
- **Observação**: o payload retorna `role` na raiz da resposta.

### `POST /api/auth/forgot-password`
- **Acesso**: Público.
- **Payload**: `{ "email": "..." }`
- **Sucesso (200)**: Resposta neutra. `{ "success": true, "message": "..." }`.
- **Proteção**: Resposta idêntica para e-mail inexistente ou usuário inativo.

### `POST /api/auth/reset-password`
- **Acesso**: Público.
- **Payload**: `{ "token": "...", "password": "..." }`
- **Sucesso (200)**: `{ "success": true, "message": "Senha alterada com sucesso." }`.
- **Erros**: `400` (INVALID_TOKEN se expirado ou inexistente).

### `GET /api/auth/me`
- **Auth**: Exige sessão.
- **Resposta**: Dados do usuário logado ou `401`.

---

## 3. Produtos (Público)

### `GET /api/products`
Listagem pública com paginação e filtros complexos. Retorna **estritamente** produtos ativos.

- **Query Params** (validados via Zod):
  - `page` (number): Página atual (default: `1`).
  - `limit` (number): Itens por página (default: `9`, max: `50`).
  - `search` (string): Busca `case-insensitive` em nome, descrição ou categoria (min: 2 chars).
  - `category` (string): Slug exato da categoria.
  - `featured` (boolean): Filtrar apenas destaques (`true` ou `false`).
  - `minPrice` / `maxPrice` (number): Faixa de preços, considerando promoção ou original.
  - `sort` (enum): `newest` (padrão), `price_asc`, `price_desc`, `name_asc`, `featured`.
- **Sucesso (200)**: 
  ```json
  {
    "success": true,
    "data": {
      "items": [...],
      "pagination": { "page": 1, "limit": 9, "total": 12, "totalPages": 2, "hasNextPage": true, "hasPreviousPage": false }
    }
  }
  ```
- **Erros**: `400` (BAD_REQUEST em caso de query inválida).

### `GET /api/products/[slug]`
Detalhes completos de um produto específico para a loja. Retorna **apenas** se o produto for ativo.

- **Sucesso (200)**:
  ```json
  {
    "success": true,
    "data": {
      "product": { "id": "...", "slug": "...", "specifications": [...] },
      "relatedProducts": [ ... ]
    }
  }
  ```
- **Erros**: `404` (NOT_FOUND se inativo ou inexistente).
---

## 3.5. Analytics (Público com Consentimento)

Endpoints públicos para monitoramento de métricas anonimizadas de navegação e cliques com estrita conformidade de LGPD. A coleta é realizada exclusivamente após o consentimento ativo do usuário e as requisições respeitam a política *Do Not Track* (DNT) dos navegadores.

### `POST /api/analytics/pageview`
Registra visualização de página. Se o `User-Agent` corresponder a bots comuns (ex. Googlebot, bingbot) ou Lighthouse, a requisição é ignorada silenciosamente para preservar a sanidade das métricas do dashboard. O IP do cliente é mascarado/anonimizado e nunca é persistido em formato bruto.

- **Acesso**: Público.
- **Payload**:
  ```json
  {
    "path": "/produtos/filamento-pla-preto",
    "referrer": "/categorias/filamentos",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
  }
  ```
- **Sucesso - Registro Criado (201)**:
  ```json
  {
    "success": true,
    "id": "pageview-cuid"
  }
  ```
- **Sucesso - Bot Ignorado (200)**:
  ```json
  {
    "success": true,
    "ignored": true
  }
  ```
- **Erros**: `400` (BAD_REQUEST em caso de caminho vazio ou inválido).

---

### `POST /api/analytics/click`
Registra a interação de clique em CTAs estratégicos da loja. Permite monitorar conversões sem rastreamento invasivo.

- **Acesso**: Público.
- **Payload**:
  ```json
  {
    "path": "/",
    "label": "WhatsApp de Suporte",
    "type": "WHATSAPP",
    "target": "https://wa.me/5511999999999",
    "referrer": "direct"
  }
  ```
- **Campos e Regras**:
  - `type` (enum, obrigatório): `"CTA"`, `"WHATSAPP"`, `"EMAIL"`, `"DOWNLOAD"` ou `"OTHER"`.
  - `label` (string, opcional): Rótulo do elemento clicado (ex. texto do botão, truncado automaticamente para 100 caracteres).
- **Sucesso - Registro Criado (201)**:
  ```json
  {
    "success": true,
    "id": "click-cuid"
  }
  ```
- **Erros**: `400` (BAD_REQUEST se o tipo de clique for inválido ou ausente).

---

## 4. Admin (Restrito)

Todas as rotas em `/api/admin/*` exigem o cookie de sessão e autorização via Matriz RBAC.
Veja detalhes em [RBAC.md](./RBAC.md).

| Nível Exigido | Módulos |
| :--- | :--- |
| **SUPER_ADMIN** | Usuários, Configurações, Scripts |
| **ADMIN** | Produtos, Categorias, Estoque, Pedidos |
| **EDITOR** | Páginas, Banners, Home Sections |

### `GET /api/admin/dashboard`
Retorna indicadores, estatísticas operacionais reativas a períodos de tempo e alertas operacionais críticos em tempo real.

- **Acesso**: ADMIN+ (Bloqueia `EDITOR` com `403`)
- **Query Params** (Validados com Zod):
  - `period` (string, opcional): `"today"`, `"7d"`, `"30d"` (default) ou `"custom"`.
  - `startDate` (string, opcional): Data de início do período no formato `YYYY-MM-DD` (obrigatória para `period=custom`).
  - `endDate` (string, opcional): Data de fim do período no formato `YYYY-MM-DD` (obrigatória para `period=custom`).
- **Sucesso (200)**:
  ```json
  {
    "success": true,
    "stats": {
      "totalOrders": 15,
      "pendingOrders": 3,
      "approvedOrders": 10,
      "rejectedOrders": 2,
      "approvedRevenue": 2500.00,
      "ticketAverage": 250.00,
      "activeProducts": 42,
      "lowStockProducts": 4,
      "outOfStockProducts": 1,
      "pageViewsCount": 1200,
      "clicksCount": 340
    },
    "recentOrders": [
      {
        "id": "order-cuid",
        "code": "PE-123",
        "customerName": "Carlos Silva",
        "status": "PROCESSING",
        "paymentStatus": "APPROVED",
        "total": 350.00,
        "createdAt": "2026-05-17T09:45:00.000Z"
      }
    ],
    "recentInventoryLogs": [
      {
        "id": "log-cuid",
        "change": -2,
        "reason": "Ajuste manual",
        "createdAt": "2026-05-17T09:45:00.000Z",
        "product": {
          "name": "PLA Prata",
          "sku": "PLA-SLV"
        }
      }
    ],
    "topSoldProducts": [
      {
        "productId": "product-cuid",
        "name": "Filamento PLA Preto",
        "sku": "PLA-BLK",
        "quantity": 8,
        "total": 800.00
      }
    ],
    "alerts": [
      {
        "type": "PRODUCT_OUT_OF_STOCK",
        "message": "Produto PLA Neon (SKU: PLA-NEO) está totalmente sem estoque.",
        "referenceId": "product-cuid",
        "createdAt": "2026-05-17T09:45:00.000Z"
      }
    ]
  }
  ```
- **Erros**:
  - `400` (BAD_REQUEST em caso de período inválido ou datas inconsistentes/ausentes).
  - `401` (UNAUTHORIZED se o usuário não estiver autenticado).
  - `403` (FORBIDDEN se o usuário logado possuir papel de `EDITOR`).

### `GET /api/admin/products`
Listagem técnica de produtos (inclui inativos e detalhes de estoque).

### `POST /api/admin/products`
Criação de novos produtos. Valida schema via Zod.

### `GET /api/admin/inventory`
Lista produtos com informações de estoque ou recupera o histórico de movimentações com cálculos retrospectivos.

- **Acesso**: ADMIN+
- **Query Params**:
  - `page` (number): Página atual (default: `1`).
  - `limit` (number): Itens por página (default: `30`).
  - `search` (string): Busca por nome ou SKU do produto.
  - `filter` (string): Filtro de alertas (`"low"` para estoque baixo ou `"zero"` para fora de estoque).
  - `productId` (string): ID do produto específico para buscar o histórico de auditoria.
- **Sucesso (Histórico de Produto - 200)**:
  ```json
  {
    "success": true,
    "data": {
      "logs": [
        {
          "id": "log-cuid",
          "productId": "p-cuid",
          "change": -5,
          "quantity": 5,
          "reason": "Venda cancelada / Ajuste",
          "type": "ADJUSTMENT",
          "referenceId": "ref-123",
          "reference": "ref-123",
          "previousStock": 20,
          "newStock": 15,
          "createdAt": "2026-05-17T00:00:00.000Z"
        }
      ]
    }
  }
  ```

### `POST /api/admin/inventory`
Executa uma movimentação manual de estoque na forma de transação atômica Prisma.

- **Acesso**: ADMIN+
- **Payload**:
  ```json
  {
    "productId": "p-cuid",
    "action": "ENTRY | EXIT | CORRECTION | MANUAL",
    "quantity": 10,
    "reason": "Entrada de Filamento NF-999",
    "reference": "NF-999"
  }
  ```
- **Ações e Regras**:
  - `ENTRY` / `entrada`: Soma a quantidade especificada (deve ser positiva).
  - `EXIT` / `saída`: Subtrai a quantidade (deve ser positiva e menor ou igual ao estoque atual).
  - `CORRECTION` / `correção`: Define o estoque para o valor exato (deve ser não-negativo).
  - `MANUAL` / `ajuste`: Executa um delta manual (aceita valores positivos ou negativos).
  - **Validações**: O campo `reason` é obrigatório. O estoque final nunca pode ser negativo.
- **Sucesso (200)**:
  ```json
  {
    "success": true,
    "data": {
      "success": true,
      "product": { "id": "p-cuid", "name": "Filamento PLA", "stockQuantity": 30 },
      "log": {
        "id": "log-cuid",
        "change": 10,
        "quantity": 10,
        "reason": "Entrada de Filamento NF-999",
        "type": "ADJUSTMENT",
        "previousStock": 20,
        "newStock": 30,
        "reference": "NF-999"
      },
      "previousQty": 20,
      "newQty": 30
    }
  }
  ```

---

## 5. Frete

### `POST /api/shipping`
Calcula o custo e prazo de entrega via Correios com fallback automático.

- **Acesso**: Público.
- **Payload**:
  ```json
  {
    "cepDestino": "01001000",
    "peso": 0.5,
    "comprimento": 16,
    "altura": 5,
    "largura": 11
  }
  ```
- **Sucesso (200)**:
  ```json
  {
    "cepDestino": "01001000",
    "endereco": {
      "logradouro": "Praça da Sé",
      "bairro": "Sé",
      "cidade": "São Paulo",
      "uf": "SP"
    },
    "opcoes": [
      { "servico": "PAC", "valor": "22,50", "prazo": "5" },
      { "servico": "SEDEX", "valor": "35,00", "prazo": "2" }
    ],
    "estimativa": false
  }
  ```
- **Erros**:
  - `400 Bad Request`: Payload malformado, peso acima de 30kg, dimensões acima de 100cm, soma tridimensional acima de 200cm, ou CEP não encontrado/inválido.
  - `502 Bad Gateway`: Falha de rede ou queda no serviço externo de CEP (ViaCEP).
  - `504 Gateway Timeout`: Excedido tempo limite (timeout) de resposta do serviço externo de CEP.

---

## 6. Pedidos (Público & Criação Transacional)

### `POST /api/orders`
Cria um pedido de forma 100% transacional e atômica. Os preços dos itens e os totais de subtotal/total são recalculados de forma segura no servidor a partir do banco de dados, blindando contra fraudes do cliente.

- **Acesso**: Público.
- **Payload**:
  ```json
  {
    "customer": {
      "name": "João da Silva",
      "email": "joao@teste.com.br",
      "phone": "11999999999"
    },
    "address": {
      "cep": "01310100",
      "street": "Avenida Paulista",
      "number": "1000",
      "complement": "Apto 12",
      "neighborhood": "Bela Vista",
      "city": "São Paulo",
      "state": "SP"
    },
    "shipping": {
      "optionSelected": "SEDEX",
      "price": 29.9,
      "deliveryDays": 3
    },
    "items": [
      {
        "productId": "550e8400-e29b-41d4-a716-446655440000",
        "quantity": 2
      }
    ]
  }
  ```
- **Sucesso (201 Created)**:
  ```json
  {
    "success": true,
    "order": {
      "id": "order-cuid",
      "code": "GT-123456",
      "subtotal": 399.8,
      "shippingCost": 29.9,
      "total": 429.7,
      "status": "PENDING",
      "paymentStatus": "PAYMENT_PENDING",
      "createdAt": "2026-05-17T03:00:00.000Z"
    },
    "items": [
      {
        "id": "item-cuid",
        "productId": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Produto Teste",
        "sku": "produto-teste",
        "quantity": 2,
        "unitPrice": 199.9,
        "total": 399.8
      }
    ]
  }
  ```
- **Erros**:
  - `400 Bad Request`: Payload malformado/inválido de acordo com o esquema Zod, ou produto inativo.
  - `404 Not Found`: Produto do carrinho não localizado no banco de dados.
  - `409 Conflict`: Estoque físico insuficiente no banco de dados para a quantidade solicitada, ou tentativa de criação duplicada (barreira anti-double-click acionada para pedidos idênticos criados em menos de 1 minuto).
- **Políticas e Regras**:
  - **Baixa de Estoque**: Para evitar que checkouts abandonados travem ou esgotem o estoque da loja, os produtos **não são reservados nem baixados no momento da criação do pedido** (que permanece seguro como `PENDING`/`PAYMENT_PENDING`). A baixa de estoque real e o registro no `InventoryLog` são delegados estritamente à fase de **pagamento aprovado** (efetuada de forma atômica no webhook correspondente).
  - **Proteção Anti-Double-Click**: Se uma requisição com os mesmos itens e quantidades para o mesmo e-mail for enviada em um intervalo menor que 1 minuto, a API rejeitará a criação subsequente, retornando status `409 Conflict` (código `DUPLICATE_ORDER`).

---

## 6.5. Gestão Administrativa de Pedidos (Restrito a ADMIN+)

Esses endpoints fornecem controle completo operacional para o painel administrativo. 

### `GET /api/admin/orders`
Retorna uma lista paginada e filtrada de pedidos para fins logísticos e operacionais.

- **Acesso**: Restrito (Exige privilégios de `ADMIN` ou `SUPER_ADMIN`). Usuários com papel `EDITOR` recebem `403 Forbidden`.
- **Query Params** (validados via Zod):
  - `page` (number/string, opcional): Página atual para paginação (default: `1`).
  - `limit` (number/string, opcional): Número de itens por página (default: `20`).
  - `search` (string, opcional): Termo de busca que varre parcialmente o `code` (Código do Pedido), `customerName` ou `customerEmail`.
  - `status` (string, opcional): Filtra pelo status operacional do pedido (`OrderStatus` enum: `PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
  - `paymentStatus` (string, opcional): Filtra pelo status de pagamento (`PaymentStatus` enum: `PAYMENT_PENDING`, `PAID`, `APPROVED`, `REFUNDED`, `REJECTED`).
- **Sucesso (200 OK)**:
  ```json
  {
    "orders": [
      {
        "id": "order-uuid",
        "code": "PE-1001",
        "customerName": "Lucas Pinheiro",
        "customerEmail": "lucas@example.com",
        "customerPhone": "11988887777",
        "document": "123.456.789-00",
        "shippingStreet": "Av Paulista",
        "shippingNumber": "1000",
        "shippingCity": "São Paulo",
        "shippingState": "SP",
        "shippingZip": "01311-100",
        "notes": "Entregar na recepção",
        "status": "PENDING",
        "paymentStatus": "PAYMENT_PENDING",
        "subtotal": 100.0,
        "shippingCost": 15.0,
        "discount": 0.0,
        "total": 115.0,
        "createdAt": "2026-05-17T12:00:00.000Z",
        "items": [
          {
            "id": "item-uuid",
            "name": "Filamento PLA Preto",
            "sku": "FIL-PLA-PR",
            "quantity": 2,
            "unitPrice": 50.0,
            "total": 100.0
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
  ```
- **Erros**:
  - `401 Unauthorized`: Sessão inválida ou ausente.
  - `403 Forbidden`: Usuário autenticado, mas com papel inválido (ex: `EDITOR`).

### `GET /api/admin/orders/[id]`
Busca os detalhes completos de um único pedido pelo seu ID.

- **Acesso**: Restrito (`ADMIN` ou `SUPER_ADMIN`).
- **Sucesso (200 OK)**: Retorna o objeto completo do pedido e seus itens associados (idêntico ao elemento individual da lista de pedidos).
- **Erros**:
  - `401 Unauthorized`: Sessão inválida.
  - `403 Forbidden`: Acesso negado.
  - `404 Not Found`: Pedido correspondente ao ID informado não existe no banco de dados.

### `PATCH /api/admin/orders/[id]`
Atualiza o status operacional do pedido ou altera manualmente o status do pagamento.

- **Acesso**: Restrito (com regras de negócio RBAC e de máquina de estados estritas).
- **Payload Zod**:
  ```json
  {
    "status": "PROCESSING",         // Opcional. Enum OrderStatus
    "paymentStatus": "APPROVED"     // Opcional. Enum PaymentStatus (Exclusivo SUPER_ADMIN)
  }
  ```
- **Regras Estritas de RBAC**:
  - **`status` (Operacional)**: Pode ser alterado tanto por `ADMIN` quanto por `SUPER_ADMIN`.
  - **`paymentStatus` (Financeiro/Manual)**: **Exclusivo para `SUPER_ADMIN`**. Qualquer tentativa de um `ADMIN` comum de alterar manualmente o `paymentStatus` resultará em erro `403 Forbidden` (código `FORBIDDEN_FINANCIAL_CHANGE`).
- **Máquina de Estados de Status do Pedido (`OrderStatus`)**:
  As transições operacionais permitidas são estritamente:
  - `PENDING` &rarr; `PROCESSING` ou `CANCELLED`
  - `PROCESSING` &rarr; `SHIPPED` ou `CANCELLED`
  - `SHIPPED` &rarr; `DELIVERED`
  - Estados `DELIVERED` (Entregue) e `CANCELLED` (Cancelado) são terminais e **bloqueados** de qualquer alteração adicional de status.
  Qualquer transição inválida ou que tente alterar um pedido em status terminal resultará em `409 Conflict` (código `INVALID_STATUS_TRANSITION`).
- **Políticas e Regras**:
  - **Bloqueio de Estoque**: Para manter o rigor fiscal e físico, **nenhuma transição de status iniciada de forma manual via PATCH administrativo (inclusive cancelamento `CANCELLED`) acionará baixas ou reposições de estoque** nem gerará logs no `InventoryLog`. A movimentação de estoque física é delegada exclusivamente aos webhooks automatizados e homologados de pagamento do Mercado Pago.
- **Sucesso (200 OK)**:
  ```json
  {
    "success": true,
    "order": {
      "id": "order-uuid",
      "code": "PE-1001",
      "status": "PROCESSING",
      "paymentStatus": "PAYMENT_PENDING"
    }
  }
  ```
- **Erros**:
  - `400 Bad Request`: Payload malformado.
  - `401 Unauthorized`: Sessão inválida.
  - `403 Forbidden`: Papel de usuário sem privilégio (`EDITOR` no geral, ou `ADMIN` tentando alterar `paymentStatus`).
  - `404 Not Found`: Pedido inexistente.
  - `409 Conflict`: Transição de status inválida de acordo com a máquina de estados.

---

## 7. CMS & Layout (Público & Admin)

As APIs de CMS controlam o conteúdo dinâmico da página inicial (banners, seções de destaque) e o layout global (Header e Footer).

### `GET /api/banners`
Retorna todos os banners ativos ordenados ascendentemente por `order` e `createdAt`.
- **Acesso**: Público.
- **Sucesso (200)**:
  ```json
  {
    "banners": [
      { "id": "banner-id", "title": "...", "badge": "...", "subtitle": "...", "description": "...", "image": "...", "video": "...", "button1Text": "...", "button1Link": "...", "button1Color": "...", "button1Rounded": true, "order": 0, "active": true }
    ]
  }
  ```

### `GET /api/home-sections`
Retorna seções de conteúdo dinâmico ativas (como Diferenciais, Manutenção, Chamada de Catálogo).
- **Acesso**: Público.
- **Query Params**:
  - `sectionId` (string, opcional): Filtra uma única seção correspondente pelo seu ID operacional (ex: `"why-choose-us"`).
- **Sucesso (200)**:
  ```json
  {
    "sections": [
      { "id": "section-id", "sectionId": "why-choose-us", "title": "...", "subtitle": "...", "description": "...", "content": { ... }, "active": true, "order": 1 }
    ]
  }
  ```

### `GET /api/layout`
Retorna as configurações do Header ou Footer ativos.
- **Acesso**: Público.
- **Query Params**:
  - `type` (string, obrigatório): `"header"` ou `"footer"`.
  - `variant` (string, opcional): Variante de layout (default: `"main"`).
- **Sucesso (200)**:
  ```json
  {
    "config": { "id": "layout-id", "type": "header", "variant": "main", "content": { "links": [...] } }
  }
  ```

### `GET /api/admin/banners`
Lista todos os banners (tanto ativos quanto inativos) para o painel de administração.
- **Acesso**: EDITOR+

### `POST /api/admin/banners`
Cria um novo banner com validação Zod.
- **Acesso**: EDITOR+
- **Payload**:
  ```json
  {
    "title": "Novo Banner",
    "badge": "Lançamento",
    "subtitle": "Hotends Premium",
    "description": "...",
    "image": "/uploads/banner.jpg",
    "active": true,
    "order": 1
  }
  ```
- **Sucesso (201)**: `{ "success": true, "banner": { ... } }`

### `PUT /api/admin/banners/[id]`
Atualiza um banner existente. Retorna 404 caso o banner não exista no banco de dados.
- **Acesso**: EDITOR+
- **Sucesso (200)**: `{ "success": true, "banner": { ... } }`

### `DELETE /api/admin/banners/[id]`
Remove permanentemente um banner.
- **Acesso**: EDITOR+
- **Sucesso (200)**: `{ "success": true }`

### `POST /api/admin/home-sections`
Cria ou atualiza (upsert) uma seção da home baseada no `sectionId`.
- **Acesso**: EDITOR+
- **Payload**:
  ```json
  {
    "sectionId": "why-choose-us",
    "title": "Excelência",
    "content": { ... },
    "active": true
  }
  ```
- **Sucesso (200)**: `{ "success": true, "section": { ... } }`

### `PUT /api/admin/layout`
Cria ou atualiza (upsert) as configurações de Header ou Footer.
- **Acesso**: EDITOR+
- **Payload**:
  ```json
  {
    "type": "header",
    "variant": "main",
    "content": { "links": [...] }
  }
  ```
- **Sucesso (200)**: `{ "success": true, "config": { ... } }`

---

## Riscos Identificados e Pendências

### [P0] Segurança & Robustez
- **Webhooks**: Verificação de idempotência rigorosa em nível de banco de dados implementada sob transação Prisma atômica e proteção a nível de aplicação contra re-deduções de estoque. [Concluído TASK-26]
- **Rate Limit**: Atualmente em memória no login. Ineficaz em ambientes serverless multi-instância. [Pendência TASK-30]

### [P2] Padronização e Performance
- **Cache**: Consultas de frete e CEP não possuem cache, gerando latência e dependência excessiva de APIs externas (ViaCEP/Correios). [Pendência TASK-35]

---

## Auditoria de Cobertura

| Módulo | Documentado | Validação Zod | Teste de Erro |
| :--- | :--- | :--- | :--- |
| Checkout | Sim | Sim | Sim |
| Auth | Sim | Sim | Sim |
| Shipping | Sim | Sim | Sim |
| Admin | Sim | Sim | Parcial |
| Recovery | Sim | Sim | Sim |
| CMS & Layout | Sim | Sim | Sim |
| Pedidos | Sim | Sim | Sim |
