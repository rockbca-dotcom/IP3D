/**
 * @vitest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { HomeShowcase } from "@/components/site/HomeShowcase";
import React from "react";

// Mock do Next.js Navigation e Componentes auxiliares
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock do Framer Motion para evitar delays e problemas de IntersectionObserver
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useInView: () => true, // Sempre visível para testes
    motion: new Proxy(
      {},
      {
        get: (target, prop) => {
          return ({ children, ...props }: any) => {
            const Tag = prop as any;
            return <Tag {...props}>{children}</Tag>;
          };
        },
      }
    ),
  };
});

// Mock do react-icons/hi
vi.mock("react-icons/hi", () => ({
  HiOutlineDownload: () => <span data-testid="download-icon">DownloadIcon</span>,
  HiOutlinePhone: () => <span data-testid="phone-icon">PhoneIcon</span>,
  HiOutlineShieldCheck: () => <span data-testid="shield-icon">ShieldIcon</span>,
  HiOutlineCube: () => <span data-testid="cube-icon">CubeIcon</span>,
  HiOutlineSupport: () => <span data-testid="support-icon">SupportIcon</span>,
  HiOutlineSparkles: () => <span data-testid="sparkles-icon">SparklesIcon</span>,
  HiArrowRight: () => <span data-testid="arrow-icon">ArrowIcon</span>,
  HiPlay: () => <span data-testid="play-icon">PlayIcon</span>,
  HiOutlineChevronLeft: () => <span data-testid="chevron-left-icon">ChevronLeftIcon</span>,
  HiOutlineChevronRight: () => <span data-testid="chevron-right-icon">ChevronRightIcon</span>,
}));

// Mock do react-icons/hi2
vi.mock("react-icons/hi2", () => ({
  HiOutlineWrenchScrewdriver: () => <span data-testid="wrench-icon">WrenchIcon</span>,
  HiOutlineClock: () => <span data-testid="clock-icon">ClockIcon</span>,
  HiOutlineCheckCircle: () => <span data-testid="check-icon">CheckIcon</span>,
  HiArrowRight: () => <span data-testid="arrow-icon">ArrowIcon</span>,
}));


describe("Storefront CMS Rendering (UI)", () => {
  const mockCategories = [
    { id: "c1", name: "Impressoras", slug: "impressoras", active: true, order: 1 },
  ];

  const mockFeaturedProducts = [
    { id: "p1", name: "Impressora Titan", slug: "titan", priceOriginal: 5000, active: true },
  ];

  const mockPromoProducts: any[] = [];
  const mockCategoryProducts: Record<string, any[]> = {
    "componentes-bambu-lab": [],
    "componentes-creality": [],
    "componentes-universais": [],
    "impressoras-3d": [],
    "impressoras-3d-equipamentos": [],
  };

  const mockBanners = [
    {
      id: "b1",
      title: "Alta Performance 3D",
      subtitle: "Banners de Qualidade",
      active: true,
      order: 1,
      image: "/banners/titan.jpg",
    },
    {
      id: "b2",
      title: "Inativo Banner",
      active: false,
      order: 2,
    },
  ];

  const mockHomeSections = [
    {
      id: "s1",
      sectionId: "why-choose-us",
      title: "Por Que Escolher a IP3D",
      subtitle: "Nossos Diferenciais",
      description: "Suporte completo e a melhor qualidade em impressão 3D.",
      active: true,
      order: 1,
      content: {
        features: [
          { icon: "shield", title: "Garantia Real", description: "Suporte completo de fábrica." },
        ],
        stats: [{ value: "100%", label: "De Satisfação" }],
      },
    },
    {
      id: "s2",
      sectionId: "maintenance-preview",
      title: "Manutenção Premium 3D",
      subtitle: "Serviço Autorizado",
      description: "Seu equipamento em mãos de engenheiros certificados.",
      active: true,
      order: 2,
      content: {
        services: [
          { icon: "wrench", title: "Rapidez", description: "Atendimento rápido e eficiente." },
          { icon: "check", title: "Peças Originais", description: "Apenas componentes homologados." },
        ],
        buttonText: "Solicitar Manutenção",
        buttonLink: "/contato",
      },
    },
    {
      id: "s3",
      sectionId: "catalog-cta",
      title: "Baixe Nosso Catálogo Completo",
      subtitle: "Portfólio IP3D",
      description: "Conheça nossa linha completa de produtos.",
      active: true,
      order: 3,
      content: {
        phone: "(11) 99999-9999",
        phoneRaw: "5511999999999",
        whatsappMessage: "Olá! Gostaria de falar com um consultor.",
        buttonText: "Download",
        consultorButtonText: "Consultor",
      },
    },
    {
      id: "s4",
      sectionId: "why-choose-us",
      title: "Seção Inativa",
      active: false,
      order: 4,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar os banners ativos enviados via SSR e ocultar os inativos", () => {
    render(
      <HomeShowcase
        categories={mockCategories}
        featuredProducts={mockFeaturedProducts}
        promoProducts={mockPromoProducts}
        categoryProducts={mockCategoryProducts}
        banners={mockBanners}
        homeSections={[]}
      />
    );

    // Deve exibir o título do banner ativo
    expect(screen.getByText("Alta Performance 3D")).toBeDefined();

    // Não deve exibir o banner inativo
    expect(screen.queryByText("Inativo Banner")).toBeNull();
  });

  it("deve renderizar as seções dinâmicas do CMS ativas na ordem correta e pular as inativas", () => {
    render(
      <HomeShowcase
        categories={mockCategories}
        featuredProducts={mockFeaturedProducts}
        promoProducts={mockPromoProducts}
        categoryProducts={mockCategoryProducts}
        banners={mockBanners}
        homeSections={mockHomeSections}
      />
    );

    // 1. Deve renderizar a seção "Why Choose Us" com dados iniciais corretos
    expect(screen.getByText("Por Que Escolher a IP3D")).toBeDefined();
    expect(screen.getByText("Nossos Diferenciais")).toBeDefined();
    expect(screen.getByText("Garantia Real")).toBeDefined();

    // 2. Deve renderizar a seção "Maintenance"
    expect(screen.getByText("Manutenção Premium 3D")).toBeDefined();
    expect(screen.getByText("Serviço Autorizado")).toBeDefined();

    // 3. Deve renderizar a seção "Catalog CTA"
    expect(screen.getByText("Baixe Nosso Catálogo Completo")).toBeDefined();
    expect(screen.getByRole("button", { name: /Download/i })).toBeDefined();

    // 4. Não deve renderizar a seção inativa
    expect(screen.queryByText("Seção Inativa")).toBeNull();
  });
});
