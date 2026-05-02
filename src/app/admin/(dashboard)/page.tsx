import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  HiOutlineCube,
  HiOutlineTag,
  HiOutlineEye,
  HiOutlineCursorClick,
  HiOutlineNewspaper,
  HiOutlineUserGroup,
  HiOutlineArrowRight,
  HiOutlinePlus,
} from "react-icons/hi";
interface PageViewItem {
  id: string;
  path: string;
  country: string | null;
  createdAt: Date;
}

async function getStats() {
  const [
    productsCount,
    brandsCount,
    partnersCount,
    blogPostsCount,
    pageViewsCount,
    clicksCount,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.brand.count(),
    prisma.partner.count(),
    prisma.blogPost.count(),
    prisma.pageView.count(),
    prisma.click.count(),
  ]);

  return {
    productsCount,
    brandsCount,
    partnersCount,
    blogPostsCount,
    pageViewsCount,
    clicksCount,
  };
}

async function getRecentPageViews() {
  return prisma.pageView.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminDashboardPage() {
  const stats = await getStats();
  const recentViews = await getRecentPageViews();

  const statCards = [
    {
      title: "Produtos",
      value: stats.productsCount,
      icon: HiOutlineCube,
      href: "/admin/produtos",
    },
    {
      title: "Marcas",
      value: stats.brandsCount,
      icon: HiOutlineTag,
      href: "/admin/marcas",
    },
    {
      title: "Parceiros",
      value: stats.partnersCount,
      icon: HiOutlineUserGroup,
      href: "/admin/parceiros",
    },
    {
      title: "Blog",
      value: stats.blogPostsCount,
      icon: HiOutlineNewspaper,
      href: "/admin/blog",
    },
    {
      title: "Views",
      value: stats.pageViewsCount,
      icon: HiOutlineEye,
      href: "/admin/relatorios",
    },
    {
      title: "Cliques",
      value: stats.clicksCount,
      icon: HiOutlineCursorClick,
      href: "/admin/relatorios",
    },
  ];

  const quickActions = [
    { title: "Novo Produto", href: "/admin/produtos/novo", icon: HiOutlineCube },
    { title: "Nova Marca", href: "/admin/marcas/novo", icon: HiOutlineTag },
    { title: "Novo Post", href: "/admin/blog/novo", icon: HiOutlineNewspaper },
    { title: "Novo Parceiro", href: "/admin/parceiros/novo", icon: HiOutlineUserGroup },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-semibold text-black">
          Visão Geral
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Bem-vindo ao painel administrativo
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="group"
          >
            <div className="border border-gray-200 p-6 hover:border-black transition-colors duration-300">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
                <HiOutlineArrowRight className="h-4 w-4 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-3xl font-light text-black">{stat.value}</p>
              <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 mt-1">
                {stat.title}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm uppercase tracking-[0.15em] text-gray-400 font-medium">
              Acessos Recentes
            </h2>
            <Link
              href="/admin/relatorios"
              className="text-xs text-gray-400 hover:text-black transition-colors"
            >
              Ver todos →
            </Link>
          </div>
          <div className="border border-gray-200">
            {recentViews.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentViews.map((view: PageViewItem) => (
                  <div
                    key={view.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-black truncate">
                        {view.path}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {new Date(view.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    {view.country && (
                      <span className="text-xs text-gray-400 ml-4">{view.country}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-400 text-sm">Nenhum acesso registrado</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm uppercase tracking-[0.15em] text-gray-400 font-medium mb-6">
            Ações Rápidas
          </h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="flex items-center gap-4 p-4 border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all duration-300 group"
              >
                <div className="h-10 w-10 border border-gray-200 group-hover:border-white/20 flex items-center justify-center transition-colors">
                  <HiOutlinePlus className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{action.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
