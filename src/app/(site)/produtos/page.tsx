"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { HiArrowRight, HiOutlineViewGrid, HiOutlineViewList, HiOutlineSearch, HiX } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/site/ProductCard";

// Função para limpar tags HTML
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
}

interface PageBlock {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  active: boolean;
}

const fallbackCategories: Category[] = [
  { id: "componentes-bambu-lab", name: "Componentes Bambu Lab", slug: "componentes-bambu-lab" },
  { id: "componentes-creality", name: "Componentes Creality", slug: "componentes-creality" },
  { id: "componentes-universais", name: "Componentes Universais", slug: "componentes-universais" },
  { id: "impressoras-3d", name: "Impressões 3D", slug: "impressoras-3d" },
  { id: "personalizados", name: "Personalizados", slug: "personalizados" },
];

const fallbackProducts: Product[] = [
  {
    id: "fallback-hotend-creality-ender-3-v2",
    name: "Kit Hotend Completo Creality Ender 3 / Pro / V2 24V",
    slug: "kit-hotend-completo-creality-ender-3-pro-v2-24v-nozzle-cortesia",
    shortDescription: "Kit hotend completo 24V para Ender 3 / Pro / V2 com nozzle de cortesia, cabo de 1 metro e instalação prática.",
    image: "https://http2.mlstatic.com/D_Q_NP_607343-MLA110079794477_042026-F.webp",
    gallery: [
      "https://http2.mlstatic.com/D_Q_NP_607343-MLA110079794477_042026-F.webp",
      "https://http2.mlstatic.com/D_Q_NP_656866-MLA110079853361_042026-F.webp",
      "https://http2.mlstatic.com/D_Q_NP_826407-MLA109232233940_042026-F.webp"
    ],
    category: { id: "componentes-creality", name: "Componentes Creality", slug: "componentes-creality" },
    priceOriginal: 129.9,
    pricePromo: 119.99,
    pixPrice: 119.99,
  },
  {
    id: "fallback-hotend-bambu-a1",
    name: "Hotend Bambu Lab A1 Mini",
    slug: "hotend-bambu-lab-a1-mini",
    shortDescription: "Reposição premium para impressão com precisão e consistência.",
    image: "/uploads/products/bico-nozzle-aco-endurecido-bambu-lab-a1.jpg",
    category: { id: "componentes-bambu-lab", name: "Componentes Bambu Lab", slug: "componentes-bambu-lab" },
    priceOriginal: 199.9,
    pricePromo: 179.9,
    pixPrice: 169.9,
  },
  {
    id: "fallback-silicone-creality-k1-max",
    name: "Capa De Silicone Blue Makers Creality",
    slug: "capa-de-silicone-blue-makers-creality-k1-max-antiaderente-300c",
    shortDescription: "Capa antiaderente em silicone para Creality K1 / K1 Max com resistência térmica de até 300°C.",
    image: "https://http2.mlstatic.com/D_Q_NP_770204-MLA100095605391_122025-F.webp",
    gallery: [
      "https://http2.mlstatic.com/D_Q_NP_770204-MLA100095605391_122025-F.webp",
      "https://http2.mlstatic.com/D_Q_NP_817420-MLA99610440976_122025-F.webp",
      "https://http2.mlstatic.com/D_Q_NP_780886-MLA99610470822_122025-F.webp"
    ],
    category: { id: "componentes-creality", name: "Componentes Creality", slug: "componentes-creality" },
    priceOriginal: 19,
    pricePromo: 19,
    pixPrice: 18.75,
  },
  {
    id: "fallback-nozzle-bambu-a1",
    name: "Nozzle Aço Bambu Lab A1",
    slug: "nozzle-aco-bambu-lab-a1",
    shortDescription: "Alta durabilidade para materiais abrasivos.",
    image: "/uploads/products/bico-nozzle-aco-endurecido-bambu-lab-a1.jpg",
    category: { id: "componentes-bambu-lab", name: "Componentes Bambu Lab", slug: "componentes-bambu-lab" },
    priceOriginal: 89.9,
    pricePromo: 79.9,
    pixPrice: 75.9,
  },
  {
    id: "fallback-wiper-bambu-a1",
    name: "Nozzle Wiper Bambu Lab A1",
    slug: "nozzle-wiper-bambu-lab-a1",
    shortDescription: "Limpeza automática do bocal antes da impressão.",
    image: "/uploads/products/limpador-bico-bambu-lab-a1.jpg",
    category: { id: "componentes-bambu-lab", name: "Componentes Bambu Lab", slug: "componentes-bambu-lab" },
    priceOriginal: 59.9,
    pricePromo: 49.9,
    pixPrice: 47.9,
  },
  {
    id: "fallback-hotend-creality-cr10",
    name: "Hotend Creality CR10",
    slug: "hotend-creality-cr10",
    shortDescription: "Reposição técnica para impressoras Creality.",
    image: "/uploads/products/kit-hotend-creality-cr-10.jpg",
    category: { id: "componentes-creality", name: "Componentes Creality", slug: "componentes-creality" },
    priceOriginal: 149.9,
    pricePromo: 129.9,
    pixPrice: 123.9,
  },
  {
    id: "fallback-termistor-ntc",
    name: "Termistor NTC 100K",
    slug: "termistor-ntc-100k-3950",
    shortDescription: "Sensor de temperatura estável para hotends universais.",
    image: "/images/products/components-placeholder.svg",
    category: { id: "componentes-universais", name: "Componentes Universais", slug: "componentes-universais" },
    priceOriginal: 34.9,
    pricePromo: 29.9,
    pixPrice: 28.4,
  },
  {
    id: "fallback-aquecedor-ceramico",
    name: "Kit Aquecedor Cerâmico 60W",
    slug: "kit-aquecedor-ceramico-60w",
    shortDescription: "Aquecimento rápido para montagem e reposição técnica.",
    image: "/uploads/products/kit-aquecedor-ceramico-60w.jpg",
    category: { id: "componentes-universais", name: "Componentes Universais", slug: "componentes-universais" },
    priceOriginal: 69.9,
    pricePromo: 59.9,
    pixPrice: 56.9,
  },
  {
    id: "fallback-mesa-pei-h2d",
    name: "Mesa PEI Texturizada H2D",
    slug: "mesa-pei-bambu-lab-h2d",
    shortDescription: "Superfície de aderência com acabamento profissional.",
    image: "/uploads/products/mesa-pei-texturizada-bambu-lab-h2d.jpg",
    category: { id: "impressoras-3d", name: "Impressões 3D", slug: "impressoras-3d" },
    priceOriginal: 299.9,
    pricePromo: 279.9,
    pixPrice: 265.9,
  },
  {
    id: "fallback-astro-a50-headband",
    name: "Headband Astro A50 / SteelSeries",
    slug: "astro-a50-headband-steelseries",
    shortDescription: "Peça de reposição impressa em 3D com acabamento técnico.",
    image: "/images/products/components-placeholder.svg",
    category: { id: "impressoras-3d", name: "Impressões 3D", slug: "impressoras-3d" },
    priceOriginal: 119.9,
    pricePromo: 99.9,
    pixPrice: 94.9,
  },
  {
    id: "fallback-logitech-g29-paddle",
    name: "Extensor Paddle Logitech G29",
    slug: "logitech-g29-extensor-paddle",
    shortDescription: "Acessório funcional impresso em 3D para sim racing.",
    image: "/images/products/components-placeholder.svg",
    category: { id: "impressoras-3d", name: "Impressões 3D", slug: "impressoras-3d" },
    priceOriginal: 89.9,
    pricePromo: 74.9,
    pixPrice: 71.2,
  },
  {
    id: "fallback-suporte-starlink",
    name: "Suporte Ethernet Starlink",
    slug: "suporte-ethernet-starlink",
    shortDescription: "Solução impressa em 3D para organização e fixação.",
    image: "/images/products/components-placeholder.svg",
    category: { id: "impressoras-3d", name: "Impressões 3D", slug: "impressoras-3d" },
    priceOriginal: 99.9,
    pricePromo: 84.9,
    pixPrice: 80.7,
  },
  {
    id: "fallback-bobblehead-3d",
    name: "Boneco Bobblehead 3D Personalizado",
    slug: "boneco-bobblehead-3d",
    shortDescription: "Projeto personalizado sob medida em impressão 3D.",
    image: "/images/products/components-placeholder.svg",
    category: { id: "personalizados", name: "Personalizados", slug: "personalizados" },
    priceOriginal: 249.9,
    pricePromo: 219.9,
    pixPrice: 208.9,
  },
  {
    id: "fallback-protecao-dji-neo",
    name: "Proteção DJI Neo",
    slug: "protecao-dji-neo",
    shortDescription: "Projeto personalizado com prototipagem e ajuste sob medida.",
    image: "/images/products/components-placeholder.svg",
    category: { id: "personalizados", name: "Personalizados", slug: "personalizados" },
    priceOriginal: 139.9,
    pricePromo: 119.9,
    pixPrice: 113.9,
  },
  {
    id: "fallback-suporte-lanterna-dji-neo",
    name: "Suporte de Lanterna DJI Neo",
    slug: "suporte-lanterna-dji-neo",
    shortDescription: "Solução personalizada para uso específico e encaixe preciso.",
    image: "/images/products/components-placeholder.svg",
    category: { id: "personalizados", name: "Personalizados", slug: "personalizados" },
    priceOriginal: 129.9,
    pricePromo: 109.9,
    pixPrice: 104.4,
  },
  {
    id: "fallback-suporte-xiaomi-vacum",
    name: "Suporte Xiaomi Vacuum",
    slug: "suporte-xiaomi-vacum",
    shortDescription: "Peça personalizada para organização e instalação sob medida.",
    image: "/images/products/components-placeholder.svg",
    category: { id: "personalizados", name: "Personalizados", slug: "personalizados" },
    priceOriginal: 119.9,
    pricePromo: 99.9,
    pixPrice: 94.9,
  },
];

