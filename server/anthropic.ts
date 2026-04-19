import Anthropic from "@anthropic-ai/sdk";

/**
 * Shared Anthropic client. Used for tasks where Claude outperforms GPT —
 * notably multilingual evaluation (Korean/Japanese/Chinese target language)
 * where GPT-4o has a documented bias of flagging correct non-Roman-script
 * answers as "unintelligible."
 *
 * Safe to import even if ANTHROPIC_API_KEY is unset: the consumer should
 * gate calls behind `hasAnthropic()` and fall back to OpenAI when false.
 */
export const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export function hasAnthropic(): boolean {
  return anthropic !== null;
}
