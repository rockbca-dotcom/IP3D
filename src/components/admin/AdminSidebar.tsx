"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  HiOutlineChartBar,
  HiOutlineCode,
  HiOutlineCog,
  HiOutlineCube,
  HiOutlineCurrencyDollar,
  HiOutlineExternalLink,
  HiOutlineMenuAlt2,
  HiOutlinePhotograph,
  HiOutlineTag,
  HiOutlineTemplate,
  HiOutlineViewBoards,
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineArchive,
} from "react-icons/hi";

const menuItems = [
  {
    section: "Principal",
    items: [{ title: "Visao Geral", href: "/admin", icon: HiOutlineViewGrid }],
  },
  {
    section: "Conteudo",
    items: [
      { title: "Paginas", href: "/admin/paginas", icon: HiOutlineTemplate },
      { title: "Banners", href: "/admin/banners", icon: HiOutlinePhotograph },
      { title: "Produtos", href: "/admin/produtos", icon: HiOutlineCube },
      { title: "Personalizados", href: "/admin/personalizados", icon: HiOutlineCube },
      { title: "Categorias", href: "/admin/categorias", icon: HiOutlineTag },
      { title: "Estoque",  href: "/admin/estoque",  icon: HiOutlineArchive },
      { title: "Cabecalho", href: "/admin/cabecalho", icon: HiOutlineMenuAlt2 },
      { title: "Rodape", href: "/admin/rodape", icon: HiOutlineViewBoards },
    ],
  },
  {
    section: "Analytics",
    items: [
      { title: "Vendas", href: "/admin/vendas", icon: HiOutlineCurrencyDollar },
      { title: "Relatorios", href: "/admin/relatorios", icon: HiOutlineChartBar },
    ],
  },
  {
    section: "Sistema",
    items: [
      { title: "Usuarios",      href: "/admin/usuarios",      icon: HiOutlineUsers },
      { title: "Scripts",       href: "/admin/scripts",       icon: HiOutlineCode },
      { title: "Configuracoes", href: "/admin/configuracoes", icon: HiOutlineCog },
    ],
  },
];

interface AdminSidebarProps {
  role?: string;
}

function filterMenuByRole(role?: string) {
  if (role === "SUPER_ADMIN") return menuItems;

  return menuItems
    .map((section) => {
      if (section.section !== "Sistema") return section;

      return {
        ...section,
        items: section.items.filter((item) => item.href !== "/admin/usuarios" && item.href !== "/admin/scripts" && item.href !== "/admin/configuracoes"),
      };
    })
    .filter((section) => section.items.length > 0);
}

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();
  const visibleMenuItems = filterMenuByRole(role);

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-none bg-black text-white outline-none lg:block">
      <div className="flex h-full flex-col border-none outline-none">
        <div className="flex h-20 items-center border-b border-white/10 px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/images/Captura_de_tela_2026-02-28_210120-removebg-preview.webp" alt="Logo" width={80} height={32} className="object-contain brightness-0 invert" />
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto border-0 px-4 py-6 outline-none [&::-webkit-scrollbar]:w-0 [scrollbar-width:none]">
          {visibleMenuItems.map((section) => (
            <div key={section.section} className="mb-6">
              <h3 className="mb-3 px-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">{section.section}</h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 ${
                          isActive ? "bg-white font-medium text-black" : "text-white/60 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-6">
          <Link
            href="/"
            target="_blank"
            className="group flex items-center justify-between text-xs text-white/40 transition-colors hover:text-white"
          >
            <span>Ver site</span>
            <HiOutlineExternalLink className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
