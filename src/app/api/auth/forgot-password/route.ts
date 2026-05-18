import { randomBytes, createHash } from "crypto";
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handleApiError, apiSuccess, apiError } from "@/lib/api-utils";
import { sendWeb3FormNotification } from "@/lib/notifications";
import { env } from "@/lib/env";
import { rateLimiter } from "@/lib/rate-limit";

const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimiter(request, "forgot-password", {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimitResult.success) {
    return apiError(
      "Muitas tentativas de recuperação de senha. Tente novamente mais tarde.",
      "TOO_MANY_REQUESTS",
      429
    );
  }

  try {
    const json = await request.json();
    const { email } = forgotPasswordSchema.parse(json);

    // Resposta neutra para evitar enumeração de e-mails
    const successResponse = apiSuccess({
      success: true,
      message: "Se o e-mail existir em nossa base, as instruções de recuperação serão enviadas em breve.",
    });

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Se o usuário não existir ou estiver inativo, retornamos sucesso neutro
    if (!user || !user.active) {
      return successResponse;
    }

    // Gerar token seguro (Regra 4: 32 bytes hex)
    const token = randomBytes(32).toString("hex");
    
    // Armazenar apenas o hash SHA-256 (Regra 5)
    const tokenHash = createHash("sha256").update(token).digest("hex");
    
    // Expiração em 1 hora (Regra 7)
    const expires = new Date(Date.now() + 1000 * 60 * 60);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: tokenHash,
        resetTokenExpires: expires,
      },
    });

    // Montar link (Regra 4)
    const resetUrl = `${env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`;

    // Enviar e-mail (falha no envio também retorna resposta neutra conforme Regra 3)
    await sendWeb3FormNotification({
      to: email,
      subject: "Recuperação de Senha - IP3D",
      message: `Você solicitou a recuperação de senha no IP3D.\n\nClique no link abaixo para criar uma nova senha:\n${resetUrl}\n\nEste link expira em 1 hora. Se você não solicitou esta alteração, ignore este e-mail.`,
    });

    return successResponse;
  } catch (error) {
    // Erros de validação (Zod) retornam 400 via handleApiError
    // Outros erros podem retornar 500 mas sem vazar detalhes
    return handleApiError(error);
  }
}

