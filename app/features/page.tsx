import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Bot,
  FileText,
  FlaskConical,
  ShieldCheck,
  Share2,
  GitBranch,
  Users,
  Zap,
  BarChart3,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Every feature in FormLayer — AI formulation, FDA compliance scoring, evidence grades, manufacturer handoff, version history, and the AI Agent Builder.",
};

const FEATURE_SECTIONS = [
  {
    icon: FlaskConical,
    eyebrow: "AI Formulation",
    headline: "From health goal to complete ingredient stack — in minutes.",
    body: "Describe what you want to build. FormLayer pulls the clinical evidence, picks the right ingredients, assigns RCT-backed dose ranges, and explains the rationale for every choice. What used to take days of PubMed work takes a single prompt.",
    bullets: [
      { text: "Health-goal–driven formulation", detail: "Describe your target and the AI builds the full stack" },
      { text: "RCT-backed dose ranges", detail: "Every dose sourced from published human trials, not guesswork" },
      { text: "Ingredient interaction flags", detail: "Known antagonisms and synergies surfaced automatically" },
      { text: "Evidence grade per ingredient", detail: "A / B / C rating by volume and quality of human evidence" },
      { text: "Rationale for every ingredient", detail: "Primary mechanism and dose justification included by default" },
      { text: "Product format awareness", detail: "Capsule fill weights, powder density, gummy limits factored in" },
    ],
    tag: "All plans",
    tagColor: "bg-gray-100 text-gray-600",
  },
  {
    icon: ShieldCheck,
    eyebrow: "FDA Compliance",
    headline: "Know your risk score before legal does.",
    body: "Every formulation gets a 100-point compliance score with specific issue flags by ingredient and by claim. Issues below 75 get one-click auto-fix suggestions. Catch label violations in your workspace — not in a legal review that costs $400/hour.",
    bullets: [
      { text: "100-point compliance score", detail: "Scored against FDA structure/function claim rules" },
      { text: "Issue flags by ingredient", detail: "Exactly which ingredient and which claim is the problem" },
      { text: "One-click auto-fix", detail: "Suggested rewrites for common violations — apply or edit" },
      { text: "Runs before anything leaves your workspace", detail: "No surprises at the handoff stage" },
      { text: "Ingredient-level claim review", detail: "Checks both label claims and rationale language" },
    ],
    tag: "All plans",
    tagColor: "bg-gray-100 text-gray-600",
  },
  {
    icon: BookOpen,
    eyebrow: "Ingredient Research",
    headline: "Clinical evidence on demand — no PubMed tab-switching.",
    body: "Search any ingredient or health goal and get a structured research brief: mechanisms of action, key RCTs with n-sizes and effect sizes, evidence-backed dose ranges, safety limits, drug interactions, and FDA-defensible claim language. Add ingredients directly to any formulation.",
    bullets: [
      { text: "Ingredient and goal-based research", detail: "Search by compound name or health objective" },
      { text: "Mechanism of action", detail: "How it works at the cellular and systemic level" },
      { text: "Key clinical trial summaries", detail: "Population, dose, duration, and primary endpoints" },
      { text: "Safety and contraindication data", detail: "Tolerable upper intake, known drug interactions" },
      { text: "Synergistic stacking suggestions", detail: "Compounds that potentiate or complement this ingredient" },
      { text: "Add to formulation in one click", detail: "Dose and unit carry over — no copy-pasting" },
    ],
    tag: "All plans",
    tagColor: "bg-gray-100 text-gray-600",
  },
  {
    icon: FileText,
    eyebrow: "Manufacturer Handoff",
    headline: "A complete brief — ready to send, not ready to fill out.",
    body: "Export a print-ready manufacturer dossier with the Supplement Facts panel, clinical rationale per ingredient, certifications required, and serving size calculations. Share a live link so manufacturers always see your latest spec — not a stale PDF from three revisions ago.",
    bullets: [
      { text: "Auto-generated Supplement Facts panel", detail: "Correct formatting, daily values, and serving size" },
      { text: "Print-ready PDF dossier", detail: "Clinical rationale, dose justification, certifications needed" },
      { text: "AI manufacturer brief", detail: "RFQ-ready summary of your formulation and requirements" },
      { text: "Live share links", detail: "Manufacturers see your latest version — always up to date" },
      { text: "Fill weight and capsule calculations", detail: "Serving size validated against your chosen format" },
    ],
    tag: "Pro",
    tagColor: "bg-brand/10 text-brand",
  },
  {
    icon: Bot,
    eyebrow: "AI Agent Builder",
    headline: "Custom agents that build formulations autonomously.",
    body: "Create AI agents with a custom persona, target population, preferred product format, and AI model. Run them against any goal and they return a complete, saved formulation — including PubMed evidence enrichment — with no manual input. Build a library of agents for every category you work in.",
    bullets: [
      { text: "Custom agent persona and constraints", detail: "Bias the AI toward your specific formulation philosophy" },
      { text: "Model selection", detail: "Choose from free, standard, and premium AI models per agent" },
      { text: "Autonomous formulation runs", detail: "Describe a goal — the agent returns a complete saved formulation" },
      { text: "Auto-enrich with PubMed evidence", detail: "Evidence grades and citations fetched for every ingredient" },
      { text: "Run history and status tracking", detail: "Every run logged with goal, result, and formulation link" },
      { text: "50 runs per day", detail: "Daily limit resets at midnight UTC" },
    ],
    tag: "Pro only",
    tagColor: "bg-brand/10 text-brand",
  },
  {
    icon: GitBranch,
    eyebrow: "Version History",
    headline: "Every save is a snapshot. Restore any prior state.",
    body: "Stop duplicating files and naming them 'final_v4_REAL.xlsx'. Every change to a formulation creates a versioned record — who changed what, when, and from what state. Compare versions and restore any prior iteration in one click.",
    bullets: [
      { text: "Automatic version snapshots on every save" },
      { text: "One-click restore to any prior state" },
      { text: "Change history per formulation" },
      { text: "Compare ingredient changes across versions" },
    ],
    tag: "Pro",
    tagColor: "bg-brand/10 text-brand",
  },
];

