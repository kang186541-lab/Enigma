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
  Modal,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { C, F } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
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
import PaywallCard from "@/components/PaywallCard";

const T = {
  title:       { ko: "설정",          en: "Settings",           es: "Ajustes",            id: "Pengaturan" },
  membership:  { ko: "멤버십",        en: "Membership",         es: "Membresía",          id: "Keanggotaan" },
  accountTitle:{ ko: "계정",          en: "Account",            es: "Cuenta",             id: "Akun" },
  signInWithGoogle: { ko: "Google로 로그인", en: "Sign in with Google", es: "Iniciar sesión con Google", id: "Masuk dengan Google" },
  signedInAs:  { ko: "로그인됨",      en: "Signed in as",       es: "Sesión iniciada como", id: "Masuk sebagai" },
  signOut:     { ko: "로그아웃",       en: "Sign out",           es: "Cerrar sesión",      id: "Keluar" },
  signInBenefit: { ko: "로그인하면 진행 상황이 기기 간에 저장돼요", en: "Sign in to save progress across devices", es: "Inicia sesión para guardar tu progreso entre dispositivos", id: "Masuk supaya progresmu tersimpan di semua perangkat" },
  signInError: { ko: "로그인 실패",    en: "Sign-in failed",     es: "Error al iniciar sesión", id: "Gagal masuk" },
  emailLabel:  { ko: "이메일",        en: "Email",              es: "Correo",             id: "Email" },
  emailPlaceholder: { ko: "you@example.com", en: "you@example.com", es: "tu@ejemplo.com", id: "kamu@contoh.com" },
  emailSendLink: { ko: "이메일로 로그인 링크 받기", en: "Send me a magic link", es: "Enviarme un enlace mágico", id: "Kirimi aku tautan ajaib" },
  emailSent:   { ko: "메일을 확인해서 링크를 누르세요", en: "Check your email and click the link", es: "Revisa tu correo y haz clic en el enlace", id: "Cek emailmu dan klik tautannya" },
  divider:     { ko: "또는",          en: "or",                 es: "o",                  id: "atau" },
  notifTitle:  { ko: "알림",          en: "Notifications",      es: "Notificaciones",     id: "Notifikasi" },
  notifDaily:  { ko: "매일 학습 알림", en: "Daily reminder",     es: "Recordatorio diario", id: "Pengingat harian" },
  notifTime:   { ko: "알림 시간",      en: "Reminder time",      es: "Hora del recordatorio", id: "Waktu pengingat" },
  notifWeb:    { ko: "웹에서는 지원되지 않습니다", en: "Not supported on web", es: "No disponible en web", id: "Tidak tersedia di web" },
  general:     { ko: "일반",          en: "General",            es: "General",            id: "Umum" },
  language:    { ko: "학습 언어",      en: "Learning language",  es: "Idioma de estudio",  id: "Bahasa yang dipelajari" },
  difficulty:  { ko: "난이도",         en: "Difficulty",         es: "Dificultad",         id: "Tingkat kesulitan" },
  diffAuto:    { ko: "자동",          en: "Auto",               es: "Auto",               id: "Otomatis" },
  diffEasy:    { ko: "쉬움",          en: "Easy",               es: "Facil",              id: "Mudah" },
  diffNormal:  { ko: "보통",          en: "Normal",             es: "Normal",             id: "Normal" },
  diffHard:    { ko: "어려움",         en: "Hard",               es: "Dificil",            id: "Sulit" },
  display:     { ko: "화면",          en: "Display",            es: "Pantalla",           id: "Tampilan" },
  theme:       { ko: "테마",          en: "Theme",              es: "Tema",               id: "Tema" },
  themeDark:   { ko: "다크",          en: "Dark",               es: "Oscuro",             id: "Gelap" },
  themeLight:  { ko: "라이트",         en: "Light",              es: "Claro",              id: "Terang" },
  themeSystem: { ko: "시스템",         en: "System",             es: "Sistema",            id: "Sistem" },
  back:        { ko: "뒤로",          en: "Back",               es: "Volver",             id: "Kembali" },
  helpLink:    { ko: "도움말",         en: "Help",               es: "Ayuda",              id: "Bantuan" },
  // ── Privacy / Terms / My Data section
  legalTitle:  { ko: "개인정보 / 약관 / 내 데이터", en: "Privacy / Terms / My Data", es: "Privacidad / Términos / Mis datos", id: "Privasi / Ketentuan / Data Saya" },
  privacy:     { ko: "개인정보처리방침", en: "Privacy Policy",   es: "Política de Privacidad", id: "Kebijakan Privasi" },
  privacyDesc: { ko: "수집·이용·보관 안내", en: "What we collect and why", es: "Qué recopilamos y por qué", id: "Apa yang kami kumpulkan dan alasannya" },
  terms:       { ko: "이용약관",       en: "Terms of Service",  es: "Términos de Servicio", id: "Ketentuan Layanan" },
  termsDesc:   { ko: "서비스 이용 조건", en: "Service conditions",      es: "Condiciones del servicio", id: "Syarat penggunaan layanan" },
  myData:      { ko: "내 데이터",       en: "My Data",           es: "Mis datos",          id: "Data Saya" },
  myDataDesc:  { ko: "내려받기·삭제",   en: "Download / delete", es: "Descargar / eliminar", id: "Unduh / hapus" },
  // ── Class join (BETA)
  classTitle:  { ko: "수업",           en: "Class",             es: "Clase",              id: "Kelas" },
  classJoin:   { ko: "수업 코드 입력",  en: "Enter class code",  es: "Código de clase",    id: "Masukkan kode kelas" },
  classJoinDesc: { ko: "선생님께 받은 코드로 분반에 참여하세요", en: "Join your class with a code from your teacher", es: "Únete a tu clase con el código de tu profesor", id: "Gabung kelas dengan kode dari gurumu" },
  classJoined: { ko: "참여 중",        en: "Joined",            es: "Inscrito",           id: "Tergabung" },
  classCodePlaceholder: { ko: "예: ABC123", en: "e.g. ABC123",   es: "ej. ABC123",         id: "mis. ABC123" },
  classJoinCta: { ko: "참여하기",       en: "Join",              es: "Unirme",             id: "Gabung" },
  classJoinSuccess: { ko: "참여 완료!",  en: "Joined!",           es: "¡Listo!",            id: "Berhasil gabung!" },
  classInvalidCode: { ko: "코드를 확인해 주세요", en: "Please check the code", es: "Verifica el código", id: "Periksa kodenya" },
  classNeedLogin: { ko: "먼저 로그인해 주세요", en: "Please sign in first", es: "Inicia sesión primero", id: "Masuk dulu, ya" },
  classGenericError: { ko: "참여에 실패했어요. 잠시 후 다시 시도해 주세요", en: "Couldn't join — please try again later", es: "No se pudo unir; inténtalo más tarde", id: "Gagal bergabung — coba lagi nanti" },
  classClose:  { ko: "닫기",           en: "Close",             es: "Cerrar",             id: "Tutup" },
} as const;

