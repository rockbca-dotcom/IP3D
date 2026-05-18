import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  
  try {
    // Teste de conexão super leve com o banco de dados
    await prisma.$queryRaw`SELECT 1`;
    
    logger.info("Health check bem-sucedido");
    
    return NextResponse.json(
      {
        status: "UP",
        timestamp,
        services: {
          database: "UP"
        }
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Health check falhou", error);
    
    return NextResponse.json(
      {
        status: "DOWN",
        timestamp,
        services: {
          database: "DOWN"
        }
      },
      { status: 500 }
    );
  }
}
