import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleApiError } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get("sectionId");

    if (sectionId) {
      const section = await prisma.homeSection.findFirst({
        where: { sectionId, active: true },
      });
      return apiSuccess({ section });
    }

    const sections = await prisma.homeSection.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return apiSuccess({ sections });
  } catch (error) {
    return handleApiError(error);
  }
}

