import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CourseLevel = "A1" | "A2" | "B1" | "B2";

export interface Tri {
  ko: string;
  en: string;
  es: string;
}

export interface DayData {
  id: string;
  dayNumber: number;
  topic: Tri;
  unitIndex: number;
}

export interface UnitData {
  id: string;
  level: CourseLevel;
  title: Tri;
  days: DayData[];
}

export interface DailyCourseProgress {
  currentLevel: CourseLevel;
  currentUnitIndex: number;
  currentDayIndex: number;
  completedDays: string[];
  todayDate: string;
  todayCompleted: boolean;
  todayStepsCompleted: {
    listenRepeat: boolean;
    keyPoint: boolean;
    missionTalk: boolean;
    review: boolean;
  };
  stats: {
    totalSentencesSpoken: number;
    totalDaysCompleted: number;
    averagePronunciationScore: number;
    currentStreak: number;
  };
}

// ── Storage key ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "@daily_course_progress";

// ── Helpers ───────────────────────────────────────────────────────────────────

export function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function defaultProgress(): DailyCourseProgress {
  return {
    currentLevel: "A1",
    currentUnitIndex: 0,
    currentDayIndex: 0,
    completedDays: [],
    todayDate: todayDateString(),
    todayCompleted: false,
    todayStepsCompleted: {
      listenRepeat: false,
      keyPoint: false,
      missionTalk: false,
      review: false,
    },
    stats: {
      totalSentencesSpoken: 0,
      totalDaysCompleted: 0,
      averagePronunciationScore: 0,
      currentStreak: 0,
    },
  };
}

export async function loadProgress(): Promise<DailyCourseProgress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const saved: DailyCourseProgress = JSON.parse(raw);
    // Reset today's completion state if date changed
    const today = todayDateString();
    if (saved.todayDate !== today) {
      saved.todayDate = today;
      saved.todayCompleted = false;
      saved.todayStepsCompleted = {
        listenRepeat: false,
        keyPoint: false,
        missionTalk: false,
        review: false,
      };
      await saveProgress(saved);
    }
    return saved;
  } catch {
    return defaultProgress();
  }
}