const fallbackBlocks: PageBlock[] = [
  {
    id: "fallback-products-hero",
    type: "products-hero",
    order: 1,
    active: true,
    content: {
      badge: "Catálogo",
      title: "Nossos Produtos",
      description: "Peças e componentes de alta qualidade para impressoras 3D. Hotends, bicos, termistores e acessórios para Bambu Lab, Creality e outras marcas. Entrega rápida em todo o Brasil."
    },
  },
  {
    id: "fallback-products-cta",
    type: "products-cta",
    order: 2,
    active: true,
    content: {
      title: "Dúvidas sobre compatibilidade?",
      description: "Nossa equipe técnica está pronta para ajudar você a encontrar as peças certas para sua impressora 3D.",
      buttonText: "Falar com Suporte Técnico",
      whatsappLink: "https://wa.me/5511999999999?text=Olá! Preciso de ajuda para escolher peças para minha impressora 3D.",
      secondaryButtonText: "Ver Catálogo Completo",
      secondaryLink: "/contato"
    },
  },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const buscaParam = searchParams.get("busca") || "";
  const categoriaParam = searchParams.get("categoria") || null;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoriaParam);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(buscaParam);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Debounced search para evitar fetches a cada tecla
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [initialLoad, setInitialLoad] = useState(true);

  // Buscar blocos da página
  const heroBlock = blocks.find(b => b.type === "products-hero")?.content || {};
  const gridBlock = blocks.find(b => b.type === "products-grid")?.content || {};
  const ctaBlock = blocks.find(b => b.type === "products-cta")?.content || {};

  // Sync busca do URL
  useEffect(() => {
    setSearchQuery(buscaParam);
    setDebouncedSearch(buscaParam);
  }, [buscaParam]);

  // Debounce: atrasa a busca 400ms após parar de digitar
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset página ao mudar categoria ou busca
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, debouncedSearch]);

  // Carregar categorias e blocos uma vez
  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => (r.ok ? r.json() : Promise.reject(new Error("categories-unavailable")))),
      fetch("/api/pages/produtos").then((r) => (r.ok ? r.json() : Promise.reject(new Error("page-unavailable")))),
    ])
      .then(([catData, pageData]) => {
        const ip3dCategorySlugs = [
          "impressoras-3d",
          "componentes-bambu-lab",
          "componentes-creality",
          "componentes-universais",
          "personalizados",
        ];
        const ip3dCategories = (catData.categories || []).filter(
          (cat: Category) => ip3dCategorySlugs.includes(cat.slug)
        );

        setCategories(ip3dCategories.length > 0 ? ip3dCategories : fallbackCategories);
        setBlocks(pageData.page?.blocks?.length ? pageData.page.blocks : fallbackBlocks);
      })
      .catch(() => {
        setCategories(fallbackCategories);
        setBlocks(fallbackBlocks);
      });
  }, []);

  // Carregar produtos com paginação (usa AbortController para evitar race conditions)
  useEffect(() => {
    const abortController = new AbortController();
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", "9");
    if (selectedCategory && !debouncedSearch.trim()) params.set("category", selectedCategory);
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

    fetch(`/api/products?${params.toString()}`, { signal: abortController.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("products-unavailable"))))
      .then((data) => {
        if (!abortController.signal.aborted) {
          setProducts(data.products || []);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalProducts(data.pagination?.total || 0);
          setInitialLoad(false);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;

        const normalizedSearch = debouncedSearch.trim().toLowerCase();
        const fallbackFiltered = fallbackProducts.filter((product) => {
          const matchesCategory = selectedCategory ? product.category?.slug === selectedCategory : true;
          const matchesSearch = normalizedSearch
            ? [product.name, product.shortDescription, product.category?.name]
                .filter(Boolean)
                .some((value) => value!.toLowerCase().includes(normalizedSearch))
            : true;

          return matchesCategory && matchesSearch;
        });

        const pageSize = 9;
        const total = fallbackFiltered.length;
        const pages = Math.max(1, Math.ceil(total / pageSize));
        const safePage = Math.min(currentPage, pages);
        const start = (safePage - 1) * pageSize;
        const paginated = fallbackFiltered.slice(start, start + pageSize);

        setProducts(paginated);
        setTotalPages(pages);
        setTotalProducts(total);
        setInitialLoad(false);
      })
      .finally(() => {
        if (!abortController.signal.aborted) setLoading(false);
      });

    return () => {
      if (!initialLoad) abortController.abort();
    };
  }, [currentPage, selectedCategory, debouncedSearch, initialLoad]);

  const filteredProducts = products;

  return (
    <>
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-white">
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
              {(heroBlock.description as string) || "Peças e componentes de alta qualidade para impressoras 3D. Hotends, bicos, termistores e acessórios para Bambu Lab, Creality e outras marcas. Entrega rápida em todo o Brasil."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 bg-white border-y border-gray-100">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Search + Category Pills */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full pl-10 pr-8 py-2 text-sm border border-gray-200 focus:border-black outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setSelectedCategory(null)}
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
                    onClick={() => setSelectedCategory(category.slug)}
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

            {/* View Toggle & Count */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {loading
                  ? "Carregando produtos..."
                  : `${filteredProducts.length} produto${filteredProducts.length !== 1 ? "s" : ""}`}
              </span>
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

      {/* Products Grid/List */}
      <section ref={ref} className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="animate-pulse rounded-lg border border-gray-200 bg-white p-4">
                  <div className="h-60 w-full bg-gray-200 rounded" />
                  <div className="mt-4 h-4 w-24 bg-gray-200 rounded" />
                  <div className="mt-3 h-5 w-full bg-gray-200 rounded" />
                  <div className="mt-2 h-5 w-2/3 bg-gray-200 rounded" />
                  <div className="mt-4 h-4 w-full bg-gray-200 rounded" />
                  <div className="mt-2 h-4 w-3/4 bg-gray-200 rounded" />
                  <div className="mt-6 h-10 w-full bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
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
          ) : (
            <div className="space-y-6">
              {filteredProducts.map((product, index) => (
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
                    {/* Image */}
                    <div className="relative w-full md:w-64 aspect-square md:aspect-auto md:h-48 bg-gray-100 overflow-hidden flex-shrink-0">
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 transition-transform duration-700 group-hover:scale-105"
                        style={{
                          backgroundImage: `url(${product.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    </div>

                    {/* Content */}
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

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
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

          <p className="text-center text-sm text-gray-500 mt-4">
            {loading
              ? "Carregando produtos do catálogo..."
              : `Mostrando ${filteredProducts.length} de ${totalProducts} produtos`}
          </p>
        </div>
      </section>

      {/* CTA Section */}
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
              {(ctaBlock.description as string) || "Nossa equipe técnica está pronta para ajudar você a encontrar as peças certas para sua impressora 3D."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 transition-all duration-300"
                asChild
              >
                <a
                  href={(ctaBlock.whatsappLink as string) || "https://wa.me/5511999999999?text=Olá! Preciso de ajuda para escolher peças para minha impressora 3D."}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {(ctaBlock.buttonText as string) || "Falar com Suporte Técnico"}
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white bg-transparent hover:bg-white/10 transition-all duration-300"
                asChild
              >
                <Link href={(ctaBlock.secondaryLink as string) || "/contato"}>
                  {(ctaBlock.secondaryButtonText as string) || "Ver Catálogo Completo"}
                </Link>
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
    <Suspense fallback={
      <div className="pt-32 pb-16 bg-white min-h-screen">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-16 bg-gray-200 rounded w-96 mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-full max-w-2xl"></div>
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
