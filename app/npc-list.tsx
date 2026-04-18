import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage } from "@/context/LanguageContext";
import { NPCS, NPC, NPC_REL_LEVELS, NPC_EMOTIONS, getRelTier, getRelLabel, RelationshipTier, NPC_UNLOCK_CHAPTER, CHAPTER_ID_MAP } from "@/constants/npcs";
import { C, F } from "@/constants/theme";

const REL_KEY = "npcRelationships";
const EMO_KEY = "npcEmotions";
const STORY_PROGRESS_KEY = "lingo_story_progress";

// ─── Language Wound Data ──────────────────────────────────────────────────────
import languageWoundsRaw from "@/data/storyMode/characters.json";

interface LanguageWound {
  npcId: string;
  name: { ko: string; en: string; es: string };
  chapter: string;
  wound: { ko: string; en: string; es: string };
  unlockTier: string;
  emoji: string;
}

const LANGUAGE_WOUNDS: LanguageWound[] = Object.values(
  (languageWoundsRaw as any).languageWounds ?? {}
);

const TIER_ORDER = ["stranger", "familiar", "friendly", "close"];
function isTierUnlocked(currentTier: string, requiredTier: string): boolean {
  return TIER_ORDER.indexOf(currentTier) >= TIER_ORDER.indexOf(requiredTier);
}

