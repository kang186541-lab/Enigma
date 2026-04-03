/**
 * Day 11-12 Partial (A1 Unit 2: Numbers & Time)
 * STEP 1: Pimsleur Anticipation + Graduated Interval Recall
 * STEP 2: Lexical Chunking + "왜" explanations
 * STEP 3: Task-Based Learning missions
 * STEP 4: SM-2 Spaced Repetition
 */
import type { Tri } from "../../lib/dailyCourseData";
import type {
  DayLessonData,
  MissionTalkLangData,
  ReviewQuestion,
  LearningLangKey,
  GrammarExplanation,
} from "../../lib/lessonContent";

// =============================================================================
// STEP 1 + STEP 2 (LESSON_CONTENT)
// =============================================================================

export const LESSON_CONTENT_D11_12: Record<string, Partial<Record<LearningLangKey, DayLessonData>>> = {

  // ─────────────── Day 11: Phone Numbers & Age ──────────────────────────────
  day_11: {
    english: {
      step1Sentences: [
        {
          text: "What's your phone number?",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "전화번호가 뭐예요?", en: "What's your phone number?", es: "¿Cuál es tu número de teléfono?" },
        },
        {
          text: "My number is 010-1234-5678.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "제 번호는 공일공-일이삼사-오육칠팔이에요.", en: "My number is 010-1234-5678.", es: "Mi número es 010-1234-5678." },
        },
        {
          text: "How old are you?",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" },
        },
        {
          text: "I'm twenty-five years old.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "스물다섯 살이에요.", en: "I'm twenty-five years old.", es: "Tengo veinticinco años." },
        },
        {
          text: "She's thirty.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "그녀는 서른 살이에요.", en: "She's thirty.", es: "Ella tiene treinta." },
          recallRound: true,
        },
        {
          text: "Can you say that again slowly?",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "천천히 다시 말해 주세요.", en: "Can you say that again slowly?", es: "¿Puede decir eso otra vez despacio?" },
          recallRound: true,
        },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "전화번호를 물을 때 'What's your phone number?'라고 해요. 'What's'는 'What is'를 줄인 거예요. 대답은 'My number is ___'로 하면 돼요. 나이를 물을 때는 'How old are you?'인데, 직역하면 '얼마나 오래됐어요?'라는 뜻이에요. 한국어처럼 '몇 살이에요?'가 아니라 '얼마나 늙었어요?'라고 물어보는 거죠! 대답은 'I'm ___ years old'예요. 다른 사람은 'She's thirty' / 'He's twenty'처럼 짧게도 말해요.",
            en: "To ask for a phone number, say 'What's your phone number?' — answer with 'My number is ___.' For age, ask 'How old are you?' and reply 'I'm ___ years old.' You can also say it shorter: 'She's thirty' (no need for 'years old' every time). Notice: English spells out each digit for phone numbers — 'zero-one-zero', not 'ten'.",
            es: "Para pedir un número, di 'What's your phone number?' — responde con 'My number is ___.' Para la edad, pregunta 'How old are you?' y responde 'I'm ___ years old.' También puedes acortarlo: 'She's thirty' (sin 'years old'). Nota: en inglés cada dígito se dice individualmente — 'zero-one-zero', no 'diez'.",
          },
          examples: {
            ko: "What's your phone number? My number is 010-1234-5678. (전화번호 교환)\nHow old are you? I'm twenty-five years old. (나이 묻고 답하기)\nShe's thirty. (다른 사람 나이 말하기 — 간략 버전)",
            en: "What's your phone number? My number is 010-1234-5678. (Exchanging contact info.)\nHow old are you? I'm twenty-five years old. (Asking and answering about age.)\nShe's thirty. (Talking about someone else's age — short form.)",
            es: "What's your phone number? My number is 010-1234-5678. (Intercambiando contacto.)\nHow old are you? I'm twenty-five years old. (Preguntando y respondiendo la edad.)\nShe's thirty. (Hablando de la edad de alguien — forma corta.)",
          },
          mistakes: {
            ko: "❌ I have twenty-five years.\n✅ I'm twenty-five years old. (영어는 나이를 '가지고 있다'가 아니라 '~살이다'라고 해요!)\n❌ My number is ten-twelve-thirty-four.\n✅ My number is zero-one-zero, one-two-three-four. (전화번호는 숫자를 하나씩!)",
            en: "❌ I have twenty-five years.\n✅ I'm twenty-five years old. (English uses 'be', not 'have' for age!)\n❌ My number is ten-twelve.\n✅ My number is zero-one-zero, one-two-three-four. (Say each digit separately!)",
            es: "❌ I have twenty-five years.\n✅ I'm twenty-five years old. (En inglés se usa 'be', no 'have' para la edad — a diferencia del español.)\n❌ My number is ten-twelve.\n✅ My number is zero-one-zero, one-two-three-four. (Di cada dígito por separado.)",
          },
          rudyTip: {
            ko: "전화번호는 숫자 하나씩! 그리고 영어에서 나이는 'I'm ___'이야. 스페인어처럼 'I have ___'가 아니야! 이 차이만 기억하면 OK~",
            en: "Phone numbers go digit by digit! And remember — English says 'I'm 25' (I am), not 'I have 25 years.' If someone asks 'How old are you?' just say 'I'm' + the number!",
            es: "Los números de teléfono van dígito por dígito. Y recuerda: en inglés se dice 'I'm 25' (soy), no 'I have 25 years' como en español. Si preguntan 'How old are you?' solo di 'I'm' + el número.",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "What's your phone ___?",
            answer: "number",
            options: ["number", "name", "address"],
            fullSentence: "What's your phone number?",
            fullSentenceMeaning: { ko: "전화번호가 뭐예요?", en: "What's your phone number?", es: "¿Cuál es tu número de teléfono?" },
          },
          {
            type: "select",
            promptWithBlank: "How ___ are you?",
            answer: "old",
            options: ["old", "much", "many"],
            fullSentence: "How old are you?",
            fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" },
          },
          {
            type: "select",
            promptWithBlank: "I'm twenty-five years ___.",
            answer: "old",
            options: ["old", "age", "long"],
            fullSentence: "I'm twenty-five years old.",
            fullSentenceMeaning: { ko: "스물다섯 살이에요.", en: "I'm twenty-five years old.", es: "Tengo veinticinco años." },
          },
          {
            type: "input",
            promptWithBlank: "My ___ is 010-1234-5678.",
            answer: "number",
            fullSentence: "My number is 010-1234-5678.",
            fullSentenceMeaning: { ko: "제 번호는 010-1234-5678이에요.", en: "My number is 010-1234-5678.", es: "Mi número es 010-1234-5678." },
          },
          {
            type: "listening",
            audioText: "I'm twenty-five years old.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["I'm twenty-five years old.", "What's your phone number?", "She's thirty.", "Can you say that again slowly?"],
            correct: 0,
            audioOnly: true,
          },
        ],
      },
    },

    spanish: {
      step1Sentences: [
        {
          text: "¿Cuál es tu número de teléfono?",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "전화번호가 뭐예요?", en: "What's your phone number?", es: "¿Cuál es tu número de teléfono?" },
        },
        {
          text: "Mi número es 010-1234-5678.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "제 번호는 공일공-일이삼사-오육칠팔이에요.", en: "My number is 010-1234-5678.", es: "Mi número es 010-1234-5678." },
        },
        {
          text: "¿Cuántos años tienes?",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" },
        },
        {
          text: "Tengo veinticinco años.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "스물다섯 살이에요.", en: "I'm twenty-five years old.", es: "Tengo veinticinco años." },
        },
        {
          text: "Ella tiene treinta.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "그녀는 서른 살이에요.", en: "She's thirty.", es: "Ella tiene treinta." },
          recallRound: true,
        },
        {
          text: "¿Puede hablar más despacio?",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "천천히 말해 주세요.", en: "Can you speak more slowly?", es: "¿Puede hablar más despacio?" },
          recallRound: true,
        },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "스페인어에서 나이를 말할 때 'Tengo ___ años'라고 해요. 직역하면 '___년을 가지고 있다'인데, 영어와 다르게 '가지다(tener)'를 쓰는 게 포인트예요! 한국어도 '스물다섯 살이에요'처럼 '이다'를 쓰니까, 스페인어의 'tener'가 특이한 거죠. 전화번호는 'Mi número es ___'로 말하면 돼요.",
            en: "In Spanish, age uses 'tener' (to have): 'Tengo 25 años' = literally 'I have 25 years.' This is different from English ('I am 25'). Phone numbers: 'Mi número es ___.' To ask age: '¿Cuántos años tienes?' (literally 'How many years do you have?'). For others: 'Ella tiene treinta' (She has thirty).",
            es: "Para la edad en español, usamos 'tener': 'Tengo 25 años' = literalmente 'tengo 25 años.' Es diferente del inglés ('I am 25'). Teléfono: 'Mi número es ___.' Para preguntar: '¿Cuántos años tienes?' Para otros: 'Ella tiene treinta.'",
          },
          examples: {
            ko: "¿Cuál es tu número de teléfono? Mi número es 010-1234-5678. (전화번호 교환)\n¿Cuántos años tienes? Tengo veinticinco años. (나이 묻고 답하기)\nElla tiene treinta. (다른 사람 나이 — tiene로!)",
            en: "¿Cuál es tu número? Mi número es 010-1234-5678. (Exchanging numbers.)\n¿Cuántos años tienes? Tengo veinticinco años. (Age — note 'tener' not 'ser'!)\nElla tiene treinta. (She's thirty — 'tiene' for her too.)",
            es: "¿Cuál es tu número? Mi número es 010-1234-5678. (Intercambiando números.)\n¿Cuántos años tienes? Tengo veinticinco años. (Preguntando la edad.)\nElla tiene treinta. (Edad de otra persona — 'tiene'.)",
          },
          mistakes: {
            ko: "❌ Soy veinticinco años.\n✅ Tengo veinticinco años. (나이는 'ser'가 아니라 'tener'! 영어처럼 'I am'을 쓰면 안 돼요!)\n❌ Ella es treinta.\n✅ Ella tiene treinta. (다른 사람 나이도 'tener'!)",
            en: "❌ Soy veinticinco años.\n✅ Tengo veinticinco años. (Age uses 'tener', not 'ser' — don't translate 'I am' literally!)\n❌ Ella es treinta.\n✅ Ella tiene treinta. (Other people's age also uses 'tener'!)",
            es: "❌ Soy veinticinco años.\n✅ Tengo veinticinco años. (La edad usa 'tener', no 'ser'.)\n❌ Ella es treinta.\n✅ Ella tiene treinta. (La edad de otros también usa 'tener'.)",
          },
          rudyTip: {
            ko: "스페인어에서는 나이를 '가지고 있다(tener)'고 해! 'Tengo 25 años' = '25년을 가지고 있다'. 영어랑 완전 다른 발상이지?",
            en: "In Spanish you 'have' your age! 'Tengo 25 años' = 'I have 25 years.' Don't make the classic mistake of using 'soy' — age belongs to 'tener'!",
            es: "En español 'tienes' tu edad. 'Tengo 25 años' es natural. El error clásico es usar 'soy' — la edad es de 'tener'.",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "¿Cuál es tu ___ de teléfono?",
            answer: "número",
            options: ["número", "nombre", "dirección"],
            fullSentence: "¿Cuál es tu número de teléfono?",
            fullSentenceMeaning: { ko: "전화번호가 뭐예요?", en: "What's your phone number?", es: "¿Cuál es tu número de teléfono?" },
          },
          {
            type: "select",
            promptWithBlank: "¿Cuántos ___ tienes?",
            answer: "años",
            options: ["años", "días", "números"],
            fullSentence: "¿Cuántos años tienes?",
            fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" },
          },
          {
            type: "select",
            promptWithBlank: "___ veinticinco años.",
            answer: "Tengo",
            options: ["Tengo", "Soy", "Estoy"],
            fullSentence: "Tengo veinticinco años.",
            fullSentenceMeaning: { ko: "스물다섯 살이에요.", en: "I'm twenty-five years old.", es: "Tengo veinticinco años." },
          },
          {
            type: "input",
            promptWithBlank: "Ella ___ treinta.",
            answer: "tiene",
            fullSentence: "Ella tiene treinta.",
            fullSentenceMeaning: { ko: "그녀는 서른 살이에요.", en: "She's thirty.", es: "Ella tiene treinta." },
          },
          {
            type: "listening",
            audioText: "Tengo veinticinco años.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["Tengo veinticinco años.", "¿Cuál es tu número?", "Ella tiene treinta.", "¿Puede hablar más despacio?"],
            correct: 0,
            audioOnly: true,
          },
        ],
      },
    },

    korean: {
      step1Sentences: [
        {
          text: "전화번호가 뭐예요?",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "전화번호가 뭐예요?", en: "What's your phone number?", es: "¿Cuál es tu número de teléfono?" },
        },
        {
          text: "제 번호는 공일공-일이삼사-오육칠팔이에요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "제 번호는 010-1234-5678이에요.", en: "My number is 010-1234-5678.", es: "Mi número es 010-1234-5678." },
        },
        {
          text: "몇 살이에요?",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" },
        },
        {
          text: "스물다섯 살이에요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "스물다섯 살이에요.", en: "I'm twenty-five years old.", es: "Tengo veinticinco años." },
        },
        {
          text: "서른 살이에요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "서른 살이에요.", en: "She's thirty.", es: "Ella tiene treinta." },
          recallRound: true,
        },
        {
          text: "천천히 말해 주세요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "천천히 말해 주세요.", en: "Please speak slowly.", es: "Por favor, habla despacio." },
          recallRound: true,
        },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "한국어에는 숫자 체계가 두 가지예요! 나이에는 '순우리말 숫자'(하나, 둘, 스물, 서른)를 쓰고, 전화번호에는 '한자어 숫자'(일, 이, 삼, 공)를 써요. 왜 다를까요? 나이는 '살'이라는 고유어 단위와 함께 쓰고, 전화번호는 번호를 읽는 거라 한자어를 쓰는 거예요. 나이: '스물다섯 살', 전화: '공일공-일이삼사'. 이 규칙만 기억하면 돼요!",
            en: "Korean has TWO number systems! For age, use native Korean numbers: 하나(1), 둘(2), 스물(20), 서른(30). For phone numbers, use Sino-Korean: 공(0), 일(1), 이(2), 삼(3). Why? Age uses the native counter '살', while phone numbers read digits individually. Age: '스물다섯 살' (25 years old). Phone: '공일공-일이삼사' (010-1234).",
            es: "El coreano tiene DOS sistemas de números. Para la edad, se usan números nativos coreanos: 하나(1), 둘(2), 스물(20), 서른(30). Para teléfonos, se usan sino-coreanos: 공(0), 일(1), 이(2), 삼(3). Edad: '스물다섯 살' (25 años). Teléfono: '공일공-일이삼사' (010-1234).",
          },
          examples: {
            ko: "몇 살이에요? 스물다섯 살이에요. (나이 — 순우리말: 스물다섯)\n전화번호가 뭐예요? 공일공-일이삼사-오육칠팔이에요. (전화 — 한자어: 공, 일, 이...)\n서른 살이에요. (30살 — 순우리말: 서른)",
            en: "몇 살이에요? 스물다섯 살이에요. (Age — native Korean: 스물다섯 = 25.)\n전화번호가 뭐예요? 공일공-일이삼사-오육칠팔이에요. (Phone — Sino-Korean digits.)\n서른 살이에요. (30 years old — 서른 is native Korean for 30.)",
            es: "몇 살이에요? 스물다섯 살이에요. (Edad — nativo coreano: 스물다섯 = 25.)\n전화번호가 뭐예요? 공일공-일이삼사-오육칠팔이에요. (Teléfono — dígitos sino-coreanos.)\n서른 살이에요. (30 años — 서른 es nativo coreano para 30.)",
          },
          mistakes: {
            ko: "❌ 이십오 살이에요.\n✅ 스물다섯 살이에요. (나이는 순우리말 숫자! '이십오'는 한자어라 안 돼요!)\n❌ 전화번호는 하나둘셋사...\n✅ 전화번호는 공일공-일이삼사... (전화는 한자어 숫자!)",
            en: "❌ 이십오 살이에요.\n✅ 스물다섯 살이에요. (Age needs native Korean numbers, not Sino-Korean!)\n❌ 전화번호는 하나둘셋...\n✅ 전화번호는 공일공-일이삼사... (Phone needs Sino-Korean digits!)",
            es: "❌ 이십오 살이에요.\n✅ 스물다섯 살이에요. (La edad necesita números nativos coreanos, no sino-coreanos.)\n❌ 전화번호는 하나둘셋...\n✅ 전화번호는 공일공-일이삼사... (El teléfono necesita dígitos sino-coreanos.)",
          },
          rudyTip: {
            ko: "핵심은 이거야! 나이=순우리말(스물, 서른, 마흔...), 전화=한자어(공, 일, 이, 삼...). 두 가지 숫자를 쓰는 게 한국어의 매력이야~",
            en: "Here's the secret: Age = native Korean (스물, 서른, 마흔...), Phone = Sino-Korean (공, 일, 이, 삼...). Two number systems — that's what makes Korean special!",
            es: "Aquí está el secreto: Edad = coreano nativo (스물, 서른...), Teléfono = sino-coreano (공, 일, 이...). Dos sistemas de números: eso hace al coreano especial.",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "전화번호가 ___예요?",
            answer: "뭐",
            options: ["뭐", "몇", "어디"],
            fullSentence: "전화번호가 뭐예요?",
            fullSentenceMeaning: { ko: "전화번호가 뭐예요?", en: "What's your phone number?", es: "¿Cuál es tu número?" },
          },
          {
            type: "select",
            promptWithBlank: "몇 ___이에요?",
            answer: "살",
            options: ["살", "개", "번"],
            fullSentence: "몇 살이에요?",
            fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" },
          },
          {
            type: "select",
            promptWithBlank: "___ 살이에요.",
            answer: "스물다섯",
            options: ["스물다섯", "이십오", "이오"],
            fullSentence: "스물다섯 살이에요.",
            fullSentenceMeaning: { ko: "스물다섯 살이에요.", en: "I'm twenty-five.", es: "Tengo veinticinco años." },
          },
          {
            type: "input",
            promptWithBlank: "제 번호는 ___-일이삼사-오육칠팔이에요.",
            answer: "공일공",
            fullSentence: "제 번호는 공일공-일이삼사-오육칠팔이에요.",
            fullSentenceMeaning: { ko: "제 번호는 010-1234-5678이에요.", en: "My number is 010-1234-5678.", es: "Mi número es 010-1234-5678." },
          },
          {
            type: "listening",
            audioText: "스물다섯 살이에요.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["스물다섯 살이에요.", "전화번호가 뭐예요?", "서른 살이에요.", "천천히 말해 주세요."],
            correct: 0,
            audioOnly: true,
          },
        ],
      },
    },
  },

  // ─────────────── Day 12: Unit 2 Comprehensive Review ──────────────────────
  day_12: {
    english: {
      step1Sentences: [
        {
          text: "Two tickets, please.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." },
          recallRound: true,
        },
        {
          text: "How much is this? It's fifteen dollars.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "이거 얼마예요? 만 오천 원이에요.", en: "How much is this? It's fifteen dollars.", es: "¿Cuánto cuesta? Son quince dólares." },
        },
        {
          text: "What time is it? It's half past three.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "몇 시예요? 세 시 반이에요.", en: "What time is it? It's half past three.", es: "¿Qué hora es? Son las tres y media." },
        },
        {
          text: "I wake up at seven.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "일곱 시에 일어나요.", en: "I wake up at seven.", es: "Me despierto a las siete." },
        },
        {
          text: "I'm twenty-five. What's your number?",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "스물다섯 살이에요. 번호가 뭐예요?", en: "I'm twenty-five. What's your number?", es: "Tengo veinticinco. ¿Cuál es tu número?" },
          recallRound: true,
        },
        {
          text: "Thank you very much!",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "정말 감사합니다!", en: "Thank you very much!", es: "¡Muchas gracias!" },
        },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "Unit 2 총복습! 숫자(How much? / Two tickets), 시간(What time? / half past three), 나이(How old? / I'm twenty-five), 전화(What's your number?). 이 네 가지 패턴만 기억하면 일상생활에서 숫자 관련 대화는 다 할 수 있어요! 가격은 'How much is this?', 시간은 'What time is it?', 나이는 'How old are you?' — 전부 'How/What'으로 시작하죠?",
            en: "Unit 2 full review! Numbers (How much? / Two tickets), time (What time? / half past three), age (How old? / I'm twenty-five), phone (What's your number?). All these patterns start with 'How' or 'What' — they're your key question words for numbers and time!",
            es: "Repaso completo de Unidad 2. Números (How much? / Two tickets), hora (What time? / half past three), edad (How old? / I'm twenty-five), teléfono (What's your number?). Todos estos patrones empiezan con 'How' o 'What' — son tus palabras clave para preguntas.",
          },
          examples: {
            ko: "Two tickets, please. How much is this? (수량 + 가격)\nWhat time is it? It's half past three. I wake up at seven. (시간)\nI'm twenty-five. What's your number? (나이 + 전화번호)",
            en: "Two tickets, please. How much is this? (Quantity + price.)\nWhat time is it? It's half past three. I wake up at seven. (Time.)\nI'm twenty-five. What's your number? (Age + phone number.)",
            es: "Two tickets, please. How much is this? (Cantidad + precio.)\nWhat time is it? It's half past three. I wake up at seven. (Hora.)\nI'm twenty-five. What's your number? (Edad + teléfono.)",
          },
          mistakes: {
            ko: "❌ How much are this?\n✅ How much is this? (this는 단수라 'is'!)\n❌ I'm twenty-five years.\n✅ I'm twenty-five years old. ('old'를 빼먹지 마세요! 짧게는 'I'm twenty-five'도 OK)",
            en: "❌ How much are this?\n✅ How much is this? ('this' is singular — use 'is'!)\n❌ It's three and half.\n✅ It's half past three. (The format is 'half past' + hour!)",
            es: "❌ How much are this?\n✅ How much is this? ('this' es singular — usa 'is'.)\n❌ It's three and half.\n✅ It's half past three. (El formato es 'half past' + hora.)",
          },
          rudyTip: {
            ko: "Unit 2를 한 문장으로 정리하면: 'I'm 25, it's half past 3, two tickets please, my number is 010!' 이걸 한 번에 말할 수 있으면 넌 이미 숫자 마스터야!",
            en: "Unit 2 in one breath: 'I'm 25, it's half past 3, two tickets please, my number is 010!' If you can say all that, you've mastered numbers and time. Case closed!",
            es: "Unidad 2 en una frase: 'I'm 25, it's half past 3, two tickets please, my number is 010!' Si puedes decir todo eso, dominaste números y hora. Caso cerrado.",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "Two ___, please.",
            answer: "tickets",
            options: ["tickets", "ticket", "times"],
            fullSentence: "Two tickets, please.",
            fullSentenceMeaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." },
          },
          {
            type: "select",
            promptWithBlank: "How ___ is this?",
            answer: "much",
            options: ["much", "many", "old"],
            fullSentence: "How much is this?",
            fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta?" },
          },
          {
            type: "select",
            promptWithBlank: "It's ___ past three.",
            answer: "half",
            options: ["half", "quarter", "ten"],
            fullSentence: "It's half past three.",
            fullSentenceMeaning: { ko: "세 시 반이에요.", en: "It's half past three.", es: "Son las tres y media." },
          },
          {
            type: "input",
            promptWithBlank: "I wake ___ at seven.",
            answer: "up",
            fullSentence: "I wake up at seven.",
            fullSentenceMeaning: { ko: "일곱 시에 일어나요.", en: "I wake up at seven.", es: "Me despierto a las siete." },
          },
          {
            type: "listening",
            audioText: "How much is this? It's fifteen dollars.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["How much is this? It's fifteen dollars.", "What time is it? It's half past three.", "I'm twenty-five.", "Two tickets, please."],
            correct: 0,
            audioOnly: true,
          },
          {
            type: "select",
            promptWithBlank: "Thank you very ___!",
            answer: "much",
            options: ["much", "many", "more"],
            fullSentence: "Thank you very much!",
            fullSentenceMeaning: { ko: "정말 감사합니다!", en: "Thank you very much!", es: "¡Muchas gracias!" },
          },
        ],
      },
    },

    spanish: {
      step1Sentences: [
        {
          text: "Dos entradas, por favor.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." },
          recallRound: true,
        },
        {
          text: "¿Cuánto cuesta? Son quince euros.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "얼마예요? 15유로예요.", en: "How much? It's fifteen euros.", es: "¿Cuánto cuesta? Son quince euros." },
        },
        {
          text: "¿Qué hora es? Son las tres y media.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "몇 시예요? 세 시 반이에요.", en: "What time is it? It's half past three.", es: "¿Qué hora es? Son las tres y media." },
        },
        {
          text: "Me despierto a las siete.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "일곱 시에 일어나요.", en: "I wake up at seven.", es: "Me despierto a las siete." },
        },
        {
          text: "Tengo veinticinco. ¿Cuál es tu número?",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "스물다섯 살이에요. 번호가 뭐예요?", en: "I'm twenty-five. What's your number?", es: "Tengo veinticinco. ¿Cuál es tu número?" },
          recallRound: true,
        },
        {
          text: "¡Muchas gracias!",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "정말 감사합니다!", en: "Thank you very much!", es: "¡Muchas gracias!" },
        },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "Unit 2 스페인어 총복습! 가격(¿Cuánto cuesta?), 시간(¿Qué hora es? → Son las ___), 나이(Tengo ___ años), 전화(¿Cuál es tu número?). 스페인어 핵심: 나이에는 'tener'(가지다), 시간에는 'son las'(2시 이상) 또는 'es la'(1시만), 가격도 'son'을 써요. 모두 다르지만 각각 패턴만 기억하면 돼요!",
            en: "Unit 2 Spanish review! Price (¿Cuánto cuesta?), time (¿Qué hora es? → Son las ___), age (Tengo ___ años), phone (¿Cuál es tu número?). Key Spanish rules: age uses 'tener', time uses 'son las' (except 1:00 = 'es la una'), prices use 'son' too.",
            es: "Repaso completo de Unidad 2. Precio (¿Cuánto cuesta?), hora (¿Qué hora es? → Son las ___), edad (Tengo ___ años), teléfono (¿Cuál es tu número?). Reglas clave: edad = 'tener', hora = 'son las' (excepto 1:00 = 'es la una'), precio = 'son'.",
          },
          examples: {
            ko: "Dos entradas, por favor. ¿Cuánto cuesta? (수량 + 가격)\n¿Qué hora es? Son las tres y media. Me despierto a las siete. (시간)\nTengo veinticinco. ¿Cuál es tu número? (나이 + 전화)",
            en: "Dos entradas, por favor. ¿Cuánto cuesta? (Quantity + price.)\n¿Qué hora es? Son las tres y media. Me despierto a las siete. (Time.)\nTengo veinticinco. ¿Cuál es tu número? (Age + phone.)",
            es: "Dos entradas, por favor. ¿Cuánto cuesta? (Cantidad + precio.)\n¿Qué hora es? Son las tres y media. Me despierto a las siete. (Hora.)\nTengo veinticinco. ¿Cuál es tu número? (Edad + teléfono.)",
          },
          mistakes: {
            ko: "❌ Soy veinticinco.\n✅ Tengo veinticinco. (나이는 'ser'가 아니라 'tener'!)\n❌ Son la una.\n✅ Es la una. (1시만 예외! 'Son las'가 아니라 'Es la'!)",
            en: "❌ Soy veinticinco.\n✅ Tengo veinticinco. (Age uses 'tener', not 'ser'!)\n❌ Son la una.\n✅ Es la una. (1 o'clock is the exception — 'Es la' not 'Son las'!)",
            es: "❌ Soy veinticinco.\n✅ Tengo veinticinco. (La edad usa 'tener', no 'ser'.)\n❌ Son la una.\n✅ Es la una. (La 1 es la excepción — 'Es la' no 'Son las'.)",
          },
          rudyTip: {
            ko: "스페인어 Unit 2 핵심: 나이=Tengo, 시간=Son las(1시만 Es la), 가격=¿Cuánto cuesta?+Son, 전화=¿Cuál es tu número? 네 가지 패턴이면 끝!",
            en: "Spanish Unit 2 cheat sheet: Age = Tengo, Time = Son las (except Es la una), Price = ¿Cuánto cuesta? + Son, Phone = ¿Cuál es tu número? Four patterns and you're done!",
            es: "Resumen Unidad 2: Edad = Tengo, Hora = Son las (excepto Es la una), Precio = ¿Cuánto cuesta? + Son, Teléfono = ¿Cuál es tu número? Cuatro patrones y listo.",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "Dos ___, por favor.",
            answer: "entradas",
            options: ["entradas", "entrada", "tickets"],
            fullSentence: "Dos entradas, por favor.",
            fullSentenceMeaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." },
          },
          {
            type: "select",
            promptWithBlank: "¿Cuánto ___?",
            answer: "cuesta",
            options: ["cuesta", "es", "tiene"],
            fullSentence: "¿Cuánto cuesta?",
            fullSentenceMeaning: { ko: "얼마예요?", en: "How much?", es: "¿Cuánto cuesta?" },
          },
          {
            type: "select",
            promptWithBlank: "Son las tres y ___.",
            answer: "media",
            options: ["media", "mitad", "medio"],
            fullSentence: "Son las tres y media.",
            fullSentenceMeaning: { ko: "세 시 반이에요.", en: "It's half past three.", es: "Son las tres y media." },
          },
          {
            type: "input",
            promptWithBlank: "Me ___ a las siete.",
            answer: "despierto",
            fullSentence: "Me despierto a las siete.",
            fullSentenceMeaning: { ko: "일곱 시에 일어나요.", en: "I wake up at seven.", es: "Me despierto a las siete." },
          },
          {
            type: "listening",
            audioText: "¿Cuánto cuesta? Son quince euros.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["¿Cuánto cuesta? Son quince euros.", "¿Qué hora es? Son las tres y media.", "Tengo veinticinco.", "Dos entradas, por favor."],
            correct: 0,
            audioOnly: true,
          },
          {
            type: "select",
            promptWithBlank: "¡Muchas ___!",
            answer: "gracias",
            options: ["gracias", "gustos", "veces"],
            fullSentence: "¡Muchas gracias!",
            fullSentenceMeaning: { ko: "정말 감사합니다!", en: "Thank you very much!", es: "¡Muchas gracias!" },
          },
        ],
      },
    },

    korean: {
      step1Sentences: [
        {
          text: "표 두 장 주세요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." },
          recallRound: true,
        },
        {
          text: "이거 얼마예요? 만 오천 원이에요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "이거 얼마예요? 15,000원이에요.", en: "How much is this? It's 15,000 won.", es: "¿Cuánto cuesta? Son 15,000 won." },
        },
        {
          text: "몇 시예요? 세 시 반이에요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "몇 시예요? 세 시 반이에요.", en: "What time is it? It's half past three.", es: "¿Qué hora es? Son las tres y media." },
        },
        {
          text: "일곱 시에 일어나요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "일곱 시에 일어나요.", en: "I wake up at seven.", es: "Me despierto a las siete." },
        },
        {
          text: "스물다섯 살이에요. 번호가 뭐예요?",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "스물다섯 살이에요. 번호가 뭐예요?", en: "I'm twenty-five. What's your number?", es: "Tengo veinticinco. ¿Cuál es tu número?" },
          recallRound: true,
        },
        {
          text: "정말 감사합니다!",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "정말 감사합니다!", en: "Thank you very much!", es: "¡Muchas gracias!" },
        },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "Unit 2 한국어 총복습! 핵심은 '두 가지 숫자 체계'예요. 순우리말(하나, 둘, 셋→시간/나이/개수): '세 시', '스물다섯 살', '두 장'. 한자어(일, 이, 삼→돈/전화/날짜): '만 오천 원', '공일공'. 가격은 '얼마예요?', 시간은 '몇 시예요?', 나이는 '몇 살이에요?'로 물어요. 전부 '몇/얼마'가 핵심 질문 단어예요!",
            en: "Unit 2 Korean review! The key is TWO number systems. Native Korean (하나, 둘, 셋 → time/age/counting): '세 시' (3 o'clock), '스물다섯 살' (25 years), '두 장' (2 tickets). Sino-Korean (일, 이, 삼 → money/phone/dates): '만 오천 원' (15,000 won), '공일공' (010). Questions use '몇/얼마': 얼마예요?, 몇 시예요?, 몇 살이에요?",
            es: "Repaso Unidad 2 coreano. La clave son DOS sistemas numéricos. Nativo coreano (하나, 둘, 셋 → hora/edad/conteo): '세 시', '스물다섯 살', '두 장'. Sino-coreano (일, 이, 삼 → dinero/teléfono/fechas): '만 오천 원', '공일공'. Preguntas con '몇/얼마': 얼마예요?, 몇 시예요?, 몇 살이에요?",
          },
          examples: {
            ko: "표 두 장 주세요. 이거 얼마예요? (수량+가격 — 순우리말 '두' + 한자어 '만 오천')\n몇 시예요? 세 시 반이에요. 일곱 시에 일어나요. (시간 — 순우리말 '세', '일곱')\n스물다섯 살이에요. 번호가 뭐예요? (나이+전화 — 순우리말 '스물다섯' + 한자어 '공일공')",
            en: "표 두 장 주세요. 이거 얼마예요? (Quantity + price — native '두' + Sino '만 오천'.)\n몇 시예요? 세 시 반이에요. (Time — native '세', '일곱'.)\n스물다섯 살이에요. 번호가 뭐예요? (Age + phone — native '스물다섯' + Sino '공일공'.)",
            es: "표 두 장 주세요. 이거 얼마예요? (Cantidad + precio — nativo '두' + sino '만 오천'.)\n몇 시예요? 세 시 반이에요. (Hora — nativo '세', '일곱'.)\n스물다섯 살이에요. 번호가 뭐예요? (Edad + teléfono — nativo '스물다섯' + sino '공일공'.)",
          },
          mistakes: {
            ko: "❌ 이십오 살이에요.\n✅ 스물다섯 살이에요. (나이는 순우리말 숫자!)\n❌ 삼 시예요.\n✅ 세 시예요. (시간도 순우리말! 하나→한, 둘→두, 셋→세, 넷→네)",
            en: "❌ 이십오 살이에요.\n✅ 스물다섯 살이에요. (Age needs native Korean numbers!)\n❌ 삼 시예요.\n✅ 세 시예요. (Time also needs native Korean! 셋→세 before 시.)",
            es: "❌ 이십오 살이에요.\n✅ 스물다섯 살이에요. (La edad necesita números nativos coreanos.)\n❌ 삼 시예요.\n✅ 세 시예요. (La hora también — 셋→세 antes de 시.)",
          },
          rudyTip: {
            ko: "Unit 2 최종 정리! 나이+시간+개수=순우리말(스물다섯, 세 시, 두 장), 돈+전화=한자어(만 오천 원, 공일공). 이 규칙이면 한국 숫자 마스터야!",
            en: "Unit 2 final cheat sheet! Age + time + counting = native Korean (스물다섯, 세 시, 두 장), money + phone = Sino-Korean (만 오천 원, 공일공). Master this rule and Korean numbers are yours!",
            es: "Resumen final Unidad 2. Edad + hora + conteo = nativo coreano (스물다섯, 세 시, 두 장), dinero + teléfono = sino-coreano (만 오천 원, 공일공). Domina esta regla y los números coreanos son tuyos.",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "표 ___ 장 주세요.",
            answer: "두",
            options: ["두", "이", "둘"],
            fullSentence: "표 두 장 주세요.",
            fullSentenceMeaning: { ko: "표 두 장 주세요.", en: "Two tickets, please.", es: "Dos entradas, por favor." },
          },
          {
            type: "select",
            promptWithBlank: "이거 ___예요?",
            answer: "얼마",
            options: ["얼마", "뭐", "몇"],
            fullSentence: "이거 얼마예요?",
            fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta?" },
          },
          {
            type: "select",
            promptWithBlank: "___ 시 반이에요.",
            answer: "세",
            options: ["세", "삼", "셋"],
            fullSentence: "세 시 반이에요.",
            fullSentenceMeaning: { ko: "세 시 반이에요.", en: "It's half past three.", es: "Son las tres y media." },
          },
          {
            type: "input",
            promptWithBlank: "일곱 시에 ___나요.",
            answer: "일어",
            fullSentence: "일곱 시에 일어나요.",
            fullSentenceMeaning: { ko: "일곱 시에 일어나요.", en: "I wake up at seven.", es: "Me despierto a las siete." },
          },
          {
            type: "listening",
            audioText: "이거 얼마예요? 만 오천 원이에요.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["이거 얼마예요? 만 오천 원이에요.", "몇 시예요? 세 시 반이에요.", "스물다섯 살이에요.", "표 두 장 주세요."],
            correct: 0,
            audioOnly: true,
          },
          {
            type: "select",
            promptWithBlank: "___ 감사합니다!",
            answer: "정말",
            options: ["정말", "많이", "아주"],
            fullSentence: "정말 감사합니다!",
            fullSentenceMeaning: { ko: "정말 감사합니다!", en: "Thank you very much!", es: "¡Muchas gracias!" },
          },
        ],
      },
    },
  },
};

