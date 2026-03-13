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
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage } from "@/context/LanguageContext";
import { getApiUrl } from "@/lib/query-client";
import { C, F } from "@/constants/theme";

const { width: SW } = Dimensions.get("window");
const CARD_W = Math.min(SW - 48, 360);

const PROGRESS_KEY = (lang: string) => `basicCourseProgress_${lang}`;
const DONE_KEY     = (lang: string) => `basicCourseCompleted_${lang}`;

interface CharItem    { char: string; roman: string; tip: string; }
interface WordItem    { word: string; meaning: string; emoji: string; }
interface GreetingItem { phrase: string; meaning: string; usage: { ko: string; en: string; es: string }; }

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
      { phrase: "안녕하세요", meaning: "Hello (formal)",     usage: { ko: "처음 만날 때 사용해요", en: "Used when greeting someone formally", es: "Al saludar a alguien formalmente" } },
      { phrase: "감사합니다", meaning: "Thank you (formal)", usage: { ko: "공식적인 자리에서 감사할 때", en: "To show formal gratitude", es: "Para mostrar gratitud formalmente" } },
      { phrase: "죄송합니다", meaning: "I'm sorry (formal)", usage: { ko: "공식적으로 사과할 때", en: "To apologise formally", es: "Para disculparse formalmente" } },
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
      { phrase: "Hello!",      meaning: "안녕하세요!", usage: { ko: "누군가를 만났을 때", en: "When meeting someone", es: "Al saludar a alguien" } },
      { phrase: "Thank you!",  meaning: "감사합니다!", usage: { ko: "감사를 표현할 때", en: "To show gratitude", es: "Para mostrar gratitud" } },
      { phrase: "I'm sorry.",  meaning: "죄송합니다.", usage: { ko: "사과할 때", en: "When apologising", es: "Para disculparse" } },
      { phrase: "Excuse me.",  meaning: "실례합니다.", usage: { ko: "정중히 주의를 끌 때", en: "To get attention politely", es: "Para llamar la atención" } },
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
      { phrase: "¡Hola!",     meaning: "Hello!",       usage: { ko: "누군가에게 인사할 때", en: "When greeting someone", es: "Al saludar a alguien" } },
      { phrase: "¡Gracias!",  meaning: "Thank you!",   usage: { ko: "감사를 표현할 때", en: "To show gratitude", es: "Para mostrar gratitud" } },
      { phrase: "Lo siento.", meaning: "I'm sorry.",   usage: { ko: "사과할 때", en: "When apologising", es: "Para disculparse" } },
      { phrase: "Perdón.",    meaning: "Excuse me.",   usage: { ko: "정중히 주의를 끌 때", en: "To get attention politely", es: "Para llamar la atención" } },
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

function speak(text: string, courseLang: string) {
  try { Speech.stop(); } catch {}
  // For English: use phonetic alphabet name (e.g. "P" → "pee")
  // For other languages: lowercase single chars so TTS engine pronounces the letter name correctly
  //   e.g. Spanish "P" → "p" so the engine says "pe" not the English "pee"
  let toSay: string;
  if (courseLang.startsWith("en")) {
    toSay = PHONETICS[text.toUpperCase()] ?? text;
  } else if (text.length === 1) {
    toSay = text.toLowerCase();
  } else {
    toSay = text;
  }
  Speech.speak(toSay, { language: courseLang, rate: 0.8 });
}

/* ─────────────────────────────────────────────
   Per-letter tip data (phonetics + example words)
   ───────────────────────────────────────────── */
interface LetData { ko: string; es: string; enWord: string; esWord: string; emoji: string; }
const EN_LET: Record<string, LetData> = {
  A:{ko:"에이",  es:"a",          enWord:"Apple",   esWord:"Árbol",   emoji:"🍎"},
  B:{ko:"비",    es:"be",         enWord:"Ball",    esWord:"Bola",    emoji:"⚽"},
  C:{ko:"씨",    es:"ce",         enWord:"Cat",     esWord:"Casa",    emoji:"🐱"},
  D:{ko:"디",    es:"de",         enWord:"Dog",     esWord:"Dedo",    emoji:"🐶"},
  E:{ko:"이",    es:"e",          enWord:"Egg",     esWord:"Elefante",emoji:"🥚"},
  F:{ko:"에프",  es:"efe",        enWord:"Fish",    esWord:"Flor",    emoji:"🐟"},
  G:{ko:"지",    es:"ge",         enWord:"Gold",    esWord:"Gato",    emoji:"🥇"},
  H:{ko:"에이치",es:"hache",      enWord:"Hat",     esWord:"Hola",    emoji:"🎩"},
  I:{ko:"아이",  es:"i",          enWord:"Ice",     esWord:"Isla",    emoji:"🧊"},
  J:{ko:"제이",  es:"jota",       enWord:"Jungle",  esWord:"Jugo",    emoji:"🌴"},
  K:{ko:"케이",  es:"ka",         enWord:"Key",     esWord:"Kilo",    emoji:"🔑"},
  L:{ko:"엘",    es:"ele",        enWord:"Lion",    esWord:"Luna",    emoji:"🦁"},
  M:{ko:"엠",    es:"eme",        enWord:"Moon",    esWord:"Mano",    emoji:"🌙"},
  N:{ko:"엔",    es:"ene",        enWord:"Night",   esWord:"Noche",   emoji:"🌃"},
  O:{ko:"오",    es:"o",          enWord:"Ocean",   esWord:"Oso",     emoji:"🌊"},
  P:{ko:"피",    es:"pe",         enWord:"Park",    esWord:"Perro",   emoji:"🌳"},
  Q:{ko:"큐",    es:"cu",         enWord:"Queen",   esWord:"Queso",   emoji:"👑"},
  R:{ko:"아르",  es:"erre",       enWord:"Rain",    esWord:"Rosa",    emoji:"🌧️"},
  S:{ko:"에스",  es:"ese",        enWord:"Sun",     esWord:"Sol",     emoji:"☀️"},
  T:{ko:"티",    es:"te",         enWord:"Tree",    esWord:"Taza",    emoji:"🌲"},
  U:{ko:"유",    es:"u",          enWord:"Up",      esWord:"Uva",     emoji:"⬆️"},
  V:{ko:"브이",  es:"uve",        enWord:"Violin",  esWord:"Vaca",    emoji:"🎻"},
  W:{ko:"더블유",es:"doble uve",  enWord:"Water",   esWord:"Wifi",    emoji:"💧"},
  X:{ko:"엑스",  es:"equis",      enWord:"X-ray",   esWord:"Xilofón", emoji:"🩻"},
  Y:{ko:"와이",  es:"ye",         enWord:"Yellow",  esWord:"Yoyo",    emoji:"💛"},
  Z:{ko:"지",    es:"zeta",       enWord:"Zero",    esWord:"Zapato",  emoji:"0️⃣"},
};

