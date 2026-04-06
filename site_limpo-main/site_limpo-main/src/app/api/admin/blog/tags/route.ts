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
    const tags = await prisma.blogTag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching blog tags:", error);
    return NextResponse.json({ error: "Erro ao buscar tags" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const data = await request.json();

    const tag = await prisma.blogTag.create({
      data: {
        name: data.name,
        slug: data.slug || slugify(data.name),
      },
    });

    return NextResponse.json({ success: true, tag });
  } catch (error) {
    console.error("Error creating blog tag:", error);
    return NextResponse.json({ error: "Erro ao criar tag" }, { status: 500 });
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

    const tag = await prisma.blogTag.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug || slugify(data.name),
      },
    });

    return NextResponse.json({ success: true, tag });
  } catch (error) {
    console.error("Error updating blog tag:", error);
    return NextResponse.json({ error: "Erro ao atualizar tag" }, { status: 500 });
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

    await prisma.blogTag.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog tag:", error);
    return NextResponse.json({ error: "Erro ao excluir tag" }, { status: 500 });
  }
}
