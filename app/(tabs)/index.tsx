import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
  Animated,
  type GestureResponderEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage, getLevel, getLevelProgress, getLevelName, getEffectiveLearningLanguage, NativeLanguage } from "@/context/LanguageContext";
import { RudyMascot } from "@/components/LingoMascot";
import { LevelUpModal } from "@/components/LevelUpModal";
import { LanguageChangeModal } from "@/components/LanguageChangeModal";
import { RudyGuideModal, getNextGuideIndex } from "@/components/RudyGuideModal";
import { EmojiText } from "@/components/EmojiText";
import { SignInPromoBanner } from "@/components/SignInPromoBanner";
import { useAuth } from "@/context/AuthContext";
import { C, F } from "@/constants/theme";
import {
  loadProgress,
  UNITS,
  getTri,
  langToCode,
  getCefrTierLabel,
  type DailyCourseProgress,
} from "@/lib/dailyCourseData";
import { getDueCount } from "@/lib/srsManager";
import { getTodayNote } from "@/data/culturalNotes";
import { trackLearningEvent } from "@/lib/learningEvents";
import { loadLearnerProfile, setPrimaryLearningGoal, type LearningGoal } from "@/lib/learnerProfile";
import { getSpeakingCountForLanguage, loadTodaySpeakingProgress, SPEAKING_DAILY_GOAL } from "@/lib/speakingProgress";
import {
  getHomeGoalPrompt,
  getHomeLearningGoalOptions,
  getTodaySpeakingMission,
} from "@/lib/homeSpeakingMission";

const { width } = Dimensions.get("window");
const rudyBadgeImg = require("@/assets/rudy_badge.png");

const LANG_FLAGS: Record<NativeLanguage, string> = {
  korean: "🇰🇷", english: "🇬🇧", spanish: "🇪🇸",
};

function RudyImageWithPlaceholder({ source, style, resizeMode }: { source: any; style: any; resizeMode?: any }) {
  const [loaded, setLoaded] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const onLoad = () => {
    setLoaded(true);
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };
  const { width, height } = StyleSheet.flatten(style) as { width: number; height: number };
  return (
    <View style={[style, { overflow: "hidden", justifyContent: "center", alignItems: "center" }]}>
      {!loaded && (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(201,162,39,0.15)", justifyContent: "center", alignItems: "center" }]}>
          <Text style={{ fontSize: 22 }}>🦊</Text>
        </View>
      )}
      <Animated.Image source={source} style={{ width, height, opacity }} resizeMode={resizeMode ?? "cover"} onLoad={onLoad} />
    </View>
  );
}

function getLingoGreeting(lang: NativeLanguage): string {
  const h = new Date().getHours();
  const lines: Record<NativeLanguage, [string, string, string]> = {
    korean:  [
      "좋은 아침이에요! 오늘도 한 문장 말해봐요.",
      "안녕하세요! 오늘 입 밖으로 낼 문장을 골라볼까요?",
      "수고했어요! 마지막으로 한 문장 더 말해봐요.",
    ],
    english: [
      "Good morning! Say one real sentence today.",
      "Hello! Ready to speak out loud?",
      "Great work! Finish with one more sentence.",
    ],
    spanish: [
      "¡Buenos días! Di una frase real hoy.",
      "¡Hola! ¿Listo para hablar en voz alta?",
      "¡Buen trabajo! Termina con una frase más.",
    ],
  };
  const [morning, afternoon, evening] = lines[lang] ?? lines.english;
  if (h < 12) return morning;
  if (h < 18) return afternoon;
  return evening;
}

function getWeekStreakData(streak: number, nativeLang: NativeLanguage) {
  const today = new Date();
  const todayMonIdx = (today.getDay() + 6) % 7;
  const dayLabels: Record<NativeLanguage, string[]> = {
    korean:  ["월", "화", "수", "목", "금", "토", "일"],
    english: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    spanish: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  };
  const labels = dayLabels[nativeLang] ?? dayLabels.english;
  return labels.map((label, i) => {
    const daysAgo = todayMonIdx - i;
    let status: "fire" | "missed" | "future";
    if (daysAgo === 0)       status = "fire";
    else if (daysAgo > 0)    status = daysAgo < streak ? "fire" : "missed";
    else                     status = "future";
    return { label, status, isToday: i === todayMonIdx };
  });
}

function getStreakText(streak: number, lang: NativeLanguage): string {
  const msgs: Record<NativeLanguage, [string, string, string, string]> = {
    korean:  [
      "오늘 한 문장 말하면 연속 기록이 시작돼요.",
      `${streak}일 연속! 오늘도 한 문장만 입 밖으로 내봐요.`,
      `${streak}일 연속! 말한 만큼 몸에 남아요.`,
      `${streak}일 연속! 매일 말한 힘이 쌓이고 있어요.`,
    ],
    english: [
      "Say one sentence today to start your streak.",
      `${streak}-day streak! Say one more sentence today.`,
      `${streak}-day streak! Spoken words stick.`,
      `${streak}-day streak! Your voice is building the habit.`,
    ],
    spanish: [
      "Di una frase hoy para iniciar tu racha.",
      `¡${streak} días seguidos! Di una frase más hoy.`,
      `¡${streak} días seguidos! Lo que dices se queda.`,
      `¡${streak} días seguidos! Tu voz está creando el hábito.`,
    ],
  };
  const m = msgs[lang] ?? msgs.english;
  if (streak === 0) return m[0];
  if (streak < 3)   return m[1];
  if (streak < 7)   return m[2];
  return m[3];
}

function GoldDivider({ label }: { label: string }) {
  return (
    <View style={div.row}>
      <View style={div.line} />
      <Text style={div.label}>✦ {label} ✦</Text>
      <View style={div.line} />
    </View>
  );
}

