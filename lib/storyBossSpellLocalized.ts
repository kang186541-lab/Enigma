/**
 * Per-language boss-spell overrides for story chapters.
 *
 * WHY: The BossSpellPuzzle assemble puzzle renders `spellChunks` / `wordPool`
 * as RAW strings and matches a tapped card to the expected chunk by EXACT
 * STRING EQUALITY (components/story/puzzles/BossSpellPuzzle/index.tsx:244).
 * Those three arrays are plain `string[]` (NOT a per-language Tri), so the boss
 * always rendered the chapter's authored (English/Korean) chunks regardless of
 * the learner's target language — a Spanish learner finished a chapter of
 * Spanish quizzes, then had to assemble an ENGLISH sentence at the boss.
 *
 * Localizing naively in the data is unsafe: word order, chunk count and
 * separators differ per language, and a wrong separator breaks `buildSpell`'s
 * assembly. So the verified per-language {spellChunks, separators, wordPool}
 * sets live here (each one assembly-checked against buildSpell), and the story
 * render swaps them in for the learner's language via `localizeStoryBoss`.
 *
 * The h3 answer reveal and the door engraving are derived from `spellText =
 * buildSpell(spellChunks, separators)` (BossSpellPuzzle index.tsx:116, 313-322,
 * 489), so overriding the chunks automatically localizes the revealed answer
 * too — no hint edits needed.
 *
 * INVARIANTS per entry (verified by agent workflow + verify:story-curriculum):
 *   - separators.length === spellChunks.length
 *   - every spellChunks entry is a DISTINCT string (engine dedupes by string;
 *     a duplicate makes the puzzle unsolvable)
 *   - wordPool is a distinct superset of spellChunks (+ a few distractors)
 *
 * Ch3 Seoul is intentionally ABSENT: it is the Korean-immersion chapter, its
 * boss is the locked verify-speaking-core Korean speaking target, and its
 * polite/casual register lesson is Korean-specific — so every learner does the
 * Korean boss there by design.
 */

import type { BossSpellQuestion } from "@/components/story/puzzles/BossSpellPuzzle";

export type BossSpellOverride = Pick<BossSpellQuestion, "spellChunks" | "separators" | "wordPool">;

