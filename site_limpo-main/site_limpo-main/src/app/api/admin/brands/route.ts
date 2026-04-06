import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    if (all) {
      const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
      return NextResponse.json({ brands });
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.brand.count(),
    ]);

    return NextResponse.json({
      brands,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json({ error: "Erro ao buscar marcas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const data = await request.json();
    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        logo: data.logo,
        highlights: data.highlights || [],
        image: data.image,
      },
    });
    return NextResponse.json({ success: true, brand });
  } catch (error) {
    console.error("Error creating brand:", error);
    return NextResponse.json({ error: "Erro ao criar marca" }, { status: 500 });
  }
}
