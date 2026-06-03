import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as forgotPasswordPost } from "@/app/api/auth/forgot-password/route";
import { POST as resetPasswordPost } from "@/app/api/auth/reset-password/route";
import { prisma } from "@/lib/prisma";
import { sendWeb3FormNotification } from "@/lib/notifications";
import { NextRequest } from "next/server";
import { createHash } from "crypto";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/notifications", () => ({
  sendWeb3FormNotification: vi.fn().mockResolvedValue(true),
}));

describe("Auth Password Recovery (TASK-14)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = "";
  });

  describe("POST /api/auth/forgot-password (Enumeração e Geração)", () => {
    it("deve retornar resposta neutra mesmo se o e-mail não existir", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: "nao-existe@test.com" }),
      });

      const res = await forgotPasswordPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain("instruções de recuperação serão enviadas");
      expect(prisma.user.update).not.toHaveBeenCalled();
      expect(sendWeb3FormNotification).not.toHaveBeenCalled();
    });

    it("deve retornar resposta neutra se o usuário estiver inativo", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: "1", email: "inativo@test.com", active: false });

      const req = new NextRequest("http://localhost/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: "inativo@test.com" }),
      });

      const res = await forgotPasswordPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("deve gerar token e enviar e-mail para usuário válido usando a origem da requisição quando NEXT_PUBLIC_SITE_URL estiver vazio", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({ id: "user-123", email: "valido@test.com", active: true });
      (prisma.user.update as any).mockResolvedValue({ id: "user-123" });

      const req = new NextRequest("http://localhost/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: "valido@test.com" }),
      });

      const res = await forgotPasswordPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: "user-123" },
        data: expect.objectContaining({
          resetTokenHash: expect.any(String),
          resetTokenExpires: expect.any(Date),
        }),
      }));
      expect(sendWeb3FormNotification).toHaveBeenCalled();
      
      const notificationArg = (sendWeb3FormNotification as any).mock.calls[0][0];
      expect(notificationArg.to).toBe("valido@test.com");
      expect(notificationArg.message).toMatch(/http:\/\/localhost(?::\d+)?\/reset-password\?token=/);
    });

    it("deve retornar 400 para e-mail inválido", async () => {
      const req = new NextRequest("http://localhost/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: "invalido" }),
      });

      const res = await forgotPasswordPost(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("BAD_REQUEST");
    });
  });

  describe("POST /api/auth/reset-password (Validação e Troca)", () => {
    it("deve recusar token inexistente ou incorreto", async () => {
      (prisma.user.findFirst as any).mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token: "token-errado", password: "new-password-123" }),
      });

      const res = await resetPasswordPost(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.code).toBe("INVALID_TOKEN");
    });

    it("deve aceitar token válido e atualizar senha", async () => {
      const plainToken = "super-secret-token";
      const hash = createHash("sha256").update(plainToken).digest("hex");
      
      (prisma.user.findFirst as any).mockResolvedValue({ id: "user-123", email: "test@test.com" });
      (prisma.user.update as any).mockResolvedValue({ id: "user-123" });

      const req = new NextRequest("http://localhost/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token: plainToken, password: "new-secure-password" }),
      });

      const res = await resetPasswordPost(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: "user-123" },
        data: expect.objectContaining({
          password: expect.any(String), // bcrypt hash
          resetTokenHash: null,
          resetTokenExpires: null,
        }),
      }));
    });

    it("deve recusar senha curta", async () => {
      const req = new NextRequest("http://localhost/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token: "any-token", password: "123" }),
      });

      const res = await resetPasswordPost(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error.details[0].path).toBe("password");
    });
  });
});
