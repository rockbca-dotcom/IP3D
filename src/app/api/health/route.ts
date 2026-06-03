import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    // Use Supabase PostgREST (HTTP) — works in Vercel serverless
    const { error } = await supabaseAdmin
      .from("Setting")
      .select("key")
      .limit(1);

    if (error) {
      logger.error("Health check falhou", error);
      return NextResponse.json(
        {
          status: "DOWN",
          timestamp,
          services: { database: "DOWN" },
        },
        { status: 500 }
      );
    }

    logger.info("Health check bem-sucedido");

    return NextResponse.json(
      {
        status: "UP",
        timestamp,
        services: { database: "UP" },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Health check falhou", error);

    return NextResponse.json(
      {
        status: "DOWN",
        timestamp,
        services: { database: "DOWN" },
      },
      { status: 500 }
    );
  }
}
