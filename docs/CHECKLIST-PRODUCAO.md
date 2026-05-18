# Guia de Observabilidade, Deploy e Checklist de Produção - IP3D

Este documento consolida as diretrizes operacionais de implantação, observabilidade, monitoramento de saúde do sistema e planos de contingência (rollback) para o ambiente de produção da IP3D.

---

## 🔍 1. Monitoramento e Saúde (Observabilidade)

### 1.1 Logger Seguro de Produção
O sistema possui um utilitário de logs estruturados em [src/lib/logger.ts](file:///c:/Users/LENOVO/.gemini/antigravity/scratch/IP3D/src/lib/logger.ts) projetado especificamente para:
- **Mascaramento Profundo de Secrets:** Qualquer payload contendo chaves como `password`, `senha`, `token`, `secret`, `jwt`, `access_token`, `authorization`, `cookie`, `session`, `cvv`, `card` ou `cpf` é automaticamente filtrado e substituído por `[REDACTED]`.
- **Estruturação de Logs (JSON):** Quando `NODE_ENV=production`, o logger emite strings JSON em linha única, facilitando a ingestão direta por coletores (ELK, CloudWatch, Datadog).

### 1.2 Endpoint de Health Check
O endpoint [/api/health](file:///c:/Users/LENOVO/.gemini/antigravity/scratch/IP3D/src/app/api/health/route.ts) deve ser monitorado por ferramentas de uptime (ex: Uptime Robot, Better Uptime) a cada 1 minuto.
- **Requisição:** `GET /api/health`
- **Comportamento Interno:** Executa uma query SQL ultra leve (`SELECT 1`) no banco de dados para garantir conectividade ponta a ponta sem expor stack traces ou strings de conexão.
- **Respostas Esperadas:**
  - **200 OK (Banco Online):**
    ```json
    {
      "status": "UP",
      "timestamp": "2026-05-17T19:00:00.000Z",
      "services": { "database": "UP" }
    }
    ```
  - **500 Internal Server Error (Banco Offline):**
    ```json
    {
      "status": "DOWN",
      "timestamp": "2026-05-17T19:00:00.000Z",
      "services": { "database": "DOWN" }
    }
    ```

---

## 🚀 2. Checklist Pré-Deploy e Variáveis Obrigatórias

Antes de efetuar qualquer publicação, garanta que as variáveis de ambiente a seguir estejam devidamente configuradas no servidor:

### 2.1 Variáveis Obrigatórias de Ambiente (`.env`)

| Variável | Valor Recomendado / Descrição | Gravidade |
| :--- | :--- | :--- |
| **`NODE_ENV`** | `production` | **Crítica** |
| **`SESSION_SECRET`** | String aleatória de no mínimo 32 caracteres gerada com criptografia | **Crítica** |
| **`DATABASE_URL`** | String de conexão segura com o PostgreSQL de produção (SSL ativado) | **Crítica** |
| **`NEXT_PUBLIC_SITE_URL`** | URL final de produção (ex: `https://seudominio.com`) | **Crítica** |
| **`MERCADO_PAGO_ACCESS_TOKEN`** | Token oficial de produção (Mercado Pago > Credenciais) | **Crítica** |
| **`MERCADO_PAGO_WEBHOOK_SECRET`** | Chave secreta de validação de Webhooks do Mercado Pago | **Alta** |
| **`MERCADO_PAGO_VALIDATE_WEBHOOK_SIGNATURE`**| `true` em produção (para bloquear ataques de falsificação) | **Alta** |
| **`SMTP_HOST`** / **`SMTP_PORT`** | Host e porta do provedor SMTP seguro | **Alta** |
| **`SMTP_USER`** / **`SMTP_PASS`** | Credenciais autenticadas para disparos de e-mails de compras | **Alta** |

---

## 🛠️ 3. Procedimento Operacional de Deploy

Ao publicar uma nova versão:

### Passo 1: Validação Local Estrita
Antes de commitar ou empacotar, rode na sua máquina local:
```bash
# 1. Validar e formatar schema Prisma
pnpm exec prisma validate

# 2. Executar toda a suíte de testes de regressão
pnpm test

# 3. Rodar análise estática de código (ESLint)
pnpm lint

# 4. Compilar aplicação
pnpm build
```

### Passo 2: Executar Migrations e Atualização do Banco
No VPS ou ambiente de produção, execute a aplicação das novas estruturas no banco de dados isoladamente:
```bash
pnpm prisma migrate deploy
```
> [!IMPORTANT]
> Nunca execute `prisma migrate dev` ou `prisma db push` em produção. O comando `migrate deploy` garante a execução sequencial segura sem destruição ou truncamento de dados existentes.

### Passo 3: Recarga de Processos (PM2)
Aplique o build e recarregue a aplicação em produção sem downtime:
```bash
pnpm install
pnpm build
pm2 reload gtmax3d
```

---

## 🩺 4. Checklist Pós-Deploy (Smoke Tests)

Imediatamente após a conclusão do deploy, execute as seguintes checagens manuais e automatizadas:

- [ ] **Health Check:** Acesse `https://seudominio.com/api/health` e garanta resposta HTTP 200 com `"status": "UP"`.
- [ ] **Certificado SSL:** Garanta que o site esteja com HTTPS válido e redirecionamento de HTTP ativado no Nginx.
- [ ] **Home & CMS:** Valide se a Home e seções de CMS estão renderizando perfeitamente sem quebras de layout.
- [ ] **Produtos:** Acesse `/produtos` e clique em uma PDP para validar o carregamento dinâmico.
- [ ] **Fluxo de Carrinho:** Adicione um produto ao carrinho e calcule o frete para assegurar conectividade com APIs.
- [ ] **Painel Administrativo:** Acesse `/login` e valide a autenticação MFA/Sessão do administrador.

---

## 🛡️ 5. Auditoria de Webhooks e Segurança Transacional

### 5.1 Webhook Mercado Pago
- Garanta que a URL de webhook cadastrada no painel de desenvolvedores do Mercado Pago aponte para:
  `https://seudominio.com/api/payments/mercadopago/webhook`
- Configure a propriedade `MERCADO_PAGO_VALIDATE_WEBHOOK_SIGNATURE=true` para forçar a validação criptográfica (HMAC-SHA256) das assinaturas do cabeçalho `x-signature` do webhook.
- O logger mascarará dados de compradores (`customerName`, `customerEmail`, `customerPhone`) e IDs de transações, expondo apenas mensagens descritivas do fluxo transacional para prevenção total contra roubos de dados de tráfego.

### 5.2 Limpeza Operacional do Analytics
Conforme implementado na **TASK-31**, o sistema conta com uma rotina automática e segura de expurgo de dados antigos de analytics e consentimento para manter o banco de dados saudável e em conformidade estrita com a LGPD.
- **Script de Retenção:** `scripts/cleanup-analytics.js`
- **Frequência:** Recomendado agendar via **Cron Job** do Linux (Crontab) para rodar toda madrugada às 03:00 AM:
  ```bash
  0 3 * * * cd /caminho/do/projeto && /usr/bin/node scripts/cleanup-analytics.js >> /var/log/ip3d-analytics-cleanup.log 2>&1
  ```

---

## 🚨 6. Plano de Contingência e Rollback Rápido

Caso ocorra um incidente grave pós-deploy (como falha catastrófica de checkout ou degradação crítica de performance):

### 6.1 Rollback de Gateway de Pagamento (Feature Flag)
Se a falha for localizada estritamente na comunicação ou processamento com o gateway ativo (ex: problemas na API do InfinityPay):
1. **Sem redeploy necessário:** Altere a flag `PAYMENT_PROVIDER` no arquivo `.env` para `mercadopago`.
2. **Reinicie o processo:**
   ```bash
   pm2 reload gtmax3d
   ```
3. A aplicação desviará imediatamente todos os checkouts pendentes e novos pagamentos para o gateway do Mercado Pago em menos de 5 segundos.

### 6.2 Rollback Total de Código
Se o erro for geral no build do sistema (Server Actions quebrados, erros de renderização globais, etc.):
1. **Reverta o commit no repositório de produção ou recupere o pacote ZIP anterior:**
   ```bash
   # Obter a tag ou commit estável anterior
   git checkout <TAG_VERSAO_ESTAVEL>
   ```
2. **Re-instale as dependências congeladas no lockfile e recompile o código estável:**
   ```bash
   pnpm install
   pnpm build
   ```
3. **Reinicie a aplicação imediatamente:**
   ```bash
   pm2 restart gtmax3d
   ```
4. **Verifique a recuperação:** Monitore logs operacionais (`pm2 logs`) e valide `/api/health`.

> [!CAUTION]
> **Atenção sobre Migrations:** Se o deploy mal-sucedido aplicou alguma migration destrutiva ou nova coluna no banco, revise as compatibilidades antes de restaurar o código anterior. Como regra de arquitetura da IP3D, novos campos devem sempre ser retrocompatíveis (nullable ou com default values) para viabilizar rollbacks sem a necessidade de reverter fisicamente a estrutura do banco de dados em tempo real.

---

## 💾 7. Política de Backup, Restore e Plano de Contingência de Dados

Garantir a integridade física do banco de dados e dos uploads de mídia (imagens dos produtos) é vital para a continuidade dos negócios do e-commerce IP3D.

### 7.1 Política de Backup (Frequência e Retenção)

| Recurso | Frequência | Retenção | Destino Recomendado |
| :--- | :--- | :--- | :--- |
| **Banco de Dados (PostgreSQL)** | Diário (01:00 AM) | 30 dias | Armazenamento frio externo criptografado (ex: AWS S3 / Backblaze B2) |
| **Uploads e Mídias (Vercel Blob)** | Semanal | 90 dias | Cópia local compactada / Backup frio no VPS |
| **Variáveis Críticas (`.env`)** | A cada alteração | Vitalício | Gerenciador de credenciais seguro corporativo |

### 7.2 Execução de Backup do Banco (PostgreSQL)
O sistema conta com um utilitário seguro de backup que não expõe secrets nos logs:
```bash
# 1. Simular e validar a instrução de dump sem executar
pnpm db:backup-dry-run

# 2. Executar o backup físico
pnpm db:backup
```
*   **Destino padrão:** Os dumps são gerados no diretório `/backups/` com estampa de data e hora (`ip3d_backup_YYYYMMDD_HHMMSS.sql`). Este diretório está listado no `.gitignore` para evitar commits acidentais de dados de clientes.

### 7.3 Execução de Restore do Banco (PostgreSQL)
A restauração do banco de dados é uma **operação altamente destrutiva** que sobrescreve tabelas ativas.
Por motivos de segurança extrema, o script de restauração **recusa a execução** a menos que o usuário passe explicitamente a flag `--confirm`:
```bash
# 1. Simular o restore sem aplicar alterações (altamente recomendado antes do restore real)
pnpm db:restore-dry-run --file ./backups/ip3d_backup_20260517_190000.sql

# 2. Executar a restauração real com sobreposição do banco ativo
pnpm db:restore --file ./backups/ip3d_backup_20260517_190000.sql --confirm
```

### 7.4 Backup e Restore de Mídias (Vercel Blob)
As imagens de produtos e banners da IP3D estão alocadas na nuvem do Vercel Blob de forma altamente distribuída e redundante. Em caso de desastre ou migração de bucket:
*   **Backup Frio de Mídias:** Rodar script de download ou exportação de mídia via Vercel CLI:
    ```bash
    vercel blob pull
    ```
*   **Restore de Mídias:** Em caso de perda completa do bucket, crie um novo token `BLOB_READ_WRITE_TOKEN`, atualize no arquivo `.env` da produção, e faça o upload em lote dos arquivos de imagem usando o painel administrativo ou o Vercel CLI.

### 7.5 Teste Periódico de Restore (Disaster Recovery Testing)
A cada **3 meses**, a equipe de infraestrutura deve executar um teste simulado de recuperação de dados em um banco de homologação isolado:
1.  Obter um dump recente de produção.
2.  Subir uma base de dados local/homologação vazia.
3.  Executar a restauração usando `pnpm db:restore --file <dump> --confirm`.
4.  Roda toda a suíte de testes de integração (`pnpm test`) contra essa base restaurada para validar a integridade estrutural.

### 7.6 Checklist Pós-Restore
Após a restauração do banco de dados, o engenheiro operacional deve obrigatoriamente validar as seguintes condições antes de restabelecer o tráfego público do e-commerce:

- [ ] **Sanidade Estrutural:** Rodar `pnpm exec prisma validate` para checar compatibilidade de schema.
- [ ] **Contagem de Produtos:** Validar se a contagem de produtos cadastrados no banco confere com o inventário real.
- [ ] **Integridade Transacional:** Verificar se os últimos pedidos e logs de estoque (`InventoryLog`) estão consistentes.
- [ ] **Conexões de Imagens:** Acessar a listagem `/produtos` e conferir se todas as imagens de produtos (com caminhos alocados no Vercel Blob) estão abrindo sem erro HTTP 404.
- [ ] **Acesso Administrativo:** Tentar efetuar login no painel de administração com as credenciais antigas recuperadas no backup.

---

## 🛡️ 8. Gestão Segura de Seeds, Dados Iniciais e Separação de Ambientes

Para evitar a desconfiguração ou sobrescrita acidental de dados de produção reais (produtos, banners cadastrados, configurações de CMS), a IP3D implementa regras rígidas de segurança para seeds e uma separação estrita de ambientes operacionais.

### 8.1 Separação de Ambientes (Dev, Staging, Produção)

1.  **Ambiente de Desenvolvimento (`development`)**
    *   **Identificação:** Variável `NODE_ENV=development`.
    *   **Permissões:** Execução livre de seeds sem confirmação. Permite o uso de credenciais e senhas padrões (`Ip3d@2026`).
2.  **Ambiente de Homologação/Staging (`staging`)**
    *   **Identificação:** `NODE_ENV=production` ou `staging`.
    *   **Objetivo:** Espelhar comportamento idêntico ao de produção para homologar novas releases sem interferir na operação comercial real.
3.  **Ambiente de Produção (`production`)**
    *   **Identificação:** Variável `NODE_ENV=production` ativa em todas as instâncias PM2 e VPS.
    *   **Proteções Automáticas:** Bloqueio imediato de qualquer comando destrutivo sem consentimento explícito, ocultação completa de senhas e dados confidenciais nos logs e validação rigorosa de credenciais.

### 8.2 Proteção Contra Seeds Acidentais em Produção

Se a aplicação estiver executando sob `NODE_ENV=production`, todos os scripts utilitários de banco e CMS **recusam a execução** a menos que recebam explicitamente a flag `--confirm`:
```bash
# Execução bloqueada por padrão em produção (Prevenção de erro humano)
pnpm seed:prod

# Execução segura em lote com repasse de consentimento
pnpm seed:prod:safe
```
*   **Idempotência:** Todos os seeds utilizam `upsert` do Prisma. Não haverá duplicação de categorias ou produtos em caso de múltiplas execuções, porém a flag `--confirm` impede a desconfiguração visual de banners customizados pelo administrador no painel.
*   **Mascaramento de Credenciais:** Em ambiente de produção, os logs finais de seeds não exibem senhas físicas ou secrets no stdout, blindando os coletores de logs contra vazamentos involuntários.

### 8.3 Hardening do Administrador Geral (`create-admin.js`)

O setup ou recuperação de contas administrativas de alto privilégio (`SUPER_ADMIN`) possui validações criptográficas severas em ambiente produtivo:
*   **Rejeição de Credenciais Padrão:** É estritamente proibido rodar o setup administrativo com a senha padrão (`Ip3d@2026`) sob `NODE_ENV=production`. O script aborta a criação imediatamente por segurança.
*   **Complexidade Exigida em Produção:** A senha fornecida via `ADMIN_PASSWORD` em ambiente produtivo deve obrigatoriamente atender à política de segurança corporativa:
    *   Mínimo de **12 caracteres** de comprimento.
    *   Conter ao menos **uma letra maiúscula** (`[A-Z]`).
    *   Conter ao menos **uma letra minúscula** (`[a-z]`).
    *   Conter ao menos **um número** (`[0-9]`).
    *   Conter ao menos **um caractere especial** (`[!@#$%^&*(),.?":{}|<>]`).


