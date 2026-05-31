"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronLeft,
  ExternalLink,
  Loader2,
  Play,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { AGENT_MODELS, getModel, TIER_BADGE } from "@/lib/agents/models";
import { PRODUCT_TYPES, PRODUCT_TYPE_LABELS, TARGET_POPULATIONS } from "@/lib/formulations/types";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  description: string | null;
  model: string;
  persona: string | null;
  target_population: string | null;
  product_type: string | null;
  auto_enrich: boolean;
  created_at: string;
  updated_at: string;
}

interface AgentRun {
  id: string;
  goal: string;
  status: "running" | "complete" | "failed";
  formulation_id: string | null;
  created_at: string;
}

interface RunEvent {
  event: "log" | "complete" | "error";
  data: Record<string, unknown>;
}

function relativeDate(iso: string) {
  const d = new Date(iso);
  const diffD = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (diffD === 0) return "Today";
  if (diffD === 1) return "Yesterday";
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const INPUT = "h-9 w-full rounded-lg border border-black/[0.08] bg-white px-3 text-[13px] outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/15";
const LABEL = "text-[11px] font-semibold uppercase tracking-widest text-gray-400";

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Edit form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    model: AGENT_MODELS[0].id,
    persona: "",
    target_population: "",
    product_type: "",
    auto_enrich: false,
  });

  // Run state
  const [goal, setGoal] = useState("");
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [runResult, setRunResult] = useState<{ id: string; name: string; ingredient_count: number; url: string } | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/agents/${id}`)
      .then(r => r.json())
      .then(j => {
        if (j.agent) {
          setAgent(j.agent);
          setRuns(j.runs ?? []);
          setForm({
            name: j.agent.name,
            description: j.agent.description ?? "",
            model: j.agent.model,
            persona: j.agent.persona ?? "",
            target_population: j.agent.target_population ?? "",
            product_type: j.agent.product_type ?? "",
            auto_enrich: j.agent.auto_enrich ?? false,
          });
        }
      })
      .catch(() => toast.error("Failed to load agent"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm(f => ({ ...f, [key]: value }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/agents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          model: form.model,
          persona: form.persona || null,
          target_population: form.target_population || null,
          product_type: form.product_type || null,
          auto_enrich: form.auto_enrich,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Failed to save");
      setAgent(j.agent);
      setDirty(false);
      toast.success("Agent saved");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/agents/${id}`, { method: "DELETE" });
      toast.success("Agent deleted");
      router.push("/dashboard/agents");
    } catch {
      toast.error("Failed to delete");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  async function handleRun() {
    if (!goal.trim() || running) return;
    setRunning(true);
    setLogs([]);
    setRunResult(null);
    setRunError(null);

    try {
      const res = await fetch(`/api/agents/${id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });

      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as any)?.error ?? "Run failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const evt = JSON.parse(line) as RunEvent;
            if (evt.event === "log") {
              setLogs(l => [...l, String(evt.data.message ?? "")]);
            } else if (evt.event === "complete") {
              const f = evt.data.formulation as any;
              setRunResult(f);
              setRuns(r => [{
                id: Date.now().toString(),
                goal,
                status: "complete",
                formulation_id: f.id,
                created_at: new Date().toISOString(),
              }, ...r]);
            } else if (evt.event === "error") {
              setRunError(String(evt.data.message ?? "Agent run failed"));
            }
          } catch {}
        }
      }
    } catch (e: any) {
      setRunError(e.message ?? "Run failed");
    } finally {
      setRunning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="py-20 text-center">
        <p className="text-[13px] text-gray-500">Agent not found.</p>
        <Link href="/dashboard/agents" className="mt-3 inline-block text-[12px] text-brand hover:underline">Back to agents</Link>
      </div>
    );
  }

  const currentModel = getModel(form.model);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/dashboard/agents" className="inline-flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-700 transition">
            <ChevronLeft className="size-3.5" />
            Agents
          </Link>
          <div className="mt-2 flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg border border-black/[0.06] bg-gray-50">
              <Bot className="size-4 text-brand" />
            </div>
            <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-gray-950">{agent.name}</h1>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", TIER_BADGE[currentModel.tier])}>
              {currentModel.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-[13px] font-medium text-white transition hover:bg-brand/90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Save changes
            </button>
          )}
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-[12px] font-medium text-red-500 transition hover:bg-red-50"
          >
            <Trash2 className="size-3.5" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
        {/* Left: Run panel */}
        <div className="space-y-4">
          {/* Goal input + run */}
          <div className="rounded-xl border border-black/[0.06] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="border-b border-black/[0.05] px-5 py-3.5">
              <h2 className="text-[13px] font-semibold text-gray-900">Run agent</h2>
              <p className="mt-0.5 text-[11px] text-gray-400">
                Describe what you want to build — the agent will plan and create a complete formulation.
              </p>
            </div>
            <div className="p-5 space-y-3">
              <textarea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                rows={4}
                placeholder={`e.g. "Create a high-stimulant pre-workout for experienced athletes with a 2-scoop powder format, focused on strength and endurance"`}
                disabled={running}
                className="w-full resize-none rounded-lg border border-black/[0.08] bg-white px-3 py-2.5 text-[13px] leading-relaxed outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:opacity-50"
              />
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-gray-400">
                  Using <span className="font-medium text-gray-700">{currentModel.label}</span>
                  {agent.target_population && <> · <span className="font-medium text-gray-700">{agent.target_population}</span></>}
                </p>
                <button
                  onClick={handleRun}
                  disabled={running || !goal.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-gray-950 px-4 py-2 text-[13px] font-medium text-white transition hover:bg-gray-800 disabled:opacity-40"
                >
                  {running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
                  {running ? "Running…" : "Run agent"}
                </button>
              </div>
            </div>
          </div>

          {/* Live log */}
          {(logs.length > 0 || runResult || runError) && (
            <div className="rounded-xl border border-black/[0.06] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="border-b border-black/[0.05] px-5 py-3.5 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-gray-900">Agent log</h2>
                {!running && (runResult || runError) && (
                  <button
                    onClick={() => { setLogs([]); setRunResult(null); setRunError(null); }}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700"
                  >
                    <RotateCcw className="size-3" />
                    Clear
                  </button>
                )}
              </div>
              <div className="p-5 space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px] text-gray-600">
                    <span className="size-1.5 shrink-0 rounded-full bg-brand/50" />
                    {log}
                    {i === logs.length - 1 && running && (
                      <Loader2 className="size-3 animate-spin text-brand ml-1" />
                    )}
                  </div>
                ))}

                {runResult && (
                  <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500">
                        <Check className="size-3 text-white" />
                      </span>
                      <p className="text-[13px] font-semibold text-emerald-900">Formulation created</p>
                    </div>
                    <p className="text-[12px] text-emerald-800 font-medium">{runResult.name}</p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">{runResult.ingredient_count} ingredients</p>
                    <Link
                      href={runResult.url}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Open formulation
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                )}

                {runError && (
                  <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-4">
                    <p className="text-[13px] font-semibold text-red-700">Run failed</p>
                    <p className="mt-1 text-[12px] text-red-600">{runError}</p>
                  </div>
                )}
              </div>
              <div ref={logsEndRef} />
            </div>
          )}

          {/* Run history */}
          {runs.length > 0 && (
            <div className="rounded-xl border border-black/[0.06] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
              <div className="border-b border-black/[0.05] px-5 py-3.5">
                <h2 className="text-[13px] font-semibold text-gray-900">
                  Run history
                  <span className="ml-2 font-mono text-[11px] text-gray-400">{runs.length}</span>
                </h2>
              </div>
              <ul className="divide-y divide-black/[0.04]">
                {runs.map(run => (
                  <li key={run.id} className="flex items-start gap-3 px-5 py-3">
                    <span className={cn(
                      "mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      run.status === "complete" ? "bg-emerald-100 text-emerald-700" :
                      run.status === "failed" ? "bg-red-100 text-red-600" :
                      "bg-amber-100 text-amber-700"
                    )}>
                      {run.status}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-gray-700 line-clamp-2">{run.goal}</p>
                      <p className="mt-0.5 text-[11px] text-gray-400">{relativeDate(run.created_at)}</p>
                    </div>
                    {run.formulation_id && (
                      <Link
                        href={`/dashboard/formulations/${run.formulation_id}`}
                        className="shrink-0 flex items-center gap-1 text-[11px] font-medium text-brand hover:underline"
                      >
                        View <ArrowRight className="size-3" />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: Config panel */}
        <div className="space-y-4">
          <div className="rounded-xl border border-black/[0.06] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="border-b border-black/[0.05] px-5 py-3.5">
              <h2 className="text-[13px] font-semibold text-gray-900">Agent configuration</h2>
            </div>
            <div className="space-y-4 p-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className={LABEL}>Name</label>
                <input type="text" value={form.name} onChange={e => update("name", e.target.value)} className={INPUT} />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className={LABEL}>Description</label>
                <input type="text" value={form.description} onChange={e => update("description", e.target.value)}
                  placeholder="What does this agent specialize in?" className={INPUT} />
              </div>

              {/* Model */}
              <div className="space-y-1.5">
                <label className={LABEL}>AI Model</label>
                <select value={form.model} onChange={e => update("model", e.target.value)}
                  className={INPUT}>
                  {AGENT_MODELS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.label} · {m.description}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400">{currentModel.description} · {currentModel.contextK}K context</p>
              </div>

              {/* Persona */}
              <div className="space-y-1.5">
                <label className={LABEL}>Agent persona</label>
                <textarea
                  value={form.persona}
                  onChange={e => update("persona", e.target.value)}
                  rows={4}
                  placeholder={`e.g. "You specialize in sports nutrition for male athletes aged 20–35. Prioritize ingredients with Grade A evidence. Prefer powder format. Always include creatine monohydrate in strength-focused stacks."`}
                  className="w-full resize-none rounded-lg border border-black/[0.08] bg-white px-3 py-2.5 text-[13px] leading-relaxed outline-none transition placeholder:text-gray-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
                />
                <p className="text-[11px] text-gray-400">Added to every run as context. Be specific about preferences, constraints, and priorities.</p>
              </div>

              {/* Target population */}
              <div className="space-y-1.5">
                <label className={LABEL}>Default target population</label>
                <select value={form.target_population} onChange={e => update("target_population", e.target.value)} className={INPUT}>
                  <option value="">Not specified</option>
                  {TARGET_POPULATIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Product type */}
              <div className="space-y-1.5">
                <label className={LABEL}>Default product type</label>
                <select value={form.product_type} onChange={e => update("product_type", e.target.value)} className={INPUT}>
                  <option value="">Let agent decide</option>
                  {PRODUCT_TYPES.map(t => (
                    <option key={t} value={t}>{PRODUCT_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              {/* Auto enrich */}
              <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-black/[0.06] bg-gray-50 p-4">
                <input
                  type="checkbox"
                  checked={form.auto_enrich}
                  onChange={e => update("auto_enrich", e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-black/20 accent-brand"
                />
                <div>
                  <p className="text-[13px] font-medium text-gray-900">Auto-enrich with PubMed evidence</p>
                  <p className="mt-0.5 text-[11px] text-gray-500">
                    After creating the formulation, automatically fetch clinical evidence grades, dose assessments, and PubMed citations for every ingredient. Takes ~30s longer.
                  </p>
                </div>
              </label>

              {dirty && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-950 py-2.5 text-[13px] font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
                  {saving ? "Saving…" : "Save changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)]">
            <h3 className="text-[15px] font-semibold text-gray-950">Delete agent?</h3>
            <p className="mt-1.5 text-[13px] text-gray-500">
              "{agent.name}" and its run history will be permanently removed.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(false)} disabled={deleting}
                className="rounded-lg border border-black/[0.08] px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-black/[0.02]">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-red-700 disabled:opacity-60">
                {deleting && <Loader2 className="size-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
