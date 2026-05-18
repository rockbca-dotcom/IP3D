/**
 * tests/helpers/env.ts
 *
 * Configura variáveis de ambiente mínimas para que módulos do projeto
 * não lancem erros na inicialização durante os testes.
 *
 * Importe este helper como PRIMEIRA instrução nos arquivos de teste
 * que dependem de process.env:
 *
 *   import "./env.js"; // ou "../helpers/env.js"
 *
 * As variáveis definidas aqui são valores seguros e ficticios.
 * Nunca use credenciais reais neste arquivo.
 */

// Sessão admin — mínimo 32 chars, exigido pelo iron-session
process.env.SESSION_SECRET ??= "test_secret_at_least_32_chars_long_for_tests";

// URL pública — usada em redirect URLs de checkout
process.env.NEXT_PUBLIC_SITE_URL ??= "http://localhost:3003";

// Banco — apontado para um DSN fictício (testes não devem atingir o banco real)
// Se um teste precisar de banco real, use a variável de ambiente do CI.
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/ip3d_test";

// Gateway de pagamento padrão para testes
process.env.PAYMENT_PROVIDER ??= "mercadopago";

// Garante que testes rodam em modo test
process.env.NODE_ENV ??= "test";
