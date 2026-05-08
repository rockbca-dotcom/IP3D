import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

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
    console.error("Error fetching admin layout config:", error);
    return NextResponse.json({ error: "Erro ao buscar configuração de layout" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const data = await request.json();

    if (!data.type || !data.variant) {
      return NextResponse.json({ error: "type e variant são obrigatórios" }, { status: 400 });
    }

    const config = await prisma.layoutConfig.upsert({
      where: {
        type_variant: {
          type: data.type,
          variant: data.variant,
        },
      },
      update: {
        content: data.content || {},
      },
      create: {
        type: data.type,
        variant: data.variant,
        content: data.content || {},
      },
    });

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("Error saving admin layout config:", error);
    return NextResponse.json({ error: "Erro ao salvar configuração de layout" }, { status: 500 });
  }
}
