import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getAIClient(): OpenAI {
  if (!_client) {
    const key = process.env.GROQ_API_KEY;
    if (!key) {
      throw new Error("GROQ_API_KEY is not configured.");
    }
    _client = new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: key,
    });
  }
  return _client;
}

// Llama 3.3 70B on Groq — fast inference, ~14,400 free req/day
export const MODEL = "llama-3.3-70b-versatile";

// Same model for compliance
export const MODEL_COMPLIANCE = "llama-3.3-70b-versatile";

export const MAX_TOKENS = 8000;
export const MAX_TOKENS_FORMULATE = 16000;
