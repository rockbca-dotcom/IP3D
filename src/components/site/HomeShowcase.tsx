"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HiArrowRight, HiPlay, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/cart";


function isExternalUrl(value?: string | null) {
  if (!value) return false;
  return /^https?:\/\//i.test(value);
}

export interface CategoryCard {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count?: {
    products: number;
    productCategories: number;
  };
}

export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  image?: string | null;
  hoverImage?: string | null;
  gallery?: string[] | null;
  category?: {
    name: string | null;
  } | null;
  priceOriginal?: number | null;
  pricePromo?: number | null;
  pixPrice?: number | null;
  stockQuantity?: number | null;
}

const MAX_PRODUCTS_PER_SECTION = 8;
const defaultProductImage = "/images/products/components-placeholder.svg";

const DEFAULT_SLIDES = [
  {
    id: "hero-1",
    image: "/images/banners/banner-hero1.png",
    alt: "Hotend Bambu Lab A1 Mini em destaque",
    label: "Reposição premium",
    title: "Hotend Bambu Lab A1 Mini",
    subtitle: "PEÇA DE SUBSTITUIÇÃO",
    description: "Troca rápida e desempenho estável para manter sua A1 Mini imprimindo com precisão e consistência.",
    button1: { text: "Ver produto", link: "/produtos/hotend-bambu-lab-a1-mini" },
    button2: { text: "Solicitar no WhatsApp", link: "https://wa.me/5511999999999" },
    crosshairPos: { top: "45%", left: "68%" },
    tech: [
      { label: "COMPATIBILIDADE", value: "Bambu Lab A1 Mini" },
      { label: "FUNÇÃO", value: "Reposição / upgrade" },
      { label: "STATUS", value: "PRONTO PARA USO" }
    ]
  },
  {
    id: "hero-2",
    image: "/images/banners/banner-hero2.png",
    alt: "Capas de Silicone A1 em destaque",
    label: "Proteção premium",
    title: "Capas de Silicone A1",
    subtitle: "PROTEÇÃO TÉRMICA",
    description: "Proteção estável para o bloco aquecido, com encaixe preciso para manter sua A1/A1 Mini pronta para produção.",
    button1: { text: "Ver produto", link: "/produtos/capa-silicone-bambu-lab-a1" },
    button2: { text: "Solicitar no WhatsApp", link: "https://wa.me/5511999999999" },
    crosshairPos: { top: "46%", left: "49%" },
    tech: [
      { label: "COMPATIBILIDADE", value: "Bambu Lab A1 / A1 Mini" },
      { label: "FUNÇÃO", value: "Proteção térmica" },
      { label: "STATUS", value: "PRONTA PARA USO" }
    ]
  },
  {
    id: "hero-3",
    image: "/images/banners/banner-hero3.png",
    alt: "Bico Nozzle Aço Endurecido em destaque",
    label: "Precisão técnica",
    title: "Bico Nozzle Aço Endurecido",
    subtitle: "ALTA DURABILIDADE",
    description:
      "Mais resistência para materiais abrasivos, com encaixe preciso e estabilidade para uso contínuo na A1 Mini.",
    button1: { text: "Ver produto", link: "/produtos/nozzle-aco-bambu-lab-a1" },
    button2: { text: "Solicitar no WhatsApp", link: "https://wa.me/5511999999999" },
    crosshairPos: { top: "45%", left: "66%" },
    tech: [
      { label: "COMPATIBILIDADE", value: "Bambu Lab A1 Mini / A1" },
      { label: "MATERIAL", value: "Aço endurecido" },
      { label: "STATUS", value: "PRONTO PARA USO" }
    ]
  },
];
type HeroSlide = (typeof DEFAULT_SLIDES)[number];
type ApiBanner = {
  id: string;
  image: string;
  title: string;
  badge?: string;
  subtitle?: string;
  description?: string;
  button1Text?: string;
  button1Link?: string;
  button2Text?: string;
  button2Link?: string;
  crosshairPos?: { top: string; left: string };
  techLabels?: Array<{ label: string; value: string }>;
  active?: boolean;
};

type ApiHomeSection = {
  id: string;
  sectionId: string;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  content?: unknown;
  active: boolean;
  order: number;
};


const categorySections = [
  {
    slug: "componentes-bambu-lab",
    title: "Hotends e Bicos",
    description: "Componentes Bambu Lab",
    miniBanner: "/uploads/products/limpador-bico-bambu-lab-a1.jpg",
  },
  {
    slug: "componentes-creality",
    title: "Componentes Eletrônicos",
    description: "Componentes Creality",
    miniBanner: "/uploads/products/kit-hotend-creality-cr-10.jpg",
  },
  {
    slug: "componentes-universais",
    title: "Peças Mecânicas",
    description: "Componentes Universais",
    miniBanner: "/uploads/products/kit-aquecedor-ceramico-60w.jpg",
  },
  {
    slug: "impressoras-3d",
    title: "Superfícies de Impressão",
    description: "Superfícies de Impressão 3D",
    miniBanner: "/uploads/products/mesa-pei-texturizada-bambu-lab-h2d.jpg",
  },
  {
    slug: "impressoras-3d-equipamentos",
    title: "Impressoras 3D",
    description: "Máquinas prontas para produção com suporte IP3D.",
    miniBanner: "/images/products/capa-silicone-creality-k1-max/main.png",
  },
];

const categoryCardImageFallbacks: Record<string, string> = {
  "componentes-bambu-lab": "/images/categories/componentes-bambu-lab.svg",
  "componentes-creality": "/images/categories/componentes-creality.svg",
  "componentes-universais": "/images/categories/componentes-universais.svg",
  "impressoras-3d": "/images/categories/impressoras-3d.svg",
  "impressoras-3d-equipamentos": "/images/categories/impressoras-3d.svg",
  personalizados: "/images/categories/personalizados.svg",
};

interface PrinterHotspot {
  id: string;
  name: string;
  description: string;
  price: string;
  slug: string;
  position: { top: string; left: string };
}

