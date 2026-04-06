import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        children: {
          orderBy: [{ order: "asc" }, { name: "asc" }],
          include: {
            _count: { select: { productCategories: true } },
          },
        },
        _count: { select: { productCategories: true } },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const data = await request.json();
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        color: data.color || null,
        icon: data.icon || null,
        order: data.order !== undefined ? parseInt(String(data.order)) : 0,
        active: data.active ?? true,
        parentId: data.parentId || null,
      },
    });
    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 500 });
  }
}
