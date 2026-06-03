import type { ImageSourcePropType } from "react-native";

import type { IntroTimeline } from "./types";

const SHOT_IMAGES = {
  phone: require("@/assets/story/chapter3_motion_comic/ch3_intro_phone.png") as ImageSourcePropType,
  subwayRestore: require("@/assets/story/chapter3_motion_comic/ch3_intro_subway_restore.png") as ImageSourcePropType,
  sujinLab: require("@/assets/story/chapter3_motion_comic/ch3_intro_sujin_lab.png") as ImageSourcePropType,
  rudyPalace: require("@/assets/story/chapter3_motion_comic/ch3_intro_rudy_palace.png") as ImageSourcePropType,
  rudyReact: require("@/assets/story/chapter3_motion_comic/ch3_intro_rudy_react.png") as ImageSourcePropType,
  blackIntercept: require("@/assets/story/chapter3_motion_comic/ch3_intro_black_intercept.png") as ImageSourcePropType,
  cairoRecord: require("@/assets/story/chapter3_motion_comic/ch3_intro_cairo_record.png") as ImageSourcePropType,
  rudyDetective: require("@/assets/story/chapter1_motion_comic/ch1_intro_rudy_detective.png") as ImageSourcePropType,
};

export const ch3Timeline: IntroTimeline = {
  shots: [
    {
      id: "phone",
      durationMs: 7200,
      source: SHOT_IMAGES.phone,
      motion: "push",
      cue: "ring",
      overlay: "phone",
      overlayCopy: {
        phoneLines: {
          english: [
            "No signal. No translator.",
            "the order of words is already...",
          ],
          korean: [
            "신호도 없고, 번역기도 없어요.",
            "단어의 순서가 이미...",
          ],
          spanish: [
            "Sin señal. Sin traductor.",
            "el orden de las palabras ya está...",
          ],
          indonesian: [
            "Tidak ada sinyal. Tidak ada penerjemah.",
            "urutan kata-katanya sudah...",
          ],
        },
      },
      accessibilityLabel: {
        english: "A dead phone in Incheon airport leaks golden language particles.",
        korean: "인천공항의 꺼진 휴대폰에서 황금빛 언어 입자가 새어 나옵니다.",
        spanish: "Un teléfono apagado en el aeropuerto de Incheon filtra partículas doradas de lenguaje.",
        indonesian: "Ponsel mati di bandara Incheon memancarkan partikel bahasa berwarna emas.",
      },
    },
    {
      id: "subway-restore",
      durationMs: 7000,
      source: SHOT_IMAGES.subwayRestore,
      motion: "drift-left",
      cue: "open",
      overlay: "korean-word",
      overlayCopy: {
        word: {
          english: "EXIT",
          korean: "출구",
          spanish: "SALIDA",
          indonesian: "KELUAR",
        },
      },
      accessibilityLabel: {
        english: "A Seoul subway sign restores with golden Korean word light.",
        korean: "서울 지하철 표지판이 황금빛 한국어 단어의 빛으로 복원됩니다.",
        spanish: "Un letrero del metro de Seúl se restaura con luz dorada de palabras coreanas.",
        indonesian: "Papan subway Seoul pulih dengan cahaya kata Korea berwarna emas.",
      },
    },
    {
      id: "sujin-lab",
      durationMs: 8200,
      source: SHOT_IMAGES.sujinLab,
      motion: "push",
      cue: "chime",
      overlay: "korean-word",
      overlayCopy: {
        word: {
          english: "ORDER",
          korean: "순서",
          spanish: "ORDEN",
          indonesian: "URUTAN",
        },
      },
      accessibilityLabel: {
        english: "Sujin studies broken sentence order in her linguistics lab.",
        korean: "수진이 언어학 연구실에서 무너진 문장 순서를 연구합니다.",
        spanish: "Sujin estudia el orden roto de las frases en su laboratorio de lingüística.",
        indonesian: "Sujin meneliti urutan kalimat yang rusak di laboratorium linguistiknya.",
      },
    },
    {
      id: "rudy-palace",
      durationMs: 7200,
      source: SHOT_IMAGES.rudyPalace,
      motion: "drift-right",
      cue: "chime",
      accessibilityLabel: {
        english: "Rudy hovers above a dissolving Gyeongbokgung palace gate.",
        korean: "루디가 녹아내리는 경복궁 문 위를 떠다닙니다.",
        spanish: "Rudy flota sobre una puerta de Gyeongbokgung que se disuelve.",
        indonesian: "Rudy melayang di atas gerbang Gyeongbokgung yang memudar.",
      },
    },
    {
      id: "rudy-react",
      durationMs: 4500,
      source: SHOT_IMAGES.rudyReact,
      motion: "drift-left",
      cue: "sense",
      overlay: "festival-threat",
      accessibilityLabel: {
        english: "Rudy senses a familiar cold signal above the palace.",
        korean: "루디가 궁 위에서 익숙한 차가운 신호를 감지합니다.",
        spanish: "Rudy percibe una señal fría y familiar sobre el palacio.",
        indonesian: "Rudy merasakan sinyal dingin yang familier di atas istana.",
      },
    },
    {
      id: "black-intercept",
      durationMs: 7800,
      source: SHOT_IMAGES.blackIntercept,
      motion: "pull",
      cue: "wind",
      overlay: "black",
      accessibilityLabel: {
        english: "Mr Black's voice is intercepted through a radio receiver.",
        korean: "라디오 수신기를 통해 미스터 블랙의 목소리가 포착됩니다.",
        spanish: "La voz de Mr. Black es interceptada por un receptor de radio.",
        indonesian: "Suara Mr. Black tertangkap melalui penerima radio.",
      },
    },
    {
      id: "cairo-record",
      durationMs: 7000,
      source: SHOT_IMAGES.cairoRecord,
      motion: "push",
      cue: "drum",
      accessibilityLabel: {
        english: "An old record and sealed note point from Seoul toward Cairo.",
        korean: "오래된 기록과 봉인된 쪽지가 서울에서 카이로를 가리킵니다.",
        spanish: "Un viejo registro y una nota sellada apuntan de Seúl hacia El Cairo.",
        indonesian: "Catatan tua dan pesan tersegel menunjuk dari Seoul menuju Kairo.",
      },
    },
  ],
  finalDialogue: {
    speaker: "Rudy",
    text: {
      english: "Seoul is not losing words one by one. It is losing the order that lets them belong together.",
      korean: "서울은 단어를 하나씩 잃는 게 아니에요. 단어들이 함께 있을 수 있게 해 주는 순서를 잃고 있어요.",
      spanish: "Seúl no está perdiendo palabras una por una. Está perdiendo el orden que las mantiene unidas.",
      indonesian: "Seoul tidak kehilangan kata satu per satu. Seoul kehilangan urutan yang membuat kata-kata itu menyatu.",
    },
  },
  villainMessage: {
    english: "Translation isn't theft.\nMisunderstanding is.\n- B",
    korean: "번역은 도둑질이 아닙니다.\n오해가 도둑질이죠.\n- B",
    spanish: "Traducir no es robar.\nMalentender sí lo es.\n- B",
    indonesian: "Terjemahan bukan pencurian.\nKesalahpahamanlah pencuriannya.\n- B",
  },
  portraitImage: SHOT_IMAGES.rudyDetective,
  spiritImage: SHOT_IMAGES.rudyPalace,
  copy: {
    title: "Seoul Order",
    subtitle: {
      korean: "문장의 순서가 무너지는 도시.",
      english: "The city where sentence order begins to fall.",
      spanish: "La ciudad donde empieza a caer el orden de las frases.",
      indonesian: "Kota tempat urutan kalimat mulai runtuh.",
    },
    startLabel: {
      english: "Start Seoul Order",
      korean: "서울의 순서 시작",
      spanish: "Comenzar Orden de Seúl",
      indonesian: "Mulai Urutan Seoul",
    },
  },
};
