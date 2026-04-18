import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage, getLevel } from "@/context/LanguageContext";
import { RudyMascot } from "@/components/LingoMascot";
import {
  getChapters, pick, toLangCode, getChapterGradient, getChapterAccent,
  isChapterUnlocked, getChapterTotalXP, getUiText, getEmptyStoryProgress,
} from "@/lib/storyUtils";
import type { StoryProgress } from "@/constants/storyTypes";

const STORY_PROGRESS_KEY = "@lingua_story_progress";

export default function StoryScreen() {
  const insets = useSafeAreaInsets();
  const { nativeLanguage, stats } = useLanguage();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const nativeLang = toLangCode(nativeLanguage);
  const ui = getUiText(nativeLang);
  const chapters = getChapters();
  const userLevel = getLevel(stats.xp).num;

  const [storyProgress, setStoryProgress] = useState<StoryProgress>(getEmptyStoryProgress());

  useEffect(() => {
    AsyncStorage.getItem(STORY_PROGRESS_KEY).then((raw) => {
      if (raw) {
        try { setStoryProgress(JSON.parse(raw)); } catch (e) { console.warn('[Story] progress parse failed:', e); }
      }
    });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#1A1A2E" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{ui.storyMode} 📖</Text>
          <Text style={styles.headerSub}>
            {nativeLang === "ko"
              ? "이야기로 언어를 배워요"
              : nativeLang === "es"
              ? "Aprende con historias"
              : "Learn through stories"}
          </Text>
        </View>
      </View>

      {/* Rudy banner */}
      <View style={styles.rudyBanner}>
        <RudyMascot size={100} mood="excited" />
        <View style={styles.rudySpeech}>
          <Text style={styles.rudySpeechText}>
            {nativeLang === "ko"
              ? "안녕! 저는 루디예요 🦊\n이야기로 함께 언어를 배워봐요!"
              : nativeLang === "es"
              ? "¡Hola! Soy Rudy 🦊\n¡Aprendamos idiomas con historias!"
              : "Hi! I'm Rudy 🦊\nLet's learn languages through stories!"}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {chapters.map((chapter) => {
          const unlocked = isChapterUnlocked(chapter, userLevel, storyProgress);
          const totalXP = getChapterTotalXP(chapter.id);
          const gradient = getChapterGradient(chapter.id);
          const accent = getChapterAccent(chapter.id);
          const title = pick(chapter.title, nativeLang);
          const theme = pick(chapter.theme, nativeLang);

          return (
            <Pressable
              key={chapter.id}
              style={({ pressed }) => [
                styles.card,
                !unlocked && styles.cardLocked,
                pressed && unlocked && { transform: [{ scale: 0.975 }], opacity: 0.92 },
              ]}
              onPress={() => {
                if (!unlocked) return;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push(`/story-scene?id=${chapter.id}` as never);
              }}
            >
              <LinearGradient
                colors={gradient}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {/* Lock overlay */}
                {!unlocked && (
                  <View style={styles.lockOverlay}>
                    <Ionicons name="lock-closed" size={32} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.lockText}>
                      {ui.unlockAt.replace("{level}", String(chapter.unlockLevel))}
                    </Text>
                  </View>
                )}

                {/* Top row */}
                <View style={styles.cardTop}>
                  <Text style={styles.cardFlag}>{chapter.flag}</Text>
                  <View style={[styles.langBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                    <Text style={styles.langBadgeText}>{chapter.city}</Text>
                  </View>
                </View>

                {/* NPC emoji row */}
                <View style={styles.charsRow}>
                  {chapter.npcs.slice(0, 3).map((npcId, i) => (
                    <View
                      key={npcId}
                      style={[
                        styles.charBubble,
                        { backgroundColor: "rgba(255,255,255,0.15)", marginLeft: i > 0 ? -10 : 0 },
                      ]}
                    >
                      <Text style={styles.charEmoji}>{chapter.icon}</Text>
                    </View>
                  ))}
                </View>

                {/* Title + theme */}
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDesc}>{theme}</Text>

                {/* Bottom row */}
                <View style={styles.cardBottom}>
                  <View style={styles.metaRow}>
                    <View style={styles.metaBadge}>
                      <Ionicons name="film" size={12} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.metaText}>
                        {chapter.scenes.length}
                        {nativeLang === "ko" ? "개 장면" : nativeLang === "es" ? " escenas" : " scenes"}
                      </Text>
                    </View>
                    <View style={styles.metaBadge}>
                      <Ionicons name="star" size={12} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.metaText}>{totalXP} XP</Text>
                    </View>
                    <View style={styles.metaBadge}>
                      <Text style={styles.metaText}>{chapter.badge.icon}</Text>
                    </View>
                  </View>
                  {unlocked && (
                    <View style={[styles.playBtn, { backgroundColor: accent }]}>
                      <Text style={styles.playBtnText}>
                        {nativeLang === "ko" ? "시작 ▶" : nativeLang === "es" ? "Iniciar ▶" : "Play ▶"}
                      </Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </Pressable>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8FB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0E0E8",
    backgroundColor: "#FFF8FB",
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: "#F5E8F0",
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#1A1A2E" },
  headerSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#A08090", marginTop: 2 },
  rudyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFF0F6",
    borderBottomWidth: 1,
    borderBottomColor: "#FFD6E8",
  },
  rudySpeech: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rudySpeechText: { fontSize: 13, color: "#5A2040", lineHeight: 19 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  cardLocked: { opacity: 0.65 },
  cardGradient: { padding: 24 },
  lockOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderRadius: 24,
  },
  lockText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardFlag: { fontSize: 36 },
  langBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  langBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  charsRow: { flexDirection: "row", marginBottom: 16 },
  charBubble: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.3)",
  },
  charEmoji: { fontSize: 22 },
  cardTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#FFFFFF", marginBottom: 4 },
  cardDesc: { fontSize: 14, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)", marginBottom: 20 },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metaRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  metaBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
  },
  metaText: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.85)" },
  playBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 14 },
  playBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
});
