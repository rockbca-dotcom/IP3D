import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/auth";
import { apiSuccess, badRequest, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const layoutConfigSchema = z.object({
  type: z.string().min(1, "type é obrigatório"),
  variant: z.string().min(1, "variant é obrigatória"),
  content: z.any().nullable().optional(),
});

export async function GET(request: NextRequest) {
  const deny = await requireEditor();
  if (deny) return deny;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const variant = searchParams.get("variant") || "main";

    if (!type) {
      return badRequest("type é obrigatório");
    }

    const config = await prisma.layoutConfig.findUnique({
      where: {
        type_variant: {
          type,
          variant,
        },
      },
    });

    return apiSuccess({ config });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  const deny = await requireEditor();
  if (deny) return deny;

  try {
    const rawData = await request.json();
    const data = layoutConfigSchema.parse(rawData);

    const config = await prisma.layoutConfig.upsert({
      where: {
        type_variant: {
          type: data.type,
          variant: data.variant,
        },
      },
      update: {
        content: data.content || {},
      },
      create: {
        type: data.type,
        variant: data.variant,
        content: data.content || {},
      },
    });

    return apiSuccess({ success: true, config });
  } catch (error) {
    return handleApiError(error);
  }
}

