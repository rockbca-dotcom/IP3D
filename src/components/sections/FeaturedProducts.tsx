"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { HiArrowRight, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { Button } from "@/components/ui/button";

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  image: string;
  category: {
    name: string;
  } | null;
  brands: {
    brand: {
      slug: string;
    };
  }[];
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const ref = useRef(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    fetch("/api/products?featured=true")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch(console.error);
  }, []);

  const checkScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 400;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
              Coleção
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-black">
              Produtos em Destaque
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center gap-4"
          >
            {/* Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className={`w-12 h-12 flex items-center justify-center border border-black/20 transition-all duration-300 ${
                  canScrollLeft 
                    ? "hover:bg-black hover:text-white hover:border-black" 
                    : "opacity-30 cursor-not-allowed"
                }`}
              >
                <HiChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className={`w-12 h-12 flex items-center justify-center border border-black/20 transition-all duration-300 ${
                  canScrollRight 
                    ? "hover:bg-black hover:text-white hover:border-black" 
                    : "opacity-30 cursor-not-allowed"
                }`}
              >
                <HiChevronRight className="w-5 h-5" />
              </button>
            </div>

            <Link href="/produtos">
              <Button
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white transition-all duration-300 group"
              >
                Ver todos
                <HiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Netflix-style Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative"
        >
          <div
            ref={carouselRef}
            onScroll={checkScrollButtons}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory pr-6 lg:pr-12"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="flex-shrink-0 w-[220px] md:w-[260px] snap-start border border-gray-200 bg-white p-3 hover:border-gray-300 transition-colors"
              >
                <Link href={`/produtos/${product.slug}`} className="group block">
                  {/* Image Container */}
                  <div className="relative aspect-square bg-transparent mb-5 overflow-hidden">
                    <Image
                      src={product.image || "/images/site/heaven2.jpg"}
                      alt={product.name}
                      fill
                      className="object-contain p-3 transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Category Badge */}
                    <span className="absolute top-4 left-4 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-[11px] uppercase tracking-wider font-medium text-gray-800">
                      {product.category?.name}
                    </span>

                    
                    {/* Hover Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <span className="inline-flex items-center text-sm font-medium text-white">
                        Ver produto
                        <HiArrowRight className="ml-2 w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Content */}
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

          {/* Gradient Edge - only right side */}
          <div className="absolute top-0 right-0 bottom-4 w-24 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}