interface EsData { ko: string; en: string; word: string; emoji: string; }
const ES_LET: Record<string, EsData> = {
  A:{ko:"아",      en:"a",    word:"Árbol",    emoji:"🌳"},
  B:{ko:"베",      en:"b",    word:"Bola",     emoji:"⚽"},
  C:{ko:"세",      en:"k/s",  word:"Casa",     emoji:"🏠"},
  D:{ko:"데",      en:"d",    word:"Dedo",     emoji:"👆"},
  E:{ko:"에",      en:"e",    word:"Elefante", emoji:"🐘"},
  F:{ko:"에페",    en:"f",    word:"Flor",     emoji:"🌸"},
  G:{ko:"헤",      en:"g/h",  word:"Gato",     emoji:"🐱"},
  H:{ko:"아체",    en:"silent",word:"Hola",    emoji:"👋"},
  I:{ko:"이",      en:"ee",   word:"Isla",     emoji:"🏝️"},
  J:{ko:"호타",    en:"h",    word:"Jugo",     emoji:"🧃"},
  K:{ko:"카",      en:"k",    word:"Kilo",     emoji:"⚖️"},
  L:{ko:"엘레",    en:"l",    word:"Luna",     emoji:"🌙"},
  M:{ko:"에메",    en:"m",    word:"Mano",     emoji:"✋"},
  N:{ko:"에네",    en:"n",    word:"Noche",    emoji:"🌃"},
  Ñ:{ko:"에녜",    en:"ny",   word:"Niño",     emoji:"👦"},
  O:{ko:"오",      en:"o",    word:"Oso",      emoji:"🐻"},
  P:{ko:"뻬",      en:"p",    word:"Perro",    emoji:"🐶"},
  Q:{ko:"꾸",      en:"k",    word:"Queso",    emoji:"🧀"},
  R:{ko:"에레",    en:"r",    word:"Rosa",     emoji:"🌹"},
  S:{ko:"에세",    en:"s",    word:"Sol",      emoji:"☀️"},
  T:{ko:"떼",      en:"t",    word:"Taza",     emoji:"☕"},
  U:{ko:"우",      en:"oo",   word:"Uva",      emoji:"🍇"},
  V:{ko:"베",      en:"b/v",  word:"Vaca",     emoji:"🐄"},
  W:{ko:"도블레우",en:"w",    word:"Wifi",     emoji:"📶"},
  X:{ko:"에끼스",  en:"ks/s", word:"Xilofón",  emoji:"🎵"},
  Y:{ko:"예",      en:"y",    word:"Yoyo",     emoji:"🪀"},
  Z:{ko:"세타",    en:"s/th", word:"Zapato",   emoji:"👟"},
  á:{ko:"강세 아", en:"a (stressed)", word:"Árbol",   emoji:"🌳"},
  é:{ko:"강세 에", en:"e (stressed)", word:"Éxito",   emoji:"🏆"},
  í:{ko:"강세 이", en:"i (stressed)", word:"Índice",  emoji:"☝️"},
  ó:{ko:"강세 오", en:"o (stressed)", word:"Ópera",   emoji:"🎭"},
  ú:{ko:"강세 우", en:"u (stressed)", word:"Último",  emoji:"🔚"},
};

interface KoData { name: string; enSound: string; esSound: string; enWord: string; esWord: string; emoji: string; }
const KO_LET: Record<string, KoData> = {
  ㄱ:{name:"기역", enSound:"g",   esSound:"g",  enWord:"Go",   esWord:"Gato",   emoji:"🏃"},
  ㄴ:{name:"니은", enSound:"n",   esSound:"n",  enWord:"No",   esWord:"Noche",  emoji:"❌"},
  ㄷ:{name:"디귿", enSound:"d",   esSound:"d",  enWord:"Dog",  esWord:"Dedo",   emoji:"🐶"},
  ㄹ:{name:"리을", enSound:"r/l", esSound:"r",  enWord:"Run",  esWord:"Rosa",   emoji:"🏃"},
  ㅁ:{name:"미음", enSound:"m",   esSound:"m",  enWord:"Moon", esWord:"Mano",   emoji:"🌙"},
  ㅂ:{name:"비읍", enSound:"b",   esSound:"b",  enWord:"Ball", esWord:"Bola",   emoji:"⚽"},
  ㅅ:{name:"시옷", enSound:"s",   esSound:"s",  enWord:"Sun",  esWord:"Sol",    emoji:"☀️"},
  ㅇ:{name:"이응", enSound:"ng",  esSound:"ng", enWord:"Ring", esWord:"Ring",   emoji:"💍"},
  ㅈ:{name:"지읒", enSound:"j",   esSound:"y",  enWord:"Jam",  esWord:"Yoyo",   emoji:"🍓"},
  ㅊ:{name:"치읓", enSound:"ch",  esSound:"ch", enWord:"Chip", esWord:"Chico",  emoji:"🍟"},
  ㅋ:{name:"키읔", enSound:"k",   esSound:"k",  enWord:"Key",  esWord:"Kilo",   emoji:"🔑"},
  ㅌ:{name:"티읕", enSound:"t",   esSound:"t",  enWord:"Tree", esWord:"Taza",   emoji:"🌲"},
  ㅍ:{name:"피읖", enSound:"p",   esSound:"p",  enWord:"Park", esWord:"Perro",  emoji:"🌳"},
  ㅎ:{name:"히읗", enSound:"h",   esSound:"j",  enWord:"Hat",  esWord:"Hola",   emoji:"🎩"},
  ㅏ:{name:"아",   enSound:"a",   esSound:"a",  enWord:"Ah",   esWord:"Árbol",  emoji:"😮"},
  ㅑ:{name:"야",   enSound:"ya",  esSound:"ya", enWord:"Yarn", esWord:"Yarda",  emoji:"🧶"},
  ㅓ:{name:"어",   enSound:"uh",  esSound:"eo", enWord:"Up",   esWord:"Uva",    emoji:"⬆️"},
  ㅕ:{name:"여",   enSound:"yuh", esSound:"yeo",enWord:"Yes",  esWord:"Yeso",   emoji:"✅"},
  ㅗ:{name:"오",   enSound:"oh",  esSound:"o",  enWord:"Ocean",esWord:"Oso",    emoji:"🌊"},
  ㅛ:{name:"요",   enSound:"yo",  esSound:"yo", enWord:"Yo",   esWord:"Yoga",   emoji:"🧘"},
  ㅜ:{name:"우",   enSound:"oo",  esSound:"u",  enWord:"Zoo",  esWord:"Uva",    emoji:"🦁"},
  ㅠ:{name:"유",   enSound:"you", esSound:"yu", enWord:"You",  esWord:"Yugo",   emoji:"👤"},
  ㅡ:{name:"으",   enSound:"eu",  esSound:"eu", enWord:"Ugh",  esWord:"Euro",   emoji:"😑"},
  ㅣ:{name:"이",   enSound:"ee",  esSound:"i",  enWord:"Eat",  esWord:"Isla",   emoji:"🍽️"},
};

