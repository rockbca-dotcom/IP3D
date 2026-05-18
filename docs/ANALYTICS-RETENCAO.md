# Política de Retenção e Limpeza de Analytics — IP3D

Este documento estabelece as diretrizes de ciclo de vida e a política de minimização de dados sensíveis coletados pelo sistema de analytics interno do IP3D, assegurando a conformidade legal com a **Lei Geral de Proteção de Dados (LGPD)** e mantendo o banco de dados otimizado.

---

## 1. Princípios de Privacidade e Retenção

Para respeitar os princípios da LGPD de **minimização dos dados** (coleta do estrito necessário) e **limitação do armazenamento** (retenção apenas pelo período útil), estabelecemos o seguinte ciclo de vida:

1.  **Minimização na Origem**: Conforme implementado na TASK-30, dados pessoais identificáveis ou endereços IP brutos **nunca** são gravados. Os IPs passam por um processo de mascaramento de octetos na memória antes da persistência.
2.  **Janela de Retenção Padrão**: Definimos **180 dias (6 meses)** como o tempo limite padrão para a manutenção de registros detalhados de visualização de páginas (`PageView`) e cliques (`Click`).
3.  **Finalidade da Retenção**: Este prazo é suficiente para gerar relatórios sazonais de tráfego, identificar produtos populares no dashboard de vendas e auditar taxas de conversão no storefront, sem acumular massa de dados excessiva e desnecessária no PostgreSQL.

---

## 2. O Script de Limpeza Segura

Disponibilizamos um script seguro de limpeza que descarta registros anteriores à janela configurada.

### Comandos Disponíveis (`package.json`)

*   **Dry-Run (Simulação)**:
    ```bash
    pnpm analytics:cleanup:dry-run
    ```
    *Apenas contabiliza e exibe no console quantos registros antigos de PageViews e Clicks seriam removidos, sem alterar o banco de dados.*

*   **Execução Real**:
    ```bash
    pnpm analytics:cleanup
    ```
    *Remove de forma definitiva todos os registros de PageViews e Clicks que ultrapassaram a data de corte.*

### Parametria de Janela Customizada

Você pode sobrescrever a janela padrão de 180 dias de duas formas:

1.  **Parâmetro CLI (`--days`)**:
    ```bash
    pnpm analytics:cleanup --days 90
    ```
2.  **Variável de Ambiente (`ANALYTICS_RETENTION_DAYS`)**:
    ```bash
    ANALYTICS_RETENTION_DAYS=365 pnpm analytics:cleanup
    ```

---

## 3. Recomendação de Agendamento (Automático)

Para manter o banco de dados constantemente limpo e performático, recomendamos agendar o script para rodar de forma periódica (ex: **diariamente às 03:00 da manhã**, quando o tráfego do site é mínimo).

### Configuração de Cron Job no Servidor

Configure a tarefa automatizada no arquivo `crontab` do servidor de produção:

```cron
# Executa a limpeza de analytics todo dia às 03:00 BRT
0 3 * * * cd /var/www/ip3d && DATABASE_URL="seu-db-conn-string" pnpm analytics:cleanup >> /var/log/ip3d-cleanup.log 2>&1
```

---

## 4. Impacto Esperado e Segurança Operacional

*   **Desempenho do Banco de Dados**: A remoção contínua de registros de tráfego legados evita o crescimento desordenado de tabelas de indexação de buscas de tráfego, mantendo as agregações do dashboard administrativo (`GET /api/admin/dashboard`) extremamente rápidas.
*   **Isolamento Estrito**: O script manipula **única e exclusivamente** as tabelas `PageView` e `Click`. Tabelas críticas como `Order` (pedidos), `OrderItem` (itens do pedido), `Product` (produtos), `User` (usuários) e `InventoryLog` (histórico de estoque) nunca são tocadas.
*   **Logs Anônimos**: Todos os logs gerados pelo script de limpeza contêm apenas contagens consolidadas e datas de corte, sem vazamento de caminhos visitados ou metadados de cliques.