/** storyId → learningLang ("korean"|"spanish"|"indonesian"|"arabic") → override */
export const STORY_BOSS_SPELL_LOCALIZED: Record<string, Partial<Record<string, BossSpellOverride>>> = {
  // Ch2 Madrid — "I am happy. Where is the festival? It is beautiful."
  madrid: {
    korean: {
      spellChunks: ["저는 행복해요", "축제는", "어디에서 열려요", "정말 아름다워요"],
      separators: [".", " ", "?", "."],
      wordPool: ["저는 행복해요", "축제는", "어디에서 열려요", "정말 아름다워요", "얼마예요", "고맙습니다", "빵 주세요"],
    },
    spanish: {
      spellChunks: ["Estoy feliz", "¿Dónde es", "el festival", "Es hermoso"],
      separators: [".", " ", "?", "."],
      wordPool: ["Estoy feliz", "¿Dónde es", "el festival", "Es hermoso", "¿Cuánto cuesta", "Gracias", "Pan por favor"],
    },
    indonesian: {
      spellChunks: ["Saya senang", "Di mana", "festivalnya", "Itu indah"],
      separators: [".", " ", "?", "."],
      wordPool: ["Saya senang", "Di mana", "festivalnya", "Itu indah", "Berapa harganya", "Terima kasih", "Tolong rotinya"],
    },
    arabic: {
      spellChunks: ["أَنَا سَعِيد", "أَيْنَ", "المِهْرَجَان", "هٰذَا جَمِيل"],
      separators: [".", " ", "؟", "."],
      wordPool: ["أَنَا سَعِيد", "أَيْنَ", "المِهْرَجَان", "هٰذَا جَمِيل", "بِكَمْ", "شُكْرًا", "خُبْز مِنْ فَضْلِك"],
    },
  },

  // Ch4 Cairo — "I remember. She wrote the lullaby. Where is the record?"
  cairo: {
    korean: {
      spellChunks: ["저는 기억해요", "그녀가", "자장가를", "썼어요", "음반은", "어디에 있어요?"],
      separators: [". ", " ", " ", ". ", " ", ""],
      wordPool: ["저는 기억해요", "그녀가", "자장가를", "썼어요", "음반은", "어디에 있어요?", "저는 잊어요", "써요", "노래를"],
    },
    spanish: {
      spellChunks: ["Yo recuerdo", "Ella escribió", "la nana", "¿Dónde está", "el disco?"],
      separators: [". ", " ", ". ", " ", ""],
      wordPool: ["Yo recuerdo", "Ella escribió", "la nana", "¿Dónde está", "el disco?", "Yo olvido", "Ella escribe", "la canción"],
    },
    indonesian: {
      spellChunks: ["Saya ingat", "Dia menulis", "nina bobo itu", "Di mana", "piringannya?"],
      separators: [". ", " ", ". ", " ", ""],
      wordPool: ["Saya ingat", "Dia menulis", "nina bobo itu", "Di mana", "piringannya?", "Saya lupa", "Dia menyanyikan", "lagunya"],
    },
    arabic: {
      spellChunks: ["أَنَا أَتَذَكَّر", "هِيَ كَتَبَتْ", "التَّهْوِيدَة", "أَيْنَ", "السِّجِلّ؟"],
      separators: [". ", " ", ". ", " ", ""],
      wordPool: ["أَنَا أَتَذَكَّر", "هِيَ كَتَبَتْ", "التَّهْوِيدَة", "أَيْنَ", "السِّجِلّ؟", "أَنَا نَسِيت", "هِيَ تَكْتُب", "الأُغْنِيَة"],
    },
  },

  // Ch5 Babel — "You translated the words. You couldn't translate why she said them."
  babel: {
    korean: {
      spellChunks: ["당신은", "말을 번역했어요", "하지만 당신은", "왜 그녀가", "그 말을 했는지는", "번역하지 못했어요"],
      separators: [" ", ". ", " ", " ", " ", "."],
      wordPool: ["당신은", "말을 번역했어요", "하지만 당신은", "왜 그녀가", "그 말을 했는지는", "번역하지 못했어요", "당신은 멈췄어요", "그 의미를", "당신은 속삭였어요"],
    },
    spanish: {
      spellChunks: ["Tradujiste", "las palabras", "No pudiste", "traducir", "por qué ella", "las dijo"],
      separators: [" ", ". ", " ", " ", " ", "."],
      wordPool: ["Tradujiste", "las palabras", "No pudiste", "traducir", "por qué ella", "las dijo", "Detuviste", "los significados", "Susurraste"],
    },
    indonesian: {
      spellChunks: ["Kamu menerjemahkan", "kata-katanya", "Kamu tak bisa", "menerjemahkan", "mengapa dia", "mengucapkannya"],
      separators: [" ", ". ", " ", " ", " ", "."],
      wordPool: ["Kamu menerjemahkan", "kata-katanya", "Kamu tak bisa", "menerjemahkan", "mengapa dia", "mengucapkannya", "Kamu menghentikan", "maknanya", "Kamu membisikkan"],
    },
    arabic: {
      spellChunks: ["أَنْتَ تَرْجَمْتَ", "الكَلِمَات", "لَمْ تَسْتَطِعْ", "أَنْ تُتَرْجِمَ", "لِمَاذَا", "قَالَتْهَا"],
      separators: [" ", ". ", " ", " ", " ", "."],
      wordPool: ["أَنْتَ تَرْجَمْتَ", "الكَلِمَات", "لَمْ تَسْتَطِعْ", "أَنْ تُتَرْجِمَ", "لِمَاذَا", "قَالَتْهَا", "أَنْتَ أَوْقَفْتَ", "المَعَانِي", "أَنْتَ هَمَسْتَ"],
    },
  },
};

/**
 * Swap a boss-spell puzzle's chunk arrays for the learner's language, when an
 * override exists. Returns the puzzle unchanged for English learners and for
 * chapters with no override (e.g. Seoul). Pure; only the three raw arrays change.
 */
export function localizeStoryBoss<T extends { questions: [BossSpellQuestion] }>(
  puzzle: T,
  storyId: string,
  learningLang: string,
): T {
  const ov = STORY_BOSS_SPELL_LOCALIZED[storyId]?.[learningLang];
  if (!ov) return puzzle;
  const q0 = puzzle.questions[0];
  return { ...puzzle, questions: [{ ...q0, ...ov }] } as T;
}
