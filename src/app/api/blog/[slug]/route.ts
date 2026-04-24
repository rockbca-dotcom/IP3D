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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const existing = await prisma.blogPost.findFirst({
      where: { slug, published: true },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    await prisma.blogPost.update({
      where: { id: existing.id },
      data: { views: { increment: 1 } },
    });

    const postRaw = await prisma.blogPost.findUnique({
      where: { id: existing.id },
      include: {
        categories: { include: { category: true } },
        postTags: { include: { tag: true } },
        comments: {
          where: { approved: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!postRaw) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    const categoryIds = postRaw.categories.map((item) => item.categoryId);

    const relatedRaw = await prisma.blogPost.findMany({
      where: {
        published: true,
        id: { not: postRaw.id },
        ...(categoryIds.length
          ? { categories: { some: { categoryId: { in: categoryIds } } } }
          : {}),
      },
      include: {
        categories: { include: { category: true } },
        postTags: { include: { tag: true } },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
    });

    return NextResponse.json({
      post: mapPost(postRaw),
      relatedPosts: relatedRaw.map(mapPost),
    });
  } catch (error) {
    console.error("Error fetching public blog post:", error);
    return NextResponse.json({ error: "Erro ao buscar post" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const data = await request.json();

    if (!data.name || !data.email || !data.content) {
      return NextResponse.json({ error: "Nome, e-mail e comentário são obrigatórios" }, { status: 400 });
    }

    const post = await prisma.blogPost.findFirst({
      where: { slug, published: true },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }

    const comment = await prisma.blogComment.create({
      data: {
        postId: post.id,
        name: data.name,
        email: data.email,
        content: data.content,
        approved: false,
      },
    });

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error("Error creating blog comment:", error);
    return NextResponse.json({ error: "Erro ao enviar comentário" }, { status: 500 });
  }
}
