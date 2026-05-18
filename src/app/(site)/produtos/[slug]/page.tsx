import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import ProductClient, { Product as ClientProduct, RelatedProduct as ClientRelatedProduct } from "./ProductClient";

import { buildMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    select: {
      name: true,
      shortDescription: true,
      metaTitle: true,
      metaDescription: true,
      metaKeywords: true,
      image: true,
      ogImage: true,
    },
  });

  if (!product) {
    return {
      title: "Produto Não Encontrado",
    };
  }

  return buildMetadata("main", {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || `Detalhes e especificações técnicas de ${product.name}.`,
    keywords: product.metaKeywords || undefined,
    path: `/produtos/${slug}`,
    ogImage: product.ogImage || product.image || undefined,
  });
}

type FullProductPayload = Prisma.ProductGetPayload<{
  include: {
    category: true;
    specifications: true;
  };
}>;

type RelatedProductPayload = Prisma.ProductGetPayload<{
  include: {
    category: true;
  };
}>;

function serializeProduct(product: FullProductPayload): ClientProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    image: product.image || "",
    gallery: product.gallery,
    features: product.features,
    video: product.video,
    catalog: product.catalog,
    warranty: product.warranty,
    priceOriginal: product.priceOriginal ? Number(product.priceOriginal) : null,
    pricePromo: product.pricePromo ? Number(product.pricePromo) : null,
    pixPrice: product.pixPrice ? Number(product.pixPrice) : null,
    installments: product.installments ?? null,
    installmentValue: product.installmentValue ? Number(product.installmentValue) : null,
    stockQuantity: product.stockQuantity ?? 0,
    category: product.category ? {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    } : null,
    specifications: product.specifications.map((spec) => ({
      label: spec.label,
      value: spec.value,
    })),
    brands: [],
  };
}

function serializeRelatedProduct(product: RelatedProductPayload): ClientRelatedProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    image: product.image || "",
    category: product.category ? {
      name: product.category.name,
    } : null,
    priceOriginal: product.priceOriginal ? Number(product.priceOriginal) : null,
    pricePromo: product.pricePromo ? Number(product.pricePromo) : null,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  // Busca do Produto Principal (Sem brands pois não existe essa relação no schema do Prisma)
  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      category: true,
      specifications: {
        orderBy: { label: "asc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Busca de Produtos Relacionados (Mesma Categoria, excluindo o atual, max 3)
  const relatedProductsRaw = product.categoryId
    ? await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          active: true,
        },
        include: {
          category: true,
        },
        take: 3,
        orderBy: { createdAt: "desc" },
      })
    : [];

  // Busca de Configurações Globais (WhatsApp)
  const layoutConfig = await prisma.layoutConfig.findFirst({
    where: { type: "header", active: true },
  });
  
  let initialWhatsappPhone = "5511999999999"; // Fallback
  if (layoutConfig && layoutConfig.content && typeof layoutConfig.content === "object" && !Array.isArray(layoutConfig.content)) {
    const configContent = layoutConfig.content as Record<string, unknown>;
    const phone = typeof configContent.contactPhone === "string" ? configContent.contactPhone : "";
    const digits = phone.replace(/\D/g, "");
    if (digits) {
      initialWhatsappPhone = digits.length >= 12 ? digits : `55${digits}`;
    }
  }

  const serializedProduct = serializeProduct(product);
  const serializedRelated = relatedProductsRaw.map(serializeRelatedProduct);

  return (
    <ProductClient 
      product={serializedProduct} 
      relatedProducts={serializedRelated}
      initialWhatsappPhone={initialWhatsappPhone}
    />
  );
}
