import type { NativeLanguage } from "@/context/LanguageContext";
import type { LangCode, LocalizedText } from "@/constants/storyTypes";
import { queueProgressPush } from "@/lib/progressSync";
import storyData from "@/data/storyData.json";

/** Map the app's long language name → 2-letter code used in storyData/quizData */
export function toLangCode(lang: NativeLanguage | null | undefined): LangCode {
  switch (lang) {
    case "korean":     return "ko";
    case "spanish":    return "es";
    case "indonesian": return "id";
    default:           return "en";
  }
}

/** Pick the right string from a LocalizedText object, falling back to English */
export function pick(text: LocalizedText | undefined, lang: LangCode): string {
  if (!text) return "";
  return text[lang] ?? text["en"] ?? Object.values(text)[0] ?? "";
}

/** Get an NPC definition by ID */
export function getNpcById(npcId: string) {
  return (storyData.npcs as Record<string, (typeof storyData.npcs)[keyof typeof storyData.npcs]>)[npcId] ?? null;
}

/** Substitute template variables in a GPT prompt */
export function fillGptPrompt(
  template: string,
  vars: { targetLang?: string; nativeLang?: string; [key: string]: string | undefined }
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

// ─── Expression Book ─────────────────────────────────────────────────────────

const EXPRESSION_BOOK_KEY = "expressionBook";

interface BookExpression {
  phrase: string;
  meaning: string;
  collection?: string;
  chapter: string;
  tprsStage?: number;
  mastered: boolean;
  learnedAt: string;
}

interface ExpressionBookData {
  expressions: BookExpression[];
}

/**
 * Add expressions to the Expression Book after quiz completion.
 * Deduplicates by phrase. Called from quiz completion handlers.
 */
export async function addToExpressionBook(
  expressions: string[],
  chapter: string,
  tprsStage?: number,
  collection?: string,
): Promise<void> {
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const raw = await AsyncStorage.getItem(EXPRESSION_BOOK_KEY);
    const book: ExpressionBookData = raw ? JSON.parse(raw) : { expressions: [] };
    const existing = new Set(book.expressions.map((e) => e.phrase.toLowerCase()));
    const now = new Date().toISOString();

    for (const expr of expressions) {
      if (!expr || existing.has(expr.toLowerCase())) continue;
      book.expressions.push({
        phrase: expr,
        meaning: "",
        collection,
        chapter,
        tprsStage,
        mastered: false,
        learnedAt: now,
      });
      existing.add(expr.toLowerCase());
    }

    await AsyncStorage.setItem(EXPRESSION_BOOK_KEY, JSON.stringify(book));
    queueProgressPush({ expression_book: book });
  } catch (err) {
    console.warn("[ExpressionBook] save error:", err);
  }
}

/**
 * Mark expressions as mastered (used when reaching TPRS stage 4).
 */
export async function markExpressionsMastered(phrases: string[]): Promise<void> {
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const raw = await AsyncStorage.getItem(EXPRESSION_BOOK_KEY);
    if (!raw) return;
    const book: ExpressionBookData = JSON.parse(raw);
    const toMaster = new Set(phrases.map((p) => p.toLowerCase()));
    for (const expr of book.expressions) {
      if (toMaster.has(expr.phrase.toLowerCase())) expr.mastered = true;
    }
    await AsyncStorage.setItem(EXPRESSION_BOOK_KEY, JSON.stringify(book));
    queueProgressPush({ expression_book: book });
  } catch (err) {
    console.warn("[ExpressionBook] mastered error:", err);
  }
}

// ─── I/O Ratio Tracking ──────────────────────────────────────────────────────

const IO_RATIO_KEY = "ioRatioTracking";

type QuizCategory = "input" | "output";

const QUIZ_CATEGORY_MAP: Record<string, QuizCategory> = {
  word_rearrange: "input",
  matching: "input",
  fill_blank: "input",
  listening: "input",
  riddle: "input",
  translation: "input",
  pronunciation: "output",
  voice_power: "output",
  debate_battle: "output",
  npc_rescue: "output",
  roleplay: "output",
  writing: "output",
  timed: "input",
  mixed: "input",
};

export interface IOChapterStats {
  inputCount: number;
  outputCount: number;
}

export interface IORatioData {
  chapters: Record<string, IOChapterStats>;
}

/**
 * Record a quiz completion for I/O ratio tracking.
 */
export async function trackQuizIO(
  chapter: string,
  quizType: string,
): Promise<void> {
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const raw = await AsyncStorage.getItem(IO_RATIO_KEY);
    const data: IORatioData = raw ? JSON.parse(raw) : { chapters: {} };
    if (!data.chapters[chapter]) data.chapters[chapter] = { inputCount: 0, outputCount: 0 };
    const category = QUIZ_CATEGORY_MAP[quizType] ?? "input";
    if (category === "input") data.chapters[chapter].inputCount++;
    else data.chapters[chapter].outputCount++;
    await AsyncStorage.setItem(IO_RATIO_KEY, JSON.stringify(data));
    queueProgressPush({ story_io_ratio: data });
  } catch (err) {
    console.warn("[IOTracker] save error:", err);
  }
}

/**
 * Get I/O ratio data for display.
 */
export async function getIORatioData(): Promise<IORatioData> {
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const raw = await AsyncStorage.getItem(IO_RATIO_KEY);
    return raw ? JSON.parse(raw) : { chapters: {} };
  } catch {
    return { chapters: {} };
  }
}
