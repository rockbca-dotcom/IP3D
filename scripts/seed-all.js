/**
 * Seed completo — popula o banco com categorias, produtos, specs e admin.
 * Rode com: node scripts/seed-all.js
 *
 * Este script é idempotente (usa upsert) — pode rodar em qualquer banco novo
 * sem duplicar dados. Funciona em dev e em produção.
 */

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { parseSeedArgs, validateEnvironment } = require("./seed-utils");

const options = parseSeedArgs(process.argv.slice(2));
validateEnvironment("seed-all.js", options);

function isPasswordSecure(password) {
  if (password.length < 12) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) return false;
  return true;
}

// ── Categorias ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Componentes Bambu Lab",   slug: "componentes-bambu-lab",       order: 1 },
  { name: "Componentes Creality",    slug: "componentes-creality",        order: 2 },
  { name: "Componentes Universais",  slug: "componentes-universais",      order: 3 },
  { name: "Superfícies de Impressão", slug: "impressoras-3d",             order: 4 },
  { name: "Impressoras 3D",          slug: "impressoras-3d-equipamentos", order: 5 },
  { name: "Personalizados",          slug: "personalizados",              order: 6 },
];

// ── Produtos ──────────────────────────────────────────────────────────────────
const PRODUCTS = [
  {
    name: "Kit Hotend Completo para Bambu Lab A1 Mini/NORMAL",
    slug: "kit-hotend-bambu-lab-a1",
    shortDescription: "Hotend completo de reposição com barrel, aquecedor e nozzle para as linhas A1 Mini e A1.",
    description: "<p>Kit com corpo metálico, bloco aquecido, cartucho e bico pré-instalado para restauração rápida da Bambu Lab A1 Mini e versão normal.</p>",
    image: "/uploads/products/kit-hotend-bambu-lab-a1.jpg",
    gallery: ["/uploads/products/kit-hotend-bambu-lab-a1.jpg"],
    features: ["Inclui bloco aquecido, dissipador e nozzle 0,4 mm", "Compatível com A1 Mini e A1", "Substituição plug-and-play"],
    warranty: "3 meses",
    priceOriginal: 249.90,
    pricePromo: 199.90,
    pixPrice: 189.90,
    installments: 3,
    installmentValue: 66.63,
    stockQuantity: 50,
    featured: true,
    active: true,
    categorySlug: "componentes-bambu-lab",
    specs: [
      { label: "Compatibilidade", value: "Bambu Lab A1 Mini e A1" },
      { label: "Conteúdo", value: "Bloco aquecido, heatbreak, nozzle 0,4 mm" },
    ],
  },
  {
    name: "Capa de Silicone (Meia) para Bambu Lab A1 Mini/NORMAL",
    slug: "capa-silicone-bambu-lab-a1",
    shortDescription: "Meia de silicone 300 °C para proteger o bloco aquecido da A1.",
    description: "<p>Capa de silicone resistente a altas temperaturas para preservar o bloco aquecido da Bambu Lab A1 Mini e A1.</p>",
    image: "/uploads/products/2x-capa-de-silicone-para-hotend-bambu-lab-a1-e-a1-mini-1-transparent.png",
    gallery: [
      "/uploads/products/2x-capa-de-silicone-para-hotend-bambu-lab-a1-e-a1-mini-1-transparent.png",
      "/uploads/products/2x-capa-de-silicone-para-hotend-bambu-lab-a1-e-a1-mini-2-transparent.png",
    ],
    features: ["Suporta até 300 °C", "Material de silicone com isolamento térmico", "Instalação rápida com encaixe perfeito"],
    warranty: "3 meses",
    priceOriginal: 39.90,
    pricePromo: null,
    pixPrice: 35.90,
    installments: 0,
    installmentValue: null,
    stockQuantity: 50,
    featured: false,
    active: true,
    categorySlug: "componentes-bambu-lab",
    specs: [
      { label: "Compatibilidade", value: "Bambu Lab A1 Mini e A1" },
      { label: "Temperatura máxima", value: "300 °C" },
    ],
  },
  {
    name: "Bico Nozzle de Aço Endurecido para Bambu Lab A1 Mini/NORMAL",
    slug: "nozzle-aco-bambu-lab-a1",
    shortDescription: "Nozzle 0,4 mm em aço endurecido para filamentos abrasivos.",
    description: "<p>Nozzle em aço endurecido 0,4 mm ideal para filamentos com fibra de carbono, vidro ou outros aditivos abrasivos nas impressoras A1.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: ["/images/products/components-placeholder.svg"],
    features: ["Bico 0,4 mm em aço endurecido", "Maior durabilidade com filamentos abrasivos", "Rosca padrão do hotend A1"],
    warranty: "3 meses",
    priceOriginal: 79.90,
    pricePromo: null,
    pixPrice: 71.90,
    installments: 0,
    installmentValue: null,
    stockQuantity: 50,
    featured: false,
    active: true,
    categorySlug: "componentes-bambu-lab",
    specs: [
      { label: "Material", value: "Aço endurecido" },
      { label: "Diâmetro", value: "0,4 mm" },
    ],
  },
  {
    name: "Limpador de Bico (Nozzle Wiper) para Bambu Lab A1",
    slug: "nozzle-wiper-bambu-lab-a1",
    shortDescription: "Espátula de limpeza para a sequência automática de purga da A1.",
    description: "<p>Peça de reposição do wiper que remove o excesso de material durante a rotina de limpeza automática da Bambu Lab A1.</p>",
    image: "/uploads/products/limpador-bico-bambu-lab-a1.jpg",
    gallery: ["/uploads/products/limpador-bico-bambu-lab-a1.jpg"],
    features: ["Superfície em silicone flexível", "Fixação rápida no suporte original", "Compatível com rotina de limpeza padrão"],
    warranty: "3 meses",
    priceOriginal: 44.90,
    pricePromo: null,
    pixPrice: 40.40,
    installments: 0,
    installmentValue: null,
    stockQuantity: 50,
    featured: false,
    active: true,
    categorySlug: "componentes-bambu-lab",
    specs: [
      { label: "Compatibilidade", value: "Bambu Lab A1" },
      { label: "Material", value: "Silicone e base metálica" },
    ],
  },
  {
    name: "Kit Termistor para Bambu Lab A1 / A1 Mini",
    slug: "kit-termistor-bambu-lab-a1",
    shortDescription: "Conjunto com termistor NTC e cartucho aquecedor para hotend A1.",
    description: "<p>Kit completo com termistor NTC e cartucho aquecedor para reposição preventiva no hotend A1.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: ["/images/products/components-placeholder.svg"],
    features: ["Cartucho aquecedor 24 V", "Termistor NTC calibrado", "Conectores compatíveis com chicote original"],
    warranty: "3 meses",
    priceOriginal: 89.90,
    pricePromo: 79.90,
    pixPrice: 71.90,
    installments: 2,
    installmentValue: 39.95,
    stockQuantity: 10,
    featured: false,
    active: true,
    categorySlug: "componentes-bambu-lab",
    specs: [
      { label: "Tensão", value: "24 V" },
      { label: "Compatibilidade", value: "Bambu Lab A1 Mini e A1" },
    ],
  },
  {
    name: "Mesa PEI Texturizada Dupla Face para Bambu Lab H2D (350 x 320 mm)",
    slug: "mesa-pei-bambu-lab-h2d",
    shortDescription: "Placa PEI texturizada dupla face para plataforma H2D 350×320 mm.",
    description: "<p>Superfície PEI texturizada dupla face para a Bambu Lab H2D, oferecendo aderência superior e fácil remoção das peças.</p>",
    image: "/uploads/products/mesa-pei-texturizada-bambu-lab-h2d.jpg",
    gallery: ["/uploads/products/mesa-pei-texturizada-bambu-lab-h2d.jpg"],
    features: ["Revestimento PEI texturizado em ambas as faces", "Base flexível para remoção rápida", "Formato 350 x 320 mm para H2D"],
    warranty: "6 meses",
    priceOriginal: 349.90,
    pricePromo: 299.90,
    pixPrice: 269.90,
    installments: 6,
    installmentValue: 49.98,
    stockQuantity: 10,
    featured: true,
    active: true,
    categorySlug: "impressoras-3d",
    specs: [
      { label: "Dimensões", value: "350 x 320 mm" },
      { label: "Compatibilidade", value: "Bambu Lab H2D" },
    ],
  },
  {
    name: "Kit Aquecedor Cerâmico 60W 360° e Termistor",
    slug: "kit-aquecedor-ceramico-60w",
    shortDescription: "Cartucho cerâmico 60 W com termistor integrado para hotends universais.",
    description: "<p>Kit com cartucho cerâmico 60 W e termistor 360° para reposição em hotends que exigem aquecimento rápido.</p>",
    image: "/uploads/products/kit-aquecedor-ceramico-60w.jpg",
    gallery: ["/uploads/products/kit-aquecedor-ceramico-60w.jpg"],
    features: ["Cartucho cerâmico 60 W", "Termistor com leitura 360°", "Compatível com hotends padrão V6 e derivados"],
    warranty: "3 meses",
    priceOriginal: 89.90,
    pricePromo: 69.90,
    pixPrice: 62.90,
    installments: 2,
    installmentValue: 34.95,
    stockQuantity: 100,
    featured: false,
    active: true,
    categorySlug: "componentes-universais",
    specs: [
      { label: "Potência", value: "60 W" },
      { label: "Tensão", value: "24 V" },
    ],
  },
  {
    name: "Kit Hotend Completo para Creality CR-10",
    slug: "kit-hotend-creality-cr10",
    shortDescription: "Hotend metálico completo compatível com CR-10 e variações.",
    description: "<p>Conjunto completo de hotend metálico para impressoras Creality CR-10.</p>",
    image: "/uploads/products/kit-hotend-creality-cr-10.jpg",
    gallery: ["/uploads/products/kit-hotend-creality-cr-10.jpg"],
    features: ["Heatbreak totalmente metálico", "Nozzle 0,4 mm pré-instalado", "Compatível com CR-10 e derivados"],
    warranty: "3 meses",
    priceOriginal: 199.90,
    pricePromo: 159.90,
    pixPrice: 143.90,
    installments: 3,
    installmentValue: 53.30,
    stockQuantity: 50,
    featured: true,
    active: true,
    categorySlug: "componentes-creality",
    specs: [
      { label: "Compatibilidade", value: "Creality CR-10 / CR-10S" },
      { label: "Diâmetro do bico", value: "0,4 mm" },
    ],
  },
  {
    name: "Termistor NTC 100K 1% 3950 (Resistente até 200 °C)",
    slug: "termistor-ntc-100k-3950",
    shortDescription: "Termistor NTC 100K de alta precisão para múltiplos hotends.",
    description: "<p>Termistor NTC 100K com precisão de 1% e curva 3950.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: ["/images/products/components-placeholder.svg"],
    features: ["Precisão 1%", "Curva Beta 3950", "Temperatura de operação até 200 °C"],
    warranty: "3 meses",
    priceOriginal: 34.90,
    pricePromo: null,
    pixPrice: 29.90,
    installments: 0,
    installmentValue: null,
    stockQuantity: 100,
    featured: false,
    active: true,
    categorySlug: "componentes-universais",
    specs: [
      { label: "Tipo", value: "NTC 100K 3950" },
      { label: "Temperatura suportada", value: "Até 200 °C" },
    ],
  },
  // ── Produtos Personalizados ────────────────────────────────────────────────
  {
    name: "Logitech G29 Extensor Paddle Shifter",
    slug: "logitech-g29-extensor-paddle",
    shortDescription: "Extensor de paddle shifter impresso em 3D para o volante Logitech G29.",
    description: "<p>Melhora o alcance e a ergonomia para simuladores de corrida sem modificação permanente no volante.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: [],
    features: ["Impresso em PETG de alta resistência", "Encaixe sem ferramentas", "Compatível com G29"],
    warranty: "3 meses",
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    stockQuantity: 10,
    featured: false,
    active: true,
    categorySlug: "personalizados",
    specs: [
      { label: "Compatibilidade", value: "Logitech G29" },
      { label: "Material", value: "PETG" },
    ],
  },
  {
    name: "Fixador de Haste Astro A50 Gen4 (2 peças)",
    slug: "fixador-de-haste-para-astro-a50-gen4-headband-fix-2-pecas",
    shortDescription: "Kit com 2 peças fixadoras de haste para o headset Astro A50 Gen4.",
    description: "<p>Resolve a quebra da haste original sem precisar comprar um novo headset.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: [],
    features: ["Kit com 2 peças", "Encaixe direto na haste original", "Material resistente"],
    warranty: "3 meses",
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    stockQuantity: 10,
    featured: false,
    active: true,
    categorySlug: "personalizados",
    specs: [
      { label: "Compatibilidade", value: "Astro A50 Gen4" },
      { label: "Quantidade", value: "2 peças" },
    ],
  },
  {
    name: "Starlink Suporte de Antena com Trava 1,5\"",
    slug: "starlink-suporte-antena",
    shortDescription: "Suporte para fixação da antena Starlink em poste de 1,5 polegada.",
    description: "<p>Luva/suporte com sistema de trava de segurança e material resistente a UV.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: [],
    features: ["Trava de segurança integrada", "Resistente a UV", "Compatível com postes 1,5\""],
    warranty: "6 meses",
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    stockQuantity: 10,
    featured: false,
    active: true,
    categorySlug: "personalizados",
    specs: [
      { label: "Compatibilidade", value: "Starlink" },
      { label: "Diâmetro do poste", value: "1,5\"" },
    ],
  },
  {
    name: "Kit Dobradiças Audio-Technica ATH-M40x (2x)",
    slug: "kit-dobradicas-audio-technica-m40x",
    shortDescription: "Par de dobradiças (hinges) de reposição para o fone ATH-M40x.",
    description: "<p>Encaixe idêntico ao original — evita a troca do headphone completo.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: [],
    features: ["Par de dobradiças", "Encaixe idêntico ao original", "Material reforçado"],
    warranty: "3 meses",
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    stockQuantity: 10,
    featured: false,
    active: true,
    categorySlug: "personalizados",
    specs: [
      { label: "Compatibilidade", value: "Audio-Technica ATH-M40x" },
      { label: "Quantidade", value: "2 peças" },
    ],
  },
  {
    name: "Suporte Base de Carregamento Xiaomi Vacuum",
    slug: "suporte-base-carregamento-xiaomi-vacuum",
    shortDescription: "Suporte fixador para base de carregamento do robô aspirador Xiaomi.",
    description: "<p>Fixa a base de carregamento no chão impedindo que o robô empurre durante o dock.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: [],
    features: ["Adesivo 3M incluído", "Compatível com múltiplos modelos Xiaomi", "Impresso em PETG"],
    warranty: "3 meses",
    priceOriginal: null,
    pricePromo: null,
    pixPrice: null,
    installments: 0,
    installmentValue: null,
    stockQuantity: 10,
    featured: false,
    active: true,
    categorySlug: "personalizados",
    specs: [
      { label: "Compatibilidade", value: "Xiaomi Vacuum (múltiplos modelos)" },
      { label: "Material", value: "PETG" },
    ],
  },
  {
    name: "Base Magnética PEI para Bambu Lab H2D/H2S (355×346mm)",
    slug: "base-mesa-magnetica-pei-bambu-lab-h2d-h2s",
    shortDescription: "Base magnética PEI flexível para impressoras Bambu Lab H2D e H2S.",
    description: "<p>Superfície magnética PEI de dupla face para facilitar a remoção de peças impressas.</p>",
    image: "/uploads/products/base-mesa-magnetica-pei-para-bambu-lab-h2d-h2s-355x346mm-1-transparent.png",
    gallery: [
      "/uploads/products/base-mesa-magnetica-pei-para-bambu-lab-h2d-h2s-355x346mm-1-transparent.png",
      "/uploads/products/base-mesa-magnetica-pei-para-bambu-lab-h2d-h2s-355x346mm-2-transparent.png",
    ],
    features: ["Dupla face PEI texturizada", "Base magnética flexível", "355 x 346 mm"],
    warranty: "6 meses",
    priceOriginal: 399.90,
    pricePromo: 349.90,
    pixPrice: 319.90,
    installments: 6,
    installmentValue: 58.32,
    stockQuantity: 15,
    featured: true,
    active: true,
    categorySlug: "impressoras-3d",
    specs: [
      { label: "Dimensões", value: "355 x 346 mm" },
      { label: "Compatibilidade", value: "Bambu Lab H2D / H2S" },
    ],
  },
];

