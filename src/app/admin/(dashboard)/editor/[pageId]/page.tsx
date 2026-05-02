"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineArrowLeft,
  HiOutlineSave,
  HiOutlineEye,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineDesktopComputer,
  HiOutlineDeviceMobile,
  HiOutlineRefresh,
  HiChevronUp,
  HiChevronDown,
  HiOutlinePhotograph,
  HiOutlineMenuAlt2,
  HiOutlineViewGrid,
  HiOutlineVideoCamera,
  HiOutlineCollection,
  HiOutlineSpeakerphone,
  HiOutlineNewspaper,
  HiOutlineSparkles,
  HiOutlineCube,
  HiOutlineShoppingBag,
  HiOutlineSupport,
  HiX,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { VisualBlockEditor } from "@/components/admin/visual-editor/VisualBlockEditor";

interface PageBlock {
  id?: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  active: boolean;
}

interface Page {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  description: string | null;
  published: boolean;
  isSystem: boolean;
  blocks: PageBlock[];
}

const BLOCK_TYPES = [
  { type: "hero-slider", name: "Hero Slider", icon: HiOutlinePhotograph, description: "Banner principal com slides", category: "hero" },
  { type: "hero", name: "Hero Simples", icon: HiOutlinePhotograph, description: "Seção de destaque com imagem", category: "hero" },
  { type: "featured-products", name: "Produtos em Destaque", icon: HiOutlineShoppingBag, description: "Carrossel de produtos", category: "content" },
  { type: "why-choose-us", name: "Por que nos Escolher", icon: HiOutlineSparkles, description: "Features com estatísticas", category: "content" },
  { type: "maintenance-preview", name: "Manutenção", icon: HiOutlineSupport, description: "Preview de serviços", category: "content" },
  { type: "catalog-cta", name: "CTA Catálogo", icon: HiOutlineSpeakerphone, description: "Formulário de catálogo", category: "cta" },
  { type: "text", name: "Texto", icon: HiOutlineMenuAlt2, description: "Bloco de texto", category: "basic" },
  { type: "gallery", name: "Galeria", icon: HiOutlineViewGrid, description: "Grade de imagens", category: "media" },
  { type: "video", name: "Vídeo", icon: HiOutlineVideoCamera, description: "Vídeo embed", category: "media" },
  { type: "features", name: "Features", icon: HiOutlineCollection, description: "Lista de características", category: "content" },
  { type: "cta", name: "CTA", icon: HiOutlineSpeakerphone, description: "Chamada para ação", category: "cta" },
  { type: "cards", name: "Cards", icon: HiOutlineNewspaper, description: "Grade de cards", category: "content" },
  { type: "contact-hero", name: "Hero Contato", icon: HiOutlinePhotograph, description: "Título e descrição de contato", category: "contact" },
  { type: "contact-options", name: "Opções de Contato", icon: HiOutlineCollection, description: "Cards de opções (Catálogo, Consultor, Visita)", category: "contact" },
  { type: "contact-info", name: "Info de Contato", icon: HiOutlineSupport, description: "Telefone, email, endereço", category: "contact" },
  { type: "maintenance-hero", name: "Hero Manutenção", icon: HiOutlinePhotograph, description: "Hero da página de manutenção", category: "maintenance" },
  { type: "maintenance-services", name: "Serviços Manutenção", icon: HiOutlineCollection, description: "Cards de serviços", category: "maintenance" },
  { type: "maintenance-benefits", name: "Benefícios Manutenção", icon: HiOutlineSparkles, description: "Cards de benefícios", category: "maintenance" },
  { type: "maintenance-cta", name: "CTA Manutenção", icon: HiOutlineSpeakerphone, description: "Chamada para ação", category: "maintenance" },
  { type: "maintenance-faq", name: "FAQ Manutenção", icon: HiOutlineMenuAlt2, description: "Perguntas frequentes", category: "maintenance" },
  { type: "products-hero", name: "Hero Produtos", icon: HiOutlinePhotograph, description: "Título e descrição", category: "products" },
  { type: "products-grid", name: "Grid Produtos", icon: HiOutlineCollection, description: "Escolher produtos/categorias", category: "products" },
  { type: "products-cta", name: "CTA Produtos", icon: HiOutlineSpeakerphone, description: "Chamada para ação", category: "products" },
  { type: "brands-hero", name: "Hero Marcas", icon: HiOutlinePhotograph, description: "Hero da página de marcas", category: "brands" },
  { type: "brands-section", name: "Seção Marcas", icon: HiOutlineCollection, description: "Título da seção de marcas", category: "brands" },
  { type: "brands-partnership", name: "Parcerias", icon: HiOutlineSparkles, description: "Logos de parceiros", category: "brands" },
  { type: "brands-cta", name: "CTA Marcas", icon: HiOutlineSpeakerphone, description: "Chamada para ação", category: "brands" },
  { type: "about-hero", name: "Hero Sobre", icon: HiOutlinePhotograph, description: "Hero da página sobre", category: "about" },
  { type: "about-mission", name: "Missão", icon: HiOutlineSparkles, description: "Citação da missão", category: "about" },
  { type: "about-values", name: "Valores", icon: HiOutlineCollection, description: "Cards de valores", category: "about" },
  { type: "about-cta", name: "CTA Sobre", icon: HiOutlineSpeakerphone, description: "Chamada para ação", category: "about" },
  { type: "faq-hero", name: "Hero FAQ", icon: HiOutlinePhotograph, description: "Título e busca do FAQ", category: "faq" },
  { type: "faq-items", name: "Itens FAQ", icon: HiOutlineCollection, description: "Perguntas e respostas por categoria", category: "faq" },
  { type: "faq-cta", name: "CTA FAQ", icon: HiOutlineSpeakerphone, description: "Chamada para ação", category: "faq" },
  { type: "garantia-hero", name: "Hero Garantia", icon: HiOutlinePhotograph, description: "Título e descrição", category: "garantia" },
  { type: "garantia-info", name: "Info Garantia", icon: HiOutlineCollection, description: "Destaques e políticas", category: "garantia" },
  { type: "garantia-cta", name: "CTA Garantia", icon: HiOutlineSpeakerphone, description: "Chamada para ação", category: "garantia" },
  { type: "blog-settings", name: "Configurações do Blog", icon: HiOutlineNewspaper, description: "Categorias, ordem e CTA", category: "blog" },
];

