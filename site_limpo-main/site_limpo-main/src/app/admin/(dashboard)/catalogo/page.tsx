"use client";

import { useState, useEffect, useRef } from "react";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineDownload, HiOutlineDocumentText } from "react-icons/hi";
import { Modal, ConfirmModal } from "@/components/admin/Modal";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Catalog {
  id: string;
  name: string;
  description: string | null;
  file: string;
  thumbnail: string | null;
  downloads: number;
  active: boolean;
}

const emptyCatalog = { name: "", description: "", file: "", thumbnail: "", active: true };

export default function CatalogoPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [formData, setFormData] = useState(emptyCatalog);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchCatalogs(); }, [page]);

  const fetchCatalogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/catalogs?page=${page}`);
      const data = await res.json();
      setCatalogs(data.catalogs || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) { console.error("Error:", error); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setSelectedCatalog(null); setFormData(emptyCatalog); setModalOpen(true); };

  const openEdit = (catalog: Catalog) => {
    setSelectedCatalog(catalog);
    setFormData({ name: catalog.name, description: catalog.description || "", file: catalog.file, thumbnail: catalog.thumbnail || "", active: catalog.active });
    setModalOpen(true);
  };

  const openDelete = (catalog: Catalog) => { setSelectedCatalog(catalog); setDeleteModalOpen(true); };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("folder", "catalogs");
      const res = await fetch("/api/upload", { method: "POST", body: formDataUpload });
      const data = await res.json();
      if (data.success) setFormData({ ...formData, file: data.url });
    } catch (error) { console.error("Error:", error); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = selectedCatalog ? `/api/admin/catalogs/${selectedCatalog.id}` : "/api/admin/catalogs";
      const method = selectedCatalog ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) { setModalOpen(false); fetchCatalogs(); }
    } catch (error) { console.error("Error:", error); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selectedCatalog) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/catalogs/${selectedCatalog.id}`, { method: "DELETE" });
      if (res.ok) { setDeleteModalOpen(false); fetchCatalogs(); }
    } catch (error) { console.error("Error:", error); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-black dark:text-white">Catálogos</h1>
          <p className="text-gray-400 mt-1 text-sm">Gerencie os catálogos para download</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
          <HiOutlinePlus className="h-4 w-4" />
          Novo Catálogo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-400">Carregando...</div>
        ) : catalogs.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">Nenhum catálogo encontrado</div>
        ) : (
          catalogs.map((catalog) => (
            <div key={catalog.id} className="border border-gray-200 dark:border-zinc-800 p-6 hover:border-black dark:hover:border-white transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 w-16 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                  <HiOutlineDocumentText className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-black dark:text-white truncate">{catalog.name}</h3>
                  <p className="text-xs text-gray-400">{catalog.downloads} downloads</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{catalog.description || "-"}</p>
              <div className="flex items-center justify-between">
                <a href={catalog.file} target="_blank" className="flex items-center gap-1 text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                  <HiOutlineDownload className="h-4 w-4" /> Download
                </a>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(catalog)} className="p-2 text-gray-400 hover:text-black dark:hover:text-white"><HiOutlinePencil className="h-4 w-4" /></button>
                  <button onClick={() => openDelete(catalog)} className="p-2 text-gray-400 hover:text-red-600"><HiOutlineTrash className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 text-sm ${p === page ? "bg-black dark:bg-white text-white dark:text-black" : "border border-gray-200 dark:border-zinc-700"} transition-colors`}>{p}</button>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selectedCatalog ? "Editar Catálogo" : "Novo Catálogo"} size="lg">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Arquivo PDF *</label>
            {formData.file ? (
              <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-zinc-700">
                <HiOutlineDocumentText className="h-8 w-8 text-gray-400" />
                <span className="flex-1 text-sm text-gray-600 dark:text-gray-400 truncate">{formData.file}</span>
                <button type="button" onClick={() => setFormData({ ...formData, file: "" })} className="text-red-500 text-sm">Remover</button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full py-8 border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-gray-500 text-sm transition-colors">
                {uploading ? "Enviando..." : "Clique para enviar PDF"}
              </button>
            )}
            <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
          </div>
          <ImageUpload label="Thumbnail (opcional)" value={formData.thumbnail} onChange={(url) => setFormData({ ...formData, thumbnail: url })} folder="catalogs" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="accent-black" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Ativo</span>
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
            <button onClick={() => setModalOpen(false)} className="px-6 py-2.5 border border-gray-200 dark:border-zinc-700 text-sm font-medium">Cancelar</button>
            <button onClick={handleSave} disabled={saving || !formData.name || !formData.file} className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDelete} title="Excluir Catálogo" message={`Excluir "${selectedCatalog?.name}"?`} confirmText="Excluir" loading={saving} />
    </div>
  );
}
