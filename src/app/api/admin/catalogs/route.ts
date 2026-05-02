import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    const [catalogs, total] = await Promise.all([
      prisma.catalog.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.catalog.count(),
    ]);

    return NextResponse.json({
      catalogs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching catalogs:", error);
    return NextResponse.json({ error: "Erro ao buscar catálogos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const data = await request.json();

    const catalog = await prisma.catalog.create({
      data: {
        name: data.name,
        description: data.description || null,
        file: data.file,
        thumbnail: data.thumbnail || null,
        active: data.active !== false,
      },
    });

    return NextResponse.json({ success: true, catalog });
  } catch (error) {
    console.error("Error creating catalog:", error);
    return NextResponse.json({ error: "Erro ao criar catálogo" }, { status: 500 });
  }
}
