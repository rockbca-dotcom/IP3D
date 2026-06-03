"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { STANDARD_PAGE_BANNER_CLASS, limitWords, normalizeHeroCopy } from "./page-banner-styles";

export interface PageHeroButton {
  text: string;
  href: string;
  variant?: "primary" | "outline";
}

export interface PageHeroProps {
  label?: string;
  title: string;
  titleHighlight?: string;
  description?: string;
  buttons?: PageHeroButton[];
  backgroundImage?: string;
}

export function PageHero({
  label,
  title,
  titleHighlight,
  description,
  buttons = [],
  backgroundImage = "/images/banners/banner-hero1.png",
}: PageHeroProps) {
  const safeLabel = label ? limitWords(normalizeHeroCopy(label), 4) : undefined;
  const safeTitle = limitWords(normalizeHeroCopy(title), 3);
  const safeTitleHighlight = titleHighlight ? limitWords(normalizeHeroCopy(titleHighlight), 3) : undefined;
  const safeDescription = description ? limitWords(normalizeHeroCopy(description), 16) : undefined;

  return (
    <section className={`${STANDARD_PAGE_BANNER_CLASS} text-white`}>
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/65" />
        {/* Grid overlay for techy feel */}
        <div className="absolute inset-0 bg-grid-white-tech opacity-5" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-2xl">
          {label && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 mb-4"
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                {safeLabel}
              </span>
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          >
            {safeTitleHighlight ? (
              <>
                {safeTitle}{" "}
                <span className="text-cyan-400">{safeTitleHighlight}</span>
              </>
            ) : (
              safeTitle
            )}
          </motion.h1>

          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed"
            >
              {safeDescription}
            </motion.p>
          )}

          {buttons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              {buttons.map((btn, idx) =>
                btn.variant === "outline" ? (
                  <Button
                    key={idx}
                    asChild
                    variant="outline"
                    className="border-white/60 text-white hover:bg-white/10 hover:border-white rounded-lg px-6 py-3 font-semibold"
                  >
                    <Link href={btn.href}>{btn.text}</Link>
                  </Button>
                ) : (
                  <Button
                    key={idx}
                    asChild
                    className="bg-[#0B64D3] hover:bg-[#0B64D3]/90 text-white rounded-lg px-6 py-3 font-semibold"
                  >
                    <Link href={btn.href} className="flex items-center gap-2">
                      {btn.text}
                      <HiArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                )
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Decorative right element */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full opacity-10 blur-3xl pointer-events-none" />
    </section>
  );
}
