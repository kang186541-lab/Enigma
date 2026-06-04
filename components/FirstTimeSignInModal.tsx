// One-shot sign-in modal (option 4 in the auth-rollout plan).
//
// Existing users — those who finished onboarding before we shipped Supabase
// auth — never saw onboarding's step 3. They were told "we're fixing the
// data-loss bug" and we owe them an explicit delivery moment. This modal is
// that delivery: opens once on next app launch, never reappears.
//
// Show conditions:
//   - signed out
//   - hasOnboarded (so brand-new installs hit onboarding's step 3 instead)
//   - modal has not been marked seen
//
// Skipping or any auth attempt marks it seen. After that the smart banner
// takes over as a quieter reminder.

import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal, TextInput, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { C, F } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, toNativeLearning } from "@/context/LanguageContext";
import { getHeroCopy } from "@/lib/heroCopy";

const SEEN_KEY = "@lingua_signin_modal_seen_v1";

type LangKey = "korean" | "english" | "spanish" | "indonesian";

const COPY: Record<LangKey, {
  title: string;
  body: (xp: number, streak: number) => string;
  google: string;
  emailLabel: string;
  emailPlaceholder: string;
  emailCta: string;
  emailSent: string;
  skip: string;
  errorPrefix: string;
  or: string;
}> = {
  korean: {
    title: "약속드린 진도 저장 기능, 도착했어요 🦊",
    body: (xp, streak) =>
      `지금 ${xp} XP · ${streak}일 연속 학습 상태예요. 폰을 바꾸거나 앱을 재설치해도 그대로 이어가려면 한 번만 로그인해 주세요.`,
    google: "Google로 로그인",
    emailLabel: "이메일",
    emailPlaceholder: "you@example.com",
    emailCta: "이메일로 로그인 링크 받기",
    emailSent: "메일을 확인해서 링크를 누르세요",
    skip: "나중에 할게요",
    errorPrefix: "오류",
    or: "또는",
  },
  english: {
    title: "Your save-progress fix is here 🦊",
    body: (xp, streak) =>
      `You have ${xp} XP and a ${streak}-day streak. Sign in once so they survive a phone swap or reinstall.`,
    google: "Sign in with Google",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    emailCta: "Send me a magic link",
    emailSent: "Check your email and click the link",
    skip: "Maybe later",
    errorPrefix: "Error",
    or: "or",
  },
  spanish: {
    title: "Llegó la función para guardar tu progreso 🦊",
    body: (xp, streak) =>
      `Tienes ${xp} XP y una racha de ${streak} días. Inicia sesión una vez para que sobrevivan a un cambio de teléfono o reinstalación.`,
    google: "Iniciar sesión con Google",
    emailLabel: "Correo",
    emailPlaceholder: "tu@ejemplo.com",
    emailCta: "Enviarme un enlace mágico",
    emailSent: "Revisa tu correo y haz clic en el enlace",
    skip: "Quizás más tarde",
    errorPrefix: "Error",
    or: "o",
  },
  indonesian: {
    title: "Fitur simpan progresmu sudah hadir 🦊",
    body: (xp, streak) =>
      `Kamu punya ${xp} XP dan ${streak} hari beruntun. Masuk sekali supaya semuanya tetap aman saat ganti ponsel atau instal ulang.`,
    google: "Masuk dengan Google",
    emailLabel: "Email",
    emailPlaceholder: "kamu@contoh.com",
    emailCta: "Kirimi aku tautan ajaib",
    emailSent: "Cek emailmu dan klik tautannya",
    skip: "Nanti saja",
    errorPrefix: "Error",
    or: "atau",
  },
};

