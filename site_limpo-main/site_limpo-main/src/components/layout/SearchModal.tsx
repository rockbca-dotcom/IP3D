"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineSearch, HiX } from "react-icons/hi";

function stripHtml(html: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  image: string | null;
  category: { name: string } | null;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  showDarkElements: boolean;
}

export function SearchModal({ isOpen, onClose, showDarkElements }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.products || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/produtos?busca=${encodeURIComponent(query)}`);
      onClose();
      setQuery("");
    }
  };

  const handleProductClick = () => {
    onClose();
    setQuery("");
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-[101] bg-white shadow-2xl"
          >
            <div className="container mx-auto px-6 lg:px-12">
              {/* Search Input */}
              <form onSubmit={handleSubmit} className="relative py-6">
                <div className="flex items-center gap-4">
                  <HiOutlineSearch className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar produtos..."
                    className="flex-1 text-xl md:text-2xl font-light text-black placeholder-gray-400 outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-black transition-colors"
                  >
                    <HiX className="w-6 h-6" />
                  </button>
                </div>
              </form>

              {/* Results */}
              <AnimatePresence>
                {(results.length > 0 || loading || query.trim()) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-100 pb-8 max-h-[60vh] overflow-y-auto"
                  >
                    {loading ? (
                      <div className="py-12 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                      </div>
                    ) : results.length > 0 ? (
                      <div className="py-6">
                        <p className="text-sm text-gray-500 mb-4">
                          {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {results.slice(0, 6).map((product) => (
                            <Link
                              key={product.id}
                              href={`/produtos/${product.slug}`}
                              onClick={handleProductClick}
                              className="flex gap-4 p-3 border border-gray-100 hover:border-gray-300 transition-colors group"
                            >
                              <div className="relative w-20 h-20 bg-gray-100 flex-shrink-0 overflow-hidden">
                                {product.image ? (
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] uppercase tracking-wider text-gray-400">
                                  {product.category?.name}
                                </span>
                                <h4 className="font-medium text-black group-hover:text-gray-600 transition-colors truncate">
                                  {product.name}
                                </h4>
                                <p className="text-sm text-gray-500 line-clamp-1">
                                  {stripHtml(product.shortDescription)}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                        {results.length > 6 && (
                          <div className="mt-6 text-center">
                            <button
                              onClick={() => {
                                router.push(`/produtos?busca=${encodeURIComponent(query)}`);
                                onClose();
                                setQuery("");
                              }}
                              className="text-sm font-medium text-black hover:text-gray-600 underline underline-offset-4"
                            >
                              Ver todos os {results.length} resultados
                            </button>
                          </div>
                        )}
                      </div>
                    ) : query.trim() ? (
                      <div className="py-12 text-center">
                        <p className="text-gray-500">Nenhum produto encontrado para "{query}"</p>
                        <p className="text-sm text-gray-400 mt-2">Tente buscar por outro termo</p>
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function SearchButton({ showDarkElements }: { showDarkElements: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-3 py-1.5 border transition-all duration-300 ${
          showDarkElements 
            ? "border-gray-200 text-black hover:border-black" 
            : "border-white/30 text-white hover:border-white"
        }`}
        aria-label="Buscar"
      >
        <HiOutlineSearch className="w-4 h-4" />
        <span className="text-sm font-medium hidden sm:inline">Buscar produtos</span>
      </button>
      <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} showDarkElements={showDarkElements} />
    </>
  );
}
