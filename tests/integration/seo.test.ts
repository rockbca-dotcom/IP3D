import { vi, describe, it, expect, beforeEach } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { buildMetadata } from "@/lib/seo";
import { generateMetadata as generateProductMetadata } from "@/app/(site)/produtos/[slug]/page";
import { generateMetadata as generateCmsMetadata } from "@/app/(site)/p/[slug]/page";

// Mocks do Prisma
const mockFindManyProduct = vi.fn();
const mockFindFirstProduct = vi.fn();
const mockFindManyCategory = vi.fn();
const mockFindManyPage = vi.fn();
const mockFindFirstPage = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: (...args: any[]) => mockFindManyProduct(...args),
      findFirst: (...args: any[]) => mockFindFirstProduct(...args),
    },
    category: {
      findMany: (...args: any[]) => mockFindManyCategory(...args),
    },
    page: {
      findMany: (...args: any[]) => mockFindManyPage(...args),
      findFirst: (...args: any[]) => mockFindFirstPage(...args),
    },
  },
}));

describe("SEO Técnico, Sitemap e Robots — TASK-32", () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = "https://ip3d.com.br";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
  });

  describe("Sitemap Dinâmico", () => {
    it("deve gerar o sitemap com URLs estáticas e dinâmicas (produtos, categorias, CMS ativos)", async () => {
      // Mock de produtos ativos
      mockFindManyProduct.mockResolvedValue([
        { slug: "impressora-3d-ender-3", updatedAt: new Date("2026-05-01") },
        { slug: "filamento-pla-premium", updatedAt: new Date("2026-05-10") },
      ]);

      // Mock de categorias ativas
      mockFindManyCategory.mockResolvedValue([
        { slug: "impressoras-3d", updatedAt: new Date("2026-04-15") },
        { slug: "filamentos", updatedAt: new Date("2026-04-20") },
      ]);

      // Mock de páginas CMS publicadas
      mockFindManyPage.mockResolvedValue([
        { slug: "politica-de-privacidade", updatedAt: new Date("2026-01-01") },
        { slug: "termos-de-uso", updatedAt: new Date("2026-01-02") },
      ]);

      const result = await sitemap();

      // Verifica rotas estáticas obrigatórias
      const urls = result.map((r) => r.url);
      expect(urls).toContain("https://ip3d.com.br");
      expect(urls).toContain("https://ip3d.com.br/produtos");
      expect(urls).toContain("https://ip3d.com.br/categorias");
      expect(urls).toContain("https://ip3d.com.br/sobre");
      expect(urls).toContain("https://ip3d.com.br/contato");
      expect(urls).toContain("https://ip3d.com.br/personalizados");

      // Verifica rotas dinâmicas de produtos ativos
      expect(urls).toContain("https://ip3d.com.br/produtos/impressora-3d-ender-3");
      expect(urls).toContain("https://ip3d.com.br/produtos/filamento-pla-premium");

      // Verifica rotas dinâmicas de categorias ativas
      expect(urls).toContain("https://ip3d.com.br/categorias/impressoras-3d");
      expect(urls).toContain("https://ip3d.com.br/categorias/filamentos");

      // Verifica rotas dinâmicas de páginas CMS
      expect(urls).toContain("https://ip3d.com.br/p/politica-de-privacidade");
      expect(urls).toContain("https://ip3d.com.br/p/termos-de-uso");

      // Exclusão estrita de rotas restritas e administrativas
      expect(urls).not.toContain("https://ip3d.com.br/admin");
      expect(urls).not.toContain("https://ip3d.com.br/api");
      expect(urls).not.toContain("https://ip3d.com.br/carrinho");
      expect(urls).not.toContain("https://ip3d.com.br/checkout");
      expect(urls).not.toContain("https://ip3d.com.br/login");
    });
  });

  describe("Robots rules", () => {
    it("deve permitir storefront e bloquear rotas sensíveis ou internas", () => {
      const result = robots();

      expect(result.rules).toBeDefined();
      const userAgentRule = result.rules[0];
      
      expect(userAgentRule.userAgent).toBe("*");
      expect(userAgentRule.allow).toBe("/");
      
      // Rotas restritas
      const disallowed = userAgentRule.disallow;
      expect(disallowed).toContain("/admin");
      expect(disallowed).toContain("/api");
      expect(disallowed).toContain("/carrinho");
      expect(disallowed).toContain("/checkout");
      expect(disallowed).toContain("/login");

      // Sitemap link apontando corretamente
      expect(result.sitemap).toBe("https://ip3d.com.br/sitemap.xml");
    });
  });

  describe("Metadata Builder Helper", () => {
    it("deve gerar metadados corretos com canonical, Open Graph e Twitter tags", async () => {
      const metadata = await buildMetadata("main", {
        title: "Página Customizada",
        description: "Descrição de SEO Rica",
        path: "/rota-teste",
        ogImage: "/images/og-custom.png",
      });

      // Title template
      expect(metadata.title).toEqual({
        default: "Página Customizada",
        template: "%s | IP3D",
      });

      expect(metadata.description).toBe("Descrição de SEO Rica");
      expect(metadata.keywords).toContain("impressão 3d");

      // Alternates & Canonical
      expect(metadata.alternates).toEqual({
        canonical: "https://ip3d.com.br/rota-teste",
      });

      // Open Graph
      expect(metadata.openGraph).toEqual({
        title: "Página Customizada",
        description: "Descrição de SEO Rica",
        type: "website",
        locale: "pt_BR",
        url: "https://ip3d.com.br/rota-teste",
        siteName: "IP3D",
        images: [
          {
            url: "https://ip3d.com.br/images/og-custom.png",
            width: 1200,
            height: 630,
            alt: "Página Customizada",
          },
        ],
      });

      // Twitter Cards
      expect(metadata.twitter).toEqual({
        card: "summary_large_image",
        title: "Página Customizada",
        description: "Descrição de SEO Rica",
        images: ["https://ip3d.com.br/images/og-custom.png"],
      });
    });
  });

  describe("Metadata de Produto Dinâmico (PDP)", () => {
    it("deve carregar dados reais do produto para gerar metadados da PDP", async () => {
      mockFindFirstProduct.mockResolvedValue({
        name: "Impressora Ender 3 S1",
        shortDescription: "Melhor impressora custo-benefício",
        metaTitle: "Comprar Impressora 3D Ender 3 S1",
        metaDescription: "Meta descrição customizada do produto",
        metaKeywords: "ender, creality, 3d",
        image: "/images/ender.jpg",
        ogImage: "/images/ender-og.jpg",
      });

      const params = Promise.resolve({ slug: "impressora-ender-3-s1" });
      const metadata = await generateProductMetadata({ params });

      expect(mockFindFirstProduct).toHaveBeenCalledWith({
        where: { slug: "impressora-ender-3-s1", active: true },
        select: {
          name: true,
          shortDescription: true,
          metaTitle: true,
          metaDescription: true,
          metaKeywords: true,
          image: true,
          ogImage: true,
        },
      });

      expect(metadata.title).toEqual({
        default: "Comprar Impressora 3D Ender 3 S1",
        template: "%s | IP3D",
      });

      expect(metadata.description).toBe("Meta descrição customizada do produto");
      expect(metadata.keywords).toContain("ender");
      expect(metadata.alternates?.canonical).toBe("https://ip3d.com.br/produtos/impressora-ender-3-s1");
    });
  });

  describe("Metadata de Página CMS Dinâmica", () => {
    it("deve carregar dados reais da página institucional para gerar metadados", async () => {
      mockFindFirstPage.mockResolvedValue({
        name: "Quem Somos",
        title: "Sobre a IP3D",
        metaTitle: "Sobre a IP3D - Empresa e Tecnologia",
        metaDescription: "Nossa história e equipe",
        metaKeywords: "empresa, tecnologia, equipe",
        ogImage: "/images/quem-somos-og.jpg",
      });

      const params = Promise.resolve({ slug: "quem-somos" });
      const metadata = await generateCmsMetadata({ params });

      expect(mockFindFirstPage).toHaveBeenCalledWith({
        where: { slug: "quem-somos", published: true },
        select: {
          name: true,
          title: true,
          metaTitle: true,
          metaDescription: true,
          metaKeywords: true,
          ogImage: true,
        },
      });

      expect(metadata.title).toEqual({
        default: "Sobre a IP3D - Empresa e Tecnologia",
        template: "%s | IP3D",
      });

      expect(metadata.description).toBe("Nossa história e equipe");
      expect(metadata.keywords).toContain("empresa");
      expect(metadata.alternates?.canonical).toBe("https://ip3d.com.br/p/quem-somos");
    });
  });
});
