# Deploy manual na Hostinger

## Stack identificada

Este projeto é uma aplicação **Next.js 16 + React 19 + Prisma** com rotas de API, área administrativa, checkout/pagamentos e banco de dados.

Por isso, **não é um site estático para enviar direto em `public_html`**.

## Tipo de hospedagem recomendado

Use uma destas opções:

- **Hostinger VPS**, recomendado para controle de Node.js, PM2, banco e Nginx; ou
- **Hostinger Node.js Apps**, se o plano contratado tiver suporte a aplicação Node.js com variáveis de ambiente e processo persistente.

## Arquivo ZIP gerado

O pacote final esperado é:

```bash
hostinger-deploy.zip
```

Esse ZIP deve conter o código-fonte limpo para instalação no servidor, sem arquivos sensíveis ou dependências geradas.

## Arquivos e pastas que não devem ir no ZIP

Não incluir:

- `.git/`
- `node_modules/`
- `.env`
- `.env.local`
- `.env.production`
- `.next/`
- `.pnpm-store/`
- caches
- logs
- arquivos temporários
- outros arquivos `.zip`

## Instalação no servidor

Após enviar e extrair o ZIP no servidor:

```bash
npm install
```

ou, se usar pnpm:

```bash
corepack enable
pnpm install
```

## Variáveis de ambiente

Copie o exemplo:

```bash
cp .env.example .env
```

Edite o `.env` com os dados reais do servidor:

```bash
nano .env
```

Nunca envie o `.env` real para o GitHub ou dentro do ZIP público.

## Banco de dados

O projeto usa Prisma. Após configurar `DATABASE_URL`, execute:

```bash
npx prisma generate
npx prisma migrate deploy
```

Se for uma instalação inicial e o projeto exigir carga de dados:

```bash
npm run seed:prod
```

## Build de produção

```bash
npm run build
```

## Rodar em produção

```bash
npm start
```

Para VPS, recomenda-se usar PM2:

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

## Pasta final de publicação

Não há pasta `dist`, `build` ou `out` para upload direto em `public_html`.

Este projeto precisa rodar como aplicação Node.js/Next.js. Em VPS, use proxy reverso Nginx apontando para a porta do app, normalmente `3000`.

## Checklist

- [ ] Enviar somente `hostinger-deploy.zip`
- [ ] Extrair no diretório da aplicação no servidor
- [ ] Criar `.env` a partir de `.env.example`
- [ ] Configurar `DATABASE_URL`
- [ ] Rodar `npm install` ou `pnpm install`
- [ ] Rodar `npm run build`
- [ ] Rodar migrations do Prisma
- [ ] Iniciar com `npm start` ou PM2
- [ ] Configurar domínio/proxy reverso
- [ ] Testar home, produtos, admin, checkout e webhooks
