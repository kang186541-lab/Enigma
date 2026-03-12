import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type NativeLanguage = "korean" | "english" | "spanish";

export interface Level {
  num: number;
  emoji: string;
  name: string;
  minXP: number;
  maxXP: number;
}

export const LEVELS: Level[] = [
  { num: 1, emoji: "🌱", name: "입문자",  minXP: 0,    maxXP: 100  },
  { num: 2, emoji: "📚", name: "초보자",  minXP: 101,  maxXP: 300  },
  { num: 3, emoji: "⭐", name: "중급자",  minXP: 301,  maxXP: 600  },
  { num: 4, emoji: "🔥", name: "고급자",  minXP: 601,  maxXP: 1000 },
  { num: 5, emoji: "👑", name: "마스터",  minXP: 1001, maxXP: Infinity },
];

export function getLevel(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getLevelProgress(xp: number): number {
  const lvl = getLevel(xp);
  if (lvl.num === 5) return 1;
  return Math.min(1, (xp - lvl.minXP) / (lvl.maxXP - lvl.minXP));
}

export interface UserStats {
  streak: number;
  wordsLearned: number;
  accuracy: number;
  xp: number;
}

export interface LanguageContextType {
  nativeLanguage: NativeLanguage | null;
  setNativeLanguage: (lang: NativeLanguage) => Promise<void>;
  learningLanguage: NativeLanguage | null;
  setLearningLanguage: (lang: NativeLanguage) => Promise<void>;
  hasOnboarded: boolean;
  stats: UserStats;
  updateStats: (updates: Partial<UserStats>) => Promise<void>;
  t: (key: string) => string;
}

export function getDefaultLearning(native: NativeLanguage): NativeLanguage {
  const all: NativeLanguage[] = ["english", "korean", "spanish"];
  return all.find((l) => l !== native) ?? "english";
}

const translations: Record<NativeLanguage, Record<string, string>> = {
  english: {
    select_language: "Select Your Language",
    subtitle: "Choose your native language to personalize your experience",
    korean: "Korean",
    english: "English",
    spanish: "Spanish",
    continue: "Continue",
    home: "Home",
    cards: "Cards",
    chat: "Chat",
    speak: "Speak",
    good_morning: "Good morning!",
    good_afternoon: "Good afternoon!",
    good_evening: "Good evening!",
    streak: "Day Streak",
    words: "Words",
    accuracy: "Accuracy",
    xp: "XP Points",
    daily_lesson: "Today's Lesson",
    daily_desc: "Master 10 new words and phrases",
    start_lesson: "Start Lesson",
    quick_practice: "Quick Practice",
    flashcards: "Flashcards",
    flashcards_desc: "Review vocabulary with interactive cards",
    conversation: "Conversation",
    conversation_desc: "Practice real-world dialogue",
    pronunciation: "Pronunciation",
    pronunciation_desc: "Perfect your accent",
    continue_learning: "Continue Learning",
    flip_card: "Tap to flip",
    next: "Next",
    know_it: "I know it!",
    study_more: "Study more",
    well_done: "Well done!",
    practice_speaking: "Practice Speaking",
    tap_to_speak: "Tap to speak",
    listening: "Listening...",
    type_message: "Type a message...",
    send: "Send",
    ai_greeting: "Hello! I'm your AI language tutor. What would you like to practice today?",
    your_progress: "Your Progress",
    level: "Level",
    beginner: "Beginner",
    card_deck: "Today's Card Deck",
    cards_remaining: "cards remaining",
    speak_title: "Pronunciation Practice",
    speak_subtitle: "Listen, repeat, and perfect your accent",
    listen: "Listen",
    record: "Record",
    try_again: "Try Again",
    great_job: "Great job!",
    score: "Score",
    chat_pick_tutor: "Choose Your Tutor",
    chat_pick_sub: "Pick the accent and style you want to practice with",
  },
  korean: {
    select_language: "언어를 선택하세요",
    subtitle: "원하는 학습 경험을 위해 모국어를 선택하세요",
    korean: "한국어",
    english: "영어",
    spanish: "스페인어",
    continue: "계속하기",
    home: "홈",
    cards: "카드",
    chat: "채팅",
    speak: "말하기",
    good_morning: "좋은 아침이에요!",
    good_afternoon: "좋은 오후예요!",
    good_evening: "좋은 저녁이에요!",
    streak: "연속 학습일",
    words: "단어",
    accuracy: "정확도",
    xp: "경험치",
    daily_lesson: "오늘의 수업",
    daily_desc: "새로운 단어와 표현 10개 배우기",
    start_lesson: "수업 시작",
    quick_practice: "빠른 연습",
    flashcards: "플래시카드",
    flashcards_desc: "인터랙티브 카드로 어휘 복습",
    conversation: "대화",
    conversation_desc: "실생활 대화 연습",
    pronunciation: "발음",
    pronunciation_desc: "억양 완벽하게 하기",
    continue_learning: "계속 배우기",
    flip_card: "탭하여 뒤집기",
    next: "다음",
    know_it: "알아요!",
    study_more: "더 공부하기",
    well_done: "잘했어요!",
    practice_speaking: "말하기 연습",
    tap_to_speak: "탭하여 말하기",
    listening: "듣는 중...",
    type_message: "메시지 입력...",
    send: "전송",
    ai_greeting: "안녕하세요! 저는 AI 언어 튜터예요. 오늘 무엇을 연습하고 싶으신가요?",
    your_progress: "내 진도",
    level: "레벨",
    beginner: "초급",
    card_deck: "오늘의 카드 덱",
    cards_remaining: "카드 남음",
    speak_title: "발음 연습",
    speak_subtitle: "듣고, 반복하고, 억양을 완벽하게 하세요",
    listen: "듣기",
    record: "녹음",
    try_again: "다시 시도",
    great_job: "잘했어요!",
    score: "점수",
    chat_pick_tutor: "튜터를 선택하세요",
    chat_pick_sub: "연습할 튜터를 골라보세요",
  },
  spanish: {
    select_language: "Selecciona tu idioma",
    subtitle: "Elige tu idioma nativo para personalizar tu experiencia",
    korean: "Coreano",
    english: "Inglés",
    spanish: "Español",
    continue: "Continuar",
    home: "Inicio",
    cards: "Tarjetas",
    chat: "Chat",
    speak: "Hablar",
    good_morning: "¡Buenos días!",
    good_afternoon: "¡Buenas tardes!",
    good_evening: "¡Buenas noches!",
    streak: "Racha de días",
    words: "Palabras",
    accuracy: "Precisión",
    xp: "Puntos XP",
    daily_lesson: "Lección de hoy",
    daily_desc: "Aprende 10 palabras y frases nuevas",
    start_lesson: "Iniciar lección",
    quick_practice: "Práctica rápida",
    flashcards: "Tarjetas didácticas",
    flashcards_desc: "Repasa vocabulario con tarjetas interactivas",
    conversation: "Conversación",
    conversation_desc: "Practica diálogos del mundo real",
    pronunciation: "Pronunciación",
    pronunciation_desc: "Perfecciona tu acento",
    continue_learning: "Continuar aprendiendo",
    flip_card: "Toca para voltear",
    next: "Siguiente",
    know_it: "¡Lo sé!",
    study_more: "Estudiar más",
    well_done: "¡Bien hecho!",
    practice_speaking: "Practica hablando",
    tap_to_speak: "Toca para hablar",
    listening: "Escuchando...",
    type_message: "Escribe un mensaje...",
    send: "Enviar",
    ai_greeting: "¡Hola! Soy tu tutor de idiomas con IA. ¿Qué te gustaría practicar hoy?",
    your_progress: "Tu progreso",
    level: "Nivel",
    beginner: "Principiante",
    card_deck: "Mazo de hoy",
    cards_remaining: "tarjetas restantes",
    speak_title: "Práctica de pronunciación",
    speak_subtitle: "Escucha, repite y perfecciona tu acento",
    listen: "Escuchar",
    record: "Grabar",
    try_again: "Intentar de nuevo",
    great_job: "¡Excelente trabajo!",
    score: "Puntuación",
    chat_pick_tutor: "Elige tu tutor",
    chat_pick_sub: "Selecciona el acento y estilo que quieres practicar",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [nativeLanguage, setNativeLanguageState] = useState<NativeLanguage | null>(null);
  const [learningLanguage, setLearningLanguageState] = useState<NativeLanguage | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    streak: 7,
    wordsLearned: 142,
    accuracy: 87,
    xp: 1250,
  });

  useEffect(() => {
    (async () => {
      try {
        const lang = await AsyncStorage.getItem("@lingua_language");
        const ll = await AsyncStorage.getItem("@lingua_learning_language");
        const statsStr = await AsyncStorage.getItem("@lingua_stats");
        if (lang) {
          setNativeLanguageState(lang as NativeLanguage);
          setHasOnboarded(true);
          if (ll) {
            setLearningLanguageState(ll as NativeLanguage);
          } else {
            setLearningLanguageState(getDefaultLearning(lang as NativeLanguage));
          }
        }
        if (statsStr) {
          setStats(JSON.parse(statsStr));
        }
      } catch {}
    })();
  }, []);

  const setNativeLanguage = async (lang: NativeLanguage) => {
    await AsyncStorage.setItem("@lingua_language", lang);
    setNativeLanguageState(lang);
    setHasOnboarded(true);
    const currentLL = await AsyncStorage.getItem("@lingua_learning_language");
    if (!currentLL) {
      const defaultLL = getDefaultLearning(lang);
      await AsyncStorage.setItem("@lingua_learning_language", defaultLL);
      setLearningLanguageState(defaultLL);
    }
  };

  const setLearningLanguage = async (lang: NativeLanguage) => {
    await AsyncStorage.setItem("@lingua_learning_language", lang);
    setLearningLanguageState(lang);
  };

  const updateStats = async (updates: Partial<UserStats>) => {
    const newStats = { ...stats, ...updates };
    setStats(newStats);
    await AsyncStorage.setItem("@lingua_stats", JSON.stringify(newStats));
  };

  const t = (key: string): string => {
    const lang = nativeLanguage ?? "english";
    return translations[lang][key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ nativeLanguage, setNativeLanguage, learningLanguage, setLearningLanguage, hasOnboarded, stats, updateStats, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
