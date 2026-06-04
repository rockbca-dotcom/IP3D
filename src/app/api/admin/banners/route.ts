import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireEditor } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api-utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bannerSchema = z.object({
  badge: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  title: z.string().min(1, "O título do banner é obrigatório"),
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

export async function GET() {
  const deny = await requireEditor();
  if (deny) return deny;

  try {
    const banners = await prisma.banner.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    });

    return apiSuccess({ banners });
  } catch (error) {
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

