# Migração de Pagamentos: Mercado Pago -> InfinityPay

## Objetivo
Habilitar convivência dos dois provedores com seleção por feature flag, mantendo rollback rápido sem novo deploy.

## Flag de ativação
- Variável: `PAYMENT_PROVIDER`
- Valores:
  - `mercadopago`
  - `infinitypay`
- Default: `mercadopago` (quando ausente ou inválido)

## Fluxo de checkout
1. Front chama `POST /api/payments/checkout`.
2. Backend cria o pedido interno (`PAYMENT_PENDING`).
3. Backend seleciona provider pela flag.
4. Provider cria checkout externo.
5. Backend retorna `redirectUrl`.
6. Front redireciona cliente.

## Tabela de mapeamento de status
| Provider status | Status interno |
|---|---|
| `approved` | `paymentStatus=APPROVED`, `status=PROCESSING` |
| `rejected` | `paymentStatus=REJECTED`, `status=CANCELLED` |
| `cancelled` | `paymentStatus=REJECTED`, `status=CANCELLED` |
| `refunded` | `paymentStatus=REJECTED` (pode evoluir para `REFUNDED`) |
| `charged_back` | `paymentStatus=REJECTED` (pode evoluir para `CHARGEBACK`) |
| outros/indefinidos | `paymentStatus=PAYMENT_PENDING`, `status=PENDING` |

## Webhooks e idempotência
- Mercado Pago:
  - `POST /api/payments/mercadopago/webhook`
- InfinityPay:
  - `POST /api/payments/infinitypay/webhook`
- Proteção de idempotência:
  - pedido já `APPROVED` não reduz estoque novamente
  - reentrega de webhook não reprocessa baixa

## Novos campos em `Order`
- `paymentProvider`
- `providerOrderId`
- `providerTransactionId`
- `providerPaymentMethod`
- `providerRawStatus`

Campos legados mantidos:
- `mpPreferenceId`
- `mpPaymentId`

## Checklist de homologação
1. Checkout com `PAYMENT_PROVIDER=mercadopago`.
2. Checkout com `PAYMENT_PROVIDER=infinitypay`.
3. Webhook aprovado atualiza pedido e estoque.
4. Reenvio do mesmo webhook não duplica baixa de estoque.
5. Rollback de flag retorna fluxo MP.

## Observabilidade recomendada
- Correlacionar logs por:
  - `order.code` (`order_nsu`)
  - `providerTransactionId`
  - `providerOrderId`
- Alertas:
  - aumento de 5xx em `/api/payments/checkout`
  - webhooks com não-2xx
  - crescimento de pedidos em `PAYMENT_PENDING`
