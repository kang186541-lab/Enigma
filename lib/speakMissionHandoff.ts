import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@lingua_speak_mission_handoffs_v1";
const MAX_HANDOFFS = 10;
const TTL_MS = 6 * 60 * 60 * 1000;

export type SpeakMissionTargetLanguage = "korean" | "english" | "spanish" | "indonesian";
export type SpeakMissionReturnDeck = "srs" | "beginner" | "advanced";

export interface SpeakMissionHandoff {
  id: string;
  phrase: string;
  meaning: string;
  speechLang: string;
  targetLanguage: SpeakMissionTargetLanguage;
  returnDeck: SpeakMissionReturnDeck;
  createdAt: string;
}

type HandoffMap = Record<string, SpeakMissionHandoff>;

function cleanText(value: string, maxLength: number): string {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function isFresh(item: SpeakMissionHandoff, now = Date.now()): boolean {
  const created = Date.parse(item.createdAt);
  return Number.isFinite(created) && now - created <= TTL_MS;
}

function normalizeTargetLanguage(value: string): SpeakMissionTargetLanguage {
  return value === "korean" || value === "spanish" || value === "indonesian" ? value : "english";
}

function normalizeReturnDeck(value: string): SpeakMissionReturnDeck {
  return value === "beginner" || value === "advanced" ? value : "srs";
}

async function readMap(): Promise<HandoffMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  const parsed = JSON.parse(raw) as HandoffMap;
  return parsed && typeof parsed === "object" ? parsed : {};
}

async function writeTrimmedMap(map: HandoffMap): Promise<void> {
  const freshItems = Object.values(map)
    .filter((item) => item?.id && isFresh(item))
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
    .slice(-MAX_HANDOFFS);
  const trimmed: HandoffMap = {};
  for (const item of freshItems) trimmed[item.id] = item;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export async function saveSpeakMissionHandoff(input: {
  phrase: string;
  meaning: string;
  speechLang: string;
  targetLanguage: string;
  returnDeck: string;
}): Promise<string> {
  const phrase = cleanText(input.phrase, 260);
  if (!phrase) throw new Error("Speak mission phrase is required");
  const now = new Date().toISOString();
  const id = `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const item: SpeakMissionHandoff = {
    id,
    phrase,
    meaning: cleanText(input.meaning || phrase, 260),
    speechLang: cleanText(input.speechLang || "en-US", 20),
    targetLanguage: normalizeTargetLanguage(input.targetLanguage),
    returnDeck: normalizeReturnDeck(input.returnDeck),
    createdAt: now,
  };
  const map = await readMap();
  await writeTrimmedMap({ ...map, [id]: item });
  return id;
}

export async function loadSpeakMissionHandoff(id: string | undefined): Promise<SpeakMissionHandoff | null> {
  const cleanId = cleanText(id ?? "", 80);
  if (!cleanId) return null;
  const map = await readMap();
  const item = map[cleanId] ?? null;
  if (!item || !isFresh(item)) {
    await writeTrimmedMap(map);
    return null;
  }
  await writeTrimmedMap(map);
  return item;
}