const SMALL_FEATURES = [
  {
    icon: BarChart3,
    title: "Usage dashboard",
    body: "See formulation count, compliance scores, and active products across your workspace at a glance.",
  },
  {
    icon: Share2,
    title: "Public share links",
    body: "Branded read-only links for manufacturers, clients, or co-founders — no login required to view.",
  },
  {
    icon: Users,
    title: "Collaborator access",
    body: "Invite team members or clients to individual formulations with controlled access.",
  },
  {
    icon: Zap,
    title: "Priority AI processing",
    body: "Starter and Pro plans route to faster inference — no queuing behind free-tier requests.",
  },
  {
    icon: ShieldCheck,
    title: "Row Level Security",
    body: "Your formulation data is isolated at the database level. Only your account can read or write it.",
  },
  {
    icon: FlaskConical,
    title: "Multi-product workspace",
    body: "Manage every formulation in one place with status tracking across draft, review, and compliant states.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative bg-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="subtle-grid absolute inset-0 opacity-[0.35]" />
          <div
            className="absolute -top-32 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-[0.08]"
            style={{ background: "radial-gradient(ellipse at center, #5b6ee1 0%, transparent 70%)" }}
          />
        </div>
        <div className="page-shell relative pt-20 pb-16 md:pt-28 md:pb-20">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-brand">Features</p>
            <h1 className="mt-4 text-[38px] font-semibold tracking-[-0.03em] text-gray-950 md:text-[50px] leading-[1.08]">
              Every tool your formulation<br className="hidden sm:block" /> workflow needs.
            </h1>
            <p className="mt-6 text-[16px] leading-relaxed text-gray-500 max-w-2xl">
              AI formulation, FDA compliance scoring, clinical evidence research, manufacturer handoff, version history, and an autonomous agent builder — in one connected workspace.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/sign-up"
                className="rounded-full bg-gray-950 px-6 py-3 text-[13px] font-semibold text-white transition hover:bg-gray-800"
              >
                Start for free
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-6 py-3 text-[13px] font-semibold text-gray-900 transition hover:border-black/20 hover:bg-black/[0.02]"
              >
                See pricing <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main feature sections */}
      <section className="bg-gray-50/60 border-t border-black/[0.05] py-16 md:py-24">
        <div className="page-shell space-y-6">
          {FEATURE_SECTIONS.map(({ icon: Icon, eyebrow, headline, body, bullets, tag, tagColor }) => (
            <div
              key={eyebrow}
              className="rounded-2xl border border-black/[0.06] bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)] md:p-10"
            >
              <div className="grid gap-10 lg:grid-cols-[260px_1fr] lg:items-start">
                {/* Left: icon + eyebrow + tag */}
                <div>
                  <div className="inline-flex size-11 items-center justify-center rounded-xl bg-brand/[0.08] text-brand">
                    <Icon className="size-5" />
                  </div>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400">{eyebrow}</p>
                  <span className={`mt-3 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${tagColor}`}>
                    {tag}
                  </span>
                </div>

                {/* Right: copy + bullets */}
                <div>
                  <h2 className="text-[22px] font-semibold tracking-[-0.025em] text-gray-950 leading-snug md:text-[26px]">
                    {headline}
                  </h2>
                  <p className="mt-4 text-[14px] leading-relaxed text-gray-500 max-w-2xl">{body}</p>
                  <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                    {bullets.map((b) => (
                      <li key={b.text} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" />
                        <div>
                          <span className="text-[13px] font-medium text-gray-900">{b.text}</span>
                          {"detail" in b && b.detail && (
                            <span className="text-[12px] text-gray-400"> — {b.detail}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Small features grid */}
      <section className="bg-white py-16 md:py-24">
        <div className="page-shell">
          <div className="mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Also included</p>
            <h2 className="mt-3 text-[26px] font-semibold tracking-[-0.025em] text-gray-950">
              The details that make it production-ready.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SMALL_FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:border-brand/20 hover:shadow-[0_4px_16px_rgba(91,110,225,0.07)] transition-all"
              >
                <div className="inline-flex size-9 items-center justify-center rounded-lg bg-brand/[0.08] text-brand">
                  <Icon className="size-4" />
                </div>
                <h3 className="mt-4 text-[14px] font-semibold text-gray-950">{title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan callout */}
      <section className="border-t border-black/[0.05] bg-gray-50/60 py-14">
        <div className="page-shell">
          <div className="rounded-2xl border border-black/[0.06] bg-white p-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)] md:p-10">
            <div className="grid gap-8 lg:grid-cols-3">
              {[
                {
                  name: "Free",
                  price: "$0",
                  pitch: "AI research, compliance scoring, and Supplement Facts panel — permanently free.",
                  cta: "Start free",
                  href: "/sign-up",
                  style: "border border-black/[0.08] bg-gray-50 text-gray-700 hover:bg-gray-100",
                },
                {
                  name: "Starter — $49/mo",
                  price: null,
                  pitch: "Full AI formulation builder, compliance auto-fix, and PDF export for growing brands.",
                  cta: "Get Starter",
                  href: "/pricing",
                  style: "bg-brand text-white hover:bg-brand/90",
                },
                {
                  name: "Pro — $149/mo",
                  price: null,
                  pitch: "Everything in Starter plus AI Agent Builder, manufacturer handoff, version history, and team collaboration.",
                  cta: "Get Pro",
                  href: "/pricing",
                  style: "bg-gray-950 text-white hover:bg-gray-800",
                },
              ].map(({ name, pitch, cta, href, style }) => (
                <div key={name} className="flex flex-col gap-4">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900">{name}</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">{pitch}</p>
                  </div>
                  <Link
                    href={href}
                    className={`mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition ${style}`}
                  >
                    {cta} <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gray-950 py-20">
        <div className="page-shell text-center">
          <h2 className="text-[28px] font-semibold tracking-[-0.025em] text-white md:text-[34px]">
            Everything you need.<br />Nothing you don&apos;t.
          </h2>
          <p className="mt-4 text-[15px] text-gray-400 max-w-md mx-auto">
            Start with 3 free formulations. No credit card, no setup, no time limit.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sign-up"
              className="rounded-full bg-white px-7 py-3.5 text-[14px] font-semibold text-gray-950 transition hover:bg-gray-100"
            >
              Start for free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-7 py-3.5 text-[14px] font-medium text-white transition hover:border-white/40 hover:bg-white/5"
            >
              Compare plans <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
