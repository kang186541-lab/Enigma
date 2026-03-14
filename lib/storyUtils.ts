import type { NativeLanguage } from "@/context/LanguageContext";
import type {
  LangCode, LocalizedText, LoadedQuiz, StoryChapter, StoryScene,
  StoryDialogue, UiTextSet, NpcRelationLevel, TtsVoiceMap,
  ChapterProgress, StoryProgress, NpcRelationState,
} from "@/constants/storyTypes";
import storyData from "@/data/storyData.json";
import quizData from "@/data/quizData.json";

/** Map the app's long language name → 2-letter code used in storyData */
export function toLangCode(lang: NativeLanguage | null | undefined): LangCode {
  switch (lang) {
    case "korean":  return "ko";
    case "spanish": return "es";
    default:        return "en";
  }
}

/** Map a 2-letter lang code → the app's long language name */
export function fromLangCode(code: LangCode): NativeLanguage {
  switch (code) {
    case "ko": return "korean";
    case "es": return "spanish";
    default:   return "english";
  }
}

/** Pick the right string from a LocalizedText object, falling back to English */
export function pick(text: LocalizedText | undefined, lang: LangCode): string {
  if (!text) return "";
  return text[lang] ?? text["en"] ?? Object.values(text)[0] ?? "";
}

/** Get UI text strings for the given native language */
export function getUiText(nativeLang: LangCode): UiTextSet {
  return (storyData.uiText as Record<LangCode, UiTextSet>)[nativeLang] ?? storyData.uiText["en"];
}

/** Get all chapters from storyData */
export function getChapters(): StoryChapter[] {
  return storyData.chapters as StoryChapter[];
}

/** Get a single chapter by ID */
export function getChapter(chapterId: string): StoryChapter | undefined {
  return (storyData.chapters as StoryChapter[]).find(c => c.id === chapterId);
}

/** Get a single scene from a chapter */
export function getScene(chapterId: string, sceneId: string): StoryScene | undefined {
  return getChapter(chapterId)?.scenes.find(s => s.id === sceneId);
}

/**
 * Load a quiz with language-resolved fields.
 * Resolves title and storyContext into nativeLang strings,
 * and content into the targetLang content block.
 */
export function loadQuiz(
  quizId: string,
  nativeLang: LangCode,
  targetLang: LangCode
): LoadedQuiz | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quiz = (quizData.quizzes as any[]).find(q => q.id === quizId);
  if (!quiz) return null;
  return {
    ...quiz,
    storyContext: pick(quiz.storyContext as LocalizedText, nativeLang),
    title: pick(quiz.title as LocalizedText, nativeLang),
    content: quiz.content?.[targetLang] ?? {},
    nativeLang,
    targetLang,
  };
}

/** Get all quizzes for a list of IDs, language-resolved */
export function loadSceneQuizzes(
  quizIds: string[],
  nativeLang: LangCode,
  targetLang: LangCode
): LoadedQuiz[] {
  return quizIds.flatMap(id => {
    const q = loadQuiz(id, nativeLang, targetLang);
    return q ? [q] : [];
  });
}

/** Get all quizzes for a chapter, language-resolved */
export function loadChapterQuizzes(
  chapterId: string,
  nativeLang: LangCode,
  targetLang: LangCode
): LoadedQuiz[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quizzes = (quizData.quizzes as any[]).filter(q => q.chapter === chapterId);
  return quizzes.map(quiz => ({
    ...quiz,
    storyContext: pick(quiz.storyContext as LocalizedText, nativeLang),
    title: pick(quiz.title as LocalizedText, nativeLang),
    content: quiz.content?.[targetLang] ?? {},
    nativeLang,
    targetLang,
  }));
}

/**
 * Resolve an NPC dialogue line into display text (target lang) and translation (native lang).
 */
export function getNpcDialogue(
  dialogue: StoryDialogue,
  nativeLang: LangCode,
  targetLang: LangCode
): { displayText: string; translationText: string } {
  return {
    displayText:     pick(dialogue.text, targetLang),
    translationText: pick(dialogue.text, nativeLang),
  };
}

/** Get an NPC definition by ID */
export function getNpcById(npcId: string) {
  return (storyData.npcs as Record<string, (typeof storyData.npcs)[keyof typeof storyData.npcs]>)[npcId] ?? null;
}

/** Get a chapter's badge name in the user's native language */
export function getChapterBadgeName(chapterId: string, nativeLang: LangCode): string {
  const ch = getChapter(chapterId);
  if (!ch) return "";
  return pick(ch.badge.name, nativeLang);
}

/** Replace the {level} placeholder in UI text */
export function fmtUnlockAt(uiText: UiTextSet, level: number): string {
  return uiText.unlockAt.replace("{level}", String(level));
}

/** Get NPC relation levels array */
export function getNpcRelationLevels(): NpcRelationLevel[] {
  return quizData.npcRelationLevels as NpcRelationLevel[];
}

