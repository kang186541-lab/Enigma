import { loadLearnerProfile, saveLearnerProfile, type SpeakingDayProgress, type SpeakingProgress } from "@/lib/learnerProfile";

export const SPEAKING_DAILY_GOAL = 19;

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

export async function recordSpokenSentence(params: {
  targetLanguage: string;
  promptKey: string;
  shouldCommit?: () => boolean;
}): Promise<{ day: SpeakingDayProgress; counted: boolean }> {
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

  return { day: result.day, counted: true };
}
