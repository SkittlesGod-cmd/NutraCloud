"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createBrowserClient } from "@/utils/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Completing sign in...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createBrowserClient();
      
      // Check for error params first
      const errorParam = searchParams.get("error");
      const errorDesc = searchParams.get("error_description");
      
      if (errorParam) {
        setError(`${errorParam}: ${errorDesc || "Unknown error"}`);
        setTimeout(() => router.push(`/sign-in?error=${errorParam}`), 3000);
        return;
      }

      // Get the code from the URL (Supabase OAuth callback)
      const code = searchParams.get("code");
      
      if (code) {
        // Exchange the code for a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          setStatus("Authentication failed");
          setError(error.message);
          setTimeout(() => router.push("/sign-in?error=session_error"), 3000);
          return;
        }
        
        if (data.session) {
          setStatus("Successfully signed in!");
          
          // Check if profile exists
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();
          
          if (!profile) {
            // Create profile for new users
            await supabase.from("profiles").insert({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || "",
              company: data.user.user_metadata?.company || "",
              avatar_url: data.user.user_metadata?.avatar_url || null,
            });
            // Send welcome email (fire-and-forget)
            fetch("/api/email/welcome", { method: "POST" }).catch(() => {});
          }
          
          setTimeout(() => router.push("/dashboard"), 1500);
          return;
        }
      }
      
      // If no code, check for existing session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setStatus("Authentication failed");
        setError(error.message);
        setTimeout(() => router.push("/sign-in?error=oauth_error"), 3000);
        return;
      }

      if (session) {
        setStatus("Successfully signed in!");
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        router.push("/sign-in");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <Loader2 className="mx-auto size-8 animate-spin text-brand" />
        <p className="mt-4 text-sm text-gray-500">{status}</p>
        {error && (
          <p className="mt-2 text-xs text-red-500 break-all">Error: {error}</p>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-brand" />
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
