import AsyncStorage from "@react-native-async-storage/async-storage";

import { loadLearnerProfile, saveLearnerProfile, type SpeakingDayProgress, type SpeakingProgress } from "@/lib/learnerProfile";

// Monotonic lifetime-day counter, kept in its OWN AsyncStorage keys rather than
// inside SpeakingProgress on purpose:
//   - SpeakingProgress is merged field-by-field on sync (see
//     mergeSpeakingProgress / progressSync's learner_profile merge). A new field
//     there would be silently dropped unless we also widened the locked merge
//     path. A standalone key avoids touching the progress-sync/merge shape.
//   - It must NOT be trimmed: the bug was that the offset was derived from
//     `history` (capped at the last 45 days), so it plateaued. A dedicated
//     counter grows forever.
// `LIFETIME_SPOKEN_DAYS_KEY` counts every distinct calendar day the learner has
// spoken >=1 sentence (today included once it happens). `LAST_SPOKEN_DAY_KEY`
// is the date-key of the most recent counted day, used to fire the increment
// exactly once per new day. `LIFETIME_DAYS_OWNER_KEY` stamps which signed-in
// account the counter belongs to: the old history-derived offset reset to 0 on
// account switch (because @lingua_learner_profile is wiped), and these
// standalone keys are NOT in that cleanup list, so we self-reset when the
// active user changes to avoid one account inheriting another's day offset.
const LIFETIME_SPOKEN_DAYS_KEY = "@lingua_lifetime_spoken_days";
const LAST_SPOKEN_DAY_KEY = "@lingua_last_spoken_day";
const LIFETIME_DAYS_OWNER_KEY = "@lingua_lifetime_spoken_days_owner";
// Literal of progressStorage's ACTIVE_USER_KEY. Inlined (not imported) to keep
// this fix self-contained to speakingProgress.ts; kept in sync deliberately.
const ACTIVE_USER_KEY = "@lingua_active_user_id";

// Daily spoken-sentence target. This is a PRODUCT LEVER, not just copy: it
// gates `dailyGoalMet`, which un-collapses the home dashboard and lifts
// "focus mode" (say today's sentences first). It's the "good session" bar,
// NOT the streak bar (the streak counts from a single sentence). Kept low (5)
// so a hesitant beginner can clear it on a low-motivation day — an unreachable
// goal turns focus mode into a wall, not a ramp — and so the number echoes the
// "Rudy와 5분" brand promise.
export const SPEAKING_DAILY_GOAL = 5;

function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeSpeakingProgress(progress?: Partial<SpeakingProgress> | null): SpeakingProgress {
  return {
    dailyGoal: progress?.dailyGoal ?? SPEAKING_DAILY_GOAL,
    history: progress?.history ?? {},
  };
}

