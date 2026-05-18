name: "🐞 Bug Report"
description: "Relatar um erro ou comportamento inesperado."
labels: ["bug", "triage"]
body:
  - type: textarea
    id: description
    attributes:
      label: Descrição do Bug
      description: O que está acontecendo?
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Como Reproduzir?
      description: Passo a passo para chegar ao erro.
      value: |
        1. Vá para '...'
        2. Clique em '....'
        3. Veja o erro '....'
  - type: textarea
    id: expected
    attributes:
      label: Comportamento Esperado
      description: O que deveria ter acontecido?
  - type: input
    id: environment
    attributes:
      label: Ambiente
      placeholder: "Local / Staging / Produção"
  - type: textarea
    id: logs
    attributes:
      label: Logs ou Prints
      description: Cole aqui mensagens de erro do console ou terminal.
