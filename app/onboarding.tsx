import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Animated,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage, NativeLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { C, F } from "@/constants/theme";

const DONE_KEY = (lang: string) => `basicCourseCompleted_${lang}`;

const rudySplashImg = require("@/assets/rudy_splash.png");
const { width: SCREEN_W } = Dimensions.get("window");
const SPLASH_SIZE = Math.min(SCREEN_W - 48, 300);

function RudySplashPlaceholder() {
  const [loaded, setLoaded] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const onLoad = () => {
    setLoaded(true);
    Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  };
  return (
    <View style={{ width: SPLASH_SIZE, height: SPLASH_SIZE, borderRadius: 14, overflow: "hidden" }}>
      {!loaded && (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(201,162,39,0.12)", justifyContent: "center", alignItems: "center", borderRadius: 14 }]}>
          <Text style={{ fontSize: 60 }}>🦊</Text>
        </View>
      )}
      <Animated.Image source={rudySplashImg} style={{ width: SPLASH_SIZE, height: SPLASH_SIZE, borderRadius: 14, opacity }} resizeMode="contain" onLoad={onLoad} />
    </View>
  );
}

type Step = 1 | 2 | 3;

const ALL_LANGS: { id: NativeLanguage; flag: string; nameMap: Record<NativeLanguage, string> }[] = [
  { id: "korean",  flag: "🇰🇷", nameMap: { korean: "한국어",    english: "Korean",  spanish: "Coreano" } },
  { id: "english", flag: "🇺🇸", nameMap: { korean: "영어",      english: "English", spanish: "Inglés"  } },
  { id: "spanish", flag: "🇪🇸", nameMap: { korean: "스페인어",  english: "Spanish", spanish: "Español" } },
];

