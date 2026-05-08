import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SETTINGS_KEY = "site-settings-main";

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
    return NextResponse.json({ settings: (setting?.value as Record<string, unknown>) || null });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 });
  }
}
