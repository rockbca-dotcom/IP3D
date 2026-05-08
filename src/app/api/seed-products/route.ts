import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

const SAMPLE_PRODUCTS = [
  {
    name: "Kit Hotend Completo para Bambu Lab A1 Mini/NORMAL",
    slug: "kit-hotend-bambu-lab-a1",
    shortDescription: "Hotend completo de reposição com barrel, aquecedor e nozzle para as linhas A1 Mini e A1.",
    description: "<p>Kit com corpo metálico, bloco aquecido, cartucho e bico pré-instalado para restauração rápida da Bambu Lab A1 Mini e versão normal.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: ["/images/products/components-placeholder.svg"],
    features: [
      "Inclui bloco aquecido, dissipador e nozzle 0,4 mm",
      "Compatível com A1 Mini e A1",
      "Substituição plug-and-play",
    ],
    video: null,
    catalog: null,
    warranty: "3 meses",
    priceOriginal: 249.90,
    pricePromo: 199.90,
    pixPrice: 189.90,
    installments: 3,
    installmentValue: 66.63,
    stockQuantity: 50,
    featured: true,
    active: true,
    category: "Componentes Bambu Lab",
    specs: [
      { name: "Compatibilidade", value: "Bambu Lab A1 Mini e A1" },
      { name: "Conteúdo", value: "Bloco aquecido, heatbreak, nozzle 0,4 mm" },
    ],
  },
  {
    name: "Capa de Silicone (Meia) para Bambu Lab A1 Mini/NORMAL",
    slug: "capa-silicone-bambu-lab-a1",
    shortDescription: "Meia de silicone 300 °C para proteger o bloco aquecido da A1.",
    description: "<p>Capa de silicone resistente a altas temperaturas para preservar o bloco aquecido da Bambu Lab A1 Mini e A1, reduzindo o acúmulo de resíduos.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: ["/images/products/components-placeholder.svg"],
    features: [
      "Suporta até 300 °C",
      "Material de silicone com isolamento térmico",
      "Instalação rápida com encaixe perfeito",
    ],
    video: null,
    catalog: null,
    warranty: "3 meses",
    priceOriginal: 39.90,
    pricePromo: null,
    pixPrice: 35.90,
    installments: 0,
    installmentValue: null,
    stockQuantity: 50,
    featured: false,
    active: true,
    category: "Componentes Bambu Lab",
    specs: [
      { name: "Compatibilidade", value: "Bambu Lab A1 Mini e A1" },
      { name: "Temperatura máxima", value: "300 °C" },
    ],
  },
  {
    name: "Bico Nozzle de Aço Endurecido para Bambu Lab A1 Mini/NORMAL",
    slug: "nozzle-aco-bambu-lab-a1",
    shortDescription: "Nozzle 0,4 mm em aço endurecido para filamentos abrasivos.",
    description: "<p>Nozzle em aço endurecido 0,4 mm ideal para filamentos com fibra de carbono, vidro ou outros aditivos abrasivos nas impressoras A1.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: ["/images/products/components-placeholder.svg"],
    features: [
      "Bico 0,4 mm em aço endurecido",
      "Maior durabilidade com filamentos abrasivos",
      "Rosca padrão do hotend A1",
    ],
    video: null,
    catalog: null,
    warranty: "3 meses",
    priceOriginal: 79.90,
    pricePromo: null,
    pixPrice: 71.90,
    installments: 0,
    installmentValue: null,
    stockQuantity: 50,
    featured: false,
    active: true,
    category: "Componentes Bambu Lab",
    specs: [
      { name: "Material", value: "Aço endurecido" },
      { name: "Diâmetro", value: "0,4 mm" },
    ],
  },
  {
    name: "Limpador de Bico (Nozzle Wiper) para Bambu Lab A1",
    slug: "nozzle-wiper-bambu-lab-a1",
    shortDescription: "Espátula de limpeza para a sequência automática de purga da A1.",
    description: "<p>Peça de reposição do wiper que remove o excesso de material durante a rotina de limpeza automática da Bambu Lab A1.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: ["/images/products/components-placeholder.svg"],
    features: [
      "Superfície em silicone flexível",
      "Fixação rápida no suporte original",
      "Compatível com rotina de limpeza padrão",
    ],
    video: null,
    catalog: null,
    warranty: "3 meses",
    priceOriginal: 44.90,
    pricePromo: null,
    pixPrice: 40.40,
    installments: 0,
    installmentValue: null,
    stockQuantity: 50,
    featured: false,
    active: true,
    category: "Componentes Bambu Lab",
    specs: [
      { name: "Compatibilidade", value: "Bambu Lab A1" },
      { name: "Material", value: "Silicone e base metálica" },
    ],
  },
  {
    name: "Kit Termistor para Bambu Lab A1 / A1 Mini",
    slug: "kit-termistor-bambu-lab-a1",
    shortDescription: "Conjunto com termistor NTC e cartucho aquecedor para hotend A1.",
    description: "<p>Kit completo com termistor NTC e cartucho aquecedor para reposição preventiva no hotend A1, garantindo leituras de temperatura precisas.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: ["/images/products/components-placeholder.svg"],
    features: [
      "Cartucho aquecedor 24 V",
      "Termistor NTC calibrado",
      "Conectores compatíveis com chicote original",
    ],
    video: null,
    catalog: null,
    warranty: "3 meses",
    priceOriginal: 89.90,
    pricePromo: 79.90,
    pixPrice: 71.90,
    installments: 2,
    installmentValue: 39.95,
    stockQuantity: 10,
    featured: false,
    active: true,
    category: "Componentes Bambu Lab",
    specs: [
      { name: "Tensão", value: "24 V" },
      { name: "Compatibilidade", value: "Bambu Lab A1 Mini e A1" },
    ],
  },
  {
    name: "Mesa PEI Texturizada Dupla Face para Bambu Lab H2D (350 x 320 mm)",
    slug: "mesa-pei-bambu-lab-h2d",
    shortDescription: "Placa PEI texturizada dupla face para plataforma H2D 350×320 mm.",
    description: "<p>Superfície PEI texturizada dupla face para a Bambu Lab H2D, oferecendo aderência superior e fácil remoção das peças impressas.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: ["/images/products/components-placeholder.svg"],
    features: [
      "Revestimento PEI texturizado em ambas as faces",
      "Base flexível para remoção rápida",
      "Formato 350 x 320 mm para H2D",
    ],
    video: null,
    catalog: null,
    warranty: "6 meses",
    priceOriginal: 349.90,
    pricePromo: 299.90,
    pixPrice: 269.90,
    installments: 6,
    installmentValue: 49.98,
    stockQuantity: 10,
    featured: true,
    active: true,
    category: "Componentes Bambu Lab",
    specs: [
      { name: "Dimensões", value: "350 x 320 mm" },
      { name: "Compatibilidade", value: "Bambu Lab H2D" },
    ],
  },
  {
    name: "Kit Aquecedor Cerâmico 60W 360° e Termistor",
    slug: "kit-aquecedor-ceramico-60w",
    shortDescription: "Cartucho cerâmico 60 W com termistor integrado para hotends universais.",
    description: "<p>Kit com cartucho cerâmico 60 W e termistor 360° para reposição em hotends que exigem aquecimento rápido e precisão térmica.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: ["/images/products/components-placeholder.svg"],
    features: [
      "Cartucho cerâmico 60 W",
      "Termistor com leitura 360°",
      "Compatível com hotends padrão V6 e derivados",
    ],
    video: null,
    catalog: null,
    warranty: "3 meses",
    priceOriginal: 89.90,
    pricePromo: 69.90,
    pixPrice: 62.90,
    installments: 2,
    installmentValue: 34.95,
    stockQuantity: 100,
    featured: false,
    active: true,
    category: "Componentes Universais",
    specs: [
      { name: "Potência", value: "60 W" },
      { name: "Tensão", value: "24 V" },
    ],
  },
  {
    name: "Kit Hotend Completo para Creality CR-10",
    slug: "kit-hotend-creality-cr10",
    shortDescription: "Hotend metálico completo compatível com CR-10 e variações.",
    description: "<p>Conjunto completo de hotend metálico para impressoras Creality CR-10, pronto para substituição com heatbreak, bloco e nozzle.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: ["/images/products/components-placeholder.svg"],
    features: [
      "Heatbreak totalmente metálico",
      "Nozzle 0,4 mm pré-instalado",
      "Compatível com CR-10 e derivados",
    ],
    video: null,
    catalog: null,
    warranty: "3 meses",
    priceOriginal: 199.90,
    pricePromo: 159.90,
    pixPrice: 143.90,
    installments: 3,
    installmentValue: 53.30,
    stockQuantity: 50,
    featured: true,
    active: true,
    category: "Componentes Creality",
    specs: [
      { name: "Compatibilidade", value: "Creality CR-10 / CR-10S" },
      { name: "Diâmetro do bico", value: "0,4 mm" },
    ],
  },
  {
    name: "Termistor NTC 100K 1% 3950 (Resistente até 200 °C)",
    slug: "termistor-ntc-100k-3950",
    shortDescription: "Termistor NTC 100K de alta precisão para múltiplos hotends.",
    description: "<p>Termistor NTC 100K com precisão de 1% e curva 3950, ideal para upgrades de hotends em diversas impressoras 3D.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: ["/images/products/components-placeholder.svg"],
    features: [
      "Precisão 1%",
      "Curva Beta 3950",
      "Temperatura de operação até 200 °C",
    ],
    video: null,
    catalog: null,
    warranty: "3 meses",
    priceOriginal: 34.90,
    pricePromo: null,
    pixPrice: 29.90,
    installments: 0,
    installmentValue: null,
    stockQuantity: 100,
    featured: false,
    active: true,
    category: "Componentes Universais",
    specs: [
      { name: "Tipo", value: "NTC 100K 3950" },
      { name: "Temperatura suportada", value: "Até 200 °C" },
    ],
  },
];

