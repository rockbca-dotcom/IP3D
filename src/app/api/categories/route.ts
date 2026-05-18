import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        color: true,
        icon: true,
        order: true,
        parentId: true,
        _count: {
          select: {
            products: true,
            productCategories: true,
          },
        },
        children: {
          where: { active: true },
          orderBy: [{ order: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            parentId: true,
          },
        },
      },
    });

    return apiSuccess({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}
