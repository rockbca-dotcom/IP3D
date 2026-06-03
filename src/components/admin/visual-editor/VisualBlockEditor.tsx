"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { HiOutlineUpload, HiOutlinePlus, HiOutlineTrash, HiOutlineX, HiOutlineVideoCamera } from "react-icons/hi";
import { upload } from "@vercel/blob/client";

interface VisualBlockEditorProps {
  type: string;
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function VisualBlockEditor({ type, content, onChange }: VisualBlockEditorProps) {
  switch (type) {
    case "hero-slider":
      return <HeroSliderEditor content={content} onChange={onChange} />;
    case "hero":
      return <HeroEditor content={content} onChange={onChange} />;
    case "featured-products":
      return <FeaturedProductsEditor content={content} onChange={onChange} />;
    case "why-choose-us":
      return <WhyChooseUsEditor content={content} onChange={onChange} />;
    case "maintenance-preview":
      return <MaintenancePreviewEditor content={content} onChange={onChange} />;
    case "catalog-cta":
      return <CatalogCTAEditor content={content} onChange={onChange} />;
    case "text":
      return <TextEditor content={content} onChange={onChange} />;
    case "gallery":
      return <GalleryEditor content={content} onChange={onChange} />;
    case "video":
      return <VideoEditor content={content} onChange={onChange} />;
    case "features":
      return <FeaturesEditor content={content} onChange={onChange} />;
    case "cta":
      return <CTAEditor content={content} onChange={onChange} />;
    case "cards":
      return <CardsEditor content={content} onChange={onChange} />;
    case "contact-hero":
      return <ContactHeroEditor content={content} onChange={onChange} />;
    case "contact-options":
      return <ContactOptionsEditor content={content} onChange={onChange} />;
    case "contact-info":
      return <ContactInfoEditor content={content} onChange={onChange} />;
    case "maintenance-hero":
      return <MaintenanceHeroEditor content={content} onChange={onChange} />;
    case "maintenance-services":
      return <MaintenanceServicesEditor content={content} onChange={onChange} />;
    case "maintenance-benefits":
      return <MaintenanceBenefitsEditor content={content} onChange={onChange} />;
    case "maintenance-cta":
      return <MaintenanceCTAEditor content={content} onChange={onChange} />;
    case "maintenance-faq":
      return <MaintenanceFAQEditor content={content} onChange={onChange} />;
    case "products-hero":
      return <ProductsHeroEditor content={content} onChange={onChange} />;
    case "products-grid":
      return <ProductsGridEditor content={content} onChange={onChange} />;
    case "products-cta":
      return <ProductsCTAEditor content={content} onChange={onChange} />;
    case "about-hero":
      return <AboutHeroEditor content={content} onChange={onChange} />;
    case "about-mission":
      return <AboutMissionEditor content={content} onChange={onChange} />;
    case "about-values":
      return <AboutValuesEditor content={content} onChange={onChange} />;
    case "about-partnership":
      return <AboutPartnershipEditor content={content} onChange={onChange} />;
    case "about-cta":
      return <AboutCTAEditor content={content} onChange={onChange} />;
    case "lp-salao-content":
      return <LPSalaoContentEditor content={content} onChange={onChange} />;
    case "lp-tricologia-content":
      return <LPTricologiaContentEditor content={content} onChange={onChange} />;
    case "lp-spa-content":
      return <LPSpaContentEditor content={content} onChange={onChange} />;
    case "lp-404-content":
      return <LP404ContentEditor content={content} onChange={onChange} />;
    case "home-hero-slider":
      return <HomeHeroSliderEditor content={content} onChange={onChange} />;
    case "home-trust-bar":
      return <HomeTrustBarEditor content={content} onChange={onChange} />;
    case "home-categories":
      return <HomeCategoriesEditor content={content} onChange={onChange} />;
    case "home-featured-products":
      return <HomeFeaturedProductsEditor content={content} onChange={onChange} />;
    case "home-category-products":
      return <HomeCategoryProductsEditor content={content} onChange={onChange} />;
    case "home-promo-banner":
      return <HomePromoBannerEditor content={content} onChange={onChange} />;
    case "home-printer-map":
      return <HomePrinterMapEditor content={content} onChange={onChange} />;
    default:
      return <div className="text-gray-500 text-sm">Editor não disponível</div>;
  }
}

// Componentes de Input reutilizáveis
function InputField({ label, value, onChange, placeholder, type = "text" }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black/10 focus:border-black"
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder, rows = 3 }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black/10 focus:border-black"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ImageUploader({ value, onChange, label = "Imagem" }: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const timestamp = Date.now();
      const ext = file.name.split(".").pop();
      const filename = `blocks/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

      const blob = await upload(filename, file, {
        access: "public",
        handleUploadUrl: "/api/upload/client",
        onUploadProgress: (progressEvent) => {
          setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        },
      });

      onChange(blob.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Erro ao fazer upload. Tente novamente.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {value && (
          <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0 group">
            <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              <HiOutlineX className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
        <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 text-sm">
          <HiOutlineUpload className="w-4 h-4" />
          <span>{uploading ? `${progress}%` : value ? "Trocar" : "Upload"}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}

function VideoUploader({ value, onChange, label = "Vídeo" }: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      const timestamp = Date.now();
      const ext = file.name.split(".").pop();
      const filename = `videos/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

      const blob = await upload(filename, file, {
        access: "public",
        handleUploadUrl: "/api/upload/client",
        onUploadProgress: (progressEvent) => {
          setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        },
      });

      onChange(blob.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Erro ao fazer upload. Tente novamente.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </label>
      {value ? (
        <div className="relative rounded-lg overflow-hidden bg-black">
          <video src={value} className="w-full h-32 object-cover" muted />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="px-3 py-1.5 bg-white/90 rounded text-xs font-medium hover:bg-white"
            >
              {uploading ? `${progress}%` : "Trocar"}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="p-1.5 bg-red-500 rounded text-white hover:bg-red-600"
            >
              <HiOutlineX className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400">
          {uploading ? (
            <>
              <div className="animate-spin h-6 w-6 border-2 border-black dark:border-white border-t-transparent rounded-full" />
              <span className="text-sm text-gray-500">{progress}%</span>
            </>
          ) : (
            <>
              <HiOutlineVideoCamera className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-500">Clique para enviar vídeo</span>
            </>
          )}
        </label>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}

// Hero Slider Editor
function HeroSliderEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const slides = (content.slides as Array<{
    badge?: string;
    title: string;
    subtitle?: string;
    description?: string;
    image?: string;
    button1Text?: string;
    button1Link?: string;
    button2Text?: string;
    button2Link?: string;
  }>) || [];

  const [activeSlide, setActiveSlide] = useState(0);

  const addSlide = () => {
    const newSlides = [...slides, {
      badge: "",
      title: "Novo Slide",
      subtitle: "",
      description: "",
      image: "",
      button1Text: "Ver Mais",
      button1Link: "#",
      button2Text: "",
      button2Link: "",
    }];
    onChange({ ...content, slides: newSlides });
    setActiveSlide(newSlides.length - 1);
  };

  const updateSlide = (index: number, field: string, value: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    onChange({ ...content, slides: newSlides });
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== index);
    onChange({ ...content, slides: newSlides });
    if (activeSlide >= newSlides.length) {
      setActiveSlide(newSlides.length - 1);
    }
  };

  const currentSlide = slides[activeSlide];

  return (
    <div className="space-y-4">
      {/* Slide Tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={(e) => { e.stopPropagation(); setActiveSlide(index); }}
            className={`px-3 py-1 text-xs rounded-full ${
              activeSlide === index
                ? "bg-black text-white"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700"
            }`}
          >
            Slide {index + 1}
          </button>
        ))}
        <button
          onClick={(e) => { e.stopPropagation(); addSlide(); }}
          className="px-3 py-1 text-xs rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700"
        >
          <HiOutlinePlus className="w-3 h-3" />
        </button>
      </div>

      {currentSlide && (
        <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">Slide {activeSlide + 1}</span>
            {slides.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); removeSlide(activeSlide); }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remover
              </button>
            )}
          </div>

          <InputField
            label="Título"
            value={currentSlide.title || ""}
            onChange={(v) => updateSlide(activeSlide, "title", v)}
          />
          <InputField
            label="Subtítulo"
            value={currentSlide.subtitle || ""}
            onChange={(v) => updateSlide(activeSlide, "subtitle", v)}
          />
          <TextareaField
            label="Descrição"
            value={currentSlide.description || ""}
            onChange={(v) => updateSlide(activeSlide, "description", v)}
            rows={2}
          />
          <ImageUploader
            label="Imagem de Fundo"
            value={currentSlide.image || ""}
            onChange={(v) => updateSlide(activeSlide, "image", v)}
          />
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Botão 1 - Texto"
              value={currentSlide.button1Text || ""}
              onChange={(v) => updateSlide(activeSlide, "button1Text", v)}
            />
            <InputField
              label="Botão 1 - Link"
              value={currentSlide.button1Link || ""}
              onChange={(v) => updateSlide(activeSlide, "button1Link", v)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <InputField
              label="Botão 2 - Texto"
              value={currentSlide.button2Text || ""}
              onChange={(v) => updateSlide(activeSlide, "button2Text", v)}
            />
            <InputField
              label="Botão 2 - Link"
              value={currentSlide.button2Link || ""}
              onChange={(v) => updateSlide(activeSlide, "button2Link", v)}
            />
          </div>
        </div>
      )}

      <InputField
        label="Velocidade Autoplay (ms)"
        value={String((content.autoplaySpeed as number) || 6000)}
        onChange={(v) => onChange({ ...content, autoplaySpeed: parseInt(v) || 6000 })}
        type="number"
      />
    </div>
  );
}

// Hero Editor (simples)
function HeroEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const hasVideo = !!(content.video as string);
  return (
    <div className="space-y-3">
      <InputField
        label="Badge"
        value={(content.badge as string) || ""}
        onChange={(v) => onChange({ ...content, badge: v })}
        placeholder="Ex: Novidade"
      />
      <InputField
        label="Título"
        value={(content.title as string) || ""}
        onChange={(v) => onChange({ ...content, title: v })}
      />
      <InputField
        label="Subtítulo"
        value={(content.subtitle as string) || ""}
        onChange={(v) => onChange({ ...content, subtitle: v })}
      />
      <TextareaField
        label="Descrição"
        value={(content.description as string) || ""}
        onChange={(v) => onChange({ ...content, description: v })}
        rows={3}
      />
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          label="Alinhamento"
          value={(content.align as string) || "center"}
          onChange={(v) => onChange({ ...content, align: v })}
          options={[
            { value: "left", label: "Esquerda" },
            { value: "center", label: "Centro" },
            { value: "right", label: "Direita" },
          ]}
        />
        <InputField
          label="Overlay (%)"
          value={String((content.overlay as number) || 50)}
          onChange={(v) => onChange({ ...content, overlay: parseInt(v) || 50 })}
          type="number"
        />
      </div>
      <InputField
        label="URL do Vídeo (opcional)"
        value={(content.video as string) || ""}
        onChange={(v) => onChange({ ...content, video: v })}
        placeholder="/video.mp4 ou deixe vazio para usar imagem"
      />
      {!hasVideo && (
        <ImageUploader
          label="Imagem de Fundo"
          value={(content.image as string) || ""}
          onChange={(v) => onChange({ ...content, image: v })}
        />
      )}
      <div className="grid grid-cols-2 gap-2">
        <InputField
          label="Botão - Texto"
          value={(content.button1Text as string) || ""}
          onChange={(v) => onChange({ ...content, button1Text: v })}
        />
        <InputField
          label="Botão - Link"
          value={(content.button1Link as string) || ""}
          onChange={(v) => onChange({ ...content, button1Link: v })}
        />
      </div>
    </div>
  );
}

// Featured Products Editor
function FeaturedProductsEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <InputField
        label="Título"
        value={(content.title as string) || "Produtos em Destaque"}
        onChange={(v) => onChange({ ...content, title: v })}
      />
      <InputField
        label="Subtítulo"
        value={(content.subtitle as string) || "Coleção"}
        onChange={(v) => onChange({ ...content, subtitle: v })}
      />
      <InputField
        label="Limite de Produtos"
        value={String((content.limit as number) || 10)}
        onChange={(v) => onChange({ ...content, limit: parseInt(v) || 10 })}
        type="number"
      />
      <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700 p-2 rounded">
        Os produtos são carregados automaticamente do catálogo (produtos marcados como destaque).
      </div>
    </div>
  );
}

// Why Choose Us Editor
function WhyChooseUsEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const features = (content.features as Array<{ icon: string; title: string; description: string }>) || [];
  const stats = (content.stats as Array<{ value: string; label: string }>) || [];

  const updateFeature = (index: number, field: string, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onChange({ ...content, features: newFeatures });
  };

  const addFeature = () => {
    onChange({
      ...content,
      features: [...features, { icon: "sparkles", title: "Nova Feature", description: "Descrição" }],
    });
  };

  const removeFeature = (index: number) => {
    onChange({ ...content, features: features.filter((_, i) => i !== index) });
  };

  const updateStat = (index: number, field: string, value: string) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    onChange({ ...content, stats: newStats });
  };

  return (
    <div className="space-y-4">
      <InputField
        label="Título"
        value={(content.title as string) || ""}
        onChange={(v) => onChange({ ...content, title: v })}
      />
      <InputField
        label="Subtítulo"
        value={(content.subtitle as string) || ""}
        onChange={(v) => onChange({ ...content, subtitle: v })}
      />
      <TextareaField
        label="Descrição"
        value={(content.description as string) || ""}
        onChange={(v) => onChange({ ...content, description: v })}
        rows={2}
      />

      {/* Features */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-gray-600">Features</span>
        {features.map((feature, index) => (
          <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Feature {index + 1}</span>
              <button onClick={() => removeFeature(index)} className="text-red-500">
                <HiOutlineTrash className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <SelectField
                label="Ícone"
                value={feature.icon}
                onChange={(v) => updateFeature(index, "icon", v)}
                options={[
                  { value: "shield", label: "Escudo" },
                  { value: "cube", label: "Cubo" },
                  { value: "support", label: "Suporte" },
                  { value: "sparkles", label: "Estrelas" },
                ]}
              />
              <InputField
                label="Título"
                value={feature.title}
                onChange={(v) => updateFeature(index, "title", v)}
              />
            </div>
            <InputField
              label="Descrição"
              value={feature.description}
              onChange={(v) => updateFeature(index, "description", v)}
            />
          </div>
        ))}
        <button
          onClick={addFeature}
          className="w-full py-1.5 text-xs border border-dashed border-gray-300 rounded hover:border-gray-400"
        >
          + Adicionar Feature
        </button>
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-gray-600">Estatísticas</span>
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-1">
              <input
                value={stat.value}
                onChange={(e) => updateStat(index, "value", e.target.value)}
                className="w-full px-2 py-1 text-xs border rounded"
                placeholder="10+"
              />
              <input
                value={stat.label}
                onChange={(e) => updateStat(index, "label", e.target.value)}
                className="w-full px-2 py-1 text-xs border rounded"
                placeholder="Anos"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// Maintenance Preview Editor
function MaintenancePreviewEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const services = (content.services as Array<{ icon: string; title: string; description: string }>) || [];

  const updateService = (index: number, field: string, value: string) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    onChange({ ...content, services: newServices });
  };

  return (
    <div className="space-y-3">
      <InputField
        label="Título"
        value={(content.title as string) || ""}
        onChange={(v) => onChange({ ...content, title: v })}
      />
      <InputField
        label="Subtítulo"
        value={(content.subtitle as string) || ""}
        onChange={(v) => onChange({ ...content, subtitle: v })}
      />
      <TextareaField
        label="Descrição"
        value={(content.description as string) || ""}
        onChange={(v) => onChange({ ...content, description: v })}
        rows={2}
      />

      {/* Services */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-gray-600">Serviços</span>
        {services.map((service, index) => (
          <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded space-y-2">
            <SelectField
              label="Ícone"
              value={service.icon}
              onChange={(v) => updateService(index, "icon", v)}
              options={[
                { value: "wrench", label: "Chave" },
                { value: "clock", label: "Relógio" },
                { value: "check", label: "Check" },
              ]}
            />
            <InputField
              label="Título"
              value={service.title}
              onChange={(v) => updateService(index, "title", v)}
            />
            <InputField
              label="Descrição"
              value={service.description}
              onChange={(v) => updateService(index, "description", v)}
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <InputField
          label="Botão - Texto"
          value={(content.buttonText as string) || ""}
          onChange={(v) => onChange({ ...content, buttonText: v })}
        />
        <InputField
          label="Botão - Link"
          value={(content.buttonLink as string) || ""}
          onChange={(v) => onChange({ ...content, buttonLink: v })}
        />
      </div>
    </div>
  );
}

// Catalog CTA Editor
function CatalogCTAEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <InputField
        label="Título"
        value={(content.title as string) || ""}
        onChange={(v) => onChange({ ...content, title: v })}
      />
      <InputField
        label="Subtítulo"
        value={(content.subtitle as string) || ""}
        onChange={(v) => onChange({ ...content, subtitle: v })}
      />
      <TextareaField
        label="Descrição"
        value={(content.description as string) || ""}
        onChange={(v) => onChange({ ...content, description: v })}
        rows={2}
      />
      <div className="grid grid-cols-2 gap-2">
        <InputField
          label="Telefone (formatado)"
          value={(content.phone as string) || ""}
          onChange={(v) => onChange({ ...content, phone: v })}
          placeholder="(11) 98198-2279"
        />
        <InputField
          label="Telefone (raw)"
          value={(content.phoneRaw as string) || ""}
          onChange={(v) => onChange({ ...content, phoneRaw: v })}
          placeholder=""
        />
      </div>
      <TextareaField
        label="Mensagem WhatsApp"
        value={(content.whatsappMessage as string) || ""}
        onChange={(v) => onChange({ ...content, whatsappMessage: v })}
        rows={2}
      />
      <div className="grid grid-cols-2 gap-2">
        <InputField
          label="Botão Catálogo"
          value={(content.buttonText as string) || ""}
          onChange={(v) => onChange({ ...content, buttonText: v })}
        />
        <InputField
          label="Botão Consultor"
          value={(content.consultorButtonText as string) || ""}
          onChange={(v) => onChange({ ...content, consultorButtonText: v })}
        />
      </div>
    </div>
  );
}

// Text Editor
function TextEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <InputField
        label="Subtítulo"
        value={(content.subtitle as string) || ""}
        onChange={(v) => onChange({ ...content, subtitle: v })}
      />
      <InputField
        label="Título"
        value={(content.title as string) || ""}
        onChange={(v) => onChange({ ...content, title: v })}
      />
      <TextareaField
        label="Conteúdo"
        value={(content.content as string) || ""}
        onChange={(v) => onChange({ ...content, content: v })}
        rows={4}
      />
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          label="Alinhamento"
          value={(content.align as string) || "left"}
          onChange={(v) => onChange({ ...content, align: v })}
          options={[
            { value: "left", label: "Esquerda" },
            { value: "center", label: "Centro" },
            { value: "right", label: "Direita" },
          ]}
        />
        <SelectField
          label="Fundo"
          value={(content.background as string) || "white"}
          onChange={(v) => onChange({ ...content, background: v })}
          options={[
            { value: "white", label: "Branco" },
            { value: "gray", label: "Cinza" },
            { value: "black", label: "Preto" },
          ]}
        />
      </div>
    </div>
  );
}

// Gallery Editor
function GalleryEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const images = (content.images as string[]) || [];
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        onChange({ ...content, images: [...images, data.url] });
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <InputField
        label="Título"
        value={(content.title as string) || ""}
        onChange={(v) => onChange({ ...content, title: v })}
      />
      <SelectField
        label="Colunas"
        value={String((content.columns as number) || 3)}
        onChange={(v) => onChange({ ...content, columns: parseInt(v) })}
        options={[
          { value: "2", label: "2 colunas" },
          { value: "3", label: "3 colunas" },
          { value: "4", label: "4 colunas" },
        ]}
      />
      <div>
        <span className="text-xs font-medium text-gray-600 mb-2 block">Imagens</span>
        <div className="grid grid-cols-4 gap-1">
          {images.map((img, index) => (
            <div key={index} className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded overflow-hidden group">
              <Image src={img} alt="" fill className="object-cover" />
              <button
                onClick={(e) => { e.stopPropagation(); onChange({ ...content, images: images.filter((_, i) => i !== index) }); }}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"
              >
                <HiOutlineTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
          <label className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-gray-400" onClick={(e) => e.stopPropagation()}>
            {uploading ? "..." : <HiOutlinePlus className="w-4 h-4 text-gray-400" />}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} onClick={(e) => e.stopPropagation()} />
          </label>
        </div>
      </div>
    </div>
  );
}

// Video Editor
function VideoEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <InputField
        label="Título"
        value={(content.title as string) || ""}
        onChange={(v) => onChange({ ...content, title: v })}
      />
      <InputField
        label="URL do Vídeo"
        value={(content.url as string) || ""}
        onChange={(v) => onChange({ ...content, url: v })}
        placeholder="https://youtube.com/..."
      />
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={(content.autoplay as boolean) || false}
            onChange={(e) => onChange({ ...content, autoplay: e.target.checked })}
          />
          Autoplay
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={(content.controls as boolean) !== false}
            onChange={(e) => onChange({ ...content, controls: e.target.checked })}
          />
          Controles
        </label>
      </div>
    </div>
  );
}

