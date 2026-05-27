"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createBrowserClient } from "@/utils/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createBrowserClient();
      
      // This will handle the OAuth callback and set the session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth callback error:", error);
        router.push("/sign-in?error=oauth_error");
        return;
      }

      if (session) {
        // Successfully authenticated, redirect to dashboard
        router.push("/dashboard");
      } else {
        // No session, redirect to sign in
        router.push("/sign-in");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-brand" />
        <p className="mt-4 text-sm text-gray-500">Completing sign in...</p>
      </div>
    </div>
  );
}