import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      let page = null;

      try {
        page = await prisma.page.findFirst({
          where: { slug, published: true },
          include: { blocks: { where: { active: true }, orderBy: { order: "asc" } } },
        });
      } catch (error) {
        console.error(`Error fetching public page by slug "${slug}":`, error);
      }

      return NextResponse.json({ page });
    }

    const pages = await prisma.page.findMany({
      where: { published: true },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        title: true,
        description: true,
      },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Error fetching public pages:", error);
    return NextResponse.json({ error: "Erro ao buscar páginas" }, { status: 500 });
  }
}
