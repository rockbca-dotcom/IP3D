# Definition of Done (DoD) — IP3D

Este documento define os critérios obrigatórios para que uma demanda (Task/Issue) seja considerada **CONCLUÍDA** e pronta para o Merge.

---

## 1. Código e Qualidade
- [ ] **Lint**: `pnpm lint` deve passar sem erros (0 erros).
- [ ] **Build**: `pnpm build` deve gerar o pacote de produção com sucesso.
- [ ] **Types**: TypeScript não deve possuir erros (removendo `typescript.ignoreBuildErrors` progressivamente).
- [ ] **Clean Code**: O código deve seguir os padrões do projeto, sem comentários desnecessários ou código morto.

---

## 2. Testes (TDD Obrigatório)
- [ ] **Unitários**: Toda nova lógica de negócio ou utilitário deve possuir testes unitários no Vitest.
- [ ] **Integração**: Fluxos complexos (ex: Checkout, Webhooks) devem possuir testes de integração com banco mockado.
- [ ] **Contrato (API)**: Novos endpoints ou mudanças em existentes devem possuir testes de contrato validando Payload/Response.
- [ ] **Cobertura**: A cobertura global não deve diminuir com a nova entrega. `pnpm test:coverage` deve ser executado.
- [ ] **Estabilidade**: Todos os 56+ testes legados devem continuar passando (`pnpm test`).

---

## 3. Banco de Dados (Prisma)
- [ ] **Schema**: O schema deve estar válido (`pnpm exec prisma validate`).
- [ ] **Client**: O client deve ser gerado sem erros (`pnpm exec prisma generate`).
- [ ] **Migrations**: Mudanças de schema devem possuir migrations documentadas (ou documentar se foi usado `db push` em dev).

---

## 4. Segurança & LGPD
- [ ] **Secrets**: Verificação rigorosa para garantir que nenhuma credencial foi versionada.
- [ ] **Input**: Todas as entradas de usuário via API ou forms devem ser validadas (Zod).
- [ ] **Auth**: Novas rotas administrativas devem usar os helpers de proteção de sessão.
- [ ] **Privacidade**: Nenhuma informação pessoal identificável (PII) deve ser exposta em logs de erro ou console.
- [ ] **Consentimento (LGPD)**: Qualquer funcionalidade de rastreamento de tráfego, pixels ou captação de métricas de navegação/clique deve exigir consentimento ativo (aceitação de cookies/preferências) antes de iniciar qualquer disparo HTTP do lado do cliente.
- [ ] **Do Not Track (DNT)**: Sistemas de tracking devem ler e respeitar estritamente a preferência *Do Not Track* do navegador do usuário (`window.navigator.doNotTrack === "1"`).
- [ ] **Anonimização de IP**: Endereços IP coletados para fins de segurança ou analytics devem ser obrigatoriamente anonimizados (ex. mascaramento do último octeto no IPv4 ou últimos 80 bits no IPv6) e nunca gravados em formato bruto.
- [ ] **Retenção de Dados**: Toda nova funcionalidade que persista registros de logs, auditorias secundárias, estatísticas ou dados temporários deve formalizar uma política de ciclo de vida e retenção (ex: 180 dias) e disponibilizar scripts seguros de limpeza/descarte periódico.
- [ ] **Headers HTTP Globais**: Cabeçalhos de segurança básicos (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`, `Permissions-Policy`, e CSP mínima) devem ser servidos globalmente no arquivo `next.config.ts`.
- [ ] **Rate Limiting nas APIs**: Endpoints públicos sensíveis ou expostos a abuso de força bruta (ex: login, forgot-password, reset-password, leads, shipping, analytics, orders) devem obrigatoriamente possuir limitador de taxa (Rate Limit) baseado em IP do cliente.
- [ ] **Segurança de Cookies**: Cookies de sessão administrativa devem possuir obrigatoriamente as diretivas `httpOnly`, `secure` (ativo em produção), `sameSite` e `path` configurados de forma restrita e estrita.
- [ ] **Erros Seguros (500)**: Mensagens de erro de runtime internas (Status 500) devem retornar mensagens amigáveis e neutras em produção para impedir vazamento de secrets, credenciais ou stack traces do sistema.

---

## 5. SEO Técnico & Indexação (TASK-32)
- [ ] **Sitemaps**: O sitemap dinâmico deve expor apenas home, páginas institucionais publicadas, produtos ativos e categorias ativas, excluindo totalmente `/admin`, `/api`, e rotas sensíveis como carrinho, checkout ou login.
- [ ] **Robots**: O arquivo robots deve desautorizar explicitamente a indexação de `/admin`, `/api`, `/carrinho`, `/checkout` e `/login`, apontando para a URL do sitemap absoluto.
- [ ] **Metadados Dinâmicos**: Páginas PDP e CMS dinâmicas devem carregar metadados a partir do banco de dados no servidor usando `generateMetadata` de forma performática e resiliente a falhas de conexão.
- [ ] **Canonical & Redes Sociais**: Garantir tag canonical absoluta e tags Open Graph / Twitter Cards completas com imagens absolutas.

---

## 6. Documentação
- [ ] **API**: `docs/API-CONTRATOS.md` atualizado com novos endpoints ou campos.
- [ ] **Ambiente**: `docs/VARIAVEIS-AMBIENTE.md` atualizado se houver novas ENVs.
- [ ] **Scripts**: `docs/SCRIPTS.md` atualizado se houver novos utilitários.
- [ ] **Comentários**: Lógica complexa documentada no código via JSDoc.

---

## 7. Processo de Entrega
- [ ] **Issue**: A issue deve estar devidamente preenchida com metadados e análise de impacto.
- [ ] **PR**: O Pull Request deve usar o template oficial e conter **EVIDÊNCIAS** (prints/logs).
- [ ] **Code Review**: Aprovação de ao menos um revisor (se aplicável ao time).
- [ ] **Rollback**: Plano de reversão definido caso a entrega cause instabilidade.
