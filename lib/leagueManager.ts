import AsyncStorage from "@react-native-async-storage/async-storage";

const WEEKLY_XP_KEY = "@lingua_weekly_xp";
const LEAGUE_WEEK_KEY = "@lingua_league_week";

export type LeagueTier = "bronze" | "silver" | "gold";

export interface LeagueEntry {
  name: string;
  xp: number;
  isUser: boolean;
  tier: LeagueTier;
}

const COMPETITOR_NAMES = [
  "Luna_Star", "DragonFox", "LangNinja", "MisoSoup", "CocoLatte",
  "PixelWolf", "SakuraWind", "ThunderBee", "OceanMist", "GoldenOwl",
  "NeonTiger", "VelvetRain", "CrystalBear", "IronPanda", "SilkMoth",
  "EmberHawk", "FrostLion", "JadeRabbit", "StormEagle", "CloudFish",
];

/** Get the current ISO week number */
function getWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
}

/** Get league tier from weekly XP */
export function getLeagueTier(weeklyXP: number): LeagueTier {
  if (weeklyXP >= 500) return "gold";
  if (weeklyXP >= 200) return "silver";
  return "bronze";
}

/** Get league tier display info */
export function getTierInfo(tier: LeagueTier): {
  emoji: string;
  name: { ko: string; en: string; es: string };
  color: string;
} {
  switch (tier) {
    case "gold":   return { emoji: "🥇", name: { ko: "골드", en: "Gold", es: "Oro" },     color: "#FFD700" };
    case "silver": return { emoji: "🥈", name: { ko: "실버", en: "Silver", es: "Plata" }, color: "#C0C0C0" };
    case "bronze": return { emoji: "🥉", name: { ko: "브론즈", en: "Bronze", es: "Bronce" }, color: "#CD7F32" };
  }
}

/** Add XP to weekly tracker */
export async function addWeeklyXP(amount: number): Promise<void> {
  try {
    const currentWeek = getWeekNumber();
    const savedWeek = await AsyncStorage.getItem(LEAGUE_WEEK_KEY);
    const savedXP = await AsyncStorage.getItem(WEEKLY_XP_KEY);

    let weeklyXP = 0;
    if (savedWeek === String(currentWeek) && savedXP) {
      weeklyXP = parseInt(savedXP, 10);
    }
    // Reset if new week
    weeklyXP += amount;

    await AsyncStorage.setItem(LEAGUE_WEEK_KEY, String(currentWeek));
    await AsyncStorage.setItem(WEEKLY_XP_KEY, String(weeklyXP));
  } catch (e) {
    console.warn("[League] addWeeklyXP failed:", e);
  }
}

/** Get current weekly XP */
export async function getWeeklyXP(): Promise<number> {
  try {
    const currentWeek = getWeekNumber();
    const savedWeek = await AsyncStorage.getItem(LEAGUE_WEEK_KEY);
    if (savedWeek !== String(currentWeek)) return 0;
    const savedXP = await AsyncStorage.getItem(WEEKLY_XP_KEY);
    return savedXP ? parseInt(savedXP, 10) : 0;
  } catch {
    return 0;
  }
}

/** Generate competitor leaderboard around the user's XP */
export function generateLeaderboard(
  userXP: number,
  userName: string = "You"
): LeagueEntry[] {
  // Seed RNG based on week for consistency
  const week = getWeekNumber();
  const seed = week * 31337;

  const entries: LeagueEntry[] = [];

  // Generate 14 competitors clustered around user's XP
  const shuffled = [...COMPETITOR_NAMES].sort(() => pseudoRandom(seed) - 0.5);
  const selected = shuffled.slice(0, 14);

  for (let i = 0; i < selected.length; i++) {
    // Distribute XP: some above, some below user
    const variance = (pseudoRandom(seed + i * 7) - 0.4) * userXP * 1.5;
    const competitorXP = Math.max(5, Math.round(userXP + variance));
    entries.push({
      name: selected[i],
      xp: competitorXP,
      isUser: false,
      tier: getLeagueTier(competitorXP),
    });
  }

  // Add user
  entries.push({
    name: userName,
    xp: userXP,
    isUser: true,
    tier: getLeagueTier(userXP),
  });

  // Sort by XP descending
  entries.sort((a, b) => b.xp - a.xp);
  return entries;
}

/** Simple seeded pseudo-random */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
