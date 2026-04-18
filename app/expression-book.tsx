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
import { C, F } from "@/constants/theme";

// ─── Storage Key ─────────────────────────────────────────────────────────────

export const EXPRESSION_BOOK_KEY = "expressionBook";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Expression {
  phrase: string;
  meaning: string;
  collection?: string;
  chapter: string;
  tprsStage?: number;
  mastered: boolean;
  learnedAt: string; // ISO date
}

export interface ExpressionBookData {
  expressions: Expression[];
}

// ─── Chapter Info ────────────────────────────────────────────────────────────

const CHAPTER_INFO: Record<string, { emoji: string; name: { ko: string; en: string; es: string }; color: string }> = {
  ch1: { emoji: "🇬🇧", name: { ko: "런던", en: "London", es: "Londres" }, color: "#60A5FA" },
  ch2: { emoji: "🇪🇸", name: { ko: "마드리드", en: "Madrid", es: "Madrid" }, color: "#F59E0B" },
  ch3: { emoji: "🇰🇷", name: { ko: "서울", en: "Seoul", es: "Seúl" }, color: "#34D399" },
  ch4: { emoji: "🇪🇬", name: { ko: "카이로", en: "Cairo", es: "El Cairo" }, color: "#E879F9" },
  ch5: { emoji: "🌍", name: { ko: "바벨", en: "Babel", es: "Babel" }, color: "#FB923C" },
};

