import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/auth";
import {
  getTableColumns,
  isSchemaCompatibilityError,
  quoteIdentifier,
} from "@/lib/prisma-schema-compat";

export const dynamic = "force-dynamic";

const SYSTEM_PAGES: Array<{ name: string; slug: string }> = [
  { name: "Home", slug: "home" },
  { name: "Contato", slug: "contato" },
  { name: "Produtos", slug: "produtos" },
  { name: "Personalizados", slug: "personalizados" },
  { name: "Sobre", slug: "sobre" },
  { name: "Pagina 404", slug: "404" },
];

const SYSTEM_PAGE_SLUGS = new Set(SYSTEM_PAGES.map((page) => page.slug));

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

async function getLegacyPages() {
  const pageColumns = await getTableColumns("Page");

  if (pageColumns.size === 0) {
    return [];
  }

  const selectableColumns = ["id", "name", "slug", "title", "published", "isSystem", "createdAt"]
    .filter((column) => pageColumns.has(column));

  if (!selectableColumns.includes("id") || !selectableColumns.includes("slug")) {
    return [];
  }

  const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `SELECT ${selectableColumns.map(quoteIdentifier).join(", ")} FROM "Page" ORDER BY ${quoteIdentifier(selectableColumns.includes("createdAt") ? "createdAt" : "slug")} ASC`
  );

  let blockCounts = new Map<string, number>();
  const pageBlockColumns = await getTableColumns("PageBlock");
  if (pageBlockColumns.has("pageId")) {
    const blockRows = await prisma.$queryRawUnsafe<Array<{ pageId: string; total: number }>>(
      `SELECT "pageId", COUNT(*)::int AS total FROM "PageBlock" GROUP BY "pageId"`
    );
    blockCounts = new Map(blockRows.map((row) => [row.pageId, Number(row.total || 0)]));
  }

  return rows.map((row) => {
    const slug = String(row.slug || "");
    return {
      id: String(row.id),
      name: typeof row.name === "string" && row.name ? row.name : slug || "Pagina",
      slug,
      title: typeof row.title === "string" ? row.title : null,
      published: typeof row.published === "boolean" ? row.published : true,
      isSystem: typeof row.isSystem === "boolean" ? row.isSystem : SYSTEM_PAGE_SLUGS.has(slug),
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : null,
      _count: {
        blocks: blockCounts.get(String(row.id)) || 0,
      },
    };
  });
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
  const deny = await requireEditor();
  if (deny) return deny;

  try {
    await ensureSystemPages();

    const pages = await prisma.page.findMany({
      orderBy: [{ isSystem: "desc" }, { createdAt: "asc" }],
      include: { _count: { select: { blocks: true } } },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    if (isSchemaCompatibilityError(error)) {
      try {
        const pages = await getLegacyPages();
        return NextResponse.json({ pages });
      } catch (fallbackError) {
        console.error("Legacy page compatibility mode failed:", fallbackError);
      }
    }

    console.error("Error fetching pages:", error);
    return NextResponse.json({ error: "Erro ao buscar paginas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireEditor();
  if (deny) return deny;

  try {
    const data = await request.json();

    if (!data.name || !data.slug) {
      return NextResponse.json({ error: "Nome e slug sao obrigatorios" }, { status: 400 });
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
    return NextResponse.json({ error: "Erro ao criar pagina" }, { status: 500 });
  }
}
