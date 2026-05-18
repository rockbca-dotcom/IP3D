import { describe, it, expect } from "vitest";
import nextConfig from "../../next.config";
import { sessionOptions } from "@/lib/session";
import { rateLimiter } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

describe("Hardening de Segurança e Cabeçalhos HTTP", () => {
  it("deve conter cabeçalhos HTTP de segurança obrigatórios configurados no next.config.ts", async () => {
    expect(nextConfig.headers).toBeDefined();
    expect(typeof nextConfig.headers).toBe("function");

    const headersFn = nextConfig.headers!;
    const results = await headersFn();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    const globalRule = results.find((r: any) => r.source === "/:path*");
    expect(globalRule).toBeDefined();

    const headersList = globalRule.headers;
    expect(headersList).toBeDefined();

    const headerKeys = headersList.map((h: any) => h.key);
    expect(headerKeys).toContain("X-Frame-Options");
    expect(headerKeys).toContain("X-Content-Type-Options");
    expect(headerKeys).toContain("Referrer-Policy");
    expect(headerKeys).toContain("Permissions-Policy");
    expect(headerKeys).toContain("Strict-Transport-Security");
    expect(headerKeys).toContain("Content-Security-Policy");

    // Verificar valores específicos
    const frameOpt = headersList.find((h: any) => h.key === "X-Frame-Options");
    expect(frameOpt.value).toBe("DENY");

    const ctOpt = headersList.find((h: any) => h.key === "X-Content-Type-Options");
    expect(ctOpt.value).toBe("nosniff");

    const refPol = headersList.find((h: any) => h.key === "Referrer-Policy");
    expect(refPol.value).toBe("strict-origin-when-cross-origin");
  });

  it("deve configurar opções de cookies de sessão seguras em sessionOptions", () => {
    expect(sessionOptions.cookieName).toBe("ip3d-admin-session");
    expect(sessionOptions.cookieOptions).toBeDefined();
    
    const opts = sessionOptions.cookieOptions!;
    expect(opts.httpOnly).toBe(true);
    expect(opts.sameSite).toBe("lax");
    expect(opts.path).toBe("/");
    expect(opts.maxAge).toBe(60 * 60 * 24 * 7); // 7 dias
  });
});

describe("Validação de Rate Limiter", () => {
  it("deve permitir requisições dentro do limite e bloquear quando o limite for excedido", () => {
    const req = new NextRequest("http://localhost/api/test-route", {
      headers: { "x-forwarded-for": "192.168.1.100" },
    });

    const keyPrefix = "test-rate-limit";
    const options = { limit: 3, windowMs: 10 * 1000 };

    // 1ª requisição
    const res1 = rateLimiter(req, keyPrefix, options);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    // 2ª requisição
    const res2 = rateLimiter(req, keyPrefix, options);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    // 3ª requisição
    const res3 = rateLimiter(req, keyPrefix, options);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);

    // 4ª requisição (Bloqueada)
    const res4 = rateLimiter(req, keyPrefix, options);
    expect(res4.success).toBe(false);
    expect(res4.remaining).toBe(0);
  });

  it("deve isolar a limitação de taxa por endereço IP", () => {
    const req1 = new NextRequest("http://localhost/api/test-route", {
      headers: { "x-forwarded-for": "10.0.0.1" },
    });

    const req2 = new NextRequest("http://localhost/api/test-route", {
      headers: { "x-forwarded-for": "10.0.0.2" },
    });

    const keyPrefix = "test-ip-isolation";
    const options = { limit: 1, windowMs: 10 * 1000 };

    // IP 1 consome o limite único
    const resIp1_try1 = rateLimiter(req1, keyPrefix, options);
    expect(resIp1_try1.success).toBe(true);

    const resIp1_try2 = rateLimiter(req1, keyPrefix, options);
    expect(resIp1_try2.success).toBe(false);

    // IP 2 continua liberado pois é independente
    const resIp2_try1 = rateLimiter(req2, keyPrefix, options);
    expect(resIp2_try1.success).toBe(true);
  });
});