// =============================================================================
// STEP 3: MISSION TALK
// =============================================================================

export const MISSION_CONTENT_D11_12: Record<string, Partial<Record<LearningLangKey, MissionTalkLangData>>> = {

  // ─────────────── Day 11: Rudy exchanging contact info with an informant ───
  day_11: {
    english: {
      situation: {
        ko: "루디가 박물관에서 정보원과 연락처를 교환하고 있습니다. 전화번호와 나이를 주고받아 신원을 확인하세요!",
        en: "Rudy is exchanging contact info with an informant at the museum. Share phone numbers and verify age!",
        es: "Rudy intercambia información de contacto con un informante. ¡Comparte números y verifica la edad!",
      },
      gptPrompt: `You are Rudy, a friendly fox detective at the London Museum. You've found an informant who has clues about the missing artifact, but first you need to exchange contact information to stay in touch.

DETECTIVE STORY CONTEXT: The informant saw something suspicious near the Egyptian exhibit last night. You need their phone number and age to cross-reference with the visitor log.

PRE-TASK — The learner should practice these 3 target expressions:
1. "What's your phone number?" / "My number is ___." (exchanging contact info)
2. "How old are you?" / "I'm ___ years old." (verifying age)
3. "Can you say that again slowly?" (recall from previous days)

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, gently suggest: "You could say something like 'My number is 010-1234-5678' or 'I'm twenty-five years old'..."
- If silent for 10 seconds, use TTS to model the answer naturally.
- If silent for 15 seconds, offer direct help: "Try saying: My number is 010-1234-5678."

CONVERSATION FLOW:
1. Greet the informant and explain you need their details for the case file
2. Ask "What's your phone number?" — wait for their number
3. Repeat their number back to confirm, then share yours
4. Ask "How old are you?" — to match with visitor records
5. React: "She's thirty? That matches the records!"
6. If they speak too fast, use "Can you say that again slowly?"
7. Thank them: "Great! I'll call you if I find more clues."

MISSION SUCCESS CRITERIA:
- 3 target expressions used = ⭐⭐⭐ "Excellent detective work! Contact info secured!"
- 2 target expressions used = ⭐⭐ "Good work! Almost got all the details!"
- 1 target expression used = ⭐ "Nice start! We'll crack the code next time!"

LANGUAGE FOCUS REVIEW: At the end, briefly highlight one expression they used well.

IMPORTANT: Never say "wrong" or "incorrect". Instead say "Almost!" or "Let me help you with that" or "Good try! You could also say...". Keep all sentences at A1 level. Use {targetLang} throughout.`,
      speechLang: "en-GB",
      suggestedAnswers: [
        "What's your phone number?",
        "My number is 010-1234-5678.",
        "How old are you?",
        "I'm twenty-five years old.",
        "Can you say that again slowly?",
      ],
    },
    spanish: {
      situation: {
        ko: "루디가 박물관에서 정보원과 연락처를 교환하고 있습니다. 전화번호와 나이를 주고받아 신원을 확인하세요!",
        en: "Rudy is exchanging contact info with an informant. Share numbers and verify age!",
        es: "Rudy intercambia información de contacto con un informante en el museo. ¡Comparte números y verifica la edad!",
      },
      gptPrompt: `You are Rudy, a friendly fox detective at the London Museum. You've found an informant who has clues about the missing artifact, but first you need to exchange contact information.

DETECTIVE STORY CONTEXT: The informant saw something suspicious. You need their phone number and age to cross-reference with the visitor log.

PRE-TASK — The learner should practice these 3 target expressions:
1. "¿Cuál es tu número de teléfono?" / "Mi número es ___." (exchanging contact)
2. "¿Cuántos años tienes?" / "Tengo ___ años." (verifying age)
3. "¿Puede hablar más despacio?" (recall from previous days)

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, gently suggest: "Puedes decir algo como 'Mi número es 010-1234-5678' o 'Tengo veinticinco años'..."
- If silent for 10 seconds, use TTS to model the answer naturally.
- If silent for 15 seconds, offer direct help: "Intenta decir: Mi número es 010-1234-5678."

CONVERSATION FLOW:
1. Greet the informant and explain you need their details
2. Ask "¿Cuál es tu número de teléfono?" — wait for their number
3. Repeat back to confirm, then share yours
4. Ask "¿Cuántos años tienes?" — to match visitor records
5. React: "¿Ella tiene treinta? ¡Coincide con los registros!"
6. If they speak too fast, use "¿Puede hablar más despacio?"
7. Thank them: "¡Genial! Te llamo si encuentro más pistas."

MISSION SUCCESS CRITERIA:
- 3 target expressions used = ⭐⭐⭐ "¡Excelente trabajo de detective! ¡Contacto asegurado!"
- 2 target expressions used = ⭐⭐ "¡Buen trabajo! ¡Casi tienes todos los detalles!"
- 1 target expression used = ⭐ "¡Buen comienzo! ¡Descifraremos el código la próxima vez!"

LANGUAGE FOCUS REVIEW: At the end, briefly highlight one expression they used well.

IMPORTANT: Never say "incorrecto" or "mal". Instead say "¡Casi!" or "Te ayudo con eso" or "¡Buen intento! También puedes decir...". Keep all sentences at A1 level. Use {targetLang} throughout.`,
      speechLang: "es-ES",
      suggestedAnswers: [
        "¿Cuál es tu número de teléfono?",
        "Mi número es 010-1234-5678.",
        "¿Cuántos años tienes?",
        "Tengo veinticinco años.",
        "¿Puede hablar más despacio?",
      ],
    },
    korean: {
      situation: {
        ko: "루디가 박물관에서 정보원과 연락처를 교환하고 있습니다. 전화번호와 나이를 주고받아 신원을 확인하세요!",
        en: "Rudy is exchanging contact info with an informant. Share numbers and verify age!",
        es: "Rudy intercambia información con un informante. ¡Comparte números y verifica la edad!",
      },
      gptPrompt: `You are Rudy, a friendly fox detective at the London Museum. You've found an informant who has clues about the missing artifact, but first you need to exchange contact information.

DETECTIVE STORY CONTEXT: The informant saw something suspicious. You need their phone number and age to cross-reference with the visitor log.

PRE-TASK — The learner should practice these 3 target expressions:
1. "전화번호가 뭐예요?" / "제 번호는 ___이에요." (exchanging contact info)
2. "몇 살이에요?" / "___살이에요." (verifying age — native Korean numbers!)
3. "천천히 말해 주세요." (recall from previous days)

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, gently suggest: "'제 번호는 공일공-일이삼사-오육칠팔이에요' 또는 '스물다섯 살이에요'처럼 말해보세요..."
- If silent for 10 seconds, use TTS to model the answer naturally.
- If silent for 15 seconds, offer direct help: "이렇게 말해보세요: 제 번호는 공일공-일이삼사-오육칠팔이에요."

CONVERSATION FLOW:
1. Greet the informant and explain you need their details
2. Ask "전화번호가 뭐예요?" — wait for their number (Sino-Korean digits)
3. Repeat back to confirm, then share yours
4. Ask "몇 살이에요?" — to match visitor records (native Korean numbers)
5. React: "서른 살이에요? 기록과 맞아요!"
6. If they speak too fast, use "천천히 말해 주세요."
7. Thank them: "좋아요! 단서를 더 찾으면 연락할게요."

MISSION SUCCESS CRITERIA:
- 3 target expressions used = ⭐⭐⭐ "대단해요! 연락처 확보 완료!"
- 2 target expressions used = ⭐⭐ "잘했어요! 거의 다 알아냈어요!"
- 1 target expression used = ⭐ "좋은 시작이에요! 다음에 암호를 풀어봐요!"

LANGUAGE FOCUS REVIEW: At the end, briefly highlight one expression they used well. Especially praise correct use of native Korean numbers for age vs Sino-Korean for phone.

IMPORTANT: Never say "틀렸어요" or "잘못했어요". Instead say "거의 다 왔어요!" or "제가 도와줄게요" or "좋은 시도예요! 이렇게도 말할 수 있어요...". Keep all sentences at A1 level. Use {targetLang} throughout.`,
      speechLang: "ko-KR",
      suggestedAnswers: [
        "전화번호가 뭐예요?",
        "제 번호는 공일공-일이삼사-오육칠팔이에요.",
        "몇 살이에요?",
        "스물다섯 살이에요.",
        "천천히 말해 주세요.",
      ],
    },
  },

  // ─────────────── Day 12: End-of-unit party at museum ──────────────────────
  day_12: {
    english: {
      situation: {
        ko: "박물관에서 Unit 2 마무리 파티가 열렸습니다! 표를 사고, 가격을 확인하고, 시간을 물어보고, 나이와 번호를 교환하세요. 이번 유닛에서 배운 모든 표현을 총동원하세요!",
        en: "End-of-unit party at the museum! Buy tickets, check prices, ask the time, exchange ages and numbers. Use ALL Unit 2 expressions!",
        es: "¡Fiesta de fin de unidad en el museo! Compra entradas, verifica precios, pregunta la hora, intercambia edades y números. ¡Usa TODAS las expresiones de la Unidad 2!",
      },
      gptPrompt: `You are Rudy hosting an end-of-unit celebration party at the London Museum. This is a comprehensive test covering ALL Unit 2 topics in a natural A1 {targetLang} conversation.

DETECTIVE STORY CONTEXT: The case is wrapping up! You're hosting a thank-you party for everyone who helped with the investigation. The party is at the museum and involves buying tickets, checking times, exchanging contact info, and celebrating.

PRE-TASK — The learner should practice these 3 target areas:
1. Numbers & prices: "Two tickets, please." / "How much is this?" / "It's fifteen dollars."
2. Time & routine: "What time is it?" / "It's half past three." / "I wake up at seven."
3. Age & contact: "I'm twenty-five." / "What's your number?" / "Thank you very much!"

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, show suggested answers.
- If silent for 10 seconds, use TTS to model the answer.
- If silent for 15 seconds, offer explicit help.

CONVERSATION FLOW:
1. Welcome everyone to the party — ask them to buy tickets: "Two tickets, please!"
2. Ticket booth scene — "How much is this?" / "It's fifteen dollars."
3. Check the party schedule — "What time is it?" / "It's half past three."
4. Talk about daily routine — "I wake up at seven."
5. Exchange contact info — "I'm twenty-five. What's your number?"
6. Wrap up — "Thank you very much!" / Celebrate the case being solved.

MISSION SUCCESS CRITERIA:
- 3 target areas covered = ⭐⭐⭐ "Outstanding! Unit 2 complete! You're a number master!"
- 2 target areas covered = ⭐⭐ "Great work! Almost got everything!"
- 1 target area covered = ⭐ "Good start! Let's review more next time!"

LANGUAGE FOCUS REVIEW: After conversation, review all Unit 2 patterns and celebrate progress.

IMPORTANT: Never say "wrong" or "incorrect". Be extra encouraging since this is the unit finale. Keep A1 level. Use {targetLang} throughout.`,
      speechLang: "en-GB",
      suggestedAnswers: [
        "Two tickets, please.",
        "How much is this? It's fifteen dollars.",
        "What time is it? It's half past three.",
        "I wake up at seven.",
        "I'm twenty-five. What's your number?",
        "My number is 010-1234-5678.",
        "Thank you very much!",
      ],
    },
    spanish: {
      situation: {
        ko: "박물관에서 Unit 2 마무리 파티입니다! 모든 숫자/시간 표현을 사용해보세요!",
        en: "End-of-unit party! Use ALL Unit 2 expressions!",
        es: "¡Fiesta de fin de unidad en el museo! ¡Usa TODAS las expresiones de la Unidad 2!",
      },
      gptPrompt: `You are Rudy hosting an end-of-unit celebration party at the London Museum. Comprehensive test covering ALL Unit 2 topics in a natural A1 {targetLang} conversation.

DETECTIVE STORY CONTEXT: Case wrapping up! Thank-you party at the museum.

PRE-TASK — The learner should practice these 3 target areas:
1. Numbers & prices: "Dos entradas, por favor." / "¿Cuánto cuesta?" / "Son quince euros."
2. Time & routine: "¿Qué hora es?" / "Son las tres y media." / "Me despierto a las siete."
3. Age & contact: "Tengo veinticinco." / "¿Cuál es tu número?" / "¡Muchas gracias!"

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, show suggested answers.
- If silent for 10 seconds, use TTS to model the answer.
- If silent for 15 seconds, offer explicit help.

CONVERSATION FLOW:
1. Welcome — buy tickets: "Dos entradas, por favor."
2. Price check — "¿Cuánto cuesta?" / "Son quince euros."
3. Party schedule — "¿Qué hora es?" / "Son las tres y media."
4. Daily routine — "Me despierto a las siete."
5. Contact exchange — "Tengo veinticinco. ¿Cuál es tu número?"
6. Celebrate — "¡Muchas gracias!"

MISSION SUCCESS CRITERIA:
- 3 target areas covered = ⭐⭐⭐ "¡Excelente! ¡Unidad 2 completada! ¡Eres un maestro de los números!"
- 2 target areas covered = ⭐⭐ "¡Buen trabajo! ¡Casi tienes todo!"
- 1 target area covered = ⭐ "¡Buen comienzo! ¡Repasemos más la próxima vez!"

LANGUAGE FOCUS REVIEW: Review all Unit 2 patterns. Be extra encouraging. A1 level. Use {targetLang} throughout.

IMPORTANT: Never say "incorrecto" or "mal". Be encouraging.`,
      speechLang: "es-ES",
      suggestedAnswers: [
        "Dos entradas, por favor.",
        "¿Cuánto cuesta? Son quince euros.",
        "¿Qué hora es? Son las tres y media.",
        "Me despierto a las siete.",
        "Tengo veinticinco. ¿Cuál es tu número?",
        "Mi número es 010-1234-5678.",
        "¡Muchas gracias!",
      ],
    },
    korean: {
      situation: {
        ko: "박물관에서 Unit 2 마무리 파티입니다! 표를 사고, 가격을 확인하고, 시간을 물어보고, 나이와 번호를 교환하세요. 이번 유닛에서 배운 모든 표현을 총동원하세요!",
        en: "End-of-unit party! Use ALL Unit 2 expressions!",
        es: "¡Fiesta de fin de unidad! ¡Usa TODAS las expresiones!",
      },
      gptPrompt: `You are Rudy hosting an end-of-unit celebration party at the London Museum. Comprehensive test covering ALL Unit 2 topics in a natural A1 {targetLang} conversation.

DETECTIVE STORY CONTEXT: Case wrapping up! Thank-you party at the museum.

PRE-TASK — The learner should practice these 3 target areas:
1. Numbers & prices: "표 두 장 주세요." / "이거 얼마예요?" / "만 오천 원이에요."
2. Time & routine: "몇 시예요?" / "세 시 반이에요." / "일곱 시에 일어나요."
3. Age & contact: "스물다섯 살이에요." / "번호가 뭐예요?" / "정말 감사합니다!"

IMPORTANT NUMBER SYSTEM NOTES:
- Age uses NATIVE Korean: 스물다섯 살 (not 이십오 살)
- Time uses NATIVE Korean: 세 시, 일곱 시 (not 삼 시, 칠 시)
- Counting uses NATIVE Korean: 두 장 (not 이 장)
- Money uses SINO-Korean: 만 오천 원
- Phone uses SINO-Korean: 공일공-일이삼사

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, show suggested answers.
- If silent for 10 seconds, use TTS to model the answer.
- If silent for 15 seconds, offer explicit help.

CONVERSATION FLOW:
1. Welcome — buy tickets: "표 두 장 주세요."
2. Price check — "이거 얼마예요?" / "만 오천 원이에요."
3. Party schedule — "몇 시예요?" / "세 시 반이에요."
4. Daily routine — "일곱 시에 일어나요."
5. Contact exchange — "스물다섯 살이에요. 번호가 뭐예요?"
6. Celebrate — "정말 감사합니다!"

MISSION SUCCESS CRITERIA:
- 3 target areas covered = ⭐⭐⭐ "대단해요! Unit 2 완료! 숫자 마스터예요!"
- 2 target areas covered = ⭐⭐ "잘했어요! 거의 다 했어요!"
- 1 target area covered = ⭐ "좋은 시작이에요! 다음에 더 연습해봐요!"

LANGUAGE FOCUS REVIEW: Review all Unit 2 patterns. Especially praise correct number system usage. Be extra encouraging. A1 level. Use {targetLang} throughout.

IMPORTANT: Never say "틀렸어요" or "잘못했어요". Be encouraging.`,
      speechLang: "ko-KR",
      suggestedAnswers: [
        "표 두 장 주세요.",
        "이거 얼마예요? 만 오천 원이에요.",
        "몇 시예요? 세 시 반이에요.",
        "일곱 시에 일어나요.",
        "스물다섯 살이에요. 번호가 뭐예요?",
        "제 번호는 공일공-일이삼사-오육칠팔이에요.",
        "정말 감사합니다!",
      ],
    },
  },
};

