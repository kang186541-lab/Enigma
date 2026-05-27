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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useLanguage,
  getLevel,
  getLevelName,
  getEffectiveLearningLanguage,
  NativeLanguage,
} from "@/context/LanguageContext";
import { LevelUpModal } from "@/components/LevelUpModal";
import { LanguageChangeModal } from "@/components/LanguageChangeModal";
import { RudyGuideModal, getNextGuideIndex } from "@/components/RudyGuideModal";
import { EmojiText } from "@/components/EmojiText";
import { SignInPromoBanner } from "@/components/SignInPromoBanner";
import { useAuth } from "@/context/AuthContext";
import { C, F } from "@/constants/theme";
import { getDueCount } from "@/lib/srsManager";
import { getTodayNote } from "@/data/culturalNotes";
import { trackLearningEvent } from "@/lib/learningEvents";
import { loadLearnerProfile } from "@/lib/learnerProfile";
import {
  getSpeakingCountForLanguage,
  loadTodaySpeakingProgress,
  SPEAKING_DAILY_GOAL,
} from "@/lib/speakingProgress";
import { loadProgress, type DailyCourseProgress } from "@/lib/dailyCourseData";
import { getHeroCopy } from "@/lib/heroCopy";

const { width } = Dimensions.get("window");

// ─── DAILY SENTENCE STUB ──────────────────────────────────────────────────────
// Picks one beginner sentence per (learningLang, day-of-year mod 7). Each
// language has 7 sentences; the same day-of-week picks the same sentence for
// everyone so day-X feels consistent. Two extra difficulty bands (7 sentences
// each) are reserved for later — they're stored here so the stub matches the
// "21-sentence array per learning language" plan in the spec.
// TODO(goal-personalisation): replace with goal/profile-driven selection.
type DailySentence = {
  /** What the user is asked to say, in `learningLang`. */
  text: string;
  /** Same line translated into `nativeLang`. */
  meaning: Record<NativeLanguage, string>;
  /** Light pronunciation guide / romanization (optional). */
  hint?: string;
  /** "Day N" stamp shown on the hero card. */
  day: number;
};

