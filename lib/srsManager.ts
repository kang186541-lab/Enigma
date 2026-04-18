/**
 * Spaced Repetition System (SRS) Manager
 * Leitner-based interval scheduling for vocabulary retention.
 *
 * Box system:
 *   Box 1: Review after 1 day   (new/difficult items)
 *   Box 2: Review after 3 days  (partially learned)
 *   Box 3: Review after 7 days  (familiar)
 *   Box 4: Review after 14 days (well-known)
 *   Box 5: Review after 30 days (mastered)
 *
 * Correct answer → promote to next box
 * Wrong answer   → demote to Box 1
 */

const SRS_STORAGE_KEY = "@lingua_srs_data";

/** Interval per box (in days) */
const BOX_INTERVALS: Record<number, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

export interface SrsCard {
  /** The phrase in the target language */
  phrase: string;
  /** Translation in native language */
  meaning: string;
  /** Current Leitner box (1-5) */
  box: number;
  /** ISO date of last review */
  lastReview: string;
  /** ISO date of next scheduled review */
  nextReview: string;
  /** Number of times reviewed */
  reviewCount: number;
  /** Consecutive correct answers */
  streak: number;
  /** Which day/unit introduced this phrase */
  source: string;
}

export interface SrsData {
  cards: Record<string, SrsCard>; // keyed by phrase (lowercased)
  lastSessionDate: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function isBeforeOrEqual(a: string, b: string): boolean {
  return a <= b;
}

// ─── Core API ───────────────────────────────────────────────────────────────

/** Load SRS data from AsyncStorage */
export async function loadSrsData(): Promise<SrsData> {
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const raw = await AsyncStorage.getItem(SRS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn('[SRS] Failed to load SRS data:', e); }
  return { cards: {}, lastSessionDate: today() };
}

/** Save SRS data to AsyncStorage */
async function saveSrsData(data: SrsData): Promise<void> {
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    await AsyncStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("[SRS] save error:", err);
  }
}

/**
 * Add new phrases to the SRS system.
 * Skips phrases already in the system.
 */
export async function addPhrases(
  phrases: { phrase: string; meaning: string; source: string }[]
): Promise<void> {
  const data = await loadSrsData();
  const now = today();

  for (const { phrase, meaning, source } of phrases) {
    const key = phrase.toLowerCase().trim();
    if (data.cards[key]) continue; // already exists

    data.cards[key] = {
      phrase,
      meaning,
      box: 1,
      lastReview: now,
      nextReview: addDays(now, BOX_INTERVALS[1]),
      reviewCount: 0,
      streak: 0,
      source,
    };
  }

  await saveSrsData(data);
}

/**
 * Get all cards due for review today.
 * Returns cards sorted by box (lower box = higher priority).
 */
export async function getDueCards(limit: number = 10): Promise<SrsCard[]> {
  const data = await loadSrsData();
  const now = today();

  const due = Object.values(data.cards)
    .filter(card => isBeforeOrEqual(card.nextReview, now))
    .sort((a, b) => a.box - b.box || a.nextReview.localeCompare(b.nextReview));

  return due.slice(0, limit);
}

/**
 * Get count of cards due for review.
 */
export async function getDueCount(): Promise<number> {
  const data = await loadSrsData();
  const now = today();
  return Object.values(data.cards)
    .filter(card => isBeforeOrEqual(card.nextReview, now))
    .length;
}

/**
 * Record a review result.
 * correct=true  → promote to next box (max 5)
 * correct=false → demote to box 1
 */
export async function recordReview(
  phrase: string,
  correct: boolean
): Promise<SrsCard | null> {
  const data = await loadSrsData();
  const key = phrase.toLowerCase().trim();
  const card = data.cards[key];
  if (!card) return null;

  const now = today();
  card.reviewCount++;
  card.lastReview = now;

  if (correct) {
    card.streak++;
    card.box = Math.min(5, card.box + 1);
  } else {
    card.streak = 0;
    card.box = 1;
  }

  card.nextReview = addDays(now, BOX_INTERVALS[card.box]);
  await saveSrsData(data);
  return card;
}

/**
 * Get SRS statistics for display.
 */
export async function getSrsStats(): Promise<{
  totalCards: number;
  dueToday: number;
  mastered: number;   // box 5
  learning: number;   // box 1-2
  familiar: number;   // box 3-4
}> {
  const data = await loadSrsData();
  const now = today();
  const cards = Object.values(data.cards);

  return {
    totalCards: cards.length,
    dueToday: cards.filter(c => isBeforeOrEqual(c.nextReview, now)).length,
    mastered: cards.filter(c => c.box === 5).length,
    learning: cards.filter(c => c.box <= 2).length,
    familiar: cards.filter(c => c.box === 3 || c.box === 4).length,
  };
}

/**
 * Get all cards in a specific box.
 */
export async function getCardsByBox(box: number): Promise<SrsCard[]> {
  const data = await loadSrsData();
  return Object.values(data.cards).filter(c => c.box === box);
}

/**
 * Integrate with daily course: after completing a day's lesson,
 * add all new phrases from that day to the SRS system.
 */
export async function addDayPhrases(
  dayId: string,
  phrases: { text: string; meaning: string }[]
): Promise<number> {
  const toAdd = phrases.map(p => ({
    phrase: p.text,
    meaning: p.meaning,
    source: dayId,
  }));
  const dataBefore = await loadSrsData();
  const countBefore = Object.keys(dataBefore.cards).length;
  await addPhrases(toAdd);
  const dataAfter = await loadSrsData();
  return Object.keys(dataAfter.cards).length - countBefore;
}