/** Get the relation level object for a given point total */
export function getNpcRelationLevel(points: number): NpcRelationLevel {
  const levels = getNpcRelationLevels();
  let result = levels[0];
  for (const lvl of levels) {
    if (points >= lvl.points) result = lvl;
  }
  return result;
}

/** Get the next relation level (or null if already max) */
export function getNextRelationLevel(points: number): NpcRelationLevel | null {
  const levels = getNpcRelationLevels();
  const current = getNpcRelationLevel(points);
  const next = levels.find(l => l.level === current.level + 1);
  return next ?? null;
}

/** Get TTS voice for a language and gender */
export function getTtsVoice(lang: LangCode, gender: "default" | "male" = "default"): string {
  const map = quizData.ttsVoiceMap as TtsVoiceMap;
  return map[lang]?.[gender] ?? map["en"].default;
}

/** Calculate total XP available in a chapter */
export function getChapterTotalXP(chapterId: string): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quizzes = (quizData.quizzes as any[]).filter(q => q.chapter === chapterId);
  return quizzes.reduce((sum: number, q: { rewards?: { xp?: number } }) => sum + (q.rewards?.xp ?? 0), 0);
}

/** Create a blank chapter progress record */
export function makeBlankChapterProgress(chapterId: string): ChapterProgress {
  return {
    chapterId,
    completedQuizzes: [],
    earnedBadges: [],
    npcRelations: {},
    totalXpEarned: 0,
    isComplete: false,
  };
}

/** Apply quiz rewards to a chapter progress record (immutably) */
export function applyQuizRewards(
  progress: ChapterProgress,
  quizId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quiz: any,
): ChapterProgress {
  if (progress.completedQuizzes.includes(quizId)) return progress;

  const newRelations: NpcRelationState = { ...progress.npcRelations };
  if (quiz.rewards?.npcRelation?.npc) {
    const { npc, points } = quiz.rewards.npcRelation;
    newRelations[npc] = (newRelations[npc] ?? 0) + points;
  }

  const newBadges = [...progress.earnedBadges];
  if (quiz.rewards?.badge && !newBadges.includes(quiz.rewards.badge)) {
    newBadges.push(quiz.rewards.badge);
  }

  const newItems = [...(progress as { items?: string[] }).items ?? []];
  for (const item of (quiz.rewards?.items ?? [])) {
    if (!newItems.includes(item)) newItems.push(item);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chapterQuizIds = (quizData.quizzes as any[])
    .filter(q => q.chapter === progress.chapterId)
    .map((q: { id: string }) => q.id);
  const newCompleted = [...progress.completedQuizzes, quizId];
  const isComplete = chapterQuizIds.every((id: string) => newCompleted.includes(id));

  return {
    ...progress,
    completedQuizzes: newCompleted,
    earnedBadges: newBadges,
    npcRelations: newRelations,
    totalXpEarned: progress.totalXpEarned + (quiz.rewards?.xp ?? 0),
    isComplete,
  };
}

/** Substitute template variables in a GPT prompt */
export function fillGptPrompt(
  template: string,
  vars: { targetLang?: string; nativeLang?: string; [key: string]: string | undefined }
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

/** Get gradient colors for a chapter based on its city */
export function getChapterGradient(chapterId: string): readonly [string, string, string] {
  switch (chapterId) {
    case "ch1": return ["#1A1A2E", "#16213E", "#0F3460"] as const;
    case "ch2": return ["#2C1810", "#4A2010", "#6B3020"] as const;
    case "ch3": return ["#0A0A1A", "#12122A", "#1E1E4A"] as const;
    case "ch4": return ["#0A1A10", "#12301A", "#1E4A2A"] as const;
    case "ch5": return ["#1A0A1A", "#2A1230", "#3A1A4A"] as const;
    default:    return ["#1a0a05", "#2c1810", "#3d2215"] as const;
  }
}

/** Get accent color for a chapter */
export function getChapterAccent(chapterId: string): string {
  switch (chapterId) {
    case "ch1": return "#E94560";
    case "ch2": return "#C9A227";
    case "ch3": return "#FF6B9D";
    case "ch4": return "#4ECDC4";
    case "ch5": return "#A855F7";
    default:    return "#C9A227";
  }
}

/** Check if a chapter is unlocked given the user's current level */
export function isChapterUnlocked(chapter: StoryChapter, userLevel: number): boolean {
  return !chapter.isLocked && userLevel >= chapter.unlockLevel;
}

/** Get the full StoryProgress object (for use with AsyncStorage) */
export function getEmptyStoryProgress(): StoryProgress {
  return { chapters: {} };
}

/** Merge partial chapter progress into a full progress object */
export function mergeChapterProgress(
  progress: StoryProgress,
  chapterProgress: ChapterProgress
): StoryProgress {
  return {
    ...progress,
    chapters: {
      ...progress.chapters,
      [chapterProgress.chapterId]: chapterProgress,
    },
  };
}
