import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PostWithJoins = Record<string, unknown> & {
  categories?: Array<{ category: unknown }>;
  postTags?: Array<{ tag: unknown }>;
};

function mapPost<T extends PostWithJoins>(post: T) {
  return {
    ...post,
    categories: (post.categories || []).map((item) => ({ category: item.category })),
    tags: (post.postTags || []).map((item) => ({ tag: item.tag })),
    postTags: undefined,
  };
}

function orderByParam(order: string | null) {
  switch (order) {
    case "oldest":
      return { publishedAt: "asc" as const };
    case "most-viewed":
      return { views: "desc" as const };
    default:
      return { publishedAt: "desc" as const };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const order = searchParams.get("order");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");

    const postsRaw = await prisma.blogPost.findMany({
      where: {
        published: true,
        ...(category
          ? { categories: { some: { category: { slug: category } } } }
          : {}),
        ...(tag
          ? { postTags: { some: { tag: { slug: tag } } } }
          : {}),
      },
      include: {
        categories: { include: { category: true } },
        postTags: { include: { tag: true } },
      },
      orderBy: [orderByParam(order), { createdAt: "desc" }],
      take: limit,
    });

    const categoryRows = await prisma.blogCategory.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: {
        posts: {
          include: {
            post: {
              select: { published: true },
            },
          },
        },
      },
    });

    const categories = categoryRows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      color: row.color,
      _count: {
        posts: row.posts.filter((item) => item.post.published).length,
      },
    }));

    return NextResponse.json({
      posts: postsRaw.map(mapPost),
      categories,
    });
  } catch (error) {
    console.error("Error fetching public blog list:", error);
    return NextResponse.json({ error: "Erro ao buscar posts" }, { status: 500 });
  }
}
