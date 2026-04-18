import AsyncStorage from "@react-native-async-storage/async-storage";
import { ACHIEVEMENTS, type Achievement } from "@/constants/achievements";
import type { UserStats } from "@/context/LanguageContext";

const EARNED_KEY = "@lingua_achievements";

/** Load earned achievement IDs */
export async function loadEarnedAchievements(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(EARNED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("[Achievements] load failed:", e);
    return [];
  }
}

/** Save earned achievement IDs */
async function saveEarned(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(EARNED_KEY, JSON.stringify(ids));
  } catch (e) {
    console.warn("[Achievements] save failed:", e);
  }
}

/** Earn an achievement. Returns the Achievement if newly earned, null if already earned. */
export async function earnAchievement(id: string): Promise<Achievement | null> {
  const earned = await loadEarnedAchievements();
  if (earned.includes(id)) return null;

  earned.push(id);
  await saveEarned(earned);

  return ACHIEVEMENTS.find((a) => a.id === id) ?? null;
}

/** Check all achievement conditions and return newly earned ones */
export async function checkAchievements(context: {
  stats: UserStats;
  npcsMet?: number;
  totalNpcs?: number;
  chatMessages?: number;
  storyChaptersCompleted?: number;
  srsMastered?: number;
  pronScore?: number;
  lessonTimeMs?: number;
}): Promise<Achievement[]> {
  const earned = await loadEarnedAchievements();
  const newlyEarned: Achievement[] = [];

  const checks: Array<{ id: string; condition: () => boolean }> = [
    // Learning
    { id: "first_lesson",  condition: () => context.stats.xp > 0 },
    { id: "streak_7",      condition: () => context.stats.streak >= 7 },
    { id: "streak_30",     condition: () => context.stats.streak >= 30 },
    { id: "words_50",      condition: () => context.stats.wordsLearned >= 50 },
    { id: "words_100",     condition: () => context.stats.wordsLearned >= 100 },
    { id: "words_300",     condition: () => context.stats.wordsLearned >= 300 },
    { id: "srs_master",    condition: () => (context.srsMastered ?? 0) >= 50 },
    { id: "level_3",       condition: () => context.stats.xp >= 301 },
    { id: "level_5",       condition: () => context.stats.xp >= 1001 },

    // Social
    { id: "first_npc",     condition: () => (context.npcsMet ?? 0) >= 1 },
    { id: "npc_5",         condition: () => (context.npcsMet ?? 0) >= 5 },
    { id: "npc_all",       condition: () => (context.npcsMet ?? 0) >= (context.totalNpcs ?? 23) },
    { id: "chat_50",       condition: () => (context.chatMessages ?? 0) >= 50 },
    { id: "first_story",   condition: () => (context.storyChaptersCompleted ?? 0) >= 1 },

    // Mastery
    { id: "perfect_pron",  condition: () => (context.pronScore ?? 0) >= 90 },
    { id: "speed_demon",   condition: () => (context.lessonTimeMs ?? Infinity) < 300000 },
    { id: "night_owl",     condition: () => new Date().getHours() >= 23 },
    { id: "early_bird",    condition: () => new Date().getHours() < 6 },
    { id: "xp_1000",       condition: () => context.stats.xp >= 1000 },
  ];

  for (const check of checks) {
    if (!earned.includes(check.id) && check.condition()) {
      const achievement = ACHIEVEMENTS.find((a) => a.id === check.id);
      if (achievement) {
        earned.push(check.id);
        newlyEarned.push(achievement);
      }
    }
  }

  if (newlyEarned.length > 0) {
    await saveEarned(earned);
  }

  return newlyEarned;
}

/** Get progress towards an achievement (0-1) */
export function getProgress(
  id: string,
  context: { stats: UserStats; npcsMet?: number; srsMastered?: number }
): number {
  switch (id) {
    case "streak_7":   return Math.min(1, context.stats.streak / 7);
    case "streak_30":  return Math.min(1, context.stats.streak / 30);
    case "words_50":   return Math.min(1, context.stats.wordsLearned / 50);
    case "words_100":  return Math.min(1, context.stats.wordsLearned / 100);
    case "words_300":  return Math.min(1, context.stats.wordsLearned / 300);
    case "npc_5":      return Math.min(1, (context.npcsMet ?? 0) / 5);
    case "npc_all":    return Math.min(1, (context.npcsMet ?? 0) / 23);
    case "srs_master": return Math.min(1, (context.srsMastered ?? 0) / 50);
    case "xp_1000":    return Math.min(1, context.stats.xp / 1000);
    default:           return 0;
  }
}
