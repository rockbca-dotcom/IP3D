import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { GET as GET_PUBLIC } from "@/app/api/categories/route";
import { GET as GET_ADMIN_LIST, POST as CREATE_CATEGORY } from "@/app/api/admin/categories/route";
import { GET as GET_CATEGORY, PUT as UPDATE_CATEGORY, DELETE as DELETE_CATEGORY } from "@/app/api/admin/categories/[id]/route";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    productCategory: {
      count: vi.fn(),
    },
    product: {
      count: vi.fn(),
    },
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

describe("API de Categorias — Módulos Público e Administrativo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Autorização e RBAC", () => {
    it("deve retornar 401 se o usuário não estiver autenticado nas rotas admin", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(
        NextResponse.json({ error: "Não autenticado." }, { status: 401 })
      );

      const res = await GET_ADMIN_LIST();
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe("Não autenticado.");
    });

    it("deve retornar 403 se o usuário for EDITOR nas rotas admin", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(
        NextResponse.json({ error: "Acesso negado." }, { status: 403 })
      );

      const res = await GET_ADMIN_LIST();
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe("Acesso negado.");
    });
  });

  describe("GET /api/categories — Listagem Pública", () => {
    it("deve retornar apenas categorias ativas com ordenação", async () => {
      const mockCategories = [
        { id: "c1", name: "Impressoras", slug: "impressoras", active: true, children: [] },
      ];
      vi.mocked(prisma.category.findMany).mockResolvedValue(mockCategories as any);

      const res = await GET_PUBLIC();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.categories).toHaveLength(1);
      expect(prisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { active: true },
        })
      );
    });
  });

  describe("POST /api/admin/categories — Criação Admin", () => {
    const validPayload = {
      name: "Filamentos",
      slug: "filamentos",
      order: 10,
      active: true,
    };

    it("deve criar uma categoria com sucesso se o payload for válido", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.category.findUnique).mockResolvedValue(null); // Slug livre
      vi.mocked(prisma.category.create).mockResolvedValue({ id: "c-new", ...validPayload } as any);

      const res = await CREATE_CATEGORY(makeRequest("http://localhost/api/admin/categories", "POST", validPayload));
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.category.id).toBe("c-new");
    });

    it("deve retornar 400 se o payload for inválido (Zod)", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      const invalidPayload = { name: "", slug: "FILAMENTOS" }; // Slug com maiúsculas inválido
      const res = await CREATE_CATEGORY(makeRequest("http://localhost/api/admin/categories", "POST", invalidPayload));
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe("BAD_REQUEST");
    });

    it("deve retornar 409 se tentar usar um slug duplicado", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: "c-exist" } as any);

      const res = await CREATE_CATEGORY(makeRequest("http://localhost/api/admin/categories", "POST", validPayload));
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.message).toContain("Já existe uma categoria com este slug.");
    });
  });

  describe("PUT /api/admin/categories/[id] — Edição Admin", () => {
    const validUpdate = {
      name: "Filamentos PLA",
      slug: "filamentos-pla",
    };

    it("deve atualizar a categoria com sucesso", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.category.findUnique)
        .mockResolvedValueOnce({ id: "c1", slug: "filamentos" } as any) // findUnique (existe)
        .mockResolvedValueOnce(null); // findUnique (slug livre)
      vi.mocked(prisma.category.update).mockResolvedValue({ id: "c1", ...validUpdate } as any);

      const res = await UPDATE_CATEGORY(
        makeRequest("http://localhost/api/admin/categories/c1", "PUT", validUpdate),
        { params: Promise.resolve({ id: "c1" }) }
      );
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.category.name).toBe("Filamentos PLA");
    });

    it("deve retornar 400 se parentId for igual ao próprio ID (auto-referência)", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: "c1", slug: "filamentos" } as any);

      const res = await UPDATE_CATEGORY(
        makeRequest("http://localhost/api/admin/categories/c1", "PUT", { parentId: "c1" }),
        { params: Promise.resolve({ id: "c1" }) }
      );
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.message).toContain("Uma categoria não pode ser pai dela mesma.");
    });

    it("deve retornar 400 se a alteração criar um ciclo (parentId descendente)", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      // Mock wouldCreateCycle traversal:
      // A (c1) tenta ser filha de B (c2).
      // c2.parentId é c1 (A) -> Ciclo!
      vi.mocked(prisma.category.findUnique)
        .mockResolvedValueOnce({ id: "c1", slug: "filamentos-a" } as any) // categoria existe
        .mockResolvedValueOnce({ id: "c2", slug: "filamentos-b" } as any) // pai existe
        .mockResolvedValueOnce({ id: "c2", parentId: "c1" } as any); // traversing B parent: parentId is c1 (A)

      const res = await UPDATE_CATEGORY(
        makeRequest("http://localhost/api/admin/categories/c1", "PUT", { parentId: "c2" }),
        { params: Promise.resolve({ id: "c1" }) }
      );
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.message).toContain("ciclo na árvore");
    });
  });

  describe("DELETE /api/admin/categories/[id] — Exclusão Admin", () => {
    it("deve retornar 409 se a categoria tiver subcategorias vinculadas", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: "c1" } as any);
      vi.mocked(prisma.productCategory.count).mockResolvedValue(0);
      vi.mocked(prisma.product.count).mockResolvedValue(0);
      vi.mocked(prisma.category.count).mockResolvedValue(2); // tem 2 subcategorias

      const res = await DELETE_CATEGORY(
        makeRequest("http://localhost/api/admin/categories/c1", "DELETE"),
        { params: Promise.resolve({ id: "c1" }) }
      );
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.error.message).toContain("possui subcategorias");
    });

    it("deve retornar 409 se a categoria tiver produtos vinculados", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: "c1" } as any);
      vi.mocked(prisma.productCategory.count).mockResolvedValue(3); // 3 produtos vinculados
      vi.mocked(prisma.product.count).mockResolvedValue(0);
      vi.mocked(prisma.category.count).mockResolvedValue(0);

      const res = await DELETE_CATEGORY(
        makeRequest("http://localhost/api/admin/categories/c1", "DELETE"),
        { params: Promise.resolve({ id: "c1" }) }
      );
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.error.message).toContain("produtos vinculados");
    });

    it("deve excluir a categoria com sucesso se estiver livre", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.category.findUnique).mockResolvedValue({ id: "c1" } as any);
      vi.mocked(prisma.productCategory.count).mockResolvedValue(0);
      vi.mocked(prisma.product.count).mockResolvedValue(0);
      vi.mocked(prisma.category.count).mockResolvedValue(0);

      const res = await DELETE_CATEGORY(
        makeRequest("http://localhost/api/admin/categories/c1", "DELETE"),
        { params: Promise.resolve({ id: "c1" }) }
      );
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.category.delete).toHaveBeenCalledWith({ where: { id: "c1" } });
    });
  });
});
