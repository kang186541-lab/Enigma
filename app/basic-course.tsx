import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Animated,
  PanResponder,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage } from "@/context/LanguageContext";
import { C, F } from "@/constants/theme";

const { width: SW } = Dimensions.get("window");
const CARD_W = Math.min(SW - 48, 360);

const PROGRESS_KEY = (lang: string) => `basicCourseProgress_${lang}`;
const DONE_KEY     = (lang: string) => `basicCourseCompleted_${lang}`;

interface CharItem { char: string; roman: string; tip: string; }
interface WordItem { word: string; meaning: string; emoji: string; }
interface GreetingItem { phrase: string; meaning: string; usage: string; }

interface CourseData {
  stepNames: [string, string, string, string];
  lang: string;
  chars: CharItem[];
  words: WordItem[];
  greetings: GreetingItem[];
  lingoTips: [string, string, string, string];
}

const COURSES: Record<string, CourseData> = {
  korean: {
    stepNames: ["한글 기초", "기초 단어", "기초 인사", "완료!"],
    lang: "ko-KR",
    lingoTips: [
      "한글을 함께 배워봐요! 🦊\n자음 14개, 모음 10개만 알면 읽을 수 있어요!",
      "이제 첫 단어들을 배워볼까요? 🦊\n탭해서 의미를 확인하세요!",
      "마지막 단계예요! 🦊\n인사말을 배우고 대화를 시작해봐요!",
      "기초 과정 완료! 🦊🎉\n이제 진짜 학습을 시작할 준비가 됐어요!",
    ],
    chars: [
      { char: "ㄱ", roman: "g / k", tip: "기역 · 'ㄱ'은 영어의 'g'처럼 발음해요" },
      { char: "ㄴ", roman: "n",     tip: "니은 · 'ㄴ'은 영어의 'n'처럼 발음해요" },
      { char: "ㄷ", roman: "d / t", tip: "디귿 · 'ㄷ'은 영어의 'd'처럼 발음해요" },
      { char: "ㄹ", roman: "r / l", tip: "리을 · 'ㄹ'은 'r'과 'l' 사이 소리예요" },
      { char: "ㅁ", roman: "m",     tip: "미음 · 'ㅁ'은 영어의 'm'처럼 발음해요" },
      { char: "ㅂ", roman: "b / p", tip: "비읍 · 'ㅂ'은 영어의 'b'처럼 발음해요" },
      { char: "ㅅ", roman: "s",     tip: "시옷 · 'ㅅ'은 영어의 's'처럼 발음해요" },
      { char: "ㅇ", roman: "ng / -", tip: "이응 · 앞에 오면 무음, 받침이면 'ng'" },
      { char: "ㅈ", roman: "j / ch", tip: "지읒 · 'ㅈ'은 영어의 'j'처럼 발음해요" },
      { char: "ㅊ", roman: "ch",    tip: "치읓 · 'ㅊ'은 강한 'ch' 소리예요" },
      { char: "ㅋ", roman: "k",     tip: "키읔 · 'ㅋ'은 강한 'k' 소리예요" },
      { char: "ㅌ", roman: "t",     tip: "티읕 · 'ㅌ'은 강한 't' 소리예요" },
      { char: "ㅍ", roman: "p",     tip: "피읖 · 'ㅍ'은 강한 'p' 소리예요" },
      { char: "ㅎ", roman: "h",     tip: "히읗 · 'ㅎ'은 영어의 'h'처럼 발음해요" },
      { char: "ㅏ", roman: "a",     tip: "아 · '아' 하고 입을 크게 벌려요" },
      { char: "ㅑ", roman: "ya",    tip: "야 · '야' 하고 빠르게 발음해요" },
      { char: "ㅓ", roman: "eo",    tip: "어 · 입을 약간 벌리고 '어' 해요" },
      { char: "ㅕ", roman: "yeo",   tip: "여 · '여' 하고 빠르게 발음해요" },
      { char: "ㅗ", roman: "o",     tip: "오 · 입술을 둥글게 모아 '오' 해요" },
      { char: "ㅛ", roman: "yo",    tip: "요 · '요' 하고 빠르게 발음해요" },
      { char: "ㅜ", roman: "u",     tip: "우 · 입술을 앞으로 내밀고 '우' 해요" },
      { char: "ㅠ", roman: "yu",    tip: "유 · '유' 하고 빠르게 발음해요" },
      { char: "ㅡ", roman: "eu",    tip: "으 · 입술을 양쪽으로 당기고 '으' 해요" },
      { char: "ㅣ", roman: "i",     tip: "이 · 입술을 옆으로 당기고 '이' 해요" },
    ],
    words: [
      { word: "안녕",    meaning: "Hello (informal)",    emoji: "👋" },
      { word: "감사해요", meaning: "Thank you",            emoji: "🙏" },
      { word: "네",      meaning: "Yes",                  emoji: "✅" },
      { word: "아니요",  meaning: "No",                   emoji: "❌" },
      { word: "물",      meaning: "Water",                emoji: "💧" },
      { word: "밥",      meaning: "Rice / Meal",          emoji: "🍚" },
      { word: "사람",    meaning: "Person",               emoji: "👤" },
      { word: "집",      meaning: "House / Home",         emoji: "🏠" },
      { word: "학교",    meaning: "School",               emoji: "🏫" },
      { word: "사랑",    meaning: "Love",                 emoji: "❤️" },
    ],
    greetings: [
      { phrase: "안녕하세요", meaning: "Hello (formal)",      usage: "처음 만날 때 사용해요" },
      { phrase: "감사합니다", meaning: "Thank you (formal)",  usage: "공식적인 자리에서 감사할 때" },
      { phrase: "죄송합니다", meaning: "I'm sorry (formal)",  usage: "공식적으로 사과할 때" },
    ],
  },

  english: {
    stepNames: ["Alphabet", "Basic Words", "Basic Greetings", "Complete!"],
    lang: "en-US",
    lingoTips: [
      "Let's learn the alphabet together! 🦊\n26 letters — the building blocks of English!",
      "Now let's learn your first words! 🦊\nTap each card to see the meaning!",
      "Last step! 🦊\nLearn these greetings and you'll be ready to talk!",
      "Basic course complete! 🦊🎉\nYou're ready to start your language journey!",
    ],
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c) => ({
      char: c,
      roman: c.toLowerCase(),
      tip: ({
        A:"'ay' — as in Apple 🍎", B:"'bee' — as in Ball ⚽", C:"'see' — as in Cat 🐱",
        D:"'dee' — as in Dog 🐶", E:"'ee' — as in Egg 🥚",  F:"'ef' — as in Fish 🐟",
        G:"'jee' — as in Gold 🥇", H:"'aitch' — as in Hat 🎩", I:"'eye' — as in Ice 🧊",
        J:"'jay' — as in Jungle 🌴", K:"'kay' — as in Key 🔑", L:"'el' — as in Lion 🦁",
        M:"'em' — as in Moon 🌙", N:"'en' — as in Night 🌃", O:"'oh' — as in Ocean 🌊",
        P:"'pee' — as in Park 🌳", Q:"'cue' — as in Queen 👑", R:"'ar' — as in Rain 🌧️",
        S:"'es' — as in Sun ☀️", T:"'tee' — as in Tree 🌲", U:"'you' — as in Up ⬆️",
        V:"'vee' — as in Violin 🎻", W:"'double-u' — as in Water 💧", X:"'ex' — as in X-ray 🩻",
        Y:"'why' — as in Yellow 💛", Z:"'zee' — as in Zero 0️⃣",
      } as Record<string, string>)[c] ?? c,
    })),
    words: [
      { word: "Hello",      meaning: "안녕하세요",  emoji: "👋" },
      { word: "Thank you",  meaning: "감사합니다",  emoji: "🙏" },
      { word: "Yes",        meaning: "네",         emoji: "✅" },
      { word: "No",         meaning: "아니요",     emoji: "❌" },
      { word: "Water",      meaning: "물",         emoji: "💧" },
      { word: "Food",       meaning: "음식",       emoji: "🍽️" },
      { word: "House",      meaning: "집",         emoji: "🏠" },
      { word: "School",     meaning: "학교",       emoji: "🏫" },
      { word: "Love",       meaning: "사랑",       emoji: "❤️" },
      { word: "Friend",     meaning: "친구",       emoji: "🤝" },
    ],
    greetings: [
      { phrase: "Hello!",        meaning: "안녕하세요!",      usage: "When meeting someone" },
      { phrase: "Thank you!",    meaning: "감사합니다!",      usage: "To show gratitude" },
      { phrase: "I'm sorry.",    meaning: "죄송합니다.",      usage: "When apologising" },
      { phrase: "Excuse me.",    meaning: "실례합니다.",      usage: "To get attention politely" },
    ],
  },

  spanish: {
    stepNames: ["El Alfabeto", "Palabras Básicas", "Saludos Básicos", "¡Completado!"],
    lang: "es-ES",
    lingoTips: [
      "¡Vamos a aprender el alfabeto! 🦊\nEl español tiene letras especiales como ñ, á, é...",
      "¡Ahora tus primeras palabras! 🦊\n¡Toca cada tarjeta para ver el significado!",
      "¡Último paso! 🦊\n¡Aprende estos saludos y estarás listo para hablar!",
      "¡Curso básico completado! 🦊🎉\n¡Estás listo para empezar tu aventura lingüística!",
    ],
    chars: [
      ...("ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("").map((c) => ({
        char: c, roman: c.toLowerCase(),
        tip: ({ N:"'ene' — normal N", Ñ:"'eñe' — like 'ny' in canyon 🏜️" } as Record<string, string>)[c]
          ?? `'${c.toLowerCase()}' — similar to English`,
      }))),
      { char: "á", roman: "a (stressed)", tip: "Stressed 'a' — like in 'father' 👨" },
      { char: "é", roman: "e (stressed)", tip: "Stressed 'e' — like in 'they' 📍" },
      { char: "í", roman: "i (stressed)", tip: "Stressed 'i' — like in 'machine' ⚙️" },
      { char: "ó", roman: "o (stressed)", tip: "Stressed 'o' — like in 'more' 📈" },
      { char: "ú", roman: "u (stressed)", tip: "Stressed 'u' — like in 'moon' 🌙" },
    ],
    words: [
      { word: "Hola",     meaning: "Hello",       emoji: "👋" },
      { word: "Gracias",  meaning: "Thank you",   emoji: "🙏" },
      { word: "Sí",       meaning: "Yes",         emoji: "✅" },
      { word: "No",       meaning: "No",          emoji: "❌" },
      { word: "Agua",     meaning: "Water",       emoji: "💧" },
      { word: "Comida",   meaning: "Food",        emoji: "🍽️" },
      { word: "Casa",     meaning: "House",       emoji: "🏠" },
      { word: "Escuela",  meaning: "School",      emoji: "🏫" },
      { word: "Amor",     meaning: "Love",        emoji: "❤️" },
      { word: "Amigo",    meaning: "Friend",      emoji: "🤝" },
    ],
    greetings: [
      { phrase: "¡Hola!",       meaning: "Hello!",        usage: "Al saludar a alguien" },
      { phrase: "¡Gracias!",    meaning: "Thank you!",    usage: "Para mostrar gratitud" },
      { phrase: "Lo siento.",   meaning: "I'm sorry.",    usage: "Para disculparse" },
      { phrase: "Perdón.",      meaning: "Excuse me.",    usage: "Para llamar la atención" },
    ],
  },
};

