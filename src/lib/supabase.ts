import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}
if (!supabaseServiceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
}

/**
 * Supabase client for server-side operations.
 * Uses the service_role key — NEVER expose this to the client.
 * This client bypasses RLS and has full database access.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: "public",
  },
});

/**
 * Query a table via Supabase PostgREST (HTTP) — works in Vercel serverless
 * where direct TCP connections to the database pooler may fail.
 */
export async function supabaseFetch(
  table: string,
  params: Record<string, string> = {}
): Promise<{ data: unknown[] | null; error: unknown }> {
  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
  for (const [key, val] of Object.entries(params)) {
    url.searchParams.set(key, val);
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        apikey: supabaseServiceKey,
        Authorization: `Bearer ${supabaseServiceKey}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      return { data: null, error: { status: res.status, message: errText } };
    }

    const data = await res.json();
    return { data: data as unknown[], error: null };
  } catch (error) {
    return { data: null, error };
  }
}
