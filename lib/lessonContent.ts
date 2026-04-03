import type { Tri } from "./dailyCourseData";
import {
  LESSON_CONTENT_IMPROVED,
  MISSION_CONTENT_IMPROVED,
  REVIEW_CONTENT_IMPROVED,
} from "../data/dailyCourse/day1_6_improved";
import {
  LESSON_CONTENT_UNIT2,
  MISSION_CONTENT_UNIT2,
  REVIEW_CONTENT_UNIT2,
} from "../data/dailyCourse/day7_12_unit2";
import {
  LESSON_CONTENT_UNIT3,
  MISSION_CONTENT_UNIT3,
  REVIEW_CONTENT_UNIT3,
} from "../data/dailyCourse/day13_18_unit3";
import {
  LESSON_CONTENT_UNIT4,
  MISSION_CONTENT_UNIT4,
  REVIEW_CONTENT_UNIT4,
} from "../data/dailyCourse/day19_24_unit4";
import {
  LESSON_CONTENT_UNIT5,
  MISSION_CONTENT_UNIT5,
  REVIEW_CONTENT_UNIT5,
} from "../data/dailyCourse/day25_30_unit5";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LessonSentence {
  text: string;        // sentence in the target language being learned
  speechLang: string;  // Azure TTS lang code e.g. "en-GB"
  ttsVoice?: string;   // specific Azure neural voice name e.g. "en-GB-RyanNeural"
  meaning: Tri;        // translation to show (nativeLang selects which field)
  recallRound?: boolean; // if true, this sentence gets audio-only treatment in round 3
}

export interface Step1Config {
  hasAudioOnlyRound?: boolean;  // if true, round 3 hides text (audio-only recall)
  audioOnlyCount?: number;      // how many sentences get audio-only in round 3
}

export interface FillBlankQuiz {
  type: "select" | "input" | "listening";
  promptWithBlank: string;  // e.g. "My name ___ Rudy."
  answer: string;           // correct word/phrase
  options?: string[];        // only for "select" type
  fullSentence: string;     // complete sentence for speak-after
  fullSentenceMeaning: Tri; // translation for display
  audioText?: string;       // text spoken aloud for "listening" type
  audioOnly?: boolean;      // if true, user hears audio without seeing text
}

export interface GrammarExplanation {
  pattern: Tri;
  examples: Tri;
  mistakes: Tri;
  rudyTip: Tri;
}

export interface Step2Data {
  explanation: Tri | GrammarExplanation;
  quizzes: FillBlankQuiz[];
}

export interface DayLessonData {
  step1Sentences: LessonSentence[];
  step1Config?: Step1Config;
  step2: Step2Data;
}

// ── STEP 3: Mission Talk ──────────────────────────────────────────────────────

export interface MissionTalkLangData {
  situation: Tri;          // shown to user in nativeLang
  gptPrompt: string;       // system prompt — uses {targetLang} placeholder
  speechLang: string;      // TTS lang code for Rudy's voice
  suggestedAnswers: string[]; // 2-3 suggestions IN the target language
}

// ── STEP 4: Quick Review ──────────────────────────────────────────────────────

export interface ReviewQuestion {
  type: "speak" | "fill_blank";
  // speak type
  sentence?: string;
  speechLang?: string;
  meaning?: Tri;
  // fill_blank type
  promptWithBlank?: string;
  answer?: string;
  options?: string[];
  fullSentence?: string;
  fullSentenceMeaning?: Tri;
  isYesterdayReview?: boolean;
}

// ── Rewards ───────────────────────────────────────────────────────────────────

export interface DayRewards {
  xp: number;
  bonusAllVoice: number;
  bonusPronunciation: number;
}

export type LearningLangKey = "english" | "spanish" | "korean";

// ── Speech lang codes ────────────────────────────────────────────────────────

export const SPEECH_LANG: Record<LearningLangKey, string> = {
  english: "en-GB",
  spanish: "es-ES",
  korean:  "ko-KR",
};

// ── Day 1–30 content (all 3 learning languages) ────────────────────────────
// Merged from improved content files: Unit 1 (Day 1-6), Unit 2 (Day 7-12),
// Unit 3 (Day 13-18), Unit 4 (Day 19-24), Unit 5 (Day 25-30)

export const LESSON_CONTENT: Record<string, Partial<Record<LearningLangKey, DayLessonData>>> = {
  ...LESSON_CONTENT_IMPROVED,   // Day 1-6 (replaces original)
  ...LESSON_CONTENT_UNIT2,      // Day 7-12
  ...LESSON_CONTENT_UNIT3,      // Day 13-18
  ...LESSON_CONTENT_UNIT4,      // Day 19-24
  ...LESSON_CONTENT_UNIT5,      // Day 25-30
};

// ── STEP 3: Mission Talk content ──────────────────────────────────────────────

export const MISSION_CONTENT: Record<string, Partial<Record<LearningLangKey, MissionTalkLangData>>> = {
  ...MISSION_CONTENT_IMPROVED,  // Day 1-6
  ...MISSION_CONTENT_UNIT2,     // Day 7-12
  ...MISSION_CONTENT_UNIT3,     // Day 13-18
  ...MISSION_CONTENT_UNIT4,     // Day 19-24
  ...MISSION_CONTENT_UNIT5,     // Day 25-30
};

