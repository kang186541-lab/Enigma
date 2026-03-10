import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  Animated,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { useLanguage, NativeLanguage } from "@/context/LanguageContext";

const { width } = Dimensions.get("window");

interface FlashCard {
  word: string;
  emoji: string;
  pronunciation?: string;
  meaning: string;
  example: string;
  speechLang: string;
}

const BEGINNER_CARDS: FlashCard[] = [
  {
    word: "Apple",
    emoji: "🍎",
    pronunciation: "AE-pul",
    meaning: "A round fruit with red, yellow, or green skin and a white interior.",
    example: '"I eat an apple every morning for breakfast."',
    speechLang: "en-US",
  },
  {
    word: "Water",
    emoji: "💧",
    pronunciation: "WAW-ter",
    meaning: "A clear, colorless liquid essential for all living things.",
    example: '"Please drink eight glasses of water every day."',
    speechLang: "en-US",
  },
  {
    word: "Hello",
    emoji: "👋",
    pronunciation: "heh-LOW",
    meaning: "A greeting used when meeting someone or starting a conversation.",
    example: '"Hello! My name is Sarah. Nice to meet you."',
    speechLang: "en-US",
  },
  {
    word: "Thank you",
    emoji: "🙏",
    pronunciation: "THANGK yoo",
    meaning: "An expression of gratitude used to show appreciation.",
    example: '"Thank you so much for your help today!"',
    speechLang: "en-US",
  },
  {
    word: "House",
    emoji: "🏠",
    pronunciation: "HOWSS",
    meaning: "A building where people live; a home.",
    example: '"Their house has a beautiful garden in the backyard."',
    speechLang: "en-US",
  },
  {
    word: "Dog",
    emoji: "🐶",
    pronunciation: "DAWG",
    meaning: "A domesticated animal kept as a pet or for work.",
    example: '"My dog loves to run in the park every evening."',
    speechLang: "en-US",
  },
];

const ADVANCED_CARDS: Record<NativeLanguage, FlashCard[]> = {
  english: [
    {
      word: "Serendipity",
      emoji: "✨",
      pronunciation: "sair-en-DIP-i-tee",
      meaning: "The occurrence of happy events by chance; a pleasant surprise.",
      example: '"Finding my best friend at that café was pure serendipity."',
      speechLang: "en-US",
    },
    {
      word: "Ephemeral",
      emoji: "🌿",
      pronunciation: "eh-FEM-er-ul",
      meaning: "Lasting for a very short time; transitory.",
      example: '"Cherry blossoms are ephemeral — they bloom for just two weeks."',
      speechLang: "en-US",
    },
    {
      word: "Wanderlust",
      emoji: "🌍",
      pronunciation: "WON-der-lust",
      meaning: "A strong desire to travel and explore the world.",
      example: '"Her wanderlust led her to visit 40 countries before turning 30."',
      speechLang: "en-US",
    },
  ],
  spanish: [
    {
      word: "Mariposa",
      emoji: "🦋",
      pronunciation: "mah-ree-POH-sah",
      meaning: "Butterfly — also used poetically for someone graceful and free-spirited.",
      example: '"Eres como una mariposa — siempre libre y llena de color."',
      speechLang: "es-ES",
    },
    {
      word: "Alegría",
      emoji: "😄",
      pronunciation: "ah-leh-GREE-ah",
      meaning: "A deep, vibrant joy — beyond happiness, an exuberance of spirit.",
      example: '"La alegría de los niños llenó toda la casa de luz."',
      speechLang: "es-ES",
    },
    {
      word: "Sobremesa",
      emoji: "☕",
      pronunciation: "so-breh-MEH-sah",
      meaning: "The time spent lingering at the table after a meal, talking and connecting.",
      example: '"La sobremesa duró tres horas — nadie quería irse."',
      speechLang: "es-ES",
    },
  ],
  korean: [
    {
      word: "눈치",
      emoji: "👁",
      pronunciation: "nun-chi",
      meaning: "The subtle art of reading a room — sensing unspoken emotions and social cues.",
      example: '"그는 눈치가 빨라서 아무것도 말하지 않아도 다 알아."',
      speechLang: "ko-KR",
    },
    {
      word: "정",
      emoji: "❤️",
      pronunciation: "jeong",
      meaning: "A deep emotional bond that forms over time through shared experiences.",
      example: '"오랫동안 함께해서 정이 많이 들었어요."',
      speechLang: "ko-KR",
    },
    {
      word: "한",
      emoji: "🌑",
      pronunciation: "han",
      meaning: "A uniquely Korean feeling of collective sorrow, longing, and resilience.",
      example: '"그 노래에는 우리 민족의 한이 담겨 있다."',
      speechLang: "ko-KR",
    },
  ],
};

