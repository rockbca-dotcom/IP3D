import { prisma } from "@/lib/prisma";
import { HomeShowcase, type ProductCard } from "@/components/site/HomeShowcase";
import type { Banner, HomeSection } from "@prisma/client";

const showcaseCategorySlugs = [
  "componentes-bambu-lab",
  "componentes-creality",
  "componentes-universais",
  "impressoras-3d",
  "personalizados",
] as const;

const spotlightProductSlugs = [
  "termistor-2x-100k-ohm-ntc-3950-sensor-de-temperatura-3d",
];

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

  return (
    databaseUrl.startsWith("postgresql://") ||
    databaseUrl.startsWith("postgres://") ||
    databaseUrl.startsWith("prisma://")
  );
}

function resolveMainImage(product: ProductSelectResult) {
  const directImage = typeof product.image === "string" ? product.image.trim() : "";
  if (directImage) return directImage;

  const firstGalleryImage = product.gallery.find(
    (image: string) => typeof image === "string" && image.trim().length > 0,
  );

  return firstGalleryImage ?? null;
}

function normalizeProducts(products: ProductSelectResult[]): ProductCard[] {
  return products.map((product) => {
    const mainImage = resolveMainImage(product);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      image: mainImage,
      hoverImage:
        product.gallery.find(
          (image: string) =>
            typeof image === "string" && image.trim().length > 0 && image !== mainImage,
        ) ?? null,
      gallery: product.gallery,
      category: product.category,
      priceOriginal: product.priceOriginal ? Number(product.priceOriginal) : null,
      pricePromo: product.pricePromo ? Number(product.pricePromo) : null,
      pixPrice: product.pixPrice ? Number(product.pixPrice) : null,
      stockQuantity: product.stockQuantity ?? null,
    };
  });
}

function prioritizeProducts(products: ProductCard[]) {
  if (products.length === 0) return products;

  const prioritized: ProductCard[] = [];
  const seenIds = new Set<string>();

  for (const slug of spotlightProductSlugs) {
    const match = products.find((product) => product.slug === slug);
    if (match && !seenIds.has(match.id)) {
      prioritized.push(match);
      seenIds.add(match.id);
    }
  }

  for (const product of products) {
    if (seenIds.has(product.id)) continue;
    prioritized.push(product);
    seenIds.add(product.id);
  }

  return prioritized;
}

function renderHomeWithEmptyContent() {
  return (
    <HomeShowcase
      categories={[]}
      featuredProducts={[]}
      promoProducts={[]}
      categoryProducts={{}}
      allProducts={[]}
      banners={[]}
      homeSections={[]}
    />
  );
}

export default async function Home() {
  if (!hasUsableDatabase()) {
    return renderHomeWithEmptyContent();
  }

  let categoriesData: Awaited<ReturnType<typeof prisma.category.findMany>> | null = null;
  let featuredData: ProductSelectResult[] = [];
  let promoData: ProductSelectResult[] = [];
  let allActiveProductsData: ProductSelectResult[] = [];
  let bannersData: Banner[] = [];
  let homeSectionsData: HomeSection[] = [];
  let categoryProductsWithSpotlight: Record<string, ProductCard[]> = {};
  let homeLoadFailed = false;

  try {
    const [
      fetchedCategories,
      fetchedFeatured,
      fetchedPromo,
      fetchedAllActive,
      fetchedBanners,
      fetchedHomeSections,
    ] = await Promise.all([
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
      prisma.banner.findMany({
        where: { active: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      }),
      prisma.homeSection.findMany({
        where: { active: true },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    categoriesData = fetchedCategories;
    featuredData = fetchedFeatured;
    promoData = fetchedPromo;
    allActiveProductsData = fetchedAllActive;
    bannersData = fetchedBanners;
    homeSectionsData = fetchedHomeSections;

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

        return [slug, prioritizeProducts(normalizeProducts(products))] as const;
      }),
    );

    categoryProductsWithSpotlight = categoryProductEntries.reduce<Record<string, ProductCard[]>>(
      (acc, [slug, products]) => {
        acc[slug] = products;
        return acc;
      },
      {},
    );
  } catch (error) {
    console.error("Failed to load home data:", error);
    homeLoadFailed = true;
  }

  if (homeLoadFailed || !categoriesData) {
    return renderHomeWithEmptyContent();
  }

  const allProducts = prioritizeProducts(normalizeProducts(allActiveProductsData));

  return (
    <HomeShowcase
      categories={categoriesData}
      featuredProducts={prioritizeProducts(normalizeProducts(featuredData))}
      promoProducts={prioritizeProducts(normalizeProducts(promoData))}
      categoryProducts={categoryProductsWithSpotlight}
      allProducts={allProducts}
      banners={bannersData}
      homeSections={homeSectionsData}
    />
  );
}
