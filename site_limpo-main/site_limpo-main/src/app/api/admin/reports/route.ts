import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";

    const days = range === "1d" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [views, totalViews, totalClicks, todayViews] = await Promise.all([
      prisma.pageView.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.pageView.count({ where: { createdAt: { gte: startDate } } }),
      prisma.click.count({ where: { createdAt: { gte: startDate } } }),
      prisma.pageView.count({ where: { createdAt: { gte: today } } }),
    ]);

    const countries = await prisma.pageView.groupBy({
      by: ["country"],
      where: { createdAt: { gte: startDate }, country: { not: null } },
    });

    return NextResponse.json({
      views,
      stats: {
        totalViews,
        totalClicks,
        uniqueCountries: countries.length,
        todayViews,
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Erro ao buscar relatórios" }, { status: 500 });
  }
}
