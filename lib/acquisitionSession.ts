export type AcquisitionSessionMix<T> = {
  known: T[];
  guessable: T[];
  fallback?: T[];
  count: number;
  keyOf: (item: T) => string;
  knownRatio?: number;
};

function pushUnique<T>(out: T[], seen: Set<string>, items: T[], keyOf: (item: T) => string, limit: number) {
  for (const item of items) {
    const key = keyOf(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= limit) return;
  }
}

export function buildAcquisitionSession<T>({
  known,
  guessable,
  fallback = [],
  count,
  keyOf,
  knownRatio = 0.8,
}: AcquisitionSessionMix<T>): T[] {
  if (count <= 0) return [];

  const targetCount = Math.max(0, count);
  const guessableTarget = Math.max(1, targetCount - Math.ceil(targetCount * knownRatio));
  const knownTarget = Math.max(0, targetCount - guessableTarget);
  const out: T[] = [];
  const seen = new Set<string>();

  pushUnique(out, seen, known, keyOf, knownTarget);

  const beforeGuessable = out.length;
  pushUnique(out, seen, guessable, keyOf, beforeGuessable + guessableTarget);

  if (out.length < targetCount) {
    pushUnique(out, seen, known, keyOf, targetCount);
  }
  if (out.length < targetCount) {
    pushUnique(out, seen, guessable, keyOf, targetCount);
  }
  if (out.length < targetCount) {
    pushUnique(out, seen, fallback, keyOf, targetCount);
  }

  return out.slice(0, targetCount);
}

export function mergeRecentFirst(current: string[], previous: string[], limit: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const word of [...current, ...previous]) {
    const clean = word.trim();
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    out.push(clean);
    if (out.length >= limit) break;
  }
  return out;
}
