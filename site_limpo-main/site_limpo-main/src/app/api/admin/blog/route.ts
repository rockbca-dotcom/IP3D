import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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

export async function GET(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const [postsRaw, total, categories, tags] = await Promise.all([
      prisma.blogPost.findMany({
        include: {
          categories: { include: { category: true } },
          postTags: { include: { tag: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blogPost.count(),
      prisma.blogCategory.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { posts: true } } },
      }),
      prisma.blogTag.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { posts: true } } },
      }),
    ]);

    const posts = postsRaw.map(mapPost);

    return NextResponse.json({
      posts,
      categories,
      tags,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching admin blog posts:", error);
    return NextResponse.json({ error: "Erro ao buscar posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const data = await request.json();

    const categoryIds = Array.isArray(data.categoryIds) ? data.categoryIds : [];
    const tagIds = Array.isArray(data.tagIds) ? data.tagIds : [];

    const tagNames = tagIds.length
      ? await prisma.blogTag.findMany({
          where: { id: { in: tagIds } },
          select: { name: true },
        })
      : [];

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug || slugify(data.title),
        excerpt: data.excerpt || null,
        content: data.content || null,
        image: data.image || null,
        cover: data.cover || data.image || null,
        published: Boolean(data.published),
        publishedAt: data.published ? new Date() : null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        metaKeywords: data.metaKeywords || null,
        ogImage: data.ogImage || null,
        tags: tagNames.map((tag) => tag.name),
        categories: categoryIds.length
          ? {
              createMany: {
                data: categoryIds.map((categoryId: string) => ({ categoryId })),
              },
            }
          : undefined,
        postTags: tagIds.length
          ? {
              createMany: {
                data: tagIds.map((tagId: string) => ({ tagId })),
              },
            }
          : undefined,
      },
      include: {
        categories: { include: { category: true } },
        postTags: { include: { tag: true } },
      },
    });

    return NextResponse.json({ success: true, post: mapPost(post) });
  } catch (error) {
    console.error("Error creating admin blog post:", error);
    return NextResponse.json({ error: "Erro ao criar post" }, { status: 500 });
  }
}