function speak(text: string, lang: string) {
  try { Speech.stop(); } catch {}
  Speech.speak(text, { language: lang, rate: 0.8 });
}

interface TracingCanvasProps { char: string; onTraced: () => void; }
function TracingCanvas({ char, onTraced }: TracingCanvasProps) {
  const [dots, setDots]       = useState<{ x: number; y: number }[]>([]);
  const [traced, setTraced]   = useState(false);
  const dotCount              = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setDots(prev => [...prev.slice(-80), { x: locationX, y: locationY }]);
        dotCount.current += 1;
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setDots(prev => [...prev.slice(-80), { x: locationX, y: locationY }]);
        dotCount.current += 1;
        if (dotCount.current >= 8) {
          setTraced(true);
          onTraced();
        }
      },
    })
  ).current;

  useEffect(() => {
    setDots([]);
    setTraced(false);
    dotCount.current = 0;
  }, [char]);

  return (
    <View style={tc.container}>
      <View style={tc.grid} {...panResponder.panHandlers}>
        <Text style={tc.guideChar}>{char}</Text>
        {dots.map((d, i) => (
          <View key={i} style={[tc.dot, { left: d.x - 6, top: d.y - 6 }]} />
        ))}
        {traced && (
          <View style={tc.checkOverlay}>
            <Ionicons name="checkmark-circle" size={48} color={C.gold} />
          </View>
        )}
      </View>
      <Text style={tc.hint}>
        {traced ? "✓ 잘 하셨어요!" : "화면에 글자를 써보세요 ✍️"}
      </Text>
    </View>
  );
}

