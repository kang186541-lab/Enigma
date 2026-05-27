import type { NativeLanguage } from "@/context/LanguageContext";

export type RudyGuideCard = {
  emoji: string;
  title: Record<NativeLanguage, string>;
  body: Record<NativeLanguage, string>;
};

export const RUDY_GUIDE_CARDS: RudyGuideCard[] = [
  {
    emoji: "🏊",
    title: {
      korean: "언어는 공부가 아니야",
      english: "Language isn't studying",
      spanish: "El idioma no se estudia",
    },
    body: {
      korean: "언어는 공부하는 게 아니라 습득하는 거야.\n수영처럼, 직접 해봐야 배울 수 있어.",
      english: "Language is acquired, not studied.\nLike swimming, you learn by doing.",
      spanish: "El idioma se adquiere, no se estudia.\nComo nadar, aprendes haciéndolo.",
    },
  },
  {
    emoji: "🔥",
    title: {
      korean: "불편해져야 배울 수 있어",
      english: "Get uncomfortable to learn",
      spanish: "Incómodate para aprender",
    },
    body: {
      korean: "휴대폰 언어를 바꿔봐.\n불편한 게 바로 배우고 있다는 증거야.",
      english: "Change your phone language.\nBeing uncomfortable = learning.",
      spanish: "Cambia el idioma de tu teléfono.\nLa incomodidad = aprendizaje.",
    },
  },
  {
    emoji: "⏰",
    title: {
      korean: "하루 10분이면 충분해",
      english: "10 minutes a day is enough",
      spanish: "10 minutos al día bastan",
    },
    body: {
      korean: "매일 10분이 일주일에 한 번 3시간보다 낫다.\n짧게, 자주, 꾸준히.",
      english: "10 minutes daily beats 3 hours once a week.\nShort, frequent, consistent.",
      spanish: "10 minutos diarios superan 3 horas una vez.\nCorto, frecuente, constante.",
    },
  },
  {
    emoji: "💬",
    title: {
      korean: "틀려도 일단 말해!",
      english: "Say it, even if it's wrong!",
      spanish: "¡Dilo, aunque esté mal!",
    },
    body: {
      korean: "머릿속으로 완벽한 문장을 만들지 마.\n틀려도 말해, 나중에 고쳐.\n말하지 않은 단어는 절대 네 것이 안 돼.",
      english: "Don't build perfect sentences in your head.\nSay it wrong, fix it later.\nWords you don't speak are never yours.",
      spanish: "No construyas oraciones perfectas en tu mente.\nDilo mal, corrígelo después.\nLas palabras que no dices nunca serán tuyas.",
    },
  },
  {
    emoji: "🎯",
    title: {
      korean: "네가 쓸 말부터 배워",
      english: "Learn what YOU actually say",
      spanish: "Aprende lo que TÚ dices",
    },
    body: {
      korean: "친구들이랑 무슨 얘기하는지 생각해봐.\n\"어제 맛있는 거 먹었어\"가\n\"이것은 사과입니다\"보다 100배 유용해.",
      english: "Think about what you talk about with friends.\n\"I ate something amazing yesterday\" is\n100x more useful than \"This is an apple.\"",
      spanish: "Piensa en qué hablas con tus amigos.\n\"Ayer comí algo increíble\" es\n100 veces más útil que \"Esto es una manzana.\"",
    },
  },
  {
    emoji: "🎧",
    title: {
      korean: "좋아하는 걸로 배워봐",
      english: "Learn with what you love",
      spanish: "Aprende con lo que amas",
    },
    body: {
      korean: "덕질이 최고의 공부법이야.\n좋아하는 가수, 드라마, 게임을\n배우는 언어로 즐겨봐.",
      english: "Fan culture is the best study method.\nFind your favorite singer, drama, or game\nin the target language.",
      spanish: "La cultura fan es el mejor método.\nEncuentra tu cantante, drama o juego favorito\nen el idioma que aprendes.",
    },
  },
  {
    emoji: "🔄",
    title: {
      korean: "습관을 만들어봐",
      english: "Build habits, not study sessions",
      spanish: "Crea hábitos, no sesiones de estudio",
    },
    body: {
      korean: "팟캐스트 듣기, 외국 계정 팔로우,\n혼잣말하기. 공부한다고 생각하지 마.",
      english: "Listen to podcasts, follow foreign accounts,\ntalk to yourself in the language.\nDon't think of it as studying.",
      spanish: "Escucha podcasts, sigue cuentas extranjeras,\nhabla contigo mismo en el idioma.\nNo lo pienses como estudiar.",
    },
  },
  {
    emoji: "🦊",
    title: {
      korean: "자, 이제 시작하자!",
      english: "Alright, let's go!",
      spanish: "¡Bien, vamos!",
    },
    body: {
      korean: "준비됐지, 파트너?\n루디가 옆에서 도와줄게. 같이 가자!",
      english: "Ready, partner?\nRudy's right here with you. Let's do this!",
      spanish: "¿Listo, compañero?\nRudy está aquí contigo. ¡Hagámoslo!",
    },
  },
];
