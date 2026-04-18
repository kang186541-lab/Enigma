/**
 * Learner Profile — persistent model of the learner used by tutors to
 * calibrate difficulty, track error patterns, and remember goals/interests.
 *
 * All fields are optional so the profile is safe to use before diagnosis.
 *
 * STORAGE KEY: `@lingua_learner_profile` (one per user, not per language)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@lingua_learner_profile";

export type CefrLevel =
  | "A1-low" | "A1-mid" | "A1-high"
  | "A2-low" | "A2-mid" | "A2-high"
  | "B1-low" | "B1-mid" | "B1-high"
  | "B2-low" | "B2-mid" | "B2-high"
  | "C1" | "C2";

export type LearningGoal =
  | "travel" | "work" | "study" | "hobby" | "relationship" | "exam" | "unknown";

/**
 * Error pattern: a recurring type of mistake the learner makes.
 * `key` is a stable identifier like "past_tense_irregular", chosen by the AI
 * when it generates the correction. The server prompt instructs GPT to return
 * a stable snake_case key per error *category*, so the same grammatical
 * concept aggregates across sessions.
 */
export interface ErrorPattern {
  key: string;              // e.g. "past_tense_irregular", "article_a_the"
  count: number;
  lastSeenAt: string;       // ISO timestamp
  examples: string[];       // up to 5 recent original→corrected snippets
}

export interface LearnerProfile {
  // Diagnosis state
  diagnosed: boolean;
  firstMetAt: string | null;      // ISO timestamp of first diagnostic dialogue

  // Level (learning-language-specific)
  level: Partial<Record<string, CefrLevel>>;  // { english: "A2-mid", spanish: "A1-low" }

  // Goals & motivation
  goals: LearningGoal[];           // ranked most→least important
  motivationText: string | null;   // free-form "why are you learning?"

  // Personal details the tutor learns
  interests: string[];             // ["coffee", "coding", "travel"]
  occupation: string | null;
  country: string | null;

  // Error patterns (per learning language)
  errorPatterns: Partial<Record<string, ErrorPattern[]>>;

  // Session tracking
  sessionCount: number;
  lastSessionAt: string | null;    // ISO

  // ── Phase 4: Persistent tutor memory ─────────────────────────────────────
  // Per-tutor state — each tutor remembers their own sessions with the learner,
  // so switching tutors correctly resets the relationship tier.
  tutorMemory: Partial<Record<string, TutorMemory>>;  // keyed by tutor.id
}

/** Relationship tier between learner and a specific tutor. */
export type TutorRelationshipTier = "stranger" | "familiar" | "close" | "intimate";

export interface SessionSummary {
  date: string;                    // YYYY-MM-DD
  topic: string | null;            // lesson topic in target language
  highlight: string | null;        // "잘한 점" — short sentence in user's native lang
  focusNextTime: string | null;    // "다음에 주목할 점" — short sentence in user's native lang
  minutesSpent: number;
  correctionsMade: number;
}

export interface TutorMemory {
  tutorId: string;
  sessionCount: number;
  firstMetAt: string;              // ISO
  lastMetAt: string;               // ISO
  tier: TutorRelationshipTier;
  // Most recent 5 session summaries (oldest dropped first). Used by the
  // server to inject "previously..." memory into the next system prompt.
  recentSessions: SessionSummary[];
}

const EMPTY_PROFILE: LearnerProfile = {
  diagnosed: false,
  firstMetAt: null,
  level: {},
  goals: [],
  motivationText: null,
  interests: [],
  occupation: null,
  country: null,
  errorPatterns: {},
  sessionCount: 0,
  lastSessionAt: null,
  tutorMemory: {},
};

// ── Load / Save ─────────────────────────────────────────────────────────────

export async function loadLearnerProfile(): Promise<LearnerProfile> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_PROFILE };
    const parsed = JSON.parse(raw) as Partial<LearnerProfile>;
    // Merge with defaults so new fields added later don't crash old stored data
    return { ...EMPTY_PROFILE, ...parsed };
  } catch (e) {
    console.warn("[LearnerProfile] load failed:", e);
    return { ...EMPTY_PROFILE };
  }
}

