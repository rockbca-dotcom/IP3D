"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HiArrowRight, HiOutlineWrenchScrewdriver, HiOutlineClock, HiOutlineCheckCircle } from "react-icons/hi2";
import Link from "next/link";

interface SectionData {
  title: string;
  subtitle: string;
  description: string;
  content: {
    services: { icon: string; title: string; description: string }[];
    buttonText: string;
    buttonLink: string;
  };
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wrench: HiOutlineWrenchScrewdriver,
  clock: HiOutlineClock,
  check: HiOutlineCheckCircle,
};

const defaultData: SectionData = {
  title: "Manutenção",
  subtitle: "Suporte Técnico",
  description: "Nossa equipe técnica especializada está preparada para manter seus equipamentos sempre em perfeito funcionamento. Oferecemos suporte completo, desde a instalação até a manutenção preventiva e corretiva.",
  content: {
    services: [
      { icon: "wrench", title: "Manutenção Preventiva", description: "Prolongue a vida útil dos seus equipamentos com revisões periódicas." },
      { icon: "clock", title: "Atendimento Rápido", description: "Equipe técnica disponível para atendimento em todo o Brasil." },
      { icon: "check", title: "Peças Originais", description: "Utilizamos apenas peças originais em todos os reparos." },
    ],
    buttonText: "Solicitar Manutenção",
    buttonLink: "/contato",
  },
};

interface MaintenancePreviewProps {
  initialData?: {
    title?: string | null;
    subtitle?: string | null;
    description?: string | null;
    content?: unknown;
  };
}

export function MaintenancePreview({ initialData }: MaintenancePreviewProps = {}) {
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

    fetch("/api/home-sections?sectionId=maintenance-preview")
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
              {data.subtitle}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black mb-6 leading-tight">
              {data.title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {data.description}
            </p>

            <Link href={data.content.buttonLink}>
              <Button
                size="lg"
                className="bg-black text-white hover:bg-gray-800 transition-all duration-300 group"
              >
                {data.content.buttonText}
                <HiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Right - Services */}
          <div className="space-y-6">
            {data.content.services.map((service, index) => {
              const Icon = iconMap[service.icon] || HiOutlineWrenchScrewdriver;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, x: 30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                  className="flex gap-6 p-6 bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center bg-gray-100 group-hover:bg-black group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {service.description}
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
