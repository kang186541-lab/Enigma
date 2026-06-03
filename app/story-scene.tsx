import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Animated,
  Image,
  ScrollView,
  PanResponder,
  TextInput,
  Modal,
  AppState,
  ActivityIndicator,
  ImageSourcePropType,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { STORY_PROGRESS_KEY, StoryProgress } from "@/app/(tabs)/story";
import { C, F } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import { queueProgressPush } from "@/lib/progressSync";
import { addToExpressionBook, trackQuizIO, markExpressionsMastered } from "@/lib/storyUtils";
import { addPhrases as addSrsPhrases } from "@/lib/srsManager";
import { checkAnswer, AnswerResult } from "@/lib/answerUtils";
import { Svg, Path } from "react-native-svg";
import Typewriter, { TypewriterHandle } from "@/components/story/Typewriter";
import StoryIntroMotionComic from "@/components/story/StoryIntroMotionComic";
import { hasIntroTimeline } from "@/components/story/intro/timelines";
import type { ChapterId } from "@/components/story/intro/timelines/types";
import BossSpellPuzzle, { BossSpellQuestion } from "@/components/story/puzzles/BossSpellPuzzle";
import { EmojiText } from "@/components/EmojiText";

const rudyStoryImg = require("@/assets/rudy_story.png");
const ch1BossDoorImg = require("@/assets/story/chapter1_motion_comic/ch1_boss_door.png");
const ch1TomPortraitImg = require("@/assets/story/dialogue_sprites/ch1_tom_sprite.png");
const ch1EleanorPortraitImg = require("@/assets/story/dialogue_sprites/ch1_eleanor_sprite.png");
const ch1EllisPortraitImg = require("@/assets/story/dialogue_sprites/ch1_ellis_sprite.png");
const ch1BlackCctvImg = require("@/assets/story/dialogue_sprites/ch1_black_cctv_sprite.png");
const ch2BossStageImg = require("@/assets/story/chapter2_motion_comic/ch2_boss_stage.png");
const ch2IsabelPortraitImg = require("@/assets/story/dialogue_sprites/ch2_isabel_sprite.png");
const ch2MiguelPortraitImg = require("@/assets/story/dialogue_sprites/ch2_miguel_sprite.png");
const ch2CarlosPortraitImg = require("@/assets/story/dialogue_sprites/ch2_carlos_sprite.png");
const ch3BossPalaceImg = require("@/assets/story/chapter3_motion_comic/ch3_boss_palace.png");
const ch3MinhoPortraitImg = require("@/assets/story/dialogue_sprites/ch3_minho_sprite.png");
const ch3YoungsookPortraitImg = require("@/assets/story/dialogue_sprites/ch3_youngsook_sprite.png");
const ch3SujinPortraitImg = require("@/assets/story/dialogue_sprites/ch3_sujin_sprite.png");
const ch4BossArchiveImg = require("@/assets/story/chapter4_motion_comic/ch4_boss_archive.png");
const ch4MiraPortraitImg = require("@/assets/story/dialogue_sprites/ch4_mira_sprite.png");
const ch4AmiraPortraitImg = require("@/assets/story/dialogue_sprites/ch4_amira_sprite.png");
const ch4HassanPortraitImg = require("@/assets/story/dialogue_sprites/ch4_hassan_sprite.png");
const ch4BlackPartialPortraitImg = require("@/assets/story/dialogue_sprites/ch4_black_partial_sprite.png");
const ch5BossCoreImg = require("@/assets/story/chapter5_motion_comic/ch5_boss_core.png");
const ch5PennyPortraitImg = require("@/assets/story/dialogue_sprites/ch5_penny_sprite.png");
const ch5BlackFaceImg = require("@/assets/story/dialogue_sprites/ch5_black_face_sprite.png");
const rudyWorriedDetectiveImg = require("@/assets/story/characters/rudy/rudy_worried_detective.png");
const rudyCelebratoryCoachImg = require("@/assets/story/characters/rudy/rudy_celebratory_coach.png");
const eleanorUrgentWarningImg = require("@/assets/story/characters/eleanor/eleanor_urgent_warning.png");
const eleanorAnalyticalDiscoveryImg = require("@/assets/story/characters/eleanor/eleanor_analytical_discovery.png");
const pennyAnxiousFinalClueImg = require("@/assets/story/characters/penny/penny_anxious_final_clue.png");
const pennyBraveResolveImg = require("@/assets/story/characters/penny/penny_brave_resolve.png");
const mrBlackFragileRemorseImg = require("@/assets/story/characters/mr_black/mr_black_fragile_remorse.png");
const mrBlackTiredRevealImg = require("@/assets/story/characters/mr_black/mr_black_tired_reveal.png");
const isabelShockedConcernImg = require("@/assets/story/characters/isabel/isabel_shocked_concern.png");
const isabelRallyingEnergyImg = require("@/assets/story/characters/isabel/isabel_rallying_energy.png");
const bgLondonMuseumHallImg = require("@/assets/story/dialogue_backgrounds/london_museum_hall.png");
const bgMadridFestivalPlazaImg = require("@/assets/story/dialogue_backgrounds/madrid_festival_plaza.png");
const bgMadridFestivalDrainedImg = require("@/assets/story/dialogue_backgrounds/madrid_festival_drained.png");
const bgMadridSealedStageImg = require("@/assets/story/dialogue_backgrounds/madrid_sealed_stage.png");
const bgSeoulPalaceSubwayImg = require("@/assets/story/dialogue_backgrounds/seoul_palace_subway.png");
const bgCairoArchiveRoomImg = require("@/assets/story/dialogue_backgrounds/cairo_archive_room.png");
const bgCairoHospitalRecordImg = require("@/assets/story/dialogue_backgrounds/cairo_hospital_record.png");
const bgBabelTowerCoreImg = require("@/assets/story/dialogue_backgrounds/babel_tower_core.png");
const bgBabelLanguageGatesImg = require("@/assets/story/dialogue_backgrounds/babel_language_gates.png");

const rudyExpressionSprites = {
  worried: rudyWorriedDetectiveImg,
  celebratory: rudyCelebratoryCoachImg,
};

const eleanorExpressionSprites = {
  urgent: eleanorUrgentWarningImg,
  analytical: eleanorAnalyticalDiscoveryImg,
};

const isabelExpressionSprites = {
  shocked: isabelShockedConcernImg,
  rallying: isabelRallyingEnergyImg,
};

const mrBlackExpressionSprites = {
  remorse: mrBlackFragileRemorseImg,
  tired: mrBlackTiredRevealImg,
};

const pennyExpressionSprites = {
  anxious: pennyAnxiousFinalClueImg,
  brave: pennyBraveResolveImg,
};

// ── TTS Audio Cache ────────────────────────────────────────────────────────
// Keyed by "text::lang". Sounds are loaded in advance; on press we just replay.
const _ttsCacheNative = new Map<string, Audio.Sound>();
const _ttsCacheWeb    = new Map<string, HTMLAudioElement>();

/* ─────────────────── TYPES ─────────────────── */

interface Character {
  id: string;
  emoji: string;
  name: string;
  nameKo?: string;
  /** Indonesian (id-ID) character name. Falls back to `name` when absent. */
  nameId?: string;
  side: "left" | "right";
  avatarBg: string;
  isLingo?: boolean;
  portrait?: ImageSourcePropType;
  portraitVariants?: Partial<Record<StoryCharacterExpression, ImageSourcePropType>>;
}

interface Tri {
  en: string;
  ko: string;
  es: string;
  /** Optional Indonesian (id-ID). Falls back to `en` when absent. */
  id?: string;
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
  hints?: { h1: HintTri; h2?: HintTri; h3?: HintTri };
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
  | { pType: "boss-spell"; questions: [BossSpellQuestion] }
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
  return uiLang === "korean" ? src.ko
    : uiLang === "spanish" ? src.es
    : uiLang === "indonesian" ? (src.id ?? src.en)
    : src.en;
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

type StoryBackdropId =
  | "london-museum"
  | "madrid-drained"
  | "madrid-sealed-stage"
  | "madrid-restored"
  | "seoul-palace-subway"
  | "cairo-archive"
  | "cairo-hospital-record"
  | "babel-core"
  | "babel-language-gates";

type StoryCharacterExpression = "neutral" | "anxious" | "brave" | "remorse" | "tired" | "worried" | "celebratory" | "urgent" | "analytical" | "shocked" | "rallying";

/* Sequence items */
type SeqScene = {
  kind: "scene";
  charId: string;
  text: string;
  textKo?: string;
  textEs?: string;
  /** Indonesian (id-ID) full translation. Falls back to `text` (English) when absent. */
  textId?: string;
  /** Mixed-language Korean: mostly Korean with learned English expressions inline */
  textKoMix?: string;
  /** Mixed-language Spanish: mostly Spanish with learned English expressions inline */
  textEsMix?: string;
  /** Mixed-language Indonesian: mostly Indonesian with learned English expressions inline */
  textIdMix?: string;
  isNarration?: boolean;
  /** Scene-specific illustrated backdrop. Falls back to the chapter hub backdrop. */
  backdrop?: StoryBackdropId;
  /** Character sprite variant for authored emotional beats. */
  expression?: StoryCharacterExpression;
  /** Reference to an entry in IDIOM_COLLECTION — links this dialogue to a targetLang-adaptive idiom */
  idiomRef?: string;
};
type SeqClue = {
  kind: "clue";
  symbol: string;
  titleEn: string;
  titleKo: string;
  titleEs: string;
  /** Indonesian (id-ID) clue title. Falls back to `titleEn` when absent. */
  titleId?: string;
  descEn: string;
  descKo: string;
  descEs: string;
  /** Indonesian (id-ID) clue description. Falls back to `descEn` when absent. */
  descId?: string;
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

type SeqPuzzle = { kind: "puzzle"; puzzleNum?: number; title?: Tri; context?: Tri; hints?: PuzzleHints } & PuzzleType & TPRSMeta;
type SeqItem = SeqScene | SeqClue | SeqPuzzle;

interface Story {
  id: string;
  title: string;
  titleKo: string;
  titleEs: string;
  /** Indonesian (id-ID) chapter title. Falls back to `title` (English) when absent. */
  titleId?: string;
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
  if (lang === "indonesian") return t.id ?? t.en;
  return t.en;
}

function getAdventureBackdropById(backdrop: StoryBackdropId): ImageSourcePropType {
  switch (backdrop) {
    case "london-museum":
      return bgLondonMuseumHallImg;
    case "madrid-drained":
      return bgMadridFestivalDrainedImg;
    case "madrid-sealed-stage":
      return bgMadridSealedStageImg;
    case "madrid-restored":
      return bgMadridFestivalPlazaImg;
    case "seoul-palace-subway":
      return bgSeoulPalaceSubwayImg;
    case "cairo-archive":
      return bgCairoArchiveRoomImg;
    case "cairo-hospital-record":
      return bgCairoHospitalRecordImg;
    case "babel-core":
      return bgBabelTowerCoreImg;
    case "babel-language-gates":
      return bgBabelLanguageGatesImg;
  }
}

function getDefaultAdventureBackdrop(storyId: string): StoryBackdropId {
  switch (storyId) {
    case "london":
      return "london-museum";
    case "madrid":
      return "madrid-drained";
    case "seoul":
      return "seoul-palace-subway";
    case "cairo":
      return "cairo-archive";
    case "babel":
      return "babel-core";
    default:
      return "london-museum";
  }
}

function getSceneBackdrop(storyId: string, item: SeqItem): ImageSourcePropType | null {
  if (item.kind !== "scene") return null;
  return getAdventureBackdropById(item.backdrop ?? getDefaultAdventureBackdrop(storyId));
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
      id: {
        expression: "Semoga sukses!",
        meaning: { en: "Break a leg!", ko: "행운을 빌어!", es: "¡Buena suerte!" },
        literal: { en: "May you succeed!", ko: "성공하길 바라!" },
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
    titleId: "Sandi London",
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
        nameId: "Rudy",
        side: "left",
        avatarBg: "#2c1810",
        isLingo: true,
        portrait: rudyStoryImg,
        portraitVariants: rudyExpressionSprites,
      },
      {
        id: "tom",
        emoji: "👮",
        name: "Tom",
        nameKo: "톰",
        nameId: "Tom",
        side: "right",
        avatarBg: "#1E2A3A",
        portrait: ch1TomPortraitImg,
      },
      {
        id: "eleanor",
        emoji: "👩‍🏫",
        name: "Eleanor",
        nameKo: "엘리너",
        nameId: "Eleanor",
        side: "right",
        avatarBg: "#2F2A3A",
        portrait: ch1EleanorPortraitImg,
        portraitVariants: eleanorExpressionSprites,
      },
      {
        id: "ellis",
        emoji: "👩‍🔬",
        name: "Dr. Ellis",
        nameKo: "엘리스 박사",
        nameId: "Dr. Ellis",
        side: "right",
        avatarBg: "#2A1A3A",
        portrait: ch1EllisPortraitImg,
      },
      {
        id: "mr_black",
        emoji: "🕴️",
        name: "Mr. Black",
        nameKo: "미스터 블랙",
        nameId: "Pak Black",
        side: "right",
        avatarBg: "#0A0A0A",
        portrait: ch1BlackCctvImg,
      },
    ],
    sequence: [
      // ── Scene 1: After the Prologue ───────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(The last frame of the CCTV still burns in your mind: the black coat, the stolen light, the word Detective written for you. Rudy hovers beside your phone, newly named and still shedding tiny sparks. The museum in the footage is close. Too close.)",
        textKo: "(CCTV의 마지막 장면이 아직 머릿속에 남아 있다. 검은 코트, 훔쳐간 빛, 그리고 너를 향한 Detective라는 단어. 방금 이름을 되찾은 루디가 핸드폰 옆에 떠 있고, 아직 작은 불꽃들이 흩어진다. 영상 속 박물관은 가깝다. 너무 가깝다.)",
        textEs: "(El último fotograma del CCTV sigue ardiendo en tu mente: el abrigo negro, la luz robada, la palabra Detective escrita para ti. Rudy flota junto a tu teléfono, recién nombrado, todavía soltando pequeñas chispas. El museo del video está cerca. Demasiado cerca.)",
        textId: "(Bingkai terakhir CCTV itu masih membekas di benakmu: mantel hitam, cahaya yang dicuri, dan kata Detective yang ditulis untukmu. Rudy melayang di samping ponselmu, baru saja menemukan namanya dan masih memercikkan bunga api kecil. Museum dalam rekaman itu dekat. Terlalu dekat.)",
      },
      // ── Scene 2: The Museum Entrance ──────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(4:30 AM. The British Museum. Police tape flutters in the cold wind. The building is dark except for emergency lights. A young security guard stands at the entrance, arms crossed, jaw clenched. He looks like he's been awake for twelve hours and angry for all of them.)",
        textKo: "(새벽 4시 30분. 대영박물관. 차가운 바람에 경찰 테이프가 펄럭인다. 비상등 외에는 건물이 어둡다. 젊은 경비원이 입구에 서 있다. 팔짱을 끼고, 이를 악물고. 12시간째 깨어 있으면서 내내 화가 나 있는 것 같다.)",
        textEs: "(4:30 AM. El Museo Británico. La cinta policial ondea con el viento frío. El edificio está oscuro excepto por las luces de emergencia. Un joven guardia de seguridad está en la entrada, brazos cruzados, mandíbula apretada. Parece que lleva doce horas despierto y enfadado durante todas ellas.)",
        textId: "(Pukul 04.30 pagi. British Museum. Garis polisi berkibar diterpa angin dingin. Gedung itu gelap kecuali lampu darurat. Seorang penjaga keamanan muda berdiri di pintu masuk, tangan terlipat, rahang mengeras. Ia tampak seperti sudah terjaga dua belas jam dan marah sepanjang waktu itu.)",
      },
      {
        kind: "scene",
        charId: "tom",
        text: "Oi. Museum's closed, yeah? Crime scene. No visitors, no press, no exceptions. I don't care if you're the Queen's cousin, nobody gets past me tonight. So who are you, then?",
        textKo: "야. 박물관 닫았어, 알겠지? 범죄 현장이야. 방문객도 안 돼, 기자도 안 돼, 예외 없어. 여왕 사촌이래도 상관없어. 오늘 밤엔 아무도 나를 지나갈 수 없어. 그래서 누구야, 넌?",
        textKoMix: "야. 박물관 닫았어, 알겠지? No visitors, no exceptions. 여왕 사촌이래도 상관없어. 오늘 밤엔 아무도 못 지나가. My name is Tom. 그래서 넌 누구야?",
        textEs: "Oye. El museo está cerrado, ¿vale? Escena del crimen. No visitantes, no prensa, sin excepciones. Me da igual si eres primo de la Reina, nadie pasa esta noche. ¿Así que quién eres?",
        textEsMix: "Oye. El museo está cerrado, ¿vale? No visitors, no exceptions. Me da igual si eres primo de la Reina, nadie pasa esta noche. My name is Tom. ¿Así que quién eres?",
        textId: "Hei. Museum tutup, paham? Ini tempat kejahatan. Tidak ada pengunjung, tidak ada pers, tidak ada pengecualian. Aku tak peduli kalau kau sepupu Ratu, malam ini tak ada yang bisa lewat. Jadi, siapa kau?",
        textIdMix: "Hei. Museum tutup, paham? No visitors, no exceptions. Aku tak peduli kalau kau sepupu Ratu, malam ini tak ada yang bisa lewat. My name is Tom. Jadi, kau siapa?",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Psst. Partner, before we talk to Tom, let's review some key words first. Greetings, introductions, basic phrases. If we know the vocabulary, the conversation will go smoothly.)",
        textKo: "(쉿. 파트너, 톰에게 말하기 전에 먼저 핵심 단어들을 복습하자. 인사, 자기소개, 기초 표현들. 어휘를 알면 대화가 수월할 거야.)",
        textEs: "(Psst. Compañero, antes de hablar con Tom, repasemos algunas palabras clave primero. Saludos, presentaciones, frases básicas. Si conocemos el vocabulario, la conversación será más fácil.)",
        textId: "(Psst. Partner, sebelum kita bicara dengan Tom, mari kita ulang beberapa kata penting dulu. Sapaan, perkenalan, frasa dasar. Kalau kita tahu kosakatanya, percakapannya akan lancar.)",
      },
      {
        kind: "puzzle",
        puzzleNum: 1,
        pType: "word-match",
        tprsStage: 1,
        targetExpressions: ["Hello", "Help me", "Where is ___?", "My name is ___", "Thank you", "Goodbye"],
        previouslyLearned: [],
        speakAfter: true,
        storyReason: "Tom is testing whether you understand basic phrases before letting you into the crime scene.",
        storyConsequence: "Tom lets you through. The investigation begins.",
        onFail: { addToWeakExpressions: ["Hello", "Help me", "Thank you", "Goodbye"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            word: { en: "Hello", ko: "안녕하세요", es: "Hola", id: "Halo" },
            meaning: { en: "a greeting when you meet someone", ko: "누군가를 만날 때 하는 인사", es: "un saludo cuando conoces a alguien", id: "sapaan saat bertemu seseorang" },
            wrong: [
              { en: "a farewell when leaving", ko: "떠날 때 하는 작별 인사", es: "una despedida al irse", id: "ucapan perpisahan saat pergi" },
              { en: "an apology for a mistake", ko: "실수에 대한 사과", es: "una disculpa por un error", id: "permintaan maaf atas kesalahan" },
              { en: "a request for help", ko: "도움 요청", es: "una petición de ayuda", id: "permintaan bantuan" },
            ],
          },
          {
            word: { en: "Help me", ko: "도와주세요", es: "Ayúdame", id: "Tolong saya" },
            meaning: { en: "asking someone to help you", ko: "누군가에게 도움을 요청하는 표현", es: "pedirle ayuda a alguien", id: "meminta seseorang membantumu" },
            wrong: [
              { en: "a farewell when leaving", ko: "떠날 때 하는 작별 인사", es: "una despedida al irse", id: "ucapan perpisahan saat pergi" },
              { en: "an expression of thanks", ko: "감사 표현", es: "una expresión de agradecimiento", id: "ungkapan terima kasih" },
              { en: "asking for directions", ko: "길을 묻는 것", es: "pedir direcciones", id: "menanyakan arah jalan" },
            ],
          },
          {
            word: { en: "Where is...?", ko: "어디에 있어요...?", es: "¿Dónde está...?", id: "Di mana...?" },
            meaning: { en: "asking about a location or place", ko: "장소나 위치를 묻는 표현", es: "preguntar sobre un lugar o ubicación", id: "menanyakan lokasi atau tempat" },
            wrong: [
              { en: "asking about someone's name", ko: "누군가의 이름을 묻는 것", es: "preguntar el nombre de alguien", id: "menanyakan nama seseorang" },
              { en: "asking about the time", ko: "시간을 묻는 것", es: "preguntar la hora", id: "menanyakan waktu" },
              { en: "asking about someone's job", ko: "직업을 묻는 것", es: "preguntar el trabajo de alguien", id: "menanyakan pekerjaan seseorang" },
            ],
          },
          {
            word: { en: "My name is...", ko: "제 이름은...입니다", es: "Mi nombre es...", id: "Nama saya..." },
            meaning: { en: "telling someone your name", ko: "자기 이름을 말하는 표현", es: "decirle tu nombre a alguien", id: "memberi tahu seseorang namamu" },
            wrong: [
              { en: "saying where you live", ko: "사는 곳을 말하는 것", es: "decir dónde vives", id: "mengatakan tempat tinggalmu" },
              { en: "asking how someone is feeling", ko: "누군가의 기분을 묻는 것", es: "preguntar cómo se siente alguien", id: "menanyakan perasaan seseorang" },
              { en: "saying thank you", ko: "감사하다고 말하는 것", es: "dar las gracias", id: "mengucapkan terima kasih" },
            ],
          },
          {
            word: { en: "Thank you", ko: "감사합니다", es: "Gracias", id: "Terima kasih" },
            meaning: { en: "thanking someone for help", ko: "도움을 준 사람에게 감사하는 표현", es: "dar las gracias por la ayuda", id: "berterima kasih kepada seseorang atas bantuannya" },
            wrong: [
              { en: "asking where something is", ko: "어디 있는지 묻는 것", es: "preguntar dónde está algo", id: "menanyakan letak sesuatu" },
              { en: "telling someone your name", ko: "자기 이름을 말하는 것", es: "decir tu nombre", id: "menyebutkan namamu" },
              { en: "a farewell when leaving", ko: "떠날 때 하는 작별 인사", es: "una despedida al irse", id: "ucapan perpisahan saat pergi" },
            ],
          },
          {
            word: { en: "Goodbye", ko: "안녕히 계세요", es: "Adiós", id: "Selamat tinggal" },
            meaning: { en: "a farewell when leaving", ko: "떠날 때 하는 작별 인사", es: "una despedida al irse", id: "ucapan perpisahan saat pergi" },
            wrong: [
              { en: "a greeting when arriving", ko: "도착할 때 하는 인사", es: "un saludo al llegar", id: "sapaan saat tiba" },
              { en: "asking for help", ko: "도움을 요청하는 것", es: "pedir ayuda", id: "meminta bantuan" },
              { en: "an expression of thanks", ko: "감사 표현", es: "una expresión de agradecimiento", id: "ungkapan terima kasih" },
            ],
          },
        ],
        hints: {
          h1: { ko: "프롤로그와 입구에서 이미 본 말들이야 — 인사, 도움 요청, 위치, 이름, 감사, 작별", en: "These are words from the prologue and the museum gate — greeting, help, location, name, thanks, farewell", es: "Son palabras del prólogo y la entrada del museo — saludo, ayuda, lugar, nombre, gracias, despedida", id: "Ini kata-kata dari prolog dan gerbang museum — sapaan, bantuan, lokasi, nama, terima kasih, perpisahan" },
          h2: { ko: "Tom에게 말하려면 먼저 자신을 밝히고, 왜 왔는지 말해야 해", en: "To talk to Tom, first show who you are and why you came", es: "Para hablar con Tom, primero muestra quién eres y por qué viniste", id: "Untuk bicara dengan Tom, tunjukkan dulu siapa kamu dan mengapa kamu datang" },
          h3: { ko: "Hello=인사 / Help me=도움 요청 / Where is=장소 질문 / My name is=이름 / Thank you=감사 / Goodbye=작별", en: "Hello=greeting / Help me=requesting help / Where is=location question / My name is=name / Thank you=thanks / Goodbye=farewell", es: "Hola=saludo / Ayúdame=pedir ayuda / Dónde está=lugar / Mi nombre es=nombre / Gracias=gracias / Adiós=despedida", id: "Hello=sapaan / Help me=meminta bantuan / Where is=pertanyaan lokasi / My name is=nama / Thank you=terima kasih / Goodbye=perpisahan", byLearning: { english: { ko: "Hello=인사 / Help me=도움 요청 / Where is...?=장소 질문 / My name is...=이름 / Thank you=감사 / Goodbye=작별", en: "Hello=greeting / Help me=requesting help / Where is...?=location question / My name is...=name / Thank you=thanks / Goodbye=farewell", es: "Hello=saludo / Help me=pedir ayuda / Where is...?=lugar / My name is...=nombre / Thank you=gracias / Goodbye=despedida", id: "Hello=sapaan / Help me=meminta bantuan / Where is...?=pertanyaan lokasi / My name is...=nama / Thank you=terima kasih / Goodbye=perpisahan" }, korean: { ko: "안녕하세요=인사 / 도와주세요=도움 요청 / 어디에 있어요...?=장소 질문 / 제 이름은...입니다=이름 / 감사합니다=감사 / 안녕히 계세요=작별", en: "안녕하세요=greeting / 도와주세요=requesting help / 어디에 있어요...?=location question / 제 이름은...입니다=name / 감사합니다=thanks / 안녕히 계세요=farewell", es: "안녕하세요=saludo / 도와주세요=pedir ayuda / 어디에 있어요...?=lugar / 제 이름은...입니다=nombre / 감사합니다=gracias / 안녕히 계세요=despedida", id: "안녕하세요=sapaan / 도와주세요=meminta bantuan / 어디에 있어요...?=pertanyaan lokasi / 제 이름은...입니다=nama / 감사합니다=terima kasih / 안녕히 계세요=perpisahan" }, spanish: { ko: "Hola=인사 / Ayúdame=도움 요청 / ¿Dónde está...?=장소 질문 / Mi nombre es...=이름 / Gracias=감사 / Adiós=작별", en: "Hola=greeting / Ayúdame=requesting help / ¿Dónde está...?=location question / Mi nombre es...=name / Gracias=thanks / Adiós=farewell", es: "Hola=saludo / Ayúdame=pedir ayuda / ¿Dónde está...?=lugar / Mi nombre es...=nombre / Gracias=gracias / Adiós=despedida", id: "Hola=sapaan / Ayúdame=meminta bantuan / ¿Dónde está...?=pertanyaan lokasi / Mi nombre es...=nama / Gracias=terima kasih / Adiós=perpisahan" }, indonesian: { ko: "Halo=인사 / Tolong saya=도움 요청 / Di mana...?=장소 질문 / Nama saya...=이름 / Terima kasih=감사 / Selamat tinggal=작별", en: "Halo=greeting / Tolong saya=requesting help / Di mana...?=location question / Nama saya...=name / Terima kasih=thanks / Selamat tinggal=farewell", es: "Halo=saludo / Tolong saya=pedir ayuda / Di mana...?=lugar / Nama saya...=nombre / Terima kasih=gracias / Selamat tinggal=despedida", id: "Halo=sapaan / Tolong saya=meminta bantuan / Di mana...?=pertanyaan lokasi / Nama saya...=nama / Terima kasih=terima kasih / Selamat tinggal=perpisahan" } } },
        },
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Good. Now you know the key words. Time to use them with Tom. He's not going to let us in unless we answer his questions. Pick the right responses, show him we belong here.)",
        textKo: "(좋아. 이제 핵심 단어들을 알았지. 톰에게 써먹을 차례야. 질문에 대답하지 않으면 안 들여보내줄 거야. 올바른 대답을 골라. 우리가 여기 있을 이유가 있다는 걸 보여줘.)",
        textEs: "(Bien. Ahora conoces las palabras clave. Es hora de usarlas con Tom. No nos dejará pasar a menos que respondamos sus preguntas. Elige las respuestas correctas, demuestra que pertenecemos aquí.)",
        textId: "(Bagus. Sekarang kamu tahu kata-kata kuncinya. Saatnya memakainya dengan Tom. Dia tidak akan membiarkan kita masuk kecuali kita menjawab pertanyaannya. Pilih jawaban yang tepat, tunjukkan bahwa tempat kita di sini.)",
      },
      {
        kind: "puzzle",
        puzzleNum: 2,
        pType: "dialogue-choice",
        tprsStage: 2,
        targetExpressions: ["Hello", "My name is ___", "Help me", "Where is ___?", "Thank you", "Goodbye"],
        previouslyLearned: ["Hello", "Help me", "Where is ___?", "My name is ___", "Thank you", "Goodbye"],
        speakAfter: true,
        storyReason: "Tom will only open the museum if you can answer like a real beginner detective.",
        storyConsequence: "Tom lets you through and points you toward Eleanor.",
        onFail: { addToWeakExpressions: ["Hello", "My name is ___", "Help me", "Thank you", "Goodbye"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            prompt: { en: "Tom asks: 'Who are you?' How do you greet him?", ko: "톰이 묻는다: '넌 누구야?' 어떻게 인사할까?", es: "Tom pregunta: '¿Quién eres?' ¿Cómo lo saludas?", id: "Tom bertanya: 'Siapa kamu?' Bagaimana kamu menyapanya?" },
            context: { en: "You need to make a good first impression on the guard.", ko: "경비원에게 좋은 첫인상을 남겨야 한다.", es: "Necesitas causar una buena primera impresión al guardia.", id: "Kamu harus memberi kesan pertama yang baik pada penjaga itu." },
            answer: { en: "Hello! My name is...", ko: "안녕하세요! 제 이름은...입니다.", es: "¡Hola! Mi nombre es...", id: "Halo! Nama saya..." },
            wrong: [
              { en: "Goodbye! I don't understand!", ko: "안녕히 계세요! 이해 못 해요!", es: "¡Adiós! ¡No entiendo!", id: "Selamat tinggal! Saya tidak mengerti!" },
              { en: "Sorry! Where is the exit?", ko: "죄송합니다! 출구가 어디예요?", es: "¡Perdón! ¿Dónde está la salida?", id: "Maaf! Di mana pintu keluar?" },
            ],
          },
          {
            prompt: { en: "Tom asks: 'Why are you here?'", ko: "톰이 묻는다: '왜 여기 온 거야?'", es: "Tom pregunta: '¿Por qué estás aquí?'", id: "Tom bertanya: 'Mengapa kamu di sini?'" },
            context: { en: "You need to connect your words to the case.", ko: "네 말이 사건과 연결되어 있다는 걸 보여줘야 한다.", es: "Necesitas conectar tus palabras con el caso.", id: "Kamu harus menghubungkan kata-katamu dengan kasus ini." },
            answer: { en: "I am here to help. Where is Dr. Ellis?", ko: "도우러 왔습니다. 엘리스 박사는 어디에 있나요?", es: "Estoy aquí para ayudar. ¿Dónde está la Dra. Ellis?", id: "Saya di sini untuk membantu. Di mana Dr. Ellis?" },
            wrong: [
              { en: "I'm fine, thank you. How are you?", ko: "잘 지내요, 감사합니다. 어떻게 지내세요?", es: "Estoy bien, gracias. ¿Cómo estás?", id: "Saya baik, terima kasih. Apa kabar?" },
              { en: "Goodbye! See you tomorrow!", ko: "안녕히 계세요! 내일 봐요!", es: "¡Adiós! ¡Nos vemos mañana!", id: "Selamat tinggal! Sampai jumpa besok!" },
            ],
          },
          {
            prompt: { en: "Tom sighs: 'Fine. If I let you in, what do you say?'", ko: "톰이 한숨 쉰다: '좋아. 들여보내주면 뭐라고 해야 하지?'", es: "Tom suspira: 'Bien. Si te dejo entrar, ¿qué dices?'", id: "Tom mendesah: 'Baiklah. Kalau aku biarkan kau masuk, apa yang kau ucapkan?'" },
            context: { en: "Use the polite word that proves you understand the favor.", ko: "도움을 받았다는 걸 아는 예의 바른 표현을 써야 한다.", es: "Usa la palabra cortés que demuestra que entiendes el favor.", id: "Gunakan ungkapan sopan yang menunjukkan kamu memahami bantuan itu." },
            answer: { en: "Thank you. Goodbye later, Tom.", ko: "감사합니다. 작별 인사는 나중에 할게요, 톰.", es: "Gracias. Adiós más tarde, Tom.", id: "Terima kasih. Selamat tinggal nanti, Tom." },
            wrong: [
              { en: "I am a tourist. Where is the gift shop?", ko: "저는 관광객이에요. 기념품 가게가 어디예요?", es: "Soy turista. ¿Dónde está la tienda de regalos?", id: "Saya turis. Di mana toko suvenir?" },
              { en: "I don't understand. Please help.", ko: "이해 못 해요. 도와주세요.", es: "No entiendo. Por favor ayuda.", id: "Saya tidak mengerti. Tolong saya." },
            ],
          },
        ],
        hints: {
          h1: { ko: "Tom에게는 세 가지가 필요해 — 인사, 이름, 도우러 온 이유", en: "Tom needs three things — a greeting, your name, and why you came to help", es: "Tom necesita tres cosas — saludo, nombre y por qué viniste a ayudar", id: "Tom butuh tiga hal — sapaan, namamu, dan alasan kamu datang membantu" },
          h2: { ko: "Hello로 시작하고, My name is로 밝히고, Help/Where is로 사건에 연결해", en: "Start with Hello, use My name is, then connect it to Help and Where is", es: "Empieza con Hola, usa Mi nombre es, y conéctalo con ayuda y dónde está", id: "Mulai dengan Hello, gunakan My name is, lalu hubungkan dengan Help dan Where is" },
          h3: { ko: "Q1: Hello + My name is / Q2: Help + Where is / Q3: Thank you + Goodbye", en: "Q1: Hello + My name is / Q2: Help + Where is / Q3: Thank you + Goodbye", es: "P1: Hola + Mi nombre es / P2: ayuda + dónde está / P3: Gracias + Adiós", id: "S1: Hello + My name is / S2: Help + Where is / S3: Thank you + Goodbye" },
        },
      },
      {
        kind: "scene",
        charId: "tom",
        text: "Huh. Alright then. Didn't expect that, to be honest. Most people who show up at 4 AM can't even string a sentence together. You lot? Not bad. Not bad at all. Go on in, then. Break a leg, mate!",
        textKo: "흠. 그래. 솔직히 예상 못 했어. 새벽 4시에 나타나는 사람들 대부분은 문장도 제대로 못 만들거든. 너희? 나쁘지 않아. 전혀. 들어가, 그럼. Break a leg, mate!",
        textKoMix: "흠. 솔직히 예상 못 했어. 새벽 4시에 나타나는 사람들 대부분은 문장도 못 만들거든. 너희? Not bad. 전혀. 들어가, 그럼. Goodbye는 아직 아니야. Break a leg, mate!",
        textEs: "Hmm. Vale entonces. No me lo esperaba, la verdad. La mayoría de los que aparecen a las 4 AM ni pueden armar una frase. ¿Ustedes? Nada mal. Nada mal. Pasen, entonces. Break a leg, mate!",
        textEsMix: "Hmm. Vale entonces. No me lo esperaba, la verdad. La mayoría que aparecen a las 4 AM ni pueden armar una frase. ¿Ustedes? Not bad. Nada mal. Pasen, entonces. Goodbye todavía no. Break a leg, mate!",
        textId: "Hmm. Baiklah kalau begitu. Jujur, aku tak menyangka. Kebanyakan orang yang muncul jam 4 pagi bahkan tak bisa merangkai satu kalimat. Kalian? Lumayan. Lumayan sekali. Masuklah kalau begitu. Break a leg, mate!",
        textIdMix: "Hmm. Jujur, aku tak menyangka. Kebanyakan orang yang muncul jam 4 pagi bahkan tak bisa merangkai kalimat. Kalian? Not bad. Sama sekali tidak. Masuklah. Goodbye belum dulu. Break a leg, mate!",
        idiomRef: "idiom_tom_1",
      },
      {
        kind: "clue",
        symbol: "🎭",
        titleEn: "Investigation Notes: Good Luck Around the World",
        titleKo: "수사 노트: 세계의 행운 표현",
        titleEs: "Notas de Investigación: Buena Suerte en el Mundo",
        titleId: "Catatan Investigasi: Ucapan Semoga Beruntung di Seluruh Dunia",
        descEn: "Tom said 'Break a leg!', a British theatre superstition. Saying 'good luck' directly is considered bad luck, so actors say the opposite instead. Every culture has its own way to wish someone well without saying it directly. Language is full of these hidden meanings.",
        descKo: "톰이 'Break a leg!'이라고 했어, 영국 극장의 미신이야. '행운을 빌어'라고 직접 말하면 불운하다고 여겨서, 배우들은 반대로 말해. 모든 문화에는 직접 말하지 않고 행운을 비는 고유한 표현이 있어. 언어에는 이런 숨겨진 의미가 가득해.",
        descEs: "Tom dijo 'Break a leg!', una superstición del teatro británico. Decir 'buena suerte' directamente se considera mala suerte, así que los actores dicen lo contrario. Cada cultura tiene su propia forma de desear suerte sin decirlo directamente. El lenguaje está lleno de estos significados ocultos.",
        descId: "Tom berkata 'Break a leg!', sebuah takhayul teater Inggris. Mengucapkan 'semoga beruntung' secara langsung dianggap membawa sial, jadi para aktor justru mengatakan kebalikannya. Setiap budaya punya caranya sendiri untuk mendoakan seseorang tanpa mengatakannya secara langsung. Bahasa penuh dengan makna tersembunyi seperti ini.",
      },
      // ── Scene 3: The Empty Case ───────────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Inside the museum. Emergency lights cast long shadows across the marble floor. In the Ancient Languages wing, a glass case stands open without a single crack. The London Stone is gone. Not smashed. Not stolen by force. Gone as if the word that held it here had been erased.)",
        textKo: "(박물관 내부. 비상등이 대리석 바닥 위로 긴 그림자를 드리운다. 고대 언어관 한가운데, 유리 진열장이 금 하나 없이 열려 있다. London Stone이 사라졌다. 부서진 것도 아니고, 억지로 훔친 것도 아니다. 그것을 이곳에 붙잡아 두던 단어가 지워진 것처럼 사라졌다.)",
        textEs: "(Dentro del museo. Las luces de emergencia proyectan sombras largas sobre el mármol. En el ala de Lenguas Antiguas, una vitrina está abierta sin una sola grieta. La London Stone desapareció. No rota. No robada por la fuerza. Desaparecida como si hubieran borrado la palabra que la mantenía allí.)",
        textId: "(Di dalam museum. Lampu darurat melemparkan bayangan panjang di lantai marmer. Di sayap Bahasa Kuno, sebuah lemari kaca terbuka tanpa satu retakan pun. London Stone hilang. Tidak pecah. Tidak dicuri dengan paksa. Lenyap seakan kata yang menahannya di sini telah dihapus.)",
      },
      {
        kind: "scene",
        charId: "eleanor",
        expression: "urgent",
        text: "You came. Good. I am Eleanor Vale, assistant curator to Dr. Ellis. Or... I was. She is missing. The cafe footage is the last confirmed image we have. No body, no ransom, no clean explanation. Only one word: FIND.",
        textKo: "와주셨군요. 다행이에요. 저는 엘리너 베일, 엘리스 박사의 후배 큐레이터예요. 아니... 그랬다고 해야겠죠. 박사님은 실종됐어요. 카페 영상이 우리가 가진 마지막 확인 장면입니다. 시신도, 협박도, 명확한 설명도 없어요. 단 한 단어만 남았죠. FIND.",
        textKoMix: "와주셨군요. 저는 Eleanor Vale, 엘리스 박사의 후배 큐레이터예요. 박사님은 missing이에요. 카페 영상이 마지막이에요. 설명은 없고, 단 한 단어만 남았죠. FIND.",
        textEs: "Viniste. Bien. Soy Eleanor Vale, curadora asistente de la Dra. Ellis. O... lo era. Ella desapareció. El video del café es la última imagen confirmada. Sin cuerpo, sin rescate, sin explicación limpia. Solo una palabra: FIND.",
        textEsMix: "Viniste. Soy Eleanor Vale, curadora asistente de la Dra. Ellis. Ella está missing. El video del café es lo último. No hay explicación. Solo una palabra: FIND.",
        textId: "Kamu datang. Bagus. Saya Eleanor Vale, kurator asisten Dr. Ellis. Atau... dulu begitu. Dia hilang. Rekaman kafe itu citra terakhir yang terkonfirmasi. Tidak ada jasad, tidak ada tebusan, tidak ada penjelasan yang jelas. Hanya satu kata: FIND.",
        textIdMix: "Kamu datang. Saya Eleanor Vale, kurator asisten Dr. Ellis. Dia missing. Rekaman kafe itu yang terakhir. Tidak ada penjelasan, hanya satu kata: FIND.",
      },
      {
        kind: "scene",
        charId: "eleanor",
        expression: "urgent",
        text: "The man in the black coat did not break the case. He spoke to it. That is what terrifies me. Locks can be picked. Glass can be cut. But this? This was language obeying someone it should never have obeyed.",
        textKo: "검은 코트의 남자는 진열장을 부수지 않았어요. 진열장에게 말했어요. 그게 무서운 점이에요. 자물쇠는 딸 수 있고, 유리는 자를 수 있죠. 하지만 이건... 언어가 절대 따라서는 안 될 사람의 명령을 따른 겁니다.",
        textKoMix: "검은 코트의 남자는 진열장을 부수지 않았어요. 진열장에게 말했어요. 그래서 무서워요. 이건 language가 따라서는 안 될 사람의 명령을 따른 거예요.",
        textEs: "El hombre del abrigo negro no rompió la vitrina. Le habló. Eso es lo que me asusta. Las cerraduras se abren. El vidrio se corta. Pero esto... fue el lenguaje obedeciendo a alguien a quien jamás debió obedecer.",
        textEsMix: "El hombre del abrigo negro no rompió la vitrina. Le habló. Eso me asusta. El language obedeció a alguien que jamás debía obedecer.",
        textId: "Pria bermantel hitam itu tidak memecahkan lemari kaca. Dia berbicara kepadanya. Itulah yang membuat saya ngeri. Kunci bisa dibobol. Kaca bisa dipotong. Tapi ini? Ini adalah bahasa yang menuruti seseorang yang seharusnya tak pernah ia turuti.",
        textIdMix: "Pria bermantel hitam itu tidak memecahkan lemari kaca. Dia berbicara kepadanya. Itu yang membuat saya ngeri. Ini adalah language yang menuruti seseorang yang seharusnya tak pernah ia turuti.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Partner, this connects to Ellis's last word. FIND. She did not ask us to find her body. She asked us to find what the stone resisted. There has to be a clue left in this room.",
        textKo: "파트너, 이건 엘리스 박사의 마지막 단어와 이어져. FIND. 박사님은 시신을 찾아달라고 한 게 아니야. 돌이 끝까지 저항하며 남긴 것을 찾아달라고 한 거야. 이 방 어딘가에 단서가 남아 있어.",
        textKoMix: "파트너, Ellis의 마지막 단어와 이어져. FIND. 박사님은 시신을 찾으라는 게 아니야. 돌이 저항하며 남긴 clue를 찾으라는 거야.",
        textEs: "Compañero, esto conecta con la última palabra de Ellis. FIND. No pidió que encontráramos su cuerpo. Pidió que encontráramos lo que la piedra resistió. Debe quedar una pista en esta sala.",
        textEsMix: "Compañero, esto conecta con la última palabra de Ellis. FIND. No buscaba un cuerpo; buscaba una clue que la piedra dejó al resistir.",
        textId: "Partner, ini berkaitan dengan kata terakhir Ellis. FIND. Dia tidak meminta kita menemukan jasadnya. Dia meminta kita menemukan apa yang ditolak oleh batu itu. Pasti ada petunjuk yang tertinggal di ruangan ini.",
        textIdMix: "Partner, ini berkaitan dengan kata terakhir Ellis. FIND. Dia bukan meminta kita menemukan jasad; dia meminta kita menemukan clue yang ditinggalkan batu itu saat melawan.",
      },
      // ── Scene 4: The First Clue Hunt ─────────────────────────────────────
      {
        kind: "scene",
        charId: "eleanor",
        expression: "urgent",
        text: "Three things were left behind. A card, a smear of gold dust, and an old note Ellis hid under the case. One of them still contains a sentence. If we choose the wrong clue first, the seal may close around it.",
        textKo: "남겨진 건 세 가지예요. 카드 한 장, 금빛 먼지 자국, 그리고 엘리스 박사가 진열장 아래 숨겨둔 오래된 메모. 그중 하나에는 아직 문장이 남아 있어요. 잘못된 단서부터 건드리면 봉인이 닫혀버릴 수도 있습니다.",
        textKoMix: "남겨진 건 세 가지예요. card, gold dust, 그리고 Ellis의 오래된 note. 그중 하나에는 아직 sentence가 남아 있어요.",
        textEs: "Quedaron tres cosas. Una carta, una mancha de polvo dorado y una nota antigua que Ellis escondió bajo la vitrina. Una de ellas todavía contiene una frase. Si elegimos mal primero, el sello podría cerrarse sobre ella.",
        textEsMix: "Quedaron tres cosas. Una card, gold dust y una note antigua de Ellis. Una todavía tiene una sentence.",
        textId: "Ada tiga hal yang tertinggal. Sebuah kartu, noda debu emas, dan catatan tua yang Ellis sembunyikan di bawah lemari. Salah satunya masih memuat sebuah kalimat. Jika kita memilih petunjuk yang salah lebih dulu, segel itu bisa menutup di sekelilingnya.",
        textIdMix: "Ada tiga hal yang tertinggal. Sebuah card, gold dust, dan note tua milik Ellis. Salah satunya masih memuat sebuah sentence.",
      },
      {
        kind: "puzzle",
        puzzleNum: 3,
        pType: "investigation",
        tprsStage: 3,
        targetExpressions: ["FIND", "Where is ___?", "Help me"],
        previouslyLearned: ["Hello", "Help me", "Where is ___?", "My name is ___", "Thank you", "Goodbye"],
        speakAfter: false,
        storyReason: "Find the clue that still carries Dr. Ellis's intent.",
        storyConsequence: "The hidden note reveals the sealed door and prepares the Boss Spell.",
        onFail: { addToWeakExpressions: ["Where is ___?", "Help me"], reviewInDailyCourse: true, reviewDays: 2 },
        questions: [
          {
            prompt: { en: "Which clue answers Dr. Ellis's final word: FIND?", ko: "엘리스 박사의 마지막 단어 FIND에 답하는 단서는 무엇일까?", es: "¿Qué pista responde a la última palabra de Ellis: FIND?", id: "Petunjuk mana yang menjawab kata terakhir Dr. Ellis: FIND?" },
            clues: [
              { en: "The Madrid card: a taunt pointing to the next city.", ko: "마드리드 카드: 다음 도시를 가리키는 도발.", es: "La carta de Madrid: una provocación que señala la siguiente ciudad.", id: "Kartu Madrid: ejekan yang menunjuk ke kota berikutnya." },
              { en: "The gold dust: a shard of the London Stone resisting the theft.", ko: "금빛 먼지: 도난에 저항한 London Stone의 파편.", es: "El polvo dorado: un fragmento de la London Stone resistiendo el robo.", id: "Debu emas: pecahan London Stone yang melawan pencurian." },
              { en: "Ellis's hidden note: 'Hello. Help me. Where is the door?'", ko: "엘리스의 숨겨진 메모: 'Hello. Help me. Where is the door?'", es: "La nota oculta de Ellis: 'Hello. Help me. Where is the door?'", id: "Catatan tersembunyi Ellis: 'Hello. Help me. Where is the door?'" },
            ],
            answerIdx: 2,
          },
        ],
        hints: {
          h1: { ko: "FIND는 장소 단서가 아니라 문장 단서를 찾으라는 말이었어", en: "FIND was not asking for a place first, but for a sentence clue", es: "FIND no pedía primero un lugar, sino una pista de frase", id: "FIND bukan meminta tempat lebih dulu, melainkan petunjuk berupa kalimat" },
          h2: { ko: "Boss Spell에 필요한 말이 남아 있는 단서를 골라", en: "Choose the clue that still has the words needed for the Boss Spell", es: "Elige la pista que aún tiene las palabras para el Boss Spell", id: "Pilih petunjuk yang masih memuat kata-kata untuk Boss Spell" },
          h3: { ko: "문장이 적힌 메모가 정답이야", en: "The note with the sentence is the answer", es: "La nota con la frase es la respuesta", id: "Catatan berisi kalimat itulah jawabannya" },
        },
      },
      // ── Scene 5: The Sealed Door ──────────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(The hidden note is older than the theft. Ellis wrote it in the margin of a museum map, as if she had prepared for this exact night. When Rudy reads the sentence aloud, a service door behind the empty case answers with a thin line of gold.)",
        textKo: "(숨겨진 메모는 도난 사건보다 오래되어 보인다. 엘리스 박사가 박물관 지도 가장자리에 적어둔 것이다. 마치 오늘 밤을 준비해둔 것처럼. 루디가 그 문장을 읽자, 빈 진열장 뒤의 직원용 문이 가느다란 금빛으로 응답한다.)",
        textEs: "(La nota oculta parece más antigua que el robo. Ellis la escribió en el margen de un mapa del museo, como si hubiera preparado esta noche exacta. Cuando Rudy lee la frase, una puerta de servicio detrás de la vitrina vacía responde con una fina línea dorada.)",
        textId: "(Catatan tersembunyi itu lebih tua daripada pencuriannya. Ellis menulisnya di tepi peta museum, seakan ia telah bersiap untuk malam ini. Saat Rudy membaca kalimat itu lantang, sebuah pintu servis di belakang lemari kosong menjawab dengan garis tipis berwarna emas.)",
      },
      {
        kind: "scene",
        charId: "eleanor",
        expression: "analytical",
        text: "That door has no keyhole. Ellis called it a verbal lock. It opens only when a speaker gives it a sentence with need, direction, and a name. A little dramatic, yes. She was always like that.",
        textKo: "저 문에는 열쇠구멍이 없어요. 엘리스 박사는 저걸 verbal lock이라고 불렀죠. 필요, 방향, 이름이 들어간 문장을 말해야만 열립니다. 조금 극적이죠. 네, 박사님은 늘 저랬어요.",
        textKoMix: "저 문에는 열쇠구멍이 없어요. Ellis는 저걸 verbal lock이라고 불렀죠. need, direction, name이 들어간 sentence가 필요해요.",
        textEs: "Esa puerta no tiene cerradura. Ellis la llamaba un verbal lock. Solo se abre cuando alguien le da una frase con necesidad, dirección y nombre. Un poco dramático, sí. Ella siempre era así.",
        textEsMix: "Esa puerta no tiene llave. Ellis la llamaba verbal lock. Necesita una sentence con need, direction y name.",
        textId: "Pintu itu tidak punya lubang kunci. Ellis menyebutnya verbal lock. Ia hanya terbuka saat seorang penutur memberinya sebuah kalimat dengan kebutuhan, arah, dan sebuah nama. Sedikit dramatis, ya. Beliau memang selalu begitu.",
        textIdMix: "Pintu itu tidak punya lubang kunci. Ellis menyebutnya verbal lock. Ia butuh sebuah sentence dengan need, direction, dan name.",
      },
      {
        kind: "clue",
        symbol: "🚪",
        titleEn: "Investigation Notes: The Verbal Lock",
        titleKo: "수사 노트: 말의 자물쇠",
        titleEs: "Notas de Investigación: La Cerradura Verbal",
        titleId: "Catatan Investigasi: Kunci Verbal",
        descEn: "Ellis prepared a lock that accepts a beginner sentence. It does not need rare vocabulary. It needs honest intent: greet the world, ask for help, ask where Ellis is. In Enigma, simple words are not weak words. They are first spells.",
        descKo: "엘리스는 초보자 문장을 받아들이는 자물쇠를 준비해두었다. 어려운 어휘는 필요 없다. 필요한 건 진심이다. 세계에 인사하고, 도움을 청하고, 엘리스가 어디 있는지 묻는 것. Enigma에서 쉬운 단어는 약한 단어가 아니다. 첫 주문이다.",
        descEs: "Ellis preparó una cerradura que acepta una frase de principiante. No necesita vocabulario raro. Necesita intención honesta: saludar al mundo, pedir ayuda, preguntar dónde está Ellis. En Enigma, las palabras simples no son débiles. Son los primeros hechizos.",
        descId: "Ellis menyiapkan kunci yang menerima kalimat tingkat pemula. Ia tak butuh kosakata langka. Ia butuh niat yang tulus: menyapa dunia, meminta bantuan, menanyakan di mana Ellis. Di Enigma, kata-kata sederhana bukanlah kata-kata yang lemah. Itu adalah mantra pertama.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "This is it. Not a rare spell. A beginner spell. We already have the pieces: Hello. Help me. Where is Dr. Ellis? Put them in order, partner. Let the door hear you.",
        textKo: "이거야. 희귀한 주문이 아니야. 초보자의 주문. 우리는 이미 조각을 가지고 있어. Hello. Help me. Where is Dr. Ellis? 순서대로 맞춰줘, 파트너. 문이 네 말을 듣게 해.",
        textKoMix: "이거야. 어려운 주문이 아니야. beginner spell. 우리는 이미 조각을 가지고 있어. Hello. Help me. Where is Dr. Ellis? 순서대로 맞춰줘.",
        textEs: "Esto es. No un hechizo raro. Un hechizo de principiante. Ya tenemos las piezas: Hello. Help me. Where is Dr. Ellis? Ponlas en orden, compañero. Haz que la puerta te escuche.",
        textEsMix: "Esto es. No es difícil. Un beginner spell. Ya tenemos las piezas: Hello. Help me. Where is Dr. Ellis? Ponlas en orden.",
        textId: "Ini dia. Bukan mantra langka. Mantra pemula. Kita sudah punya potongannya: Hello. Help me. Where is Dr. Ellis? Susun secara berurutan, partner. Biarkan pintu itu mendengarmu.",
        textIdMix: "Ini dia. Bukan mantra sulit. beginner spell. Kita sudah punya potongannya: Hello. Help me. Where is Dr. Ellis? Susun secara berurutan.",
      },
      {
        kind: "puzzle",
        puzzleNum: 4,
        pType: "boss-spell",
        tprsStage: 4,
        // Mastery contract: only chunks the player actually produces in this puzzle.
        // Other Ch1 expressions (My name is, Thank you, Goodbye) are mastered by their
        // own dedicated puzzles — listing them here would falsely mark them mastered
        // on Boss Spell completion via handlePuzzleSolved.
        targetExpressions: ["Hello", "Help me", "Where is ___?", "Dr. Ellis"],
        previouslyLearned: ["Hello", "Help me", "Where is ___?", "My name is ___", "Thank you", "Goodbye"],
        speakAfter: true,
        storyReason: "Complete Ellis's Boss Spell to open the sealed door.",
        storyConsequence: "The door opens and reveals a resisting shard of the London Stone.",
        onFail: { addToWeakExpressions: ["Hello", "Help me", "Where is ___?", "Dr. Ellis"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            spellChunks: ["Hello", "Help me", "Where is", "Dr. Ellis"],
            separators: [".", ".", " ", "?"],
            wordPool: ["Hello", "Goodbye", "Help me", "Thank you", "Where is", "My name is", "Dr. Ellis"],
            instruction: {
              en: "Place each word-piece on the door.",
              ko: "말 조각을 문 위에 순서대로 올려놓으세요.",
              es: "Coloca cada pieza de palabra en la puerta.",
              id: "Letakkan setiap potongan kata pada pintu.",
            },
            hints: {
              h1: {
                ko: "순서가 중요해요. 문장은 인사로 시작해야 해요.",
                en: "The order matters. The sentence should begin with a greeting.",
                es: "El orden importa. La frase debe empezar con un saludo.",
                id: "Urutannya penting. Kalimat harus dimulai dengan sapaan.",
              },
              h2: {
                ko: "첫 조각은 Hello예요. 그다음은 도움이 필요하다는 말이에요.",
                en: "The first piece is Hello. The next piece asks for help.",
                es: "La primera pieza es Hello. La siguiente pide ayuda.",
                id: "Potongan pertama adalah Hello. Potongan berikutnya meminta bantuan.",
              },
              h3: {
                ko: "정답 문장: Hello. Help me. Where is Dr. Ellis?",
                en: "Answer sentence: Hello. Help me. Where is Dr. Ellis?",
                es: "Frase correcta: Hello. Help me. Where is Dr. Ellis?",
                id: "Kalimat jawaban: Hello. Help me. Where is Dr. Ellis?",
              },
            },
            storyReason: {
              en: "Open the sealed door to reach the stone shard.",
              ko: "봉인된 문을 열어 돌의 파편에 닿으세요.",
              es: "Abre la puerta sellada para alcanzar el fragmento de piedra.",
              id: "Buka pintu tersegel untuk mencapai pecahan batu itu.",
            },
            storyConsequence: {
              en: "The stone fragment falls into Rudy's light.",
              ko: "돌의 파편이 루디의 빛 속으로 떨어집니다.",
              es: "El fragmento de piedra cae dentro de la luz de Rudy.",
              id: "Pecahan batu itu jatuh ke dalam cahaya Rudy.",
            },
            doorImage: ch1BossDoorImg,
          },
        ],
        hints: {
          h1: { ko: "Boss Spell은 네 조각이야 — 인사, 도움 요청, 위치 질문, 이름", en: "The Boss Spell has four pieces — greeting, help, location question, name", es: "El Boss Spell tiene cuatro piezas — saludo, ayuda, pregunta de lugar, nombre", id: "Boss Spell punya empat potongan — sapaan, bantuan, pertanyaan lokasi, nama" },
          h2: { ko: "Hello → Help me → Where is → Dr. Ellis", en: "Hello → Help me → Where is → Dr. Ellis", es: "Hola → Ayúdame → Dónde está → Dra. Ellis", id: "Hello → Help me → Where is → Dr. Ellis" },
          h3: { ko: "정답 문장: Hello. Help me. Where is Dr. Ellis?", en: "Answer sentence: Hello. Help me. Where is Dr. Ellis?", es: "Frase correcta: Hello. Help me. Where is Dr. Ellis?", id: "Kalimat jawaban: Hello. Help me. Where is Dr. Ellis?" },
        },
      },
      {
        kind: "scene",
        charId: "lingo",
        expression: "celebratory",
        text: "You did it. The sentence holds. The door heard you. Look, partner... that glow is not the stone itself. It is a shard. A little piece the London Stone refused to give him.",
        textKo: "해냈어. 문장이 버텼어. 문이 네 말을 들었어. 봐, 파트너... 저 빛은 돌 자체가 아니야. 파편이야. London Stone이 그에게 넘겨주길 거부한 작은 조각.",
        textKoMix: "해냈어. sentence가 버텼어. 문이 네 말을 들었어. 저건 stone 자체가 아니야. shard야. London Stone이 넘겨주길 거부한 조각.",
        textEs: "Lo lograste. La frase sostuvo. La puerta te oyó. Mira, compañero... esa luz no es la piedra misma. Es un fragmento. Una pequeña parte que la London Stone se negó a entregarle.",
        textEsMix: "Lo lograste. La sentence sostuvo. La puerta te oyó. Esa luz no es la stone completa. Es un shard que la London Stone no quiso entregarle.",
        textId: "Kamu berhasil. Kalimatnya bertahan. Pintu itu mendengarmu. Lihat, partner... cahaya itu bukan batunya sendiri. Itu sebuah pecahan. Sepotong kecil yang ditolak London Stone untuk diberikan padanya.",
        textIdMix: "Kamu berhasil. sentence-nya bertahan. Pintu itu mendengarmu. Cahaya itu bukan stone utuh. Itu sebuah shard yang ditolak London Stone untuk diberikan padanya.",
      },
      {
        kind: "scene",
        charId: "eleanor",
        expression: "analytical",
        text: "Thank you. Truly. If Ellis left this for anyone, she left it for a beginner brave enough to say the first sentence. But the figure who signs as B left one thing on purpose. Tom found it under the case.",
        textKo: "감사합니다. 진심으로요. 엘리스 박사가 이걸 누군가에게 남겼다면, 첫 문장을 말할 만큼 용감한 초보자에게 남긴 거예요. 하지만 B라고 서명한 인물도 일부러 남긴 게 하나 있어요. 톰이 진열장 아래에서 찾았습니다.",
        textKoMix: "Thank you. 진심이에요. Ellis가 이걸 남겼다면 첫 sentence를 말할 만큼 용감한 beginner에게 남긴 거예요. 하지만 B라고 서명한 사람이 일부러 남긴 게 있어요.",
        textEs: "Gracias. De verdad. Si Ellis dejó esto para alguien, lo dejó para un principiante lo bastante valiente como para decir la primera frase. Pero la figura que firma como B dejó algo a propósito. Tom lo encontró bajo la vitrina.",
        textEsMix: "Thank you. De verdad. Ellis dejó esto para un beginner valiente. Pero la figura que firma como B también dejó algo a propósito.",
        textId: "Terima kasih. Sungguh. Jika Ellis meninggalkan ini untuk seseorang, ia meninggalkannya untuk seorang pemula yang cukup berani mengucapkan kalimat pertama. Tapi sosok yang menandatangani sebagai B sengaja meninggalkan satu hal. Tom menemukannya di bawah lemari.",
        textIdMix: "Thank you. Sungguh. Ellis meninggalkan ini untuk seorang beginner yang berani. Tapi sosok yang menandatangani sebagai B sengaja meninggalkan sesuatu.",
      },
      {
        kind: "clue",
        symbol: "🃏",
        titleEn: "Investigation Notes: The Madrid Card",
        titleKo: "수사 노트: 마드리드 카드",
        titleEs: "Notas de Investigación: La Carta de Madrid",
        titleId: "Catatan Investigasi: Kartu Madrid",
        descEn: "A black playing card marked MADRID. Unlike the shard, this was left deliberately. The B signature is not hiding the next city. It is inviting pursuit. Why would someone stealing language want a beginner detective to follow?",
        descKo: "MADRID라고 적힌 검은 카드. 파편과 달리, 이건 의도적으로 남겨졌다. B라는 서명은 다음 도시를 숨기지 않는다. 추격을 초대하고 있다. 언어를 훔치는 누군가가 왜 초보 탐정이 따라오길 바랄까?",
        descEs: "Una carta negra marcada MADRID. A diferencia del fragmento, esto fue dejado deliberadamente. La firma B no oculta la siguiente ciudad. Invita a la persecución. ¿Por qué alguien que roba lenguaje querría que un detective principiante lo siguiera?",
        descId: "Sebuah kartu remi hitam bertanda MADRID. Berbeda dengan pecahan tadi, ini ditinggalkan dengan sengaja. Tanda tangan B tidak menyembunyikan kota berikutnya. Ia justru mengundang pengejaran. Mengapa seseorang yang mencuri bahasa ingin seorang detektif pemula mengikutinya?",
      },
      // ── Scene 6: London Close ─────────────────────────────────────────────
      {
        kind: "scene",
        charId: "eleanor",
        text: "Goodbye, Detective. And I mean that as a promise, not an ending. Find Ellis. Find out why she built a lock for beginners. Madrid is where B wants you to look next.",
        textKo: "Goodbye, Detective. 끝이라는 뜻이 아니라 약속이라는 뜻으로요. 엘리스 박사를 찾아주세요. 왜 박사님이 초보자를 위한 자물쇠를 만들었는지도요. 마드리드는 B가 다음으로 보라고 남긴 곳입니다.",
        textKoMix: "Goodbye, Detective. 끝이라는 뜻이 아니라 약속이에요. Ellis를 찾아주세요. 왜 beginner를 위한 lock을 만들었는지도요. Madrid가 다음 단서예요.",
        textEs: "Goodbye, Detective. Y lo digo como una promesa, no como un final. Encuentra a Ellis. Descubre por qué construyó una cerradura para principiantes. Madrid es donde B quiere que mires después.",
        textEsMix: "Goodbye, Detective. Lo digo como promesa, no como final. Encuentra a Ellis. Descubre por qué hizo un lock para beginners. Madrid es la siguiente pista.",
        textId: "Goodbye, Detective. Dan saya memaksudkannya sebagai janji, bukan akhir. Temukan Ellis. Cari tahu mengapa ia membuat kunci untuk para pemula. Madrid adalah tempat yang B ingin kamu selidiki berikutnya.",
        textIdMix: "Goodbye, Detective. Saya memaksudkannya sebagai janji, bukan akhir. Temukan Ellis. Cari tahu mengapa ia membuat lock untuk para beginner. Madrid adalah petunjuk berikutnya.",
      },
      {
        kind: "scene",
        charId: "lingo",
        expression: "celebratory",
        text: "Seven stones are still a rumor, not proof. Good. Rumors can be investigated. For now we have one shard, one missing doctor, and one city name. Partner... Thank you. Our first spell worked.",
        textKo: "일곱 개의 돌은 아직 증거가 아니라 소문이야. 좋아. 소문은 조사할 수 있어. 지금 우리에게 있는 건 파편 하나, 실종된 박사님 한 명, 그리고 도시 이름 하나. 파트너... Thank you. 우리의 첫 주문이 통했어.",
        textKoMix: "일곱 개의 돌은 아직 proof가 아니라 rumor야. 지금 있는 건 shard 하나, missing doctor 한 명, city name 하나. Partner... Thank you. 첫 spell이 통했어.",
        textEs: "Las siete piedras aún son un rumor, no una prueba. Bien. Los rumores se pueden investigar. Por ahora tenemos un fragmento, una doctora desaparecida y el nombre de una ciudad. Compañero... Thank you. Nuestro primer hechizo funcionó.",
        textEsMix: "Las siete piedras aún son rumor, no proof. Tenemos un shard, una doctora missing y un city name. Compañero... Thank you. Nuestro primer spell funcionó.",
        textId: "Tujuh batu itu masih rumor, bukan bukti. Bagus. Rumor bisa diselidiki. Untuk sekarang kita punya satu pecahan, satu dokter yang hilang, dan satu nama kota. Partner... Thank you. Mantra pertama kita berhasil.",
        textIdMix: "Tujuh batu itu masih rumor, bukan proof. Sekarang kita punya satu shard, satu missing doctor, satu city name. Partner... Thank you. spell pertama kita berhasil.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Next Chapter: The Madrid Disappearance. People are losing their words.)",
        textKo: "(다음 챕터: 마드리드의 실종. 사람들이 말을 잃고 있다.)",
        textEs: "(Siguiente Capítulo: La Desaparición de Madrid. La gente está perdiendo sus palabras.)",
        textId: "(Bab Berikutnya: Hilangnya Madrid. Orang-orang mulai kehilangan kata-kata mereka.)",
      },
    ],
  },

  /* ════════════════ CHAPTER 2: MADRID ════════════════ */
  madrid: {
    id: "madrid",
    title: "The Madrid Disappearance",
    titleKo: "마드리드의 실종",
    titleEs: "La Desaparición de Madrid",
    titleId: "Hilangnya Madrid",
    gradient: ["#1A0500", "#3A0A0A", "#6B1A10"],
    accentColor: C.gold,
    nextChapterId: "seoul",
    /* ── Language Ratio: 50% targetLang / 50% nativeLang ──────────────────────
     * CEFR A1-A2 — late beginner. User has completed Day 1-18.
     * NPC dialogue should be roughly HALF nativeLang and HALF targetLang.
     * The learned expressions from Day 1-18 appear in English; the rest is native.
     * textKoMix/textEsMix are authored on every NPC dialogue line at a ~50/50
     * split: native sentence frame with learned English expressions and salient
     * content words surfaced inline. Narration (isNarration) stays 100% native.
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
        "Ch2 dialogue is ~50% native language / ~50% English (targetLang). " +
        "textKoMix/textEsMix surface knownExpressions from Day 1-18 plus key " +
        "content words inside a native frame; narration stays 100% native.",
    },
    characters: [
      {
        id: "lingo",
        emoji: "🦊",
        name: "Detective Rudy",
        nameKo: "루디 탐정",
        nameId: "Detektif Rudy",
        side: "left",
        avatarBg: "#2c1810",
        isLingo: true,
        portrait: rudyStoryImg,
        portraitVariants: rudyExpressionSprites,
      },
      {
        id: "isabel",
        emoji: "💃",
        name: "Isabel",
        nameKo: "이사벨",
        nameId: "Isabel",
        side: "right",
        avatarBg: "#3A1A0A",
        portrait: ch2IsabelPortraitImg,
        portraitVariants: isabelExpressionSprites,
      },
      {
        id: "miguel",
        emoji: "🥬",
        name: "Don Miguel",
        nameKo: "돈 미겔",
        nameId: "Don Miguel",
        side: "right",
        avatarBg: "#2A1A0A",
      },
      {
        id: "carlos",
        emoji: "🎭",
        name: "Carlos",
        nameKo: "카를로스",
        nameId: "Carlos",
        side: "left",
        avatarBg: "#1A1A2A",
      },
      {
        id: "mr_black",
        emoji: "🕴️",
        name: "Mr. Black",
        nameKo: "미스터 블랙",
        nameId: "Mr. Black",
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
        text: "(Madrid Barajas Airport. Spanish sunshine instead of London fog. Rudy still chewing on his London failure. Mr. Black was right there and he missed him. He steps through the arrival gate, and a woman in a red jacket blocks his path. Eyes like fire.)",
        textKo: "(마드리드 바라하스 공항. 런던의 안개 대신 스페인의 햇살. 루디는 아직 런던에서의 실패를 씹고 있다. 미스터 블랙이 코앞에 있었는데 놓쳤다. 도착 게이트를 나서자마자, 빨간 재킷을 입은 여자가 가로막는다. 눈이 불꽃 같다.)",
        textEs: "(Aeropuerto de Madrid Barajas. Sol español en lugar de niebla londinense. Rudy aún mastica su fracaso en Londres. Mr. Black estaba ahí mismo y se le escapó. En cuanto cruza la puerta de llegadas, una mujer con chaqueta roja le bloquea el paso. Ojos como fuego.)",
        textId: "(Bandara Madrid Barajas. Sinar matahari Spanyol menggantikan kabut London. Rudy masih memikirkan kegagalannya di London. Mr. Black ada tepat di sana dan ia melewatkannya. Begitu melewati gerbang kedatangan, seorang wanita berjaket merah menghadang langkahnya. Matanya berkobar bagai api.)",
      },
      {
        kind: "scene",
        charId: "isabel",
        text: "Are you the fox detective? You're late. Also, you're shorter than I expected.",
        textKo: "당신이 여우 탐정이야? 늦었어. 그리고 생각보다 키가 작네.",
        textKoMix: "당신이 the fox detective야? You're late. 그리고 생각보다 키가 작네.",
        textEs: "¿Eres el detective zorro? Llegas tarde. Además, eres más bajito de lo que esperaba.",
        textEsMix: "¿Eres the fox detective? You're late. Además, eres más bajito de lo que esperaba.",
        textId: "Kamu detektif rubah itu? Kamu terlambat. Lagipula, kamu lebih pendek dari yang kubayangkan.",
        textIdMix: "Kamu the fox detective itu? You're late. Lagipula, kamu lebih pendek dari yang kubayangkan.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "I'm average height, thank you very much. You must be Isabel. Carlos's colleague, the one who called Eleanor.",
        textKo: "평균 신장이거든, 정말 감사해요. 당신이 이사벨이겠지. 카를로스의 동료, 엘리너한테 연락한 사람.",
        textKoMix: "평균 신장이거든, thank you very much. You must be Isabel. 카를로스의 colleague, Eleanor한테 연락한 사람.",
        textEs: "Soy de estatura promedio, muchas gracias. Debes ser Isabel. La colega de Carlos, la que llamó a Eleanor.",
        textEsMix: "Soy de estatura promedio, thank you very much. You must be Isabel. La colleague de Carlos, la que llamó a Eleanor.",
        textId: "Tinggiku rata-rata, terima kasih banyak. Kamu pasti Isabel. Rekan kerja Carlos, yang menelepon Eleanor.",
        textIdMix: "Tinggiku rata-rata, thank you very much. You must be Isabel. colleague Carlos, yang menelepon Eleanor.",
      },
      {
        kind: "scene",
        charId: "isabel",
        expression: "shocked",
        text: "Eleanor said you were funny. She was wrong. Listen, detective. Carlos disappeared three nights ago from the Prado. He was restoring a medieval fresco. I got his call at ten o'clock. He was screaming.",
        textKo: "엘리너가 재밌는 사람이라고 했는데. 틀렸네. 들어, 탐정. 카를로스가 3일 전에 프라도에서 사라졌어. 중세 프레스코화를 복원하고 있었어. 밤 10시에 전화가 왔어. 소리를 지르고 있었어.",
        textKoMix: "Eleanor가 재밌는 사람이라고 했는데. She was wrong. Listen, detective. 카를로스가 3일 전에 Prado에서 disappeared. 중세 fresco를 복원하고 있었어. 밤 10시에 전화가 왔어. He was screaming.",
        textEs: "Eleanor dijo que eras gracioso. Se equivocó. Escucha, detective. Carlos desapareció hace tres noches del Prado. Estaba restaurando un fresco medieval. Me llamó a las diez. Estaba gritando.",
        textEsMix: "Eleanor dijo que eras gracioso. She was wrong. Listen, detective. Carlos disappeared hace tres noches del Prado. Estaba restaurando un fresco medieval. Me llamó a las diez. He was screaming.",
        textId: "Eleanor bilang kamu lucu. Dia salah. Dengar, detektif. Carlos menghilang tiga malam lalu dari Prado. Dia sedang memugar fresko abad pertengahan. Aku menerima teleponnya pukul sepuluh. Dia berteriak-teriak.",
        textIdMix: "Eleanor bilang kamu lucu. She was wrong. Listen, detective. Carlos tiga malam lalu disappeared dari Prado. Dia sedang memugar fresco abad pertengahan. Aku menerima teleponnya pukul sepuluh. He was screaming.",
        idiomRef: "idiom_isabel_1",
      },
      {
        kind: "scene",
        charId: "isabel",
        expression: "shocked",
        text: "Simple words. Not in Spanish. Not in English. Things like 'Hello! Help! Where is the door? Please! Sorry!', basic phrases, like a textbook. In a language I didn't recognize. Over and over. Then the line went dead.",
        textKo: "간단한 단어들. 스페인어가 아니었어. 영어도 아니고. '안녕하세요! 도와주세요! 문이 어디예요? 제발! 죄송합니다!', 교과서 같은 기초 표현을. 내가 모르는 언어로. 계속 반복하다가, 전화가 끊겼어.",
        textKoMix: "간단한 단어들. 스페인어가 아니었어. 영어도 아니고. 'Hello! Help! Where is the door? Please! Sorry!', 교과서 같은 basic phrases. 내가 모르는 언어로. 계속 반복하다가, 전화가 끊겼어.",
        textEs: "Palabras simples. No en español. Tampoco en inglés. Cosas como '¡Hola! ¡Ayuda! ¿Dónde está la puerta? ¡Por favor! ¡Perdón!', frases básicas, como de libro. En un idioma que no reconocí. Una y otra vez. Luego se cortó la línea.",
        textEsMix: "Palabras simples. No en español. Tampoco en inglés. Cosas como 'Hello! Help! Where is the door? Please! Sorry!', basic phrases, como de libro. En un idioma que no reconocí. Una y otra vez. Luego se cortó la línea.",
        textId: "Kata-kata sederhana. Bukan bahasa Spanyol. Bukan bahasa Inggris. Hal-hal seperti 'Halo! Tolong! Di mana pintunya? Kumohon! Maaf!', frasa dasar, seperti buku pelajaran. Dalam bahasa yang tak kukenali. Berulang-ulang. Lalu sambungan teleponnya terputus.",
        textIdMix: "Kata-kata sederhana. Bukan bahasa Spanyol. Bukan bahasa Inggris. Hal seperti 'Hello! Help! Where is the door? Please! Sorry!', basic phrases, seperti buku pelajaran. Dalam bahasa yang tak kukenali. Berulang-ulang. Lalu sambungannya terputus.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Basic phrases. Hello, help, where is, please, sorry. The same vocabulary from Day One. Something stripped away his Spanish, his English, and left him with nothing but the basics. Someone did this to him on purpose.)",
        textKo: "(기초 표현들. 안녕, 도와주세요, 어디에, 제발, 미안해요. 1일차 어휘들. 무언가가 그의 스페인어, 영어를 벗겨갔어, 그리고 기초 단어만 남겨놓은 거야. 누군가가 의도적으로 이걸 한 거야.)",
        textEs: "(Frases básicas. Hola, ayuda, dónde está, por favor, perdón. El vocabulario del Día Uno. Algo le quitó su español, su inglés, y le dejó solo lo básico. Alguien le hizo esto a propósito.)",
        textId: "(Frasa dasar. Halo, tolong, di mana, kumohon, maaf. Kosakata yang sama dari Hari Pertama. Sesuatu telah mengikis bahasa Spanyol dan Inggrisnya, dan menyisakan hanya yang paling dasar. Seseorang sengaja melakukan ini padanya.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Isabel wrote down every word Carlos screamed. But the words don't make sense yet. Before we can talk to anyone, we need to learn the key vocabulary first. Match each word to its meaning.)",
        textKo: "(이사벨이 카를로스가 외친 모든 단어를 적어뒀다. 하지만 아직 뜻이 통하지 않아. 누구와 대화하기 전에 먼저 핵심 단어들을 배워야 해. 각 단어를 뜻과 매칭해봐.)",
        textEs: "(Isabel anotó cada palabra que Carlos gritó. Pero aún no tienen sentido. Antes de hablar con alguien, necesitamos aprender el vocabulario clave primero. Relaciona cada palabra con su significado.)",
        textId: "(Isabel mencatat setiap kata yang Carlos teriakkan. Tapi kata-kata itu belum masuk akal. Sebelum kita bisa bicara dengan siapa pun, kita harus mempelajari kosakata kuncinya dulu. Cocokkan setiap kata dengan artinya.)",
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
            word: { en: "How much is this?", ko: "이거 얼마예요?", es: "¿Cuánto cuesta esto?", id: "Berapa harganya?" },
            meaning: { en: "asking the price of something", ko: "무언가의 가격을 묻는 것", es: "preguntar el precio de algo", id: "menanyakan harga sesuatu" },
            wrong: [
              { en: "asking where someone is from", ko: "출신을 묻는 것", es: "preguntar de dónde es alguien", id: "menanyakan asal seseorang" },
              { en: "ordering food at a restaurant", ko: "식당에서 음식을 주문하는 것", es: "pedir comida en un restaurante", id: "memesan makanan di restoran" },
              { en: "saying hello to a friend", ko: "친구에게 인사하는 것", es: "saludar a un amigo", id: "menyapa seorang teman" },
            ],
          },
          {
            word: { en: "delicious", ko: "맛있는", es: "delicioso", id: "lezat" },
            meaning: { en: "very good tasting food", ko: "음식 맛이 매우 좋은", es: "comida de muy buen sabor", id: "makanan yang rasanya sangat enak" },
            wrong: [
              { en: "a type of language", ko: "언어의 종류", es: "un tipo de idioma", id: "salah satu jenis bahasa" },
              { en: "very expensive", ko: "매우 비싼", es: "muy caro", id: "sangat mahal" },
              { en: "a notebook page", ko: "노트 한 페이지", es: "una página de cuaderno", id: "selembar halaman buku catatan" },
            ],
          },
          {
            word: { en: "goodbye", ko: "안녕히 계세요", es: "adiós", id: "selamat tinggal" },
            meaning: { en: "what you say when you are leaving", ko: "떠날 때 하는 말", es: "lo que dices cuando te vas", id: "ucapan saat kamu pergi" },
            wrong: [
              { en: "what you say when you arrive", ko: "도착할 때 하는 말", es: "lo que dices cuando llegas", id: "ucapan saat kamu tiba" },
              { en: "a question about location", ko: "위치에 관한 질문", es: "una pregunta sobre ubicación", id: "pertanyaan tentang lokasi" },
              { en: "an apology", ko: "사과", es: "una disculpa", id: "permintaan maaf" },
            ],
          },
        ],
        hints: {
          h1: {
            ko: "카를로스가 외친 단어들이야 — 시장에서 쓰는 기본 표현들을 생각해봐",
            en: "These are the words Carlos screamed — think about basic market expressions",
            es: "Estas son las palabras que Carlos gritó — piensa en expresiones básicas del mercado",
            id: "Ini kata-kata yang Carlos teriakkan — pikirkan ungkapan dasar di pasar",
            byLearning: {
              spanish: { ko: "스페인어 시장 표현: ¿Cuánto cuesta?, delicioso, adiós", en: "Spanish market phrases: ¿Cuánto cuesta?, delicioso, adiós", es: "Frases del mercado en español: ¿Cuánto cuesta?, delicioso, adiós", id: "Frasa pasar dalam bahasa Spanyol: ¿Cuánto cuesta?, delicioso, adiós" },
              korean:  { ko: "한국어 기본 표현: 얼마예요?, 맛있는, 안녕히 계세요", en: "Korean basic phrases: 얼마예요?, 맛있는, 안녕히 계세요", es: "Frases básicas en coreano: 얼마예요?, 맛있는, 안녕히 계세요", id: "Frasa dasar dalam bahasa Korea: 얼마예요?, 맛있는, 안녕히 계세요" },
              english: { ko: "영어 시장 표현: How much is this?, delicious, goodbye", en: "English market phrases: How much is this?, delicious, goodbye", es: "Frases del mercado en inglés: How much is this?, delicious, goodbye", id: "Frasa pasar dalam bahasa Inggris: How much is this?, delicious, goodbye" },
              indonesian: { ko: "인도네시아어 시장 표현: Berapa harganya?, lezat, selamat tinggal", en: "Indonesian market phrases: Berapa harganya?, lezat, selamat tinggal", es: "Frases del mercado en indonesio: Berapa harganya?, lezat, selamat tinggal", id: "Frasa pasar dalam bahasa Indonesia: Berapa harganya?, lezat, selamat tinggal" },
            },
          },
          h2: {
            ko: "가격을 묻고, 음식 맛을 표현하고, 작별 인사하는 표현들이야",
            en: "Expressions for asking prices, describing food taste, and saying farewell",
            es: "Expresiones para preguntar precios, describir sabor y despedirse",
            id: "Ungkapan untuk menanyakan harga, menggambarkan rasa makanan, dan mengucapkan perpisahan",
            byLearning: {
              spanish: { ko: "'¿Cuánto cuesta?'=가격 묻기, 'delicioso'=맛있는, 'adiós'=작별", en: "'¿Cuánto cuesta?'=asking price, 'delicioso'=tasty, 'adiós'=farewell", es: "'¿Cuánto cuesta?'=precio, 'delicioso'=sabroso, 'adiós'=despedida", id: "'¿Cuánto cuesta?'=menanyakan harga, 'delicioso'=lezat, 'adiós'=perpisahan" },
              korean:  { ko: "'얼마예요?'=가격 묻기, '맛있는'=delicious, '안녕히 계세요'=작별", en: "'얼마예요?'=asking price, '맛있는'=tasty, '안녕히 계세요'=farewell", es: "'얼마예요?'=precio, '맛있는'=sabroso, '안녕히 계세요'=despedida", id: "'얼마예요?'=menanyakan harga, '맛있는'=lezat, '안녕히 계세요'=perpisahan" },
              english: { ko: "'How much is this?'=가격 묻기, 'delicious'=맛있는, 'goodbye'=작별", en: "'How much is this?'=asking price, 'delicious'=tasty, 'goodbye'=farewell", es: "'How much is this?'=precio, 'delicious'=sabroso, 'goodbye'=despedida", id: "'How much is this?'=menanyakan harga, 'delicious'=lezat, 'goodbye'=perpisahan" },
              indonesian: { ko: "'Berapa harganya?'=가격 묻기, 'lezat'=맛있는, 'selamat tinggal'=작별", en: "'Berapa harganya?'=asking price, 'lezat'=tasty, 'selamat tinggal'=farewell", es: "'Berapa harganya?'=precio, 'lezat'=sabroso, 'selamat tinggal'=despedida", id: "'Berapa harganya?'=menanyakan harga, 'lezat'=lezat, 'selamat tinggal'=perpisahan" },
            },
          },
          h3: {
            ko: "How much is this?=가격 묻기 / delicious=맛있는 / goodbye=작별 인사",
            en: "How much is this?=asking price / delicious=tasty / goodbye=farewell",
            es: "How much is this?=preguntar precio / delicious=sabroso / goodbye=despedida",
            id: "How much is this?=menanyakan harga / delicious=lezat / goodbye=perpisahan",
            byLearning: {
              spanish: { ko: "¿Cuánto cuesta esto?=가격 / delicioso=맛 / adiós=작별", en: "¿Cuánto cuesta esto?=price / delicioso=taste / adiós=farewell", es: "¿Cuánto cuesta esto?=precio / delicioso=sabor / adiós=despedida", id: "¿Cuánto cuesta esto?=harga / delicioso=rasa / adiós=perpisahan" },
              korean:  { ko: "이거 얼마예요?=가격 / 맛있는=맛 / 안녕히 계세요=작별", en: "이거 얼마예요?=price / 맛있는=taste / 안녕히 계세요=farewell", es: "이거 얼마예요?=precio / 맛있는=sabor / 안녕히 계세요=despedida", id: "이거 얼마예요?=harga / 맛있는=rasa / 안녕히 계세요=perpisahan" },
              english: { ko: "How much is this?=가격 / delicious=맛 / goodbye=작별", en: "How much is this?=price / delicious=taste / goodbye=farewell", es: "How much is this?=precio / delicious=sabor / goodbye=despedida", id: "How much is this?=harga / delicious=rasa / goodbye=perpisahan" },
              indonesian: { ko: "Berapa harganya?=가격 / lezat=맛 / selamat tinggal=작별", en: "Berapa harganya?=price / lezat=taste / selamat tinggal=farewell", es: "Berapa harganya?=precio / lezat=sabor / selamat tinggal=despedida", id: "Berapa harganya?=harga / lezat=rasa / selamat tinggal=perpisahan" },
            },
          },
        },
      },
      {
        kind: "scene",
        charId: "carlos",
        text: "*shown in a memory flashback* Isabella... escúchame. El lenguaje es poder. They took my words. If you find this... follow the ∆LX. Find the truth. *memory fades*",
        textKo: "*기억 회상 속에서 보인다* 이사벨라... 들어줘. 언어는 힘이야. 그들이 내 말들을 빼앗아 갔어. 이걸 찾으면... ∆LX를 따라가. 진실을 찾아. *기억이 사라진다*",
        textKoMix: "*기억 회상 속에서 보인다* Isabella... 들어줘. 언어는 power야. They took my words. 이걸 찾으면... follow the ∆LX. Find the truth. *기억이 사라진다*",
        textEs: "*se muestra en un flashback de memoria* Isabella... escúchame. El lenguaje es poder. Tomaron mis palabras. Si encuentras esto... sigue el ∆LX. Encuentra la verdad. *la memoria se desvanece*",
        textEsMix: "*se muestra en un flashback de memoria* Isabella... escúchame. El lenguaje es power. They took my words. Si encuentras esto... follow the ∆LX. Find the truth. *la memoria se desvanece*",
        textId: "*ditampilkan dalam kilas balik ingatan* Isabella... dengarkan aku. Bahasa adalah kekuatan. Mereka merampas kata-kataku. Kalau kamu menemukan ini... ikuti ∆LX. Temukan kebenarannya. *ingatan memudar*",
        textIdMix: "*ditampilkan dalam kilas balik ingatan* Isabella... dengarkan aku. Bahasa adalah power. They took my words. Kalau kamu menemukan ini... follow the ∆LX. Find the truth. *ingatan memudar*",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "He wasn't speaking a foreign language, Isabel. He was speaking in the only language he had left. Something stripped away his Spanish, his English, everything, and left him with nothing but Day One vocabulary. Someone did this to him on purpose.",
        textKo: "이사벨, 그가 외국어를 말한 게 아니야. 그에게 남은 유일한 언어를 말한 거야. 무언가가 그의 스페인어, 영어, 전부를 벗겨갔어, 그리고 1일차 기초 단어만 남겨놓은 거야. 누군가가 의도적으로 이걸 한 거야.",
        textKoMix: "Isabel, 그가 a foreign language를 말한 게 아니야. 그에게 남은 the only language를 말한 거야. 무언가가 그의 Spanish, English, 전부를 벗겨갔어, 그리고 Day One vocabulary만 남겨놓은 거야. Someone did this on purpose.",
        textEs: "No estaba hablando un idioma extranjero, Isabel. Estaba hablando en el único idioma que le quedaba. Algo le quitó su español, su inglés, todo, y le dejó solo con vocabulario del Día Uno. Alguien le hizo esto a propósito.",
        textEsMix: "No estaba hablando a foreign language, Isabel. Estaba hablando en the only language que le quedaba. Algo le quitó su Spanish, su English, todo, y le dejó solo con Day One vocabulary. Someone did this on purpose.",
        textId: "Dia tidak sedang berbicara bahasa asing, Isabel. Dia berbicara dalam satu-satunya bahasa yang tersisa baginya. Sesuatu telah mengikis bahasa Spanyolnya, Inggrisnya, semuanya, dan menyisakan hanya kosakata Hari Pertama. Seseorang sengaja melakukan ini padanya.",
        textIdMix: "Isabel, dia tidak berbicara a foreign language. Dia berbicara dalam the only language yang tersisa baginya. Sesuatu telah mengikis Spanish, English-nya, semuanya, dan menyisakan hanya Day One vocabulary. Someone did this on purpose.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "A week ago I would have said that's impossible. But a week ago I didn't know about magic stones that protect language, or a man who says 'thank you' after stealing them. Take me to the Prado. Now.",
        textKo: "일주일 전이었으면 불가능하다고 했을 거야. 하지만 일주일 전에는 언어를 보호하는 마법석이나, 수호석을 훔치고 '감사합니다'라고 말하는 남자에 대해 몰랐으니까. 프라도로 데려다줘. 지금.",
        textKoMix: "일주일 전이었으면 that's impossible라고 했을 거야. 하지만 일주일 전에는 language를 보호하는 magic stones나, 그걸 훔치고 'thank you'라고 말하는 남자에 대해 몰랐으니까. Take me to the Prado. 지금.",
        textEs: "Hace una semana habría dicho que es imposible. Pero hace una semana no sabía sobre piedras mágicas que protegen el lenguaje, ni sobre un hombre que dice 'gracias' después de robarlas. Llévame al Prado. Ahora.",
        textEsMix: "Hace una semana habría dicho that's impossible. Pero hace una semana no sabía sobre magic stones que protegen el language, ni sobre un hombre que dice 'thank you' después de robarlas. Take me to the Prado. Ahora.",
        textId: "Seminggu lalu aku akan bilang itu mustahil. Tapi seminggu lalu aku belum tahu tentang batu ajaib yang melindungi bahasa, atau seorang pria yang mengucapkan 'terima kasih' setelah mencurinya. Antar aku ke Prado. Sekarang.",
        textIdMix: "Seminggu lalu aku akan bilang that's impossible. Tapi seminggu lalu aku belum tahu tentang magic stones yang melindungi language, atau pria yang mengucapkan 'thank you' setelah mencurinya. Take me to the Prado. Sekarang.",
      },
      // ── Scene 2: Don Miguel's Market ──────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(On the way to the Prado, Isabel detours through San Miguel Market. 'There's someone you need to meet first. Don Miguel. Forty years in this market. He sees everything, knows everyone.' An old man arranges tomatoes behind a small stall. His smile is warm, but worry lives in his eyes.)",
        textKo: "(프라도로 가는 길에 이사벨이 산 미겔 시장으로 우회한다. '먼저 만나야 할 사람이 있어. 돈 미겔. 이 시장에서 40년. 모든 것을 보고, 모든 사람을 알아.' 노인이 작은 가판대 뒤에서 토마토를 정리한다. 미소가 따뜻하지만, 눈에 걱정이 서려 있다.)",
        textEs: "(De camino al Prado, Isabel desvía por el Mercado de San Miguel. 'Hay alguien que necesitas conocer primero. Don Miguel. Cuarenta años en este mercado. Lo ve todo, conoce a todos.' Un anciano ordena tomates detrás de un pequeño puesto. Su sonrisa es cálida, pero la preocupación vive en sus ojos.)",
        textId: "(Dalam perjalanan ke Prado, Isabel berbelok melewati Pasar San Miguel. 'Ada orang yang harus kamu temui dulu. Don Miguel. Empat puluh tahun di pasar ini. Dia melihat segalanya, mengenal semua orang.' Seorang lelaki tua menata tomat di balik sebuah lapak kecil. Senyumnya hangat, tapi kekhawatiran tampak di matanya.)",
      },
      {
        kind: "scene",
        charId: "miguel",
        text: "Isabel! And this must be the famous detective. Welcome! Please, sit. Are you hungry? Of course you're hungry, you're in Madrid! Nobody leaves my stall hungry. That's my one rule.",
        textKo: "이사벨! 이분이 유명한 탐정이로구나. 환영해! 자, 앉아. 배고프지? 당연히 배고프겠지, 마드리드에 왔으니까! 아무도 내 가판대에서 배고프게 보내지 않아. 그게 내 유일한 규칙이야.",
        textKoMix: "Isabel! 이분이 the famous detective이로구나. Welcome! Please, 앉아. Are you hungry? 당연히 배고프겠지, you're in Madrid! 아무도 내 가판대에서 배고프게 보내지 않아. That's my one rule.",
        textEs: "¡Isabel! Y este debe ser el famoso detective. ¡Bienvenido! Por favor, siéntate. ¿Tienes hambre? ¡Claro que tienes hambre, estás en Madrid! Nadie se va de mi puesto con hambre. Esa es mi única regla.",
        textEsMix: "¡Isabel! Y este debe ser the famous detective. Welcome! Please, siéntate. Are you hungry? ¡Claro que sí, you're in Madrid! Nadie se va de mi puesto con hambre. That's my one rule.",
        textId: "Isabel! Dan ini pasti detektif terkenal itu. Selamat datang! Silakan, duduk. Kamu lapar? Tentu saja kamu lapar, kamu di Madrid! Tak ada yang pergi dari lapakku dalam keadaan lapar. Itu satu-satunya aturanku.",
        textIdMix: "Isabel! Ini pasti the famous detective itu. Welcome! Please, duduk. Are you hungry? Tentu saja lapar, you're in Madrid! Tak ada yang pergi dari lapakku dalam keadaan lapar. That's my one rule.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Good. You know the key words now. Time to use them with Don Miguel. He won't share information until you greet him and order properly. Use the vocabulary you just learned.)",
        textKo: "(좋아. 이제 핵심 단어들을 알았지. 돈 미겔에게 써먹을 차례야. 제대로 인사하고 주문하기 전에는 정보를 공유하지 않을 거야. 방금 배운 어휘를 사용해봐.)",
        textEs: "(Bien. Ahora conoces las palabras clave. Es hora de usarlas con Don Miguel. No compartirá información hasta que lo saludes y pidas correctamente. Usa el vocabulario que acabas de aprender.)",
        textId: "(Bagus. Sekarang kamu tahu kata-kata kuncinya. Saatnya memakainya dengan Don Miguel. Dia tidak akan berbagi informasi sampai kamu menyapanya dan memesan dengan benar. Gunakan kosakata yang baru saja kamu pelajari.)",
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
            prompt: { en: "Don Miguel is waiting. How do you greet him and order?", ko: "돈 미겔이 기다리고 있어. 어떻게 인사하고 주문할까?", es: "Don Miguel espera. ¿Cómo le saludas y pides?", id: "Don Miguel sedang menunggu. Bagaimana kamu menyapanya dan memesan?" },
            context: { en: "Don Miguel: 'What would you like? I have bread, ham, and the best coffee in Madrid.'", ko: "돈 미겔: '뭐 드릴까요? 빵, 하몽, 마드리드 최고의 커피가 있어요.'", es: "Don Miguel: '¿Qué le pongo? Tengo pan, jamón y el mejor café de Madrid.'", id: "Don Miguel: 'Mau pesan apa? Saya punya roti, ham, dan kopi terbaik di Madrid.'" },
            answer: { en: "Good morning! I would like coffee, please. How much is it?", ko: "좋은 아침이에요! 커피 주세요. 얼마예요?", es: "¡Buenos días! Me pone un café, por favor. ¿Cuánto es?", id: "Selamat pagi! Saya mau kopi, tolong. Berapa harganya?" },
            wrong: [
              { en: "Hello. I don't want food. Tell me about Carlos.", ko: "안녕하세요. 음식은 필요없어요. 카를로스에 대해 말해줘요.", es: "Hola. No quiero comida. Cuénteme sobre Carlos.", id: "Halo. Saya tidak mau makanan. Ceritakan soal Carlos." },
              { en: "Sorry, I'm not hungry. Can we talk now?", ko: "죄송해요, 배가 안 고파요. 지금 얘기할 수 있을까요?", es: "Lo siento, no tengo hambre. ¿Podemos hablar ahora?", id: "Maaf, saya tidak lapar. Bisakah kita bicara sekarang?" },
            ],
          },
          {
            prompt: { en: "Don Miguel looks pleased. He offers food too.", ko: "돈 미겔이 흡족해한다. 음식도 권한다.", es: "Don Miguel parece complacido. También ofrece comida.", id: "Don Miguel tampak senang. Dia juga menawarkan makanan." },
            context: { en: "Don Miguel: 'Good! And food? You need to eat something. Yes or no?'", ko: "돈 미겔: '좋아! 음식은 어때? 뭐 좀 먹어야지. 어때, 먹을래?'", es: "Don Miguel: '¡Bien! ¿Y comida? Necesitas comer algo. ¿Sí o no?'", id: "Don Miguel: 'Bagus! Dan makanan? Kamu perlu makan sesuatu. Mau atau tidak?'" },
            answer: { en: "Yes, please! The bread with ham. It looks delicious. Thank you!", ko: "네, 주세요! 하몽 빵. 맛있어 보여요. 감사합니다!", es: "¡Sí, por favor! El pan con jamón. Tiene muy buena pinta. ¡Gracias!", id: "Ya, tolong! Roti dengan ham. Kelihatannya lezat. Terima kasih!" },
            wrong: [
              { en: "No thank you. I'm in a hurry.", ko: "아니요 괜찮아요. 급해요.", es: "No gracias. Tengo prisa.", id: "Tidak, terima kasih. Saya sedang buru-buru." },
              { en: "How much is the food? Is it expensive?", ko: "음식이 얼마예요? 비싸요?", es: "¿Cuánto cuesta la comida? ¿Es cara?", id: "Berapa harga makanannya? Apakah mahal?" },
            ],
          },
        ],
        hints: {
          h1: {
            ko: "정보를 얻으려면 먼저 규칙을 따라야 해 — 제대로 인사하고 주문해봐",
            en: "To get information you must follow his rule — greet and order properly first",
            es: "Para obtener información debes seguir su regla — saluda y pide correctamente primero",
            id: "Untuk mendapat informasi kamu harus mengikuti aturannya — sapa dan pesan dengan benar dulu",
            byLearning: {
              spanish: { ko: "'Buenos días'로 인사하고 'por favor'로 주문해봐", en: "Greet with 'Buenos días' and order with 'por favor'", es: "Saluda con 'Buenos días' y pide con 'por favor'", id: "Sapa dengan 'Buenos días' dan pesan dengan 'por favor'" },
              korean:  { ko: "'좋은 아침이에요'로 인사하고 '주세요'로 주문해봐", en: "Greet with '좋은 아침이에요' and order with '주세요'", es: "Saluda con '좋은 아침이에요' y pide con '주세요'", id: "Sapa dengan '좋은 아침이에요' dan pesan dengan '주세요'" },
              english: { ko: "'Good morning'으로 인사하고 'please'로 주문해봐", en: "Greet with 'Good morning' and order with 'please'", es: "Saluda con 'Good morning' y pide con 'please'", id: "Sapa dengan 'Good morning' dan pesan dengan 'please'" },
              indonesian: { ko: "'Selamat pagi'로 인사하고 'tolong'으로 주문해봐", en: "Greet with 'Selamat pagi' and order with 'tolong'", es: "Saluda con 'Selamat pagi' y pide con 'tolong'", id: "Sapa dengan 'Selamat pagi' dan pesan dengan 'tolong'" },
            },
          },
          h2: {
            ko: "예의 바르게: 인사 + please + thank you가 핵심이야",
            en: "Be polite: greeting + please + thank you are key",
            es: "Sé educado: greeting + please + thank you son clave",
            id: "Bersikap sopan: sapaan + please + thank you adalah kuncinya",
            byLearning: {
              spanish: { ko: "Buenos días + por favor + gracias가 핵심이야", en: "Buenos días + por favor + gracias are key", es: "Buenos días + por favor + gracias son clave", id: "Buenos días + por favor + gracias adalah kuncinya" },
              korean:  { ko: "좋은 아침 + 주세요 + 감사합니다가 핵심이야", en: "좋은 아침 + 주세요 + 감사합니다 are key", es: "좋은 아침 + 주세요 + 감사합니다 son clave", id: "좋은 아침 + 주세요 + 감사합니다 adalah kuncinya" },
              english: { ko: "Good morning + please + thank you가 핵심이야", en: "Good morning + please + thank you are key", es: "Good morning + please + thank you son clave", id: "Good morning + please + thank you adalah kuncinya" },
              indonesian: { ko: "Selamat pagi + tolong + terima kasih가 핵심이야", en: "Selamat pagi + tolong + terima kasih are key", es: "Selamat pagi + tolong + terima kasih son clave", id: "Selamat pagi + tolong + terima kasih adalah kuncinya" },
            },
          },
          h3: {
            ko: "'Good morning! ... please. How much is it?' 형식으로 주문해봐",
            en: "Order in the format: 'Good morning! ... please. How much is it?'",
            es: "Pide así: 'Good morning! ... please. How much is it?'",
            id: "Pesan dengan format: 'Good morning! ... please. How much is it?'",
            byLearning: {
              spanish: { ko: "'¡Buenos días! ... por favor. ¿Cuánto es?' 형식으로 주문해", en: "Order: '¡Buenos días! ... por favor. ¿Cuánto es?'", es: "Pide: '¡Buenos días! ... por favor. ¿Cuánto es?'", id: "Pesan: '¡Buenos días! ... por favor. ¿Cuánto es?'" },
              korean:  { ko: "'좋은 아침이에요! 커피 주세요. 얼마예요?' 형식으로 주문해", en: "Order: '좋은 아침이에요! 커피 주세요. 얼마예요?'", es: "Pide: '좋은 아침이에요! 커피 주세요. 얼마예요?'", id: "Pesan: '좋은 아침이에요! 커피 주세요. 얼마예요?'" },
              english: { ko: "'Good morning! I would like coffee, please. How much is it?' 형식으로 주문해", en: "Order: 'Good morning! I would like coffee, please. How much is it?'", es: "Pide: 'Good morning! I would like coffee, please. How much is it?'", id: "Pesan: 'Good morning! I would like coffee, please. How much is it?'" },
              indonesian: { ko: "'Selamat pagi! Saya mau kopi, tolong. Berapa harganya?' 형식으로 주문해", en: "Order: 'Selamat pagi! Saya mau kopi, tolong. Berapa harganya?'", es: "Pide: 'Selamat pagi! Saya mau kopi, tolong. Berapa harganya?'", id: "Pesan: 'Selamat pagi! Saya mau kopi, tolong. Berapa harganya?'" },
            },
          },
        },
      },
      {
        kind: "scene",
        charId: "miguel",
        text: "First, you eat. Then, we talk. In Spain, a conversation without food is like a song without music. Tell me what you want, detective. In my market, you must ask properly.",
        textKo: "먼저 먹어. 그다음 얘기해. 스페인에서 음식 없는 대화는 음악 없는 노래야. 뭘 원하는지 말해봐, 탐정. 내 시장에서는 제대로 주문해야 해.",
        textKoMix: "First, you eat. Then, we talk. 스페인에서 food 없는 conversation은 music 없는 노래야. 뭘 원하는지 말해봐, detective. 내 market에서는 제대로 주문해야 해.",
        textEs: "Primero, comes. Luego, hablamos. En España, una conversación sin comida es como una canción sin música. Dime qué quieres, detective. En mi mercado, hay que pedir como es debido.",
        textEsMix: "First, you eat. Then, we talk. En España, una conversación sin food es como una canción sin music. Dime qué quieres, detective. En mi market, hay que pedir como es debido.",
        textId: "Pertama, kamu makan. Lalu, kita bicara. Di Spanyol, percakapan tanpa makanan itu seperti lagu tanpa musik. Katakan apa yang kamu mau, detektif. Di pasarku, kamu harus memesan dengan benar.",
        textIdMix: "First, you eat. Then, we talk. Di Spanyol, conversation tanpa food itu seperti lagu tanpa music. Katakan apa yang kamu mau, detective. Di market-ku, kamu harus memesan dengan benar.",
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
        title: { en: "Order from Don Miguel", ko: "Don Miguel에게 주문하기", es: "Pedir a Don Miguel", id: "Memesan dari Don Miguel" },
        context: { en: "Don Miguel won't share information until you order properly. Speak your order!", ko: "Don Miguel은 제대로 주문하기 전에는 정보를 공유하지 않아요. 주문을 말하세요!", es: "Don Miguel no compartirá información hasta que pidas correctamente. ¡Haz tu pedido!", id: "Don Miguel tidak akan berbagi informasi sampai kamu memesan dengan benar. Ucapkan pesananmu!" },
        questions: [
          { word: { en: "Bread, please.", ko: "빵 주세요.", es: "Pan, por favor.", id: "Roti, tolong." }, hint: { en: "Order bread politely", ko: "빵을 정중하게 주문하세요", es: "Pide pan con educación", id: "Pesan roti dengan sopan" }, acceptableAnswers: ["bread please"] },
          { word: { en: "How much?", ko: "얼마예요?", es: "¿Cuánto?", id: "Berapa harganya?" }, hint: { en: "Ask the price", ko: "가격을 물어보세요", es: "Pregunta el precio", id: "Tanyakan harganya" }, acceptableAnswers: ["how much is it", "how much is this"] },
          { word: { en: "Thank you!", ko: "감사합니다!", es: "¡Gracias!", id: "Terima kasih!" }, hint: { en: "Say thanks", ko: "감사 인사를 하세요", es: "Da las gracias", id: "Ucapkan terima kasih" }, acceptableAnswers: ["thank you", "thanks", "thank you very much"] },
        ],
      },
      {
        kind: "scene",
        charId: "miguel",
        text: "Ha! Not bad, detective. Your accent is terrible but your manners are good. Now... you want to know about Carlos. I'll tell you. But first, I need to tell you something that scares me.",
        textKo: "하! 나쁘지 않아, 탐정. 억양은 끔찍하지만 예절은 좋아. 자... 카를로스에 대해 알고 싶은 거지. 말해줄게. 하지만 먼저, 나를 무섭게 하는 것을 말해야 해.",
        textKoMix: "하! Not bad, detective. Your accent은 terrible하지만 예절은 좋아. 자... 카를로스에 대해 알고 싶은 거지. I'll tell you. 하지만 먼저, 나를 무섭게 하는 것을 말해야 해.",
        textEs: "¡Ja! Nada mal, detective. Tu acento es terrible pero tus modales son buenos. Ahora... quieres saber de Carlos. Te diré. Pero primero, necesito contarte algo que me asusta.",
        textEsMix: "¡Ja! Not bad, detective. Your accent es terrible pero tus modales son buenos. Ahora... quieres saber de Carlos. I'll tell you. Pero primero, necesito contarte algo que me asusta.",
        textId: "Ha! Lumayan, detektif. Aksenmu payah tapi sopan santunmu bagus. Nah... kamu ingin tahu tentang Carlos. Akan kuceritakan. Tapi pertama, aku harus menceritakan sesuatu yang membuatku takut.",
        textIdMix: "Ha! Not bad, detective. Your accent payah tapi sopan santunmu bagus. Nah... kamu ingin tahu tentang Carlos. I'll tell you. Tapi pertama, aku harus menceritakan sesuatu yang membuatku takut.",
      },
      {
        kind: "scene",
        charId: "miguel",
        text: "Yesterday, I forgot how to say 'friend' in Spanish. My own language. Forty years in this market and yesterday, the word just wasn't there. Like someone pulled it out of my head. My neighbor María forgot 'bread.' Eduardo forgot 'open.' As we say, 'No hay mal que por bien no venga.' But I'm struggling to find the silver in this one.",
        textKo: "어제, '친구'라는 단어를 스페인어로 잊어버렸어. 내 모국어를. 40년간 이 시장을 운영했는데 어제, 단어가 그냥 없었어. 누가 머릿속에서 뽑아간 것처럼. 이웃 마리아도 '빵'을 잊었어. 에두아르도는 '열다'를 잊어서 자기 가게를 못 열었어. 우리가 말하듯이, '비 온 뒤에 땅이 굳는다'지만, 이번에는 좋은 점을 찾기 힘들어.",
        textKoMix: "어제, 'friend'라는 word를 Spanish로 잊어버렸어. My own language를. 40년간 이 market에 있었는데 어제, 그 word가 그냥 없었어. 누가 머릿속에서 뽑아간 것처럼. 이웃 María도 'bread'를 잊었어. Eduardo는 'open'을 잊었어. 우리가 말하듯이, 'No hay mal que por bien no venga'지만, 이번에는 좋은 점을 찾기 힘들어.",
        textEs: "Ayer, olvidé cómo decir 'amigo' en español. Mi propio idioma. Cuarenta años en este mercado y ayer, la palabra simplemente no estaba. Como si alguien la arrancara de mi cabeza. Mi vecina María olvidó 'pan.' Eduardo olvidó 'abrir.' Como decimos, 'No hay mal que por bien no venga.' Pero me cuesta encontrar el bien en esto.",
        textEsMix: "Ayer, olvidé cómo decir 'friend' en español. My own language. Cuarenta años en este market y ayer, the word simplemente no estaba. Como si alguien la arrancara de mi cabeza. Mi vecina María olvidó 'bread.' Eduardo olvidó 'open.' Como decimos, 'No hay mal que por bien no venga.' Pero me cuesta encontrar el bien en esto.",
        textId: "Kemarin, aku lupa bagaimana mengucapkan 'teman' dalam bahasa Spanyol. Bahasaku sendiri. Empat puluh tahun di pasar ini dan kemarin, kata itu hilang begitu saja. Seakan ada yang mencabutnya dari kepalaku. Tetanggaku María lupa kata 'roti.' Eduardo lupa kata 'buka.' Seperti kata pepatah kami, 'No hay mal que por bien no venga.' Tapi aku kesulitan menemukan sisi baiknya kali ini.",
        textIdMix: "Kemarin, aku lupa cara mengucapkan 'friend' dalam Spanish. My own language. Empat puluh tahun di market ini dan kemarin, the word itu hilang begitu saja. Seakan ada yang mencabutnya dari kepalaku. Tetanggaku María lupa kata 'bread.' Eduardo lupa kata 'open.' Seperti kata pepatah kami, 'No hay mal que por bien no venga.' Tapi aku kesulitan menemukan sisi baiknya kali ini.",
        idiomRef: "idiom_miguel_1",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(He's forgetting words. Don Miguel, seventy years of daily Spanish, is forgetting simple words. And Carlos was shouting basic phrases before he disappeared. The device isn't just a threat. It's already working here. In Madrid. Right now.)",
        textKo: "(단어를 잊고 있어. 돈 미겔, 70년간 매일 스페인어를 해온 사람이, 간단한 단어를 잊고 있어. 그리고 카를로스는 사라지기 전에 기초 표현을 소리치고 있었고. 그 장치는 위협만이 아니야. 이미 여기서 작동하고 있어. 마드리드에서. 지금.)",
        textEs: "(Olvida palabras. Don Miguel, setenta años de español diario, olvida palabras simples. Y Carlos gritaba frases básicas antes de desaparecer. El dispositivo no es solo una amenaza. Ya está funcionando aquí. En Madrid. Ahora mismo.)",
        textId: "(Dia mulai melupakan kata-kata. Don Miguel, tujuh puluh tahun berbahasa Spanyol setiap hari, mulai melupakan kata-kata sederhana. Dan Carlos meneriakkan frasa dasar sebelum ia menghilang. Alat itu bukan sekadar ancaman. Ia sudah bekerja di sini. Di Madrid. Saat ini juga.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Don Miguel. The man who took Carlos. Did he come through this market? Tall, black coat, speaks perfect everything?",
        textKo: "돈 미겔. 카를로스를 데려간 남자. 이 시장을 지나간 적 있어요? 키 크고, 검은 코트, 모든 언어를 완벽하게 하는?",
        textKoMix: "Don Miguel. 카를로스를 데려간 남자. Did he come through this market? 키 크고, black coat, 모든 language를 완벽하게 하는?",
        textEs: "Don Miguel. El hombre que se llevó a Carlos. ¿Pasó por este mercado? ¿Alto, abrigo negro, habla todo perfectamente?",
        textEsMix: "Don Miguel. El hombre que se llevó a Carlos. Did he come through este market? Alto, black coat, ¿habla todo perfectamente?",
        textId: "Don Miguel. Pria yang membawa Carlos. Apakah dia pernah lewat pasar ini? Tinggi, mantel hitam, bicara semua bahasa dengan sempurna?",
        textIdMix: "Don Miguel. Pria yang membawa Carlos. Did he come through this market? Tinggi, black coat, bicara semua language dengan sempurna?",
      },
      {
        kind: "scene",
        charId: "miguel",
        text: "He comes every morning. Orders coffee. Pays exactly. Says 'Thank you, good morning' in perfect Spanish. He was here today, detective. Two hours ago. He sat right where you're sitting now.",
        textKo: "매일 아침 와. 커피를 주문해. 정확하게 지불하고. 완벽한 스페인어로 '감사합니다, 좋은 아침이에요'라고 말해. 오늘도 왔어, 탐정. 두 시간 전에. 지금 네가 앉은 바로 그 자리에 앉았어.",
        textKoMix: "He comes every morning. coffee를 주문해. 정확하게 지불하고. 완벽한 Spanish로 'Thank you, good morning'이라고 말해. He was here today, detective. 두 시간 전에. 지금 네가 앉은 바로 그 자리에 앉았어.",
        textEs: "Viene cada mañana. Pide café. Paga exacto. Dice 'Gracias, buenos días' en español perfecto. Estuvo aquí hoy, detective. Hace dos horas. Se sentó exactamente donde tú estás sentado ahora.",
        textEsMix: "He comes every morning. Pide café. Paga exacto. Dice 'Thank you, good morning' en español perfecto. He was here today, detective. Hace dos horas. Se sentó exactamente donde tú estás sentado ahora.",
        textId: "Dia datang setiap pagi. Memesan kopi. Membayar pas. Mengucapkan 'Terima kasih, selamat pagi' dalam bahasa Spanyol yang sempurna. Dia ada di sini hari ini, detektif. Dua jam lalu. Dia duduk tepat di tempat kamu duduk sekarang.",
        textIdMix: "He comes every morning. Memesan coffee. Membayar pas. Mengucapkan 'Thank you, good morning' dalam Spanish yang sempurna. He was here today, detective. Dua jam lalu. Dia duduk tepat di tempat kamu duduk sekarang.",
      },
      // ── Scene 3: Retiro Park — Face to Face ───────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Retiro Park. Afternoon sun through the trees. The last place Carlos was seen. Then, across the path, a man. Tall. Silver hair. Impeccably dressed. Writing in a small notebook. That's him. That's Mr. Black. Right there. Twenty meters away.)",
        textKo: "(레티로 공원. 오후의 햇살이 나무 사이로 쏟아진다. 카를로스가 마지막으로 목격된 곳. 그때, 길 건너편에서, 한 남자. 키가 크다. 은발. 흠잡을 데 없이 차려입었다. 작은 노트에 무언가를 적고 있다. 저 사람이야. 미스터 블랙. 바로 저기. 20미터 앞에서.)",
        textEs: "(Parque del Retiro. Sol de tarde entre los árboles. El último lugar donde vieron a Carlos. Entonces, al otro lado del camino, un hombre. Alto. Pelo plateado. Impecablemente vestido. Escribiendo en una libreta pequeña. Es él. Mr. Black. Justo ahí. A veinte metros.)",
        textId: "(Taman Retiro. Sinar matahari sore menembus pepohonan. Tempat terakhir Carlos terlihat. Lalu, di seberang jalan setapak, seorang pria. Tinggi. Berambut perak. Berpakaian rapi tanpa cela. Menulis di sebuah buku catatan kecil. Itu dia. Itu Mr. Black. Tepat di sana. Dua puluh meter jauhnya.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Before Rudy can move, Mr. Black looks up. Looks directly at him. Smiles. And walks toward him. Slowly. Casually. Like meeting an old friend.)",
        textKo: "(루디가 움직이기도 전에, 미스터 블랙이 고개를 든다. 루디를 정면으로 바라본다. 미소짓는다. 그리고 루디를 향해 걸어온다. 천천히. 여유롭게. 마치 오래된 친구를 만나러 가는 것처럼.)",
        textEs: "(Antes de que Rudy pueda moverse, Mr. Black levanta la vista. Le mira directamente. Sonríe. Y camina hacia él. Lentamente. Con naturalidad. Como encontrarse con un viejo amigo.)",
        textId: "(Sebelum Rudy sempat bergerak, Mr. Black mendongak. Menatapnya langsung. Tersenyum. Lalu berjalan ke arahnya. Perlahan. Santai. Seperti hendak menemui seorang teman lama.)",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "Good afternoon, detective. Please, sit. You are looking for Carlos. He is safe. For now.",
        textKo: "안녕하세요, 탐정. 앉아 계세요. 카를로스를 찾고 있죠. 안전해요. 지금은요.",
        textKoMix: "Good afternoon, detective. Please, sit. You are looking for Carlos. 그는 safe해요. 지금은요.",
        textEs: "Buenas tardes, detective. Por favor, siéntese. Busca a Carlos. Está a salvo. Por ahora.",
        textEsMix: "Good afternoon, detective. Please, sit. You are looking for Carlos. Está safe. Por ahora.",
        textId: "Selamat siang, detektif. Silakan, duduk. Kamu sedang mencari Carlos. Dia aman. Untuk sekarang.",
        textIdMix: "Good afternoon, detective. Please, sit. You are looking for Carlos. Dia safe. Untuk sekarang.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Where is he?",
        textKo: "어디에 있어요?",
        textKoMix: "Where is he?",
        textEs: "¿Dónde está?",
        textEsMix: "Where is he?",
        textId: "Di mana dia?",
        textIdMix: "Where is he?",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "Number three, Calle del Prado. Third floor. The door is open. I don't lock doors, detective. You already know that about me.",
        textKo: "칼레 델 프라도 3번지. 3층. 문은 열려 있어요. 저는 문을 잠그지 않아요, 탐정. 이미 아시잖아요.",
        textKoMix: "Calle del Prado 3번지. Third floor. The door is open. 저는 문을 잠그지 않아요, detective. You already know that.",
        textEs: "Número tres, Calle del Prado. Tercer piso. La puerta está abierta. Yo no cierro puertas, detective. Eso ya lo sabe de mí.",
        textEsMix: "Número tres, Calle del Prado. Third floor. The door is open. Yo no cierro puertas, detective. You already know that.",
        textId: "Nomor tiga, Calle del Prado. Lantai tiga. Pintunya terbuka. Saya tidak mengunci pintu, detektif. Kamu sudah tahu itu tentang saya.",
        textIdMix: "Calle del Prado nomor tiga. Third floor. The door is open. Saya tidak mengunci pintu, detective. You already know that.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Why are you telling me this? Why not just disappear?",
        textKo: "왜 말해주는 거예요? 그냥 사라지면 되잖아요.",
        textKoMix: "Why are you telling me this? 그냥 disappear하면 되잖아요.",
        textEs: "¿Por qué me dices esto? ¿Por qué no simplemente desaparecer?",
        textEsMix: "Why are you telling me this? ¿Por qué no simplemente disappear?",
        textId: "Kenapa kamu memberitahuku ini? Kenapa tidak menghilang saja?",
        textIdMix: "Why are you telling me this? Kenapa tidak disappear saja?",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "Because Carlos will tell you about the device. And then you will understand. Seven thousand languages. Seven thousand walls between people. I am not the villain of this story, detective. I am the editor. Goodbye.",
        textKo: "카를로스가 장치에 대해 말해줄 거니까요. 그러면 이해하게 될 거예요. 7천 개의 언어. 7천 개의 벽. 저는 이 이야기의 악당이 아니에요, 탐정. 편집자예요. 안녕히 계세요.",
        textKoMix: "Carlos가 the device에 대해 말해줄 거니까요. 그러면 you will understand. Seven thousand languages. 7천 개의 walls. 저는 the villain이 아니에요, detective. I am the editor. Goodbye.",
        textEs: "Porque Carlos le contará sobre el dispositivo. Y entonces entenderá. Siete mil idiomas. Siete mil muros entre personas. No soy el villano de esta historia, detective. Soy el editor. Adiós.",
        textEsMix: "Porque Carlos le contará sobre the device. Y entonces you will understand. Seven thousand languages. Siete mil walls. No soy the villain, detective. I am the editor. Goodbye.",
        textId: "Karena Carlos akan menceritakan tentang alat itu padamu. Dan setelah itu kamu akan mengerti. Tujuh ribu bahasa. Tujuh ribu tembok di antara manusia. Saya bukan penjahat dalam kisah ini, detektif. Saya adalah sang penyunting. Selamat tinggal.",
        textIdMix: "Karena Carlos akan menceritakan tentang the device padamu. Dan setelah itu you will understand. Seven thousand languages. Tujuh ribu walls. Saya bukan the villain, detective. I am the editor. Goodbye.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Mr. Black turns. Doesn't look back. Writes something in his notebook as he walks. Disappears into the tree shadows of Retiro Park. Rudy's hands are shaking. He just told me where Carlos is. No threats, no demands. He called himself an 'editor.' He didn't sound insane. That's the part that scares me.)",
        textKo: "(미스터 블랙이 돌아선다. 뒤도 돌아보지 않는다. 노트에 무언가를 적으며 걸어간다. 레티로 공원의 나무 그늘로 사라진다. 루디의 손이 떨린다. 카를로스가 어디 있는지 말해줬어. 위협도, 요구도 없이. 자기를 '편집자'라고 했어. 미친 것처럼 들리지 않았어. 그게 무서운 점이야.)",
        textEs: "(Mr. Black se da la vuelta. No mira atrás. Escribe algo en su libreta mientras camina. Desaparece entre las sombras de los árboles del Retiro. Las manos de Rudy tiemblan. Me dijo dónde está Carlos. Sin amenazas, sin demandas. Se llamó a sí mismo 'editor.' No sonó como loco. Esa es la parte que me asusta.)",
        textId: "(Mr. Black berbalik. Tidak menoleh ke belakang. Menulis sesuatu di buku catatannya sambil berjalan. Lenyap ke dalam bayangan pepohonan Taman Retiro. Tangan Rudy gemetar. Dia baru saja memberitahuku di mana Carlos berada. Tanpa ancaman, tanpa tuntutan. Dia menyebut dirinya 'penyunting.' Suaranya tidak terdengar seperti orang gila. Itulah bagian yang membuatku takut.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Later that night. Isabel sends a voice message. Three words: 'They got Juan.' Juan, her brother. The one who saw Mr. Black at the market. He had 40 words this morning. Now he has three. 'I. Don't. Remember.' This isn't a chess game anymore.)",
        textKo: "(그날 밤 늦게. 이사벨에게서 음성 메시지가 와. 단어 세 개: '후안이 당했어.' 후안, 그녀의 남동생. 시장에서 미스터 블랙을 본 사람. 오늘 아침에 40개의 단어를 갖고 있었어. 지금은 세 개야. '나. 기억. 없어.' 이제 체스 게임이 아니야.)",
        textEs: "(Más tarde esa noche. Isabel manda un mensaje de voz. Tres palabras: 'Se llevaron a Juan.' Juan, su hermano. El que vio a Mr. Black en el mercado. Esta mañana tenía 40 palabras. Ahora tiene tres. 'Yo. No. Recuerdo.' Esto ya no es un juego de ajedrez.)",
        textId: "(Larut malam itu. Isabel mengirim pesan suara. Tiga kata: 'Mereka menangkap Juan.' Juan, adiknya. Orang yang melihat Mr. Black di pasar. Pagi ini dia masih punya 40 kata. Sekarang tinggal tiga. 'Aku. Tidak. Ingat.' Ini bukan lagi permainan catur.)",
      },
      {
        kind: "clue",
        symbol: "📓",
        titleEn: "Mr. Black's Torn Notebook Page",
        titleKo: "미스터 블랙의 찢어진 노트 페이지",
        titleEs: "Página Arrancada del Cuaderno de Mr. Black",
        titleId: "Halaman Buku Catatan Mr. Black yang Tersobek",
        descEn: "Numbers and words scrambled: '7000, walls, goodbye, hello, editor, Calle del Prado 3.' Left deliberately. He wanted to be understood.",
        descKo: "숫자와 단어가 뒤섞여 있다: '7000, 벽, 안녕히 계세요, 안녕하세요, 편집자, 칼레 델 프라도 3.' 의도적으로 남겨둔 것이다. 이해받길 원했다.",
        descEs: "Números y palabras mezclados: '7000, muros, adiós, hola, editor, Calle del Prado 3.' Dejado deliberadamente. Quería ser entendido.",
        descId: "Angka dan kata teracak: '7000, tembok, selamat tinggal, halo, penyunting, Calle del Prado 3.' Ditinggalkan dengan sengaja. Dia ingin dipahami.",
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
            instruction: { en: "Carlos's first cry — put the words in order:", ko: "카를로스의 첫 번째 외침 — 단어를 순서대로 배열하세요:", es: "El primer grito de Carlos — pon las palabras en orden:", id: "Teriakan pertama Carlos — susun kata-katanya secara berurutan:" },
            words: [
              { en: "Hello", ko: "안녕하세요", es: "Hola", id: "Halo" },
              { en: "I need", ko: "필요해요", es: "Necesito", id: "Saya butuh" },
              { en: "help", ko: "도움이", es: "ayuda", id: "bantuan" },
            ],
            answerOrder: [0, 1, 2],
          },
          {
            instruction: { en: "Carlos's second cry:", ko: "카를로스의 두 번째 외침:", es: "El segundo grito de Carlos:", id: "Teriakan kedua Carlos:" },
            words: [
              { en: "Where", ko: "어디", es: "Dónde", id: "Di mana" },
              { en: "is", ko: "에요", es: "está", id: "letak" },
              { en: "the bathroom", ko: "화장실이", es: "el baño", id: "kamar mandi" },
            ],
            answerOrder: [0, 1, 2],
          },
          {
            instruction: { en: "Carlos's last cry:", ko: "카를로스의 마지막 외침:", es: "El último grito de Carlos:", id: "Teriakan terakhir Carlos:" },
            words: [
              { en: "Help", ko: "도와주세요", es: "Ayuda", id: "Tolong" },
              { en: "Please", ko: "제발", es: "Por favor", id: "Kumohon" },
              { en: "help me", ko: "도와줘요", es: "ayúdame", id: "tolong aku" },
            ],
            answerOrder: [0, 1, 2],
          },
        ],
        hints: {
          h1: {
            ko: "카를로스는 기초 생존 표현을 외치고 있어 — 인사, 장소, 도움 요청",
            en: "Carlos was shouting basic survival phrases — greeting, location, help",
            es: "Carlos gritaba frases de supervivencia — saludo, lugar, ayuda",
            id: "Carlos meneriakkan frasa bertahan hidup yang mendasar — sapaan, lokasi, permintaan tolong",
            byLearning: {
              spanish: { ko: "카를로스의 외침: Hola, Necesito ayuda, ¿Dónde está el baño?", en: "Carlos's cries: Hola, Necesito ayuda, ¿Dónde está el baño?", es: "Los gritos de Carlos: Hola, Necesito ayuda, ¿Dónde está el baño?", id: "Teriakan Carlos: Hola, Necesito ayuda, ¿Dónde está el baño?" },
              korean:  { ko: "카를로스의 외침: 안녕하세요, 도움이 필요해요, 화장실이 어디에요?", en: "Carlos's cries: 안녕하세요, 도움이 필요해요, 화장실이 어디에요?", es: "Los gritos de Carlos: 안녕하세요, 도움이 필요해요, 화장실이 어디에요?", id: "Teriakan Carlos: 안녕하세요, 도움이 필요해요, 화장실이 어디에요?" },
              english: { ko: "카를로스의 외침: Hello, I need help, Where is the bathroom?", en: "Carlos's cries: Hello, I need help, Where is the bathroom?", es: "Los gritos de Carlos: Hello, I need help, Where is the bathroom?", id: "Teriakan Carlos: Hello, I need help, Where is the bathroom?" },
              indonesian: { ko: "카를로스의 외침: Halo, Saya butuh bantuan, Di mana kamar mandi?", en: "Carlos's cries: Halo, Saya butuh bantuan, Di mana kamar mandi?", es: "Los gritos de Carlos: Halo, Saya butuh bantuan, Di mana kamar mandi?", id: "Teriakan Carlos: Halo, Saya butuh bantuan, Di mana kamar mandi?" },
            },
          },
          h2: {
            ko: "영어 어순: 주어 → 동사 → 목적어",
            en: "English word order: Subject → Verb → Object",
            es: "Orden en inglés: Sujeto → Verbo → Objeto",
            id: "Urutan kata bahasa Inggris: Subjek → Kata Kerja → Objek",
            byLearning: {
              spanish: { ko: "스페인어 어순: 주어 → 동사 → 목적어 (Hola → Necesito → ayuda)", en: "Spanish word order: Subject → Verb → Object (Hola → Necesito → ayuda)", es: "Orden en español: Sujeto → Verbo → Objeto (Hola → Necesito → ayuda)", id: "Urutan kata bahasa Spanyol: Subjek → Kata Kerja → Objek (Hola → Necesito → ayuda)" },
              korean:  { ko: "한국어 어순: 주어 → 목적어 → 동사 (안녕하세요 → 도움이 → 필요해요)", en: "Korean word order: Subject → Object → Verb (안녕하세요 → 도움이 → 필요해요)", es: "Orden en coreano: Sujeto → Objeto → Verbo (안녕하세요 → 도움이 → 필요해요)", id: "Urutan kata bahasa Korea: Subjek → Objek → Kata Kerja (안녕하세요 → 도움이 → 필요해요)" },
              english: { ko: "영어 어순: 주어 → 동사 → 목적어 (Hello → I need → help)", en: "English word order: Subject → Verb → Object (Hello → I need → help)", es: "Orden en inglés: Sujeto → Verbo → Objeto (Hello → I need → help)", id: "Urutan kata bahasa Inggris: Subjek → Kata Kerja → Objek (Hello → I need → help)" },
              indonesian: { ko: "인도네시아어 어순: 주어 → 동사 → 목적어 (Halo → Saya butuh → bantuan)", en: "Indonesian word order: Subject → Verb → Object (Halo → Saya butuh → bantuan)", es: "Orden en indonesio: Sujeto → Verbo → Objeto (Halo → Saya butuh → bantuan)", id: "Urutan kata bahasa Indonesia: Subjek → Kata Kerja → Objek (Halo → Saya butuh → bantuan)" },
            },
          },
          h3: {
            ko: "1: Hello, I need help / 2: Where is the bathroom / 3: Help, Please help me",
            en: "1: Hello, I need help / 2: Where is the bathroom / 3: Help, Please help me",
            es: "1: Hello, I need help / 2: Where is the bathroom / 3: Help, Please help me",
            id: "1: Hello, I need help / 2: Where is the bathroom / 3: Help, Please help me",
            byLearning: {
              spanish: { ko: "1: Hola, Necesito ayuda / 2: Dónde está el baño / 3: Ayuda, Por favor ayúdame", en: "1: Hola, Necesito ayuda / 2: Dónde está el baño / 3: Ayuda, Por favor ayúdame", es: "1: Hola, Necesito ayuda / 2: Dónde está el baño / 3: Ayuda, Por favor ayúdame", id: "1: Hola, Necesito ayuda / 2: Dónde está el baño / 3: Ayuda, Por favor ayúdame" },
              korean:  { ko: "1: 안녕하세요, 도움이 필요해요 / 2: 화장실이 어디에요 / 3: 도와주세요, 제발 도와줘요", en: "1: 안녕하세요, 도움이 필요해요 / 2: 화장실이 어디에요 / 3: 도와주세요, 제발 도와줘요", es: "1: 안녕하세요, 도움이 필요해요 / 2: 화장실이 어디에요 / 3: 도와주세요, 제발 도와줘요", id: "1: 안녕하세요, 도움이 필요해요 / 2: 화장실이 어디에요 / 3: 도와주세요, 제발 도와줘요" },
              english: { ko: "1: Hello, I need help / 2: Where is the bathroom / 3: Help, Please help me", en: "1: Hello, I need help / 2: Where is the bathroom / 3: Help, Please help me", es: "1: Hello, I need help / 2: Where is the bathroom / 3: Help, Please help me", id: "1: Hello, I need help / 2: Where is the bathroom / 3: Help, Please help me" },
              indonesian: { ko: "1: Halo, Saya butuh bantuan / 2: Di mana kamar mandi / 3: Tolong, Kumohon tolong aku", en: "1: Halo, Saya butuh bantuan / 2: Di mana kamar mandi / 3: Tolong, Kumohon tolong aku", es: "1: Halo, Saya butuh bantuan / 2: Di mana kamar mandi / 3: Tolong, Kumohon tolong aku", id: "1: Halo, Saya butuh bantuan / 2: Di mana kamar mandi / 3: Tolong, Kumohon tolong aku" },
            },
          },
        },
      },
      // ── Scene 4: Rescue Carlos ─────────────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Number three, Calle del Prado. Third floor. Door open, just as Mr. Black said. Inside: a dark room. An old machine, like an antique radio, but languages scroll across its screen. And in the corner, a man in a chair. Carlos. Alive. But his eyes are unfocused.)",
        textKo: "(칼레 델 프라도 3번지. 3층. 미스터 블랙이 말한 대로 문이 열려 있다. 안에는 어두운 방. 오래된 기계 장치, 앤티크 라디오를 닮았지만 화면에 언어가 스크롤되고 있다. 그리고 구석에, 의자에 앉아있는 남자. 카를로스. 살아있다. 하지만 눈이 초점을 잃었다.)",
        textEs: "(Número tres, Calle del Prado. Tercer piso. Puerta abierta, tal como dijo Mr. Black. Dentro: una habitación oscura. Una máquina vieja, como una radio antigua, pero idiomas se desplazan en su pantalla. Y en la esquina, un hombre en una silla. Carlos. Vivo. Pero sus ojos están desenfocados.)",
        textId: "(Nomor tiga, Calle del Prado. Lantai tiga. Pintu terbuka, persis seperti kata Mr. Black. Di dalam: sebuah ruangan gelap. Sebuah mesin tua, mirip radio antik, tapi sederet bahasa bergulir di layarnya. Dan di sudut, seorang pria di kursi. Carlos. Hidup. Tapi matanya kosong tanpa fokus.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Carlos? Can you hear me? My name is Rudy. I'm a friend of Isabel. I'm here to help.",
        textKo: "카를로스? 들려? 내 이름은 루디야. 이사벨의 친구야. 도와주러 왔어.",
        textKoMix: "Carlos? Can you hear me? My name is Rudy. Isabel의 친구야. I'm here to help.",
        textEs: "¿Carlos? ¿Me oyes? Me llamo Rudy. Soy amigo de Isabel. Estoy aquí para ayudarte.",
        textEsMix: "¿Carlos? Can you hear me? My name is Rudy. Soy amigo de Isabel. I'm here to help.",
        textId: "Carlos? Bisa dengar aku? Namaku Rudy. Aku teman Isabel. Aku di sini untuk membantu.",
        textIdMix: "Carlos? Can you hear me? My name is Rudy. Teman Isabel. I'm here to help.",
      },
      {
        kind: "scene",
        charId: "carlos",
        text: "Hello... yes... I... the word. I can't... 'Recordar.' Remember. It came back. But others didn't. 'Window.' What's 'window'? I used to know. I used to know everything.",
        textKo: "안녕... 네... 나... 그 단어. 못... 'Recordar.' 기억하다. 돌아왔어. 근데 다른 건 안 돌아왔어. '창문.' '창문'이 뭐야? 알고 있었는데. 전부 알고 있었는데.",
        textKoMix: "Hello... yes... 나... the word. 못... 'Recordar.' Remember. 돌아왔어. 근데 others는 안 돌아왔어. 'Window.' What's 'window'? 알고 있었는데. 전부 알고 있었는데.",
        textEs: "Hola... sí... yo... la palabra. No puedo... 'Recordar.' Recordar. Volvió. Pero otras no. 'Ventana.' ¿Qué es 'ventana'? Lo sabía. Lo sabía todo.",
        textEsMix: "Hello... yes... yo... the word. No puedo... 'Recordar.' Remember. Volvió. Pero otras no. 'Window.' ¿Qué es 'window'? Lo sabía. Lo sabía todo.",
        textId: "Halo... ya... aku... kata itu. Aku tak bisa... 'Recordar.' Mengingat. Itu kembali. Tapi yang lain tidak. 'Window.' Apa itu 'window'? Dulu aku tahu. Dulu aku tahu segalanya.",
        textIdMix: "Hello... yes... aku... the word. Aku tak bisa... 'Recordar.' Remember. Itu kembali. Tapi others tidak. 'Window.' What's 'window'? Dulu aku tahu. Dulu aku tahu segalanya.",
      },
      {
        kind: "scene",
        charId: "carlos",
        text: "The machine... it erases. Languages. From your head. I found it hidden in the wall at the Prado. When I touched it, I heard every language I know start to dissolve. Like sugar in water. One word at a time. Until all I had left was... 'Hello. Help. Where is the door.'",
        textKo: "기계가... 지워. 언어를. 머릿속에서. 프라도 벽 안에 숨겨진 걸 발견했어. 만졌더니, 내가 아는 모든 언어가 녹기 시작하는 게 들렸어. 설탕이 물에 녹듯이. 한 단어씩. 남은 건... '안녕하세요. 도와주세요. 문이 어디예요.'뿐이었어.",
        textKoMix: "The machine가... 지워. Languages를. 머릿속에서. Prado 벽 안에 숨겨진 걸 발견했어. 만졌더니, 내가 아는 every language가 dissolve하기 시작하는 게 들렸어. 설탕이 물에 녹듯이. one word at a time. 남은 건... 'Hello. Help. Where is the door.'뿐이었어.",
        textEs: "La máquina... borra. Idiomas. De tu cabeza. La encontré escondida en la pared del Prado. Cuando la toqué, escuché cómo cada idioma que conozco empezaba a disolverse. Como azúcar en agua. Una palabra a la vez. Hasta que todo lo que me quedaba era... 'Hola. Ayuda. ¿Dónde está la puerta?'",
        textEsMix: "The machine... borra. Languages. De tu cabeza. La encontré escondida en la pared del Prado. Cuando la toqué, escuché cómo every language que conozco empezaba a dissolve. Como azúcar en agua. One word at a time. Hasta que todo lo que me quedaba era... 'Hello. Help. Where is the door.'",
        textId: "Mesin itu... menghapus. Bahasa. Dari kepalamu. Aku menemukannya tersembunyi di dinding Prado. Saat aku menyentuhnya, aku mendengar setiap bahasa yang kukenal mulai larut. Seperti gula dalam air. Satu kata demi satu kata. Sampai yang tersisa hanyalah... 'Halo. Tolong. Di mana pintunya.'",
        textIdMix: "The machine... menghapus. Languages. Dari kepalamu. Aku menemukannya tersembunyi di dinding Prado. Saat aku menyentuhnya, aku mendengar every language yang kukenal mulai dissolve. Seperti gula dalam air. One word at a time. Sampai yang tersisa hanyalah... 'Hello. Help. Where is the door.'",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(A Language Erasure Device. Just a prototype, the final version needs all seven Guardian Stones. Seven stones, seven thousand languages erased. He's not a thief. He's an extinction event. I need to shut this machine down. Now.)",
        textKo: "(언어 삭제 장치. 시제품일 뿐이야. 최종 버전은 7개의 수호석이 모두 필요해. 7개의 수호석, 7천 개의 언어 삭제. 그는 도둑이 아니야. 멸종 사건이야. 지금 당장 이 기계를 꺼야 해.)",
        textEs: "(Un Dispositivo de Borrado de Idiomas. Solo un prototipo, la versión final necesita las siete Piedras Guardianas. Siete piedras, siete mil idiomas borrados. No es un ladrón. Es un evento de extinción. Necesito apagar esta máquina. Ahora.)",
        textId: "(Sebuah Alat Penghapus Bahasa. Baru sebuah prototipe, versi finalnya membutuhkan ketujuh Batu Penjaga. Tujuh batu, tujuh ribu bahasa terhapus. Dia bukan seorang pencuri. Dia adalah peristiwa kepunahan. Aku harus mematikan mesin ini. Sekarang.)",
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
            prompt: { en: "The machine has a price display. Carlos was screaming numbers. How do you say a price in English?", ko: "기계에 가격 표시가 있어. 카를로스가 숫자를 소리쳤어. 영어로 가격을 어떻게 말해?", es: "La máquina tiene una pantalla de precios. Carlos gritaba números. ¿Cómo dices un precio en inglés?", id: "Mesin itu punya layar harga. Carlos meneriakkan angka-angka. Bagaimana cara menyebut harga dalam bahasa Inggris?" },
            clues: [
              { en: "That's fifteen dollars — stating a price with the number and currency", ko: "15달러입니다 — 숫자와 통화로 가격을 말하는 것", es: "Son quince dólares — indicar un precio con número y moneda", id: "Harganya lima belas dolar — menyebut harga dengan angka dan mata uang" },
              { en: "What day is it today? — asking about the day of the week", ko: "오늘 무슨 요일이에요? — 요일을 묻는 것", es: "¿Qué día es hoy? — preguntar por el día de la semana", id: "Hari ini hari apa? — menanyakan hari dalam seminggu" },
              { en: "How are you today? — asking about someone's well-being", ko: "오늘 어떠세요? — 누군가의 안부를 묻는 것", es: "¿Cómo estás hoy? — preguntar por el bienestar de alguien", id: "Apa kabar hari ini? — menanyakan keadaan seseorang" },
              { en: "That's too expensive! — saying the price is too high", ko: "너무 비싸요! — 가격이 너무 높다고 말하는 것", es: "¡Eso es muy caro! — decir que el precio es demasiado alto", id: "Itu terlalu mahal! — mengatakan harganya terlalu tinggi" },
            ],
            answerIdx: 0,
          },
          {
            prompt: { en: "Second lock: Carlos only had basic words left. Which phrase would he use to ask for help at a restaurant?", ko: "두 번째 잠금: 카를로스에게 기본 단어만 남았어. 식당에서 도움을 요청하려면 어떤 표현을 쓸까?", es: "Segunda cerradura: A Carlos solo le quedaban palabras básicas. ¿Qué frase usaría para pedir ayuda en un restaurante?", id: "Kunci kedua: Carlos hanya menyisakan kata-kata dasar. Frasa mana yang akan dia pakai untuk meminta bantuan di restoran?" },
            clues: [
              { en: "Can I have the menu, please? — politely asking for the menu", ko: "메뉴판 좀 주시겠어요? — 정중하게 메뉴를 요청하는 것", es: "¿Puedo ver el menú, por favor? — pedir el menú amablemente", id: "Boleh minta menunya? — meminta menu dengan sopan" },
              { en: "Can I have water, please? — asking for the most basic need", ko: "물 좀 주세요 — 가장 기본적인 필요를 요청하는 것", es: "¿Puedo tener agua, por favor? — pedir la necesidad más básica", id: "Boleh minta air? — meminta kebutuhan yang paling mendasar" },
              { en: "This is delicious! — complimenting the food", ko: "이거 맛있어요! — 음식을 칭찬하는 것", es: "¡Esto está delicioso! — elogiar la comida", id: "Ini lezat! — memuji makanan" },
              { en: "The bill, please. — asking to pay", ko: "계산서 주세요 — 계산을 요청하는 것", es: "La cuenta, por favor. — pedir pagar", id: "Minta bonnya. — meminta untuk membayar" },
            ],
            answerIdx: 1,
          },
        ],
        hints: {
          h1: {
            ko: "카를로스에게 남은 단어들을 생각해봐 — 기본적인 생존 표현만 남았어",
            en: "Think about what words Carlos had left — only basic survival phrases remained",
            es: "Piensa en qué palabras le quedaban a Carlos — solo frases básicas de supervivencia",
            id: "Pikirkan kata-kata apa yang tersisa pada Carlos — hanya frasa bertahan hidup yang mendasar",
            byLearning: {
              spanish: { ko: "카를로스에게 남은 스페인어 표현: Hola, Ayuda, ¿Dónde está la puerta?", en: "Carlos's remaining Spanish phrases: Hola, Ayuda, ¿Dónde está la puerta?", es: "Las frases en español que le quedaron a Carlos: Hola, Ayuda, ¿Dónde está la puerta?", id: "Frasa bahasa Spanyol yang tersisa pada Carlos: Hola, Ayuda, ¿Dónde está la puerta?" },
              korean:  { ko: "카를로스에게 남은 한국어 표현: 안녕하세요, 도와주세요, 문이 어디예요?", en: "Carlos's remaining Korean phrases: 안녕하세요, 도와주세요, 문이 어디예요?", es: "Las frases en coreano que le quedaron a Carlos: 안녕하세요, 도와주세요, 문이 어디예요?", id: "Frasa bahasa Korea yang tersisa pada Carlos: 안녕하세요, 도와주세요, 문이 어디예요?" },
              english: { ko: "카를로스에게 남은 영어 표현: Hello, Help, Where is the door?", en: "Carlos's remaining English phrases: Hello, Help, Where is the door?", es: "Las frases en inglés que le quedaron a Carlos: Hello, Help, Where is the door?", id: "Frasa bahasa Inggris yang tersisa pada Carlos: Hello, Help, Where is the door?" },
              indonesian: { ko: "카를로스에게 남은 인도네시아어 표현: Halo, Tolong, Di mana pintunya?", en: "Carlos's remaining Indonesian phrases: Halo, Tolong, Di mana pintunya?", es: "Las frases en indonesio que le quedaron a Carlos: Halo, Tolong, Di mana pintunya?", id: "Frasa bahasa Indonesia yang tersisa pada Carlos: Halo, Tolong, Di mana pintunya?" },
            },
          },
          h2: {
            ko: "카를로스가 소리친 건 'Hello. Help. Where is the door.' — 가장 기본적인 것만 남아있어",
            en: "Carlos was screaming 'Hello. Help. Where is the door.' — only the most basic words remained",
            es: "Carlos gritaba 'Hello. Help. Where is the door.' — solo quedaban las palabras más básicas",
            id: "Carlos meneriakkan 'Hello. Help. Where is the door.' — hanya kata-kata yang paling mendasar yang tersisa",
            byLearning: {
              spanish: { ko: "카를로스의 비명: 'Hola. Ayuda. ¿Dónde está la puerta?' — 기초 스페인어만 남았어", en: "Carlos screamed: 'Hola. Ayuda. ¿Dónde está la puerta?' — only basic Spanish remained", es: "Carlos gritó: 'Hola. Ayuda. ¿Dónde está la puerta?' — solo quedaba español básico", id: "Carlos berteriak: 'Hola. Ayuda. ¿Dónde está la puerta?' — hanya bahasa Spanyol dasar yang tersisa" },
              korean:  { ko: "카를로스의 비명: '안녕하세요. 도와주세요. 문이 어디예요?' — 기초 한국어만 남았어", en: "Carlos screamed: '안녕하세요. 도와주세요. 문이 어디예요?' — only basic Korean remained", es: "Carlos gritó: '안녕하세요. 도와주세요. 문이 어디예요?' — solo quedaba coreano básico", id: "Carlos berteriak: '안녕하세요. 도와주세요. 문이 어디예요?' — hanya bahasa Korea dasar yang tersisa" },
              english: { ko: "카를로스의 비명: 'Hello. Help. Where is the door?' — 기초 영어만 남았어", en: "Carlos screamed: 'Hello. Help. Where is the door?' — only basic English remained", es: "Carlos gritó: 'Hello. Help. Where is the door?' — solo quedaba inglés básico", id: "Carlos berteriak: 'Hello. Help. Where is the door?' — hanya bahasa Inggris dasar yang tersisa" },
              indonesian: { ko: "카를로스의 비명: 'Halo. Tolong. Di mana pintunya?' — 기초 인도네시아어만 남았어", en: "Carlos screamed: 'Halo. Tolong. Di mana pintunya?' — only basic Indonesian remained", es: "Carlos gritó: 'Halo. Tolong. Di mana pintunya?' — solo quedaba indonesio básico", id: "Carlos berteriak: 'Halo. Tolong. Di mana pintunya?' — hanya bahasa Indonesia dasar yang tersisa" },
            },
          },
          h3: {
            ko: "첫 번째: 가격 말하기(15달러) / 두 번째: 물 주세요 — 가장 기본적인 생존 요청이야",
            en: "First: stating a price (fifteen dollars) / Second: water please — the most basic survival request",
            es: "Primero: decir un precio (fifteen dollars) / Segundo: water please — la petición de supervivencia más básica",
            id: "Pertama: menyebut harga (lima belas dolar) / Kedua: minta air — permintaan bertahan hidup yang paling mendasar",
            byLearning: {
              spanish: { ko: "첫 번째: 'Son quince dólares' (가격) / 두 번째: '¿Puedo tener agua, por favor?' (생존 요청)", en: "First: 'Son quince dólares' (price) / Second: '¿Puedo tener agua, por favor?' (survival request)", es: "Primero: 'Son quince dólares' (precio) / Segundo: '¿Puedo tener agua, por favor?' (petición de supervivencia)", id: "Pertama: 'Son quince dólares' (harga) / Kedua: '¿Puedo tener agua, por favor?' (permintaan bertahan hidup)" },
              korean:  { ko: "첫 번째: '15달러입니다' (가격) / 두 번째: '물 좀 주세요' (생존 요청)", en: "First: '15달러입니다' (price) / Second: '물 좀 주세요' (survival request)", es: "Primero: '15달러입니다' (precio) / Segundo: '물 좀 주세요' (petición de supervivencia)", id: "Pertama: '15달러입니다' (harga) / Kedua: '물 좀 주세요' (permintaan bertahan hidup)" },
              english: { ko: "첫 번째: 'That's fifteen dollars' (가격) / 두 번째: 'Can I have water, please?' (생존 요청)", en: "First: 'That's fifteen dollars' (price) / Second: 'Can I have water, please?' (survival request)", es: "Primero: 'That's fifteen dollars' (precio) / Segundo: 'Can I have water, please?' (petición de supervivencia)", id: "Pertama: 'That's fifteen dollars' (harga) / Kedua: 'Can I have water, please?' (permintaan bertahan hidup)" },
              indonesian: { ko: "첫 번째: 'Harganya lima belas dolar' (가격) / 두 번째: 'Boleh minta air?' (생존 요청)", en: "First: 'Harganya lima belas dolar' (price) / Second: 'Boleh minta air?' (survival request)", es: "Primero: 'Harganya lima belas dolar' (precio) / Segundo: 'Boleh minta air?' (petición de supervivencia)", id: "Pertama: 'Harganya lima belas dolar' (harga) / Kedua: 'Boleh minta air?' (permintaan bertahan hidup)" },
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
        textId: "(Kunci terakhir terlepas. Mesin itu berhenti. Carlos mengerjap. Warna kembali ke wajahnya.)",
      },
      {
        kind: "scene",
        charId: "carlos",
        text: "'Ventana.' Window. I remember! Some words are coming back. 'Gracias.' Thank you. I have that one too.",
        textKo: "'창문.' Window. 기억나! 몇몇 단어가 돌아오고 있어. 'Gracias.' 감사합니다. 그것도 있어.",
        textKoMix: "'Ventana.' Window. I remember! Some words가 돌아오고 있어. 'Gracias.' Thank you. 그것도 있어.",
        textEs: "'Ventana.' Ventana. ¡Recuerdo! Algunas palabras vuelven. 'Gracias.' Gracias. Esa también la tengo.",
        textEsMix: "'Ventana.' Window. I remember! Some words vuelven. 'Gracias.' Thank you. Esa también la tengo.",
        textId: "'Ventana.' Jendela. Aku ingat! Beberapa kata mulai kembali. 'Gracias.' Terima kasih. Yang itu juga kupunya.",
        textIdMix: "'Ventana.' Window. I remember! Some words mulai kembali. 'Gracias.' Thank you. Yang itu juga kupunya.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "The Madrid stone, do you know where it is?",
        textKo: "마드리드 수호석, 어디 있는지 알아?",
        textKoMix: "The Madrid stone, where is it 알아?",
        textEs: "¿La piedra de Madrid, sabes dónde está?",
        textEsMix: "The Madrid stone, ¿sabes where is it?",
        textId: "Batu Madrid, kamu tahu di mana letaknya?",
        textIdMix: "The Madrid stone, kamu tahu where is it?",
      },
      {
        kind: "scene",
        charId: "carlos",
        text: "Under the machine. There's a compartment. The stone was powering it. He used the Madrid stone to run the prototype.",
        textKo: "기계 아래에. 칸이 있어. 수호석이 동력원이었어. 시제품을 가동하는 데 마드리드 수호석을 사용한 거야.",
        textKoMix: "Under the machine. 칸이 있어. The stone이 동력원이었어. prototype을 가동하는 데 the Madrid stone을 사용한 거야.",
        textEs: "Debajo de la máquina. Hay un compartimento. La piedra la alimentaba. Usó la piedra de Madrid para hacer funcionar el prototipo.",
        textEsMix: "Under the machine. Hay un compartimento. The stone la alimentaba. Usó the Madrid stone para hacer funcionar el prototype.",
        textId: "Di bawah mesin. Ada sebuah kompartemen. Batu itulah yang menjadi sumber dayanya. Dia memakai batu Madrid untuk menjalankan prototipe itu.",
        textIdMix: "Under the machine. Ada sebuah kompartemen. The stone itulah sumber dayanya. Dia memakai the Madrid stone untuk menjalankan prototype itu.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Rudy checks underneath the machine. There's a compartment. It opens. But inside, nothing. Where the stone should be, a single piece of paper.)",
        textKo: "(루디가 기계 아래를 확인한다. 칸이 있다. 열린다. 하지만 안에는, 아무것도 없다. 수호석이 있던 자리에 종이 한 장.)",
        textEs: "(Rudy revisa debajo de la máquina. Hay un compartimento. Se abre. Pero dentro, nada. Donde debería estar la piedra, un solo papel.)",
        textId: "(Rudy memeriksa bagian bawah mesin. Ada sebuah kompartemen. Kompartemen itu terbuka. Tapi di dalamnya, kosong. Di tempat batu itu seharusnya berada, hanya ada selembar kertas.)",
      },
      {
        kind: "clue",
        symbol: "📝",
        titleEn: "Mr. Black's Note, Left Behind",
        titleKo: "미스터 블랙의 메모",
        titleEs: "Nota de Mr. Black, Dejada Atrás",
        titleId: "Catatan Mr. Black yang Ditinggalkan",
        descEn: "'Thank you for helping Carlos. I'm sorry about the machine. London and Madrid are only two of the four city stones. The last three are waiting at Babel. The numbers are not in your favor, detective. See you in Seoul. Goodbye, Madrid. -B'",
        descKo: "'카를로스를 도와줘서 감사합니다. 기계는 죄송해요. 런던과 마드리드는 네 도시 수호석 중 두 개일 뿐입니다. 마지막 세 개는 바벨에서 기다리고 있어요. 숫자가 유리하지 않아요, 탐정. 서울에서 봐요. 안녕히 계세요, 마드리드. -B'",
        descEs: "'Gracias por ayudar a Carlos. Perdón por la máquina. Londres y Madrid son solo dos de las cuatro piedras de ciudad. Las últimas tres esperan en Babel. Los números no están a tu favor, detective. Nos vemos en Seúl. Adiós, Madrid. -B'",
        descId: "'Terima kasih telah menolong Carlos. Maaf soal mesin itu. London dan Madrid hanyalah dua dari empat batu kota. Tiga yang terakhir menanti di Babel. Angka-angkanya tidak berpihak padamu, detektif. Sampai jumpa di Seoul. Selamat tinggal, Madrid. -B'",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "He took it. While I was inside saving Carlos, he walked in and took the stone. He told me where Carlos was so I'd be busy while he stole it. He played me. He played me and I walked right into it.",
        textKo: "가져갔어. 내가 안에서 카를로스를 구하는 동안 들어와서 수호석을 가져갔어. 내가 바쁘게 만들려고 카를로스 위치를 알려준 거야. 나를 이용했어. 이용당하면서 나는 그대로 걸어 들어갔고.",
        textKoMix: "He took it. 내가 안에서 Carlos를 구하는 동안 들어와서 the stone을 가져갔어. 내가 busy하게 만들려고 Carlos 위치를 알려준 거야. He played me. 이용당하면서 나는 그대로 걸어 들어갔고.",
        textEs: "Se la llevó. Mientras yo salvaba a Carlos, entró y se llevó la piedra. Me dijo dónde estaba Carlos para que estuviera ocupado mientras la robaba. Me engañó. Me engañó y yo caí directo.",
        textEsMix: "He took it. Mientras yo salvaba a Carlos, entró y se llevó the stone. Me dijo dónde estaba Carlos para que estuviera busy mientras la robaba. He played me. Me engañó y yo caí directo.",
        textId: "Dia mengambilnya. Selagi aku di dalam menyelamatkan Carlos, dia masuk dan mengambil batu itu. Dia memberitahuku di mana Carlos agar aku sibuk sementara dia mencurinya. Dia mempermainkanku. Dia mempermainkanku dan aku langsung masuk perangkapnya.",
        textIdMix: "He took it. Selagi aku di dalam menyelamatkan Carlos, dia masuk dan mengambil the stone. Dia memberitahuku di mana Carlos agar aku busy sementara dia mencurinya. He played me. Dia mempermainkanku dan aku langsung masuk perangkapnya.",
      },
      {
        kind: "scene",
        charId: "isabel",
        text: "You saved Carlos. That matters more than a stone. Seoul is next? Then go for it. We'll hold Madrid.",
        textKo: "카를로스를 구했잖아. 그게 수호석보다 중요해. 서울이 다음이라고? 그럼 해봐. 마드리드는 우리가 지킬게.",
        textKoMix: "You saved Carlos. 그게 a stone보다 중요해. Seoul is next? 그럼 go for it. Madrid는 우리가 지킬게.",
        textEs: "Salvaste a Carlos. Eso importa más que una piedra. ¿Seúl es el siguiente? Pues ¡dale! Nosotros cuidamos Madrid.",
        textEsMix: "You saved Carlos. Eso importa más que a stone. ¿Seoul is next? Pues go for it. Nosotros cuidamos Madrid.",
        textId: "Kamu menyelamatkan Carlos. Itu lebih berarti daripada sebuah batu. Seoul berikutnya? Kalau begitu, kejar. Madrid biar kami yang jaga.",
        textIdMix: "You saved Carlos. Itu lebih berarti daripada a stone. Seoul is next? Kalau begitu go for it. Madrid biar kami yang jaga.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Does it? London. Madrid. Two city stones already compromised, two still ahead, and three foundation stones waiting at Babel. He told me the math himself: 'The numbers are not in your favor.' He's right about the math. He's right about being ahead. The worst part. His seven thousand walls wasn't wrong as a problem. He's wrong about the solution. But the problem is real. Seoul. He said Seoul. Time to stop being one step behind.)",
        textKo: "(그래? 런던. 마드리드. 도시 수호석 두 개는 이미 위험해졌고, 두 개는 아직 앞에 있고, 바벨에는 기초석 세 개가 기다리고 있어. 직접 수학을 말해줬잖아: '숫자가 유리하지 않아요.' 맞는 말이야. 앞서고 있다는 것도 맞고. 최악인 건. 7천 개의 벽에 대한 그의 말도 문제 자체로는 틀리지 않았어. 해법이 틀린 거야. 하지만 문제는 진짜야. 서울. 서울이라고 했어. 한 발 뒤처지는 건 그만 할 때야.)",
        textEs: "(¿De verdad? Londres. Madrid. Dos piedras de ciudad ya comprometidas, dos aún por delante, y tres piedras de cimiento esperando en Babel. Me dijo los números él mismo: 'Los números no están a tu favor.' Tiene razón con las matemáticas. Tiene razón en ir adelante. Lo peor. Siete mil muros no era un problema equivocado. Se equivoca en la solución. Pero el problema es real. Seúl. Dijo Seúl. Hora de dejar de ir un paso atrás.)",
        textId: "(Benarkah? London. Madrid. Dua batu kota sudah jatuh, dua lagi masih di depan, dan tiga batu fondasi menanti di Babel. Dia sendiri yang memberitahuku hitungannya: 'Angka-angkanya tidak berpihak padamu.' Dia benar soal hitungan itu. Dia benar soal berada selangkah di depan. Bagian terburuknya. Tujuh ribu temboknya tidak salah sebagai sebuah masalah. Dia salah soal solusinya. Tapi masalahnya nyata. Seoul. Dia bilang Seoul. Saatnya berhenti tertinggal selangkah.)",
      },
    ],
  },

  /* ════════════════ CHAPTER 3: SEOUL ════════════════ */
  seoul: {
    id: "seoul",
    title: "The Seoul Secret",
    titleKo: "서울의 비밀",
    titleId: "Rahasia Seoul",
    titleEs: "El Secreto de Seúl",
    gradient: ["#1a0a05", "#2c1810", "#1a0a05"],
    accentColor: C.gold,
    nextChapterId: "cairo",
    /* ── Language Ratio: 70% targetLang / 30% nativeLang ──────────────────────
     * CEFR A2 — elementary. User has completed Day 1-30.
     * NPC dialogue should be MOSTLY targetLang with some nativeLang scaffolding.
     * textKoMix/textEsMix are authored on every NPC dialogue line: mostly English
     * (targetLang) with the native language kept only for the hardest vocabulary
     * and the emotional/plot beats. Narration (isNarration) stays 100% native.
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
        "Ch3 dialogue is ~70% English (targetLang) / ~30% native. " +
        "textKoMix/textEsMix lead in English and keep native only for harder " +
        "phrases and emotional beats; narration stays 100% native.",
    },
    characters: [
      {
        id: "lingo",
        emoji: "🦊",
        name: "Detective Rudy",
        nameKo: "루디 탐정",
        nameId: "Detektif Rudy",
        side: "left",
        avatarBg: "#2c1810",
        isLingo: true,
        portrait: rudyStoryImg,
        portraitVariants: rudyExpressionSprites,
      },
      {
        id: "sujin",
        emoji: "👩‍🔬",
        name: "Sujin",
        nameKo: "수진",
        nameId: "Sujin",
        side: "right",
        avatarBg: "#1A2A3A",
      },
      {
        id: "minho",
        emoji: "🎤",
        name: "Minho",
        nameKo: "민호",
        nameId: "Minho",
        side: "right",
        avatarBg: "#2A1A3A",
      },
      {
        id: "youngsook",
        emoji: "👵",
        name: "Grandma Youngsook",
        nameKo: "영숙 할머니",
        nameId: "Nenek Youngsook",
        side: "left",
        avatarBg: "#2A2A1A",
      },
      {
        id: "mr_black",
        emoji: "🕴️",
        name: "Mr. Black",
        nameKo: "미스터 블랙",
        nameId: "Mr. Black",
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
        textId: "(Bandara Internasional Incheon. Pukul 06.15 pagi. Pesawat mendarat. Rudy meraih ponselnya untuk menelepon Sujin, ahli bahasa yang setuju membantu. Layar mati. Kaca hitam. Pengisi dayanya tertinggal di kamar hotel di Madrid. Tentu saja.)",
        textEs: "(Aeropuerto Internacional de Incheon. 6:15 AM. El avión aterriza. Rudy busca su teléfono para llamar a Sujin, la lingüista que aceptó ayudar. Pantalla muerta. Cristal negro. El cargador está en una habitación de hotel en Madrid. Por supuesto.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Alright, partner. Confidence level: historically low. Phone is dead. Charger is in Madrid because apparently I pack like a disaster. I need to find Sujin, she is a linguist, Eleanor's contact in Seoul. But first I need to survive this airport using nothing but the Korean we learned in the last thirty days. No pressure.",
        textKo: "좋아, 파트너. 자신감 레벨: 역대 최저. 핸드폰이 죽었어. 충전기는 마드리드에 있어, 왜냐면 나는 재앙처럼 짐을 싸니까. 수진을 찾아야 해, 엘리너의 서울 연락책인 언어학자야. 하지만 먼저 지난 30일 동안 배운 한국어만으로 이 공항에서 살아남아야 해. 부담 없지.",
        textId: "Oke, partner. Tingkat percaya diri: terendah sepanjang sejarah. Ponsel mati. Pengisi dayanya di Madrid karena ternyata aku mengemas barang seperti bencana. Aku harus menemukan Sujin, ahli bahasa, kontak Eleanor di Seoul. Tapi pertama-tama aku harus bertahan hidup di bandara ini hanya dengan bahasa Korea yang kupelajari dalam tiga puluh hari terakhir. Santai saja.",
        textKoMix: "Alright, partner. Confidence level: historically low. Phone is dead. Charger is in Madrid 왜냐면 나는 재앙처럼 짐을 싸니까. I need to find Sujin, she is a linguist, Eleanor's contact in Seoul. But first I need to survive this airport 지난 30일 동안 배운 한국어만으로. No pressure.",
        textIdMix: "Alright, partner. Confidence level: historically low. Phone is dead. Charger is in Madrid karena ternyata aku mengemas barang seperti bencana. I need to find Sujin, she is a linguist, Eleanor's contact in Seoul. But first I need to survive this airport hanya dengan bahasa Korea yang kupelajari dalam 30 hari terakhir. No pressure.",
        textEs: "Bien, compañero. Nivel de confianza: históricamente bajo. El teléfono está muerto. El cargador está en Madrid porque aparentemente empaco como un desastre. Necesito encontrar a Sujin, es lingüista, el contacto de Eleanor en Seúl. Pero primero necesito sobrevivir en este aeropuerto usando solo el coreano que aprendimos en los últimos treinta días. Sin presión.",
        textEsMix: "Alright, partner. Confidence level: historically low. Phone is dead. Charger is in Madrid porque aparentemente empaco como un desastre. I need to find Sujin, she is a linguist, Eleanor's contact in Seoul. But first I need to survive this airport con solo el coreano que aprendimos en los últimos treinta días. No pressure.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Korean signs everywhere. Exit, subway, bus, taxi. No English in sight. The airport staff are busy. You need to read the signs and match words to find your way out. Madrid taught you one thing: words are survival tools. Use them.)",
        textKo: "(사방에 한국어 표지판. 출구, 지하철, 버스, 택시. 영어는 안 보인다. 공항 직원들은 바쁘다. 표지판을 읽고 단어를 매칭해서 나가는 길을 찾아야 한다. 마드리드에서 배운 것 하나: 단어는 생존 도구다. 써먹자.)",
        textId: "(Papan tanda berbahasa Korea di mana-mana. Pintu keluar, kereta bawah tanah, bus, taksi. Tak ada bahasa Inggris yang terlihat. Petugas bandara sibuk. Kamu harus membaca papan tanda dan mencocokkan kata untuk menemukan jalan keluar. Madrid mengajarimu satu hal: kata adalah alat bertahan hidup. Gunakan.)",
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
            word: { en: "exit", ko: "출구", es: "salida", id: "pintu keluar" },
            meaning: { en: "the way out of a building", ko: "건물에서 나가는 길", es: "el camino para salir de un edificio", id: "jalan keluar dari sebuah gedung" },
            wrong: [
              { en: "a place to eat food", ko: "음식을 먹는 장소", es: "un lugar para comer", id: "tempat untuk makan" },
              { en: "an office for work", ko: "일하는 사무실", es: "una oficina para trabajar", id: "kantor untuk bekerja" },
              { en: "a place to sleep", ko: "잠을 자는 곳", es: "un lugar para dormir", id: "tempat untuk tidur" },
            ],
          },
          {
            word: { en: "subway station", ko: "지하철역", es: "estación de metro", id: "stasiun kereta bawah tanah" },
            meaning: { en: "an underground train stop in the city", ko: "도시의 지하 기차 정거장", es: "una parada de tren subterráneo en la ciudad", id: "perhentian kereta bawah tanah di kota" },
            wrong: [
              { en: "a type of restaurant", ko: "식당의 종류", es: "un tipo de restaurante", id: "jenis restoran" },
              { en: "a secret laboratory", ko: "비밀 연구실", es: "un laboratorio secreto", id: "laboratorium rahasia" },
              { en: "an office building", ko: "사무실 건물", es: "un edificio de oficinas", id: "gedung perkantoran" },
            ],
          },
          {
            word: { en: "taxi", ko: "택시", es: "taxi", id: "taksi" },
            meaning: { en: "a car you pay to take you somewhere", ko: "어딘가에 데려다 주는 대가로 돈을 내는 차", es: "un coche que pagas para que te lleve a algún lugar", id: "mobil yang kamu bayar untuk mengantarmu ke suatu tempat" },
            wrong: [
              { en: "a type of food", ko: "음식의 종류", es: "un tipo de comida", id: "jenis makanan" },
              { en: "a walking path", ko: "산책로", es: "un camino para caminar", id: "jalur untuk berjalan kaki" },
              { en: "a meeting room", ko: "회의실", es: "una sala de reuniones", id: "ruang rapat" },
            ],
          },
          {
            word: { en: "excuse me", ko: "실례합니다", es: "disculpe", id: "permisi" },
            meaning: { en: "a polite way to get someone's attention", ko: "정중하게 누군가의 관심을 끄는 말", es: "una forma educada de llamar la atención de alguien", id: "cara sopan untuk menarik perhatian seseorang" },
            wrong: [
              { en: "a way to say goodbye", ko: "작별 인사", es: "una forma de despedirse", id: "ucapan perpisahan" },
              { en: "an expression of anger", ko: "화를 내는 표현", es: "una expresión de enfado", id: "ungkapan kemarahan" },
              { en: "a word meaning delicious", ko: "맛있다는 뜻의 단어", es: "una palabra que significa delicioso", id: "kata yang berarti lezat" },
            ],
          },
        ],
        hints: {
          h1: { ko: "공항 표지판을 읽어야 해 — 출구, 교통, 예의 표현을 생각해봐", en: "You need to read airport signs — think about exits, transport, and polite phrases", es: "Necesitas leer carteles del aeropuerto — piensa en salidas, transporte y frases de cortesía", id: "Kamu harus membaca papan tanda bandara — pikirkan pintu keluar, transportasi, dan ungkapan sopan" },
          h2: {
            ko: "exit은 나가는 곳, subway station은 기차 정거장, taxi는 유료 차, excuse me는 정중한 표현",
            en: "Exit is the way out, subway station is a train stop, taxi is a paid car, excuse me is polite",
            es: "Exit es la salida, subway station es parada de tren, taxi es coche de pago, excuse me es educado",
            id: "Exit adalah jalan keluar, subway station adalah perhentian kereta, taxi adalah mobil berbayar, excuse me itu sopan",
            byLearning: {
              korean: { ko: "출구는 나가는 곳, 지하철역은 기차 정거장, 택시는 유료 차, 실례합니다는 정중한 표현", en: "'출구' is the way out, '지하철역' is a train stop, '택시' is a paid car, '실례합니다' is polite", es: "'출구' es la salida, '지하철역' es parada de tren, '택시' es coche de pago, '실례합니다' es educado", id: "'출구' adalah jalan keluar, '지하철역' adalah perhentian kereta, '택시' adalah mobil berbayar, '실례합니다' itu sopan" },
              spanish: { ko: "salida는 나가는 곳, estación de metro는 기차 정거장, taxi는 유료 차, disculpe는 정중한 표현", en: "'Salida' is the way out, 'estación de metro' is a train stop, 'taxi' is a paid car, 'disculpe' is polite", es: "Salida es la salida, estación de metro es parada de tren, taxi es coche de pago, disculpe es educado", id: "'salida' adalah jalan keluar, 'estación de metro' adalah perhentian kereta, 'taxi' adalah mobil berbayar, 'disculpe' itu sopan" },
              english: { ko: "exit은 나가는 곳, subway station은 기차 정거장, taxi는 유료 차, excuse me는 정중한 표현", en: "'Exit' is the way out, 'subway station' is a train stop, 'taxi' is a paid car, 'excuse me' is polite", es: "'Exit' es la salida, 'subway station' es parada de tren, 'taxi' es coche de pago, 'excuse me' es educado", id: "'Exit' adalah jalan keluar, 'subway station' adalah perhentian kereta, 'taxi' adalah mobil berbayar, 'excuse me' itu sopan" },
              indonesian: { ko: "pintu keluar는 나가는 곳, stasiun kereta bawah tanah는 기차 정거장, taksi는 유료 차, permisi는 정중한 표현", en: "'Pintu keluar' is the way out, 'stasiun kereta bawah tanah' is a train stop, 'taksi' is a paid car, 'permisi' is polite", es: "'Pintu keluar' es la salida, 'stasiun kereta bawah tanah' es parada de tren, 'taksi' es coche de pago, 'permisi' es educado", id: "'Pintu keluar' adalah jalan keluar, 'stasiun kereta bawah tanah' adalah perhentian kereta, 'taksi' adalah mobil berbayar, 'permisi' itu sopan" },
            },
          },
          h3: {
            ko: "exit=나가는 곳 / subway station=기차 정거장 / taxi=유료 차 / excuse me=정중한 표현",
            en: "exit=way out / subway station=underground train / taxi=car for hire / excuse me=polite attention",
            es: "exit=salida / subway station=tren subterráneo / taxi=coche de alquiler / excuse me=atención educada",
            id: "exit=jalan keluar / subway station=kereta bawah tanah / taxi=mobil sewaan / excuse me=perhatian sopan",
            byLearning: {
              korean: { ko: "출구=나가는 곳 / 지하철역=기차 정거장 / 택시=유료 차 / 실례합니다=정중한 표현", en: "출구=way out / 지하철역=underground train / 택시=car for hire / 실례합니다=polite attention", es: "출구=salida / 지하철역=tren subterráneo / 택시=coche de alquiler / 실례합니다=atención educada", id: "출구=jalan keluar / 지하철역=kereta bawah tanah / 택시=mobil sewaan / 실례합니다=perhatian sopan" },
              spanish: { ko: "salida=나가는 곳 / estación de metro=기차 정거장 / taxi=유료 차 / disculpe=정중한 표현", en: "salida=way out / estación de metro=underground train / taxi=car for hire / disculpe=polite attention", es: "salida=salida / estación de metro=tren subterráneo / taxi=coche de alquiler / disculpe=atención educada", id: "salida=jalan keluar / estación de metro=kereta bawah tanah / taxi=mobil sewaan / disculpe=perhatian sopan" },
              english: { ko: "exit=나가는 곳 / subway station=기차 정거장 / taxi=유료 차 / excuse me=정중한 표현", en: "exit=way out / subway station=underground train / taxi=car for hire / excuse me=polite attention", es: "exit=salida / subway station=tren subterráneo / taxi=coche de alquiler / excuse me=atención educada", id: "exit=jalan keluar / subway station=kereta bawah tanah / taxi=mobil sewaan / excuse me=perhatian sopan" },
              indonesian: { ko: "pintu keluar=나가는 곳 / stasiun kereta bawah tanah=기차 정거장 / taksi=유료 차 / permisi=정중한 표현", en: "pintu keluar=way out / stasiun kereta bawah tanah=underground train / taksi=car for hire / permisi=polite attention", es: "pintu keluar=salida / stasiun kereta bawah tanah=tren subterráneo / taksi=coche de alquiler / permisi=atención educada", id: "pintu keluar=jalan keluar / stasiun kereta bawah tanah=kereta bawah tanah / taksi=mobil sewaan / permisi=perhatian sopan" },
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
        textId: "(Di luar bandara. Rudy berdiri di tempat antrean taksi, mencoba membaca peta berbahasa Korea. Seorang pemuda bertopi bucket dan berjaket kebesaran menghampiri sambil nyengir. Ia sudah tertawa bahkan sebelum berbicara.)",
        textEs: "(Fuera del aeropuerto. Rudy está en la parada de taxis, intentando leer un mapa en coreano. Un joven con gorro de pescador y chaqueta enorme se acerca, sonriendo. Ya se está riendo antes de hablar.)",
      },
      {
        kind: "scene",
        charId: "minho",
        text: "Bro. BRO. Did you just say '주세요' like '주세용'? That is SO not how you say it. I am dying. You sound like a robot that learned Korean from a microwave manual. I am Minho. Sujin told me to come get you. She is busy at the lab.",
        textKo: "야. 야야. 방금 '주세요'를 '주세용'이라고 했어? 그렇게 말하는 거 아닌데. 죽겠다 진짜. 전자레인지 설명서로 한국어 배운 로봇 같아. 나 민호. 수진 누나가 데리러 오라고 했어. 누나는 연구실에서 바빠.",
        textId: "Bro. BRO. Kamu barusan bilang '주세요' jadi '주세용'? Bukan begitu cara ngomongnya. Aku ngakak parah. Kamu kayak robot yang belajar bahasa Korea dari buku manual microwave. Aku Minho. Kak Sujin nyuruh aku jemput kamu. Dia lagi sibuk di lab.",
        textKoMix: "Bro. BRO. 방금 '주세요'를 '주세용'이라고 했어? That is SO not how you say it. 죽겠다 진짜. You sound like a robot that learned Korean from a microwave manual. I am Minho. Sujin told me to come get you. 누나는 연구실에서 바빠.",
        textIdMix: "Bro. BRO. Kamu barusan bilang '주세요' jadi '주세용'? That is SO not how you say it. Aku ngakak parah. You sound like a robot that learned Korean from a microwave manual. I am Minho. Sujin told me to come get you. Dia lagi sibuk di lab.",
        textEs: "Tío. TÍO. ¿Acabas de decir '주세요' como '주세용'? ¡Así NO se dice! Me muero. Suenas como un robot que aprendió coreano de un manual de microondas. Soy Minho. Sujin me dijo que viniera a buscarte. Ella está ocupada en el laboratorio.",
        textEsMix: "Bro. BRO. ¿Acabas de decir '주세요' como '주세용'? That is SO not how you say it. Me muero. You sound like a robot that learned Korean from a microwave manual. I am Minho. Sujin told me to come get you. Ella está ocupada en el laboratorio.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Great. My pronunciation is so bad that a stranger is having a medical event. You must be Minho, Sujin's friend?",
        textKo: "좋아. 내 발음이 너무 안 좋아서 모르는 사람이 의료 사태를 겪고 있어. 민호지, 수진의 친구?",
        textId: "Bagus. Pengucapanku begitu buruk sampai orang asing mengalami keadaan darurat medis. Kamu pasti Minho, teman Sujin?",
        textKoMix: "Great. My pronunciation is so bad 모르는 사람이 의료 사태를 겪고 있어. You must be Minho, Sujin's friend?",
        textIdMix: "Great. My pronunciation is so bad sampai orang asing mengalami keadaan darurat medis. You must be Minho, Sujin's friend?",
        textEs: "Genial. Mi pronunciación es tan mala que un desconocido está teniendo una emergencia médica. ¿Debes ser Minho, el amigo de Sujin?",
        textEsMix: "Great. My pronunciation is so bad que un desconocido está teniendo una emergencia médica. You must be Minho, Sujin's friend?",
      },
      {
        kind: "scene",
        charId: "minho",
        text: "Friend? Nah, I am her little brother's best friend. Basically family. OK listen, your Korean needs emergency surgery. Let me teach you how to actually say things so people don't run away from you. First rule: in Korea, you MUST greet people right. Watch.",
        textKo: "친구? 아니, 수진 누나 남동생 절친이야. 거의 가족. 자 들어봐, 네 한국어는 응급 수술이 필요해. 사람들이 도망 안 가게 제대로 말하는 법 알려줄게. 첫 번째 규칙: 한국에서는 반드시 인사를 제대로 해야 해. 봐봐.",
        textId: "Teman? Bukan, aku sahabat adik laki-lakinya Kak Sujin. Praktis keluarga. Oke dengar, bahasa Korea-mu butuh operasi darurat. Biar kuajari cara ngomong yang benar supaya orang tidak kabur darimu. Aturan pertama: di Korea, kamu WAJIB menyapa orang dengan benar. Perhatikan.",
        textKoMix: "Friend? Nah, I am her little brother's best friend. Basically family. OK listen, your Korean needs emergency surgery. 사람들이 도망 안 가게 제대로 말하는 법 알려줄게. First rule: 한국에서는 반드시 인사를 제대로 해야 해. Watch.",
        textIdMix: "Friend? Nah, I am her little brother's best friend. Basically family. OK listen, your Korean needs emergency surgery. Biar kuajari cara ngomong yang benar supaya orang tidak kabur darimu. First rule: di Korea, kamu WAJIB menyapa orang dengan benar. Watch.",
        textEs: "¿Amigo? No, soy el mejor amigo de su hermano menor. Básicamente familia. OK escucha, tu coreano necesita cirugía de emergencia. Déjame enseñarte cómo decir las cosas para que la gente no huya de ti. Primera regla: en Corea, DEBES saludar correctamente. Mira.",
        textEsMix: "Friend? Nah, I am her little brother's best friend. Basically family. OK listen, your Korean needs emergency surgery. Déjame enseñarte cómo decir las cosas para que la gente no huya de ti. First rule: en Corea, DEBES saludar correctamente. Watch.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Minho is loud, confident, and speaks in a mix of Korean slang and English. He wears his personality like his oversized jacket, big and impossible to ignore. He is already teaching you before you agreed to learn. Pick the right responses to his language lessons.)",
        textKo: "(민호는 시끄럽고, 자신만만하고, 한국어 속어와 영어를 섞어 말한다. 그의 성격은 오버사이즈 재킷처럼, 크고 무시할 수 없다. 배우겠다고 동의하기도 전에 이미 가르치고 있다. 그의 언어 수업에 올바른 답을 골라봐.)",
        textId: "(Minho berisik, percaya diri, dan berbicara dalam campuran bahasa gaul Korea dan Inggris. Kepribadiannya seperti jaketnya yang kebesaran, besar dan mustahil diabaikan. Ia sudah mengajarimu bahkan sebelum kamu setuju untuk belajar. Pilih jawaban yang tepat untuk pelajaran bahasanya.)",
        textEs: "(Minho es ruidoso, seguro de sí mismo y habla en una mezcla de argot coreano e inglés. Lleva su personalidad como su chaqueta enorme, grande e imposible de ignorar. Ya te está enseñando antes de que aceptaras aprender. Elige las respuestas correctas a sus lecciones.)",
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
            prompt: { en: "Minho asks: 'You want to find Sujin, right? How do you ask a taxi driver to go somewhere?'", ko: "민호가 묻는다: '수진 누나 찾으려고? 택시 기사한테 어디 간다고 어떻게 말해?'", es: "Minho pregunta: '¿Quieres encontrar a Sujin, verdad? ¿Cómo le dices a un taxista que te lleve a algún sitio?'", id: "Minho bertanya: 'Mau cari Kak Sujin, kan? Bagaimana kamu minta sopir taksi mengantarmu ke suatu tempat?'" },
            context: { en: "Minho: 'In Seoul, you don't just point. You speak. Try it.'", ko: "민호: '서울에서는 가리키기만 하면 안 돼. 말해야 해. 해봐.'", es: "Minho: 'En Seúl, no solo señales. Hablas. Inténtalo.'", id: "Minho: 'Di Seoul, jangan cuma menunjuk. Kamu harus bicara. Coba.'" },
            answer: { en: "Excuse me. Please go to Namsan, please. How much is it?", ko: "실례합니다. 남산으로 가 주세요. 얼마예요?", es: "Disculpe. Lléveme a Namsan, por favor. ¿Cuánto cuesta?", id: "Permisi. Tolong antar ke Namsan. Berapa harganya?" },
            wrong: [
              { en: "Goodbye! Namsan! Fast! Sorry!", ko: "안녕히 계세요! 남산! 빨리! 죄송합니다!", es: "¡Adiós! ¡Namsan! ¡Rápido! ¡Perdón!", id: "Selamat tinggal! Namsan! Cepat! Maaf!" },
              { en: "Hello, my name is Rudy. Where is Namsan?", ko: "안녕하세요, 제 이름은 루디예요. 남산이 어디예요?", es: "Hola, me llamo Rudy. ¿Dónde está Namsan?", id: "Halo, nama saya Rudy. Di mana Namsan?" },
            ],
          },
          {
            prompt: { en: "Minho tests you: 'OK, we arrive. Sujin's building has a code. The guard asks who you are. What do you say?'", ko: "민호가 테스트한다: 'OK, 도착했어. 수진 누나 건물에 비밀번호가 있어. 경비원이 누구냐고 물어. 뭐라고 해?'", es: "Minho te prueba: 'OK, llegamos. El edificio de Sujin tiene código. El guardia pregunta quién eres. ¿Qué dices?'", id: "Minho mengujimu: 'OK, kita sampai. Gedung Kak Sujin punya kode. Penjaga bertanya kamu siapa. Apa jawabanmu?'" },
            context: { en: "Minho: 'The guard speaks zero English. Full Korean mode. Go.'", ko: "민호: '경비 아저씨 영어 하나도 몰라. 풀 한국어 모드. 가.'", es: "Minho: 'El guardia no habla nada de inglés. Modo coreano total. Vamos.'", id: "Minho: 'Pak penjaga tidak bisa bahasa Inggris sama sekali. Mode bahasa Korea penuh. Ayo.'" },
            answer: { en: "Hello. My name is Rudy. I am looking for Sujin. I am her friend.", ko: "안녕하세요. 제 이름은 루디예요. 수진을 찾고 있어요. 친구예요.", es: "Hola. Me llamo Rudy. Busco a Sujin. Soy su amigo.", id: "Halo. Nama saya Rudy. Saya mencari Sujin. Saya temannya." },
            wrong: [
              { en: "Open the door! I need help! Where is the exit?", ko: "문 열어요! 도와주세요! 출구가 어디예요?", es: "¡Abra la puerta! ¡Necesito ayuda! ¿Dónde está la salida?", id: "Buka pintunya! Tolong saya! Di mana pintu keluar?" },
              { en: "Goodbye. Thank you. See you tomorrow.", ko: "안녕히 계세요. 감사합니다. 내일 봐요.", es: "Adiós. Gracias. Hasta mañana.", id: "Selamat tinggal. Terima kasih. Sampai jumpa besok." },
            ],
          },
        ],
        hints: {
          h1: {
            ko: "택시에서는 장소 + please + 가격을 물어야 해. 경비원에게는 자기소개를 해야 해",
            en: "In a taxi, use place + please + ask the price. For the guard, introduce yourself",
            es: "En un taxi, usa lugar + please + pregunta el precio. Al guardia, preséntate",
            id: "Di taksi, gunakan tempat + please + tanyakan harganya. Pada penjaga, perkenalkan dirimu",
            byLearning: {
              korean: { ko: "택시에서는 장소 + 주세요 + 가격을 물어야 해. 경비원에게는 자기소개를 해야 해", en: "In a taxi, use place + 주세요 + ask the price. For the guard, introduce yourself", es: "En un taxi, usa lugar + 주세요 + pregunta el precio. Al guardia, preséntate", id: "Di taksi, gunakan tempat + 주세요 + tanyakan harganya. Pada penjaga, perkenalkan dirimu" },
              spanish: { ko: "택시에서는 장소 + por favor + 가격을 물어야 해. 경비원에게는 자기소개를 해야 해", en: "In a taxi, use place + por favor + ask the price. For the guard, introduce yourself", es: "En un taxi, usa lugar + por favor + pregunta el precio. Al guardia, preséntate", id: "Di taksi, gunakan tempat + por favor + tanyakan harganya. Pada penjaga, perkenalkan dirimu" },
              english: { ko: "택시에서는 장소 + please + 가격을 물어야 해. 경비원에게는 자기소개를 해야 해", en: "In a taxi, use place + please + ask the price. For the guard, introduce yourself", es: "En un taxi, usa lugar + please + pregunta el precio. Al guardia, preséntate", id: "Di taksi, gunakan tempat + please + tanyakan harganya. Pada penjaga, perkenalkan dirimu" },
              indonesian: { ko: "택시에서는 장소 + tolong + 가격을 물어야 해. 경비원에게는 자기소개를 해야 해", en: "In a taxi, use place + tolong + ask the price. For the guard, introduce yourself", es: "En un taxi, usa lugar + tolong + pregunta el precio. Al guardia, preséntate", id: "Di taksi, gunakan tempat + tolong + tanyakan harganya. Pada penjaga, perkenalkan dirimu" },
            },
          },
          h2: {
            ko: "Excuse me로 시작, 장소 + please go, 그리고 How much? / Hello + 이름 + 찾는 사람",
            en: "Start with Excuse me, place + please go, and How much? / Hello + name + person you seek",
            es: "Empieza con Excuse me, lugar + please go, y How much? / Hello + nombre + a quién buscas",
            id: "Mulai dengan Excuse me, tempat + please go, lalu How much? / Hello + nama + orang yang dicari",
            byLearning: {
              korean: { ko: "실례합니다로 시작, 장소 + 가 주세요, 그리고 얼마예요? / 안녕하세요 + 이름 + 찾는 사람", en: "Start with 실례합니다, place + 가 주세요, and 얼마예요? / 안녕하세요 + name + person you seek", es: "Empieza con 실례합니다, lugar + 가 주세요, y 얼마예요? / 안녕하세요 + nombre + a quién buscas", id: "Mulai dengan 실례합니다, tempat + 가 주세요, lalu 얼마예요? / 안녕하세요 + nama + orang yang dicari" },
              spanish: { ko: "Disculpe로 시작, 장소 + por favor, 그리고 ¿Cuánto cuesta? / Hola + 이름 + 찾는 사람", en: "Start with Disculpe, place + por favor, and ¿Cuánto cuesta? / Hola + name + person you seek", es: "Empieza con Disculpe, lugar + por favor, y ¿Cuánto cuesta? / Hola + nombre + a quién buscas", id: "Mulai dengan Disculpe, tempat + por favor, lalu ¿Cuánto cuesta? / Hola + nama + orang yang dicari" },
              english: { ko: "Excuse me로 시작, 장소 + please go, 그리고 How much? / Hello + 이름 + 찾는 사람", en: "Start with Excuse me, place + please go, and How much? / Hello + name + person you seek", es: "Empieza con Excuse me, lugar + please go, y How much? / Hello + nombre + a quién buscas", id: "Mulai dengan Excuse me, tempat + please go, lalu How much? / Hello + nama + orang yang dicari" },
              indonesian: { ko: "Permisi로 시작, 장소 + tolong antar, 그리고 Berapa harganya? / Halo + 이름 + 찾는 사람", en: "Start with Permisi, place + tolong antar, and Berapa harganya? / Halo + name + person you seek", es: "Empieza con Permisi, lugar + tolong antar, y Berapa harganya? / Halo + nombre + a quién buscas", id: "Mulai dengan Permisi, tempat + tolong antar, lalu Berapa harganya? / Halo + nama + orang yang dicari" },
            },
          },
          h3: {
            ko: "Q1: Excuse me + go to Namsan please + how much / Q2: Hello + name + looking for Sujin + friend",
            en: "Q1: Excuse me + go to Namsan please + how much / Q2: Hello + name + looking for Sujin + friend",
            es: "P1: Excuse me + go to Namsan please + how much / P2: Hello + nombre + looking for Sujin + friend",
            id: "S1: Excuse me + go to Namsan please + how much / S2: Hello + name + looking for Sujin + friend",
            byLearning: {
              korean: { ko: "Q1: 실례합니다 + 남산으로 가 주세요 + 얼마예요 / Q2: 안녕하세요 + 이름 + 수진 + 친구", en: "Q1: 실례합니다 + 남산으로 가 주세요 + 얼마예요 / Q2: 안녕하세요 + name + 수진 + 친구", es: "P1: 실례합니다 + 남산 주세요 + 얼마예요 / P2: 안녕하세요 + nombre + 수진 + 친구", id: "S1: 실례합니다 + 남산으로 가 주세요 + 얼마예요 / S2: 안녕하세요 + nama + 수진 + teman" },
              spanish: { ko: "Q1: Disculpe + Namsan por favor + cuánto / Q2: Hola + 이름 + Sujin + amigo", en: "Q1: Disculpe + Namsan por favor + cuánto / Q2: Hola + name + Sujin + amigo", es: "P1: Disculpe + Namsan por favor + cuánto / P2: Hola + nombre + busco Sujin + amigo", id: "S1: Disculpe + Namsan por favor + cuánto / S2: Hola + nama + Sujin + teman" },
              english: { ko: "Q1: Excuse me + go to Namsan please + how much / Q2: Hello + 이름 + looking for Sujin + friend", en: "Q1: Excuse me + go to Namsan please + how much / Q2: Hello + name + looking for Sujin + friend", es: "P1: Excuse me + go to Namsan please + how much / P2: Hello + nombre + looking for Sujin + friend", id: "S1: Excuse me + go to Namsan please + how much / S2: Hello + nama + looking for Sujin + friend" },
              indonesian: { ko: "Q1: Permisi + tolong antar ke Namsan + berapa harganya / Q2: Halo + 이름 + mencari Sujin + teman", en: "Q1: Permisi + tolong antar ke Namsan + berapa harganya / Q2: Halo + name + mencari Sujin + teman", es: "P1: Permisi + tolong antar ke Namsan + berapa harganya / P2: Halo + nombre + mencari Sujin + teman", id: "S1: Permisi + tolong antar ke Namsan + berapa harganya / S2: Halo + nama + mencari Sujin + teman" },
            },
          },
        },
      },
      {
        kind: "scene",
        charId: "minho",
        text: "Not bad! Not bad at all! OK your accent is still like a cat in a washing machine but the WORDS are right. That is what matters. Sujin is going to be impressed. Maybe. Probably not. But I am!",
        textKo: "나쁘지 않아! 전혀 나쁘지 않아! 억양은 아직 세탁기에 들어간 고양이 같지만 단어는 맞아. 그게 중요한 거야. 수진 누나가 감동할 거야. 아마. 아닐 수도. 근데 나는 감동했어!",
        textId: "Lumayan! Lumayan banget! Oke aksenmu masih seperti kucing di dalam mesin cuci tapi KATA-KATANYA benar. Itu yang penting. Kak Sujin pasti terkesan. Mungkin. Mungkin juga tidak. Tapi aku terkesan!",
        textKoMix: "Not bad! Not bad at all! OK your accent is still like a cat in a washing machine but the WORDS are right. That is what matters. Sujin is going to be impressed. 아마. 아닐 수도. But I am!",
        textIdMix: "Not bad! Not bad at all! OK your accent is still like a cat in a washing machine but the WORDS are right. That is what matters. Sujin is going to be impressed. Mungkin. Mungkin juga tidak. But I am!",
        textEs: "¡Nada mal! ¡Nada mal para nada! OK tu acento sigue siendo como un gato en una lavadora pero las PALABRAS están bien. Eso es lo que importa. Sujin va a estar impresionada. Quizá. Probablemente no. ¡Pero yo sí!",
        textEsMix: "Not bad! Not bad at all! OK your accent is still like a cat in a washing machine but the WORDS are right. That is what matters. Sujin is going to be impressed. Quizá. Probablemente no. But I am!",
        idiomRef: "idiom_minho_1",
      },
      {
        kind: "clue",
        symbol: "🎤",
        titleEn: "Investigation Notes: Korean Street Talk",
        titleKo: "수사 노트: 한국 길거리 표현",
        titleId: "Catatan Investigasi: Bahasa Jalanan Korea",
        titleEs: "Notas de Investigación: Expresiones Callejeras Coreanas",
        descEn: "Minho's trendy expressions: JMT (존맛탱, 'crazy delicious,' from internet slang). In English: 'That's fire!' In Spanish: '¡Está brutal!' Korean youth culture compresses entire feelings into three letters. Language evolves fastest on the street.",
        descKo: "민호의 트렌디한 표현: JMT (존맛탱, 인터넷 슬랭에서 유래). 영어로는: 'That's fire!' 스페인어로는: '¡Está brutal!' 한국 청년 문화는 감정 전체를 세 글자로 압축한다. 언어는 길거리에서 가장 빠르게 진화한다.",
        descId: "Ungkapan kekinian Minho: JMT (존맛탱, 'enak banget,' dari bahasa gaul internet). Dalam bahasa Inggris: 'That's fire!' Dalam bahasa Spanyol: '¡Está brutal!' Budaya anak muda Korea memampatkan seluruh perasaan menjadi tiga huruf. Bahasa berevolusi paling cepat di jalanan.",
        descEs: "Las expresiones de moda de Minho: JMT (존맛탱, 'locamente delicioso,' del argot de internet). En inglés: 'That is fire!' En español: '¡Está brutal!' La cultura juvenil coreana comprime sentimientos enteros en tres letras. El lenguaje evoluciona más rápido en la calle.",
      },
      // ── Scene 3: Grandma Youngsook's Kitchen ───────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Gwangjang Market. Steam rises from every stall. Minho leads Rudy through narrow alleys packed with food vendors. They stop at a small stall where an elderly woman in an apron stirs a massive pot. Her hands move with forty years of practice. This is Grandma Youngsook, Sujin's grandmother.)",
        textKo: "(광장시장. 모든 가판대에서 김이 올라온다. 민호가 루디를 음식 상인으로 가득 찬 좁은 골목으로 안내한다. 앞치마를 입은 할머니가 거대한 냄비를 저으며 서 있는 작은 가판대에서 멈춘다. 40년의 연습이 담긴 손놀림. 수진의 할머니, 영숙 할머니다.)",
        textId: "(Pasar Gwangjang. Uap mengepul dari setiap kios. Minho menuntun Rudy melewati gang sempit yang penuh pedagang makanan. Mereka berhenti di sebuah kios kecil tempat seorang nenek berapron mengaduk panci raksasa. Tangannya bergerak dengan pengalaman empat puluh tahun. Inilah Nenek Youngsook, nenek Sujin.)",
        textEs: "(Mercado de Gwangjang. El vapor sube de cada puesto. Minho guía a Rudy por callejones estrechos llenos de vendedores de comida. Se detienen en un pequeño puesto donde una anciana con delantal revuelve una olla enorme. Sus manos se mueven con cuarenta años de práctica. Esta es la Abuela Youngsook, la abuela de Sujin.)",
      },
      {
        kind: "scene",
        charId: "youngsook",
        text: "Minho, who is this skinny foreigner? He looks like he hasn't eaten in three countries. Sit down. I will feed you first. In Korea, we don't talk to hungry people. A conversation without rice is like a map without streets.",
        textKo: "민호야, 이 마른 외국인은 누구니? 세 나라를 거치면서 밥을 안 먹은 것 같은데. 앉아. 먼저 밥을 먹여줄게. 한국에서는 배고픈 사람과 대화하지 않아. 밥 없는 대화는 지도 없는 길 같단다.",
        textId: "Minho, siapa orang asing kurus ini? Kelihatannya dia belum makan sejak melewati tiga negara. Duduk. Akan kuberi makan dulu. Di Korea, kita tidak bicara dengan orang yang lapar. Percakapan tanpa nasi itu seperti peta tanpa jalan.",
        textKoMix: "Minho야, who is this skinny foreigner? 세 나라를 거치면서 밥을 안 먹은 것 같은데. Sit down. I will feed you first. 한국에서는 배고픈 사람과 대화하지 않아. A conversation without rice is like a map without streets.",
        textIdMix: "Minho, who is this skinny foreigner? Kelihatannya dia belum makan sejak melewati tiga negara. Sit down. I will feed you first. Di Korea, kita tidak bicara dengan orang yang lapar. A conversation without rice is like a map without streets.",
        textEs: "Minho, ¿quién es este extranjero flaco? Parece que no ha comido en tres países. Siéntate. Te daré de comer primero. En Corea, no hablamos con gente hambrienta. Una conversación sin arroz es como un mapa sin calles.",
        textEsMix: "Minho, who is this skinny foreigner? Parece que no ha comido en tres países. Sit down. I will feed you first. En Corea, no hablamos con gente hambrienta. A conversation without rice is like a map without streets.",
        idiomRef: "idiom_youngsook_1",
      },
      {
        kind: "scene",
        charId: "minho",
        text: "Grandma, this is Rudy. The fox detective. He is here to find the Guardian Stone. But first, Grandma, make him the bibimbap. He NEEDS it. Trust me.",
        textKo: "할머니, 이 사람 루디예요. 여우 탐정. 수호석 찾으러 왔어요. 근데 먼저, 할머니, 비빔밥 해주세요. 이 사람한테 필요해요. 진짜로.",
        textId: "Nek, ini Rudy. Detektif rubah. Dia datang untuk mencari Batu Penjaga. Tapi pertama, Nek, buatkan dia bibimbap. Dia BUTUH itu. Percaya deh.",
        textKoMix: "할머니, this is Rudy. The fox detective. He is here to find the Guardian Stone. But first, 할머니, make him the 비빔밥. He NEEDS it. Trust me.",
        textIdMix: "Nek, this is Rudy. The fox detective. He is here to find the Guardian Stone. But first, Nek, make him the bibimbap. He NEEDS it. Trust me.",
        textEs: "Abuela, este es Rudy. El detective zorro. Está aquí para encontrar la Piedra Guardiana. Pero primero, Abuela, hazle el bibimbap. Lo NECESITA. Créeme.",
        textEsMix: "Abuela, this is Rudy. The fox detective. He is here to find the Guardian Stone. But first, Abuela, hazle el bibimbap. He NEEDS it. Trust me.",
      },
      {
        kind: "scene",
        charId: "youngsook",
        text: "A detective who cannot speak Korean is like a spoon that cannot hold soup. But we can fix that. Eat. Then I teach. Every dish has a story, and every story has words you need.",
        textKo: "한국어 못 하는 탐정은 국을 못 담는 숟가락 같단다. 하지만 고칠 수 있어. 먹어. 그다음 가르쳐줄게. 모든 음식에는 이야기가 있고, 모든 이야기에는 네가 필요한 단어가 있단다.",
        textId: "Detektif yang tak bisa berbahasa Korea itu seperti sendok yang tak bisa menampung sup. Tapi itu bisa diperbaiki. Makan. Lalu aku akan mengajarmu. Setiap hidangan punya cerita, dan setiap cerita punya kata-kata yang kamu butuhkan.",
        textKoMix: "A detective who cannot speak Korean is like a spoon that cannot hold soup. But we can fix that. Eat. 그다음 가르쳐줄게. Every dish has a story, 모든 이야기에는 네가 필요한 단어가 있단다.",
        textIdMix: "A detective who cannot speak Korean is like a spoon that cannot hold soup. But we can fix that. Eat. Lalu aku akan mengajarmu. Every dish has a story, dan setiap cerita punya kata-kata yang kamu butuhkan.",
        textEs: "Un detective que no puede hablar coreano es como una cuchara que no puede sostener sopa. Pero podemos arreglarlo. Come. Luego enseño. Cada plato tiene una historia, y cada historia tiene palabras que necesitas.",
        textEsMix: "A detective who cannot speak Korean is like a spoon that cannot hold soup. But we can fix that. Eat. Luego enseño. Every dish has a story, y cada historia tiene palabras que necesitas.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Youngsook places steaming bowls on the table. Bibimbap, tteokbokki, japchae. She names each dish slowly in Korean, making Rudy repeat after her. She corrects his pronunciation with gentle authority. Food is her classroom. The market is her school.)",
        textKo: "(영숙 할머니가 김이 나는 그릇들을 테이블에 놓는다. 비빔밥, 떡볶이, 잡채. 각 음식 이름을 천천히 한국어로 말하며 루디에게 따라 하게 한다. 부드럽지만 확실하게 발음을 교정한다. 음식이 교실이다. 시장이 학교다.)",
        textId: "(Nenek Youngsook meletakkan mangkuk-mangkuk yang mengepul di atas meja. Bibimbap, tteokbokki, japchae. Ia menyebut tiap nama hidangan perlahan dalam bahasa Korea, menyuruh Rudy menirukan. Ia membetulkan pengucapannya dengan kewibawaan yang lembut. Makanan adalah ruang kelasnya. Pasar adalah sekolahnya.)",
        textEs: "(Youngsook pone cuencos humeantes en la mesa. Bibimbap, tteokbokki, japchae. Nombra cada plato lentamente en coreano, haciendo que Rudy repita. Corrige su pronunciación con amable autoridad. La comida es su aula. El mercado es su escuela.)",
      },
      {
        kind: "clue",
        symbol: "🍚",
        titleEn: "Investigation Notes: Grandma Youngsook's Proverb",
        titleKo: "수사 노트: 영숙 할머니의 속담",
        titleId: "Catatan Investigasi: Peribahasa Nenek Youngsook",
        titleEs: "Notas de Investigación: Proverbio de la Abuela Youngsook",
        descEn: "Youngsook's wisdom: '밥 없는 대화는 지도 없는 길 같단다', 'A conversation without rice is like a map without streets', 'Una conversación sin arroz es como un mapa sin calles.' In Korean culture, sharing food is not separate from communication. It IS communication.",
        descKo: "영숙 할머니의 지혜: '밥 없는 대화는 지도 없는 길 같단다', 한국 문화에서 음식을 나누는 것은 소통과 분리되지 않는다. 그것 자체가 소통이다.",
        descId: "Kebijaksanaan Nenek Youngsook: '밥 없는 대화는 지도 없는 길 같단다', 'Percakapan tanpa nasi itu seperti peta tanpa jalan.' Dalam budaya Korea, berbagi makanan tidak terpisah dari komunikasi. Itu SENDIRI adalah komunikasi.",
        descEs: "La sabiduría de Youngsook: '밥 없는 대화는 지도 없는 길 같단다', 'Una conversación sin arroz es como un mapa sin calles.' En la cultura coreana, compartir comida no está separado de la comunicación. ES comunicación.",
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
        title: { en: "Survive the Airport and Market", ko: "공항과 시장에서 살아남기", es: "Sobrevivir en el Aeropuerto y el Mercado", id: "Bertahan Hidup di Bandara dan Pasar" },
        context: { en: "Phone is dead. No translator. Speak Korean to survive — Youngsook is watching!", ko: "전화가 꺼졌어요. 번역기도 없어요. 살아남으려면 한국어로 말하세요 — 영숙 할머니가 보고 있어요!", es: "El teléfono está muerto. Sin traductor. ¡Habla coreano para sobrevivir — la Abuela Youngsook está mirando!", id: "Ponsel mati. Tidak ada penerjemah. Bicaralah bahasa Korea untuk bertahan — Nenek Youngsook sedang mengawasi!" },
        questions: [
          { word: { en: "Excuse me. Do you speak English?", ko: "실례합니다. 영어 할 줄 아세요?", es: "Disculpe. ¿Habla inglés?", id: "Permisi. Apakah Anda bisa bahasa Inggris?" }, hint: { en: "First check if they speak English", ko: "먼저 영어를 할 줄 아는지 확인하세요", es: "Primero verifica si hablan inglés", id: "Pertama periksa apakah mereka bisa bahasa Inggris" }, acceptableAnswers: ["excuse me do you speak english", "do you speak english", "excuse me. do you speak english"] },
          { word: { en: "This is delicious. Thank you!", ko: "이거 맛있어요. 감사합니다!", es: "¡Esto está delicioso! ¡Gracias!", id: "Ini lezat. Terima kasih!" }, hint: { en: "Compliment Youngsook's cooking", ko: "영숙 할머니의 요리를 칭찬하세요", es: "Elogia la cocina de Youngsook", id: "Pujilah masakan Nenek Youngsook" }, acceptableAnswers: ["this is delicious thank you", "delicious thank you", "this is delicious thanks"] },
          { word: { en: "Where is the subway?", ko: "지하철이 어디예요?", es: "¿Dónde está el metro?", id: "Di mana kereta bawah tanahnya?" }, hint: { en: "Find your way to Namsan", ko: "남산으로 가는 길을 찾으세요", es: "Encuentra tu camino a Namsan", id: "Temukan jalanmu ke Namsan" }, acceptableAnswers: ["where is the subway", "where's the subway", "where is the subway station"] },
        ],
      },
      // ── Scene 4: Meeting Sujin ─────────────────────────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Sujin's linguistics lab. University building near Namsan. Bookshelves from floor to ceiling. Papers in twelve languages pinned to every wall. Sujin sits at a desk covered in ancient manuscripts. She looks up when Rudy enters, sharp eyes, no smile.)",
        textKo: "(수진의 언어학 연구실. 남산 근처 대학 건물. 천장까지 닿는 책장. 열두 개 언어로 된 논문이 벽마다 꽂혀 있다. 수진이 고대 원고로 덮인 책상에 앉아 있다. 루디가 들어오자 고개를 든다, 날카로운 눈, 미소 없음.)",
        textId: "(Laboratorium linguistik Sujin. Gedung universitas dekat Namsan. Rak buku dari lantai hingga langit-langit. Makalah dalam dua belas bahasa tertempel di setiap dinding. Sujin duduk di meja yang penuh naskah kuno. Ia mendongak saat Rudy masuk, mata tajam, tanpa senyum.)",
        textEs: "(El laboratorio de lingüística de Sujin. Edificio universitario cerca de Namsan. Estanterías del suelo al techo. Documentos en doce idiomas clavados en cada pared. Sujin está sentada en un escritorio cubierto de manuscritos antiguos. Levanta la vista cuando entra Rudy, ojos agudos, sin sonrisa.)",
      },
      {
        kind: "scene",
        charId: "sujin",
        text: "You are late. Eleanor said you were coming yesterday. Also, she said you were smart. The pronunciation Minho described suggests otherwise. Sit down. We have work to do.",
        textKo: "늦었어요. 엘리너가 어제 온다고 했어요. 그리고, 똑똑하다고 했는데. 민호가 설명한 발음으로는 아닌 것 같아요. 앉으세요. 할 일이 있어요.",
        textId: "Kamu terlambat. Eleanor bilang kamu datang kemarin. Lagi pula, katanya kamu pintar. Pengucapan yang digambarkan Minho menunjukkan sebaliknya. Duduk. Kita ada pekerjaan.",
        textKoMix: "You are late. Eleanor said you were coming yesterday. Also, she said you were smart. 민호가 설명한 발음으로는 아닌 것 같아요. Sit down. We have work to do.",
        textIdMix: "You are late. Eleanor said you were coming yesterday. Also, she said you were smart. Pengucapan yang digambarkan Minho menunjukkan sebaliknya. Sit down. We have work to do.",
        textEs: "Llegas tarde. Eleanor dijo que venías ayer. Además, dijo que eras inteligente. La pronunciación que Minho describió sugiere lo contrario. Siéntate. Tenemos trabajo que hacer.",
        textEsMix: "You are late. Eleanor said you were coming yesterday. Also, she said you were smart. La pronunciación que Minho describió sugiere lo contrario. Sit down. We have work to do.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Nice to meet you too, Sujin. Eleanor speaks highly of you. She said you are the best linguist in Seoul, possibly the best she has ever trained.",
        textKo: "나도 만나서 반가워요, 수진. 엘리너가 높이 평가하더라고요. 서울 최고의 언어학자라고, 아마 자기가 가르친 사람 중 최고라고.",
        textId: "Senang juga bertemu denganmu, Sujin. Eleanor memujimu setinggi langit. Katanya kamu ahli bahasa terbaik di Seoul, mungkin yang terbaik yang pernah ia latih.",
        textKoMix: "Nice to meet you too, Sujin. Eleanor speaks highly of you. She said you are the best linguist in Seoul, 아마 자기가 가르친 사람 중 최고라고.",
        textIdMix: "Nice to meet you too, Sujin. Eleanor speaks highly of you. She said you are the best linguist in Seoul, mungkin yang terbaik yang pernah ia latih.",
        textEs: "Encantado de conocerte también, Sujin. Eleanor habla muy bien de ti. Dijo que eres la mejor lingüista de Seúl, posiblemente la mejor que ha formado.",
        textEsMix: "Nice to meet you too, Sujin. Eleanor speaks highly of you. She said you are the best linguist in Seoul, posiblemente la mejor que ha formado.",
      },
      {
        kind: "scene",
        charId: "sujin",
        text: "The Seoul Guardian Stone is in danger. Mr. Black has been seen near Namsan Tower three times this week. He is not hiding. He is studying the tower. The stone is hidden inside. Only someone who reads the Korean inscriptions can find it. That is why Eleanor sent you to me.",
        textKo: "서울 수호석이 위험해요. 미스터 블랙이 이번 주에 남산타워 근처에서 세 번 목격됐어요. 숨지 않아요. 타워를 연구하고 있어요. 수호석은 안에 숨겨져 있어요. 한국어 비문을 읽을 수 있는 사람만 찾을 수 있어요. 그래서 엘리너가 저한테 보낸 거예요.",
        textId: "Batu Penjaga Seoul dalam bahaya. Mr. Black terlihat di dekat Menara Namsan tiga kali minggu ini. Ia tidak bersembunyi. Ia sedang mempelajari menara itu. Batunya tersembunyi di dalam. Hanya orang yang bisa membaca prasasti Korea yang dapat menemukannya. Itu sebabnya Eleanor mengirimmu kepadaku.",
        textKoMix: "The Seoul Guardian Stone is in danger. Mr. Black has been seen near Namsan Tower three times this week. He is not hiding. He is studying the tower. The stone is hidden inside. 한국어 비문을 읽을 수 있는 사람만 찾을 수 있어요. That is why Eleanor sent you to me.",
        textIdMix: "The Seoul Guardian Stone is in danger. Mr. Black has been seen near Namsan Tower three times this week. He is not hiding. He is studying the tower. The stone is hidden inside. Hanya orang yang bisa membaca prasasti Korea yang dapat menemukannya. That is why Eleanor sent you to me.",
        textEs: "La Piedra Guardiana de Seúl está en peligro. Mr. Black ha sido visto cerca de la Torre Namsan tres veces esta semana. No se esconde. Está estudiando la torre. La piedra está oculta dentro. Solo alguien que lea las inscripciones coreanas puede encontrarla. Por eso Eleanor te envió a mí.",
        textEsMix: "The Seoul Guardian Stone is in danger. Mr. Black has been seen near Namsan Tower three times this week. He is not hiding. He is studying the tower. The stone is hidden inside. Solo alguien que lea las inscripciones coreanas puede encontrarla. That is why Eleanor sent you to me.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "So let me get this straight. I need to read Korean inscriptions, inscriptions that have been there for centuries, using vocabulary I learned in the last thirty days. Partner, this is either the bravest or the stupidest thing we have ever done.",
        textKo: "그러니까 정리하면. 수백 년 된 한국어 비문을, 지난 30일 동안 배운 어휘로 읽어야 한다고. 파트너, 이건 우리가 해본 것 중 가장 용감하거나 가장 멍청한 거야.",
        textId: "Jadi biar kuluruskan. Aku harus membaca prasasti Korea, prasasti yang sudah ada selama berabad-abad, dengan kosakata yang kupelajari dalam tiga puluh hari terakhir. Partner, ini hal paling berani atau paling bodoh yang pernah kita lakukan.",
        textKoMix: "So let me get this straight. I need to read Korean inscriptions, 수백 년 된 비문을, 지난 30일 동안 배운 어휘로. Partner, this is either the bravest or the stupidest thing we have ever done.",
        textIdMix: "So let me get this straight. I need to read Korean inscriptions, prasasti berusia berabad-abad, dengan kosakata yang kupelajari dalam 30 hari terakhir. Partner, this is either the bravest or the stupidest thing we have ever done.",
        textEs: "A ver si lo entiendo. Necesito leer inscripciones en coreano, inscripciones que han estado ahí durante siglos, usando vocabulario que aprendí en los últimos treinta días. Compañero, esto es lo más valiente o lo más estúpido que hemos hecho.",
        textEsMix: "So let me get this straight. I need to read Korean inscriptions, inscripciones que han estado ahí durante siglos, con vocabulario que aprendí en los últimos treinta días. Partner, this is either the bravest or the stupidest thing we have ever done.",
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
            instruction: { en: "Arrange the words to form the directions to the Guardian Stone inside Namsan Tower:", ko: "단어를 배열해서 남산타워 안 수호석으로 가는 길을 만드세요:", es: "Ordena las palabras para formar las direcciones a la Piedra Guardiana dentro de la Torre Namsan:", id: "Susun kata-kata untuk membentuk arah menuju Batu Penjaga di dalam Menara Namsan:" },
            words: [
              { en: "Excuse me", ko: "실례합니다", es: "Disculpe", id: "permisi" },
              { en: "where is", ko: "어디에", es: "dónde está", id: "di mana" },
              { en: "the old", ko: "오래된", es: "la vieja", id: "yang tua" },
              { en: "door", ko: "문이", es: "puerta", id: "pintu" },
              { en: "turn left", ko: "왼쪽으로", es: "gire a", id: "belok" },
              { en: "please", ko: "주세요", es: "la izquierda", id: "kiri tolong" },
            ],
            answerOrder: [0, 1, 2, 3, 4, 5],
          },
        ],
        hints: {
          h1: {
            ko: "문장은 'Excuse me'로 시작해 — 길을 물을 때 가장 먼저 하는 말이야",
            en: "The sentence starts with 'Excuse me' — the first thing you say when asking for directions",
            es: "La frase empieza con 'Excuse me' — lo primero que dices al pedir direcciones",
            id: "Kalimat dimulai dengan 'Excuse me' — hal pertama yang kamu ucapkan saat menanyakan arah",
            byLearning: {
              spanish: { ko: "문장은 'Disculpe'로 시작해", en: "The sentence starts with 'Disculpe'", es: "La frase empieza con 'Disculpe'", id: "Kalimat dimulai dengan 'Disculpe'" },
              korean:  { ko: "문장은 '실례합니다'로 시작해", en: "The sentence starts with '실례합니다'", es: "La frase empieza con '실례합니다'", id: "Kalimat dimulai dengan '실례합니다'" },
              english: { ko: "문장은 'Excuse me'로 시작해", en: "The sentence starts with 'Excuse me'", es: "La frase empieza con 'Excuse me'", id: "Kalimat dimulai dengan 'Excuse me'" },
              indonesian: { ko: "문장은 'Permisi'로 시작해", en: "The sentence starts with 'Permisi'", es: "La frase empieza con 'Permisi'", id: "Kalimat dimulai dengan 'Permisi'" },
            },
          },
          h2: {
            ko: "먼저 장소를 묻고 (where is the old door), 그다음 방향을 알려줘 (turn left please)",
            en: "First ask for the place (where is the old door), then give the direction (turn left please)",
            es: "Primero pregunta por el lugar (where is the old door), luego la dirección (turn left please)",
            id: "Pertama tanyakan tempatnya (where is the old door), lalu beri arahnya (turn left please)",
            byLearning: {
              spanish: { ko: "먼저 장소를 물어 (dónde está la vieja puerta), 그다음 방향 (gire a la izquierda)", en: "First the place (dónde está la vieja puerta), then direction (gire a la izquierda)", es: "Primero el lugar (dónde está la vieja puerta), luego dirección (gire a la izquierda)", id: "Pertama tanyakan tempatnya (dónde está la vieja puerta), lalu arahnya (gire a la izquierda)" },
              korean:  { ko: "먼저 장소를 물어 (오래된 문이 어디에), 그다음 방향 (왼쪽으로 주세요)", en: "First the place (오래된 문이 어디에), then direction (왼쪽으로 주세요)", es: "Primero el lugar (오래된 문이 어디에), luego dirección (왼쪽으로 주세요)", id: "Pertama tanyakan tempatnya (오래된 문이 어디에), lalu arahnya (왼쪽으로 주세요)" },
              english: { ko: "먼저 장소를 물어 (where is the old door), 그다음 방향 (turn left please)", en: "First the place (where is the old door), then direction (turn left please)", es: "Primero el lugar (where is the old door), luego dirección (turn left please)", id: "Pertama tanyakan tempatnya (where is the old door), lalu arahnya (turn left please)" },
              indonesian: { ko: "먼저 장소를 물어 (di mana pintu yang tua), 그다음 방향 (belok kiri tolong)", en: "First the place (di mana pintu yang tua), then direction (belok kiri tolong)", es: "Primero el lugar (di mana pintu yang tua), luego dirección (belok kiri tolong)", id: "Pertama tanyakan tempatnya (di mana pintu yang tua), lalu arahnya (belok kiri tolong)" },
            },
          },
          h3: {
            ko: "구조: Excuse me(인사) → where is(질문) → the old(형용사) → door(장소) → turn left(방향) → please(예절)",
            en: "Structure: Excuse me(greeting) → where is(question) → the old(adjective) → door(place) → turn left(direction) → please(polite)",
            es: "Estructura: Excuse me(saludo) → where is(pregunta) → the old(adjetivo) → door(lugar) → turn left(dirección) → please(cortesía)",
            id: "Struktur: Excuse me(sapaan) → where is(pertanyaan) → the old(kata sifat) → door(tempat) → turn left(arah) → please(sopan)",
            byLearning: {
              spanish: { ko: "구조: Disculpe → dónde está → la vieja → puerta → gire a → la izquierda", en: "Structure: Disculpe → dónde está → la vieja → puerta → gire a → la izquierda", es: "Estructura: Disculpe → dónde está → la vieja → puerta → gire a → la izquierda", id: "Struktur: Disculpe → dónde está → la vieja → puerta → gire a → la izquierda" },
              korean:  { ko: "구조: 실례합니다 → 어디에 → 오래된 → 문이 → 왼쪽으로 → 주세요", en: "Structure: 실례합니다 → 어디에 → 오래된 → 문이 → 왼쪽으로 → 주세요", es: "Estructura: 실례합니다 → 어디에 → 오래된 → 문이 → 왼쪽으로 → 주세요", id: "Struktur: 실례합니다 → 어디에 → 오래된 → 문이 → 왼쪽으로 → 주세요" },
              english: { ko: "구조: Excuse me → where is → the old → door → turn left → please", en: "Structure: Excuse me → where is → the old → door → turn left → please", es: "Estructura: Excuse me → where is → the old → door → turn left → please", id: "Struktur: Excuse me → where is → the old → door → turn left → please" },
              indonesian: { ko: "구조: Permisi → di mana → yang tua → pintu → belok kiri → tolong", en: "Structure: Permisi → di mana → yang tua → pintu → belok kiri → tolong", es: "Estructura: Permisi → di mana → yang tua → pintu → belok kiri → tolong", id: "Struktur: Permisi → di mana → yang tua → pintu → belok kiri → tolong" },
            },
          },
        },
      },
      // ── Scene 5: Namsan Tower — Mr. Black Appears ──────────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Namsan Tower. Night. The city of Seoul spreads out below like a circuit board of light. Rudy, Sujin, and Minho reach the observation deck. Behind a locked maintenance door, an inscription in old Korean. Sujin translates. Then a voice from behind them. Calm. Familiar. Mr. Black.)",
        textKo: "(남산타워. 밤. 서울 도시가 아래로 빛의 회로판처럼 펼쳐진다. 루디, 수진, 민호가 전망대에 도착한다. 잠긴 관리실 문 뒤에, 고대 한국어 비문. 수진이 번역한다. 그때 뒤에서 들리는 목소리. 차분한. 익숙한. 미스터 블랙.)",
        textId: "(Menara Namsan. Malam hari. Kota Seoul terhampar di bawah seperti papan sirkuit cahaya. Rudy, Sujin, dan Minho tiba di dek observasi. Di balik pintu perawatan yang terkunci, sebuah prasasti dalam bahasa Korea kuno. Sujin menerjemahkannya. Lalu sebuah suara dari belakang mereka. Tenang. Familiar. Mr. Black.)",
        textEs: "(Torre Namsan. Noche. La ciudad de Seúl se extiende abajo como un tablero de circuitos de luz. Rudy, Sujin y Minho llegan a la plataforma de observación. Detrás de una puerta de mantenimiento cerrada, una inscripción en coreano antiguo. Sujin traduce. Entonces una voz detrás de ellos. Tranquila. Familiar. Mr. Black.)",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "Good evening, detective. Hello. You found the door. I am impressed. You are learning fast. But the stone is not here. I have it. Thank you for showing me where it was.",
        textKo: "안녕하세요, 탐정. 문을 찾았군요. 감동이에요. 빨리 배우시네요. 하지만 수호석은 여기 없어요. 제가 갖고 있어요. 어디에 있는지 알려줘서 감사합니다.",
        textId: "Selamat malam, detektif. Halo. Kamu menemukan pintunya. Aku terkesan. Kamu belajar dengan cepat. Tapi batunya tidak di sini. Aku yang memilikinya. Terima kasih sudah menunjukkan di mana tempatnya.",
        textKoMix: "Good evening, detective. Hello. You found the door. I am impressed. You are learning fast. But the stone is not here. I have it. 어디에 있는지 알려줘서 thank you.",
        textIdMix: "Good evening, detective. Hello. You found the door. I am impressed. You are learning fast. But the stone is not here. I have it. Terima kasih sudah menunjukkan di mana tempatnya, thank you.",
        textEs: "Buenas noches, detective. Hola. Encontraste la puerta. Estoy impresionado. Estás aprendiendo rápido. Pero la piedra no está aquí. La tengo yo. Gracias por mostrarme dónde estaba.",
        textEsMix: "Good evening, detective. Hello. You found the door. I am impressed. You are learning fast. But the stone is not here. I have it. Thank you por mostrarme dónde estaba.",
      },
      {
        kind: "scene",
        charId: "sujin",
        text: "You used us. You knew we would find the inscription before you could read it yourself. Your Korean is not good enough to read the old script, so you waited for someone who could.",
        textKo: "우리를 이용했군요. 당신이 직접 읽기 전에 우리가 비문을 찾을 줄 알았던 거예요. 당신의 한국어 실력으로는 옛 문체를 읽을 수 없으니까, 읽을 수 있는 사람을 기다린 거예요.",
        textId: "Kau memanfaatkan kami. Kau tahu kami akan menemukan prasasti itu sebelum kau sendiri bisa membacanya. Bahasa Korea-mu tidak cukup baik untuk membaca aksara kuno, jadi kau menunggu seseorang yang bisa.",
        textKoMix: "You used us. You knew we would find the inscription before you could read it yourself. 당신의 한국어 실력으로는 옛 문체를 읽을 수 없으니까, so you waited for someone who could.",
        textIdMix: "You used us. You knew we would find the inscription before you could read it yourself. Bahasa Korea-mu tidak cukup untuk membaca aksara kuno, so you waited for someone who could.",
        textEs: "Nos usaste. Sabías que encontraríamos la inscripción antes de que pudieras leerla tú mismo. Tu coreano no es suficiente para leer la escritura antigua, así que esperaste a alguien que pudiera.",
        textEsMix: "You used us. You knew we would find the inscription before you could read it yourself. Tu coreano no es suficiente para leer la escritura antigua, so you waited for someone who could.",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "You are correct. Goodbye, Seoul. *leaves a folded note on the railing and walks into the elevator*",
        textKo: "맞아요. 안녕히 계세요, 서울. *난간에 접힌 메모를 두고 엘리베이터로 걸어간다*",
        textId: "Benar. Selamat tinggal, Seoul. *meninggalkan secarik catatan terlipat di pagar dan berjalan masuk ke lift*",
        textKoMix: "You are correct. Goodbye, Seoul. *난간에 접힌 note를 두고 엘리베이터로 걸어간다*",
        textIdMix: "You are correct. Goodbye, Seoul. *meninggalkan note terlipat di pagar dan berjalan masuk ke lift*",
        textEs: "Tienes razón. Adiós, Seúl. *deja una nota doblada en la barandilla y camina hacia el ascensor*",
        textEsMix: "You are correct. Goodbye, Seoul. *deja una note doblada en la barandilla y camina hacia el ascensor*",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Mr. Black disappears into the elevator. On the railing, a folded note. Rudy picks it up. The entire note is written in Korean. No English. No Spanish. Just Korean. He left it knowing that Rudy would have to read it himself.)",
        textKo: "(미스터 블랙이 엘리베이터로 사라진다. 난간 위에, 접힌 메모. 루디가 집어든다. 메모 전체가 한국어로 쓰여 있다. 영어 없음. 스페인어 없음. 오직 한국어. 루디가 직접 읽어야 한다는 것을 알고 남긴 것이다.)",
        textId: "(Mr. Black menghilang ke dalam lift. Di atas pagar, secarik catatan terlipat. Rudy mengambilnya. Seluruh catatan itu ditulis dalam bahasa Korea. Tanpa bahasa Inggris. Tanpa bahasa Spanyol. Hanya Korea. Ia meninggalkannya sambil tahu bahwa Rudy harus membacanya sendiri.)",
        textEs: "(Mr. Black desaparece en el ascensor. En la barandilla, una nota doblada. Rudy la recoge. La nota entera está escrita en coreano. Sin inglés. Sin español. Solo coreano. La dejó sabiendo que Rudy tendría que leerla él mismo.)",
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
            prompt: { en: "Mr. Black's note is in Korean only. Which line reveals where he is going next?", ko: "미스터 블랙의 메모가 한국어로만 되어 있어. 어느 줄이 다음 행선지를 알려줄까?", es: "La nota de Mr. Black está solo en coreano. ¿Qué línea revela adónde va después?", id: "Catatan Mr. Black hanya berbahasa Korea. Baris mana yang mengungkap ke mana ia pergi berikutnya?" },
            clues: [
              { en: "'감사합니다, 탐정' — 'Thank you, detective'", ko: "'감사합니다, 탐정' — 감사 인사", es: "'감사합니다, 탐정' — 'Gracias, detective'", id: "'감사합니다, 탐정' — ucapan terima kasih" },
              { en: "'잘했어요. 다음은 카이로예요.' — 'Well done. Next is Cairo.'", ko: "'잘했어요. 다음은 카이로예요.' — 다음 목적지", es: "'잘했어요. 다음은 카이로예요.' — 'Bien hecho. El siguiente es El Cairo.'", id: "'잘했어요. 다음은 카이로예요.' — tujuan berikutnya" },
              { en: "'안녕히 계세요' — 'Goodbye'", ko: "'안녕히 계세요' — 작별 인사", es: "'안녕히 계세요' — 'Adiós'", id: "'안녕히 계세요' — ucapan perpisahan" },
              { en: "'저는 미스터 블랙입니다' — 'I am Mr. Black'", ko: "'저는 미스터 블랙입니다' — 자기소개", es: "'저는 미스터 블랙입니다' — 'Soy Mr. Black'", id: "'저는 미스터 블랙입니다' — perkenalan diri" },
            ],
            answerIdx: 1,
          },
        ],
        hints: {
          h1: { ko: "어느 줄에 장소 이름이 있는지 찾아봐 — 미스터 블랙은 항상 다음 목적지를 남겨", en: "Look for which line contains a place name — Mr. Black always leaves his next destination", es: "Busca qué línea contiene un nombre de lugar — Mr. Black siempre deja su próximo destino", id: "Cari baris mana yang memuat nama tempat — Mr. Black selalu meninggalkan tujuan berikutnya" },
          h2: { ko: "카이로는 도시 이름이야 — 그 단어가 포함된 줄이 다음 행선지야", en: "Cairo is a city name — the line containing that word reveals the next destination", es: "El Cairo es el nombre de una ciudad — la línea que contiene esa palabra revela el próximo destino", id: "Kairo adalah nama kota — baris yang memuat kata itu mengungkap tujuan berikutnya" },
          h3: { ko: "'잘했어요. 다음은 카이로예요.' — 잘했어요=well done, 다음=next, 카이로=Cairo", en: "'잘했어요. 다음은 카이로예요.' — 잘했어요=well done, 다음=next, 카이로=Cairo", es: "'잘했어요. 다음은 카이로예요.' — 잘했어요=bien hecho, 다음=siguiente, 카이로=El Cairo", id: "'잘했어요. 다음은 카이로예요.' — 잘했어요=bagus sekali, 다음=berikutnya, 카이로=Kairo" },
        },
      },
      // ── Scene 6: The Emotional Payoff — Reading Korean ─────────────────────
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Silence on the observation deck. Minho looks at Rudy. Sujin looks at Rudy. The note is in his hands. Korean characters. No translation. No help. This is the moment. Can the player actually read Korean now?)",
        textKo: "(전망대의 침묵. 민호가 루디를 본다. 수진이 루디를 본다. 메모가 루디의 손에 있다. 한국어 글자. 번역 없음. 도움 없음. 이 순간이다. 플레이어가 정말로 한국어를 읽을 수 있을까?)",
        textId: "(Keheningan di dek observasi. Minho menatap Rudy. Sujin menatap Rudy. Catatan itu ada di tangannya. Aksara Korea. Tanpa terjemahan. Tanpa bantuan. Inilah saatnya. Bisakah pemain benar-benar membaca bahasa Korea sekarang?)",
        textEs: "(Silencio en la plataforma de observación. Minho mira a Rudy. Sujin mira a Rudy. La nota está en sus manos. Caracteres coreanos. Sin traducción. Sin ayuda. Este es el momento. ¿Puede el jugador realmente leer coreano ahora?)",
      },
      {
        kind: "clue",
        symbol: "📝",
        titleEn: "Mr. Black's Note: Korean Only",
        titleKo: "미스터 블랙의 메모: 한국어로만",
        titleId: "Catatan Mr. Black: Hanya Bahasa Korea",
        titleEs: "Nota de Mr. Black: Solo en Coreano",
        descEn: "잘했어요. 다음은 카이로예요. 언어는 문이에요. 저는 열쇠를 갖고 있어요. No English translation provided.",
        descKo: "잘했어요. 다음은 카이로예요. 언어는 문이에요. 저는 열쇠를 갖고 있어요.",
        descId: "잘했어요. 다음은 카이로예요. 언어는 문이에요. 저는 열쇠를 갖고 있어요. Tanpa terjemahan bahasa Indonesia.",
        descEs: "잘했어요. 다음은 카이로예요. 언어는 문이에요. 저는 열쇠를 갖고 있어요. Sin traducción al español.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "...'잘했어요.' Well done. '다음은 카이로예요.' Next is Cairo. '언어는 문이에요.' Language is a door. '저는 열쇠를 갖고 있어요.' I have the key. *long pause* Partner. I just read that. In Korean. Thirty days ago I could barely say hello. And I just read a threat written by the most dangerous man alive. I hate that I understood every word. But also... I kind of love it.",
        textKo: "...'잘했어요.' 잘했다고. '다음은 카이로예요.' 다음은 카이로. '언어는 문이에요.' 언어는 문이래. '저는 열쇠를 갖고 있어요.' 열쇠를 갖고 있대. *긴 침묵* 파트너. 방금 그걸 읽었어. 한국어로. 30일 전에는 안녕하세요도 겨우 했는데. 그리고 지금 세상에서 가장 위험한 남자가 쓴 협박을 읽었어. 한 마디도 빠짐없이 이해했다는 게 너무 싫어. 하지만 동시에... 좀 좋기도 해.",
        textId: "...'잘했어요.' Bagus sekali. '다음은 카이로예요.' Berikutnya adalah Kairo. '언어는 문이에요.' Bahasa adalah sebuah pintu. '저는 열쇠를 갖고 있어요.' Aku memegang kuncinya. *jeda panjang* Partner. Aku baru saja membaca itu. Dalam bahasa Korea. Tiga puluh hari lalu aku nyaris tak bisa mengucapkan halo. Dan aku baru saja membaca ancaman yang ditulis oleh pria paling berbahaya di dunia. Aku benci bahwa aku memahami setiap kata. Tapi sekaligus... aku agak menyukainya.",
        textKoMix: "...'잘했어요.' Well done. '다음은 카이로예요.' Next is Cairo. '언어는 문이에요.' Language is a door. '저는 열쇠를 갖고 있어요.' I have the key. *긴 침묵* Partner. I just read that. In Korean. 30일 전에는 안녕하세요도 겨우 했는데. 한 마디도 빠짐없이 이해했다는 게 너무 싫어. 하지만 동시에... 좀 좋기도 해.",
        textIdMix: "...'잘했어요.' Well done. '다음은 카이로예요.' Next is Cairo. '언어는 문이에요.' Language is a door. '저는 열쇠를 갖고 있어요.' I have the key. *jeda panjang* Partner. I just read that. In Korean. Tiga puluh hari lalu aku nyaris tak bisa mengucapkan halo. Aku benci bahwa aku memahami setiap kata. Tapi sekaligus... aku agak menyukainya.",
        textEs: "...'잘했어요.' Bien hecho. '다음은 카이로예요.' El siguiente es El Cairo. '언어는 문이에요.' El lenguaje es una puerta. '저는 열쇠를 갖고 있어요.' Tengo la llave. *una larga pausa* Compañero. Acabo de leer eso. En coreano. Hace treinta días apenas podía decir hola. Y acabo de leer una amenaza escrita por el hombre más peligroso del mundo. Odio haber entendido cada palabra. Pero también... me encanta un poco.",
        textEsMix: "...'잘했어요.' Well done. '다음은 카이로예요.' Next is Cairo. '언어는 문이에요.' Language is a door. '저는 열쇠를 갖고 있어요.' I have the key. *una larga pausa* Partner. I just read that. In Korean. Hace treinta días apenas podía decir hola. Odio haber entendido cada palabra. Pero también... me encanta un poco.",
      },
      {
        kind: "scene",
        charId: "minho",
        text: "Bro. You just READ that?! Without help?! OK I take it back, you are not a microwave-manual robot. You are actually kind of impressive. Sujin, did you see that?!",
        textKo: "야. 방금 그거 읽었어?! 도움 없이?! 나 아까 한 말 취소. 전자레인지 설명서 로봇 아니야. 솔직히 좀 대단해. 수진 누나, 봤어?!",
        textId: "Bro. Kamu barusan MEMBACA itu?! Tanpa bantuan?! Oke aku tarik kata-kataku, kamu bukan robot buku manual microwave. Kamu sebenarnya cukup mengesankan. Kak Sujin, lihat tadi?!",
        textKoMix: "Bro. You just READ that?! Without help?! OK I take it back, you are not a microwave-manual robot. 솔직히 좀 대단해. Sujin, did you see that?!",
        textIdMix: "Bro. You just READ that?! Without help?! OK I take it back, you are not a microwave-manual robot. Sejujurnya itu cukup mengesankan. Sujin, did you see that?!",
        textEs: "¡Tío! ¿¡Acabas de LEER eso?! ¿¡Sin ayuda?! OK retiro lo dicho, no eres un robot de manual de microondas. En realidad eres bastante impresionante. ¡Sujin, ¿viste eso?!",
        textEsMix: "Bro. You just READ that?! Without help?! OK I take it back, you are not a microwave-manual robot. En realidad eres bastante impresionante. Sujin, did you see that?!",
      },
      {
        kind: "scene",
        charId: "sujin",
        text: "I saw it. *small smile, the first one* Eleanor was right about you after all. Cairo. We need to warn our contacts there. Mr. Black has the Seoul stone. But he showed us something important: his Korean is not perfect. He needed US to find the inscription. That is his weakness.",
        textKo: "봤어. *작은 미소, 처음으로* 결국 엘리너가 맞았네요. 카이로. 거기 연락책에 알려야 해요. 미스터 블랙이 서울 수호석을 가져갔지만, 중요한 걸 보여줬어요: 그의 한국어는 완벽하지 않아요. 비문을 찾으려면 우리가 필요했어요. 그게 약점이에요.",
        textId: "Aku melihatnya. *senyum kecil, yang pertama* Ternyata Eleanor benar tentangmu. Kairo. Kita perlu memperingatkan kontak kita di sana. Mr. Black memang mengambil batu Seoul, tapi ia menunjukkan sesuatu yang penting: bahasa Korea-nya tidak sempurna. Ia membutuhkan KITA untuk menemukan prasastinya. Itulah kelemahannya.",
        textKoMix: "I saw it. *작은 미소, 처음으로* Eleanor was right about you after all. Cairo. We need to warn our contacts there. Mr. Black has the Seoul stone. But he showed us something important: 그의 한국어는 완벽하지 않아요. He needed US to find the inscription. That is his weakness.",
        textIdMix: "I saw it. *senyum kecil, yang pertama* Eleanor was right about you after all. Cairo. We need to warn our contacts there. Mr. Black has the Seoul stone. But he showed us something important: bahasa Korea-nya tidak sempurna. He needed US to find the inscription. That is his weakness.",
        textEs: "Lo vi. *pequeña sonrisa, la primera* Eleanor tenía razón sobre ti después de todo. El Cairo. Necesitamos avisar a nuestros contactos allí. Mr. Black tiene la piedra de Seúl. Pero nos mostró algo importante: su coreano no es perfecto. Nos necesitó para encontrar la inscripción. Esa es su debilidad.",
        textEsMix: "I saw it. *pequeña sonrisa, la primera* Eleanor was right about you after all. Cairo. We need to warn our contacts there. Mr. Black has the Seoul stone. But he showed us something important: su coreano no es perfecto. He needed US to find the inscription. That is his weakness.",
      },
      {
        kind: "scene",
        charId: "youngsook",
        text: "*arrives with a container of food* For the plane. You cannot chase a villain on an empty stomach. Remember what I taught you, fox boy. Every word you learned at my table. Those are your weapons now.",
        textKo: "*음식 용기를 들고 도착하며* 비행기에서 먹어. 빈 속으로 악당을 쫓을 수는 없단다. 내가 가르친 것 기억해, 여우 도련님. 내 밥상에서 배운 모든 단어. 그게 이제 네 무기야.",
        textId: "*tiba sambil membawa wadah makanan* Untuk di pesawat. Kamu tidak bisa mengejar penjahat dengan perut kosong. Ingat apa yang kuajarkan, anak rubah. Setiap kata yang kamu pelajari di mejaku. Itu sekarang senjatamu.",
        textKoMix: "*음식 용기를 들고 도착하며* For the plane. You cannot chase a villain on an empty stomach. 내가 가르친 것 기억해, fox boy. Every word you learned at my table. 그게 이제 네 무기야.",
        textIdMix: "*tiba sambil membawa wadah makanan* For the plane. You cannot chase a villain on an empty stomach. Ingat apa yang kuajarkan, fox boy. Every word you learned at my table. Itu sekarang senjatamu.",
        textEs: "*llega con un recipiente de comida* Para el avión. No puedes perseguir a un villano con el estómago vacío. Recuerda lo que te enseñé, chico zorro. Cada palabra que aprendiste en mi mesa. Esas son tus armas ahora.",
        textEsMix: "*llega con un recipiente de comida* For the plane. You cannot chase a villain on an empty stomach. Recuerda lo que te enseñé, fox boy. Every word you learned at my table. Esas son tus armas ahora.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Next Chapter: The Cairo Legacy. The stones are counting down.)",
        textKo: "(다음 챕터: 카이로의 유산. 수호석이 카운트다운 중이다.)",
        textId: "(Bab Berikutnya: Warisan Kairo. Batu-batu penjaga sedang menghitung mundur.)",
        textEs: "(Siguiente Capítulo: El Legado de El Cairo. Las piedras están en cuenta regresiva.)",
      },
    ],
  },

  /* ════════════════ CHAPTER 4: CAIRO ════════════════ */
  cairo: {
    id: "cairo",
    title: "The Cairo Legacy",
    titleKo: "카이로의 유산",
    titleEs: "El Legado de El Cairo",
    titleId: "Warisan Kairo",
    gradient: ["#1a0d00", "#2e1a00", "#1a0d00"],
    accentColor: "#D4A017",
    nextChapterId: "babel",
    /* ── Language Ratio: 85% targetLang / 15% nativeLang ──────────────────────
     * CEFR A2-B1 — pre-intermediate. User has completed Day 1-48.
     * NPC dialogue should be ALMOST entirely targetLang with minimal native
     * scaffolding only for complex plot exposition or emotional beats.
     * textKoMix/textEsMix are authored on every NPC dialogue line at ~85%
     * English: native language is reserved for the single hardest or most
     * emotional clause per line. Narration (isNarration) stays 100% native.
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
        "Ch4 dialogue is ~85% English (targetLang) / ~15% native. " +
        "textKoMix/textEsMix keep native only for the hardest/most emotional " +
        "clause per line. At this level learners handle most communication independently.",
    },
    characters: [
      { id: "lingo",    emoji: "🦊",  name: "Detective Rudy",  nameKo: "루디 탐정",    nameId: "Detektif Rudy",   side: "left",  avatarBg: "#2c1810", isLingo: true, portrait: rudyStoryImg, portraitVariants: rudyExpressionSprites },
      { id: "amira",    emoji: "👩‍🏫", name: "Professor Amira", nameKo: "아미라 교수",  nameId: "Profesor Amira",  side: "right", avatarBg: "#2A1A00" },
      { id: "hassan",   emoji: "🧑‍🤝‍🧑", name: "Hassan",         nameKo: "하산",         nameId: "Hassan",          side: "right", avatarBg: "#1A1500" },
      { id: "penny",    emoji: "📚",  name: "Miss Penny",      nameKo: "미스 페니",    nameId: "Miss Penny",      side: "right", avatarBg: "#1A0A2A" },
      { id: "mr_black", emoji: "🕴️", name: "Mr. Black",       nameKo: "미스터 블랙",  nameId: "Mr. Black",       side: "right", avatarBg: "#0A0A0A" },
    ],
    sequence: [
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Cairo International Airport. Rudy opens his Arabic phrasebook, bought the night before in Seoul. Every page is blank. The cover is there. The words inside are gone. As if someone erased every letter.)",
        textKo: "(카이로 국제공항. 루디가 아랍어 회화집을 펼친다. 서울에서 전날 밤 산 것. 모든 페이지가 비어 있다. 표지는 있다. 안의 단어들이 사라졌다. 누군가 모든 글자를 지운 것처럼.)",
        textEs: "(Aeropuerto Internacional de El Cairo. Rudy abre su libro de frases árabe, comprado la noche anterior en Seúl. Cada página está en blanco. La portada está ahí. Las palabras de dentro han desaparecido. Como si alguien hubiera borrado cada letra.)",
        textId: "(Bandara Internasional Kairo. Rudy membuka buku percakapan bahasa Arab-nya, yang ia beli semalam sebelumnya di Seoul. Setiap halaman kosong. Sampulnya ada. Kata-kata di dalamnya lenyap. Seakan seseorang menghapus setiap huruf.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Mr. Black erased my phrasebook. Before I even landed. He's not just ahead of me. He's arranging the board before I sit down. Fine. I survived London with no clues, Madrid without the stone, Seoul with no phone. Cairo with no phrasebook? Just another Tuesday.",
        textKo: "미스터 블랙이 내 회화집을 지웠어. 내가 도착하기도 전에. 단순히 앞서가는 게 아니야. 내가 앉기도 전에 판을 짜고 있어. 좋아. 런던에선 단서 없이, 마드리드에선 수호석 없이, 서울에선 핸드폰 없이 살아남았어. 카이로에서 회화집 없이? 그냥 또 하나의 화요일이야.",
        textKoMix: "Mr. Black erased my phrasebook. Before I even landed. He's not just ahead of me. He's arranging the board before I sit down. Fine. I survived London with no clues, Madrid without the stone, Seoul with no phone. Cairo with no phrasebook? 그냥 또 하나의 화요일이야.",
        textEs: "Mr. Black borró mi libro de frases. Antes de que aterrizara. No solo va por delante. Está armando el tablero antes de que me siente. Bien. Sobreviví Londres sin pistas, Madrid sin la piedra, Seúl sin teléfono. ¿El Cairo sin libro de frases? Solo otro martes.",
        textEsMix: "Mr. Black erased my phrasebook. Before I even landed. He's not just ahead of me. He's arranging the board before I sit down. Fine. I survived London with no clues, Madrid without the stone, Seoul with no phone. Cairo with no phrasebook? Solo otro martes.",
        textId: "Mr. Black menghapus buku percakapanku. Bahkan sebelum aku mendarat. Dia bukan sekadar selangkah di depanku. Dia menata papan catur sebelum aku duduk. Baiklah. Aku selamat dari London tanpa petunjuk, Madrid tanpa batu, Seoul tanpa ponsel. Kairo tanpa buku percakapan? Hanya hari Selasa biasa.",
        textIdMix: "Mr. Black erased my phrasebook. Before I even landed. He's not just ahead of me. He's arranging the board before I sit down. Fine. I survived London with no clues, Madrid without the stone, Seoul with no phone. Cairo with no phrasebook? Hanya hari Selasa biasa.",
      },
      {
        kind: "scene",
        charId: "amira",
        text: "You're Rudy. The fox detective. Sujin told me about you. Three cities. Zero stones recovered. Forgive me if I'm not impressed. Before I trust you with anything. Prove you can actually communicate. Name these objects in three languages.",
        textKo: "루디지. 여우 탐정. 수진이 말해줬어. 세 도시. 되찾은 수호석 제로. 감동 안 받은 거 이해해줘. 뭔가를 믿기 전에. 실제로 소통할 수 있는지 증명해봐. 이 물건들의 이름을 세 개 언어로 말해봐.",
        textKoMix: "You're Rudy. The fox detective. Sujin told me about you. Three cities. Zero stones recovered. Forgive me if I'm not impressed. 뭔가를 믿기 전에. Prove you can actually communicate. Name these objects in three languages.",
        textEs: "Eres Rudy. El detective zorro. Sujin me habló de ti. Tres ciudades. Cero piedras recuperadas. Perdóname si no estoy impresionada. Antes de confiarte cualquier cosa. Demuestra que puedes comunicarte. Di el nombre de estos objetos en tres idiomas.",
        textEsMix: "You're Rudy. The fox detective. Sujin told me about you. Three cities. Zero stones recovered. Forgive me if I'm not impressed. Antes de confiarte cualquier cosa. Prove you can actually communicate. Name these objects in three languages.",
        textId: "Kamu Rudy. Detektif rubah itu. Sujin bercerita tentangmu. Tiga kota. Nol batu yang ditemukan kembali. Maafkan aku jika aku tidak terkesan. Sebelum aku memercayakan apa pun padamu. Buktikan kamu benar-benar bisa berkomunikasi. Sebutkan nama benda-benda ini dalam tiga bahasa.",
        textIdMix: "You're Rudy. The fox detective. Sujin told me about you. Three cities. Zero stones recovered. Forgive me if I'm not impressed. Sebelum aku memercayakan apa pun padamu. Prove you can actually communicate. Name these objects in three languages.",
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
            word: { en: "map", ko: "지도", es: "mapa", id: "peta" },
            meaning: { en: "a drawing that shows roads and places", ko: "길과 장소를 보여주는 그림", es: "un dibujo que muestra calles y lugares", id: "gambar yang menunjukkan jalan dan tempat" },
            wrong: [
              { en: "a type of food", ko: "음식 종류", es: "un tipo de comida", id: "sejenis makanan" },
              { en: "a musical instrument", ko: "악기", es: "un instrumento musical", id: "alat musik" },
              { en: "a police station", ko: "경찰서", es: "una estación de policía", id: "kantor polisi" },
            ],
          },
          {
            word: { en: "key", ko: "열쇠", es: "llave", id: "kunci" },
            meaning: { en: "a small object used to open a lock", ko: "잠금장치를 여는 작은 물건", es: "un pequeño objeto para abrir una cerradura", id: "benda kecil untuk membuka gembok" },
            wrong: [
              { en: "a secret document", ko: "비밀 문서", es: "un documento secreto", id: "dokumen rahasia" },
              { en: "a type of weather", ko: "날씨 종류", es: "un tipo de clima", id: "sejenis cuaca" },
              { en: "a building entrance", ko: "건물 입구", es: "una entrada de edificio", id: "pintu masuk gedung" },
            ],
          },
          {
            word: { en: "water", ko: "물", es: "agua", id: "air" },
            meaning: { en: "a clear liquid you drink", ko: "마시는 투명한 액체", es: "un líquido claro que bebes", id: "cairan bening yang kamu minum" },
            wrong: [
              { en: "a type of stone", ko: "돌의 종류", es: "un tipo de piedra", id: "sejenis batu" },
              { en: "a city district", ko: "도시 구역", es: "un distrito de la ciudad", id: "sebuah distrik kota" },
              { en: "a formal letter", ko: "공식 서한", es: "una carta formal", id: "surat resmi" },
            ],
          },
        ],
        hints: {
          h1: { ko: "이 세 단어는 기초 단어야 — 일상에서 가장 자주 쓰이는 것들", en: "These three words are basics — the most frequently used in everyday life", es: "Estas tres palabras son básicas — las más usadas en la vida cotidiana", id: "Tiga kata ini adalah kata dasar — yang paling sering dipakai sehari-hari" },
          h2: { ko: "루디가 이미 배웠어: 지도는 길 찾기, 열쇠는 잠금/열기, 물은 마시기", en: "Rudy already learned these: map for navigation, key for locks, water for drinking", es: "Rudy ya aprendió: mapa para navegar, llave para cerraduras, agua para beber", id: "Rudy sudah mempelajarinya: peta untuk mencari arah, kunci untuk gembok, air untuk diminum" },
          h3: { ko: "영어: map / key / water — 스페인어: mapa / llave / agua — 한국어: 지도 / 열쇠 / 물", en: "English: map / key / water — Spanish: mapa / llave / agua — Korean: 지도 / 열쇠 / 물", es: "Inglés: map / key / water — Español: mapa / llave / agua — Coreano: 지도 / 열쇠 / 물", id: "Inggris: map / key / water — Spanyol: mapa / llave / agua — Korea: 지도 / 열쇠 / 물" },
        },
      },
      {
        kind: "scene",
        charId: "amira",
        text: "Not bad. Not perfect, but not bad. You know more than Sujin warned me. Come. My cousin Hassan is at the souk. He talks too much, knows too much, and cannot keep a secret to save his life. He's exactly what we need.",
        textKo: "나쁘지 않아. 완벽하지는 않지만 나쁘지 않아. 수진이 경고한 것보다 많이 알고 있네. 가자. 사촌 하산이 수크에 있어. 말이 너무 많고, 아는 게 너무 많고, 비밀을 절대 못 지켜. 정확히 우리에게 필요한 사람이야.",
        textKoMix: "Not bad. Not perfect, but not bad. You know more than Sujin warned me. Come. My cousin Hassan is at the souk. He talks too much, knows too much, 비밀을 절대 못 지켜. He's exactly what we need.",
        textEs: "Nada mal. No perfecto, pero nada mal. Sabes más de lo que Sujin me advirtió. Ven. Mi primo Hassan está en el zoco. Habla demasiado, sabe demasiado, y no puede guardar un secreto ni para salvar su vida. Es exactamente lo que necesitamos.",
        textEsMix: "Not bad. Not perfect, but not bad. You know more than Sujin warned me. Come. My cousin Hassan is at the souk. He talks too much, knows too much, y no puede guardar un secreto ni para salvar su vida. He's exactly what we need.",
        textId: "Tidak buruk. Tidak sempurna, tapi tidak buruk. Kamu tahu lebih banyak daripada yang Sujin peringatkan. Ayo. Sepupuku Hassan ada di souk. Dia terlalu banyak bicara, terlalu banyak tahu, dan tak bisa menyimpan rahasia sama sekali. Dia justru orang yang kita butuhkan.",
        textIdMix: "Not bad. Not perfect, but not bad. You know more than Sujin warned me. Come. My cousin Hassan is at the souk. He talks too much, knows too much, dan tak bisa menyimpan rahasia sama sekali. He's exactly what we need.",
      },
      {
        kind: "scene",
        charId: "hassan",
        text: "*gestures expansively at his stall* Welcome! Welcome! You want spices? Silk? Information about a man in a black coat who was here yesterday asking about the old excavation site? I tell you everything! Very reasonable price!",
        textKo: "*가판대를 향해 활짝 손짓하며* 어서 오세요! 어서 오세요! 향신료 원해요? 비단? 어제 오래된 발굴 현장에 대해 묻고 다닌 검은 코트 남자에 대한 정보? 다 말해줄게요! 아주 합리적인 가격에!",
        textKoMix: "*가판대를 향해 활짝 손짓하며* Welcome! Welcome! You want spices? Silk? Information about a man in a black coat 어제 오래된 발굴 현장에 대해 묻고 다닌? I tell you everything! Very reasonable price!",
        textEs: "*gesticula ampliamente hacia su puesto* ¡Bienvenido! ¡Bienvenido! ¿Quieres especias? ¿Seda? ¿Información sobre un hombre de abrigo negro que estuvo aquí ayer preguntando sobre el viejo sitio de excavación? ¡Te cuento todo! ¡Precio muy razonable!",
        textEsMix: "*gesticula ampliamente hacia su puesto* Welcome! Welcome! You want spices? Silk? Information about a man in a black coat que estuvo aquí ayer preguntando sobre el viejo sitio de excavación? I tell you everything! Very reasonable price!",
        textId: "*memberi isyarat lebar ke arah lapaknya* Selamat datang! Selamat datang! Mau rempah? Sutra? Informasi tentang pria bermantel hitam yang kemarin ada di sini bertanya soal situs penggalian tua itu? Akan kuceritakan semuanya! Harga sangat masuk akal!",
        textIdMix: "*memberi isyarat lebar ke arah lapaknya* Welcome! Welcome! You want spices? Silk? Information about a man in a black coat yang kemarin ada di sini bertanya soal situs penggalian tua itu? I tell you everything! Very reasonable price!",
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
            prompt: { en: "Hassan keeps mixing clues with sales pitches. How do you get him to focus?", ko: "하산이 단서와 판매 권유를 계속 섞고 있어. 어떻게 집중하게 해?", es: "Hassan mezcla pistas con ventas. ¿Cómo lo concentras?", id: "Hassan terus mencampur petunjuk dengan rayuan dagang. Bagaimana kamu membuatnya fokus?" },
            context: { en: "Hassan: 'The man in black, very serious, very pale, he bought nothing! Can you believe? Not even a small carpet. Then he asked me: where is the stone that does not move? Very strange question.'", ko: "하산: '검은 남자, 아주 심각하고, 아주 창백해, 아무것도 안 샀어요! 믿을 수 있어요? 작은 카펫도 아니고. 그러더니 물어보더라고요: 움직이지 않는 돌이 어디 있냐고? 아주 이상한 질문.'", es: "Hassan: 'El hombre de negro, muy serio, muy pálido, ¡no compró nada! ¿Puedes creerlo? Ni siquiera una pequeña alfombra. Luego me preguntó: ¿dónde está la piedra que no se mueve? Pregunta muy extraña.'", id: "Hassan: 'Pria berbaju hitam itu, sangat serius, sangat pucat, dia tidak membeli apa pun! Bisa kamu percaya? Karpet kecil pun tidak. Lalu dia bertanya padaku: di mana batu yang tidak bergerak? Pertanyaan yang sangat aneh.'" },
            answer: { en: "'The stone that does not move', that's an ancient guardian name. Hassan, did he say anything about where he was going next?", ko: "'움직이지 않는 돌', 그건 고대 수호자의 이름이야. 하산, 그 다음에 어디 간다고 말했어?", es: "'La piedra que no se mueve', ese es un nombre guardián antiguo. Hassan, ¿dijo algo sobre adónde iba después?", id: "'Batu yang tidak bergerak', itu nama penjaga kuno. Hassan, apakah dia mengatakan sesuatu tentang ke mana dia akan pergi berikutnya?" },
            wrong: [
              { en: "Please just answer the question and stop selling things.", ko: "제발 질문에만 답하고 물건 팔지 마.", es: "Por favor solo responde la pregunta y deja de vender cosas.", id: "Tolong jawab saja pertanyaannya dan berhenti berjualan." },
              { en: "I'll buy a carpet if you tell me more.", ko: "더 말해주면 카펫 살게.", es: "Compro una alfombra si me cuentas más.", id: "Aku akan membeli karpet kalau kamu cerita lebih banyak." },
            ],
          },
          {
            prompt: { en: "Hassan mentions 'the dig at Saqqara.' Amira goes silent. What do you ask?", ko: "하산이 '사카라 발굴지'를 언급해. 아미라가 침묵한다. 뭘 물어봐?", es: "Hassan menciona 'la excavación de Saqqara.' Amira queda en silencio. ¿Qué preguntas?", id: "Hassan menyebut 'penggalian di Saqqara.' Amira terdiam. Apa yang kamu tanyakan?" },
            context: { en: "Hassan: 'The stone, it's not at the museum. It's at Saqqara. The old dig site. My cousin knows.' *Amira turns pale*", ko: "하산: '돌, 박물관에 없어요. 사카라에 있어요. 옛날 발굴 현장. 사촌이 알아요.' *아미라가 창백해진다*", es: "Hassan: 'La piedra, no está en el museo. Está en Saqqara. El viejo sitio de excavación. Mi prima lo sabe.' *Amira se pone pálida*", id: "Hassan: 'Batu itu, tidak ada di museum. Ada di Saqqara. Situs penggalian tua itu. Sepupuku tahu.' *Amira memucat*" },
            answer: { en: "Amira. You knew where it was all along. That's why Mr. Black came to you first.", ko: "아미라. 처음부터 어디 있는지 알고 있었어. 그래서 미스터 블랙이 먼저 너한테 온 거야.", es: "Amira. Sabías dónde estaba todo el tiempo. Por eso Mr. Black vino a ti primero.", id: "Amira. Kamu tahu di mana batu itu selama ini. Itu sebabnya Mr. Black mendatangimu lebih dulu." },
            wrong: [
              { en: "Hassan, stop revealing family secrets in a market.", ko: "하산, 시장에서 가족 비밀 그만 폭로해.", es: "Hassan, deja de revelar secretos familiares en el mercado.", id: "Hassan, berhenti membongkar rahasia keluarga di pasar." },
              { en: "The dig site is too dangerous. We should call the police.", ko: "발굴 현장은 너무 위험해. 경찰을 불러야 해.", es: "El sitio de excavación es muy peligroso. Deberíamos llamar a la policía.", id: "Situs penggalian itu terlalu berbahaya. Kita harus memanggil polisi." },
            ],
          },
        ],
        hints: {
          h1: { ko: "탐정의 역할은 정보를 수집하는 거야 — 대화를 통제하고 핵심 단서에 집중해", en: "A detective's job is to collect information — control the conversation and focus on key clues", es: "El trabajo del detective es recopilar información — controla la conversación y céntrate en las pistas clave", id: "Tugas seorang detektif adalah mengumpulkan informasi — kendalikan percakapan dan fokus pada petunjuk kunci" },
          h2: { ko: "하산의 말 중 의미 있는 부분은 '움직이지 않는 돌'과 '사카라'야 — 이것들을 연결해봐", en: "The meaningful parts of Hassan's speech are 'the stone that does not move' and 'Saqqara' — connect them", es: "Las partes significativas del discurso de Hassan son 'la piedra que no se mueve' y 'Saqqara' — conéctalas", id: "Bagian penting dari ucapan Hassan adalah 'batu yang tidak bergerak' dan 'Saqqara' — hubungkan keduanya" },
          h3: { ko: "아미라의 반응이 단서야 — 그녀가 침묵하는 이유를 물어봐", en: "Amira's reaction is the clue — ask her why she went silent", es: "La reacción de Amira es la pista — pregúntale por qué se quedó en silencio", id: "Reaksi Amira adalah petunjuknya — tanyakan mengapa dia terdiam" },
        },
      },
      {
        kind: "scene",
        charId: "amira",
        text: "My family has protected the Cairo stone for four generations. My grandmother hid it at Saqqara during the war. My mother guarded it. I study it. And then... someone else came first. A woman. With a book of literary quotes and very tired eyes.",
        textKo: "우리 가족은 4대에 걸쳐 카이로 수호석을 지켜왔어. 할머니가 전쟁 중에 사카라에 숨겼어. 어머니가 지켰어. 나는 연구해. 그리고... 다른 누군가가 먼저 왔어. 한 여자. 문학 인용구가 가득한 책을 들고 피곤한 눈을 한.",
        textKoMix: "My family has protected the Cairo stone for four generations. 할머니가 전쟁 중에 Saqqara에 숨겼어. My mother guarded it. I study it. And then... someone else came first. A woman. With a book of literary quotes and very tired eyes.",
        textEs: "Mi familia ha protegido la piedra de El Cairo por cuatro generaciones. Mi abuela la escondió en Saqqara durante la guerra. Mi madre la guardó. Yo la estudio. Y luego... alguien más llegó primero. Una mujer. Con un libro lleno de citas literarias y ojos muy cansados.",
        textEsMix: "My family has protected the Cairo stone for four generations. Mi abuela la escondió en Saqqara durante la guerra. My mother guarded it. I study it. And then... someone else came first. A woman. With a book of literary quotes and very tired eyes.",
        textId: "Keluargaku telah melindungi batu Kairo selama empat generasi. Nenekku menyembunyikannya di Saqqara saat perang. Ibuku menjaganya. Aku mempelajarinya. Lalu... orang lain datang lebih dulu. Seorang perempuan. Dengan buku berisi kutipan sastra dan mata yang sangat lelah.",
        textIdMix: "My family has protected the Cairo stone for four generations. Nenekku menyembunyikannya di Saqqara saat perang. My mother guarded it. I study it. And then... someone else came first. A woman. With a book of literary quotes and very tired eyes.",
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
        title: { en: "Navigate Cairo", ko: "카이로에서 길 찾기", es: "Navegar El Cairo", id: "Menyusuri Kairo" },
        context: { en: "Your phrasebook is blank. Ask for directions using only what you remember!", ko: "회화집이 비었어요. 기억나는 것만으로 길을 물어보세요!", es: "Tu libro de frases está en blanco. ¡Pide direcciones usando solo lo que recuerdas!", id: "Buku percakapanmu kosong. Tanyakan arah hanya dengan apa yang kamu ingat!" },
        questions: [
          { word: { en: "Excuse me, where is the market?", ko: "실례합니다, 시장이 어디에 있나요?", es: "Disculpe, ¿dónde está el mercado?", id: "Permisi, di mana pasarnya?" }, hint: { en: "Ask for the market location", ko: "시장 위치를 물어보세요", es: "Pregunta por la ubicación del mercado", id: "Tanyakan lokasi pasar" }, acceptableAnswers: ["excuse me where is the market", "where is the market", "where's the market"] },
          { word: { en: "How far is it from here?", ko: "여기서 얼마나 멀어요?", es: "¿Qué tan lejos está de aquí?", id: "Seberapa jauh dari sini?" }, hint: { en: "Ask about the distance", ko: "거리를 물어보세요", es: "Pregunta la distancia", id: "Tanyakan jaraknya" }, acceptableAnswers: ["how far is it from here", "how far is it", "how far from here"] },
          { word: { en: "Thank you for your help.", ko: "도움 감사합니다.", es: "Gracias por su ayuda.", id: "Terima kasih atas bantuannya." }, hint: { en: "Thank the local", ko: "현지인에게 감사하세요", es: "Agradece al local", id: "Berterima kasihlah kepada warga setempat" }, acceptableAnswers: ["thank you for your help", "thanks for your help", "thank you for helping"] },
        ],
      },
      {
        kind: "scene",
        charId: "penny",
        text: "*steps from shadow behind a pillar* Hello, detective. You look surprised. You shouldn't be. I've been following you since London. I helped build the Universal Code. I thought it would create understanding between people. *voice breaks* I was wrong. And I need to make it right.",
        textKo: "*기둥 뒤 그늘에서 나서며* 안녕하세요, 탐정님. 놀란 것 같네요. 그러지 마세요. 런던부터 계속 따라다녔어요. 저는 유니버설 코드를 만드는 걸 도왔어요. 사람들 사이에 이해를 만들 줄 알았어요. *목소리가 갈라지며* 틀렸어요. 그리고 바로잡아야 해요.",
        textKoMix: "*기둥 뒤 그늘에서 나서며* Hello, detective. You look surprised. You shouldn't be. I've been following you since London. I helped build the Universal Code. 사람들 사이에 이해를 만들 줄 알았어요. *목소리가 갈라지며* I was wrong. And I need to make it right.",
        textEs: "*sale de las sombras detrás de un pilar* Hola, detective. Parece sorprendido. No debería. Lo he seguido desde Londres. Ayudé a construir el Código Universal. Pensé que crearía entendimiento entre las personas. *la voz se quiebra* Estaba equivocada. Y necesito arreglarlo.",
        textEsMix: "*sale de las sombras detrás de un pilar* Hello, detective. You look surprised. You shouldn't be. I've been following you since London. I helped build the Universal Code. Pensé que crearía entendimiento entre las personas. *la voz se quiebra* I was wrong. And I need to make it right.",
        textId: "*melangkah dari bayangan di balik pilar* Halo, detektif. Kamu tampak terkejut. Seharusnya tidak. Aku sudah mengikutimu sejak London. Aku ikut membangun Universal Code. Kukira itu akan menciptakan saling pengertian antarmanusia. *suaranya pecah* Aku salah. Dan aku harus memperbaikinya.",
        textIdMix: "*melangkah dari bayangan di balik pilar* Hello, detective. You look surprised. You shouldn't be. I've been following you since London. I helped build the Universal Code. Kukira itu akan menciptakan saling pengertian antarmanusia. *suaranya pecah* I was wrong. And I need to make it right.",
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
            sentence: { en: "Miss Penny's encoded message: 'The stone is ___ the pyramid, where pharaohs first climbed toward the sky.'", ko: "미스 페니의 암호 메시지: '수호석은 파라오가 처음으로 하늘을 향해 올라간 곳, 피라미드 ___ 있어요.'", es: "El mensaje codificado de Miss Penny: 'La piedra está ___ la pirámide, donde los faraones subían por primera vez hacia el cielo.'", id: "Pesan tersandi Miss Penny: 'Batu itu ___ piramida, tempat para firaun pertama kali mendaki menuju langit.'" },
            answer: { en: "near", ko: "근처에", es: "cerca de", id: "dekat" },
            opts: [
              { en: "far from", ko: "멀리", es: "lejos de", id: "jauh dari" },
              { en: "on your left", ko: "왼쪽에", es: "a tu izquierda", id: "di sebelah kirimu" },
            ],
            hints: {
              h1: { ko: "파라오가 '하늘을 향해 올라가는' 장소는 무엇일까? 수호석은 그 장소 가까이에 숨겨져 있어", en: "What place has pharaohs 'climbing toward the sky'? The stone is hidden close to that place", es: "¿Qué lugar tiene a los faraones 'subiendo hacia el cielo'? La piedra está escondida cerca de ese lugar", id: "Tempat apa yang menggambarkan para firaun 'mendaki menuju langit'? Batu itu tersembunyi dekat tempat tersebut" },
              h2: { ko: "사카라 계단 피라미드 — 수호석은 멀리 있는 게 아니라 바로 근처에 있어", en: "Saqqara step pyramid — the stone isn't far away, it's right nearby", es: "Pirámide escalonada de Saqqara — la piedra no está lejos, está justo cerca", id: "Piramida tangga Saqqara — batu itu tidak jauh, justru ada di dekatnya" },
              h3: { ko: "답: near (근처에). 수호석은 사카라 피라미드 근처에 숨겨져 있어", en: "Answer: near. The stone is hidden near Saqqara's pyramid", es: "Respuesta: near (cerca de). La piedra está escondida cerca de la pirámide de Saqqara", id: "Jawaban: near (dekat). Batu itu tersembunyi dekat piramida Saqqara", byLearning: { korean: { ko: "답: 근처에. 수호석은 사카라 피라미드 근처에 숨겨져 있어", en: "Answer: 근처에 (near). The stone is hidden near Saqqara's pyramid", es: "Respuesta: 근처에 (cerca de). La piedra está escondida cerca de la pirámide de Saqqara", id: "Jawaban: 근처에 (dekat). Batu itu tersembunyi dekat piramida Saqqara" }, spanish: { ko: "답: cerca de (근처에). 수호석은 사카라 피라미드 근처에 숨겨져 있어", en: "Answer: cerca de. The stone is hidden near Saqqara's pyramid", es: "Respuesta: cerca de. La piedra está escondida cerca de la pirámide de Saqqara", id: "Jawaban: cerca de (dekat). Batu itu tersembunyi dekat piramida Saqqara" }, indonesian: { ko: "답: dekat (근처에). 수호석은 사카라 피라미드 근처에 숨겨져 있어", en: "Answer: dekat. The stone is hidden near Saqqara's pyramid", es: "Respuesta: dekat (cerca de). La piedra está escondida cerca de la pirámide de Saqqara", id: "Jawaban: dekat. Batu itu tersembunyi dekat piramida Saqqara" } } },
            },
          },
          {
            sentence: { en: "Penny's warning: 'He plans to use all seven stones at ___. After that, the Universal Code cannot be reversed.'", ko: "페니의 경고: '그는 ___에 7개의 수호석 모두를 사용할 계획이야. 그 후에는 유니버설 코드를 되돌릴 수 없어.'", es: "El aviso de Penny: 'Planea usar las siete piedras a ___. Después de eso, el Código Universal no puede revertirse.'", id: "Peringatan Penny: 'Dia berencana menggunakan ketujuh batu pada ___. Setelah itu, Universal Code tidak bisa dibalikkan.'" },
            answer: { en: "midnight", ko: "자정", es: "medianoche", id: "tengah malam" },
            opts: [
              { en: "three o'clock", ko: "세 시", es: "las tres", id: "pukul tiga" },
              { en: "half past seven", ko: "일곱 시 반", es: "las siete y media", id: "pukul setengah delapan" },
            ],
            hints: {
              h1: { ko: "미스터 블랙은 모두가 잠든 시간에 계획을 실행하려 해 — 가장 늦은 시간을 생각해봐", en: "Mr. Black plans to act when everyone is asleep — think of the latest time", es: "Mr. Black planea actuar cuando todos duermen — piensa en la hora más tarde", id: "Mr. Black berencana bertindak saat semua orang tidur — pikirkan waktu paling larut" },
              h2: { ko: "밤 12시, 하루가 끝나고 새로운 날이 시작되는 시간", en: "12 AM, when the day ends and a new day begins", es: "Las 12 de la noche, cuando el día termina y uno nuevo empieza", id: "Pukul 12 malam, saat hari berakhir dan hari baru dimulai" },
              h3: { ko: "답: midnight (자정). 미스터 블랙은 자정에 유니버설 코드를 작동시킬 계획이야", en: "Answer: midnight. Mr. Black plans to launch the Universal Code at midnight", es: "Respuesta: midnight (medianoche). Mr. Black planea lanzar el Código Universal a medianoche", id: "Jawaban: midnight (tengah malam). Mr. Black berencana mengaktifkan Universal Code pada tengah malam", byLearning: { korean: { ko: "답: 자정. 미스터 블랙은 자정에 유니버설 코드를 작동시킬 계획이야", en: "Answer: 자정 (midnight). Mr. Black plans to launch the Universal Code at midnight", es: "Respuesta: 자정 (medianoche). Mr. Black planea lanzar el Código Universal a medianoche", id: "Jawaban: 자정 (tengah malam). Mr. Black berencana mengaktifkan Universal Code pada tengah malam" }, spanish: { ko: "답: medianoche (자정). 미스터 블랙은 자정에 유니버설 코드를 작동시킬 계획이야", en: "Answer: medianoche. Mr. Black plans to launch the Universal Code at midnight", es: "Respuesta: medianoche. Mr. Black planea lanzar el Código Universal a medianoche", id: "Jawaban: medianoche (tengah malam). Mr. Black berencana mengaktifkan Universal Code pada tengah malam" }, indonesian: { ko: "답: tengah malam (자정). 미스터 블랙은 자정에 유니버설 코드를 작동시킬 계획이야", en: "Answer: tengah malam. Mr. Black plans to launch the Universal Code at midnight", es: "Respuesta: tengah malam (medianoche). Mr. Black planea lanzar el Código Universal a medianoche", id: "Jawaban: tengah malam. Mr. Black berencana mengaktifkan Universal Code pada tengah malam" } } },
            },
          },
        ],
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Saqqara. The step pyramid. The oldest stone structure on Earth. Beneath the lowest step, exactly where Penny described, a small chamber. And inside the chamber, still intact, still glowing faintly: the Cairo Guardian Stone.)",
        textKo: "(사카라. 계단 피라미드. 지구상에서 가장 오래된 석조 건축물. 가장 낮은 계단 아래, 페니가 설명한 그 자리, 작은 방이 있다. 그리고 방 안에, 여전히 온전한, 여전히 희미하게 빛나는: 카이로 수호석.)",
        textEs: "(Saqqara. La pirámide escalonada. La estructura de piedra más antigua de la Tierra. Bajo el escalón más bajo, exactamente donde Penny describió, una pequeña cámara. Y dentro de la cámara, todavía intacta, todavía brillando débilmente: la Piedra Guardiana de El Cairo.)",
        textId: "(Saqqara. Piramida tangga. Bangunan batu tertua di Bumi. Di bawah anak tangga terbawah, tepat di tempat yang Penny gambarkan, sebuah ruang kecil. Dan di dalam ruang itu, masih utuh, masih bersinar samar: Batu Penjaga Kairo.)",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "*steps out of shadow* Put it down, Detective. I just want you to understand something first. My mother spoke Welsh. Beautiful language. I was twelve when she died. In the hospital, the nurses didn't speak it. The doctors didn't speak it. She died asking for water in a language no one there understood. 'Dŵr. Dŵr.' *pause* Do you know what that means?",
        textKo: "*그늘에서 나서며* 내려놓아요, 탐정님. 먼저 한 가지를 이해해줬으면 해요. 제 어머니는 웨일스어를 했어요. 아름다운 언어. 제가 열두 살 때 돌아가셨어요. 병원에서 간호사들은 웨일스어를 몰랐어요. 의사들도 몰랐어요. 어머니는 아무도 이해 못 하는 언어로 물을 달라고 하다 돌아가셨어요. 'Dŵr. Dŵr.' *침묵* 그게 무슨 뜻인지 알아요?",
        textKoMix: "*그늘에서 나서며* Put it down, Detective. I just want you to understand something first. My mother spoke Welsh. Beautiful language. I was twelve when she died. In the hospital, the nurses didn't speak it. The doctors didn't speak it. 어머니는 아무도 이해 못 하는 언어로 물을 달라고 하다 돌아가셨어요. 'Dŵr. Dŵr.' *침묵* Do you know what that means?",
        textEs: "*sale de las sombras* Bájala, detective. Solo quiero que entiendas algo primero. Mi madre hablaba galés. Un idioma hermoso. Tenía doce años cuando murió. En el hospital, las enfermeras no lo hablaban. Los médicos tampoco. Murió pidiendo agua en un idioma que nadie allí entendía. 'Dŵr. Dŵr.' *pausa* ¿Sabe lo que significa?",
        textEsMix: "*sale de las sombras* Put it down, Detective. I just want you to understand something first. My mother spoke Welsh. Beautiful language. I was twelve when she died. In the hospital, the nurses didn't speak it. The doctors didn't speak it. Murió pidiendo agua en un idioma que nadie allí entendía. 'Dŵr. Dŵr.' *pausa* Do you know what that means?",
        textId: "*melangkah keluar dari bayangan* Letakkan, Detektif. Aku hanya ingin kamu memahami sesuatu lebih dulu. Ibuku berbahasa Wales. Bahasa yang indah. Aku berusia dua belas tahun saat ia meninggal. Di rumah sakit, para perawat tidak berbahasa itu. Para dokter tidak berbahasa itu. Ia meninggal sambil meminta air dalam bahasa yang tak seorang pun di sana mengerti. 'Dŵr. Dŵr.' *jeda* Tahukah kamu apa artinya?",
        textIdMix: "*melangkah keluar dari bayangan* Put it down, Detective. I just want you to understand something first. My mother spoke Welsh. Beautiful language. I was twelve when she died. In the hospital, the nurses didn't speak it. The doctors didn't speak it. Ia meninggal sambil meminta air dalam bahasa yang tak seorang pun di sana mengerti. 'Dŵr. Dŵr.' *jeda* Do you know what that means?",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Water. It means water. *quietly* And you're going to erase every language on Earth. Because no one spoke your mother's.",
        textKo: "물이요. 물이라는 뜻이에요. *조용히* 그리고 당신은 지구상의 모든 언어를 지우려 해요. 아무도 당신 어머니의 언어를 몰랐기 때문에.",
        textKoMix: "Water. It means water. *조용히* And you're going to erase every language on Earth. 아무도 당신 어머니의 언어를 몰랐기 때문에.",
        textEs: "Agua. Significa agua. *en voz baja* Y vas a borrar todos los idiomas de la Tierra. Porque nadie hablaba el de tu madre.",
        textEsMix: "Water. It means water. *en voz baja* And you're going to erase every language on Earth. Porque nadie hablaba el de tu madre.",
        textId: "Air. Artinya air. *pelan* Dan kamu akan menghapus setiap bahasa di Bumi. Karena tak ada yang berbicara bahasa ibumu.",
        textIdMix: "Water. It means water. *pelan* And you're going to erase every language on Earth. Karena tak ada yang berbicara bahasa ibumu.",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "I'm going to give everyone THE SAME language. No one will ever die alone again. Unable to say what they need. No more Carlos screaming 'help' in a room where no one understands. One language. Universal. Perfect.",
        textKo: "모든 사람에게 같은 언어를 줄 거예요. 더 이상 아무도 혼자 죽지 않아도 돼요. 필요한 걸 말하지 못해서. 카를로스처럼 '도와주세요'를 외치다가 아무도 못 알아듣는 방에서 죽지 않아도 돼요. 하나의 언어. 유니버설. 완벽해.",
        textKoMix: "I'm going to give everyone THE SAME language. No one will ever die alone again. Unable to say what they need. 카를로스처럼 'help'를 외치다가 아무도 못 알아듣는 방에서 죽지 않아도 돼요. One language. Universal. Perfect.",
        textEs: "Voy a darle a todo el mundo EL MISMO idioma. Nadie volverá a morir solo. Sin poder decir lo que necesita. No más Carlos gritando 'ayuda' en una habitación donde nadie entiende. Un idioma. Universal. Perfecto.",
        textEsMix: "I'm going to give everyone THE SAME language. No one will ever die alone again. Unable to say what they need. No más Carlos gritando 'help' en una habitación donde nadie entiende. One language. Universal. Perfect.",
        textId: "Aku akan memberi semua orang BAHASA YANG SAMA. Tak akan ada lagi yang mati sendirian. Tak mampu mengatakan apa yang mereka butuhkan. Tak ada lagi Carlos yang berteriak 'tolong' di ruangan tempat tak seorang pun mengerti. Satu bahasa. Universal. Sempurna.",
        textIdMix: "I'm going to give everyone THE SAME language. No one will ever die alone again. Unable to say what they need. Tak ada lagi Carlos yang berteriak 'help' di ruangan tempat tak seorang pun mengerti. One language. Universal. Perfect.",
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
        storyConsequence: "Miss Penny reveals herself as an ally — but Mr. Black already has the Babel route.",
        onFail: { addToWeakExpressions: ["Where is ___?", "Near the ___"], reviewInDailyCourse: true, reviewDays: 3 },
        questions: [
          {
            prompt: { en: "Mr. Black's logic has a fatal flaw. Which evidence shows his plan would cause MORE harm than it prevents?", ko: "미스터 블랙의 논리에는 치명적인 결함이 있어. 어떤 증거가 그의 계획이 예방하는 것보다 더 큰 해를 끼친다는 걸 보여줘?", es: "La lógica de Mr. Black tiene un defecto fatal. ¿Qué evidencia muestra que su plan causaría MÁS daño del que previene?", id: "Logika Mr. Black punya cacat fatal. Bukti mana yang menunjukkan rencananya akan menyebabkan LEBIH banyak kerusakan daripada yang dicegahnya?" },
            clues: [
              { en: "Carlos only lost his language temporarily. He recovered it. But under Universal Code, loss would be permanent for all 8 billion people.", ko: "카를로스는 일시적으로만 언어를 잃었어. 회복했어. 하지만 유니버설 코드 하에서 80억 명 모두에게 그 상실은 영구적이야.", es: "Carlos solo perdió su idioma temporalmente. Se recuperó. Pero bajo el Código Universal, la pérdida sería permanente para los 8 mil millones de personas.", id: "Carlos hanya kehilangan bahasanya sementara. Ia memulihkannya. Tapi di bawah Universal Code, kehilangan itu akan permanen bagi seluruh 8 miliar orang." },
              { en: "Mr. Black's mother would have been saved if ONE nurse had learned Welsh. The Code would delete Welsh instead of teaching it.", ko: "미스터 블랙의 어머니는 간호사 한 명이 웨일스어를 배웠다면 살 수 있었어. 유니버설 코드는 웨일스어를 가르치는 대신 지울 거야.", es: "La madre de Mr. Black podría haberse salvado si UNA enfermera hubiera aprendido galés. El Código borraría el galés en lugar de enseñarlo.", id: "Ibu Mr. Black bisa terselamatkan andai SATU perawat belajar bahasa Wales. Code itu justru akan menghapus bahasa Wales alih-alih mengajarkannya." },
              { en: "The Universal Code eliminates all grandmother's lullabies, all first words of every child, all poetry ever written.", ko: "유니버설 코드는 모든 할머니의 자장가, 모든 아이의 첫 마디, 쓰여진 모든 시를 없애.", es: "El Código Universal elimina todas las canciones de cuna de las abuelas, todas las primeras palabras de cada niño, toda la poesía jamás escrita.", id: "Universal Code menghapus semua lagu nina bobo para nenek, semua kata pertama setiap anak, semua puisi yang pernah ditulis." },
              { en: "Mr. Black wants coffee from the vending machine on floor 3.", ko: "미스터 블랙은 3층 자판기에서 커피를 원한다.", es: "Mr. Black quiere café de la máquina expendedora del piso 3.", id: "Mr. Black ingin kopi dari mesin penjual otomatis di lantai 3." },
            ],
            answerIdx: 1,
          },
        ],
        hints: {
          h1: { ko: "미스터 블랙의 어머니를 구할 수 있었던 방법을 생각해봐 — 언어를 지우는 것보다 더 나은 해결책이 있었어", en: "Think about what could have saved Mr. Black's mother — there was a better solution than erasing language", es: "Piensa en qué podría haber salvado a la madre de Mr. Black — había una solución mejor que borrar idiomas", id: "Pikirkan apa yang bisa menyelamatkan ibu Mr. Black — ada solusi yang lebih baik daripada menghapus bahasa" },
          h2: { ko: "그의 어머니의 문제는 언어가 너무 많아서가 아니야 — 문제는 웨일스어를 아는 사람이 '없었다'는 거야. 해결책은 지우는 게 아니라 가르치는 거야", en: "His mother's problem wasn't that there were too many languages — the problem was that NO ONE knew Welsh. The solution is teaching, not erasing", es: "El problema de su madre no era que hubiera demasiados idiomas — el problema era que NADIE sabía galés. La solución es enseñar, no borrar", id: "Masalah ibunya bukan karena terlalu banyak bahasa — masalahnya TAK ADA yang tahu bahasa Wales. Solusinya adalah mengajarkan, bukan menghapus" },
          h3: { ko: "답: 두 번째. 진짜 해결책은 웨일스어를 없애는 게 아니라, 더 많은 사람들이 웨일스어를 배우는 거야", en: "Answer: the second one. The real solution is not to delete Welsh, but to teach more people Welsh", es: "Respuesta: la segunda. La solución real no es borrar el galés, sino enseñar más galés", id: "Jawaban: yang kedua. Solusi sebenarnya bukan menghapus bahasa Wales, melainkan mengajarkannya kepada lebih banyak orang" },
        },
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Your mother's language didn't need to be erased. It needed to be learned. By one more person. By the nurse. By the doctor. That's what language does. It spreads, it survives, it connects. Your solution kills the disease by killing the patient.",
        textKo: "어머니의 언어는 지워질 필요가 없었어요. 더 많은 사람들이 배웠어야 했어요. 간호사가. 의사가. 그게 언어가 하는 일이에요. 퍼지고, 살아남고, 연결해요. 당신의 해결책은 환자를 죽여서 병을 치료하는 거예요.",
        textKoMix: "Your mother's language didn't need to be erased. It needed to be learned. By one more person. By the nurse. By the doctor. That's what language does. It spreads, it survives, it connects. 당신의 해결책은 환자를 죽여서 병을 치료하는 거예요.",
        textEs: "El idioma de tu madre no necesitaba ser borrado. Necesitaba ser aprendido. Por una persona más. Por la enfermera. Por el médico. Eso es lo que hace el idioma. Se expande, sobrevive, conecta. Tu solución mata a la paciente para curar la enfermedad.",
        textEsMix: "Your mother's language didn't need to be erased. It needed to be learned. By one more person. By the nurse. By the doctor. That's what language does. It spreads, it survives, it connects. Tu solución mata a la paciente para curar la enfermedad.",
        textId: "Bahasa ibumu tidak perlu dihapus. Ia perlu dipelajari. Oleh satu orang lagi. Oleh perawat itu. Oleh dokter itu. Itulah yang dilakukan bahasa. Ia menyebar, ia bertahan, ia menghubungkan. Solusimu membunuh pasien untuk menyembuhkan penyakitnya.",
        textIdMix: "Your mother's language didn't need to be erased. It needed to be learned. By one more person. By the nurse. By the doctor. That's what language does. It spreads, it survives, it connects. Solusimu membunuh pasien untuk menyembuhkan penyakitnya.",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "*takes the stone* I understand your argument, Detective. It's... not wrong. But I've been building this for thirty years. *vanishes into the dark* Four city stones. Three foundation stones. Seven locks. The clock has already started.",
        textKo: "*수호석을 집어들며* 당신의 논리는 이해해요, 탐정님. 틀리지 않아요. 하지만 30년 동안 이걸 만들어왔어요. *어둠 속으로 사라지며* 5개예요. 5개를 갖고 있어요. 당신에겐 두 번의 기회가 남아 있어요. 시계는 이미 돌아가고 있어요.",
        textKoMix: "*the stone을 집어들며* I understand your argument, Detective. It's... not wrong. 하지만 30년 동안 이걸 만들어왔어요. *어둠 속으로 사라지며* 5개를 갖고 있어요. 당신에겐 두 번의 기회가 남아 있어요. The clock has already started.",
        textEs: "*toma la piedra* Entiendo tu argumento, detective. No está... equivocado. Pero he estado construyendo esto durante treinta años. *desaparece en la oscuridad* Cuatro piedras de ciudad. Tres piedras de cimiento. Siete candados. El reloj ya ha empezado.",
        textEsMix: "*toma the stone* I understand your argument, Detective. It's... not wrong. Pero he estado construyendo esto durante treinta años. *desaparece en la oscuridad* Four city stones. Three foundation stones. Seven locks. The clock has already started.",
        textId: "*mengambil batu itu* Aku mengerti argumenmu, Detektif. Itu... tidak salah. Tapi aku sudah membangun ini selama tiga puluh tahun. *lenyap ke dalam kegelapan* Empat batu kota. Tiga batu fondasi. Tujuh kunci. Jam sudah mulai berdetak.",
        textIdMix: "*mengambil the stone* I understand your argument, Detective. It's... not wrong. Tapi aku sudah membangun ini selama tiga puluh tahun. *lenyap ke dalam kegelapan* Four city stones. Three foundation stones. Seven locks. The clock has already started.",
      },
      {
        kind: "clue",
        symbol: "🗺️",
        titleEn: "The Seven Guardian Stones",
        titleKo: "7개의 수호석",
        titleEs: "Las Siete Piedras Guardianas",
        titleId: "Tujuh Batu Penjaga",
        descEn: "City stones: London, Madrid, Seoul, Cairo. All compromised. Foundation stones: three, hidden at Babel. Total required: seven. Mr. Black has the route. Rudy has the allies. Time: almost gone.",
        descKo: "런던 (빼앗김). 마드리드 (빼앗김). 서울 (빼앗김). 카이로 (빼앗김). 세 개 남음. 두 개의 알 수 없는 도시. 하나의 최종 장소. 미스터 블랙: 5개. 루디: 0개. 시간: 알 수 없음.",
        descEs: "Piedras de ciudad: Londres, Madrid, Seúl, El Cairo. Todas comprometidas. Piedras de cimiento: tres, ocultas en Babel. Total necesario: siete. Mr. Black tiene la ruta. Rudy tiene a sus aliados. Tiempo: casi agotado.",
        descId: "Batu kota: London, Madrid, Seoul, Kairo. Semua sudah dikuasai. Batu fondasi: tiga, tersembunyi di Babel. Total yang dibutuhkan: tujuh. Mr. Black memegang rutenya. Rudy punya para sekutunya. Waktu: hampir habis.",
      },
      {
        kind: "scene",
        charId: "penny",
        text: "There is one place he can be stopped. Where the Universal Code was first designed. The Babel Tower, coordinates that only the four city stones can reveal. The final three are already there, buried in the foundation. But Rudy... you cannot go alone. You need everyone. Every language you've collected. Everyone who helped you.",
        textKo: "그를 막을 수 있는 장소가 하나 있어요. 유니버설 코드가 처음 설계된 곳. 바벨 타워, 7개의 수호석이 합쳐져야만 드러나는 좌표. 하지만 루디... 혼자 갈 수 없어요. 모든 사람이 필요해요. 당신이 모은 모든 언어. 당신을 도운 모든 사람.",
        textKoMix: "There is one place he can be stopped. Where the Universal Code was first designed. The Babel Tower, 7개의 수호석이 합쳐져야만 드러나는 좌표. But Rudy... you cannot go alone. You need everyone. Every language you've collected. Everyone who helped you.",
        textEs: "Hay un lugar donde se le puede detener. Donde el Código Universal fue diseñado por primera vez. La Torre de Babel, coordenadas que solo las cuatro piedras de ciudad pueden revelar. Las últimas tres ya están allí, enterradas en los cimientos. Pero Rudy... no puedes ir solo. Necesitas a todos. Cada idioma que has recopilado. A todos los que te ayudaron.",
        textEsMix: "There is one place he can be stopped. Where the Universal Code was first designed. The Babel Tower, coordinates that only the four city stones can reveal. The final three are already there, buried in the foundation. But Rudy... you cannot go alone. You need everyone. Every language you've collected. A todos los que te ayudaron.",
        textId: "Ada satu tempat di mana ia bisa dihentikan. Tempat Universal Code pertama kali dirancang. Menara Babel, koordinat yang hanya bisa diungkap oleh keempat batu kota. Tiga yang terakhir sudah ada di sana, terkubur di fondasinya. Tapi Rudy... kamu tidak bisa pergi sendirian. Kamu butuh semua orang. Setiap bahasa yang telah kamu kumpulkan. Semua orang yang menolongmu.",
        textIdMix: "There is one place he can be stopped. Where the Universal Code was first designed. The Babel Tower, coordinates that only the four city stones can reveal. The final three are already there, buried in the foundation. But Rudy... you cannot go alone. You need everyone. Every language you've collected. Semua orang yang menolongmu.",
      },
    ],
  },

  /* ════════════════ CHAPTER 5: BABEL ════════════════ */
  babel: {
    id: "babel",
    title: "The Last Language",
    titleKo: "최후의 언어",
    titleEs: "El Último Idioma",
    titleId: "Bahasa Terakhir",
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
      { id: "lingo",    emoji: "🦊",  name: "Detective Rudy",  nameKo: "루디 탐정",    nameId: "Detektif Rudy",  side: "left",  avatarBg: "#2c1810", isLingo: true, portrait: rudyStoryImg, portraitVariants: rudyExpressionSprites },
      { id: "penny",    emoji: "📚",  name: "Miss Penny",      nameKo: "미스 페니",    nameId: "Miss Penny",     side: "right", avatarBg: "#1A0A2A" },
      { id: "tom",      emoji: "💂",  name: "Tom",             nameKo: "톰",           nameId: "Tom",            side: "left",  avatarBg: "#1E2A3A" },
      { id: "isabel",   emoji: "💃",  name: "Isabel",          nameKo: "이사벨",       nameId: "Isabel",         side: "right", avatarBg: "#3A1A0A" },
      { id: "sujin",    emoji: "👩‍🔬", name: "Sujin",           nameKo: "수진",         nameId: "Sujin",          side: "left",  avatarBg: "#1A2A3A" },
      { id: "mr_black", emoji: "🕴️", name: "Mr. Black",       nameKo: "미스터 블랙",  nameId: "Mr. Black",      side: "right", avatarBg: "#0A0A0A" },
    ],
    sequence: [
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(By dawn, every city answered. Tom recovered London during a Lexicon raid. Isabel and Carlos secured Madrid. Sujin intercepted Seoul. Amira and Hassan reclaimed Cairo. The four city stones pulsed together on Rudy's desk and revealed coordinates deep in Mesopotamia. Not an ancient ruin. A modern spire of glass and steel rising from the plain, the Babel Tower. Lexicon Society headquarters. At its peak, light pulses every seven seconds, like a heartbeat.)",
        textKo: "(4개의 수호석이 루디의 책상 위에서 함께 진동하며 메소포타미아 깊숙이 좌표를 드러냈다. 고대 유적이 아니다. 현대적인 유리와 강철로 된 탑이 평원에서 솟아있다. 바벨 타워. 렉시콘 소사이어티 본부. 꼭대기에서 빛이 7초마다 맥동한다, 심장 박동처럼.)",
        textEs: "(Al amanecer, cada ciudad respondió. Tom recuperó Londres durante una redada contra Lexicon. Isabel y Carlos aseguraron Madrid. Sujin interceptó Seúl. Amira y Hassan recuperaron El Cairo. Las cuatro piedras de ciudad pulsaron juntas en el escritorio de Rudy y revelaron coordenadas en lo profundo de Mesopotamia. No una ruina antigua. Una aguja moderna de vidrio y acero que se eleva de la llanura, la Torre de Babel. Cuartel general de la Sociedad Lexicon. En su cima, la luz pulsa cada siete segundos, como un latido.)",
        textId: "(Menjelang fajar, setiap kota menjawab. Tom merebut kembali London saat penggerebekan Lexicon. Isabel dan Carlos mengamankan Madrid. Sujin mencegat Seoul. Amira dan Hassan merebut kembali Kairo. Keempat batu kota berdenyut bersama di meja Rudy dan mengungkap koordinat jauh di dalam Mesopotamia. Bukan reruntuhan kuno. Sebuah menara modern dari kaca dan baja menjulang dari dataran, Menara Babel. Markas besar Lexicon Society. Di puncaknya, cahaya berdenyut setiap tujuh detik, seperti detak jantung.)",
      },
      {
        kind: "scene",
        charId: "penny",
        text: "Five floors. Each one is a language gate. Mr. Black built them as tests. If you can't communicate in the language, the gate won't open. He believed only worthy linguists should reach the top. *quietly* He built them for himself. He passed all five alone.",
        textKo: "5층이야. 각 층이 언어 관문이야. 미스터 블랙이 시험으로 만들었어. 그 언어로 소통하지 못하면 관문이 안 열려. 오직 가치 있는 언어학자만이 꼭대기에 도달해야 한다고 믿었어. *조용히* 자기 자신을 위해 만들었어. 5개 모두 혼자 통과했어.",
        textEs: "Cinco pisos. Cada uno es una puerta lingüística. Mr. Black las construyó como pruebas. Si no puedes comunicarte en ese idioma, la puerta no se abre. Creía que solo los lingüistas dignos debían llegar a la cima. *en voz baja* Las construyó para sí mismo. Las pasó todas solo.",
        textId: "Lima lantai. Masing-masing adalah gerbang bahasa. Mr. Black membangunnya sebagai ujian. Jika kamu tidak bisa berkomunikasi dalam bahasanya, gerbang itu tidak akan terbuka. Ia percaya hanya ahli bahasa yang layak boleh mencapai puncak. *pelan* Ia membangunnya untuk dirinya sendiri. Ia melewati kelimanya sendirian.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Five language gates and a man who wants to erase every word ever spoken. Sounds like a Tuesday. *looks at the assembled group: Tom, Isabel, Sujin, Amira, Penny* Except. This time I'm not alone. Before we face the gates, let's review the most important words from our journey. Know these, and we can face anything.",
        textKo: "5개의 언어 관문과 지금껏 말해진 모든 단어를 지우려는 남자. 화요일 같은 느낌. *모인 그룹을 바라보며: 톰, 이사벨, 수진, 아미라, 페니* 하지만. 이번엔 혼자가 아니야. 관문에 도전하기 전에 여정에서 배운 가장 중요한 단어들을 복습하자. 이것만 알면 뭐든 해낼 수 있어.",
        textEs: "Cinco puertas de idiomas y un hombre que quiere borrar cada palabra jamás pronunciada. Suena como un martes. *mira al grupo reunido: Tom, Isabel, Sujin, Amira, Penny* Excepto que. Esta vez no estoy solo. Antes de enfrentar las puertas, repasemos las palabras más importantes de nuestro viaje. Conócelas y podremos enfrentar cualquier cosa.",
        textId: "Lima gerbang bahasa dan seorang pria yang ingin menghapus setiap kata yang pernah diucapkan. Terdengar seperti hari Selasa. *menatap kelompok yang berkumpul: Tom, Isabel, Sujin, Amira, Penny* Kecuali. Kali ini aku tidak sendirian. Sebelum menghadapi gerbang-gerbang itu, mari kita ulang kata-kata terpenting dari perjalanan kita. Kuasai ini, dan kita bisa menghadapi apa pun.",
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
            word: { en: "Hello", ko: "안녕하세요", es: "Hola", id: "Halo" },
            meaning: { en: "the first word you learn — the beginning of every conversation", ko: "가장 먼저 배우는 단어 — 모든 대화의 시작", es: "la primera palabra que aprendes — el inicio de cada conversación", id: "kata pertama yang kamu pelajari — awal dari setiap percakapan" },
            wrong: [
              { en: "a word you use only when angry", ko: "화날 때만 쓰는 단어", es: "una palabra que usas solo cuando estás enojado", id: "kata yang hanya dipakai saat marah" },
              { en: "a formal document greeting", ko: "공식 문서 인사", es: "un saludo formal de documentos", id: "salam pembuka dokumen resmi" },
              { en: "a word with no meaning", ko: "의미 없는 단어", es: "una palabra sin significado", id: "kata tanpa makna" },
            ],
          },
          {
            word: { en: "Thank you", ko: "감사합니다", es: "Gracias", id: "Terima kasih" },
            meaning: { en: "what you say when someone helps you — gratitude in any language", ko: "누군가 도와줄 때 하는 말 — 어떤 언어에서든 감사의 표현", es: "lo que dices cuando alguien te ayuda — gratitud en cualquier idioma", id: "yang kamu ucapkan saat seseorang menolongmu — rasa terima kasih dalam bahasa apa pun" },
            wrong: [
              { en: "a question about directions", ko: "방향에 대한 질문", es: "una pregunta sobre direcciones", id: "pertanyaan tentang arah" },
              { en: "a way to say goodbye", ko: "작별 인사하는 방법", es: "una forma de despedirse", id: "cara mengucapkan selamat tinggal" },
              { en: "a request for food", ko: "음식 요청", es: "una petición de comida", id: "permintaan makanan" },
            ],
          },
          {
            word: { en: "Are you okay?", ko: "괜찮으세요?", es: "¿Estás bien?", id: "Kamu baik-baik saja?" },
            meaning: { en: "asking if someone is well — showing you care about them", ko: "누군가의 안부를 묻는 것 — 관심을 보여주는 것", es: "preguntar si alguien está bien — mostrar que te importa", id: "menanyakan keadaan seseorang — menunjukkan bahwa kamu peduli" },
            wrong: [
              { en: "asking for the time", ko: "시간을 묻는 것", es: "preguntar la hora", id: "menanyakan waktu" },
              { en: "ordering food at a restaurant", ko: "식당에서 주문하는 것", es: "pedir comida en un restaurante", id: "memesan makanan di restoran" },
              { en: "asking for directions to the subway", ko: "지하철 방향을 묻는 것", es: "pedir direcciones al metro", id: "menanyakan arah ke stasiun kereta bawah tanah" },
            ],
          },
        ],
        hints: {
          h1: { ko: "루디가 이 여정에서 배운 가장 중요한 단어들을 생각해봐 — Unit 1부터 지금까지", en: "Think about the most important words Rudy learned on this journey — from Unit 1 until now", es: "Piensa en las palabras más importantes que Rudy aprendió — desde la Unidad 1 hasta ahora", id: "Pikirkan kata-kata terpenting yang Rudy pelajari dalam perjalanan ini — dari Unit 1 sampai sekarang" },
          h2: { ko: "이 단어들은 사람과 사람을 연결하는 기본 표현이야 — 인사, 감사, 걱정", en: "These words are basic expressions that connect people — greeting, gratitude, concern", es: "Estas palabras son expresiones básicas que conectan personas — saludo, gratitud, preocupación", id: "Kata-kata ini adalah ungkapan dasar yang menghubungkan orang — sapaan, terima kasih, perhatian" },
          h3: {
            ko: "Hello = 모든 대화의 시작 / Thank you = 감사 표현 / Are you okay? = 관심과 걱정",
            en: "Hello = start of every conversation / Thank you = gratitude / Are you okay? = caring and concern",
            es: "Hello = inicio de conversación / Thank you = gratitud / Are you okay? = cuidado y preocupación",
            id: "Hello = awal setiap percakapan / Thank you = rasa terima kasih / Are you okay? = perhatian dan kepedulian",
            byLearning: {
              spanish: { ko: "Hola = 모든 대화의 시작 / Gracias = 감사 표현 / ¿Estás bien? = 관심과 걱정", en: "Hola = start of every conversation / Gracias = gratitude / ¿Estás bien? = caring and concern", es: "Hola = inicio de conversación / Gracias = gratitud / ¿Estás bien? = cuidado y preocupación", id: "Hola = awal setiap percakapan / Gracias = rasa terima kasih / ¿Estás bien? = perhatian dan kepedulian" },
              korean: { ko: "안녕하세요 = 모든 대화의 시작 / 감사합니다 = 감사 표현 / 괜찮으세요? = 관심과 걱정", en: "안녕하세요 = start of every conversation / 감사합니다 = gratitude / 괜찮으세요? = caring and concern", es: "안녕하세요 = inicio de conversación / 감사합니다 = gratitud / 괜찮으세요? = cuidado y preocupación", id: "안녕하세요 = awal setiap percakapan / 감사합니다 = rasa terima kasih / 괜찮으세요? = perhatian dan kepedulian" },
              english: { ko: "Hello = 모든 대화의 시작 / Thank you = 감사 표현 / Are you okay? = 관심과 걱정", en: "Hello = start of every conversation / Thank you = gratitude / Are you okay? = caring and concern", es: "Hello = inicio de conversación / Thank you = gratitud / Are you okay? = cuidado y preocupación", id: "Hello = awal setiap percakapan / Thank you = rasa terima kasih / Are you okay? = perhatian dan kepedulian" },
              indonesian: { ko: "Halo = 모든 대화의 시작 / Terima kasih = 감사 표현 / Kamu baik-baik saja? = 관심과 걱정", en: "Halo = start of every conversation / Terima kasih = gratitude / Kamu baik-baik saja? = caring and concern", es: "Halo = inicio de conversación / Terima kasih = gratitud / Kamu baik-baik saja? = cuidado y preocupación", id: "Halo = awal setiap percakapan / Terima kasih = rasa terima kasih / Kamu baik-baik saja? = perhatian dan kepedulian" },
            },
          },
        },
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Good. You remember the words. Now use them to open the gates. Each gate demands you prove you can communicate, not just know words, but use them with meaning.)",
        textKo: "(좋아. 단어들을 기억하고 있네. 이제 관문을 열 때 써먹을 차례야. 각 관문은 단어만 아는 게 아니라 의미를 담아 소통할 수 있는지 증명하라고 요구해.)",
        textEs: "(Bien. Recuerdas las palabras. Ahora úsalas para abrir las puertas. Cada puerta exige que demuestres que puedes comunicarte, no solo saber palabras, sino usarlas con significado.)",
        textId: "(Bagus. Kamu mengingat kata-katanya. Sekarang gunakan untuk membuka gerbang-gerbangnya. Setiap gerbang menuntutmu membuktikan bahwa kamu bisa berkomunikasi, bukan sekadar tahu kata, tapi memakainya dengan makna.)",
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
            prompt: { en: "Floor 1: English Gate. Tom is on the radio — but the gate speaks only in English riddles. What do you say to open it?", ko: "1층: 영어 관문. 톰이 무선으로 연결되어 있어 — 하지만 관문은 영어 수수께끼로만 말해. 어떻게 열어?", es: "Piso 1: Puerta de inglés. Tom está en el radio — pero la puerta solo habla en acertijos en inglés. ¿Qué dices para abrirla?", id: "Lantai 1: Gerbang Inggris. Tom ada di radio — tapi gerbang itu hanya berbicara dalam teka-teki bahasa Inggris. Apa yang kamu ucapkan untuk membukanya?" },
            context: { en: "Gate: 'I start every conversation, I end every goodbye. What word am I?' Tom: 'Blimey, Rudy! That's the first word we taught you! Think!'", ko: "관문: '나는 모든 대화를 시작하고, 모든 작별 인사를 끝낼 수 있어. 나는 어떤 단어야?' 톰: '이런, 루디! 그게 우리가 처음 가르친 단어야! 생각해!'", es: "Puerta: 'Empiezo cada conversación, termino cada despedida. ¿Qué palabra soy?' Tom: '¡Mira, Rudy! ¡Esa es la primera palabra que te enseñamos! ¡Piensa!'", id: "Gerbang: 'Aku memulai setiap percakapan, aku mengakhiri setiap perpisahan. Kata apakah aku?' Tom: 'Astaga, Rudy! Itu kata pertama yang kami ajarkan padamu! Pikirkan!'" },
            answer: { en: "Hello. And goodbye. And hello again — because every ending is a new beginning.", ko: "Hello. 그리고 goodbye. 그리고 또 hello — 왜냐하면 모든 끝은 새로운 시작이니까.", es: "Hello. Y goodbye. Y hello otra vez — porque cada final es un nuevo comienzo.", id: "Hello. Dan goodbye. Dan hello lagi — karena setiap akhir adalah awal yang baru." },
            wrong: [
              { en: "I need to think about this more carefully.", ko: "더 신중하게 생각해봐야 해.", es: "Necesito pensar más cuidadosamente en esto.", id: "Aku harus memikirkan ini lebih hati-hati." },
              { en: "Tom, what is the answer?", ko: "톰, 답이 뭐야?", es: "Tom, ¿cuál es la respuesta?", id: "Tom, apa jawabannya?" },
            ],
          },
          {
            prompt: { en: "Floor 2: Spanish Gate. Isabel is here. The gate requires a genuine greeting — not just words, but meaning.", ko: "2층: 스페인어 관문. 이사벨이 여기 있어. 관문은 진심 어린 인사를 요구해 — 단어만이 아니라 의미도.", es: "Piso 2: Puerta de español. Isabel está aquí. La puerta requiere un saludo genuino — no solo palabras, sino significado.", id: "Lantai 2: Gerbang Spanyol. Isabel ada di sini. Gerbang itu menuntut sapaan yang tulus — bukan sekadar kata, tapi makna." },
            context: { en: "Gate: 'Say it like you mean it. In Spanish.' Isabel: '¡Ánimo, detective! You know this — I heard you try it in Madrid!'", ko: "관문: '진심으로 말해봐. 스페인어로.' 이사벨: '힘내요, 탐정님! 알잖아요 — 마드리드에서 해보는 거 들었거든요!'", es: "Puerta: 'Dilo como si lo dijeras en serio. En español.' Isabel: '¡Ánimo, detective! Sabes esto — ¡te escuché intentarlo en Madrid!'", id: "Gerbang: 'Ucapkan dengan sungguh-sungguh. Dalam bahasa Spanyol.' Isabel: '¡Ánimo, detektif! Kamu tahu ini — aku dengar kamu mencobanya di Madrid!'" },
            answer: { en: "Buenos días. Gracias. Lo siento. Adiós. *and everything in between — all the words that connect us*", ko: "Buenos días. Gracias. Lo siento. Adiós. *그리고 그 사이의 모든 것 — 우리를 연결하는 모든 단어*", es: "Buenos días. Gracias. Lo siento. Adiós. *y todo lo que hay en medio — todas las palabras que nos conectan*", id: "Buenos días. Gracias. Lo siento. Adiós. *dan semua yang ada di antaranya — semua kata yang menghubungkan kita*" },
            wrong: [
              { en: "¿Cómo estás? — that's all I know in Spanish.", ko: "¿Cómo estás? — 그게 내가 아는 스페인어 전부야.", es: "¿Cómo estás? — eso es todo lo que sé en español.", id: "¿Cómo estás? — hanya itu yang aku tahu dalam bahasa Spanyol." },
              { en: "Isabel, please do this for me.", ko: "이사벨, 제발 대신 해줘.", es: "Isabel, por favor hazlo tú por mí.", id: "Isabel, tolong lakukan ini untukku." },
            ],
          },
        ],
        hints: {
          h1: { ko: "각 관문은 당신이 이미 배운 언어를 요구해 — Unit 1부터 지금까지 배운 것들을 기억해봐", en: "Each gate requires languages you already learned — remember everything from Unit 1 until now", es: "Cada puerta requiere idiomas que ya aprendiste — recuerda todo desde la Unidad 1 hasta ahora", id: "Setiap gerbang menuntut bahasa yang sudah kamu pelajari — ingat semuanya dari Unit 1 sampai sekarang" },
          h2: { ko: "진심은 언어보다 중요해 — 완벽하게 말하려 하지 말고, 의미를 담아 말해봐", en: "Sincerity matters more than perfection — don't try to speak perfectly, speak with meaning", es: "La sinceridad importa más que la perfección — no intentes hablar perfectamente, habla con significado", id: "Ketulusan lebih penting daripada kesempurnaan — jangan berusaha bicara sempurna, bicaralah dengan makna" },
          h3: { ko: "1층 답: 'Hello' (시작과 끝을 모두 담은 단어) / 2층 답: 기초 스페인어 인사들의 조합", en: "Floor 1 answer: 'Hello' (the word that contains both beginning and end) / Floor 2: combine basic Spanish greetings", es: "Piso 1 respuesta: 'Hello' (la palabra que contiene principio y fin) / Piso 2: combina saludos básicos en español", id: "Jawaban lantai 1: 'Hello' (kata yang memuat awal sekaligus akhir) / Lantai 2: gabungkan sapaan dasar bahasa Spanyol" },
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
        title: { en: "Rally Your Allies", ko: "동료들을 격려하기", es: "Reunir a tus Aliados", id: "Kobarkan Semangat Sekutumu" },
        context: { en: "Before entering the tower, say a word of encouragement to each ally. They came from around the world — speak from the heart!", ko: "탑에 들어가기 전에 동료들에게 격려의 말을 하세요. 전 세계에서 도우러 왔어요 — 진심을 담아 말하세요!", es: "Antes de entrar en la torre, di unas palabras de aliento. ¡Han venido de todo el mundo — habla con el corazón!", id: "Sebelum memasuki menara, ucapkan kata penyemangat kepada setiap sekutu. Mereka datang dari seluruh dunia — bicaralah dari hati!" },
        questions: [
          { word: { en: "Tom, thank you for believing in us from the start.", ko: "톰, 처음부터 우리를 믿어줘서 고마워.", es: "Tom, gracias por creer en nosotros desde el principio.", id: "Tom, terima kasih sudah memercayai kami sejak awal." }, hint: { en: "Thank Tom for his trust", ko: "톰의 신뢰에 감사하세요", es: "Agradece a Tom su confianza", id: "Berterima kasihlah kepada Tom atas kepercayaannya" }, acceptableAnswers: ["tom thank you for believing in us", "thank you for believing in us", "tom thanks for believing in us from the start"] },
          { word: { en: "Isabel, your brother would be proud of you.", ko: "이사벨, 네 동생이 자랑스러워할 거야.", es: "Isabel, tu hermano estaría orgulloso de ti.", id: "Isabel, kakakmu pasti bangga padamu." }, hint: { en: "Encourage Isabel about Carlos", ko: "카를로스에 대해 이사벨을 격려하세요", es: "Anima a Isabel sobre Carlos", id: "Beri semangat Isabel tentang Carlos" }, acceptableAnswers: ["isabel your brother would be proud of you", "your brother would be proud of you", "isabel your brother would be proud"] },
          { word: { en: "Together, we can stop this. Let's go.", ko: "함께라면 이걸 막을 수 있어. 가자.", es: "Juntos podemos detener esto. Vamos.", id: "Bersama, kita bisa menghentikan ini. Ayo." }, hint: { en: "Rally everyone for the final mission", ko: "최종 미션을 위해 모두를 격려하세요", es: "Reúne a todos para la misión final", id: "Kobarkan semangat semua orang untuk misi terakhir" }, acceptableAnswers: ["together we can stop this lets go", "together we can stop this", "we can stop this lets go"] },
        ],
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Four floors. Four gates. Four languages. The fifth floor chamber opens to reveal seven stone pedestals arranged in a circle. Four stones already glow in their places, carried here by Rudy and the allies who refused to let their languages disappear. The Universal Code hums at its center, waiting for the final three.)",
        textKo: "(4층. 4개의 관문. 4개의 언어. 5층 방이 열리며 원형으로 배치된 7개의 수호석 받침대를 드러낸다. 4개의 수호석이 이미 자리에서 빛난다, 미스터 블랙의 컬렉션. 유니버설 코드가 중앙에서 윙윙거리며 마지막 세 개를 기다린다.)",
        textEs: "(Cuatro pisos. Cuatro puertas. Cuatro idiomas. La cámara del quinto piso se abre para revelar siete pedestales de piedra dispuestos en círculo. Cuatro piedras ya brillan en sus lugares, traídas por Rudy y los aliados que se negaron a dejar desaparecer sus idiomas. El Código Universal zumba en su centro, esperando las últimas tres.)",
        textId: "(Empat lantai. Empat gerbang. Empat bahasa. Ruang di lantai kelima terbuka, memperlihatkan tujuh tumpuan batu yang tersusun melingkar. Empat batu sudah bersinar di tempatnya, dibawa ke sini oleh Rudy dan para sekutu yang menolak membiarkan bahasa mereka lenyap. Universal Code berdengung di tengahnya, menanti tiga yang terakhir.)",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "*stands at the center* You made it. All five gates. I'm... genuinely impressed. *almost sad* But you're too late. The last three stones were always here, hidden in the tower's foundation for a hundred years. I found them twenty years ago.",
        textKo: "*중앙에 서서* 해냈군요. 5개 관문 모두. 정말로... 감동이에요. *거의 슬프게* 하지만 너무 늦었어요. 마지막 세 개의 수호석은 항상 여기 있었어요, 100년 동안 탑의 기초에 숨겨져 있었어요. 20년 전에 찾았어요.",
        textEs: "*de pie en el centro* Lo lograste. Las cinco puertas. Estoy... genuinamente impresionado. *casi triste* Pero llegas demasiado tarde. Las últimas tres piedras siempre estuvieron aquí, escondidas en los cimientos de la torre durante cien años. Las encontré hace veinte años.",
        textId: "*berdiri di tengah* Kamu berhasil. Kelima gerbang. Aku... benar-benar terkesan. *nyaris sedih* Tapi kamu terlambat. Tiga batu terakhir selalu ada di sini, tersembunyi di fondasi menara selama seratus tahun. Aku menemukannya dua puluh tahun lalu.",
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
            instruction: { en: "Floor 3: Korean Gate. Sujin is with you. Build the sentence that opens the gate — in Korean: 'My friend is very kind.'", ko: "3층: 한국어 관문. 수진이 함께 있어. 관문을 여는 문장을 만들어 — 한국어로: '제 친구는 매우 친절해요.'", es: "Piso 3: Puerta de coreano. Sujin está contigo. Construye la frase que abre la puerta — en coreano: '제 친구는 매우 친절해요.'", id: "Lantai 3: Gerbang Korea. Sujin bersamamu. Susun kalimat yang membuka gerbang — dalam bahasa Korea: '제 친구는 매우 친절해요.'" },
            words: [
              { en: "my", ko: "제", es: "mi", id: "saya punya" },
              { en: "friend (topic)", ko: "친구는", es: "amigo", id: "teman (topik)" },
              { en: "very", ko: "매우", es: "muy", id: "sangat" },
              { en: "kind", ko: "친절해요", es: "amable", id: "baik hati" },
            ],
            answerOrder: [0, 1, 2, 3],
          },
        ],
        hints: {
          h1: { ko: "한국어 어순은 영어와 달라: 소유격 → 주어 → 부사 → 형용사 순서야", en: "Korean word order differs from English: Possessive → Subject → Adverb → Adjective", es: "El orden de palabras en coreano difiere del español: Posesivo → Sujeto → Adverbio → Adjetivo", id: "Urutan kata bahasa Korea berbeda dari bahasa Inggris: Posesif → Subjek → Adverbia → Adjektiva" },
          h2: { ko: "'제'가 먼저 (소유격), '친구는' (주어), '매우' (부사), '친절해요' (형용사)로 끝내", en: "'제' first (my), then '친구는' (friend+topic), '매우' (very), end with '친절해요' (kind)", es: "'제' primero (mi), luego '친구는' (amigo+tema), '매우' (muy), termina con '친절해요' (amable)", id: "'제' dulu (saya punya), lalu '친구는' (teman+topik), '매우' (sangat), akhiri dengan '친절해요' (baik hati)" },
          h3: { ko: "답: 제 → 친구는 → 매우 → 친절해요 (My friend is very kind)", en: "Answer: 제 → 친구는 → 매우 → 친절해요 (My friend is very kind)", es: "Respuesta: 제 → 친구는 → 매우 → 친절해요 (Mi amigo es muy amable)", id: "Jawaban: 제 → 친구는 → 매우 → 친절해요 (Teman saya sangat baik hati)" },
        },
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "You're right about one thing. Language IS power. But not because you control it. Because it connects people. Your mother's Welsh, 'Dŵr,' water, that word didn't die with her. It lives in anyone who ever heard her say it. In you. You've been carrying it for thirty years.",
        textKo: "한 가지는 맞아요. 언어는 힘이에요. 하지만 당신이 통제하기 때문이 아니라. 사람들을 연결하기 때문이에요. 어머니의 웨일스어, 'Dŵr,' 물, 그 단어는 어머니와 함께 죽지 않았어요. 그것을 들은 모든 사람 속에 살아있어요. 당신 안에. 30년 동안 그걸 간직해왔어요.",
        textEs: "Tienes razón en una cosa. El idioma ES poder. Pero no porque lo controles. Sino porque conecta personas. El galés de tu madre, 'Dŵr,' agua, esa palabra no murió con ella. Vive en todos los que alguna vez la oyeron decirla. En ti. La has llevado durante treinta años.",
        textId: "Kamu benar dalam satu hal. Bahasa ITU kekuatan. Tapi bukan karena kamu mengendalikannya. Melainkan karena ia menghubungkan orang. Bahasa Wales ibumu, 'Dŵr,' air, kata itu tidak mati bersamanya. Ia hidup dalam diri siapa pun yang pernah mendengarnya mengucapkannya. Dalam dirimu. Kamu telah membawanya selama tiga puluh tahun.",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "*long pause* She used to sing. A lullaby. 'Suo Gân.' I still know every word. *looks at his hands* But I haven't... spoken it. To anyone. *quietly* I've been trying to save her language by destroying all the others.",
        textKo: "*긴 침묵* 어머니는 노래를 불렀어요. 자장가. 'Suo Gân.' 아직도 모든 가사를 알아요. *손을 바라보며* 하지만... 말하지 않았어요. 아무에게도. *조용히* 다른 모든 언어를 파괴해서 어머니의 언어를 구하려 했던 거예요.",
        textEs: "*larga pausa* Ella solía cantar. Una canción de cuna. 'Suo Gân.' Todavía sé cada palabra. *mira sus manos* Pero no la he... hablado. A nadie. *en voz baja* He estado intentando salvar el idioma de ella destruyendo todos los demás.",
        textId: "*jeda panjang* Dulu ia sering bernyanyi. Sebuah lagu nina bobo. 'Suo Gân.' Aku masih hafal setiap katanya. *menatap tangannya* Tapi aku belum... mengucapkannya. Kepada siapa pun. *pelan* Aku berusaha menyelamatkan bahasanya dengan menghancurkan semua bahasa lain.",
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
            prompt: { en: "The Universal Code can still be stopped. Which action breaks the activation sequence?", ko: "유니버설 코드는 아직 멈출 수 있어. 어떤 행동이 활성화 순서를 끊어?", es: "El Código Universal aún puede detenerse. ¿Qué acción interrumpe la secuencia de activación?", id: "Universal Code masih bisa dihentikan. Tindakan mana yang memutus urutan aktivasi?" },
            clues: [
              { en: "Smash the central device with a heavy object.", ko: "무거운 물건으로 중앙 장치를 부수기.", es: "Destrozar el dispositivo central con un objeto pesado.", id: "Menghancurkan perangkat pusat dengan benda berat." },
              { en: "Remove one Guardian Stone from its pedestal — breaking the circuit of seven.", ko: "받침대에서 수호석 하나를 제거하기 — 7개의 회로를 끊기.", es: "Retirar una Piedra Guardiana de su pedestal — rompiendo el circuito de siete.", id: "Mengangkat satu Batu Penjaga dari tumpuannya — memutus rangkaian tujuh." },
              { en: "Ask Mr. Black to stop voluntarily — he has the override code.", ko: "미스터 블랙에게 자발적으로 멈추라고 부탁하기 — 그에게 재정의 코드가 있어.", es: "Pedirle a Mr. Black que se detenga voluntariamente — él tiene el código de anulación.", id: "Meminta Mr. Black berhenti secara sukarela — dia memegang kode pembatalan." },
              { en: "Wait for the timer to run out on its own.", ko: "타이머가 스스로 끝나길 기다리기.", es: "Esperar a que el temporizador se agote por sí solo.", id: "Menunggu penghitung waktu habis dengan sendirinya." },
            ],
            answerIdx: 2,
          },
        ],
        hints: {
          h1: { ko: "파괴적인 행동은 예상치 못한 결과를 낳을 수 있어 — 가장 안전한 방법을 찾아봐", en: "Destructive actions can have unexpected consequences — look for the safest method", es: "Las acciones destructivas pueden tener consecuencias inesperadas — busca el método más seguro", id: "Tindakan yang merusak bisa menimbulkan akibat tak terduga — carilah cara yang paling aman" },
          h2: { ko: "미스터 블랙은 방금 돌아가신 어머니에 대해 이야기했어 — 그에게는 아직 양심이 있어", en: "Mr. Black just talked about his late mother — he still has a conscience", es: "Mr. Black acaba de hablar de su madre fallecida — todavía tiene conciencia", id: "Mr. Black baru saja bercerita tentang mendiang ibunya — dia masih punya hati nurani" },
          h3: { ko: "답: 세 번째. 미스터 블랙이 의식적으로 멈추는 게 유일한 완전한 해결책이야 — 그는 재정의 코드를 갖고 있어", en: "Answer: the third one. Mr. Black choosing to stop is the only complete solution — he holds the override code", es: "Respuesta: la tercera. Mr. Black eligiendo detenerse es la única solución completa — él tiene el código de anulación", id: "Jawaban: yang ketiga. Mr. Black memilih berhenti adalah satu-satunya solusi yang utuh — dia memegang kode pembatalan" },
        },
      },
      {
        kind: "scene",
        charId: "penny",
        text: "*steps forward* I was his student. When I helped build this, I believed in it too. That one shared language would mean no more wars over misunderstanding. No more deaths like your mother's. *to Mr. Black* But I was wrong. And you taught me something else, that learning someone's language is how you say: I see you. I am trying to understand you. You matter.",
        textKo: "*앞으로 나서며* 저는 그의 학생이었어요. 이걸 만드는 걸 도울 때 저도 믿었어요. 하나의 공유된 언어가 오해로 인한 전쟁이 없어짐을 의미한다고. 당신 어머니 같은 죽음이 없어짐을. *미스터 블랙에게* 하지만 틀렸어요. 그리고 당신은 저에게 다른 것을 가르쳐줬어요. 누군가의 언어를 배우는 것이 이렇게 말하는 방법이라는 것을: 당신이 보여요. 이해하려 노력하고 있어요. 당신은 소중해요.",
        textEs: "*da un paso adelante* Fui su estudiante. Cuando ayudé a construir esto, también lo creía. Que un idioma compartido significaría no más guerras por malentendidos. No más muertes como la de tu madre. *a Mr. Black* Pero estaba equivocada. Y tú me enseñaste algo más, que aprender el idioma de alguien es la forma de decir: te veo. Estoy intentando entenderte. Eres importante.",
        textId: "*melangkah maju* Aku dulu muridnya. Saat aku ikut membangun ini, aku juga memercayainya. Bahwa satu bahasa bersama berarti tak ada lagi perang akibat salah paham. Tak ada lagi kematian seperti ibumu. *kepada Mr. Black* Tapi aku salah. Dan kau mengajariku sesuatu yang lain, bahwa mempelajari bahasa seseorang adalah cara untuk berkata: aku melihatmu. Aku berusaha memahamimu. Kau berarti.",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "*very long pause. Looks at each stone. Looks at Rudy. Looks at Penny.* ...Mae'r iaith yn fyw. *Welsh: The language lives.* *places his hand on the override panel* I never wanted to destroy language. I wanted... I just wanted my mother to be heard.",
        textKo: "*아주 긴 침묵. 각 수호석을 바라본다. 루디를 바라본다. 페니를 바라본다.* ...Mae'r iaith yn fyw. *웨일스어: 언어는 살아있다.* *재정의 패널에 손을 올리며* 언어를 파괴하고 싶었던 게 아니야. 원한 건... 어머니의 말이 들려지기를 원했을 뿐이야.",
        textEs: "*pausa muy larga. Mira cada piedra. Mira a Rudy. Mira a Penny.* ...Mae'r iaith yn fyw. *Galés: El idioma vive.* *coloca su mano en el panel de anulación* Nunca quise destruir el idioma. Quería... solo quería que escucharan a mi madre.",
        textId: "*jeda yang sangat panjang. Menatap setiap batu. Menatap Rudy. Menatap Penny.* ...Mae'r iaith yn fyw. *Bahasa Wales: Bahasa itu hidup.* *meletakkan tangannya di panel pembatalan* Aku tak pernah ingin menghancurkan bahasa. Aku ingin... aku hanya ingin ibuku didengar.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(The Universal Code shuts down. One by one, the seven Guardian Stones release from their pedestals. The chamber goes quiet. Then, from everywhere at once. Voices. Dozens. Hundreds. In every language. Tom on the radio. Isabel from Madrid. Sujin's voice from Seoul. Youngsook's from Gwangjang Market. Amira reciting in Arabic. Hassan in four languages at once. And underneath all of it, faint and clear: a Welsh lullaby.)",
        textKo: "(유니버설 코드가 종료된다. 하나씩, 7개의 수호석이 받침대에서 풀려난다. 방이 조용해진다. 그때, 사방에서 한꺼번에. 목소리들. 수십 개. 수백 개. 모든 언어로. 무선에서 톰. 마드리드에서 이사벨. 서울에서 수진의 목소리. 광장시장에서 영숙 할머니. 아랍어로 독경하는 아미라. 한꺼번에 네 개 언어로 말하는 하산. 그리고 그 모든 것 아래, 희미하고 선명하게: 웨일스 자장가.)",
        textEs: "(El Código Universal se apaga. Una por una, las siete Piedras Guardianas se liberan de sus pedestales. La cámara queda en silencio. Entonces, desde todas partes a la vez. Voces. Decenas. Cientos. En cada idioma. Tom en el radio. Isabel desde Madrid. La voz de Sujin desde Seúl. La de Youngsook desde el Mercado Gwangjang. Amira recitando en árabe. Hassan en cuatro idiomas a la vez. Y debajo de todo, tenue y claro: una nana en galés.)",
        textId: "(Universal Code mati. Satu per satu, ketujuh Batu Penjaga terlepas dari tumpuannya. Ruang itu menjadi sunyi. Lalu, dari segala arah sekaligus. Suara-suara. Puluhan. Ratusan. Dalam setiap bahasa. Tom di radio. Isabel dari Madrid. Suara Sujin dari Seoul. Suara Youngsook dari Pasar Gwangjang. Amira melantunkan dalam bahasa Arab. Hassan dalam empat bahasa sekaligus. Dan di bawah semuanya, samar dan jernih: sebuah lagu nina bobo Wales.)",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Languages aren't tools. They're not systems. They're not barriers. They're people. Every single word is someone who spoke it, someone who heard it, someone who needed it. And as long as people exist, no device, no code, can ever erase them. *to Mr. Black* Mae'r iaith yn fyw. Your mother's language lives. It lives in you.",
        textKo: "언어는 도구가 아니에요. 시스템도 아니에요. 장벽도 아니에요. 사람이에요. 모든 단어 하나하나가 그것을 말한 누군가, 들은 누군가, 필요했던 누군가예요. 그리고 사람이 존재하는 한, 어떤 장치도, 어떤 코드도, 그것들을 지울 수 없어요. *미스터 블랙에게* Mae'r iaith yn fyw. 어머니의 언어는 살아있어요. 당신 안에 살아있어요.",
        textEs: "Los idiomas no son herramientas. No son sistemas. No son barreras. Son personas. Cada palabra es alguien que la habló, alguien que la oyó, alguien que la necesitó. Y mientras existan personas, ningún dispositivo, ningún código, podrá borrarlos jamás. *a Mr. Black* Mae'r iaith yn fyw. El idioma de tu madre vive. Vive en ti.",
        textId: "Bahasa bukanlah alat. Bukan sistem. Bukan penghalang. Mereka adalah manusia. Setiap kata adalah seseorang yang mengucapkannya, seseorang yang mendengarnya, seseorang yang membutuhkannya. Dan selama manusia ada, tak ada perangkat, tak ada kode, yang bisa menghapus mereka. *kepada Mr. Black* Mae'r iaith yn fyw. Bahasa ibumu hidup. Ia hidup dalam dirimu.",
      },
      {
        kind: "clue",
        symbol: "🌍",
        titleEn: "The Language Conspiracy, Solved",
        titleKo: "언어 음모, 해결",
        titleEs: "La Conspiración del Lenguaje, Resuelta",
        titleId: "Konspirasi Bahasa, Terpecahkan",
        descEn: "Seven Guardian Stones returned to their keepers. The Universal Code dismantled. Mr. Black surrendered. Not defeated, but understood. Miss Penny: pardoned. Carlos: recovered. Every language on Earth: intact. Detective Rudy: no longer a detective. Now a Language Guardian.",
        descKo: "7개의 수호석이 수호자들에게 돌아갔다. 유니버설 코드가 해체되었다. 미스터 블랙이 항복했다. 패배한 것이 아니라, 이해된 것이다. 미스 페니: 사면. 카를로스: 회복. 지구상의 모든 언어: 온전하다. 루디 탐정: 더 이상 탐정이 아니다. 이제는 언어 수호자.",
        descEs: "Siete Piedras Guardianas devueltas a sus guardianes. El Código Universal desmantelado. Mr. Black se rindió. No derrotado, sino comprendido. Miss Penny: perdonada. Carlos: recuperado. Cada idioma en la Tierra: intacto. Detective Rudy: ya no es detective. Ahora es Guardián del Idioma.",
        descId: "Tujuh Batu Penjaga kembali kepada para penjaganya. Universal Code dibongkar. Mr. Black menyerah. Bukan dikalahkan, melainkan dipahami. Miss Penny: diampuni. Carlos: pulih. Setiap bahasa di Bumi: utuh. Detektif Rudy: tak lagi seorang detektif. Kini seorang Penjaga Bahasa.",
      },
    ],
  },

};

/* ─────────────────── UNLOCK HELPER ─────────────────── */

const MADRID_V21_STORY: Story = {
  id: "madrid",
  title: "The Festival Without Color",
  titleKo: "색을 잃은 마드리드 축제",
  titleEs: "El Festival Sin Color",
  titleId: "Festival Tanpa Warna",
  gradient: ["#0D0F1F", "#3A1010", "#A84A2A"],
  accentColor: C.gold,
  nextChapterId: "seoul",
  chapterMeta: {
    cefrLevel: "A1",
    targetLangRatio: 38,
    knownExpressions: ["Hello", "Thank you", "Goodbye", "I am happy", "It is beautiful", "Where is", "the festival", "red", "color"],
    languageNote: "Madrid introduces feelings, color, and simple description while reusing Ch1 social phrases.",
  },
  characters: [
    { id: "lingo", emoji: "🦊", name: "Detective Rudy", nameKo: "탐정 루디", nameId: "Detektif Rudy", side: "left", avatarBg: C.gold, isLingo: true, portrait: rudyStoryImg, portraitVariants: rudyExpressionSprites },
    { id: "isabel", emoji: "💃", name: "Isabel", nameKo: "이사벨", nameId: "Isabel", side: "right", avatarBg: "#C8232C", portrait: ch2IsabelPortraitImg, portraitVariants: isabelExpressionSprites },
    { id: "miguel", emoji: "🎸", name: "Don Miguel", nameKo: "돈 미겔", nameId: "Don Miguel", side: "right", avatarBg: "#8B5A2B", portrait: ch2MiguelPortraitImg },
    { id: "carlos", emoji: "🎨", name: "Carlos", nameKo: "카를로스", nameId: "Carlos", side: "right", avatarBg: "#6E4A35", portrait: ch2CarlosPortraitImg },
    { id: "eleanor", emoji: "📚", name: "Dr. Eleanor Vale", nameKo: "엘리너 베일 박사", nameId: "Dr. Eleanor Vale", side: "right", avatarBg: "#637081", portrait: ch1EleanorPortraitImg, portraitVariants: eleanorExpressionSprites },
  ],
  sequence: [
    {
      kind: "scene",
      charId: "lingo",
      isNarration: true,
      text: "(Madrid does not greet you with sunshine. The plaza from the phone is close, but its flags hang gray, its lanterns burn cold, and every cheer sounds like it has been translated into silence.)",
      textKo: "(마드리드는 햇빛으로 맞아주지 않는다. 휴대폰에서 본 광장은 가까이 있지만, 깃발은 회색으로 늘어져 있고 등불은 차갑게 타오르며 환호성은 침묵으로 번역된 것처럼 들린다.)",
      textEs: "(Madrid no te recibe con sol. La plaza del teléfono está cerca, pero sus banderas cuelgan grises, sus faroles arden fríos y cada grito suena traducido al silencio.)",
      textId: "(Madrid tidak menyambutmu dengan sinar matahari. Plaza dari ponsel itu sudah dekat, tapi benderanya terkulai kelabu, lentera-lenteranya menyala dingin, dan setiap sorak terdengar seakan telah diterjemahkan menjadi keheningan.)",
    },
    {
      kind: "scene",
      charId: "lingo",
      expression: "worried",
      text: "That voice from the speaker. I knew it before I knew why. He is not here in person, partner. But his rules are already in the air.",
      textKo: "스피커에서 들린 그 목소리. 이유를 알기 전부터 알아본 것 같아요. 그는 직접 여기 있는 게 아니에요, 파트너. 하지만 그의 규칙은 이미 공기 속에 퍼졌어요.",
      textKoMix: "스피커에서 들린 그 voice. 이유를 알기 전부터 알아본 것 같아요. 그는 직접 여기 있는 게 아니에요, partner. 하지만 그의 rules는 이미 공기 속에 퍼졌어요.",
      textEs: "Esa voz del altavoz. La conocía antes de saber por qué. No está aquí en persona, compa. Pero sus reglas ya están en el aire.",
      textEsMix: "Esa voice del speaker. La conocía antes de saber por qué. No está aquí en persona, partner. Pero sus rules ya están en el aire.",
      textId: "Suara dari pengeras itu. Aku mengenalinya bahkan sebelum tahu alasannya. Dia tidak hadir secara langsung di sini, partner. Tapi aturannya sudah tersebar di udara.",
      textIdMix: "voice dari speaker itu. Aku mengenalinya bahkan sebelum tahu alasannya. Dia tidak hadir secara langsung di sini, partner. Tapi rules miliknya sudah tersebar di udara.",
    },
    {
      kind: "scene",
      charId: "isabel",
      expression: "shocked",
      text: "You are the detective from London? Good. Carlos vanished while restoring the festival backdrop. One second he was calling me. The next, his words turned to gold dust and the whole plaza lost its color.",
      textKo: "런던에서 온 탐정이죠? 좋아요. 카를로스는 축제 무대 배경을 복원하다가 사라졌어요. 방금 전까지 저와 통화하고 있었는데, 다음 순간 그의 말이 금빛 먼지가 되고 광장 전체가 색을 잃었어요.",
      textKoMix: "런던에서 온 detective죠? 좋아요. Carlos는 festival 무대 배경을 복원하다가 사라졌어요. 그의 words가 gold dust가 되고 plaza 전체가 color를 잃었어요.",
      textEs: "¿Eres el detective de Londres? Bien. Carlos desapareció mientras restauraba el decorado del festival. Un segundo me llamaba. Al siguiente, sus palabras se volvieron polvo dorado y toda la plaza perdió el color.",
      textEsMix: "¿Eres el detective de London? Bien. Carlos desapareció restaurando el festival backdrop. Sus words se volvieron gold dust y la plaza perdió el color.",
      textId: "Kamu detektif dari London itu? Bagus. Carlos lenyap saat memulihkan latar panggung festival. Sedetik tadi dia menelponku. Detik berikutnya, kata-katanya berubah jadi debu emas dan seluruh plaza kehilangan warnanya.",
      textIdMix: "Kamu detective dari London itu? Bagus. Carlos lenyap saat memulihkan latar panggung festival. words miliknya berubah jadi gold dust dan seluruh plaza kehilangan color-nya.",
    },
    {
      kind: "puzzle",
      puzzleNum: 1,
      title: { en: "Recover the First Colors", ko: "첫 색을 되찾기", es: "Recuperar los primeros colores", id: "Pulihkan Warna Pertama" },
      context: {
        en: "Isabel needs the words for feeling and color before she can explain what Carlos was restoring.",
        ko: "이사벨이 카를로스가 무엇을 복원하고 있었는지 설명하려면 감정과 색의 말이 먼저 필요합니다.",
        es: "Isabel necesita palabras de emoción y color antes de explicar qué restauraba Carlos.",
        id: "Isabel butuh kata-kata tentang perasaan dan warna sebelum ia bisa menjelaskan apa yang sedang dipulihkan Carlos.",
      },
      pType: "word-match",
      tprsStage: 1,
      targetExpressions: ["red", "color", "I am happy", "It is beautiful"],
      previouslyLearned: ["Hello", "Thank you", "Goodbye"],
      speakAfter: true,
      storyReason: "Color words let the plaza resist the broadcast's flattening effect.",
      storyConsequence: "A single red flag starts to return above Plaza Mayor.",
      onFail: { addToWeakExpressions: ["red", "color", "I am happy", "It is beautiful"], reviewInDailyCourse: true, reviewDays: 3 },
      questions: [
        {
          word: { en: "red", ko: "빨간색", es: "rojo", id: "merah" },
          meaning: { en: "a warm bright color", ko: "따뜻하고 선명한 색", es: "un color cálido y vivo", id: "warna hangat yang cerah" },
          wrong: [
            { en: "a place", ko: "장소", es: "un lugar", id: "sebuah tempat" },
            { en: "a price", ko: "가격", es: "un precio", id: "sebuah harga" },
            { en: "a goodbye", ko: "작별 인사", es: "una despedida", id: "ucapan perpisahan" },
          ],
        },
        {
          word: { en: "color", ko: "색", es: "color", id: "warna" },
          meaning: { en: "what the festival is losing", ko: "축제가 잃어가는 것", es: "lo que el festival está perdiendo", id: "apa yang sedang hilang dari festival" },
          wrong: [
            { en: "a guard's name", ko: "경비원의 이름", es: "el nombre de un guardia", id: "nama seorang penjaga" },
            { en: "a ticket", ko: "표", es: "un billete", id: "sebuah tiket" },
            { en: "a locked door", ko: "잠긴 문", es: "una puerta cerrada", id: "pintu terkunci" },
          ],
        },
        {
          word: { en: "I am happy", ko: "나는 행복해요", es: "Estoy feliz", id: "Saya bahagia" },
          meaning: { en: "a feeling of joy", ko: "기쁜 감정", es: "un sentimiento de alegría", id: "perasaan gembira" },
          wrong: [
            { en: "asking for a location", ko: "위치 묻기", es: "preguntar por un lugar", id: "menanyakan lokasi" },
            { en: "asking a price", ko: "가격 묻기", es: "preguntar un precio", id: "menanyakan harga" },
            { en: "saying sorry", ko: "사과하기", es: "pedir perdón", id: "meminta maaf" },
          ],
        },
        {
          word: { en: "It is beautiful", ko: "그것은 아름다워요", es: "Es hermoso", id: "Itu indah" },
          meaning: { en: "a simple description of something you admire", ko: "감탄하는 것을 묘사하는 쉬운 말", es: "una descripción sencilla de algo que admiras", id: "deskripsi sederhana tentang sesuatu yang kamu kagumi" },
          wrong: [
            { en: "an emergency request", ko: "긴급 도움 요청", es: "una petición urgente", id: "permintaan darurat" },
            { en: "a family title", ko: "가족 호칭", es: "un título familiar", id: "sebutan keluarga" },
            { en: "a warning about danger", ko: "위험 경고", es: "una advertencia de peligro", id: "peringatan akan bahaya" },
          ],
        },
      ],
      hints: {
        h1: { ko: "이번 장은 색과 감정이 핵심이에요.", en: "This chapter is about color and feeling.", es: "Este capítulo trata de color y emoción.", id: "Bab ini berkisah tentang warna dan perasaan." },
        h2: { ko: "red와 color는 광장의 시각 단서와 연결돼요.", en: "red and color connect to what you see in the plaza.", es: "red y color conectan con lo que ves en la plaza.", id: "red dan color berkaitan dengan apa yang kamu lihat di plaza.", byLearning: { english: { ko: "red, color 같은 단어는 광장의 시각 단서와 연결돼요.", en: "red and color connect to what you see in the plaza.", es: "red y color conectan con lo que ves en la plaza.", id: "red dan color berkaitan dengan apa yang kamu lihat di plaza." }, korean: { ko: "빨간색, 색 같은 단어는 광장의 시각 단서와 연결돼요.", en: "Words like 빨간색 and 색 connect to what you see in the plaza.", es: "Palabras como 빨간색 y 색 conectan con lo que ves en la plaza.", id: "Kata seperti 빨간색 dan 색 berkaitan dengan apa yang kamu lihat di plaza." }, spanish: { ko: "rojo, color 같은 단어는 광장의 시각 단서와 연결돼요.", en: "rojo and color connect to what you see in the plaza.", es: "rojo y color conectan con lo que ves en la plaza.", id: "rojo dan color berkaitan dengan apa yang kamu lihat di plaza." }, indonesian: { ko: "merah, warna 같은 단어는 광장의 시각 단서와 연결돼요.", en: "merah and warna connect to what you see in the plaza.", es: "merah y warna conectan con lo que ves en la plaza.", id: "merah dan warna berkaitan dengan apa yang kamu lihat di plaza." } } },
        h3: { ko: "happy는 감정, beautiful은 묘사예요.", en: "happy is a feeling; beautiful is a description.", es: "happy es un sentimiento; beautiful es una descripción.", id: "happy adalah perasaan; beautiful adalah deskripsi.", byLearning: { english: { ko: "감정: happy / 묘사: beautiful", en: "feeling: happy / description: beautiful", es: "sentimiento: happy / descripción: beautiful", id: "perasaan: happy / deskripsi: beautiful" }, korean: { ko: "감정: 나는 행복해요 / 묘사: 그것은 아름다워요", en: "feeling: 나는 행복해요 / description: 그것은 아름다워요", es: "sentimiento: 나는 행복해요 / descripción: 그것은 아름다워요", id: "perasaan: 나는 행복해요 / deskripsi: 그것은 아름다워요" }, spanish: { ko: "감정: Estoy feliz / 묘사: Es hermoso", en: "feeling: Estoy feliz / description: Es hermoso", es: "sentimiento: Estoy feliz / descripción: Es hermoso", id: "perasaan: Estoy feliz / deskripsi: Es hermoso" }, indonesian: { ko: "감정: Saya bahagia / 묘사: Itu indah", en: "feeling: Saya bahagia / description: Itu indah", es: "sentimiento: Saya bahagia / descripción: Itu indah", id: "perasaan: Saya bahagia / deskripsi: Itu indah" } } },
      },
    },
    {
      kind: "scene",
      charId: "isabel",
      expression: "rallying",
      text: "There. That flag was red. Carlos painted it every year because he said the festival needed a heartbeat.",
      textKo: "저기요. 저 깃발은 원래 빨간색이었어요. 카를로스는 매년 저걸 칠했죠. 축제에는 심장 박동이 필요하다고 했거든요.",
      textKoMix: "저기요. 저 flag는 원래 red였어요. Carlos는 festival에는 heartbeat가 필요하다고 했어요.",
      textEs: "Ahí. Esa bandera era roja. Carlos la pintaba cada año porque decía que el festival necesitaba un latido.",
      textEsMix: "Ahí. Esa flag era red. Carlos decía que el festival necesitaba un heartbeat.",
      textId: "Itu. Bendera itu dulu merah. Carlos mengecatnya setiap tahun karena katanya festival butuh detak jantung.",
      textIdMix: "Itu. flag itu dulu red. Carlos bilang festival butuh sebuah heartbeat.",
    },
    {
      kind: "scene",
      charId: "miguel",
      text: "I remember the plaza before the broadcast. People argued, sang badly, laughed too loudly. It was not perfect. That is why it was alive.",
      textKo: "방송 전의 광장을 기억하오. 사람들은 다투고, 음정이 틀린 노래를 부르고, 너무 크게 웃었지. 완벽하지 않았소. 그래서 살아 있었소.",
      textKoMix: "broadcast 전의 plaza를 기억하오. 사람들은 다투고, 노래하고, 크게 웃었지. perfect하지 않았소. 그래서 살아 있었소.",
      textEs: "Recuerdo la plaza antes de la transmisión. La gente discutía, cantaba mal, reía demasiado fuerte. No era perfecta. Por eso estaba viva.",
      textEsMix: "Recuerdo la plaza antes del broadcast. La gente discutía, cantaba mal, reía demasiado fuerte. No era perfect. Por eso estaba viva.",
      textId: "Aku ingat plaza ini sebelum siaran itu. Orang-orang berdebat, bernyanyi sumbang, tertawa terlalu keras. Tidak sempurna. Justru karena itulah ia hidup.",
      textIdMix: "Aku ingat plaza ini sebelum broadcast itu. Orang-orang berdebat, bernyanyi, tertawa keras. Tidak perfect. Justru karena itulah ia hidup.",
    },
    {
      kind: "puzzle",
      puzzleNum: 2,
      title: { en: "Speak With Feeling", ko: "감정으로 말하기", es: "Hablar con emoción", id: "Berbicara dengan Perasaan" },
      context: {
        en: "Don Miguel can guide you to the sealed stage if you answer with feeling, not just information.",
        ko: "돈 미겔은 정보만이 아니라 감정이 담긴 말에 반응합니다.",
        es: "Don Miguel puede guiarte al escenario sellado si respondes con emoción, no solo con información.",
        id: "Don Miguel bisa menuntunmu ke panggung tersegel jika kamu menjawab dengan perasaan, bukan sekadar informasi.",
      },
      pType: "dialogue-choice",
      tprsStage: 2,
      targetExpressions: ["I am happy", "It is beautiful", "Where is the festival?"],
      previouslyLearned: ["Hello", "Thank you", "Goodbye", "red", "color"],
      speakAfter: true,
      storyReason: "The Universal Code removes emotion first. Use emotion words to keep Don Miguel grounded.",
      storyConsequence: "Don Miguel shows the way to the sealed festival stage.",
      onFail: { addToWeakExpressions: ["I am happy", "It is beautiful", "Where is the festival?"], reviewInDailyCourse: true, reviewDays: 3 },
      questions: [
        {
          prompt: { en: "Don Miguel asks: 'When the music returns, what do you feel?'", ko: "돈 미겔이 묻습니다: '음악이 돌아오면 무엇을 느끼나?'", es: "Don Miguel pregunta: 'Cuando vuelva la música, ¿qué sientes?'", id: "Don Miguel bertanya: 'Saat musik kembali, apa yang kamu rasakan?'" },
          context: { en: "Choose a feeling, not a price or a direction.", ko: "가격이나 방향이 아니라 감정을 고르세요.", es: "Elige un sentimiento, no un precio ni una dirección.", id: "Pilih sebuah perasaan, bukan harga atau arah." },
          answer: { en: "I am happy.", ko: "I am happy.", es: "I am happy.", id: "I am happy." },
          wrong: [
            { en: "How much is it?", ko: "How much is it?", es: "How much is it?", id: "How much is it?" },
            { en: "Goodbye.", ko: "Goodbye.", es: "Goodbye.", id: "Goodbye." },
          ],
        },
        {
          prompt: { en: "He points to the gray stage: 'What was it, before the color left?'", ko: "그가 회색 무대를 가리킵니다: '색이 사라지기 전, 저건 무엇이었나?'", es: "Señala el escenario gris: '¿Qué era antes de perder el color?'", id: "Ia menunjuk panggung kelabu itu: 'Dulu seperti apa, sebelum warnanya hilang?'" },
          context: { en: "Give a simple description.", ko: "간단한 묘사를 말하세요.", es: "Da una descripción sencilla.", id: "Berikan deskripsi sederhana." },
          answer: { en: "It is beautiful.", ko: "It is beautiful.", es: "It is beautiful.", id: "It is beautiful." },
          wrong: [
            { en: "Bread please.", ko: "Bread please.", es: "Bread please.", id: "Bread please." },
            { en: "Where is Dr. Ellis?", ko: "Where is Dr. Ellis?", es: "Where is Dr. Ellis?", id: "Where is Dr. Ellis?" },
          ],
        },
        {
          prompt: { en: "Isabel needs the exact place. Ask for it.", ko: "이사벨은 정확한 장소가 필요합니다. 물어보세요.", es: "Isabel necesita el lugar exacto. Pregunta por él.", id: "Isabel butuh tempat yang tepat. Tanyakanlah." },
          context: { en: "Use the location question from the festival clue.", ko: "축제 단서에서 나온 위치 질문을 사용하세요.", es: "Usa la pregunta de lugar de la pista del festival.", id: "Gunakan pertanyaan lokasi dari petunjuk festival itu." },
          answer: { en: "Where is the festival?", ko: "Where is the festival?", es: "Where is the festival?", id: "Where is the festival?" },
          wrong: [
            { en: "Thank you.", ko: "Thank you.", es: "Thank you.", id: "Thank you." },
            { en: "I am Carlos.", ko: "I am Carlos.", es: "I am Carlos.", id: "I am Carlos." },
          ],
        },
      ],
      hints: {
        h1: { ko: "감정, 묘사, 위치 질문 순서로 생각하세요.", en: "Think feeling, description, then location question.", es: "Piensa en emoción, descripción y pregunta de lugar.", id: "Pikirkan urutannya: perasaan, deskripsi, lalu pertanyaan lokasi." },
        h2: { ko: "happy는 감정, beautiful은 묘사예요.", en: "happy is feeling; beautiful is description.", es: "happy es emoción; beautiful es descripción.", id: "happy adalah perasaan; beautiful adalah deskripsi." },
        h3: { ko: "정답 흐름: I am happy / It is beautiful / Where is the festival?", en: "Answer flow: I am happy / It is beautiful / Where is the festival?", es: "Flujo correcto: I am happy / It is beautiful / Where is the festival?", id: "Alur jawaban: I am happy / It is beautiful / Where is the festival?" },
      },
    },
    {
      kind: "scene",
      charId: "miguel",
      backdrop: "madrid-sealed-stage",
      text: "The stage is behind the fountain. It used to pull every color toward it. Now it eats color instead.",
      textKo: "무대는 분수 뒤에 있소. 예전에는 모든 색을 끌어당겼지. 지금은 색을 먹어치우고 있소.",
      textKoMix: "stage는 fountain 뒤에 있소. 예전에는 모든 color를 끌어당겼지. 지금은 color를 먹어치우고 있소.",
      textEs: "El escenario está detrás de la fuente. Antes atraía todos los colores. Ahora se los come.",
      textEsMix: "El stage está detrás de la fountain. Antes atraía todos los colors. Ahora se los come.",
      textId: "Panggungnya ada di balik air mancur. Dulu ia menarik setiap warna ke arahnya. Kini ia justru memakan warna.",
      textIdMix: "stage-nya ada di balik fountain. Dulu ia menarik setiap color ke arahnya. Kini ia justru memakan color.",
    },
    {
      kind: "puzzle",
      puzzleNum: 3,
      title: { en: "Find Carlos's Last Trace", ko: "카를로스의 마지막 흔적 찾기", es: "Encontrar el último rastro de Carlos", id: "Temukan Jejak Terakhir Carlos" },
      context: {
        en: "The festival stage has three clues. One proves where Carlos disappeared.",
        ko: "축제 무대에는 세 가지 단서가 있습니다. 그중 하나가 카를로스가 사라진 위치를 증명합니다.",
        es: "El escenario tiene tres pistas. Una demuestra dónde desapareció Carlos.",
        id: "Panggung festival itu menyimpan tiga petunjuk. Salah satunya membuktikan di mana Carlos menghilang.",
      },
      pType: "investigation",
      tprsStage: 3,
      targetExpressions: ["Where is the festival?", "color", "red"],
      previouslyLearned: ["Hello", "Thank you", "I am happy", "It is beautiful"],
      storyReason: "Identify the clue that connects Carlos, the speaker, and the sealed stage.",
      storyConsequence: "The sealed stage opens a path to the Madrid Stone fragment.",
      onFail: { addToWeakExpressions: ["Where is the festival?", "color", "red"], reviewInDailyCourse: true, reviewDays: 3 },
      questions: [
        {
          prompt: { en: "Which evidence points to Carlos's exact disappearance point?", ko: "어떤 증거가 카를로스가 사라진 정확한 지점을 가리키나요?", es: "¿Qué evidencia señala el punto exacto donde desapareció Carlos?", id: "Bukti mana yang menunjuk titik pasti hilangnya Carlos?" },
          clues: [
            { en: "A paintbrush still wet with red paint beside the stage speaker.", ko: "무대 스피커 옆에 놓인, 아직 빨간 물감이 마르지 않은 붓.", es: "Un pincel aún mojado con pintura roja junto al altavoz del escenario.", id: "Sebuah kuas yang masih basah oleh cat merah di samping pengeras suara panggung." },
            { en: "A food receipt from a nearby cafe.", ko: "근처 카페의 영수증.", es: "Un recibo de una cafetería cercana.", id: "Struk makanan dari kafe di dekat sana." },
            { en: "A gray paper flower from the festival decorations.", ko: "축제 장식에서 떨어진 회색 종이꽃.", es: "Una flor de papel gris de la decoración del festival.", id: "Bunga kertas kelabu dari hiasan festival." },
          ],
          answerIdx: 0,
        },
      ],
      hints: {
        h1: { ko: "카를로스는 복원가예요. 그가 쓰던 도구를 찾으세요.", en: "Carlos is a restorer. Look for the tool he used.", es: "Carlos es restaurador. Busca la herramienta que usaba.", id: "Carlos adalah seorang pemulih. Cari alat yang ia gunakan." },
        h2: { ko: "붓과 빨간색은 깃발 회복과 연결돼요.", en: "The brush and red paint connect to the restored flag.", es: "El pincel y la pintura roja conectan con la bandera restaurada.", id: "Kuas dan cat merah itu berkaitan dengan bendera yang dipulihkan." },
        h3: { ko: "정답: 스피커 옆의 빨간 붓.", en: "Answer: the red paintbrush beside the speaker.", es: "Respuesta: el pincel rojo junto al altavoz.", id: "Jawaban: kuas merah di samping pengeras suara." },
      },
    },
    {
      kind: "scene",
      charId: "isabel",
      backdrop: "madrid-sealed-stage",
      expression: "shocked",
      text: "Carlos was here. The speaker took his voice, and the stage sealed around the last color he touched.",
      textKo: "카를로스가 여기 있었어요. 스피커가 그의 목소리를 빼앗았고, 그가 마지막으로 만진 색을 중심으로 무대가 봉인됐어요.",
      textKoMix: "Carlos가 여기 있었어요. speaker가 그의 voice를 빼앗았고, 그가 마지막으로 만진 color를 중심으로 stage가 봉인됐어요.",
      textEs: "Carlos estuvo aquí. El altavoz tomó su voz, y el escenario se selló alrededor del último color que tocó.",
      textEsMix: "Carlos estuvo aquí. El speaker tomó su voice, y el stage se selló alrededor del último color que tocó.",
      textId: "Carlos pernah di sini. Pengeras suara itu merampas suaranya, dan panggung tersegel di sekeliling warna terakhir yang ia sentuh.",
      textIdMix: "Carlos pernah di sini. speaker itu merampas voice-nya, dan stage tersegel di sekeliling color terakhir yang ia sentuh.",
    },
    {
      kind: "scene",
      charId: "lingo",
      backdrop: "madrid-sealed-stage",
      text: "The seal is not asking for a key. It is asking for a feeling, a place, and a promise that beauty still means something. Put the pieces in order.",
      textKo: "봉인은 열쇠를 요구하는 게 아니에요. 감정, 장소, 그리고 아름다움이 아직 의미 있다는 약속을 요구하고 있어요. 조각을 순서대로 놓아봐요.",
      textKoMix: "seal은 key를 요구하는 게 아니에요. feeling, place, 그리고 beautiful이라는 약속을 요구해요. pieces를 순서대로 놓아봐요.",
      textEs: "El sello no pide una llave. Pide un sentimiento, un lugar y la promesa de que la belleza aún significa algo. Pon las piezas en orden.",
      textEsMix: "El seal no pide una key. Pide feeling, place y la promesa de que beautiful todavía importa. Pon las pieces en orden.",
      textId: "Segel ini tidak meminta sebuah kunci. Ia meminta sebuah perasaan, sebuah tempat, dan janji bahwa keindahan masih berarti. Susun potongan-potongannya secara berurutan.",
      textIdMix: "seal ini tidak meminta sebuah key. Ia meminta feeling, place, dan janji bahwa beautiful masih berarti. Susun pieces-nya secara berurutan.",
    },
    {
      kind: "puzzle",
      puzzleNum: 4,
      title: { en: "Madrid Boss Spell", ko: "마드리드 보스 주문", es: "Hechizo Jefe de Madrid", id: "Mantra Bos Madrid" },
      context: { en: "Speak the festival back into shape.", ko: "축제가 다시 형태를 되찾도록 말하세요.", es: "Devuelve la forma al festival con tus palabras.", id: "Ucapkan agar festival kembali ke wujudnya." },
      pType: "boss-spell",
      tprsStage: 4,
      targetExpressions: ["I am happy", "Where is", "the festival", "It is beautiful"],
      previouslyLearned: ["Hello", "Thank you", "Goodbye", "red", "color"],
      speakAfter: true,
      storyReason: "Complete the Madrid Boss Spell to unseal the festival stage.",
      storyConsequence: "Color and movement return to the plaza, and Carlos can be reached.",
      onFail: { addToWeakExpressions: ["I am happy", "Where is", "the festival", "It is beautiful"], reviewInDailyCourse: true, reviewDays: 3 },
      questions: [
        {
          spellChunks: ["I am happy", "Where is", "the festival", "It is beautiful"],
          separators: [".", " ", "?", "."],
          wordPool: ["I am happy", "Where is", "the festival", "It is beautiful", "How much", "Thank you", "Bread please"],
          instruction: { en: "Place each spell-piece on the sealed stage.", ko: "주문 조각을 봉인된 무대 위에 순서대로 놓으세요.", es: "Coloca cada pieza del hechizo sobre el escenario sellado.", id: "Letakkan setiap potongan mantra pada panggung tersegel." },
          hints: {
            h1: { ko: "순서가 중요해요. 먼저 감정을 말하세요.", en: "The order matters. Begin with the feeling.", es: "El orden importa. Empieza con el sentimiento.", id: "Urutannya penting. Mulailah dengan perasaan." },
            h2: { ko: "그다음은 장소 질문이에요: Where is + the festival.", en: "Next comes the place question: Where is + the festival.", es: "Después va la pregunta de lugar: Where is + the festival.", id: "Berikutnya pertanyaan tempat: Where is + the festival." },
            h3: { ko: "정답 문장: I am happy. Where is the festival? It is beautiful.", en: "Answer sentence: I am happy. Where is the festival? It is beautiful.", es: "Frase correcta: I am happy. Where is the festival? It is beautiful.", id: "Kalimat jawaban: I am happy. Where is the festival? It is beautiful." },
          },
          storyReason: { en: "Open the sealed stage to reach Carlos and the Madrid Stone fragment.", ko: "봉인된 무대를 열어 카를로스와 마드리드 스톤 파편에 닿으세요.", es: "Abre el escenario sellado para alcanzar a Carlos y el fragmento de la Piedra de Madrid.", id: "Buka panggung tersegel untuk mencapai Carlos dan pecahan Batu Madrid." },
          storyConsequence: { en: "The first red spark becomes a full dance step.", ko: "첫 빨간 불꽃이 온전한 춤 동작으로 이어집니다.", es: "La primera chispa roja se convierte en un paso de baile completo.", id: "Percik merah pertama menjadi satu langkah tarian yang utuh." },
          doorImage: ch2BossStageImg,
        },
      ],
      hints: {
        h1: { ko: "Boss Spell은 감정, 위치 질문, 묘사로 이루어져요.", en: "The Boss Spell uses feeling, location, and description.", es: "El Boss Spell usa emoción, lugar y descripción.", id: "Mantra Bos memakai perasaan, lokasi, dan deskripsi." },
        h2: { ko: "I am happy. Where is + the festival? It is beautiful.", en: "I am happy. Where is + the festival? It is beautiful.", es: "I am happy. Where is + the festival? It is beautiful.", id: "I am happy. Where is + the festival? It is beautiful." },
        h3: { ko: "정답 문장: I am happy. Where is the festival? It is beautiful.", en: "Answer sentence: I am happy. Where is the festival? It is beautiful.", es: "Frase correcta: I am happy. Where is the festival? It is beautiful.", id: "Kalimat jawaban: I am happy. Where is the festival? It is beautiful." },
      },
    },
    {
      kind: "scene",
      charId: "lingo",
      isNarration: true,
      backdrop: "madrid-restored",
      text: "(The sentence climbs the cracks. The stage exhales red. A flamenco dancer, frozen in gray, moves one hand, then one heel, then the whole plaza remembers how to clap.)",
      textKo: "(문장이 금 간 틈을 타고 올라간다. 무대가 빨간 숨을 내쉰다. 회색으로 멈춰 있던 플라멩코 댄서가 한 손을 움직이고, 한 발꿈치를 울리고, 마침내 광장 전체가 박수를 기억해낸다.)",
      textEs: "(La frase trepa por las grietas. El escenario exhala rojo. Una bailaora congelada en gris mueve una mano, luego un tacón, y por fin toda la plaza recuerda cómo aplaudir.)",
      textId: "(Kalimat itu merayap di sepanjang retakan. Panggung menghembuskan warna merah. Seorang penari flamenco yang membeku kelabu menggerakkan satu tangan, lalu satu tumit, lalu seluruh plaza mengingat kembali cara bertepuk tangan.)",
    },
    {
      kind: "scene",
      charId: "carlos",
      backdrop: "madrid-restored",
      text: "*breathing hard* I could hear everyone, but every word came back polished, smooth, empty. Isabel. Thank you. I thought nobody would find the color.",
      textKo: "*거칠게 숨을 쉬며* 모두의 목소리가 들렸지만, 모든 단어가 매끈하고 비어 있는 말로 돌아왔어요. 이사벨. 고마워요. 아무도 그 색을 찾지 못할 줄 알았어요.",
      textKoMix: "*거칠게 숨을 쉬며* 모두의 voice가 들렸지만, 모든 word가 smooth하고 empty하게 돌아왔어요. Isabel. Thank you. 아무도 color를 찾지 못할 줄 알았어요.",
      textEs: "*respirando con fuerza* Podía oír a todos, pero cada palabra volvía pulida, suave, vacía. Isabel. Thank you. Pensé que nadie encontraría el color.",
      textEsMix: "*respirando con fuerza* Podía oír a todos, pero cada word volvía smooth y empty. Isabel. Thank you. Pensé que nadie encontraría el color.",
      textId: "*terengah-engah* Aku bisa mendengar semua orang, tapi setiap kata kembali terpoles, halus, kosong. Isabel. Thank you. Kukira tak ada yang akan menemukan warnanya.",
      textIdMix: "*terengah-engah* Aku bisa mendengar semua orang, tapi setiap word kembali smooth dan empty. Isabel. Thank you. Kukira tak ada yang akan menemukan color-nya.",
    },
    {
      kind: "scene",
      charId: "miguel",
      backdrop: "madrid-restored",
      text: "A festival is not a schedule. It is the mistakes in the song, the accent in the shout, the red where someone loved it enough to repaint it.",
      textKo: "축제는 일정표가 아니오. 노래 속 실수, 외침 속 억양, 누군가 사랑해서 다시 칠한 빨간색이 바로 축제요.",
      textKoMix: "festival은 schedule이 아니오. 노래 속 mistake, 외침 속 accent, 누군가 사랑해서 다시 칠한 red가 바로 festival이오.",
      textEs: "Un festival no es un horario. Son los errores en la canción, el acento en el grito, el rojo que alguien amó tanto que volvió a pintarlo.",
      textEsMix: "Un festival no es un schedule. Son los mistakes en la canción, el accent en el grito, el red que alguien volvió a pintar.",
      textId: "Festival bukanlah jadwal. Ia adalah kesalahan dalam lagu, logat dalam teriakan, merah di tempat yang dicintai seseorang sampai ia rela mengecatnya ulang.",
      textIdMix: "festival bukanlah schedule. Ia adalah mistake dalam lagu, accent dalam teriakan, red yang dicintai seseorang sampai ia rela mengecatnya ulang.",
    },
    {
      kind: "scene",
      charId: "lingo",
      isNarration: true,
      backdrop: "madrid-restored",
      text: "(The plaza speakers crackle. No face appears. Only a calm voice, too clean for the noise around it.)",
      textKo: "(광장 스피커가 지직거린다. 얼굴은 나타나지 않는다. 주변의 소음과 어울리지 않을 만큼 매끈한 목소리만 들린다.)",
      textEs: "(Los altavoces de la plaza chisporrotean. No aparece ningún rostro. Solo una voz tranquila, demasiado limpia para el ruido que la rodea.)",
      textId: "(Pengeras suara plaza berderak. Tak ada wajah yang muncul. Hanya suara tenang, terlalu bersih untuk kebisingan di sekelilingnya.)",
    },
    {
      kind: "scene",
      charId: "lingo",
      isNarration: true,
      text: "\"What you call accent, I call distance. Bridges don't ask the river to stay narrow.\"",
      textKo: "\"당신들이 억양이라고 부르는 것을 나는 거리라고 부른다. 다리는 강에게 좁게 남아 있으라고 요구하지 않는다.\"",
      textEs: "\"Lo que llamas acento, yo lo llamo distancia. Los puentes no le piden al río que siga siendo estrecho.\"",
      textId: "\"Apa yang kalian sebut logat, aku menyebutnya jarak. Jembatan tidak meminta sungai untuk tetap sempit.\"",
    },
    {
      kind: "clue",
      symbol: "✉",
      titleEn: "Old Letter: Seoul",
      titleKo: "오래된 편지: 서울",
      titleEs: "Carta Antigua: Seúl",
      titleId: "Surat Lama: Seoul",
      descEn: "Carlos finds an old letter hidden under the stage boards. It names a Seoul market, a family lullaby, and a stone that remembers harmony.",
      descKo: "카를로스가 무대 판자 아래에서 오래된 편지를 찾습니다. 편지에는 서울의 시장, 가족의 자장가, 그리고 조화를 기억하는 돌이 적혀 있습니다.",
      descEs: "Carlos encuentra una carta antigua bajo las tablas del escenario. Nombra un mercado de Seúl, una nana familiar y una piedra que recuerda la armonía.",
      descId: "Carlos menemukan surat lama yang tersembunyi di bawah papan panggung. Surat itu menyebut sebuah pasar di Seoul, sebuah nina bobo keluarga, dan sebuah batu yang mengingat keselarasan.",
    },
    {
      kind: "scene",
      charId: "eleanor",
      expression: "urgent",
      text: "*on the phone from London* I received your images. London and Madrid are compromised. Two city stones remain before Babel reveals the final three. Seoul is next. Be careful, Detective.",
      textKo: "*런던에서 전화로* 사진을 받았어요. 런던과 마드리드는 이미 흔들렸습니다. 바벨의 마지막 세 개가 드러나기 전, 도시 수호석은 두 개 남았어요. 다음은 서울입니다. 조심하세요, 탐정님.",
      textKoMix: "*London에서 phone으로* 사진을 받았어요. London과 Madrid는 이미 흔들렸습니다. Babel의 final three 전, city stones는 두 개 남았어요. 다음은 Seoul입니다. 조심하세요, Detective.",
      textEs: "*por teléfono desde Londres* Recibí tus imágenes. Londres y Madrid están comprometidos. Quedan dos piedras de ciudad antes de que Babel revele las tres finales. Seúl es el siguiente. Cuidado, Detective.",
      textEsMix: "*por phone desde London* Recibí tus imágenes. London y Madrid están comprometidos. Quedan two city stones antes de Babel. Seoul es el siguiente. Cuidado, Detective.",
      textId: "*lewat telepon dari London* Aku menerima gambar-gambarmu. London dan Madrid sudah jatuh. Tersisa dua batu kota sebelum Babel mengungkap tiga yang terakhir. Seoul berikutnya. Hati-hati, Detektif.",
      textIdMix: "*lewat phone dari London* Aku menerima gambar-gambarmu. London dan Madrid sudah jatuh. Tersisa two city stones sebelum Babel. Seoul berikutnya. Hati-hati, Detective.",
    },
    {
      kind: "scene",
      charId: "isabel",
      backdrop: "madrid-restored",
      expression: "rallying",
      text: "Then go. Carlos and I will keep the festival loud until you come back. Goodbye, Detective. And thank you.",
      textKo: "그럼 가요. 당신이 돌아올 때까지 카를로스와 제가 축제를 크게 울리게 할게요. 안녕히 가요, 탐정님. 그리고 고마워요.",
      textKoMix: "그럼 가요. 당신이 돌아올 때까지 Carlos와 제가 festival을 크게 울리게 할게요. Goodbye, Detective. 그리고 Thank you.",
      textEs: "Entonces ve. Carlos y yo mantendremos el festival bien ruidoso hasta que vuelvas. Goodbye, Detective. Y thank you.",
      textEsMix: "Entonces ve. Carlos y yo mantendremos el festival fuerte. Goodbye, Detective. Y Thank you.",
      textId: "Kalau begitu, pergilah. Carlos dan aku akan menjaga festival ini tetap meriah sampai kau kembali. Goodbye, Detektif. Dan thank you.",
      textIdMix: "Kalau begitu, pergilah. Carlos dan aku akan menjaga festival ini tetap meriah. Goodbye, Detective. Dan Thank you.",
    },
    {
      kind: "scene",
      charId: "lingo",
      isNarration: true,
      text: "(Madrid keeps one red flag awake. Somewhere in Seoul, an old market sign begins to flicker.)",
      textKo: "(마드리드는 빨간 깃발 하나를 깨어 있게 지킨다. 서울 어딘가에서 오래된 시장 간판이 깜빡이기 시작한다.)",
      textEs: "(Madrid mantiene despierta una bandera roja. En algún lugar de Seúl, un viejo cartel de mercado empieza a parpadear.)",
      textId: "(Madrid menjaga satu bendera merah tetap terjaga. Di suatu tempat di Seoul, papan pasar tua mulai berkedip.)",
    },
  ],
};

const SEOUL_V21_STORY: Story = {
  id: "seoul",
  title: "The Seoul Order",
  titleKo: "서울의 순서",
  titleEs: "El Orden de Seúl",
  titleId: "Tata Urutan Seoul",
  gradient: ["#08111C", "#10251F", "#1A0F08"],
  accentColor: C.gold,
  nextChapterId: "cairo",
  chapterMeta: {
    cefrLevel: "A2",
    targetLangRatio: 42,
    knownExpressions: [
      "Hello",
      "Goodbye",
      "안녕하세요",
      "감사합니다",
      "도와주세요",
      "실례합니다",
      "죄송합니다",
      "박물관은 어디예요?",
      "저는 박물관에 가요",
    ],
    languageNote:
      "Seoul teaches Korean politeness and sentence order. The boss spell is fully Korean, with informal distractors used to teach register.",
  },
  characters: [
    { id: "lingo", emoji: "🦊", name: "Detective Rudy", nameKo: "탐정 루디", nameId: "Detektif Rudy", side: "left", avatarBg: C.gold, isLingo: true, portrait: rudyStoryImg, portraitVariants: rudyExpressionSprites },
    { id: "minho", emoji: "🚕", name: "Minho", nameKo: "민호", nameId: "Minho", side: "right", avatarBg: "#1F6F8B", portrait: ch3MinhoPortraitImg },
    { id: "youngsook", emoji: "🍲", name: "Youngsook", nameKo: "영숙", nameId: "Youngsook", side: "right", avatarBg: "#A15C38", portrait: ch3YoungsookPortraitImg },
    { id: "sujin", emoji: "🔬", name: "Dr. Sujin Han", nameKo: "한수진 박사", nameId: "Dr. Sujin Han", side: "right", avatarBg: "#4C6B4F", portrait: ch3SujinPortraitImg },
    { id: "eleanor", emoji: "📚", name: "Dr. Eleanor Vale", nameKo: "엘리너 베일 박사", nameId: "Dr. Eleanor Vale", side: "right", avatarBg: "#637081", portrait: ch1EleanorPortraitImg, portraitVariants: eleanorExpressionSprites },
  ],
  sequence: [
    {
      kind: "scene",
      charId: "lingo",
      isNarration: true,
      text: "(Incheon Airport. 6:15 AM. Your phone dies before it can translate a single sign. Seoul does not lose every word at once. Here, the order falls apart first.)",
      textKo: "(인천공항. 오전 6시 15분. 휴대폰은 표지판 하나를 번역하기도 전에 꺼진다. 서울은 모든 단어를 한꺼번에 잃지 않는다. 이곳에서는 먼저 순서가 무너진다.)",
      textEs: "(Aeropuerto de Incheon. 6:15 AM. Tu teléfono muere antes de traducir un solo letrero. Seúl no pierde todas las palabras a la vez. Aquí, primero se rompe el orden.)",
      textId: "(Bandara Incheon. Pukul 06.15 pagi. Ponselmu mati sebelum sempat menerjemahkan satu papan pun. Seoul tidak kehilangan semua kata sekaligus. Di sini, tata urutannya yang pertama berantakan.)",
    },
    {
      kind: "scene",
      charId: "lingo",
      text: "No signal. No translator. But we still have something stronger, partner: words we can say ourselves.",
      textKo: "신호가 없어요. 번역기도 없어요. 그래도 우리에겐 더 강한 게 있어요, 파트너. 직접 말할 수 있는 단어요.",
      textEs: "Sin señal. Sin traductor. Pero todavía tenemos algo más fuerte, compa: palabras que podemos decir nosotros mismos.",
      textId: "Tidak ada sinyal. Tidak ada penerjemah. Tapi kita masih punya sesuatu yang lebih kuat, partner: kata-kata yang bisa kita ucapkan sendiri.",
    },
    {
      kind: "scene",
      charId: "minho",
      text: "You look lost. Tourist? Detective? Either way, first rule in Seoul: start politely. 안녕하세요.",
      textKo: "길 잃은 것 같은데요. 관광객? 탐정? 어느 쪽이든 서울의 첫 번째 규칙은 정중하게 시작하는 거예요. 안녕하세요.",
      textEs: "Pareces perdido. ¿Turista? ¿Detective? Da igual: la primera regla en Seúl es empezar con cortesía. 안녕하세요.",
      textId: "Kamu tampak tersesat. Turis? Detektif? Apa pun itu, aturan pertama di Seoul: mulailah dengan sopan. 안녕하세요.",
    },
    {
      kind: "puzzle",
      puzzleNum: 1,
      title: { en: "Polite First Words", ko: "첫 정중 표현", es: "Primeras palabras formales", id: "Kata-Kata Sopan Pertama" },
      context: {
        en: "Minho will help if you can separate polite Korean from casual speech.",
        ko: "정중한 한국어와 반말을 구분하면 민호가 도와줄 거예요.",
        es: "Minho ayudará si puedes separar el coreano formal del habla casual.",
        id: "Minho akan membantu jika kamu bisa membedakan bahasa Korea yang sopan dari bahasa sehari-hari.",
      },
      pType: "word-match",
      tprsStage: 1,
      targetExpressions: ["안녕하세요", "감사합니다", "도와주세요", "실례합니다"],
      previouslyLearned: ["Hello", "Thank you", "Goodbye"],
      speakAfter: true,
      storyReason: "Restore the polite phrases needed to move through Seoul without flattening anyone's voice.",
      storyConsequence: "The airport exit sign steadies long enough for Minho to guide you toward the market.",
      onFail: { addToWeakExpressions: ["안녕하세요", "감사합니다", "도와주세요", "실례합니다"], reviewInDailyCourse: true, reviewDays: 3 },
      questions: [
        {
          word: { en: "안녕하세요", ko: "안녕하세요", es: "안녕하세요", id: "안녕하세요" },
          meaning: { en: "a polite hello", ko: "정중한 인사", es: "un saludo formal", id: "sapaan yang sopan" },
          wrong: [
            { en: "casual bye", ko: "반말 작별", es: "despedida casual", id: "ucapan perpisahan santai" },
            { en: "a price question", ko: "가격 질문", es: "pregunta de precio", id: "pertanyaan harga" },
            { en: "a place name", ko: "장소 이름", es: "nombre de lugar", id: "nama tempat" },
          ],
        },
        {
          word: { en: "감사합니다", ko: "감사합니다", es: "감사합니다", id: "감사합니다" },
          meaning: { en: "polite thank you", ko: "정중한 감사", es: "gracias formal", id: "ucapan terima kasih yang sopan" },
          wrong: [
            { en: "informal help", ko: "반말 도움 요청", es: "ayuda informal", id: "permintaan tolong yang santai" },
            { en: "left turn", ko: "왼쪽으로 돌기", es: "girar a la izquierda", id: "belok kiri" },
            { en: "a color", ko: "색깔", es: "un color", id: "sebuah warna" },
          ],
        },
        {
          word: { en: "도와주세요", ko: "도와주세요", es: "도와주세요", id: "도와주세요" },
          meaning: { en: "please help me", ko: "정중한 도움 요청", es: "por favor ayúdame", id: "tolong bantu saya" },
          wrong: [
            { en: "informal hey", ko: "반말 인사", es: "oye informal", id: "sapaan santai" },
            { en: "a food order", ko: "음식 주문", es: "pedido de comida", id: "pesanan makanan" },
            { en: "a goodbye", ko: "작별 인사", es: "despedida", id: "ucapan perpisahan" },
          ],
        },
        {
          word: { en: "실례합니다", ko: "실례합니다", es: "실례합니다", id: "실례합니다" },
          meaning: { en: "excuse me, politely", ko: "정중한 실례 표현", es: "disculpe, formal", id: "permisi, dengan sopan" },
          wrong: [
            { en: "where is", ko: "어디예요", es: "dónde está", id: "di mana" },
            { en: "red", ko: "빨간색", es: "rojo", id: "merah" },
            { en: "informal thanks", ko: "반말 감사", es: "gracias informal", id: "terima kasih yang santai" },
          ],
        },
      ],
      hints: {
        h1: { ko: "끝에 -요 또는 -합니다가 있으면 보통 더 정중해요.", en: "Words ending in -요 or -합니다 usually sound more polite.", es: "Las formas que terminan en -요 o -합니다 suelen sonar más formales.", id: "Kata yang berakhiran -요 atau -합니다 biasanya terdengar lebih sopan." },
        h2: { ko: "안녕, 고마워, 도와줘는 가까운 사이의 반말이에요.", en: "안녕, 고마워, and 도와줘 are casual forms.", es: "안녕, 고마워 y 도와줘 son formas casuales.", id: "안녕, 고마워, dan 도와줘 adalah bentuk santai." },
        h3: { ko: "정중한 네 표현: 안녕하세요 / 감사합니다 / 도와주세요 / 실례합니다", en: "The four polite forms: 안녕하세요 / 감사합니다 / 도와주세요 / 실례합니다", es: "Las cuatro formas formales: 안녕하세요 / 감사합니다 / 도와주세요 / 실례합니다", id: "Empat bentuk sopan: 안녕하세요 / 감사합니다 / 도와주세요 / 실례합니다" },
      },
    },
    {
      kind: "scene",
      charId: "minho",
      text: "Better. My taxi app is broken, but my grandmother's market is not. If Seoul is losing order, Youngsook will feel it before any machine does.",
      textKo: "좋아요. 제 택시 앱은 망가졌지만, 우리 할머니 시장은 아직 살아 있어요. 서울의 순서가 무너진다면 영숙 할머니가 기계보다 먼저 느낄 거예요.",
      textEs: "Mejor. Mi app de taxi está rota, pero el mercado de mi abuela no. Si Seúl pierde el orden, Youngsook lo sentirá antes que cualquier máquina.",
      textId: "Lebih baik. Aplikasi taksiku rusak, tapi pasar nenekku tidak. Jika Seoul kehilangan tata urutannya, Youngsook akan merasakannya sebelum mesin mana pun.",
    },
    {
      kind: "scene",
      charId: "youngsook",
      text: "아이고, 먼 길 왔네. Sit. Eat first. Words come back better when people are fed.",
      textKo: "아이고, 먼 길 왔네. 앉아. 먼저 먹어. 사람은 배가 차야 말도 제대로 돌아오는 법이야.",
      textEs: "Ay, viniste de muy lejos. Siéntate. Come primero. Las palabras vuelven mejor cuando la gente está alimentada.",
      textId: "아이고, 먼 길 왔네. Duduk. Makan dulu. Kata-kata kembali lebih baik saat orang sudah kenyang.",
    },
    {
      kind: "puzzle",
      puzzleNum: 2,
      title: { en: "Choose the Polite Reply", ko: "정중한 대답 고르기", es: "Elige la respuesta formal", id: "Pilih Jawaban yang Sopan" },
      context: {
        en: "Youngsook offers food and directions. Choose the reply that keeps the warmth in the conversation.",
        ko: "영숙 할머니가 음식과 길을 내어줍니다. 대화의 온기를 지키는 대답을 고르세요.",
        es: "Youngsook ofrece comida y dirección. Elige la respuesta que conserva la calidez de la conversación.",
        id: "Youngsook menawarkan makanan dan menunjukkan arah. Pilih jawaban yang menjaga kehangatan percakapan.",
      },
      pType: "dialogue-choice",
      tprsStage: 2,
      targetExpressions: ["감사합니다", "도와주세요", "실례합니다"],
      previouslyLearned: ["안녕하세요", "Hello", "Thank you"],
      speakAfter: true,
      storyReason: "Politeness keeps the market voices human instead of flattened by the broadcast.",
      storyConsequence: "Youngsook points you toward Sujin's lab and the old palace record.",
      onFail: { addToWeakExpressions: ["감사합니다", "도와주세요", "실례합니다"], reviewInDailyCourse: true, reviewDays: 3 },
      questions: [
        {
          prompt: { en: "Youngsook gives you soup and points toward the station.", ko: "영숙 할머니가 국을 내어주며 역 쪽을 가리킵니다.", es: "Youngsook te da sopa y señala hacia la estación.", id: "Youngsook memberimu sup dan menunjuk ke arah stasiun." },
          context: { en: "You want to thank her politely.", ko: "정중하게 감사해야 합니다.", es: "Quieres agradecerle de forma formal.", id: "Kamu ingin berterima kasih kepadanya dengan sopan." },
          answer: { en: "감사합니다", ko: "감사합니다", es: "감사합니다", id: "감사합니다" },
          wrong: [
            { en: "고마워", ko: "고마워", es: "고마워", id: "고마워" },
            { en: "야", ko: "야", es: "야", id: "야" },
          ],
        },
        {
          prompt: { en: "The market signs flicker and you need help finding Sujin's lab.", ko: "시장 간판이 깜빡이고 수진 박사의 연구실을 찾아야 합니다.", es: "Los letreros del mercado parpadean y necesitas encontrar el laboratorio de Sujin.", id: "Papan-papan pasar berkedip dan kamu butuh bantuan menemukan laboratorium Sujin." },
          context: { en: "Ask for help politely.", ko: "정중하게 도움을 요청하세요.", es: "Pide ayuda de forma formal.", id: "Mintalah bantuan dengan sopan." },
          answer: { en: "도와주세요", ko: "도와주세요", es: "도와주세요", id: "도와주세요" },
          wrong: [
            { en: "도와줘", ko: "도와줘", es: "도와줘", id: "도와줘" },
            { en: "Help", ko: "Help", es: "Help", id: "Help" },
          ],
        },
      ],
      hints: {
        h1: { ko: "시장에서는 말투가 관계를 만들어요.", en: "In the market, register creates relationship.", es: "En el mercado, el registro crea relación.", id: "Di pasar, gaya bicara membentuk hubungan." },
        h2: { ko: "정중함은 -요 / -합니다 쪽을 고르면 돼요.", en: "Choose the -요 / -합니다 forms for politeness.", es: "Elige formas con -요 / -합니다 para sonar formal.", id: "Pilih bentuk -요 / -합니다 untuk terdengar sopan." },
        h3: { ko: "정답: 감사합니다, 도와주세요", en: "Answers: 감사합니다, 도와주세요", es: "Respuestas: 감사합니다, 도와주세요", id: "Jawaban: 감사합니다, 도와주세요" },
      },
    },
    {
      kind: "scene",
      charId: "youngsook",
      text: "A sentence is like stew. Put the last thing first and the taste changes. Go to Dr. Han. She studies that sort of broken order.",
      textKo: "문장은 찌개 같아. 마지막에 넣을 걸 처음에 넣으면 맛이 달라지지. 한 박사에게 가봐. 그 사람은 그런 무너진 순서를 연구해.",
      textEs: "Una frase es como un guiso. Si pones primero lo que va al final, cambia el sabor. Ve con la Dra. Han. Ella estudia ese orden roto.",
      textId: "Sebuah kalimat itu seperti sup. Taruh yang seharusnya terakhir di depan, dan rasanya berubah. Pergilah ke Dr. Han. Dia mempelajari tata urutan yang rusak seperti itu.",
    },
    {
      kind: "scene",
      charId: "sujin",
      text: "You made it here without a translator? Good. Korean often waits until the end to reveal the verb. Black's system hates that patience.",
      textKo: "번역기 없이 여기까지 왔다고요? 좋아요. 한국어는 동사를 끝까지 기다렸다가 보여줄 때가 많아요. 블랙의 시스템은 그 기다림을 싫어합니다.",
      textEs: "¿Llegaste hasta aquí sin traductor? Bien. El coreano suele esperar hasta el final para revelar el verbo. El sistema de Black odia esa paciencia.",
      textId: "Kamu sampai di sini tanpa penerjemah? Bagus. Bahasa Korea sering menunggu sampai akhir untuk memunculkan kata kerjanya. Sistem Black benci kesabaran semacam itu.",
    },
    {
      kind: "scene",
      charId: "sujin",
      text: "Look: 저는 / 박물관에 / 가요. In English, you rush to the verb. In Korean, the path can come before the action.",
      textKo: "보세요. 저는 / 박물관에 / 가요. 영어는 동사로 빨리 달려가지만, 한국어는 행동 전에 길을 먼저 말할 수 있어요.",
      textEs: "Mira: 저는 / 박물관에 / 가요. En inglés corres hacia el verbo. En coreano, el camino puede aparecer antes de la acción.",
      textId: "Lihat: 저는 / 박물관에 / 가요. Dalam bahasa Inggris, kamu langsung menuju kata kerja. Dalam bahasa Korea, jalannya bisa muncul sebelum tindakannya.",
    },
    {
      kind: "puzzle",
      puzzleNum: 3,
      title: { en: "Build the Korean Order", ko: "한국어 어순 만들기", es: "Construir el orden coreano", id: "Susun Tata Urutan Korea" },
      context: {
        en: "Sujin needs you to place the sentence pieces in Korean order.",
        ko: "수진 박사가 문장 조각을 한국어 순서로 놓아 달라고 합니다.",
        es: "Sujin necesita que coloques las piezas en orden coreano.",
        id: "Sujin memintamu menyusun potongan kalimat sesuai tata urutan Korea.",
      },
      pType: "sentence-builder",
      tprsStage: 3,
      targetExpressions: ["저는", "박물관에", "가요", "박물관은 어디예요?"],
      previouslyLearned: ["안녕하세요", "도와주세요"],
      speakAfter: true,
      storyReason: "Restore sentence order before approaching the sealed palace.",
      storyConsequence: "The route to Gyeongbokgung stabilizes on Sujin's broken map.",
      onFail: { addToWeakExpressions: ["저는 박물관에 가요", "박물관은 어디예요?"], reviewInDailyCourse: true, reviewDays: 3 },
      questions: [
        {
          instruction: { en: "Build: I go to the museum.", ko: "문장을 만드세요: 저는 박물관에 가요.", es: "Construye: Voy al museo.", id: "Susun: Saya pergi ke museum." },
          words: [
            { en: "저는", ko: "저는", es: "저는", id: "저는" },
            { en: "박물관에", ko: "박물관에", es: "박물관에", id: "박물관에" },
            { en: "가요", ko: "가요", es: "가요", id: "가요" },
          ],
          answerOrder: [0, 1, 2],
        },
        {
          instruction: { en: "Build: Where is the museum?", ko: "문장을 만드세요: 박물관은 어디예요?", es: "Construye: ¿Dónde está el museo?", id: "Susun: Di mana museumnya?" },
          words: [
            { en: "박물관은", ko: "박물관은", es: "박물관은", id: "박물관은" },
            { en: "어디예요?", ko: "어디예요?", es: "어디예요?", id: "어디예요?" },
          ],
          answerOrder: [0, 1],
        },
      ],
      hints: {
        h1: { ko: "한국어는 동사가 뒤에 오는 경우가 많아요.", en: "Korean often places the verb near the end.", es: "El coreano suele poner el verbo cerca del final.", id: "Bahasa Korea sering menempatkan kata kerja di dekat akhir." },
        h2: { ko: "저는 → 박물관에 → 가요", en: "저는 → 박물관에 → 가요", es: "저는 → 박물관에 → 가요", id: "저는 → 박물관에 → 가요" },
        h3: { ko: "질문은 박물관은 → 어디예요?", en: "The question is 박물관은 → 어디예요?", es: "La pregunta es 박물관은 → 어디예요?", id: "Pertanyaannya 박물관은 → 어디예요?" },
      },
    },
    {
      kind: "scene",
      charId: "lingo",
      isNarration: true,
      text: "(Gyeongbokgung waits under a dark sky. The gate is still there, but parts of it blink like a sentence with its words in the wrong places.)",
      textKo: "(경복궁은 어두운 하늘 아래 기다리고 있다. 문은 아직 그곳에 있지만, 일부는 단어의 순서가 어긋난 문장처럼 깜빡인다.)",
      textEs: "(Gyeongbokgung espera bajo un cielo oscuro. La puerta sigue allí, pero partes parpadean como una frase con las palabras fuera de lugar.)",
      textId: "(Gyeongbokgung menanti di bawah langit gelap. Gerbangnya masih di sana, tapi sebagian berkedip seperti kalimat dengan kata-kata yang salah letak.)",
    },
    {
      kind: "scene",
      charId: "sujin",
      text: "This is not only a palace gate. It is a sentence. If the order collapses, the building forgets how to stand.",
      textKo: "이건 단순한 궁궐 문이 아니에요. 문장입니다. 순서가 무너지면 건물은 서 있는 법을 잊어요.",
      textEs: "No es solo una puerta de palacio. Es una frase. Si el orden colapsa, el edificio olvida cómo sostenerse.",
      textId: "Ini bukan sekadar gerbang istana. Ini adalah sebuah kalimat. Jika tata urutannya runtuh, bangunan ini lupa cara berdiri.",
    },
    {
      kind: "puzzle",
      puzzleNum: 4,
      title: { en: "Find the Ordered Clue", ko: "순서가 맞는 단서 찾기", es: "Encontrar la pista ordenada", id: "Temukan Petunjuk yang Berurutan" },
      context: {
        en: "Three clues remain near the palace gate. Only one keeps the sentence order intact.",
        ko: "궁궐 문 근처에 단서 세 개가 남아 있습니다. 그중 하나만 문장 순서를 온전히 지킵니다.",
        es: "Quedan tres pistas junto a la puerta. Solo una conserva intacto el orden de la frase.",
        id: "Tiga petunjuk tersisa di dekat gerbang istana. Hanya satu yang menjaga tata urutan kalimatnya tetap utuh.",
      },
      pType: "investigation",
      tprsStage: 3,
      targetExpressions: ["박물관은 어디예요?", "순서", "도와주세요"],
      previouslyLearned: ["안녕하세요", "실례합니다"],
      storyReason: "Identify the clue Black left without accepting his flattened order.",
      storyConsequence: "Sujin intercepts a clean, cold voice hidden under the palace signal.",
      onFail: { addToWeakExpressions: ["박물관은 어디예요?", "도와주세요"], reviewInDailyCourse: true, reviewDays: 3 },
      questions: [
        {
          prompt: { en: "Which clue still has human order?", ko: "어떤 단서가 아직 사람의 순서를 지키고 있나요?", es: "¿Qué pista conserva todavía el orden humano?", id: "Petunjuk mana yang masih memiliki tata urutan manusiawi?" },
          clues: [
            { en: "A palace map where every label is alphabetized by machine.", ko: "모든 이름이 기계식 알파벳 순서로 정리된 궁궐 지도", es: "Un mapa del palacio con todas las etiquetas ordenadas por máquina", id: "Peta istana yang setiap labelnya diurutkan secara alfabetis oleh mesin." },
            { en: "A note: 실례합니다. 박물관은 어디예요? The handwriting hesitates before 어디예요.", ko: "메모: 실례합니다. 박물관은 어디예요? 어디예요 앞에서 손글씨가 잠시 흔들린다.", es: "Una nota: 실례합니다. 박물관은 어디예요? La letra duda antes de 어디예요.", id: "Sebuah catatan: 실례합니다. 박물관은 어디예요? Tulisan tangannya ragu sejenak sebelum 어디예요." },
            { en: "A receipt where every Korean ending has been replaced by one smooth tone.", ko: "모든 한국어 어미가 하나의 매끈한 말투로 바뀐 영수증", es: "Un recibo donde cada final coreano fue reemplazado por un tono liso", id: "Sebuah struk yang setiap akhiran Korea-nya diganti dengan satu nada yang licin." },
          ],
          answerIdx: 1,
        },
      ],
      hints: {
        h1: { ko: "사람의 말에는 머뭇거림이 남아 있어요.", en: "Human language often leaves hesitation behind.", es: "El lenguaje humano suele dejar dudas.", id: "Bahasa manusia sering meninggalkan keraguan." },
        h2: { ko: "정중한 질문 형태를 찾으세요.", en: "Look for the polite question form.", es: "Busca la forma formal de pregunta.", id: "Cari bentuk pertanyaan yang sopan." },
        h3: { ko: "정답은 손글씨 메모예요: 실례합니다. 박물관은 어디예요?", en: "The answer is the handwritten note: 실례합니다. 박물관은 어디예요?", es: "La respuesta es la nota manuscrita: 실례합니다. 박물관은 어디예요?", id: "Jawabannya adalah catatan tulisan tangan: 실례합니다. 박물관은 어디예요?" },
      },
    },
    {
      kind: "scene",
      charId: "sujin",
      text: "I have the signal. It is not live video. It is an intercepted recording, buried inside the gate's static. No face. Only a voice.",
      textKo: "신호를 잡았어요. 실시간 영상이 아니에요. 궁궐 문의 잡음 안에 묻힌 가로챈 녹음입니다. 얼굴은 없어요. 목소리뿐입니다.",
      textEs: "Tengo la señal. No es video en vivo. Es una grabación interceptada, enterrada en la estática de la puerta. Sin rostro. Solo una voz.",
      textId: "Aku menangkap sinyalnya. Ini bukan video langsung. Ini rekaman yang disadap, terkubur di dalam derau gerbang. Tak ada wajah. Hanya suara.",
    },
    {
      kind: "scene",
      charId: "lingo",
      isNarration: true,
      text: "\"Translation isn't theft. Misunderstanding is.\"",
      textKo: "\"번역은 도둑질이 아니다. 오해가 도둑질이다.\"",
      textEs: "\"Traducir no es robar. Malentender sí lo es.\"",
      textId: "\"Menerjemahkan bukanlah pencurian. Salah pahamlah yang mencuri.\"",
    },
    {
      kind: "clue",
      symbol: "📻",
      titleEn: "Intercepted Signal: B",
      titleKo: "가로챈 신호: B",
      titleEs: "Señal Interceptada: B",
      titleId: "Sinyal yang Disadap: B",
      descEn: "Sujin isolates a transmission hidden inside the palace static. The sender never appears on camera. The message insists that translation is protection, not theft. Rudy hears it and goes still.",
      descKo: "수진은 궁궐의 잡음 속에 숨겨진 송신을 분리해낸다. 발신자는 카메라에 나타나지 않는다. 메시지는 번역이 도둑질이 아니라 보호라고 주장한다. 루디는 그 목소리를 듣고 굳어버린다.",
      descEs: "Sujin aísla una transmisión oculta dentro de la estática del palacio. El emisor nunca aparece en cámara. El mensaje insiste en que traducir es proteger, no robar. Rudy lo oye y se queda inmóvil.",
      descId: "Sujin memisahkan sebuah transmisi yang tersembunyi di dalam derau istana. Si pengirim tak pernah muncul di kamera. Pesan itu bersikeras bahwa menerjemahkan adalah perlindungan, bukan pencurian. Rudy mendengarnya dan terdiam.",
    },
    {
      kind: "scene",
      charId: "sujin",
      text: "There is one more line in Korean. 잘했어요. 다음은 카이로예요. He knew you would read it.",
      textKo: "한국어로 한 줄이 더 있어요. 잘했어요. 다음은 카이로예요. 당신이 읽을 걸 알고 있었던 거예요.",
      textEs: "Hay una línea más en coreano. 잘했어요. 다음은 카이로예요. Sabía que podrías leerla.",
      textId: "Ada satu baris lagi dalam bahasa Korea. 잘했어요. 다음은 카이로예요. Dia tahu kamu akan membacanya.",
    },
    {
      kind: "scene",
      charId: "lingo",
      text: "The gate is listening. It does not need a perfect translation. It needs respect, help, and the right order.",
      textKo: "문이 듣고 있어요. 완벽한 번역이 필요한 게 아니에요. 정중함, 도움 요청, 그리고 올바른 순서가 필요해요.",
      textEs: "La puerta escucha. No necesita una traducción perfecta. Necesita respeto, ayuda y el orden correcto.",
      textId: "Gerbang ini sedang mendengarkan. Ia tidak butuh terjemahan yang sempurna. Ia butuh rasa hormat, permintaan tolong, dan tata urutan yang benar.",
    },
    {
      kind: "puzzle",
      puzzleNum: 5,
      title: { en: "Seoul Boss Spell", ko: "서울 보스 주문", es: "Hechizo Jefe de Seúl", id: "Mantra Bos Seoul" },
      context: {
        en: "Use polite Korean to open the palace gate.",
        ko: "정중한 한국어로 궁궐 문을 열어요.",
        es: "Usa coreano formal para abrir la puerta del palacio.",
        id: "Gunakan bahasa Korea yang sopan untuk membuka gerbang istana.",
      },
      pType: "boss-spell",
      tprsStage: 4,
      targetExpressions: ["안녕하세요", "도와주세요", "박물관은", "어디예요?"],
      previouslyLearned: ["감사합니다", "실례합니다", "Hello", "Goodbye"],
      speakAfter: true,
      storyReason: "Complete the Korean Boss Spell to restore the palace order.",
      storyConsequence: "The palace reassembles, and the Seoul Stone fragment answers Rudy.",
      onFail: { addToWeakExpressions: ["안녕하세요", "도와주세요", "박물관은", "어디예요?"], reviewInDailyCourse: true, reviewDays: 3 },
      questions: [
        {
          spellChunks: ["안녕하세요", "도와주세요", "박물관은", "어디예요?"],
          separators: [".", ".", "", ""],
          wordPool: ["안녕하세요", "도와주세요", "박물관은", "어디예요?", "안녕", "도와줘", "어디야?"],
          instruction: {
            en: "Use polite Korean to open the palace gate.",
            ko: "정중한 한국어로 궁궐 문을 열어요.",
            es: "Usa coreano formal para abrir la puerta del palacio.",
            id: "Gunakan bahasa Korea yang sopan untuk membuka gerbang istana.",
          },
          hints: {
            h1: {
              ko: "정중한 형태를 골라요. 반말은 이 문에 통하지 않아요.",
              en: "Choose polite forms. Informal speech will not work on this gate.",
              es: "Elige formas formales. El habla informal no funciona en esta puerta.",
              id: "Pilih bentuk yang sopan. Bahasa santai tidak mempan pada gerbang ini.",
            },
            h2: {
              ko: "순서: 안녕하세요 → 도와주세요 → 박물관은 → 어디예요?",
              en: "Order: 안녕하세요 → 도와주세요 → 박물관은 → 어디예요?",
              es: "Orden: 안녕하세요 → 도와주세요 → 박물관은 → 어디예요?",
              id: "Urutan: 안녕하세요 → 도와주세요 → 박물관은 → 어디예요?",
            },
            h3: {
              ko: "정답 문장: 안녕하세요. 도와주세요. 박물관은 어디예요?",
              en: "Answer: 안녕하세요. 도와주세요. 박물관은 어디예요?",
              es: "Respuesta: 안녕하세요. 도와주세요. 박물관은 어디예요?",
              id: "Jawaban: 안녕하세요. 도와주세요. 박물관은 어디예요?",
            },
          },
          storyReason: {
            en: "The palace gate is sealed. Only polite Korean can open it.",
            ko: "궁궐 문이 봉인되어 있어요. 정중한 한국어만이 열 수 있어요.",
            es: "La puerta del palacio está sellada. Solo el coreano formal puede abrirla.",
            id: "Gerbang istana tersegel. Hanya bahasa Korea yang sopan yang bisa membukanya.",
          },
          storyConsequence: {
            en: "The palace reassembles. Each chunk restores one wing.",
            ko: "궁궐이 재조립돼요. 각 조각이 한 채씩 복구해요.",
            es: "El palacio se reconstruye. Cada pieza restaura una sección.",
            id: "Istana itu tersusun kembali. Tiap potongan memulihkan satu sayap bangunan.",
          },
          doorImage: ch3BossPalaceImg,
        },
      ],
      hints: {
        h1: { ko: "반말 distractor를 피하세요: 안녕 / 도와줘 / 어디야?", en: "Avoid the informal distractors: 안녕 / 도와줘 / 어디야?", es: "Evita los distractores informales: 안녕 / 도와줘 / 어디야?", id: "Hindari pengecoh santai: 안녕 / 도와줘 / 어디야?" },
        h2: { ko: "정중한 순서: 안녕하세요. 도와주세요. 박물관은 어디예요?", en: "Polite order: 안녕하세요. 도와주세요. 박물관은 어디예요?", es: "Orden formal: 안녕하세요. 도와주세요. 박물관은 어디예요?", id: "Urutan sopan: 안녕하세요. 도와주세요. 박물관은 어디예요?" },
        h3: { ko: "정답 문장: 안녕하세요. 도와주세요. 박물관은 어디예요?", en: "Answer sentence: 안녕하세요. 도와주세요. 박물관은 어디예요?", es: "Frase correcta: 안녕하세요. 도와주세요. 박물관은 어디예요?", id: "Kalimat jawaban: 안녕하세요. 도와주세요. 박물관은 어디예요?" },
      },
    },
    {
      kind: "scene",
      charId: "lingo",
      isNarration: true,
      text: "(The Korean sentence climbs the golden cracks. One roof beam returns. Then a painted bracket. Then a whole wing of the palace remembers how to stand.)",
      textKo: "(한국어 문장이 금빛 균열을 타고 올라간다. 지붕 보 하나가 돌아온다. 단청 공포가 돌아온다. 마침내 궁궐 한 채가 서 있는 법을 기억해낸다.)",
      textEs: "(La frase coreana trepa por las grietas doradas. Vuelve una viga del techo. Luego un soporte pintado. Por fin, un ala del palacio recuerda cómo sostenerse.)",
      textId: "(Kalimat Korea itu merayap di sepanjang retakan emas. Satu balok atap kembali. Lalu sebuah penyangga berukir. Lalu seluruh sayap istana mengingat kembali cara berdiri.)",
    },
    {
      kind: "scene",
      charId: "sujin",
      text: "The fragment is responding. Voice, meaning, structure... Seoul's stone remembers harmony.",
      textKo: "파편이 반응하고 있어요. 목소리, 의미, 구조... 서울의 돌은 조화를 기억합니다.",
      textEs: "El fragmento responde. Voz, significado, estructura... la piedra de Seúl recuerda la armonía.",
      textId: "Pecahan itu merespons. Suara, makna, struktur... batu Seoul mengingat keselarasan.",
    },
    {
      kind: "scene",
      charId: "lingo",
      text: "I just read that. In Korean. Not through the phone. Not through him. I read it myself.",
      textKo: "나 방금 읽었어요. 한국어로. 휴대폰도 아니고, 그 사람의 시스템도 아니고. 내가 직접 읽었어요.",
      textEs: "Acabo de leer eso. En coreano. No por el teléfono. No por él. Lo leí yo mismo.",
      textId: "Aku baru saja membaca itu. Dalam bahasa Korea. Bukan lewat ponsel. Bukan lewat dia. Aku membacanya sendiri.",
    },
    {
      kind: "clue",
      symbol: "📀",
      titleEn: "Old Record: Cairo Ward",
      titleKo: "오래된 기록: 카이로 병동",
      titleEs: "Registro Antiguo: Sala de El Cairo",
      titleId: "Catatan Lama: Bangsal Kairo",
      descEn: "Behind the restored gate, Sujin finds a hospital translation record. It names a young translator, a child, and a night when the word water failed to arrive in time. The next seal points to Cairo.",
      descKo: "복원된 문 뒤에서 수진은 병원 통역 기록을 발견한다. 기록에는 젊은 통역사, 한 아이, 그리고 water라는 단어가 제때 도착하지 못했던 밤이 적혀 있다. 다음 봉인은 카이로를 가리킨다.",
      descEs: "Detrás de la puerta restaurada, Sujin encuentra un registro de traducción hospitalaria. Nombra a un joven traductor, una niña y una noche en que la palabra water no llegó a tiempo. El siguiente sello apunta a El Cairo.",
      descId: "Di balik gerbang yang dipulihkan, Sujin menemukan catatan penerjemahan rumah sakit. Catatan itu menyebut seorang penerjemah muda, seorang anak, dan satu malam ketika kata water gagal tiba tepat waktu. Segel berikutnya menunjuk ke Kairo.",
    },
    {
      kind: "scene",
      charId: "eleanor",
      expression: "analytical",
      text: "*from London* A hospital record? Send it to me. Ellis studied emergency translation before she disappeared. Detective, Cairo may be where Black's wound began.",
      textKo: "*런던에서* 병원 기록이라고요? 제게 보내주세요. 엘리스는 사라지기 전 응급 통역을 연구하고 있었어요. 탐정님, 카이로가 블랙의 상처가 시작된 곳일지도 모릅니다.",
      textEs: "*desde Londres* ¿Un registro de hospital? Envíamelo. Ellis estudiaba traducción de emergencia antes de desaparecer. Detective, quizá El Cairo sea donde empezó la herida de Black.",
      textId: "*dari London* Catatan rumah sakit? Kirimkan padaku. Ellis mempelajari penerjemahan darurat sebelum ia menghilang. Detektif, Kairo mungkin tempat luka Black bermula.",
    },
    {
      kind: "scene",
      charId: "youngsook",
      text: "가야지. But eat one more bite before you go. Goodbye, Detective. And 감사합니다 for bringing the order back.",
      textKo: "가야지. 그래도 가기 전에 한 입 더 먹고 가. Goodbye, 탐정. 그리고 순서를 되돌려줘서 감사합니다.",
      textEs: "Tienes que ir. Pero come un bocado más antes. Goodbye, Detective. Y 감사합니다 por devolver el orden.",
      textId: "가야지. Tapi makan satu suap lagi sebelum kau pergi. Goodbye, Detektif. Dan 감사합니다 karena sudah mengembalikan tata urutannya.",
    },
    {
      kind: "clue",
      symbol: "🏺",
      titleEn: "Cairo Hook: The Word That Arrived Too Late",
      titleKo: "카이로 단서: 너무 늦게 도착한 단어",
      titleEs: "Gancho de El Cairo: La palabra que llegó tarde",
      titleId: "Petunjuk Kairo: Kata yang Datang Terlambat",
      descEn: "The Seoul record connects Ellis, Black, and an old emergency ward in Cairo. It does not reveal his face, but it reveals the shape of his grief. The next city waits in dust, ink, and a grandmother's song.",
      descKo: "서울의 기록은 엘리스, 블랙, 그리고 카이로의 오래된 응급 병동을 연결한다. 그의 얼굴은 드러나지 않지만, 그의 슬픔의 형태는 드러난다. 다음 도시는 먼지와 잉크, 그리고 할머니의 노래 속에서 기다린다.",
      descEs: "El registro de Seúl conecta a Ellis, Black y una antigua sala de urgencias en El Cairo. No revela su rostro, pero sí la forma de su dolor. La próxima ciudad espera entre polvo, tinta y la canción de una abuela.",
      descId: "Catatan Seoul menghubungkan Ellis, Black, dan bangsal gawat darurat tua di Kairo. Catatan itu tak mengungkap wajahnya, tapi mengungkap bentuk kesedihannya. Kota berikutnya menanti dalam debu, tinta, dan nyanyian seorang nenek.",
    },
  ],
};

const CAIRO_V21_STORY: Story = {
  id: "cairo",
  title: "The Cairo Record",
  titleKo: "카이로의 기록",
  titleEs: "El Registro de El Cairo",
  titleId: "Catatan Kairo",
  gradient: ["#120B05", "#2A1A0A", "#0D1B2A"],
  accentColor: C.gold,
  nextChapterId: "babel",
  chapterMeta: {
    cefrLevel: "A2",
    targetLangRatio: 48,
    knownExpressions: [
      "I remember",
      "She wrote",
      "the lullaby",
      "Where is the record?",
      "It was beautiful",
      "record",
      "remember",
      "wrote",
      "lullaby",
      "Hello",
      "Thank you",
      "Goodbye",
    ],
    languageNote:
      "Cairo teaches records, memory, and simple past tense. The chapter also reveals the cost of Universal Code through Mira's flattened voice.",
  },
  characters: [
    { id: "lingo", emoji: "🦊", name: "Detective Rudy", nameKo: "탐정 루디", nameId: "Detektif Rudy", side: "left", avatarBg: C.gold, isLingo: true, portrait: rudyStoryImg, portraitVariants: rudyExpressionSprites },
    { id: "mira", emoji: "☕", name: "Mira", nameKo: "미라", nameId: "Mira", side: "right", avatarBg: "#2F4A34", portrait: ch4MiraPortraitImg },
    { id: "amira", emoji: "📜", name: "Professor Amira", nameKo: "아미라 교수", nameId: "Profesor Amira", side: "right", avatarBg: "#7A4D19", portrait: ch4AmiraPortraitImg },
    { id: "hassan", emoji: "🪕", name: "Hassan", nameKo: "하산", nameId: "Hassan", side: "right", avatarBg: "#5A3216", portrait: ch4HassanPortraitImg },
    { id: "black_partial", emoji: "◼", name: "A Voice in Shadow", nameKo: "그림자 속 목소리", nameId: "Suara dalam Bayangan", side: "right", avatarBg: "#050505", portrait: ch4BlackPartialPortraitImg },
    { id: "eleanor", emoji: "📚", name: "Dr. Eleanor Vale", nameKo: "엘리너 베일 박사", nameId: "Dr. Eleanor Vale", side: "right", avatarBg: "#637081", portrait: ch1EleanorPortraitImg, portraitVariants: eleanorExpressionSprites },
  ],
  sequence: [
    {
      kind: "scene",
      charId: "lingo",
      isNarration: true,
      text: "(Cairo. The record from Seoul ends at the museum archive. The file names a hospital ward, a translator, a child, and one word that arrived too late. Inside Rudy's pocket, the three city fragments pulse like they are afraid of what comes next.)",
      textKo: "(카이로. 서울에서 발견한 기록은 박물관 기록실에서 끝난다. 파일에는 병동, 통역사, 한 아이, 그리고 너무 늦게 도착한 한 단어가 적혀 있다. 루디의 주머니 속 세 도시 파편이 다음에 올 일을 두려워하듯 떨린다.)",
      textEs: "(El Cairo. El registro de Seúl termina en el archivo del museo. El expediente nombra una sala de hospital, un traductor, una niña y una palabra que llegó demasiado tarde. En el bolsillo de Rudy, los tres fragmentos de ciudad laten como si temieran lo que viene.)",
      textId: "(Kairo. Catatan dari Seoul berakhir di arsip museum. Berkas itu menyebut sebuah bangsal rumah sakit, seorang penerjemah, seorang anak, dan satu kata yang datang terlambat. Di dalam saku Rudy, ketiga pecahan kota berdenyut seakan takut akan apa yang datang berikutnya.)",
    },
    {
      kind: "scene",
      charId: "mira",
      text: "Hello, Detective. I am so happy to see you again. Thank you for saving me that night.",
      textKo: "안녕하세요, 탐정님. 다시 만나서 정말 기쁩니다. 그날 저를 구해주셔서 감사합니다.",
      textEs: "Hola, Detective. Estoy muy feliz de verte de nuevo. Gracias por salvarme esa noche.",
      textId: "Hello, Detektif. Saya sangat senang bertemu denganmu lagi. Thank you sudah menyelamatkan saya malam itu.",
    },
    {
      kind: "scene",
      charId: "lingo",
      isNarration: true,
      text: "(Same face. The cafe worker from London. The words are right. The voice is right. But the way she says 'thank you' has no tremble, no relief, no breath between memory and meaning. A clean delivery. Like reading from a script.)",
      textKo: "(같은 얼굴이다. 런던 카페의 그 직원. 단어는 정확하다. 목소리도 정확하다. 하지만 그녀가 'thank you'를 말하는 방식에는 떨림도, 안도도, 기억과 의미 사이의 숨도 없다. 깨끗한 전달. 대본을 읽는 것처럼.)",
      textEs: "(El mismo rostro. La empleada del café de Londres. Las palabras son correctas. La voz es correcta. Pero cuando dice 'thank you' no hay temblor, ni alivio, ni respiración entre memoria y significado. Una entrega limpia. Como leer un guion.)",
      textId: "(Wajah yang sama. Pegawai kafe dari London itu. Kata-katanya tepat. Suaranya tepat. Tapi cara ia mengucapkan 'thank you' tak punya getaran, tak punya kelegaan, tak punya tarikan napas antara ingatan dan makna. Penyampaian yang bersih. Seperti membaca naskah.)",
    },
    {
      kind: "scene",
      charId: "lingo",
      text: "...Something is wrong. She is smooth. Too smooth. She used Universal Code, partner. It gave her every word and took away the person who needed them.",
      textKo: "...뭔가 이상해요. 너무 매끈해요. 너무 정확해요. Universal Code를 쓴 거예요, 파트너. 모든 단어를 주고, 그 단어가 필요했던 사람을 가져갔어요.",
      textEs: "...Algo está mal. Está demasiado pulida. Demasiado precisa. Usó el Código Universal, compa. Le dio cada palabra y le quitó a la persona que las necesitaba.",
      textId: "...Ada yang salah. Dia terlalu mulus. Terlalu mulus. Dia memakai Universal Code, partner. Itu memberinya setiap kata dan merampas orang yang membutuhkannya.",
    },
    {
      kind: "scene",
      charId: "amira",
      text: "Eleanor said you would come. I wish it were under kinder circumstances. Records are disappearing from my archive. Not stolen. Not burned. Forgotten while still on the page.",
      textKo: "엘리너가 당신이 올 거라고 했어요. 더 좋은 상황이었다면 좋았겠지만요. 제 기록실에서 기록들이 사라지고 있어요. 도난도 아니고, 불탄 것도 아니에요. 종이 위에 남아 있는 채로 잊혀지고 있습니다.",
      textEs: "Eleanor dijo que vendrías. Ojalá fuera en mejores circunstancias. Los registros están desapareciendo de mi archivo. No robados. No quemados. Olvidados mientras siguen en la página.",
      textId: "Eleanor bilang kamu akan datang. Andai saja dalam keadaan yang lebih baik. Catatan-catatan menghilang dari arsipku. Tidak dicuri. Tidak terbakar. Terlupakan padahal masih ada di halamannya.",
    },
    {
      kind: "scene",
      charId: "amira",
      text: "Dr. Ellis came here before she vanished. She was studying emergency translation, old inscriptions, and a lullaby written in three languages. Then her notes began losing ink.",
      textKo: "엘리스 박사는 사라지기 전에 이곳에 왔어요. 응급 통역, 오래된 비문, 그리고 세 언어로 적힌 자장가를 연구하고 있었죠. 그러다 그녀의 노트에서 잉크가 사라지기 시작했습니다.",
      textEs: "La Dra. Ellis vino aquí antes de desaparecer. Estudiaba traducción de emergencia, inscripciones antiguas y una nana escrita en tres idiomas. Entonces sus notas empezaron a perder tinta.",
      textId: "Dr. Ellis datang ke sini sebelum ia lenyap. Ia sedang mempelajari penerjemahan darurat, prasasti-prasasti tua, dan sebuah nina bobo yang ditulis dalam tiga bahasa. Lalu catatannya mulai kehilangan tinta.",
    },
    {
      kind: "puzzle",
      puzzleNum: 1,
      title: { en: "Recover the Written Record", ko: "쓰인 기록 복원", es: "Recuperar el registro escrito", id: "Pulihkan Catatan Tertulis" },
      context: {
        en: "Amira needs the first archive words before she can open Ellis's file.",
        ko: "아미라는 엘리스의 파일을 열기 전에 기록실의 핵심 단어들을 복원해야 합니다.",
        es: "Amira necesita las primeras palabras del archivo antes de abrir el expediente de Ellis.",
        id: "Amira butuh kata-kata pertama dari arsip sebelum ia bisa membuka berkas Ellis.",
      },
      pType: "word-match",
      tprsStage: 1,
      targetExpressions: ["record", "remember", "wrote", "lullaby"],
      previouslyLearned: ["Hello", "Thank you", "Where is ___?", "I am happy", "안녕하세요"],
      speakAfter: true,
      storyReason: "Recover the archive words before the hospital record goes blank.",
      storyConsequence: "Ellis's file steadies long enough to reveal the archive wing.",
      onFail: { addToWeakExpressions: ["record", "remember", "wrote", "lullaby"], reviewInDailyCourse: true, reviewDays: 3 },
      questions: [
        {
          word: { en: "record", ko: "기록", es: "registro", id: "catatan" },
          meaning: { en: "proof that something happened", ko: "어떤 일이 있었다는 증거", es: "prueba de que algo ocurrió", id: "bukti bahwa sesuatu pernah terjadi" },
          wrong: [
            { en: "a festival color", ko: "축제의 색", es: "un color de festival", id: "warna festival" },
            { en: "a taxi direction", ko: "택시 방향", es: "una dirección de taxi", id: "arah taksi" },
            { en: "a casual greeting", ko: "가벼운 인사", es: "un saludo casual", id: "sapaan santai" },
          ],
        },
        {
          word: { en: "remember", ko: "기억하다", es: "recordar", id: "mengingat" },
          meaning: { en: "to keep something in your mind", ko: "무언가를 마음속에 간직하다", es: "guardar algo en la mente", id: "menyimpan sesuatu di dalam pikiran" },
          wrong: [
            { en: "to erase a page", ko: "페이지를 지우다", es: "borrar una página", id: "menghapus sebuah halaman" },
            { en: "to ask a price", ko: "가격을 묻다", es: "preguntar un precio", id: "menanyakan harga" },
            { en: "to turn left", ko: "왼쪽으로 돌다", es: "girar a la izquierda", id: "belok kiri" },
          ],
        },
        {
          word: { en: "wrote", ko: "썼다", es: "escribió", id: "menulis (lampau)" },
          meaning: { en: "past tense of write", ko: "write의 과거형", es: "pasado de write", id: "bentuk lampau dari write" },
          wrong: [
            { en: "present tense of write", ko: "write의 현재형", es: "presente de write", id: "bentuk kini dari write" },
            { en: "a place in Seoul", ko: "서울의 장소", es: "un lugar en Seúl", id: "sebuah tempat di Seoul" },
            { en: "a type of food", ko: "음식 종류", es: "un tipo de comida", id: "jenis makanan" },
          ],
        },
        {
          word: { en: "lullaby", ko: "자장가", es: "nana", id: "nina bobo" },
          meaning: { en: "a gentle song sung to a child", ko: "아이에게 불러주는 부드러운 노래", es: "una canción suave para dormir a un niño", id: "lagu lembut yang dinyanyikan untuk seorang anak" },
          wrong: [
            { en: "a museum lock", ko: "박물관 자물쇠", es: "una cerradura de museo", id: "kunci museum" },
            { en: "a cold signal", ko: "차가운 신호", es: "una señal fría", id: "sinyal yang dingin" },
            { en: "a train ticket", ko: "기차표", es: "un billete de tren", id: "tiket kereta" },
          ],
        },
      ],
      hints: {
        h1: { ko: "이번 장은 기록과 과거 시제예요.", en: "This chapter is about records and past tense.", es: "Este capítulo trata de registros y pasado.", id: "Bab ini berkisah tentang catatan dan bentuk lampau." },
        h2: { ko: "wrote는 write의 과거형이에요.", en: "wrote is the past tense of write.", es: "wrote es el pasado de write.", id: "wrote adalah bentuk lampau dari write." },
        h3: { ko: "핵심 단어: record / remember / wrote / lullaby", en: "Key words: record / remember / wrote / lullaby", es: "Palabras clave: record / remember / wrote / lullaby", id: "Kata kunci: record / remember / wrote / lullaby" },
      },
    },
    {
      kind: "scene",
      charId: "hassan",
      backdrop: "cairo-hospital-record",
      text: "My mother's mother sang a lullaby in Nubian, Arabic, and French. I remember only one line. My son remembers the tune. My granddaughter remembers the hand motion. Together, we still have the song.",
      textKo: "제 어머니의 어머니는 누비아어, 아랍어, 프랑스어로 자장가를 불렀습니다. 저는 한 줄만 기억해요. 제 아들은 멜로디를 기억하고, 제 손녀는 손동작을 기억하죠. 함께라면 아직 그 노래가 남아 있습니다.",
      textEs: "La madre de mi madre cantaba una nana en nubio, árabe y francés. Yo recuerdo solo una línea. Mi hijo recuerda la melodía. Mi nieta recuerda el gesto de la mano. Juntos, todavía tenemos la canción.",
      textId: "Ibu dari ibuku menyanyikan nina bobo dalam bahasa Nubia, Arab, dan Prancis. Aku hanya ingat satu baris. Anakku ingat nadanya. Cucuku ingat gerakan tangannya. Bersama-sama, kami masih memiliki lagu itu.",
    },
    {
      kind: "scene",
      charId: "hassan",
      backdrop: "cairo-hospital-record",
      text: "A record is paper. Wisdom is what people carry when the paper burns. But if both disappear, even the dead become lonely.",
      textKo: "기록은 종이입니다. 지혜는 그 종이가 타버린 뒤에도 사람들이 들고 가는 것이죠. 하지만 둘 다 사라지면, 죽은 사람들마저 외로워집니다.",
      textEs: "Un registro es papel. La sabiduría es lo que la gente lleva cuando el papel se quema. Pero si ambos desaparecen, hasta los muertos se quedan solos.",
      textId: "Catatan adalah kertas. Kebijaksanaan adalah apa yang dibawa orang ketika kertas itu terbakar. Tapi jika keduanya hilang, bahkan yang telah tiada pun menjadi kesepian.",
    },
    {
      kind: "puzzle",
      puzzleNum: 2,
      title: { en: "Answer With Memory", ko: "기억으로 답하기", es: "Responder con memoria", id: "Jawab dengan Ingatan" },
      context: {
        en: "Hassan speaks in fragments of memory. Choose the answer that preserves the past, not the flat version.",
        ko: "하산은 기억의 조각들로 말합니다. 평평한 답이 아니라 과거를 보존하는 답을 고르세요.",
        es: "Hassan habla en fragmentos de memoria. Elige la respuesta que preserve el pasado, no la versión plana.",
        id: "Hassan berbicara dalam serpihan ingatan. Pilih jawaban yang menjaga masa lalu, bukan versi yang datar.",
      },
      pType: "dialogue-choice",
      tprsStage: 2,
      targetExpressions: ["I remember", "She wrote", "It was beautiful"],
      previouslyLearned: ["record", "remember", "wrote", "lullaby"],
      speakAfter: true,
      storyReason: "Use memory and past tense to follow Hassan's oral clue.",
      storyConsequence: "Hassan leads you to the inscription chamber where Ellis left her journal.",
      onFail: { addToWeakExpressions: ["I remember", "She wrote", "It was beautiful"], reviewInDailyCourse: true, reviewDays: 3 },
      questions: [
        {
          prompt: { en: "Hassan asks what survives when a page is erased.", ko: "하산은 페이지가 지워진 뒤 무엇이 남는지 묻습니다.", es: "Hassan pregunta qué sobrevive cuando se borra una página.", id: "Hassan bertanya apa yang bertahan ketika sebuah halaman dihapus." },
          context: { en: "Answer from memory.", ko: "기억으로 답하세요.", es: "Responde desde la memoria.", id: "Jawablah dari ingatan." },
          answer: { en: "I remember.", ko: "I remember.", es: "I remember.", id: "I remember." },
          wrong: [
            { en: "I forget.", ko: "I forget.", es: "I forget.", id: "I forget." },
            { en: "How much?", ko: "How much?", es: "How much?", id: "How much?" },
          ],
        },
        {
          prompt: { en: "Amira shows a note in Ellis's handwriting. What do you say?", ko: "아미라가 엘리스의 필체로 된 메모를 보여줍니다. 뭐라고 말할까요?", es: "Amira muestra una nota con la letra de Ellis. ¿Qué dices?", id: "Amira menunjukkan catatan dengan tulisan tangan Ellis. Apa yang kamu katakan?" },
          context: { en: "Use past tense.", ko: "과거 시제를 쓰세요.", es: "Usa el pasado.", id: "Gunakan bentuk lampau." },
          answer: { en: "She wrote about it.", ko: "She wrote about it.", es: "She wrote about it.", id: "She wrote about it." },
          wrong: [
            { en: "She writes about it.", ko: "She writes about it.", es: "She writes about it.", id: "She writes about it." },
            { en: "She is happy.", ko: "She is happy.", es: "She is happy.", id: "She is happy." },
          ],
        },
        {
          prompt: { en: "Hassan hums one surviving line of the lullaby.", ko: "하산이 살아남은 자장가 한 줄을 흥얼거립니다.", es: "Hassan tararea una línea sobreviviente de la nana.", id: "Hassan menyenandungkan satu baris nina bobo yang bertahan." },
          context: { en: "Describe what it was.", ko: "그것이 어땠는지 말하세요.", es: "Describe cómo era.", id: "Gambarkan dulu seperti apa." },
          answer: { en: "It was beautiful.", ko: "It was beautiful.", es: "It was beautiful.", id: "It was beautiful." },
          wrong: [
            { en: "It is a taxi.", ko: "It is a taxi.", es: "It is a taxi.", id: "It is a taxi." },
            { en: "Bread please.", ko: "Bread please.", es: "Bread please.", id: "Bread please." },
          ],
        },
      ],
      hints: {
        h1: { ko: "과거를 말할 때 was / wrote를 써요.", en: "Use was / wrote when speaking about the past.", es: "Usa was / wrote para hablar del pasado.", id: "Gunakan was / wrote saat berbicara tentang masa lalu." },
        h2: { ko: "She writes는 현재, She wrote는 과거예요.", en: "She writes is present; She wrote is past.", es: "She writes es presente; She wrote es pasado.", id: "She writes itu kini; She wrote itu lampau." },
        h3: { ko: "정답 흐름: I remember / She wrote about it / It was beautiful", en: "Answer flow: I remember / She wrote about it / It was beautiful", es: "Flujo correcto: I remember / She wrote about it / It was beautiful", id: "Alur jawaban: I remember / She wrote about it / It was beautiful" },
      },
    },
    {
      kind: "scene",
      charId: "amira",
      backdrop: "cairo-hospital-record",
      text: "Here. Ellis's journal. The ink keeps trying to leave the page, but one line is still holding on.",
      textKo: "여기요. 엘리스의 일지입니다. 잉크가 계속 페이지를 떠나려 하지만, 한 줄은 아직 버티고 있어요.",
      textEs: "Aquí. El diario de Ellis. La tinta sigue intentando abandonar la página, pero una línea aún resiste.",
      textId: "Ini. Jurnal Ellis. Tintanya terus berusaha meninggalkan halaman, tapi satu baris masih bertahan.",
    },
    {
      kind: "puzzle",
      puzzleNum: 3,
      title: { en: "Find Ellis's Page", ko: "엘리스의 페이지 찾기", es: "Encontrar la página de Ellis", id: "Temukan Halaman Ellis" },
      context: {
        en: "Three archive items remain. Only one is Ellis's true journal page.",
        ko: "기록실에 세 가지 물건이 남아 있습니다. 그중 하나만 엘리스의 진짜 일지입니다.",
        es: "Quedan tres objetos de archivo. Solo uno es la página verdadera del diario de Ellis.",
        id: "Tiga benda arsip tersisa. Hanya satu yang merupakan halaman jurnal asli Ellis.",
      },
      pType: "investigation",
      tprsStage: 3,
      targetExpressions: ["I was here", "She wrote", "Where is the record?"],
      previouslyLearned: ["record", "remember", "wrote", "lullaby", "It was beautiful"],
      storyReason: "Find the page Ellis left before the archive seal closes.",
      storyConsequence: "Ellis's words reveal the Boss Spell hidden in the inscription chamber.",
      onFail: { addToWeakExpressions: ["She wrote", "Where is the record?"], reviewInDailyCourse: true, reviewDays: 3 },
      questions: [
        {
          prompt: { en: "Which item is Ellis's true journal page?", ko: "어느 물건이 엘리스의 진짜 일지 페이지인가요?", es: "¿Qué objeto es la página verdadera del diario de Ellis?", id: "Benda mana yang merupakan halaman jurnal asli Ellis?" },
          clues: [
            { en: "A clean typed summary where every sentence is perfect and no one sounds afraid.", ko: "모든 문장이 완벽하고 아무도 두려워하지 않는 것처럼 보이는 깨끗한 요약문.", es: "Un resumen limpio donde cada frase es perfecta y nadie parece tener miedo.", id: "Ringkasan ketik yang bersih, setiap kalimatnya sempurna dan tak ada yang terdengar takut." },
            { en: "A torn journal page: 'I was here. I spoke. I mattered.' Beside it, a lullaby copied in three uneven hands.", ko: "찢어진 일지 페이지: 'I was here. I spoke. I mattered.' 그 옆에는 세 가지 다른 손글씨로 베껴 쓴 자장가.", es: "Una página rota: 'I was here. I spoke. I mattered.' Al lado, una nana copiada por tres manos distintas.", id: "Halaman jurnal yang robek: 'I was here. I spoke. I mattered.' Di sampingnya, sebuah nina bobo yang disalin oleh tiga tulisan tangan berbeda." },
            { en: "A blank hospital form stamped with a machine translation seal.", ko: "기계 번역 도장이 찍힌 빈 병원 양식.", es: "Un formulario hospitalario en blanco con un sello de traducción automática.", id: "Formulir rumah sakit kosong yang dicap segel terjemahan mesin." },
          ],
          answerIdx: 1,
        },
      ],
      hints: {
        h1: { ko: "진짜 기록은 완벽하지 않아도 사람의 흔적이 있어요.", en: "The true record has human traces, even if it is imperfect.", es: "El registro verdadero tiene huellas humanas, aunque sea imperfecto.", id: "Catatan yang asli memiliki jejak manusia, meski tak sempurna." },
        h2: { ko: "Lock 문장: I was here. I spoke. I mattered.", en: "Lock line: I was here. I spoke. I mattered.", es: "Línea clave: I was here. I spoke. I mattered.", id: "Baris kunci: I was here. I spoke. I mattered." },
        h3: { ko: "정답은 찢어진 엘리스 일지 페이지예요.", en: "The answer is the torn Ellis journal page.", es: "La respuesta es la página rota del diario de Ellis.", id: "Jawabannya adalah halaman jurnal Ellis yang robek." },
      },
    },
    {
      kind: "scene",
      charId: "lingo",
      backdrop: "cairo-hospital-record",
      text: "She left this for us. Not a message to be translated. A proof that she was here.",
      textKo: "엘리스가 우리에게 남긴 거예요. 번역하라고 남긴 메시지가 아니에요. 그녀가 여기 있었다는 증거예요.",
      textEs: "Ella dejó esto para nosotros. No un mensaje para traducir. Una prueba de que estuvo aquí.",
      textId: "Ellis meninggalkan ini untuk kita. Bukan pesan untuk diterjemahkan. Sebuah bukti bahwa ia pernah di sini.",
    },
    {
      kind: "scene",
      charId: "lingo",
      isNarration: true,
      backdrop: "cairo-hospital-record",
      text: "(The oil lamps dim. In the reflection of the cracked stone wall, a black coat stops behind you. Not a face. Not yet. Only a hand, a shard of gold, and a mouth half-hidden by shadow.)",
      textKo: "(기름등이 어두워진다. 금이 간 돌벽의 반사 속에서 검은 코트가 뒤에 멈춘다. 얼굴은 아니다. 아직은. 손, 금빛 파편, 그리고 그림자에 반쯤 숨은 입가뿐이다.)",
      textEs: "(Las lámparas de aceite se apagan un poco. En el reflejo del muro agrietado, un abrigo negro se detiene detrás de ti. No es un rostro. Todavía no. Solo una mano, un fragmento dorado y una boca medio oculta por la sombra.)",
      textId: "(Lampu-lampu minyak meredup. Dalam pantulan dinding batu yang retak, sebuah mantel hitam berhenti di belakangmu. Bukan wajah. Belum. Hanya sebuah tangan, serpihan emas, dan mulut yang setengah tersembunyi oleh bayangan.)",
    },
    {
      kind: "scene",
      charId: "black_partial",
      backdrop: "cairo-hospital-record",
      text: "I'm not erasing your grandmother's lullaby. I'm making sure her great-grandchild understands every word of it.",
      textKo: "나는 당신 할머니의 자장가를 지우는 게 아닙니다. 그분의 증손주가 그 모든 단어를 이해하게 만들고 있는 겁니다.",
      textEs: "No estoy borrando la nana de tu abuela. Estoy asegurándome de que su bisnieto entienda cada palabra.",
      textId: "Aku tidak menghapus nina bobo nenekmu. Aku memastikan cicitnya memahami setiap kata di dalamnya.",
    },
    {
      kind: "scene",
      charId: "black_partial",
      backdrop: "cairo-hospital-record",
      text: "Find the record before I do, Detective. Or let me make it useful.",
      textKo: "내가 찾기 전에 그 기록을 찾으세요, 탐정. 아니면 내가 그것을 쓸모 있게 만들게 두세요.",
      textEs: "Encuentra el registro antes que yo, Detective. O deja que yo lo haga útil.",
      textId: "Temukan catatan itu sebelum aku, Detektif. Atau biarkan aku membuatnya berguna.",
    },
    {
      kind: "scene",
      charId: "lingo",
      text: "We have what we need. Ellis wrote it down. Hassan remembered the song. Amira kept the archive alive. We just have to remember her.",
      textKo: "필요한 건 다 있어요. 엘리스가 적어 두었고, 하산이 노래를 기억했고, 아미라가 기록실을 살려 두었어요. 우리는 그녀를 기억하기만 하면 돼요.",
      textEs: "Tenemos lo que necesitamos. Ellis lo escribió. Hassan recordó la canción. Amira mantuvo vivo el archivo. Solo tenemos que recordarla.",
      textId: "Kita punya semua yang kita butuhkan. Ellis menuliskannya. Hassan mengingat lagunya. Amira menjaga arsip itu tetap hidup. Kita hanya perlu mengingatnya.",
    },
    {
      kind: "puzzle",
      puzzleNum: 4,
      title: { en: "Cairo Boss Spell", ko: "카이로 보스 주문", es: "Hechizo Jefe de El Cairo", id: "Mantra Bos Kairo" },
      context: {
        en: "Use Ellis's words to restore what was lost.",
        ko: "엘리스의 말로 잃어버린 것을 복원하세요.",
        es: "Usa las palabras de Ellis para restaurar lo perdido.",
        id: "Gunakan kata-kata Ellis untuk memulihkan apa yang hilang.",
      },
      pType: "boss-spell",
      tprsStage: 4,
      targetExpressions: ["I remember", "She wrote", "the lullaby", "Where is the record?"],
      previouslyLearned: ["record", "remember", "wrote", "lullaby", "It was beautiful"],
      speakAfter: true,
      storyReason: "Complete the Cairo Boss Spell to restore Ellis's archive record.",
      storyConsequence: "Each line restores one inscription on the wall. Ellis's journal becomes whole.",
      onFail: { addToWeakExpressions: ["I remember", "She wrote", "Where is the record?"], reviewInDailyCourse: true, reviewDays: 3 },
      questions: [
        {
          spellChunks: ["I remember", "She wrote", "the lullaby", "Where is the record?"],
          // Renders: "I remember. She wrote the lullaby. Where is the record?"
          //                ^period   ^space     ^period after lullaby (was missing — caused mismatch with hint h3)
          separators: [".", " ", ".", ""],
          wordPool: ["I remember", "She wrote", "the lullaby", "Where is the record?", "I forget", "She writes", "the song"],
          instruction: {
            en: "Use Ellis's words to restore what was lost.",
            ko: "엘리스의 말로 잃어버린 것을 복원하세요.",
            es: "Usa las palabras de Ellis para restaurar lo perdido.",
            id: "Gunakan kata-kata Ellis untuk memulihkan apa yang hilang.",
          },
          hints: {
            h1: {
              ko: "과거 시제로 말하세요. Ellis는 이미 적었어요.",
              en: "Use past tense. Ellis already wrote it.",
              es: "Usa el tiempo pasado. Ellis ya lo escribió.",
              id: "Gunakan bentuk lampau. Ellis sudah menuliskannya.",
            },
            h2: {
              ko: "She writes는 현재형, She wrote는 과거형이에요.",
              en: "She writes is present; She wrote is past.",
              es: "She writes es presente; She wrote es pasado.",
              id: "She writes itu bentuk kini; She wrote itu bentuk lampau.",
            },
            h3: {
              ko: "정답: I remember. She wrote the lullaby. Where is the record?",
              en: "Answer: I remember. She wrote the lullaby. Where is the record?",
              es: "Respuesta: I remember. She wrote the lullaby. Where is the record?",
              id: "Jawaban: I remember. She wrote the lullaby. Where is the record?",
            },
          },
          storyReason: {
            en: "The archive door is sealed. Ellis's words can open it.",
            ko: "기록실 문이 봉인되어 있어요. Ellis의 말이 열 수 있어요.",
            es: "La puerta del archivo está sellada. Las palabras de Ellis pueden abrirla.",
            id: "Pintu arsip itu tersegel. Kata-kata Ellis bisa membukanya.",
          },
          storyConsequence: {
            en: "Each line restores one inscription on the wall. Ellis's journal becomes whole.",
            ko: "각 줄이 벽의 비문 하나씩 복원해요. Ellis의 일지가 완전해져요.",
            es: "Cada línea restaura una inscripción. El diario de Ellis se completa.",
            id: "Tiap baris memulihkan satu prasasti di dinding. Jurnal Ellis menjadi utuh.",
          },
          doorImage: ch4BossArchiveImg,
        },
      ],
      hints: {
        h1: { ko: "기억으로 시작하세요: I remember.", en: "Start with memory: I remember.", es: "Empieza con la memoria: I remember.", id: "Mulailah dengan ingatan: I remember." },
        h2: { ko: "현재형 She writes가 아니라 과거형 She wrote예요.", en: "Use past tense She wrote, not present tense She writes.", es: "Usa el pasado She wrote, no el presente She writes.", id: "Gunakan bentuk lampau She wrote, bukan bentuk kini She writes." },
        h3: { ko: "정답 문장: I remember. She wrote the lullaby. Where is the record?", en: "Answer sentence: I remember. She wrote the lullaby. Where is the record?", es: "Frase correcta: I remember. She wrote the lullaby. Where is the record?", id: "Kalimat jawaban: I remember. She wrote the lullaby. Where is the record?" },
      },
    },
    {
      kind: "scene",
      charId: "lingo",
      isNarration: true,
      text: "(The spell climbs the archive wall. One inscription returns, then another. Golden lines fill the broken carvings. The papyrus on the altar exhales sand, then ink, then memory.)",
      textKo: "(주문이 기록실 벽을 타고 오른다. 비문 하나가 돌아오고, 또 하나가 돌아온다. 금빛 선들이 부서진 조각을 채운다. 제단 위 파피루스가 모래를 내쉬고, 잉크를 내쉬고, 마침내 기억을 되찾는다.)",
      textEs: "(El hechizo trepa por el muro del archivo. Vuelve una inscripción, luego otra. Líneas doradas llenan los grabados rotos. El papiro del altar exhala arena, luego tinta, luego memoria.)",
      textId: "(Mantra itu merayap di sepanjang dinding arsip. Satu prasasti kembali, lalu yang lain. Garis-garis emas mengisi ukiran yang rusak. Papirus di atas altar menghembuskan pasir, lalu tinta, lalu ingatan.)",
    },
    {
      kind: "scene",
      charId: "amira",
      text: "The fragment is here. Ellis knew this would happen. She left us a path, and she left proof that she walked it first.",
      textKo: "파편이 여기 있어요. 엘리스는 이런 일이 일어날 걸 알고 있었어요. 그녀는 우리에게 길을 남겼고, 자신이 먼저 걸었다는 증거도 남겼습니다.",
      textEs: "El fragmento está aquí. Ellis sabía que esto pasaría. Nos dejó un camino, y dejó prueba de que ella lo recorrió primero.",
      textId: "Pecahan itu di sini. Ellis tahu ini akan terjadi. Ia meninggalkan kita sebuah jalan, dan ia meninggalkan bukti bahwa ia menapakinya lebih dulu.",
    },
    {
      kind: "clue",
      symbol: "📜",
      titleEn: "Ellis's Journal: Cairo Page",
      titleKo: "엘리스의 일지: 카이로 페이지",
      titleEs: "Diario de Ellis: Página de El Cairo",
      titleId: "Jurnal Ellis: Halaman Kairo",
      descEn: "The restored page reads: 'I was here. I spoke. I mattered.' Beside the line is a lullaby copied in three uneven hands. The record does not solve Ellis's disappearance, but it proves she was leaving a trail.",
      descKo: "복원된 페이지에는 이렇게 적혀 있다. 'I was here. I spoke. I mattered.' 그 옆에는 세 가지 다른 손글씨로 베껴 쓴 자장가가 있다. 이 기록은 엘리스의 실종을 해결하지는 못하지만, 그녀가 길을 남기고 있었다는 증거가 된다.",
      descEs: "La página restaurada dice: 'I was here. I spoke. I mattered.' Al lado hay una nana copiada por tres manos distintas. El registro no resuelve la desaparición de Ellis, pero prueba que estaba dejando un camino.",
      descId: "Halaman yang dipulihkan itu berbunyi: 'I was here. I spoke. I mattered.' Di samping baris itu ada nina bobo yang disalin oleh tiga tulisan tangan berbeda. Catatan ini tidak memecahkan hilangnya Ellis, tapi membuktikan bahwa ia sedang meninggalkan jejak.",
    },
    {
      kind: "scene",
      charId: "black_partial",
      text: "You have not seen the most important three. Babel.",
      textKo: "당신은 아직 가장 중요한 세 개를 보지 못했습니다. Babel.",
      textEs: "Aún no has visto las tres más importantes. Babel.",
      textId: "Kamu belum melihat tiga yang paling penting. Babel.",
    },
    {
      kind: "scene",
      charId: "amira",
      text: "Take this. Ellis would want you to have it. Records are not meant to sleep in locked rooms.",
      textKo: "가져가세요. 엘리스라면 당신이 갖길 원했을 겁니다. 기록은 잠긴 방에서 잠들라고 있는 게 아니니까요.",
      textEs: "Toma esto. Ellis querría que lo tuvieras. Los registros no nacen para dormir en habitaciones cerradas.",
      textId: "Ambil ini. Ellis pasti ingin kamu memilikinya. Catatan tidak diciptakan untuk tertidur di ruangan terkunci.",
    },
    {
      kind: "scene",
      charId: "hassan",
      text: "My mother always said: words are the only things we leave behind that can still answer back. Goodbye, Detective. Remember us correctly.",
      textKo: "제 어머니는 늘 말씀하셨습니다. 우리가 남기는 것 중 다시 대답할 수 있는 건 말뿐이라고요. 안녕히 가세요, 탐정. 우리를 제대로 기억해 주세요.",
      textEs: "Mi madre siempre decía: las palabras son lo único que dejamos atrás que todavía puede responder. Goodbye, Detective. Recuérdanos correctamente.",
      textId: "Ibuku selalu berkata: kata-kata adalah satu-satunya yang kita tinggalkan yang masih bisa menjawab. Goodbye, Detektif. Ingatlah kami dengan benar.",
    },
    {
      kind: "scene",
      charId: "eleanor",
      expression: "urgent",
      text: "*from London* Babel. Ellis wrote that word in the margin of every Cairo note. Detective, if Black is inviting you there, it means he thinks the ending has already been written.",
      textKo: "*런던에서* Babel. 엘리스는 카이로 노트의 모든 여백에 그 단어를 적었어요. 탐정님, 블랙이 당신을 그곳으로 초대한다면, 그는 이미 결말이 쓰였다고 믿는 겁니다.",
      textEs: "*desde Londres* Babel. Ellis escribió esa palabra en el margen de cada nota de El Cairo. Detective, si Black te invita allí, significa que cree que el final ya está escrito.",
      textId: "*dari London* Babel. Ellis menulis kata itu di tepi setiap catatan Kairo. Detektif, jika Black mengundangmu ke sana, itu berarti ia mengira akhir ceritanya sudah ditulis.",
    },
    {
      kind: "clue",
      symbol: "⬛",
      titleEn: "Babel Invitation: The Final Three",
      titleKo: "바벨 초대장: 마지막 세 개",
      titleEs: "Invitación a Babel: Las Tres Finales",
      titleId: "Undangan Babel: Tiga yang Terakhir",
      descEn: "The Cairo archive restores a map edge marked only by one word: Babel. The four city fragments are not the whole lock. Three foundation stones are still hidden where Universal Code began.",
      descKo: "카이로 기록실은 단 하나의 단어, Babel만 표시된 지도 가장자리를 복원한다. 네 도시 파편은 자물쇠 전체가 아니다. Universal Code가 시작된 곳에 세 개의 foundation stone이 아직 숨겨져 있다.",
      descEs: "El archivo de El Cairo restaura el borde de un mapa marcado con una sola palabra: Babel. Los cuatro fragmentos de ciudad no son toda la cerradura. Tres piedras de fundación siguen ocultas donde nació el Código Universal.",
      descId: "Arsip Kairo memulihkan tepi sebuah peta yang hanya ditandai satu kata: Babel. Keempat pecahan kota itu bukanlah keseluruhan kunci. Tiga batu fondasi masih tersembunyi di tempat Universal Code bermula.",
    },
    {
      kind: "scene",
      charId: "lingo",
      text: "Whatever Babel is, we end it there. But not by erasing him. By remembering everyone he tried to flatten.",
      textKo: "Babel이 무엇이든, 거기서 끝내요. 하지만 그를 지워서가 아니에요. 그가 평평하게 만들려 했던 모든 사람을 기억해서요.",
      textEs: "Sea lo que sea Babel, lo terminamos allí. Pero no borrándolo a él. Recordando a todos los que intentó aplanar.",
      textId: "Apa pun Babel itu, kita akhiri di sana. Tapi bukan dengan menghapusnya. Dengan mengingat semua orang yang ia coba ratakan.",
    },
  ],
};

const BABEL_V21_STORY: Story = {
  id: "babel",
  title: "The Last Language",
  titleKo: "최후의 언어",
  titleEs: "El Último Idioma",
  titleId: "Bahasa Terakhir",
  gradient: ["#050510", "#0A0A2A", "#050510"],
  accentColor: "#9B7CFF",
  chapterMeta: {
    cefrLevel: "B1",
    targetLangRatio: 72,
    knownExpressions: [
      "I am here",
      "I see you",
      "We are together",
      "You translated",
      "the words",
      "You couldn't translate",
      "why she said them",
      "Mae'r iaith yn fyw",
    ],
    languageNote:
      "Babel compresses the final three foundation stones into connection, memory, and beginning, then turns the final counterargument into player production.",
  },
  characters: [
    { id: "lingo", emoji: "🦊", name: "Detective Rudy", nameKo: "탐정 루디", nameId: "Detektif Rudy", side: "left", avatarBg: C.gold, isLingo: true, portrait: rudyStoryImg, portraitVariants: rudyExpressionSprites },
    { id: "penny", emoji: "📚", name: "Miss Penny", nameKo: "미스 페니", nameId: "Miss Penny", side: "right", avatarBg: "#1A0A2A", portrait: ch5PennyPortraitImg, portraitVariants: pennyExpressionSprites },
    { id: "tom", emoji: "💂", name: "Tom", nameKo: "톰", nameId: "Tom", side: "left", avatarBg: "#1E2A3A", portrait: ch1TomPortraitImg },
    { id: "isabel", emoji: "💃", name: "Isabel", nameKo: "이사벨", nameId: "Isabel", side: "right", avatarBg: "#3A1A0A", portrait: ch2IsabelPortraitImg, portraitVariants: isabelExpressionSprites },
    { id: "sujin", emoji: "👩‍🔬", name: "Sujin", nameKo: "수진", nameId: "Sujin", side: "left", avatarBg: "#1A2A3A", portrait: ch3SujinPortraitImg },
    { id: "amira", emoji: "📜", name: "Professor Amira", nameKo: "아미라 교수", nameId: "Profesor Amira", side: "right", avatarBg: "#7A4D19", portrait: ch4AmiraPortraitImg },
    { id: "hassan", emoji: "🪕", name: "Hassan", nameKo: "하산", nameId: "Hassan", side: "right", avatarBg: "#2A1A0A", portrait: ch4HassanPortraitImg },
    { id: "mira", emoji: "☕", name: "Mira", nameKo: "미라", nameId: "Mira", side: "right", avatarBg: "#2F4A34", portrait: ch4MiraPortraitImg },
    { id: "mr_black", emoji: "🕴️", name: "Mr. Black", nameKo: "미스터 블랙", nameId: "Mr. Black", side: "right", avatarBg: "#050505", portrait: ch5BlackFaceImg, portraitVariants: mrBlackExpressionSprites },
  ],
  sequence: [
    {
      kind: "scene",
      charId: "lingo",
      isNarration: true,
      text: "(The four city stones answer at dawn. London fog, Madrid red, Seoul green, Cairo gold. Their light draws one coordinate across Rudy's desk: Babel. Not a ruin. A tower. The place where Universal Code began.)",
      textKo: "(새벽에 네 도시의 수호석이 응답한다. 런던의 안개, 마드리드의 붉은빛, 서울의 초록빛, 카이로의 금빛. 그 빛이 루디의 책상 위에 하나의 좌표를 그린다: Babel. 유적이 아니다. 탑이다. Universal Code가 시작된 곳.)",
      textEs: "(Al amanecer, las cuatro piedras de ciudad responden. La niebla de Londres, el rojo de Madrid, el verde de Seúl, el oro de El Cairo. Su luz dibuja una coordenada en el escritorio de Rudy: Babel. No es una ruina. Es una torre. El lugar donde empezó el Código Universal.)",
      textId: "(Saat fajar, keempat batu kota menjawab. Kabut London, merah Madrid, hijau Seoul, emas Kairo. Cahaya mereka menggambar satu koordinat di atas meja Rudy: Babel. Bukan reruntuhan. Sebuah menara. Tempat Universal Code bermula.)",
    },
    {
      kind: "scene",
      charId: "penny",
      backdrop: "babel-language-gates",
      text: "Five language gates protect the tower core. The four city stones open the path, but the last three stones are already inside: Connection, Memory, and Beginning. He built Babel around them.",
      textKo: "탑 중심부는 다섯 개의 언어 관문이 지키고 있어요. 네 도시의 수호석은 길을 열지만, 마지막 세 개의 돌은 이미 안에 있어요: Connection, Memory, Beginning. 그는 그 돌들을 중심으로 Babel을 지었어요.",
      textKoMix: "탑 중심부는 five language gates가 지키고 있어요. 네 city stones는 길을 열지만, 마지막 세 개는 이미 안에 있어요: Connection, Memory, Beginning.",
      textEs: "Cinco puertas de idioma protegen el núcleo de la torre. Las cuatro piedras de ciudad abren el camino, pero las últimas tres ya están dentro: Connection, Memory y Beginning. Construyó Babel alrededor de ellas.",
      textEsMix: "Cinco language gates protegen el núcleo. Las cuatro city stones abren el camino, pero las últimas tres ya están dentro: Connection, Memory y Beginning.",
      textId: "Lima gerbang bahasa melindungi inti menara. Keempat batu kota membuka jalannya, tapi tiga batu terakhir sudah ada di dalam: Connection, Memory, dan Beginning. Ia membangun Babel di sekeliling mereka.",
      textIdMix: "Inti menara dijaga oleh five language gates. Keempat city stones membuka jalannya, tapi tiga terakhir sudah ada di dalam: Connection, Memory, dan Beginning.",
    },
    {
      kind: "scene",
      charId: "lingo",
      backdrop: "babel-language-gates",
      text: "Then we do not go in as one language. We go in as everyone who helped us.",
      textKo: "그럼 하나의 언어로 들어가지 않아요. 우리를 도와준 모두의 언어로 들어가는 거예요.",
      textEs: "Entonces no entramos como un solo idioma. Entramos como todas las personas que nos ayudaron.",
      textId: "Kalau begitu, kita tidak masuk sebagai satu bahasa. Kita masuk sebagai semua orang yang telah menolong kita.",
    },
    {
      kind: "puzzle",
      puzzleNum: 1,
      title: { en: "Open the Connection Gate", ko: "연결의 관문 열기", es: "Abrir la puerta de conexión", id: "Buka Gerbang Koneksi" },
      context: {
        en: "The first Babel gate listens for words from every city.",
        ko: "첫 번째 Babel 관문은 모든 도시에서 온 말을 듣습니다.",
        es: "La primera puerta de Babel escucha palabras de cada ciudad.",
        id: "Gerbang Babel pertama mendengarkan kata-kata dari setiap kota.",
      },
      pType: "word-match",
      tprsStage: 1,
      targetExpressions: ["Hello", "Gracias", "안녕하세요", "Salaam"],
      previouslyLearned: ["Hello", "Thank you", "안녕하세요", "I remember"],
      speakAfter: true,
      storyReason: "Use greetings from the journey to prove Babel cannot be opened by one language alone.",
      storyConsequence: "The first foundation stone wakes: Connection.",
      onFail: { addToWeakExpressions: ["Hello", "Thank you", "안녕하세요"], reviewInDailyCourse: true, reviewDays: 3 },
      questions: [
        {
          word: { en: "Hello", ko: "Hello", es: "Hello", id: "Hello" },
          meaning: { en: "a greeting that starts a connection", ko: "연결을 시작하는 인사", es: "un saludo que inicia una conexión", id: "sapaan yang memulai sebuah koneksi" },
          wrong: [
            { en: "a machine command", ko: "기계 명령", es: "un comando de máquina", id: "perintah mesin" },
            { en: "a final goodbye", ko: "마지막 작별", es: "una despedida final", id: "perpisahan terakhir" },
            { en: "a hidden coordinate", ko: "숨겨진 좌표", es: "una coordenada oculta", id: "koordinat tersembunyi" },
          ],
        },
        {
          word: { en: "Gracias", ko: "Gracias", es: "Gracias", id: "Gracias" },
          meaning: { en: "Spanish for thank you", ko: "스페인어 감사 표현", es: "gracias en español", id: "terima kasih dalam bahasa Spanyol" },
          wrong: [
            { en: "Korean for palace", ko: "궁궐을 뜻하는 한국어", es: "coreano para palacio", id: "bahasa Korea untuk istana" },
            { en: "Welsh for water", ko: "물을 뜻하는 웨일스어", es: "galés para agua", id: "bahasa Wales untuk air" },
            { en: "Arabic for record", ko: "기록을 뜻하는 아랍어", es: "árabe para registro", id: "bahasa Arab untuk catatan" },
          ],
        },
        {
          word: { en: "안녕하세요", ko: "안녕하세요", es: "안녕하세요", id: "안녕하세요" },
          meaning: { en: "polite Korean greeting", ko: "정중한 한국어 인사", es: "saludo formal en coreano", id: "sapaan Korea yang sopan" },
          wrong: [
            { en: "casual command", ko: "반말 명령", es: "mandato informal", id: "perintah santai" },
            { en: "a color word", ko: "색깔 단어", es: "una palabra de color", id: "kata warna" },
            { en: "a place name", ko: "장소 이름", es: "un nombre de lugar", id: "nama tempat" },
          ],
        },
        {
          word: { en: "Salaam", ko: "Salaam", es: "Salaam", id: "Salaam" },
          meaning: { en: "a greeting of peace", ko: "평화를 담은 인사", es: "un saludo de paz", id: "sapaan yang membawa kedamaian" },
          wrong: [
            { en: "a stone pedestal", ko: "돌 받침대", es: "un pedestal de piedra", id: "alas batu" },
            { en: "a erased page", ko: "지워진 페이지", es: "una página borrada", id: "halaman yang terhapus" },
            { en: "a tower floor", ko: "탑의 층", es: "un piso de la torre", id: "lantai menara" },
          ],
        },
      ],
      hints: {
        h1: { ko: "각 도시는 자기 방식으로 인사를 남겼어요.", en: "Each city left a greeting in its own way.", es: "Cada ciudad dejó un saludo a su manera.", id: "Setiap kota meninggalkan sapaan dengan caranya sendiri." },
        h2: { ko: "Connection은 같은 말이 아니라 서로 다른 말이 만나는 순간이에요.", en: "Connection is not one word. It is different words meeting.", es: "La conexión no es una palabra única. Es cuando se encuentran palabras distintas.", id: "Connection bukan satu kata. Ia adalah saat kata-kata yang berbeda bertemu." },
        h3: { ko: "Hello / Gracias / 안녕하세요 / Salaam", en: "Hello / Gracias / 안녕하세요 / Salaam", es: "Hello / Gracias / 안녕하세요 / Salaam", id: "Hello / Gracias / 안녕하세요 / Salaam" },
      },
    },
    {
      kind: "clue",
      symbol: "🔗",
      titleEn: "Babel Foundation Stone #1: CONNECTION",
      titleKo: "바벨 기초석 #1: CONNECTION",
      titleEs: "Piedra de Fundación #1: CONNECTION",
      titleId: "Batu Fondasi Babel #1: CONNECTION",
      descEn: "The first stone wakes when four greetings overlap. It does not translate them into one word. It lets them remain different and still answer together.",
      descKo: "네 개의 인사가 겹치자 첫 번째 돌이 깨어난다. 그 돌은 말을 하나로 번역하지 않는다. 서로 다르게 남아 있어도 함께 대답하게 한다.",
      descEs: "La primera piedra despierta cuando cuatro saludos se superponen. No los traduce a una sola palabra. Les permite seguir siendo distintos y responder juntos.",
      descId: "Batu pertama terbangun ketika empat sapaan saling bertumpang tindih. Ia tidak menerjemahkannya menjadi satu kata. Ia membiarkan mereka tetap berbeda namun tetap menjawab bersama.",
    },
    {
      kind: "scene",
      charId: "tom",
      backdrop: "babel-language-gates",
      text: "Blimey. That thing opened because we all sounded different.",
      textKo: "세상에. 우리가 전부 다르게 들렸기 때문에 저게 열린 거네.",
      textEs: "Caray. Esa cosa se abrió porque todos sonábamos distinto.",
      textId: "Astaga. Benda itu terbuka justru karena suara kita semua berbeda.",
    },
    {
      kind: "scene",
      charId: "isabel",
      backdrop: "babel-language-gates",
      expression: "rallying",
      text: "Good. A festival with one voice is not a festival.",
      textKo: "좋아. 목소리가 하나뿐인 축제는 축제가 아니니까.",
      textEs: "Bien. Un festival con una sola voz no es un festival.",
      textId: "Bagus. Festival dengan satu suara saja bukanlah festival.",
    },
    {
      kind: "puzzle",
      puzzleNum: 2,
      title: { en: "Hold the Allies Together", ko: "동료들을 붙잡기", es: "Mantener unidos a los aliados", id: "Pertahankan Para Sekutu" },
      context: {
        en: "The second gate attacks doubt. Choose the reply that keeps each ally present.",
        ko: "두 번째 관문은 의심을 공격합니다. 각 동료가 여기 남아 있게 하는 대답을 고르세요.",
        es: "La segunda puerta ataca la duda. Elige la respuesta que mantiene presente a cada aliado.",
        id: "Gerbang kedua menyerang keraguan. Pilih jawaban yang menjaga setiap sekutu tetap hadir.",
      },
      pType: "dialogue-choice",
      tprsStage: 2,
      targetExpressions: ["I am here", "I see you", "We are together"],
      previouslyLearned: ["Hello", "Thank you", "I remember", "It was beautiful"],
      speakAfter: true,
      storyReason: "Babel tries to isolate each speaker. Use connection phrases to keep the group whole.",
      storyConsequence: "The allies reach the Memory Gate together.",
      onFail: { addToWeakExpressions: ["I am here", "I see you", "We are together"], reviewInDailyCourse: true, reviewDays: 3 },
      questions: [
        {
          prompt: { en: "Sujin says the Korean order feels fragile.", ko: "수진이 한국어 어순이 흔들리는 것 같다고 말합니다.", es: "Sujin dice que el orden coreano se siente frágil.", id: "Sujin berkata urutan kata bahasa Korea terasa rapuh." },
          context: { en: "Answer with presence.", ko: "함께 있다는 말로 답하세요.", es: "Responde con presencia.", id: "Jawablah dengan kehadiran." },
          answer: { en: "I am here.", ko: "I am here.", es: "I am here.", id: "I am here." },
          wrong: [
            { en: "I forget.", ko: "I forget.", es: "I forget.", id: "I forget." },
            { en: "How much?", ko: "How much?", es: "How much?", id: "How much?" },
          ],
        },
        {
          prompt: { en: "Mira's recovered voice trembles for the first time.", ko: "Mira의 회복된 목소리가 처음으로 떨립니다.", es: "La voz recuperada de Mira tiembla por primera vez.", id: "Suara Mira yang pulih bergetar untuk pertama kalinya." },
          context: { en: "Tell her she is not a script.", ko: "그녀가 대본이 아니라고 말해 주세요.", es: "Dile que no es un guion.", id: "Katakan padanya bahwa ia bukan sebuah naskah." },
          answer: { en: "I see you.", ko: "I see you.", es: "I see you.", id: "I see you." },
          wrong: [
            { en: "You are perfect.", ko: "You are perfect.", es: "You are perfect.", id: "You are perfect." },
            { en: "Read faster.", ko: "Read faster.", es: "Read faster.", id: "Read faster." },
          ],
        },
        {
          prompt: { en: "The gate divides the group into separate echoes.", ko: "관문이 동료들을 따로따로 울리는 메아리로 나눕니다.", es: "La puerta divide al grupo en ecos separados.", id: "Gerbang itu memecah kelompok menjadi gema-gema yang terpisah." },
          context: { en: "Use the plural truth.", ko: "함께라는 진실을 말하세요.", es: "Usa la verdad plural.", id: "Gunakan kebenaran jamak." },
          answer: { en: "We are together.", ko: "We are together.", es: "We are together.", id: "We are together." },
          wrong: [
            { en: "I am alone.", ko: "I am alone.", es: "I am alone.", id: "I am alone." },
            { en: "The words are enough.", ko: "The words are enough.", es: "The words are enough.", id: "The words are enough." },
          ],
        },
      ],
      hints: {
        h1: { ko: "Babel은 사람들을 혼자라고 느끼게 해요.", en: "Babel tries to make people feel alone.", es: "Babel intenta hacer que la gente se sienta sola.", id: "Babel berusaha membuat orang merasa sendirian." },
        h2: { ko: "I / you / we 순서로 넓어져요.", en: "The answers widen: I / you / we.", es: "Las respuestas se amplían: I / you / we.", id: "Jawabannya meluas: I / you / we." },
        h3: { ko: "I am here / I see you / We are together", en: "I am here / I see you / We are together", es: "I am here / I see you / We are together", id: "I am here / I see you / We are together" },
      },
    },
    {
      kind: "scene",
      charId: "mr_black",
      backdrop: "babel-language-gates",
      expression: "tired",
      text: "Tell me, Detective. When you could not speak the language, did anyone ever look at you like you mattered?",
      textKo: "말해 보세요, 탐정. 당신이 그 언어를 말하지 못했을 때, 누군가 당신을 중요한 사람처럼 바라봐 준 적이 있습니까?",
      textEs: "Dime, Detective. Cuando no podías hablar el idioma, ¿alguien te miró alguna vez como si importaras?",
      textId: "Katakan padaku, Detektif. Saat kamu tidak bisa berbicara dalam bahasa itu, apakah pernah ada yang memandangmu seakan kamu berarti?",
    },
    {
      kind: "scene",
      charId: "lingo",
      isNarration: true,
      backdrop: "babel-language-gates",
      text: "(For the first time, he steps fully into the light. Not a monster. Not a shadow. An old man carrying a stone in one hand and a wound in the other.)",
      textKo: "(처음으로 그가 빛 속으로 완전히 걸어 나온다. 괴물이 아니다. 그림자도 아니다. 한 손에는 돌을, 다른 한 손에는 상처를 들고 있는 늙은 남자.)",
      textEs: "(Por primera vez, entra por completo en la luz. No es un monstruo. No es una sombra. Un hombre viejo que lleva una piedra en una mano y una herida en la otra.)",
      textId: "(Untuk pertama kalinya, ia melangkah sepenuhnya ke dalam cahaya. Bukan monster. Bukan bayangan. Seorang lelaki tua yang membawa sebuah batu di satu tangan dan sebuah luka di tangan lainnya.)",
    },
    {
      kind: "scene",
      charId: "penny",
      backdrop: "babel-language-gates",
      expression: "anxious",
      text: "I was your student. I believed one shared language would save people from humiliation, from panic, from grief. But I watched what it did to Mira. It gave her every word and took away the reason to say them.",
      textKo: "저는 당신의 학생이었어요. 하나의 공유 언어가 사람들을 모욕과 공포와 슬픔에서 구할 거라고 믿었어요. 하지만 Mira에게 무슨 일이 일어났는지 봤어요. 모든 단어를 주고, 그 단어를 말해야 하는 이유를 빼앗았죠.",
      textKoMix: "저는 당신의 student였어요. 하나의 shared language가 사람들을 구할 거라고 믿었어요. 하지만 Mira를 봤어요. 모든 words를 주고, 그 말을 해야 하는 reason을 빼앗았죠.",
      textEs: "Fui tu estudiante. Creí que un idioma compartido salvaría a la gente de la humillación, del pánico, del dolor. Pero vi lo que le hizo a Mira. Le dio todas las palabras y le quitó la razón para decirlas.",
      textEsMix: "Fui tu student. Creí que un shared language salvaría a la gente. Pero vi a Mira. Le dio todas las words y le quitó la razón para decirlas.",
      textId: "Aku dulu muridmu. Aku percaya satu bahasa bersama akan menyelamatkan orang dari rasa malu, dari panik, dari duka. Tapi aku melihat apa yang terjadi pada Mira. Bahasa itu memberinya setiap kata dan merampas alasan untuk mengucapkannya.",
      textIdMix: "Aku dulu student-mu. Aku percaya satu shared language akan menyelamatkan orang. Tapi aku melihat Mira. Bahasa itu memberinya semua words dan merampas reason untuk mengucapkannya.",
    },
    {
      kind: "scene",
      charId: "lingo",
      backdrop: "babel-language-gates",
      text: "Ellis wrote about you. Not your name, not all of it. A translator who lost everything and tried to build a world where no one would ever be unheard again.",
      textKo: "Ellis가 당신에 대해 적었어요. 이름은 아니고, 전부도 아니지만. 모든 것을 잃고, 다시는 아무도 들리지 못한 채 남지 않는 세상을 만들려 했던 통역사에 대해.",
      textEs: "Ellis escribió sobre ti. No tu nombre, no todo. Un traductor que lo perdió todo e intentó construir un mundo donde nadie volviera a quedar sin ser escuchado.",
      textId: "Ellis menulis tentangmu. Bukan namamu, tidak seluruhnya. Seorang penerjemah yang kehilangan segalanya dan berusaha membangun dunia tempat tak seorang pun akan tak terdengar lagi.",
    },
    {
      kind: "puzzle",
      puzzleNum: 3,
      title: { en: "Find the Memory Stone", ko: "기억의 돌 찾기", es: "Encontrar la piedra de memoria", id: "Temukan Batu Memori" },
      context: {
        en: "Three memories echo in the chamber. Only one turns grief into truth instead of control.",
        ko: "방 안에 세 개의 기억이 울립니다. 슬픔을 통제가 아니라 진실로 바꾸는 기억은 하나뿐입니다.",
        es: "Tres recuerdos resuenan en la cámara. Solo uno convierte el dolor en verdad, no en control.",
        id: "Tiga kenangan bergema di ruangan itu. Hanya satu yang mengubah duka menjadi kebenaran, bukan kendali.",
      },
      pType: "investigation",
      tprsStage: 3,
      targetExpressions: ["I remember", "She wrote", "Mae'r iaith yn fyw"],
      previouslyLearned: ["I remember", "She wrote", "the lullaby", "I see you"],
      speakAfter: true,
      storyReason: "Find the memory that can wake Babel's second foundation stone.",
      storyConsequence: "The second foundation stone wakes: Memory.",
      onFail: { addToWeakExpressions: ["I remember", "She wrote"], reviewInDailyCourse: true, reviewDays: 3 },
      questions: [
        {
          prompt: { en: "Which memory should Rudy hold up to Mr. Black?", ko: "루디가 Mr. Black에게 어떤 기억을 내밀어야 할까요?", es: "¿Qué recuerdo debe mostrar Rudy a Mr. Black?", id: "Kenangan mana yang harus Rudy tunjukkan kepada Mr. Black?" },
          clues: [
            { en: "A perfect Universal Code transcript with every sentence corrected.", ko: "모든 문장이 수정된 완벽한 Universal Code 기록.", es: "Una transcripción perfecta del Código Universal con cada frase corregida.", id: "Transkrip Universal Code yang sempurna dengan setiap kalimat dikoreksi." },
            { en: "Ellis's torn journal page: 'I was here. I spoke. I mattered.' Beside it, a Welsh lullaby copied by hand.", ko: "Ellis의 찢어진 일지 페이지: 'I was here. I spoke. I mattered.' 그 옆에는 손으로 베껴 쓴 웨일스 자장가.", es: "La página rota de Ellis: 'I was here. I spoke. I mattered.' Al lado, una nana galesa copiada a mano.", id: "Halaman jurnal Ellis yang robek: 'I was here. I spoke. I mattered.' Di sampingnya, sebuah lagu nina bobo Wales yang disalin dengan tangan." },
            { en: "A tower blueprint that marks every gate as efficient.", ko: "모든 관문을 효율적이라고 표시한 탑 설계도.", es: "Un plano de la torre que marca cada puerta como eficiente.", id: "Cetak biru menara yang menandai setiap gerbang sebagai efisien." },
          ],
          answerIdx: 1,
        },
      ],
      hints: {
        h1: { ko: "Memory는 완벽한 문장이 아니라 사람의 흔적에 반응해요.", en: "Memory responds to human traces, not perfect sentences.", es: "Memory responde a huellas humanas, no a frases perfectas.", id: "Memory menanggapi jejak manusia, bukan kalimat yang sempurna." },
        h2: { ko: "Ch4에서 회수한 Ellis 일지를 떠올려요.", en: "Remember Ellis's journal from Ch4.", es: "Recuerda el diario de Ellis de Ch4.", id: "Ingat jurnal Ellis dari Bab 4." },
        h3: { ko: "정답은 Ellis의 찢어진 일지 페이지예요.", en: "The answer is Ellis's torn journal page.", es: "La respuesta es la página rota del diario de Ellis.", id: "Jawabannya adalah halaman jurnal Ellis yang robek." },
      },
    },
    {
      kind: "clue",
      symbol: "🕯️",
      titleEn: "Babel Foundation Stone #2: MEMORY",
      titleKo: "바벨 기초석 #2: MEMORY",
      titleEs: "Piedra de Fundación #2: MEMORY",
      titleId: "Batu Fondasi Babel #2: MEMORY",
      descEn: "The second stone wakes when Ellis's journal is read aloud. It does not preserve perfect language. It preserves the proof that someone spoke.",
      descKo: "Ellis의 일지가 소리 내어 읽히자 두 번째 돌이 깨어난다. 이 돌은 완벽한 언어를 보존하지 않는다. 누군가 말했었다는 증거를 보존한다.",
      descEs: "La segunda piedra despierta cuando se lee el diario de Ellis en voz alta. No conserva el idioma perfecto. Conserva la prueba de que alguien habló.",
      descId: "Batu kedua terbangun ketika jurnal Ellis dibacakan dengan lantang. Ia tidak menyimpan bahasa yang sempurna. Ia menyimpan bukti bahwa seseorang pernah berbicara.",
    },
    {
      kind: "scene",
      charId: "mr_black",
      backdrop: "babel-language-gates",
      expression: "remorse",
      text: "My mother sang one line when the pain became too much. The nurse smiled and said she did not understand. The doctor smiled and said it in three languages. None of them were hers.",
      textKo: "어머니는 고통이 너무 심해질 때 한 줄의 노래를 불렀습니다. 간호사는 웃으며 이해하지 못한다고 했죠. 의사는 세 가지 언어로 미안하다고 했습니다. 그중 어느 것도 어머니의 언어가 아니었어요.",
      textEs: "Mi madre cantaba una línea cuando el dolor era demasiado. La enfermera sonrió y dijo que no entendía. El médico sonrió y lo dijo en tres idiomas. Ninguno era el suyo.",
      textId: "Ibuku menyanyikan satu baris saat rasa sakitnya menjadi terlalu berat. Perawat tersenyum dan berkata ia tidak mengerti. Dokter tersenyum dan mengatakannya dalam tiga bahasa. Tak satu pun bahasa ibuku.",
    },
    {
      kind: "scene",
      charId: "hassan",
      backdrop: "babel-language-gates",
      text: "A lullaby is not information. It is a hand on a forehead.",
      textKo: "자장가는 정보가 아닙니다. 이마 위에 얹힌 손이에요.",
      textEs: "Una nana no es información. Es una mano sobre la frente.",
      textId: "Lagu nina bobo bukanlah informasi. Ia adalah tangan di dahi.",
    },
    {
      kind: "clue",
      symbol: "🌱",
      titleEn: "Babel Foundation Stone #3: BEGINNING",
      titleKo: "바벨 기초석 #3: BEGINNING",
      titleEs: "Piedra de Fundación #3: BEGINNING",
      titleId: "Batu Fondasi Babel #3: BEGINNING",
      descEn: "The third stone appears when the room stops arguing about which language should win. It is the beginning of speech: a reason to say something to someone.",
      descKo: "어떤 언어가 이겨야 하는지에 대한 싸움이 멈추자 세 번째 돌이 나타난다. 이 돌은 말의 시작이다. 누군가에게 무언가를 말해야 하는 이유.",
      descEs: "La tercera piedra aparece cuando la sala deja de discutir qué idioma debe ganar. Es el comienzo del habla: una razón para decir algo a alguien.",
      descId: "Batu ketiga muncul ketika ruangan itu berhenti memperdebatkan bahasa mana yang harus menang. Ia adalah awal dari ucapan: sebuah alasan untuk mengatakan sesuatu kepada seseorang.",
    },
    {
      kind: "scene",
      charId: "lingo",
      backdrop: "babel-language-gates",
      expression: "worried",
      text: "Partner. The final spell is not a translation. It is the thing translation missed.",
      textKo: "파트너. 마지막 주문은 번역이 아니에요. 번역이 놓친 바로 그거예요.",
      textEs: "Compa. El hechizo final no es una traducción. Es aquello que la traducción no alcanzó.",
      textId: "Partner. Mantra terakhir bukanlah sebuah terjemahan. Ia adalah hal yang terlewat oleh terjemahan.",
    },
    {
      kind: "puzzle",
      puzzleNum: 4,
      title: { en: "Final Boss Spell", ko: "최종 보스 주문", es: "Hechizo Jefe Final", id: "Mantra Bos Terakhir" },
      context: {
        en: "Speak the difference between words and why they were spoken.",
        ko: "단어와, 그 단어를 말한 이유의 차이를 말하세요.",
        es: "Di la diferencia entre las palabras y la razón por la que fueron dichas.",
        id: "Ucapkan perbedaan antara kata-kata dan alasan mengapa kata-kata itu diucapkan.",
      },
      pType: "boss-spell",
      tprsStage: 4,
      targetExpressions: ["You translated", "the words", "You couldn't translate", "why she said them"],
      previouslyLearned: ["I remember", "She wrote", "the lullaby", "I see you", "We are together"],
      speakAfter: true,
      storyReason: "Use the final counterspell to stop Universal Code without erasing Mr. Black.",
      storyConsequence: "The seven stones release. Universal Code shuts down.",
      onFail: { addToWeakExpressions: ["You translated", "You couldn't translate"], reviewInDailyCourse: true, reviewDays: 3 },
      questions: [
        {
          spellChunks: ["You translated", "the words", "You couldn't translate", "why she said them"],
          separators: ["", ".", "", "."],
          wordPool: [
            "You translated",
            "the words",
            "You couldn't translate",
            "why she said them",
            "You stopped",
            "the meanings",
            "You translated her",
          ],
          instruction: {
            en: "Speak what Universal Code could never carry.",
            ko: "Universal Code가 결코 담을 수 없었던 것을 말하세요.",
            es: "Di lo que el Código Universal nunca pudo llevar.",
            id: "Ucapkan apa yang tak pernah bisa dibawa oleh Universal Code.",
          },
          hints: {
            h1: {
              ko: "words와 why를 구분하세요.",
              en: "Separate the words from the why.",
              es: "Separa las palabras del porqué.",
              id: "Pisahkan kata-katanya dari alasannya.",
            },
            h2: {
              ko: "translated는 표면, couldn't translate는 마음이에요.",
              en: "translated is the surface; couldn't translate is the heart.",
              es: "translated es la superficie; couldn't translate es el corazón.",
              id: "translated adalah permukaannya; couldn't translate adalah hatinya.",
            },
            h3: {
              ko: "정답: You translated the words. You couldn't translate why she said them.",
              en: "Answer: You translated the words. You couldn't translate why she said them.",
              es: "Respuesta: You translated the words. You couldn't translate why she said them.",
              id: "Jawaban: You translated the words. You couldn't translate why she said them.",
            },
          },
          storyReason: {
            en: "The Babel core is sealed by perfect translation. Only meaning can open it.",
            ko: "Babel 중심부는 완벽한 번역으로 봉인되어 있어요. 의미만이 열 수 있어요.",
            es: "El núcleo de Babel está sellado por la traducción perfecta. Solo el significado puede abrirlo.",
            id: "Inti Babel disegel oleh terjemahan yang sempurna. Hanya makna yang bisa membukanya.",
          },
          storyConsequence: {
            en: "Each line releases one layer of the Universal Code. The final seven-stone circuit breaks.",
            ko: "각 문장이 Universal Code의 한 겹을 풀어냅니다. 마지막 7개 돌의 회로가 끊어져요.",
            es: "Cada línea libera una capa del Código Universal. El circuito final de siete piedras se rompe.",
            id: "Setiap baris melepaskan satu lapisan Universal Code. Rangkaian tujuh batu yang terakhir pun putus.",
          },
          doorImage: ch5BossCoreImg,
        },
      ],
      hints: {
        h1: { ko: "단어 자체가 아니라 그 말을 한 이유를 말해야 해요.", en: "You need the reason she spoke, not only the words.", es: "Necesitas la razón por la que habló, no solo las palabras.", id: "Kamu butuh alasan ia berbicara, bukan hanya kata-katanya." },
        h2: { ko: "You translated the words 다음에 You couldn't translate why...", en: "First: You translated the words. Then: You couldn't translate why...", es: "Primero: You translated the words. Luego: You couldn't translate why...", id: "Pertama: You translated the words. Lalu: You couldn't translate why..." },
        h3: { ko: "정답 문장: You translated the words. You couldn't translate why she said them.", en: "Answer sentence: You translated the words. You couldn't translate why she said them.", es: "Frase correcta: You translated the words. You couldn't translate why she said them.", id: "Kalimat jawaban: You translated the words. You couldn't translate why she said them." },
      },
    },
    {
      kind: "scene",
      charId: "mr_black",
      backdrop: "babel-language-gates",
      expression: "remorse",
      text: "*a very long silence* Mae'r iaith yn fyw. *Welsh: The language lives.* I never wanted to destroy language. I wanted... I just wanted my mother to be heard.",
      textKo: "*아주 긴 침묵* Mae'r iaith yn fyw. *웨일스어: 언어는 살아 있다.* 언어를 파괴하고 싶었던 게 아니야. 원한 건... 어머니의 말이 들려지기를 원했을 뿐이야.",
      textEs: "*un silencio muy largo* Mae'r iaith yn fyw. *Galés: El idioma vive.* Nunca quise destruir el idioma. Quería... solo quería que escucharan a mi madre.",
      textId: "*keheningan yang sangat panjang* Mae'r iaith yn fyw. *Bahasa Wales: Bahasa itu hidup.* Aku tak pernah ingin menghancurkan bahasa. Aku ingin... aku hanya ingin ibuku didengar.",
    },
    {
      kind: "scene",
      charId: "lingo",
      isNarration: true,
      backdrop: "babel-language-gates",
      text: "(The Universal Code shuts down. One by one, the seven Guardian Stones release from their pedestals. Voices return from everywhere at once: Tom on the radio, Isabel from Madrid, Sujin from Seoul, Youngsook from Gwangjang Market, Amira in Arabic, Hassan in four languages, and Mira's voice, no longer smooth, trembling as she says thank you.)",
      textKo: "(Universal Code가 종료된다. 하나씩, 7개의 수호석이 받침대에서 풀려난다. 사방에서 목소리가 돌아온다. 무선에서 톰, 마드리드에서 이사벨, 서울에서 수진, 광장시장에서 영숙 할머니, 아랍어로 말하는 아미라, 네 언어로 말하는 하산, 그리고 Mira의 목소리. 더 이상 매끈하지 않고, 떨리는 목소리로 thank you를 말한다.)",
      textEs: "(El Código Universal se apaga. Una por una, las siete Piedras Guardianas se liberan de sus pedestales. Las voces vuelven desde todas partes: Tom en la radio, Isabel desde Madrid, Sujin desde Seúl, Youngsook desde el mercado Gwangjang, Amira en árabe, Hassan en cuatro idiomas, y la voz de Mira, ya no pulida, temblando mientras dice thank you.)",
      textId: "(Universal Code mati. Satu per satu, ketujuh Batu Penjaga terlepas dari tumpuannya. Suara-suara kembali dari segala arah sekaligus: Tom di radio, Isabel dari Madrid, Sujin dari Seoul, Youngsook dari Pasar Gwangjang, Amira dalam bahasa Arab, Hassan dalam empat bahasa, dan suara Mira, tak lagi mulus, bergetar saat ia mengucapkan thank you.)",
    },
    {
      kind: "scene",
      charId: "mira",
      backdrop: "babel-language-gates",
      text: "Th-thank you. I mean it this time. I can feel it shake.",
      textKo: "Th-thank you. 이번엔 진심이에요. 떨리는 게 느껴져요.",
      textEs: "Th-thank you. Esta vez lo digo de verdad. Puedo sentir cómo tiembla.",
      textId: "T-terima kasih. Kali ini aku sungguh-sungguh. Aku bisa merasakannya bergetar.",
    },
    {
      kind: "scene",
      charId: "lingo",
      backdrop: "babel-language-gates",
      text: "Mr. Black. I remember now. I was part of you. The part that loved every language before grief taught you to fear them.",
      textKo: "Mr. Black. 이제 기억나요. 나는 당신의 일부였어요. 슬픔이 언어를 두려워하게 만들기 전, 모든 언어를 사랑하던 부분.",
      textEs: "Mr. Black. Ahora lo recuerdo. Yo era parte de ti. La parte que amaba cada idioma antes de que el dolor te enseñara a temerlos.",
      textId: "Mr. Black. Sekarang aku ingat. Aku adalah bagian dari dirimu. Bagian yang mencintai setiap bahasa sebelum duka mengajarimu untuk menakutinya.",
    },
    {
      kind: "scene",
      charId: "lingo",
      isNarration: true,
      backdrop: "babel-language-gates",
      text: "(For one breath, Rudy's detective coat flickers into golden particles. The hat, the glasses, the bow tie, all become light. The tiny fox spirit from the first night looks back at the old man. Then the coat returns. Rudy is still Rudy. But now he knows why.)",
      textKo: "(한 번의 숨 동안, 루디의 탐정 코트가 금빛 입자로 깜빡인다. 모자, 안경, 나비넥타이, 전부 빛이 된다. 첫날 밤의 작은 여우 정령이 늙은 남자를 바라본다. 그리고 코트가 돌아온다. 루디는 여전히 루디다. 하지만 이제 이유를 안다.)",
      textEs: "(Durante un respiro, el abrigo de detective de Rudy se vuelve partículas doradas. El sombrero, las gafas, la pajarita, todo se vuelve luz. El pequeño espíritu zorro de la primera noche mira al viejo. Luego vuelve el abrigo. Rudy sigue siendo Rudy. Pero ahora sabe por qué.)",
      textId: "(Selama satu tarikan napas, mantel detektif Rudy berkelip menjadi partikel emas. Topi, kacamata, dasi kupu-kupu, semua menjadi cahaya. Roh rubah mungil dari malam pertama itu menatap balik si lelaki tua. Lalu mantel itu kembali. Rudy tetap Rudy. Tapi kini ia tahu alasannya.)",
    },
    {
      kind: "scene",
      charId: "lingo",
      backdrop: "babel-language-gates",
      text: "I was part of you. I am no longer you. I am the part you saved by failing to erase it.",
      textKo: "나는 당신의 일부였어요. 하지만 이제 당신은 아니에요. 지우지 못했기 때문에 당신이 살려낸 부분이에요.",
      textEs: "Fui parte de ti. Ya no soy tú. Soy la parte que salvaste al no poder borrarla.",
      textId: "Aku dulu bagian dari dirimu. Aku bukan lagi dirimu. Aku adalah bagian yang kau selamatkan karena gagal menghapusnya.",
    },
    {
      kind: "scene",
      charId: "penny",
      backdrop: "babel-language-gates",
      expression: "brave",
      text: "The stones are returning to their keepers. Mr. Black will answer for what he did. But not as a monster. As a man who finally heard the sentence he could not translate.",
      textKo: "수호석들은 각자의 보호자에게 돌아가고 있어요. Mr. Black은 자신이 한 일에 책임을 질 거예요. 하지만 괴물로서가 아니에요. 자신이 번역하지 못했던 문장을 마침내 들은 사람으로서.",
      textEs: "Las piedras vuelven a sus guardianes. Mr. Black responderá por lo que hizo. Pero no como un monstruo. Como un hombre que por fin oyó la frase que no pudo traducir.",
      textId: "Batu-batu itu kembali kepada para penjaganya. Mr. Black akan mempertanggungjawabkan perbuatannya. Tapi bukan sebagai monster. Sebagai seorang lelaki yang akhirnya mendengar kalimat yang tak bisa ia terjemahkan.",
    },
    {
      kind: "clue",
      symbol: "🌍",
      titleEn: "The Language Conspiracy, Solved",
      titleKo: "언어 음모, 해결",
      titleEs: "La Conspiración del Lenguaje, Resuelta",
      titleId: "Konspirasi Bahasa, Terpecahkan",
      descEn: "Seven Guardian Stones released. The Universal Code dismantled. Mr. Black surrendered, not defeated but understood. Mira's voice returned with feeling. Ellis's journal preserved the proof. Detective Rudy is no longer only a detective. He is a Language Guardian.",
      descKo: "7개의 수호석이 풀려났다. Universal Code는 해체되었다. Mr. Black은 항복했다. 패배한 것이 아니라 이해된 것이다. Mira의 목소리는 감정을 되찾았다. Ellis의 일지는 증거를 보존했다. 탐정 루디는 더 이상 단지 탐정이 아니다. 그는 언어의 수호자다.",
      descEs: "Siete Piedras Guardianas liberadas. El Código Universal desmantelado. Mr. Black se rindió, no derrotado sino comprendido. La voz de Mira volvió con emoción. El diario de Ellis conservó la prueba. Detective Rudy ya no es solo detective. Es un Guardián del Idioma.",
      descId: "Tujuh Batu Penjaga dilepaskan. Universal Code dibongkar. Mr. Black menyerah, bukan dikalahkan melainkan dipahami. Suara Mira kembali dengan perasaan. Jurnal Ellis menyimpan buktinya. Detektif Rudy tak lagi sekadar seorang detektif. Ia adalah seorang Penjaga Bahasa.",
    },
    {
      kind: "scene",
      charId: "lingo",
      backdrop: "babel-language-gates",
      expression: "celebratory",
      text: "Partner, we did not save language because it is useful. We saved it because every word is someone reaching for someone else.",
      textKo: "파트너, 우리는 언어가 유용해서 구한 게 아니에요. 모든 단어가 누군가가 다른 누군가에게 손을 뻗는 일이기 때문에 구한 거예요.",
      textEs: "Compa, no salvamos el idioma porque sea útil. Lo salvamos porque cada palabra es alguien intentando alcanzar a otra persona.",
      textId: "Partner, kita tidak menyelamatkan bahasa karena ia berguna. Kita menyelamatkannya karena setiap kata adalah seseorang yang berusaha menggapai orang lain.",
    },
  ],
};

STORIES.madrid = MADRID_V21_STORY;
STORIES.seoul = SEOUL_V21_STORY;
STORIES.cairo = CAIRO_V21_STORY;
STORIES.babel = BABEL_V21_STORY;

async function markChapterComplete(storyId: string, nextId?: string) {
  try {
    const raw = await AsyncStorage.getItem(STORY_PROGRESS_KEY);
    const progress: StoryProgress = raw
      ? JSON.parse(raw)
      : { completed: [], unlocked: ["london"] };
    if (!progress.completed.includes(storyId)) progress.completed.push(storyId);
    if (nextId && !progress.unlocked.includes(nextId)) progress.unlocked.push(nextId);
    await AsyncStorage.setItem(STORY_PROGRESS_KEY, JSON.stringify(progress));
    queueProgressPush({ story_progress: progress });
  } catch (e) { console.warn("[Story] markChapterComplete failed:", e); }
}

/* ─────────────────── DIALOGUE INDICATORS ─────────────────── */

/**
 * Small blinking ▼ shown next to the "Next" label after a typewriter
 * line finishes. Mimics classic visual-novel "press to continue" cues.
 */
function BlinkingArrow({ color, size = 12 }: { color: string; size?: number }) {
  const blinkAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0.25, duration: 480, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1,    duration: 480, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.Text
      style={{
        marginLeft: 6,
        color,
        fontSize: size,
        opacity: blinkAnim,
        fontFamily: F.bodySemi,
      }}
    >
      ▼
    </Animated.Text>
  );
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
      <Image source={rudyStoryImg} style={styles.solvedPortrait} resizeMode="cover" />
      <Text style={styles.solvedTitle}>{lang === "korean" ? "퍼즐 해결!" : lang === "spanish" ? "¡Puzzle Resuelto!" : lang === "indonesian" ? "Teka-teki selesai!" : "Puzzle Solved!"}</Text>
      <Text style={styles.solvedXp}>+20 XP</Text>
      <Pressable style={styles.solvedBtn} onPress={onNext}>
        <Text style={styles.solvedBtnText}>{lang === "korean" ? "계속" : lang === "spanish" ? "Continuar" : lang === "indonesian" ? "Lanjut" : "Continue"}</Text>
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
        <EmojiText style={styles.puzzleNum}>PUZZLE {idx + 1}/{puzzle.questions.length}</EmojiText>
        <Text style={styles.puzzleType}>{lang === "korean" ? "단어 매칭" : lang === "spanish" ? "Relacionar palabras" : lang === "indonesian" ? "Cocokkan kata" : "Word Matching"}</Text>
      </View>
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>{lang === "korean" ? "이 단어의 뜻은?" : lang === "spanish" ? "¿Qué significa?" : lang === "indonesian" ? "Apa artinya ini?" : "What does this mean?"}</Text>
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
  const ko = lang === "korean"; const es = lang === "spanish"; const id = lang === "indonesian";
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
  const h1 = qHints ? resolveHint(qHints.h1, lang, learningLang) : null;
  const h2 = qHints?.h2 ? resolveHint(qHints.h2, lang, learningLang) : null;
  const h3 = qHints?.h3 ? resolveHint(qHints.h3, lang, learningLang) : null;
  const allQHints = [h1, h2, h3].filter(Boolean) as string[];
  const hasQHints = allQHints.length > 0;

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <EmojiText style={styles.puzzleNum}>PUZZLE {idx + 1}/{puzzle.questions.length}</EmojiText>
        <Text style={styles.puzzleType}>{ko ? "빈칸 채우기" : es ? "Completar espacios" : id ? "Isi bagian kosong" : "Fill in the Blank"}</Text>
      </View>
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>{ko ? "빈칸에 알맞은 단어는?" : es ? "¿Qué palabra completa la frase?" : id ? "Kata mana yang mengisi bagian kosong?" : "Which word fills the blank?"}</Text>
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
            {ko ? `힌트 보기 (${hintLevel}/${allQHints.length})` : es ? `Ver pistas (${hintLevel}/${allQHints.length})` : id ? `Petunjuk (${hintLevel}/${allQHints.length})` : `Hints (${hintLevel}/${allQHints.length})`}
          </Text>
        </Pressable>
      )}
      {!confirmed ? (
        <Pressable style={[styles.puzzleConfirmBtn, { opacity: selected ? 1 : 0.5 }]} onPress={handleConfirm} disabled={!selected}>
          <Text style={styles.puzzleConfirmText}>{ko ? "확인" : es ? "Confirmar" : id ? "Konfirmasi" : "Confirm"}</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.puzzleConfirmBtn} onPress={handleNext}>
          <Text style={styles.puzzleConfirmText}>{idx < puzzle.questions.length - 1 ? (ko ? "다음" : id ? "Lanjut" : "Next") : (ko ? "완료" : es ? "Listo" : id ? "Selesai" : "Done")}</Text>
        </Pressable>
      )}
      {hasQHints && (
        <Modal visible={hintVisible} transparent animationType="fade" onRequestClose={() => setHintVisible(false)}>
          <Pressable style={styles.hintOverlay} onPress={() => setHintVisible(false)}>
            <Pressable style={styles.hintNotebook} onPress={() => {}}>
              <View style={styles.hintNotebookHeader}>
                <EmojiText style={styles.hintNotebookTitle}>{ko ? "수사 노트" : es ? "Cuaderno de Detective" : id ? "Catatan Detektif" : "Detective's Notebook"}</EmojiText>
                <Pressable onPress={() => setHintVisible(false)} style={styles.hintCloseBtn}>
                  <Text style={styles.hintCloseBtnText}>X</Text>
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
                        <Text style={styles.hintLabel}>{ko ? `힌트 ${i + 1}` : es ? `Pista ${i + 1}` : id ? `Petunjuk ${i + 1}` : `Hint ${i + 1}`}</Text>
                        <Text style={styles.hintText}>{hint}</Text>
                      </View>
                    ) : isNext ? (
                      <Pressable style={styles.hintLocked} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setHintLevel(i + 1); }}>
                        <View style={styles.hintLockMark} />
                        <Text style={styles.hintLockedText}>{ko ? `힌트 ${i + 1} 열기` : es ? `Abrir pista ${i + 1}` : id ? `Buka petunjuk ${i + 1}` : `Unlock Hint ${i + 1}`}</Text>
                      </Pressable>
                    ) : (
                      <View style={[styles.hintLocked, { opacity: 0.4 }]}>
                        <View style={styles.hintLockMark} />
                        <Text style={styles.hintLockedText}>{ko ? `힌트 ${i + 1}` : es ? `Pista ${i + 1}` : id ? `Petunjuk ${i + 1}` : `Hint ${i + 1}`}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
              <Text style={styles.hintFooter}>{ko ? "이전 힌트를 먼저 열어야 해요" : es ? "Desbloquea las pistas en orden" : id ? "Buka petunjuk secara berurutan" : "Unlock hints in order"}</Text>
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
    // Block advancement on a wrong-confirmed answer; the puzzle is a
    // language-production check, so let the learner re-attempt instead of
    // silently passing them through. Mirrors the WordMatchPuzzle "stay until
    // correct" semantics.
    if (selected !== answer) {
      setConfirmed(false);
      setSelected(null);
      onResetHints?.();
      return;
    }
    if (idx < puzzle.questions.length - 1) { setIdx((i) => i + 1); setSelected(null); setConfirmed(false); onResetHints?.(); }
    else setSolved(true);
  }

  if (solved) return <PuzzleSolvedBadge onNext={onSolved} lang={lang} />;

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <EmojiText style={styles.puzzleNum}>PUZZLE {idx + 1}/{puzzle.questions.length}</EmojiText>
        <Text style={styles.puzzleType}>{lang === "korean" ? "대화 선택" : lang === "spanish" ? "Elección de diálogo" : lang === "indonesian" ? "Pilih dialog" : "Dialogue Choice"}</Text>
      </View>
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>{tri(q.prompt, lang)}</Text>
        <Text style={styles.puzzleContext}>{tri(q.context, lang)}</Text>
        <Text style={styles.puzzleChooseHint}>{lang === "korean" ? "↓ 올바른 대답을 선택하세요" : lang === "spanish" ? "↓ Elige la respuesta correcta" : lang === "indonesian" ? "↓ Pilih jawaban yang benar" : "↓ Choose the correct response"}</Text>
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
          <Text style={styles.puzzleConfirmText}>{lang === "korean" ? "확인" : lang === "spanish" ? "Confirmar" : lang === "indonesian" ? "Konfirmasi" : "Confirm"}</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.puzzleConfirmBtn} onPress={handleNext}>
          <Text style={styles.puzzleConfirmText}>{
            idx < puzzle.questions.length - 1
              ? (lang === "korean" ? "다음" : lang === "spanish" ? "Siguiente" : lang === "indonesian" ? "Lanjut" : "Next")
              : (lang === "korean" ? "완료" : lang === "spanish" ? "Hecho" : lang === "indonesian" ? "Selesai" : "Done")
          }</Text>
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
        <EmojiText style={styles.puzzleNum}>PUZZLE {idx + 1}/{puzzle.questions.length}</EmojiText>
        <Text style={styles.puzzleType}>{lang === "korean" ? "문장 만들기" : lang === "spanish" ? "Construir oraciones" : lang === "indonesian" ? "Susun kalimat" : "Sentence Builder"}</Text>
      </View>
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>{tri(q.instruction, lang)}</Text>
        <View style={styles.sbAnswerRow}>
          {placed.length === 0
            ? <Text style={styles.sbAnswerPlaceholder}>{lang === "korean" ? "단어를 탭하세요..." : lang === "spanish" ? "Toca las palabras..." : lang === "indonesian" ? "Ketuk kata di bawah..." : "Tap words below..."}</Text>
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
              ? (lang === "korean" ? "정답이에요!" : lang === "indonesian" ? "Benar!" : "Correct!")
              : (lang === "korean" ? "다시 시도해요" : lang === "indonesian" ? "Coba lagi" : "Try again")}
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
          <Text style={styles.puzzleConfirmText}>{lang === "korean" ? "확인" : lang === "spanish" ? "Verificar" : lang === "indonesian" ? "Periksa" : "Check"}</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.puzzleConfirmBtn} onPress={isCorrect ? handleNext : () => { setPlaced([]); setConfirmed(false); setIsCorrect(false); }}>
          <Text style={styles.puzzleConfirmText}>{
            isCorrect
              ? (lang === "korean" ? "다음" : lang === "spanish" ? "Siguiente" : lang === "indonesian" ? "Lanjut" : "Next")
              : (lang === "korean" ? "다시 시도" : lang === "spanish" ? "Reintentar" : lang === "indonesian" ? "Coba lagi" : "Try Again")
          }</Text>
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
    if (selected !== q.answerIdx) {
      setSelected(null);
      setConfirmed(false);
      return;
    }

    if (idx < puzzle.questions.length - 1) { setIdx((i) => i + 1); setSelected(null); setConfirmed(false); onResetHints?.(); }
    else setSolved(true);
  }

  if (solved) return <PuzzleSolvedBadge onNext={onSolved} lang={lang} />;

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <EmojiText style={styles.puzzleNum}>INVESTIGATION</EmojiText>
        <Text style={styles.puzzleType}>{lang === "korean" ? "단서 조사" : lang === "spanish" ? "Investigar pistas" : lang === "indonesian" ? "Analisis bukti" : "Evidence Analysis"}</Text>
      </View>
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>{tri(q.prompt, lang)}</Text>
        <Text style={styles.puzzleChooseHint}>{lang === "korean" ? "↓ 핵심 증거를 선택하세요" : lang === "spanish" ? "↓ Selecciona la evidencia clave" : lang === "indonesian" ? "↓ Pilih bukti kunci" : "↓ Select the key evidence"}</Text>
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
          <Text style={styles.puzzleConfirmText}>{lang === "korean" ? "증거 제출" : lang === "spanish" ? "Presentar evidencia" : lang === "indonesian" ? "Kirim bukti" : "Submit Evidence"}</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.puzzleConfirmBtn} onPress={handleNext}>
          <Text style={styles.puzzleConfirmText}>
            {selected === q.answerIdx
              ? (lang === "korean" ? "계속" : lang === "indonesian" ? "Lanjut" : "Continue")
              : (lang === "korean" ? "다시 선택하기" : lang === "spanish" ? "Elegir otra vez" : lang === "indonesian" ? "Pilih lagi" : "Choose again")}
          </Text>
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
  // encoded only carries en/es ciphers; korean/indonesian learners decode the
  // English cipher (their answer below is still shown in their learning lang).
  const encodedWord = learningLang === "spanish" ? q.encoded.es : q.encoded.en;
  // correctAnswer is the decoded answer in the learning language
  const correctAnswer = learningLang === "spanish" ? q.answer.es
    : learningLang === "korean" ? q.answer.ko
    : learningLang === "indonesian" ? (q.answer.id ?? q.answer.en)
    : q.answer.en;
  // nativeTranslation shows the same answer in the UI language (for understanding)
  const nativeTranslation = lang === "korean" ? q.answer.ko
    : lang === "spanish" ? q.answer.es
    : lang === "indonesian" ? (q.answer.id ?? q.answer.en)
    : q.answer.en;
  const hintText = lang === "korean" ? q.hint.ko : lang === "spanish" ? q.hint.es : lang === "indonesian" ? (q.hint.id ?? q.hint.en) : q.hint.en;

  const [shuffledOpts] = useState(() =>
    puzzle.questions.map((qq) => {
      const opts = qq.opts.map((o) =>
        learningLang === "spanish" ? o.es
        : learningLang === "korean" ? o.ko
        : learningLang === "indonesian" ? (o.id ?? o.en)
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
    const id = lang === "indonesian";
    const halfLen = Math.ceil(encodedWord.length / 2);
    const decodedHalf = encodedWord.slice(0, halfLen).split("").map((ch: string) =>
      String.fromCharCode(((ch.charCodeAt(0) - 65 - q.shift + 26) % 26) + 65)
    ).join("") + "_".repeat(encodedWord.length - halfLen);
    return [
      ko ? "각 글자를 알파벳에서 한 칸 앞 글자로 바꿔보세요."
        : es ? "Cambia cada letra por la que está una posición antes en el alfabeto."
        : id ? "Ganti tiap huruf dengan huruf satu langkah sebelumnya di alfabet."
        : "Replace each letter with the one that comes one step before it in the alphabet.",
      ko ? `예: ${firstLetter} → ${decodedFirst}`
        : es ? `Ejemplo: ${firstLetter} → ${decodedFirst}`
        : id ? `Contoh: ${firstLetter} → ${decodedFirst}`
        : `Example: ${firstLetter} → ${decodedFirst}`,
      ko ? `단어의 앞부분: ${decodedHalf}. 나머지 글자도 같은 방법으로 풀어봐`
        : es ? `Primeras letras descifradas: ${decodedHalf}. Descifra el resto con el mismo método`
        : id ? `Huruf awal terpecahkan: ${decodedHalf}. Pakai pergeseran yang sama untuk sisanya`
        : `First letters decoded: ${decodedHalf}. Apply the same shift to the rest`,
    ];
  }

  const hints = getHints();

  if (solved) return <PuzzleSolvedBadge onNext={onSolved} lang={lang} />;

  // ── Result screen ──
  if (showResult) {
    const ko = lang === "korean";
    const es = lang === "spanish";
    const id = lang === "indonesian";

    if (!isCorrect) {
      // ── WRONG ANSWER ──
      return (
        <View style={styles.puzzleBox}>
          <View style={styles.puzzleHeaderRow}>
            <EmojiText style={styles.puzzleNum}>{ko ? "암호를 해독하라!" : es ? "¡Descifra el código!" : id ? "Pecahkan sandinya!" : "Decode the Cipher!"}</EmojiText>
            <Text style={styles.puzzleType}>{idx + 1}/{puzzle.questions.length}</Text>
          </View>

          {/* Error banner — NO answer reveal */}
          <View style={styles.cipherResultWrong}>
            <Text style={styles.cipherResultTitle}>
              {ko ? "틀렸어요" : es ? "Incorrecto" : id ? "Salah!" : "Wrong!"}
            </Text>
          </View>

          {/* Fox dialogue */}
          <View style={styles.cipherLingoRow}>
            <Image source={rudyStoryImg} style={styles.cipherLingoPortrait} resizeMode="cover" />
            <View style={styles.cipherLingoBubble}>
              <Text style={styles.cipherLingoBubbleText}>
                {ko ? "흠... 뭔가 조금 다른 것 같군요, 파트너." : es ? "Hmm... algo no está bien, compañero." : id ? "Hmm... ada yang kurang pas, partner." : "Hmm... something's not quite right, partner."}
              </Text>
            </View>
          </View>
          <Text style={styles.cipherRetryHint}>
            {ko ? "조금만 더 생각해보세요." : es ? "Piénsalo un poco más." : id ? "Pikirkan sedikit lagi." : "Think it over a bit more."}
          </Text>

          {/* Buttons: Retry + Hint */}
          <View style={styles.cipherBtnRow}>
            <Pressable style={[styles.puzzleConfirmBtn, styles.cipherRetryBtn]} onPress={handleRetry}>
              <Text style={[styles.puzzleConfirmText, { color: C.gold }]}>
                {ko ? "다시 시도" : es ? "Reintentar" : id ? "Coba lagi" : "Retry"}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.puzzleConfirmBtn, { flex: 1 }]}
              onPress={() => { setShowHintModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            >
              <Text style={styles.puzzleConfirmText}>
                {ko ? "힌트 보기" : es ? "Ver pistas" : id ? "Lihat petunjuk" : "Show Hints"}
              </Text>
            </Pressable>
          </View>

          {/* Hint Modal (shared) */}
          <Modal visible={showHintModal} transparent animationType="fade" onRequestClose={() => setShowHintModal(false)}>
            <Pressable style={styles.hintOverlay} onPress={() => setShowHintModal(false)}>
              <Pressable style={styles.hintNotebook} onPress={() => {}}>
                <View style={styles.hintNotebookHeader}>
                  <EmojiText style={styles.hintNotebookTitle}>{ko ? "수사 노트" : es ? "Cuaderno de Detective" : id ? "Catatan Detektif" : "Detective's Notebook"}</EmojiText>
                  <Pressable onPress={() => setShowHintModal(false)} style={styles.hintCloseBtn}>
                    <Text style={styles.hintCloseBtnText}>X</Text>
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
                          <Text style={styles.hintLabel}>{ko ? `힌트 ${i + 1}` : es ? `Pista ${i + 1}` : id ? `Petunjuk ${i + 1}` : `Hint ${i + 1}`}</Text>
                          <Text style={styles.hintText}>{hint}</Text>
                        </View>
                      ) : isNext ? (
                        <Pressable style={styles.hintLocked} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setUnlockedHints(i + 1); }}>
                          <View style={styles.hintLockMark} />
                          <Text style={styles.hintLockedText}>{ko ? `힌트 ${i + 1} 열기` : es ? `Abrir pista ${i + 1}` : id ? `Buka petunjuk ${i + 1}` : `Unlock Hint ${i + 1}`}</Text>
                        </Pressable>
                      ) : (
                        <View style={[styles.hintLocked, { opacity: 0.4 }]}>
                          <View style={styles.hintLockMark} />
                          <Text style={styles.hintLockedText}>{ko ? `힌트 ${i + 1}` : es ? `Pista ${i + 1}` : id ? `Petunjuk ${i + 1}` : `Hint ${i + 1}`}</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
                <Text style={styles.hintFooter}>{ko ? "이전 힌트를 먼저 열어야 해요" : es ? "Desbloquea las pistas en orden" : id ? "Buka petunjuk secara berurutan" : "Unlock hints in order"}</Text>
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
          <EmojiText style={styles.puzzleNum}>{ko ? "암호를 해독하라!" : es ? "¡Descifra el código!" : id ? "Pecahkan sandinya!" : "Decode the Cipher!"}</EmojiText>
          <Text style={styles.puzzleType}>{idx + 1}/{puzzle.questions.length}</Text>
        </View>

        {/* Success banner */}
        <View style={styles.cipherResultCorrect}>
          <EmojiText style={styles.cipherResultTitle}>{ko ? "퍼즐 해결!" : es ? "¡Puzzle resuelto!" : id ? "Teka-teki selesai!" : "Puzzle Solved!"}</EmojiText>
        </View>

        {/* Fox celebration */}
        <View style={styles.cipherLingoRow}>
          <Image source={rudyStoryImg} style={styles.cipherLingoPortrait} resizeMode="cover" />
          <View style={styles.cipherLingoBubble}>
            <Text style={styles.cipherLingoBubbleText}>
              {ko ? "훌륭하군요, 파트너! 암호를 완벽히 해독했어요." : es ? "¡Brillante, compañero! Has descifrado el código perfectamente." : id ? "Hebat, partner! Kamu memecahkan sandinya dengan sempurna." : "Brilliant, partner! You've decoded the cipher perfectly."}
            </Text>
          </View>
        </View>

        {/* Explanation (only on success) */}
        <View style={styles.cipherDivider} />
        <View style={styles.cipherExplainBox}>
          <Text style={styles.cipherExplainLabel}>
            {ko ? "해설:" : es ? "Explicación:" : id ? "Penjelasan:" : "Explanation:"}
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
          {ko ? "+50 XP 획득!" : es ? "¡+50 XP obtenidos!" : id ? "+50 XP didapat!" : "+50 XP earned!"}
        </Text>

        {/* Continue button */}
        <Pressable style={styles.puzzleConfirmBtn} onPress={handleContinue}>
          <Text style={styles.puzzleConfirmText}>
            {ko ? "다음 퍼즐" : es ? "Siguiente" : id ? "Teka-teki berikutnya" : "Next Puzzle"}
          </Text>
        </Pressable>
      </View>
    );
  }

  // ── Question screen ──
  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <EmojiText style={styles.puzzleNum}>{lang === "korean" ? "암호를 해독하라!" : lang === "spanish" ? "¡Descifra el código!" : lang === "indonesian" ? "Pecahkan sandinya!" : "Decode the Cipher!"}</EmojiText>
        <Text style={styles.puzzleType}>{idx + 1}/{puzzle.questions.length}</Text>
      </View>

      {/* Fox bubble */}
      <View style={styles.cipherLingoRow}>
        <Image source={rudyStoryImg} style={styles.cipherLingoPortrait} resizeMode="cover" />
        <View style={styles.cipherLingoBubble}>
          <Text style={styles.cipherLingoBubbleText}>
            {lang === "korean" ? "이 암호를 해독해봐, 파트너!" : lang === "spanish" ? "¡Descifra este código, compañero!" : lang === "indonesian" ? "Pecahkan sandi ini, partner!" : "Decode this cipher, partner!"}
          </Text>
        </View>
      </View>

      {/* Puzzle card — cipher text + clue only */}
      <View style={styles.cipherWordCard}>
        <Text style={styles.cipherCardLabel}>
          {lang === "korean" ? "암호" : lang === "spanish" ? "Cifrado" : lang === "indonesian" ? "Sandi" : "Cipher"}
        </Text>
        <Text style={styles.cipherEncoded}>{encodedWord}</Text>
        <View style={styles.cipherCardDivider} />
        <Text style={styles.cipherCardLabel}>
          {lang === "korean" ? "단서" : lang === "spanish" ? "Pista" : lang === "indonesian" ? "Petunjuk" : "Clue"}
        </Text>
        <Text style={styles.cipherHint}>{hintText}</Text>
      </View>

      {/* Hint button */}
      <Pressable
        style={styles.hintBtn}
        onPress={() => { setShowHintModal(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
      >
        <Text style={styles.hintBtnText}>
          {lang === "korean" ? "힌트 보기" : lang === "spanish" ? "Ver pistas" : lang === "indonesian" ? "Lihat petunjuk" : "Show Hints"}
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
              <Text style={styles.cipherOptLabel}>{i + 1}</Text>
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
                {lang === "korean" ? "수사 노트" : lang === "spanish" ? "Cuaderno de Detective" : lang === "indonesian" ? "Catatan Detektif" : "Detective's Notebook"}
              </Text>
              <Pressable onPress={() => setShowHintModal(false)} style={styles.hintCloseBtn}>
                <Text style={styles.hintCloseBtnText}>X</Text>
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
                        {lang === "korean" ? `힌트 ${i + 1}` : lang === "spanish" ? `Pista ${i + 1}` : lang === "indonesian" ? `Petunjuk ${i + 1}` : `Hint ${i + 1}`}
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
                      <View style={styles.hintLockMark} />
                      <Text style={styles.hintLockedText}>
                        {lang === "korean" ? `힌트 ${i + 1} 열기` : lang === "spanish" ? `Abrir pista ${i + 1}` : lang === "indonesian" ? `Buka petunjuk ${i + 1}` : `Unlock Hint ${i + 1}`}
                      </Text>
                    </Pressable>
                  ) : (
                    <View style={[styles.hintLocked, { opacity: 0.4 }]}>
                      <View style={styles.hintLockMark} />
                      <Text style={styles.hintLockedText}>
                        {lang === "korean" ? `힌트 ${i + 1}` : lang === "spanish" ? `Pista ${i + 1}` : lang === "indonesian" ? `Petunjuk ${i + 1}` : `Hint ${i + 1}`}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

            <Text style={styles.hintFooter}>
              {lang === "korean" ? "이전 힌트를 먼저 열어야 해요" : lang === "spanish" ? "Desbloquea las pistas en orden" : lang === "indonesian" ? "Buka petunjuk secara berurutan" : "Unlock hints in order"}
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
                   : learningLang === "indonesian" ? (q.word.id ?? q.word.en)
                   : q.word.en;
  const targetLangLabel = learningLang === "spanish"
    ? (lang === "korean" ? "스페인어" : lang === "spanish" ? "español" : lang === "indonesian" ? "bahasa Spanyol" : "Spanish")
    : learningLang === "korean"
    ? (lang === "korean" ? "한국어" : lang === "spanish" ? "coreano" : lang === "indonesian" ? "bahasa Korea" : "Korean")
    : (lang === "korean" ? "영어" : lang === "spanish" ? "inglés" : lang === "indonesian" ? "bahasa Inggris" : "English");
  const meaning = lang === "korean" ? q.opts[q.answerIdx].ko
                : lang === "spanish" ? q.opts[q.answerIdx].es
                : lang === "indonesian" ? (q.opts[q.answerIdx].id ?? q.opts[q.answerIdx].en)
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
           : lang === "indonesian" ? `Salah. Jawaban: ${targetWord}`
           : `Incorrect. Answer: ${targetWord}`;
    }
    if (answerResult.accentDiff) {
      return lang === "korean" ? `정답! 참고: 올바른 표기는 ${targetWord}입니다`
           : lang === "spanish" ? `¡Correcto! Nota: la ortografía correcta es ${targetWord}`
           : lang === "indonesian" ? `Benar! Catatan: ejaan yang tepat adalah ${targetWord}`
           : `Correct! Note: the proper spelling is ${targetWord}`;
    }
    if (answerResult.isVariant) {
      return lang === "korean" ? `정답! 참고: 표준 표기는 ${targetWord}입니다`
           : lang === "spanish" ? `¡Correcto! Nota: la ortografía estándar es ${targetWord}`
           : lang === "indonesian" ? `Benar! Catatan: ejaan baku-nya adalah ${targetWord}`
           : `Correct! Note: the standard spelling is ${targetWord}`;
    }
    return lang === "korean" ? "정답이에요!"
         : lang === "spanish" ? "¡Correcto!"
         : lang === "indonesian" ? "Benar!"
         : "Correct!";
  }

  if (solved) return <PuzzleSolvedBadge onNext={onSolved} lang={lang} />;

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <EmojiText style={styles.puzzleNum}>✍️ {lang === "korean" ? "단어 입력" : lang === "spanish" ? "Escribe la palabra" : lang === "indonesian" ? "Ketik kata" : "Word Typing"}</EmojiText>
        <Text style={styles.puzzleType}>{idx + 1}/{puzzle.questions.length}</Text>
      </View>

      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>
          {lang === "korean" ? `이 뜻에 맞는 ${targetLangLabel} 단어를 입력하세요` : lang === "spanish" ? `Escribe la palabra en ${targetLangLabel} que significa:` : lang === "indonesian" ? `Ketik kata ${targetLangLabel} yang berarti:` : `Type the ${targetLangLabel} word that means:`}
        </Text>
        <Text style={[styles.puzzleWordMain, { fontSize: 17, textTransform: "none", lineHeight: 26 }]}>{meaning}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 10, gap: 5 }}>
          {Array.from({ length: targetWord.length }).map((_, i) => (
            <View key={i} style={{ width: 14, height: 3, backgroundColor: C.gold, borderRadius: 2, opacity: 0.45 }} />
          ))}
          <Text style={{ fontFamily: F.body, fontSize: 11, color: C.goldDim, width: "100%", textAlign: "center", marginTop: 5 }}>
            {targetWord.length} {lang === "korean" ? "글자" : lang === "spanish" ? "letras" : lang === "indonesian" ? "huruf" : "letters"}
          </Text>
        </View>
      </View>

      <TextInput
        ref={inputRef}
        style={[styles.writingInput, confirmed && (isCorrect ? styles.writingInputCorrect : styles.writingInputWrong)]}
        value={answer}
        onChangeText={setAnswer}
        placeholder={lang === "korean" ? `${targetLangLabel} 단어를 입력하세요...` : lang === "spanish" ? `Escribe en ${targetLangLabel}...` : lang === "indonesian" ? `Ketik kata ${targetLangLabel}...` : `Type the ${targetLangLabel} word...`}
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
          <Text style={styles.puzzleConfirmText}>{lang === "korean" ? "확인" : lang === "spanish" ? "Confirmar" : lang === "indonesian" ? "Periksa" : "Check"}</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.puzzleConfirmBtn} onPress={handleNext}>
          <Text style={styles.puzzleConfirmText}>{lang === "korean" ? "계속" : lang === "spanish" ? "Continuar" : lang === "indonesian" ? "Lanjut" : "Continue"}</Text>
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
    : learningLang === "indonesian" ? (q.word.id ?? q.word.en)
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
      });
      const data = await resp.json() as { recognized?: string };
      const recognized = data.recognized ?? "";
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
  const id = lang === "indonesian";

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <Text style={styles.puzzleNum}>
          {ko ? "손으로 쓰기" : es ? "Escritura a mano" : id ? "Tulis Kata" : "Write the Word"}
        </Text>
        <Text style={styles.puzzleType}>{idx + 1}/{puzzle.questions.length}</Text>
      </View>

      {/* Instruction */}
      <Text style={styles.hwInstruction}>
        {ko ? "이 단어를 손가락으로 써보세요:" : es ? "Escribe esta palabra con el dedo:" : id ? "Tulis kata ini dengan jarimu:" : "Write this word with your finger:"}
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
            {ko ? "여기에 쓰세요..." : es ? "Escribe aquí..." : id ? "Tulis di sini..." : "Write here..."}
          </Text>
        )}
      </View>

      {/* Recognized text */}
      {recognizedText ? (
        <View style={styles.hwRecognized}>
          <Text style={styles.hwRecognizedLabel}>
            {ko ? "인식된 텍스트:" : es ? "Texto reconocido:" : id ? "Dikenali:" : "Recognized:"}
          </Text>
          <Text style={styles.hwRecognizedText}>{recognizedText}</Text>
        </View>
      ) : null}

      {/* Feedback */}
      {feedback === "good" && (
        <View style={styles.pronFeedbackGood}>
          <Text style={styles.pronFeedbackText}>
            {ko ? "잘 썼어요!" : es ? "¡Excelente escritura!" : id ? "Tulisan bagus!" : "Great handwriting!"}
          </Text>
        </View>
      )}
      {feedback === "retry" && (
        <View style={styles.pronFeedbackRetry}>
          <Text style={styles.pronFeedbackText}>
            {ko ? "다시 써보세요." : es ? "Inténtalo de nuevo." : id ? "Coba lagi." : "Try again."}
          </Text>
          <Pressable style={styles.pronSkipBtn} onPress={advanceNext}>
            <Text style={styles.pronSkipText}>
              {ko ? "그냥 넘어가기" : es ? "Continuar" : id ? "Lewati" : "Skip"}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Clear + Submit */}
      <View style={styles.hwBtnRow}>
        <Pressable style={[styles.hwBtn, styles.hwClearBtn]} onPress={clearCanvas}>
          <Ionicons name="trash-outline" size={18} color={C.gold} />
          <Text style={[styles.hwBtnText, { color: C.gold }]}>
            {ko ? "지우기" : es ? "Borrar" : id ? "Hapus" : "Clear"}
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
                {ko ? "제출" : es ? "Enviar" : id ? "Kirim" : "Submit"}
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
  const targetWord = learningLang === "korean" ? q.word.ko : learningLang === "spanish" ? q.word.es : learningLang === "indonesian" ? (q.word.id ?? q.word.en) : q.word.en;
  const displayWord = lang === "korean" ? q.word.ko : lang === "spanish" ? q.word.es : lang === "indonesian" ? (q.word.id ?? q.word.en) : q.word.en;
  const hintText = q.hint ? (lang === "korean" ? q.hint.ko : lang === "spanish" ? q.hint.es : lang === "indonesian" ? (q.hint.id ?? q.hint.en) : q.hint.en) : null;

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
           : lang === "indonesian" ? `Jawaban: ${targetWord}`
           : `Answer: ${targetWord}`;
    }
    if (answerResult.isVariant) {
      return lang === "korean" ? `정답! 참고: 표준 표기는 ${targetWord}입니다`
           : lang === "spanish" ? `¡Correcto! Nota: la ortografía estándar es ${targetWord}`
           : lang === "indonesian" ? `Benar! Catatan: ejaan baku-nya adalah ${targetWord}`
           : `Correct! Note: the standard spelling is ${targetWord}`;
    }
    return lang === "korean" ? "정답이에요!"
         : lang === "spanish" ? "¡Correcto!"
         : lang === "indonesian" ? "Benar!"
         : "Correct!";
  }

  if (solved) return <PuzzleSolvedBadge onNext={onSolved} lang={lang} />;

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <EmojiText style={styles.puzzleNum}>{lang === "korean" ? "쓰기 미션" : lang === "spanish" ? "Misión de escritura" : lang === "indonesian" ? "Misi Menulis" : "Writing Mission"}</EmojiText>
        <Text style={styles.puzzleType}>{idx + 1}/{puzzle.questions.length}</Text>
      </View>
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>
          {lang === "korean"
            ? `'${displayWord}'을(를) ${learningLang === "spanish" ? "스페인어" : learningLang === "korean" ? "한국어" : "영어"}로 써보세요`
            : lang === "spanish"
            ? `Escribe '${displayWord}' en ${learningLang === "spanish" ? "español" : learningLang === "korean" ? "coreano" : "inglés"}`
            : lang === "indonesian"
            ? `Tulis '${displayWord}' dalam ${learningLang === "spanish" ? "bahasa Spanyol" : learningLang === "korean" ? "bahasa Korea" : "bahasa Inggris"}`
            : `Type '${displayWord}' in ${learningLang === "spanish" ? "Spanish" : learningLang === "korean" ? "Korean" : "English"}`}
        </Text>
        <Text style={styles.puzzleWordMain}>{displayWord}</Text>
        {hintText && <EmojiText style={styles.puzzleChooseHint}>{hintText}</EmojiText>}
      </View>
      <TextInput
        style={[styles.writingInput, confirmed && (isCorrect ? styles.writingInputCorrect : styles.writingInputWrong)]}
        value={answer}
        onChangeText={setAnswer}
        placeholder={lang === "korean" ? "여기에 입력하세요..." : lang === "spanish" ? "Escribe aquí..." : lang === "indonesian" ? "Ketik di sini..." : "Type here..."}
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
          <Text style={styles.puzzleConfirmText}>{lang === "korean" ? "확인" : lang === "spanish" ? "Confirmar" : lang === "indonesian" ? "Periksa" : "Check"}</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.puzzleConfirmBtn} onPress={handleNext}>
          <Text style={styles.puzzleConfirmText}>{lang === "korean" ? "계속" : lang === "spanish" ? "Continuar" : lang === "indonesian" ? "Lanjut" : "Continue"}</Text>
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
  const scrambledText = learningLang === "korean" ? q.scrambled.ko : learningLang === "spanish" ? q.scrambled.es : learningLang === "indonesian" ? (q.scrambled.id ?? q.scrambled.en) : q.scrambled.en;
  const correctWord = learningLang === "korean" ? q.word.ko : learningLang === "spanish" ? q.word.es : learningLang === "indonesian" ? (q.word.id ?? q.word.en) : q.word.en;
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
        <EmojiText style={styles.puzzleNum}>{lang === "korean" ? "단어 맞추기" : lang === "spanish" ? "Ordenar letras" : lang === "indonesian" ? "Susun Kata" : "Word Unscramble"}</EmojiText>
        <Text style={styles.puzzleType}>{idx + 1}/{puzzle.questions.length}</Text>
      </View>
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>
          {lang === "korean" ? "글자를 순서대로 탭해서 단어를 완성하세요" : lang === "spanish" ? "Toca las letras en orden para formar la palabra" : lang === "indonesian" ? "Ketuk huruf secara berurutan untuk membentuk kata" : "Tap letters in order to form the word"}
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
            {lang === "korean" ? "다시 시작" : lang === "spanish" ? "Reiniciar" : lang === "indonesian" ? "Ulang" : "Reset"}
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
    { q: lang === "korean" ? "'Hello'는 무슨 뜻인가요?" : lang === "spanish" ? "¿Qué significa 'Hello'?" : lang === "indonesian" ? "Apa arti 'Hello'?" : "What does 'Bonjour' mean?",
      opts: lang === "korean" ? ["안녕하세요", "감사합니다", "죄송합니다", "잘 자요"] : lang === "spanish" ? ["Hola", "Gracias", "Lo siento", "Buenas noches"] : lang === "indonesian" ? ["Halo", "Terima kasih", "Maaf", "Selamat malam"] : ["Hello", "Thank you", "Sorry", "Good night"],
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
        <EmojiText style={styles.puzzleNum}>{lang === "korean" ? "퀴즈" : lang === "spanish" ? "Quiz" : lang === "indonesian" ? "Kuis" : "Quick Quiz"}</EmojiText>
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

  const title = lang === "korean" ? clue.titleKo : lang === "spanish" ? clue.titleEs : lang === "indonesian" ? (clue.titleId ?? clue.titleEn) : clue.titleEn;
  const desc = lang === "korean" ? clue.descKo : lang === "spanish" ? clue.descEs : lang === "indonesian" ? (clue.descId ?? clue.descEn) : clue.descEn;

  return (
    <View style={styles.clueReveal}>
      <Animated.View style={[styles.clueRevealCard, { transform: [{ scale }] }]}>
        <EmojiText style={styles.clueRevealBadge}>{lang === "korean" ? "단서 발견!" : lang === "spanish" ? "¡Pista Descubierta!" : lang === "indonesian" ? "Petunjuk Ditemukan!" : "Clue Discovered!"}</EmojiText>
        <Text style={styles.clueSymbol}>{clue.symbol}</Text>
        <Text style={styles.clueRevealTitle}>{title}</Text>
        <Text style={styles.clueRevealDesc}>{desc}</Text>
        <Pressable style={styles.clueRevealBtn} onPress={onNext}>
          <Text style={styles.clueRevealBtnText}>{lang === "korean" ? "계속 수사하기" : lang === "spanish" ? "Continuar investigando" : lang === "indonesian" ? "Lanjut menyelidiki" : "Continue Investigation"}</Text>
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
        <Image source={rudyStoryImg} style={styles.completionPortrait} resizeMode="cover" />
        <Text style={styles.completionTitle}>{lang === "korean" ? "챕터 완료!" : lang === "spanish" ? "¡Capítulo Completado!" : lang === "indonesian" ? "Bab Selesai!" : "Chapter Complete!"}</Text>
        <Text style={styles.completionStoryTitle}>{lang === "korean" ? story.titleKo : lang === "spanish" ? story.titleEs : lang === "indonesian" ? (story.titleId ?? story.title) : story.title}</Text>
        <View style={styles.xpRewardRow}>
          <Ionicons name="flash" size={22} color={C.bg1} />
          <Text style={styles.xpRewardNum}>+{xpEarned} XP</Text>
        </View>
        <Text style={styles.completionMsg}>{lang === "korean" ? "훌륭해요! 언어 탐정으로서의 실력이 향상되었어요. 다음 챕터가 기다립니다..." : lang === "spanish" ? "¡Excelente! Tus habilidades como detective lingüístico han mejorado. El próximo capítulo te espera..." : lang === "indonesian" ? "Luar biasa! Kemampuanmu sebagai Detektif Bahasa makin terasah. Bab berikutnya menanti..." : "Excellent! Your skills as a Language Detective have grown. The next chapter awaits..."}</Text>
        {story.nextChapterId && (
          <Pressable
            style={styles.completionNextBtn}
            onPress={() => router.replace(`/story-scene?id=${story.nextChapterId}` as any)}
          >
            <Ionicons name="arrow-forward" size={18} color={C.bg1} />
            <Text style={styles.completionNextBtnText}>{lang === "korean" ? "다음 챕터" : lang === "spanish" ? "Próximo Capítulo" : lang === "indonesian" ? "Bab Berikutnya" : "Next Chapter"}</Text>
          </Pressable>
        )}
        <Pressable style={styles.completionHomeBtn} onPress={() => router.replace("/(tabs)/story" as any)}>
          <Text style={styles.completionHomeBtnText}>{lang === "korean" ? "스토리 목록으로" : lang === "spanish" ? "Lista de capítulos" : lang === "indonesian" ? "Kembali ke Peta Cerita" : "Back to Story Map"}</Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

/* ─────────────────── MAIN COMPONENT ─────────────────── */

export default function StoryScene() {
  const insets = useSafeAreaInsets();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const { id, intro, mute } = useLocalSearchParams<{ id: string; intro?: string; mute?: string }>();
  const { nativeLanguage, learningLanguage, awardXp: grantXp } = useLanguage();
  const lang = nativeLanguage ?? "english";
  const learningLang = learningLanguage ?? "english";

  const story = STORIES[id ?? "london"] ?? STORIES.london;
  const [seqIdx, setSeqIdx] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [sharedHintVisible, setSharedHintVisible] = useState(false);
  const [sharedHintLevel, setSharedHintLevel] = useState(0);
  const [puzzleScrollEnabled, setPuzzleScrollEnabled] = useState(true);
  const [introStatus, setIntroStatus] = useState<"checking" | "visible" | "hidden">("checking");

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const stageEnterAnim = useRef(new Animated.Value(1)).current;
  const stageFloatAnim = useRef(new Animated.Value(0)).current;
  const backdropDriftAnim = useRef(new Animated.Value(0)).current;
  const bgmRef = useRef<Audio.Sound | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const introSupported = hasIntroTimeline(story.id);
  const introStorageKey = `@enigma_intro_seen_${story.id}`;
  const introNativeLang = lang === "korean" || lang === "spanish" ? lang : "english";
  const forceIntro = intro === "1" || intro === "true";
  const audioMuted = mute === "1" || mute === "true";
  const compactStoryLayout = viewportHeight < 720 || viewportWidth < 370;
  const dialogueMaxHeight = compactStoryLayout ? 116 : 160;

  async function awardXp(amount: number, source: string) {
    try {
      await grantXp(amount);
    } catch (e) {
      console.warn(`[Story] ${source} XP update failed:`, e);
    }
  }

  useEffect(() => {
    const characterLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(stageFloatAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(stageFloatAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    );
    const backdropLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(backdropDriftAnim, { toValue: 1, duration: 7600, useNativeDriver: true }),
        Animated.timing(backdropDriftAnim, { toValue: 0, duration: 7600, useNativeDriver: true }),
      ])
    );

    characterLoop.start();
    backdropLoop.start();
    return () => {
      characterLoop.stop();
      backdropLoop.stop();
    };
  }, [backdropDriftAnim, stageFloatAnim]);

  useEffect(() => {
    stageEnterAnim.setValue(0);
    Animated.spring(stageEnterAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 58,
      friction: 10,
    }).start();
  }, [seqIdx, stageEnterAnim]);

  const completeIntro = useCallback(async () => {
    try {
      await AsyncStorage.setItem(introStorageKey, "true");
    } catch (e) {
      console.warn("[Story] intro flag save failed:", e);
    } finally {
      setIntroStatus("hidden");
    }
  }, [introStorageKey]);

  useEffect(() => {
    let mounted = true;

    if (!introSupported) {
      setIntroStatus("hidden");
      return () => {
        mounted = false;
      };
    }

    setIntroStatus("checking");
    AsyncStorage.getItem(introStorageKey)
      .then((seen) => {
        if (mounted) setIntroStatus(forceIntro || !seen ? "visible" : "hidden");
      })
      .catch((e) => {
        console.warn("[Story] intro flag load failed:", e);
        if (mounted) setIntroStatus(forceIntro ? "visible" : "hidden");
      });

    return () => {
      mounted = false;
    };
  }, [forceIntro, introStorageKey, introSupported]);

  useEffect(() => {
    if (introStatus !== "hidden") return;
    if (audioMuted) return;

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
  }, [audioMuted, introStatus]);

  const seq = story.sequence;

  const BGM_FULL = 0.4;
  const BGM_DIM  = 0.08;   // dimmed during pronunciation / speaking quizzes

  useEffect(() => {
    const currentItem = seq[seqIdx];
    const isSpeakingQuiz =
      currentItem?.kind === "puzzle" &&
      (currentItem.pType === "pronunciation" || currentItem.pType === "voice-power" || currentItem.pType === "npc-rescue");
    bgmRef.current?.setVolumeAsync(isSpeakingQuiz ? BGM_DIM : BGM_FULL).catch((e: unknown) => console.warn('[Audio] BGM volume change failed:', e));
  }, [seqIdx]);

  function fadeTransition(cb: () => void, onFullyDone?: () => void) {
    // Fade-out 100ms (was 180) + fade-in 120ms (was 250) = ~220ms total transition.
    // Web (react-native-web) animations fall back to JS-based and feel slower than
    // native; tighter durations reduce the "scene appears blank" perception during
    // dialogue/scene changes without breaking the cross-fade illusion.
    // `onFullyDone` fires after the fade-in completes so callers can release
    // reentrancy guards covering the whole transition window.
    Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
      cb();
      Animated.timing(fadeAnim, { toValue: 1, duration: 120, useNativeDriver: true }).start(() => {
        onFullyDone?.();
      });
    });
  }

  // Typewriter ref + done state for the currently-displayed scene/narration.
  // Tap-to-skip semantics: first "Next" press while typing → reveal full text;
  // second press (or press when already done) → actually advance to next scene.
  const typewriterRef = useRef<TypewriterHandle | null>(null);
  const [typingDone, setTypingDone] = useState(false);

  // Reentrancy guard for advance(). Without this, rapid taps queue multiple
  // fadeTransition callbacks each calling setSeqIdx(i => i + 1), so the user
  // can skip past unsolved puzzle nodes in the sequence (puzzles 2/3/4 of a
  // chapter would silently disappear under impatient tapping). Ref true while
  // a fade-out → seqIdx update → fade-in is in flight; released by the
  // fadeTransition `onFullyDone` callback.
  const advancingRef = useRef(false);

  // Reentrancy guard for handlePuzzleSolved(). The advance() guard alone is
  // not enough because handlePuzzleSolved is async: rapid taps on the
  // PuzzleSolvedBadge "Continue" can each enter handlePuzzleSolved, await
  // awardXp(20) (so +20 XP fires per tap) before any of them reach advance(),
  // where the second/third advance is finally dropped. The skip is blocked,
  // but XP and tracking side effects already double-fired. Ref is set on
  // entry and cleared when seqIdx changes (i.e., after the new scene mounts
  // and the badge is no longer on screen).
  const puzzleSolvingRef = useRef(false);

  // Reset typing-done flag whenever we move to a new scene; the Typewriter
  // component itself resets internally via its `text` prop change, but the
  // parent needs this for the ▼ blink indicator.
  useEffect(() => {
    setTypingDone(false);
    puzzleSolvingRef.current = false;
  }, [seqIdx]);

  function advance() {
    // First-tap behavior: if the current scene's typewriter is still running,
    // skip to full text instead of advancing. This matches Pokemon / VN UX.
    if (typewriterRef.current && !typewriterRef.current.isDone()) {
      typewriterRef.current.skip();
      Haptics.selectionAsync();
      return;
    }

    // Reentrancy guard: drop additional taps while a transition is in flight.
    if (advancingRef.current) return;
    advancingRef.current = true;

    setSharedHintVisible(false);
    setSharedHintLevel(0);

    // Track idioms from dialogue scenes into Expression Book
    const currentItem = seq[seqIdx];
    if (currentItem?.kind === "scene" && currentItem.idiomRef) {
      const idiomEntry = IDIOM_COLLECTION[currentItem.idiomRef];
      if (idiomEntry) {
        const tl = learningLang === "korean" ? "ko" : learningLang === "spanish" ? "es" : learningLang === "indonesian" ? "id" : "en";
        const idiomData = idiomEntry.idiom[tl] ?? idiomEntry.idiom["en"];
        if (idiomData?.expression) {
          const chapter = story.id === "london" ? "ch1" : story.id === "madrid" ? "ch2" : story.id === "seoul" ? "ch3" : story.id === "cairo" ? "ch4" : "ch5";
          addToExpressionBook(
            [idiomData.expression],
            chapter,
            undefined,
            idiomEntry.npc,
          ).catch((e: unknown) => console.warn('[Story] addToExpressionBook failed:', e));
        }
      }
    }

    fadeTransition(
      () => {
        if (seqIdx < seq.length - 1) {
          setSeqIdx((i) => i + 1);
        } else {
          finishChapter();
        }
      },
      () => {
        advancingRef.current = false;
      },
    );
  }

  // Set true at the first finishChapter entry and never released — the
  // chapter ends here, so the guard only needs to survive long enough to
  // block the ~100ms re-entry window between advance() releasing
  // advancingRef and markChapterComplete/awardXp resolving. Without this,
  // a rapid double-tap on the chapter-end button used to award +150 XP
  // twice.
  const finishingRef = useRef(false);
  async function finishChapter() {
    if (finishingRef.current) return;
    finishingRef.current = true;
    const earned = 150;
    setXpEarned(earned);
    setCompleted(true);
    await markChapterComplete(story.id, story.nextChapterId);
    await awardXp(earned, "finishChapter");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function resetSharedHints() {
    setSharedHintLevel(0);
    setSharedHintVisible(false);
  }

  async function handlePuzzleSolved() {
    // Reentrancy guard: drop rapid Continue taps so awardXp + tracking side
    // effects only fire once per puzzle solve. Released when seqIdx changes
    // (badge has been replaced by the next scene).
    if (puzzleSolvingRef.current) return;
    puzzleSolvingRef.current = true;

    await awardXp(20, "handlePuzzleSolved");

    // Track expressions and I/O ratio for inline puzzles
    const currentItem = seq[seqIdx];
    if (currentItem?.kind === "puzzle") {
      const puzzleItem = currentItem as SeqPuzzle;
      const chapter = story.id === "london" ? "ch1" : story.id === "madrid" ? "ch2" : story.id === "seoul" ? "ch3" : story.id === "cairo" ? "ch4" : "ch5";
      const targetExpressions = puzzleItem.targetExpressions;

      if (puzzleItem.pType !== "investigation" && targetExpressions?.length) {
        addToExpressionBook(targetExpressions, chapter, puzzleItem.tprsStage).catch((e: unknown) => console.warn('[Story] addToExpressionBook failed:', e));
        if (puzzleItem.tprsStage === 4) markExpressionsMastered(targetExpressions).catch((e: unknown) => console.warn('[Story] markExpressionsMastered failed:', e));

        // Seed the Leitner SRS so these story phrases enter the daily review
        // queue (Cards tab "복습" deck). Previously the SRS engine only saw
        // daily-lesson phrases — story-mode learners never had their solved
        // expressions return for spaced reinforcement, so the SRS promise
        // ("forgetting curve") was empty for the story-first learner persona.
        // The phrase string is the source-of-truth target language; meaning
        // is the chapter+puzzle slug (downstream UI shows it as
        // "ch4 · puzzle 2" so the learner can locate where they met it).
        const srsPhrases = targetExpressions.map((expr) => ({
          phrase: expr,
          meaning: `${chapter} · puzzle ${puzzleItem.puzzleNum}`,
          source: `story-${story.id}-p${puzzleItem.puzzleNum}`,
        }));
        addSrsPhrases(srsPhrases).catch((e: unknown) => console.warn('[Story] addSrsPhrases failed:', e));
      }

      // Route the author-curated failure-prone expressions into spaced review.
      // Each puzzle declares `onFail.addToWeakExpressions` (the subset most likely
      // to be fumbled) with `reviewInDailyCourse`, but until now nothing consumed
      // it — story failures never fed the SRS forgetting-curve. Puzzles are
      // retry-until-correct, so "solved" is the only signal point; seeding the
      // weak set here guarantees these phrases resurface in the Cards "복습" deck.
      // addPhrases() dedupes by phrase, so this is additive next to targetExpressions
      // and also covers investigation puzzles (skipped by the block above).
      const onFail = puzzleItem.onFail;
      if (onFail?.reviewInDailyCourse && onFail.addToWeakExpressions?.length) {
        const weakPhrases = onFail.addToWeakExpressions.map((expr) => ({
          phrase: expr,
          meaning: `${chapter} · 복습 (${puzzleItem.pType})`,
          source: `story-${story.id}-p${puzzleItem.puzzleNum}-weak`,
        }));
        addSrsPhrases(weakPhrases).catch((e: unknown) => console.warn('[Story] addSrsPhrases (weak) failed:', e));
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
  const activePortrait = item.kind === "scene" && item.expression
    ? character.portraitVariants?.[item.expression] ?? character.portrait
    : character.portrait;

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
    if (lang === "indonesian") {
      if (!it.isNarration && it.textIdMix) return it.textIdMix;
      if (it.textId) return it.textId;
    }
    return it.text;
  }

  function getCharName(char: (typeof story.characters)[0]) {
    if (lang === "korean" && char.nameKo) return char.nameKo;
    if (lang === "indonesian" && char.nameId) return char.nameId;
    return char.name;
  }

  const titleLabel = lang === "korean" ? story.titleKo : lang === "spanish" ? story.titleEs : lang === "indonesian" ? (story.titleId ?? story.title) : story.title;
  const sceneBackdrop = getSceneBackdrop(story.id, item);
  const characterEntryX = stageEnterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [character.side === "left" ? -42 : 42, 0],
  });
  const characterEntryOpacity = stageEnterAnim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.65, 1],
  });
  const characterEntryScale = stageEnterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });
  const characterFloatY = stageFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });
  const backdropScale = backdropDriftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1.02, 1.055],
  });
  const backdropTranslateX = backdropDriftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 5],
  });

  if (introSupported && introStatus === "checking") {
    return (
      <View style={[styles.root, { paddingTop: topPad, alignItems: "center", justifyContent: "center" }]}>
        <LinearGradient colors={story.gradient} style={StyleSheet.absoluteFill} />
        <ActivityIndicator color={C.gold} />
      </View>
    );
  }

  if (introSupported && introStatus === "visible") {
    return (
      <StoryIntroMotionComic
        chapterId={story.id as ChapterId}
        nativeLang={introNativeLang}
        muted={audioMuted}
        onComplete={completeIntro}
      />
    );
  }

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
        {sceneBackdrop && (
          <>
            <Animated.Image
              source={sceneBackdrop}
              style={[
                styles.sceneBackdropImage,
                { transform: [{ scale: backdropScale }, { translateX: backdropTranslateX }] },
              ]}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["rgba(8,7,6,0.18)", "rgba(8,7,6,0.2)", "rgba(8,7,6,0.78)"]}
              locations={[0, 0.48, 1]}
              style={styles.sceneBackdropShade}
            />
            <LinearGradient
              colors={["rgba(201,162,39,0.14)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.6 }}
              style={styles.sceneBackdropGlow}
            />
          </>
        )}

        {/* NARRATION */}
        {item.kind === "scene" && item.isNarration && (
          <Pressable style={styles.narrationArea} onPress={advance}>
            <Typewriter
              ref={typewriterRef}
              text={getSceneText(item)}
              speedMs={25}
              textStyle={styles.narrationText}
              onComplete={() => setTypingDone(true)}
            />
            <View style={styles.narrationBtn}>
              <Text style={styles.narrationBtnText}>
                {typingDone
                  ? (lang === "korean" ? "다음" : lang === "spanish" ? "Siguiente" : lang === "indonesian" ? "Lanjut" : "Next")
                  : (lang === "korean" ? "전체 보기" : lang === "spanish" ? "Mostrar todo" : lang === "indonesian" ? "Tampilkan semua" : "Show all")}
              </Text>
              {typingDone && <BlinkingArrow color={C.gold} />}
            </View>
          </Pressable>
        )}

        {/* DIALOGUE SCENE */}
        {item.kind === "scene" && !item.isNarration && (
          <View style={styles.sceneContainer}>
            <Animated.View
              style={[
                styles.characterArea,
                character.side === "left" ? styles.characterAreaLeft : styles.characterAreaRight,
                {
                  opacity: characterEntryOpacity,
                  transform: [
                    { translateX: characterEntryX },
                    { translateY: characterFloatY },
                    { scale: characterEntryScale },
                  ],
                },
              ]}
            >
              {character.isLingo ? (
                <Animated.Image
                  source={activePortrait ?? rudyStoryImg}
                  style={[styles.rudyStoryChar, compactStoryLayout && styles.rudyStoryCharCompact, styles.stageCharacterShadow]}
                  resizeMode="contain"
                />
              ) : activePortrait ? (
                <View style={[styles.stagePortraitWrap, compactStoryLayout && styles.stagePortraitWrapCompact, { shadowColor: story.accentColor }]}>
                  <Image
                    source={activePortrait}
                    style={styles.characterPortrait}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <>
                  <View style={[styles.avatarOuter, { shadowColor: story.accentColor }]}>
                    <View style={[styles.avatarInner, { backgroundColor: character.avatarBg }]}>
                      <EmojiText style={styles.avatarEmoji}>{character.emoji}</EmojiText>
                    </View>
                    <View style={[styles.avatarRing, { borderColor: story.accentColor }]} />
                  </View>
                </>
              )}
            </Animated.View>

            <Pressable style={styles.dialogueBox} onPress={advance}>
              <View style={styles.speakerTag}>
                {activePortrait || character.isLingo ? (
                  <View style={[styles.speakerMark, { backgroundColor: story.accentColor }]} />
                ) : (
                  <EmojiText style={styles.speakerEmoji}>{character.emoji}</EmojiText>
                )}
                <Text style={styles.speakerName}>{getCharName(character)}</Text>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: dialogueMaxHeight }}>
                <Typewriter
                  ref={typewriterRef}
                  text={getSceneText(item)}
                  speedMs={25}
                  textStyle={styles.dialogueText}
                  onComplete={() => setTypingDone(true)}
                />
              </ScrollView>
              <View style={styles.dotsRow}>
                {seq.slice(0, 5).map((_, i) => (
                  <View key={i} style={[styles.dot, { opacity: i === seqIdx % 5 ? 1 : 0.3 }]} />
                ))}
              </View>
              <View style={[styles.nextBtn, compactStoryLayout && styles.nextBtnCompact]}>
                <Text style={styles.nextBtnText}>
                  {typingDone
                    ? (lang === "korean" ? "다음" : lang === "spanish" ? "Siguiente" : lang === "indonesian" ? "Lanjut" : "Next")
                    : (lang === "korean" ? "전체 보기" : lang === "spanish" ? "Mostrar todo" : lang === "indonesian" ? "Tampilkan semua" : "Show all")}
                </Text>
                {typingDone && <BlinkingArrow color={C.bg1} />}
              </View>
            </Pressable>
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
          const id = lang === "indonesian";
          const headerText = item.pType === "writing-mission"
            ? (ko ? `${(item as any).title?.ko || "말하기 미션"}` : es ? `${(item as any).title?.es || "Misión de habla"}` : id ? `${(item as any).title?.id || (item as any).title?.en || "Misi Berbicara"}` : `${(item as any).title?.en || "Speaking Mission"}`)
            : ko
            ? `퍼즐 ${item.puzzleNum}: 언어 실력을 증명하세요`
            : es
            ? `Puzzle ${item.puzzleNum}: Demuestra tus habilidades lingüísticas`
            : id
            ? `Teka-teki ${item.puzzleNum}: Buktikan kemampuan bahasamu`
            : `Puzzle ${item.puzzleNum}: Prove your language skills`;
          const hasSharedHints = !!item.hints && item.pType !== "cipher" && item.pType !== "fill-blank" && item.pType !== "boss-spell";
          const h1 = item.hints ? resolveHint(item.hints.h1, lang, learningLang) : "";
          const h2 = item.hints ? resolveHint(item.hints.h2, lang, learningLang) : "";
          const h3 = item.hints?.h3 ? resolveHint(item.hints.h3, lang, learningLang) : null;
          const allHints = [h1, h2, h3].filter(Boolean) as string[];
          const totalHints = allHints.length;

          return (
            <>
              <ScrollView scrollEnabled={puzzleScrollEnabled} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 20 }}>
                <View style={styles.puzzleHeaderBanner}>
                  <View style={[styles.storySigil, { borderColor: story.accentColor }]}>
                    <View style={[styles.storySigilCore, { backgroundColor: story.accentColor }]} />
                  </View>
                  <Text style={styles.puzzleHeader}>{headerText}</Text>
                </View>
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
                {item.pType === "boss-spell" && (
                  <BossSpellPuzzle key={seqIdx} puzzle={item} lang={lang} onSolved={handlePuzzleSolved} onResetHints={resetSharedHints} />
                )}
                {item.pType === "word-puzzle" && (
                  <WordPuzzlePuzzle key={seqIdx} puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} onResetHints={resetSharedHints} />
                )}
                {!["word-match","fill-blank","dialogue-choice","sentence-builder","investigation","cipher","listen-choose","pronunciation","writing-mission","boss-spell","word-puzzle","voice-power","debate-battle","npc-rescue"].includes(item.pType) && (
                  <FallbackPuzzle lang={lang} onSolved={handlePuzzleSolved} />
                )}
                {hasSharedHints && (
                  <Pressable
                    style={styles.sharedHintBtn}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSharedHintVisible(true); }}
                  >
                    <View style={styles.sharedHintContent}>
                      <View style={styles.hintSpark} />
                      <Text style={styles.sharedHintBtnText}>
                        {ko ? `힌트 보기 (${sharedHintLevel}/${totalHints})` : es ? `Ver pistas (${sharedHintLevel}/${totalHints})` : id ? `Petunjuk (${sharedHintLevel}/${totalHints})` : `Hints (${sharedHintLevel}/${totalHints})`}
                      </Text>
                    </View>
                  </Pressable>
                )}
              </ScrollView>

              {hasSharedHints && (
                <Modal visible={sharedHintVisible} transparent animationType="fade" onRequestClose={() => setSharedHintVisible(false)}>
                  <Pressable style={styles.hintOverlay} onPress={() => setSharedHintVisible(false)}>
                    <Pressable style={styles.hintNotebook} onPress={() => {}}>
                      <View style={styles.hintNotebookHeader}>
                        <View style={styles.hintNotebookTitleRow}>
                          <View style={styles.notebookSigil} />
                          <Text style={styles.hintNotebookTitle}>{ko ? "수사 노트" : es ? "Cuaderno de Detective" : id ? "Catatan Detektif" : "Detective's Notebook"}</Text>
                        </View>
                        <Pressable onPress={() => setSharedHintVisible(false)} style={styles.hintCloseBtn}>
                          <Text style={styles.hintCloseBtnText}>X</Text>
                        </Pressable>
                      </View>
                      <View style={styles.hintNotebookRule} />
                      {allHints.map((hint, i) => (
                        <View key={i} style={styles.hintRow}>
                          {sharedHintLevel > i ? (
                            <View style={styles.hintUnlocked}>
                              <Text style={styles.hintLabel}>{ko ? `힌트 ${i + 1}` : es ? `Pista ${i + 1}` : id ? `Petunjuk ${i + 1}` : `Hint ${i + 1}`}</Text>
                              <Text style={styles.hintText}>{hint}</Text>
                            </View>
                          ) : sharedHintLevel === i ? (
                            <Pressable style={styles.hintLocked} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setSharedHintLevel(i + 1); }}>
                              <View style={styles.hintLockMark} />
                              <Text style={styles.hintLockedText}>{ko ? `힌트 ${i + 1} 열기` : es ? `Abrir pista ${i + 1}` : id ? `Buka petunjuk ${i + 1}` : `Unlock Hint ${i + 1}`}</Text>
                            </Pressable>
                          ) : (
                            <View style={[styles.hintLocked, { opacity: 0.4 }]}>
                              <View style={styles.hintLockMark} />
                              <Text style={styles.hintLockedText}>{ko ? `힌트 ${i + 1}` : es ? `Pista ${i + 1}` : id ? `Petunjuk ${i + 1}` : `Hint ${i + 1}`}</Text>
                            </View>
                          )}
                        </View>
                      ))}
                      <Text style={styles.hintFooter}>{ko ? "이전 힌트를 먼저 열어야 해요" : es ? "Desbloquea las pistas en orden" : id ? "Buka petunjuk secara berurutan" : "Unlock hints in order"}</Text>
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

  contentArea: {
    flex: 1,
    overflow: "hidden",
  },
  sceneBackdropImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.92,
  },
  sceneBackdropShade: {
    ...StyleSheet.absoluteFillObject,
  },
  sceneBackdropGlow: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },

  /* ── Narration ── */
  narrationArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 28,
    zIndex: 1,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  narrationBtnText: { fontFamily: F.header, fontSize: 14, color: C.gold, letterSpacing: 0.5 },

  /* ── Scene ── */
  sceneContainer: {
    flex: 1,
    justifyContent: "flex-end",
    zIndex: 1,
  },
  characterArea: {
    minHeight: 300,
    justifyContent: "flex-end",
    paddingHorizontal: 18,
    marginBottom: -34,
    zIndex: 1,
  },
  characterAreaLeft: {
    alignItems: "flex-start",
  },
  characterAreaRight: {
    alignItems: "flex-end",
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
    width: 286,
    height: 352,
  },
  rudyStoryCharCompact: {
    width: 238,
    height: 294,
  },
  stageCharacterShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.42,
    shadowRadius: 20,
  },
  portraitCard: {
    width: 206,
    height: 280,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,226,144,0.62)",
    backgroundColor: C.bg2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.56,
    shadowRadius: 26,
    elevation: 8,
  },
  portraitCardCompact: {
    width: 176,
    height: 238,
  },
  characterPortrait: {
    width: "100%",
    height: "100%",
  },
  stagePortraitWrap: {
    width: 276,
    height: 414,
    overflow: "visible",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.36,
    shadowRadius: 28,
    elevation: 9,
  },
  stagePortraitWrapCompact: {
    width: 224,
    height: 336,
  },
  stagePortraitFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 148,
  },
  portraitFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
  },
  portraitRing: {
    top: -2,
    left: -2,
    width: 210,
    height: 284,
    borderRadius: 16,
    opacity: 0.52,
  },
  portraitRingCompact: {
    width: 180,
    height: 242,
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
    fontSize: 15,
    fontFamily: F.header,
    color: "#fff4d0",
    letterSpacing: 0.5,
    textShadowColor: "rgba(255,209,102,0.38)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  dialogueBox: {
    backgroundColor: "rgba(8,8,10,0.82)",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,226,144,0.24)",
    paddingTop: 14,
    paddingHorizontal: 18,
    paddingBottom: 16,
    gap: 10,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 10,
    zIndex: 2,
  },
  speakerTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(65,50,117,0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,226,144,0.22)",
    borderRadius: 2,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: "flex-start",
    minWidth: 112,
  },
  speakerMark: {
    width: 9,
    height: 9,
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
  },
  speakerEmoji: { fontSize: 14 },
  speakerName: { fontSize: 12, fontFamily: F.bodySemi, color: C.parchmentDark },
  dialogueText: {
    fontSize: 17,
    fontFamily: F.body,
    lineHeight: 27,
    color: C.parchment,
  },
  dotsRow: { flexDirection: "row", gap: 5, justifyContent: "center" },
  dot: { height: 5, width: 5, borderRadius: 3, backgroundColor: C.gold },
  nextBtn: {
    backgroundColor: C.gold,
    paddingVertical: 13,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnCompact: {
    paddingVertical: 10,
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
  puzzleHeaderBanner: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  storySigil: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 18,
    justifyContent: "center",
    width: 18,
  },
  storySigilCore: {
    borderRadius: 2,
    height: 7,
    transform: [{ rotate: "45deg" }],
    width: 7,
  },
  puzzleHeader: {
    fontSize: 13,
    fontFamily: F.label,
    color: C.gold,
    textAlign: "center",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    flexShrink: 1,
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
  solvedPortrait: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: C.gold,
    backgroundColor: C.bg1,
  },
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
  completionPortrait: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: C.gold,
    backgroundColor: C.bg1,
  },
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
  cipherLingoPortrait: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: C.gold,
    backgroundColor: C.bg1,
  },
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
  sharedHintContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  hintSpark: {
    backgroundColor: C.gold,
    borderRadius: 2,
    height: 8,
    transform: [{ rotate: "45deg" }],
    width: 8,
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
  hintNotebookTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 1,
    gap: 8,
  },
  notebookSigil: {
    borderColor: C.gold,
    borderRadius: 999,
    borderWidth: 1,
    height: 18,
    width: 18,
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
  hintLockMark: {
    borderColor: C.goldDim,
    borderRadius: 3,
    borderWidth: 1.5,
    height: 16,
    width: 16,
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
