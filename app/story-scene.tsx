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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { STORY_PROGRESS_KEY, StoryProgress } from "@/app/(tabs)/story";
import { C, F } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

const lingoImg = require("@/assets/lingo.png");

// ── TTS Audio Cache ────────────────────────────────────────────────────────
// Keyed by "text::lang". Sounds are loaded in advance; on press we just replay.
const _ttsCacheNative = new Map<string, Audio.Sound>();
const _ttsCacheWeb    = new Map<string, HTMLAudioElement>();

async function ttsPreload(text: string, lang: string, apiBase: string) {
  const key = `${text}::${lang}`;
  const url = new URL("/api/tts", apiBase);
  url.searchParams.set("text", text);
  url.searchParams.set("lang", lang);
  const urlStr = url.toString();
  if (Platform.OS === "web") {
    if (_ttsCacheWeb.has(key)) return;
    const audio = new (window as any).Audio(urlStr) as HTMLAudioElement;
    audio.preload = "auto";
    audio.load();
    _ttsCacheWeb.set(key, audio);
  } else {
    if (_ttsCacheNative.has(key)) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: urlStr },
        { shouldPlay: false }
      );
      _ttsCacheNative.set(key, sound);
    } catch {}
  }
}

function ttsPlayCached(
  text: string,
  lang: string,
  apiBase: string,
  setPlaying: (v: boolean) => void
) {
  const key = `${text}::${lang}`;
  const url = new URL("/api/tts", apiBase);
  url.searchParams.set("text", text);
  url.searchParams.set("lang", lang);
  const urlStr = url.toString();

  if (Platform.OS === "web") {
    const cached = _ttsCacheWeb.get(key);
    if (cached) {
      cached.currentTime = 0;
      setPlaying(true);
      cached.play().catch(() => {});
      cached.onended = () => setPlaying(false);
      cached.onerror = () => setPlaying(false);
    } else {
      const audio = new (window as any).Audio(urlStr);
      setPlaying(true);
      audio.play().catch(() => {});
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
          await cached.setPositionAsync(0);
          await cached.playAsync();
          cached.setOnPlaybackStatusUpdate((s) => {
            if (s.isLoaded && s.didJustFinish) setPlaying(false);
          });
        } catch { setPlaying(false); }
      })();
    } else {
      setPlaying(true);
      (async () => {
        try {
          const { sound } = await Audio.Sound.createAsync({ uri: urlStr }, { shouldPlay: false });
          _ttsCacheNative.set(key, sound);
          await sound.playAsync();
          sound.setOnPlaybackStatusUpdate((s) => {
            if (s.isLoaded && s.didJustFinish) setPlaying(false);
          });
        } catch { setPlaying(false); }
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
  sentence: Tri;
}
interface WritingMissionQ {
  word: Tri;
  hint?: Tri;
}
interface CipherQ {
  encoded: string;
  answer: Tri;
  shift: number;
  hint: Tri;
  opts: [Tri, Tri, Tri, Tri];
}
interface WordPuzzleQ {
  word: Tri;
  scrambled: Tri;
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
  | { pType: "word-puzzle"; questions: WordPuzzleQ[] };

/* Puzzle hints */
interface PuzzleHints {
  h1: Tri;
  h2: Tri;
  h3?: Tri;
}

/* Sequence items */
type SeqScene = {
  kind: "scene";
  charId: string;
  text: string;
  textKo?: string;
  textEs?: string;
  isNarration?: boolean;
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
type SeqPuzzle = { kind: "puzzle"; puzzleNum: number; hints?: PuzzleHints } & PuzzleType;
type SeqItem = SeqScene | SeqClue | SeqPuzzle;

interface Story {
  id: string;
  title: string;
  titleKo: string;
  titleEs: string;
  gradient: readonly [string, string, string];
  accentColor: string;
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
    characters: [
      {
        id: "lingo",
        emoji: "🦊",
        name: "Detective Lingo",
        nameKo: "링고 탐정",
        side: "left",
        avatarBg: "#2c1810",
        isLingo: true,
      },
      {
        id: "james",
        emoji: "🕵️",
        name: "Detective James",
        nameKo: "제임스 형사",
        side: "left",
        avatarBg: "#1E2A3A",
      },
      {
        id: "victoria",
        emoji: "👩‍💼",
        name: "Lady Victoria",
        nameKo: "빅토리아 부인",
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
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Foggy Victorian London streets… Gas lamps flicker in the mist… A coded letter has arrived at Scotland Yard…)",
        textKo: "(안개 낀 런던 거리… 가스등이 희미하게 빛난다… 스코틀랜드 야드에 수수께끼의 암호 편지가 도착했다…)",
        textEs: "(Las calles victorianas de Londres envueltas en niebla… Las lámparas de gas parpadean… Ha llegado una carta cifrada a Scotland Yard…)",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Apprentice! Welcome to London. I'm Detective Lingo 🦊 — language detective extraordinaire. A mysterious coded letter has arrived. Words are disappearing across the city. This is no ordinary crime.",
        textKo: "견습생! 런던에 온 걸 환영해요. 저는 링고 탐정이에요 🦊 — 언어 전문 탐정. 수수께끼의 암호 편지가 도착했어요. 도시 전체에서 단어들이 사라지고 있어요. 이건 평범한 범죄가 아니에요.",
        textEs: "¡Aprendiz! Bienvenido a Londres. Soy el Detective Lingo 🦊 — detective lingüístico extraordinario. Ha llegado una misteriosa carta cifrada. Las palabras están desapareciendo por toda la ciudad. Este no es un crimen ordinario.",
      },
      {
        kind: "scene",
        charId: "james",
        text: "I'm Detective James. *lights pipe* Three weeks I've been on this case. Someone is altering English words across the city — changing their meanings. I received this coded letter yesterday morning.",
        textKo: "저는 제임스 형사예요. *파이프에 불을 붙이며* 이 사건을 3주째 수사하고 있어요. 누군가가 도시 전체의 영어 단어를 바꾸고 있어요 — 의미를 변형시키면서. 어제 아침 이 암호 편지를 받았습니다.",
        textEs: "Soy el Detective James. *enciende la pipa* Llevo tres semanas en este caso. Alguien está alterando palabras inglesas por toda la ciudad — cambiando sus significados. Recibí esta carta cifrada ayer por la mañana.",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "The letter contains clues written in a foreign language. To decode it, we must prove our linguistic skills first. Apprentice — are you ready for your first language test?",
        textKo: "편지에는 외국어로 쓰인 단서들이 담겨 있어요. 해독하려면 먼저 우리의 언어 실력을 증명해야 해요. 견습생 — 첫 번째 언어 테스트를 시작할 준비가 됐나요?",
        textEs: "La carta contiene pistas escritas en un idioma extranjero. Para descifrarla, debemos demostrar primero nuestras habilidades lingüísticas. Aprendiz — ¿estás listo para tu primera prueba de idioma?",
      },
      {
        kind: "puzzle",
        puzzleNum: 1,
        pType: "word-match",
        questions: [
          {
            word: { en: "mysterious", ko: "불가사의한", es: "misterioso" },
            meaning: { en: "strange and unknown", ko: "이상하고 알 수 없는", es: "extraño y desconocido" },
            wrong: [
              { en: "bright and cheerful", ko: "밝고 명랑한", es: "brillante y alegre" },
              { en: "loud and obvious", ko: "시끄럽고 명백한", es: "ruidoso y obvio" },
              { en: "simple and clear", ko: "단순하고 명확한", es: "simple y claro" },
            ],
          },
          {
            word: { en: "cipher", ko: "암호", es: "cifrado" },
            meaning: { en: "a secret coded message", ko: "비밀 암호 메시지", es: "un mensaje cifrado secreto" },
            wrong: [
              { en: "a type of hat", ko: "모자의 종류", es: "un tipo de sombrero" },
              { en: "a street lamp", ko: "가로등", es: "una farola" },
              { en: "a police badge", ko: "경찰 배지", es: "una placa policial" },
            ],
          },
          {
            word: { en: "evidence", ko: "증거", es: "evidencia" },
            meaning: { en: "proof that something happened", ko: "무언가가 일어났다는 증거", es: "prueba de que algo ocurrió" },
            wrong: [
              { en: "a type of food", ko: "음식의 종류", es: "un tipo de comida" },
              { en: "a foggy day", ko: "안개 낀 날", es: "un día nublado" },
              { en: "a train ticket", ko: "기차표", es: "un boleto de tren" },
            ],
          },
          {
            word: { en: "suspect", ko: "용의자", es: "sospechoso" },
            meaning: { en: "someone thought to be guilty", ko: "범죄자로 의심되는 사람", es: "alguien sospechoso de ser culpable" },
            wrong: [
              { en: "a trusted friend", ko: "믿음직한 친구", es: "un amigo de confianza" },
              { en: "a type of fog", ko: "안개의 종류", es: "un tipo de niebla" },
              { en: "a silver coin", ko: "은화", es: "una moneda de plata" },
            ],
          },
        ],
        hints: {
          h1: { ko: "이 단어들이 어떤 이야기와 분위기에서 나왔는지 상상해봐", en: "Think about what story and atmosphere these words come from", es: "Piensa en qué historia y ambiente aparecen estas palabras" },
          h2: { ko: "모두 탐정 소설에서 나온 단어야 — 사건, 비밀, 수사와 연결돼", en: "All from detective fiction — connected to crimes, secrets, and investigations", es: "Todas vienen de la ficción detectivesca — crímenes, secretos, investigaciones" },
          h3: { ko: "각 단어가 '사람'인지, '물건/개념'인지, '느낌'인지로 나눠봐", en: "Sort each word: is it a 'person', an 'object/concept', or a 'feeling'?", es: "Clasifica cada palabra: ¿es una 'persona', un 'objeto/concepto' o una 'sensación'?" },
        },
      },
      {
        kind: "scene",
        charId: "james",
        text: "Excellent work! The letter mentions a mansion on Kensington — and a symbol we've never seen before. Lady Victoria, the mansion's owner, has requested our help.",
        textKo: "훌륭해요! 편지에는 켄싱턴의 저택이 언급되어 있어요 — 그리고 우리가 본 적 없는 기호가 있어요. 저택의 주인인 빅토리아 부인이 도움을 요청했습니다.",
        textEs: "¡Excelente trabajo! La carta menciona una mansión en Kensington — y un símbolo que nunca hemos visto. Lady Victoria, la dueña de la mansión, ha pedido nuestra ayuda.",
      },
      {
        kind: "scene",
        charId: "victoria",
        text: "Detective James! Thank goodness. Someone broke into my hidden library last night. They left behind only one thing — a strange symbol etched into my desk.",
        textKo: "제임스 형사님! 정말 다행이에요. 어젯밤 누군가가 저의 비밀 도서관에 침입했어요. 남겨진 건 단 하나 — 책상에 새겨진 이상한 기호뿐이에요.",
        textEs: "¡Detective James! Qué alivio. Alguien entró en mi biblioteca secreta anoche. Solo dejaron una cosa — un extraño símbolo grabado en mi escritorio.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(The dark corridors of the mansion… Old oil portraits line the walls… A sense of dread fills the air…)",
        textKo: "(저택의 어두운 복도… 오래된 유화 초상화들이 벽을 채우고 있다… 불길한 기운이 공기를 가득 채운다…)",
        textEs: "(Los oscuros pasillos de la mansión… Viejos retratos al óleo cubren las paredes… Una sensación de temor llena el aire…)",
      },
      {
        kind: "clue",
        symbol: "∆LX",
        titleEn: "Clue Discovered — Symbol ∆LX",
        titleKo: "단서 발견 — 기호 ∆LX",
        titleEs: "Pista Descubierta — Símbolo ∆LX",
        descEn: "A mysterious triangular symbol with the letters L and X. This mark has appeared at every crime scene. What does ∆LX mean?",
        descKo: "L과 X 문자가 있는 수수께끼의 삼각형 기호. 이 표시는 모든 범죄 현장에 나타났다. ∆LX는 무엇을 의미하는가?",
        descEs: "Un misterioso símbolo triangular con las letras L y X. Esta marca ha aparecido en cada escena del crimen. ¿Qué significa ∆LX?",
      },
      {
        kind: "scene",
        charId: "victoria",
        text: "Detective, the intruder also took several books from my collection — all of them were ancient language dictionaries. Why would anyone want those?",
        textKo: "형사님, 침입자는 제 장서에서 책도 몇 권 가져갔어요 — 모두 고대 언어 사전들이었어요. 누가 왜 그것들을 원하는 걸까요?",
        textEs: "Detective, el intruso también tomó varios libros de mi colección — todos eran diccionarios de idiomas antiguos. ¿Por qué alguien querría esos?",
      },
      {
        kind: "puzzle",
        puzzleNum: 2,
        pType: "cipher",
        questions: [
          {
            encoded: "IFMMP",
            answer: { en: "HELLO", ko: "안녕", es: "HOLA" },
            shift: 1,
            hint: { en: "Move each letter one step backward", ko: "각 글자를 한 칸 뒤로 당겨보게", es: "Retrocede cada letra 1 posición" },
            opts: [
              { en: "HELLO", ko: "안녕", es: "HOLA" },
              { en: "WORLD", ko: "세계", es: "MUNDO" },
              { en: "GREAT", ko: "훌륭한", es: "GENIAL" },
              { en: "NEVER", ko: "절대", es: "NUNCA" },
            ],
          },
          {
            encoded: "MJOHP",
            answer: { en: "LINGO", ko: "링고", es: "LINGO" },
            shift: 1,
            hint: { en: "The detective's name — move each letter one step backward", ko: "탐정의 이름 — 각 글자를 한 칸 뒤로 당겨보게", es: "El nombre del detective — retrocede cada letra 1 posición" },
            opts: [
              { en: "BINGO", ko: "빙고", es: "BINGO" },
              { en: "LINGO", ko: "링고", es: "LINGO" },
              { en: "DINGO", ko: "딩고", es: "DINGO" },
              { en: "KINGS", ko: "왕들", es: "REYES" },
            ],
          },
          {
            encoded: "MFYJDPO",
            answer: { en: "LEXICON", ko: "렉시콘", es: "LÉXICO" },
            shift: 1,
            hint: { en: "The secret society's name — move each letter one step backward", ko: "비밀 결사의 이름 — 각 글자를 한 칸 뒤로 당겨보게", es: "El nombre de la sociedad secreta — retrocede cada letra 1 posición" },
            opts: [
              { en: "MISSION", ko: "임무", es: "MISIÓN" },
              { en: "SECTION", ko: "부문", es: "SECCIÓN" },
              { en: "LEXICON", ko: "렉시콘", es: "LÉXICO" },
              { en: "FICTION", ko: "소설", es: "FICCIÓN" },
            ],
          },
        ],
        hints: {
          h1: { ko: "알파벳 순서에서 각 글자의 바로 앞 글자를 찾아보게! 예: B→A", en: "Find the letter right before each one in the alphabet! e.g. B→A", es: "¡Encuentra la letra anterior en el alfabeto! ej: B→A" },
          h2: { ko: "I→H, F→E, M→L, M→L, P→O", en: "I→H, F→E, M→L, M→L, P→O", es: "I→H, F→E, M→L, M→L, P→O" },
        },
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(The hidden library… Dust-covered ancient books… A secret passage is discovered behind the bookshelf…)",
        textKo: "(숨겨진 도서관… 먼지 쌓인 고서들… 책장 뒤에서 비밀 통로가 발견된다…)",
        textEs: "(La biblioteca oculta… Libros antiguos cubiertos de polvo… Se descubre un pasaje secreto detrás de la estantería…)",
      },
      {
        kind: "scene",
        charId: "james",
        text: "There's a hidden room behind this bookcase! And look — more coded writing on the walls. These aren't random symbols. They form a pattern.",
        textKo: "이 책장 뒤에 숨겨진 방이 있어요! 그리고 보세요 — 벽에 더 많은 암호 글씨가 있어요. 이건 무작위 기호가 아니에요. 패턴을 형성하고 있어요.",
        textEs: "¡Hay una habitación oculta detrás de esta estantería! Y mira — hay más escritura cifrada en las paredes. No son símbolos aleatorios. Forman un patrón.",
      },
      {
        kind: "puzzle",
        puzzleNum: 3,
        pType: "listen-choose",
        questions: [
          {
            word: { en: "mysterious", ko: "mysterious", es: "mysterious" },
            opts: [
              { en: "strange and unknown", ko: "이상하고 알 수 없는", es: "extraño y desconocido" },
              { en: "bright and cheerful", ko: "밝고 명랑한", es: "brillante y alegre" },
              { en: "loud and obvious", ko: "시끄럽고 명백한", es: "ruidoso y obvio" },
              { en: "simple and ordinary", ko: "단순하고 평범한", es: "simple y ordinario" },
            ],
            answerIdx: 0,
          },
          {
            word: { en: "evidence", ko: "evidence", es: "evidence" },
            opts: [
              { en: "a type of hat", ko: "모자의 종류", es: "un tipo de sombrero" },
              { en: "proof something happened", ko: "무언가가 일어났다는 증거", es: "prueba de que algo ocurrió" },
              { en: "a foggy day", ko: "안개 낀 날", es: "un día con niebla" },
              { en: "a train ticket", ko: "기차표", es: "un boleto de tren" },
            ],
            answerIdx: 1,
          },
          {
            word: { en: "investigate", ko: "investigate", es: "investigate" },
            opts: [
              { en: "to eat dinner slowly", ko: "천천히 저녁을 먹다", es: "cenar despacio" },
              { en: "to play an instrument", ko: "악기를 연주하다", es: "tocar un instrumento" },
              { en: "to examine carefully", ko: "꼼꼼하게 조사하다", es: "examinar cuidadosamente" },
              { en: "to sleep deeply", ko: "깊이 잠들다", es: "dormir profundamente" },
            ],
            answerIdx: 2,
          },
        ],
        hints: {
          h1: { ko: "🔊 버튼을 눌러서 다시 한번 들어봐", en: "Press 🔊 and listen again", es: "Pulsa 🔊 y escucha de nuevo" },
          h2: { ko: "행동을 나타내는 동사에 집중해봐 — 탐정이 하는 핵심 행동이야", en: "Focus on the action verb — it's the key detective action", es: "Concéntrate en el verbo de acción — es la acción clave del detective" },
          h3: { ko: "매우 꼼꼼하게 '살펴보는' 행동이야 — 대충이 아닌 정밀한 조사를 뜻해", en: "It's the action of looking very carefully — precise inspection, not casual glancing", es: "Es la acción de examinar muy cuidadosamente — inspección precisa, no casual" },
        },
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "How terribly clever of you, Detective Lingo. *steps out of shadow* You've found the library. But can you understand what it means?",
        textKo: "참 영리하시군요, 링고 탐정. *그림자에서 걸어나오며* 도서관을 찾아냈군요. 하지만 그게 무엇을 의미하는지 이해할 수 있을까요?",
        textEs: "Qué inteligente eres, Detective Lingo. *sale de las sombras* Encontraron la biblioteca. Pero, ¿pueden entender lo que significa?",
      },
      {
        kind: "scene",
        charId: "james",
        text: "Stop right there! Who are you? Are you the one who's been stealing language books across London?",
        textKo: "거기 서요! 당신은 누구예요? 런던 전역에서 언어 책들을 훔치는 사람이 당신인가요?",
        textEs: "¡Alto ahí! ¿Quién es usted? ¿Es usted quien ha estado robando libros de idiomas por todo Londres?",
      },
      {
        kind: "puzzle",
        puzzleNum: 4,
        pType: "sentence-builder",
        questions: [
          {
            instruction: { en: "Arrange the words to reveal the clue:", ko: "단어를 배열해서 단서를 밝혀내세요:", es: "Ordena las palabras para revelar la pista:" },
            words: [
              { en: "The", ko: "그", es: "El" },
              { en: "symbol", ko: "기호가", es: "símbolo" },
              { en: "appeared", ko: "나타났다", es: "apareció" },
              { en: "at", ko: "모든", es: "en" },
              { en: "every", ko: "범죄", es: "cada" },
              { en: "crime", ko: "현장에", es: "escena" },
              { en: "scene", ko: "서", es: "del crimen" },
            ],
            answerOrder: [0, 1, 2, 3, 4, 5, 6],
          },
          {
            instruction: { en: "Arrange the words to decode the message:", ko: "단어를 배열해서 메시지를 해독하세요:", es: "Ordena las palabras para descifrar el mensaje:" },
            words: [
              { en: "Language", ko: "언어는", es: "El" },
              { en: "is", ko: "사용되고", es: "lenguaje" },
              { en: "being", ko: "있다", es: "está" },
              { en: "used", ko: "무기로", es: "siendo" },
              { en: "as", ko: "하나의", es: "usado" },
              { en: "a", ko: "도구로", es: "como" },
              { en: "weapon", ko: ".", es: "arma" },
            ],
            answerOrder: [0, 1, 2, 3, 4, 5, 6],
          },
        ],
        hints: {
          h1: { ko: "주어(The)로 시작할 단어를 먼저 찾아봐", en: "Find the word that starts the subject (The)", es: "Encuentra la palabra que inicia el sujeto (The)" },
          h2: { ko: "영어 수동태야: 주어 + was + 동사(과거분사) + 장소", en: "It's passive voice: subject + was + past participle + place", es: "Es voz pasiva: sujeto + was + participio pasado + lugar" },
          h3: { ko: "신비로운 무언가가 어딘가에서 발견됐어 — 누가 한 것이 아닌 수동 형태야", en: "Something mysterious was found somewhere — it happened to it, not by it", es: "Algo misterioso fue encontrado en algún lugar — le ocurrió, no lo hizo" },
        },
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "∆LX — Lexicon. We are everywhere. Every language, every word, every meaning — belongs to us. You've barely scratched the surface, detectives. *vanishes into the fog*",
        textKo: "∆LX — Lexicon. 우리는 어디에나 있어요. 모든 언어, 모든 단어, 모든 의미 — 우리 것이에요. 탐정들, 당신들은 표면만 긁었을 뿐이에요. *안개 속으로 사라진다*",
        textEs: "∆LX — Lexicon. Estamos en todas partes. Cada idioma, cada palabra, cada significado — nos pertenece. Apenas han arañado la superficie, detectives. *desaparece en la niebla*",
      },
      {
        kind: "puzzle",
        puzzleNum: 5,
        pType: "pronunciation",
        questions: [
          {
            sentence: { en: "The mystery of London has been solved.", ko: "런던의 미스터리가 해결되었다.", es: "El misterio de Londres ha sido resuelto." },
          },
          {
            sentence: { en: "Language is our greatest weapon.", ko: "언어는 우리의 가장 큰 무기이다.", es: "El lenguaje es nuestra mayor arma." },
          },
        ],
        hints: {
          h1: { ko: "🎤 버튼을 누르고 자신 있게 말해봐", en: "Press 🎤 and speak confidently", es: "Pulsa 🎤 y habla con confianza" },
          h2: { ko: "긴 단어는 음절로 나눠봐: lan-guage, great-est, weap-on", en: "Break long words into syllables: lan-guage, great-est, weap-on", es: "Divide palabras largas en sílabas: lan-guage, great-est, weap-on" },
          h3: { ko: "속도보다 정확성이 중요해 — 천천히 또박또박 말하면 돼", en: "Accuracy matters more than speed — speak slowly and clearly", es: "La precisión importa más que la velocidad — habla despacio y claro" },
        },
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "The Lexicon Society… They're manipulating languages around the world. Our next lead is Madrid — a dancer named Carlos has disappeared after leaving a cryptic phrase. The Language Conspiracy runs deeper than we imagined.",
        textKo: "Lexicon Society… 그들은 전 세계 언어를 조종하고 있어요. 다음 단서는 마드리드 — 카를로스라는 댄서가 수수께끼 같은 문구를 남기고 사라졌어요. 언어 음모는 우리가 상상한 것보다 더 깊어요.",
        textEs: "La Sociedad Lexicon… Están manipulando idiomas en todo el mundo. Nuestra próxima pista está en Madrid — un bailarín llamado Carlos desapareció después de dejar una frase críptica. La Conspiración del Lenguaje es más profunda de lo que imaginamos.",
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
    characters: [
      {
        id: "lingo",
        emoji: "🦊",
        name: "Detective Lingo",
        nameKo: "링고 탐정",
        side: "left",
        avatarBg: "#2c1810",
        isLingo: true,
      },
      {
        id: "isabella",
        emoji: "💃",
        name: "Isabella",
        nameKo: "이사벨라",
        side: "right",
        avatarBg: "#3A1A0A",
      },
      {
        id: "abuela",
        emoji: "👵",
        name: "Abuela Rosa",
        nameKo: "아부엘라 로사",
        side: "right",
        avatarBg: "#2A0A1A",
      },
      {
        id: "carlos",
        emoji: "🕺",
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
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Backstage of a flamenco theatre in Madrid… The tension in the air is palpable… Passionate music fills the corridors… But one dancer is missing…)",
        textKo: "(마드리드 플라멩코 극장 무대 뒤편… 공기 중의 긴장감이 느껴진다… 열정적인 음악이 복도를 가득 채운다… 그러나 한 댄서가 사라졌다…)",
        textEs: "(Tras bastidores de un teatro flamenco en Madrid… La tensión en el aire es palpable… La música apasionada llena los pasillos… Pero un bailarín ha desaparecido…)",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "¡Buenos días, Apprentice! We've arrived in Madrid. A flamenco dancer named Carlos vanished last night — but before he disappeared, he left behind a mysterious phrase. No one can translate it.",
        textKo: "¡Buenos días, 견습생! 마드리드에 도착했어요. 카를로스라는 플라멩코 댄서가 어젯밤 사라졌어요 — 하지만 사라지기 전에 수수께끼 같은 문구를 남겼어요. 아무도 번역하지 못하고 있어요.",
        textEs: "¡Buenos días, Aprendiz! Hemos llegado a Madrid. Un bailarín de flamenco llamado Carlos desapareció anoche — pero antes de desaparecer, dejó una misteriosa frase. Nadie puede traducirla.",
      },
      {
        kind: "scene",
        charId: "isabella",
        text: "Carlos was my dance partner! *clutches her shawl* Last night, before the show, he pulled me aside. He whispered something in a language I've never heard. Then — he was gone.",
        textKo: "카를로스는 제 댄스 파트너였어요! *숄을 꽉 쥐며* 어젯밤 공연 전에 그가 저를 불러 세웠어요. 제가 한 번도 들어본 적 없는 언어로 속삭였어요. 그러다가 — 사라졌어요.",
        textEs: "¡Carlos era mi compañero de baile! *se aferra a su chal* Anoche, antes del espectáculo, me llamó aparte. Me susurró algo en un idioma que nunca había escuchado. Y luego — desapareció.",
      },
      {
        kind: "scene",
        charId: "abuela",
        text: "¡Ay, pobrecito! Carlos was afraid of something. For weeks he had been receiving strange letters — with a symbol. Like a triangle with letters.",
        textKo: "¡Ay, pobrecito! 카를로스는 뭔가를 두려워하고 있었어요. 몇 주 동안 이상한 편지를 받고 있었거든요 — 기호가 있는 편지를요. 글자가 있는 삼각형 같은 것이요.",
        textEs: "¡Ay, pobrecito! Carlos le tenía miedo a algo. Durante semanas había estado recibiendo cartas extrañas — con un símbolo. Como un triángulo con letras.",
      },
      {
        kind: "puzzle",
        puzzleNum: 1,
        pType: "word-match",
        questions: [
          {
            word: { en: "disappear", ko: "사라지다", es: "desaparecer" },
            meaning: { en: "to vanish without a trace", ko: "흔적도 없이 사라지다", es: "desvanecerse sin dejar rastro" },
            wrong: [
              { en: "to dance on stage", ko: "무대에서 춤추다", es: "bailar en el escenario" },
              { en: "to write a letter", ko: "편지를 쓰다", es: "escribir una carta" },
              { en: "to play music loudly", ko: "음악을 크게 틀다", es: "tocar música fuerte" },
            ],
          },
          {
            word: { en: "theatre", ko: "극장", es: "teatro" },
            meaning: { en: "a building for performances", ko: "공연을 위한 건물", es: "un edificio para espectáculos" },
            wrong: [
              { en: "a type of food", ko: "음식의 종류", es: "un tipo de comida" },
              { en: "a police station", ko: "경찰서", es: "una estación de policía" },
              { en: "a secret room", ko: "비밀 방", es: "una habitación secreta" },
            ],
          },
          {
            word: { en: "whisper", ko: "속삭이다", es: "susurrar" },
            meaning: { en: "to speak very softly and quietly", ko: "매우 조용하고 작은 소리로 말하다", es: "hablar muy suave y silenciosamente" },
            wrong: [
              { en: "to shout loudly", ko: "크게 외치다", es: "gritar en voz alta" },
              { en: "to run away quickly", ko: "빠르게 도망가다", es: "huir rápidamente" },
              { en: "to hide something", ko: "무언가를 숨기다", es: "esconder algo" },
            ],
          },
        ],
        hints: {
          h1: { ko: "단어를 소리 내어 읽어봐 — 발음 자체가 힌트야", en: "Say the word aloud — the sound itself is the clue", es: "Di la palabra en voz alta — el sonido mismo es la pista" },
          h2: { ko: "배우는 언어 단어와 영어가 발음이나 형태가 비슷할 때가 많아 — 모양과 소리를 비교해봐", en: "Target language words often sound or look like English — compare the shapes and sounds", es: "Las palabras del idioma objetivo a menudo se parecen al inglés — compara formas y sonidos" },
          h3: { ko: "이 단어들 중에 인사, 감사, 도움 요청, 실종된 사람, 건물 이름이 각각 하나씩 있어", en: "Among these words: one is a greeting, one is gratitude, one is a request for help, one is about a missing person, one is a building", es: "Entre estas palabras hay: un saludo, gratitud, petición de ayuda, una persona desaparecida, un edificio" },
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
        kind: "clue",
        symbol: "«El lenguaje es poder»",
        titleEn: "Clue — Carlos's Final Words",
        titleKo: "단서 — 카를로스의 마지막 말",
        titleEs: "Pista — Las Últimas Palabras de Carlos",
        descEn: "'El lenguaje es poder' — Language is power. Carlos knew about the Lexicon Society. The same ∆LX symbol connects London and Madrid.",
        descKo: "'El lenguaje es poder' — 언어는 힘이다. 카를로스는 Lexicon Society에 대해 알고 있었다. 런던과 마드리드를 연결하는 동일한 ∆LX 기호.",
        descEs: "'El lenguaje es poder' — El lenguaje es poder. Carlos sabía sobre la Sociedad Lexicon. El mismo símbolo ∆LX conecta Londres y Madrid.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Behind the theatre stage… The smell of costumes and burnt candles… A hidden trapdoor is discovered beneath the floorboards…)",
        textKo: "(극장 무대 뒤편… 의상과 타다 남은 양초 냄새… 마룻바닥 아래에서 숨겨진 덫문이 발견된다…)",
        textEs: "(Tras el escenario del teatro… El olor de los trajes y las velas quemadas… Se descubre una trampilla oculta bajo las tablas del suelo…)",
      },
      {
        kind: "scene",
        charId: "isabella",
        text: "A trapdoor! Carlos must have gone through here. *opens it bravely* There are papers down below — documents covered in language symbols and charts.",
        textKo: "덫문이에요! 카를로스가 여기를 통해 내려갔을 거예요. *용감하게 열며* 아래에 서류들이 있어요 — 언어 기호와 도표로 가득한 문서들이요.",
        textEs: "¡Una trampilla! Carlos debe haber pasado por aquí. *la abre valientemente* Hay papeles abajo — documentos cubiertos de símbolos lingüísticos y gráficos.",
      },
      {
        kind: "puzzle",
        puzzleNum: 2,
        pType: "listen-choose",
        questions: [
          {
            word: { en: "disappear", ko: "사라지다", es: "desaparecer" },
            opts: [
              { en: "to vanish without a trace", ko: "흔적도 없이 사라지다", es: "desvanecerse sin rastro" },
              { en: "to dance on stage", ko: "무대에서 춤추다", es: "bailar en el escenario" },
              { en: "to write a letter", ko: "편지를 쓰다", es: "escribir una carta" },
              { en: "to play loud music", ko: "음악을 크게 틀다", es: "poner música fuerte" },
            ],
            answerIdx: 0,
          },
          {
            word: { en: "whisper", ko: "속삭이다", es: "susurrar" },
            opts: [
              { en: "to shout loudly", ko: "크게 외치다", es: "gritar fuerte" },
              { en: "to run away quickly", ko: "빠르게 도망가다", es: "huir rápido" },
              { en: "to hide something", ko: "무언가를 숨기다", es: "esconder algo" },
              { en: "to speak very softly", ko: "매우 조용히 말하다", es: "hablar muy suave" },
            ],
            answerIdx: 3,
          },
          {
            word: { en: "theatre", ko: "극장", es: "teatro" },
            opts: [
              { en: "a type of food", ko: "음식의 종류", es: "un tipo de comida" },
              { en: "a police station", ko: "경찰서", es: "una estación de policía" },
              { en: "a building for performances", ko: "공연을 위한 건물", es: "un edificio para espectáculos" },
              { en: "a secret room", ko: "비밀 방", es: "una habitación secreta" },
            ],
            answerIdx: 2,
          },
        ],
        hints: {
          h1: { ko: "🔊를 여러 번 눌러봐 — 반복 청취가 최고의 힌트야", en: "Press 🔊 multiple times — repeated listening is the best hint", es: "Pulsa 🔊 varias veces — escuchar repetidamente es la mejor pista" },
          h2: { ko: "문장의 첫 번째 단어에 집중해봐 — 의문사나 장소 표현이 핵심이야", en: "Focus on the first word — the question word or place expression is key", es: "Concéntrate en la primera palabra — la pregunta o expresión de lugar es clave" },
          h3: { ko: "어디에 있는지 묻는 장면이야 — 장소를 나타내는 건물 이름이 들릴 거야", en: "It's a scene asking where something is — listen for the name of a building or place", es: "Es una escena preguntando dónde está algo — escucha el nombre de un edificio o lugar" },
        },
      },
      {
        kind: "puzzle",
        puzzleNum: 3,
        pType: "fill-blank",
        questions: [
          {
            sentence: { en: "Carlos ___ before anyone could stop him.", ko: "카를로스는 아무도 막기 전에 ___했다.", es: "Carlos ___ antes de que nadie pudiera detenerlo." },
            answer: { en: "disappeared", ko: "사라졌다", es: "desapareció" },
            opts: [
              { en: "sang", ko: "노래했다", es: "cantó" },
              { en: "slept", ko: "잠들었다", es: "durmió" },
            ],
          },
          {
            sentence: { en: "The secret ___ was hidden under the stage.", ko: "비밀 ___가 무대 아래에 숨겨져 있었다.", es: "El ___ secreto estaba escondido debajo del escenario." },
            answer: { en: "trapdoor", ko: "덫문", es: "trampilla" },
            opts: [
              { en: "painting", ko: "그림", es: "pintura" },
              { en: "mirror", ko: "거울", es: "espejo" },
            ],
          },
          {
            sentence: { en: "The Lexicon Society wants to ___ all languages.", ko: "Lexicon Society는 모든 언어를 ___하려 한다.", es: "La Sociedad Lexicon quiere ___ todos los idiomas." },
            answer: { en: "control", ko: "통제", es: "controlar" },
            opts: [
              { en: "celebrate", ko: "축하", es: "celebrar" },
              { en: "translate", ko: "번역", es: "traducir" },
            ],
          },
        ],
        hints: {
          h1: { ko: "빈칸 앞뒤 문맥을 보고 자연스러운 단어를 골라봐", en: "Read the context before and after the blank to find a natural fit", es: "Lee el contexto antes y después del espacio para encontrar la palabra natural" },
          h2: { ko: "배우는 언어의 동사는 주어에 따라 형태가 바뀌어 — 문장의 주어가 누구인지 먼저 파악해봐", en: "Verbs in the target language change form by subject — first figure out who the subject is", es: "Los verbos cambian según el sujeto — primero identifica quién es el sujeto de la oración" },
          h3: { ko: "첫 번째 빈칸: Carlos가 어떤 행동을 했길래 아무도 막지 못했을까?", en: "First blank: what action did Carlos take that nobody could stop?", es: "Primer espacio: ¿qué acción realizó Carlos que nadie pudo detener?" },
        },
      },
      {
        kind: "scene",
        charId: "abuela",
        text: "The same ∆LX symbol appeared in my grandfather's old journal. He said — the Lexicon Society has been manipulating language for over 100 years. They are based… in Seoul.",
        textKo: "할아버지의 오래된 일기에도 같은 ∆LX 기호가 나타났어요. 할아버지는 말씀하셨죠 — Lexicon Society는 100년 넘게 언어를 조종해 왔다고. 그들의 본부가… 서울에 있대요.",
        textEs: "El mismo símbolo ∆LX apareció en el viejo diario de mi abuelo. Él dijo — la Sociedad Lexicon ha estado manipulando el lenguaje durante más de 100 años. Tienen su base… en Seúl.",
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "*appears briefly in a shadowed doorway* You are getting closer. But the closer you get, the more dangerous this becomes. Madrid was just the beginning. *disappears*",
        textKo: "*그늘진 문간에 잠깐 나타나며* 점점 가까워지고 있군요. 하지만 더 가까이 다가갈수록 더 위험해져요. 마드리드는 시작에 불과했어요. *사라진다*",
        textEs: "*aparece brevemente en un umbral sombreado* Se están acercando. Pero cuanto más se acercan, más peligroso se vuelve. Madrid fue solo el comienzo. *desaparece*",
      },
      {
        kind: "puzzle",
        puzzleNum: 4,
        pType: "investigation",
        questions: [
          {
            prompt: { en: "Where did Carlos go? Which evidence gives us the strongest clue?", ko: "카를로스는 어디로 갔을까요? 어떤 증거가 가장 강력한 단서를 제공하나요?", es: "¿A dónde fue Carlos? ¿Qué evidencia nos da la pista más fuerte?" },
            clues: [
              { en: "A half-eaten churro left on the dressing table", ko: "화장대에 남겨진 반쯤 먹은 추로스", es: "Un churro a medio comer dejado sobre el tocador" },
              { en: "A flamenco costume with a ∆LX symbol sewn inside", ko: "안쪽에 ∆LX 기호가 박힌 플라멩코 의상", es: "Un traje de flamenco con el símbolo ∆LX cosido en el interior" },
              { en: "An empty water bottle backstage", ko: "무대 뒤의 빈 물병", es: "Una botella de agua vacía tras el escenario" },
              { en: "A broken chair in the corner", ko: "구석에 부서진 의자", es: "Una silla rota en el rincón" },
            ],
            answerIdx: 1,
          },
        ],
        hints: {
          h1: { ko: "나열된 단서들을 꼼꼼히 하나씩 읽어봐", en: "Read each clue carefully one by one", es: "Lee cada pista con cuidado, una por una" },
          h2: { ko: "Lexicon Society와 직접 연결된 증거를 찾아봐 — 그들만의 상징이 있어", en: "Look for evidence that directly links to the Lexicon Society — they have a unique symbol", es: "Busca evidencia que conecte directamente con la Sociedad Lexicon — tienen un símbolo único" },
          h3: { ko: "Carlos가 직접 입거나 사용한 물건 중에 ∆LX 흔적이 있는 게 핵심이야", en: "The key is an item Carlos personally wore or used that bears the ∆LX mark", es: "Lo clave es un objeto que Carlos usaba personalmente y tiene la marca ∆LX" },
        },
      },
      {
        kind: "puzzle",
        puzzleNum: 5,
        pType: "dialogue-choice",
        questions: [
          {
            prompt: { en: "Abuela Rosa has a message for the Lexicon Society. What do you say?", ko: "아부엘라 로사가 Lexicon Society에 전할 말이 있어요. 뭐라고 말할까요?", es: "Abuela Rosa tiene un mensaje para la Sociedad Lexicon. ¿Qué dices?" },
            context: { en: "Abuela Rosa: 'Languages are the soul of a people. You cannot own what belongs to everyone.'", ko: "아부엘라 로사: '언어는 민족의 영혼이에요. 모든 사람에게 속한 것을 소유할 수는 없어요.'", es: "Abuela Rosa: 'Los idiomas son el alma de un pueblo. No puedes poseer lo que pertenece a todos.'" },
            answer: { en: "Exactly. Every language is a treasure that belongs to humanity, not to any group.", ko: "맞아요. 모든 언어는 어떤 집단이 아닌 인류에게 속하는 보물이에요.", es: "Exactamente. Cada idioma es un tesoro que pertenece a la humanidad, no a ningún grupo." },
            wrong: [
              { en: "Let's not discuss philosophy. We need evidence.", ko: "철학 얘기는 그만해요. 증거가 필요해요.", es: "No hablemos de filosofía. Necesitamos evidencia." },
              { en: "The Lexicon Society might have a point about control.", ko: "Lexicon Society가 통제에 대해 일리 있을 수도 있어요.", es: "La Sociedad Lexicon podría tener razón sobre el control." },
            ],
          },
          {
            prompt: { en: "Isabella wants to help stop the Lexicon Society. What do you ask her?", ko: "이사벨라가 Lexicon Society를 막는 것을 돕고 싶어해요. 무엇을 부탁할까요?", es: "Isabella quiere ayudar a detener a la Sociedad Lexicon. ¿Qué le pides?" },
            context: { en: "Isabella: 'I know every corner of this theatre. I can help you find what Carlos hid.'", ko: "이사벨라: '이 극장 구석구석을 알아요. 카를로스가 숨긴 걸 찾는 걸 도와드릴 수 있어요.'", es: "Isabella: 'Conozco cada rincón de este teatro. Puedo ayudarte a encontrar lo que Carlos escondió.'" },
            answer: { en: "Search for anything with the ∆LX symbol — documents, objects, anything he touched.", ko: "∆LX 기호가 있는 모든 것을 찾아주세요 — 문서, 물건, 그가 손댄 모든 것.", es: "Busca cualquier cosa con el símbolo ∆LX — documentos, objetos, cualquier cosa que él tocara." },
            wrong: [
              { en: "Stay safe and don't get involved.", ko: "안전하게 있고 관여하지 마세요.", es: "Mantente segura y no te involucres." },
              { en: "Just ask Carlos where he hid things.", ko: "카를로스에게 어디에 숨겼는지 물어봐요.", es: "Solo pregúntale a Carlos dónde escondió las cosas." },
            ],
          },
        ],
        hints: {
          h1: { ko: "탐정의 입장에서 가장 유용한 선택을 골라봐", en: "Choose the option most useful to a detective", es: "Elige la opción más útil para un detective" },
          h2: { ko: "Isabella가 극장 구석구석을 안다고 했어 — 그 능력을 최대한 활용할 대화를 골라봐", en: "Isabella said she knows every corner of the theatre — pick the response that uses her knowledge best", es: "Isabella dijo que conoce cada rincón del teatro — elige la respuesta que mejor use su conocimiento" },
          h3: { ko: "구체적인 목표를 제시하는 것이 가장 탐정다운 요청이야 — 무엇을 찾아야 하는지 명확히 알려줘", en: "The most detective-like request states a specific goal — tell her clearly what to look for", es: "La solicitud más detectivesca establece un objetivo específico — dile claramente qué buscar" },
        },
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "Carlos was a Lexicon Society informant who tried to escape. They took him to Seoul — to their headquarters. That's our next destination, Apprentice. The truth about the Language Conspiracy awaits!",
        textKo: "카를로스는 탈출하려 했던 Lexicon Society 정보원이었어요. 그들이 서울로, 그들의 본부로 데려갔어요. 그곳이 우리의 다음 목적지예요, 견습생. 언어 음모에 대한 진실이 기다리고 있어요!",
        textEs: "Carlos era un informante de la Sociedad Lexicon que intentó escapar. Lo llevaron a Seúl — a su cuartel general. Ese es nuestro próximo destino, Aprendiz. ¡La verdad sobre la Conspiración del Lenguaje nos espera!",
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
    characters: [
      {
        id: "lingo",
        emoji: "🦊",
        name: "Detective Lingo",
        nameKo: "링고 탐정",
        side: "left",
        avatarBg: "#2c1810",
        isLingo: true,
      },
      {
        id: "junhyuk",
        emoji: "👨‍💼",
        name: "Junhyuk",
        nameKo: "이준혁",
        side: "right",
        avatarBg: "#1A1A3A",
      },
      {
        id: "minji",
        emoji: "👩‍⚕️",
        name: "Minji",
        nameKo: "박민지",
        side: "left",
        avatarBg: "#1A2A1A",
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
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(A gleaming Seoul skyscraper at night… The city glitters like a circuit board… Inside, a man with no memory holds the key to everything…)",
        textKo: "(밤의 빛나는 서울 고층 빌딩… 도시가 회로판처럼 빛난다… 그 안에서, 기억을 잃은 한 남자가 모든 것의 열쇠를 쥐고 있다…)",
        textEs: "(Un rascacielos de Seúl brillando de noche… La ciudad reluce como un tablero de circuitos… Dentro, un hombre sin memoria tiene la clave de todo…)",
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "안녕하세요, Apprentice! We're in Seoul — the heart of the Lexicon Society's operations. A businessman named Junhyuk was found with no memory, carrying documents about language experiments. He holds the final piece of this puzzle.",
        textKo: "안녕하세요, 견습생! 서울에 도착했어요 — Lexicon Society 작전의 핵심. 이준혁이라는 사업가가 기억을 잃은 채 언어 실험에 관한 문서를 들고 발견됐어요. 그가 이 퍼즐의 마지막 조각을 갖고 있어요.",
        textEs: "안녕하세요, Aprendiz! Estamos en Seúl — el corazón de las operaciones de la Sociedad Lexicon. Un empresario llamado Junhyuk fue encontrado sin memoria, llevando documentos sobre experimentos lingüísticos. Él tiene la última pieza del rompecabezas.",
      },
      {
        kind: "scene",
        charId: "junhyuk",
        text: "...당신은 누구입니까? (Who are you?) *stares blankly* I know nothing. My name… I think my name is Junhyuk. But I don't remember anything before this room.",
        textKo: "...당신은 누구입니까? *멍하게 바라보며* 아무것도 몰라요. 제 이름은… 준혁인 것 같아요. 하지만 이 방 이전의 일은 아무것도 기억하지 못해요.",
        textEs: "...당신은 누구입니까? (¿Quién eres?) *mira fijamente sin expresión* No sé nada. Mi nombre… creo que me llamo Junhyuk. Pero no recuerdo nada antes de esta habitación.",
      },
      {
        kind: "scene",
        charId: "minji",
        text: "이 대표님! *rushes in, urgent* Detective Lingo — I'm Dr. Minji Park. Junhyuk is a victim of the Lexicon Society's language experiments. They erased his memory using a coded language-frequency device.",
        textKo: "이 대표님! *급하게 들어오며* 링고 탐정님 — 저는 박민지 박사예요. 준혁 씨는 Lexicon Society의 언어 실험 피해자예요. 그들이 암호화된 언어 주파수 장치를 사용해 그의 기억을 지웠어요.",
        textEs: "이 대표님! *entra urgentemente* Detective Lingo — soy la Dra. Minji Park. Junhyuk es víctima de los experimentos lingüísticos de la Sociedad Lexicon. Borraron su memoria usando un dispositivo de frecuencia lingüística codificada.",
      },
      {
        kind: "puzzle",
        puzzleNum: 1,
        pType: "word-match",
        questions: [
          {
            word: { en: "memory", ko: "기억", es: "memoria" },
            meaning: { en: "the ability to remember things", ko: "사물을 기억하는 능력", es: "la capacidad de recordar cosas" },
            wrong: [
              { en: "a type of building", ko: "건물의 종류", es: "un tipo de edificio" },
              { en: "a secret document", ko: "비밀 문서", es: "un documento secreto" },
              { en: "a musical instrument", ko: "악기", es: "un instrumento musical" },
            ],
          },
          {
            word: { en: "experiment", ko: "실험", es: "experimento" },
            meaning: { en: "a test to discover or prove something", ko: "무언가를 발견하거나 증명하기 위한 테스트", es: "una prueba para descubrir o demostrar algo" },
            wrong: [
              { en: "a type of dance", ko: "춤의 종류", es: "un tipo de baile" },
              { en: "a formal letter", ko: "공식 서한", es: "una carta formal" },
              { en: "a city district", ko: "도시 구역", es: "un distrito de la ciudad" },
            ],
          },
          {
            word: { en: "conspiracy", ko: "음모", es: "conspiración" },
            meaning: { en: "a secret plan by a group to do something harmful", ko: "해로운 일을 하기 위한 집단의 비밀 계획", es: "un plan secreto de un grupo para hacer algo dañino" },
            wrong: [
              { en: "a traditional meal", ko: "전통 음식", es: "una comida tradicional" },
              { en: "a type of music", ko: "음악의 종류", es: "un tipo de música" },
              { en: "a public announcement", ko: "공개 발표", es: "un anuncio público" },
            ],
          },
          {
            word: { en: "frequency", ko: "주파수", es: "frecuencia" },
            meaning: { en: "the rate at which something occurs or vibrates", ko: "무언가가 발생하거나 진동하는 속도", es: "la tasa a la que algo ocurre o vibra" },
            wrong: [
              { en: "a long corridor", ko: "긴 복도", es: "un largo corredor" },
              { en: "a lost memory", ko: "잃어버린 기억", es: "una memoria perdida" },
              { en: "a secret society", ko: "비밀 결사", es: "una sociedad secreta" },
            ],
          },
        ],
        hints: {
          h1: { ko: "단어를 소리 내어 읽어봐 — 음절 하나하나가 힌트야", en: "Say the word aloud — each syllable is a clue", es: "Di la palabra en voz alta — cada sílaba es una pista" },
          h2: { ko: "서울 챕터 단어들은 과학 연구와 음모에 관한 말이야 — 전파, 기억, 주파수, 지우기와 연결돼", en: "Seoul chapter words relate to scientific research and conspiracy — frequency, memory, erase, network", es: "Las palabras del capítulo Seúl se relacionan con investigación científica y conspiración" },
          h3: { ko: "각 단어가 이야기 속에서 어떤 역할을 하는지 생각해봐 — 사건과 연구, 두 가지 측면이야", en: "Think about what role each word plays in the story — there are two aspects: the incident and the research", es: "Piensa en qué papel juega cada palabra — hay dos aspectos: el incidente y la investigación" },
        },
      },
      {
        kind: "scene",
        charId: "junhyuk",
        text: "Wait… *picks up a document* I remember writing this. These are language research files. I was investigating the Lexicon Society before they… before they took my memories.",
        textKo: "잠깐만요… *문서를 집어들며* 이걸 제가 썼던 게 기억나요. 언어 연구 파일들이에요. 저는 Lexicon Society가… 제 기억을 빼앗기 전에 그들을 조사하고 있었어요.",
        textEs: "Espera… *recoge un documento* Recuerdo haber escrito esto. Son archivos de investigación lingüística. Estaba investigando a la Sociedad Lexicon antes de que… antes de que me quitaran los recuerdos.",
      },
      {
        kind: "scene",
        charId: "minji",
        text: "These documents are extraordinary. Junhyuk mapped the entire Lexicon Society network — their leaders, their labs, and their ultimate plan. They intend to launch 'Project Erase' — deleting all world languages and replacing them with one.",
        textKo: "이 문서들은 놀라워요. 준혁 씨가 Lexicon Society 전체 네트워크를 매핑했어요 — 그들의 지도자들, 연구소들, 그리고 궁극적인 계획을. 그들은 '이레이즈 프로젝트'를 실행하려 해요 — 전 세계 언어를 삭제하고 하나로 대체하려는 것이에요.",
        textEs: "Estos documentos son extraordinarios. Junhyuk mapeó toda la red de la Sociedad Lexicon — sus líderes, sus laboratorios y su plan definitivo. Tienen la intención de lanzar el 'Proyecto Borrado' — eliminar todos los idiomas del mundo y reemplazarlos por uno.",
      },
      {
        kind: "scene",
        charId: "lingo",
        isNarration: true,
        text: "(Language research documents spread across the table… The words 'PROJECT ERASE — LEXICON SOCIETY' are stamped in red… The truth is terrifying…)",
        textKo: "(언어 연구 문서들이 테이블에 펼쳐진다… '이레이즈 프로젝트 — LEXICON SOCIETY'라는 글자가 빨간색으로 찍혀 있다… 진실은 끔찍하다…)",
        textEs: "(Documentos de investigación lingüística extendidos sobre la mesa… Las palabras 'PROYECTO BORRADO — SOCIEDAD LEXICON' están selladas en rojo… La verdad es aterradora…)",
      },
      {
        kind: "clue",
        symbol: "PROJECT ERASE",
        titleEn: "Clue — Lexicon Society Files",
        titleKo: "단서 — Lexicon Society 파일",
        titleEs: "Pista — Archivos de la Sociedad Lexicon",
        descEn: "Project Erase: The Lexicon Society's plan to delete all world languages. They believe controlling language means controlling thought itself. Mr. Black leads the operation.",
        descKo: "이레이즈 프로젝트: Lexicon Society의 전 세계 언어 삭제 계획. 그들은 언어를 통제하면 생각 자체를 통제할 수 있다고 믿는다. 미스터 블랙이 작전을 이끌고 있다.",
        descEs: "Proyecto Borrado: El plan de la Sociedad Lexicon para eliminar todos los idiomas del mundo. Creen que controlar el lenguaje significa controlar el pensamiento mismo. Mr. Black lidera la operación.",
      },
      {
        kind: "puzzle",
        puzzleNum: 2,
        pType: "dialogue-choice",
        questions: [
          {
            prompt: { en: "Junhyuk suddenly remembers something important. What does he say?", ko: "준혁 씨가 갑자기 중요한 것을 기억해냈어요. 뭐라고 말할까요?", es: "Junhyuk recuerda de repente algo importante. ¿Qué dice?" },
            context: { en: "Junhyuk: *trembling* 'I remember the password to unlock their entire database. But speaking it aloud will alert them.'", ko: "준혁: *떨며* '그들의 전체 데이터베이스를 잠금 해제하는 비밀번호가 기억나요. 하지만 크게 말하면 그들이 알아챌 거예요.'", es: "Junhyuk: *temblando* 'Recuerdo la contraseña para desbloquear toda su base de datos. Pero decirla en voz alta les alertará.'" },
            answer: { en: "Write it down. We must be careful — they may be listening.", ko: "적어주세요. 조심해야 해요 — 그들이 듣고 있을 수도 있어요.", es: "Escríbelo. Debemos ser cuidadosos — puede que estén escuchando." },
            wrong: [
              { en: "Just shout it out! We don't have time to be careful.", ko: "그냥 크게 말해요! 조심할 시간이 없어요.", es: "¡Dilo en voz alta! No tenemos tiempo para ser cuidadosos." },
              { en: "Never mind the password. Let's look for another way.", ko: "비밀번호는 신경 쓰지 마요. 다른 방법을 찾아봐요.", es: "Olvida la contraseña. Busquemos otra manera." },
            ],
          },
          {
            prompt: { en: "Minji discovers the Society's next target. What do you do?", ko: "민지가 협회의 다음 목표를 발견했어요. 어떻게 할까요?", es: "Minji descubre el próximo objetivo de la Sociedad. ¿Qué haces?" },
            context: { en: "Minji: 'The next Project Erase launch site is here — in Seoul. If we don't stop it within 24 hours, 3,000 words will vanish from the Korean language forever.'", ko: "민지: '다음 이레이즈 프로젝트 발사 장소는 여기 서울이에요. 24시간 안에 막지 못하면 한국어에서 3,000개의 단어가 영원히 사라져요.'", es: "Minji: 'El próximo sitio de lanzamiento del Proyecto Borrado está aquí — en Seúl. Si no lo detenemos en 24 horas, 3,000 palabras desaparecerán del coreano para siempre.'" },
            answer: { en: "We must contact authorities and stop the launch. Every word matters.", ko: "당국에 연락해서 발사를 막아야 해요. 모든 단어가 중요해요.", es: "Debemos contactar a las autoridades y detener el lanzamiento. Cada palabra importa." },
            wrong: [
              { en: "3,000 words isn't that many. We might be overreacting.", ko: "3,000개의 단어는 그렇게 많지 않아요. 과잉 반응일 수도 있어요.", es: "3,000 palabras no son tantas. Podríamos estar exagerando." },
              { en: "Let's rest first and plan tomorrow.", ko: "먼저 쉬고 내일 계획을 세워요.", es: "Descansemos primero y planifiquemos mañana." },
            ],
          },
        ],
        hints: {
          h1: { ko: "24시간 안에 막아야 해 — 어떻게 반응할지 신중하게 골라봐", en: "You have 24 hours to stop it — choose your response carefully", es: "Tienes 24 horas para detenerlo — elige tu respuesta con cuidado" },
          h2: { ko: "탐정은 정보를 수집하고 즉시 행동해 — 두 가지를 동시에 해야 해", en: "A detective gathers information AND acts immediately — both are needed", es: "Un detective recoge información Y actúa de inmediato — ambas cosas son necesarias" },
          h3: { ko: "3,000개의 단어가 사라진다면 어떻게 될까? 그 심각성에 맞는 적극적인 반응을 골라봐", en: "What happens if 3,000 words disappear? Choose the response that matches the seriousness", es: "¿Qué pasa si desaparecen 3,000 palabras? Elige una respuesta acorde a la gravedad" },
        },
      },
      {
        kind: "puzzle",
        puzzleNum: 3,
        pType: "sentence-builder",
        questions: [
          {
            instruction: { en: "Arrange the words to decode Junhyuk's message:", ko: "단어를 배열해서 준혁의 메시지를 해독하세요:", es: "Ordena las palabras para descifrar el mensaje de Junhyuk:" },
            words: [
              { en: "language", ko: "언어는", es: "el" },
              { en: "is", ko: "이다", es: "lenguaje" },
              { en: "the", ko: "것은", es: "es" },
              { en: "key", ko: "열쇠", es: "la" },
              { en: "to", ko: "에", es: "clave" },
              { en: "freedom", ko: "자유", es: "de la libertad" },
            ],
            answerOrder: [0, 1, 2, 3, 4, 5],
          },
        ],
        hints: {
          h1: { ko: "주어(Language)로 시작해봐", en: "Start with the subject (Language)", es: "Empieza con el sujeto (Language)" },
          h2: { ko: "Language + is + ??? + to + freedom — 'to freedom'와 연결되는 핵심 단어를 찾아봐", en: "Language + is + ??? + to + freedom — find the core word that links with 'to freedom'", es: "Language + is + ??? + to + freedom — encuentra la palabra clave que conecta con 'to freedom'" },
          h3: { ko: "자유에 이르는 '수단'을 나타내는 단어야 — 잠긴 문을 여는 물건을 생각해봐", en: "It's a word meaning a 'means' to reach freedom — think of the object that opens a locked door", es: "Es una palabra que significa un 'medio' para alcanzar la libertad — piensa en el objeto que abre una puerta" },
        },
      },
      {
        kind: "scene",
        charId: "mr_black",
        text: "*walks in calmly* Impressive detective work. But it's too late. Project Erase launches in hours. *adjusts cufflinks with ∆LX logo* Language was never meant to be free. It's a tool — and tools must be controlled.",
        textKo: "*침착하게 들어오며* 인상적인 탐정 활동이군요. 하지만 이미 늦었어요. 이레이즈 프로젝트가 몇 시간 안에 실행돼요. *∆LX 로고가 있는 커프스단추를 조정하며* 언어는 원래 자유롭게 두는 게 아니에요. 도구예요 — 그리고 도구는 통제되어야 해요.",
        textEs: "*entra con calma* Impresionante trabajo detectivesco. Pero es demasiado tarde. El Proyecto Borrado se lanza en horas. *ajusta los gemelos con el logo ∆LX* El lenguaje nunca fue pensado para ser libre. Es una herramienta — y las herramientas deben controlarse.",
      },
      {
        kind: "scene",
        charId: "junhyuk",
        text: "You're wrong, Mr. Black. Language is not a tool — it's a living thing. Every word carries generations of human thought. You can't own it. *stands up, remembering who he is* And I remember everything now.",
        textKo: "틀렸어요, 미스터 블랙. 언어는 도구가 아니에요 — 살아있는 것이에요. 모든 단어에는 수 세대의 인간 사상이 담겨 있어요. 당신은 그걸 소유할 수 없어요. *일어서며, 자신이 누구인지 기억하며* 그리고 저는 이제 모든 것을 기억해요.",
        textEs: "Está equivocado, Mr. Black. El lenguaje no es una herramienta — es un ser vivo. Cada palabra lleva generaciones de pensamiento humano. No puedes poseerlo. *se levanta, recordando quién es* Y yo ahora lo recuerdo todo.",
      },
      {
        kind: "puzzle",
        puzzleNum: 4,
        pType: "investigation",
        questions: [
          {
            prompt: { en: "To stop Project Erase, which evidence do you submit to the authorities?", ko: "이레이즈 프로젝트를 막기 위해 당국에 어떤 증거를 제출하나요?", es: "Para detener el Proyecto Borrado, ¿qué evidencia presentas a las autoridades?" },
            clues: [
              { en: "A photo of Mr. Black entering the building lobby", ko: "미스터 블랙이 빌딩 로비에 들어가는 사진", es: "Una foto de Mr. Black entrando al vestíbulo del edificio" },
              { en: "Junhyuk's complete research files proving the Project Erase conspiracy", ko: "이레이즈 프로젝트 음모를 증명하는 준혁의 완전한 연구 파일", es: "Los archivos de investigación completos de Junhyuk que prueban la conspiración del Proyecto Borrado" },
              { en: "An empty coffee cup from the lab", ko: "연구실의 빈 커피 컵", es: "Una taza de café vacía del laboratorio" },
              { en: "A business card with the Lexicon Society logo", ko: "Lexicon Society 로고가 있는 명함", es: "Una tarjeta de visita con el logo de la Sociedad Lexicon" },
            ],
            answerIdx: 1,
          },
        ],
        hints: {
          h1: { ko: "당국에 제출할 가장 강력한 증거를 골라봐", en: "Choose the strongest evidence to submit to the authorities", es: "Elige la evidencia más sólida para presentar a las autoridades" },
          h2: { ko: "이레이즈 프로젝트의 존재를 '증명'할 수 있는 자료가 필요해 — 상징이나 사진만으로는 부족해", en: "You need material that can prove the existence of Project Erase — symbols or photos alone aren't enough", es: "Necesitas material que pruebe la existencia del Proyecto Borrado — solo símbolos o fotos no son suficientes" },
          h3: { ko: "이 사건을 직접 연구한 사람이 남긴 기록이 있어 — 그 기록이 가장 완전한 증거야", en: "There's a record left by the person who directly researched this case — that record is the most complete evidence", es: "Hay un registro dejado por quien investigó directamente este caso — ese registro es la evidencia más completa" },
        },
      },
      {
        kind: "scene",
        charId: "lingo",
        text: "We've done it, Apprentice! The authorities have the evidence. Project Erase is stopped. Mr. Black is in custody. But this is not over — the Language Conspiracy runs deeper still. The world's languages are safe… for now. Our mission continues!",
        textKo: "해냈어요, 견습생! 당국이 증거를 확보했어요. 이레이즈 프로젝트가 중단됐어요. 미스터 블랙이 구금됐어요. 하지만 아직 끝나지 않았어요 — 언어 음모는 더 깊이 뻗어 있어요. 세계의 언어들이 안전해요… 지금은. 우리의 임무는 계속돼요!",
        textEs: "¡Lo logramos, Aprendiz! Las autoridades tienen la evidencia. El Proyecto Borrado está detenido. Mr. Black está bajo custodia. Pero esto no ha terminado — la Conspiración del Lenguaje es aún más profunda. Los idiomas del mundo están a salvo… por ahora. ¡Nuestra misión continúa!",
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
  } catch {}
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

function WordMatchPuzzle({ puzzle, lang, learningLang, onSolved }: {
  puzzle: { pType: "word-match"; questions: WordMatchQ[] };
  lang: string; learningLang: string; onSolved: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

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
        if (idx < puzzle.questions.length - 1) { setIdx((i) => i + 1); setSelected(null); }
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

function FillBlankPuzzle({ puzzle, lang, learningLang, onSolved }: {
  puzzle: { pType: "fill-blank"; questions: FillBlankQ[] };
  lang: string; learningLang: string; onSolved: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [solved, setSolved] = useState(false);

  const q = puzzle.questions[idx];
  const answer = tri(q.answer, learningLang);
  const [options] = useState(() =>
    puzzle.questions.map((qq) => shuffle([tri(qq.answer, learningLang), ...qq.opts.map((o) => tri(o, learningLang))]))
  );

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

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <Text style={styles.puzzleNum}>🧩 PUZZLE {idx + 1}/{puzzle.questions.length}</Text>
        <Text style={styles.puzzleType}>{lang === "korean" ? "빈칸 채우기" : lang === "spanish" ? "Completar espacios" : "Fill in the Blank"}</Text>
      </View>
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>{lang === "korean" ? "빈칸에 알맞은 단어는?" : lang === "spanish" ? "¿Qué palabra completa la frase?" : "Which word fills the blank?"}</Text>
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

function DialogueChoicePuzzle({ puzzle, lang, onSolved }: {
  puzzle: { pType: "dialogue-choice"; questions: DialogueChoiceQ[] };
  lang: string; onSolved: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [solved, setSolved] = useState(false);

  const q = puzzle.questions[idx];
  const answer = tri(q.answer, lang);
  const [options] = useState(() =>
    puzzle.questions.map((qq) => shuffle([tri(qq.answer, lang), ...qq.wrong.map((w) => tri(w, lang))]))
  );

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

function SentenceBuilderPuzzle({ puzzle, lang, learningLang, onSolved }: {
  puzzle: { pType: "sentence-builder"; questions: SentenceBuilderQ[] };
  lang: string; learningLang: string; onSolved: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [solved, setSolved] = useState(false);

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
    if (idx < puzzle.questions.length - 1) { setIdx((i) => i + 1); setPlaced([]); setConfirmed(false); setIsCorrect(false); }
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

function InvestigationPuzzle({ puzzle, lang, onSolved }: {
  puzzle: { pType: "investigation"; questions: InvestigationQ[] };
  lang: string; onSolved: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [solved, setSolved] = useState(false);

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
    if (idx < puzzle.questions.length - 1) { setIdx((i) => i + 1); setSelected(null); setConfirmed(false); }
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
              <Text style={styles.clueCardText}>{tri(clue, lang)}</Text>
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

function CipherPuzzle({ puzzle, lang, onSolved }: {
  puzzle: { pType: "cipher"; questions: CipherQ[] };
  lang: string; onSolved: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [solved, setSolved] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [unlockedHints, setUnlockedHints] = useState(0);

  const q = puzzle.questions[idx];
  const correctAnswer = lang === "korean" ? q.answer.ko : lang === "spanish" ? q.answer.es : q.answer.en;
  const correctAnswerEn = q.answer.en;
  const correctAnswerNative = lang === "korean" ? q.answer.ko : lang === "spanish" ? q.answer.es : q.answer.en;
  const hintText = lang === "korean" ? q.hint.ko : lang === "spanish" ? q.hint.es : q.hint.en;

  const [shuffledOpts] = useState(() =>
    puzzle.questions.map((qq) => {
      const opts = qq.opts.map((o) => lang === "korean" ? o.ko : lang === "spanish" ? o.es : o.en);
      return shuffle(opts);
    })
  );

  // Build letter-by-letter decode breakdown: "I→H, F→E, M→L, M→L, P→O"
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

  const breakdown = buildBreakdown(q.encoded, q.shift);

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
    } else {
      setSolved(true);
    }
  }

  // Progressive hints — generated from puzzle data
  function getHints() {
    const firstLetter = q.encoded[0];
    const decodedFirst = String.fromCharCode(
      ((firstLetter.charCodeAt(0) - 65 - q.shift + 26) % 26) + 65
    );
    const ko = lang === "korean";
    const es = lang === "spanish";
    return [
      ko ? "각 글자를 알파벳에서 한 칸 앞 글자로 바꿔보세요."
        : es ? "Cambia cada letra por la que está una posición antes en el alfabeto."
        : "Replace each letter with the one that comes one step before it in the alphabet.",
      ko ? `예: ${firstLetter} → ${decodedFirst}`
        : es ? `Ejemplo: ${firstLetter} → ${decodedFirst}`
        : `Example: ${firstLetter} → ${decodedFirst}`,
      ko ? `정답은 ${q.answer.en} 입니다.`
        : es ? `La respuesta es ${q.answer.en}.`
        : `The answer is ${q.answer.en}.`,
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
                {ko ? "흠… 뭔가 조금 다른 것 같군요, 견습생." : es ? "Hmm… algo no está bien, aprendiz." : "Hmm… something's not quite right, apprentice."}
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
              {ko ? "훌륭하군요, 견습생! 암호를 완벽히 해독했어요." : es ? "¡Brillante, aprendiz! Has descifrado el código perfectamente." : "Brilliant, apprentice! You've decoded the cipher perfectly."}
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
            <Text style={{ color: C.gold }}>{correctAnswerEn}</Text>
            {lang !== "english" ? ` (${correctAnswerNative})` : ""}
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
            {lang === "korean" ? "이 암호를 해독해보게, 견습생!" : lang === "spanish" ? "¡Descifra este código, aprendiz!" : "Decode this cipher, apprentice!"}
          </Text>
        </View>
      </View>

      {/* Puzzle card — cipher text + clue only */}
      <View style={styles.cipherWordCard}>
        <Text style={styles.cipherCardLabel}>
          {lang === "korean" ? "암호" : lang === "spanish" ? "Cifrado" : "Cipher"}
        </Text>
        <Text style={styles.cipherEncoded}>{q.encoded}</Text>
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

/* ─────────────────── LISTEN-CHOOSE PUZZLE ─────────────────── */

function ListenChoosePuzzle({ puzzle, lang, learningLang, onSolved }: {
  puzzle: { pType: "listen-choose"; questions: ListenChooseQ[] };
  lang: string; learningLang: string; onSolved: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [solved, setSolved] = useState(false);
  const apiBase = getApiUrl();

  const q = puzzle.questions[idx];
  const wordText = q.word.en;
  const correctAnswer = lang === "korean" ? q.opts[q.answerIdx].ko : lang === "spanish" ? q.opts[q.answerIdx].es : q.opts[q.answerIdx].en;

  const [shuffledOpts] = useState(() =>
    puzzle.questions.map((qq) => {
      const opts = qq.opts.map((o) => lang === "korean" ? o.ko : lang === "spanish" ? o.es : o.en);
      return shuffle(opts);
    })
  );

  // Preload audio for every word in this puzzle as soon as it mounts
  useEffect(() => {
    puzzle.questions.forEach((qq) => ttsPreload(qq.word.en, learningLang, apiBase));
  }, []);

  function playWord() {
    if (playing) return;
    ttsPlayCached(wordText, learningLang, apiBase, setPlaying);
  }

  function handleSelect(opt: string) {
    if (selected) return;
    setSelected(opt);
    const isCorrect = opt === correctAnswer;
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        if (idx < puzzle.questions.length - 1) { setIdx((i) => i + 1); setSelected(null); }
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
        <Text style={styles.puzzleNum}>🎧 {lang === "korean" ? "듣고 고르기" : lang === "spanish" ? "Escuchar y elegir" : "Listen & Choose"}</Text>
        <Text style={styles.puzzleType}>{idx + 1}/{puzzle.questions.length}</Text>
      </View>
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>
          {lang === "korean" ? "이 단어의 뜻은?" : lang === "spanish" ? "¿Qué significa esta palabra?" : "What does this word mean?"}
        </Text>
        <Pressable style={styles.listenWordRow} onPress={playWord}>
          <Text style={styles.puzzleWordMain}>{wordText}</Text>
          <View style={[styles.listenWordBtn, playing && { opacity: 0.6 }]}>
            <Ionicons name={playing ? "volume-medium" : "volume-high-outline"} size={22} color={C.bg1} />
          </View>
        </Pressable>
      </View>
      <View style={styles.puzzleOptions}>
        {shuffledOpts[idx].map((opt, i) => {
          const isSelected = selected === opt;
          const isCorrect = opt === correctAnswer;
          let bg = C.bg2; let borderColor = C.border;
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

/* ─────────────────── PRONUNCIATION PUZZLE ─────────────────── */

function PronunciationPuzzle({ puzzle, lang, learningLang, onSolved }: {
  puzzle: { pType: "pronunciation"; questions: PronunciationQ[] };
  lang: string; learningLang: string; onSolved: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [recording, setRecording] = useState(false);
  const [feedback, setFeedback] = useState<"good" | "retry" | null>(null);
  const [solved, setSolved] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const apiBase = getApiUrl();

  const q = puzzle.questions[idx];

  // Sentence shown is in the language being LEARNED (not the UI language)
  const sentenceText =
    learningLang === "korean" ? q.sentence.ko
    : learningLang === "spanish" ? q.sentence.es
    : q.sentence.en;

  // Preload audio for the current sentence whenever it changes
  useEffect(() => {
    ttsPreload(sentenceText, learningLang, apiBase);
  }, [sentenceText]);

  // Map learningLang → Azure/Web Speech locale code
  function getLangCode(): string {
    if (learningLang === "korean") return "ko-KR";
    if (learningLang === "spanish") return "es-ES";
    if (learningLang === "french") return "fr-FR";
    if (learningLang === "japanese") return "ja-JP";
    if (learningLang === "chinese") return "zh-CN";
    return "en-US";
  }

  // Fuzzy match: what fraction of target words appear in transcript
  function matchScore(target: string, transcript: string): number {
    const normalize = (s: string) => s.toLowerCase().replace(/[^\w가-힣]/g, " ").trim();
    const tWords = normalize(target).split(/\s+/).filter(Boolean);
    const tr = normalize(transcript);
    if (!tWords.length || !tr) return 0;
    const hits = tWords.filter(w => tr.includes(w)).length;
    return hits / tWords.length;
  }

  // ── Play TTS (instant from cache) ──
  function playAudio() {
    if (playing) return;
    ttsPlayCached(sentenceText, learningLang, apiBase, setPlaying);
  }

  // ── Microphone: record + compare ──
  function handleMic() {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  function startRecording() {
    setFeedback(null);
    setRecording(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (Platform.OS === "web") {
      // Use Web Speech API — synchronous start inside the tap
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) { setRecording(false); setFeedback("retry"); return; }
      const recognition = new SR();
      recognition.lang = getLangCode();
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript as string;
        setRecording(false);
        const score = matchScore(sentenceText, transcript);
        setFeedback(score >= 0.5 ? "good" : "retry");
        if (score >= 0.5) {
          setTimeout(() => advanceNext(), 1500);
        }
      };
      recognition.onerror = () => { setRecording(false); setFeedback("retry"); };
      recognition.onend = () => setRecording(false);
      recognition.start();
    } else {
      // Native: record with expo-av
      (async () => {
        try {
          await Audio.requestPermissionsAsync();
          await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
          const { recording: rec } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
          );
          recordingRef.current = rec;
        } catch { setRecording(false); }
      })();
    }
  }

  function stopRecording() {
    if (Platform.OS !== "web") {
      (async () => {
        try {
          if (!recordingRef.current) { setRecording(false); return; }
          await recordingRef.current.stopAndUnloadAsync();
          await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
          const uri = recordingRef.current.getURI();
          recordingRef.current = null;
          setRecording(false);
          if (!uri) { setFeedback("retry"); return; }

          // Read as base64 and send to Azure STT
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: "base64" as any,
          });
          const apiUrl = new URL("/api/stt", getApiUrl());
          const res = await fetch(apiUrl.toString(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio: base64, mimeType: "audio/m4a", language: getLangCode() }),
          });
          const data = await res.json();
          const transcript: string = data.text ?? "";
          const score = matchScore(sentenceText, transcript);
          setFeedback(score >= 0.5 ? "good" : "retry");
          if (score >= 0.5) setTimeout(() => advanceNext(), 1500);
        } catch { setRecording(false); setFeedback("retry"); }
      })();
    } else {
      setRecording(false);
    }
  }

  function advanceNext() {
    setFeedback(null);
    if (idx < puzzle.questions.length - 1) {
      setIdx((i) => i + 1);
    } else {
      setSolved(true);
    }
  }

  const ko = lang === "korean";
  const es = lang === "spanish";

  if (solved) return <PuzzleSolvedBadge onNext={onSolved} lang={lang} />;

  return (
    <View style={styles.puzzleBox}>
      <View style={styles.puzzleHeaderRow}>
        <Text style={styles.puzzleNum}>🎤 {ko ? "발음 따라하기" : es ? "Pronuncia esta frase" : "Pronunciation Practice"}</Text>
        <Text style={styles.puzzleType}>{idx + 1}/{puzzle.questions.length}</Text>
      </View>

      {/* Sentence card — shown in the TARGET learning language */}
      <View style={styles.puzzleWordCard}>
        <Text style={styles.puzzleWordLabel}>
          {ko ? "이 문장을 소리 내어 읽어보세요!" : es ? "¡Lee esta frase en voz alta!" : "Read this sentence aloud!"}
        </Text>
        <Text style={styles.puzzleSentence}>{sentenceText}</Text>
      </View>

      {/* Two action buttons: Listen + Mic */}
      <View style={styles.pronBtnRow}>
        {/* Listen / TTS */}
        <Pressable
          style={[styles.pronBtn, playing && { opacity: 0.7 }]}
          onPress={playAudio}
          disabled={playing}
        >
          <Ionicons name={playing ? "volume-medium" : "volume-high-outline"} size={22} color={C.bg1} />
          <Text style={styles.pronBtnText}>
            {playing
              ? (ko ? "재생 중" : es ? "Reproduciendo" : "Playing…")
              : (ko ? "듣기" : es ? "Escuchar" : "Listen")}
          </Text>
        </Pressable>

        {/* Microphone / Record */}
        <Pressable
          style={[styles.pronBtn, styles.pronMicBtn, recording && styles.pronMicRecording]}
          onPress={handleMic}
        >
          <Ionicons name={recording ? "stop-circle" : "mic"} size={22} color={recording ? "#fff" : C.bg1} />
          <Text style={[styles.pronBtnText, recording && { color: "#fff" }]}>
            {recording
              ? (ko ? "중지" : es ? "Detener" : "Stop")
              : (ko ? "따라하기" : es ? "Repetir" : "Speak")}
          </Text>
        </Pressable>
      </View>

      {/* Feedback */}
      {feedback === "good" && (
        <View style={styles.pronFeedbackGood}>
          <Text style={styles.pronFeedbackText}>
            ✨ {ko ? "좋아요! 잘 하셨어요." : es ? "¡Muy bien!" : "Great job!"}
          </Text>
        </View>
      )}
      {feedback === "retry" && (
        <View style={styles.pronFeedbackRetry}>
          <Text style={styles.pronFeedbackText}>
            🔄 {ko ? "다시 한번 해보세요." : es ? "Inténtalo de nuevo." : "Try once more."}
          </Text>
          <Pressable style={styles.pronSkipBtn} onPress={advanceNext}>
            <Text style={styles.pronSkipText}>
              {ko ? "그냥 넘어가기 →" : es ? "Continuar →" : "Skip →"}
            </Text>
          </Pressable>
        </View>
      )}

      {!feedback && !recording && (
        <Text style={styles.pronunciationHint}>
          {ko ? "👆 듣고 따라 읽어보세요" : es ? "👆 Escucha y repite" : "👆 Listen, then tap Speak to practise"}
        </Text>
      )}
      {recording && (
        <Text style={styles.pronunciationHint}>
          🎙️ {ko ? "말하는 중… 다 하면 중지를 누르세요" : es ? "Hablando… pulsa Detener" : "Listening… tap Stop when done"}
        </Text>
      )}
    </View>
  );
}

/* ─────────────────── WRITING MISSION PUZZLE ─────────────────── */

function WritingMissionPuzzle({ puzzle, lang, learningLang, onSolved }: {
  puzzle: { pType: "writing-mission"; questions: WritingMissionQ[] };
  lang: string; learningLang: string; onSolved: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [solved, setSolved] = useState(false);

  const q = puzzle.questions[idx];
  const targetWord = q.word.en;
  const displayWord = lang === "korean" ? q.word.ko : lang === "spanish" ? q.word.es : q.word.en;
  const hintText = q.hint ? (lang === "korean" ? q.hint.ko : lang === "spanish" ? q.hint.es : q.hint.en) : null;

  function handleConfirm() {
    if (!answer.trim()) return;
    const correct = answer.trim().toLowerCase() === targetWord.toLowerCase();
    setIsCorrect(correct);
    setConfirmed(true);
    if (correct) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  function handleNext() {
    if (idx < puzzle.questions.length - 1) { setIdx((i) => i + 1); setAnswer(""); setConfirmed(false); setIsCorrect(false); }
    else setSolved(true);
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
          {lang === "korean" ? `'${displayWord}'을(를) 영어로 써보세요` : lang === "spanish" ? `Escribe '${displayWord}' en inglés` : `Type this word in the target language`}
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
        autoCapitalize="characters"
        autoCorrect={false}
      />
      {confirmed && (
        <View style={[styles.writingResult, { backgroundColor: isCorrect ? "rgba(90,170,90,0.15)" : "rgba(200,70,70,0.15)" }]}>
          <Text style={{ fontFamily: F.bodySemi, fontSize: 14, color: isCorrect ? "#5a9" : "#e55" }}>
            {isCorrect
              ? (lang === "korean" ? "🎉 정답이에요!" : lang === "spanish" ? "🎉 ¡Correcto!" : "🎉 Correct!")
              : (lang === "korean" ? `정답: ${targetWord}` : lang === "spanish" ? `Respuesta: ${targetWord}` : `Answer: ${targetWord}`)}
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

function WordPuzzlePuzzle({ puzzle, lang, learningLang, onSolved }: {
  puzzle: { pType: "word-puzzle"; questions: WordPuzzleQ[] };
  lang: string; learningLang: string; onSolved: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [tapped, setTapped] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);

  const q = puzzle.questions[idx];
  const scrambledText = lang === "korean" ? q.scrambled.ko : lang === "spanish" ? q.scrambled.es : q.scrambled.en;
  const correctWord = lang === "korean" ? q.word.ko : lang === "spanish" ? q.word.es : q.word.en;
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
        if (idx < puzzle.questions.length - 1) { setIdx((n) => n + 1); setTapped([]); }
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
      } catch {}
    }

    startBGM();

    const sub = AppState.addEventListener("change", (state) => {
      if (!bgmRef.current) return;
      if (state === "active") { bgmRef.current.playAsync().catch(() => {}); }
      else { bgmRef.current.pauseAsync().catch(() => {}); }
    });

    return () => {
      mounted = false;
      sub.remove();
      if (bgmRef.current) {
        bgmRef.current.stopAsync().catch(() => {});
        bgmRef.current.unloadAsync().catch(() => {});
        bgmRef.current = null;
      }
    };
  }, []);

  const seq = story.sequence;
  const totalScenes = seq.filter((s) => s.kind === "scene").length;
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
    try { await updateStats({ xp: earned }); } catch {}
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handlePuzzleSolved() {
    try { updateStats({ xp: 20 }); } catch {}
    advance();
  }

  const item = seq[seqIdx];
  const progress = seq.length > 0 ? (seqIdx / seq.length) * 100 : 0;
  const character = item.kind === "scene"
    ? story.characters.find((c) => c.id === item.charId) ?? story.characters[0]
    : story.characters[0];

  function getSceneText(it: SeqScene) {
    if (lang === "korean" && it.textKo) return it.textKo;
    if (lang === "spanish" && it.textEs) return it.textEs;
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
          if (bgmRef.current) {
            bgmRef.current.stopAsync().catch(() => {});
            bgmRef.current.unloadAsync().catch(() => {});
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
              <View style={[styles.avatarOuter, { shadowColor: story.accentColor }]}>
                <View style={[styles.avatarInner, { backgroundColor: character.avatarBg }]}>
                  {character.isLingo ? (
                    <Image
                      source={lingoImg}
                      style={styles.lingoAvatar}
                    />
                  ) : (
                    <Text style={styles.avatarEmoji}>{character.emoji}</Text>
                  )}
                </View>
                <View style={[styles.avatarRing, { borderColor: story.accentColor }]} />
              </View>
              <Text style={styles.charName}>{getCharName(character)}</Text>
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
          const headerText = ko
            ? `🧩 퍼즐 ${item.puzzleNum} — 언어 실력을 증명하세요!`
            : es
            ? `🧩 Puzzle ${item.puzzleNum} — ¡Demuestra tus habilidades lingüísticas!`
            : `🧩 Puzzle ${item.puzzleNum} — Prove your language skills!`;
          const hasSharedHints = !!item.hints && item.pType !== "cipher";
          const tri_ = (t: Tri) => ko ? t.ko : es ? t.es : t.en;
          const h1 = item.hints ? tri_(item.hints.h1) : "";
          const h2 = item.hints ? tri_(item.hints.h2) : "";
          const h3 = item.hints?.h3 ? tri_(item.hints.h3) : null;
          const allHints = [h1, h2, h3].filter(Boolean) as string[];
          const totalHints = allHints.length;

          return (
            <>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 20 }}>
                <Text style={styles.puzzleHeader}>{headerText}</Text>
                {item.pType === "word-match" && (
                  <WordMatchPuzzle puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} />
                )}
                {item.pType === "fill-blank" && (
                  <FillBlankPuzzle puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} />
                )}
                {item.pType === "dialogue-choice" && (
                  <DialogueChoicePuzzle puzzle={item} lang={lang} onSolved={handlePuzzleSolved} />
                )}
                {item.pType === "sentence-builder" && (
                  <SentenceBuilderPuzzle puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} />
                )}
                {item.pType === "investigation" && (
                  <InvestigationPuzzle puzzle={item} lang={lang} onSolved={handlePuzzleSolved} />
                )}
                {item.pType === "cipher" && (
                  <CipherPuzzle puzzle={item} lang={lang} onSolved={handlePuzzleSolved} />
                )}
                {item.pType === "listen-choose" && (
                  <ListenChoosePuzzle puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} />
                )}
                {item.pType === "pronunciation" && (
                  <PronunciationPuzzle puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} />
                )}
                {item.pType === "writing-mission" && (
                  <WritingMissionPuzzle puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} />
                )}
                {item.pType === "word-puzzle" && (
                  <WordPuzzlePuzzle puzzle={item} lang={lang} learningLang={learningLang} onSolved={handlePuzzleSolved} />
                )}
                {!["word-match","fill-blank","dialogue-choice","sentence-builder","investigation","cipher","listen-choose","pronunciation","writing-mission","word-puzzle"].includes(item.pType) && (
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
    resizeMode: "contain",
    ...(Platform.OS === "web" ? ({ mixBlendMode: "multiply" } as any) : {}),
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
