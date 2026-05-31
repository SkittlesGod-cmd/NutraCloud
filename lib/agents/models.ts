export type ModelTier = "free" | "standard" | "premium";

export interface AgentModel {
  id: string;
  label: string;
  description: string;
  tier: ModelTier;
  contextK: number;
}

export const AGENT_MODELS: AgentModel[] = [
  {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    label: "Nemotron 120B",
    description: "Fast, free — FormLayer default",
    tier: "free",
    contextK: 128,
  },
  {
    id: "meta-llama/llama-3.1-70b-instruct:free",
    label: "Llama 3.1 70B",
    description: "Open-source, free via OpenRouter",
    tier: "free",
    contextK: 128,
  },
  {
    id: "mistralai/mixtral-8x7b-instruct:free",
    label: "Mixtral 8x7B",
    description: "Efficient mixture-of-experts",
    tier: "free",
    contextK: 32,
  },
  {
    id: "deepseek/deepseek-chat",
    label: "DeepSeek V3",
    description: "High quality, very low cost",
    tier: "standard",
    contextK: 64,
  },
  {
    id: "openai/gpt-4o-mini",
    label: "GPT-4o Mini",
    description: "Fast and affordable from OpenAI",
    tier: "standard",
    contextK: 128,
  },
  {
    id: "openai/gpt-4o",
    label: "GPT-4o",
    description: "OpenAI flagship — best reasoning",
    tier: "premium",
    contextK: 128,
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    label: "Claude 3.5 Sonnet",
    description: "Anthropic's best for complex tasks",
    tier: "premium",
    contextK: 200,
  },
  {
    id: "google/gemini-pro-1.5",
    label: "Gemini 1.5 Pro",
    description: "Google's advanced multimodal model",
    tier: "premium",
    contextK: 1000,
  },
];

export const DEFAULT_MODEL = AGENT_MODELS[0].id;

export function getModel(id: string): AgentModel {
  return AGENT_MODELS.find(m => m.id === id) ?? AGENT_MODELS[0];
}

export const TIER_BADGE: Record<ModelTier, string> = {
  free:     "bg-gray-100 text-gray-500",
  standard: "bg-blue-100 text-blue-700",
  premium:  "bg-amber-100 text-amber-700",
};
