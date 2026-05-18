# Estratégia de Banco de Dados e Migrations — IP3D

Este documento descreve como gerenciar o esquema do banco de dados PostgreSQL utilizando o Prisma Migrate.

---

## 1. Fluxo de Trabalho (Migrations)

A partir da **Sprint 2**, o uso de `prisma db push` está **proibido** para ambientes de Produção e Homologação. Todas as alterações de schema devem ser versionadas em arquivos SQL dentro de `prisma/migrations/`.

### Desenvolvimento (Local)
Ao alterar o arquivo `prisma/schema.prisma`, execute:
```bash
pnpm db:migrate
# Ou manualmente: pnpm exec prisma migrate dev --name nome_da_mudanca
```
- **O que faz**: Compara o schema com o banco local, cria um novo arquivo SQL de migration e aplica no banco local.
- **Importante**: Este comando pode solicitar o reset do banco se houver mudanças incompatíveis (Drift). **Cuidado com dados locais!**

### Produção, Homologação e CI
Nesses ambientes, **nunca** use `migrate dev`. Use:
```bash
pnpm db:deploy
# Ou manualmente: pnpm exec prisma migrate deploy
```
- **O que faz**: Aplica todas as migrations pendentes que ainda não foram executadas no banco, sem nunca resetar os dados.

---

## 2. Comandos Disponíveis

| Atalho | Comando Real | Finalidade |
| :--- | :--- | :--- |
| `pnpm db:validate` | `prisma validate` | Valida a sintaxe do `schema.prisma`. |
| `pnpm db:generate` | `prisma generate` | Gera o Prisma Client tipado. |
| `pnpm db:migrate` | `prisma migrate dev` | Cria e aplica migrations em ambiente de **DEV**. |
| `pnpm db:deploy` | `prisma migrate deploy` | Aplica migrations pendentes em **PROD/CI**. |
| `pnpm db:setup` | `pnpm db:deploy && pnpm seed:prod` | Setup completo: Migrações + Seeds. |

---

## 3. Diretrizes e Segurança

### Quando evitar `db push`?
- **Evite sempre em produção**. O `db push` não deixa rastro histórico e pode causar perda de dados silenciosa em mudanças de colunas.
- **Use apenas** para prototipagem rápida em bancos de teste descartáveis onde você não quer criar uma migration SQL ainda.

### Nova Migration
Sempre dê nomes descritivos às migrations:
`pnpm exec prisma migrate dev --name add_index_to_orders`

### Rollback
O Prisma Migrate não possui um comando automático de "undo". Para fazer rollback:
1. Reverta as mudanças no `schema.prisma`.
2. Crie uma **nova migration** que desfaça as alterações anteriores.
3. Aplique via fluxo normal.

### Dados Existentes
Antes de rodar uma migration que adiciona campos `NOT NULL` sem valor padrão em tabelas com dados, certifique-se de:
1. Adicionar o campo como opcional ou com um `default`.
2. Ou criar a migration, editar o SQL manualmente para preencher os dados, e então adicionar a constraint `NOT NULL`.

---

## 4. Convenções de Índices e Performance

A partir da **TASK-09**, adotamos uma política rigorosa de indexação para garantir a performance do sistema em escala:

### Índices de Filtragem
- Campos usados em cláusulas `WHERE` (ex: `active`, `published`, `role`) devem possuir índice (`@@index`).
- Campos booleanos frequentemente combinados (ex: `active` + `featured`) usam índices compostos.

### Índices de Ordenação
- Campos de data usados para ordenação padrão (ex: `createdAt DESC`) possuem índices otimizados para ordenação decrescente.

### Índices de Relacionamento (FKs)
- Todas as Foreign Keys que não são cobertas por uma constraint `@unique` devem possuir um índice explícito para acelerar os `JOINs`.

### Convenção de Nomeclatura
O Prisma gera nomes automáticos, mas seguimos o padrão:
`Tabela_campo_idx` (Ex: `Product_active_featured_idx`).

### Custo de Performance (Write Overhead)
Embora os índices acelerem drasticamente as consultas (`SELECT`), eles adicionam um custo extra em operações de escrita (`INSERT`, `UPDATE`, `DELETE`).
- **Tabelas de Alto Volume**: Em tabelas como `PageView`, `Click` e `InventoryLog`, adicionamos apenas os índices estritamente necessários para relatórios. Índices excessivos nessas tabelas podem degradar a performance de ingestão de dados em picos de tráfego.

### Quando evitar índices?
- **Campos com baixa cardinalidade**: Não crie índices em campos que possuem poucos valores distintos (ex: `Boolean` que é quase sempre `true`) a menos que sejam combinados em índices compostos.
- **Tabelas pequenas**: Tabelas com menos de 1000 registros geralmente não precisam de índices (exceto PKs/FKs), pois o custo de leitura do índice pode ser maior que um *sequential scan*.
- **Frequência de escrita vs leitura**: Se a tabela é escrita 100x mais do que é lida, minimize o número de índices.

---

## 5. Validação no CI
O CI está configurado para:
1. Subir um container PostgreSQL limpo.
2. Rodar `pnpm db:deploy` (validando a integridade de todas as migrations).
3. Rodar `pnpm seed:prod` (validando as constraints de dados).
4. Executar o Build e Testes.
