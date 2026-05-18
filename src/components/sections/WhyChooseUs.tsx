"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { HiOutlineShieldCheck, HiOutlineCube, HiOutlineSupport, HiOutlineSparkles } from "react-icons/hi";

interface SectionData {
  title: string;
  subtitle: string;
  description: string;
  content: {
    features: { icon: string; title: string; description: string }[];
    stats: { value: string; label: string }[];
  };
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: HiOutlineShieldCheck,
  cube: HiOutlineCube,
  support: HiOutlineSupport,
  sparkles: HiOutlineSparkles,
};

const defaultData: SectionData = {
  title: "Excelência em cada detalhe",
  subtitle: "Por que nos escolher",
  description: "Qualidade e excelência em cada produto, com suporte especializado e atendimento dedicado.",
  content: {
    features: [
      { icon: "shield", title: "Qualidade Garantida", description: "Produtos selecionados com os mais altos padrões de qualidade, garantindo sua satisfação." },
      { icon: "cube", title: "Design Italiano", description: "Cada peça é projetada na Itália com os mais altos padrões de design, ergonomia e qualidade de materiais." },
      { icon: "support", title: "Suporte Especializado", description: "Equipe técnica treinada para instalação, manutenção e suporte completo durante toda a vida útil do produto." },
      { icon: "sparkles", title: "Experiência Premium", description: "Transforme seu salão em um ambiente de luxo e proporcione aos seus clientes uma experiência inesquecível." },
    ],
    stats: [
      { value: "10+", label: "Anos de mercado" },
      { value: "500+", label: "Clientes atendidos" },
      { value: "100%", label: "Satisfação" },
    ],
  },
};

interface WhyChooseUsProps {
  initialData?: {
    title?: string | null;
    subtitle?: string | null;
    description?: string | null;
    content?: unknown;
  };
}

export function WhyChooseUs({ initialData }: WhyChooseUsProps = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [data, setData] = useState<SectionData>(() => {
    if (initialData) {
      return {
        title: initialData.title || defaultData.title,
        subtitle: initialData.subtitle || defaultData.subtitle,
        description: initialData.description || defaultData.description,
        content: (initialData.content as SectionData["content"]) || defaultData.content,
      };
    }
    return defaultData;
  });

  useEffect(() => {
    if (initialData) return;

    fetch("/api/home-sections?sectionId=why-choose-us")
      .then((res) => res.json())
      .then((result) => {
        if (result.section) {
          setData({
            title: result.section.title || defaultData.title,
            subtitle: result.section.subtitle || defaultData.subtitle,
            description: result.section.description || defaultData.description,
            content: result.section.content || defaultData.content,
          });
        }
      })
      .catch(() => {});
  }, [initialData]);


  return (
    <section ref={ref} className="py-24 lg:py-32 bg-gray-50">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left Column - Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4">
              {data.subtitle}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black mb-6 leading-tight">
              {data.title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {data.description}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              {data.content.stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                >
                  <span className="text-4xl font-serif font-semibold text-black">{stat.value}</span>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {data.content.features.map((feature, index) => {
              const Icon = iconMap[feature.icon] || HiOutlineSparkles;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                  className="group"
                >
                  <div className="p-6 bg-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 h-full">
                    <div className="w-12 h-12 flex items-center justify-center bg-black text-white mb-5 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-black mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
