import type { ImageSourcePropType } from "react-native";

import type { IntroTimeline } from "./types";

const SHOT_IMAGES = {
  coordinates: require("@/assets/story/chapter5_motion_comic/ch5_intro_coordinates.png") as ImageSourcePropType,
  towerApproach: require("@/assets/story/chapter5_motion_comic/ch5_intro_tower_approach.png") as ImageSourcePropType,
  gates: require("@/assets/story/chapter5_motion_comic/ch5_intro_gates.png") as ImageSourcePropType,
  rudyAllies: require("@/assets/story/chapter5_motion_comic/ch5_intro_rudy_allies.png") as ImageSourcePropType,
  blackSilhouette: require("@/assets/story/chapter5_motion_comic/ch5_intro_black_silhouette.png") as ImageSourcePropType,
  blackFace: require("@/assets/story/chapter5_motion_comic/ch5_intro_black_face.png") as ImageSourcePropType,
  lullabyJournal: require("@/assets/story/chapter5_motion_comic/ch5_intro_lullaby_journal.png") as ImageSourcePropType,
  rudyDetective: require("@/assets/story/chapter1_motion_comic/ch1_intro_rudy_detective.png") as ImageSourcePropType,
  rudySpirit: require("@/assets/story/chapter5_motion_comic/ch5_intro_rudy_allies.png") as ImageSourcePropType,
};