function parseNonNegativeInt(raw: string | null): number | null {
  if (raw == null) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/**
 * Drop the standalone lifetime-day keys when they belong to a different signed-in
 * account than the one currently active. The old offset was derived from
 * @lingua_learner_profile (wiped on account switch), so it reset to 0 for a new
 * account; these standalone keys aren't in that cleanup list, so without this a
 * second account on the same device would inherit the first account's offset.
 * Signed-out (no active user id) is treated as "no owner change" so a plain
 * relaunch never wipes progress.
 */
async function reconcileLifetimeDaysOwner(): Promise<void> {
  try {
    const activeUserId = await AsyncStorage.getItem(ACTIVE_USER_KEY);
    if (!activeUserId) return; // signed out — keep local counter as-is
    const owner = await AsyncStorage.getItem(LIFETIME_DAYS_OWNER_KEY);
    if (owner === activeUserId) return;
    // Different account (or first stamp): clear the counter so the seed below
    // re-derives from THIS account's history, and claim ownership.
    await AsyncStorage.multiRemove([LIFETIME_SPOKEN_DAYS_KEY, LAST_SPOKEN_DAY_KEY]);
    await AsyncStorage.setItem(LIFETIME_DAYS_OWNER_KEY, activeUserId);
  } catch (e) {
    console.warn("[speakingProgress] lifetime-day owner reconcile failed:", e);
  }
}

/**
 * Number of distinct calendar days the learner has spoken on so far, today
 * included once they speak. Backed by a monotonic AsyncStorage counter that is
 * NEVER trimmed, so it keeps growing past 45 days (unlike the speaking history).
 *
 * Migration: pre-existing users have no counter yet but do have history. We
 * seed the counter from the distinct day-count in their (trimmed) history so
 * they don't reset to day 0. This is a floor — `history` was capped at 45 days,
 * so a very long-tenured user may under-count slightly on the seed, but the
 * counter then grows correctly from there and never plateaus again.
 */
async function loadLifetimeSpokenDays(): Promise<number> {
  await reconcileLifetimeDaysOwner();
  const stored = parseNonNegativeInt(await AsyncStorage.getItem(LIFETIME_SPOKEN_DAYS_KEY));
  if (stored != null) return stored;

  // No counter yet — seed from existing history so returning users keep their
  // progression. Persist the seed so the migration only runs once.
  const profile = await loadLearnerProfile();
  const progress = normalizeSpeakingProgress(profile.speakingProgress);
  const distinctDays = Object.keys(progress.history).length;
  const today = getLocalDateKey();
  const lastSpokenDay = progress.history[today] ? today : null;
  try {
    const pairs: [string, string][] = [[LIFETIME_SPOKEN_DAYS_KEY, String(distinctDays)]];
    if (lastSpokenDay) pairs.push([LAST_SPOKEN_DAY_KEY, lastSpokenDay]);
    await AsyncStorage.multiSet(pairs);
  } catch (e) {
    console.warn("[speakingProgress] lifetime-day seed failed:", e);
  }
  return distinctDays;
}

/**
 * How many DISTINCT prior days the learner has spoken on (NOT counting today).
 * Used to advance the home "first sentence" mission day-to-day so a returning
 * learner meets new survival phrases instead of re-opening with the same
 * greeting. Returns 0 on day one.
 *
 * Off-by-one: the lifetime counter includes today once the learner has spoken,
 * but `getProgressiveMissionPhrase` expects `dayOffset` = days BEFORE today
 * (day 0 on the first day, where `idx = dayOffset * goal + spokenCount`). So we
 * subtract today (clamped at 0). On a fresh day, if today hasn't been counted
 * yet the counter already equals the number of prior days, and `max(0, n-1)`
 * would under-count by 1 — so we only subtract when today has already been
 * counted. This keeps the offset advancing the moment a new day's first
 * sentence lands, rather than lagging a day behind.
 */
export async function loadSpokenDayOffset(): Promise<number> {
  const lifetimeDays = await loadLifetimeSpokenDays();
  const lastSpokenDay = await AsyncStorage.getItem(LAST_SPOKEN_DAY_KEY);
  const todayCounted = lastSpokenDay === getLocalDateKey();
  // Subtract today only when it's already in the count; otherwise the counter
  // already reflects prior days only.
  return Math.max(0, lifetimeDays - (todayCounted ? 1 : 0));
}

/**
 * Increment the monotonic lifetime-day counter the FIRST time the learner
 * speaks on a given calendar day. Idempotent within a day: guarded by
 * LAST_SPOKEN_DAY_KEY so repeated calls for the same `date` are no-ops. Called
 * from recordSpokenSentence after a sentence is actually committed.
 */
async function bumpLifetimeSpokenDayIfNewDay(date: string): Promise<void> {
  try {
    const lastSpokenDay = await AsyncStorage.getItem(LAST_SPOKEN_DAY_KEY);
    if (lastSpokenDay === date) return;
    // Read through loadLifetimeSpokenDays so a not-yet-seeded counter is
    // migrated from history before we add today's day.
    const current = await loadLifetimeSpokenDays();
    // Re-check the guard: the seed above may have just written today's date.
    if ((await AsyncStorage.getItem(LAST_SPOKEN_DAY_KEY)) === date) return;
    await AsyncStorage.multiSet([
      [LIFETIME_SPOKEN_DAYS_KEY, String(current + 1)],
      [LAST_SPOKEN_DAY_KEY, date],
    ]);
  } catch (e) {
    console.warn("[speakingProgress] lifetime-day bump failed:", e);
  }
}

function trimHistory(history: Record<string, SpeakingDayProgress>): Record<string, SpeakingDayProgress> {
  const keep = Object.keys(history).sort().slice(-45);
  const out: Record<string, SpeakingDayProgress> = {};
  for (const key of keep) out[key] = history[key];
  return out;
}

function normalizePromptKey(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9:_-]/g, "").slice(0, 96);
}

