"use client";

import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineLocationMarker,
  HiOutlineDownload,
  HiOutlineChat,
  HiOutlineCalendar
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { STANDARD_PAGE_BANNER_CLASS, limitWords } from "@/components/sections/page-banner-styles";

interface PageBlock {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  active: boolean;
}

const contactSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  city: z.string().optional(),
  subject: z.string().min(1, "Selecione um assunto"),
  message: z.string().min(10, "Mensagem deve ter pelo menos 10 caracteres"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const catalogSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  city: z.string().optional(),
  businessType: z.string().optional(),
});

type CatalogFormData = z.infer<typeof catalogSchema>;

const contactOptions = [
  {
    icon: HiOutlineDownload,
    title: "Solicitar Orçamento",
    description: "Receba um orçamento personalizado para seu projeto de impressão 3D.",
    action: "catalog",
  },
  {
    icon: HiOutlineChat,
    title: "Suporte Técnico",
    description: "Tire dúvidas sobre peças, compatibilidade e instalação.",
    action: "consultant",
  },
  {
    icon: HiOutlineCalendar,
    title: "Impressão Personalizada",
    description: "Solicite uma impressão 3D sob demanda para seu projeto.",
    action: "visit",
  },
];

function ContatoContent() {
  const searchParams = useSearchParams();
  const assuntoParam = searchParams.get("assunto");
  
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [activeForm, setActiveForm] = useState<"contact" | "catalog">(
    assuntoParam === "catalogo" ? "catalog" : "contact"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  useEffect(() => {
    fetch("/api/pages/contato")
      .then((r) => r.json())
      .then((data) => setBlocks(data.page?.blocks || []))
      .catch(() => {});
  }, []);

  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      subject: "",
      message: "",
    },
  });

  const catalogForm = useForm<CatalogFormData>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      businessType: "",
    },
  });

  const onContactSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: `Assunto: ${data.subject}\nCidade: ${data.city || "Não informada"}\n\n${data.message}`,
          source: "Formulário Contato Site",
        }),
      });
      
      if (!response.ok) {
        throw new Error("Erro ao enviar");
      }
      
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCatalogSubmit = async (data: CatalogFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: `Tipo de Negócio: ${data.businessType || "Não informado"}\nCidade: ${data.city || "Não informada"}\n\nSolicitou o catálogo digital.`,
          source: "Solicitação Catálogo Site",
        }),
      });
      
      if (!response.ok) {
        throw new Error("Erro ao enviar");
      }
      
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Erro ao enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (blocks.length > 0) {
    return <BlockRenderer blocks={blocks} />;
  }

  return (
    <>
      {/* Hero */}
      <section className={`${STANDARD_PAGE_BANNER_CLASS} text-white`}>
        <div className="absolute inset-0">
          <Image
            src="/images/banners/contact-hero.svg"
            alt="Contato IP3D"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-blue-400 mb-4">
              <HiOutlinePhone className="w-5 h-5" />
              {limitWords("Contato IP3D", 4)}
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {limitWords("Fale com a IP3D", 5)}
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
              {limitWords("Tire dúvidas, peça orçamento e fale com nossa equipe sobre peças, componentes e impressão personalizada.", 16)}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick Contact Options */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => (
              <motion.button
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => {
                  if (option.action === "catalog") {
                    setActiveForm("catalog");
                  } else {
                    setActiveForm("contact");
                  }
                  setSubmitSuccess(false);
                }}
                className="flex items-start gap-4 p-6 bg-white border border-gray-100 hover:border-black hover:shadow-lg transition-all duration-300 text-left group"
              >
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-100 group-hover:bg-black group-hover:text-white transition-all duration-300">
                  <option.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-black mb-1">{option.title}</h3>
                  <p className="text-gray-500 text-sm">{option.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Forms Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Form Toggle */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => {
                    setActiveForm("contact");
                    setSubmitSuccess(false);
                  }}
                  className={`px-6 py-3 text-sm font-medium transition-all duration-300 ${
                    activeForm === "contact"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Suporte Técnico
                </button>
                <button
                  onClick={() => {
                    setActiveForm("catalog");
                    setSubmitSuccess(false);
                  }}
                  className={`px-6 py-3 text-sm font-medium transition-all duration-300 ${
                    activeForm === "catalog"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Solicitar Orçamento
                </button>
              </div>

              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-50 p-12 text-center"
                >
                  <div className="w-16 h-16 mx-auto mb-6 bg-black text-white rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-black mb-3">
                    Mensagem Enviada!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {activeForm === "catalog"
                      ? "Você receberá o catálogo em seu e-mail em breve."
                      : "Nossa equipe entrará em contato em breve."}
                  </p>
                  <Button
                    onClick={() => setSubmitSuccess(false)}
                    variant="outline"
                    className="border-black text-black hover:bg-black hover:text-white"
                  >
                    Enviar outra mensagem
                  </Button>
                </motion.div>
              ) : activeForm === "contact" ? (
                <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name">Nome completo *</Label>
                      <Input
                        id="name"
                        {...contactForm.register("name")}
                        className="mt-2 h-12"
                        placeholder="Seu nome"
                      />
                      {contactForm.formState.errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {contactForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...contactForm.register("email")}
                        className="mt-2 h-12"
                        placeholder="seu@email.com"
                      />
                      {contactForm.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {contactForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                      <Input
                        id="phone"
                        {...contactForm.register("phone")}
                        className="mt-2 h-12"
                        placeholder="(11) 99999-9999"
                      />
                      {contactForm.formState.errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {contactForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        {...contactForm.register("city")}
                        className="mt-2 h-12"
                        placeholder="São Paulo, SP"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Assunto *</Label>
                    <Select onValueChange={(value) => contactForm.setValue("subject", value)}>
                      <SelectTrigger className="mt-2 h-12">
                        <SelectValue placeholder="Selecione um assunto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pecas">Dúvidas sobre Peças</SelectItem>
                        <SelectItem value="compatibilidade">Compatibilidade de Componentes</SelectItem>
                        <SelectItem value="impressao">Impressão Personalizada</SelectItem>
                        <SelectItem value="suporte">Suporte Técnico</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    {contactForm.formState.errors.subject && (
                      <p className="text-red-500 text-sm mt-1">
                        {contactForm.formState.errors.subject.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea
                      id="message"
                      {...contactForm.register("message")}
                      className="mt-2 min-h-[150px]"
                      placeholder="Como podemos ajudar?"
                    />
                    {contactForm.formState.errors.message && (
                      <p className="text-red-500 text-sm mt-1">
                        {contactForm.formState.errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-black text-white hover:bg-gray-800 transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={catalogForm.handleSubmit(onCatalogSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="cat-name">Nome completo *</Label>
                      <Input
                        id="cat-name"
                        {...catalogForm.register("name")}
                        className="mt-2 h-12"
                        placeholder="Seu nome"
                      />
                      {catalogForm.formState.errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {catalogForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="cat-email">E-mail *</Label>
                      <Input
                        id="cat-email"
                        type="email"
                        {...catalogForm.register("email")}
                        className="mt-2 h-12"
                        placeholder="seu@email.com"
                      />
                      {catalogForm.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                          {catalogForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="cat-phone">Telefone/WhatsApp *</Label>
                      <Input
                        id="cat-phone"
                        {...catalogForm.register("phone")}
                        className="mt-2 h-12"
                        placeholder="(11) 99999-9999"
                      />
                      {catalogForm.formState.errors.phone && (
                        <p className="text-red-500 text-sm mt-1">
                          {catalogForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="cat-city">Cidade</Label>
                      <Input
                        id="cat-city"
                        {...catalogForm.register("city")}
                        className="mt-2 h-12"
                        placeholder="São Paulo, SP"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="businessType">Tipo de Negócio</Label>
                    <Select onValueChange={(value) => catalogForm.setValue("businessType", value)}>
                      <SelectTrigger className="mt-2 h-12">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hobby">Hobbysta / Maker</SelectItem>
                        <SelectItem value="empresa">Empresa / Indústria</SelectItem>
                        <SelectItem value="educacao">Educação / Escola</SelectItem>
                        <SelectItem value="prototipagem">Prototipagem</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-black text-white hover:bg-gray-800 transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Receber Catálogo"}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Ao enviar, você concorda em receber comunicações da IP3D.
                  </p>
                </form>
              )}
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-black text-white p-10 lg:p-12 h-full">
                <h2 className="text-2xl font-semibold mb-8">
                  Informações de Contato
                </h2>

                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white/10">
                      <HiOutlinePhone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Telefone / WhatsApp</h3>
                      <a
                        href="tel:+5511999999999"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        (11) 99999-9999
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white/10">
                      <HiOutlineMail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">E-mail</h3>
                      <a
                        href="mailto:contato@ip3d.com.br"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        contato@ip3d.com.br
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white/10">
                      <HiOutlineLocationMarker className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Endereço</h3>
                      <p className="text-gray-400">
                        São Paulo, SP
                        <br />
                        Brasil
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10">
                  <h3 className="font-medium mb-4">Horário de Atendimento</h3>
                  <div className="space-y-2 text-gray-400 text-sm">
                    <p>Segunda a Sexta: 9h às 18h</p>
                    <p>Sábado: 9h às 13h</p>
                  </div>
                </div>

                <div className="mt-12">
                  <Button
                    size="lg"
                    className="w-full bg-white text-black hover:bg-gray-100 transition-all duration-300"
                    asChild
                  >
                    <a
                      href="https://wa.me/5511999999999?text=Olá! Gostaria de mais informações sobre peças e serviços de impressão 3D."
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Chamar no WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function ContatoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ContatoContent />
    </Suspense>
  );
}
