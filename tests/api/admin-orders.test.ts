import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { GET as getList } from "@/app/api/admin/orders/route";
import { GET as getDetail, PATCH as patchOrder } from "@/app/api/admin/orders/[id]/route";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isSuperAdmin } from "@/lib/auth";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  requireAdmin: vi.fn(),
  isSuperAdmin: vi.fn(),
}));

function makeRequest(url: string, method = "GET", body: any = null) {
  return new NextRequest(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
  });
}

describe("API Administrativa de Pedidos — /api/admin/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("RBAC e Segurança de Módulo", () => {
    it("deve rejeitar com 401 se o usuário não estiver autenticado", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(
        NextResponse.json({ error: "Não autenticado." }, { status: 401 })
      );

      const res = await getList(makeRequest("http://localhost/api/admin/orders"));
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe("Não autenticado.");
    });

    it("deve rejeitar com 403 se o usuário for EDITOR", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(
        NextResponse.json({ error: "Acesso negado." }, { status: 403 })
      );

      const res = await getList(makeRequest("http://localhost/api/admin/orders"));
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error).toBe("Acesso negado.");
    });
  });

  describe("GET /api/admin/orders — Listagem e Filtros", () => {
    it("deve retornar listagem de pedidos com paginação padrão e ordenação desc", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      
      const mockOrders = [
        { id: "o1", code: "PE1", status: "PENDING", paymentStatus: "PAYMENT_PENDING", total: 150.0 },
        { id: "o2", code: "PE2", status: "PROCESSING", paymentStatus: "APPROVED", total: 320.0 },
      ];

      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders as any);
      vi.mocked(prisma.order.count).mockResolvedValue(2);

      const res = await getList(makeRequest("http://localhost/api/admin/orders"));
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.orders).toHaveLength(2);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(20);
      expect(data.pagination.total).toBe(2);

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          orderBy: { createdAt: "desc" },
        })
      );
    });

    it("deve aplicar filtros de status operacional e de pagamento e paginação customizada", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      vi.mocked(prisma.order.findMany).mockResolvedValue([]);
      vi.mocked(prisma.order.count).mockResolvedValue(0);

      const url = "http://localhost/api/admin/orders?page=2&limit=5&status=PROCESSING&paymentStatus=APPROVED&search=Joao";
      const res = await getList(makeRequest(url));
      
      expect(res.status).toBe(200);
      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
          where: expect.objectContaining({
            status: "PROCESSING",
            paymentStatus: "APPROVED",
            OR: [
              { code: { contains: "Joao", mode: "insensitive" } },
              { customerName: { contains: "Joao", mode: "insensitive" } },
              { customerEmail: { contains: "Joao", mode: "insensitive" } },
            ],
          }),
        })
      );
    });
  });

  describe("GET /api/admin/orders/[id] — Busca por ID", () => {
    it("deve retornar 404 se o pedido não for encontrado", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

      const res = await getDetail(makeRequest("http://localhost/api/admin/orders/o-nonexistent"), {
        params: Promise.resolve({ id: "o-nonexistent" }),
      });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data.error.code).toBe("NOT_FOUND");
    });

    it("deve retornar o pedido completo com itens se existente", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      const mockOrder = {
        id: "o1",
        code: "PE1",
        customerName: "Lucas Silva",
        items: [{ id: "i1", name: "Filamento PLA", quantity: 2 }],
      };
      vi.mocked(prisma.order.findUnique).mockResolvedValue(mockOrder as any);

      const res = await getDetail(makeRequest("http://localhost/api/admin/orders/o1"), {
        params: Promise.resolve({ id: "o1" }),
      });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.order.code).toBe("PE1");
      expect(data.order.items).toHaveLength(1);
    });
  });

  describe("PATCH /api/admin/orders/[id] — Transições de Status & Pagamento", () => {
    it("deve transicionar status com sucesso de PENDING para PROCESSING", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      
      const orderPending = { id: "o1", status: "PENDING", paymentStatus: "PAYMENT_PENDING" };
      const orderProcessing = { id: "o1", status: "PROCESSING", paymentStatus: "PAYMENT_PENDING" };

      vi.mocked(prisma.order.findUnique).mockResolvedValue(orderPending as any);
      vi.mocked(prisma.order.update).mockResolvedValue(orderProcessing as any);

      const res = await patchOrder(
        makeRequest("http://localhost/api/admin/orders/o1", "PATCH", { status: "PROCESSING" }),
        { params: Promise.resolve({ id: "o1" }) }
      );
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.order.status).toBe("PROCESSING");
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: "o1" },
        data: { status: "PROCESSING" },
        include: { items: true },
      });
    });

    it("deve bloquear transição inválida de SHIPPED para PENDING com 409", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      
      const orderShipped = { id: "o1", status: "SHIPPED", paymentStatus: "APPROVED" };
      vi.mocked(prisma.order.findUnique).mockResolvedValue(orderShipped as any);

      const res = await patchOrder(
        makeRequest("http://localhost/api/admin/orders/o1", "PATCH", { status: "PENDING" }),
        { params: Promise.resolve({ id: "o1" }) }
      );
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.error.code).toBe("INVALID_STATUS_TRANSITION");
      expect(data.error.message).toContain("não é permitida");
    });

    it("deve bloquear transição saindo de estados finais como DELIVERED ou CANCELLED", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);

      const orderCancelled = { id: "o1", status: "CANCELLED" };
      vi.mocked(prisma.order.findUnique).mockResolvedValue(orderCancelled as any);

      const res = await patchOrder(
        makeRequest("http://localhost/api/admin/orders/o1", "PATCH", { status: "PROCESSING" }),
        { params: Promise.resolve({ id: "o1" }) }
      );
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.error.code).toBe("INVALID_STATUS_TRANSITION");
    });

    it("deve rejeitar com 403 se ADMIN comum tentar alterar paymentStatus manualmente", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(isSuperAdmin).mockResolvedValue(false); // ADMIN comum

      const orderPending = { id: "o1", status: "PENDING", paymentStatus: "PAYMENT_PENDING" };
      vi.mocked(prisma.order.findUnique).mockResolvedValue(orderPending as any);

      const res = await patchOrder(
        makeRequest("http://localhost/api/admin/orders/o1", "PATCH", { paymentStatus: "APPROVED" }),
        { params: Promise.resolve({ id: "o1" }) }
      );
      const data = await res.json();

      expect(res.status).toBe(403);
      expect(data.error.code).toBe("FORBIDDEN");
      expect(data.error.message).toContain("Apenas o perfil de Super Admin");
    });

    it("deve permitir alteração de paymentStatus se o usuário for SUPER_ADMIN", async () => {
      vi.mocked(requireAdmin).mockResolvedValue(null);
      vi.mocked(isSuperAdmin).mockResolvedValue(true); // SUPER ADMIN

      const orderPending = { id: "o1", status: "PENDING", paymentStatus: "PAYMENT_PENDING" };
      const orderApproved = { id: "o1", status: "PENDING", paymentStatus: "APPROVED" };

      vi.mocked(prisma.order.findUnique).mockResolvedValue(orderPending as any);
      vi.mocked(prisma.order.update).mockResolvedValue(orderApproved as any);

      const res = await patchOrder(
        makeRequest("http://localhost/api/admin/orders/o1", "PATCH", { paymentStatus: "APPROVED" }),
        { params: Promise.resolve({ id: "o1" }) }
      );
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.order.paymentStatus).toBe("APPROVED");
    });
  });
});
