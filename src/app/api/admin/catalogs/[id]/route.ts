import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id } = await params;
    const data = await request.json();

    const catalog = await prisma.catalog.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        file: data.file,
        thumbnail: data.thumbnail || null,
        active: data.active !== false,
      },
    });

    return NextResponse.json({ success: true, catalog });
  } catch (error) {
    console.error("Error updating catalog:", error);
    return NextResponse.json({ error: "Erro ao atualizar catálogo" }, { status: 500 });
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

    await prisma.catalog.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting catalog:", error);
    return NextResponse.json({ error: "Erro ao excluir catálogo" }, { status: 500 });
  }
}
