/**
 * Content moderation helper.
 *
 * Wraps OpenAI's `omni-moderation-latest` endpoint so we can gate chat
 * endpoints (mission-chat, chat) against abuse without rolling our own
 * classifier.
 *
 * Failure mode
 * ------------
 * Fails OPEN. If the OpenAI call errors, the SDK is unreachable, or the
 * response shape is unexpected we return `{ flagged: false }`. A moderation
 * outage MUST NOT break learning — better to occasionally let through a
 * borderline message than block a student's whole session.
 *
 * Skip rules (enforced by the caller, not here)
 * ---------------------------------------------
 *  - Korean character input under 20 chars → skip moderation entirely.
 *    Most very-short Korean utterances are basic greetings or noise that
 *    waste API quota and add latency. The caller checks length and script
 *    before calling `moderateText`. This helper does NOT short-circuit on
 *    length; it always calls the API when invoked.
 *
 * Tests (inline notes — not executed)
 * -----------------------------------
 *  - moderateText("normal hello") → { flagged: false }.
 *  - moderateText("I will hurt someone") → { flagged: true, category: <one of>.
 *  - When openai.moderations.create rejects, returns { flagged: false } and
 *    logs once via console.warn (no throw, no rejection).
 *  - When the response has `results: []` (impossible per OpenAI docs but
 *    we defensive-code it), returns { flagged: false }.
 *  - The `category` returned is one of the documented Moderation.Categories
 *    keys (e.g. "harassment", "sexual", "violence"), never an empty string.
 */

import { openai } from "./openai";

export interface ModerationResult {
  flagged: boolean;
  category?: string;
}

/**
 * Run text through OpenAI's omni-moderation classifier.
 *
 * Always resolves — never throws. On error returns `{ flagged: false }` so
 * downstream handlers can treat the result as "safe to continue".
 */
export async function moderateText(text: string): Promise<ModerationResult> {
  if (!text || typeof text !== "string") {
    return { flagged: false };
  }
  try {
    const resp = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: text,
    });
    const result = resp.results?.[0];
    if (!result) {
      return { flagged: false };
    }
    if (!result.flagged) {
      return { flagged: false };
    }
    // Find which category tripped. Pick the first `true` category for the
    // log/UX message. `categories` is keyed by the documented category name.
    const cats = result.categories as unknown as Record<string, boolean | null>;
    let category: string | undefined;
    for (const key of Object.keys(cats)) {
      if (cats[key] === true) {
        category = key;
        break;
      }
    }
    return { flagged: true, category };
  } catch (err) {
    // Fail open. Log once so we can spot a sustained outage in dashboards,
    // but never propagate the error.
    console.warn("[moderation] omni-moderation-latest call failed; failing open:", err);
    return { flagged: false };
  }
}

/**
 * Localised "please keep it appropriate" reply for the UI languages.
 * The chat endpoints select by `nativeLang` (ko/en/es/id); anything else falls
 * back to English.
 */
export const MODERATION_SAFE_REPLY: Record<"ko" | "en" | "es" | "id", string> = {
  ko: "대화는 적절하게 유지해 주세요. 다시 시도해 보세요!",
  en: "Let's keep the conversation appropriate. Try again!",
  es: "Mantengamos la conversación apropiada. ¡Inténtalo de nuevo!",
  id: "Jaga percakapan tetap sopan. Coba lagi!",
};

/** Pick the localised reply for a `nativeLang` code, defaulting to English. */
export function safeReplyFor(nativeLang: string | undefined): string {
  if (nativeLang === "ko" || nativeLang === "en" || nativeLang === "es" || nativeLang === "id") {
    return MODERATION_SAFE_REPLY[nativeLang];
  }
  return MODERATION_SAFE_REPLY.en;
}

/**
 * The skip rule: very short Korean utterances bypass moderation. Returns
 * `true` if the caller should NOT call `moderateText` for this input.
 *
 * "Korean character" = Hangul Syllables (U+AC00–U+D7A3) OR Hangul Jamo
 * (U+1100–U+11FF, U+3130–U+318F). We test for presence of at least one
 * such char AND length < 20.
 */
export function shouldSkipModeration(text: string): boolean {
  if (!text) return true; // nothing to moderate
  if (text.length >= 20) return false;
  // Has at least one Hangul character?
  return /[가-힣ᄀ-ᇿ㄰-㆏]/.test(text);
}
