# Deploy na Hostinger (VPS/Node.js)

## 1. Empacotamento limpo para Hostinger

Se o deploy for enviado por ZIP, gere sempre o pacote limpo antes do upload:

```bash
pnpm run deploy:hostinger
```

Isso cria `hostinger-deploy.zip` na raiz do projeto e remove automaticamente do pacote:

- `node_modules`
- `.next`
- `.claude`
- `.git`
- `.pnpm-store`
- `.env`
- `.npmrc`
- `desktop.ini`, `Thumbs.db`, `.DS_Store`
- logs, arquivos temporários, `.tsbuildinfo`
- outros `.zip`

### Observações importantes

- envie apenas o `hostinger-deploy.zip`
- não compacte a pasta inteira manualmente pelo Explorer do Windows
- se o painel da Hostinger reaproveitou arquivos antigos, remova o build anterior antes de reenviar
- se existir acesso SSH, limpe restos de tentativa anterior antes do novo deploy

Exemplo:

```bash
rm -rf ~/domains/SEU_DOMINIO/public_html/.builds/source/node_modules
find ~/domains/SEU_DOMINIO/public_html/.builds/source -name 'desktop.ini' -delete
```

---

## 2. Ambiente do projeto

Este projeto usa:

- `Next.js 16.0.8`
- `React 19.2.1`
- `Prisma 5.22.0`
- `pnpm` como gerenciador preferencial
- `PM2` para manter a aplicação online no VPS

### Scripts atuais do projeto

```json
{
  "dev": "next dev -p 3003",
  "build": "prisma generate && next build",
  "start": "next start",
  "lint": "eslint",
  "seed": "node scripts/seed-components.js",
  "deploy:hostinger": "node scripts/generate-posix-zip.js"
}
```

---

## 3. Preparação do VPS

### 3.1. Acesso ao servidor

- conecte via SSH ao VPS da Hostinger
- atualize o sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 3.2. Instalar dependências básicas

```bash
# Node.js 20 LTS recomendado para o projeto atual
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git
sudo apt install git -y

# PM2
sudo npm install -g pm2
```

Se preferir usar `pnpm` no servidor:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

---

## 4. Clonar ou enviar o projeto

### 4.1. Via Git

```bash
git clone <URL-DO-REPOSITORIO> gtmax3d
cd gtmax3d
```

### 4.2. Via ZIP

Se você estiver usando o `hostinger-deploy.zip`, envie o arquivo para o servidor e extraia no diretório correto do deploy.

---

## 5. Instalar dependências

```bash
pnpm install
```

---

## 6. Variáveis de ambiente

Copie o modelo e ajuste com os dados do servidor:

```bash
cp .env.example .env
nano .env
```

### Variáveis do projeto

```env
SESSION_SECRET=change_this_with_at_least_32_chars
DATABASE_URL="postgresql://user:password@localhost:5432/site_base"

MERCADO_PAGO_ACCESS_TOKEN=
MERCADO_PAGO_WEBHOOK_SECRET=
MERCADO_PAGO_VALIDATE_WEBHOOK_SIGNATURE=false

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
SALES_NOTIFICATION_EMAIL=

WEB3FORMS_ACCESS_KEY=

BLOB_READ_WRITE_TOKEN=vercel_blob_token_here

NEXT_PUBLIC_SITE_URL=https://seudominio.com
```

### Observações

- `SESSION_SECRET` é obrigatório em produção e deve ter no mínimo 32 caracteres
- `DATABASE_URL` precisa apontar para o banco real do ambiente
- `NEXT_PUBLIC_SITE_URL` deve ser o domínio público final
- `MERCADO_PAGO_VALIDATE_WEBHOOK_SIGNATURE` só deve ficar `true` quando a validação estiver configurada corretamente

---

## 7. Banco de dados

### 7.1. Gerar client e aplicar migrations

```bash
pnpm prisma migrate deploy
pnpm prisma generate
```

Como o script de build já executa `prisma generate`, em muitos casos basta:

```bash
pnpm build
```

### 7.2. Seed inicial, se necessário

Se você quiser carregar os produtos iniciais:

```bash
pnpm run seed
```

---

## 8. Build e execução

### 8.1. Build de produção

```bash
pnpm build
```

### 8.2. Processo com PM2

O arquivo atual `ecosystem.config.js` usa:

- nome do processo: `gtmax3d`
- comando: `npm start`
- porta: `3000`

Conteúdo atual:

```js
module.exports = {
  apps: [{
    name: 'gtmax3d',
    script: 'npm',
    args: 'start',
    cwd: './',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

Subir com PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Para reiniciar depois de atualizar:

```bash
pm2 restart gtmax3d
```

---

## 9. Nginx

### 9.1. Instalar

```bash
sudo apt install nginx -y
```

### 9.2. Configuração básica

Exemplo de arquivo em `/etc/nginx/sites-available/gtmax3d`:

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar:

```bash
sudo ln -s /etc/nginx/sites-available/gtmax3d /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 10. SSL com Let's Encrypt

### 10.1. Instalar Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 10.2. Emitir certificado

```bash
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

### 10.3. Renovação automática

```bash
sudo crontab -e
```

Adicionar:

```bash
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 11. Integrações críticas

### 11.1. Mercado Pago

Conferir no painel do Mercado Pago:

- webhook apontando para `https://seudominio.com/api/payments/mercadopago/webhook`
- eventos de pagamento ativos
- credenciais de produção configuradas corretamente

### 11.2. Notificações por e-mail e fallback

Se o fluxo de vendas usar SMTP, conferir:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SALES_NOTIFICATION_EMAIL`

Se o fallback usar Web3Forms, conferir:

- `WEB3FORMS_ACCESS_KEY`

---

## 12. Atualização do projeto

Quando houver nova versão:

```bash
git pull
pnpm install
pnpm build
pm2 restart gtmax3d
```

Se estiver usando ZIP:

1. gerar novamente com `pnpm run deploy:hostinger`
2. enviar apenas o `hostinger-deploy.zip`
3. remover o build antigo no painel, se necessário
4. reiniciar o processo após a atualização

---

## 13. Troubleshooting

### 13.1. Erros comuns

- **Porta 3000 ocupada**  
  Verifique com `sudo lsof -i :3000`

- **Permissões incorretas**  
  Ajuste o dono dos arquivos do projeto no VPS

- **Arquivos antigos reaproveitados pelo painel**  
  Remova o build anterior e envie novamente o ZIP limpo

- **Erro `npm EACCES rename ... node_modules/desktop.ini`**  
  Isso normalmente indica que um arquivo de sistema do Windows ou uma pasta `node_modules` antiga foi parar no upload. Gere o ZIP limpo novamente e faça um novo deploy

### 13.2. Verificação do ambiente

```bash
pm2 status
pm2 logs gtmax3d --lines 100
nginx -t
```

---

## 14. Checklist pós-deploy

- [ ] Site acessível via HTTPS
- [ ] Home carregando corretamente
- [ ] Página de produtos funcionando
- [ ] Página de produto individual funcionando
- [ ] Login admin funcionando
- [ ] Banco conectado corretamente
- [ ] Checkout Mercado Pago redirecionando
- [ ] Webhook recebendo pagamentos
- [ ] E-mails/notificações enviando
- [ ] Logs sem erros críticos

---

## 15. Resumo rápido

Comando para gerar o pacote de deploy:

```bash
pnpm run deploy:hostinger
```

Arquivo final esperado:

```bash
hostinger-deploy.zip
```

Esse é o único arquivo que deve ser enviado para a Hostinger quando o deploy for feito por ZIP.
