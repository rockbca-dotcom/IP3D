import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003";
  const canUseDatabase = Boolean(process.env.DATABASE_URL);

  // Páginas públicas fundamentais do storefront
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/produtos`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/categorias`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/sobre`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contato`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/personalizados`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  if (!canUseDatabase) {
    console.warn("Sitemap: DATABASE_URL ausente, retornando apenas páginas estáticas.");
    return staticPages;
  }

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    });
    productPages = products.map((product) => ({
      url: `${baseUrl}/produtos/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Erro ao buscar produtos para sitemap:", error);
  }

  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    });
    categoryPages = categories.map((category) => ({
      url: `${baseUrl}/categorias/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Erro ao buscar categorias para sitemap:", error);
  }

  let cmsPages: MetadataRoute.Sitemap = [];
  try {
    const pages = await prisma.page.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
    cmsPages = pages.map((page) => ({
      url: `${baseUrl}/p/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Erro ao buscar paginas CMS para sitemap:", error);
  }

  return [...staticPages, ...productPages, ...categoryPages, ...cmsPages];
}
