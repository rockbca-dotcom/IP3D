"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /admin/usuarios   [SUPER_ADMIN only]
//
// Gerenciamento completo de usuários do painel administrativo.
//
// Funcionalidades:
//  • Listar usuários com busca e filtro por papel
//  • Criar novo usuário (nome, e-mail, senha, papel)
//  • Editar usuário (nome, e-mail, papel, active; troca de senha opcional)
//  • Inativar usuário (soft delete via active=false)
//  • Reativar usuário inativo
//  • Proteção: último SUPER_ADMIN não pode ser rebaixado/inativado
//  • Proteção: usuário não pode alterar/inativar a própria conta de forma destrutiva
//  • Guard de role: ADMIN comum vê mensagem de acesso restrito (não página vazia)
//  • Badge "(você)" identifica o usuário logado na lista
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineLockClosed,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiRefresh,
  HiOutlineShieldExclamation,
  HiOutlineX,
} from "react-icons/hi";
import { Modal, ConfirmModal } from "@/components/admin/Modal";

const ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const;
type Role = (typeof ROLES)[number];

interface AdminUser {
  id:        string;
  name:      string | null;
  email:     string;
  role:      Role;
  active:    boolean;
  createdAt: string;
  updatedAt: string;
}

interface CurrentSession {
  userId: string;
  email:  string;
  name?:  string;
  role:   string;
}

const emptyForm = {
  name:            "",
  email:           "",
  password:        "",
  confirmPassword: "",
  role:            "ADMIN" as Role,
  active:          true,
};

const roleBadge: Record<Role, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  ADMIN:       "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  EDITOR:      "bg-gray-100 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300",
};

const roleLabel: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN:       "Administrador",
  EDITOR:      "Editor",
};

// ─── Inline notification (substitui alert()) ─────────────────────────────────

interface NotifState {
  type:    "error" | "success";
  message: string;
}

