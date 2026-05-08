"use client";

import { useState, useEffect } from "react";
import { HiOutlineSave, HiOutlineGlobe, HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker, HiOutlineClock } from "react-icons/hi";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface SeoSiteConfig {
  title: string;
  description: string;
  favicon: string;
  keywords: string;
}

interface SeoConfig {
  main: SeoSiteConfig;
  tricologia: SeoSiteConfig;
  spa: SeoSiteConfig;
  salao: SeoSiteConfig;
}

interface Settings {
  siteName: string;
  siteDescription: string;
  logo: string;
  logoDark: string;
  favicon: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  cnpj: string;
  workingHours: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  youtube: string;
  seoConfig: SeoConfig;
}

const defaultSeoConfig: SeoConfig = {
  main: {
    title: "IP3D – Tecnologia em Impressão 3D",
    description: "IP3D: equipamentos e insumos para impressão 3D.",
    favicon: "/favicon.ico",
    keywords: "impressão 3d, impressora 3d, filamento, resina",
  },

  tricologia: {
    title: "",
    description: "",
    favicon: "/favicon.ico",
    keywords: "",
  },
  spa: {
    title: "",
    description: "",
    favicon: "/favicon.ico",
    keywords: "",
  },
  salao: {
    title: "",
    description: "",
    favicon: "/favicon.ico",
    keywords: "",
  },
};

const defaultSettings: Settings = {
  siteName: "IP3D",
  siteDescription: "",
  logo: "/images/Captura_de_tela_2026-02-28_210120-removebg-preview.webp",
  logoDark: "/images/Captura_de_tela_2026-02-28_210120-removebg-preview.webp",
  favicon: "/favicon.ico",
  phone: "(11) 99999-9999",
  whatsapp: "5511999999999",
  email: "",
  address: "São Paulo, SP - Brasil",
  cnpj: "00.000.000/0001-00",
  workingHours: "Seg à Sex: 9h às 18h",
  instagram: "",
  facebook: "",
  linkedin: "",
  youtube: "",
  seoConfig: defaultSeoConfig,
};

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function fetchSettings() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.settings) {
        const seo = data.settings.seoConfig
          ? { ...defaultSeoConfig, ...data.settings.seoConfig }
          : defaultSeoConfig;
        setSettings({ ...defaultSettings, ...data.settings, seoConfig: seo });
      }
    } catch (error) { console.error("Error:", error); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    queueMicrotask(() => {
      void fetchSettings();
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) { console.error("Error:", error); }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-gray-400">Carregando...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-black dark:text-white">Configurações</h1>
          <p className="text-gray-400 mt-1 text-sm">Configure as informações do site</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
        >
          <HiOutlineSave className="h-4 w-4" />
          {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar"}
        </button>
      </div>

      {/* Site Info */}
      <section className="border border-gray-200 dark:border-zinc-800 p-6 space-y-6">
        <h2 className="text-sm uppercase tracking-[0.15em] text-gray-400 font-medium flex items-center gap-2">
          <HiOutlineGlobe className="h-4 w-4" /> Informações do Site
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome do Site</label>
            <input type="text" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CNPJ</label>
            <input type="text" value={settings.cnpj} onChange={(e) => setSettings({ ...settings, cnpj: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
          <textarea value={settings.siteDescription} onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none resize-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ImageUpload label="Logo (Claro)" value={settings.logo} onChange={(url) => setSettings({ ...settings, logo: url })} folder="site" />
          <ImageUpload label="Logo (Escuro)" value={settings.logoDark} onChange={(url) => setSettings({ ...settings, logoDark: url })} folder="site" />
          <ImageUpload label="Favicon" value={settings.favicon} onChange={(url) => setSettings({ ...settings, favicon: url })} folder="site" />
        </div>
      </section>

      {/* Contact */}
      <section className="border border-gray-200 dark:border-zinc-800 p-6 space-y-6">
        <h2 className="text-sm uppercase tracking-[0.15em] text-gray-400 font-medium flex items-center gap-2">
          <HiOutlinePhone className="h-4 w-4" /> Contato
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Telefone</label>
            <input type="text" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">WhatsApp (apenas números)</label>
            <input type="text" value={settings.whatsapp} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} placeholder="5511999999999" className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Horário de Funcionamento</label>
            <input type="text" value={settings.workingHours} onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Endereço</label>
          <input type="text" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
        </div>
      </section>

      {/* SEO por Site */}
      <section className="border border-gray-200 dark:border-zinc-800 p-6 space-y-6">
        <h2 className="text-sm uppercase tracking-[0.15em] text-gray-400 font-medium flex items-center gap-2">
          <HiOutlineGlobe className="h-4 w-4" /> SEO por Site / Landing Page
        </h2>
        <p className="text-xs text-gray-400">Configure título, descrição, favicon e palavras-chave de cada site e landing page individualmente.</p>
        {([
          { key: "main" as const, label: "Site Principal" },
        ]).map(({ key, label }) => (
          <div key={key} className="border border-gray-100 dark:border-zinc-700 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título (title tag)</label>
                <input type="text" value={settings.seoConfig[key]?.title || ""} onChange={(e) => setSettings({ ...settings, seoConfig: { ...settings.seoConfig, [key]: { ...settings.seoConfig[key], title: e.target.value } } })} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Palavras-chave</label>
                <input type="text" value={settings.seoConfig[key]?.keywords || ""} onChange={(e) => setSettings({ ...settings, seoConfig: { ...settings.seoConfig, [key]: { ...settings.seoConfig[key], keywords: e.target.value } } })} placeholder="palavra1, palavra2, ..." className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição (meta description)</label>
              <textarea value={settings.seoConfig[key]?.description || ""} onChange={(e) => setSettings({ ...settings, seoConfig: { ...settings.seoConfig, [key]: { ...settings.seoConfig[key], description: e.target.value } } })} rows={2} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none resize-none text-sm" />
            </div>
            <div className="max-w-xs">
              <ImageUpload label="Favicon" value={settings.seoConfig[key]?.favicon || ""} onChange={(url) => setSettings({ ...settings, seoConfig: { ...settings.seoConfig, [key]: { ...settings.seoConfig[key], favicon: url } } })} folder="favicons" />
            </div>
          </div>
        ))}
      </section>

      {/* Social */}
      <section className="border border-gray-200 dark:border-zinc-800 p-6 space-y-6">
        <h2 className="text-sm uppercase tracking-[0.15em] text-gray-400 font-medium">Redes Sociais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instagram</label>
            <input type="url" value={settings.instagram} onChange={(e) => setSettings({ ...settings, instagram: e.target.value })} placeholder="https://instagram.com/..." className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Facebook</label>
            <input type="url" value={settings.facebook} onChange={(e) => setSettings({ ...settings, facebook: e.target.value })} placeholder="https://facebook.com/..." className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">LinkedIn</label>
            <input type="url" value={settings.linkedin} onChange={(e) => setSettings({ ...settings, linkedin: e.target.value })} placeholder="https://linkedin.com/..." className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">YouTube</label>
            <input type="url" value={settings.youtube} onChange={(e) => setSettings({ ...settings, youtube: e.target.value })} placeholder="https://youtube.com/..." className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
          </div>
        </div>
      </section>
    </div>
  );
}
