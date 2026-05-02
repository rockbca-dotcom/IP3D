import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * /categorias/[slug] → redireciona para /produtos?categoria=[slug]
 *
 * O catálogo unificado em /produtos já suporta filtragem por categoria via
 * query-string. Esta rota existe apenas para compatibilidade com os links do
 * mega menu, footer e categorias/page.tsx — evita 404 ao clicar em qualquer
 * link de categoria.
 */
export default async function CategoriaSlugPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/produtos?categoria=${slug}`);
}
