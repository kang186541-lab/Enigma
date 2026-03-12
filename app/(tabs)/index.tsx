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
import { useLanguage, getLevel, getLevelProgress, NativeLanguage } from "@/context/LanguageContext";
import { LingoMascot } from "@/components/LingoMascot";
import { LevelUpModal } from "@/components/LevelUpModal";

const { width } = Dimensions.get("window");
const lingoImg = require("@/assets/lingo.png");

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
  const todayMonIdx = (today.getDay() + 6) % 7; // Mon=0 … Sun=6

  const dayLabels: Record<NativeLanguage, string[]> = {
    korean:  ["월", "화", "수", "목", "금", "토", "일"],
    english: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    spanish: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
  };
  const labels = dayLabels[nativeLang] ?? dayLabels.english;

  return labels.map((label, i) => {
    const daysAgo = todayMonIdx - i;
    let status: "fire" | "missed" | "future";
    if (daysAgo === 0)        status = "fire";
    else if (daysAgo > 0)     status = daysAgo < streak ? "fire" : "missed";
    else                      status = "future";
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { t, stats, nativeLanguage, pendingLevelUp, clearLevelUp } = useLanguage();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const nativeLang = (nativeLanguage ?? "english") as NativeLanguage;
  const lingoGreeting = getLingoGreeting(nativeLang);
  const lingoMood = stats.streak === 0 ? "sad" : stats.streak >= 7 ? "excited" : "happy";

  const level    = getLevel(stats.xp);
  const progress = getLevelProgress(stats.xp);
  const xpInLvl  = stats.xp - level.minXP;
  const xpForLvl = level.num < 5 ? level.maxXP - level.minXP : 1;

  const xpAnim = useRef(new Animated.Value(progress)).current;
  useEffect(() => {
    Animated.spring(xpAnim, { toValue: progress, useNativeDriver: false, tension: 40, friction: 8 }).start();
  }, [stats.xp]);

  const barW = xpAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  const weekData   = getWeekStreakData(stats.streak, nativeLang);
  const streakText = getStreakText(stats.streak, nativeLang);

  const storyLabel = nativeLang === "korean" ? "스토리 모드" : nativeLang === "spanish" ? "Modo Historia" : "Story Mode";
  const storyDesc  = nativeLang === "korean" ? "이야기로 자연스럽게 배우기" : nativeLang === "spanish" ? "Aprende con historias inmersivas" : "Learn through immersive stories";

  const quickItems = [
    { icon: "albums",      color: "#FF6B9D", label: t("flashcards"),   desc: t("flashcards_desc"),   route: "/(tabs)/cards" },
    { icon: "chatbubbles", color: "#4ECDC4", label: t("conversation"), desc: t("conversation_desc"), route: "/(tabs)/chat"  },
    { icon: "mic",         color: "#45B7D1", label: t("pronunciation"),desc: t("pronunciation_desc"),route: "/(tabs)/speak" },
    { icon: "book",        color: "#9C59D1", label: storyLabel,        desc: storyDesc,               route: "/story"       },
  ];

  const bottomStatItems = [
    { label: t("words"),    value: `${stats.wordsLearned}`, color: "#4ECDC4", icon: "book"             },
    { label: t("accuracy"), value: `${stats.accuracy}%`,   color: "#45B7D1", icon: "checkmark-circle"  },
    { label: t("xp"),       value: `${stats.xp}`,          color: "#9C27B0", icon: "flash"             },
  ];

  return (
    <>
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
    >
      {/* ── HEADER ────────────────────────────────────── */}
      <LinearGradient
        colors={["#FF6B9D", "#FF8FB3", "#FFB3CE"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting} numberOfLines={1}>{lingoGreeting}</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>LingoFox ✨</Text>
          </View>
          <Image
            source={lingoImg}
            style={styles.lingoHeader}
            resizeMode="contain"
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

        {/* XP bar */}
        <View style={styles.xpSection}>
          <View style={styles.xpTrack}>
            <Animated.View style={[styles.xpFill, { width: barW }]} />
          </View>
          <Text style={styles.xpLabel}>
            {level.num < 5
              ? `${xpInLvl} / ${xpForLvl} XP`
              : `${stats.xp} XP · ${level.name} ${level.emoji}`}
          </Text>
        </View>
      </LinearGradient>

      {/* ── STREAK CARD ───────────────────────────────── */}
      <View style={styles.pad}>
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <View style={styles.streakLeft}>
              <LingoMascot size={70} mood={lingoMood} />
              <View>
                <Text style={styles.streakCount}>{stats.streak}</Text>
                <Text style={styles.streakLabel}>
                  {nativeLang === "korean" ? "일 연속 학습" : nativeLang === "spanish" ? "días seguidos" : "day streak"}
                </Text>
              </View>
            </View>
            <View style={styles.streakBadge}>
              <Ionicons name="trophy" size={14} color="#FF6B35" />
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
                    <Text style={styles.dayEmoji}>🔥</Text>
                  </View>
                ) : d.status === "missed" ? (
                  <View style={[styles.dayCircle, styles.dayCircleMissed]}>
                    <Text style={styles.dayEmojiSmall}>❌</Text>
                  </View>
                ) : (
                  <View style={[styles.dayCircle, styles.dayCircleFuture]} />
                )}
              </View>
            ))}
          </View>

          {/* Motivational text */}
          <View style={styles.streakMotivation}>
            <Text style={styles.streakMotivationText}>{streakText}</Text>
          </View>
        </View>
      </View>

      {/* ── DAILY LESSON CARD ─────────────────────────── */}
      <View style={[styles.pad, { marginTop: 4 }]}>
        <Pressable
          style={({ pressed }) => [styles.dailyCard, pressed && { transform: [{ scale: 0.985 }] }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push("/daily-lesson" as any);
          }}
        >
          <LinearGradient
            colors={["#FF6B9D", "#FF4081", "#E8316E"]}
            style={styles.dailyGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.dailyContent}>
              <View style={styles.dailyTopRow}>
                <View style={styles.dailyPill}>
                  <Ionicons name="star" size={10} color="#FF6B9D" />
                  <Text style={styles.dailyPillText}>
                    {nativeLang === "korean" ? "오늘의 수업" : nativeLang === "spanish" ? "Lección de hoy" : "Today's Lesson"}
                  </Text>
                </View>
                <View style={styles.xpPill}>
                  <Text style={styles.xpPillText}>+50 XP ⚡</Text>
                </View>
              </View>
              <Text style={styles.dailyTitle}>{t("daily_desc")}</Text>
              <View style={styles.dailyBtn}>
                <Text style={styles.dailyBtnText}>{t("start_lesson")}</Text>
                <Ionicons name="arrow-forward" size={15} color="#FF6B9D" />
              </View>
            </View>
            <Text style={styles.dailyBookEmoji}>📖</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* ── QUICK PRACTICE ────────────────────────────── */}
      <View style={[styles.pad, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>{t("quick_practice")}</Text>
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
              <LinearGradient
                colors={[item.color + "22", item.color + "08"]}
                style={styles.quickIcon}
              >
                <Ionicons name={item.icon as any} size={26} color={item.color} />
              </LinearGradient>
              <View style={styles.quickText}>
                <Text style={styles.quickLabel}>{item.label}</Text>
                <Text style={styles.quickDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#D0B0C0" />
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── STATS ─────────────────────────────────────── */}
      <View style={[styles.pad, { marginTop: 20 }]}>
        <Text style={styles.sectionTitle}>
          {nativeLang === "korean" ? "내 통계" : nativeLang === "spanish" ? "Mis estadísticas" : "My Stats"}
        </Text>
        <View style={styles.statsRow}>
          {bottomStatItems.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "18" }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
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

const DAY_COL_W = Math.floor((width - 48 - 12) / 7);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8FB" },

  /* ─ HEADER ─ */
  header: { paddingHorizontal: 20, paddingBottom: 22 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.88)", marginBottom: 4 },
  headerTitle: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#FFFFFF", letterSpacing: -0.5 },
  lingoHeader: {
    width: 100,
    height: 120,
    marginLeft: 8,
    marginTop: -8,
    backgroundColor: "transparent",
    ...(Platform.OS === "web" ? { mixBlendMode: "multiply" } as any : {}),
  },
  levelRow: { marginBottom: 10 },
  levelBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start",
  },
  levelEmoji: { fontSize: 13 },
  levelName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  levelDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "rgba(255,255,255,0.6)" },
  levelNum: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.9)" },
  xpSection: { gap: 5 },
  xpTrack: { height: 7, backgroundColor: "rgba(255,255,255,0.28)", borderRadius: 4, overflow: "hidden" },
  xpFill: { height: "100%", backgroundColor: "#FFFFFF", borderRadius: 4 },
  xpLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.85)" },

  /* ─ SHARED ─ */
  pad: { paddingHorizontal: 16, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#1A1A2E", marginBottom: 12 },

  /* ─ STREAK CARD ─ */
  streakCard: {
    backgroundColor: "#FFFFFF", borderRadius: 22, padding: 18,
    shadowColor: "#FF6B35", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 14, elevation: 4,
  },
  streakHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  streakLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  fireCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: "#FFF0E6",
    justifyContent: "center", alignItems: "center",
  },
  fireEmoji: { fontSize: 28 },
  streakCount: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#FF6B35", lineHeight: 36 },
  streakLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#A08090", marginTop: 1 },
  streakBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#FFF0E6", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  streakBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#FF6B35" },
  weekRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  dayCol: { width: DAY_COL_W, alignItems: "center", gap: 6 },
  dayLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: "#B0A0AA" },
  dayLabelToday: { color: "#FF6B9D", fontFamily: "Inter_700Bold" },
  dayCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  dayCircleFire: { backgroundColor: "#FFF0E6" },
  dayCircleMissed: { backgroundColor: "#F5F0F3" },
  dayCircleFuture: { backgroundColor: "#F5F0F3", borderWidth: 1.5, borderColor: "#E8DCE4", borderStyle: "dashed" as any },
  dayEmoji: { fontSize: 18 },
  dayEmojiSmall: { fontSize: 13 },
  streakMotivation: {
    backgroundColor: "#FFF8FB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
  },
  streakMotivationText: { fontSize: 13, fontFamily: "Inter_500Medium", color: "#6B5060", textAlign: "center" },

  /* ─ DAILY LESSON ─ */
  dailyCard: {
    borderRadius: 24, overflow: "hidden",
    shadowColor: "#FF6B9D", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  dailyGradient: { padding: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dailyContent: { flex: 1, gap: 14 },
  dailyTopRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dailyPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.25)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  dailyPillText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  xpPill: {
    backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  xpPillText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  dailyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#FFFFFF", lineHeight: 26, maxWidth: 195 },
  dailyBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, alignSelf: "flex-start",
  },
  dailyBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FF6B9D" },
  dailyBookEmoji: { fontSize: 58, marginLeft: 8 },

  /* ─ QUICK PRACTICE ─ */
  quickList: { gap: 10 },
  quickCard: {
    backgroundColor: "#FFFFFF", borderRadius: 18, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 14,
    shadowColor: "#FF6B9D", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  quickIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  quickText: { flex: 1 },
  quickLabel: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#1A1A2E", marginBottom: 2 },
  quickDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#A08090" },

  /* ─ STATS ─ */
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 14,
    alignItems: "center", gap: 6,
    shadowColor: "#FF6B9D", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#1A1A2E" },
  statLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: "#A08090", textAlign: "center" },
});
