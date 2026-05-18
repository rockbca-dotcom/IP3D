import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Limpeza de registros expirados a cada 5 minutos para evitar vazamento de memória
if (typeof global !== "undefined") {
  const globalAny = global as typeof globalThis & { rateLimitCleanupInterval?: NodeJS.Timeout };
  if (!globalAny.rateLimitCleanupInterval) {
    globalAny.rateLimitCleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of memoryStore.entries()) {
        if (now > value.resetTime) {
          memoryStore.delete(key);
        }
      }
    }, 5 * 60 * 1000);
    
    // Evita travar o processo do Node.js nos testes automatizados
    if (globalAny.rateLimitCleanupInterval.unref) {
      globalAny.rateLimitCleanupInterval.unref();
    }
  }
}

export interface RateLimitOptions {
  limit: number;      // Limite máximo de requisições por janela
  windowMs: number;   // Janela de tempo em milissegundos
}

/**
 * Limitador de taxa leve em memória.
 * Retorna o status de sucesso, limite total, requisições restantes e timestamp de reset.
 */
export function rateLimiter(
  request: NextRequest,
  keyPrefix: string,
  options: RateLimitOptions
) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetTime) {
    // Nova janela de tempo
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    memoryStore.set(key, newRecord);
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: newRecord.resetTime,
    };
  }

  // Janela existente excedeu o limite?
  if (record.count >= options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset: record.resetTime,
    };
  }

  // Incrementa requisição
  record.count += 1;
  memoryStore.set(key, record);

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.count,
    reset: record.resetTime,
  };
}
