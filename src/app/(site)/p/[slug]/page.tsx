import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { buildMetadata } from "@/lib/seo";
import { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const page = await prisma.page.findFirst({
    where: { slug, published: true },
    select: {
      name: true,
      title: true,
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true,
      ogImage: true,
    },
  });

  if (!page) {
    return {
      title: "Página Não Encontrada",
    };
  }

  return buildMetadata("main", {
    title: page.metaTitle || page.title || page.name,
    description: page.metaDescription || undefined,
    keywords: page.metaKeywords || undefined,
    path: `/p/${slug}`,
    ogImage: page.ogImage || undefined,
  });
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;

  const page = await prisma.page.findFirst({
    where: { slug, published: true },
    include: {
      blocks: {
        where: { active: true },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!page) {
    notFound();
  }

  // Serializa os blocos JSON do Prisma para a estrutura estrita esperada pelo BlockRenderer
  const serializedBlocks = page.blocks.map((block) => ({
    id: block.id,
    type: block.type,
    content: block.content as Record<string, unknown>,
    order: block.order,
    active: block.active,
  }));

  return (
    <BlockRenderer blocks={serializedBlocks} />
  );
}
