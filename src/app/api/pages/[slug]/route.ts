import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    let page = null;

    try {
      page = await prisma.page.findFirst({
        where: { slug, published: true },
        include: {
          blocks: {
            where: { active: true },
            orderBy: { order: "asc" },
          },
        },
      });
    } catch (error) {
      console.error(`Error fetching page by slug "${slug}":`, error);
    }

    if (!page) {
      return NextResponse.json({ page: null }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error) {
    console.error("Error fetching page by slug:", error);
    return NextResponse.json({ error: "Erro ao buscar página" }, { status: 500 });
  }
}
