import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import { handleApiError, apiSuccess } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

// Schema de validação para scripts
const scriptSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["GOOGLE_ANALYTICS", "FACEBOOK_PIXEL", "CUSTOM"]).default("CUSTOM"),
  position: z.enum(["HEAD", "BODY_START", "BODY_END"]).default("HEAD"),
  code: z.string().min(1, "Código do script é obrigatório"),
  active: z.boolean().default(true),
  site: z.enum(["CATALOG", "STORE", "BOTH"]).default("BOTH"),
  order: z.number().int().default(0),
});

export async function GET() {
  const deny = await requireSuperAdmin();
  if (deny) return deny;

  try {
    const scripts = await prisma.script.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return apiSuccess({ scripts });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireSuperAdmin();
  if (deny) return deny;

  try {
    const json = await request.json();
    const data = scriptSchema.parse(json);

    const script = await prisma.script.create({
      data,
    });

    return apiSuccess({ success: true, script }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

