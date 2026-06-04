import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isSuperAdmin } from "@/lib/auth";
import { apiSuccess, apiError, handleApiError, notFound, forbidden } from "@/lib/api-utils";
import { z } from "zod";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
});

// Máquina de estados oficial do status do pedido (OrderStatus)
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

/**
 * GET /api/admin/orders/[id]
 * Recupera os detalhes completos de um pedido específico.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return notFound("Pedido não encontrado.");
    }

    return apiSuccess({ success: true, order });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/admin/orders/[id]
 * Atualiza o status e/ou status de pagamento de um pedido.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id } = await params;
    const payload = await request.json();
    const parsed = patchSchema.parse(payload);

    // Busca o pedido no banco
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return notFound("Pedido não encontrado.");
    }

    const updateData: { status?: OrderStatus; paymentStatus?: PaymentStatus } = {};

    // 1. Segurança Financeira: Validar alteração de paymentStatus
    if (parsed.paymentStatus !== undefined && parsed.paymentStatus !== order.paymentStatus) {
      const superAdmin = await isSuperAdmin();
      if (!superAdmin) {
        return apiError(
          "Apenas o perfil de Super Admin tem permissão para alterar o status de pagamento manualmente.",
          "FORBIDDEN",
          403
        );
      }
      updateData.paymentStatus = parsed.paymentStatus;
    }

    // 2. Máquina de Estados: Validar transição de status
    if (parsed.status !== undefined && parsed.status !== order.status) {
      const allowed = ALLOWED_TRANSITIONS[order.status];
      if (!allowed.includes(parsed.status)) {
        return apiError(
          `A transição de status de ${order.status} para ${parsed.status} não é permitida.`,
          "INVALID_STATUS_TRANSITION",
          409
        );
      }
      updateData.status = parsed.status;
    }

    // Se não há dados reais para atualizar, retorna o pedido atual
    if (Object.keys(updateData).length === 0) {
      const currentOrder = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });
      return apiSuccess({ success: true, order: currentOrder });
    }

    // Executa a atualização
    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
      },
    });

    return apiSuccess({ success: true, order: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
