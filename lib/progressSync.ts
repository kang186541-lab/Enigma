// Server sync for the minimum-viable progress slice:
//   xp / level / streak_days / last_session_at / native_lang / learning_lang
//
// Lives in lib/ (not in a context) so any AsyncStorage manager can call it
// directly. Failures are non-fatal — local AsyncStorage remains the source of
// truth and we just log warnings.

import { supabase } from "@/lib/supabase";

export interface ServerProgress {
  user_id: string;
  xp: number;
  level: number;
  streak_days: number;
  words_learned: number;
  last_session_at: string | null;
  last_session_date: string | null;
  native_lang: string | null;
  learning_lang: string | null;
  // P2 — JSONB blobs the client owns the shape of.
  srs_data: unknown | null;
  daily_course_progress: unknown | null;
  achievements: unknown | null;
  weekly_xp: unknown | null;
  learner_profile: unknown | null;
  story_progress: unknown | null;
  npc_relationships: unknown | null;
  npc_emotions: unknown | null;
  expression_book: unknown | null;
  story_io_ratio: unknown | null;
  story_clues: unknown | null;
  known_words: unknown | null;
  updated_at: string;
}

export interface ProgressPatch {
  xp?: number;
  level?: number;
  streak_days?: number;
  words_learned?: number;
  last_session_at?: string | null;
  last_session_date?: string | null;
  native_lang?: string | null;
  learning_lang?: string | null;
  // P2 JSON blobs — pass the full object you want stored.
  srs_data?: unknown;
  daily_course_progress?: unknown;
  achievements?: unknown;
  weekly_xp?: unknown;
  learner_profile?: unknown;
  story_progress?: unknown;
  npc_relationships?: unknown;
  npc_emotions?: unknown;
  expression_book?: unknown;
  story_io_ratio?: unknown;
  story_clues?: unknown;
  known_words?: unknown;
}

export type ProgressSyncStatus = "idle" | "pending" | "syncing" | "synced" | "error";

export interface ProgressSyncSnapshot {
  status: ProgressSyncStatus;
  lastSyncedAt: string | null;
  lastError: string | null;
}

// Monotonic fields where the server should keep the higher value if the
// caller's value is lower (protects against stale-device downgrades).
// `streak_days` is deliberately excluded: current streaks must be allowed to
// reset after a missed day.
const COUNTER_KEYS = ["xp", "level", "words_learned"] as const;
type CounterKey = typeof COUNTER_KEYS[number];

const TABLE = "linguaai_user_progress";
const PROGRESS_MERGE_SELECT = [
  "xp",
  "level",
  "streak_days",
  "words_learned",
  "srs_data",
  "daily_course_progress",
  "achievements",
  "weekly_xp",
  "learner_profile",
  "story_progress",
  "npc_relationships",
  "npc_emotions",
  "expression_book",
  "story_io_ratio",
  "story_clues",
  "known_words",
].join(", ");

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function stringItems(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function mergeStringArrayBlob(local: unknown, remote: unknown): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const item of [...stringItems(remote), ...stringItems(local)]) {
    const key = item.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }
  return merged;
}

export function mergeStoryProgressBlob(local: unknown, remote: unknown): { completed: string[]; unlocked: string[] } {
  const localObj = isRecord(local) ? local : {};
  const remoteObj = isRecord(remote) ? remote : {};
  return {
    completed: mergeStringArrayBlob(localObj.completed, remoteObj.completed),
    unlocked: mergeStringArrayBlob(
      ["london", ...stringItems(localObj.unlocked)],
      stringItems(remoteObj.unlocked),
    ),
  };
}

export function mergeNumericRecordBlob(local: unknown, remote: unknown): Record<string, number> {
  const merged: Record<string, number> = {};
  const remoteObj = isRecord(remote) ? remote : {};
  const localObj = isRecord(local) ? local : {};
  for (const [key, value] of Object.entries(remoteObj)) {
    if (typeof value === "number") merged[key] = value;
  }
  for (const [key, value] of Object.entries(localObj)) {
    if (typeof value === "number") merged[key] = Math.max(merged[key] ?? 0, value);
  }
  return merged;
}

export function mergeStringRecordBlob(local: unknown, remote: unknown): Record<string, string> {
  const merged: Record<string, string> = {};
  const remoteObj = isRecord(remote) ? remote : {};
  const localObj = isRecord(local) ? local : {};
  for (const [key, value] of Object.entries(remoteObj)) {
    if (typeof value === "string") merged[key] = value;
  }
  for (const [key, value] of Object.entries(localObj)) {
    if (typeof value === "string") merged[key] = value;
  }
  return merged;
}

