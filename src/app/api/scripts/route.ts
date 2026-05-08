import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const site = searchParams.get("site") || "MAIN";

    const scripts = await prisma.script.findMany({
      where: {
        active: true,
        OR: [
          { site: "BOTH" },
          { site: site === "MAIN" ? "MAIN" : "BOTH" },
        ],
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ scripts });
  } catch (error) {
    console.error("Error fetching public scripts:", error);
    return NextResponse.json({ error: "Erro ao buscar scripts" }, { status: 500 });
  }
}
