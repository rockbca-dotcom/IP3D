import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ brands });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json({ error: "Erro ao buscar marcas" }, { status: 500 });
  }
}
