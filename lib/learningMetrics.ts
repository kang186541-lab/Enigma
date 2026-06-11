// Remote learning-metrics sink (Supabase).
//
// Fire-and-forget mirror of the local learning-event log so D1/D7/D30
// retention and utterance counts can be computed server-side (institutional
// pilot). Rows land in public.linguaai_learning_events; RLS only lets
// authenticated users INSERT/SELECT their own rows, so signed-out sessions
// no-op by design.
//
// CONTRACT: nothing in this module may throw or block a caller.
// The supabase client is lazy-imported INSIDE the functions because
// lib/supabase throws at module load when its env vars are missing
// (jest/CI) — a top-level import would poison every module that
// transitively imports this one.

import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_PING_DATE_KEY = "@lingua_session_ping_date";
const EVENTS_TABLE = "linguaai_learning_events";

type SupabaseModule = typeof import("@/lib/supabase");

/** Lazy, non-throwing access to the supabase client. Returns null when the
 *  client cannot be constructed (missing env vars under jest/CI). */
async function getSupabase(): Promise<SupabaseModule["supabase"] | null> {
  try {
    const mod = await import("@/lib/supabase");
    return mod.supabase;
  } catch {
    // lib/supabase throws at module load without env vars. Silently no-op —
    // the local AsyncStorage event log remains the on-device source of truth.
    return null;
  }
}

/**
 * Best-effort insert of one learning event for the signed-in user.
 * Never throws, never blocks meaningfully, silently no-ops when there is no
 * auth session (RLS would reject the row anyway).
 */
export async function recordRemoteEvent(
  event: string,
  props?: Record<string, unknown>,
): Promise<void> {
  const supabase = await getSupabase();
  if (!supabase) return;

  try {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user?.id;
    if (!uid) return;

    const { error } = await supabase
      .from(EVENTS_TABLE)
      .insert({ user_id: uid, event, props: props ?? {} });
    if (error && __DEV__) {
      console.warn("[LearningMetrics] remote insert failed:", error.message);
    }
  } catch (err) {
    if (__DEV__) console.warn("[LearningMetrics] remote event failed:", err);
  }
}

/**
 * Records a `session_start` event at most once per UTC calendar day.
 * The last ping date (YYYY-MM-DD, UTC) is persisted in AsyncStorage so app
 * remounts within the same day cannot double-count. Never throws.
 */
export async function recordSessionStartOncePerDay(platformOS: string): Promise<void> {
  try {
    const todayUtc = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
    const lastPing = await AsyncStorage.getItem(SESSION_PING_DATE_KEY);
    if (lastPing === todayUtc) return;
    await recordRemoteEvent("session_start", { platform: platformOS });
    await AsyncStorage.setItem(SESSION_PING_DATE_KEY, todayUtc);
  } catch (err) {
    if (__DEV__) console.warn("[LearningMetrics] session ping failed:", err);
  }
}