// ── STEP 4: Review content ────────────────────────────────────────────────────

export const REVIEW_CONTENT: Record<string, Partial<Record<LearningLangKey, ReviewQuestion[]>>> = {
  ...REVIEW_CONTENT_IMPROVED,   // Day 1-6
  ...REVIEW_CONTENT_UNIT2,      // Day 7-12
  ...REVIEW_CONTENT_UNIT3,      // Day 13-18
  ...REVIEW_CONTENT_UNIT4,      // Day 19-24
  ...REVIEW_CONTENT_UNIT5,      // Day 25-30
};

// ── Rewards ───────────────────────────────────────────────────────────────────

export const DAY_REWARDS: Record<string, DayRewards> = {
  // Unit 1: First Encounters (Day 1-6)
  day_1:  { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_2:  { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_3:  { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_4:  { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_5:  { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_6:  { xp: 150, bonusPronunciation: 50, bonusAllVoice: 50 },
  // Unit 2: Everyday Expressions (Day 7-12)
  day_7:  { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_8:  { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_9:  { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_10: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_11: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_12: { xp: 150, bonusPronunciation: 50, bonusAllVoice: 50 },
  // Unit 3: Food & Dining (Day 13-18)
  day_13: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_14: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_15: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_16: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_17: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_18: { xp: 150, bonusPronunciation: 50, bonusAllVoice: 50 },
  // Unit 4: Places & Directions (Day 19-24)
  day_19: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_20: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_21: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_22: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_23: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_24: { xp: 150, bonusPronunciation: 50, bonusAllVoice: 50 },
  // Unit 5: People & Social (Day 25-30)
  day_25: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_26: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_27: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_28: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_29: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_30: { xp: 200, bonusPronunciation: 75, bonusAllVoice: 75 },
};

// ── Pronunciation feedback messages ───────────────────────────────────────────

const FEEDBACK_MESSAGES: Record<string, Record<"excellent" | "good" | "needsWork", string[]>> = {
  ko: {
    excellent: ["완벽해요! 🌟", "훌륭한 발음이에요! 🦊", "네이티브처럼 들려요! ⭐"],
    good: ["잘 했어요! 👍", "좋은 발음이에요!", "계속 연습하면 완벽해질 거예요! 🦊"],
    needsWork: ["한 번 더 해봐요! 💪", "조금만 더 연습해요!", "루디가 응원해요! 🦊"],
  },
  en: {
    excellent: ["Perfect! 🌟", "Excellent pronunciation! 🦊", "You sound like a native! ⭐"],
    good: ["Good job! 👍", "Nice pronunciation!", "Keep practicing and you'll be perfect! 🦊"],
    needsWork: ["Try again! 💪", "A little more practice!", "Rudy believes in you! 🦊"],
  },
  es: {
    excellent: ["¡Perfecto! 🌟", "¡Excelente pronunciación! 🦊", "¡Suenas como un nativo! ⭐"],
    good: ["¡Bien hecho! 👍", "¡Buena pronunciación!", "¡Sigue practicando y serás perfecto! 🦊"],
    needsWork: ["¡Inténtalo de nuevo! 💪", "¡Un poco más de práctica!", "¡Rudy cree en ti! 🦊"],
  },
};

export function getRandomFeedback(type: "excellent" | "good" | "needsWork", nativeLang: string): string {
  const lc = nativeLang === "korean" ? "ko" : nativeLang === "spanish" ? "es" : "en";
  const pool = FEEDBACK_MESSAGES[lc]?.[type] ?? FEEDBACK_MESSAGES.en[type];
  return pool[Math.floor(Math.random() * pool.length)];
}

export const COMPLETION_MESSAGES = {
  ko: [
    "오늘도 수고했어, 파트너! 내일은 '{nextTopic}'을 배울 거야. 내일 봐! 🦊",
    "대단해! 오늘 {sentenceCount}문장이나 말했어! 내일도 이 기세로 가자! 🦊",
    "점점 실력이 느는 게 느껴져! 내일 '{nextTopic}' 훈련에서 보자! 🦊",
  ],
  en: [
    "Great work today, partner! Tomorrow we'll learn '{nextTopic}'. See you then! 🦊",
    "Amazing! You spoke {sentenceCount} sentences today! Keep it up tomorrow! 🦊",
    "I can feel your skills growing! See you at '{nextTopic}' training tomorrow! 🦊",
  ],
  es: [
    "¡Buen trabajo hoy, compañero! Mañana aprenderemos '{nextTopic}'. ¡Nos vemos! 🦊",
    "¡Increíble! ¡Dijiste {sentenceCount} oraciones hoy! ¡Sigue así mañana! 🦊",
    "¡Siento que mejoras! ¡Nos vemos en '{nextTopic}' mañana! 🦊",
  ],
};

export function getCompletionMessage(nativeLang: string, sentenceCount: number, nextTopic: string): string {
  const lc = nativeLang === "korean" ? "ko" : nativeLang === "spanish" ? "es" : "en";
  const msgs = COMPLETION_MESSAGES[lc as "ko" | "en" | "es"];
  const msg = msgs[Math.floor(Math.random() * msgs.length)];
  return msg
    .replace("{sentenceCount}", String(sentenceCount))
    .replace("{nextTopic}", nextTopic);
}
