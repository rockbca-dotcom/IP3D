"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiX } from "react-icons/hi";
import { HiOutlineTag, HiOutlineRectangleGroup } from "react-icons/hi2";
import { Modal, ConfirmModal } from "@/components/admin/Modal";
import { ImageUpload } from "@/components/admin/ImageUpload";
import SEOFields from "@/components/admin/SEOFields";
import SEOIndicator from "@/components/admin/SEOIndicator";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-[300px] border border-gray-200 dark:border-zinc-700 rounded-lg flex items-center justify-center text-gray-400">Carregando editor...</div>
});

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  ogImage: string | null;
  categories?: { category: Category }[];
  tags?: { tag: Tag }[];
}

interface Category { id: string; name: string; slug: string; description?: string | null; color?: string; _count?: { posts: number }; }
interface Tag { id: string; name: string; slug: string; _count?: { posts: number }; }

const emptyPost = { title: "", slug: "", excerpt: "", content: "", image: "", published: false, metaTitle: "", metaDescription: "", metaKeywords: "", ogImage: "", categoryIds: [] as string[], tagIds: [] as string[] };

function ManageModal({ open, onClose, type }: { open: boolean; onClose: () => void; type: "categories" | "tags" }) {
  const isCat = type === "categories";
  const apiUrl = isCat ? "/api/admin/blog/categories" : "/api/admin/blog/tags";
  const label = isCat ? "Categoria" : "Tag";
  const [items, setItems] = useState<(Category | Tag)[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState("#000000");
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editColor, setEditColor] = useState("#000000");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { if (open) fetchItems(); }, [open]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl);
      const data = await res.json();
      setItems(isCat ? (data.categories || []) : (data.tags || []));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const body: Record<string, string> = { name: newName };
      if (isCat) { body.description = newDesc; body.color = newColor; }
      await fetch(apiUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setNewName(""); setNewDesc(""); setNewColor("#000000"); fetchItems();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const startEdit = (item: Category | Tag) => {
    setEditingId(item.id); setEditName(item.name);
    setEditDesc((item as Category).description || "");
    setEditColor((item as Category).color || "#000000");
  };

  const handleUpdate = async () => {
    if (!editingId || !editName.trim()) return;
    setSaving(true);
    try {
      const body: Record<string, string> = { id: editingId, name: editName };
      if (isCat) { body.description = editDesc; body.color = editColor; }
      await fetch(apiUrl, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setEditingId(null); fetchItems();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    try {
      await fetch(`${apiUrl}?id=${id}`, { method: "DELETE" });
      setDeleteId(null); fetchItems();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-lg shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-black dark:text-white">{isCat ? "Gerenciar Categorias" : "Gerenciar Tags"}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-black dark:hover:text-white"><HiX className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Criar {label}</p>
          <div className="flex gap-2">
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreate()} placeholder={`Nome da ${label.toLowerCase()}...`} className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
            {isCat && <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-10 h-9 border border-gray-200 dark:border-zinc-700 cursor-pointer rounded" title="Cor" />}
            <button onClick={handleCreate} disabled={saving || !newName.trim()} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium disabled:opacity-50"><HiOutlinePlus className="w-4 h-4" /></button>
          </div>
          {isCat && <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Descrição (opcional)" className="mt-2 w-full px-3 py-2 text-sm border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
          {loading ? (
            <p className="text-center text-gray-400 text-sm py-8">Carregando...</p>
          ) : items.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Nenhuma {label.toLowerCase()} cadastrada ainda.</p>
          ) : items.map((item) => (
            <div key={item.id} className="border border-gray-100 dark:border-zinc-800 rounded">
              {editingId === item.id ? (
                <div className="p-3 space-y-2">
                  <div className="flex gap-2">
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
                    {isCat && <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="w-10 h-8 border border-gray-200 dark:border-zinc-700 cursor-pointer rounded" />}
                  </div>
                  {isCat && <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Descrição" className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />}
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs border border-gray-200 dark:border-zinc-700">Cancelar</button>
                    <button onClick={handleUpdate} disabled={saving} className="px-3 py-1.5 text-xs bg-black dark:bg-white text-white dark:text-black disabled:opacity-50">Salvar</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    {isCat && <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: (item as Category).color || "#000" }} />}
                    <div>
                      <span className="text-sm font-medium text-black dark:text-white">{item.name}</span>
                      {isCat && (item as Category).description && <p className="text-xs text-gray-400">{(item as Category).description}</p>}
                    </div>
                    <span className="text-xs text-gray-400 ml-1">({item._count?.posts || 0})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(item)} className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white"><HiOutlinePencil className="w-3.5 h-3.5" /></button>
                    {deleteId === item.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(item.id)} disabled={saving} className="px-2 py-1 text-xs bg-red-600 text-white rounded disabled:opacity-50">Confirmar</button>
                        <button onClick={() => setDeleteId(null)} className="px-2 py-1 text-xs border border-gray-200 dark:border-zinc-700 rounded">Não</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteId(item.id)} className="p-1.5 text-gray-400 hover:text-red-600"><HiOutlineTrash className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-zinc-800 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 text-sm border border-gray-200 dark:border-zinc-700 font-medium">Fechar</button>
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [manageCategoriesOpen, setManageCategoriesOpen] = useState(false);
  const [manageTagsOpen, setManageTagsOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState(emptyPost);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPosts(); }, [page]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blog?page=${page}`);
      const data = await res.json();
      setPosts(data.posts || []);
      setAllCategories(data.categories || []);
      setAllTags(data.tags || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) { console.error("Error:", error); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setSelectedPost(null); setFormData(emptyPost); setModalOpen(true); };

  const openEdit = (post: Post) => {
    setSelectedPost(post);
    setFormData({ title: post.title, slug: post.slug, excerpt: post.excerpt || "", content: post.content || "", image: post.image || "", published: post.published, metaTitle: post.metaTitle || "", metaDescription: post.metaDescription || "", metaKeywords: post.metaKeywords || "", ogImage: post.ogImage || "", categoryIds: post.categories?.map((c) => c.category.id) || [], tagIds: post.tags?.map((t) => t.tag.id) || [] });
    setModalOpen(true);
  };

  const openView = (post: Post) => { setSelectedPost(post); setViewModalOpen(true); };
  const openDelete = (post: Post) => { setSelectedPost(post); setDeleteModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = selectedPost ? `/api/admin/blog/${selectedPost.id}` : "/api/admin/blog";
      const method = selectedPost ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      if (res.ok) { setModalOpen(false); fetchPosts(); }
    } catch (error) { console.error("Error:", error); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/blog/${selectedPost.id}`, { method: "DELETE" });
      if (res.ok) { setDeleteModalOpen(false); fetchPosts(); }
    } catch (error) { console.error("Error:", error); }
    finally { setSaving(false); }
  };

  const generateSlug = (title: string) => title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const toggleId = (arr: string[], id: string) => arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-black dark:text-white">Blog</h1>
          <p className="text-gray-400 mt-1 text-sm">Gerencie os posts do blog</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setManageCategoriesOpen(true)} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-black dark:hover:border-white transition-colors">
            <HiOutlineRectangleGroup className="h-4 w-4" />
            Gerenciar Categorias
          </button>
          <button onClick={() => setManageTagsOpen(true)} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-black dark:hover:border-white transition-colors">
            <HiOutlineTag className="h-4 w-4" />
            Gerenciar Tags
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
            <HiOutlinePlus className="h-4 w-4" />
            Novo Post
          </button>
        </div>
      </div>

      <div className="border border-gray-200 dark:border-zinc-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-zinc-800">
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Post</th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Data</th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">SEO</th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Status</th>
              <th className="px-6 py-4 text-right text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Carregando...</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Nenhum post encontrado</td></tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-20 bg-gray-100 dark:bg-zinc-800 flex-shrink-0">
                        {post.image && <Image src={post.image} alt={post.title} width={80} height={48} className="object-cover h-full w-full" />}
                      </div>
                      <div>
                        <p className="font-medium text-black dark:text-white">{post.title}</p>
                        <p className="text-sm text-gray-400 line-clamp-1">{post.excerpt || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4">
                    <SEOIndicator metaTitle={post.metaTitle} metaDescription={post.metaDescription} />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-[10px] uppercase tracking-wider font-medium ${post.published ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"}`}>
                      {post.published ? "Publicado" : "Rascunho"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openView(post)} className="p-2 text-gray-400 hover:text-black dark:hover:text-white"><HiOutlineEye className="h-4 w-4" /></button>
                      <button onClick={() => openEdit(post)} className="p-2 text-gray-400 hover:text-black dark:hover:text-white"><HiOutlinePencil className="h-4 w-4" /></button>
                      <button onClick={() => openDelete(post)} className="p-2 text-gray-400 hover:text-red-600"><HiOutlineTrash className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 text-sm ${p === page ? "bg-black dark:bg-white text-white dark:text-black" : "border border-gray-200 dark:border-zinc-700"} transition-colors`}>{p}</button>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={selectedPost ? "Editar Post" : "Novo Post"} size="xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resumo</label>
            <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white outline-none resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conteúdo</label>
            <RichTextEditor 
              value={formData.content} 
              onChange={(value) => setFormData({ ...formData, content: value })} 
              placeholder="Escreva o conteúdo do post aqui..."
            />
          </div>
          <ImageUpload label="Imagem de Capa" value={formData.image} onChange={(url) => setFormData({ ...formData, image: url })} folder="blog" />

          {/* Categorias */}
          {allCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categorias</label>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((cat) => {
                  const sel = formData.categoryIds.includes(cat.id);
                  return (
                    <button key={cat.id} type="button" onClick={() => setFormData({ ...formData, categoryIds: toggleId(formData.categoryIds, cat.id) })}
                      className={`px-3 py-1.5 text-xs font-medium rounded border transition-all ${sel ? "border-transparent text-white" : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-gray-400"}`}
                      style={sel ? { backgroundColor: cat.color || "#000", borderColor: cat.color || "#000" } : {}}>
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => {
                  const sel = formData.tagIds.includes(tag.id);
                  return (
                    <button key={tag.id} type="button" onClick={() => setFormData({ ...formData, tagIds: toggleId(formData.tagIds, tag.id) })}
                      className={`px-3 py-1.5 text-xs font-medium rounded border transition-all ${sel ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 hover:border-gray-400"}`}>
                      #{tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <SEOFields
            metaTitle={formData.metaTitle}
            metaDescription={formData.metaDescription}
            metaKeywords={formData.metaKeywords}
            ogImage={formData.ogImage}
            slug={`blog/${formData.slug}`}
            onChange={(field, value) => setFormData({ ...formData, [field]: value })}
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.published} onChange={(e) => setFormData({ ...formData, published: e.target.checked })} className="accent-black" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Publicar</span>
          </label>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-zinc-800">
            <button onClick={() => setModalOpen(false)} className="px-6 py-2.5 border border-gray-200 dark:border-zinc-700 text-sm font-medium">Cancelar</button>
            <button onClick={handleSave} disabled={saving || !formData.title} className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
          </div>
        </div>
      </Modal>

      <Modal open={viewModalOpen} onClose={() => setViewModalOpen(false)} title={selectedPost?.title || "Post"} size="lg">
        {selectedPost && (
          <div className="space-y-6">
            {selectedPost.image && <div className="relative h-48 w-full bg-gray-100 dark:bg-zinc-800"><Image src={selectedPost.image} alt={selectedPost.title} fill className="object-cover" /></div>}
            <div><h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Resumo</h3><p className="text-black dark:text-white">{selectedPost.excerpt || "-"}</p></div>
            <div><h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Conteúdo</h3><div className="prose dark:prose-invert max-w-none text-black dark:text-white whitespace-pre-wrap">{selectedPost.content || "-"}</div></div>
          </div>
        )}
      </Modal>

      <ConfirmModal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDelete} title="Excluir Post" message={`Excluir "${selectedPost?.title}"?`} confirmText="Excluir" loading={saving} />

      {/* Modais de Gerenciamento */}
      <ManageModal open={manageCategoriesOpen} onClose={() => { setManageCategoriesOpen(false); fetchPosts(); }} type="categories" />
      <ManageModal open={manageTagsOpen} onClose={() => { setManageTagsOpen(false); fetchPosts(); }} type="tags" />
    </div>
  );
}
