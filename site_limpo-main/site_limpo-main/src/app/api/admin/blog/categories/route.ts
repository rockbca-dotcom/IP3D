import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const data = await request.json();

    const category = await prisma.blogCategory.create({
      data: {
        name: data.name,
        slug: data.slug || slugify(data.name),
        description: data.description || null,
        color: data.color || null,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("Error creating blog category:", error);
    return NextResponse.json({ error: "Erro ao criar categoria" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });
    }

    const category = await prisma.blogCategory.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug || slugify(data.name),
        description: data.description || null,
        color: data.color || null,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("Error updating blog category:", error);
    return NextResponse.json({ error: "Erro ao atualizar categoria" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });
    }

    await prisma.blogCategory.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog category:", error);
    return NextResponse.json({ error: "Erro ao excluir categoria" }, { status: 500 });
  }
}