// =============================================================================
// STEP 4: REVIEW (SM-2 spaced repetition with yesterday review)
// =============================================================================

export const REVIEW_CONTENT_D11_12: Record<string, Partial<Record<LearningLangKey, ReviewQuestion[]>>> = {

  // ─────────────── Day 11 Review ────────────────────────────────────────────
  // First 2 from Day 10 (isYesterdayReview: true), then 3 from today
  // Day 11: 3 speak + 2 fill_blank
  day_11: {
    english: [
      {
        type: "speak",
        sentence: "It's sunny and warm. I like hot weather.",
        speechLang: "en-GB",
        meaning: { ko: "맑고 따뜻해요. 더운 날씨를 좋아해요.", en: "It's sunny and warm. I like hot weather.", es: "Está soleado y cálido. Me gusta el clima caliente." },
        isYesterdayReview: true,
      },
      {
        type: "fill_blank",
        promptWithBlank: "How's the ___ today?",
        answer: "weather",
        options: ["weather", "day", "time"],
        fullSentence: "How's the weather today?",
        fullSentenceMeaning: { ko: "오늘 날씨 어때요?", en: "How's the weather today?", es: "¿Cómo está el clima hoy?" },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "What's your phone number? My number is 010-1234-5678.",
        speechLang: "en-GB",
        meaning: { ko: "전화번호가 뭐예요? 제 번호는 010-1234-5678이에요.", en: "What's your phone number? My number is 010-1234-5678.", es: "¿Cuál es tu número? Mi número es 010-1234-5678." },
      },
      {
        type: "fill_blank",
        promptWithBlank: "How ___ are you?",
        answer: "old",
        options: ["old", "much", "many"],
        fullSentence: "How old are you?",
        fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" },
      },
      {
        type: "speak",
        sentence: "I'm twenty-five years old. She's thirty.",
        speechLang: "en-GB",
        meaning: { ko: "스물다섯 살이에요. 그녀는 서른 살이에요.", en: "I'm twenty-five years old. She's thirty.", es: "Tengo veinticinco años. Ella tiene treinta." },
      },
    ],
    spanish: [
      {
        type: "speak",
        sentence: "Está soleado y cálido. Me gusta el clima caliente.",
        speechLang: "es-ES",
        meaning: { ko: "맑고 따뜻해요. 더운 날씨를 좋아해요.", en: "It's sunny and warm. I like hot weather.", es: "Está soleado y cálido. Me gusta el clima caliente." },
        isYesterdayReview: true,
      },
      {
        type: "fill_blank",
        promptWithBlank: "¿Cómo está el ___ hoy?",
        answer: "clima",
        options: ["clima", "día", "tiempo"],
        fullSentence: "¿Cómo está el clima hoy?",
        fullSentenceMeaning: { ko: "오늘 날씨 어때요?", en: "How's the weather today?", es: "¿Cómo está el clima hoy?" },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "¿Cuál es tu número de teléfono? Mi número es 010-1234-5678.",
        speechLang: "es-ES",
        meaning: { ko: "전화번호가 뭐예요? 제 번호는 010-1234-5678이에요.", en: "What's your phone number? My number is 010-1234-5678.", es: "¿Cuál es tu número? Mi número es 010-1234-5678." },
      },
      {
        type: "fill_blank",
        promptWithBlank: "¿Cuántos ___ tienes?",
        answer: "años",
        options: ["años", "días", "números"],
        fullSentence: "¿Cuántos años tienes?",
        fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" },
      },
      {
        type: "speak",
        sentence: "Tengo veinticinco años. Ella tiene treinta.",
        speechLang: "es-ES",
        meaning: { ko: "스물다섯 살이에요. 그녀는 서른 살이에요.", en: "I'm twenty-five. She's thirty.", es: "Tengo veinticinco años. Ella tiene treinta." },
      },
    ],
    korean: [
      {
        type: "speak",
        sentence: "맑고 따뜻해요. 더운 날씨를 좋아해요.",
        speechLang: "ko-KR",
        meaning: { ko: "맑고 따뜻해요. 더운 날씨를 좋아해요.", en: "It's sunny and warm. I like hot weather.", es: "Está soleado y cálido. Me gusta el clima caliente." },
        isYesterdayReview: true,
      },
      {
        type: "fill_blank",
        promptWithBlank: "오늘 ___ 어때요?",
        answer: "날씨",
        options: ["날씨", "요일", "시간"],
        fullSentence: "오늘 날씨 어때요?",
        fullSentenceMeaning: { ko: "오늘 날씨 어때요?", en: "How's the weather today?", es: "¿Cómo está el clima hoy?" },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "전화번호가 뭐예요? 제 번호는 공일공-일이삼사-오육칠팔이에요.",
        speechLang: "ko-KR",
        meaning: { ko: "전화번호가 뭐예요? 제 번호는 010-1234-5678이에요.", en: "What's your phone number? My number is 010-1234-5678.", es: "¿Cuál es tu número? Mi número es 010-1234-5678." },
      },
      {
        type: "fill_blank",
        promptWithBlank: "몇 ___이에요?",
        answer: "살",
        options: ["살", "개", "번"],
        fullSentence: "몇 살이에요?",
        fullSentenceMeaning: { ko: "몇 살이에요?", en: "How old are you?", es: "¿Cuántos años tienes?" },
      },
      {
        type: "speak",
        sentence: "스물다섯 살이에요. 서른 살이에요.",
        speechLang: "ko-KR",
        meaning: { ko: "스물다섯 살이에요. 서른 살이에요.", en: "I'm twenty-five. She's thirty.", es: "Tengo veinticinco. Ella tiene treinta." },
      },
    ],
  },

  // ─────────────── Day 12 Review ────────────────────────────────────────────
  // First 2 from Day 11 (isYesterdayReview: true), remaining 3 cover full Unit 2
  // Day 12: all 5 as speak type (comprehensive review assessment)
  day_12: {
    english: [
      {
        type: "speak",
        sentence: "What's your phone number? My number is 010-1234-5678.",
        speechLang: "en-GB",
        meaning: { ko: "전화번호가 뭐예요? 제 번호는 010-1234-5678이에요.", en: "What's your phone number? My number is 010-1234-5678.", es: "¿Cuál es tu número? Mi número es 010-1234-5678." },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "How old are you? I'm twenty-five years old.",
        speechLang: "en-GB",
        meaning: { ko: "몇 살이에요? 스물다섯 살이에요.", en: "How old are you? I'm twenty-five years old.", es: "¿Cuántos años tienes? Tengo veinticinco años." },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "Two tickets, please. How much is this? It's fifteen dollars.",
        speechLang: "en-GB",
        meaning: { ko: "표 두 장 주세요. 이거 얼마예요? 15달러예요.", en: "Two tickets, please. How much is this? It's fifteen dollars.", es: "Dos entradas, por favor. ¿Cuánto cuesta? Son quince dólares." },
      },
      {
        type: "speak",
        sentence: "What time is it? It's half past three. I wake up at seven.",
        speechLang: "en-GB",
        meaning: { ko: "몇 시예요? 세 시 반이에요. 일곱 시에 일어나요.", en: "What time is it? It's half past three. I wake up at seven.", es: "¿Qué hora es? Son las tres y media. Me despierto a las siete." },
      },
      {
        type: "speak",
        sentence: "I'm twenty-five. What's your number? Thank you very much!",
        speechLang: "en-GB",
        meaning: { ko: "스물다섯 살이에요. 번호가 뭐예요? 정말 감사합니다!", en: "I'm twenty-five. What's your number? Thank you very much!", es: "Tengo veinticinco. ¿Cuál es tu número? ¡Muchas gracias!" },
      },
    ],
    spanish: [
      {
        type: "speak",
        sentence: "¿Cuál es tu número de teléfono? Mi número es 010-1234-5678.",
        speechLang: "es-ES",
        meaning: { ko: "전화번호가 뭐예요? 제 번호는 010-1234-5678이에요.", en: "What's your number? My number is 010-1234-5678.", es: "¿Cuál es tu número? Mi número es 010-1234-5678." },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "¿Cuántos años tienes? Tengo veinticinco años.",
        speechLang: "es-ES",
        meaning: { ko: "몇 살이에요? 스물다섯 살이에요.", en: "How old are you? I'm twenty-five.", es: "¿Cuántos años tienes? Tengo veinticinco años." },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "Dos entradas, por favor. ¿Cuánto cuesta? Son quince euros.",
        speechLang: "es-ES",
        meaning: { ko: "표 두 장 주세요. 얼마예요? 15유로예요.", en: "Two tickets, please. How much? Fifteen euros.", es: "Dos entradas, por favor. ¿Cuánto cuesta? Son quince euros." },
      },
      {
        type: "speak",
        sentence: "¿Qué hora es? Son las tres y media. Me despierto a las siete.",
        speechLang: "es-ES",
        meaning: { ko: "몇 시예요? 세 시 반이에요. 일곱 시에 일어나요.", en: "What time? Half past three. I wake up at seven.", es: "¿Qué hora es? Son las tres y media. Me despierto a las siete." },
      },
      {
        type: "speak",
        sentence: "Tengo veinticinco. ¿Cuál es tu número? ¡Muchas gracias!",
        speechLang: "es-ES",
        meaning: { ko: "스물다섯 살이에요. 번호가 뭐예요? 정말 감사합니다!", en: "I'm twenty-five. What's your number? Thank you very much!", es: "Tengo veinticinco. ¿Cuál es tu número? ¡Muchas gracias!" },
      },
    ],
    korean: [
      {
        type: "speak",
        sentence: "전화번호가 뭐예요? 제 번호는 공일공-일이삼사-오육칠팔이에요.",
        speechLang: "ko-KR",
        meaning: { ko: "전화번호가 뭐예요? 제 번호는 010-1234-5678이에요.", en: "What's your number? My number is 010-1234-5678.", es: "¿Cuál es tu número? Mi número es 010-1234-5678." },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "몇 살이에요? 스물다섯 살이에요.",
        speechLang: "ko-KR",
        meaning: { ko: "몇 살이에요? 스물다섯 살이에요.", en: "How old are you? I'm twenty-five.", es: "¿Cuántos años tienes? Tengo veinticinco." },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "표 두 장 주세요. 이거 얼마예요? 만 오천 원이에요.",
        speechLang: "ko-KR",
        meaning: { ko: "표 두 장 주세요. 이거 얼마예요? 15,000원이에요.", en: "Two tickets, please. How much? 15,000 won.", es: "Dos entradas. ¿Cuánto? 15,000 won." },
      },
      {
        type: "speak",
        sentence: "몇 시예요? 세 시 반이에요. 일곱 시에 일어나요.",
        speechLang: "ko-KR",
        meaning: { ko: "몇 시예요? 세 시 반이에요. 일곱 시에 일어나요.", en: "What time? Half past three. I wake up at seven.", es: "¿Qué hora? Tres y media. Me despierto a las siete." },
      },
      {
        type: "speak",
        sentence: "스물다섯 살이에요. 번호가 뭐예요? 정말 감사합니다!",
        speechLang: "ko-KR",
        meaning: { ko: "스물다섯 살이에요. 번호가 뭐예요? 정말 감사합니다!", en: "I'm twenty-five. What's your number? Thank you so much!", es: "Tengo veinticinco. ¿Tu número? ¡Muchas gracias!" },
      },
    ],
  },
};
