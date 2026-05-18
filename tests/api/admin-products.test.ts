import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { GET as GET_LIST, POST as CREATE_PRODUCT } from "@/app/api/admin/products/route";
import { GET as GET_PRODUCT, PUT as UPDATE_PRODUCT, PATCH as PATCH_PRODUCT, DELETE as DELETE_PRODUCT } from "@/app/api/admin/products/[id]/route";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    productCategory: {
      deleteMany: vi.fn(),
    },
    specification: {
      deleteMany: vi.fn(),
    },
    orderItem: {
      count: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

vi.mock("@/lib/auth", () => ({
  requireAdmin: vi.fn(),
}));

function makeRequest(url: string, method = "GET", body: any = null) {
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
  });
}

describe("API Administrativa de Produtos — Módulo ADMIN+", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Autorização e RBAC", () => {
    it("deve retornar 401 se o usuário não estiver autenticado", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(
        NextResponse.json({ error: "Não autenticado." }, { status: 401 })
      );

      const res = await GET_LIST(makeRequest("http://localhost/api/admin/products"));
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe("Não autenticado.");
    });

    it("deve retornar 403 se o usuário for EDITOR (permissão insuficiente)", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(
        NextResponse.json({ error: "Acesso negado." }, { status: 403 })
      );

      const res = await GET_LIST(makeRequest("http://localhost/api/admin/products"));
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe("Acesso negado.");
    });
  });

  describe("GET /api/admin/products — Listagem", () => {
    it("deve retornar listagem completa de produtos com paginação para ADMIN", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null); // Permitido

      const mockProducts = [
        { id: "p1", name: "Produto 1", slug: "p-1", active: true },
        { id: "p2", name: "Produto 2", slug: "p-2", active: false },
      ];
      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts as any);
      vi.mocked(prisma.product.count).mockResolvedValue(2);

      const res = await GET_LIST(makeRequest("http://localhost/api/admin/products?page=1&limit=10"));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.products).toHaveLength(2);
      expect(data.pagination.total).toBe(2);
    });
  });

  describe("POST /api/admin/products — Criação", () => {
    const validPayload = {
      name: "Produto Teste",
      slug: "produto-teste",
      priceOriginal: 150.50,
      stockQuantity: 10,
      categoryIds: ["cat-cuid-1"],
      specifications: [{ label: "Cor", value: "Azul" }],
    };

    it("deve criar um produto com sucesso se o payload for válido", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.product.create).mockResolvedValue({ id: "p-new", ...validPayload } as any);

      const res = await CREATE_PRODUCT(makeRequest("http://localhost/api/admin/products", "POST", validPayload));
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.product.id).toBe("p-new");
    });

    it("deve retornar 400 se o payload for inválido (Zod)", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      const invalidPayload = { ...validPayload, name: "" }; // Nome vazio
      const res = await CREATE_PRODUCT(makeRequest("http://localhost/api/admin/products", "POST", invalidPayload));
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("BAD_REQUEST");
    });
  });

  describe("GET /api/admin/products/[id] — Detalhe", () => {
    it("deve retornar 404 se o produto não existir", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

      const res = await GET_PRODUCT(makeRequest("http://localhost/api/admin/products/p-none"), { params: Promise.resolve({ id: "p-none" }) });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("deve retornar os detalhes do produto com sucesso", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: "p1", name: "Produto 1" } as any);

      const res = await GET_PRODUCT(makeRequest("http://localhost/api/admin/products/p1"), { params: Promise.resolve({ id: "p1" }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.product.name).toBe("Produto 1");
    });
  });

  describe("PUT /api/admin/products/[id] — Edição", () => {
    const validUpdate = {
      name: "Produto Editado",
      slug: "produto-editado",
      priceOriginal: 199.99,
      stockQuantity: 5,
      categoryIds: ["cat-1"],
      specifications: [{ label: "Material", value: "Metal" }],
    };

    it("deve atualizar o produto com sucesso de forma transacional", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: "p1" } as any);
      vi.mocked(prisma.product.update).mockResolvedValue({ id: "p1", ...validUpdate } as any);

      const res = await UPDATE_PRODUCT(
        makeRequest("http://localhost/api/admin/products/p1", "PUT", validUpdate),
        { params: Promise.resolve({ id: "p1" }) }
      );
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.product.name).toBe("Produto Editado");
      expect(prisma.productCategory.deleteMany).toHaveBeenCalledWith({ where: { productId: "p1" } });
    });

    it("deve retornar 404 se tentar editar um produto inexistente", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

      const res = await UPDATE_PRODUCT(
        makeRequest("http://localhost/api/admin/products/p-none", "PUT", validUpdate),
        { params: Promise.resolve({ id: "p-none" }) }
      );
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  describe("PATCH /api/admin/products/[id] — Ativação", () => {
    it("deve alterar o status active do produto com sucesso", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: "p1", active: true } as any);
      vi.mocked(prisma.product.update).mockResolvedValue({ id: "p1", active: false } as any);

      const res = await PATCH_PRODUCT(
        makeRequest("http://localhost/api/admin/products/p1", "PATCH", { active: false }),
        { params: Promise.resolve({ id: "p1" }) }
      );
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.product.active).toBe(false);
    });
  });

  describe("DELETE /api/admin/products/[id] — Exclusão", () => {
    it("deve retornar 409 Conflict se o produto tiver pedidos vinculados", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: "p1" } as any);
      vi.mocked(prisma.orderItem.count).mockResolvedValue(3); // 3 pedidos vinculados

      const res = await DELETE_PRODUCT(
        makeRequest("http://localhost/api/admin/products/p1", "DELETE"),
        { params: Promise.resolve({ id: "p1" }) }
      );
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("CONFLICT");
      expect(data.error.message).toContain("pedidos vinculados");
    });

    it("deve excluir o produto e suas relações transacionalmente com sucesso", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.product.findUnique).mockResolvedValue({ id: "p1" } as any);
      vi.mocked(prisma.orderItem.count).mockResolvedValue(0);

      const res = await DELETE_PRODUCT(
        makeRequest("http://localhost/api/admin/products/p1", "DELETE"),
        { params: Promise.resolve({ id: "p1" }) }
      );
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
    });
  });
});
