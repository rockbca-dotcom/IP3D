"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HiOutlineDownload, HiOutlinePhone } from "react-icons/hi";

interface SectionData {
  title: string;
  subtitle: string;
  description: string;
  content: {
    phone: string;
    phoneRaw: string;
    whatsappMessage: string;
    buttonText: string;
    consultorButtonText: string;
  };
}

const defaultData: SectionData = {
  title: "Receba nosso catálogo completo",
  subtitle: "Catálogo Digital",
  description: "Conheça toda a nossa linha de produtos. Deixe seu e-mail e receba o catálogo digital com especificações técnicas e fotos em alta resolução.",
  content: {
    phone: "",
    phoneRaw: "",
    whatsappMessage: "Olá! Gostaria de falar com um consultor.",
    buttonText: "Receber Catálogo",
    consultorButtonText: "Falar com Consultor",
  },
};

export function CatalogCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [data, setData] = useState<SectionData>(defaultData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/home-sections?sectionId=catalog-cta")
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: email.split("@")[0],
          email,
          phone: "",
          message: "Solicitou o catálogo digital pela Home.",
          source: "Catálogo Home",
        }),
      });
      if (!response.ok) throw new Error("Erro ao enviar");
      setSubmitSuccess(true);
      setEmail("");
    } catch (error) {
      console.error("Error:", error);
      alert("Erro ao enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
              {data.subtitle}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-semibold text-black mb-6">
              {data.title}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {data.description}
            </p>
          </motion.div>

          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-50 p-12 text-center max-w-xl mx-auto mb-12"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-black text-white rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-serif font-semibold text-black mb-3">
               Solicitação Enviada. 
              </h3>
              <p className="text-gray-600 mb-6">
                Você receberá o catálogo digital em seu e-mail em breve.
              </p>
              <Button
                onClick={() => setSubmitSuccess(false)}
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white"
              >
                Voltar
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Form */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-12"
              >
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-14 px-6 border-gray-200 focus:border-black focus:ring-black"
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 px-8 bg-black text-white hover:bg-gray-800 transition-all duration-300 group"
                  disabled={isSubmitting}
                >
                  <HiOutlineDownload className="mr-2 w-5 h-5" />
                  {isSubmitting ? "Enviando..." : data.content.buttonText}
                </Button>
              </motion.form>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center gap-4 max-w-xl mx-auto mb-12"
              >
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-sm">ou</span>
                <div className="flex-1 h-px bg-gray-200" />
              </motion.div>

              {/* Alternative CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-6"
              >
                <a
                  href={`tel:${data.content.phoneRaw}`}
                  className="flex items-center gap-3 text-gray-600 hover:text-black transition-colors group"
                >
                  <span className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-black group-hover:bg-black group-hover:text-white transition-all duration-300">
                    <HiOutlinePhone className="w-5 h-5" />
                  </span>
                  <div className="text-left">
                    <span className="text-xs text-gray-400 block">Ligue para nós</span>
                    <span className="font-medium">{data.content.phone}</span>
                  </div>
                </a>

                <div className="hidden sm:block w-px h-12 bg-gray-200" />

                <Button
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white transition-all duration-300"
                  asChild
                >
                  <a
                    href={`https://wa.me/${data.content.phoneRaw.replace(/\D/g, '')}?text=${encodeURIComponent(data.content.whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {data.content.consultorButtonText}
                  </a>
                </Button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
