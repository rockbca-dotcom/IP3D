"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlineSave,
  HiOutlineEye,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import SEOFields from "@/components/admin/SEOFields";

interface Page {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  description: string | null;
  published: boolean;
  isSystem: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
}

export default function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPage();
  }, [id]);

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/admin/pages/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPage(data.page);
      } else {
        router.push("/admin/paginas");
      }
    } catch (error) {
      console.error("Error fetching page:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!page) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: page.name,
          slug: page.slug,
          title: page.title,
          description: page.description,
          published: page.published,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          metaKeywords: page.metaKeywords,
          ogImage: page.ogImage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPage(data.page);
        alert("Página salva com sucesso!");
      } else {
        const data = await res.json();
        alert(data.error || "Erro ao salvar página");
      }
    } catch (error) {
      console.error("Error saving page:", error);
      alert("Erro ao salvar página");
    } finally {
      setSaving(false);
    }
  };

  const getPageHref = (target: Pick<Page, "slug" | "isSystem">) => {
    if (target.isSystem) {
      return target.slug === "home" ? "/" : `/${target.slug}`;
    }
    return `/p/${target.slug}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Página não encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/paginas"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {page.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getPageHref(page)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={getPageHref(page)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg transition-colors"
          >
            <HiOutlineEye className="w-4 h-4" />
            Visualizar
          </a>
          <Button onClick={handleSave} disabled={saving}>
            <HiOutlineSave className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Page Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Configurações da Página
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={page.name}
              onChange={(e) => setPage({ ...page, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slug (URL)
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400 mr-1">
                {page.isSystem ? "/" : "/p/"}
              </span>
              <input
                type="text"
                value={page.slug}
                onChange={(e) => setPage({ ...page, slug: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={page.published ? "published" : "draft"}
              onChange={(e) => setPage({ ...page, published: e.target.value === "published" })}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicada</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <SEOFields
            metaTitle={page.metaTitle || ""}
            metaDescription={page.metaDescription || ""}
            metaKeywords={page.metaKeywords || ""}
            ogImage={page.ogImage || ""}
            slug={page.slug}
            onChange={(field, value) => setPage({ ...page, [field]: value })}
          />
        </div>
      </div>

    </div>
  );
}
