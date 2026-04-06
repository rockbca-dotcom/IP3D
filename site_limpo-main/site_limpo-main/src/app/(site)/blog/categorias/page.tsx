"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { HiArrowRight, HiOutlineBookOpen } from "react-icons/hi";

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  _count: { posts: number };
}

export default function BlogCategoriasPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const gridRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const gridInView = useInView(gridRef, { once: true, margin: "-50px" });

  useEffect(() => {
    fetch("/api/blog/categories")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Cores para os cards caso a categoria não tenha cor definida
  const fallbackColors = [
    "from-gray-900 to-gray-700",
    "from-stone-800 to-stone-600",
    "from-zinc-900 to-zinc-700",
    "from-neutral-800 to-neutral-600",
    "from-slate-800 to-slate-600",
    "from-gray-800 to-gray-500",
  ];

  return (
    <>
      {/* Hero */}
      <section ref={heroRef} className="pt-32 pb-16 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
              Blog
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold text-black mb-6">
              Categorias
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Explore nossos conteúdos organizados por tema. Tendências,
              tecnologia, design e muito mais para o mercado de beleza e
              bem-estar.
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
                  className="aspect-[3/2] bg-gray-100 animate-pulse rounded-sm"
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <HiOutlineBookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Nenhuma categoria encontrada.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={gridInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    href={`/blog?categoria=${category.slug}`}
                    className="group block"
                  >
                    <div
                      className={`relative aspect-[3/2] overflow-hidden bg-gradient-to-br ${
                        fallbackColors[index % fallbackColors.length]
                      } p-8 flex flex-col justify-between transition-transform duration-500 group-hover:scale-[1.02]`}
                      style={
                        category.color
                          ? {
                              background: `linear-gradient(135deg, ${category.color}, ${category.color}88)`,
                            }
                          : undefined
                      }
                    >
                      <div>
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.15)",
                          }}
                        >
                          <HiOutlineBookOpen className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-white text-2xl font-serif font-semibold mb-2">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-white/70 text-sm line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">
                          {category._count.posts} artigo
                          {category._count.posts !== 1 ? "s" : ""}
                        </span>
                        <span className="inline-flex items-center text-sm font-medium text-white group-hover:translate-x-1 transition-transform">
                          Ver artigos
                          <HiArrowRight className="ml-1 w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-black mb-6">
              Explore todos os artigos
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto mb-8">
              Confira todas as publicações do nosso blog e fique por dentro das
              últimas novidades do mercado de beleza.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center px-8 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors group"
            >
              Ver Todos os Artigos
              <HiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
