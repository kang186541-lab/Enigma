import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { C, F } from "@/constants/theme";

interface GrammarTip {
  pattern: { ko: string; en: string; es: string };
  examples: Array<{ ko: string; en: string; es: string }>;
  mistakes?: Array<{ ko: string; en: string; es: string }>;
  rudyTip?: { ko: string; en: string; es: string };
}

interface Props {
  visible: boolean;
  tip: GrammarTip | null;
  lang: "ko" | "en" | "es";
  onClose: () => void;
}

export function GrammarTipCard({ visible, tip, lang, onClose }: Props) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.8);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 200, friction: 10, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!tip) return null;

  const g = (obj: Record<string, string>) => obj[lang] || obj.en;
  const L = (ko: string, en: string, es: string) => lang === "ko" ? ko : lang === "es" ? es : en;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[styles.cardWrap, { opacity, transform: [{ scale }] }]}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <LinearGradient colors={[C.bg2, C.bg3]} style={styles.card}>
              {/* Header */}
              <View style={styles.headerRow}>
                <Text style={styles.headerIcon}>📖</Text>
                <Text style={styles.headerTitle}>{L("문법 팁", "Grammar Tip", "Consejo Gramatical")}</Text>
                <Pressable onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={C.goldDim} />
                </Pressable>
              </View>

              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                {/* Pattern */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>{L("패턴", "Pattern", "Patrón")}</Text>
                  <Text style={styles.patternText}>{g(tip.pattern)}</Text>
                </View>

                {/* Examples */}
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>{L("예시", "Examples", "Ejemplos")}</Text>
                  {tip.examples.map((ex, i) => (
                    <View key={i} style={styles.exampleRow}>
                      <Text style={styles.exampleBullet}>•</Text>
                      <Text style={styles.exampleText}>{g(ex)}</Text>
                    </View>
                  ))}
                </View>

                {/* Common Mistakes */}
                {tip.mistakes && tip.mistakes.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: C.error }]}>
                      {L("자주 하는 실수", "Common Mistakes", "Errores Comunes")}
                    </Text>
                    {tip.mistakes.map((m, i) => (
                      <View key={i} style={styles.exampleRow}>
                        <Text style={styles.exampleBullet}>✗</Text>
                        <Text style={[styles.exampleText, { color: "#e88" }]}>{g(m)}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Rudy's Tip */}
                {tip.rudyTip && (
                  <View style={[styles.section, styles.rudySection]}>
                    <Text style={styles.rudyLabel}>🦊 {L("루디의 팁", "Rudy's Tip", "Consejo de Rudy")}</Text>
                    <Text style={styles.rudyText}>{g(tip.rudyTip)}</Text>
                  </View>
                )}
              </ScrollView>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  cardWrap: {
    width: "100%",
    maxWidth: 420,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.gold,
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  headerIcon: { fontSize: 20 },
  headerTitle: {
    flex: 1,
    fontFamily: F.header,
    fontSize: 18,
    color: C.gold,
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: F.label,
    fontSize: 12,
    color: C.goldDim,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  patternText: {
    fontFamily: F.bodyBold,
    fontSize: 17,
    color: C.parchment,
    lineHeight: 24,
  },
  exampleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  exampleBullet: {
    fontFamily: F.body,
    fontSize: 15,
    color: C.goldDim,
    lineHeight: 22,
  },
  exampleText: {
    flex: 1,
    fontFamily: F.body,
    fontSize: 15,
    color: C.parchment,
    lineHeight: 22,
  },
  rudySection: {
    backgroundColor: "rgba(201,162,39,0.08)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: C.goldFaint,
  },
  rudyLabel: {
    fontFamily: F.bodySemi,
    fontSize: 14,
    color: C.gold,
    marginBottom: 4,
  },
  rudyText: {
    fontFamily: F.body,
    fontSize: 14,
    color: C.parchmentDark,
    fontStyle: "italic",
    lineHeight: 20,
  },
});
