import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      include: {
        _count: { select: { products: true, productCategories: true } },
        children: {
          where: { active: true },
          orderBy: { order: "asc" },
          select: { id: true, name: true, slug: true, image: true },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Erro ao buscar categorias" }, { status: 500 });
  }
}
