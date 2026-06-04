/**
 * tests/api/auth-contract.test.ts
 *
 * Teste de contrato para o endpoint de login.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/login/route";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
const { supabaseSingle, supabaseEq, supabaseSelect, supabaseFrom } = vi.hoisted(() => ({
  supabaseSingle: vi.fn(),
  supabaseEq: vi.fn(() => ({ single: supabaseSingle })),
  supabaseSelect: vi.fn(() => ({ eq: supabaseEq })),
  supabaseFrom: vi.fn(() => ({ select: supabaseSelect })),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock("iron-session", () => ({
  getIronSession: vi.fn(() => ({
    save: vi.fn(),
  })),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({})),
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseConfigError: vi.fn(() => null),
  getSupabaseAdmin: vi.fn(() => ({
    from: supabaseFrom,
  })),
}));

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar 400 se faltar email ou senha", async () => {
    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error.code).toBe("BAD_REQUEST");
    expect(data.error.message).toBe("Dados inválidos");
  });

  it("deve retornar 401 para credenciais invalidas", async () => {
    supabaseSingle.mockResolvedValue({ data: null, error: { message: "not found" } });

    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "wrong@test.com", password: "123" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error.message).toBe("Credenciais inválidas");
    expect(data.error.code).toBe("UNAUTHORIZED");
  });

  it("deve retornar sucesso para administrador valido", async () => {
    const mockUser = {
      id: "u1",
      email: "admin@test.com",
      password: "hashed_password",
      role: "ADMIN",
      active: true,
    };
    
    supabaseSingle.mockResolvedValue({ data: mockUser, error: null });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as any);

    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@test.com", password: "password" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.email).toBe("admin@test.com");
  });

  it("deve negar acesso se o usuario nao for ADMIN", async () => {
    const mockUser = {
      id: "u2",
      email: "user@test.com",
      password: "hashed_password",
      role: "USER",
      active: true,
    };
    
    supabaseSingle.mockResolvedValue({ data: mockUser, error: null });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as any);

    const req = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "user@test.com", password: "password" }),
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error.message).toBe("Credenciais inválidas");
    expect(data.error.code).toBe("UNAUTHORIZED");
  });
});
