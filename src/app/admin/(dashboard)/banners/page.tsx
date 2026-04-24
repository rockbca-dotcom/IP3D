"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiOutlineArrowUp, HiOutlineArrowDown } from "react-icons/hi";
import { Modal, ConfirmModal } from "@/components/admin/Modal";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Banner {
  id: string;
  badge: string | null;
  subtitle: string | null;
  title: string;
  description: string | null;
  image: string | null;
  video: string | null;
  button1Text: string | null;
  button1Link: string | null;
  button1Color: string | null;
  button1Rounded: boolean;
  button2Text: string | null;
  button2Link: string | null;
  button2Color: string | null;
  button2Rounded: boolean;
  order: number;
  active: boolean;
  crosshairPos: { top: string; left: string } | null;
  techLabels: { label: string; value: string }[] | null;
}

const emptyBanner = {
  badge: "",
  subtitle: "",
  title: "",
  description: "",
  image: "",
  video: "",
  button1Text: "Conhecer Produtos",
  button1Link: "/produtos",
  button1Color: "white",
  button1Rounded: false,
  button2Text: "",
  button2Link: "",
  button2Color: "outline",
  button2Rounded: false,
  order: 0,
  active: true,
  crosshairPos: { top: "50%", left: "50%" },
  techLabels: [{ label: "MATERIAL", value: "PLA+" }],
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState(emptyBanner);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      const data = await res.json();
      setBanners(data.banners || []);
    } catch (error) { console.error("Error:", error); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setSelectedBanner(null);
    setFormData({ ...emptyBanner, order: banners.length });
    setModalOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setSelectedBanner(banner);
    setFormData({
      badge: banner.badge || "",
      subtitle: banner.subtitle || "",
      title: banner.title,
      description: banner.description || "",
      image: banner.image || "",
      video: banner.video || "",
      button1Text: banner.button1Text || "",
      button1Link: banner.button1Link || "",
      button1Color: banner.button1Color || "white",
      button1Rounded: banner.button1Rounded,
      button2Text: banner.button2Text || "",
      button2Link: banner.button2Link || "",
      button2Color: banner.button2Color || "outline",
      button2Rounded: banner.button2Rounded,
      order: banner.order,
      active: banner.active,
      crosshairPos: banner.crosshairPos || { top: "50%", left: "50%" },
      techLabels: banner.techLabels || [{ label: "MATERIAL", value: "PLA+" }],
    });
    setModalOpen(true);
  };

  const openView = (banner: Banner) => { setSelectedBanner(banner); setViewModalOpen(true); };
  const openDelete = (banner: Banner) => { setSelectedBanner(banner); setDeleteModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = selectedBanner ? `/api/admin/banners/${selectedBanner.id}` : "/api/admin/banners";
      const method = selectedBanner ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) { setModalOpen(false); fetchBanners(); }
    } catch (error) { console.error("Error:", error); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selectedBanner) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/banners/${selectedBanner.id}`, { method: "DELETE" });
      if (res.ok) { setDeleteModalOpen(false); fetchBanners(); }
    } catch (error) { console.error("Error:", error); }
    finally { setSaving(false); }
  };

  const moveOrder = async (banner: Banner, direction: "up" | "down") => {
    const idx = banners.findIndex(b => b.id === banner.id);
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= banners.length) return;

    const other = banners[newIdx];
    await Promise.all([
      fetch(`/api/admin/banners/${banner.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...banner, order: other.order }) }),
      fetch(`/api/admin/banners/${other.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...other, order: banner.order }) }),
    ]);
    fetchBanners();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-black dark:text-white">Banners</h1>
          <p className="text-gray-400 mt-1 text-sm">Gerencie os banners do Hero da página inicial</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
          <HiOutlinePlus className="h-4 w-4" />
          Novo Banner
        </button>
      </div>

      {/* Banners List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando...</div>
        ) : banners.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 dark:border-zinc-700">
            <p className="text-gray-400 mb-4">Nenhum banner cadastrado</p>
            <p className="text-sm text-gray-500">O Hero mostrará o conteúdo padrão até você adicionar banners</p>
          </div>
        ) : (
          banners.map((banner, idx) => (
            <div key={banner.id} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-zinc-800 hover:border-black dark:hover:border-white transition-colors group">
              {/* Order Controls */}
              <div className="flex flex-col gap-1">
                <button onClick={() => moveOrder(banner, "up")} disabled={idx === 0} className="p-1 text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-30">
                  <HiOutlineArrowUp className="h-4 w-4" />
                </button>
                <button onClick={() => moveOrder(banner, "down")} disabled={idx === banners.length - 1} className="p-1 text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-30">
                  <HiOutlineArrowDown className="h-4 w-4" />
                </button>
              </div>

              {/* Thumbnail */}
              <div className="w-32 h-20 bg-gray-100 dark:bg-zinc-800 flex-shrink-0 relative overflow-hidden">
                {banner.image ? (
                  <Image src={banner.image} alt={banner.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sem imagem</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {banner.badge && <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400">{banner.badge}</span>}
                  <span className={`text-xs px-2 py-0.5 ${banner.active ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-zinc-800 text-gray-500"}`}>
                    {banner.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <h3 className="font-medium text-black dark:text-white truncate">{banner.title}</h3>
                {banner.subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{banner.subtitle}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openView(banner)} className="p-2 text-gray-400 hover:text-black dark:hover:text-white"><HiOutlineEye className="h-4 w-4" /></button>
                <button onClick={() => openEdit(banner)} className="p-2 text-gray-400 hover:text-black dark:hover:text-white"><HiOutlinePencil className="h-4 w-4" /></button>
                <button onClick={() => openDelete(banner)} className="p-2 text-gray-400 hover:text-red-600"><HiOutlineTrash className="h-4 w-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selectedBanner ? "Editar Banner" : "Novo Banner"} size="xl">
        <div className="space-y-6">
          {/* Badge & Subtitle */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Badge (opcional)</label>
              <input type="text" value={formData.badge} onChange={(e) => setFormData({ ...formData, badge: e.target.value })} placeholder="Ex: Distribuidor Exclusivo" className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subtítulo</label>
              <input type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} placeholder="Ex: A referência mundial em design" className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Produto Destaque" className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none text-xl" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} placeholder="Texto descritivo do banner..." className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none resize-none" />
          </div>

          {/* Buttons */}
          <div className="border border-gray-200 dark:border-zinc-700 p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Botão Principal</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Texto</label>
                <input type="text" value={formData.button1Text} onChange={(e) => setFormData({ ...formData, button1Text: e.target.value })} placeholder="Conhecer Produtos" className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Link</label>
                <input type="text" value={formData.button1Link} onChange={(e) => setFormData({ ...formData, button1Link: e.target.value })} placeholder="/produtos" className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Estilo</label>
                <select value={formData.button1Color} onChange={(e) => setFormData({ ...formData, button1Color: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none text-sm">
                  <option value="white">Branco (Sólido)</option>
                  <option value="black">Preto (Sólido)</option>
                  <option value="outline">Outline (Transparente)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-zinc-700 p-4 space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Botão Secundário (opcional)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Texto</label>
                <input type="text" value={formData.button2Text} onChange={(e) => setFormData({ ...formData, button2Text: e.target.value })} placeholder="Assistir Vídeo" className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Link</label>
                <input type="text" value={formData.button2Link} onChange={(e) => setFormData({ ...formData, button2Link: e.target.value })} placeholder="#video" className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Estilo</label>
                <select value={formData.button2Color} onChange={(e) => setFormData({ ...formData, button2Color: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none text-sm">
                  <option value="outline">Outline (Transparente)</option>
                  <option value="white">Branco (Sólido)</option>
                  <option value="black">Preto (Sólido)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Image */}
          <ImageUpload label="Imagem de Fundo *" value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} folder="banners" />

          {/* Video (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL do Vídeo (opcional)</label>
            <input type="text" value={formData.video} onChange={(e) => setFormData({ ...formData, video: e.target.value })} placeholder="https://youtube.com/..." className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
          </div>

          {/* Active */}
          <label className="flex items-center gap-2 cursor-pointer pb-4 border-b border-gray-200 dark:border-zinc-800">
            <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="accent-black" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Banner ativo</span>
          </label>

          {/* HUD CUSTOMIZATION (NEW) */}
          <div className="space-y-4 border-t border-gray-200 dark:border-zinc-800 pt-6">
            <h3 className="text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
              Customização HUD (Mira & Telemetria)
            </h3>
            
            <div className="grid grid-cols-2 gap-6 bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Posição da Mira (Vertical %)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="0" max="100" value={parseInt(formData.crosshairPos?.top || "50")} onChange={(e) => setFormData({ ...formData, crosshairPos: { ...formData.crosshairPos!, top: `${e.target.value}%` } })} className="flex-1 accent-cyan-500" />
                  <span className="text-xs font-mono w-10">{formData.crosshairPos?.top}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Posição da Mira (Horizontal %)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="0" max="100" value={parseInt(formData.crosshairPos?.left || "50")} onChange={(e) => setFormData({ ...formData, crosshairPos: { ...formData.crosshairPos!, left: `${e.target.value}%` } })} className="flex-1 accent-cyan-500" />
                  <span className="text-xs font-mono w-10">{formData.crosshairPos?.left}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-medium text-gray-500">Labels Técnicas (HUD)</label>
              <div className="space-y-2">
                {(formData.techLabels || []).map((label, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" value={label.label} onChange={(e) => {
                      const newLabels = [...(formData.techLabels || [])];
                      newLabels[idx].label = e.target.value.toUpperCase();
                      setFormData({ ...formData, techLabels: newLabels });
                    }} placeholder="CHAVE (EX: TEMP)" className="flex-1 px-3 py-2 text-xs border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none" />
                    <input type="text" value={label.value} onChange={(e) => {
                      const newLabels = [...(formData.techLabels || [])];
                      newLabels[idx].value = e.target.value;
                      setFormData({ ...formData, techLabels: newLabels });
                    }} placeholder="VALOR (EX: 200C)" className="flex-1 px-3 py-2 text-xs border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 outline-none" />
                    <button onClick={() => {
                      const newLabels = (formData.techLabels || []).filter((_, i) => i !== idx);
                      setFormData({ ...formData, techLabels: newLabels });
                    }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><HiOutlineTrash className="h-4 w-4" /></button>
                  </div>
                ))}
                <button onClick={() => setFormData({ ...formData, techLabels: [...(formData.techLabels || []), { label: "", value: "" }] })} className="w-full py-2 border-2 border-dashed border-gray-200 dark:border-zinc-700 text-xs text-gray-400 hover:border-cyan-500 hover:text-cyan-500 transition-colors">
                  + Adicionar Label Técnica
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
            <button onClick={() => setModalOpen(false)} className="px-6 py-2.5 border border-gray-200 dark:border-zinc-700 text-sm font-medium">Cancelar</button>
            <button onClick={handleSave} disabled={saving || !formData.title} className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Prévia do Banner" size="xl">
        {selectedBanner && (
          <div className="relative h-80 w-full bg-black overflow-hidden">
            {selectedBanner.image && <Image src={selectedBanner.image} alt={selectedBanner.title} fill className="object-cover opacity-60" />}
            <div className="absolute inset-0 flex items-center p-8">
              <div className="max-w-lg text-white">
                {selectedBanner.badge && <span className="inline-block px-3 py-1 mb-4 text-xs bg-white/20 backdrop-blur-sm border border-white/30 rounded-full">{selectedBanner.badge}</span>}
                {selectedBanner.subtitle && <p className="text-white/70 text-sm mb-2">{selectedBanner.subtitle}</p>}
                <h2 className="text-4xl font-serif font-semibold mb-4">{selectedBanner.title}</h2>
                {selectedBanner.description && <p className="text-white/80 text-sm mb-6">{selectedBanner.description}</p>}
                <div className="flex gap-3">
                  {selectedBanner.button1Text && (
                    <button className={`px-4 py-2 text-sm font-medium ${selectedBanner.button1Color === "white" ? "bg-white text-black" : selectedBanner.button1Color === "black" ? "bg-black text-white" : "border border-white/80 text-white"}`}>
                      {selectedBanner.button1Text}
                    </button>
                  )}
                  {selectedBanner.button2Text && (
                    <button className={`px-4 py-2 text-sm font-medium ${selectedBanner.button2Color === "white" ? "bg-white text-black" : selectedBanner.button2Color === "black" ? "bg-black text-white" : "border border-white/80 text-white"}`}>
                      {selectedBanner.button2Text}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDelete} title="Excluir Banner" message={`Excluir o banner "${selectedBanner?.title}"?`} confirmText="Excluir" loading={saving} />
    </div>
  );
}