export async function saveLearnerProfile(profile: LearnerProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn("[LearnerProfile] save failed:", e);
  }
}

// ── Update helpers (non-destructive merges) ──────────────────────────────────

/** Called when diagnostic dialogue completes. */
export async function markDiagnosed(updates: {
  level?: Record<string, CefrLevel>;
  goals?: LearningGoal[];
  motivationText?: string;
  interests?: string[];
  occupation?: string;
  country?: string;
}): Promise<void> {
  const p = await loadLearnerProfile();
  const now = new Date().toISOString();
  // Non-destructive merges: empty arrays/strings preserve existing data.
  const nextGoals = (updates.goals && updates.goals.length)
    ? Array.from(new Set([...(p.goals ?? []), ...updates.goals]))
    : p.goals;
  const nextMotivation = (updates.motivationText && updates.motivationText.trim())
    ? updates.motivationText
    : p.motivationText;
  const nextOccupation = (updates.occupation && updates.occupation.trim())
    ? updates.occupation
    : p.occupation;
  const nextCountry = (updates.country && updates.country.trim())
    ? updates.country
    : p.country;
  const merged: LearnerProfile = {
    ...p,
    diagnosed: true,
    firstMetAt: p.firstMetAt ?? now,
    level: { ...p.level, ...(updates.level ?? {}) },
    goals: nextGoals,
    motivationText: nextMotivation,
    interests: Array.from(new Set([...(p.interests ?? []), ...(updates.interests ?? [])])),
    occupation: nextOccupation,
    country: nextCountry,
  };
  await saveLearnerProfile(merged);
}

/** Valid CEFR level values — used by the client to validate AI-returned levels. */
export const CEFR_LEVELS: ReadonlyArray<CefrLevel> = [
  "A1-low", "A1-mid", "A1-high",
  "A2-low", "A2-mid", "A2-high",
  "B1-low", "B1-mid", "B1-high",
  "B2-low", "B2-mid", "B2-high",
  "C1", "C2",
];

export function isValidCefrLevel(x: unknown): x is CefrLevel {
  return typeof x === "string" && (CEFR_LEVELS as readonly string[]).includes(x);
}

/**
 * Backwards-compat: seed `diagnosed=true` for users who already have activity
 * in the app (XP, streak, or a stats record), so they don't get forced through
 * intake after a new deploy.
 */
export async function seedDiagnosedIfExistingUser(): Promise<void> {
  const p = await loadLearnerProfile();
  if (p.diagnosed) return;
  try {
    const statsStr = await AsyncStorage.getItem("@lingua_stats");
    if (!statsStr) return;
    const stats = JSON.parse(statsStr);
    const hasActivity = (stats?.xp ?? 0) > 0
      || (stats?.streak ?? 0) > 0
      || (stats?.wordsLearned ?? 0) > 0;
    if (hasActivity) {
      await saveLearnerProfile({
        ...p,
        diagnosed: true,
        firstMetAt: p.firstMetAt ?? new Date().toISOString(),
      });
    }
  } catch (e) {
    console.warn("[LearnerProfile] seed check failed:", e);
  }
}

/**
 * Record a correction event. Aggregates under the error-pattern key.
 * Called from chat-room when the server returns `correction.errorKey`.
 */
export async function recordErrorPattern(params: {
  learningLang: string;
  key: string;
  original: string;
  corrected: string;
}): Promise<void> {
  const { learningLang, key, original, corrected } = params;
  if (!key || !learningLang) return;
  const p = await loadLearnerProfile();
  const existing = p.errorPatterns[learningLang] ?? [];
  const idx = existing.findIndex((e) => e.key === key);
  const example = `${original}  →  ${corrected}`;
  const now = new Date().toISOString();
  let next: ErrorPattern[];
  if (idx >= 0) {
    const cur = existing[idx];
    next = [...existing];
    next[idx] = {
      ...cur,
      count: cur.count + 1,
      lastSeenAt: now,
      examples: [example, ...cur.examples.filter((x) => x !== example)].slice(0, 5),
    };
  } else {
    next = [...existing, { key, count: 1, lastSeenAt: now, examples: [example] }];
  }
  await saveLearnerProfile({
    ...p,
    errorPatterns: { ...p.errorPatterns, [learningLang]: next },
  });
}

