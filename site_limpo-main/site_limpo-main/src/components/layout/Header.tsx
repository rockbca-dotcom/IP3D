"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  HiOutlineShoppingCart,
  HiOutlineChevronDown,
  HiOutlineSearch,
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";
import { CART_UPDATED_EVENT, getCartCount, readCart } from "@/lib/cart";

const defaultNavLinks = [
  { href: "/", label: "Home" },
  { href: "/produtos", label: "Produtos" },
  { href: "/personalizados", label: "Personalizados" },
  { href: "/sobre", label: "Sobre Nós" },
  { href: "/contato", label: "Contato" },
];

// Whitelist definitiva de slugs válidos para o dropdown de categorias.
// Categorias fora desta lista são ignoradas mesmo que estejam ativas no banco —
// garante que dados legados do template antigo nunca apareçam no menu.
// Sincronizado com categorySections em HomeShowcase.tsx.
const VALID_CATEGORY_SLUGS = new Set([
  "componentes-bambu-lab",
  "componentes-creality",
  "componentes-universais",
  "impressoras-3d",
  "personalizados",
]);

// Fallback exibido enquanto /api/categories carrega ou quando nenhuma categoria
// válida existe ainda no banco. Slugs e nomes espelham VALID_CATEGORY_SLUGS.
const defaultCategories: CategoryNavItem[] = [
  { id: "cat-bambu",          name: "Componentes Bambu Lab",  slug: "componentes-bambu-lab",  children: [] },
  { id: "cat-creality",       name: "Componentes Creality",   slug: "componentes-creality",   children: [] },
  { id: "cat-universais",     name: "Componentes Universais", slug: "componentes-universais", children: [] },
  { id: "cat-impressoras",    name: "Impressoras 3D",         slug: "impressoras-3d",         children: [] },
  { id: "cat-personalizados", name: "Personalizados",         slug: "personalizados",         children: [] },
];

interface HeaderConfigData {
  logoUrl?: string;
  navLinks?: Array<{ label: string; href: string }>;
  contactEmail?: string;
  contactPhone?: string;
  contactCity?: string;
}

interface CategoryNavItem {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
}