function hashPrompt(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function buildSpeakingPromptKey(params: {
  targetLanguage: string;
  phrase: string;
  source: string;
}): string {
  const normalizedPhrase = params.phrase.trim().toLocaleLowerCase().replace(/\s+/g, " ");
  return normalizePromptKey(`${params.targetLanguage}:${params.source}:${hashPrompt(normalizedPhrase)}`);
}

export function applySpokenSentenceProgress(
  progressInput: Partial<SpeakingProgress> | null | undefined,
  params: {
    date: string;
    targetLanguage: string;
    promptKey: string;
    nowIso: string;
  }
): { progress: SpeakingProgress; day: SpeakingDayProgress; counted: boolean } {
  const progress = normalizeSpeakingProgress(progressInput);
  const promptKey = normalizePromptKey(params.promptKey);
  const previous = progress.history[params.date] ?? {
    date: params.date,
    count: 0,
    byLanguage: {},
    updatedAt: params.nowIso,
  };
  const previousPromptKeys = previous.promptKeys ?? {};
  if (promptKey && previousPromptKeys[promptKey]) {
    return { progress, day: previous, counted: false };
  }
  const next: SpeakingDayProgress = {
    date: params.date,
    count: previous.count + 1,
    byLanguage: {
      ...previous.byLanguage,
      [params.targetLanguage]: (previous.byLanguage[params.targetLanguage] ?? 0) + 1,
    },
    promptKeys: promptKey ? { ...previousPromptKeys, [promptKey]: true } : previousPromptKeys,
    updatedAt: params.nowIso,
  };

  return {
    progress: {
      dailyGoal: progress.dailyGoal,
      history: trimHistory({ ...progress.history, [params.date]: next }),
    },
    day: next,
    counted: true,
  };
}

export async function loadTodaySpeakingProgress(): Promise<SpeakingDayProgress> {
  const profile = await loadLearnerProfile();
  const progress = normalizeSpeakingProgress(profile.speakingProgress);
  const date = getLocalDateKey();
  return progress.history[date] ?? {
    date,
    count: 0,
    byLanguage: {},
    updatedAt: new Date().toISOString(),
  };
}

export function getSpeakingCountForLanguage(day: SpeakingDayProgress, targetLanguage: string): number {
  return day.byLanguage?.[targetLanguage] ?? 0;
}

let _spokenProgressLock: Promise<unknown> = Promise.resolve();

export async function recordSpokenSentence(params: {
  targetLanguage: string;
  promptKey: string;
  shouldCommit?: () => boolean;
}): Promise<{ day: SpeakingDayProgress; counted: boolean }> {
  const run = async (): Promise<{ day: SpeakingDayProgress; counted: boolean }> => {
    const profile = await loadLearnerProfile();
    const progress = normalizeSpeakingProgress(profile.speakingProgress);
    const date = getLocalDateKey();
    const promptKey = normalizePromptKey(params.promptKey);
    const previous = progress.history[date] ?? {
      date,
      count: 0,
      byLanguage: {},
      updatedAt: new Date().toISOString(),
    };
    if (params.shouldCommit && !params.shouldCommit()) {
      return { day: previous, counted: false };
    }
    const result = applySpokenSentenceProgress(progress, {
      date,
      targetLanguage: params.targetLanguage,
      promptKey,
      nowIso: new Date().toISOString(),
    });
    if (!result.counted) return { day: result.day, counted: false };

    if (params.shouldCommit && !params.shouldCommit()) {
      return { day: previous, counted: false };
    }
    await saveLearnerProfile({
      ...profile,
      speakingProgress: result.progress,
    });

    // First committed sentence of a new calendar day advances the monotonic
    // lifetime-day counter that backs loadSpokenDayOffset (so the home "first
    // sentence" keeps progressing past 45 days). Idempotent within the day.
    await bumpLifetimeSpokenDayIfNewDay(date);

    return { day: result.day, counted: true };
  };

  const next = _spokenProgressLock.then(run, run);
  _spokenProgressLock = next.catch(() => null);
  return next;
}