function speakWord(word: string, lang: string) {
  if (Platform.OS === "web") {
    try {
      const utterance = new (window as any).SpeechSynthesisUtterance(word);
      utterance.lang = lang;
      utterance.rate = 0.85;
      (window as any).speechSynthesis.cancel();
      (window as any).speechSynthesis.speak(utterance);
    } catch {}
  } else {
    Speech.speak(word, { language: lang, rate: 0.85 });
  }
}

type DeckType = "beginner" | "advanced";

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const { t, nativeLanguage } = useLanguage();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const lang = nativeLanguage ?? "english";

  const [deckType, setDeckType] = useState<DeckType>("beginner");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [gotIt, setGotIt] = useState(0);
  const [again, setAgain] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const cards = deckType === "beginner" ? BEGINNER_CARDS : ADVANCED_CARDS[lang];
  const card = cards[currentIndex];
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 0.5, 1], outputRange: [1, 1, 0, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0, 0.5, 0.5, 1], outputRange: [0, 0, 1, 1] });

  const switchDeck = (type: DeckType) => {
    if (type === deckType) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDeckType(type);
    resetState();
  };

  const resetState = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setGotIt(0);
    setAgain(0);
    setCompleted(false);
    Animated.parallel([
      Animated.timing(flipAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();
  };

  const handleFlip = () => {
    if (completed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = isFlipped ? 0 : 1;

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.spring(flipAnim, { toValue, useNativeDriver: true, tension: 60, friction: 8 }),
    ]).start(() => {
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }).start();
    });
    setIsFlipped(!isFlipped);
  };

  const handleSpeak = useCallback((e: any) => {
    e.stopPropagation?.();
    if (!card) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSpeaking(true);
    speakWord(card.word, card.speechLang);
    setTimeout(() => setIsSpeaking(false), 1500);
  }, [card]);

  const advanceCard = (knew: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (knew) setGotIt((g) => g + 1);
    else setAgain((a) => a + 1);

    Animated.timing(slideAnim, { toValue: knew ? -width : width, duration: 230, useNativeDriver: true }).start(() => {
      slideAnim.setValue(knew ? width : -width);
      flipAnim.setValue(0);
      setIsFlipped(false);
      if (currentIndex + 1 >= cards.length) {
        setCompleted(true);
        slideAnim.setValue(0);
      } else {
        setCurrentIndex((i) => i + 1);
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 70, friction: 10 }).start();
      }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <LinearGradient colors={["#FFF0F6", "#FFF8FB"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Text style={styles.title}>{t("card_deck")}</Text>

        <View style={styles.deckSwitcher}>
          <Pressable
            style={[styles.deckTab, deckType === "beginner" && styles.deckTabActive]}
            onPress={() => switchDeck("beginner")}
          >
            {deckType === "beginner" && (
              <LinearGradient colors={["#FF6B9D", "#FF4081"]} style={StyleSheet.absoluteFill} borderRadius={14} />
            )}
            <Text style={[styles.deckTabText, deckType === "beginner" && styles.deckTabTextActive]}>
              Beginner
            </Text>
          </Pressable>
          <Pressable
            style={[styles.deckTab, deckType === "advanced" && styles.deckTabActive]}
            onPress={() => switchDeck("advanced")}
          >
            {deckType === "advanced" && (
              <LinearGradient colors={["#FF6B9D", "#FF4081"]} style={StyleSheet.absoluteFill} borderRadius={14} />
            )}
            <Text style={[styles.deckTabText, deckType === "advanced" && styles.deckTabTextActive]}>
              Advanced
            </Text>
          </Pressable>
        </View>

        {!completed && (
          <View style={styles.progressRow}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{currentIndex + 1}/{cards.length}</Text>
          </View>
        )}
      </View>

      {completed ? (
        <ScrollView
          contentContainerStyle={styles.completedContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.completedEmoji}>🎉</Text>
          <Text style={styles.completedTitle}>{t("well_done")}</Text>
          <Text style={styles.completedSub}>You finished the {deckType} deck!</Text>
          <View style={styles.scoreRow}>
            <View style={[styles.scoreCard, { backgroundColor: "#E8F5E9" }]}>
              <Text style={styles.scoreEmoji}>✅</Text>
              <Text style={[styles.scoreNum, { color: "#4CAF50" }]}>{gotIt}</Text>
              <Text style={styles.scoreLabel}>Got it!</Text>
            </View>
            <View style={[styles.scoreCard, { backgroundColor: "#FFF3E0" }]}>
              <Text style={styles.scoreEmoji}>😅</Text>
              <Text style={[styles.scoreNum, { color: "#FF9800" }]}>{again}</Text>
              <Text style={styles.scoreLabel}>Again</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.resetBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
            onPress={resetState}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.resetBtnText}>{t("try_again")}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.switchBtn, pressed && { opacity: 0.85 }]}
            onPress={() => switchDeck(deckType === "beginner" ? "advanced" : "beginner")}
          >
            <Text style={styles.switchBtnText}>
              Try {deckType === "beginner" ? "Advanced" : "Beginner"} deck →
            </Text>
          </Pressable>
        </ScrollView>
      ) : (
        <>
          <View style={styles.cardArea}>
            <Animated.View
              style={[
                styles.cardWrapper,
                { transform: [{ translateX: slideAnim }, { scale: scaleAnim }] },
              ]}
            >
              <Pressable onPress={handleFlip} style={styles.cardPressable}>
                <Animated.View
                  style={[
                    styles.card,
                    styles.cardFront,
                    { transform: [{ rotateY: frontRotate }], opacity: frontOpacity },
                  ]}
                >
                  <LinearGradient
                    colors={["#FF6B9D", "#FF8FB3"]}
                    style={styles.cardAccentBar}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                  <View style={styles.cardInner}>
                    <Text style={styles.cardEmoji}>{card?.emoji}</Text>
                    <Text style={styles.cardWordFront}>{card?.word}</Text>
                    {card?.pronunciation && (
                      <Text style={styles.cardPronunciation}>/{card.pronunciation}/</Text>
                    )}
                    <Pressable
                      style={({ pressed }) => [styles.speakerBtn, pressed && { opacity: 0.75 }]}
                      onPress={handleSpeak}
                      hitSlop={12}
                    >
                      <LinearGradient
                        colors={isSpeaking ? ["#FF4081", "#FF1744"] : ["#FF6B9D", "#FF8FB3"]}
                        style={styles.speakerBtnGradient}
                      >
                        <Ionicons
                          name={isSpeaking ? "volume-high" : "volume-medium"}
                          size={18}
                          color="#FFFFFF"
                        />
                      </LinearGradient>
                    </Pressable>
                    <View style={styles.flipHint}>
                      <Ionicons name="sync" size={13} color="#C4B5BF" />
                      <Text style={styles.flipHintText}>{t("flip_card")}</Text>
                    </View>
                  </View>
                </Animated.View>

                <Animated.View
                  style={[
                    styles.card,
                    styles.cardBack,
                    { transform: [{ rotateY: backRotate }], opacity: backOpacity },
                  ]}
                >
                  <LinearGradient
                    colors={["#FF6B9D", "#E8316E"]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <View style={styles.cardInnerBack}>
                    <Text style={styles.cardEmojiBack}>{card?.emoji}</Text>
                    <Text style={styles.cardWordBack}>{card?.word}</Text>
                    <View style={styles.divider} />
                    <Text style={styles.cardMeaning}>{card?.meaning}</Text>
                    <View style={styles.exampleBox}>
                      <Text style={styles.exampleLabel}>Example</Text>
                      <Text style={styles.exampleText}>{card?.example}</Text>
                    </View>
                    <Pressable
                      style={({ pressed }) => [styles.speakerBtnBack, pressed && { opacity: 0.75 }]}
                      onPress={handleSpeak}
                      hitSlop={12}
                    >
                      <Ionicons
                        name={isSpeaking ? "volume-high" : "volume-medium"}
                        size={16}
                        color="rgba(255,255,255,0.9)"
                      />
                      <Text style={styles.speakerBtnBackText}>Listen</Text>
                    </Pressable>
                  </View>
                </Animated.View>
              </Pressable>
            </Animated.View>
          </View>

          {isFlipped ? (
            <View style={styles.actionRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.againBtn,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
                ]}
                onPress={() => advanceCard(false)}
              >
                <Text style={styles.againBtnEmoji}>😅</Text>
                <Text style={[styles.actionLabel, { color: "#FF9800" }]}>Again</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.actionBtn,
                  styles.gotItBtn,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
                ]}
                onPress={() => advanceCard(true)}
              >
                <Text style={styles.gotItBtnEmoji}>✅</Text>
                <Text style={[styles.actionLabel, { color: "#4CAF50" }]}>Got it!</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.flipPromptRow}>
              <Pressable
                style={({ pressed }) => [styles.flipPromptBtn, pressed && { opacity: 0.8 }]}
                onPress={handleFlip}
              >
                <LinearGradient colors={["#FF6B9D", "#FF4081"]} style={styles.flipPromptGradient}>
                  <Ionicons name="sync" size={18} color="#FFFFFF" />
                  <Text style={styles.flipPromptText}>Tap to reveal meaning</Text>
                </LinearGradient>
              </Pressable>
            </View>
          )}

          <View style={[styles.miniStats, { paddingBottom: Math.max(insets.bottom + 16, 34) }]}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatEmoji}>✅</Text>
              <Text style={[styles.miniStatText, { color: "#4CAF50" }]}>{gotIt}</Text>
            </View>
            <View style={styles.miniDivider} />
            <View style={styles.miniStat}>
              <Text style={styles.miniStatEmoji}>😅</Text>
              <Text style={[styles.miniStatText, { color: "#FF9800" }]}>{again}</Text>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 14,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
  },
  deckSwitcher: {
    flexDirection: "row",
    backgroundColor: "#F5E6EF",
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  deckTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  deckTabActive: {},
  deckTabText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#A08090",
  },
  deckTabTextActive: {
    color: "#FFFFFF",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#F0D6E4",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF6B9D",
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#A08090",
    minWidth: 32,
    textAlign: "right",
  },
  cardArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  cardWrapper: {
    width: "100%",
  },
  cardPressable: {
    width: "100%",
  },
  card: {
    width: "100%",
    borderRadius: 28,
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 10,
    backfaceVisibility: "hidden",
  },
  cardFront: {
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  cardBack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderRadius: 28,
  },
  cardAccentBar: {
    height: 6,
  },
  cardInner: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 10,
    minHeight: 300,
    justifyContent: "center",
  },
  cardInnerBack: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 10,
    minHeight: 300,
    justifyContent: "center",
  },
  cardEmoji: {
    fontSize: 52,
  },
  cardEmojiBack: {
    fontSize: 36,
  },
  cardWordFront: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  cardWordBack: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  cardPronunciation: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#A08090",
    textAlign: "center",
  },
  speakerBtn: {
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 4,
  },
  speakerBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  speakerBtnBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginTop: 4,
  },
  speakerBtnBackText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.9)",
  },
  flipHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  flipHintText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#C4B5BF",
  },
  divider: {
    width: 48,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 1,
    marginVertical: 2,
  },
  cardMeaning: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 4,
  },
  exampleBox: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 14,
    gap: 4,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  exampleLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  exampleText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#FFFFFF",
    lineHeight: 20,
    fontStyle: "italic",
  },
  flipPromptRow: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  flipPromptBtn: {
    borderRadius: 20,
    overflow: "hidden",
  },
  flipPromptGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 20,
  },
  flipPromptText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  actionRow: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 22,
  },
  againBtn: {
    backgroundColor: "#FFF3E0",
    borderWidth: 2,
    borderColor: "#FFE0B2",
  },
  gotItBtn: {
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: "#C8E6C9",
  },
  againBtnEmoji: {
    fontSize: 22,
  },
  gotItBtnEmoji: {
    fontSize: 22,
  },
  actionLabel: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  miniStats: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingTop: 14,
  },
  miniStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  miniStatEmoji: {
    fontSize: 18,
  },
  miniStatText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  miniDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#F0D6E4",
  },
  completedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 20,
    paddingVertical: 40,
  },
  completedEmoji: {
    fontSize: 72,
  },
  completedTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#1A1A2E",
  },
  completedSub: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: "#A08090",
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
    gap: 6,
  },
  scoreEmoji: {
    fontSize: 32,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FF6B9D",
    paddingHorizontal: 36,
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
  switchBtn: {
    paddingVertical: 12,
  },
  switchBtnText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: "#FF6B9D",
  },
});
