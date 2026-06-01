import OpenAI from "openai";

/**
 * DeepSeek client — OpenAI-compatible chat/completions.
 *
 * When DEEPSEEK_API_KEY is set, DeepSeek-V3 (`deepseek-chat`) becomes the
 * PRIMARY text provider in completeText(): ~10x cheaper than gpt-4o with
 * comparable quality on the app's tutor/learning tasks across KO/EN/ES/ID
 * (verified live by scripts/llm-eval.mjs — matched or beat the premium
 * baseline on 4 of 5 representative cases, including Korean correction +
 * Korean production), and it keeps live credit when the OpenAI / Anthropic
 * quotas are exhausted — so the tutor keeps actually working.
 *
 * Vision (completeImageText) uses Gemini first when configured, then the
 * existing OpenAI/Claude vision fallback. Moderation stays on OpenAI:
 * `deepseek-chat` is text-only.
 *
 * Safe to import when DEEPSEEK_API_KEY is unset — gate calls behind
 * hasDeepSeek(); completeText() then falls back to its prior OpenAI-first path
 * with zero behavior change.
 */
export const deepseek = process.env.DEEPSEEK_API_KEY
  ? new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1",
    })
  : null;

/** DeepSeek chat model. Override with DEEPSEEK_MODEL (e.g. "deepseek-reasoner"). */
export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

export function hasDeepSeek(): boolean {
  return deepseek !== null;
}
