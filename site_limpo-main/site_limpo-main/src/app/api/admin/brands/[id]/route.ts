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
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) {
      return NextResponse.json({ error: "Marca não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ brand });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar marca" }, { status: 500 });
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
    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        logo: data.logo,
        highlights: data.highlights || [],
        image: data.image,
        active: data.active,
      },
    });
    return NextResponse.json({ success: true, brand });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar marca" }, { status: 500 });
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
    await prisma.brand.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar marca" }, { status: 500 });
  }
}
