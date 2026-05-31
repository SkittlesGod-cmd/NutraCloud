import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getAIClient } from "@/lib/ai/client";
import { getUserSubscription } from "@/lib/billing/subscription";
import { canUseAgents } from "@/lib/billing/plans";
import { checkRateLimit } from "@/lib/ratelimit";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };

const AGENT_SYSTEM = `You are an expert supplement formulator AI agent. Your role is to autonomously create complete, clinically-dosed supplement formulations based on a goal.

Return ONLY a valid JSON object — no markdown, no explanation — in this exact shape:
{
  "name": "Product name (concise, marketable)",
  "description": "1-2 sentence product description",
  "target_population": "Target user population",
  "product_type": "capsule" | "tablet" | "softgel" | "gummy" | "powder" | "liquid",
  "serving_size": "e.g. '2 capsules' or '1 scoop (10g)'",
  "capsule_size": "#0 (0.68 mL)" (string, only include if product_type is capsule),
  "capsules_per_serving": 2 (number, only include if product_type is capsule),
  "ingredients": [
    {
      "name": "Full ingredient name including form, e.g. 'Magnesium Glycinate'",
      "dose": "500",
      "unit": "mg" | "g" | "mcg" | "IU" | "billion CFU",
      "rationale": "1 sentence: primary mechanism and why this dose"
    }
  ],
  "notes": "Usage instructions, timing, cycling notes, and any important warnings"
}

Rules:
- 6–16 ingredients appropriate for the stated goal
- Use clinically-studied doses from published human RCTs where available
- Prioritize synergistic combinations; avoid known antagonisms
- Doses must realistically fit the format (e.g. check capsule fill weights)
- Do NOT include ingredients without a clear mechanistic rationale
- Return valid JSON only — no markdown fences, no prose outside JSON`;

function enc(event: string, data: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify({ event, data }) + "\n");
}

function extractJson(raw: string): unknown | null {
  try { return JSON.parse(raw.trim()); } catch {}
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(raw.slice(start, end + 1)); } catch {}
  return null;
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id: agentId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ event: "error", data: { message: "Unauthorized" } }) + "\n", { status: 401 });
  }

  const sub = await getUserSubscription(user.id);
  if (!canUseAgents(sub.plan)) {
    return new Response(JSON.stringify({ event: "error", data: { message: "Pro plan required" } }) + "\n", { status: 403 });
  }

  const { allowed } = await checkRateLimit(user.id);
  if (!allowed) {
    return new Response(JSON.stringify({ event: "error", data: { message: "Rate limit exceeded" } }) + "\n", { status: 429 });
  }

  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("id", agentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!agent) {
    return new Response(JSON.stringify({ event: "error", data: { message: "Agent not found" } }) + "\n", { status: 404 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ event: "error", data: { message: "Invalid JSON" } }) + "\n", { status: 400 });
  }

  const parsed = z.object({ goal: z.string().min(1).max(2000) }).safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ event: "error", data: { message: "Goal is required" } }) + "\n", { status: 400 });
  }

  const { goal } = parsed.data;

  // Create a run record
  const { data: run } = await supabase
    .from("agent_runs")
    .insert({ agent_id: agentId, user_id: user.id, goal, status: "running" })
    .select()
    .single();

  const runId = run?.id;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(enc("log", { message: "Analyzing your goal…" }));

        // Build the prompt with agent context
        const contextLines: string[] = [];
        if (agent.persona) contextLines.push(`Agent persona: ${agent.persona}`);
        if (agent.target_population) contextLines.push(`Default target population: ${agent.target_population}`);
        if (agent.product_type) contextLines.push(`Preferred product type: ${agent.product_type}`);

        const userPrompt = [
          contextLines.length > 0 ? contextLines.join("\n") + "\n" : "",
          `Goal: ${goal}`,
          "",
          "Return the formulation JSON now.",
        ].join("\n");

        controller.enqueue(enc("log", { message: `Running on ${agent.model.split("/").pop()?.replace(":free", "") ?? agent.model}…` }));

        const ai = getAIClient();
        const completion = await ai.chat.completions.create({
          model: agent.model,
          max_tokens: 4096,
          messages: [
            { role: "system", content: AGENT_SYSTEM },
            { role: "user", content: userPrompt },
          ],
        });

        const raw = completion.choices[0]?.message?.content ?? "";
        const formData = extractJson(raw) as Record<string, unknown> | null;

        if (!formData || !formData.name || !Array.isArray(formData.ingredients)) {
          throw new Error("AI did not return a valid formulation. Try rephrasing your goal.");
        }

        controller.enqueue(enc("log", { message: "Formulation planned — saving to workspace…" }));

        // Sanitize ingredients
        const ingredients = (formData.ingredients as any[]).map((ing, i) => ({
          id: `${Date.now()}-${i}`,
          name: String(ing.name ?? ""),
          dose: ing.dose != null ? String(ing.dose) : null,
          unit: String(ing.unit ?? "mg"),
          rationale: ing.rationale ? String(ing.rationale) : null,
          notes: null,
        }));

        // Create formulation in DB
        const { data: formulation, error: formErr } = await supabase
          .from("formulations")
          .insert({
            user_id: user.id,
            name: String(formData.name),
            description: formData.description ? String(formData.description) : null,
            product_type: formData.product_type ? String(formData.product_type) : null,
            target_population: formData.target_population ? String(formData.target_population) : null,
            serving_size: formData.serving_size ? String(formData.serving_size) : null,
            capsule_size: formData.capsule_size ? String(formData.capsule_size) : null,
            capsules_per_serving: typeof formData.capsules_per_serving === "number" ? formData.capsules_per_serving : null,
            notes: formData.notes ? String(formData.notes) : null,
            ingredients,
            status: "draft",
          })
          .select()
          .single();

        if (formErr || !formulation) throw new Error(formErr?.message ?? "Failed to save formulation");

        // Mark run complete
        if (runId) {
          await supabase
            .from("agent_runs")
            .update({ status: "complete", formulation_id: formulation.id })
            .eq("id", runId);
        }

        if (agent.auto_enrich) {
          controller.enqueue(enc("log", { message: `Enriching evidence for ${ingredients.length} ingredients…` }));
          for (const ing of ingredients) {
            if (!ing.name) continue;
            try {
              await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/ai/ingredient`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Cookie: req.headers.get("cookie") ?? "" },
                body: JSON.stringify({ ingredient_id: ing.id, formulation_id: formulation.id }),
              });
            } catch {}
          }
          controller.enqueue(enc("log", { message: "Evidence enrichment complete." }));
        }

        controller.enqueue(enc("complete", {
          formulation: {
            id: formulation.id,
            name: formulation.name,
            ingredient_count: ingredients.length,
            url: `/dashboard/formulations/${formulation.id}`,
          },
        }));
      } catch (err: any) {
        if (runId) {
          await supabase
            .from("agent_runs")
            .update({ status: "failed", error_message: err?.message ?? "Unknown error" })
            .eq("id", runId);
        }
        controller.enqueue(enc("error", { message: err?.message ?? "Agent run failed" }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
