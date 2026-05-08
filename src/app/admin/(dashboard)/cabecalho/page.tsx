"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineMenuAlt2,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineSave,
  HiOutlineCheck,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface NavLink {
  label: string;
  href: string;
}

interface HeaderConfig {
  logoUrl?: string;
  logoWhiteUrl?: string;
  subtitle?: string;
  subtitleLine2?: string;
  navLinks: NavLink[];
  ctaButtons: Array<{ label: string; href: string; variant: "outline" | "solid" }>;
  contactEmail?: string;
  contactPhone?: string;
  contactCity?: string;
}

const DEFAULT_MAIN_HEADER: HeaderConfig = {
  logoUrl: "/images/Captura_de_tela_2026-02-28_210120-removebg-preview.webp",
  logoWhiteUrl: "/images/Captura_de_tela_2026-02-28_210120-removebg-preview.webp",
  subtitle: "",
  subtitleLine2: "",
  navLinks: [
    { label: "Home", href: "/" },
    { label: "Produtos", href: "/produtos" },
    { label: "Personalizados", href: "/personalizados" },
    { label: "Sobre Nós", href: "/sobre" },
    { label: "Contato", href: "/contato" },
  ],
  ctaButtons: [
    { label: "Solicitar Orçamento", href: "/contato", variant: "outline" },
    { label: "Falar Conosco", href: "/contato", variant: "solid" },
  ],
  contactEmail: "",
  contactPhone: "",
  contactCity: "São Paulo, SP",
};


type Variant = "main";

export default function CabecalhoPage() {
  const [activeVariant, setActiveVariant] = useState<Variant>("main");
  const [configs, setConfigs] = useState<Record<Variant, HeaderConfig>>({
    main: DEFAULT_MAIN_HEADER,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function loadConfigs() {
    try {
      const mainRes = await fetch("/api/admin/layout?type=header&variant=main");
      const mainData = await mainRes.json();

      setConfigs({
        main: mainData.config?.content || DEFAULT_MAIN_HEADER,
      });
    } catch (error) {
      console.error("Error loading header configs:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadConfigs();
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/layout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "header",
          variant: activeVariant,
          content: configs[activeVariant],
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving header config:", error);
      alert("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (updates: Partial<HeaderConfig>) => {
    setConfigs((prev) => ({
      ...prev,
      [activeVariant]: { ...prev[activeVariant], ...updates },
    }));
  };

  const config = configs[activeVariant];

  const updateNavLink = (index: number, field: keyof NavLink, value: string) => {
    const newLinks = [...config.navLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    updateConfig({ navLinks: newLinks });
  };

  const addNavLink = () => {
    updateConfig({ navLinks: [...config.navLinks, { label: "", href: "" }] });
  };

  const removeNavLink = (index: number) => {
    updateConfig({ navLinks: config.navLinks.filter((_, i) => i !== index) });
  };

  const updateCtaButton = (index: number, field: string, value: string) => {
    const newButtons = [...config.ctaButtons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    updateConfig({ ctaButtons: newButtons });
  };

  const addCtaButton = () => {
    updateConfig({
      ctaButtons: [...config.ctaButtons, { label: "", href: "", variant: "solid" }],
    });
  };

  const removeCtaButton = (index: number) => {
    updateConfig({ ctaButtons: config.ctaButtons.filter((_, i) => i !== index) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Cabeçalho</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Edite o cabeçalho do site
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saved ? (
            <>
              <HiOutlineCheck className="w-4 h-4 mr-2" />
              Salvo!
            </>
          ) : (
            <>
              <HiOutlineSave className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar"}
            </>
          )}
        </Button>
      </div>

      {/* Variant Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(["main"] as Variant[]).map((v) => (
          <button
            key={v}
            onClick={() => setActiveVariant(v)}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeVariant === v
                ? "border-black text-black dark:border-white dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            &quot;Site Principal&quot;
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo & Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <HiOutlineMenuAlt2 className="w-5 h-5" />
            Identidade
          </h3>

          <ImageUpload
            value={config.logoUrl || ""}
            onChange={(url) => updateConfig({ logoUrl: url })}
            label={activeVariant === "main" ? "Logo (escuro)" : "Logo"}
            folder="layout"
          />

          {activeVariant === "main" && (
            <>
              <ImageUpload
                value={config.logoWhiteUrl || ""}
                onChange={(url) => updateConfig({ logoWhiteUrl: url })}
                label="Logo (branco)"
                folder="layout"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subtítulo Linha 1
                  </label>
                  <input
                    type="text"
                    value={config.subtitle || ""}
                    onChange={(e) => updateConfig({ subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subtítulo Linha 2
                  </label>
                  <input
                    type="text"
                    value={config.subtitleLine2 || ""}
                    onChange={(e) => updateConfig({ subtitleLine2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    E-mail
                  </label>
                  <input
                    type="text"
                    value={config.contactEmail || ""}
                    onChange={(e) => updateConfig({ contactEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={config.contactPhone || ""}
                    onChange={(e) => updateConfig({ contactPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={config.contactCity || ""}
                    onChange={(e) => updateConfig({ contactCity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Nav Links */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white">Links de Navegação</h3>
            <button
              onClick={addNavLink}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {config.navLinks.map((link, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateNavLink(i, "label", e.target.value)}
                  placeholder="Label"
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="text"
                  value={link.href}
                  onChange={(e) => updateNavLink(i, "href", e.target.value)}
                  placeholder="/caminho ou #secao"
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={() => removeNavLink(i)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white">Botões de Ação (CTA)</h3>
            <button
              onClick={addCtaButton}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.ctaButtons.map((btn, i) => (
              <div
                key={i}
                className="p-4 border border-gray-100 dark:border-gray-600 rounded-lg space-y-3 bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Botão {i + 1}</span>
                  <button
                    onClick={() => removeCtaButton(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={btn.label}
                  onChange={(e) => updateCtaButton(i, "label", e.target.value)}
                  placeholder="Texto do botão"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="text"
                  value={btn.href}
                  onChange={(e) => updateCtaButton(i, "href", e.target.value)}
                  placeholder="Link do botão"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
                <select
                  value={btn.variant}
                  onChange={(e) => updateCtaButton(i, "variant", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="outline">Outline (borda)</option>
                  <option value="solid">Solid (preenchido)</option>
                </select>
              </div>
            ))}
          </div>

          {config.ctaButtons.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              Nenhum botão de ação configurado
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
