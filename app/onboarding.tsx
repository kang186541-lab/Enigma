import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useLanguage, NativeLanguage } from "@/context/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import { C, F } from "@/constants/theme";
import { resetGuideForDrip } from "@/components/RudyGuideModal";
import { trackLearningEvent } from "@/lib/learningEvents";
import { getHomeGoalPrompt, getHomeLearningGoalOptions } from "@/lib/homeSpeakingMission";
import { loadLearnerProfile, setPrimaryLearningGoal, type LearningGoal } from "@/lib/learnerProfile";
import { getDailySpeakingMissionPhrase, type DailySpeakingLanguage, type DailySpeakingPhrase } from "@/lib/dailySpeakingMissions";

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

type Step = 1 | 2;

const ALL_LANGS: { id: NativeLanguage; badge: string; nameMap: Record<NativeLanguage, string> }[] = [
  { id: "korean",  badge: "KO", nameMap: { korean: "한국어",    english: "Korean",  spanish: "Coreano", indonesian: "Korea" } },
  { id: "english", badge: "EN", nameMap: { korean: "영어",      english: "English", spanish: "Inglés", indonesian: "Inggris"  } },
  { id: "spanish", badge: "ES", nameMap: { korean: "스페인어",  english: "Spanish", spanish: "Español", indonesian: "Spanyol" } },
  { id: "indonesian", badge: "ID", nameMap: { korean: "인도네시아어", english: "Indonesian", spanish: "Indonesio", indonesian: "Indonesia" } },
];