const printerHotspots: PrinterHotspot[] = [
  {
    id: "hs-hotend",
    name: "Hotend Completo",
    description: "Conjunto com bloco, aquecedor e nozzle para troca rapida.",
    price: "R$ 199,90",
    slug: "kit-hotend-bambu-lab-a1",
    position: { top: "30%", left: "34%" },
  },
  {
    id: "hs-termistor",
    name: "Termistor NTC 100K",
    description: "Sensor de temperatura estavel para hotends universais.",
    price: "R$ 34,90",
    slug: "termistor-ntc-100k-3950",
    position: { top: "46%", left: "52%" },
  },
  {
    id: "hs-pei",
    name: "Mesa PEI Texturizada",
    description: "Superficie de aderencia para operacao de producao.",
    price: "R$ 299,90",
    slug: "mesa-pei-bambu-lab-h2d",
    position: { top: "64%", left: "42%" },
  },
  {
    id: "hs-nozzle",
    name: "Bico Nozzle Aco",
    description: "Nozzle endurecido 0.4 mm para materiais abrasivos.",
    price: "R$ 79,90",
    slug: "nozzle-aco-bambu-lab-a1",
    position: { top: "40%", left: "68%" },
  },
  {
    id: "hs-aquecedor",
    name: "Kit Aquecedor 60W",
    description: "Aquecimento rapido para montagem e reposicao tecnica.",
    price: "R$ 69,90",
    slug: "kit-aquecedor-ceramico-60w",
    position: { top: "58%", left: "74%" },
  },
];

// fallbackProductCatalog removido — todos os produtos fictícios/de template eliminados.
// Os carrosséis de categoria exibem apenas produtos reais vindos do banco (via prop
// categoryProducts). Categorias sem produtos no banco são ocultadas automaticamente
// pelo guard `if (products.length === 0) return null` no JSX abaixo.

export interface HomeShowcaseProps {
  categories: CategoryCard[];
  featuredProducts: ProductCard[];
  promoProducts: ProductCard[];
  categoryProducts: Record<string, ProductCard[]>;
  /** Todos os produtos activos (componentes + personalizados), sem filtro de imagem.
   *  Alimenta a seção "Todos os nossos produtos" com carrossel automático infinito. */
  allProducts?: ProductCard[];
  banners?: ApiBanner[];
  homeSections?: ApiHomeSection[];
}

