import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIF_ENABLED_KEY = "@lingua_notif_enabled";
const NOTIF_TIME_KEY    = "@lingua_notif_time";

// ── Trilingual messages ──
const MESSAGES = {
  daily: {
    ko: "루디가 기다리고 있어요! 오늘 연습하러 갈까요?",
    en: "Rudy is waiting! Ready for today's practice?",
    es: "Rudy te espera! Listo para practicar hoy?",
  },
  streak: {
    ko: "스트릭이 끊어질 위험! 지금 5분만 연습하세요",
    en: "Your streak is at risk! Just 5 minutes of practice",
    es: "Tu racha esta en riesgo! Solo 5 minutos de practica",
  },
  srs: {
    ko: (n: number) => `복습 카드 ${n}장이 준비됐어요!`,
    en: (n: number) => `${n} review card${n > 1 ? "s" : ""} ready!`,
    es: (n: number) => `${n} tarjeta${n > 1 ? "s" : ""} de repaso lista${n > 1 ? "s" : ""}!`,
  },
};

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
  lang: "ko" | "en" | "es" = "ko"
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
export async function scheduleStreakWarning(lang: "ko" | "en" | "es" = "ko"): Promise<void> {
  if (Platform.OS === "web" || !Notifications) return;

  await Notifications.cancelScheduledNotificationAsync("streak-warning").catch((e) => console.warn('[Notif] cancel streak-warning failed:', e));

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
  lang: "ko" | "en" | "es" = "ko"
): Promise<void> {
  if (Platform.OS === "web" || !Notifications || dueCount <= 0) return;

  await Notifications.cancelScheduledNotificationAsync("srs-reminder").catch((e) => console.warn('[Notif] cancel srs-reminder failed:', e));

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
  await Notifications.cancelScheduledNotificationAsync("daily-reminder").catch((e) => console.warn('[Notif] cancel daily-reminder failed:', e));
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
