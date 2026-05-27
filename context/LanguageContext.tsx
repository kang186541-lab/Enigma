import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkAchievements } from "@/lib/achievementManager";
import { addWeeklyXP } from "@/lib/leagueManager";
import {
  clearProgressPushQueue,
  fetchServerProgress,
  queueProgressPush,
  subscribeProgressSync,
  type ProgressSyncSnapshot,
} from "@/lib/progressSync";
import {
  ACTIVE_USER_KEY,
  DEFAULT_STATS,
  clearLocalProgressForAccountSwitch,
  localDateString,
  localDateStringFromIso,
  readJson,
  writeJson,
} from "@/lib/progressStorage";
import { supabase } from "@/lib/supabase";

export type NativeLanguage = "korean" | "english" | "spanish";

export interface Level {
  num: number;
  emoji: string;
  name: string;
  nameEn: string;
  nameEs: string;
  minXP: number;
  maxXP: number;
}

export const LEVELS: Level[] = [
  { num: 1, emoji: "🌱", name: "입문자",  nameEn: "Beginner",      nameEs: "Principiante",  minXP: 0,    maxXP: 100  },
  { num: 2, emoji: "📚", name: "초보자",  nameEn: "Novice",        nameEs: "Novato",        minXP: 101,  maxXP: 300  },
  { num: 3, emoji: "⭐", name: "중급자",  nameEn: "Intermediate",  nameEs: "Intermedio",    minXP: 301,  maxXP: 600  },
  { num: 4, emoji: "🔥", name: "고급자",  nameEn: "Advanced",      nameEs: "Avanzado",      minXP: 601,  maxXP: 1000 },
  { num: 5, emoji: "👑", name: "마스터",  nameEn: "Master",        nameEs: "Maestro",       minXP: 1001, maxXP: Infinity },
];

export function getLevelName(level: Level, lang: NativeLanguage): string {
  if (lang === "english") return level.nameEn;
  if (lang === "spanish") return level.nameEs;
  return level.name;
}

