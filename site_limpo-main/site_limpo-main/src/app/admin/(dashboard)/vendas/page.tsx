import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/utils";
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineCurrencyDollar, HiOutlineXCircle } from "react-icons/hi";

function badgeByPaymentStatus(status: string) {
  if (status === "APPROVED") return "bg-green-100 text-green-700";
  if (status === "REJECTED") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
}

function badgeByOrderStatus(status: string) {
  if (status === "PROCESSING") return "bg-blue-100 text-blue-700";
  if (status === "DELIVERED") return "bg-green-100 text-green-700";
  if (status === "CANCELLED") return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
}

async function getSalesData() {
  const [orders, totalOrders, approvedOrders, pendingOrders, rejectedOrders, approvedRevenue] = await Promise.all([
    prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.order.count(),
    prisma.order.count({ where: { paymentStatus: "APPROVED" } }),
    prisma.order.count({ where: { paymentStatus: "PAYMENT_PENDING" } }),
    prisma.order.count({ where: { paymentStatus: "REJECTED" } }),
    prisma.order.aggregate({
      where: { paymentStatus: "APPROVED" },
      _sum: { total: true },
    }),
  ]);

  return {
    orders,
    totalOrders,
    approvedOrders,
    pendingOrders,
    rejectedOrders,
    approvedRevenue: Number(approvedRevenue._sum.total || 0),
  };
}

export default async function VendasPage() {
  const { orders, totalOrders, approvedOrders, pendingOrders, rejectedOrders, approvedRevenue } = await getSalesData();

  const stats = [
    {
      label: "Total de pedidos",
      value: totalOrders.toLocaleString("pt-BR"),
      icon: HiOutlineCurrencyDollar,
      className: "text-black",
    },
    {
      label: "Pagos",
      value: approvedOrders.toLocaleString("pt-BR"),
      icon: HiOutlineCheckCircle,
      className: "text-green-600",
    },
    {
      label: "Pendentes",
      value: pendingOrders.toLocaleString("pt-BR"),
      icon: HiOutlineClock,
      className: "text-yellow-600",
    },
    {
      label: "Nao aprovados",
      value: rejectedOrders.toLocaleString("pt-BR"),
      icon: HiOutlineXCircle,
      className: "text-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-semibold text-black dark:text-white">Vendas</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Acompanhe todas as vendas com status de pagamento, endereco de entrega e detalhes dos itens.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-center justify-between">
              <stat.icon className={`h-5 w-5 ${stat.className}`} />
              <span className="text-[11px] uppercase tracking-[0.15em] text-gray-400">{stat.label}</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        Faturamento aprovado: <strong>{formatBRL(approvedRevenue) || "R$ 0,00"}</strong>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-950">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.15em] text-gray-500">Pedido</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.15em] text-gray-500">Cliente</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.15em] text-gray-500">Pagamento</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.15em] text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.15em] text-gray-500">Valores</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.15em] text-gray-500">Entrega</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.15em] text-gray-500">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-sm text-gray-500">
                    Nenhuma venda registrada ainda.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.code}</p>
                      <p className="mt-1 text-xs text-gray-500">Itens: {order.items.length}</p>
                      <ul className="mt-2 space-y-1 text-xs text-gray-500">
                        {order.items.slice(0, 3).map((item) => (
                          <li key={item.id}>
                            {item.quantity}x {item.name}
                          </li>
                        ))}
                        {order.items.length > 3 ? <li>+{order.items.length - 3} item(ns)</li> : null}
                      </ul>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <p className="font-medium text-gray-900 dark:text-white">{order.customerName}</p>
                      <p>{order.customerEmail}</p>
                      <p>{order.customerPhone || "Sem telefone"}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeByPaymentStatus(order.paymentStatus)}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${badgeByOrderStatus(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <p>Subtotal: {formatBRL(Number(order.subtotal))}</p>
                      <p>Frete: {formatBRL(order.shippingCost ? Number(order.shippingCost) : 0)}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">Total: {formatBRL(Number(order.total))}</p>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-600 dark:text-gray-400">
                      <p>{order.shippingStreet || "Rua nao informada"}</p>
                      <p>{order.shippingNumber || "S/N"}</p>
                      <p>
                        {order.shippingCity || "Cidade"} - {order.shippingState || "UF"}
                      </p>
                      <p>{order.shippingZip || "CEP nao informado"}</p>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
