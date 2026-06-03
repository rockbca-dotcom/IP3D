"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HiArrowRight, HiPlay } from "react-icons/hi";
import Link from "next/link";
import Image from "next/image";
import { STANDARD_HOME_BANNER_CLASS } from "./page-banner-styles";

interface Banner {
  id: string;
  badge: string | null;
  subtitle: string | null;
  title: string;
  description: string | null;
  image: string | null;
  video: string | null;
  button1Text: string | null;
  button1Link: string | null;
  button1Color: string | null;
  button2Text: string | null;
  button2Link: string | null;
  button2Color: string | null;
}

const fallbackSlides: Banner[] = [
  {
    id: "1",
    badge: null,
    title: "Seus Produtos",
    subtitle: "Qualidade e inovação em cada detalhe",
    description: "Conheça nossa linha completa de produtos com a excelência que você merece.",
    image: "/images/hero/1.jpg",
    video: null,
    button1Text: "Conhecer Produtos",
    button1Link: "/produtos",
    button1Color: "white",
    button2Text: "Assistir Vídeo",
    button2Link: "#video",
    button2Color: "outline",
  },
  {
    id: "2",
    badge: null,
    title: "Nilo",
    subtitle: "O design a serviço do bem-estar",
    description: "Referência global em mobiliário de luxo para SPAs, hotéis e clínicas de estética. Soluções que transformam tratamentos em experiências sensoriais completas.",
    image: "/images/hero/2.jpg",
    video: null,
    button1Text: "Conhecer Produtos",
    button1Link: "/produtos",
    button1Color: "white",
    button2Text: null,
    button2Link: null,
    button2Color: null,
  },
  {
    id: "3",
    badge: null,
    title: "UKI",
    subtitle: "Inovação e estilo com a autêntica assinatura italiana",
    description: "A UKI International une moda e tecnologia para traduzir o \"Italian Sense of Beauty\" em equipamentos de alta performance.",
    image: "/images/hero/3.jpg",
    video: null,
    button1Text: "Conhecer Produtos",
    button1Link: "/produtos",
    button1Color: "white",
    button2Text: null,
    button2Link: null,
    button2Color: null,
  },
  {
    id: "4",
    badge: null,
    title: "Marco Boni",
    subtitle: "Excelência e precisão em cada detalhe",
    description: "Seleção exclusiva da linha profissional Marco Boni, essencial para o acabamento perfeito. Hair design e cuidados pessoais com alta durabilidade.",
    image: "/images/site/Shirobody_showroom.jpg",
    video: null,
    button1Text: "Conhecer Produtos",
    button1Link: "/produtos",
    button1Color: "white",
    button2Text: null,
    button2Link: null,
    button2Color: null,
  },
];

export function Hero() {
  const [slides, setSlides] = useState<Banner[]>(fallbackSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    fetch("/api/banners")
      .then((res) => res.json())
      .then((data) => {
        if (data.banners && data.banners.length > 0) {
          setSlides(data.banners);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentBanner = slides[currentSlide];

  if (!currentBanner) return null;

  return (
    <section className={STANDARD_HOME_BANNER_CLASS}>
      {/* Background Slides */}
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

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 lg:px-12 h-full flex items-center">
        <div className="max-w-3xl">
         

          {/* Title */}
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

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {currentBanner.button1Text && currentBanner.button1Link && (
              <Link href={currentBanner.button1Link}>
                <Button
                  size="lg"
                  className={`transition-all duration-300 group px-8 ${
                    currentBanner.button1Color === "white"
                      ? "bg-white text-black hover:bg-gray-100"
                      : currentBanner.button1Color === "black"
                      ? "bg-black text-white hover:bg-gray-900 border border-white"
                      : "border-white/80 text-white bg-transparent hover:bg-white hover:text-black"
                  }`}
                >
                  {currentBanner.button1Text}
                  <HiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
            {currentBanner.button2Text && currentBanner.button2Link && (
              <Link href={currentBanner.button2Link}>
                <Button
                  size="lg"
                  variant="outline"
                  className={`transition-all duration-300 group px-8 ${
                    currentBanner.button2Color === "white"
                      ? "bg-white text-black hover:bg-gray-100 border-white"
                      : currentBanner.button2Color === "black"
                      ? "bg-black text-white hover:bg-gray-900 border-white"
                      : "border-white/80 text-white bg-transparent hover:bg-white hover:text-black"
                  }`}
                >
                  <HiPlay className="mr-2 w-5 h-5" />
                  {currentBanner.button2Text}
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => handleSlideChange(index)}
              className={`relative h-1 rounded-full transition-all duration-300 ${
                index === currentSlide ? "w-12 bg-white" : "w-6 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            >
              {index === currentSlide && (
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 6, ease: "linear" }}
                  className="absolute inset-0 bg-white/50 rounded-full origin-left"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Slide Counter */}
      {slides.length > 1 && (
        <div className="absolute bottom-12 right-12 z-20 hidden lg:flex items-center gap-4 text-white">
          <span className="text-4xl font-bold">
            {String(currentSlide + 1).padStart(2, "0")}
          </span>
          <span className="text-white/40">/</span>
          <span className="text-white/40">
            {String(slides.length).padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-12 left-12 z-20 hidden lg:flex flex-col items-center gap-2"
      >
        <span className="text-white/60 text-xs tracking-widest uppercase rotate-90 origin-center translate-y-8">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-[1px] h-12 bg-gradient-to-b from-white/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
