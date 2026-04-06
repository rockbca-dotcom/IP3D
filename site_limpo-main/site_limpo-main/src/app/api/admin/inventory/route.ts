import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// ─────────────────────────────────────────────────────────────────────────────
// /api/admin/inventory
//
// GET  → lista produtos com estoque atual, filtros: baixo/sem estoque
// POST → ajuste manual de estoque (cria InventoryLog + atualiza stockQuantity)
//
// Fonte de dados: modelo Product (stockQuantity) + InventoryLog
// ─────────────────────────────────────────────────────────────────────────────

const LOW_STOCK_THRESHOLD = 5; // padrão para alerta de estoque baixo

// ─── GET — lista produtos com estoque ────────────────────────────────────────
export async function GET(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const page      = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit     = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 30)));
  const search    = (searchParams.get("search") ?? "").trim();
  const filter    = searchParams.get("filter") ?? ""; // "low" | "zero" | ""
  const productId = searchParams.get("productId") ?? "";

  // ── Histórico de um produto específico ──────────────────────────────────────
  if (productId) {
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
    return NextResponse.json({ logs });
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

  return NextResponse.json({
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
}

// ─── POST — ajuste manual de estoque ─────────────────────────────────────────
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await request.json();
  const { productId, change, reason } = body;

  if (!productId) {
    return NextResponse.json({ error: "productId é obrigatório" }, { status: 400 });
  }

  const delta = Number(change);
  if (!Number.isInteger(delta) || delta === 0) {
    return NextResponse.json(
      { error: "change deve ser um inteiro diferente de zero" },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({
    where:  { id: productId },
    select: { id: true, stockQuantity: true, name: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  const newQty = product.stockQuantity + delta;
  if (newQty < 0) {
    return NextResponse.json(
      {
        error: `Ajuste inválido: estoque atual é ${product.stockQuantity}. ` +
               `Redução de ${Math.abs(delta)} resultaria em estoque negativo.`,
      },
      { status: 400 }
    );
  }

  // Transação atômica: atualiza estoque + registra log
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
        reason:      reason?.trim() || null,
        type:        "MANUAL",
        referenceId: null,
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    product: updatedProduct,
    log,
    previousQty: product.stockQuantity,
    newQty,
  });
}
