import AsyncStorage from "@react-native-async-storage/async-storage";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CourseLevel = "A1" | "A2" | "B1" | "B2";

export interface Tri {
  ko: string;
  en: string;
  es: string;
  id?: string;
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
  // Fire-and-forget Supabase mirror — no-op when signed out.
  try {
    const { queueProgressPush } = await import("@/lib/progressSync");
    queueProgressPush({ daily_course_progress: progress });
  } catch (err) {
    console.warn("[DailyCourse] sync queue error:", err);
  }
}

function mergeStepState(
  local: DailyCourseProgress["todayStepsCompleted"],
  remote: DailyCourseProgress["todayStepsCompleted"],
): DailyCourseProgress["todayStepsCompleted"] {
  return {
    listenRepeat: Boolean(local.listenRepeat || remote.listenRepeat),
    keyPoint: Boolean(local.keyPoint || remote.keyPoint),
    missionTalk: Boolean(local.missionTalk || remote.missionTalk),
    review: Boolean(local.review || remote.review),
  };
}

export function mergeDailyCourseProgress(
  local: DailyCourseProgress,
  remote: DailyCourseProgress,
): DailyCourseProgress {
  const localRank = (local.currentUnitIndex ?? 0) * 100 + (local.currentDayIndex ?? 0);
  const remoteRank = (remote.currentUnitIndex ?? 0) * 100 + (remote.currentDayIndex ?? 0);
  const winner = localRank >= remoteRank ? local : remote;
  const sameToday = local.todayDate === remote.todayDate;
  return {
    ...remote,
    ...winner,
    completedDays: Array.from(new Set([...(remote.completedDays ?? []), ...(local.completedDays ?? [])])),
    todayDate: winner.todayDate || todayDateString(),
    todayCompleted: sameToday ? Boolean(local.todayCompleted || remote.todayCompleted) : winner.todayCompleted,
    todayStepsCompleted: sameToday
      ? mergeStepState(local.todayStepsCompleted, remote.todayStepsCompleted)
      : winner.todayStepsCompleted,
    stats: {
      totalSentencesSpoken: Math.max(local.stats?.totalSentencesSpoken ?? 0, remote.stats?.totalSentencesSpoken ?? 0),
      totalDaysCompleted: Math.max(local.stats?.totalDaysCompleted ?? 0, remote.stats?.totalDaysCompleted ?? 0),
      averagePronunciationScore: Math.max(local.stats?.averagePronunciationScore ?? 0, remote.stats?.averagePronunciationScore ?? 0),
      currentStreak: Math.max(local.stats?.currentStreak ?? 0, remote.stats?.currentStreak ?? 0),
    },
  };
}

/** Hydrate AsyncStorage with the server's daily-course row. */
export async function hydrateProgressFromServer(progress: DailyCourseProgress): Promise<void> {
  try {
    const local = await loadProgress();
    const merged = mergeDailyCourseProgress(local, progress);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    if (JSON.stringify(merged) !== JSON.stringify(progress)) {
      const { queueProgressPush } = await import("@/lib/progressSync");
      queueProgressPush({ daily_course_progress: merged });
    }
  } catch (err) {
    console.warn("[DailyCourse] hydrate error:", err);
  }
}

// ── Dummy curriculum data ─────────────────────────────────────────────────────

