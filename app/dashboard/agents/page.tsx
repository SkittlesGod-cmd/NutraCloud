"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Plus, Zap } from "lucide-react";
import { AGENT_MODELS, getModel, TIER_BADGE } from "@/lib/agents/models";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  model: string;
  persona: string | null;
  auto_enrich: boolean;
  created_at: string;
}

function relativeDate(iso: string) {
  const d = new Date(iso);
  const diffD = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (diffD === 0) return "Today";
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", model: AGENT_MODELS[0].id });

  useEffect(() => {
    fetch("/api/agents")
      .then(r => r.json())
      .then(j => {
        if (j.upgrade) { setIsPro(false); return; }
        setAgents(j.agents ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const j = await res.json();
      if (res.ok) {
        setAgents(a => [j.agent, ...a]);
        setShowCreate(false);
        setForm({ name: "", description: "", model: AGENT_MODELS[0].id });
      }
    } finally {
      setCreating(false);
    }
  }

  if (!isPro) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Pro Feature</p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-gray-950">AI Agent Builder</h1>
        </div>
        <div className="rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/[0.04] to-brand/[0.01] p-10 text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl border border-brand/20 bg-white shadow-sm">
            <Bot className="size-7 text-brand" />
          </div>
          <h2 className="text-[18px] font-semibold tracking-tight text-gray-950">Unlock AI Agent Builder</h2>
          <p className="mt-2 mx-auto max-w-md text-[13px] leading-relaxed text-gray-500">
            Create custom formulation agents powered by GPT-4o, Claude 3.5, Gemini, and more. Configure each agent&apos;s persona, target population, and product constraints — then give it a goal and watch it build a complete, evidence-backed formulation in seconds.
          </p>
          <div className="mt-6 grid max-w-sm mx-auto gap-2 text-left">
            {["Choose from 8 AI models including Claude & GPT-4o", "Configure agent persona and formulation constraints", "Auto-enrich ingredients with PubMed evidence", "Builds full formulation in your workspace instantly"].map(f => (
              <div key={f} className="flex items-center gap-2 text-[12px] text-gray-700">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand text-[9px] font-bold">✓</span>
                {f}
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/billing"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-6 py-3 text-[13px] font-semibold text-white transition hover:bg-gray-800"
          >
            <Zap className="size-4" />
            Upgrade to Pro — $149/mo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Pro</p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-gray-950">AI Agents</h1>
          <p className="mt-1 text-[13px] text-gray-500">Configure AI agents that autonomously build complete formulations.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-lg bg-gray-950 px-3.5 py-2 text-[13px] font-medium text-white transition hover:bg-gray-800"
        >
          <Plus className="size-3.5" />
          New agent
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
            <h2 className="text-[16px] font-semibold text-gray-950">New agent</h2>
            <p className="mt-1 text-[12px] text-gray-400">You can configure persona, constraints and model after creation.</p>
            <form onSubmit={handleCreate} className="mt-5 space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Sports Nutrition Specialist"
                  className="mt-1.5 h-9 w-full rounded-lg border border-black/[0.08] bg-white px-3 text-[13px] outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Description (optional)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What will this agent specialize in?"
                  className="mt-1.5 h-9 w-full rounded-lg border border-black/[0.08] bg-white px-3 text-[13px] outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">AI Model</label>
                <select
                  value={form.model}
                  onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                  className="mt-1.5 h-9 w-full rounded-lg border border-black/[0.08] bg-white px-3 text-[13px] outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                >
                  {AGENT_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.label} ({m.tier})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="rounded-lg border border-black/[0.08] px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-black/[0.02]">
                  Cancel
                </button>
                <button type="submit" disabled={creating || !form.name.trim()}
                  className="rounded-lg bg-gray-950 px-4 py-2 text-[13px] font-medium text-white hover:bg-gray-800 disabled:opacity-50">
                  {creating ? "Creating…" : "Create agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-black/[0.06] bg-white">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 border-b border-black/[0.04] px-5 py-4 last:border-0">
              <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
              <div className="ml-auto h-5 w-20 animate-pulse rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="rounded-xl border border-dashed border-black/[0.08] bg-white py-16 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-black/[0.06] bg-gray-50">
            <Bot className="size-5 text-gray-300" />
          </div>
          <p className="text-[13px] font-medium text-gray-900">No agents yet</p>
          <p className="mt-1 text-[12px] text-gray-400">Create your first agent to start building formulations autonomously.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-gray-950 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-gray-800"
          >
            <Plus className="size-3.5" />
            New agent
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-black/[0.06] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <div className="divide-y divide-black/[0.04]">
            {agents.map(agent => {
              const m = getModel(agent.model);
              return (
                <Link
                  key={agent.id}
                  href={`/dashboard/agents/${agent.id}`}
                  className="group flex items-center gap-4 px-5 py-4 transition hover:bg-black/[0.02]"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-black/[0.06] bg-gray-50 group-hover:border-brand/20 group-hover:bg-brand/[0.04] transition">
                    <Bot className="size-4 text-gray-400 group-hover:text-brand transition" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 group-hover:text-brand transition-colors truncate">
                      {agent.name}
                    </p>
                    {agent.description && (
                      <p className="mt-0.5 text-[11px] text-gray-400 truncate">{agent.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", TIER_BADGE[m.tier])}>
                      {m.label}
                    </span>
                    <span className="text-[11px] text-gray-400">{relativeDate(agent.created_at)}</span>
                    <ArrowRight className="size-3.5 text-gray-300 group-hover:text-brand transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