// Stored cohort (class) name once the learner joins via code — read on mount
// so the settings row shows the joined state across launches.
const COHORT_NAME_KEY = "@lingua_cohort_name";

type LangKey = "ko" | "en" | "es" | "id";
function t(obj: Record<string, string>, lang: LangKey) {
  return obj[lang] || obj.en;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { nativeLanguage: nativeLang } = useLanguage();
  const lc: LangKey = nativeLang === "korean" ? "ko" : nativeLang === "spanish" ? "es" : nativeLang === "indonesian" ? "id" : "en";
  const notifLc: "ko" | "en" | "es" | "id" = lc;

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

  // ── Class join (BETA) state ──
  const [cohortName, setCohortName] = useState<string | null>(null);
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [classCodeInput, setClassCodeInput] = useState("");
  const [classBusy, setClassBusy] = useState(false);
  const [classError, setClassError] = useState<string | null>(null);
  const [classJustJoined, setClassJustJoined] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(COHORT_NAME_KEY)
      .then((v) => { if (v) setCohortName(v); })
      .catch(() => {});
  }, []);

  const openClassModal = () => {
    setClassError(null);
    setClassJustJoined(false);
    setClassCodeInput("");
    setClassModalOpen(true);
  };

  const handleJoinClass = async () => {
    const code = classCodeInput.trim();
    if (!code || classBusy) return;
    if (!user) {
      // Signed out — never call the RPC, just surface the login-required copy.
      setClassError(t(T.classNeedLogin, lc));
      return;
    }
    setClassBusy(true);
    setClassError(null);
    try {
      const { data, error } = await supabase.rpc("join_cohort", { code });
      if (error) {
        const msg = error.message ?? "";
        if (msg.includes("INVALID_CODE")) setClassError(t(T.classInvalidCode, lc));
        else if (msg.includes("NOT_AUTHENTICATED")) setClassError(t(T.classNeedLogin, lc));
        else setClassError(t(T.classGenericError, lc));
      } else {
        // RPC returns the class name as a string.
        const name =
          typeof data === "string" && data.trim()
            ? data.trim()
            : data != null && typeof (data as any).name === "string"
              ? String((data as any).name)
              : "";
        if (name) {
          setCohortName(name);
          try { await AsyncStorage.setItem(COHORT_NAME_KEY, name); }
          catch (e) { console.warn("[Settings] cohort name persist failed:", e); }
        }
        setClassJustJoined(true);
        setClassCodeInput("");
      }
    } catch (e) {
      console.warn("[Settings] join_cohort failed:", e);
      setClassError(t(T.classGenericError, lc));
    } finally {
      setClassBusy(false);
    }
  };

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
          : lc === "id" ? "Sedang offline, jadi progres belum bisa disinkronkan. Coba lagi setelah tersambung."
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
      await scheduleDailyReminder(notifHour, notifMinute, notifLc);
    }
  };

  const handleTimeChange = async (hour: number) => {
    setNotifHour(hour);
    await setNotifTime(hour, 0);
    if (notifOn) {
      await scheduleDailyReminder(hour, 0, notifLc);
    }
  };

  return (
    <LinearGradient colors={[C.bg1, C.bg2]} style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="link"
          accessibilityLabel={t(T.back, lc)}
        >
          <Ionicons name="arrow-back" size={22} color={C.gold} />
          <Text style={styles.backText}>{t(T.back, lc)}</Text>
        </Pressable>
        <Text style={styles.title}>{t(T.title, lc)}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* ── Membership / Pro upgrade ── */}
        <Text style={[styles.sectionTitle, { marginTop: 0 }]}>{t(T.membership, lc)}</Text>
        <PaywallCard />

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
                  accessibilityRole="button"
                  accessibilityLabel={t(T.signOut, lc)}
                  accessibilityState={{ disabled: signInBusy }}
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
                accessibilityRole="button"
                accessibilityLabel={t(T.emailSendLink, lc)}
                accessibilityState={{ disabled: signInBusy || authLoading || !emailInput.trim() }}
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
                accessibilityRole="button"
                accessibilityLabel={t(T.signInWithGoogle, lc)}
                accessibilityState={{ disabled: signInBusy || authLoading }}
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

        {/* ── Class join (BETA) ── */}
        <Text style={styles.sectionTitle}>{t(T.classTitle, lc)}</Text>
        <View style={styles.card}>
          <Pressable
            onPress={openClassModal}
            style={styles.row}
            accessibilityRole="button"
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={styles.label}>{t(T.classJoin, lc)}</Text>
                <View style={styles.betaBadge}>
                  <Text style={styles.betaBadgeText}>BETA</Text>
                </View>
              </View>
              <Text style={[styles.webNote, { textAlign: "left", paddingVertical: 0, marginTop: 2 }]}>
                {cohortName
                  ? `${t(T.classJoined, lc)}: ${cohortName}`
                  : t(T.classJoinDesc, lc)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.gold} />
          </Pressable>
        </View>

        {/* ── Privacy / Terms / My Data ── */}
        <Text style={styles.sectionTitle}>{t(T.legalTitle, lc)}</Text>
        <View style={styles.card}>
          <Pressable
            onPress={() => router.push("/legal/privacy" as any)}
            style={styles.row}
            accessibilityRole="link"
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t(T.privacy, lc)}</Text>
              <Text style={[styles.webNote, { textAlign: "left", paddingVertical: 0, marginTop: 2 }]}>
                {t(T.privacyDesc, lc)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.gold} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/legal/terms" as any)}
            style={styles.row}
            accessibilityRole="link"
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t(T.terms, lc)}</Text>
              <Text style={[styles.webNote, { textAlign: "left", paddingVertical: 0, marginTop: 2 }]}>
                {t(T.termsDesc, lc)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.gold} />
          </Pressable>
          <Pressable
            onPress={() => router.push("/legal/data-rights" as any)}
            style={styles.row}
            accessibilityRole="link"
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{t(T.myData, lc)}</Text>
              <Text style={[styles.webNote, { textAlign: "left", paddingVertical: 0, marginTop: 2 }]}>
                {t(T.myDataDesc, lc)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.gold} />
          </Pressable>
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
                        accessibilityRole="button"
                        accessibilityLabel={`${h.toString().padStart(2, "0")}:00`}
                        accessibilityState={{ selected: h === notifHour }}
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
                  <Pressable
                    key={d}
                    style={[styles.pill, d === "auto" && styles.pillActive]}
                    accessibilityRole="button"
                    accessibilityLabel={t(labelMap[d], lc)}
                    accessibilityState={{ selected: d === "auto" }}
                  >
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
                  <Pressable
                    key={th}
                    style={[styles.pill, th === themeMode && styles.pillActive]}
                    onPress={() => setThemeMode(th)}
                    accessibilityRole="button"
                    accessibilityLabel={t(labelMap[th], lc)}
                    accessibilityState={{ selected: th === themeMode }}
                  >
                    <Text style={[styles.pillText, th === themeMode && styles.pillTextActive]}>
                      {t(labelMap[th], lc)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/support" as any)}
            style={styles.row}
            accessibilityRole="link"
          >
            <Text style={styles.label}>{t(T.helpLink, lc)}</Text>
            <Ionicons name="chevron-forward" size={18} color={C.gold} />
          </Pressable>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* ── Class code modal (BETA) ── */}
      <Modal
        visible={classModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setClassModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t(T.classJoin, lc)}</Text>

            {!user ? (
              // Signed out — show login-required message, never call the RPC.
              <Text style={[styles.webNote, { color: "#F2697D" }]}>
                {t(T.classNeedLogin, lc)}
              </Text>
            ) : classJustJoined ? (
              <>
                <Text style={[styles.webNote, { color: C.gold }]}>
                  {t(T.classJoinSuccess, lc)}
                </Text>
                {cohortName ? (
                  <Text style={[styles.label, { textAlign: "center" }]}>
                    {t(T.classJoined, lc)}: {cohortName}
                  </Text>
                ) : null}
              </>
            ) : (
              <>
                {cohortName ? (
                  <Text style={[styles.webNote, { paddingVertical: 0, marginBottom: 4 }]}>
                    {t(T.classJoined, lc)}: {cohortName}
                  </Text>
                ) : null}
                <TextInput
                  value={classCodeInput}
                  onChangeText={setClassCodeInput}
                  placeholder={t(T.classCodePlaceholder, lc)}
                  placeholderTextColor={C.goldDim}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  style={styles.emailInput}
                  editable={!classBusy}
                />
                <Pressable
                  onPress={handleJoinClass}
                  disabled={classBusy || !classCodeInput.trim()}
                  style={[
                    styles.emailBtn,
                    { marginTop: 10, opacity: classBusy || !classCodeInput.trim() ? 0.5 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t(T.classJoinCta, lc)}
                  accessibilityState={{ disabled: classBusy || !classCodeInput.trim() }}
                >
                  {classBusy ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.googleBtnText}>{t(T.classJoinCta, lc)}</Text>
                  )}
                </Pressable>
                {classError ? (
                  <Text style={[styles.webNote, { color: "#F2697D", paddingVertical: 0, marginTop: 8 }]}>
                    {classError}
                  </Text>
                ) : null}
              </>
            )}

            <Pressable
              onPress={() => setClassModalOpen(false)}
              style={styles.modalCloseBtn}
              accessibilityRole="button"
              accessibilityLabel={t(T.classClose, lc)}
            >
              <Text style={styles.modalCloseText}>{t(T.classClose, lc)}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  betaBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.goldDim,
    backgroundColor: C.goldFaint,
  },
  betaBadgeText: {
    fontFamily: F.bodySemi,
    fontSize: 10,
    color: C.goldDim,
    letterSpacing: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: C.bg2,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.goldDim,
    padding: 22,
    gap: 10,
  },
  modalTitle: {
    fontFamily: F.header,
    fontSize: 18,
    color: C.gold,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modalCloseBtn: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  modalCloseText: {
    fontFamily: F.bodySemi,
    fontSize: 14,
    color: C.goldDim,
    textDecorationLine: "underline",
  },
});
