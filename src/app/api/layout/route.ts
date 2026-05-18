import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, badRequest, handleApiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
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