// Features Editor
function FeaturesEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const items = (content.items as Array<{ icon: string; title: string; description: string }>) || [];

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...content, items: newItems });
  };

  return (
    <div className="space-y-3">
      <InputField
        label="Título"
        value={(content.title as string) || ""}
        onChange={(v) => onChange({ ...content, title: v })}
      />
      <InputField
        label="Subtítulo"
        value={(content.subtitle as string) || ""}
        onChange={(v) => onChange({ ...content, subtitle: v })}
      />
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          label="Colunas"
          value={String((content.columns as number) || 3)}
          onChange={(v) => onChange({ ...content, columns: parseInt(v) })}
          options={[
            { value: "2", label: "2 colunas" },
            { value: "3", label: "3 colunas" },
            { value: "4", label: "4 colunas" },
          ]}
        />
        <SelectField
          label="Fundo"
          value={(content.background as string) || "white"}
          onChange={(v) => onChange({ ...content, background: v })}
          options={[
            { value: "white", label: "Branco" },
            { value: "gray", label: "Cinza" },
            { value: "black", label: "Preto" },
          ]}
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Itens</label>
        {items.map((item, index) => (
          <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded space-y-1">
            <div className="flex gap-2">
              <input
                value={item.icon || ""}
                onChange={(e) => updateItem(index, "icon", e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                className="w-16 px-2 py-1 text-xs border rounded dark:bg-gray-600 dark:border-gray-500"
                placeholder="Ícone"
              />
              <input
                value={item.title}
                onChange={(e) => updateItem(index, "title", e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                className="flex-1 px-2 py-1 text-xs border rounded dark:bg-gray-600 dark:border-gray-500"
                placeholder="Título"
              />
              <button
                onClick={(e) => { e.stopPropagation(); onChange({ ...content, items: items.filter((_, i) => i !== index) }); }}
                className="text-red-500 hover:text-red-700"
              >
                <HiOutlineTrash className="w-3 h-3" />
              </button>
            </div>
            <textarea
              value={item.description}
              onChange={(e) => updateItem(index, "description", e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-600 dark:border-gray-500"
              placeholder="Descrição"
              rows={2}
            />
          </div>
        ))}
        <button
          onClick={(e) => { e.stopPropagation(); onChange({ ...content, items: [...items, { icon: "star", title: "", description: "" }] }); }}
          className="w-full py-1.5 text-xs border border-dashed rounded hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          + Adicionar Item
        </button>
      </div>
    </div>
  );
}

// CTA Editor
function CTAEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <InputField
        label="Título"
        value={(content.title as string) || ""}
        onChange={(v) => onChange({ ...content, title: v })}
      />
      <TextareaField
        label="Descrição"
        value={(content.description as string) || ""}
        onChange={(v) => onChange({ ...content, description: v })}
        rows={2}
      />
      <div className="grid grid-cols-2 gap-2">
        <InputField
          label="Botão - Texto"
          value={(content.buttonText as string) || ""}
          onChange={(v) => onChange({ ...content, buttonText: v })}
        />
        <InputField
          label="Botão - Link"
          value={(content.buttonLink as string) || ""}
          onChange={(v) => onChange({ ...content, buttonLink: v })}
        />
      </div>
      <SelectField
        label="Fundo"
        value={(content.background as string) || "black"}
        onChange={(v) => onChange({ ...content, background: v })}
        options={[
          { value: "white", label: "Branco" },
          { value: "gray", label: "Cinza" },
          { value: "black", label: "Preto" },
        ]}
      />
    </div>
  );
}

// Cards Editor
function CardsEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const cards = (content.cards as Array<{ image: string; title: string; description: string; link: string }>) || [];
  const [uploading, setUploading] = useState<number | null>(null);

  const updateCard = (index: number, field: string, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    onChange({ ...content, cards: newCards });
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(index);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        updateCard(index, "image", data.url);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-3">
      <InputField
        label="Título"
        value={(content.title as string) || ""}
        onChange={(v) => onChange({ ...content, title: v })}
      />
      <InputField
        label="Subtítulo"
        value={(content.subtitle as string) || ""}
        onChange={(v) => onChange({ ...content, subtitle: v })}
      />
      <SelectField
        label="Colunas"
        value={String((content.columns as number) || 3)}
        onChange={(v) => onChange({ ...content, columns: parseInt(v) })}
        options={[
          { value: "2", label: "2 colunas" },
          { value: "3", label: "3 colunas" },
          { value: "4", label: "4 colunas" },
        ]}
      />
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Cards</label>
        {cards.map((card, index) => (
          <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-500">Card {index + 1}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onChange({ ...content, cards: cards.filter((_, i) => i !== index) }); }}
                className="text-red-500 hover:text-red-700"
              >
                <HiOutlineTrash className="w-3 h-3" />
              </button>
            </div>
            <div className="flex gap-2">
              {card.image && (
                <div className="relative w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  <Image src={card.image} alt="" fill className="object-cover" />
                </div>
              )}
              <label className="flex-1 flex items-center justify-center gap-1 px-2 py-1 border border-dashed border-gray-300 rounded cursor-pointer hover:border-gray-400 text-xs">
                <HiOutlineUpload className="w-3 h-3" />
                <span>{uploading === index ? "..." : "Imagem"}</span>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e)} className="hidden" onClick={(e) => e.stopPropagation()} />
              </label>
            </div>
            <input
              value={card.title}
              onChange={(e) => updateCard(index, "title", e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-600 dark:border-gray-500"
              placeholder="Título"
            />
            <textarea
              value={card.description}
              onChange={(e) => updateCard(index, "description", e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-600 dark:border-gray-500"
              placeholder="Descrição"
              rows={2}
            />
            <input
              value={card.link}
              onChange={(e) => updateCard(index, "link", e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              className="w-full px-2 py-1 text-xs border rounded dark:bg-gray-600 dark:border-gray-500"
              placeholder="Link"
            />
          </div>
        ))}
        <button
          onClick={(e) => { e.stopPropagation(); onChange({ ...content, cards: [...cards, { image: "", title: "", description: "", link: "" }] }); }}
          className="w-full py-1.5 text-xs border border-dashed rounded hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          + Adicionar Card
        </button>
      </div>
    </div>
  );
}

// Contact Hero Editor
function ContactHeroEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <InputField
        label="Badge"
        value={(content.badge as string) || ""}
        onChange={(v) => onChange({ ...content, badge: v })}
        placeholder="Contato IP3D"
      />
      <InputField
        label="Título"
        value={(content.title as string) || ""}
        onChange={(v) => onChange({ ...content, title: v })}
        placeholder="Fale com a IP3D"
      />
      <TextareaField
        label="Descrição"
        value={(content.description as string) || ""}
        onChange={(v) => onChange({ ...content, description: v })}
        rows={3}
      />
      <InputField
        label="Imagem de fundo"
        value={(content.image as string) || ""}
        onChange={(v) => onChange({ ...content, image: v })}
        placeholder="/images/banners/contact-hero.svg"
      />
      <InputField
        label="Overlay escuro (0-100)"
        value={String(content.overlay ?? 60)}
        onChange={(v) => {
          const parsed = Number(v);
          onChange({ ...content, overlay: Number.isFinite(parsed) ? parsed : 60 });
        }}
        placeholder="60"
      />
    </div>
  );
}

// Contact Options Editor
function ContactOptionsEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const options = (content.options as Array<{
    icon?: string;
    title?: string;
    description?: string;
    action?: string;
  }>) || [];

  const updateOption = (index: number, field: string, value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onChange({ ...content, options: newOptions });
  };

  const addOption = () => {
    onChange({
      ...content,
      options: [...options, { icon: "download", title: "Nova Opção", description: "", action: "contact" }],
    });
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">Opção {index + 1}</span>
            {options.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); onChange({ ...content, options: options.filter((_, i) => i !== index) }); }}
                className="text-red-500 text-xs"
              >
                Remover
              </button>
            )}
          </div>
          <SelectField
            label="Ícone"
            value={option.icon || "download"}
            onChange={(v) => updateOption(index, "icon", v)}
            options={[
              { value: "download", label: "Download" },
              { value: "chat", label: "Chat" },
              { value: "calendar", label: "Calendário" },
              { value: "phone", label: "Telefone" },
              { value: "mail", label: "Email" },
            ]}
          />
          <InputField
            label="Título"
            value={option.title || ""}
            onChange={(v) => updateOption(index, "title", v)}
          />
          <InputField
            label="Descrição"
            value={option.description || ""}
            onChange={(v) => updateOption(index, "description", v)}
          />
          <SelectField
            label="Ação"
            value={option.action || "contact"}
            onChange={(v) => updateOption(index, "action", v)}
            options={[
              { value: "catalog", label: "Abrir Formulário Catálogo" },
              { value: "contact", label: "Abrir Formulário Contato" },
            ]}
          />
        </div>
      ))}
      <button
        onClick={(e) => { e.stopPropagation(); addOption(); }}
        className="w-full py-2 text-xs border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
      >
        + Adicionar Opção
      </button>
    </div>
  );
}

