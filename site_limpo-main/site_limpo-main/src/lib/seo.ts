import type { Metadata } from "next";

type SeoKey = "main" | "spa" | "tricologia" | "salao";

interface SeoSiteConfig {
  title?: string;
  description?: string;
  favicon?: string;
  keywords?: string;
}

const defaults: Record<SeoKey, SeoSiteConfig> = {
  main: {
    title: "IP3D – Tecnologia em Impressão 3D",
    description: "IP3D: equipamentos e insumos para impressão 3D.",
    favicon: "/favicon.ico",
    keywords: "impressão 3d, impressora 3d, filamento, resina",
  },
  tricologia: {
    title: "",
    description: "",
    favicon: "/favicon.ico",
    keywords: "",
  },
  spa: {
    title: "",
    description: "",
    favicon: "/favicon.ico",
    keywords: "",
  },
  salao: {
    title: "",
    description: "",
    favicon: "/favicon.ico",
    keywords: "",
  },
};

export async function getSeoConfig(key: SeoKey): Promise<SeoSiteConfig> {
  return defaults[key];
}

export async function buildMetadata(key: SeoKey): Promise<Metadata> {
  const seo = await getSeoConfig(key);
  const keywords = seo.keywords ? seo.keywords.split(",").map((k) => k.trim()) : [];
  return {
    title: seo.title,
    description: seo.description,
    keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: "website",
      locale: "pt_BR",
    },
  };
}

export async function getFaviconUrl(key: SeoKey): Promise<string> {
  const seo = await getSeoConfig(key);
  return seo.favicon || "/favicon.ico";
}
