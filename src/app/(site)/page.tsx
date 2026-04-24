import { prisma } from "@/lib/prisma";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { HomeShowcase, type ProductCard } from "@/components/site/HomeShowcase";

const showcaseCategorySlugs = ["componentes-bambu-lab", "componentes-creality", "componentes-universais", "impressoras-3d", "personalizados"] as const;

const fallbackProducts: ProductCard[] = [
  {
    id: "fallback-hotend-creality-ender-3-v2",
    name: "Kit Hotend Completo Creality Ender 3 / Pro / V2 24V",
    slug: "kit-hotend-completo-creality-ender-3-pro-v2-24v-nozzle-cortesia",
    shortDescription: "Kit hotend completo 24V para Ender 3 / Pro / V2 com nozzle de cortesia, cabo de 1 metro e instalação prática.",
    image: "https://http2.mlstatic.com/D_Q_NP_607343-MLA110079794477_042026-F.webp",
    hoverImage: "https://http2.mlstatic.com/D_Q_NP_656866-MLA110079853361_042026-F.webp",
    gallery: [
      "https://http2.mlstatic.com/D_Q_NP_607343-MLA110079794477_042026-F.webp",
      "https://http2.mlstatic.com/D_Q_NP_656866-MLA110079853361_042026-F.webp",
      "https://http2.mlstatic.com/D_Q_NP_826407-MLA109232233940_042026-F.webp"
    ],
    priceOriginal: 129.9,
    pricePromo: 119.99,
    pixPrice: 119.99,
    stockQuantity: 25,
    category: { name: "Componentes Creality" },
  },
  {
    id: "fallback-hotend-bambu-a1",
    name: "Hotend Bambu Lab A1 Mini",
    slug: "hotend-bambu-lab-a1-mini",
    shortDescription: "Reposição premium para impressão com precisão e consistência.",
    image: "/uploads/products/bico-nozzle-aco-endurecido-bambu-lab-a1.jpg",
    priceOriginal: 199.9,
    pricePromo: 179.9,
    pixPrice: 169.9,
    stockQuantity: 10,
    category: { name: "Componentes Bambu Lab" },
  },
  {
    id: "fallback-silicone-creality-k1-max",
    name: "Capa De Silicone Blue Makers Creality",
    slug: "capa-de-silicone-blue-makers-creality-k1-max-antiaderente-300c",
    shortDescription: "Capa antiaderente em silicone para Creality K1 / K1 Max com resistência térmica de até 300°C.",
    image: "https://http2.mlstatic.com/D_Q_NP_770204-MLA100095605391_122025-F.webp",
    hoverImage: "https://http2.mlstatic.com/D_Q_NP_817420-MLA99610440976_122025-F.webp",
    gallery: [
      "https://http2.mlstatic.com/D_Q_NP_770204-MLA100095605391_122025-F.webp",
      "https://http2.mlstatic.com/D_Q_NP_817420-MLA99610440976_122025-F.webp",
      "https://http2.mlstatic.com/D_Q_NP_780886-MLA99610470822_122025-F.webp"
    ],
    priceOriginal: 19,
    pricePromo: 19,
    pixPrice: 18.75,
    stockQuantity: 20,
    category: { name: "Componentes Creality" },
  },
  {
    id: "fallback-nozzle-bambu-a1",
    name: "Nozzle Aço Bambu Lab A1",
    slug: "nozzle-aco-bambu-lab-a1",
    shortDescription: "Alta durabilidade para materiais abrasivos.",
    image: "/uploads/products/bico-nozzle-aco-endurecido-bambu-lab-a1.jpg",
    priceOriginal: 89.9,
    pricePromo: 79.9,
    pixPrice: 75.9,
    stockQuantity: 15,
    category: { name: "Componentes Bambu Lab" },
  },
  {
    id: "fallback-wiper-bambu-a1",
    name: "Nozzle Wiper Bambu Lab A1",
    slug: "nozzle-wiper-bambu-lab-a1",
    shortDescription: "Limpeza automática do bocal antes da impressão.",
    image: "/uploads/products/limpador-bico-bambu-lab-a1.jpg",
    priceOriginal: 59.9,
    pricePromo: 49.9,
    pixPrice: 47.9,
    stockQuantity: 12,
    category: { name: "Componentes Bambu Lab" },
  },
  {
    id: "fallback-hotend-creality-cr10",
    name: "Hotend Creality CR10",
    slug: "hotend-creality-cr10",
    shortDescription: "Reposição técnica para impressoras Creality.",
    image: "/uploads/products/kit-hotend-creality-cr-10.jpg",
    priceOriginal: 149.9,
    pricePromo: 129.9,
    pixPrice: 123.9,
    stockQuantity: 8,
    category: { name: "Componentes Creality" },
  },
  {
    id: "fallback-termistor-ntc",
    name: "Termistor NTC 100K",
    slug: "termistor-ntc-100k-3950",
    shortDescription: "Sensor de temperatura estável para hotends universais.",
    image: "/images/products/components-placeholder.svg",
    priceOriginal: 34.9,
    pricePromo: 29.9,
    pixPrice: 28.4,
    stockQuantity: 30,
    category: { name: "Componentes Universais" },
  },
  {
    id: "fallback-aquecedor-ceramico",
    name: "Kit Aquecedor Cerâmico 60W",
    slug: "kit-aquecedor-ceramico-60w",
    shortDescription: "Aquecimento rápido para montagem e reposição técnica.",
    image: "/uploads/products/kit-aquecedor-ceramico-60w.jpg",
    priceOriginal: 69.9,
    pricePromo: 59.9,
    pixPrice: 56.9,
    stockQuantity: 18,
    category: { name: "Componentes Universais" },
  },
  {
    id: "fallback-mesa-pei-h2d",
    name: "Mesa PEI Texturizada H2D",
    slug: "mesa-pei-bambu-lab-h2d",
    shortDescription: "Superfície de aderência com acabamento profissional.",
    image: "/uploads/products/mesa-pei-texturizada-bambu-lab-h2d.jpg",
    priceOriginal: 299.9,
    pricePromo: 279.9,
    pixPrice: 265.9,
    stockQuantity: 6,
    category: { name: "Impressões 3D" },
  },
  {
    id: "fallback-astro-a50-headband",
    name: "Headband Astro A50 / SteelSeries",
    slug: "astro-a50-headband-steelseries",
    shortDescription: "Peça de reposição impressa em 3D com acabamento técnico.",
    image: "/images/products/components-placeholder.svg",
    priceOriginal: 119.9,
    pricePromo: 99.9,
    pixPrice: 94.9,
    stockQuantity: 7,
    category: { name: "Impressões 3D" },
  },
  {
    id: "fallback-logitech-g29-paddle",
    name: "Extensor Paddle Logitech G29",
    slug: "logitech-g29-extensor-paddle",
    shortDescription: "Acessório funcional impresso em 3D para sim racing.",
    image: "/images/products/components-placeholder.svg",
    priceOriginal: 89.9,
    pricePromo: 74.9,
    pixPrice: 71.2,
    stockQuantity: 9,
    category: { name: "Impressões 3D" },
  },
  {
    id: "fallback-suporte-starlink",
    name: "Suporte Ethernet Starlink",
    slug: "suporte-ethernet-starlink",
    shortDescription: "Solução impressa em 3D para organização e fixação.",
    image: "/images/products/components-placeholder.svg",
    priceOriginal: 99.9,
    pricePromo: 84.9,
    pixPrice: 80.7,
    stockQuantity: 11,
    category: { name: "Impressões 3D" },
  },
  {
    id: "fallback-bobblehead-3d",
    name: "Boneco Bobblehead 3D Personalizado",
    slug: "boneco-bobblehead-3d",
    shortDescription: "Projeto personalizado sob medida em impressão 3D.",
    image: "/images/products/components-placeholder.svg",
    priceOriginal: 249.9,
    pricePromo: 219.9,
    pixPrice: 208.9,
    stockQuantity: 5,
    category: { name: "Personalizados" },
  },
  {
    id: "fallback-protecao-dji-neo",
    name: "Proteção DJI Neo",
    slug: "protecao-dji-neo",
    shortDescription: "Projeto personalizado com prototipagem e ajuste sob medida.",
    image: "/images/products/components-placeholder.svg",
    priceOriginal: 139.9,
    pricePromo: 119.9,
    pixPrice: 113.9,
    stockQuantity: 4,
    category: { name: "Personalizados" },
  },
  {
    id: "fallback-suporte-lanterna-dji-neo",
    name: "Suporte de Lanterna DJI Neo",
    slug: "suporte-lanterna-dji-neo",
    shortDescription: "Solução personalizada para uso específico e encaixe preciso.",
    image: "/images/products/components-placeholder.svg",
    priceOriginal: 129.9,
    pricePromo: 109.9,
    pixPrice: 104.4,
    stockQuantity: 4,
    category: { name: "Personalizados" },
  },
  {
    id: "fallback-suporte-xiaomi-vacum",
    name: "Suporte Xiaomi Vacuum",
    slug: "suporte-xiaomi-vacum",
    shortDescription: "Peça personalizada para organização e instalação sob medida.",
    image: "/images/products/components-placeholder.svg",
    priceOriginal: 119.9,
    pricePromo: 99.9,
    pixPrice: 94.9,
    stockQuantity: 6,
    category: { name: "Personalizados" },
  },
];

