"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineBan,
  HiOutlineCheck,
  HiCheckCircle,
  HiXCircle,
} from "react-icons/hi";
import { Modal, ConfirmModal } from "@/components/admin/Modal";
import { ImageUpload } from "@/components/admin/ImageUpload";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CategoryCount {
  productCategories: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  color: string | null;
  icon: string | null;
  order: number;
  active: boolean;
  parentId: string | null;
  parent: Category | null;
  children: (Category & { _count?: CategoryCount })[];
  _count?: CategoryCount;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  image: string;
  color: string;
  order: string;
  active: boolean;
  parentId: string | null;
}

interface NotifState {
  type: "success" | "error";
  message: string;
}

const emptyForm: FormData = {
  name: "",
  slug: "",
  description: "",
  image: "",
  color: "",
  order: "0",
  active: true,
  parentId: null,
};

// ---------------------------------------------------------------------------
// Row sub-component
// ---------------------------------------------------------------------------

function CategoryRow({
  category,
  isChild,
  onEdit,
  onDelete,
  onToggle,
}: {
  category: Category & { _count?: CategoryCount };
  isChild: boolean;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onToggle: (c: Category) => void;
}) {
  const productCount = category._count?.productCategories ?? 0;

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
      <td className="px-6 py-4">
        <div className={`flex items-center gap-3 ${isChild ? "pl-6" : ""}`}>
          {isChild && (
            <span className="text-gray-300 dark:text-zinc-600 select-none">↳</span>
          )}
          {category.image ? (
            <div className="h-8 w-8 shrink-0 overflow-hidden bg-gray-100 dark:bg-zinc-800">
              <Image
                src={category.image}
                alt={category.name}
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
          ) : category.color ? (
            <div
              className="h-8 w-8 shrink-0 rounded"
              style={{ backgroundColor: category.color }}
            />
          ) : (
            <div className="h-8 w-8 shrink-0 bg-gray-100 dark:bg-zinc-800 rounded" />
          )}
          <div>
            <p className="font-medium text-black dark:text-white text-sm">{category.name}</p>
            <p className="text-xs text-gray-400 font-mono">{category.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
        {category.parent?.name ?? <span className="text-gray-300 dark:text-zinc-600">—</span>}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
        {productCount}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
        {category.order}
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex px-2 py-1 text-[10px] uppercase tracking-wider font-medium ${
            category.active
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400"
          }`}
        >
          {category.active ? "Ativa" : "Inativa"}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(category)}
            className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            title="Editar"
          >
            <HiOutlinePencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onToggle(category)}
            className={`p-2 transition-colors ${
              category.active
                ? "text-gray-400 hover:text-orange-500"
                : "text-gray-400 hover:text-green-500"
            }`}
            title={category.active ? "Inativar" : "Reativar"}
          >
            {category.active ? (
              <HiOutlineBan className="h-4 w-4" />
            ) : (
              <HiOutlineCheck className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Excluir"
          >
            <HiOutlineTrash className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Toggle active modal
  const [toggleModalOpen, setToggleModalOpen] = useState(false);

  // Toast notification
  const [notif, setNotif] = useState<NotifState | null>(null);

  const showSuccess = (message: string) => {
    setNotif({ type: "success", message });
    setTimeout(() => setNotif(null), 3000);
  };

  const showError = (message: string) => {
    setNotif({ type: "error", message });
    setTimeout(() => setNotif(null), 5000);
  };

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchCategories();
    });
  }, [fetchCategories]);

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const rootCategories = categories.filter((c) => !c.parentId);

  const filteredRoots = search.trim()
    ? rootCategories.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.slug.toLowerCase().includes(search.toLowerCase()) ||
          (c.children ?? []).some((ch) =>
            ch.name.toLowerCase().includes(search.toLowerCase())
          )
      )
    : rootCategories;

  // For the parent selector: exclude self and descendants when editing
  const parentOptions = categories.filter(
    (c) =>
      !c.parentId && // only root categories can be parents
      c.id !== selectedCategory?.id
  );

  // ---------------------------------------------------------------------------
  // Open handlers
  // ---------------------------------------------------------------------------

  const openCreate = () => {
    setSelectedCategory(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      image: cat.image ?? "",
      color: cat.color ?? "",
      order: String(cat.order),
      active: cat.active,
      parentId: cat.parentId,
    });
    setModalOpen(true);
  };

  const openDelete = (cat: Category) => {
    setSelectedCategory(cat);
    setDeleteModalOpen(true);
  };

  const openToggle = (cat: Category) => {
    setSelectedCategory(cat);
    setToggleModalOpen(true);
  };

  // ---------------------------------------------------------------------------
  // Action handlers
  // ---------------------------------------------------------------------------

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      const method = selectedCategory ? "PUT" : "POST";
      const url = selectedCategory
        ? `/api/admin/categories/${selectedCategory.id}`
        : "/api/admin/categories";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim() || generateSlug(formData.name.trim()),
          description: formData.description.trim() || null,
          image: formData.image || null,
          color: formData.color.trim() || null,
          order: parseInt(formData.order) || 0,
          active: formData.active,
          parentId: formData.parentId || null,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        setSelectedCategory(null);
        await fetchCategories();
        showSuccess(
          selectedCategory
            ? "Categoria atualizada com sucesso."
            : "Categoria criada com sucesso."
        );
      } else {
        const data = await res.json();
        showError(data.error || "Erro ao salvar categoria.");
      }
    } catch {
      showError("Erro de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
        method: "DELETE",
      });

      setDeleteModalOpen(false);

      if (res.ok) {
        setSelectedCategory(null);
        await fetchCategories();
        showSuccess("Categoria excluída com sucesso.");
      } else {
        const data = await res.json();
        setSelectedCategory(null);
        showError(data.error || "Erro ao excluir categoria.");
      }
    } catch {
      setDeleteModalOpen(false);
      setSelectedCategory(null);
      showError("Erro de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!selectedCategory) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedCategory.name,
          slug: selectedCategory.slug,
          description: selectedCategory.description,
          image: selectedCategory.image,
          color: selectedCategory.color,
          order: selectedCategory.order,
          active: !selectedCategory.active,
          parentId: selectedCategory.parentId,
        }),
      });

      setToggleModalOpen(false);

      if (res.ok) {
        const wasActive = selectedCategory.active;
        setSelectedCategory(null);
        await fetchCategories();
        showSuccess(wasActive ? "Categoria inativada." : "Categoria reativada.");
      } else {
        const data = await res.json();
        setSelectedCategory(null);
        showError(data.error || "Erro ao atualizar categoria.");
      }
    } catch {
      setToggleModalOpen(false);
      setSelectedCategory(null);
      showError("Erro de conexão. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-8">
      {/* Toast notification */}
      {notif && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 shadow-lg text-sm font-medium text-white transition-all ${
            notif.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {notif.type === "success" ? (
            <HiCheckCircle className="h-5 w-5 shrink-0" />
          ) : (
            <HiXCircle className="h-5 w-5 shrink-0" />
          )}
          {notif.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-black dark:text-white">
            Categorias
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Gerencie as categorias do catálogo de produtos
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Nova Categoria
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar categorias..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:border-black dark:focus:border-white outline-none transition-colors"
        />
      </div>

      {/* Summary */}
      <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
        <span>
          <strong className="text-black dark:text-white">{categories.length}</strong> categorias no total
        </span>
        <span>
          <strong className="text-black dark:text-white">
            {categories.filter((c) => c.active).length}
          </strong>{" "}
          ativas
        </span>
        <span>
          <strong className="text-black dark:text-white">
            {categories.filter((c) => !c.parentId).length}
          </strong>{" "}
          principais
        </span>
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-zinc-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-zinc-800">
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                Categoria
              </th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                Pai
              </th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                Produtos
              </th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                Ordem
              </th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                Status
              </th>
              <th className="px-6 py-4 text-right text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  Carregando...
                </td>
              </tr>
            ) : filteredRoots.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  {search ? "Nenhuma categoria encontrada" : "Nenhuma categoria cadastrada"}
                </td>
              </tr>
            ) : (
              filteredRoots.flatMap((cat) => [
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  isChild={false}
                  onEdit={openEdit}
                  onDelete={openDelete}
                  onToggle={openToggle}
                />,
                ...(cat.children ?? []).map((child) => (
                  <CategoryRow
                    key={child.id}
                    category={child}
                    isChild={true}
                    onEdit={openEdit}
                    onDelete={openDelete}
                    onToggle={openToggle}
                  />
                )),
              ])
            )}
          </tbody>
        </table>
      </div>

      {/* ── Create / Edit Modal ────────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCategory(null);
        }}
        title={selectedCategory ? "Editar Categoria" : "Nova Categoria"}
        size="lg"
      >
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: generateSlug(e.target.value),
                })
              }
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:border-black dark:focus:border-white outline-none"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slug{" "}
              <span className="font-normal text-gray-400">(usado na URL)</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:border-black dark:focus:border-white outline-none text-sm font-mono"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:border-black dark:focus:border-white outline-none resize-none text-sm"
            />
          </div>

          {/* Parent + Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoria Pai
              </label>
              <select
                value={formData.parentId ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, parentId: e.target.value || null })
                }
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:border-black dark:focus:border-white outline-none text-sm"
              >
                <option value="">Categoria principal (sem pai)</option>
                {parentOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ordem{" "}
                <span className="font-normal text-gray-400">(menor = primeiro)</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:border-black dark:focus:border-white outline-none text-sm"
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cor{" "}
              <span className="font-normal text-gray-400">(hex, ex: #3B82F6)</span>
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                placeholder="#000000"
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:border-black dark:focus:border-white outline-none text-sm font-mono"
              />
              {formData.color && /^#[0-9A-Fa-f]{6}$/.test(formData.color) && (
                <div
                  className="h-10 w-10 shrink-0 rounded border border-gray-200 dark:border-zinc-700"
                  style={{ backgroundColor: formData.color }}
                />
              )}
            </div>
          </div>

          {/* Image */}
          <ImageUpload
            label="Imagem"
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
            folder="categories"
          />

          {/* Active toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) =>
                setFormData({ ...formData, active: e.target.checked })
              }
              className="accent-black"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Ativa (visível no catálogo)
            </span>
          </label>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setSelectedCategory(null);
              }}
              className="px-6 py-2.5 border border-gray-200 dark:border-zinc-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !formData.name.trim()}
              className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm Modal ───────────────────────────────────────────── */}
      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDelete}
        title="Excluir Categoria"
        message={`Tem certeza que deseja excluir "${selectedCategory?.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        loading={saving}
        isDangerous
      />

      {/* ── Toggle Active Confirm Modal ────────────────────────────────────── */}
      <ConfirmModal
        open={toggleModalOpen}
        onClose={() => {
          setToggleModalOpen(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleToggleActive}
        title={selectedCategory?.active ? "Inativar Categoria" : "Reativar Categoria"}
        message={
          selectedCategory?.active
            ? `Inativar "${selectedCategory?.name}" irá ocultá-la do catálogo público. Você pode reativá-la a qualquer momento.`
            : `Reativar "${selectedCategory?.name}" irá torná-la visível novamente no catálogo.`
        }
        confirmText={selectedCategory?.active ? "Inativar" : "Reativar"}
        loading={saving}
        isDangerous={selectedCategory?.active}
      />
    </div>
  );
}
