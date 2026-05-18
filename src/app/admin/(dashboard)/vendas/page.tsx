"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /admin/vendas
//
// Painel Administrativo de Vendas e Pedidos (Client Component).
//
// Funcionalidades:
//  • Listagem de pedidos paginada, ordenada e filtrada por status e pagamento
//  • Busca dinâmica por nome, e-mail do cliente ou código do pedido
//  • Painel (Modal) detalhado exibindo itens, dados do cliente, endereço, frete e totais
//  • Controle de transição operacional de status (PENDING -> PROCESSING -> SHIPPED -> DELIVERED, ou CANCELLED)
//  • RBAC: Bloqueio do papel EDITOR; Permissão operacional para ADMIN;
//    Ações de alteração manual de paymentStatus reservadas exclusivamente para SUPER_ADMIN.
//
// Fonte de dados: /api/admin/orders e /api/admin/orders/[id]
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineEye,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineTrendingUp,
  HiOutlineExclamation,
  HiOutlineShieldExclamation,
  HiOutlineRefresh,
} from "react-icons/hi";
import { formatBRL } from "@/lib/utils";

// Tipos oficiais baseados no Prisma Schema
interface OrderItem {
  id:        string;
  name:      string;
  sku:       string | null;
  quantity:  number;
  unitPrice: number;
  total:     number;
}

interface Order {
  id:             string;
  code:           string;
  customerName:   string;
  customerEmail:  string;
  customerPhone:  string | null;
  document:       string | null;
  shippingStreet: string | null;
  shippingNumber: string | null;
  shippingCity:   string | null;
  shippingState:  string | null;
  shippingZip:    string | null;
  notes:          string | null;
  status:         "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus:  "PAYMENT_PENDING" | "APPROVED" | "REJECTED" | "REFUNDED" | "CHARGEBACK";
  subtotal:       number;
  shippingCost:   number | null;
  discount:       number | null;
  total:          number;
  paymentProvider: string | null;
  createdAt:      string;
  updatedAt:      string;
  items:          OrderItem[];
}

interface CurrentSession {
  userId: string;
  email:  string;
  name?:  string;
  role:   string;
}

interface NotifState {
  type:    "error" | "success";
  message: string;
}

