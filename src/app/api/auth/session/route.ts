import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData, defaultSession } from "@/lib/session";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json(defaultSession);
    }

    // Verify user still exists and is active via Supabase PostgREST
    const { data: user, error } = await supabaseAdmin
      .from("User")
      .select("id, email, name, role, active")
      .eq("id", session.userId)
      .single();

    if (error || !user || !user.active) {
      return NextResponse.json(defaultSession);
    }

    return NextResponse.json({
      isLoggedIn: session.isLoggedIn,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json(defaultSession);
  }
}
