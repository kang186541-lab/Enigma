/**
 * Chapter Result Screen — shown after completing all quizzes in a chapter.
 * Displays gauge grade, stats, NPC relationship changes, badges, and unlock info.
 */
import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, Pressable, Animated, Easing,
} from "react-native";
import { useLanguage } from "@/context/LanguageContext";
import type {
  ChapterResult, GaugeGrade, LangCode,
} from "@/constants/storyTypes";
import { GAUGE_GRADE_META } from "@/constants/storyTypes";
import { pick, getNpcById, toLangCode } from "@/lib/storyUtils";
import { playSfx } from "@/lib/audioManager";

interface Props {
  result: ChapterResult;
  onContinue: () => void;
}

export default function ChapterResultScreen({ result, onContinue }: Props) {
  const { nativeLanguage, t } = useLanguage();
  const lang = toLangCode(nativeLanguage) as LangCode;

  // Animations
  const badgeScale = useRef(new Animated.Value(0)).current;
  const gradeOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    playSfx("chapterClear");

    Animated.sequence([
      // Grade reveal
      Animated.timing(gradeOpacity, {
        toValue: 1, duration: 500, useNativeDriver: true,
      }),
      // Badge bounce
      Animated.spring(badgeScale, {
        toValue: 1, tension: 60, friction: 8, useNativeDriver: true,
      }),
      // Content slide up
      Animated.timing(contentSlide, {
        toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const gradeMeta = GAUGE_GRADE_META[result.gaugeGrade];
  const stars = result.correctRate >= 90 ? 3 : result.correctRate >= 70 ? 2 : 1;

  return (
    <View style={styles.container}>
      {/* Grade Badge */}
      <Animated.View style={[styles.gradeSection, { opacity: gradeOpacity }]}>
        <Animated.Text style={[styles.gradeIcon, { transform: [{ scale: badgeScale }] }]}>
          {gradeMeta.icon}
        </Animated.Text>
        <Text style={[styles.gradeLabel, { color: gradeMeta.color }]}>
          {pick(gradeMeta.label, lang)}
        </Text>
        <Text style={styles.gaugeValue}>{result.gaugeFinal}%</Text>
      </Animated.View>

      {/* Stats */}
      <Animated.View style={[styles.statsSection, { transform: [{ translateY: contentSlide }] }]}>
        {/* Stars */}
        <View style={styles.starsRow}>
          {[1, 2, 3].map(i => (
            <Text key={i} style={[styles.star, i <= stars && styles.starActive]}>
              {i <= stars ? "\u2B50" : "\u2606"}
            </Text>
          ))}
        </View>

        {/* Stat items */}
        <StatItem
          icon="\u2705"
          label={lang === "ko" ? "\uC815\uB2F5\uB960" : lang === "es" ? "Precisión" : "Accuracy"}
          value={`${result.correctRate}%`}
        />
        <StatItem
          icon="\uD83D\uDD0D"
          label={lang === "ko" ? "\uC218\uC9D1\uD55C \uB2E8\uC11C" : lang === "es" ? "Pistas" : "Clues"}
          value={`${result.cluesFound}/${result.cluesTotal}`}
        />
        <StatItem
          icon="\u2728"
          label={lang === "ko" ? "\uD68D\uB4DD XP" : lang === "es" ? "XP Ganado" : "XP Earned"}
          value={`+${result.xpEarned}`}
        />
        <StatItem
          icon="\uD83D\uDCD6"
          label={lang === "ko" ? "\uC0C8 \uD45C\uD604" : lang === "es" ? "Nuevas" : "New Words"}
          value={`${result.newExpressions.length}`}
        />

        {/* NPC Relationship Changes */}
        {Object.keys(result.npcRelationChanges).length > 0 && (
          <View style={styles.npcSection}>
            <Text style={styles.npcTitle}>
              {lang === "ko" ? "NPC \uD638\uAC10\uB3C4" : lang === "es" ? "Relaciones NPC" : "NPC Relations"}
            </Text>
            {Object.entries(result.npcRelationChanges).map(([npcId, change]) => {
              const npc = getNpcById(npcId);
              if (!npc) return null;
              const npcName = typeof npc.name === "string" ? npc.name : pick(npc.name as Record<"ko"|"en"|"es", string>, lang);
              return (
                <View key={npcId} style={styles.npcRow}>
                  <Text style={styles.npcName}>{npcName}</Text>
                  <Text style={[styles.npcChange, change > 0 ? styles.npcPositive : styles.npcNegative]}>
                    {change > 0 ? `\u2764\uFE0F +${change}` : `\uD83D\uDC94 ${change}`}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Badge */}
        {result.badgeEarned && (
          <View style={styles.badgeRow}>
            <Text style={styles.badgeIcon}>\uD83C\uDFC5</Text>
            <Text style={styles.badgeText}>
              {lang === "ko" ? "\uBC43\uC9C0 \uD68D\uB4DD!" : lang === "es" ? "\u00A1Insignia!" : "Badge Earned!"}
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Continue Button */}
      <Pressable
        style={({ pressed }) => [styles.continueBtn, pressed && styles.continueBtnPressed]}
        onPress={onContinue}
      >
        <Text style={styles.continueBtnText}>
          {result.badgeEarned
            ? (lang === "ko" ? "\uB2E4\uC74C \uCC55\uD130 \uD574\uAE08!" : lang === "es" ? "\u00A1Siguiente Capítulo!" : "Next Chapter!")
            : (lang === "ko" ? "\uACC4\uC18D" : lang === "es" ? "Continuar" : "Continue")
          }
        </Text>
      </Pressable>
    </View>
  );
}

function StatItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: "#0A0A1A", padding: 24,
    justifyContent: "center", alignItems: "center",
  },
  gradeSection: { alignItems: "center", marginBottom: 32 },
  gradeIcon: { fontSize: 72 },
  gradeLabel: { fontSize: 28, fontWeight: "800", marginTop: 8 },
  gaugeValue: { fontSize: 18, color: "#888", marginTop: 4 },
  statsSection: { width: "100%", maxWidth: 360 },
  starsRow: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  star: { fontSize: 32, marginHorizontal: 4, color: "#444" },
  starActive: { color: "#FFD700" },
  statRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#1A1A2E",
  },
  statIcon: { fontSize: 20, width: 32 },
  statLabel: { flex: 1, fontSize: 16, color: "#CCC" },
  statValue: { fontSize: 18, fontWeight: "700", color: "#C9A227" },
  npcSection: { marginTop: 16 },
  npcTitle: { fontSize: 14, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  npcRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  npcName: { fontSize: 16, color: "#CCC" },
  npcChange: { fontSize: 16, fontWeight: "600" },
  npcPositive: { color: "#FF6B9D" },
  npcNegative: { color: "#666" },
  badgeRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 20 },
  badgeIcon: { fontSize: 28, marginRight: 8 },
  badgeText: { fontSize: 18, fontWeight: "700", color: "#C9A227" },
  continueBtn: {
    marginTop: 32, backgroundColor: "#C9A227", paddingHorizontal: 48, paddingVertical: 16,
    borderRadius: 12,
  },
  continueBtnPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  continueBtnText: { fontSize: 18, fontWeight: "800", color: "#0A0A1A" },
});