const DAILY_SENTENCES: Record<NativeLanguage, DailySentence[][]> = {
  // Sentences someone is LEARNING `korean` should say in Korean.
  korean: [
    // Beginner band — used today.
    [
      {
        text: "안녕하세요, 만나서 반갑습니다.",
        hint: "annyeonghaseyo, mannaseo bangapseumnida",
        meaning: {
          korean: "안녕하세요, 만나서 반갑습니다.",
          english: "Hello, nice to meet you.",
          spanish: "Hola, encantado de conocerte.",
        },
        day: 1,
      },
      {
        text: "커피 한 잔 주세요.",
        hint: "keopi han jan juseyo",
        meaning: {
          korean: "커피 한 잔 주세요.",
          english: "One coffee, please.",
          spanish: "Un café, por favor.",
        },
        day: 2,
      },
      {
        text: "이거 얼마예요?",
        hint: "igeo eolmayeyo",
        meaning: {
          korean: "이거 얼마예요?",
          english: "How much is this?",
          spanish: "¿Cuánto cuesta esto?",
        },
        day: 3,
      },
      {
        text: "화장실은 어디예요?",
        hint: "hwajangsireun eodiyeyo",
        meaning: {
          korean: "화장실은 어디예요?",
          english: "Where is the bathroom?",
          spanish: "¿Dónde está el baño?",
        },
        day: 4,
      },
      {
        text: "다시 말씀해 주세요.",
        hint: "dasi malsseumhae juseyo",
        meaning: {
          korean: "다시 말씀해 주세요.",
          english: "Could you say that again?",
          spanish: "¿Puede repetirlo, por favor?",
        },
        day: 5,
      },
      {
        text: "저는 한국어를 배우고 있어요.",
        hint: "jeoneun hangugeoreul baeugo isseoyo",
        meaning: {
          korean: "저는 한국어를 배우고 있어요.",
          english: "I am learning Korean.",
          spanish: "Estoy aprendiendo coreano.",
        },
        day: 6,
      },
      {
        text: "오늘 정말 즐거웠어요.",
        hint: "oneul jeongmal jeulgeowosseoyo",
        meaning: {
          korean: "오늘 정말 즐거웠어요.",
          english: "Today was really fun.",
          spanish: "Hoy lo pasé muy bien.",
        },
        day: 7,
      },
    ],
    [], // intermediate — reserved
    [], // advanced — reserved
  ],
  english: [
    [
      {
        text: "Hi, nice to meet you.",
        meaning: {
          korean: "안녕하세요, 만나서 반갑습니다.",
          english: "Hi, nice to meet you.",
          spanish: "Hola, encantado de conocerte.",
        },
        day: 1,
      },
      {
        text: "Could I get one coffee, please?",
        meaning: {
          korean: "커피 한 잔 주세요.",
          english: "Could I get one coffee, please?",
          spanish: "¿Me da un café, por favor?",
        },
        day: 2,
      },
      {
        text: "How much does this cost?",
        meaning: {
          korean: "이거 얼마예요?",
          english: "How much does this cost?",
          spanish: "¿Cuánto cuesta esto?",
        },
        day: 3,
      },
      {
        text: "Where is the restroom?",
        meaning: {
          korean: "화장실은 어디예요?",
          english: "Where is the restroom?",
          spanish: "¿Dónde está el baño?",
        },
        day: 4,
      },
      {
        text: "Could you say that again?",
        meaning: {
          korean: "다시 말씀해 주세요.",
          english: "Could you say that again?",
          spanish: "¿Puede repetirlo, por favor?",
        },
        day: 5,
      },
      {
        text: "I am learning English.",
        meaning: {
          korean: "저는 영어를 배우고 있어요.",
          english: "I am learning English.",
          spanish: "Estoy aprendiendo inglés.",
        },
        day: 6,
      },
      {
        text: "I had a really good day today.",
        meaning: {
          korean: "오늘 정말 즐거웠어요.",
          english: "I had a really good day today.",
          spanish: "Hoy lo pasé muy bien.",
        },
        day: 7,
      },
    ],
    [],
    [],
  ],
  spanish: [
    [
      {
        text: "Hola, encantado de conocerte.",
        meaning: {
          korean: "안녕하세요, 만나서 반갑습니다.",
          english: "Hello, nice to meet you.",
          spanish: "Hola, encantado de conocerte.",
        },
        day: 1,
      },
      {
        text: "Un café, por favor.",
        meaning: {
          korean: "커피 한 잔 주세요.",
          english: "One coffee, please.",
          spanish: "Un café, por favor.",
        },
        day: 2,
      },
      {
        text: "¿Cuánto cuesta esto?",
        meaning: {
          korean: "이거 얼마예요?",
          english: "How much is this?",
          spanish: "¿Cuánto cuesta esto?",
        },
        day: 3,
      },
      {
        text: "¿Dónde está el baño?",
        meaning: {
          korean: "화장실은 어디예요?",
          english: "Where is the bathroom?",
          spanish: "¿Dónde está el baño?",
        },
        day: 4,
      },
      {
        text: "¿Puede repetirlo, por favor?",
        meaning: {
          korean: "다시 말씀해 주세요.",
          english: "Could you say that again?",
          spanish: "¿Puede repetirlo, por favor?",
        },
        day: 5,
      },
      {
        text: "Estoy aprendiendo español.",
        meaning: {
          korean: "저는 스페인어를 배우고 있어요.",
          english: "I am learning Spanish.",
          spanish: "Estoy aprendiendo español.",
        },
        day: 6,
      },
      {
        text: "Hoy lo pasé muy bien.",
        meaning: {
          korean: "오늘 정말 즐거웠어요.",
          english: "I had a really good day today.",
          spanish: "Hoy lo pasé muy bien.",
        },
        day: 7,
      },
    ],
    [],
    [],
  ],
};

function getTodaysSentence(learningLang: NativeLanguage): DailySentence | null {
  // Use day-of-year so a given calendar day picks the same sentence for all
  // users; mod 7 because we only have 7 beginner sentences right now.
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) / 86_400_000;
  const dayOfYear = Math.floor(diff);
  const bank = DAILY_SENTENCES[learningLang]?.[0]; // beginner band
  if (!bank || bank.length === 0) return null;
  return bank[dayOfYear % bank.length];
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const LANG_FLAGS: Record<NativeLanguage, string> = {
  korean: "🇰🇷",
  english: "🇬🇧",
  spanish: "🇪🇸",
};