const tc = StyleSheet.create({
  container: { alignItems: "center", gap: 8 },
  grid: {
    width: CARD_W * 0.7, height: CARD_W * 0.7,
    borderRadius: 20,
    borderWidth: 1.5, borderColor: C.border,
    borderStyle: "dashed",
    backgroundColor: "rgba(201,162,39,0.04)",
    overflow: "hidden",
    justifyContent: "center", alignItems: "center",
  },
  guideChar: { fontSize: CARD_W * 0.32, color: "rgba(201,162,39,0.15)", fontFamily: F.header, position: "absolute" },
  dot: { position: "absolute", width: 12, height: 12, borderRadius: 6, backgroundColor: C.gold, opacity: 0.7 },
  checkOverlay: { position: "absolute", justifyContent: "center", alignItems: "center", width: "100%", height: "100%", backgroundColor: "rgba(26,10,5,0.5)" },
  hint: { fontSize: 13, fontFamily: F.body, color: C.goldDim, textAlign: "center" },
});

export default function BasicCourseScreen() {
  const insets = useSafeAreaInsets();
  const { learningLanguage, nativeLanguage, updateStats } = useLanguage();
  const lang = (learningLanguage ?? "english") as string;
  const native = (nativeLanguage ?? "english") as string;
  const course = COURSES[lang] ?? COURSES.english;

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [step,   setStep]   = useState(0);
  const [subIdx, setSubIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [traced,  setTraced]  = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);

  const flipAnim  = useRef(new Animated.Value(0)).current;
  const xpAnim    = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(1)).current;

  const totalSteps   = 4;
  const stepItems    = [course.chars, course.words, course.greetings, []];
  const currentItems = stepItems[step] ?? [];
  const totalItems   = currentItems.length || 1;
  const overallPct   = (step * 100 + (subIdx / (totalItems || 1)) * 100) / totalSteps / 100;

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    setSubIdx(0); setFlipped(false); setTraced(false); setAudioPlayed(false);
    Animated.timing(fadeAnim, { toValue: 0, duration: 80, useNativeDriver: true }).start(() => {
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  }, [step]);

  useEffect(() => {
    setFlipped(false); setTraced(false); setAudioPlayed(false);
    Animated.timing(slideAnim, { toValue: 0, duration: 0, useNativeDriver: true }).start();
  }, [subIdx]);

  const loadProgress = async () => {
    try {
      const raw = await AsyncStorage.getItem(PROGRESS_KEY(lang));
      if (raw) {
        const p = JSON.parse(raw);
        setStep(p.step ?? 0);
        setSubIdx(p.subIdx ?? 0);
      }
    } catch {}
  };

  const saveProgress = async (s: number, idx: number) => {
    try {
      await AsyncStorage.setItem(PROGRESS_KEY(lang), JSON.stringify({ step: s, subIdx: idx }));
    } catch {}
  };

  const markDone = async () => {
    try {
      await AsyncStorage.setItem(DONE_KEY(lang), "true");
      await AsyncStorage.removeItem(PROGRESS_KEY(lang));
      await updateStats({ xp: stats.xp + 100 });
    } catch {}
  };

  const animateCard = (dir: 1 | -1, callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    Animated.timing(slideAnim, { toValue: dir * 20, duration: 120, useNativeDriver: true }).start(() => {
      callback();
      Animated.timing(slideAnim, { toValue: 0, duration: 0, useNativeDriver: true }).start();
    });
  };

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 3) { finishCourse(); return; }
    const isLastItem = subIdx >= currentItems.length - 1;
    if (isLastItem) {
      animateCard(1, () => { setStep(s => s + 1); saveProgress(step + 1, 0); });
    } else {
      animateCard(1, () => { setSubIdx(i => i + 1); saveProgress(step, subIdx + 1); });
    }
  };

  const goPrev = () => {
    if (subIdx === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateCard(-1, () => { setSubIdx(i => i - 1); saveProgress(step, subIdx - 1); });
  };

  const finishCourse = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await markDone();
    Animated.timing(xpAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start(() => {
      setTimeout(() => router.replace("/(tabs)"), 800);
    });
  };

  const handleFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toVal = flipped ? 0 : 180;
    Animated.spring(flipAnim, { toValue: toVal, useNativeDriver: true }).start();
    setFlipped(f => !f);
  };

  const playAudio = useCallback((text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    speak(text, course.lang);
    setAudioPlayed(true);
  }, [course.lang]);

  const stepLabel = course.stepNames[step] ?? "";
  const stepNum   = `${step + 1}/${totalSteps}`;
  const lingoTip  = course.lingoTips[step] ?? "";

  const charItem     = step === 0 ? (course.chars[subIdx] ?? course.chars[0]) : null;
  const wordItem     = step === 1 ? (course.words[subIdx] ?? course.words[0]) : null;
  const greetItem    = step === 2 ? (course.greetings[subIdx] ?? course.greetings[0]) : null;
  const isLastOfStep = subIdx >= currentItems.length - 1;

  const canNext = step === 3
    ? true
    : step === 0 ? (audioPlayed || traced)
    : step === 1 ? flipped
    : audioPlayed;

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ["0deg", "180deg"] });
  const backRotate  = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ["180deg", "360deg"] });

  return (
    <View style={[s.container, { paddingTop: topPad }]}>
      {/* ── TOP BAR ── */}
      <View style={s.topBar}>
        <Text style={s.stepLabel}>{stepLabel}</Text>
        <Text style={s.stepNum}>{stepNum} 완료</Text>
      </View>

      {/* ── PROGRESS BAR ── */}
      <View style={s.progressOuter}>
        <Animated.View style={[s.progressInner, { width: `${Math.round(overallPct * 100)}%` }]} />
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: bottomPad + 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── LINGO GUIDE ── */}
        <View style={s.lingoRow}>
          <Text style={s.lingoFox}>🦊</Text>
          <View style={s.lingoBubble}>
            <Text style={s.lingoText}>{lingoTip}</Text>
          </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>

          {/* ── STEP 0: CHARACTERS ── */}
          {step === 0 && charItem && (
            <View style={s.cardWrapper}>
              <View style={s.charCard}>
                <Text style={s.charDisplay}>{charItem.char}</Text>
                <Text style={s.charRoman}>{charItem.roman}</Text>
                <Text style={s.charTip}>{charItem.tip}</Text>
                <Pressable
                  style={({ pressed }) => [s.audioBtn, pressed && { opacity: 0.75 }]}
                  onPress={() => playAudio(charItem.char)}
                >
                  <Ionicons name="volume-medium-outline" size={20} color={C.bg1} />
                  <Text style={s.audioBtnText}>
                    {lang === "korean" ? "발음 듣기" : lang === "spanish" ? "Escuchar" : "Listen"}
                  </Text>
                </Pressable>
              </View>

              <Text style={s.sectionLabel}>
                {lang === "korean" ? "✍️ 따라 써보세요" : lang === "spanish" ? "✍️ Practica" : "✍️ Trace it"}
              </Text>
              <TracingCanvas char={charItem.char} onTraced={() => setTraced(true)} />

              <View style={s.charProgress}>
                <Text style={s.charProgressText}>{subIdx + 1} / {course.chars.length}</Text>
              </View>
            </View>
          )}

          {/* ── STEP 1: VOCABULARY FLASHCARDS ── */}
          {step === 1 && wordItem && (
            <View style={s.cardWrapper}>
              <Pressable onPress={handleFlip} style={s.flipContainer}>
                <Animated.View style={[s.flipCard, s.flipFront, { transform: [{ perspective: 1200 }, { rotateY: frontRotate }] }]}>
                  <Text style={s.wordEmoji}>{wordItem.emoji}</Text>
                  <Text style={s.wordText}>{wordItem.word}</Text>
                  <Text style={s.wordHint}>
                    {lang === "korean" ? "탭해서 의미 확인" : lang === "spanish" ? "Toca para ver" : "Tap to reveal"}
                  </Text>
                </Animated.View>
                <Animated.View style={[s.flipCard, s.flipBack, { transform: [{ perspective: 1200 }, { rotateY: backRotate }] }]}>
                  <Text style={s.wordEmoji}>{wordItem.emoji}</Text>
                  <Text style={s.wordMeaning}>{wordItem.meaning}</Text>
                  <Text style={s.wordBackWord}>{wordItem.word}</Text>
                </Animated.View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [s.audioBtn, pressed && { opacity: 0.75 }]}
                onPress={() => playAudio(wordItem.word)}
              >
                <Ionicons name="volume-medium-outline" size={20} color={C.bg1} />
                <Text style={s.audioBtnText}>
                  {lang === "korean" ? "발음 듣기" : lang === "spanish" ? "Escuchar" : "Listen"}
                </Text>
              </Pressable>

              <View style={s.charProgress}>
                <Text style={s.charProgressText}>{subIdx + 1} / {course.words.length}</Text>
              </View>
            </View>
          )}

          {/* ── STEP 2: GREETINGS ── */}
          {step === 2 && greetItem && (
            <View style={s.cardWrapper}>
              <View style={s.greetCard}>
                <Text style={s.greetPhrase}>{greetItem.phrase}</Text>
                <Text style={s.greetMeaning}>{greetItem.meaning}</Text>
                <Text style={s.greetUsage}>{greetItem.usage}</Text>
              </View>

              <Pressable
                style={({ pressed }) => [s.audioBtn, s.audioBtnLarge, pressed && { opacity: 0.75 }]}
                onPress={() => playAudio(greetItem.phrase)}
              >
                <Ionicons name="volume-medium-outline" size={22} color={C.bg1} />
                <Text style={s.audioBtnText}>
                  {lang === "korean" ? "🎤 듣고 따라하기" : lang === "spanish" ? "🎤 Escuchar y repetir" : "🎤 Listen & Repeat"}
                </Text>
              </Pressable>

              <View style={s.charProgress}>
                <Text style={s.charProgressText}>{subIdx + 1} / {course.greetings.length}</Text>
              </View>
            </View>
          )}

          {/* ── STEP 3: COMPLETION ── */}
          {step === 3 && (
            <View style={s.completionCard}>
              <Text style={s.completionEmoji}>🎉</Text>
              <Text style={s.completionTitle}>
                {lang === "korean" ? "기초 과정 완료!" : lang === "spanish" ? "¡Curso Básico Completado!" : "Basic Course Complete!"}
              </Text>
              <Text style={s.completionSub}>
                {lang === "korean" ? "이제 LingoFox와 함께 본격적인 학습을 시작해봐요!" : lang === "spanish" ? "¡Ahora comienza tu aventura con LingoFox!" : "Now start your full learning adventure with LingoFox!"}
              </Text>
              <Animated.View style={[s.xpBadge, { opacity: xpAnim, transform: [{ scale: xpAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.15, 1] }) }] }]}>
                <Text style={s.xpText}>+100 XP</Text>
              </Animated.View>
              <View style={s.achievementRow}>
                {["📖", "🔤", "🗣️"].map((e, i) => (
                  <View key={i} style={s.achievementBadge}>
                    <Text style={s.achievementEmoji}>{e}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        </Animated.View>

        {/* ── NAVIGATION ── */}
        <View style={s.navRow}>
          {step < 3 && subIdx > 0 && (
            <Pressable style={({ pressed }) => [s.prevBtn, pressed && { opacity: 0.75 }]} onPress={goPrev}>
              <Ionicons name="arrow-back" size={18} color={C.goldDark} />
            </Pressable>
          )}
          <Pressable
            style={({ pressed }) => [
              s.nextBtn,
              !canNext && s.nextBtnDisabled,
              pressed && canNext && { opacity: 0.85 },
            ]}
            onPress={canNext ? goNext : undefined}
            disabled={!canNext}
          >
            <Text style={s.nextBtnText}>
              {step === 3
                ? (lang === "korean" ? "시작하기 🚀" : lang === "spanish" ? "¡Empezar! 🚀" : "Start Learning 🚀")
                : isLastOfStep
                  ? (lang === "korean" ? "다음 단계 →" : lang === "spanish" ? "Siguiente paso →" : "Next Step →")
                  : (lang === "korean" ? "다음 →" : lang === "spanish" ? "Siguiente →" : "Next →")}
            </Text>
          </Pressable>
        </View>

        {!canNext && step < 3 && (
          <Text style={s.nudge}>
            {step === 0
              ? (lang === "korean" ? "먼저 발음을 듣거나 글자를 써보세요 👆" : "Listen to the pronunciation or trace the character 👆")
              : step === 1
                ? (lang === "korean" ? "카드를 탭해서 의미를 확인하세요 👆" : "Tap the card to see the meaning 👆")
                : (lang === "korean" ? "발음 듣기 버튼을 눌러보세요 👆" : "Tap the listen button above 👆")}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg1 },
  topBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingBottom: 8,
  },
  stepLabel: { fontSize: 16, fontFamily: F.header, color: C.gold, letterSpacing: 0.5 },
  stepNum:   { fontSize: 12, fontFamily: F.label, color: C.goldDim, letterSpacing: 0.5 },
  progressOuter: { height: 4, backgroundColor: "rgba(201,162,39,0.18)", marginHorizontal: 20, borderRadius: 2, marginBottom: 12 },
  progressInner: { height: 4, backgroundColor: C.gold, borderRadius: 2 },

  scroll: { paddingHorizontal: 20, alignItems: "center", gap: 20 },

  lingoRow:   { flexDirection: "row", alignItems: "flex-end", gap: 10, alignSelf: "flex-start", maxWidth: "90%" },
  lingoFox:   { fontSize: 38 },
  lingoBubble: {
    backgroundColor: C.bg2, borderRadius: 18, borderBottomLeftRadius: 4,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: C.border, maxWidth: "82%",
  },
  lingoText: { fontSize: 13, fontFamily: F.body, color: C.parchment, lineHeight: 19 },

  cardWrapper: { width: "100%", alignItems: "center", gap: 16 },
  sectionLabel: { fontSize: 13, fontFamily: F.label, color: C.goldDim, letterSpacing: 0.8, textTransform: "uppercase" },

  charCard: {
    width: CARD_W, backgroundColor: C.bg2, borderRadius: 24, padding: 28,
    alignItems: "center", gap: 10,
    borderWidth: 1.5, borderColor: C.border,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6,
  },
  charDisplay: { fontSize: 96, fontFamily: F.header, color: C.gold, lineHeight: 110 },
  charRoman:   { fontSize: 20, fontFamily: F.bodySemi, color: C.goldDim, letterSpacing: 1 },
  charTip:     { fontSize: 14, fontFamily: F.body, color: C.parchment, textAlign: "center", lineHeight: 20 },

  flipContainer: { width: CARD_W, height: 220 },
  flipCard: {
    width: CARD_W, height: 220, position: "absolute",
    backgroundColor: C.bg2, borderRadius: 24,
    borderWidth: 1.5, borderColor: C.border,
    alignItems: "center", justifyContent: "center", gap: 8,
    backfaceVisibility: "hidden",
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6,
  },
  flipFront: {},
  flipBack:  { backgroundColor: C.bg2 },
  wordEmoji:   { fontSize: 40 },
  wordText:    { fontSize: 30, fontFamily: F.header, color: C.gold },
  wordHint:    { fontSize: 12, fontFamily: F.body, color: C.goldDim },
  wordMeaning: { fontSize: 22, fontFamily: F.bodySemi, color: C.parchment },
  wordBackWord:{ fontSize: 14, fontFamily: F.body, color: C.goldDim },

  greetCard: {
    width: CARD_W, backgroundColor: C.bg2, borderRadius: 24, padding: 28,
    alignItems: "center", gap: 12,
    borderWidth: 1.5, borderColor: C.border,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6,
  },
  greetPhrase:  { fontSize: 30, fontFamily: F.header, color: C.gold, textAlign: "center" },
  greetMeaning: { fontSize: 18, fontFamily: F.bodySemi, color: C.parchment, textAlign: "center" },
  greetUsage:   { fontSize: 13, fontFamily: F.body, color: C.goldDim, textAlign: "center", lineHeight: 19 },

  audioBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: C.gold, borderRadius: 22,
    paddingHorizontal: 22, paddingVertical: 12,
  },
  audioBtnLarge: { paddingHorizontal: 28, paddingVertical: 14 },
  audioBtnText: { fontSize: 15, fontFamily: F.bodySemi, color: C.bg1 },

  charProgress: { alignSelf: "center" },
  charProgressText: { fontSize: 13, fontFamily: F.label, color: C.goldDim, letterSpacing: 0.5 },

  completionCard: {
    width: CARD_W, backgroundColor: C.bg2, borderRadius: 28, padding: 32,
    alignItems: "center", gap: 16,
    borderWidth: 1.5, borderColor: C.border,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
  },
  completionEmoji: { fontSize: 60 },
  completionTitle: { fontSize: 22, fontFamily: F.header, color: C.gold, textAlign: "center", letterSpacing: 0.5 },
  completionSub:   { fontSize: 15, fontFamily: F.body, color: C.parchment, textAlign: "center", lineHeight: 22 },
  xpBadge: {
    backgroundColor: C.gold, borderRadius: 30,
    paddingHorizontal: 28, paddingVertical: 12,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12,
  },
  xpText: { fontSize: 22, fontFamily: F.header, color: C.bg1, letterSpacing: 1 },
  achievementRow: { flexDirection: "row", gap: 14, marginTop: 4 },
  achievementBadge: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: "rgba(201,162,39,0.12)", borderWidth: 1.5, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  achievementEmoji: { fontSize: 24 },

  navRow: { flexDirection: "row", alignItems: "center", width: "100%", gap: 12, marginTop: 4 },
  prevBtn: {
    width: 44, height: 44, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.bg2,
    alignItems: "center", justifyContent: "center",
  },
  nextBtn: {
    flex: 1, backgroundColor: C.gold, borderRadius: 22,
    paddingVertical: 14, alignItems: "center", justifyContent: "center",
  },
  nextBtnDisabled: { backgroundColor: "rgba(201,162,39,0.3)" },
  nextBtnText: { fontSize: 15, fontFamily: F.header, color: C.bg1, letterSpacing: 0.3 },
  nudge: { fontSize: 13, fontFamily: F.body, color: C.goldDim, textAlign: "center", paddingHorizontal: 20 },
});
