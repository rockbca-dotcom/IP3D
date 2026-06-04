# Variáveis de Ambiente — IP3D

Este documento detalha as variáveis de ambiente necessárias para o funcionamento do IP3D, classificadas por importância e contexto.

A validação dessas variáveis é feita centralizadamente em `src/lib/env.ts`.

---

## Core (Obrigatórios)

| Variável | Descrição | Regras |
| :--- | :--- | :--- |
| `DATABASE_URL` | URL de conexão com o PostgreSQL. | Obrigatória no servidor. |
| `SESSION_SECRET` | Segredo para criptografia de cookies (iron-session). | Mínimo 32 caracteres. Bloqueia placeholders em produção. |
| `NEXT_PUBLIC_SITE_URL` | URL base do site (ex: `https://ip3d.com.br`). | Usada para redirecionamentos, webhooks, links de recuperação de senha, tags canonical, robots.txt e sitemap.xml. |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase. | Obrigatória para login admin, sessão e `/api/health` em runtime serverless. |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role do Supabase. | Obrigatória no servidor. Nunca expor no client. |

---

## Pagamentos

O sistema utiliza o `PAYMENT_PROVIDER` para decidir qual conjunto de variáveis validar.

### Geral
- `PAYMENT_PROVIDER`: `mercadopago` (padrão) ou `infinitypay`.

### Mercado Pago
Obrigatórios se `PAYMENT_PROVIDER="mercadopago"`:
- `MERCADO_PAGO_ACCESS_TOKEN`: Token de acesso da aplicação no MP.
- `MERCADO_PAGO_WEBHOOK_SECRET`: Secret para validar assinaturas de notificações (recomendado em produção).
- `MERCADO_PAGO_VALIDATE_WEBHOOK_SIGNATURE`: Flag de controle para ativar/desativar a validação de assinatura criptográfica HMAC do webhook (`"true"` para ativar).
- `MERCADO_PAGO_WEBHOOK_URL`: (Opcional) Sobrescreve a URL automática de notificações.

### InfinityPay (Desativado / Fallback Formal)
> [!NOTE]
> Este provedor foi descontinuado temporariamente em favor do **Mercado Pago** (provedor principal e ativo). Suas variáveis continuam mapeadas no arquivo `src/lib/env.ts` para compatibilidade com a suite de testes, mas estão marcadas como **inativas/reservadas**.

- `INFINITYPAY_HANDLE`: Identificador da conta (inativo).
- `INFINITYPAY_API_KEY`: Chave de API para criação de links de pagamento (inativo).
- `INFINITYPAY_WEBHOOK_SECRET`: Secret para validação do webhook (inativo).
- `INFINITYPAY_REDIRECT_URL`: (Opcional) URL de retorno após pagamento (inativo).
- `INFINITYPAY_WEBHOOK_URL`: (Opcional) URL para recebimento de notificações (inativo).

---

## Notificações (Opcionais para Vendas, Necessárias para Recovery)

O sistema tenta enviar emails via SMTP. Se falhar ou não estiver configurado, tenta via Web3Forms.
**Atenção**: Para que a recuperação de senha funcione, o envio de e-mail deve estar configurado e funcional.

### SMTP
- `SMTP_HOST`: Host do servidor de email.
- `SMTP_PORT`: Porta (ex: 587 ou 465).
- `SMTP_USER`: Usuário de autenticação.
- `SMTP_PASS`: Senha de autenticação.
- `SMTP_FROM`: Email do remetente.
- `SALES_NOTIFICATION_EMAIL`: Email que receberá os alertas de vendas.

### Web3Forms
- `WEB3FORMS_ACCESS_KEY`: Chave de acesso para o serviço Web3Forms.

---

## Storage & Uploads

- `BLOB_READ_WRITE_TOKEN`: Token para o Vercel Blob (Upload de imagens de produtos).
- `NEXT_PUBLIC_BLOB_URL`: URL base para exibição de imagens do Blob no frontend.

---

## Segurança & Admin

- `NODE_ENV`: Define o ambiente operacional (`development`, `staging`, `production`). Usado para aplicar proteções automáticas contra execuções de seeds acidentais e mascaramento profundo de credenciais em logs de produção.
- `ADMIN_SETUP_SECRET`: Segredo opcional para proteger o endpoint `/api/auth/setup`. Se definido, o endpoint exigirá o header `X-Setup-Secret`.
- `ADMIN_EMAIL`: E-mail de login do super-administrador inicial (Padrão: `admin@ip3d.com.br`).
- `ADMIN_PASSWORD`: Senha de login do super-administrador inicial.
  > [!IMPORTANT]
  > **Hardening de Senha em Produção:** Se `NODE_ENV="production"`, o script de setup de admin (`scripts/create-admin.js`) rejeita sumariamente a senha padrão (`Ip3d@2026`) ou qualquer senha fraca. A senha configurada deve ter no mínimo 12 caracteres, contendo pelo menos uma maiúscula, uma minúscula, um número e um caractere especial.

---

## Como Gerar um SESSION_SECRET Seguro

No terminal, execute:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copia e cola o resultado no seu `.env`.

