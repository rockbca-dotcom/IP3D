# Deploy na Hostinger (VPS/Node.js)

## Empacotamento limpo para Hostinger

Se o deploy estiver sendo enviado por ZIP, gere sempre um pacote limpo antes do upload:

```bash
npm run deploy:hostinger
```

Isso cria `hostinger-deploy.zip` na raiz do projeto, excluindo:
- `node_modules`
- `.next`
- `.claude`
- `.env`
- `desktop.ini`, `Thumbs.db`, `.DS_Store`
- logs, arquivos temporarios e outros `.zip`

### Erro `npm EACCES rename ... node_modules/desktop.ini`

Esse erro acontece quando arquivos de sistema do Windows ou um `node_modules` local vao junto no upload para o Linux da Hostinger.

Antes de reenviar:
- remova o build anterior no painel da Hostinger, se ele tiver reaproveitado arquivos de uma tentativa anterior
- envie apenas o `hostinger-deploy.zip`
- nao compacte a pasta inteira manualmente pelo Explorer do Windows

Se tiver acesso SSH, limpe o resquicio da tentativa anterior antes do novo deploy:

```bash
rm -rf ~/domains/SEU_DOMINIO/public_html/.builds/source/node_modules
find ~/domains/SEU_DOMINIO/public_html/.builds/source -name 'desktop.ini' -delete
```

Este guia cobre o deploy do projeto GTMax3D em um servidor Hostinger com Node.js e banco Neon PostgreSQL.

## 1. Preparação do Ambiente

### 1.1. Acesso ao Servidor
- SSH para o servidor fornecido pela Hostinger
- Atualizar sistema: `sudo apt update && sudo apt upgrade -y`

### 1.2. Instalar Dependências
```bash
# Node.js 18+ (usar nvm se preferir)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 para gerenciamento de processos
sudo npm install -g pm2

# Git (se não tiver)
sudo apt install git -y
```

## 2. Clonar e Configurar Projeto

### 2.1. Repositório
```bash
git clone <URL-DO-REPOSITORIO> gtmax3d
cd gtmax3d
```

### 2.2. Instalar Dependências
```bash
pnpm install
```

### 2.3. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
nano .env
```

**Variáveis obrigatórias:**
```env
# URL pública do site (substitua pelo seu domínio)
NEXT_PUBLIC_SITE_URL=https://seudominio.com

# Banco Neon (obtido no painel Neon)
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/db?sslmode=require

# Mercado Pago (criar em: https://www.mercadopago.com.br/developers)
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxx # ou PROD-xxx
MERCADO_PAGO_WEBHOOK_SECRET=seu-secreto-aqui
MERCADO_PAGO_WEBHOOK_URL=https://seudominio.com/api/payments/mercadopago/webhook

# Web3Forms (obtido em: https://web3forms.com/)
WEB3FORMS_ACCESS_KEY=57bdcea1-af3e-46ff-8f81-f49c6cc9f8b6

# Sessão (gerar com: openssl rand -base64 32)
SESSION_SECRET=chave-secreta-32-caracteres-ou-mais

# Upload (opcional, se usar Vercel Blob)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_token
```

## 3. Banco de Dados (Neon)

### 3.1. Migrations
```bash
pnpm prisma migrate deploy
pnpm prisma generate
```

### 3.2. Seed Inicial (Produtos)
```bash
# Importar os 15 produtos de exemplo
curl -X POST http://localhost:3000/api/seed-products
```

## 4. Build e Inicialização

### 4.1. Build
```bash
pnpm build
```

### 4.2. PM2 - Process Manager
Criar `ecosystem.config.js`:
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

Iniciar com PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 5. Nginx (Proxy Reverso)

### 5.1. Instalar Nginx
```bash
sudo apt install nginx -y
```

### 5.2. Configurar Site
Criar `/etc/nginx/sites-available/gtmax3d`:
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

Ativar site:
```bash
sudo ln -s /etc/nginx/sites-available/gtmax3d /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 6. SSL (Let's Encrypt)

### 6.1. Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
```

### 6.2. Renovação Automática
```bash
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 7. Mercado Pago - Webhook

### 7.1. Configurar URL
No painel Mercado Pago > Webhooks > Adicionar:
- URL: `https://seudominio.com/api/payments/mercadopago/webhook`
- Eventos: `payment`
- Modo: Produção (ou Teste durante homologação)

### 7.2. Validar
- Após criar preferência, o webhook deve receber notificações
- Logs PM2: `pm2 logs gtmax3d`

## 8. Manutenção

### 8.1. Atualizar Projeto
```bash
git pull
pnpm install
pnpm build
pm2 restart gtmax3d
```

### 8.2. Backup (Neon)
- Neon faz backup automático
- Para backup manual: painel Neon > Backups

### 8.3. Logs
```bash
pm2 logs gtmax3d --lines 100
```

## 9. Troubleshooting

### 9.1. Erros Comuns
- **Porta 3000 ocupada**: `sudo lsof -i :3000` e matar processo
- **Permissões**: garantir usuário dono dos arquivos
- **Memória**: aumentar `max_memory_restart` no PM2

### 9.2. Saúde do Sistema
```bash
pm2 monit
pm2 status
nginx -t
```

## 10. Pós-Deploy Checklist

- [ ] Site acessível via HTTPS
- [ ] Páginas carregando (Home, Produtos, Admin)
- [ ] Login admin funcionando
- [ ] Produtos visíveis (rodar seed se necessário)
- [ ] Checkout Mercado Pago redirecionando
- [ ] Webhook recebendo pagamentos
- [ ] Notificações Web3Forms enviando
- [ ] Logs sem erros críticos

---

**Contato de Suporte**: Se precisar de ajuda com o deploy, abrir ticket no painel Hostinger ou consultar documentação oficial.
