"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiOutlinePencil, HiOutlineCheck, HiOutlineX, HiOutlineHome } from "react-icons/hi";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface HomeSection {
  id: string;
  sectionId: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  content: Record<string, unknown> | null;
  image: string | null;
  active: boolean;
  order: number;
}

const sectionLabels: Record<string, string> = {
  "why-choose-us": "Por que nos escolher",
  "partnership": "Parceria",
  "maintenance-preview": "Manutenção",
  "catalog-cta": "CTA Catálogo",
};

export default function HomeAdminPage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<HomeSection | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const res = await fetch("/api/admin/home-sections");
      const data = await res.json();
      setSections(data.sections || []);
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (section: HomeSection) => {
    setEditingSection(section.sectionId);
    setEditData({ ...section });
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditData(null);
  };

  const saveSection = async () => {
    if (!editData) return;
    
    setSaving(true);
    try {
      const res = await fetch("/api/admin/home-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      
      if (res.ok) {
        await fetchSections();
        setEditingSection(null);
        setEditData(null);
      }
    } catch (error) {
      console.error("Error saving section:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateEditData = (field: string, value: unknown) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  const updateContentField = (field: string, value: unknown) => {
    if (!editData) return;
    setEditData({
      ...editData,
      content: { ...(editData.content || {}), [field]: value },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white flex items-center gap-3">
            <HiOutlineHome className="h-7 w-7" />
            Editar Home
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Edite os textos e conteúdos das seções da página inicial
          </p>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-black dark:text-white">
                  {sectionLabels[section.sectionId] || section.sectionId}
                </h2>
                <p className="text-sm text-gray-500">ID: {section.sectionId}</p>
              </div>
              
              {editingSection === section.sectionId ? (
                <div className="flex gap-2">
                  <button
                    onClick={saveSection}
                    disabled={saving}
                    className="p-2 bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <HiOutlineCheck className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="p-2 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors"
                  >
                    <HiOutlineX className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEditing(section)}
                  className="p-2 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <HiOutlinePencil className="h-5 w-5" />
                </button>
              )}
            </div>

            {editingSection === section.sectionId && editData ? (
              <div className="space-y-4">
                {/* Campos básicos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      value={editData.title || ""}
                      onChange={(e) => updateEditData("title", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subtítulo
                    </label>
                    <input
                      type="text"
                      value={editData.subtitle || ""}
                      onChange={(e) => updateEditData("subtitle", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={editData.description || ""}
                    onChange={(e) => updateEditData("description", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
                  />
                </div>

                {/* Imagem (para seções que têm) */}
                {editData.image !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Imagem
                    </label>
                    <ImageUpload
                      value={editData.image || ""}
                      onChange={(v) => updateEditData("image", v)}
                      folder="home"
                    />
                  </div>
                )}

                {/* Campos específicos por seção */}
                {section.sectionId === "catalog-cta" && editData.content && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Telefone (exibição)
                      </label>
                      <input
                        type="text"
                        value={(editData.content as Record<string, string>).phone || ""}
                        onChange={(e) => updateContentField("phone", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Telefone (link)
                      </label>
                      <input
                        type="text"
                        value={(editData.content as Record<string, string>).phoneRaw || ""}
                        onChange={(e) => updateContentField("phoneRaw", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mensagem WhatsApp
                      </label>
                      <input
                        type="text"
                        value={(editData.content as Record<string, string>).whatsappMessage || ""}
                        onChange={(e) => updateContentField("whatsappMessage", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      />
                    </div>
                  </div>
                )}

                {section.sectionId === "maintenance-preview" && editData.content && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Texto do Botão
                      </label>
                      <input
                        type="text"
                        value={(editData.content as Record<string, string>).buttonText || ""}
                        onChange={(e) => updateContentField("buttonText", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Link do Botão
                      </label>
                      <input
                        type="text"
                        value={(editData.content as Record<string, string>).buttonLink || ""}
                        onChange={(e) => updateContentField("buttonLink", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {section.title && <p><strong>Título:</strong> {section.title}</p>}
                {section.subtitle && <p><strong>Subtítulo:</strong> {section.subtitle}</p>}
                {section.description && (
                  <p><strong>Descrição:</strong> {section.description.substring(0, 100)}...</p>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 text-sm text-blue-800 dark:text-blue-200">
        <strong>Dica:</strong> Os banners da Home são editados em{" "}
        <a href="/admin/banners" className="underline font-medium">
          Banners
        </a>
        . Os produtos em destaque são gerenciados em{" "}
        <a href="/admin/produtos" className="underline font-medium">
          Produtos
        </a>{" "}
        (marque como "Destaque").
      </div>
    </div>
  );
}
