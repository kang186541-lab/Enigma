import type { ImageSourcePropType } from "react-native";

import type { IntroTimeline } from "./types";

const SHOT_IMAGES = {
  phone: require("@/assets/story/chapter2_motion_comic/ch2_intro_phone.png") as ImageSourcePropType,
  colorRestore: require("@/assets/story/chapter2_motion_comic/ch2_intro_color_restore.png") as ImageSourcePropType,
  carlosCall: require("@/assets/story/chapter2_motion_comic/ch2_intro_carlos_call.png") as ImageSourcePropType,
  rudyFestival: require("@/assets/story/chapter2_motion_comic/ch2_intro_rudy_festival.png") as ImageSourcePropType,
  rudyReact: require("@/assets/story/chapter2_motion_comic/ch2_intro_rudy_react.png") as ImageSourcePropType,
  blackBroadcast: require("@/assets/story/chapter2_motion_comic/ch2_intro_black_broadcast.png") as ImageSourcePropType,
  colorRecall: require("@/assets/story/chapter2_motion_comic/ch2_intro_color_recall.png") as ImageSourcePropType,
  rudyDetective: require("@/assets/story/chapter1_motion_comic/ch1_intro_rudy_detective.png") as ImageSourcePropType,
};

export const ch2Timeline: IntroTimeline = {
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
            "The plaza is losing color.",
            "The color is gone.",
          ],
          korean: [
            "광장에서 색이 사라지고 있어요.",
            "색이 전부 사라졌어요.",
          ],
          spanish: [
            "La plaza está perdiendo color.",
            "El color ha desaparecido.",
          ],
          indonesian: [
            "Plaza itu kehilangan warna.",
            "Warnanya sudah hilang.",
          ],
        },
      },
      accessibilityLabel: {
        english: "Madrid plaza colors drain from a phone screen.",
        korean: "휴대폰 화면 속 마드리드 광장에서 색이 빠져나갑니다.",
        spanish: "Los colores de la plaza de Madrid se vacían desde la pantalla del teléfono.",
        indonesian: "Warna plaza Madrid memudar dari layar ponsel.",
      },
    },
    {
      id: "color-restore",
      durationMs: 7000,
      source: SHOT_IMAGES.colorRestore,
      motion: "drift-left",
      cue: "open",
      overlay: "color-restore",
      accessibilityLabel: {
        english: "A red festival flag returns to a colorless plaza.",
        korean: "색이 사라진 광장에 붉은 축제 깃발이 돌아옵니다.",
        spanish: "Una bandera roja de festival vuelve a una plaza sin color.",
        indonesian: "Bendera festival merah kembali ke plaza tanpa warna.",
      },
    },
    {
      id: "carlos-call",
      durationMs: 8200,
      source: SHOT_IMAGES.carlosCall,
      motion: "push",
      cue: "gasp",
      overlay: "carlos-call",
      overlayCopy: {
        word: {
          english: "HELP",
          korean: "도와줘",
          spanish: "AYUDA",
          indonesian: "TOLONG",
        },
      },
      accessibilityLabel: {
        english: "Isabel's phone replays Carlos's last call.",
        korean: "이사벨의 휴대폰이 카를로스의 마지막 통화를 재생합니다.",
        spanish: "El teléfono de Isabel reproduce la última llamada de Carlos.",
        indonesian: "Ponsel Isabel memutar ulang panggilan terakhir Carlos.",
      },
    },
    {
      id: "rudy-festival",
      durationMs: 7200,
      source: SHOT_IMAGES.rudyFestival,
      motion: "drift-right",
      cue: "guitar",
      accessibilityLabel: {
        english: "Rudy hovers over a colorless Madrid festival stage.",
        korean: "루디가 색을 잃은 마드리드 축제 무대 위를 떠다닙니다.",
        spanish: "Rudy flota sobre un escenario de festival madrileño sin color.",
        indonesian: "Rudy melayang di atas panggung festival Madrid yang kehilangan warna.",
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
        english: "Rudy senses a familiar threat from the plaza speakers.",
        korean: "루디가 광장 스피커에서 익숙한 위협을 감지합니다.",
        spanish: "Rudy percibe una amenaza familiar desde los altavoces de la plaza.",
        indonesian: "Rudy merasakan ancaman yang familier dari pengeras suara plaza.",
      },
    },
    {
      id: "black-broadcast",
      durationMs: 7800,
      source: SHOT_IMAGES.blackBroadcast,
      motion: "pull",
      cue: "wind",
      overlay: "black",
      accessibilityLabel: {
        english: "Mr Black's voice echoes over Madrid plaza speakers.",
        korean: "미스터 블랙의 목소리가 마드리드 광장 스피커에 울립니다.",
        spanish: "La voz de Mr. Black resuena en los altavoces de la plaza de Madrid.",
        indonesian: "Suara Mr. Black bergema dari pengeras suara plaza Madrid.",
      },
    },
    {
      id: "color-recall",
      durationMs: 7000,
      source: SHOT_IMAGES.colorRecall,
      motion: "push",
      cue: "chime",
      accessibilityLabel: {
        english: "Rudy remembers the first returning color.",
        korean: "루디가 처음 돌아온 색을 기억합니다.",
        spanish: "Rudy recuerda el primer color que volvió.",
        indonesian: "Rudy mengingat warna pertama yang kembali.",
      },
    },
  ],
  finalDialogue: {
    speaker: "Rudy",
    text: {
      english: "I knew that voice. He was here, but only in sound.",
      korean: "저 목소리를 알아요. 그는 여기에 있었지만, 소리로만 남아 있었어요.",
      spanish: "Conocía esa voz. Estuvo aquí, pero solo como sonido.",
      indonesian: "Aku mengenal suara itu. Dia ada di sini, tapi hanya sebagai suara.",
    },
  },
  villainMessage: {
    english: "What you call accent, I call distance.\nBridges don't ask the river to stay narrow.\n- B",
    korean: "당신이 억양이라 부르는 것을, 나는 거리라 부릅니다.\n다리는 강에게 좁게 남으라고 요구하지 않죠.\n- B",
    spanish: "A lo que llamas acento, yo lo llamo distancia.\nLos puentes no le piden al río que siga estrecho.\n- B",
    indonesian: "Yang kau sebut aksen, kusebut jarak.\nJembatan tidak meminta sungai tetap sempit.\n- B",
  },
  portraitImage: SHOT_IMAGES.rudyDetective,
  spiritImage: SHOT_IMAGES.rudyFestival,
  copy: {
    title: "Madrid Festival",
    subtitle: {
      korean: "색이 사라지는 축제.",
      english: "The festival where color disappears.",
      spanish: "El festival donde desaparece el color.",
      indonesian: "Festival tempat warna menghilang.",
    },
    startLabel: {
      english: "Start Madrid Festival",
      korean: "마드리드 축제 시작",
      spanish: "Comenzar Festival de Madrid",
      indonesian: "Mulai Festival Madrid",
    },
  },
};
