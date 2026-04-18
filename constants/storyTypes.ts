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
  emotionalArc?: LocalizedText;
  npcLangRatio?: number;
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
  | "mixed"
  | "pronunciation"
  | "voice_power"
  | "debate_battle"
  | "npc_rescue";

// ─── New Quiz Content Types ──────────────────────────────────────────────────

export type StoneEffect = "dim" | "glow" | "bright" | "blinding";

export interface VoicePowerContent {
  sentence: string;
  translation: string;
  stoneEffect: StoneEffect;
  stoneCount: number;
  visualEffect: string;
  minScore?: number;
}

export interface DebateBattleRound {
  topic: LocalizedText;
  npcArgument: LocalizedText;
  requiredExpressions: string[];
}

export interface DebateBattleContent {
  opponent: string;
  rounds: number;
  minExpressions: number;
  roundData: DebateBattleRound[];
}

export interface NpcRescueStage {
  instruction: LocalizedText;
  targetPhrase: string;
  hint?: LocalizedText;
  minScore?: number;
}

export interface NpcRescueContent {
  npcToRescue: string;
  stages: NpcRescueStage[];
  progressiveIntro: boolean;
}

// ─── TPRS Quiz Fields ────────────────────────────────────────────────────────

export interface QuizOnFail {
  addToWeakExpressions: string[];
  reviewInDailyCourse: boolean;
  reviewDays: number;
}

export interface TprsQuizMeta {
  tprsStage?: number;
  targetExpressions?: string[];
  previouslyLearned?: string[];
  speakAfter?: boolean;
  storyReason?: string;
  storyConsequence?: string;
  onFail?: QuizOnFail;
}

export interface QuizRewards {
  xp: number;
  items?: string[];
  badge?: string;
  npcRelation?: { npc: string; points: number } | null;
}

export interface BaseQuiz extends TprsQuizMeta {
  id: string;
  chapter: string;
  scene: string;
  type: QuizType;
  difficulty: number;
  title: LocalizedText;
  storyContext: LocalizedText;
  isBoss?: boolean;
  timeLimit?: number | null;
  useGPT?: boolean;
  useAzureTTS?: boolean;
  gptPrompt?: string;
  rewards: QuizRewards;
  content: Record<LangCode, unknown>;
}

export interface LoadedQuiz extends Omit<BaseQuiz, "title" | "storyContext" | "content"> {
  title: string;
  storyContext: string;
  content: unknown;
  nativeLang: LangCode;
  targetLang: LangCode;
}

export interface NpcRelationLevel {
  level: number;
  name: LocalizedText;
  points: number;
  benefit: LocalizedText;
}

export interface TtsVoiceMap {
  en: { default: string; male: string };
  es: { default: string; male: string };
  ko: { default: string; male: string };
}

export interface QuizData {
  quizzes: BaseQuiz[];
  npcRelationLevels: NpcRelationLevel[];
  ttsVoiceMap: TtsVoiceMap;
}

export interface NpcRelationState {
  [npcId: string]: number;
}

export interface ChapterProgress {
  chapterId: string;
  completedQuizzes: string[];
  earnedBadges: string[];
  npcRelations: NpcRelationState;
  totalXpEarned: number;
  isComplete: boolean;
}

export interface StoryProgress {
  chapters: Record<string, ChapterProgress>;
}

// ─── Gameplay Systems (P0~P4) ───────────────────────────────────────────────

/** P1: Chapter gauge for tension/grading system */
export interface ChapterGauge {
  current: number;       // 0-100
  hintsUsed: number;
  wrongAnswers: number;
}

export type GaugeGrade = "platinum" | "gold" | "silver" | "bronze";

export function getGaugeGrade(gauge: number): GaugeGrade {
  if (gauge >= 80) return "platinum";
  if (gauge >= 50) return "gold";
  if (gauge >= 20) return "silver";
  return "bronze";
}

export const GAUGE_GRADE_META: Record<GaugeGrade, { icon: string; color: string; label: LocalizedText }> = {
  platinum: { icon: "💎", color: "#E5E4E2", label: { ko: "플래티넘", en: "Platinum", es: "Platino" } },
  gold:     { icon: "🥇", color: "#C9A227", label: { ko: "골드", en: "Gold", es: "Oro" } },
  silver:   { icon: "🥈", color: "#A0A0A0", label: { ko: "실버", en: "Silver", es: "Plata" } },
  bronze:   { icon: "🥉", color: "#CD7F32", label: { ko: "브론즈", en: "Bronze", es: "Bronce" } },
};

/** P0: Player choice in dialogue */
export interface StoryChoiceOption {
  text: string;
  npcReaction: string;
  npcRelation?: { npc: string; points: number };
  gaugeBonus?: number;
}

export interface StoryChoiceDialogue {
  npc: string;
  isChoice: true;
  choices: Record<LangCode, StoryChoiceOption[]>;
}

/** P2: Clue collected during story scenes */
export interface StoryClue {
  id: string;
  icon: string;
  title: LocalizedText;
  description: LocalizedText;
  chapter: string;
  linkedQuiz?: string;
}

/** P4: Chapter result summary */
export interface ChapterResult {
  chapterId: string;
  gaugeGrade: GaugeGrade;
  gaugeFinal: number;
  correctRate: number;
  cluesFound: number;
  cluesTotal: number;
  npcRelationChanges: Record<string, number>;
  newExpressions: string[];
  badgeEarned?: string;
  xpEarned: number;
}
