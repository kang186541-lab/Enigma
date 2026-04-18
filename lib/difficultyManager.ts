import AsyncStorage from "@react-native-async-storage/async-storage";

const PROFILE_KEY = "@lingua_difficulty_profile";
const OVERRIDE_KEY = "@lingua_difficulty_override";

export type SkillType = "listening" | "speaking" | "reading" | "writing";
export type DifficultyLevel = "easy" | "normal" | "hard";

export interface DifficultyProfile {
  listening: { correct: number; total: number };
  speaking:  { correct: number; total: number };
  reading:   { correct: number; total: number };
  writing:   { correct: number; total: number };
}

export interface DifficultySettings {
  level: DifficultyLevel;
  hintCount: number;        // max hints shown
  speechRate: number;       // TTS speed multiplier (0.7 = slow, 1.0 = normal, 1.2 = fast)
  showTranslation: boolean; // auto-show native translation
  timerEnabled: boolean;    // enable time pressure
}

const DEFAULT_PROFILE: DifficultyProfile = {
  listening: { correct: 0, total: 0 },
  speaking:  { correct: 0, total: 0 },
  reading:   { correct: 0, total: 0 },
  writing:   { correct: 0, total: 0 },
};

const SETTINGS_MAP: Record<DifficultyLevel, DifficultySettings> = {
  easy:   { level: "easy",   hintCount: 3, speechRate: 0.75, showTranslation: true,  timerEnabled: false },
  normal: { level: "normal", hintCount: 1, speechRate: 1.0,  showTranslation: false, timerEnabled: false },
  hard:   { level: "hard",   hintCount: 0, speechRate: 1.15, showTranslation: false, timerEnabled: true  },
};

/** Load difficulty profile from storage */
export async function loadDifficultyProfile(): Promise<DifficultyProfile> {
  try {
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
  } catch (e) {
    console.warn("[Difficulty] load failed:", e);
    return DEFAULT_PROFILE;
  }
}

/** Save difficulty profile */
async function saveProfile(profile: DifficultyProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn("[Difficulty] save failed:", e);
  }
}

/** Update accuracy for a skill */
export async function updateSkillAccuracy(
  skill: SkillType,
  correct: number,
  total: number
): Promise<void> {
  const profile = await loadDifficultyProfile();
  profile[skill].correct += correct;
  profile[skill].total += total;
  await saveProfile(profile);
}

/** Calculate accuracy for a skill (0-100) */
export function getAccuracy(profile: DifficultyProfile, skill: SkillType): number {
  const s = profile[skill];
  if (s.total === 0) return 50; // default to normal
  return Math.round((s.correct / s.total) * 100);
}

/** Calculate auto difficulty for a skill based on last N attempts */
export function calculateDifficulty(profile: DifficultyProfile, skill: SkillType): DifficultyLevel {
  const accuracy = getAccuracy(profile, skill);
  if (accuracy < 50) return "easy";
  if (accuracy > 85) return "hard";
  return "normal";
}

/** Get difficulty settings for a skill (respects manual override) */
export async function getDifficultySettings(skill: SkillType): Promise<DifficultySettings> {
  const override = await getOverride();
  if (override && override !== "auto") {
    return SETTINGS_MAP[override];
  }

  const profile = await loadDifficultyProfile();
  const level = calculateDifficulty(profile, skill);
  return SETTINGS_MAP[level];
}

/** Get/set manual difficulty override */
export async function getOverride(): Promise<"auto" | DifficultyLevel | null> {
  try {
    const val = await AsyncStorage.getItem(OVERRIDE_KEY);
    return val as any ?? "auto";
  } catch {
    return "auto";
  }
}

export async function setOverride(level: "auto" | DifficultyLevel): Promise<void> {
  try {
    await AsyncStorage.setItem(OVERRIDE_KEY, level);
  } catch (e) {
    console.warn("[Difficulty] setOverride failed:", e);
  }
}

/** Get emoji and label for difficulty level */
export function getDifficultyLabel(level: DifficultyLevel): {
  emoji: string;
  label: { ko: string; en: string; es: string };
  color: string;
} {
  switch (level) {
    case "easy":   return { emoji: "🌱", label: { ko: "쉬움", en: "Easy", es: "Facil" }, color: "#5a9" };
    case "normal": return { emoji: "⭐", label: { ko: "보통", en: "Normal", es: "Normal" }, color: "#c9a227" };
    case "hard":   return { emoji: "🔥", label: { ko: "어려움", en: "Hard", es: "Dificil" }, color: "#c44" };
  }
}
