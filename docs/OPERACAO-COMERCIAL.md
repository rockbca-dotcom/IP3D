# 💼 Manual de Operação Comercial, Financeira, Fiscal e Atendimento — IP3D

Este documento estabelece o protocolo de governança operacional, fiscal, conciliação de recebíveis, gestão de pedidos e padrões de atendimento pós-venda para garantir a sustentabilidade comercial do e-commerce da **IP3D** após a abertura ao público.

---

## 💵 1. Protocolo Financeiro e Conciliação de Recebíveis

A integridade do faturamento transacional e o controle de fraudes e reembolsos são regidos pelas seguintes diretrizes:

### 1.1 Conta Mercado Pago e Recebimentos:
- [ ] **Validação da Conta PJ:** Garantir que a chave API e credenciais de produção no `.env` apontam para a conta de pessoa jurídica ativa e verificada do Mercado Pago, com repasses automáticos de saques validados.
- [ ] **Fluxo de Reembolso (Refund):** Os cancelamentos solicitados pelo cliente (em até 7 dias) devem ser acionados diretamente na API ou dashboard do Mercado Pago, gerando estorno no cartão ou devolução via PIX, e atualizando o status do pedido para `CANCELADO` no banco IP3D.
- [ ] **Gestão de Chargebacks:** Em caso de contestação de compra pelo portador do cartão, o setor de riscos deve apresentar comprovantes logísticos (código de rastreio e comprovante de recebimento assinado) no painel do Mercado Pago em até 48 horas úteis para evitar perdas financeiras.
- [ ] **Resolução de Anomalias de Estoque:** Caso ocorra um pedido pago cujo estoque físico residual seja nulo no momento da separação, o financeiro deve acionar o estorno integral imediato ou oferecer vale-troca, registrando a entrada corretiva de inventário em `InventoryLog`.

---

## 🧾 2. Protocolo Fiscal e Faturamento (Nota Fiscal Eletrônica)

Toda venda concluída no storefront deve seguir o fluxo fiscal legal brasileiro:

- [ ] **Dados Fiscais de Entrada:** Assegurar que o formulário de checkout captura e sanitiza o CPF/CNPJ e endereço completo de entrega do cliente.
- [ ] **Emissão de NF-e (Nota Fiscal de Venda):** Integração manual ou automática via ERP acionando o faturamento em até 24 horas úteis pós-confirmação do status `PAGO`.
- [ ] **Regras Fiscais de Operação:** Assegurar o cadastro correto dos códigos CFOP (5102 para vendas estaduais, 6102 para interestaduais) e NCM (Nomenclatura Comum do Mercosul) correspondentes aos filamentos e peças de reposição 3D.
- [ ] **LGPD em Dados Fiscais:** Os XMLs e dados cadastrais dos clientes armazenados para faturamento devem possuir criptografia em repouso e acesso restrito exclusivamente a operadores fiscais homologados.

---

## 👥 3. SLAs e Canais de Atendimento ao Cliente

A experiência pós-venda é sustentada por prazos de atendimento claros (SLAs):

### Prazos de Resposta Oficial:
*   **WhatsApp Comercial e Chat:** Máximo de **15 minutos** em horário comercial (09:00 às 18:00).
*   **E-mail de Suporte (`contato@ip3d.com.br`):** Máximo de **4 horas úteis** para respostas conclusivas.

### Resoluções de Suporte (Mensagens Padrão):
- [ ] **Pedido Atrasado:** O atendente deve abrir chamado junto à transportadora e manter o cliente posicionado diariamente via e-mail e WhatsApp, oferecendo frete grátis em compras futuras.
- [ ] **Pagamento Recusado:** Informar educadamente que a recusa partiu do emissor do cartão e sugerir pagamento via PIX com 5% de desconto adicional.
- [ ] **Trocas e Devoluções:** Respeitar integralmente o Código de Defesa do Consumidor (CDC), emitindo código de postagem reversa sem custos adicionais para devoluções em até 7 dias corridos.

---

## 📦 4. Fluxo Operacional de Pedidos (Logística de Entrega)

A jornada logística do pedido é monitorada pelas seguintes transições de status no banco de dados IP3D:

```mermaid
graph LR
    A[PENDING] -->|Webhook Pago| B[PROCESSING]
    B -->|Postagem Transportadora| C[SHIPPED]
    C -->|Entrega Confirmada| D[DELIVERED]
```

- [ ] **Separação & Embalagem (`PROCESSING`):** O operador de estoque realiza a bipagem e conferência dos produtos, embala de forma protegida contra umidade (plástico bolha especial para filamentos) e cola a respectiva etiqueta de envio.
- [ ] **Envio & Rastreamento (`SHIPPED`):** Ao despachar o pacote na transportadora, o operador insere o código de rastreamento no painel administrativo IP3D. O sistema dispara automaticamente e-mail transacional ao cliente com o link de acompanhamento logístico.
- [ ] **Cancelamento Seguro:** Qualquer pedido que migre para o status `CANCELADO` antes do despacho deve reincorporar os produtos ao estoque disponível, gerando a movimentação transacional de `ENTRADA` correspondente no `InventoryLog`.

---

## 🎯 5. Checklist Go/No-Go de Liberação Comercial

A abertura comercial definitiva da IP3D só é autorizada após a validação física dos seguintes pilares:

- [ ] **Pilar Financeiro:** Conta de produção no Mercado Pago ativa, credenciais configuradas e repasses PIX/Cartão testados em sandbox com sucesso.
- [ ] **Pilar Logístico:** Transportadoras cadastradas, tabela de frete revisada para todas as capitais brasileiras e inventário físico conferido com 100% de acurácia em relação ao banco.
- [ ] **Pilar Humano:** Equipe de atendimento treinada nas políticas de privacidade, SLAs operacionais de pós-venda vigentes e termos legais devidamente publicados no rodapé.
