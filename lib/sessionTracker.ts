import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_KEY = "@lingua_daily_sessions";
const MAX_DAYS = 90;

export interface SessionRecord {
  date: string;        // YYYY-MM-DD
  xpEarned: number;
  timeSpentMs: number;
  skillsUsed: string[]; // "listening" | "speaking" | "reading" | "writing" | "chat" | "npc"
}

interface DailyAggregate {
  date: string;
  totalXP: number;
  totalTimeMs: number;
  sessions: number;
  skills: Record<string, number>;
}

let _sessionStart: number | null = null;
let _sessionType: string | null = null;

/** Start a session timer */
export function startSession(type: string): void {
  _sessionStart = Date.now();
  _sessionType = type;
}

/** End the current session and record it */
export async function endSession(xpEarned: number = 0): Promise<void> {
  if (!_sessionStart || !_sessionType) return;

  const timeSpentMs = Date.now() - _sessionStart;
  const today = new Date().toISOString().slice(0, 10);

  await recordSession({
    date: today,
    xpEarned,
    timeSpentMs,
    skillsUsed: [_sessionType],
  });

  _sessionStart = null;
  _sessionType = null;
}

/** Record a completed session */
export async function recordSession(record: SessionRecord): Promise<void> {
  try {
    const data = await loadData();
    const existing = data.find((d) => d.date === record.date);

    if (existing) {
      existing.totalXP += record.xpEarned;
      existing.totalTimeMs += record.timeSpentMs;
      existing.sessions += 1;
      for (const skill of record.skillsUsed) {
        existing.skills[skill] = (existing.skills[skill] || 0) + 1;
      }
    } else {
      const skills: Record<string, number> = {};
      for (const s of record.skillsUsed) skills[s] = 1;
      data.push({
        date: record.date,
        totalXP: record.xpEarned,
        totalTimeMs: record.timeSpentMs,
        sessions: 1,
        skills,
      });
    }

    // Trim to MAX_DAYS
    data.sort((a, b) => b.date.localeCompare(a.date));
    const trimmed = data.slice(0, MAX_DAYS);

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn("[SessionTracker] record failed:", e);
  }
}

/** Get last 7 days of data */
export async function getWeeklySessions(): Promise<DailyAggregate[]> {
  const data = await loadData();
  const last7 = getLast7Days();
  return last7.map((date) => {
    const found = data.find((d) => d.date === date);
    return found || { date, totalXP: 0, totalTimeMs: 0, sessions: 0, skills: {} };
  });
}

/** Get current month's data for calendar */
export async function getMonthlySessions(): Promise<DailyAggregate[]> {
  const data = await loadData();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).toISOString().slice(0, 10);
  const lastDay = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  return data.filter((d) => d.date >= firstDay && d.date <= lastDay);
}

/** Get total stats summary */
export async function getStatsSummary(): Promise<{
  totalSessions: number;
  totalXP: number;
  totalTimeMs: number;
  skillBreakdown: Record<string, number>;
}> {
  const data = await loadData();
  let totalSessions = 0;
  let totalXP = 0;
  let totalTimeMs = 0;
  const skillBreakdown: Record<string, number> = {};

  for (const d of data) {
    totalSessions += d.sessions;
    totalXP += d.totalXP;
    totalTimeMs += d.totalTimeMs;
    for (const [skill, count] of Object.entries(d.skills)) {
      skillBreakdown[skill] = (skillBreakdown[skill] || 0) + count;
    }
  }

  return { totalSessions, totalXP, totalTimeMs, skillBreakdown };
}

// ── Helpers ──

async function loadData(): Promise<DailyAggregate[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("[SessionTracker] load failed:", e);
    return [];
  }
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}
