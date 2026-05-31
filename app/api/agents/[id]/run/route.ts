import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getAIClient } from "@/lib/ai/client";
import { getUserSubscription } from "@/lib/billing/subscription";
import { canUseAgents } from "@/lib/billing/plans";
import { checkRateLimit } from "@/lib/ratelimit";
import { checkGoalSafety, AGENT_DAILY_LIMIT } from "@/lib/agents/safety";
import { parseJsonObject } from "@/lib/ai/json";
import { getErrorMessage } from "@/lib/errors";
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
- Structure/function claims only — no disease treatment claims
- Return valid JSON only — no markdown fences, no prose outside JSON`;

function enc(event: string, data: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify({ event, data }) + "\n");
}

function errResponse(message: string, status: number) {
  return new Response(JSON.stringify({ event: "error", data: { message } }) + "\n", { status });
}

const generatedIngredientSchema = z.object({
  name: z.string().min(1),
  dose: z.unknown().optional(),
  unit: z.unknown().optional(),
  rationale: z.unknown().optional(),
});

const generatedFormulationSchema = z.object({
  name: z.string().min(1),
  description: z.unknown().optional(),
  target_population: z.unknown().optional(),
  product_type: z.unknown().optional(),
  serving_size: z.unknown().optional(),
  capsule_size: z.unknown().optional(),
  capsules_per_serving: z.unknown().optional(),
  notes: z.unknown().optional(),
  ingredients: z.array(generatedIngredientSchema).min(1),
});

async function getDailyRunCount(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("agent_runs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", today.toISOString());
  return count ?? 0;
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id: agentId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return errResponse("Unauthorized", 401);

  const sub = await getUserSubscription(user.id);
  if (!canUseAgents(sub.plan)) return errResponse("Agent Builder requires a Pro plan. Upgrade at /dashboard/billing.", 403);

  // Per-minute rate limit (shared with other AI calls)
  const { allowed } = await checkRateLimit(user.id);
  if (!allowed) return errResponse("Too many requests. Wait a moment and try again.", 429);

  // Daily run limit
  const todayCount = await getDailyRunCount(supabase, user.id);
  if (todayCount >= AGENT_DAILY_LIMIT) {
    return errResponse(`Daily agent run limit reached (${AGENT_DAILY_LIMIT}/day). Limit resets at midnight UTC.`, 429);
  }

  const { data: agent } = await supabase
    .from("agents")
    .select("*")
    .eq("id", agentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!agent) return errResponse("Agent not found.", 404);

  let body: unknown;
  try { body = await req.json(); } catch {
    return errResponse("Invalid request body.", 400);
  }

  const parsed = z.object({ goal: z.string().min(1).max(2000) }).safeParse(body);
  if (!parsed.success) return errResponse("A goal is required to run the agent.", 400);

  const { goal } = parsed.data;

  // Content safety check
  const safety = checkGoalSafety(goal);
  if (!safety.allowed) return errResponse(safety.reason!, 422);

  // Create run record (status: running)
  const { data: run } = await supabase
    .from("agent_runs")
    .insert({ agent_id: agentId, user_id: user.id, goal, status: "running" })
    .select("id")
    .single();

  const runId = run?.id;

  const runsRemaining = AGENT_DAILY_LIMIT - todayCount - 1;

  const stream = new ReadableStream({
    async start(controller) {
      // 90-second hard timeout — prevent stuck runs
      const timeout = setTimeout(() => {
        controller.enqueue(enc("error", { message: "Agent run timed out after 90 seconds." }));
        controller.close();
        if (runId) {
          supabase.from("agent_runs")
            .update({ status: "failed", error_message: "Timed out" })
            .eq("id", runId)
            .then(() => {});
        }
      }, 90_000);

      try {
        controller.enqueue(enc("log", { message: "Checking goal for safety…" }));
        controller.enqueue(enc("log", { message: "Analyzing goal and planning formulation…" }));

        const modelLabel = agent.model.split("/").pop()?.replace(":free", "") ?? agent.model;
        controller.enqueue(enc("log", { message: `Running on ${modelLabel}…` }));

        // Build prompt with agent context
        const contextLines: string[] = [];
        if (agent.persona) contextLines.push(`Agent persona: ${agent.persona}`);
        if (agent.target_population) contextLines.push(`Default target population: ${agent.target_population}`);
        if (agent.product_type) contextLines.push(`Preferred product type: ${agent.product_type}`);

        const userPrompt = [
          contextLines.length > 0 ? contextLines.join("\n") : "",
          `Goal: ${goal}`,
          "",
          "Return the formulation JSON now.",
        ].filter(Boolean).join("\n");

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
        const formDataResult = generatedFormulationSchema.safeParse(parseJsonObject(raw));

        if (!formDataResult.success) {
          throw new Error("The model did not return a valid formulation. Try rephrasing your goal or switching to a different model.");
        }

        const formData = formDataResult.data;
        controller.enqueue(enc("log", { message: `Planned ${formData.ingredients.length} ingredients — saving to workspace…` }));

        // Sanitize ingredients
        const ingredients = formData.ingredients
          .filter(ing => ing.name && String(ing.name).trim().length > 0)
          .slice(0, 20) // hard cap at 20 ingredients
          .map((ing, i) => ({
            id: `${Date.now()}-${i}`,
            name: String(ing.name).trim().slice(0, 200),
            dose: ing.dose != null ? String(ing.dose).replace(/[^0-9.]/g, "").slice(0, 20) : null,
            unit: ["mg", "g", "mcg", "IU", "billion CFU", "mcg RAE"].includes(String(ing.unit))
              ? String(ing.unit) : "mg",
            rationale: ing.rationale ? String(ing.rationale).trim().slice(0, 500) : null,
            notes: null,
          }));

        if (ingredients.length === 0) throw new Error("No valid ingredients were generated. Try a more specific goal.");

        // Sanitize top-level fields
        const name = String(formData.name).trim().slice(0, 200);
        const description = formData.description ? String(formData.description).trim().slice(0, 1000) : null;
        const product_type = ["capsule","tablet","softgel","gummy","powder","liquid","topical","strip"].includes(String(formData.product_type))
          ? String(formData.product_type) : null;
        const target_population = formData.target_population ? String(formData.target_population).trim().slice(0, 100) : null;
        const serving_size = formData.serving_size ? String(formData.serving_size).trim().slice(0, 100) : null;
        const capsule_size = formData.capsule_size ? String(formData.capsule_size).trim().slice(0, 50) : null;
        const capsules_per_serving = typeof formData.capsules_per_serving === "number"
          ? Math.min(Math.max(1, Math.round(formData.capsules_per_serving)), 10) : null;
        const notes = formData.notes ? String(formData.notes).trim().slice(0, 3000) : null;

        const { data: formulation, error: formErr } = await supabase
          .from("formulations")
          .insert({
            user_id: user.id,
            name,
            description,
            product_type,
            target_population,
            serving_size,
            capsule_size,
            capsules_per_serving,
            notes,
            ingredients,
            status: "draft",
          })
          .select()
          .single();

        if (formErr || !formulation) throw new Error("Failed to save formulation. Please try again.");

        if (runId) {
          await supabase.from("agent_runs")
            .update({ status: "complete", formulation_id: formulation.id })
            .eq("id", runId);
        }

        if (agent.auto_enrich) {
          controller.enqueue(enc("log", { message: `Enriching PubMed evidence for ${ingredients.length} ingredients…` }));
          let enriched = 0;
          for (const ing of ingredients) {
            if (!ing.name) continue;
            try {
              const r = await fetch(
                `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/ai/ingredient`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Cookie: req.headers.get("cookie") ?? "" },
                  body: JSON.stringify({ ingredient_id: ing.id, formulation_id: formulation.id }),
                }
              );
              if (r.ok) enriched++;
            } catch {}
          }
          controller.enqueue(enc("log", { message: `Evidence enriched for ${enriched}/${ingredients.length} ingredients.` }));
        }

        clearTimeout(timeout);
        controller.enqueue(enc("complete", {
          formulation: {
            id: formulation.id,
            name: formulation.name,
            ingredient_count: ingredients.length,
            url: `/dashboard/formulations/${formulation.id}`,
          },
          runs_remaining: runsRemaining,
        }));
      } catch (err: unknown) {
        clearTimeout(timeout);
        const msg = getErrorMessage(err, "Agent run failed. Please try again.");
        if (runId) {
          await supabase.from("agent_runs")
            .update({ status: "failed", error_message: msg })
            .eq("id", runId);
        }
        controller.enqueue(enc("error", { message: msg }));
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
