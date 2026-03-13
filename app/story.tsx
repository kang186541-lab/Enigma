import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { RudyMascot } from "@/components/LingoMascot";

const { width } = Dimensions.get("window");

const STORIES = [
  {
    id: "london",
    flag: "🇬🇧",
    title: "London Mystery",
    subtitle: "A foggy detective story",
    lang: "English",
    langIcon: "language",
    gradient: ["#1A1A2E", "#16213E", "#0F3460"] as const,
    accentColor: "#E94560",
    scenes: 8,
    characters: ["🕵️", "👩", "🦹"],
    labelKo: "런던 미스터리",
    descKo: "안개 속 런던, 탐정 이야기",
    labelEs: "Misterio en Londres",
    descEs: "Una historia de detective en la niebla",
  },
  {
    id: "madrid",
    flag: "🇪🇸",
    title: "Madrid Romance",
    subtitle: "Passion under the Spanish sun",
    lang: "Spanish",
    langIcon: "heart",
    gradient: ["#FF6B35", "#F7931E", "#FFCD3C"] as const,
    accentColor: "#C41E3A",
    scenes: 8,
    characters: ["💃", "👨", "👵"],
    labelKo: "마드리드 로맨스",
    descKo: "스페인 태양 아래 열정적인 사랑",
    labelEs: "Romance en Madrid",
    descEs: "Pasión bajo el sol español",
  },
  {
    id: "seoul",
    flag: "🇰🇷",
    title: "K-Drama Seoul",
    subtitle: "Lost memories, secret love",
    lang: "Korean",
    langIcon: "star",
    gradient: ["#0A0A1A", "#12122A", "#1E1E4A"] as const,
    accentColor: "#FF6B9D",
    scenes: 8,
    characters: ["👨‍💼", "👩", "👩‍⚕️"],
    labelKo: "K-드라마 서울",
    descKo: "잃어버린 기억, 비밀스러운 사랑",
    labelEs: "K-Drama Seúl",
    descEs: "Recuerdos perdidos, amor secreto",
  },
];

export default function StoryScreen() {
  const insets = useSafeAreaInsets();
  const { nativeLanguage } = useLanguage();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const lang = nativeLanguage ?? "english";

  function getLabel(s: typeof STORIES[0]) {
    if (lang === "korean") return s.labelKo;
    if (lang === "spanish") return s.labelEs;
    return s.title;
  }
  function getDesc(s: typeof STORIES[0]) {
    if (lang === "korean") return s.descKo;
    if (lang === "spanish") return s.descEs;
    return s.subtitle;
  }

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
          <Text style={styles.headerTitle}>
            {lang === "korean" ? "스토리 모드 📖" : lang === "spanish" ? "Modo Historia 📖" : "Story Mode 📖"}
          </Text>
          <Text style={styles.headerSub}>
            {lang === "korean" ? "이야기로 언어를 배워요" : lang === "spanish" ? "Aprende con historias" : "Learn through stories"}
          </Text>
        </View>
      </View>

      {/* Lingo guide banner */}
      <View style={styles.lingoBanner}>
        <RudyMascot size={100} mood="excited" />
        <View style={styles.lingoSpeech}>
          <Text style={styles.lingoSpeechText}>
            {lang === "korean"
              ? "안녕! 저는 루디예요 🦊\n이야기로 함께 언어를 배워봐요!"
              : lang === "spanish"
              ? "¡Hola! Soy Rudy 🦊\n¡Aprendamos idiomas con historias!"
              : "Hi! I'm Rudy 🦊\nLet's learn languages through stories!"}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {STORIES.map((story) => (
          <Pressable
            key={story.id}
            style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.975 }], opacity: 0.92 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/story-scene?id=${story.id}` as any);
            }}
          >
            <LinearGradient colors={story.gradient} style={styles.cardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              {/* Top row */}
              <View style={styles.cardTop}>
                <Text style={styles.cardFlag}>{story.flag}</Text>
                <View style={styles.langBadge}>
                  <Text style={styles.langBadgeText}>{story.lang}</Text>
                </View>
              </View>

              {/* Characters row */}
              <View style={styles.charsRow}>
                {story.characters.map((emoji, i) => (
                  <View
                    key={i}
                    style={[
                      styles.charBubble,
                      { backgroundColor: "rgba(255,255,255,0.15)", marginLeft: i > 0 ? -10 : 0 },
                    ]}
                  >
                    <Text style={styles.charEmoji}>{emoji}</Text>
                  </View>
                ))}
              </View>

              {/* Title block */}
              <Text style={styles.cardTitle}>{getLabel(story)}</Text>
              <Text style={styles.cardDesc}>{getDesc(story)}</Text>

              {/* Bottom row */}
              <View style={styles.cardBottom}>
                <View style={styles.sceneBadge}>
                  <Ionicons name="film" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.scenesText}>
                    {story.scenes} {lang === "korean" ? "장면" : lang === "spanish" ? "escenas" : "scenes"}
                  </Text>
                </View>
                <View style={[styles.playBtn, { backgroundColor: story.accentColor }]}>
                  <Text style={styles.playBtnText}>
                    {lang === "korean" ? "시작 ▶" : lang === "spanish" ? "Iniciar ▶" : "Play ▶"}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        ))}

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
  lingoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFF0F6",
    borderBottomWidth: 1,
    borderBottomColor: "#FFD6E8",
  },
  lingoSpeech: {
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
  lingoSpeechText: { fontSize: 13, color: "#5A2040", lineHeight: 19 },
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
  cardGradient: { padding: 24 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  cardFlag: { fontSize: 36 },
  langBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
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
  sceneBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  scenesText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.8)" },
  playBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 14 },
  playBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
});
