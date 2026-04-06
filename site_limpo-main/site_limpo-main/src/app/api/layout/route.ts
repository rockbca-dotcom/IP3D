import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const variant = searchParams.get("variant") || "main";

    if (!type) {
      return NextResponse.json({ error: "type é obrigatório" }, { status: 400 });
    }

    const config = await prisma.layoutConfig.findUnique({
      where: {
        type_variant: {
          type,
          variant,
        },
      },
    });

    return NextResponse.json({ config });
  } catch (error) {
    console.error("Error fetching public layout config:", error);
    return NextResponse.json({ error: "Erro ao buscar configuração de layout" }, { status: 500 });
  }
}
