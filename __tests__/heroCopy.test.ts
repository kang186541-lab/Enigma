import { describe, it, expect } from "@jest/globals";
import { getHeroCopy, type LangCode } from "@/lib/heroCopy";

// heroCopy.ts only imports a `type` from LanguageContext (erased at compile),
// so this module is fully pure — no react-native / expo / supabase pulled in.

const LANGS: LangCode[] = ["korean", "english", "spanish"];

describe("getHeroCopy", () => {
  it("returns non-empty promiseTitle + cta for ALL 9 (native, learning) combos", () => {
    const combos: [LangCode, LangCode][] = [];
    for (const native of LANGS) {
      for (const learning of LANGS) {
        combos.push([native, learning]);
      }
    }
    expect(combos).toHaveLength(9);

    for (const [native, learning] of combos) {
      const copy = getHeroCopy(native, learning);
      expect(typeof copy.promiseTitle).toBe("string");
      expect(copy.promiseTitle.length).toBeGreaterThan(0);
      expect(typeof copy.cta).toBe("string");
      expect(copy.cta.length).toBeGreaterThan(0);
    }
  });

  it("returns a fully-populated HeroCopy object shape for every combo", () => {
    for (const native of LANGS) {
      for (const learning of LANGS) {
        const copy = getHeroCopy(native, learning);
        // Every documented field must be present and a string.
        for (const field of [
          "tagline",
          "cta",
          "promiseTitle",
          "promiseSub",
          "firstSentence",
          "firstSentenceMeaning",
        ] as const) {
          expect(typeof copy[field]).toBe("string");
        }
      }
    }
  });

  describe("documented matrix taglines (spot-check)", () => {
    it("es -> ko returns the Spanish-learning-Korean tagline", () => {
      const copy = getHeroCopy("spanish", "korean");
      expect(copy.tagline).toBe(
        "Habla tu primera frase en coreano con Rudy en 5 minutos.",
      );
      expect(copy.cta).toBe("Empezar a hablar");
      expect(copy.firstSentence).toBe("안녕하세요");
      expect(copy.firstSentenceMeaning).toBe("Hola");
    });

    it("en -> ko returns the English-learning-Korean tagline", () => {
      const copy = getHeroCopy("english", "korean");
      expect(copy.tagline).toBe(
        "Speak your first Korean sentence with Rudy in 5 minutes.",
      );
      expect(copy.cta).toBe("Start speaking");
      expect(copy.firstSentence).toBe("안녕하세요");
      expect(copy.firstSentenceMeaning).toBe("Hello");
    });

    it("ko -> en returns the Korean-learning-English tagline", () => {
      const copy = getHeroCopy("korean", "english");
      expect(copy.tagline).toBe("Rudy와 5분, 첫 영어 한 문장을 말해보세요.");
      expect(copy.cta).toBe("말하기 시작");
      expect(copy.firstSentence).toBe("Hello, nice to meet you.");
      expect(copy.firstSentenceMeaning).toBe("안녕하세요, 만나서 반가워요.");
    });

    it("ko -> es returns the Korean-learning-Spanish tagline", () => {
      const copy = getHeroCopy("korean", "spanish");
      expect(copy.tagline).toBe(
        "Habla tu primera frase en español con Rudy en 5 minutos. (Rudy와 5분, 첫 스페인어 한 문장.)",
      );
      expect(copy.cta).toBe("말하기 시작");
      expect(copy.firstSentence).toBe("Hola, mucho gusto.");
      expect(copy.firstSentenceMeaning).toBe("안녕하세요, 반가워요.");
    });

    it("en -> es returns the English-learning-Spanish tagline", () => {
      const copy = getHeroCopy("english", "spanish");
      expect(copy.tagline).toBe(
        "Speak your first Spanish sentence with Rudy in 5 minutes.",
      );
      expect(copy.firstSentence).toBe("Hola, mucho gusto.");
    });

    it("es -> en returns the Spanish-learning-English tagline", () => {
      const copy = getHeroCopy("spanish", "english");
      expect(copy.tagline).toBe(
        "Habla tu primera frase en inglés con Rudy en 5 minutos.",
      );
      expect(copy.cta).toBe("Empezar a hablar");
    });
  });

  describe("self-learn placeholder (native === learning)", () => {
    it("ko -> ko returns the placeholder and does not crash", () => {
      const copy = getHeroCopy("korean", "korean");
      expect(copy.promiseTitle).toBe("먼저 배울 언어를 골라요");
      expect(copy.cta).toBe("배울 언어 선택");
      // Self-learn has no learning-language first sentence yet.
      expect(copy.firstSentence).toBe("");
      expect(copy.firstSentenceMeaning).toBe("먼저 배울 언어를 선택하세요.");
    });

    it("en -> en returns the English placeholder", () => {
      const copy = getHeroCopy("english", "english");
      expect(copy.promiseTitle).toBe("First, pick a language to learn");
      expect(copy.cta).toBe("Pick a language");
      expect(copy.firstSentence).toBe("");
    });

    it("es -> es returns the Spanish placeholder", () => {
      const copy = getHeroCopy("spanish", "spanish");
      expect(copy.promiseTitle).toBe("Primero elige un idioma");
      expect(copy.cta).toBe("Elige un idioma");
      expect(copy.firstSentence).toBe("");
    });

    it("all self-learn placeholders still satisfy the non-empty cta/title contract", () => {
      for (const lang of LANGS) {
        const copy = getHeroCopy(lang, lang);
        expect(copy.promiseTitle.length).toBeGreaterThan(0);
        expect(copy.cta.length).toBeGreaterThan(0);
      }
    });
  });
});
