import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIF_ENABLED_KEY = "@lingua_notif_enabled";
const NOTIF_TIME_KEY    = "@lingua_notif_time";

// ── Trilingual messages ──
// Copy intentionally surfaces the "하루 10분" promise (뇌새김 frame) and
// the SRS "잊기 직전 다시 만난다" (forgetting curve) hook so the marketing
// promises shipped on the landing surface also appear in user-facing
// reminders.
const MESSAGES = {
  daily: {
    ko: "루디가 기다리고 있어요! 오늘도 10분만 같이 할까요?",
    en: "Rudy is waiting! Just 10 minutes with us today?",
    es: "Rudy te espera! ¿10 minutos juntos hoy?",
    id: "Rudy menunggu! Hari ini latihan 10 menit saja, yuk?",
  },
  streak: {
    ko: "스트릭이 끊어질 위험! 10분 연습으로 오늘도 지켜봐요",
    en: "Your streak is at risk — 10 minutes today keeps it alive",
    es: "Tu racha está en riesgo — 10 minutos hoy la mantienen viva",
    id: "Streak-mu hampir putus — latihan 10 menit hari ini menjaganya tetap hidup",
  },
  srs: {
    ko: (n: number) => `잊기 직전이에요. 복습 카드 ${n}장이 기다려요`,
    en: (n: number) => `Right before you forget — ${n} review card${n > 1 ? "s" : ""} ready`,
    es: (n: number) => `Justo antes de olvidar — ${n} tarjeta${n > 1 ? "s" : ""} de repaso lista${n > 1 ? "s" : ""}`,
    id: (n: number) => `Tepat sebelum lupa — ${n} kartu ulasan sudah siap`,
  },
};

type ReminderLang = "ko" | "en" | "es" | "id";

// ── Web: no-op stubs ──
if (Platform.OS === "web") {
  // Notifications not supported on web
}

let Notifications: any = null;
let Device: any = null;

if (Platform.OS !== "web") {
  try {
    Notifications = require("expo-notifications");
    Device = require("expo-device");
  } catch {
    console.warn("[Notifications] expo-notifications not available");
  }
}

/** Request notification permissions (mobile only) */
export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === "web" || !Notifications || !Device) return null;

  if (!Device.isDevice) {
    console.warn("[Notifications] Must use physical device");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await AsyncStorage.setItem("@lingua_push_token", token);
  return token;
}

/** Schedule daily reminder at user's preferred time */
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  lang: ReminderLang = "ko"
): Promise<void> {
  if (Platform.OS === "web" || !Notifications) return;

  // Cancel existing daily reminders
  await cancelDailyReminder();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: lang === "ko" ? "LinguaAI" : lang === "es" ? "LinguaAI" : "LinguaAI",
      body: MESSAGES.daily[lang],
      sound: true,
    },
    trigger: {
      type: "daily" as any,
      hour,
      minute,
      repeats: true,
    },
    identifier: "daily-reminder",
  });
}

/** Schedule streak warning for 8PM if user hasn't practiced */
export async function scheduleStreakWarning(lang: ReminderLang = "ko"): Promise<void> {
  if (Platform.OS === "web" || !Notifications) return;

  await Notifications.cancelScheduledNotificationAsync("streak-warning").catch((e: unknown) => console.warn('[Notif] cancel streak-warning failed:', e));

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔥",
      body: MESSAGES.streak[lang],
      sound: true,
    },
    trigger: {
      type: "daily" as any,
      hour: 20,
      minute: 0,
      repeats: true,
    },
    identifier: "streak-warning",
  });
}

/** Schedule SRS due card reminder */
export async function scheduleSrsReminder(
  dueCount: number,
  lang: ReminderLang = "ko"
): Promise<void> {
  if (Platform.OS === "web" || !Notifications || dueCount <= 0) return;

  await Notifications.cancelScheduledNotificationAsync("srs-reminder").catch((e: unknown) => console.warn('[Notif] cancel srs-reminder failed:', e));

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📚",
      body: MESSAGES.srs[lang](dueCount),
      sound: true,
    },
    trigger: {
      type: "timeInterval" as any,
      seconds: 3600, // 1 hour from now
    },
    identifier: "srs-reminder",
  });
}

/** Cancel daily reminder */
export async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS === "web" || !Notifications) return;
  await Notifications.cancelScheduledNotificationAsync("daily-reminder").catch((e: unknown) => console.warn('[Notif] cancel daily-reminder failed:', e));
}

/** Cancel all scheduled notifications */
export async function cancelAllReminders(): Promise<void> {
  if (Platform.OS === "web" || !Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Get/set notification preferences */
export async function getNotifEnabled(): Promise<boolean> {
  const val = await AsyncStorage.getItem(NOTIF_ENABLED_KEY);
  return val !== "false"; // default enabled
}

export async function setNotifEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(NOTIF_ENABLED_KEY, enabled ? "true" : "false");
  if (!enabled) await cancelAllReminders();
}

export async function getNotifTime(): Promise<{ hour: number; minute: number }> {
  const val = await AsyncStorage.getItem(NOTIF_TIME_KEY);
  if (val) {
    const [h, m] = val.split(":").map(Number);
    return { hour: h, minute: m };
  }
  return { hour: 9, minute: 0 }; // default 9:00 AM
}

export async function setNotifTime(hour: number, minute: number): Promise<void> {
  await AsyncStorage.setItem(NOTIF_TIME_KEY, `${hour}:${minute}`);
}

/** Setup notification handler (call in _layout.tsx) */
export function setupNotificationHandler(): void {
  if (Platform.OS === "web" || !Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
