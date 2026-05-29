/**
 * SrsCard → FlashCard adapter.
 *
 * The Cards tab UI was built around a static `FlashCard` schema
 * (`{ word, emoji, pronunciation?, meanings: Record<NativeLanguage,string>,
 *    example, exampleTranslation, speechLang }`) that includes hand-curated
 * presentation fields the SRS engine doesn't track. SrsCard is intentionally
 * minimal (`phrase`, `meaning`, box state). To wire the existing card UI to
 * SRS due reviews without rebuilding the renderer, we adapt one to the other
 * here.
 *
 * Trade-offs:
 *  - SRS card has no per-language meaning record. We fan it out so the
 *    learner's nativeLanguage slot holds the stored meaning and the other
 *    two slots fall back to the same string. This keeps the existing
 *    `card.meanings[nativeLang]` access from breaking when the user
 *    switches languages mid-session.
 *  - SRS card has no emoji / pronunciation / example. We provide stable
 *    defaults so the UI doesn't throw and the screen still feels alive.
 *  - speechLang is derived from `learningLanguage`, mapping the high-level
 *    setting ("english"/"korean"/"spanish") to the BCP-47 code that the
 *    Cards tab's TTS pathway expects.
 */

import type { SrsCard } from "./srsManager";
import type { NativeLanguage } from "@/context/LanguageContext";

// Re-declare the Cards-tab FlashCard shape here so we don't pull a cycle
// through app/(tabs)/cards.tsx. Keep in sync with cards.tsx:23-31.
export interface FlashCardLike {
  word: string;
  emoji: string;
  pronunciation?: string;
  meanings: Record<NativeLanguage, string>;
  example: string;
  exampleTranslation: Record<NativeLanguage, string>;
  speechLang: string;
}

const LEARNING_TO_BCP47: Record<NativeLanguage, string> = {
  korean: "ko-KR",
  english: "en-US",
  spanish: "es-ES",
  indonesian: "id-ID",
};

/** Default emoji for SRS phrases that didn't carry one. The book glyph is
 *  intentionally bookish — these came from lessons / writing / story, not
 *  curated flashcard art. */
const SRS_DEFAULT_EMOJI = "📖";

/**
 * Adapt a single SrsCard to the FlashCard-like shape consumed by
 * `app/(tabs)/cards.tsx`. The adapter is pure — it does not read or write
 * AsyncStorage; the caller is responsible for `getDueCards()` /
 * `recordReview()` orchestration.
 */
export function srsCardToFlashCard(
  srs: SrsCard,
  nativeLang: NativeLanguage,
  learningLang: NativeLanguage,
): FlashCardLike {
  const meaning = srs.meaning ?? "";
  // Fan the single stored meaning into all three slots. The native slot is
  // the source of truth; the other two fall back to it so a language switch
  // doesn't render an empty string.
  const meanings: Record<NativeLanguage, string> = {
    korean: meaning,
    english: meaning,
    spanish: meaning,
    indonesian: meaning,
  };
  meanings[nativeLang] = meaning;

  const exampleTranslation: Record<NativeLanguage, string> = {
    korean: "",
    english: "",
    spanish: "",
    indonesian: "",
  };

  return {
    word: srs.phrase,
    emoji: SRS_DEFAULT_EMOJI,
    pronunciation: undefined,
    meanings,
    example: "",
    exampleTranslation,
    speechLang: LEARNING_TO_BCP47[learningLang] ?? "en-US",
  };
}

/** Bulk adapt for session loading. */
export function srsCardsToFlashCards(
  srsCards: SrsCard[],
  nativeLang: NativeLanguage,
  learningLang: NativeLanguage,
): FlashCardLike[] {
  return srsCards.map((c) => srsCardToFlashCard(c, nativeLang, learningLang));
}