export function getLevel(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getLevelProgress(xp: number): number {
  const lvl = getLevel(xp);
  if (lvl.num === 5) return 1;
  return Math.min(1, (xp - lvl.minXP) / (lvl.maxXP - lvl.minXP));
}

export interface UserStats {
  streak: number;
  wordsLearned: number;
  accuracy: number;
  xp: number;
}

export type StatsUpdate = Partial<UserStats> | ((current: UserStats) => Partial<UserStats>);

export interface LanguageContextType {
  nativeLanguage: NativeLanguage | null;
  setNativeLanguage: (lang: NativeLanguage) => Promise<void>;
  learningLanguage: NativeLanguage | null;
  setLearningLanguage: (lang: NativeLanguage) => Promise<void>;
  hasOnboarded: boolean;
  isHydrated: boolean;
  stats: UserStats;
  updateStats: (updates: StatsUpdate) => Promise<void>;
  awardXp: (amount: number) => Promise<void>;
  t: (key: string) => string;
  pendingLevelUp: Level | null;
  clearLevelUp: () => void;
  syncStatus: ProgressSyncSnapshot;
}

export function getDefaultLearning(native: NativeLanguage): NativeLanguage {
  const all: NativeLanguage[] = ["english", "korean", "spanish"];
  return all.find((l) => l !== native) ?? "english";
}

export function getEffectiveLearningLanguage(
  native: NativeLanguage,
  learning: NativeLanguage | null | undefined
): NativeLanguage {
  return learning && learning !== native ? learning : getDefaultLearning(native);
}

const translations: Record<NativeLanguage, Record<string, string>> = {
  english: {
    select_language: "Select Your Language",
    subtitle: "Choose your native language to personalize your experience",
    korean: "Korean",
    english: "English",
    spanish: "Spanish",
    continue: "Continue",
    home: "Home",
    cards: "Cards",
    chat: "Tutor",
    story: "Story",
    speak: "Speak",
    good_morning: "Good morning!",
    good_afternoon: "Good afternoon!",
    good_evening: "Good evening!",
    streak: "Day Streak",
    words: "Words",
    accuracy: "Accuracy",
    xp: "XP Points",
    daily_lesson: "Today's Lesson",
    daily_desc: "Master 10 new words and phrases",
    start_lesson: "Start Lesson",
    quick_practice: "Quick Practice",
    flashcards: "Flashcards",
    flashcards_desc: "Review vocabulary with interactive cards",
    conversation: "Conversation",
    conversation_desc: "Practice real-world dialogue",
    pronunciation: "Pronunciation",
    pronunciation_desc: "Perfect your accent",
    continue_learning: "Continue Learning",
    flip_card: "Tap to flip",
    next: "Next",
    know_it: "I know it!",
    study_more: "Study more",
    well_done: "Well done!",
    practice_speaking: "Practice Speaking",
    tap_to_speak: "Tap to speak",
    listening: "Listening...",
    type_message: "Type a message...",
    send: "Send",
    ai_greeting: "Hello! I'm your AI language tutor. What would you like to practice today?",
    your_progress: "Your Progress",
    level: "Level",
    beginner: "Beginner",
    card_deck: "Today's Card Deck",
    cards_remaining: "cards remaining",
    speak_title: "Pronunciation Practice",
    speak_subtitle: "Listen, repeat, and perfect your accent",
    listen: "Listen",
    record: "Record",
    try_again: "Try Again",
    great_job: "Great job!",
    score: "Score",
    chat_pick_tutor: "Choose Your Tutor",
    chat_pick_sub: "💬 Chat freely with your tutor!",
  },
  korean: {
    select_language: "언어를 선택하세요",
    subtitle: "원하는 학습 경험을 위해 모국어를 선택하세요",
    korean: "한국어",
    english: "영어",
    spanish: "스페인어",
    continue: "계속하기",
    home: "홈",
    cards: "카드",
    chat: "튜터",
    story: "스토리",
    speak: "말하기",
    good_morning: "좋은 아침이에요!",
    good_afternoon: "좋은 오후예요!",
    good_evening: "좋은 저녁이에요!",
    streak: "연속 학습일",
    words: "단어",
    accuracy: "정확도",
    xp: "경험치",
    daily_lesson: "오늘의 수업",
    daily_desc: "새로운 단어와 표현 10개 배우기",
    start_lesson: "수업 시작",
    quick_practice: "빠른 연습",
    flashcards: "플래시카드",
    flashcards_desc: "인터랙티브 카드로 어휘 복습",
    conversation: "대화",
    conversation_desc: "튜터와 자유롭게 대화하기",
    pronunciation: "발음",
    pronunciation_desc: "억양 완벽하게 하기",
    continue_learning: "계속 배우기",
    flip_card: "탭하여 뒤집기",
    next: "다음",
    know_it: "알아요!",
    study_more: "더 공부하기",
    well_done: "잘했어요!",
    practice_speaking: "말하기 연습",
    tap_to_speak: "탭하여 말하기",
    listening: "듣는 중...",
    type_message: "메시지 입력...",
    send: "전송",
    ai_greeting: "안녕하세요! 저는 AI 언어 튜터예요. 오늘 무엇을 연습하고 싶으신가요?",
    your_progress: "내 진도",
    level: "레벨",
    beginner: "초급",
    card_deck: "오늘의 카드 덱",
    cards_remaining: "카드 남음",
    speak_title: "발음 연습",
    speak_subtitle: "듣고, 반복하고, 억양을 완벽하게 하세요",
    listen: "듣기",
    record: "녹음",
    try_again: "다시 시도",
    great_job: "잘했어요!",
    score: "점수",
    chat_pick_tutor: "튜터를 선택하세요",
    chat_pick_sub: "💬 튜터와 자유롭게 대화해보세요!",
  },
  spanish: {
    select_language: "Selecciona tu idioma",
    subtitle: "Elige tu idioma nativo para personalizar tu experiencia",
    korean: "Coreano",
    english: "Inglés",
    spanish: "Español",
    continue: "Continuar",
    home: "Inicio",
    cards: "Tarjetas",
    chat: "Tutor",
    story: "Historia",
    speak: "Hablar",
    good_morning: "¡Buenos días!",
    good_afternoon: "¡Buenas tardes!",
    good_evening: "¡Buenas noches!",
    streak: "Racha de días",
    words: "Palabras",
    accuracy: "Precisión",
    xp: "Puntos XP",
    daily_lesson: "Lección de hoy",
    daily_desc: "Aprende 10 palabras y frases nuevas",
    start_lesson: "Iniciar lección",
    quick_practice: "Práctica rápida",
    flashcards: "Tarjetas didácticas",
    flashcards_desc: "Repasa vocabulario con tarjetas interactivas",
    conversation: "Conversación",
    conversation_desc: "Practica diálogos del mundo real",
    pronunciation: "Pronunciación",
    pronunciation_desc: "Perfecciona tu acento",
    continue_learning: "Continuar aprendiendo",
    flip_card: "Toca para voltear",
    next: "Siguiente",
    know_it: "¡Lo sé!",
    study_more: "Estudiar más",
    well_done: "¡Bien hecho!",
    practice_speaking: "Practica hablando",
    tap_to_speak: "Toca para hablar",
    listening: "Escuchando...",
    type_message: "Escribe un mensaje...",
    send: "Enviar",
    ai_greeting: "¡Hola! Soy tu tutor de idiomas con IA. ¿Qué te gustaría practicar hoy?",
    your_progress: "Tu progreso",
    level: "Nivel",
    beginner: "Principiante",
    card_deck: "Mazo de hoy",
    cards_remaining: "tarjetas restantes",
    speak_title: "Práctica de pronunciación",
    speak_subtitle: "Escucha, repite y perfecciona tu acento",
    listen: "Escuchar",
    record: "Grabar",
    try_again: "Intentar de nuevo",
    great_job: "¡Excelente trabajo!",
    score: "Puntuación",
    chat_pick_tutor: "Elige tu tutor",
    chat_pick_sub: "💬 ¡Habla libremente con tu tutor!",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

type StoryProgressBlob = { completed: string[]; unlocked: string[] };
type RecordBlob = Record<string, unknown>;

const STORY_PROGRESS_KEY = "lingo_story_progress";
const NPC_REL_KEY = "npcRelationships";
const NPC_EMO_KEY = "npcEmotions";
const EXPRESSION_BOOK_KEY = "expressionBook";
const STORY_IO_KEY = "ioRatioTracking";
const STORY_CLUES_KEY = "storyCluesCollected";
const KNOWN_WORDS_KEY = "@lingua_known_words";

function isNativeLanguage(value: unknown): value is NativeLanguage {
  return value === "korean" || value === "english" || value === "spanish";
}

function mergeStoryProgress(local: StoryProgressBlob | null, remote: unknown): StoryProgressBlob {
  const r = (remote && typeof remote === "object" ? remote : {}) as Partial<StoryProgressBlob>;
  const l = local ?? { completed: [], unlocked: ["london"] };
  return {
    completed: Array.from(new Set([...(r.completed ?? []), ...(l.completed ?? [])])),
    unlocked: Array.from(new Set(["london", ...(r.unlocked ?? []), ...(l.unlocked ?? [])])),
  };
}

function jsonEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function mergeNumericRecord(local: Record<string, number> | null, remote: unknown): Record<string, number> {
  const merged: Record<string, number> = {};
  const remoteObj = (remote && typeof remote === "object" ? remote : {}) as Record<string, unknown>;
  for (const [key, value] of Object.entries(remoteObj)) {
    if (typeof value === "number") merged[key] = value;
  }
  for (const [key, value] of Object.entries(local ?? {})) {
    if (typeof value === "number") merged[key] = Math.max(merged[key] ?? 0, value);
  }
  return merged;
}

function mergeStringRecord(local: Record<string, string> | null, remote: unknown): Record<string, string> {
  const remoteObj = (remote && typeof remote === "object" ? remote : {}) as Record<string, unknown>;
  const merged: Record<string, string> = {};
  for (const [key, value] of Object.entries(remoteObj)) {
    if (typeof value === "string") merged[key] = value;
  }
  for (const [key, value] of Object.entries(local ?? {})) {
    if (typeof value === "string") merged[key] = value;
  }
  return merged;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [nativeLanguage, setNativeLanguageState] = useState<NativeLanguage | null>(null);
  const [learningLanguage, setLearningLanguageState] = useState<NativeLanguage | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [pendingLevelUp, setPendingLevelUp] = useState<Level | null>(null);
  const [syncStatus, setSyncStatus] = useState<ProgressSyncSnapshot>({
    status: "idle",
    lastSyncedAt: null,
    lastError: null,
  });
  // Zero-state defaults for new users. Real values are loaded from
  // AsyncStorage in the effect below, so existing users see no regression.
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const statsRef = useRef(stats);
  const statsUpdateLockRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => subscribeProgressSync(setSyncStatus), []);

  useEffect(() => {
    (async () => {
      try {
        const lang = await AsyncStorage.getItem("@lingua_language");
        const ll = await AsyncStorage.getItem("@lingua_learning_language");
        const statsStr = await AsyncStorage.getItem("@lingua_stats");
        if (lang) {
          const native = lang as NativeLanguage;
          const learning = isNativeLanguage(ll) ? ll : null;
          const effectiveLearning = getEffectiveLearningLanguage(native, learning);
          setNativeLanguageState(native);
          setHasOnboarded(true);
          setLearningLanguageState(effectiveLearning);
          if (ll !== effectiveLearning) {
            await AsyncStorage.setItem("@lingua_learning_language", effectiveLearning);
          }
        }
        if (statsStr) {
          const savedStats = JSON.parse(statsStr);
          statsRef.current = savedStats;
          setStats(savedStats);
        }
      } catch (e) {
        console.warn('[LanguageContext] Failed to load saved preferences:', e);
      } finally {
        setIsHydrated(true);
      }
    })();
  }, []);

  // Pull server progress on sign-in and merge with local (server XP wins if
  // higher — keeps progress safe across devices and reinstalls). On the very
  // first sign-in for a user, we proactively push the local state up so the
  // server row exists from minute one (otherwise an idle session would leave
  // them with nothing to sync from on the next device).
  useEffect(() => {
    if (!isHydrated) return; // wait for local stats to load first
    let cancelled = false;
    const resetInMemoryProgress = () => {
      statsRef.current = DEFAULT_STATS;
      setStats(DEFAULT_STATS);
      setNativeLanguageState(null);
      setLearningLanguageState(null);
      setHasOnboarded(false);
    };
    const reconcile = async () => {
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const user = userRes?.user;
        if (!user) return;

        const previousUserId = await AsyncStorage.getItem(ACTIVE_USER_KEY);
        const switchedUser = !!previousUserId && previousUserId !== user.id;
        if (switchedUser) clearProgressPushQueue();
        await clearLocalProgressForAccountSwitch(user.id);
        if (switchedUser) resetInMemoryProgress();

        const remote = await fetchServerProgress();
        if (cancelled) return;
        const local = switchedUser ? DEFAULT_STATS : statsRef.current;
        const localNativeRaw = await AsyncStorage.getItem("@lingua_language");
        const localLearningRaw = await AsyncStorage.getItem("@lingua_learning_language");
        const localNative = isNativeLanguage(localNativeRaw)
          ? localNativeRaw
          : switchedUser ? null : nativeLanguage;
        const localLearning = isNativeLanguage(localLearningRaw)
          ? localLearningRaw
          : switchedUser ? null : learningLanguage;
        const localLastSessionDate = await AsyncStorage.getItem("@lingua_last_session_date");

        if (!remote) {
          // First sign-in for this user — seed the row with whatever local
          // progress they already have (or zeros for a fresh install).
          // We also include the P2 blobs (SRS / course / achievements /
          // weekly XP / learner profile) so a tester who's been progressing
          // pre-auth doesn't lose anything the moment they sign in.
          const srs = await readJson("@lingua_srs_data");
          const course = await readJson("@daily_course_progress");
          const achievements = await readJson("@lingua_achievements");
          const profile = await readJson("@lingua_learner_profile");
          const storyProgress = await readJson(STORY_PROGRESS_KEY);
          const npcRelationships = await readJson(NPC_REL_KEY);
          const npcEmotions = await readJson(NPC_EMO_KEY);
          const expressionBook = await readJson(EXPRESSION_BOOK_KEY);
          const storyIoRatio = await readJson(STORY_IO_KEY);
          const storyClues = await readJson(STORY_CLUES_KEY);
          const knownWords = await readJson(KNOWN_WORDS_KEY);
          const w = await AsyncStorage.getItem("@lingua_league_week").catch(() => null);
          const xp = await AsyncStorage.getItem("@lingua_weekly_xp").catch(() => null);
          const weeklyXp = w && xp ? { week: Number(w), xp: Number(xp) } : undefined;

          queueProgressPush({
            xp: local.xp,
            level: getLevel(local.xp).num,
            streak_days: local.streak,
            words_learned: local.wordsLearned,
            last_session_at: new Date().toISOString(),
            last_session_date: localLastSessionDate,
            native_lang: localNative ?? null,
            learning_lang: localLearning ?? null,
            srs_data: srs,
            daily_course_progress: course,
            achievements: achievements,
            weekly_xp: weeklyXp,
            learner_profile: profile,
            story_progress: storyProgress,
            npc_relationships: npcRelationships,
            npc_emotions: npcEmotions,
            expression_book: expressionBook,
            story_io_ratio: storyIoRatio,
            story_clues: storyClues,
            known_words: knownWords,
          });
          return;
        }

        // Existing row — take the higher of (server, local) so reinstalls
        // never lose progress and a stale device can't downgrade the server.
        const remoteWords = (remote as { words_learned?: number }).words_learned ?? 0;
        const remoteLastDate = remote.last_session_date ?? localDateStringFromIso(remote.last_session_at);
        const candidateDates = [localLastSessionDate, remoteLastDate].filter(Boolean).sort() as string[];
        const bestLastDate = candidateDates.length ? candidateDates[candidateDates.length - 1] : null;
        const resolvedStreak =
          localLastSessionDate && remoteLastDate
            ? localLastSessionDate > remoteLastDate
              ? local.streak
              : remoteLastDate > localLastSessionDate
              ? remote.streak_days
              : Math.max(local.streak, remote.streak_days)
            : localLastSessionDate
            ? local.streak
            : remoteLastDate
            ? remote.streak_days
            : Math.max(local.streak, remote.streak_days);
        const merged = { ...local };
        if (remote.xp > local.xp) merged.xp = remote.xp;
        merged.streak = resolvedStreak;
        if (remoteWords > local.wordsLearned) merged.wordsLearned = remoteWords;
        if (
          merged.xp !== local.xp ||
          merged.streak !== local.streak ||
          merged.wordsLearned !== local.wordsLearned
        ) {
          statsRef.current = merged;
          setStats(merged);
          await AsyncStorage.setItem("@lingua_stats", JSON.stringify(merged));
        }
        if (bestLastDate) await AsyncStorage.setItem("@lingua_last_session_date", bestLastDate);

        if (!localNative && isNativeLanguage(remote.native_lang)) {
          await AsyncStorage.setItem("@lingua_language", remote.native_lang);
          setNativeLanguageState(remote.native_lang);
          setHasOnboarded(true);
        }
        if (!localLearning && isNativeLanguage(remote.learning_lang)) {
          const nativeForLearning = localNative ?? (isNativeLanguage(remote.native_lang) ? remote.native_lang : nativeLanguage) ?? "english";
          const remoteLearning = getEffectiveLearningLanguage(nativeForLearning, remote.learning_lang);
          await AsyncStorage.setItem("@lingua_learning_language", remoteLearning);
          setLearningLanguageState(remoteLearning);
          if (remoteLearning !== remote.learning_lang) {
            queueProgressPush({ learning_lang: remoteLearning });
          }
        }

        // If local is ahead, push that up too.
        if (
          merged.xp > remote.xp ||
          merged.streak !== remote.streak_days ||
          merged.wordsLearned > remoteWords ||
          (bestLastDate && bestLastDate !== remote.last_session_date)
        ) {
          queueProgressPush({
            xp: merged.xp,
            level: getLevel(merged.xp).num,
            streak_days: merged.streak,
            words_learned: merged.wordsLearned,
            last_session_at: new Date().toISOString(),
            last_session_date: bestLastDate,
          });
        }

        // ── P2 hydrate (SRS / course / achievements / weekly XP / profile) ──
        // Server is authoritative for these blobs when present. Local edits
        // before sign-in are preserved by the save() hooks (they push, so
        // server has them) — so on a brand-new install, remote == null path
        // above already mirrored local upstream. Here we're hydrating the
        // OTHER direction: bringing the latest server snapshot down.
        const r = remote as unknown as Record<string, unknown>;
        try {
          const localSrs = await readJson("@lingua_srs_data");
          if (r.srs_data) {
            const { hydrateSrsFromServer } = await import("@/lib/srsManager");
            await hydrateSrsFromServer(r.srs_data as any);
          } else if (localSrs) {
            queueProgressPush({ srs_data: localSrs });
          }
        } catch (e) { console.warn('[Sync] SRS hydrate failed:', e); }
        try {
          const localCourse = await readJson("@daily_course_progress");
          if (r.daily_course_progress) {
            const { hydrateProgressFromServer } = await import("@/lib/dailyCourseData");
            await hydrateProgressFromServer(r.daily_course_progress as any);
          } else if (localCourse) {
            queueProgressPush({ daily_course_progress: localCourse });
          }
        } catch (e) { console.warn('[Sync] course hydrate failed:', e); }
        try {
          const localAchievements = await readJson("@lingua_achievements");
          if (Array.isArray(r.achievements)) {
            const { hydrateAchievementsFromServer } = await import("@/lib/achievementManager");
            await hydrateAchievementsFromServer(r.achievements as string[]);
          } else if (localAchievements) {
            queueProgressPush({ achievements: localAchievements });
          }
        } catch (e) { console.warn('[Sync] achievements hydrate failed:', e); }
        try {
          if (r.weekly_xp) {
            const { hydrateWeeklyXPFromServer } = await import("@/lib/leagueManager");
            await hydrateWeeklyXPFromServer(r.weekly_xp as { week?: number; xp?: number });
          }
        } catch (e) { console.warn('[Sync] weekly XP hydrate failed:', e); }
        try {
          const localProfile = await readJson("@lingua_learner_profile");
          if (r.learner_profile) {
            const { hydrateLearnerProfileFromServer } = await import("@/lib/learnerProfile");
            await hydrateLearnerProfileFromServer(r.learner_profile as any);
          } else if (localProfile) {
            queueProgressPush({ learner_profile: localProfile });
          }
        } catch (e) { console.warn('[Sync] learner profile hydrate failed:', e); }
        try {
          const localStory = await readJson<StoryProgressBlob>(STORY_PROGRESS_KEY);
          if (r.story_progress || localStory) {
            const mergedStory = mergeStoryProgress(localStory, r.story_progress);
            await writeJson(STORY_PROGRESS_KEY, mergedStory);
            if (!jsonEqual(mergedStory, r.story_progress)) queueProgressPush({ story_progress: mergedStory });
          }
        } catch (e) { console.warn('[Sync] story progress hydrate failed:', e); }
        try {
          const localRel = await readJson<Record<string, number>>(NPC_REL_KEY);
          if (r.npc_relationships || localRel) {
            const mergedRel = mergeNumericRecord(localRel, r.npc_relationships);
            await writeJson(NPC_REL_KEY, mergedRel);
            if (!jsonEqual(mergedRel, r.npc_relationships)) queueProgressPush({ npc_relationships: mergedRel });
          }
        } catch (e) { console.warn('[Sync] NPC relationship hydrate failed:', e); }
        try {
          const localEmo = await readJson<Record<string, string>>(NPC_EMO_KEY);
          if (r.npc_emotions || localEmo) {
            const mergedEmo = mergeStringRecord(localEmo, r.npc_emotions);
            await writeJson(NPC_EMO_KEY, mergedEmo);
            if (!jsonEqual(mergedEmo, r.npc_emotions)) queueProgressPush({ npc_emotions: mergedEmo });
          }
        } catch (e) { console.warn('[Sync] NPC emotion hydrate failed:', e); }
        try {
          const localExpressionBook = await readJson<RecordBlob>(EXPRESSION_BOOK_KEY);
          if (r.expression_book) await writeJson(EXPRESSION_BOOK_KEY, r.expression_book);
          else if (localExpressionBook) queueProgressPush({ expression_book: localExpressionBook });
        } catch (e) { console.warn('[Sync] expression book hydrate failed:', e); }
        try {
          const localIo = await readJson<RecordBlob>(STORY_IO_KEY);
          if (r.story_io_ratio) await writeJson(STORY_IO_KEY, r.story_io_ratio);
          else if (localIo) queueProgressPush({ story_io_ratio: localIo });
        } catch (e) { console.warn('[Sync] story I/O hydrate failed:', e); }
        try {
          const localClues = await readJson<RecordBlob>(STORY_CLUES_KEY);
          if (r.story_clues) await writeJson(STORY_CLUES_KEY, r.story_clues);
          else if (localClues) queueProgressPush({ story_clues: localClues });
        } catch (e) { console.warn('[Sync] story clues hydrate failed:', e); }
        try {
          const localKnownWords = await readJson<string[]>(KNOWN_WORDS_KEY);
          if (r.known_words) await writeJson(KNOWN_WORDS_KEY, r.known_words);
          else if (localKnownWords) queueProgressPush({ known_words: localKnownWords });
        } catch (e) { console.warn('[Sync] known words hydrate failed:', e); }
      } catch (e) {
        console.warn('[LanguageContext] server reconcile failed:', e);
      }
    };

    // Run once after hydration (in case a session already exists) and on
    // every subsequent auth event.
    reconcile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        reconcile();
      } else if (event === "SIGNED_OUT") {
        resetInMemoryProgress();
      }
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [isHydrated]);

  const setNativeLanguage = async (lang: NativeLanguage) => {
    await AsyncStorage.setItem("@lingua_language", lang);
    setNativeLanguageState(lang);
    setHasOnboarded(true);
    const currentLL = await AsyncStorage.getItem("@lingua_learning_language");
    const effectiveLearning = getEffectiveLearningLanguage(lang, isNativeLanguage(currentLL) ? currentLL : null);
    if (!currentLL || currentLL !== effectiveLearning) {
      await AsyncStorage.setItem("@lingua_learning_language", effectiveLearning);
      setLearningLanguageState(effectiveLearning);
      queueProgressPush({ native_lang: lang, learning_lang: effectiveLearning });
    } else {
      queueProgressPush({ native_lang: lang });
    }
  };

  const setLearningLanguage = async (lang: NativeLanguage) => {
    const storedNative = await AsyncStorage.getItem("@lingua_language");
    const native = isNativeLanguage(storedNative) ? storedNative : nativeLanguage;
    const effectiveLearning = native ? getEffectiveLearningLanguage(native, lang) : lang;
    await AsyncStorage.setItem("@lingua_learning_language", effectiveLearning);
    setLearningLanguageState(effectiveLearning);
    queueProgressPush({ learning_lang: effectiveLearning });
  };

  const updateStats = async (updates: StatsUpdate) => {
    const run = async () => {
      const currentStats = statsRef.current;
      const oldLevel = getLevel(currentStats.xp);
      const patch = typeof updates === "function" ? updates(currentStats) : updates;
      const newStats: UserStats = { ...currentStats, ...patch };

      // Stats counters should never move backwards through the public update
      // API. Resets/account switches use direct state writes instead.
      if (typeof patch.xp === "number") newStats.xp = Math.max(currentStats.xp, patch.xp);
      if (typeof patch.wordsLearned === "number") newStats.wordsLearned = Math.max(currentStats.wordsLearned, patch.wordsLearned);
      if (typeof patch.streak === "number") newStats.streak = Math.max(currentStats.streak, patch.streak);

      const newLevel = getLevel(newStats.xp);
      const xpDelta = Math.max(0, newStats.xp - currentStats.xp);
      if (newLevel.num > oldLevel.num) {
        setPendingLevelUp(newLevel);
      }

      // ── Daily streak ─────────────────────────────────────────────────────────
      // Any actual XP gain is a real learning moment, so it counts as today's
      // activity. The whole stats write is serialized so burst rewards cannot
      // each read the same stale XP/streak baseline.
      if (xpDelta > 0) {
        try {
          const today = localDateString();
          const last = await AsyncStorage.getItem("@lingua_last_session_date");
          let nextStreak = currentStats.streak;
          if (last === today) {
            // already counted today; leave streak alone
          } else {
            const yesterday = localDateString(new Date(Date.now() - 86_400_000));
            if (last === yesterday) {
              nextStreak = (currentStats.streak || 0) + 1;
            } else {
              // first ever session OR a gap > 1 day → restart at 1
              nextStreak = 1;
            }
            await AsyncStorage.setItem("@lingua_last_session_date", today);
          }
          newStats.streak = nextStreak;
        } catch (e) {
          console.warn('[Streak] update failed:', e);
        }
      }

      statsRef.current = newStats;
      setStats(newStats);
      await AsyncStorage.setItem("@lingua_stats", JSON.stringify(newStats));

      // Fire-and-forget: check achievements after stats update
      checkAchievements({ stats: newStats }).catch((e) => console.warn('[Achievements] check failed:', e));

      // Fire-and-forget: track weekly XP if XP changed
      if (xpDelta > 0) {
        addWeeklyXP(xpDelta).catch((e) => console.warn('[League] weekly XP update failed:', e));
      }

      // Fire-and-forget: push to Supabase if signed in (no-op otherwise — the
      // queue helper itself checks for a session before sending).
      queueProgressPush({
        xp: newStats.xp,
        level: newLevel.num,
        streak_days: newStats.streak,
        last_session_at: new Date().toISOString(),
        last_session_date: await AsyncStorage.getItem("@lingua_last_session_date").catch(() => null),
        words_learned: newStats.wordsLearned,
      });
    };

    statsUpdateLockRef.current = statsUpdateLockRef.current.then(run, run);
    return statsUpdateLockRef.current;
  };

  const awardXp = async (amount: number) => {
    const safeAmount = Math.max(0, Math.floor(amount));
    if (safeAmount <= 0) return;
    await updateStats((current) => ({ xp: current.xp + safeAmount }));
  };

  const clearLevelUp = () => setPendingLevelUp(null);

  const t = (key: string): string => {
    const lang = nativeLanguage ?? "english";
    return translations[lang][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ nativeLanguage, setNativeLanguage, learningLanguage, setLearningLanguage, hasOnboarded, isHydrated, stats, updateStats, awardXp, t, pendingLevelUp, clearLevelUp, syncStatus }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
