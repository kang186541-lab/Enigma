export type LangCode = "ko" | "en" | "es";

export type LocalizedText = Record<LangCode, string>;

export interface StoryNpc {
  id: string;
  name: string | LocalizedText;
  role: LocalizedText;
  personality: LocalizedText;
  chapter: string;
  avatar: string;
}

export interface StoryDialogue {
  npc: string;
  text: LocalizedText;
}

export interface StoryScene {
  id: string;
  title: LocalizedText;
  narration?: LocalizedText;
  dialogues?: StoryDialogue[];
  quizzes?: string[];
  isTwist?: boolean;
  twistReveal?: LocalizedText;
  isBoss?: boolean;
}

export interface ChapterBadge {
  id: string;
  name: LocalizedText;
  icon: string;
}

export interface StoryChapter {
  id: string;
  title: LocalizedText;
  city: string;
  flag: string;
  icon: string;
  isLocked: boolean;
  unlockLevel: number;
  theme: LocalizedText;
  npcs: string[];
  totalXP: number;
  badge: ChapterBadge;
  scenes: StoryScene[];
  cliffhanger: LocalizedText;
  comingSoon?: boolean;
}

export interface StoryBadge {
  id: string;
  name: LocalizedText;
  icon: string;
  condition: string;
}

export interface UiTextSet {
  storyMode: string;
  quizStart: string;
  showHint: string;
  submit: string;
  correct: string;
  tryAgain: string;
  showTranslation: string;
  hideTranslation: string;
  xpGained: string;
  badgeEarned: string;
  chapterComplete: string;
  nextChapter: string;
  bossQuiz: string;
  locked: string;
  unlockAt: string;
  timeRemaining: string;
  score: string;
}

export interface StoryData {
  meta: { version: string; title: string; description: string };
  languages: Record<LangCode, { name: string; flag: string }>;
  uiText: Record<LangCode, UiTextSet>;
  npcs: Record<string, StoryNpc>;
  chapters: StoryChapter[];
  badges: StoryBadge[];
}

export type QuizType =
  | "word_rearrange"
  | "matching"
  | "fill_blank"
  | "listening"
  | "roleplay"
  | "riddle"
  | "translation"
  | "writing"
  | "timed"
  | "mixed";

export interface QuizRewards {
  xp: number;
  items?: string[];
  badge?: string;
  npcRelation?: { npcId: string; points: number };
}

export interface BaseQuiz {
  id: string;
  type: QuizType;
  title: LocalizedText;
  storyContext: LocalizedText;
  isBoss?: boolean;
  timeLimit?: number;
  rewards: QuizRewards;
}

export interface LoadedQuiz extends Omit<BaseQuiz, "title" | "storyContext"> {
  title: string;
  storyContext: string;
  questions: unknown[];
  nativeLang: LangCode;
  targetLang: LangCode;
}
