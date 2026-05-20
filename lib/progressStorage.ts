import AsyncStorage from "@react-native-async-storage/async-storage";

export const ACTIVE_USER_KEY = "@lingua_active_user_id";

export const DEFAULT_STATS = {
  streak: 0,
  wordsLearned: 0,
  accuracy: 0,
  xp: 0,
};

const EXACT_PROGRESS_KEYS = [
  "@lingua_language",
  "@lingua_learning_language",
  "@lingua_stats",
  "@lingua_last_session_date",
  "@lingua_known_words",
  "@lingua_srs_data",
  "@daily_course_progress",
  "@lingua_achievements",
  "@lingua_league_week",
  "@lingua_weekly_xp",
  "@lingua_learner_profile",
  "@lingua_difficulty_profile",
  "@lingua_difficulty_override",
  "@lingua_daily_sessions",
  "@lingua_signin_modal_seen_v1",
  "@lingua_signin_banner_dismissed_at",
  "lingo_story_progress",
  "npcRelationships",
  "npcEmotions",
  "storyCluesCollected",
  "ioRatioTracking",
  "expressionBook",
] as const;

const PROGRESS_KEY_PREFIXES = [
  "basicCourseProgress_",
  "basicCourseCompleted_",
  "basicReviewTs_",
  "lesson_seen_",
  "cards_daily_",
  "cards_last_seen_words",
  "speak_weak_words_",
  "speak_last_seen_",
  "pron_count_",
  "pron_last_word_",
  "@enigma_intro_seen_",
] as const;

export function localDateString(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function localDateStringFromIso(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return localDateString(date);
}

export async function readJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : null;
  } catch {
    return null;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function clearLocalProgressState(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const exact = new Set<string>(EXACT_PROGRESS_KEYS);
  const toRemove = keys.filter((key) =>
    exact.has(key) || PROGRESS_KEY_PREFIXES.some((prefix) => key.startsWith(prefix)),
  );

  if (toRemove.length) {
    await AsyncStorage.multiRemove(toRemove);
  }
  await AsyncStorage.removeItem(ACTIVE_USER_KEY);
}

export async function clearLocalProgressForAccountSwitch(nextUserId: string): Promise<void> {
  const activeUserId = await AsyncStorage.getItem(ACTIVE_USER_KEY);
  if (activeUserId && activeUserId !== nextUserId) {
    await clearLocalProgressState();
  }
  await AsyncStorage.setItem(ACTIVE_USER_KEY, nextUserId);
}
