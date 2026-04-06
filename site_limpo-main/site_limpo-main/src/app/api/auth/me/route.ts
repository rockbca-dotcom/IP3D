import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// ---------------------------------------------------------------------------
// GET /api/auth/me
//
// Retorna as informações básicas da sessão ativa (sem password, sem dados sensíveis).
// Usado pela UI do admin para:
//   • Saber o papel do usuário atual (exibir guarda de role na página de usuários)
//   • Identificar qual linha da lista corresponde ao próprio usuário ("você")
//
// Não requer SUPER_ADMIN — qualquer administrador logado pode chamá-lo.
// Se não há sessão válida, retorna 401 (não redireciona — é uma API).
// ---------------------------------------------------------------------------

export async function GET() {
  const session = await getSession();

  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  return NextResponse.json({
    userId: session.userId,
    email:  session.email,
    name:   session.name,
    role:   session.role,
  });
}
