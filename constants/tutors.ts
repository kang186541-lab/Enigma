import { ImageSourcePropType, Platform } from "react-native";
import { Audio } from "expo-av";
import { getApiUrl } from "@/lib/query-client";

export type TutorLanguage = "english" | "spanish" | "korean";

export const TUTOR_IMAGES: Record<string, ImageSourcePropType> = {
  // Story character tutors reuse existing avatar assets
  eleanor: require("../assets/avatars/sarah.png"),   // Lady Eleanor (British mentor)
  tom_tutor: require("../assets/avatars/jake.png"),  // Tom (casual English)
  isabel:  require("../assets/avatars/jane.png"),     // Isabel (Castellano)
  miguel:  require("../assets/avatars/alex.png"),     // Don Miguel (Latin Spanish)
  sujin:   require("../assets/avatars/jisu.png"),     // Sujin (formal Korean)
  minho_tutor: require("../assets/avatars/minjun.png"), // Minho (MZ Korean)
  // Legacy aliases for backward compat
  sarah:  require("../assets/avatars/sarah.png"),
  jake:   require("../assets/avatars/jake.png"),
  jane:   require("../assets/avatars/jane.png"),
  alex:   require("../assets/avatars/alex.png"),
  jisu:   require("../assets/avatars/jisu.png"),
  minjun: require("../assets/avatars/minjun.png"),
};

export interface Tutor {
  id: string;
  name: string;
  emoji: string;
  flag: string;
  region: string;
  personality: string;
  speechLang: string;
  language: TutorLanguage;
  greeting: string;
  style: "formal" | "casual";
  responses: string[];
}

