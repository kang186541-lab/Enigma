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
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage, getEffectiveLearningLanguage, type NativeLanguage } from "@/context/LanguageContext";
import { getApiUrl } from "@/lib/query-client";
import { apiFetchWithAuth, getAuthHeaderRecord } from "@/lib/apiFetchWithAuth";
import { recordAudio } from "@/lib/audio";
import { buildSpeakingPromptKey, recordSpokenSentence } from "@/lib/speakingProgress";
import {
  loadBasicCourseState,
  markBasicCourseCompleted,
  markBasicCourseReview,
  saveBasicCourseProgress,
  type BasicCourseReviewSection,
} from "@/lib/learnerProfile";
import { C, F } from "@/constants/theme";
import { EmojiText } from "@/components/EmojiText";

const { width: SW } = Dimensions.get("window");
const CARD_W = Math.min(SW - 48, 360);

const PROGRESS_KEY = (lang: string) => `basicCourseProgress_${lang}`;
const DONE_KEY     = (lang: string) => `basicCourseCompleted_${lang}`;
const BASIC_COURSE_RECORDING_MS = 8000;
const MIN_SPOKEN_AUDIO_BASE64_LEN = 2000;

let _bcNativeSound: Audio.Sound | null = null;

// Trilingual meaning so the explanation renders in the learner's NATIVE
// language regardless of which course (ko/en/es) they are taking. Previously
// `meaning` was a single string baked to one language per course, so a
// Spanish-native learner taking the Korean course saw English explanations.
type TriText = { ko: string; en: string; es: string; id: string };

