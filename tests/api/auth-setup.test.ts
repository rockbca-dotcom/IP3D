import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/setup/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import bcrypt from "bcryptjs";

vi.mock("@/lib/env", () => ({
  env: {
    ADMIN_SETUP_SECRET: undefined,
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("API /api/auth/setup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve permitir criar o primeiro administrador e normalizar o email", async () => {
    (prisma.$transaction as any).mockImplementation(async (callback: any) => {
      return callback({
        user: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockImplementation(({ data }) => Promise.resolve({
            id: "1",
            email: data.email, // deve ser lowercase
            name: data.name,
            role: "SUPER_ADMIN",
          })),
        },
      });
    });

    const req = new NextRequest("http://localhost/api/auth/setup", {
      method: "POST",
      body: JSON.stringify({
        email: " ADMIN@test.com ",
        password: "StrongPassword123",
        name: "Admin",
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.user.email).toBe("admin@test.com");
  });

  it("deve exigir segredo de setup se ADMIN_SETUP_SECRET estiver configurado", async () => {
    vi.mocked(env).ADMIN_SETUP_SECRET = "secret-123";

    const req = new NextRequest("http://localhost/api/auth/setup", {
      method: "POST",
      headers: { "X-Setup-Secret": "wrong-secret" },
      body: JSON.stringify({
        email: "admin@test.com",
        password: "StrongPassword123",
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.error.message).toBe("Acesso não autorizado. Chave de setup inválida.");

    // Restaurar mock
    vi.mocked(env).ADMIN_SETUP_SECRET = undefined;
  });

  it("deve validar formato de email", async () => {
    const req = new NextRequest("http://localhost/api/auth/setup", {
      method: "POST",
      body: JSON.stringify({
        email: "invalid-email",
        password: "StrongPassword123",
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error.message).toBe("Dados inválidos");
  });

  it("deve exigir senha com letras e números", async () => {
    const req = new NextRequest("http://localhost/api/auth/setup", {
      method: "POST",
      body: JSON.stringify({
        email: "test@test.com",
        password: "onlyletters",
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error.message).toBe("Dados inválidos");
  });
});
