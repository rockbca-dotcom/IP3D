import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as logoutPost } from "@/app/api/auth/logout/route";
import { GET as meGet } from "@/app/api/auth/me/route";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
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
    getIronSession: vi.fn().mockResolvedValue({
      save: vi.fn(),
      destroy: vi.fn(),
      isLoggedIn: false,
    }),
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

describe("Autenticação e Sessão", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Login API", () => {
    it("deve autenticar administrador ativo com credenciais válidas", async () => {
      const hashedPassword = await bcrypt.hash("Password123", 12);
      supabaseSingle.mockResolvedValue({
        data: {
        id: "user-1",
        email: "admin@test.com",
        password: hashedPassword,
        active: true,
        role: "ADMIN",
        name: "Admin",
        },
        error: null,
      });

      const req = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "admin@test.com", password: "Password123" }),
      });

      const res = await loginPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.role).toBe("ADMIN");
      expect(data.user).not.toHaveProperty("password");
    });

    it("deve recusar usuário inativo mesmo com senha correta", async () => {
      const hashedPassword = await bcrypt.hash("Password123", 12);
      supabaseSingle.mockResolvedValue({
        data: {
        id: "user-1",
        email: "inactive@test.com",
        password: hashedPassword,
        active: false,
        role: "ADMIN",
        },
        error: null,
      });

      const req = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "inactive@test.com", password: "Password123" }),
      });

      const res = await loginPost(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error.message).toBe("Credenciais inválidas");
    });

    it("deve recusar role não administrativa", async () => {
      const hashedPassword = await bcrypt.hash("Password123", 12);
      supabaseSingle.mockResolvedValue({
        data: {
        id: "user-1",
        email: "user@test.com",
        password: hashedPassword,
        active: true,
        role: "CUSTOMER",
        },
        error: null,
      });

      const req = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "user@test.com", password: "Password123" }),
      });

      const res = await loginPost(req);
      expect(res.status).toBe(401);
    });
  });

  describe("Logout API", () => {
    it("deve chamar session.destroy no logout", async () => {
      const mockSession = { destroy: vi.fn() };
      (getIronSession as any).mockResolvedValue(mockSession);

      const res = await logoutPost();
      expect(res.status).toBe(200);
      expect(mockSession.destroy).toHaveBeenCalled();
    });
  });

  describe("Me API", () => {
    it("deve retornar 401 para sessão não autenticada", async () => {
      (getIronSession as any).mockResolvedValue({ isLoggedIn: false });
      
      const res = await meGet();
      expect(res.status).toBe(401);
    });

    it("deve retornar dados do usuário para sessão válida", async () => {
      (getIronSession as any).mockResolvedValue({
        isLoggedIn: true,
        userId: "1",
        email: "test@test.com",
        role: "ADMIN",
      });

      const res = await meGet();
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.email).toBe("test@test.com");
      expect(data).not.toHaveProperty("password");
    });
  });

  describe("requireAdmin (Helper)", () => {
    // Importamos dinamicamente ou usamos o helper se possível
    // Para simplificar, vamos testar via mock do auth.ts
    it("deve bloquear acesso se o usuário for inativado no banco mesmo com sessão ativa", async () => {
      // Importamos isAdmin do auth.ts
      const { isAdmin } = await import("@/lib/auth");
      
      // Mock: Sessão diz que está logado
      (getIronSession as any).mockResolvedValue({
        isLoggedIn: true,
        userId: "user-123",
        role: "ADMIN",
      });

      supabaseSingle.mockResolvedValue({
        data: {
          id: "user-123",
          role: "ADMIN",
          active: false,
        },
        error: null,
      });

      const result = await isAdmin();
      expect(result).toBe(false);
    });
  });
});
