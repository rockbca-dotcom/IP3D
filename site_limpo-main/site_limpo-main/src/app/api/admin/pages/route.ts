import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const SYSTEM_PAGES: Array<{ name: string; slug: string }> = [
  { name: "Home", slug: "home" },
  { name: "Contato", slug: "contato" },
  { name: "Manutenção", slug: "manutencao" },
  { name: "Produtos", slug: "produtos" },
  { name: "Personalizados", slug: "personalizados" },
  { name: "Marcas", slug: "marcas" },
  { name: "Sobre", slug: "sobre" },
  { name: "FAQ", slug: "faq" },
  { name: "Garantia", slug: "garantia" },
  { name: "Blog", slug: "blog" },
  { name: "Página 404", slug: "404" },
];

async function ensureSystemPages() {
  await Promise.all(
    SYSTEM_PAGES.map((page) =>
      prisma.page.upsert({
        where: { slug: page.slug },
        update: { isSystem: true },
        create: {
          name: page.name,
          slug: page.slug,
          title: page.name,
          published: true,
          isSystem: true,
        },
      })
    )
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    await ensureSystemPages();

    const pages = await prisma.page.findMany({
      orderBy: [{ isSystem: "desc" }, { createdAt: "asc" }],
      include: { _count: { select: { blocks: true } } },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json({ error: "Erro ao buscar páginas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireAdmin();
  if (deny) return deny;

  try {
    const data = await request.json();

    if (!data.name || !data.slug) {
      return NextResponse.json({ error: "Nome e slug são obrigatórios" }, { status: 400 });
    }

    const page = await prisma.page.create({
      data: {
        name: data.name,
        slug: slugify(data.slug),
        title: data.title || data.name,
        description: data.description || null,
        published: false,
        isSystem: false,
      },
    });

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json({ error: "Erro ao criar página" }, { status: 500 });
  }
}
