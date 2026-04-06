"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { HiArrowRight } from "react-icons/hi";
import { Button } from "@/components/ui/button";

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  image: string | null;
  highlights: string[];
}

interface PageBlock {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  active: boolean;
}

export default function MarcasPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const brandsRef = useRef(null);
  const brandsInView = useInView(brandsRef, { once: true, margin: "-100px" });

  const heroBlock = blocks.find(b => b.type === "brands-hero")?.content || {};
  const sectionBlock = blocks.find(b => b.type === "brands-section")?.content || {};
  const partnershipBlock = blocks.find(b => b.type === "brands-partnership")?.content || {};
  const ctaBlock = blocks.find(b => b.type === "brands-cta")?.content || {};

  useEffect(() => {
    Promise.all([
      fetch("/api/brands").then(r => r.json()),
      fetch("/api/pages/marcas").then(r => r.json()),
    ]).then(([brandData, pageData]) => {
      setBrands(brandData.brands || []);
      setBlocks(pageData.page?.blocks || []);
    }).catch(console.error);
  }, []);

  const titleParts = ((heroBlock.title as string) || "Excelência|em cada|detalhe").split("|");

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 lg:pb-32 bg-black text-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm uppercase tracking-[0.2em] text-gray-400 mb-4 block">
                {(heroBlock.badge as string) || "Nossas Marcas"}
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold mb-6 leading-tight">
                {titleParts.map((part, i) => <span key={i}>{part}{i < titleParts.length - 1 && <br />}</span>)}
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                {(heroBlock.description as string) || "Trabalhamos com as marcas mais prestigiadas do mercado mundial de mobiliário para salões de beleza e spas. Cada marca em nosso portfólio representa o compromisso com qualidade, inovação e design."}
              </p>
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 transition-all duration-300 group"
                asChild
              >
                <Link href={(heroBlock.buttonLink as string) || "/produtos"}>
                  {(heroBlock.buttonText as string) || "Ver Produtos"}
                  <HiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/Captura_de_tela_2026-02-28_210120-removebg-preview.webp"
                  alt="Logo"
                  width={280}
                  height={112}
                  className="object-contain brightness-0 invert"
                />
                <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-white/20" />
                <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-white/20" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section ref={brandsRef} className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={brandsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
              {(sectionBlock.badge as string) || "Portfólio"}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black">
              {(sectionBlock.title as string) || "Marcas que representamos"}
            </h2>
          </motion.div>

          <div className="space-y-24">
            {brands.map((brand, index) => (
              <motion.div
                key={brand.id}
                initial={{ opacity: 0, y: 40 }}
                animate={brandsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                    <Image
                      src={brand.image || "/images/site/heaven2.jpg"}
                      alt={brand.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-6 left-6">
                      {brand.logo && (
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        width={120}
                        height={48}
                      />
                    )}
                    </div>
                  </div>
                </div>

                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <h3 className="text-3xl md:text-4xl font-serif font-semibold text-black mb-4">
                    {brand.name}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    {brand.description}
                  </p>
                  <ul className="space-y-3 mb-8">
                    {brand.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-center gap-3 text-gray-700">
                        <span className="w-2 h-2 bg-black rounded-full" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    className="border-black text-black hover:bg-black hover:text-white transition-all duration-300 group"
                    asChild
                  >
                    <Link href="/produtos">
                      Ver Produtos {brand.name}
                      <HiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
                {(partnershipBlock.badge as string) || "Nossas Parcerias"}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-black mb-8 leading-tight">
                {(partnershipBlock.title as string) || "Marcas Parceiras"}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-12">
                {(partnershipBlock.description as string) || "Nossas parcerias exclusivas garantem acesso ao melhor em equipamentos."}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-center justify-items-center">
                <div className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Image
                    src="/images/site/nilo.jpg"
                    alt="Nilo"
                    width={120}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <Image
                    src="/images/site/UKI.jpg"
                    alt="UKI"
                    width={120}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-center">
                  <Image
                    src="/images/site/LogoMarcoboni.png"
                    alt="Marco Boni"
                    width={120}
                    height={48}
                    className="object-contain"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-black text-white">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-6">
              {(ctaBlock.title as string) || "Quer conhecer nossos produtos?"}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              {(ctaBlock.description as string) || "Explore nosso catálogo completo e descubra como as marcas que representamos podem transformar seu salão."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 transition-all duration-300"
                asChild
              >
                <Link href={(ctaBlock.buttonLink as string) || "/produtos"}>
                  {(ctaBlock.buttonText as string) || "Ver Produtos"}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white bg-transparent hover:bg-white/10 transition-all duration-300"
                asChild
              >
                <Link href={(ctaBlock.secondaryLink as string) || "/contato"}>
                  {(ctaBlock.secondaryButtonText as string) || "Falar com Consultor"}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
