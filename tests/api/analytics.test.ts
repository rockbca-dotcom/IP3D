import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as postPageView } from "@/app/api/analytics/pageview/route";
import { POST as postClick } from "@/app/api/analytics/click/route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pageView: {
      create: vi.fn(),
    },
    click: {
      create: vi.fn(),
    },
  },
}));

function makeRequest(url: string, body: any = null, headers: Record<string, string> = {}) {
  return new NextRequest(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: body ? JSON.stringify(body) : null,
  });
}

describe("APIs de Analytics — Coleta com Consentimento e Privacidade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/analytics/pageview", () => {
    it("deve capturar pageview válido e anonimizar IPv4 corretamente", async () => {
      vi.mocked(prisma.pageView.create).mockResolvedValue({ id: "pv-123" } as any);

      const req = makeRequest("http://localhost/api/analytics/pageview", {
        path: "/produtos/hotend-premium",
        referrer: "/carrinho",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      }, {
        "x-forwarded-for": "189.24.120.45"
      });

      const res = await postPageView(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.id).toBe("pv-123");
      expect(prisma.pageView.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          path: "/produtos/hotend-premium",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          ip: "189.24.120.0", // Último octeto zerado
        })
      });
    });

    it("deve anonimizar IPv6 corretamente", async () => {
      vi.mocked(prisma.pageView.create).mockResolvedValue({ id: "pv-124" } as any);

      const req = makeRequest("http://localhost/api/analytics/pageview", {
        path: "/sobre",
        userAgent: "Mozilla/5.0",
      }, {
        "x-real-ip": "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
      });

      const res = await postPageView(req);
      expect(res.status).toBe(201);
      expect(prisma.pageView.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ip: "2001:0db8:85a3::0" // Mascarado
        })
      });
    });

    it("deve ignorar bots de busca silenciosamente retornando sucesso sem persistir", async () => {
      const req = makeRequest("http://localhost/api/analytics/pageview", {
        path: "/",
        userAgent: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
      });

      const res = await postPageView(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.ignored).toBe(true);
      expect(prisma.pageView.create).not.toHaveBeenCalled();
    });

    it("deve rejeitar payload inválido com erro 400", async () => {
      const req = makeRequest("http://localhost/api/analytics/pageview", {
        path: "", // Inválido (min 1)
      });

      const res = await postPageView(req);
      expect(res.status).toBe(400);
      expect(prisma.pageView.create).not.toHaveBeenCalled();
    });

    it("deve truncar campos longos automaticamente", async () => {
      vi.mocked(prisma.pageView.create).mockResolvedValue({ id: "pv-trunc" } as any);
      
      const longPath = "/" + "a".repeat(300); // 301 chars
      const req = makeRequest("http://localhost/api/analytics/pageview", {
        path: longPath,
        userAgent: "Mozilla/5.0",
      });

      const res = await postPageView(req);
      expect(res.status).toBe(201);
      expect(prisma.pageView.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          path: longPath.substring(0, 255)
        })
      });
    });

    it("deve retornar 500 seguro caso o banco falhe", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      try {
        vi.mocked(prisma.pageView.create).mockRejectedValue(new Error("Prisma connection failure"));

        const req = makeRequest("http://localhost/api/analytics/pageview", {
          path: "/produtos",
        });

        const res = await postPageView(req);
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error.code).toBe("SERVER_ERROR");
        expect(data.error.message).not.toContain("Prisma connection failure"); // Sem vazar stack
        expect(data.error.message).toBe("Ocorreu um erro interno no servidor");
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });
  });

  describe("POST /api/analytics/click", () => {
    it("deve capturar clique válido com metadados", async () => {
      vi.mocked(prisma.click.create).mockResolvedValue({ id: "click-123" } as any);

      const req = makeRequest("http://localhost/api/analytics/click", {
        path: "/",
        label: "WhatsApp Fale Conosco",
        type: "WHATSAPP",
        target: "https://wa.me/5511999999999",
        referrer: "direct"
      });

      const res = await postClick(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.success).toBe(true);
      expect(prisma.click.create).toHaveBeenCalledWith({
        data: {
          type: "WHATSAPP",
          label: "WhatsApp Fale Conosco",
          metadata: {
            path: "/",
            target: "https://wa.me/5511999999999",
            referrer: "direct"
          }
        }
      });
    });

    it("deve rejeitar tipo de clique inválido (erro 400)", async () => {
      const req = makeRequest("http://localhost/api/analytics/click", {
        path: "/",
        label: "Botão Fantasma",
        type: "INVALID_ENUM_TYPE" // Inexistente
      });

      const res = await postClick(req);
      expect(res.status).toBe(400);
      expect(prisma.click.create).not.toHaveBeenCalled();
    });

    it("deve truncar campos excessivos no clique", async () => {
      vi.mocked(prisma.click.create).mockResolvedValue({ id: "click-trunc" } as any);

      const longLabel = "b".repeat(1000);
      const req = makeRequest("http://localhost/api/analytics/click", {
        path: "/",
        label: longLabel,
        type: "CTA"
      });

      const res = await postClick(req);
      expect(res.status).toBe(201);
      expect(prisma.click.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          label: longLabel.substring(0, 100)
        })
      });
    });
  });
});
