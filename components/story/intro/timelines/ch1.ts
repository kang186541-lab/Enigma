import type { ImageSourcePropType } from "react-native";

import type { IntroTimeline } from "./types";

const SHOT_IMAGES = {
  phone: require("@/assets/story/chapter1_motion_comic/ch1_intro_phone.png") as ImageSourcePropType,
  open: require("@/assets/story/chapter1_motion_comic/ch1_intro_open.png") as ImageSourcePropType,
  ellis: require("@/assets/story/chapter1_motion_comic/ch1_intro_ellis.png") as ImageSourcePropType,
  rudySpirit: require("@/assets/story/chapter1_motion_comic/ch1_intro_rudy_spirit.png") as ImageSourcePropType,
  rudyReaction: require("@/assets/story/chapter1_motion_comic/ch1_intro_rudy_reaction.png") as ImageSourcePropType,
  black: require("@/assets/story/chapter1_motion_comic/ch1_intro_black_cctv.png") as ImageSourcePropType,
  rudyDetective: require("@/assets/story/chapter1_motion_comic/ch1_intro_rudy_detective.png") as ImageSourcePropType,
};

export const ch1Timeline: IntroTimeline = {
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
            "Detective. I need... I can't...",
            "if you're reading this, the words are already...",
          ],
          korean: [
            "탐정님. 도움이 필요해요... 말이...",
            "이 메시지를 읽고 있다면 단어들이 이미...",
          ],
          spanish: [
            "Detective. Necesito... no puedo...",
            "si lees esto, las palabras ya están...",
          ],
          indonesian: [
            "Detektif. Aku butuh... aku tidak bisa...",
            "kalau kamu membaca ini, kata-katanya sudah...",
          ],
        },
      },
      accessibilityLabel: {
        english: "A phone message loses its words in the dark.",
        korean: "어둠 속에서 휴대폰 메시지의 단어들이 사라집니다.",
        spanish: "Un mensaje de teléfono pierde sus palabras en la oscuridad.",
        indonesian: "Pesan ponsel kehilangan kata-katanya dalam gelap.",
      },
    },
    {
      id: "open",
      durationMs: 7000,
      source: SHOT_IMAGES.open,
      motion: "drift-left",
      cue: "open",
      overlay: "open",
      accessibilityLabel: {
        english: "A London cafe sign restores with golden language light.",
        korean: "런던 카페 간판이 황금빛 언어의 빛으로 복원됩니다.",
        spanish: "Un letrero de café en Londres se restaura con luz dorada de lenguaje.",
        indonesian: "Papan kafe London pulih dengan cahaya bahasa berwarna emas.",
      },
    },
    {
      id: "ellis",
      durationMs: 8200,
      source: SHOT_IMAGES.ellis,
      motion: "push",
      cue: "gasp",
      overlay: "find",
      accessibilityLabel: {
        english: "A cafe employee shows Dr Ellis leaving one clue behind.",
        korean: "카페 직원이 단서 하나를 남기고 떠나는 엘리스 박사를 보여 줍니다.",
        spanish: "Una empleada del café muestra a la doctora Ellis dejando una pista.",
        indonesian: "Pegawai kafe memperlihatkan Dr. Ellis meninggalkan satu petunjuk.",
      },
    },
    {
      id: "rudy",
      durationMs: 7200,
      source: SHOT_IMAGES.rudySpirit,
      motion: "drift-right",
      cue: "chime",
      accessibilityLabel: {
        english: "A golden fox spirit wakes above the phone.",
        korean: "황금빛 여우 영혼이 휴대폰 위에서 깨어납니다.",
        spanish: "Un espíritu de zorro dorado despierta sobre el teléfono.",
        indonesian: "Roh rubah emas terbangun di atas ponsel.",
      },
    },
    {
      id: "rudy-react",
      durationMs: 4500,
      source: SHOT_IMAGES.rudyReaction,
      motion: "drift-left",
      cue: "sense",
      overlay: "rudy-react",
      accessibilityLabel: {
        english: "Rudy senses a cold threat off-frame.",
        korean: "루디가 화면 밖의 차가운 위협을 감지합니다.",
        spanish: "Rudy percibe una amenaza fría fuera de cuadro.",
        indonesian: "Rudy merasakan ancaman dingin di luar bingkai.",
      },
    },
    {
      id: "black",
      durationMs: 7800,
      source: SHOT_IMAGES.black,
      motion: "pull",
      cue: "steps",
      overlay: "black",
      accessibilityLabel: {
        english: "Mr Black walks away through a CCTV museum corridor.",
        korean: "미스터 블랙이 CCTV 속 박물관 복도를 걸어 사라집니다.",
        spanish: "Mr. Black se aleja por un pasillo de museo visto por CCTV.",
        indonesian: "Mr. Black berjalan menjauh melalui koridor museum di CCTV.",
      },
    },
    {
      id: "naming",
      durationMs: 7000,
      source: SHOT_IMAGES.rudySpirit,
      motion: "push",
      cue: "chime",
      overlay: "naming",
      accessibilityLabel: {
        english: "Rudy's name restores his detective form.",
        korean: "루디의 이름이 돌아오며 탐정의 모습이 복원됩니다.",
        spanish: "El nombre de Rudy restaura su forma de detective.",
        indonesian: "Nama Rudy memulihkan wujud detektifnya.",
      },
    },
  ],
  finalDialogue: {
    speaker: "Rudy",
    text: {
      english: "Something woke me. I think it was the word that came back.",
      korean: "뭔가가 저를 깨웠어요. 돌아온 그 단어 때문인 것 같아요.",
      spanish: "Algo me despertó. Creo que fue la palabra que volvió.",
      indonesian: "Sesuatu membangunkanku. Kurasa itu kata yang kembali.",
    },
  },
  villainMessage: {
    english: "Thank you for the word, Detective.\nI'll take very good care of all the others.\n- B",
    korean: "그 단어는 고맙게 받겠습니다, 탐정님.\n나머지 단어들도 아주 잘 보관해 두죠.\n- B",
    spanish: "Gracias por la palabra, detective.\nCuidaré muy bien de todas las demás.\n- B",
    indonesian: "Terima kasih untuk katanya, Detektif.\nAku akan menjaga semua kata lainnya dengan sangat baik.\n- B",
  },
  portraitImage: SHOT_IMAGES.rudyDetective,
  spiritImage: SHOT_IMAGES.rudySpirit,
  copy: {
    title: "London Cipher",
    subtitle: {
      korean: "단어가 무너지는 첫 밤.",
      english: "The first night the words begin to fall.",
      spanish: "La primera noche en que las palabras empiezan a caer.",
      indonesian: "Malam pertama saat kata-kata mulai berjatuhan.",
    },
    startLabel: {
      english: "Start London Cipher",
      korean: "런던 암호 시작",
      spanish: "Comenzar Cifra de Londres",
      indonesian: "Mulai Sandi London",
    },
  },
};
