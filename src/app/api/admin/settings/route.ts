import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const SETTINGS_KEY = "site-settings-main";

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const setting = await prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
    return NextResponse.json({ settings: (setting?.value as Record<string, unknown>) || null });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const data = await request.json();

    const setting = await prisma.setting.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: data || {} },
      create: { key: SETTINGS_KEY, value: data || {} },
    });

    return NextResponse.json({ success: true, settings: setting.value });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Erro ao salvar configurações" }, { status: 500 });
  }
}
