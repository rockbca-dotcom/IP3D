import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { GET, POST } from "@/app/api/admin/inventory/route";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
    inventoryLog: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn((promises) => Promise.all(promises)),
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

describe("API de Estoque — /api/admin/inventory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("RBAC e Segurança", () => {
    it("deve rejeitar com 401 se o usuário não estiver autenticado", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(
        NextResponse.json({ error: "Não autenticado." }, { status: 401 })
      );

      const res = await GET(makeRequest("http://localhost/api/admin/inventory"));
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe("Não autenticado.");
    });

    it("deve rejeitar com 403 se o usuário for EDITOR", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(
        NextResponse.json({ error: "Acesso negado." }, { status: 403 })
      );

      const res = await GET(makeRequest("http://localhost/api/admin/inventory"));
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe("Acesso negado.");
    });
  });

  describe("GET /api/admin/inventory — Histórico & Listagem", () => {
    it("deve retornar 404 se o produto de histórico não for encontrado", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

      const res = await GET(makeRequest("http://localhost/api/admin/inventory?productId=p-nonexistent"));
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("deve retornar logs históricos com cálculo retrospectivo de previousStock e newStock", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: "p1",
        stockQuantity: 15,
      } as any);

      // Logs em ordem decrescente de criação
      const mockLogs = [
        { id: "log2", change: -5, reason: "Venda", type: "ADJUSTMENT", referenceId: "ref2", createdAt: new Date() },
        { id: "log1", change: 10, reason: "Entrada NF", type: "MANUAL", referenceId: "ref1", createdAt: new Date() },
      ];

      vi.mocked(prisma.inventoryLog.findMany).mockResolvedValue(mockLogs as any);

      const res = await GET(makeRequest("http://localhost/api/admin/inventory?productId=p1"));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.logs).toHaveLength(2);

      // Log 2 (mais recente): estoque atual é 15, logo novo estoque é 15, anterior é 15 - (-5) = 20
      expect(data.logs[0].newStock).toBe(15);
      expect(data.logs[0].previousStock).toBe(20);

      // Log 1 (anterior): estoque restante era 20, logo novo é 20, anterior é 20 - 10 = 10
      expect(data.logs[1].newStock).toBe(20);
      expect(data.logs[1].previousStock).toBe(10);
    });
  });

  describe("POST /api/admin/inventory — Movimentação de Estoque", () => {
    const validPayload = {
      productId: "p1",
      action: "ENTRY",
      quantity: 10,
      reason: "Entrada de Filamento PLA",
      reference: "NF-999",
    };

    it("deve incrementar estoque na ação de Entrada (ENTRY)", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: "p1",
        name: "Filamento PLA",
        stockQuantity: 20,
      } as any);

      vi.mocked(prisma.product.update).mockResolvedValue({ id: "p1", stockQuantity: 30 } as any);
      vi.mocked(prisma.inventoryLog.create).mockResolvedValue({
        id: "log1",
        change: 10,
        type: "ADJUSTMENT",
        reason: "Entrada de Filamento PLA",
        referenceId: "NF-999",
      } as any);

      const res = await POST(makeRequest("http://localhost/api/admin/inventory", "POST", validPayload));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.newQty).toBe(30);
      expect(data.log.previousStock).toBe(20);
      expect(data.log.newStock).toBe(30);
    });

    it("deve decrementar estoque na ação de Saída (EXIT)", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: "p1",
        name: "Filamento PLA",
        stockQuantity: 20,
      } as any);

      vi.mocked(prisma.product.update).mockResolvedValue({ id: "p1", stockQuantity: 15 } as any);
      vi.mocked(prisma.inventoryLog.create).mockResolvedValue({
        id: "log2",
        change: -5,
        type: "ADJUSTMENT",
        reason: "Descarte",
      } as any);

      const payload = { ...validPayload, action: "EXIT", quantity: 5, reason: "Descarte" };
      const res = await POST(makeRequest("http://localhost/api/admin/inventory", "POST", payload));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.newQty).toBe(15);
      expect(data.log.change).toBe(-5);
    });

    it("deve rejeitar Saída (EXIT) se a quantidade exceder o estoque atual", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: "p1",
        name: "Filamento PLA",
        stockQuantity: 20,
      } as any);

      const payload = { ...validPayload, action: "EXIT", quantity: 25, reason: "Saída excessiva" };
      const res = await POST(makeRequest("http://localhost/api/admin/inventory", "POST", payload));
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.message).toContain("resultaria em estoque negativo");
    });

    it("deve calcular delta correto no Ajuste Absoluto (CORRECTION)", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: "p1",
        name: "Filamento PLA",
        stockQuantity: 20,
      } as any);

      // Definindo estoque absoluto para 50 (delta deve ser +30)
      vi.mocked(prisma.product.update).mockResolvedValue({ id: "p1", stockQuantity: 50 } as any);
      vi.mocked(prisma.inventoryLog.create).mockResolvedValue({
        id: "log3",
        change: 30,
        type: "ADJUSTMENT",
        reason: "Inventário anual",
      } as any);

      const payload = { ...validPayload, action: "CORRECTION", quantity: 50, reason: "Inventário anual" };
      const res = await POST(makeRequest("http://localhost/api/admin/inventory", "POST", payload));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.newQty).toBe(50);
      expect(data.log.change).toBe(30);
    });

    it("deve rejeitar com 400 se o motivo for vazio", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      const payload = { ...validPayload, reason: "" };
      const res = await POST(makeRequest("http://localhost/api/admin/inventory", "POST", payload));
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("BAD_REQUEST");
    });

    it("deve rejeitar com 400 se a quantidade for inválida na Entrada (ENTRY)", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      const payload = { ...validPayload, quantity: -5 };
      const res = await POST(makeRequest("http://localhost/api/admin/inventory", "POST", payload));
      const data = await res.json();

      expect(res.status).toBe(400);
    });

    it("deve reverter transação inteira em caso de falha no Prisma", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.product.findUnique).mockResolvedValue({
        id: "p1",
        name: "Filamento PLA",
        stockQuantity: 20,
      } as any);

      // Forçando erro no transaction
      vi.mocked(prisma.$transaction).mockRejectedValue(new Error("Database write crash"));

      const res = await POST(makeRequest("http://localhost/api/admin/inventory", "POST", validPayload));
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.error.message).toBe("Database write crash");
    });
  });
});