/** Returns the N most frequent error patterns for the given learning language. */
export function getTopErrorPatterns(
  profile: LearnerProfile,
  learningLang: string,
  n = 3,
): ErrorPattern[] {
  const list = profile.errorPatterns[learningLang] ?? [];
  return [...list].sort((a, b) => b.count - a.count).slice(0, n);
}

/** Returns the current count for a specific error key (0 if never seen). */
export function getErrorCount(
  profile: LearnerProfile,
  learningLang: string,
  key: string,
): number {
  const list = profile.errorPatterns[learningLang] ?? [];
  return list.find((e) => e.key === key)?.count ?? 0;
}

/** Add/dedupe interests the tutor learns mid-conversation. */
export async function addInterests(items: string[]): Promise<void> {
  if (!items.length) return;
  const p = await loadLearnerProfile();
  const merged = Array.from(new Set([...(p.interests ?? []), ...items]));
  await saveLearnerProfile({ ...p, interests: merged });
}

/** Update CEFR level inferred from recent performance. */
export async function updateLevel(learningLang: string, level: CefrLevel): Promise<void> {
  const p = await loadLearnerProfile();
  await saveLearnerProfile({
    ...p,
    level: { ...p.level, [learningLang]: level },
  });
}

/** Increment session counter + update lastSessionAt. */
export async function bumpSession(): Promise<void> {
  const p = await loadLearnerProfile();
  await saveLearnerProfile({
    ...p,
    sessionCount: (p.sessionCount ?? 0) + 1,
    lastSessionAt: new Date().toISOString(),
  });
}

// ── Summary builder (for injecting into server prompts) ──────────────────────

/**
 * Compact profile summary formatted for an LLM system prompt.
 * Returns an empty string if no meaningful data yet.
 */
export function buildLearnerSummary(profile: LearnerProfile, learningLang: string): string {
  const lines: string[] = [];
  const level = profile.level[learningLang];
  if (level) lines.push(`CEFR level: ${level}`);
  if (profile.goals.length) lines.push(`Goals: ${profile.goals.join(", ")}`);
  if (profile.occupation) lines.push(`Occupation: ${profile.occupation}`);
  if (profile.country) lines.push(`Country: ${profile.country}`);
  if (profile.interests.length) lines.push(`Interests: ${profile.interests.slice(0, 5).join(", ")}`);
  const top = getTopErrorPatterns(profile, learningLang, 3);
  if (top.length) {
    const descs = top.map((e) => `${e.key} (${e.count}x)`).join(", ");
    lines.push(`Recurring mistakes to watch: ${descs}`);
  }
  if (profile.sessionCount > 0) lines.push(`Sessions so far: ${profile.sessionCount}`);
  return lines.length ? lines.join("\n") : "";
}

// ── Phase 4: Tutor Memory ──────────────────────────────────────────────────

/** Tier thresholds — tuned so most users reach each tier at a sensible pace. */
function tierFromSessionCount(n: number): TutorRelationshipTier {
  if (n >= 20) return "intimate";
  if (n >= 8)  return "close";
  if (n >= 3)  return "familiar";
  return "stranger";
}

/** Get (or initialize) the tutor memory block for a given tutor.id. */
export function getTutorMemory(profile: LearnerProfile, tutorId: string): TutorMemory {
  const existing = profile.tutorMemory?.[tutorId];
  if (existing) return existing;
  const now = new Date().toISOString();
  return {
    tutorId,
    sessionCount: 0,
    firstMetAt: now,
    lastMetAt: now,
    tier: "stranger",
    recentSessions: [],
  };
}