const UI: Record<NativeLanguage, {
  step1Title: string; step1Sub: string;
  guideEyebrow: string; guideNext: string; guideStart: string;
  guideFinalHint: string;
  step2Title: string; step2Sub: string;
  firstSpeechTitle: string; firstSpeechSub: string;
  goalPrompt: string;
  firstSentenceLabel: string;
  firstSentenceWaiting: string;
  goalWaiting: string;
  setupLanguageLabel: string; setupGoalLabel: string;
  chooseLanguageCta: string; chooseGoalCta: string; continueToGuideCta: string;
  cta1: string; cta2: string; back: string;
}> = {
  korean: {
    step1Title: "모국어 선택",
    step1Sub:   "더 나은 학습 경험을 위해 모국어를 알려주세요",
    guideEyebrow: "Rudy의 언어 가이드",
    guideNext: "다음 카드",
    guideStart: "이제 시작하자",
    guideFinalHint: "다음: Rudy가 준비한 첫 문장을 바로 입 밖으로 말해요.",
    step2Title: "어떤 언어를 배우고 싶으세요?",
    step2Sub:   "학습할 언어를 선택하세요",
    firstSpeechTitle: "다음은 바로 한 문장 말하기",
    firstSpeechSub: "틀려도 괜찮아요. Rudy는 점수보다 시도를 먼저 기록해요.",
    goalPrompt: "먼저 실제로 쓸 상황을 골라주세요",
    firstSentenceLabel: "첫 문장",
    firstSentenceWaiting: "언어와 상황을 고르면 Rudy가 바로 말할 첫 문장을 보여줘요.",
    goalWaiting: "먼저 배울 언어를 고르면 실제 상황을 선택할 수 있어요.",
    setupLanguageLabel: "배울 언어",
    setupGoalLabel: "실제로 쓸 상황",
    chooseLanguageCta: "배울 언어 선택",
    chooseGoalCta: "상황 선택",
    continueToGuideCta: "첫 문장 말하기",
    cta1: "다음", cta2: "말하기 시작", back: "뒤로",
  },
  english: {
    step1Title: "Native language?",
    step1Sub:   "Choose the language you speak at home",
    guideEyebrow: "Rudy's Language Guide",
    guideNext: "Next card",
    guideStart: "Let's start",
    guideFinalHint: "Next: say the first sentence Rudy prepared for you.",
    step2Title: "What do you want to learn?",
    step2Sub:   "Pick the language you'd like to master",
    firstSpeechTitle: "Next: say one real sentence",
    firstSpeechSub: "Mistakes are fine. Rudy counts the spoken attempt before the score.",
    goalPrompt: "First, choose where you will actually use it",
    firstSentenceLabel: "First sentence",
    firstSentenceWaiting: "Choose a language and situation, then Rudy will show the first sentence you will say.",
    goalWaiting: "Choose a learning language first, then pick the real-use situation.",
    setupLanguageLabel: "Learning language",
    setupGoalLabel: "Real-use situation",
    chooseLanguageCta: "Choose a language",
    chooseGoalCta: "Choose a situation",
    continueToGuideCta: "Say your first sentence",
    cta1: "Next", cta2: "Start speaking", back: "Back",
  },
  spanish: {
    step1Title: "Idioma nativo?",
    step1Sub:   "Elige el idioma que hablas en casa",
    guideEyebrow: "Guía de idiomas de Rudy",
    guideNext: "Siguiente tarjeta",
    guideStart: "Empecemos",
    guideFinalHint: "Ahora: di la primera frase que Rudy preparó para ti.",
    step2Title: "¿Qué idioma quieres aprender?",
    step2Sub:   "Selecciona el idioma que quieres dominar",
    firstSpeechTitle: "Ahora: di una frase real",
    firstSpeechSub: "Los errores están bien. Rudy cuenta el intento antes que la nota.",
    goalPrompt: "Primero, elige dónde lo usarás de verdad",
    firstSentenceLabel: "Primera frase",
    firstSentenceWaiting: "Elige idioma y situación, y Rudy mostrará la primera frase que vas a decir.",
    goalWaiting: "Primero elige un idioma, luego la situación real.",
    setupLanguageLabel: "Idioma que aprenderás",
    setupGoalLabel: "Situación real",
    chooseLanguageCta: "Elige un idioma",
    chooseGoalCta: "Elige una situación",
    continueToGuideCta: "Di tu primera frase",
    cta1: "Siguiente", cta2: "Empezar a hablar", back: "Atrás",
  },
  indonesian: {
    step1Title: "Bahasa ibu?",
    step1Sub:   "Pilih bahasa yang kamu pakai sehari-hari",
    guideEyebrow: "Panduan Bahasa Rudy",
    guideNext: "Kartu berikutnya",
    guideStart: "Ayo mulai",
    guideFinalHint: "Selanjutnya: ucapkan kalimat pertama yang Rudy siapkan untukmu.",
    step2Title: "Bahasa apa yang ingin kamu pelajari?",
    step2Sub:   "Pilih bahasa yang ingin kamu kuasai",
    firstSpeechTitle: "Selanjutnya: ucapkan satu kalimat nyata",
    firstSpeechSub: "Salah itu wajar. Rudy menghitung usaha bicaramu sebelum nilainya.",
    goalPrompt: "Pertama, pilih di mana kamu akan benar-benar memakainya",
    firstSentenceLabel: "Kalimat pertama",
    firstSentenceWaiting: "Pilih bahasa dan situasi, lalu Rudy akan menampilkan kalimat pertama yang akan kamu ucapkan.",
    goalWaiting: "Pilih bahasa yang dipelajari dulu, lalu pilih situasi nyatanya.",
    setupLanguageLabel: "Bahasa yang dipelajari",
    setupGoalLabel: "Situasi nyata",
    chooseLanguageCta: "Pilih bahasa",
    chooseGoalCta: "Pilih situasi",
    continueToGuideCta: "Ucapkan kalimat pertamamu",
    cta1: "Lanjut", cta2: "Mulai bicara", back: "Kembali",
  },
};

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setNativeLanguage, setLearningLanguage } = useLanguage();

  const [step,      setStep]      = useState<Step>(1);
  const [nativeSel, setNativeSel] = useState<NativeLanguage | null>(null);
  const [learnSel,  setLearnSel]  = useState<NativeLanguage | null>(null);
  const [goalSel,   setGoalSel]   = useState<LearningGoal | null>(null);
  const [loading,   setLoading]   = useState(false);
  const submittingRef = useRef(false);

  const uiLang: NativeLanguage = nativeSel ?? "english";
  const ui = UI[uiLang];
  // Step 1 (native picker) shows all four languages. The LEARNING list excludes
  // indonesian — it's a native/UI language only in Phase 1, not a learning target.
  const learningOptions = ALL_LANGS.filter((l) => l.id !== nativeSel && l.id !== "indonesian");
  const setupCtaLabel = !learnSel ? ui.chooseLanguageCta : !goalSel ? ui.chooseGoalCta : ui.continueToGuideCta;
  // The learning target is never indonesian (Phase 1), so cast the lookup key.
  // We widen the preview's `meanings` to the full native set via the cast below
  // so the native-keyed read on the next line type-checks even though the
  // underlying data only carries the 3 learning languages — an Indonesian
  // native simply gets `undefined` here and falls back to English.
  const firstSpeakingPreview = (learnSel && goalSel
    ? getDailySpeakingMissionPhrase(learnSel as DailySpeakingLanguage, goalSel, 0)
    : null) as (Omit<DailySpeakingPhrase, "meanings"> & { meanings: Record<NativeLanguage, string> }) | null;
  const firstSpeakingMeaning = firstSpeakingPreview?.meanings[uiLang] ?? firstSpeakingPreview?.meanings.english ?? null;

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Math.max((Platform.OS === "web" ? 34 : insets.bottom) + 16, 34);

  const handleNativePick = (lang: NativeLanguage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNativeSel(lang); setLearnSel(null); setGoalSel(null);
  };

  const handleLearnPick = (lang: NativeLanguage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLearnSel(lang);
  };

  const handleGoalPick = (goal: LearningGoal) => {
    if (!learnSel) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setGoalSel(goal);
    void trackLearningEvent("learning_goal_selected", {
      surface: "onboarding",
      nativeLanguage: nativeSel,
      targetLanguage: learnSel,
      goal,
    });
  };

  const handleNext = () => {
    if (step === 1 && nativeSel) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setStep(2);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 2) {
      setStep(1);
    } else {
      setStep(1); setLearnSel(null); setGoalSel(null);
    }
  };

  const handleSetupNext = () => {
    if (!nativeSel || !learnSel || !goalSel) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    void handleStartSpeaking();
  };

  // Final guide card: lock in the language picks and start with one spoken sentence.
  // Sign-in reminders are delayed until the learner has progress worth saving.
  const handleStartSpeaking = async () => {
    if (!nativeSel || !learnSel || !goalSel || submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await setNativeLanguage(nativeSel);
      await setLearningLanguage(learnSel);
      await setPrimaryLearningGoal(goalSel).catch((err: unknown) => {
        console.warn("[Onboarding] learner goal save failed:", err);
      });
      await resetGuideForDrip().catch((err: unknown) => {
        console.warn("[Onboarding] guide drip reset failed:", err);
      });
      await trackLearningEvent("onboarding_first_speaking_started", {
        surface: "onboarding",
        nativeLanguage: nativeSel,
        targetLanguage: learnSel,
        goal: goalSel,
      });
      // True foreign-script absolute beginners should do the ~10-min Basics
      // (which culminates in a spoken greeting) before the cold speak. Hangul is
      // the only non-Latin learning target among our three, so a non-Korean
      // native learning Korean can't read the script yet — route them to Basics
      // first (unless they've already completed it). The language/goal state is
      // already saved above, so the Speak handoff is preserved for after Basics.
      const needsBasicsFirst = learnSel === "korean" && nativeSel !== "korean";
      let basicsCompleted = false;
      if (needsBasicsFirst) {
        try {
          const profile = await loadLearnerProfile();
          basicsCompleted = profile.basicCourse?.[learnSel]?.completed === true;
        } catch (err) {
          console.warn("[Onboarding] basics completion check failed:", err);
        }
      }
      if (needsBasicsFirst && !basicsCompleted) {
        setLoading(true);
        router.replace("/basic-course");
        return;
      }
      await finishToCourse();
    } catch (err) {
      console.warn("[Onboarding] start speaking failed:", err);
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const finishToCourse = async () => {
    if (!learnSel) return;
    setLoading(true);
    router.replace("/(tabs)" as any);
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
                    accessibilityRole="button"
                    accessibilityState={{ selected: sel }}
                    accessibilityLabel={lang.nameMap[uiLang]}
                  >
                    <View style={styles.langBadge}>
                      <Text style={styles.langBadgeText}>{lang.badge}</Text>
                    </View>
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

            <View style={styles.setupChecklist}>
              <View style={styles.setupChecklistItem}>
                <Ionicons name={learnSel ? "checkmark-circle" : "ellipse-outline"} size={16} color={learnSel ? C.gold : C.goldDim} />
                <Text style={[styles.setupChecklistText, learnSel && styles.setupChecklistTextDone]}>
                  1. {ui.setupLanguageLabel}
                </Text>
              </View>
              <View style={styles.setupChecklistItem}>
                <Ionicons name={goalSel ? "checkmark-circle" : "ellipse-outline"} size={16} color={goalSel ? C.gold : C.goldDim} />
                <Text style={[styles.setupChecklistText, goalSel && styles.setupChecklistTextDone]}>
                  2. {ui.setupGoalLabel}
                </Text>
              </View>
            </View>

            <View style={styles.cards}>
              {learningOptions.map((lang) => {
                const sel = learnSel === lang.id;
                return (
                  <Pressable
                    key={lang.id}
                    style={({ pressed }) => [styles.card, sel && styles.cardSel, pressed && styles.cardPress]}
                    onPress={() => handleLearnPick(lang.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: sel }}
                    accessibilityLabel={lang.nameMap[uiLang]}
                  >
                    <View style={styles.langBadge}>
                      <Text style={styles.langBadgeText}>{lang.badge}</Text>
                    </View>
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

            <View style={styles.promiseCard}>
              <View style={styles.promiseIcon}>
                <Ionicons name="mic" size={18} color={C.bg1} />
              </View>
              <View style={styles.promiseCopy}>
                <Text style={styles.promiseTitle}>{ui.firstSpeechTitle}</Text>
                <Text style={styles.promiseSub}>{ui.firstSpeechSub}</Text>
                <View style={styles.firstSentencePreview}>
                  <Text style={styles.firstSentenceLabel}>{ui.firstSentenceLabel}</Text>
                  {firstSpeakingPreview ? (
                    <>
                      <Text style={styles.firstSentencePhrase} numberOfLines={2}>
                        “{firstSpeakingPreview.phrase}”
                      </Text>
                      {firstSpeakingMeaning ? (
                        <Text style={styles.firstSentenceMeaning} numberOfLines={2}>
                          {firstSpeakingMeaning}
                        </Text>
                      ) : null}
                    </>
                  ) : (
                    <Text style={styles.firstSentenceWaiting}>{ui.firstSentenceWaiting}</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.goalSection}>
              <Text style={styles.goalPrompt}>{ui.goalPrompt}</Text>
              <View style={styles.goalChips}>
                {learnSel ? getHomeLearningGoalOptions(uiLang).map((option) => {
                  const selected = goalSel === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      style={({ pressed }) => [
                        styles.goalChip,
                        selected && styles.goalChipSelected,
                        pressed && styles.cardPress,
                      ]}
                      onPress={() => handleGoalPick(option.key)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`${getHomeGoalPrompt(uiLang)}: ${option.label}`}
                    >
                      <Text style={[styles.goalChipText, selected && styles.goalChipTextSelected]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                }) : (
                  <Text style={styles.goalLockedHint}>{ui.goalWaiting}</Text>
                )}
              </View>
            </View>

            <View style={styles.bottom}>
              <Pressable style={styles.backBtn} onPress={handleBack}>
                <Ionicons name="chevron-back" size={18} color={C.gold} />
                <Text style={styles.backText}>{ui.back}</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.cta, styles.ctaFlex, (!learnSel || !goalSel) && styles.ctaDim, pressed && learnSel && goalSel && styles.ctaPress]}
                onPress={handleSetupNext}
                disabled={!learnSel || !goalSel || loading}
              >
                <Text style={styles.ctaText}>{setupCtaLabel}</Text>
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
  scrollContent: { flexGrow: 1, width: "100%", maxWidth: "100%", overflow: "hidden" },
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
  textBlock: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  title: {
    width: "100%",
    maxWidth: "100%",
    fontSize: 20, fontFamily: F.header, color: C.gold,
    textAlign: "center", marginBottom: 10, lineHeight: 28, letterSpacing: 0,
  },
  subtitle: {
    width: "100%",
    fontSize: 15, fontFamily: F.body, color: C.goldDim,
    textAlign: "center", lineHeight: 22, fontStyle: "italic",
  },
  cards: { width: "100%", maxWidth: 520, alignSelf: "center", paddingHorizontal: 24, gap: 14 },
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
  langBadge: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "rgba(201,162,39,0.16)",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.32)",
    justifyContent: "center",
    alignItems: "center",
  },
  langBadgeText: {
    fontSize: 14,
    fontFamily: F.header,
    color: C.gold,
    letterSpacing: 0.8,
  },
  cardName: { flex: 1, fontSize: 18, fontFamily: F.bodySemi, color: C.parchment },
  cardNameSel: { color: C.textParchment },
  check: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.gold,
    justifyContent: "center", alignItems: "center",
  },
  setupChecklist: {
    marginHorizontal: 24,
    marginBottom: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.22)",
    backgroundColor: "rgba(201,162,39,0.07)",
    gap: 8,
  },
  setupChecklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  setupChecklistText: {
    fontSize: 12,
    fontFamily: F.bodySemi,
    color: C.goldDim,
  },
  setupChecklistTextDone: { color: C.parchment },
  promiseCard: {
    marginHorizontal: 24,
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.38)",
    backgroundColor: "rgba(201,162,39,0.10)",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  promiseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  promiseCopy: { flex: 1 },
  promiseTitle: {
    fontSize: 14,
    fontFamily: F.header,
    color: C.parchment,
    lineHeight: 18,
  },
  promiseSub: {
    marginTop: 3,
    fontSize: 12,
    fontFamily: F.body,
    color: C.goldDim,
    lineHeight: 17,
  },
  firstSentencePreview: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(201,162,39,0.22)",
    gap: 3,
  },
  firstSentenceLabel: {
    fontSize: 10,
    fontFamily: F.label,
    color: C.gold,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  firstSentencePhrase: {
    fontSize: 17,
    fontFamily: F.header,
    color: C.parchment,
    lineHeight: 22,
  },
  firstSentenceMeaning: {
    fontSize: 12,
    fontFamily: F.bodySemi,
    color: C.goldDim,
    lineHeight: 17,
  },
  firstSentenceWaiting: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.goldDim,
    lineHeight: 17,
  },
  goalSection: {
    marginHorizontal: 24,
    marginTop: 12,
    gap: 8,
  },
  goalPrompt: {
    fontSize: 12,
    fontFamily: F.label,
    color: C.goldDim,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  goalChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  goalLockedHint: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.goldDim,
    lineHeight: 17,
  },
  goalChip: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.28)",
    backgroundColor: "rgba(201,162,39,0.08)",
    paddingHorizontal: 11,
    paddingVertical: 8,
    minHeight: 34,
    justifyContent: "center",
  },
  goalChipSelected: {
    borderColor: C.gold,
    backgroundColor: C.gold,
  },
  goalChipText: {
    fontSize: 12,
    fontFamily: F.bodySemi,
    color: C.parchment,
  },
  goalChipTextSelected: {
    color: C.bg1,
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