const UI: Record<NativeLanguage, {
  step1Title: string; step1Sub: string;
  step2Title: string; step2Sub: string;
  step3Title: string; step3Sub: string;
  step3Google: string; step3Email: string; step3Skip: string;
  step3EmailPlaceholder: string; step3EmailSent: string; step3Or: string;
  cta1: string; cta2: string; back: string;
}> = {
  korean: {
    step1Title: "모국어를 선택해주세요",
    step1Sub:   "더 나은 학습 경험을 위해 모국어를 알려주세요",
    step2Title: "어떤 언어를 배우고 싶으세요?",
    step2Sub:   "학습할 언어를 선택하세요",
    step3Title: "진행 상황을 저장할까요?",
    step3Sub:   "로그인하면 기기가 바뀌어도 XP·연속학습일이 그대로 이어져요",
    step3Google: "Google로 로그인", step3Email: "이메일로 로그인 링크 받기",
    step3Skip: "나중에 할게요", step3EmailPlaceholder: "you@example.com",
    step3EmailSent: "메일을 확인해서 링크를 누르세요", step3Or: "또는",
    cta1: "다음", cta2: "다음", back: "뒤로",
  },
  english: {
    step1Title: "What's your native language?",
    step1Sub:   "Choose the language you speak at home",
    step2Title: "What do you want to learn?",
    step2Sub:   "Pick the language you'd like to master",
    step3Title: "Save your progress?",
    step3Sub:   "Sign in so your XP and streak follow you to any device",
    step3Google: "Sign in with Google", step3Email: "Send me a magic link",
    step3Skip: "Maybe later", step3EmailPlaceholder: "you@example.com",
    step3EmailSent: "Check your email and click the link", step3Or: "or",
    cta1: "Next", cta2: "Next", back: "Back",
  },
  spanish: {
    step1Title: "¿Cuál es tu idioma nativo?",
    step1Sub:   "Elige el idioma que hablas en casa",
    step2Title: "¿Qué idioma quieres aprender?",
    step2Sub:   "Selecciona el idioma que quieres dominar",
    step3Title: "¿Guardar tu progreso?",
    step3Sub:   "Inicia sesión para que tu XP y racha te sigan en cualquier dispositivo",
    step3Google: "Iniciar sesión con Google", step3Email: "Enviarme un enlace mágico",
    step3Skip: "Quizás más tarde", step3EmailPlaceholder: "tu@ejemplo.com",
    step3EmailSent: "Revisa tu correo y haz clic en el enlace", step3Or: "o",
    cta1: "Siguiente", cta2: "Siguiente", back: "Atrás",
  },
};

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setNativeLanguage, setLearningLanguage } = useLanguage();
  const { user, signInWithGoogle, signInWithEmail } = useAuth();

  const [step,      setStep]      = useState<Step>(1);
  const [nativeSel, setNativeSel] = useState<NativeLanguage | null>(null);
  const [learnSel,  setLearnSel]  = useState<NativeLanguage | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [authBusy,  setAuthBusy]  = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [emailSent,  setEmailSent]  = useState(false);

  // If user signs in successfully while on step 3, finish onboarding.
  useEffect(() => {
    if (step === 3 && user && nativeSel && learnSel) {
      finishToCourse();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, step]);

  const uiLang: NativeLanguage = nativeSel ?? "english";
  const ui = UI[uiLang];
  const learningOptions = ALL_LANGS.filter((l) => l.id !== nativeSel);

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Math.max((Platform.OS === "web" ? 34 : insets.bottom) + 16, 34);

  const handleNativePick = (lang: NativeLanguage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNativeSel(lang); setLearnSel(null);
  };

  const handleLearnPick = (lang: NativeLanguage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLearnSel(lang);
  };

  const handleNext = () => {
    if (step === 1 && nativeSel) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setStep(2);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 3) {
      setStep(2);
      setAuthError(null);
      setEmailSent(false);
    } else {
      setStep(1); setLearnSel(null);
    }
  };

  // Step 2 → 3: lock in the language picks and move to the sign-in invite.
  // If user is already signed in (rare on first run), skip straight to course.
  const handleStep2Next = async () => {
    if (!nativeSel || !learnSel) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await setNativeLanguage(nativeSel);
    await setLearningLanguage(learnSel);
    if (user) {
      finishToCourse();
      return;
    }
    setStep(3);
  };

  const finishToCourse = async () => {
    if (!learnSel) return;
    setLoading(true);
    const done = await AsyncStorage.getItem(DONE_KEY(learnSel));
    if (done === "true") {
      router.replace("/(tabs)");
    } else {
      router.replace("/basic-course");
    }
  };

  const handleGoogle = async () => {
    setAuthBusy(true);
    setAuthError(null);
    const { error } = await signInWithGoogle();
    if (error) setAuthError(error);
    setAuthBusy(false);
    // success path is handled by the useEffect watching `user` above
    // (Google OAuth redirects the whole page on web).
  };

  const handleMagicLink = async () => {
    if (!emailInput.trim()) return;
    setAuthBusy(true);
    setAuthError(null);
    setEmailSent(false);
    const { error } = await signInWithEmail(emailInput);
    if (error) setAuthError(error);
    else setEmailSent(true);
    setAuthBusy(false);
  };

  const handleSkipSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    finishToCourse();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[C.bg1, C.bg2, C.bg1]} style={StyleSheet.absoluteFill} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPad, paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Decorative top border */}
        <View style={styles.topBorder} />

        {/* Rudy splash illustration */}
        <View style={styles.splashWrap}>
          <RudySplashPlaceholder />
        </View>

        {/* Step dots */}
        <View style={styles.dots}>
          <View style={[styles.dot, step === 1 && styles.dotActive]} />
          <View style={[styles.dot, step === 2 && styles.dotActive]} />
          <View style={[styles.dot, step === 3 && styles.dotActive]} />
        </View>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <>
            <View style={styles.textBlock}>
              <Text style={styles.title}>{ui.step1Title}</Text>
              <Text style={styles.subtitle}>{ui.step1Sub}</Text>
            </View>

            <View style={styles.cards}>
              {ALL_LANGS.map((lang) => {
                const sel = nativeSel === lang.id;
                return (
                  <Pressable
                    key={lang.id}
                    style={({ pressed }) => [styles.card, sel && styles.cardSel, pressed && styles.cardPress]}
                    onPress={() => handleNativePick(lang.id)}
                  >
                    <Text style={styles.flag}>{lang.flag}</Text>
                    <Text style={[styles.cardName, sel && styles.cardNameSel]}>
                      {lang.nameMap[uiLang]}
                    </Text>
                    {sel && (
                      <View style={styles.check}>
                        <Ionicons name="checkmark" size={16} color={C.bg1} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.bottom}>
              <Pressable
                style={({ pressed }) => [styles.cta, !nativeSel && styles.ctaDim, pressed && nativeSel && styles.ctaPress]}
                onPress={handleNext}
                disabled={!nativeSel}
              >
                <Text style={styles.ctaText}>{ui.cta1}</Text>
                <Ionicons name="arrow-forward" size={20} color={C.bg1} />
              </Pressable>
            </View>
          </>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <>
            <View style={styles.textBlock}>
              <Text style={styles.title}>{ui.step2Title}</Text>
              <Text style={styles.subtitle}>{ui.step2Sub}</Text>
            </View>

            <View style={styles.cards}>
              {learningOptions.map((lang) => {
                const sel = learnSel === lang.id;
                return (
                  <Pressable
                    key={lang.id}
                    style={({ pressed }) => [styles.card, sel && styles.cardSel, pressed && styles.cardPress]}
                    onPress={() => handleLearnPick(lang.id)}
                  >
                    <Text style={styles.flag}>{lang.flag}</Text>
                    <Text style={[styles.cardName, sel && styles.cardNameSel]}>
                      {lang.nameMap[uiLang]}
                    </Text>
                    {sel && (
                      <View style={styles.check}>
                        <Ionicons name="checkmark" size={16} color={C.bg1} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.bottom}>
              <Pressable style={styles.backBtn} onPress={handleBack}>
                <Ionicons name="chevron-back" size={18} color={C.gold} />
                <Text style={styles.backText}>{ui.back}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.cta, styles.ctaFlex, !learnSel && styles.ctaDim, pressed && learnSel && styles.ctaPress]}
                onPress={handleStep2Next}
                disabled={!learnSel || loading}
              >
                <Text style={styles.ctaText}>{ui.cta2}</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* ── STEP 3: sign-in invite ── */}
        {step === 3 && (
          <>
            <View style={styles.textBlock}>
              <Text style={styles.title}>{ui.step3Title}</Text>
              <Text style={styles.subtitle}>{ui.step3Sub}</Text>
            </View>

            <View style={[styles.cards, { gap: 10 }]}>
              {/* Google */}
              <Pressable
                onPress={handleGoogle}
                disabled={authBusy || loading}
                style={({ pressed }) => [
                  styles.authBtn,
                  styles.googleBtn,
                  (authBusy || loading) && styles.ctaDim,
                  pressed && !authBusy && !loading && styles.ctaPress,
                ]}
              >
                <Ionicons name="logo-google" size={18} color="#FFFFFF" />
                <Text style={styles.authBtnText}>{ui.step3Google}</Text>
              </Pressable>

              {/* Divider */}
              <Text style={styles.divider}>— {ui.step3Or} —</Text>

              {/* Email */}
              <TextInput
                value={emailInput}
                onChangeText={setEmailInput}
                placeholder={ui.step3EmailPlaceholder}
                placeholderTextColor={C.goldDim}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.emailInput}
                editable={!authBusy && !loading}
              />
              <Pressable
                onPress={handleMagicLink}
                disabled={authBusy || loading || !emailInput.trim()}
                style={({ pressed }) => [
                  styles.authBtn,
                  styles.emailBtn,
                  (authBusy || loading || !emailInput.trim()) && styles.ctaDim,
                  pressed && !authBusy && !loading && emailInput.trim() && styles.ctaPress,
                ]}
              >
                <Ionicons name="mail-outline" size={18} color="#FFFFFF" />
                <Text style={styles.authBtnText}>{ui.step3Email}</Text>
              </Pressable>
              {emailSent ? (
                <Text style={styles.authNote}>{ui.step3EmailSent}</Text>
              ) : null}
              {authError ? (
                <Text style={[styles.authNote, { color: "#F2697D" }]}>{authError}</Text>
              ) : null}
            </View>

            <View style={[styles.bottom, { marginTop: 6 }]}>
              <Pressable style={styles.backBtn} onPress={handleBack}>
                <Ionicons name="chevron-back" size={18} color={C.gold} />
                <Text style={styles.backText}>{ui.back}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.skipBtn, pressed && styles.ctaPress]}
                onPress={handleSkipSignIn}
                disabled={loading}
              >
                <Text style={styles.skipBtnText}>{ui.step3Skip}</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  topBorder: { height: 2, backgroundColor: C.gold, marginHorizontal: 24, marginTop: 8, borderRadius: 1 },
  splashWrap: {
    alignItems: "center", justifyContent: "center",
    marginTop: 4, marginBottom: 4,
  },
  splashImg: {
    width: SPLASH_SIZE,
    height: SPLASH_SIZE,
    borderRadius: 14,
  },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.goldDark },
  dotActive: { width: 26, backgroundColor: C.gold },
  textBlock: { alignItems: "center", paddingHorizontal: 32, marginBottom: 14 },
  title: {
    fontSize: 22, fontFamily: F.header, color: C.gold,
    textAlign: "center", marginBottom: 10, lineHeight: 32, letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15, fontFamily: F.body, color: C.goldDim,
    textAlign: "center", lineHeight: 22, fontStyle: "italic",
  },
  cards: { paddingHorizontal: 24, gap: 14 },
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.bg2,
    borderRadius: 18, padding: 18, gap: 16,
    borderWidth: 1.5, borderColor: C.border,
  },
  cardSel: {
    backgroundColor: C.parchment, borderColor: C.gold,
  },
  cardPress: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  flag:     { fontSize: 34 },
  cardName: { flex: 1, fontSize: 18, fontFamily: F.bodySemi, color: C.parchment },
  cardNameSel: { color: C.textParchment },
  check: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.gold,
    justifyContent: "center", alignItems: "center",
  },
  bottom: { paddingHorizontal: 24, paddingTop: 20, gap: 12 },
  backBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    alignSelf: "flex-start", paddingVertical: 4, paddingHorizontal: 2,
  },
  backText: { fontSize: 15, fontFamily: F.bodySemi, color: C.gold },
  cta: {
    backgroundColor: C.gold, borderRadius: 18,
    paddingVertical: 18, alignItems: "center",
    flexDirection: "row", justifyContent: "center", gap: 8,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  ctaFlex:  { flex: 0 },
  ctaDim:   { backgroundColor: C.goldDark, shadowOpacity: 0 },
  ctaPress: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  ctaText:  { fontSize: 17, fontFamily: F.header, color: C.bg1, letterSpacing: 1 },
  authBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  googleBtn: {
    backgroundColor: "#4285F4",
    borderWidth: 1,
    borderColor: "#3367D6",
  },
  emailBtn: {
    backgroundColor: C.gold,
    borderWidth: 1,
    borderColor: C.goldDim,
  },
  authBtnText: {
    fontSize: 15,
    fontFamily: F.header,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  divider: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.goldDim,
    textAlign: "center",
    marginVertical: 4,
    fontStyle: "italic",
  },
  emailInput: {
    fontFamily: F.body,
    fontSize: 15,
    color: C.parchment,
    backgroundColor: C.bg2,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.goldDim,
  },
  authNote: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.gold,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 4,
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.goldDim,
  },
  skipBtnText: {
    fontSize: 15,
    fontFamily: F.bodySemi,
    color: C.gold,
    letterSpacing: 0.5,
  },
});
