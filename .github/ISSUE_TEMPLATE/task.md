name: "🚀 Task / Feature"
description: "Planejamento de uma nova funcionalidade ou refatoração técnica."
title: "[TASK-XX]: Nome da Demanda"
labels: ["task", "triage"]
body:
  - type: markdown
    attributes:
      value: |
        ### 📋 Metadados da Demanda
  - type: input
    id: sprint
    attributes:
      label: Sprint
      placeholder: "Ex: Sprint 2"
    validations:
      required: true
  - type: dropdown
    id: priority
    attributes:
      label: Prioridade
      options:
        - P0 (Crítico/Bloqueante)
        - P1 (Importante)
        - P2 (Desejável)
    validations:
      required: true
  - type: input
    id: points
    attributes:
      label: Story Points
      placeholder: "1, 2, 3, 5, 8"
  - type: textarea
    id: objective
    attributes:
      label: Objetivo
      description: O que esta task pretende resolver?
    validations:
      required: true
  - type: textarea
    id: acceptance_criteria
    attributes:
      label: 🎯 Critérios de Aceite (Definition of Done)
      value: |
        - [ ] TDD: Testes unitários cobrindo lógica principal.
        - [ ] TDD: Testes de contrato se houver nova API.
        - [ ] Lint: `pnpm lint` sem erros.
        - [ ] Build: `pnpm build` com sucesso.
        - [ ] Docs: Documentação técnica atualizada em `docs/`.
  - type: textarea
    id: impacts
    attributes:
      label: ⚡ Impactos
      value: |
        - **API**: (Sim/Não)
        - **Banco de Dados**: (Sim/Não)
        - **Variáveis de Ambiente**: (Sim/Não)
        - **Segurança/LGPD**: (Sim/Não)
  - type: textarea
    id: technical_notes
    attributes:
      label: 🛠️ Notas Técnicas e Estratégia
      description: Detalhes de implementação, dependências e riscos.