// ── Admin padrão ──────────────────────────────────────────────────────────────
const ADMIN = {
  email: (process.env.ADMIN_EMAIL || "admin@ip3d.com.br").toLowerCase().trim(),
  password: process.env.ADMIN_PASSWORD || "Ip3d@2026",
  name: process.env.ADMIN_NAME || "Administrador",
};

if (process.env.NODE_ENV === "production") {
  if (!process.env.ADMIN_PASSWORD || ADMIN.password === "Ip3d@2026") {
    throw new Error("ADMIN_PASSWORD forte e obrigatorio para seed-all.js em producao.");
  }
  if (!isPasswordSecure(ADMIN.password)) {
    throw new Error("ADMIN_PASSWORD nao atende aos requisitos minimos de seguranca.");
  }
}

// ── Execução ──────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔧 Iniciando seed completo...\n");

  if (options.dryRun) {
    console.log("[SIMULAÇÃO] Modo dry-run ativo. Nenhuma operação executada.");
    console.log(`   Categorias a criar/atualizar: ${CATEGORIES.length}`);
    console.log(`   Produtos a criar/atualizar: ${PRODUCTS.length}`);
    console.log(`   Admin a garantir: ${ADMIN.email}`);
    return;
  }

  // 1. Categorias
  console.log("📁 Criando categorias...");
  const categoryMap = {};
  for (const cat of CATEGORIES) {
    const result = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, order: cat.order },
      create: { name: cat.name, slug: cat.slug, order: cat.order, active: true },
    });
    categoryMap[cat.slug] = result.id;
    console.log(`   ✓ ${cat.name} (${cat.slug})`);
  }

  // 2. Produtos
  console.log("\n📦 Criando produtos...");
  for (const prod of PRODUCTS) {
    const { categorySlug, specs, ...data } = prod;
    const categoryId = categoryMap[categorySlug];

    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: { ...data, categoryId },
      create: { ...data, categoryId },
    });

    // Upsert das ProductCategory
    if (categoryId) {
      await prisma.productCategory.upsert({
        where: { productId_categoryId: { productId: product.id, categoryId } },
        update: {},
        create: { productId: product.id, categoryId },
      });
    }

    // Specs
    if (specs && specs.length > 0) {
      await prisma.specification.deleteMany({ where: { productId: product.id } });
      await prisma.specification.createMany({
        data: specs.map((s) => ({ ...s, productId: product.id })),
      });
    }

    console.log(`   ✓ ${data.name}`);
  }

  // 3. Admin
  console.log("\n👤 Criando admin...");
  const existingAdmin = await prisma.user.findFirst({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
  });

  if (existingAdmin) {
    console.log(`   ⚠ Admin já existe: ${existingAdmin.email}`);
  } else {
    const hash = await bcrypt.hash(ADMIN.password, 12);
    await prisma.user.create({
      data: {
        email: ADMIN.email,
        password: hash,
        name: ADMIN.name,
        role: "SUPER_ADMIN",
        active: true,
      },
    });
    console.log(`   ✓ Admin criado: ${ADMIN.email}`);
  }

  console.log("\n✅ Seed completo finalizado!");
  console.log(`   ${CATEGORIES.length} categorias`);
  console.log(`   ${PRODUCTS.length} produtos`);
  const maskedPassword = process.env.NODE_ENV === "production" ? "[MASCARADO EM PRODUÇÃO]" : ADMIN.password;
  console.log(`   Login: ${ADMIN.email} / ${maskedPassword}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Erro no seed:", e);
  process.exit(1);
});
