"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@/utils/supabase/client";
import { toast } from "sonner";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

type LoginMode = "password" | "magic-link";

export default function SignInPage() {
  const [mode, setMode] = useState<LoginMode>("password");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const email = watch("email");

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    const supabase = createBrowserClient();

    try {
      if (mode === "magic-link" || !data.password) {
        // Magic link login
        const { error } = await supabase.auth.signInWithOtp({
          email: data.email,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) throw error;
        setMagicLinkSent(true);
      } else {
        // Password login
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;
        toast.success("Welcome back!");
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      toast.error(error.message || "Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 text-center">
          <div className="mx-auto size-12 rounded-full bg-brand-50 flex items-center justify-center mb-4">
            <Mail className="size-6 text-brand" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
          <p className="mt-3 text-sm text-gray-500">
            We sent a magic link to <span className="font-medium text-gray-700">{email}</span>
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Click the link in the email to sign in. You can close this page.
          </p>
          <button
            onClick={() => setMagicLinkSent(false)}
            className="mt-6 text-sm text-brand hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8">
        {/* Mobile logo */}
        <Link href="/" className="flex lg:hidden items-center gap-2 mb-5">
          <span className="size-2 rounded-full bg-brand" />
          <span className="font-semibold text-gray-900">NutraCloud</span>
        </Link>

        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Sign in to access your workspace
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                {...register("email")}
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                className={cn(
                  "pl-10 h-11",
                  errors.email ? "border-red-400 focus:border-red-400 focus:ring-red-400/20" : ""
                )}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password field - only shown in password mode */}
          {mode === "password" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  {...register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={cn(
                    "pl-10 pr-10 h-11",
                    errors.password ? "border-red-400" : ""
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "w-full mt-2 flex items-center justify-center gap-2",
              "rounded-xl bg-brand text-white font-semibold text-sm py-2.5",
              "hover:bg-brand-dark transition-all hover:opacity-90 shadow-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
              "disabled:opacity-60 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

        {/* Forgot password link */}
        <div className="mt-4 text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-brand hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {/* Mode toggle */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMode(mode === "password" ? "magic-link" : "password")}
          className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
        >
          {mode === "password" ? (
            <>
              <Mail className="size-4" />
              Send magic link
            </>
          ) : (
            <>
              <Lock className="size-4" />
              Use password
            </>
          )}
        </button>

        <p className="mt-8 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link href="/sign-up" className="font-medium text-brand hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
