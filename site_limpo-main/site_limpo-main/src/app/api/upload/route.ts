import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";

// Aumentar limite de tamanho para uploads (50MB) (usando convenções modernas se necessário)

// Para Next.js 13+ App Router
export const maxDuration = 60; // 60 segundos timeout

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    // Gera nome único
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const filename = `${folder}/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Upload para Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    });

    return NextResponse.json({ success: true, url: blob.url, filename: blob.pathname });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "URL não informada" }, { status: 400 });
    }

    await del(url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Erro ao deletar arquivo" }, { status: 500 });
  }
}
