import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, F } from "@/constants/theme";
import { useLanguage } from "@/context/LanguageContext";
import { ACHIEVEMENTS, type Achievement } from "@/constants/achievements";
import { loadEarnedAchievements, getProgress } from "@/lib/achievementManager";

const T = {
  title:   { ko: "업적", en: "Achievements", es: "Logros" },
  earned:  { ko: "획득", en: "Earned", es: "Obtenido" },
  locked:  { ko: "미획득", en: "Locked", es: "Bloqueado" },
  back:    { ko: "뒤로", en: "Back", es: "Volver" },
  learning: { ko: "학습", en: "Learning", es: "Aprendizaje" },
  social:   { ko: "소셜", en: "Social", es: "Social" },
  mastery:  { ko: "마스터리", en: "Mastery", es: "Maestria" },
  welcome: { ko: "첫 업적을 기다리고 있어요! 레슨을 시작해보세요 ✨", en: "Your first achievement awaits! Start a lesson ✨", es: "¡Tu primer logro te espera! Empieza una lección ✨" },
} as const;

function t(obj: Record<string, string>, lang: string) { return obj[lang] || obj.en; }

export default function AchievementsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { nativeLanguage: nativeLang, stats } = useLanguage();
  const lc = nativeLang === "korean" ? "ko" : nativeLang === "spanish" ? "es" : "en";

  const [earned, setEarned] = useState<string[]>([]);
  const [selectedCat, setSelectedCat] = useState<"all" | "learning" | "social" | "mastery">("all");

  useEffect(() => {
    loadEarnedAchievements().then(setEarned);
  }, []);

  const categories = ["all", "learning", "social", "mastery"] as const;
  const catLabels = {
    all: { ko: "전체", en: "All", es: "Todos" },
    learning: T.learning,
    social: T.social,
    mastery: T.mastery,
  };

  const filtered = selectedCat === "all"
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter((a) => a.category === selectedCat);

  const earnedCount = earned.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <LinearGradient colors={[C.bg1, C.bg2]} style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.gold} />
        </Pressable>
        <Text style={styles.title}>{t(T.title, lc)}</Text>
        <Text style={styles.counter}>{earnedCount}/{totalCount}</Text>
      </View>

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
        {categories.map((cat) => (
          <Pressable
            key={cat}
            onPress={() => setSelectedCat(cat)}
            style={[styles.tab, cat === selectedCat && styles.tabActive]}
          >
            <Text style={[styles.tabText, cat === selectedCat && styles.tabTextActive]}>
              {t(catLabels[cat], lc)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.grid}>
        {earnedCount === 0 && (
          <View style={styles.welcomeBanner}>
            <Text style={styles.welcomeText}>{t(T.welcome, lc)}</Text>
          </View>
        )}
        {filtered.map((ach) => {
          const isEarned = earned.includes(ach.id);
          const progress = isEarned ? 1 : getProgress(ach.id, { stats });
          return (
            <View key={ach.id} style={[styles.card, !isEarned && styles.cardLocked]}>
              <Text style={styles.icon}>{ach.icon}</Text>
              <Text style={[styles.name, !isEarned && styles.nameLocked]}>
                {ach.name[lc] || ach.name.en}
              </Text>
              <Text style={styles.desc} numberOfLines={2}>
                {ach.description[lc] || ach.description.en}
              </Text>
              {isEarned ? (
                <View style={styles.earnedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={C.success} />
                  <Text style={styles.earnedText}>{t(T.earned, lc)}</Text>
                </View>
              ) : progress > 0 ? (
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
              ) : (
                <Text style={styles.lockedText}>{t(T.locked, lc)}</Text>
              )}
              <Text style={styles.xpReward}>+{ach.xpReward} XP</Text>
            </View>
          );
        })}
        <View style={{ height: 60 }} />
      </ScrollView>
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
  backBtn: { width: 40, padding: 4 },
  title: { fontFamily: F.header, fontSize: 20, color: C.gold, letterSpacing: 1 },
  counter: { fontFamily: F.bodySemi, fontSize: 15, color: C.goldDim, width: 40, textAlign: "right" },
  tabRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabActive: { backgroundColor: C.gold, borderColor: C.gold },
  tabText: { fontFamily: F.bodySemi, fontSize: 13, color: C.goldDim },
  tabTextActive: { color: C.bg1 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 10,
  },
  card: {
    width: "47%",
    backgroundColor: C.bg3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  cardLocked: { opacity: 0.55 },
  icon: { fontSize: 32, marginBottom: 4 },
  name: { fontFamily: F.bodySemi, fontSize: 13, color: C.parchment, textAlign: "center" },
  nameLocked: { color: C.goldDim },
  desc: { fontFamily: F.body, fontSize: 11, color: C.goldDim, textAlign: "center", lineHeight: 15 },
  earnedBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  earnedText: { fontFamily: F.bodySemi, fontSize: 11, color: C.success },
  lockedText: { fontFamily: F.body, fontSize: 11, color: C.goldDark, marginTop: 4 },
  progressBar: {
    width: "80%",
    height: 4,
    backgroundColor: C.bg2,
    borderRadius: 2,
    marginTop: 6,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: C.gold, borderRadius: 2 },
  xpReward: { fontFamily: F.label, fontSize: 10, color: C.goldDark, marginTop: 2 },
  welcomeBanner: {
    width: "100%",
    backgroundColor: C.bg3,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  welcomeText: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.parchment,
    textAlign: "center",
    lineHeight: 18,
  },
});
