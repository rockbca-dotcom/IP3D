"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /admin/estoque
//
// Gestão de estoque de produtos.
//
// Funcionalidades:
//  • Lista produtos com estoque atual, SKU e categoria
//  • Filtro: todos | estoque zero | estoque baixo (≤ 5)
//  • Busca por nome / SKU
//  • Ajuste manual de estoque: + ou – com motivo
//  • Histórico de movimentações por produto (últimas 50)
//  • Badges: "Sem estoque" (vermelho) e "Estoque baixo" (amarelo)
//
// Fonte de dados: /api/admin/inventory
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineMinus,
  HiOutlineClipboardList,
  HiOutlineExclamation,
  HiOutlineX,
  HiOutlineRefresh,
} from "react-icons/hi";

interface StockProduct {
  id:            string;
  name:          string;
  slug:          string;
  sku:           string | null;
  image:         string | null;
  stockQuantity: number;
  active:        boolean;
  category:      { name: string } | null;
}

interface InventoryLog {
  id:          string;
  change:      number;
  reason:      string | null;
  type:        string;
  referenceId: string | null;
  createdAt:   string;
}

interface Summary {
  zeroStock: number;
  lowStock:  number;
  threshold: number;
}

const defaultImage = "/images/products/components-placeholder.svg";

