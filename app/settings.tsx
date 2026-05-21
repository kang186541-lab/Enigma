import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import {
  getNotifEnabled,
  setNotifEnabled,
  getNotifTime,
  setNotifTime,
  scheduleDailyReminder,
  registerForPushNotifications,
} from "@/lib/notificationManager";

const T = {
  title:       { ko: "설정",          en: "Settings",           es: "Ajustes" },
  accountTitle:{ ko: "계정",          en: "Account",            es: "Cuenta" },
  signInWithGoogle: { ko: "Google로 로그인", en: "Sign in with Google", es: "Iniciar sesión con Google" },
  signedInAs:  { ko: "로그인됨",      en: "Signed in as",       es: "Sesión iniciada como" },
  signOut:     { ko: "로그아웃",       en: "Sign out",           es: "Cerrar sesión" },
  signInBenefit: { ko: "로그인하면 진행 상황이 기기 간에 저장돼요", en: "Sign in to save progress across devices", es: "Inicia sesión para guardar tu progreso entre dispositivos" },
  signInError: { ko: "로그인 실패",    en: "Sign-in failed",     es: "Error al iniciar sesión" },
  emailLabel:  { ko: "이메일",        en: "Email",              es: "Correo" },
  emailPlaceholder: { ko: "you@example.com", en: "you@example.com", es: "tu@ejemplo.com" },
  emailSendLink: { ko: "이메일로 로그인 링크 받기", en: "Send me a magic link", es: "Enviarme un enlace mágico" },
  emailSent:   { ko: "메일을 확인해서 링크를 누르세요", en: "Check your email and click the link", es: "Revisa tu correo y haz clic en el enlace" },
  divider:     { ko: "또는",          en: "or",                 es: "o" },
  notifTitle:  { ko: "알림",          en: "Notifications",      es: "Notificaciones" },
  notifDaily:  { ko: "매일 학습 알림", en: "Daily reminder",     es: "Recordatorio diario" },
  notifTime:   { ko: "알림 시간",      en: "Reminder time",      es: "Hora del recordatorio" },
  notifWeb:    { ko: "웹에서는 지원되지 않습니다", en: "Not supported on web", es: "No disponible en web" },
  general:     { ko: "일반",          en: "General",            es: "General" },
  language:    { ko: "학습 언어",      en: "Learning language",  es: "Idioma de estudio" },
  difficulty:  { ko: "난이도",         en: "Difficulty",         es: "Dificultad" },
  diffAuto:    { ko: "자동",          en: "Auto",               es: "Auto" },
  diffEasy:    { ko: "쉬움",          en: "Easy",               es: "Facil" },
  diffNormal:  { ko: "보통",          en: "Normal",             es: "Normal" },
  diffHard:    { ko: "어려움",         en: "Hard",               es: "Dificil" },
  display:     { ko: "화면",          en: "Display",            es: "Pantalla" },
  theme:       { ko: "테마",          en: "Theme",              es: "Tema" },
  themeDark:   { ko: "다크",          en: "Dark",               es: "Oscuro" },
  themeLight:  { ko: "라이트",         en: "Light",              es: "Claro" },
  themeSystem: { ko: "시스템",         en: "System",             es: "Sistema" },
  back:        { ko: "뒤로",          en: "Back",               es: "Volver" },
} as const;

