import type { Tri } from "./dailyCourseData";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LessonSentence {
  text: string;        // sentence in the target language being learned
  speechLang: string;  // Azure TTS lang code e.g. "en-US"
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

export type LearningLangKey = "english" | "spanish" | "korean";

// ── Speech lang codes ────────────────────────────────────────────────────────

export const SPEECH_LANG: Record<LearningLangKey, string> = {
  english: "en-US",
  spanish: "es-ES",
  korean:  "ko-KR",
};

// ── Day 1–6 content (all 3 learning languages) ───────────────────────────────

export const LESSON_CONTENT: Record<string, Partial<Record<LearningLangKey, DayLessonData>>> = {

  // ─────────────── Day 1: Meeting & Greeting ──────────────────────────────────
  day_1: {
    english: {
      step1Sentences: [
        {
          text: "Hello, my name is Rudy.",
          speechLang: "en-US",
          meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, mi nombre es Rudy." },
        },
        {
          text: "Nice to meet you.",
          speechLang: "en-US",
          meaning: { ko: "만나서 반가워요.", en: "Nice to meet you.", es: "Mucho gusto en conocerte." },
        },
        {
          text: "Where are you from?",
          speechLang: "en-US",
          meaning: { ko: "어디서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" },
        },
      ],
      step2: {
        explanation: {
          ko: "자기소개할 때 'My name is ___' 또는 'I'm ___'을 사용해요.\n💡 'I'm'은 'I am'의 줄임말이에요.",
          en: "Use 'My name is ___' or 'I'm ___' to introduce yourself.\n💡 'I'm' is a contraction of 'I am'.",
          es: "Usa 'My name is ___' o 'I'm ___' para presentarte.\n💡 'I'm' es la contracción de 'I am'.",
        },
        quizzes: [
          {
            type: "select",
            promptWithBlank: "My name ___ Rudy.",
            answer: "is",
            options: ["is", "am", "are"],
            fullSentence: "My name is Rudy.",
            fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Mi nombre es Rudy." },
          },
          {
            type: "select",
            promptWithBlank: "Nice ___ meet you.",
            answer: "to",
            options: ["to", "of", "in"],
            fullSentence: "Nice to meet you.",
            fullSentenceMeaning: { ko: "만나서 반가워요.", en: "Nice to meet you.", es: "Mucho gusto en conocerte." },
          },
          {
            type: "select",
            promptWithBlank: "Where ___ you from?",
            answer: "are",
            options: ["are", "is", "am"],
            fullSentence: "Where are you from?",
            fullSentenceMeaning: { ko: "어디서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" },
          },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        {
          text: "Hola, me llamo Rudy.",
          speechLang: "es-ES",
          meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." },
        },
        {
          text: "Mucho gusto en conocerte.",
          speechLang: "es-ES",
          meaning: { ko: "만나서 반가워요.", en: "Nice to meet you.", es: "Mucho gusto en conocerte." },
        },
        {
          text: "¿De dónde eres?",
          speechLang: "es-ES",
          meaning: { ko: "어디서 왔어요?", en: "Where are you from?", es: "¿De dónde eres?" },
        },
      ],
      step2: {
        explanation: {
          ko: "스페인어로 '내 이름은 ___'는 'Me llamo ___' 또는 'Mi nombre es ___'를 써요.\n💡 'Me llamo'는 직역하면 '나는 나 자신을 ___라고 불러요'예요.",
          en: "In Spanish, 'My name is ___' is 'Me llamo ___' or 'Mi nombre es ___'.\n💡 'Me llamo' literally means 'I call myself ___'.",
          es: "Para presentarte, usa 'Me llamo ___' o 'Mi nombre es ___'.\n💡 'Me llamo' literalmente significa 'Me llamo a mí mismo ___'.",
        },
        quizzes: [
          {
            type: "select",
            promptWithBlank: "Me ___ Rudy.",
            answer: "llamo",
            options: ["llamo", "soy", "tengo"],
            fullSentence: "Me llamo Rudy.",
            fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." },
          },
          {
            type: "select",
            promptWithBlank: "Mucho ___ en conocerte.",
            answer: "gusto",
            options: ["gusto", "gusta", "gustan"],
            fullSentence: "Mucho gusto en conocerte.",
            fullSentenceMeaning: { ko: "만나서 반가워요.", en: "Nice to meet you.", es: "Mucho gusto en conocerte." },
          },
          {
            type: "select",
            promptWithBlank: "¿De ___ eres?",
            answer: "dónde",
            options: ["dónde", "qué", "cuándo"],
            fullSentence: "¿De dónde eres?",
            fullSentenceMeaning: { ko: "어디서 왔어요?", en: "Where are you from?", es: "¿De dónde eres?" },
          },
        ],
      },
    },
    korean: {
      step1Sentences: [
        {
          text: "안녕하세요, 제 이름은 루디예요.",
          speechLang: "ko-KR",
          meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, mi nombre es Rudy." },
        },
        {
          text: "만나서 반가워요.",
          speechLang: "ko-KR",
          meaning: { ko: "만나서 반가워요.", en: "Nice to meet you.", es: "Mucho gusto en conocerte." },
        },
        {
          text: "어디서 오셨어요?",
          speechLang: "ko-KR",
          meaning: { ko: "어디서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" },
        },
      ],
      step2: {
        explanation: {
          ko: "'제 이름은 ___예요/이에요'로 자기소개를 해요.\n💡 '예요'는 받침 없는 글자 뒤에, '이에요'는 받침 있는 글자 뒤에 써요.",
          en: "Use '제 이름은 ___예요' to introduce yourself in Korean.\n💡 Use '예요' after a vowel-ending syllable, '이에요' after a consonant.",
          es: "Usa '제 이름은 ___예요' para presentarte en coreano.\n💡 '예요' va después de sílaba terminada en vocal, '이에요' después de consonante.",
        },
        quizzes: [
          {
            type: "select",
            promptWithBlank: "제 이름은 루디___.",
            answer: "예요",
            options: ["예요", "이에요", "에요"],
            fullSentence: "제 이름은 루디예요.",
            fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Mi nombre es Rudy." },
          },
          {
            type: "select",
            promptWithBlank: "만나서 ___.",
            answer: "반가워요",
            options: ["반가워요", "좋아요", "감사해요"],
            fullSentence: "만나서 반가워요.",
            fullSentenceMeaning: { ko: "만나서 반가워요.", en: "Nice to meet you.", es: "Mucho gusto." },
          },
          {
            type: "select",
            promptWithBlank: "어디서 ___?",
            answer: "오셨어요",
            options: ["오셨어요", "가셨어요", "계세요"],
            fullSentence: "어디서 오셨어요?",
            fullSentenceMeaning: { ko: "어디서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" },
          },
        ],
      },
    },
  },

  // ─────────────── Day 2: Saying Where You're From ────────────────────────────
  day_2: {
    english: {
      step1Sentences: [
        {
          text: "I'm from Korea.",
          speechLang: "en-US",
          meaning: { ko: "저는 한국 출신이에요.", en: "I'm from Korea.", es: "Soy de Corea." },
        },
        {
          text: "I live in Seoul now.",
          speechLang: "en-US",
          meaning: { ko: "저는 지금 서울에 살아요.", en: "I live in Seoul now.", es: "Ahora vivo en Seúl." },
        },
        {
          text: "What about you?",
          speechLang: "en-US",
          meaning: { ko: "당신은요?", en: "What about you?", es: "¿Y tú?" },
        },
      ],
      step2: {
        explanation: {
          ko: "'I'm from ___'으로 출신 국가나 도시를 말해요.\n💡 'I'm from'은 출신을 나타내고, 'I live in'은 현재 사는 곳을 나타내요.",
          en: "Use 'I'm from ___' to say where you're from.\n💡 'I'm from' shows origin; 'I live in' shows current location.",
          es: "Usa 'I'm from ___' para decir de dónde eres.\n💡 'I'm from' indica origen; 'I live in' indica ubicación actual.",
        },
        quizzes: [
          {
            type: "select",
            promptWithBlank: "I'm ___ Korea.",
            answer: "from",
            options: ["from", "at", "in"],
            fullSentence: "I'm from Korea.",
            fullSentenceMeaning: { ko: "저는 한국 출신이에요.", en: "I'm from Korea.", es: "Soy de Corea." },
          },
          {
            type: "select",
            promptWithBlank: "I ___ in Seoul now.",
            answer: "live",
            options: ["live", "stay", "am"],
            fullSentence: "I live in Seoul now.",
            fullSentenceMeaning: { ko: "저는 지금 서울에 살아요.", en: "I live in Seoul now.", es: "Vivo en Seúl." },
          },
          {
            type: "input",
            promptWithBlank: "What ___ you?",
            answer: "about",
            fullSentence: "What about you?",
            fullSentenceMeaning: { ko: "당신은요?", en: "What about you?", es: "¿Y tú?" },
          },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Soy de Corea.", speechLang: "es-ES", meaning: { ko: "저는 한국 출신이에요.", en: "I'm from Korea.", es: "Soy de Corea." } },
        { text: "Ahora vivo en Seúl.", speechLang: "es-ES", meaning: { ko: "지금 서울에 살아요.", en: "I live in Seoul now.", es: "Ahora vivo en Seúl." } },
        { text: "¿Y tú?", speechLang: "es-ES", meaning: { ko: "당신은요?", en: "What about you?", es: "¿Y tú?" } },
      ],
      step2: {
        explanation: {
          ko: "'Soy de ___'로 출신을 말해요.\n💡 'Soy'는 'ser' 동사의 1인칭 단수형이에요.",
          en: "Use 'Soy de ___' to say where you're from in Spanish.\n💡 'Soy' is the first-person singular of the verb 'ser' (to be).",
          es: "Usa 'Soy de ___' para decir de dónde eres.\n💡 'Soy' es la primera persona singular del verbo 'ser'.",
        },
        quizzes: [
          { type: "select", promptWithBlank: "___ de Corea.", answer: "Soy", options: ["Soy", "Estoy", "Tengo"], fullSentence: "Soy de Corea.", fullSentenceMeaning: { ko: "저는 한국 출신이에요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "select", promptWithBlank: "Ahora ___ en Seúl.", answer: "vivo", options: ["vivo", "soy", "estoy"], fullSentence: "Ahora vivo en Seúl.", fullSentenceMeaning: { ko: "지금 서울에 살아요.", en: "I live in Seoul.", es: "Ahora vivo en Seúl." } },
          { type: "select", promptWithBlank: "¿___ tú?", answer: "Y", options: ["Y", "O", "Pero"], fullSentence: "¿Y tú?", fullSentenceMeaning: { ko: "당신은요?", en: "And you?", es: "¿Y tú?" } },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "저는 한국 출신이에요.", speechLang: "ko-KR", meaning: { ko: "저는 한국 출신이에요.", en: "I'm from Korea.", es: "Soy de Corea." } },
        { text: "지금은 서울에 살고 있어요.", speechLang: "ko-KR", meaning: { ko: "지금 서울에 살아요.", en: "I live in Seoul now.", es: "Ahora vivo en Seúl." } },
        { text: "당신은요?", speechLang: "ko-KR", meaning: { ko: "당신은요?", en: "What about you?", es: "¿Y tú?" } },
      ],
      step2: {
        explanation: {
          ko: "'저는 ___ 출신이에요'로 출신지를 말해요.\n💡 '출신이에요'는 '~에서 왔어요'보다 더 격식체예요.",
          en: "Use '저는 ___ 출신이에요' to say where you're from in Korean.\n💡 '출신이에요' is more formal than '~에서 왔어요'.",
          es: "Usa '저는 ___ 출신이에요' para decir de dónde eres.\n💡 '출신이에요' es más formal que '~에서 왔어요'.",
        },
        quizzes: [
          { type: "select", promptWithBlank: "저는 한국 ___이에요.", answer: "출신", options: ["출신", "사람", "친구"], fullSentence: "저는 한국 출신이에요.", fullSentenceMeaning: { ko: "저는 한국 출신이에요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "select", promptWithBlank: "지금은 서울에 살고 ___.", answer: "있어요", options: ["있어요", "없어요", "가요"], fullSentence: "지금은 서울에 살고 있어요.", fullSentenceMeaning: { ko: "지금 서울에 살고 있어요.", en: "I live in Seoul now.", es: "Ahora vivo en Seúl." } },
          { type: "select", promptWithBlank: "___은요?", answer: "당신", options: ["당신", "우리", "그들"], fullSentence: "당신은요?", fullSentenceMeaning: { ko: "당신은요?", en: "What about you?", es: "¿Y tú?" } },
        ],
      },
    },
  },

  // ─────────────── Day 3: Talking About Jobs ──────────────────────────────────
  day_3: {
    english: {
      step1Sentences: [
        { text: "I'm a student.", speechLang: "en-US", meaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
        { text: "What do you do?", speechLang: "en-US", meaning: { ko: "무슨 일을 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" } },
        { text: "I work at a hospital.", speechLang: "en-US", meaning: { ko: "저는 병원에서 일해요.", en: "I work at a hospital.", es: "Trabajo en un hospital." } },
      ],
      step2: {
        explanation: {
          ko: "'I'm a ___'로 직업을 말해요.\n💡 직업 앞에 관사 'a'를 꼭 붙여야 해요 (a teacher, a doctor).",
          en: "Use 'I'm a ___' to talk about your job.\n💡 Remember to use the article 'a' before the job (a teacher, a doctor).",
          es: "Usa 'I'm a ___' para hablar de tu trabajo.\n💡 No olvides usar el artículo 'a' antes del trabajo.",
        },
        quizzes: [
          { type: "select", promptWithBlank: "I'm ___ student.", answer: "a", options: ["a", "the", "an"], fullSentence: "I'm a student.", fullSentenceMeaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
          { type: "select", promptWithBlank: "What ___ you do?", answer: "do", options: ["do", "does", "are"], fullSentence: "What do you do?", fullSentenceMeaning: { ko: "무슨 일을 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" } },
          { type: "select", promptWithBlank: "I work ___ a hospital.", answer: "at", options: ["at", "in", "on"], fullSentence: "I work at a hospital.", fullSentenceMeaning: { ko: "병원에서 일해요.", en: "I work at a hospital.", es: "Trabajo en un hospital." } },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Soy estudiante.", speechLang: "es-ES", meaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
        { text: "¿A qué te dedicas?", speechLang: "es-ES", meaning: { ko: "무슨 일을 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" } },
        { text: "Trabajo en un hospital.", speechLang: "es-ES", meaning: { ko: "병원에서 일해요.", en: "I work at a hospital.", es: "Trabajo en un hospital." } },
      ],
      step2: {
        explanation: {
          ko: "스페인어에서는 직업을 말할 때 관사를 쓰지 않아요!\n💡 'Soy estudiante' (O) vs 'Soy un estudiante' (△).",
          en: "In Spanish, you usually omit the article when stating a profession.\n💡 'Soy estudiante' (✓) vs 'I'm a student' in English.",
          es: "En español, no se usa artículo al decir la profesión.\n💡 'Soy estudiante' (✓), no 'Soy un estudiante'.",
        },
        quizzes: [
          { type: "select", promptWithBlank: "___ estudiante.", answer: "Soy", options: ["Soy", "Estoy", "Tengo"], fullSentence: "Soy estudiante.", fullSentenceMeaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
          { type: "select", promptWithBlank: "¿A qué te ___?", answer: "dedicas", options: ["dedicas", "trabajas", "haces"], fullSentence: "¿A qué te dedicas?", fullSentenceMeaning: { ko: "무슨 일을 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" } },
          { type: "select", promptWithBlank: "Trabajo ___ un hospital.", answer: "en", options: ["en", "a", "de"], fullSentence: "Trabajo en un hospital.", fullSentenceMeaning: { ko: "병원에서 일해요.", en: "I work at a hospital.", es: "Trabajo en un hospital." } },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "저는 학생이에요.", speechLang: "ko-KR", meaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
        { text: "무슨 일을 하세요?", speechLang: "ko-KR", meaning: { ko: "무슨 일을 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" } },
        { text: "저는 병원에서 일해요.", speechLang: "ko-KR", meaning: { ko: "저는 병원에서 일해요.", en: "I work at a hospital.", es: "Trabajo en un hospital." } },
      ],
      step2: {
        explanation: {
          ko: "'저는 ___이에요/예요'로 직업을 말해요.\n💡 '이에요'는 받침 있는 명사 뒤에, '예요'는 받침 없는 명사 뒤에 써요.",
          en: "Use '저는 ___이에요/예요' to state your job in Korean.\n💡 '이에요' after consonant-ending nouns, '예요' after vowel-ending nouns.",
          es: "Usa '저는 ___이에요/예요' para hablar de tu trabajo.\n💡 '이에요' tras consonante, '예요' tras vocal.",
        },
        quizzes: [
          { type: "select", promptWithBlank: "저는 ___이에요.", answer: "학생", options: ["학생", "선생님", "의사"], fullSentence: "저는 학생이에요.", fullSentenceMeaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
          { type: "select", promptWithBlank: "무슨 ___ 하세요?", answer: "일을", options: ["일을", "공부를", "음식을"], fullSentence: "무슨 일을 하세요?", fullSentenceMeaning: { ko: "무슨 일을 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" } },
          { type: "select", promptWithBlank: "저는 병원에서 ___.", answer: "일해요", options: ["일해요", "공부해요", "놀아요"], fullSentence: "저는 병원에서 일해요.", fullSentenceMeaning: { ko: "병원에서 일해요.", en: "I work at a hospital.", es: "Trabajo en un hospital." } },
        ],
      },
    },
  },

  // ─────────────── Day 4: Saying Goodbye ──────────────────────────────────────
  day_4: {
    english: {
      step1Sentences: [
        { text: "It was nice meeting you.", speechLang: "en-US", meaning: { ko: "만나서 좋았어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
        { text: "See you later!", speechLang: "en-US", meaning: { ko: "나중에 봐요!", en: "See you later!", es: "¡Hasta luego!" } },
        { text: "Have a great day!", speechLang: "en-US", meaning: { ko: "좋은 하루 되세요!", en: "Have a great day!", es: "¡Que tengas un buen día!" } },
      ],
      step2: {
        explanation: {
          ko: "작별 인사 표현이 다양해요!\n💡 'See you later' = 일반적인 작별, 'Goodbye' = 격식체, 'Bye' = 친근한 표현이에요.",
          en: "There are many ways to say goodbye!\n💡 'See you later' = casual farewell, 'Goodbye' = formal, 'Bye' = very casual.",
          es: "¡Hay muchas formas de despedirse!\n💡 'See you later' = informal, 'Goodbye' = formal, 'Bye' = muy informal.",
        },
        quizzes: [
          { type: "select", promptWithBlank: "It was nice ___ you.", answer: "meeting", options: ["meeting", "see", "know"], fullSentence: "It was nice meeting you.", fullSentenceMeaning: { ko: "만나서 좋았어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
          { type: "select", promptWithBlank: "See you ___!", answer: "later", options: ["later", "tomorrow", "soon"], fullSentence: "See you later!", fullSentenceMeaning: { ko: "나중에 봐요!", en: "See you later!", es: "¡Hasta luego!" } },
          { type: "select", promptWithBlank: "Have a ___ day!", answer: "great", options: ["great", "good", "nice"], fullSentence: "Have a great day!", fullSentenceMeaning: { ko: "좋은 하루 되세요!", en: "Have a great day!", es: "¡Que tengas un buen día!" } },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Fue un placer conocerte.", speechLang: "es-ES", meaning: { ko: "만나서 좋았어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
        { text: "¡Hasta luego!", speechLang: "es-ES", meaning: { ko: "나중에 봐요!", en: "See you later!", es: "¡Hasta luego!" } },
        { text: "¡Que tengas un buen día!", speechLang: "es-ES", meaning: { ko: "좋은 하루 되세요!", en: "Have a great day!", es: "¡Que tengas un buen día!" } },
      ],
      step2: {
        explanation: {
          ko: "스페인어 작별 인사 표현!\n💡 'Hasta luego' = 나중에 봐요, 'Hasta mañana' = 내일 봐요, 'Adiós' = 안녕히 가세요.",
          en: "Spanish goodbye expressions!\n💡 'Hasta luego' = see you later, 'Hasta mañana' = see you tomorrow, 'Adiós' = goodbye.",
          es: "¡Expresiones de despedida en español!\n💡 'Hasta luego', 'Hasta mañana', 'Adiós' son las más comunes.",
        },
        quizzes: [
          { type: "select", promptWithBlank: "Fue un ___ conocerte.", answer: "placer", options: ["placer", "gusto", "honor"], fullSentence: "Fue un placer conocerte.", fullSentenceMeaning: { ko: "만나서 좋았어요.", en: "Nice to meet you.", es: "Fue un placer conocerte." } },
          { type: "select", promptWithBlank: "¡Hasta ___!", answer: "luego", options: ["luego", "mañana", "pronto"], fullSentence: "¡Hasta luego!", fullSentenceMeaning: { ko: "나중에 봐요!", en: "See you later!", es: "¡Hasta luego!" } },
          { type: "select", promptWithBlank: "¡Que ___ un buen día!", answer: "tengas", options: ["tengas", "tienes", "tener"], fullSentence: "¡Que tengas un buen día!", fullSentenceMeaning: { ko: "좋은 하루 되세요!", en: "Have a great day!", es: "¡Que tengas un buen día!" } },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "만나서 좋았어요.", speechLang: "ko-KR", meaning: { ko: "만나서 좋았어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
        { text: "나중에 봐요!", speechLang: "ko-KR", meaning: { ko: "나중에 봐요!", en: "See you later!", es: "¡Hasta luego!" } },
        { text: "좋은 하루 되세요!", speechLang: "ko-KR", meaning: { ko: "좋은 하루 되세요!", en: "Have a great day!", es: "¡Que tengas un buen día!" } },
      ],
      step2: {
        explanation: {
          ko: "다양한 작별 인사 표현을 배워봐요!\n💡 '안녕히 가세요' = 상대방이 떠날 때, '안녕히 계세요' = 내가 떠날 때 써요.",
          en: "Learn various goodbye expressions in Korean!\n💡 '안녕히 가세요' = when the other person is leaving, '안녕히 계세요' = when you are leaving.",
          es: "¡Aprende expresiones de despedida en coreano!\n💡 '안녕히 가세요' = cuando la otra persona se va, '안녕히 계세요' = cuando tú te vas.",
        },
        quizzes: [
          { type: "select", promptWithBlank: "만나서 ___.", answer: "좋았어요", options: ["좋았어요", "반가워요", "고마워요"], fullSentence: "만나서 좋았어요.", fullSentenceMeaning: { ko: "만나서 좋았어요.", en: "It was nice meeting you.", es: "Fue un placer." } },
          { type: "select", promptWithBlank: "___ 봐요!", answer: "나중에", options: ["나중에", "다시", "빨리"], fullSentence: "나중에 봐요!", fullSentenceMeaning: { ko: "나중에 봐요!", en: "See you later!", es: "¡Hasta luego!" } },
          { type: "select", promptWithBlank: "좋은 하루 ___!", answer: "되세요", options: ["되세요", "보내요", "가세요"], fullSentence: "좋은 하루 되세요!", fullSentenceMeaning: { ko: "좋은 하루 되세요!", en: "Have a great day!", es: "¡Buen día!" } },
        ],
      },
    },
  },

  // ─────────────── Day 5: Asking How Someone Is ───────────────────────────────
  day_5: {
    english: {
      step1Sentences: [
        { text: "How are you?", speechLang: "en-US", meaning: { ko: "어떻게 지내세요?", en: "How are you?", es: "¿Cómo estás?" } },
        { text: "I'm fine, thank you.", speechLang: "en-US", meaning: { ko: "잘 지내요, 감사해요.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
        { text: "And you?", speechLang: "en-US", meaning: { ko: "당신은요?", en: "And you?", es: "¿Y tú?" } },
      ],
      step2: {
        explanation: {
          ko: "'How are you?'에 다양하게 대답할 수 있어요!\n💡 'Fine' = 괜찮아요, 'Great' = 좋아요, 'Not bad' = 나쁘지 않아요.",
          en: "There are many ways to answer 'How are you?'!\n💡 'Fine' = okay, 'Great' = very good, 'Not bad' = okay-ish.",
          es: "¡Hay muchas respuestas para 'How are you?'!\n💡 'Fine' = bien, 'Great' = muy bien, 'Not bad' = más o menos.",
        },
        quizzes: [
          { type: "select", promptWithBlank: "How ___ you?", answer: "are", options: ["are", "is", "do"], fullSentence: "How are you?", fullSentenceMeaning: { ko: "어떻게 지내세요?", en: "How are you?", es: "¿Cómo estás?" } },
          { type: "select", promptWithBlank: "I'm ___, thank you.", answer: "fine", options: ["fine", "good", "well"], fullSentence: "I'm fine, thank you.", fullSentenceMeaning: { ko: "잘 지내요, 감사해요.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
          { type: "select", promptWithBlank: "___ you?", answer: "And", options: ["And", "But", "Or"], fullSentence: "And you?", fullSentenceMeaning: { ko: "당신은요?", en: "And you?", es: "¿Y tú?" } },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "¿Cómo estás?", speechLang: "es-ES", meaning: { ko: "어떻게 지내세요?", en: "How are you?", es: "¿Cómo estás?" } },
        { text: "Estoy bien, gracias.", speechLang: "es-ES", meaning: { ko: "잘 지내요, 감사해요.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
        { text: "¿Y tú?", speechLang: "es-ES", meaning: { ko: "당신은요?", en: "And you?", es: "¿Y tú?" } },
      ],
      step2: {
        explanation: {
          ko: "'¿Cómo estás?'에 다양하게 대답할 수 있어요!\n💡 'Estoy bien' = 잘 지내요, 'Más o menos' = 그저 그래요.",
          en: "Respond to '¿Cómo estás?' in many ways!\n💡 'Estoy bien' = I'm fine, 'Más o menos' = so-so.",
          es: "¡Responde a '¿Cómo estás?' de muchas formas!\n💡 'Estoy bien', 'Más o menos', 'Muy bien'.",
        },
        quizzes: [
          { type: "select", promptWithBlank: "¿Cómo ___?", answer: "estás", options: ["estás", "eres", "tienes"], fullSentence: "¿Cómo estás?", fullSentenceMeaning: { ko: "어떻게 지내세요?", en: "How are you?", es: "¿Cómo estás?" } },
          { type: "select", promptWithBlank: "Estoy ___, gracias.", answer: "bien", options: ["bien", "mal", "regular"], fullSentence: "Estoy bien, gracias.", fullSentenceMeaning: { ko: "잘 지내요, 감사해요.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
          { type: "select", promptWithBlank: "¿Y ___?", answer: "tú", options: ["tú", "usted", "él"], fullSentence: "¿Y tú?", fullSentenceMeaning: { ko: "당신은요?", en: "And you?", es: "¿Y tú?" } },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "어떻게 지내세요?", speechLang: "ko-KR", meaning: { ko: "어떻게 지내세요?", en: "How are you?", es: "¿Cómo estás?" } },
        { text: "잘 지내요, 감사해요.", speechLang: "ko-KR", meaning: { ko: "잘 지내요, 감사해요.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
        { text: "당신은요?", speechLang: "ko-KR", meaning: { ko: "당신은요?", en: "And you?", es: "¿Y tú?" } },
      ],
      step2: {
        explanation: {
          ko: "'어떻게 지내세요?'에 다양하게 대답할 수 있어요!\n💡 '잘 지내요' = 잘 지내요, '그저 그래요' = 그럭저럭이요.",
          en: "Respond to '어떻게 지내세요?' in various ways!\n💡 '잘 지내요' = I'm doing well, '그저 그래요' = so-so.",
          es: "¡Responde a '어떻게 지내세요?' de varias formas!\n💡 '잘 지내요' = bien, '그저 그래요' = más o menos.",
        },
        quizzes: [
          { type: "select", promptWithBlank: "어떻게 ___?", answer: "지내세요", options: ["지내세요", "가세요", "하세요"], fullSentence: "어떻게 지내세요?", fullSentenceMeaning: { ko: "어떻게 지내세요?", en: "How are you?", es: "¿Cómo estás?" } },
          { type: "select", promptWithBlank: "잘 ___, 감사해요.", answer: "지내요", options: ["지내요", "살아요", "먹어요"], fullSentence: "잘 지내요, 감사해요.", fullSentenceMeaning: { ko: "잘 지내요, 감사해요.", en: "I'm fine, thanks.", es: "Estoy bien, gracias." } },
          { type: "select", promptWithBlank: "___은요?", answer: "당신", options: ["당신", "우리", "그들"], fullSentence: "당신은요?", fullSentenceMeaning: { ko: "당신은요?", en: "And you?", es: "¿Y tú?" } },
        ],
      },
    },
  },

  // ─────────────── Day 6: Unit Review ─────────────────────────────────────────
  day_6: {
    english: {
      step1Sentences: [
        { text: "Hello! My name is Rudy. Nice to meet you!", speechLang: "en-US", meaning: { ko: "안녕하세요! 제 이름은 루디예요. 만나서 반가워요!", en: "Hello! My name is Rudy. Nice to meet you!", es: "¡Hola! Me llamo Rudy. ¡Mucho gusto!" } },
        { text: "I'm from Korea. I'm a student.", speechLang: "en-US", meaning: { ko: "저는 한국 출신이에요. 저는 학생이에요.", en: "I'm from Korea. I'm a student.", es: "Soy de Corea. Soy estudiante." } },
        { text: "How are you? See you later!", speechLang: "en-US", meaning: { ko: "어떻게 지내세요? 나중에 봐요!", en: "How are you? See you later!", es: "¿Cómo estás? ¡Hasta luego!" } },
      ],
      step2: {
        explanation: {
          ko: "Unit 1 복습! 이번 주에 배운 핵심 표현들을 정리해봐요.\n💡 자기소개 → 출신 → 직업 → 작별 → 안부 순서로 대화해보세요.",
          en: "Unit 1 Review! Let's summarise what we learned this week.\n💡 Try a full conversation: introduce → origin → job → farewell → how are you.",
          es: "¡Repaso de la Unidad 1! Resumen de la semana.\n💡 Practica: presentación → origen → trabajo → despedida → ¿cómo estás?.",
        },
        quizzes: [
          { type: "select", promptWithBlank: "My name ___ Rudy.", answer: "is", options: ["is", "am", "are"], fullSentence: "My name is Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Mi nombre es Rudy." } },
          { type: "select", promptWithBlank: "I'm ___ Korea.", answer: "from", options: ["from", "in", "at"], fullSentence: "I'm from Korea.", fullSentenceMeaning: { ko: "저는 한국 출신이에요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "select", promptWithBlank: "How ___ you?", answer: "are", options: ["are", "is", "do"], fullSentence: "How are you?", fullSentenceMeaning: { ko: "어떻게 지내세요?", en: "How are you?", es: "¿Cómo estás?" } },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "¡Hola! Me llamo Rudy. ¡Mucho gusto!", speechLang: "es-ES", meaning: { ko: "안녕! 내 이름은 루디야. 반가워!", en: "Hi! My name is Rudy. Nice to meet you!", es: "¡Hola! Me llamo Rudy. ¡Mucho gusto!" } },
        { text: "Soy de Corea. Soy estudiante.", speechLang: "es-ES", meaning: { ko: "한국 출신이야. 학생이야.", en: "I'm from Korea. I'm a student.", es: "Soy de Corea. Soy estudiante." } },
        { text: "¿Cómo estás? ¡Hasta luego!", speechLang: "es-ES", meaning: { ko: "어때? 나중에 봐!", en: "How are you? See you later!", es: "¿Cómo estás? ¡Hasta luego!" } },
      ],
      step2: {
        explanation: {
          ko: "스페인어 Unit 1 복습! 핵심 표현들을 정리해봐요.",
          en: "Spanish Unit 1 Review! Summarise key expressions.",
          es: "¡Repaso de la Unidad 1 de español! Resumen de expresiones clave.",
        },
        quizzes: [
          { type: "select", promptWithBlank: "Me ___ Rudy.", answer: "llamo", options: ["llamo", "soy", "estoy"], fullSentence: "Me llamo Rudy.", fullSentenceMeaning: { ko: "내 이름은 루디야.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "___ de Corea.", answer: "Soy", options: ["Soy", "Estoy", "Vivo"], fullSentence: "Soy de Corea.", fullSentenceMeaning: { ko: "한국 출신이야.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "select", promptWithBlank: "¿Cómo ___?", answer: "estás", options: ["estás", "eres", "tienes"], fullSentence: "¿Cómo estás?", fullSentenceMeaning: { ko: "어때?", en: "How are you?", es: "¿Cómo estás?" } },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "안녕하세요! 제 이름은 루디예요. 만나서 반가워요!", speechLang: "ko-KR", meaning: { ko: "안녕하세요! 제 이름은 루디예요. 만나서 반가워요!", en: "Hello! My name is Rudy. Nice to meet you!", es: "¡Hola! Me llamo Rudy. ¡Mucho gusto!" } },
        { text: "저는 한국 출신이에요. 저는 학생이에요.", speechLang: "ko-KR", meaning: { ko: "저는 한국 출신이에요. 저는 학생이에요.", en: "I'm from Korea. I'm a student.", es: "Soy de Corea. Soy estudiante." } },
        { text: "어떻게 지내세요? 나중에 봐요!", speechLang: "ko-KR", meaning: { ko: "어떻게 지내세요? 나중에 봐요!", en: "How are you? See you later!", es: "¿Cómo estás? ¡Hasta luego!" } },
      ],
      step2: {
        explanation: {
          ko: "한국어 Unit 1 복습! 이번 주에 배운 핵심 표현들을 정리해봐요.",
          en: "Korean Unit 1 Review! Summarise everything you learned this week.",
          es: "¡Repaso de Unidad 1 de coreano! Resumen de la semana.",
        },
        quizzes: [
          { type: "select", promptWithBlank: "제 이름은 루디___.", answer: "예요", options: ["예요", "이에요", "에요"], fullSentence: "제 이름은 루디예요.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "저는 한국 ___이에요.", answer: "출신", options: ["출신", "학생", "선생님"], fullSentence: "저는 한국 출신이에요.", fullSentenceMeaning: { ko: "한국 출신이에요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "select", promptWithBlank: "어떻게 ___?", answer: "지내세요", options: ["지내세요", "가세요", "주세요"], fullSentence: "어떻게 지내세요?", fullSentenceMeaning: { ko: "어떻게 지내세요?", en: "How are you?", es: "¿Cómo estás?" } },
        ],
      },
    },
  },
};

// ── Feedback messages ─────────────────────────────────────────────────────────

export const PRONUNCIATION_FEEDBACK = {
  excellent: {
    ko: ["완벽해! 원어민급이야! 🌟", "대단한데? 발음이 정말 좋아! 🎯", "이 정도면 현장 투입 가능해! 💪"],
    en: ["Perfect! Native-level! 🌟", "Wow, great pronunciation! 🎯", "Field-ready! 💪"],
    es: ["¡Perfecto! ¡Nivel nativo! 🌟", "¡Increíble pronunciación! 🎯", "¡Listo para el campo! 💪"],
  },
  good: {
    ko: ["좋아! 조금만 더! 💪", "잘하고 있어! 한번 더 해볼까? 🔄", "거의 다 됐어! 👍"],
    en: ["Good! Almost there! 💪", "Nice! Try once more? 🔄", "So close! 👍"],
    es: ["¡Bien! ¡Casi! 💪", "¡Buen trabajo! ¿Una vez más? 🔄", "¡Casi perfecto! 👍"],
  },
  needsWork: {
    ko: ["괜찮아, 다시 해보자 🦊", "천천히 따라해봐 👂", "이 부분에 집중해봐 🎧"],
    en: ["No worries, let's try again 🦊", "Try slowly 👂", "Focus on this part 🎧"],
    es: ["Tranquilo, intentemos de nuevo 🦊", "Intenta despacio 👂", "Enfócate en esta parte 🎧"],
  },
};

export function getRandomFeedback(type: keyof typeof PRONUNCIATION_FEEDBACK, nativeLang: string): string {
  const key = nativeLang === "korean" ? "ko" : nativeLang === "spanish" ? "es" : "en";
  const arr = PRONUNCIATION_FEEDBACK[type][key as "ko" | "en" | "es"];
  return arr[Math.floor(Math.random() * arr.length)];
}