const div = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, marginTop: 22, marginBottom: 10 },
  line: { flex: 1, height: 1, backgroundColor: C.goldDark },
  label: { fontSize: 11, fontFamily: F.label, color: C.gold, letterSpacing: 1.5 },
});

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { t, stats, nativeLanguage, learningLanguage, pendingLevelUp, clearLevelUp, syncStatus } = useLanguage();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const nativeLang = (nativeLanguage ?? "english") as NativeLanguage;
  const lingoGreeting = getLingoGreeting(nativeLang);
  const lingoMood = stats.streak === 0 ? "sad" : stats.streak >= 7 ? "excited" : "happy";
  const syncLabel = user
    ? syncStatus.status === "error"
      ? nativeLang === "korean" ? "저장 확인 필요" : nativeLang === "spanish" ? "Revisar guardado" : "Save needs check"
      : syncStatus.status === "pending" || syncStatus.status === "syncing"
      ? nativeLang === "korean" ? "저장 중" : nativeLang === "spanish" ? "Guardando" : "Saving"
      : nativeLang === "korean" ? "동기화됨" : nativeLang === "spanish" ? "Sincronizado" : "Synced"
    : nativeLang === "korean" ? "로그인 안 됨" : nativeLang === "spanish" ? "Sin sesión" : "Signed out";

  const level    = getLevel(stats.xp);
  const progress = getLevelProgress(stats.xp);
  const xpInLvl  = stats.xp - level.minXP;
  const xpForLvl = level.num < 5 ? level.maxXP - level.minXP : 1;

  const [courseCompleted, setCourseCompleted] = React.useState<boolean | null>(null);
  const [dailyProgress, setDailyProgress] = React.useState<DailyCourseProgress | null>(null);
  const [showLangModal, setShowLangModal] = React.useState(false);
  const [showGuide, setShowGuide] = React.useState(false);
  const [srsDueCount, setSrsDueCount] = React.useState(0);
  const [primaryGoal, setPrimaryGoal] = React.useState<LearningGoal | null>(null);
  const [spokenToday, setSpokenToday] = React.useState(0);
  const [showMorePractice, setShowMorePractice] = React.useState(false);
  const effectiveLearningLang = getEffectiveLearningLanguage(nativeLang, learningLanguage);

  const xpAnim    = useRef(new Animated.Value(progress)).current;
  const shimmerX  = useRef(new Animated.Value(-200)).current;
  const fireScale = useRef(new Animated.Value(1)).current;
  const flickerOp = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(xpAnim, { toValue: progress, useNativeDriver: false, tension: 40, friction: 8 }).start();
  }, [stats.xp]);

  useEffect(() => {
    const key = `basicCourseCompleted_${effectiveLearningLang}`;
    AsyncStorage.getItem(key).then(v => setCourseCompleted(v === "true"));
  }, [effectiveLearningLang]);

  useFocusEffect(React.useCallback(() => {
    loadProgress().then(setDailyProgress);
    getDueCount().then(setSrsDueCount);
    loadLearnerProfile().then((profile) => setPrimaryGoal(profile.goals[0] ?? null));
    loadTodaySpeakingProgress().then((day) => setSpokenToday(getSpeakingCountForLanguage(day, effectiveLearningLang)));
  }, [effectiveLearningLang]));

  useEffect(() => {
    if (spokenToday <= 0) {
      setShowGuide(false);
      return;
    }
    let cancelled = false;
    getNextGuideIndex().then((idx) => {
      if (!cancelled && idx !== null) setShowGuide(true);
    });
    return () => { cancelled = true; };
  }, [spokenToday]);

  useEffect(() => {
    if (courseCompleted === false) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 800, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [courseCompleted]);

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerX, { toValue: 400, duration: 1600, useNativeDriver: true }),
        Animated.timing(shimmerX, { toValue: -200, duration: 0, useNativeDriver: true }),
        Animated.delay(1000),
      ])
    );
    shimmer.start();

    const flicker = Animated.loop(
      Animated.sequence([
        Animated.timing(flickerOp, { toValue: 0.5, duration: 80,  useNativeDriver: true }),
        Animated.timing(flickerOp, { toValue: 1,   duration: 100, useNativeDriver: true }),
        Animated.timing(flickerOp, { toValue: 0.7, duration: 60,  useNativeDriver: true }),
        Animated.timing(flickerOp, { toValue: 1,   duration: 1200, useNativeDriver: true }),
      ])
    );
    flicker.start();

    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(fireScale, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(fireScale, { toValue: 1,    duration: 600, useNativeDriver: true }),
      ])
    );
    bounce.start();
    return () => { shimmer.stop(); flicker.stop(); bounce.stop(); };
  }, []);

  const barW = xpAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const weekData   = getWeekStreakData(stats.streak, nativeLang);
  const streakText = getStreakText(stats.streak, nativeLang);
  const todaySpeakingMission = getTodaySpeakingMission(nativeLang, effectiveLearningLang, primaryGoal, spokenToday);
  const displayedSpokenToday = Math.min(spokenToday, SPEAKING_DAILY_GOAL);
  const spokenProgressPct = Math.min(100, (spokenToday / SPEAKING_DAILY_GOAL) * 100);
  const spokenProgressLabel = nativeLang === "korean"
    ? `오늘 ${displayedSpokenToday}/${SPEAKING_DAILY_GOAL}문장 말했어요`
    : nativeLang === "spanish"
    ? `Hoy dijiste ${displayedSpokenToday}/${SPEAKING_DAILY_GOAL} frases`
    : `You spoke ${displayedSpokenToday}/${SPEAKING_DAILY_GOAL} sentences today`;
  const shouldFocusSpeaking = !todaySpeakingMission.dailyGoalMet;
  const showSecondaryHomeSections = !shouldFocusSpeaking || showMorePractice;
  const morePracticeTitle = showMorePractice
    ? nativeLang === "korean" ? "다시 말하기에 집중하기" : nativeLang === "spanish" ? "Volver a enfocarme en hablar" : "Refocus on speaking"
    : nativeLang === "korean" ? "다른 학습도 보기" : nativeLang === "spanish" ? "Ver otras prácticas" : "Show other practice";
  const morePracticeSub = nativeLang === "korean"
    ? "오늘의 실제 문장을 먼저 입 밖으로 꺼내고, 필요하면 복습과 스토리로 이어가요."
    : nativeLang === "spanish"
    ? "Primero di tus frases reales de hoy. Después puedes repasar, jugar historia o hablar con NPCs."
    : "Say today's real sentences first. Then review, story, and NPC practice stay one tap away.";

  useEffect(() => {
    void trackLearningEvent("first_speaking_cta_seen", {
      surface: "home",
      nativeLanguage: nativeLang,
      targetLanguage: todaySpeakingMission.targetLanguage,
      goal: todaySpeakingMission.goal,
      dailyGoalMet: todaySpeakingMission.dailyGoalMet,
    });
  }, [nativeLang, todaySpeakingMission.dailyGoalMet, todaySpeakingMission.goal, todaySpeakingMission.targetLanguage]);

  const handleHomeGoalSelect = async (goal: LearningGoal, event?: GestureResponderEvent) => {
    event?.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrimaryGoal(goal);
    await setPrimaryLearningGoal(goal).catch((err: unknown) => console.warn("[Home] learner goal save failed:", err));
    void trackLearningEvent("learning_goal_selected", {
      surface: "home",
      nativeLanguage: nativeLang,
      targetLanguage: todaySpeakingMission.targetLanguage,
      goal,
    });
  };

  const storyLabel = nativeLang === "korean" ? "스토리 모드" : nativeLang === "spanish" ? "Modo Historia" : "Story Mode";
  const storyDesc  = nativeLang === "korean" ? "이야기 속에서 말하고 풀기" : nativeLang === "spanish" ? "Habla dentro de la historia" : "Speak inside the story";

  const writingLabel = nativeLang === "korean" ? "내 문장 만들기" : nativeLang === "spanish" ? "Mis frases" : "My Sentences";
  const writingDesc  = nativeLang === "korean" ? "내가 쓸 말을 문장으로 만들기" : nativeLang === "spanish" ? "Crea frases que usarías" : "Build sentences you would use";
  // Keep the quick entry aligned with the core promise: speak real sentences
  // with Rudy first; pronunciation scoring is the feedback layer underneath.
  const speakLabel = nativeLang === "korean" ? "루디와 말하기"
    : nativeLang === "spanish" ? "Habla con Rudy"
    : "Speak with Rudy";
  const speakDesc = nativeLang === "korean" ? "말하면 Rudy가 바로 다듬어줘요"
    : nativeLang === "spanish" ? "Habla y Rudy te ayuda al instante"
    : "Speak, then Rudy shapes it";

  const quickItems = [
    {
      icon: "albums",
      color: C.gold,
      label: nativeLang === "korean" ? "다시 만날 문장" : nativeLang === "spanish" ? "Frases para repetir" : "Repeat Sentences",
      desc: nativeLang === "korean" ? "잊을 때쯤 다시 말해요" : nativeLang === "spanish" ? "Vuelve a decirlas cuando toca" : "Say them again when they are due",
      route: "/(tabs)/cards",
    },
    {
      icon: "chatbubbles",
      color: "#7eb8c9",
      label: nativeLang === "korean" ? "대화하기" : nativeLang === "spanish" ? "Conversar" : "Conversation",
      desc: nativeLang === "korean" ? "실제로 할 말을 짧게 주고받기" : nativeLang === "spanish" ? "Intercambia frases que usarías" : "Trade short lines you would use",
      route: "/(tabs)/chat",
    },
    { icon: "mic",         color: "#9b8bb4", label: speakLabel,        desc: speakDesc,                route: "/(tabs)/speak"  },
    { icon: "book",        color: "#c97b27", label: storyLabel,         desc: storyDesc,               route: "/(tabs)/story"  },
    { icon: "pencil",      color: "#e8a87c", label: writingLabel,       desc: writingDesc,             route: "/writing-practice" },
  ];

  // 3 stat cards: streak / words / XP. Accuracy was a dead field (no code
  // path updated it — it always rendered 0%), so we removed it. If/when we
  // wire up a real rolling-average accuracy metric, drop it back in here.
  const statItems = [
    { label: nativeLang === "korean" ? "연속학습일" : nativeLang === "spanish" ? "Racha" : "Streak",   value: `${stats.streak}🔥` },
    { label: nativeLang === "korean" ? "단어"       : nativeLang === "spanish" ? "Palabras" : "Words", value: `${stats.wordsLearned}` },
    { label: nativeLang === "korean" ? "경험치"     : nativeLang === "spanish" ? "XP" : "XP",          value: `${stats.xp}`           },
  ];

  const missionLabel  = nativeLang === "korean" ? "오늘의 말하기 · 10분" : nativeLang === "spanish" ? "Hablar hoy · 10 min" : "Today's Speaking · 10 min";
  const npcMissionLabel = nativeLang === "korean" ? "실전 미션" : nativeLang === "spanish" ? "Misión Real" : "Real Mission";
  const npcMissionDesc  = nativeLang === "korean" ? "NPC와 실제 상황 문장을 주고받아요" : nativeLang === "spanish" ? "Habla con NPC en situaciones reales" : "Speak real situation lines with NPCs";

  return (
    <>
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
    >
      {/* ── HEADER ─────────────────────────────────────── */}
      <LinearGradient
        colors={[C.bg1, C.bg2]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting} numberOfLines={1}>{lingoGreeting}</Text>
            <EmojiText style={styles.headerTitle} numberOfLines={1}>Enigma ✨</EmojiText>
            <View style={[styles.syncChip, syncStatus.status === "error" && styles.syncChipError]}>
              <Ionicons
                name={user ? (syncStatus.status === "error" ? "cloud-offline-outline" : "cloud-done-outline") : "cloud-outline"}
                size={12}
                color={syncStatus.status === "error" ? "#f3a0a0" : C.goldDim}
              />
              <Text style={[styles.syncChipText, syncStatus.status === "error" && styles.syncChipTextError]} numberOfLines={1}>
                {syncLabel}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable
              onPress={() => router.push("/settings")}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 8, margin: -8 })}
              accessibilityRole="button"
              accessibilityLabel={nativeLang === "korean" ? "설정" : nativeLang === "spanish" ? "Ajustes" : "Settings"}
              hitSlop={8}
            >
              <Ionicons name="settings-outline" size={22} color={C.goldDim} />
            </Pressable>
            <RudyImageWithPlaceholder
              source={rudyBadgeImg}
              style={styles.lingoHeader}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Level badge + Language change row */}
        <View style={styles.levelRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelEmoji}>{level.emoji}</Text>
            <Text style={styles.levelName}>{getLevelName(level, nativeLang)}</Text>
            <View style={styles.levelDot} />
            <Text style={styles.levelNum}>{t("level")} {level.num}</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.langChip, pressed && { opacity: 0.75 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowLangModal(true); }}
          >
            <Text style={styles.langChipText}>
              {LANG_FLAGS[nativeLang]} → {LANG_FLAGS[effectiveLearningLang]}
            </Text>
            <Text style={styles.langChipEdit}>
              {nativeLang === "korean" ? "변경" : nativeLang === "spanish" ? "Cambiar" : "Change"}
            </Text>
          </Pressable>
        </View>

        {/* XP bar with shimmer */}
        <View style={styles.xpSection}>
          <View style={styles.xpTrack}>
            <Animated.View style={[styles.xpFill, { width: barW }]}>
              <Animated.View
                style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}
              />
            </Animated.View>
          </View>
          <Text style={styles.xpLabel}>
            {level.num < 5
              ? `${xpInLvl} / ${xpForLvl} XP`
              : `${stats.xp} XP · ${getLevelName(level, nativeLang)} ${level.emoji}`}
          </Text>
        </View>

        {/* Decorative bottom border */}
        <View style={styles.headerBorder} />
      </LinearGradient>

      {/* ── SIGN-IN PROMO BANNER (smart-trigger: only when signed out + value earned) */}
      <SignInPromoBanner />

      {/* ── TODAY'S FIRST SPEAKING MISSION ────────────── */}
      <View style={styles.pad}>
        <Pressable
          style={({ pressed }) => [styles.todaySpeechCard, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            void trackLearningEvent("first_speaking_cta_pressed", {
              surface: "home",
              nativeLanguage: nativeLang,
              targetLanguage: todaySpeakingMission.targetLanguage,
              goal: todaySpeakingMission.goal,
              dailyGoalMet: todaySpeakingMission.dailyGoalMet,
            });
            if (todaySpeakingMission.dailyGoalMet) {
              router.push("/(tabs)/speak" as any);
            } else {
              router.push({
                pathname: "/(tabs)/speak",
                params: {
                  mission: "first-sentence",
                  goal: todaySpeakingMission.goal ?? "",
                  targetLang: todaySpeakingMission.targetLanguage,
                },
              } as any);
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={`${todaySpeakingMission.eyebrow}. ${todaySpeakingMission.phrase}. ${todaySpeakingMission.button}`}
        >
          <LinearGradient
            colors={["rgba(201,162,39,0.16)", "rgba(126,184,201,0.10)"]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.todaySpeechTop}>
            <View style={styles.todaySpeechIcon}>
              <Ionicons name={todaySpeakingMission.dailyGoalMet ? "checkmark-circle" : "mic"} size={22} color={C.bg1} />
            </View>
            <View style={styles.todaySpeechCopy}>
              <Text style={styles.todaySpeechEyebrow}>{todaySpeakingMission.eyebrow}</Text>
              <Text style={styles.todaySpeechTitle}>{todaySpeakingMission.title}</Text>
            </View>
          </View>

          <View style={styles.todayPhraseBox}>
            <Text style={styles.todayPhrase} numberOfLines={1} adjustsFontSizeToFit>
              {todaySpeakingMission.phrase}
            </Text>
            <Text style={styles.todayMeaning}>{todaySpeakingMission.meaning}</Text>
          </View>

          <Text style={styles.todaySpeechContext}>{todaySpeakingMission.context}</Text>
          <View style={styles.todayRudyTip}>
            <Ionicons name="sparkles" size={14} color={C.gold} />
            <Text style={styles.todayRudyTipText}>{todaySpeakingMission.rudyTip}</Text>
          </View>
          <View style={styles.todayGoalPicker}>
            <Text style={styles.todayGoalPrompt}>{getHomeGoalPrompt(nativeLang)}</Text>
            <View style={styles.todayGoalChips}>
              {getHomeLearningGoalOptions(nativeLang).map((option) => {
                const active = primaryGoal === option.key;
                return (
                  <Pressable
                    key={option.key}
                    style={({ pressed }) => [
                      styles.todayGoalChip,
                      active && styles.todayGoalChipActive,
                      pressed && { opacity: 0.82 },
                    ]}
                    onPress={(event) => { void handleHomeGoalSelect(option.key, event); }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${getHomeGoalPrompt(nativeLang)}: ${option.label}`}
                  >
                    <Text style={[styles.todayGoalChipText, active && styles.todayGoalChipTextActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={styles.todaySpeechProgress}>
            <View style={styles.todaySpeechProgressTop}>
              <Text style={styles.todaySpeechProgressText}>{spokenProgressLabel}</Text>
              <Text style={styles.todaySpeechProgressGoal}>
                {nativeLang === "korean" ? "목표 19" : nativeLang === "spanish" ? "Meta 19" : "Goal 19"}
              </Text>
            </View>
            <View style={styles.todaySpeechProgressTrack}>
              <View style={[styles.todaySpeechProgressFill, { width: `${spokenProgressPct}%` }]} />
            </View>
          </View>
          <View style={styles.todaySpeechButton}>
            <Text style={styles.todaySpeechButtonText}>{todaySpeakingMission.button}</Text>
            <Ionicons name="arrow-forward" size={14} color={C.bg1} />
          </View>
        </Pressable>
      </View>

      {shouldFocusSpeaking && (
        <View style={styles.pad}>
          <Pressable
            style={({ pressed }) => [styles.morePracticeGate, pressed && { opacity: 0.82 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowMorePractice((v) => !v);
            }}
            accessibilityRole="button"
            accessibilityState={{ expanded: showMorePractice }}
            accessibilityLabel={morePracticeTitle}
          >
            <View style={styles.morePracticeGateIcon}>
              <Ionicons name={showMorePractice ? "chevron-up" : "chevron-down"} size={18} color={C.gold} />
            </View>
            <View style={styles.morePracticeGateText}>
              <Text style={styles.morePracticeGateTitle}>{morePracticeTitle}</Text>
              <Text style={styles.morePracticeGateSub}>{morePracticeSub}</Text>
            </View>
          </Pressable>
        </View>
      )}

      {showSecondaryHomeSections && (
      <>
      {/* ── STATS ROW ─────────────────────────────────── */}
      <View style={styles.statsRow}>
        {statItems.map((s, i) => (
          <View key={i} style={styles.statCard}>
            <EmojiText style={styles.statValue}>{s.value}</EmojiText>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ── STREAK CARD ───────────────────────────────── */}
      <GoldDivider label={nativeLang === "korean" ? "연속 학습" : nativeLang === "spanish" ? "RACHA DIARIA" : "DAILY STREAK"} />
      <View style={styles.pad}>
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <View style={styles.streakLeft}>
              <RudyMascot size={100} mood={lingoMood} />
              <View>
                <Animated.View style={{ transform: [{ scale: fireScale }] }}>
                  <Animated.Text style={[styles.streakCount, { opacity: flickerOp }]}>
                    {stats.streak}
                  </Animated.Text>
                </Animated.View>
                <Text style={styles.streakLabel}>
                  {nativeLang === "korean" ? "일 연속 학습" : nativeLang === "spanish" ? "días seguidos" : "day streak"}
                </Text>
              </View>
            </View>
            <View style={styles.streakBadge}>
              <Ionicons name="trophy" size={14} color={C.gold} />
              <Text style={styles.streakBadgeText}>
                {nativeLang === "korean" ? "최고 기록" : nativeLang === "spanish" ? "Récord" : "Best"}
              </Text>
            </View>
          </View>

          {/* Weekly calendar */}
          <View style={styles.weekRow}>
            {weekData.map((d, i) => (
              <View key={i} style={styles.dayCol}>
                <Text style={[styles.dayLabel, d.isToday && styles.dayLabelToday]}>{d.label}</Text>
                {d.status === "fire" ? (
                  <View style={[styles.dayCircle, styles.dayCircleFire]}>
                    <Animated.Text style={[styles.dayEmoji, { opacity: d.isToday ? flickerOp : 1 }]}>🔥</Animated.Text>
                  </View>
                ) : d.status === "missed" ? (
                  <View style={[styles.dayCircle, styles.dayCircleMissed]}>
                    <Text style={styles.dayEmojiSmall}>✕</Text>
                  </View>
                ) : (
                  <View style={[styles.dayCircle, styles.dayCircleFuture]} />
                )}
              </View>
            ))}
          </View>

          <View style={styles.streakMotivation}>
            <EmojiText style={styles.streakMotivationText}>{streakText}</EmojiText>
          </View>
        </View>
      </View>

      {/* ── BASIC COURSE PILL ─────────────────────────── */}
      {courseCompleted !== null && (
        <View style={styles.basicCourseRow}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              style={({ pressed }) => [
                styles.basicCoursePill,
                courseCompleted && styles.basicCoursePillDone,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push((courseCompleted ? "/basic-course?review=1" : "/basic-course") as any);
              }}
            >
              <Text style={styles.basicCoursePillText}>
                {courseCompleted
                  ? (nativeLang === "korean" ? "📚  기초 과정 복습" : nativeLang === "spanish" ? "📚  Repasar curso" : "📚  Review Course")
                  : (nativeLang === "korean" ? "📚  기초 과정 시작" : nativeLang === "spanish" ? "📚  Curso básico" : "📚  Basic Course")}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      )}

      {/* ── SRS REVIEW BANNER ─────────────────────────── */}
      {srsDueCount > 0 && (
        <View style={styles.pad}>
          <Pressable
            style={({ pressed }) => [styles.srsBanner, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              // F6 fix: pass `deck=srs` so the Cards tab forces the SRS
              // deck regardless of what the user toggled on a previous
              // visit. Without this, the auto-switch only fires on first
              // mount, so a user who toggled to "초급" then came back via
              // this banner would land on the static deck — not the
              // review screen the banner promised.
              router.push({ pathname: "/(tabs)/cards", params: { deck: "srs" } } as any);
            }}
          >
            <Text style={styles.srsBannerEmoji}>🦊</Text>
            <View style={styles.srsBannerText}>
              <Text style={styles.srsBannerTitle}>
                {nativeLang === "korean"
                  ? "루디가 복습 카드를 준비했어요!"
                  : nativeLang === "spanish"
                  ? "¡Rudy preparó tarjetas de repaso!"
                  : "Rudy prepared review cards for you!"}
              </Text>
              <Text style={styles.srsBannerSub}>
                {nativeLang === "korean"
                  ? `${srsDueCount}장의 카드가 복습을 기다리고 있어요`
                  : nativeLang === "spanish"
                  ? `${srsDueCount} tarjetas esperan tu repaso`
                  : `${srsDueCount} cards are waiting for review`}
              </Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={24} color={C.gold} />
          </Pressable>
        </View>
      )}

      {/* ── DAILY TRAINING CARD (루디의 훈련소) ─────────── */}
      <GoldDivider label={missionLabel} />
      <View style={[styles.pad, { marginTop: 0 }]}>
        <RudyTrainingCard
          nativeLang={nativeLang}
          dailyProgress={dailyProgress}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/rudy-course" as any);
          }}
        />
      </View>

      {/* ── NPC REAL MISSION ──────────────────────────── */}
      <GoldDivider label={npcMissionLabel} />
      <View style={[styles.pad, { marginTop: 0 }]}>
        <Pressable
          style={({ pressed }) => [styles.npcMissionCard, pressed && { transform: [{ scale: 0.985 }] }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/npc-list" as any);
          }}
        >
          <View style={styles.npcMissionContent}>
            <View style={styles.npcMissionTop}>
              <View style={styles.npcMissionEmojis}>
                <Text style={styles.npcEmoji}>☕</Text>
                <Text style={styles.npcEmoji}>🏨</Text>
                <Text style={styles.npcEmoji}>🏥</Text>
                <Text style={styles.npcEmoji}>💼</Text>
              </View>
              <View style={styles.xpPill}>
                <Text style={styles.xpPillText}>23 NPCs</Text>
              </View>
            </View>
            <Text style={styles.npcMissionTitle}>{npcMissionDesc}</Text>
            <View style={styles.npcMissionBtn}>
              <Text style={styles.npcMissionBtnText}>
                {nativeLang === "korean" ? "NPC 선택" : nativeLang === "spanish" ? "Elegir NPC" : "Choose NPC"}
              </Text>
              <Ionicons name="arrow-forward" size={13} color={C.bg1} />
            </View>
          </View>
          <Text style={styles.npcMissionBg}>🕵️</Text>
        </Pressable>
      </View>

      {/* ── FEATURE SHORTCUTS (Stats, Achievements, Leaderboard) ── */}
      <GoldDivider label={nativeLang === "korean" ? "나의 성장" : nativeLang === "spanish" ? "MI PROGRESO" : "MY PROGRESS"} />
      <View style={styles.pad}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            style={({ pressed }) => [styles.featureCard, pressed && { opacity: 0.85 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/stats-dashboard" as any); }}
          >
            <Text style={{ fontSize: 24 }}>📊</Text>
            <Text style={styles.featureLabel}>
              {nativeLang === "korean" ? "학습 통계" : nativeLang === "spanish" ? "Estadísticas" : "Stats"}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.featureCard, pressed && { opacity: 0.85 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/achievements" as any); }}
          >
            <Text style={{ fontSize: 24 }}>🏆</Text>
            <Text style={styles.featureLabel}>
              {nativeLang === "korean" ? "업적" : nativeLang === "spanish" ? "Logros" : "Achievements"}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.featureCard, pressed && { opacity: 0.85 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/leaderboard" as any); }}
          >
            <Text style={{ fontSize: 24 }}>🥇</Text>
            <Text style={styles.featureLabel}>
              {nativeLang === "korean" ? "리더보드" : nativeLang === "spanish" ? "Ranking" : "Leaderboard"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── TODAY'S CULTURAL NOTE ── */}
      <CulturalNoteSection nativeLang={nativeLang} learningLang={effectiveLearningLang} />

      {/* ── QUICK PRACTICE ────────────────────────────── */}
      <GoldDivider label={nativeLang === "korean" ? "빠른 학습" : nativeLang === "spanish" ? "PRÁCTICA RÁPIDA" : "QUICK PRACTICE"} />
      <View style={styles.pad}>
        <View style={styles.quickList}>
          {quickItems.map((item, idx) => (
            <Pressable
              key={idx}
              style={({ pressed }) => [styles.quickCard, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(item.route as any);
              }}
            >
              <View style={[styles.quickIconWrap, { borderColor: item.color + "88" }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={styles.quickText}>
                <Text style={styles.quickLabel}>{item.label}</Text>
                <Text style={styles.quickDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={C.goldDark} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ height: 120 }} />
      </>
      )}
      {!showSecondaryHomeSections && <View style={{ height: 120 }} />}
    </ScrollView>

    <LevelUpModal
      visible={!!pendingLevelUp}
      level={pendingLevelUp ?? { num: 2, emoji: "📚", name: "초보자", nameEn: "Novice", nameEs: "Novato", minXP: 101, maxXP: 300 }}
      lang={nativeLang}
      onClose={clearLevelUp}
    />
    <LanguageChangeModal visible={showLangModal} onClose={() => setShowLangModal(false)} />
    <RudyGuideModal visible={showGuide} lang={nativeLang} onClose={() => setShowGuide(false)} />
    </>
  );
}

// ── CulturalNoteSection ──────────────────────────────────────────────────────
function CulturalNoteSection({ nativeLang, learningLang }: { nativeLang: string; learningLang: string }) {
  const learningCode = learningLang === "korean" ? "ko" : learningLang === "spanish" ? "es" : "en";
  const note = getTodayNote(learningCode);
  const lc = nativeLang === "korean" ? "ko" : nativeLang === "spanish" ? "es" : "en";
  const sectionLabel = nativeLang === "korean" ? "오늘의 문화 노트" : nativeLang === "spanish" ? "NOTA CULTURAL" : "CULTURAL NOTE";

  return (
    <>
      <GoldDivider label={sectionLabel} />
      <View style={styles.pad}>
        <View style={styles.cultureCard}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Text style={{ fontSize: 22 }}>{note.icon}</Text>
            <Text style={styles.cultureTitle}>{note.title[lc] || note.title.en}</Text>
          </View>
          <Text style={styles.cultureContent} numberOfLines={4}>
            {note.content[lc] || note.content.en}
          </Text>
        </View>
      </View>
    </>
  );
}

// ── RudyTrainingCard ──────────────────────────────────────────────────────────

function RudyTrainingCard({
  nativeLang, dailyProgress, onPress,
}: {
  nativeLang: string;
  dailyProgress: DailyCourseProgress | null;
  onPress: () => void;
}) {
  const lc = langToCode(nativeLang);
  const trainingLabel = nativeLang === "korean" ? "루디의 훈련소" : nativeLang === "spanish" ? "Campamento de Rudy" : "Rudy's Training Camp";
  const startLabel    = nativeLang === "korean" ? "10분 훈련 시작 →" : nativeLang === "spanish" ? "10 min, comenzar →" : "Start 10-min Training →";
  const doneMsg       = nativeLang === "korean" ? "10분 훈련 완료! 내일 봐, 파트너! 🦊"
    : nativeLang === "spanish" ? "¡10 min completados! ¡Hasta mañana! 🦊"
    : "10 min done! See you tomorrow, partner! 🦊";

  if (!dailyProgress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.dailyCard, pressed && { transform: [{ scale: 0.985 }] }]}
        onPress={onPress}
      >
        <View style={styles.dailyContent}>
          <View style={styles.dailyTopRow}>
            <View style={styles.dailyPill}>
              <Text style={styles.dailyPillText}>🦊</Text>
              <Text style={styles.dailyPillLabel}>{trainingLabel}</Text>
            </View>
            <View style={styles.xpPill}>
              <Text style={styles.xpPillText}>+100 XP</Text>
            </View>
          </View>
          <Text style={styles.dailyTitle}>{startLabel}</Text>
        </View>
        <Text style={styles.dailyBookEmoji}>🦊</Text>
      </Pressable>
    );
  }

  const todayDone = dailyProgress.todayCompleted ?? false;
  const currentUnit = UNITS[dailyProgress.currentUnitIndex ?? 0] ?? UNITS[0];
  const currentDay = currentUnit.days[dailyProgress.currentDayIndex ?? 0] ?? currentUnit.days[0];
  const steps = dailyProgress.todayStepsCompleted ?? { listenRepeat: false, keyPoint: false, missionTalk: false, review: false };
  const stepsCompleted = Object.values(steps).filter(Boolean).length;
  const totalSteps = 4;

  // Show Korean tier names (입문/기초/실전/심화) on the Korean home;
  // international users keep CEFR codes that are familiar to them.
  const tierLabel = getCefrTierLabel(currentUnit.level, nativeLang);
  const levelLabel = `${tierLabel} · ${getTri(currentUnit.title, lc)}`;

  const dayLabel = nativeLang === "korean"
    ? `Day ${currentDay.dayNumber}: ${getTri(currentDay.topic, lc)}`
    : `Day ${currentDay.dayNumber}: ${getTri(currentDay.topic, lc)}`;

  // progress bar blocks
  const blocks = Array.from({ length: totalSteps }, (_, i) => i < stepsCompleted);

  return (
    <Pressable
      style={({ pressed }) => [styles.dailyCard, pressed && { transform: [{ scale: 0.985 }] }]}
      onPress={onPress}
    >
      <View style={styles.dailyContent}>
        <View style={styles.dailyTopRow}>
          <View style={styles.dailyPill}>
            <Text style={styles.dailyPillText}>🦊</Text>
            <Text style={styles.dailyPillLabel}>{trainingLabel}</Text>
          </View>
          <View style={styles.xpPill}>
            <EmojiText style={styles.xpPillText}>{todayDone ? "✅ +100 XP" : "+100 XP"}</EmojiText>
          </View>
        </View>

        {todayDone ? (
          <EmojiText style={[styles.dailyTitle, { color: "#5a9", fontSize: 14 }]}>{doneMsg}</EmojiText>
        ) : (
          <>
            <Text style={styles.dailyTitle}>{dayLabel}</Text>
            <Text style={{ fontSize: 11, fontFamily: F.label, color: C.goldDim }}>{levelLabel}</Text>
            <View style={styles.rudyStepBar}>
              {blocks.map((filled, i) => (
                <View key={i} style={[styles.rudyStepBlock, filled && styles.rudyStepBlockFilled]} />
              ))}
              <Text style={styles.rudyStepLabel}>{nativeLang === "korean" ? "단계" : nativeLang === "spanish" ? "PASO" : "STEP"} {stepsCompleted}/{totalSteps}</Text>
            </View>
          </>
        )}

        {!todayDone && (
          <View style={styles.dailyBtn}>
            <Text style={styles.dailyBtnText}>{startLabel}</Text>
            <Ionicons name="arrow-forward" size={14} color={C.bg1} />
          </View>
        )}
      </View>
      <Text style={styles.dailyBookEmoji}>🦊</Text>
    </Pressable>
  );
}

const DAY_COL_W = Math.floor((width - 48 - 12) / 7);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg1 },

  /* ─ HEADER ─ */
  header: { paddingHorizontal: 20, paddingBottom: 22 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  greeting: { fontSize: 14, fontFamily: F.body, color: C.goldDim, fontStyle: "italic", marginBottom: 4 },
  headerTitle: { fontSize: 30, fontFamily: F.title, color: C.gold, letterSpacing: 3 },
  syncChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "rgba(201,162,39,0.08)",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.18)",
    maxWidth: 150,
  },
  syncChipError: {
    backgroundColor: "rgba(180,70,70,0.12)",
    borderColor: "rgba(220,90,90,0.28)",
  },
  syncChipText: { fontSize: 10, fontFamily: F.bodySemi, color: C.goldDim },
  syncChipTextError: { color: "#f3a0a0" },
  lingoHeader: {
    width: 72, height: 72, borderRadius: 36,
    overflow: "hidden",
    borderWidth: 2, borderColor: C.gold,
    marginLeft: 8,
  },
  levelRow: { marginBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  levelBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(201,162,39,0.12)",
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, alignSelf: "flex-start",
  },
  levelEmoji: { fontSize: 13 },
  levelName:  { fontSize: 13, fontFamily: F.bodySemi, color: C.gold },
  levelDot:   { width: 3, height: 3, borderRadius: 1.5, backgroundColor: C.goldDark },
  levelNum:   { fontSize: 12, fontFamily: F.body, color: C.goldDim },
  langChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(201,162,39,0.08)",
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  langChipText: { fontSize: 14, color: C.parchment },
  langChipEdit: { fontSize: 11, fontFamily: F.label, color: C.gold, letterSpacing: 0.3 },

  /* XP bar */
  xpSection: { gap: 5 },
  xpTrack:   { height: 8, backgroundColor: "rgba(201,162,39,0.15)", borderRadius: 4, overflow: "hidden", borderWidth: 0.5, borderColor: C.border },
  xpFill:    { height: "100%", backgroundColor: C.gold, borderRadius: 4, overflow: "hidden" },
  shimmer:   {
    position: "absolute", top: 0, left: 0, width: 80, height: "100%",
    backgroundColor: "rgba(255,255,255,0.35)",
    transform: [{ skewX: "-20deg" }],
  },
  xpLabel:   { fontSize: 11, fontFamily: F.body, color: C.goldDim },
  headerBorder: { marginTop: 16, height: 1, backgroundColor: C.gold, opacity: 0.4 },

  /* ─ TODAY SPEAKING MISSION ─ */
  todaySpeechCard: {
    marginTop: 14,
    backgroundColor: C.bg2,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(201,162,39,0.42)",
    padding: 18,
    overflow: "hidden",
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  todaySpeechTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  todaySpeechIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  todaySpeechCopy: { flex: 1 },
  todaySpeechEyebrow: {
    fontSize: 11,
    fontFamily: F.label,
    color: C.gold,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  todaySpeechTitle: {
    marginTop: 3,
    fontSize: 18,
    fontFamily: F.header,
    color: C.parchment,
    lineHeight: 24,
  },
  todayPhraseBox: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.32)",
    backgroundColor: "rgba(14,10,18,0.42)",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  todayPhrase: {
    fontSize: 30,
    fontFamily: F.title,
    color: C.gold,
    lineHeight: 38,
    textAlign: "center",
  },
  todayMeaning: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: F.body,
    color: C.goldDim,
    textAlign: "center",
  },
  todaySpeechContext: {
    marginTop: 12,
    fontSize: 13,
    fontFamily: F.body,
    color: C.parchmentDark,
    lineHeight: 19,
  },
  todayRudyTip: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.22)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: "rgba(201,162,39,0.08)",
  },
  todayRudyTipText: {
    flex: 1,
    fontSize: 12,
    fontFamily: F.bodySemi,
    color: C.parchment,
    lineHeight: 17,
  },
  todayGoalPicker: {
    marginTop: 12,
    gap: 8,
  },
  todayGoalPrompt: {
    fontSize: 11,
    fontFamily: F.label,
    color: C.goldDim,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  todayGoalChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  todayGoalChip: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.28)",
    backgroundColor: "rgba(201,162,39,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 30,
    justifyContent: "center",
  },
  todayGoalChipActive: {
    borderColor: C.gold,
    backgroundColor: C.gold,
  },
  todayGoalChipText: {
    fontSize: 11,
    fontFamily: F.bodySemi,
    color: C.parchment,
  },
  todayGoalChipTextActive: {
    color: C.bg1,
  },
  todaySpeechProgress: {
    marginTop: 12,
    gap: 7,
  },
  todaySpeechProgressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  todaySpeechProgressText: {
    flex: 1,
    fontSize: 12,
    fontFamily: F.bodySemi,
    color: C.parchment,
  },
  todaySpeechProgressGoal: {
    fontSize: 11,
    fontFamily: F.label,
    color: C.goldDim,
    letterSpacing: 0.5,
  },
  todaySpeechProgressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(201,162,39,0.14)",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.18)",
  },
  todaySpeechProgressFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: C.gold,
  },
  todaySpeechButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
    backgroundColor: C.gold,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  todaySpeechButtonText: {
    fontSize: 13,
    fontFamily: F.header,
    color: C.bg1,
    letterSpacing: 0.4,
  },

  morePracticeGate: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.28)",
    borderRadius: 14,
    padding: 12,
    backgroundColor: "rgba(201,162,39,0.07)",
  },
  morePracticeGateIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(201,162,39,0.12)",
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.24)",
  },
  morePracticeGateText: {
    flex: 1,
    minWidth: 0,
  },
  morePracticeGateTitle: {
    fontSize: 13,
    fontFamily: F.bodySemi,
    color: C.gold,
    marginBottom: 2,
  },
  morePracticeGateSub: {
    fontSize: 11,
    fontFamily: F.body,
    color: C.goldDim,
    lineHeight: 16,
  },

  /* ─ STATS ─ */
  statsRow: {
    flexDirection: "row", paddingHorizontal: 16, paddingTop: 14, gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.parchment,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    gap: 2,
    borderWidth: 1,
    borderColor: C.parchmentDeep,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: { fontSize: 17, fontFamily: F.bodyBold, color: C.textParchment },
  statLabel: { fontSize: 10, fontFamily: F.label, color: C.goldDark, letterSpacing: 0.5, textAlign: "center" },

  /* ─ SHARED ─ */
  pad: { paddingHorizontal: 16, marginTop: 4 },

  /* ─ SRS BANNER ─ */
  srsBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "rgba(201,162,39,0.1)",
    borderWidth: 1.5, borderColor: "rgba(201,162,39,0.3)",
    borderRadius: 16, padding: 14,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3,
  },
  srsBannerEmoji: { fontSize: 28 },
  srsBannerText: { flex: 1 },
  srsBannerTitle: { fontSize: 14, fontFamily: F.header, color: C.gold, lineHeight: 20 },
  srsBannerSub: { fontSize: 12, fontFamily: F.body, color: C.goldDim, marginTop: 2 },

  /* ─ STREAK CARD ─ */
  streakCard: {
    backgroundColor: C.parchment,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: C.parchmentDeep,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  streakHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  streakLeft:   { flexDirection: "row", alignItems: "center", gap: 12 },
  streakCount:  { fontSize: 36, fontFamily: F.title, color: C.textParchment, lineHeight: 40 },
  streakLabel:  { fontSize: 13, fontFamily: F.body, color: C.goldDark, marginTop: 2 },
  streakBadge:  {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(139,105,20,0.12)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
    borderWidth: 1, borderColor: C.goldDark,
  },
  streakBadgeText: { fontSize: 11, fontFamily: F.bodySemi, color: C.goldDark },
  weekRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  dayCol:  { width: DAY_COL_W, alignItems: "center", gap: 5 },
  dayLabel: { fontSize: 10, fontFamily: F.label, color: "#a08060", letterSpacing: 0.5 },
  dayLabelToday: { color: C.textParchment, fontFamily: F.bodyBold },
  dayCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  dayCircleFire:   { backgroundColor: "rgba(201,162,39,0.2)", borderWidth: 1, borderColor: C.gold },
  dayCircleMissed: { backgroundColor: "rgba(100,60,30,0.08)" },
  dayCircleFuture: { backgroundColor: "rgba(100,60,30,0.05)", borderWidth: 1, borderColor: "#c0a060", borderStyle: "dashed" as any },
  dayEmoji:      { fontSize: 18 },
  dayEmojiSmall: { fontSize: 12, color: "#b09060" },
  streakMotivation: {
    backgroundColor: "rgba(139,105,20,0.08)",
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: "rgba(201,162,39,0.2)",
  },
  streakMotivationText: { fontSize: 13, fontFamily: F.body, color: C.textParchment, textAlign: "center", fontStyle: "italic" },

  /* ─ DAILY MISSION ─ */
  dailyCard: {
    backgroundColor: C.bg2,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.gold,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  dailyContent: { flex: 1, gap: 12 },
  dailyTopRow:  { flexDirection: "row", alignItems: "center", gap: 8 },
  dailyPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(201,162,39,0.12)", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12, borderWidth: 1, borderColor: C.border,
  },
  dailyPillText:  { fontSize: 12 },
  dailyPillLabel: { fontSize: 11, fontFamily: F.bodySemi, color: C.gold },
  xpPill: {
    backgroundColor: "rgba(201,162,39,0.15)", paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 10, borderWidth: 1, borderColor: C.border,
  },
  xpPillText: { fontSize: 11, fontFamily: F.header, color: C.gold },
  dailyTitle: { fontSize: 17, fontFamily: F.bodyBold, color: C.parchment, lineHeight: 24, maxWidth: 200, fontStyle: "italic" },
  dailyBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: C.gold, paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 12, alignSelf: "flex-start",
  },
  dailyBtnText: { fontSize: 13, fontFamily: F.header, color: C.bg1, letterSpacing: 0.5 },
  dailyBookEmoji: { fontSize: 52, marginLeft: 8 },

  /* ─ RUDY STEP BAR ─ */
  rudyStepBar: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  rudyStepBlock: {
    width: 22, height: 8, borderRadius: 4,
    backgroundColor: "rgba(201,162,39,0.18)", borderWidth: 0.5, borderColor: C.border,
  },
  rudyStepBlockFilled: { backgroundColor: C.gold },
  rudyStepLabel: { fontSize: 10, fontFamily: F.label, color: C.goldDim, marginLeft: 4 },

  /* ─ NPC MISSION CARD ─ */
  npcMissionCard: {
    backgroundColor: C.bg2,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(201,162,39,0.5)",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#c9a227",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  npcMissionContent: { flex: 1, gap: 10 },
  npcMissionTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  npcMissionEmojis: { flexDirection: "row", gap: 4 },
  npcEmoji: { fontSize: 20 },
  npcMissionTitle: { fontSize: 15, fontFamily: F.bodyBold, color: C.parchment, lineHeight: 22, maxWidth: 200 },
  npcMissionBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(201,162,39,0.85)", paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, alignSelf: "flex-start",
  },
  npcMissionBtnText: { fontSize: 12, fontFamily: F.header, color: C.bg1, letterSpacing: 0.5 },
  npcMissionBg: { fontSize: 48, marginLeft: 8, opacity: 0.7 },

  /* ─ QUICK PRACTICE ─ */
  quickList: { gap: 10 },
  quickCard: {
    backgroundColor: C.bg2,
    borderRadius: 16, padding: 14,
    flexDirection: "row", alignItems: "center", gap: 14,
    borderWidth: 1, borderColor: C.border,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2,
  },
  quickIconWrap: { width: 46, height: 46, borderRadius: 13, justifyContent: "center", alignItems: "center", borderWidth: 1, backgroundColor: "rgba(201,162,39,0.08)" },
  quickText:     { flex: 1 },
  quickLabel:    { fontSize: 15, fontFamily: F.bodySemi, color: C.parchment, marginBottom: 2 },
  quickDesc:     { fontSize: 12, fontFamily: F.body, color: C.goldDim, fontStyle: "italic" },

  basicCourseRow: {
    alignItems: "center",
    paddingVertical: 10,
  },
  basicCoursePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.gold,
    backgroundColor: "rgba(201,162,39,0.10)",
  },
  basicCoursePillDone: {
    borderColor: "rgba(201,162,39,0.45)",
    backgroundColor: "rgba(201,162,39,0.07)",
  },
  basicCoursePillText: {
    fontSize: 13,
    fontFamily: F.bodySemi,
    color: C.gold,
    letterSpacing: 0.2,
  },
  featureCard: {
    flex: 1,
    backgroundColor: C.bg3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  featureLabel: {
    fontFamily: F.bodySemi,
    fontSize: 11,
    color: C.goldDim,
    textAlign: "center",
  },
  cultureCard: {
    backgroundColor: C.bg3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  cultureTitle: {
    flex: 1,
    fontFamily: F.bodySemi,
    fontSize: 15,
    color: C.parchment,
  },
  cultureContent: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.parchmentDark,
    lineHeight: 19,
  },
});
