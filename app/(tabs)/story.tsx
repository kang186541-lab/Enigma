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
import { RudyMascot } from "@/components/LingoMascot";
import { C, F } from "@/constants/theme";

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
    accentColor: C.gold,
    titleEn: "The London Cipher",
    titleKo: "런던의 암호",
    titleEs: "El Cifrado de Londres",
    descEn: "Decode the ∆LX symbol before Mr. Black erases London's words",
    descKo: "미스터 블랙이 런던의 단어들을 지우기 전에 ∆LX 기호를 해독하라",
    descEs: "Descifra el símbolo ∆LX antes de que Mr. Black borre las palabras de Londres",
    characters: ["🕵️", "👩‍💼", "🕴️"],
    scenes: 17,
    missionEn: "4 puzzles + 2 clues",
    missionKo: "퍼즐 4개 + 단서 2개",
    missionEs: "4 puzzles + 2 pistas",
  },
  {
    id: "madrid",
    num: 2,
    flag: "🇪🇸",
    gradient: ["#1A0500", "#3A0A0A", "#6B1A10"] as const,
    accentColor: C.gold,
    titleEn: "The Madrid Disappearance",
    titleKo: "마드리드의 실종",
    titleEs: "La Desaparición de Madrid",
    descEn: "Mr. Black has six stones. You have one. The numbers are not in your favor.",
    descKo: "미스터 블랙은 여섯 개를 가지고 있다. 너는 하나. 숫자가 유리하지 않다.",
    descEs: "Mr. Black tiene seis piedras. Tú tienes una. Los números no están a tu favor.",
    characters: ["💃", "🥬", "🕴️"],
    scenes: 16,
    missionEn: "4 puzzles + 1 clue",
    missionKo: "퍼즐 4개 + 단서 1개",
    missionEs: "4 puzzles + 1 pista",
  },
  {
    id: "seoul",
    num: 3,
    flag: "🇰🇷",
    gradient: ["#050510", "#0A0A20", "#10103A"] as const,
    accentColor: C.gold,
    titleEn: "The Seoul Secret",
    titleKo: "서울의 비밀",
    titleEs: "El Secreto de Seúl",
    descEn: "Project Erase — the Lexicon Society's plan to delete all world languages",
    descKo: "이레이즈 프로젝트 — Lexicon Society의 전 세계 언어 삭제 계획",
    descEs: "Proyecto Borrado — el plan de la Sociedad Lexicon para eliminar todos los idiomas",
    characters: ["👨‍💼", "👩‍⚕️", "🕴️"],
    scenes: 15,
    missionEn: "4 puzzles + 1 clue",
    missionKo: "퍼즐 4개 + 단서 1개",
    missionEs: "4 puzzles + 1 pista",
  },
  {
    id: "cairo",
    num: 4,
    flag: "🇪🇬",
    gradient: ["#1a0d00", "#2e1a00", "#1a0d00"] as const,
    accentColor: "#D4A017",
    titleEn: "The Cairo Stone",
    titleKo: "카이로의 수호석",
    titleEs: "La Piedra de El Cairo",
    descEn: "Miss Penny holds the key — but Mr. Black is already at Saqqara",
    descKo: "미스 페니가 열쇠를 쥐고 있다 — 하지만 미스터 블랙은 이미 사카라에",
    descEs: "Miss Penny tiene la clave — pero Mr. Black ya está en Saqqara",
    characters: ["🐪", "💃", "🕴️"],
    scenes: 18,
    missionEn: "4 puzzles + 2 clues",
    missionKo: "퍼즐 4개 + 단서 2개",
    missionEs: "4 puzzles + 2 pistas",
  },
  {
    id: "babel",
    num: 5,
    flag: "🗼",
    gradient: ["#050510", "#0A0A2A", "#050510"] as const,
    accentColor: "#8888FF",
    titleEn: "The Last Language",
    titleKo: "최후의 언어",
    titleEs: "El Último Idioma",
    descEn: "Five language gates. Seven stones. One chance to stop the Universal Code",
    descKo: "5개의 언어 관문. 7개의 수호석. 유니버설 코드를 막을 마지막 기회",
    descEs: "Cinco puertas de idioma. Siete piedras. Una oportunidad de detener el Código Universal",
    characters: ["🏛️", "🦊", "🕴️"],
    scenes: 20,
    missionEn: "4 puzzles + 2 clues",
    missionKo: "퍼즐 4개 + 단서 2개",
    missionEs: "4 puzzles + 2 pistas",
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
    if ((ch as any).locked) return "locked";
    if (progress.completed.includes(ch.id)) return "completed";
    if (progress.unlocked.includes(ch.id)) return "available";
    return "locked";
  }

  const lingoMsg =
    lang === "korean"
      ? "견습생, 어서 와요! 🦊\nLexicon Society가 언어를 훔치고 있어요. 함께 막아봐요!"
      : lang === "spanish"
      ? "¡Bienvenido, Aprendiz! 🦊\nLa Sociedad Lexicon roba idiomas. ¡Detengámoslos juntos!"
      : "Welcome, Apprentice! 🦊\nThe Lexicon Society is stealing languages. Let's stop them!";

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
        colors={[C.bg2, C.bg1]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerEyebrow}>🦊 {lang === "korean" ? "루디 탐정의" : lang === "spanish" ? "Detective Rudy presenta" : "Detective Rudy presents"}</Text>
        <Text style={styles.headerTitle}>
          {lang === "korean"
            ? "언어 음모"
            : lang === "spanish"
            ? "La Conspiración del Lenguaje"
            : "The Language Conspiracy"}
        </Text>
        <Text style={styles.headerSub}>
          {lang === "korean"
            ? "∆LX — Lexicon Society의 비밀을 밝혀라"
            : lang === "spanish"
            ? "∆LX — Descubre el secreto de la Sociedad Lexicon"
            : "∆LX — Uncover the secrets of the Lexicon Society"}
        </Text>
      </LinearGradient>

      <View style={styles.lingoBanner}>
        <RudyMascot size={100} mood="excited" />
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
                        name="compass-outline"
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
  container: { flex: 1, backgroundColor: C.bg1 },
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 18 },
  headerEyebrow: {
    fontSize: 11,
    fontFamily: F.label,
    color: C.goldDim,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: F.title,
    color: C.gold,
    marginBottom: 4,
    letterSpacing: 2,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.goldDim,
    fontStyle: "italic",
  },
  lingoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: C.bg2,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  lingoSpeech: {
    flex: 1,
    backgroundColor: C.parchment,
    borderRadius: 14,
    padding: 10,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: C.parchmentDeep,
  },
  lingoSpeechText: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.textParchment,
    lineHeight: 20,
    fontStyle: "italic",
  },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  card: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.3)",
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
    backgroundColor: "rgba(201,162,39,0.15)",
    borderWidth: 1,
    borderColor: C.border,
  },
  chapterNum: {
    fontSize: 11,
    fontFamily: F.label,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: C.gold,
  },
  doneBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  doneText: {
    fontSize: 12,
    fontFamily: F.bodySemi,
    color: "#5a9",
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
    borderColor: "rgba(201,162,39,0.25)",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  charEmoji: { fontSize: 20 },
  cardTitle: {
    fontSize: 20,
    fontFamily: F.header,
    color: C.parchment,
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: F.body,
    color: "rgba(244,232,193,0.8)",
    marginBottom: 18,
    lineHeight: 20,
    fontStyle: "italic",
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
    fontFamily: F.body,
    color: "rgba(244,232,193,0.7)",
  },
  playBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: C.gold,
  },
  playBtnText: { fontSize: 13, fontFamily: F.header, color: C.bg1 },
  xpRow: { marginTop: 12 },
  xpText: {
    fontSize: 12,
    fontFamily: F.bodySemi,
    color: "rgba(201,162,39,0.6)",
  },
});
