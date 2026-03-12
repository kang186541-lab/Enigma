import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Animated,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Audio } from "expo-av";
import { useLanguage, NativeLanguage, getDefaultLearning } from "@/context/LanguageContext";
import { getApiUrl } from "@/lib/query-client";
import { XPToast } from "@/components/XPToast";
import { C, F } from "@/constants/theme";

type LearningLang = "english" | "spanish" | "korean";

interface LessonWord {
  word: string;
  pronunciation: string;
  speechLang: string;
  translations: Record<NativeLanguage, string>;
  example: string;
  exampleTranslations: Record<NativeLanguage, string>;
}

const LESSON_WORDS: Record<LearningLang, LessonWord[]> = {
  english: [
    {
      word: "Hello",
      pronunciation: "heh-LOW",
      speechLang: "en-US",
      translations: { korean: "안녕하세요", english: "Hello", spanish: "Hola" },
      example: "Hello! Nice to meet you.",
      exampleTranslations: { korean: "안녕하세요! 만나서 반가워요.", english: "Hello! Nice to meet you.", spanish: "¡Hola! Encantado de conocerte." },
    },
    {
      word: "Thank you",
      pronunciation: "THANGK yoo",
      speechLang: "en-US",
      translations: { korean: "감사합니다", english: "Thank you", spanish: "Gracias" },
      example: "Thank you for your help.",
      exampleTranslations: { korean: "도와주셔서 감사합니다.", english: "Thank you for your help.", spanish: "Gracias por tu ayuda." },
    },
    {
      word: "Please",
      pronunciation: "PLEEZ",
      speechLang: "en-US",
      translations: { korean: "부탁해요", english: "Please", spanish: "Por favor" },
      example: "Can I have water, please?",
      exampleTranslations: { korean: "물 좀 주시겠어요?", english: "Can I have water, please?", spanish: "¿Me puede dar agua, por favor?" },
    },
    {
      word: "Sorry",
      pronunciation: "SAW-ree",
      speechLang: "en-US",
      translations: { korean: "미안해요", english: "Sorry", spanish: "Lo siento" },
      example: "Sorry, I'm late.",
      exampleTranslations: { korean: "미안해요, 늦었어요.", english: "Sorry, I'm late.", spanish: "Lo siento, llego tarde." },
    },
    {
      word: "Yes",
      pronunciation: "YES",
      speechLang: "en-US",
      translations: { korean: "네", english: "Yes", spanish: "Sí" },
      example: "Yes, I understand.",
      exampleTranslations: { korean: "네, 이해했어요.", english: "Yes, I understand.", spanish: "Sí, entiendo." },
    },
    {
      word: "No",
      pronunciation: "NOH",
      speechLang: "en-US",
      translations: { korean: "아니요", english: "No", spanish: "No" },
      example: "No, thank you.",
      exampleTranslations: { korean: "아니요, 괜찮아요.", english: "No, thank you.", spanish: "No, gracias." },
    },
    {
      word: "Goodbye",
      pronunciation: "good-BYE",
      speechLang: "en-US",
      translations: { korean: "안녕히 가세요", english: "Goodbye", spanish: "Adiós" },
      example: "Goodbye! See you tomorrow.",
      exampleTranslations: { korean: "안녕히 가세요! 내일 봐요.", english: "Goodbye! See you tomorrow.", spanish: "¡Adiós! Hasta mañana." },
    },
    {
      word: "Water",
      pronunciation: "WAW-ter",
      speechLang: "en-US",
      translations: { korean: "물", english: "Water", spanish: "Agua" },
      example: "I drink water every day.",
      exampleTranslations: { korean: "저는 매일 물을 마셔요.", english: "I drink water every day.", spanish: "Bebo agua todos los días." },
    },
    {
      word: "Food",
      pronunciation: "FOOD",
      speechLang: "en-US",
      translations: { korean: "음식", english: "Food", spanish: "Comida" },
      example: "This food is delicious!",
      exampleTranslations: { korean: "이 음식 맛있어요!", english: "This food is delicious!", spanish: "¡Esta comida está deliciosa!" },
    },
    {
      word: "Help",
      pronunciation: "HELP",
      speechLang: "en-US",
      translations: { korean: "도움", english: "Help", spanish: "Ayuda" },
      example: "I need help.",
      exampleTranslations: { korean: "도움이 필요해요.", english: "I need help.", spanish: "Necesito ayuda." },
    },
  ],
  spanish: [
    {
      word: "Hola",
      pronunciation: "OH-lah",
      speechLang: "es-ES",
      translations: { korean: "안녕하세요", english: "Hello", spanish: "Hola" },
      example: "¡Hola! ¿Cómo estás?",
      exampleTranslations: { korean: "안녕하세요! 어떻게 지내세요?", english: "Hello! How are you?", spanish: "¡Hola! ¿Cómo estás?" },
    },
    {
      word: "Gracias",
      pronunciation: "GRA-syas",
      speechLang: "es-ES",
      translations: { korean: "감사합니다", english: "Thank you", spanish: "Gracias" },
      example: "Muchas gracias por tu ayuda.",
      exampleTranslations: { korean: "도와주셔서 정말 감사합니다.", english: "Thank you so much for your help.", spanish: "Muchas gracias por tu ayuda." },
    },
    {
      word: "Por favor",
      pronunciation: "por fa-VOR",
      speechLang: "es-ES",
      translations: { korean: "부탁해요", english: "Please", spanish: "Por favor" },
      example: "Un café, por favor.",
      exampleTranslations: { korean: "커피 한 잔 부탁해요.", english: "A coffee, please.", spanish: "Un café, por favor." },
    },
    {
      word: "Lo siento",
      pronunciation: "lo SYEN-to",
      speechLang: "es-ES",
      translations: { korean: "미안해요", english: "Sorry", spanish: "Lo siento" },
      example: "Lo siento, llegué tarde.",
      exampleTranslations: { korean: "미안해요, 늦었어요.", english: "Sorry, I arrived late.", spanish: "Lo siento, llegué tarde." },
    },
    {
      word: "Sí",
      pronunciation: "SEE",
      speechLang: "es-ES",
      translations: { korean: "네", english: "Yes", spanish: "Sí" },
      example: "Sí, entiendo.",
      exampleTranslations: { korean: "네, 이해했어요.", english: "Yes, I understand.", spanish: "Sí, entiendo." },
    },
    {
      word: "No",
      pronunciation: "NOH",
      speechLang: "es-ES",
      translations: { korean: "아니요", english: "No", spanish: "No" },
      example: "No, gracias.",
      exampleTranslations: { korean: "아니요, 괜찮아요.", english: "No, thank you.", spanish: "No, gracias." },
    },
    {
      word: "Adiós",
      pronunciation: "ah-DYOS",
      speechLang: "es-ES",
      translations: { korean: "안녕히 가세요", english: "Goodbye", spanish: "Adiós" },
      example: "¡Adiós! Hasta mañana.",
      exampleTranslations: { korean: "안녕히 가세요! 내일 봐요.", english: "Goodbye! See you tomorrow.", spanish: "¡Adiós! Hasta mañana." },
    },
    {
      word: "Agua",
      pronunciation: "AH-gwah",
      speechLang: "es-ES",
      translations: { korean: "물", english: "Water", spanish: "Agua" },
      example: "Necesito agua, por favor.",
      exampleTranslations: { korean: "물 좀 주세요.", english: "I need water, please.", spanish: "Necesito agua, por favor." },
    },
    {
      word: "Comida",
      pronunciation: "ko-MEE-dah",
      speechLang: "es-ES",
      translations: { korean: "음식", english: "Food", spanish: "Comida" },
      example: "Esta comida está deliciosa.",
      exampleTranslations: { korean: "이 음식 맛있어요.", english: "This food is delicious.", spanish: "Esta comida está deliciosa." },
    },
    {
      word: "Ayuda",
      pronunciation: "ah-YOO-dah",
      speechLang: "es-ES",
      translations: { korean: "도움", english: "Help", spanish: "Ayuda" },
      example: "Necesito ayuda.",
      exampleTranslations: { korean: "도움이 필요해요.", english: "I need help.", spanish: "Necesito ayuda." },
    },
  ],
  korean: [
    {
      word: "안녕하세요",
      pronunciation: "an-nyeong-ha-se-yo",
      speechLang: "ko-KR",
      translations: { korean: "안녕하세요", english: "Hello", spanish: "Hola" },
      example: "안녕하세요! 만나서 반가워요.",
      exampleTranslations: { korean: "안녕하세요! 만나서 반가워요.", english: "Hello! Nice to meet you.", spanish: "¡Hola! Encantado de conocerte." },
    },
    {
      word: "감사합니다",
      pronunciation: "gam-sa-ham-ni-da",
      speechLang: "ko-KR",
      translations: { korean: "감사합니다", english: "Thank you", spanish: "Gracias" },
      example: "도와주셔서 감사합니다.",
      exampleTranslations: { korean: "도와주셔서 감사합니다.", english: "Thank you for helping me.", spanish: "Gracias por ayudarme." },
    },
    {
      word: "부탁해요",
      pronunciation: "bu-tak-hae-yo",
      speechLang: "ko-KR",
      translations: { korean: "부탁해요", english: "Please", spanish: "Por favor" },
      example: "물 좀 주세요, 부탁해요.",
      exampleTranslations: { korean: "물 좀 주세요, 부탁해요.", english: "Please give me some water.", spanish: "Por favor, dame agua." },
    },
    {
      word: "미안해요",
      pronunciation: "mi-an-hae-yo",
      speechLang: "ko-KR",
      translations: { korean: "미안해요", english: "Sorry", spanish: "Lo siento" },
      example: "늦어서 미안해요.",
      exampleTranslations: { korean: "늦어서 미안해요.", english: "Sorry for being late.", spanish: "Lo siento por llegar tarde." },
    },
    {
      word: "네",
      pronunciation: "neh",
      speechLang: "ko-KR",
      translations: { korean: "네", english: "Yes", spanish: "Sí" },
      example: "네, 알겠어요.",
      exampleTranslations: { korean: "네, 알겠어요.", english: "Yes, I understand.", spanish: "Sí, entiendo." },
    },
    {
      word: "아니요",
      pronunciation: "a-ni-yo",
      speechLang: "ko-KR",
      translations: { korean: "아니요", english: "No", spanish: "No" },
      example: "아니요, 괜찮아요.",
      exampleTranslations: { korean: "아니요, 괜찮아요.", english: "No, it's okay.", spanish: "No, está bien." },
    },
    {
      word: "안녕히 가세요",
      pronunciation: "an-nyeong-hi ga-se-yo",
      speechLang: "ko-KR",
      translations: { korean: "안녕히 가세요", english: "Goodbye", spanish: "Adiós" },
      example: "안녕히 가세요! 내일 봐요.",
      exampleTranslations: { korean: "안녕히 가세요! 내일 봐요.", english: "Goodbye! See you tomorrow.", spanish: "¡Adiós! Hasta mañana." },
    },
    {
      word: "물",
      pronunciation: "mul",
      speechLang: "ko-KR",
      translations: { korean: "물", english: "Water", spanish: "Agua" },
      example: "물 한 잔 주세요.",
      exampleTranslations: { korean: "물 한 잔 주세요.", english: "A glass of water, please.", spanish: "Un vaso de agua, por favor." },
    },
    {
      word: "음식",
      pronunciation: "eum-sik",
      speechLang: "ko-KR",
      translations: { korean: "음식", english: "Food", spanish: "Comida" },
      example: "한국 음식이 맛있어요.",
      exampleTranslations: { korean: "한국 음식이 맛있어요.", english: "Korean food is delicious.", spanish: "La comida coreana es deliciosa." },
    },
    {
      word: "도움",
      pronunciation: "do-um",
      speechLang: "ko-KR",
      translations: { korean: "도움", english: "Help", spanish: "Ayuda" },
      example: "도움이 필요해요.",
      exampleTranslations: { korean: "도움이 필요해요.", english: "I need help.", spanish: "Necesito ayuda." },
    },
  ],
};

