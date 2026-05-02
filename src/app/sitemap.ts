import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/produtos`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/marcas`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/manutencao`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/sobre`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contato`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

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
      priority: 0.7,
    }));
  } catch (e) {
    console.error("Erro ao buscar produtos para sitemap:", e);
  }

  let brandPages: MetadataRoute.Sitemap = [];
  try {
    const brands = await prisma.brand.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    });
    brandPages = brands.map((brand) => ({
      url: `${baseUrl}/marcas/${brand.slug}`,
      lastModified: brand.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.error("Erro ao buscar marcas para sitemap:", e);
  }

  return [...staticPages, ...productPages, ...brandPages];
}
