import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { handleApiError, apiSuccess, apiError } from "@/lib/api-utils";
import { rateLimiter } from "@/lib/rate-limit";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
});

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimiter(request, "reset-password", {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimitResult.success) {
    return apiError(
      "Muitas tentativas de alteração de senha. Tente novamente mais tarde.",
      "TOO_MANY_REQUESTS",
      429
    );
  }

  try {
    const json = await request.json();
    const { token, password } = resetPasswordSchema.parse(json);

    // Gerar o hash do token recebido para comparação (Regra 5)
    const tokenHash = createHash("sha256").update(token).digest("hex");

    // Buscar usuário com token válido e não expirado (Regra 7 e 12)
    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return apiError("Token inválido ou expirado", "INVALID_TOKEN", 400);
    }

    // Gerar hash da nova senha (Regra 10)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Atualizar senha e invalidar token (Regra 8 e 9)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetTokenHash: null,
        resetTokenExpires: null,
      },
    });

    return apiSuccess({
      success: true,
      message: "Senha alterada com sucesso.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