export async function saveProgress(progress: DailyCourseProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

// ── Dummy curriculum data ─────────────────────────────────────────────────────

export const UNITS: UnitData[] = [
  {
    id: "unit_1",
    level: "A1",
    title: { ko: "Unit 1: 첫 만남", en: "Unit 1: First Encounters", es: "Unidad 1: Primeros Encuentros" },
    days: [
      { id: "day_1", dayNumber: 1, topic: { ko: "만남 인사", en: "Meeting & Greeting", es: "Encuentros y Saludos" }, unitIndex: 0 },
      { id: "day_2", dayNumber: 2, topic: { ko: "출신 말하기", en: "Saying Where You're From", es: "Decir De Dónde Eres" }, unitIndex: 0 },
      { id: "day_3", dayNumber: 3, topic: { ko: "직업 말하기", en: "Talking About Jobs", es: "Hablar de Trabajos" }, unitIndex: 0 },
      { id: "day_4", dayNumber: 4, topic: { ko: "작별 인사", en: "Saying Goodbye", es: "Despedidas" }, unitIndex: 0 },
      { id: "day_5", dayNumber: 5, topic: { ko: "안부 묻기", en: "Asking How Someone Is", es: "Preguntar Cómo Está Alguien" }, unitIndex: 0 },
      { id: "day_6", dayNumber: 6, topic: { ko: "종합 복습", en: "Unit Review", es: "Repaso de Unidad" }, unitIndex: 0 },
    ],
  },
  {
    id: "unit_2",
    level: "A1",
    title: { ko: "Unit 2: 일상 표현", en: "Unit 2: Everyday Expressions", es: "Unidad 2: Expresiones Cotidianas" },
    days: [
      { id: "day_7",  dayNumber: 7,  topic: { ko: "숫자와 나이", en: "Numbers & Age", es: "Números y Edad" }, unitIndex: 1 },
      { id: "day_8",  dayNumber: 8,  topic: { ko: "요일 말하기", en: "Days of the Week", es: "Días de la Semana" }, unitIndex: 1 },
      { id: "day_9",  dayNumber: 9,  topic: { ko: "시간 표현", en: "Telling the Time", es: "Decir la Hora" }, unitIndex: 1 },
      { id: "day_10", dayNumber: 10, topic: { ko: "날씨 말하기", en: "Talking About Weather", es: "Hablar del Tiempo" }, unitIndex: 1 },
      { id: "day_11", dayNumber: 11, topic: { ko: "색상과 크기", en: "Colours & Sizes", es: "Colores y Tamaños" }, unitIndex: 1 },
      { id: "day_12", dayNumber: 12, topic: { ko: "종합 복습", en: "Unit Review", es: "Repaso de Unidad" }, unitIndex: 1 },
    ],
  },
  {
    id: "unit_3",
    level: "A1",
    title: { ko: "Unit 3: 음식 & 주문", en: "Unit 3: Food & Ordering", es: "Unidad 3: Comida y Pedidos" },
    days: [
      { id: "day_13", dayNumber: 13, topic: { ko: "음식 어휘", en: "Food Vocabulary", es: "Vocabulario de Comida" }, unitIndex: 2 },
      { id: "day_14", dayNumber: 14, topic: { ko: "주문하기", en: "Ordering Food", es: "Pedir Comida" }, unitIndex: 2 },
      { id: "day_15", dayNumber: 15, topic: { ko: "맛 표현", en: "Describing Tastes", es: "Describir Sabores" }, unitIndex: 2 },
      { id: "day_16", dayNumber: 16, topic: { ko: "식당에서", en: "At the Restaurant", es: "En el Restaurante" }, unitIndex: 2 },
      { id: "day_17", dayNumber: 17, topic: { ko: "음식 선호도", en: "Food Preferences", es: "Preferencias de Comida" }, unitIndex: 2 },
      { id: "day_18", dayNumber: 18, topic: { ko: "종합 복습", en: "Unit Review", es: "Repaso de Unidad" }, unitIndex: 2 },
    ],
  },
];

export function getAllDays(): DayData[] {
  return UNITS.flatMap((u) => u.days);
}

export function getTri(tri: Tri, lang: "ko" | "en" | "es"): string {
  return tri[lang] ?? tri.en;
}

export function langToCode(nativeLang: string): "ko" | "en" | "es" {
  if (nativeLang === "korean") return "ko";
  if (nativeLang === "spanish") return "es";
  return "en";
}

// Rudy's daily briefing messages
export const RUDY_BRIEFINGS: Record<string, string[]> = {
  korean: [
    "좋은 아침이야, 파트너! 오늘도 같이 훈련해보자!",
    "어서 와! 오늘의 훈련을 시작할 준비가 됐지?",
    "훈련소에 온 걸 환영해! 오늘도 멋지게 해낼 거야!",
    "파트너, 오늘도 최선을 다해보자! 같이 할 수 있어!",
    "준비됐어? 오늘 훈련 마치면 한 단계 더 성장할 거야!",
  ],
  english: [
    "Good morning, partner! Let's train together today!",
    "Welcome back! Ready to start today's mission?",
    "You've got this, partner! Let's make today count!",
    "Time to level up! Let's tackle today's training!",
    "Every day you practice, you get closer to fluency!",
  ],
  spanish: [
    "¡Buenos días, compañero! ¡Entrenemos juntos hoy!",
    "¡Bienvenido de vuelta! ¿Listo para la misión de hoy?",
    "¡Puedes hacerlo, compañero! ¡Hagamos que hoy valga la pena!",
    "¡Hora de subir de nivel! ¡Afrontemos el entrenamiento de hoy!",
    "¡Cada día que practicas, te acercas más a la fluidez!",
  ],
};

export function getRandomBriefing(nativeLang: string): string {
  const msgs = RUDY_BRIEFINGS[nativeLang] ?? RUDY_BRIEFINGS.english;
  return msgs[Math.floor(Math.random() * msgs.length)];
}

export const STEP_LABELS: Record<string, [string, string, string, string]> = {
  korean:  ["듣고 따라하기", "핵심 포인트", "미션 토크", "오늘의 복습"],
  english: ["Listen & Repeat", "Key Point", "Mission Talk", "Review"],
  spanish: ["Escuchar y Repetir", "Punto Clave", "Misión de Hablar", "Repaso"],
};
