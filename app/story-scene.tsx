import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Dimensions,
  Animated,
  Image,
  ScrollView,
  PanResponder,
  TextInput,
  Modal,
  AppState,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system/legacy";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { STORY_PROGRESS_KEY, StoryProgress } from "@/app/(tabs)/story";
import { C, F } from "@/constants/theme";
import { getApiUrl, apiRequest } from "@/lib/query-client";
import { addToExpressionBook, trackQuizIO, markExpressionsMastered } from "@/lib/storyUtils";
import { checkAnswer, AnswerResult } from "@/lib/answerUtils";
import { Svg, Path } from "react-native-svg";

const rudyStoryImg = require("@/assets/rudy_story.png");

// ── TTS Audio Cache ────────────────────────────────────────────────────────
// Keyed by "text::lang". Sounds are loaded in advance; on press we just replay.
const _ttsCacheNative = new Map<string, Audio.Sound>();
const _ttsCacheWeb    = new Map<string, HTMLAudioElement>();

async function ttsPreload(text: string, lang: string, apiBase: string) {
  const key = `${text}::${lang}`;
  const url = new URL("/api/pronunciation-tts", apiBase);
  url.searchParams.set("text", text);
  url.searchParams.set("lang", lang);
  const urlStr = url.toString();
  if (Platform.OS === "web") {
    if (_ttsCacheWeb.has(key)) return;
    try {
      const audio = new (window as any).Audio(urlStr) as HTMLAudioElement;
      audio.preload = "auto";
      audio.volume = 1.0;
      audio.load();
      _ttsCacheWeb.set(key, audio);
    } catch (e) { console.warn('[Audio] TTS web cache prefetch failed:', e); }
  } else {
    if (_ttsCacheNative.has(key)) return;
    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: urlStr },
        { shouldPlay: false, volume: 1.0 }
      );
      _ttsCacheNative.set(key, sound);
    } catch (e) { console.warn('[Audio] TTS native cache prefetch failed:', e); }
  }
}

function ttsPlayCached(
  text: string,
  lang: string,
  apiBase: string,
  setPlaying: (v: boolean) => void
) {
  const key = `${text}::${lang}`;
  const url = new URL("/api/pronunciation-tts", apiBase);
  url.searchParams.set("text", text);
  url.searchParams.set("lang", lang);
  const urlStr = url.toString();

  if (Platform.OS === "web") {
    const cached = _ttsCacheWeb.get(key);
    if (cached) {
      cached.currentTime = 0;
      cached.volume = 1.0;
      setPlaying(true);
      cached.play().catch((e: unknown) => console.warn('[Audio] cached web TTS play failed:', e));
      cached.onended = () => setPlaying(false);
      cached.onerror = () => setPlaying(false);
    } else {
      const audio = new (window as any).Audio(urlStr);
      audio.volume = 1.0;
      setPlaying(true);
      audio.play().catch((e: unknown) => console.warn('[Audio] web TTS play failed:', e));
      audio.onended = () => setPlaying(false);
      audio.onerror = () => setPlaying(false);
      _ttsCacheWeb.set(key, audio);
    }
  } else {
    const cached = _ttsCacheNative.get(key);
    if (cached) {
      setPlaying(true);
      (async () => {
        try {
          await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
          await cached.setPositionAsync(0);
          await cached.setVolumeAsync(1.0);
          await cached.playAsync();
          cached.setOnPlaybackStatusUpdate((s) => {
            if (s.isLoaded && s.didJustFinish) setPlaying(false);
          });
        } catch (e) { console.warn('[Audio] cached TTS playback failed:', e); setPlaying(false); }
      })();
    } else {
      setPlaying(true);
      (async () => {
        try {
          await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
          const { sound } = await Audio.Sound.createAsync(
            { uri: urlStr },
            { shouldPlay: false, volume: 1.0 }
          );
          _ttsCacheNative.set(key, sound);
          await sound.setVolumeAsync(1.0);
          await sound.playAsync();
          sound.setOnPlaybackStatusUpdate((s) => {
            if (s.isLoaded && s.didJustFinish) setPlaying(false);
          });
        } catch (e) { console.warn('[Audio] TTS playback failed:', e); setPlaying(false); }
      })();
    }
  }
}
const { width } = Dimensions.get("window");

/* ─────────────────── TYPES ─────────────────── */

interface Character {
  id: string;
  emoji: string;
  name: string;
  nameKo?: string;
  side: "left" | "right";
  avatarBg: string;
  isLingo?: boolean;
}

interface Tri {
  en: string;
  ko: string;
  es: string;
}

/* Puzzle types */
interface WordMatchQ {
  word: Tri;
  meaning: Tri;
  wrong: [Tri, Tri, Tri];
}
interface FillBlankQ {
  sentence: Tri;
  answer: Tri;
  opts: [Tri, Tri];
  hints?: { h1: Tri; h2?: Tri; h3?: Tri };
}
interface DialogueChoiceQ {
  prompt: Tri;
  context: Tri;
  answer: Tri;
  wrong: [Tri, Tri];
}
interface SentenceBuilderQ {
  instruction: Tri;
  words: Tri[];
  answerOrder: number[];
}
interface InvestigationQ {
  prompt: Tri;
  clues: Tri[];
  answerIdx: number;
}
interface ListenChooseQ {
  word: Tri;
  opts: [Tri, Tri, Tri, Tri];
  answerIdx: number;
}
interface PronunciationQ {
  word: Tri;
}
interface WritingMissionQ {
  word: Tri;
  hint?: Tri;
  acceptableAnswers?: string[];
}
interface CipherQ {
  encoded: { en: string; es: string };
  answer: Tri;
  shift: number;
  hint: Tri;
  opts: [Tri, Tri, Tri, Tri];
}
interface WordPuzzleQ {
  word: Tri;
  scrambled: Tri;
}

interface VoicePowerQ {
  sentence: Tri;
  translation?: Tri;
  stoneEffect?: "dim" | "glow" | "bright" | "blinding";
  stoneCount?: number;
  minScore?: number;
}

interface DebateBattleRoundQ {
  topic: Tri;
  npcArgument: Tri;
  requiredExpressions: string[];
}

interface DebateBattleQ {
  opponent: string;
  rounds: number;
  minExpressions: number;
  roundData: DebateBattleRoundQ[];
}

interface NpcRescueStageQ {
  instruction: Tri;
  targetPhrase: Tri;
  hint?: Tri;
  minScore?: number;
}

interface NpcRescueQ {
  npcToRescue: string;
  stages: NpcRescueStageQ[];
  progressiveIntro: boolean;
}

type PuzzleType =
  | { pType: "word-match"; questions: WordMatchQ[] }
  | { pType: "fill-blank"; questions: FillBlankQ[] }
  | { pType: "dialogue-choice"; questions: DialogueChoiceQ[] }
  | { pType: "sentence-builder"; questions: SentenceBuilderQ[] }
  | { pType: "investigation"; questions: InvestigationQ[] }
  | { pType: "listen-choose"; questions: ListenChooseQ[] }
  | { pType: "pronunciation"; questions: PronunciationQ[] }
  | { pType: "writing-mission"; questions: WritingMissionQ[] }
  | { pType: "cipher"; questions: CipherQ[] }
  | { pType: "word-puzzle"; questions: WordPuzzleQ[] }
  | { pType: "voice-power"; questions: VoicePowerQ[] }
  | { pType: "debate-battle"; questions: [DebateBattleQ] }
  | { pType: "npc-rescue"; questions: [NpcRescueQ] };

/* Puzzle hints
 * Each tier is a Tri (ui-language display) with an optional `byLearning` map
 * that overrides the content for a specific learningLang value.
 * Resolution priority: byLearning[learningLang] > default Tri
 */
type HintTri = Tri & { byLearning?: Partial<Record<string, Tri>> };
interface PuzzleHints {
  h1: HintTri;
  h2: HintTri;
  h3?: HintTri;
}

function resolveHint(h: HintTri, uiLang: string, learningLang: string): string {
  const src: Tri = h.byLearning?.[learningLang] ?? h;
  return uiLang === "korean" ? src.ko : uiLang === "spanish" ? src.es : src.en;
}

/* ── Language ratio metadata ──────────────────────────────────────────────────
 * Each chapter targets a specific CEFR level and controls how much of the
 * NPC dialogue is shown in the target language vs. the user's native language.
 *
 * - targetLangRatio: 0-100 — percentage of dialogue that should be in the
 *   target language. Chapter 1 (A1) = 30%, Chapter 6 (B2+) ≈ 90%.
 * - knownExpressions: the Day 1-N expressions the learner already knows.
 *   Only these expressions should appear in the target language within mixed
 *   dialogue. Everything else stays in the native language.
 * - cefrLevel: approximate CEFR level for the chapter.
 *
 * For NPC dialogue scenes (isNarration !== true), the mixed-language versions
 * are stored in textKoMix / textEsMix. These contain MOSTLY native language
 * with the learned English expressions kept in English, e.g.:
 *   textKoMix: "야. 박물관 닫았어. No visitors, no exceptions. 그래서 누구야?"
 *   textEsMix: "Oye. El museo está cerrado. No visitors, no exceptions. ¿Quién eres?"
 *
 * When a user is a beginner, getSceneText() prefers textKoMix/textEsMix over
 * the fully-translated textKo/textEs for dialogue scenes, so the user sees
 * native-language scaffolding with target-language expressions inline.
 */
interface ChapterMeta {
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  targetLangRatio: number;
  knownExpressions: string[];
  languageNote: string;
}

/* Sequence items */
type SeqScene = {
  kind: "scene";
  charId: string;
  text: string;
  textKo?: string;
  textEs?: string;
  /** Mixed-language Korean: mostly Korean with learned English expressions inline */
  textKoMix?: string;
  /** Mixed-language Spanish: mostly Spanish with learned English expressions inline */
  textEsMix?: string;
  isNarration?: boolean;
  /** Reference to an entry in IDIOM_COLLECTION — links this dialogue to a targetLang-adaptive idiom */
  idiomRef?: string;
};
type SeqClue = {
  kind: "clue";
  symbol: string;
  titleEn: string;
  titleKo: string;
  titleEs: string;
  descEn: string;
  descKo: string;
  descEs: string;
};
type TPRSMeta = {
  tprsStage?: 1 | 2 | 3 | 4;
  targetExpressions?: string[];
  previouslyLearned?: string[];
  speakAfter?: boolean;
  storyReason?: string;
  storyConsequence?: string;
  onFail?: {
    addToWeakExpressions: string[];
    reviewInDailyCourse: boolean;
    reviewDays: number;
  };
};

type SeqPuzzle = { kind: "puzzle"; puzzleNum?: number; hints?: PuzzleHints } & PuzzleType & TPRSMeta;
type SeqItem = SeqScene | SeqClue | SeqPuzzle;

interface Story {
  id: string;
  title: string;
  titleKo: string;
  titleEs: string;
  gradient: readonly [string, string, string];
  accentColor: string;
  /** Language ratio metadata for progressive immersion */
  chapterMeta?: ChapterMeta;
  characters: Character[];
  sequence: SeqItem[];
  nextChapterId?: string;
}

/* ─────────────────── HELPERS ─────────────────── */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function tri(t: Tri, lang: string) {
  if (lang === "korean") return t.ko;
  if (lang === "spanish") return t.es;
  return t.en;
}

/* ─────────────────── IDIOM COLLECTION ─────────────────── */
/* targetLang-adaptive idiom data.
 * Each idiom has versions keyed by targetLang (en, es, ko).
 * `expression` is in the target language the user is learning.
 * `meaning` maps to translations for other languages.
 * `literal` (optional) is a word-for-word literal translation for cultural insight.
 * Dialogue scenes reference these via `idiomRef` on SeqScene.
 */
const IDIOM_COLLECTION: Record<string, {
  npc: string;
  chapter: string;
  situation: string;
  idiom: Record<string, {
    expression: string;
    meaning: Partial<Record<string, string>>;
    literal?: Partial<Record<string, string>>;
  }>;
}> = {

  /* ── Tom (Ch1 — British English street talk) ───────────────────────────── */
  idiom_tom_1: {
    npc: "tom",
    chapter: "ch1",
    situation: "Wishing Rudy good luck before investigating",
    idiom: {
      en: {
        expression: "Break a leg!",
        meaning: { ko: "행운을 빌어!", es: "¡Buena suerte!" },
        literal: { ko: "다리를 부러뜨려!", es: "¡Rómpete una pierna!" },
      },
      es: {
        expression: "¡Mucha mierda!",
        meaning: { ko: "행운을 빌어!", en: "Break a leg!" },
        literal: { ko: "많은 똥!", en: "Lots of crap!" },
      },
      ko: {
        expression: "대박 나라!",
        meaning: { en: "Break a leg!", es: "¡Buena suerte!" },
        literal: { en: "Hit the jackpot!", es: "¡Que te salga un gran éxito!" },
      },
    },
  },

  /* ── Don Miguel (Ch2 — Spanish wisdom) ─────────────────────────────────── */
  idiom_miguel_1: {
    npc: "don_miguel",
    chapter: "ch2",
    situation: "Encouraging Rudy after losing a clue",
    idiom: {
      en: {
        expression: "Every cloud has a silver lining",
        meaning: { ko: "나쁜 일에도 좋은 면이 있다", es: "Todo tiene su lado bueno" },
        literal: { ko: "모든 구름에는 은빛 테두리가 있다" },
      },
      es: {
        expression: "No hay mal que por bien no venga",
        meaning: { ko: "나쁜 일에도 좋은 면이 있다", en: "Every cloud has a silver lining" },
        literal: { ko: "좋은 것을 가져오지 않는 나쁜 것은 없다" },
      },
      ko: {
        expression: "전화위복",
        meaning: { en: "A blessing in disguise", es: "Una bendición disfrazada" },
        literal: { en: "Disaster turns into fortune" },
      },
    },
  },

  /* ── Youngsook (Ch3 — Korean traditional wisdom) ───────────────────────── */
  idiom_youngsook_1: {
    npc: "youngsook",
    chapter: "ch3",
    situation: "Teaching Rudy about Korean culture over food",
    idiom: {
      en: {
        expression: "Food is the way to someone's heart",
        meaning: { ko: "음식은 마음을 여는 열쇠다", es: "La comida es el camino al corazón" },
      },
      es: {
        expression: "Barriga llena, corazón contento",
        meaning: { ko: "배가 부르면 마음이 행복하다", en: "Full belly, happy heart" },
        literal: { ko: "배가 부르면 마음이 기쁘다" },
      },
      ko: {
        expression: "금강산도 식후경",
        meaning: { en: "Even the most beautiful scenery is best after eating", es: "Incluso el paisaje más bello se disfruta mejor después de comer" },
        literal: { en: "Even Geumgangsan mountain is for after eating" },
      },
    },
  },

  /* ── Minho (Ch3 — trendy / modern slang) ───────────────────────────────── */
  idiom_minho_1: {
    npc: "minho",
    chapter: "ch3",
    situation: "Reacting to Rudy's detective skills",
    idiom: {
      en: {
        expression: "That's fire!",
        meaning: { ko: "대박이다!", es: "¡Está genial!" },
      },
      es: {
        expression: "¡Mola!",
        meaning: { ko: "대박이다!", en: "That's awesome!" },
      },
      ko: {
        expression: "ㄹㅇ 대박",
        meaning: { en: "Literally awesome", es: "Literalmente genial" },
        literal: { en: "Real big success" },
      },
    },
  },

  /* ── Miss Penny (Ch1/Ch4 — literary / formal) ─────────────────────────── */
  idiom_penny_1: {
    npc: "miss_penny",
    chapter: "ch1",
    situation: "Hinting at the deeper mystery",
    idiom: {
      en: {
        expression: "The plot thickens",
        meaning: { ko: "사건이 복잡해지고 있다", es: "La trama se complica" },
      },
      es: {
        expression: "La cosa se pone interesante",
        meaning: { ko: "상황이 흥미로워지고 있다", en: "Things are getting interesting" },
      },
      ko: {
        expression: "갈수록 태산",
        meaning: { en: "It gets harder as you go", es: "Se pone más difícil a medida que avanzas" },
        literal: { en: "The further you go, the bigger the mountain" },
      },
    },
  },

  /* ── Isabel (Ch2 — passionate Spanish expressions) ─────────────────────── */
  idiom_isabel_1: {
    npc: "isabel",
    chapter: "ch2",
    situation: "Expressing frustration about Carlos being missing",
    idiom: {
      en: {
        expression: "I couldn't care less about danger",
        meaning: { ko: "위험 따위 상관없어", es: "Me importa un pepino el peligro" },
      },
      es: {
        expression: "¡Me importa un pepino!",
        meaning: { ko: "난 상관없어!", en: "I couldn't care less!" },
        literal: { ko: "오이만큼도 상관없어!", en: "I care about it as much as a cucumber!" },
      },
      ko: {
        expression: "눈 하나 깜짝 안 해",
        meaning: { en: "Doesn't bat an eye", es: "No pestañea" },
        literal: { en: "Doesn't blink one eye" },
      },
    },
  },

  /* ── Mr. Black (Ch4/Ch5 — dark, powerful, multilingual) ────────────────── */
  idiom_black_1: {
    npc: "mr_black",
    chapter: "ch4",
    situation: "Taunting Rudy about the futility of his mission",
    idiom: {
      en: {
        expression: "Knowledge is power",
        meaning: { ko: "아는 것이 힘이다", es: "El saber es poder" },
      },
      es: {
        expression: "El saber es poder",
        meaning: { ko: "아는 것이 힘이다", en: "Knowledge is power" },
      },
      ko: {
        expression: "아는 것이 힘이다",
        meaning: { en: "Knowledge is power", es: "El saber es poder" },
      },
    },
  },
};

/* ─────────────────── STORY DATA ─────────────────── */

const STORIES: Record<string, Story> = {

  /* ════════════════ CHAPTER 1: LONDON ════════════════ */
  london: {
    id: "london",
    title: "The London Cipher",
    titleKo: "런던의 암호",
    titleEs: "El Cifrado de Londres",
    gradient: ["#1a0a05", "#2c1810", "#1a0a05"],
    accentColor: C.gold,
    nextChapterId: "madrid",
    /* ── Language Ratio: 30% targetLang / 70% nativeLang ──────────────────────
     * CEFR A1 — absolute beginner. User has completed Day 1-6.
     * NPC dialogue should be MOSTLY in nativeLang (Korean/Spanish) with only
     * the learned expressions appearing in English (the target language).
     *
     * Narration scenes (isNarration: true) are always 100% nativeLang — no change.
     * NPC dialogue scenes use textKoMix/textEsMix when available to deliver
     * the mixed-language experience.
     *
     * The ~30% target-language content should come ONLY from knownExpressions.
     * Complex story dialogue, emotional beats, and plot exposition stay in
     * the user's native language so they can follow the story.
     */
    chapterMeta: {
      cefrLevel: "A1",
      targetLangRatio: 30,
      knownExpressions: [
        "Hello", "Goodbye", "Nice to meet you", "My name is ___",
        "I'm from ___", "Where is ___?", "How much?",
        "Thank you", "I don't understand", "Help", "Yes", "No",
      ],
      languageNote:
        "Ch1 dialogue textKoMix/textEsMix should be ~70% native language " +
        "with ~30% English (targetLang) using ONLY the knownExpressions above. " +
        "Narration stays 100% native. Puzzle prompts/hints stay as-is.",
    },
    characters: [
      {
        id: "lingo",
        emoji: "🦊",
        name: "Rudy",
        nameKo: "루디",
        side: "left",
        avatarBg: "#2c1810",
        isLingo: true,
      },
      {
        id: "tom",
        emoji: "👮",
        name: "Tom",
        nameKo: "톰",
        side: "right",
        avatarBg: "#1E2A3A",
      },
      {
        id: "ellis",
        emoji: "👩‍🔬",
        name: "Dr. Ellis",
        nameKo: "엘리스 박사",
        side: "right",
        avatarBg: "#2A1A3A",
      },
      {
        id: "mr_black",
        emoji: "🕴️",
        name: "Mr. Black",
        nameKo: "미스터 블랙",
        side: "right",
        avatarBg: "#0A0A0A",
      },
    ],
    sequence: [
      // ── Scene 1: The Hook ──────────────────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "3:47 AM. Your phone screams. Not a ring — a scream. The kind of sound that means someone already tried calling three times before this. The caller ID says: Eleanor — the curator of the British Museum's Ancient Languages wing.",
        textKo: "새벽 3시 47분. 핸드폰이 비명을 질러. 벨소리가 아니야 — 비명. 이미 세 번이나 전화한 뒤에야 들리는 종류의 소리. 발신자 표시: 엘리너 — 대영박물관 고대 언어관 큐레이터.",
        textEs: "3:47 AM. Tu teléfono grita. No suena — grita. Esa clase de sonido que significa que alguien ya intentó llamar tres veces antes. El identificador dice: Eleanor — la curadora del ala de Lenguas Antiguas del Museo Británico.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Partner! Wake up. Now. Eleanor just called — something happened at the British Museum. Something bad. A linguist named Dr. Ellis was found twenty minutes ago. She's alive, but... she can't speak. Not a single word. Not in English, not in any language. Just silence. Like someone reached into her brain and pulled the plug on language itself.",
        textKo: "파트너! 일어나. 지금 당장. 엘리너한테서 전화가 왔어 — 대영박물관에서 무슨 일이 생겼대. 안 좋은 일. 엘리스 박사라는 언어학자가 20분 전에 발견됐어. 살아 있긴 한데... 말을 못 해. 단어 하나도. 영어로도, 어떤 언어로도 안 돼. 그냥 침묵. 마치 누군가 뇌에 손을 넣어서 언어의 플러그를 뽑아버린 것처럼.",
        textKoMix: "파트너! 일어나. 지금 당장. 엘리너한테서 전화가 왔어 — 대영박물관에서 무슨 일이 생겼대. 안 좋은 일. 엘리스 박사라는 언어학자가 20분 전에 발견됐어. 살아 있긴 한데... 말을 못 해. No — 단어 하나도 안 돼. 그냥 침묵. Help도 못 해. 마치 누군가 언어의 플러그를 뽑아버린 것처럼.",
        textEs: "¡Compañero! Despierta. Ahora. Eleanor acaba de llamar — algo pasó en el Museo Británico. Algo malo. Una lingüista llamada Dra. Ellis fue encontrada hace veinte minutos. Está viva, pero... no puede hablar. Ni una palabra. Ni en inglés, ni en ningún idioma. Solo silencio. Como si alguien entrara en su cerebro y desconectara el lenguaje.",
        textEsMix: "¡Compañero! Despierta. Ahora. Eleanor acaba de llamar — algo pasó en el Museo Británico. Algo malo. Una lingüista llamada Dra. Ellis fue encontrada hace veinte minutos. Está viva, pero... no puede hablar. No — ni una palabra. Solo silencio. Help tampoco puede decir. Como si alguien desconectara el lenguaje.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "And partner — the Guardian Stone is gone. You know, the relic Eleanor protects in the Ancient Languages wing? The one they say holds the power to erase languages from human memory? Yeah. That one. Gone. Witnesses saw a man in a black coat leaving the building. No rush. No running. Just... walking out like he owned the place.",
        textKo: "그리고 파트너 — 수호석이 사라졌어. 알지, 엘리너가 고대 언어관에서 보호하던 유물? 인간의 기억에서 언어를 지울 수 있는 힘을 가졌다는 그것 말이야. 응. 그거. 사라졌어. 목격자들이 검은 코트를 입은 남자가 건물을 나가는 걸 봤대. 서두르지도 않고. 뛰지도 않고. 그냥... 자기 집인 것처럼 걸어 나갔대.",
        textEs: "Y compañero — la Piedra Guardiana desapareció. Ya sabes, la reliquia que Eleanor protege en el ala de Lenguas Antiguas. La que dicen que tiene el poder de borrar idiomas de la memoria humana. Sí. Esa. Desapareció. Testigos vieron a un hombre con abrigo negro saliendo del edificio. Sin prisa. Sin correr. Solo... caminando como si fuera el dueño del lugar.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Get dressed. We're going to the museum. I know it's the middle of the night and I know you just started learning. But that's exactly why I need you. Whoever did this is playing a game with language — and I need someone with fresh eyes. Someone who's still learning the basics. Trust me, that's going to matter. I'll explain on the way.",
        textKo: "옷 입어. 박물관으로 가자. 한밤중인 거 알고, 방금 공부 시작한 것도 알아. 하지만 그래서 네가 필요한 거야. 이걸 한 놈은 언어를 가지고 게임을 하고 있어 — 나한테는 신선한 눈이 필요해. 아직 기초를 배우고 있는 사람. 날 믿어, 그게 중요해질 거야. 가면서 설명할게.",
        textEs: "Vístete. Vamos al museo. Sé que es de madrugada y sé que recién empezaste a aprender. Pero por eso te necesito. Quien hizo esto está jugando con el lenguaje — y necesito a alguien con ojos frescos. Alguien que todavía esté aprendiendo lo básico. Créeme, eso va a importar. Te explico en el camino.",
      },
      // ── Scene 2: The Museum Entrance ──────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(4:30 AM. The British Museum. Police tape flutters in the cold wind. The building is dark except for emergency lights. A young security guard stands at the entrance, arms crossed, jaw clenched. He looks like he's been awake for twelve hours and angry for all of them.)",
        textKo: "(새벽 4시 30분. 대영박물관. 차가운 바람에 경찰 테이프가 펄럭인다. 비상등 외에는 건물이 어둡다. 젊은 경비원이 입구에 서 있다. 팔짱을 끼고, 이를 악물고. 12시간째 깨어 있으면서 내내 화가 나 있는 것 같다.)",
        textEs: "(4:30 AM. El Museo Británico. La cinta policial ondea con el viento frío. El edificio está oscuro excepto por las luces de emergencia. Un joven guardia de seguridad está en la entrada, brazos cruzados, mandíbula apretada. Parece que lleva doce horas despierto y enfadado durante todas ellas.)",
      },
      {
        kind: "scene",
        charId: "tom",
        text: "Oi. Museum's closed, yeah? Crime scene. No visitors, no press, no exceptions. I don't care if you're the Queen's cousin — nobody gets past me tonight. So who are you, then?",
        textKo: "야. 박물관 닫았어, 알겠지? 범죄 현장이야. 방문객도 안 돼, 기자도 안 돼, 예외 없어. 여왕 사촌이래도 상관없어 — 오늘 밤엔 아무도 나를 지나갈 수 없어. 그래서 누구야, 넌?",
        textKoMix: "야. 박물관 닫았어, 알겠지? No visitors, no exceptions. 여왕 사촌이래도 상관없어 — 오늘 밤엔 아무도 못 지나가. My name is Tom. 그래서 넌 누구야?",
        textEs: "Oye. El museo está cerrado, ¿vale? Escena del crimen. No visitantes, no prensa, sin excepciones. Me da igual si eres primo de la Reina — nadie pasa esta noche. ¿Así que quién eres?",
        textEsMix: "Oye. El museo está cerrado, ¿vale? No visitors, no exceptions. Me da igual si eres primo de la Reina — nadie pasa esta noche. My name is Tom. ¿Así que quién eres?",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Psst. Partner — before we talk to Tom, let's review some key words first. Greetings, introductions, basic phrases. If we know the vocabulary, the conversation will go smoothly.)",
        textKo: "(쉿. 파트너 — 톰에게 말하기 전에 먼저 핵심 단어들을 복습하자. 인사, 자기소개, 기초 표현들. 어휘를 알면 대화가 수월할 거야.)",
        textEs: "(Psst. Compañero — antes de hablar con Tom, repasemos algunas palabras clave primero. Saludos, presentaciones, frases básicas. Si conocemos el vocabulario, la conversación será más fácil.)",
      },
      {
        kind: "puzzle",
        puzzleNum: 1,
        pType: "word-match",
        tprsStage: 1,
        targetExpressions: ["Hello", "Goodbye", "Where is ___?", "I am a ___"],
        previouslyLearned: [],
        speakAfter: true,
        storyReason: "Tom is testing whether you understand basic phrases before letting you into the crime scene.",
        storyConsequence: "Tom lets you through. The investigation begins.",
        onFail: { addToWeakExpressions: ["Hello", "Goodbye"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            word: { en: "Hello", ko: "안녕하세요", es: "Hola" },
            meaning: { en: "a greeting when you meet someone", ko: "누군가를 만날 때 하는 인사", es: "un saludo cuando conoces a alguien" },
            wrong: [
              { en: "a farewell when leaving", ko: "떠날 때 하는 작별 인사", es: "una despedida al irse" },
              { en: "an apology for a mistake", ko: "실수에 대한 사과", es: "una disculpa por un error" },
              { en: "a request for help", ko: "도움 요청", es: "una petición de ayuda" },
            ],
          },
          {
            word: { en: "Goodbye", ko: "안녕히 계세요", es: "Adiós" },
            meaning: { en: "a farewell, said when leaving", ko: "떠날 때 하는 작별 인사", es: "una despedida, dicha al irse" },
            wrong: [
              { en: "a greeting when arriving", ko: "도착할 때 하는 인사", es: "un saludo al llegar" },
              { en: "an expression of thanks", ko: "감사 표현", es: "una expresión de agradecimiento" },
              { en: "asking for directions", ko: "길을 묻는 것", es: "pedir direcciones" },
            ],
          },
          {
            word: { en: "Where is...?", ko: "어디에 있어요...?", es: "¿Dónde está...?" },
            meaning: { en: "asking about a location or place", ko: "장소나 위치를 묻는 표현", es: "preguntar sobre un lugar o ubicación" },
            wrong: [
              { en: "asking about someone's name", ko: "누군가의 이름을 묻는 것", es: "preguntar el nombre de alguien" },
              { en: "asking about the time", ko: "시간을 묻는 것", es: "preguntar la hora" },
              { en: "asking about someone's job", ko: "직업을 묻는 것", es: "preguntar el trabajo de alguien" },
            ],
          },
          {
            word: { en: "I am a...", ko: "저는...입니다", es: "Soy un/una..." },
            meaning: { en: "stating your job or role", ko: "직업이나 역할을 말하는 것", es: "decir tu trabajo o rol" },
            wrong: [
              { en: "saying where you live", ko: "사는 곳을 말하는 것", es: "decir dónde vives" },
              { en: "asking how someone is feeling", ko: "누군가의 기분을 묻는 것", es: "preguntar cómo se siente alguien" },
              { en: "saying thank you", ko: "감사하다고 말하는 것", es: "dar las gracias" },
            ],
          },
        ],
        hints: {
          h1: { ko: "런던에서 배운 단어들이야 — 인사, 작별, 위치, 직업", en: "These are words you learned in London — greeting, farewell, location, job", es: "Estas son palabras que aprendiste en Londres — saludo, despedida, lugar, trabajo" },
          h2: { ko: "톰에게 했던 자기소개와 범죄 현장에서 들은 단어들이야", en: "Words from your self-introduction to Tom and clues from the crime scene", es: "Palabras de tu presentación a Tom y pistas de la escena del crimen" },
          h3: { ko: "Hello=인사 / Goodbye=작별 / Where is=장소 질문 / I am a=직업 말하기", en: "Hello=greeting / Goodbye=farewell / Where is=location question / I am a=stating job", es: "Hola=saludo / Adiós=despedida / Dónde está=pregunta de lugar / Soy un=decir trabajo" },
        },
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Good — now you know the key words. Time to use them with Tom. He's not going to let us in unless we answer his questions. Pick the right responses — show him we belong here.)",
        textKo: "(좋아 — 이제 핵심 단어들을 알았지. 톰에게 써먹을 차례야. 질문에 대답하지 않으면 안 들여보내줄 거야. 올바른 대답을 골라 — 우리가 여기 있을 이유가 있다는 걸 보여줘.)",
        textEs: "(Bien — ahora conoces las palabras clave. Es hora de usarlas con Tom. No nos dejará pasar a menos que respondamos sus preguntas. Elige las respuestas correctas — demuestra que pertenecemos aquí.)",
      },
      {
        kind: "puzzle",
        puzzleNum: 2,
        pType: "dialogue-choice",
        tprsStage: 2,
        targetExpressions: ["Nice to meet you", "I don't understand", "Can you say that again?"],
        previouslyLearned: ["Hello", "Goodbye", "Where is ___?", "I am a ___"],
        speakAfter: true,
        storyReason: "Eleanor is speaking quickly about the stolen stone. Choose the right response to get more information.",
        storyConsequence: "Eleanor reveals the cipher found at the crime scene.",
        onFail: { addToWeakExpressions: ["Nice to meet you", "I don't understand"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            prompt: { en: "Tom asks: 'Who are you?' How do you greet him?", ko: "톰이 묻는다: '넌 누구야?' 어떻게 인사할까?", es: "Tom pregunta: '¿Quién eres?' ¿Cómo lo saludas?" },
            context: { en: "You need to make a good first impression on the guard.", ko: "경비원에게 좋은 첫인상을 남겨야 한다.", es: "Necesitas causar una buena primera impresión al guardia." },
            answer: { en: "Hello! My name is... Nice to meet you.", ko: "안녕하세요! 제 이름은... 만나서 반갑습니다.", es: "¡Hola! Mi nombre es... Mucho gusto." },
            wrong: [
              { en: "Goodbye! I don't understand!", ko: "안녕히 계세요! 이해 못 해요!", es: "¡Adiós! ¡No entiendo!" },
              { en: "Sorry! Where is the exit?", ko: "죄송합니다! 출구가 어디예요?", es: "¡Perdón! ¿Dónde está la salida?" },
            ],
          },
          {
            prompt: { en: "Tom asks: 'Where are you from?'", ko: "톰이 묻는다: '어디서 왔어?'", es: "Tom pregunta: '¿De dónde eres?'" },
            context: { en: "Tell him where you're from to build trust.", ko: "어디서 왔는지 말해서 신뢰를 쌓아야 한다.", es: "Dile de dónde eres para generar confianza." },
            answer: { en: "I'm from... I am here to help with the investigation.", ko: "저는...에서 왔습니다. 수사를 도우러 왔어요.", es: "Soy de... Estoy aquí para ayudar con la investigación." },
            wrong: [
              { en: "I'm fine, thank you. How are you?", ko: "잘 지내요, 감사합니다. 어떻게 지내세요?", es: "Estoy bien, gracias. ¿Cómo estás?" },
              { en: "Goodbye! See you tomorrow!", ko: "안녕히 계세요! 내일 봐요!", es: "¡Adiós! ¡Nos vemos mañana!" },
            ],
          },
          {
            prompt: { en: "Tom asks: 'What do you do? What's your job?'", ko: "톰이 묻는다: '뭐하는 사람이야? 직업이 뭐야?'", es: "Tom pregunta: '¿A qué te dedicas? ¿Cuál es tu trabajo?'" },
            context: { en: "Tell him your role to prove you belong here.", ko: "여기 있을 이유가 있다는 걸 증명하기 위해 역할을 말해야 한다.", es: "Dile tu rol para probar que perteneces aquí." },
            answer: { en: "I am a detective's partner. I work with Rudy.", ko: "저는 탐정의 파트너입니다. 루디와 일해요.", es: "Soy compañero del detective. Trabajo con Rudy." },
            wrong: [
              { en: "I am a tourist. Where is the gift shop?", ko: "저는 관광객이에요. 기념품 가게가 어디예요?", es: "Soy turista. ¿Dónde está la tienda de regalos?" },
              { en: "I don't understand. Please help.", ko: "이해 못 해요. 도와주세요.", es: "No entiendo. Por favor ayuda." },
            ],
          },
        ],
        hints: {
          h1: { ko: "자기소개를 해야 해 — 이름, 출신, 직업. 기초 표현들을 써봐", en: "You need to introduce yourself — name, origin, job. Use basic phrases", es: "Necesitas presentarte — nombre, origen, trabajo. Usa frases básicas" },
          h2: { ko: "Hello로 시작, I'm from...으로 출신 말하기, I am a...로 직업 말하기", en: "Start with Hello, use I'm from... for origin, I am a... for job", es: "Empieza con Hola, usa Soy de... para el origen, Soy un... para el trabajo" },
          h3: { ko: "Q1: Hello + My name is / Q2: I'm from... / Q3: I am a detective's partner", en: "Q1: Hello + My name is / Q2: I'm from... / Q3: I am a detective's partner", es: "P1: Hola + Mi nombre es / P2: Soy de... / P3: Soy compañero del detective" },
        },
      },
      {
        kind: "scene",
        charId: "tom",
        text: "Huh. Alright then. Didn't expect that, to be honest. Most people who show up at 4 AM can't even string a sentence together. You lot? Not bad. Not bad at all. Go on in, then. Break a leg, mate!",
        textKo: "흠. 그래. 솔직히 예상 못 했어. 새벽 4시에 나타나는 사람들 대부분은 문장도 제대로 못 만들거든. 너희? 나쁘지 않아. 전혀. 들어가, 그럼. Break a leg, mate!",
        textKoMix: "흠. 솔직히 예상 못 했어. 새벽 4시에 나타나는 사람들 대부분은 문장도 못 만들거든. 너희? Not bad. 전혀. 들어가, 그럼. Goodbye는 아직 아니야 — Break a leg, mate!",
        textEs: "Hmm. Vale entonces. No me lo esperaba, la verdad. La mayoría de los que aparecen a las 4 AM ni pueden armar una frase. ¿Ustedes? Nada mal. Nada mal. Pasen, entonces. Break a leg, mate!",
        textEsMix: "Hmm. Vale entonces. No me lo esperaba, la verdad. La mayoría que aparecen a las 4 AM ni pueden armar una frase. ¿Ustedes? Not bad. Nada mal. Pasen, entonces. Goodbye todavía no — Break a leg, mate!",
        idiomRef: "idiom_tom_1",
      },
      {
        kind: "clue",
        symbol: "🎭",
        titleEn: "Investigation Notes: Good Luck Around the World",
        titleKo: "수사 노트: 세계의 행운 표현",
        titleEs: "Notas de Investigación: Buena Suerte en el Mundo",
        descEn: "Tom said 'Break a leg!' — a British theatre superstition. Saying 'good luck' directly is considered bad luck, so actors say the opposite instead. Every culture has its own way to wish someone well without saying it directly. Language is full of these hidden meanings.",
        descKo: "톰이 'Break a leg!'이라고 했어 — 영국 극장의 미신이야. '행운을 빌어'라고 직접 말하면 불운하다고 여겨서, 배우들은 반대로 말해. 모든 문화에는 직접 말하지 않고 행운을 비는 고유한 표현이 있어. 언어에는 이런 숨겨진 의미가 가득해.",
        descEs: "Tom dijo 'Break a leg!' — una superstición del teatro británico. Decir 'buena suerte' directamente se considera mala suerte, así que los actores dicen lo contrario. Cada cultura tiene su propia forma de desear suerte sin decirlo directamente. El lenguaje está lleno de estos significados ocultos.",
      },
      // ── Scene 3: The Crime Scene ──────────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Inside the museum. Emergency lights cast long shadows across the marble floors. The Ancient Languages wing is behind police tape. In the center of the room: an empty display case. The glass isn't broken. The lock isn't forced. The Guardian Stone simply isn't there anymore, as if it decided to leave.)",
        textKo: "(박물관 내부. 비상등이 대리석 바닥 위로 긴 그림자를 드리운다. 고대 언어관이 경찰 테이프 뒤에 있다. 방 한가운데: 빈 진열장. 유리는 깨지지 않았다. 자물쇠도 강제로 열리지 않았다. 수호석이 그냥 사라졌다, 마치 스스로 떠나기로 한 것처럼.)",
        textEs: "(Dentro del museo. Las luces de emergencia proyectan sombras largas sobre los pisos de mármol. El ala de Lenguas Antiguas está detrás de la cinta policial. En el centro de la sala: una vitrina vacía. El vidrio no está roto. La cerradura no fue forzada. La Piedra Guardiana simplemente ya no está, como si decidiera irse.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Dr. Ellis sits on a bench near the case. A blanket around her shoulders. She stares at nothing. Her lips move but no sound comes out. A paramedic crouches beside her, helpless. Twenty years of research into ancient languages, and now she can't produce a single syllable.)",
        textKo: "(엘리스 박사가 진열장 근처 벤치에 앉아 있다. 어깨에 담요를 두르고. 아무것도 보지 않는 눈으로 응시한다. 입술이 움직이지만 소리는 나지 않는다. 구급대원이 옆에 쭈그리고 앉아 있다, 속수무책으로. 20년간 고대 언어를 연구해온 사람이, 이제 음절 하나도 만들어내지 못한다.)",
        textEs: "(La Dra. Ellis está sentada en un banco cerca de la vitrina. Una manta sobre sus hombros. Mira a la nada. Sus labios se mueven pero no sale ningún sonido. Un paramédico está agachado a su lado, impotente. Veinte años investigando lenguas antiguas, y ahora no puede producir una sola sílaba.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Something about Ellis's expression when Rudy mentions the black coat. She recognised something. She knows the person who did this.)",
        textKo: "(엘리스 박사의 표정에서 뭔가 보여. 루디가 검은 코트를 언급했을 때. 그녀가 뭔가를 알아본 것 같아. 이 일을 한 사람을 알고 있어.)",
        textEs: "(Algo en la expresión de la Dra. Ellis cuando Rudy menciona el abrigo negro. Reconoció algo. Conoce a la persona que hizo esto.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Partner. Look at her. That's what the Guardian Stone can do. Or rather, that's what someone who knows how to use it can do. Steal a person's ability to speak. Every language, gone. Like it was never there. We need to find out what happened before this gets worse.",
        textKo: "파트너. 저 분을 봐. 수호석이 할 수 있는 일이야. 정확히는, 그걸 쓸 줄 아는 누군가가 할 수 있는 일. 말하는 능력을 빼앗는 거야. 모든 언어가, 사라진 거야. 처음부터 없었던 것처럼. 상황이 더 나빠지기 전에 무슨 일이 있었는지 알아내야 해.",
        textKoMix: "파트너. 저 분을 봐. 수호석이 할 수 있는 일이야. 말하는 능력을 빼앗는 거야. 모든 언어가, 사라진 거야. No — Hello도, Goodbye도, Thank you도 — 아무것도 안 남았어. Help가 필요해. 무슨 일이 있었는지 알아내야 해.",
        textEs: "Compañero. Mírala. Eso es lo que la Piedra Guardiana puede hacer. O mejor dicho, lo que alguien que sabe usarla puede hacer. Robar la capacidad de hablar de una persona. Cada idioma, desaparecido. Como si nunca hubiera existido. Necesitamos averiguar qué pasó antes de que esto empeore.",
        textEsMix: "Compañero. Mírala. Eso es lo que la Piedra Guardiana puede hacer. Robar la capacidad de hablar. Cada idioma, desaparecido. No — ni Hello, ni Goodbye, ni Thank you — nada queda. Necesitamos Help. Averigüemos qué pasó antes de que empeore.",
      },
      // ── Scene 4: The Threat ────────────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Tom pulls up the security footage on his phone. Grainy black and white. A figure in a long black coat moves through the museum with impossible confidence. He doesn't sneak. He doesn't hide. He walks like a man browsing an art gallery. Then, just before leaving, he stops. He turns to the camera. And he looks directly into the lens.)",
        textKo: "(톰이 핸드폰으로 보안 영상을 보여준다. 거칠고 흑백인 화면. 긴 검은 코트를 입은 인물이 믿을 수 없는 자신감으로 박물관을 이동한다. 몰래 다니지 않는다. 숨지 않는다. 미술관을 구경하는 사람처럼 걷는다. 그리고 나가기 직전, 멈춘다. 카메라를 향해 돈다. 렌즈를 똑바로 바라본다.)",
        textEs: "(Tom saca las grabaciones de seguridad en su teléfono. Imagen granulada en blanco y negro. Una figura con un largo abrigo negro se mueve por el museo con una confianza imposible. No se esconde. No se escabulle. Camina como quien pasea por una galería de arte. Entonces, justo antes de irse, se detiene. Se gira hacia la cámara. Y mira directamente al lente.)",
      },
      {
        kind: "scene",
        charId: "tom",
        text: "See that? He looked RIGHT at the camera. He KNEW it was there. Most thieves avoid cameras. This bloke? He posed for one. Like he wanted us to see his face. Except — you can't actually see his face. Just the coat and the smile. Gives me the creeps, mate.",
        textKo: "저거 봤어? 카메라를 정면으로 봤어. 카메라가 있는 걸 알았던 거야. 대부분의 도둑들은 카메라를 피해. 이 놈은? 포즈를 취했어. 자기 얼굴을 보여주고 싶었던 것처럼. 근데 — 사실 얼굴은 안 보여. 코트랑 미소만 보여. 소름 돋아, 진짜.",
        textKoMix: "저거 봤어? 카메라를 정면으로 봤어. 카메라가 있는 걸 알았던 거야. 대부분의 도둑들은 카메라를 피해. 이 놈은? 포즈를 취했어. I don't understand — 왜 자기 얼굴을 보여주고 싶어하는 거야? 근데 얼굴은 안 보여. 코트랑 미소만. 소름 돋아.",
        textEs: "¿Ves eso? Miró DIRECTO a la cámara. SABÍA que estaba ahí. La mayoría de los ladrones evitan las cámaras. ¿Este tipo? Posó para una. Como si quisiera que viéramos su cara. Pero — en realidad no puedes ver su cara. Solo el abrigo y la sonrisa. Me pone los pelos de punta.",
        textEsMix: "¿Ves eso? Miró DIRECTO a la cámara. SABÍA que estaba ahí. La mayoría de los ladrones evitan las cámaras. ¿Este tipo? Posó para una. I don't understand — ¿por qué querría que viéramos su cara? Pero no puedes ver su cara. Solo el abrigo y la sonrisa. Me pone los pelos de punta.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Rudy spots something else. On the floor where the stone used to sit — a single playing card. The Ace of Spades. Someone has written on it in red ink. One word: MADRID.)",
        textKo: "(루디가 다른 것을 발견한다. 수호석이 있던 바닥 위에 — 카드 한 장. 스페이드 에이스. 누군가 빨간 잉크로 적었다. 단어 하나: MADRID.)",
        textEs: "(Rudy nota algo más. En el piso donde solía estar la piedra — una sola carta de juego. El As de Espadas. Alguien ha escrito en ella con tinta roja. Una palabra: MADRID.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Madrid. He left us a destination. The Ace of Spades — in card games, it's the death card. The highest card in the deck. He's telling us two things at once: where he's going, and that he thinks he's already won. Cocky. Very cocky.",
        textKo: "마드리드. 목적지를 남겨줬네. 스페이드 에이스 — 카드 게임에서 죽음의 카드야. 덱에서 가장 높은 카드. 두 가지를 동시에 말하고 있어: 어디로 가는지, 그리고 이미 이겼다고 생각한다는 것. 건방져. 아주 건방져.",
        textEs: "Madrid. Nos dejó un destino. El As de Espadas — en los juegos de cartas, es la carta de la muerte. La carta más alta de la baraja. Nos dice dos cosas a la vez: adónde va, y que cree que ya ganó. Arrogante. Muy arrogante.",
      },
      // ── Writing Mission: Record Evidence ──────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Rudy pulls out a notebook. Before going further, he wants you to write down the key phrases from the crime scene — names, greetings, anything that might be a clue. A good detective always documents the evidence.)",
        textKo: "(루디가 수첩을 꺼낸다. 더 진행하기 전에, 범죄 현장의 핵심 표현들을 적어두길 원해 — 이름, 인사, 단서가 될 수 있는 것들. 좋은 탐정은 항상 증거를 기록하지.)",
        textEs: "(Rudy saca una libreta. Antes de continuar, quiere que escribas las frases clave de la escena del crimen — nombres, saludos, cualquier cosa que pueda ser una pista. Un buen detective siempre documenta la evidencia.)",
      },
      {
        kind: "puzzle",
        puzzleNum: 3,
        pType: "writing-mission",
        tprsStage: 3,
        targetExpressions: ["Hello, my name is ___", "Nice to meet you"],
        previouslyLearned: ["Hello", "Goodbye", "Where is ___?", "I am a ___", "Nice to meet you", "I don't understand", "Can you say that again?"],
        speakAfter: true,
        storyReason: "Write down key evidence phrases for your detective notebook.",
        storyConsequence: "Your notes help decode part of the cipher message.",
        onFail: { addToWeakExpressions: ["Hello, my name is ___", "Nice to meet you"], reviewInDailyCourse: true, reviewDays: 3 },
        title: { en: "Record the Evidence", ko: "증거 기록하기", es: "Registrar la Evidencia" },
        context: { en: "Write down the key phrases from the investigation. A good detective documents everything!", ko: "수사에서 나온 핵심 표현들을 적어봐. 좋은 탐정은 모든 걸 기록해!", es: "Escribe las frases clave de la investigación. ¡Un buen detective documenta todo!" },
        questions: [
          { word: { en: "Hello, my name is Rudy.", ko: "안녕하세요, 제 이름은 루디예요.", es: "Hola, me llamo Rudy." }, hint: { en: "Start with a greeting and your name", ko: "인사로 시작하고 이름을 말하세요", es: "Empieza con un saludo y tu nombre" }, acceptableAnswers: ["hello my name is rudy", "hi my name is rudy", "hello i am rudy", "hi i'm rudy"] },
          { word: { en: "Nice to meet you.", ko: "만나서 반갑습니다.", es: "Mucho gusto." }, hint: { en: "A polite phrase when meeting someone", ko: "누군가를 만날 때 쓰는 예의 바른 표현", es: "Una frase cortés al conocer a alguien" }, acceptableAnswers: ["nice to meet you", "pleased to meet you", "good to meet you"] },
        ],
      },
      // ── Scene 5: Decoding the Message ─────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Rudy notices something on the floor near the display case. A torn piece of paper. It must have fallen from the thief's pocket — or been left on purpose. The handwriting is careful, deliberate. This wasn't dropped by accident.)",
        textKo: "(루디가 진열장 근처 바닥에서 뭔가를 발견한다. 찢어진 종이 한 장. 도둑의 주머니에서 떨어졌거나 — 일부러 남긴 것이다. 필체가 정성스럽고 의도적이다. 실수로 떨어뜨린 게 아니다.)",
        textEs: "(Rudy nota algo en el piso cerca de la vitrina. Un trozo de papel rasgado. Debió caerse del bolsillo del ladrón — o fue dejado a propósito. La escritura es cuidadosa, deliberada. Esto no se cayó por accidente.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Well, well. Our thief left a note. How polite. Let me see... some words are smudged. Faded out. It's a message, but with gaps — missing words. Like a puzzle with pieces knocked out. Partner — whoever did this WANTS us to read it. This is either a trap or an invitation. Honestly? Probably both.",
        textKo: "이런, 이런. 우리 도둑이 쪽지를 남겼네. 참 예의 바르지. 어디 보자... 단어 일부가 번져 있어. 흐릿해졌어. 메시지인데, 빈칸이 있어 — 빠진 단어들. 조각이 빠진 퍼즐처럼. 파트너 — 이걸 한 사람은 우리가 읽기를 원해. 이건 함정이거나 초대장이야. 솔직히? 아마 둘 다.",
        textKoMix: "이런. 우리 도둑이 쪽지를 남겼네. 어디 보자... 단어 일부가 번져 있어. Hello... My name is... Goodbye... 빈칸이 있는 메시지야. 파트너 — 이걸 한 사람은 우리가 읽기를 원해. 함정이거나 초대장이야. 아마 둘 다.",
        textEs: "Vaya, vaya. Nuestro ladrón dejó una nota. Qué educado. A ver... algunas palabras están borrosas. Desvanecidas. Es un mensaje, pero con huecos — palabras faltantes. Como un rompecabezas al que le faltan piezas. Compañero — quien hizo esto QUIERE que lo leamos. Es una trampa o una invitación. ¿Sinceramente? Probablemente ambas.",
        textEsMix: "Vaya. Nuestro ladrón dejó una nota. A ver... algunas palabras están borrosas. Hello... My name is... Goodbye... Un mensaje con huecos. Compañero — quien hizo esto QUIERE que lo leamos. Es una trampa o una invitación. Probablemente ambas.",
      },
      {
        kind: "clue",
        symbol: "📄",
        titleEn: "Investigation Notes: The Thief's Message",
        titleKo: "수사 노트: 도둑의 메시지",
        titleEs: "Notas de Investigación: El Mensaje del Ladrón",
        descEn: "A torn piece of paper found at the crime scene. The words are written in careful handwriting but some are smudged. The vocabulary is surprisingly simple — basic greetings and introductions. Why would a thief capable of stealing a priceless relic write like a beginner? Unless the simplicity IS the message.",
        descKo: "범죄 현장에서 발견된 찢어진 종이. 단어들은 정성스러운 필체로 쓰여 있지만 일부가 번져 있다. 어휘가 놀라울 정도로 단순하다 — 기초 인사와 자기소개. 값을 매길 수 없는 유물을 훔칠 수 있는 도둑이 왜 초급 학생처럼 글을 쓸까? 단순함 자체가 메시지가 아니라면.",
        descEs: "Un trozo de papel rasgado encontrado en la escena del crimen. Las palabras están escritas con caligrafía cuidadosa pero algunas están borrosas. El vocabulario es sorprendentemente simple — saludos básicos y presentaciones. ¿Por qué un ladrón capaz de robar una reliquia invaluable escribiría como un estudiante principiante? A menos que la simplicidad SEA el mensaje.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Alright partner, let's crack this. The words on the paper — they're all basic phrases. Greetings, introductions, saying where you're from. Our thief wrote a self-introduction... but some words are missing. Like a language exercise with blanks. Help me fill in the gaps. Let's figure out who we're dealing with.",
        textKo: "좋아 파트너, 이거 풀어보자. 종이 위의 단어들 — 전부 기초 표현이야. 인사, 자기소개, 출신 말하기. 도둑이 자기소개를 썼는데... 일부 단어가 빠져 있어. 빈칸이 있는 언어 연습문제처럼. 빈칸을 채워줘. 우리 상대가 누구인지 알아내자.",
        textEs: "Bien compañero, descifremos esto. Las palabras en el papel — son todas frases básicas. Saludos, presentaciones, decir de dónde eres. Nuestro ladrón escribió una autopresentación... pero faltan palabras. Como un ejercicio de idioma con espacios en blanco. Ayúdame a completar los huecos. Averiguemos con quién estamos lidiando.",
      },
      {
        kind: "puzzle",
        puzzleNum: 4,
        pType: "fill-blank",
        tprsStage: 4,
        targetExpressions: ["My name is ___", "I'm from ___", "Where is ___?"],
        previouslyLearned: ["Hello", "Goodbye", "Where is ___?", "I am a ___", "Nice to meet you", "I don't understand", "Can you say that again?", "Hello, my name is ___"],
        speakAfter: true,
        storyReason: "The cipher has missing words. Fill in the blanks to decode it.",
        storyConsequence: "The decoded message reveals Miss Penny's involvement.",
        onFail: { addToWeakExpressions: ["My name is ___", "Where is ___?"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            sentence: { en: "___, detective.", ko: "___, 탐정님.", es: "___, detective." },
            answer: { en: "Hello", ko: "안녕하세요", es: "Hola" },
            opts: [
              { en: "Goodbye", ko: "안녕히", es: "Adiós" },
              { en: "Sorry", ko: "죄송합니다", es: "Perdón" },
            ],
            hints: {
              h1: { ko: "인사를 시작하는 단어야", en: "A word that starts a greeting", es: "Una palabra que inicia un saludo" },
              h2: { ko: "누군가를 처음 만날 때 하는 첫 마디", en: "The first word when meeting someone", es: "La primera palabra al conocer a alguien" },
              h3: { ko: "Hello = 안녕하세요", en: "Hello — the most basic greeting", es: "Hola — el saludo más básico" },
            },
          },
          {
            sentence: { en: "My ___ is Mr. Black.", ko: "제 ___은 미스터 블랙입니다.", es: "Mi ___ es Mr. Black." },
            answer: { en: "name", ko: "이름", es: "nombre" },
            opts: [
              { en: "friend", ko: "친구", es: "amigo" },
              { en: "job", ko: "직업", es: "trabajo" },
            ],
            hints: {
              h1: { ko: "자기소개를 할 때 쓰는 단어야", en: "A word you use when introducing yourself", es: "Una palabra para presentarte" },
              h2: { ko: "'My ___ is...' — 이름을 말할 때 쓰는 표현", en: "'My ___ is...' — the phrase for telling your name", es: "'Mi ___ es...' — la frase para decir tu nombre" },
              h3: { ko: "name = 이름 / 'My name is Mr. Black'", en: "name — 'My name is Mr. Black'", es: "nombre — 'Mi nombre es Mr. Black'" },
            },
          },
          {
            sentence: { en: "___, London.", ko: "___, 런던.", es: "___, Londres." },
            answer: { en: "Goodbye", ko: "안녕히", es: "Adiós" },
            opts: [
              { en: "Hello", ko: "안녕하세요", es: "Hola" },
              { en: "Thank you", ko: "감사합니다", es: "Gracias" },
            ],
            hints: {
              h1: { ko: "떠날 때 하는 말이야", en: "What you say when leaving", es: "Lo que dices al irte" },
              h2: { ko: "미스터 블랙이 런던을 떠나면서 한 마지막 인사", en: "Mr. Black's farewell as he left London", es: "La despedida de Mr. Black al irse de Londres" },
              h3: { ko: "Goodbye = 안녕히 / 작별 인사", en: "Goodbye — farewell greeting", es: "Adiós — saludo de despedida" },
            },
          },
        ],
        hints: {
          h1: { ko: "미스터 블랙의 메시지는 기초 자기소개야 — 인사, 이름, 작별", en: "Mr. Black's message is a basic self-introduction — greeting, name, farewell", es: "El mensaje de Mr. Black es una autopresentación básica — saludo, nombre, despedida" },
          h2: { ko: "Hello → My name is → Goodbye 순서의 자기소개", en: "Hello → My name is → Goodbye — a self-introduction", es: "Hola → Mi nombre es → Adiós — una autopresentación" },
          h3: { ko: "1: Hello (인사) / 2: name (이름) / 3: Goodbye (작별)", en: "1: Hello (greeting) / 2: name (identity) / 3: Goodbye (farewell)", es: "1: Hola (saludo) / 2: nombre (identidad) / 3: Adiós (despedida)" },
        },
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "You got it. Listen to this: 'Hello, detective. My name is Mr. Black. I'm from everywhere. How are you? Goodbye, London.' He introduced himself. Like a student in lesson one. But perfect grammar, three languages. He's not a beginner — he's MOCKING beginners. He's mocking US. And the worst part? 'Goodbye, London' means he's already gone.",
        textKo: "해냈어. 이거 들어봐: '안녕하세요, 탐정. 제 이름은 미스터 블랙입니다. 저는 모든 곳에서 왔어요. 어떻게 지내세요? 안녕히 계세요, 런던.' 자기소개를 했어. 첫 수업 학생처럼. 하지만 완벽한 문법, 세 개 언어. 초보자가 아니야 — 초보자를 조롱하고 있어. 우리를 조롱하는 거야. 최악인 건? '안녕히 계세요, 런던'은 이미 떠났다는 뜻이야.",
        textKoMix: "해냈어. 들어봐: 'Hello, detective. My name is Mr. Black. I'm from everywhere. Goodbye, London.' 자기소개를 했어. 첫 수업 학생처럼. 하지만 완벽한 문법, 세 개 언어. 초보자가 아니야 — 초보자를 조롱하고 있어. 최악인 건? 'Goodbye, London'은 이미 떠났다는 뜻이야.",
        textEs: "Lo lograste. Escucha esto: 'Hola, detective. Mi nombre es Mr. Black. Soy de todas partes. ¿Cómo estás? Adiós, Londres.' Se presentó. Como un estudiante en la lección uno. Pero gramática perfecta, tres idiomas. No es principiante — se está BURLANDO de los principiantes. Se burla de NOSOTROS. ¿Y lo peor? 'Adiós, Londres' significa que ya se fue.",
        textEsMix: "Lo lograste. Escucha esto: 'Hello, detective. My name is Mr. Black. I'm from everywhere. Goodbye, London.' Se presentó. Como un estudiante en la lección uno. Pero gramática perfecta, tres idiomas. No es principiante — se está BURLANDO de los principiantes. ¿Y lo peor? 'Goodbye, London' significa que ya se fue.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "The pieces are coming together. Mr. Black stole the London Guardian Stone. He silenced Dr. Ellis — probably as a demonstration. He left his name, a playing card marked 'Madrid,' and a self-introduction written in beginner vocabulary. He's heading to Madrid. And he wants us to follow.",
        textKo: "퍼즐이 맞춰지고 있어. 미스터 블랙이 런던 수호석을 훔쳤어. 엘리스 박사의 목소리를 빼앗았어 — 아마 시범으로. 자기 이름을 남기고, '마드리드'라고 적힌 카드를 남기고, 초급 어휘로 자기소개를 남겼어. 마드리드로 향하고 있어. 그리고 우리가 따라오길 원해.",
        textEs: "Las piezas se están juntando. Mr. Black robó la Piedra Guardiana de Londres. Silenció a la Dra. Ellis — probablemente como demostración. Dejó su nombre, una carta marcada 'Madrid,' y una autopresentación escrita en vocabulario de principiante. Se dirige a Madrid. Y quiere que lo sigamos.",
      },
      {
        kind: "clue",
        symbol: "🃏",
        titleEn: "Investigation Notes: The Madrid Stone",
        titleKo: "수사 노트: 마드리드 석",
        titleEs: "Notas de Investigación: La Piedra de Madrid",
        descEn: "Rudy's deduction: If the London Guardian Stone was the first target, Madrid must be next. The Ace of Spades card is both a taunt and a map. Mr. Black isn't hiding — he's inviting pursuit. Why? What does he gain from being followed? Unless collecting the stones requires someone else to be there.",
        descKo: "루디의 추론: 런던 수호석이 첫 번째 목표였다면, 마드리드가 다음이다. 스페이드 에이스 카드는 도발이자 지도다. 미스터 블랙은 숨지 않는다 — 추격을 초대하고 있다. 왜? 쫓기면 뭐가 좋은 거지? 돌을 모으려면 다른 사람이 있어야 하는 게 아닐까.",
        descEs: "Deducción de Rudy: Si la Piedra Guardiana de Londres fue el primer objetivo, Madrid debe ser el siguiente. La carta del As de Espadas es una provocación y un mapa. Mr. Black no se esconde — está invitando a la persecución. ¿Por qué? ¿Qué gana siendo perseguido? A menos que recolectar las piedras requiera que alguien más esté ahí.",
      },
      // ── Scene 6: The Cliffhanger ──────────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(You're about to leave the museum when it happens. Dr. Ellis — silent, broken, staring-at-nothing Dr. Ellis — suddenly grabs your arm. Her grip is iron. Her eyes are wide and wild. And for one impossible moment, she speaks.)",
        textKo: "(박물관을 나가려는 순간 그것이 일어난다. 엘리스 박사 — 침묵하고, 부서지고, 허공을 응시하던 엘리스 박사가 — 갑자기 네 팔을 붙잡는다. 쇠처럼 세게. 눈이 크게 뜨여 있고 거칠다. 그리고 불가능한 한 순간, 그녀가 말한다.)",
        textEs: "(Estás a punto de salir del museo cuando sucede. La Dra. Ellis — silenciosa, rota, mirando-a-la-nada Dra. Ellis — de repente agarra tu brazo. Su agarre es de hierro. Sus ojos están abiertos y salvajes. Y por un momento imposible, habla.)",
      },
      {
        kind: "scene",
        charId: "ellis",
        text: "He said... there are SIX stones. London was just the first. He said... when he has all six... no one will speak again. No one. Ever.",
        textKo: "그가 말했어... 돌이 여섯 개래. 런던은 첫 번째일 뿐이래. 그가 말했어... 여섯 개를 모두 모으면... 아무도 다시 말하지 못할 거래. 아무도. 영원히.",
        textKoMix: "그가 말했어... 돌이 여섯 개래. 런던은 첫 번째일 뿐이래. 여섯 개를 모두 모으면... no one will speak again. No. 아무도. 영원히.",
        textEs: "Él dijo... que hay SEIS piedras. Londres fue solo la primera. Dijo... que cuando tenga las seis... nadie volverá a hablar. Nadie. Nunca.",
        textEsMix: "Él dijo... que hay SEIS piedras. Londres fue solo la primera. Cuando tenga las seis... no one will speak again. No. Nadie. Nunca.",
      },
      {
        kind: "scene",
        charId: "ellis",
        text: "The method. I know the method. Eleanor and I... we trained someone. Twenty years ago. We gave him every technique we knew. I didn't know we were teaching him how to steal.",
        textKo: "이 방법. 이 방법을 알아요. 엘리너와 나... 우리가 어떤 사람을 가르쳤어요. 20년 전에. 우리가 아는 모든 기술을 가르쳐줬어요. 그게 훔치는 방법을 가르치는 건지 몰랐어요.",
        textKoMix: "이 방법. 이 방법을 알아요. 엘리너와 나... 우리가 어떤 사람을 가르쳤어요. 20년 전에. 모든 기술을 가르쳐줬어요. I don't understand — 그게 훔치는 방법을 가르치는 건지 몰랐어요.",
        textEs: "El método. Conozco el método. Eleanor y yo... entrenamos a alguien. Hace veinte años. Le dimos todas las técnicas que sabíamos. No supimos que le estábamos enseñando a robar.",
        textEsMix: "El método. Conozco el método. Eleanor y yo... entrenamos a alguien. Hace veinte años. Le dimos todas las técnicas. I don't understand — no supimos que le estábamos enseñando a robar.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Then silence again. Dr. Ellis's hand falls from your arm. Her eyes go blank. The moment is over. She's gone back to wherever Mr. Black sent her. But that name — Eleanor. The curator who called us tonight. She trained the person who did this.)",
        textKo: "(그리고 다시 침묵. 엘리스 박사의 손이 팔에서 떨어진다. 눈이 다시 텅 빈다. 순간이 끝났다. 미스터 블랙이 보낸 곳으로 다시 돌아갔다. 하지만 그 이름 — 엘리너. 오늘 밤 우리에게 전화한 큐레이터. 이 일을 한 사람을 그녀가 가르쳤다.)",
        textEs: "(Luego silencio otra vez. La mano de la Dra. Ellis cae de tu brazo. Sus ojos quedan vacíos. El momento terminó. Volvió a donde Mr. Black la envió. Pero ese nombre — Eleanor. La curadora que nos llamó esta noche. Ella entrenó a la persona que hizo esto.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Six Guardian Stones. Six languages. If he collects them all... Partner, you heard her. This isn't about one stolen relic anymore. This is about every language on Earth. Every word anyone has ever spoken or will ever speak. And right now, Mr. Black has a head start and we have a playing card that says Madrid. So. Are you coming?",
        textKo: "돌이 여섯 개. 언어가 여섯 개. 전부 모으면... 파트너, 들었지. 이건 더 이상 유물 하나가 도난당한 것이 아니야. 지구상의 모든 언어에 관한 거야. 누구든 지금까지 말했거나 앞으로 말할 모든 단어. 그리고 지금, 미스터 블랙은 앞서 있고 우리에게는 마드리드라고 적힌 카드 한 장이 있어. 그래서. 갈 거야?",
        textKoMix: "돌이 여섯 개. 언어가 여섯 개. 전부 모으면... 파트너, 들었지. Hello, Goodbye, Thank you, My name is — 모든 단어가 사라져. 지금, 미스터 블랙은 앞서 있고 우리에게는 마드리드라고 적힌 카드 한 장이 있어. Help가 필요해. 그래서. 갈 거야?",
        textEs: "Seis piedras. Seis idiomas. Si las reúne todas... Compañero, la escuchaste. Esto ya no es sobre una reliquia robada. Es sobre cada idioma en la Tierra. Cada palabra que alguien haya dicho o dirá jamás. Y ahora mismo, Mr. Black nos lleva ventaja y nosotros tenemos una carta que dice Madrid. Entonces. ¿Vienes?",
        textEsMix: "Seis piedras. Seis idiomas. Si las reúne todas... Compañero, la escuchaste. Hello, Goodbye, Thank you, My name is — cada palabra desaparecerá. Ahora mismo, Mr. Black nos lleva ventaja y tenemos una carta que dice Madrid. Necesitamos Help. Entonces. ¿Vienes?",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Next Chapter: The Madrid Disappearance — People are losing their words.)",
        textKo: "(다음 챕터: 마드리드의 실종 — 사람들이 말을 잃고 있다.)",
        textEs: "(Siguiente Capítulo: La Desaparición de Madrid — La gente está perdiendo sus palabras.)",
      },
    ],
  },

  /* ════════════════ CHAPTER 2: MADRID ════════════════ */
  madrid: {
    id: "madrid",
    title: "The Madrid Disappearance",
    titleKo: "마드리드의 실종",
    titleEs: "La Desaparición de Madrid",
    gradient: ["#1A0500", "#3A0A0A", "#6B1A10"],
    accentColor: C.gold,
    nextChapterId: "seoul",
    /* ── Language Ratio: 50% targetLang / 50% nativeLang ──────────────────────
     * CEFR A1-A2 — late beginner. User has completed Day 1-18.
     * NPC dialogue should be roughly HALF nativeLang and HALF targetLang.
     * The learned expressions from Day 1-18 appear in English; the rest is native.
     * TODO: Add textKoMix/textEsMix to key NPC dialogue lines for this chapter.
     */
    chapterMeta: {
      cefrLevel: "A1",
      targetLangRatio: 50,
      knownExpressions: [
        "Hello", "Goodbye", "Nice to meet you", "My name is ___",
        "I'm from ___", "Where is ___?", "How much?",
        "Thank you", "I don't understand", "Help", "Yes", "No",
        "Excuse me", "I'm sorry", "Can you repeat that?",
        "I need ___", "Do you speak ___?", "How do you say ___?",
      ],
      languageNote:
        "Ch2 dialogue should be ~50% native language / ~50% English (targetLang). " +
        "Current textKo/textEs are 100% translated — textKoMix/textEsMix not yet added. " +
        "The 50/50 split should use knownExpressions from Day 1-18.",
    },
    characters: [
      {
        id: "lingo",
        emoji: "🦊",
        name: "Detective Rudy",
        nameKo: "루디 탐정",
        side: "left",
        avatarBg: "#2c1810",
        isLingo: true,
      },
      {
        id: "isabel",
        emoji: "💃",
        name: "Isabel",
        nameKo: "이사벨",
        side: "right",
        avatarBg: "#3A1A0A",
      },
      {
        id: "miguel",
        emoji: "🥬",
        name: "Don Miguel",
        nameKo: "돈 미겔",
        side: "right",
        avatarBg: "#2A1A0A",
      },
      {
        id: "carlos",
        emoji: "🎭",
        name: "Carlos",
        nameKo: "카를로스",
        side: "left",
        avatarBg: "#1A1A2A",
      },
      {
        id: "mr_black",
        emoji: "🕴️",
        name: "Mr. Black",
        nameKo: "미스터 블랙",
        side: "right",
        avatarBg: "#0A0A0A",
      },
    ],
    sequence: [
      // ── Scene 1: Madrid Arrival ────────────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Madrid Barajas Airport. Spanish sunshine instead of London fog. Rudy still chewing on his London failure — Mr. Black was right there and he missed him. He steps through the arrival gate, and a woman in a red jacket blocks his path. Eyes like fire.)",
        textKo: "(마드리드 바라하스 공항. 런던의 안개 대신 스페인의 햇살. 루디는 아직 런던에서의 실패를 씹고 있다 — 미스터 블랙이 코앞에 있었는데 놓쳤다. 도착 게이트를 나서자마자, 빨간 재킷을 입은 여자가 가로막는다. 눈이 불꽃 같다.)",
        textEs: "(Aeropuerto de Madrid Barajas. Sol español en lugar de niebla londinense. Rudy aún mastica su fracaso en Londres — Mr. Black estaba ahí mismo y se le escapó. En cuanto cruza la puerta de llegadas, una mujer con chaqueta roja le bloquea el paso. Ojos como fuego.)",
      },
      {
        kind: "scene",
        charId: "isabel",
        text: "Are you the fox detective? You're late. Also, you're shorter than I expected.",
        textKo: "당신이 여우 탐정이야? 늦었어. 그리고 생각보다 키가 작네.",
        textEs: "¿Eres el detective zorro? Llegas tarde. Además, eres más bajito de lo que esperaba.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "I'm average height, thank you very much. You must be Isabel. Carlos's colleague — the one who called Eleanor.",
        textKo: "평균 신장이거든, 정말 감사해요. 당신이 이사벨이겠지. 카를로스의 동료 — 엘리너한테 연락한 사람.",
        textEs: "Soy de estatura promedio, muchas gracias. Debes ser Isabel. La colega de Carlos — la que llamó a Eleanor.",
      },
      {
        kind: "scene",
        charId: "isabel",
        text: "Eleanor said you were funny. She was wrong. Listen, detective — Carlos disappeared three nights ago from the Prado. He was restoring a medieval fresco. I got his call at ten o'clock. He was screaming.",
        textKo: "엘리너가 재밌는 사람이라고 했는데. 틀렸네. 들어, 탐정 — 카를로스가 3일 전에 프라도에서 사라졌어. 중세 프레스코화를 복원하고 있었어. 밤 10시에 전화가 왔어. 소리를 지르고 있었어.",
        textEs: "Eleanor dijo que eras gracioso. Se equivocó. Escucha, detective — Carlos desapareció hace tres noches del Prado. Estaba restaurando un fresco medieval. Me llamó a las diez. Estaba gritando.",
        idiomRef: "idiom_isabel_1",
      },
      {
        kind: "scene",
        charId: "isabel",
        text: "Simple words. Not in Spanish. Not in English. Things like 'Hello! Help! Where is the door? Please! Sorry!' — basic phrases, like a textbook. In a language I didn't recognize. Over and over. Then the line went dead.",
        textKo: "간단한 단어들. 스페인어가 아니었어. 영어도 아니고. '안녕하세요! 도와주세요! 문이 어디예요? 제발! 죄송합니다!' — 교과서 같은 기초 표현을. 내가 모르는 언어로. 계속 반복하다가, 전화가 끊겼어.",
        textEs: "Palabras simples. No en español. Tampoco en inglés. Cosas como '¡Hola! ¡Ayuda! ¿Dónde está la puerta? ¡Por favor! ¡Perdón!' — frases básicas, como de libro. En un idioma que no reconocí. Una y otra vez. Luego se cortó la línea.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Basic phrases. Hello, help, where is, please, sorry. The same vocabulary from Day One. Something stripped away his Spanish, his English — and left him with nothing but the basics. Someone did this to him on purpose.)",
        textKo: "(기초 표현들. 안녕, 도와주세요, 어디에, 제발, 미안해요. 1일차 어휘들. 무언가가 그의 스페인어, 영어를 벗겨갔어 — 그리고 기초 단어만 남겨놓은 거야. 누군가가 의도적으로 이걸 한 거야.)",
        textEs: "(Frases básicas. Hola, ayuda, dónde está, por favor, perdón. El vocabulario del Día Uno. Algo le quitó su español, su inglés — y le dejó solo lo básico. Alguien le hizo esto a propósito.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Isabel wrote down every word Carlos screamed — but the words don't make sense yet. Before we can talk to anyone, we need to learn the key vocabulary first. Match each word to its meaning.)",
        textKo: "(이사벨이 카를로스가 외친 모든 단어를 적어뒀다 — 하지만 아직 뜻이 통하지 않아. 누구와 대화하기 전에 먼저 핵심 단어들을 배워야 해. 각 단어를 뜻과 매칭해봐.)",
        textEs: "(Isabel anotó cada palabra que Carlos gritó — pero aún no tienen sentido. Antes de hablar con alguien, necesitamos aprender el vocabulario clave primero. Relaciona cada palabra con su significado.)",
      },
      {
        kind: "puzzle",
        puzzleNum: 1,
        pType: "word-match",
        tprsStage: 1,
        targetExpressions: ["How much?", "Delicious!", "Thank you", "Goodbye"],
        previouslyLearned: ["Hello", "Goodbye", "Nice to meet you", "My name is ___", "Where is ___?"],
        speakAfter: true,
        storyReason: "Match the market phrases Don Miguel is teaching you — you'll need them to find Carlos.",
        storyConsequence: "Don Miguel gives you a clue about where Carlos was last seen.",
        onFail: { addToWeakExpressions: ["How much?", "Delicious!"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            word: { en: "How much is this?", ko: "이거 얼마예요?", es: "¿Cuánto cuesta esto?" },
            meaning: { en: "asking the price of something", ko: "무언가의 가격을 묻는 것", es: "preguntar el precio de algo" },
            wrong: [
              { en: "asking where someone is from", ko: "출신을 묻는 것", es: "preguntar de dónde es alguien" },
              { en: "ordering food at a restaurant", ko: "식당에서 음식을 주문하는 것", es: "pedir comida en un restaurante" },
              { en: "saying hello to a friend", ko: "친구에게 인사하는 것", es: "saludar a un amigo" },
            ],
          },
          {
            word: { en: "delicious", ko: "맛있는", es: "delicioso" },
            meaning: { en: "very good tasting food", ko: "음식 맛이 매우 좋은", es: "comida de muy buen sabor" },
            wrong: [
              { en: "a type of language", ko: "언어의 종류", es: "un tipo de idioma" },
              { en: "very expensive", ko: "매우 비싼", es: "muy caro" },
              { en: "a notebook page", ko: "노트 한 페이지", es: "una página de cuaderno" },
            ],
          },
          {
            word: { en: "goodbye", ko: "안녕히 계세요", es: "adiós" },
            meaning: { en: "what you say when you are leaving", ko: "떠날 때 하는 말", es: "lo que dices cuando te vas" },
            wrong: [
              { en: "what you say when you arrive", ko: "도착할 때 하는 말", es: "lo que dices cuando llegas" },
              { en: "a question about location", ko: "위치에 관한 질문", es: "una pregunta sobre ubicación" },
              { en: "an apology", ko: "사과", es: "una disculpa" },
            ],
          },
        ],
        hints: {
          h1: {
            ko: "카를로스가 외친 단어들이야 — 시장에서 쓰는 기본 표현들을 생각해봐",
            en: "These are the words Carlos screamed — think about basic market expressions",
            es: "Estas son las palabras que Carlos gritó — piensa en expresiones básicas del mercado",
            byLearning: {
              spanish: { ko: "스페인어 시장 표현: ¿Cuánto cuesta?, delicioso, adiós", en: "Spanish market phrases: ¿Cuánto cuesta?, delicioso, adiós", es: "Frases del mercado en español: ¿Cuánto cuesta?, delicioso, adiós" },
              korean:  { ko: "한국어 기본 표현: 얼마예요?, 맛있는, 안녕히 계세요", en: "Korean basic phrases: 얼마예요?, 맛있는, 안녕히 계세요", es: "Frases básicas en coreano: 얼마예요?, 맛있는, 안녕히 계세요" },
            },
          },
          h2: {
            ko: "가격을 묻고, 음식 맛을 표현하고, 작별 인사하는 표현들이야",
            en: "Expressions for asking prices, describing food taste, and saying farewell",
            es: "Expresiones para preguntar precios, describir sabor y despedirse",
            byLearning: {
              spanish: { ko: "'¿Cuánto cuesta?'=가격 묻기, 'delicioso'=맛있는, 'adiós'=작별", en: "'¿Cuánto cuesta?'=asking price, 'delicioso'=tasty, 'adiós'=farewell", es: "'¿Cuánto cuesta?'=precio, 'delicioso'=sabroso, 'adiós'=despedida" },
              korean:  { ko: "'얼마예요?'=가격 묻기, '맛있는'=delicious, '안녕히 계세요'=작별", en: "'얼마예요?'=asking price, '맛있는'=tasty, '안녕히 계세요'=farewell", es: "'얼마예요?'=precio, '맛있는'=sabroso, '안녕히 계세요'=despedida" },
            },
          },
          h3: {
            ko: "How much is this?=가격 묻기 / delicious=맛있는 / goodbye=작별 인사",
            en: "How much is this?=asking price / delicious=tasty / goodbye=farewell",
            es: "How much is this?=preguntar precio / delicious=sabroso / goodbye=despedida",
            byLearning: {
              spanish: { ko: "¿Cuánto cuesta esto?=가격 / delicioso=맛 / adiós=작별", en: "¿Cuánto cuesta esto?=price / delicioso=taste / adiós=farewell", es: "¿Cuánto cuesta esto?=precio / delicioso=sabor / adiós=despedida" },
              korean:  { ko: "이거 얼마예요?=가격 / 맛있는=맛 / 안녕히 계세요=작별", en: "이거 얼마예요?=price / 맛있는=taste / 안녕히 계세요=farewell", es: "이거 얼마예요?=precio / 맛있는=sabor / 안녕히 계세요=despedida" },
            },
          },
        },
      },
      {
        kind: "scene",
        charId: "carlos",
        text: "*shown in a memory flashback* Isabella… escúchame. El lenguaje es poder. They took my words. If you find this… follow the ∆LX. Find the truth. *memory fades*",
        textKo: "*기억 회상 속에서 보인다* 이사벨라… 들어줘. 언어는 힘이야. 그들이 내 말들을 빼앗아 갔어. 이걸 찾으면… ∆LX를 따라가. 진실을 찾아. *기억이 사라진다*",
        textEs: "*se muestra en un flashback de memoria* Isabella… escúchame. El lenguaje es poder. Tomaron mis palabras. Si encuentras esto… sigue el ∆LX. Encuentra la verdad. *la memoria se desvanece*",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "He wasn't speaking a foreign language, Isabel. He was speaking in the only language he had left. Something stripped away his Spanish, his English, everything — and left him with nothing but Day One vocabulary. Someone did this to him on purpose.",
        textKo: "이사벨, 그가 외국어를 말한 게 아니야. 그에게 남은 유일한 언어를 말한 거야. 무언가가 그의 스페인어, 영어, 전부를 벗겨갔어 — 그리고 1일차 기초 단어만 남겨놓은 거야. 누군가가 의도적으로 이걸 한 거야.",
        textEs: "No estaba hablando un idioma extranjero, Isabel. Estaba hablando en el único idioma que le quedaba. Algo le quitó su español, su inglés, todo — y le dejó solo con vocabulario del Día Uno. Alguien le hizo esto a propósito.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "A week ago I would have said that's impossible. But a week ago I didn't know about magic stones that protect language — or a man who says 'thank you' after stealing them. Take me to the Prado. Now.",
        textKo: "일주일 전이었으면 불가능하다고 했을 거야. 하지만 일주일 전에는 언어를 보호하는 마법석이나, 수호석을 훔치고 '감사합니다'라고 말하는 남자에 대해 몰랐으니까. 프라도로 데려다줘. 지금.",
        textEs: "Hace una semana habría dicho que es imposible. Pero hace una semana no sabía sobre piedras mágicas que protegen el lenguaje — ni sobre un hombre que dice 'gracias' después de robarlas. Llévame al Prado. Ahora.",
      },
      // ── Scene 2: Don Miguel's Market ──────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(On the way to the Prado, Isabel detours through San Miguel Market. 'There's someone you need to meet first. Don Miguel. Forty years in this market. He sees everything, knows everyone.' An old man arranges tomatoes behind a small stall. His smile is warm, but worry lives in his eyes.)",
        textKo: "(프라도로 가는 길에 이사벨이 산 미겔 시장으로 우회한다. '먼저 만나야 할 사람이 있어. 돈 미겔. 이 시장에서 40년. 모든 것을 보고, 모든 사람을 알아.' 노인이 작은 가판대 뒤에서 토마토를 정리한다. 미소가 따뜻하지만, 눈에 걱정이 서려 있다.)",
        textEs: "(De camino al Prado, Isabel desvía por el Mercado de San Miguel. 'Hay alguien que necesitas conocer primero. Don Miguel. Cuarenta años en este mercado. Lo ve todo, conoce a todos.' Un anciano ordena tomates detrás de un pequeño puesto. Su sonrisa es cálida, pero la preocupación vive en sus ojos.)",
      },
      {
        kind: "scene",
        charId: "miguel",
        text: "Isabel! And this must be the famous detective. Welcome! Please, sit. Are you hungry? Of course you're hungry — you're in Madrid! Nobody leaves my stall hungry. That's my one rule.",
        textKo: "이사벨! 이분이 유명한 탐정이로구나. 환영해! 자, 앉아. 배고프지? 당연히 배고프겠지 — 마드리드에 왔으니까! 아무도 내 가판대에서 배고프게 보내지 않아. 그게 내 유일한 규칙이야.",
        textEs: "¡Isabel! Y este debe ser el famoso detective. ¡Bienvenido! Por favor, siéntate. ¿Tienes hambre? ¡Claro que tienes hambre — estás en Madrid! Nadie se va de mi puesto con hambre. Esa es mi única regla.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Good — you know the key words now. Time to use them with Don Miguel. He won't share information until you greet him and order properly. Use the vocabulary you just learned.)",
        textKo: "(좋아 — 이제 핵심 단어들을 알았지. 돈 미겔에게 써먹을 차례야. 제대로 인사하고 주문하기 전에는 정보를 공유하지 않을 거야. 방금 배운 어휘를 사용해봐.)",
        textEs: "(Bien — ahora conoces las palabras clave. Es hora de usarlas con Don Miguel. No compartirá información hasta que lo saludes y pidas correctamente. Usa el vocabulario que acabas de aprender.)",
      },
      {
        kind: "puzzle",
        puzzleNum: 2,
        pType: "dialogue-choice",
        tprsStage: 2,
        targetExpressions: ["Please", "Thank you", "Excuse me", "I need help"],
        previouslyLearned: ["Hello", "Goodbye", "Nice to meet you", "Where is ___?", "How much?", "Delicious!", "Thank you"],
        speakAfter: true,
        storyReason: "Isabel is upset about Carlos. Choose the right words to calm her and get information.",
        storyConsequence: "Isabel agrees to help you navigate the backstreets.",
        onFail: { addToWeakExpressions: ["Please", "Thank you"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            prompt: { en: "Don Miguel is waiting. How do you greet him and order?", ko: "돈 미겔이 기다리고 있어. 어떻게 인사하고 주문할까?", es: "Don Miguel espera. ¿Cómo le saludas y pides?" },
            context: { en: "Don Miguel: 'What would you like? I have bread, ham, and the best coffee in Madrid.'", ko: "돈 미겔: '뭐 드릴까요? 빵, 하몽, 마드리드 최고의 커피가 있어요.'", es: "Don Miguel: '¿Qué le pongo? Tengo pan, jamón y el mejor café de Madrid.'" },
            answer: { en: "Good morning! I would like coffee, please. How much is it?", ko: "좋은 아침이에요! 커피 주세요. 얼마예요?", es: "¡Buenos días! Me pone un café, por favor. ¿Cuánto es?" },
            wrong: [
              { en: "Hello. I don't want food. Tell me about Carlos.", ko: "안녕하세요. 음식은 필요없어요. 카를로스에 대해 말해줘요.", es: "Hola. No quiero comida. Cuénteme sobre Carlos." },
              { en: "Sorry, I'm not hungry. Can we talk now?", ko: "죄송해요, 배가 안 고파요. 지금 얘기할 수 있을까요?", es: "Lo siento, no tengo hambre. ¿Podemos hablar ahora?" },
            ],
          },
          {
            prompt: { en: "Don Miguel looks pleased. He offers food too.", ko: "돈 미겔이 흡족해한다. 음식도 권한다.", es: "Don Miguel parece complacido. También ofrece comida." },
            context: { en: "Don Miguel: 'Good! And food? You need to eat something. Yes or no?'", ko: "돈 미겔: '좋아! 음식은 어때? 뭐 좀 먹어야지. 어때, 먹을래?'", es: "Don Miguel: '¡Bien! ¿Y comida? Necesitas comer algo. ¿Sí o no?'" },
            answer: { en: "Yes, please! The bread with ham. It looks delicious. Thank you!", ko: "네, 주세요! 하몽 빵. 맛있어 보여요. 감사합니다!", es: "¡Sí, por favor! El pan con jamón. Tiene muy buena pinta. ¡Gracias!" },
            wrong: [
              { en: "No thank you. I'm in a hurry.", ko: "아니요 괜찮아요. 급해요.", es: "No gracias. Tengo prisa." },
              { en: "How much is the food? Is it expensive?", ko: "음식이 얼마예요? 비싸요?", es: "¿Cuánto cuesta la comida? ¿Es cara?" },
            ],
          },
        ],
        hints: {
          h1: {
            ko: "정보를 얻으려면 먼저 규칙을 따라야 해 — 제대로 인사하고 주문해봐",
            en: "To get information you must follow his rule — greet and order properly first",
            es: "Para obtener información debes seguir su regla — saluda y pide correctamente primero",
            byLearning: {
              spanish: { ko: "'Buenos días'로 인사하고 'por favor'로 주문해봐", en: "Greet with 'Buenos días' and order with 'por favor'", es: "Saluda con 'Buenos días' y pide con 'por favor'" },
              korean:  { ko: "'좋은 아침이에요'로 인사하고 '주세요'로 주문해봐", en: "Greet with '좋은 아침이에요' and order with '주세요'", es: "Saluda con '좋은 아침이에요' y pide con '주세요'" },
            },
          },
          h2: {
            ko: "예의 바르게: 인사 + please + thank you가 핵심이야",
            en: "Be polite: greeting + please + thank you are key",
            es: "Sé educado: greeting + please + thank you son clave",
            byLearning: {
              spanish: { ko: "Buenos días + por favor + gracias가 핵심이야", en: "Buenos días + por favor + gracias are key", es: "Buenos días + por favor + gracias son clave" },
              korean:  { ko: "좋은 아침 + 주세요 + 감사합니다가 핵심이야", en: "좋은 아침 + 주세요 + 감사합니다 are key", es: "좋은 아침 + 주세요 + 감사합니다 son clave" },
            },
          },
          h3: {
            ko: "'Good morning! ... please. How much is it?' 형식으로 주문해봐",
            en: "Order in the format: 'Good morning! ... please. How much is it?'",
            es: "Pide así: 'Good morning! ... please. How much is it?'",
            byLearning: {
              spanish: { ko: "'¡Buenos días! ... por favor. ¿Cuánto es?' 형식으로 주문해", en: "Order: '¡Buenos días! ... por favor. ¿Cuánto es?'", es: "Pide: '¡Buenos días! ... por favor. ¿Cuánto es?'" },
              korean:  { ko: "'좋은 아침이에요! 커피 주세요. 얼마예요?' 형식으로 주문해", en: "Order: '좋은 아침이에요! 커피 주세요. 얼마예요?'", es: "Pide: '좋은 아침이에요! 커피 주세요. 얼마예요?'" },
            },
          },
        },
      },
      {
        kind: "scene",
        charId: "miguel",
        text: "First, you eat. Then, we talk. In Spain, a conversation without food is like a song without music. Tell me what you want, detective. In my market, you must ask properly.",
        textKo: "먼저 먹어. 그다음 얘기해. 스페인에서 음식 없는 대화는 음악 없는 노래야. 뭘 원하는지 말해봐, 탐정. 내 시장에서는 제대로 주문해야 해.",
        textEs: "Primero, comes. Luego, hablamos. En España, una conversación sin comida es como una canción sin música. Dime qué quieres, detective. En mi mercado, hay que pedir como es debido.",
      },
      {
        kind: "puzzle",
        puzzleNum: 3,
        pType: "writing-mission",
        tprsStage: 3,
        targetExpressions: ["Bread, please", "How much?", "Thank you"],
        previouslyLearned: ["Hello", "Goodbye", "How much?", "Delicious!", "Please", "Excuse me", "I need help"],
        speakAfter: true,
        storyReason: "Practice ordering at the market — you need supplies before the rescue mission.",
        storyConsequence: "Don Miguel slips you a map hidden in the bread wrapper.",
        onFail: { addToWeakExpressions: ["Bread, please", "How much?"], reviewInDailyCourse: true, reviewDays: 3 },
        title: { en: "Order from Don Miguel", ko: "Don Miguel에게 주문하기", es: "Pedir a Don Miguel" },
        context: { en: "Don Miguel won't share information until you order properly. Speak your order!", ko: "Don Miguel은 제대로 주문하기 전에는 정보를 공유하지 않아요. 주문을 말하세요!", es: "Don Miguel no compartirá información hasta que pidas correctamente. ¡Haz tu pedido!" },
        questions: [
          { word: { en: "Bread, please.", ko: "빵 주세요.", es: "Pan, por favor." }, hint: { en: "Order bread politely", ko: "빵을 정중하게 주문하세요", es: "Pide pan con educación" }, acceptableAnswers: ["bread please"] },
          { word: { en: "How much?", ko: "얼마예요?", es: "¿Cuánto?" }, hint: { en: "Ask the price", ko: "가격을 물어보세요", es: "Pregunta el precio" }, acceptableAnswers: ["how much is it", "how much is this"] },
          { word: { en: "Thank you!", ko: "감사합니다!", es: "¡Gracias!" }, hint: { en: "Say thanks", ko: "감사 인사를 하세요", es: "Da las gracias" }, acceptableAnswers: ["thank you", "thanks", "thank you very much"] },
        ],
      },
      {
        kind: "scene",
        charId: "miguel",
        text: "Ha! Not bad, detective. Your accent is terrible but your manners are good. Now... you want to know about Carlos. I'll tell you. But first, I need to tell you something that scares me.",
        textKo: "하! 나쁘지 않아, 탐정. 억양은 끔찍하지만 예절은 좋아. 자... 카를로스에 대해 알고 싶은 거지. 말해줄게. 하지만 먼저, 나를 무섭게 하는 것을 말해야 해.",
        textEs: "¡Ja! Nada mal, detective. Tu acento es terrible pero tus modales son buenos. Ahora... quieres saber de Carlos. Te diré. Pero primero, necesito contarte algo que me asusta.",
      },
      {
        kind: "scene",
        charId: "miguel",
        text: "Yesterday, I forgot how to say 'friend' in Spanish. My own language. Forty years in this market and yesterday — the word just wasn't there. Like someone pulled it out of my head. My neighbor María forgot 'bread.' Eduardo forgot 'open.' As we say — 'No hay mal que por bien no venga.' But I'm struggling to find the silver in this one.",
        textKo: "어제, '친구'라는 단어를 스페인어로 잊어버렸어. 내 모국어를. 40년간 이 시장을 운영했는데 어제 — 단어가 그냥 없었어. 누가 머릿속에서 뽑아간 것처럼. 이웃 마리아도 '빵'을 잊었어. 에두아르도는 '열다'를 잊어서 자기 가게를 못 열었어. 우리가 말하듯이 — '비 온 뒤에 땅이 굳는다'지만, 이번에는 좋은 점을 찾기 힘들어.",
        textEs: "Ayer, olvidé cómo decir 'amigo' en español. Mi propio idioma. Cuarenta años en este mercado y ayer — la palabra simplemente no estaba. Como si alguien la arrancara de mi cabeza. Mi vecina María olvidó 'pan.' Eduardo olvidó 'abrir.' Como decimos — 'No hay mal que por bien no venga.' Pero me cuesta encontrar el bien en esto.",
        idiomRef: "idiom_miguel_1",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(He's forgetting words. Don Miguel — seventy years of daily Spanish — is forgetting simple words. And Carlos was shouting basic phrases before he disappeared. The device isn't just a threat. It's already working here. In Madrid. Right now.)",
        textKo: "(단어를 잊고 있어. 돈 미겔 — 70년간 매일 스페인어를 해온 사람이 — 간단한 단어를 잊고 있어. 그리고 카를로스는 사라지기 전에 기초 표현을 소리치고 있었고. 그 장치는 위협만이 아니야. 이미 여기서 작동하고 있어. 마드리드에서. 지금.)",
        textEs: "(Olvida palabras. Don Miguel — setenta años de español diario — olvida palabras simples. Y Carlos gritaba frases básicas antes de desaparecer. El dispositivo no es solo una amenaza. Ya está funcionando aquí. En Madrid. Ahora mismo.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Don Miguel. The man who took Carlos — did he come through this market? Tall, black coat, speaks perfect everything?",
        textKo: "돈 미겔. 카를로스를 데려간 남자 — 이 시장을 지나간 적 있어요? 키 크고, 검은 코트, 모든 언어를 완벽하게 하는?",
        textEs: "Don Miguel. El hombre que se llevó a Carlos — ¿pasó por este mercado? ¿Alto, abrigo negro, habla todo perfectamente?",
      },
      {
        kind: "scene",
        charId: "miguel",
        text: "He comes every morning. Orders coffee. Pays exactly. Says 'Thank you, good morning' in perfect Spanish. He was here today, detective. Two hours ago. He sat right where you're sitting now.",
        textKo: "매일 아침 와. 커피를 주문해. 정확하게 지불하고. 완벽한 스페인어로 '감사합니다, 좋은 아침이에요'라고 말해. 오늘도 왔어, 탐정. 두 시간 전에. 지금 네가 앉은 바로 그 자리에 앉았어.",
        textEs: "Viene cada mañana. Pide café. Paga exacto. Dice 'Gracias, buenos días' en español perfecto. Estuvo aquí hoy, detective. Hace dos horas. Se sentó exactamente donde tú estás sentado ahora.",
      },
      // ── Scene 3: Retiro Park — Face to Face ───────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Retiro Park. Afternoon sun through the trees. The last place Carlos was seen. Then, across the path — a man. Tall. Silver hair. Impeccably dressed. Writing in a small notebook. That's him. That's Mr. Black. Right there. Twenty meters away.)",
        textKo: "(레티로 공원. 오후의 햇살이 나무 사이로 쏟아진다. 카를로스가 마지막으로 목격된 곳. 그때, 길 건너편에서 — 한 남자. 키가 크다. 은발. 흠잡을 데 없이 차려입었다. 작은 노트에 무언가를 적고 있다. 저 사람이야. 미스터 블랙. 바로 저기. 20미터 앞에서.)",
        textEs: "(Parque del Retiro. Sol de tarde entre los árboles. El último lugar donde vieron a Carlos. Entonces, al otro lado del camino — un hombre. Alto. Pelo plateado. Impecablemente vestido. Escribiendo en una libreta pequeña. Es él. Mr. Black. Justo ahí. A veinte metros.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Before Rudy can move, Mr. Black looks up. Looks directly at him. Smiles. And walks toward him. Slowly. Casually. Like meeting an old friend.)",
        textKo: "(루디가 움직이기도 전에, 미스터 블랙이 고개를 든다. 루디를 정면으로 바라본다. 미소짓는다. 그리고 루디를 향해 걸어온다. 천천히. 여유롭게. 마치 오래된 친구를 만나러 가는 것처럼.)",
        textEs: "(Antes de que Rudy pueda moverse, Mr. Black levanta la vista. Le mira directamente. Sonríe. Y camina hacia él. Lentamente. Con naturalidad. Como encontrarse con un viejo amigo.)",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "Good afternoon, detective. Please, sit. You are looking for Carlos. He is safe. For now.",
        textKo: "안녕하세요, 탐정. 앉아 계세요. 카를로스를 찾고 있죠. 안전해요. 지금은요.",
        textEs: "Buenas tardes, detective. Por favor, siéntese. Busca a Carlos. Está a salvo. Por ahora.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Where is he?",
        textKo: "어디에 있어요?",
        textEs: "¿Dónde está?",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "Number three, Calle del Prado. Third floor. The door is open. I don't lock doors, detective — you already know that about me.",
        textKo: "칼레 델 프라도 3번지. 3층. 문은 열려 있어요. 저는 문을 잠그지 않아요, 탐정 — 이미 아시잖아요.",
        textEs: "Número tres, Calle del Prado. Tercer piso. La puerta está abierta. Yo no cierro puertas, detective — eso ya lo sabe de mí.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Why are you telling me this? Why not just disappear?",
        textKo: "왜 말해주는 거예요? 그냥 사라지면 되잖아요.",
        textEs: "¿Por qué me dices esto? ¿Por qué no simplemente desaparecer?",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "Because Carlos will tell you about the device. And then you will understand. Seven thousand languages. Seven thousand walls between people. I am not the villain of this story, detective. I am the editor. Goodbye.",
        textKo: "카를로스가 장치에 대해 말해줄 거니까요. 그러면 이해하게 될 거예요. 7천 개의 언어. 7천 개의 벽. 저는 이 이야기의 악당이 아니에요, 탐정. 편집자예요. 안녕히 계세요.",
        textEs: "Porque Carlos le contará sobre el dispositivo. Y entonces entenderá. Siete mil idiomas. Siete mil muros entre personas. No soy el villano de esta historia, detective. Soy el editor. Adiós.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Mr. Black turns. Doesn't look back. Writes something in his notebook as he walks. Disappears into the tree shadows of Retiro Park. Rudy's hands are shaking. He just told me where Carlos is. No threats, no demands. He called himself an 'editor.' He didn't sound insane. That's the part that scares me.)",
        textKo: "(미스터 블랙이 돌아선다. 뒤도 돌아보지 않는다. 노트에 무언가를 적으며 걸어간다. 레티로 공원의 나무 그늘로 사라진다. 루디의 손이 떨린다. 카를로스가 어디 있는지 말해줬어. 위협도, 요구도 없이. 자기를 '편집자'라고 했어. 미친 것처럼 들리지 않았어. 그게 무서운 점이야.)",
        textEs: "(Mr. Black se da la vuelta. No mira atrás. Escribe algo en su libreta mientras camina. Desaparece entre las sombras de los árboles del Retiro. Las manos de Rudy tiemblan. Me dijo dónde está Carlos. Sin amenazas, sin demandas. Se llamó a sí mismo 'editor.' No sonó como loco. Esa es la parte que me asusta.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Later that night. Isabel sends a voice message. Three words: 'They got Juan.' Juan — her brother. The one who saw Mr. Black at the market. He had 40 words this morning. Now he has three. 'I. Don't. Remember.' This isn't a chess game anymore.)",
        textKo: "(그날 밤 늦게. 이사벨에게서 음성 메시지가 와. 단어 세 개: '후안이 당했어.' 후안 — 그녀의 남동생. 시장에서 미스터 블랙을 본 사람. 오늘 아침에 40개의 단어를 갖고 있었어. 지금은 세 개야. '나. 기억. 없어.' 이제 체스 게임이 아니야.)",
        textEs: "(Más tarde esa noche. Isabel manda un mensaje de voz. Tres palabras: 'Se llevaron a Juan.' Juan — su hermano. El que vio a Mr. Black en el mercado. Esta mañana tenía 40 palabras. Ahora tiene tres. 'Yo. No. Recuerdo.' Esto ya no es un juego de ajedrez.)",
      },
      {
        kind: "clue",
        symbol: "📓",
        titleEn: "Mr. Black's Torn Notebook Page",
        titleKo: "미스터 블랙의 찢어진 노트 페이지",
        titleEs: "Página Arrancada del Cuaderno de Mr. Black",
        descEn: "Numbers and words scrambled: '7000 — walls — goodbye — hello — editor — Calle del Prado 3.' Left deliberately. He wanted to be understood.",
        descKo: "숫자와 단어가 뒤섞여 있다: '7000 — 벽 — 안녕히 계세요 — 안녕하세요 — 편집자 — 칼레 델 프라도 3.' 의도적으로 남겨둔 것이다. 이해받길 원했다.",
        descEs: "Números y palabras mezclados: '7000 — muros — adiós — hola — editor — Calle del Prado 3.' Dejado deliberadamente. Quería ser entendido.",
      },
      {
        kind: "puzzle",
        puzzleNum: 4,
        pType: "sentence-builder",
        tprsStage: 3,
        targetExpressions: ["I need to find ___", "Where is ___?", "Can you help me?"],
        previouslyLearned: ["How much?", "Delicious!", "Thank you", "Please", "Excuse me", "I need help", "Bread, please"],
        speakAfter: true,
        storyReason: "Build the right sentences to convince the guard to let you into the restricted area.",
        storyConsequence: "You find the passage to where Carlos is being held.",
        onFail: { addToWeakExpressions: ["I need to find ___", "Where is ___?"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            instruction: { en: "Carlos's first cry — put the words in order:", ko: "카를로스의 첫 번째 외침 — 단어를 순서대로 배열하세요:", es: "El primer grito de Carlos — pon las palabras en orden:" },
            words: [
              { en: "Hello", ko: "안녕하세요", es: "Hola" },
              { en: "I need", ko: "필요해요", es: "Necesito" },
              { en: "help", ko: "도움이", es: "ayuda" },
            ],
            answerOrder: [0, 1, 2],
          },
          {
            instruction: { en: "Carlos's second cry:", ko: "카를로스의 두 번째 외침:", es: "El segundo grito de Carlos:" },
            words: [
              { en: "Where", ko: "어디", es: "Dónde" },
              { en: "is", ko: "에요", es: "está" },
              { en: "the bathroom", ko: "화장실이", es: "el baño" },
            ],
            answerOrder: [0, 1, 2],
          },
          {
            instruction: { en: "Carlos's last cry:", ko: "카를로스의 마지막 외침:", es: "El último grito de Carlos:" },
            words: [
              { en: "Help", ko: "도와주세요", es: "Ayuda" },
              { en: "Please", ko: "제발", es: "Por favor" },
              { en: "help me", ko: "도와줘요", es: "ayúdame" },
            ],
            answerOrder: [0, 1, 2],
          },
        ],
        hints: {
          h1: {
            ko: "카를로스는 기초 생존 표현을 외치고 있어 — 인사, 장소, 도움 요청",
            en: "Carlos was shouting basic survival phrases — greeting, location, help",
            es: "Carlos gritaba frases de supervivencia — saludo, lugar, ayuda",
            byLearning: {
              spanish: { ko: "카를로스의 외침: Hola, Necesito ayuda, ¿Dónde está el baño?", en: "Carlos's cries: Hola, Necesito ayuda, ¿Dónde está el baño?", es: "Los gritos de Carlos: Hola, Necesito ayuda, ¿Dónde está el baño?" },
              korean:  { ko: "카를로스의 외침: 안녕하세요, 도움이 필요해요, 화장실이 어디에요?", en: "Carlos's cries: 안녕하세요, 도움이 필요해요, 화장실이 어디에요?", es: "Los gritos de Carlos: 안녕하세요, 도움이 필요해요, 화장실이 어디에요?" },
            },
          },
          h2: {
            ko: "영어 어순: 주어 → 동사 → 목적어",
            en: "English word order: Subject → Verb → Object",
            es: "Orden en inglés: Sujeto → Verbo → Objeto",
            byLearning: {
              spanish: { ko: "스페인어 어순: 주어 → 동사 → 목적어 (Hola → Necesito → ayuda)", en: "Spanish word order: Subject → Verb → Object (Hola → Necesito → ayuda)", es: "Orden en español: Sujeto → Verbo → Objeto (Hola → Necesito → ayuda)" },
              korean:  { ko: "한국어 어순: 주어 → 목적어 → 동사 (안녕하세요 → 도움이 → 필요해요)", en: "Korean word order: Subject → Object → Verb (안녕하세요 → 도움이 → 필요해요)", es: "Orden en coreano: Sujeto → Objeto → Verbo (안녕하세요 → 도움이 → 필요해요)" },
            },
          },
          h3: {
            ko: "1: Hello, I need help / 2: Where is the bathroom / 3: Help, Please help me",
            en: "1: Hello, I need help / 2: Where is the bathroom / 3: Help, Please help me",
            es: "1: Hello, I need help / 2: Where is the bathroom / 3: Help, Please help me",
            byLearning: {
              spanish: { ko: "1: Hola, Necesito ayuda / 2: Dónde está el baño / 3: Ayuda, Por favor ayúdame", en: "1: Hola, Necesito ayuda / 2: Dónde está el baño / 3: Ayuda, Por favor ayúdame", es: "1: Hola, Necesito ayuda / 2: Dónde está el baño / 3: Ayuda, Por favor ayúdame" },
              korean:  { ko: "1: 안녕하세요, 도움이 필요해요 / 2: 화장실이 어디에요 / 3: 도와주세요, 제발 도와줘요", en: "1: 안녕하세요, 도움이 필요해요 / 2: 화장실이 어디에요 / 3: 도와주세요, 제발 도와줘요", es: "1: 안녕하세요, 도움이 필요해요 / 2: 화장실이 어디에요 / 3: 도와주세요, 제발 도와줘요" },
            },
          },
        },
      },
      // ── Scene 4: Rescue Carlos ─────────────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Number three, Calle del Prado. Third floor. Door open, just as Mr. Black said. Inside: a dark room. An old machine — like an antique radio, but languages scroll across its screen. And in the corner, a man in a chair. Carlos. Alive. But his eyes are unfocused.)",
        textKo: "(칼레 델 프라도 3번지. 3층. 미스터 블랙이 말한 대로 문이 열려 있다. 안에는 어두운 방. 오래된 기계 장치 — 앤티크 라디오를 닮았지만 화면에 언어가 스크롤되고 있다. 그리고 구석에, 의자에 앉아있는 남자. 카를로스. 살아있다. 하지만 눈이 초점을 잃었다.)",
        textEs: "(Número tres, Calle del Prado. Tercer piso. Puerta abierta, tal como dijo Mr. Black. Dentro: una habitación oscura. Una máquina vieja — como una radio antigua, pero idiomas se desplazan en su pantalla. Y en la esquina, un hombre en una silla. Carlos. Vivo. Pero sus ojos están desenfocados.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Carlos? Can you hear me? My name is Rudy. I'm a friend of Isabel. I'm here to help.",
        textKo: "카를로스? 들려? 내 이름은 루디야. 이사벨의 친구야. 도와주러 왔어.",
        textEs: "¿Carlos? ¿Me oyes? Me llamo Rudy. Soy amigo de Isabel. Estoy aquí para ayudarte.",
      },
      {
        kind: "scene",
        charId: "carlos",
        text: "Hello... yes... I... the word. I can't... 'Recordar.' Remember. It came back. But others didn't. 'Window.' What's 'window'? I used to know. I used to know everything.",
        textKo: "안녕... 네... 나... 그 단어. 못... 'Recordar.' 기억하다. 돌아왔어. 근데 다른 건 안 돌아왔어. '창문.' '창문'이 뭐야? 알고 있었는데. 전부 알고 있었는데.",
        textEs: "Hola... sí... yo... la palabra. No puedo... 'Recordar.' Recordar. Volvió. Pero otras no. 'Ventana.' ¿Qué es 'ventana'? Lo sabía. Lo sabía todo.",
      },
      {
        kind: "scene",
        charId: "carlos",
        text: "The machine... it erases. Languages. From your head. I found it hidden in the wall at the Prado. When I touched it — I heard every language I know start to dissolve. Like sugar in water. One word at a time. Until all I had left was... 'Hello. Help. Where is the door.'",
        textKo: "기계가... 지워. 언어를. 머릿속에서. 프라도 벽 안에 숨겨진 걸 발견했어. 만졌더니 — 내가 아는 모든 언어가 녹기 시작하는 게 들렸어. 설탕이 물에 녹듯이. 한 단어씩. 남은 건... '안녕하세요. 도와주세요. 문이 어디예요.'뿐이었어.",
        textEs: "La máquina... borra. Idiomas. De tu cabeza. La encontré escondida en la pared del Prado. Cuando la toqué — escuché cómo cada idioma que conozco empezaba a disolverse. Como azúcar en agua. Una palabra a la vez. Hasta que todo lo que me quedaba era... 'Hola. Ayuda. ¿Dónde está la puerta?'",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(A Language Erasure Device. Just a prototype — the final version needs all seven Guardian Stones. Seven stones, seven thousand languages erased. He's not a thief. He's an extinction event. I need to shut this machine down. Now.)",
        textKo: "(언어 삭제 장치. 시제품일 뿐이야 — 최종 버전은 7개의 수호석이 모두 필요해. 7개의 수호석, 7천 개의 언어 삭제. 그는 도둑이 아니야. 멸종 사건이야. 지금 당장 이 기계를 꺼야 해.)",
        textEs: "(Un Dispositivo de Borrado de Idiomas. Solo un prototipo — la versión final necesita las siete Piedras Guardianas. Siete piedras, siete mil idiomas borrados. No es un ladrón. Es un evento de extinción. Necesito apagar esta máquina. Ahora.)",
      },
      {
        kind: "puzzle",
        puzzleNum: 5,
        pType: "investigation",
        tprsStage: 4,
        targetExpressions: ["How much?", "Where is ___?", "I need help", "Thank you"],
        previouslyLearned: ["How much?", "Delicious!", "Please", "Excuse me", "I need help", "Bread, please", "I need to find ___", "Can you help me?"],
        speakAfter: true,
        storyReason: "Examine the evidence to find out where Mr. Black is holding Carlos.",
        storyConsequence: "You discover Carlos's location and launch the rescue.",
        onFail: { addToWeakExpressions: ["How much?", "Where is ___?"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            prompt: { en: "The machine has a price display. Carlos was screaming numbers. How do you say a price in English?", ko: "기계에 가격 표시가 있어. 카를로스가 숫자를 소리쳤어. 영어로 가격을 어떻게 말해?", es: "La máquina tiene una pantalla de precios. Carlos gritaba números. ¿Cómo dices un precio en inglés?" },
            clues: [
              { en: "That's fifteen dollars — stating a price with the number and currency", ko: "15달러입니다 — 숫자와 통화로 가격을 말하는 것", es: "Son quince dólares — indicar un precio con número y moneda" },
              { en: "What day is it today? — asking about the day of the week", ko: "오늘 무슨 요일이에요? — 요일을 묻는 것", es: "¿Qué día es hoy? — preguntar por el día de la semana" },
              { en: "How are you today? — asking about someone's well-being", ko: "오늘 어떠세요? — 누군가의 안부를 묻는 것", es: "¿Cómo estás hoy? — preguntar por el bienestar de alguien" },
              { en: "That's too expensive! — saying the price is too high", ko: "너무 비싸요! — 가격이 너무 높다고 말하는 것", es: "¡Eso es muy caro! — decir que el precio es demasiado alto" },
            ],
            answerIdx: 0,
          },
          {
            prompt: { en: "Second lock: Carlos only had basic words left. Which phrase would he use to ask for help at a restaurant?", ko: "두 번째 잠금: 카를로스에게 기본 단어만 남았어. 식당에서 도움을 요청하려면 어떤 표현을 쓸까?", es: "Segunda cerradura: A Carlos solo le quedaban palabras básicas. ¿Qué frase usaría para pedir ayuda en un restaurante?" },
            clues: [
              { en: "Can I have the menu, please? — politely asking for the menu", ko: "메뉴판 좀 주시겠어요? — 정중하게 메뉴를 요청하는 것", es: "¿Puedo ver el menú, por favor? — pedir el menú amablemente" },
              { en: "Can I have water, please? — asking for the most basic need", ko: "물 좀 주세요 — 가장 기본적인 필요를 요청하는 것", es: "¿Puedo tener agua, por favor? — pedir la necesidad más básica" },
              { en: "This is delicious! — complimenting the food", ko: "이거 맛있어요! — 음식을 칭찬하는 것", es: "¡Esto está delicioso! — elogiar la comida" },
              { en: "The bill, please. — asking to pay", ko: "계산서 주세요 — 계산을 요청하는 것", es: "La cuenta, por favor. — pedir pagar" },
            ],
            answerIdx: 1,
          },
        ],
        hints: {
          h1: {
            ko: "카를로스에게 남은 단어들을 생각해봐 — 기본적인 생존 표현만 남았어",
            en: "Think about what words Carlos had left — only basic survival phrases remained",
            es: "Piensa en qué palabras le quedaban a Carlos — solo frases básicas de supervivencia",
            byLearning: {
              spanish: { ko: "카를로스에게 남은 스페인어 표현: Hola, Ayuda, ¿Dónde está la puerta?", en: "Carlos's remaining Spanish phrases: Hola, Ayuda, ¿Dónde está la puerta?", es: "Las frases en español que le quedaron a Carlos: Hola, Ayuda, ¿Dónde está la puerta?" },
              korean:  { ko: "카를로스에게 남은 한국어 표현: 안녕하세요, 도와주세요, 문이 어디예요?", en: "Carlos's remaining Korean phrases: 안녕하세요, 도와주세요, 문이 어디예요?", es: "Las frases en coreano que le quedaron a Carlos: 안녕하세요, 도와주세요, 문이 어디예요?" },
            },
          },
          h2: {
            ko: "카를로스가 소리친 건 'Hello. Help. Where is the door.' — 가장 기본적인 것만 남아있어",
            en: "Carlos was screaming 'Hello. Help. Where is the door.' — only the most basic words remained",
            es: "Carlos gritaba 'Hello. Help. Where is the door.' — solo quedaban las palabras más básicas",
            byLearning: {
              spanish: { ko: "카를로스의 비명: 'Hola. Ayuda. ¿Dónde está la puerta?' — 기초 스페인어만 남았어", en: "Carlos screamed: 'Hola. Ayuda. ¿Dónde está la puerta?' — only basic Spanish remained", es: "Carlos gritó: 'Hola. Ayuda. ¿Dónde está la puerta?' — solo quedaba español básico" },
              korean:  { ko: "카를로스의 비명: '안녕하세요. 도와주세요. 문이 어디예요?' — 기초 한국어만 남았어", en: "Carlos screamed: '안녕하세요. 도와주세요. 문이 어디예요?' — only basic Korean remained", es: "Carlos gritó: '안녕하세요. 도와주세요. 문이 어디예요?' — solo quedaba coreano básico" },
            },
          },
          h3: {
            ko: "첫 번째: 가격 말하기(15달러) / 두 번째: 물 주세요 — 가장 기본적인 생존 요청이야",
            en: "First: stating a price (fifteen dollars) / Second: water please — the most basic survival request",
            es: "Primero: decir un precio (fifteen dollars) / Segundo: water please — la petición de supervivencia más básica",
            byLearning: {
              spanish: { ko: "첫 번째: 'Son quince dólares' (가격) / 두 번째: '¿Puedo tener agua, por favor?' (생존 요청)", en: "First: 'Son quince dólares' (price) / Second: '¿Puedo tener agua, por favor?' (survival request)", es: "Primero: 'Son quince dólares' (precio) / Segundo: '¿Puedo tener agua, por favor?' (petición de supervivencia)" },
              korean:  { ko: "첫 번째: '15달러입니다' (가격) / 두 번째: '물 좀 주세요' (생존 요청)", en: "First: '15달러입니다' (price) / Second: '물 좀 주세요' (survival request)", es: "Primero: '15달러입니다' (precio) / Segundo: '물 좀 주세요' (petición de supervivencia)" },
            },
          },
        },
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(The last lock disengages. The machine stops. Carlos blinks. Color returns to his face.)",
        textKo: "(마지막 잠금이 풀린다. 기계가 멈춘다. 카를로스가 눈을 깜빡인다. 색이 돌아온다.)",
        textEs: "(La última cerradura se desactiva. La máquina se detiene. Carlos parpadea. El color vuelve a su cara.)",
      },
      {
        kind: "scene",
        charId: "carlos",
        text: "'Ventana.' Window. I remember! Some words are coming back. 'Gracias.' Thank you. I have that one too.",
        textKo: "'창문.' Window. 기억나! 몇몇 단어가 돌아오고 있어. 'Gracias.' 감사합니다. 그것도 있어.",
        textEs: "'Ventana.' Ventana. ¡Recuerdo! Algunas palabras vuelven. 'Gracias.' Gracias. Esa también la tengo.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "The Madrid stone — do you know where it is?",
        textKo: "마드리드 수호석 — 어디 있는지 알아?",
        textEs: "¿La piedra de Madrid — sabes dónde está?",
      },
      {
        kind: "scene",
        charId: "carlos",
        text: "Under the machine. There's a compartment. The stone was powering it — he used the Madrid stone to run the prototype.",
        textKo: "기계 아래에. 칸이 있어. 수호석이 동력원이었어 — 시제품을 가동하는 데 마드리드 수호석을 사용한 거야.",
        textEs: "Debajo de la máquina. Hay un compartimento. La piedra la alimentaba — usó la piedra de Madrid para hacer funcionar el prototipo.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Rudy checks underneath the machine. There's a compartment. It opens. But inside — nothing. Where the stone should be, a single piece of paper.)",
        textKo: "(루디가 기계 아래를 확인한다. 칸이 있다. 열린다. 하지만 안에는 — 아무것도 없다. 수호석이 있던 자리에 종이 한 장.)",
        textEs: "(Rudy revisa debajo de la máquina. Hay un compartimento. Se abre. Pero dentro — nada. Donde debería estar la piedra, un solo papel.)",
      },
      {
        kind: "clue",
        symbol: "📝",
        titleEn: "Mr. Black's Note — Left Behind",
        titleKo: "미스터 블랙의 메모",
        titleEs: "Nota de Mr. Black — Dejada Atrás",
        descEn: "'Thank you for helping Carlos. I'm sorry about the machine. You found one stone. I have six. The numbers are not in your favor, detective. See you in Seoul. Goodbye, Madrid. — B'",
        descKo: "'카를로스를 도와줘서 감사합니다. 기계는 죄송해요. 수호석 하나를 찾았네요. 저는 여섯 개 있어요. 숫자가 유리하지 않아요, 탐정. 서울에서 봐요. 안녕히 계세요, 마드리드. — B'",
        descEs: "'Gracias por ayudar a Carlos. Perdón por la máquina. Encontraste una piedra. Yo tengo seis. Los números no están a tu favor, detective. Nos vemos en Seúl. Adiós, Madrid. — B'",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "He took it. While I was inside saving Carlos, he walked in and took the stone. He told me where Carlos was so I'd be busy while he stole it. He played me. He played me and I walked right into it.",
        textKo: "가져갔어. 내가 안에서 카를로스를 구하는 동안 들어와서 수호석을 가져갔어. 내가 바쁘게 만들려고 카를로스 위치를 알려준 거야. 나를 이용했어. 이용당하면서 나는 그대로 걸어 들어갔고.",
        textEs: "Se la llevó. Mientras yo salvaba a Carlos, entró y se llevó la piedra. Me dijo dónde estaba Carlos para que estuviera ocupado mientras la robaba. Me engañó. Me engañó y yo caí directo.",
      },
      {
        kind: "scene",
        charId: "isabel",
        text: "You saved Carlos. That matters more than a stone. Seoul is next? Then go for it. We'll hold Madrid.",
        textKo: "카를로스를 구했잖아. 그게 수호석보다 중요해. 서울이 다음이라고? 그럼 해봐. 마드리드는 우리가 지킬게.",
        textEs: "Salvaste a Carlos. Eso importa más que una piedra. ¿Seúl es el siguiente? Pues ¡dale! Nosotros cuidamos Madrid.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Does it? One stone. He has six. He told me the math himself: 'The numbers are not in your favor.' He's right about the math. He's right about being ahead. The worst part — his seven thousand walls wasn't wrong as a problem. He's wrong about the solution. But the problem is real. Seoul. He said Seoul. Time to stop being one step behind.)",
        textKo: "(그래? 수호석 하나. 그는 여섯 개를 가지고 있어. 직접 수학을 말해줬잖아: '숫자가 유리하지 않아요.' 맞는 말이야. 앞서고 있다는 것도 맞고. 최악인 건 — 7천 개의 벽에 대한 그의 말도 문제 자체로는 틀리지 않았어. 해법이 틀린 거야. 하지만 문제는 진짜야. 서울. 서울이라고 했어. 한 발 뒤처지는 건 그만 할 때야.)",
        textEs: "(¿De verdad? Una piedra. Él tiene seis. Me dijo los números él mismo: 'Los números no están a tu favor.' Tiene razón con las matemáticas. Tiene razón en ir adelante. Lo peor — siete mil muros no era un problema equivocado. Se equivoca en la solución. Pero el problema es real. Seúl. Dijo Seúl. Hora de dejar de ir un paso atrás.)",
      },
    ],
  },

  /* ════════════════ CHAPTER 3: SEOUL ════════════════ */
  seoul: {
    id: "seoul",
    title: "The Seoul Secret",
    titleKo: "서울의 비밀",
    titleEs: "El Secreto de Seúl",
    gradient: ["#1a0a05", "#2c1810", "#1a0a05"],
    accentColor: C.gold,
    nextChapterId: "cairo",
    /* ── Language Ratio: 70% targetLang / 30% nativeLang ──────────────────────
     * CEFR A2 — elementary. User has completed Day 1-30.
     * NPC dialogue should be MOSTLY targetLang with some nativeLang scaffolding.
     * The current 100% English text is closer to correct for this chapter;
     * ideally ~30% of the non-learned content would be in nativeLang.
     * TODO: Add textKoMix/textEsMix to key NPC dialogue lines for this chapter.
     */
    chapterMeta: {
      cefrLevel: "A2",
      targetLangRatio: 70,
      knownExpressions: [
        "Hello", "Goodbye", "Nice to meet you", "My name is ___",
        "I'm from ___", "Where is ___?", "How much?",
        "Thank you", "I don't understand", "Help", "Yes", "No",
        "Excuse me", "I'm sorry", "Can you repeat that?",
        "I need ___", "Do you speak ___?", "How do you say ___?",
        "What time is it?", "I like ___", "I want ___",
        "Can I have ___?", "Where is the ___?", "How do I get to ___?",
        "It's delicious", "I'm lost", "Please help me",
        "What does ___ mean?", "Speak slowly please", "I'm learning ___",
      ],
      languageNote:
        "Ch3 dialogue should be ~70% English (targetLang) / ~30% native. " +
        "Current textKo/textEs are 100% translated — textKoMix/textEsMix not yet added. " +
        "At this level learners can follow most dialogue in the target language.",
    },
    characters: [
      {
        id: "lingo",
        emoji: "🦊",
        name: "Detective Rudy",
        nameKo: "루디 탐정",
        side: "left",
        avatarBg: "#2c1810",
        isLingo: true,
      },
      {
        id: "sujin",
        emoji: "👩‍🔬",
        name: "Sujin",
        nameKo: "수진",
        side: "right",
        avatarBg: "#1A2A3A",
      },
      {
        id: "minho",
        emoji: "🎤",
        name: "Minho",
        nameKo: "민호",
        side: "right",
        avatarBg: "#2A1A3A",
      },
      {
        id: "youngsook",
        emoji: "👵",
        name: "Grandma Youngsook",
        nameKo: "영숙 할머니",
        side: "left",
        avatarBg: "#2A2A1A",
      },
      {
        id: "mr_black",
        emoji: "🕴️",
        name: "Mr. Black",
        nameKo: "미스터 블랙",
        side: "right",
        avatarBg: "#0A0A0A",
      },
    ],
    sequence: [
      // ── Scene 1: Incheon Airport — The Dead Phone ──────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Incheon International Airport. 6:15 AM. The plane lands. Rudy reaches for his phone to call Sujin, the linguist who agreed to help. Dead screen. Black glass. The charger is in a hotel room in Madrid. Of course it is.)",
        textKo: "(인천국제공항. 오전 6시 15분. 비행기가 착륙한다. 루디가 수진에게 전화하려고 핸드폰을 꺼낸다. 도움을 주기로 한 언어학자. 검은 화면. 까만 유리. 충전기는 마드리드 호텔 방에 있다. 당연하지.)",
        textEs: "(Aeropuerto Internacional de Incheon. 6:15 AM. El avión aterriza. Rudy busca su teléfono para llamar a Sujin, la lingüista que aceptó ayudar. Pantalla muerta. Cristal negro. El cargador está en una habitación de hotel en Madrid. Por supuesto.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Alright, partner. Confidence level: historically low. Phone is dead. Charger is in Madrid because apparently I pack like a disaster. I need to find Sujin — she is a linguist, Eleanor's contact in Seoul. But first I need to survive this airport using nothing but the Korean we learned in the last thirty days. No pressure.",
        textKo: "좋아, 파트너. 자신감 레벨: 역대 최저. 핸드폰이 죽었어. 충전기는 마드리드에 있어, 왜냐면 나는 재앙처럼 짐을 싸니까. 수진을 찾아야 해 — 엘리너의 서울 연락책인 언어학자야. 하지만 먼저 지난 30일 동안 배운 한국어만으로 이 공항에서 살아남아야 해. 부담 없지.",
        textEs: "Bien, compañero. Nivel de confianza: históricamente bajo. El teléfono está muerto. El cargador está en Madrid porque aparentemente empaco como un desastre. Necesito encontrar a Sujin — es lingüista, el contacto de Eleanor en Seúl. Pero primero necesito sobrevivir en este aeropuerto usando solo el coreano que aprendimos en los últimos treinta días. Sin presión.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Korean signs everywhere. Exit, subway, bus, taxi. No English in sight. The airport staff are busy. You need to read the signs and match words to find your way out. Madrid taught you one thing: words are survival tools. Use them.)",
        textKo: "(사방에 한국어 표지판. 출구, 지하철, 버스, 택시. 영어는 안 보인다. 공항 직원들은 바쁘다. 표지판을 읽고 단어를 매칭해서 나가는 길을 찾아야 한다. 마드리드에서 배운 것 하나: 단어는 생존 도구다. 써먹자.)",
        textEs: "(Carteles en coreano por todas partes. Salida, metro, bus, taxi. No se ve inglés. El personal del aeropuerto está ocupado. Necesitas leer los carteles y emparejar palabras para encontrar la salida. Madrid te enseñó una cosa: las palabras son herramientas de supervivencia. Úsalas.)",
      },
      {
        kind: "puzzle",
        puzzleNum: 1,
        pType: "word-match",
        tprsStage: 1,
        targetExpressions: ["Exit", "Subway", "Taxi", "Excuse me"],
        previouslyLearned: ["Hello", "Thank you", "Where is ___?", "How much?", "Please", "I need help", "Excuse me"],
        speakAfter: true,
        storyReason: "You just landed in Seoul. Match the airport signs to navigate out.",
        storyConsequence: "You find the exit and meet Minho outside.",
        onFail: { addToWeakExpressions: ["Exit", "Subway"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            word: { en: "exit", ko: "출구", es: "salida" },
            meaning: { en: "the way out of a building", ko: "건물에서 나가는 길", es: "el camino para salir de un edificio" },
            wrong: [
              { en: "a place to eat food", ko: "음식을 먹는 장소", es: "un lugar para comer" },
              { en: "an office for work", ko: "일하는 사무실", es: "una oficina para trabajar" },
              { en: "a place to sleep", ko: "잠을 자는 곳", es: "un lugar para dormir" },
            ],
          },
          {
            word: { en: "subway station", ko: "지하철역", es: "estación de metro" },
            meaning: { en: "an underground train stop in the city", ko: "도시의 지하 기차 정거장", es: "una parada de tren subterráneo en la ciudad" },
            wrong: [
              { en: "a type of restaurant", ko: "식당의 종류", es: "un tipo de restaurante" },
              { en: "a secret laboratory", ko: "비밀 연구실", es: "un laboratorio secreto" },
              { en: "an office building", ko: "사무실 건물", es: "un edificio de oficinas" },
            ],
          },
          {
            word: { en: "taxi", ko: "택시", es: "taxi" },
            meaning: { en: "a car you pay to take you somewhere", ko: "어딘가에 데려다 주는 대가로 돈을 내는 차", es: "un coche que pagas para que te lleve a algún lugar" },
            wrong: [
              { en: "a type of food", ko: "음식의 종류", es: "un tipo de comida" },
              { en: "a walking path", ko: "산책로", es: "un camino para caminar" },
              { en: "a meeting room", ko: "회의실", es: "una sala de reuniones" },
            ],
          },
          {
            word: { en: "excuse me", ko: "실례합니다", es: "disculpe" },
            meaning: { en: "a polite way to get someone's attention", ko: "정중하게 누군가의 관심을 끄는 말", es: "una forma educada de llamar la atención de alguien" },
            wrong: [
              { en: "a way to say goodbye", ko: "작별 인사", es: "una forma de despedirse" },
              { en: "an expression of anger", ko: "화를 내는 표현", es: "una expresión de enfado" },
              { en: "a word meaning delicious", ko: "맛있다는 뜻의 단어", es: "una palabra que significa delicioso" },
            ],
          },
        ],
        hints: {
          h1: { ko: "공항 표지판을 읽어야 해 — 출구, 교통, 예의 표현을 생각해봐", en: "You need to read airport signs — think about exits, transport, and polite phrases", es: "Necesitas leer carteles del aeropuerto — piensa en salidas, transporte y frases de cortesía" },
          h2: {
            ko: "exit은 나가는 곳, subway station은 기차 정거장, taxi는 유료 차, excuse me는 정중한 표현",
            en: "Exit is the way out, subway station is a train stop, taxi is a paid car, excuse me is polite",
            es: "Exit es la salida, subway station es parada de tren, taxi es coche de pago, excuse me es educado",
            byLearning: {
              korean: { ko: "출구는 나가는 곳, 지하철역은 기차 정거장, 택시는 유료 차, 실례합니다는 정중한 표현", en: "'출구' is the way out, '지하철역' is a train stop, '택시' is a paid car, '실례합니다' is polite", es: "'출구' es la salida, '지하철역' es parada de tren, '택시' es coche de pago, '실례합니다' es educado" },
              spanish: { ko: "salida는 나가는 곳, estación de metro는 기차 정거장, taxi는 유료 차, disculpe는 정중한 표현", en: "'Salida' is the way out, 'estación de metro' is a train stop, 'taxi' is a paid car, 'disculpe' is polite", es: "Salida es la salida, estación de metro es parada de tren, taxi es coche de pago, disculpe es educado" },
            },
          },
          h3: {
            ko: "exit=나가는 곳 / subway station=기차 정거장 / taxi=유료 차 / excuse me=정중한 표현",
            en: "exit=way out / subway station=underground train / taxi=car for hire / excuse me=polite attention",
            es: "exit=salida / subway station=tren subterráneo / taxi=coche de alquiler / excuse me=atención educada",
            byLearning: {
              korean: { ko: "출구=나가는 곳 / 지하철역=기차 정거장 / 택시=유료 차 / 실례합니다=정중한 표현", en: "출구=way out / 지하철역=underground train / 택시=car for hire / 실례합니다=polite attention", es: "출구=salida / 지하철역=tren subterráneo / 택시=coche de alquiler / 실례합니다=atención educada" },
              spanish: { ko: "salida=나가는 곳 / estación de metro=기차 정거장 / taxi=유료 차 / disculpe=정중한 표현", en: "salida=way out / estación de metro=underground train / taxi=car for hire / disculpe=polite attention", es: "salida=salida / estación de metro=tren subterráneo / taxi=coche de alquiler / disculpe=atención educada" },
            },
          },
        },
      },
      // ── Scene 2: Minho Finds Rudy ──────────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Outside the airport. Rudy stands at the taxi stand, trying to read a map in Korean. A young man in a bucket hat and oversized jacket walks up, grinning. He is already laughing before he speaks.)",
        textKo: "(공항 밖. 루디가 택시 승강장에서 한국어 지도를 읽으려 한다. 버킷햇에 오버사이즈 재킷을 입은 젊은 남자가 다가온다, 씩 웃으며. 말하기도 전에 이미 웃고 있다.)",
        textEs: "(Fuera del aeropuerto. Rudy está en la parada de taxis, intentando leer un mapa en coreano. Un joven con gorro de pescador y chaqueta enorme se acerca, sonriendo. Ya se está riendo antes de hablar.)",
      },
      {
        kind: "scene",
        charId: "minho",
        text: "Bro. BRO. Did you just say '주세요' like '주세용'? That is SO not how you say it. I am dying. You sound like a robot that learned Korean from a microwave manual. I am Minho. Sujin told me to come get you. She is busy at the lab.",
        textKo: "야. 야야. 방금 '주세요'를 '주세용'이라고 했어? 그렇게 말하는 거 아닌데. 죽겠다 진짜. 전자레인지 설명서로 한국어 배운 로봇 같아. 나 민호. 수진 누나가 데리러 오라고 했어. 누나는 연구실에서 바빠.",
        textEs: "Tío. TÍO. ¿Acabas de decir '주세요' como '주세용'? ¡Así NO se dice! Me muero. Suenas como un robot que aprendió coreano de un manual de microondas. Soy Minho. Sujin me dijo que viniera a buscarte. Ella está ocupada en el laboratorio.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Great. My pronunciation is so bad that a stranger is having a medical event. You must be Minho — Sujin's friend?",
        textKo: "좋아. 내 발음이 너무 안 좋아서 모르는 사람이 의료 사태를 겪고 있어. 민호지 — 수진의 친구?",
        textEs: "Genial. Mi pronunciación es tan mala que un desconocido está teniendo una emergencia médica. ¿Debes ser Minho — el amigo de Sujin?",
      },
      {
        kind: "scene",
        charId: "minho",
        text: "Friend? Nah, I am her little brother's best friend. Basically family. OK listen, your Korean needs emergency surgery. Let me teach you how to actually say things so people don't run away from you. First rule: in Korea, you MUST greet people right. Watch.",
        textKo: "친구? 아니, 수진 누나 남동생 절친이야. 거의 가족. 자 들어봐, 네 한국어는 응급 수술이 필요해. 사람들이 도망 안 가게 제대로 말하는 법 알려줄게. 첫 번째 규칙: 한국에서는 반드시 인사를 제대로 해야 해. 봐봐.",
        textEs: "¿Amigo? No, soy el mejor amigo de su hermano menor. Básicamente familia. OK escucha, tu coreano necesita cirugía de emergencia. Déjame enseñarte cómo decir las cosas para que la gente no huya de ti. Primera regla: en Corea, DEBES saludar correctamente. Mira.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Minho is loud, confident, and speaks in a mix of Korean slang and English. He wears his personality like his oversized jacket — big and impossible to ignore. He is already teaching you before you agreed to learn. Pick the right responses to his language lessons.)",
        textKo: "(민호는 시끄럽고, 자신만만하고, 한국어 속어와 영어를 섞어 말한다. 그의 성격은 오버사이즈 재킷처럼 — 크고 무시할 수 없다. 배우겠다고 동의하기도 전에 이미 가르치고 있다. 그의 언어 수업에 올바른 답을 골라봐.)",
        textEs: "(Minho es ruidoso, seguro de sí mismo y habla en una mezcla de argot coreano e inglés. Lleva su personalidad como su chaqueta enorme — grande e imposible de ignorar. Ya te está enseñando antes de que aceptaras aprender. Elige las respuestas correctas a sus lecciones.)",
      },
      {
        kind: "puzzle",
        puzzleNum: 2,
        pType: "dialogue-choice",
        tprsStage: 2,
        targetExpressions: ["Where is ___?", "How much?", "Thank you", "I don't understand"],
        previouslyLearned: ["Hello", "Thank you", "Where is ___?", "Excuse me", "Exit", "Subway", "Taxi"],
        speakAfter: true,
        storyReason: "A taxi driver and airport guard are speaking fast. Choose the right response.",
        storyConsequence: "The taxi driver takes you to Grandma Youngsook's market.",
        onFail: { addToWeakExpressions: ["Where is ___?", "I don't understand"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            prompt: { en: "Minho asks: 'You want to find Sujin, right? How do you ask a taxi driver to go somewhere?'", ko: "민호가 묻는다: '수진 누나 찾으려고? 택시 기사한테 어디 간다고 어떻게 말해?'", es: "Minho pregunta: '¿Quieres encontrar a Sujin, verdad? ¿Cómo le dices a un taxista que te lleve a algún sitio?'" },
            context: { en: "Minho: 'In Seoul, you don't just point. You speak. Try it.'", ko: "민호: '서울에서는 가리키기만 하면 안 돼. 말해야 해. 해봐.'", es: "Minho: 'En Seúl, no solo señales. Hablas. Inténtalo.'" },
            answer: { en: "Excuse me. Please go to Namsan, please. How much is it?", ko: "실례합니다. 남산으로 가 주세요. 얼마예요?", es: "Disculpe. Lléveme a Namsan, por favor. ¿Cuánto cuesta?" },
            wrong: [
              { en: "Goodbye! Namsan! Fast! Sorry!", ko: "안녕히 계세요! 남산! 빨리! 죄송합니다!", es: "¡Adiós! ¡Namsan! ¡Rápido! ¡Perdón!" },
              { en: "Hello, my name is Rudy. Where is Namsan?", ko: "안녕하세요, 제 이름은 루디예요. 남산이 어디예요?", es: "Hola, me llamo Rudy. ¿Dónde está Namsan?" },
            ],
          },
          {
            prompt: { en: "Minho tests you: 'OK, we arrive. Sujin's building has a code. The guard asks who you are. What do you say?'", ko: "민호가 테스트한다: 'OK, 도착했어. 수진 누나 건물에 비밀번호가 있어. 경비원이 누구냐고 물어. 뭐라고 해?'", es: "Minho te prueba: 'OK, llegamos. El edificio de Sujin tiene código. El guardia pregunta quién eres. ¿Qué dices?'" },
            context: { en: "Minho: 'The guard speaks zero English. Full Korean mode. Go.'", ko: "민호: '경비 아저씨 영어 하나도 몰라. 풀 한국어 모드. 가.'", es: "Minho: 'El guardia no habla nada de inglés. Modo coreano total. Vamos.'" },
            answer: { en: "Hello. My name is Rudy. I am looking for Sujin. I am her friend.", ko: "안녕하세요. 제 이름은 루디예요. 수진을 찾고 있어요. 친구예요.", es: "Hola. Me llamo Rudy. Busco a Sujin. Soy su amigo." },
            wrong: [
              { en: "Open the door! I need help! Where is the exit?", ko: "문 열어요! 도와주세요! 출구가 어디예요?", es: "¡Abra la puerta! ¡Necesito ayuda! ¿Dónde está la salida?" },
              { en: "Goodbye. Thank you. See you tomorrow.", ko: "안녕히 계세요. 감사합니다. 내일 봐요.", es: "Adiós. Gracias. Hasta mañana." },
            ],
          },
        ],
        hints: {
          h1: {
            ko: "택시에서는 장소 + please + 가격을 물어야 해. 경비원에게는 자기소개를 해야 해",
            en: "In a taxi, use place + please + ask the price. For the guard, introduce yourself",
            es: "En un taxi, usa lugar + please + pregunta el precio. Al guardia, preséntate",
            byLearning: {
              korean: { ko: "택시에서는 장소 + 주세요 + 가격을 물어야 해. 경비원에게는 자기소개를 해야 해", en: "In a taxi, use place + 주세요 + ask the price. For the guard, introduce yourself", es: "En un taxi, usa lugar + 주세요 + pregunta el precio. Al guardia, preséntate" },
              spanish: { ko: "택시에서는 장소 + por favor + 가격을 물어야 해. 경비원에게는 자기소개를 해야 해", en: "In a taxi, use place + por favor + ask the price. For the guard, introduce yourself", es: "En un taxi, usa lugar + por favor + pregunta el precio. Al guardia, preséntate" },
            },
          },
          h2: {
            ko: "Excuse me로 시작, 장소 + please go, 그리고 How much? / Hello + 이름 + 찾는 사람",
            en: "Start with Excuse me, place + please go, and How much? / Hello + name + person you seek",
            es: "Empieza con Excuse me, lugar + please go, y How much? / Hello + nombre + a quién buscas",
            byLearning: {
              korean: { ko: "실례합니다로 시작, 장소 + 가 주세요, 그리고 얼마예요? / 안녕하세요 + 이름 + 찾는 사람", en: "Start with 실례합니다, place + 가 주세요, and 얼마예요? / 안녕하세요 + name + person you seek", es: "Empieza con 실례합니다, lugar + 가 주세요, y 얼마예요? / 안녕하세요 + nombre + a quién buscas" },
              spanish: { ko: "Disculpe로 시작, 장소 + por favor, 그리고 ¿Cuánto cuesta? / Hola + 이름 + 찾는 사람", en: "Start with Disculpe, place + por favor, and ¿Cuánto cuesta? / Hola + name + person you seek", es: "Empieza con Disculpe, lugar + por favor, y ¿Cuánto cuesta? / Hola + nombre + a quién buscas" },
            },
          },
          h3: {
            ko: "Q1: Excuse me + go to Namsan please + how much / Q2: Hello + name + looking for Sujin + friend",
            en: "Q1: Excuse me + go to Namsan please + how much / Q2: Hello + name + looking for Sujin + friend",
            es: "P1: Excuse me + go to Namsan please + how much / P2: Hello + nombre + looking for Sujin + friend",
            byLearning: {
              korean: { ko: "Q1: 실례합니다 + 남산으로 가 주세요 + 얼마예요 / Q2: 안녕하세요 + 이름 + 수진 + 친구", en: "Q1: 실례합니다 + 남산으로 가 주세요 + 얼마예요 / Q2: 안녕하세요 + name + 수진 + 친구", es: "P1: 실례합니다 + 남산 주세요 + 얼마예요 / P2: 안녕하세요 + nombre + 수진 + 친구" },
              spanish: { ko: "Q1: Disculpe + Namsan por favor + cuánto / Q2: Hola + 이름 + Sujin + amigo", en: "Q1: Disculpe + Namsan por favor + cuánto / Q2: Hola + name + Sujin + amigo", es: "P1: Disculpe + Namsan por favor + cuánto / P2: Hola + nombre + busco Sujin + amigo" },
            },
          },
        },
      },
      {
        kind: "scene",
        charId: "minho",
        text: "Not bad! Not bad at all! OK your accent is still like a cat in a washing machine but the WORDS are right. That is what matters. Sujin is going to be impressed. Maybe. Probably not. But I am!",
        textKo: "나쁘지 않아! 전혀 나쁘지 않아! 억양은 아직 세탁기에 들어간 고양이 같지만 단어는 맞아. 그게 중요한 거야. 수진 누나가 감동할 거야. 아마. 아닐 수도. 근데 나는 감동했어!",
        textEs: "¡Nada mal! ¡Nada mal para nada! OK tu acento sigue siendo como un gato en una lavadora pero las PALABRAS están bien. Eso es lo que importa. Sujin va a estar impresionada. Quizá. Probablemente no. ¡Pero yo sí!",
        idiomRef: "idiom_minho_1",
      },
      {
        kind: "clue",
        symbol: "🎤",
        titleEn: "Investigation Notes: Korean Street Talk",
        titleKo: "수사 노트: 한국 길거리 표현",
        titleEs: "Notas de Investigación: Expresiones Callejeras Coreanas",
        descEn: "Minho's trendy expressions: JMT (존맛탱 — 'crazy delicious,' from internet slang). In English: 'That's fire!' In Spanish: '¡Está brutal!' Korean youth culture compresses entire feelings into three letters. Language evolves fastest on the street.",
        descKo: "민호의 트렌디한 표현: JMT (존맛탱 — 인터넷 슬랭에서 유래). 영어로는: 'That's fire!' 스페인어로는: '¡Está brutal!' 한국 청년 문화는 감정 전체를 세 글자로 압축한다. 언어는 길거리에서 가장 빠르게 진화한다.",
        descEs: "Las expresiones de moda de Minho: JMT (존맛탱 — 'locamente delicioso,' del argot de internet). En inglés: 'That is fire!' En español: '¡Está brutal!' La cultura juvenil coreana comprime sentimientos enteros en tres letras. El lenguaje evoluciona más rápido en la calle.",
      },
      // ── Scene 3: Grandma Youngsook's Kitchen ───────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Gwangjang Market. Steam rises from every stall. Minho leads Rudy through narrow alleys packed with food vendors. They stop at a small stall where an elderly woman in an apron stirs a massive pot. Her hands move with forty years of practice. This is Grandma Youngsook — Sujin's grandmother.)",
        textKo: "(광장시장. 모든 가판대에서 김이 올라온다. 민호가 루디를 음식 상인으로 가득 찬 좁은 골목으로 안내한다. 앞치마를 입은 할머니가 거대한 냄비를 저으며 서 있는 작은 가판대에서 멈춘다. 40년의 연습이 담긴 손놀림. 수진의 할머니, 영숙 할머니다.)",
        textEs: "(Mercado de Gwangjang. El vapor sube de cada puesto. Minho guía a Rudy por callejones estrechos llenos de vendedores de comida. Se detienen en un pequeño puesto donde una anciana con delantal revuelve una olla enorme. Sus manos se mueven con cuarenta años de práctica. Esta es la Abuela Youngsook — la abuela de Sujin.)",
      },
      {
        kind: "scene",
        charId: "youngsook",
        text: "Minho, who is this skinny foreigner? He looks like he hasn't eaten in three countries. Sit down. I will feed you first. In Korea, we don't talk to hungry people. A conversation without rice is like a map without streets.",
        textKo: "민호야, 이 마른 외국인은 누구니? 세 나라를 거치면서 밥을 안 먹은 것 같은데. 앉아. 먼저 밥을 먹여줄게. 한국에서는 배고픈 사람과 대화하지 않아. 밥 없는 대화는 지도 없는 길 같단다.",
        textEs: "Minho, ¿quién es este extranjero flaco? Parece que no ha comido en tres países. Siéntate. Te daré de comer primero. En Corea, no hablamos con gente hambrienta. Una conversación sin arroz es como un mapa sin calles.",
        idiomRef: "idiom_youngsook_1",
      },
      {
        kind: "scene",
        charId: "minho",
        text: "Grandma, this is Rudy. The fox detective. He is here to find the Guardian Stone. But first — Grandma, make him the bibimbap. He NEEDS it. Trust me.",
        textKo: "할머니, 이 사람 루디예요. 여우 탐정. 수호석 찾으러 왔어요. 근데 먼저 — 할머니, 비빔밥 해주세요. 이 사람한테 필요해요. 진짜로.",
        textEs: "Abuela, este es Rudy. El detective zorro. Está aquí para encontrar la Piedra Guardiana. Pero primero — Abuela, hazle el bibimbap. Lo NECESITA. Créeme.",
      },
      {
        kind: "scene",
        charId: "youngsook",
        text: "A detective who cannot speak Korean is like a spoon that cannot hold soup. But we can fix that. Eat. Then I teach. Every dish has a story, and every story has words you need.",
        textKo: "한국어 못 하는 탐정은 국을 못 담는 숟가락 같단다. 하지만 고칠 수 있어. 먹어. 그다음 가르쳐줄게. 모든 음식에는 이야기가 있고, 모든 이야기에는 네가 필요한 단어가 있단다.",
        textEs: "Un detective que no puede hablar coreano es como una cuchara que no puede sostener sopa. Pero podemos arreglarlo. Come. Luego enseño. Cada plato tiene una historia, y cada historia tiene palabras que necesitas.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Youngsook places steaming bowls on the table. Bibimbap, tteokbokki, japchae. She names each dish slowly in Korean, making Rudy repeat after her. She corrects his pronunciation with gentle authority. Food is her classroom. The market is her school.)",
        textKo: "(영숙 할머니가 김이 나는 그릇들을 테이블에 놓는다. 비빔밥, 떡볶이, 잡채. 각 음식 이름을 천천히 한국어로 말하며 루디에게 따라 하게 한다. 부드럽지만 확실하게 발음을 교정한다. 음식이 교실이다. 시장이 학교다.)",
        textEs: "(Youngsook pone cuencos humeantes en la mesa. Bibimbap, tteokbokki, japchae. Nombra cada plato lentamente en coreano, haciendo que Rudy repita. Corrige su pronunciación con amable autoridad. La comida es su aula. El mercado es su escuela.)",
      },
      {
        kind: "clue",
        symbol: "🍚",
        titleEn: "Investigation Notes: Grandma Youngsook's Proverb",
        titleKo: "수사 노트: 영숙 할머니의 속담",
        titleEs: "Notas de Investigación: Proverbio de la Abuela Youngsook",
        descEn: "Youngsook's wisdom: '밥 없는 대화는 지도 없는 길 같단다' — 'A conversation without rice is like a map without streets' — 'Una conversación sin arroz es como un mapa sin calles.' In Korean culture, sharing food is not separate from communication. It IS communication.",
        descKo: "영숙 할머니의 지혜: '밥 없는 대화는 지도 없는 길 같단다' — 한국 문화에서 음식을 나누는 것은 소통과 분리되지 않는다. 그것 자체가 소통이다.",
        descEs: "La sabiduría de Youngsook: '밥 없는 대화는 지도 없는 길 같단다' — 'Una conversación sin arroz es como un mapa sin calles.' En la cultura coreana, compartir comida no está separado de la comunicación. ES comunicación.",
      },
      {
        kind: "puzzle",
        puzzleNum: 3,
        pType: "writing-mission",
        tprsStage: 3,
        targetExpressions: ["Excuse me. Do you speak English?", "This is delicious", "Where is the subway?"],
        previouslyLearned: ["Exit", "Subway", "Taxi", "Excuse me", "Where is ___?", "How much?", "Thank you", "I don't understand"],
        speakAfter: true,
        storyReason: "Your phone is dead. Write these survival phrases from memory.",
        storyConsequence: "Grandma Youngsook is impressed and offers to help.",
        onFail: { addToWeakExpressions: ["Excuse me", "Where is the subway?"], reviewInDailyCourse: true, reviewDays: 3 },
        title: { en: "Survive the Airport and Market", ko: "공항과 시장에서 살아남기", es: "Sobrevivir en el Aeropuerto y el Mercado" },
        context: { en: "Phone is dead. No translator. Speak Korean to survive — Youngsook is watching!", ko: "전화가 꺼졌어요. 번역기도 없어요. 살아남으려면 한국어로 말하세요 — 영숙 할머니가 보고 있어요!", es: "El teléfono está muerto. Sin traductor. ¡Habla coreano para sobrevivir — la Abuela Youngsook está mirando!" },
        questions: [
          { word: { en: "Excuse me. Do you speak English?", ko: "실례합니다. 영어 할 줄 아세요?", es: "Disculpe. ¿Habla inglés?" }, hint: { en: "First check if they speak English", ko: "먼저 영어를 할 줄 아는지 확인하세요", es: "Primero verifica si hablan inglés" }, acceptableAnswers: ["excuse me do you speak english", "do you speak english", "excuse me. do you speak english"] },
          { word: { en: "This is delicious. Thank you!", ko: "이거 맛있어요. 감사합니다!", es: "¡Esto está delicioso! ¡Gracias!" }, hint: { en: "Compliment Youngsook's cooking", ko: "영숙 할머니의 요리를 칭찬하세요", es: "Elogia la cocina de Youngsook" }, acceptableAnswers: ["this is delicious thank you", "delicious thank you", "this is delicious thanks"] },
          { word: { en: "Where is the subway?", ko: "지하철이 어디예요?", es: "¿Dónde está el metro?" }, hint: { en: "Find your way to Namsan", ko: "남산으로 가는 길을 찾으세요", es: "Encuentra tu camino a Namsan" }, acceptableAnswers: ["where is the subway", "where's the subway", "where is the subway station"] },
        ],
      },
      // ── Scene 4: Meeting Sujin ─────────────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Sujin's linguistics lab. University building near Namsan. Bookshelves from floor to ceiling. Papers in twelve languages pinned to every wall. Sujin sits at a desk covered in ancient manuscripts. She looks up when Rudy enters — sharp eyes, no smile.)",
        textKo: "(수진의 언어학 연구실. 남산 근처 대학 건물. 천장까지 닿는 책장. 열두 개 언어로 된 논문이 벽마다 꽂혀 있다. 수진이 고대 원고로 덮인 책상에 앉아 있다. 루디가 들어오자 고개를 든다 — 날카로운 눈, 미소 없음.)",
        textEs: "(El laboratorio de lingüística de Sujin. Edificio universitario cerca de Namsan. Estanterías del suelo al techo. Documentos en doce idiomas clavados en cada pared. Sujin está sentada en un escritorio cubierto de manuscritos antiguos. Levanta la vista cuando entra Rudy — ojos agudos, sin sonrisa.)",
      },
      {
        kind: "scene",
        charId: "sujin",
        text: "You are late. Eleanor said you were coming yesterday. Also — she said you were smart. The pronunciation Minho described suggests otherwise. Sit down. We have work to do.",
        textKo: "늦었어요. 엘리너가 어제 온다고 했어요. 그리고 — 똑똑하다고 했는데. 민호가 설명한 발음으로는 아닌 것 같아요. 앉으세요. 할 일이 있어요.",
        textEs: "Llegas tarde. Eleanor dijo que venías ayer. Además — dijo que eras inteligente. La pronunciación que Minho describió sugiere lo contrario. Siéntate. Tenemos trabajo que hacer.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Nice to meet you too, Sujin. Eleanor speaks highly of you. She said you are the best linguist in Seoul — possibly the best she has ever trained.",
        textKo: "나도 만나서 반가워요, 수진. 엘리너가 높이 평가하더라고요. 서울 최고의 언어학자라고 — 아마 자기가 가르친 사람 중 최고라고.",
        textEs: "Encantado de conocerte también, Sujin. Eleanor habla muy bien de ti. Dijo que eres la mejor lingüista de Seúl — posiblemente la mejor que ha formado.",
      },
      {
        kind: "scene",
        charId: "sujin",
        text: "The Seoul Guardian Stone is in danger. Mr. Black has been seen near Namsan Tower three times this week. He is not hiding. He is studying the tower. The stone is hidden inside — only someone who reads the Korean inscriptions can find it. That is why Eleanor sent you to me.",
        textKo: "서울 수호석이 위험해요. 미스터 블랙이 이번 주에 남산타워 근처에서 세 번 목격됐어요. 숨지 않아요. 타워를 연구하고 있어요. 수호석은 안에 숨겨져 있어요 — 한국어 비문을 읽을 수 있는 사람만 찾을 수 있어요. 그래서 엘리너가 저한테 보낸 거예요.",
        textEs: "La Piedra Guardiana de Seúl está en peligro. Mr. Black ha sido visto cerca de la Torre Namsan tres veces esta semana. No se esconde. Está estudiando la torre. La piedra está oculta dentro — solo alguien que lea las inscripciones coreanas puede encontrarla. Por eso Eleanor te envió a mí.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "So let me get this straight. I need to read Korean inscriptions — inscriptions that have been there for centuries — using vocabulary I learned in the last thirty days. Partner, this is either the bravest or the stupidest thing we have ever done.",
        textKo: "그러니까 정리하면. 수백 년 된 한국어 비문을 — 지난 30일 동안 배운 어휘로 읽어야 한다고. 파트너, 이건 우리가 해본 것 중 가장 용감하거나 가장 멍청한 거야.",
        textEs: "A ver si lo entiendo. Necesito leer inscripciones en coreano — inscripciones que han estado ahí durante siglos — usando vocabulario que aprendí en los últimos treinta días. Compañero, esto es lo más valiente o lo más estúpido que hemos hecho.",
      },
      {
        kind: "puzzle",
        puzzleNum: 4,
        pType: "sentence-builder",
        tprsStage: 3,
        targetExpressions: ["I need to go to ___", "Is it far?", "Turn left/right"],
        previouslyLearned: ["Exit", "Subway", "Taxi", "Where is ___?", "Excuse me. Do you speak English?", "This is delicious", "Where is the subway?"],
        speakAfter: true,
        storyReason: "Build directions to navigate from the market to Sujin's lab.",
        storyConsequence: "You reach Sujin's linguistics lab at the university.",
        onFail: { addToWeakExpressions: ["I need to go to ___", "Is it far?"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            instruction: { en: "Arrange the words to form the directions to the Guardian Stone inside Namsan Tower:", ko: "단어를 배열해서 남산타워 안 수호석으로 가는 길을 만드세요:", es: "Ordena las palabras para formar las direcciones a la Piedra Guardiana dentro de la Torre Namsan:" },
            words: [
              { en: "Excuse me", ko: "실례합니다", es: "Disculpe" },
              { en: "where is", ko: "어디에", es: "dónde está" },
              { en: "the old", ko: "오래된", es: "la vieja" },
              { en: "door", ko: "문이", es: "puerta" },
              { en: "turn left", ko: "왼쪽으로", es: "gire a" },
              { en: "please", ko: "주세요", es: "la izquierda" },
            ],
            answerOrder: [0, 1, 2, 3, 4, 5],
          },
        ],
        hints: {
          h1: {
            ko: "문장은 'Excuse me'로 시작해 — 길을 물을 때 가장 먼저 하는 말이야",
            en: "The sentence starts with 'Excuse me' — the first thing you say when asking for directions",
            es: "La frase empieza con 'Excuse me' — lo primero que dices al pedir direcciones",
            byLearning: {
              spanish: { ko: "문장은 'Disculpe'로 시작해", en: "The sentence starts with 'Disculpe'", es: "La frase empieza con 'Disculpe'" },
              korean:  { ko: "문장은 '실례합니다'로 시작해", en: "The sentence starts with '실례합니다'", es: "La frase empieza con '실례합니다'" },
            },
          },
          h2: {
            ko: "먼저 장소를 묻고 (where is the old door), 그다음 방향을 알려줘 (turn left please)",
            en: "First ask for the place (where is the old door), then give the direction (turn left please)",
            es: "Primero pregunta por el lugar (where is the old door), luego la dirección (turn left please)",
            byLearning: {
              spanish: { ko: "먼저 장소를 물어 (dónde está la vieja puerta), 그다음 방향 (gire a la izquierda)", en: "First the place (dónde está la vieja puerta), then direction (gire a la izquierda)", es: "Primero el lugar (dónde está la vieja puerta), luego dirección (gire a la izquierda)" },
              korean:  { ko: "먼저 장소를 물어 (오래된 문이 어디에), 그다음 방향 (왼쪽으로 주세요)", en: "First the place (오래된 문이 어디에), then direction (왼쪽으로 주세요)", es: "Primero el lugar (오래된 문이 어디에), luego dirección (왼쪽으로 주세요)" },
            },
          },
          h3: {
            ko: "구조: Excuse me(인사) → where is(질문) → the old(형용사) → door(장소) → turn left(방향) → please(예절)",
            en: "Structure: Excuse me(greeting) → where is(question) → the old(adjective) → door(place) → turn left(direction) → please(polite)",
            es: "Estructura: Excuse me(saludo) → where is(pregunta) → the old(adjetivo) → door(lugar) → turn left(dirección) → please(cortesía)",
            byLearning: {
              spanish: { ko: "구조: Disculpe → dónde está → la vieja → puerta → gire a → la izquierda", en: "Structure: Disculpe → dónde está → la vieja → puerta → gire a → la izquierda", es: "Estructura: Disculpe → dónde está → la vieja → puerta → gire a → la izquierda" },
              korean:  { ko: "구조: 실례합니다 → 어디에 → 오래된 → 문이 → 왼쪽으로 → 주세요", en: "Structure: 실례합니다 → 어디에 → 오래된 → 문이 → 왼쪽으로 → 주세요", es: "Estructura: 실례합니다 → 어디에 → 오래된 → 문이 → 왼쪽으로 → 주세요" },
            },
          },
        },
      },
      // ── Scene 5: Namsan Tower — Mr. Black Appears ──────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Namsan Tower. Night. The city of Seoul spreads out below like a circuit board of light. Rudy, Sujin, and Minho reach the observation deck. Behind a locked maintenance door — an inscription in old Korean. Sujin translates. Then a voice from behind them. Calm. Familiar. Mr. Black.)",
        textKo: "(남산타워. 밤. 서울 도시가 아래로 빛의 회로판처럼 펼쳐진다. 루디, 수진, 민호가 전망대에 도착한다. 잠긴 관리실 문 뒤에 — 고대 한국어 비문. 수진이 번역한다. 그때 뒤에서 들리는 목소리. 차분한. 익숙한. 미스터 블랙.)",
        textEs: "(Torre Namsan. Noche. La ciudad de Seúl se extiende abajo como un tablero de circuitos de luz. Rudy, Sujin y Minho llegan a la plataforma de observación. Detrás de una puerta de mantenimiento cerrada — una inscripción en coreano antiguo. Sujin traduce. Entonces una voz detrás de ellos. Tranquila. Familiar. Mr. Black.)",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "Good evening, detective. Hello. You found the door. I am impressed. You are learning fast. But the stone is not here. I have it. Thank you for showing me where it was.",
        textKo: "안녕하세요, 탐정. 문을 찾았군요. 감동이에요. 빨리 배우시네요. 하지만 수호석은 여기 없어요. 제가 갖고 있어요. 어디에 있는지 알려줘서 감사합니다.",
        textEs: "Buenas noches, detective. Hola. Encontraste la puerta. Estoy impresionado. Estás aprendiendo rápido. Pero la piedra no está aquí. La tengo yo. Gracias por mostrarme dónde estaba.",
      },
      {
        kind: "scene",
        charId: "sujin",
        text: "You used us. You knew we would find the inscription before you could read it yourself. Your Korean is not good enough to read the old script — so you waited for someone who could.",
        textKo: "우리를 이용했군요. 당신이 직접 읽기 전에 우리가 비문을 찾을 줄 알았던 거예요. 당신의 한국어 실력으로는 옛 문체를 읽을 수 없으니까 — 읽을 수 있는 사람을 기다린 거예요.",
        textEs: "Nos usaste. Sabías que encontraríamos la inscripción antes de que pudieras leerla tú mismo. Tu coreano no es suficiente para leer la escritura antigua — así que esperaste a alguien que pudiera.",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "You are correct. Goodbye, Seoul. *leaves a folded note on the railing and walks into the elevator*",
        textKo: "맞아요. 안녕히 계세요, 서울. *난간에 접힌 메모를 두고 엘리베이터로 걸어간다*",
        textEs: "Tienes razón. Adiós, Seúl. *deja una nota doblada en la barandilla y camina hacia el ascensor*",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Mr. Black disappears into the elevator. On the railing — a folded note. Rudy picks it up. The entire note is written in Korean. No English. No Spanish. Just Korean. He left it knowing that Rudy would have to read it himself.)",
        textKo: "(미스터 블랙이 엘리베이터로 사라진다. 난간 위에 — 접힌 메모. 루디가 집어든다. 메모 전체가 한국어로 쓰여 있다. 영어 없음. 스페인어 없음. 오직 한국어. 루디가 직접 읽어야 한다는 것을 알고 남긴 것이다.)",
        textEs: "(Mr. Black desaparece en el ascensor. En la barandilla — una nota doblada. Rudy la recoge. La nota entera está escrita en coreano. Sin inglés. Sin español. Solo coreano. La dejó sabiendo que Rudy tendría que leerla él mismo.)",
      },
      {
        kind: "puzzle",
        puzzleNum: 5,
        pType: "investigation",
        tprsStage: 4,
        targetExpressions: ["Exit", "Where is ___?", "Excuse me", "I need to go to ___"],
        previouslyLearned: ["Exit", "Subway", "Taxi", "Where is ___?", "How much?", "I need to go to ___", "Is it far?", "Turn left/right"],
        speakAfter: true,
        storyReason: "Decode the Korean inscription on the Guardian Stone to prove its authenticity.",
        storyConsequence: "You recover the stone — but Mr. Black was watching the whole time.",
        onFail: { addToWeakExpressions: ["Where is ___?", "Excuse me"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            prompt: { en: "Mr. Black's note is in Korean only. Which line reveals where he is going next?", ko: "미스터 블랙의 메모가 한국어로만 되어 있어. 어느 줄이 다음 행선지를 알려줄까?", es: "La nota de Mr. Black está solo en coreano. ¿Qué línea revela adónde va después?" },
            clues: [
              { en: "'감사합니다, 탐정' — 'Thank you, detective'", ko: "'감사합니다, 탐정' — 감사 인사", es: "'감사합니다, 탐정' — 'Gracias, detective'" },
              { en: "'잘했어요. 다음은 카이로예요.' — 'Well done. Next is Cairo.'", ko: "'잘했어요. 다음은 카이로예요.' — 다음 목적지", es: "'잘했어요. 다음은 카이로예요.' — 'Bien hecho. El siguiente es El Cairo.'" },
              { en: "'안녕히 계세요' — 'Goodbye'", ko: "'안녕히 계세요' — 작별 인사", es: "'안녕히 계세요' — 'Adiós'" },
              { en: "'저는 미스터 블랙입니다' — 'I am Mr. Black'", ko: "'저는 미스터 블랙입니다' — 자기소개", es: "'저는 미스터 블랙입니다' — 'Soy Mr. Black'" },
            ],
            answerIdx: 1,
          },
        ],
        hints: {
          h1: { ko: "어느 줄에 장소 이름이 있는지 찾아봐 — 미스터 블랙은 항상 다음 목적지를 남겨", en: "Look for which line contains a place name — Mr. Black always leaves his next destination", es: "Busca qué línea contiene un nombre de lugar — Mr. Black siempre deja su próximo destino" },
          h2: { ko: "카이로는 도시 이름이야 — 그 단어가 포함된 줄이 다음 행선지야", en: "Cairo is a city name — the line containing that word reveals the next destination", es: "El Cairo es el nombre de una ciudad — la línea que contiene esa palabra revela el próximo destino" },
          h3: { ko: "'잘했어요. 다음은 카이로예요.' — 잘했어요=well done, 다음=next, 카이로=Cairo", en: "'잘했어요. 다음은 카이로예요.' — 잘했어요=well done, 다음=next, 카이로=Cairo", es: "'잘했어요. 다음은 카이로예요.' — 잘했어요=bien hecho, 다음=siguiente, 카이로=El Cairo" },
        },
      },
      // ── Scene 6: The Emotional Payoff — Reading Korean ─────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Silence on the observation deck. Minho looks at Rudy. Sujin looks at Rudy. The note is in his hands. Korean characters. No translation. No help. This is the moment — can the player actually read Korean now?)",
        textKo: "(전망대의 침묵. 민호가 루디를 본다. 수진이 루디를 본다. 메모가 루디의 손에 있다. 한국어 글자. 번역 없음. 도움 없음. 이 순간이다 — 플레이어가 정말로 한국어를 읽을 수 있을까?)",
        textEs: "(Silencio en la plataforma de observación. Minho mira a Rudy. Sujin mira a Rudy. La nota está en sus manos. Caracteres coreanos. Sin traducción. Sin ayuda. Este es el momento — ¿puede el jugador realmente leer coreano ahora?)",
      },
      {
        kind: "clue",
        symbol: "📝",
        titleEn: "Mr. Black's Note — Korean Only",
        titleKo: "미스터 블랙의 메모 — 한국어로만",
        titleEs: "Nota de Mr. Black — Solo en Coreano",
        descEn: "잘했어요. 다음은 카이로예요. 언어는 문이에요. 저는 열쇠를 갖고 있어요. — No English translation provided.",
        descKo: "잘했어요. 다음은 카이로예요. 언어는 문이에요. 저는 열쇠를 갖고 있어요.",
        descEs: "잘했어요. 다음은 카이로예요. 언어는 문이에요. 저는 열쇠를 갖고 있어요. — Sin traducción al español.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "...'잘했어요.' Well done. '다음은 카이로예요.' Next is Cairo. '언어는 문이에요.' Language is a door. '저는 열쇠를 갖고 있어요.' I have the key. *long pause* Partner. I just read that. In Korean. Thirty days ago I could barely say hello. And I just read a threat written by the most dangerous man alive. I hate that I understood every word. But also... I kind of love it.",
        textKo: "...'잘했어요.' 잘했다고. '다음은 카이로예요.' 다음은 카이로. '언어는 문이에요.' 언어는 문이래. '저는 열쇠를 갖고 있어요.' 열쇠를 갖고 있대. *긴 침묵* 파트너. 방금 그걸 읽었어. 한국어로. 30일 전에는 안녕하세요도 겨우 했는데. 그리고 지금 세상에서 가장 위험한 남자가 쓴 협박을 읽었어. 한 마디도 빠짐없이 이해했다는 게 너무 싫어. 하지만 동시에... 좀 좋기도 해.",
        textEs: "...'잘했어요.' Bien hecho. '다음은 카이로예요.' El siguiente es El Cairo. '언어는 문이에요.' El lenguaje es una puerta. '저는 열쇠를 갖고 있어요.' Tengo la llave. *una larga pausa* Compañero. Acabo de leer eso. En coreano. Hace treinta días apenas podía decir hola. Y acabo de leer una amenaza escrita por el hombre más peligroso del mundo. Odio haber entendido cada palabra. Pero también... me encanta un poco.",
      },
      {
        kind: "scene",
        charId: "minho",
        text: "Bro. You just READ that?! Without help?! OK I take it back, you are not a microwave-manual robot. You are actually kind of impressive. Sujin, did you see that?!",
        textKo: "야. 방금 그거 읽었어?! 도움 없이?! 나 아까 한 말 취소. 전자레인지 설명서 로봇 아니야. 솔직히 좀 대단해. 수진 누나, 봤어?!",
        textEs: "¡Tío! ¿¡Acabas de LEER eso?! ¿¡Sin ayuda?! OK retiro lo dicho, no eres un robot de manual de microondas. En realidad eres bastante impresionante. ¡Sujin, ¿viste eso?!",
      },
      {
        kind: "scene",
        charId: "sujin",
        text: "I saw it. *small smile — the first one* Eleanor was right about you after all. Cairo. We need to warn our contacts there. Mr. Black has the Seoul stone — but he showed us something important: his Korean is not perfect. He needed US to find the inscription. That is his weakness.",
        textKo: "봤어. *작은 미소 — 처음으로* 결국 엘리너가 맞았네요. 카이로. 거기 연락책에 알려야 해요. 미스터 블랙이 서울 수호석을 가져갔지만 — 중요한 걸 보여줬어요: 그의 한국어는 완벽하지 않아요. 비문을 찾으려면 우리가 필요했어요. 그게 약점이에요.",
        textEs: "Lo vi. *pequeña sonrisa — la primera* Eleanor tenía razón sobre ti después de todo. El Cairo. Necesitamos avisar a nuestros contactos allí. Mr. Black tiene la piedra de Seúl — pero nos mostró algo importante: su coreano no es perfecto. Nos necesitó para encontrar la inscripción. Esa es su debilidad.",
      },
      {
        kind: "scene",
        charId: "youngsook",
        text: "*arrives with a container of food* For the plane. You cannot chase a villain on an empty stomach. Remember what I taught you, fox boy. Every word you learned at my table — those are your weapons now.",
        textKo: "*음식 용기를 들고 도착하며* 비행기에서 먹어. 빈 속으로 악당을 쫓을 수는 없단다. 내가 가르친 것 기억해, 여우 도련님. 내 밥상에서 배운 모든 단어 — 그게 이제 네 무기야.",
        textEs: "*llega con un recipiente de comida* Para el avión. No puedes perseguir a un villano con el estómago vacío. Recuerda lo que te enseñé, chico zorro. Cada palabra que aprendiste en mi mesa — esas son tus armas ahora.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Next Chapter: The Cairo Legacy — The stones are counting down.)",
        textKo: "(다음 챕터: 카이로의 유산 — 수호석이 카운트다운 중이다.)",
        textEs: "(Siguiente Capítulo: El Legado de El Cairo — Las piedras están en cuenta regresiva.)",
      },
    ],
  },

  /* ════════════════ CHAPTER 4: CAIRO ════════════════ */
  cairo: {
    id: "cairo",
    title: "The Cairo Legacy",
    titleKo: "카이로의 유산",
    titleEs: "El Legado de El Cairo",
    gradient: ["#1a0d00", "#2e1a00", "#1a0d00"],
    accentColor: "#D4A017",
    nextChapterId: "babel",
    /* ── Language Ratio: 85% targetLang / 15% nativeLang ──────────────────────
     * CEFR A2-B1 — pre-intermediate. User has completed Day 1-48.
     * NPC dialogue should be ALMOST entirely targetLang with minimal native
     * scaffolding only for complex plot exposition or emotional beats.
     * The current 100% English text is very close to the intended ratio.
     * TODO: Optionally add textKoMix/textEsMix with ~15% native scaffolding.
     */
    chapterMeta: {
      cefrLevel: "B1",
      targetLangRatio: 85,
      knownExpressions: [
        "Hello", "Goodbye", "Nice to meet you", "My name is ___",
        "I'm from ___", "Where is ___?", "How much?",
        "Thank you", "I don't understand", "Help", "Yes", "No",
        "Excuse me", "I'm sorry", "Can you repeat that?",
        "I need ___", "Do you speak ___?", "How do you say ___?",
        "What time is it?", "I like ___", "I want ___",
        "Can I have ___?", "Where is the ___?", "How do I get to ___?",
        "It's delicious", "I'm lost", "Please help me",
        "What does ___ mean?", "Speak slowly please", "I'm learning ___",
        "I agree", "I disagree", "In my opinion ___",
        "Could you explain ___?", "What happened?", "I'm worried about ___",
        "It's important because ___", "I used to ___", "I've never ___",
        "If I were you ___", "The reason is ___", "Let me think about it",
        "Are you sure?", "That makes sense", "I don't think so",
        "What do you recommend?", "It depends on ___", "I'm looking for ___",
      ],
      languageNote:
        "Ch4 dialogue should be ~85% English (targetLang) / ~15% native. " +
        "The current 100% English textKo/textEs translations are close to correct. " +
        "At this level learners handle most communication independently.",
    },
    characters: [
      { id: "lingo",    emoji: "🦊",  name: "Detective Rudy",  nameKo: "루디 탐정",    side: "left",  avatarBg: "#2c1810", isLingo: true },
      { id: "amira",    emoji: "👩‍🏫", name: "Professor Amira", nameKo: "아미라 교수",  side: "right", avatarBg: "#2A1A00" },
      { id: "hassan",   emoji: "🧑‍🤝‍🧑", name: "Hassan",         nameKo: "하산",         side: "right", avatarBg: "#1A1500" },
      { id: "penny",    emoji: "📚",  name: "Miss Penny",      nameKo: "미스 페니",    side: "right", avatarBg: "#1A0A2A" },
      { id: "mr_black", emoji: "🕴️", name: "Mr. Black",       nameKo: "미스터 블랙",  side: "right", avatarBg: "#0A0A0A" },
    ],
    sequence: [
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Cairo International Airport. Rudy opens his Arabic phrasebook — bought the night before in Seoul. Every page is blank. The cover is there. The words inside are gone. As if someone erased every letter.)",
        textKo: "(카이로 국제공항. 루디가 아랍어 회화집을 펼친다 — 서울에서 전날 밤 산 것. 모든 페이지가 비어 있다. 표지는 있다. 안의 단어들이 사라졌다. 누군가 모든 글자를 지운 것처럼.)",
        textEs: "(Aeropuerto Internacional de El Cairo. Rudy abre su libro de frases árabe — comprado la noche anterior en Seúl. Cada página está en blanco. La portada está ahí. Las palabras de dentro han desaparecido. Como si alguien hubiera borrado cada letra.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Mr. Black erased my phrasebook. Before I even landed. He's not just ahead of me — he's arranging the board before I sit down. Fine. I survived London with no clues, Madrid without the stone, Seoul with no phone. Cairo with no phrasebook? Just another Tuesday.",
        textKo: "미스터 블랙이 내 회화집을 지웠어. 내가 도착하기도 전에. 단순히 앞서가는 게 아니야 — 내가 앉기도 전에 판을 짜고 있어. 좋아. 런던에선 단서 없이, 마드리드에선 수호석 없이, 서울에선 핸드폰 없이 살아남았어. 카이로에서 회화집 없이? 그냥 또 하나의 화요일이야.",
        textEs: "Mr. Black borró mi libro de frases. Antes de que aterrizara. No solo va por delante — está armando el tablero antes de que me siente. Bien. Sobreviví Londres sin pistas, Madrid sin la piedra, Seúl sin teléfono. ¿El Cairo sin libro de frases? Solo otro martes.",
      },
      {
        kind: "scene",
        charId: "amira",
        text: "You're Rudy. The fox detective. Sujin told me about you. Three cities. Zero stones recovered. Forgive me if I'm not impressed. Before I trust you with anything — prove you can actually communicate. Name these objects in three languages.",
        textKo: "루디지. 여우 탐정. 수진이 말해줬어. 세 도시. 되찾은 수호석 제로. 감동 안 받은 거 이해해줘. 뭔가를 믿기 전에 — 실제로 소통할 수 있는지 증명해봐. 이 물건들의 이름을 세 개 언어로 말해봐.",
        textEs: "Eres Rudy. El detective zorro. Sujin me habló de ti. Tres ciudades. Cero piedras recuperadas. Perdóname si no estoy impresionada. Antes de confiarte cualquier cosa — demuestra que puedes comunicarte. Di el nombre de estos objetos en tres idiomas.",
      },
      {
        kind: "puzzle",
        puzzleNum: 1,
        pType: "word-match",
        tprsStage: 1,
        targetExpressions: ["Map", "Key", "Water", "Danger"],
        previouslyLearned: ["Hello", "Thank you", "Where is ___?", "Excuse me", "I need help", "I need to go to ___", "Turn left/right"],
        speakAfter: true,
        storyReason: "Mr. Black erased your phrasebook. Match the survival words from the pyramid signs.",
        storyConsequence: "You navigate the first corridor of the pyramid.",
        onFail: { addToWeakExpressions: ["Map", "Key", "Water"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            word: { en: "map", ko: "지도", es: "mapa" },
            meaning: { en: "a drawing that shows roads and places", ko: "길과 장소를 보여주는 그림", es: "un dibujo que muestra calles y lugares" },
            wrong: [
              { en: "a type of food", ko: "음식 종류", es: "un tipo de comida" },
              { en: "a musical instrument", ko: "악기", es: "un instrumento musical" },
              { en: "a police station", ko: "경찰서", es: "una estación de policía" },
            ],
          },
          {
            word: { en: "key", ko: "열쇠", es: "llave" },
            meaning: { en: "a small object used to open a lock", ko: "잠금장치를 여는 작은 물건", es: "un pequeño objeto para abrir una cerradura" },
            wrong: [
              { en: "a secret document", ko: "비밀 문서", es: "un documento secreto" },
              { en: "a type of weather", ko: "날씨 종류", es: "un tipo de clima" },
              { en: "a building entrance", ko: "건물 입구", es: "una entrada de edificio" },
            ],
          },
          {
            word: { en: "water", ko: "물", es: "agua" },
            meaning: { en: "a clear liquid you drink", ko: "마시는 투명한 액체", es: "un líquido claro que bebes" },
            wrong: [
              { en: "a type of stone", ko: "돌의 종류", es: "un tipo de piedra" },
              { en: "a city district", ko: "도시 구역", es: "un distrito de la ciudad" },
              { en: "a formal letter", ko: "공식 서한", es: "una carta formal" },
            ],
          },
        ],
        hints: {
          h1: { ko: "이 세 단어는 기초 단어야 — 일상에서 가장 자주 쓰이는 것들", en: "These three words are basics — the most frequently used in everyday life", es: "Estas tres palabras son básicas — las más usadas en la vida cotidiana" },
          h2: { ko: "루디가 이미 배웠어: 지도는 길 찾기, 열쇠는 잠금/열기, 물은 마시기", en: "Rudy already learned these: map for navigation, key for locks, water for drinking", es: "Rudy ya aprendió: mapa para navegar, llave para cerraduras, agua para beber" },
          h3: { ko: "영어: map / key / water — 스페인어: mapa / llave / agua — 한국어: 지도 / 열쇠 / 물", en: "English: map / key / water — Spanish: mapa / llave / agua — Korean: 지도 / 열쇠 / 물", es: "Inglés: map / key / water — Español: mapa / llave / agua — Coreano: 지도 / 열쇠 / 물" },
        },
      },
      {
        kind: "scene",
        charId: "amira",
        text: "Not bad. Not perfect, but not bad. You know more than Sujin warned me. Come. My cousin Hassan is at the souk. He talks too much, knows too much, and cannot keep a secret to save his life. He's exactly what we need.",
        textKo: "나쁘지 않아. 완벽하지는 않지만 나쁘지 않아. 수진이 경고한 것보다 많이 알고 있네. 가자. 사촌 하산이 수크에 있어. 말이 너무 많고, 아는 게 너무 많고, 비밀을 절대 못 지켜. 정확히 우리에게 필요한 사람이야.",
        textEs: "Nada mal. No perfecto, pero nada mal. Sabes más de lo que Sujin me advirtió. Ven. Mi primo Hassan está en el zoco. Habla demasiado, sabe demasiado, y no puede guardar un secreto ni para salvar su vida. Es exactamente lo que necesitamos.",
      },
      {
        kind: "scene",
        charId: "hassan",
        text: "*gestures expansively at his stall* Welcome! Welcome! You want spices? Silk? Information about a man in a black coat who was here yesterday asking about the old excavation site? I tell you everything! Very reasonable price!",
        textKo: "*가판대를 향해 활짝 손짓하며* 어서 오세요! 어서 오세요! 향신료 원해요? 비단? 어제 오래된 발굴 현장에 대해 묻고 다닌 검은 코트 남자에 대한 정보? 다 말해줄게요! 아주 합리적인 가격에!",
        textEs: "*gesticula ampliamente hacia su puesto* ¡Bienvenido! ¡Bienvenido! ¿Quieres especias? ¿Seda? ¿Información sobre un hombre de abrigo negro que estuvo aquí ayer preguntando sobre el viejo sitio de excavación? ¡Te cuento todo! ¡Precio muy razonable!",
      },
      {
        kind: "puzzle",
        puzzleNum: 2,
        pType: "dialogue-choice",
        tprsStage: 2,
        targetExpressions: ["I need help", "Where is ___?", "Be careful"],
        previouslyLearned: ["Map", "Key", "Water", "Danger", "Where is ___?", "Thank you", "Excuse me"],
        speakAfter: true,
        storyReason: "Hassan is leading you through the souk. Choose wisely — not everyone here is friendly.",
        storyConsequence: "You identify the informant and get the pyramid entrance coordinates.",
        onFail: { addToWeakExpressions: ["I need help", "Be careful"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            prompt: { en: "Hassan keeps mixing clues with sales pitches. How do you get him to focus?", ko: "하산이 단서와 판매 권유를 계속 섞고 있어. 어떻게 집중하게 해?", es: "Hassan mezcla pistas con ventas. ¿Cómo lo concentras?" },
            context: { en: "Hassan: 'The man in black — very serious, very pale — he bought nothing! Can you believe? Not even a small carpet. Then he asked me: where is the stone that does not move? Very strange question.'", ko: "하산: '검은 남자 — 아주 심각하고, 아주 창백해 — 아무것도 안 샀어요! 믿을 수 있어요? 작은 카펫도 아니고. 그러더니 물어보더라고요: 움직이지 않는 돌이 어디 있냐고? 아주 이상한 질문.'", es: "Hassan: 'El hombre de negro — muy serio, muy pálido — ¡no compró nada! ¿Puedes creerlo? Ni siquiera una pequeña alfombra. Luego me preguntó: ¿dónde está la piedra que no se mueve? Pregunta muy extraña.'" },
            answer: { en: "'The stone that does not move' — that's an ancient guardian name. Hassan, did he say anything about where he was going next?", ko: "'움직이지 않는 돌' — 그건 고대 수호자의 이름이야. 하산, 그 다음에 어디 간다고 말했어?", es: "'La piedra que no se mueve' — ese es un nombre guardián antiguo. Hassan, ¿dijo algo sobre adónde iba después?" },
            wrong: [
              { en: "Please just answer the question and stop selling things.", ko: "제발 질문에만 답하고 물건 팔지 마.", es: "Por favor solo responde la pregunta y deja de vender cosas." },
              { en: "I'll buy a carpet if you tell me more.", ko: "더 말해주면 카펫 살게.", es: "Compro una alfombra si me cuentas más." },
            ],
          },
          {
            prompt: { en: "Hassan mentions 'the dig at Saqqara.' Amira goes silent. What do you ask?", ko: "하산이 '사카라 발굴지'를 언급해. 아미라가 침묵한다. 뭘 물어봐?", es: "Hassan menciona 'la excavación de Saqqara.' Amira queda en silencio. ¿Qué preguntas?" },
            context: { en: "Hassan: 'The stone — it's not at the museum. It's at Saqqara. The old dig site. My cousin knows.' *Amira turns pale*", ko: "하산: '돌 — 박물관에 없어요. 사카라에 있어요. 옛날 발굴 현장. 사촌이 알아요.' *아미라가 창백해진다*", es: "Hassan: 'La piedra — no está en el museo. Está en Saqqara. El viejo sitio de excavación. Mi prima lo sabe.' *Amira se pone pálida*" },
            answer: { en: "Amira. You knew where it was all along. That's why Mr. Black came to you first.", ko: "아미라. 처음부터 어디 있는지 알고 있었어. 그래서 미스터 블랙이 먼저 너한테 온 거야.", es: "Amira. Sabías dónde estaba todo el tiempo. Por eso Mr. Black vino a ti primero." },
            wrong: [
              { en: "Hassan, stop revealing family secrets in a market.", ko: "하산, 시장에서 가족 비밀 그만 폭로해.", es: "Hassan, deja de revelar secretos familiares en el mercado." },
              { en: "The dig site is too dangerous. We should call the police.", ko: "발굴 현장은 너무 위험해. 경찰을 불러야 해.", es: "El sitio de excavación es muy peligroso. Deberíamos llamar a la policía." },
            ],
          },
        ],
        hints: {
          h1: { ko: "탐정의 역할은 정보를 수집하는 거야 — 대화를 통제하고 핵심 단서에 집중해", en: "A detective's job is to collect information — control the conversation and focus on key clues", es: "El trabajo del detective es recopilar información — controla la conversación y céntrate en las pistas clave" },
          h2: { ko: "하산의 말 중 의미 있는 부분은 '움직이지 않는 돌'과 '사카라'야 — 이것들을 연결해봐", en: "The meaningful parts of Hassan's speech are 'the stone that does not move' and 'Saqqara' — connect them", es: "Las partes significativas del discurso de Hassan son 'la piedra que no se mueve' y 'Saqqara' — conéctalas" },
          h3: { ko: "아미라의 반응이 단서야 — 그녀가 침묵하는 이유를 물어봐", en: "Amira's reaction is the clue — ask her why she went silent", es: "La reacción de Amira es la pista — pregúntale por qué se quedó en silencio" },
        },
      },
      {
        kind: "scene",
        charId: "amira",
        text: "My family has protected the Cairo stone for four generations. My grandmother hid it at Saqqara during the war. My mother guarded it. I study it. And then... someone else came first. A woman. With a book of literary quotes and very tired eyes.",
        textKo: "우리 가족은 4대에 걸쳐 카이로 수호석을 지켜왔어. 할머니가 전쟁 중에 사카라에 숨겼어. 어머니가 지켰어. 나는 연구해. 그리고... 다른 누군가가 먼저 왔어. 한 여자. 문학 인용구가 가득한 책을 들고 피곤한 눈을 한.",
        textEs: "Mi familia ha protegido la piedra de El Cairo por cuatro generaciones. Mi abuela la escondió en Saqqara durante la guerra. Mi madre la guardó. Yo la estudio. Y luego... alguien más llegó primero. Una mujer. Con un libro lleno de citas literarias y ojos muy cansados.",
      },
      {
        kind: "puzzle",
        puzzleNum: 3,
        pType: "writing-mission",
        tprsStage: 3,
        targetExpressions: ["Where is the market?", "How far is it?", "Thank you for your help"],
        previouslyLearned: ["Map", "Key", "Water", "Danger", "I need help", "Where is ___?", "Be careful"],
        speakAfter: true,
        storyReason: "Navigate Cairo with no phrasebook — write directions from memory.",
        storyConsequence: "A local helps you find the hidden entrance to the pyramid.",
        onFail: { addToWeakExpressions: ["Where is the market?", "How far is it?"], reviewInDailyCourse: true, reviewDays: 3 },
        title: { en: "Navigate Cairo", ko: "카이로에서 길 찾기", es: "Navegar El Cairo" },
        context: { en: "Your phrasebook is blank. Ask for directions using only what you remember!", ko: "회화집이 비었어요. 기억나는 것만으로 길을 물어보세요!", es: "Tu libro de frases está en blanco. ¡Pide direcciones usando solo lo que recuerdas!" },
        questions: [
          { word: { en: "Excuse me, where is the market?", ko: "실례합니다, 시장이 어디에 있나요?", es: "Disculpe, ¿dónde está el mercado?" }, hint: { en: "Ask for the market location", ko: "시장 위치를 물어보세요", es: "Pregunta por la ubicación del mercado" }, acceptableAnswers: ["excuse me where is the market", "where is the market", "where's the market"] },
          { word: { en: "How far is it from here?", ko: "여기서 얼마나 멀어요?", es: "¿Qué tan lejos está de aquí?" }, hint: { en: "Ask about the distance", ko: "거리를 물어보세요", es: "Pregunta la distancia" }, acceptableAnswers: ["how far is it from here", "how far is it", "how far from here"] },
          { word: { en: "Thank you for your help.", ko: "도움 감사합니다.", es: "Gracias por su ayuda." }, hint: { en: "Thank the local", ko: "현지인에게 감사하세요", es: "Agradece al local" }, acceptableAnswers: ["thank you for your help", "thanks for your help", "thank you for helping"] },
        ],
      },
      {
        kind: "scene",
        charId: "penny",
        text: "*steps from shadow behind a pillar* Hello, detective. You look surprised. You shouldn't be — I've been following you since London. I helped build the Universal Code. I thought it would create understanding between people. *voice breaks* I was wrong. And I need to make it right.",
        textKo: "*기둥 뒤 그늘에서 나서며* 안녕하세요, 탐정님. 놀란 것 같네요. 그러지 마세요 — 런던부터 계속 따라다녔어요. 저는 유니버설 코드를 만드는 걸 도왔어요. 사람들 사이에 이해를 만들 줄 알았어요. *목소리가 갈라지며* 틀렸어요. 그리고 바로잡아야 해요.",
        textEs: "*sale de las sombras detrás de un pilar* Hola, detective. Parece sorprendido. No debería — lo he seguido desde Londres. Ayudé a construir el Código Universal. Pensé que crearía entendimiento entre las personas. *la voz se quiebra* Estaba equivocada. Y necesito arreglarlo.",
        idiomRef: "idiom_penny_1",
      },
      {
        kind: "puzzle",
        puzzleNum: 4,
        pType: "fill-blank",
        tprsStage: 4,
        targetExpressions: ["Near the ___", "At midnight", "The key is ___"],
        previouslyLearned: ["Map", "Key", "Water", "Danger", "I need help", "Be careful", "Where is the market?", "How far is it?"],
        speakAfter: true,
        storyReason: "Amira's research notes have missing words. Fill them in to find the stone's location.",
        storyConsequence: "You discover the stone is hidden in the pyramid's lowest chamber.",
        onFail: { addToWeakExpressions: ["Near the ___", "The key is ___"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            sentence: { en: "Miss Penny's encoded message: 'The stone is ___ the pyramid, where pharaohs first climbed toward the sky.'", ko: "미스 페니의 암호 메시지: '수호석은 파라오가 처음으로 하늘을 향해 올라간 곳, 피라미드 ___ 있어요.'", es: "El mensaje codificado de Miss Penny: 'La piedra está ___ la pirámide, donde los faraones subían por primera vez hacia el cielo.'" },
            answer: { en: "near", ko: "근처에", es: "cerca de" },
            opts: [
              { en: "far from", ko: "멀리", es: "lejos de" },
              { en: "on your left", ko: "왼쪽에", es: "a tu izquierda" },
            ],
            hints: {
              h1: { ko: "파라오가 '하늘을 향해 올라가는' 장소는 무엇일까? 수호석은 그 장소 가까이에 숨겨져 있어", en: "What place has pharaohs 'climbing toward the sky'? The stone is hidden close to that place", es: "¿Qué lugar tiene a los faraones 'subiendo hacia el cielo'? La piedra está escondida cerca de ese lugar" },
              h2: { ko: "사카라 계단 피라미드 — 수호석은 멀리 있는 게 아니라 바로 근처에 있어", en: "Saqqara step pyramid — the stone isn't far away, it's right nearby", es: "Pirámide escalonada de Saqqara — la piedra no está lejos, está justo cerca" },
              h3: { ko: "답: near (근처에). 수호석은 사카라 피라미드 근처에 숨겨져 있어", en: "Answer: near. The stone is hidden near Saqqara's pyramid", es: "Respuesta: near (cerca de). La piedra está escondida cerca de la pirámide de Saqqara" },
            },
          },
          {
            sentence: { en: "Penny's warning: 'He plans to use all seven stones at ___. After that, the Universal Code cannot be reversed.'", ko: "페니의 경고: '그는 ___에 7개의 수호석 모두를 사용할 계획이야. 그 후에는 유니버설 코드를 되돌릴 수 없어.'", es: "El aviso de Penny: 'Planea usar las siete piedras a ___. Después de eso, el Código Universal no puede revertirse.'" },
            answer: { en: "midnight", ko: "자정", es: "medianoche" },
            opts: [
              { en: "three o'clock", ko: "세 시", es: "las tres" },
              { en: "half past seven", ko: "일곱 시 반", es: "las siete y media" },
            ],
            hints: {
              h1: { ko: "미스터 블랙은 모두가 잠든 시간에 계획을 실행하려 해 — 가장 늦은 시간을 생각해봐", en: "Mr. Black plans to act when everyone is asleep — think of the latest time", es: "Mr. Black planea actuar cuando todos duermen — piensa en la hora más tarde" },
              h2: { ko: "밤 12시, 하루가 끝나고 새로운 날이 시작되는 시간", en: "12 AM, when the day ends and a new day begins", es: "Las 12 de la noche, cuando el día termina y uno nuevo empieza" },
              h3: { ko: "답: midnight (자정). 미스터 블랙은 자정에 유니버설 코드를 작동시킬 계획이야", en: "Answer: midnight. Mr. Black plans to launch the Universal Code at midnight", es: "Respuesta: midnight (medianoche). Mr. Black planea lanzar el Código Universal a medianoche" },
            },
          },
        ],
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Saqqara. The step pyramid. The oldest stone structure on Earth. Beneath the lowest step, exactly where Penny described — a small chamber. And inside the chamber, still intact, still glowing faintly: the Cairo Guardian Stone.)",
        textKo: "(사카라. 계단 피라미드. 지구상에서 가장 오래된 석조 건축물. 가장 낮은 계단 아래, 페니가 설명한 그 자리 — 작은 방이 있다. 그리고 방 안에, 여전히 온전한, 여전히 희미하게 빛나는: 카이로 수호석.)",
        textEs: "(Saqqara. La pirámide escalonada. La estructura de piedra más antigua de la Tierra. Bajo el escalón más bajo, exactamente donde Penny describió — una pequeña cámara. Y dentro de la cámara, todavía intacta, todavía brillando débilmente: la Piedra Guardiana de El Cairo.)",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "*steps out of shadow* Put it down, Detective. I just want you to understand something first. My mother spoke Welsh. Beautiful language. I was twelve when she died. In the hospital, the nurses didn't speak it. The doctors didn't speak it. She died asking for water in a language no one there understood. 'Dŵr. Dŵr.' *pause* Do you know what that means?",
        textKo: "*그늘에서 나서며* 내려놓아요, 탐정님. 먼저 한 가지를 이해해줬으면 해요. 제 어머니는 웨일스어를 했어요. 아름다운 언어. 제가 열두 살 때 돌아가셨어요. 병원에서 간호사들은 웨일스어를 몰랐어요. 의사들도 몰랐어요. 어머니는 아무도 이해 못 하는 언어로 물을 달라고 하다 돌아가셨어요. 'Dŵr. Dŵr.' *침묵* 그게 무슨 뜻인지 알아요?",
        textEs: "*sale de las sombras* Bájala, detective. Solo quiero que entiendas algo primero. Mi madre hablaba galés. Un idioma hermoso. Tenía doce años cuando murió. En el hospital, las enfermeras no lo hablaban. Los médicos tampoco. Murió pidiendo agua en un idioma que nadie allí entendía. 'Dŵr. Dŵr.' *pausa* ¿Sabe lo que significa?",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Water. It means water. *quietly* And you're going to erase every language on Earth — because no one spoke your mother's.",
        textKo: "물이요. 물이라는 뜻이에요. *조용히* 그리고 당신은 지구상의 모든 언어를 지우려 해요 — 아무도 당신 어머니의 언어를 몰랐기 때문에.",
        textEs: "Agua. Significa agua. *en voz baja* Y vas a borrar todos los idiomas de la Tierra — porque nadie hablaba el de tu madre.",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "I'm going to give everyone THE SAME language. No one will ever die alone again — unable to say what they need. No more Carlos screaming 'help' in a room where no one understands. One language. Universal. Perfect.",
        textKo: "모든 사람에게 같은 언어를 줄 거예요. 더 이상 아무도 혼자 죽지 않아도 돼요 — 필요한 걸 말하지 못해서. 카를로스처럼 '도와주세요'를 외치다가 아무도 못 알아듣는 방에서 죽지 않아도 돼요. 하나의 언어. 유니버설. 완벽해.",
        textEs: "Voy a darle a todo el mundo EL MISMO idioma. Nadie volverá a morir solo — sin poder decir lo que necesita. No más Carlos gritando 'ayuda' en una habitación donde nadie entiende. Un idioma. Universal. Perfecto.",
        idiomRef: "idiom_black_1",
      },
      {
        kind: "puzzle",
        puzzleNum: 5,
        pType: "investigation",
        tprsStage: 4,
        targetExpressions: ["Map", "Key", "Water", "Where is ___?", "Near the ___"],
        previouslyLearned: ["Map", "Key", "Water", "Danger", "I need help", "Be careful", "Where is the market?", "How far is it?", "Near the ___", "At midnight", "The key is ___"],
        speakAfter: true,
        storyReason: "Examine all evidence to find the real thief before Mr. Black escapes.",
        storyConsequence: "Miss Penny reveals herself as an ally — but Mr. Black already has 5 stones.",
        onFail: { addToWeakExpressions: ["Where is ___?", "Near the ___"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            prompt: { en: "Mr. Black's logic has a fatal flaw. Which evidence shows his plan would cause MORE harm than it prevents?", ko: "미스터 블랙의 논리에는 치명적인 결함이 있어. 어떤 증거가 그의 계획이 예방하는 것보다 더 큰 해를 끼친다는 걸 보여줘?", es: "La lógica de Mr. Black tiene un defecto fatal. ¿Qué evidencia muestra que su plan causaría MÁS daño del que previene?" },
            clues: [
              { en: "Carlos only lost his language temporarily — he recovered it. But under Universal Code, loss would be permanent for all 8 billion people.", ko: "카를로스는 일시적으로만 언어를 잃었어 — 회복했어. 하지만 유니버설 코드 하에서 80억 명 모두에게 그 상실은 영구적이야.", es: "Carlos solo perdió su idioma temporalmente — se recuperó. Pero bajo el Código Universal, la pérdida sería permanente para los 8 mil millones de personas." },
              { en: "Mr. Black's mother would have been saved if ONE nurse had learned Welsh. The Code would delete Welsh instead of teaching it.", ko: "미스터 블랙의 어머니는 간호사 한 명이 웨일스어를 배웠다면 살 수 있었어. 유니버설 코드는 웨일스어를 가르치는 대신 지울 거야.", es: "La madre de Mr. Black podría haberse salvado si UNA enfermera hubiera aprendido galés. El Código borraría el galés en lugar de enseñarlo." },
              { en: "The Universal Code eliminates all grandmother's lullabies, all first words of every child, all poetry ever written.", ko: "유니버설 코드는 모든 할머니의 자장가, 모든 아이의 첫 마디, 쓰여진 모든 시를 없애.", es: "El Código Universal elimina todas las canciones de cuna de las abuelas, todas las primeras palabras de cada niño, toda la poesía jamás escrita." },
              { en: "Mr. Black wants coffee from the vending machine on floor 3.", ko: "미스터 블랙은 3층 자판기에서 커피를 원한다.", es: "Mr. Black quiere café de la máquina expendedora del piso 3." },
            ],
            answerIdx: 1,
          },
        ],
        hints: {
          h1: { ko: "미스터 블랙의 어머니를 구할 수 있었던 방법을 생각해봐 — 언어를 지우는 것보다 더 나은 해결책이 있었어", en: "Think about what could have saved Mr. Black's mother — there was a better solution than erasing language", es: "Piensa en qué podría haber salvado a la madre de Mr. Black — había una solución mejor que borrar idiomas" },
          h2: { ko: "그의 어머니의 문제는 언어가 너무 많아서가 아니야 — 문제는 웨일스어를 아는 사람이 '없었다'는 거야. 해결책은 지우는 게 아니라 가르치는 거야", en: "His mother's problem wasn't that there were too many languages — the problem was that NO ONE knew Welsh. The solution is teaching, not erasing", es: "El problema de su madre no era que hubiera demasiados idiomas — el problema era que NADIE sabía galés. La solución es enseñar, no borrar" },
          h3: { ko: "답: 두 번째. 진짜 해결책은 웨일스어를 없애는 게 아니라, 더 많은 사람들이 웨일스어를 배우는 거야", en: "Answer: the second one. The real solution is not to delete Welsh, but to teach more people Welsh", es: "Respuesta: la segunda. La solución real no es borrar el galés, sino enseñar más galés" },
        },
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Your mother's language didn't need to be erased. It needed to be learned. By one more person. By the nurse. By the doctor. That's what language does — it spreads, it survives, it connects. Your solution kills the disease by killing the patient.",
        textKo: "어머니의 언어는 지워질 필요가 없었어요. 더 많은 사람들이 배웠어야 했어요. 간호사가. 의사가. 그게 언어가 하는 일이에요 — 퍼지고, 살아남고, 연결해요. 당신의 해결책은 환자를 죽여서 병을 치료하는 거예요.",
        textEs: "El idioma de tu madre no necesitaba ser borrado. Necesitaba ser aprendido. Por una persona más. Por la enfermera. Por el médico. Eso es lo que hace el idioma — se expande, sobrevive, conecta. Tu solución mata a la paciente para curar la enfermedad.",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "*takes the stone* I understand your argument, Detective. It's… not wrong. But I've been building this for thirty years. *vanishes into the dark* Five stones. I have five. You have two chances left. The clock has already started.",
        textKo: "*수호석을 집어들며* 당신의 논리는 이해해요, 탐정님. 틀리지 않아요. 하지만 30년 동안 이걸 만들어왔어요. *어둠 속으로 사라지며* 5개예요. 5개를 갖고 있어요. 당신에겐 두 번의 기회가 남아 있어요. 시계는 이미 돌아가고 있어요.",
        textEs: "*toma la piedra* Entiendo tu argumento, detective. No está… equivocado. Pero he estado construyendo esto durante treinta años. *desaparece en la oscuridad* Cinco piedras. Tengo cinco. Te quedan dos oportunidades. El reloj ya ha empezado.",
      },
      {
        kind: "clue",
        symbol: "🗺️",
        titleEn: "The Seven Guardian Stones",
        titleKo: "7개의 수호석",
        titleEs: "Las Siete Piedras Guardianas",
        descEn: "London (taken). Madrid (taken). Seoul (taken). Cairo (taken). Three remain. Two unknown cities. One final location. Mr. Black: 5 stones. Rudy: 0. Time: unknown.",
        descKo: "런던 (빼앗김). 마드리드 (빼앗김). 서울 (빼앗김). 카이로 (빼앗김). 세 개 남음. 두 개의 알 수 없는 도시. 하나의 최종 장소. 미스터 블랙: 5개. 루디: 0개. 시간: 알 수 없음.",
        descEs: "Londres (tomada). Madrid (tomada). Seúl (tomada). El Cairo (tomada). Quedan tres. Dos ciudades desconocidas. Una ubicación final. Mr. Black: 5 piedras. Rudy: 0. Tiempo: desconocido.",
      },
      {
        kind: "scene",
        charId: "penny",
        text: "There is one place he can be stopped. Where the Universal Code was first designed. The Babel Tower — coordinates that only the seven stones combined can reveal. But Rudy... you cannot go alone. You need everyone. Every language you've collected. Everyone who helped you.",
        textKo: "그를 막을 수 있는 장소가 하나 있어요. 유니버설 코드가 처음 설계된 곳. 바벨 타워 — 7개의 수호석이 합쳐져야만 드러나는 좌표. 하지만 루디... 혼자 갈 수 없어요. 모든 사람이 필요해요. 당신이 모은 모든 언어. 당신을 도운 모든 사람.",
        textEs: "Hay un lugar donde se le puede detener. Donde el Código Universal fue diseñado por primera vez. La Torre de Babel — coordenadas que solo las siete piedras juntas pueden revelar. Pero Rudy... no puedes ir solo. Necesitas a todos. Cada idioma que has recopilado. A todos los que te ayudaron.",
      },
    ],
  },

  /* ════════════════ CHAPTER 5: BABEL ════════════════ */
  babel: {
    id: "babel",
    title: "The Last Language",
    titleKo: "최후의 언어",
    titleEs: "El Último Idioma",
    gradient: ["#050510", "#0A0A2A", "#050510"],
    accentColor: "#8888FF",
    /* ── Language Ratio: 95% targetLang ───────────────────────────────────────
     * CEFR B1 — intermediate. User has completed all daily lessons.
     * NPC dialogue should be nearly 100% targetLang. Only the most complex
     * or emotionally critical lines might have a single native-language gloss.
     * The current 100% English text IS the intended experience for this chapter.
     * No textKoMix/textEsMix needed — learners read full English dialogue.
     */
    chapterMeta: {
      cefrLevel: "B1",
      targetLangRatio: 95,
      knownExpressions: [
        /* All previously learned expressions — full curriculum mastery */
        "Hello", "Goodbye", "Nice to meet you", "My name is ___",
        "I'm from ___", "Where is ___?", "How much?",
        "Thank you", "I don't understand", "Help", "Yes", "No",
        "Excuse me", "I'm sorry", "Can you repeat that?",
        "I need ___", "Do you speak ___?", "How do you say ___?",
        "What time is it?", "I like ___", "I want ___",
        "Can I have ___?", "Where is the ___?", "How do I get to ___?",
        "It's delicious", "I'm lost", "Please help me",
        "What does ___ mean?", "Speak slowly please", "I'm learning ___",
        "I agree", "I disagree", "In my opinion ___",
        "Could you explain ___?", "What happened?", "I'm worried about ___",
        "It's important because ___", "I used to ___", "I've never ___",
        "If I were you ___", "The reason is ___", "Let me think about it",
        "Are you sure?", "That makes sense", "I don't think so",
        "What do you recommend?", "It depends on ___", "I'm looking for ___",
        "I've been thinking about ___", "Not only ___ but also ___",
        "On the other hand ___", "As a result ___", "In conclusion ___",
      ],
      languageNote:
        "Ch5 dialogue should be ~95% English (targetLang). " +
        "The current 100% English text is the intended experience. " +
        "Learners at this level should handle full target-language dialogue.",
    },
    characters: [
      { id: "lingo",    emoji: "🦊",  name: "Detective Rudy",  nameKo: "루디 탐정",    side: "left",  avatarBg: "#2c1810", isLingo: true },
      { id: "penny",    emoji: "📚",  name: "Miss Penny",      nameKo: "미스 페니",    side: "right", avatarBg: "#1A0A2A" },
      { id: "tom",      emoji: "💂",  name: "Tom",             nameKo: "톰",           side: "left",  avatarBg: "#1E2A3A" },
      { id: "isabel",   emoji: "💃",  name: "Isabel",          nameKo: "이사벨",       side: "right", avatarBg: "#3A1A0A" },
      { id: "sujin",    emoji: "👩‍🔬", name: "Sujin",           nameKo: "수진",         side: "left",  avatarBg: "#1A2A3A" },
      { id: "mr_black", emoji: "🕴️", name: "Mr. Black",       nameKo: "미스터 블랙",  side: "right", avatarBg: "#0A0A0A" },
    ],
    sequence: [
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(The four Guardian Stones pulsed together on Rudy's desk and revealed coordinates deep in Mesopotamia. Not an ancient ruin. A modern spire of glass and steel rising from the plain — the Babel Tower. Lexicon Society headquarters. At its peak, light pulses every seven seconds, like a heartbeat.)",
        textKo: "(4개의 수호석이 루디의 책상 위에서 함께 진동하며 메소포타미아 깊숙이 좌표를 드러냈다. 고대 유적이 아니다. 현대적인 유리와 강철로 된 탑이 평원에서 솟아있다 — 바벨 타워. 렉시콘 소사이어티 본부. 꼭대기에서 빛이 7초마다 맥동한다, 심장 박동처럼.)",
        textEs: "(Las cuatro Piedras Guardianas pulsaron juntas en el escritorio de Rudy y revelaron coordenadas en lo profundo de Mesopotamia. No una ruina antigua. Una aguja moderna de vidrio y acero que se eleva de la llanura — la Torre de Babel. Cuartel general de la Sociedad Lexicon. En su cima, la luz pulsa cada siete segundos, como un latido.)",
      },
      {
        kind: "scene",
        charId: "penny",
        text: "Five floors. Each one is a language gate — Mr. Black built them as tests. If you can't communicate in the language, the gate won't open. He believed only worthy linguists should reach the top. *quietly* He built them for himself. He passed all five alone.",
        textKo: "5층이야. 각 층이 언어 관문이야 — 미스터 블랙이 시험으로 만들었어. 그 언어로 소통하지 못하면 관문이 안 열려. 오직 가치 있는 언어학자만이 꼭대기에 도달해야 한다고 믿었어. *조용히* 자기 자신을 위해 만들었어. 5개 모두 혼자 통과했어.",
        textEs: "Cinco pisos. Cada uno es una puerta lingüística — Mr. Black las construyó como pruebas. Si no puedes comunicarte en ese idioma, la puerta no se abre. Creía que solo los lingüistas dignos debían llegar a la cima. *en voz baja* Las construyó para sí mismo. Las pasó todas solo.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Five language gates and a man who wants to erase every word ever spoken. Sounds like a Tuesday. *looks at the assembled group: Tom, Isabel, Sujin, Amira, Penny* Except — this time I'm not alone. Before we face the gates, let's review the most important words from our journey. Know these, and we can face anything.",
        textKo: "5개의 언어 관문과 지금껏 말해진 모든 단어를 지우려는 남자. 화요일 같은 느낌. *모인 그룹을 바라보며: 톰, 이사벨, 수진, 아미라, 페니* 하지만 — 이번엔 혼자가 아니야. 관문에 도전하기 전에 여정에서 배운 가장 중요한 단어들을 복습하자. 이것만 알면 뭐든 해낼 수 있어.",
        textEs: "Cinco puertas de idiomas y un hombre que quiere borrar cada palabra jamás pronunciada. Suena como un martes. *mira al grupo reunido: Tom, Isabel, Sujin, Amira, Penny* Excepto que — esta vez no estoy solo. Antes de enfrentar las puertas, repasemos las palabras más importantes de nuestro viaje. Conócelas y podremos enfrentar cualquier cosa.",
      },
      {
        kind: "puzzle",
        puzzleNum: 1,
        pType: "word-match",
        tprsStage: 1,
        targetExpressions: ["Hello", "Thank you", "Are you okay?", "Help"],
        previouslyLearned: ["Hello", "Thank you", "Where is ___?", "How much?", "Excuse me", "I need help", "Map", "Key", "Near the ___"],
        speakAfter: true,
        storyReason: "The Babel Tower gates test your mastery of expressions from every city.",
        storyConsequence: "The first language gate opens.",
        onFail: { addToWeakExpressions: ["Hello", "Are you okay?"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            word: { en: "Hello", ko: "안녕하세요", es: "Hola" },
            meaning: { en: "the first word you learn — the beginning of every conversation", ko: "가장 먼저 배우는 단어 — 모든 대화의 시작", es: "la primera palabra que aprendes — el inicio de cada conversación" },
            wrong: [
              { en: "a word you use only when angry", ko: "화날 때만 쓰는 단어", es: "una palabra que usas solo cuando estás enojado" },
              { en: "a formal document greeting", ko: "공식 문서 인사", es: "un saludo formal de documentos" },
              { en: "a word with no meaning", ko: "의미 없는 단어", es: "una palabra sin significado" },
            ],
          },
          {
            word: { en: "Thank you", ko: "감사합니다", es: "Gracias" },
            meaning: { en: "what you say when someone helps you — gratitude in any language", ko: "누군가 도와줄 때 하는 말 — 어떤 언어에서든 감사의 표현", es: "lo que dices cuando alguien te ayuda — gratitud en cualquier idioma" },
            wrong: [
              { en: "a question about directions", ko: "방향에 대한 질문", es: "una pregunta sobre direcciones" },
              { en: "a way to say goodbye", ko: "작별 인사하는 방법", es: "una forma de despedirse" },
              { en: "a request for food", ko: "음식 요청", es: "una petición de comida" },
            ],
          },
          {
            word: { en: "Are you okay?", ko: "괜찮으세요?", es: "¿Estás bien?" },
            meaning: { en: "asking if someone is well — showing you care about them", ko: "누군가의 안부를 묻는 것 — 관심을 보여주는 것", es: "preguntar si alguien está bien — mostrar que te importa" },
            wrong: [
              { en: "asking for the time", ko: "시간을 묻는 것", es: "preguntar la hora" },
              { en: "ordering food at a restaurant", ko: "식당에서 주문하는 것", es: "pedir comida en un restaurante" },
              { en: "asking for directions to the subway", ko: "지하철 방향을 묻는 것", es: "pedir direcciones al metro" },
            ],
          },
        ],
        hints: {
          h1: { ko: "루디가 이 여정에서 배운 가장 중요한 단어들을 생각해봐 — Unit 1부터 지금까지", en: "Think about the most important words Rudy learned on this journey — from Unit 1 until now", es: "Piensa en las palabras más importantes que Rudy aprendió — desde la Unidad 1 hasta ahora" },
          h2: { ko: "이 단어들은 사람과 사람을 연결하는 기본 표현이야 — 인사, 감사, 걱정", en: "These words are basic expressions that connect people — greeting, gratitude, concern", es: "Estas palabras son expresiones básicas que conectan personas — saludo, gratitud, preocupación" },
          h3: {
            ko: "Hello = 모든 대화의 시작 / Thank you = 감사 표현 / Are you okay? = 관심과 걱정",
            en: "Hello = start of every conversation / Thank you = gratitude / Are you okay? = caring and concern",
            es: "Hello = inicio de conversación / Thank you = gratitud / Are you okay? = cuidado y preocupación",
            byLearning: {
              spanish: { ko: "Hola = 모든 대화의 시작 / Gracias = 감사 표현 / ¿Estás bien? = 관심과 걱정", en: "Hola = start of every conversation / Gracias = gratitude / ¿Estás bien? = caring and concern", es: "Hola = inicio de conversación / Gracias = gratitud / ¿Estás bien? = cuidado y preocupación" },
              korean: { ko: "안녕하세요 = 모든 대화의 시작 / 감사합니다 = 감사 표현 / 괜찮으세요? = 관심과 걱정", en: "안녕하세요 = start of every conversation / 감사합니다 = gratitude / 괜찮으세요? = caring and concern", es: "안녕하세요 = inicio de conversación / 감사합니다 = gratitud / 괜찮으세요? = cuidado y preocupación" },
            },
          },
        },
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Good — you remember the words. Now use them to open the gates. Each gate demands you prove you can communicate — not just know words, but use them with meaning.)",
        textKo: "(좋아 — 단어들을 기억하고 있네. 이제 관문을 열 때 써먹을 차례야. 각 관문은 단어만 아는 게 아니라 의미를 담아 소통할 수 있는지 증명하라고 요구해.)",
        textEs: "(Bien — recuerdas las palabras. Ahora úsalas para abrir las puertas. Cada puerta exige que demuestres que puedes comunicarte — no solo saber palabras, sino usarlas con significado.)",
      },
      {
        kind: "puzzle",
        puzzleNum: 2,
        pType: "dialogue-choice",
        tprsStage: 2,
        targetExpressions: ["I believe in you", "We can do this", "Don't give up"],
        previouslyLearned: ["Hello", "Thank you", "Are you okay?", "Help", "Where is ___?", "Excuse me"],
        speakAfter: true,
        storyReason: "Mr. Black is trying to break your team's morale. Choose words that rally your allies.",
        storyConsequence: "Your allies stand firm. The second gate opens.",
        onFail: { addToWeakExpressions: ["I believe in you", "Don't give up"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            prompt: { en: "Floor 1: English Gate. Tom is on the radio — but the gate speaks only in English riddles. What do you say to open it?", ko: "1층: 영어 관문. 톰이 무선으로 연결되어 있어 — 하지만 관문은 영어 수수께끼로만 말해. 어떻게 열어?", es: "Piso 1: Puerta de inglés. Tom está en el radio — pero la puerta solo habla en acertijos en inglés. ¿Qué dices para abrirla?" },
            context: { en: "Gate: 'I start every conversation, I end every goodbye. What word am I?' Tom: 'Blimey, Rudy! That's the first word we taught you! Think!'", ko: "관문: '나는 모든 대화를 시작하고, 모든 작별 인사를 끝낼 수 있어. 나는 어떤 단어야?' 톰: '이런, 루디! 그게 우리가 처음 가르친 단어야! 생각해!'", es: "Puerta: 'Empiezo cada conversación, termino cada despedida. ¿Qué palabra soy?' Tom: '¡Mira, Rudy! ¡Esa es la primera palabra que te enseñamos! ¡Piensa!'" },
            answer: { en: "Hello. And goodbye. And hello again — because every ending is a new beginning.", ko: "Hello. 그리고 goodbye. 그리고 또 hello — 왜냐하면 모든 끝은 새로운 시작이니까.", es: "Hello. Y goodbye. Y hello otra vez — porque cada final es un nuevo comienzo." },
            wrong: [
              { en: "I need to think about this more carefully.", ko: "더 신중하게 생각해봐야 해.", es: "Necesito pensar más cuidadosamente en esto." },
              { en: "Tom, what is the answer?", ko: "톰, 답이 뭐야?", es: "Tom, ¿cuál es la respuesta?" },
            ],
          },
          {
            prompt: { en: "Floor 2: Spanish Gate. Isabel is here. The gate requires a genuine greeting — not just words, but meaning.", ko: "2층: 스페인어 관문. 이사벨이 여기 있어. 관문은 진심 어린 인사를 요구해 — 단어만이 아니라 의미도.", es: "Piso 2: Puerta de español. Isabel está aquí. La puerta requiere un saludo genuino — no solo palabras, sino significado." },
            context: { en: "Gate: 'Say it like you mean it. In Spanish.' Isabel: '¡Ánimo, detective! You know this — I heard you try it in Madrid!'", ko: "관문: '진심으로 말해봐. 스페인어로.' 이사벨: '힘내요, 탐정님! 알잖아요 — 마드리드에서 해보는 거 들었거든요!'", es: "Puerta: 'Dilo como si lo dijeras en serio. En español.' Isabel: '¡Ánimo, detective! Sabes esto — ¡te escuché intentarlo en Madrid!'" },
            answer: { en: "Buenos días. Gracias. Lo siento. Adiós. *and everything in between — all the words that connect us*", ko: "Buenos días. Gracias. Lo siento. Adiós. *그리고 그 사이의 모든 것 — 우리를 연결하는 모든 단어*", es: "Buenos días. Gracias. Lo siento. Adiós. *y todo lo que hay en medio — todas las palabras que nos conectan*" },
            wrong: [
              { en: "¿Cómo estás? — that's all I know in Spanish.", ko: "¿Cómo estás? — 그게 내가 아는 스페인어 전부야.", es: "¿Cómo estás? — eso es todo lo que sé en español." },
              { en: "Isabel, please do this for me.", ko: "이사벨, 제발 대신 해줘.", es: "Isabel, por favor hazlo tú por mí." },
            ],
          },
        ],
        hints: {
          h1: { ko: "각 관문은 당신이 이미 배운 언어를 요구해 — Unit 1부터 지금까지 배운 것들을 기억해봐", en: "Each gate requires languages you already learned — remember everything from Unit 1 until now", es: "Cada puerta requiere idiomas que ya aprendiste — recuerda todo desde la Unidad 1 hasta ahora" },
          h2: { ko: "진심은 언어보다 중요해 — 완벽하게 말하려 하지 말고, 의미를 담아 말해봐", en: "Sincerity matters more than perfection — don't try to speak perfectly, speak with meaning", es: "La sinceridad importa más que la perfección — no intentes hablar perfectamente, habla con significado" },
          h3: { ko: "1층 답: 'Hello' (시작과 끝을 모두 담은 단어) / 2층 답: 기초 스페인어 인사들의 조합", en: "Floor 1 answer: 'Hello' (the word that contains both beginning and end) / Floor 2: combine basic Spanish greetings", es: "Piso 1 respuesta: 'Hello' (la palabra que contiene principio y fin) / Piso 2: combina saludos básicos en español" },
        },
      },
      {
        kind: "puzzle",
        puzzleNum: 3,
        pType: "writing-mission",
        tprsStage: 3,
        targetExpressions: ["Thank you for believing in us", "Your brother would be proud", "Together we can stop this"],
        previouslyLearned: ["Hello", "Thank you", "Are you okay?", "Help", "I believe in you", "We can do this", "Don't give up"],
        speakAfter: true,
        storyReason: "Encourage each ally before the final confrontation — they need your words.",
        storyConsequence: "Every ally is inspired. You enter the final chamber together.",
        onFail: { addToWeakExpressions: ["Thank you", "Together we can stop this"], reviewInDailyCourse: true, reviewDays: 3 },
        title: { en: "Rally Your Allies", ko: "동료들을 격려하기", es: "Reunir a tus Aliados" },
        context: { en: "Before entering the tower, say a word of encouragement to each ally. They came from around the world — speak from the heart!", ko: "탑에 들어가기 전에 동료들에게 격려의 말을 하세요. 전 세계에서 도우러 왔어요 — 진심을 담아 말하세요!", es: "Antes de entrar en la torre, di unas palabras de aliento. ¡Han venido de todo el mundo — habla con el corazón!" },
        questions: [
          { word: { en: "Tom, thank you for believing in us from the start.", ko: "톰, 처음부터 우리를 믿어줘서 고마워.", es: "Tom, gracias por creer en nosotros desde el principio." }, hint: { en: "Thank Tom for his trust", ko: "톰의 신뢰에 감사하세요", es: "Agradece a Tom su confianza" }, acceptableAnswers: ["tom thank you for believing in us", "thank you for believing in us", "tom thanks for believing in us from the start"] },
          { word: { en: "Isabel, your brother would be proud of you.", ko: "이사벨, 네 동생이 자랑스러워할 거야.", es: "Isabel, tu hermano estaría orgulloso de ti." }, hint: { en: "Encourage Isabel about Carlos", ko: "카를로스에 대해 이사벨을 격려하세요", es: "Anima a Isabel sobre Carlos" }, acceptableAnswers: ["isabel your brother would be proud of you", "your brother would be proud of you", "isabel your brother would be proud"] },
          { word: { en: "Together, we can stop this. Let's go.", ko: "함께라면 이걸 막을 수 있어. 가자.", es: "Juntos podemos detener esto. Vamos." }, hint: { en: "Rally everyone for the final mission", ko: "최종 미션을 위해 모두를 격려하세요", es: "Reúne a todos para la misión final" }, acceptableAnswers: ["together we can stop this lets go", "together we can stop this", "we can stop this lets go"] },
        ],
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Four floors. Four gates. Four languages. The fifth floor chamber opens to reveal seven stone pedestals arranged in a circle. Four stones already glow in their places — Mr. Black's collection. The Universal Code hums at its center, waiting for the final three.)",
        textKo: "(4층. 4개의 관문. 4개의 언어. 5층 방이 열리며 원형으로 배치된 7개의 수호석 받침대를 드러낸다. 4개의 수호석이 이미 자리에서 빛난다 — 미스터 블랙의 컬렉션. 유니버설 코드가 중앙에서 윙윙거리며 마지막 세 개를 기다린다.)",
        textEs: "(Cuatro pisos. Cuatro puertas. Cuatro idiomas. La cámara del quinto piso se abre para revelar siete pedestales de piedra dispuestos en círculo. Cuatro piedras ya brillan en sus lugares — la colección de Mr. Black. El Código Universal zumba en su centro, esperando las últimas tres.)",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "*stands at the center* You made it. All five gates. I'm... genuinely impressed. *almost sad* But you're too late. The last three stones were always here — hidden in the tower's foundation for a hundred years. I found them twenty years ago.",
        textKo: "*중앙에 서서* 해냈군요. 5개 관문 모두. 정말로... 감동이에요. *거의 슬프게* 하지만 너무 늦었어요. 마지막 세 개의 수호석은 항상 여기 있었어요 — 100년 동안 탑의 기초에 숨겨져 있었어요. 20년 전에 찾았어요.",
        textEs: "*de pie en el centro* Lo lograste. Las cinco puertas. Estoy... genuinamente impresionado. *casi triste* Pero llegas demasiado tarde. Las últimas tres piedras siempre estuvieron aquí — escondidas en los cimientos de la torre durante cien años. Las encontré hace veinte años.",
      },
      {
        kind: "puzzle",
        puzzleNum: 4,
        pType: "sentence-builder",
        tprsStage: 3,
        targetExpressions: ["Language is power", "Every word matters", "We are stronger together"],
        previouslyLearned: ["Hello", "Thank you", "Are you okay?", "Help", "I believe in you", "We can do this", "Don't give up", "Thank you for believing in us", "Together we can stop this"],
        speakAfter: true,
        storyReason: "Build the counter-argument to Mr. Black's Universal Code philosophy.",
        storyConsequence: "The third gate cracks open as your words resonate through the tower.",
        onFail: { addToWeakExpressions: ["Language is power", "Every word matters"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            instruction: { en: "Floor 3: Korean Gate. Sujin is with you. Build the sentence that opens the gate — in Korean: 'My friend is very kind.'", ko: "3층: 한국어 관문. 수진이 함께 있어. 관문을 여는 문장을 만들어 — 한국어로: '제 친구는 매우 친절해요.'", es: "Piso 3: Puerta de coreano. Sujin está contigo. Construye la frase que abre la puerta — en coreano: '제 친구는 매우 친절해요.'" },
            words: [
              { en: "my", ko: "제", es: "mi" },
              { en: "friend (topic)", ko: "친구는", es: "amigo" },
              { en: "very", ko: "매우", es: "muy" },
              { en: "kind", ko: "친절해요", es: "amable" },
            ],
            answerOrder: [0, 1, 2, 3],
          },
        ],
        hints: {
          h1: { ko: "한국어 어순은 영어와 달라: 소유격 → 주어 → 부사 → 형용사 순서야", en: "Korean word order differs from English: Possessive → Subject → Adverb → Adjective", es: "El orden de palabras en coreano difiere del español: Posesivo → Sujeto → Adverbio → Adjetivo" },
          h2: { ko: "'제'가 먼저 (소유격), '친구는' (주어), '매우' (부사), '친절해요' (형용사)로 끝내", en: "'제' first (my), then '친구는' (friend+topic), '매우' (very), end with '친절해요' (kind)", es: "'제' primero (mi), luego '친구는' (amigo+tema), '매우' (muy), termina con '친절해요' (amable)" },
          h3: { ko: "답: 제 → 친구는 → 매우 → 친절해요 (My friend is very kind)", en: "Answer: 제 → 친구는 → 매우 → 친절해요 (My friend is very kind)", es: "Respuesta: 제 → 친구는 → 매우 → 친절해요 (Mi amigo es muy amable)" },
        },
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "You're right about one thing. Language IS power. But not because you control it. Because it connects people. Your mother's Welsh — 'Dŵr,' water — that word didn't die with her. It lives in anyone who ever heard her say it. In you. You've been carrying it for thirty years.",
        textKo: "한 가지는 맞아요. 언어는 힘이에요. 하지만 당신이 통제하기 때문이 아니라. 사람들을 연결하기 때문이에요. 어머니의 웨일스어 — 'Dŵr,' 물 — 그 단어는 어머니와 함께 죽지 않았어요. 그것을 들은 모든 사람 속에 살아있어요. 당신 안에. 30년 동안 그걸 간직해왔어요.",
        textEs: "Tienes razón en una cosa. El idioma ES poder. Pero no porque lo controles. Sino porque conecta personas. El galés de tu madre — 'Dŵr,' agua — esa palabra no murió con ella. Vive en todos los que alguna vez la oyeron decirla. En ti. La has llevado durante treinta años.",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "*long pause* She used to sing. A lullaby. 'Suo Gân.' I still know every word. *looks at his hands* But I haven't… spoken it. To anyone. *quietly* I've been trying to save her language by destroying all the others.",
        textKo: "*긴 침묵* 어머니는 노래를 불렀어요. 자장가. 'Suo Gân.' 아직도 모든 가사를 알아요. *손을 바라보며* 하지만... 말하지 않았어요. 아무에게도. *조용히* 다른 모든 언어를 파괴해서 어머니의 언어를 구하려 했던 거예요.",
        textEs: "*larga pausa* Ella solía cantar. Una canción de cuna. 'Suo Gân.' Todavía sé cada palabra. *mira sus manos* Pero no la he… hablado. A nadie. *en voz baja* He estado intentando salvar el idioma de ella destruyendo todos los demás.",
      },
      {
        kind: "puzzle",
        puzzleNum: 5,
        pType: "investigation",
        tprsStage: 4,
        targetExpressions: ["Hello", "Thank you", "Where is ___?", "How much?", "Excuse me", "I don't understand"],
        previouslyLearned: ["Hello", "Thank you", "Are you okay?", "Help", "I believe in you", "We can do this", "Don't give up", "Language is power", "Every word matters", "We are stronger together"],
        speakAfter: true,
        storyReason: "Final investigation — use every expression you've learned to decode Mr. Black's master plan.",
        storyConsequence: "You discover Mr. Black's true motivation and find the key to reversing the Universal Code.",
        onFail: { addToWeakExpressions: ["Where is ___?", "I don't understand"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            prompt: { en: "The Universal Code can still be stopped. Which action breaks the activation sequence?", ko: "유니버설 코드는 아직 멈출 수 있어. 어떤 행동이 활성화 순서를 끊어?", es: "El Código Universal aún puede detenerse. ¿Qué acción interrumpe la secuencia de activación?" },
            clues: [
              { en: "Smash the central device with a heavy object.", ko: "무거운 물건으로 중앙 장치를 부수기.", es: "Destrozar el dispositivo central con un objeto pesado." },
              { en: "Remove one Guardian Stone from its pedestal — breaking the circuit of seven.", ko: "받침대에서 수호석 하나를 제거하기 — 7개의 회로를 끊기.", es: "Retirar una Piedra Guardiana de su pedestal — rompiendo el circuito de siete." },
              { en: "Ask Mr. Black to stop voluntarily — he has the override code.", ko: "미스터 블랙에게 자발적으로 멈추라고 부탁하기 — 그에게 재정의 코드가 있어.", es: "Pedirle a Mr. Black que se detenga voluntariamente — él tiene el código de anulación." },
              { en: "Wait for the timer to run out on its own.", ko: "타이머가 스스로 끝나길 기다리기.", es: "Esperar a que el temporizador se agote por sí solo." },
            ],
            answerIdx: 2,
          },
        ],
        hints: {
          h1: { ko: "파괴적인 행동은 예상치 못한 결과를 낳을 수 있어 — 가장 안전한 방법을 찾아봐", en: "Destructive actions can have unexpected consequences — look for the safest method", es: "Las acciones destructivas pueden tener consecuencias inesperadas — busca el método más seguro" },
          h2: { ko: "미스터 블랙은 방금 돌아가신 어머니에 대해 이야기했어 — 그에게는 아직 양심이 있어", en: "Mr. Black just talked about his late mother — he still has a conscience", es: "Mr. Black acaba de hablar de su madre fallecida — todavía tiene conciencia" },
          h3: { ko: "답: 세 번째. 미스터 블랙이 의식적으로 멈추는 게 유일한 완전한 해결책이야 — 그는 재정의 코드를 갖고 있어", en: "Answer: the third one. Mr. Black choosing to stop is the only complete solution — he holds the override code", es: "Respuesta: la tercera. Mr. Black eligiendo detenerse es la única solución completa — él tiene el código de anulación" },
        },
      },
      {
        kind: "scene",
        charId: "penny",
        text: "*steps forward* I was his student. When I helped build this, I believed in it too. That one shared language would mean no more wars over misunderstanding. No more deaths like your mother's. *to Mr. Black* But I was wrong. And you taught me something else — that learning someone's language is how you say: I see you. I am trying to understand you. You matter.",
        textKo: "*앞으로 나서며* 저는 그의 학생이었어요. 이걸 만드는 걸 도울 때 저도 믿었어요. 하나의 공유된 언어가 오해로 인한 전쟁이 없어짐을 의미한다고. 당신 어머니 같은 죽음이 없어짐을. *미스터 블랙에게* 하지만 틀렸어요. 그리고 당신은 저에게 다른 것을 가르쳐줬어요 — 누군가의 언어를 배우는 것이 이렇게 말하는 방법이라는 것을: 당신이 보여요. 이해하려 노력하고 있어요. 당신은 소중해요.",
        textEs: "*da un paso adelante* Fui su estudiante. Cuando ayudé a construir esto, también lo creía. Que un idioma compartido significaría no más guerras por malentendidos. No más muertes como la de tu madre. *a Mr. Black* Pero estaba equivocada. Y tú me enseñaste algo más — que aprender el idioma de alguien es la forma de decir: te veo. Estoy intentando entenderte. Eres importante.",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "*very long pause. Looks at each stone. Looks at Rudy. Looks at Penny.* ...Mae'r iaith yn fyw. *Welsh: The language lives.* *places his hand on the override panel* I never wanted to destroy language. I wanted… I just wanted my mother to be heard.",
        textKo: "*아주 긴 침묵. 각 수호석을 바라본다. 루디를 바라본다. 페니를 바라본다.* ...Mae'r iaith yn fyw. *웨일스어: 언어는 살아있다.* *재정의 패널에 손을 올리며* 언어를 파괴하고 싶었던 게 아니야. 원한 건... 어머니의 말이 들려지기를 원했을 뿐이야.",
        textEs: "*pausa muy larga. Mira cada piedra. Mira a Rudy. Mira a Penny.* ...Mae'r iaith yn fyw. *Galés: El idioma vive.* *coloca su mano en el panel de anulación* Nunca quise destruir el idioma. Quería… solo quería que escucharan a mi madre.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(The Universal Code shuts down. One by one, the seven Guardian Stones release from their pedestals. The chamber goes quiet. Then, from everywhere at once — voices. Dozens. Hundreds. In every language. Tom on the radio. Isabel from Madrid. Sujin's voice from Seoul. Youngsook's from Gwangjang Market. Amira reciting in Arabic. Hassan in four languages at once. And underneath all of it, faint and clear: a Welsh lullaby.)",
        textKo: "(유니버설 코드가 종료된다. 하나씩, 7개의 수호석이 받침대에서 풀려난다. 방이 조용해진다. 그때, 사방에서 한꺼번에 — 목소리들. 수십 개. 수백 개. 모든 언어로. 무선에서 톰. 마드리드에서 이사벨. 서울에서 수진의 목소리. 광장시장에서 영숙 할머니. 아랍어로 독경하는 아미라. 한꺼번에 네 개 언어로 말하는 하산. 그리고 그 모든 것 아래, 희미하고 선명하게: 웨일스 자장가.)",
        textEs: "(El Código Universal se apaga. Una por una, las siete Piedras Guardianas se liberan de sus pedestales. La cámara queda en silencio. Entonces, desde todas partes a la vez — voces. Decenas. Cientos. En cada idioma. Tom en el radio. Isabel desde Madrid. La voz de Sujin desde Seúl. La de Youngsook desde el Mercado Gwangjang. Amira recitando en árabe. Hassan en cuatro idiomas a la vez. Y debajo de todo, tenue y claro: una nana en galés.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Languages aren't tools. They're not systems. They're not barriers. They're people. Every single word is someone who spoke it, someone who heard it, someone who needed it. And as long as people exist, no device — no code — can ever erase them. *to Mr. Black* Mae'r iaith yn fyw. Your mother's language lives. It lives in you.",
        textKo: "언어는 도구가 아니에요. 시스템도 아니에요. 장벽도 아니에요. 사람이에요. 모든 단어 하나하나가 그것을 말한 누군가, 들은 누군가, 필요했던 누군가예요. 그리고 사람이 존재하는 한, 어떤 장치도 — 어떤 코드도 — 그것들을 지울 수 없어요. *미스터 블랙에게* Mae'r iaith yn fyw. 어머니의 언어는 살아있어요. 당신 안에 살아있어요.",
        textEs: "Los idiomas no son herramientas. No son sistemas. No son barreras. Son personas. Cada palabra es alguien que la habló, alguien que la oyó, alguien que la necesitó. Y mientras existan personas, ningún dispositivo — ningún código — podrá borrarlos jamás. *a Mr. Black* Mae'r iaith yn fyw. El idioma de tu madre vive. Vive en ti.",
      },
      {
        kind: "clue",
        symbol: "🌍",
        titleEn: "The Language Conspiracy — Solved",
        titleKo: "언어 음모 — 해결",
        titleEs: "La Conspiración del Lenguaje — Resuelta",
        descEn: "Seven Guardian Stones returned to their keepers. The Universal Code dismantled. Mr. Black surrendered — not defeated, but understood. Miss Penny: pardoned. Carlos: recovered. Every language on Earth: intact. Detective Rudy: no longer a detective. Now a Language Guardian.",
        descKo: "7개의 수호석이 수호자들에게 돌아갔다. 유니버설 코드가 해체되었다. 미스터 블랙이 항복했다 — 패배한 것이 아니라, 이해된 것이다. 미스 페니: 사면. 카를로스: 회복. 지구상의 모든 언어: 온전하다. 루디 탐정: 더 이상 탐정이 아니다. 이제는 언어 수호자.",
        descEs: "Siete Piedras Guardianas devueltas a sus guardianes. El Código Universal desmantelado. Mr. Black se rindió — no derrotado, sino comprendido. Miss Penny: perdonada. Carlos: recuperado. Cada idioma en la Tierra: intacto. Detective Rudy: ya no es detective. Ahora es Guardián del Idioma.",
      },
    ],
  },

};

/* ─────────────────── UNLOCK HELPER ─────────────────── */

async function markChapterComplete(storyId: string, nextId?: string) {
  try {
    const raw = await AsyncStorage.getItem(STORY_PROGRESS_KEY);
    const progress: StoryProgress = raw
      ? JSON.parse(raw)
      : { completed: [], unlocked: ["london"] };
    if (!progress.completed.includes(storyId)) progress.completed.push(storyId);
    if (nextId && !progress.unlocked.includes(nextId)) progress.unlocked.push(nextId);
    await AsyncStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) { console.warn("[Story] markChapterComplete failed:", e); }
}

/* ─────────────────── PUZZLE COMPONENTS ─────────────────── */

function PuzzleSolvedBadge({ onNext, lang }: { onNext: () => void; lang: string }) {
  const scale = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 6 }).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);
  return (
    <Animated.View style={[styles.solvedBadge, { transform: [{ scale }] }]}>
      <Text style={styles.solvedEmoji}>🔍</Text>
      <Text style={styles.solvedTitle}>{lang === "korean" ? "퍼즐 해결!" : lang === "spanish" ? "¡Puzzle Resuelto!" : "Puzzle Solved!"}</Text>
      <Text style={styles.solvedXp}>+20 XP</Text>
      <Pressable style={styles.solvedBtn} onPress={onNext}>
        <Text style={styles.solvedBtnText}>{lang === "korean" ? "계속 ▶" : lang === "spanish" ? "Continuar ▶" : "Continue ▶"}</Text>
      </Pressable>
    </Animated.View>
  );
}

function WordMatchPuzzle({ puzzle, lang, learningLang, onSolved, onResetHints }: {
  puzzle: { pType: "word-match"; questions: WordMatchQ[] };
  lang: string; learningLang: string; onSolved: () => void; onResetHints?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => { onResetHints?.(); }, [idx]);

  const q = puzzle.questions[idx];
  const correctAnswer = tri(q.meaning, lang);
  const [options] = useState(() =>
    puzzle.questions.map((qq) => shuffle([tri(qq.meaning, lang), ...qq.wrong.map((w) => tri(w, lang))]))
  );

  function handleSelect(opt: string) {
    if (selected) return;
    setSelected(opt);
    if (opt === correctAnswer) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        if (idx < puzzle.questions.length - 1) { setIdx((i) => i + 1); setSelected(null); onResetHints?.(); }
        else setSolved(true);
      }, 900);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => setSelected(null), 900);
    }
  }

  if (solved) return <PuzzleSolvedBadge onNext={onSolved} lang={lang} />;

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <Text style={styles.puzzleNum}>🧩 PUZZLE {idx + 1}/{puzzle.questions.length}</Text>
        <Text style={styles.puzzleType}>{lang === "korean" ? "단어 매칭" : lang === "spanish" ? "Relacionar palabras" : "Word Matching"}</Text>
      </View>
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>{lang === "korean" ? "이 단어의 뜻은?" : lang === "spanish" ? "¿Qué significa?" : "What does this mean?"}</Text>
        <Text style={styles.puzzleWordMain}>{tri(q.word, learningLang)}</Text>
      </View>
      <View style={styles.puzzleOptions}>
        {options[idx].map((opt, i) => {
          const isSelected = selected === opt;
          const isCorrect = opt === correctAnswer;
          let bg = C.bg2;
          let borderColor = C.border;
          if (isSelected && isCorrect) { bg = "rgba(90,170,90,0.25)"; borderColor = "#5a9"; }
          else if (isSelected && !isCorrect) { bg = "rgba(200,70,70,0.25)"; borderColor = "#e55"; }
          return (
            <Pressable key={i} style={[styles.puzzleOption, { backgroundColor: bg, borderColor }]} onPress={() => handleSelect(opt)}>
              <Text style={styles.puzzleOptionText}>{opt}</Text>
              {isSelected && isCorrect && <Ionicons name="checkmark-circle" size={18} color="#5a9" />}
              {isSelected && !isCorrect && <Ionicons name="close-circle" size={18} color="#e55" />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function FillBlankPuzzle({ puzzle, lang, learningLang, onSolved, onResetHints }: {
  puzzle: { pType: "fill-blank"; questions: FillBlankQ[] };
  lang: string; learningLang: string; onSolved: () => void; onResetHints?: () => void;
}) {
  const ko = lang === "korean"; const es = lang === "spanish";
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [solved, setSolved] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);

  const q = puzzle.questions[idx];
  const answer = tri(q.answer, learningLang);
  const [options] = useState(() =>
    puzzle.questions.map((qq) => shuffle([tri(qq.answer, learningLang), ...qq.opts.map((o) => tri(o, learningLang))]))
  );

  useEffect(() => {
    setHintLevel(0);
    setHintVisible(false);
    onResetHints?.();
  }, [idx]);

  function handleConfirm() {
    if (!selected) return;
    setConfirmed(true);
    if (selected === answer) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  function handleNext() {
    if (idx < puzzle.questions.length - 1) { setIdx((i) => i + 1); setSelected(null); setConfirmed(false); }
    else setSolved(true);
  }

  if (solved) return <PuzzleSolvedBadge onNext={onSolved} lang={lang} />;

  const sentence = tri(q.sentence, learningLang);
  const display = confirmed ? sentence.replace("___", `[${selected}]`) : sentence;

  const qHints = q.hints;
  const h1 = qHints ? tri(qHints.h1, lang) : null;
  const h2 = qHints?.h2 ? tri(qHints.h2, lang) : null;
  const h3 = qHints?.h3 ? tri(qHints.h3, lang) : null;
  const allQHints = [h1, h2, h3].filter(Boolean) as string[];
  const hasQHints = allQHints.length > 0;

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <Text style={styles.puzzleNum}>🧩 PUZZLE {idx + 1}/{puzzle.questions.length}</Text>
        <Text style={styles.puzzleType}>{ko ? "빈칸 채우기" : es ? "Completar espacios" : "Fill in the Blank"}</Text>
      </View>
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>{ko ? "빈칸에 알맞은 단어는?" : es ? "¿Qué palabra completa la frase?" : "Which word fills the blank?"}</Text>
        <Text style={styles.puzzleSentence}>{display}</Text>
      </View>
      <View style={styles.puzzleOptions}>
        {options[idx].map((opt, i) => {
          const isSelected = selected === opt;
          const isAnswer = opt === answer;
          let bg = C.bg2; let borderColor = C.border;
          if (confirmed && isAnswer) { bg = "rgba(90,170,90,0.25)"; borderColor = "#5a9"; }
          else if (confirmed && isSelected) { bg = "rgba(200,70,70,0.25)"; borderColor = "#e55"; }
          else if (isSelected) { bg = "rgba(201,162,39,0.2)"; borderColor = C.gold; }
          return (
            <Pressable key={i} style={[styles.puzzleOption, { backgroundColor: bg, borderColor }]} onPress={() => !confirmed && setSelected(opt)}>
              <Text style={styles.puzzleOptionText}>{opt}</Text>
              {confirmed && isAnswer && <Ionicons name="checkmark-circle" size={18} color="#5a9" />}
              {confirmed && isSelected && !isAnswer && <Ionicons name="close-circle" size={18} color="#e55" />}
            </Pressable>
          );
        })}
      </View>
      {hasQHints && (
        <Pressable
          style={[styles.sharedHintBtn, { marginTop: 8 }]}
          onPress={() => { setHintVisible(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        >
          <Text style={styles.sharedHintBtnText}>
            💡 {ko ? `힌트 보기 (${hintLevel}/${allQHints.length})` : es ? `Ver pistas (${hintLevel}/${allQHints.length})` : `Hints (${hintLevel}/${allQHints.length})`}
          </Text>
        </Pressable>
      )}
      {!confirmed ? (
        <Pressable style={[styles.puzzleConfirmBtn, { opacity: selected ? 1 : 0.5 }]} onPress={handleConfirm} disabled={!selected}>
          <Text style={styles.puzzleConfirmText}>{ko ? "확인 ✓" : es ? "Confirmar ✓" : "Confirm ✓"}</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.puzzleConfirmBtn} onPress={handleNext}>
          <Text style={styles.puzzleConfirmText}>{idx < puzzle.questions.length - 1 ? (ko ? "다음 ▶" : "Next ▶") : (ko ? "완료 ✓" : es ? "Listo ✓" : "Done ✓")}</Text>
        </Pressable>
      )}
      {hasQHints && (
        <Modal visible={hintVisible} transparent animationType="fade" onRequestClose={() => setHintVisible(false)}>
          <Pressable style={styles.hintOverlay} onPress={() => setHintVisible(false)}>
            <Pressable style={styles.hintNotebook} onPress={() => {}}>
              <View style={styles.hintNotebookHeader}>
                <Text style={styles.hintNotebookTitle}>🔍 {ko ? "수사 노트" : es ? "Cuaderno de Detective" : "Detective's Notebook"}</Text>
                <Pressable onPress={() => setHintVisible(false)} style={styles.hintCloseBtn}>
                  <Text style={styles.hintCloseBtnText}>✕</Text>
                </Pressable>
              </View>
              <View style={styles.hintNotebookRule} />
              {allQHints.map((hint, i) => {
                const isUnlocked = i < hintLevel;
                const isNext = i === hintLevel;
                return (
                  <View key={i} style={styles.hintRow}>
                    {isUnlocked ? (
                      <View style={styles.hintUnlocked}>
                        <Text style={styles.hintLabel}>{ko ? `힌트 ${i + 1}` : es ? `Pista ${i + 1}` : `Hint ${i + 1}`}</Text>
                        <Text style={styles.hintText}>{hint}</Text>
                      </View>
                    ) : isNext ? (
                      <Pressable style={styles.hintLocked} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setHintLevel(i + 1); }}>
                        <Text style={styles.hintLockedIcon}>🔒</Text>
                        <Text style={styles.hintLockedText}>{ko ? `힌트 ${i + 1} 열기` : es ? `Abrir pista ${i + 1}` : `Unlock Hint ${i + 1}`}</Text>
                      </Pressable>
                    ) : (
                      <View style={[styles.hintLocked, { opacity: 0.4 }]}>
                        <Text style={styles.hintLockedIcon}>🔒</Text>
                        <Text style={styles.hintLockedText}>{ko ? `힌트 ${i + 1}` : es ? `Pista ${i + 1}` : `Hint ${i + 1}`}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
              <Text style={styles.hintFooter}>{ko ? "이전 힌트를 먼저 열어야 해요" : es ? "Desbloquea las pistas en orden" : "Unlock hints in order"}</Text>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

function DialogueChoicePuzzle({ puzzle, lang, learningLang, onSolved, onResetHints }: {
  puzzle: { pType: "dialogue-choice"; questions: DialogueChoiceQ[] };
  lang: string; learningLang: string; onSolved: () => void; onResetHints?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [solved, setSolved] = useState(false);

  useEffect(() => { onResetHints?.(); }, [idx]);

  const q = puzzle.questions[idx];
  const answer = tri(q.answer, learningLang);
  const [options] = useState(() =>
    puzzle.questions.map((qq) => shuffle([tri(qq.answer, learningLang), ...qq.wrong.map((w) => tri(w, learningLang))]))
  );

  function handleConfirm() {
    if (!selected) return;
    setConfirmed(true);
    if (selected === answer) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  function handleNext() {
    if (idx < puzzle.questions.length - 1) { setIdx((i) => i + 1); setSelected(null); setConfirmed(false); onResetHints?.(); }
    else setSolved(true);
  }

  if (solved) return <PuzzleSolvedBadge onNext={onSolved} lang={lang} />;

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <Text style={styles.puzzleNum}>🧩 PUZZLE {idx + 1}/{puzzle.questions.length}</Text>
        <Text style={styles.puzzleType}>{lang === "korean" ? "대화 선택" : lang === "spanish" ? "Elección de diálogo" : "Dialogue Choice"}</Text>
      </View>
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>{tri(q.prompt, lang)}</Text>
        <Text style={styles.puzzleContext}>{tri(q.context, lang)}</Text>
        <Text style={styles.puzzleChooseHint}>{lang === "korean" ? "↓ 올바른 대답을 선택하세요" : lang === "spanish" ? "↓ Elige la respuesta correcta" : "↓ Choose the correct response"}</Text>
      </View>
      <View style={styles.puzzleOptions}>
        {options[idx].map((opt, i) => {
          const isSelected = selected === opt;
          const isAnswer = opt === answer;
          let bg = C.bg2; let borderColor = C.border;
          if (confirmed && isAnswer) { bg = "rgba(90,170,90,0.25)"; borderColor = "#5a9"; }
          else if (confirmed && isSelected) { bg = "rgba(200,70,70,0.25)"; borderColor = "#e55"; }
          else if (isSelected) { bg = "rgba(201,162,39,0.2)"; borderColor = C.gold; }
          return (
            <Pressable key={i} style={[styles.puzzleOption, { backgroundColor: bg, borderColor }]} onPress={() => !confirmed && setSelected(opt)}>
              <Text style={styles.puzzleOptionText}>{opt}</Text>
              {confirmed && isAnswer && <Ionicons name="checkmark-circle" size={18} color="#5a9" />}
              {confirmed && isSelected && !isAnswer && <Ionicons name="close-circle" size={18} color="#e55" />}
            </Pressable>
          );
        })}
      </View>
      {!confirmed ? (
        <Pressable style={[styles.puzzleConfirmBtn, { opacity: selected ? 1 : 0.5 }]} onPress={handleConfirm} disabled={!selected}>
          <Text style={styles.puzzleConfirmText}>{lang === "korean" ? "확인 ✓" : lang === "spanish" ? "Confirmar ✓" : "Confirm ✓"}</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.puzzleConfirmBtn} onPress={handleNext}>
          <Text style={styles.puzzleConfirmText}>{idx < puzzle.questions.length - 1 ? (lang === "korean" ? "다음 ▶" : "Next ▶") : (lang === "korean" ? "완료 ✓" : "Done ✓")}</Text>
        </Pressable>
      )}
    </View>
  );
}

function SentenceBuilderPuzzle({ puzzle, lang, learningLang, onSolved, onResetHints }: {
  puzzle: { pType: "sentence-builder"; questions: SentenceBuilderQ[] };
  lang: string; learningLang: string; onSolved: () => void; onResetHints?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [solved, setSolved] = useState(false);

  useEffect(() => { onResetHints?.(); }, [idx]);

  const q = puzzle.questions[idx];
  const [shuffledIndices] = useState(() =>
    puzzle.questions.map((qq) => shuffle(qq.words.map((_, i) => i)))
  );
  const shuf = shuffledIndices[idx];

  function tapWord(originalIdx: number) {
    if (confirmed) return;
    if (placed.includes(originalIdx)) {
      setPlaced((p) => p.filter((x) => x !== originalIdx));
    } else {
      setPlaced((p) => [...p, originalIdx]);
    }
  }

  function handleCheck() {
    const correct = JSON.stringify(placed) === JSON.stringify(q.answerOrder);
    setIsCorrect(correct);
    setConfirmed(true);
    if (correct) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  function handleNext() {
    if (idx < puzzle.questions.length - 1) { setIdx((i) => i + 1); setPlaced([]); setConfirmed(false); setIsCorrect(false); onResetHints?.(); }
    else setSolved(true);
  }

  if (solved) return <PuzzleSolvedBadge onNext={onSolved} lang={lang} />;

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <Text style={styles.puzzleNum}>🧩 PUZZLE {idx + 1}/{puzzle.questions.length}</Text>
        <Text style={styles.puzzleType}>{lang === "korean" ? "문장 만들기" : lang === "spanish" ? "Construir oraciones" : "Sentence Builder"}</Text>
      </View>
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>{tri(q.instruction, lang)}</Text>
        <View style={styles.sbAnswerRow}>
          {placed.length === 0
            ? <Text style={styles.sbAnswerPlaceholder}>{lang === "korean" ? "단어를 탭하세요…" : lang === "spanish" ? "Toca las palabras…" : "Tap words below…"}</Text>
            : placed.map((originalIdx, i) => (
                <Pressable key={i} style={styles.sbAnswerChip} onPress={() => tapWord(originalIdx)}>
                  <Text style={styles.sbAnswerChipText}>{tri(q.words[originalIdx], learningLang)}</Text>
                </Pressable>
              ))
          }
        </View>
        {confirmed && (
          <Text style={[styles.sbFeedback, { color: isCorrect ? "#5a9" : "#e55" }]}>
            {isCorrect
              ? (lang === "korean" ? "✓ 정답이에요!" : "✓ Correct!")
              : (lang === "korean" ? "✗ 다시 시도해요" : "✗ Try again")}
          </Text>
        )}
      </View>
      <View style={styles.sbWordBank}>
        {shuf.map((originalIdx) => {
          const inPlaced = placed.includes(originalIdx);
          return (
            <Pressable
              key={originalIdx}
              style={[styles.sbChip, inPlaced && styles.sbChipUsed]}
              onPress={() => tapWord(originalIdx)}
            >
              <Text style={[styles.sbChipText, inPlaced && styles.sbChipTextUsed]}>
                {tri(q.words[originalIdx], learningLang)}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {!confirmed ? (
        <Pressable style={[styles.puzzleConfirmBtn, { opacity: placed.length > 0 ? 1 : 0.5 }]} onPress={handleCheck} disabled={placed.length === 0}>
          <Text style={styles.puzzleConfirmText}>{lang === "korean" ? "확인 ✓" : lang === "spanish" ? "Verificar ✓" : "Check ✓"}</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.puzzleConfirmBtn} onPress={isCorrect ? handleNext : () => { setPlaced([]); setConfirmed(false); setIsCorrect(false); }}>
          <Text style={styles.puzzleConfirmText}>{isCorrect ? (lang === "korean" ? "다음 ▶" : "Next ▶") : (lang === "korean" ? "다시 시도 ↺" : lang === "spanish" ? "Reintentar ↺" : "Try Again ↺")}</Text>
        </Pressable>
      )}
    </View>
  );
}

function InvestigationPuzzle({ puzzle, lang, learningLang, onSolved, onResetHints }: {
  puzzle: { pType: "investigation"; questions: InvestigationQ[] };
  lang: string; learningLang: string; onSolved: () => void; onResetHints?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [solved, setSolved] = useState(false);

  useEffect(() => { onResetHints?.(); }, [idx]);

  const q = puzzle.questions[idx];

  function handleSelect(i: number) {
    if (confirmed) return;
    setSelected(i);
  }

  function handleConfirm() {
    if (selected === null) return;
    setConfirmed(true);
    if (selected === q.answerIdx) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  function handleNext() {
    if (idx < puzzle.questions.length - 1) { setIdx((i) => i + 1); setSelected(null); setConfirmed(false); onResetHints?.(); }
    else setSolved(true);
  }

  if (solved) return <PuzzleSolvedBadge onNext={onSolved} lang={lang} />;

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <Text style={styles.puzzleNum}>🧩 INVESTIGATION</Text>
        <Text style={styles.puzzleType}>{lang === "korean" ? "단서 조사" : lang === "spanish" ? "Investigar pistas" : "Evidence Analysis"}</Text>
      </View>
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>{tri(q.prompt, lang)}</Text>
        <Text style={styles.puzzleChooseHint}>{lang === "korean" ? "↓ 핵심 증거를 선택하세요" : lang === "spanish" ? "↓ Selecciona la evidencia clave" : "↓ Select the key evidence"}</Text>
      </View>
      <View style={styles.investigationGrid}>
        {q.clues.map((clue, i) => {
          const isSelected = selected === i;
          const isAnswer = i === q.answerIdx;
          let bg = C.bg2; let borderColor = C.border;
          if (confirmed && isAnswer) { bg = "rgba(90,170,90,0.25)"; borderColor = "#5a9"; }
          else if (confirmed && isSelected) { bg = "rgba(200,70,70,0.25)"; borderColor = "#e55"; }
          else if (isSelected) { bg = "rgba(201,162,39,0.2)"; borderColor = C.gold; }
          return (
            <Pressable key={i} style={[styles.clueCard, { backgroundColor: bg, borderColor }]} onPress={() => handleSelect(i)}>
              <Text style={styles.clueCardNum}>#{i + 1}</Text>
              <Text style={styles.clueCardText}>{tri(clue, learningLang)}</Text>
              {confirmed && isAnswer && <Ionicons name="checkmark-circle" size={16} color="#5a9" style={{ marginTop: 6 }} />}
              {confirmed && isSelected && !isAnswer && <Ionicons name="close-circle" size={16} color="#e55" style={{ marginTop: 6 }} />}
            </Pressable>
          );
        })}
      </View>
      {!confirmed ? (
        <Pressable style={[styles.puzzleConfirmBtn, { opacity: selected !== null ? 1 : 0.5 }]} onPress={handleConfirm} disabled={selected === null}>
          <Text style={styles.puzzleConfirmText}>{lang === "korean" ? "증거 제출 ✓" : lang === "spanish" ? "Presentar evidencia ✓" : "Submit Evidence ✓"}</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.puzzleConfirmBtn} onPress={handleNext}>
          <Text style={styles.puzzleConfirmText}>{lang === "korean" ? "계속 ▶" : "Continue ▶"}</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ─────────────────── CIPHER PUZZLE ─────────────────── */

function CipherPuzzle({ puzzle, lang, learningLang, onSolved, onResetHints }: {
  puzzle: { pType: "cipher"; questions: CipherQ[] };
  lang: string; learningLang: string; onSolved: () => void; onResetHints?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [solved, setSolved] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [unlockedHints, setUnlockedHints] = useState(0);

  const q = puzzle.questions[idx];
  // encodedWord is the cipher text for the learning language
  const encodedWord = learningLang === "spanish" ? q.encoded.es : q.encoded.en;
  // correctAnswer is the decoded answer in the learning language
  const correctAnswer = learningLang === "spanish" ? q.answer.es
    : learningLang === "korean" ? q.answer.ko
    : q.answer.en;
  // nativeTranslation shows the same answer in the UI language (for understanding)
  const nativeTranslation = lang === "korean" ? q.answer.ko
    : lang === "spanish" ? q.answer.es
    : q.answer.en;
  const hintText = lang === "korean" ? q.hint.ko : lang === "spanish" ? q.hint.es : q.hint.en;

  const [shuffledOpts] = useState(() =>
    puzzle.questions.map((qq) => {
      const opts = qq.opts.map((o) =>
        learningLang === "spanish" ? o.es
        : learningLang === "korean" ? o.ko
        : o.en
      );
      return shuffle(opts);
    })
  );

  // Build letter-by-letter decode breakdown: "I→H, P→O, M→L, B→A"
  function buildBreakdown(encoded: string, shift: number): string {
    return encoded
      .split("")
      .map((ch) => {
        const code = ch.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          const decoded = String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
          return `${ch}→${decoded}`;
        }
        return ch;
      })
      .join(", ");
  }

  const breakdown = buildBreakdown(encodedWord, q.shift);

  // Find the circled number label of the correct answer in the shuffled list
  const correctOptNum = (() => {
    const labels = ["①", "②", "③", "④"];
    const ci = shuffledOpts[idx]?.indexOf(correctAnswer);
    return ci >= 0 ? labels[ci] : "";
  })();

  function handleSelect(opt: string) {
    if (showResult) return;
    const correct = opt === correctAnswer;
    setSelected(opt);
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  function handleRetry() {
    setSelected(null);
    setShowResult(false);
    setIsCorrect(false);
  }

  function handleContinue() {
    if (idx < puzzle.questions.length - 1) {
      setIdx((i) => i + 1);
      setSelected(null);
      setShowResult(false);
      setIsCorrect(false);
      setUnlockedHints(0);
      onResetHints?.();
    } else {
      setSolved(true);
    }
  }

  // Progressive hints — generated from puzzle data
  function getHints() {
    const firstLetter = encodedWord[0];
    const decodedFirst = String.fromCharCode(
      ((firstLetter.charCodeAt(0) - 65 - q.shift + 26) % 26) + 65
    );
    const ko = lang === "korean";
    const es = lang === "spanish";
    const halfLen = Math.ceil(encodedWord.length / 2);
    const decodedHalf = encodedWord.slice(0, halfLen).split("").map((ch: string) =>
      String.fromCharCode(((ch.charCodeAt(0) - 65 - q.shift + 26) % 26) + 65)
    ).join("") + "_".repeat(encodedWord.length - halfLen);
    return [
      ko ? "각 글자를 알파벳에서 한 칸 앞 글자로 바꿔보세요."
        : es ? "Cambia cada letra por la que está una posición antes en el alfabeto."
        : "Replace each letter with the one that comes one step before it in the alphabet.",
      ko ? `예: ${firstLetter} → ${decodedFirst}`
        : es ? `Ejemplo: ${firstLetter} → ${decodedFirst}`
        : `Example: ${firstLetter} → ${decodedFirst}`,
      ko ? `단어의 앞부분: ${decodedHalf} — 나머지 글자도 같은 방법으로 풀어봐`
        : es ? `Primeras letras descifradas: ${decodedHalf} — descifra el resto con el mismo método`
        : `First letters decoded: ${decodedHalf} — apply the same shift to the rest`,
    ];
  }

  const hints = getHints();

  if (solved) return <PuzzleSolvedBadge onNext={onSolved} lang={lang} />;

  // ── Result screen ──
  if (showResult) {
    const ko = lang === "korean";
    const es = lang === "spanish";

    if (!isCorrect) {
      // ── WRONG ANSWER ──
      return (
        <View style={styles.puzzleBox}>
          <View style={styles.puzzleHeaderRow}>
            <Text style={styles.puzzleNum}>🔐 {ko ? "암호를 해독하라!" : es ? "¡Descifra el código!" : "Decode the Cipher!"}</Text>
            <Text style={styles.puzzleType}>{idx + 1}/{puzzle.questions.length}</Text>
          </View>

          {/* Error banner — NO answer reveal */}
          <View style={styles.cipherResultWrong}>
            <Text style={styles.cipherResultTitle}>
              ❌ {ko ? "틀렸어요" : es ? "Incorrecto" : "Wrong!"}
            </Text>
          </View>

          {/* Fox dialogue */}
          <View style={styles.cipherLingoRow}>
            <Text style={styles.cipherLingoEmoji}>🦊</Text>
            <View style={styles.cipherLingoBubble}>
              <Text style={styles.cipherLingoBubbleText}>
                {ko ? "흠… 뭔가 조금 다른 것 같군요, 파트너." : es ? "Hmm… algo no está bien, compañero." : "Hmm… something's not quite right, partner."}
              </Text>
            </View>
          </View>
          <Text style={styles.cipherRetryHint}>
            {ko ? "조금만 더 생각해보세요." : es ? "Piénsalo un poco más." : "Think it over a bit more."}
          </Text>

          {/* Buttons: Retry + Hint */}
          <View style={styles.cipherBtnRow}>
            <Pressable style={[styles.puzzleConfirmBtn, styles.cipherRetryBtn]} onPress={handleRetry}>
              <Text style={[styles.puzzleConfirmText, { color: C.gold }]}>
                {ko ? "다시 시도" : es ? "Reintentar" : "Retry"}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.puzzleConfirmBtn, { flex: 1 }]}
              onPress={() => { setShowHintModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <Text style={styles.puzzleConfirmText}>
                💡 {ko ? "힌트 보기" : es ? "Ver pistas" : "Show Hints"}
              </Text>
            </Pressable>
          </View>

          {/* Hint Modal (shared) */}
          <Modal visible={showHintModal} transparent animationType="fade" onRequestClose={() => setShowHintModal(false)}>
            <Pressable style={styles.hintOverlay} onPress={() => setShowHintModal(false)}>
              <Pressable style={styles.hintNotebook} onPress={() => {}}>
                <View style={styles.hintNotebookHeader}>
                  <Text style={styles.hintNotebookTitle}>🔍 {ko ? "수사 노트" : es ? "Cuaderno de Detective" : "Detective's Notebook"}</Text>
                  <Pressable onPress={() => setShowHintModal(false)} style={styles.hintCloseBtn}>
                    <Text style={styles.hintCloseBtnText}>✕</Text>
                  </Pressable>
                </View>
                <View style={styles.hintNotebookRule} />
                {hints.map((hint, i) => {
                  const isUnlocked = i < unlockedHints;
                  const isNext = i === unlockedHints;
                  return (
                    <View key={i} style={styles.hintRow}>
                      {isUnlocked ? (
                        <View style={styles.hintUnlocked}>
                          <Text style={styles.hintLabel}>{ko ? `힌트 ${i + 1}` : es ? `Pista ${i + 1}` : `Hint ${i + 1}`}</Text>
                          <Text style={styles.hintText}>{hint}</Text>
                        </View>
                      ) : isNext ? (
                        <Pressable style={styles.hintLocked} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setUnlockedHints(i + 1); }}>
                          <Text style={styles.hintLockedIcon}>🔒</Text>
                          <Text style={styles.hintLockedText}>{ko ? `힌트 ${i + 1} 열기` : es ? `Abrir pista ${i + 1}` : `Unlock Hint ${i + 1}`}</Text>
                        </Pressable>
                      ) : (
                        <View style={[styles.hintLocked, { opacity: 0.4 }]}>
                          <Text style={styles.hintLockedIcon}>🔒</Text>
                          <Text style={styles.hintLockedText}>{ko ? `힌트 ${i + 1}` : es ? `Pista ${i + 1}` : `Hint ${i + 1}`}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
                <Text style={styles.hintFooter}>{ko ? "이전 힌트를 먼저 열어야 해요" : es ? "Desbloquea las pistas en orden" : "Unlock hints in order"}</Text>
              </Pressable>
            </Pressable>
          </Modal>
        </View>
      );
    }

    // ── CORRECT ANSWER ──
    return (
      <View style={styles.puzzleBox}>
        <View style={styles.puzzleHeaderRow}>
          <Text style={styles.puzzleNum}>🔐 {ko ? "암호를 해독하라!" : es ? "¡Descifra el código!" : "Decode the Cipher!"}</Text>
          <Text style={styles.puzzleType}>{idx + 1}/{puzzle.questions.length}</Text>
        </View>

        {/* Success banner */}
        <View style={styles.cipherResultCorrect}>
          <Text style={styles.cipherResultTitle}>✨ {ko ? "퍼즐 해결!" : es ? "¡Puzzle resuelto!" : "Puzzle Solved!"}</Text>
        </View>

        {/* Fox celebration */}
        <View style={styles.cipherLingoRow}>
          <Text style={styles.cipherLingoEmoji}>🦊</Text>
          <View style={styles.cipherLingoBubble}>
            <Text style={styles.cipherLingoBubbleText}>
              {ko ? "훌륭하군요, 파트너! 암호를 완벽히 해독했어요." : es ? "¡Brillante, compañero! Has descifrado el código perfectamente." : "Brilliant, partner! You've decoded the cipher perfectly."}
            </Text>
          </View>
        </View>

        {/* Explanation (only on success) */}
        <View style={styles.cipherDivider} />
        <View style={styles.cipherExplainBox}>
          <Text style={styles.cipherExplainLabel}>
            💡 {ko ? "해설:" : es ? "Explicación:" : "Explanation:"}
          </Text>
          <Text style={styles.cipherExplainBreakdown}>{breakdown}</Text>
          <Text style={styles.cipherExplainResult}>
            {"= "}
            <Text style={{ color: C.gold }}>{correctAnswer}</Text>
            {lang !== learningLang ? ` (${nativeTranslation})` : ""}
          </Text>
        </View>
        <View style={styles.cipherDivider} />

        {/* XP reward */}
        <Text style={styles.cipherXpText}>
          🏆 {ko ? "+50 XP 획득!" : es ? "¡+50 XP obtenidos!" : "+50 XP earned!"}
        </Text>

        {/* Continue button */}
        <Pressable style={styles.puzzleConfirmBtn} onPress={handleContinue}>
          <Text style={styles.puzzleConfirmText}>
            {ko ? "다음 퍼즐 →" : es ? "Siguiente →" : "Next Puzzle →"}
          </Text>
        </Pressable>
      </View>
    );
  }

  // ── Question screen ──
  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <Text style={styles.puzzleNum}>🔐 {lang === "korean" ? "암호를 해독하라!" : lang === "spanish" ? "¡Descifra el código!" : "Decode the Cipher!"}</Text>
        <Text style={styles.puzzleType}>{idx + 1}/{puzzle.questions.length}</Text>
      </View>

      {/* Fox bubble */}
      <View style={styles.cipherLingoRow}>
        <Text style={styles.cipherLingoEmoji}>🦊</Text>
        <View style={styles.cipherLingoBubble}>
          <Text style={styles.cipherLingoBubbleText}>
            {lang === "korean" ? "이 암호를 해독해봐, 파트너!" : lang === "spanish" ? "¡Descifra este código, compañero!" : "Decode this cipher, partner!"}
          </Text>
        </View>
      </View>

      {/* Puzzle card — cipher text + clue only */}
      <View style={styles.cipherWordCard}>
        <Text style={styles.cipherCardLabel}>
          {lang === "korean" ? "암호" : lang === "spanish" ? "Cifrado" : "Cipher"}
        </Text>
        <Text style={styles.cipherEncoded}>{encodedWord}</Text>
        <View style={styles.cipherCardDivider} />
        <Text style={styles.cipherCardLabel}>
          {lang === "korean" ? "단서" : lang === "spanish" ? "Pista" : "Clue"}
        </Text>
        <Text style={styles.cipherHint}>{hintText}</Text>
      </View>

      {/* Hint button */}
      <Pressable
        style={styles.hintBtn}
        onPress={() => { setShowHintModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
      >
        <Text style={styles.hintBtnText}>
          💡 {lang === "korean" ? "힌트 보기" : lang === "spanish" ? "Ver pistas" : "Show Hints"}
          {unlockedHints > 0 && (
            <Text style={styles.hintBtnCount}> ({unlockedHints}/3)</Text>
          )}
        </Text>
      </Pressable>

      {/* Answer options */}
      <View style={styles.puzzleOptions}>
        {shuffledOpts[idx].map((opt, i) => {
          const isSelected = selected === opt;
          const isOpt = opt === correctAnswer;
          let bg = C.bg2; let borderColor = C.border;
          if (isSelected && isOpt) { bg = "rgba(90,170,90,0.25)"; borderColor = "#5a9"; }
          else if (isSelected && !isOpt) { bg = "rgba(200,70,70,0.25)"; borderColor = "#e55"; }
          return (
            <Pressable key={i} style={[styles.puzzleOption, { backgroundColor: bg, borderColor }]} onPress={() => handleSelect(opt)}>
              <Text style={styles.cipherOptLabel}>{["①", "②", "③", "④"][i]}</Text>
              <Text style={[styles.puzzleOptionText, { marginLeft: 8 }]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Detective Hint Modal */}
      <Modal
        visible={showHintModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHintModal(false)}
      >
        <Pressable style={styles.hintOverlay} onPress={() => setShowHintModal(false)}>
          <Pressable style={styles.hintNotebook} onPress={() => {}}>
            {/* Notebook header */}
            <View style={styles.hintNotebookHeader}>
              <Text style={styles.hintNotebookTitle}>
                🔍 {lang === "korean" ? "수사 노트" : lang === "spanish" ? "Cuaderno de Detective" : "Detective's Notebook"}
              </Text>
              <Pressable onPress={() => setShowHintModal(false)} style={styles.hintCloseBtn}>
                <Text style={styles.hintCloseBtnText}>✕</Text>
              </Pressable>
            </View>
            <View style={styles.hintNotebookRule} />

            {/* Hint rows */}
            {hints.map((hint, i) => {
              const isUnlocked = i < unlockedHints;
              const isNext = i === unlockedHints;
              return (
                <View key={i} style={styles.hintRow}>
                  {isUnlocked ? (
                    <View style={styles.hintUnlocked}>
                      <Text style={styles.hintLabel}>
                        {lang === "korean" ? `힌트 ${i + 1}` : lang === "spanish" ? `Pista ${i + 1}` : `Hint ${i + 1}`}
                      </Text>
                      <Text style={styles.hintText}>{hint}</Text>
                    </View>
                  ) : isNext ? (
                    <Pressable
                      style={styles.hintLocked}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setUnlockedHints(i + 1);
                      }}
                    >
                      <Text style={styles.hintLockedIcon}>🔒</Text>
                      <Text style={styles.hintLockedText}>
                        {lang === "korean" ? `힌트 ${i + 1} 열기` : lang === "spanish" ? `Abrir pista ${i + 1}` : `Unlock Hint ${i + 1}`}
                      </Text>
                    </Pressable>
                  ) : (
                    <View style={[styles.hintLocked, { opacity: 0.4 }]}>
                      <Text style={styles.hintLockedIcon}>🔒</Text>
                      <Text style={styles.hintLockedText}>
                        {lang === "korean" ? `힌트 ${i + 1}` : lang === "spanish" ? `Pista ${i + 1}` : `Hint ${i + 1}`}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

            <Text style={styles.hintFooter}>
              {lang === "korean" ? "이전 힌트를 먼저 열어야 해요" : lang === "spanish" ? "Desbloquea las pistas en orden" : "Unlock hints in order"}
            </Text>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/* ─────────────────── WORD TYPING PUZZLE (replaces listen-choose) ─────────── */

function WordTypingPuzzle({ puzzle, lang, learningLang, onSolved, onResetHints }: {
  puzzle: { pType: "listen-choose"; questions: ListenChooseQ[] };
  lang: string; learningLang: string; onSolved: () => void; onResetHints?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [solved, setSolved] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const q = puzzle.questions[idx];
  const targetWord = learningLang === "spanish" ? q.word.es
                   : learningLang === "korean"  ? q.word.ko
                   : q.word.en;
  const targetLangLabel = learningLang === "spanish"
    ? (lang === "korean" ? "스페인어" : lang === "spanish" ? "español" : "Spanish")
    : learningLang === "korean"
    ? (lang === "korean" ? "한국어" : lang === "spanish" ? "coreano" : "Korean")
    : (lang === "korean" ? "영어" : lang === "spanish" ? "inglés" : "English");
  const meaning = lang === "korean" ? q.opts[q.answerIdx].ko
                : lang === "spanish" ? q.opts[q.answerIdx].es
                : q.opts[q.answerIdx].en;

  const isCorrect = answerResult?.correct ?? false;

  function handleConfirm() {
    if (!answer.trim()) return;
    const result = checkAnswer(answer, targetWord, { learningLang });
    setAnswerResult(result);
    setConfirmed(true);
    if (result.correct) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  function handleNext() {
    if (idx < puzzle.questions.length - 1) {
      setIdx((i) => i + 1);
      setAnswer("");
      setConfirmed(false);
      setAnswerResult(null);
      onResetHints?.();
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setSolved(true);
    }
  }

  function getFeedbackText(): string {
    if (!answerResult) return "";
    if (!answerResult.correct) {
      return lang === "korean" ? `오답. 정답: ${targetWord}`
           : lang === "spanish" ? `Incorrecto. Respuesta: ${targetWord}`
           : `Incorrect. Answer: ${targetWord}`;
    }
    if (answerResult.accentDiff) {
      return lang === "korean" ? `🎉 정답! 참고: 올바른 표기는 ${targetWord}입니다`
           : lang === "spanish" ? `🎉 ¡Correcto! Nota: la ortografía correcta es ${targetWord}`
           : `🎉 Correct! Note: the proper spelling is ${targetWord}`;
    }
    if (answerResult.isVariant) {
      return lang === "korean" ? `🎉 정답! 참고: 표준 표기는 ${targetWord}입니다`
           : lang === "spanish" ? `🎉 ¡Correcto! Nota: la ortografía estándar es ${targetWord}`
           : `🎉 Correct! Note: the standard spelling is ${targetWord}`;
    }
    return lang === "korean" ? "🎉 정답이에요!"
         : lang === "spanish" ? "🎉 ¡Correcto!"
         : "🎉 Correct!";
  }

  if (solved) return <PuzzleSolvedBadge onNext={onSolved} lang={lang} />;

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <Text style={styles.puzzleNum}>✍️ {lang === "korean" ? "단어 입력" : lang === "spanish" ? "Escribe la palabra" : "Word Typing"}</Text>
        <Text style={styles.puzzleType}>{idx + 1}/{puzzle.questions.length}</Text>
      </View>

      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>
          {lang === "korean" ? `이 뜻에 맞는 ${targetLangLabel} 단어를 입력하세요` : lang === "spanish" ? `Escribe la palabra en ${targetLangLabel} que significa:` : `Type the ${targetLangLabel} word that means:`}
        </Text>
        <Text style={[styles.puzzleWordMain, { fontSize: 17, textTransform: "none", lineHeight: 26 }]}>{meaning}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 10, gap: 5 }}>
          {Array.from({ length: targetWord.length }).map((_, i) => (
            <View key={i} style={{ width: 14, height: 3, backgroundColor: C.gold, borderRadius: 2, opacity: 0.45 }} />
          ))}
          <Text style={{ fontFamily: F.body, fontSize: 11, color: C.goldDim, width: "100%", textAlign: "center", marginTop: 5 }}>
            {targetWord.length} {lang === "korean" ? "글자" : lang === "spanish" ? "letras" : "letters"}
          </Text>
        </View>
      </View>

      <TextInput
        ref={inputRef}
        style={[styles.writingInput, confirmed && (isCorrect ? styles.writingInputCorrect : styles.writingInputWrong)]}
        value={answer}
        onChangeText={setAnswer}
        placeholder={lang === "korean" ? `${targetLangLabel} 단어를 입력하세요...` : lang === "spanish" ? `Escribe en ${targetLangLabel}...` : `Type the ${targetLangLabel} word...`}
        placeholderTextColor={C.goldDim}
        editable={!confirmed}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={!confirmed ? handleConfirm : undefined}
      />

      {confirmed && (
        <View style={[styles.writingResult, { backgroundColor: isCorrect ? "rgba(90,170,90,0.15)" : "rgba(200,70,70,0.15)" }]}>
          <Text style={{ fontFamily: F.bodySemi, fontSize: 14, color: isCorrect ? "#5a9" : "#e55" }}>
            {getFeedbackText()}
          </Text>
        </View>
      )}

      {!confirmed ? (
        <Pressable style={[styles.puzzleConfirmBtn, { opacity: answer.trim() ? 1 : 0.5 }]} onPress={handleConfirm} disabled={!answer.trim()}>
          <Text style={styles.puzzleConfirmText}>{lang === "korean" ? "확인 ✓" : lang === "spanish" ? "Confirmar ✓" : "Check ✓"}</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.puzzleConfirmBtn} onPress={handleNext}>
          <Text style={styles.puzzleConfirmText}>{lang === "korean" ? "계속 ▶" : lang === "spanish" ? "Continuar ▶" : "Continue ▶"}</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ─────────────────── PRONUNCIATION PUZZLE ─────────────────── */

function PronunciationPuzzle({ puzzle, lang, learningLang, onSolved, onResetHints, onScrollLock }: {
  puzzle: { pType: "pronunciation"; questions: PronunciationQ[] };
  lang: string; learningLang: string; onSolved: () => void; onResetHints?: () => void;
  onScrollLock?: (enabled: boolean) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [paths, setPaths] = useState<{ x: number; y: number }[][]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [recognizing, setRecognizing] = useState(false);
  const [feedback, setFeedback] = useState<"good" | "retry" | null>(null);
  const [recognizedText, setRecognizedText] = useState("");
  const [solved, setSolved] = useState(false);
  const canvasSizeRef = useRef({ width: 320, height: 180 });
  const canvasRef     = useRef<View>(null);
  const canvasOffset  = useRef({ x: 0, y: 0 });

  const q = puzzle.questions[idx];
  const targetWord =
    learningLang === "korean" ? q.word.ko
    : learningLang === "spanish" ? q.word.es
    : q.word.en;

  const allPaths = [...paths, ...(currentPath.length > 0 ? [currentPath] : [])];

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (e) => {
      onScrollLock?.(false);
      const x = e.nativeEvent.pageX - canvasOffset.current.x;
      const y = e.nativeEvent.pageY - canvasOffset.current.y;
      setCurrentPath([{ x, y }]);
      setFeedback(null);
    },
    onPanResponderMove: (e) => {
      const x = e.nativeEvent.pageX - canvasOffset.current.x;
      const y = e.nativeEvent.pageY - canvasOffset.current.y;
      setCurrentPath((prev) => [...prev, { x, y }]);
    },
    onPanResponderRelease: () => {
      onScrollLock?.(true);
      if (currentPath.length > 0) setPaths((prev) => [...prev, currentPath]);
      setCurrentPath([]);
    },
  });

  function pathToSvgD(points: { x: number; y: number }[]): string {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.5} ${points[0].y}`;
    return points.reduce(
      (d, { x, y }, i) => (i === 0 ? `M ${x} ${y}` : `${d} L ${x} ${y}`),
      ""
    );
  }

  function clearCanvas() {
    setPaths([]);
    setCurrentPath([]);
    setFeedback(null);
    setRecognizedText("");
  }

  function wordMatchScore(target: string, recognized: string): number {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9가-힣]/g, "").trim();
    const t = norm(target);
    const r = norm(recognized);
    if (!t || !r) return 0;
    if (r.includes(t)) return 1;
    // partial: count matching characters from the start
    let common = 0;
    for (let i = 0; i < Math.min(t.length, r.length); i++) {
      if (t[i] === r[i]) common++;
    }
    return common / t.length;
  }

  function advanceNext() {
    if (idx < puzzle.questions.length - 1) {
      setIdx((i) => i + 1);
      clearCanvas();
      onResetHints?.();
    } else {
      setSolved(true);
    }
  }

  async function handleSubmit() {
    if (allPaths.length === 0) return;
    setRecognizing(true);
    try {
      let imageBase64 = "";
      if (Platform.OS === "web") {
        const canvas = document.createElement("canvas");
        const { width, height } = canvasSizeRef.current;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#0d0503";
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = "#c9a227";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        allPaths.forEach((path) => {
          if (path.length === 0) return;
          ctx.beginPath();
          ctx.moveTo(path[0].x, path[0].y);
          path.forEach(({ x, y }, i) => { if (i > 0) ctx.lineTo(x, y); });
          ctx.stroke();
        });
        imageBase64 = canvas.toDataURL("image/png");
      } else {
        setRecognizing(false);
        advanceNext();
        return;
      }

      const resp = await apiRequest("POST", "/api/handwriting-recognize", {
        imageBase64,
        lang: learningLang,
      }) as { recognized?: string };
      const recognized = resp.recognized ?? "";
      setRecognizedText(recognized);
      const score = wordMatchScore(targetWord, recognized);
      if (score >= 0.6) {
        setFeedback("good");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => advanceNext(), 2000);
      } else {
        setFeedback("retry");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (e) {
      console.warn('[Audio] puzzle pronunciation recognition failed:', e);
      setFeedback("retry");
    } finally {
      setRecognizing(false);
    }
  }

  if (solved) return <PuzzleSolvedBadge onNext={onSolved} lang={lang} />;

  const ko = lang === "korean";
  const es = lang === "spanish";

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <Text style={styles.puzzleNum}>
          ✏️ {ko ? "손으로 쓰기" : es ? "Escritura a mano" : "Write the Word"}
        </Text>
        <Text style={styles.puzzleType}>{idx + 1}/{puzzle.questions.length}</Text>
      </View>

      {/* Instruction */}
      <Text style={styles.hwInstruction}>
        {ko ? "이 단어를 손가락으로 써보세요:" : es ? "Escribe esta palabra con el dedo:" : "Write this word with your finger:"}
      </Text>

      {/* Word display */}
      <View style={styles.hwWordDisplay}>
        <Text style={styles.hwWordText}>{targetWord}</Text>
      </View>

      {/* Drawing canvas */}
      <View
        ref={canvasRef}
        style={styles.hwCanvas}
        onLayout={(e) => {
          canvasSizeRef.current = {
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          };
          canvasRef.current?.measure((_fx, _fy, _w, _h, px, py) => {
            canvasOffset.current = { x: px, y: py };
          });
        }}
        {...panResponder.panHandlers}
      >
        <Svg style={StyleSheet.absoluteFill}>
          {allPaths.map((path, pi) =>
            path.length > 0 ? (
              <Path
                key={pi}
                d={pathToSvgD(path)}
                stroke={C.gold}
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ) : null
          )}
        </Svg>
        {allPaths.length === 0 && currentPath.length === 0 && (
          <Text style={styles.hwPlaceholder}>
            {ko ? "여기에 쓰세요…" : es ? "Escribe aquí…" : "Write here…"}
          </Text>
        )}
      </View>

      {/* Recognized text */}
      {recognizedText ? (
        <View style={styles.hwRecognized}>
          <Text style={styles.hwRecognizedLabel}>
            {ko ? "인식된 텍스트:" : es ? "Texto reconocido:" : "Recognized:"}
          </Text>
          <Text style={styles.hwRecognizedText}>{recognizedText}</Text>
        </View>
      ) : null}

      {/* Feedback */}
      {feedback === "good" && (
        <View style={styles.pronFeedbackGood}>
          <Text style={styles.pronFeedbackText}>
            ✨ {ko ? "잘 썼어요!" : es ? "¡Excelente escritura!" : "Great handwriting!"}
          </Text>
        </View>
      )}
      {feedback === "retry" && (
        <View style={styles.pronFeedbackRetry}>
          <Text style={styles.pronFeedbackText}>
            🔄 {ko ? "다시 써보세요." : es ? "Inténtalo de nuevo." : "Try again."}
          </Text>
          <Pressable style={styles.pronSkipBtn} onPress={advanceNext}>
            <Text style={styles.pronSkipText}>
              {ko ? "그냥 넘어가기 →" : es ? "Continuar →" : "Skip →"}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Clear + Submit */}
      <View style={styles.hwBtnRow}>
        <Pressable style={[styles.hwBtn, styles.hwClearBtn]} onPress={clearCanvas}>
          <Ionicons name="trash-outline" size={18} color={C.gold} />
          <Text style={[styles.hwBtnText, { color: C.gold }]}>
            {ko ? "지우기" : es ? "Borrar" : "Clear"}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.hwBtn, styles.hwSubmitBtn, (recognizing || allPaths.length === 0) && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={recognizing || allPaths.length === 0}
        >
          {recognizing ? (
            <ActivityIndicator size="small" color={C.bg1} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={18} color={C.bg1} />
              <Text style={[styles.hwBtnText, { color: C.bg1 }]}>
                {ko ? "제출" : es ? "Enviar" : "Submit"}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

/* ─────────────────── WRITING MISSION PUZZLE ─────────────────── */

function WritingMissionPuzzle({ puzzle, lang, learningLang, onSolved, onResetHints }: {
  puzzle: { pType: "writing-mission"; questions: WritingMissionQ[] };
  lang: string; learningLang: string; onSolved: () => void; onResetHints?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => { onResetHints?.(); }, [idx]);

  const q = puzzle.questions[idx];
  const targetWord = learningLang === "korean" ? q.word.ko : learningLang === "spanish" ? q.word.es : q.word.en;
  const displayWord = lang === "korean" ? q.word.ko : lang === "spanish" ? q.word.es : q.word.en;
  const hintText = q.hint ? (lang === "korean" ? q.hint.ko : lang === "spanish" ? q.hint.es : q.hint.en) : null;

  const isCorrect = answerResult?.correct ?? false;

  function handleConfirm() {
    if (!answer.trim()) return;
    const result = checkAnswer(answer, targetWord, { acceptableAnswers: q.acceptableAnswers, learningLang });
    setAnswerResult(result);
    setConfirmed(true);
    if (result.correct) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  function handleNext() {
    if (idx < puzzle.questions.length - 1) { setIdx((i) => i + 1); setAnswer(""); setConfirmed(false); setAnswerResult(null); onResetHints?.(); }
    else setSolved(true);
  }

  function getFeedbackText(): string {
    if (!answerResult) return "";
    if (!answerResult.correct) {
      return lang === "korean" ? `정답: ${targetWord}`
           : lang === "spanish" ? `Respuesta: ${targetWord}`
           : `Answer: ${targetWord}`;
    }
    if (answerResult.isVariant) {
      return lang === "korean" ? `🎉 정답! 참고: 표준 표기는 ${targetWord}입니다`
           : lang === "spanish" ? `🎉 ¡Correcto! Nota: la ortografía estándar es ${targetWord}`
           : `🎉 Correct! Note: the standard spelling is ${targetWord}`;
    }
    return lang === "korean" ? "🎉 정답이에요!"
         : lang === "spanish" ? "🎉 ¡Correcto!"
         : "🎉 Correct!";
  }

  if (solved) return <PuzzleSolvedBadge onNext={onSolved} lang={lang} />;

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <Text style={styles.puzzleNum}>✏️ {lang === "korean" ? "쓰기 미션" : lang === "spanish" ? "Misión de escritura" : "Writing Mission"}</Text>
        <Text style={styles.puzzleType}>{idx + 1}/{puzzle.questions.length}</Text>
      </View>
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>
          {lang === "korean"
            ? `'${displayWord}'을(를) ${learningLang === "spanish" ? "스페인어" : learningLang === "korean" ? "한국어" : "영어"}로 써보세요`
            : lang === "spanish"
            ? `Escribe '${displayWord}' en ${learningLang === "spanish" ? "español" : learningLang === "korean" ? "coreano" : "inglés"}`
            : `Type '${displayWord}' in ${learningLang === "spanish" ? "Spanish" : learningLang === "korean" ? "Korean" : "English"}`}
        </Text>
        <Text style={styles.puzzleWordMain}>{displayWord}</Text>
        {hintText && <Text style={styles.puzzleChooseHint}>💡 {hintText}</Text>}
      </View>
      <TextInput
        style={[styles.writingInput, confirmed && (isCorrect ? styles.writingInputCorrect : styles.writingInputWrong)]}
        value={answer}
        onChangeText={setAnswer}
        placeholder={lang === "korean" ? "여기에 입력하세요..." : lang === "spanish" ? "Escribe aquí..." : "Type here..."}
        placeholderTextColor={C.goldDim}
        editable={!confirmed}
        autoCapitalize="sentences"
        autoCorrect={false}
      />
      {confirmed && (
        <View style={[styles.writingResult, { backgroundColor: isCorrect ? "rgba(90,170,90,0.15)" : "rgba(200,70,70,0.15)" }]}>
          <Text style={{ fontFamily: F.bodySemi, fontSize: 14, color: isCorrect ? "#5a9" : "#e55" }}>
            {getFeedbackText()}
          </Text>
        </View>
      )}
      {!confirmed ? (
        <Pressable style={[styles.puzzleConfirmBtn, { opacity: answer.trim() ? 1 : 0.5 }]} onPress={handleConfirm} disabled={!answer.trim()}>
          <Text style={styles.puzzleConfirmText}>{lang === "korean" ? "확인 ✓" : lang === "spanish" ? "Confirmar ✓" : "Check ✓"}</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.puzzleConfirmBtn} onPress={handleNext}>
          <Text style={styles.puzzleConfirmText}>{lang === "korean" ? "계속 ▶" : lang === "spanish" ? "Continuar ▶" : "Continue ▶"}</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ─────────────────── WORD PUZZLE ─────────────────── */

function WordPuzzlePuzzle({ puzzle, lang, learningLang, onSolved, onResetHints }: {
  puzzle: { pType: "word-puzzle"; questions: WordPuzzleQ[] };
  lang: string; learningLang: string; onSolved: () => void; onResetHints?: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [tapped, setTapped] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);

  useEffect(() => { onResetHints?.(); }, [idx]);

  const q = puzzle.questions[idx];
  const scrambledText = learningLang === "korean" ? q.scrambled.ko : learningLang === "spanish" ? q.scrambled.es : q.scrambled.en;
  const correctWord = learningLang === "korean" ? q.word.ko : learningLang === "spanish" ? q.word.es : q.word.en;
  const letters = scrambledText.split("");

  const assembled = tapped.map((ti) => letters[ti]).join("");
  const isCorrect = assembled.toLowerCase() === correctWord.toLowerCase();

  function handleTapLetter(i: number) {
    if (tapped.includes(i)) return;
    const next = [...tapped, i];
    setTapped(next);
    const newWord = next.map((ti) => letters[ti]).join("");
    if (newWord.toLowerCase() === correctWord.toLowerCase()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        if (idx < puzzle.questions.length - 1) { setIdx((n) => n + 1); setTapped([]); onResetHints?.(); }
        else setSolved(true);
      }, 700);
    }
  }

  function handleReset() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTapped([]);
  }

  if (solved) return <PuzzleSolvedBadge onNext={onSolved} lang={lang} />;

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <Text style={styles.puzzleNum}>🔀 {lang === "korean" ? "단어 맞추기" : lang === "spanish" ? "Ordenar letras" : "Word Unscramble"}</Text>
        <Text style={styles.puzzleType}>{idx + 1}/{puzzle.questions.length}</Text>
      </View>
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>
          {lang === "korean" ? "글자를 순서대로 탭해서 단어를 완성하세요" : lang === "spanish" ? "Toca las letras en orden para formar la palabra" : "Tap letters in order to form the word"}
        </Text>
        <View style={styles.wordPuzzleAnswerRow}>
          {correctWord.split("").map((_, i) => (
            <View key={i} style={[styles.wordPuzzleSlot, i < assembled.length && styles.wordPuzzleSlotFilled]}>
              <Text style={styles.wordPuzzleSlotText}>{i < assembled.length ? assembled[i] : "_"}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.wordPuzzleLettersRow}>
        {letters.map((letter, i) => {
          const used = tapped.includes(i);
          return (
            <Pressable
              key={i}
              style={[styles.wordPuzzleLetter, used && styles.wordPuzzleLetterUsed]}
              onPress={() => handleTapLetter(i)}
              disabled={used}
            >
              <Text style={[styles.wordPuzzleLetterText, used && { color: C.goldDim }]}>{letter}</Text>
            </Pressable>
          );
        })}
      </View>
      {tapped.length > 0 && !isCorrect && (
        <Pressable style={[styles.puzzleConfirmBtn, { backgroundColor: "rgba(201,162,39,0.2)" }]} onPress={handleReset}>
          <Text style={[styles.puzzleConfirmText, { color: C.gold }]}>
            {lang === "korean" ? "🔄 다시 시작" : lang === "spanish" ? "🔄 Reiniciar" : "🔄 Reset"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

/* ─────────────────── FALLBACK PUZZLE ─────────────────── */

function FallbackPuzzle({ lang, onSolved }: { lang: string; onSolved: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const questions = [
    { q: lang === "korean" ? "'Hello'는 무슨 뜻인가요?" : lang === "spanish" ? "¿Qué significa 'Hello'?" : "What does 'Bonjour' mean?",
      opts: lang === "korean" ? ["안녕하세요", "감사합니다", "죄송합니다", "잘 자요"] : lang === "spanish" ? ["Hola", "Gracias", "Lo siento", "Buenas noches"] : ["Hello", "Thank you", "Sorry", "Good night"],
      answer: 0 },
  ];
  const q = questions[0];

  function handleSelect(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.answer) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setTimeout(() => setDone(true), 900);
  }

  if (done) return <PuzzleSolvedBadge onNext={onSolved} lang={lang} />;

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <Text style={styles.puzzleNum}>🧩 {lang === "korean" ? "퀴즈" : lang === "spanish" ? "Quiz" : "Quick Quiz"}</Text>
      </View>
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordMain}>{q.q}</Text>
      </View>
      <View style={styles.puzzleOptions}>
        {q.opts.map((opt, i) => {
          const isSelected = selected === i;
          const isAnswer = i === q.answer;
          let bg = C.bg2; let borderColor = C.border;
          if (isSelected && isAnswer) { bg = "rgba(90,170,90,0.25)"; borderColor = "#5a9"; }
          else if (isSelected && !isAnswer) { bg = "rgba(200,70,70,0.25)"; borderColor = "#e55"; }
          return (
            <Pressable key={i} style={[styles.puzzleOption, { backgroundColor: bg, borderColor }]} onPress={() => handleSelect(i)}>
              <Text style={styles.puzzleOptionText}>{opt}</Text>
              {isSelected && isAnswer && <Ionicons name="checkmark-circle" size={18} color="#5a9" />}
              {isSelected && !isAnswer && <Ionicons name="close-circle" size={18} color="#e55" />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ─────────────────── CLUE REVEAL ─────────────────── */

function ClueReveal({ clue, lang, onNext }: { clue: SeqClue; lang: string; onNext: () => void }) {
  const scale = useRef(new Animated.Value(0.7)).current;
  const glow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 7 }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1000, useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0, duration: 1000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const title = lang === "korean" ? clue.titleKo : lang === "spanish" ? clue.titleEs : clue.titleEn;
  const desc = lang === "korean" ? clue.descKo : lang === "spanish" ? clue.descEs : clue.descEn;

  return (
    <View style={styles.clueReveal}>
      <Animated.View style={[styles.clueRevealCard, { transform: [{ scale }] }]}>
        <Text style={styles.clueRevealBadge}>🔍 {lang === "korean" ? "단서 발견!" : lang === "spanish" ? "¡Pista Descubierta!" : "Clue Discovered!"}</Text>
        <Text style={styles.clueSymbol}>{clue.symbol}</Text>
        <Text style={styles.clueRevealTitle}>{title}</Text>
        <Text style={styles.clueRevealDesc}>{desc}</Text>
        <Pressable style={styles.clueRevealBtn} onPress={onNext}>
          <Text style={styles.clueRevealBtnText}>{lang === "korean" ? "계속 수사하기 ▶" : lang === "spanish" ? "Continuar investigando ▶" : "Continue Investigation ▶"}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

/* ─────────────────── COMPLETION ─────────────────── */

function CompletionScreen({ story, lang, xpEarned }: { story: Story; lang: string; xpEarned: number }) {
  const scale = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 50, friction: 7 }).start();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.completionScroll} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.completionCard, { transform: [{ scale }] }]}>
        <Text style={styles.completionEmoji}>🦊</Text>
        <Text style={styles.completionTitle}>{lang === "korean" ? "챕터 완료!" : lang === "spanish" ? "¡Capítulo Completado!" : "Chapter Complete!"}</Text>
        <Text style={styles.completionStoryTitle}>{lang === "korean" ? story.titleKo : lang === "spanish" ? story.titleEs : story.title}</Text>
        <View style={styles.xpRewardRow}>
          <Ionicons name="flash" size={22} color={C.bg1} />
          <Text style={styles.xpRewardNum}>+{xpEarned} XP</Text>
        </View>
        <Text style={styles.completionMsg}>{lang === "korean" ? "훌륭해요! 언어 탐정으로서의 실력이 향상되었어요. 다음 챕터가 기다립니다…" : lang === "spanish" ? "¡Excelente! Tus habilidades como detective lingüístico han mejorado. El próximo capítulo te espera…" : "Excellent! Your skills as a Language Detective have grown. The next chapter awaits…"}</Text>
        {story.nextChapterId && (
          <Pressable
            style={styles.completionNextBtn}
            onPress={() => router.replace(`/story-scene?id=${story.nextChapterId}` as any)}
          >
            <Ionicons name="arrow-forward" size={18} color={C.bg1} />
            <Text style={styles.completionNextBtnText}>{lang === "korean" ? "다음 챕터 ▶" : lang === "spanish" ? "Próximo Capítulo ▶" : "Next Chapter ▶"}</Text>
          </Pressable>
        )}
        <Pressable style={styles.completionHomeBtn} onPress={() => router.replace("/(tabs)/story" as any)}>
          <Text style={styles.completionHomeBtnText}>{lang === "korean" ? "스토리 목록으로" : lang === "spanish" ? "Lista de capítulos" : "Back to Story Map"}</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

/* ─────────────────── MAIN COMPONENT ─────────────────── */

export default function StoryScene() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { nativeLanguage, learningLanguage, updateStats } = useLanguage();
  const lang = nativeLanguage ?? "english";
  const learningLang = learningLanguage ?? "english";

  const story = STORIES[id ?? "london"] ?? STORIES.london;
  const [seqIdx, setSeqIdx] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [sharedHintVisible, setSharedHintVisible] = useState(false);
  const [sharedHintLevel, setSharedHintLevel] = useState(0);
  const [puzzleScrollEnabled, setPuzzleScrollEnabled] = useState(true);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const bgmRef = useRef<Audio.Sound | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    let mounted = true;

    async function startBGM() {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/story_bgm.mp3"),
          { isLooping: true, volume: 0.4 }
        );
        if (!mounted) { sound.unloadAsync(); return; }
        bgmRef.current = sound;
        await sound.playAsync();
      } catch (e) { console.warn("[Story] BGM start failed:", e); }
    }

    startBGM();

    const sub = AppState.addEventListener("change", (state) => {
      if (!bgmRef.current) return;
      if (state === "active") { bgmRef.current.playAsync().catch((e: unknown) => console.warn('[Audio] BGM resume failed:', e)); }
      else { bgmRef.current.pauseAsync().catch((e: unknown) => console.warn('[Audio] BGM pause failed:', e)); }
    });

    return () => {
      mounted = false;
      sub.remove();
      // Stop all cached TTS sounds on unmount
      _ttsCacheNative.forEach((sound) => { sound.stopAsync().catch((e: unknown) => console.warn('[Audio] TTS stop cleanup failed:', e)); sound.unloadAsync().catch((e: unknown) => console.warn('[Audio] TTS unload cleanup failed:', e)); });
      _ttsCacheNative.clear();
      _ttsCacheWeb.forEach((audio) => { try { audio.pause(); audio.src = ""; } catch (e) { console.warn('[Audio] web audio cleanup failed:', e); } });
      _ttsCacheWeb.clear();
      if (bgmRef.current) {
        bgmRef.current.stopAsync().catch((e: unknown) => console.warn('[Audio] BGM stop cleanup failed:', e));
        bgmRef.current.unloadAsync().catch((e: unknown) => console.warn('[Audio] BGM unload cleanup failed:', e));
        bgmRef.current = null;
      }
    };
  }, []);

  const seq = story.sequence;
  const totalScenes = seq.filter((s) => s.kind === "scene").length;

  const BGM_FULL = 0.4;
  const BGM_DIM  = 0.08;   // dimmed during pronunciation / speaking quizzes

  useEffect(() => {
    const currentItem = seq[seqIdx];
    const isSpeakingQuiz =
      currentItem?.kind === "puzzle" &&
      (currentItem.pType === "pronunciation" || currentItem.pType === "voice-power" || currentItem.pType === "npc-rescue");
    bgmRef.current?.setVolumeAsync(isSpeakingQuiz ? BGM_DIM : BGM_FULL).catch((e: unknown) => console.warn('[Audio] BGM volume change failed:', e));
  }, [seqIdx]);
  const sceneCount = seq.slice(0, seqIdx).filter((s) => s.kind === "scene").length;

  function fadeTransition(cb: () => void) {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      cb();
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  }

  function advance() {
    setSharedHintVisible(false);
    setSharedHintLevel(0);

    // Track idioms from dialogue scenes into Expression Book
    const currentItem = seq[seqIdx];
    if (currentItem?.kind === "scene" && currentItem.idiomRef) {
      const idiomEntry = IDIOM_COLLECTION[currentItem.idiomRef];
      if (idiomEntry) {
        const tl = learningLang === "korean" ? "ko" : learningLang === "spanish" ? "es" : "en";
        const idiomData = idiomEntry.idiom[tl] ?? idiomEntry.idiom["en"];
        if (idiomData?.expression) {
          const chapter = story.id === "london" ? "ch1" : story.id === "madrid" ? "ch2" : story.id === "seoul" ? "ch3" : story.id === "cairo" ? "ch4" : "ch5";
          const meaning = Object.values(idiomData.meaning ?? {})[0] ?? "";
          addToExpressionBook(
            [idiomData.expression],
            chapter,
            undefined,
            idiomEntry.npc,
          ).catch((e: unknown) => console.warn('[Story] addToExpressionBook failed:', e));
        }
      }
    }

    fadeTransition(() => {
      if (seqIdx < seq.length - 1) {
        setSeqIdx((i) => i + 1);
      } else {
        finishChapter();
      }
    });
  }

  async function finishChapter() {
    const earned = 150;
    setXpEarned(earned);
    setCompleted(true);
    await markChapterComplete(story.id, story.nextChapterId);
    try { await updateStats({ xp: earned }); } catch (e) { console.warn("[Story] finishChapter XP update failed:", e); }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function resetSharedHints() {
    setSharedHintLevel(0);
    setSharedHintVisible(false);
  }

  async function handlePuzzleSolved() {
    try { await updateStats({ xp: 20 }); } catch (e) { console.warn('[Story] handlePuzzleSolved XP update failed:', e); }

    // Track expressions and I/O ratio for inline puzzles
    const currentItem = seq[seqIdx];
    if (currentItem?.kind === "puzzle") {
      const puzzleItem = currentItem as SeqPuzzle;
      const chapter = story.id === "london" ? "ch1" : story.id === "madrid" ? "ch2" : story.id === "seoul" ? "ch3" : story.id === "cairo" ? "ch4" : "ch5";
      if (puzzleItem.targetExpressions?.length) {
        addToExpressionBook(puzzleItem.targetExpressions, chapter, puzzleItem.tprsStage).catch((e: unknown) => console.warn('[Story] addToExpressionBook failed:', e));
        if (puzzleItem.tprsStage === 4) markExpressionsMastered(puzzleItem.targetExpressions).catch((e: unknown) => console.warn('[Story] markExpressionsMastered failed:', e));
      }
      trackQuizIO(chapter, puzzleItem.pType).catch((e: unknown) => console.warn('[Story] trackQuizIO failed:', e));
    }

    advance();
  }

  const item = seq[seqIdx];
  const progress = seq.length > 0 ? (seqIdx / seq.length) * 100 : 0;
  const character = item.kind === "scene"
    ? story.characters.find((c) => c.id === item.charId) ?? story.characters[0]
    : story.characters[0];

  function getSceneText(it: SeqScene) {
    // For non-narration dialogue, prefer mixed-language versions (textKoMix/textEsMix)
    // which keep learned English expressions inline for progressive immersion.
    // Narration scenes always use the fully-translated versions.
    if (lang === "korean") {
      if (!it.isNarration && it.textKoMix) return it.textKoMix;
      if (it.textKo) return it.textKo;
    }
    if (lang === "spanish") {
      if (!it.isNarration && it.textEsMix) return it.textEsMix;
      if (it.textEs) return it.textEs;
    }
    return it.text;
  }

  function getCharName(char: (typeof story.characters)[0]) {
    if (lang === "korean" && char.nameKo) return char.nameKo;
    return char.name;
  }

  const titleLabel = lang === "korean" ? story.titleKo : lang === "spanish" ? story.titleEs : story.title;

  if (completed) {
    return (
      <View style={[styles.root, { paddingTop: topPad }]}>
        <LinearGradient colors={story.gradient} style={StyleSheet.absoluteFill} />
        <CompletionScreen story={story} lang={lang} xpEarned={xpEarned} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <LinearGradient colors={story.gradient} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => {
          // Stop all cached TTS sounds before navigating away
          _ttsCacheNative.forEach((sound) => { sound.stopAsync().catch((e: unknown) => console.warn('[Audio] TTS stop cleanup failed:', e)); sound.unloadAsync().catch((e: unknown) => console.warn('[Audio] TTS unload cleanup failed:', e)); });
          _ttsCacheNative.clear();
          _ttsCacheWeb.forEach((audio) => { try { audio.pause(); audio.src = ""; } catch (e) { console.warn('[Audio] web audio cleanup failed:', e); } });
          _ttsCacheWeb.clear();
          if (bgmRef.current) {
            bgmRef.current.stopAsync().catch((e: unknown) => console.warn('[Audio] BGM stop cleanup failed:', e));
            bgmRef.current.unloadAsync().catch((e: unknown) => console.warn('[Audio] BGM unload cleanup failed:', e));
            bgmRef.current = null;
          }
          router.back();
        }}>
          <Ionicons name="chevron-back" size={20} color={C.gold} />
        </Pressable>
        <Text style={styles.storyTitle} numberOfLines={1}>{titleLabel}</Text>
        <View style={styles.sceneCounter}>
          <Text style={styles.sceneCountText}>{seqIdx + 1}/{seq.length}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: story.accentColor }]} />
      </View>

      {/* Content */}
      <Animated.View style={[styles.contentArea, { opacity: fadeAnim }]}>

        {/* NARRATION */}
        {item.kind === "scene" && item.isNarration && (
          <View style={styles.narrationArea}>
            <Text style={styles.narrationText}>{getSceneText(item)}</Text>
            <Pressable style={styles.narrationBtn} onPress={advance}>
              <Text style={styles.narrationBtnText}>{lang === "korean" ? "다음 ▶" : lang === "spanish" ? "Siguiente ▶" : "Next ▶"}</Text>
            </Pressable>
          </View>
        )}

        {/* DIALOGUE SCENE */}
        {item.kind === "scene" && !item.isNarration && (
          <View style={styles.sceneContainer}>
            <View style={styles.characterArea}>
              {character.isLingo ? (
                <Image
                  source={rudyStoryImg}
                  style={styles.rudyStoryChar}
                  resizeMode="contain"
                />
              ) : (
                <>
                  <View style={[styles.avatarOuter, { shadowColor: story.accentColor }]}>
                    <View style={[styles.avatarInner, { backgroundColor: character.avatarBg }]}>
                      <Text style={styles.avatarEmoji}>{character.emoji}</Text>
                    </View>
                    <View style={[styles.avatarRing, { borderColor: story.accentColor }]} />
                  </View>
                  <Text style={styles.charName}>{getCharName(character)}</Text>
                </>
              )}
            </View>

            <View style={styles.dialogueBox}>
              <View style={styles.speakerTag}>
                <Text style={styles.speakerEmoji}>{character.emoji}</Text>
                <Text style={styles.speakerName}>{getCharName(character)}</Text>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 160 }}>
                <Text style={styles.dialogueText}>{getSceneText(item)}</Text>
              </ScrollView>
              <View style={styles.dotsRow}>
                {seq.slice(0, 5).map((_, i) => (
                  <View key={i} style={[styles.dot, { opacity: i === seqIdx % 5 ? 1 : 0.3 }]} />
                ))}
              </View>
              <Pressable style={styles.nextBtn} onPress={advance}>
                <Text style={styles.nextBtnText}>{lang === "korean" ? "다음 ▶" : lang === "spanish" ? "Siguiente ▶" : "Next ▶"}</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* CLUE REVEAL */}
        {item.kind === "clue" && (
          <ClueReveal clue={item} lang={lang} onNext={advance} />
        )}

        {/* PUZZLES */}
        {item.kind === "puzzle" && (() => {
          const ko = lang === "korean";
          const es = lang === "spanish";
          const headerText = item.pType === "writing-mission"
            ? (ko ? `🎤 ${(item as any).title?.ko || "말하기 미션"}` : es ? `🎤 ${(item as any).title?.es || "Misión de habla"}` : `🎤 ${(item as any).title?.en || "Speaking Mission"}`)
            : ko
            ? `🧩 퍼즐 ${item.puzzleNum} — 언어 실력을 증명하세요!`
            : es
            ? `🧩 Puzzle ${item.puzzleNum} — ¡Demuestra tus habilidades lingüísticas!`
            : `🧩 Puzzle ${item.puzzleNum} — Prove your language skills!`;
          const hasSharedHints = !!item.hints && item.pType !== "cipher" && item.pType !== "fill-blank";
          const h1 = item.hints ? resolveHint(item.hints.h1, lang, learningLang) : "";
          const h2 = item.hints ? resolveHint(item.hints.h2, lang, learningLang) : "";
          const h3 = item.hints?.h3 ? resolveHint(item.hints.h3, lang, learningLang) : null;
          const allHints = [h1, h2, h3].filter(Boolean) as string[];
          const totalHints = allHints.length;

          return (
            <>
              <ScrollView scrollEnabled={puzzleScrollEnabled} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 20 }}>
                <Text style={styles.puzzleHeader}>{headerText}</Text>
                {item.pType === "word-match" && (
                  <WordMatchPuzzle key={seqIdx} puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} onResetHints={resetSharedHints} />
                )}
                {item.pType === "fill-blank" && (
                  <FillBlankPuzzle key={seqIdx} puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} onResetHints={resetSharedHints} />
                )}
                {item.pType === "dialogue-choice" && (
                  <DialogueChoicePuzzle key={seqIdx} puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} onResetHints={resetSharedHints} />
                )}
                {item.pType === "sentence-builder" && (
                  <SentenceBuilderPuzzle key={seqIdx} puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} onResetHints={resetSharedHints} />
                )}
                {item.pType === "investigation" && (
                  <InvestigationPuzzle key={seqIdx} puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} onResetHints={resetSharedHints} />
                )}
                {item.pType === "cipher" && (
                  <CipherPuzzle key={seqIdx} puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} onResetHints={resetSharedHints} />
                )}
                {item.pType === "listen-choose" && (
                  <WordTypingPuzzle key={seqIdx} puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} onResetHints={resetSharedHints} />
                )}
                {item.pType === "pronunciation" && (
                  <PronunciationPuzzle key={seqIdx} puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} onResetHints={resetSharedHints} onScrollLock={setPuzzleScrollEnabled} />
                )}
                {item.pType === "writing-mission" && (
                  <WritingMissionPuzzle key={seqIdx} puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} onResetHints={resetSharedHints} />
                )}
                {item.pType === "word-puzzle" && (
                  <WordPuzzlePuzzle key={seqIdx} puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} onResetHints={resetSharedHints} />
                )}
                {!["word-match","fill-blank","dialogue-choice","sentence-builder","investigation","cipher","listen-choose","pronunciation","writing-mission","word-puzzle","voice-power","debate-battle","npc-rescue"].includes(item.pType) && (
                  <FallbackPuzzle lang={lang} onSolved={handlePuzzleSolved} />
                )}
                {hasSharedHints && (
                  <Pressable
                    style={styles.sharedHintBtn}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSharedHintVisible(true); }}
                  >
                    <Text style={styles.sharedHintBtnText}>
                      💡 {ko ? `힌트 보기 (${sharedHintLevel}/${totalHints})` : es ? `Ver pistas (${sharedHintLevel}/${totalHints})` : `Hints (${sharedHintLevel}/${totalHints})`}
                    </Text>
                  </Pressable>
                )}
              </ScrollView>

              {hasSharedHints && (
                <Modal visible={sharedHintVisible} transparent animationType="fade" onRequestClose={() => setSharedHintVisible(false)}>
                  <Pressable style={styles.hintOverlay} onPress={() => setSharedHintVisible(false)}>
                    <Pressable style={styles.hintNotebook} onPress={() => {}}>
                      <View style={styles.hintNotebookHeader}>
                        <Text style={styles.hintNotebookTitle}>🔍 {ko ? "수사 노트" : es ? "Cuaderno de Detective" : "Detective's Notebook"}</Text>
                        <Pressable onPress={() => setSharedHintVisible(false)} style={styles.hintCloseBtn}>
                          <Text style={styles.hintCloseBtnText}>✕</Text>
                        </Pressable>
                      </View>
                      <View style={styles.hintNotebookRule} />
                      {allHints.map((hint, i) => (
                        <View key={i} style={styles.hintRow}>
                          {sharedHintLevel > i ? (
                            <View style={styles.hintUnlocked}>
                              <Text style={styles.hintLabel}>{ko ? `힌트 ${i + 1}` : es ? `Pista ${i + 1}` : `Hint ${i + 1}`}</Text>
                              <Text style={styles.hintText}>{hint}</Text>
                            </View>
                          ) : sharedHintLevel === i ? (
                            <Pressable style={styles.hintLocked} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSharedHintLevel(i + 1); }}>
                              <Text style={styles.hintLockedIcon}>🔒</Text>
                              <Text style={styles.hintLockedText}>{ko ? `힌트 ${i + 1} 열기` : es ? `Abrir pista ${i + 1}` : `Unlock Hint ${i + 1}`}</Text>
                            </Pressable>
                          ) : (
                            <View style={[styles.hintLocked, { opacity: 0.4 }]}>
                              <Text style={styles.hintLockedIcon}>🔒</Text>
                              <Text style={styles.hintLockedText}>{ko ? `힌트 ${i + 1}` : es ? `Pista ${i + 1}` : `Hint ${i + 1}`}</Text>
                            </View>
                          )}
                        </View>
                      ))}
                      <Text style={styles.hintFooter}>{ko ? "이전 힌트를 먼저 열어야 해요" : es ? "Desbloquea las pistas en orden" : "Unlock hints in order"}</Text>
                    </Pressable>
                  </Pressable>
                </Modal>
              )}
            </>
          );
        })()}
      </Animated.View>
    </View>
  );
}

/* ─────────────────── STYLES ─────────────────── */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
    zIndex: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(201,162,39,0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  storyTitle: {
    flex: 1,
    fontSize: 13,
    fontFamily: F.bodySemi,
    color: C.parchmentDark,
    letterSpacing: 0.3,
  },
  sceneCounter: {
    backgroundColor: "rgba(201,162,39,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  sceneCountText: { fontSize: 11, fontFamily: F.label, color: C.gold },

  progressTrack: {
    height: 3,
    backgroundColor: "rgba(201,162,39,0.12)",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 2,
  },
  progressFill: { height: "100%", borderRadius: 2 },

  contentArea: { flex: 1 },

  /* ── Narration ── */
  narrationArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 28,
  },
  narrationText: {
    fontSize: 18,
    fontFamily: F.body,
    color: C.parchmentDark,
    textAlign: "center",
    lineHeight: 30,
    fontStyle: "italic",
    letterSpacing: 0.3,
  },
  narrationBtn: {
    backgroundColor: "rgba(201,162,39,0.15)",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  narrationBtnText: { fontFamily: F.header, fontSize: 14, color: C.gold, letterSpacing: 0.5 },

  /* ── Scene ── */
  sceneContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  characterArea: {
    alignItems: "center",
    paddingBottom: 16,
    gap: 8,
  },
  avatarOuter: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  lingoAvatar: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  rudyStoryChar: {
    width: 180,
    height: 230,
  },
  avatarEmoji: { fontSize: 56 },
  avatarRing: {
    position: "absolute",
    top: -5,
    left: -5,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  charName: {
    fontSize: 14,
    fontFamily: F.header,
    color: C.parchment,
    letterSpacing: 0.5,
  },
  dialogueBox: {
    backgroundColor: C.bg2,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: C.border,
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  speakerTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(201,162,39,0.12)",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  speakerEmoji: { fontSize: 14 },
  speakerName: { fontSize: 12, fontFamily: F.bodySemi, color: C.gold },
  dialogueText: {
    fontSize: 16,
    fontFamily: F.body,
    lineHeight: 26,
    color: C.parchment,
    fontStyle: "italic",
  },
  dotsRow: { flexDirection: "row", gap: 5, justifyContent: "center" },
  dot: { height: 5, width: 5, borderRadius: 3, backgroundColor: C.gold },
  nextBtn: {
    backgroundColor: C.gold,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },
  nextBtnText: { fontSize: 14, fontFamily: F.header, color: C.bg1, letterSpacing: 0.5 },

  /* ── Clue Reveal ── */
  clueReveal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  clueRevealCard: {
    backgroundColor: C.bg2,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    borderWidth: 2,
    borderColor: C.gold,
    gap: 12,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
    width: "100%",
  },
  clueRevealBadge: {
    fontFamily: F.label,
    fontSize: 11,
    color: C.gold,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  clueSymbol: {
    fontSize: 36,
    fontFamily: F.title,
    color: C.gold,
    letterSpacing: 4,
    marginVertical: 4,
  },
  clueRevealTitle: {
    fontSize: 17,
    fontFamily: F.header,
    color: C.parchment,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  clueRevealDesc: {
    fontSize: 14,
    fontFamily: F.body,
    color: C.parchmentDark,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
  },
  clueRevealBtn: {
    backgroundColor: C.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  clueRevealBtnText: { fontSize: 13, fontFamily: F.header, color: C.bg1, letterSpacing: 0.5 },

  /* ── Puzzle shared ── */
  puzzleHeader: {
    fontSize: 13,
    fontFamily: F.label,
    color: C.gold,
    textAlign: "center",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  puzzleBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: C.bg2,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    gap: 14,
  },
  puzzleHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  puzzleNum: {
    fontSize: 13,
    fontFamily: F.header,
    color: C.gold,
    letterSpacing: 0.5,
  },
  puzzleType: {
    fontSize: 11,
    fontFamily: F.label,
    color: C.goldDim,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  puzzleWordCard: {
    backgroundColor: C.parchment,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  puzzleWordLabel: {
    fontSize: 13,
    fontFamily: F.bodySemi,
    color: C.goldDark,
    fontStyle: "italic",
  },
  puzzleWordMain: {
    fontSize: 28,
    fontFamily: F.header,
    color: C.textParchment,
    letterSpacing: 1,
  },
  puzzleSentence: {
    fontSize: 18,
    fontFamily: F.bodySemi,
    color: C.textParchment,
    lineHeight: 28,
  },
  puzzleContext: {
    fontSize: 14,
    fontFamily: F.body,
    color: C.textParchment,
    lineHeight: 22,
    fontStyle: "italic",
    marginTop: 4,
  },
  puzzleChooseHint: {
    fontSize: 12,
    fontFamily: F.body,
    color: C.goldDark,
    marginTop: 4,
    fontStyle: "italic",
  },
  puzzleOptions: { gap: 9 },
  puzzleOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  puzzleOptionText: {
    fontSize: 14,
    fontFamily: F.bodySemi,
    color: C.parchment,
    flex: 1,
  },
  puzzleConfirmBtn: {
    backgroundColor: C.gold,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  puzzleConfirmText: {
    fontSize: 14,
    fontFamily: F.header,
    color: C.bg1,
    letterSpacing: 0.5,
  },

  /* ── Sentence Builder ── */
  sbAnswerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    minHeight: 44,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.3)",
    borderRadius: 10,
    padding: 8,
    backgroundColor: "rgba(201,162,39,0.05)",
  },
  sbAnswerPlaceholder: {
    fontFamily: F.body,
    fontSize: 14,
    color: C.goldDark,
    fontStyle: "italic",
  },
  sbAnswerChip: {
    backgroundColor: C.gold,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  sbAnswerChipText: { fontFamily: F.bodySemi, fontSize: 13, color: C.bg1 },
  sbFeedback: { fontSize: 14, fontFamily: F.bodySemi, textAlign: "center" },
  sbWordBank: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  sbChip: {
    backgroundColor: C.bg1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  sbChipUsed: { opacity: 0.3 },
  sbChipText: { fontFamily: F.bodySemi, fontSize: 14, color: C.parchment },
  sbChipTextUsed: { color: C.goldDark },

  /* ── Investigation ── */
  investigationGrid: {
    gap: 9,
  },
  clueCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  clueCardNum: {
    fontSize: 11,
    fontFamily: F.label,
    color: C.goldDim,
    letterSpacing: 1,
    marginBottom: 4,
  },
  clueCardText: {
    fontSize: 14,
    fontFamily: F.bodySemi,
    color: C.parchment,
    lineHeight: 20,
  },

  /* ── Puzzle Solved ── */
  solvedBadge: {
    margin: 24,
    backgroundColor: C.bg2,
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    borderWidth: 2,
    borderColor: C.gold,
    gap: 10,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  solvedEmoji: { fontSize: 48 },
  solvedTitle: {
    fontSize: 22,
    fontFamily: F.title,
    color: C.gold,
    letterSpacing: 2,
  },
  solvedXp: {
    fontSize: 18,
    fontFamily: F.header,
    color: C.parchment,
    letterSpacing: 1,
  },
  solvedBtn: {
    marginTop: 8,
    backgroundColor: C.gold,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
  },
  solvedBtnText: { fontFamily: F.header, fontSize: 14, color: C.bg1, letterSpacing: 0.5 },

  /* ── Completion ── */
  completionScroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  completionCard: {
    backgroundColor: C.bg2,
    borderRadius: 28,
    padding: 32,
    alignItems: "center",
    borderWidth: 2,
    borderColor: C.gold,
    gap: 14,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  completionEmoji: { fontSize: 64 },
  completionTitle: {
    fontSize: 26,
    fontFamily: F.title,
    color: C.gold,
    letterSpacing: 2,
  },
  completionStoryTitle: {
    fontSize: 15,
    fontFamily: F.header,
    color: C.parchmentDark,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  xpRewardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.gold,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  xpRewardNum: {
    fontSize: 22,
    fontFamily: F.title,
    color: C.bg1,
    letterSpacing: 1,
  },
  completionMsg: {
    fontSize: 14,
    fontFamily: F.body,
    color: C.parchmentDark,
    textAlign: "center",
    lineHeight: 22,
    fontStyle: "italic",
  },
  completionNextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.gold,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    width: "100%",
    justifyContent: "center",
  },
  completionNextBtnText: { fontFamily: F.header, fontSize: 15, color: C.bg1, letterSpacing: 0.5 },
  completionHomeBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    backgroundColor: "rgba(201,162,39,0.08)",
  },
  completionHomeBtnText: { fontFamily: F.bodySemi, fontSize: 14, color: C.goldDim },

  /* ── Cipher Puzzle ── */
  cipherLingoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cipherLingoEmoji: { fontSize: 28 },
  cipherLingoBubble: {
    flex: 1,
    backgroundColor: "rgba(201,162,39,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.2)",
    padding: 10,
  },
  cipherLingoBubbleText: {
    fontFamily: F.bodySemi,
    fontSize: 13,
    color: C.parchment,
    fontStyle: "italic",
  },
  cipherWordCard: {
    backgroundColor: C.bg1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.gold,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  cipherEncoded: {
    fontSize: 38,
    fontFamily: F.title,
    color: C.gold,
    letterSpacing: 6,
  },
  cipherHint: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.goldDim,
    textAlign: "center",
    lineHeight: 20,
  },
  cipherCardLabel: {
    fontSize: 10,
    fontFamily: F.label,
    color: C.goldDim,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  cipherCardDivider: {
    width: "80%",
    height: 1,
    backgroundColor: C.border,
    marginVertical: 4,
  },

  /* ── Hint System ── */
  cipherRetryHint: {
    fontFamily: F.body,
    fontSize: 14,
    color: C.goldDim,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: -4,
  },

  hintBtn: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(201,162,39,0.08)",
  },
  hintBtnText: {
    fontFamily: F.bodySemi,
    fontSize: 14,
    color: C.goldDim,
  },
  hintBtnCount: {
    fontFamily: F.body,
    fontSize: 12,
    color: C.goldDim,
  },
  sharedHintBtn: {
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: "rgba(201,162,39,0.08)",
  },
  sharedHintBtnText: {
    fontFamily: F.bodySemi,
    fontSize: 14,
    color: C.goldDim,
  },
  hintOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  hintNotebook: {
    width: "100%",
    backgroundColor: "#1e0e06",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.gold,
    padding: 20,
    gap: 12,
    shadowColor: C.gold,
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  hintNotebookHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hintNotebookTitle: {
    fontFamily: F.header,
    fontSize: 16,
    color: C.gold,
    letterSpacing: 1,
  },
  hintCloseBtn: {
    padding: 4,
  },
  hintCloseBtnText: {
    fontFamily: F.label,
    fontSize: 16,
    color: C.goldDim,
  },
  hintNotebookRule: {
    height: 1,
    backgroundColor: C.border,
  },
  hintRow: {
    gap: 0,
  },
  hintUnlocked: {
    backgroundColor: "rgba(201,162,39,0.08)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.25)",
    padding: 14,
    gap: 6,
  },
  hintLabel: {
    fontFamily: F.label,
    fontSize: 10,
    color: C.goldDim,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  hintText: {
    fontFamily: F.body,
    fontSize: 15,
    color: C.parchment,
    lineHeight: 22,
  },
  hintLocked: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(201,162,39,0.15)",
    padding: 14,
  },
  hintLockedIcon: {
    fontSize: 18,
  },
  hintLockedText: {
    fontFamily: F.bodySemi,
    fontSize: 14,
    color: C.goldDim,
  },
  hintFooter: {
    fontFamily: F.body,
    fontSize: 11,
    color: "rgba(201,162,39,0.4)",
    textAlign: "center",
    fontStyle: "italic",
  },

  cipherOptLabel: {
    fontSize: 16,
    fontFamily: F.header,
    color: C.gold,
    width: 24,
  },
  cipherResultCorrect: {
    backgroundColor: "rgba(90,170,90,0.15)",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#5a9",
    padding: 14,
    alignItems: "center",
  },
  cipherResultWrong: {
    backgroundColor: "rgba(200,70,70,0.12)",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e55",
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  cipherResultTitle: {
    fontSize: 17,
    fontFamily: F.header,
    color: C.parchment,
    letterSpacing: 0.5,
  },
  cipherResultSub: {
    fontSize: 13,
    fontFamily: F.bodySemi,
    color: C.goldDim,
  },
  cipherDivider: {
    height: 1,
    backgroundColor: "rgba(201,162,39,0.2)",
    marginVertical: 2,
  },
  cipherExplainBox: {
    gap: 6,
    paddingVertical: 4,
  },
  cipherExplainLabel: {
    fontSize: 13,
    fontFamily: F.header,
    color: C.gold,
    letterSpacing: 0.5,
  },
  cipherExplainBreakdown: {
    fontSize: 15,
    fontFamily: F.bodySemi,
    color: C.parchment,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  cipherExplainResult: {
    fontSize: 15,
    fontFamily: F.header,
    color: C.parchmentDark,
    letterSpacing: 0.5,
  },
  cipherXpText: {
    fontSize: 15,
    fontFamily: F.header,
    color: C.gold,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  cipherBtnRow: {
    flexDirection: "row",
    gap: 10,
  },
  cipherRetryBtn: {
    flex: 1,
    backgroundColor: "rgba(201,162,39,0.12)",
    borderWidth: 1,
    borderColor: C.gold,
  },

  /* ── Listen-Choose Puzzle ── */
  listenWordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  listenWordBtn: {
    backgroundColor: C.gold,
    borderRadius: 10,
    padding: 8,
  },

  /* ── Pronunciation Puzzle ── */
  listenBtn2: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.gold,
    borderRadius: 14,
    paddingVertical: 14,
  },
  listenBtn2Text: {
    fontFamily: F.header,
    fontSize: 14,
    color: C.bg1,
    letterSpacing: 0.5,
  },
  pronunciationHint: {
    fontSize: 13,
    fontFamily: F.body,
    color: C.goldDim,
    textAlign: "center",
    fontStyle: "italic",
  },
  pronBtnRow: {
    flexDirection: "row",
    gap: 10,
  },
  pronBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: C.gold,
    borderRadius: 14,
    paddingVertical: 14,
  },
  pronBtnText: {
    fontFamily: F.header,
    fontSize: 14,
    color: C.bg1,
    letterSpacing: 0.5,
  },
  pronMicBtn: {
    backgroundColor: C.bg2,
    borderWidth: 1.5,
    borderColor: C.gold,
  },
  pronMicRecording: {
    backgroundColor: "#c0392b",
    borderColor: "#e74c3c",
  },
  pronFeedbackGood: {
    backgroundColor: "rgba(46,160,67,0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(46,160,67,0.4)",
    padding: 14,
    alignItems: "center",
  },
  pronFeedbackRetry: {
    backgroundColor: "rgba(200,70,70,0.12)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(200,70,70,0.3)",
    padding: 14,
    alignItems: "center",
    gap: 10,
  },
  pronFeedbackText: {
    fontFamily: F.bodySemi,
    fontSize: 16,
    color: C.parchment,
    textAlign: "center",
  },
  pronSkipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  pronSkipText: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.goldDim,
    fontStyle: "italic",
  },

  /* ── Handwriting Puzzle ── */
  hwInstruction: {
    fontFamily: F.body,
    fontSize: 13,
    color: C.parchment + "99",
    marginBottom: 8,
  },
  hwWordDisplay: {
    alignSelf: "center",
    backgroundColor: C.bg2,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.gold,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginBottom: 12,
  },
  hwWordText: {
    fontFamily: F.header,
    fontSize: 36,
    color: C.gold,
    letterSpacing: 3,
    textAlign: "center",
  },
  hwCanvas: {
    width: "100%",
    height: 180,
    backgroundColor: "#0d0503",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: C.gold,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  hwPlaceholder: {
    color: C.parchment + "44",
    fontSize: 13,
    fontFamily: F.body,
    textAlign: "center",
  },
  hwRecognized: {
    backgroundColor: C.bg2,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  hwRecognizedLabel: {
    color: C.parchment + "77",
    fontSize: 11,
    fontFamily: F.body,
    marginBottom: 3,
  },
  hwRecognizedText: {
    color: C.parchment,
    fontSize: 14,
    fontFamily: F.body,
  },
  hwBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  hwBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
  },
  hwClearBtn: {
    borderWidth: 1.5,
    borderColor: C.gold,
    backgroundColor: "transparent",
  },
  hwSubmitBtn: {
    backgroundColor: C.gold,
  },
  hwBtnText: {
    fontSize: 15,
    fontFamily: F.bodySemi,
  },

  /* ── Writing Mission Puzzle ── */
  writingInput: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 14,
    padding: 14,
    fontFamily: F.bodySemi,
    fontSize: 20,
    color: C.parchment,
    backgroundColor: C.bg2,
    textAlign: "center",
    letterSpacing: 2,
  },
  writingInputCorrect: { borderColor: "#5a9", backgroundColor: "rgba(90,170,90,0.1)" },
  writingInputWrong: { borderColor: "#e55", backgroundColor: "rgba(200,70,70,0.1)" },
  writingResult: {
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },

  /* ── Word Puzzle ── */
  wordPuzzleAnswerRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 8,
  },
  wordPuzzleSlot: {
    width: 36,
    height: 44,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "rgba(201,162,39,0.3)",
    backgroundColor: "rgba(201,162,39,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  wordPuzzleSlotFilled: {
    borderColor: C.gold,
    backgroundColor: "rgba(201,162,39,0.15)",
  },
  wordPuzzleSlotText: {
    fontSize: 18,
    fontFamily: F.header,
    color: C.gold,
  },
  wordPuzzleLettersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  wordPuzzleLetter: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: C.bg2,
    borderWidth: 1.5,
    borderColor: C.border,
    justifyContent: "center",
    alignItems: "center",
  },
  wordPuzzleLetterUsed: {
    backgroundColor: "rgba(201,162,39,0.05)",
    borderColor: "rgba(201,162,39,0.15)",
  },
  wordPuzzleLetterText: {
    fontSize: 18,
    fontFamily: F.header,
    color: C.parchment,
  },
});
