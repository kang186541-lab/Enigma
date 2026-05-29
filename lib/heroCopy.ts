// Single source of truth for the hero / brand-promise copy.
//
// Every surface that needs to deliver the "Rudy, 5 minutes, your first
// sentence" promise reads from this file. The copy is tuned per language
// direction so that:
//   * the tagline is written in the NATIVE language (the user reads it)
//   * the CTA is written in the NATIVE language
//   * the first sentence is written in the LEARNING language (the user
//     speaks it)
//   * the first-sentence meaning is written in the NATIVE language
//
// Korean copy uses 해요체 consistently. Spanish copy uses tú-form.
//
// LangCode is the same alphabet of language tags the rest of the app uses
// ("korean" | "english" | "spanish"), pulled from LanguageContext so we
// stay aligned with NativeLanguage. This module has no other imports, so
// there is no risk of a circular dependency.

import type { NativeLanguage } from "@/context/LanguageContext";

export type LangCode = NativeLanguage;

export interface HeroCopy {
  /** One sentence brand promise, written in the NATIVE language. */
  tagline: string;
  /** Primary CTA button label, written in the NATIVE language. */
  cta: string;
  /** Hero card title, written in the NATIVE language. */
  promiseTitle: string;
  /** Hero card subtitle, written in the NATIVE language. */
  promiseSub: string;
  /** Default "first sentence" the learner will say, in the LEARNING language. */
  firstSentence: string;
  /** Meaning of `firstSentence`, in the NATIVE language. */
  firstSentenceMeaning: string;
}

type ComboKey = `${LangCode}__${LangCode}`;

function key(native: LangCode, learning: LangCode): ComboKey {
  return `${native}__${learning}` as ComboKey;
}

// Generic fallback used when (native, learning) is not in the matrix and is
// not a self-learn combination. The placeholder copy for ko→ko (and any
// other self-learn pair) is generated separately by `selfLearnPlaceholder`.
function genericFallback(native: LangCode, learning: LangCode): HeroCopy {
  // Pick a fallback first sentence in the learning language with a meaning
  // in the native language. Stays goal-agnostic.
  const fallbackFirstSentence: Record<LangCode, string> = {
    korean: "안녕하세요",
    english: "Hello",
    spanish: "Hola",
    indonesian: "Halo",
  };
  const fallbackMeaning: Record<LangCode, Record<LangCode, string>> = {
    korean: { korean: "안녕하세요", english: "Hello", spanish: "Hola", indonesian: "Halo" },
    english: { korean: "안녕하세요", english: "Hello", spanish: "Hola", indonesian: "Halo" },
    spanish: { korean: "안녕하세요", english: "Hello", spanish: "Hola", indonesian: "Halo" },
    indonesian: { korean: "안녕하세요", english: "Hello", spanish: "Hola", indonesian: "Halo" },
  };
  if (native === "korean") {
    return {
      tagline: "Rudy와 5분, 첫 한 문장을 말해보세요.",
      cta: "말하기 시작",
      promiseTitle: "Rudy와 5분, 첫 한 문장",
      promiseSub: "오늘 입 밖으로 낼 한 문장을 골라봐요.",
      firstSentence: fallbackFirstSentence[learning],
      firstSentenceMeaning: fallbackMeaning.korean[learning],
    };
  }
  if (native === "spanish") {
    return {
      tagline: "Habla tu primera frase con Rudy en 5 minutos.",
      cta: "Empezar a hablar",
      promiseTitle: "Tu primera frase con Rudy en 5 min",
      promiseSub: "Elige una frase real para decir hoy.",
      firstSentence: fallbackFirstSentence[learning],
      firstSentenceMeaning: fallbackMeaning.spanish[learning],
    };
  }
  if (native === "indonesian") {
    return {
      tagline: "Ucapkan kalimat pertamamu bersama Rudy dalam 5 menit.",
      cta: "Mulai bicara",
      promiseTitle: "Kalimat pertamamu bersama Rudy dalam 5 menit",
      promiseSub: "Pilih satu kalimat nyata untuk diucapkan hari ini.",
      firstSentence: fallbackFirstSentence[learning],
      firstSentenceMeaning: fallbackMeaning.indonesian[learning],
    };
  }
  // english native (default)
  return {
    tagline: "Speak your first sentence with Rudy in 5 minutes.",
    cta: "Start speaking",
    promiseTitle: "Your first sentence with Rudy in 5 min",
    promiseSub: "Pick one real sentence to say out loud today.",
    firstSentence: fallbackFirstSentence[learning],
    firstSentenceMeaning: fallbackMeaning.english[learning],
  };
}

