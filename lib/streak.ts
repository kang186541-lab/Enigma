/**
 * Pure local-date / streak math shared by Home and any other surface that
 * needs to decide whether a saved streak is still "active" today.
 *
 * These helpers are intentionally storage-free (no AsyncStorage), which is why
 * they live here rather than in lib/progressStorage.ts. They operate purely on
 * the local-calendar `YYYY-MM-DD` strings produced by `localDateString`.
 */

/** Parse a local `YYYY-MM-DD` key into a local-midnight Date, or null. */
export function parseLocalHomeDate(key: string | null): Date | null {
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/** Whole-day difference between two dates, ignoring the time-of-day. */
export function dayDiff(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.round((b - a) / 86_400_000);
}

/**
 * The streak that should actually be shown: the saved value if the last
 * session was today or yesterday, otherwise 0 (the streak has lapsed).
 */
export function getActiveStreak(streak: number, lastSessionDate: string | null): number {
  const last = parseLocalHomeDate(lastSessionDate);
  if (!last) return 0;
  const daysSince = dayDiff(last, new Date());
  return daysSince <= 1 ? streak : 0;
}
