import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLanguage } from "@/context/LanguageContext";

const { width } = Dimensions.get("window");

const CARD_DECKS: Record<string, { front: string; back: string; romaji?: string }[]> = {
  default: [
    { front: "안녕하세요", back: "Hello", romaji: "Annyeonghaseyo" },
    { front: "감사합니다", back: "Thank you", romaji: "Gamsahamnida" },
    { front: "사랑해요", back: "I love you", romaji: "Saranghaeyo" },
    { front: "미안해요", back: "I'm sorry", romaji: "Mianhaeyo" },
    { front: "괜찮아요", back: "It's okay", romaji: "Gwaenchanayo" },
    { front: "어디예요?", back: "Where is it?", romaji: "Eodiyeyo?" },
    { front: "얼마예요?", back: "How much?", romaji: "Eolmayeyo?" },
    { front: "맛있어요", back: "It's delicious", romaji: "Masisseoyo" },
  ],
};

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const cards = CARD_DECKS.default;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [studyMore, setStudyMore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const frontInterp = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backInterp = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  const handleFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnim, { toValue, useNativeDriver: true, tension: 80, friction: 8 }).start();
    setIsFlipped(!isFlipped);
  };

  const advanceCard = (knewIt: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (knewIt) setKnown((k) => k + 1);
    else setStudyMore((s) => s + 1);

    Animated.sequence([
      Animated.timing(slideAnim, { toValue: knewIt ? -width : width, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      slideAnim.setValue(knewIt ? width : -width);
      flipAnim.setValue(0);
      setIsFlipped(false);
      if (currentIndex + 1 >= cards.length) {
        setCompleted(true);
      } else {
        setCurrentIndex((i) => i + 1);
      }
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }).start();
    });
  };

  const resetDeck = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnown(0);
    setStudyMore(0);
    setCompleted(false);
    flipAnim.setValue(0);
    slideAnim.setValue(0);
  };

  const progress = (currentIndex / cards.length) * 100;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient
        colors={["#FFF0F6", "#FFF8FB"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.title}>{t("card_deck")}</Text>
        <Text style={styles.subtitle}>
          {completed ? t("well_done") : `${currentIndex + 1} / ${cards.length} ${t("cards_remaining")}`}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {completed ? (
        <View style={styles.completedContainer}>
          <Text style={styles.completedEmoji}>🎉</Text>
          <Text style={styles.completedTitle}>{t("well_done")}</Text>
          <View style={styles.scoreRow}>
            <View style={[styles.scoreCard, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
              <Text style={[styles.scoreNum, { color: "#4CAF50" }]}>{known}</Text>
              <Text style={styles.scoreLabel}>{t("know_it")}</Text>
            </View>
            <View style={[styles.scoreCard, { backgroundColor: "#FFF3E0" }]}>
              <Ionicons name="refresh-circle" size={28} color="#FF9800" />
              <Text style={[styles.scoreNum, { color: "#FF9800" }]}>{studyMore}</Text>
              <Text style={styles.scoreLabel}>{t("study_more")}</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
            onPress={resetDeck}
          >
            <Text style={styles.resetBtnText}>{t("try_again")}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.cardArea}>
            <Animated.View style={[styles.cardWrapper, { transform: [{ translateX: slideAnim }] }]}>
              <Pressable onPress={handleFlip}>
                <Animated.View
                  style={[styles.card, styles.cardFront, { transform: [{ rotateY: frontInterp }], backgroundColor: "#FFFFFF" }]}
                >
                  <LinearGradient
                    colors={["#FF6B9D", "#FF8FB3"]}
                    style={styles.cardTopBar}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardFrontText}>{cards[currentIndex]?.front}</Text>
                    {cards[currentIndex]?.romaji && (
                      <Text style={styles.cardRomaji}>{cards[currentIndex].romaji}</Text>
                    )}
                    <View style={styles.flipHint}>
                      <Ionicons name="refresh" size={14} color="#C4B5BF" />
                      <Text style={styles.flipHintText}>{t("flip_card")}</Text>
                    </View>
                  </View>
                </Animated.View>

                <Animated.View
                  style={[styles.card, styles.cardBack, { transform: [{ rotateY: backInterp }] }]}
                >
                  <LinearGradient
                    colors={["#FF6B9D", "#FF4081"]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardBackText}>{cards[currentIndex]?.back}</Text>
                    <View style={styles.flipHint}>
                      <Ionicons name="refresh" size={14} color="rgba(255,255,255,0.7)" />
                      <Text style={[styles.flipHintText, { color: "rgba(255,255,255,0.7)" }]}>{t("flip_card")}</Text>
                    </View>
                  </View>
                </Animated.View>
              </Pressable>
            </Animated.View>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [styles.actionBtn, styles.studyBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}
              onPress={() => advanceCard(false)}
            >
              <Ionicons name="refresh" size={24} color="#FF9800" />
              <Text style={[styles.actionLabel, { color: "#FF9800" }]}>{t("study_more")}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionBtn, styles.knowBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}
              onPress={() => advanceCard(true)}
            >
              <Ionicons name="checkmark" size={24} color="#4CAF50" />
              <Text style={[styles.actionLabel, { color: "#4CAF50" }]}>{t("know_it")}</Text>
            </Pressable>
          </View>

          <View style={[styles.miniStats, { paddingBottom: Math.max(insets.bottom + 16, 34) }]}>
            <View style={styles.miniStat}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={[styles.miniStatText, { color: "#4CAF50" }]}>{known}</Text>
            </View>
            <View style={styles.miniStat}>
              <Ionicons name="refresh-circle" size={16} color="#FF9800" />
              <Text style={[styles.miniStatText, { color: "#FF9800" }]}>{studyMore}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 6,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#A08090",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#F0D6E4",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF6B9D",
    borderRadius: 3,
  },
  cardArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  cardWrapper: {
    width: "100%",
  },
  card: {
    width: "100%",
    height: 280,
    borderRadius: 28,
    backfaceVisibility: "hidden",
    overflow: "hidden",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  cardFront: {
    backgroundColor: "#FFFFFF",
  },
  cardBack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardTopBar: {
    height: 8,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
    gap: 12,
  },
  cardFrontText: {
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
    textAlign: "center",
  },
  cardRomaji: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#A08090",
    textAlign: "center",
  },
  cardBackText: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  flipHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  flipHintText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#C4B5BF",
  },
  actionRow: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 20,
  },
  studyBtn: {
    backgroundColor: "#FFF3E0",
    borderWidth: 2,
    borderColor: "#FFE0B2",
  },
  knowBtn: {
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: "#C8E6C9",
  },
  actionLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  miniStats: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    paddingTop: 12,
  },
  miniStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  miniStatText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  completedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 20,
  },
  completedEmoji: {
    fontSize: 72,
  },
  completedTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
  },
  scoreRow: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  scoreCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  scoreNum: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },
  scoreLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#A08090",
  },
  resetBtn: {
    backgroundColor: "#FF6B9D",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  resetBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
