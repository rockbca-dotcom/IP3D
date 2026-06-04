"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  HiOutlineMenu,
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineGlobe,
  HiX,
  HiOutlineCheck,
} from "react-icons/hi";

const menuItems = [
  { title: "Visão Geral", href: "/admin" },
  { title: "Produtos", href: "/admin/produtos" },
  { title: "Relatórios", href: "/admin/relatorios" },
  { title: "Configurações", href: "/admin/configuracoes", superAdminOnly: true },
] as const;

interface AdminTopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  role?: string;
}

// Micro-componente: Notificações
function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const notifications = [
    { id: 1, title: "Novo pedido recebido", time: "2 min atrás", read: false },
    { id: 2, title: "Produto atualizado", time: "1 hora atrás", read: true },
    { id: 3, title: "Nova mensagem", time: "3 horas atrás", read: true },
  ];
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 hover:text-black transition-colors"
      >
        <HiOutlineBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-black" />
        )}
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 shadow-xl z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-black">Notificações</h3>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? "bg-gray-50" : ""
                  }`}
                >
                  <p className="text-sm text-gray-900">{notification.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                </div>
              ))}
            </div>
            <Link
              href="/admin/notificacoes"
              className="block px-4 py-3 text-xs text-center text-gray-500 hover:text-black transition-colors"
              onClick={() => setOpen(false)}
            >
              Ver todas
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

// Micro-componente: Seletor de Idioma
function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState("pt");
  const languages = [
    { code: "pt", name: "Português", flag: "🇧🇷" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-500 hover:text-black transition-colors"
      >
        <HiOutlineGlobe className="h-5 w-5" />
      </button>
      
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-xl z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setCurrentLang(lang.code);
                  setOpen(false);
                }}
                className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
                {currentLang === lang.code && (
                  <HiOutlineCheck className="h-4 w-4 text-black" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Micro-componente: Toggle Dark/Light Mode
function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem("admin-theme") === "dark");

  const toggle = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("admin-theme", newTheme ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newTheme);
  };

  return (
    <button
      onClick={toggle}
      className="p-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
      title={isDark ? "Modo claro" : "Modo escuro"}
    >
      {isDark ? (
        <HiOutlineSun className="h-5 w-5" />
      ) : (
        <HiOutlineMoon className="h-5 w-5" />
      )}
    </button>
  );
}

// Micro-componente: Menu do Perfil
function ProfileDropdown({ user, onLogout }: { user: AdminTopbarProps["user"]; onLogout: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 py-1.5 px-2 hover:bg-gray-100 transition-colors"
      >
        <div className="h-8 w-8 bg-black text-white flex items-center justify-center text-sm font-medium">
          {user.name?.charAt(0).toUpperCase() || "A"}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-black">
            {user.name || "Admin"}
          </p>
          <p className="text-[11px] text-gray-400">{user.email}</p>
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-xl z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-black">{user.name || "Admin"}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <div className="py-1">
              <Link
                href="/admin/perfil"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(false)}
              >
                <HiOutlineUser className="h-4 w-4" />
                Meu Perfil
              </Link>
              <Link
                href="/admin/configuracoes"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setOpen(false)}
              >
                <HiOutlineCog className="h-4 w-4" />
                Configurações
              </Link>
            </div>
            <div className="border-t border-gray-100 py-1">
              <button
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
              >
                <HiOutlineLogout className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function AdminTopbar({ user, role }: AdminTopbarProps) {
  const router = useRouter();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const visibleMenuItems = menuItems.filter((item) => !item.superAdminOnly || role === "SUPER_ADMIN");

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-20 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex h-full items-center justify-between px-8">
          {/* Left side - Mobile menu + Breadcrumb */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
            >
              <HiOutlineMenu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <p className="text-[11px] uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
                Dashboard
              </p>
            </div>
          </div>

          {/* Right side - Micro-components */}
          {/* ThemeToggle removido — dark mode desativado temporariamente */}
          <div className="flex items-center gap-1">
            <LanguageSelector />
            <NotificationsDropdown />
            <div className="w-px h-6 bg-gray-200 dark:bg-zinc-700 mx-2" />
            <ProfileDropdown user={user} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="fixed left-0 top-0 h-full w-72 bg-black text-white">
            <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
              <Image
                src="/images/Captura_de_tela_2026-02-28_210120-removebg-preview.webp"
                alt="Logo"
                width={80}
                height={32}
                className="object-contain brightness-0 invert"
              />
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-white/60 hover:text-white"
              >
                <HiX className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-6">
              <ul className="space-y-1">
                {visibleMenuItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
