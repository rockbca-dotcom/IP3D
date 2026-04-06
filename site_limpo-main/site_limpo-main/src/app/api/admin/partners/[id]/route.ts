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

    const partner = await prisma.partner.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        logo: data.logo || null,
        website: data.website || null,
        priority: Number(data.priority ?? 0),
        active: data.active !== false,
      },
    });

    return NextResponse.json({ success: true, partner });
  } catch (error) {
    console.error("Error updating partner:", error);
    return NextResponse.json({ error: "Erro ao atualizar parceiro" }, { status: 500 });
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
    await prisma.partner.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting partner:", error);
    return NextResponse.json({ error: "Erro ao excluir parceiro" }, { status: 500 });
  }
}
