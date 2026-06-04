"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineCheck,
  HiOutlineHome,
  HiOutlinePencil,
  HiOutlinePlus,
  HiOutlineX,
} from "react-icons/hi";
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
  partnership: "Parceria",
  "maintenance-preview": "Manutenção",
  "catalog-cta": "CTA Catálogo",
};

type EditableItem = Record<string, string>;

function normalizeArray(value: unknown): EditableItem[] {
  return Array.isArray(value) ? (value as EditableItem[]) : [];
}

export default function HomeAdminPage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<HomeSection | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchSections();
  }, []);

  async function fetchSections() {
    try {
      const response = await fetch("/api/admin/home-sections");
      const data = await response.json();
      setSections(data.sections || []);
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setLoading(false);
    }
  }

  function startEditing(section: HomeSection) {
    setEditingSection(section.sectionId);
    setEditData({ ...section });
  }

  function cancelEditing() {
    setEditingSection(null);
    setEditData(null);
  }

  async function saveSection() {
    if (!editData) return;

    setSaving(true);
    try {
      const response = await fetch("/api/admin/home-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        await fetchSections();
        cancelEditing();
      }
    } catch (error) {
      console.error("Error saving section:", error);
    } finally {
      setSaving(false);
    }
  }

  function updateEditData(field: keyof HomeSection, value: unknown) {
    if (!editData) return;
    setEditData({ ...editData, [field]: value } as HomeSection);
  }

  function updateContentField(field: string, value: unknown) {
    if (!editData) return;
    setEditData({
      ...editData,
      content: { ...(editData.content || {}), [field]: value },
    });
  }

  function updateContentArrayItem(
    field: string,
    index: number,
    key: string,
    value: string,
  ) {
    if (!editData) return;
    const items = normalizeArray((editData.content || {})[field]);
    items[index] = { ...(items[index] || {}), [key]: value };
    updateContentField(field, items);
  }

  function addContentArrayItem(field: string, item: EditableItem) {
    if (!editData) return;
    const items = normalizeArray((editData.content || {})[field]);
    updateContentField(field, [...items, item]);
  }

  function removeContentArrayItem(field: string, index: number) {
    if (!editData) return;
    const items = normalizeArray((editData.content || {})[field]);
    updateContentField(
      field,
      items.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-black border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
                    onClick={() => void saveSection()}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1 text-sm">
                    <span className="block text-gray-700 dark:text-gray-300">Título</span>
                    <input
                      type="text"
                      value={editData.title || ""}
                      onChange={(event) => updateEditData("title", event.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                    />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span className="block text-gray-700 dark:text-gray-300">Subtítulo</span>
                    <input
                      type="text"
                      value={editData.subtitle || ""}
                      onChange={(event) => updateEditData("subtitle", event.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                    />
                  </label>
                </div>

                <label className="space-y-1 text-sm">
                  <span className="block text-gray-700 dark:text-gray-300">Descrição</span>
                  <textarea
                    value={editData.description || ""}
                    onChange={(event) => updateEditData("description", event.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white resize-none"
                  />
                </label>

                {editData.image !== undefined && (
                  <ImageUpload
                    value={editData.image || ""}
                    onChange={(value) => updateEditData("image", value)}
                    folder="home"
                  />
                )}

                {section.sectionId === "catalog-cta" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
                    <label className="space-y-1 text-sm">
                      <span className="block text-gray-700 dark:text-gray-300">Telefone (exibição)</span>
                      <input
                        type="text"
                        value={String(editData.content?.phone || "")}
                        onChange={(event) => updateContentField("phone", event.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                      />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span className="block text-gray-700 dark:text-gray-300">Telefone (link)</span>
                      <input
                        type="text"
                        value={String(editData.content?.phoneRaw || "")}
                        onChange={(event) => updateContentField("phoneRaw", event.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                      />
                    </label>
                    <label className="space-y-1 text-sm md:col-span-2">
                      <span className="block text-gray-700 dark:text-gray-300">Mensagem WhatsApp</span>
                      <input
                        type="text"
                        value={String(editData.content?.whatsappMessage || "")}
                        onChange={(event) =>
                          updateContentField("whatsappMessage", event.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                      />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span className="block text-gray-700 dark:text-gray-300">Texto do botão catálogo</span>
                      <input
                        type="text"
                        value={String(editData.content?.buttonText || "")}
                        onChange={(event) => updateContentField("buttonText", event.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                      />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span className="block text-gray-700 dark:text-gray-300">Texto do botão consultor</span>
                      <input
                        type="text"
                        value={String(editData.content?.consultorButtonText || "")}
                        onChange={(event) =>
                          updateContentField("consultorButtonText", event.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                      />
                    </label>
                  </div>
                )}

                {section.sectionId === "maintenance-preview" && (
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="space-y-1 text-sm">
                        <span className="block text-gray-700 dark:text-gray-300">Texto do botão</span>
                        <input
                          type="text"
                          value={String(editData.content?.buttonText || "")}
                          onChange={(event) => updateContentField("buttonText", event.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                        />
                      </label>
                      <label className="space-y-1 text-sm">
                        <span className="block text-gray-700 dark:text-gray-300">Link do botão</span>
                        <input
                          type="text"
                          value={String(editData.content?.buttonLink || "")}
                          onChange={(event) => updateContentField("buttonLink", event.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                        />
                      </label>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Serviços
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            addContentArrayItem("services", {
                              icon: "wrench",
                              title: "",
                              description: "",
                            })
                          }
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Adicionar serviço
                        </button>
                      </div>
                      {normalizeArray(editData.content?.services).map((service, index) => (
                        <div
                          key={`service-${index}`}
                          className="rounded-lg border border-gray-200 dark:border-zinc-700 p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Serviço {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeContentArrayItem("services", index)}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Remover
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                              type="text"
                              value={service.icon || ""}
                              onChange={(event) =>
                                updateContentArrayItem("services", index, "icon", event.target.value)
                              }
                              placeholder="Ícone"
                              className="px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                            />
                            <input
                              type="text"
                              value={service.title || ""}
                              onChange={(event) =>
                                updateContentArrayItem("services", index, "title", event.target.value)
                              }
                              placeholder="Título"
                              className="px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                            />
                            <input
                              type="text"
                              value={service.description || ""}
                              onChange={(event) =>
                                updateContentArrayItem(
                                  "services",
                                  index,
                                  "description",
                                  event.target.value,
                                )
                              }
                              placeholder="Descrição"
                              className="px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.sectionId === "why-choose-us" && (
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Features
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            addContentArrayItem("features", {
                              icon: "shield",
                              title: "",
                              description: "",
                            })
                          }
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Adicionar feature
                        </button>
                      </div>
                      {normalizeArray(editData.content?.features).map((feature, index) => (
                        <div
                          key={`feature-${index}`}
                          className="rounded-lg border border-gray-200 dark:border-zinc-700 p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Feature {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeContentArrayItem("features", index)}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Remover
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                              type="text"
                              value={feature.icon || ""}
                              onChange={(event) =>
                                updateContentArrayItem("features", index, "icon", event.target.value)
                              }
                              placeholder="Ícone"
                              className="px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                            />
                            <input
                              type="text"
                              value={feature.title || ""}
                              onChange={(event) =>
                                updateContentArrayItem("features", index, "title", event.target.value)
                              }
                              placeholder="Título"
                              className="px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                            />
                            <input
                              type="text"
                              value={feature.description || ""}
                              onChange={(event) =>
                                updateContentArrayItem(
                                  "features",
                                  index,
                                  "description",
                                  event.target.value,
                                )
                              }
                              placeholder="Descrição"
                              className="px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Estatísticas
                        </h3>
                        <button
                          type="button"
                          onClick={() => addContentArrayItem("stats", { value: "", label: "" })}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Adicionar estatística
                        </button>
                      </div>
                      {normalizeArray(editData.content?.stats).map((stat, index) => (
                        <div
                          key={`stat-${index}`}
                          className="rounded-lg border border-gray-200 dark:border-zinc-700 p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Estatística {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeContentArrayItem("stats", index)}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Remover
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={stat.value || ""}
                              onChange={(event) =>
                                updateContentArrayItem("stats", index, "value", event.target.value)
                              }
                              placeholder="Valor"
                              className="px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                            />
                            <input
                              type="text"
                              value={stat.label || ""}
                              onChange={(event) =>
                                updateContentArrayItem("stats", index, "label", event.target.value)
                              }
                              placeholder="Legenda"
                              className="px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {section.title && (
                  <p>
                    <strong>Título:</strong> {section.title}
                  </p>
                )}
                {section.subtitle && (
                  <p>
                    <strong>Subtítulo:</strong> {section.subtitle}
                  </p>
                )}
                {section.description && (
                  <p>
                    <strong>Descrição:</strong> {section.description.substring(0, 100)}...
                  </p>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 text-sm text-blue-800 dark:text-blue-200">
        <strong>Dica:</strong> Os banners da Home são editados em{" "}
        <a href="/admin/banners" className="underline font-medium">
          Banners
        </a>
        . Os produtos em destaque são gerenciados em{" "}
        <a href="/admin/produtos" className="underline font-medium">
          Produtos
        </a>{" "}
        e a vitrine de personalizados usa produtos reais da categoria correspondente.
      </div>
    </div>
  );
}
