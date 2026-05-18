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

export async function buildMetadata(
  key: SeoKey,
  overrides?: {
    title?: string;
    description?: string;
    keywords?: string | string[];
    path?: string;
    ogImage?: string;
  }
): Promise<Metadata> {
  const seo = await getSeoConfig(key);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003";

  const title = overrides?.title || seo.title || "IP3D – Tecnologia em Impressão 3D";
  const description = overrides?.description || seo.description || "IP3D: equipamentos e insumos para impressão 3D.";
  const path = overrides?.path || "";
  const canonicalUrl = `${baseUrl}${path}`;

  const keywords = overrides?.keywords
    ? (typeof overrides.keywords === "string" ? overrides.keywords.split(",").map((k) => k.trim()) : overrides.keywords)
    : (seo.keywords ? seo.keywords.split(",").map((k) => k.trim()) : []);

  const defaultOgImage = `${baseUrl}/images/og-default.png`;
  let ogImageUrl = overrides?.ogImage || defaultOgImage;
  if (ogImageUrl.startsWith("/")) {
    ogImageUrl = `${baseUrl}${ogImageUrl}`;
  }

  return {
    title: {
      default: title,
      template: "%s | IP3D",
    },
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "pt_BR",
      url: canonicalUrl,
      siteName: "IP3D",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export async function getFaviconUrl(key: SeoKey): Promise<string> {
  const seo = await getSeoConfig(key);
  return seo.favicon || "/favicon.ico";
}
