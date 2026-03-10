import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLanguage } from "@/context/LanguageContext";

const PHRASES = [
  { target: "안녕하세요", romaji: "Annyeonghaseyo", meaning: "Hello / Good day", level: "A1" },
  { target: "감사합니다", romaji: "Gamsahamnida", meaning: "Thank you very much", level: "A1" },
  { target: "어디에 있어요?", romaji: "Eodie isseoyo?", meaning: "Where is it?", level: "A2" },
  { target: "얼마예요?", romaji: "Eolmayeyo?", meaning: "How much is it?", level: "A2" },
  { target: "잘 부탁드립니다", romaji: "Jal butakdeurimnida", meaning: "Please treat me well", level: "B1" },
];

type RecordState = "idle" | "listening" | "done";

export default function SpeakScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [phraseIdx, setPhraseIdx] = useState(0);
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [score, setScore] = useState<number | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const phrase = PHRASES[phraseIdx];

  const startPulse = () => {
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulseLoop.current.start();
  };

  const stopPulse = () => {
    pulseLoop.current?.stop();
    Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const handleRecord = () => {
    if (recordState === "idle") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setRecordState("listening");
      setScore(null);
      startPulse();
      setTimeout(() => {
        stopPulse();
        const randomScore = Math.floor(65 + Math.random() * 35);
        setScore(randomScore);
        setRecordState("done");
        Haptics.notificationAsync(
          randomScore >= 80 ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning
        );
      }, 2500);
    } else if (recordState === "done") {
      setRecordState("idle");
      setScore(null);
    }
  };

  const nextPhrase = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhraseIdx((i) => (i + 1) % PHRASES.length);
    setRecordState("idle");
    setScore(null);
  };

  const getScoreColor = (s: number) => {
    if (s >= 85) return "#4CAF50";
    if (s >= 70) return "#FF9800";
    return "#F44336";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 85) return t("great_job");
    if (s >= 70) return "Good effort!";
    return t("try_again");
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: topPad }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <LinearGradient colors={["#FFF0F6", "#FFF8FB"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>{t("speak_title")}</Text>
        <Text style={styles.subtitle}>{t("speak_subtitle")}</Text>
      </View>

      <View style={styles.phraseCard}>
        <LinearGradient
          colors={["#FFFFFF", "#FFF0F6"]}
          style={styles.phraseGradient}
        >
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{phrase.level}</Text>
          </View>
          <Text style={styles.phraseTarget}>{phrase.target}</Text>
          <Text style={styles.phraseRomaji}>{phrase.romaji}</Text>
          <View style={styles.divider} />
          <Text style={styles.phraseMeaning}>{phrase.meaning}</Text>
        </LinearGradient>
      </View>

      <View style={styles.progressDots}>
        {PHRASES.map((_, i) => (
          <View key={i} style={[styles.dot, i === phraseIdx && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.micSection}>
        {recordState === "done" && score !== null ? (
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreCircle, { borderColor: getScoreColor(score) }]}>
              <Text style={[styles.scoreNumber, { color: getScoreColor(score) }]}>{score}</Text>
              <Text style={styles.scorePercent}>%</Text>
            </View>
            <Text style={[styles.scoreLabel, { color: getScoreColor(score) }]}>{getScoreLabel(score)}</Text>
          </View>
        ) : (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              style={({ pressed }) => [
                styles.micBtn,
                recordState === "listening" && styles.micBtnActive,
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleRecord}
            >
              <LinearGradient
                colors={recordState === "listening" ? ["#FF4081", "#FF1744"] : ["#FF6B9D", "#FF4081"]}
                style={StyleSheet.absoluteFill}
              />
              <Ionicons
                name={recordState === "listening" ? "stop" : "mic"}
                size={48}
                color="#FFFFFF"
              />
            </Pressable>
          </Animated.View>
        )}

        <Text style={styles.micHint}>
          {recordState === "idle"
            ? t("tap_to_speak")
            : recordState === "listening"
            ? t("listening")
            : `${t("score")}: ${score}%`}
        </Text>
      </View>

      <View style={styles.actionRow}>
        {recordState === "done" && (
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.retryBtn, pressed && { opacity: 0.85 }]}
            onPress={handleRecord}
          >
            <Ionicons name="refresh" size={18} color="#FF6B9D" />
            <Text style={styles.retryText}>{t("try_again")}</Text>
          </Pressable>
        )}
        <Pressable
          style={({ pressed }) => [styles.actionBtn, styles.nextBtn, pressed && { opacity: 0.85 }]}
          onPress={nextPhrase}
        >
          <Text style={styles.nextText}>{t("next")}</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Tips</Text>
        <Text style={styles.tipsText}>Speak clearly and at a natural pace. Korean has a Subject-Object-Verb word order.</Text>
      </View>

      <View style={{ height: Math.max(insets.bottom + 100, 120) }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 20,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#A08090",
  },
  phraseCard: {
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 5,
  },
  phraseGradient: {
    padding: 28,
    alignItems: "center",
    gap: 8,
  },
  levelBadge: {
    backgroundColor: "#FF6B9D18",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
  },
  levelText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#FF6B9D",
    letterSpacing: 1,
  },
  phraseTarget: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
    textAlign: "center",
  },
  phraseRomaji: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    color: "#A08090",
    textAlign: "center",
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: "#F0D6E4",
    borderRadius: 1,
    marginVertical: 4,
  },
  phraseMeaning: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#1A1A2E",
    textAlign: "center",
  },
  progressDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F0D6E4",
  },
  dotActive: {
    backgroundColor: "#FF6B9D",
    width: 20,
    borderRadius: 4,
  },
  micSection: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 8,
  },
  micBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  micBtnActive: {
    shadowOpacity: 0.6,
    shadowRadius: 30,
  },
  micHint: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#A08090",
  },
  scoreContainer: {
    alignItems: "center",
    gap: 12,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    alignItems: "baseline" as any,
    gap: 2,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  scoreNumber: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },
  scorePercent: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    color: "#A08090",
  },
  scoreLabel: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 20,
  },
  retryBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FF6B9D",
  },
  retryText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FF6B9D",
  },
  nextBtn: {
    backgroundColor: "#FF6B9D",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  nextText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  tipsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    gap: 8,
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#1A1A2E",
  },
  tipsText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#A08090",
    lineHeight: 21,
  },
});
