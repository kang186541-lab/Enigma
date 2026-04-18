import AsyncStorage from "@react-native-async-storage/async-storage";
import { getIsOnline } from "./networkManager";

const QUEUE_KEY = "@lingua_offline_queue";

export interface QueuedAction {
  id: string;
  type: "xp_update" | "stats_sync" | "session_record";
  payload: Record<string, unknown>;
  createdAt: string;
}

async function loadQueue(): Promise<QueuedAction[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("[OfflineQueue] load failed:", e);
    return [];
  }
}

async function saveQueue(queue: QueuedAction[]): Promise<void> {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn("[OfflineQueue] save failed:", e);
  }
}

/** Add an action to the offline queue */
export async function queueAction(
  type: QueuedAction["type"],
  payload: Record<string, unknown>
): Promise<void> {
  const queue = await loadQueue();
  queue.push({
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
  });
  await saveQueue(queue);
}

/** Get the count of pending actions */
export async function getQueueSize(): Promise<number> {
  const queue = await loadQueue();
  return queue.length;
}

/** Flush all queued actions when back online. Returns count of flushed actions. */
export async function flushQueue(
  processor: (action: QueuedAction) => Promise<boolean>
): Promise<number> {
  if (!getIsOnline()) return 0;

  const queue = await loadQueue();
  if (queue.length === 0) return 0;

  const remaining: QueuedAction[] = [];
  let flushed = 0;

  for (const action of queue) {
    try {
      const success = await processor(action);
      if (success) {
        flushed++;
      } else {
        remaining.push(action);
      }
    } catch (e) {
      console.warn("[OfflineQueue] flush action failed:", e);
      remaining.push(action);
    }
  }

  await saveQueue(remaining);
  return flushed;
}

/** Clear all queued actions */
export async function clearQueue(): Promise<void> {
  await saveQueue([]);
}
