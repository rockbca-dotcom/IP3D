import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData, defaultSession } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.isLoggedIn) {
      return NextResponse.json(defaultSession);
    }

    return NextResponse.json({
      isLoggedIn: session.isLoggedIn,
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(defaultSession);
  }
}
