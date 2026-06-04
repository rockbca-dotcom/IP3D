import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { logger } from "./logger";

/**
 * Formato padrão de erro da API.
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Helper para respostas de sucesso.
 */
export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Helper genérico para erros.
 */
export function apiError(
  message: string,
  code = "INTERNAL_ERROR",
  status = 500,
  details?: unknown
) {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
  return NextResponse.json(response, { status });
}

// Helpers de status específicos
export const badRequest = (msg: string, details?: unknown) => apiError(msg, "BAD_REQUEST", 400, details);
export const unauthorized = (msg = "Não autenticado") => apiError(msg, "UNAUTHORIZED", 401);
export const forbidden = (msg = "Acesso negado") => apiError(msg, "FORBIDDEN", 403);
export const notFound = (msg = "Recurso não encontrado") => apiError(msg, "NOT_FOUND", 404);
export const conflict = (msg: string) => apiError(msg, "CONFLICT", 409);

/**
 * Trata erros do Prisma e Zod centralizadamente.
 */
export function handleApiError(error: unknown) {
  logger.error("Erro na rota da API", error);

  // Erro de Validação (Zod)
  if (error instanceof ZodError) {
    return badRequest("Dados inválidos", error.issues.map(e => ({
      path: e.path.join("."),
      message: e.message
    })));
  }

  // Erros do Prisma
  if (
    typeof Prisma === "object" &&
    Prisma !== null &&
    typeof Prisma.PrismaClientKnownRequestError === "function" &&
    error instanceof Prisma.PrismaClientKnownRequestError
  ) {
    switch (error.code) {
      case "P2002": // Unique constraint failed
        const fields = (error.meta?.target as string[])?.join(", ") || "campo";
        return conflict(`Já existe um registro com este ${fields}.`);
      case "P2025": // Record to update not found
        return notFound("O registro solicitado não foi encontrado.");
      case "P2034": // Serialization failure (concurrent setup)
        return badRequest("Operação cancelada por concorrência. Tente novamente.");
      default:
        return apiError("Erro operacional no banco de dados", `PRISMA_${error.code}`, 400);
    }
  }

  // Erros customizados (ex: CheckoutError)
  if (error && typeof error === "object" && "status" in error && "code" in error) {
    const customErr = error as { message?: string; code?: unknown; status?: unknown };
    return apiError(
      customErr.message || "Erro customizado",
      typeof customErr.code === "string" ? customErr.code : "CUSTOM_ERROR",
      typeof customErr.status === "number" ? customErr.status : 400
    );
  }

  // Erros genéricos de runtime (não vazar stack)
  const message = error instanceof Error ? error.message : "Erro desconhecido";
  
  // Em produção, escondemos a mensagem real de erros 500 por segurança
  const isProd = process.env.NODE_ENV === "production";
  const safeMessage = isProd ? "Ocorreu um erro interno no servidor" : message;

  return apiError(safeMessage, "SERVER_ERROR", 500);
}
