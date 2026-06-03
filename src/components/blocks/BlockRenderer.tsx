"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { HiArrowRight, HiPlay, HiChevronLeft, HiChevronRight, HiOutlineShieldCheck, HiOutlineCube, HiOutlineSupport, HiOutlineSparkles, HiOutlineDownload, HiOutlinePhone } from "react-icons/hi";
import { HiOutlineWrenchScrewdriver, HiOutlineClock, HiOutlineCheckCircle } from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STANDARD_PAGE_BANNER_CLASS, limitWords, normalizeHeroCopy } from "@/components/sections/page-banner-styles";

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

interface Block {
  id: string;
  type: string;
  content: Record<string, unknown> | unknown;
  order: number;
  active: boolean;
}

interface BlockRendererProps {
  blocks: Block[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <>
      {blocks
        .filter((block) => block.active)
        .sort((a, b) => a.order - b.order)
        .map((block) => (
          <RenderBlock key={block.id} block={block} />
        ))}
    </>
  );
}

function RenderBlock({ block }: { block: Block }) {
  const content = (block.content || {}) as Record<string, unknown>;
  
  switch (block.type) {
    case "hero-slider":
      return <HeroSliderBlock content={content} />;
    case "hero":
      return <HeroBlock content={content} />;
    case "featured-products":
      return <FeaturedProductsBlock content={content} />;
    case "why-choose-us":
      return <WhyChooseUsBlock content={content} />;
    case "partnership":
      return null;
    case "maintenance-preview":
      return <MaintenancePreviewBlock content={content} />;
    case "catalog-cta":
      return <CatalogCTABlock content={content} />;
    case "text":
      return <TextBlock content={content} />;
    case "gallery":
      return <GalleryBlock content={content} />;
    case "video":
      return <VideoBlock content={content} />;
    case "features":
      return <FeaturesBlock content={content} />;
    case "cta":
      return <CTABlock content={content} />;
    case "cards":
      return <CardsBlock content={content} />;
    case "contact-hero":
      return <ContactHeroBlock content={content} />;
    case "contact-options":
      return <ContactOptionsBlock content={content} />;
    case "contact-info":
      return <ContactInfoBlock content={content} />;
    case "maintenance-hero":
      return <MaintenanceHeroBlock content={content} />;
    case "maintenance-services":
      return <MaintenanceServicesBlock content={content} />;
    case "maintenance-benefits":
      return <MaintenanceBenefitsBlock content={content} />;
    case "maintenance-cta":
      return <MaintenanceCTABlock content={content} />;
    case "maintenance-faq":
      return <MaintenanceFAQBlock content={content} />;
    case "products-hero":
      return <ProductsHeroBlock content={content} />;
    case "products-grid":
      return <ProductsGridBlock content={content} />;
    case "products-cta":
      return <ProductsCTABlock content={content} />;
    case "brands-hero":
      return <BrandsHeroBlock content={content} />;
    case "brands-section":
      return <BrandsSectionBlock content={content} />;
    case "brands-partnership":
      return <BrandsPartnershipBlock content={content} />;
    case "brands-cta":
      return <BrandsCTABlock content={content} />;
    case "about-hero":
      return <AboutHeroBlock content={content} />;
    case "about-mission":
      return <AboutMissionBlock content={content} />;
    case "about-values":
      return <AboutValuesBlock content={content} />;
    case "about-partnership":
      return <AboutPartnershipBlock content={content} />;
    case "about-cta":
      return <AboutCTABlock content={content} />;
    default:
      return null;
  }
}

