import type { Tri } from "./dailyCourseData";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LessonSentence {
  text: string;        // sentence in the target language being learned
  speechLang: string;  // Azure TTS lang code e.g. "en-GB"
  ttsVoice?: string;   // specific Azure neural voice name e.g. "en-GB-RyanNeural"
  meaning: Tri;        // translation to show (nativeLang selects which field)
}

export interface FillBlankQuiz {
  type: "select" | "input";
  promptWithBlank: string;  // e.g. "My name ___ Rudy."
  answer: string;           // correct word/phrase
  options?: string[];        // only for "select" type
  fullSentence: string;     // complete sentence for speak-after
  fullSentenceMeaning: Tri; // translation for display
}

export interface Step2Data {
  explanation: Tri;
  quizzes: FillBlankQuiz[];
}

export interface DayLessonData {
  step1Sentences: LessonSentence[];
  step2: Step2Data;
}

// ── STEP 3: Mission Talk ──────────────────────────────────────────────────────

export interface MissionTalkLangData {
  situation: Tri;          // shown to user in nativeLang
  gptPrompt: string;       // system prompt — uses {targetLang} placeholder
  speechLang: string;      // TTS lang code for Rudy's voice
  suggestedAnswers: string[]; // 2-3 suggestions IN the target language
}

// ── STEP 4: Quick Review ──────────────────────────────────────────────────────

export interface ReviewQuestion {
  type: "speak" | "fill_blank";
  // speak type
  sentence?: string;
  speechLang?: string;
  meaning?: Tri;
  // fill_blank type
  promptWithBlank?: string;
  answer?: string;
  options?: string[];
  fullSentence?: string;
  fullSentenceMeaning?: Tri;
  isYesterdayReview?: boolean;
}

// ── Rewards ───────────────────────────────────────────────────────────────────

export interface DayRewards {
  xp: number;
  bonusAllVoice: number;
  bonusPronunciation: number;
}

export type LearningLangKey = "english" | "spanish" | "korean";

// ── Speech lang codes ────────────────────────────────────────────────────────


export const SPEECH_LANG: Record<LearningLangKey, string> = {
  english: "en-GB",
  spanish: "es-ES",
  korean:  "ko-KR",
};

// ── Day 1–6 content (all 3 learning languages) ─────────────────────────────