const TPRS_LABELS: Record<number, { ko: string; en: string; es: string }> = {
  1: { ko: "만남", en: "Encounter", es: "Encuentro" },
  2: { ko: "인식", en: "Recognize", es: "Reconocer" },
  3: { ko: "생산", en: "Produce", es: "Producir" },
  4: { ko: "적용", en: "Apply", es: "Aplicar" },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ExpressionBookScreen() {
  const insets = useSafeAreaInsets();
  const { nativeLanguage } = useLanguage();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const native = nativeLanguage ?? "english";
  const nl = native === "korean" ? "ko" : native === "spanish" ? "es" : "en";

  const [data, setData] = useState<ExpressionBookData>({ expressions: [] });
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(EXPRESSION_BOOK_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch (e) { console.warn('[ExpressionBook] load failed:', e); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Group by chapter
  const grouped = data.expressions.reduce<Record<string, Expression[]>>((acc, expr) => {
    (acc[expr.chapter] ??= []).push(expr);
    return acc;
  }, {});

  const totalExpressions = data.expressions.length;
  const masteredCount = data.expressions.filter((e) => e.mastered).length;

  const headerTitle = native === "korean" ? "표현 도감" : native === "spanish" ? "Libro de Expresiones" : "Expression Book";
  const headerSub = native === "korean"
    ? "스토리에서 배운 표현들을 모아보세요"
    : native === "spanish"
    ? "Colecciona las expresiones del modo historia"
    : "Collect expressions from story mode";

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
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

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{totalExpressions}</Text>
          <Text style={styles.statLabel}>
            {native === "korean" ? "총 표현" : native === "spanish" ? "Total" : "Total"}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: "#4caf50" }]}>{masteredCount}</Text>
          <Text style={styles.statLabel}>
            {native === "korean" ? "마스터" : native === "spanish" ? "Dominado" : "Mastered"}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNum, { color: "#F59E0B" }]}>{totalExpressions - masteredCount}</Text>
          <Text style={styles.statLabel}>
            {native === "korean" ? "학습 중" : native === "spanish" ? "Aprendiendo" : "Learning"}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 24 }]}
      >
        {totalExpressions === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>📖</Text>
            <Text style={styles.emptyText}>
              {native === "korean"
                ? "아직 배운 표현이 없어요.\n스토리 모드를 진행하면 자동으로 수집됩니다!"
                : native === "spanish"
                ? "Aún no has aprendido expresiones.\n¡Juega el modo historia para coleccionarlas!"
                : "No expressions learned yet.\nPlay story mode to collect them!"}
            </Text>
          </View>
        ) : (
          Object.entries(CHAPTER_INFO).map(([chId, info]) => {
            const expressions = grouped[chId] ?? [];
            if (expressions.length === 0) return null;
            const isExpanded = expandedChapter === chId;
            const chapterMastered = expressions.filter((e) => e.mastered).length;

            return (
              <View key={chId}>
                <Pressable
                  style={styles.chapterHeader}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setExpandedChapter(isExpanded ? null : chId);
                  }}
                >
                  <Text style={styles.chapterEmoji}>{info.emoji}</Text>
                  <View style={styles.chapterInfo}>
                    <Text style={styles.chapterName}>{info.name[nl]}</Text>
                    <Text style={styles.chapterCount}>
                      {chapterMastered}/{expressions.length} {native === "korean" ? "마스터" : "mastered"}
                    </Text>
                  </View>
                  {/* Progress ring (simple bar) */}
                  <View style={styles.miniBar}>
                    <View style={[styles.miniBarFill, {
                      width: `${expressions.length > 0 ? (chapterMastered / expressions.length) * 100 : 0}%` as any,
                      backgroundColor: info.color,
                    }]} />
                  </View>
                  <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color={C.goldDim} />
                </Pressable>

                {isExpanded && expressions.map((expr, i) => (
                  <View key={i} style={[styles.exprCard, expr.mastered && styles.exprCardMastered]}>
                    <View style={styles.exprRow}>
                      <Text style={styles.exprPhrase}>{expr.phrase}</Text>
                      {expr.mastered && <Text style={styles.exprCheck}>✅</Text>}
                    </View>
                    <Text style={styles.exprMeaning}>{expr.meaning}</Text>
                    <View style={styles.exprMeta}>
                      {expr.tprsStage && (
                        <View style={[styles.tprsBadge, { backgroundColor: info.color + "33" }]}>
                          <Text style={[styles.tprsBadgeText, { color: info.color }]}>
                            TPRS {expr.tprsStage}: {TPRS_LABELS[expr.tprsStage]?.[nl] ?? ""}
                          </Text>
                        </View>
                      )}
                      {expr.collection && (
                        <Text style={styles.collectionLabel}>{expr.collection.replace(/_/g, " ")}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

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

  statsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  statItem: { alignItems: "center", gap: 2 },
  statNum: { fontSize: 22, fontFamily: F.label, color: C.gold },
  statLabel: { fontSize: 11, fontFamily: F.body, color: C.textMuted },
  statDivider: { width: 1, height: 30, backgroundColor: C.border },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyEmoji: { fontSize: 48 },
  emptyText: {
    fontSize: 14,
    fontFamily: F.body,
    color: C.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },

  chapterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.bg2,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  chapterEmoji: { fontSize: 24 },
  chapterInfo: { flex: 1 },
  chapterName: { fontSize: 16, fontFamily: F.header, color: C.parchment },
  chapterCount: { fontSize: 11, fontFamily: F.body, color: C.goldDim },
  miniBar: {
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(201,162,39,0.15)",
    overflow: "hidden",
  },
  miniBarFill: { height: "100%", borderRadius: 3 },

  exprCard: {
    marginLeft: 20,
    backgroundColor: C.bg2,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: C.border,
    gap: 4,
  },
  exprCardMastered: {
    borderLeftColor: "#4caf50",
  },
  exprRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exprPhrase: {
    fontSize: 15,
    fontFamily: F.bodySemi,
    color: C.parchment,
    flex: 1,
  },
  exprCheck: { fontSize: 14 },
  exprMeaning: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.textMuted,
    lineHeight: 18,
  },
  exprMeta: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    flexWrap: "wrap",
  },
  tprsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tprsBadgeText: {
    fontSize: 10,
    fontFamily: F.bodySemi,
    letterSpacing: 0.5,
  },
  collectionLabel: {
    fontSize: 10,
    fontFamily: F.body,
    color: C.goldDim,
    fontStyle: "italic",
  },
});
