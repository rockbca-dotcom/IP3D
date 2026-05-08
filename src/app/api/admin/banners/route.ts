import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const banners = await prisma.banner.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error("Error fetching admin banners:", error);
    return NextResponse.json({ error: "Erro ao buscar banners" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const data = await request.json();

    const banner = await prisma.banner.create({
      data: {
        badge: data.badge || null,
        subtitle: data.subtitle || null,
        title: data.title,
        description: data.description || null,
        image: data.image || null,
        video: data.video || null,
        button1Text: data.button1Text || null,
        button1Link: data.button1Link || null,
        button1Color: data.button1Color || null,
        button1Rounded: Boolean(data.button1Rounded),
        button2Text: data.button2Text || null,
        button2Link: data.button2Link || null,
        button2Color: data.button2Color || null,
        button2Rounded: Boolean(data.button2Rounded),
        order: Number(data.order ?? 0),
        active: data.active !== false,
        crosshairPos: data.crosshairPos || null,
        techLabels: data.techLabels || null,
      },
    });

    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error("Error creating admin banner:", error);
    return NextResponse.json({ error: "Erro ao criar banner" }, { status: 500 });
  }
}
