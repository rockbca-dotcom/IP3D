# Matriz de Autorização (RBAC)

Este documento descreve a matriz de permissões e a lógica de autorização granular do projeto IP3D.

## Hierarquia de Roles

O sistema utiliza uma hierarquia de papéis definida no Prisma Schema:

1.  **SUPER_ADMIN**: Acesso total e irrestrito a todos os módulos, configurações e gestão de outros administradores.
2.  **ADMIN**: Gestão operacional completa (produtos, pedidos, estoque, categorias, relatórios). Não pode gerenciar usuários ou configurações sensíveis do sistema.
3.  **EDITOR**: Gestão de conteúdo e CMS (páginas, banners, seções da home). Não tem acesso a dados de vendas, estoque, usuários ou configurações.

## Matriz de Permissões por Módulo

| Módulo | Ação | EDITOR | ADMIN | SUPER_ADMIN | Endpoint Base |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Usuários** | Listar/Criar/Editar/Inativar | ❌ | ❌ | ✅ | `/api/admin/users` |
| **Configurações** | Ver/Alterar Configs Globais | ❌ | ❌ | ✅ | `/api/admin/settings` |
| **Scripts** | Injetar Scripts Customizados | ❌ | ❌ | ✅ | `/api/admin/scripts` |
| **Produtos** | Listar/Criar/Editar/Excluir | ❌ | ✅ | ✅ | `/api/admin/products` |
| **Categorias** | Listar/Criar/Editar/Excluir | ❌ | ✅ | ✅ | `/api/admin/categories` |
| **Estoque** | Ver Logs/Ajustar Quantidades | ❌ | ✅ | ✅ | `/api/admin/inventory` |
| **Pedidos** | Ver Detalhes/Alterar Status | ❌ | ✅ | ✅ | `/api/admin/orders` |
| **Relatórios** | Ver Métricas de Vendas | ❌ | ✅ | ✅ | `/api/admin/reports` (futuro) |
| **Páginas** | Gestão de CMS e Blocos | ✅ | ✅ | ✅ | `/api/admin/pages` |
| **Banners** | Gestão de Sliders e Imagens | ✅ | ✅ | ✅ | `/api/admin/banners` |
| **Seções Home** | Customização da Landing Page | ✅ | ✅ | ✅ | `/api/admin/home-sections` |

## Helpers de Autorização (`src/lib/auth.ts`)

A autorização é aplicada diretamente nos handlers das APIs utilizando os seguintes helpers:

-   `requireSuperAdmin()`: Bloqueia qualquer usuário que não seja `SUPER_ADMIN`.
-   `requireAdmin()`: Permite `ADMIN` e `SUPER_ADMIN`.
-   `requireEditor()`: Permite `EDITOR`, `ADMIN` e `SUPER_ADMIN`.

### Fluxo de Validação
Cada chamada de autorização realiza:
1.  Validação criptográfica da sessão (cookie assinado).
2.  **Validação Autoritativa**: Consulta o banco de dados para verificar se o usuário ainda existe e está ativo (`active: true`).
3.  **Cross-Check de Role**: Verifica se a role no banco de dados ainda confere com os privilégios exigidos, prevenindo escalação se a role do usuário tiver sido alterada mas a sessão ainda estiver ativa.

## Regras de Proteção de Dados
-   **Passwords**: Nunca são retornados em nenhuma API administrativa.
-   **Auto-Proteção**: Um administrador (mesmo SUPER_ADMIN) não pode inativar a própria conta ou rebaixar sua própria role através da API `/api/admin/users/[id]`.
-   **Último Admin**: O sistema impede a inativação ou o rebaixamento do último `SUPER_ADMIN` ativo para evitar o bloqueio total do sistema.
