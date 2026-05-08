"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineExternalLink,
  HiOutlineTemplate,
  HiOutlineColorSwatch,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";

interface Page {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  published: boolean;
  isSystem: boolean;
  createdAt: string;
  _count: {
    blocks: number;
  };
}

export default function PaginasPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPage, setNewPage] = useState({ name: "", slug: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  async function fetchPages() {
    try {
      const res = await fetch("/api/admin/pages");
      const data = await res.json();
      setPages(data.pages || []);
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPage.name || !newPage.slug) return;

    setCreating(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPage),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewPage({ name: "", slug: "" });
        fetchPages();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao criar página");
      }
    } catch (error) {
      console.error("Error creating page:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta página?")) return;

    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPages();
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao excluir página");
      }
    } catch (error) {
      console.error("Error deleting page:", error);
    }
  };

  const handleTogglePublish = async (page: Page) => {
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !page.published }),
      });
      if (res.ok) {
        fetchPages();
      }
    } catch (error) {
      console.error("Error toggling publish:", error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const getPageHref = (page: Page) => {
    if (page.isSystem) {
      return page.slug === "home" ? "/" : `/${page.slug}`;
    }
    return `/p/${page.slug}`;
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Páginas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gerencie as páginas do site com blocos editáveis
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <HiOutlinePlus className="w-4 h-4 mr-2" />
          Nova Página
        </Button>
      </div>

      {/* Pages List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {pages.length === 0 ? (
          <div className="p-12 text-center">
            <HiOutlineTemplate className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhuma página criada
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Crie sua primeira página para começar a editar o conteúdo do site
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <HiOutlinePlus className="w-4 h-4 mr-2" />
              Criar Primeira Página
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Página
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Blocos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {pages.map((page) => (
                <motion.tr
                  key={page.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <HiOutlineTemplate className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {page.name}
                        </div>
                        {page.isSystem && (
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            Página do sistema
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {page.isSystem
                        ? (page.slug === "home" ? "/" : `/${page.slug}`)
                        : `/p/${page.slug}`}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {page._count.blocks} blocos
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        page.published
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {page.published ? "Publicada" : "Rascunho"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/editor/${page.id}`}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Editor Visual"
                      >
                        <HiOutlineColorSwatch className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/paginas/${page.id}`}
                        className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                        title="Editar"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleTogglePublish(page)}
                        className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                        title={page.published ? "Despublicar" : "Publicar"}
                      >
                        {page.published ? (
                          <HiOutlineEyeOff className="w-4 h-4" />
                        ) : (
                          <HiOutlineEye className="w-4 h-4" />
                        )}
                      </button>
                      <a
                        href={getPageHref(page)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                        title="Ver página"
                      >
                        <HiOutlineExternalLink className="w-4 h-4" />
                      </a>
                      {!page.isSystem && (
                        <button
                          onClick={() => handleDelete(page.id)}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                          title="Excluir"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Nova Página
              </h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome da Página *
                </label>
                <input
                  type="text"
                  value={newPage.name}
                  onChange={(e) => {
                    setNewPage({
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                  placeholder="Ex: Sobre Nós"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug (URL) *
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 dark:text-gray-400 mr-1">/p/</span>
                  <input
                    type="text"
                    value={newPage.slug}
                    onChange={(e) =>
                      setNewPage({ ...newPage, slug: generateSlug(e.target.value) })
                    }
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                    placeholder="sobre-nos"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={creating} className="flex-1">
                  {creating ? "Criando..." : "Criar Página"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
