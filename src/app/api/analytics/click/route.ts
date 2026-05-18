import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-utils";
import { ClickType } from "@prisma/client";
import { z } from "zod";
import { rateLimiter } from "@/lib/rate-limit";

const clickSchema = z.object({
  path: z.string().min(1).max(1000).transform(val => val.substring(0, 255)),
  label: z.string().max(1000).optional().transform(val => val ? val.substring(0, 100) : undefined),
  type: z.enum(["CTA", "WHATSAPP", "EMAIL", "DOWNLOAD", "OTHER"]),
  target: z.string().max(1000).optional().transform(val => val ? val.substring(0, 255) : undefined),
  referrer: z.string().max(1000).optional().transform(val => val ? val.substring(0, 255) : undefined)
});

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimiter(request, "analytics-click", {
    limit: 60,
    windowMs: 60 * 1000,
  });

  if (!rateLimitResult.success) {
    return apiError(
      "Muitas requisições de analytics. Tente novamente mais tarde.",
      "TOO_MANY_REQUESTS",
      429
    );
  }

  try {
    const body = await request.json();
    const parsed = clickSchema.parse(body);

    const click = await prisma.click.create({
      data: {
        type: parsed.type as ClickType,
        label: parsed.label || null,
        metadata: {
          path: parsed.path,
          target: parsed.target || null,
          referrer: parsed.referrer || null
        }
      }
    });

    return apiSuccess({
      success: true,
      id: click.id
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