// Hero Block
function HeroBlock({ content }: { content: Record<string, unknown> }) {
  const align = (content.align as string) || "center";
  const overlay = (content.overlay as number) || 60;

  const alignClass = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  }[align] || "text-center items-center";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {(content.image as string) && (
        <div className="absolute inset-0">
          <Image
            src={content.image as string}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            quality={85}
          />
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: overlay / 100 }}
          />
        </div>
      )}

      <div className={`relative z-10 container mx-auto px-6 lg:px-12 text-white flex flex-col ${alignClass} py-32`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`max-w-4xl ${align === "center" ? "mx-auto" : ""}`}
        >
          {(content.badge as string) && (
            <span className="inline-block px-4 py-1 text-xs uppercase tracking-[0.2em] border border-white/30 text-white/80 mb-6">
              {content.badge as string}
            </span>
          )}

          {(content.subtitle as string) && (
            <p className="text-lg md:text-xl text-gray-300 mb-4">
              {content.subtitle as string}
            </p>
          )}

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-semibold mb-6 leading-tight">
            {content.title as string}
          </h1>

          {(content.description as string) && (
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
              {content.description as string}
            </p>
          )}

          <div className="flex flex-wrap gap-4 justify-center">
            {(content.button1Text as string) && (
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100"
                asChild
              >
                <Link href={(content.button1Link as string) || "#"}>
                  {content.button1Text as string}
                  <HiArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            )}
            {(content.button2Text as string) && (
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white bg-transparent hover:bg-white/10"
                asChild
              >
                <Link href={(content.button2Link as string) || "#"}>
                  <HiPlay className="mr-2 w-5 h-5" />
                  {content.button2Text as string}
                </Link>
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Text Block
function TextBlock({ content }: { content: Record<string, unknown> }) {
  const align = (content.align as string) || "left";
  const background = (content.background as string) || "white";

  const bgClass = {
    white: "bg-white text-gray-900",
    gray: "bg-gray-50 text-gray-900",
    black: "bg-black text-white",
  }[background] || "bg-white text-gray-900";

  const alignClass = {
    left: "text-left",
    center: "text-center mx-auto",
    right: "text-right ml-auto",
  }[align] || "text-left";

  return (
    <section className={`py-24 ${bgClass}`}>
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`max-w-4xl ${alignClass}`}
        >
          {(content.subtitle as string) && (
            <span className={`text-sm uppercase tracking-[0.2em] ${background === "black" ? "text-gray-400" : "text-gray-500"} mb-4 block`}>
              {content.subtitle as string}
            </span>
          )}

          {(content.title as string) && (
            <h2 className="text-4xl md:text-5xl font-serif font-semibold mb-6">
              {content.title as string}
            </h2>
          )}

          {(content.content as string) && (
            <div
              className={`text-lg leading-relaxed ${background === "black" ? "text-gray-300" : "text-gray-600"}`}
              dangerouslySetInnerHTML={{ __html: (content.content as string).replace(/\n/g, "<br/>") }}
            />
          )}
        </motion.div>
      </div>
    </section>
  );
}

// Gallery Block
function GalleryBlock({ content }: { content: Record<string, unknown> }) {
  const images = (content.images as string[]) || [];
  const columns = (content.columns as number) || 3;

  const colsClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  }[columns] || "grid-cols-3";

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        {(content.title as string) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            {(content.subtitle as string) && (
              <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
                {content.subtitle as string}
              </span>
            )}
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black">
              {content.title as string}
            </h2>
          </motion.div>
        )}

        <div className={`grid ${colsClass} gap-4`}>
          {images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative aspect-square bg-gray-100 overflow-hidden group"
            >
              <Image
                src={img}
                alt={`Gallery ${index + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Video Block
function VideoBlock({ content }: { content: Record<string, unknown> }) {
  const url = (content.url as string) || "";
  const autoplay = (content.autoplay as boolean) || false;

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}${autoplay ? "?autoplay=1" : ""}` : url;
    }
    if (url.includes("vimeo.com")) {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}${autoplay ? "?autoplay=1" : ""}` : url;
    }
    return url;
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">
        {(content.title as string) && (
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif font-semibold text-black text-center mb-12"
          >
            {content.title as string}
          </motion.h2>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative aspect-video bg-black overflow-hidden"
        >
          <iframe
            src={getEmbedUrl(url)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </motion.div>
      </div>
    </section>
  );
}

// Features Block
function FeaturesBlock({ content }: { content: Record<string, unknown> }) {
  const items = (content.items as Array<{ icon: string; title: string; description: string }>) || [];
  const columns = (content.columns as number) || 3;

  const colsClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }[columns] || "md:grid-cols-3";

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        {(content.title as string) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            {(content.subtitle as string) && (
              <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
                {content.subtitle as string}
              </span>
            )}
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black">
              {content.title as string}
            </h2>
          </motion.div>
        )}

        <div className={`grid grid-cols-1 ${colsClass} gap-8`}>
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-8 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-black text-white flex items-center justify-center">
                <span className="text-xl">★</span>
              </div>
              <h3 className="text-xl font-serif font-semibold text-black mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Block
function CTABlock({ content }: { content: Record<string, unknown> }) {
  const background = (content.background as string) || "black";

  const bgClass = {
    white: "bg-white text-black",
    gray: "bg-gray-100 text-black",
    black: "bg-black text-white",
  }[background] || "bg-black text-white";

  const btnClass = background === "black"
    ? "bg-white text-black hover:bg-gray-100"
    : "bg-black text-white hover:bg-gray-800";

  return (
    <section className={`py-24 ${bgClass}`}>
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-serif font-semibold mb-6">
            {content.title as string}
          </h2>

          {(content.description as string) && (
            <p className={`text-lg mb-8 ${background === "black" ? "text-gray-400" : "text-gray-600"}`}>
              {content.description as string}
            </p>
          )}

          {(content.buttonText as string) && (
            <Button size="lg" className={btnClass} asChild>
              <Link href={(content.buttonLink as string) || "#"}>
                {content.buttonText as string}
                <HiArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// Cards Block
function CardsBlock({ content }: { content: Record<string, unknown> }) {
  const cards = (content.cards as Array<{ image: string; title: string; description: string; link: string }>) || [];
  const columns = (content.columns as number) || 3;

  const colsClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }[columns] || "md:grid-cols-3";

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">
        {(content.title as string) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            {(content.subtitle as string) && (
              <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
                {content.subtitle as string}
              </span>
            )}
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black">
              {content.title as string}
            </h2>
          </motion.div>
        )}

        <div className={`grid grid-cols-1 ${colsClass} gap-6`}>
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white overflow-hidden group"
            >
              {card.image && (
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-serif font-semibold text-black mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600 mb-4">{card.description}</p>
                {card.link && (
                  <Link
                    href={card.link}
                    className="text-sm font-medium text-black hover:underline inline-flex items-center"
                  >
                    Saiba mais
                    <HiArrowRight className="ml-1 w-3 h-3" />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Hero Slider Block
function HeroSliderBlock({ content }: { content: Record<string, unknown> }) {
  const slides = (content.slides as Array<{
    badge?: string;
    title: string;
    subtitle?: string;
    description?: string;
    image?: string;
    button1Text?: string;
    button1Link?: string;
    button2Text?: string;
    button2Link?: string;
  }>) || [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoplaySpeed = (content.autoplaySpeed as number) || 6000;

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoplaySpeed);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length, autoplaySpeed]);

  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentBanner = slides[currentSlide];
  if (!currentBanner) return null;

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {currentBanner.image && (
            <Image
              src={currentBanner.image}
              alt={currentBanner.title}
              fill
              priority={currentSlide === 0}
              sizes="100vw"
              className="object-cover"
              quality={85}
            />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 container mx-auto px-6 lg:px-12 h-full flex items-center">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`title-${currentSlide}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {currentBanner.subtitle && (
                <h2 className="text-white/60 text-lg md:text-xl font-light tracking-wide mb-2">
                  {currentBanner.subtitle}
                </h2>
              )}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-semibold text-white tracking-tight mb-6">
                {currentBanner.title}
              </h1>
              {currentBanner.description && (
                <p className="text-white/80 text-lg md:text-xl max-w-xl leading-relaxed mb-8">
                  {currentBanner.description}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-4">
            {currentBanner.button1Text && currentBanner.button1Link && (
              <Link href={currentBanner.button1Link}>
                <Button size="lg" className="bg-white text-black hover:bg-gray-100 transition-all duration-300 group px-8">
                  {currentBanner.button1Text}
                  <HiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
            {currentBanner.button2Text && currentBanner.button2Link && (
              <Link href={currentBanner.button2Link}>
                <Button size="lg" variant="outline" className="border-white/80 text-white bg-transparent hover:bg-white hover:text-black transition-all duration-300 group px-8">
                  <HiPlay className="mr-2 w-5 h-5" />
                  {currentBanner.button2Text}
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideChange(index)}
              className={`relative h-1 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-12 bg-white" : "w-6 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// Featured Products Block
function FeaturedProductsBlock({ content }: { content: Record<string, unknown> }) {
  interface Product {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    image: string;
    category: { name: string } | null;
  }

  const [products, setProducts] = useState<Product[]>([]);
  const ref = useRef(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const limit = (content.limit as number) || 10;

  useEffect(() => {
    fetch(`/api/products?featured=true&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch(console.error);
  }, [limit]);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: direction === "left" ? -400 : 400,
        behavior: "smooth",
      });
    }
  };

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
              {(content.subtitle as string) || "Coleção"}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-black">
              {(content.title as string) || "Produtos em Destaque"}
            </h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }} className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={() => scroll("left")} className="w-12 h-12 flex items-center justify-center border border-black/20 hover:bg-black hover:text-white hover:border-black transition-all duration-300">
                <HiChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => scroll("right")} className="w-12 h-12 flex items-center justify-center border border-black/20 hover:bg-black hover:text-white hover:border-black transition-all duration-300">
                <HiChevronRight className="w-5 h-5" />
              </button>
            </div>
            <Link href="/produtos">
              <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white transition-all duration-300 group">
                Ver todos
                <HiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.6, delay: 0.3 }} className="relative">
          <div ref={carouselRef} className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory pr-6 lg:pr-12" style={{ scrollbarWidth: "none" }}>
            {products.map((product, index) => (
              <motion.div key={product.id} initial={{ opacity: 0, x: 50 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 * index }} className="flex-shrink-0 w-[220px] md:w-[260px] snap-start border border-gray-200 bg-white p-3 hover:border-gray-300 transition-colors">
                <Link href={`/produtos/${product.slug}`} className="group block">
                  <div className="relative aspect-square bg-gray-100 mb-5 overflow-hidden">
                    <Image src={product.image || "/images/site/heaven2.jpg"} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute top-4 left-4 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-[11px] uppercase tracking-wider font-medium text-gray-800">
                      {product.category?.name}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-medium text-black mb-1.5 group-hover:text-gray-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                    {stripHtml(product.shortDescription)}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="absolute top-0 right-0 bottom-4 w-24 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}

// Why Choose Us Block
function WhyChooseUsBlock({ content }: { content: Record<string, unknown> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = (content.features as Array<{ icon: string; title: string; description: string }>) || [];
  const stats = (content.stats as Array<{ value: string; label: string }>) || [];

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    shield: HiOutlineShieldCheck,
    cube: HiOutlineCube,
    support: HiOutlineSupport,
    sparkles: HiOutlineSparkles,
  };

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }} className="flex flex-col justify-center">
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4">
              {(content.subtitle as string) || "Por que nos escolher"}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black mb-6 leading-tight">
              {(content.title as string) || "Excelência em cada detalhe"}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {(content.description as string) || ""}
            </p>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              {stats.map((stat, index) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}>
                  <span className="text-4xl font-serif font-semibold text-black">{stat.value}</span>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = iconMap[feature.icon] || HiOutlineSparkles;
              return (
                <motion.div key={feature.title} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 * (index + 1) }} className="group">
                  <div className="p-6 bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 h-full">
                    <div className="w-12 h-12 flex items-center justify-center bg-black text-white mb-5 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-3">{feature.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}


// Maintenance Preview Block
function MaintenancePreviewBlock({ content }: { content: Record<string, unknown> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const services = (content.services as Array<{ icon: string; title: string; description: string }>) || [];

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    wrench: HiOutlineWrenchScrewdriver,
    clock: HiOutlineClock,
    check: HiOutlineCheckCircle,
  };

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }}>
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
              {(content.subtitle as string) || "Suporte Técnico"}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black mb-6 leading-tight">
              {(content.title as string) || "Manutenção"}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {(content.description as string) || ""}
            </p>

            <Link href={(content.buttonLink as string) || "/contato"}>
              <Button size="lg" className="bg-black text-white hover:bg-gray-800 transition-all duration-300 group">
                {(content.buttonText as string) || "Solicitar Manutenção"}
                <HiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          <div className="space-y-6">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon] || HiOutlineWrenchScrewdriver;
              return (
                <motion.div key={service.title} initial={{ opacity: 0, x: 30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 * (index + 1) }} className="flex gap-6 p-6 bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 group">
                  <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-gray-100 group-hover:bg-black group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">{service.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// Catalog CTA Block
function CatalogCTABlock({ content }: { content: Record<string, unknown> }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: email.split("@")[0],
          email,
          phone: "",
          message: "Solicitou o catálogo digital pela Home.",
          source: "Catálogo Home",
        }),
      });
      if (!response.ok) throw new Error("Erro ao enviar");
      setSubmitSuccess(true);
      setEmail("");
    } catch (error) {
      console.error("Error:", error);
      alert("Erro ao enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-12">
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
              {(content.subtitle as string) || "Catálogo Digital"}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black mb-6">
              {(content.title as string) || "Receba nosso catálogo completo"}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {(content.description as string) || ""}
            </p>
          </motion.div>

          {submitSuccess ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gray-50 p-12 text-center max-w-xl mx-auto mb-12">
              <div className="w-16 h-16 mx-auto mb-6 bg-black text-white rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif font-semibold text-black mb-3">Solicitação Enviada.</h3>
              <p className="text-gray-600 mb-6">Você receberá o catálogo digital em seu e-mail em breve.</p>
              <Button onClick={() => setSubmitSuccess(false)} variant="outline" className="border-black text-black hover:bg-black hover:text-white">Voltar</Button>
            </motion.div>
          ) : (
            <>
              <motion.form initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }} onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-12">
                <Input type="email" placeholder="Seu melhor e-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 h-14 px-6 border-gray-200 focus:border-black focus:ring-black" required />
                <Button type="submit" size="lg" className="h-14 px-8 bg-black text-white hover:bg-gray-800 transition-all duration-300 group" disabled={isSubmitting}>
                  <HiOutlineDownload className="mr-2 w-5 h-5" />
                  {isSubmitting ? "Enviando..." : ((content.buttonText as string) || "Receber Catálogo")}
                </Button>
              </motion.form>

              <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.6, delay: 0.3 }} className="flex items-center gap-4 max-w-xl mx-auto mb-12">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-sm">ou</span>
                <div className="flex-1 h-px bg-gray-200" />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.4 }} className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <a href={`tel:${(content.phoneRaw as string) || ""}`} className="flex items-center gap-3 text-gray-600 hover:text-black transition-colors group">
                  <span className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-black group-hover:bg-black group-hover:text-white transition-all duration-300">
                    <HiOutlinePhone className="w-5 h-5" />
                  </span>
                  <div className="text-left">
                    <span className="text-xs text-gray-400 block">Ligue para nós</span>
                    <span className="font-medium">{(content.phone as string) || "(18) 99692-1583"}</span>
                  </div>
                </a>

                <div className="hidden sm:block w-px h-12 bg-gray-200" />

                <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white transition-all duration-300" asChild>
                  <a href={`https://wa.me/${((content.phoneRaw as string) || "").replace(/\D/g, '')}?text=${encodeURIComponent((content.whatsappMessage as string) || "Olá!")}`} target="_blank" rel="noopener noreferrer">
                    {(content.consultorButtonText as string) || "Falar com Consultor"}
                  </a>
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// Contact Hero Block
function ContactHeroBlock({ content }: { content: Record<string, unknown> }) {
  const overlay = typeof content.overlay === "number" ? content.overlay : 60;

  return (
    <section className={`${STANDARD_PAGE_BANNER_CLASS} text-white`}>
      <div className="absolute inset-0">
        <Image
          src={(content.image as string) || "/images/banners/banner-hero3.png"}
          alt={(content.title as string) || "Contato IP3D"}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          quality={90}
        />
        <div className="absolute inset-0 bg-black" style={{ opacity: overlay / 100 }} />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          {(content.badge as string) && (
            <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-blue-400 mb-4">
              <HiOutlinePhone className="w-5 h-5" />
              {content.badge as string}
            </span>
          )}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold mb-6 leading-tight">
            {limitWords((content.title as string) || "Fale com a IP3D", 5)}
          </h1>
          {(content.description as string) ? (
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
              {limitWords(content.description as string, 16)}
            </p>
          ) : (
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
              {limitWords("Tire dúvidas, peça orçamento e fale com nossa equipe sobre peças, componentes e impressão personalizada.", 16)}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// Contact Options Block
function ContactOptionsBlock({ content }: { content: Record<string, unknown> }) {
  const options = (content.options as Array<{
    icon?: string;
    title?: string;
    description?: string;
    action?: string;
  }>) || [];

  const iconMap: Record<string, React.ReactNode> = {
    download: <HiOutlineDownload className="w-6 h-6" />,
    chat: <HiOutlinePhone className="w-6 h-6" />,
    calendar: <HiOutlineDownload className="w-6 h-6" />,
    phone: <HiOutlinePhone className="w-6 h-6" />,
    mail: <HiOutlineDownload className="w-6 h-6" />,
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {options.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start gap-4 p-6 bg-white border border-gray-100 hover:border-black hover:shadow-lg transition-all duration-300 text-left group cursor-pointer"
            >
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-100 group-hover:bg-black group-hover:text-white transition-all duration-300">
                {iconMap[option.icon || "download"]}
              </div>
              <div>
                <h3 className="font-semibold text-black mb-1">{option.title}</h3>
                <p className="text-gray-500 text-sm">{option.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Contact Info Block
function ContactInfoBlock({ content }: { content: Record<string, unknown> }) {
  return (
    <div className="bg-black text-white p-10 lg:p-12 h-full">
      <h2 className="text-2xl font-serif font-semibold mb-8">
        {(content.title as string) || "Informações de Contato"}
      </h2>

      <div className="space-y-8">
        {(content.phone as string) && (
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white/10">
              <HiOutlinePhone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Telefone / WhatsApp</h3>
              <a
                href={`tel:${(content.phoneRaw as string) || ""}`}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {content.phone as string}
              </a>
            </div>
          </div>
        )}

        {(content.email as string) && (
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white/10">
              <HiOutlineDownload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium mb-1">E-mail</h3>
              <a
                href={`mailto:${content.email as string}`}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {content.email as string}
              </a>
            </div>
          </div>
        )}

        {((content.address1 as string) || (content.address2 as string)) && (
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white/10">
              <HiOutlineDownload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium mb-1">Endereço</h3>
              <p className="text-gray-400">
                {(content.address1 as string) && <>{content.address1 as string}<br /></>}
                {content.address2 as string}
              </p>
            </div>
          </div>
        )}
      </div>

      {(content.hours as string) && (
        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="font-medium mb-4">Horário de Atendimento</h3>
          <div className="space-y-2 text-gray-400 text-sm whitespace-pre-line">
            {content.hours as string}
          </div>
        </div>
      )}

      {(content.whatsappButtonText as string) && (
        <div className="mt-12">
          <Button
            size="lg"
            className="w-full bg-white text-black hover:bg-gray-100 transition-all duration-300"
            asChild
          >
            <a
              href={`https://wa.me/${((content.phoneRaw as string) || "").replace(/\D/g, '')}?text=${encodeURIComponent((content.whatsappMessage as string) || "Olá!")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {content.whatsappButtonText as string}
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}

// Maintenance Hero Block
function MaintenanceHeroBlock({ content }: { content: Record<string, unknown> }) {
  return (
    <section className="pt-32 pb-20 bg-black text-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            {(content.badge as string) && (
              <span className="text-sm uppercase tracking-[0.2em] text-gray-400 mb-4 block">{content.badge as string}</span>
            )}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold mb-6 leading-tight">
              {(content.title as string) || "Manutenção"}
            </h1>
            {(content.description as string) && (
              <p className="text-gray-300 text-lg leading-relaxed mb-8">{content.description as string}</p>
            )}
            {(content.buttonText as string) && (
              <Button size="lg" className="bg-white text-black hover:bg-gray-100" asChild>
                <a href={(content.whatsappLink as string) || "#"} target="_blank" rel="noopener noreferrer">
                  <HiOutlinePhone className="mr-2 w-5 h-5" />
                  {content.buttonText as string}
                </a>
              </Button>
            )}
          </motion.div>
          {(content.image as string) && (
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:block">
              <div className="aspect-square relative overflow-hidden">
                <Image src={content.image as string} alt="Manutenção" fill className="object-cover" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

// Maintenance Services Block
function MaintenanceServicesBlock({ content }: { content: Record<string, unknown> }) {
  const services = (content.services as Array<{ icon?: string; title?: string; description?: string; features?: string[] }>) || [];
  const iconMap: Record<string, React.ReactNode> = {
    wrench: <HiOutlineWrenchScrewdriver className="w-7 h-7" />,
    clock: <HiOutlineClock className="w-7 h-7" />,
    check: <HiOutlineCheckCircle className="w-7 h-7" />,
    shield: <HiOutlineShieldCheck className="w-7 h-7" />,
    truck: <HiOutlineDownload className="w-7 h-7" />,
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          {(content.badge as string) && <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">{content.badge as string}</span>}
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black">{(content.title as string) || "Nossos Serviços"}</h2>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-gray-50 p-8 hover:shadow-lg transition-shadow group">
              <div className="w-14 h-14 flex items-center justify-center bg-black text-white mb-6 group-hover:scale-110 transition-transform">
                {iconMap[service.icon || "wrench"]}
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
              {service.features && service.features.length > 0 && (
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                      <HiOutlineCheckCircle className="w-4 h-4 text-black" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Maintenance Benefits Block
function MaintenanceBenefitsBlock({ content }: { content: Record<string, unknown> }) {
  const benefits = (content.benefits as Array<{ icon?: string; title?: string; description?: string }>) || [];
  const iconMap: Record<string, React.ReactNode> = {
    shield: <HiOutlineShieldCheck className="w-8 h-8 text-black" />,
    truck: <HiOutlineDownload className="w-8 h-8 text-black" />,
    clock: <HiOutlineClock className="w-8 h-8 text-black" />,
    check: <HiOutlineCheckCircle className="w-8 h-8 text-black" />,
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            {(content.badge as string) && <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">{content.badge as string}</span>}
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black mb-6">{(content.title as string) || "Por que escolher"}</h2>
            {(content.description as string) && <p className="text-gray-600 text-lg leading-relaxed">{content.description as string}</p>}
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-white p-6 border border-gray-100">
                {iconMap[benefit.icon || "shield"]}
                <h3 className="font-semibold text-black mb-2 mt-4">{benefit.title}</h3>
                <p className="text-gray-500 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Maintenance CTA Block
function MaintenanceCTABlock({ content }: { content: Record<string, unknown> }) {
  return (
    <section className="py-24 bg-black text-white">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-6">{(content.title as string) || "Precisa de suporte?"}</h2>
          {(content.description as string) && <p className="text-gray-400 max-w-2xl mx-auto mb-8">{content.description as string}</p>}
          {(content.buttonText as string) && (
            <Button size="lg" className="bg-white text-black hover:bg-gray-100" asChild>
              <a href={(content.whatsappLink as string) || "#"} target="_blank" rel="noopener noreferrer">{content.buttonText as string}</a>
            </Button>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// Maintenance FAQ Block
function MaintenanceFAQBlock({ content }: { content: Record<string, unknown> }) {
  const faqs = (content.faqs as Array<{ question?: string; answer?: string }>) || [];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          {(content.badge as string) && <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">{content.badge as string}</span>}
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black">{(content.title as string) || "Perguntas Frequentes"}</h2>
        </motion.div>
        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="border-b border-gray-100 pb-6">
              <h3 className="text-lg font-semibold text-black mb-3">{faq.question}</h3>
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Products Hero Block
function ProductsHeroBlock({ content }: { content: Record<string, unknown> }) {
  return (
    <section className="pt-32 pb-16 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-3xl">
          {(content.badge as string) && (
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">{content.badge as string}</span>
          )}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold text-black mb-6">
            {limitWords(normalizeHeroCopy((content.title as string) || "Componentes para impressoras 3D"), 4)}
          </h1>
          {(content.description as string) && (
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">{limitWords(normalizeHeroCopy(content.description as string), 12)}</p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

// Products Grid Block - renderiza produtos baseado no modo configurado
function ProductsGridBlock({ content }: { content: Record<string, unknown> }) {
  const [products, setProducts] = useState<Array<{ id: string; name: string; slug: string; shortDescription: string; image: string; category?: { name: string } }>>([]);
  const [loading, setLoading] = useState(true);

  const mode = (content.mode as string) || "all";
  const selectedCategories = (content.selectedCategories as string[]) || [];
  const selectedProducts = (content.selectedProducts as string[]) || [];
  const limit = (content.limit as number) || null;

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(data => {
      let prods = data.products || [];
      
      if (mode === "categories" && selectedCategories.length > 0) {
        prods = prods.filter((p: { category?: { slug: string }; categories?: Array<{ category: { slug: string } }> }) => {
          const matchesSingle = p.category && selectedCategories.includes(p.category.slug);
          const matchesMultiple = p.categories?.some(pc => selectedCategories.includes(pc.category.slug));
          return matchesSingle || matchesMultiple;
        });
      } else if (mode === "selected" && selectedProducts.length > 0) {
        prods = prods.filter((p: { id: string }) => selectedProducts.includes(p.id));
      }

      if (limit) prods = prods.slice(0, limit);
      setProducts(prods);
    }).finally(() => setLoading(false));
  }, [mode, selectedCategories, selectedProducts, limit]);

  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white border border-gray-200 p-3 animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-6 space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
              <a href={`/produtos/${product.slug}`} className="group block bg-white border border-gray-200 p-3 hover:border-gray-300 transition-colors">
                <div className="relative aspect-square bg-transparent overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-contain p-3 transition-transform duration-700 group-hover:scale-105"
                  />
                  {product.category && (
                    <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs uppercase tracking-wider text-gray-700">{product.category.name}</span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-serif font-medium text-black mb-2 group-hover:text-gray-600 transition-colors">{product.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-1">{stripHtml(product.shortDescription)}</p>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Products CTA Block
function ProductsCTABlock({ content }: { content: Record<string, unknown> }) {
  return (
    <section className="py-24 bg-black text-white">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-6">{(content.title as string) || "Precisa de ajuda?"}</h2>
          {(content.description as string) && <p className="text-gray-400 max-w-2xl mx-auto mb-8">{content.description as string}</p>}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {(content.buttonText as string) && (
              <Button size="lg" className="bg-white text-black hover:bg-gray-100" asChild>
                <a href={(content.whatsappLink as string) || "#"} target="_blank" rel="noopener noreferrer">{content.buttonText as string}</a>
              </Button>
            )}
            {(content.secondaryButtonText as string) && (
              <Button size="lg" variant="outline" className="border-white/30 text-white bg-transparent hover:bg-white/10" asChild>
                <a href={(content.secondaryLink as string) || "#"}>{content.secondaryButtonText as string}</a>
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Brands Hero Block
function BrandsHeroBlock({ content }: { content: Record<string, unknown> }) {
  const titleParts = ((content.title as string) || "Excelência|em cada|detalhe").split("|");
  return (
    <section className="pt-32 pb-20 lg:pb-32 bg-black text-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-sm uppercase tracking-[0.2em] text-gray-400 mb-4 block">
              {(content.badge as string) || "Nossas Marcas"}
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold mb-6 leading-tight">
              {titleParts.map((part, i) => <span key={i}>{part}{i < titleParts.length - 1 && <br />}</span>)}
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              {(content.description as string) || "Trabalhamos com as marcas mais prestigiadas do mercado mundial de mobiliário para salões de beleza e spas."}
            </p>
            {(content.buttonText as string) && (
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 transition-all duration-300 group" asChild>
                <Link href={(content.buttonLink as string) || "/produtos"}>
                  {content.buttonText as string}
                  <HiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:block">
            <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden flex items-center justify-center">
              <Image src="/images/Captura_de_tela_2026-02-28_210120-removebg-preview.webp" alt="Logo" width={280} height={112} className="object-contain brightness-0 invert" />
              <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-white/20" />
              <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-white/20" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Brands Section Block
function BrandsSectionBlock({ content }: { content: Record<string, unknown> }) {
  const [brands, setBrands] = useState<Array<{ id: string; name: string; slug: string; description: string | null; logo: string | null; image: string | null; highlights: string[] }>>([]);
  
  useEffect(() => {
    fetch("/api/brands").then(r => r.json()).then(data => setBrands(data.brands || [])).catch(console.error);
  }, []);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">{(content.badge as string) || "Portfólio"}</span>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black">{(content.title as string) || "Marcas que representamos"}</h2>
        </motion.div>
        <div className="space-y-24">
          {brands.map((brand, index) => (
            <motion.div key={brand.id} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}>
              <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                  <Image src={brand.image || "/images/site/heaven2.jpg"} alt={brand.name} fill className="object-cover" />
                  {brand.logo && <div className="absolute bottom-6 left-6"><Image src={brand.logo} alt={brand.name} width={120} height={48} /></div>}
                </div>
              </div>
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <h3 className="text-3xl md:text-4xl font-serif font-semibold text-black mb-4">{brand.name}</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">{brand.description}</p>
                <ul className="space-y-3 mb-8">
                  {brand.highlights.map((highlight) => <li key={highlight} className="flex items-center gap-3 text-gray-700"><span className="w-2 h-2 bg-black rounded-full" />{highlight}</li>)}
                </ul>
                <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white transition-all duration-300 group" asChild>
                  <Link href="/produtos">Ver Produtos {brand.name}<HiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Brands Partnership Block
function BrandsPartnershipBlock({ content }: { content: Record<string, unknown> }) {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">{(content.badge as string) || "Nossas Parcerias"}</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-black mb-8 leading-tight">{(content.title as string) || "Marcas Parceiras"}</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-12">{(content.description as string) || "Nossas parcerias garantem acesso ao melhor do mercado."}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
              <div className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"><Image src="/images/site/UKI.jpg" alt="UKI" width={120} height={48} className="object-contain" /></div>
              <div className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-center"><Image src="/images/site/LogoMarcoboni.png" alt="Marco Boni" width={120} height={48} className="object-contain" /></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Brands CTA Block
function BrandsCTABlock({ content }: { content: Record<string, unknown> }) {
  return (
    <section className="py-24 bg-black text-white">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-6">{(content.title as string) || "Quer conhecer nossos produtos?"}</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">{(content.description as string) || "Explore nosso catálogo completo e descubra como as marcas que representamos podem transformar seu salão."}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {(content.buttonText as string) && (
              <Button size="lg" className="bg-white text-black hover:bg-gray-100 transition-all duration-300" asChild>
                <Link href={(content.buttonLink as string) || "/produtos"}>{content.buttonText as string}</Link>
              </Button>
            )}
            {(content.secondaryButtonText as string) && (
              <Button size="lg" variant="outline" className="border-white/30 text-white bg-transparent hover:bg-white/10 transition-all duration-300" asChild>
                <Link href={(content.secondaryLink as string) || "/contato"}>{content.secondaryButtonText as string}</Link>
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// About Hero Block
function AboutHeroBlock({ content }: { content: Record<string, unknown> }) {
  const titleParts = normalizeHeroCopy((content.title as string) || "Especialistas em|impressão 3D")
    .split("|")
    .slice(0, 2)
    .map((part) => limitWords(part, 2));
  return (
    <section className={`${STANDARD_PAGE_BANNER_CLASS} bg-white`}>
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">{limitWords((content.badge as string) || "Conheça a IP3D", 4)}</span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold text-black mb-6 leading-tight">
              {titleParts.map((part, i) => <span key={i}>{part}{i < titleParts.length - 1 && <br />}</span>)}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-2xl">{limitWords(normalizeHeroCopy((content.description as string) || "Peças, componentes e impressão 3D com suporte técnico para projetos sob medida."), 12)}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              {(content.buttonText as string) && (
                <Button size="lg" className="bg-black text-white hover:bg-gray-800 transition-all duration-300 group" asChild>
                  <Link href={(content.buttonLink as string) || "/produtos"}>{content.buttonText as string}<HiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
                </Button>
              )}
              {(content.secondaryButtonText as string) && (
                <Button size="lg" variant="outline" className="border-black text-black hover:bg-black hover:text-white transition-all duration-300" asChild>
                  <Link href={(content.secondaryLink as string) || "/contato"}>{content.secondaryButtonText as string}</Link>
                </Button>
              )}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <div className="aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
              {(content.image as string) && (
                <Image src={content.image as string} alt="Showroom" fill className="object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <Image src="/images/Captura_de_tela_2026-02-28_210120-removebg-preview.webp" alt="Logo" width={100} height={40} className="mb-3 object-contain brightness-0 invert" />
                
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-white/30" />
            </div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="absolute -bottom-8 -right-8 bg-black text-white p-8 shadow-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div><span className="text-3xl font-serif font-bold">{(content.stat1Value as string) || "10+"}</span><p className="text-xs text-gray-400 mt-1">{(content.stat1Label as string) || "Anos de mercado"}</p></div>
                <div><span className="text-3xl font-serif font-bold">{(content.stat2Value as string) || "500+"}</span><p className="text-xs text-gray-400 mt-1">{(content.stat2Label as string) || "Clientes"}</p></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// About Mission Block
function AboutMissionBlock({ content }: { content: Record<string, unknown> }) {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">{(content.badge as string) || "Nossa Missão"}</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-black mb-8 leading-tight">
              &ldquo;{(content.quote as string) || "Transformar salões de beleza em espaços de excelência, proporcionando aos profissionais as melhores ferramentas para encantar seus clientes."}&rdquo;
            </h2>
            <p className="text-gray-600 text-lg">{(content.author as string) || "— Nossa Equipe"}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// About Values Block
function AboutValuesBlock({ content }: { content: Record<string, unknown> }) {
  const values = (content.values as Array<{ title: string; description: string }>) || [
    { title: "Excelência", description: "Buscamos a perfeição em cada detalhe, desde o atendimento até a entrega final." },
    { title: "Confiança", description: "Construímos relacionamentos duradouros baseados em transparência e honestidade." },
    { title: "Inovação", description: "Trazemos as últimas tendências e tecnologias do mercado internacional." },
    { title: "Parceria", description: "Trabalhamos lado a lado com nossos clientes para alcançar seus objetivos." },
  ];
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">{(content.badge as string) || "Nossos Valores"}</span>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black">{(content.title as string) || "O que nos guia"}</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div key={value.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-gray-100 group-hover:bg-black group-hover:text-white transition-all duration-300">
                <HiOutlineSparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">{value.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// About Partnership Block
function AboutPartnershipBlock({ content }: { content: Record<string, unknown> }) {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">{(content.badge as string) || "Parceria Exclusiva"}</span>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black mb-6">{(content.title as string) || "Nossa História"}</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">{(content.description1 as string) || ""}</p>
            <p className="text-gray-600 leading-relaxed mb-8">{(content.description2 as string) || ""}</p>
            {(content.buttonText as string) && (
              <Button size="lg" className="bg-black text-white hover:bg-gray-800 transition-all duration-300 group" asChild>
                <Link href={(content.buttonLink as string) || "/produtos"}>{content.buttonText as string}<HiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
              </Button>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <div className="aspect-square bg-black relative overflow-hidden">
              <Image src="/images/site/heaven2.jpg" alt="Produto" fill className="object-cover opacity-60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                
                <p className="text-white/70 text-sm tracking-widest">SINCE 1965</p>
              </div>
              <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-white/20" />
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }} className="absolute -bottom-6 -right-6 bg-white text-black p-6 shadow-2xl">
              <span className="text-3xl font-serif font-bold">{(content.yearsBadge as string) || "55+"}</span>
              <p className="text-xs text-gray-500 mt-1">{(content.yearsBadgeLabel as string) || "Anos de história"}</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// About CTA Block
function AboutCTABlock({ content }: { content: Record<string, unknown> }) {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-black mb-6">{(content.title as string) || "Pronto para transformar seu salão?"}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">{(content.description as string) || "Entre em contato conosco e descubra como nossos produtos podem elevar o padrão do seu negócio."}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {(content.buttonText as string) && (
              <Button size="lg" className="bg-black text-white hover:bg-gray-800 transition-all duration-300" asChild>
                <Link href={(content.buttonLink as string) || "/contato"}>{content.buttonText as string}</Link>
              </Button>
            )}
            {(content.secondaryButtonText as string) && (
              <Button size="lg" variant="outline" className="border-black text-black hover:bg-black hover:text-white transition-all duration-300" asChild>
                <a href={(content.secondaryLink as string) || "#"} target="_blank" rel="noopener noreferrer">{content.secondaryButtonText as string}</a>
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
