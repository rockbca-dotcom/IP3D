import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as loginPost } from "@/app/api/auth/login/route";
import { POST as checkoutPost } from "@/app/api/payments/checkout/route";
import { POST as shippingPost } from "@/app/api/shipping/route";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    product: { findMany: vi.fn() },
    order: { create: vi.fn() },
  },
}));

vi.mock("iron-session", async () => {
  const actual = await vi.importActual("iron-session");
  return { ...actual, getIronSession: vi.fn() };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({}),
}));

describe("API Standardized Errors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Validation Errors (Zod)", () => {
    it("deve retornar formato estruturado para payload inválido no login", async () => {
      const req = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "not-an-email", password: "" }),
      });

      const res = await loginPost(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("BAD_REQUEST");
      expect(data.error.message).toBe("Dados inválidos");
      expect(Array.isArray(data.error.details)).toBe(true);
      expect(data.error.details[0].path).toBe("email");
    });

    it("deve validar checkoutSchema rigorosamente", async () => {
      const req = new NextRequest("http://localhost/api/payments/checkout", {
        method: "POST",
        body: JSON.stringify({ items: [] }), // Faltando cliente, frete e itens vazios
      });

      const res = await checkoutPost(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.details).toContainEqual(expect.objectContaining({ path: "customer" }));
      expect(data.error.details).toContainEqual(expect.objectContaining({ path: "shipping" }));
    });
  });

  describe("Business Logic & Prisma Errors", () => {
    it("deve retornar 404 estruturado se produto não existe no checkout", async () => {
      (prisma.product.findMany as any).mockResolvedValue([]); // Nenhum produto encontrado

      const req = new NextRequest("http://localhost/api/payments/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: [{ productId: "00000000-0000-0000-0000-000000000000", quantity: 1 }],
          customer: { name: "Test", email: "test@test.com" },
          shipping: {
            cep: "12345678", price: 10, serviceCode: "1", serviceName: "Test",
            address: { street: "Rua", number: "1", city: "Cidade", state: "SP" }
          }
        }),
      });

      const res = await checkoutPost(req);
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error.code).toBe("PRODUCT_NOT_FOUND");
      expect(data.error.message).toContain("não foram encontrados");
    });
  });

  describe("Internal Server Errors (500)", () => {
    it("não deve vazar stack trace em erros inesperados", async () => {
      (prisma.user.findUnique as any).mockRejectedValue(new Error("Database crash!"));

      const req = new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@test.com", password: "password123" }),
      });

      // Simula produção
      process.env.NODE_ENV = "production";
      const res = await loginPost(req);
      const data = await res.json();
      process.env.NODE_ENV = "test";

      expect(res.status).toBe(500);
      expect(data.error.message).toBe("Ocorreu um erro interno no servidor");
      expect(data.error.code).toBe("SERVER_ERROR");
      expect(data.stack).toBeUndefined();
    });
  });
});
