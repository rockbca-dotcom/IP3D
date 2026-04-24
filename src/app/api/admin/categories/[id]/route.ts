import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: { parent: true, children: true },
    });

    if (!category) {
      return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json({ error: "Erro ao buscar categoria" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id } = await params;
    const data = await request.json();

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description !== undefined ? (data.description || null) : undefined,
        image: data.image !== undefined ? (data.image || null) : undefined,
        color: data.color !== undefined ? (data.color || null) : undefined,
        icon: data.icon !== undefined ? (data.icon || null) : undefined,
        order: data.order !== undefined ? parseInt(String(data.order)) : undefined,
        active: data.active !== undefined ? data.active : undefined,
        // Allow explicit null to unset parent; omit field if not provided
        ...(data.parentId !== undefined && { parentId: data.parentId || null }),
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ error: "Erro ao atualizar categoria" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id } = await params;

    // Protect against deletion if category has products
    const [productCatCount, directProductCount, childrenCount] = await Promise.all([
      prisma.productCategory.count({ where: { categoryId: id } }),
      prisma.product.count({ where: { categoryId: id } }),
      prisma.category.count({ where: { parentId: id } }),
    ]);

    if (productCatCount + directProductCount > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir uma categoria que possui produtos vinculados. Remova os produtos primeiro ou inative a categoria." },
        { status: 409 }
      );
    }

    if (childrenCount > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir uma categoria que possui subcategorias. Exclua as subcategorias primeiro." },
        { status: 409 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ error: "Erro ao excluir categoria" }, { status: 500 });
  }
}
