"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HiChevronDown, HiOutlineSearch, HiArrowRight } from "react-icons/hi";
import { Button } from "@/components/ui/button";

interface PageBlock {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  active: boolean;
}

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

interface FAQCategory {
  name: string;
  items: FAQItem[];
}

export default function FAQPage() {
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");

  useEffect(() => {
    fetch("/api/pages/faq")
      .then((r) => r.json())
      .then((data) => setBlocks(data.page?.blocks || []))
      .catch(console.error);
  }, []);

  const heroBlock = blocks.find((b) => b.type === "faq-hero")?.content || {};
  const itemsBlock = blocks.find((b) => b.type === "faq-items")?.content || {};
  const ctaBlock = blocks.find((b) => b.type === "faq-cta")?.content || {};

  const categories = (itemsBlock.categories as FAQCategory[]) || [
    {
      name: "Produtos",
      items: [
        { question: "Quais marcas vocês representam?", answer: "Trabalhamos com marcas selecionadas de alta qualidade para atender às suas necessidades." },
        { question: "Os produtos possuem garantia?", answer: "Sim, todos os nossos produtos possuem garantia. Consulte nossa página de garantia para mais detalhes." },
        { question: "Como posso ver os produtos pessoalmente?", answer: "Você pode agendar uma visita ao nosso showroom em São Paulo. Entre em contato para marcar um horário." },
      ],
    },
    {
      name: "Entregas",
      items: [
        { question: "Vocês entregam para todo o Brasil?", answer: "Sim, realizamos entregas em todo o território nacional. O prazo e valor do frete variam de acordo com a região." },
        { question: "Qual o prazo de entrega?", answer: "O prazo varia de acordo com o produto e sua localização. Produtos em estoque são enviados em até 5 dias úteis." },
      ],
    },
    {
      name: "Manutenção",
      items: [
        { question: "Vocês oferecem serviço de manutenção?", answer: "Sim, temos uma equipe técnica especializada para manutenção preventiva e corretiva de todos os equipamentos." },
        { question: "Como solicitar manutenção?", answer: "Acesse nossa página de manutenção ou entre em contato pelo WhatsApp para agendar um atendimento." },
      ],
    },
    {
      name: "Pagamento",
      items: [
        { question: "Quais formas de pagamento são aceitas?", answer: "Aceitamos cartão de crédito, transferência bancária, PIX e boleto. Parcelamento disponível em até 12x." },
        { question: "Vocês trabalham com financiamento?", answer: "Sim, trabalhamos com opções de financiamento. Entre em contato com nosso time comercial para mais informações." },
      ],
    },
  ];

  const allItems = categories.flatMap((cat) =>
    cat.items.map((item) => ({ ...item, category: cat.name }))
  );

  const filteredItems =
    activeCategory === "todos"
      ? allItems
      : allItems.filter((item) => item.category === activeCategory);

  const searchedItems = searchQuery.trim()
    ? filteredItems.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredItems;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-white">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-4 block">
              {(heroBlock.badge as string) || "Central de Ajuda"}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-black mb-6">
              {(heroBlock.title as string) || "Perguntas Frequentes"}
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-10">
              {(heroBlock.description as string) ||
                "Encontre respostas para as dúvidas mais comuns sobre nossos produtos, serviços e políticas."}
            </p>

            {/* Search */}
            <div className="max-w-xl mx-auto relative">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar perguntas..."
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="border-b border-gray-200 bg-white sticky top-20 z-10">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("todos")}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-colors ${
                activeCategory === "todos"
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-colors ${
                  activeCategory === cat.name
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Items */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto space-y-3">
            {searchedItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhuma pergunta encontrada.</p>
              </div>
            ) : (
              searchedItems.map((item, index) => {
                const key = `${item.category}-${index}`;
                const isOpen = openIndex === key;
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : key)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left"
                    >
                      <div className="flex-1 pr-4">
                        <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">
                          {item.category}
                        </span>
                        <span className="text-base font-medium text-gray-900">
                          {item.question}
                        </span>
                      </div>
                      <HiChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
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
              {(ctaBlock.title as string) || "Não encontrou sua resposta?"}
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              {(ctaBlock.description as string) ||
                "Entre em contato conosco e nossa equipe terá prazer em ajudá-lo."}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100"
                asChild
              >
                <Link href={(ctaBlock.buttonLink as string) || "/contato"}>
                  {(ctaBlock.buttonText as string) || "Falar Conosco"}
                  <HiArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white bg-transparent hover:bg-white/10"
                asChild
              >
                <a
                  href={(ctaBlock.whatsappLink as string) || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {(ctaBlock.whatsappText as string) || "WhatsApp"}
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
