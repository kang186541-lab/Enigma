import type { NativeLanguage } from "@/context/LanguageContext";
import type { LangCode, LocalizedText, LoadedQuiz, StoryChapter, StoryScene, StoryDialogue, UiTextSet } from "@/constants/storyTypes";
import storyData from "@/data/storyData.json";
import quizData from "@/data/quizData.json";

/** Map the app's long language name to the 2-letter code used in storyData */
export function toLangCode(lang: NativeLanguage | null | undefined): LangCode {
  switch (lang) {
    case "korean":  return "ko";
    case "spanish": return "es";
    default:        return "en";
  }
}

/** Map a 2-letter lang code back to the app's long language name */
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
 * and questions into the targetLang content block.
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
    questions: quiz.content?.[targetLang] ?? [],
    nativeLang,
    targetLang,
  };
}

/**
 * Get all quizzes for a specific scene, language-resolved.
 */
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
  return (storyData.npcs as Record<string, typeof storyData.npcs[keyof typeof storyData.npcs]>)[npcId] ?? null;
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
