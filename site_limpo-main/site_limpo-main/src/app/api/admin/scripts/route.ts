import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const scripts = await prisma.script.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ scripts });
  } catch (error) {
    console.error("Error fetching admin scripts:", error);
    return NextResponse.json({ error: "Erro ao buscar scripts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const data = await request.json();

    const script = await prisma.script.create({
      data: {
        name: data.name,
        type: data.type || "CUSTOM",
        position: data.position || "HEAD",
        code: data.code,
        active: data.active !== false,
        site: data.site || "BOTH",
        order: Number(data.order ?? 0),
      },
    });

    return NextResponse.json({ success: true, script });
  } catch (error) {
    console.error("Error creating admin script:", error);
    return NextResponse.json({ error: "Erro ao criar script" }, { status: 500 });
  }
}
