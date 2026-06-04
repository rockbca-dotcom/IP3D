import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { apiSuccess, handleApiError, badRequest, notFound } from "@/lib/api-utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// /api/admin/inventory
//
// GET  → lista produtos com estoque atual, filtros: baixo/sem estoque ou histórico de logs
// POST → ajuste manual de estoque com controle transacional e Zod
// ─────────────────────────────────────────────────────────────────────────────

const LOW_STOCK_THRESHOLD = 5; // padrão para alerta de estoque baixo

// Schema de validação para movimentações de estoque
const inventoryAdjustmentSchema = z.object({
  productId: z.string().min(1, "ID do produto é obrigatório"),
  action: z.enum(
    [
      "ENTRY", "entry", "entrada",
      "EXIT", "exit", "saída", "saida",
      "CORRECTION", "correction", "correção", "correcao",
      "MANUAL", "manual", "ajuste"
    ],
    { errorMap: () => ({ message: "Operação inválida" }) }
  ),
  quantity: z.number({ required_error: "Quantidade é obrigatória" }),
  reason: z.string().min(1, "Motivo é obrigatório"),
  reference: z.string().optional().nullable(),
});

// ─── GET — lista produtos com estoque ────────────────────────────────────────
export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const page      = Math.max(1, Number(searchParams.get("page")  ?? 1));
    const limit     = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 30)));
    const search    = (searchParams.get("search") ?? "").trim();
    const filter    = searchParams.get("filter") ?? ""; // "low" | "zero" | ""
    const productId = searchParams.get("productId") ?? "";

    // ── Histórico de um produto específico com cálculo retrospectivo ──────────
    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, stockQuantity: true },
      });

      if (!product) {
        return notFound("Produto não encontrado");
      }

      const logs = await prisma.inventoryLog.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id:          true,
          change:      true,
          reason:      true,
          type:        true,
          referenceId: true,
          createdAt:   true,
        },
      });

      // Calcular previousStock e newStock retrospectivamente a partir do estoque atual
      let currentStock = product.stockQuantity;
      const enrichedLogs = logs.map((log) => {
        const newStock = currentStock;
        const previousStock = currentStock - log.change;
        currentStock = previousStock; // atualiza para a próxima iteração (retrocedendo no tempo)
        return {
          id:          log.id,
          productId,
          change:      log.change,
          quantity:    Math.abs(log.change),
          reason:      log.reason,
          type:        log.type,
          referenceId: log.referenceId,
          reference:   log.referenceId,
          previousStock,
          newStock,
          createdAt:   log.createdAt,
        };
      });

      return apiSuccess({ logs: enrichedLogs });
    }

    // ── Lista de produtos com filtro ────────────────────────────────────────────
    const where: Prisma.ProductWhereInput = {
      active: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku:  { contains: search, mode: "insensitive" } },
      ];
    }

    if (filter === "zero") {
      where.stockQuantity = { equals: 0 };
    } else if (filter === "low") {
      where.stockQuantity = { gt: 0, lte: LOW_STOCK_THRESHOLD };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id:            true,
          name:          true,
          slug:          true,
          sku:           true,
          image:         true,
          stockQuantity: true,
          active:        true,
          category:      { select: { name: true } },
        },
        orderBy: [{ stockQuantity: "asc" }, { name: "asc" }],
        skip:  (page - 1) * limit,
        take:  limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Contadores para os badges do filtro
    const [zeroCount, lowCount] = await Promise.all([
      prisma.product.count({ where: { active: true, stockQuantity: { equals: 0 } } }),
      prisma.product.count({
        where: { active: true, stockQuantity: { gt: 0, lte: LOW_STOCK_THRESHOLD } },
      }),
    ]);

    return apiSuccess({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        zeroStock: zeroCount,
        lowStock:  lowCount,
        threshold: LOW_STOCK_THRESHOLD,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// ─── POST — ajuste de estoque transacional e validado ─────────────────────────
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    
    // 1. Validação do schema com Zod
    const validation = inventoryAdjustmentSchema.safeParse(body);
    if (!validation.success) {
      return badRequest("Payload inválido", validation.error.format());
    }

    const { productId, action, quantity, reason, reference } = validation.data;

    // 2. Buscar o produto no banco
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, stockQuantity: true },
    });

    if (!product) {
      return notFound("Produto não encontrado");
    }

    // 3. Determinar o delta e validar baseando-se na ação
    let delta = 0;
    let logType: "MANUAL" | "ADJUSTMENT" = "ADJUSTMENT";
    const normAction = action.toUpperCase();

    if (normAction === "ENTRY" || normAction === "ENTRADA") {
      if (quantity <= 0) {
        return badRequest("Quantidade para entrada deve ser positiva");
      }
      delta = quantity;
    } else if (normAction === "EXIT" || normAction === "SAÍDA" || normAction === "SAIDA") {
      if (quantity <= 0) {
        return badRequest("Quantidade para saída deve ser positiva");
      }
      if (quantity > product.stockQuantity) {
        return badRequest(
          `Ajuste inválido: estoque atual é ${product.stockQuantity}. Redução de ${quantity} resultaria em estoque negativo.`
        );
      }
      delta = -quantity;
    } else if (normAction === "CORRECTION" || normAction === "CORREÇÃO" || normAction === "CORRECAO") {
      if (quantity < 0) {
        return badRequest("Quantidade de correção não pode ser negativa");
      }
      delta = quantity - product.stockQuantity;
    } else if (normAction === "MANUAL" || normAction === "AJUSTE") {
      if (quantity === 0) {
        return badRequest("Quantidade de ajuste manual deve ser diferente de zero");
      }
      delta = quantity;
      logType = "MANUAL";
    } else {
      return badRequest("Operação inválida");
    }

    const newQty = product.stockQuantity + delta;
    if (newQty < 0) {
      return badRequest(`Ajuste resultaria em estoque negativo (${newQty})`);
    }

    // 4. Executar transação atômica
    const [updatedProduct, log] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data:  { stockQuantity: newQty },
        select: { id: true, name: true, stockQuantity: true },
      }),
      prisma.inventoryLog.create({
        data: {
          productId,
          change:      delta,
          reason:      reason.trim(),
          type:        logType,
          referenceId: reference?.trim() || null,
        },
      }),
    ]);

    // 5. Retornar resposta padronizada com dados enriquecidos
    return apiSuccess({
      success: true,
      product: updatedProduct,
      log: {
        ...log,
        quantity: Math.abs(delta),
        previousStock: product.stockQuantity,
        newStock: newQty,
        reference: log.referenceId,
      },
      previousQty: product.stockQuantity,
      newQty,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
