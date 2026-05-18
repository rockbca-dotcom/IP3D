name: "🔐 Security Vulnerability"
description: "Relatar uma falha de segurança ou exposição de dados."
labels: ["security", "high-priority"]
body:
  - type: markdown
    attributes:
      value: |
        ### ⚠️ ATENÇÃO
        Se esta vulnerabilidade for crítica, evite detalhes públicos que permitam exploração imediata antes da correção.
  - type: textarea
    id: vulnerability
    attributes:
      label: Descrição da Vulnerabilidade
      description: Qual a falha encontrada?
    validations:
      required: true
  - type: dropdown
    id: impact_level
    attributes:
      label: Nível de Impacto
      options:
        - Baixo (Baixo risco de dados)
        - Médio (Risco de alteração de dados não críticos)
        - Alto (Exposição de dados sensíveis ou controle total)
        - Crítico (RCE, Exposição total de DB)
  - type: textarea
    id: lgpd
    attributes:
      label: Impacto LGPD
      description: Há dados pessoais de clientes expostos?