const BLOCK_CATEGORIES = [
  { id: "hero", name: "Hero" },
  { id: "content", name: "Conteúdo" },
  { id: "media", name: "Mídia" },
  { id: "cta", name: "CTAs" },
  { id: "basic", name: "Básico" },
  { id: "contact", name: "Contato" },
  { id: "maintenance", name: "Manutenção" },
  { id: "products", name: "Produtos" },
  { id: "brands", name: "Marcas" },
  { id: "about", name: "Sobre" },
  { id: "faq", name: "FAQ" },
  { id: "garantia", name: "Garantia" },
  { id: "blog", name: "Blog" },
];

export default function VisualEditorPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = use(params);
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    fetchPage();
  }, [pageId]);

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/admin/pages/${pageId}`);
      if (res.ok) {
        const data = await res.json();
        const pageData = data.page;

        // Auto-populate default blocks for pages that have none
        if (pageData && (!pageData.blocks || pageData.blocks.length === 0)) {
          const defaultBlocksMap: Record<string, PageBlock[]> = {
            blog: [
              { type: "blog-settings", content: getDefaultContent("blog-settings"), order: 0, active: true },
            ],
            "404": [
              { type: "lp-404-content", content: getDefaultContent("lp-404-content"), order: 0, active: true },
            ],
          };
          const defaults = defaultBlocksMap[pageData.slug];
          if (defaults) {
            pageData.blocks = defaults;
          }
        }

        setPage(pageData);
      } else {
        router.push("/admin/paginas");
      }
    } catch (error) {
      console.error("Error fetching page:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!page) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: page.name,
          slug: page.slug,
          title: page.title,
          description: page.description,
          published: page.published,
          blocks: page.blocks.map((block, index) => ({
            type: block.type,
            content: block.content,
            order: index,
            active: block.active,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPage(data.page);
        refreshPreview();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao salvar página");
      }
    } catch (error) {
      console.error("Error saving page:", error);
      alert("Erro ao salvar página");
    } finally {
      setSaving(false);
    }
  };

  const refreshPreview = useCallback(() => {
    setPreviewKey(prev => prev + 1);
  }, []);

  const getPagePreviewUrl = (targetPage: Pick<Page, "slug" | "isSystem">) => {
    if (targetPage.isSystem) {
      return targetPage.slug === "home" ? "/" : `/${targetPage.slug}`;
    }
    return `/p/${targetPage.slug}`;
  };

  const addBlock = (type: string) => {
    if (!page) return;

    const newBlock: PageBlock = {
      type,
      content: getDefaultContent(type),
      order: page.blocks.length,
      active: true,
    };

    setPage({
      ...page,
      blocks: [...page.blocks, newBlock],
    });
    setShowBlockSelector(false);
    setSelectedBlockIndex(page.blocks.length);
  };

  const getDefaultContent = (type: string): Record<string, unknown> => {
    switch (type) {
      case "hero-slider":
        return {
          slides: [
            {
              badge: "",
              title: "Título do Slide",
              subtitle: "Subtítulo",
              description: "Descrição do slide",
              image: "/images/hero/1.jpg",
              button1Text: "Ver Produtos",
              button1Link: "/produtos",
              button2Text: "",
              button2Link: "",
            },
          ],
          autoplaySpeed: 6000,
        };
      case "hero":
        return {
          badge: "",
          title: "Título do Hero",
          subtitle: "Subtítulo",
          description: "Descrição do hero",
          image: "",
          button1Text: "Botão Principal",
          button1Link: "#",
          button2Text: "",
          button2Link: "",
          overlay: 60,
          align: "center",
        };
      case "featured-products":
        return {
          title: "Produtos em Destaque",
          subtitle: "Coleção",
          showNavigation: true,
          limit: 10,
        };
      case "why-choose-us":
        return {
          title: "Excelência em cada detalhe",
          subtitle: "Por que nos escolher",
          description: "Descrição da seção...",
          features: [
            { icon: "shield", title: "Feature 1", description: "Descrição" },
            { icon: "cube", title: "Feature 2", description: "Descrição" },
            { icon: "support", title: "Feature 3", description: "Descrição" },
            { icon: "sparkles", title: "Feature 4", description: "Descrição" },
          ],
          stats: [
            { value: "10+", label: "Anos" },
            { value: "500+", label: "Clientes" },
            { value: "100%", label: "Original" },
          ],
        };
      case "partnership":
        return {
          title: "A tradição italiana no seu salão",
          subtitle: "Parceria Exclusiva",
          image: "/images/site/Shirobody_showroom.jpg",
          paragraphs: [
            "Parágrafo 1...",
            "Parágrafo 2...",
          ],
          features: [
            "Feature 1",
            "Feature 2",
            "Feature 3",
          ],
          foundationYear: "1965",
          button1Text: "Saiba Mais",
          button1Link: "/sobre",
          button2Text: "Agendar Visita",
          button2Link: "/contato",
        };
      case "maintenance-preview":
        return {
          title: "Manutenção",
          subtitle: "Suporte Técnico",
          description: "Descrição da seção...",
          services: [
            { icon: "wrench", title: "Serviço 1", description: "Descrição" },
            { icon: "clock", title: "Serviço 2", description: "Descrição" },
            { icon: "check", title: "Serviço 3", description: "Descrição" },
          ],
          buttonText: "Solicitar Manutenção",
          buttonLink: "/manutencao",
        };
      case "catalog-cta":
        return {
          title: "Receba nosso catálogo completo",
          subtitle: "Catálogo Digital",
          description: "Descrição...",
          phone: "(11) 98198-2279",
          phoneRaw: "",
          whatsappMessage: "Olá! Gostaria de falar com um consultor.",
          buttonText: "Receber Catálogo",
          consultorButtonText: "Falar com Consultor",
        };
      case "text":
        return {
          title: "Título da Seção",
          subtitle: "",
          content: "Conteúdo de texto aqui...",
          align: "left",
          background: "white",
        };
      case "gallery":
        return {
          title: "Galeria",
          subtitle: "",
          images: [],
          columns: 3,
        };
      case "video":
        return {
          title: "",
          url: "",
          autoplay: false,
          controls: true,
        };
      case "features":
        return {
          title: "Nossos Diferenciais",
          subtitle: "",
          items: [
            { icon: "star", title: "Feature 1", description: "Descrição" },
            { icon: "star", title: "Feature 2", description: "Descrição" },
            { icon: "star", title: "Feature 3", description: "Descrição" },
          ],
          columns: 3,
        };
      case "cta":
        return {
          title: "Pronto para começar?",
          description: "Entre em contato conosco",
          buttonText: "Fale Conosco",
          buttonLink: "/contato",
          background: "black",
        };
      case "cards":
        return {
          title: "Cards",
          subtitle: "",
          cards: [
            { image: "", title: "Card 1", description: "Descrição", link: "" },
          ],
          columns: 3,
        };
      case "faq-hero":
        return {
          badge: "Central de Ajuda",
          title: "Perguntas Frequentes",
          description: "Encontre respostas para as dúvidas mais comuns sobre nossos produtos, serviços e políticas.",
        };
      case "faq-items":
        return {
          categories: [
            {
              name: "Produtos",
              items: [
                { question: "Quais marcas vocês representam?", answer: "Trabalhamos com marcas selecionadas de alta qualidade." },
                { question: "Os produtos possuem garantia?", answer: "Sim, todos os produtos possuem garantia de fábrica." },
              ],
            },
            {
              name: "Entregas",
              items: [
                { question: "Vocês entregam para todo o Brasil?", answer: "Sim, realizamos entregas em todo o território nacional." },
              ],
            },
          ],
        };
      case "faq-cta":
        return {
          title: "Não encontrou sua resposta?",
          description: "Entre em contato conosco e nossa equipe terá prazer em ajudá-lo.",
          buttonText: "Falar Conosco",
          buttonLink: "/contato",
          whatsappText: "WhatsApp",
          whatsappLink: "https://wa.me/",
        };
      case "garantia-hero":
        return {
          badge: "Sua Segurança",
          title: "Garantia de Qualidade",
          description: "Nosso compromisso é com a sua satisfação. Todos os produtos comercializados conosco possuem garantia e suporte técnico especializado.",
        };
      case "garantia-info":
        return {
          highlights: [
            { icon: "shield", title: "Garantia Original", description: "Todos os produtos possuem garantia de fábrica contra defeitos." },
            { icon: "clock", title: "Prazo de Garantia", description: "12 meses a partir da data de compra." },
            { icon: "document", title: "Documentação", description: "Mantenha a nota fiscal para acionar o serviço." },
            { icon: "phone", title: "Suporte Técnico", description: "Equipe disponível durante todo o período de garantia." },
          ],
          policiesBadge: "Políticas",
          policiesTitle: "Termos de Garantia",
          policies: [
            { title: "O que a garantia cobre?", content: "Defeitos de fabricação em materiais, mecanismos, soldas e acabamentos." },
            { title: "O que a garantia NÃO cobre?", content: "Danos por mau uso, acidentes, modificações não autorizadas e desgaste natural." },
            { title: "Como acionar a garantia?", content: "Entre em contato com nosso suporte informando a nota fiscal e o problema." },
          ],
        };
      case "garantia-cta":
        return {
          title: "Precisa acionar a garantia?",
          description: "Entre em contato com nosso suporte técnico.",
          buttonText: "Solicitar Suporte",
          buttonLink: "/contato",
          secondaryText: "Manutenção",
          secondaryLink: "/manutencao",
        };
      case "blog-settings":
        return {
          heroBadge: "Blog",
          heroTitle: "Insights & Tendências",
          heroDescription: "Descubra as últimas novidades em tecnologia, design e inovação para o mercado de beleza e bem-estar.",
          hiddenCategories: [],
          postOrder: "newest",
          postsPerPage: 10,
          showFeatured: true,
          showCta: true,
          ctaTitle: "Fique por dentro das novidades",
          ctaDescription: "Receba insights exclusivos sobre tendências e inovações do mercado de beleza diretamente no seu e-mail.",
          ctaEmailPlaceholder: "Seu melhor e-mail",
          ctaButtonText: "Inscrever",
        };
      case "lp-404-content":
        return {
          badge: "Página não encontrada",
          title: "Ops! Esta página não existe.",
          description: "A página que você está procurando pode ter sido removida, renomeada ou nunca existiu.",
          buttons: [
            { text: "Voltar para a Home", link: "/", style: "primary" },
            { text: "Ver Produtos", link: "/produtos", style: "outline" },
          ],
          quickLinksTitle: "Ou acesse diretamente:",
          quickLinks: [
            { label: "Produtos", href: "/produtos" },
            { label: "Marcas", href: "/marcas" },
            { label: "Sobre", href: "/sobre" },
            { label: "Blog", href: "/blog" },
            { label: "Contato", href: "/contato" },
          ],
          footerText: "",
        };
      default:
        return {};
    }
  };

  const removeBlock = (index: number) => {
    if (!page || !confirm("Remover este bloco?")) return;

    const newBlocks = page.blocks.filter((_, i) => i !== index);
    setPage({ ...page, blocks: newBlocks });
    if (selectedBlockIndex === index) {
      setSelectedBlockIndex(null);
    }
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (!page) return;

    const newBlocks = [...page.blocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;

    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setPage({ ...page, blocks: newBlocks });

    if (selectedBlockIndex === index) {
      setSelectedBlockIndex(targetIndex);
    } else if (selectedBlockIndex === targetIndex) {
      setSelectedBlockIndex(index);
    }
  };

  const updateBlockContent = (index: number, content: Record<string, unknown>) => {
    if (!page) return;

    const newBlocks = [...page.blocks];
    newBlocks[index] = { ...newBlocks[index], content };
    setPage({ ...page, blocks: newBlocks });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Página não encontrada</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Top Bar */}
      <div className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/paginas"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 dark:text-white">
              {page.name}
            </h1>
            <p className="text-xs text-gray-500">{getPagePreviewUrl(page)}</p>
          </div>
        </div>

        {/* Preview Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode("desktop")}
              className={`p-1.5 rounded ${previewMode === "desktop" ? "bg-white dark:bg-gray-600 shadow-sm" : ""}`}
            >
              <HiOutlineDesktopComputer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode("mobile")}
              className={`p-1.5 rounded ${previewMode === "mobile" ? "bg-white dark:bg-gray-600 shadow-sm" : ""}`}
            >
              <HiOutlineDeviceMobile className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={refreshPreview}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            title="Atualizar preview"
          >
            <HiOutlineRefresh className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a
            href={getPagePreviewUrl(page)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-black dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg"
          >
            <HiOutlineEye className="w-4 h-4" />
            Ver Site
          </a>
          <Button onClick={handleSave} disabled={saving} size="sm">
            <HiOutlineSave className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Preview Panel */}
        <div className="flex-1 p-4 overflow-auto bg-gray-200 dark:bg-gray-800">
          <div
            className={`mx-auto bg-white shadow-2xl transition-all duration-300 ${
              previewMode === "mobile" ? "max-w-[375px]" : "max-w-full"
            }`}
            style={{ minHeight: "calc(100vh - 120px)" }}
          >
            <iframe
              key={previewKey}
              src={`${getPagePreviewUrl(page)}?preview=true`}
              className="w-full h-full min-h-[800px] border-0"
              title="Preview"
            />
          </div>
        </div>

        {/* Editor Panel */}
        <div className="w-[400px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden flex-shrink-0">
          {/* Panel Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Blocos da Página
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Clique em um bloco para editar
            </p>
          </div>

          {/* Blocks List */}
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {page.blocks.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                <p className="text-gray-500 text-sm mb-3">Nenhum bloco</p>
                <Button size="sm" onClick={() => setShowBlockSelector(true)}>
                  <HiOutlinePlus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
            ) : (
              <>
                {page.blocks.map((block, index) => (
                  <motion.div
                    key={index}
                    layout
                    className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedBlockIndex === index
                        ? "border-black dark:border-white ring-2 ring-black/10"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedBlockIndex(selectedBlockIndex === index ? null : index)}
                  >
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = BLOCK_TYPES.find((b) => b.type === block.type)?.icon || HiOutlineCollection;
                          return <Icon className="w-4 h-4 text-gray-500" />;
                        })()}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {BLOCK_TYPES.find((b) => b.type === block.type)?.name || block.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveBlock(index, "up"); }}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30"
                        >
                          <HiChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveBlock(index, "down"); }}
                          disabled={index === page.blocks.length - 1}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded disabled:opacity-30"
                        >
                          <HiChevronDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeBlock(index); }}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded"
                        >
                          <HiOutlineTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Block Editor */}
                    <AnimatePresence>
                      {selectedBlockIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-gray-200 dark:border-gray-600"
                        >
                          <div className="p-3 max-h-[400px] overflow-auto" onClick={(e) => e.stopPropagation()}>
                            <VisualBlockEditor
                              type={block.type}
                              content={block.content}
                              onChange={(content) => updateBlockContent(index, content)}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBlockSelector(true)}
                  className="w-full border-dashed mt-4"
                >
                  <HiOutlinePlus className="w-4 h-4 mr-1" />
                  Adicionar Bloco
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Block Selector Modal */}
      <AnimatePresence>
        {showBlockSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowBlockSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Adicionar Bloco
                  </h2>
                  <p className="text-sm text-gray-500">
                    Escolha o tipo de bloco para adicionar
                  </p>
                </div>
                <button
                  onClick={() => setShowBlockSelector(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-auto max-h-[60vh]">
                {BLOCK_CATEGORIES.map((category) => {
                  const categoryBlocks = BLOCK_TYPES.filter((b) => b.category === category.id);
                  if (categoryBlocks.length === 0) return null;

                  return (
                    <div key={category.id} className="mb-6">
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        {category.name}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {categoryBlocks.map((blockType) => (
                          <button
                            key={blockType.type}
                            onClick={() => addBlock(blockType.type)}
                            className="flex items-start gap-3 p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <blockType.icon className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white block">
                                {blockType.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {blockType.description}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