// Contact Info Editor
function ContactInfoEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <InputField
        label="Título da Seção"
        value={(content.title as string) || ""}
        onChange={(v) => onChange({ ...content, title: v })}
        placeholder="Informações de Contato"
      />
      <InputField
        label="Telefone"
        value={(content.phone as string) || ""}
        onChange={(v) => onChange({ ...content, phone: v })}
        placeholder="(11) 98198-2279"
      />
      <InputField
        label="Telefone (formato link)"
        value={(content.phoneRaw as string) || ""}
        onChange={(v) => onChange({ ...content, phoneRaw: v })}
        placeholder=""
      />
      <InputField
        label="E-mail"
        value={(content.email as string) || ""}
        onChange={(v) => onChange({ ...content, email: v })}
        placeholder="contato@exemplo.com"
      />
      <InputField
        label="Endereço Linha 1"
        value={(content.address1 as string) || ""}
        onChange={(v) => onChange({ ...content, address1: v })}
        placeholder="São Paulo, SP"
      />
      <InputField
        label="Endereço Linha 2"
        value={(content.address2 as string) || ""}
        onChange={(v) => onChange({ ...content, address2: v })}
        placeholder="Brasil"
      />
      <TextareaField
        label="Horário de Atendimento"
        value={(content.hours as string) || ""}
        onChange={(v) => onChange({ ...content, hours: v })}
        placeholder="Segunda a Sexta: 9h às 18h"
        rows={2}
      />
      <InputField
        label="Texto Botão WhatsApp"
        value={(content.whatsappButtonText as string) || ""}
        onChange={(v) => onChange({ ...content, whatsappButtonText: v })}
        placeholder="Chamar no WhatsApp"
      />
      <TextareaField
        label="Mensagem WhatsApp"
        value={(content.whatsappMessage as string) || ""}
        onChange={(v) => onChange({ ...content, whatsappMessage: v })}
        rows={2}
      />
    </div>
  );
}

// Maintenance Hero Editor
function MaintenanceHeroEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <InputField
        label="Badge"
        value={(content.badge as string) || ""}
        onChange={(v) => onChange({ ...content, badge: v })}
        placeholder="Ex: Suporte Técnico"
      />
      <InputField
        label="Título"
        value={(content.title as string) || ""}
        onChange={(v) => onChange({ ...content, title: v })}
        placeholder="Manutenção"
      />
      <TextareaField
        label="Descrição"
        value={(content.description as string) || ""}
        onChange={(v) => onChange({ ...content, description: v })}
        rows={3}
      />
      <ImageUploader
        label="Imagem"
        value={(content.image as string) || ""}
        onChange={(v) => onChange({ ...content, image: v })}
      />
      <InputField
        label="Texto do Botão"
        value={(content.buttonText as string) || ""}
        onChange={(v) => onChange({ ...content, buttonText: v })}
        placeholder="Solicitar Manutenção"
      />
      <InputField
        label="Link WhatsApp"
        value={(content.whatsappLink as string) || ""}
        onChange={(v) => onChange({ ...content, whatsappLink: v })}
        placeholder="https://wa.me/..."
      />
    </div>
  );
}

// Maintenance Services Editor
function MaintenanceServicesEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const services = (content.services as Array<{
    icon?: string;
    title?: string;
    description?: string;
    features?: string[];
  }>) || [];

  const updateService = (index: number, field: string, value: unknown) => {
    const newServices = [...services];
    newServices[index] = { ...newServices[index], [field]: value };
    onChange({ ...content, services: newServices });
  };

  return (
    <div className="space-y-3">
      <InputField
        label="Badge"
        value={(content.badge as string) || ""}
        onChange={(v) => onChange({ ...content, badge: v })}
      />
      <InputField
        label="Título"
        value={(content.title as string) || ""}
        onChange={(v) => onChange({ ...content, title: v })}
      />
      {services.map((service, index) => (
        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">Serviço {index + 1}</span>
            {services.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); onChange({ ...content, services: services.filter((_, i) => i !== index) }); }}
                className="text-red-500 text-xs"
              >
                Remover
              </button>
            )}
          </div>
          <SelectField
            label="Ícone"
            value={service.icon || "wrench"}
            onChange={(v) => updateService(index, "icon", v)}
            options={[
              { value: "wrench", label: "Chave" },
              { value: "clock", label: "Relógio" },
              { value: "check", label: "Check" },
              { value: "shield", label: "Escudo" },
              { value: "truck", label: "Caminhão" },
            ]}
          />
          <InputField label="Título" value={service.title || ""} onChange={(v) => updateService(index, "title", v)} />
          <TextareaField label="Descrição" value={service.description || ""} onChange={(v) => updateService(index, "description", v)} rows={2} />
          <TextareaField
            label="Features (uma por linha)"
            value={(service.features || []).join("\n")}
            onChange={(v) => updateService(index, "features", v.split("\n").filter(Boolean))}
            rows={3}
          />
        </div>
      ))}
      <button
        onClick={(e) => { e.stopPropagation(); onChange({ ...content, services: [...services, { icon: "wrench", title: "", description: "", features: [] }] }); }}
        className="w-full py-2 text-xs border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
      >
        + Adicionar Serviço
      </button>
    </div>
  );
}

// Maintenance Benefits Editor
function MaintenanceBenefitsEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const benefits = (content.benefits as Array<{
    icon?: string;
    title?: string;
    description?: string;
  }>) || [];

  const updateBenefit = (index: number, field: string, value: string) => {
    const newBenefits = [...benefits];
    newBenefits[index] = { ...newBenefits[index], [field]: value };
    onChange({ ...content, benefits: newBenefits });
  };

  return (
    <div className="space-y-3">
      <InputField label="Badge" value={(content.badge as string) || ""} onChange={(v) => onChange({ ...content, badge: v })} />
      <InputField label="Título" value={(content.title as string) || ""} onChange={(v) => onChange({ ...content, title: v })} />
      <TextareaField label="Descrição" value={(content.description as string) || ""} onChange={(v) => onChange({ ...content, description: v })} rows={2} />
      {benefits.map((benefit, index) => (
        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">Benefício {index + 1}</span>
            {benefits.length > 1 && (
              <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, benefits: benefits.filter((_, i) => i !== index) }); }} className="text-red-500 text-xs">Remover</button>
            )}
          </div>
          <SelectField
            label="Ícone"
            value={benefit.icon || "shield"}
            onChange={(v) => updateBenefit(index, "icon", v)}
            options={[
              { value: "shield", label: "Escudo" },
              { value: "truck", label: "Caminhão" },
              { value: "clock", label: "Relógio" },
              { value: "check", label: "Check" },
            ]}
          />
          <InputField label="Título" value={benefit.title || ""} onChange={(v) => updateBenefit(index, "title", v)} />
          <InputField label="Descrição" value={benefit.description || ""} onChange={(v) => updateBenefit(index, "description", v)} />
        </div>
      ))}
      <button
        onClick={(e) => { e.stopPropagation(); onChange({ ...content, benefits: [...benefits, { icon: "shield", title: "", description: "" }] }); }}
        className="w-full py-2 text-xs border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
      >
        + Adicionar Benefício
      </button>
    </div>
  );
}

// Maintenance CTA Editor
function MaintenanceCTAEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <InputField label="Título" value={(content.title as string) || ""} onChange={(v) => onChange({ ...content, title: v })} />
      <TextareaField label="Descrição" value={(content.description as string) || ""} onChange={(v) => onChange({ ...content, description: v })} rows={2} />
      <InputField label="Texto do Botão" value={(content.buttonText as string) || ""} onChange={(v) => onChange({ ...content, buttonText: v })} />
      <InputField label="Link WhatsApp" value={(content.whatsappLink as string) || ""} onChange={(v) => onChange({ ...content, whatsappLink: v })} />
    </div>
  );
}

// Maintenance FAQ Editor
function MaintenanceFAQEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const faqs = (content.faqs as Array<{ question?: string; answer?: string }>) || [];

  const updateFaq = (index: number, field: string, value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    onChange({ ...content, faqs: newFaqs });
  };

  return (
    <div className="space-y-3">
      <InputField label="Badge" value={(content.badge as string) || ""} onChange={(v) => onChange({ ...content, badge: v })} />
      <InputField label="Título" value={(content.title as string) || ""} onChange={(v) => onChange({ ...content, title: v })} />
      {faqs.map((faq, index) => (
        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">Pergunta {index + 1}</span>
            {faqs.length > 1 && (
              <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, faqs: faqs.filter((_, i) => i !== index) }); }} className="text-red-500 text-xs">Remover</button>
            )}
          </div>
          <InputField label="Pergunta" value={faq.question || ""} onChange={(v) => updateFaq(index, "question", v)} />
          <TextareaField label="Resposta" value={faq.answer || ""} onChange={(v) => updateFaq(index, "answer", v)} rows={3} />
        </div>
      ))}
      <button
        onClick={(e) => { e.stopPropagation(); onChange({ ...content, faqs: [...faqs, { question: "", answer: "" }] }); }}
        className="w-full py-2 text-xs border border-dashed border-gray-300 rounded-lg hover:bg-gray-50"
      >
        + Adicionar Pergunta
      </button>
    </div>
  );
}

// Products Hero Editor
function ProductsHeroEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <InputField label="Badge" value={(content.badge as string) || ""} onChange={(v) => onChange({ ...content, badge: v })} placeholder="Peças e Componentes 3D" />
      <InputField label="Título" value={(content.title as string) || ""} onChange={(v) => onChange({ ...content, title: v })} placeholder="Componentes para impressoras 3D" />
      <TextareaField label="Descrição" value={(content.description as string) || ""} onChange={(v) => onChange({ ...content, description: v })} rows={3} />
    </div>
  );
}