export default function UsuariosPage() {
  // ── Data ──────────────────────────────────────────────────────────────────
  const [users, setUsers]         = useState<AdminUser[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal]         = useState(0);

  // ── Access control ────────────────────────────────────────────────────────
  const [session, setSession]     = useState<CurrentSession | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen]           = useState(false);
  const [deleteModal, setDeleteModal]       = useState(false);
  const [reactivateModal, setReactivateModal] = useState(false);
  const [selectedUser, setSelectedUser]     = useState<AdminUser | null>(null);
  const [formData, setFormData]             = useState(emptyForm);
  const [saving, setSaving]                 = useState(false);
  const [formError, setFormError]           = useState("");

  // ── Inline notification ───────────────────────────────────────────────────
  const [notif, setNotif] = useState<NotifState | null>(null);

  function showError(msg: string)   { setNotif({ type: "error",   message: msg }); }
  function showSuccess(msg: string) { setNotif({ type: "success", message: msg }); }

  // ── Bootstrap: fetch own session first ───────────────────────────────────
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data: CurrentSession & { error?: string }) => {
        if (data.error) return; // não logado — layout já redirecionaria
        setSession(data);
      })
      .catch(() => { /* silencia erros de rede */ });
  }, []);

  // ── List users ────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:  String(page),
        limit: "20",
        search,
        role:  roleFilter,
      });
      const res  = await fetch(`/api/admin/users?${params}`);
      if (res.status === 403) {
        setAccessDenied(true);
        setUsers([]);
        return;
      }
      setAccessDenied(false);
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);
      setTotal(data.pagination?.total ?? 0);
    } catch {
      // silencia erros de rede
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchUsers();
    });
  }, [fetchUsers]);

  // ── Open modals ───────────────────────────────────────────────────────────
  function openCreate() {
    setSelectedUser(null);
    setFormData(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(user: AdminUser) {
    setSelectedUser(user);
    setFormData({
      name:            user.name ?? "",
      email:           user.email,
      password:        "",
      confirmPassword: "",
      role:            user.role,
      active:          user.active,
    });
    setFormError("");
    setModalOpen(true);
  }

  // ── Submit form ───────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      setFormError("As senhas não coincidem");
      return;
    }
    if (!selectedUser && !formData.password) {
      setFormError("A senha é obrigatória para novos usuários");
      return;
    }
    if (formData.password && formData.password.length < 8) {
      setFormError("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name:   formData.name.trim()  || null,
        email:  formData.email.trim(),
        role:   formData.role,
        active: formData.active,
      };
      if (formData.password) payload.password = formData.password;

      const url    = selectedUser ? `/api/admin/users/${selectedUser.id}` : "/api/admin/users";
      const method = selectedUser ? "PUT" : "POST";

      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error ?? "Erro ao salvar usuário");
        return;
      }

      setModalOpen(false);
      showSuccess(selectedUser ? "Usuário atualizado com sucesso." : "Usuário criado com sucesso.");
      fetchUsers();
    } finally {
      setSaving(false);
    }
  }

  // ── Inativar ──────────────────────────────────────────────────────────────
  async function handleDeactivate() {
    if (!selectedUser) return;
    const res  = await fetch(`/api/admin/users/${selectedUser.id}`, { method: "DELETE" });
    const data = await res.json();
    setDeleteModal(false);
    setSelectedUser(null);
    if (!res.ok) {
      showError(data.error ?? "Erro ao inativar usuário");
      return;
    }
    showSuccess(`Usuário "${selectedUser.name || selectedUser.email}" inativado.`);
    fetchUsers();
  }

  // ── Reativar ──────────────────────────────────────────────────────────────
  async function handleReactivate() {
    if (!selectedUser) return;
    const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ active: true }),
    });
    const data = await res.json();
    setReactivateModal(false);
    setSelectedUser(null);
    if (!res.ok) {
      showError(data.error ?? "Erro ao reativar usuário");
      return;
    }
    showSuccess(`Usuário "${selectedUser.name || selectedUser.email}" reativado.`);
    fetchUsers();
  }

  // ── Access denied view ────────────────────────────────────────────────────
  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <HiOutlineShieldExclamation className="w-14 h-14 text-gray-300 dark:text-zinc-600" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Acesso Restrito</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          O gerenciamento de usuários é exclusivo para <strong>Super Administradores</strong>.
          Entre em contato com um Super Admin para obter acesso.
        </p>
      </div>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Inline notification ── substitui alert() */}
      {notif && (
        <div
          className={`flex items-start justify-between gap-4 px-4 py-3 text-sm border ${
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
          <h1 className="text-2xl font-bold text-black dark:text-white">Usuários</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gerencie o acesso ao painel administrativo · {total} usuário{total !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Novo Usuário
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-black dark:text-white outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-black dark:text-white outline-none"
        >
          <option value="">Todos os papéis</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{roleLabel[r]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-zinc-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Usuário</th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Papel</th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Status</th>
              <th className="px-6 py-4 text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium">Criado em</th>
              <th className="px-6 py-4 text-right text-[11px] uppercase tracking-wider text-gray-500 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-zinc-800">
                  <td colSpan={5} className="px-6 py-4">
                    <div className="h-4 bg-gray-100 dark:bg-zinc-800 animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : users.map((user) => {
              const isCurrentUser = session?.userId === user.id;
              return (
                <tr
                  key={user.id}
                  className={`border-b border-gray-100 dark:border-zinc-800 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50 ${
                    !user.active ? "opacity-50" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-black dark:text-white">
                          {user.name || <span className="text-gray-400 italic">Sem nome</span>}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      {isCurrentUser && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                          você
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-[10px] uppercase tracking-wider font-medium ${roleBadge[user.role]}`}>
                      {roleLabel[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.active ? (
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-medium">
                        <HiOutlineCheckCircle className="w-4 h-4" /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
                        <HiOutlineXCircle className="w-4 h-4" /> Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(user)}
                        title="Editar"
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded transition-colors"
                      >
                        <HiOutlinePencil className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </button>
                      {user.active ? (
                        <button
                          onClick={() => { setSelectedUser(user); setDeleteModal(true); }}
                          title={isCurrentUser ? "Não é possível inativar a própria conta" : "Inativar"}
                          disabled={isCurrentUser}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <HiOutlineTrash className="w-4 h-4 text-red-400" />
                        </button>
                      ) : (
                        <button
                          onClick={() => { setSelectedUser(user); setReactivateModal(true); }}
                          title="Reativar"
                          className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                        >
                          <HiRefresh className="w-4 h-4 text-green-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-500">{total} usuários</p>
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

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedUser ? "Editar Usuário" : "Novo Usuário"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome completo"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-black dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@ip3d.com.br"
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-black dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Papel *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-black dark:text-white outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{roleLabel[r]}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              {formData.role === "SUPER_ADMIN" && "Acesso total ao sistema, incluindo usuários e configurações sensíveis."}
              {formData.role === "ADMIN"       && "Acesso ao painel completo, exceto gerenciamento de usuários."}
              {formData.role === "EDITOR"      && "Papel reservado para futuras permissões de conteúdo. Não permite login no painel ainda."}
            </p>
          </div>

          {selectedUser && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="user-active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="user-active" className="text-sm text-gray-700 dark:text-gray-300 select-none">
                Conta ativa
              </label>
            </div>
          )}

          <div className="border-t border-gray-100 dark:border-zinc-700 pt-4">
            <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
              <HiOutlineLockClosed className="w-3.5 h-3.5" />
              {selectedUser ? "Deixe em branco para manter a senha atual" : "Senha obrigatória para novos usuários"}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {selectedUser ? "Nova senha" : "Senha *"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-black dark:text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {selectedUser ? "Confirmar nova senha" : "Confirmar senha *"}
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Repita a senha"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-black dark:text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 text-sm border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-sm bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {saving ? "Salvando…" : selectedUser ? "Salvar alterações" : "Criar usuário"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Deactivate Confirm */}
      <ConfirmModal
        open={deleteModal}
        onClose={() => { setDeleteModal(false); setSelectedUser(null); }}
        onConfirm={handleDeactivate}
        title="Inativar usuário"
        message={
          selectedUser
            ? `Tem certeza que deseja inativar "${selectedUser.name || selectedUser.email}"? O usuário não conseguirá mais acessar o painel, mas seus dados serão preservados.`
            : ""
        }
        confirmText="Inativar"
        isDangerous
      />

      {/* Reactivate Confirm */}
      <ConfirmModal
        open={reactivateModal}
        onClose={() => { setReactivateModal(false); setSelectedUser(null); }}
        onConfirm={handleReactivate}
        title="Reativar usuário"
        message={
          selectedUser
            ? `Reativar "${selectedUser.name || selectedUser.email}"? O usuário voltará a ter acesso ao painel.`
            : ""
        }
        confirmText="Reativar"
      />
    </div>
  );
}