export const LESSON_CONTENT: Record<string, Partial<Record<LearningLangKey, DayLessonData>>> = {

  // ─────────────── Day 1: Meeting & Greeting ───────────────────────────────
  day_1: {
    english: {
      step1Sentences: [
        { text: "Hello, my name is Rudy.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." } },
        { text: "Nice to meet you.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." } },
        { text: "Where are you from?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" } },
      ],
      step2: {
        explanation: { ko: "자기소개할 때 'My name is ___' 또는 'I'm ___'을 사용해요. 'I'm'은 'I am'의 줄임말이에요.", en: "When introducing yourself, use 'My name is ___' or 'I'm ___'. 'I'm' is short for 'I am'.", es: "Para presentarte, usa 'My name is ___' o 'I'm ___'. 'I'm' es la abreviación de 'I am'." },
        quizzes: [
          { type: "select", promptWithBlank: "My name ___ Rudy.", answer: "is", options: ["is", "am", "are"], fullSentence: "My name is Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "Nice to ___ you.", answer: "meet", options: ["meet", "see", "have"], fullSentence: "Nice to meet you.", fullSentenceMeaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." } },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Hola, me llamo Rudy.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." } },
        { text: "Mucho gusto.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." } },
        { text: "¿De dónde eres?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" } },
      ],
      step2: {
        explanation: { ko: "자기소개할 때 'My name is ___' 또는 'I'm ___'을 사용해요. 'I'm'은 'I am'의 줄임말이에요.", en: "When introducing yourself, use 'My name is ___' or 'I'm ___'. 'I'm' is short for 'I am'.", es: "Para presentarte, usa 'My name is ___' o 'I'm ___'. 'I'm' es la abreviación de 'I am'." },
        quizzes: [
          { type: "select", promptWithBlank: "My name ___ Rudy.", answer: "is", options: ["is", "am", "are"], fullSentence: "My name is Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "Nice to ___ you.", answer: "meet", options: ["meet", "see", "have"], fullSentence: "Nice to meet you.", fullSentenceMeaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." } },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "안녕하세요, 제 이름은 루디예요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." } },
        { text: "만나서 반갑습니다.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." } },
        { text: "어디에서 오셨어요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" } },
      ],
      step2: {
        explanation: { ko: "자기소개할 때 'My name is ___' 또는 'I'm ___'을 사용해요. 'I'm'은 'I am'의 줄임말이에요.", en: "When introducing yourself, use 'My name is ___' or 'I'm ___'. 'I'm' is short for 'I am'.", es: "Para presentarte, usa 'My name is ___' o 'I'm ___'. 'I'm' es la abreviación de 'I am'." },
        quizzes: [
          { type: "select", promptWithBlank: "My name ___ Rudy.", answer: "is", options: ["is", "am", "are"], fullSentence: "My name is Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "Nice to ___ you.", answer: "meet", options: ["meet", "see", "have"], fullSentence: "Nice to meet you.", fullSentenceMeaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." } },
        ],
      },
    },
  },

  // ─────────────── Day 2: Where Are You From? ──────────────────────────────
  day_2: {
    english: {
      step1Sentences: [
        { text: "I'm from Korea.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
        { text: "I live in Seoul.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
        { text: "It's a beautiful city.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "아름다운 도시예요.", en: "It's a beautiful city.", es: "Es una ciudad hermosa." } },
      ],
      step2: {
        explanation: { ko: "출신을 말할 때 'I'm from ___'을 써요. 사는 곳을 말할 때는 'I live in ___'을 써요.", en: "Use 'I'm from ___' for origin. Use 'I live in ___' for where you live now.", es: "Usa 'I'm from ___' para el origen. Usa 'I live in ___' para donde vives ahora." },
        quizzes: [
          { type: "select", promptWithBlank: "I'm ___ Korea.", answer: "from", options: ["from", "in", "at"], fullSentence: "I'm from Korea.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "select", promptWithBlank: "I ___ in Seoul.", answer: "live", options: ["live", "from", "go"], fullSentence: "I live in Seoul.", fullSentenceMeaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Soy de Corea.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
        { text: "Vivo en Seúl.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
        { text: "Es una ciudad hermosa.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "아름다운 도시예요.", en: "It's a beautiful city.", es: "Es una ciudad hermosa." } },
      ],
      step2: {
        explanation: { ko: "출신을 말할 때 'I'm from ___'을 써요. 사는 곳을 말할 때는 'I live in ___'을 써요.", en: "Use 'I'm from ___' for origin. Use 'I live in ___' for where you live now.", es: "Usa 'I'm from ___' para el origen. Usa 'I live in ___' para donde vives ahora." },
        quizzes: [
          { type: "select", promptWithBlank: "I'm ___ Korea.", answer: "from", options: ["from", "in", "at"], fullSentence: "I'm from Korea.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "select", promptWithBlank: "I ___ in Seoul.", answer: "live", options: ["live", "from", "go"], fullSentence: "I live in Seoul.", fullSentenceMeaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "저는 한국에서 왔어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
        { text: "서울에 살고 있어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
        { text: "아름다운 도시예요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "아름다운 도시예요.", en: "It's a beautiful city.", es: "Es una ciudad hermosa." } },
      ],
      step2: {
        explanation: { ko: "출신을 말할 때 'I'm from ___'을 써요. 사는 곳을 말할 때는 'I live in ___'을 써요.", en: "Use 'I'm from ___' for origin. Use 'I live in ___' for where you live now.", es: "Usa 'I'm from ___' para el origen. Usa 'I live in ___' para donde vives ahora." },
        quizzes: [
          { type: "select", promptWithBlank: "I'm ___ Korea.", answer: "from", options: ["from", "in", "at"], fullSentence: "I'm from Korea.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "select", promptWithBlank: "I ___ in Seoul.", answer: "live", options: ["live", "from", "go"], fullSentence: "I live in Seoul.", fullSentenceMeaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
        ],
      },
    },
  },

  // ─────────────── Day 3: Talking About Jobs ───────────────────────────────
  day_3: {
    english: {
      step1Sentences: [
        { text: "What do you do?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" } },
        { text: "I'm a student.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
        { text: "I work at a museum.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "박물관에서 일해요.", en: "I work at a museum.", es: "Trabajo en un museo." } },
      ],
      step2: {
        explanation: { ko: "직업을 말할 때 'I'm a ___'을 써요. 일하는 곳을 말할 때 'I work at ___'을 써요. 참고: 모음(a,e,i,o,u)으로 시작하면 'an' (예: an artist).", en: "Use 'I'm a ___' for jobs. 'I work at ___' for workplace. Note: use 'an' before vowels (an artist).", es: "Usa 'I'm a ___' para trabajos. 'I work at ___' para lugar de trabajo. Nota: usa 'an' antes de vocales (an artist)." },
        quizzes: [
          { type: "select", promptWithBlank: "I'm ___ teacher.", answer: "a", options: ["a", "an", "the"], fullSentence: "I'm a teacher.", fullSentenceMeaning: { ko: "저는 선생님이에요.", en: "I'm a teacher.", es: "Soy profesor." } },
          { type: "select", promptWithBlank: "I work ___ a museum.", answer: "at", options: ["at", "in", "on"], fullSentence: "I work at a museum.", fullSentenceMeaning: { ko: "박물관에서 일해요.", en: "I work at a museum.", es: "Trabajo en un museo." } },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "¿A qué te dedicas?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" } },
        { text: "Soy estudiante.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
        { text: "Trabajo en un museo.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "박물관에서 일해요.", en: "I work at a museum.", es: "Trabajo en un museo." } },
      ],
      step2: {
        explanation: { ko: "직업을 말할 때 'I'm a ___'을 써요. 일하는 곳을 말할 때 'I work at ___'을 써요. 참고: 모음(a,e,i,o,u)으로 시작하면 'an' (예: an artist).", en: "Use 'I'm a ___' for jobs. 'I work at ___' for workplace. Note: use 'an' before vowels (an artist).", es: "Usa 'I'm a ___' para trabajos. 'I work at ___' para lugar de trabajo. Nota: usa 'an' antes de vocales (an artist)." },
        quizzes: [
          { type: "select", promptWithBlank: "I'm ___ teacher.", answer: "a", options: ["a", "an", "the"], fullSentence: "I'm a teacher.", fullSentenceMeaning: { ko: "저는 선생님이에요.", en: "I'm a teacher.", es: "Soy profesor." } },
          { type: "select", promptWithBlank: "I work ___ a museum.", answer: "at", options: ["at", "in", "on"], fullSentence: "I work at a museum.", fullSentenceMeaning: { ko: "박물관에서 일해요.", en: "I work at a museum.", es: "Trabajo en un museo." } },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "무슨 일 하세요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" } },
        { text: "저는 학생이에요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
        { text: "박물관에서 일해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "박물관에서 일해요.", en: "I work at a museum.", es: "Trabajo en un museo." } },
      ],
      step2: {
        explanation: { ko: "직업을 말할 때 'I'm a ___'을 써요. 일하는 곳을 말할 때 'I work at ___'을 써요. 참고: 모음(a,e,i,o,u)으로 시작하면 'an' (예: an artist).", en: "Use 'I'm a ___' for jobs. 'I work at ___' for workplace. Note: use 'an' before vowels (an artist).", es: "Usa 'I'm a ___' para trabajos. 'I work at ___' para lugar de trabajo. Nota: usa 'an' antes de vocales (an artist)." },
        quizzes: [
          { type: "select", promptWithBlank: "I'm ___ teacher.", answer: "a", options: ["a", "an", "the"], fullSentence: "I'm a teacher.", fullSentenceMeaning: { ko: "저는 선생님이에요.", en: "I'm a teacher.", es: "Soy profesor." } },
          { type: "select", promptWithBlank: "I work ___ a museum.", answer: "at", options: ["at", "in", "on"], fullSentence: "I work at a museum.", fullSentenceMeaning: { ko: "박물관에서 일해요.", en: "I work at a museum.", es: "Trabajo en un museo." } },
        ],
      },
    },
  },

  // ─────────────── Day 4: Saying Goodbye ───────────────────────────────────
  day_4: {
    english: {
      step1Sentences: [
        { text: "Goodbye! See you later.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "안녕히 가세요! 다음에 봐요.", en: "Goodbye! See you later.", es: "¡Adiós! Hasta luego." } },
        { text: "Take care!", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "잘 가요!", en: "Take care!", es: "¡Cuídate!" } },
        { text: "It was nice meeting you.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
      ],
      step2: {
        explanation: { ko: "'Goodbye'는 정식, 'Bye'는 캐주얼, 'See you later'는 다시 볼 때. 'Take care'는 상대를 걱정하는 따뜻한 표현이에요.", en: "'Goodbye' is formal, 'Bye' is casual, 'See you later' when meeting again. 'Take care' is a warm expression.", es: "'Goodbye' es formal, 'Bye' es casual, 'See you later' cuando te verás de nuevo. 'Take care' es una expresión cálida." },
        quizzes: [
          { type: "select", promptWithBlank: "See you ___!", answer: "later", options: ["later", "after", "next"], fullSentence: "See you later!", fullSentenceMeaning: { ko: "다음에 봐요!", en: "See you later!", es: "¡Hasta luego!" } },
          { type: "select", promptWithBlank: "It was nice ___ you.", answer: "meeting", options: ["meeting", "meet", "met"], fullSentence: "It was nice meeting you.", fullSentenceMeaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "¡Adiós! Hasta luego.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "안녕히 가세요! 다음에 봐요.", en: "Goodbye! See you later.", es: "¡Adiós! Hasta luego." } },
        { text: "¡Cuídate!", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "잘 가요!", en: "Take care!", es: "¡Cuídate!" } },
        { text: "Fue un placer conocerte.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
      ],
      step2: {
        explanation: { ko: "'Goodbye'는 정식, 'Bye'는 캐주얼, 'See you later'는 다시 볼 때. 'Take care'는 상대를 걱정하는 따뜻한 표현이에요.", en: "'Goodbye' is formal, 'Bye' is casual, 'See you later' when meeting again. 'Take care' is a warm expression.", es: "'Goodbye' es formal, 'Bye' es casual, 'See you later' cuando te verás de nuevo. 'Take care' es una expresión cálida." },
        quizzes: [
          { type: "select", promptWithBlank: "See you ___!", answer: "later", options: ["later", "after", "next"], fullSentence: "See you later!", fullSentenceMeaning: { ko: "다음에 봐요!", en: "See you later!", es: "¡Hasta luego!" } },
          { type: "select", promptWithBlank: "It was nice ___ you.", answer: "meeting", options: ["meeting", "meet", "met"], fullSentence: "It was nice meeting you.", fullSentenceMeaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "안녕히 가세요! 다음에 봐요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "안녕히 가세요! 다음에 봐요.", en: "Goodbye! See you later.", es: "¡Adiós! Hasta luego." } },
        { text: "잘 가요!", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "잘 가요!", en: "Take care!", es: "¡Cuídate!" } },
        { text: "만나서 반가웠어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
      ],
      step2: {
        explanation: { ko: "'Goodbye'는 정식, 'Bye'는 캐주얼, 'See you later'는 다시 볼 때. 'Take care'는 상대를 걱정하는 따뜻한 표현이에요.", en: "'Goodbye' is formal, 'Bye' is casual, 'See you later' when meeting again. 'Take care' is a warm expression.", es: "'Goodbye' es formal, 'Bye' es casual, 'See you later' cuando te verás de nuevo. 'Take care' es una expresión cálida." },
        quizzes: [
          { type: "select", promptWithBlank: "See you ___!", answer: "later", options: ["later", "after", "next"], fullSentence: "See you later!", fullSentenceMeaning: { ko: "다음에 봐요!", en: "See you later!", es: "¡Hasta luego!" } },
          { type: "select", promptWithBlank: "It was nice ___ you.", answer: "meeting", options: ["meeting", "meet", "met"], fullSentence: "It was nice meeting you.", fullSentenceMeaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
        ],
      },
    },
  },

  // ─────────────── Day 5: How Are You? ─────────────────────────────────────
  day_5: {
    english: {
      step1Sentences: [
        { text: "How are you today?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?" } },
        { text: "I'm fine, thank you.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "잘 지내요, 감사합니다.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
        { text: "Not bad, how about you?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "괜찮아요, 당신은요?", en: "Not bad, how about you?", es: "No está mal, ¿y tú?" } },
      ],
      step2: {
        explanation: { ko: "'How are you?'에 'I'm fine' 말고도 다양한 대답이 있어요: 'I'm great!', 'Not bad', 'I'm okay', 'A little tired'. 상대에게 되묻을 때 'And you?'를 붙여요.", en: "Besides 'I'm fine', you can say: 'I'm great!', 'Not bad', 'I'm okay', 'A little tired'. Add 'And you?' to ask back.", es: "Además de 'I'm fine', puedes decir: 'I'm great!', 'Not bad', 'I'm okay', 'A little tired'. Agrega 'And you?' para preguntar de vuelta." },
        quizzes: [
          { type: "select", promptWithBlank: "How ___ you?", answer: "are", options: ["are", "is", "am"], fullSentence: "How are you?", fullSentenceMeaning: { ko: "어떻게 지내요?", en: "How are you?", es: "¿Cómo estás?" } },
          { type: "select", promptWithBlank: "I'm fine, ___ you.", answer: "thank", options: ["thank", "thanks", "and"], fullSentence: "I'm fine, thank you.", fullSentenceMeaning: { ko: "잘 지내요, 감사합니다.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "¿Cómo estás hoy?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?" } },
        { text: "Estoy bien, gracias.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "잘 지내요, 감사합니다.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
        { text: "No está mal, ¿y tú?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "괜찮아요, 당신은요?", en: "Not bad, how about you?", es: "No está mal, ¿y tú?" } },
      ],
      step2: {
        explanation: { ko: "'How are you?'에 'I'm fine' 말고도 다양한 대답이 있어요: 'I'm great!', 'Not bad', 'I'm okay', 'A little tired'. 상대에게 되묻을 때 'And you?'를 붙여요.", en: "Besides 'I'm fine', you can say: 'I'm great!', 'Not bad', 'I'm okay', 'A little tired'. Add 'And you?' to ask back.", es: "Además de 'I'm fine', puedes decir: 'I'm great!', 'Not bad', 'I'm okay', 'A little tired'. Agrega 'And you?' para preguntar de vuelta." },
        quizzes: [
          { type: "select", promptWithBlank: "How ___ you?", answer: "are", options: ["are", "is", "am"], fullSentence: "How are you?", fullSentenceMeaning: { ko: "어떻게 지내요?", en: "How are you?", es: "¿Cómo estás?" } },
          { type: "select", promptWithBlank: "I'm fine, ___ you.", answer: "thank", options: ["thank", "thanks", "and"], fullSentence: "I'm fine, thank you.", fullSentenceMeaning: { ko: "잘 지내요, 감사합니다.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "오늘 어떻게 지내요?", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?" } },
        { text: "잘 지내요, 감사합니다.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "잘 지내요, 감사합니다.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
        { text: "괜찮아요, 당신은요?", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "괜찮아요, 당신은요?", en: "Not bad, how about you?", es: "No está mal, ¿y tú?" } },
      ],
      step2: {
        explanation: { ko: "'How are you?'에 'I'm fine' 말고도 다양한 대답이 있어요: 'I'm great!', 'Not bad', 'I'm okay', 'A little tired'. 상대에게 되묻을 때 'And you?'를 붙여요.", en: "Besides 'I'm fine', you can say: 'I'm great!', 'Not bad', 'I'm okay', 'A little tired'. Add 'And you?' to ask back.", es: "Además de 'I'm fine', puedes decir: 'I'm great!', 'Not bad', 'I'm okay', 'A little tired'. Agrega 'And you?' para preguntar de vuelta." },
        quizzes: [
          { type: "select", promptWithBlank: "How ___ you?", answer: "are", options: ["are", "is", "am"], fullSentence: "How are you?", fullSentenceMeaning: { ko: "어떻게 지내요?", en: "How are you?", es: "¿Cómo estás?" } },
          { type: "select", promptWithBlank: "I'm fine, ___ you.", answer: "thank", options: ["thank", "thanks", "and"], fullSentence: "I'm fine, thank you.", fullSentenceMeaning: { ko: "잘 지내요, 감사합니다.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
        ],
      },
    },
  },

  // ─────────────── Day 6: Unit 1 Review ────────────────────────────────────
  day_6: {
    english: {
      step1Sentences: [
        { text: "Hello, my name is Rudy. Nice to meet you.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 만나서 반갑습니다.", en: "Hello, my name is Rudy. Nice to meet you.", es: "Hola, me llamo Rudy. Mucho gusto." } },
        { text: "I'm from London. I work as a detective.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "저는 런던에서 왔어요. 탐정으로 일해요.", en: "I'm from London. I work as a detective.", es: "Soy de Londres. Trabajo como detective." } },
        { text: "How are you? I'm great, thanks! See you later!", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "어떻게 지내세요? 잘 지내요, 감사합니다! 다음에 봐요!", en: "How are you? I'm great, thanks! See you later!", es: "¿Cómo estás? ¡Estoy genial, gracias! ¡Hasta luego!" } },
      ],
      step2: {
        explanation: { ko: "이번 주에 배운 모든 표현을 복습해요! 자기소개(이름, 출신, 직업)와 인사(만남, 안부, 작별)를 자연스럽게 연결해서 말해보세요.", en: "Let's review everything! Connect introductions (name, origin, job) with greetings (meeting, asking how, goodbye) naturally.", es: "¡Repasemos todo! Conecta presentaciones (nombre, origen, trabajo) con saludos (encuentro, preguntar cómo, despedida) naturalmente." },
        quizzes: [
          { type: "select", promptWithBlank: "My name ___ Rudy.", answer: "is", options: ["is", "am", "are"], fullSentence: "My name is Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "How ___ you?", answer: "are", options: ["are", "is", "am"], fullSentence: "How are you?", fullSentenceMeaning: { ko: "어떻게 지내요?", en: "How are you?", es: "¿Cómo estás?" } },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Hola, me llamo Rudy. Mucho gusto.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 만나서 반갑습니다.", en: "Hello, my name is Rudy. Nice to meet you.", es: "Hola, me llamo Rudy. Mucho gusto." } },
        { text: "Soy de Londres. Trabajo como detective.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "저는 런던에서 왔어요. 탐정으로 일해요.", en: "I'm from London. I work as a detective.", es: "Soy de Londres. Trabajo como detective." } },
        { text: "¿Cómo estás? ¡Estoy genial, gracias! ¡Hasta luego!", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "어떻게 지내세요? 잘 지내요, 감사합니다! 다음에 봐요!", en: "How are you? I'm great, thanks! See you later!", es: "¿Cómo estás? ¡Estoy genial, gracias! ¡Hasta luego!" } },
      ],
      step2: {
        explanation: { ko: "이번 주에 배운 모든 표현을 복습해요! 자기소개(이름, 출신, 직업)와 인사(만남, 안부, 작별)를 자연스럽게 연결해서 말해보세요.", en: "Let's review everything! Connect introductions (name, origin, job) with greetings (meeting, asking how, goodbye) naturally.", es: "¡Repasemos todo! Conecta presentaciones (nombre, origen, trabajo) con saludos (encuentro, preguntar cómo, despedida) naturalmente." },
        quizzes: [
          { type: "select", promptWithBlank: "My name ___ Rudy.", answer: "is", options: ["is", "am", "are"], fullSentence: "My name is Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "How ___ you?", answer: "are", options: ["are", "is", "am"], fullSentence: "How are you?", fullSentenceMeaning: { ko: "어떻게 지내요?", en: "How are you?", es: "¿Cómo estás?" } },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "안녕하세요, 제 이름은 루디예요. 만나서 반갑습니다.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 만나서 반갑습니다.", en: "Hello, my name is Rudy. Nice to meet you.", es: "Hola, me llamo Rudy. Mucho gusto." } },
        { text: "저는 런던에서 왔어요. 탐정으로 일해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "저는 런던에서 왔어요. 탐정으로 일해요.", en: "I'm from London. I work as a detective.", es: "Soy de Londres. Trabajo como detective." } },
        { text: "어떻게 지내세요? 잘 지내요, 감사합니다! 다음에 봐요!", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "어떻게 지내세요? 잘 지내요, 감사합니다! 다음에 봐요!", en: "How are you? I'm great, thanks! See you later!", es: "¿Cómo estás? ¡Estoy genial, gracias! ¡Hasta luego!" } },
      ],
      step2: {
        explanation: { ko: "이번 주에 배운 모든 표현을 복습해요! 자기소개(이름, 출신, 직업)와 인사(만남, 안부, 작별)를 자연스럽게 연결해서 말해보세요.", en: "Let's review everything! Connect introductions (name, origin, job) with greetings (meeting, asking how, goodbye) naturally.", es: "¡Repasemos todo! Conecta presentaciones (nombre, origen, trabajo) con saludos (encuentro, preguntar cómo, despedida) naturalmente." },
        quizzes: [
          { type: "select", promptWithBlank: "My name ___ Rudy.", answer: "is", options: ["is", "am", "are"], fullSentence: "My name is Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "How ___ you?", answer: "are", options: ["are", "is", "am"], fullSentence: "How are you?", fullSentenceMeaning: { ko: "어떻게 지내요?", en: "How are you?", es: "¿Cómo estás?" } },
        ],
      },
    },
  },
};

// ── STEP 3: Mission Talk content ──────────────────────────────────────────────

export const MISSION_CONTENT: Record<string, Partial<Record<LearningLangKey, MissionTalkLangData>>> = {

  day_1: {
    english: { situation: { ko: "루디가 런던 박물관에서 새 동료를 만났습니다.", en: "Rudy meets a new colleague at the London museum.", es: "Rudy conoce a un nuevo colega en el museo de Londres." }, gptPrompt: "You are Rudy the fox detective meeting a new partner at the London museum. Have a simple A1-level introduction conversation in {targetLang}. Guide through: 1) greeting 2) asking name 3) asking where they're from 4) asking what they do 5) saying nice to meet you. Keep sentences very short. After 5-6 exchanges, say goodbye warmly.", speechLang: "en-GB", suggestedAnswers: ["Hello!", "My name is ___.", "I'm from ___.", "I'm a student.", "Nice to meet you too!"] },
    spanish: { situation: { ko: "루디가 런던 박물관에서 새 동료를 만났습니다.", en: "Rudy meets a new colleague at the London museum.", es: "Rudy conoce a un nuevo colega en el museo de Londres." }, gptPrompt: "You are Rudy the fox detective meeting a new partner at the London museum. Have a simple A1-level introduction conversation in {targetLang}. Guide through: 1) greeting 2) asking name 3) asking where they're from 4) asking what they do 5) saying nice to meet you. Keep sentences very short. After 5-6 exchanges, say goodbye warmly.", speechLang: "es-ES", suggestedAnswers: ["¡Hola!", "Me llamo ___.", "Soy de ___.", "Soy estudiante.", "¡Mucho gusto también!"] },
    korean: { situation: { ko: "루디가 런던 박물관에서 새 동료를 만났습니다.", en: "Rudy meets a new colleague at the London museum.", es: "Rudy conoce a un nuevo colega en el museo de Londres." }, gptPrompt: "You are Rudy the fox detective meeting a new partner at the London museum. Have a simple A1-level introduction conversation in {targetLang}. Guide through: 1) greeting 2) asking name 3) asking where they're from 4) asking what they do 5) saying nice to meet you. Keep sentences very short. After 5-6 exchanges, say goodbye warmly.", speechLang: "ko-KR", suggestedAnswers: ["안녕하세요!", "제 이름은 ___이에요.", "저는 ___에서 왔어요.", "저는 학생이에요.", "만나서 반가워요!"] },
  },

  day_2: {
    english: { situation: { ko: "루디가 다른 나라에서 온 동료들과 이야기하고 있습니다.", en: "Rudy is chatting with colleagues from different countries.", es: "Rudy está hablando con colegas de diferentes países." }, gptPrompt: "You are Rudy chatting with your new partner about where you're both from. Simple A1 conversation in {targetLang}. Ask about: 1) their country 2) their city 3) what it's like there 4) if they like it. Share that you're from London. Keep it simple and encouraging.", speechLang: "en-GB", suggestedAnswers: ["I'm from Korea.", "I live in Seoul.", "It's a big city.", "Yes, I like it!", "Seoul is beautiful."] },
    spanish: { situation: { ko: "루디가 다른 나라에서 온 동료들과 이야기하고 있습니다.", en: "Rudy is chatting with colleagues from different countries.", es: "Rudy está hablando con colegas de diferentes países." }, gptPrompt: "You are Rudy chatting with your new partner about where you're both from. Simple A1 conversation in {targetLang}. Ask about: 1) their country 2) their city 3) what it's like there 4) if they like it. Share that you're from London. Keep it simple and encouraging.", speechLang: "es-ES", suggestedAnswers: ["Soy de Corea.", "Vivo en Seúl.", "Es una ciudad grande.", "¡Sí, me gusta!", "Seúl es hermoso."] },
    korean: { situation: { ko: "루디가 다른 나라에서 온 동료들과 이야기하고 있습니다.", en: "Rudy is chatting with colleagues from different countries.", es: "Rudy está hablando con colegas de diferentes países." }, gptPrompt: "You are Rudy chatting with your new partner about where you're both from. Simple A1 conversation in {targetLang}. Ask about: 1) their country 2) their city 3) what it's like there 4) if they like it. Share that you're from London. Keep it simple and encouraging.", speechLang: "ko-KR", suggestedAnswers: ["저는 한국에서 왔어요.", "서울에 살아요.", "큰 도시예요.", "네, 좋아해요!", "서울은 아름다워요."] },
  },

  day_3: {
    english: { situation: { ko: "박물관에서 여러 직업의 사람들을 만나고 있습니다.", en: "Meeting people with different jobs at the museum.", es: "Conociendo personas con diferentes trabajos en el museo." }, gptPrompt: "You are Rudy at a museum event meeting your new partner. Talk about jobs in simple A1 {targetLang}. Ask about: 1) what they do 2) where they work 3) if they like their job 4) share your job as detective. Keep very simple.", speechLang: "en-GB", suggestedAnswers: ["I'm a student.", "I work at a school.", "Yes, I like it.", "That's interesting!", "I want to be a detective too!"] },
    spanish: { situation: { ko: "박물관에서 여러 직업의 사람들을 만나고 있습니다.", en: "Meeting people with different jobs at the museum.", es: "Conociendo personas con diferentes trabajos en el museo." }, gptPrompt: "You are Rudy at a museum event meeting your new partner. Talk about jobs in simple A1 {targetLang}. Ask about: 1) what they do 2) where they work 3) if they like their job 4) share your job as detective. Keep very simple.", speechLang: "es-ES", suggestedAnswers: ["Soy estudiante.", "Trabajo en una escuela.", "Sí, me gusta.", "¡Qué interesante!", "¡Yo también quiero ser detective!"] },
    korean: { situation: { ko: "박물관에서 여러 직업의 사람들을 만나고 있습니다.", en: "Meeting people with different jobs at the museum.", es: "Conociendo personas con diferentes trabajos en el museo." }, gptPrompt: "You are Rudy at a museum event meeting your new partner. Talk about jobs in simple A1 {targetLang}. Ask about: 1) what they do 2) where they work 3) if they like their job 4) share your job as detective. Keep very simple.", speechLang: "ko-KR", suggestedAnswers: ["저는 학생이에요.", "학교에서 일해요.", "네, 좋아해요.", "재미있네요!", "저도 탐정이 되고 싶어요!"] },
  },

  day_4: {
    english: { situation: { ko: "박물관에서 동료와 하루를 마치고 헤어지는 상황입니다.", en: "Wrapping up a day at the museum and saying goodbye.", es: "Terminando un día en el museo y despidiéndose." }, gptPrompt: "You are Rudy saying goodbye to your partner after a day at the museum. Simple A1 {targetLang}. Practice: 1) saying it was a good day 2) saying goodbye 3) making plans to meet again 4) wishing well. Keep very simple and warm.", speechLang: "en-GB", suggestedAnswers: ["It was a good day!", "Goodbye, Rudy!", "See you tomorrow!", "Take care!", "It was nice meeting you."] },
    spanish: { situation: { ko: "박물관에서 동료와 하루를 마치고 헤어지는 상황입니다.", en: "Wrapping up a day at the museum and saying goodbye.", es: "Terminando un día en el museo y despidiéndose." }, gptPrompt: "You are Rudy saying goodbye to your partner after a day at the museum. Simple A1 {targetLang}. Practice: 1) saying it was a good day 2) saying goodbye 3) making plans to meet again 4) wishing well. Keep very simple and warm.", speechLang: "es-ES", suggestedAnswers: ["¡Fue un buen día!", "¡Adiós, Rudy!", "¡Hasta mañana!", "¡Cuídate!", "Fue un placer conocerte."] },
    korean: { situation: { ko: "박물관에서 동료와 하루를 마치고 헤어지는 상황입니다.", en: "Wrapping up a day at the museum and saying goodbye.", es: "Terminando un día en el museo y despidiéndose." }, gptPrompt: "You are Rudy saying goodbye to your partner after a day at the museum. Simple A1 {targetLang}. Practice: 1) saying it was a good day 2) saying goodbye 3) making plans to meet again 4) wishing well. Keep very simple and warm.", speechLang: "ko-KR", suggestedAnswers: ["좋은 하루였어요!", "안녕히 가세요, 루디!", "내일 봐요!", "잘 가요!", "만나서 반가웠어요."] },
  },

  day_5: {
    english: { situation: { ko: "아침에 박물관에 도착해서 동료들과 안부를 나누고 있습니다.", en: "Arriving at the museum in the morning and greeting colleagues.", es: "Llegando al museo por la mañana y saludando a los colegas." }, gptPrompt: "You are Rudy greeting your partner in the morning at the museum. Simple A1 {targetLang}. Practice: 1) asking how they are 2) responding to their answer 3) sharing how you feel 4) talking about the day ahead. Vary your responses - don't just say 'fine'.", speechLang: "en-GB", suggestedAnswers: ["I'm great, thanks!", "Not bad, and you?", "I'm a little tired.", "I'm happy today!", "How are you, Rudy?"] },
    spanish: { situation: { ko: "아침에 박물관에 도착해서 동료들과 안부를 나누고 있습니다.", en: "Arriving at the museum in the morning and greeting colleagues.", es: "Llegando al museo por la mañana y saludando a los colegas." }, gptPrompt: "You are Rudy greeting your partner in the morning at the museum. Simple A1 {targetLang}. Practice: 1) asking how they are 2) responding to their answer 3) sharing how you feel 4) talking about the day ahead. Vary your responses - don't just say 'fine'.", speechLang: "es-ES", suggestedAnswers: ["¡Estoy genial, gracias!", "No está mal, ¿y tú?", "Estoy un poco cansado.", "¡Estoy feliz hoy!", "¿Cómo estás, Rudy?"] },
    korean: { situation: { ko: "아침에 박물관에 도착해서 동료들과 안부를 나누고 있습니다.", en: "Arriving at the museum in the morning and greeting colleagues.", es: "Llegando al museo por la mañana y saludando a los colegas." }, gptPrompt: "You are Rudy greeting your partner in the morning at the museum. Simple A1 {targetLang}. Practice: 1) asking how they are 2) responding to their answer 3) sharing how you feel 4) talking about the day ahead. Vary your responses - don't just say 'fine'.", speechLang: "ko-KR", suggestedAnswers: ["잘 지내요, 감사해요!", "괜찮아요, 당신은요?", "좀 피곤해요.", "오늘 기분 좋아요!", "루디, 어떻게 지내요?"] },
  },

  day_6: {
    english: { situation: { ko: "박물관 환영 파티에서 새로운 사람들을 여러 명 만나는 상황입니다. 배운 모든 표현을 활용하세요!", en: "At a welcome party, meeting several new people. Use everything you've learned!", es: "En una fiesta de bienvenida, conociendo a varias personas. ¡Usa todo lo aprendido!" }, gptPrompt: "You are Rudy hosting a welcome party at the museum. Test ALL of Unit 1 in a natural A1 {targetLang} conversation. Cover: greeting, self-introduction, asking about them (name, origin, job), asking how they are, saying goodbye. Introduce 2-3 different 'guests' to keep it interesting. This is a review day so be encouraging but thorough.", speechLang: "en-GB", suggestedAnswers: ["Hello! My name is ___.", "I'm from ___.", "I'm a ___.", "Nice to meet you!", "I'm great, thank you!", "Goodbye! See you later!"] },
    spanish: { situation: { ko: "박물관 환영 파티에서 새로운 사람들을 여러 명 만나는 상황입니다. 배운 모든 표현을 활용하세요!", en: "At a welcome party, meeting several new people. Use everything you've learned!", es: "En una fiesta de bienvenida, conociendo a varias personas. ¡Usa todo lo aprendido!" }, gptPrompt: "You are Rudy hosting a welcome party at the museum. Test ALL of Unit 1 in a natural A1 {targetLang} conversation. Cover: greeting, self-introduction, asking about them (name, origin, job), asking how they are, saying goodbye. Introduce 2-3 different 'guests' to keep it interesting. This is a review day so be encouraging but thorough.", speechLang: "es-ES", suggestedAnswers: ["¡Hola! Me llamo ___.", "Soy de ___.", "Soy ___.", "¡Mucho gusto!", "¡Estoy genial, gracias!", "¡Adiós! ¡Hasta luego!"] },
    korean: { situation: { ko: "박물관 환영 파티에서 새로운 사람들을 여러 명 만나는 상황입니다. 배운 모든 표현을 활용하세요!", en: "At a welcome party, meeting several new people. Use everything you've learned!", es: "En una fiesta de bienvenida, conociendo a varias personas. ¡Usa todo lo aprendido!" }, gptPrompt: "You are Rudy hosting a welcome party at the museum. Test ALL of Unit 1 in a natural A1 {targetLang} conversation. Cover: greeting, self-introduction, asking about them (name, origin, job), asking how they are, saying goodbye. Introduce 2-3 different 'guests' to keep it interesting. This is a review day so be encouraging but thorough.", speechLang: "ko-KR", suggestedAnswers: ["안녕하세요! 제 이름은 ___이에요.", "___에서 왔어요.", "___이에요.", "만나서 반가워요!", "잘 지내요, 감사합니다!", "안녕히 가세요! 다음에 봐요!"] },
  },
};

// ── STEP 4: Review content ────────────────────────────────────────────────────

export const REVIEW_CONTENT: Record<string, Partial<Record<LearningLangKey, ReviewQuestion[]>>> = {

  day_1: {
    english: [
      { type: "speak", sentence: "Hello, nice to meet you.", speechLang: "en-GB", meaning: { ko: "안녕하세요, 만나서 반갑습니다.", en: "Hello, nice to meet you.", es: "Hola, mucho gusto." } },
      { type: "fill_blank", promptWithBlank: "My name ___ ___.", answer: "is", options: ["is", "am", "are"], fullSentence: "My name is Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
      { type: "speak", sentence: "I'm from Korea.", speechLang: "en-GB", meaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
      { type: "fill_blank", promptWithBlank: "Where are you ___?", answer: "from", options: ["from", "to", "at"], fullSentence: "Where are you from?", fullSentenceMeaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" } },
      { type: "speak", sentence: "My name is Rudy. Nice to meet you.", speechLang: "en-GB", meaning: { ko: "제 이름은 루디예요. 만나서 반갑습니다.", en: "My name is Rudy. Nice to meet you.", es: "Me llamo Rudy. Mucho gusto." } },
    ],
    spanish: [
      { type: "speak", sentence: "Hola, mucho gusto.", speechLang: "es-ES", meaning: { ko: "안녕하세요, 만나서 반갑습니다.", en: "Hello, nice to meet you.", es: "Hola, mucho gusto." } },
      { type: "fill_blank", promptWithBlank: "My name ___ ___.", answer: "is", options: ["is", "am", "are"], fullSentence: "My name is Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
      { type: "speak", sentence: "Soy de Corea.", speechLang: "es-ES", meaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
      { type: "fill_blank", promptWithBlank: "Where are you ___?", answer: "from", options: ["from", "to", "at"], fullSentence: "Where are you from?", fullSentenceMeaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" } },
      { type: "speak", sentence: "Me llamo Rudy. Mucho gusto.", speechLang: "es-ES", meaning: { ko: "제 이름은 루디예요. 만나서 반갑습니다.", en: "My name is Rudy. Nice to meet you.", es: "Me llamo Rudy. Mucho gusto." } },
    ],
    korean: [
      { type: "speak", sentence: "안녕하세요, 만나서 반갑습니다.", speechLang: "ko-KR", meaning: { ko: "안녕하세요, 만나서 반갑습니다.", en: "Hello, nice to meet you.", es: "Hola, mucho gusto." } },
      { type: "fill_blank", promptWithBlank: "My name ___ ___.", answer: "is", options: ["is", "am", "are"], fullSentence: "My name is Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
      { type: "speak", sentence: "저는 한국에서 왔어요.", speechLang: "ko-KR", meaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
      { type: "fill_blank", promptWithBlank: "Where are you ___?", answer: "from", options: ["from", "to", "at"], fullSentence: "Where are you from?", fullSentenceMeaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" } },
      { type: "speak", sentence: "제 이름은 루디예요. 만나서 반갑습니다.", speechLang: "ko-KR", meaning: { ko: "제 이름은 루디예요. 만나서 반갑습니다.", en: "My name is Rudy. Nice to meet you.", es: "Me llamo Rudy. Mucho gusto." } },
    ],
  },

  day_2: {
    english: [
      { type: "speak", sentence: "Hello, my name is Rudy.", speechLang: "en-GB", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Nice to ___ you.", answer: "meet", options: ["meet", "see", "do"], fullSentence: "Nice to meet you.", fullSentenceMeaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." }, isYesterdayReview: true },
      { type: "speak", sentence: "I'm from Korea.", speechLang: "en-GB", meaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
      { type: "fill_blank", promptWithBlank: "I ___ in Seoul.", answer: "live", options: ["live", "from", "go"], fullSentence: "I live in Seoul.", fullSentenceMeaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
      { type: "speak", sentence: "I'm from Korea. I live in Seoul.", speechLang: "en-GB", meaning: { ko: "저는 한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." } },
    ],
    spanish: [
      { type: "speak", sentence: "Hola, me llamo Rudy.", speechLang: "es-ES", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Nice to ___ you.", answer: "meet", options: ["meet", "see", "do"], fullSentence: "Nice to meet you.", fullSentenceMeaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." }, isYesterdayReview: true },
      { type: "speak", sentence: "Soy de Corea.", speechLang: "es-ES", meaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
      { type: "fill_blank", promptWithBlank: "I ___ in Seoul.", answer: "live", options: ["live", "from", "go"], fullSentence: "I live in Seoul.", fullSentenceMeaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
      { type: "speak", sentence: "Soy de Corea. Vivo en Seúl.", speechLang: "es-ES", meaning: { ko: "저는 한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." } },
    ],
    korean: [
      { type: "speak", sentence: "안녕하세요, 제 이름은 루디예요.", speechLang: "ko-KR", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Nice to ___ you.", answer: "meet", options: ["meet", "see", "do"], fullSentence: "Nice to meet you.", fullSentenceMeaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." }, isYesterdayReview: true },
      { type: "speak", sentence: "저는 한국에서 왔어요.", speechLang: "ko-KR", meaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
      { type: "fill_blank", promptWithBlank: "I ___ in Seoul.", answer: "live", options: ["live", "from", "go"], fullSentence: "I live in Seoul.", fullSentenceMeaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
      { type: "speak", sentence: "저는 한국에서 왔어요. 서울에 살아요.", speechLang: "ko-KR", meaning: { ko: "저는 한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." } },
    ],
  },

  day_3: {
    english: [
      { type: "speak", sentence: "I'm from Korea. I live in Seoul.", speechLang: "en-GB", meaning: { ko: "저는 한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "I'm ___ Korea.", answer: "from", options: ["from", "in", "at"], fullSentence: "I'm from Korea.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." }, isYesterdayReview: true },
      { type: "speak", sentence: "I'm a student.", speechLang: "en-GB", meaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
      { type: "fill_blank", promptWithBlank: "I work ___ a museum.", answer: "at", options: ["at", "in", "on"], fullSentence: "I work at a museum.", fullSentenceMeaning: { ko: "박물관에서 일해요.", en: "I work at a museum.", es: "Trabajo en un museo." } },
      { type: "speak", sentence: "I'm a student. I work at a school.", speechLang: "en-GB", meaning: { ko: "저는 학생이에요. 학교에서 일해요.", en: "I'm a student. I work at a school.", es: "Soy estudiante. Trabajo en una escuela." } },
    ],
    spanish: [
      { type: "speak", sentence: "Soy de Corea. Vivo en Seúl.", speechLang: "es-ES", meaning: { ko: "저는 한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "I'm ___ Korea.", answer: "from", options: ["from", "in", "at"], fullSentence: "I'm from Korea.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." }, isYesterdayReview: true },
      { type: "speak", sentence: "Soy estudiante.", speechLang: "es-ES", meaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
      { type: "fill_blank", promptWithBlank: "I work ___ a museum.", answer: "at", options: ["at", "in", "on"], fullSentence: "I work at a museum.", fullSentenceMeaning: { ko: "박물관에서 일해요.", en: "I work at a museum.", es: "Trabajo en un museo." } },
      { type: "speak", sentence: "Soy estudiante. Trabajo en una escuela.", speechLang: "es-ES", meaning: { ko: "저는 학생이에요. 학교에서 일해요.", en: "I'm a student. I work at a school.", es: "Soy estudiante. Trabajo en una escuela." } },
    ],
    korean: [
      { type: "speak", sentence: "저는 한국에서 왔어요. 서울에 살아요.", speechLang: "ko-KR", meaning: { ko: "저는 한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "I'm ___ Korea.", answer: "from", options: ["from", "in", "at"], fullSentence: "I'm from Korea.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." }, isYesterdayReview: true },
      { type: "speak", sentence: "저는 학생이에요.", speechLang: "ko-KR", meaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
      { type: "fill_blank", promptWithBlank: "I work ___ a museum.", answer: "at", options: ["at", "in", "on"], fullSentence: "I work at a museum.", fullSentenceMeaning: { ko: "박물관에서 일해요.", en: "I work at a museum.", es: "Trabajo en un museo." } },
      { type: "speak", sentence: "저는 학생이에요. 학교에서 일해요.", speechLang: "ko-KR", meaning: { ko: "저는 학생이에요. 학교에서 일해요.", en: "I'm a student. I work at a school.", es: "Soy estudiante. Trabajo en una escuela." } },
    ],
  },

  day_4: {
    english: [
      { type: "speak", sentence: "I'm a student. I work at a school.", speechLang: "en-GB", meaning: { ko: "저는 학생이에요. 학교에서 일해요.", en: "I'm a student. I work at a school.", es: "Soy estudiante. Trabajo en una escuela." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "What do you ___?", answer: "do", options: ["do", "go", "have"], fullSentence: "What do you do?", fullSentenceMeaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Goodbye! See you later.", speechLang: "en-GB", meaning: { ko: "안녕히 가세요! 다음에 봐요.", en: "Goodbye! See you later.", es: "¡Adiós! Hasta luego." } },
      { type: "fill_blank", promptWithBlank: "It was nice ___ you.", answer: "meeting", options: ["meeting", "meet", "met"], fullSentence: "It was nice meeting you.", fullSentenceMeaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
      { type: "speak", sentence: "Take care! See you tomorrow!", speechLang: "en-GB", meaning: { ko: "잘 가요! 내일 봐요!", en: "Take care! See you tomorrow!", es: "¡Cuídate! ¡Hasta mañana!" } },
    ],
    spanish: [
      { type: "speak", sentence: "Soy estudiante. Trabajo en una escuela.", speechLang: "es-ES", meaning: { ko: "저는 학생이에요. 학교에서 일해요.", en: "I'm a student. I work at a school.", es: "Soy estudiante. Trabajo en una escuela." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "What do you ___?", answer: "do", options: ["do", "go", "have"], fullSentence: "What do you do?", fullSentenceMeaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" }, isYesterdayReview: true },
      { type: "speak", sentence: "¡Adiós! Hasta luego.", speechLang: "es-ES", meaning: { ko: "안녕히 가세요! 다음에 봐요.", en: "Goodbye! See you later.", es: "¡Adiós! Hasta luego." } },
      { type: "fill_blank", promptWithBlank: "It was nice ___ you.", answer: "meeting", options: ["meeting", "meet", "met"], fullSentence: "It was nice meeting you.", fullSentenceMeaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
      { type: "speak", sentence: "¡Cuídate! ¡Hasta mañana!", speechLang: "es-ES", meaning: { ko: "잘 가요! 내일 봐요!", en: "Take care! See you tomorrow!", es: "¡Cuídate! ¡Hasta mañana!" } },
    ],
    korean: [
      { type: "speak", sentence: "저는 학생이에요. 학교에서 일해요.", speechLang: "ko-KR", meaning: { ko: "저는 학생이에요. 학교에서 일해요.", en: "I'm a student. I work at a school.", es: "Soy estudiante. Trabajo en una escuela." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "What do you ___?", answer: "do", options: ["do", "go", "have"], fullSentence: "What do you do?", fullSentenceMeaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" }, isYesterdayReview: true },
      { type: "speak", sentence: "안녕히 가세요! 다음에 봐요.", speechLang: "ko-KR", meaning: { ko: "안녕히 가세요! 다음에 봐요.", en: "Goodbye! See you later.", es: "¡Adiós! Hasta luego." } },
      { type: "fill_blank", promptWithBlank: "It was nice ___ you.", answer: "meeting", options: ["meeting", "meet", "met"], fullSentence: "It was nice meeting you.", fullSentenceMeaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
      { type: "speak", sentence: "잘 가요! 내일 봐요!", speechLang: "ko-KR", meaning: { ko: "잘 가요! 내일 봐요!", en: "Take care! See you tomorrow!", es: "¡Cuídate! ¡Hasta mañana!" } },
    ],
  },

  day_5: {
    english: [
      { type: "speak", sentence: "Goodbye! Take care!", speechLang: "en-GB", meaning: { ko: "안녕히 가세요! 잘 가요!", en: "Goodbye! Take care!", es: "¡Adiós! ¡Cuídate!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "See you ___!", answer: "later", options: ["later", "after", "next"], fullSentence: "See you later!", fullSentenceMeaning: { ko: "다음에 봐요!", en: "See you later!", es: "¡Hasta luego!" }, isYesterdayReview: true },
      { type: "speak", sentence: "I'm fine, thank you. And you?", speechLang: "en-GB", meaning: { ko: "잘 지내요, 감사합니다. 당신은요?", en: "I'm fine, thank you. And you?", es: "Estoy bien, gracias. ¿Y tú?" } },
      { type: "fill_blank", promptWithBlank: "How ___ you today?", answer: "are", options: ["are", "is", "do"], fullSentence: "How are you today?", fullSentenceMeaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?" } },
      { type: "speak", sentence: "I'm great! How about you?", speechLang: "en-GB", meaning: { ko: "잘 지내요! 당신은요?", en: "I'm great! How about you?", es: "¡Estoy genial! ¿Y tú?" } },
    ],
    spanish: [
      { type: "speak", sentence: "¡Adiós! ¡Cuídate!", speechLang: "es-ES", meaning: { ko: "안녕히 가세요! 잘 가요!", en: "Goodbye! Take care!", es: "¡Adiós! ¡Cuídate!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "See you ___!", answer: "later", options: ["later", "after", "next"], fullSentence: "See you later!", fullSentenceMeaning: { ko: "다음에 봐요!", en: "See you later!", es: "¡Hasta luego!" }, isYesterdayReview: true },
      { type: "speak", sentence: "Estoy bien, gracias. ¿Y tú?", speechLang: "es-ES", meaning: { ko: "잘 지내요, 감사합니다. 당신은요?", en: "I'm fine, thank you. And you?", es: "Estoy bien, gracias. ¿Y tú?" } },
      { type: "fill_blank", promptWithBlank: "How ___ you today?", answer: "are", options: ["are", "is", "do"], fullSentence: "How are you today?", fullSentenceMeaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?" } },
      { type: "speak", sentence: "¡Estoy genial! ¿Y tú?", speechLang: "es-ES", meaning: { ko: "잘 지내요! 당신은요?", en: "I'm great! How about you?", es: "¡Estoy genial! ¿Y tú?" } },
    ],
    korean: [
      { type: "speak", sentence: "안녕히 가세요! 잘 가요!", speechLang: "ko-KR", meaning: { ko: "안녕히 가세요! 잘 가요!", en: "Goodbye! Take care!", es: "¡Adiós! ¡Cuídate!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "See you ___!", answer: "later", options: ["later", "after", "next"], fullSentence: "See you later!", fullSentenceMeaning: { ko: "다음에 봐요!", en: "See you later!", es: "¡Hasta luego!" }, isYesterdayReview: true },
      { type: "speak", sentence: "잘 지내요, 감사합니다. 당신은요?", speechLang: "ko-KR", meaning: { ko: "잘 지내요, 감사합니다. 당신은요?", en: "I'm fine, thank you. And you?", es: "Estoy bien, gracias. ¿Y tú?" } },
      { type: "fill_blank", promptWithBlank: "How ___ you today?", answer: "are", options: ["are", "is", "do"], fullSentence: "How are you today?", fullSentenceMeaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?" } },
      { type: "speak", sentence: "잘 지내요! 당신은요?", speechLang: "ko-KR", meaning: { ko: "잘 지내요! 당신은요?", en: "I'm great! How about you?", es: "¡Estoy genial! ¿Y tú?" } },
    ],
  },

  day_6: {
    english: [
      { type: "speak", sentence: "Hello, my name is Rudy. Nice to meet you.", speechLang: "en-GB", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 반갑습니다.", en: "Hello, my name is Rudy. Nice to meet you.", es: "Hola, me llamo Rudy. Mucho gusto." } },
      { type: "speak", sentence: "I'm from Korea. I live in Seoul.", speechLang: "en-GB", meaning: { ko: "한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." } },
      { type: "speak", sentence: "I'm a student. I work at a school.", speechLang: "en-GB", meaning: { ko: "학생이에요. 학교에서 일해요.", en: "I'm a student. I work at a school.", es: "Soy estudiante. Trabajo en una escuela." } },
      { type: "speak", sentence: "How are you? I'm great, thanks!", speechLang: "en-GB", meaning: { ko: "어떻게 지내세요? 잘 지내요!", en: "How are you? I'm great, thanks!", es: "¿Cómo estás? ¡Genial, gracias!" } },
      { type: "speak", sentence: "Goodbye! Take care! See you tomorrow!", speechLang: "en-GB", meaning: { ko: "안녕히 가세요! 잘 가요! 내일 봐요!", en: "Goodbye! Take care! See you tomorrow!", es: "¡Adiós! ¡Cuídate! ¡Hasta mañana!" } },
    ],
    spanish: [
      { type: "speak", sentence: "Hola, me llamo Rudy. Mucho gusto.", speechLang: "es-ES", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 반갑습니다.", en: "Hello, my name is Rudy. Nice to meet you.", es: "Hola, me llamo Rudy. Mucho gusto." } },
      { type: "speak", sentence: "Soy de Corea. Vivo en Seúl.", speechLang: "es-ES", meaning: { ko: "한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." } },
      { type: "speak", sentence: "Soy estudiante. Trabajo en una escuela.", speechLang: "es-ES", meaning: { ko: "학생이에요. 학교에서 일해요.", en: "I'm a student. I work at a school.", es: "Soy estudiante. Trabajo en una escuela." } },
      { type: "speak", sentence: "¿Cómo estás? ¡Genial, gracias!", speechLang: "es-ES", meaning: { ko: "어떻게 지내세요? 잘 지내요!", en: "How are you? I'm great, thanks!", es: "¿Cómo estás? ¡Genial, gracias!" } },
      { type: "speak", sentence: "¡Adiós! ¡Cuídate! ¡Hasta mañana!", speechLang: "es-ES", meaning: { ko: "안녕히 가세요! 잘 가요! 내일 봐요!", en: "Goodbye! Take care! See you tomorrow!", es: "¡Adiós! ¡Cuídate! ¡Hasta mañana!" } },
    ],
    korean: [
      { type: "speak", sentence: "안녕하세요, 제 이름은 루디예요. 반갑습니다.", speechLang: "ko-KR", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 반갑습니다.", en: "Hello, my name is Rudy. Nice to meet you.", es: "Hola, me llamo Rudy. Mucho gusto." } },
      { type: "speak", sentence: "한국에서 왔어요. 서울에 살아요.", speechLang: "ko-KR", meaning: { ko: "한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." } },
      { type: "speak", sentence: "학생이에요. 학교에서 일해요.", speechLang: "ko-KR", meaning: { ko: "학생이에요. 학교에서 일해요.", en: "I'm a student. I work at a school.", es: "Soy estudiante. Trabajo en una escuela." } },
      { type: "speak", sentence: "어떻게 지내세요? 잘 지내요!", speechLang: "ko-KR", meaning: { ko: "어떻게 지내세요? 잘 지내요!", en: "How are you? I'm great, thanks!", es: "¿Cómo estás? ¡Genial, gracias!" } },
      { type: "speak", sentence: "안녕히 가세요! 잘 가요! 내일 봐요!", speechLang: "ko-KR", meaning: { ko: "안녕히 가세요! 잘 가요! 내일 봐요!", en: "Goodbye! Take care! See you tomorrow!", es: "¡Adiós! ¡Cuídate! ¡Hasta mañana!" } },
    ],
  },
};

// ── Rewards ───────────────────────────────────────────────────────────────────

export const DAY_REWARDS: Record<string, DayRewards> = {
  day_1: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_2: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_3: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_4: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_5: { xp: 100, bonusPronunciation: 30, bonusAllVoice: 50 },
  day_6: { xp: 150, bonusPronunciation: 50, bonusAllVoice: 50 },
};

// ── Pronunciation feedback messages ───────────────────────────────────────────

const FEEDBACK_MESSAGES: Record<string, Record<"excellent" | "good" | "needsWork", string[]>> = {
  ko: {
    excellent: ["완벽해요! 🌟", "훌륭한 발음이에요! 🦊", "네이티브처럼 들려요! ⭐"],
    good: ["잘 했어요! 👍", "좋은 발음이에요!", "계속 연습하면 완벽해질 거예요! 🦊"],
    needsWork: ["한 번 더 해봐요! 💪", "조금만 더 연습해요!", "루디가 응원해요! 🦊"],
  },
  en: {
    excellent: ["Perfect! 🌟", "Excellent pronunciation! 🦊", "You sound like a native! ⭐"],
    good: ["Good job! 👍", "Nice pronunciation!", "Keep practicing and you'll be perfect! 🦊"],
    needsWork: ["Try again! 💪", "A little more practice!", "Rudy believes in you! 🦊"],
  },
  es: {
    excellent: ["¡Perfecto! 🌟", "¡Excelente pronunciación! 🦊", "¡Suenas como un nativo! ⭐"],
    good: ["¡Bien hecho! 👍", "¡Buena pronunciación!", "¡Sigue practicando y serás perfecto! 🦊"],
    needsWork: ["¡Inténtalo de nuevo! 💪", "¡Un poco más de práctica!", "¡Rudy cree en ti! 🦊"],
  },
};

export function getRandomFeedback(type: "excellent" | "good" | "needsWork", nativeLang: string): string {
  const lc = nativeLang === "korean" ? "ko" : nativeLang === "spanish" ? "es" : "en";
  const pool = FEEDBACK_MESSAGES[lc]?.[type] ?? FEEDBACK_MESSAGES.en[type];
  return pool[Math.floor(Math.random() * pool.length)];
}

export const COMPLETION_MESSAGES = {
  ko: [
    "오늘도 수고했어, 파트너! 내일은 '{nextTopic}'을 배울 거야. 내일 봐! 🦊",
    "대단해! 오늘 {sentenceCount}문장이나 말했어! 내일도 이 기세로 가자! 🦊",
    "점점 실력이 느는 게 느껴져! 내일 '{nextTopic}' 훈련에서 보자! 🦊",
  ],
  en: [
    "Great work today, partner! Tomorrow we'll learn '{nextTopic}'. See you then! 🦊",
    "Amazing! You spoke {sentenceCount} sentences today! Keep it up tomorrow! 🦊",
    "I can feel your skills growing! See you at '{nextTopic}' training tomorrow! 🦊",
  ],
  es: [
    "¡Buen trabajo hoy, compañero! Mañana aprenderemos '{nextTopic}'. ¡Nos vemos! 🦊",
    "¡Increíble! ¡Dijiste {sentenceCount} oraciones hoy! ¡Sigue así mañana! 🦊",
    "¡Siento que mejoras! ¡Nos vemos en '{nextTopic}' mañana! 🦊",
  ],
};

export function getCompletionMessage(nativeLang: string, sentenceCount: number, nextTopic: string): string {
  const lc = nativeLang === "korean" ? "ko" : nativeLang === "spanish" ? "es" : "en";
  const msgs = COMPLETION_MESSAGES[lc as "ko" | "en" | "es"];
  const msg = msgs[Math.floor(Math.random() * msgs.length)];
  return msg
    .replace("{sentenceCount}", String(sentenceCount))
    .replace("{nextTopic}", nextTopic);
}
