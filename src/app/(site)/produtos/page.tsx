"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { HiArrowRight, HiOutlineViewGrid, HiOutlineViewList, HiOutlineSearch, HiX } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/site/ProductCard";
import { PageHero } from "@/components/sections";

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductCategory {
  category: Category;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  image: string;
  gallery?: string[];
  category: Category | null;
  categories?: ProductCategory[];
  priceOriginal?: number | null;
  pricePromo?: number | null;
  pixPrice?: number | null;
  stockQuantity?: number | null;
}

interface PageBlock {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  active: boolean;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const buscaParam = searchParams.get("busca") || "";
  const categoriaParam = searchParams.get("categoria") || null;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoriaParam);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortMode, setSortMode] = useState<string>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState(buscaParam);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const [debouncedSearch, setDebouncedSearch] = useState(buscaParam);
  const [initialLoad, setInitialLoad] = useState(true);

  const heroBlock = blocks.find(b => b.type === "products-hero")?.content || {};
  const ctaBlock = blocks.find(b => b.type === "products-cta")?.content || {};

  useEffect(() => {
    queueMicrotask(() => {
      setSearchQuery(buscaParam);
      setDebouncedSearch(buscaParam);
    });
  }, [buscaParam]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => (r.ok ? r.json() : { categories: [] })),
      fetch("/api/pages/produtos").then((r) => (r.ok ? r.json() : { page: { blocks: [] } })),
    ])
      .then(([catData, pageData]) => {
        setCategories(catData.categories || []);
        setBlocks(pageData.page?.blocks || []);
      })
      .catch(() => {
        setCategories([]);
        setBlocks([]);
      });
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    const frame = requestAnimationFrame(() => {
      setLoading(true);
      setError(false);
    });

    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", "9");
    params.set("sort", sortMode);
    if (selectedCategory && !debouncedSearch.trim()) params.set("category", selectedCategory);
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

    fetch(`/api/products?${params.toString()}`, { signal: abortController.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("products-unavailable"))))
      .then((payload) => {
        if (!abortController.signal.aborted) {
          // A API suporta o wrapper { success: true, data: { items, pagination } }
          const items = payload.data?.items || payload.products || [];
          const pagination = payload.data?.pagination || payload.pagination || {};
          
          setProducts(items);
          setTotalPages(pagination.totalPages || 1);
          setTotalProducts(pagination.total || 0);
          setInitialLoad(false);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(true);
        setInitialLoad(false);
        setLoading(false);
      });

    return () => {
      cancelAnimationFrame(frame);
      if (!initialLoad) abortController.abort();
    };
  }, [currentPage, selectedCategory, debouncedSearch, sortMode, initialLoad]);

  return (
    <>
      <section className="pb-16 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
              {(heroBlock.badge as string) || "Catálogo"}
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6">
              {(heroBlock.title as string) || "Nossos Produtos"}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {(heroBlock.description as string) || "Peças e componentes de alta qualidade para impressoras 3D. Acesso exclusivo e confiável às melhores marcas do mercado."}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 bg-white border-y border-gray-100">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-64">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // reset page on search
                  }}
                  placeholder="Buscar produtos..."
                  className="w-full pl-10 pr-8 py-2 text-sm border border-gray-200 focus:border-black outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Limpar busca"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => { setSelectedCategory(null); setCurrentPage(1); }}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    selectedCategory === null
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Todos
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => { setSelectedCategory(category.slug); setCurrentPage(1); }}
                    className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      selectedCategory === category.slug
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <select
                value={sortMode}
                onChange={(e) => { setSortMode(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 text-sm border border-gray-200 outline-none hover:border-black transition-colors"
                aria-label="Ordenar produtos"
              >
                <option value="newest">Mais recentes</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
                <option value="name_asc">Nome (A-Z)</option>
              </select>

              <div className="flex items-center border border-gray-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${
                    viewMode === "grid" ? "bg-black text-white" : "text-gray-500 hover:text-black"
                  }`}
                  aria-label="Visualização em grade"
                >
                  <HiOutlineViewGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${
                    viewMode === "list" ? "bg-black text-white" : "text-gray-500 hover:text-black"
                  }`}
                  aria-label="Visualização em lista"
                >
                  <HiOutlineViewList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={ref} className="py-16 lg:py-24 bg-white min-h-[50vh]">
        <div className="container mx-auto px-6 lg:px-12">
          
          {error && !loading && (
            <div className="text-center py-20 bg-red-50 text-red-600 rounded-2xl border border-red-100" data-testid="error-state">
              <h2 className="text-2xl font-bold mb-4">Ops! Ocorreu um problema.</h2>
              <p className="mb-6">Não foi possível carregar o catálogo de produtos no momento.</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Tentar Novamente
              </Button>
            </div>
          )}

          {!error && !loading && products.length === 0 && (
            <div className="text-center py-20 bg-gray-50 text-gray-500 rounded-2xl border border-gray-100" data-testid="empty-state">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900">Nenhum produto encontrado.</h2>
              <p className="mb-6">Tente ajustar seus filtros ou remover o termo de busca.</p>
              <Button onClick={() => { setSearchQuery(""); setSelectedCategory(null); setCurrentPage(1); }} variant="outline" className="bg-white">
                Limpar Filtros
              </Button>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="loading-state">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
                  <div className="h-60 w-full bg-gray-200 rounded" />
                  <div className="mt-4 h-4 w-24 bg-gray-200 rounded" />
                  <div className="mt-3 h-5 w-full bg-gray-200 rounded" />
                  <div className="mt-2 h-5 w-2/3 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          )}

          {!error && !loading && products.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="product-grid">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}

          {!error && !loading && products.length > 0 && viewMode === "list" && (
            <div className="space-y-6" data-testid="product-list">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    href={`/produtos/${product.slug}`}
                    className="group flex flex-col md:flex-row gap-6 bg-white p-6 border border-gray-200 hover:border-gray-300 transition-colors"
                  >
                    <div className="relative w-full md:w-64 aspect-square md:aspect-auto md:h-48 bg-white overflow-hidden flex-shrink-0">
                      <Image
                        src={product.image || "/images/products/components-placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 256px"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                      <span className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                        {product.categories && product.categories.length > 0 
                          ? product.categories[0].category.name
                          : product.category?.name}
                      </span>
                      <h3 className="text-2xl font-semibold text-black mb-3 group-hover:text-gray-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 leading-relaxed mb-2 line-clamp-3">
                        {stripHtml(product.shortDescription)}
                      </p>
                      <div className="text-lg font-semibold text-black mb-4">
                        {product.pricePromo ?? product.priceOriginal
                          ? (product.pricePromo ?? product.priceOriginal)?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                          : "Sob consulta"}
                      </div>
                      <span className="inline-flex items-center text-sm font-medium text-black group-hover:text-gray-600 transition-colors">
                        Ver detalhes
                        <HiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {!error && !loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12" data-testid="pagination-controls">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border border-gray-200 hover:border-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 text-sm transition-colors ${
                    currentPage === page
                      ? "bg-black text-white"
                      : "border border-gray-200 hover:border-black"
                  }`}
                  aria-label={`Página ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm border border-gray-200 hover:border-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
              </button>
            </div>
          )}
          
          {!error && !loading && (
            <p className="text-center text-sm text-gray-500 mt-8">
              Mostrando {products.length} de {totalProducts} produtos
            </p>
          )}

        </div>
      </section>

      <section className="py-24 bg-black text-white">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-semibold mb-6">
              {(ctaBlock.title as string) || "Dúvidas sobre compatibilidade?"}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              {(ctaBlock.description as string) || "Nossa equipe técnica está pronta para ajudar."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100" asChild>
                <a href={(ctaBlock.whatsappLink as string) || "#"} target="_blank" rel="noopener noreferrer">
                  {(ctaBlock.buttonText as string) || "Falar com Suporte"}
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

export default function ProductsPage() {
  return (
    <>
      <PageHero
        label="Produtos para Impressão 3D"
        title="Peças, componentes e acessórios"
        titleHighlight="para sua impressora 3D"
        description="Encontre hotends, bicos, termistores, mesas PEI, componentes Bambu Lab, Creality e soluções para manter sua impressora operando com precisão."
        buttons={[
          { text: "Ver produtos", href: "#produtos" },
          { text: "Falar com especialista", href: "https://wa.me/018996921583", variant: "outline" },
        ]}
      />
    <Suspense fallback={
      <div className=" pb-16 bg-white min-h-screen">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-16 bg-gray-200 rounded w-96 mb-6"></div>
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
    </>
  );
}