export function Header() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<HeaderConfigData | null>(null);
  const [categories, setCategories] = useState<CategoryNavItem[]>(defaultCategories);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const showSolidHeader = isScrolled || !isHomePage;

  const navLinks = config?.navLinks || defaultNavLinks;
  const logoUrl = config?.logoUrl || "/images/Captura_de_tela_2026-02-28_210120-removebg-preview.webp";
  const contactPhone = config?.contactPhone || "";
  const digitsPhone = contactPhone.replace(/\D/g, "");
  const whatsappLink = digitsPhone
    ? `https://wa.me/${digitsPhone.length >= 12 ? digitsPhone : `55${digitsPhone}`}`
    : "#";
  const floatingBrandBar = isHomePage && isScrolled;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/layout?type=header")
      .then((r) => r.json())
      .then((data) => {
        if (data.config?.content) setConfig(data.config.content);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        const mapped = (data.categories || [])
          .filter((category: { parentId?: string | null }) => !category.parentId)
          .map((category: {
            id: string;
            name: string;
            slug: string;
            children?: Array<{ id: string; name: string; slug: string }>;
          }) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            children: (category.children || []).map((child) => ({
              id: child.id,
              name: child.name,
              slug: child.slug,
            })),
          }));

        // Aplica whitelist: apenas slugs em VALID_CATEGORY_SLUGS chegam ao dropdown.
        // Categorias legadas do template antigo são descartadas aqui, mesmo que
        // ainda estejam marcadas como ativas no banco.
        const filtered = mapped.filter(
          (cat: CategoryNavItem) => VALID_CATEGORY_SLUGS.has(cat.slug)
        );

        if (filtered.length > 0) {
          setCategories(filtered);
        }
        // Se filtered.length === 0 (banco vazio ou sem slugs válidos),
        // defaultCategories permanece — o fallback já é correto.
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const syncCartCount = () => {
      setCartCount(getCartCount(readCart()));
    };

    syncCartCount();
    window.addEventListener("storage", syncCartCount);
    window.addEventListener(CART_UPDATED_EVENT, syncCartCount);

    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener(CART_UPDATED_EVENT, syncCartCount);
    };
  }, []);

  const megaCategory = useMemo(() => {
    if (megaOpen === "categorias") {
      return { children: categories } as CategoryNavItem & { children: CategoryNavItem[] };
    }
    return categories.find((cat) => cat.slug === megaOpen);
  }, [categories, megaOpen]);

  return (
    <header className="relative z-50 text-sm">
      {/* Topbar */}
      <div
        className={`overflow-hidden bg-[#0B64D3] text-white transition-all duration-300 ${
          floatingBrandBar ? "max-h-0 opacity-0 py-0" : "max-h-12 opacity-100"
        }`}
      >
        <div className="container mx-auto px-6 py-2 text-center text-xs font-semibold uppercase tracking-[0.3em]">
          Entregas para todo o Brasil
        </div>
      </div>

      {/* Brand Row */}
      <div
        className={`bg-white border-b border-gray-100 transition-all duration-300 ${
          floatingBrandBar
            ? "fixed left-0 right-0 top-0 z-50 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)] backdrop-blur supports-[backdrop-filter]:bg-white/95"
            : ""
        }`}
      >
        <div className="container mx-auto flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src={logoUrl} alt="IP3D" width={170} height={50} className="object-contain" priority />
            <div className="hidden border-l border-gray-200 pl-4 text-xs uppercase tracking-[0.3em] text-gray-500 md:block">
              Tecnologia em Impressão 3D
            </div>
          </Link>

          <form action="/produtos" method="get" className="flex w-full items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 md:max-w-xl">
            <HiOutlineSearch className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="busca"
              placeholder="Busque por impressoras, peças ou soluções IP3D"
              className="w-full bg-transparent outline-none placeholder:text-gray-400"
            />
            <button type="submit" className="rounded-full bg-black px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              Buscar
            </button>
          </form>

          <div className="flex items-center gap-4">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:border-black"
            >
              <FaWhatsapp className="h-5 w-5 text-green-500" />
              <div className="leading-tight text-left">
                <span className="block text-[11px] uppercase tracking-wide text-gray-400">Central de Atendimento</span>
                <span className="block text-sm font-semibold text-black">{contactPhone}</span>
              </div>
            </a>
            <Link href="/carrinho" className="relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-gray-800 hover:border-black">
              <HiOutlineShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#0B64D3] px-1 text-[10px] font-semibold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
              <span className="sr-only">Carrinho</span>
            </Link>
          </div>
        </div>
      </div>

      {floatingBrandBar && (
        <div aria-hidden className="h-[172px] md:h-[96px] lg:h-[88px]" />
      )}

      {/* Main Nav */}
      <div
        className={
          isHomePage
            ? "relative z-40 -mb-6 px-4"
            : `border-b ${showSolidHeader ? "bg-white shadow-sm" : "bg-white"}`
        }
      >
        <div
          className={
            isHomePage
              ? "mx-auto flex max-w-screen-2xl items-center justify-between rounded-[1.75rem] border border-white/70 bg-white/95 px-6 py-3 shadow-[0_24px_60px_-38px_rgba(15,23,42,0.45)] backdrop-blur lg:py-4"
              : "container mx-auto flex items-center justify-between px-6 py-3 lg:py-4"
          }
        >
          <div className="hidden lg:flex items-center gap-6">
            <button
              type="button"
              className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-sm"
              onMouseEnter={() => {
                setMegaOpen("categorias");
                setIsHovering(true);
              }}
              onMouseLeave={() => setIsHovering(false)}
            >
              Categorias <HiOutlineChevronDown className={`h-4 w-4 transition-transform ${megaOpen ? "rotate-180" : "rotate-0"}`} />
            </button>
            <div className="flex items-center gap-8 text-sm font-semibold text-gray-800">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-black transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-3 lg:hidden">
            {hasMounted ? (
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <button className="flex flex-col gap-1 rounded-md border border-gray-200 px-2 py-1 text-gray-800">
                    <span className="block h-0.5 w-6 bg-current" />
                    <span className="block h-0.5 w-6 bg-current" />
                    <span className="block h-0.5 w-4 bg-current" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full max-w-md bg-white p-8">
                  <div className="flex flex-col gap-6">
                    <Link href="/" onClick={() => setIsOpen(false)}>
                      <Image src={logoUrl} alt="Logo" width={160} height={40} />
                    </Link>
                    <div className="space-y-4">
                      <p className="text-xs uppercase tracking-widest text-gray-500">Departamentos</p>
                      <div className="space-y-3">
                        {categories.map((cat) => (
                          <div key={cat.id}>
                            <p className="font-semibold text-gray-900">{cat.name}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                              {cat.children.map((child) => (
                                <SheetClose asChild key={child.id}>
                                  <Link href={`/categorias/${child.slug}`} className="rounded-full bg-gray-100 px-3 py-1">
                                    {child.name}
                                  </Link>
                                </SheetClose>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <nav className="space-y-2">
                      {navLinks.map((link) => (
                        <SheetClose asChild key={link.href}>
                          <Link href={link.href} className="block rounded-md border border-gray-100 px-4 py-2 text-gray-700">
                            {link.label}
                          </Link>
                        </SheetClose>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <button
                type="button"
                aria-label="Abrir menu"
                className="flex flex-col gap-1 rounded-md border border-gray-200 px-2 py-1 text-gray-800"
              >
                <span className="block h-0.5 w-6 bg-current" />
                <span className="block h-0.5 w-6 bg-current" />
                <span className="block h-0.5 w-4 bg-current" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mega Menu */}
      <AnimatePresence>
        {megaCategory && (isHovering || megaOpen === "categorias") && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
              setIsHovering(false);
              setMegaOpen(null);
            }}
            className="hidden lg:block bg-white shadow-xl"
          >
            <div className="container mx-auto grid gap-6 px-8 py-8 lg:grid-cols-5">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/categorias/${cat.slug}`} className="group">
                  <div className="rounded-lg border border-gray-100 p-4 transition-all group-hover:border-black/40 group-hover:shadow-md">
                    <p className="text-base font-semibold text-gray-900">{cat.name}</p>
                    <p className="text-sm text-gray-500">Ver produtos</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
