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
  last_session_at: string | null;
  native_lang: string | null;
  learning_lang: string | null;
  updated_at: string;
}

export interface ProgressPatch {
  xp?: number;
  level?: number;
  streak_days?: number;
  last_session_at?: string | null;
  native_lang?: string | null;
  learning_lang?: string | null;
}

const TABLE = "linguaai_user_progress";

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

// Upsert progress for the current user. Caller passes only the fields it knows
// — missing fields are left untouched on existing rows (server-side default
// values fill in for first inserts).
export async function pushServerProgress(patch: ProgressPatch): Promise<boolean> {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes?.user;
  if (!user) return false;

  // Strip undefined keys so the upsert payload is minimal.
  const row: Record<string, unknown> = { user_id: user.id };
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) row[k] = v;
  }

  const { error } = await supabase
    .from(TABLE)
    .upsert(row, { onConflict: "user_id" });

  if (error) {
    console.warn("[progressSync] push failed:", error.message);
    return false;
  }
  return true;
}

// Debounce helper — many AsyncStorage writes can fire in a burst (e.g. inside
// a lesson). We coalesce them so the server only sees one upsert per ~1s.
let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPatch: ProgressPatch = {};

export function queueProgressPush(patch: ProgressPatch, delayMs = 1000): void {
  pendingPatch = { ...pendingPatch, ...patch };
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

// Force-flush any pending queued push (e.g. on sign-out).
export async function flushProgressPush(): Promise<void> {
  if (!pendingTimer) return;
  clearTimeout(pendingTimer);
  pendingTimer = null;
  const toSend = pendingPatch;
  pendingPatch = {};
  await pushServerProgress(toSend);
}
