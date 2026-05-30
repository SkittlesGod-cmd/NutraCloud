"use client";

import { Check, ArrowRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { PLANS, PLAN_ORDER } from "@/lib/billing/plans";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();

  function handleCheckout(planId: string) {
    if (user) {
      router.push(`/dashboard/billing?upgrade=${planId}`);
    } else {
      router.push(`/sign-up?next=/dashboard/billing?upgrade=${planId}`);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-14 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Pricing</p>
        <h1 className="mt-3 text-[36px] font-semibold tracking-[-0.03em] text-gray-950">
          Simple, transparent pricing
        </h1>
        <p className="mt-3 text-[15px] text-gray-500 max-w-md mx-auto">
          Start free. Upgrade when you&apos;re ready to scale.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {PLAN_ORDER.map(planId => {
          const plan = PLANS[planId];
          return (
            <div
              key={planId}
              className={cn(
                "relative flex flex-col rounded-2xl border p-7",
                plan.highlighted
                  ? "border-brand bg-white shadow-[0_0_0_1px_var(--color-brand),0_8px_32px_rgba(0,0,0,0.08)]"
                  : "border-black/[0.08] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-[11px] font-semibold text-white">
                    <Zap className="size-3" />
                    Most popular
                  </span>
                </div>
              )}

              <div>
                <p className="text-[13px] font-semibold text-gray-500">{plan.name}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-[34px] font-semibold tracking-tight text-gray-950">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-[13px] text-gray-400">/mo</span>
                  )}
                </div>
              </div>

              <ul className="my-7 flex-1 space-y-2.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className={cn(
                      "mt-0.5 size-4 shrink-0",
                      plan.highlighted ? "text-brand" : "text-gray-400"
                    )} />
                    <span className="text-[13px] text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>

              {planId === "free" ? (
                <a
                  href={user ? "/dashboard" : "/sign-up"}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-black/[0.08] bg-gray-50 py-2.5 text-[13px] font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  {user ? "Go to dashboard" : "Get started free"}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => handleCheckout(planId)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-medium transition",
                    plan.highlighted
                      ? "bg-brand text-white hover:bg-brand/90"
                      : "bg-gray-950 text-white hover:bg-gray-800"
                  )}
                >
                  Get {plan.name}
                  <ArrowRight className="size-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-[12px] text-gray-400">
        Payments processed securely by{" "}
        <span className="font-medium text-gray-600">Paddle</span> — your Merchant of Record.
        Cancel anytime. Questions?{" "}
        <a href="mailto:support@formlayer.co" className="underline hover:text-gray-600">Contact us</a>.
      </p>
    </div>
  );
}
