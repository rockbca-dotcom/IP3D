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
  HiOutlineDocumentText,
  HiOutlineExternalLink,
  HiOutlineMenuAlt2,
  HiOutlineNewspaper,
  HiOutlinePhotograph,
  HiOutlineTag,
  HiOutlineTemplate,
  HiOutlineUserGroup,
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
      { title: "Categorias", href: "/admin/categorias", icon: HiOutlineTag },
      { title: "Estoque",  href: "/admin/estoque",  icon: HiOutlineArchive },
      { title: "Marcas", href: "/admin/marcas", icon: HiOutlineTag },
      { title: "Catalogo", href: "/admin/catalogo", icon: HiOutlineDocumentText },
      { title: "Parceiros", href: "/admin/parceiros", icon: HiOutlineUserGroup },
      { title: "Blog", href: "/admin/blog", icon: HiOutlineNewspaper },
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

export function AdminSidebar() {
  const pathname = usePathname();

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
          {menuItems.map((section) => (
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