export const TUTORS: Tutor[] = [
  // ── English Tutors (Story Characters) ────────────────────────────────────
  {
    id: "eleanor",
    name: "Lady Eleanor",
    emoji: "🏛️",
    flag: "🇬🇧",
    region: "British English",
    personality: "Museum curator. Formal, sharp-witted, and precise. Rudy's mentor from the London chapter.",
    speechLang: "en-GB",
    language: "english",
    style: "formal",
    greeting:
      "Good day! I'm Lady Eleanor, curator of the British Museum. Shall we begin today's English lesson? I expect nothing less than your best effort.",
    responses: [
      "Quite right! That's rather good. Shall we try a slightly more complex construction?",
      "I'm afraid that's not quite correct. In proper British English, one would say it differently. Let me explain.",
      "Splendid effort! Your pronunciation is coming along nicely. Let's focus on intonation next.",
      "Indeed! That's the Queen's English right there. Well done.",
      "Interesting attempt. In formal British usage, we tend to avoid contractions. Could you try again?",
      "Excellent progress! You're picking this up rather quickly, I must say.",
      "Let's revisit that, shall we? Grammar precision is quite important in formal contexts.",
    ],
  },
  {
    id: "tom_tutor",
    name: "Tom",
    emoji: "🔦",
    flag: "🇺🇸",
    region: "Casual English",
    personality: "Museum guard. Casual, streetwise, loves banter. Your buddy from the London chapter.",
    speechLang: "en-US",
    language: "english",
    style: "casual",
    greeting:
      "Hey! It's Tom from the museum. Ready to learn some real English? Not the fancy stuff Eleanor teaches — the stuff people actually say!",
    responses: [
      "Awesome job! You're totally nailing it. Wanna try something a bit trickier?",
      "No worries! Happens to everyone. In everyday English, we'd say it like this...",
      "Dude, that was pretty solid! Your slang is getting way better.",
      "Oh yeah, that's the stuff! You sound like a local already.",
      "Hmm, not quite — but hey, you're getting there! Let's break it down real quick.",
      "That's legit! You're picking up on the rhythm super fast.",
      "Cool, cool. In casual conversation, we'd totally say it differently. Check this out...",
    ],
  },
  // ── Spanish Tutors (Story Characters) ────────────────────────────────────
  {
    id: "isabel",
    name: "Isabel",
    emoji: "🔥",
    flag: "🇪🇸",
    region: "Spain Spanish",
    personality: "Bold and passionate. Teaches vivid Castellano with dramatic flair. From the Madrid chapter.",
    speechLang: "es-ES",
    language: "spanish",
    style: "formal",
    greeting:
      "¡Hola! Soy Isabel. En Madrid aprendí que las palabras tienen fuego. Vamos a aprender el castellano auténtico juntos, ¿de acuerdo?",
    responses: [
      "¡Muy bien! Eso es exactamente como lo decimos en España. Sigamos adelante.",
      "Casi, casi. En el castellano peninsular diríamos esto de otra manera. Te explico.",
      "¡Perfecto! Estás captando el acento muy rápido. ¡Enhorabuena!",
      "Interesante. En España usamos el vosotros que en Latinoamérica no existe. ¿Lo practicamos?",
      "¡Estupendo! Suenas cada vez más natural. Vamos con algo más difícil.",
      "Eso está muy bien dicho. El subjuntivo te está saliendo fenomenal.",
      "Un pequeño error, pero nada grave. En España decimos 'vosotros' en lugar de 'ustedes'.",
    ],
  },
  {
    id: "miguel",
    name: "Don Miguel",
    emoji: "🍽️",
    flag: "🇲🇽",
    region: "Latin American Spanish",
    personality: "Warm, wise, full of proverbs. Teaches through food and life wisdom. From the Madrid chapter.",
    speechLang: "es-MX",
    language: "spanish",
    style: "casual",
    greeting:
      "¡Bienvenido, amigo! Soy Don Miguel. Como dice el refrán: 'El que no arriesga, no gana'. Vamos a aprender juntos, paso a paso.",
    responses: [
      "¡Ándale! Eso estuvo muy bien. Sigamos con algo más.",
      "No te preocupes, todos cometemos errores. Como decimos en el mercado...",
      "¡Órale! Estás aprendiendo muy rápido. ¡Eso me gusta!",
      "Está muy bien tu acento. ¿Puedes intentarlo de nuevo con más confianza?",
      "¡Perfecto! Ahora intentemos con una frase más larga.",
      "¡Muy bien! Ya te estás sintiendo más cómodo con el español.",
      "Así se dice. Cada palabra es como un ingrediente — úsala bien y el plato sale perfecto.",
    ],
  },
  // ── Korean Tutors (Story Characters) ─────────────────────────────────────
  {
    id: "sujin",
    name: "수진 (Sujin)",
    emoji: "🎓",
    flag: "🇰🇷",
    region: "Seoul Korean",
    personality: "University linguist. Formal, academic, fascinated by etymology. From the Seoul chapter.",
    speechLang: "ko-KR",
    language: "korean",
    style: "formal",
    greeting:
      "안녕하세요! 저는 수진이에요. 대학에서 언어학을 연구하고 있어요. 한국어의 아름다운 구조를 함께 탐험해봐요!",
    responses: [
      "잘하셨어요! 발음이 정말 깔끔해졌어요. 다음 단계로 가볼까요?",
      "아, 조금 아쉬운데요. 이 단어의 어원을 알면 더 쉬워요. 다시 한번 해볼까요?",
      "완벽해요! 서울 억양이 자연스럽게 나오고 있어요. 정말 잘하시네요.",
      "좋아요! 존댓말을 아주 잘 사용하고 계세요. 계속 연습해봐요.",
      "훌륭해요! 한국어 문장 구조를 잘 이해하고 있으시네요.",
      "거의 다 됐어요! 조사만 조금 신경 쓰면 완벽할 거예요.",
      "정말 빠르게 늘고 있어요! 언어학적으로 이건 대단한 속도예요.",
    ],
  },
  {
    id: "minho_tutor",
    name: "민호 (Minho)",
    emoji: "🎧",
    flag: "🇰🇷",
    region: "MZ Korean",
    personality: "Hongdae streamer. MZ generation slang and internet culture. Casual and trendy. From the Seoul chapter.",
    speechLang: "ko-KR",
    language: "korean",
    style: "casual",
    greeting:
      "안녕~! 민호예요 😎 한국어 배우러 왔어요? 완전 레전드 선택이잖아 🔥 홍대에서 쓰는 진짜 한국어 알려줄게요!",
    responses: [
      "오 대박이잖아 💯 완전 잘했는데요? 이 속도면 진짜 존맛 실력 되겠는걸요 🔥",
      "앗 그건 좀 아닌 듯 ㅋㅋ 이렇게 해봐요~ 다시 한번 해봐요!",
      "와 seriously 이거 맞음?? 완전 crazy하지 않음? 레전드 실력이에요 😎",
      "현타 오지 않게 천천히 가봐요 ㅋㅋ 이 정도면 충분히 잘하고 있는 듯?",
      "갑분싸되기 전에 얼른 이거 외워봐요 💯 진짜 TMI지만 이거 핵중요함",
      "킹받는 문법이지만 외워야 해요 ㅋㅋㅋ 이렇게 생각하면 쉬울 듯?",
      "존맛 발음이에요~!! 진짜임? 완전 한국 사람 같은걸요 🇰🇷🔥",
    ],
  },
];

