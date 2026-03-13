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

interface CharItem    { char: string; roman: string; tip: string; }
interface WordItem    { word: string; meaning: string; emoji: string; }
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
      "발음을 듣고 따라 써보세요! 🦊",
      "카드를 탭해서 의미를 확인하세요! 🦊",
      "인사말을 듣고 따라해 보세요! 🦊",
      "기초 과정 완료! 🦊🎉",
    ],
    chars: [
      { char: "ㄱ", roman: "g / k", tip: "기역 · 영어의 'g'처럼 발음해요" },
      { char: "ㄴ", roman: "n",     tip: "니은 · 영어의 'n'처럼 발음해요" },
      { char: "ㄷ", roman: "d / t", tip: "디귿 · 영어의 'd'처럼 발음해요" },
      { char: "ㄹ", roman: "r / l", tip: "리을 · 'r'과 'l' 사이 소리예요" },
      { char: "ㅁ", roman: "m",     tip: "미음 · 영어의 'm'처럼 발음해요" },
      { char: "ㅂ", roman: "b / p", tip: "비읍 · 영어의 'b'처럼 발음해요" },
      { char: "ㅅ", roman: "s",     tip: "시옷 · 영어의 's'처럼 발음해요" },
      { char: "ㅇ", roman: "ng / -", tip: "이응 · 앞에 오면 무음, 받침이면 'ng'" },
      { char: "ㅈ", roman: "j / ch", tip: "지읒 · 영어의 'j'처럼 발음해요" },
      { char: "ㅊ", roman: "ch",    tip: "치읓 · 강한 'ch' 소리예요" },
      { char: "ㅋ", roman: "k",     tip: "키읔 · 강한 'k' 소리예요" },
      { char: "ㅌ", roman: "t",     tip: "티읕 · 강한 't' 소리예요" },
      { char: "ㅍ", roman: "p",     tip: "피읖 · 강한 'p' 소리예요" },
      { char: "ㅎ", roman: "h",     tip: "히읗 · 영어의 'h'처럼 발음해요" },
      { char: "ㅏ", roman: "a",     tip: "아 · 입을 크게 벌려요" },
      { char: "ㅑ", roman: "ya",    tip: "야 · 빠르게 발음해요" },
      { char: "ㅓ", roman: "eo",    tip: "어 · 입을 약간 벌려요" },
      { char: "ㅕ", roman: "yeo",   tip: "여 · 빠르게 발음해요" },
      { char: "ㅗ", roman: "o",     tip: "오 · 입술을 둥글게 모아요" },
      { char: "ㅛ", roman: "yo",    tip: "요 · 빠르게 발음해요" },
      { char: "ㅜ", roman: "u",     tip: "우 · 입술을 앞으로 내밀어요" },
      { char: "ㅠ", roman: "yu",    tip: "유 · 빠르게 발음해요" },
      { char: "ㅡ", roman: "eu",    tip: "으 · 입술을 양쪽으로 당겨요" },
      { char: "ㅣ", roman: "i",     tip: "이 · 입술을 옆으로 당겨요" },
    ],
    words: [
      { word: "안녕",    meaning: "Hello (informal)",  emoji: "👋" },
      { word: "감사해요", meaning: "Thank you",          emoji: "🙏" },
      { word: "네",      meaning: "Yes",                emoji: "✅" },
      { word: "아니요",  meaning: "No",                 emoji: "❌" },
      { word: "물",      meaning: "Water",              emoji: "💧" },
      { word: "밥",      meaning: "Rice / Meal",        emoji: "🍚" },
      { word: "사람",    meaning: "Person",             emoji: "👤" },
      { word: "집",      meaning: "House / Home",       emoji: "🏠" },
      { word: "학교",    meaning: "School",             emoji: "🏫" },
      { word: "사랑",    meaning: "Love",               emoji: "❤️" },
    ],
    greetings: [
      { phrase: "안녕하세요", meaning: "Hello (formal)",     usage: "처음 만날 때 사용해요" },
      { phrase: "감사합니다", meaning: "Thank you (formal)", usage: "공식적인 자리에서 감사할 때" },
      { phrase: "죄송합니다", meaning: "I'm sorry (formal)", usage: "공식적으로 사과할 때" },
    ],
  },

  english: {
    stepNames: ["Alphabet", "Basic Words", "Basic Greetings", "Complete!"],
    lang: "en-US",
    lingoTips: [
      "Listen then trace the letter! 🦊",
      "Tap each card to see the meaning! 🦊",
      "Listen and repeat aloud! 🦊",
      "Basic course complete! 🦊🎉",
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
      { word: "Hello",     meaning: "안녕하세요", emoji: "👋" },
      { word: "Thank you", meaning: "감사합니다", emoji: "🙏" },
      { word: "Yes",       meaning: "네",        emoji: "✅" },
      { word: "No",        meaning: "아니요",    emoji: "❌" },
      { word: "Water",     meaning: "물",        emoji: "💧" },
      { word: "Food",      meaning: "음식",      emoji: "🍽️" },
      { word: "House",     meaning: "집",        emoji: "🏠" },
      { word: "School",    meaning: "학교",      emoji: "🏫" },
      { word: "Love",      meaning: "사랑",      emoji: "❤️" },
      { word: "Friend",    meaning: "친구",      emoji: "🤝" },
    ],
    greetings: [
      { phrase: "Hello!",      meaning: "안녕하세요!", usage: "When meeting someone" },
      { phrase: "Thank you!",  meaning: "감사합니다!", usage: "To show gratitude" },
      { phrase: "I'm sorry.",  meaning: "죄송합니다.", usage: "When apologising" },
      { phrase: "Excuse me.",  meaning: "실례합니다.", usage: "To get attention politely" },
    ],
  },

  spanish: {
    stepNames: ["El Alfabeto", "Palabras Básicas", "Saludos Básicos", "¡Completado!"],
    lang: "es-ES",
    lingoTips: [
      "¡Escucha y traza la letra! 🦊",
      "¡Toca cada tarjeta para ver el significado! 🦊",
      "¡Escucha y repite en voz alta! 🦊",
      "¡Curso básico completado! 🦊🎉",
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
      { word: "Hola",    meaning: "Hello",     emoji: "👋" },
      { word: "Gracias", meaning: "Thank you", emoji: "🙏" },
      { word: "Sí",      meaning: "Yes",       emoji: "✅" },
      { word: "No",      meaning: "No",        emoji: "❌" },
      { word: "Agua",    meaning: "Water",     emoji: "💧" },
      { word: "Comida",  meaning: "Food",      emoji: "🍽️" },
      { word: "Casa",    meaning: "House",     emoji: "🏠" },
      { word: "Escuela", meaning: "School",    emoji: "🏫" },
      { word: "Amor",    meaning: "Love",      emoji: "❤️" },
      { word: "Amigo",   meaning: "Friend",    emoji: "🤝" },
    ],
    greetings: [
      { phrase: "¡Hola!",     meaning: "Hello!",       usage: "Al saludar a alguien" },
      { phrase: "¡Gracias!",  meaning: "Thank you!",   usage: "Para mostrar gratitud" },
      { phrase: "Lo siento.", meaning: "I'm sorry.",   usage: "Para disculparse" },
      { phrase: "Perdón.",    meaning: "Excuse me.",   usage: "Para llamar la atención" },
    ],
  },
};