let _lessonAudio: HTMLAudioElement | null = null;

async function playWordTTS(text: string, lang: string, apiBase: string) {
  try {
    if (Platform.OS === "web" && _lessonAudio) {
      _lessonAudio.pause();
      _lessonAudio.src = "";
      _lessonAudio = null;
    }
    const url = new URL("/api/pronunciation-tts", apiBase);
    url.searchParams.set("text", text);
    url.searchParams.set("lang", lang);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TTS ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    if (Platform.OS === "web") {
      const audio = new (window as any).Audio(objectUrl) as HTMLAudioElement;
      _lessonAudio = audio;
      audio.onended = () => { URL.revokeObjectURL(objectUrl); _lessonAudio = null; };
      audio.onerror = () => { URL.revokeObjectURL(objectUrl); _lessonAudio = null; };
      await audio.play();
    } else {
      const { sound } = await Audio.Sound.createAsync({ uri: objectUrl }, { shouldPlay: true });
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          URL.revokeObjectURL(objectUrl);
        }
      });
    }
  } catch (err) {
    console.warn("Lesson TTS error:", err);
  }
}

export default function DailyLessonScreen() {
  const insets = useSafeAreaInsets();
  const { nativeLanguage, learningLanguage, updateStats, stats } = useLanguage();
  const apiBase = getApiUrl();

  const nativeLang: NativeLanguage = nativeLanguage ?? "english";
  const learnLang: LearningLang = (learningLanguage as LearningLang) ?? getDefaultLearning(nativeLang) as LearningLang;
  const words = LESSON_WORDS[learnLang];

  const [wordIndex, setWordIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [xpGain, setXpGain] = useState(0);
  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const currentWord = words[wordIndex];
  const progress = (wordIndex + 1) / words.length;

  const animateToNext = (onDone: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      onDone();
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (wordIndex < words.length - 1) {
      animateToNext(() => setWordIndex((i) => i + 1));
    } else {
      animateToNext(() => setDone(true));
      if (!xpAwarded) {
        setXpAwarded(true);
        setXpGain(50);
        updateStats({ xp: statsRef.current.xp + 50, wordsLearned: statsRef.current.wordsLearned + words.length });
      }
    }
  };

  const handleListen = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await playWordTTS(currentWord.word, currentWord.speechLang, apiBase);
    setIsPlaying(false);
  };

  const langLabel: Record<LearningLang, string> = {
    english: "🇬🇧 English",
    spanish: "🇪🇸 Spanish",
    korean: "🇰🇷 Korean",
  };

  if (done) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <ScrollView contentContainerStyle={styles.doneScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.doneCard}>
            <Text style={styles.doneEmoji}>🎉</Text>
            <Text style={styles.doneTitle}>완료!</Text>
            <Text style={styles.doneSubtitle}>오늘의 수업을 마쳤어요!</Text>

            <View style={styles.xpBadge}>
              <LinearGradient colors={[C.gold, C.goldDark]} style={styles.xpGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="flash" size={18} color={C.bg1} />
                <Text style={styles.xpText}>+50 XP</Text>
              </LinearGradient>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{words.length}</Text>
                <Text style={styles.statLbl}>단어 학습</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNum}>100%</Text>
                <Text style={styles.statLbl}>완료율</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNum}>50</Text>
                <Text style={styles.statLbl}>XP 획득</Text>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [styles.homeBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.replace("/(tabs)/");
              }}
            >
              <LinearGradient colors={[C.gold, C.goldDark]} style={styles.homeBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="home" size={18} color={C.bg1} />
                <Text style={styles.homeBtnText}>홈으로 돌아가기</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <XPToast amount={xpGain} onDone={() => setXpGain(0)} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <Ionicons name="chevron-back" size={24} color={C.gold} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{langLabel[learnLang]}</Text>
          <Text style={styles.headerSub}>{wordIndex + 1} / {words.length}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
      </View>

      {/* Word card */}
      <Animated.View style={[styles.cardWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.langBadge}>
              <Text style={styles.langBadgeText}>{langLabel[learnLang]}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.listenBtn, pressed && { opacity: 0.75 }, isPlaying && styles.listenBtnActive]}
              onPress={handleListen}
              disabled={isPlaying}
            >
              {isPlaying
                ? <ActivityIndicator size="small" color={C.gold} />
                : <Ionicons name="volume-high" size={22} color={C.gold} />}
            </Pressable>
          </View>

          <Text style={styles.wordText}>{currentWord.word}</Text>
          <Text style={styles.pronunciation}>/{currentWord.pronunciation}/</Text>

          <View style={styles.divider} />

          <View style={styles.translationRow}>
            <View style={styles.transIcon}>
              <Ionicons name="language" size={16} color={C.gold} />
            </View>
            <Text style={styles.translationText}>{currentWord.translations[nativeLang]}</Text>
          </View>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleLabel}>예문</Text>
            <Text style={styles.exampleWord}>{currentWord.example}</Text>
            <Text style={styles.exampleTrans}>{currentWord.exampleTranslations[nativeLang]}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Next button */}
      <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.nextBtn, pressed && { opacity: 0.88, transform: [{ scale: 0.97 }] }]}
          onPress={handleNext}
        >
          <LinearGradient colors={[C.gold, C.goldDark]} style={styles.nextBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.nextBtnText}>
              {wordIndex < words.length - 1 ? "다음" : "완료"}
            </Text>
            <Ionicons
              name={wordIndex < words.length - 1 ? "arrow-forward" : "checkmark"}
              size={20}
              color={C.bg1}
            />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.bg2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: F.header,
    color: C.gold,
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.goldDim,
    marginTop: 2,
    fontStyle: "italic",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(201,162,39,0.15)",
    marginHorizontal: 24,
    borderRadius: 3,
    marginBottom: 24,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: C.border,
  },
  progressFill: {
    height: 6,
    backgroundColor: C.gold,
    borderRadius: 3,
  },
  cardWrap: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: C.parchment,
    borderRadius: 28,
    padding: 28,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: C.parchmentDeep,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  langBadge: {
    backgroundColor: "rgba(201,162,39,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  langBadgeText: {
    fontSize: 13,
    fontFamily: F.bodySemi,
    color: C.gold,
  },
  listenBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(201,162,39,0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  listenBtnActive: {
    backgroundColor: "rgba(201,162,39,0.25)",
  },
  wordText: {
    fontSize: 42,
    fontFamily: F.title,
    color: C.textParchment,
    textAlign: "center",
    letterSpacing: 1,
    marginBottom: 6,
  },
  pronunciation: {
    fontSize: 15,
    fontFamily: F.body,
    color: C.goldDark,
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  divider: {
    height: 1,
    backgroundColor: C.parchmentDeep,
    marginBottom: 20,
  },
  translationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  transIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(201,162,39,0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  translationText: {
    fontSize: 22,
    fontFamily: F.header,
    color: C.textParchment,
  },
  exampleBox: {
    backgroundColor: "rgba(201,162,39,0.08)",
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.2)",
  },
  exampleLabel: {
    fontSize: 11,
    fontFamily: F.label,
    color: C.goldDark,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  exampleWord: {
    fontSize: 15,
    fontFamily: F.bodySemi,
    color: C.textParchment,
    lineHeight: 22,
  },
  exampleTrans: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.goldDark,
    lineHeight: 20,
    fontStyle: "italic",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  nextBtn: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  nextBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: F.header,
    color: C.bg1,
    letterSpacing: 0.5,
  },
  doneScroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  doneCard: {
    backgroundColor: C.bg2,
    borderRadius: 32,
    padding: 36,
    alignItems: "center",
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
    gap: 16,
    borderWidth: 1.5,
    borderColor: C.gold,
  },
  doneEmoji: {
    fontSize: 64,
  },
  doneTitle: {
    fontSize: 30,
    fontFamily: F.title,
    color: C.gold,
    letterSpacing: 2,
  },
  doneSubtitle: {
    fontSize: 16,
    fontFamily: F.body,
    color: C.parchmentDark,
    textAlign: "center",
    fontStyle: "italic",
  },
  xpBadge: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  xpGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  xpText: {
    fontSize: 20,
    fontFamily: F.header,
    color: C.bg1,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(201,162,39,0.1)",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 0,
    width: "100%",
    borderWidth: 1,
    borderColor: C.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statNum: {
    fontSize: 22,
    fontFamily: F.title,
    color: C.gold,
  },
  statLbl: {
    fontSize: 11,
    fontFamily: F.label,
    color: C.goldDim,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: C.border,
  },
  homeBtn: {
    borderRadius: 18,
    overflow: "hidden",
    width: "100%",
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  homeBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  homeBtnText: {
    fontSize: 16,
    fontFamily: F.header,
    color: C.bg1,
    letterSpacing: 0.5,
  },
});
