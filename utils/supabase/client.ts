import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export function createBrowserClient() {
  if (!supabaseUrl || !supabaseKey) {
    // Return a client anyway - it will fail gracefully if used without credentials
    console.warn("Supabase credentials not configured");
  }
  return createSupabaseBrowserClient(supabaseUrl, supabaseKey);
}

// Alias for backward compatibility
export const createClient = createBrowserClient;