const PHONETICS: Record<string, string> = {
  A:"ay", B:"bee", C:"see", D:"dee", E:"ee", F:"ef",
  G:"jee", H:"aitch", I:"eye", J:"jay", K:"kay", L:"el",
  M:"em", N:"en", O:"oh", P:"pee", Q:"cue", R:"ar",
  S:"es", T:"tee", U:"you", V:"vee", W:"double-u",
  X:"ex", Y:"why", Z:"zee",
};

function speak(text: string, lang: string) {
  try { Speech.stop(); } catch {}
  const phonetic = PHONETICS[text.toUpperCase()];
  const toSay = phonetic ?? text;
  Speech.speak(toSay, { language: lang, rate: 0.8 });
}

/* ─────────────────────────────────────────────
   Tracing Canvas — no auto-pass, self-check UI
   ───────────────────────────────────────────── */
const DRAW_THRESHOLD = 20;

interface TracingCanvasProps { char: string; onDrawn: () => void; }

function TracingCanvas({ char, onDrawn }: TracingCanvasProps) {
  const [dots, setDots] = useState<{ x: number; y: number }[]>([]);
  const moveCount  = useRef(0);
  const drawnRef   = useRef(false);
  const onDrawnRef = useRef(onDrawn);
  onDrawnRef.current = onDrawn;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder:        () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder:         () => true,
      onMoveShouldSetPanResponderCapture:  () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setDots(prev => [...prev.slice(-150), { x: locationX, y: locationY }]);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        setDots(prev => [...prev.slice(-150), { x: locationX, y: locationY }]);
        moveCount.current += 1;
        if (moveCount.current >= DRAW_THRESHOLD && !drawnRef.current) {
          drawnRef.current = true;
          onDrawnRef.current();
        }
      },
    })
  ).current;

  useEffect(() => {
    setDots([]);
    moveCount.current = 0;
    drawnRef.current  = false;
  }, [char]);

  const webExtra = Platform.OS === "web" ? ({ touchAction: "none" } as object) : {};

  return (
    <View style={[tc.grid, webExtra]} {...panResponder.panHandlers}>
      <Text style={tc.guideChar}>{char}</Text>
      {dots.map((d, i) => (
        <View key={i} style={[tc.dot, { left: d.x - 7, top: d.y - 7 }]} />
      ))}
    </View>
  );
}

