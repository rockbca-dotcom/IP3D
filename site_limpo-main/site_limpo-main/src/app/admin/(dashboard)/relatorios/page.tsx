"use client";

import { useState, useEffect } from "react";
import { HiOutlineEye, HiOutlineCursorClick, HiOutlineGlobe, HiOutlineDeviceMobile, HiOutlineCalendar } from "react-icons/hi";

interface PageView {
  id: string;
  path: string;
  userAgent: string | null;
  ip: string | null;
  country: string | null;
  createdAt: string;
}

interface Stats {
  totalViews: number;
  totalClicks: number;
  uniqueCountries: number;
  todayViews: number;
}

export default function RelatoriosPage() {
  const [views, setViews] = useState<PageView[]>([]);
  const [stats, setStats] = useState<Stats>({ totalViews: 0, totalClicks: 0, uniqueCountries: 0, todayViews: 0 });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");

  useEffect(() => { fetchData(); }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?range=${dateRange}`);
      const data = await res.json();
      setViews(data.views || []);
      setStats(data.stats || { totalViews: 0, totalClicks: 0, uniqueCountries: 0, todayViews: 0 });
    } catch (error) { console.error("Error:", error); }
    finally { setLoading(false); }
  };

  const statCards = [
    { label: "Total de Views", value: stats.totalViews, icon: HiOutlineEye, color: "text-blue-500" },
    { label: "Total de Cliques", value: stats.totalClicks, icon: HiOutlineCursorClick, color: "text-green-500" },
    { label: "Países Únicos", value: stats.uniqueCountries, icon: HiOutlineGlobe, color: "text-purple-500" },
    { label: "Views Hoje", value: stats.todayViews, icon: HiOutlineCalendar, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-black dark:text-white">Relatórios</h1>
          <p className="text-gray-400 mt-1 text-sm">Acompanhe as métricas do site</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white text-sm outline-none"
        >
          <option value="1d">Hoje</option>
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="90d">Últimos 90 dias</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="border border-gray-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span className="text-[11px] uppercase tracking-wider text-gray-400">{stat.label}</span>
            </div>
            <p className="text-3xl font-light text-black dark:text-white">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Views Table */}
      <div>
        <h2 className="text-sm uppercase tracking-[0.15em] text-gray-400 font-medium mb-6">Acessos Recentes</h2>
        <div className="border border-gray-200 dark:border-zinc-800">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-zinc-800">
                <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Página</th>
                <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">País</th>
                <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Dispositivo</th>
                <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">Carregando...</td></tr>
              ) : views.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">Nenhum acesso registrado</td></tr>
              ) : (
                views.map((view) => (
                  <tr key={view.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm text-black dark:text-white">{view.path}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{view.country || "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <HiOutlineDeviceMobile className="h-4 w-4" />
                        <span className="truncate max-w-[200px]">{view.userAgent?.split(" ")[0] || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(view.createdAt).toLocaleString("pt-BR")}
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