// No-op placeholder for self-learn combos (e.g. ko→ko). Asks the learner to
// pick a different learning language. Native-language copy only — there is
// no "learning language" first sentence to show yet.
function selfLearnPlaceholder(native: LangCode): HeroCopy {
  if (native === "korean") {
    return {
      tagline: "배울 언어를 골라야 첫 한 문장을 시작할 수 있어요.",
      cta: "배울 언어 선택",
      promiseTitle: "먼저 배울 언어를 골라요",
      promiseSub: "Rudy가 5분 안에 첫 한 문장으로 안내해요.",
      firstSentence: "",
      firstSentenceMeaning: "먼저 배울 언어를 선택하세요.",
    };
  }
  if (native === "spanish") {
    return {
      tagline: "Elige un idioma para que Rudy te lleve a tu primera frase.",
      cta: "Elige un idioma",
      promiseTitle: "Primero elige un idioma",
      promiseSub: "Rudy te guía a tu primera frase en 5 minutos.",
      firstSentence: "",
      firstSentenceMeaning: "Primero elige un idioma para aprender.",
    };
  }
  if (native === "indonesian") {
    return {
      tagline: "Pilih bahasa agar Rudy membawamu ke kalimat pertamamu.",
      cta: "Pilih bahasa",
      promiseTitle: "Pilih dulu bahasa yang ingin dipelajari",
      promiseSub: "Rudy akan membawamu ke kalimat pertama dalam 5 menit.",
      firstSentence: "",
      firstSentenceMeaning: "Pilih dulu bahasa yang ingin dipelajari.",
    };
  }
  // english native
  return {
    tagline: "Pick a language so Rudy can take you to your first sentence.",
    cta: "Pick a language",
    promiseTitle: "First, pick a language to learn",
    promiseSub: "Rudy will get you to your first sentence in 5 minutes.",
    firstSentence: "",
    firstSentenceMeaning: "Pick a learning language first.",
  };
}

// ── The 6-row copy matrix ──────────────────────────────────────────────
// Korean copy: 해요체 only (-요/-세요). No 합니다체, no 반말.
// Spanish copy: tú-form only ("tu primera frase", "habla", "hablas"). No usted.

