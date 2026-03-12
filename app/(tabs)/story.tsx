import React, { useCallback, useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { LingoMascot } from "@/components/LingoMascot";

const { width } = Dimensions.get("window");
export const STORY_PROGRESS_KEY = "lingo_story_progress";

export interface StoryProgress {
  completed: string[];
  unlocked: string[];
}

const CHAPTERS = [
  {
    id: "london",
    num: 1,
    flag: "🇬🇧",
    gradient: ["#0D1117", "#1A1A2E", "#16213E"] as const,
    accentColor: "#E94560",
    titleEn: "London Mystery",
    titleKo: "런던 미스터리",
    titleEs: "Misterio en Londres",
    descEn: "Decode a mysterious letter in foggy London",
    descKo: "안개 낀 런던에서 수수께끼의 편지를 해독하라",
    descEs: "Descifra una misteriosa carta en la neblinosa Londres",
    characters: ["🕵️", "👩", "🦹"],
    scenes: 9,
    missionEn: "Match 5 words",
    missionKo: "단어 5개 매칭",
    missionEs: "Relaciona 5 palabras",
  },
  {
    id: "madrid",
    num: 2,
    flag: "🇪🇸",
    gradient: ["#8B1A1A", "#C41E3A", "#FF6B35"] as const,
    accentColor: "#FFCD3C",
    titleEn: "Madrid Secret",
    titleKo: "마드리드의 비밀",
    titleEs: "El Secreto de Madrid",
    descEn: "Help Carlos find the missing Isabella",
    descKo: "카를로스가 사라진 이사벨라를 찾도록 도와줘",
    descEs: "Ayuda a Carlos a encontrar a la desaparecida Isabella",
    characters: ["💃", "👨", "👵"],
    scenes: 9,
    missionEn: "Fill in 3 blanks",
    missionKo: "빈칸 3개 채우기",
    missionEs: "Completa 3 espacios",
  },
  {
    id: "seoul",
    num: 3,
    flag: "🇰🇷",
    gradient: ["#050510", "#0A0A20", "#10103A"] as const,
    accentColor: "#FF6B9D",
    titleEn: "Chaebol's Secret",
    titleKo: "재벌가의 비밀",
    titleEs: "El Secreto del Chaebol",
    descEn: "You wake with no memory. K-Drama twists await!",
    descKo: "기억을 잃은 채 눈을 떴다. 극적인 반전이 기다린다!",
    descEs: "Despiertas sin memoria. ¡Los giros del K-Drama te esperan!",
    characters: ["👨‍💼", "👩", "👩‍⚕️"],
    scenes: 9,
    missionEn: "Choose 3 correct words",
    missionKo: "올바른 단어 3개 고르기",
    missionEs: "Elige 3 palabras correctas",
  },
  {
    id: "paris",
    num: 4,
    flag: "🇫🇷",
    gradient: ["#1A0A2E", "#2A1A4E", "#3A2A6E"] as const,
    accentColor: "#A78BFA",
    titleEn: "Paris Romance",
    titleKo: "파리의 로맨스",
    titleEs: "Romance en París",
    descEn: "A love story under the Eiffel Tower",
    descKo: "에펠탑 아래의 사랑 이야기",
    descEs: "Una historia de amor bajo la Torre Eiffel",
    characters: ["👫", "🗼", "🥖"],
    scenes: 8,
    locked: true,
    missionEn: "Coming soon",
    missionKo: "곧 공개",
    missionEs: "Próximamente",
  },
  {
    id: "tokyo",
    num: 5,
    flag: "🇯🇵",
    gradient: ["#1A0A0A", "#2A1010", "#3A1A1A"] as const,
    accentColor: "#F97316",
    titleEn: "Tokyo Nights",
    titleKo: "도쿄의 밤",
    titleEs: "Noches de Tokio",
    descEn: "Neon lights and mystery in the city",
    descKo: "네온 불빛 가득한 도시의 미스터리",
    descEs: "Luces de neón y misterio en la ciudad",
    characters: ["🏮", "🍜", "🎌"],
    scenes: 8,
    locked: true,
    missionEn: "Coming soon",
    missionKo: "곧 공개",
    missionEs: "Próximamente",
  },
];

export default function StoryTab() {
  const insets = useSafeAreaInsets();
  const { nativeLanguage } = useLanguage();
  const lang = nativeLanguage ?? "english";
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 49 + insets.bottom;

  const [progress, setProgress] = useState<StoryProgress>({
    completed: [],
    unlocked: ["london"],
  });

  const loadProgress = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORY_PROGRESS_KEY);
      if (raw) setProgress(JSON.parse(raw));
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  function getTitle(ch: (typeof CHAPTERS)[0]) {
    if (lang === "korean") return ch.titleKo;
    if (lang === "spanish") return ch.titleEs;
    return ch.titleEn;
  }

  function getDesc(ch: (typeof CHAPTERS)[0]) {
    if (lang === "korean") return ch.descKo;
    if (lang === "spanish") return ch.descEs;
    return ch.descEn;
  }

  function getMission(ch: (typeof CHAPTERS)[0]) {
    if (lang === "korean") return ch.missionKo;
    if (lang === "spanish") return ch.missionEs;
    return ch.missionEn;
  }

  function getStatus(
    ch: (typeof CHAPTERS)[0]
  ): "locked" | "available" | "completed" {
    if (ch.locked) return "locked";
    if (progress.completed.includes(ch.id)) return "completed";
    if (progress.unlocked.includes(ch.id)) return "available";
    return "locked";
  }

  const lingoMsg =
    lang === "korean"
      ? "안녕! 저는 링고예요! 🦊\n이야기로 함께 언어를 배워봐요!"
      : lang === "spanish"
      ? "¡Hola! ¡Soy Lingo! 🦊\n¡Aprendamos idiomas con historias!"
      : "Hi! I'm Lingo! 🦊\nLet's learn languages through stories!";

  const chapterLabel =
    lang === "korean"
      ? "챕터"
      : lang === "spanish"
      ? "Capítulo"
      : "Chapter";
  const scenesLabel =
    lang === "korean" ? "장면" : lang === "spanish" ? "escenas" : "scenes";
  const doneLabel =
    lang === "korean" ? "완료" : lang === "spanish" ? "Completado" : "Done";
  const replayLabel =
    lang === "korean" ? "다시 보기" : lang === "spanish" ? "Replay" : "Replay";
  const playLabel =
    lang === "korean" ? "시작 ▶" : lang === "spanish" ? "Iniciar ▶" : "Play ▶";

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient
        colors={["#FF6B9D", "#FF8FB3"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>
          {lang === "korean"
            ? "스토리 모드"
            : lang === "spanish"
            ? "Modo Historia"
            : "Story Mode"}
        </Text>
        <Text style={styles.headerSub}>
          {lang === "korean"
            ? "이야기로 언어를 배워요"
            : lang === "spanish"
            ? "Aprende con historias"
            : "Learn languages through stories"}
        </Text>
      </LinearGradient>

      <View style={styles.lingoBanner}>
        <LingoMascot size={100} mood="excited" />
        <View style={styles.lingoSpeech}>
          <Text style={styles.lingoSpeechText}>{lingoMsg}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: bottomPad + 16 },
        ]}
      >
        {CHAPTERS.map((ch) => {
          const status = getStatus(ch);
          const isLocked = status === "locked";
          const isDone = status === "completed";

          return (
            <Pressable
              key={ch.id}
              style={({ pressed }) => [
                styles.card,
                pressed && !isLocked && {
                  transform: [{ scale: 0.975 }],
                  opacity: 0.92,
                },
              ]}
              onPress={() => {
                if (isLocked) {
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Warning
                  );
                  return;
                }
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push(
                  `/story-scene?id=${ch.id}&chapter=${ch.num}` as any
                );
              }}
            >
              <LinearGradient
                colors={
                  isLocked
                    ? (["#252525", "#353535", "#454545"] as const)
                    : ch.gradient
                }
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.chapterRow}>
                  <View
                    style={[
                      styles.chapterBadge,
                      {
                        backgroundColor: isLocked
                          ? "rgba(255,255,255,0.08)"
                          : ch.accentColor + "30",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chapterNum,
                        {
                          color: isLocked
                            ? "rgba(255,255,255,0.3)"
                            : ch.accentColor,
                        },
                      ]}
                    >
                      {chapterLabel} {ch.num}
                    </Text>
                  </View>
                  {isDone && (
                    <View style={styles.doneBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={15}
                        color="#4ADE80"
                      />
                      <Text style={styles.doneText}>{doneLabel}</Text>
                    </View>
                  )}
                  {isLocked && (
                    <Ionicons
                      name="lock-closed"
                      size={18}
                      color="rgba(255,255,255,0.35)"
                    />
                  )}
                </View>

                <View style={styles.cardMain}>
                  <Text style={[styles.flag, isLocked && { opacity: 0.3 }]}>
                    {ch.flag}
                  </Text>
                  <View style={styles.charsRow}>
                    {ch.characters.map((emoji, i) => (
                      <View
                        key={i}
                        style={[
                          styles.charBubble,
                          {
                            backgroundColor: isLocked
                              ? "rgba(255,255,255,0.04)"
                              : "rgba(255,255,255,0.14)",
                            marginLeft: i > 0 ? -10 : 0,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.charEmoji,
                            isLocked && { opacity: 0.25 },
                          ]}
                        >
                          {emoji}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                <Text
                  style={[
                    styles.cardTitle,
                    isLocked && { color: "rgba(255,255,255,0.3)" },
                  ]}
                >
                  {isLocked ? "🔒 " : ""}
                  {getTitle(ch)}
                </Text>
                <Text
                  style={[
                    styles.cardDesc,
                    isLocked && { color: "rgba(255,255,255,0.18)" },
                  ]}
                >
                  {getDesc(ch)}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.footerLeft}>
                    <View style={styles.metaPill}>
                      <Ionicons
                        name="film"
                        size={11}
                        color={
                          isLocked
                            ? "rgba(255,255,255,0.2)"
                            : "rgba(255,255,255,0.7)"
                        }
                      />
                      <Text
                        style={[
                          styles.metaText,
                          isLocked && { color: "rgba(255,255,255,0.2)" },
                        ]}
                      >
                        {ch.scenes} {scenesLabel}
                      </Text>
                    </View>
                    <View style={styles.metaPill}>
                      <Ionicons
                        name="puzzle"
                        size={11}
                        color={
                          isLocked
                            ? "rgba(255,255,255,0.2)"
                            : "rgba(255,255,255,0.7)"
                        }
                      />
                      <Text
                        style={[
                          styles.metaText,
                          isLocked && { color: "rgba(255,255,255,0.2)" },
                        ]}
                      >
                        {getMission(ch)}
                      </Text>
                    </View>
                  </View>
                  {!isLocked && (
                    <View
                      style={[
                        styles.playBtn,
                        { backgroundColor: ch.accentColor },
                      ]}
                    >
                      <Text style={styles.playBtnText}>
                        {isDone ? replayLabel : playLabel}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.xpRow}>
                  <Text
                    style={[
                      styles.xpText,
                      isLocked && { color: "rgba(255,255,255,0.18)" },
                    ]}
                  >
                    ⚡ +100 XP
                    {lang === "korean"
                      ? " 보상"
                      : lang === "spanish"
                      ? " de recompensa"
                      : " reward"}
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF8FB" },
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 18 },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.85)",
  },
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
  lingoSpeechText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#5A2040",
    lineHeight: 20,
  },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 8,
  },
  cardGradient: { padding: 20 },
  chapterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  chapterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chapterNum: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  doneBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  doneText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#4ADE80",
  },
  cardMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  flag: { fontSize: 40 },
  charsRow: { flexDirection: "row" },
  charBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.22)",
  },
  charEmoji: { fontSize: 20 },
  cardTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginBottom: 18,
    lineHeight: 19,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerLeft: { gap: 6 },
  metaPill: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.7)",
  },
  playBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14 },
  playBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#FFFFFF" },
  xpRow: { marginTop: 12 },
  xpText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.55)",
  },
});
