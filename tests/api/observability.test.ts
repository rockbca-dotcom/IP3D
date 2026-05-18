import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as healthGet } from "@/app/api/health/route";
import { prisma } from "@/lib/prisma";
import { maskData } from "@/lib/logger";
import { handleApiError } from "@/lib/api-utils";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

describe("Módulo de Observabilidade, Logger e Health Check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("API Health Check", () => {
    it("deve retornar 200 OK com status UP se a conexão com banco de dados estiver ativa", async () => {
      (prisma.$queryRaw as any).mockResolvedValue([{ 1: 1 }]);
      
      const res = await healthGet();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.status).toBe("UP");
      expect(data.services.database).toBe("UP");
      expect(data.timestamp).toBeDefined();
    });

    it("deve retornar 500 DOWN se a conexão com o banco falhar", async () => {
      (prisma.$queryRaw as any).mockRejectedValue(new Error("Database offline!"));
      
      const res = await healthGet();
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data.status).toBe("DOWN");
      expect(data.services.database).toBe("DOWN");
      expect(data.timestamp).toBeDefined();
    });

    it("não deve expor credenciais de banco ou outras secrets na resposta de health check", async () => {
      (prisma.$queryRaw as any).mockResolvedValue([{ 1: 1 }]);
      
      const res = await healthGet();
      const data = await res.json();

      const jsonStr = JSON.stringify(data);
      expect(jsonStr).not.toContain("password");
      expect(jsonStr).not.toContain("secret");
      expect(jsonStr).not.toContain("DATABASE_URL");
      expect(jsonStr).not.toContain("MERCADO_PAGO");
    });
  });

  describe("Logger Seguro - Mascaramento de Secrets", () => {
    it("deve mascarar propriedades confidenciais de forma recursiva profunda", () => {
      const payload = {
        user: {
          name: "Gabriel",
          senha: "minhasenhasecreta",
          cpf: "123.456.789-00",
          nested: {
            token: "mp-access-token-123456",
            jwt: "header.payload.signature"
          }
        },
        payment: {
          cardNumber: "1234-5678-9012-3456",
          cvv: "123",
          cookie: "ip3d-admin-session=abcdef"
        },
        safeField: "OK"
      };

      const masked = maskData(payload) as any;

      expect(masked.safeField).toBe("OK");
      expect(masked.user.name).toBe("Gabriel");
      
      expect(masked.user.senha).toBe("[REDACTED]");
      expect(masked.user.cpf).toBe("[REDACTED]");
      expect(masked.user.nested.token).toBe("[REDACTED]");
      expect(masked.user.nested.jwt).toBe("[REDACTED]");
      expect(masked.payment.cardNumber).toBe("[REDACTED]");
      expect(masked.payment.cvv).toBe("[REDACTED]");
      expect(masked.payment.cookie).toBe("[REDACTED]");
    });

    it("deve mascarar strings soltas longas ou strings com Bearer prefixado", () => {
      expect(maskData("Bearer secretTokenXYZ")).toBe("[REDACTED]");
      expect(maskData("bearer token123")).toBe("[REDACTED]");
      // String segura e curta deve ser preservada
      expect(maskData("safe-string")).toBe("safe-string");
    });
  });

  describe("Tratamento Seguro de Erros Internos", () => {
    it("deve ocultar a mensagem de erro original no handleApiError em modo produção", async () => {
      const error = new Error("Instância caiu devido a OutOfMemory!");
      
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";
      
      const res = handleApiError(error);
      const data = await res.json();
      
      process.env.NODE_ENV = originalEnv;

      expect(res.status).toBe(500);
      expect(data.error.message).toBe("Ocorreu um erro interno no servidor");
      expect(data.error.code).toBe("SERVER_ERROR");
      expect(data.error.details).toBeUndefined();
    });
  });
});