export const UNITS: UnitData[] = [
  {
    id: "unit_1",
    level: "A1",
    title: { ko: "Unit 1: 첫 만남", en: "Unit 1: First Encounters", es: "Unidad 1: Primeros Encuentros", id: "Unit 1: Pertemuan Pertama" },
    days: [
      { id: "day_1", dayNumber: 1, topic: { ko: "만남 인사", en: "Meeting & Greeting", es: "Encuentros y Saludos", id: "Bertemu & Menyapa" }, unitIndex: 0 },
      { id: "day_2", dayNumber: 2, topic: { ko: "출신 말하기", en: "Saying Where You're From", es: "Decir De Dónde Eres", id: "Menyebut Asal" }, unitIndex: 0 },
      { id: "day_3", dayNumber: 3, topic: { ko: "직업 말하기", en: "Talking About Jobs", es: "Hablar de Trabajos", id: "Berbicara tentang Pekerjaan" }, unitIndex: 0 },
      { id: "day_4", dayNumber: 4, topic: { ko: "작별 인사", en: "Saying Goodbye", es: "Despedidas", id: "Ucapan Perpisahan" }, unitIndex: 0 },
      { id: "day_5", dayNumber: 5, topic: { ko: "안부 묻기", en: "Asking How Someone Is", es: "Preguntar Cómo Está Alguien", id: "Menanyakan Kabar" }, unitIndex: 0 },
      { id: "day_6", dayNumber: 6, topic: { ko: "종합 복습", en: "Unit Review", es: "Repaso de Unidad", id: "Ulasan Unit" }, unitIndex: 0 },
    ],
  },
  {
    id: "unit_2",
    level: "A1",
    title: { ko: "Unit 2: 일상 표현", en: "Unit 2: Everyday Expressions", es: "Unidad 2: Expresiones Cotidianas", id: "Unit 2: Ekspresi Sehari-hari" },
    days: [
      { id: "day_7",  dayNumber: 7,  topic: { ko: "숫자와 나이", en: "Numbers & Age", es: "Números y Edad", id: "Angka & Usia" }, unitIndex: 1 },
      { id: "day_8",  dayNumber: 8,  topic: { ko: "요일 말하기", en: "Days of the Week", es: "Días de la Semana", id: "Hari dalam Seminggu" }, unitIndex: 1 },
      { id: "day_9",  dayNumber: 9,  topic: { ko: "시간 표현", en: "Telling the Time", es: "Decir la Hora", id: "Menyebut Waktu" }, unitIndex: 1 },
      { id: "day_10", dayNumber: 10, topic: { ko: "날씨 말하기", en: "Talking About Weather", es: "Hablar del Tiempo", id: "Berbicara tentang Cuaca" }, unitIndex: 1 },
      { id: "day_11", dayNumber: 11, topic: { ko: "색상과 크기", en: "Colours & Sizes", es: "Colores y Tamaños", id: "Warna & Ukuran" }, unitIndex: 1 },
      { id: "day_12", dayNumber: 12, topic: { ko: "종합 복습", en: "Unit Review", es: "Repaso de Unidad", id: "Ulasan Unit" }, unitIndex: 1 },
    ],
  },
  {
    id: "unit_3",
    level: "A1",
    title: { ko: "Unit 3: 음식 & 주문", en: "Unit 3: Food & Ordering", es: "Unidad 3: Comida y Pedidos", id: "Unit 3: Makanan & Memesan" },
    days: [
      { id: "day_13", dayNumber: 13, topic: { ko: "음식 어휘", en: "Food Vocabulary", es: "Vocabulario de Comida", id: "Kosakata Makanan" }, unitIndex: 2 },
      { id: "day_14", dayNumber: 14, topic: { ko: "주문하기", en: "Ordering Food", es: "Pedir Comida", id: "Memesan Makanan" }, unitIndex: 2 },
      { id: "day_15", dayNumber: 15, topic: { ko: "맛 표현", en: "Describing Tastes", es: "Describir Sabores", id: "Menggambarkan Rasa" }, unitIndex: 2 },
      { id: "day_16", dayNumber: 16, topic: { ko: "식당에서", en: "At the Restaurant", es: "En el Restaurante", id: "Di Restoran" }, unitIndex: 2 },
      { id: "day_17", dayNumber: 17, topic: { ko: "음식 선호도", en: "Food Preferences", es: "Preferencias de Comida", id: "Preferensi Makanan" }, unitIndex: 2 },
      { id: "day_18", dayNumber: 18, topic: { ko: "종합 복습", en: "Unit Review", es: "Repaso de Unidad", id: "Ulasan Unit" }, unitIndex: 2 },
    ],
  },
  {
    id: "unit_4",
    level: "A1",
    title: { ko: "Unit 4: 장소 & 길 찾기", en: "Unit 4: Places & Directions", es: "Unidad 4: Lugares y Direcciones", id: "Unit 4: Tempat & Arah" },
    days: [
      { id: "day_19", dayNumber: 19, topic: { ko: "도시 장소", en: "Places in the City", es: "Lugares en la Ciudad", id: "Tempat di Kota" }, unitIndex: 3 },
      { id: "day_20", dayNumber: 20, topic: { ko: "길 안내 기초", en: "Basic Directions", es: "Direcciones Básicas", id: "Arah Dasar" }, unitIndex: 3 },
      { id: "day_21", dayNumber: 21, topic: { ko: "길 안내 심화", en: "More Directions", es: "Más Direcciones", id: "Arah Lanjutan" }, unitIndex: 3 },
      { id: "day_22", dayNumber: 22, topic: { ko: "교통수단", en: "Transportation", es: "Transporte", id: "Transportasi" }, unitIndex: 3 },
      { id: "day_23", dayNumber: 23, topic: { ko: "길 묻기", en: "Asking for Help Getting Around", es: "Pedir Ayuda para Orientarse", id: "Meminta Bantuan Arah" }, unitIndex: 3 },
      { id: "day_24", dayNumber: 24, topic: { ko: "종합 복습", en: "Unit Review", es: "Repaso de Unidad", id: "Ulasan Unit" }, unitIndex: 3 },
    ],
  },
  {
    id: "unit_5",
    level: "A2",
    title: { ko: "Unit 5: 사람 & 사교", en: "Unit 5: People & Social", es: "Unidad 5: Personas y Social", id: "Unit 5: Orang & Sosial" },
    days: [
      { id: "day_25", dayNumber: 25, topic: { ko: "가족 소개", en: "Family & People", es: "Familia y Personas", id: "Keluarga & Orang" }, unitIndex: 4 },
      { id: "day_26", dayNumber: 26, topic: { ko: "사람 묘사", en: "Describing People", es: "Describir Personas", id: "Menggambarkan Orang" }, unitIndex: 4 },
      { id: "day_27", dayNumber: 27, topic: { ko: "취미 & 여가", en: "Hobbies & Free Time", es: "Pasatiempos y Tiempo Libre", id: "Hobi & Waktu Luang" }, unitIndex: 4 },
      { id: "day_28", dayNumber: 28, topic: { ko: "감정 표현", en: "Feelings & Emotions", es: "Sentimientos y Emociones", id: "Perasaan & Emosi" }, unitIndex: 4 },
      { id: "day_29", dayNumber: 29, topic: { ko: "약속 잡기", en: "Making Plans", es: "Hacer Planes", id: "Membuat Rencana" }, unitIndex: 4 },
      { id: "day_30", dayNumber: 30, topic: { ko: "A1 완료 복습", en: "Final Review & A1 Complete", es: "Repaso Final y A1 Completo", id: "Ulasan Akhir & A1 Selesai" }, unitIndex: 4 },
    ],
  },
];