function firstNonEmpty(...values: unknown[]): unknown {
  for (const value of values) {
    if (value == null) continue;
    if (typeof value === "string" && value.trim().length === 0) continue;
    return value;
  }
  return undefined;
}

function mergeExpressionItem(local: Record<string, unknown>, remote: Record<string, unknown>): Record<string, unknown> {
  const learnedDates = [local.learnedAt, remote.learnedAt].filter((value): value is string => typeof value === "string");
  return {
    ...remote,
    ...local,
    phrase: firstNonEmpty(local.phrase, remote.phrase),
    meaning: firstNonEmpty(local.meaning, remote.meaning) ?? "",
    collection: firstNonEmpty(local.collection, remote.collection),
    chapter: firstNonEmpty(local.chapter, remote.chapter),
    tprsStage: Math.max(
      typeof local.tprsStage === "number" ? local.tprsStage : 0,
      typeof remote.tprsStage === "number" ? remote.tprsStage : 0,
    ) || undefined,
    mastered: Boolean(local.mastered || remote.mastered),
    learnedAt: learnedDates.sort()[0] ?? local.learnedAt ?? remote.learnedAt,
  };
}

export function mergeExpressionBookBlob(local: unknown, remote: unknown): Record<string, unknown> {
  const localObj = isRecord(local) ? local : {};
  const remoteObj = isRecord(remote) ? remote : {};
  const byPhrase = new Map<string, Record<string, unknown>>();
  for (const item of [...(Array.isArray(remoteObj.expressions) ? remoteObj.expressions : []), ...(Array.isArray(localObj.expressions) ? localObj.expressions : [])]) {
    if (!isRecord(item) || typeof item.phrase !== "string") continue;
    const key = item.phrase.trim().toLowerCase();
    if (!key) continue;
    const existing = byPhrase.get(key);
    byPhrase.set(key, existing ? mergeExpressionItem(item, existing) : item);
  }
  return {
    ...remoteObj,
    ...localObj,
    expressions: Array.from(byPhrase.values()),
  };
}

export function mergeStoryIoRatioBlob(local: unknown, remote: unknown): Record<string, unknown> {
  const localObj = isRecord(local) ? local : {};
  const remoteObj = isRecord(remote) ? remote : {};
  const localChapters = isRecord(localObj.chapters) ? localObj.chapters : {};
  const remoteChapters = isRecord(remoteObj.chapters) ? remoteObj.chapters : {};
  const chapters: Record<string, { inputCount: number; outputCount: number }> = {};
  for (const chapter of new Set([...Object.keys(remoteChapters), ...Object.keys(localChapters)])) {
    const localStats = isRecord(localChapters[chapter]) ? localChapters[chapter] : {};
    const remoteStats = isRecord(remoteChapters[chapter]) ? remoteChapters[chapter] : {};
    chapters[chapter] = {
      inputCount: Math.max(
        typeof localStats.inputCount === "number" ? localStats.inputCount : 0,
        typeof remoteStats.inputCount === "number" ? remoteStats.inputCount : 0,
      ),
      outputCount: Math.max(
        typeof localStats.outputCount === "number" ? localStats.outputCount : 0,
        typeof remoteStats.outputCount === "number" ? remoteStats.outputCount : 0,
      ),
    };
  }
  return { ...remoteObj, ...localObj, chapters };
}

export function mergeStoryCluesBlob(local: unknown, remote: unknown): Record<string, string[]> {
  const localObj = isRecord(local) ? local : {};
  const remoteObj = isRecord(remote) ? remote : {};
  const merged: Record<string, string[]> = {};
  for (const chapter of new Set([...Object.keys(remoteObj), ...Object.keys(localObj)])) {
    merged[chapter] = mergeStringArrayBlob(localObj[chapter], remoteObj[chapter]);
  }
  return merged;
}

export function mergeWeeklyXpBlob(local: unknown, remote: unknown): Record<string, number> | unknown {
  const localObj = isRecord(local) ? local : null;
  const remoteObj = isRecord(remote) ? remote : null;
  if (!localObj) return remote;
  if (!remoteObj) return local;
  const localWeek = typeof localObj.week === "number" ? localObj.week : 0;
  const remoteWeek = typeof remoteObj.week === "number" ? remoteObj.week : 0;
  if (localWeek > remoteWeek) return local;
  if (remoteWeek > localWeek) return remote;
  return {
    ...remoteObj,
    ...localObj,
    week: localWeek || remoteWeek,
    xp: Math.max(
      typeof localObj.xp === "number" ? localObj.xp : 0,
      typeof remoteObj.xp === "number" ? remoteObj.xp : 0,
    ),
  };
}