export default function NpcListScreen() {
  const insets = useSafeAreaInsets();
  const { learningLanguage, nativeLanguage } = useLanguage();
  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [relationships, setRelationships] = useState<Record<string, number>>({});
  const [emotions, setEmotions] = useState<Record<string, string>>({});
  const [storyProgress, setStoryProgress] = useState<{ completed: string[]; unlocked: string[] }>({ completed: [], unlocked: [] });
  const [expandedWound, setExpandedWound] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [relRaw, emoRaw, spRaw] = await Promise.all([
        AsyncStorage.getItem(REL_KEY),
        AsyncStorage.getItem(EMO_KEY),
        AsyncStorage.getItem(STORY_PROGRESS_KEY),
      ]);
      if (relRaw) setRelationships(JSON.parse(relRaw));
      if (emoRaw) setEmotions(JSON.parse(emoRaw));
      if (spRaw) setStoryProgress(JSON.parse(spRaw));
    } catch (e) { console.warn('[NpcList] data load failed:', e); }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [loadData]);

  const lang = learningLanguage ?? "english";
  const native = nativeLanguage ?? "english";

  const getScenarioLabel = (npc: NPC) => {
    const nativeName = native === "korean" ? npc.scenarioKo : native === "spanish" ? npc.scenarioEs : npc.scenario;
    const learnName  = lang === "korean" ? npc.scenarioKo : lang === "spanish" ? npc.scenarioEs : npc.scenario;
    if (native === lang) return nativeName;
    return `${nativeName} (${learnName})`;
  };

  // Check if NPC is unlocked based on story progress
  const isNpcUnlocked = (npcId: string): boolean => {
    const requiredChapter = NPC_UNLOCK_CHAPTER[npcId];
    if (!requiredChapter) return true; // null = always unlocked
    const storyChapterId = CHAPTER_ID_MAP[requiredChapter];
    return storyProgress.completed.includes(storyChapterId);
  };

  const getUnlockLabel = (npcId: string): string => {
    const ch = NPC_UNLOCK_CHAPTER[npcId];
    if (!ch) return "";
    const chNum = ch.replace("ch", "");
    const chNames: Record<string, Record<string, string>> = {
      "1": { korean: "Ch1 런던", spanish: "Ch1 Londres", english: "Ch1 London" },
      "2": { korean: "Ch2 마드리드", spanish: "Ch2 Madrid", english: "Ch2 Madrid" },
      "3": { korean: "Ch3 서울", spanish: "Ch3 Seúl", english: "Ch3 Seoul" },
      "4": { korean: "Ch4 카이로", spanish: "Ch4 El Cairo", english: "Ch4 Cairo" },
    };
    const chName = chNames[chNum]?.[native] ?? `Ch${chNum}`;
    return native === "korean"
      ? `${chName} 완료 시 해금`
      : native === "spanish"
      ? `Se desbloquea al completar ${chName}`
      : `Unlocks after completing ${chName}`;
  };

  const headerTitle = native === "korean" ? "실전 미션" : native === "spanish" ? "Misión Real" : "Real Missions";
  const headerSub = native === "korean"
    ? "NPC와 대화하며 실전 언어를 연습하세요"
    : native === "spanish"
    ? "Practica el idioma real con los NPC"
    : "Practice real-world language with NPCs";

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.65 }]}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={20} color={C.gold} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <Text style={styles.headerSub}>{headerSub}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 24 }]}
      >
        {NPCS.map((npc) => {
          const unlocked = isNpcUnlocked(npc.id);
          const score = relationships[npc.id] ?? 0;
          const tier: RelationshipTier = getRelTier(score);
          const level = NPC_REL_LEVELS[tier];
          const emotion = emotions[npc.id] ?? "neutral";
          const emojiIcon = NPC_EMOTIONS[emotion] ?? "😐";

          return (
            <Pressable
              key={npc.id}
              style={({ pressed }) => [
                styles.npcCard,
                !unlocked && styles.npcCardLocked,
                pressed && unlocked && { transform: [{ scale: 0.97 }], opacity: 0.9 },
              ]}
              onPress={() => {
                if (!unlocked) return;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push({ pathname: "/npc-mission", params: { npcId: npc.id } });
              }}
            >
              <View style={[styles.emojiCircle, { backgroundColor: npc.color + "33", borderColor: npc.color + "88" }]}>
                <Text style={styles.emojiText}>{unlocked ? npc.emoji : "🔒"}</Text>
                {unlocked && <Text style={styles.emotionBadge}>{emojiIcon}</Text>}
              </View>

              <View style={styles.npcInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.npcName, !unlocked && { color: C.goldDim }]}>{npc.name}</Text>
                  {unlocked ? (
                    <View style={[styles.tierPill, { backgroundColor: level.color + "33", borderColor: level.color + "66" }]}>
                      <Text style={styles.tierHeart}>{level.heart}</Text>
                      <Text style={[styles.tierLabel, { color: level.color }]}>
                        {getRelLabel(tier, native)}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.tierPill, { backgroundColor: "rgba(150,150,150,0.15)", borderColor: "rgba(150,150,150,0.3)" }]}>
                      <Text style={[styles.tierLabel, { color: "#999" }]}>
                        {getUnlockLabel(npc.id)}
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={styles.scenarioLabel}>{getScenarioLabel(npc)}</Text>

                {unlocked && (
                  <View style={styles.barRow}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${Math.min(100, score)}%` as any, backgroundColor: level.color },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barScore, { color: level.color }]}>{Math.round(score)}/100</Text>
                  </View>
                )}
              </View>

              {unlocked && <Ionicons name="chevron-forward" size={16} color={C.goldDark} />}
            </Pressable>
          );
        })}

        {/* ── Story NPC Language Wounds ─────────────────────────── */}
        {LANGUAGE_WOUNDS.length > 0 && (
          <>
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionTitle}>
              {native === "korean" ? "🩹 NPC 언어의 상처" : native === "spanish" ? "🩹 Heridas Lingüísticas" : "🩹 Language Wounds"}
            </Text>
            <Text style={styles.sectionSub}>
              {native === "korean"
                ? "스토리를 진행하며 NPC의 숨겨진 아픔을 발견하세요"
                : native === "spanish"
                ? "Descubre el dolor oculto de cada NPC mientras avanzas"
                : "Discover each NPC's hidden pain as you progress"}
            </Text>

            {LANGUAGE_WOUNDS.map((w) => {
              const chapterCompleted = storyProgress.completed.includes(
                w.chapter === "ch1" ? "london" : w.chapter === "ch2" ? "madrid" : w.chapter === "ch3" ? "seoul" : w.chapter === "ch4" ? "cairo" : "babel"
              ) || storyProgress.unlocked.includes(
                w.chapter === "ch1" ? "madrid" : w.chapter === "ch2" ? "seoul" : w.chapter === "ch3" ? "cairo" : w.chapter === "ch4" ? "babel" : "done"
              );
              // For story NPCs, use story progress as proxy for relationship
              const storyRelScore = relationships[w.npcId] ?? (chapterCompleted ? 50 : 0);
              const currentTier = storyRelScore >= 80 ? "close" : storyRelScore >= 60 ? "friendly" : storyRelScore >= 30 ? "familiar" : "stranger";
              const unlocked = isTierUnlocked(currentTier, w.unlockTier);
              const isExpanded = expandedWound === w.npcId;

              const npcName = native === "korean" ? w.name.ko : native === "spanish" ? w.name.es : w.name.en;
              const chapterLabel = w.chapter.replace("ch", "Ch.");

              return (
                <Pressable
                  key={w.npcId}
                  style={[styles.woundCard, !unlocked && styles.woundCardLocked]}
                  onPress={() => {
                    if (unlocked) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setExpandedWound(isExpanded ? null : w.npcId);
                    }
                  }}
                >
                  <View style={styles.woundHeader}>
                    <Text style={styles.woundEmoji}>{unlocked ? w.emoji : "🔒"}</Text>
                    <View style={styles.woundInfo}>
                      <Text style={styles.woundName}>{npcName}</Text>
                      <Text style={styles.woundChapter}>{chapterLabel}</Text>
                    </View>
                    {unlocked && (
                      <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={C.goldDim} />
                    )}
                  </View>
                  {unlocked && isExpanded && (
                    <Text style={styles.woundText}>
                      {native === "korean" ? w.wound.ko : native === "spanish" ? w.wound.es : w.wound.en}
                    </Text>
                  )}
                  {!unlocked && (
                    <Text style={styles.woundLockedText}>
                      {native === "korean"
                        ? `${npcName}과(와) 더 친해지면 열립니다`
                        : native === "spanish"
                        ? `Aumenta tu relación con ${npcName}`
                        : `Increase your bond with ${npcName}`}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { padding: 4 },
  headerText: { flex: 1 },
  headerTitle: {
    fontSize: 20,
    fontFamily: F.title,
    color: C.gold,
    letterSpacing: 2,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.goldDim,
    fontStyle: "italic",
    lineHeight: 18,
    marginTop: 2,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },

  npcCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.bg2,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  npcCardLocked: {
    opacity: 0.5,
  },

  emojiCircle: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    position: "relative",
  },
  emojiText: { fontSize: 24 },
  emotionBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    fontSize: 14,
    backgroundColor: C.bg1,
    borderRadius: 8,
    padding: 1,
  },

  npcInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  npcName: { fontSize: 16, fontFamily: F.header, color: C.parchment },
  tierPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  tierHeart: { fontSize: 10 },
  tierLabel: { fontSize: 10, fontFamily: F.bodySemi },
  scenarioLabel: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.goldDim,
    fontStyle: "italic",
  },
  barRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  barTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(201,162,39,0.15)",
    overflow: "hidden",
  },
  barFill: { height: 5, borderRadius: 3 },
  barScore: { fontSize: 11, fontFamily: F.bodySemi, minWidth: 40, textAlign: "right" },

  // Language Wounds section
  sectionDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: F.title,
    color: C.gold,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.goldDim,
    fontStyle: "italic",
    marginBottom: 12,
  },
  woundCard: {
    backgroundColor: C.bg2,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  woundCardLocked: {
    opacity: 0.5,
  },
  woundHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  woundEmoji: { fontSize: 24 },
  woundInfo: { flex: 1 },
  woundName: { fontSize: 15, fontFamily: F.header, color: C.parchment },
  woundChapter: { fontSize: 11, fontFamily: F.body, color: C.goldDim },
  woundText: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.parchment,
    lineHeight: 20,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  woundLockedText: {
    fontSize: 11,
    fontFamily: F.body,
    color: C.textMuted,
    fontStyle: "italic",
    marginTop: 4,
  },
});
