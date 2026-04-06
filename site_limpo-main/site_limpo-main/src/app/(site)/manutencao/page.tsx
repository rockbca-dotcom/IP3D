"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import {
  HiOutlineWrenchScrewdriver,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlinePhone
} from "react-icons/hi2";
import { Button } from "@/components/ui/button";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";

interface PageBlock {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  active: boolean;
}

const services = [
  {
    icon: HiOutlineWrenchScrewdriver,
    title: "Manutenção Preventiva",
    description: "Revisões periódicas para garantir o funcionamento perfeito dos seus equipamentos e prolongar sua vida útil.",
    features: ["Inspeção completa", "Lubrificação", "Ajustes técnicos", "Relatório detalhado"],
  },
  {
    icon: HiOutlineClock,
    title: "Manutenção Corretiva",
    description: "Atendimento rápido para resolver problemas e minimizar o tempo de inatividade do seu equipamento.",
    features: ["Diagnóstico preciso", "Reparo especializado", "Peças originais", "Garantia do serviço"],
  },
  {
    icon: HiOutlineCheckCircle,
    title: "Instalação Profissional",
    description: "Instalação técnica realizada por profissionais treinados, garantindo o funcionamento ideal desde o primeiro dia.",
    features: ["Montagem completa", "Configuração", "Teste de funcionamento", "Treinamento de uso"],
  },
];

const benefits = [
  {
    icon: HiOutlineShieldCheck,
    title: "Peças Originais",
    description: "Utilizamos exclusivamente peças originais em todos os reparos.",
  },
  {
    icon: HiOutlineTruck,
    title: "Atendimento Nacional",
    description: "Equipe técnica disponível para atendimento em todo o território brasileiro.",
  },
  {
    icon: HiOutlineClock,
    title: "Resposta Rápida",
    description: "Agilidade no atendimento para minimizar o impacto no seu negócio.",
  },
  {
    icon: HiOutlineCheckCircle,
    title: "Garantia de Serviço",
    description: "Todos os serviços realizados possuem garantia de qualidade.",
  },
];

const faqs = [
  {
    question: "Qual o prazo para atendimento de manutenção?",
    answer: "O prazo varia de acordo com a região e disponibilidade da equipe técnica. Em São Paulo capital, o atendimento pode ser realizado em até 48 horas. Para outras regiões, entre em contato para verificar a disponibilidade.",
  },
  {
    question: "Vocês atendem equipamentos fora da garantia?",
    answer: "Sim, realizamos manutenção em todos os nossos equipamentos, independente do período de garantia. Os custos de peças e mão de obra são informados previamente através de orçamento.",
  },
  {
    question: "Como solicitar uma manutenção?",
    answer: "Você pode solicitar manutenção através do formulário nesta página, pelo WhatsApp ou ligando para nossa central de atendimento. Nossa equipe entrará em contato para agendar a visita técnica.",
  },
  {
    question: "Vocês oferecem contrato de manutenção?",
    answer: "Sim, oferecemos contratos de manutenção preventiva com visitas periódicas programadas. Entre em contato para conhecer os planos disponíveis.",
  },
];

export default function ManutencaoPage() {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const servicesRef = useRef(null);
  const benefitsRef = useRef(null);
  const servicesInView = useInView(servicesRef, { once: true, margin: "-100px" });
  const benefitsInView = useInView(benefitsRef, { once: true, margin: "-100px" });

  useEffect(() => {
    fetch("/api/pages/manutencao")
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
      <section className="pt-32 pb-20 bg-black text-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm uppercase tracking-[0.2em] text-gray-400 mb-4 block">
                Suporte Técnico
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold mb-6 leading-tight">
                Manutenção
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                Nossa equipe técnica especializada está preparada para manter 
                seus equipamentos sempre em perfeito funcionamento. 
                Oferecemos suporte completo com peças originais e garantia de serviço.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 transition-all duration-300 group"
                  asChild
                >
                  <a
                    href="https://wa.me/?text=Olá! Preciso de suporte técnico para meu equipamento."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <HiOutlinePhone className="mr-2 w-5 h-5" />
                    Solicitar Manutenção
                  </a>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src="/manutencao.webp"
                  alt="Manutenção"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
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
              Nossos Serviços
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black">
              Como podemos ajudar
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                animate={servicesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 p-8 hover:shadow-lg transition-shadow duration-300 group"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-black text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-500">
                      <HiOutlineCheckCircle className="w-4 h-4 text-black" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section ref={benefitsRef} className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={benefitsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
                Por que nos escolher
              </span>
              <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black mb-6">
                Suporte que você pode confiar
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Oferecemos 
                suporte técnico especializado com conhecimento profundo dos 
                produtos e acesso direto a peças originais.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white p-6 border border-gray-100"
                >
                  <benefit.icon className="w-8 h-8 text-black mb-4" />
                  <h3 className="font-semibold text-black mb-2">{benefit.title}</h3>
                  <p className="text-gray-500 text-sm">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="solicitar" className="py-24 bg-black text-white">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-6">
              Precisa de suporte técnico?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Entre em contato conosco para agendar uma visita técnica ou 
              solicitar orçamento de manutenção.
            </p>
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-100 transition-all duration-300"
              asChild
            >
              <a
                href="https://wa.me/?text=Olá! Gostaria de solicitar manutenção para meu equipamento."
                target="_blank"
                rel="noopener noreferrer"
              >
                Solicitar via WhatsApp
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
              Dúvidas Frequentes
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black">
              Perguntas e Respostas
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border-b border-gray-100 pb-6"
              >
                <h3 className="text-lg font-semibold text-black mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
