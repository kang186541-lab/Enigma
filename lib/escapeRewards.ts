/**
 * Escape-room reward side effects.
 *
 * `handlePuzzleSolved` (app/story-scene.tsx:7710) lives inside the StoryScene
 * component and isn't exported, so we replicate the same standalone-lib calls it
 * makes for the puzzles it counts as "language" quizzes. The three escape clue
 * words (open / key / free) are each *produced* by the learner (spoken, built,
 * written), so a "language/mastery" contract is correct here — they belong in the
 * Expression Book, are marked mastered (stage-4 parity), and seed the SRS.
 *
 * Same imports story-scene uses:
 *   addToExpressionBook / markExpressionsMastered / trackQuizIO  → @/lib/storyUtils
 *   addPhrases (as addSrsPhrases)                                → @/lib/srsManager
 */

import { addToExpressionBook, markExpressionsMastered, trackQuizIO } from "@/lib/storyUtils";
import { addPhrases as addSrsPhrases } from "@/lib/srsManager";
import type { EscapeRoom, Tri } from "@/lib/escapeRooms";

/** Resolve a Tri to the learner's target language (id/ar fall back to en). */
function triResolve(t: Tri, learningLang: string): string {
  if (learningLang === "korean") return t.ko;
  if (learningLang === "spanish") return t.es;
  if (learningLang === "indonesian") return t.id ?? t.en;
  if (learningLang === "arabic") return t.ar ?? t.en;
  return t.en;
}

/**
 * Fire-and-forget the reward side effects for completing a room. Mirrors
 * handlePuzzleSolved: awardXp, addToExpressionBook, markExpressionsMastered (the
 * clue words were produced, so mastery is legitimate), addSrsPhrases (dedupes by
 * phrase), trackQuizIO. Each persistence call is independently guarded so one
 * AsyncStorage failure can't block the win flow.
 *
 * Idempotency is the caller's responsibility — invoke exactly once per escape
 * (escape-room.tsx uses a wonRef guard + an idempotent WIN reducer action).
 */
export async function awardEscapeRewards(
  room: EscapeRoom,
  learningLang: string,
  awardXp: (amount: number) => Promise<void>,
  _score: number | null,
): Promise<void> {
  // XP first (mirrors handlePuzzleSolved awarding before the tracking writes).
  try {
    await awardXp(room.xpOnEscape);
  } catch (e) {
    console.warn("[Escape] awardXp failed:", e);
  }

  const exprs = room.locks.map((l) => triResolve(l.clue.word, learningLang)).filter(Boolean);
  const chapter = room.expressionChapter; // "escape-archive"

  // Expression Book + mastery (stage 4 = mastered) + SRS seeding + I/O tracking.
  addToExpressionBook(exprs, chapter, 4).catch((e: unknown) => console.warn("[Escape] addToExpressionBook failed:", e));
  markExpressionsMastered(exprs).catch((e: unknown) => console.warn("[Escape] markExpressionsMastered failed:", e));

  const srsPhrases = exprs.map((phrase) => ({
    phrase,
    meaning: `${chapter} · escape`,
    source: `escape-${room.id}`,
  }));
  addSrsPhrases(srsPhrases).catch((e: unknown) => console.warn("[Escape] addSrsPhrases failed:", e));

  // "writing" is the closest output-category quizType in storyUtils' map; the
  // room's productive locks (speak/build/write) are output, so this nudges the
  // chapter I/O ratio toward output rather than input.
  trackQuizIO(chapter, "writing").catch((e: unknown) => console.warn("[Escape] trackQuizIO failed:", e));
}
