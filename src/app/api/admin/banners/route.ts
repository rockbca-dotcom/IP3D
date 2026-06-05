import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { getTableColumns, isSchemaCompatibilityError, quoteIdentifier } from "@/lib/prisma-schema-compat";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bannerSchema = z.object({
  badge: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  title: z.string().min(1, "O titulo do banner e obrigatorio"),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  video: z.string().nullable().optional(),
  button1Text: z.string().nullable().optional(),
  button1Link: z.string().nullable().optional(),
  button1Color: z.string().nullable().optional(),
  button1Rounded: z.boolean().optional(),
  button2Text: z.string().nullable().optional(),
  button2Link: z.string().nullable().optional(),
  button2Color: z.string().nullable().optional(),
  button2Rounded: z.boolean().optional(),
  order: z.number().int().nonnegative().optional(),
  active: z.boolean().optional(),
  crosshairPos: z.any().nullable().optional(),
  techLabels: z.any().nullable().optional(),
});

async function getLegacyBanners() {
  const bannerColumns = await getTableColumns("Banner");

  if (bannerColumns.size === 0) {
    return [];
  }

  const selectableColumns = [
    "id",
    "badge",
    "subtitle",
    "title",
    "description",
    "image",
    "video",
    "button1Text",
    "button1Link",
    "button1Color",
    "button1Rounded",
    "button2Text",
    "button2Link",
    "button2Color",
    "button2Rounded",
    "order",
    "active",
    "crosshairPos",
    "techLabels",
    "createdAt",
  ].filter((column) => bannerColumns.has(column));

  if (!selectableColumns.includes("id") || !selectableColumns.includes("title")) {
    return [];
  }

  const orderColumn = selectableColumns.includes("order")
    ? quoteIdentifier("order")
    : selectableColumns.includes("createdAt")
    ? quoteIdentifier("createdAt")
    : quoteIdentifier("title");

  const rows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
    `SELECT ${selectableColumns.map(quoteIdentifier).join(", ")} FROM "Banner" ORDER BY ${orderColumn} ASC`
  );

  return rows.map((row, index) => ({
    id: String(row.id),
    badge: typeof row.badge === "string" ? row.badge : null,
    subtitle: typeof row.subtitle === "string" ? row.subtitle : null,
    title: String(row.title || `Banner ${index + 1}`),
    description: typeof row.description === "string" ? row.description : null,
    image: typeof row.image === "string" ? row.image : null,
    video: typeof row.video === "string" ? row.video : null,
    button1Text: typeof row.button1Text === "string" ? row.button1Text : null,
    button1Link: typeof row.button1Link === "string" ? row.button1Link : null,
    button1Color: typeof row.button1Color === "string" ? row.button1Color : null,
    button1Rounded: typeof row.button1Rounded === "boolean" ? row.button1Rounded : false,
    button2Text: typeof row.button2Text === "string" ? row.button2Text : null,
    button2Link: typeof row.button2Link === "string" ? row.button2Link : null,
    button2Color: typeof row.button2Color === "string" ? row.button2Color : null,
    button2Rounded: typeof row.button2Rounded === "boolean" ? row.button2Rounded : false,
    order: typeof row.order === "number" ? row.order : index,
    active: typeof row.active === "boolean" ? row.active : true,
    crosshairPos: row.crosshairPos ?? null,
    techLabels: row.techLabels ?? null,
  }));
}

export async function GET() {
  const deny = await requireEditor();
  if (deny) return deny;

  try {
    const banners = await prisma.banner.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return apiSuccess({ banners });
  } catch (error) {
    if (isSchemaCompatibilityError(error)) {
      try {
        const banners = await getLegacyBanners();
        return apiSuccess({ banners });
      } catch (fallbackError) {
        return handleApiError(fallbackError);
      }
    }

    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  const deny = await requireEditor();
  if (deny) return deny;

  try {
    const rawData = await request.json();
    const data = bannerSchema.parse(rawData);

    const banner = await prisma.banner.create({
      data: {
        badge: data.badge || null,
        subtitle: data.subtitle || null,
        title: data.title,
        description: data.description || null,
        image: data.image || null,
        video: data.video || null,
        button1Text: data.button1Text || null,
        button1Link: data.button1Link || null,
        button1Color: data.button1Color || null,
        button1Rounded: Boolean(data.button1Rounded),
        button2Text: data.button2Text || null,
        button2Link: data.button2Link || null,
        button2Color: data.button2Color || null,
        button2Rounded: Boolean(data.button2Rounded),
        order: Number(data.order ?? 0),
        active: data.active !== false,
        crosshairPos: data.crosshairPos || null,
        techLabels: data.techLabels || null,
      },
    });

    return apiSuccess({ success: true, banner }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