const fallbackCategoryProducts: Record<string, ProductCard[]> = {
  "componentes-bambu-lab": fallbackProducts.filter((product) => product.category?.name === "Componentes Bambu Lab"),
  "componentes-creality": fallbackProducts.filter((product) => product.category?.name === "Componentes Creality"),
  "componentes-universais": fallbackProducts.filter((product) => product.category?.name === "Componentes Universais"),
  "impressoras-3d": fallbackProducts.filter((product) => product.category?.name === "Impressões 3D"),
  personalizados: fallbackProducts.filter((product) => product.category?.name === "Personalizados"),
};

const spotlightTermistorProduct: ProductCard = {
  id: "termistor-2x-100k-ohm-ntc-3950-sensor-de-temperatura-3d",
  name: "Termistor 2x 100k Ohm NTC 3950 Sensor de Temperatura 3D",
  slug: "termistor-2x-100k-ohm-ntc-3950-sensor-de-temperatura-3d",
  shortDescription:
    "Kit com 2 sensores NTC 100K 3950 para impressoras 3D, com cabo em teflon de 1 m, precisão de ±1% e faixa de -40 °C a 300 °C.",
  image: "https://http2.mlstatic.com/D_Q_NP_875575-MLA100083141047_122025-R.webp",
  hoverImage: "https://http2.mlstatic.com/D_Q_NP_746833-MLA81060561687_112024-R.webp",
  gallery: [
    "https://http2.mlstatic.com/D_Q_NP_875575-MLA100083141047_122025-F.webp",
    "https://http2.mlstatic.com/D_Q_NP_746833-MLA81060561687_112024-F.webp",
    "https://http2.mlstatic.com/D_Q_NP_707940-MLA80795524864_112024-F.webp",
  ],
  priceOriginal: 35,
  pricePromo: 31.9,
  pixPrice: 31.9,
  stockQuantity: 25,
  category: { name: "Componentes Universais" },
};