let syncSnapshot: ProgressSyncSnapshot = {
  status: "idle",
  lastSyncedAt: null,
  lastError: null,
};
const listeners = new Set<(snapshot: ProgressSyncSnapshot) => void>();

let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPatch: ProgressPatch = {};
let pendingUserId: string | null = null;
let currentAuthUserId: string | null = null;

supabase.auth.getSession()
  .then(({ data }) => {
    currentAuthUserId = data.session?.user?.id ?? null;
  })
  .catch(() => {
    currentAuthUserId = null;
  });

supabase.auth.onAuthStateChange((_event, session) => {
  const nextUserId = session?.user?.id ?? null;
  if (pendingUserId && nextUserId && pendingUserId !== nextUserId) {
    clearProgressPushQueue();
  }
  currentAuthUserId = nextUserId;
});

function notifySync(snapshot: ProgressSyncSnapshot) {
  syncSnapshot = snapshot;
  listeners.forEach((listener) => listener(syncSnapshot));
}

export function getProgressSyncSnapshot(): ProgressSyncSnapshot {
  return syncSnapshot;
}

/**
 * Signal that a reconcile cycle finished — server snapshot has been merged
 * into local AsyncStorage — even when no push was needed (server already
 * had everything local has).
 *
 * Home and other screens subscribe to `lastSyncedAt` to know when to
 * re-read AsyncStorage. Without this notification, a sign-in / account-
 * switch that doesn't trigger any queueProgressPush leaves Home reading
 * stale state until next focus.
 */
export function notifyHydrateComplete(): void {
  notifySync({
    status: "synced",
    lastSyncedAt: new Date().toISOString(),
    lastError: null,
  });
}

export function subscribeProgressSync(
  listener: (snapshot: ProgressSyncSnapshot) => void,
): () => void {
  listeners.add(listener);
  listener(syncSnapshot);
  return () => listeners.delete(listener);
}

export async function fetchServerProgress(): Promise<ServerProgress | null> {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.warn("[progressSync] fetch failed:", error.message);
    return null;
  }
  return (data as ServerProgress | null) ?? null;
}

// Upsert progress for the current user.
//
// We first fetch the existing row and merge for counter columns: a stale
// device must NEVER downgrade the server's xp / level / streak / words.
// Non-counter fields (last_session_at, native_lang, learning_lang) are
// authoritative from the latest caller.
//
// Missing fields are left untouched on existing rows.
export async function pushServerProgress(
  patch: ProgressPatch,
  expectedUserId?: string | null,
): Promise<boolean> {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user) {
    notifySync({ ...syncSnapshot, status: "idle" });
    return false;
  }
  if (expectedUserId && user.id !== expectedUserId) {
    notifySync({
      ...syncSnapshot,
      status: "error",
      lastError: "Progress sync user changed before flush.",
    });
    return false;
  }
  notifySync({ ...syncSnapshot, status: "syncing", lastError: null });

  // Fetch existing row (no error if missing — first push for this user).
  const { data: existing, error: fetchErr } = await supabase
    .from(TABLE)
    .select(PROGRESS_MERGE_SELECT)
    .eq("user_id", user.id)
    .maybeSingle();
  if (fetchErr) {
    console.warn("[progressSync] fetch-before-merge failed:", fetchErr.message);
    // Fall through — we'd rather upsert with the local view than fail entirely.
  }

  const existingRow = existing as unknown as Record<string, unknown> | null;

  // Strip undefined keys so the upsert payload is minimal.
  const row: Record<string, unknown> = { user_id: user.id };
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    if ((COUNTER_KEYS as readonly string[]).includes(k) && existingRow) {
      const remote = existingRow[k];
      if (typeof remote === "number" && typeof v === "number" && remote > v) {
        // Server is ahead — keep server's value, don't downgrade.
        row[k] = remote;
        continue;
      }
    }
    if (k === "learner_profile" && existingRow && v && typeof v === "object") {
      const remoteProfile = existingRow.learner_profile;
      if (remoteProfile && typeof remoteProfile === "object") {
        const { mergeLearnerProfiles } = await import("@/lib/learnerProfile");
        row[k] = mergeLearnerProfiles(v as any, remoteProfile as any);
        continue;
      }
    }
    if (k === "daily_course_progress" && existingRow && v && typeof v === "object") {
      const remoteDailyCourse = existingRow.daily_course_progress;
      if (remoteDailyCourse && typeof remoteDailyCourse === "object") {
        const { mergeDailyCourseProgress } = await import("@/lib/dailyCourseData");
        row[k] = mergeDailyCourseProgress(v as any, remoteDailyCourse as any);
        continue;
      }
    }
    if (k === "srs_data" && existingRow && v && typeof v === "object") {
      const remoteSrs = existingRow.srs_data;
      if (remoteSrs && typeof remoteSrs === "object") {
        const { mergeSrsData } = await import("@/lib/srsManager");
        row[k] = mergeSrsData(v as any, remoteSrs as any);
        continue;
      }
    }
    if (existingRow) {
      const remote = existingRow[k];
      if (k === "achievements") {
        row[k] = mergeStringArrayBlob(v, remote);
        continue;
      }
      if (k === "weekly_xp") {
        row[k] = mergeWeeklyXpBlob(v, remote);
        continue;
      }
      if (k === "story_progress") {
        row[k] = mergeStoryProgressBlob(v, remote);
        continue;
      }
      if (k === "npc_relationships") {
        row[k] = mergeNumericRecordBlob(v, remote);
        continue;
      }
      if (k === "npc_emotions") {
        row[k] = mergeStringRecordBlob(v, remote);
        continue;
      }
      if (k === "expression_book") {
        row[k] = mergeExpressionBookBlob(v, remote);
        continue;
      }
      if (k === "story_io_ratio") {
        row[k] = mergeStoryIoRatioBlob(v, remote);
        continue;
      }
      if (k === "story_clues") {
        row[k] = mergeStoryCluesBlob(v, remote);
        continue;
      }
      if (k === "known_words") {
        row[k] = mergeStringArrayBlob(v, remote);
        continue;
      }
    }
    row[k] = v;
  }

  const { error } = await supabase
    .from(TABLE)
    .upsert(row, { onConflict: "user_id" });

  if (error) {
    console.warn("[progressSync] push failed:", error.message);
    notifySync({ ...syncSnapshot, status: "error", lastError: error.message });
    return false;
  }
  notifySync({ status: "synced", lastSyncedAt: new Date().toISOString(), lastError: null });
  return true;
}