type SeedCategory = { name: string; id: string };
type SeedSpecification = { name: string; value: string };
type SeedProduct = (typeof SAMPLE_PRODUCTS)[number];

export async function POST(request: Request) {
  // Camada 1: bloqueio total em produção
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Endpoint de seed desativado em produção." },
      { status: 403 }
    );
  }

  // Camada 2: sessão admin válida obrigatória (ADMIN ou SUPER_ADMIN)
  const adminOk = await isAdmin();
  if (!adminOk) {
    return NextResponse.json(
      { error: "Acesso negado. Faça login como administrador." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "replace";

    if (mode === "clear") {
      // Camada 3: confirmação explícita para operação destrutiva
      if (searchParams.get("confirm") !== "yes") {
        return NextResponse.json(
          { error: "Operação destrutiva requer confirmação. Use ?mode=clear&confirm=yes" },
          { status: 400 }
        );
      }
      await prisma.product.deleteMany({});
      await prisma.category.deleteMany({});
      return NextResponse.json({ message: "All products and categories cleared" });
    }

    const categoryNames = [...new Set(SAMPLE_PRODUCTS.map((p) => p.category))];
    const createdCategories = await Promise.all(
      categoryNames.map(async (name) => {
        const slug = name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return await prisma.category.upsert({
          where: { slug },
          update: {},
          create: { name, slug },
        });
      })
    );

    const categoryMap = Object.fromEntries(
      createdCategories.map((cat: SeedCategory) => [cat.name, cat.id])
    );

    for (const product of SAMPLE_PRODUCTS) {
      const { category, specs, ...productData } = product as SeedProduct;
      const categoryId = categoryMap[category];
      if (!categoryId) continue;

      await prisma.product.upsert({
        where: { slug: product.slug },
        update: { ...productData },
        create: { ...productData, categoryId },
      });

      if (specs?.length) {
        const existingProduct = await prisma.product.findUnique({
          where: { slug: product.slug },
        });
        if (existingProduct) {
          await prisma.specification.deleteMany({
            where: { productId: existingProduct.id },
          });
          await prisma.specification.createMany({
            data: specs.map((spec: SeedSpecification) => ({
              productId: existingProduct.id,
              label: spec.name,
              value: spec.value,
            })),
          });
        }
      }
    }

    return NextResponse.json({
      message: `Seeded ${SAMPLE_PRODUCTS.length} products across ${createdCategories.length} categories`,
      categories: createdCategories.map((c: SeedCategory) => c.name),
      products: SAMPLE_PRODUCTS.map((p) => p.name),
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  const count = await prisma.product.count();
  const categories = await prisma.category.findMany({ select: { name: true } });
  return NextResponse.json({
    products: count,
    categories: categories.map((c: SeedCategory) => c.name),
  });
}