function getCharTip(char: string, learning: string, native: string): string {
  const up = char.toUpperCase();

  if (learning === "english") {
    const d = EN_LET[up];
    if (!d) return `'${char.toLowerCase()}' — ${char}`;
    if (native === "korean")  return `'${d.ko}' — ${d.enWord} ${d.emoji} 의 첫 글자`;
    if (native === "spanish") return `'${d.es}' — como en ${d.enWord} ${d.emoji}`;
    return `'${d.es}' — as in ${d.enWord} ${d.emoji}`;          // native english
  }

  if (learning === "spanish") {
    const d = ES_LET[up] ?? ES_LET[char];
    if (!d) return `'${char.toLowerCase()}' — ${char}`;
    if (native === "korean")  return `'${d.ko}' — ${d.word} ${d.emoji} 의 첫 글자`;
    if (native === "english") return `'${d.en}' — similar to English '${d.en}', as in ${d.word} ${d.emoji}`;
    return `'${char.toLowerCase()}' — como en ${d.word} ${d.emoji}`; // native spanish
  }

  if (learning === "korean") {
    const d = KO_LET[char];
    if (!d) return char;
    if (native === "english") return `'${d.name}' — sounds like '${d.enSound}' in ${d.enWord} ${d.emoji}`;
    if (native === "spanish") return `'${d.name}' — suena como '${d.esSound}' en ${d.esWord} ${d.emoji}`;
    return `${d.name} · 영어의 '${d.enSound}'처럼 발음해요`; // native korean
  }

  return char;
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
type ReviewSection = "write" | "listen" | "speak" | "full";
const REVIEW_TS_KEY = (section: ReviewSection, lang: string) => `basicReviewTs_${section}_${lang}`;

function daysAgoLabel(ts: number | null, native: string): string {
  if (!ts) return native === "korean" ? "미복습" : native === "spanish" ? "Sin repasar" : "Not reviewed";
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days === 0) return native === "korean" ? "오늘" : native === "spanish" ? "Hoy" : "Today";
  if (days === 1) return native === "korean" ? "1일 전" : native === "spanish" ? "Ayer" : "Yesterday";
  return native === "korean" ? `${days}일 전` : native === "spanish" ? `Hace ${days} días` : `${days} days ago`;
}