export function queueProgressPush(patch: ProgressPatch, delayMs = 1000): void {
  const queueUserId = currentAuthUserId;
  if (!queueUserId) {
    notifySync({ ...syncSnapshot, status: "idle", lastError: null });
    return;
  }
  if (pendingUserId !== queueUserId) {
    if (pendingTimer) clearTimeout(pendingTimer);
    pendingTimer = null;
    pendingPatch = {};
    pendingUserId = queueUserId;
  }
  pendingPatch = { ...pendingPatch, ...patch };
  pendingUserId = queueUserId;
  notifySync({ ...syncSnapshot, status: "pending", lastError: null });
  if (pendingTimer) clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => {
    const toSend = pendingPatch;
    const toSendUserId = pendingUserId;
    pendingPatch = {};
    pendingUserId = null;
    pendingTimer = null;
    pushServerProgress(toSend, toSendUserId).then((ok) => {
      if (!ok && toSendUserId === currentAuthUserId) {
        pendingPatch = { ...toSend, ...pendingPatch };
        pendingUserId = toSendUserId;
        notifySync({ ...syncSnapshot, status: "error", lastError: "Progress sync failed; retry pending." });
      }
    }).catch((e) =>
      console.warn("[progressSync] queued push error:", e),
    );
  }, delayMs);
}

export function clearProgressPushQueue(): void {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  pendingPatch = {};
  pendingUserId = null;
  notifySync({ ...syncSnapshot, status: "idle" });
}

// Force-flush any pending queued push (e.g. on sign-out). Returns true if
// the flush succeeded (or there was nothing to flush). Callers can use the
// return value to decide whether to clear local state, so a network failure
// doesn't strand the user's unsynced XP.
export async function flushProgressPush(): Promise<boolean> {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  const toSend = pendingPatch;
  const toSendUserId = pendingUserId;
  pendingPatch = {};
  pendingUserId = null;
  if (Object.keys(toSend).length === 0) return true;
  if (!toSendUserId) return true;
  try {
    const ok = await pushServerProgress(toSend, toSendUserId);
    if (!ok) {
      pendingPatch = { ...toSend, ...pendingPatch };
      pendingUserId = toSendUserId;
    }
    return ok;
  } catch (e) {
    console.warn("[progressSync] flush failed:", e);
    // Put it back so the next push attempt can retry.
    pendingPatch = { ...toSend, ...pendingPatch };
    pendingUserId = toSendUserId;
    return false;
  }
}
