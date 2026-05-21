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

// Counter fields where the server should keep the higher value if the
// caller's value is lower (protects against stale-device downgrades).
const COUNTER_KEYS = ["xp", "level", "streak_days", "words_learned"] as const;
type CounterKey = typeof COUNTER_KEYS[number];

const TABLE = "linguaai_user_progress";

let syncSnapshot: ProgressSyncSnapshot = {
  status: "idle",
  lastSyncedAt: null,
  lastError: null,
};
const listeners = new Set<(snapshot: ProgressSyncSnapshot) => void>();

function notifySync(snapshot: ProgressSyncSnapshot) {
  syncSnapshot = snapshot;
  listeners.forEach((listener) => listener(syncSnapshot));
}

export function getProgressSyncSnapshot(): ProgressSyncSnapshot {
  return syncSnapshot;
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
export async function pushServerProgress(patch: ProgressPatch): Promise<boolean> {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user) {
    notifySync({ ...syncSnapshot, status: "idle" });
    return false;
  }
  notifySync({ ...syncSnapshot, status: "syncing", lastError: null });

  // Fetch existing row (no error if missing — first push for this user).
  const { data: existing, error: fetchErr } = await supabase
    .from(TABLE)
    .select("xp, level, streak_days, words_learned")
    .eq("user_id", user.id)
    .maybeSingle();
  if (fetchErr) {
    console.warn("[progressSync] fetch-before-merge failed:", fetchErr.message);
    // Fall through — we'd rather upsert with the local view than fail entirely.
  }

  // Strip undefined keys so the upsert payload is minimal.
  const row: Record<string, unknown> = { user_id: user.id };
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    if ((COUNTER_KEYS as readonly string[]).includes(k) && existing) {
      const remote = (existing as Record<string, unknown>)[k];
      if (typeof remote === "number" && typeof v === "number" && remote > v) {
        // Server is ahead — keep server's value, don't downgrade.
        row[k] = remote;
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

// Debounce helper — many AsyncStorage writes can fire in a burst (e.g. inside
// a lesson). We coalesce them so the server only sees one upsert per ~1s.
let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPatch: ProgressPatch = {};

export function queueProgressPush(patch: ProgressPatch, delayMs = 1000): void {
  pendingPatch = { ...pendingPatch, ...patch };
  notifySync({ ...syncSnapshot, status: "pending", lastError: null });
  if (pendingTimer) clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => {
    const toSend = pendingPatch;
    pendingPatch = {};
    pendingTimer = null;
    pushServerProgress(toSend).catch((e) =>
      console.warn("[progressSync] queued push error:", e),
    );
  }, delayMs);
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
  pendingPatch = {};
  if (Object.keys(toSend).length === 0) return true;
  try {
    return await pushServerProgress(toSend);
  } catch (e) {
    console.warn("[progressSync] flush failed:", e);
    // Put it back so the next push attempt can retry.
    pendingPatch = { ...toSend, ...pendingPatch };
    return false;
  }
}