function formatCurrency(value?: number | null) {
  if (!value || value <= 0) return "Sob consulta";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getInstallments(value?: number | null) {
  if (!value || value <= 0) return null;
  const times = value >= 300 ? 12 : value >= 150 ? 6 : 3;
  const perMonth = value / times;
  return `${times}x de ${formatCurrency(perMonth)}`;
}

export function HomeShowcase({
  categories,
  featuredProducts,
  promoProducts,
  categoryProducts,
  allProducts = [],
  banners,
  homeSections,
}: HomeShowcaseProps) {
  const currentSlide = 0;

  const initialSlides = useMemo(() => {
    if (banners && banners.length > 0) {
      return banners.map((b) => ({
        id: b.id,
        image: b.image || "/images/banners/banner-hero1.png",
        alt: b.title,
        label: b.badge || "DESTAQUE",
        title: b.title,
        subtitle: b.subtitle || "",
        description: b.description || "",
        button1: { text: b.button1Text || "Ver Mais", link: b.button1Link || "#" },
        button2: { text: b.button2Text || "", link: b.button2Link || "" },
        crosshairPos: b.crosshairPos || { top: "50%", left: "50%" },
        tech: b.techLabels || [{ label: "STATUS", value: "ONLINE" }],
      }));
    }
    return DEFAULT_SLIDES;
  }, [banners]);

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(initialSlides);
  const [prevBanners, setPrevBanners] = useState(banners);
  if (banners !== prevBanners) {
    setPrevBanners(banners);
    setHeroSlides(initialSlides);
  }
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const sectionCarouselRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (banners && banners.length > 0) {
      return;
    }

    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/banners");
        if (!res.ok) return;

        const data = await res.json();
        if (data.banners && data.banners.length > 0) {
          const mappedBanners = (data.banners as ApiBanner[]).map((b) => ({
            id: b.id,
            image: b.image || "/images/banners/banner-hero1.png",
            alt: b.title,
            label: b.badge || "DESTAQUE",
            title: b.title,
            subtitle: b.subtitle || "",
            description: b.description || "",
            button1: { text: b.button1Text || "Ver Mais", link: b.button1Link || "#" },
            button2: { text: b.button2Text || "", link: b.button2Link || "" },
            crosshairPos: b.crosshairPos || { top: "50%", left: "50%" },
            tech: b.techLabels || [{ label: "STATUS", value: "ONLINE" }],
          }));
          setHeroSlides(mappedBanners);
        }
      } catch {
        // Mantém os banners estáticos padrão quando a API não estiver disponível.
      }
    };
    fetchBanners();
  }, [banners, initialSlides]);


  const MARQUEE_CARD_W = 296;
  const MARQUEE_GAP = 20;
  const MARQUEE_SPEED = 55;

  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const marqueeRafRef = useRef<number>(0);
  const marqueeOffsetRef = useRef(0);
  const marqueePrevTimeRef = useRef<number | null>(null);
  const marqueePausedRef = useRef(false);

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el || allProducts.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stride = allProducts.length * (MARQUEE_CARD_W + MARQUEE_GAP);
    marqueePrevTimeRef.current = null;

    function tick(now: number) {
      if (marqueePrevTimeRef.current === null) marqueePrevTimeRef.current = now;

      if (!marqueePausedRef.current) {
        const dt = (now - marqueePrevTimeRef.current) / 1000;
        marqueeOffsetRef.current = (marqueeOffsetRef.current + MARQUEE_SPEED * dt) % stride;
        if (el) el.style.transform = `translateX(-${marqueeOffsetRef.current}px)`;
      }

      marqueePrevTimeRef.current = now;
      marqueeRafRef.current = requestAnimationFrame(tick);
    }

    marqueeRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(marqueeRafRef.current);
  }, [allProducts.length]);


  const categoryProductsMap = useMemo(() => {
    const map: Record<string, ProductCard[]> = {};
    for (const section of categorySections) {
      const source = categoryProducts[section.slug] ?? [];
      map[section.slug] = source.slice(0, MAX_PRODUCTS_PER_SECTION);
    }
    return map;
  }, [categoryProducts]);

  const featuredProductsToRender = useMemo(() => {
    const primarySlug = "termistor-2x-100k-ohm-ntc-3950-sensor-de-temperatura-3d";
    const secondarySlug = "fep-film-lcd-halot-mage-pro-original-creality-5-un";
    const tertiarySlug = "2x-capa-de-silicone-para-hotend-bambu-lab-a1-e-a1-mini";
    const quaternarySlug = "1x-escova-de-silicone-limpeza-de-bico-bambu-lab-a1";

    const allCandidateProducts = [
      ...featuredProducts,
      ...allProducts,
      ...Object.values(categoryProducts).flat(),
    ];

    const primaryProduct = allCandidateProducts.find((product) => product.slug === primarySlug);
    const secondaryProduct = allCandidateProducts.find((product) => product.slug === secondarySlug);
    const tertiaryProduct = allCandidateProducts.find((product) => product.slug === tertiarySlug);
    const quaternaryProduct = allCandidateProducts.find(
      (product) => product.slug === quaternarySlug,
    );

    const remainingProducts = featuredProducts.filter(
      (product) =>
        product.slug !== primarySlug &&
        product.slug !== secondarySlug &&
        product.slug !== tertiarySlug &&
        product.slug !== quaternarySlug,
    );

    const orderedProducts = [
      ...(primaryProduct ? [primaryProduct] : []),
      ...(secondaryProduct ? [secondaryProduct] : []),
      ...(tertiaryProduct ? [tertiaryProduct] : []),
      ...(quaternaryProduct ? [quaternaryProduct] : []),
      ...remainingProducts,
    ];

    return orderedProducts.slice(0, 4);
  }, [featuredProducts, allProducts, categoryProducts]);

  const favoriteProductsToRender = useMemo(() => {
    const primarySlug = "fixador-de-haste-para-astro-a50-gen4-headband-fix-2-pecas";
    const secondarySlug = "termistor-e-aquecedor-para-creality-k1-k1c-k1-max-24v-60w";
    const tertiarySlug = "base-mesa-magnetica-pei-para-bambu-lab-h2d-h2s-355x346mm";
    const quaternarySlug = "aquecedor-ceramico-e-termistor-para-bambu-lab-a1-e-a1-mini";

    const allCandidateProducts = [
      ...(categoryProducts["componentes-bambu-lab"] ?? []),
      ...allProducts,
      ...featuredProducts,
      ...Object.values(categoryProducts).flat(),
    ];

    const primaryProduct = allCandidateProducts.find((product) => product.slug === primarySlug);
    const secondaryProduct = allCandidateProducts.find((product) => product.slug === secondarySlug);
    const tertiaryProduct = allCandidateProducts.find((product) => product.slug === tertiarySlug);
    const quaternaryProduct = allCandidateProducts.find((product) => product.slug === quaternarySlug);
    const baseProducts = categoryProductsMap["componentes-bambu-lab"] ?? [];

    const remainingProducts = baseProducts.filter(
      (product) =>
        product.slug !== primarySlug &&
        product.slug !== secondarySlug &&
        product.slug !== tertiarySlug &&
        product.slug !== quaternarySlug,
    );

    return [
      ...(primaryProduct ? [primaryProduct] : []),
      ...(secondaryProduct ? [secondaryProduct] : []),
      ...(tertiaryProduct ? [tertiaryProduct] : []),
      ...(quaternaryProduct ? [quaternaryProduct] : []),
      ...remainingProducts,
    ].slice(0, 4);
  }, [categoryProducts, categoryProductsMap, allProducts, featuredProducts]);

  const defaultCategories: CategoryCard[] = categorySections.map((section) => ({
    id: section.slug,
    name: section.title,
    slug: section.slug,
    description: section.description,
    image: categoryCardImageFallbacks[section.slug],
    _count: { products: 0, productCategories: 0 },
  }));

  const displayCategories = categorySections.map((section) => {
    const existing = categories.find((category) => category.slug === section.slug);
    return (
      existing ?? {
        id: section.slug,
        name: section.title,
        slug: section.slug,
        description: section.description,
        image: categoryCardImageFallbacks[section.slug],
        _count: { products: 0, productCategories: 0 },
      }
    );
  });

  const categoriesToRender = displayCategories.length > 0 ? displayCategories : defaultCategories;
  const compactSectionSlugs = new Set(["componentes-bambu-lab", "componentes-creality", "componentes-universais", "impressoras-3d", "impressoras-3d-equipamentos", "personalizados"]);

  const promoBannerSection = (
    <section className="w-full">
      <div className="relative overflow-hidden rounded-[2rem] border border-[#d8e5f8] bg-gradient-to-r from-[#0B64D3] via-[#0f74ee] to-[#10213f] text-white shadow-[0_24px_70px_rgba(11,100,211,0.22)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_30%)]" />
        <div className="relative grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5 px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
                <span className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/90">
              Acessório para A1
                </span>
                <div className="space-y-3">
                  <h2 className="max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
                Limpador de bocal para Bambu Lab A1
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                Instalado na cama de aquecimento, o limpador de bocal ajuda a limpar o nozzle
                automaticamente antes da impressão e deixa a série A1 pronta para produzir com mais consistência.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="h-11 rounded-full bg-white px-5 text-sm font-semibold text-[#0B64D3] shadow-none hover:bg-white/95"
                  >
                <Link href="/produtos/nozzle-wiper-bambu-lab-a1">Ver produto</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-full border-white/25 bg-white/8 px-5 text-sm font-semibold text-white hover:bg-white/12 hover:text-white"
                  >
                <Link href="/contato">Solicitar no WhatsApp</Link>
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[#dce7f8] bg-white px-4 py-3 backdrop-blur-sm text-[#10213f]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0B64D3]">Compatibilidade</p>
                <p className="mt-1 text-sm font-medium">Bambu Lab A1</p>
                  </div>
                  <div className="rounded-2xl border border-[#dce7f8] bg-white px-4 py-3 backdrop-blur-sm text-[#10213f]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0B64D3]">Instalação</p>
                <p className="mt-1 text-sm font-medium">Na cama de aquecimento</p>
                  </div>
                  <div className="rounded-2xl border border-[#dce7f8] bg-white px-4 py-3 backdrop-blur-sm text-[#10213f]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0B64D3]">Função</p>
                <p className="mt-1 text-sm font-medium">Limpeza automática do bocal</p>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[260px] overflow-hidden border-t border-white/10 lg:min-h-full lg:border-l lg:border-t-0">
                <Image
                  src="/images/banners/banner4.png"
                  alt="Limpador de bocal para Bambu Lab A1 em destaque"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10213f]/78 via-[#10213f]/18 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#dce7f8] bg-white px-4 py-3 text-[#10213f] shadow-lg">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0B64D3]">
                  Série A1
                    </p>
                <p className="mt-1 text-sm font-medium">Limpeza integrada antes de imprimir</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white px-4 py-3 text-[#10213f] shadow-lg">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0B64D3]">
                  Instalação
                    </p>
                <p className="mt-1 text-sm font-semibold">Na cama de aquecimento</p>
                  </div>
                </div>
              </div>
        </div>
      </div>
    </section>
  );

  const handleAddToCart = (product: ProductCard) => {
    const basePrice = product.pricePromo ?? product.priceOriginal ?? product.pixPrice ?? null;
    try {
      addToCart({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        price: basePrice,
        quantity: 1,
        maxQuantity: product.stockQuantity ?? null,
      });

      setCartMessage(`${product.name} adicionado ao carrinho.`);
      setTimeout(() => setCartMessage(null), 3000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao adicionar ao carrinho.";
      setCartMessage(msg);
      setTimeout(() => setCartMessage(null), 3000);
    }
  };

  const scrollSection = (slug: string, direction: "left" | "right") => {
    const target = sectionCarouselRefs.current[slug];
    if (!target) return;
    target.scrollBy({ left: direction === "left" ? -392 : 392, behavior: "smooth" });
  };

    return (
    <div className="space-y-10 pb-16">
      <section className="bg-[#f4f7fd]">
        <div className="relative w-full overflow-hidden bg-black shadow-[0_24px_60px_-42px_rgba(11,100,211,0.55)]">
          <div className="relative h-[288px] sm:h-[324px] lg:h-[360px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <Image src={heroSlides[currentSlide].image} alt={heroSlides[currentSlide].alt} fill priority className="object-cover opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-grid-white-tech" />

                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0, scale: 2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ top: heroSlides[currentSlide].crosshairPos.top, left: heroSlides[currentSlide].crosshairPos.left }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-cyan-500/10 sm:h-40 sm:w-40 lg:h-56 lg:w-56">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border border-cyan-500/30"
                      />
                      <div className="h-4 w-4 animate-pulse rounded-full border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] sm:h-5 sm:w-5" />
                      <div className="absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] sm:h-12 sm:w-12" />
                      <div className="absolute right-0 top-0 h-10 w-10 border-r-2 border-t-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] sm:h-12 sm:w-12" />
                      <div className="absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] sm:h-12 sm:w-12" />
                      <div className="absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] sm:h-12 sm:w-12" />
                      <div className="absolute -left-16 top-1/2 h-px w-12 -translate-y-1/2 bg-gradient-to-l from-cyan-500 to-transparent sm:-left-24 sm:w-16 lg:w-20" />
                      <div className="absolute -right-16 top-1/2 h-px w-12 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-transparent sm:-right-24 sm:w-16 lg:w-20" />
                      <div className="absolute -top-6 left-0 border-l-2 border-cyan-500 bg-cyan-950/60 px-2.5 py-1 font-mono text-[8px] font-bold tracking-[0.18em] text-cyan-400 sm:-top-7 sm:px-3 sm:text-[9px]">
                        TARGET_ACQUISITION_V4
                      </div>
                    </div>
                  </motion.div>

                  <div className="absolute left-1/2 top-6 -translate-x-1/2 opacity-30 sm:top-8">
                    <div className="border-y border-white/10 px-3 py-1 text-[8px] font-mono uppercase tracking-[0.35em] text-white/50 sm:px-4 sm:text-[9px] lg:text-[10px]">
                      IP3D_DIGITAL_MANUFACTURING // HUD_ENABLED
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>


            <div className="absolute left-0 top-0 z-30 h-px w-full bg-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-scan pointer-events-none" />

            <div className="relative z-30 mx-auto flex h-full w-full max-w-screen-2xl items-center px-5 sm:px-6 lg:px-12">
              <div className="max-w-xl border-l-2 border-cyan-500/30 bg-black/10 p-5 backdrop-blur-[2px] sm:p-6 lg:max-w-2xl lg:p-8">
                <AnimatePresence mode="popLayout">
                  <motion.div key={`content-${currentSlide}`} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.4 }}>
                    <div className="mb-3 flex items-center gap-3 sm:mb-4">
                      <span className="bg-cyan-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">LIVE</span>
                      <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest italic">{heroSlides[currentSlide].subtitle}</span>
                    </div>

                    <h1 className="mb-3 text-3xl font-bold leading-[1] tracking-tight text-white sm:mb-4 md:text-4xl lg:text-5xl">{heroSlides[currentSlide].title}</h1>

                    <p className="mb-5 max-w-lg text-sm leading-relaxed text-gray-300 sm:text-base lg:text-lg">{heroSlides[currentSlide].description}</p>

                    <div className="flex flex-wrap gap-4">
                      <Link href={heroSlides[currentSlide].button1.link}>
                        <Button size="lg" className="h-10 bg-[#0B64D3] px-5 text-sm font-semibold text-white transition-all hover:bg-[#0A4A9D] hover:shadow-[0_0_20px_rgba(11,100,211,0.4)] sm:h-11 sm:px-6 sm:text-base">
                          {heroSlides[currentSlide].button1.text}
                          <HiArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={heroSlides[currentSlide].button2.link}>
                        <Button size="lg" variant="outline" className="h-10 border-white/30 bg-white/5 px-5 text-sm text-white backdrop-blur-sm hover:bg-white/10 sm:h-11 sm:px-6 sm:text-base">
                          <HiPlay className="mr-2 h-5 w-5" />
                          {heroSlides[currentSlide].button2.text}
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="absolute bottom-8 right-6 hidden flex-col gap-3 lg:flex">
                {heroSlides[currentSlide].tech.map((item: { label: string; value: string }, idx: number) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + idx * 0.1 }} className="min-w-[200px] border-l-2 border-cyan-500 bg-black/40 p-3 shadow-2xl backdrop-blur-md">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">{item.label}</p>
                    <p className="text-sm font-mono text-white/90">{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="w-full">
        <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-18">
          <div className="grid gap-3 rounded-xl border border-[#dde7f8] bg-white p-4 text-xs font-semibold uppercase tracking-wide text-[#1f3b68] sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-[#dce7f8] bg-white px-3 py-2 text-center">Entrega para todo o Brasil</div>
            <div className="rounded-lg border border-[#dce7f8] bg-white px-3 py-2 text-center">Pagamento via Pix e cartao</div>
            <div className="rounded-lg border border-[#dce7f8] bg-white px-3 py-2 text-center">Suporte tecnico especializado</div>
            <div className="rounded-lg border border-[#dce7f8] bg-white px-3 py-2 text-center">Produtos com garantia</div>
          </div>
        </div>
      </section>

        <section>
          <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {categorySections.map((section) => (
                <Link
                  key={section.slug}
                  href={`/categorias/${section.slug}`}
                  className="group overflow-hidden rounded-2xl bg-white shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-[180px] sm:h-[210px] lg:h-[230px]">
                    <Image src={section.miniBanner} alt={section.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  </div>
                  <div className="space-y-2 p-5 sm:p-6">
                    <h3 className="line-clamp-2 text-base font-semibold text-[#0f274c] sm:text-lg">{section.title}</h3>
                    <p className="line-clamp-2 text-sm leading-6 text-[#48628b]">{section.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

      {featuredProducts.length > 0 && (
        <section className="bg-white py-10">
          <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-18">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0B64D3]">
                  Mais vendidos
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#10213f]">
                  Produtos mais procurados
                </h2>
              </div>
              <Link
                href="/produtos"
                className="text-sm font-semibold text-[#0B64D3] hover:text-[#0A4A9D]"
              >
                Ver todos
              </Link>
            </div>

            <div
              ref={(node) => {
                sectionCarouselRefs.current["mais-vendidos"] = node;
              }}
              className="mx-auto grid max-w-[1720px] grid-cols-1 gap-6 pb-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8"
            >
              {featuredProductsToRender.map((product) => {
                const mainPrice = product.pricePromo ?? product.priceOriginal ?? product.pixPrice ?? null;
                const oldPrice =
                  product.pricePromo && product.priceOriginal && product.pricePromo < product.priceOriginal
                    ? product.priceOriginal
                    : null;
                const pixPrice = mainPrice ? Number((mainPrice * 0.95).toFixed(2)) : product.pixPrice ?? null;
                const installments = getInstallments(mainPrice);
                const hoverImage = product.hoverImage || product.gallery?.find((image) => image && image !== product.image) || null;
                const productImage = product.image || defaultProductImage;

                return (
                <div
                    key={product.id}
                    className="group relative flex min-h-[500px] flex-col items-center overflow-hidden rounded-2xl bg-white text-center shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <button
                      type="button"
                      aria-label={`Favoritar ${product.name}`}
                      className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9e6fb] bg-white/95 text-[#0B64D3] shadow-sm transition-colors hover:bg-[#edf4ff]"
                    >
                      <Heart className="h-4 w-4" />
                    </button>

                      <Link href={`/produtos/${product.slug}`} className="relative block h-[250px] w-full bg-white">
                      <Image
                        src={productImage}
                        alt={product.name}
                        fill
                        className={`object-contain p-6 transition-all duration-500 ${hoverImage ? "opacity-100 group-hover:opacity-0" : "group-hover:scale-105"}`}
                        sizes="(max-width: 768px) 80vw, 320px"
                        loading="lazy"
                      />
                      {hoverImage && (
                        <Image
                          src={hoverImage}
                          alt={`${product.name} - imagem secundária`}
                          fill
                          className="object-contain p-6 opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                          sizes="(max-width: 768px) 80vw, 320px"
                          loading="lazy"
                        />
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-[#0B64D3] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Mais vendido
                      </span>
                    </Link>

                      <div className="flex flex-1 flex-col items-center justify-start p-5 text-center">
                      <Link
                        href={`/produtos/${product.slug}`}
                        className="line-clamp-2 mx-auto min-h-[3.2rem] max-w-[85%] text-[15px] font-semibold text-[#0f274c]"
                      >
                        {product.name}
                      </Link>

                      <div className="mt-4 rounded-2xl border border-[#cdeed9] bg-[#f0fff5] px-4 py-4 shadow-sm">
                        {oldPrice && mainPrice ? (
                          <div className="text-xs font-medium text-[#6f85a8] line-through">
                            De {formatCurrency(oldPrice)}
                          </div>
                        ) : (
                          <div className="text-xs font-medium text-[#6f85a8]">
                            Melhor preço disponível
                          </div>
                        )}

                        {mainPrice ? (
                          <>
                            <div className="mt-1 flex items-center justify-center gap-2">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366] text-[9px] font-black uppercase leading-none text-white shadow-sm">
                                PIX
                              </span>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#25D366]">
                                5% de desconto
                              </p>
                            </div>
                            <div className="mt-1 flex items-end justify-center gap-2">
                              <span className="text-[2rem] font-extrabold leading-none text-[#128C7E]">
                                {formatCurrency(pixPrice ?? mainPrice)}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-[#128C7E]">
                              ou <span className="font-semibold text-[#10213f]">{formatCurrency(mainPrice)}</span> no cartão
                            </div>
                            {installments && (
                              <div className="mt-1 text-sm text-[#47628a]">
                                em até <span className="font-semibold text-[#10213f]">{installments}</span> sem juros
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="mt-2 text-lg font-semibold text-[#10213f]">
                            Preço sob consulta
                          </div>
                        )}
                      </div>

                        <div className="flex justify-center pt-4">
                          <Button asChild className="h-11 w-full max-w-[220px] translate-y-2 rounded-lg bg-[#0B64D3] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#0A4A9D]">
                          <Link href={`/produtos/${product.slug}`}>Comprar</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {false && (
        <section className="bg-white py-10">
          <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-18">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0B64D3]">
                  Catálogo completo
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#10213f]">
                  Todos os nossos produtos
                </h2>
              </div>
              <Link
                href="/produtos"
                className="text-sm font-semibold text-[#0B64D3] hover:text-[#0A4A9D]"
              >
                Ver catálogo completo
              </Link>
            </div>
          </div>

          <div className="overflow-hidden">
            <div
              ref={marqueeRef}
              className="flex gap-5"
              style={{ willChange: "transform" }}
              onMouseEnter={() => {
                marqueePausedRef.current = true;
              }}
              onMouseLeave={() => {
                marqueePausedRef.current = false;
                marqueePrevTimeRef.current = null;
              }}
              aria-label="Carrossel automático de todos os produtos IP3D"
            >
              {[...allProducts, ...allProducts].map((product, index) => {
                const mainPrice =
                  product.pricePromo ?? product.priceOriginal ?? product.pixPrice ?? null;
                const oldPrice =
                  product.pricePromo &&
                  product.priceOriginal &&
                  product.pricePromo < product.priceOriginal
                    ? product.priceOriginal
                    : null;
                const pixPrice =
                  product.pixPrice ??
                  (mainPrice ? Number((mainPrice * 0.95).toFixed(2)) : null);
                const installments = getInstallments(mainPrice);
                const canAddToCart = (product.stockQuantity ?? 0) > 0;
                const hoverImage = product.hoverImage || product.gallery?.find((image) => image && image !== product.image) || null;
                const productImage = product.image || defaultProductImage;

                return (
                  <div
                    key={`marquee-${product.id}-${index}`}
                    className="group relative flex h-[460px] w-[296px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#d5e3fa] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                    aria-hidden={index >= allProducts.length}
                  >
                    <button
                      type="button"
                      aria-label={`Favoritar ${product.name}`}
                      className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9e6fb] bg-white/95 text-[#0B64D3] shadow-sm transition-colors hover:bg-[#edf4ff]"
                      tabIndex={index >= allProducts.length ? -1 : undefined}
                    >
                      <Heart className="h-4 w-4" />
                    </button>

                      <Link
                      href={`/produtos/${product.slug}`}
                      className="relative block h-[210px] w-full bg-white"
                      tabIndex={index >= allProducts.length ? -1 : undefined}
                    >
                      <Image
                        src={productImage}
                        alt={product.name}
                        fill
                        className={`object-contain p-5 transition-all duration-500 ${hoverImage ? "opacity-100 group-hover:opacity-0" : "group-hover:scale-105"}`}
                        sizes="296px"
                        loading="lazy"
                      />
                      {hoverImage && (
                        <Image
                          src={hoverImage}
                          alt={`${product.name} - imagem secundária`}
                          fill
                          className="object-contain p-5 opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                          sizes="296px"
                          loading="lazy"
                        />
                      )}
                    </Link>

                    <div className="flex flex-col p-4">
                      <Link
                        href={`/produtos/${product.slug}`}
                        className="line-clamp-2 min-h-[3.2rem] text-[15px] font-semibold text-[#0f274c]"
                        tabIndex={index >= allProducts.length ? -1 : undefined}
                      >
                        {product.name}
                      </Link>

                      <div className="mt-4 rounded-2xl border border-[#cdeed9] bg-[#f0fff5] px-3 py-3 shadow-sm">
                        {oldPrice && mainPrice ? (
                          <div className="text-xs font-medium text-[#6f85a8] line-through">
                            De {formatCurrency(oldPrice)}
                          </div>
                        ) : (
                          <div className="text-xs font-medium text-[#6f85a8]">
                            Melhor preço disponível
                          </div>
                        )}

                        {mainPrice ? (
                          <>
                            <div className="mt-1 flex items-center justify-center gap-2">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366] text-[9px] font-black uppercase leading-none text-white shadow-sm">
                                PIX
                              </span>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#25D366]">
                                5% de desconto
                              </p>
                            </div>
                            <div className="mt-1 flex items-end justify-center gap-2">
                              <span className="text-[1.5rem] font-extrabold leading-none text-[#128C7E]">
                                {formatCurrency(pixPrice ?? mainPrice)}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-[#128C7E]">
                              ou <span className="font-semibold text-[#10213f]">{formatCurrency(mainPrice)}</span> no cartão
                            </div>
                            {installments && (
                              <div className="mt-1 text-sm text-[#47628a]">
                                em até <span className="font-semibold text-[#10213f]">{installments}</span> sem juros
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="mt-2 text-lg font-semibold text-[#10213f]">
                            Preço sob consulta
                          </div>
                        )}
                      </div>

                      <div className="pt-3">
                        <Button
                          asChild
                          className="h-10 w-full translate-y-2 rounded-lg bg-[#0B64D3] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#0A4A9D]"
                        >
                          <Link
                            href={`/produtos/${product.slug}`}
                            tabIndex={index >= allProducts.length ? -1 : undefined}
                          >
                            {canAddToCart ? "Comprar" : "Ver produto"}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

        <section className="w-full bg-white py-10">
        <div className="mx-auto w-full max-w-[1720px] space-y-10 px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
          {cartMessage && (
            <div className="sticky top-4 z-20 mx-auto w-fit rounded-full bg-[#10213f] px-4 py-2 text-sm font-medium text-white shadow-lg">
              {cartMessage}
            </div>
          )}

            {categorySections.map((section) => {
              const products = categoryProductsMap[section.slug] ?? [];
              const isCompactSection = compactSectionSlugs.has(section.slug);
              const isBambuLabSection = section.slug === "componentes-bambu-lab";
              const displayProducts = isCompactSection
                ? (() => {
                    const prioritized = isBambuLabSection
                      ? [...favoriteProductsToRender]
                      : products.slice(0, 4);

                    if (prioritized.length >= 4) return prioritized;

                    const seenIds = new Set(prioritized.map((product) => product.id));
                    for (const fallbackProduct of allProducts) {
                      if (seenIds.has(fallbackProduct.id)) continue;
                      prioritized.push(fallbackProduct);
                      seenIds.add(fallbackProduct.id);
                      if (prioritized.length >= 4) break;
                    }

                    return prioritized;
                  })()
                : products;
            // Guard: oculta a seção enquanto não houver produtos reais no banco
            // para esta categoria. Impede carrossel vazio ou preenchimento com
            // produtos de categorias incorretas.
            if (products.length === 0) return null;

              return (
                <div key={section.slug} className="space-y-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0B64D3]">{section.title}</p>
                      <h3 className="mt-1 text-2xl font-semibold text-[#10213f]">{section.description}</h3>
                    </div>
                    {!isCompactSection && (
                      <div className="flex items-center gap-2">
                      <button
                        onClick={() => scrollSection(section.slug, "left")}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c7d8f4] bg-white text-[#0B64D3] hover:border-[#0B64D3]"
                        aria-label={`Voltar em ${section.title}`}
                      >
                        <HiOutlineChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => scrollSection(section.slug, "right")}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c7d8f4] bg-white text-[#0B64D3] hover:border-[#0B64D3]"
                        aria-label={`Avancar em ${section.title}`}
                      >
                        <HiOutlineChevronRight className="h-5 w-5" />
                      </button>
                      </div>
                    )}
                  </div>
                  <div
                    ref={(node) => {
                      sectionCarouselRefs.current[section.slug] = node;
                    }}
                    className={
                      isCompactSection
                        ? "mx-auto grid max-w-[1720px] grid-cols-1 gap-5 pb-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6"
                        : "flex gap-5 overflow-x-auto pb-3"
                    }
                    style={isCompactSection ? undefined : { scrollbarWidth: "none" }}
                      >
                      {displayProducts.map((product) => {
                    const mainPrice = product.pricePromo ?? product.priceOriginal ?? product.pixPrice ?? null;
                    const oldPrice = product.pricePromo && product.priceOriginal && product.pricePromo < product.priceOriginal ? product.priceOriginal : null;
                    const pixPrice = product.pixPrice ?? (mainPrice ? Number((mainPrice * 0.95).toFixed(2)) : null);
                    const installments = getInstallments(mainPrice);
                    const hoverImage = product.hoverImage || product.gallery?.find((image) => image && image !== product.image) || null;
                    const productImage = product.image || defaultProductImage;

                    return (
                        <div
                          key={product.id}
                          className={
                            isCompactSection
                              ? "group relative flex min-h-[460px] flex-col items-center overflow-hidden rounded-xl border border-[#d5e3fa] bg-white text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                              : "group relative flex h-[460px] w-[296px] shrink-0 flex-col items-center overflow-hidden rounded-xl border border-[#d5e3fa] bg-white text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                          }
                      >
                        <button
                          type="button"
                          aria-label={`Favoritar ${product.name}`}
                          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9e6fb] bg-white/95 text-[#0B64D3] shadow-sm transition-colors hover:bg-[#edf4ff]"
                        >
                          <Heart className="h-4 w-4" />
                        </button>

                        <Link href={`/produtos/${product.slug}`} className="relative block h-[210px] w-full bg-white">
                          <Image
                            src={productImage}
                            alt={product.name}
                            fill
                            className={`object-contain p-5 transition-all duration-500 ${hoverImage ? "opacity-100 group-hover:opacity-0" : "group-hover:scale-105"}`}
                            sizes="(max-width: 768px) 80vw, 296px"
                            loading="lazy"
                          />
                          {hoverImage && (
                            <Image
                              src={hoverImage}
                              alt={`${product.name} - imagem secundária`}
                              fill
                              className="object-contain p-5 opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                              sizes="(max-width: 768px) 80vw, 296px"
                              loading="lazy"
                            />
                          )}
                        </Link>

                        <div className="flex flex-col items-center justify-start p-4 text-center">
                          <Link href={`/produtos/${product.slug}`} className="line-clamp-2 mx-auto min-h-[3.2rem] max-w-[85%] text-[15px] font-semibold text-[#0f274c]">
                            {product.name}
                          </Link>

                          <div className="mt-4 w-full rounded-2xl border border-[#cdeed9] bg-[#f0fff5] px-4 py-4 shadow-sm">
                            {oldPrice && mainPrice ? (
                              <div className="text-xs font-medium text-[#6f85a8] line-through">
                                De {formatCurrency(oldPrice)}
                              </div>
                            ) : (
                              <div className="text-xs font-medium text-[#6f85a8]">
                                Melhor preço disponível
                              </div>
                            )}

                            {mainPrice ? (
                              <>
                                <div className="mt-1 flex items-center justify-center gap-2">
                                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366] text-[9px] font-black uppercase leading-none text-white shadow-sm">
                                    PIX
                                  </span>
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#25D366]">
                                    5% de desconto
                                  </p>
                                </div>
                                <div className="mt-1 flex items-end justify-center gap-2">
                                  <span className="text-[1.75rem] font-extrabold leading-none text-[#128C7E]">
                                    {formatCurrency(pixPrice ?? mainPrice)}
                                  </span>
                                </div>
                                <div className="mt-2 text-sm text-[#128C7E]">
                                  ou <span className="font-semibold text-[#10213f]">{formatCurrency(mainPrice)}</span> no cartão
                                </div>
                                {installments && (
                                  <div className="mt-1 text-sm text-[#47628a]">
                                    em até <span className="font-semibold text-[#10213f]">{installments}</span> sem juros
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="mt-2 text-lg font-semibold text-[#10213f]">
                                Preço sob consulta
                              </div>
                            )}
                          </div>

                            <div className="flex justify-center pt-3">
                              <Button asChild className="h-10 w-full max-w-[220px] translate-y-2 rounded-lg bg-[#0B64D3] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#0A4A9D]">
                              <Link href={`/produtos/${product.slug}`}>Comprar</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                      })}
                    </div>
                  {section.slug === "componentes-bambu-lab" && (
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-[30%_1fr] gap-6">
                      {/* Banner 30% */}
                      <div className="relative overflow-hidden rounded-2xl border border-[#d8e5f8] bg-gradient-to-br from-[#0B64D3] to-[#10213f] text-white shadow-lg">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_40%)]" />
                        <div className="relative p-6 flex flex-col h-full">
                          <span className="inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
                            Acessório para A1
                          </span>
                          <h3 className="mt-4 text-xl font-semibold leading-tight">
                            Limpador de bocal para Bambu Lab A1
                          </h3>
                          <p className="mt-2 text-sm leading-5 text-white/80 line-clamp-3">
                            Instalado na cama de aquecimento, o limpador de bocal ajuda a limpar o nozzle automaticamente antes da impressão.
                          </p>
                          <div className="mt-auto pt-4 flex flex-wrap gap-2">
                            <Button
                              asChild
                              size="sm"
                              className="rounded-full bg-white px-4 text-xs font-semibold text-[#0B64D3] hover:bg-white/90"
                            >
                              <Link href="/produtos/nozzle-wiper-bambu-lab-a1">Ver produto</Link>
                            </Button>
                          </div>
                          <div className="relative mt-4 h-32 rounded-xl overflow-hidden">
                            <Image
                              src="/images/banners/banner4.png"
                              alt="Limpador de bocal"
                              fill
                              className="object-cover"
                              sizes="30vw"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 3 Cards de Produtos 70% */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {favoriteProductsToRender.slice(0, 3).map((product) => {
                          const mainPrice = product.pricePromo ?? product.priceOriginal ?? product.pixPrice ?? null;
                          const oldPrice = product.pricePromo && product.priceOriginal && product.pricePromo < product.priceOriginal ? product.priceOriginal : null;
                          const pixPrice = product.pixPrice ?? (mainPrice ? Number((mainPrice * 0.95).toFixed(2)) : null);
                          const installments = getInstallments(mainPrice);
                          const hoverImage = product.hoverImage || product.gallery?.find((image) => image && image !== product.image) || null;
                          const productImage = product.image || defaultProductImage;

                          return (
                            <div
                              key={product.id}
                              className="group relative flex flex-col overflow-hidden rounded-xl border border-[#d5e3fa] bg-white text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                            >
                              <button
                                type="button"
                                aria-label={`Favoritar ${product.name}`}
                                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#d9e6fb] bg-white/95 text-[#0B64D3] shadow-sm transition-colors hover:bg-[#edf4ff]"
                              >
                                <Heart className="h-3 w-3" />
                              </button>

                              <Link href={`/produtos/${product.slug}`} className="relative block h-[140px] w-full bg-white">
                                <Image
                                  src={productImage}
                                  alt={product.name}
                                  fill
                                  className={`object-contain p-3 transition-all duration-500 ${hoverImage ? "opacity-100 group-hover:opacity-0" : "group-hover:scale-105"}`}
                                  sizes="(max-width: 768px) 80vw, 250px"
                                  loading="lazy"
                                />
                                {hoverImage && (
                                  <Image
                                    src={hoverImage}
                                    alt={`${product.name} - imagem secundária`}
                                    fill
                                    className="object-contain p-3 opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                                    sizes="(max-width: 768px) 80vw, 250px"
                                    loading="lazy"
                                  />
                                )}
                              </Link>

                              <div className="flex flex-col p-3 text-center">
                                <Link href={`/produtos/${product.slug}`} className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold text-[#0f274c]">
                                  {product.name}
                                </Link>

                                <div className="mt-2 rounded-xl border border-[#cdeed9] bg-[#f0fff5] px-2 py-2 shadow-sm">
                                  {oldPrice && mainPrice ? (
                                    <div className="text-[10px] font-medium text-[#6f85a8] line-through">
                                      De {formatCurrency(oldPrice)}
                                    </div>
                                  ) : (
                                    <div className="text-[10px] font-medium text-[#6f85a8]">
                                      Melhor preço
                                    </div>
                                  )}

                                  {mainPrice ? (
                                    <>
                                      <div className="flex items-center justify-center gap-1">
                                        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#25D366] text-[7px] font-black uppercase text-white">
                                          PIX
                                        </span>
                                        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#25D366]">
                                          5% OFF
                                        </p>
                                      </div>
                                      <p className="text-[1.1rem] font-extrabold leading-none text-[#128C7E]">
                                        {formatCurrency(pixPrice ?? mainPrice)}
                                      </p>
                                      <p className="mt-1 text-[10px] text-[#128C7E]">
                                        ou <span className="font-semibold text-[#10213f]">{formatCurrency(mainPrice)}</span> no cartão
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-sm font-semibold text-[#10213f]">
                                      Sob consulta
                                    </p>
                                  )}
                                </div>

                                <Button asChild size="sm" className="mt-2 h-8 w-full rounded-lg bg-[#0B64D3] text-white opacity-100 hover:bg-[#0A4A9D]">
                                  <Link href={`/produtos/${product.slug}`}>Comprar</Link>
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </section>

      <section className="w-full bg-white py-10">

        <div className="mx-auto w-full max-w-[1720px] px-4 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
          <div className="mb-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0B64D3]">Mapa de componentes</p>
            <h3 className="mt-2 text-2xl font-semibold text-[#10213f]">Passe o mouse na impressora e veja cada peca</h3>
            <p className="mx-auto mt-2 max-w-3xl text-sm text-[#4a638d]">
              Cada ponto mostra item, descricao e preco. No celular, toque no ponto para abrir os detalhes.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div
              className="relative overflow-hidden rounded-xl border border-[#d4e3fa] bg-white shadow-sm lg:min-h-[560px]"
              onMouseLeave={() => setActiveHotspotId(null)}
            >
              <div className="relative h-[420px] w-full sm:h-[500px] lg:h-full lg:min-h-[560px]">
                <Image
                  src="/images/impressora3d.png"
                  alt="Mapa interativo da impressora 3D"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-[#0b64d3]/10 via-transparent to-[#ff6b35]/10" />

                {printerHotspots.map((hotspot) => {
                  const active = activeHotspotId === hotspot.id;
                  return (
                    <div
                      key={hotspot.id}
                      className="absolute"
                      style={{ top: hotspot.position.top, left: hotspot.position.left }}
                    >
                      <button
                        type="button"
                        onMouseEnter={() => setActiveHotspotId(hotspot.id)}
                        onFocus={() => setActiveHotspotId(hotspot.id)}
                        onBlur={() => setActiveHotspotId(null)}
                        onClick={() => setActiveHotspotId((prev) => (prev === hotspot.id ? null : hotspot.id))}
                        className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#0B64D3] text-white shadow-lg transition hover:scale-105"
                        aria-label={`Detalhes de ${hotspot.name}`}
                      >
                        <span className="absolute inline-flex h-9 w-9 animate-ping rounded-full bg-[#0B64D3]/35" />
                        <span className="relative text-sm font-bold">+</span>
                      </button>

                      <div
                        className={`absolute left-1/2 z-20 mt-2 w-56 -translate-x-1/2 rounded-lg border border-[#d4e3fa] bg-white p-3 text-left shadow-xl transition-all ${
                          active ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-1"
                        }`}
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0B64D3]">{hotspot.price}</p>
                        <Link href={`/produtos/${hotspot.slug}`} className="mt-1 block text-sm font-semibold text-[#10213f] hover:text-[#0B64D3]">
                          {hotspot.name}
                        </Link>
                        <p className="mt-1 text-xs text-[#4a638d]">{hotspot.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-2">
              {printerHotspots.map((hotspot) => {
                const active = activeHotspotId === hotspot.id;
                return (
                  <div
                    key={hotspot.id}
                    role="button"
                    tabIndex={0}
                    onMouseEnter={() => setActiveHotspotId(hotspot.id)}
                    onFocus={() => setActiveHotspotId(hotspot.id)}
                    onBlur={() => setActiveHotspotId(null)}
                    onClick={() => setActiveHotspotId((prev) => (prev === hotspot.id ? null : hotspot.id))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveHotspotId((prev) => (prev === hotspot.id ? null : hotspot.id));
                      }
                    }}
                    className={`rounded-xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[#0B64D3]/35 ${
                      active
                        ? "border-[#0B64D3] bg-white shadow-sm"
                        : "border-[#d4e3fa] bg-white hover:border-[#b8cef2]"
                    }`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0B64D3]">{hotspot.price}</p>
                    <p className="mt-1 text-sm font-semibold text-[#10213f]">{hotspot.name}</p>
                    <p className="mt-1 text-xs text-[#4a638d]">{hotspot.description}</p>
                    <Link href={`/produtos/${hotspot.slug}`} className="mt-2 inline-block text-xs font-semibold text-[#0B64D3] underline decoration-transparent hover:decoration-[#0B64D3]">
                      Ver produto
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