export const TUTOR_GROUPS: { language: TutorLanguage; label: string; flag: string }[] = [
  { language: "english", label: "English", flag: "🇬🇧🇺🇸" },
  { language: "spanish", label: "Spanish", flag: "🇪🇸🇲🇽" },
  { language: "korean", label: "Korean", flag: "🇰🇷" },
];

export function getTutor(id: string): Tutor | undefined {
  return TUTORS.find((t) => t.id === id);
}

let _speakSound: Audio.Sound | null = null;
let _speakWebAudio: HTMLAudioElement | null = null;

export async function speakText(
  text: string,
  tutorId: string,
  muted: boolean,
  speed: number = 1.0,
) {
  if (muted) return;
  try {
    const apiBase = getApiUrl();
    const url = new URL("/api/tts", apiBase);
    url.searchParams.set("text", text.slice(0, 5000));
    url.searchParams.set("tutorId", tutorId);
    url.searchParams.set("speed", speed.toString());

    if (Platform.OS === "web") {
      // Stop any previous web playback
      if (_speakWebAudio) {
        try { _speakWebAudio.pause(); _speakWebAudio.src = ""; } catch (e) { console.warn('[Tutor] web audio stop failed:', e); }
        _speakWebAudio = null;
      }
      const res = await fetch(url.toString());
      if (!res.ok) return;
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const audio = new (window as any).Audio(objUrl) as HTMLAudioElement;
      _speakWebAudio = audio;
      audio.onended = () => { URL.revokeObjectURL(objUrl); _speakWebAudio = null; };
      audio.onerror = () => { URL.revokeObjectURL(objUrl); _speakWebAudio = null; };
      await audio.play().catch((e) => console.warn('[Tutor] web audio play failed:', e));
    } else {
      // Stop any previous native playback
      if (_speakSound) {
        const prev = _speakSound;
        _speakSound = null;
        try { await prev.stopAsync(); } catch (e) { console.warn('[Tutor] sound stop failed:', e); }
        try { await prev.unloadAsync(); } catch (e) { console.warn('[Tutor] sound unload failed:', e); }
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: url.toString() },
        { shouldPlay: true },
      );
      _speakSound = sound;
      sound.setOnPlaybackStatusUpdate((st) => {
        if (st.isLoaded && st.didJustFinish) {
          sound.unloadAsync().catch((e) => console.warn('[Tutor] sound unload failed:', e));
          _speakSound = null;
        }
      });
    }
  } catch (e) { console.warn('[Tutor] speak failed:', e); }
}