export default function VendasPage() {
  // ── States de Dados ────────────────────────────────────────────────────────
  const [orders, setOrders]             = useState<Order[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [total, setTotal]               = useState(0);

  // Stats superiores
  const [stats, setStats] = useState({
    totalOrders: 0,
    approvedOrders: 0,
    pendingOrders: 0,
    rejectedOrders: 0,
    approvedRevenue: 0,
  });

  // ── Session & RBAC ────────────────────────────────────────────────────────
  const [session, setSession]           = useState<CurrentSession | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // ── Modais e Controles ──────────────────────────────────────────────────────
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating]           = useState(false);
  const [notif, setNotif]                 = useState<NotifState | null>(null);

  function showActionSuccess(msg: string) { setNotif({ type: "success", message: msg }); }
  function showActionError(msg: string)   { setNotif({ type: "error", message: msg }); }

  // ── Busca sessão ao montar ──────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: CurrentSession & { error?: string }) => {
        if (data.error) return;
        setSession(data);
        if (data.role === "EDITOR") {
          setAccessDenied(true);
        }
      })
      .catch(() => {});
  }, []);

  // ── Busca estatísticas gerais e dados de vendas ─────────────────────────────
  const fetchOrdersAndStats = useCallback(async () => {
    if (accessDenied) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page:          String(page),
        limit:         "20",
        search:        search,
        status:        statusFilter,
        paymentStatus: paymentFilter,
      });

      const res = await fetch(`/api/admin/orders?${params}`);
      if (res.status === 401 || res.status === 403) {
        setAccessDenied(true);
        setOrders([]);
        return;
      }
      if (!res.ok) {
        throw new Error("Erro ao carregar dados do servidor");
      }
      
      const data = await res.json();
      setOrders(data.orders ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setTotal(data.pagination?.total ?? 0);

      // Busca dados consolidados de estatísticas de vendas apenas uma vez
      const statsRes = await fetch("/api/admin/orders?limit=1000");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const allOrders: Order[] = statsData.orders ?? [];
        
        let approved = 0;
        let pending = 0;
        let rejected = 0;
        let revenue = 0;

        allOrders.forEach((o) => {
          if (o.paymentStatus === "APPROVED") {
            approved++;
            revenue += Number(o.total);
          } else if (o.paymentStatus === "PAYMENT_PENDING") {
            pending++;
          } else if (o.paymentStatus === "REJECTED") {
            rejected++;
          }
        });

        setStats({
          totalOrders: allOrders.length,
          approvedOrders: approved,
          pendingOrders: pending,
          rejectedOrders: rejected,
          approvedRevenue: revenue,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido ao carregar pedidos.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, paymentFilter, accessDenied]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchOrdersAndStats();
    });
  }, [fetchOrdersAndStats]);

  // ── Transições de Status de Pedido ──────────────────────────────────────────
  async function handleStatusTransition(orderId: string, newStatus: string) {
    setNotif(null);
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        showActionError(data.error?.message ?? data.error ?? "Erro ao alterar status do pedido.");
        return;
      }

      showActionSuccess(`Status do pedido atualizado com sucesso para ${newStatus}.`);
      
      // Atualiza o pedido selecionado no modal se estiver aberto
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(data.order);
      }
      
      fetchOrdersAndStats();
    } catch {
      showActionError("Erro de comunicação com o servidor.");
    } finally {
      setUpdating(false);
    }
  }

  // ── Alteração Manual de PaymentStatus (SUPER_ADMIN ONLY) ───────────────────
  async function handlePaymentStatusUpdate(orderId: string, newPaymentStatus: string) {
    setNotif(null);
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: newPaymentStatus }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        showActionError(data.error?.message ?? data.error ?? "Erro ao alterar status de pagamento.");
        return;
      }

      showActionSuccess(`Status de pagamento atualizado com sucesso para ${newPaymentStatus}.`);
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(data.order);
      }
      
      fetchOrdersAndStats();
    } catch {
      showActionError("Erro de comunicação com o servidor.");
    } finally {
      setUpdating(false);
    }
  }

  // Badges e Helpers de Visualização
  function badgeByPaymentStatus(status: string) {
    if (status === "APPROVED") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (status === "REJECTED") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (status === "REFUNDED") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    if (status === "CHARGEBACK") return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
  }

  function badgeByOrderStatus(status: string) {
    if (status === "PROCESSING") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    if (status === "SHIPPED") return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
    if (status === "DELIVERED") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (status === "CANCELLED") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    return "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-400";
  }

  // ── Access Denied (EDITOR) ──────────────────────────────────────────────────
  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <HiOutlineShieldExclamation className="w-14 h-14 text-gray-300 dark:text-zinc-600" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Acesso Restrito</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          A visualização e gestão de vendas é restrita a **Administradores**.
          Entre em contato com o suporte para obter privilégios adicionais.
        </p>
      </div>
    );
  }

  const isSuperAdminUser = session?.role === "SUPER_ADMIN";

  return (
    <div className="space-y-6">
      
      {/* Inline Feedback Alerts */}
      {notif && (
        <div
          className={`flex items-start justify-between gap-4 px-4 py-3 text-sm border transition-all ${
            notif.type === "error"
              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
              : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
          }`}
        >
          <span>{notif.message}</span>
          <button onClick={() => setNotif(null)} className="shrink-0 hover:opacity-70">
            <HiOutlineX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white font-serif">Vendas</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Acompanhe pedidos, filtre transações e gerencie fluxos de entrega de forma centralizada.
          </p>
        </div>
        <button
          onClick={fetchOrdersAndStats}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-zinc-700 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <HiOutlineRefresh className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Quick Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <HiOutlineTrendingUp className="h-5 w-5 text-gray-400" />
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Pedidos</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <HiOutlineCheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Aprovados</span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approvedOrders}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <HiOutlineClock className="h-5 w-5 text-yellow-500" />
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingOrders}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <HiOutlineXCircle className="h-5 w-5 text-red-500" />
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Rejeitados</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejectedOrders}</p>
        </div>
      </div>

      {/* Revenue bar */}
      <div className="rounded-xl border border-green-200 bg-green-50/50 p-4 text-sm text-green-800 dark:border-green-900/30 dark:bg-green-950/20 dark:text-green-400 shadow-sm flex justify-between items-center">
        <span>Faturamento total aprovado:</span>
        <strong className="text-lg font-bold">{formatBRL(stats.approvedRevenue)}</strong>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código, nome ou e-mail do cliente…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-sm text-black dark:text-white outline-none focus:border-black dark:focus:border-white transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-sm text-black dark:text-white outline-none"
        >
          <option value="">Todos os status operacionais</option>
          <option value="PENDING">Pendente (PENDING)</option>
          <option value="PROCESSING">Em Processamento (PROCESSING)</option>
          <option value="SHIPPED">Enviado (SHIPPED)</option>
          <option value="DELIVERED">Entregue (DELIVERED)</option>
          <option value="CANCELLED">Cancelado (CANCELLED)</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-850 text-sm text-black dark:text-white outline-none"
        >
          <option value="">Todos os status de pagamento</option>
          <option value="PAYMENT_PENDING">Aguardando Pagamento</option>
          <option value="APPROVED">Pago (APPROVED)</option>
          <option value="REJECTED">Recusado (REJECTED)</option>
          <option value="REFUNDED">Reembolsado (REFUNDED)</option>
          <option value="CHARGEBACK">Contestação (CHARGEBACK)</option>
        </select>
      </div>

      {/* Table view */}
      <div className="border border-gray-200 dark:border-zinc-800 overflow-x-auto rounded-xl bg-white dark:bg-zinc-900 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Pedido</th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Cliente</th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Status de Pagamento</th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Status do Pedido</th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Total</th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Data</th>
              <th className="px-6 py-4 text-right text-[11px] uppercase tracking-wider text-gray-500 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-zinc-800">
                  <td colSpan={7} className="px-6 py-5">
                    <div className="h-4 bg-gray-100 dark:bg-zinc-805 animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-red-500 font-medium text-sm">
                  {error}
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-gray-400 text-sm">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 dark:hover:bg-zinc-850/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="font-semibold text-black dark:text-white font-mono">{order.code}</span>
                    <p className="text-[11px] text-gray-400 mt-0.5">{order.items.length} item(ns)</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-black dark:text-white">{order.customerName}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{order.customerEmail}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeByPaymentStatus(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeByOrderStatus(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-black dark:text-white">
                    {formatBRL(Number(order.total))}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors font-medium text-gray-700 dark:text-gray-300"
                    >
                      <HiOutlineEye className="w-3.5 h-3.5" />
                      Visualizar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">{total} pedido(s) no total</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="px-3 py-1.5 text-gray-500">{page} / {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Order Details Panel (Modal overlay) */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 w-full max-w-2xl border border-gray-200 dark:border-zinc-800 shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800 flex-shrink-0">
              <div>
                <h3 className="font-bold text-lg text-black dark:text-white font-mono">Pedido: {selectedOrder.code}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Registrado em {new Date(selectedOrder.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 hover:bg-gray-150 dark:hover:bg-zinc-800 rounded transition-colors"
              >
                <HiOutlineX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              
              {/* Status and Actions Block */}
              <div className="p-4 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 space-y-4">
                <div className="flex flex-wrap gap-4 justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">Status Operacional</span>
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold uppercase tracking-wider mt-1 ${badgeByOrderStatus(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">Status Financeiro</span>
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold uppercase tracking-wider mt-1 ${badgeByPaymentStatus(selectedOrder.paymentStatus)}`}>
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Transition Action Buttons */}
                <div className="border-t border-gray-200 dark:border-zinc-850 pt-3">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block mb-2">Ações Disponíveis</span>
                  <div className="flex flex-wrap gap-2">
                    
                    {/* Operational state flow triggers */}
                    {selectedOrder.status === "PENDING" && (
                      <>
                        <button
                          disabled={updating}
                          onClick={() => handleStatusTransition(selectedOrder.id, "PROCESSING")}
                          className="px-3 py-1.5 text-xs bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 transition-colors font-medium"
                        >
                          Preparar Envio
                        </button>
                        <button
                          disabled={updating}
                          onClick={() => handleStatusTransition(selectedOrder.id, "CANCELLED")}
                          className="px-3 py-1.5 text-xs border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 dark:border-red-900/30 transition-colors font-medium"
                        >
                          Cancelar Pedido
                        </button>
                      </>
                    )}

                    {selectedOrder.status === "PROCESSING" && (
                      <>
                        <button
                          disabled={updating}
                          onClick={() => handleStatusTransition(selectedOrder.id, "SHIPPED")}
                          className="px-3 py-1.5 text-xs bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 transition-colors font-medium"
                        >
                          Marcar como Enviado
                        </button>
                        <button
                          disabled={updating}
                          onClick={() => handleStatusTransition(selectedOrder.id, "CANCELLED")}
                          className="px-3 py-1.5 text-xs border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 dark:border-red-900/30 transition-colors font-medium"
                        >
                          Cancelar Pedido
                        </button>
                      </>
                    )}

                    {selectedOrder.status === "SHIPPED" && (
                      <button
                        disabled={updating}
                        onClick={() => handleStatusTransition(selectedOrder.id, "DELIVERED")}
                        className="px-3 py-1.5 text-xs bg-green-600 text-white hover:bg-green-700 transition-colors font-medium"
                      >
                        Marcar como Entregue
                      </button>
                    )}

                    {selectedOrder.status === "DELIVERED" && (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1 py-1">
                        <HiOutlineCheckCircle className="w-4 h-4" /> Este pedido já foi entregue e finalizado.
                      </span>
                    )}

                    {selectedOrder.status === "CANCELLED" && (
                      <span className="text-xs text-red-500 font-medium flex items-center gap-1 py-1">
                        <HiOutlineXCircle className="w-4 h-4" /> Este pedido foi cancelado e finalizado.
                      </span>
                    )}
                  </div>
                </div>

                {/* SUPER_ADMIN critical billing edits */}
                {isSuperAdminUser && (
                  <div className="border-t border-gray-200 dark:border-zinc-850 pt-3">
                    <label className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold block mb-2">
                      Ação Crítica (Super Admin Only): Ajustar Pagamento Manual
                    </label>
                    <select
                      value={selectedOrder.paymentStatus}
                      disabled={updating}
                      onChange={(e) => handlePaymentStatusUpdate(selectedOrder.id, e.target.value)}
                      className="px-3 py-1.5 border border-purple-200 bg-white text-purple-800 dark:border-purple-900/30 dark:bg-zinc-900 dark:text-purple-400 text-xs font-semibold outline-none"
                    >
                      <option value="PAYMENT_PENDING">Aguardando Pagamento</option>
                      <option value="APPROVED">Aprovado (APPROVED)</option>
                      <option value="REJECTED">Recusado (REJECTED)</option>
                      <option value="REFUNDED">Reembolsado (REFUNDED)</option>
                      <option value="CHARGEBACK">Chargeback (CHARGEBACK)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Grid Client / Shipping info */}
              <div className="grid gap-6 md:grid-cols-2">
                
                {/* Customer Section */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Cliente</h4>
                  <div className="text-sm space-y-1">
                    <p className="font-semibold text-black dark:text-white">{selectedOrder.customerName}</p>
                    <p className="text-gray-600 dark:text-gray-400">{selectedOrder.customerEmail}</p>
                    <p className="text-gray-600 dark:text-gray-400">{selectedOrder.customerPhone || "Sem telefone cadastrado"}</p>
                    {selectedOrder.document && (
                      <p className="text-gray-500 text-xs font-mono">CPF/CNPJ: {selectedOrder.document}</p>
                    )}
                  </div>
                </div>

                {/* Delivery Section */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Entrega & Frete</h4>
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-black dark:text-white">
                      {selectedOrder.shippingStreet || "Rua não informada"}, {selectedOrder.shippingNumber || "S/N"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedOrder.shippingCity || "Cidade"} - {selectedOrder.shippingState || "UF"}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 font-mono text-xs">CEP: {selectedOrder.shippingZip || "—"}</p>
                    {selectedOrder.paymentProvider && (
                      <p className="text-gray-400 text-xs mt-1 uppercase">Provedor: {selectedOrder.paymentProvider}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Itens Adquiridos</h4>
                <div className="border border-gray-100 dark:border-zinc-800 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-zinc-950 border-b border-gray-100 dark:border-zinc-800 font-semibold text-gray-500">
                        <th className="px-4 py-2.5">Nome</th>
                        <th className="px-4 py-2.5 text-center">Quant.</th>
                        <th className="px-4 py-2.5 text-right">Preço Un.</th>
                        <th className="px-4 py-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id} className="text-gray-700 dark:text-gray-300">
                          <td className="px-4 py-3">
                            <span className="font-semibold text-black dark:text-white">{item.name}</span>
                            {item.sku && <span className="block text-[10px] text-gray-400 font-mono mt-0.5">SKU: {item.sku}</span>}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-black dark:text-white">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatBRL(Number(item.unitPrice))}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-black dark:text-white">
                            {formatBRL(Number(item.total))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Notes (if present) */}
              {selectedOrder.notes && (
                <div className="space-y-1 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-900/30 text-xs text-yellow-800 dark:text-yellow-400">
                  <span className="font-bold uppercase tracking-wider block text-[10px]">Notas de Observação</span>
                  <p>{selectedOrder.notes}</p>
                </div>
              )}

              {/* Total Balance Sheet */}
              <div className="border-t border-gray-100 dark:border-zinc-850 pt-4 flex flex-col items-end gap-1.5 text-sm">
                <div className="flex gap-16 justify-between w-64">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{formatBRL(Number(selectedOrder.subtotal))}</span>
                </div>
                <div className="flex gap-16 justify-between w-64">
                  <span className="text-gray-500">Frete:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{formatBRL(selectedOrder.shippingCost ? Number(selectedOrder.shippingCost) : 0)}</span>
                </div>
                {selectedOrder.discount && Number(selectedOrder.discount) > 0 && (
                  <div className="flex gap-16 justify-between w-64 text-red-500">
                    <span>Desconto:</span>
                    <span>-{formatBRL(Number(selectedOrder.discount))}</span>
                  </div>
                )}
                <div className="flex gap-16 justify-between w-64 border-t border-gray-100 dark:border-zinc-850 pt-2 text-base font-bold text-black dark:text-white">
                  <span>Total Geral:</span>
                  <span>{formatBRL(Number(selectedOrder.total))}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-100 dark:border-zinc-800 flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 text-sm border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 font-medium transition-colors"
              >
                Fechar Painel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