export default function BasicCourseScreen() {
  const insets = useSafeAreaInsets();
  const { learningLanguage, nativeLanguage, updateStats, stats } = useLanguage();
  const { review } = useLocalSearchParams<{ review?: string }>();
  const isReviewMode = review === "1";

  const lang   = (learningLanguage ?? "english") as string;
  const native = (nativeLanguage ?? "english") as string;
  const course = COURSES[lang] ?? COURSES.english;

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [showReviewMenu, setShowReviewMenu] = useState(isReviewMode);
  const [reviewSection,  setReviewSection]  = useState<ReviewSection | null>(null);
  const [reviewTs,       setReviewTs]       = useState<Record<ReviewSection, number | null>>({
    write: null, listen: null, speak: null, full: null,
  });

  const [showIntro,   setShowIntro]   = useState(!isReviewMode);  // skip intro in review mode
  const [step,        setStep]        = useState(0);
  const [subIdx,      setSubIdx]      = useState(0);
  const [flipped,     setFlipped]     = useState(false);
  const [traced,      setTraced]      = useState(false);  // step 0: user has drawn enough
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [canvasKey,   setCanvasKey]   = useState(0);     // increment to reset canvas

  // Greetings step pronunciation flow
  type GreetPhase = "listen" | "speak" | "recording" | "processing" | "pass" | "fail";
  const [greetPhase, setGreetPhase]   = useState<GreetPhase>("listen");
  const [greetScore, setGreetScore]   = useState<number | null>(null);
  const mediaRecorderRef              = useRef<any>(null);
  const audioChunksRef                = useRef<Uint8Array[]>([]);

  const flipAnim  = useRef(new Animated.Value(0)).current;
  const xpAnim    = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(1)).current;

  const totalSteps   = 4;
  const stepItems    = [course.chars, course.words, course.greetings, []];
  const currentItems = stepItems[step] ?? [];
  const totalItems   = currentItems.length || 1;
  const overallPct   = (step * 100 + (subIdx / totalItems) * 100) / totalSteps / 100;

  useEffect(() => { if (!isReviewMode) loadProgress(); }, []);

  useEffect(() => {
    if (!isReviewMode) return;
    const sections: ReviewSection[] = ["write", "listen", "speak", "full"];
    Promise.all(sections.map(s => AsyncStorage.getItem(REVIEW_TS_KEY(s, lang)))).then(vals => {
      setReviewTs({
        write:  vals[0] ? Number(vals[0]) : null,
        listen: vals[1] ? Number(vals[1]) : null,
        speak:  vals[2] ? Number(vals[2]) : null,
        full:   vals[3] ? Number(vals[3]) : null,
      });
    });
  }, [isReviewMode, lang]);

  const startReviewSection = async (section: ReviewSection) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await AsyncStorage.setItem(REVIEW_TS_KEY(section, lang), String(Date.now()));
    setReviewSection(section);
    setSubIdx(0);
    setFlipped(false); setTraced(false); setAudioPlayed(false);
    setGreetPhase("listen"); setGreetScore(null);
    setCanvasKey(k => k + 1);
    if (section === "speak") {
      setStep(2);
    } else {
      setStep(0);
    }
    setShowReviewMenu(false);
  };

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
    setGreetPhase("listen"); setGreetScore(null);
  }, [subIdx]);

  const handleRetry = () => {
    setTraced(false);
    setCanvasKey(k => k + 1);
  };

  const handleSkip = async () => {
    try { await AsyncStorage.setItem(DONE_KEY(lang), "true"); } catch {}
    router.replace("/(tabs)");
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

  const playAudio = useCallback(async (rawText: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAudioPlayed(true);

    // Lowercase single chars for non-English so TTS names them correctly (e.g. "p" → "pe" in Spanish)
    const text = (!course.lang.startsWith("en") && rawText.length === 1)
      ? rawText.toLowerCase()
      : rawText;

    try {
      const url = new URL("/api/pronunciation-tts", getApiUrl());
      url.searchParams.set("text", text);
      url.searchParams.set("lang", course.lang);

      if (Platform.OS === "web") {
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error("tts-fail");
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const audio = new (window as any).Audio(objectUrl) as HTMLAudioElement;
        audio.onended = () => URL.revokeObjectURL(objectUrl);
        audio.onerror = () => URL.revokeObjectURL(objectUrl);
        audio.play();
      } else {
        const { Audio } = await import("expo-av") as any;
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync({ uri: url.toString() }, { shouldPlay: true });
        sound.setOnPlaybackStatusUpdate((st: any) => { if (st.didJustFinish) sound.unloadAsync(); });
      }
    } catch {
      // Fallback to expo-speech only if Azure fails
      speak(text, course.lang);
    }
  }, [course.lang]);

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 3) { finishCourse(); return; }
    if (subIdx >= currentItems.length - 1) {
      // In review mode: return to section menu after finishing items
      if (isReviewMode) {
        Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
          setShowReviewMenu(true);
          setReviewSection(null);
          Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
        });
        return;
      }
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
        setStep(s => s + 1);
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
      });
      saveProgress(step + 1, 0);
    } else {
      setSubIdx(i => i + 1);
      if (!isReviewMode) saveProgress(step, subIdx + 1);
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

  const handleGreetListen = async () => {
    if (!greetItem) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAudioPlayed(true);
    try {
      const url = new URL("/api/pronunciation-tts", getApiUrl());
      url.searchParams.set("text", greetItem.phrase);
      url.searchParams.set("lang", course.lang);
      if (Platform.OS === "web") {
        const res = await fetch(url.toString());
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const audio = new (window as any).Audio(objectUrl) as HTMLAudioElement;
        audio.onended = () => URL.revokeObjectURL(objectUrl);
        audio.play();
      } else {
        const { Audio } = await import("expo-av") as any;
        const { sound } = await Audio.Sound.createAsync({ uri: url.toString() }, { shouldPlay: true });
        sound.setOnPlaybackStatusUpdate((s: any) => { if (s.didJustFinish) sound.unloadAsync(); });
      }
    } catch {
      Speech.speak(greetItem.phrase, { language: course.lang, rate: 0.8 });
    }
    setGreetPhase("speak");
  };

  const handleGreetRecord = async () => {
    if (!greetItem || greetPhase === "processing") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (Platform.OS !== "web") {
      // Native: just grant pass after listen so course isn't blocked
      setGreetScore(85);
      setGreetPhase("pass");
      await updateStats({ xp: stats.xp + 5 });
      return;
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setGreetScore(85);
      setGreetPhase("pass");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
    if (!stream) return;
    audioChunksRef.current = [];
    const mimeType = (window as any).MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    const recorder = new (window as any).MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;
    setGreetPhase("recording");

    recorder.ondataavailable = (e: any) => {
      if (e.data?.size > 0) audioChunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      stream.getTracks().forEach((t: any) => t.stop());
      setGreetPhase("processing");
      const blob = new Blob(audioChunksRef.current, { type: mimeType });
      const base64: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(",")[1] ?? "");
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      try {
        const apiUrl = new URL("/api/pronunciation-assess", getApiUrl()).toString();
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ word: greetItem.phrase, lang: course.lang, audio: base64, mimeType }),
        });
        const data = res.ok ? await res.json() : { score: 60 };
        const scoreVal = data.score ?? 60;
        setGreetScore(scoreVal);
        if (scoreVal >= 80) {
          setGreetPhase("pass");
          await updateStats({ xp: stats.xp + 5 });
        } else {
          setGreetPhase("fail");
        }
      } catch {
        setGreetScore(60);
        setGreetPhase("fail");
      }
    };

    recorder.start();
    setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, 4000);
  };

  const handleGreetRetry = () => {
    setGreetPhase("listen");
    setGreetScore(null);
  };

  const charItem  = step === 0 ? (course.chars[subIdx]    ?? course.chars[0])    : null;
  const wordItem  = step === 1 ? (course.words[subIdx]    ?? course.words[0])    : null;
  const greetItem = step === 2 ? (course.greetings[subIdx] ?? course.greetings[0]) : null;
  const isLastOfStep = subIdx >= currentItems.length - 1;

  const canNext = step === 3
    ? true
    : step === 0
      ? (isReviewMode && reviewSection === "listen" ? audioPlayed : traced)
    : step === 1 ? flipped
    : (isReviewMode ? (greetPhase === "pass" || greetPhase === "fail") : greetPhase === "pass");

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ["0deg", "180deg"] });
  const backRotate  = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ["180deg", "360deg"] });

  const listenLabel  = native === "korean" ? "듣기" : native === "spanish" ? "Escuchar" : "Listen";
  const traceLabel   = native === "korean" ? "✍️ 따라 써보기" : native === "spanish" ? "✍️ Trazar" : "✍️ Trace it";
  const nextLabel    = step === 3
    ? (native === "korean" ? "시작하기 🚀" : native === "spanish" ? "¡Empezar! 🚀" : "Start Learning 🚀")
    : isLastOfStep && isReviewMode
      ? (native === "korean" ? "완료 ✓" : native === "spanish" ? "Listo ✓" : "Done ✓")
    : isLastOfStep
      ? (native === "korean" ? "다음 단계 →" : native === "spanish" ? "Siguiente paso →" : "Next Step →")
      : (native === "korean" ? "다음 →"      : native === "spanish" ? "Siguiente →"      : "Next →");

  /* ── bottom nav bar ── */
  const NavBar = () => (
    <View style={[s.navArea, { paddingBottom: bottomPad + 8 }]}>

      {/* ── Step 0: canvas self-check buttons replace Next ── */}
      {step === 0 && (
        <>
          {/* Counter sits above buttons, never overlapping */}
          <Text style={s.counter}>{subIdx + 1} / {course.chars.length}</Text>

          <View style={s.navRow}>
            {/* 🔄 Try again — always visible, clears canvas */}
            <Pressable
              style={({ pressed }) => [s.retryBtn, { flex: 1 }, pressed && { opacity: 0.7 }]}
              onPress={handleRetry}
            >
              <Text style={s.retryBtnTxt}>
                {native === "korean" ? "🔄  다시 해볼게요" : native === "spanish" ? "🔄  Otra vez" : "🔄  Try again"}
              </Text>
            </Pressable>

            {/* ✅ Looks good! — always visible, disabled until drawn */}
            <Pressable
              style={({ pressed }) => [s.nextBtn, !traced && s.nextBtnOff, pressed && traced && { opacity: 0.85 }]}
              onPress={traced ? goNext : undefined}
              disabled={!traced}
            >
              <Text style={s.nextBtnTxt}>
                {native === "korean" ? "✅  잘했어요!" : native === "spanish" ? "✅  ¡Bien hecho!" : "✅  Looks good!"}
              </Text>
            </Pressable>
          </View>

          {/* Skip writing step */}
          <Pressable onPress={goNext} hitSlop={8} style={s.inlineSkipWrap}>
            <Text style={s.inlineSkip}>
              {native === "korean" ? "건너뛰기 ›" : native === "spanish" ? "Omitir ›" : "Skip ›"}
            </Text>
          </Pressable>
        </>
      )}

      {/* ── Steps 1–3: normal Next button ── */}
      {step > 0 && (
        <>
          {!canNext && step < 3 && (
            <Text style={s.nudge}>
              {step === 1
                ? (native === "korean" ? "카드를 탭해서 의미를 확인하세요 👆" : native === "spanish" ? "Toca la tarjeta para ver el significado 👆" : "Tap the card to see the meaning 👆")
                : (native === "korean" ? "발음 듣기를 먼저 눌러보세요 👆" : native === "spanish" ? "Toca el botón de escuchar arriba 👆" : "Tap the listen button above 👆")}
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

          {/* Skip current item */}
          {step < 3 && (
            <Pressable onPress={goNext} hitSlop={8} style={s.inlineSkipWrap}>
              <Text style={s.inlineSkip}>
                {native === "korean" ? "건너뛰기 ›" : native === "spanish" ? "Omitir ›" : "Skip ›"}
              </Text>
            </Pressable>
          )}
        </>
      )}

    </View>
  );

  /* ── INTRO SCREEN ── */
  const introText: Record<string, string[]> = {
    korean: [
      "🦊 루디 교수의 기초 과정에 오신 걸 환영해요!",
      "기초 과정은 알파벳부터 시작됩니다.",
      "글자를 배우고, 듣고, 직접 써보세요!",
      "기초 과정을 완료하면 모든 기능이 잠금 해제됩니다.",
    ],
    english: [
      "🦊 Welcome to Rudy's Basic Course!",
      "The basic course starts with the alphabet.",
      "Learn each letter, listen to pronunciation, and trace it yourself!",
      "Complete the basic course to unlock all features.",
    ],
    spanish: [
      "🦊 ¡Bienvenido al Curso Básico de Rudy!",
      "El curso básico comienza con el alfabeto.",
      "¡Aprende cada letra, escucha la pronunciación y trázala tú mismo!",
      "Completa el curso básico para desbloquear todas las funciones.",
    ],
  };
  const introLines = introText[native] ?? introText.english;
  const startLabel = native === "korean" ? "기초 과정 시작하기" : native === "spanish" ? "Comenzar el curso" : "Start Basic Course";
  const skipLabel  = native === "korean" ? "건너뛰기" : native === "spanish" ? "Omitir" : "Skip";
  const skipNote   = native === "korean"
    ? "(이미 알파벳을 알고 있다면 건너뛰어도 됩니다)"
    : native === "spanish"
      ? "(Puedes omitirlo si ya conoces el alfabeto)"
      : "(You can skip if you already know the alphabet)";
  const courseTitle = native === "korean" ? "기초 과정" : native === "spanish" ? "Curso Básico" : "Basic Course";

  /* ── REVIEW MENU SCREEN ── */
  if (showReviewMenu) {
    const charCount = course.chars.length;
    const reviewCards: { section: ReviewSection; icon: string; title: string; desc: string; sub: string }[] = [
      {
        section: "write",
        icon: "✏️",
        title: native === "korean" ? "알파벳 쓰기" : native === "spanish" ? "Escritura" : "Writing",
        desc:  native === "korean" ? "글자를 보고 직접 써보기" : native === "spanish" ? "Trazar las letras" : "Trace the letters",
        sub:   `${charCount}${native === "korean" ? "개" : native === "spanish" ? " letras" : " letters"}`,
      },
      {
        section: "listen",
        icon: "👂",
        title: native === "korean" ? "듣기 연습" : native === "spanish" ? "Escucha" : "Listening",
        desc:  native === "korean" ? "발음을 듣고 글자 확인하기" : native === "spanish" ? "Escucha y revisa" : "Listen to pronunciation",
        sub:   `${charCount}${native === "korean" ? "개" : native === "spanish" ? " letras" : " letters"}`,
      },
      {
        section: "speak",
        icon: "🎤",
        title: native === "korean" ? "발음 연습" : native === "spanish" ? "Pronunciación" : "Speaking",
        desc:  native === "korean" ? "글자를 보고 따라 말하기" : native === "spanish" ? "Repite en voz alta" : "Say the phrase aloud",
        sub:   `${course.greetings.length}${native === "korean" ? "개" : native === "spanish" ? " frases" : " phrases"}`,
      },
      {
        section: "full",
        icon: "🔄",
        title: native === "korean" ? "전체 복습" : native === "spanish" ? "Repaso completo" : "Full Review",
        desc:  native === "korean" ? "듣기 + 발음 + 쓰기 전체" : native === "spanish" ? "Escucha + pronunciación + escritura" : "Listening + speaking + writing",
        sub:   native === "korean" ? "전체" : native === "spanish" ? "Todo" : "All",
      },
    ];
    return (
      <View style={[s.screen, { paddingTop: topPad, paddingBottom: bottomPad + 8 }]}>
        {/* Header */}
        <View style={rv.header}>
          <Pressable style={({ pressed }) => [rv.backBtn, pressed && { opacity: 0.7 }]} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={C.gold} />
          </Pressable>
          <Text style={rv.headerTitle}>
            {native === "korean" ? "기초 과정 복습" : native === "spanish" ? "Repaso del curso" : "Course Review"}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={rv.subtitle}>
          {native === "korean" ? "복습할 섹션을 선택하세요" : native === "spanish" ? "Elige una sección para repasar" : "Choose a section to review"}
        </Text>

        <ScrollView contentContainerStyle={rv.list} showsVerticalScrollIndicator={false}>
          {reviewCards.map(card => (
            <Pressable
              key={card.section}
              style={({ pressed }) => [rv.card, pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] }]}
              onPress={() => startReviewSection(card.section)}
            >
              <View style={rv.cardLeft}>
                <Text style={rv.cardIcon}>{card.icon}</Text>
                <View style={rv.cardText}>
                  <Text style={rv.cardTitle}>{card.title}</Text>
                  <Text style={rv.cardDesc}>{card.desc}</Text>
                </View>
              </View>
              <View style={rv.cardRight}>
                <Text style={rv.cardSub}>{card.sub}</Text>
                <Text style={rv.cardTs}>
                  {native === "korean" ? "마지막: " : native === "spanish" ? "Último: " : "Last: "}
                  {daysAgoLabel(reviewTs[card.section], native)}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={C.goldDark} style={{ marginTop: 2 }} />
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (showIntro) {
    return (
      <View style={[intro.screen, { paddingTop: topPad, paddingBottom: bottomPad + 8 }]}>
        {/* Fox image */}
        <Image source={require("../assets/lingo.png")} style={intro.fox} resizeMode="contain" />

        {/* Title */}
        <Text style={intro.title}>{courseTitle}</Text>

        {/* Description lines */}
        <View style={intro.textBox}>
          {introLines.map((line, i) => (
            <Text key={i} style={intro.line}>{line}</Text>
          ))}
        </View>

        {/* ✅ Start button */}
        <Pressable
          style={({ pressed }) => [intro.startBtn, pressed && { opacity: 0.85 }]}
          onPress={() => setShowIntro(false)}
        >
          <Text style={intro.startBtnTxt}>✅  {startLabel}</Text>
        </Pressable>

        {/* ⏭️ Skip button */}
        <Pressable
          style={({ pressed }) => [intro.skipBtn, pressed && { opacity: 0.75 }]}
          onPress={handleSkip}
        >
          <Text style={intro.skipBtnTxt}>⏭️  {skipLabel}</Text>
        </Pressable>

        <Text style={intro.skipNote}>{skipNote}</Text>
      </View>
    );
  }

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>

      {/* ── TOP BAR ── */}
      <View style={s.topBar}>
        {isReviewMode ? (
          <Pressable style={({ pressed }) => [s.reviewBackBtn, pressed && { opacity: 0.7 }]} onPress={() => setShowReviewMenu(true)}>
            <Ionicons name="arrow-back" size={18} color={C.goldDark} />
          </Pressable>
        ) : (
          <Text style={s.stepLabel}>{course.stepNames[step]}</Text>
        )}
        <View style={s.lingoStrip}>
          <Text style={s.lingoStripFox}>🦊</Text>
          <Text style={s.lingoStripText}>{course.lingoTips[step]}</Text>
        </View>
        {isReviewMode ? (
          <Pressable style={({ pressed }) => [s.skipPill, pressed && { opacity: 0.7 }]} onPress={goNext}>
            <Text style={s.skipPillTxt}>
              {native === "korean" ? "건너뛰기 ›" : native === "spanish" ? "Omitir ›" : "Skip ›"}
            </Text>
          </Pressable>
        ) : (
          <View style={s.topRightRow}>
            <Text style={s.stepNum}>{step + 1}/{totalSteps}</Text>
            {step < 3 && (
              <Pressable onPress={goNext} hitSlop={10}>
                <Text style={s.topSkipTxt}>
                  {native === "korean" ? "건너뛰기 ›" : native === "spanish" ? "Omitir ›" : "Skip ›"}
                </Text>
              </Pressable>
            )}
          </View>
        )}
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
              <Text style={s.charTip}>{getCharTip(charItem.char, lang, native)}</Text>
            </View>
          </View>

          {/* Listen button + skip listen */}
          <Pressable
            style={({ pressed }) => [s.listenBtn, pressed && { opacity: 0.75 }]}
            onPress={() => playAudio(charItem.char)}
          >
            <Ionicons name="volume-medium-outline" size={18} color={C.bg1} />
            <Text style={s.listenBtnTxt}>{listenLabel}</Text>
          </Pressable>
          <Pressable onPress={goNext} hitSlop={8} style={s.inlineSkipWrap}>
            <Text style={s.inlineSkip}>
              {native === "korean" ? "건너뛰기 ›" : native === "spanish" ? "Omitir ›" : "Skip ›"}
            </Text>
          </Pressable>

          {/* Divider + label */}
          <View style={s.traceLabelRow}>
            <View style={s.traceLine} />
            <Text style={s.traceLabel}>{traceLabel}</Text>
            <View style={s.traceLine} />
          </View>

          {/* ── CANVAS fills remaining space ── */}
          <TracingCanvas key={canvasKey} char={charItem.char} onDrawn={() => setTraced(true)} />
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
                    <Text style={s.wordHint}>{native === "korean" ? "탭해서 의미 확인" : native === "spanish" ? "Toca para ver" : "Tap to reveal"}</Text>
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
            {step === 2 && greetItem && (() => {
              const usageKey = native === "korean" ? "ko" : native === "spanish" ? "es" : "en";
              const usageText = greetItem.usage[usageKey as "ko" | "en" | "es"];
              return (
                <>
                  <View style={s.greetCard}>
                    <Text style={s.greetPhrase}>{greetItem.phrase}</Text>
                    <Text style={s.greetMeaning}>{greetItem.meaning}</Text>
                    <Text style={s.greetUsage}>{usageText}</Text>
                  </View>

                  {/* Phase: listen */}
                  {greetPhase === "listen" && (
                    <>
                      <Pressable style={({ pressed }) => [s.listenBtn, s.listenBtnLg, pressed && { opacity: 0.75 }]} onPress={handleGreetListen}>
                        <Ionicons name="volume-high-outline" size={22} color={C.bg1} />
                        <Text style={s.listenBtnTxt}>
                          {native === "korean" ? "🔊  듣기" : native === "spanish" ? "🔊  Escuchar" : "🔊  Listen"}
                        </Text>
                      </Pressable>
                      <Pressable onPress={goNext} hitSlop={8} style={s.inlineSkipWrap}>
                        <Text style={s.inlineSkip}>
                          {native === "korean" ? "건너뛰기 ›" : native === "spanish" ? "Omitir ›" : "Skip ›"}
                        </Text>
                      </Pressable>
                    </>
                  )}

                  {/* Phase: speak */}
                  {greetPhase === "speak" && (
                    <View style={{ gap: 10, width: "100%", alignItems: "center" }}>
                      <Text style={{ fontFamily: F.body, color: C.goldDim, fontSize: 13, textAlign: "center" }}>
                        {native === "korean" ? "이제 따라 말해보세요!" : native === "spanish" ? "¡Ahora repite en voz alta!" : "Now say it aloud!"}
                      </Text>
                      <Pressable style={({ pressed }) => [s.micBtn, pressed && { opacity: 0.75 }]} onPress={handleGreetRecord}>
                        <Ionicons name="mic-outline" size={28} color={C.bg1} />
                        <Text style={s.listenBtnTxt}>
                          {native === "korean" ? "🎤  따라 말하기" : native === "spanish" ? "🎤  Repetir" : "🎤  Speak Now"}
                        </Text>
                      </Pressable>
                      <Pressable onPress={goNext} hitSlop={8} style={s.inlineSkipWrap}>
                        <Text style={s.inlineSkip}>
                          {native === "korean" ? "건너뛰기 ›" : native === "spanish" ? "Omitir ›" : "Skip ›"}
                        </Text>
                      </Pressable>
                    </View>
                  )}

                  {/* Phase: recording */}
                  {greetPhase === "recording" && (
                    <View style={s.recordingRow}>
                      <View style={s.recDot} />
                      <Text style={s.recordingTxt}>
                        {native === "korean" ? "녹음 중..." : native === "spanish" ? "Grabando..." : "Recording..."}
                      </Text>
                    </View>
                  )}

                  {/* Phase: processing */}
                  {greetPhase === "processing" && (
                    <Text style={s.processingTxt}>
                      {native === "korean" ? "⏳  평가 중..." : native === "spanish" ? "⏳  Evaluando..." : "⏳  Evaluating..."}
                    </Text>
                  )}

                  {/* Phase: pass */}
                  {greetPhase === "pass" && (
                    <View style={s.scorePass}>
                      <Text style={s.scorePassEmoji}>🎉</Text>
                      <Text style={s.scorePassTxt}>
                        {native === "korean" ? "잘했어요! +5 XP" : native === "spanish" ? "¡Muy bien! +5 XP" : "Great job! +5 XP"}
                      </Text>
                      {greetScore !== null && (
                        <Text style={s.scoreNum}>{Math.round(greetScore)}</Text>
                      )}
                    </View>
                  )}

                  {/* Phase: fail */}
                  {greetPhase === "fail" && (
                    <View style={s.scoreFail}>
                      {greetScore !== null && (
                        <Text style={s.scoreNum}>{Math.round(greetScore)}</Text>
                      )}
                      <Text style={s.scoreFailTxt}>
                        {native === "korean" ? "다시 해볼게요" : native === "spanish" ? "Inténtalo de nuevo" : "Try once more"}
                      </Text>
                      <View style={s.failBtns}>
                        <Pressable style={({ pressed }) => [s.retrySmBtn, pressed && { opacity: 0.75 }]} onPress={handleGreetRetry}>
                          <Text style={s.retrySmTxt}>
                            {native === "korean" ? "🔄  다시" : native === "spanish" ? "🔄  Otra vez" : "🔄  Retry"}
                          </Text>
                        </Pressable>
                        <Pressable style={({ pressed }) => [s.skipSmBtn, pressed && { opacity: 0.75 }]} onPress={goNext}>
                          <Text style={s.skipSmTxt}>
                            {native === "korean" ? "⏭️  건너뛰기" : native === "spanish" ? "⏭️  Saltar" : "⏭️  Skip"}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}

                  <Text style={s.counter}>{subIdx + 1} / {course.greetings.length}</Text>
                </>
              );
            })()}

            {/* ── STEP 3: COMPLETION ── */}
            {step === 3 && (
              <View style={s.completionCard}>
                <Text style={s.bigEmoji}>🎉</Text>
                <Text style={s.completionTitle}>
                  {native === "korean" ? "기초 과정 완료!" : native === "spanish" ? "¡Curso Básico Completado!" : "Basic Course Complete!"}
                </Text>
                <Text style={s.completionSub}>
                  {native === "korean" ? "이제 Enigma와 함께 본격적인 학습을 시작해봐요!" : native === "spanish" ? "¡Ahora comienza tu aventura con Enigma!" : "You're ready to start your full language journey!"}
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
  topRightRow: { flexDirection: "column", alignItems: "flex-end", gap: 2 },
  topSkipTxt: { fontSize: 11, fontFamily: F.label, color: C.gold, letterSpacing: 0.3 },
  inlineSkipWrap: { alignSelf: "center", paddingVertical: 4 },
  inlineSkip: { fontSize: 12, fontFamily: F.label, color: C.gold, letterSpacing: 0.3 },

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
    height: 48, borderRadius: 20,
    borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.bg2, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 12,
  },
  retryBtnTxt: { fontSize: 15, fontFamily: F.header, color: C.goldDim, letterSpacing: 0.3, textAlign: "center" },

  micBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: "#c0392b", borderRadius: 20,
    paddingHorizontal: 26, paddingVertical: 13,
    shadowColor: "#c0392b", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
  recordingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  recDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#e74c3c" },
  recordingTxt: { fontSize: 15, fontFamily: F.bodySemi, color: "#e74c3c" },
  processingTxt: { fontSize: 15, fontFamily: F.body, color: C.goldDim, textAlign: "center" },

  scorePass: { alignItems: "center", gap: 6, padding: 16, borderRadius: 20, backgroundColor: "rgba(39,174,96,0.12)", borderWidth: 1.5, borderColor: "rgba(39,174,96,0.35)", width: CARD_W },
  scorePassEmoji: { fontSize: 32 },
  scorePassTxt: { fontSize: 16, fontFamily: F.header, color: "#27ae60", textAlign: "center" },
  scoreNum: { fontSize: 40, fontFamily: F.title, color: C.gold, letterSpacing: 2 },
  scoreFail: { alignItems: "center", gap: 8, padding: 16, borderRadius: 20, backgroundColor: "rgba(231,76,60,0.1)", borderWidth: 1.5, borderColor: "rgba(231,76,60,0.3)", width: CARD_W },
  scoreFailTxt: { fontSize: 15, fontFamily: F.body, color: "#e74c3c", textAlign: "center" },
  failBtns: { flexDirection: "row", gap: 12, marginTop: 4 },
  retrySmBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 16, alignItems: "center", justifyContent: "center",
    backgroundColor: C.bg2, borderWidth: 1.5, borderColor: C.border,
  },
  retrySmTxt: { fontSize: 14, fontFamily: F.bodySemi, color: C.goldDim },
  skipSmBtn: {
    flex: 1, paddingVertical: 11, borderRadius: 16, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(201,162,39,0.12)", borderWidth: 1.5, borderColor: C.border,
  },
  skipSmTxt: { fontSize: 14, fontFamily: F.bodySemi, color: C.gold },

  reviewBackBtn: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(201,162,39,0.10)",
  },
  skipPill: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
    backgroundColor: "rgba(201,162,39,0.10)",
  },
  skipPillTxt: { fontSize: 12, fontFamily: F.bodySemi, color: C.goldDark },
});

/* ── Intro screen styles ── */
const intro = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 20,
  },
  fox: {
    width: 160,
    height: 160,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: F.title,
    color: C.gold,
    letterSpacing: 2,
    textAlign: "center",
  },
  textBox: {
    width: "100%",
    backgroundColor: C.bg2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    gap: 10,
  },
  line: {
    fontSize: 14,
    fontFamily: F.body,
    color: C.parchment,
    lineHeight: 22,
    textAlign: "center",
  },
  startBtn: {
    width: "100%",
    backgroundColor: C.gold,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtnTxt: {
    fontSize: 16,
    fontFamily: F.header,
    color: C.bg1,
    letterSpacing: 0.5,
  },
  skipBtn: {
    width: "100%",
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: "transparent",
  },
  skipBtnTxt: {
    fontSize: 15,
    fontFamily: F.header,
    color: C.goldDim,
    letterSpacing: 0.3,
  },
  skipNote: {
    fontSize: 12,
    fontFamily: F.body,
    color: "rgba(201,162,39,0.5)",
    textAlign: "center",
    lineHeight: 18,
  },
});

/* ── Review menu styles ── */
const rv = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(201,162,39,0.10)",
  },
  headerTitle: { fontSize: 18, fontFamily: F.header, color: C.gold, letterSpacing: 0.5 },
  subtitle: {
    fontSize: 13, fontFamily: F.body, color: C.goldDim, fontStyle: "italic",
    textAlign: "center", paddingVertical: 14,
  },
  list: { paddingHorizontal: 16, gap: 12, paddingBottom: 24 },
  card: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: C.bg2, borderRadius: 18,
    paddingHorizontal: 18, paddingVertical: 16,
    borderWidth: 1.5, borderColor: C.border,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 10, elevation: 4,
  },
  cardLeft:  { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  cardIcon:  { fontSize: 28 },
  cardText:  { gap: 3, flex: 1 },
  cardTitle: { fontSize: 15, fontFamily: F.header, color: C.gold },
  cardDesc:  { fontSize: 12, fontFamily: F.body, color: C.parchment, opacity: 0.8 },
  cardRight: { alignItems: "flex-end", gap: 2 },
  cardSub:   { fontSize: 12, fontFamily: F.bodySemi, color: C.goldDim },
  cardTs:    { fontSize: 11, fontFamily: F.body, color: "rgba(201,162,39,0.5)" },
});
