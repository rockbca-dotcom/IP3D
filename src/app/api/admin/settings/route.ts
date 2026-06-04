import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import { handleApiError, apiSuccess } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

const SETTINGS_KEY = "site-settings-main";

export async function GET() {
  const deny = await requireSuperAdmin();
  if (deny) return deny;

  try {
    const setting = await prisma.setting.findUnique({ where: { key: SETTINGS_KEY } });
    return apiSuccess({ settings: (setting?.value as Record<string, unknown>) || null });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireSuperAdmin();
  if (deny) return deny;

  try {
    const data = await request.json();

    const setting = await prisma.setting.upsert({
      where: { key: SETTINGS_KEY },
      update: { value: data || {} },
      create: { key: SETTINGS_KEY, value: data || {} },
    });

    return apiSuccess({ success: true, settings: setting.value });
  } catch (error) {
    return handleApiError(error);
  }
}