// Products Grid Editor - escolhe modo de exibição e filtra categorias/produtos
function ProductsGridEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loadingData, setLoadingData] = useState(true);

  const mode = (content.mode as string) || "all";
  const selectedCategories = (content.selectedCategories as string[]) || [];
  const selectedProducts = (content.selectedProducts as string[]) || [];

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then(r => r.json()),
      fetch("/api/products").then(r => r.json()),
    ]).then(([catData, prodData]) => {
      setCategories(catData.categories || []);
      setProducts(prodData.products || []);
    }).finally(() => setLoadingData(false));
  }, []);

  const toggleCategory = (slug: string) => {
    const newSelected = selectedCategories.includes(slug)
      ? selectedCategories.filter(s => s !== slug)
      : [...selectedCategories, slug];
    onChange({ ...content, selectedCategories: newSelected });
  };

  const toggleProduct = (id: string) => {
    const newSelected = selectedProducts.includes(id)
      ? selectedProducts.filter(s => s !== id)
      : [...selectedProducts, id];
    onChange({ ...content, selectedProducts: newSelected });
  };

  return (
    <div className="space-y-4">
      <div onClick={(e) => e.stopPropagation()}>
        <SelectField
          label="Modo de Exibição"
          value={mode}
          onChange={(v) => onChange({ ...content, mode: v })}
          options={[
            { value: "all", label: "Todos os Produtos" },
            { value: "categories", label: "Por Categorias" },
            { value: "selected", label: "Produtos Específicos" },
          ]}
        />
      </div>

      {mode === "categories" && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Categorias</label>
          {loadingData ? (
            <div className="text-xs text-gray-400">Carregando...</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={(e) => { e.stopPropagation(); toggleCategory(cat.slug); }}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    selectedCategories.includes(cat.slug)
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === "selected" && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Produtos ({selectedProducts.length} selecionados)</label>
          {loadingData ? (
            <div className="text-xs text-gray-400">Carregando...</div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-2">
              {products.map(prod => (
                <label key={prod.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(prod.id)}
                    onChange={() => toggleProduct(prod.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{prod.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      <div onClick={(e) => e.stopPropagation()}>
        <InputField
          label="Limite de Produtos"
          value={String((content.limit as number) || "")}
          onChange={(v) => onChange({ ...content, limit: v ? parseInt(v) : null })}
          placeholder="Deixe vazio para todos"
          type="number"
        />
      </div>
    </div>
  );
}

// Products CTA Editor
function ProductsCTAEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <InputField label="Título" value={(content.title as string) || ""} onChange={(v) => onChange({ ...content, title: v })} />
      <TextareaField label="Descrição" value={(content.description as string) || ""} onChange={(v) => onChange({ ...content, description: v })} rows={2} />
      <InputField label="Texto Botão Principal" value={(content.buttonText as string) || ""} onChange={(v) => onChange({ ...content, buttonText: v })} />
      <InputField label="Link WhatsApp" value={(content.whatsappLink as string) || ""} onChange={(v) => onChange({ ...content, whatsappLink: v })} />
      <InputField label="Texto Botão Secundário" value={(content.secondaryButtonText as string) || ""} onChange={(v) => onChange({ ...content, secondaryButtonText: v })} />
      <InputField label="Link Secundário" value={(content.secondaryLink as string) || ""} onChange={(v) => onChange({ ...content, secondaryLink: v })} />
    </div>
  );
}

// About Hero Editor
function AboutHeroEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <InputField label="Badge" value={(content.badge as string) || ""} onChange={(v) => onChange({ ...content, badge: v })} placeholder="Conheça a IP3D" />
      <TextareaField label="Título (use | para quebra)" value={(content.title as string) || ""} onChange={(v) => onChange({ ...content, title: v })} rows={2} placeholder="Especialistas em|impressão 3D" />
      <TextareaField label="Descrição" value={(content.description as string) || ""} onChange={(v) => onChange({ ...content, description: v })} rows={3} />
      <InputField label="Texto Botão Principal" value={(content.buttonText as string) || ""} onChange={(v) => onChange({ ...content, buttonText: v })} />
      <InputField label="Link Principal" value={(content.buttonLink as string) || ""} onChange={(v) => onChange({ ...content, buttonLink: v })} />
      <InputField label="Texto Botão Secundário" value={(content.secondaryButtonText as string) || ""} onChange={(v) => onChange({ ...content, secondaryButtonText: v })} />
      <InputField label="Link Secundário" value={(content.secondaryLink as string) || ""} onChange={(v) => onChange({ ...content, secondaryLink: v })} />
      <ImageUploader label="Imagem Hero" value={(content.image as string) || ""} onChange={(v) => onChange({ ...content, image: v })} />
      <InputField label="Stat 1 Valor" value={(content.stat1Value as string) || ""} onChange={(v) => onChange({ ...content, stat1Value: v })} placeholder="10+" />
      <InputField label="Stat 1 Label" value={(content.stat1Label as string) || ""} onChange={(v) => onChange({ ...content, stat1Label: v })} placeholder="Anos de mercado" />
      <InputField label="Stat 2 Valor" value={(content.stat2Value as string) || ""} onChange={(v) => onChange({ ...content, stat2Value: v })} placeholder="500+" />
      <InputField label="Stat 2 Label" value={(content.stat2Label as string) || ""} onChange={(v) => onChange({ ...content, stat2Label: v })} placeholder="Clientes" />
    </div>
  );
}

// About Mission Editor
function AboutMissionEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <InputField label="Badge" value={(content.badge as string) || ""} onChange={(v) => onChange({ ...content, badge: v })} placeholder="Nossa Missão" />
      <TextareaField label="Citação" value={(content.quote as string) || ""} onChange={(v) => onChange({ ...content, quote: v })} rows={4} />
      <InputField label="Autor" value={(content.author as string) || ""} onChange={(v) => onChange({ ...content, author: v })} placeholder="— Nossa Equipe" />
    </div>
  );
}

// About Values Editor
function AboutValuesEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const values = (content.values as Array<{ title: string; description: string }>) || [];
  
  const updateValue = (index: number, field: string, value: string) => {
    const newValues = [...values];
    newValues[index] = { ...newValues[index], [field]: value };
    onChange({ ...content, values: newValues });
  };

  const addValue = () => {
    onChange({ ...content, values: [...values, { title: "", description: "" }] });
  };

  const removeValue = (index: number) => {
    onChange({ ...content, values: values.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <InputField label="Badge" value={(content.badge as string) || ""} onChange={(v) => onChange({ ...content, badge: v })} placeholder="Nossos Valores" />
      <InputField label="Título" value={(content.title as string) || ""} onChange={(v) => onChange({ ...content, title: v })} placeholder="O que nos guia" />
      <div className="space-y-3">
        <label className="block text-xs font-medium text-gray-600">Valores</label>
        {values.map((val, i) => (
          <div key={i} className="p-3 border border-gray-200 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Valor {i + 1}</span>
              <button onClick={(e) => { e.stopPropagation(); removeValue(i); }} className="text-red-500 text-xs">Remover</button>
            </div>
            <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" placeholder="Título" value={val.title} onChange={(e) => updateValue(i, "title", e.target.value)} onClick={(e) => e.stopPropagation()} />
            <textarea className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" placeholder="Descrição" rows={2} value={val.description} onChange={(e) => updateValue(i, "description", e.target.value)} onClick={(e) => e.stopPropagation()} />
            <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg" placeholder="Ícone (emoji, ex: ✨ 💡 ❤️ 🤝)" value={(val as Record<string, string>).icon || ""} onChange={(e) => updateValue(i, "icon", e.target.value)} onClick={(e) => e.stopPropagation()} />
          </div>
        ))}
        <button onClick={(e) => { e.stopPropagation(); addValue(); }} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400">+ Adicionar Valor</button>
      </div>
    </div>
  );
}

// About Partnership Editor
function AboutPartnershipEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <InputField label="Badge" value={(content.badge as string) || ""} onChange={(v) => onChange({ ...content, badge: v })} placeholder="Parceria Exclusiva" />
      <InputField label="Título" value={(content.title as string) || ""} onChange={(v) => onChange({ ...content, title: v })} />
      <TextareaField label="Descrição 1" value={(content.description1 as string) || ""} onChange={(v) => onChange({ ...content, description1: v })} rows={3} />
      <TextareaField label="Descrição 2" value={(content.description2 as string) || ""} onChange={(v) => onChange({ ...content, description2: v })} rows={3} />
      <InputField label="Texto do Botão" value={(content.buttonText as string) || ""} onChange={(v) => onChange({ ...content, buttonText: v })} />
      <InputField label="Link do Botão" value={(content.buttonLink as string) || ""} onChange={(v) => onChange({ ...content, buttonLink: v })} />
      <ImageUploader label="Imagem da Parceria" value={(content.image as string) || ""} onChange={(v) => onChange({ ...content, image: v })} />
      <InputField label="Badge Anos" value={(content.yearsBadge as string) || ""} onChange={(v) => onChange({ ...content, yearsBadge: v })} placeholder="55+" />
      <InputField label="Badge Anos Label" value={(content.yearsBadgeLabel as string) || ""} onChange={(v) => onChange({ ...content, yearsBadgeLabel: v })} placeholder="Anos de história" />
    </div>
  );
}

// About CTA Editor
function AboutCTAEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <InputField label="Título" value={(content.title as string) || ""} onChange={(v) => onChange({ ...content, title: v })} />
      <TextareaField label="Descrição" value={(content.description as string) || ""} onChange={(v) => onChange({ ...content, description: v })} rows={2} />
      <InputField label="Texto Botão Principal" value={(content.buttonText as string) || ""} onChange={(v) => onChange({ ...content, buttonText: v })} />
      <InputField label="Link Principal" value={(content.buttonLink as string) || ""} onChange={(v) => onChange({ ...content, buttonLink: v })} />
      <InputField label="Texto Botão Secundário" value={(content.secondaryButtonText as string) || ""} onChange={(v) => onChange({ ...content, secondaryButtonText: v })} />
      <InputField label="Link Secundário (WhatsApp)" value={(content.secondaryLink as string) || ""} onChange={(v) => onChange({ ...content, secondaryLink: v })} />
    </div>
  );
}







// Landing Page Salão de Beleza - Editor Completo
function LPSalaoContentEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const [activeSection, setActiveSection] = useState("hero");
  const [uploading, setUploading] = useState<string | null>(null);
  
  const workstations = (content.workstations as Array<{ name: string; tagline: string; concept: string; operational: string; application: string; image: string; slug: string }>) || [];
  const technologies = (content.technologies as Array<{ name: string; tagline: string; icon: string; function: string; impact: string; image: string; slug: string }>) || [];
  const journeySteps = (content.journeySteps as Array<{ step: number; title: string; description: string }>) || [];
  const galleryImages = (content.galleryImages as Array<{ src: string; alt: string }>) || [];
  const painPoints = (content.problemPainPoints as string[]) || [];

  // Função de upload de imagem
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: string,
    arrayField?: string,
    arrayIndex?: number,
    arrayImageKey?: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(fieldKey);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        if (arrayField && arrayIndex !== undefined && arrayImageKey) {
          // Upload para item de array (workstations, technologies, gallery)
          const arr = [...(content[arrayField] as Array<Record<string, unknown>>)];
          arr[arrayIndex] = { ...arr[arrayIndex], [arrayImageKey]: data.url };
          onChange({ ...content, [arrayField]: arr });
        } else {
          // Upload para campo simples
          onChange({ ...content, [fieldKey]: data.url });
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(null);
    }
  };

  // Componente de upload de imagem com preview
  const renderImageUploadField = ({ 
    label, 
    value, 
    fieldKey,
    arrayField,
    arrayIndex,
    arrayImageKey
  }: { 
    label: string; 
    value: string; 
    fieldKey: string;
    arrayField?: string;
    arrayIndex?: number;
    arrayImageKey?: string;
  }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex gap-2 items-start">
        {value && (
          <div className="relative w-20 h-20 rounded overflow-hidden border bg-gray-100 flex-shrink-0">
            <img src={value} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <label 
            className={`flex items-center justify-center w-full h-10 border-2 border-dashed rounded cursor-pointer hover:border-gray-400 transition-colors ${uploading === fieldKey ? 'opacity-50' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, fieldKey, arrayField, arrayIndex, arrayImageKey)}
              onClick={(e) => e.stopPropagation()}
              disabled={uploading === fieldKey}
            />
            <span className="text-xs text-gray-500">
              {uploading === fieldKey ? "Enviando..." : "Clique para trocar"}
            </span>
          </label>
          <input 
            type="text" 
            value={value} 
            onChange={(e) => {
              if (arrayField && arrayIndex !== undefined && arrayImageKey) {
                const arr = [...(content[arrayField] as Array<Record<string, unknown>>)];
                arr[arrayIndex] = { ...arr[arrayIndex], [arrayImageKey]: e.target.value };
                onChange({ ...content, [arrayField]: arr });
              } else {
                onChange({ ...content, [fieldKey]: e.target.value });
              }
            }}
            placeholder="/images/site/..."
            className="w-full mt-1 px-2 py-1 text-xs border rounded"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );

  const sections = [
    { id: "hero", label: "Hero" },
    { id: "problem", label: "Problema" },
    { id: "workstations", label: "Estações" },
    { id: "tech", label: "Tecnologia" },
    { id: "journey", label: "Jornada" },
    { id: "gallery", label: "Galeria" },
    { id: "cta", label: "CTA Final" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b pb-2">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={(e) => { e.stopPropagation(); setActiveSection(s.id); }}
            className={`px-2 py-1 text-xs rounded ${activeSection === s.id ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === "hero" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Seção Hero</h4>
          {renderImageUploadField({ label: "Imagem Hero", value: (content.heroImage as string) || "", fieldKey: "heroImage" })}
          <InputField label="Badge" value={(content.heroBadge as string) || ""} onChange={(v) => onChange({ ...content, heroBadge: v })} placeholder="Head SPA Premium" />
          <InputField label="Título Principal" value={(content.heroTitle as string) || ""} onChange={(v) => onChange({ ...content, heroTitle: v })} placeholder="O Padrão Ouro do Head SPA:" />
          <InputField label="Título Destaque" value={(content.heroHighlight as string) || ""} onChange={(v) => onChange({ ...content, heroHighlight: v })} placeholder="Design Italiano e Tecnologia de Wellness." />
          <TextareaField label="Descrição" value={(content.heroDescription as string) || ""} onChange={(v) => onChange({ ...content, heroDescription: v })} rows={2} />
          <InputField label="Texto do Botão" value={(content.heroButtonText as string) || ""} onChange={(v) => onChange({ ...content, heroButtonText: v })} placeholder="Saiba Mais" />
          <InputField label="Link do Botão" value={(content.heroButtonLink as string) || ""} onChange={(v) => onChange({ ...content, heroButtonLink: v })} placeholder="/catalogo" />
        </div>
      )}

      {activeSection === "problem" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Seção Problema</h4>
          <InputField label="Título" value={(content.problemTitle as string) || ""} onChange={(v) => onChange({ ...content, problemTitle: v })} />
          <TextareaField label="Descrição" value={(content.problemDescription as string) || ""} onChange={(v) => onChange({ ...content, problemDescription: v })} rows={3} />
          <label className="block text-xs font-medium text-gray-600">Pain Points (um por linha)</label>
          <textarea
            className="w-full px-3 py-2 text-sm border rounded"
            rows={4}
            value={painPoints.join("\n")}
            onChange={(e) => onChange({ ...content, problemPainPoints: e.target.value.split("\n").filter(Boolean) })}
            onClick={(e) => e.stopPropagation()}
          />
          <InputField label="Título da Solução" value={(content.solutionTitle as string) || ""} onChange={(v) => onChange({ ...content, solutionTitle: v })} placeholder="Nossa Solução" />
          <TextareaField label="Descrição da Solução" value={(content.solutionDescription as string) || ""} onChange={(v) => onChange({ ...content, solutionDescription: v })} rows={3} />
          <InputField label="Nota da Solução" value={(content.solutionNote as string) || ""} onChange={(v) => onChange({ ...content, solutionNote: v })} />
        </div>
      )}

      {activeSection === "workstations" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Estações de Trabalho</h4>
          <InputField label="Badge" value={(content.workstationsBadge as string) || ""} onChange={(v) => onChange({ ...content, workstationsBadge: v })} />
          <InputField label="Título" value={(content.workstationsTitle as string) || ""} onChange={(v) => onChange({ ...content, workstationsTitle: v })} />
          <TextareaField label="Descrição" value={(content.workstationsDescription as string) || ""} onChange={(v) => onChange({ ...content, workstationsDescription: v })} rows={2} />
          {workstations.map((w, i) => (
            <div key={i} className="p-2 border rounded space-y-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Estação {i + 1}: {w.name}</span>
                <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, workstations: workstations.filter((_, idx) => idx !== i) }); }} className="text-red-500 text-xs">Remover</button>
              </div>
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Nome" value={w.name} onChange={(e) => { const nw = [...workstations]; nw[i] = { ...nw[i], name: e.target.value }; onChange({ ...content, workstations: nw }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Tagline" value={w.tagline} onChange={(e) => { const nw = [...workstations]; nw[i] = { ...nw[i], tagline: e.target.value }; onChange({ ...content, workstations: nw }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Conceito" rows={2} value={w.concept} onChange={(e) => { const nw = [...workstations]; nw[i] = { ...nw[i], concept: e.target.value }; onChange({ ...content, workstations: nw }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Operacional" rows={2} value={w.operational} onChange={(e) => { const nw = [...workstations]; nw[i] = { ...nw[i], operational: e.target.value }; onChange({ ...content, workstations: nw }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Aplicação" rows={2} value={w.application} onChange={(e) => { const nw = [...workstations]; nw[i] = { ...nw[i], application: e.target.value }; onChange({ ...content, workstations: nw }); }} onClick={(e) => e.stopPropagation()} />
              {renderImageUploadField({ label: "Imagem", value: w.image, fieldKey: `workstation-${i}`, arrayField: "workstations", arrayIndex: i, arrayImageKey: "image" })}
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Slug" value={w.slug} onChange={(e) => { const nw = [...workstations]; nw[i] = { ...nw[i], slug: e.target.value }; onChange({ ...content, workstations: nw }); }} onClick={(e) => e.stopPropagation()} />
            </div>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, workstations: [...workstations, { name: "", tagline: "", concept: "", operational: "", application: "", image: "", slug: "" }] }); }} className="w-full py-2 border border-dashed rounded text-sm text-gray-500">+ Adicionar Estação</button>
        </div>
      )}

      {activeSection === "tech" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Tecnologias</h4>
          <InputField label="Badge" value={(content.techBadge as string) || ""} onChange={(v) => onChange({ ...content, techBadge: v })} />
          <InputField label="Título" value={(content.techTitle as string) || ""} onChange={(v) => onChange({ ...content, techTitle: v })} />
          <TextareaField label="Descrição" value={(content.techDescription as string) || ""} onChange={(v) => onChange({ ...content, techDescription: v })} rows={2} />
          {technologies.map((t, i) => (
            <div key={i} className="p-2 border rounded space-y-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Tech {i + 1}: {t.name}</span>
                <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, technologies: technologies.filter((_, idx) => idx !== i) }); }} className="text-red-500 text-xs">Remover</button>
              </div>
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Nome" value={t.name} onChange={(e) => { const nt = [...technologies]; nt[i] = { ...nt[i], name: e.target.value }; onChange({ ...content, technologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Tagline" value={t.tagline} onChange={(e) => { const nt = [...technologies]; nt[i] = { ...nt[i], tagline: e.target.value }; onChange({ ...content, technologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Ícone (emoji)" value={t.icon} onChange={(e) => { const nt = [...technologies]; nt[i] = { ...nt[i], icon: e.target.value }; onChange({ ...content, technologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Função Técnica" rows={2} value={t.function} onChange={(e) => { const nt = [...technologies]; nt[i] = { ...nt[i], function: e.target.value }; onChange({ ...content, technologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Impacto" rows={2} value={t.impact} onChange={(e) => { const nt = [...technologies]; nt[i] = { ...nt[i], impact: e.target.value }; onChange({ ...content, technologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              {renderImageUploadField({ label: "Imagem", value: t.image, fieldKey: `tech-${i}`, arrayField: "technologies", arrayIndex: i, arrayImageKey: "image" })}
            </div>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, technologies: [...technologies, { name: "", tagline: "", icon: "", function: "", impact: "", image: "", slug: "" }] }); }} className="w-full py-2 border border-dashed rounded text-sm text-gray-500">+ Adicionar Tecnologia</button>
        </div>
      )}

      {activeSection === "journey" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Jornada do Cliente</h4>
          <InputField label="Badge" value={(content.journeyBadge as string) || ""} onChange={(v) => onChange({ ...content, journeyBadge: v })} />
          <InputField label="Título" value={(content.journeyTitle as string) || ""} onChange={(v) => onChange({ ...content, journeyTitle: v })} />
          <TextareaField label="Descrição" value={(content.journeyDescription as string) || ""} onChange={(v) => onChange({ ...content, journeyDescription: v })} rows={2} />
          <InputField label="Resultado" value={(content.journeyResult as string) || ""} onChange={(v) => onChange({ ...content, journeyResult: v })} />
          {renderImageUploadField({ label: "Imagem", value: (content.journeyImage as string) || "", fieldKey: "journeyImage" })}
          {journeySteps.map((j, i) => (
            <div key={i} className="p-2 border rounded space-y-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Passo {j.step}</span>
                <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, journeySteps: journeySteps.filter((_, idx) => idx !== i) }); }} className="text-red-500 text-xs">Remover</button>
              </div>
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Título" value={j.title} onChange={(e) => { const nj = [...journeySteps]; nj[i] = { ...nj[i], title: e.target.value }; onChange({ ...content, journeySteps: nj }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Descrição" rows={2} value={j.description} onChange={(e) => { const nj = [...journeySteps]; nj[i] = { ...nj[i], description: e.target.value }; onChange({ ...content, journeySteps: nj }); }} onClick={(e) => e.stopPropagation()} />
            </div>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, journeySteps: [...journeySteps, { step: journeySteps.length + 1, title: "", description: "" }] }); }} className="w-full py-2 border border-dashed rounded text-sm text-gray-500">+ Adicionar Passo</button>
        </div>
      )}

      {activeSection === "gallery" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Galeria</h4>
          <InputField label="Badge" value={(content.galleryBadge as string) || ""} onChange={(v) => onChange({ ...content, galleryBadge: v })} />
          <InputField label="Título" value={(content.galleryTitle as string) || ""} onChange={(v) => onChange({ ...content, galleryTitle: v })} />
          <TextareaField label="Descrição" value={(content.galleryDescription as string) || ""} onChange={(v) => onChange({ ...content, galleryDescription: v })} rows={2} />
          {galleryImages.map((g, i) => (
            <div key={i} className="p-2 border rounded bg-gray-50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Imagem {i + 1}</span>
                <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, galleryImages: galleryImages.filter((_, idx) => idx !== i) }); }} className="text-red-500 text-xs">Remover</button>
              </div>
              {renderImageUploadField({ label: "", value: g.src, fieldKey: `gallery-${i}`, arrayField: "galleryImages", arrayIndex: i, arrayImageKey: "src" })}
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Alt text" value={g.alt} onChange={(e) => { const ng = [...galleryImages]; ng[i] = { ...ng[i], alt: e.target.value }; onChange({ ...content, galleryImages: ng }); }} onClick={(e) => e.stopPropagation()} />
            </div>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, galleryImages: [...galleryImages, { src: "", alt: "" }] }); }} className="w-full py-2 border border-dashed rounded text-sm text-gray-500">+ Adicionar Imagem</button>
        </div>
      )}

      {activeSection === "cta" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">CTA Final</h4>
          <InputField label="Título" value={(content.ctaTitle as string) || ""} onChange={(v) => onChange({ ...content, ctaTitle: v })} />
          <TextareaField label="Descrição" value={(content.ctaDescription as string) || ""} onChange={(v) => onChange({ ...content, ctaDescription: v })} rows={2} />
          <InputField label="Nota" value={(content.ctaNote as string) || ""} onChange={(v) => onChange({ ...content, ctaNote: v })} />
          <InputField label="Subtítulo" value={(content.ctaSubtitle as string) || ""} onChange={(v) => onChange({ ...content, ctaSubtitle: v })} />
          <h4 className="font-medium text-sm mt-3">Botões</h4>
          {(() => {
            const defaultCtaButtons = [
              { text: "Agendar Visita ao Showroom", style: "primary" },
              { text: "Consultoria com Especialista", style: "outline" },
              { text: "Baixar Catálogo", link: "/contato", style: "secondary" },
            ];
            const ctaButtons = (content.ctaButtons as Array<{ text: string; link: string; style: string }>) || defaultCtaButtons;
            return (
              <>
                {ctaButtons.map((btn, i) => (
                  <div key={i} className="p-2 border rounded bg-gray-50 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">Botão {i + 1}</span>
                      <button onClick={(e) => { e.stopPropagation(); const nb = [...ctaButtons]; nb.splice(i, 1); onChange({ ...content, ctaButtons: nb }); }} className="text-red-500 text-xs">Remover</button>
                    </div>
                    <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Texto" value={btn.text} onChange={(e) => { const nb = [...ctaButtons]; nb[i] = { ...nb[i], text: e.target.value }; onChange({ ...content, ctaButtons: nb }); }} onClick={(e) => e.stopPropagation()} />
                    <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Link" value={btn.link} onChange={(e) => { const nb = [...ctaButtons]; nb[i] = { ...nb[i], link: e.target.value }; onChange({ ...content, ctaButtons: nb }); }} onClick={(e) => e.stopPropagation()} />
                    <select className="w-full px-2 py-1 text-sm border rounded" value={btn.style} onChange={(e) => { const nb = [...ctaButtons]; nb[i] = { ...nb[i], style: e.target.value }; onChange({ ...content, ctaButtons: nb }); }} onClick={(e) => e.stopPropagation()}>
                      <option value="primary">Primário (preto)</option>
                      <option value="outline">Outline (borda)</option>
                      <option value="secondary">Secundário (cinza)</option>
                    </select>
                  </div>
                ))}
                <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, ctaButtons: [...ctaButtons, { text: "", link: "", style: "primary" }] }); }} className="w-full py-1.5 border border-dashed rounded text-xs text-gray-500">+ Adicionar Botão</button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// Landing Page Tricologia - Editor Completo
function LPTricologiaContentEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const [activeSection, setActiveSection] = useState("hero");
  const [uploading, setUploading] = useState<string | null>(null);
  
  const products = (content.products as Array<{ name: string; tagline: string; description: string; highlight: string; ideal: string; image: string; cta: string; slug: string }>) || [];
  const technologies = (content.technologies as Array<{ name: string; subtitle: string; icon: string; description: string; benefit: string; hasVideo: boolean; videoButtonText?: string; videoUrl?: string }>) || [];
  const ritualSteps = (content.ritualSteps as Array<{ step: number; title: string; description: string }>) || [];
  const galleryImages = (content.galleryImages as Array<{ src: string; alt: string }>) || [];
  const painPoints = (content.problemPainPoints as string[]) || [];
  const solutionFeatures = (content.solutionFeatures as Array<{ title: string; description: string }>) || [];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string, arrayField?: string, arrayIndex?: number, arrayImageKey?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(fieldKey);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        if (arrayField && arrayIndex !== undefined && arrayImageKey) {
          const arr = [...(content[arrayField] as Array<Record<string, unknown>>)];
          arr[arrayIndex] = { ...arr[arrayIndex], [arrayImageKey]: data.url };
          onChange({ ...content, [arrayField]: arr });
        } else {
          onChange({ ...content, [fieldKey]: data.url });
        }
      }
    } catch (err) { console.error(err); } finally { setUploading(null); }
  };

  const ImageUploadField = ({ label, value, fieldKey, arrayField, arrayIndex, arrayImageKey }: { label: string; value: string; fieldKey: string; arrayField?: string; arrayIndex?: number; arrayImageKey?: string }) => (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <div className="flex gap-2 items-start">
        {value && <div className="relative w-20 h-20 rounded overflow-hidden border bg-gray-100 flex-shrink-0"><img src={value} alt="" className="w-full h-full object-cover" /></div>}
        <div className="flex-1">
          <label className={`flex items-center justify-center w-full h-10 border-2 border-dashed rounded cursor-pointer hover:border-gray-400 ${uploading === fieldKey ? 'opacity-50' : ''}`} onClick={(e) => e.stopPropagation()}>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, fieldKey, arrayField, arrayIndex, arrayImageKey)} onClick={(e) => e.stopPropagation()} disabled={uploading === fieldKey} />
            <span className="text-xs text-gray-500">{uploading === fieldKey ? "Enviando..." : "Clique para trocar"}</span>
          </label>
          <input type="text" value={value} onChange={(e) => { if (arrayField && arrayIndex !== undefined && arrayImageKey) { const arr = [...(content[arrayField] as Array<Record<string, unknown>>)]; arr[arrayIndex] = { ...arr[arrayIndex], [arrayImageKey]: e.target.value }; onChange({ ...content, [arrayField]: arr }); } else { onChange({ ...content, [fieldKey]: e.target.value }); } }} placeholder="/images/site/..." className="w-full mt-1 px-2 py-1 text-xs border rounded" onClick={(e) => e.stopPropagation()} />
        </div>
      </div>
    </div>
  );

  const sections = [
    { id: "hero", label: "Hero" },
    { id: "problem", label: "Problema" },
    { id: "products", label: "Produtos" },
    { id: "tech", label: "Tecnologias" },
    { id: "ritual", label: "Ritual" },
    { id: "gallery", label: "Galeria" },
    { id: "cta", label: "CTA" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b pb-2">
        {sections.map((s) => (
          <button key={s.id} onClick={(e) => { e.stopPropagation(); setActiveSection(s.id); }} className={`px-2 py-1 text-xs rounded ${activeSection === s.id ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"}`}>{s.label}</button>
        ))}
      </div>

      {activeSection === "hero" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Seção Hero</h4>
          <InputField label="Título Principal" value={(content.heroTitle as string) || ""} onChange={(v) => onChange({ ...content, heroTitle: v })} placeholder="A união do Design Italiano..." />
          <InputField label="Título Destaque" value={(content.heroHighlight as string) || ""} onChange={(v) => onChange({ ...content, heroHighlight: v })} placeholder="A revolução no tratamento capilar..." />
          <TextareaField label="Descrição" value={(content.heroDescription as string) || ""} onChange={(v) => onChange({ ...content, heroDescription: v })} rows={2} />
          <InputField label="Texto do Botão" value={(content.heroButtonText as string) || ""} onChange={(v) => onChange({ ...content, heroButtonText: v })} placeholder="Explorar a Coleção Completa" />
          <InputField label="Link do Botão" value={(content.heroButtonLink as string) || ""} onChange={(v) => onChange({ ...content, heroButtonLink: v })} placeholder="/catalogo" />
          <VideoUploader label="Vídeo de Fundo" value={(content.heroVideo as string) || ""} onChange={(v) => onChange({ ...content, heroVideo: v })} />
          <InputField label="Overlay %" value={String((content.heroOverlay as number) || 60)} onChange={(v) => onChange({ ...content, heroOverlay: Number(v) })} type="number" />
        </div>
      )}

      {activeSection === "problem" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Seção Problema</h4>
          <InputField label="Título" value={(content.problemTitle as string) || ""} onChange={(v) => onChange({ ...content, problemTitle: v })} />
          <TextareaField label="Descrição" value={(content.problemDescription as string) || ""} onChange={(v) => onChange({ ...content, problemDescription: v })} rows={3} />
          <label className="block text-xs font-medium text-gray-600">Pain Points (um por linha)</label>
          <textarea className="w-full px-3 py-2 text-sm border rounded" rows={4} value={painPoints.join("\n")} onChange={(e) => onChange({ ...content, problemPainPoints: e.target.value.split("\n").filter(Boolean) })} onClick={(e) => e.stopPropagation()} />
          <InputField label="Título da Solução" value={(content.solutionTitle as string) || ""} onChange={(v) => onChange({ ...content, solutionTitle: v })} />
          <TextareaField label="Descrição da Solução" value={(content.solutionDescription as string) || ""} onChange={(v) => onChange({ ...content, solutionDescription: v })} rows={3} />
          <label className="block text-xs font-medium text-gray-600">Features da Solução</label>
          {solutionFeatures.map((f, i) => (
            <div key={i} className="p-2 border rounded bg-gray-50 space-y-1">
              <div className="flex justify-between"><span className="text-xs">Feature {i+1}</span><button onClick={(e) => { e.stopPropagation(); onChange({ ...content, solutionFeatures: solutionFeatures.filter((_, idx) => idx !== i) }); }} className="text-red-500 text-xs">Remover</button></div>
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Título" value={f.title} onChange={(e) => { const nf = [...solutionFeatures]; nf[i] = { ...nf[i], title: e.target.value }; onChange({ ...content, solutionFeatures: nf }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Descrição" value={f.description} onChange={(e) => { const nf = [...solutionFeatures]; nf[i] = { ...nf[i], description: e.target.value }; onChange({ ...content, solutionFeatures: nf }); }} onClick={(e) => e.stopPropagation()} />
            </div>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, solutionFeatures: [...solutionFeatures, { title: "", description: "" }] }); }} className="w-full py-2 border border-dashed rounded text-sm text-gray-500">+ Adicionar Feature</button>
        </div>
      )}

      {activeSection === "products" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Produtos</h4>
          <InputField label="Badge" value={(content.productsBadge as string) || ""} onChange={(v) => onChange({ ...content, productsBadge: v })} placeholder="Equipamentos Premium" />
          <InputField label="Título" value={(content.productsTitle as string) || ""} onChange={(v) => onChange({ ...content, productsTitle: v })} placeholder="Estações de Excelência" />
          <TextareaField label="Descrição" value={(content.productsDescription as string) || ""} onChange={(v) => onChange({ ...content, productsDescription: v })} rows={2} />
          {products.map((p, i) => (
            <div key={i} className="p-2 border rounded space-y-2 bg-gray-50">
              <div className="flex justify-between items-center"><span className="text-xs font-medium">Produto {i + 1}: {p.name}</span><button onClick={(e) => { e.stopPropagation(); onChange({ ...content, products: products.filter((_, idx) => idx !== i) }); }} className="text-red-500 text-xs">Remover</button></div>
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Nome" value={p.name} onChange={(e) => { const np = [...products]; np[i] = { ...np[i], name: e.target.value }; onChange({ ...content, products: np }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Tagline" value={p.tagline} onChange={(e) => { const np = [...products]; np[i] = { ...np[i], tagline: e.target.value }; onChange({ ...content, products: np }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Descrição" rows={2} value={p.description} onChange={(e) => { const np = [...products]; np[i] = { ...np[i], description: e.target.value }; onChange({ ...content, products: np }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Destaque" value={p.highlight} onChange={(e) => { const np = [...products]; np[i] = { ...np[i], highlight: e.target.value }; onChange({ ...content, products: np }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Ideal para" value={p.ideal} onChange={(e) => { const np = [...products]; np[i] = { ...np[i], ideal: e.target.value }; onChange({ ...content, products: np }); }} onClick={(e) => e.stopPropagation()} />
              <ImageUploadField label="Imagem" value={p.image} fieldKey={`product-${i}`} arrayField="products" arrayIndex={i} arrayImageKey="image" />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Texto CTA" value={p.cta} onChange={(e) => { const np = [...products]; np[i] = { ...np[i], cta: e.target.value }; onChange({ ...content, products: np }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Slug" value={p.slug} onChange={(e) => { const np = [...products]; np[i] = { ...np[i], slug: e.target.value }; onChange({ ...content, products: np }); }} onClick={(e) => e.stopPropagation()} />
            </div>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, products: [...products, { name: "", tagline: "", description: "", highlight: "", ideal: "", image: "", cta: "", slug: "" }] }); }} className="w-full py-2 border border-dashed rounded text-sm text-gray-500">+ Adicionar Produto</button>
        </div>
      )}

      {activeSection === "tech" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Tecnologias</h4>
          <InputField label="Badge" value={(content.techBadge as string) || ""} onChange={(v) => onChange({ ...content, techBadge: v })} placeholder="A Ciência por Trás do Ritual" />
          <InputField label="Título" value={(content.techTitle as string) || ""} onChange={(v) => onChange({ ...content, techTitle: v })} placeholder="Potencialize seus resultados..." />
          {technologies.map((t, i) => (
            <div key={i} className="p-2 border rounded space-y-2 bg-gray-50">
              <div className="flex justify-between items-center"><span className="text-xs font-medium">Tech {i + 1}: {t.name}</span><button onClick={(e) => { e.stopPropagation(); onChange({ ...content, technologies: technologies.filter((_, idx) => idx !== i) }); }} className="text-red-500 text-xs">Remover</button></div>
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Nome" value={t.name} onChange={(e) => { const nt = [...technologies]; nt[i] = { ...nt[i], name: e.target.value }; onChange({ ...content, technologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Subtítulo" value={t.subtitle} onChange={(e) => { const nt = [...technologies]; nt[i] = { ...nt[i], subtitle: e.target.value }; onChange({ ...content, technologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Ícone (emoji)" value={t.icon} onChange={(e) => { const nt = [...technologies]; nt[i] = { ...nt[i], icon: e.target.value }; onChange({ ...content, technologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Descrição" rows={2} value={t.description} onChange={(e) => { const nt = [...technologies]; nt[i] = { ...nt[i], description: e.target.value }; onChange({ ...content, technologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Benefício" rows={2} value={t.benefit} onChange={(e) => { const nt = [...technologies]; nt[i] = { ...nt[i], benefit: e.target.value }; onChange({ ...content, technologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Texto do Botão Vídeo (ex: Ver vídeo em ação)" value={t.videoButtonText || ""} onChange={(e) => { const nt = [...technologies]; nt[i] = { ...nt[i], videoButtonText: e.target.value }; onChange({ ...content, technologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Link do Vídeo (YouTube ou URL)" value={t.videoUrl || ""} onChange={(e) => { const nt = [...technologies]; nt[i] = { ...nt[i], videoUrl: e.target.value }; onChange({ ...content, technologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={t.hasVideo} onChange={(e) => { const nt = [...technologies]; nt[i] = { ...nt[i], hasVideo: e.target.checked }; onChange({ ...content, technologies: nt }); }} onClick={(e) => e.stopPropagation()} />
                Mostrar botão de vídeo
              </label>
            </div>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, technologies: [...technologies, { name: "", subtitle: "", icon: "", description: "", benefit: "", hasVideo: false, videoButtonText: "", videoUrl: "" }] }); }} className="w-full py-2 border border-dashed rounded text-sm text-gray-500">+ Adicionar Tecnologia</button>
        </div>
      )}

      {activeSection === "ritual" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Passos do Ritual</h4>
          <InputField label="Badge" value={(content.ritualBadge as string) || ""} onChange={(v) => onChange({ ...content, ritualBadge: v })} placeholder="O Ritual Passo a Passo" />
          <InputField label="Título" value={(content.ritualTitle as string) || ""} onChange={(v) => onChange({ ...content, ritualTitle: v })} placeholder="Do Diagnóstico ao Relaxamento Absoluto" />
          <TextareaField label="Descrição" value={(content.ritualDescription as string) || ""} onChange={(v) => onChange({ ...content, ritualDescription: v })} rows={2} />
          <InputField label="Nota (após passos)" value={(content.ritualNote as string) || ""} onChange={(v) => onChange({ ...content, ritualNote: v })} placeholder="Este é o padrão que define..." />
          <InputField label="Texto Botão Vídeo" value={(content.ritualVideoText as string) || ""} onChange={(v) => onChange({ ...content, ritualVideoText: v })} placeholder="Assistir ao Ritual Completo" />
          <InputField label="URL do Vídeo" value={(content.ritualVideoUrl as string) || ""} onChange={(v) => onChange({ ...content, ritualVideoUrl: v })} placeholder="https://www.youtube.com/embed/..." />
          {ritualSteps.map((r, i) => (
            <div key={i} className="p-2 border rounded space-y-2 bg-gray-50">
              <div className="flex justify-between items-center"><span className="text-xs font-medium">Passo {r.step}</span><button onClick={(e) => { e.stopPropagation(); onChange({ ...content, ritualSteps: ritualSteps.filter((_, idx) => idx !== i) }); }} className="text-red-500 text-xs">Remover</button></div>
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Título" value={r.title} onChange={(e) => { const nr = [...ritualSteps]; nr[i] = { ...nr[i], title: e.target.value }; onChange({ ...content, ritualSteps: nr }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Descrição" rows={2} value={r.description} onChange={(e) => { const nr = [...ritualSteps]; nr[i] = { ...nr[i], description: e.target.value }; onChange({ ...content, ritualSteps: nr }); }} onClick={(e) => e.stopPropagation()} />
            </div>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, ritualSteps: [...ritualSteps, { step: ritualSteps.length + 1, title: "", description: "" }] }); }} className="w-full py-2 border border-dashed rounded text-sm text-gray-500">+ Adicionar Passo</button>
        </div>
      )}

      {activeSection === "gallery" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Galeria</h4>
          <InputField label="Título" value={(content.galleryTitle as string) || ""} onChange={(v) => onChange({ ...content, galleryTitle: v })} placeholder="Design que transforma ambientes" />
          <InputField label="Descrição" value={(content.galleryDescription as string) || ""} onChange={(v) => onChange({ ...content, galleryDescription: v })} placeholder="Leve a elegância atemporal..." />
          <InputField label="Texto Badge (Exclusividade)" value={(content.galleryBadgeText as string) || ""} onChange={(v) => onChange({ ...content, galleryBadgeText: v })} placeholder="Exclusividade no Brasil: Distribuição oficial..." />
          {galleryImages.map((g, i) => (
            <div key={i} className="p-2 border rounded bg-gray-50 space-y-2">
              <div className="flex justify-between items-center"><span className="text-xs font-medium">Imagem {i + 1}</span><button onClick={(e) => { e.stopPropagation(); onChange({ ...content, galleryImages: galleryImages.filter((_, idx) => idx !== i) }); }} className="text-red-500 text-xs">Remover</button></div>
              <ImageUploadField label="" value={g.src} fieldKey={`gallery-${i}`} arrayField="galleryImages" arrayIndex={i} arrayImageKey="src" />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Alt text" value={g.alt} onChange={(e) => { const ng = [...galleryImages]; ng[i] = { ...ng[i], alt: e.target.value }; onChange({ ...content, galleryImages: ng }); }} onClick={(e) => e.stopPropagation()} />
            </div>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, galleryImages: [...galleryImages, { src: "", alt: "" }] }); }} className="w-full py-2 border border-dashed rounded text-sm text-gray-500">+ Adicionar Imagem</button>
        </div>
      )}

      {activeSection === "cta" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">CTA Final</h4>
          <InputField label="Título" value={(content.ctaTitle as string) || ""} onChange={(v) => onChange({ ...content, ctaTitle: v })} />
          <TextareaField label="Descrição" value={(content.ctaDescription as string) || ""} onChange={(v) => onChange({ ...content, ctaDescription: v })} rows={2} />
          <InputField label="Subtítulo" value={(content.ctaSubtitle as string) || ""} onChange={(v) => onChange({ ...content, ctaSubtitle: v })} placeholder="O que você gostaria de fazer agora?" />
          <h4 className="font-medium text-sm mt-3">Botões</h4>
          {(() => {
            const defaultCtaButtons = [
              { text: "Agendar Visita ao Showroom", style: "primary" },
              { text: "Consultoria com Especialista", style: "outline" },
            ];
            const ctaButtons = (content.ctaButtons as Array<{ text: string; link: string; style: string }>) || defaultCtaButtons;
            return (
              <>
                {ctaButtons.map((btn, i) => (
                  <div key={i} className="p-2 border rounded bg-gray-50 space-y-1">
                    <div className="flex justify-between items-center"><span className="text-xs font-medium">Botão {i + 1}</span><button onClick={(e) => { e.stopPropagation(); const nb = [...ctaButtons]; nb.splice(i, 1); onChange({ ...content, ctaButtons: nb }); }} className="text-red-500 text-xs">Remover</button></div>
                    <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Texto" value={btn.text} onChange={(e) => { const nb = [...ctaButtons]; nb[i] = { ...nb[i], text: e.target.value }; onChange({ ...content, ctaButtons: nb }); }} onClick={(e) => e.stopPropagation()} />
                    <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Link" value={btn.link} onChange={(e) => { const nb = [...ctaButtons]; nb[i] = { ...nb[i], link: e.target.value }; onChange({ ...content, ctaButtons: nb }); }} onClick={(e) => e.stopPropagation()} />
                    <select className="w-full px-2 py-1 text-sm border rounded" value={btn.style} onChange={(e) => { const nb = [...ctaButtons]; nb[i] = { ...nb[i], style: e.target.value }; onChange({ ...content, ctaButtons: nb }); }} onClick={(e) => e.stopPropagation()}>
                      <option value="primary">Primário (preto)</option>
                      <option value="outline">Outline (borda)</option>
                      <option value="secondary">Secundário (cinza)</option>
                    </select>
                  </div>
                ))}
                <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, ctaButtons: [...ctaButtons, { text: "", link: "", style: "primary" }] }); }} className="w-full py-1.5 border border-dashed rounded text-xs text-gray-500">+ Adicionar Botão</button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// Landing Page SPA - Editor Completo
function LPSpaContentEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const [activeSection, setActiveSection] = useState("hero");
  const [uploading, setUploading] = useState<string | null>(null);
  
  const infrastructureProducts = (content.infrastructureProducts as Array<{ name: string; tagline: string; description: string; benefit: string; image: string; slug: string }>) || [];
  const sensorTechnologies = (content.sensorTechnologies as Array<{ name: string; icon: string; tagline: string; description: string; guestBenefit: string; differential: string; image: string; slug: string }>) || [];
  const businessBenefits = (content.businessBenefits as Array<{ title: string; description: string }>) || [];
  const rituals = (content.rituals as Array<{ name: string; emoji: string; focus: string; description: string; experience: string }>) || [];
  const hotelShowcase = (content.hotelShowcase as Array<{ image: string; location: string; hotel: string }>) || [];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string, arrayField?: string, arrayIndex?: number, arrayImageKey?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(fieldKey);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        if (arrayField && arrayIndex !== undefined && arrayImageKey) {
          const arr = [...(content[arrayField] as Array<Record<string, unknown>>)];
          arr[arrayIndex] = { ...arr[arrayIndex], [arrayImageKey]: data.url };
          onChange({ ...content, [arrayField]: arr });
        } else {
          onChange({ ...content, [fieldKey]: data.url });
        }
      }
    } catch (err) { console.error(err); } finally { setUploading(null); }
  };

  const ImageUploadField = ({ label, value, fieldKey, arrayField, arrayIndex, arrayImageKey }: { label: string; value: string; fieldKey: string; arrayField?: string; arrayIndex?: number; arrayImageKey?: string }) => (
    <div>
      {label && <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>}
      <div className="flex gap-2 items-start">
        {value && <div className="relative w-20 h-20 rounded overflow-hidden border bg-gray-100 flex-shrink-0"><img src={value} alt="" className="w-full h-full object-cover" /></div>}
        <div className="flex-1">
          <label className={`flex items-center justify-center w-full h-10 border-2 border-dashed rounded cursor-pointer hover:border-gray-400 ${uploading === fieldKey ? 'opacity-50' : ''}`} onClick={(e) => e.stopPropagation()}>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, fieldKey, arrayField, arrayIndex, arrayImageKey)} onClick={(e) => e.stopPropagation()} disabled={uploading === fieldKey} />
            <span className="text-xs text-gray-500">{uploading === fieldKey ? "Enviando..." : "Clique para trocar"}</span>
          </label>
          <input type="text" value={value} onChange={(e) => { if (arrayField && arrayIndex !== undefined && arrayImageKey) { const arr = [...(content[arrayField] as Array<Record<string, unknown>>)]; arr[arrayIndex] = { ...arr[arrayIndex], [arrayImageKey]: e.target.value }; onChange({ ...content, [arrayField]: arr }); } else { onChange({ ...content, [fieldKey]: e.target.value }); } }} placeholder="/images/site/..." className="w-full mt-1 px-2 py-1 text-xs border rounded" onClick={(e) => e.stopPropagation()} />
        </div>
      </div>
    </div>
  );

  const relatedProducts = (content.relatedProducts as Array<{ name: string; image: string; slug: string; category: string; link?: string }>) || [];

  const sections = [
    { id: "hero", label: "Hero" },
    { id: "concept", label: "Conceito" },
    { id: "infra", label: "Infraestrutura" },
    { id: "tech", label: "Tecnologias" },
    { id: "cabin", label: "Spa Cabin" },
    { id: "business", label: "Negócio" },
    { id: "rituals", label: "Rituais" },
    { id: "showcase", label: "Showcase" },
    { id: "related", label: "Produtos" },
    { id: "cta", label: "CTA" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b pb-2">
        {sections.map((s) => (
          <button key={s.id} onClick={(e) => { e.stopPropagation(); setActiveSection(s.id); }} className={`px-2 py-1 text-xs rounded ${activeSection === s.id ? "bg-black text-white" : "bg-gray-100 hover:bg-gray-200"}`}>{s.label}</button>
        ))}
      </div>

      {activeSection === "hero" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Seção Hero</h4>
          <InputField label="Título Principal" value={(content.heroTitle as string) || ""} onChange={(v) => onChange({ ...content, heroTitle: v })} placeholder="O Padrão dos Melhores Spas do Mundo" />
          <InputField label="Título Destaque" value={(content.heroHighlight as string) || ""} onChange={(v) => onChange({ ...content, heroHighlight: v })} placeholder="Design Italiano e Tecnologia de Ponta" />
          <TextareaField label="Descrição" value={(content.heroDescription as string) || ""} onChange={(v) => onChange({ ...content, heroDescription: v })} rows={2} />
          <TextareaField label="Sub-Descrição" value={(content.heroSubDescription as string) || ""} onChange={(v) => onChange({ ...content, heroSubDescription: v })} rows={2} />
          <InputField label="Texto do Botão" value={(content.heroButtonText as string) || ""} onChange={(v) => onChange({ ...content, heroButtonText: v })} />
          <InputField label="Link do Botão" value={(content.heroButtonLink as string) || ""} onChange={(v) => onChange({ ...content, heroButtonLink: v })} placeholder="/catalogo" />
          <VideoUploader label="Vídeo de Fundo" value={(content.heroVideo as string) || ""} onChange={(v) => onChange({ ...content, heroVideo: v })} />
          <InputField label="Overlay %" value={String((content.heroOverlay as number) || 50)} onChange={(v) => onChange({ ...content, heroOverlay: Number(v) })} type="number" />
        </div>
      )}

      {activeSection === "concept" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Seção Conceito</h4>
          <InputField label="Badge" value={(content.conceptBadge as string) || ""} onChange={(v) => onChange({ ...content, conceptBadge: v })} placeholder="O Conceito" />
          <InputField label="Título" value={(content.conceptTitle as string) || ""} onChange={(v) => onChange({ ...content, conceptTitle: v })} placeholder="Explore o potencial da sua infraestrutura." />
          <TextareaField label="Descrição" value={(content.conceptDescription as string) || ""} onChange={(v) => onChange({ ...content, conceptDescription: v })} rows={3} />
          <TextareaField label="Destaque (box)" value={(content.conceptHighlight as string) || ""} onChange={(v) => onChange({ ...content, conceptHighlight: v })} rows={4} />
        </div>
      )}

      {activeSection === "infra" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Produtos de Infraestrutura</h4>
          <InputField label="Badge" value={(content.infraBadge as string) || ""} onChange={(v) => onChange({ ...content, infraBadge: v })} placeholder="A Infraestrutura" />
          <InputField label="Título" value={(content.infraTitle as string) || ""} onChange={(v) => onChange({ ...content, infraTitle: v })} placeholder="Design de Assinatura..." />
          <TextareaField label="Descrição" value={(content.infraDescription as string) || ""} onChange={(v) => onChange({ ...content, infraDescription: v })} rows={2} />
          {infrastructureProducts.map((p, i) => (
            <div key={i} className="p-2 border rounded space-y-2 bg-gray-50">
              <div className="flex justify-between items-center"><span className="text-xs font-medium">Produto {i + 1}: {p.name}</span><button onClick={(e) => { e.stopPropagation(); onChange({ ...content, infrastructureProducts: infrastructureProducts.filter((_, idx) => idx !== i) }); }} className="text-red-500 text-xs">Remover</button></div>
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Nome" value={p.name} onChange={(e) => { const np = [...infrastructureProducts]; np[i] = { ...np[i], name: e.target.value }; onChange({ ...content, infrastructureProducts: np }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Tagline" value={p.tagline} onChange={(e) => { const np = [...infrastructureProducts]; np[i] = { ...np[i], tagline: e.target.value }; onChange({ ...content, infrastructureProducts: np }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Descrição" rows={2} value={p.description} onChange={(e) => { const np = [...infrastructureProducts]; np[i] = { ...np[i], description: e.target.value }; onChange({ ...content, infrastructureProducts: np }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Benefício" rows={2} value={p.benefit} onChange={(e) => { const np = [...infrastructureProducts]; np[i] = { ...np[i], benefit: e.target.value }; onChange({ ...content, infrastructureProducts: np }); }} onClick={(e) => e.stopPropagation()} />
              <ImageUploadField label="Imagem" value={p.image} fieldKey={`infra-${i}`} arrayField="infrastructureProducts" arrayIndex={i} arrayImageKey="image" />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Slug" value={p.slug} onChange={(e) => { const np = [...infrastructureProducts]; np[i] = { ...np[i], slug: e.target.value }; onChange({ ...content, infrastructureProducts: np }); }} onClick={(e) => e.stopPropagation()} />
            </div>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, infrastructureProducts: [...infrastructureProducts, { name: "", tagline: "", description: "", benefit: "", image: "", slug: "" }] }); }} className="w-full py-2 border border-dashed rounded text-sm text-gray-500">+ Adicionar Produto</button>
        </div>
      )}

      {activeSection === "tech" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Tecnologias Sensoriais</h4>
          <InputField label="Badge" value={(content.techBadge as string) || ""} onChange={(v) => onChange({ ...content, techBadge: v })} placeholder="Tecnologia Sensorial" />
          <InputField label="Título" value={(content.techTitle as string) || ""} onChange={(v) => onChange({ ...content, techTitle: v })} placeholder="A tecnologia deve ser invisível." />
          <TextareaField label="Descrição" value={(content.techDescription as string) || ""} onChange={(v) => onChange({ ...content, techDescription: v })} rows={2} />
          {sensorTechnologies.map((t, i) => (
            <div key={i} className="p-2 border rounded space-y-2 bg-gray-50">
              <div className="flex justify-between items-center"><span className="text-xs font-medium">Tech {i + 1}: {t.name}</span><button onClick={(e) => { e.stopPropagation(); onChange({ ...content, sensorTechnologies: sensorTechnologies.filter((_, idx) => idx !== i) }); }} className="text-red-500 text-xs">Remover</button></div>
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Nome" value={t.name} onChange={(e) => { const nt = [...sensorTechnologies]; nt[i] = { ...nt[i], name: e.target.value }; onChange({ ...content, sensorTechnologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Ícone (emoji)" value={t.icon} onChange={(e) => { const nt = [...sensorTechnologies]; nt[i] = { ...nt[i], icon: e.target.value }; onChange({ ...content, sensorTechnologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Tagline" value={t.tagline} onChange={(e) => { const nt = [...sensorTechnologies]; nt[i] = { ...nt[i], tagline: e.target.value }; onChange({ ...content, sensorTechnologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Descrição" rows={2} value={t.description} onChange={(e) => { const nt = [...sensorTechnologies]; nt[i] = { ...nt[i], description: e.target.value }; onChange({ ...content, sensorTechnologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Benefício para Hóspede" rows={2} value={t.guestBenefit} onChange={(e) => { const nt = [...sensorTechnologies]; nt[i] = { ...nt[i], guestBenefit: e.target.value }; onChange({ ...content, sensorTechnologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Diferencial" rows={2} value={t.differential} onChange={(e) => { const nt = [...sensorTechnologies]; nt[i] = { ...nt[i], differential: e.target.value }; onChange({ ...content, sensorTechnologies: nt }); }} onClick={(e) => e.stopPropagation()} />
              <ImageUploadField label="Imagem" value={t.image} fieldKey={`tech-${i}`} arrayField="sensorTechnologies" arrayIndex={i} arrayImageKey="image" />
            </div>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, sensorTechnologies: [...sensorTechnologies, { name: "", icon: "", tagline: "", description: "", guestBenefit: "", differential: "", image: "", slug: "" }] }); }} className="w-full py-2 border border-dashed rounded text-sm text-gray-500">+ Adicionar Tecnologia</button>
        </div>
      )}

      {activeSection === "cabin" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Spa Cabin</h4>
          <InputField label="Badge" value={(content.cabinBadge as string) || ""} onChange={(v) => onChange({ ...content, cabinBadge: v })} placeholder="Spa Cabin" />
          <InputField label="Título" value={(content.cabinTitle as string) || ""} onChange={(v) => onChange({ ...content, cabinTitle: v })} placeholder="Monte uma Spa Cabin Completa" />
          <TextareaField label="Descrição" value={(content.cabinDescription as string) || ""} onChange={(v) => onChange({ ...content, cabinDescription: v })} rows={2} />
          <InputField label="URL Vídeo (YouTube)" value={(content.cabinVideoUrl as string) || ""} onChange={(v) => onChange({ ...content, cabinVideoUrl: v })} placeholder="https://www.youtube.com/embed/..." />
        </div>
      )}

      {activeSection === "business" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Benefícios para o Negócio</h4>
          <InputField label="Badge" value={(content.businessBadge as string) || ""} onChange={(v) => onChange({ ...content, businessBadge: v })} placeholder="Inteligência de Negócio" />
          <InputField label="Título" value={(content.businessTitle as string) || ""} onChange={(v) => onChange({ ...content, businessTitle: v })} placeholder="Valorização do Ativo" />
          <TextareaField label="Descrição" value={(content.businessDescription as string) || ""} onChange={(v) => onChange({ ...content, businessDescription: v })} rows={2} />
          {businessBenefits.map((b, i) => (
            <div key={i} className="p-2 border rounded space-y-2 bg-gray-50">
              <div className="flex justify-between items-center"><span className="text-xs font-medium">Benefício {i + 1}</span><button onClick={(e) => { e.stopPropagation(); onChange({ ...content, businessBenefits: businessBenefits.filter((_, idx) => idx !== i) }); }} className="text-red-500 text-xs">Remover</button></div>
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Título" value={b.title} onChange={(e) => { const nb = [...businessBenefits]; nb[i] = { ...nb[i], title: e.target.value }; onChange({ ...content, businessBenefits: nb }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Descrição" rows={2} value={b.description} onChange={(e) => { const nb = [...businessBenefits]; nb[i] = { ...nb[i], description: e.target.value }; onChange({ ...content, businessBenefits: nb }); }} onClick={(e) => e.stopPropagation()} />
            </div>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, businessBenefits: [...businessBenefits, { title: "", description: "" }] }); }} className="w-full py-2 border border-dashed rounded text-sm text-gray-500">+ Adicionar Benefício</button>
        </div>
      )}

      {activeSection === "rituals" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Rituais</h4>
          <InputField label="Badge" value={(content.ritualsBadge as string) || ""} onChange={(v) => onChange({ ...content, ritualsBadge: v })} placeholder="Menu de Experiências" />
          <InputField label="Título" value={(content.ritualsTitle as string) || ""} onChange={(v) => onChange({ ...content, ritualsTitle: v })} placeholder="Rituais para o Viajante Global" />
          <TextareaField label="Descrição" value={(content.ritualsDescription as string) || ""} onChange={(v) => onChange({ ...content, ritualsDescription: v })} rows={2} />
          {rituals.map((r, i) => (
            <div key={i} className="p-2 border rounded space-y-2 bg-gray-50">
              <div className="flex justify-between items-center"><span className="text-xs font-medium">Ritual {i + 1}: {r.name}</span><button onClick={(e) => { e.stopPropagation(); onChange({ ...content, rituals: rituals.filter((_, idx) => idx !== i) }); }} className="text-red-500 text-xs">Remover</button></div>
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Nome" value={r.name} onChange={(e) => { const nr = [...rituals]; nr[i] = { ...nr[i], name: e.target.value }; onChange({ ...content, rituals: nr }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Emoji" value={r.emoji} onChange={(e) => { const nr = [...rituals]; nr[i] = { ...nr[i], emoji: e.target.value }; onChange({ ...content, rituals: nr }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Foco" value={r.focus} onChange={(e) => { const nr = [...rituals]; nr[i] = { ...nr[i], focus: e.target.value }; onChange({ ...content, rituals: nr }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Descrição" rows={2} value={r.description} onChange={(e) => { const nr = [...rituals]; nr[i] = { ...nr[i], description: e.target.value }; onChange({ ...content, rituals: nr }); }} onClick={(e) => e.stopPropagation()} />
              <textarea className="w-full px-2 py-1 text-sm border rounded" placeholder="Experiência" rows={2} value={r.experience} onChange={(e) => { const nr = [...rituals]; nr[i] = { ...nr[i], experience: e.target.value }; onChange({ ...content, rituals: nr }); }} onClick={(e) => e.stopPropagation()} />
            </div>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, rituals: [...rituals, { name: "", emoji: "", focus: "", description: "", experience: "" }] }); }} className="w-full py-2 border border-dashed rounded text-sm text-gray-500">+ Adicionar Ritual</button>
        </div>
      )}

      {activeSection === "showcase" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Showcase de Hotéis</h4>
          <InputField label="Badge" value={(content.socialBadge as string) || ""} onChange={(v) => onChange({ ...content, socialBadge: v })} placeholder="Prova Social" />
          <InputField label="Título" value={(content.socialTitle as string) || ""} onChange={(v) => onChange({ ...content, socialTitle: v })} placeholder="A Escolha dos Melhores Hotéis..." />
          <TextareaField label="Descrição" value={(content.socialDescription as string) || ""} onChange={(v) => onChange({ ...content, socialDescription: v })} rows={2} />
          {hotelShowcase.map((h, i) => (
            <div key={i} className="p-2 border rounded bg-gray-50 space-y-2">
              <div className="flex justify-between items-center"><span className="text-xs font-medium">Hotel {i + 1}</span><button onClick={(e) => { e.stopPropagation(); onChange({ ...content, hotelShowcase: hotelShowcase.filter((_, idx) => idx !== i) }); }} className="text-red-500 text-xs">Remover</button></div>
              <ImageUploadField label="Imagem" value={h.image} fieldKey={`showcase-${i}`} arrayField="hotelShowcase" arrayIndex={i} arrayImageKey="image" />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Localização" value={h.location} onChange={(e) => { const nh = [...hotelShowcase]; nh[i] = { ...nh[i], location: e.target.value }; onChange({ ...content, hotelShowcase: nh }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Hotel" value={h.hotel} onChange={(e) => { const nh = [...hotelShowcase]; nh[i] = { ...nh[i], hotel: e.target.value }; onChange({ ...content, hotelShowcase: nh }); }} onClick={(e) => e.stopPropagation()} />
            </div>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, hotelShowcase: [...hotelShowcase, { image: "", location: "", hotel: "" }] }); }} className="w-full py-2 border border-dashed rounded text-sm text-gray-500">+ Adicionar Hotel</button>
        </div>
      )}

      {activeSection === "related" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Produtos Relacionados</h4>
          <p className="text-xs text-gray-500">Edite os produtos que aparecem na seção de produtos relacionados do SPA.</p>
          {relatedProducts.map((p, i) => (
            <div key={i} className="p-2 border rounded space-y-2 bg-gray-50">
              <div className="flex justify-between items-center"><span className="text-xs font-medium">Produto {i + 1}: {p.name || "Novo"}</span><button onClick={(e) => { e.stopPropagation(); onChange({ ...content, relatedProducts: relatedProducts.filter((_, idx) => idx !== i) }); }} className="text-red-500 text-xs">Remover</button></div>
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Nome" value={p.name} onChange={(e) => { const np = [...relatedProducts]; np[i] = { ...np[i], name: e.target.value }; onChange({ ...content, relatedProducts: np }); }} onClick={(e) => e.stopPropagation()} />
              <ImageUploadField label="Imagem" value={p.image} fieldKey={`related-${i}`} arrayField="relatedProducts" arrayIndex={i} arrayImageKey="image" />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Slug (ex: heaven)" value={p.slug} onChange={(e) => { const np = [...relatedProducts]; np[i] = { ...np[i], slug: e.target.value }; onChange({ ...content, relatedProducts: np }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Categoria (ex: Macas)" value={p.category} onChange={(e) => { const np = [...relatedProducts]; np[i] = { ...np[i], category: e.target.value }; onChange({ ...content, relatedProducts: np }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Link direto (ex: /produtos/heaven) — prioridade sobre slug" value={(p as Record<string, string>).link || ""} onChange={(e) => { const np = [...relatedProducts]; np[i] = { ...np[i], link: e.target.value }; onChange({ ...content, relatedProducts: np }); }} onClick={(e) => e.stopPropagation()} />
            </div>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, relatedProducts: [...relatedProducts, { name: "", image: "", slug: "", category: "", link: "" }] }); }} className="w-full py-2 border border-dashed rounded text-sm text-gray-500">+ Adicionar Produto</button>
        </div>
      )}

      {activeSection === "cta" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">CTA Final</h4>
          <InputField label="Badge" value={(content.ctaBadge as string) || ""} onChange={(v) => onChange({ ...content, ctaBadge: v })} placeholder="Convite ao Projeto" />
          <InputField label="Título" value={(content.ctaTitle as string) || ""} onChange={(v) => onChange({ ...content, ctaTitle: v })} />
          <TextareaField label="Descrição" value={(content.ctaDescription as string) || ""} onChange={(v) => onChange({ ...content, ctaDescription: v })} rows={2} />
          <h4 className="font-medium text-sm mt-3">Botões</h4>
          {(() => {
            const defaultCtaButtons = [
              { text: "Falar com um Consultor", link: "https://wa.me/", style: "primary" },
              { text: "Baixar Catálogo", link: "/contato?assunto=catalogo", style: "outline" },
            ];
            const ctaButtons = (content.ctaButtons as Array<{ text: string; link: string; style: string }>) || defaultCtaButtons;
            return (
              <>
                {ctaButtons.map((btn, i) => (
                  <div key={i} className="p-2 border rounded bg-gray-50 space-y-1">
                    <div className="flex justify-between items-center"><span className="text-xs font-medium">Botão {i + 1}</span><button onClick={(e) => { e.stopPropagation(); const nb = [...ctaButtons]; nb.splice(i, 1); onChange({ ...content, ctaButtons: nb }); }} className="text-red-500 text-xs">Remover</button></div>
                    <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Texto" value={btn.text} onChange={(e) => { const nb = [...ctaButtons]; nb[i] = { ...nb[i], text: e.target.value }; onChange({ ...content, ctaButtons: nb }); }} onClick={(e) => e.stopPropagation()} />
                    <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Link" value={btn.link} onChange={(e) => { const nb = [...ctaButtons]; nb[i] = { ...nb[i], link: e.target.value }; onChange({ ...content, ctaButtons: nb }); }} onClick={(e) => e.stopPropagation()} />
                    <select className="w-full px-2 py-1 text-sm border rounded" value={btn.style} onChange={(e) => { const nb = [...ctaButtons]; nb[i] = { ...nb[i], style: e.target.value }; onChange({ ...content, ctaButtons: nb }); }} onClick={(e) => e.stopPropagation()}>
                      <option value="primary">Primário (preto)</option>
                      <option value="outline">Outline (borda)</option>
                      <option value="secondary">Secundário (cinza)</option>
                    </select>
                  </div>
                ))}
                <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, ctaButtons: [...ctaButtons, { text: "", link: "", style: "primary" }] }); }} className="w-full py-1.5 border border-dashed rounded text-xs text-gray-500">+ Adicionar Botão</button>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ==================== 404 PAGE EDITOR ====================

function LP404ContentEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const [activeSection, setActiveSection] = useState("textos");

  const sections = [
    { id: "textos", label: "Textos" },
    { id: "botoes", label: "Botões" },
    { id: "links", label: "Links Rápidos" },
    { id: "footer", label: "Footer" },
  ];

  const buttons = (content.buttons as Array<{ text: string; link: string; style: string }>) || [
    { text: "Voltar para a Home", link: "/", style: "primary" },
    { text: "Ver Produtos", link: "/produtos", style: "outline" },
  ];

  const quickLinks = (content.quickLinks as Array<{ label: string; href: string }>) || [
    { label: "Produtos", href: "/produtos" },
    { label: "Sobre", href: "/sobre" },
    { label: "Contato", href: "/contato" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {sections.map((s) => (
          <button key={s.id} onClick={(e) => { e.stopPropagation(); setActiveSection(s.id); }}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${activeSection === s.id ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === "textos" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Textos da Página 404</h4>
          <InputField label="Badge" value={(content.badge as string) || ""} onChange={(v) => onChange({ ...content, badge: v })} placeholder="Página não encontrada" />
          <InputField label="Título" value={(content.title as string) || ""} onChange={(v) => onChange({ ...content, title: v })} placeholder="Ops! Esta página não existe." />
          <TextareaField label="Descrição" value={(content.description as string) || ""} onChange={(v) => onChange({ ...content, description: v })} rows={2} placeholder="A página que você está procurando pode ter sido removida..." />
        </div>
      )}

      {activeSection === "botoes" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Botões de Ação</h4>
          {buttons.map((btn, i) => (
            <div key={i} className="p-2 border rounded bg-gray-50 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Botão {i + 1}</span>
                {buttons.length > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); const nb = [...buttons]; nb.splice(i, 1); onChange({ ...content, buttons: nb }); }} className="text-red-500 text-xs">Remover</button>
                )}
              </div>
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Texto" value={btn.text} onChange={(e) => { const nb = [...buttons]; nb[i] = { ...nb[i], text: e.target.value }; onChange({ ...content, buttons: nb }); }} onClick={(e) => e.stopPropagation()} />
              <input className="w-full px-2 py-1 text-sm border rounded" placeholder="Link (ex: /produtos)" value={btn.link} onChange={(e) => { const nb = [...buttons]; nb[i] = { ...nb[i], link: e.target.value }; onChange({ ...content, buttons: nb }); }} onClick={(e) => e.stopPropagation()} />
              <select className="w-full px-2 py-1 text-sm border rounded" value={btn.style} onChange={(e) => { const nb = [...buttons]; nb[i] = { ...nb[i], style: e.target.value }; onChange({ ...content, buttons: nb }); }} onClick={(e) => e.stopPropagation()}>
                <option value="primary">Primário (preto)</option>
                <option value="outline">Outline (borda)</option>
              </select>
            </div>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, buttons: [...buttons, { text: "", link: "", style: "primary" }] }); }} className="w-full py-1.5 border border-dashed rounded text-xs text-gray-500">+ Adicionar Botão</button>
        </div>
      )}

      {activeSection === "links" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Links Rápidos</h4>
          <p className="text-xs text-gray-500">Links exibidos na parte inferior da página 404.</p>
          <InputField label="Texto acima dos links" value={(content.quickLinksTitle as string) || ""} onChange={(v) => onChange({ ...content, quickLinksTitle: v })} placeholder="Ou acesse diretamente:" />
          {quickLinks.map((link, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="flex-1 px-2 py-1 text-sm border rounded" placeholder="Label" value={link.label} onChange={(e) => { const nl = [...quickLinks]; nl[i] = { ...nl[i], label: e.target.value }; onChange({ ...content, quickLinks: nl }); }} onClick={(e) => e.stopPropagation()} />
              <input className="flex-1 px-2 py-1 text-sm border rounded" placeholder="/link" value={link.href} onChange={(e) => { const nl = [...quickLinks]; nl[i] = { ...nl[i], href: e.target.value }; onChange({ ...content, quickLinks: nl }); }} onClick={(e) => e.stopPropagation()} />
              <button onClick={(e) => { e.stopPropagation(); const nl = [...quickLinks]; nl.splice(i, 1); onChange({ ...content, quickLinks: nl }); }} className="text-red-500 text-xs shrink-0">✕</button>
            </div>
          ))}
          <button onClick={(e) => { e.stopPropagation(); onChange({ ...content, quickLinks: [...quickLinks, { label: "", href: "/" }] }); }} className="w-full py-1.5 border border-dashed rounded text-xs text-gray-500">+ Adicionar Link</button>
        </div>
      )}

      {activeSection === "footer" && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Footer</h4>
          <InputField label="Texto do Footer" value={(content.footerText as string) || ""} onChange={(v) => onChange({ ...content, footerText: v })} placeholder="© {year} Todos os direitos reservados." />
        </div>
      )}
    </div>
  );
}

// ===================== HOME PAGE EDITORS =====================

function HomeHeroSliderEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-gray-500 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
        <strong>Hero Slider da Home</strong><br />
        Os banners são gerenciados em <strong>Admin → Banners</strong>. Este bloco carrega automaticamente os banners ativos do banco de dados.
      </div>
      <InputField
        label="Velocidade Autoplay (ms)"
        value={String((content.autoplaySpeed as number) || 6000)}
        onChange={(v) => onChange({ ...content, autoplaySpeed: parseInt(v) || 6000 })}
        type="number"
      />
    </div>
  );
}

function HomeTrustBarEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const items = (content.items as string[]) || [];

  return (
    <div className="space-y-3">
      <span className="text-xs font-medium text-gray-600">Itens da barra de confiança</span>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            className="flex-1 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            value={item}
            onChange={(e) => {
              const newItems = [...items];
              newItems[index] = e.target.value;
              onChange({ ...content, items: newItems });
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); onChange({ ...content, items: items.filter((_, i) => i !== index) }); }}
            className="text-red-500 text-xs shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={(e) => { e.stopPropagation(); onChange({ ...content, items: [...items, "Novo item"] }); }}
        className="w-full py-1.5 border border-dashed border-gray-300 rounded text-xs text-gray-500 hover:border-gray-400"
      >
        + Adicionar Item
      </button>
    </div>
  );
}

function HomeCategoriesEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const sections = (content.sections as Array<{ slug: string; title: string; description: string; miniBanner: string }>) || [];

  const updateSection = (index: number, field: string, value: string) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    onChange({ ...content, sections: newSections });
  };

  return (
    <div className="space-y-3">
      <span className="text-xs font-medium text-gray-600">Cards de Categorias</span>
      {sections.map((section, index) => (
        <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">{section.slug}</span>
          </div>
          <InputField label="Título" value={section.title} onChange={(v) => updateSection(index, "title", v)} />
          <InputField label="Descrição" value={section.description} onChange={(v) => updateSection(index, "description", v)} />
          <ImageUploader label="Imagem" value={section.miniBanner} onChange={(v) => updateSection(index, "miniBanner", v)} />
        </div>
      ))}
    </div>
  );
}

function HomeFeaturedProductsEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <InputField
        label="Badge"
        value={(content.badge as string) || "Mais vendidos"}
        onChange={(v) => onChange({ ...content, badge: v })}
      />
      <InputField
        label="Título"
        value={(content.title as string) || "Produtos mais procurados"}
        onChange={(v) => onChange({ ...content, title: v })}
      />
      <InputField
        label="Link 'Ver todos'"
        value={(content.viewAllLink as string) || "/produtos"}
        onChange={(v) => onChange({ ...content, viewAllLink: v })}
      />
      <InputField
        label="Limite de produtos"
        value={String((content.limit as number) || 4)}
        onChange={(v) => onChange({ ...content, limit: parseInt(v) || 4 })}
        type="number"
      />
      <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700 p-2 rounded">
        Os produtos são carregados automaticamente do catálogo (marcados como destaque ou mais vendidos).
      </div>
    </div>
  );
}

function HomeCategoryProductsEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <InputField
        label="Máximo por seção"
        value={String((content.maxPerSection as number) || 8)}
        onChange={(v) => onChange({ ...content, maxPerSection: parseInt(v) || 8 })}
        type="number"
      />
      <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700 p-2 rounded">
        Exibe carrosséis de produtos por categoria. As categorias e produtos são carregados automaticamente do banco de dados.
      </div>
    </div>
  );
}

function HomePromoBannerEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const specs = (content.specs as Array<{ label: string; value: string }>) || [];

  const updateSpec = (index: number, field: string, value: string) => {
    const newSpecs = [...specs];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    onChange({ ...content, specs: newSpecs });
  };

  return (
    <div className="space-y-3">
      <InputField label="Badge" value={(content.badge as string) || ""} onChange={(v) => onChange({ ...content, badge: v })} />
      <InputField label="Título" value={(content.title as string) || ""} onChange={(v) => onChange({ ...content, title: v })} />
      <TextareaField label="Descrição" value={(content.description as string) || ""} onChange={(v) => onChange({ ...content, description: v })} rows={3} />
      <ImageUploader label="Imagem" value={(content.image as string) || ""} onChange={(v) => onChange({ ...content, image: v })} />
      <div className="grid grid-cols-2 gap-2">
        <InputField label="Botão Principal" value={(content.buttonText as string) || ""} onChange={(v) => onChange({ ...content, buttonText: v })} />
        <InputField label="Link" value={(content.buttonLink as string) || ""} onChange={(v) => onChange({ ...content, buttonLink: v })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <InputField label="Botão Secundário" value={(content.secondaryText as string) || ""} onChange={(v) => onChange({ ...content, secondaryText: v })} />
        <InputField label="Link" value={(content.secondaryLink as string) || ""} onChange={(v) => onChange({ ...content, secondaryLink: v })} />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-medium text-gray-600">Especificações</span>
        {specs.map((spec, index) => (
          <div key={index} className="grid grid-cols-2 gap-2">
            <input
              className="px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              placeholder="Label"
              value={spec.label}
              onChange={(e) => updateSpec(index, "label", e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <input
              className="px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
              placeholder="Valor"
              value={spec.value}
              onChange={(e) => updateSpec(index, "value", e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ))}
        <button
          onClick={(e) => { e.stopPropagation(); onChange({ ...content, specs: [...specs, { label: "", value: "" }] }); }}
          className="w-full py-1.5 border border-dashed border-gray-300 rounded text-xs text-gray-500 hover:border-gray-400"
        >
          + Adicionar Spec
        </button>
      </div>
    </div>
  );
}

function HomePrinterMapEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const hotspots = (content.hotspots as Array<{ id: string; name: string; description: string; price: string; slug: string; position: { top: string; left: string } }>) || [];

  const updateHotspot = (index: number, field: string, value: string) => {
    const newHotspots = [...hotspots];
    if (field === "top" || field === "left") {
      newHotspots[index] = { ...newHotspots[index], position: { ...newHotspots[index].position, [field]: value } };
    } else {
      newHotspots[index] = { ...newHotspots[index], [field]: value };
    }
    onChange({ ...content, hotspots: newHotspots });
  };

  return (
    <div className="space-y-3">
      <InputField label="Badge" value={(content.badge as string) || ""} onChange={(v) => onChange({ ...content, badge: v })} />
      <InputField label="Título" value={(content.title as string) || ""} onChange={(v) => onChange({ ...content, title: v })} />
      <TextareaField label="Descrição" value={(content.description as string) || ""} onChange={(v) => onChange({ ...content, description: v })} rows={2} />
      <ImageUploader label="Imagem da Impressora" value={(content.printerImage as string) || ""} onChange={(v) => onChange({ ...content, printerImage: v })} />

      <div className="space-y-2">
        <span className="text-xs font-medium text-gray-600">Pontos Interativos ({hotspots.length})</span>
        {hotspots.map((hotspot, index) => (
          <div key={index} className="p-2 bg-gray-50 dark:bg-gray-700 rounded space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-medium">Ponto {index + 1}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onChange({ ...content, hotspots: hotspots.filter((_, i) => i !== index) }); }}
                className="text-red-500 text-xs"
              >
                Remover
              </button>
            </div>
            <InputField label="Nome" value={hotspot.name} onChange={(v) => updateHotspot(index, "name", v)} />
            <InputField label="Descrição" value={hotspot.description} onChange={(v) => updateHotspot(index, "description", v)} />
            <div className="grid grid-cols-2 gap-2">
              <InputField label="Preço" value={hotspot.price} onChange={(v) => updateHotspot(index, "price", v)} />
              <InputField label="Slug do Produto" value={hotspot.slug} onChange={(v) => updateHotspot(index, "slug", v)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <InputField label="Posição Top" value={hotspot.position.top} onChange={(v) => updateHotspot(index, "top", v)} />
              <InputField label="Posição Left" value={hotspot.position.left} onChange={(v) => updateHotspot(index, "left", v)} />
            </div>
          </div>
        ))}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChange({
              ...content,
              hotspots: [...hotspots, { id: `hs-${Date.now()}`, name: "Novo Componente", description: "Descrição", price: "R$ 0,00", slug: "", position: { top: "50%", left: "50%" } }],
            });
          }}
          className="w-full py-1.5 border border-dashed border-gray-300 rounded text-xs text-gray-500 hover:border-gray-400"
        >
          + Adicionar Ponto
        </button>
      </div>
    </div>
  );
}
