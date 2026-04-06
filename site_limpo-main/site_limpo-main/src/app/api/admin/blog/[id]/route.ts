import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        postTags: { include: { tag: true } },
        comments: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ post: mapPost(post) });
  } catch (error) {
    console.error("Error fetching admin blog post:", error);
    return NextResponse.json({ error: "Erro ao buscar post" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id } = await params;
    const data = await request.json();

    const categoryIds = Array.isArray(data.categoryIds) ? data.categoryIds : [];
    const tagIds = Array.isArray(data.tagIds) ? data.tagIds : [];

    const tagNames = tagIds.length
      ? await prisma.blogTag.findMany({
          where: { id: { in: tagIds } },
          select: { name: true },
        })
      : [];

    await prisma.blogPostCategory.deleteMany({ where: { postId: id } });
    await prisma.blogPostTag.deleteMany({ where: { postId: id } });

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content || null,
        image: data.image || null,
        cover: data.cover || data.image || null,
        published: Boolean(data.published),
        publishedAt: data.published ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : null,
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
    console.error("Error updating admin blog post:", error);
    return NextResponse.json({ error: "Erro ao atualizar post" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const { id } = await params;

    await prisma.blogPost.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting admin blog post:", error);
    return NextResponse.json({ error: "Erro ao excluir post" }, { status: 500 });
  }
}
