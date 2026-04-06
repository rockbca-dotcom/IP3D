import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categoryRows = await prisma.blogCategory.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: {
        posts: {
          include: {
            post: {
              select: { published: true },
            },
          },
        },
      },
    });

    const categories = categoryRows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      color: row.color,
      _count: {
        posts: row.posts.filter((item) => item.post.published).length,
      },
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching public blog categories:", error);
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 });
  }
}
