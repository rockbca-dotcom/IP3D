## 🎯 Objetivo
<!-- Descreva o problema que está sendo resolvido ou a feature implementada -->

## 🛠️ O que foi feito?
<!-- Lista resumida das alterações técnicas -->
- [ ] Implementação de lógica em...
- [ ] Criação de testes em...
- [ ] Atualização de docs...

## ✅ Checklist de Validação (Obrigatório)
Execute estes comandos localmente antes de abrir o PR:
- [ ] `pnpm test` (Todos os testes passando)
- [ ] `pnpm test:coverage` (Cobertura mantida ou aumentada)
- [ ] `pnpm lint` (Sem erros de lint)
- [ ] `pnpm build` (Build de produção sem erros)
- [ ] `pnpm exec prisma validate` (Schema Prisma válido)

## 🧪 Estratégia de Testes (TDD)
- **Camada**: (Unit / Integration / API)
- **Mock**: (Sim / Não - O que foi mockado?)
- **Casos Críticos**: (Lista de cenários testados)

## 🔐 Segurança & LGPD
- [ ] Nenhum segredo (API keys, senhas) versionado no código.
- [ ] Nenhuma exposição de dados sensíveis em logs ou respostas de API.
- [ ] Autorização revisada para rotas administrativas.
- [ ] Validação de entrada implementada (Zod/Sanitize).

## 📄 Documentação Atualizada?
- [ ] `docs/API-CONTRATOS.md` (Se houve mudança em endpoints)
- [ ] `docs/VARIAVEIS-AMBIENTE.md` (Se houve nova env)
- [ ] `docs/SCRIPTS.md` (Se houve novo script)
- [ ] `docs/TESTES.md` (Se houve mudança no padrão de testes)

## 📸 Evidências
<!-- Cole aqui prints de testes passando, logs de CI ou screenshots de UI -->

## ⚠️ Riscos & Rollback
- **Riscos**: (Ex: Impacto em performance, dependência externa)
- **Plano de Rollback**: (Ex: Reverter commit, desativar flag de env)
