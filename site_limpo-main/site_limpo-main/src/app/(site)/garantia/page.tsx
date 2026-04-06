"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiArrowRight, HiOutlineShieldCheck, HiOutlineClock, HiOutlineDocumentText, HiOutlinePhone } from "react-icons/hi";
import { Button } from "@/components/ui/button";

interface PageBlock {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  active: boolean;
}

interface WarrantyItem {
  icon: string;
  title: string;
  description: string;
}

interface WarrantyPolicy {
  title: string;
  content: string;
}

export default function GarantiaPage() {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);

  useEffect(() => {
    fetch("/api/pages/garantia")
      .then((r) => r.json())
      .then((data) => setBlocks(data.page?.blocks || []))
      .catch(console.error);
  }, []);

  const heroBlock = blocks.find((b) => b.type === "garantia-hero")?.content || {};
  const infoBlock = blocks.find((b) => b.type === "garantia-info")?.content || {};
  const ctaBlock = blocks.find((b) => b.type === "garantia-cta")?.content || {};

  const highlights = (infoBlock.highlights as WarrantyItem[]) || [
    { icon: "shield", title: "Garantia Original", description: "Todos os nossos produtos possuem garantia de fábrica contra defeitos de fabricação." },
    { icon: "clock", title: "Prazo de Garantia", description: "A garantia cobre 12 meses a partir da data de compra, podendo variar por produto." },
    { icon: "document", title: "Documentação", description: "Mantenha a nota fiscal e certificado de garantia para acionar o serviço quando necessário." },
    { icon: "phone", title: "Suporte Técnico", description: "Nossa equipe técnica está disponível para atendimento e suporte durante todo o período de garantia." },
  ];

  const policies = (infoBlock.policies as WarrantyPolicy[]) || [
    { title: "O que a garantia cobre?", content: "A garantia cobre defeitos de fabricação em materiais, mecanismos, soldas, acabamentos e componentes elétricos/hidráulicos que apresentem falha em condições normais de uso." },
    { title: "O que a garantia NÃO cobre?", content: "Danos causados por mau uso, acidentes, modificações não autorizadas, desgaste natural, uso de produtos químicos inadequados e danos causados por transporte após a entrega." },
    { title: "Como acionar a garantia?", content: "Entre em contato com nosso suporte técnico pelo telefone ou WhatsApp informando o número da nota fiscal e descrevendo o problema. Nossa equipe fará a avaliação e agendará o atendimento." },
    { title: "Prazo para reparo", content: "Após a avaliação técnica, o prazo para reparo ou substituição é de até 30 dias úteis, conforme previsto no Código de Defesa do Consumidor." },
    { title: "Garantia estendida", content: "Oferecemos planos de garantia estendida para todos os nossos produtos. Consulte nosso time comercial para mais informações sobre valores e coberturas." },
  ];

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    shield: HiOutlineShieldCheck,
    clock: HiOutlineClock,
    document: HiOutlineDocumentText,
    phone: HiOutlinePhone,
  };

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
                {(heroBlock.badge as string) || "Sua Segurança"}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-black mb-6">
                {(heroBlock.title as string) || "Garantia de Qualidade"}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                {(heroBlock.description as string) ||
                  "Nosso compromisso é com a sua satisfação. Todos os produtos comercializados conosco possuem garantia e suporte técnico especializado."}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((item, index) => {
              const Icon = iconMap[item.icon] || HiOutlineShieldCheck;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-8 bg-white border border-gray-100 hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 mx-auto mb-5 bg-black text-white flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-3">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Policies */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
              {(infoBlock.policiesBadge as string) || "Políticas"}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-black">
              {(infoBlock.policiesTitle as string) || "Termos de Garantia"}
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-8">
            {policies.map((policy, index) => (
              <motion.div
                key={policy.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-200 pb-8 last:border-0"
              >
                <h3 className="text-xl font-semibold text-black mb-3">{policy.title}</h3>
                <p className="text-gray-600 leading-relaxed">{policy.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
              {(ctaBlock.title as string) || "Precisa acionar a garantia?"}
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              {(ctaBlock.description as string) ||
                "Entre em contato com nosso suporte técnico. Estamos prontos para ajudar."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-white text-black hover:bg-gray-100" asChild>
                <Link href={(ctaBlock.buttonLink as string) || "/contato"}>
                  {(ctaBlock.buttonText as string) || "Solicitar Suporte"}
                  <HiArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white bg-transparent hover:bg-white/10"
                asChild
              >
                <Link href={(ctaBlock.secondaryLink as string) || "/manutencao"}>
                  {(ctaBlock.secondaryText as string) || "Manutenção"}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
