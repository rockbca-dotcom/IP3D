"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  HiArrowRight,
  HiOutlineCube,
  HiOutlineLightningBolt,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineChat,
  HiOutlineCog,
  HiOutlineTruck,
  HiOutlineSupport,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";

interface PageBlock {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  active: boolean;
}

interface SobreConfig {
  heroImage?: string;
  heroTagline?: string;
  heroTitle?: string;
  heroHighlight?: string;
  heroDescription?: string;
  missionTitle?: string;
  missionQuote?: string;
  missionAuthor?: string;
  valuesTitle?: string;
  valuesSubtitle?: string;
  servicesTitle?: string;
  servicesSubtitle?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  stats?: Array<{ value: string; label: string }>;
  values?: Array<{ title: string; description: string }>;
  services?: Array<{ title: string; description: string }>;
}

const defaultValues = [
  {
    icon: HiOutlineShieldCheck,
    title: "Qualidade",
    description: "Trabalhamos apenas com componentes de alta qualidade, testados e aprovados.",
  },
  {
    icon: HiOutlineLightningBolt,
    title: "Agilidade",
    description: "Entrega rápida e atendimento ágil para você não parar sua produção.",
  },
  {
    icon: HiOutlineUserGroup,
    title: "Suporte",
    description: "Equipe técnica especializada para ajudar em qualquer dúvida.",
  },
  {
    icon: HiOutlineCube,
    title: "Inovação",
    description: "Sempre atualizados com as últimas tecnologias em impressão 3D.",
  },
];

const defaultStats = [
  { value: "500+", label: "Clientes Atendidos" },
  { value: "2000+", label: "Peças Vendidas" },
  { value: "50+", label: "Produtos no Catálogo" },
  { value: "24h", label: "Tempo de Resposta" },
];

const defaultServices = [
  {
    icon: HiOutlineCog,
    title: "Peças e Componentes",
    description: "Hotends, bicos, termistores, mesas PEI e muito mais para sua impressora 3D.",
  },
  {
    icon: HiOutlineCube,
    title: "Impressão Personalizada",
    description: "Serviço de impressão 3D sob demanda para projetos únicos e protótipos.",
  },
  {
    icon: HiOutlineTruck,
    title: "Entrega Nacional",
    description: "Enviamos para todo o Brasil com rastreamento e embalagem segura.",
  },
  {
    icon: HiOutlineSupport,
    title: "Suporte Técnico",
    description: "Ajudamos você a escolher as peças certas para sua impressora.",
  },
];

export default function SobrePage() {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [config, setConfig] = useState<SobreConfig>({});
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const valuesRef = useRef(null);
  const servicesRef = useRef(null);
  const valuesInView = useInView(valuesRef, { once: true, margin: "-100px" });
  const servicesInView = useInView(servicesRef, { once: true, margin: "-100px" });

  const stats = config.stats || defaultStats;
  const values = (config.values || defaultValues.map(v => ({ title: v.title, description: v.description }))).map((v, i) => ({
    icon: defaultValues[i]?.icon || HiOutlineCube,
    ...v,
  }));
  const services = (config.services || defaultServices.map(s => ({ title: s.title, description: s.description }))).map((s, i) => ({
    icon: defaultServices[i]?.icon || HiOutlineCog,
    ...s,
  }));

  useEffect(() => {
    fetch("/api/layout?type=header")
      .then((r) => r.json())
      .then((data) => {
        const phone: string = data.config?.content?.contactPhone ?? "";
        const digits = phone.replace(/\D/g, "");
        if (digits) setWhatsappPhone(digits.length >= 12 ? digits : `55${digits}`);
      })
      .catch(() => {});

    fetch("/api/layout?type=page-sobre")
      .then((r) => r.json())
      .then((data) => {
        if (data.config?.content) setConfig(data.config.content as SobreConfig);
      })
      .catch(() => {});

    fetch("/api/pages/sobre")
      .then((r) => r.json())
      .then((data) => setBlocks(data.page?.blocks || []))
      .catch(() => {});
  }, []);

  if (blocks.length > 0) {
    return <BlockRenderer blocks={blocks} />;
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 lg:pb-32 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={config.heroImage || "/images/background_somos.jpeg"}
            alt="Sobre a IP3D"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            quality={90}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-blue-400 mb-4">
                <HiOutlineCube className="w-5 h-5" />
                {config.heroTagline || "Sobre Nós"}
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                {config.heroTitle || "Sua parceira em"}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400"> {config.heroHighlight || "impressão 3D"}</span>
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                {config.heroDescription || "A IP3D é especializada em peças, componentes e serviços de impressão 3D. Oferecemos produtos de alta qualidade para impressoras Bambu Lab, Creality e outras marcas, além de serviços de impressão personalizada para projetos únicos."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 group"
                  asChild
                >
                  <Link href="/produtos">
                    Ver Produtos
                    <HiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white bg-transparent hover:bg-white/10 transition-all duration-300"
                  asChild
                >
                  <Link href="/contato">
                    Falar Conosco
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm p-6 text-center"
                  >
                    <span className="text-4xl font-bold text-white">{stat.value}</span>
                    <p className="text-sm text-gray-400 mt-2">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full blur-3xl"
        />
      </section>

      {/* Mission */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
                {config.missionTitle || "Nossa Missão"}
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-8 leading-tight">
                &ldquo;{config.missionQuote || "Democratizar o acesso à impressão 3D de qualidade, oferecendo peças, componentes e serviços que impulsionam a criatividade e a inovação."}&rdquo;
              </h2>
              <p className="text-gray-600 text-lg">
                — {config.missionAuthor || "Equipe IP3D"}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section ref={valuesRef} className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
              Nossos Valores
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-black">
              O que nos guia
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-white group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section ref={servicesRef} className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={servicesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
              O Que Fazemos
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-black">
              Nossos Serviços
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-6 p-8 bg-gray-50 hover:bg-gray-100 transition-colors group"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-black text-white flex-shrink-0 group-hover:bg-blue-500 transition-colors">
                  <service.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-6 lg:px-12 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {config.ctaTitle || "Pronto para começar?"}
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8 text-lg">
              {config.ctaDescription || "Entre em contato conosco e descubra como podemos ajudar no seu projeto de impressão 3D."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 group"
                asChild
              >
                <a
                  href={`https://wa.me/${whatsappPhone || '5518996921583'}?text=Olá! Gostaria de saber mais sobre os produtos e serviços da IP3D.`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <HiOutlineChat className="mr-2 w-5 h-5" />
                  Falar no WhatsApp
                  <HiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white bg-transparent hover:bg-white/10 transition-all duration-300"
                asChild
              >
                <Link href="/contato">
                  Enviar E-mail
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
