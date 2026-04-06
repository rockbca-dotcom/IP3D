import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("sectionId");

    if (sectionId) {
      const section = await prisma.homeSection.findFirst({
        where: { sectionId, active: true },
      });
      return NextResponse.json({ section });
    }

    const sections = await prisma.homeSection.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("Error fetching public home sections:", error);
    return NextResponse.json({ error: "Erro ao buscar seções da home" }, { status: 500 });
  }
}
