import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-utils";
import { z } from "zod";
import { rateLimiter } from "@/lib/rate-limit";

const pageviewSchema = z.object({
  path: z.string().min(1).max(1000).transform(val => val.substring(0, 255)),
  referrer: z.string().max(1000).optional().transform(val => val ? val.substring(0, 255) : undefined),
  userAgent: z.string().max(1000).optional().transform(val => val ? val.substring(0, 255) : undefined),
  timestamp: z.string().optional()
});

function anonymizeIp(ip: string | null): string | null {
  if (!ip || ip === "unknown") return "0.0.0.0";
  // Trata IPv4
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`; // Mascara ultimo octeto
    }
  }
  // Trata IPv6
  if (ip.includes(":")) {
    const parts = ip.split(":");
    if (parts.length >= 3) {
      return `${parts[0]}:${parts[1]}:${parts[2]}::0`; // Mascara ultimos 80 bits
    }
  }
  return "0.0.0.0";
}

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimiter(request, "analytics-pageview", {
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
    const parsed = pageviewSchema.parse(body);

    const userAgent = parsed.userAgent || request.headers.get("user-agent") || "";
    
    // Ignora robôs e crawlers de busca de forma silenciosa e amigável
    if (/bot|crawler|spider|lighthouse|mediapartners|google|bing|yandex|baidu/i.test(userAgent)) {
      return apiSuccess({ success: true, ignored: true });
    }

    // Extrai e anonimiza IP do cliente
    const rawIp = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown";
    const ip = anonymizeIp(rawIp);

    // Salva o registro de PageView
    const pageView = await prisma.pageView.create({
      data: {
        path: parsed.path,
        userAgent: userAgent.substring(0, 255),
        ip,
        country: "BR" // Padrão de geolocalização local
      }
    });

    return apiSuccess({
      success: true,
      id: pageView.id
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
