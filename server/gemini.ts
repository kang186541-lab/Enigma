import OpenAI from "openai";

/**
 * Gemini client for vision-only tasks.
 *
 * Text tutoring stays on the DeepSeek -> OpenAI -> Claude chain in aiText.ts.
 * When GEMINI_API_KEY is set, completeImageText() uses Gemini 2.5 Flash first
 * for handwriting/image recognition, then falls back to the existing OpenAI
 * and Claude vision path if Gemini is unavailable.
 */
export const gemini = process.env.GEMINI_API_KEY
  ? new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: process.env.GEMINI_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta/openai/",
    })
  : null;

export const GEMINI_VISION_MODEL = process.env.GEMINI_VISION_MODEL ?? "gemini-2.5-flash";

export function hasGemini(): boolean {
  return gemini !== null;
}