export function FirstTimeSignInModal() {
  const { user, loading: authLoading, signInWithGoogle, signInWithEmail } = useAuth();
  const { hasOnboarded, isHydrated, stats, nativeLanguage, learningLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [seenChecked, setSeenChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Decide whether to open on mount / state changes.
  useEffect(() => {
    if (!isHydrated || authLoading) return;
    if (user) { setOpen(false); return; }       // signed in → never show
    if (!hasOnboarded) { setOpen(false); return; } // new user → onboarding handles it
    const hasProgressWorthSaving = stats.xp > 0 || stats.streak > 0 || stats.wordsLearned > 0;
    if (!hasProgressWorthSaving) { setOpen(false); return; }
    if (seenChecked) return;                    // already checked
    let cancelled = false;
    AsyncStorage.getItem(SEEN_KEY).then((v) => {
      if (cancelled) return;
      setSeenChecked(true);
      if (v !== "1") setOpen(true);
    });
    return () => { cancelled = true; };
  }, [user, authLoading, hasOnboarded, isHydrated, seenChecked, stats.xp, stats.streak, stats.wordsLearned]);

  // If the user signs in while the modal is open, mark seen and close.
  useEffect(() => {
    if (user && open) {
      markSeen().catch(() => {});
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, open]);

  const markSeen = useCallback(async () => {
    try { await AsyncStorage.setItem(SEEN_KEY, "1"); }
    catch (e) { console.warn("[FirstTimeSignInModal] persist failed:", e); }
  }, []);

  const onGoogle = useCallback(async () => {
    setBusy(true); setError(null);
    const { error: err } = await signInWithGoogle();
    if (err) setError(err);
    setBusy(false);
    // Success path closes via the user-effect above.
  }, [signInWithGoogle]);

  const onMagicLink = useCallback(async () => {
    if (!emailInput.trim()) return;
    setBusy(true); setError(null); setEmailSent(false);
    const { error: err } = await signInWithEmail(emailInput);
    if (err) { setError(err); }
    else { setEmailSent(true); }
    setBusy(false);
    // Don't auto-close on email — user still needs to click the link.
    // But we mark seen so the modal doesn't re-pop on next launch.
    markSeen().catch(() => {});
  }, [emailInput, signInWithEmail, markSeen]);

  const onSkip = useCallback(async () => {
    await markSeen();
    setOpen(false);
  }, [markSeen]);

  if (!open) return null;

  const lc = (nativeLanguage ?? "english") as LangKey;
  const c = COPY[lc];
  // Prepend the brand-promise tagline so the modal delivers the same
  // "Rudy / 5 min / first sentence" message the home and onboarding hero
  // cards do. Source of truth: lib/heroCopy.ts. Falls through to the
  // self-learn placeholder when no learning language is set yet (rare —
  // existing users hitting this modal already have onboarding done).
  // Hero tagline copy (getHeroCopy) is native-keyed and has no Arabic variant,
  // so coerce an "arabic" target to a native default for this one-time modal.
  const effectiveLearning = toNativeLearning(lc, learningLanguage);
  const heroTagline = getHeroCopy(lc, effectiveLearning).tagline;

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onSkip}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{c.title}</Text>
          <Text style={styles.tagline}>{heroTagline}</Text>
          <Text style={styles.body}>{c.body(stats.xp, stats.streak)}</Text>

          <Pressable
            onPress={onGoogle}
            disabled={busy}
            style={({ pressed }) => [
              styles.btn, styles.googleBtn,
              (busy) && styles.btnDim,
              pressed && !busy && styles.btnPressed,
            ]}
          >
            {busy ? <ActivityIndicator size="small" color="#FFFFFF" /> : (
              <>
                <Ionicons name="logo-google" size={18} color="#FFFFFF" />
                <Text style={styles.btnText}>{c.google}</Text>
              </>
            )}
          </Pressable>

          <Text style={styles.or}>— {c.or} —</Text>

          <Text style={styles.label}>{c.emailLabel}</Text>
          <TextInput
            value={emailInput}
            onChangeText={setEmailInput}
            placeholder={c.emailPlaceholder}
            placeholderTextColor={C.goldDim}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            style={styles.input}
            editable={!busy}
          />
          <Pressable
            onPress={onMagicLink}
            disabled={busy || !emailInput.trim()}
            style={({ pressed }) => [
              styles.btn, styles.emailBtn,
              (busy || !emailInput.trim()) && styles.btnDim,
              pressed && !busy && emailInput.trim() && styles.btnPressed,
            ]}
          >
            <Ionicons name="mail-outline" size={18} color="#FFFFFF" />
            <Text style={styles.btnText}>{c.emailCta}</Text>
          </Pressable>
          {emailSent ? <Text style={styles.note}>{c.emailSent}</Text> : null}
          {error ? <Text style={[styles.note, styles.error]}>{c.errorPrefix}: {error}</Text> : null}

          <Pressable
            onPress={onSkip}
            disabled={busy}
            style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.skipText}>{c.skip}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: C.bg2,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.goldDim,
    padding: 22,
    gap: 10,
  },
  title: {
    fontFamily: F.header,
    fontSize: 18,
    color: C.gold,
    lineHeight: 26,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  tagline: {
    fontFamily: F.bodySemi,
    fontSize: 13.5,
    color: C.gold,
    lineHeight: 20,
    fontStyle: "italic",
    marginBottom: 2,
  },
  body: {
    fontFamily: F.body,
    fontSize: 14,
    color: C.parchment,
    lineHeight: 21,
    marginBottom: 10,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  googleBtn: {
    backgroundColor: "#4285F4",
    borderColor: "#3367D6",
  },
  emailBtn: {
    backgroundColor: C.gold,
    borderColor: C.goldDim,
  },
  btnText: {
    fontFamily: F.header,
    fontSize: 14.5,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  btnDim: { opacity: 0.45 },
  btnPressed: { transform: [{ scale: 0.985 }], opacity: 0.92 },
  or: {
    fontFamily: F.body,
    fontSize: 12.5,
    color: C.goldDim,
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: 2,
  },
  label: {
    fontFamily: F.bodySemi,
    fontSize: 13,
    color: C.goldDim,
    marginBottom: 2,
  },
  input: {
    fontFamily: F.body,
    fontSize: 14.5,
    color: C.parchment,
    backgroundColor: C.bg3,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.goldDim,
  },
  note: {
    fontFamily: F.body,
    fontSize: 12.5,
    color: C.gold,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 4,
  },
  error: { color: "#F2697D" },
  skipBtn: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  skipText: {
    fontFamily: F.bodySemi,
    fontSize: 14,
    color: C.goldDim,
    textDecorationLine: "underline",
  },
});
