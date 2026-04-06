"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaYoutube, FaWhatsapp, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from "react-icons/hi";
import { IconType } from "react-icons";

const socialIconMap: Record<string, IconType> = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  linkedin: FaLinkedinIn,
  youtube: FaYoutube,
  whatsapp: FaWhatsapp,
  twitter: FaXTwitter,
  tiktok: FaTiktok,
};

interface FooterConfigData {
  logoUrl?: string;
  subtitle?: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactCity?: string;
  linkGroups?: Array<{ title: string; links: Array<{ label: string; href: string }> }>;
  socialLinks?: Array<{ platform: string; href: string }>;
  copyrightText?: string;
}

const defaultLinkGroups = [
  {
    title: "Soluções",
    links: [
      { href: "/categorias/componentes-bambu-lab", label: "Componentes Bambu Lab" },
      { href: "/categorias/componentes-creality", label: "Componentes Creality" },
      { href: "/categorias/componentes-universais", label: "Componentes Universais" },
      { href: "/categorias/impressoras-3d", label: "Impressoras 3D" },
      { href: "/categorias/personalizados", label: "Personalizados" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { href: "/sobre", label: "Sobre a IP3D" },
      { href: "/cases", label: "Cases" },
      { href: "/blog", label: "Blog" },
      { href: "/manutencao", label: "Serviços e Manutenção" },
      { href: "/contato", label: "Contato" },
    ],
  },
  {
    title: "Ajuda",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/politica-de-troca", label: "Política de Troca" },
      { href: "/politica-de-privacidade", label: "Privacidade" },
      { href: "/suporte", label: "Suporte Técnico" },
    ],
  },
];

const defaultSocialLinks = [
  { platform: "instagram", href: "https://instagram.com/ip3d.oficial" },
  { platform: "linkedin", href: "https://linkedin.com/company/ip3d" },
  { platform: "youtube", href: "https://youtube.com/@ip3d" },
  { platform: "whatsapp", href: "https://wa.me/" },
];

export function Footer() {
  const [config, setConfig] = useState<FooterConfigData | null>(null);

  useEffect(() => {
    fetch("/api/layout?type=footer")
      .then((r) => r.json())
      .then((data) => {
        if (data.config?.content) setConfig(data.config.content);
      })
      .catch(() => {});
  }, []);

  const logoUrl = config?.logoUrl || "/images/Captura_de_tela_2026-02-28_210120-removebg-preview.webp";
  const subtitleText = config?.subtitle || "Integração completa IP3D";
  const description = config?.description || "Integramos hardware, componentes e suporte especializado para manufatura aditiva profissional no Brasil.";
  const contactEmail = config?.contactEmail || "";
  const contactPhone = config?.contactPhone || "";
  const contactCity = config?.contactCity || "";
  const linkGroups = config?.linkGroups || defaultLinkGroups;
  const socials = config?.socialLinks || defaultSocialLinks;
  const copyrightText = (config?.copyrightText || "© {year} IP3D. Todos os direitos reservados.").replace("{year}", new Date().getFullYear().toString());

  return (
    <footer className="bg-[#f5f6fa] text-gray-900">
      {/* Main Footer */}
      <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-8 ${
          linkGroups.length === 1 ? "lg:grid-cols-3" :
          linkGroups.length === 2 ? "lg:grid-cols-4" :
          linkGroups.length === 3 ? "lg:grid-cols-5" :
          linkGroups.length === 4 ? "lg:grid-cols-6" :
          "lg:grid-cols-5"
        }`}>
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Link href="/" className="inline-block mb-6">
                <Image
                  src={logoUrl}
                  alt="Logo"
                  width={120}
                  height={48}
                  className="mb-2"
                />
                <span className="block text-xs tracking-[0.2em] text-gray-400 uppercase">
                  {subtitleText}
                </span>
              </Link>
              <p className="text-gray-600 text-sm leading-relaxed max-w-sm mb-8">
                {description}
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-3 text-gray-600 hover:text-black transition-colors text-sm"
                >
                  <HiOutlineMail className="w-5 h-5" />
                  {contactEmail}
                </a>
                <a
                  href={`tel:${contactPhone.replace(/\D/g, "")}`}
                  className="flex items-center gap-3 text-gray-600 hover:text-black transition-colors text-sm"
                >
                  <HiOutlinePhone className="w-5 h-5" />
                  {contactPhone}
                </a>
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <HiOutlineLocationMarker className="w-5 h-5 shrink-0" />
                  {contactCity}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Dynamic Link Columns */}
          {linkGroups.map((group, idx) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * (idx + 1) }}
            >
              <h4 className="text-sm font-semibold uppercase tracking-wider mb-6 text-gray-800">
                {group.title}
              </h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-black transition-colors text-sm"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-gray-600 hover:text-black transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-white/60">
        <div className="container mx-auto px-6 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              {copyrightText}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socials.map((social) => {
                const Icon = socialIconMap[social.platform] || FaInstagram;
                return (
                  <motion.a
                    key={social.platform + social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-black hover:border-black transition-colors"
                    aria-label={social.platform}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
