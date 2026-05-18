# Guia de Testes — IP3D

Este projeto utiliza **Vitest** como runner de testes, proporcionando um ambiente estável para TDD com suporte a mocks de módulos e aliases de caminho (`@/`).

---

## Como rodar os testes

### Comandos principais

```bash
# Rodar todos os testes uma vez
pnpm test

# Modo Watch (ideal para TDD)
pnpm test:watch

# Gerar relatório de cobertura (coverage)
pnpm test:coverage

# Rodar apenas uma camada específica
pnpm test:unit         # Testes unitários (lógica pura)
pnpm test:integration  # Testes de integração (fluxos com mocks de infra)
pnpm test:api          # Testes de contrato de API
```

---

## Estrutura de Pastas

```text
tests/
├── unit/          # Lógica pura, utilitários, mapeadores (sem I/O)
├── integration/   # Fluxos complexos com mocks de Banco/APIs
├── api/           # Contratos de rotas Next.js (Handlers)
└── helpers/       # Fixtures, Mocks e Asserts customizados
```

---

## Padrão TDD (Red-Green-Refactor)

1. **Red**: Crie um arquivo em `tests/unit/` ou `tests/integration/` e descreva o comportamento desejado. O teste deve falhar.
2. **Green**: Implemente a lógica mínima necessária no código para o teste passar.
3. **Refactor**: Melhore o código mantendo o teste passando.

---

## Convenção de Nomes

- Arquivos de teste: `nome-do-modulo.test.ts`
- Suites: `describe("nome da função/fluxo", ...)`
- Casos: `it("deve fazer X quando Y acontece", ...)`

---

## Mocks de Infraestrutura (Prisma/APIs)

Para testar fluxos que dependem do banco de dados sem atingir o banco real, use o `vi.mock` do Vitest:

```typescript
vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: vi.fn(async () => [/* seus dados fake */]),
    },
  },
}));
```

---

## Fixtures e Asserts Customizados

- **Fixtures**: Use `tests/helpers/fixtures.ts` para gerar objetos de teste padronizados. Use funções `makeX()` para evitar mutação entre testes.
- **Asserts**: Use `tests/helpers/assert.ts` para verificações frequentes do domínio (ex: `assertOrderCode`, `assertApiError`).

---

## Boas Práticas

- **Isolamento**: Cada teste deve ser independente. Use `beforeEach` para resetar mocks.
- **Realismo**: Evite mocks excessivos que escondam erros de integração reais.
- **Coverage**: Busque manter a cobertura de lógica de negócio (calculos, mapeamentos, validações) acima de 80%.
