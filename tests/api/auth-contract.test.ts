/**
 * tests/api/auth-contract.test.ts
 *
 * Teste de contrato para o endpoint de login.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/login/route";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
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

import { prisma } from "@/lib/prisma";

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
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

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
    
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
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
    
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
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
