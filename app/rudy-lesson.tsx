import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { C, F } from "@/constants/theme";
import {
  loadProgress,
  saveProgress,
  UNITS,
  getTri,
  langToCode,
  getRandomBriefing,
  STEP_LABELS,
  type DailyCourseProgress,
  type DayData,
} from "@/lib/dailyCourseData";
import {
  LESSON_CONTENT, MISSION_CONTENT, REVIEW_CONTENT, DAY_REWARDS,
  getCompletionMessage, type LearningLangKey,
} from "@/lib/lessonContent";
import { Step1ListenRepeat } from "@/components/rudy/Step1ListenRepeat";
import { Step2KeyPoint } from "@/components/rudy/Step2KeyPoint";
import { Step3MissionTalk } from "@/components/rudy/Step3MissionTalk";
import { Step4QuickReview } from "@/components/rudy/Step4QuickReview";

// ── Helpers ─────────────────────────────────────────────────────────────────

function findDayById(dayId: string): DayData | null {
  for (const unit of UNITS) {
    for (const day of unit.days) {
      if (day.id === dayId) return day;
    }
  }
  return null;
}

// ── Screens ──────────────────────────────────────────────────────────────────

type Phase = "briefing" | "lesson" | "complete";

export default function RudyLessonScreen() {
  const insets = useSafeAreaInsets();
  const { dayId } = useLocalSearchParams<{ dayId: string }>();
  const { nativeLanguage, learningLanguage } = useLanguage();
  const nativeLang = (nativeLanguage ?? "english") as string;
  const learnLang = (learningLanguage ?? "english") as string;
  const lc = langToCode(nativeLang);

  const [phase, setPhase] = useState<Phase>("briefing");
  const [currentStep, setCurrentStep] = useState(0);
  const [sentenceCount, setSentenceCount] = useState(0);
  const [missionSentCount, setMissionSentCount] = useState(0);
  const [pronScores, setPronScores] = useState<number[]>([]);
  const [usedVoiceOnly, setUsedVoiceOnly] = useState(true);
  const [grammarNotes, setGrammarNotes] = useState<string[]>([]);
  const [progress, setProgress] = useState<DailyCourseProgress | null>(null);
  const [briefingMsg] = useState(() => getRandomBriefing(nativeLang));

  const day = findDayById(dayId ?? "");
  const TOTAL_STEPS = 4;
  const stepLabels = STEP_LABELS[nativeLang] ?? STEP_LABELS.english;

  // Step progress animation
  const stepAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  useEffect(() => {
    Animated.timing(stepAnim, {
      toValue: currentStep / TOTAL_STEPS,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  // Called when each STEP is completed
  function handleStepComplete() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (currentStep + 1 >= TOTAL_STEPS) {
      completeMission();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  async function completeMission() {
    if (!progress || !day) { setPhase("complete"); return; }

    const now = { ...progress };
    if (!now.completedDays.includes(day.id)) {
      now.completedDays = [...now.completedDays, day.id];
    }
    now.todayCompleted = true;
    now.todayStepsCompleted = { listenRepeat: true, keyPoint: true, missionTalk: true, review: true };
    const totalSpoken = sentenceCount + missionSentCount;
    now.stats = {
      ...now.stats,
      totalSentencesSpoken: now.stats.totalSentencesSpoken + totalSpoken,
      totalDaysCompleted: now.stats.totalDaysCompleted + 1,
    };

    // Advance to next day if this was the current day
    const allDays = UNITS.flatMap((u) => u.days);
    const currentDayGlobal = allDays.findIndex((d) => d.id === day.id);
    if (currentDayGlobal !== -1 && currentDayGlobal >= 0) {
      const nextDay = allDays[currentDayGlobal + 1];
      if (nextDay) {
        const nextUnit = UNITS.findIndex((u) => u.days.some((d) => d.id === nextDay.id));
        const nextDayIdx = UNITS[nextUnit]?.days.findIndex((d) => d.id === nextDay.id) ?? 0;
        now.currentUnitIndex = nextUnit >= 0 ? nextUnit : now.currentUnitIndex;
        now.currentDayIndex = nextDayIdx;
      }
    }

    await saveProgress(now);
    setProgress(now);
    setPhase("complete");
  }

  if (!day) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.errorText}>Day not found</Text>
        <Pressable style={styles.backHomeBtn} onPress={() => router.back()}>
          <Text style={styles.backHomeBtnText}>← Back</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === "briefing") {
    return <BriefingScreen
      day={day} nativeLang={nativeLang} lc={lc}
      briefingMsg={briefingMsg} insets={insets}
      onStart={() => setPhase("lesson")}
    />;
  }

  if (phase === "complete") {
    return <CompleteScreen
      day={day} nativeLang={nativeLang} lc={lc}
      sentenceCount={sentenceCount + missionSentCount}
      pronScores={pronScores}
      usedVoiceOnly={usedVoiceOnly}
      grammarNotes={grammarNotes}
      insets={insets}
    />;
  }

  return (
    <LessonScreen
      day={day} nativeLang={nativeLang} lc={lc}
      learningLang={learnLang}
      currentStep={currentStep} totalSteps={TOTAL_STEPS}
      stepLabels={stepLabels} stepAnim={stepAnim}
      sentenceCount={sentenceCount}
      setSentenceCount={setSentenceCount}
      onStepComplete={handleStepComplete}
      onMissionComplete={(cnt, voiceOnly, notes) => {
        setMissionSentCount(cnt);
        if (!voiceOnly) setUsedVoiceOnly(false);
        setGrammarNotes(notes);
      }}
      onReviewComplete={(scores) => setPronScores(scores)}
      insets={insets}
    />
  );
}

// ── Briefing Screen ──────────────────────────────────────────────────────────

function BriefingScreen({
  day, nativeLang, lc, briefingMsg, insets, onStart,
}: {
  day: DayData; nativeLang: string; lc: "ko" | "en" | "es";
  briefingMsg: string; insets: ReturnType<typeof useSafeAreaInsets>;
  onStart: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const startLabel = nativeLang === "korean" ? "훈련 시작! →"
    : nativeLang === "spanish" ? "¡Empezar el Entrenamiento! →"
    : "Start Training! →";

  const todayTopicLabel = nativeLang === "korean" ? "오늘의 훈련 주제"
    : nativeLang === "spanish" ? "Tema de hoy"
    : "Today's topic";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable style={styles.briefingBackBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={22} color={C.goldDim} />
      </Pressable>

      <Animated.View style={[styles.briefingContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Rudy avatar */}
        <View style={styles.rudyAvatarWrap}>
          <Text style={styles.rudyEmoji}>🦊</Text>
          <View style={styles.rudyNameBadge}>
            <Text style={styles.rudyNameText}>Rudy</Text>
          </View>
        </View>

        {/* Speech bubble */}
        <View style={styles.speechBubble}>
          <View style={styles.speechTail} />
          <Text style={styles.speechTopic}>{todayTopicLabel}:</Text>
          <Text style={styles.speechTitle}>{getTri(day.topic, lc)}</Text>
          <View style={styles.speechDivider} />
          <Text style={styles.speechMsg}>{briefingMsg}</Text>
        </View>

        {/* Start button */}
        <Pressable
          style={({ pressed }) => [styles.startMissionBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onStart();
          }}
        >
          <Text style={styles.startMissionBtnText}>{startLabel}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ── Lesson Screen ────────────────────────────────────────────────────────────

// Steps 0, 1, 2, 3 all drive their own completion
const SELF_COMPLETING_STEPS = [0, 1, 2, 3];

function LessonScreen({
  day, nativeLang, lc, learningLang, currentStep, totalSteps, stepLabels, stepAnim,
  sentenceCount, setSentenceCount, onStepComplete, onMissionComplete, onReviewComplete, insets,
}: {
  day: DayData; nativeLang: string; lc: "ko" | "en" | "es"; learningLang: string;
  currentStep: number; totalSteps: number;
  stepLabels: string[]; stepAnim: Animated.Value;
  sentenceCount: number;
  setSentenceCount: (n: number) => void;
  onStepComplete: () => void;
  onMissionComplete: (cnt: number, voiceOnly: boolean, notes: string[]) => void;
  onReviewComplete: (scores: number[]) => void;
  insets: ReturnType<typeof useSafeAreaInsets>;
}) {
  const [stepDone, setStepDone] = useState(false);
  const completeAnim  = useRef(new Animated.Value(0)).current;
  const lessonScrollRef = useRef<ScrollView>(null);

  // Reset stepDone when step actually changes
  useEffect(() => { setStepDone(false); }, [currentStep]);

  // Animate completion card in and auto-scroll to show it
  useEffect(() => {
    if (stepDone) {
      completeAnim.setValue(0);
      Animated.spring(completeAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }).start();
      // Scroll to bottom so the completion card is visible
      setTimeout(() => lessonScrollRef.current?.scrollToEnd({ animated: true }), 350);
    }
  }, [stepDone]);

  // Called by step content when it finishes — shows completion card instead of auto-advancing
  function handleStepDone() {
    // STEP 4 (index 3) goes straight to mission complete — no intermediate card
    if (currentStep === 3) { onStepComplete(); return; }
    setStepDone(true);
  }

  // Called by the "Next Step →" button
  function handleNextStep() {
    setStepDone(false);
    onStepComplete();
  }

  const STEP_COMPLETE_MSGS: Record<string, string[]> = {
    korean: [
      "훌륭해! 귀를 잘 트이고 있어 👂",
      "완벽해! 핵심을 잘 이해했어 🧠",
      "대단해! 직접 말해봤잖아! 🎤",
    ],
    spanish: [
      "¡Excelente! Tu oído mejora 👂",
      "¡Perfecto! Bien entendido 🧠",
      "¡Asombroso! ¡Hablaste de verdad! 🎤",
    ],
    english: [
      "Great job! Your ears are opening up 👂",
      "Perfect! You got the key points 🧠",
      "Amazing! You actually spoke! 🎤",
    ],
  };

  const NEXT_STEP_LABELS: Record<string, string[]> = {
    korean: ["STEP 2로 →", "STEP 3으로 →", "STEP 4로 →"],
    spanish: ["Al STEP 2 →", "Al STEP 3 →", "Al STEP 4 →"],
    english: ["To STEP 2 →", "To STEP 3 →", "To STEP 4 →"],
  };

  const completeMsgs = STEP_COMPLETE_MSGS[nativeLang] ?? STEP_COMPLETE_MSGS.english;
  const nextStepLabels = NEXT_STEP_LABELS[nativeLang] ?? NEXT_STEP_LABELS.english;

  const sentenceLabel = nativeLang === "korean" ? "문장 완료"
    : nativeLang === "spanish" ? "oraciones"
    : "sentences done";

  const nextLabel = nativeLang === "korean" ? "다음 →"
    : nativeLang === "spanish" ? "Siguiente →"
    : "Next →";

  const completeStepLabel = nativeLang === "korean" ? "STEP 완료 →"
    : nativeLang === "spanish" ? "Completar STEP →"
    : "Complete STEP →";

  const selfCompletes = SELF_COMPLETING_STEPS.includes(currentStep);

  const stepWidth = stepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Top bar ─────────────────────────────── */}
      <View style={styles.lessonHeader}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={C.goldDim} />
        </Pressable>
        <View style={styles.lessonHeaderCenter}>
          <Text style={styles.lessonDayLabel}>Day {day.dayNumber} · {getTri(day.topic, lc)}</Text>
          <View style={styles.stepRow}>
            <Text style={styles.stepCounter}>STEP {currentStep + 1}/{totalSteps}</Text>
            <Text style={styles.stepName}>{stepLabels[currentStep]}</Text>
          </View>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.lessonProgressTrack}>
        <Animated.View style={[styles.lessonProgressFill, { width: stepWidth }]} />
      </View>

      {/* Step tabs */}
      <View style={styles.stepTabs}>
        {stepLabels.map((label, i) => (
          <View
            key={i}
            style={[
              styles.stepTab,
              i === currentStep && styles.stepTabActive,
              i < currentStep && styles.stepTabDone,
            ]}
          >
            {i < currentStep ? (
              <Ionicons name="checkmark" size={12} color={C.gold} />
            ) : (
              <Text style={[styles.stepTabNum, i === currentStep && styles.stepTabNumActive]}>{i + 1}</Text>
            )}
          </View>
        ))}
      </View>

      {/* ── Step content area ───────────────────── */}
      <ScrollView
        ref={lessonScrollRef}
        style={styles.lessonScroll}
        contentContainerStyle={styles.lessonScrollContent}
      >
        <StepContent
          stepIndex={currentStep}
          day={day}
          nativeLang={nativeLang}
          lc={lc}
          learningLang={learningLang}
          stepLabels={stepLabels}
          onStepComplete={handleStepDone}
          onSentenceSpoken={(n) => setSentenceCount(sentenceCount + n)}
          onMissionComplete={onMissionComplete}
          onReviewComplete={onReviewComplete}
        />

        {/* ── Step completion card (shown BELOW content, not replacing it) ── */}
        {stepDone && (
          <Animated.View style={[
            styles.stepCompleteCard,
            { opacity: completeAnim, transform: [{ scale: completeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] },
          ]}>
            <Text style={styles.stepCompleteEmoji}>✅</Text>
            <Text style={styles.stepCompleteTitle}>
              {nativeLang === "korean" ? `STEP ${currentStep + 1} 완료! 🎉`
                : nativeLang === "spanish" ? `¡STEP ${currentStep + 1} Completado! 🎉`
                : `STEP ${currentStep + 1} Complete! 🎉`}
            </Text>
            <View style={styles.stepCompleteRudy}>
              <Text style={styles.stepCompleteRudyTag}>🦊 루디</Text>
              <Text style={styles.stepCompleteRudyMsg}>{completeMsgs[currentStep] ?? completeMsgs[0]}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.stepCompleteBtn, pressed && { opacity: 0.85 }]}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                handleNextStep();
              }}
            >
              <Text style={styles.stepCompleteBtnText}>{nextStepLabels[currentStep] ?? nextLabel}</Text>
              <Ionicons name="arrow-forward" size={16} color={C.bg1} />
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>

      {/* ── Bottom bar (hidden for self-completing steps) ──────────────── */}
      {!selfCompletes && !stepDone && (
        <View style={[styles.lessonFooter, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.footerLeft}>
            <Ionicons name="chatbubble-outline" size={15} color={C.goldDim} />
            <Text style={styles.sentenceCountText}>{sentenceCount} {sentenceLabel}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.nextStepBtn, pressed && { opacity: 0.85 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleStepDone();
            }}
          >
            <Text style={styles.nextStepBtnText}>
              {currentStep + 1 >= totalSteps ? completeStepLabel : nextLabel}
            </Text>
            <Ionicons name="arrow-forward" size={14} color={C.bg1} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ── Step Content ──────────────────────────────────────────────────────────────

function StepContent({
  stepIndex, day, nativeLang, lc, learningLang, stepLabels,
  onStepComplete, onSentenceSpoken, onMissionComplete, onReviewComplete,
}: {
  stepIndex: number; day: DayData; nativeLang: string; lc: "ko" | "en" | "es";
  learningLang: string;
  stepLabels: string[]; onStepComplete: () => void;
  onSentenceSpoken: (n: number) => void;
  onMissionComplete: (cnt: number, voiceOnly: boolean, notes: string[]) => void;
  onReviewComplete: (scores: number[]) => void;
}) {
  const dayContent = LESSON_CONTENT[day.id];
  const langContent = dayContent?.[learningLang as LearningLangKey];

  // ── STEP 1: 듣고 따라하기 ─────────────────────────────────────────────────
  if (stepIndex === 0) {
    if (!langContent?.step1Sentences?.length) {
      return <NoContentCard nativeLang={nativeLang} step={1} onSkip={onStepComplete} />;
    }
    return (
      <View style={stepContentStyles.container}>
        <View style={stepContentStyles.header}>
          <View style={stepContentStyles.iconWrap}>
            <Ionicons name="headset" size={26} color={C.gold} />
          </View>
          <Text style={stepContentStyles.stepTitle}>STEP 1: {stepLabels[0]}</Text>
          <Text style={stepContentStyles.stepTopic}>{getTri(day.topic, lc)}</Text>
        </View>
        <Step1ListenRepeat
          sentences={langContent.step1Sentences}
          nativeLang={nativeLang}
          lc={lc}
          onComplete={(spoken) => {
            onSentenceSpoken(spoken);
            onStepComplete();
          }}
        />
      </View>
    );
  }

  // ── STEP 2: 핵심 포인트 ───────────────────────────────────────────────────
  if (stepIndex === 1) {
    if (!langContent?.step2) {
      return <NoContentCard nativeLang={nativeLang} step={2} onSkip={onStepComplete} />;
    }
    return (
      <View style={stepContentStyles.container}>
        <View style={stepContentStyles.header}>
          <View style={stepContentStyles.iconWrap}>
            <Ionicons name="bulb" size={26} color={C.gold} />
          </View>
          <Text style={stepContentStyles.stepTitle}>STEP 2: {stepLabels[1]}</Text>
          <Text style={stepContentStyles.stepTopic}>{getTri(day.topic, lc)}</Text>
        </View>
        <Step2KeyPoint
          data={langContent.step2}
          nativeLang={nativeLang}
          lc={lc}
          learningLang={learningLang}
          onComplete={(correct) => {
            onSentenceSpoken(correct);
            onStepComplete();
          }}
        />
      </View>
    );
  }

  // ── STEP 3: 미션 토크 ─────────────────────────────────────────────────────
  if (stepIndex === 2) {
    const missionData = MISSION_CONTENT[day.id]?.[learningLang as LearningLangKey];
    if (!missionData) {
      return <NoContentCard nativeLang={nativeLang} step={3} onSkip={onStepComplete} />;
    }
    return (
      <View style={stepContentStyles.container}>
        <View style={stepContentStyles.header}>
          <View style={stepContentStyles.iconWrap}>
            <Ionicons name="mic" size={26} color={C.gold} />
          </View>
          <Text style={stepContentStyles.stepTitle}>STEP 3: {stepLabels[2]}</Text>
          <Text style={stepContentStyles.stepTopic}>{getTri(day.topic, lc)}</Text>
        </View>
        <Step3MissionTalk
          data={missionData}
          nativeLang={nativeLang}
          lc={lc}
          learningLang={learningLang}
          onComplete={(cnt, voiceOnly, notes) => {
            onSentenceSpoken(cnt);
            onMissionComplete(cnt, voiceOnly, notes);
            onStepComplete();
          }}
        />
      </View>
    );
  }

  // ── STEP 4: 퀵 리뷰 ──────────────────────────────────────────────────────
  if (stepIndex === 3) {
    const reviewQuestions = REVIEW_CONTENT[day.id]?.[learningLang as LearningLangKey];
    if (!reviewQuestions?.length) {
      return <NoContentCard nativeLang={nativeLang} step={4} onSkip={onStepComplete} />;
    }
    return (
      <View style={stepContentStyles.container}>
        <View style={stepContentStyles.header}>
          <View style={stepContentStyles.iconWrap}>
            <Ionicons name="refresh-circle" size={26} color={C.gold} />
          </View>
          <Text style={stepContentStyles.stepTitle}>STEP 4: {stepLabels[3]}</Text>
          <Text style={stepContentStyles.stepTopic}>{getTri(day.topic, lc)}</Text>
        </View>
        <Step4QuickReview
          questions={reviewQuestions}
          nativeLang={nativeLang}
          lc={lc}
          learningLang={learningLang}
          onComplete={(scores) => {
            onReviewComplete(scores);
            onStepComplete();
          }}
        />
      </View>
    );
  }

  return null;
}

// ── No Content Card ───────────────────────────────────────────────────────────

function NoContentCard({
  nativeLang, step, onSkip,
}: { nativeLang: string; step: number; onSkip: () => void }) {
  const msg = nativeLang === "korean" ? `STEP ${step} 콘텐츠가 아직 없어요.`
    : nativeLang === "spanish" ? `Contenido del STEP ${step} aún no disponible.`
    : `STEP ${step} content not yet available.`;
  const skipLabel = nativeLang === "korean" ? "건너뛰기 →" : nativeLang === "spanish" ? "Omitir →" : "Skip →";
  return (
    <View style={stepContentStyles.container}>
      <View style={stepContentStyles.placeholder}>
        <Text style={stepContentStyles.placeholderEmoji}>🦊</Text>
        <Text style={stepContentStyles.placeholderText}>{msg}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [stepContentStyles.demoBtn, pressed && { opacity: 0.8 }]}
        onPress={onSkip}
      >
        <Text style={stepContentStyles.demoBtnText}>{skipLabel}</Text>
      </Pressable>
    </View>
  );
}

// ── Complete Screen ──────────────────────────────────────────────────────────

function CompleteScreen({
  day, nativeLang, lc, sentenceCount, pronScores, usedVoiceOnly, grammarNotes, insets,
}: {
  day: DayData; nativeLang: string; lc: "ko" | "en" | "es";
  sentenceCount: number; pronScores: number[]; usedVoiceOnly: boolean;
  grammarNotes: string[]; insets: ReturnType<typeof useSafeAreaInsets>;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  // Compute rewards
  const rewards = DAY_REWARDS[day.id] ?? { xp: 100, bonusAllVoice: 50, bonusPronunciation: 30 };
  const avgPron = pronScores.length > 0
    ? Math.round(pronScores.reduce((a, b) => a + b, 0) / pronScores.length)
    : 0;
  const pronBonus = avgPron >= 90;
  const totalXP = rewards.xp + (usedVoiceOnly ? rewards.bonusAllVoice : 0) + (pronBonus ? rewards.bonusPronunciation : 0);

  // Find next day topic
  const allDays = UNITS.flatMap((u) => u.days);
  const idx = allDays.findIndex((d) => d.id === day.id);
  const nextDay = idx >= 0 ? allDays[idx + 1] : null;
  const nextTopic = nextDay ? getTri(nextDay.topic, lc) : "";
  const rudyMsg = getCompletionMessage(nativeLang, sentenceCount, nextTopic);

  const homeLabel = nativeLang === "korean" ? "홈으로"
    : nativeLang === "spanish" ? "Volver al Inicio" : "Go Home";
  const courseLabel = nativeLang === "korean" ? "코스 보기"
    : nativeLang === "spanish" ? "Ver Curso" : "View Course";
  const statsTitle = nativeLang === "korean" ? "📊 오늘의 성과"
    : nativeLang === "spanish" ? "📊 Resultados de Hoy" : "📊 Today's Results";
  const sentLabel = nativeLang === "korean" ? "말한 문장" : nativeLang === "spanish" ? "Oraciones habladas" : "Sentences spoken";
  const pronLabel = nativeLang === "korean" ? "평균 발음 점수" : nativeLang === "spanish" ? "Pronunciación promedio" : "Avg. pronunciation";
  const xpLabel   = nativeLang === "korean" ? "XP 획득" : nativeLang === "spanish" ? "XP ganado" : "XP earned";
  const bonusVoiceLabel = nativeLang === "korean" ? "🎤 음성 전용 보너스" : nativeLang === "spanish" ? "🎤 Bono todo voz" : "🎤 All-voice bonus";
  const bonusPronLabel  = nativeLang === "korean" ? "🌟 발음 완벽 보너스" : nativeLang === "spanish" ? "🌟 Bono pronunciación" : "🌟 Pronunciation bonus";
  const grammarTitle = nativeLang === "korean" ? "💡 오늘의 문법 포인트" : nativeLang === "spanish" ? "💡 Puntos gramaticales" : "💡 Grammar notes";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={[completeStyles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          {/* Title */}
          <Text style={completeStyles.titleEmoji}>🎉</Text>
          <Text style={completeStyles.title}>
            {nativeLang === "korean" ? "미션 완료!" : nativeLang === "spanish" ? "¡Misión Completada!" : "Mission Complete!"}
          </Text>

          {/* Stats */}
          <View style={completeStyles.statsCard}>
            <Text style={completeStyles.statsTitle}>{statsTitle}</Text>
            <View style={completeStyles.divider} />
            <StatRow emoji="🗣️" label={sentLabel} value={`${sentenceCount}`} />
            {avgPron > 0 && (
              <StatRow emoji="🎯" label={pronLabel} value={`${avgPron}점`} />
            )}
            <StatRow emoji="⭐" label={xpLabel} value={`+${rewards.xp}`} gold />
            {usedVoiceOnly && (
              <StatRow emoji="🎤" label={bonusVoiceLabel} value={`+${rewards.bonusAllVoice}`} gold />
            )}
            {pronBonus && (
              <StatRow emoji="🌟" label={bonusPronLabel} value={`+${rewards.bonusPronunciation}`} gold />
            )}
          </View>

          {/* Total XP badge */}
          <View style={completeStyles.totalXPBadge}>
            <Text style={completeStyles.totalXPLabel}>
              {nativeLang === "korean" ? "총 획득 XP" : nativeLang === "spanish" ? "XP Total" : "Total XP"}
            </Text>
            <Text style={completeStyles.totalXPValue}>+{totalXP} XP</Text>
          </View>

          {/* Grammar notes */}
          {grammarNotes.filter(Boolean).length > 0 && (
            <View style={completeStyles.grammarCard}>
              <Text style={completeStyles.grammarTitle}>{grammarTitle}</Text>
              {grammarNotes.filter(Boolean).map((note, i) => (
                <Text key={i} style={completeStyles.grammarNote}>• {note}</Text>
              ))}
            </View>
          )}

          {/* Rudy message */}
          <View style={completeStyles.rudySpeech}>
            <Text style={completeStyles.rudySpeechEmoji}>🦊</Text>
            <View style={completeStyles.rudySpeechBubble}>
              <Text style={completeStyles.rudySpeechText}>{rudyMsg}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Buttons */}
        <View style={completeStyles.buttons}>
          <Pressable
            style={({ pressed }) => [completeStyles.homeBtn, pressed && { opacity: 0.85 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.replace("/(tabs)/" as any);
            }}
          >
            <Text style={completeStyles.homeBtnText}>{homeLabel}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [completeStyles.previewBtn, pressed && { opacity: 0.85 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.replace("/rudy-course" as any);
            }}
          >
            <Text style={completeStyles.previewBtnText}>{courseLabel}</Text>
            <Ionicons name="arrow-forward" size={14} color={C.bg1} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function StatRow({ emoji, label, value, gold }: { emoji: string; label: string; value: string; gold?: boolean }) {
  return (
    <View style={completeStyles.statRow}>
      <Text style={completeStyles.statEmoji}>{emoji}</Text>
      <Text style={completeStyles.statLabel}>{label}</Text>
      <Text style={[completeStyles.statValue, gold && { color: C.gold }]}>{value}</Text>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: C.bg1 },
  centered:   { flex: 1, backgroundColor: C.bg1, alignItems: "center", justifyContent: "center", gap: 16 },
  errorText:  { fontFamily: F.body, color: C.goldDim, fontSize: 14 },
  backHomeBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: C.border },
  backHomeBtnText: { fontFamily: F.body, color: C.gold, fontSize: 14 },

  /* Briefing */
  briefingBackBtn: {
    position: "absolute", top: 60, right: 20, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: "rgba(201,162,39,0.1)", alignItems: "center", justifyContent: "center",
  },
  briefingContent: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 24 },
  rudyAvatarWrap: { alignItems: "center", gap: 8 },
  rudyEmoji: { fontSize: 72 },
  rudyNameBadge: {
    backgroundColor: "rgba(201,162,39,0.15)", paddingHorizontal: 16, paddingVertical: 5,
    borderRadius: 12, borderWidth: 1, borderColor: C.border,
  },
  rudyNameText: { fontSize: 13, fontFamily: F.header, color: C.gold, letterSpacing: 1 },
  speechBubble: {
    backgroundColor: C.bg2, borderRadius: 20, padding: 22,
    borderWidth: 1.5, borderColor: C.border,
    width: "100%", gap: 8,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 14, elevation: 6,
  },
  speechTail: {
    position: "absolute", top: -10, left: "50%",
    width: 0, height: 0,
    borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 10,
    borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: C.border,
  },
  speechTopic: { fontSize: 11, fontFamily: F.label, color: C.goldDim, letterSpacing: 0.5 },
  speechTitle: { fontSize: 22, fontFamily: F.title, color: C.gold, letterSpacing: 1 },
  speechDivider: { height: 1, backgroundColor: "rgba(201,162,39,0.2)", marginVertical: 4 },
  speechMsg:  { fontSize: 15, fontFamily: F.body, color: C.parchment, lineHeight: 22, fontStyle: "italic" },
  startMissionBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.gold, paddingHorizontal: 30, paddingVertical: 15,
    borderRadius: 16, alignSelf: "center",
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
  },
  startMissionBtnText: { fontSize: 16, fontFamily: F.header, color: C.bg1, letterSpacing: 0.5 },

  /* Lesson header */
  lessonHeader: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "rgba(201,162,39,0.15)",
  },
  backBtn: { width: 36, alignItems: "center" },
  lessonHeaderCenter: { flex: 1, alignItems: "center", gap: 2 },
  lessonDayLabel: { fontSize: 13, fontFamily: F.bodySemi, color: C.parchment },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepCounter: { fontSize: 11, fontFamily: F.label, color: C.goldDim },
  stepName:    { fontSize: 11, fontFamily: F.label, color: C.gold },

  lessonProgressTrack: {
    height: 3, backgroundColor: "rgba(201,162,39,0.12)", overflow: "hidden",
  },
  lessonProgressFill: { height: "100%", backgroundColor: C.gold },

  stepTabs: { flexDirection: "row", gap: 6, paddingHorizontal: 16, paddingVertical: 10 },
  stepTab: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(201,162,39,0.08)", borderWidth: 1, borderColor: C.border,
  },
  stepTabActive: { backgroundColor: C.gold, borderColor: C.gold },
  stepTabDone:   { backgroundColor: "rgba(201,162,39,0.15)", borderColor: "rgba(201,162,39,0.3)" },
  stepTabNum:    { fontSize: 12, fontFamily: F.bodySemi, color: C.goldDim },
  stepTabNumActive: { color: C.bg1 },

  lessonScroll:        { flex: 1 },
  lessonScrollContent: { padding: 16 },

  lessonFooter: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: "rgba(201,162,39,0.2)",
    backgroundColor: C.bg1,
  },
  footerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  sentenceCountText: { fontSize: 13, fontFamily: F.body, color: C.goldDim },
  nextStepBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: C.gold, paddingHorizontal: 18, paddingVertical: 11,
    borderRadius: 13,
  },
  nextStepBtnText: { fontSize: 13, fontFamily: F.header, color: C.bg1, letterSpacing: 0.3 },

  stepCompleteCard: {
    marginTop: 32,
    marginHorizontal: 4,
    backgroundColor: C.bg2,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.gold,
    padding: 28,
    alignItems: "center",
    gap: 16,
    shadowColor: C.gold,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  stepCompleteEmoji: { fontSize: 48 },
  stepCompleteTitle: { fontSize: 22, fontFamily: F.header, color: C.gold, letterSpacing: 0.4, textAlign: "center" },
  stepCompleteRudy: {
    backgroundColor: C.bg3,
    borderRadius: 14,
    padding: 16,
    gap: 8,
    width: "100%",
    borderWidth: 1,
    borderColor: C.border,
  },
  stepCompleteRudyTag: { fontSize: 12, fontFamily: F.label, color: C.goldDim, letterSpacing: 0.5 },
  stepCompleteRudyMsg: { fontSize: 15, fontFamily: F.body, color: C.parchment, lineHeight: 22 },
  stepCompleteBtn: {
    marginTop: 8,
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.gold,
    paddingHorizontal: 28, paddingVertical: 14,
    borderRadius: 16,
  },
  stepCompleteBtnText: { fontSize: 16, fontFamily: F.header, color: C.bg1, letterSpacing: 0.3 },
});

const stepContentStyles = StyleSheet.create({
  container: { gap: 20 },
  header: { alignItems: "center", gap: 10, paddingVertical: 20 },
  iconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "rgba(201,162,39,0.12)", borderWidth: 1.5, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  stepTitle: { fontSize: 18, fontFamily: F.header, color: C.gold, letterSpacing: 0.5 },
  stepTopic: { fontSize: 14, fontFamily: F.bodySemi, color: C.parchment },
  stepDesc:  { fontSize: 13, fontFamily: F.body, color: C.goldDim, textAlign: "center", lineHeight: 20, paddingHorizontal: 10 },
  placeholder: {
    backgroundColor: C.bg2, borderRadius: 18, padding: 32,
    borderWidth: 1.5, borderColor: C.border, borderStyle: "dashed" as any,
    alignItems: "center", gap: 12,
  },
  placeholderEmoji: { fontSize: 40 },
  placeholderText:  { fontSize: 13, fontFamily: F.body, color: C.goldDim, textAlign: "center", fontStyle: "italic" },
  demoBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "rgba(201,162,39,0.1)", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.border, justifyContent: "center",
  },
  demoBtnText: { fontSize: 14, fontFamily: F.bodySemi, color: C.gold },
});

const completeStyles = StyleSheet.create({
  scroll: { alignItems: "center", paddingHorizontal: 24, paddingTop: 48, gap: 24 },
  titleEmoji: { fontSize: 64, textAlign: "center" },
  title: { fontSize: 28, fontFamily: F.title, color: C.gold, textAlign: "center", letterSpacing: 2, marginBottom: 4 },
  statsCard: {
    backgroundColor: C.bg2, borderRadius: 20, padding: 22, width: "100%",
    borderWidth: 1.5, borderColor: C.border, gap: 12,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 14, elevation: 6,
  },
  statsTitle: { fontSize: 16, fontFamily: F.header, color: C.parchment, letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: "rgba(201,162,39,0.2)" },
  statRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  statEmoji: { fontSize: 18, width: 26 },
  statLabel: { flex: 1, fontSize: 14, fontFamily: F.body, color: C.goldDim },
  statValue: { fontSize: 15, fontFamily: F.header, color: C.parchment },
  totalXPBadge: {
    backgroundColor: "rgba(201,162,39,0.15)", borderRadius: 16, paddingVertical: 14, paddingHorizontal: 24,
    width: "100%", alignItems: "center", borderWidth: 1.5, borderColor: C.goldDim, gap: 4,
  },
  totalXPLabel: { fontSize: 12, fontFamily: F.label, color: C.goldDim, letterSpacing: 0.5 },
  totalXPValue: { fontSize: 32, fontFamily: F.title, color: C.gold, letterSpacing: 1 },
  grammarCard: {
    backgroundColor: C.bg2, borderRadius: 16, padding: 16, width: "100%", gap: 8,
    borderWidth: 1, borderColor: C.border,
  },
  grammarTitle: { fontSize: 14, fontFamily: F.header, color: C.parchment },
  grammarNote:  { fontSize: 13, fontFamily: F.body, color: C.goldDim, lineHeight: 20 },
  rudySpeech: {
    flexDirection: "row", alignItems: "flex-start", gap: 12, width: "100%",
  },
  rudySpeechEmoji: { fontSize: 40 },
  rudySpeechBubble: {
    flex: 1, backgroundColor: C.bg2, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: C.border,
  },
  rudySpeechText: { fontSize: 14, fontFamily: F.body, color: C.parchment, lineHeight: 21, fontStyle: "italic" },
  buttons: { flexDirection: "row", gap: 12, width: "100%" },
  homeBtn: {
    flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
  },
  homeBtnText: { fontSize: 14, fontFamily: F.bodySemi, color: C.goldDim },
  previewBtn: {
    flex: 1.6, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: C.gold, paddingVertical: 14, borderRadius: 14,
  },
  previewBtnText: { fontSize: 14, fontFamily: F.header, color: C.bg1, letterSpacing: 0.3 },
});
