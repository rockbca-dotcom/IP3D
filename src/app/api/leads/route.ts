import { NextRequest, NextResponse } from "next/server";
import { sendWeb3FormNotification } from "@/lib/notifications";

interface LeadPayload {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
}

function sanitize(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadPayload = await request.json();
    const name = sanitize(body.name);
    const email = sanitize(body.email);
    const phone = sanitize(body.phone);
    const message = sanitize(body.message);
    const source = sanitize(body.source) || "Site";

    if (!name || !email) {
      return NextResponse.json({ error: "Nome e e-mail sao obrigatorios." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "E-mail invalido." }, { status: 400 });
    }

    const notificationMessage = [
      `Origem: ${source}`,
      `Nome: ${name}`,
      `E-mail: ${email}`,
      `Telefone: ${phone || "Nao informado"}`,
      "",
      "Mensagem:",
      message || "Sem mensagem.",
    ].join("\n");

    await sendWeb3FormNotification({
      subject: `Novo lead - ${source}`,
      customerName: name,
      customerEmail: email,
      message: notificationMessage,
    });

    return NextResponse.json({ success: true, message: "Lead recebido com sucesso." });
  } catch (error) {
    console.error("Error receiving lead:", error);
    return NextResponse.json({ error: "Erro ao receber lead." }, { status: 500 });
  }
}