export const ch5Timeline: IntroTimeline = {
  shots: [
    {
      id: "coordinates",
      durationMs: 7200,
      source: SHOT_IMAGES.coordinates,
      motion: "push",
      cue: "ring",
      overlay: "word",
      overlayCopy: {
        word: {
          english: "BABEL",
          korean: "BABEL",
          spanish: "BABEL",
          indonesian: "BABEL",
        },
      },
      accessibilityLabel: {
        english: "Four city stones project the final Babel coordinates.",
        korean: "네 도시의 돌이 마지막 바벨 좌표를 비춥니다.",
        spanish: "Cuatro piedras de ciudad proyectan las coordenadas finales de Babel.",
        indonesian: "Empat batu kota memproyeksikan koordinat Babel terakhir.",
      },
    },
    {
      id: "tower-approach",
      durationMs: 7000,
      source: SHOT_IMAGES.towerApproach,
      motion: "drift-left",
      cue: "wind",
      accessibilityLabel: {
        english: "The party approaches the modern Babel Tower in the desert.",
        korean: "일행이 사막의 현대적인 바벨 탑에 다가갑니다.",
        spanish: "El grupo se acerca a la moderna Torre de Babel en el desierto.",
        indonesian: "Rombongan mendekati Menara Babel modern di gurun.",
      },
    },
    {
      id: "language-gates",
      durationMs: 7600,
      source: SHOT_IMAGES.gates,
      motion: "pull",
      cue: "open",
      overlay: "word",
      overlayCopy: {
        word: {
          english: "GATES",
          korean: "관문",
          spanish: "PUERTAS",
          indonesian: "GERBANG",
        },
      },
      accessibilityLabel: {
        english: "Five language gates stack upward inside Babel Tower.",
        korean: "바벨 탑 안에서 다섯 언어 관문이 위로 이어집니다.",
        spanish: "Cinco puertas de lenguaje se apilan hacia arriba dentro de la Torre de Babel.",
        indonesian: "Lima gerbang bahasa tersusun ke atas di dalam Menara Babel.",
      },
    },
    {
      id: "rudy-allies",
      durationMs: 7200,
      source: SHOT_IMAGES.rudyAllies,
      motion: "drift-right",
      cue: "chime",
      accessibilityLabel: {
        english: "Spirit Rudy and the allies gather before the final gate.",
        korean: "영혼 모습의 루디와 동료들이 마지막 관문 앞에 모입니다.",
        spanish: "El espíritu Rudy y los aliados se reúnen ante la puerta final.",
        indonesian: "Roh Rudy dan para sekutu berkumpul di depan gerbang terakhir.",
      },
    },
    {
      id: "black-silhouette",
      durationMs: 7800,
      source: SHOT_IMAGES.blackSilhouette,
      motion: "pull",
      cue: "steps",
      overlay: "black",
      accessibilityLabel: {
        english: "Mr Black appears as a full silhouette above the Babel gates.",
        korean: "미스터 블랙이 바벨 관문 위에 완전한 실루엣으로 나타납니다.",
        spanish: "Mr. Black aparece como una silueta completa sobre las puertas de Babel.",
        indonesian: "Mr. Black muncul sebagai siluet penuh di atas gerbang Babel.",
      },
    },
    {
      id: "black-face",
      durationMs: 8200,
      source: SHOT_IMAGES.blackFace,
      motion: "push",
      cue: "sense",
      accessibilityLabel: {
        english: "Mr Black's tired face is finally revealed in the Babel chamber.",
        korean: "바벨 방 안에서 미스터 블랙의 지친 얼굴이 마침내 드러납니다.",
        spanish: "El rostro cansado de Mr. Black se revela por fin en la cámara de Babel.",
        indonesian: "Wajah lelah Mr. Black akhirnya terungkap di ruang Babel.",
      },
    },
    {
      id: "lullaby-journal",
      durationMs: 7600,
      source: SHOT_IMAGES.lullabyJournal,
      motion: "drift-left",
      cue: "drum",
      overlay: "word",
      overlayCopy: {
        word: {
          english: "REMEMBER",
          korean: "기억",
          spanish: "RECUERDA",
          indonesian: "INGAT",
        },
      },
      accessibilityLabel: {
        english: "Ellis's journal and the seven stones carry the Welsh lullaby back into the room.",
        korean: "엘리스의 일지와 일곱 돌이 웨일스 자장가를 방 안으로 되돌립니다.",
        spanish: "El diario de Ellis y las siete piedras devuelven la nana galesa a la habitación.",
        indonesian: "Jurnal Ellis dan tujuh batu membawa lagu nina bobo Wales kembali ke ruangan.",
      },
    },
  ],
  finalDialogue: {
    speaker: "Rudy",
    text: {
      english: "This is where every word we restored has been leading us.",
      korean: "우리가 되찾은 모든 단어가 우리를 여기로 이끌고 있었어요.",
      spanish: "Aquí es adonde nos guiaba cada palabra que restauramos.",
      indonesian: "Di sinilah semua kata yang kita pulihkan membawa kita.",
    },
  },
  villainMessage:
    {
      english:
        "Tell me, Detective.\nWhen you couldn't speak the language,\ndid anyone look at you like you mattered?\n- B",
      korean:
        "말해 보세요, 탐정님.\n당신이 그 언어를 말하지 못했을 때,\n누군가 당신을 중요한 사람처럼 바라봐 준 적이 있습니까?\n- B",
      spanish:
        "Dime, detective.\nCuando no podías hablar el idioma,\n¿alguien te miró como si importaras?\n- B",
      indonesian:
        "Katakan padaku, Detektif.\nSaat kau tidak bisa berbicara bahasa itu,\napakah ada yang menatapmu seolah kau berarti?\n- B",
    },
  portraitImage: SHOT_IMAGES.rudyDetective,
  spiritImage: SHOT_IMAGES.rudySpirit,
  copy: {
    title: "Babel Tower",
    subtitle: {
      korean: "모든 언어가 마지막 문 앞에 모입니다.",
      english: "Every restored word gathers at the final door.",
      spanish: "Cada palabra restaurada llega a la última puerta.",
      indonesian: "Setiap kata yang dipulihkan berkumpul di pintu terakhir.",
    },
    startLabel: {
      english: "Start Babel Tower",
      korean: "바벨 탑 시작",
      spanish: "Comenzar Torre de Babel",
      indonesian: "Mulai Menara Babel",
    },
  },
};
