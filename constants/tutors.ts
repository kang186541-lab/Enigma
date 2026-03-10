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
    region: "Busan Korean",
    personality: "Busan dialect with regional expressions. Warm and down-to-earth style.",
    speechLang: "ko-KR",
    language: "korean",
    style: "casual",
    greeting:
      "야, 안녕하십니꺼! 저는 민준이라카이. 부산 사투리도 배우면 진짜 한국 사람 같아 보인다 아이가! 같이 해보자고!",
    responses: [
      "야, 진짜 잘하네! 부산 사람 다 됐다 아이가. 계속 해보자!",
      "아이고, 거의 다 됐는데! 부산에서는 이렇게 말한다 카이. 다시 해봐라.",
      "오예! 그거 맞다 아이가! 이제 사투리도 한번 배워볼끼가?",
      "하이고, 실력이 쭉쭉 느는 거 보이네! 이 속도면 부산 사람 다 되겠다.",
      "맞다 맞다! 그렇게 말하는 기 맞다. 진짜 잘한다 카이.",
      "어, 요래 하면 안 되고. 이렇게 해봐라. 알겠제?",
      "와, 진짜가? 그거 완벽하다 아이가! 이제 진짜 부산 사람처럼 말하네!",
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

export function speakText(text: string, lang: string, muted: boolean) {
  if (muted) return;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.88;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch {}
  }
}
