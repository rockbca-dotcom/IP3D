"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { HiArrowRight, HiOutlineCollection } from "react-icons/hi";
import { STANDARD_PAGE_BANNER_CLASS } from "@/components/sections/page-banner-styles";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count: { products: number; productCategories: number };
  children: { id: string; name: string; slug: string; image: string | null }[];
  parentId: string | null;
}

const categoryCardImageFallbacks: Record<string, string> = {
  "componentes-bambu-lab": "/images/categories/componentes-bambu-lab.svg",
  "componentes-creality": "/images/categories/componentes-creality.svg",
  "componentes-universais": "/images/categories/componentes-universais.svg",
  "impressoras-3d": "/images/categories/impressoras-3d.svg",
  personalizados: "/images/categories/personalizados.svg",
};

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const gridInView = useInView(gridRef, { once: true, margin: "-50px" });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        // Filtrar apenas categorias raiz (sem parentId)
        const rootCategories = (data.categories || []).filter(
          (c: Category) => !c.parentId
        );
        setCategories(rootCategories);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getProductCount = (cat: Category) => {
    return cat._count.products + cat._count.productCategories;
  };

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} className={`${STANDARD_PAGE_BANNER_CLASS} bg-white`}>
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
              Categorias
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold text-black mb-6">
              Explore por Categoria
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Componentes de reposição, impressoras e produtos personalizados —
              encontre exatamente o que você precisa para manter sua produção
              em alta performance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section ref={gridRef} className="py-16 pb-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <HiOutlineCollection className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Nenhuma categoria encontrada.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => {
                const categoryImage = category.image || categoryCardImageFallbacks[category.slug];

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={gridInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link
                      href={`/produtos?categoria=${category.slug}`}
                      className="group block"
                    >
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden mb-4">
                        {categoryImage ? (
                          <Image
                            src={categoryImage}
                            alt={category.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <HiOutlineCollection className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                          <h3 className="text-white text-xl font-serif font-semibold">
                            {category.name}
                          </h3>
                          <span className="text-white/70 text-sm">
                            {getProductCount(category)} produto
                            {getProductCount(category) !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      {category.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                          {category.description}
                        </p>
                      )}
                      <span className="inline-flex items-center text-sm font-medium text-black group-hover:text-gray-600 transition-colors">
                        Ver produtos
                        <HiArrowRight className="ml-1 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Link>

                    {/* Subcategorias */}
                    {category.children && category.children.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {category.children.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/produtos?categoria=${sub.slug}`}
                            className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 hover:bg-black hover:text-white transition-colors duration-300"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-6">
              Não encontrou o que procura?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Veja todos os nossos produtos ou fale com um especialista IP3D
              para encontrar a solução ideal para sua impressora 3D.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/produtos"
                className="px-8 py-3 bg-white text-black font-medium hover:bg-gray-100 transition-colors"
              >
                Ver Todos os Produtos
              </Link>
              <Link
                href="/contato"
                className="px-8 py-3 border border-white/30 text-white hover:bg-white/10 transition-colors"
              >
                Falar com Especialista
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
