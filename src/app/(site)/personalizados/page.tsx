"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  HiArrowRight,
  HiOutlineChat,
  HiOutlineClock,
  HiOutlineColorSwatch,
  HiOutlineCube,
  HiOutlineLightningBolt,
  HiOutlinePhotograph,
  HiX,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import {
  STANDARD_PAGE_BANNER_CLASS,
  limitWords,
  normalizeHeroCopy,
} from "@/components/sections/page-banner-styles";

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

function normalizeWhatsappPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return digits.length >= 12 ? digits : `55${digits}`;
}

export default function PersonalizadosPage() {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioProduct[]>([]);
  const [selectedItem, setSelectedItem] = useState<PortfolioProduct | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [pageConfig, setPageConfig] = useState<PageConfig>({});

  const portfolioRef = useRef(null);
  const processRef = useRef(null);
  const portfolioInView = useInView(portfolioRef, { once: true, margin: "-50px" });
  const processInView = useInView(processRef, { once: true, margin: "-50px" });

  const categories = [...new Set(portfolioItems.map((item) => item.category))];

  const filteredItems = selectedCategory
    ? portfolioItems.filter((item) => item.category === selectedCategory)
    : portfolioItems;

  const features = (
    pageConfig.features || defaultFeatures.map((feature) => ({
      title: feature.title,
      description: feature.description,
    }))
  ).map((feature, index) => ({
    icon: defaultFeatures[index]?.icon || HiOutlineCube,
    ...feature,
  }));

  const processSteps = pageConfig.processSteps || defaultProcessSteps;

  useEffect(() => {
    fetch("/api/layout?type=header")
      .then((response) => response.json())
      .then((data) => {
        const phone: string = data.config?.content?.contactPhone ?? "";
        setWhatsappPhone(normalizeWhatsappPhone(phone));
      })
      .catch(() => {});

    fetch("/api/layout?type=page-personalizados")
      .then((response) => response.json())
      .then((data) => {
        if (data.config?.content) {
          setPageConfig(data.config.content as PageConfig);
        }
      })
      .catch(() => {});

    fetch("/api/products?category=personalizados&limit=50")
      .then((response) => response.json())
      .then((data) => {
        if (!data.products || data.products.length === 0) {
          setPortfolioItems([]);
          return;
        }

        const mapped: PortfolioProduct[] = data.products.map((product: Record<string, unknown>) => ({
          id: product.id as string,
          title: (product.name as string) || "Projeto personalizado",
          category: (product.category as Record<string, string> | undefined)?.name || "Personalizados",
          description: (product.shortDescription as string) || "",
          image: (product.image as string) || "/images/products/components-placeholder.svg",
          slug: (product.slug as string) || "",
        }));

        setPortfolioItems(mapped);
      })
      .catch(() => {
        setPortfolioItems([]);
      });
  }, []);

  useEffect(() => {
    fetch("/api/pages/personalizados")
      .then((response) => response.json())
      .then((data) => setBlocks(data.page?.blocks || []))
      .catch(() => {});
  }, []);

  if (blocks.length > 0) {
    return <BlockRenderer blocks={blocks} />;
  }

  return (
    <>
      <section className={`${STANDARD_PAGE_BANNER_CLASS} text-white`}>
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                {" "}
                {limitWords(pageConfig.heroHighlight || "ideias", 2)}{" "}
              </span>
              {!pageConfig.heroTitle && "em realidade"}
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-2xl">
              {limitWords(
                normalizeHeroCopy(
                  pageConfig.heroDescription ||
                    "Impressão 3D sob demanda para protótipos e peças finais com qualidade profissional.",
                ),
                12,
              )}
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

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-3xl"
        />
      </section>

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

          {categories.length > 0 && (
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
          )}

          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={portfolioInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-3xl rounded-3xl border border-dashed border-[#c5d7f5] bg-white px-8 py-12 text-center shadow-sm"
            >
              <h3 className="text-2xl font-semibold text-[#0f274c]">
                Ainda não há projetos personalizados publicados.
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#4e678f]">
                Esta vitrine exibe apenas produtos reais cadastrados na categoria personalizados.
                Novos projetos aparecerão aqui assim que forem publicados no catálogo.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" className="bg-[#0B64D3] text-white hover:bg-[#0A4A9D]" asChild>
                  <Link href="/produtos">Ver catálogo completo</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#c5d7f5] text-[#0B64D3] hover:bg-[#edf4ff]"
                  asChild
                >
                  <Link href="/contato">Solicitar orçamento</Link>
                </Button>
              </div>
            </motion.div>
          ) : (
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
                    onClick={(event) => event.stopPropagation()}
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
                      onClick={(event) => event.stopPropagation()}
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
                        onClick={(event) => event.stopPropagation()}
                      >
                        Ver Produto
                      </Link>
                      <a
                        href={`https://wa.me/${whatsappPhone}?text=Olá! Vi o produto "${item.title}" no site e gostaria de solicitar um orçamento.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 items-center justify-center rounded-full border border-[#c5d7f5] text-sm font-semibold text-[#0B64D3] transition-colors hover:border-[#0B64D3]"
                        onClick={(event) => event.stopPropagation()}
                      >
                        Solicitar Orçamento
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

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
                <h3 className="text-lg font-bold text-[#0f274c] mb-2">{step.title}</h3>
                <p className="text-sm text-[#4e678f] leading-relaxed max-w-[220px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
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
              {pageConfig.ctaDescription ||
                "Entre em contato conosco e transforme sua ideia em realidade. Orçamento sem compromisso!"}
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
                <Link href="/contato">Enviar E-mail</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

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
            onClick={(event) => event.stopPropagation()}
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
              <h3 className="text-2xl font-semibold text-black mb-4">{selectedItem.title}</h3>
              <p className="text-gray-600 mb-6">{selectedItem.description}</p>
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