function withSpotlight(products: ProductCard[]) {
  return [
    spotlightTermistorProduct,
    ...products.filter((product) => product.slug !== spotlightTermistorProduct.slug),
  ];
}

type ProductSelectResult = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  image: string | null;
  gallery: string[];
  priceOriginal: { toString(): string } | null;
  pricePromo: { toString(): string } | null;
  pixPrice: { toString(): string } | null;
  stockQuantity: number;
  category: { name: string } | null;
};

const productSelect = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  image: true,
  gallery: true,
  priceOriginal: true,
  pricePromo: true,
  pixPrice: true,
  stockQuantity: true,
  category: { select: { name: true } },
};

function hasUsableDatabase() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) return false;
  if (databaseUrl.includes("user:password@localhost:5432/site_base")) return false;

  return databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("prisma://");
}

async function getHomeBlocks() {
  if (!hasUsableDatabase()) {
    return [];
  }

  try {
    const page = await prisma.page.findFirst({
      where: { slug: "home", published: true },
      include: {
        blocks: {
          where: { active: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return page?.blocks || [];
  } catch (error) {
    console.error("Failed to load home CMS blocks:", error);
    return [];
  }
}

export default async function Home() {
  if (!hasUsableDatabase()) {
    return (
      <HomeShowcase
        categories={[]}
        featuredProducts={withSpotlight(fallbackProducts).slice(0, 4)}
        promoProducts={withSpotlight(fallbackProducts).slice(0, 8)}
        categoryProducts={{
          ...fallbackCategoryProducts,
          "componentes-universais": withSpotlight(fallbackCategoryProducts["componentes-universais"] ?? []),
        }}
        allProducts={withSpotlight(fallbackProducts)}
      />
    );
  }

  const blocks = await getHomeBlocks();

  if (blocks.length > 0) {
    return <BlockRenderer blocks={blocks} />;
  }

  const resolveMainImage = (product: ProductSelectResult) => {
    const directImage = typeof product.image === "string" ? product.image.trim() : "";
    if (directImage) return directImage;
    const firstGalleryImage = product.gallery.find((image: string) => typeof image === "string" && image.trim().length > 0);
    return firstGalleryImage ?? null;
  };

  const normalizeProducts = (products: ProductSelectResult[]): ProductCard[] =>
    products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      image: resolveMainImage(product),
      hoverImage: product.gallery.find((image: string) => typeof image === "string" && image.trim().length > 0 && image !== resolveMainImage(product)) ?? null,
      gallery: product.gallery,
      category: product.category,
      priceOriginal: product.priceOriginal ? Number(product.priceOriginal) : null,
      pricePromo: product.pricePromo ? Number(product.pricePromo) : null,
      pixPrice: product.pixPrice ? Number(product.pixPrice) : null,
      stockQuantity: product.stockQuantity ?? null,
    }));

  try {
    const [categoriesData, featuredData, promoData, allActiveProductsData] = await Promise.all([
      prisma.category.findMany({
        where: { active: true, parentId: null },
        include: {
          _count: { select: { products: true, productCategories: true } },
          children: {
            where: { active: true },
            select: { id: true, name: true, slug: true },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { order: "asc" },
      }),
      prisma.product.findMany({
        where: { active: true, featured: true },
        select: productSelect,
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
      prisma.product.findMany({
        where: { active: true },
        select: productSelect,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.product.findMany({
        where: { active: true },
        select: productSelect,
        orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
      }),
    ]);

    const categoryProductEntries = await Promise.all(
      showcaseCategorySlugs.map(async (slug) => {
        const products = await prisma.product.findMany({
          where: {
            active: true,
            OR: [
              { category: { slug } },
              { categories: { some: { category: { slug } } } },
            ],
          },
          select: productSelect,
          orderBy: { createdAt: "desc" },
          take: 12,
        });

        return [slug, normalizeProducts(products)] as const;
      })
    );

    const categoryProducts = categoryProductEntries.reduce<Record<string, ProductCard[]>>((acc, [slug, products]) => {
      acc[slug] = products;
      return acc;
    }, {});

    const categoryProductsWithSpotlight = {
      ...categoryProducts,
      "componentes-universais": withSpotlight(categoryProducts["componentes-universais"] ?? []),
    };
    // allProducts: todos os produtos activos, sem filtro de imagem.
    // Alimenta a seção "Todos os nossos produtos" no HomeShowcase — inclui
    // componentes (9) e personalizados (13) mesmo que ainda sem imagem cadastrada.
    const allProducts = normalizeProducts(allActiveProductsData);

    return (
      <HomeShowcase
        categories={categoriesData}
        featuredProducts={withSpotlight(normalizeProducts(featuredData))}
        promoProducts={withSpotlight(normalizeProducts(promoData))}
        categoryProducts={categoryProductsWithSpotlight}
        allProducts={withSpotlight(allProducts)}
      />
    );
  } catch (error) {
    console.error("Failed to load home fallback data:", error);

    return (
      <HomeShowcase
        categories={[]}
        featuredProducts={fallbackProducts.slice(0, 4)}
        promoProducts={fallbackProducts.slice(0, 8)}
        categoryProducts={fallbackCategoryProducts}
        allProducts={fallbackProducts}
      />
    );
  }
}
