"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiArrowRight, HiPlay } from "react-icons/hi";
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
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1920&auto=format&fit=crop",
    alt: "Filamentos 3D de alta tecnologia com cores neon vibrantes",
    label: "Linha Premium",
    title: "Cores que dão vida às suas ideias",
    subtitle: "QUALIDADE INDUSTRIAL",
    description: "Explore nossa linha completa de filamentos com diâmetro constante e cores vibrantes para impressões perfeitas.",
    button1: { text: "Ver Filamentos", link: "/categorias/filamentos" },
    button2: { text: "Suporte Técnico", link: "https://wa.me/5511999999999" },
    crosshairPos: { top: "45%", left: "70%" },
    tech: [
      { label: "MATERIAL", value: "PLA / ABS / PETG" },
      { label: "PRECISÃO", value: "±0.02MM" },
      { label: "STATUS", value: "OPTIMIZED" }
    ]
  },
  {
    id: "hero-2",
    image: "https://images.unsplash.com/photo-1707328905739-166348c5c163?q=80&w=1920&auto=format&fit=crop",
    alt: "Close-up dramático da cabeça de impressão Creality K1",
    label: "Peças de Elite",
    title: "Upgrade de Elite para sua Máquina",
    subtitle: "PEÇAS DE PRECISÃO",
    description: "Hotends, nozzles e kits de extrusão de alta performance. Compatível com as principais marcas do mercado.",
    button1: { text: "Comprar Peças", link: "/produtos" },
    button2: { text: "Consultoria", link: "https://wa.me/5511999999999" },
    crosshairPos: { top: "40%", left: "55%" },
    tech: [
      { label: "TEMP.", value: "300°C MAX" },
      { label: "HARDWARE", value: "CREALITY / BAMBU" },
      { label: "FLOW", value: "32MM³/S" }
    ]
  },
  {
    id: "hero-3",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1920&auto=format&fit=crop",
    alt: "Impressão 3D artística de alta precisão",
    label: "Serviços IP3D",
    title: "A perfeição em cada camada",
    subtitle: "SERVIÇOS SOB DEMANDA",
    description: "Transforme seus projetos em realidade com nosso serviço de impressão 3D profissional e acabamento impecável.",
    button1: { text: "Orçamento Rápido", link: "/personalizados" },
    button2: { text: "Ver Portfólio", link: "/personalizados#portfolio" },
    crosshairPos: { top: "50%", left: "40%" },
    tech: [
      { label: "RESOLUÇÃO", value: "100 MICRONS" },
      { label: "FINISH", value: "PROFISSIONAL" },
      { label: "LOAD", value: "CALIBRATED" }
    ]
  },
];

const categorySections = [
  {
    slug: "componentes-bambu-lab",
    title: "Componentes Bambu Lab",
    description: "Kits, hotends e reposicoes para A1, A1 Mini e H2D.",
    miniBanner: "/images/banners/mini-componentes-bambu-lab.svg",
  },
  {
    slug: "componentes-creality",
    title: "Componentes Creality",
    description: "Pecas e upgrades para CR-10, Ender e linha industrial.",
    miniBanner: "/images/banners/mini-componentes-creality.svg",
  },
  {
    slug: "componentes-universais",
    title: "Componentes Universais",
    description: "Termistores, aquecedores e itens para multiplos modelos.",
    miniBanner: "/images/banners/mini-componentes-universais.svg",
  },
  {
    slug: "impressoras-3d",
    title: "Impressoras 3D",
    description: "Maquinas prontas para producao com suporte IP3D.",
    miniBanner: "/images/banners/mini-impressoras-3d.svg",
  },
  {
    slug: "personalizados",
    title: "Personalizados",
    description: "Projetos sob medida para o seu fluxo de fabricacao.",
    miniBanner: "/images/banners/mini-personalizados.svg",
  },
];

