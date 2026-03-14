import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage, getLevel, getLevelProgress, NativeLanguage } from "@/context/LanguageContext";
import { RudyMascot } from "@/components/LingoMascot";
import { LevelUpModal } from "@/components/LevelUpModal";
import { C, F } from "@/constants/theme";
import {
  loadProgress,
  UNITS,
  getTri,
  langToCode,
  type DailyCourseProgress,
} from "@/lib/dailyCourseData";

const { width } = Dimensions.get("window");
const rudyBadgeImg = require("@/assets/rudy_badge.png");

function getGreeting(t: (k: string) => string) {
  const h = new Date().getHours();
  if (h < 12) return t("good_morning");
  if (h < 18) return t("good_afternoon");
  return t("good_evening");
}

function getLingoGreeting(lang: NativeLanguage): string {
  const h = new Date().getHours();
  const lines: Record<NativeLanguage, [string, string, string]> = {
    korean:  [
      "좋은 아침이에요! 오늘도 같이 공부해요! 🦊",
      "안녕하세요! 오늘 학습 시작할까요? 🦊",
      "수고했어요! 오늘의 학습을 마무리해요! 🦊",
    ],
    english: [
      "Good morning! Let's study together! 🦊",
      "Hello! Ready to learn today? 🦊",
      "Great work! Let's finish today's lesson! 🦊",
    ],
    spanish: [
      "¡Buenos días! ¡Estudiemos juntos! 🦊",
      "¡Hola! ¿Listos para aprender hoy? 🦊",
      "¡Bien hecho! ¡Terminemos la lección! 🦊",
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
      "오늘 학습으로 연속 기록을 시작하세요! 💪",
      `${streak}일 연속! 오늘도 학습하세요! 🔥`,
      `${streak}일 연속! 멈추지 마세요! 🚀`,
      `${streak}일 연속! 정말 대단해요! 🏆`,
    ],
    english: [
      "Study today to start your streak! 💪",
      `${streak}-day streak! Keep going! 🔥`,
      `${streak}-day streak! You're on fire! 🚀`,
      `${streak}-day streak! Incredible! 🏆`,
    ],
    spanish: [
      "¡Estudia hoy para iniciar tu racha! 💪",
      `¡${streak} días seguidos! ¡Sigue así! 🔥`,
      `¡${streak} días seguidos! ¡En llamas! 🚀`,
      `¡${streak} días seguidos! ¡Increíble! 🏆`,
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
  const { t, stats, nativeLanguage, learningLanguage, pendingLevelUp, clearLevelUp } = useLanguage();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const nativeLang = (nativeLanguage ?? "english") as NativeLanguage;
  const lingoGreeting = getLingoGreeting(nativeLang);
  const lingoMood = stats.streak === 0 ? "sad" : stats.streak >= 7 ? "excited" : "happy";

  const level    = getLevel(stats.xp);
  const progress = getLevelProgress(stats.xp);
  const xpInLvl  = stats.xp - level.minXP;
  const xpForLvl = level.num < 5 ? level.maxXP - level.minXP : 1;

  const [courseCompleted, setCourseCompleted] = React.useState<boolean | null>(null);
  const [dailyProgress, setDailyProgress] = React.useState<DailyCourseProgress | null>(null);

  const xpAnim    = useRef(new Animated.Value(progress)).current;
  const shimmerX  = useRef(new Animated.Value(-200)).current;
  const fireScale = useRef(new Animated.Value(1)).current;
  const flickerOp = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(xpAnim, { toValue: progress, useNativeDriver: false, tension: 40, friction: 8 }).start();
  }, [stats.xp]);

  useEffect(() => {
    const key = `basicCourseCompleted_${learningLanguage ?? "english"}`;
    AsyncStorage.getItem(key).then(v => setCourseCompleted(v === "true"));
  }, [learningLanguage]);

  useEffect(() => {
    loadProgress().then(setDailyProgress);
  }, []);

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

  const storyLabel = nativeLang === "korean" ? "스토리 모드" : nativeLang === "spanish" ? "Modo Historia" : "Story Mode";
  const storyDesc  = nativeLang === "korean" ? "이야기로 자연스럽게 배우기" : nativeLang === "spanish" ? "Aprende con historias inmersivas" : "Learn through immersive stories";

  const quickItems = [
    { icon: "albums",      color: C.gold,    label: t("flashcards"),    desc: t("flashcards_desc"),    route: "/(tabs)/cards"  },
    { icon: "chatbubbles", color: "#7eb8c9", label: t("conversation"),  desc: t("conversation_desc"),  route: "/(tabs)/chat"   },
    { icon: "mic",         color: "#9b8bb4", label: t("pronunciation"), desc: t("pronunciation_desc"), route: "/(tabs)/speak"  },
    { icon: "book",        color: "#c97b27", label: storyLabel,         desc: storyDesc,               route: "/story"         },
  ];

  const statItems = [
    { label: nativeLang === "korean" ? "연속학습일" : nativeLang === "spanish" ? "Racha" : "Streak",   value: `${stats.streak}🔥`,    },
    { label: nativeLang === "korean" ? "단어"       : nativeLang === "spanish" ? "Palabras" : "Words", value: `${stats.wordsLearned}` },
    { label: nativeLang === "korean" ? "정확도"     : nativeLang === "spanish" ? "Exactitud" : "Acc.", value: `${stats.accuracy}%`    },
    { label: nativeLang === "korean" ? "경험치"     : nativeLang === "spanish" ? "XP" : "XP",          value: `${stats.xp}`           },
  ];

  const missionLabel  = nativeLang === "korean" ? "오늘의 훈련" : nativeLang === "spanish" ? "Entrenamiento de Hoy" : "Today's Training";
  const npcMissionLabel = nativeLang === "korean" ? "실전 미션" : nativeLang === "spanish" ? "Misión Real" : "Real Mission";
  const npcMissionDesc  = nativeLang === "korean" ? "NPC와 실전 대화로 레벨업!" : nativeLang === "spanish" ? "¡Habla con NPC en escenarios reales!" : "Practice real-world conversations with NPCs!";

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
            <Text style={styles.headerTitle} numberOfLines={1}>Enigma ✨</Text>
          </View>
          <Image
            source={rudyBadgeImg}
            style={styles.lingoHeader}
            resizeMode="cover"
          />
        </View>

        {/* Level badge */}
        <View style={styles.levelRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelEmoji}>{level.emoji}</Text>
            <Text style={styles.levelName}>{level.name}</Text>
            <View style={styles.levelDot} />
            <Text style={styles.levelNum}>{t("level")} {level.num}</Text>
          </View>
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
              : `${stats.xp} XP · ${level.name} ${level.emoji}`}
          </Text>
        </View>

        {/* Decorative bottom border */}
        <View style={styles.headerBorder} />
      </LinearGradient>

      {/* ── STATS ROW ─────────────────────────────────── */}
      <View style={styles.statsRow}>
        {statItems.map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statValue}>{s.value}</Text>
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
            <Text style={styles.streakMotivationText}>{streakText}</Text>
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
                <Text style={styles.npcEmoji}>✈️</Text>
                <Text style={styles.npcEmoji}>🏨</Text>
                <Text style={styles.npcEmoji}>🚕</Text>
              </View>
              <View style={styles.xpPill}>
                <Text style={styles.xpPillText}>10 NPCs</Text>
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
    </ScrollView>

    <LevelUpModal
      visible={!!pendingLevelUp}
      level={pendingLevelUp ?? { num: 2, emoji: "📚", name: "초보자", minXP: 101, maxXP: 300 }}
      lang={nativeLang}
      onClose={clearLevelUp}
    />
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
  const startLabel    = nativeLang === "korean" ? "훈련 시작 →" : nativeLang === "spanish" ? "Comenzar →" : "Start Training →";
  const doneMsg       = nativeLang === "korean" ? "오늘의 훈련 완료! 내일 봐, 파트너! 🦊"
    : nativeLang === "spanish" ? "¡Entrenamiento completado! ¡Hasta mañana! 🦊"
    : "Training complete! See you tomorrow, partner! 🦊";

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

  const todayDone = dailyProgress.todayCompleted;
  const currentUnit = UNITS[dailyProgress.currentUnitIndex] ?? UNITS[0];
  const currentDay = currentUnit.days[dailyProgress.currentDayIndex] ?? currentUnit.days[0];
  const stepsCompleted = Object.values(dailyProgress.todayStepsCompleted).filter(Boolean).length;
  const totalSteps = 4;

  const levelLabel = nativeLang === "korean" ? `${currentUnit.level} · ${getTri(currentUnit.title, lc)}`
    : nativeLang === "spanish" ? `${currentUnit.level} · ${getTri(currentUnit.title, lc)}`
    : `${currentUnit.level} · ${getTri(currentUnit.title, lc)}`;

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
            <Text style={styles.xpPillText}>{todayDone ? "✅ +100 XP" : "+100 XP"}</Text>
          </View>
        </View>

        {todayDone ? (
          <Text style={[styles.dailyTitle, { color: "#5a9", fontSize: 14 }]}>{doneMsg}</Text>
        ) : (
          <>
            <Text style={styles.dailyTitle}>{dayLabel}</Text>
            <Text style={{ fontSize: 11, fontFamily: F.label, color: C.goldDim }}>{levelLabel}</Text>
            <View style={styles.rudyStepBar}>
              {blocks.map((filled, i) => (
                <View key={i} style={[styles.rudyStepBlock, filled && styles.rudyStepBlockFilled]} />
              ))}
              <Text style={styles.rudyStepLabel}>STEP {stepsCompleted}/{totalSteps}</Text>
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
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  greeting: { fontSize: 14, fontFamily: F.body, color: C.goldDim, fontStyle: "italic", marginBottom: 4 },
  headerTitle: { fontSize: 30, fontFamily: F.title, color: C.gold, letterSpacing: 3 },
  lingoHeader: {
    width: 72, height: 72, borderRadius: 36,
    overflow: "hidden",
    borderWidth: 2, borderColor: C.gold,
    marginLeft: 8,
  },
  levelRow: { marginBottom: 10 },
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
});
