import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { C, F } from "@/constants/theme";
import {
  loadProgress,
  UNITS,
  getTri,
  langToCode,
  type DailyCourseProgress,
  type UnitData,
  type DayData,
} from "@/lib/dailyCourseData";

export default function RudyCourseScreen() {
  const insets = useSafeAreaInsets();
  const { nativeLanguage } = useLanguage();
  const nativeLang = (nativeLanguage ?? "english") as string;
  const lc = langToCode(nativeLang);

  const [progress, setProgress] = useState<DailyCourseProgress | null>(null);
  const [selectedUnitIdx, setSelectedUnitIdx] = useState(0);
  const [unitDropdownOpen, setUnitDropdownOpen] = useState(false);

  const loadData = useCallback(async () => {
    const p = await loadProgress();
    setProgress(p);
    setSelectedUnitIdx(p.currentUnitIndex);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  if (!progress) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top + 16 }]}>
        <ActivityIndicator color={C.gold} />
      </View>
    );
  }

  const currentUnit = UNITS[selectedUnitIdx] ?? UNITS[0];
  const activeDayId = UNITS[progress.currentUnitIndex]?.days[progress.currentDayIndex]?.id ?? "";

  // Progress within selected unit
  const unitDays = currentUnit.days;
  const completedInUnit = unitDays.filter((d) => progress.completedDays.includes(d.id)).length;

  // For locking: a day is unlocked if all previous days in that unit are completed OR it's the active day
  function getDayState(day: DayData): "completed" | "active" | "locked" {
    if (progress!.completedDays.includes(day.id)) return "completed";
    if (day.id === activeDayId) return "active";
    // find index within all days globally
    const allDays = UNITS.flatMap((u) => u.days);
    const dayGlobalIdx = allDays.findIndex((d) => d.id === day.id);
    const activeGlobalIdx = allDays.findIndex((d) => d.id === activeDayId);
    if (dayGlobalIdx <= activeGlobalIdx) return "active"; // unlocked but not today
    return "locked";
  }

  function handleDayPress(day: DayData) {
    const state = getDayState(day);
    if (state === "locked") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/rudy-lesson?dayId=${day.id}` as any);
  }

  const totalDays = UNITS.reduce((s, u) => s + u.days.length, 0);
  const completedDays = progress.completedDays.length;

  const headerLabel = nativeLang === "korean" ? "루디의 훈련소" : nativeLang === "spanish" ? "Campamento de Rudy" : "Rudy's Training Camp";
  const levelLabel = nativeLang === "korean" ? "현재 레벨" : nativeLang === "spanish" ? "Nivel Actual" : "Current Level";

  const unitLabelDropdown = nativeLang === "korean" ? "단원 선택" : nativeLang === "spanish" ? "Seleccionar Unidad" : "Select Unit";
  const startLabel = nativeLang === "korean" ? "시작하기" : nativeLang === "spanish" ? "Comenzar" : "Start";
  const todayLabel = nativeLang === "korean" ? "오늘" : nativeLang === "spanish" ? "Hoy" : "Today";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={C.gold} />
        </Pressable>
        <Text style={styles.headerTitle}>{headerLabel}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Level + progress summary ─────────────────────── */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.levelPill}>
            <Text style={styles.levelPillText}>{progress.currentLevel}</Text>
          </View>
          <Text style={styles.summaryLabel}>
            {levelLabel}: {getTri(UNITS[progress.currentUnitIndex]?.title ?? UNITS[0].title, lc)}
          </Text>
        </View>
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${totalDays > 0 ? (completedDays / totalDays) * 100 : 0}%` }]} />
          </View>
          <Text style={styles.progressLabel}>Day {completedDays}/{totalDays}</Text>
        </View>
      </View>

      {/* ── Unit dropdown ────────────────────────────────── */}
      <View style={styles.dropdownWrapper}>
        <Pressable
          style={styles.dropdownBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setUnitDropdownOpen((v) => !v);
          }}
        >
          <Text style={styles.dropdownBtnText}>{getTri(currentUnit.title, lc)}</Text>
          <Ionicons name={unitDropdownOpen ? "chevron-up" : "chevron-down"} size={16} color={C.gold} />
        </Pressable>

        {unitDropdownOpen && (
          <View style={styles.dropdownList}>
            {UNITS.map((unit, i) => (
              <Pressable
                key={unit.id}
                style={[styles.dropdownItem, i === selectedUnitIdx && styles.dropdownItemActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedUnitIdx(i);
                  setUnitDropdownOpen(false);
                }}
              >
                <View style={styles.dropdownItemLeft}>
                  <View style={[styles.levelDot, { backgroundColor: i === selectedUnitIdx ? C.gold : C.goldDim }]} />
                  <Text style={[styles.dropdownItemText, i === selectedUnitIdx && styles.dropdownItemTextActive]}>
                    {getTri(unit.title, lc)}
                  </Text>
                </View>
                <Text style={styles.dropdownItemLevel}>{unit.level}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* ── Day list ─────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {unitDays.map((day, i) => {
          const state = getDayState(day);
          const isActive = state === "active";
          const isDone = state === "completed";
          const isLocked = state === "locked";
          const isToday = day.id === activeDayId;

          return (
            <Pressable
              key={day.id}
              style={({ pressed }) => [
                styles.dayRow,
                isDone && styles.dayRowDone,
                isActive && styles.dayRowActive,
                isLocked && styles.dayRowLocked,
                pressed && !isLocked && { opacity: 0.8, transform: [{ scale: 0.99 }] },
              ]}
              onPress={() => handleDayPress(day)}
            >
              {/* Status icon */}
              <View style={[styles.dayIcon, isDone && styles.dayIconDone, isActive && styles.dayIconActive, isLocked && styles.dayIconLocked]}>
                {isDone ? (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                ) : isLocked ? (
                  <Ionicons name="lock-closed" size={14} color={C.goldDim} />
                ) : (
                  <Ionicons name="play" size={16} color={C.bg1} />
                )}
              </View>

              {/* Text */}
              <View style={styles.dayText}>
                <View style={styles.dayTitleRow}>
                  <Text style={[styles.dayNum, isLocked && styles.textFaded]}>
                    Day {day.dayNumber}
                  </Text>
                  {isToday && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>{todayLabel}</Text>
                    </View>
                  )}
                  {isDone && (
                    <Text style={styles.dayXP}>+100 XP</Text>
                  )}
                </View>
                <Text style={[styles.dayTopic, isLocked && styles.textFaded]}>
                  {getTri(day.topic, lc)}
                </Text>
              </View>

              {/* Action */}
              {isActive && (
                <View style={styles.startBtn}>
                  <Text style={styles.startBtnText}>{startLabel}</Text>
                  <Ionicons name="arrow-forward" size={12} color={C.bg1} />
                </View>
              )}
              {isDone && (
                <Ionicons name="checkmark-circle" size={22} color="#5a9" />
              )}
              {isLocked && (
                <Ionicons name="lock-closed-outline" size={18} color={C.goldDim} style={{ opacity: 0.5 }} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg1 },
  centered:  { flex: 1, backgroundColor: C.bg1, alignItems: "center", justifyContent: "center" },

  /* Header */
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "rgba(201,162,39,0.2)",
  },
  backBtn:     { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 19, fontFamily: F.header, color: C.gold, letterSpacing: 1 },

  /* Summary card */
  summaryCard: {
    marginHorizontal: 16, marginTop: 12, marginBottom: 10,
    backgroundColor: C.bg2, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.border,
    gap: 12,
  },
  summaryRow:  { flexDirection: "row", alignItems: "center", gap: 10 },
  levelPill: {
    backgroundColor: "rgba(201,162,39,0.18)", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: C.border,
  },
  levelPillText: { fontSize: 13, fontFamily: F.header, color: C.gold, letterSpacing: 1 },
  summaryLabel:  { fontSize: 13, fontFamily: F.body, color: C.parchment, flex: 1 },
  progressRow:   { flexDirection: "row", alignItems: "center", gap: 10 },
  progressTrack: {
    flex: 1, height: 7, backgroundColor: "rgba(201,162,39,0.12)",
    borderRadius: 4, borderWidth: 0.5, borderColor: C.border, overflow: "hidden",
  },
  progressFill:  { height: "100%", backgroundColor: C.gold, borderRadius: 4 },
  progressLabel: { fontSize: 12, fontFamily: F.bodySemi, color: C.goldDim, width: 72, textAlign: "right" },

  /* Dropdown */
  dropdownWrapper:  { marginHorizontal: 16, marginBottom: 8, zIndex: 10 },
  dropdownBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: C.bg2, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: C.border,
  },
  dropdownBtnText: { fontSize: 14, fontFamily: F.bodySemi, color: C.parchment, flex: 1 },
  dropdownList: {
    position: "absolute", top: 46, left: 0, right: 0,
    backgroundColor: C.bg2, borderRadius: 12, borderWidth: 1, borderColor: C.border,
    overflow: "hidden", zIndex: 100,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 10,
  },
  dropdownItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 13,
    borderBottomWidth: 0.5, borderBottomColor: "rgba(201,162,39,0.12)",
  },
  dropdownItemActive: { backgroundColor: "rgba(201,162,39,0.1)" },
  dropdownItemLeft:   { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  levelDot:           { width: 6, height: 6, borderRadius: 3 },
  dropdownItemText:   { fontSize: 13, fontFamily: F.body, color: C.goldDim },
  dropdownItemTextActive: { color: C.parchment, fontFamily: F.bodySemi },
  dropdownItemLevel:  { fontSize: 11, fontFamily: F.label, color: C.goldDim },

  /* Day list */
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, gap: 10 },

  dayRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: C.bg2, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: C.border,
  },
  dayRowDone:   { borderColor: "rgba(90,170,90,0.35)", backgroundColor: "rgba(90,170,90,0.05)" },
  dayRowActive: { borderColor: C.gold, shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  dayRowLocked: { opacity: 0.55 },

  dayIcon: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(201,162,39,0.15)",
    borderWidth: 1, borderColor: C.border,
  },
  dayIconDone:   { backgroundColor: "#5a9", borderColor: "#5a9" },
  dayIconActive: { backgroundColor: C.gold, borderColor: C.gold },
  dayIconLocked: { backgroundColor: "rgba(100,80,40,0.1)" },

  dayText:     { flex: 1, gap: 3 },
  dayTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  dayNum:      { fontSize: 14, fontFamily: F.bodySemi, color: C.parchment },
  dayTopic:    { fontSize: 12, fontFamily: F.body, color: C.goldDim },
  dayXP:       { fontSize: 11, fontFamily: F.label, color: C.gold },
  textFaded:   { color: "#7a6545" },

  todayBadge: {
    backgroundColor: "rgba(201,162,39,0.2)", paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6, borderWidth: 1, borderColor: C.border,
  },
  todayBadgeText: { fontSize: 9, fontFamily: F.label, color: C.gold, letterSpacing: 0.5 },

  startBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: C.gold, paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: 10,
  },
  startBtnText: { fontSize: 11, fontFamily: F.header, color: C.bg1, letterSpacing: 0.3 },
});