export function getAllDays(): DayData[] {
  return UNITS.flatMap((u) => u.days);
}

export function getTri(tri: Tri, lang: "ko" | "en" | "es" | "id"): string {
  return tri[lang] ?? tri.en;
}

export function langToCode(nativeLang: string): "ko" | "en" | "es" | "id" {
  if (nativeLang === "korean") return "ko";
  if (nativeLang === "spanish") return "es";
  if (nativeLang === "indonesian") return "id";
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
  indonesian: [
    "Selamat pagi, partner! Ayo latihan bareng hari ini!",
    "Selamat datang kembali! Siap memulai misi hari ini?",
    "Kamu pasti bisa, partner! Ayo buat hari ini berarti!",
    "Waktunya naik level! Ayo taklukkan latihan hari ini!",
    "Setiap hari kamu berlatih, kamu makin dekat ke lancar!",
  ],
};

export function getRandomBriefing(nativeLang: string): string {
  const msgs = RUDY_BRIEFINGS[nativeLang] ?? RUDY_BRIEFINGS.english;
  return msgs[Math.floor(Math.random() * msgs.length)];
}

// "보기 → 만들기 → 뱉기 → 복습" — 뇌새김 시그니처 3단 학습 프레임 + 복습.
// 한국 사용자에게 친숙한 카피로 정렬한 4-step Rudy 레슨 라벨.
// Step 컴포넌트 내부의 자세한 instruction text(예: "듣고 따라해보세요")는
// 그대로 두고, 헤더/탭/완료 화면에 표시되는 짧은 step name만 이걸로 통일.
export const STEP_LABELS: Record<string, [string, string, string, string]> = {
  korean:  ["보기", "만들기", "뱉기", "복습"],
  english: ["See", "Build", "Speak", "Review"],
  spanish: ["Ver", "Construir", "Hablar", "Repasar"],
  indonesian: ["Lihat", "Susun", "Bicara", "Ulas"],
};

/**
 * Convert a CEFR level code (A1/A2/B1/B2) into a Korean-market tier label
 * that mirrors how local English-learning brands (시원스쿨, 야나두, 뇌새김)
 * talk about progression. International (en/es) users keep the raw CEFR
 * code since it is the international standard they recognise.
 *
 * Mapping rationale:
 *  A1 입문   – first contact / absolute beginner
 *  A2 기초   – basic survival / core daily phrases
 *  B1 실전   – real-world conversations
 *  B2 심화   – deeper expression
 */
export function getCefrTierLabel(level: CourseLevel, nativeLang: string): string {
  if (nativeLang !== "korean") return level;
  switch (level) {
    case "A1": return "입문";
    case "A2": return "기초";
    case "B1": return "실전";
    case "B2": return "심화";
    default:   return level;
  }
}