const categoryCardImageFallbacks: Record<string, string> = {
  "componentes-bambu-lab": "/images/categories/componentes-bambu-lab.svg",
  "componentes-creality": "/images/categories/componentes-creality.svg",
  "componentes-universais": "/images/categories/componentes-universais.svg",
  "impressoras-3d": "/images/categories/impressoras-3d.svg",
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
}: HomeShowcaseProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState<any[]>(DEFAULT_SLIDES);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const sectionCarouselRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("/api/admin/banners");
        if (!res.ok) throw new Error("Falha ao carregar banners");
        const data = await res.json();
        
        if (data.banners && data.banners.length > 0) {
          const mappedBanners = data.banners.map((b: any) => ({
            id: b.id,
            image: b.image,
            alt: b.title,
            label: b.badge || "DESTAQUE",
            title: b.title,
            subtitle: b.subtitle || "",
            description: b.description || "",
            button1: { text: b.button1Text || "Ver Mais", link: b.button1Link || "#" },
            button2: { text: b.button2Text || "", link: b.button2Link || "" },
            crosshairPos: b.crosshairPos || { top: "50%", left: "50%" },
            tech: b.techLabels || [{ label: "STATUS", value: b.active ? "ONLINE" : "OFFLINE" }]
          }));
          setHeroSlides(mappedBanners);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };
    fetchBanners();
  }, []);

  // ─── Carrossel automático "Todos os nossos produtos" ─────────────────────────
  // Usa requestAnimationFrame para garantir funcionamento independente de CSS.
  //
  // Por que RAF em vez de CSS animation:
  //   • `animation: name timing-function count` sem duração explícita aplica
  //     animation-duration: 0s (padrão CSS). O inline animationDuration deveria
  //     sobrescrever, mas a interação shorthand → longhand não é confiável em
  //     todos os browsers/pipelines de CSS (Tailwind v4).
  //   • Com RAF temos controle pixel-perfect do stride: stride = N*(CARD_W+GAP)
  //     garante seamless loop exato. A abordagem -50% CSS falha quando o track
  //     tem padding à esquerda (desalinha o ponto de reset).
  //   • prefers-reduced-motion tratado via window.matchMedia antes de iniciar.
  //
  // stride: distância (px) de uma cópia completa = N × (largura_card + gap)
  //         Ao módulo-strider o offset, o ponto de reset é idêntico ao início.
  // ─────────────────────────────────────────────────────────────────────────────
  const MARQUEE_CARD_W = 272;   // largura do card em px (w-[272px])
  const MARQUEE_GAP    = 16;    // gap-4 = 1rem = 16px
  const MARQUEE_SPEED  = 55;    // px/s — velocidade confortável para leitura

  const marqueeRef          = useRef<HTMLDivElement | null>(null);
  const marqueeRafRef       = useRef<number>(0);
  const marqueeOffsetRef    = useRef(0);
  const marqueePrevTimeRef  = useRef<number | null>(null);
  const marqueePausedRef    = useRef(false);

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el || allProducts.length === 0) return;

    // Respeita preferência do sistema operacional
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stride = allProducts.length * (MARQUEE_CARD_W + MARQUEE_GAP);
    marqueePrevTimeRef.current = null;

    function tick(now: number) {
      if (marqueePrevTimeRef.current === null) marqueePrevTimeRef.current = now;

      if (!marqueePausedRef.current) {
        const dt = (now - marqueePrevTimeRef.current) / 1000; // segundos
        marqueeOffsetRef.current = (marqueeOffsetRef.current + MARQUEE_SPEED * dt) % stride;
        if (el) el.style.transform = `translateX(-${marqueeOffsetRef.current}px)`;
      }

      marqueePrevTimeRef.current = now;
      marqueeRafRef.current = requestAnimationFrame(tick);
    }

    marqueeRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(marqueeRafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allProducts.length]);
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const categoryProductsMap = useMemo(() => {
    const map: Record<string, ProductCard[]> = {};
    for (const section of categorySections) {
      // Apenas produtos reais desta categoria vindos do banco.
      // Sem fallback fictício nem injeção cross-categoria (backupPool removido).
      // Seções sem produtos no banco são ocultadas pelo guard no JSX.
      const source = categoryProducts[section.slug] ?? [];
      map[section.slug] = source.slice(0, MAX_PRODUCTS_PER_SECTION);
    }
    return map;
  }, [categoryProducts]);

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

  const handleAddToCart = (product: ProductCard) => {
    const basePrice = product.pricePromo ?? product.priceOriginal ?? product.pixPrice ?? null;
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
  };

  const scrollSection = (slug: string, direction: "left" | "right") => {
    const target = sectionCarouselRefs.current[slug];
    if (!target) return;
    target.scrollBy({ left: direction === "left" ? -360 : 360, behavior: "smooth" });
  };

  return (
    <div className="space-y-10 pb-16">
      <section className="bg-[#f4f7fd]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="relative overflow-hidden rounded-xl border border-[#dbe7fb] bg-black shadow-[0_24px_60px_-42px_rgba(11,100,211,0.55)]">
            <div className="relative h-[480px] sm:h-[540px] lg:h-[600px]">
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
                  
                  {/* Custom Design Assets - HUD Creation */}
                  <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                    {/* Dynamic Crosshair (Large) */}
                    <motion.div
                      initial={{ opacity: 0, scale: 2 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{ top: heroSlides[currentSlide].crosshairPos.top, left: heroSlides[currentSlide].crosshairPos.left }}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                    >
                      <div className="relative w-48 h-48 sm:w-80 sm:h-80 border border-cyan-500/10 rounded-full flex items-center justify-center">
                        {/* Outer rotating ring */}
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 border border-thin border-cyan-500/30 rounded-full"
                        />
                        
                        {/* Inner focus circle */}
                        <div className="w-6 h-6 border-2 border-cyan-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                        
                        {/* Corner brackets (MIRA MAIOR) */}
                        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]" />
                        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]" />
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]" />

                        {/* Measuring lines */}
                        <div className="absolute top-1/2 -translate-y-1/2 -left-28 w-24 h-[1px] bg-gradient-to-l from-cyan-500 to-transparent" />
                        <div className="absolute top-1/2 -translate-y-1/2 -right-28 w-24 h-[1px] bg-gradient-to-r from-cyan-500 to-transparent" />
                        
                        {/* Status Label */}
                        <div className="absolute -top-8 left-0 text-[10px] font-bold font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 tracking-[0.2em] border-l-2 border-cyan-500">
                          TARGET_ACQUISITION_V4
                        </div>
                      </div>
                    </motion.div>

                    {/* Decorative Elements */}
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 opacity-30">
                      <div className="text-[10px] font-mono text-white/50 tracking-[0.5em] uppercase border-y border-white/10 px-4 py-1">
                        IP3D_DIGITAL_MANUFACTURING // HUD_ENABLED
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-40 pointer-events-none">
                <button 
                  onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
                  className="w-12 h-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto hover:bg-[#0B64D3] transition-all"
                  aria-label="Anterior"
                >
                  <HiOutlineChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                  className="w-12 h-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white pointer-events-auto hover:bg-[#0B64D3] transition-all"
                  aria-label="Próximo"
                >
                  <HiOutlineChevronRight size={24} />
                </button>
              </div>

              {/* HUD Scan Line */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.4)] z-30 animate-scan pointer-events-none" />

              <div className="relative z-30 container mx-auto px-8 lg:px-16 h-full flex items-center">
                <div className="max-w-2xl bg-black/10 backdrop-blur-[2px] p-8 border-l-2 border-cyan-500/30">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={`content-${currentSlide}`}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] bg-cyan-500 text-white">
                          LIVE
                        </span>
                        <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest italic">
                          {heroSlides[currentSlide].subtitle}
                        </span>
                      </div>
                      
                      <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1] mb-6">
                        {heroSlides[currentSlide].title}
                      </h1>
                      
                      <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
                        {heroSlides[currentSlide].description}
                      </p>

                      <div className="flex flex-wrap gap-4">
                        <Link href={heroSlides[currentSlide].button1.link}>
                          <Button size="lg" className="bg-[#0B64D3] text-white hover:bg-[#0A4A9D] px-8 h-12 text-base font-semibold transition-all hover:shadow-[0_0_20px_rgba(11,100,211,0.4)]">
                            {heroSlides[currentSlide].button1.text}
                            <HiArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={heroSlides[currentSlide].button2.link}>
                          <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/5 hover:bg-white/10 px-8 h-12 text-base backdrop-blur-sm">
                            <HiPlay className="mr-2 w-5 h-5" />
                            {heroSlides[currentSlide].button2.text}
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* TECH HUD LABELS */}
                <div className="absolute right-8 bottom-12 hidden lg:flex flex-col gap-4">
                  {heroSlides[currentSlide].tech.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                      className="bg-black/40 backdrop-blur-md border-l-2 border-cyan-500 p-4 min-w-[220px] shadow-2xl"
                    >
                      <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.2em] mb-1">{item.label}</p>
                      <p className="text-sm font-mono text-white/90">{item.value}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Navigation dots repositioned */}
              <div className="absolute bottom-6 left-8 flex items-center gap-2 z-30">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1.5 transition-all duration-300 ${
                      index === currentSlide ? "w-10 bg-cyan-500" : "w-4 bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid gap-3 rounded-xl border border-[#dde7f8] bg-white p-4 text-xs font-semibold uppercase tracking-wide text-[#1f3b68] sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-[#f3f7ff] px-3 py-2 text-center">Entrega para todo o Brasil</div>
            <div className="rounded-lg bg-[#f3f7ff] px-3 py-2 text-center">Pagamento via Pix e cartao</div>
            <div className="rounded-lg bg-[#f3f7ff] px-3 py-2 text-center">Suporte tecnico especializado</div>
            <div className="rounded-lg bg-[#f3f7ff] px-3 py-2 text-center">Produtos com garantia</div>
          </div>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categorySections.map((section) => (
              <Link
                key={section.slug}
                href={`/categorias/${section.slug}`}
                className="group overflow-hidden rounded-xl border border-[#dbe7fb] bg-white shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative h-[130px]">
                  <Image src={section.miniBanner} alt={section.title} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
                <div className="space-y-1 px-3 py-3">
                  <h3 className="line-clamp-1 text-sm font-semibold text-[#0f274c]">{section.title}</h3>
                  <p className="line-clamp-2 text-xs text-[#48628b]">{section.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/*
       * MAIS VENDIDOS
       * Fonte de dados: prop `featuredProducts` — produtos com featured=true no banco,
       * ordenados por updatedAt desc (máx. 8). Para alterar quais produtos aparecem
       * aqui, ative/desative o campo "Destaque" no Admin → Produtos.
       *
       * Quando um campo dedicado (ex: bestSeller: Boolean ou salesCount: Int) for
       * adicionado via migração Prisma — usando dados reais de pedidos — basta trocar
       * a query em page.tsx e atualizar esta prop sem alterar o layout.
       *
       * Seção omitida automaticamente se não houver nenhum produto em destaque.
       */}
      {featuredProducts.length > 0 && (
        <section className="bg-white py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-10">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0B64D3]">
                  Mais vendidos
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-[#10213f]">
                  Produtos mais procurados
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollSection("mais-vendidos", "left")}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c7d8f4] bg-white text-[#0B64D3] hover:border-[#0B64D3]"
                  aria-label="Voltar em Mais vendidos"
                >
                  <HiOutlineChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => scrollSection("mais-vendidos", "right")}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c7d8f4] bg-white text-[#0B64D3] hover:border-[#0B64D3]"
                  aria-label="Avançar em Mais vendidos"
                >
                  <HiOutlineChevronRight className="h-5 w-5" />
                </button>
                <Link
                  href="/produtos"
                  className="ml-2 text-sm font-semibold text-[#0B64D3] hover:text-[#0A4A9D]"
                >
                  Ver todos
                </Link>
              </div>
            </div>

            <div
              ref={(node) => {
                sectionCarouselRefs.current["mais-vendidos"] = node;
              }}
              className="flex gap-4 overflow-x-auto pb-3"
              style={{ scrollbarWidth: "none" }}
            >
              {featuredProducts.map((product) => {
                const mainPrice = product.pricePromo ?? product.priceOriginal ?? product.pixPrice ?? null;
                const oldPrice =
                  product.pricePromo && product.priceOriginal && product.pricePromo < product.priceOriginal
                    ? product.priceOriginal
                    : null;
                const pixPrice = product.pixPrice ?? (mainPrice ? Number((mainPrice * 0.95).toFixed(2)) : null);
                const installments = getInstallments(mainPrice);
                const hoverImage = product.hoverImage || product.gallery?.find((image) => image && image !== product.image) || null;
                const productImage = product.image || defaultProductImage;

                return (
                  <div
                    key={product.id}
                    className="group relative flex h-[430px] w-[272px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#d5e3fa] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <button
                      type="button"
                      aria-label={`Favoritar ${product.name}`}
                      className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9e6fb] bg-white/95 text-[#0B64D3] shadow-sm transition-colors hover:bg-[#edf4ff]"
                    >
                      <Heart className="h-4 w-4" />
                    </button>

                    <Link href={`/produtos/${product.slug}`} className="relative block h-[190px] w-full bg-[#f4f8ff]">
                      {isExternalUrl(productImage) ? (
                        <img
                          src={productImage}
                          alt={product.name}
                          className={`h-full w-full object-cover transition-all duration-500 ${hoverImage ? "opacity-100 group-hover:opacity-0" : "group-hover:scale-105"}`}
                        />
                      ) : (
                        <Image
                          src={productImage}
                          alt={product.name}
                          fill
                          className={`object-cover transition-all duration-500 ${hoverImage ? "opacity-100 group-hover:opacity-0" : "group-hover:scale-105"}`}
                          sizes="(max-width: 768px) 80vw, 272px"
                        />
                      )}
                      {hoverImage && (
                        isExternalUrl(hoverImage) ? (
                          <img
                            src={hoverImage}
                            alt={`${product.name} - imagem secundária`}
                            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                          />
                        ) : (
                          <Image
                            src={hoverImage}
                            alt={`${product.name} - imagem secundária`}
                            fill
                            className="object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                            sizes="(max-width: 768px) 80vw, 272px"
                          />
                        )
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-[#0B64D3] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Mais vendido
                      </span>
                    </Link>

                    <div className="flex flex-1 flex-col p-4">
                      <Link
                        href={`/produtos/${product.slug}`}
                        className="line-clamp-2 min-h-[3.2rem] text-[15px] font-semibold text-[#0f274c]"
                      >
                        {product.name}
                      </Link>

                      <div className="mt-2 space-y-1">
                        <div className="flex items-end gap-2">
                          <span className="text-[1.25rem] font-bold text-[#10213f]">{formatCurrency(mainPrice)}</span>
                          {oldPrice && (
                            <span className="text-xs text-[#6e86ab] line-through">{formatCurrency(oldPrice)}</span>
                          )}
                        </div>
                        {installments && <p className="text-xs text-[#47628a]">ou {installments}</p>}
                        {pixPrice && mainPrice && pixPrice < mainPrice && (
                          <p className="text-xs font-semibold text-[#FF6B35]">Pix: {formatCurrency(pixPrice)}</p>
                        )}
                      </div>

                      <div className="pt-3">
                        <Button asChild className="h-10 w-full translate-y-2 rounded-lg bg-[#0B64D3] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#0A4A9D]">
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

      {/*
       * TODOS OS NOSSOS PRODUTOS — carrossel automático e infinito
       * Fonte de dados: prop `allProducts` — todos os produtos com active=true
       * no banco, ordenados por featured desc → updatedAt desc. Inclui os 9
       * componentes e os 13 personalizados (22 produtos totais após seed).
       *
       * Técnica de loop seamless: o array é duplicado ([...allProducts, ...allProducts]).
       * A animação CSS desloca o track de 0 → -50% (= 1 cópia completa) em loop
       * linear. Ao atingir -50%, o navegador reinicia do 0 — que é visualmente
       * idêntico ao ponto de chegada — eliminando qualquer salto brusco.
       * Duração calculada dinamicamente: Math.max(30, N×4) segundos.
       */}
      {allProducts.length > 0 && (
        <section className="bg-white py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-10">
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

          {/* Track: overflow oculto no container, sem padding no track para
               garantir stride exato no loop. O gap-4 é considerado no cálculo
               de stride = N × (272 + 16). */}
          <div className="overflow-hidden">
            <div
              ref={marqueeRef}
              className="flex gap-4"
              style={{ willChange: "transform" }}
              onMouseEnter={() => {
                marqueePausedRef.current = true;
              }}
              onMouseLeave={() => {
                marqueePausedRef.current = false;
                marqueePrevTimeRef.current = null; // evita salto após retomar
              }}
              aria-label="Carrossel automático de todos os produtos IP3D"
            >
              {/* Duplicação para loop seamless: itens 0…N-1 + itens 0…N-1 */}
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
                    // index no sufixo garante unicidade entre as duas cópias do array
                    key={`marquee-${product.id}-${index}`}
                    className="group relative flex h-[430px] w-[272px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#d5e3fa] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
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
                      className="relative block h-[190px] w-full bg-[#f4f8ff]"
                      tabIndex={index >= allProducts.length ? -1 : undefined}
                    >
                      {isExternalUrl(productImage) ? (
                        <img
                          src={productImage}
                          alt={product.name}
                          className={`h-full w-full object-cover transition-all duration-500 ${hoverImage ? "opacity-100 group-hover:opacity-0" : "group-hover:scale-105"}`}
                        />
                      ) : (
                        <Image
                          src={productImage}
                          alt={product.name}
                          fill
                          className={`object-cover transition-all duration-500 ${hoverImage ? "opacity-100 group-hover:opacity-0" : "group-hover:scale-105"}`}
                          sizes="272px"
                        />
                      )}
                      {hoverImage && (
                        isExternalUrl(hoverImage) ? (
                          <img
                            src={hoverImage}
                            alt={`${product.name} - imagem secundária`}
                            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                          />
                        ) : (
                          <Image
                            src={hoverImage}
                            alt={`${product.name} - imagem secundária`}
                            fill
                            className="object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                            sizes="272px"
                          />
                        )
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

                      <div className="mt-4 space-y-1">
                        <div className="flex items-end gap-2">
                          <span className="text-[1.25rem] font-bold text-[#10213f]">
                            {formatCurrency(mainPrice)}
                          </span>
                          {oldPrice && (
                            <span className="text-xs text-[#6e86ab] line-through">
                              {formatCurrency(oldPrice)}
                            </span>
                          )}
                        </div>
                        {installments && (
                          <p className="text-xs text-[#47628a]">ou {installments}</p>
                        )}
                        {pixPrice && mainPrice && pixPrice < mainPrice && (
                          <p className="text-xs font-semibold text-[#FF6B35]">
                            Pix: {formatCurrency(pixPrice)}
                          </p>
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

      <section className="bg-[#f7faff] py-8">
        <div className="container mx-auto space-y-10 px-4 sm:px-6 lg:px-10">
          {cartMessage && (
            <div className="sticky top-4 z-20 mx-auto w-fit rounded-full bg-[#10213f] px-4 py-2 text-sm font-medium text-white shadow-lg">
              {cartMessage}
            </div>
          )}

          {categorySections.map((section) => {
            const products = categoryProductsMap[section.slug] ?? [];
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
                </div>

                <div
                  ref={(node) => {
                    sectionCarouselRefs.current[section.slug] = node;
                  }}
                  className="flex gap-4 overflow-x-auto pb-3"
                  style={{ scrollbarWidth: "none" }}
                >
                  {products.map((product) => {
                    const mainPrice = product.pricePromo ?? product.priceOriginal ?? product.pixPrice ?? null;
                    const oldPrice = product.pricePromo && product.priceOriginal && product.pricePromo < product.priceOriginal ? product.priceOriginal : null;
                    const pixPrice = product.pixPrice ?? (mainPrice ? Number((mainPrice * 0.95).toFixed(2)) : null);
                    const installments = getInstallments(mainPrice);
                    const hoverImage = product.hoverImage || product.gallery?.find((image) => image && image !== product.image) || null;
                    const productImage = product.image || defaultProductImage;

                    return (
                      <div
                        key={product.id}
                        className="group relative flex h-[430px] w-[272px] shrink-0 flex-col overflow-hidden rounded-xl border border-[#d5e3fa] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                      >
                        <button
                          type="button"
                          aria-label={`Favoritar ${product.name}`}
                          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9e6fb] bg-white/95 text-[#0B64D3] shadow-sm transition-colors hover:bg-[#edf4ff]"
                        >
                          <Heart className="h-4 w-4" />
                        </button>

                        <Link href={`/produtos/${product.slug}`} className="relative block h-[190px] w-full bg-[#f4f8ff]">
                          {isExternalUrl(productImage) ? (
                            <img
                              src={productImage}
                              alt={product.name}
                              className={`h-full w-full object-cover transition-all duration-500 ${hoverImage ? "opacity-100 group-hover:opacity-0" : "group-hover:scale-105"}`}
                            />
                          ) : (
                            <Image
                              src={productImage}
                              alt={product.name}
                              fill
                              className={`object-cover transition-all duration-500 ${hoverImage ? "opacity-100 group-hover:opacity-0" : "group-hover:scale-105"}`}
                              sizes="(max-width: 768px) 80vw, 272px"
                            />
                          )}
                          {hoverImage && (
                            isExternalUrl(hoverImage) ? (
                              <img
                                src={hoverImage}
                                alt={`${product.name} - imagem secundária`}
                                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                              />
                            ) : (
                              <Image
                                src={hoverImage}
                                alt={`${product.name} - imagem secundária`}
                                fill
                                className="object-cover opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                                sizes="(max-width: 768px) 80vw, 272px"
                              />
                            )
                          )}
                        </Link>

                        <div className="flex flex-col p-4">
                          <Link href={`/produtos/${product.slug}`} className="line-clamp-2 min-h-[3.2rem] text-[15px] font-semibold text-[#0f274c]">
                            {product.name}
                          </Link>

                          <div className="mt-4 space-y-1">
                            <div className="flex items-end gap-2">
                              <span className="text-[1.25rem] font-bold text-[#10213f]">{formatCurrency(mainPrice)}</span>
                              {oldPrice && <span className="text-xs text-[#6e86ab] line-through">{formatCurrency(oldPrice)}</span>}
                            </div>
                            {installments && <p className="text-xs text-[#47628a]">ou {installments}</p>}
                            {pixPrice && mainPrice && pixPrice < mainPrice && (
                              <p className="text-xs font-semibold text-[#FF6B35]">Pix: {formatCurrency(pixPrice)}</p>
                            )}
                          </div>

                          <div className="pt-3">
                            <Button asChild className="h-10 w-full translate-y-2 rounded-lg bg-[#0B64D3] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#0A4A9D]">
                              <Link href={`/produtos/${product.slug}`}>Comprar</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-10">
          <div className="mb-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#0B64D3]">Mapa de componentes</p>
            <h3 className="mt-2 text-2xl font-semibold text-[#10213f]">Passe o mouse na impressora e veja cada peca</h3>
            <p className="mx-auto mt-2 max-w-3xl text-sm text-[#4a638d]">
              Cada ponto mostra item, descricao e preco. No celular, toque no ponto para abrir os detalhes.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div
              className="relative overflow-hidden rounded-xl border border-[#d4e3fa] bg-[#f5f9ff] shadow-sm lg:min-h-[560px]"
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
                        ? "border-[#0B64D3] bg-[#edf4ff] shadow-sm"
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
