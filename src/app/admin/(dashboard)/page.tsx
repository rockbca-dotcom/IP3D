"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  HiOutlineCube,
  HiOutlineEye,
  HiOutlineCursorClick,
  HiOutlineArrowRight,
  HiOutlinePlus,
  HiOutlineExclamationCircle,
  HiOutlineCurrencyDollar,
  HiOutlineClipboardList,
  HiOutlineTrendingUp,
  HiOutlineAdjustments,
} from "react-icons/hi";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  rejectedOrders: number;
  approvedRevenue: number;
  ticketAverage: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  pageViewsCount: number;
  clicksCount: number;
}

interface RecentOrder {
  id: string;
  code: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
}

interface RecentLog {
  id: string;
  change: number;
  reason: string | null;
  createdAt: string;
  product: {
    name: string;
    sku: string | null;
  };
}

interface TopProduct {
  productId: string;
  name: string;
  sku: string | null;
  quantity: number;
  total: number;
}

interface OperationalAlert {
  type: "ORDER_STOCK_ERROR" | "PRODUCT_OUT_OF_STOCK";
  message: string;
  referenceId: string;
  createdAt: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  recentInventoryLogs: RecentLog[];
  topSoldProducts: TopProduct[];
  alerts: OperationalAlert[];
}

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<"today" | "7d" | "30d" | "custom">("30d");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/admin/dashboard?period=${period}`;
      if (period === "custom") {
        if (!startDate || !endDate) {
          // Não busca se as datas customizadas ainda não foram informadas
          setLoading(false);
          return;
        }
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Erro ao carregar dados do dashboard.");
      }
      setData(json);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado ao carregar estatísticas.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [period, startDate, endDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

  // Auxiliar para formatação de moeda
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  // Renderização de Skeletons de Carregamento
  if (loading && !data) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200" />
            <div className="h-4 w-64 bg-gray-200" />
          </div>
          <div className="h-10 w-44 bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 border border-gray-200 p-6 space-y-4" />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-gray-100 border border-gray-200" />
          <div className="h-96 bg-gray-100 border border-gray-200" />
        </div>
      </div>
    );
  }

  // Renderização de Estado de Erro
  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-red-200 bg-red-50/50 rounded-lg">
        <HiOutlineExclamationCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-medium text-red-800">Falha ao Carregar Dashboard</h2>
        <p className="text-sm text-red-600 mt-2 max-w-md">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-6 px-4 py-2 border border-red-300 text-red-800 hover:bg-red-100 transition-colors text-xs font-medium uppercase tracking-wider"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const stats = data?.stats;
  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topSoldProducts || [];
  const recentLogs = data?.recentInventoryLogs || [];
  const alerts = data?.alerts || [];

  return (
    <div className="space-y-10">
      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-black tracking-tight">
            Visão Geral
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Estatísticas operacionais e comerciais baseadas em dados reais de produção.
          </p>
        </div>

        {/* Filtro de Período Dinâmico */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex border border-gray-200 rounded p-1 bg-gray-50/50">
            {(["today", "7d", "30d", "custom"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-all duration-200 ${
                  period === p
                    ? "bg-black text-white shadow-sm"
                    : "text-gray-400 hover:text-black"
                }`}
              >
                {p === "today" ? "Hoje" : p === "7d" ? "7 Dias" : p === "30d" ? "30 Dias" : "Custom"}
              </button>
            ))}
          </div>

          {period === "custom" && (
            <div className="flex items-center gap-2 border border-gray-200 p-1.5 rounded bg-white shadow-sm animate-fadeIn">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs text-gray-700 focus:outline-none border-none p-1"
                placeholder="Início"
              />
              <span className="text-gray-300 text-xs">até</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs text-gray-700 focus:outline-none border-none p-1"
                placeholder="Fim"
              />
              <button
                onClick={fetchDashboardData}
                className="px-2.5 py-1 bg-gray-900 text-white text-[10px] uppercase font-bold tracking-wider hover:bg-black rounded"
              >
                Filtrar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Exibição de Alertas Operacionais Críticos */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-red-500 font-bold">
            <HiOutlineExclamationCircle className="h-4 w-4" />
            Alertas Operacionais Pendentes ({alerts.length})
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`border p-4 flex gap-3 text-sm items-start shadow-sm transition-all duration-300 hover:translate-x-1 ${
                  alert.type === "ORDER_STOCK_ERROR"
                    ? "border-red-200 bg-red-50/40 text-red-800"
                    : "border-amber-200 bg-amber-50/40 text-amber-800"
                }`}
              >
                <div className="mt-0.5">
                  <HiOutlineExclamationCircle className="h-5 w-5 flex-shrink-0" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs uppercase tracking-wider mb-1">
                    {alert.type === "ORDER_STOCK_ERROR" ? "Falha Logística / Venda" : "Ruptura de Estoque"}
                  </p>
                  <p className="text-xs leading-relaxed opacity-90">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid de Cards de Indicadores KPIs */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {/* Card: Faturamento */}
          <div className="border border-gray-200 p-6 bg-white hover:border-black transition-all duration-300 group hover:-translate-y-1 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <HiOutlineCurrencyDollar className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">Aprovado</span>
            </div>
            <p className="text-xl font-light text-black truncate">{formatCurrency(stats.approvedRevenue)}</p>
            <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400 mt-2">Faturamento</p>
          </div>

          {/* Card: Pedidos Totais */}
          <div className="border border-gray-200 p-6 bg-white hover:border-black transition-all duration-300 group hover:-translate-y-1 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <HiOutlineClipboardList className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">Período</span>
            </div>
            <p className="text-3xl font-light text-black">{stats.totalOrders}</p>
            <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400 mt-2">Total Pedidos</p>
          </div>

          {/* Card: Ticket Médio */}
          <div className="border border-gray-200 p-6 bg-white hover:border-black transition-all duration-300 group hover:-translate-y-1 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <HiOutlineTrendingUp className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">Médio</span>
            </div>
            <p className="text-xl font-light text-black truncate">{formatCurrency(stats.ticketAverage)}</p>
            <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400 mt-2">Ticket Médio</p>
          </div>

          {/* Card: Ativos Catálogo */}
          <div className="border border-gray-200 p-6 bg-white hover:border-black transition-all duration-300 group hover:-translate-y-1 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <HiOutlineCube className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">Ativos</span>
            </div>
            <p className="text-3xl font-light text-black">{stats.activeProducts}</p>
            <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400 mt-2">Produtos</p>
          </div>

          {/* Card: Estoque Baixo */}
          <div className="border border-gray-200 p-6 bg-white hover:border-amber-500 transition-all duration-300 group hover:-translate-y-1 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <HiOutlineExclamationCircle className="h-5 w-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">Abaixo de 5</span>
            </div>
            <p className="text-3xl font-light text-black">{stats.lowStockProducts}</p>
            <p className="text-[10px] uppercase tracking-[0.1em] text-amber-500 mt-2 font-medium">Estoque Baixo</p>
          </div>

          {/* Card: Sem Estoque */}
          <div className="border border-gray-200 p-6 bg-white hover:border-red-500 transition-all duration-300 group hover:-translate-y-1 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <HiOutlineExclamationCircle className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-50 text-red-700 rounded-full">Esgotados</span>
            </div>
            <p className="text-3xl font-light text-black">{stats.outOfStockProducts}</p>
            <p className="text-[10px] uppercase tracking-[0.1em] text-red-500 mt-2 font-medium">Sem Estoque</p>
          </div>
        </div>
      )}

      {/* Grid de Tabelas e Informações Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Bloco: Vendas Recentes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-[0.15em] text-gray-400 font-bold">
              Vendas Recentes
            </h2>
            <Link
              href="/admin/vendas"
              className="text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors flex items-center gap-1 group"
            >
              Gerenciar Pedidos 
              <HiOutlineArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          
          <div className="border border-gray-200 bg-white shadow-sm overflow-hidden">
            {recentOrders.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold bg-gray-50 px-2 py-0.5 border text-gray-700">
                          {order.code}
                        </span>
                        <p className="text-xs text-black font-medium truncate">
                          {order.customerName}
                        </p>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(order.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Badge: Status operacional */}
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        order.status === "DELIVERED"
                          ? "bg-emerald-50 text-emerald-700"
                          : order.status === "CANCELLED"
                          ? "bg-red-50 text-red-700"
                          : order.status === "SHIPPED"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {order.status}
                      </span>
                      
                      <span className="text-xs font-semibold text-black min-w-[70px] text-right">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-400 text-xs">Nenhum pedido recente localizado no período.</p>
              </div>
            )}
          </div>
        </div>

        {/* Bloco: Produtos Mais Vendidos */}
        <div className="space-y-6">
          <h2 className="text-xs uppercase tracking-[0.15em] text-gray-400 font-bold">
            Produtos Mais Vendidos
          </h2>
          <div className="border border-gray-200 bg-white p-6 shadow-sm">
            {topProducts.length > 0 ? (
              <div className="space-y-5">
                {topProducts.map((prod, idx) => (
                  <div key={prod.productId} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <div className="font-semibold text-black truncate max-w-[200px]" title={prod.name}>
                        {idx + 1}. {prod.name}
                      </div>
                      <div className="text-gray-500 font-mono">
                        {prod.quantity} un.
                      </div>
                    </div>
                    {/* Linha de progresso visual */}
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full"
                        style={{
                          width: `${Math.min(100, (prod.quantity / (topProducts[0]?.quantity || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-400 text-right">
                      Total: {formatCurrency(prod.total)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-400 text-xs">Sem dados de vendas aprovadas no período.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Secundário: Logs de Estoque e Tráfego */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bloco: Histórico Recente de Estoque */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-[0.15em] text-gray-400 font-bold">
              Movimentações Recentes de Estoque
            </h2>
            <Link
              href="/admin/estoque"
              className="text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-black transition-colors flex items-center gap-1 group"
            >
              Ver Painel de Estoque
              <HiOutlineArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="border border-gray-200 bg-white shadow-sm overflow-hidden">
            {recentLogs.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentLogs.map((log) => (
                  <div key={log.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-xs text-black font-semibold truncate max-w-[400px]">
                        {log.product.name}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Motivo: {log.reason || "Manual"} • SKU: {log.product.sku || "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] text-gray-400">
                        {new Date(log.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                      <span className={`text-xs font-mono font-bold w-12 text-right ${
                        log.change > 0 ? "text-emerald-600" : "text-red-600"
                      }`}>
                        {log.change > 0 ? `+${log.change}` : log.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-400 text-xs">Nenhuma movimentação de estoque registrada.</p>
              </div>
            )}
          </div>
        </div>

        {/* Bloco: Métricas Rápidas de Tráfego e Ações */}
        <div className="space-y-6">
          <h2 className="text-xs uppercase tracking-[0.15em] text-gray-400 font-bold">
            Cliques e Visualizações (Período)
          </h2>
          
          <div className="border border-gray-200 bg-white p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 border rounded">
                  <HiOutlineEye className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-black font-semibold">Visualizações de Páginas</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Tráfego total no site</p>
                </div>
              </div>
              <span className="text-base font-semibold text-black font-mono">
                {stats?.pageViewsCount || 0}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 border rounded">
                  <HiOutlineCursorClick className="h-4 w-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-black font-semibold">Cliques e Conversões</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">CTAs e Redes Sociais</p>
                </div>
              </div>
              <span className="text-base font-semibold text-black font-mono">
                {stats?.clicksCount || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
