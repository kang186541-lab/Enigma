import { describe, it, expect } from "@jest/globals";
import {
  getTodaysSentence,
  DAILY_SENTENCES,
  type DailySentence,
} from "@/lib/dailySentence";
import type { NativeLanguage } from "@/context/LanguageContext";

// dailySentence.ts only imports a `type` from LanguageContext (erased at
// compile), so this module is fully pure — no react-native / expo / supabase.

const LANGS: NativeLanguage[] = ["korean", "english", "spanish"];

// Re-derive the source's day index so we can assert WHICH sentence is picked
// without hard-coding a calendar date (the test must pass on any day).
function expectedIndex(bankLength: number): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) / 86_400_000;
  const dayOfYear = Math.floor(diff);
  return dayOfYear % bankLength;
}

describe("getTodaysSentence", () => {
  it("returns a non-null DailySentence for all 3 languages (beginner band stocked)", () => {
    for (const lang of LANGS) {
      const sentence = getTodaysSentence(lang);
      expect(sentence).not.toBeNull();
    }
  });

  it("returns a sentence with text, a meaning for all 3 native langs, and a day", () => {
    for (const lang of LANGS) {
      const sentence = getTodaysSentence(lang) as DailySentence;
      expect(typeof sentence.text).toBe("string");
      expect(sentence.text.length).toBeGreaterThan(0);

      // meaning must be keyed by all three native languages.
      expect(typeof sentence.meaning).toBe("object");
      for (const native of LANGS) {
        expect(typeof sentence.meaning[native]).toBe("string");
        expect(sentence.meaning[native].length).toBeGreaterThan(0);
      }

      expect(typeof sentence.day).toBe("number");
      expect(sentence.day).toBeGreaterThanOrEqual(1);
    }
  });

  it("is deterministic: two calls on the same day return the same sentence", () => {
    for (const lang of LANGS) {
      const first = getTodaysSentence(lang);
      const second = getTodaysSentence(lang);
      // Same calendar day -> same picked object (referential + structural).
      expect(second).toBe(first);
      expect(second).toEqual(first);
    }
  });

  it("picks the day-of-year-indexed entry from the beginner band", () => {
    for (const lang of LANGS) {
      const bank = DAILY_SENTENCES[lang][0];
      const idx = expectedIndex(bank.length);
      expect(getTodaysSentence(lang)).toEqual(bank[idx]);
    }
  });

  it("each language has a 7-sentence beginner band and 2 reserved (empty) bands", () => {
    for (const lang of LANGS) {
      const bands = DAILY_SENTENCES[lang];
      expect(bands).toHaveLength(3);
      expect(bands[0]).toHaveLength(7);
      expect(bands[1]).toHaveLength(0); // intermediate — reserved
      expect(bands[2]).toHaveLength(0); // advanced — reserved
    }
  });
});