export default function EstoquePage() {
  const [products, setProducts]     = useState<StockProduct[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filter, setFilter]         = useState<"" | "zero" | "low">("");
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]           = useState(0);
  const [summary, setSummary]       = useState<Summary>({ zeroStock: 0, lowStock: 0, threshold: 5 });

  // Painel de ajuste
  const [adjustProduct, setAdjustProduct] = useState<StockProduct | null>(null);
  const [adjustDelta, setAdjustDelta]     = useState("");
  const [adjustReason, setAdjustReason]   = useState("");
  const [adjusting, setAdjusting]         = useState(false);
  const [adjustError, setAdjustError]     = useState("");

  // Painel de histórico
  const [historyProduct, setHistoryProduct] = useState<StockProduct | null>(null);
  const [logs, setLogs]                     = useState<InventoryLog[]>([]);
  const [loadingLogs, setLoadingLogs]       = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:   String(page),
        limit:  "30",
        search,
        filter,
      });
      const res  = await fetch(`/api/admin/inventory?${params}`);
      const data = await res.json();
      setProducts(data.products ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setTotal(data.pagination?.total ?? 0);
      if (data.summary) setSummary(data.summary);
    } finally {
      setLoading(false);
    }
  }, [page, search, filter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function fetchHistory(product: StockProduct) {
    setHistoryProduct(product);
    setLoadingLogs(true);
    setLogs([]);
    try {
      const res  = await fetch(`/api/admin/inventory?productId=${product.id}`);
      const data = await res.json();
      setLogs(data.logs ?? []);
    } finally {
      setLoadingLogs(false);
    }
  }

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    setAdjustError("");
    const delta = parseInt(adjustDelta, 10);
    if (!adjustProduct || isNaN(delta) || delta === 0) {
      setAdjustError("Informe um valor de ajuste diferente de zero");
      return;
    }
    setAdjusting(true);
    try {
      const res  = await fetch("/api/admin/inventory", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          productId: adjustProduct.id,
          change:    delta,
          reason:    adjustReason.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAdjustError(data.error ?? "Erro ao ajustar estoque");
        return;
      }
      setAdjustProduct(null);
      setAdjustDelta("");
      setAdjustReason("");
      fetchProducts();
    } finally {
      setAdjusting(false);
    }
  }

  function stockBadge(qty: number) {
    if (qty === 0)                       return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    if (qty <= summary.threshold)        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  }

  function stockLabel(qty: number) {
    if (qty === 0)                return "Sem estoque";
    if (qty <= summary.threshold) return "Baixo";
    return "OK";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">Estoque</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gerencie o estoque de produtos · {total} produto{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={fetchProducts}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-zinc-700 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <HiOutlineRefresh className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Summary Badges */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button
          onClick={() => { setFilter(""); setPage(1); }}
          className={`p-4 border text-left transition-colors ${
            filter === "" ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black" : "border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800"
          }`}
        >
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs mt-1 uppercase tracking-wider opacity-70">Total de produtos</p>
        </button>
        <button
          onClick={() => { setFilter("zero"); setPage(1); }}
          className={`p-4 border text-left transition-colors ${
            filter === "zero" ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300" : "border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800"
          }`}
        >
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.zeroStock}</p>
          <p className="text-xs mt-1 uppercase tracking-wider text-gray-500 dark:text-gray-400">Sem estoque</p>
        </button>
        <button
          onClick={() => { setFilter("low"); setPage(1); }}
          className={`p-4 border text-left transition-colors ${
            filter === "low" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300" : "border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800"
          }`}
        >
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.lowStock}</p>
          <p className="text-xs mt-1 uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Estoque baixo (≤ {summary.threshold})
          </p>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome ou SKU…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-black dark:text-white outline-none"
        />
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Produto</th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">SKU</th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Estoque</th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Status</th>
              <th className="px-6 py-4 text-right text-[11px] uppercase tracking-wider text-gray-500 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-zinc-800">
                  <td colSpan={5} className="px-6 py-4">
                    <div className="h-4 bg-gray-100 dark:bg-zinc-800 animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                  Nenhum produto encontrado
                </td>
              </tr>
            ) : products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex-shrink-0 bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                      <Image
                        src={product.image || defaultImage}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-black dark:text-white line-clamp-1">{product.name}</p>
                      {product.category && (
                        <p className="text-xs text-gray-400">{product.category.name}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                  {product.sku || <span className="text-gray-300 dark:text-gray-600">—</span>}
                </td>
                <td className="px-6 py-4">
                  <span className="text-lg font-bold text-black dark:text-white">{product.stockQuantity}</span>
                  <span className="text-xs text-gray-400 ml-1">un.</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-wider font-medium ${stockBadge(product.stockQuantity)}`}>
                    {product.stockQuantity === 0 && <HiOutlineExclamation className="w-3 h-3" />}
                    {stockLabel(product.stockQuantity)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setAdjustProduct(product);
                        setAdjustDelta("");
                        setAdjustReason("");
                        setAdjustError("");
                      }}
                      title="Ajustar estoque"
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <HiOutlinePlus className="w-3.5 h-3.5" />
                      Ajustar
                    </button>
                    <button
                      onClick={() => fetchHistory(product)}
                      title="Ver histórico"
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded transition-colors"
                    >
                      <HiOutlineClipboardList className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">{total} produtos</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-40">Anterior</button>
            <span className="px-3 py-1.5 text-gray-500">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-40">Próxima</button>
          </div>
        </div>
      )}

      {/* Adjust Panel (inline slide-in) */}
      {adjustProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setAdjustProduct(null)}>
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md border border-gray-200 dark:border-zinc-700 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <h3 className="font-semibold text-black dark:text-white">Ajustar Estoque</h3>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{adjustProduct.name}</p>
              </div>
              <button onClick={() => setAdjustProduct(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded">
                <HiOutlineX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAdjust} className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-zinc-800">
                <span className="text-sm text-gray-500">Estoque atual:</span>
                <span className="text-2xl font-bold text-black dark:text-white">{adjustProduct.stockQuantity} <span className="text-sm font-normal text-gray-400">un.</span></span>
              </div>

              {adjustError && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 dark:text-red-400 text-sm">
                  {adjustError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ajuste *
                  <span className="text-gray-400 font-normal ml-1">(positivo = entrada, negativo = saída)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setAdjustDelta((prev) => String((parseInt(prev) || 0) - 1))} className="px-3 py-2 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-lg font-bold">
                    <HiOutlineMinus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    required
                    value={adjustDelta}
                    onChange={(e) => setAdjustDelta(e.target.value)}
                    placeholder="Ex.: 10 ou -5"
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-center text-black dark:text-white outline-none"
                  />
                  <button type="button" onClick={() => setAdjustDelta((prev) => String((parseInt(prev) || 0) + 1))} className="px-3 py-2 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-lg font-bold">
                    <HiOutlinePlus className="w-4 h-4" />
                  </button>
                </div>
                {adjustDelta && !isNaN(parseInt(adjustDelta)) && (
                  <p className="mt-1 text-xs text-gray-500">
                    Novo estoque: <strong className={adjustProduct.stockQuantity + parseInt(adjustDelta) < 0 ? "text-red-500" : "text-green-600"}>
                      {adjustProduct.stockQuantity + parseInt(adjustDelta)} un.
                    </strong>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Motivo <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ex.: Entrada de NF 1234, Quebra, Inventário…"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-black dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setAdjustProduct(null)} className="px-5 py-2.5 text-sm border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800">Cancelar</button>
                <button type="submit" disabled={adjusting} className="px-5 py-2.5 text-sm bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 disabled:opacity-50">
                  {adjusting ? "Salvando…" : "Confirmar ajuste"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Panel */}
      {historyProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setHistoryProduct(null)}>
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg border border-gray-200 dark:border-zinc-700 shadow-xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
              <div>
                <h3 className="font-semibold text-black dark:text-white">Histórico de Estoque</h3>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{historyProduct.name}</p>
              </div>
              <button onClick={() => setHistoryProduct(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded">
                <HiOutlineX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {loadingLogs ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-zinc-800 animate-pulse rounded" />)}
                </div>
              ) : logs.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">Nenhuma movimentação registrada</p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                      <span className={`text-base font-bold mt-0.5 ${log.change > 0 ? "text-green-600" : "text-red-500"}`}>
                        {log.change > 0 ? "+" : ""}{log.change}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">
                          <span className="uppercase font-medium text-gray-600 dark:text-gray-400">{log.type}</span>
                          {log.reason && <span className="mx-1">·</span>}
                          {log.reason && <span>{log.reason}</span>}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(log.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
