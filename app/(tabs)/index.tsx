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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useLanguage, getLevel, getLevelProgress } from "@/context/LanguageContext";

const { width } = Dimensions.get("window");

function getGreeting(t: (k: string) => string) {
  const hour = new Date().getHours();
  if (hour < 12) return t("good_morning");
  if (hour < 18) return t("good_afternoon");
  return t("good_evening");
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { t, stats } = useLanguage();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const level = getLevel(stats.xp);
  const progress = getLevelProgress(stats.xp);
  const nextLevel = level.num < 5 ? level.maxXP : null;
  const xpInLevel = level.num < 5 ? stats.xp - level.minXP : stats.xp - level.minXP;
  const xpForLevel = level.num < 5 ? level.maxXP - level.minXP : 1;

  const xpBarAnim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.spring(xpBarAnim, {
      toValue: progress,
      useNativeDriver: false,
      tension: 40,
      friction: 8,
    }).start();
  }, [stats.xp]);

  const statItems = [
    { icon: "flame", color: "#FF6B35", label: t("streak"), value: `${stats.streak}`, suffix: "" },
    { icon: "book", color: "#4ECDC4", label: t("words"), value: `${stats.wordsLearned}`, suffix: "" },
    { icon: "checkmark-circle", color: "#45B7D1", label: t("accuracy"), value: `${stats.accuracy}`, suffix: "%" },
    { icon: "flash", color: "#9C27B0", label: t("xp"), value: `${stats.xp}`, suffix: "" },
  ];

  const quickItems = [
    { icon: "albums", color: "#FF6B9D", label: t("flashcards"), desc: t("flashcards_desc"), route: "/(tabs)/cards" },
    { icon: "chatbubbles", color: "#4ECDC4", label: t("conversation"), desc: t("conversation_desc"), route: "/(tabs)/chat" },
    { icon: "mic", color: "#45B7D1", label: t("pronunciation"), desc: t("pronunciation_desc"), route: "/(tabs)/speak" },
  ];

  const barWidth = xpBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <LinearGradient
        colors={["#FF6B9D", "#FF8FB3", "#FFB3CE"]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting(t)}</Text>
            <Text style={styles.headerTitle}>LinguaAI ✨</Text>
          </View>
          <Pressable style={styles.avatarBtn}>
            <LinearGradient colors={["#FFFFFF", "#FFE0EF"]} style={styles.avatar}>
              <Text style={styles.avatarText}>{level.emoji}</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.levelRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelEmoji}>{level.emoji}</Text>
            <Text style={styles.levelText}>{level.name} · {t("level")} {level.num}</Text>
          </View>
        </View>

        <View style={styles.xpBarContainer}>
          <View style={styles.xpTrack}>
            <Animated.View style={[styles.xpFill, { width: barWidth }]} />
          </View>
          <Text style={styles.xpLabel}>
            {level.num < 5
              ? `${xpInLevel} / ${xpForLevel} XP`
              : `${stats.xp} XP · 마스터 👑`}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        {statItems.map((item, idx) => (
          <View key={idx} style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: item.color + "18" }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <Text style={styles.statValue}>{item.value}{item.suffix}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={[styles.dailyCard]}>
          <LinearGradient
            colors={["#FF6B9D", "#FF4081"]}
            style={styles.dailyGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.dailyContent}>
              <View>
                <Text style={styles.dailyLabel}>{t("daily_lesson")}</Text>
                <Text style={styles.dailyDesc}>{t("daily_desc")}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.startBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push("/daily-lesson" as any);
                }}
              >
                <Text style={styles.startBtnText}>{t("start_lesson")}</Text>
                <Ionicons name="arrow-forward" size={16} color="#FF6B9D" />
              </Pressable>
            </View>
            <View style={styles.dailyDecor}>
              <Text style={styles.dailyEmoji}>📖</Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("quick_practice")}</Text>
        <View style={styles.quickGrid}>
          {quickItems.map((item, idx) => (
            <Pressable
              key={idx}
              style={({ pressed }) => [
                styles.quickCard,
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(item.route as any);
              }}
            >
              <View style={[styles.quickIconBg, { backgroundColor: item.color + "15" }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
              <Text style={styles.quickDesc}>{item.desc}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8FB",
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  greeting: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  avatarBtn: {},
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarText: {
    fontSize: 22,
  },
  levelRow: {
    marginBottom: 10,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    alignSelf: "flex-start",
  },
  levelEmoji: {
    fontSize: 14,
  },
  levelText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  xpBarContainer: {
    gap: 6,
  },
  xpTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 3,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  xpLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.8)",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
    marginTop: -20,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 64) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    gap: 6,
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#A08090",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  dailyCard: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  dailyGradient: {
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dailyContent: {
    flex: 1,
    gap: 16,
  },
  dailyLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  dailyDesc: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
    lineHeight: 22,
    maxWidth: 180,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    alignSelf: "flex-start",
  },
  startBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FF6B9D",
  },
  dailyDecor: {
    marginLeft: 16,
  },
  dailyEmoji: {
    fontSize: 52,
  },
  quickGrid: {
    gap: 12,
  },
  quickCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickIconBg: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  quickLabel: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A2E",
    marginBottom: 2,
  },
  quickDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#A08090",
    flex: 1,
    flexWrap: "wrap",
  },
});
