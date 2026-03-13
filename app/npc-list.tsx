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
import { NPCS, NPC, NPC_REL_LEVELS, NPC_EMOTIONS, getRelTier, getRelLabel, RelationshipTier } from "@/constants/npcs";
import { C, F } from "@/constants/theme";

const REL_KEY = "npcRelationships";
const EMO_KEY = "npcEmotions";

export default function NpcListScreen() {
  const insets = useSafeAreaInsets();
  const { learningLanguage, nativeLanguage } = useLanguage();
  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [relationships, setRelationships] = useState<Record<string, number>>({});
  const [emotions, setEmotions] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    try {
      const [relRaw, emoRaw] = await Promise.all([
        AsyncStorage.getItem(REL_KEY),
        AsyncStorage.getItem(EMO_KEY),
      ]);
      if (relRaw) setRelationships(JSON.parse(relRaw));
      if (emoRaw) setEmotions(JSON.parse(emoRaw));
    } catch {}
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [loadData]);

  const lang = learningLanguage ?? "english";
  const native = nativeLanguage ?? "english";

  const getScenarioLabel = (npc: NPC) => {
    if (lang === "korean") return npc.scenarioKo;
    if (lang === "spanish") return npc.scenarioEs;
    return npc.scenario;
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
                pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push({ pathname: "/npc-mission", params: { npcId: npc.id } });
              }}
            >
              <View style={[styles.emojiCircle, { backgroundColor: npc.color + "33", borderColor: npc.color + "88" }]}>
                <Text style={styles.emojiText}>{npc.emoji}</Text>
                <Text style={styles.emotionBadge}>{emojiIcon}</Text>
              </View>

              <View style={styles.npcInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.npcName}>{npc.name}</Text>
                  <View style={[styles.tierPill, { backgroundColor: level.color + "33", borderColor: level.color + "66" }]}>
                    <Text style={styles.tierHeart}>{level.heart}</Text>
                    <Text style={[styles.tierLabel, { color: level.color }]}>
                      {getRelLabel(tier, native)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.scenarioLabel}>{getScenarioLabel(npc)}</Text>

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
              </View>

              <Ionicons name="chevron-forward" size={16} color={C.goldDark} />
            </Pressable>
          );
        })}
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
});
