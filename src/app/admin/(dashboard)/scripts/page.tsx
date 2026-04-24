"use client";

import { useState, useEffect } from "react";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCode, HiX } from "react-icons/hi";
import { Modal, ConfirmModal } from "@/components/admin/Modal";

interface Script {
  id: string;
  name: string;
  type: "GOOGLE_ANALYTICS" | "GOOGLE_ADS" | "GOOGLE_TAG_MANAGER" | "META_PIXEL" | "CUSTOM";
  position: "HEAD" | "BODY_START" | "BODY_END";
  code: string;
  active: boolean;
  site: "MAIN" | "BOTH";
  order: number;
}

const emptyScript: Omit<Script, "id"> = {
  name: "",
  type: "CUSTOM",
  position: "HEAD",
  code: "",
  active: true,
  site: "BOTH",
  order: 0,
};

const scriptTypes = [
  { value: "GOOGLE_ANALYTICS", label: "Google Analytics" },
  { value: "GOOGLE_ADS", label: "Google Ads" },
  { value: "GOOGLE_TAG_MANAGER", label: "Google Tag Manager" },
  { value: "META_PIXEL", label: "Meta Pixel (Facebook)" },
  { value: "CUSTOM", label: "Script Personalizado" },
];

const scriptPositions = [
  { value: "HEAD", label: "Cabeçalho (head)" },
  { value: "BODY_START", label: "Início do body" },
  { value: "BODY_END", label: "Final do body" },
];

const siteTargets = [
  { value: "BOTH", label: "Ambos os sites" },
  { value: "MAIN", label: "Site Principal" },
  
];

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [formData, setFormData] = useState(emptyScript);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/scripts");
      const data = await res.json();
      setScripts(data.scripts || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setSelectedScript(null);
    setFormData(emptyScript);
    setModalOpen(true);
  };

  const openEdit = (script: Script) => {
    setSelectedScript(script);
    setFormData({
      name: script.name,
      type: script.type,
      position: script.position,
      code: script.code,
      active: script.active,
      site: script.site,
      order: script.order,
    });
    setModalOpen(true);
  };

  const openDelete = (script: Script) => {
    setSelectedScript(script);
    setDeleteModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = selectedScript
        ? `/api/admin/scripts/${selectedScript.id}`
        : "/api/admin/scripts";
      const method = selectedScript ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchScripts();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedScript) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/scripts/${selectedScript.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        fetchScripts();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (script: Script) => {
    try {
      await fetch(`/api/admin/scripts/${script.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...script, active: !script.active }),
      });
      fetchScripts();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getTypeLabel = (type: string) => scriptTypes.find((t) => t.value === type)?.label || type;
  const getPositionLabel = (position: string) => scriptPositions.find((p) => p.value === position)?.label || position;
  const getSiteLabel = (site: string) => siteTargets.find((s) => s.value === site)?.label || site;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-black dark:text-white">Scripts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gerencie scripts externos (Analytics, Ads, Pixels, etc.)
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Novo Script
        </button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 mb-6">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>⚠️ Importante:</strong> Alterações nos scripts afetam diretamente o rastreamento e funcionamento do site. 
          Certifique-se de que os scripts estão corretos antes de ativar.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-black dark:border-white border-t-transparent rounded-full" />
        </div>
      ) : scripts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 dark:border-zinc-700">
          <HiOutlineCode className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Nenhum script cadastrado</p>
          <button
            onClick={openCreate}
            className="mt-4 text-sm text-black dark:text-white underline hover:no-underline"
          >
            Adicionar primeiro script
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {scripts.map((script) => (
            <div
              key={script.id}
              className={`border p-4 ${
                script.active
                  ? "border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  : "border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-black dark:text-white">{script.name}</h3>
                    <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">
                      {getTypeLabel(script.type)}
                    </span>
                    <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      {getSiteLabel(script.site)}
                    </span>
                    {script.active ? (
                      <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                        Ativo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        Inativo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Posição: {getPositionLabel(script.position)}
                  </p>
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-zinc-800 font-mono text-xs text-gray-600 dark:text-gray-400 max-h-20 overflow-hidden">
                    {script.code.substring(0, 200)}...
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleActive(script)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      script.active
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200"
                        : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200"
                    }`}
                  >
                    {script.active ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    onClick={() => openEdit(script)}
                    className="p-2 text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <HiOutlinePencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openDelete(script)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedScript ? "Editar Script" : "Novo Script"}
        size="xl"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome do Script *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Google Analytics 4"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:border-black dark:focus:border-white outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:border-black dark:focus:border-white outline-none"
              >
                {scriptTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Posição
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:border-black dark:focus:border-white outline-none"
              >
                {scriptPositions.map((pos) => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aplicar em
              </label>
              <select
                value={formData.site}
                onChange={(e) => setFormData({ ...formData, site: e.target.value as any })}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:border-black dark:focus:border-white outline-none"
              >
                {siteTargets.map((site) => (
                  <option key={site.value} value={site.value}>
                    {site.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Código do Script *
            </label>
            <textarea
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              rows={12}
              placeholder="Cole o código do script aqui (incluindo as tags <script>)"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:border-black dark:focus:border-white outline-none font-mono text-sm resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Cole o código completo fornecido pelo Google, Meta ou outro provedor.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="accent-black"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Script ativo</span>
            </label>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Ordem:</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-20 px-3 py-1.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-6 py-2.5 border border-gray-200 dark:border-zinc-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.code}
              className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              {saving ? "Salvando..." : selectedScript ? "Salvar Alterações" : "Criar Script"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Script"
        message={`Tem certeza que deseja excluir o script "${selectedScript?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        loading={saving}
      />
    </div>
  );
}
