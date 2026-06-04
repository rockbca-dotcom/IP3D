import { getSupabaseAdmin, getSupabaseConfigError } from "./supabase";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  password: string | null;
  active: boolean;
}

/**
 * Fetch a user by email using Supabase PostgREST (HTTP).
 * Works in Vercel serverless where TCP connections may fail.
 */
export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  try {
    if (getSupabaseConfigError()) return null;

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("User")
      .select("id, email, name, role, password, active")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (error || !data) return null;
    return data as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Fetch a user by ID using Supabase PostgREST (HTTP).
 */
export async function findUserById(id: string): Promise<AuthUser | null> {
  try {
    if (getSupabaseConfigError()) return null;

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("User")
      .select("id, email, name, role, password, active")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return data as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Validate user credentials.
 * Returns the user if valid, null otherwise.
 */
export async function validateCredentials(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const user = await findUserByEmail(email);
  if (!user || !user.password || !user.active) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return user;
}

/**
 * Verify a user session is still valid (user exists and is active).
 */
export async function verifySession(userId: string): Promise<{
  valid: boolean;
  role?: UserRole;
}> {
  try {
    if (getSupabaseConfigError()) {
      return { valid: false };
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("User")
      .select("active, role")
      .eq("id", userId)
      .single();

    if (error || !data || !data.active) {
      return { valid: false };
    }

    return { valid: true, role: data.role as UserRole };
  } catch {
    return { valid: false };
  }
}
