import { prisma } from "@/lib/prisma";

interface PageBlock {
  id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  active: boolean;
}

export async function getPageData(slug: string): Promise<PageBlock[]> {
  try {
    const page = await prisma.page.findFirst({
      where: { slug, published: true },
      include: {
        blocks: {
          where: { active: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return (page?.blocks || []).map((block) => ({
      id: block.id,
      type: block.type,
      content: (block.content && typeof block.content === "object" && !Array.isArray(block.content))
        ? (block.content as Record<string, unknown>)
        : {},
      order: block.order,
      active: block.active,
    }));
  } catch (error) {
    console.error(`Failed to load page data for slug \"${slug}\":`, error);
    return [];
  }
}
