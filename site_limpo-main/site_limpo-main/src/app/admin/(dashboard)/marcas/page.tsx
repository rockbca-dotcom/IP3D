"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from "react-icons/hi";
import { Modal, ConfirmModal } from "@/components/admin/Modal";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  image: string | null;
  highlights: string[];
  active: boolean;
}

const emptyBrand = {
  name: "",
  slug: "",
  description: "",
  logo: "",
  image: "",
  highlights: [] as string[],
  active: true,
};

export default function MarcasPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState(emptyBrand);
  const [saving, setSaving] = useState(false);
  const [highlightInput, setHighlightInput] = useState("");

  useEffect(() => {
    fetchBrands();
  }, [page]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/brands?page=${page}`);
      const data = await res.json();
      setBrands(data.brands || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setSelectedBrand(null);
    setFormData(emptyBrand);
    setModalOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || "",
      logo: brand.logo || "",
      image: brand.image || "",
      highlights: brand.highlights || [],
      active: brand.active,
    });
    setModalOpen(true);
  };

  const openView = (brand: Brand) => {
    setSelectedBrand(brand);
    setViewModalOpen(true);
  };

  const openDelete = (brand: Brand) => {
    setSelectedBrand(brand);
    setDeleteModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = selectedBrand ? `/api/admin/brands/${selectedBrand.id}` : "/api/admin/brands";
      const method = selectedBrand ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalOpen(false);
        fetchBrands();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBrand) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/brands/${selectedBrand.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteModalOpen(false);
        fetchBrands();
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const addHighlight = () => {
    if (highlightInput.trim()) {
      setFormData({ ...formData, highlights: [...formData.highlights, highlightInput.trim()] });
      setHighlightInput("");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-black dark:text-white">Marcas</h1>
          <p className="text-gray-400 mt-1 text-sm">Gerencie as marcas parceiras</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
          <HiOutlinePlus className="h-4 w-4" />
          Nova Marca
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-400">Carregando...</div>
        ) : brands.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">Nenhuma marca encontrada</div>
        ) : (
          brands.map((brand) => (
            <div key={brand.id} className="border border-gray-200 dark:border-zinc-800 p-6 hover:border-black dark:hover:border-white transition-colors group">
              <div className="flex items-start justify-between mb-4">
                {brand.logo ? (
                  <div className="h-12 w-24 relative">
                    <Image src={brand.logo} alt={brand.name} fill className="object-contain object-left" />
                  </div>
                ) : (
                  <div className="h-12 w-24 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-xs text-gray-400">Sem logo</div>
                )}
                <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-medium ${brand.active ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400"}`}>
                  {brand.active ? "Ativo" : "Inativo"}
                </span>
              </div>
              <h3 className="text-lg font-medium text-black dark:text-white mb-2">{brand.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{brand.description || "-"}</p>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openView(brand)} className="p-2 text-gray-400 hover:text-black dark:hover:text-white"><HiOutlineEye className="h-4 w-4" /></button>
                <button onClick={() => openEdit(brand)} className="p-2 text-gray-400 hover:text-black dark:hover:text-white"><HiOutlinePencil className="h-4 w-4" /></button>
                <button onClick={() => openDelete(brand)} className="p-2 text-gray-400 hover:text-red-600"><HiOutlineTrash className="h-4 w-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 text-sm ${p === page ? "bg-black dark:bg-white text-white dark:text-black" : "border border-gray-200 dark:border-zinc-700 hover:border-black dark:hover:border-white"} transition-colors`}>{p}</button>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selectedBrand ? "Editar Marca" : "Nova Marca"} size="lg">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:border-black dark:focus:border-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:border-black dark:focus:border-white outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destaques</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={highlightInput} onChange={(e) => setHighlightInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight())} placeholder="Digite um destaque..." className="flex-1 px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white text-sm outline-none" />
              <button type="button" onClick={addHighlight} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm">Adicionar</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.highlights.map((h, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-zinc-800 text-sm">
                  {h}
                  <button type="button" onClick={() => setFormData({ ...formData, highlights: formData.highlights.filter((_, idx) => idx !== i) })} className="ml-1 text-gray-400 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>
          <ImageUpload label="Logo" value={formData.logo} onChange={(url) => setFormData({ ...formData, logo: url })} folder="brands" />
          <ImageUpload label="Imagem de Capa" value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} folder="brands" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="accent-black" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Ativo</span>
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
            <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2.5 border border-gray-200 dark:border-zinc-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">Cancelar</button>
            <button type="button" onClick={handleSave} disabled={saving || !formData.name} className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium disabled:opacity-50 transition-colors">{saving ? "Salvando..." : "Salvar"}</button>
          </div>
        </div>
      </Modal>

      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)} title={selectedBrand?.name || "Marca"} size="lg">
        {selectedBrand && (
          <div className="space-y-6">
            {selectedBrand.image && <div className="relative h-48 w-full bg-gray-100 dark:bg-zinc-800"><Image src={selectedBrand.image} alt={selectedBrand.name} fill className="object-cover" /></div>}
            {selectedBrand.logo && <div className="relative h-16 w-32"><Image src={selectedBrand.logo} alt={selectedBrand.name} fill className="object-contain" /></div>}
            <div><h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Descrição</h3><p className="text-black dark:text-white">{selectedBrand.description || "-"}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Destaques</h3><ul className="list-disc list-inside text-black dark:text-white">{selectedBrand.highlights?.map((h, i) => <li key={i}>{h}</li>) || "-"}</ul></div>
          </div>
        )}
      </Modal>

      <ConfirmModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDelete} title="Excluir Marca" message={`Tem certeza que deseja excluir "${selectedBrand?.name}"?`} confirmText="Excluir" loading={saving} />
    </div>
  );
}
