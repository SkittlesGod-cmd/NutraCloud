"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock, Eye, EyeOff, User, Building, ArrowRight, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@/utils/supabase/client";
import { toast } from "sonner";

const signUpSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    company: z.string().min(1, "Company name is required"),
    terms: z.boolean().refine((val) => val === true, "You must accept the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

const PASSWORD_REQUIREMENTS = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
];

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const password = watch("password", "");

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    const supabase = createBrowserClient();

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            company: data.company,
          },
          emailRedirectTo: `${window.location.origin}/confirm`,
        },
      });

      if (error) throw error;
      setIsSuccess(true);
    } catch (error: any) {
      toast.error(error.message || "Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 text-center">
          <div className="mx-auto size-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Mail className="size-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
          <p className="mt-3 text-sm text-gray-500">
            We sent a confirmation link to your email address. Click the link to activate your account.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Didn't receive it? Check your spam folder or{" "}
            <button
              onClick={() => setIsSuccess(false)}
              className="text-brand hover:underline"
            >
              try again
            </button>
          </p>
          <Link
            href="/sign-in"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
          >
            Back to sign in
          </Link>
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
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Start your free trial today
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Name field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
              Full name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                {...register("full_name")}
                id="full_name"
                type="text"
                placeholder="Alex Rivera"
                autoComplete="name"
                className={cn(
                  "pl-10 h-11",
                  errors.full_name ? "border-red-400" : ""
                )}
              />
            </div>
            {errors.full_name && (
              <p className="text-xs text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          {/* Company field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company" className="text-sm font-medium text-gray-700">
              Company name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                {...register("company")}
                id="company"
                type="text"
                placeholder="NutriVive Co."
                autoComplete="organization"
                className={cn(
                  "pl-10 h-11",
                  errors.company ? "border-red-400" : ""
                )}
              />
            </div>
            {errors.company && (
              <p className="text-xs text-red-500">{errors.company.message}</p>
            )}
          </div>

          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Work email <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                {...register("email")}
                id="email"
                type="email"
                placeholder="alex@company.com"
                autoComplete="email"
                className={cn(
                  "pl-10 h-11",
                  errors.email ? "border-red-400" : ""
                )}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                autoComplete="new-password"
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

          {/* Password requirements */}
          {password && (
            <div className="rounded-lg bg-gray-50 p-3 space-y-1">
              {PASSWORD_REQUIREMENTS.map((req) => (
                <div
                  key={req.label}
                  className={cn(
                    "flex items-center gap-2 text-xs",
                    req.test(password) ? "text-green-600" : "text-gray-400"
                  )}
                >
                  {req.test(password) ? (
                    <Check className="size-3" />
                  ) : (
                    <X className="size-3" />
                  )}
                  {req.label}
                </div>
              ))}
            </div>
          )}

          {/* Confirm password */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                {...register("confirmPassword")}
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                autoComplete="new-password"
                className={cn(
                  "pl-10 h-11",
                  errors.confirmPassword ? "border-red-400" : ""
                )}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              {...register("terms")}
              id="terms"
              className="mt-0.5 size-4 rounded border-gray-300 text-brand focus:ring-brand"
            />
            <label htmlFor="terms" className="text-sm text-gray-500">
              I agree to the{" "}
              <Link href="/terms" className="text-brand hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-brand hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className="text-xs text-red-500">{errors.terms.message}</p>
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
                Creating account…
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