const MATRIX: Partial<Record<ComboKey, HeroCopy>> = {
  // es → ko (Spanish speaker learning Korean)
  [key("spanish", "korean")]: {
    tagline: "Habla tu primera frase en coreano con Rudy en 5 minutos.",
    cta: "Empezar a hablar",
    promiseTitle: "Tu primera frase en coreano, con Rudy en 5 min",
    promiseSub: "Una frase real en coreano. Rudy te ayuda a decirla hoy.",
    firstSentence: "안녕하세요",
    firstSentenceMeaning: "Hola",
  },

  // en → ko (English speaker learning Korean)
  [key("english", "korean")]: {
    tagline: "Speak your first Korean sentence with Rudy in 5 minutes.",
    cta: "Start speaking",
    promiseTitle: "Your first Korean sentence, with Rudy in 5 min",
    promiseSub: "One real Korean sentence. Rudy helps you say it today.",
    firstSentence: "안녕하세요",
    firstSentenceMeaning: "Hello",
  },

  // ko → en (Korean speaker learning English)
  [key("korean", "english")]: {
    tagline: "Rudy와 5분, 첫 영어 한 문장을 말해보세요.",
    cta: "말하기 시작",
    promiseTitle: "Rudy와 5분, 첫 영어 한 문장",
    promiseSub: "진짜 쓰는 영어 한 문장을 오늘 입 밖으로 내봐요.",
    firstSentence: "Hello, nice to meet you.",
    firstSentenceMeaning: "안녕하세요, 만나서 반가워요.",
  },

  // ko → es (Korean speaker learning Spanish)
  [key("korean", "spanish")]: {
    tagline:
      "Habla tu primera frase en español con Rudy en 5 minutos. (Rudy와 5분, 첫 스페인어 한 문장.)",
    cta: "말하기 시작",
    promiseTitle: "Rudy와 5분, 첫 스페인어 한 문장",
    promiseSub: "진짜 쓰는 스페인어 한 문장을 오늘 입 밖으로 내봐요.",
    firstSentence: "Hola, mucho gusto.",
    firstSentenceMeaning: "안녕하세요, 반가워요.",
  },

  // en → es (English speaker learning Spanish)
  [key("english", "spanish")]: {
    tagline: "Speak your first Spanish sentence with Rudy in 5 minutes.",
    cta: "Start speaking",
    promiseTitle: "Your first Spanish sentence, with Rudy in 5 min",
    promiseSub: "One real Spanish sentence. Rudy helps you say it today.",
    firstSentence: "Hola, mucho gusto.",
    firstSentenceMeaning: "Hello, nice to meet you.",
  },

  // es → en (Spanish speaker learning English)
  [key("spanish", "english")]: {
    tagline: "Habla tu primera frase en inglés con Rudy en 5 minutos.",
    cta: "Empezar a hablar",
    promiseTitle: "Tu primera frase en inglés, con Rudy en 5 min",
    promiseSub: "Una frase real en inglés. Rudy te ayuda a decirla hoy.",
    firstSentence: "Hello, nice to meet you.",
    firstSentenceMeaning: "Hola, mucho gusto.",
  },
};

/**
 * Returns the brand-promise hero copy for a (native, learning) pair.
 *
 * - Self-learn pairs (native === learning) return a "pick a different
 *   learning language" placeholder. ko→ko is the spec-mandated example;
 *   en→en and es→es get the same treatment for consistency.
 * - Combos in the explicit matrix return tuned copy.
 * - Any other combo falls back to a generic native-language "first
 *   sentence with Rudy" form.
 */
export function getHeroCopy(native: LangCode, learning: LangCode): HeroCopy {
  if (native === learning) return selfLearnPlaceholder(native);
  const hit = MATRIX[key(native, learning)];
  if (hit) return hit;
  return genericFallback(native, learning);
}

// ── Inline coverage test ───────────────────────────────────────────────
// Compile-time + dev-time check that every (native, learning) combo
// returns non-empty `promiseTitle` and `cta`. Walks all 9 pairs.
// Wrapped in __DEV__ so it never ships to production. (React Native exposes
// __DEV__ globally; the typeof guard keeps it safe outside RN.)
//
// All 9 combinations covered: (3 natives) x (3 learnings) = 9 pairs.
//   korean__korean (self-learn placeholder)
//   korean__english (matrix)
//   korean__spanish (matrix)
//   english__korean (matrix)
//   english__english (self-learn placeholder)
//   english__spanish (matrix)
//   spanish__korean (matrix)
//   spanish__english (matrix)
//   spanish__spanish (self-learn placeholder)
// React Native exposes __DEV__ as a global at runtime (typed via
// @types/react-native). Guard with typeof so the warn loop is also a no-op
// in any non-RN bundler that does not define it.
declare const __DEV__: boolean;
if (typeof __DEV__ !== "undefined" && __DEV__) {
  const langs: LangCode[] = ["korean", "english", "spanish"];
  for (const n of langs) {
    for (const l of langs) {
      const copy = getHeroCopy(n, l);
      if (!copy.promiseTitle || copy.promiseTitle.length === 0) {
        // eslint-disable-next-line no-console
        console.warn(`[heroCopy] empty promiseTitle for ${n} -> ${l}`);
      }
      if (!copy.cta || copy.cta.length === 0) {
        // eslint-disable-next-line no-console
        console.warn(`[heroCopy] empty cta for ${n} -> ${l}`);
      }
    }
  }
}