const tc = StyleSheet.create({
  grid: {
    flex: 1,
    width: "100%",
    minHeight: 260,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    borderStyle: "dashed",
    backgroundColor: "rgba(201,162,39,0.04)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  guideChar: {
    position: "absolute",
    fontSize: 130,
    color: "rgba(201,162,39,0.10)",
    fontFamily: F.header,
  },
  dot: {
    position: "absolute",
    width: 14, height: 14,
    borderRadius: 7,
    backgroundColor: C.gold,
    opacity: 0.8,
  },
});

/* ─────────────────────────────────────────────
   Main Screen
   ───────────────────────────────────────────── */
export default function BasicCourseScreen() {
  const insets = useSafeAreaInsets();
  const { learningLanguage, updateStats, stats } = useLanguage();
  const lang   = (learningLanguage ?? "english") as string;
  const course = COURSES[lang] ?? COURSES.english;

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [step,        setStep]        = useState(0);
  const [subIdx,      setSubIdx]      = useState(0);
  const [flipped,     setFlipped]     = useState(false);
  const [traced,      setTraced]      = useState(false);  // step 0: user has drawn enough
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [canvasKey,   setCanvasKey]   = useState(0);     // increment to reset canvas

  const flipAnim  = useRef(new Animated.Value(0)).current;
  const xpAnim    = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(1)).current;

  const totalSteps   = 4;
  const stepItems    = [course.chars, course.words, course.greetings, []];
  const currentItems = stepItems[step] ?? [];
  const totalItems   = currentItems.length || 1;
  const overallPct   = (step * 100 + (subIdx / totalItems) * 100) / totalSteps / 100;

  useEffect(() => { loadProgress(); }, []);

  useEffect(() => {
    setSubIdx(0); setFlipped(false); setTraced(false); setAudioPlayed(false);
    Animated.timing(fadeAnim, { toValue: 0, duration: 80, useNativeDriver: true }).start(() => {
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
    flipAnim.setValue(0);
  }, [step]);

  useEffect(() => {
    setFlipped(false); setTraced(false); setAudioPlayed(false);
    setCanvasKey(k => k + 1);
    flipAnim.setValue(0);
  }, [subIdx]);

  const handleRetry = () => {
    setTraced(false);
    setCanvasKey(k => k + 1);
  };

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
    try { await AsyncStorage.setItem(PROGRESS_KEY(lang), JSON.stringify({ step: s, subIdx: idx })); } catch {}
  };

  const markDone = async () => {
    try {
      await AsyncStorage.setItem(DONE_KEY(lang), "true");
      await AsyncStorage.removeItem(PROGRESS_KEY(lang));
      await updateStats({ xp: stats.xp + 100 });
    } catch {}
  };

  const playAudio = useCallback((text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    speak(text, course.lang);
    setAudioPlayed(true);
  }, [course.lang]);

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 3) { finishCourse(); return; }
    if (subIdx >= currentItems.length - 1) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
        setStep(s => s + 1);
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      });
      saveProgress(step + 1, 0);
    } else {
      setSubIdx(i => i + 1);
      saveProgress(step, subIdx + 1);
    }
  };

  const goPrev = () => {
    if (subIdx === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSubIdx(i => i - 1);
    saveProgress(step, subIdx - 1);
  };

  const finishCourse = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await markDone();
    Animated.timing(xpAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start(() => {
      setTimeout(() => router.replace("/(tabs)"), 600);
    });
  };

  const handleFlip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(flipAnim, { toValue: flipped ? 0 : 180, useNativeDriver: true }).start();
    setFlipped(f => !f);
  };

  const charItem  = step === 0 ? (course.chars[subIdx]    ?? course.chars[0])    : null;
  const wordItem  = step === 1 ? (course.words[subIdx]    ?? course.words[0])    : null;
  const greetItem = step === 2 ? (course.greetings[subIdx] ?? course.greetings[0]) : null;
  const isLastOfStep = subIdx >= currentItems.length - 1;

  const canNext = step === 3
    ? true
    : step === 0 ? traced          // must confirm drawing (✅ tapped)
    : step === 1 ? flipped
    : audioPlayed;

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ["0deg", "180deg"] });
  const backRotate  = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ["180deg", "360deg"] });

  const listenLabel  = lang === "korean" ? "발음 듣기" : lang === "spanish" ? "Escuchar" : "Listen";
  const traceLabel   = lang === "korean" ? "✍️ 따라 써보세요" : lang === "spanish" ? "✍️ Practica" : "✍️ Trace it";
  const nextLabel    = step === 3
    ? (lang === "korean" ? "시작하기 🚀" : lang === "spanish" ? "¡Empezar! 🚀" : "Start Learning 🚀")
    : isLastOfStep
      ? (lang === "korean" ? "다음 단계 →" : lang === "spanish" ? "Siguiente paso →" : "Next Step →")
      : (lang === "korean" ? "다음 →"      : lang === "spanish" ? "Siguiente →"      : "Next →");

  /* ── bottom nav bar ── */
  const NavBar = () => (
    <View style={[s.navArea, { paddingBottom: bottomPad + 8 }]}>

      {/* ── Step 0: canvas self-check buttons replace Next ── */}
      {step === 0 && (
        <>
          {!traced && (
            <Text style={s.nudge}>
              {lang === "korean" ? "✏️ 위 캔버스에 글자를 써보세요" : "✏️ Draw the character in the canvas above"}
            </Text>
          )}
          <View style={s.navRow}>
            {subIdx > 0 && (
              <Pressable style={({ pressed }) => [s.prevBtn, pressed && { opacity: 0.7 }]} onPress={goPrev}>
                <Ionicons name="arrow-back" size={18} color={C.goldDark} />
              </Pressable>
            )}
            {/* ✅ Looks good! — only active after drawing, advances to next letter */}
            <Pressable
              style={({ pressed }) => [s.nextBtn, !traced && s.nextBtnOff, pressed && traced && { opacity: 0.85 }]}
              onPress={traced ? goNext : undefined}
              disabled={!traced}
            >
              <Text style={s.nextBtnTxt}>
                {lang === "korean" ? "✅  잘 썼어요!" : lang === "spanish" ? "✅  ¡Bien hecho!" : "✅  Looks good!"}
              </Text>
            </Pressable>
            {/* 🔄 Try again — only shown after drawing */}
            {traced && (
              <Pressable style={({ pressed }) => [s.retryBtn, pressed && { opacity: 0.7 }]} onPress={handleRetry}>
                <Text style={s.retryBtnTxt}>🔄</Text>
              </Pressable>
            )}
          </View>
        </>
      )}

      {/* ── Steps 1–3: normal Next button ── */}
      {step > 0 && (
        <>
          {!canNext && step < 3 && (
            <Text style={s.nudge}>
              {step === 1
                ? (lang === "korean" ? "카드를 탭해서 의미를 확인하세요 👆" : "Tap the card to see the meaning 👆")
                : (lang === "korean" ? "발음 듣기를 먼저 눌러보세요 👆" : "Tap the listen button above 👆")}
            </Text>
          )}
          <View style={s.navRow}>
            {step < 3 && subIdx > 0 && (
              <Pressable style={({ pressed }) => [s.prevBtn, pressed && { opacity: 0.7 }]} onPress={goPrev}>
                <Ionicons name="arrow-back" size={18} color={C.goldDark} />
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [s.nextBtn, !canNext && s.nextBtnOff, pressed && canNext && { opacity: 0.85 }]}
              onPress={canNext ? goNext : undefined}
              disabled={!canNext}
            >
              <Text style={s.nextBtnTxt}>{nextLabel}</Text>
            </Pressable>
          </View>
        </>
      )}

    </View>
  );

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>

      {/* ── TOP BAR ── */}
      <View style={s.topBar}>
        <Text style={s.stepLabel}>{course.stepNames[step]}</Text>
        <View style={s.lingoStrip}>
          <Text style={s.lingoStripFox}>🦊</Text>
          <Text style={s.lingoStripText}>{course.lingoTips[step]}</Text>
        </View>
        <Text style={s.stepNum}>{step + 1}/{totalSteps}</Text>
      </View>

      {/* ── PROGRESS BAR ── */}
      <View style={s.progOuter}>
        <View style={[s.progInner, { width: `${Math.round(overallPct * 100)}%` }]} />
      </View>

      {/* ════════════════════════════════════════
          STEP 0 — Fixed, no-scroll layout
          ════════════════════════════════════════ */}
      {step === 0 && charItem && (
        <Animated.View style={[s.step0, { opacity: fadeAnim }]}>

          {/* Char info row */}
          <View style={s.charInfoRow}>
            <Text style={s.charBig}>{charItem.char}</Text>
            <View style={s.charMeta}>
              <Text style={s.charRoman}>{charItem.roman}</Text>
              <Text style={s.charTip}>{charItem.tip}</Text>
            </View>
          </View>

          {/* Listen button */}
          <Pressable
            style={({ pressed }) => [s.listenBtn, pressed && { opacity: 0.75 }]}
            onPress={() => playAudio(charItem.char)}
          >
            <Ionicons name="volume-medium-outline" size={18} color={C.bg1} />
            <Text style={s.listenBtnTxt}>{listenLabel}</Text>
          </Pressable>

          {/* Divider + label */}
          <View style={s.traceLabelRow}>
            <View style={s.traceLine} />
            <Text style={s.traceLabel}>{traceLabel}</Text>
            <View style={s.traceLine} />
          </View>

          {/* ── CANVAS fills remaining space ── */}
          <TracingCanvas key={canvasKey} char={charItem.char} onDrawn={() => setTraced(true)} />

          {/* Counter */}
          <Text style={s.counter}>{subIdx + 1} / {course.chars.length}</Text>
        </Animated.View>
      )}

      {/* ════════════════════════════════════════
          STEPS 1-3 — Scrollable content
          ════════════════════════════════════════ */}
      {step > 0 && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, width: "100%", alignItems: "center", gap: 20 }}>

            {/* ── STEP 1: VOCABULARY FLASHCARDS ── */}
            {step === 1 && wordItem && (
              <>
                <Pressable onPress={handleFlip} style={s.flipBox}>
                  <Animated.View style={[s.flipCard, { transform: [{ perspective: 1200 }, { rotateY: frontRotate }] }]}>
                    <Text style={s.wordEmoji}>{wordItem.emoji}</Text>
                    <Text style={s.wordText}>{wordItem.word}</Text>
                    <Text style={s.wordHint}>{lang === "korean" ? "탭해서 의미 확인" : lang === "spanish" ? "Toca para ver" : "Tap to reveal"}</Text>
                  </Animated.View>
                  <Animated.View style={[s.flipCard, s.flipBack, { transform: [{ perspective: 1200 }, { rotateY: backRotate }] }]}>
                    <Text style={s.wordEmoji}>{wordItem.emoji}</Text>
                    <Text style={s.wordMeaning}>{wordItem.meaning}</Text>
                    <Text style={s.wordSub}>{wordItem.word}</Text>
                  </Animated.View>
                </Pressable>
                <Pressable style={({ pressed }) => [s.listenBtn, pressed && { opacity: 0.75 }]} onPress={() => playAudio(wordItem.word)}>
                  <Ionicons name="volume-medium-outline" size={18} color={C.bg1} />
                  <Text style={s.listenBtnTxt}>{listenLabel}</Text>
                </Pressable>
                <Text style={s.counter}>{subIdx + 1} / {course.words.length}</Text>
              </>
            )}

            {/* ── STEP 2: GREETINGS ── */}
            {step === 2 && greetItem && (
              <>
                <View style={s.greetCard}>
                  <Text style={s.greetPhrase}>{greetItem.phrase}</Text>
                  <Text style={s.greetMeaning}>{greetItem.meaning}</Text>
                  <Text style={s.greetUsage}>{greetItem.usage}</Text>
                </View>
                <Pressable style={({ pressed }) => [s.listenBtn, s.listenBtnLg, pressed && { opacity: 0.75 }]} onPress={() => playAudio(greetItem.phrase)}>
                  <Ionicons name="volume-medium-outline" size={20} color={C.bg1} />
                  <Text style={s.listenBtnTxt}>{lang === "korean" ? "🎤 듣고 따라하기" : lang === "spanish" ? "🎤 Escuchar y repetir" : "🎤 Listen & Repeat"}</Text>
                </Pressable>
                <Text style={s.counter}>{subIdx + 1} / {course.greetings.length}</Text>
              </>
            )}

            {/* ── STEP 3: COMPLETION ── */}
            {step === 3 && (
              <View style={s.completionCard}>
                <Text style={s.bigEmoji}>🎉</Text>
                <Text style={s.completionTitle}>
                  {lang === "korean" ? "기초 과정 완료!" : lang === "spanish" ? "¡Curso Básico Completado!" : "Basic Course Complete!"}
                </Text>
                <Text style={s.completionSub}>
                  {lang === "korean" ? "이제 LingoFox와 함께 본격적인 학습을 시작해봐요!" : lang === "spanish" ? "¡Ahora comienza tu aventura con LingoFox!" : "You're ready to start your full language journey!"}
                </Text>
                <Animated.View style={[s.xpBadge, {
                  opacity: xpAnim,
                  transform: [{ scale: xpAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.15, 1] }) }],
                }]}>
                  <Text style={s.xpText}>+100 XP</Text>
                </Animated.View>
                <View style={s.badges}>
                  {["📖", "🔤", "🗣️"].map((e, i) => (
                    <View key={i} style={s.badge}><Text style={s.badgeEmoji}>{e}</Text></View>
                  ))}
                </View>
              </View>
            )}

          </Animated.View>
        </ScrollView>
      )}

      {/* ── FIXED BOTTOM NAV (all steps) ── */}
      <NavBar />
    </View>
  );
}

