export type ModelTier = "free" | "standard" | "premium";

export interface AgentModel {
  id: string;
  label: string;
  description: string;
  tier: ModelTier;
  contextK: number;
}

export const AGENT_MODELS: AgentModel[] = [
  // ── Free ────────────────────────────────────────────────────────────────────
  {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    label: "Nemotron 3 Super 120B",
    description: "NVIDIA · 1M context · FormLayer default",
    tier: "free",
    contextK: 1000,
  },
  {
    id: "google/gemma-4-31b-it:free",
    label: "Gemma 4 31B",
    description: "Google · 262K context · strong instruction following",
    tier: "free",
    contextK: 262,
  },
  {
    id: "moonshotai/kimi-k2.6:free",
    label: "Kimi K2.6",
    description: "MoonshotAI · 262K context · fast and capable",
    tier: "free",
    contextK: 262,
  },
  {
    id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    label: "Nemotron Nano Omni",
    description: "NVIDIA · 256K context · chain-of-thought reasoning",
    tier: "free",
    contextK: 256,
  },
  // ── Standard ────────────────────────────────────────────────────────────────
  {
    id: "google/gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
    description: "Google · fast, affordable, multimodal",
    tier: "standard",
    contextK: 1000,
  },
  {
    id: "deepseek/deepseek-v4-flash",
    label: "DeepSeek V4 Flash",
    description: "DeepSeek · very low cost, high quality",
    tier: "standard",
    contextK: 128,
  },
  {
    id: "openai/gpt-5.4-mini",
    label: "GPT-5.4 Mini",
    description: "OpenAI · fast and affordable",
    tier: "standard",
    contextK: 128,
  },
  {
    id: "mistralai/mistral-small-2603",
    label: "Mistral Small",
    description: "Mistral AI · efficient, good JSON output",
    tier: "standard",
    contextK: 32,
  },
  // ── Premium ─────────────────────────────────────────────────────────────────
  {
    id: "anthropic/claude-opus-4.7",
    label: "Claude Opus 4.7",
    description: "Anthropic · best reasoning and scientific accuracy",
    tier: "premium",
    contextK: 200,
  },
  {
    id: "openai/gpt-5.4",
    label: "GPT-5.4",
    description: "OpenAI · flagship model",
    tier: "premium",
    contextK: 128,
  },
  {
    id: "openai/gpt-5.5",
    label: "GPT-5.5",
    description: "OpenAI · most capable, highest quality",
    tier: "premium",
    contextK: 128,
  },
  {
    id: "deepseek/deepseek-v4-pro",
    label: "DeepSeek V4 Pro",
    description: "DeepSeek · pro-grade, excellent STEM reasoning",
    tier: "premium",
    contextK: 128,
  },
];

export const DEFAULT_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";

export function getModel(id: string): AgentModel {
  return AGENT_MODELS.find(m => m.id === id) ?? AGENT_MODELS[0];
}

export const TIER_BADGE: Record<ModelTier, string> = {
  free:     "bg-gray-100 text-gray-500",
  standard: "bg-blue-100 text-blue-700",
  premium:  "bg-amber-100 text-amber-700",
};