type LangKey = "ko" | "en" | "es";
function t(obj: Record<string, string>, lang: LangKey) {
  return obj[lang] || obj.en;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { nativeLanguage: nativeLang } = useLanguage();
  const lc: LangKey = nativeLang === "korean" ? "ko" : nativeLang === "spanish" ? "es" : "en";

  const [notifOn, setNotifOn] = useState(true);
  const [notifHour, setNotifHour] = useState(9);
  const [notifMinute, setNotifMinute] = useState(0);
  const isWeb = Platform.OS === "web";
  const { mode: themeMode, setMode: setThemeMode } = useTheme();
  const { user, signInWithGoogle, signInWithEmail, signOut, loading: authLoading } = useAuth();
  const [signInBusy, setSignInBusy] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSignIn = async () => {
    setSignInBusy(true);
    setSignInError(null);
    const { error } = await signInWithGoogle();
    if (error) setSignInError(error);
    setSignInBusy(false);
  };

  const handleEmailSignIn = async () => {
    setSignInBusy(true);
    setSignInError(null);
    setEmailSent(false);
    const { error } = await signInWithEmail(emailInput);
    if (error) {
      setSignInError(error);
    } else {
      setEmailSent(true);
    }
    setSignInBusy(false);
  };

  const handleSignOut = async () => {
    setSignInBusy(true);
    setSignInError(null);
    try {
      await signOut();
    } catch (e) {
      // signOut throws FLUSH_FAILED when offline / server unavailable so
      // we don't wipe local data the user hasn't synced yet.
      const msg = (e as Error)?.message === "FLUSH_FAILED"
        ? (lc === "ko" ? "오프라인이라 진행 상황 동기화에 실패했어요. 연결 후 다시 시도해 주세요."
          : lc === "es" ? "Sin conexión, no se pudo sincronizar tu progreso. Intenta de nuevo cuando estés en línea."
          : "Offline — couldn't sync progress. Try again when you're online.")
        : ((e as Error)?.message ?? "Sign-out failed");
      setSignInError(msg);
    } finally {
      setSignInBusy(false);
    }
  };

  useEffect(() => {
    (async () => {
      const enabled = await getNotifEnabled();
      const time = await getNotifTime();
      setNotifOn(enabled);
      setNotifHour(time.hour);
      setNotifMinute(time.minute);
    })();
  }, []);

  const handleNotifToggle = async (val: boolean) => {
    setNotifOn(val);
    await setNotifEnabled(val);
    if (val) {
      await registerForPushNotifications();
      await scheduleDailyReminder(notifHour, notifMinute, lc);
    }
  };

  const handleTimeChange = async (hour: number) => {
    setNotifHour(hour);
    await setNotifTime(hour, 0);
    if (notifOn) {
      await scheduleDailyReminder(hour, 0, lc);
    }
  };

  return (
    <LinearGradient colors={[C.bg1, C.bg2]} style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.gold} />
          <Text style={styles.backText}>{t(T.back, lc)}</Text>
        </Pressable>
        <Text style={styles.title}>{t(T.title, lc)}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ── Account / Sign in ── */}
        <Text style={styles.sectionTitle}>{t(T.accountTitle, lc)}</Text>
        <View style={styles.card}>
          {user ? (
            <>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t(T.signedInAs, lc)}</Text>
                  <Text style={[styles.label, { color: C.gold, fontFamily: F.header, marginTop: 4 }]} numberOfLines={1}>
                    {user.email ?? user.user_metadata?.name ?? user.id}
                  </Text>
                </View>
                <Pressable
                  onPress={handleSignOut}
                  disabled={signInBusy}
                  style={[styles.pill, { opacity: signInBusy ? 0.5 : 1 }]}
                >
                  <Text style={styles.pillText}>{t(T.signOut, lc)}</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.label, { marginBottom: 12 }]}>{t(T.signInBenefit, lc)}</Text>

              {/* Email magic-link — works without any provider setup */}
              <Text style={[styles.label, { marginBottom: 6 }]}>{t(T.emailLabel, lc)}</Text>
              <TextInput
                value={emailInput}
                onChangeText={setEmailInput}
                placeholder={t(T.emailPlaceholder, lc)}
                placeholderTextColor={C.goldDim}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.emailInput}
                editable={!signInBusy}
              />
              <Pressable
                onPress={handleEmailSignIn}
                disabled={signInBusy || authLoading || !emailInput.trim()}
                style={[styles.emailBtn, { opacity: (signInBusy || authLoading || !emailInput.trim()) ? 0.5 : 1, marginTop: 8 }]}
              >
                <Ionicons name="mail-outline" size={18} color="#FFFFFF" />
                <Text style={styles.googleBtnText}>{t(T.emailSendLink, lc)}</Text>
              </Pressable>
              {emailSent ? (
                <Text style={[styles.webNote, { color: C.gold, marginTop: 8 }]}>
                  {t(T.emailSent, lc)}
                </Text>
              ) : null}

              {/* Divider */}
              <Text style={[styles.webNote, { marginVertical: 10, color: C.goldDim }]}>
                — {t(T.divider, lc)} —
              </Text>

              <Pressable
                onPress={handleSignIn}
                disabled={signInBusy || authLoading}
                style={[styles.googleBtn, { opacity: signInBusy || authLoading ? 0.5 : 1 }]}
              >
                <Ionicons name="logo-google" size={18} color="#FFFFFF" />
                <Text style={styles.googleBtnText}>
                  {t(T.signInWithGoogle, lc)}
                </Text>
              </Pressable>
              {signInError ? (
                <Text style={[styles.webNote, { color: "#F2697D", marginTop: 8 }]}>
                  {t(T.signInError, lc)}: {signInError}
                </Text>
              ) : null}
            </>
          )}
        </View>

        {/* ── Notifications ── */}
        <Text style={styles.sectionTitle}>{t(T.notifTitle, lc)}</Text>
        <View style={styles.card}>
          {isWeb ? (
            <Text style={styles.webNote}>{t(T.notifWeb, lc)}</Text>
          ) : (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>{t(T.notifDaily, lc)}</Text>
                <Switch
                  value={notifOn}
                  onValueChange={handleNotifToggle}
                  trackColor={{ false: C.bg3, true: C.goldDim }}
                  thumbColor={notifOn ? C.gold : C.parchmentDeep}
                />
              </View>
              {notifOn && (
                <View style={styles.timeRow}>
                  <Text style={styles.label}>{t(T.notifTime, lc)}</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.timePicker}
                  >
                    {HOURS.map((h) => (
                      <Pressable
                        key={h}
                        onPress={() => handleTimeChange(h)}
                        style={[
                          styles.timePill,
                          h === notifHour && styles.timePillActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.timePillText,
                            h === notifHour && styles.timePillTextActive,
                          ]}
                        >
                          {h.toString().padStart(2, "0")}:00
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
          )}
        </View>

        {/* ── Difficulty (placeholder for Feature 6) ── */}
        <Text style={styles.sectionTitle}>{t(T.general, lc)}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>{t(T.difficulty, lc)}</Text>
            <View style={styles.pillRow}>
              {(["auto", "easy", "normal", "hard"] as const).map((d) => {
                const labelMap = {
                  auto: T.diffAuto,
                  easy: T.diffEasy,
                  normal: T.diffNormal,
                  hard: T.diffHard,
                };
                return (
                  <Pressable key={d} style={[styles.pill, d === "auto" && styles.pillActive]}>
                    <Text style={[styles.pillText, d === "auto" && styles.pillTextActive]}>
                      {t(labelMap[d], lc)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* ── Display (placeholder for Feature 11) ── */}
        <Text style={styles.sectionTitle}>{t(T.display, lc)}</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>{t(T.theme, lc)}</Text>
            <View style={styles.pillRow}>
              {(["dark", "light", "system"] as const).map((th) => {
                const labelMap = {
                  dark: T.themeDark,
                  light: T.themeLight,
                  system: T.themeSystem,
                };
                return (
                  <Pressable key={th} style={[styles.pill, th === themeMode && styles.pillActive]} onPress={() => setThemeMode(th)}>
                    <Text style={[styles.pillText, th === themeMode && styles.pillTextActive]}>
                      {t(labelMap[th], lc)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: 60,
  },
  backText: {
    fontFamily: F.body,
    fontSize: 15,
    color: C.gold,
  },
  title: {
    fontFamily: F.header,
    fontSize: 20,
    color: C.gold,
    letterSpacing: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontFamily: F.header,
    fontSize: 14,
    color: C.goldDim,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 20,
  },
  card: {
    backgroundColor: C.bg3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontFamily: F.body,
    fontSize: 16,
    color: C.parchment,
  },
  webNote: {
    fontFamily: F.body,
    fontSize: 14,
    color: C.goldDim,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#4285F4",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3367D6",
  },
  emailBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: C.gold,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.goldDim,
  },
  emailInput: {
    fontFamily: F.body,
    fontSize: 15,
    color: C.parchment,
    backgroundColor: C.bg3,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.goldDim,
  },
  googleBtnText: {
    fontFamily: F.header,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  timeRow: {
    gap: 8,
  },
  timePicker: {
    gap: 6,
    paddingVertical: 4,
  },
  timePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.bg2,
    borderWidth: 1,
    borderColor: C.border,
  },
  timePillActive: {
    backgroundColor: C.gold,
    borderColor: C.gold,
  },
  timePillText: {
    fontFamily: F.bodySemi,
    fontSize: 13,
    color: C.goldDim,
  },
  timePillTextActive: {
    color: C.bg1,
  },
  pillRow: {
    flexDirection: "row",
    gap: 6,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: C.bg2,
    borderWidth: 1,
    borderColor: C.border,
  },
  pillActive: {
    backgroundColor: C.gold,
    borderColor: C.gold,
  },
  pillText: {
    fontFamily: F.bodySemi,
    fontSize: 13,
    color: C.goldDim,
  },
  pillTextActive: {
    color: C.bg1,
  },
});
