import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.partner.count(),
    ]);

    return NextResponse.json({
      partners,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json({ error: "Erro ao buscar parceiros" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const data = await request.json();

    const partner = await prisma.partner.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        logo: data.logo || null,
        website: data.website || null,
        priority: Number(data.priority ?? 0),
        active: data.active !== false,
      },
    });

    return NextResponse.json({ success: true, partner });
  } catch (error) {
    console.error("Error creating partner:", error);
    return NextResponse.json({ error: "Erro ao criar parceiro" }, { status: 500 });
  }
}
