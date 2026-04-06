"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineExternalLink } from "react-icons/hi";
import { Modal, ConfirmModal } from "@/components/admin/Modal";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface Partner {
  id: string;
  name: string;
  logo: string | null;
  website: string | null;
  description: string | null;
  active: boolean;
}

const emptyPartner = { name: "", logo: "", website: "", description: "", active: true };

export default function ParceirosPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [formData, setFormData] = useState(emptyPartner);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPartners(); }, [page]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/partners?page=${page}`);
      const data = await res.json();
      setPartners(data.partners || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) { console.error("Error:", error); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setSelectedPartner(null); setFormData(emptyPartner); setModalOpen(true); };

  const openEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setFormData({ name: partner.name, logo: partner.logo || "", website: partner.website || "", description: partner.description || "", active: partner.active });
    setModalOpen(true);
  };

  const openDelete = (partner: Partner) => { setSelectedPartner(partner); setDeleteModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = selectedPartner ? `/api/admin/partners/${selectedPartner.id}` : "/api/admin/partners";
      const method = selectedPartner ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) { setModalOpen(false); fetchPartners(); }
    } catch (error) { console.error("Error:", error); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selectedPartner) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/partners/${selectedPartner.id}`, { method: "DELETE" });
      if (res.ok) { setDeleteModalOpen(false); fetchPartners(); }
    } catch (error) { console.error("Error:", error); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-black dark:text-white">Parceiros</h1>
          <p className="text-gray-400 mt-1 text-sm">Gerencie os parceiros e revendedores</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
          <HiOutlinePlus className="h-4 w-4" />
          Novo Parceiro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-400">Carregando...</div>
        ) : partners.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">Nenhum parceiro encontrado</div>
        ) : (
          partners.map((partner) => (
            <div key={partner.id} className="border border-gray-200 dark:border-zinc-800 p-6 hover:border-black dark:hover:border-white transition-colors group">
              <div className="h-20 flex items-center justify-center mb-4">
                {partner.logo ? (
                  <Image src={partner.logo} alt={partner.name} width={120} height={60} className="object-contain" />
                ) : (
                  <div className="text-2xl font-bold text-gray-300 dark:text-zinc-700">{partner.name.charAt(0)}</div>
                )}
              </div>
              <h3 className="font-medium text-black dark:text-white text-center mb-2">{partner.name}</h3>
              {partner.website && (
                <a href={partner.website} target="_blank" className="flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-black dark:hover:text-white mb-4">
                  <HiOutlineExternalLink className="h-3 w-3" /> Site
                </a>
              )}
              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(partner)} className="p-2 text-gray-400 hover:text-black dark:hover:text-white"><HiOutlinePencil className="h-4 w-4" /></button>
                <button onClick={() => openDelete(partner)} className="p-2 text-gray-400 hover:text-red-600"><HiOutlineTrash className="h-4 w-4" /></button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selectedPartner ? "Editar Parceiro" : "Novo Parceiro"} size="md">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website</label>
            <input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://" className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descrição</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none resize-none" />
          </div>
          <ImageUpload label="Logo" value={formData.logo} onChange={(url) => setFormData({ ...formData, logo: url })} folder="partners" />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="accent-black" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Ativo</span>
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
            <button onClick={() => setModalOpen(false)} className="px-6 py-2.5 border border-gray-200 dark:border-zinc-700 text-sm font-medium">Cancelar</button>
            <button onClick={handleSave} disabled={saving || !formData.name} className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
          </div>
        </div>
      </Modal>

      <ConfirmModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDelete} title="Excluir Parceiro" message={`Excluir "${selectedPartner?.name}"?`} confirmText="Excluir" loading={saving} />
    </div>
  );
}