function parseLocalHomeDate(key: string | null): Date | null {
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function dayDiff(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return Math.round((b - a) / 86_400_000);
}

function getActiveStreak(streak: number, lastSessionDate: string | null): number {
  const last = parseLocalHomeDate(lastSessionDate);
  if (!last) return 0;
  const daysSince = dayDiff(last, new Date());
  return daysSince <= 1 ? streak : 0;
}

function getLingoGreeting(lang: NativeLanguage): string {
  const h = new Date().getHours();
  const lines: Record<NativeLanguage, [string, string, string]> = {
    korean: [
      "좋은 아침이에요.",
      "안녕하세요.",
      "오늘도 수고했어요.",
    ],
    english: [
      "Good morning.",
      "Hello.",
      "Great work today.",
    ],
    spanish: [
      "Buenos días.",
      "Hola.",
      "Buen trabajo hoy.",
    ],
  };
  const [morning, afternoon, evening] = lines[lang] ?? lines.english;
  if (h < 12) return morning;
  if (h < 18) return afternoon;
  return evening;
}

// Hero-card title + CTA copy now live in lib/heroCopy.ts so the brand
// promise stays in lockstep across onboarding, home, and the sign-in modal.
// The day-stamp stays local because it is bound to the daily-sentence
// rotation in this file.
function getHeroDayBadge(nativeLang: NativeLanguage, day: number): string {
  switch (nativeLang) {
    case "korean":
      return `Day ${day} · 기초`;
    case "spanish":
      return `Día ${day} · Básico`;
    default:
      return `Day ${day} · Basics`;
  }
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    t,
    stats,
    nativeLanguage,
    learningLanguage,
    pendingLevelUp,
    clearLevelUp,
    syncStatus,
  } = useLanguage();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const nativeLang = (nativeLanguage ?? "english") as NativeLanguage;
  const effectiveLearningLang = getEffectiveLearningLanguage(nativeLang, learningLanguage);
  const lingoGreeting = getLingoGreeting(nativeLang);
  const level = getLevel(stats.xp);

  const [showLangModal, setShowLangModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [srsDueCount, setSrsDueCount] = useState(0);
  const [spokenToday, setSpokenToday] = useState(0);
  const [lastSessionDate, setLastSessionDate] = useState<string | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyCourseProgress | null>(null);

  // One slow pulse on the Rudy mascot inside the hero. Everything else on this
  // screen stays still — the spec asks for one animation max.
  const rudyPulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(rudyPulse, { toValue: 1.05, duration: 1400, useNativeDriver: true }),
        Animated.timing(rudyPulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [rudyPulse]);

  const refreshHomeProgress = React.useCallback(() => {
    getDueCount().then(setSrsDueCount).catch(() => setSrsDueCount(0));
    loadTodaySpeakingProgress()
      .then((day) => setSpokenToday(getSpeakingCountForLanguage(day, effectiveLearningLang)))
      .catch(() => setSpokenToday(0));
    AsyncStorage.getItem("@lingua_last_session_date").then(setLastSessionDate).catch(() => {});
    loadProgress().then(setDailyProgress).catch(() => setDailyProgress(null));
    // Touch the learner profile so downstream surfaces stay warm even though
    // Home itself no longer renders the goal picker.
    void loadLearnerProfile().catch(() => {});
  }, [effectiveLearningLang]);

  useFocusEffect(refreshHomeProgress);

  useEffect(() => {
    if (!syncStatus.lastSyncedAt) return;
    refreshHomeProgress();
  }, [refreshHomeProgress, syncStatus.lastSyncedAt]);

  // Re-read local state when the signed-in user changes (sign-in/out, account
  // switch). The flip in `user?.id` is the authoritative signal before the
  // sync notification lands.
  useEffect(() => {
    refreshHomeProgress();
  }, [user?.id, refreshHomeProgress]);

  useEffect(() => {
    if (spokenToday <= 0) {
      setShowGuide(false);
      return;
    }
    let cancelled = false;
    getNextGuideIndex().then((idx) => {
      if (!cancelled && idx !== null) setShowGuide(true);
    });
    return () => {
      cancelled = true;
    };
  }, [spokenToday]);

  const activeStreak = getActiveStreak(stats.streak, lastSessionDate);
  // Single source of truth for the brand promise. heroCopy.ts pins the
  // "5 minutes / first sentence with Rudy" message per (native, learning)
  // pair so this hero stays in lockstep with onboarding and the sign-in
  // modal. The local DAILY_SENTENCES bank still drives the day-by-day
  // rotation, but the stub default falls back to heroCopy.firstSentence /
  // firstSentenceMeaning if a learning language has no bank entries yet.
  const heroCopy = getHeroCopy(nativeLang, effectiveLearningLang);
  const dailySentence = getTodaysSentence(effectiveLearningLang);
  const sentence: DailySentence = dailySentence ?? {
    text: heroCopy.firstSentence,
    meaning: {
      korean: heroCopy.firstSentenceMeaning,
      english: heroCopy.firstSentenceMeaning,
      spanish: heroCopy.firstSentenceMeaning,
    },
    day: 1,
  };
  const sentenceMeaning = dailySentence
    ? sentence.meaning[nativeLang] ?? sentence.meaning.english
    : heroCopy.firstSentenceMeaning;
  const heroTitle = heroCopy.promiseTitle;
  const heroCta = heroCopy.cta;
  const dayBadge = getHeroDayBadge(nativeLang, sentence.day);

  // Telemetry — fire once per visit when the hero CTA is visible so the
  // existing learning_events pipeline keeps getting first-speaking signals.
  useEffect(() => {
    void trackLearningEvent("first_speaking_cta_seen", {
      surface: "home",
      nativeLanguage: nativeLang,
      targetLanguage: effectiveLearningLang,
      goal: null,
      dailyGoalMet: spokenToday >= SPEAKING_DAILY_GOAL,
    });
  }, [nativeLang, effectiveLearningLang, spokenToday]);

  const syncLabel = user
    ? syncStatus.status === "error"
      ? nativeLang === "korean"
        ? "저장 확인 필요"
        : nativeLang === "spanish"
          ? "Revisar guardado"
          : "Save needs check"
      : syncStatus.status === "pending" || syncStatus.status === "syncing"
        ? nativeLang === "korean"
          ? "저장 중"
          : nativeLang === "spanish"
            ? "Guardando"
            : "Saving"
        : nativeLang === "korean"
          ? "동기화됨"
          : nativeLang === "spanish"
            ? "Sincronizado"
            : "Synced"
    : nativeLang === "korean"
      ? "로그인 안 됨"
      : nativeLang === "spanish"
        ? "Sin sesión"
        : "Signed out";

  // ─── compact stats strip ───
  const statItems: { label: string; value: string }[] = [
    {
      label: nativeLang === "korean" ? "연속" : nativeLang === "spanish" ? "Racha" : "Streak",
      value: activeStreak > 0 ? `${activeStreak}🔥` : "0",
    },
    {
      label: nativeLang === "korean" ? "오늘 말함" : nativeLang === "spanish" ? "Hoy" : "Today",
      value: `${Math.min(spokenToday, SPEAKING_DAILY_GOAL)}/${SPEAKING_DAILY_GOAL}`,
    },
    {
      label: nativeLang === "korean" ? "경험치" : "XP",
      value: `${stats.xp}`,
    },
  ];

  // ─── secondary tiles (4 equal-width cards) ───
  type SecondaryTile = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    route: string;
    badge?: string;
  };
  const secondaryTiles: SecondaryTile[] = [
    {
      icon: "book-outline",
      label: nativeLang === "korean" ? "스토리" : nativeLang === "spanish" ? "Historia" : "Story",
      route: "/(tabs)/story",
    },
    {
      icon: "fitness-outline",
      label:
        nativeLang === "korean" ? "훈련소" : nativeLang === "spanish" ? "Entrenar" : "Training",
      route: "/rudy-course",
    },
    {
      icon: "albums-outline",
      label: nativeLang === "korean" ? "복습" : nativeLang === "spanish" ? "Repaso" : "Review",
      route: "/(tabs)/cards",
      badge: srsDueCount > 0 ? `${srsDueCount}` : undefined,
    },
    {
      icon: "chatbubbles-outline",
      label:
        nativeLang === "korean" ? "NPC 대화" : nativeLang === "spanish" ? "NPC" : "NPC Talk",
      route: "/npc-list",
    },
  ];

  // ─── My Growth row (3 small tiles) ───
  const growthTiles: SecondaryTile[] = [
    {
      icon: "stats-chart-outline",
      label:
        nativeLang === "korean" ? "통계" : nativeLang === "spanish" ? "Stats" : "Stats",
      route: "/stats-dashboard",
    },
    {
      icon: "trophy-outline",
      label:
        nativeLang === "korean" ? "업적" : nativeLang === "spanish" ? "Logros" : "Achievements",
      route: "/achievements",
    },
    {
      icon: "medal-outline",
      label:
        nativeLang === "korean"
          ? "리더보드"
          : nativeLang === "spanish"
            ? "Ranking"
            : "Leaderboard",
      route: "/leaderboard",
    },
  ];

  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        {/* ── SLIM HEADER ─────────────────────────────────────────── */}
        <View style={[styles.header, { paddingTop: topPad + 10 }]}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.greeting} numberOfLines={1}>
                {lingoGreeting}
              </Text>
              <EmojiText style={styles.headerTitle} numberOfLines={1}>
                Enigma ✨
              </EmojiText>
            </View>
            <Pressable
              onPress={() => router.push("/settings")}
              style={({ pressed }) => [
                styles.headerIcon,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                nativeLang === "korean"
                  ? "설정"
                  : nativeLang === "spanish"
                    ? "Ajustes"
                    : "Settings"
              }
              hitSlop={8}
            >
              <Ionicons name="settings-outline" size={22} color={C.goldDim} />
            </Pressable>
          </View>
          <View style={[styles.syncChip, syncStatus.status === "error" && styles.syncChipError]}>
            <Ionicons
              name={
                user
                  ? syncStatus.status === "error"
                    ? "cloud-offline-outline"
                    : "cloud-done-outline"
                  : "cloud-outline"
              }
              size={11}
              color={syncStatus.status === "error" ? "#f3a0a0" : C.goldDim}
            />
            <Text
              style={[
                styles.syncChipText,
                syncStatus.status === "error" && styles.syncChipTextError,
              ]}
              numberOfLines={1}
            >
              {syncLabel}
            </Text>
          </View>
        </View>

        {/* ── SIGN-IN PROMO (only renders when signed out + value earned) ── */}
        <SignInPromoBanner />

        {/* ── HERO: today's sentence ──────────────────────────────── */}
        <View style={styles.heroWrap}>
          <Pressable
            style={({ pressed }) => [
              styles.heroCard,
              pressed && { opacity: 0.94, transform: [{ scale: 0.995 }] },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              void trackLearningEvent("first_speaking_cta_pressed", {
                surface: "home",
                nativeLanguage: nativeLang,
                targetLanguage: effectiveLearningLang,
                goal: null,
                dailyGoalMet: spokenToday >= SPEAKING_DAILY_GOAL,
              });
              router.push("/(tabs)/speak" as any);
            }}
            accessibilityRole="button"
            accessibilityLabel={`${heroTitle}. ${sentence.text}. ${heroCta}`}
          >
            <LinearGradient
              colors={["rgba(201,162,39,0.18)", "rgba(44,24,16,0.4)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroTopRow}>
              <View style={styles.heroDayBadge}>
                <Text style={styles.heroDayBadgeText}>{dayBadge}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.langSwap, pressed && { opacity: 0.7 }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowLangModal(true);
                }}
                hitSlop={6}
              >
                <Text style={styles.langSwapText}>
                  {LANG_FLAGS[nativeLang]} → {LANG_FLAGS[effectiveLearningLang]}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.heroEyebrow}>{heroTitle}</Text>

            <View style={styles.heroSentenceBox}>
              <Text style={styles.heroSentence} adjustsFontSizeToFit numberOfLines={3}>
                {sentence.text}
              </Text>
              {sentence.hint ? <Text style={styles.heroHint}>{sentence.hint}</Text> : null}
              <Text style={styles.heroMeaning} numberOfLines={2}>
                {sentenceMeaning}
              </Text>
            </View>

            <View style={styles.heroBottomRow}>
              <Animated.View style={[styles.rudyAvatar, { transform: [{ scale: rudyPulse }] }]}>
                <EmojiText style={styles.rudyAvatarEmoji}>🦊</EmojiText>
              </Animated.View>
              <View style={styles.heroCta}>
                <Text style={styles.heroCtaText}>{heroCta}</Text>
                <Ionicons name="mic" size={15} color={C.bg1} />
              </View>
            </View>
          </Pressable>
        </View>

        {/* ── COMPACT STATS STRIP ─────────────────────────────────── */}
        <View style={styles.statsStrip}>
          <Pressable
            onLongPress={() => router.push("/stats-dashboard" as any)}
            style={({ pressed }) => [styles.statChip, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel={`${statItems[0].label}: ${statItems[0].value}`}
          >
            <EmojiText style={styles.statValue}>{statItems[0].value}</EmojiText>
            <Text style={styles.statLabel}>{statItems[0].label}</Text>
          </Pressable>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{statItems[1].value}</Text>
            <Text style={styles.statLabel}>{statItems[1].label}</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{statItems[2].value}</Text>
            <Text style={styles.statLabel}>{statItems[2].label}</Text>
          </View>
          <View style={[styles.statChip, styles.statChipLevel]}>
            <EmojiText style={styles.statValueSm}>{level.emoji}</EmojiText>
            <Text style={styles.statLabelSm}>
              {t("level")} {level.num}
            </Text>
          </View>
        </View>

        {/* ── SECONDARY SURFACES (4 tiles) ────────────────────────── */}
        <View style={styles.tilesRow}>
          {secondaryTiles.map((tile) => (
            <Pressable
              key={tile.label}
              style={({ pressed }) => [
                styles.tile,
                pressed && { opacity: 0.82, transform: [{ scale: 0.97 }] },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(tile.route as any);
              }}
              accessibilityRole="button"
              accessibilityLabel={tile.label}
            >
              <View style={styles.tileIconWrap}>
                <Ionicons name={tile.icon} size={20} color={C.gold} />
                {tile.badge ? (
                  <View style={styles.tileBadge}>
                    <Text style={styles.tileBadgeText}>{tile.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.tileLabel} numberOfLines={1}>
                {tile.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── MY GROWTH (3 small tiles) ───────────────────────────── */}
        <Text style={styles.sectionLabel}>
          {nativeLang === "korean"
            ? "나의 성장"
            : nativeLang === "spanish"
              ? "Mi progreso"
              : "My Growth"}
        </Text>
        <View style={styles.growthRow}>
          {growthTiles.map((tile) => (
            <Pressable
              key={tile.label}
              style={({ pressed }) => [
                styles.growthTile,
                pressed && { opacity: 0.82 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(tile.route as any);
              }}
              accessibilityRole="button"
              accessibilityLabel={tile.label}
            >
              <Ionicons name={tile.icon} size={18} color={C.goldDim} />
              <Text style={styles.growthTileLabel} numberOfLines={1}>
                {tile.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── CULTURAL NOTE (untouched) ───────────────────────────── */}
        <CulturalNoteSection nativeLang={nativeLang} learningLang={effectiveLearningLang} />

        {/* Keep `dailyProgress` referenced so the focus-effect refresh still
            primes the in-memory cache for downstream screens. */}
        {dailyProgress ? null : null}

        <View style={{ height: 100 }} />
      </ScrollView>

      <LevelUpModal
        visible={!!pendingLevelUp}
        level={
          pendingLevelUp ?? {
            num: 2,
            emoji: "📚",
            name: "초보자",
            nameEn: "Novice",
            nameEs: "Novato",
            minXP: 101,
            maxXP: 300,
          }
        }
        lang={nativeLang}
        onClose={clearLevelUp}
      />
      <LanguageChangeModal
        visible={showLangModal}
        onClose={() => setShowLangModal(false)}
      />
      <RudyGuideModal
        visible={showGuide}
        lang={nativeLang}
        onClose={() => setShowGuide(false)}
      />
    </>
  );
}

// ─── CULTURAL NOTE ───────────────────────────────────────────────────────────
function CulturalNoteSection({
  nativeLang,
  learningLang,
}: {
  nativeLang: NativeLanguage;
  learningLang: NativeLanguage;
}) {
  const learningCode =
    learningLang === "korean" ? "ko" : learningLang === "spanish" ? "es" : "en";
  const note = getTodayNote(learningCode);
  const lc = nativeLang === "korean" ? "ko" : nativeLang === "spanish" ? "es" : "en";
  const sectionLabel =
    nativeLang === "korean"
      ? "오늘의 문화 노트"
      : nativeLang === "spanish"
        ? "Nota cultural"
        : "Cultural note";

  return (
    <>
      <Text style={styles.sectionLabel}>{sectionLabel}</Text>
      <View style={styles.pad}>
        <View style={styles.cultureCard}>
          <View style={styles.cultureHead}>
            <EmojiText style={{ fontSize: 22 }}>{note.icon}</EmojiText>
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

// ─── STYLES ──────────────────────────────────────────────────────────────────
const TILE_GAP = 10;
const TILE_W = Math.floor((width - 32 - TILE_GAP * 3) / 4);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg1 },

  /* HEADER (slim, ~3rem) */
  header: { paddingHorizontal: 20, paddingBottom: 10 },
  headerRow: { flexDirection: "row", alignItems: "center" },
  greeting: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.goldDim,
    fontStyle: "italic",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: F.title,
    color: C.gold,
    letterSpacing: 2.5,
  },
  headerIcon: { padding: 8, margin: -8 },
  syncChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "rgba(201,162,39,0.08)",
    borderWidth: 1,
    borderColor: C.border,
    maxWidth: 160,
  },
  syncChipError: {
    backgroundColor: "rgba(180,70,70,0.12)",
    borderColor: "rgba(220,90,90,0.28)",
  },
  syncChipText: { fontSize: 10, fontFamily: F.bodySemi, color: C.goldDim },
  syncChipTextError: { color: "#f3a0a0" },

  /* HERO */
  heroWrap: { paddingHorizontal: 16, marginTop: 12 },
  heroCard: {
    backgroundColor: C.bg2,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(201,162,39,0.5)",
    padding: 20,
    overflow: "hidden",
    minHeight: 320,
    justifyContent: "space-between",
    gap: 16,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroDayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(201,162,39,0.16)",
    borderWidth: 1,
    borderColor: C.border,
  },
  heroDayBadgeText: {
    fontSize: 11,
    fontFamily: F.label,
    color: C.gold,
    letterSpacing: 0.8,
  },
  langSwap: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(201,162,39,0.08)",
  },
  langSwapText: { fontSize: 13, color: C.parchment },
  heroEyebrow: {
    fontSize: 13,
    fontFamily: F.bodySemi,
    color: C.goldDim,
    letterSpacing: 0.4,
  },
  heroSentenceBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(14,10,18,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 6,
  },
  heroSentence: {
    fontSize: 26,
    fontFamily: F.title,
    color: C.gold,
    lineHeight: 34,
    textAlign: "center",
  },
  heroHint: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.goldDim,
    fontStyle: "italic",
    textAlign: "center",
  },
  heroMeaning: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.parchmentDark,
    textAlign: "center",
    marginTop: 2,
  },
  heroBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rudyAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: C.gold,
    backgroundColor: "rgba(201,162,39,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  rudyAvatarEmoji: { fontSize: 24 },
  heroCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.gold,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  heroCtaText: {
    fontSize: 14,
    fontFamily: F.header,
    color: C.bg1,
    letterSpacing: 0.5,
  },

  /* STATS STRIP */
  statsStrip: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 8,
  },
  statChip: {
    flex: 1,
    backgroundColor: "rgba(201,162,39,0.06)",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
    gap: 1,
  },
  statChipLevel: { backgroundColor: "rgba(201,162,39,0.1)" },
  statValue: { fontSize: 15, fontFamily: F.bodyBold, color: C.parchment },
  statValueSm: { fontSize: 13 },
  statLabel: {
    fontSize: 9,
    fontFamily: F.label,
    color: C.goldDim,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  statLabelSm: {
    fontSize: 9,
    fontFamily: F.label,
    color: C.goldDim,
    letterSpacing: 0.4,
  },

  /* SECONDARY 4-TILES */
  tilesRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 14,
    gap: TILE_GAP,
  },
  tile: {
    width: TILE_W,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    backgroundColor: C.bg2,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 4,
  },
  tileIconWrap: {
    position: "relative",
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  tileBadge: {
    position: "absolute",
    top: -6,
    right: -10,
    minWidth: 18,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 9,
    backgroundColor: C.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  tileBadgeText: {
    fontSize: 9,
    fontFamily: F.bodyBold,
    color: C.bg1,
    letterSpacing: 0.2,
  },
  tileLabel: {
    fontSize: 11,
    fontFamily: F.bodySemi,
    color: C.parchment,
    textAlign: "center",
  },

  /* SECTION LABEL */
  sectionLabel: {
    fontSize: 11,
    fontFamily: F.label,
    color: C.gold,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    paddingHorizontal: 18,
    marginTop: 22,
    marginBottom: 8,
  },

  /* MY GROWTH ROW */
  growthRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },
  growthTile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(201,162,39,0.04)",
  },
  growthTileLabel: {
    flex: 1,
    fontSize: 11,
    fontFamily: F.bodySemi,
    color: C.goldDim,
  },

  /* SHARED */
  pad: { paddingHorizontal: 16 },

  /* CULTURE */
  cultureCard: {
    backgroundColor: C.bg3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  cultureHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
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
