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

    const script = await prisma.script.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        position: data.position,
        code: data.code,
        active: data.active !== false,
        site: data.site || "BOTH",
        order: Number(data.order ?? 0),
      },
    });

    return NextResponse.json({ success: true, script });
  } catch (error) {
    console.error("Error updating admin script:", error);
    return NextResponse.json({ error: "Erro ao atualizar script" }, { status: 500 });
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
    await prisma.script.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting admin script:", error);
    return NextResponse.json({ error: "Erro ao excluir script" }, { status: 500 });
  }
}
