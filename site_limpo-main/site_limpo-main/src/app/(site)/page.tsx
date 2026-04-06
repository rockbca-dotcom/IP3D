import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { HomeShowcase, type ProductCard } from "@/components/site/HomeShowcase";

const showcaseCategorySlugs = ["componentes-bambu-lab", "componentes-creality", "componentes-universais", "impressoras-3d", "personalizados"] as const;

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
} satisfies Prisma.ProductSelect;

type ProductSelectResult = Prisma.ProductGetPayload<{ select: typeof productSelect }>;

async function getHomeBlocks() {
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
  const blocks = await getHomeBlocks();

  if (blocks.length > 0) {
    return <BlockRenderer blocks={blocks} />;
  }

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

  const resolveMainImage = (product: ProductSelectResult) => {
    const directImage = typeof product.image === "string" ? product.image.trim() : "";
    if (directImage) return directImage;
    const firstGalleryImage = product.gallery.find((image) => typeof image === "string" && image.trim().length > 0);
    return firstGalleryImage ?? null;
  };

  const normalizeProducts = (products: ProductSelectResult[]): ProductCard[] =>
    products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      image: resolveMainImage(product),
      hoverImage: product.gallery.find((image) => typeof image === "string" && image.trim().length > 0 && image !== resolveMainImage(product)) ?? null,
      gallery: product.gallery,
      category: product.category,
      priceOriginal: product.priceOriginal ? Number(product.priceOriginal) : null,
      pricePromo: product.pricePromo ? Number(product.pricePromo) : null,
      pixPrice: product.pixPrice ? Number(product.pixPrice) : null,
      stockQuantity: product.stockQuantity ?? null,
    }));

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
  // allProducts: todos os produtos activos, sem filtro de imagem.
  // Alimenta a seção "Todos os nossos produtos" no HomeShowcase — inclui
  // componentes (9) e personalizados (13) mesmo que ainda sem imagem cadastrada.
  const allProducts = normalizeProducts(allActiveProductsData);

  return (
    <HomeShowcase
      categories={categoriesData}
      featuredProducts={normalizeProducts(featuredData)}
      promoProducts={normalizeProducts(promoData)}
      categoryProducts={categoryProducts}
      allProducts={allProducts}
    />
  );
}