interface CharItem    { char: string; roman: string; tip: string; }
interface WordItem    { word: string; meaning: TriText; emoji: string; }
interface GreetingItem { phrase: string; meaning: TriText; usage: TriText; }

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
      { word: "안녕",    meaning: { ko: "친한 사이의 인사",   en: "Hello (informal)",  es: "Hola (informal)",        id: "Halo (santai)" },        emoji: "👋" },
      { word: "감사해요", meaning: { ko: "고마움 표현",         en: "Thank you",          es: "Gracias",                id: "Terima kasih" },         emoji: "🙏" },
      { word: "네",      meaning: { ko: "긍정 답변",           en: "Yes",                es: "Sí",                     id: "Ya" },                   emoji: "✅" },
      { word: "아니요",  meaning: { ko: "부정 답변",           en: "No",                 es: "No",                     id: "Tidak" },                emoji: "❌" },
      { word: "물",      meaning: { ko: "물",                  en: "Water",              es: "Agua",                   id: "Air" },                  emoji: "💧" },
      { word: "밥",      meaning: { ko: "밥 / 식사",           en: "Rice / Meal",        es: "Arroz / Comida",         id: "Nasi / Makanan" },       emoji: "🍚" },
      { word: "사람",    meaning: { ko: "사람",                en: "Person",             es: "Persona",                id: "Orang" },                emoji: "👤" },
      { word: "집",      meaning: { ko: "집 / 가정",           en: "House / Home",       es: "Casa / Hogar",           id: "Rumah" },                emoji: "🏠" },
      { word: "학교",    meaning: { ko: "학교",                en: "School",             es: "Escuela",                id: "Sekolah" },              emoji: "🏫" },
      { word: "사랑",    meaning: { ko: "사랑",                en: "Love",               es: "Amor",                   id: "Cinta" },                emoji: "❤️" },
    ],
    greetings: [
      { phrase: "안녕하세요", meaning: { ko: "정중한 인사",       en: "Hello (formal)",     es: "Hola (formal)",      id: "Halo (formal)" },      usage: { ko: "처음 만날 때 사용해요",         en: "Used when greeting someone formally", es: "Al saludar a alguien formalmente", id: "Dipakai saat menyapa seseorang secara formal" } },
      { phrase: "감사합니다", meaning: { ko: "정중한 감사 표현",   en: "Thank you (formal)", es: "Gracias (formal)",   id: "Terima kasih (formal)" }, usage: { ko: "공식적인 자리에서 감사할 때",   en: "To show formal gratitude",            es: "Para mostrar gratitud formalmente", id: "Untuk menyampaikan terima kasih secara formal" } },
      { phrase: "죄송합니다", meaning: { ko: "정중한 사과",       en: "I'm sorry (formal)", es: "Lo siento (formal)", id: "Maaf (formal)" },      usage: { ko: "공식적으로 사과할 때",           en: "To apologise formally",               es: "Para disculparse formalmente", id: "Untuk meminta maaf secara formal" } },
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
      { word: "Hello",     meaning: { ko: "안녕하세요",  en: "A greeting",       es: "Hola",     id: "Sapaan" },             emoji: "👋" },
      { word: "Thank you", meaning: { ko: "감사합니다",  en: "Expression of thanks", es: "Gracias", id: "Ungkapan terima kasih" }, emoji: "🙏" },
      { word: "Yes",       meaning: { ko: "네",          en: "Affirmative",      es: "Sí",       id: "Ya" },                 emoji: "✅" },
      { word: "No",        meaning: { ko: "아니요",      en: "Negative",         es: "No",       id: "Tidak" },              emoji: "❌" },
      { word: "Water",     meaning: { ko: "물",          en: "Water",            es: "Agua",     id: "Air" },                emoji: "💧" },
      { word: "Food",      meaning: { ko: "음식",        en: "Food",             es: "Comida",   id: "Makanan" },            emoji: "🍽️" },
      { word: "House",     meaning: { ko: "집",          en: "House",            es: "Casa",     id: "Rumah" },              emoji: "🏠" },
      { word: "School",    meaning: { ko: "학교",        en: "School",           es: "Escuela",  id: "Sekolah" },            emoji: "🏫" },
      { word: "Love",      meaning: { ko: "사랑",        en: "Love",             es: "Amor",     id: "Cinta" },              emoji: "❤️" },
      { word: "Friend",    meaning: { ko: "친구",        en: "Friend",           es: "Amigo",    id: "Teman" },              emoji: "🤝" },
    ],
    greetings: [
      { phrase: "Hello!",      meaning: { ko: "안녕하세요!",  en: "A greeting",          es: "¡Hola!",       id: "Sapaan" },              usage: { ko: "누군가를 만났을 때",        en: "When meeting someone",          es: "Al saludar a alguien",      id: "Saat bertemu seseorang" } },
      { phrase: "Thank you!",  meaning: { ko: "감사합니다!",  en: "Expression of thanks", es: "¡Gracias!",   id: "Ungkapan terima kasih" }, usage: { ko: "감사를 표현할 때",           en: "To show gratitude",             es: "Para mostrar gratitud",     id: "Untuk menyampaikan terima kasih" } },
      { phrase: "I'm sorry.",  meaning: { ko: "죄송합니다.",  en: "Apology",             es: "Lo siento.",   id: "Permintaan maaf" },     usage: { ko: "사과할 때",                  en: "When apologising",              es: "Para disculparse",          id: "Saat meminta maaf" } },
      { phrase: "Excuse me.",  meaning: { ko: "실례합니다.",  en: "Polite attention",    es: "Perdón.",      id: "Meminta perhatian dengan sopan" }, usage: { ko: "정중히 주의를 끌 때",         en: "To get attention politely",     es: "Para llamar la atención",   id: "Untuk menarik perhatian dengan sopan" } },
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
      { word: "Hola",    meaning: { ko: "안녕",     en: "Hello",     es: "Saludo",                id: "Halo" },               emoji: "👋" },
      { word: "Gracias", meaning: { ko: "감사",     en: "Thank you", es: "Expresión de gracias",  id: "Terima kasih" },       emoji: "🙏" },
      { word: "Sí",      meaning: { ko: "네",       en: "Yes",       es: "Afirmativo",            id: "Ya" },                 emoji: "✅" },
      { word: "No",      meaning: { ko: "아니요",   en: "No",        es: "Negativo",              id: "Tidak" },              emoji: "❌" },
      { word: "Agua",    meaning: { ko: "물",       en: "Water",     es: "Agua",                  id: "Air" },                emoji: "💧" },
      { word: "Comida",  meaning: { ko: "음식",     en: "Food",      es: "Comida",                id: "Makanan" },            emoji: "🍽️" },
      { word: "Casa",    meaning: { ko: "집",       en: "House",     es: "Casa / Hogar",          id: "Rumah" },              emoji: "🏠" },
      { word: "Escuela", meaning: { ko: "학교",     en: "School",    es: "Escuela",               id: "Sekolah" },            emoji: "🏫" },
      { word: "Amor",    meaning: { ko: "사랑",     en: "Love",      es: "Amor",                  id: "Cinta" },              emoji: "❤️" },
      { word: "Amigo",   meaning: { ko: "친구",     en: "Friend",    es: "Amigo",                 id: "Teman" },              emoji: "🤝" },
    ],
    greetings: [
      { phrase: "¡Hola!",     meaning: { ko: "안녕하세요!",  en: "Hello!",       es: "Saludo informal",       id: "Halo!" },               usage: { ko: "누군가에게 인사할 때",     en: "When greeting someone",     es: "Al saludar a alguien",      id: "Saat menyapa seseorang" } },
      { phrase: "¡Gracias!",  meaning: { ko: "감사합니다!",  en: "Thank you!",   es: "Expresión de gracias",  id: "Terima kasih!" },       usage: { ko: "감사를 표현할 때",         en: "To show gratitude",         es: "Para mostrar gratitud",     id: "Untuk menyampaikan terima kasih" } },
      { phrase: "Lo siento.", meaning: { ko: "죄송합니다.",  en: "I'm sorry.",   es: "Disculpa formal",       id: "Maaf." },               usage: { ko: "사과할 때",                en: "When apologising",          es: "Para disculparse",          id: "Saat meminta maaf" } },
      { phrase: "Perdón.",    meaning: { ko: "실례합니다.",  en: "Excuse me.",   es: "Pedir paso o atención", id: "Permisi." },            usage: { ko: "정중히 주의를 끌 때",      en: "To get attention politely", es: "Para llamar la atención",   id: "Untuk menarik perhatian dengan sopan" } },
    ],
  },

  indonesian: {
    stepNames: ["Alfabet", "Kata Dasar", "Sapaan Dasar", "Selesai!"],
    lang: "id-ID",
    lingoTips: [
      "Dengarkan lalu tirukan hurufnya! 🦊",
      "Ketuk setiap kartu untuk melihat artinya! 🦊",
      "Dengarkan dan ucapkan dengan lantang! 🦊",
      "Kursus dasar selesai! 🦊🎉",
    ],
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c) => ({
      char: c,
      roman: c.toLowerCase(),
      tip: ({
        A:"'a' — seperti Apel 🍎",   B:"'be' — seperti Bola ⚽",  C:"'ce' — seperti Cinta ❤️",
        D:"'de' — seperti Daun 🍃",  E:"'e' — seperti Emas 🥇",  F:"'ef' — seperti Foto 📷",
        G:"'ge' — seperti Gajah 🐘", H:"'ha' — seperti Hujan 🌧️", I:"'i' — seperti Ikan 🐟",
        J:"'je' — seperti Jam ⏰",   K:"'ka' — seperti Kucing 🐱", L:"'el' — seperti Laut 🌊",
        M:"'em' — seperti Mata 👁️",  N:"'en' — seperti Nasi 🍚", O:"'o' — seperti Obat 💊",
        P:"'pe' — seperti Pohon 🌳", Q:"'ki' — seperti Quran 📖", R:"'er' — seperti Rumah 🏠",
        S:"'es' — seperti Sekolah 🏫", T:"'te' — seperti Teman 🤝", U:"'u' — seperti Udara 💨",
        V:"'ve' — seperti Vas 🏺",   W:"'we' — seperti Wajah 😊", X:"'eks' — seperti Sinar-X 🩻",
        Y:"'ye' — seperti Yoga 🧘",  Z:"'zet' — seperti Zebra 🦓",
      } as Record<string, string>)[c] ?? c,
    })),
    words: [
      { word: "Halo",         meaning: { ko: "안녕하세요",  en: "Hello",      es: "Hola",      id: "Sapaan" },        emoji: "👋" },
      { word: "Terima kasih", meaning: { ko: "감사합니다",  en: "Thank you",  es: "Gracias",   id: "Ungkapan terima kasih" }, emoji: "🙏" },
      { word: "Ya",           meaning: { ko: "네",          en: "Yes",        es: "Sí",        id: "Jawaban setuju" }, emoji: "✅" },
      { word: "Tidak",        meaning: { ko: "아니요",      en: "No",         es: "No",        id: "Jawaban menolak" }, emoji: "❌" },
      { word: "Air",          meaning: { ko: "물",          en: "Water",      es: "Agua",      id: "Air" },           emoji: "💧" },
      { word: "Makan",        meaning: { ko: "먹다",        en: "Eat",        es: "Comer",     id: "Makan" },         emoji: "🍽️" },
      { word: "Rumah",        meaning: { ko: "집",          en: "House",      es: "Casa",      id: "Rumah" },         emoji: "🏠" },
      { word: "Sekolah",      meaning: { ko: "학교",        en: "School",     es: "Escuela",   id: "Sekolah" },       emoji: "🏫" },
      { word: "Cinta",        meaning: { ko: "사랑",        en: "Love",       es: "Amor",      id: "Cinta" },         emoji: "❤️" },
      { word: "Teman",        meaning: { ko: "친구",        en: "Friend",     es: "Amigo",     id: "Teman" },         emoji: "🤝" },
    ],
    greetings: [
      { phrase: "Halo!",         meaning: { ko: "안녕하세요!",  en: "Hello!",      es: "¡Hola!",       id: "Sapaan" },              usage: { ko: "누군가에게 인사할 때",     en: "When greeting someone",     es: "Al saludar a alguien",      id: "Saat menyapa seseorang" } },
      { phrase: "Terima kasih!", meaning: { ko: "감사합니다!",  en: "Thank you!",  es: "¡Gracias!",    id: "Ungkapan terima kasih" }, usage: { ko: "감사를 표현할 때",         en: "To show gratitude",         es: "Para mostrar gratitud",     id: "Untuk menyampaikan terima kasih" } },
      { phrase: "Maaf.",         meaning: { ko: "죄송합니다.",  en: "I'm sorry.",  es: "Lo siento.",   id: "Permintaan maaf" },     usage: { ko: "사과할 때",                en: "When apologising",          es: "Para disculparse",          id: "Saat meminta maaf" } },
      { phrase: "Permisi.",      meaning: { ko: "실례합니다.",  en: "Excuse me.",  es: "Perdón.",      id: "Meminta perhatian dengan sopan" }, usage: { ko: "정중히 주의를 끌 때",      en: "To get attention politely", es: "Para llamar la atención",   id: "Untuk menarik perhatian dengan sopan" } },
    ],
  },

  // Egyptian colloquial (Cairene) learning target. Mirrors the `indonesian`
  // block's shape exactly — Arabic SCRIPT (with harakat) sits in the same fields
  // Latin scripts use, and a Cairene romanization rides alongside in `roman`/the
  // tips. Pronunciation tips reflect real Egyptian sounds (ج = hard "g",
  // ق = glottal stop, ث→s, ذ/ظ→z), NOT MSA. ko/en/es/id glosses are unchanged.
  arabic: {
    stepNames: ["الحُرُوف (al-ḥuruuf)", "كَلِمَات أَساسِيَّة (kalimaat)", "تَحِيَّات (taḥeyyaat)", "خَلَصْنا! (khalaṣna!)"],
    lang: "ar-EG",
    lingoTips: [
      "إِسمَع وبَعدِين اِكتِب الحَرف! 🦊 (esma3 we ektib el-7arf!)",
      "دُوس عَلى كُل كارت عَشان تِشُوف المَعنى! 🦊 (dous 3ala kol kart!)",
      "إِسمَع وقُول بصَوت عالي! 🦊 (esma3 we 'oul be-ṣout 3aali!)",
      "خَلَصت الدَّورة الأَساسِيَّة! 🦊🎉 (khalaṣt el-dawra!)",
    ],
    // 28 letters of the Arabic alphabet. `char` = the isolated letter form,
    // `roman` = Cairene sound value, `tip` = Egyptian letter name (with harakat)
    // + a sound cue and an example Egyptian word. Hard "g" for ج, hamza for ق.
    chars: [
      { char: "ا", roman: "a / ā",  tip: "أَلِف (alif) · صَوت 'aa' الطَّوِيل — زَيّ 'باب' (baab) 🚪" },
      { char: "ب", roman: "b",      tip: "باء (baa') · زَيّ 'b' — زَيّ 'بِيت' (beet) 🏠" },
      { char: "ت", roman: "t",      tip: "تاء (taa') · زَيّ 't' — زَيّ 'تُفّاحة' (tuffaa7a) 🍎" },
      { char: "ث", roman: "s / t",  tip: "ثاء (saa') · في مَصر بِننطُقها 's' — زَيّ 'تَلاتة' (talaata) 3️⃣" },
      { char: "ج", roman: "g",      tip: "جِيم (giim) · في مَصر 'g' جامْدة — زَيّ 'جامِل' (gamiil) 😍" },
      { char: "ح", roman: "ḥ",      tip: "حاء (7aa') · 'h' قَوِيّة مِن الزُّور — زَيّ 'حَبِيبي' (7abiibi) ❤️" },
      { char: "خ", roman: "kh",     tip: "خاء (khaa') · زَيّ 'ch' في الأَلماني — زَيّ 'خُبز' (khubz) 🍞" },
      { char: "د", roman: "d",      tip: "دال (daal) · زَيّ 'd' — زَيّ 'دُنيا' (donya) 🌍" },
      { char: "ذ", roman: "z / d",  tip: "ذال (zaal) · في مَصر بِننطُقها 'z' — زَيّ 'ده' (da) 👉" },
      { char: "ر", roman: "r",      tip: "راء (raa') · 'r' مِترَعِّشة — زَيّ 'رايِح' (raaye7) 🚶" },
      { char: "ز", roman: "z",      tip: "زاي (zaay) · زَيّ 'z' — زَيّ 'زَمان' (zamaan) ⏳" },
      { char: "س", roman: "s",      tip: "سِين (siin) · زَيّ 's' — زَيّ 'سَلام' (salaam) ✌️" },
      { char: "ش", roman: "sh",     tip: "شِين (shiin) · زَيّ 'sh' — زَيّ 'شُكراً' (shukran) 🙏" },
      { char: "ص", roman: "ṣ",      tip: "صاد (ṣaad) · 's' مُفَخَّمة — زَيّ 'صُبح' (ṣob7) 🌅" },
      { char: "ض", roman: "ḍ",      tip: "ضاد (ḍaad) · 'd' مُفَخَّمة — زَيّ 'ضَهري' (ḍahri) 🔙" },
      { char: "ط", roman: "ṭ",      tip: "طاء (ṭaa') · 't' مُفَخَّمة — زَيّ 'طَيِّب' (ṭayyeb) 👌" },
      { char: "ظ", roman: "z",      tip: "ظاء (ẓaa') · في مَصر بِننطُقها 'z' تِقِيلة — زَيّ 'ظَريف' (zariif) 😎" },
      { char: "ع", roman: "3 / ʿ",  tip: "عِين (3een) · صَوت مِن جُوّه الزُّور — زَيّ 'عَين' (3een) 👁️" },
      { char: "غ", roman: "gh",     tip: "غِين (gheen) · زَيّ غَرغَرة خَفِيفة — زَيّ 'غالي' (ghaali) 💎" },
      { char: "ف", roman: "f",      tip: "فاء (faa') · زَيّ 'f' — زَيّ 'فُلوس' (filoos) 💰" },
      { char: "ق", roman: "' / ʾ",  tip: "قاف (qaaf) · في مَصر بِنوقَّفها (hamza) — زَيّ 'قَلب' (alb) 💗" },
      { char: "ك", roman: "k",      tip: "كاف (kaaf) · زَيّ 'k' — زَيّ 'كِتاب' (kitaab) 📖" },
      { char: "ل", roman: "l",      tip: "لام (laam) · زَيّ 'l' — زَيّ 'لِيمُون' (laymoon) 🍋" },
      { char: "م", roman: "m",      tip: "مِيم (miim) · زَيّ 'm' — زَيّ 'مَيّة' (mayya) 💧" },
      { char: "ن", roman: "n",      tip: "نُون (noon) · زَيّ 'n' — زَيّ 'نَهار' (nahaar) ☀️" },
      { char: "ه", roman: "h",      tip: "هاء (haa') · زَيّ 'h' خَفِيفة — زَيّ 'هِنا' (hena) 📍" },
      { char: "و", roman: "w / ū",  tip: "واو (waaw) · 'w' أو 'uu' — زَيّ 'وَلَد' (walad) 👦" },
      { char: "ي", roman: "y / ī",  tip: "ياء (yaa') · 'y' أو 'ii' — زَيّ 'يَوم' (yoom) 📅" },
    ],
    words: [
      { word: "أَهلاً",       meaning: { ko: "안녕하세요",  en: "Hello",      es: "Hola",      id: "Sapaan" },        emoji: "👋" },
      { word: "شُكراً",       meaning: { ko: "감사합니다",  en: "Thank you",  es: "Gracias",   id: "Ungkapan terima kasih" }, emoji: "🙏" },
      { word: "أَيوة",        meaning: { ko: "네",          en: "Yes",        es: "Sí",        id: "Jawaban setuju" }, emoji: "✅" },
      { word: "لأ",           meaning: { ko: "아니요",      en: "No",         es: "No",        id: "Jawaban menolak" }, emoji: "❌" },
      { word: "مَيّة",        meaning: { ko: "물",          en: "Water",      es: "Agua",      id: "Air" },           emoji: "💧" },
      { word: "آكِل",         meaning: { ko: "먹다",        en: "Eat",        es: "Comer",     id: "Makan" },         emoji: "🍽️" },
      { word: "بِيت",         meaning: { ko: "집",          en: "House",      es: "Casa",      id: "Rumah" },         emoji: "🏠" },
      { word: "مَدرَسة",      meaning: { ko: "학교",        en: "School",     es: "Escuela",   id: "Sekolah" },       emoji: "🏫" },
      { word: "حُبّ",         meaning: { ko: "사랑",        en: "Love",       es: "Amor",      id: "Cinta" },         emoji: "❤️" },
      { word: "صاحِب",        meaning: { ko: "친구",        en: "Friend",     es: "Amigo",     id: "Teman" },         emoji: "🤝" },
    ],
    greetings: [
      { phrase: "إِزَّيَّك؟",          meaning: { ko: "안녕하세요! (잘 지내요?)",  en: "How are you?",      es: "¿Cómo estás?",       id: "Apa kabar?" },              usage: { ko: "누군가에게 인사할 때",     en: "When greeting someone",     es: "Al saludar a alguien",      id: "Saat menyapa seseorang" } },
      { phrase: "شُكراً جَزِيلاً",     meaning: { ko: "감사합니다!",  en: "Thank you very much!",  es: "¡Muchas gracias!",    id: "Terima kasih banyak!" },    usage: { ko: "감사를 표현할 때",         en: "To show gratitude",         es: "Para mostrar gratitud",     id: "Untuk menyampaikan terima kasih" } },
      { phrase: "آسِف",                meaning: { ko: "죄송합니다.",  en: "I'm sorry.",  es: "Lo siento.",   id: "Permintaan maaf" },     usage: { ko: "사과할 때",                en: "When apologising",          es: "Para disculparse",          id: "Saat meminta maaf" } },
      { phrase: "لَو سَمَحت",          meaning: { ko: "실례합니다.",  en: "Excuse me / Please.",  es: "Perdón / Por favor.",  id: "Permisi" },                 usage: { ko: "정중히 주의를 끌 때",      en: "To get attention politely", es: "Para llamar la atención",   id: "Untuk menarik perhatian dengan sopan" } },
    ],
  },
};


