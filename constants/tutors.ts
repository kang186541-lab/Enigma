export type TutorLanguage = "english" | "spanish" | "korean";

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
  {
    id: "sarah",
    name: "Sarah",
    emoji: "👩",
    flag: "🇬🇧",
    region: "British English",
    personality: "Formal & professional. Clear explanations with proper grammar focus.",
    speechLang: "en-GB",
    language: "english",
    style: "formal",
    greeting:
      "Good day! I'm Sarah, your British English tutor. Shall we commence with today's lesson? I do hope you're ready for some proper English practice.",
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
    id: "jake",
    name: "Jake",
    emoji: "👨",
    flag: "🇺🇸",
    region: "American English",
    personality: "Casual & friendly. Conversational style with everyday expressions.",
    speechLang: "en-US",
    language: "english",
    style: "casual",
    greeting:
      "Hey there! I'm Jake, your American English buddy! Super stoked to help you learn. Don't worry about making mistakes — that's how we roll!",
    responses: [
      "Awesome job! You're totally nailing it. Wanna try something a bit trickier?",
      "No worries! Happens to everyone. In everyday American English, we'd say it like this...",
      "Dude, that was pretty solid! Your slang is getting way better.",
      "Oh yeah, that's the stuff! You sound like a local already.",
      "Hmm, not quite — but hey, you're getting there! Let's break it down real quick.",
      "That's legit! You're picking up on the American rhythm super fast.",
      "Cool, cool. So in casual American conversation, we'd totally say it differently. Check this out...",
    ],
  },
  {
    id: "jane",
    name: "Jane",
    emoji: "👩",
    flag: "🇪🇸",
    region: "Spain Spanish",
    personality: "Precise Castellano accent. Classical Spanish with European vocabulary.",
    speechLang: "es-ES",
    language: "spanish",
    style: "formal",
    greeting:
      "¡Buenas! Soy Jane, tu tutora de español de España. Vamos a aprender el castellano auténtico juntos, ¿de acuerdo?",
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
    id: "alex",
    name: "Alex",
    emoji: "👨",
    flag: "🇲🇽",
    region: "Mexican Spanish",
    personality: "Warm & expressive Latin American style with regional phrases.",
    speechLang: "es-MX",
    language: "spanish",
    style: "casual",
    greeting:
      "¡Qué onda! Soy Alex, tu profe de español latinoamericano. ¡Vamos a aprender un chingo de cosas juntos, wey! Sin presión, ¿eh?",
    responses: [
      "¡Ándale! Eso estuvo muy chido. Sigamos con algo más.",
      "No te agüites, todos cometemos errores. En México decimos esto así...",
      "¡Órale! Estás aprendiendo muy rápido. ¡Me cae que sí puedes!",
      "Está padrísimo tu acento. ¿Puedes intentarlo de nuevo con más confianza?",
      "¡Sale! Eso estuvo perfecto. Ahora intentemos con una frase más larga.",
      "¡Qué chido! Ya te estás sintiendo más cómodo con el español mexicano.",
      "Así mero se dice. En México tenemos muchas expresiones únicas, ¡y tú ya las estás agarrando!",
    ],
  },
  {
    id: "jisu",
    name: "지수",
    emoji: "👩",
    flag: "🇰🇷",
    region: "Seoul Korean",
    personality: "Standard Seoul dialect. Polite formal speech with clear pronunciation.",
    speechLang: "ko-KR",
    language: "korean",
    style: "formal",
    greeting:
      "안녕하세요! 저는 지수예요. 서울 표준어로 한국어를 가르쳐 드릴게요. 천천히, 정확하게 연습해봐요!",
    responses: [
      "잘하셨어요! 발음이 정말 깔끔해졌어요. 다음 단계로 가볼까요?",
      "아, 조금 아쉬운데요. 표준어로는 이렇게 말해요. 다시 한번 해볼까요?",
      "완벽해요! 서울 억양이 자연스럽게 나오고 있어요. 정말 잘하시네요.",
      "좋아요! 존댓말을 아주 잘 사용하고 계세요. 계속 연습해봐요.",
      "훌륭해요! 한국어 문장 구조를 잘 이해하고 있으시네요.",
      "거의 다 됐어요! 조사만 조금 신경 쓰면 완벽할 거예요.",
      "정말 빠르게 늘고 있어요! 이 속도라면 금방 유창해지실 거예요.",
    ],
  },
  {
    id: "minjun",
    name: "민준",
    emoji: "👨",
    flag: "🇰🇷",
    region: "MZ Korean 🇰🇷",
    personality: "MZ generation Korean slang and internet culture. Casual and trendy.",
    speechLang: "ko-KR",
    language: "korean",
    style: "casual",
    greeting:
      "안녕~! 저 민준이에요 😎 seriously 한국어 배우러 왔어요? 완전 레전드 선택이잖아 🔥 같이 해봐요, 진짜임?",
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

export async function speakText(text: string, lang: string, muted: boolean) {
  if (muted) return;
  try {
    const { isSpeakingAsync, stop, speak } = await import("expo-speech");
    const isSpeaking = await isSpeakingAsync();
    if (isSpeaking) {
      stop();
      await new Promise((r) => setTimeout(r, 80));
    }
    speak(text, { language: lang, rate: 0.88 });
  } catch {}
}