/* ─────────────────────────────────────────────
   Styles
   ───────────────────────────────────────────── */
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg1 },

  topBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 6, gap: 8,
  },
  stepLabel: { fontSize: 14, fontFamily: F.header, color: C.gold, letterSpacing: 0.4 },
  lingoStrip: { flex: 1, flexDirection: "row", alignItems: "center", gap: 4 },
  lingoStripFox:  { fontSize: 18 },
  lingoStripText: { fontSize: 11, fontFamily: F.body, color: C.goldDim, flexShrink: 1 },
  stepNum: { fontSize: 11, fontFamily: F.label, color: C.goldDim },

  progOuter: { height: 4, backgroundColor: "rgba(201,162,39,0.18)", marginHorizontal: 16, borderRadius: 2, marginBottom: 10 },
  progInner: { height: 4, backgroundColor: C.gold, borderRadius: 2 },

  /* ── Step 0 fixed layout ── */
  step0: { flex: 1, paddingHorizontal: 16, gap: 10 },

  charInfoRow: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: C.bg2, borderRadius: 20,
    padding: 16, borderWidth: 1.5, borderColor: C.border,
  },
  charBig:   { fontSize: 72, fontFamily: F.header, color: C.gold, width: 88, textAlign: "center" },
  charMeta:  { flex: 1, gap: 4 },
  charRoman: { fontSize: 16, fontFamily: F.bodySemi, color: C.goldDim, letterSpacing: 0.5 },
  charTip:   { fontSize: 13, fontFamily: F.body, color: C.parchment, lineHeight: 18 },

  listenBtn: {
    flexDirection: "row", alignItems: "center", gap: 7,
    backgroundColor: C.gold, borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 10, alignSelf: "center",
  },
  listenBtnLg: { paddingHorizontal: 26, paddingVertical: 13 },
  listenBtnTxt: { fontSize: 14, fontFamily: F.bodySemi, color: C.bg1 },

  traceLabelRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  traceLine:     { flex: 1, height: 1, backgroundColor: C.border },
  traceLabel:    { fontSize: 11, fontFamily: F.label, color: C.goldDim, letterSpacing: 1, textTransform: "uppercase" },

  counter: { fontSize: 12, fontFamily: F.label, color: C.goldDim, textAlign: "center", letterSpacing: 0.5 },

  /* ── Steps 1-3 scroll content ── */
  scrollContent: { padding: 16, alignItems: "center", gap: 20, paddingBottom: 24 },

  flipBox:  { width: CARD_W, height: 220 },
  flipCard: {
    width: CARD_W, height: 220, position: "absolute",
    backgroundColor: C.bg2, borderRadius: 22,
    borderWidth: 1.5, borderColor: C.border,
    alignItems: "center", justifyContent: "center", gap: 8,
    backfaceVisibility: "hidden",
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 14, elevation: 6,
  },
  flipBack:    { backgroundColor: C.bg2 },
  wordEmoji:   { fontSize: 38 },
  wordText:    { fontSize: 28, fontFamily: F.header, color: C.gold },
  wordHint:    { fontSize: 12, fontFamily: F.body, color: C.goldDim },
  wordMeaning: { fontSize: 20, fontFamily: F.bodySemi, color: C.parchment },
  wordSub:     { fontSize: 13, fontFamily: F.body, color: C.goldDim },

  greetCard: {
    width: CARD_W, backgroundColor: C.bg2, borderRadius: 22, padding: 28,
    alignItems: "center", gap: 12,
    borderWidth: 1.5, borderColor: C.border,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 14, elevation: 6,
  },
  greetPhrase:  { fontSize: 28, fontFamily: F.header, color: C.gold, textAlign: "center" },
  greetMeaning: { fontSize: 17, fontFamily: F.bodySemi, color: C.parchment, textAlign: "center" },
  greetUsage:   { fontSize: 13, fontFamily: F.body, color: C.goldDim, textAlign: "center" },

  completionCard: {
    width: CARD_W, backgroundColor: C.bg2, borderRadius: 26, padding: 30,
    alignItems: "center", gap: 16,
    borderWidth: 1.5, borderColor: C.border,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
  },
  bigEmoji:       { fontSize: 56 },
  completionTitle: { fontSize: 20, fontFamily: F.header, color: C.gold, textAlign: "center", letterSpacing: 0.5 },
  completionSub:   { fontSize: 14, fontFamily: F.body, color: C.parchment, textAlign: "center", lineHeight: 21 },
  xpBadge: {
    backgroundColor: C.gold, borderRadius: 28,
    paddingHorizontal: 26, paddingVertical: 10,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10,
  },
  xpText:   { fontSize: 20, fontFamily: F.header, color: C.bg1, letterSpacing: 1 },
  badges:   { flexDirection: "row", gap: 14, marginTop: 4 },
  badge: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: "rgba(201,162,39,0.12)", borderWidth: 1.5, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
  },
  badgeEmoji: { fontSize: 22 },

  /* ── Bottom nav (fixed) ── */
  navArea: { paddingHorizontal: 16, paddingTop: 8, gap: 6, borderTopWidth: 1, borderTopColor: C.border },
  nudge:   { fontSize: 12, fontFamily: F.body, color: C.goldDim, textAlign: "center" },
  navRow:  { flexDirection: "row", gap: 10 },
  prevBtn: {
    width: 44, height: 48, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.bg2, alignItems: "center", justifyContent: "center",
  },
  nextBtn: {
    flex: 1, backgroundColor: C.gold, borderRadius: 20,
    paddingVertical: 14, alignItems: "center", justifyContent: "center",
  },
  nextBtnOff: { backgroundColor: "rgba(201,162,39,0.28)" },
  nextBtnTxt: { fontSize: 15, fontFamily: F.header, color: C.bg1, letterSpacing: 0.3 },
  retryBtn: {
    width: 52, height: 48, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.bg2, alignItems: "center", justifyContent: "center",
  },
  retryBtnTxt: { fontSize: 20 },
});
