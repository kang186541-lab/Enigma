// Daily-sentence stub for the Home hero card and onboarding fallback.
//
// Picks one beginner sentence per (learningLang, day-of-year mod 7) — the
// same calendar day picks the same sentence for everyone, so testers and
// the team see the same "today's sentence" on Day-X. Two extra difficulty
// bands (7 sentences each) are reserved as empty arrays so the shape
// matches the "21 sentences per language" roadmap.
//
// TODO(goal-personalisation): replace day-of-year picker with a goal /
// learner-profile driven selector once we have data on which goals
// correlate with retention.
//
// Extracted from app/(tabs)/index.tsx — see commit history. Imports the
// NativeLanguage type from LanguageContext.

import type { NativeLanguage } from "@/context/LanguageContext";

export type DailySentence = {
  /** What the user is asked to say, in `learningLang`. */
  text: string;
  /** Same line translated into `nativeLang`. */
  meaning: Record<NativeLanguage, string>;
  /** Light pronunciation guide / romanization (optional). */
  hint?: string;
  /** "Day N" stamp shown on the hero card. */
  day: number;
};

export const DAILY_SENTENCES: Record<NativeLanguage, DailySentence[][]> = {
  // Sentences someone is LEARNING `korean` should say in Korean.
  korean: [
    // Beginner band — used today.
    [
      {
        text: "안녕하세요, 만나서 반갑습니다.",
        hint: "annyeonghaseyo, mannaseo bangapseumnida",
        meaning: {
          korean: "안녕하세요, 만나서 반갑습니다.",
          english: "Hello, nice to meet you.",
          spanish: "Hola, encantado de conocerte.",
          indonesian: "Halo, senang berkenalan denganmu.",
        },
        day: 1,
      },
      {
        text: "커피 한 잔 주세요.",
        hint: "keopi han jan juseyo",
        meaning: {
          korean: "커피 한 잔 주세요.",
          english: "One coffee, please.",
          spanish: "Un café, por favor.",
          indonesian: "Tolong satu kopi.",
        },
        day: 2,
      },
      {
        text: "이거 얼마예요?",
        hint: "igeo eolmayeyo",
        meaning: {
          korean: "이거 얼마예요?",
          english: "How much is this?",
          spanish: "¿Cuánto cuesta esto?",
          indonesian: "Ini berapa harganya?",
        },
        day: 3,
      },
      {
        text: "화장실은 어디예요?",
        hint: "hwajangsireun eodiyeyo",
        meaning: {
          korean: "화장실은 어디예요?",
          english: "Where is the bathroom?",
          spanish: "¿Dónde está el baño?",
          indonesian: "Toiletnya di mana?",
        },
        day: 4,
      },
      {
        text: "다시 말씀해 주세요.",
        hint: "dasi malsseumhae juseyo",
        meaning: {
          korean: "다시 말씀해 주세요.",
          english: "Could you say that again?",
          spanish: "¿Puede repetirlo, por favor?",
          indonesian: "Bisa diulang sekali lagi?",
        },
        day: 5,
      },
      {
        text: "저는 한국어를 배우고 있어요.",
        hint: "jeoneun hangugeoreul baeugo isseoyo",
        meaning: {
          korean: "저는 한국어를 배우고 있어요.",
          english: "I am learning Korean.",
          spanish: "Estoy aprendiendo coreano.",
          indonesian: "Saya sedang belajar bahasa Korea.",
        },
        day: 6,
      },
      {
        text: "오늘 정말 즐거웠어요.",
        hint: "oneul jeongmal jeulgeowosseoyo",
        meaning: {
          korean: "오늘 정말 즐거웠어요.",
          english: "Today was really fun.",
          spanish: "Hoy lo pasé muy bien.",
          indonesian: "Hari ini benar-benar menyenangkan.",
        },
        day: 7,
      },
    ],
    [], // intermediate — reserved
    [], // advanced — reserved
  ],
  english: [
    [
      {
        text: "Hi, nice to meet you.",
        meaning: {
          korean: "안녕하세요, 만나서 반갑습니다.",
          english: "Hi, nice to meet you.",
          spanish: "Hola, encantado de conocerte.",
          indonesian: "Hai, senang berkenalan denganmu.",
        },
        day: 1,
      },
      {
        text: "Could I get one coffee, please?",
        meaning: {
          korean: "커피 한 잔 주세요.",
          english: "Could I get one coffee, please?",
          spanish: "¿Me da un café, por favor?",
          indonesian: "Boleh minta satu kopi?",
        },
        day: 2,
      },
      {
        text: "How much does this cost?",
        meaning: {
          korean: "이거 얼마예요?",
          english: "How much does this cost?",
          spanish: "¿Cuánto cuesta esto?",
          indonesian: "Berapa harganya ini?",
        },
        day: 3,
      },
      {
        text: "Where is the restroom?",
        meaning: {
          korean: "화장실은 어디예요?",
          english: "Where is the restroom?",
          spanish: "¿Dónde está el baño?",
          indonesian: "Di mana letak toiletnya?",
        },
        day: 4,
      },
      {
        text: "Could you say that again?",
        meaning: {
          korean: "다시 말씀해 주세요.",
          english: "Could you say that again?",
          spanish: "¿Puede repetirlo, por favor?",
          indonesian: "Bisa diulang sekali lagi?",
        },
        day: 5,
      },
      {
        text: "I am learning English.",
        meaning: {
          korean: "저는 영어를 배우고 있어요.",
          english: "I am learning English.",
          spanish: "Estoy aprendiendo inglés.",
          indonesian: "Saya sedang belajar bahasa Inggris.",
        },
        day: 6,
      },
      {
        text: "I had a really good day today.",
        meaning: {
          korean: "오늘 정말 즐거웠어요.",
          english: "I had a really good day today.",
          spanish: "Hoy lo pasé muy bien.",
          indonesian: "Hari ini hariku benar-benar menyenangkan.",
        },
        day: 7,
      },
    ],
    [],
    [],
  ],
  spanish: [
    [
      {
        text: "Hola, encantado de conocerte.",
        meaning: {
          korean: "안녕하세요, 만나서 반갑습니다.",
          english: "Hello, nice to meet you.",
          spanish: "Hola, encantado de conocerte.",
          indonesian: "Halo, senang berkenalan denganmu.",
        },
        day: 1,
      },
      {
        text: "Un café, por favor.",
        meaning: {
          korean: "커피 한 잔 주세요.",
          english: "One coffee, please.",
          spanish: "Un café, por favor.",
          indonesian: "Tolong satu kopi.",
        },
        day: 2,
      },
      {
        text: "¿Cuánto cuesta esto?",
        meaning: {
          korean: "이거 얼마예요?",
          english: "How much is this?",
          spanish: "¿Cuánto cuesta esto?",
          indonesian: "Ini berapa harganya?",
        },
        day: 3,
      },
      {
        text: "¿Dónde está el baño?",
        meaning: {
          korean: "화장실은 어디예요?",
          english: "Where is the bathroom?",
          spanish: "¿Dónde está el baño?",
          indonesian: "Toiletnya di mana?",
        },
        day: 4,
      },
      {
        text: "¿Puede repetirlo, por favor?",
        meaning: {
          korean: "다시 말씀해 주세요.",
          english: "Could you say that again?",
          spanish: "¿Puede repetirlo, por favor?",
          indonesian: "Bisa diulang sekali lagi?",
        },
        day: 5,
      },
      {
        text: "Estoy aprendiendo español.",
        meaning: {
          korean: "저는 스페인어를 배우고 있어요.",
          english: "I am learning Spanish.",
          spanish: "Estoy aprendiendo español.",
          indonesian: "Saya sedang belajar bahasa Spanyol.",
        },
        day: 6,
      },
      {
        text: "Hoy lo pasé muy bien.",
        meaning: {
          korean: "오늘 정말 즐거웠어요.",
          english: "I had a really good day today.",
          spanish: "Hoy lo pasé muy bien.",
          indonesian: "Hari ini hariku benar-benar menyenangkan.",
        },
        day: 7,
      },
    ],
    [],
    [],
  ],
  indonesian: [
    [
      {
        text: "Halo, senang berkenalan denganmu.",
        meaning: {
          korean: "안녕하세요, 만나서 반갑습니다.",
          english: "Hello, nice to meet you.",
          spanish: "Hola, encantado de conocerte.",
          indonesian: "Halo, senang berkenalan denganmu.",
        },
        day: 1,
      },
      {
        text: "Tolong satu kopi.",
        meaning: {
          korean: "커피 한 잔 주세요.",
          english: "One coffee, please.",
          spanish: "Un café, por favor.",
          indonesian: "Tolong satu kopi.",
        },
        day: 2,
      },
      {
        text: "Ini berapa harganya?",
        meaning: {
          korean: "이거 얼마예요?",
          english: "How much is this?",
          spanish: "¿Cuánto cuesta esto?",
          indonesian: "Ini berapa harganya?",
        },
        day: 3,
      },
      {
        text: "Toiletnya di mana?",
        meaning: {
          korean: "화장실은 어디예요?",
          english: "Where is the bathroom?",
          spanish: "¿Dónde está el baño?",
          indonesian: "Toiletnya di mana?",
        },
        day: 4,
      },
      {
        text: "Bisa diulang sekali lagi?",
        meaning: {
          korean: "다시 말씀해 주세요.",
          english: "Could you say that again?",
          spanish: "¿Puede repetirlo, por favor?",
          indonesian: "Bisa diulang sekali lagi?",
        },
        day: 5,
      },
      {
        text: "Saya sedang belajar bahasa Indonesia.",
        meaning: {
          korean: "저는 인도네시아어를 배우고 있어요.",
          english: "I am learning Indonesian.",
          spanish: "Estoy aprendiendo indonesio.",
          indonesian: "Saya sedang belajar bahasa Indonesia.",
        },
        day: 6,
      },
      {
        text: "Hari ini benar-benar menyenangkan.",
        meaning: {
          korean: "오늘 정말 즐거웠어요.",
          english: "Today was really fun.",
          spanish: "Hoy lo pasé muy bien.",
          indonesian: "Hari ini benar-benar menyenangkan.",
        },
        day: 7,
      },
    ],
    [],
    [],
  ],
};

/** Picks today's sentence for the given learning language, or null if no
 *  beginner sentences are stocked yet. */
export function getTodaysSentence(learningLang: NativeLanguage): DailySentence | null {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) / 86_400_000;
  const dayOfYear = Math.floor(diff);
  const bank = DAILY_SENTENCES[learningLang]?.[0]; // beginner band
  if (!bank || bank.length === 0) return null;
  return bank[dayOfYear % bank.length];
}
