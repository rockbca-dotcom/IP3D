import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function normalizeBlocks(blocks: unknown) {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((block, index) => {
    const item = (block && typeof block === "object") ? (block as Record<string, unknown>) : {};
    return {
      type: String(item.type || "text"),
      content: (item.content && typeof item.content === "object") ? item.content : {},
      order: typeof item.order === "number" ? item.order : index,
      active: item.active !== false,
    };
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id } = await params;

    const page = await prisma.page.findUnique({
      where: { id },
      include: { blocks: { orderBy: { order: "asc" } } },
    });

    if (!page) {
      return NextResponse.json({ error: "Página não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error("Error fetching page:", error);
    return NextResponse.json({ error: "Erro ao buscar página" }, { status: 500 });
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

    const updated = await prisma.page.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        title: data.title ?? null,
        description: data.description ?? null,
        published: Boolean(data.published),
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        metaKeywords: data.metaKeywords ?? null,
        ogImage: data.ogImage ?? null,
      },
    });

    if (Array.isArray(data.blocks)) {
      const blocks = normalizeBlocks(data.blocks);

      await prisma.pageBlock.deleteMany({ where: { pageId: id } });

      if (blocks.length > 0) {
        await prisma.pageBlock.createMany({
          data: blocks.map((block, index) => ({
            pageId: id,
            type: block.type,
            content: block.content,
            order: typeof block.order === "number" ? block.order : index,
            active: block.active,
          })),
        });
      }
    }

    const page = await prisma.page.findUnique({
      where: { id },
      include: { blocks: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ success: true, page: page || updated });
  } catch (error) {
    console.error("Error updating page:", error);
    return NextResponse.json({ error: "Erro ao atualizar página" }, { status: 500 });
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

    const page = await prisma.page.findUnique({ where: { id } });
    if (!page) {
      return NextResponse.json({ error: "Página não encontrada" }, { status: 404 });
    }

    if (page.isSystem) {
      return NextResponse.json({ error: "Não é permitido excluir página do sistema" }, { status: 400 });
    }

    await prisma.page.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page:", error);
    return NextResponse.json({ error: "Erro ao excluir página" }, { status: 500 });
  }
}
