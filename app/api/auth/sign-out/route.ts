import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Handle server component cookie setting
          }
        },
      },
    }
  );

  await supabase.auth.signOut();

  const referer = request.headers.get("referer");
  const redirectUrl = referer ? new URL(referer).origin : request.url;

  return NextResponse.redirect(new URL("/", redirectUrl), { status: 303 });
}
