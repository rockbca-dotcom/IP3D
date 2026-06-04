import { describe, it, expect, vi, beforeEach } from "vitest";
import { hasRole, requireSuperAdmin, requireEditor, requireAdmin } from "@/lib/auth";
import { getIronSession } from "iron-session";
const { supabaseSingle, supabaseEq, supabaseSelect, supabaseFrom } = vi.hoisted(() => ({
  supabaseSingle: vi.fn(),
  supabaseEq: vi.fn(() => ({ single: supabaseSingle })),
  supabaseSelect: vi.fn(() => ({ eq: supabaseEq })),
  supabaseFrom: vi.fn(() => ({ select: supabaseSelect })),
}));

vi.mock("iron-session", async () => {
  const actual = await vi.importActual("iron-session");
  return {
    ...actual,
    getIronSession: vi.fn(),
  };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseConfigError: vi.fn(() => null),
  getSupabaseAdmin: vi.fn(() => ({
    from: supabaseFrom,
  })),
}));

describe("RBAC - Matriz de Autorização", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSession = (role: string, isLoggedIn = true) => {
    (getIronSession as any).mockResolvedValue({
      isLoggedIn,
      userId: "user-123",
      role,
    });
  };

  const mockDbUser = (role: any, active = true) => {
    supabaseSingle.mockResolvedValue({
      data: {
        id: "user-123",
        role,
        active,
      },
      error: null,
    });
  };

  describe("Nível: EDITOR", () => {
    it("deve permitir EDITOR em requireEditor", async () => {
      mockSession("EDITOR");
      mockDbUser("EDITOR");
      const result = await requireEditor();
      expect(result).toBeNull();
    });

    it("deve bloquear EDITOR em requireAdmin", async () => {
      mockSession("EDITOR");
      mockDbUser("EDITOR");
      const res = await requireAdmin();
      expect(res?.status).toBe(403);
    });

    it("deve bloquear EDITOR em requireSuperAdmin", async () => {
      mockSession("EDITOR");
      mockDbUser("EDITOR");
      const res = await requireSuperAdmin();
      expect(res?.status).toBe(403);
    });
  });

  describe("Nível: ADMIN", () => {
    it("deve permitir ADMIN em requireAdmin", async () => {
      mockSession("ADMIN");
      mockDbUser("ADMIN");
      const result = await requireAdmin();
      expect(result).toBeNull();
    });

    it("deve permitir ADMIN em requireEditor", async () => {
      mockSession("ADMIN");
      mockDbUser("ADMIN");
      const result = await requireEditor();
      expect(result).toBeNull();
    });

    it("deve bloquear ADMIN em requireSuperAdmin", async () => {
      mockSession("ADMIN");
      mockDbUser("ADMIN");
      const res = await requireSuperAdmin();
      expect(res?.status).toBe(403);
    });
  });

  describe("Nível: SUPER_ADMIN", () => {
    it("deve permitir SUPER_ADMIN em todas as proteções", async () => {
      mockSession("SUPER_ADMIN");
      mockDbUser("SUPER_ADMIN");
      
      expect(await requireEditor()).toBeNull();
      expect(await requireAdmin()).toBeNull();
      expect(await requireSuperAdmin()).toBeNull();
    });
  });

  describe("Integridade de Sessão vs Banco", () => {
    it("deve bloquear se a role no banco for menor que a da sessão (privilégio forjado/antigo)", async () => {
      // Sessão diz ADMIN, mas banco diz EDITOR
      mockSession("ADMIN");
      mockDbUser("EDITOR");

      const res = await requireAdmin();
      expect(res?.status).toBe(403);
    });

    it("deve bloquear se o usuário for inativado no banco", async () => {
      mockSession("SUPER_ADMIN");
      mockDbUser("SUPER_ADMIN", false); // Inativo

      const res = await requireSuperAdmin();
      expect(res?.status).toBe(403);
    });
  });
});
