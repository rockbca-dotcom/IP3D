import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessionOptions, SessionData, defaultSession } from "./session";

export async function getSession(): Promise<SessionData> {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  
  if (!session.isLoggedIn) {
    return defaultSession;
  }
  
  return session;
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session.isLoggedIn === true &&
    (session.role === "ADMIN" || session.role === "SUPER_ADMIN");
}

export async function requireAdmin(): Promise<NextResponse | null> {
  const ok = await isAdmin();
  if (!ok) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return null;
}