/**
 * Called at the START of a chat session. Bumps the per-tutor session count,
 * updates lastMetAt, and recomputes tier. Does NOT add a SessionSummary —
 * that happens at session end via recordSessionSummary().
 *
 * Debounce: if the learner re-enters within 10 minutes of the previous
 * `lastMetAt` we treat it as the SAME session (update `lastMetAt` only, do
 * not increment count). Prevents tier inflation from rapid re-entries.
 */
const SESSION_DEBOUNCE_MS = 10 * 60 * 1000;  // 10 minutes
export async function bumpTutorSession(tutorId: string): Promise<TutorMemory> {
  const p = await loadLearnerProfile();
  const prev = getTutorMemory(p, tutorId);
  const now = new Date();
  const lastMet = prev.lastMetAt ? new Date(prev.lastMetAt) : null;
  const isWithinDebounce =
    prev.sessionCount > 0 &&
    lastMet &&
    !isNaN(lastMet.getTime()) &&
    now.getTime() - lastMet.getTime() < SESSION_DEBOUNCE_MS;

  const nextCount = isWithinDebounce ? prev.sessionCount : prev.sessionCount + 1;
  const next: TutorMemory = {
    ...prev,
    sessionCount: nextCount,
    lastMetAt: now.toISOString(),
    tier: tierFromSessionCount(nextCount),
  };
  await saveLearnerProfile({
    ...p,
    tutorMemory: { ...(p.tutorMemory ?? {}), [tutorId]: next },
  });
  return next;
}

/**
 * Called when a lesson completes (phase === "done"). Appends a summary to
 * recentSessions, keeps only the most-recent 5 entries.
 */
export async function recordSessionSummary(tutorId: string, summary: SessionSummary): Promise<void> {
  const p = await loadLearnerProfile();
  const prev = getTutorMemory(p, tutorId);
  const next: TutorMemory = {
    ...prev,
    recentSessions: [...prev.recentSessions, summary].slice(-5),
  };
  await saveLearnerProfile({
    ...p,
    tutorMemory: { ...(p.tutorMemory ?? {}), [tutorId]: next },
  });
}

/**
 * Compact summary of the learner's history with THIS tutor, formatted for the
 * server system prompt. Returns empty string for stranger-tier with no history.
 */
export function buildTutorMemorySummary(
  profile: LearnerProfile,
  tutorId: string,
  nativeLang: "ko" | "en" | "es",
): string {
  const mem = profile.tutorMemory?.[tutorId];
  if (!mem || mem.sessionCount === 0) return "";

  const lines: string[] = [];
  lines.push(`Tutor-learner relationship tier: ${mem.tier} (sessions together: ${mem.sessionCount}).`);

  const tierGuidance: Record<TutorRelationshipTier, string> = {
    stranger: "Still getting to know each other — stay polite and discovery-oriented. Don't assume past references.",
    familiar: "You've met a few times. Natural to say 'last time we...' or 'you mentioned...'. Warmer, less formal.",
    close:    "A rapport has formed. Use first-name/nickname vibes, inside jokes from past sessions, more personal tone.",
    intimate: "Long-term learning partner. Deep warmth, banter OK, reference specific past moments. Feels like a friend who happens to teach.",
  };
  lines.push(`Tier guidance: ${tierGuidance[mem.tier]}`);

  if (mem.recentSessions.length) {
    lines.push("Recent sessions (most recent last):");
    for (const s of mem.recentSessions) {
      const parts: string[] = [s.date];
      if (s.topic) parts.push(`topic="${s.topic}"`);
      if (s.highlight) parts.push(`strength: ${s.highlight}`);
      if (s.focusNextTime) parts.push(`focus: ${s.focusNextTime}`);
      lines.push(`- ${parts.join(" · ")}`);
    }
    lines.push("Use these only when naturally relevant — do not dump them as a list.");
  }

  return lines.join("\n");
}