/** Azure voice mapping by language for the basic course */
const BC_VOICES: Record<string, string> = {
  "en-US": "en-GB-RyanNeural",
  "en-GB": "en-GB-RyanNeural",
  "es-ES": "es-ES-AlvaroNeural",
  "ko-KR": "ko-KR-InJoonNeural",
  "id-ID": "id-ID-ArdiNeural",
  "ar-EG": "ar-EG-ShakirNeural",
};

/** Stop and unload the module-level native sound */
async function stopBcSound() {
  if (_bcNativeSound) {
    const s = _bcNativeSound;
    _bcNativeSound = null;
    await s.stopAsync().catch((e) => console.warn('[BasicCourse] stop failed:', e));
    await s.unloadAsync().catch((e) => console.warn('[BasicCourse] unload failed:', e));
  }
}

/** Web audio element ref for cleanup */
let _bcWebAudio: HTMLAudioElement | null = null;

function stopBcWebAudio() {
  if (_bcWebAudio) {
    try { _bcWebAudio.pause(); _bcWebAudio.src = ""; } catch (e) { console.warn('[BasicCourse] Failed to stop web audio:', e); }
    _bcWebAudio = null;
  }
}

/** Stop all basic-course TTS (native + web) */
function stopBcTTS() {
  stopBcWebAudio();
  if (_bcNativeSound) {
    const s = _bcNativeSound;
    _bcNativeSound = null;
    s.stopAsync().catch((e) => console.warn('[BasicCourse] stop failed:', e));
    s.unloadAsync().catch((e) => console.warn('[BasicCourse] unload failed:', e));
  }
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

/* ─────────────────────────────────────────────
   Map single letter → phonetic name for pronunciation assessment.
   Azure can't match raw "A" when user says "ay", so we send the spoken name instead.
   ───────────────────────────────────────────── */
const EN_PHONETIC: Record<string, string> = {
  A:"ay", B:"bee", C:"see", D:"dee", E:"ee", F:"eff", G:"jee", H:"aitch",
  I:"eye", J:"jay", K:"kay", L:"ell", M:"em", N:"en", O:"oh", P:"pee",
  Q:"cue", R:"ar", S:"ess", T:"tee", U:"you", V:"vee", W:"double you",
  X:"ex", Y:"why", Z:"zee",
};

const ES_PHONETIC: Record<string, string> = {
  A:"a", B:"be", C:"ce", D:"de", E:"e", F:"efe", G:"ge", H:"hache",
  I:"i", J:"jota", K:"ka", L:"ele", M:"eme", N:"ene", "\u00D1":"e\u00F1e",
  O:"o", P:"pe", Q:"cu", R:"erre", S:"ese", T:"te", U:"u", V:"uve",
  W:"doble uve", X:"equis", Y:"ye", Z:"zeta",
};

/** Return the spoken name of a single letter for pronunciation assessment.
 *  e.g. "A" + "en-US" → "ay",  "ㄱ" + "ko-KR" → "기역",  "B" + "es-ES" → "be"
 *  For multi-char words, returns the word unchanged. */
function getPhoneticName(word: string, courseLang: string): string {
  if (word.length !== 1) return word;
  if (courseLang.startsWith("en")) return EN_PHONETIC[word.toUpperCase()] ?? word;
  if (courseLang.startsWith("ko")) return KO_LET[word]?.name ?? word;
  if (courseLang.startsWith("es")) return ES_PHONETIC[word.toUpperCase()] ?? ES_PHONETIC[word] ?? word;
  return word;
}

function getBasicCourseTtsText(text: string, courseLang: string): string {
  // Regression guard for the known "A sounds like I" bug: English letters
  // must reach Azure as their spoken name ("ay"), not the raw glyph ("A").
  return text.length === 1 ? getPhoneticName(text, courseLang) : text;
}

function buildBasicCourseTtsUrl(text: string, courseLang: string, voice?: string): URL | null {
  try {
    const url = new URL("/api/pronunciation-tts", getApiUrl());
    url.searchParams.set("text", getBasicCourseTtsText(text, courseLang));
    url.searchParams.set("lang", courseLang);
    if (voice) url.searchParams.set("voice", voice);
    // Azure ar-EG returns EMPTY audio for a plain isolated Arabic glyph (e.g. "ا"),
    // but say-as interpret-as="characters" (mode=letter) makes it voice the letter
    // NAME (verified live: 0 bytes plain → 15.5 KB with mode=letter). en/ko/es send a
    // multi-char phonetic name (getBasicCourseTtsText), so for a single-glyph Arabic
    // letter the raw glyph reaches Azure — route those through mode=letter.
    if (text.length === 1 && courseLang.toLowerCase().startsWith("ar")) {
      url.searchParams.set("mode", "letter");
    }
    return url;
  } catch (e) {
    console.warn('[BasicCourse] Failed to construct TTS URL:', e);
    return null;
  }
}

function isValidSpokenAudio(base64: string): boolean {
  return base64.length >= MIN_SPOKEN_AUDIO_BASE64_LEN;
}

function isAcceptedPronunciationResult(data: Record<string, any> | null): data is { score: number } {
  return data?.success === true && typeof data.score === "number";
}

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

  // Track the canvas's absolute screen position so we can convert
  // pageX/pageY touch coordinates into canvas-local coordinates.
  const canvasRef    = useRef<View>(null);
  const canvasOffset = useRef({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder:        () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder:         () => true,
      onMoveShouldSetPanResponderCapture:  () => true,
      onPanResponderTerminationRequest:    () => false,
      onPanResponderGrant: (e) => {
        const x = e.nativeEvent.pageX - canvasOffset.current.x;
        const y = e.nativeEvent.pageY - canvasOffset.current.y;
        setDots(prev => [...prev.slice(-150), { x, y }]);
      },
      onPanResponderMove: (e) => {
        const x = e.nativeEvent.pageX - canvasOffset.current.x;
        const y = e.nativeEvent.pageY - canvasOffset.current.y;
        setDots(prev => [...prev.slice(-150), { x, y }]);
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
    <View
      ref={canvasRef}
      style={[tc.grid, webExtra]}
      onLayout={() => {
        canvasRef.current?.measure((_fx, _fy, _w, _h, px, py) => {
          canvasOffset.current = { x: px, y: py };
        });
      }}
      {...panResponder.panHandlers}
    >
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
    minHeight: 200,
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
type ReviewSection = BasicCourseReviewSection;
const REVIEW_TS_KEY = (section: ReviewSection, lang: string) => `basicReviewTs_${section}_${lang}`;
const REVIEW_SECTIONS = new Set<ReviewSection>(["write", "listen", "speak", "full"]);

function parseReviewSection(value: unknown): ReviewSection | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" && REVIEW_SECTIONS.has(raw as ReviewSection)
    ? raw as ReviewSection
    : null;
}

function daysAgoLabel(ts: number | null, native: string): string {
  if (!ts) return native === "korean" ? "미복습" : native === "spanish" ? "Sin repasar" : native === "indonesian" ? "Belum diulang" : "Not reviewed";
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days === 0) return native === "korean" ? "오늘" : native === "spanish" ? "Hoy" : native === "indonesian" ? "Hari ini" : "Today";
  if (days === 1) return native === "korean" ? "1일 전" : native === "spanish" ? "Ayer" : native === "indonesian" ? "Kemarin" : "Yesterday";
  return native === "korean" ? `${days}일 전` : native === "spanish" ? `Hace ${days} días` : native === "indonesian" ? `${days} hari lalu` : `${days} days ago`;
}

export default function BasicCourseScreen() {
  const insets = useSafeAreaInsets();
  const { learningLanguage, nativeLanguage, awardXp } = useLanguage();
  const { review, section } = useLocalSearchParams<{ review?: string; section?: string }>();
  const isReviewMode = review === "1";
  const initialReviewSection = isReviewMode ? parseReviewSection(section) : null;

  const native = (nativeLanguage ?? "english") as NativeLanguage;
  const lang   = getEffectiveLearningLanguage(native, learningLanguage) as string;
  const course = COURSES[lang] ?? COURSES.english;

  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [showReviewMenu, setShowReviewMenu] = useState(isReviewMode && !initialReviewSection);
  const [reviewSection,  setReviewSection]  = useState<ReviewSection | null>(initialReviewSection);
  const [reviewTs,       setReviewTs]       = useState<Record<ReviewSection, number | null>>({
    write: null, listen: null, speak: null, full: null,
  });

  const [showIntro,        setShowIntro]        = useState(!isReviewMode);
  const [showSkipConfirm,  setShowSkipConfirm]  = useState(false);
  const [step,        setStep]        = useState(initialReviewSection === "speak" ? 2 : 0);
  const [subIdx,      setSubIdx]      = useState(0);
  const [flipped,     setFlipped]     = useState(false);
  const [traced,      setTraced]      = useState(false);  // step 0: user has drawn enough
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0); // increment to reset canvas

  // Greetings step pronunciation flow
  type GreetPhase = "listen" | "speak" | "recording" | "processing" | "done";
  const [greetPhase, setGreetPhase]   = useState<GreetPhase>("listen");
  const [greetScore, setGreetScore]   = useState<number | null>(null);
  const greetAttemptAwardedRef        = useRef(false);
  const courseCompletingRef           = useRef(false);

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
    Promise.all([
      loadBasicCourseState(lang),
      ...sections.map(s => AsyncStorage.getItem(REVIEW_TS_KEY(s, lang))),
    ]).then(([profileState, ...vals]) => {
      const profileTs = profileState?.reviewTimestamps ?? {};
      const nextReviewTs = {
        write:  profileTs.write  ?? (vals[0] ? Number(vals[0]) : null),
        listen: profileTs.listen ?? (vals[1] ? Number(vals[1]) : null),
        speak:  profileTs.speak  ?? (vals[2] ? Number(vals[2]) : null),
        full:   profileTs.full   ?? (vals[3] ? Number(vals[3]) : null),
      };
      setReviewTs(nextReviewTs);
      sections.forEach((section, index) => {
        const legacyValue = vals[index] ? Number(vals[index]) : null;
        if (typeof legacyValue === "number" && !profileTs[section]) {
          markBasicCourseReview(lang, section, legacyValue)
            .catch((e) => console.warn('[BasicCourse] Failed to migrate review timestamp:', e));
        }
      });
    }).catch((e) => console.warn('[BasicCourse] Failed to load review timestamps:', e));
  }, [isReviewMode, lang]);

  const markReviewCompleted = async (section: ReviewSection) => {
    const timestamp = Date.now();
    setReviewTs(prev => ({ ...prev, [section]: timestamp }));
    await AsyncStorage.setItem(REVIEW_TS_KEY(section, lang), String(timestamp));
    await markBasicCourseReview(lang, section, timestamp);
  };

  const startReviewSection = async (section: ReviewSection) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setReviewSection(section);
    setSubIdx(0);
    setFlipped(false); setTraced(false); setAudioPlayed(false);
    setGreetPhase("listen"); setGreetScore(null);
    greetAttemptAwardedRef.current = false;
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
    greetAttemptAwardedRef.current = false;
  }, [step, subIdx]);

  const handleRetry = () => {
    setTraced(false);
    setCanvasKey(k => k + 1);
  };

  const handleSkip = async () => {
    stopBcTTS();
    router.replace("/(tabs)");
  };

  const loadProgress = async () => {
    try {
      const profileState = await loadBasicCourseState(lang);
      if (profileState?.completed) {
        setStep(3);
        setSubIdx(0);
        return;
      }
      if (profileState) {
        setStep(profileState.step ?? 0);
        setSubIdx(profileState.subIdx ?? 0);
        return;
      }
      const legacyDone = await AsyncStorage.getItem(DONE_KEY(lang));
      if (legacyDone === "true") {
        await markBasicCourseCompleted(lang);
        setStep(3);
        setSubIdx(0);
        return;
      }
      const raw = await AsyncStorage.getItem(PROGRESS_KEY(lang));
      if (raw) {
        const p = JSON.parse(raw);
        setStep(p.step ?? 0);
        setSubIdx(p.subIdx ?? 0);
        await saveBasicCourseProgress(lang, p.step ?? 0, p.subIdx ?? 0);
      }
    } catch (e) { console.warn('[BasicCourse] Failed to load progress:', e); }
  };

  const saveProgress = async (s: number, idx: number) => {
    try {
      await AsyncStorage.setItem(PROGRESS_KEY(lang), JSON.stringify({ step: s, subIdx: idx }));
      await saveBasicCourseProgress(lang, s, idx);
    } catch (e) { console.warn('[BasicCourse] Failed to save progress:', e); }
  };

  const markDone = async () => {
    try {
      const alreadyDone = await AsyncStorage.getItem(DONE_KEY(lang));
      const { wasAlreadyCompleted } = await markBasicCourseCompleted(lang);
      await AsyncStorage.setItem(DONE_KEY(lang), "true");
      await AsyncStorage.removeItem(PROGRESS_KEY(lang));
      if (alreadyDone !== "true" && !wasAlreadyCompleted && !isReviewMode) await awardXp(100);
    } catch (e) { console.warn('[BasicCourse] Failed to mark course done:', e); }
  };

  // Set audio mode once when screen mounts (avoids per-press delay)
  useEffect(() => {
    if (Platform.OS !== "web") {
      Audio.setAudioModeAsync({ playsInSilentModeIOS: true, allowsRecordingIOS: false }).catch((e) => console.warn('[BasicCourse] setAudioMode (mount) failed:', e));
    }
  }, []);

  // ── BUG-M2: Stop TTS & unload sounds on unmount ──
  useEffect(() => {
    return () => {
      stopBcTTS();
    };
  }, []);

  const playAudio = useCallback(async (rawText: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAudioPlayed(true);

    const voice = BC_VOICES[course.lang];
    const url = buildBasicCourseTtsUrl(rawText, course.lang, voice);
    if (!url) return;

    try {
      // Stop any previous sound to prevent overlapping playback
      await stopBcSound();
      stopBcWebAudio();

      if (Platform.OS === "web") {
        const res = await apiFetchWithAuth(url.toString());
        if (!res.ok) throw new Error("tts-fail");
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const audio = new (window as any).Audio(objectUrl) as HTMLAudioElement;
        _bcWebAudio = audio;
        audio.onended = () => { URL.revokeObjectURL(objectUrl); _bcWebAudio = null; };
        audio.onerror = () => { URL.revokeObjectURL(objectUrl); _bcWebAudio = null; };
        await audio.play();
      } else {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true }).catch((e) => console.warn('[BasicCourse] setAudioMode failed:', e));
        const { sound } = await Audio.Sound.createAsync(
          { uri: url.toString(), headers: await getAuthHeaderRecord() },
          { shouldPlay: true, volume: 1.0 }
        );
        _bcNativeSound = sound;
        sound.setOnPlaybackStatusUpdate((st: any) => {
          if (st.isLoaded && st.didJustFinish) {
            sound.unloadAsync().catch((e) => console.warn('[BasicCourse] sound unload failed:', e));
            _bcNativeSound = null;
          }
        });
      }
    } catch (e) {
      console.warn('[BasicCourse] Auto-play TTS failed:', e);
    }
  }, [course.lang]);

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const stepReady = step === 0
      ? traced
      : step === 1
        ? flipped
        : step === 2
          ? greetPhase === "done"
          : true;
    if (!isReviewMode && step < 3 && !stepReady) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (step === 3) { finishCourse(); return; }
    if (subIdx >= currentItems.length - 1) {
      // In review mode: "full" section advances through all steps (0→1→2→3),
      // other sections return to the review menu after finishing items.
      if (isReviewMode) {
        if (reviewSection === "full" && step < 2) {
          // Advance to next step within full review (0→1→2, then done after greetings)
          Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
            setStep(s => s + 1);
            setSubIdx(0);
            Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
          });
        } else {
          Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
            if (reviewSection) {
              markReviewCompleted(reviewSection).catch((e) => console.warn('[BasicCourse] Failed to mark review complete:', e));
            }
            setShowReviewMenu(true);
            setReviewSection(null);
            Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
          });
        }
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
    if (courseCompletingRef.current) return;
    courseCompletingRef.current = true;
    stopBcTTS();
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
    const voice = BC_VOICES[course.lang];
    const url = buildBasicCourseTtsUrl(greetItem.phrase, course.lang, voice);
    if (!url) return;
    try {
      // Stop any previous sound to prevent overlapping playback
      await stopBcSound();
      stopBcWebAudio();

      if (Platform.OS === "web") {
        const res = await apiFetchWithAuth(url.toString());
        if (!res.ok) throw new Error("tts-fail");
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        const audio = new (window as any).Audio(objectUrl) as HTMLAudioElement;
        _bcWebAudio = audio;
        audio.onended = () => { URL.revokeObjectURL(objectUrl); _bcWebAudio = null; };
        audio.onerror = () => { URL.revokeObjectURL(objectUrl); _bcWebAudio = null; };
        await audio.play();
      } else {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true }).catch((e) => console.warn('[BasicCourse] setAudioMode failed:', e));
        const { sound } = await Audio.Sound.createAsync(
          { uri: url.toString(), headers: await getAuthHeaderRecord() },
          { shouldPlay: true, volume: 1.0 }
        );
        _bcNativeSound = sound;
        sound.setOnPlaybackStatusUpdate((s: any) => {
          if (s.isLoaded && s.didJustFinish) {
            sound.unloadAsync().catch((e) => console.warn('[BasicCourse] sound unload failed:', e));
            _bcNativeSound = null;
          }
        });
      }
    } catch (e) {
      console.warn('[BasicCourse] Greeting TTS playback failed:', e);
    }
    setGreetPhase("speak");
  };

  const markGreetAttemptComplete = async (score: number | null) => {
    setGreetScore(score);
    setGreetPhase("done");
    if (greetAttemptAwardedRef.current) return;
    greetAttemptAwardedRef.current = true;
    try {
      const promptKey = buildSpeakingPromptKey({
        targetLanguage: course.lang,
        source: "basic-course",
        phrase: greetItem?.phrase ?? "",
      });
      await recordSpokenSentence({ targetLanguage: course.lang, promptKey });
      await awardXp(5);
    } catch (e) {
      console.warn('[BasicCourse] Failed to award greeting attempt XP:', e);
    }
  };

  const handleGreetRecord = async () => {
    if (!greetItem || greetPhase === "processing" || greetPhase === "recording") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    stopBcTTS();
    setGreetScore(null);
    setGreetPhase("recording");

    try {
      const { base64, mimeType } = await recordAudio(BASIC_COURSE_RECORDING_MS);
      if (!isValidSpokenAudio(base64)) {
        console.warn('[BasicCourse] Greeting audio too short; not counting as a spoken attempt');
        setGreetScore(0);
        setGreetPhase("speak");
        return;
      }
      setGreetPhase("processing");
      const apiUrl = new URL("/api/pronunciation-assess", getApiUrl()).toString();
      const res = await apiFetchWithAuth(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: getPhoneticName(greetItem.phrase, course.lang), lang: course.lang, audio: base64, mimeType }),
      });
      const data = res.ok ? await res.json() : null;
      if (!isAcceptedPronunciationResult(data)) {
        console.warn('[BasicCourse] Greeting pronunciation was not accepted; retry required');
        setGreetScore(0);
        setGreetPhase("speak");
        return;
      }
      await markGreetAttemptComplete(data.score);
    } catch (e) {
      console.warn('[BasicCourse] Pronunciation assessment failed:', e);
      setGreetScore(0);
      setGreetPhase("speak");
    }
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
    : greetPhase === "done";

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ["0deg", "180deg"] });
  const backRotate  = flipAnim.interpolate({ inputRange: [0, 180], outputRange: ["180deg", "360deg"] });

  const listenLabel  = native === "korean" ? "듣기" : native === "spanish" ? "Escuchar" : native === "indonesian" ? "Dengarkan" : "Listen";
  const traceLabel   = native === "korean" ? "✍️ 따라 써보기" : native === "spanish" ? "✍️ Trazar" : native === "indonesian" ? "✍️ Tirukan" : "✍️ Trace it";
  const nextLabel    = step === 3
    ? (native === "korean" ? "시작하기 🚀" : native === "spanish" ? "¡Empezar! 🚀" : native === "indonesian" ? "Mulai Belajar 🚀" : "Start Learning 🚀")
    : isLastOfStep && isReviewMode
      ? (native === "korean" ? "완료 ✓" : native === "spanish" ? "Listo ✓" : native === "indonesian" ? "Selesai ✓" : "Done ✓")
    : isLastOfStep
      ? (native === "korean" ? "다음 단계 →" : native === "spanish" ? "Siguiente paso →" : native === "indonesian" ? "Langkah berikutnya →" : "Next Step →")
      : (native === "korean" ? "다음 →"      : native === "spanish" ? "Siguiente →"      : native === "indonesian" ? "Berikutnya →"      : "Next →");

  /* ── Accessibility labels (localized) ── */
  const a11yPrev    = native === "korean" ? "이전" : native === "spanish" ? "Anterior" : native === "indonesian" ? "Sebelumnya" : "Previous";
  const a11ySkip    = native === "korean" ? "건너뛰기" : native === "spanish" ? "Omitir" : native === "indonesian" ? "Lewati" : "Skip";
  const a11yBack    = native === "korean" ? "뒤로" : native === "spanish" ? "Atrás" : native === "indonesian" ? "Kembali" : "Back";
  const a11yHome    = native === "korean" ? "홈으로" : native === "spanish" ? "Ir a inicio" : native === "indonesian" ? "Ke beranda" : "Go home";
  const a11yListen  = native === "korean" ? "발음 듣기" : native === "spanish" ? "Escuchar pronunciación" : native === "indonesian" ? "Dengarkan pelafalan" : "Listen to pronunciation";
  const a11yRecord  = native === "korean" ? "따라 말하기" : native === "spanish" ? "Hablar ahora" : native === "indonesian" ? "Ucapkan sekarang" : "Speak now";

  /* ── bottom nav bar ── */
  const NavBar = () => (
    <View style={[s.navArea, { paddingBottom: bottomPad + 8 }]}>

      {/* ── Steps 1–3: normal Next button (step 0 has its own bottom bar) ── */}
      {step > 0 && (
        <>
          {!canNext && step < 3 && (
            <EmojiText style={s.nudge}>
              {step === 1
                ? (native === "korean" ? "카드를 탭해서 의미를 확인하세요 👆" : native === "spanish" ? "Toca la tarjeta para ver el significado 👆" : native === "indonesian" ? "Ketuk kartu untuk melihat artinya 👆" : "Tap the card to see the meaning 👆")
                : (native === "korean" ? "발음 듣기를 먼저 눌러보세요 👆" : native === "spanish" ? "Toca el botón de escuchar arriba 👆" : native === "indonesian" ? "Ketuk tombol dengarkan di atas 👆" : "Tap the listen button above 👆")}
            </EmojiText>
          )}
          <View style={s.navRow}>
            {step < 3 && subIdx > 0 && (
              <Pressable style={({ pressed }) => [s.prevBtn, pressed && { opacity: 0.7 }]} onPress={goPrev} accessibilityRole="button" accessibilityLabel={a11yPrev}>
                <Ionicons name="arrow-back" size={18} color={C.goldDark} />
              </Pressable>
            )}
            <Pressable
              style={({ pressed }) => [s.nextBtn, !canNext && s.nextBtnOff, pressed && canNext && { opacity: 0.85 }]}
              onPress={canNext ? goNext : undefined}
              disabled={!canNext}
              accessibilityRole="button"
              accessibilityLabel={nextLabel}
              accessibilityState={{ disabled: !canNext }}
            >
              <Text style={s.nextBtnTxt}>{nextLabel}</Text>
            </Pressable>
          </View>

          {/* Skip current item */}
          {isReviewMode && step < 3 && (
            <Pressable onPress={goNext} hitSlop={8} style={s.inlineSkipWrap} accessibilityRole="button" accessibilityLabel={a11ySkip}>
              <Text style={s.inlineSkip}>
                {native === "korean" ? "건너뛰기 ›" : native === "spanish" ? "Omitir ›" : native === "indonesian" ? "Lewati ›" : "Skip ›"}
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
      "필요할 때 돌아와서 글자와 소리를 차근차근 다질 수 있어요.",
    ],
    english: [
      "🦊 Welcome to Rudy's Basic Course!",
      "The basic course starts with the alphabet.",
      "Learn each letter, listen to pronunciation, and trace it yourself!",
      "Come back anytime when you want to strengthen letters and sounds.",
    ],
    spanish: [
      "🦊 ¡Bienvenido al Curso Básico de Rudy!",
      "El curso básico comienza con el alfabeto.",
      "¡Aprende cada letra, escucha la pronunciación y trázala tú mismo!",
      "Vuelve cuando quieras reforzar letras y sonidos.",
    ],
    indonesian: [
      "🦊 Selamat datang di Kursus Dasar Rudy!",
      "Kursus dasar dimulai dari alfabet.",
      "Pelajari setiap huruf, dengarkan pelafalannya, dan tuliskan sendiri!",
      "Kembalilah kapan saja saat ingin memperkuat huruf dan bunyinya.",
    ],
  };
  const introLines = introText[native] ?? introText.english;
  const startLabel = native === "korean" ? "기초 과정 시작하기" : native === "spanish" ? "Comenzar el curso" : native === "indonesian" ? "Mulai Kursus Dasar" : "Start Basic Course";
  const skipLabel  = native === "korean" ? "건너뛰기" : native === "spanish" ? "Omitir" : native === "indonesian" ? "Lewati" : "Skip";
  const skipNote   = native === "korean"
    ? "(이미 알파벳을 알고 있다면 건너뛰어도 됩니다)"
    : native === "spanish"
      ? "(Puedes omitirlo si ya conoces el alfabeto)"
      : native === "indonesian"
      ? "(Bisa dilewati jika kamu sudah tahu alfabetnya)"
      : "(You can skip if you already know the alphabet)";
  const courseTitle = native === "korean" ? "기초 과정" : native === "spanish" ? "Curso Básico" : native === "indonesian" ? "Kursus Dasar" : "Basic Course";

  /* ── REVIEW MENU SCREEN ── */
  if (showReviewMenu) {
    const charCount = course.chars.length;
    const reviewCards: { section: ReviewSection; icon: string; title: string; desc: string; sub: string }[] = [
      {
        section: "write",
        icon: "✏️",
        title: native === "korean" ? "알파벳 쓰기" : native === "spanish" ? "Escritura" : native === "indonesian" ? "Menulis" : "Writing",
        desc:  native === "korean" ? "글자를 보고 직접 써보기" : native === "spanish" ? "Trazar las letras" : native === "indonesian" ? "Telusuri huruf" : "Trace the letters",
        sub:   `${charCount}${native === "korean" ? "개" : native === "spanish" ? " letras" : native === "indonesian" ? " huruf" : " letters"}`,
      },
      {
        section: "listen",
        icon: "🔊",
        title: native === "korean" ? "알파벳 듣기" : native === "spanish" ? "Escuchar Alfabeto" : native === "indonesian" ? "Dengarkan Alfabet" : "Listen to Alphabet",
        desc:  native === "korean" ? "글자 발음을 듣고 확인하기" : native === "spanish" ? "Escucha la pronunciación de las letras" : native === "indonesian" ? "Dengarkan pelafalan huruf" : "Listen to letter pronunciations",
        sub:   `${charCount}${native === "korean" ? "개" : native === "spanish" ? " letras" : native === "indonesian" ? " huruf" : " letters"}`,
      },
      {
        section: "speak",
        icon: "🎤",
        title: native === "korean" ? "발음 연습" : native === "spanish" ? "Pronunciación" : native === "indonesian" ? "Berbicara" : "Speaking",
        desc:  native === "korean" ? "듣고 따라 말하기" : native === "spanish" ? "Escucha y repite" : native === "indonesian" ? "Dengarkan & ucapkan" : "Listen & speak aloud",
        sub:   `${course.greetings.length}${native === "korean" ? "개" : native === "spanish" ? " frases" : native === "indonesian" ? " frasa" : " phrases"}`,
      },
      {
        section: "full",
        icon: "🔄",
        title: native === "korean" ? "전체 복습" : native === "spanish" ? "Repaso completo" : native === "indonesian" ? "Ulasan Lengkap" : "Full Review",
        desc:  native === "korean" ? "듣기 + 발음 + 쓰기 전체" : native === "spanish" ? "Escucha + pronunciación + escritura" : native === "indonesian" ? "Mendengar + berbicara + menulis" : "Listening + speaking + writing",
        sub:   native === "korean" ? "전체" : native === "spanish" ? "Todo" : native === "indonesian" ? "Semua" : "All",
      },
    ];
    return (
      <View style={[s.screen, { paddingTop: topPad, paddingBottom: bottomPad + 8 }]}>
        {/* Header */}
        <View style={rv.header}>
          <Pressable style={({ pressed }) => [rv.backBtn, pressed && { opacity: 0.7 }]} onPress={() => {
            stopBcTTS();
            router.back();
          }} accessibilityRole="button" accessibilityLabel={a11yBack}>
            <Ionicons name="arrow-back" size={22} color={C.gold} />
          </Pressable>
          <Text style={rv.headerTitle}>
            {native === "korean" ? "기초 과정 복습" : native === "spanish" ? "Repaso del curso" : native === "indonesian" ? "Ulasan Kursus" : "Course Review"}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <Text style={rv.subtitle}>
          {native === "korean" ? "복습할 섹션을 선택하세요" : native === "spanish" ? "Elige una sección para repasar" : native === "indonesian" ? "Pilih bagian untuk diulang" : "Choose a section to review"}
        </Text>

        <ScrollView contentContainerStyle={rv.list} showsVerticalScrollIndicator={false}>
          {reviewCards.map(card => (
            <Pressable
              key={card.section}
              style={({ pressed }) => [rv.card, pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] }]}
              onPress={() => startReviewSection(card.section)}
              accessibilityRole="button"
              accessibilityLabel={`${card.title}. ${card.desc}`}
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
                  {native === "korean" ? "마지막: " : native === "spanish" ? "Último: " : native === "indonesian" ? "Terakhir: " : "Last: "}
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
        <Image source={require("../assets/rudy_badge.png")} style={intro.fox} resizeMode="cover" />

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
          accessibilityRole="button"
          accessibilityLabel={startLabel}
        >
          <EmojiText style={intro.startBtnTxt}>✅  {startLabel}</EmojiText>
        </Pressable>

        {/* ⏭️ Skip button */}
        <Pressable
          style={({ pressed }) => [intro.skipBtn, pressed && { opacity: 0.75 }]}
          onPress={() => setShowSkipConfirm(true)}
          accessibilityRole="button"
          accessibilityLabel={skipLabel}
        >
          <EmojiText style={intro.skipBtnTxt}>⏭️  {skipLabel}</EmojiText>
        </Pressable>

        <Text style={intro.skipNote}>{skipNote}</Text>

        {/* Skip confirmation modal (reused from main screen) */}
        <Modal visible={showSkipConfirm} transparent animationType="fade" onRequestClose={() => setShowSkipConfirm(false)}>
          <View style={s.modalOverlay}>
            <View style={s.modalBox}>
              <Text style={s.modalTitle}>
                {native === "korean" ? "홈으로 이동할까요?" : native === "spanish" ? "¿Ir a inicio?" : native === "indonesian" ? "Pergi ke Beranda?" : "Go to Home?"}
              </Text>
              <Text style={s.modalDesc}>
                {native === "korean"
                  ? "기초 과정 학습은 홈에서 다시 가능합니다."
                  : native === "spanish"
                    ? "Puedes retomar el curso básico desde inicio."
                    : native === "indonesian"
                      ? "Kamu bisa melanjutkan kursus dasar dari beranda kapan saja."
                    : "You can resume the basic course from home anytime."}
              </Text>
              <View style={s.modalBtns}>
                <Pressable
                  style={({ pressed }) => [s.modalCancel, pressed && { opacity: 0.8 }]}
                  onPress={() => setShowSkipConfirm(false)}
                  accessibilityRole="button"
                  accessibilityLabel={native === "korean" ? "계속 학습" : native === "spanish" ? "Continuar" : native === "indonesian" ? "Lanjut Belajar" : "Continue"}
                >
                  <Text style={s.modalCancelTxt}>
                    {native === "korean" ? "계속 학습" : native === "spanish" ? "Continuar" : native === "indonesian" ? "Lanjut Belajar" : "Continue"}
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [s.modalConfirm, { flexDirection: "row", gap: 6, justifyContent: "center" }, pressed && { opacity: 0.8 }]}
                  onPress={handleSkip}
                  accessibilityRole="button"
                  accessibilityLabel={native === "korean" ? "홈으로" : native === "spanish" ? "Ir a inicio" : native === "indonesian" ? "Ke Beranda" : "Go Home"}
                >
                  <Ionicons name="home" size={14} color={C.gold} />
                  <Text style={s.modalConfirmTxt}>
                    {native === "korean" ? "홈으로" : native === "spanish" ? "Ir a inicio" : native === "indonesian" ? "Ke Beranda" : "Go Home"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={[s.screen, { paddingTop: topPad }]}>

      {/* ── TOP BAR ── */}
      <View style={s.topBar}>
        {isReviewMode ? (
          <Pressable style={({ pressed }) => [s.reviewBackBtn, pressed && { opacity: 0.7 }]} onPress={() => {
            stopBcTTS();
            setShowReviewMenu(true);
          }} accessibilityRole="button" accessibilityLabel={a11yBack}>
            <Ionicons name="arrow-back" size={18} color={C.goldDark} />
          </Pressable>
        ) : (
          <Text style={s.stepLabel}>{course.stepNames[step]}</Text>
        )}
        <View style={s.lingoStrip}>
          <EmojiText style={s.lingoStripFox}>🦊</EmojiText>
          <Text style={s.lingoStripText}>{course.lingoTips[step]}</Text>
        </View>
        {isReviewMode ? (
          <Pressable style={({ pressed }) => [s.skipPill, pressed && { opacity: 0.7 }]} onPress={goNext} accessibilityRole="button" accessibilityLabel={a11ySkip}>
            <Text style={s.skipPillTxt}>
              {native === "korean" ? "건너뛰기 ›" : native === "spanish" ? "Omitir ›" : native === "indonesian" ? "Lewati ›" : "Skip ›"}
            </Text>
          </Pressable>
        ) : (
          <View style={s.topRightRow}>
            <Text style={s.stepNum}>{step + 1}/{totalSteps}</Text>
            <Pressable onPress={() => { stopBcTTS(); setShowSkipConfirm(true); }} hitSlop={10} accessibilityRole="button" accessibilityLabel={a11yHome}>
              <Ionicons name="home-outline" size={18} color={C.goldDim} />
            </Pressable>
          </View>
        )}
      </View>

      {/* ── PROGRESS BAR ── */}
      <View style={s.progOuter}>
        <View style={[s.progInner, { width: `${Math.round(overallPct * 100)}%` }]} />
      </View>

      {/* ════════════════════════════════════════
          STEP 0 — Listen mode: audio-only card; Write mode: tracing canvas
          ════════════════════════════════════════ */}
      {step === 0 && charItem && (

        /* ── LISTEN REVIEW MODE ── */
        isReviewMode && reviewSection === "listen" ? (
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24, gap: 20, paddingBottom: bottomPad + 80 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Large letter display */}
              <View style={{ alignItems: "center", gap: 8 }}>
                <Text style={[s.charBig, { fontSize: 100, lineHeight: 120 }]}>{charItem.char}</Text>
                <Text style={{ fontFamily: F.body, color: C.gold, fontSize: 20 }}>{charItem.roman}</Text>
                <EmojiText style={{ fontFamily: F.body, color: C.goldDim, fontSize: 14, textAlign: "center" }}>
                  {getCharTip(charItem.char, lang, native)}
                </EmojiText>
              </View>

              {/* Counter */}
              <Text style={s.counter}>{subIdx + 1} / {course.chars.length}</Text>

              {/* Listen button — large */}
              <Pressable
                style={({ pressed }) => [s.listenBtn, s.listenBtnLg, pressed && { opacity: 0.75 }]}
                onPress={() => playAudio(charItem.char)}
                accessibilityRole="button"
                accessibilityLabel={a11yListen}
              >
                <Ionicons name="volume-high-outline" size={24} color={C.bg1} />
                <EmojiText style={s.listenBtnTxt}>
                  {native === "korean" ? "🔊  발음 듣기" : native === "spanish" ? "🔊  Escuchar" : native === "indonesian" ? "🔊  Dengarkan" : "🔊  Listen"}
                </EmojiText>
              </Pressable>

              {audioPlayed && (
                <Text style={{ fontFamily: F.body, color: C.goldDim, fontSize: 12, textAlign: "center" }}>
                  {native === "korean" ? "다시 들으려면 버튼을 탭하세요" : native === "spanish" ? "Toca para escuchar de nuevo" : native === "indonesian" ? "Ketuk untuk mendengarkan lagi" : "Tap to listen again"}
                </Text>
              )}
            </ScrollView>

            {/* Bottom bar */}
            <View style={{ paddingHorizontal: 16, paddingBottom: bottomPad + 8, paddingTop: 8, gap: 6, borderTopWidth: 1, borderTopColor: C.border }}>
              <View style={s.navRow}>
                <Pressable
                  style={({ pressed }) => [s.nextBtn, !audioPlayed && s.nextBtnOff, pressed && audioPlayed && { opacity: 0.85 }]}
                  onPress={audioPlayed ? goNext : undefined}
                  disabled={!audioPlayed}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !audioPlayed }}
                  accessibilityLabel={isLastOfStep
                    ? (native === "korean" ? "완료" : native === "spanish" ? "Listo" : native === "indonesian" ? "Selesai" : "Done")
                    : (native === "korean" ? "다음" : native === "spanish" ? "Siguiente" : native === "indonesian" ? "Berikutnya" : "Next")}
                >
                  <Text style={s.nextBtnTxt}>
                    {isLastOfStep
                      ? (native === "korean" ? "완료 ✓" : native === "spanish" ? "Listo ✓" : native === "indonesian" ? "Selesai ✓" : "Done ✓")
                      : (native === "korean" ? "다음 →" : native === "spanish" ? "Siguiente →" : native === "indonesian" ? "Berikutnya →" : "Next →")}
                  </Text>
                </Pressable>
              </View>
              <Pressable onPress={goNext} hitSlop={8} style={s.inlineSkipWrap} accessibilityRole="button" accessibilityLabel={a11ySkip}>
                <Text style={s.inlineSkip}>
                  {native === "korean" ? "건너뛰기 ›" : native === "spanish" ? "Omitir ›" : native === "indonesian" ? "Lewati ›" : "Skip ›"}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        ) : (

        /* ── WRITE / FULL MODE: tracing canvas ── */
        <Animated.View style={{ flex: 1, opacity: fadeAnim, gap: 8 }}>

          {/* Char info card — compact */}
          <View style={[s.charInfoRow, { marginHorizontal: 16, paddingVertical: 10 }]}>
            <Text style={[s.charBig, { fontSize: 56 }]}>{charItem.char}</Text>
            <View style={s.charMeta}>
              <Text style={s.charRoman}>{charItem.roman}</Text>
              <EmojiText style={s.charTip}>{getCharTip(charItem.char, lang, native)}</EmojiText>
            </View>
          </View>

          {/* Listen button */}
          <Pressable
            style={({ pressed }) => [s.listenBtn, { paddingVertical: 7 }, pressed && { opacity: 0.75 }]}
            onPress={() => playAudio(charItem.char)}
            accessibilityRole="button"
            accessibilityLabel={a11yListen}
          >
            <Ionicons name="volume-medium-outline" size={18} color={C.bg1} />
            <Text style={s.listenBtnTxt}>{listenLabel}</Text>
          </Pressable>

          {/* Trace label */}
          <View style={[s.traceLabelRow, { marginHorizontal: 16 }]}>
            <View style={s.traceLine} />
            <Text style={s.traceLabel}>{traceLabel}</Text>
            <View style={s.traceLine} />
          </View>

          {/* Canvas — flex:1 fills ALL remaining vertical space */}
          <View
            style={[
              { flex: 1, marginHorizontal: 16 },
              Platform.OS === "web" ? ({ touchAction: "none" } as object) : {},
            ]}
          >
            <TracingCanvas key={canvasKey} char={charItem.char} onDrawn={() => setTraced(true)} />
          </View>

          {/* Bottom bar — always pinned above the screen edge */}
          <View style={{ paddingHorizontal: 16, paddingBottom: bottomPad + 8, paddingTop: 8, gap: 6, borderTopWidth: 1, borderTopColor: C.border }}>
            <Text style={s.counter}>{subIdx + 1} / {course.chars.length}</Text>
            <View style={s.navRow}>
              <Pressable
                style={({ pressed }) => [s.retryBtn, { flex: 1 }, pressed && { opacity: 0.7 }]}
                onPress={handleRetry}
                accessibilityRole="button"
                accessibilityLabel={native === "korean" ? "다시 해볼게요" : native === "spanish" ? "Otra vez" : native === "indonesian" ? "Coba lagi" : "Try again"}
              >
                <EmojiText style={s.retryBtnTxt}>
                  {native === "korean" ? "🔄  다시 해볼게요" : native === "spanish" ? "🔄  Otra vez" : native === "indonesian" ? "🔄  Coba lagi" : "🔄  Try again"}
                </EmojiText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [s.nextBtn, !traced && s.nextBtnOff, pressed && traced && { opacity: 0.85 }]}
                onPress={traced ? goNext : undefined}
                disabled={!traced}
                accessibilityRole="button"
                accessibilityState={{ disabled: !traced }}
                accessibilityLabel={native === "korean" ? "잘했어요!" : native === "spanish" ? "¡Bien hecho!" : native === "indonesian" ? "Bagus!" : "Looks good!"}
              >
                <EmojiText style={s.nextBtnTxt}>
                  {native === "korean" ? "✅  잘했어요!" : native === "spanish" ? "✅  ¡Bien hecho!" : native === "indonesian" ? "✅  Bagus!" : "✅  Looks good!"}
                </EmojiText>
              </Pressable>
            </View>
            {isReviewMode && (
              <Pressable onPress={goNext} hitSlop={8} style={s.inlineSkipWrap} accessibilityRole="button" accessibilityLabel={a11ySkip}>
                <Text style={s.inlineSkip}>
                  {native === "korean" ? "건너뛰기 ›" : native === "spanish" ? "Omitir ›" : native === "indonesian" ? "Lewati ›" : "Skip ›"}
                </Text>
              </Pressable>
            )}
          </View>

        </Animated.View>
        )
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
                <Pressable
                  onPress={handleFlip}
                  style={s.flipBox}
                  accessibilityRole="button"
                  accessibilityLabel={`${wordItem.word}. ${native === "korean" ? "탭해서 의미 확인" : native === "spanish" ? "Toca para ver el significado" : native === "indonesian" ? "Ketuk untuk melihat arti" : "Tap to reveal the meaning"}`}
                >
                  <Animated.View style={[s.flipCard, { transform: [{ perspective: 1200 }, { rotateY: frontRotate }] }]}>
                    <EmojiText style={s.wordEmoji}>{wordItem.emoji}</EmojiText>
                    <Text style={s.wordText}>{wordItem.word}</Text>
                    <Text style={s.wordHint}>{native === "korean" ? "탭해서 의미 확인" : native === "spanish" ? "Toca para ver" : native === "indonesian" ? "Ketuk untuk melihat" : "Tap to reveal"}</Text>
                  </Animated.View>
                  <Animated.View style={[s.flipCard, s.flipBack, { transform: [{ perspective: 1200 }, { rotateY: backRotate }] }]}>
                    <EmojiText style={s.wordEmoji}>{wordItem.emoji}</EmojiText>
                    <Text style={s.wordMeaning}>{wordItem.meaning[native === "korean" ? "ko" : native === "spanish" ? "es" : native === "indonesian" ? "id" : "en"]}</Text>
                    <Text style={s.wordSub}>{wordItem.word}</Text>
                  </Animated.View>
                </Pressable>
                <Pressable style={({ pressed }) => [s.listenBtn, pressed && { opacity: 0.75 }]} onPress={() => playAudio(wordItem.word)} accessibilityRole="button" accessibilityLabel={a11yListen}>
                  <Ionicons name="volume-medium-outline" size={18} color={C.bg1} />
                  <Text style={s.listenBtnTxt}>{listenLabel}</Text>
                </Pressable>
                <Text style={s.counter}>{subIdx + 1} / {course.words.length}</Text>
              </>
            )}

            {/* ── STEP 2: GREETINGS ── */}
            {step === 2 && greetItem && (() => {
              const usageKey = native === "korean" ? "ko" : native === "spanish" ? "es" : native === "indonesian" ? "id" : "en";
              const usageText = greetItem.usage[usageKey as "ko" | "en" | "es" | "id"];
              const meaningText = greetItem.meaning[usageKey as "ko" | "en" | "es" | "id"];
              return (
                <>
                  <View style={s.greetCard}>
                    <Text style={s.greetPhrase}>{greetItem.phrase}</Text>
                    <Text style={s.greetMeaning}>{meaningText}</Text>
                    <Text style={s.greetUsage}>{usageText}</Text>
                  </View>

                  {/* Phase: listen */}
                  {greetPhase === "listen" && (
                    <>
                      <Pressable style={({ pressed }) => [s.listenBtn, s.listenBtnLg, pressed && { opacity: 0.75 }]} onPress={handleGreetListen} accessibilityRole="button" accessibilityLabel={a11yListen}>
                        <Ionicons name="volume-high-outline" size={22} color={C.bg1} />
                        <EmojiText style={s.listenBtnTxt}>
                          {native === "korean" ? "🔊  듣기" : native === "spanish" ? "🔊  Escuchar" : native === "indonesian" ? "🔊  Dengarkan" : "🔊  Listen"}
                        </EmojiText>
                      </Pressable>
                      {isReviewMode && (
                        <Pressable onPress={goNext} hitSlop={8} style={s.inlineSkipWrap} accessibilityRole="button" accessibilityLabel={a11ySkip}>
                          <Text style={s.inlineSkip}>
                            {native === "korean" ? "건너뛰기 ›" : native === "spanish" ? "Omitir ›" : native === "indonesian" ? "Lewati ›" : "Skip ›"}
                          </Text>
                        </Pressable>
                      )}
                    </>
                  )}

                  {/* Phase: speak */}
                  {greetPhase === "speak" && (
                    <View style={{ gap: 10, width: "100%", alignItems: "center" }}>
                      <Text style={{ fontFamily: F.body, color: C.goldDim, fontSize: 13, textAlign: "center" }}>
                        {native === "korean" ? "이제 따라 말해보세요!" : native === "spanish" ? "¡Ahora repite en voz alta!" : native === "indonesian" ? "Sekarang ucapkan dengan lantang!" : "Now say it aloud!"}
                      </Text>
                      <Pressable style={({ pressed }) => [s.micBtn, pressed && { opacity: 0.75 }]} onPress={handleGreetRecord} accessibilityRole="button" accessibilityLabel={a11yRecord}>
                        <Ionicons name="mic-outline" size={28} color={C.bg1} />
                        <EmojiText style={s.listenBtnTxt}>
                          {native === "korean" ? "🎤  따라 말하기" : native === "spanish" ? "🎤  Repetir" : native === "indonesian" ? "🎤  Ucapkan Sekarang" : "🎤  Speak Now"}
                        </EmojiText>
                      </Pressable>
                      {isReviewMode && (
                        <Pressable onPress={goNext} hitSlop={8} style={s.inlineSkipWrap} accessibilityRole="button" accessibilityLabel={a11ySkip}>
                          <Text style={s.inlineSkip}>
                            {native === "korean" ? "건너뛰기 ›" : native === "spanish" ? "Omitir ›" : native === "indonesian" ? "Lewati ›" : "Skip ›"}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  )}

                  {/* Phase: recording */}
                  {greetPhase === "recording" && (
                    <View style={s.recordingRow}>
                      <View style={s.recDot} />
                      <Text style={s.recordingTxt}>
                        {native === "korean" ? "녹음 중..." : native === "spanish" ? "Grabando..." : native === "indonesian" ? "Merekam..." : "Recording..."}
                      </Text>
                    </View>
                  )}

                  {/* Phase: processing */}
                  {greetPhase === "processing" && (
                    <EmojiText style={s.processingTxt}>
                      {native === "korean" ? "⏳  평가 중..." : native === "spanish" ? "⏳  Evaluando..." : native === "indonesian" ? "⏳  Menilai..." : "⏳  Evaluating..."}
                    </EmojiText>
                  )}

                  {/* Phase: done */}
                  {greetPhase === "done" && (
                    <View style={s.scoreDone}>
                      <EmojiText style={s.scoreDoneEmoji}>🎉</EmojiText>
                      <Text style={s.scoreDoneTxt}>
                        {native === "korean" ? "시도 완료! +5 XP" : native === "spanish" ? "¡Intento contado! +5 XP" : native === "indonesian" ? "Percobaan dihitung! +5 XP" : "Attempt counted! +5 XP"}
                      </Text>
                      {greetScore !== null && (
                        <Text style={s.scoreNum}>{Math.round(greetScore)}</Text>
                      )}
                      <Pressable style={({ pressed }) => [s.retrySmBtn, pressed && { opacity: 0.75 }]} onPress={handleGreetRetry} accessibilityRole="button" accessibilityLabel={native === "korean" ? "한 번 더 말해보기" : native === "spanish" ? "Decirlo otra vez" : native === "indonesian" ? "Ucapkan sekali lagi" : "Say it once more"}>
                        <Text style={s.retrySmTxt}>
                          {native === "korean" ? "한 번 더 말해보기" : native === "spanish" ? "Decirlo otra vez" : native === "indonesian" ? "Ucapkan sekali lagi" : "Say it once more"}
                        </Text>
                      </Pressable>
                    </View>
                  )}

                  <Text style={s.counter}>{subIdx + 1} / {course.greetings.length}</Text>
                </>
              );
            })()}

            {/* ── STEP 3: COMPLETION ── */}
            {step === 3 && (
              <View style={s.completionCard}>
                <EmojiText style={s.bigEmoji}>🎉</EmojiText>
                <Text style={s.completionTitle}>
                  {native === "korean" ? "기초 과정 완료!" : native === "spanish" ? "¡Curso Básico Completado!" : native === "indonesian" ? "Kursus Dasar Selesai!" : "Basic Course Complete!"}
                </Text>
                <Text style={s.completionSub}>
                  {native === "korean" ? "이제 Enigma와 함께 본격적인 학습을 시작해봐요!" : native === "spanish" ? "¡Ahora comienza tu aventura con Enigma!" : native === "indonesian" ? "Kamu siap memulai perjalanan bahasamu sepenuhnya!" : "You're ready to start your full language journey!"}
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

      {/* ── FIXED BOTTOM NAV (steps 1-3 only; step 0 has its own bottom bar) ── */}
      {step > 0 && <NavBar />}

      {/* ── SKIP TO HOME CONFIRMATION MODAL ── */}
      <Modal visible={showSkipConfirm} transparent animationType="fade" onRequestClose={() => setShowSkipConfirm(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>
              {native === "korean" ? "홈으로 이동할까요?" : native === "spanish" ? "¿Ir a inicio?" : native === "indonesian" ? "Pergi ke Beranda?" : "Go to Home?"}
            </Text>
            <Text style={s.modalDesc}>
              {native === "korean"
                ? "기초 과정 학습은 홈에서 다시 가능합니다."
                : native === "spanish"
                  ? "Puedes retomar el curso básico desde inicio."
                  : native === "indonesian"
                    ? "Kamu bisa melanjutkan kursus dasar dari beranda kapan saja."
                  : "You can resume the basic course from home anytime."}
            </Text>
            <View style={s.modalBtns}>
              <Pressable
                style={({ pressed }) => [s.modalCancel, pressed && { opacity: 0.8 }]}
                onPress={() => setShowSkipConfirm(false)}
                accessibilityRole="button"
                accessibilityLabel={native === "korean" ? "계속 학습" : native === "spanish" ? "Continuar" : native === "indonesian" ? "Lanjut Belajar" : "Continue"}
              >
                <Text style={s.modalCancelTxt}>
                  {native === "korean" ? "계속 학습" : native === "spanish" ? "Continuar" : native === "indonesian" ? "Lanjut Belajar" : "Continue"}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [s.modalConfirm, { flexDirection: "row", gap: 6, justifyContent: "center" }, pressed && { opacity: 0.8 }]}
                onPress={handleSkip}
                accessibilityRole="button"
                accessibilityLabel={native === "korean" ? "홈으로" : native === "spanish" ? "Ir a inicio" : native === "indonesian" ? "Ke Beranda" : "Go Home"}
              >
                <Ionicons name="home" size={14} color={C.gold} />
                <Text style={s.modalConfirmTxt}>
                  {native === "korean" ? "홈으로" : native === "spanish" ? "Ir a inicio" : native === "indonesian" ? "Ke Beranda" : "Go Home"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: C.gold, borderRadius: 20,
    paddingHorizontal: 26, paddingVertical: 13,
    shadowColor: C.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 8,
  },
  recordingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  recDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#e74c3c" },
  recordingTxt: { fontSize: 15, fontFamily: F.bodySemi, color: "#e74c3c" },
  processingTxt: { fontSize: 15, fontFamily: F.body, color: C.goldDim, textAlign: "center" },

  scoreDone: { alignItems: "center", gap: 8, padding: 16, borderRadius: 20, backgroundColor: "rgba(201,162,39,0.12)", borderWidth: 1.5, borderColor: "rgba(201,162,39,0.35)", width: CARD_W },
  scoreDoneEmoji: { fontSize: 32 },
  scoreDoneTxt: { fontSize: 16, fontFamily: F.header, color: C.gold, textAlign: "center" },
  scoreNum: { fontSize: 40, fontFamily: F.title, color: C.gold, letterSpacing: 2 },
  retrySmBtn: {
    paddingHorizontal: 16, paddingVertical: 11, borderRadius: 16, alignItems: "center", justifyContent: "center",
    backgroundColor: C.bg2, borderWidth: 1.5, borderColor: C.border,
  },
  retrySmTxt: { fontSize: 14, fontFamily: F.bodySemi, color: C.goldDim },

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

  /* ── Modal ── */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalBox: {
    backgroundColor: C.bg2,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: C.border,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: F.title,
    color: C.gold,
    textAlign: "center",
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.goldDim,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalBtns: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  modalCancelTxt: {
    fontSize: 14,
    fontFamily: F.body,
    color: C.goldDim,
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "rgba(201,162,39,0.15)",
    borderWidth: 1,
    borderColor: C.gold,
    alignItems: "center",
  },
  modalConfirmTxt: {
    fontSize: 14,
    fontFamily: F.body,
    color: C.gold,
    fontWeight: "600",
  },
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
    borderRadius: 80,
    overflow: "hidden",
    borderWidth: 2.5,
    borderColor: "#c9a227",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalBox: {
    backgroundColor: C.bg2,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: C.border,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: F.title,
    color: C.gold,
    textAlign: "center",
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.goldDim,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalBtns: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  modalCancelTxt: {
    fontSize: 14,
    fontFamily: F.body,
    color: C.goldDim,
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "rgba(201,162,39,0.15)",
    borderWidth: 1,
    borderColor: C.gold,
    alignItems: "center",
  },
  modalConfirmTxt: {
    fontSize: 14,
    fontFamily: F.body,
    color: C.gold,
    fontWeight: "600",
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

  /* ── Skip confirmation modal ── */
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center", alignItems: "center", padding: 24,
  },
  modalBox: {
    backgroundColor: C.bg2, borderRadius: 20, padding: 24, width: "100%", maxWidth: 340,
    borderWidth: 1, borderColor: C.border, gap: 14,
  },
  modalTitle: { fontSize: 18, fontFamily: F.header, color: C.gold, textAlign: "center" },
  modalDesc:  { fontSize: 13, fontFamily: F.body, color: C.parchment, textAlign: "center", lineHeight: 20 },
  modalBtns:  { flexDirection: "row", gap: 10, marginTop: 6 },
  modalCancel: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, alignItems: "center",
  },
  modalCancelTxt:  { fontSize: 14, fontFamily: F.bodySemi, color: C.goldDim },
  modalConfirm: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: "rgba(201,162,39,0.18)", borderWidth: 1, borderColor: C.gold, alignItems: "center",
  },
  modalConfirmTxt: { fontSize: 14, fontFamily: F.bodySemi, color: C.gold },
});
