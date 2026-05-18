/**
 * Logger seguro com mascaramento de dados sensíveis e estruturação JSON para produção.
 */

const KEYS_TO_MASK = [
  "password",
  "senha",
  "token",
  "secret",
  "jwt",
  "access_token",
  "accesstoken",
  "authorization",
  "cookie",
  "session",
  "cvv",
  "card",
  "cpf",
  "client_secret",
  "client_id",
  "key",
  "chave"
];

/**
 * Função recursiva profunda para mascarar valores de chaves confidenciais.
 */
export function maskData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== "object") {
    // Se for uma string que parece ser um token JWT ou Bearer
    if (typeof data === "string") {
      if (data.toLowerCase().startsWith("bearer ") || data.length > 100) {
        return "[REDACTED]";
      }
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => maskData(item));
  }

  const masked: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    const shouldMask = KEYS_TO_MASK.some(k => lowerKey.includes(k));

    if (shouldMask) {
      masked[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      masked[key] = maskData(value);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

function formatLog(level: "INFO" | "WARN" | "ERROR", message: string, context?: unknown) {
  const timestamp = new Date().toISOString();
  const safeContext = context !== undefined ? maskData(context) : undefined;
  
  if (process.env.NODE_ENV === "production") {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...(safeContext ? { context: safeContext } : {})
    });
  }
  
  // Legível em desenvolvimento
  const contextStr = safeContext ? ` | Context: ${JSON.stringify(safeContext)}` : "";
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
}

export const logger = {
  info(message: string, context?: unknown) {
    console.log(formatLog("INFO", message, context));
  },
  
  warn(message: string, context?: unknown) {
    console.warn(formatLog("WARN", message, context));
  },
  
  error(message: string, error?: unknown, context?: unknown) {
    let errorDetails: unknown = undefined;
    
    if (error instanceof Error) {
      errorDetails = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? undefined : error.stack
      };
    } else if (error !== undefined) {
      errorDetails = error;
    }

    const mergedContext = {
      ...(context && typeof context === "object" ? (context as Record<string, unknown>) : { context }),
      ...(errorDetails ? { error: errorDetails } : {})
    };

    console.error(formatLog("ERROR", message, mergedContext));
  }
};
