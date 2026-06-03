"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  HiArrowRight,
  HiOutlineCube,
  HiOutlineLightningBolt,
  HiOutlineColorSwatch,
  HiOutlineClock,
  HiOutlineChat,
  HiOutlinePhotograph,
  HiX,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { STANDARD_PAGE_BANNER_CLASS, limitWords, normalizeHeroCopy } from "@/components/sections/page-banner-styles";

interface PageBlock {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  active: boolean;
}

interface PortfolioProduct {
  id: string | number;
  title: string;
  category: string;
  description: string;
  image: string;
  slug: string;
}

interface PageConfig {
  heroImage?: string;
  heroTagline?: string;
  heroTitle?: string;
  heroHighlight?: string;
  heroDescription?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  features?: Array<{ title: string; description: string }>;
  processSteps?: Array<{ step: string; title: string; description: string }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Galeria de produtos personalizados reais
// Fonte: Produtos site(personalizados) (1).csv
//
// Categorias (do CSV): Headsets | Drones | Starlink |
//                      Colecionáveis Interativos & Fidgets | Outros
//
// • slug       → rota do produto no catálogo: /produtos/[slug]
// • image      → placeholder ativo; substituir via Admin → Produtos quando
//               imagens reais estiverem disponíveis
// • category   → deve ser idêntica ao subCategorySlug do seed para consistência
// ─────────────────────────────────────────────────────────────────────────────
const fallbackPortfolioItems: PortfolioProduct[] = [
  {
    id: 1,
    title: "Logitech G29 Extensor Paddle Shifter",
    category: "Outros",
    description:
      "Extensor de paddle shifter impresso em 3D para o volante Logitech G29. Melhora o alcance e a ergonomia para simuladores de corrida sem modificação permanente no volante.",
    image: "/images/products/components-placeholder.svg",
    slug: "logitech-g29-extensor-paddle",
  },
  {
    id: 2,
    title: "Fixador de Haste Astro A50 Gen4 (2 peças)",
    category: "Headsets",
    description:
      "Kit com 2 peças fixadoras de haste para o headset Astro A50 Gen4. Resolve a quebra da haste original sem precisar comprar um novo headset.",
    image: "/images/products/components-placeholder.svg",
    slug: "fixador-haste-astro-a50-gen4",
  },
  {
    id: 3,
    title: "Starlink Suporte de Antena com Trava 1,5\"",
    category: "Starlink",
    description:
      "Luva/suporte para fixação da antena Starlink em poste ou mastro de 1,5 polegada, com sistema de trava de segurança integrado e material resistente a UV.",
    image: "/images/products/components-placeholder.svg",
    slug: "starlink-suporte-antena",
  },
  {
    id: 4,
    title: "Kit Dobradiças Audio-Technica ATH-M40x (2x)",
    category: "Headsets",
    description:
      "Par de dobradiças (hinges) de reposição para o fone Audio-Technica ATH-M40x. Encaixe idêntico ao original — evita a troca do headphone completo.",
    image: "/images/products/components-placeholder.svg",
    slug: "kit-dobradicas-audio-technica-m40x",
  },
  {
    id: 5,
    title: "Suporte Base de Carregamento Xiaomi Vacuum",
    category: "Outros",
    description:
      "Suporte impresso em 3D para fixar a base de carregamento do robô aspirador Xiaomi Vacuum na parede ou superfície, mantendo o ambiente organizado.",
    image: "/images/products/components-placeholder.svg",
    slug: "suporte-base-xiaomi-vacum",
  },
  {
    id: 6,
    title: "Proteção Drone DJI Neo — Hélice, Câmera e Controle",
    category: "Drones",
    description:
      "Kit de proteção completo para o drone DJI Neo: protetor de hélice, câmera e controle remoto. Material resistente a impactos, cor preta.",
    image: "/images/products/components-placeholder.svg",
    slug: "protecao-drone-dji-neo",
  },
  {
    id: 7,
    title: "Astro A50 Headband Fix — Adaptador Steelseries",
    category: "Headsets",
    description:
      "Adaptador que permite usar a headband da Steelseries no headset Astro A50, substituindo o arco original quebrado por uma solução econômica e resistente.",
    image: "/images/products/components-placeholder.svg",
    slug: "astro-a50-headband-fix-steelseries",
  },
  {
    id: 8,
    title: "Boneco Miniatura Personalizado Bobblehead 3D",
    category: "Colecionáveis Interativos & Fidgets",
    description:
      "Boneco miniatura personalizado com as características físicas do cliente, no estilo Bobblehead (cabeça articulada). Ideal para presentes únicos e colecionáveis. Produção sob encomenda.",
    image: "/images/products/components-placeholder.svg",
    slug: "boneco-miniatura-bobblehead-3d",
  },
  {
    id: 9,
    title: "Suporte de Parede — Adaptador Ethernet Starlink",
    category: "Starlink",
    description:
      "Suporte impresso em 3D para fixar o adaptador Ethernet Starlink na parede, mantendo o cabo organizado e o adaptador protegido.",
    image: "/images/products/components-placeholder.svg",
    slug: "suporte-ethernet-starlink",
  },
  {
    id: 10,
    title: "Suporte de Lanterna Superior DJI Neo — Voo Noturno",
    category: "Drones",
    description:
      "Suporte para lanterna fixado no topo do drone DJI Neo, viabilizando voos noturnos com iluminação auxiliar. Resistente às vibrações de voo, cor branca.",
    image: "/images/products/components-placeholder.svg",
    slug: "suporte-lanterna-dji-neo",
  },
  {
    id: 11,
    title: "Suporte de Parede Xiaomi AX3600/AX6000",
    category: "Outros",
    description:
      "Kit de suporte de parede para roteadores Xiaomi AX3600 e AX6000. Economiza espaço, melhora a ventilação e organiza o ambiente.",
    image: "/images/products/components-placeholder.svg",
    slug: "suporte-parede-xiaomi-ax3600",
  },
  {
    id: 12,
    title: "Suporte de Radiador Externo Water Cooler PC",
    category: "Outros",
    description:
      "Suporte em PETG reforçado para fixação de radiador externo de water cooler em gabinetes de PC. Alta resistência estrutural, cor preta.",
    image: "/images/products/components-placeholder.svg",
    slug: "suporte-radiador-water-cooler-pc",
  },
  {
    id: 13,
    title: "Peça Reposição ATH-M40x — Yoke/Haste Par",
    category: "Headsets",
    description:
      "Par de yokes (hastes de articulação) de reposição para o Audio-Technica ATH-M40x. Encaixe idêntico ao original — resolve a quebra sem troca do headphone completo.",
    image: "/images/products/components-placeholder.svg",
    slug: "peca-reposicao-audio-technica-m40x-yoke",
  },
];

const defaultFeatures = [
  {
    icon: HiOutlineCube,
    title: "Modelagem 3D",
    description: "Criamos o modelo 3D a partir do seu desenho, foto ou ideia.",
  },
  {
    icon: HiOutlineColorSwatch,
    title: "Materiais Diversos",
    description: "PLA, PETG, ABS, TPU flexível, fibra de carbono e mais.",
  },
  {
    icon: HiOutlineLightningBolt,
    title: "Alta Precisão",
    description: "Impressão com resolução de até 0.1mm para detalhes perfeitos.",
  },
  {
    icon: HiOutlineClock,
    title: "Entrega Rápida",
    description: "Prazos ágeis para projetos urgentes.",
  },
];

const defaultProcessSteps = [
  {
    step: "01",
    title: "Envie sua ideia",
    description: "Mande seu arquivo 3D, desenho, foto ou descrição do que precisa.",
  },
  {
    step: "02",
    title: "Orçamento",
    description: "Analisamos seu projeto e enviamos um orçamento detalhado.",
  },
  {
    step: "03",
    title: "Aprovação",
    description: "Após aprovação, iniciamos a produção da sua peça.",
  },
  {
    step: "04",
    title: "Entrega",
    description: "Sua peça é finalizada e enviada com todo cuidado.",
  },
];

export default function PersonalizadosPage() {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioProduct[]>(fallbackPortfolioItems);
  const [selectedItem, setSelectedItem] = useState<PortfolioProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [pageConfig, setPageConfig] = useState<PageConfig>({});

  const portfolioRef = useRef(null);
  const processRef = useRef(null);
  const portfolioInView = useInView(portfolioRef, { once: true, margin: "-50px" });
  const processInView = useInView(processRef, { once: true, margin: "-50px" });

  const categories = [...new Set(portfolioItems.map(item => item.category))];

  const filteredItems = selectedCategory
    ? portfolioItems.filter(item => item.category === selectedCategory)
    : portfolioItems;

  const features = (pageConfig.features || defaultFeatures.map(f => ({ title: f.title, description: f.description }))).map((f, i) => ({
    icon: defaultFeatures[i]?.icon || HiOutlineCube,
    ...f,
  }));

  const processSteps = pageConfig.processSteps || defaultProcessSteps;

  useEffect(() => {
    // Load WhatsApp phone from header config
    fetch("/api/layout?type=header")
      .then((r) => r.json())
      .then((data) => {
        const phone: string = data.config?.content?.contactPhone ?? "";
        const digits = phone.replace(/\D/g, "");
        if (digits) setWhatsappPhone(digits.length >= 12 ? digits : `55${digits}`);
      })
      .catch(() => {});

    // Load page config from layout
    fetch("/api/layout?type=page-personalizados")
      .then((r) => r.json())
      .then((data) => {
        if (data.config?.content) setPageConfig(data.config.content as PageConfig);
      })
      .catch(() => {});

    // Load products from the "personalizados" category via API
    fetch("/api/products?category=personalizados&limit=50")
      .then((r) => r.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          const mapped: PortfolioProduct[] = data.products.map((p: Record<string, unknown>) => ({
            id: p.id,
            title: p.name,
            category: (p.category as Record<string, string>)?.name || "Personalizados",
            description: p.shortDescription || "",
            image: p.image || "/images/products/components-placeholder.svg",
            slug: p.slug,
          }));
          setPortfolioItems(mapped);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/pages/personalizados")
      .then((r) => r.json())
      .then((data) => setBlocks(data.page?.blocks || []))
      .catch(() => {});
  }, []);

  if (blocks.length > 0) {
    return <BlockRenderer blocks={blocks} />;
  }

  return (
    <>
      {/* Hero Section */}
      <section className={`${STANDARD_PAGE_BANNER_CLASS} text-white`}>
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={pageConfig.heroImage || "/images/pesonalizados-hero.jpg"}
            alt="Peça personalizada impressa em 3D"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            quality={90}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-blue-400 mb-4">
              <HiOutlineCube className="w-5 h-5" />
              {limitWords(pageConfig.heroTagline || "Impressão 3D Sob Demanda", 4)}
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {limitWords(pageConfig.heroTitle || "Transformamos suas", 2)}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> {limitWords(pageConfig.heroHighlight || "ideias", 2)} </span>
              {!pageConfig.heroTitle && "em realidade"}
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-2xl">
              {limitWords(normalizeHeroCopy(pageConfig.heroDescription || "Impressão 3D sob demanda para protótipos e peças finais com qualidade profissional."), 12)}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 group"
                asChild
              >
                <a
                  href={`https://wa.me/${whatsappPhone}?text=Olá! Gostaria de solicitar um orçamento para impressão 3D personalizada.`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <HiOutlineChat className="mr-2 w-5 h-5" />
                  Solicitar Orçamento
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white bg-transparent hover:bg-white/10 transition-all duration-300"
                asChild
              >
                <Link href="#portfolio">
                  <HiOutlinePhotograph className="mr-2 w-5 h-5" />
                  Ver Portfólio
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Decorative 3D elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-3xl"
        />
      </section>

      {/* Features */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-start gap-4 group"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 flex-shrink-0">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Gallery */}
      <section id="portfolio" ref={portfolioRef} className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={portfolioInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
              Nossos Trabalhos
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Portfólio de Projetos
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Confira alguns dos projetos personalizados que já realizamos para nossos clientes.
            </p>
          </motion.div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                selectedCategory === null
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-black text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Gallery Grid — padrão visual idêntico aos cards de catálogo da home:
               rounded-xl / border-[#d5e3fa] / shadow-sm / hover:-translate-y-1
               imagem h-[220px] bg-[#f4f8ff] / categoria azul / título / descrição
               / "Sob consulta" / botões "Ver Produto" + "Solicitar Orçamento".
               Clique no card (fora dos botões) → abre modal com detalhe. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={portfolioInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative flex min-h-[500px] flex-col items-center overflow-hidden rounded-2xl bg-white text-center shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <span className="absolute left-3 top-3 z-10 rounded-full bg-[#0B64D3] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  {item.category}
                </span>

                <Link
                  href={`/produtos/${item.slug}`}
                  className="relative block h-[250px] w-full bg-white"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain p-6 transition-all duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 80vw, 320px"
                  />
                </Link>

                <div className="flex flex-1 flex-col items-center justify-start p-5 text-center">
                  <Link
                    href={`/produtos/${item.slug}`}
                    className="line-clamp-2 mx-auto min-h-[3.2rem] max-w-[85%] text-[15px] font-semibold text-[#0f274c]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.title}
                  </Link>

                  <p className="mt-2 line-clamp-2 text-xs text-[#4e678f] max-w-[90%]">
                    {item.description}
                  </p>

                  <div className="mt-4 rounded-2xl border border-[#cdeed9] bg-[#f0fff5] px-4 py-4 shadow-sm w-full">
                    <div className="text-xs font-medium text-[#6f85a8]">
                      Projeto personalizado
                    </div>
                    <div className="mt-1 text-[1.5rem] font-extrabold leading-none text-[#128C7E]">
                      Sob consulta
                    </div>
                  </div>

                  <div className="mt-auto flex w-full flex-col gap-2 pt-4">
                    <Link
                      href={`/produtos/${item.slug}`}
                      className="flex h-10 items-center justify-center rounded-full bg-[#0B64D3] text-sm font-semibold text-white transition-colors hover:bg-[#0A4A9D]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Ver Produto
                    </Link>
                    <a
                      href={`https://wa.me/${whatsappPhone}?text=Olá! Vi o produto "${item.title}" no site e gostaria de solicitar um orçamento.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-9 items-center justify-center rounded-full border border-[#c5d7f5] text-sm font-semibold text-[#0B64D3] transition-colors hover:border-[#0B64D3]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Solicitar Orçamento
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section ref={processRef} className="py-24 bg-white relative overflow-hidden">

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={processInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#0B64D3]/20 bg-[#0B64D3]/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#0B64D3] mb-4">
              Como Funciona
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0f274c]">
              Processo Simples
            </h2>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0">
            {/* Connector line behind cards */}
            <div className="hidden lg:block absolute top-[3.5rem] left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-[#0B64D3]/10 via-[#0B64D3]/30 via-50% to-[#0B64D3]/10 z-0" />

            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                animate={processInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center px-4"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-2xl bg-[#0B64D3]/10 blur-xl scale-150" />
                  <div className="relative w-[4.5rem] h-[4.5rem] flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#0B64D3] to-[#10213f] text-white text-xl font-bold shadow-lg shadow-[#0B64D3]/25 ring-4 ring-white">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#0f274c] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#4e678f] leading-relaxed max-w-[220px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="container mx-auto px-6 lg:px-12 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {pageConfig.ctaTitle || "Tem um projeto em mente?"}
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8 text-lg">
              {pageConfig.ctaDescription || "Entre em contato conosco e transforme sua ideia em realidade. Orçamento sem compromisso!"}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 group"
                asChild
              >
                <a
                  href={`https://wa.me/${whatsappPhone}?text=Olá! Gostaria de solicitar um orçamento para impressão 3D personalizada.`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <HiOutlineChat className="mr-2 w-5 h-5" />
                  Falar no WhatsApp
                  <HiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white bg-transparent hover:bg-white/10 transition-all duration-300"
                asChild
              >
                <Link href="/contato">
                  Enviar E-mail
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modal for portfolio item */}
      {selectedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedItem(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video bg-gray-100">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${selectedItem.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black text-white flex items-center justify-center transition-colors"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <span className="text-xs uppercase tracking-wider text-blue-500 mb-2 block">
                {selectedItem.category}
              </span>
              <h3 className="text-2xl font-semibold text-black mb-4">
                {selectedItem.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedItem.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="bg-black text-white hover:bg-gray-800 transition-all duration-300"
                  asChild
                >
                  <Link href={`/produtos/${selectedItem.slug}`}>
                    Ver Produto
                    <HiArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300"
                  asChild
                >
                  <a
                    href={`https://wa.me/${whatsappPhone}?text=Olá! Vi o produto "${selectedItem.title}" no site e gostaria de solicitar um orçamento.`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Solicitar Orçamento
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
