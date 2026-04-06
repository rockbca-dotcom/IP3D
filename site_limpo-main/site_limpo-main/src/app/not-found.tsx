"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HiArrowRight, HiOutlineHome, HiOutlineSearch } from "react-icons/hi";

interface PageBlock {
  type: string;
  content: Record<string, unknown>;
}

interface NotFoundData {
  badge: string;
  title: string;
  description: string;
  buttons: Array<{ text: string; link: string; style: string }>;
  quickLinksTitle: string;
  quickLinks: Array<{ label: string; href: string }>;
  footerText: string;
}

const defaults: NotFoundData = {
  badge: "Página não encontrada",
  title: "Ops! Esta página não existe.",
  description: "A página que você está procurando pode ter sido removida, renomeada ou nunca existiu.",
  buttons: [
    { text: "Voltar para a Home", link: "/", style: "primary" },
    { text: "Ver Produtos", link: "/produtos", style: "outline" },
  ],
  quickLinksTitle: "Ou acesse diretamente:",
  quickLinks: [
    { label: "Produtos", href: "/produtos" },
    { label: "Marcas", href: "/marcas" },
    { label: "Sobre", href: "/sobre" },
    { label: "Blog", href: "/blog" },
    { label: "Contato", href: "/contato" },
  ],
  footerText: "",
};

export default function NotFound() {
  const [data, setData] = useState<NotFoundData>(defaults);

  useEffect(() => {
    fetch("/api/pages/404")
      .then((r) => r.json())
      .then((res) => {
        if (res.page?.blocks) {
          const content: Record<string, unknown> = {};
          res.page.blocks.forEach((block: PageBlock) => {
            Object.assign(content, block.content);
          });
          setData({
            badge: (content.badge as string) || defaults.badge,
            title: (content.title as string) || defaults.title,
            description: (content.description as string) || defaults.description,
            buttons: (content.buttons as NotFoundData["buttons"]) || defaults.buttons,
            quickLinksTitle: (content.quickLinksTitle as string) || defaults.quickLinksTitle,
            quickLinks: (content.quickLinks as NotFoundData["quickLinks"]) || defaults.quickLinks,
            footerText: (content.footerText as string) || defaults.footerText,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Conteúdo 404 */}
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-2xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Número 404 */}
            <div className="relative mb-8 select-none">
              <span className="text-[160px] lg:text-[220px] font-serif font-semibold text-gray-100 leading-none block">
                404
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <HiOutlineSearch className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            {/* Texto */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="text-sm uppercase tracking-[0.2em] text-gray-400 mb-4 block">
                {data.badge}
              </span>
              <h1 className="text-3xl md:text-4xl font-serif font-semibold text-black mb-4">
                {data.title}
              </h1>
              <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
                {data.description}
              </p>
            </motion.div>

            {/* Ações */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {data.buttons.map((btn, i) => (
                <Button
                  key={i}
                  size="lg"
                  variant={btn.style === "outline" ? "outline" : "default"}
                  className={
                    btn.style === "outline"
                      ? "border-black text-black hover:bg-black hover:text-white transition-all duration-300 group px-8"
                      : "bg-black text-white hover:bg-gray-800 transition-all duration-300 group px-8"
                  }
                  asChild
                >
                  <Link href={btn.link}>
                    {btn.style === "primary" && <HiOutlineHome className="mr-2 w-5 h-5" />}
                    {btn.text}
                    {btn.style === "outline" && <HiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </Link>
                </Button>
              ))}
            </motion.div>

            {/* Links rápidos */}
            {data.quickLinks.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-16 pt-8 border-t border-gray-100"
              >
                <p className="text-sm text-gray-400 mb-4">{data.quickLinksTitle}</p>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                  {data.quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-black transition-colors underline-offset-4 hover:underline"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Footer simples */}
      <footer className="px-6 lg:px-12 py-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          {data.footerText || `© ${new Date().getFullYear()} Todos os direitos reservados.`}
        </p>
      </footer>
    </div>
  );
}
