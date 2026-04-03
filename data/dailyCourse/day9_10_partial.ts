/**
 * Day 9-10 Partial (A1 Unit 2: Numbers & Time)
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

export const LESSON_CONTENT_D9_10: Record<string, Partial<Record<LearningLangKey, DayLessonData>>> = {

  // ─────────────── Day 9: Telling Time ────────────────────────────────────────
  day_9: {
    english: {
      step1Sentences: [
        {
          text: "What time is it?",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" },
        },
        {
          text: "It's three o'clock.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "세 시예요.", en: "It's three o'clock.", es: "Son las tres." },
        },
        {
          text: "It's half past two.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "두 시 반이에요.", en: "It's half past two.", es: "Son las dos y media." },
        },
        {
          text: "The museum opens at nine.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "박물관은 아홉 시에 열어요.", en: "The museum opens at nine.", es: "El museo abre a las nueve." },
        },
        {
          text: "The tour starts at ten thirty.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "투어는 열 시 반에 시작해요.", en: "The tour starts at ten thirty.", es: "El tour empieza a las diez y media." },
          recallRound: true,
        },
        {
          text: "Sorry, I don't understand.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." },
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
            ko: "시간을 물어볼 때 'What time is it?'이라고 해요. 대답할 때는 'It's ___ o'clock'(정각)이나 'It's half past ___'(30분)을 써요. 'o'clock'은 정각을 뜻하고, 'half past'는 '반이 지났다'는 뜻이에요. 한국어로는 '세 시'라고 하지만 영어는 'three o'clock'처럼 뒤에 'o'clock'을 붙여요. 시간 앞에는 'at'을 쓰는데, 요일 앞의 'on'과 헷갈리지 마세요!",
            en: "To ask the time, say 'What time is it?' To answer, use 'It's ___ o'clock' (exact hour) or 'It's half past ___' (30 minutes). 'O'clock' means on the clock, and 'half past' means 30 minutes after. Use 'at' before times: 'at nine', 'at ten thirty'. Don't confuse with 'on' (used for days)!",
            es: "Para preguntar la hora, di 'What time is it?' Para responder, usa 'It's ___ o'clock' (hora exacta) o 'It's half past ___' (y media). 'O'clock' significa 'en punto' y 'half past' significa '30 minutos después'. Usa 'at' antes de las horas: 'at nine', 'at ten thirty'. No lo confundas con 'on' (para días).",
          },
          examples: {
            ko: "What time is it? It's three o'clock. (몇 시예요? 세 시예요.)\nIt's half past two. (두 시 반이에요.)\nThe museum opens at nine. (박물관은 아홉 시에 열어요.)",
            en: "What time is it? It's three o'clock. (Asking and telling exact time.)\nIt's half past two. (Telling half-hour time.)\nThe tour starts at ten thirty. (Using time with activities.)",
            es: "What time is it? It's three o'clock. (Preguntando y diciendo la hora exacta.)\nIt's half past two. (Diciendo la hora y media.)\nThe tour starts at ten thirty. (Usando la hora con actividades.)",
          },
          mistakes: {
            ko: "❌ What time is?\n✅ What time is it? ('it'을 꼭 붙여야 해요!)\n❌ It's three clock.\n✅ It's three o'clock. ('o'clock' 전체가 하나의 단어예요!)",
            en: "❌ What time is?\n✅ What time is it? (Don't forget 'it'!)\n❌ It's three clock.\n✅ It's three o'clock. (It's 'o'clock' — one word with an apostrophe!)",
            es: "❌ What time is?\n✅ What time is it? (No olvides 'it'.)\n❌ It's three clock.\n✅ It's three o'clock. (Es 'o'clock' — una palabra con apóstrofo.)",
          },
          rudyTip: {
            ko: "'What time is it?'만 알면 전 세계 어디서든 시간을 물어볼 수 있어! 정각은 'o'clock', 반은 'half past' — 이 두 개면 충분해~",
            en: "Just remember: exact hours get 'o'clock', and half hours get 'half past'. Two patterns and you can tell any basic time!",
            es: "Solo recuerda: horas exactas llevan 'o'clock', y medias horas llevan 'half past'. Dos patrones y puedes decir cualquier hora básica.",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "What ___ is it?",
            answer: "time",
            options: ["time", "hour", "clock"],
            fullSentence: "What time is it?",
            fullSentenceMeaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" },
          },
          {
            type: "select",
            promptWithBlank: "It's three ___.",
            answer: "o'clock",
            options: ["o'clock", "clock", "hours"],
            fullSentence: "It's three o'clock.",
            fullSentenceMeaning: { ko: "세 시예요.", en: "It's three o'clock.", es: "Son las tres." },
          },
          {
            type: "select",
            promptWithBlank: "It's ___ past two.",
            answer: "half",
            options: ["half", "thirty", "mid"],
            fullSentence: "It's half past two.",
            fullSentenceMeaning: { ko: "두 시 반이에요.", en: "It's half past two.", es: "Son las dos y media." },
          },
          {
            type: "input",
            promptWithBlank: "The museum opens ___ nine.",
            answer: "at",
            fullSentence: "The museum opens at nine.",
            fullSentenceMeaning: { ko: "박물관은 아홉 시에 열어요.", en: "The museum opens at nine.", es: "El museo abre a las nueve." },
          },
          {
            type: "listening",
            audioText: "The tour starts at ten thirty.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["The tour starts at ten thirty.", "It's three o'clock.", "The museum opens at nine.", "It's half past two."],
            correct: 0,
            audioOnly: true,
          },
        ],
      },
    },

    spanish: {
      step1Sentences: [
        {
          text: "¿Qué hora es?",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" },
        },
        {
          text: "Son las tres.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "세 시예요.", en: "It's three o'clock.", es: "Son las tres." },
        },
        {
          text: "Son las dos y media.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "두 시 반이에요.", en: "It's half past two.", es: "Son las dos y media." },
        },
        {
          text: "El museo abre a las nueve.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "박물관은 아홉 시에 열어요.", en: "The museum opens at nine.", es: "El museo abre a las nueve." },
        },
        {
          text: "El tour empieza a las diez y media.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "투어는 열 시 반에 시작해요.", en: "The tour starts at ten thirty.", es: "El tour empieza a las diez y media." },
          recallRound: true,
        },
        {
          text: "Lo siento, no entiendo.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." },
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
            ko: "스페인어로 시간을 물어볼 때 '¿Qué hora es?'라고 해요. 1시는 'Es la una' (단수!), 2시부터는 'Son las dos/tres...' (복수!)를 써요. 'y media'는 '반'이라는 뜻이에요. 시간 앞에는 'a las'를 쓰는데, 영어의 'at'과 같아요. 한국어는 '~시에'라고 하는 것처럼요!",
            en: "To ask time in Spanish, say '¿Qué hora es?' For 1 o'clock, use 'Es la una' (singular!). For 2+ use 'Son las dos/tres...' (plural!). 'Y media' means 'and a half' (half past). Before times use 'a las': 'a las nueve' = 'at nine'.",
            es: "Para preguntar la hora, di '¿Qué hora es?' Para la 1, usa 'Es la una' (singular). Para 2+, usa 'Son las dos/tres...' (plural). 'Y media' significa 'y treinta'. Antes de las horas usa 'a las': 'a las nueve'.",
          },
          examples: {
            ko: "¿Qué hora es? Son las tres. (몇 시예요? 세 시예요.)\nSon las dos y media. (두 시 반이에요.)\nEl museo abre a las nueve. (박물관은 아홉 시에 열어요.)",
            en: "¿Qué hora es? Son las tres. (What time? It's three.)\nSon las dos y media. (It's half past two.)\nEl tour empieza a las diez y media. (Tour starts at ten thirty.)",
            es: "¿Qué hora es? Son las tres. (Preguntando y diciendo la hora.)\nSon las dos y media. (Diciendo la hora y media.)\nEl museo abre a las nueve. (Usando la hora con actividades.)",
          },
          mistakes: {
            ko: "❌ Son la tres.\n✅ Son las tres. (2시부터는 'las'를 써요! 'la'는 1시만!)\n❌ El museo abre en las nueve.\n✅ El museo abre a las nueve. ('en'이 아니라 'a las'예요!)",
            en: "❌ Son la tres.\n✅ Son las tres. (Use 'las' for 2+! 'La' is only for 1 o'clock.)\n❌ El museo abre en las nueve.\n✅ El museo abre a las nueve. (Use 'a las', not 'en las'!)",
            es: "❌ Son la tres.\n✅ Son las tres. (Usa 'las' para 2+. 'La' solo para la 1.)\n❌ El museo abre en las nueve.\n✅ El museo abre a las nueve. (Usa 'a las', no 'en las'.)",
          },
          rudyTip: {
            ko: "1시만 특별 대우! 'Es la una'는 혼자서 단수, 나머지는 다 'Son las ___'로 복수야. 이것만 기억하면 끝~",
            en: "Only 1 o'clock is special — 'Es la una' is singular. Everything else is 'Son las ___'. Remember this one rule and you're set!",
            es: "Solo la 1 es especial — 'Es la una' es singular. Todo lo demás es 'Son las ___'. Recuerda esta regla y listo.",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "¿Qué ___ es?",
            answer: "hora",
            options: ["hora", "tiempo", "reloj"],
            fullSentence: "¿Qué hora es?",
            fullSentenceMeaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" },
          },
          {
            type: "select",
            promptWithBlank: "___ las tres.",
            answer: "Son",
            options: ["Son", "Es", "Están"],
            fullSentence: "Son las tres.",
            fullSentenceMeaning: { ko: "세 시예요.", en: "It's three o'clock.", es: "Son las tres." },
          },
          {
            type: "select",
            promptWithBlank: "Son las dos y ___.",
            answer: "media",
            options: ["media", "medio", "treinta"],
            fullSentence: "Son las dos y media.",
            fullSentenceMeaning: { ko: "두 시 반이에요.", en: "It's half past two.", es: "Son las dos y media." },
          },
          {
            type: "input",
            promptWithBlank: "El museo abre ___ las nueve.",
            answer: "a",
            fullSentence: "El museo abre a las nueve.",
            fullSentenceMeaning: { ko: "박물관은 아홉 시에 열어요.", en: "The museum opens at nine.", es: "El museo abre a las nueve." },
          },
          {
            type: "listening",
            audioText: "El tour empieza a las diez y media.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["El tour empieza a las diez y media.", "Son las tres.", "El museo abre a las nueve.", "Son las dos y media."],
            correct: 0,
            audioOnly: true,
          },
        ],
      },
    },

    korean: {
      step1Sentences: [
        {
          text: "지금 몇 시예요?",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" },
        },
        {
          text: "세 시예요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "세 시예요.", en: "It's three o'clock.", es: "Son las tres." },
        },
        {
          text: "두 시 반이에요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "두 시 반이에요.", en: "It's half past two.", es: "Son las dos y media." },
        },
        {
          text: "박물관은 아홉 시에 열어요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "박물관은 아홉 시에 열어요.", en: "The museum opens at nine.", es: "El museo abre a las nueve." },
        },
        {
          text: "투어는 열 시 반에 시작해요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "투어는 열 시 반에 시작해요.", en: "The tour starts at ten thirty.", es: "El tour empieza a las diez y media." },
          recallRound: true,
        },
        {
          text: "죄송해요, 이해를 못 했어요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." },
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
            ko: "시간을 물어볼 때 '몇 시예요?'라고 해요. 대답할 때는 '__ 시예요'(정각)나 '__ 시 반이에요'(30분)를 써요. 한국어 시간은 고유어 숫자를 써요: 한 시, 두 시, 세 시, 네 시... 영어의 one, two, three와 다르게 하나, 둘, 셋의 변형이에요! '반'은 30분을 뜻하고, '에'를 붙이면 '~에'(at)이라는 뜻이 돼요.",
            en: "To ask time in Korean, say '몇 시예요?' Answer with '__ 시예요' (o'clock) or '__ 시 반이에요' (half past). Korean uses native numbers for hours: 한 시(1), 두 시(2), 세 시(3)... These are different from sino-Korean numbers (일, 이, 삼). '반' means half (30 min), and '에' means 'at'.",
            es: "Para preguntar la hora en coreano, di '몇 시예요?' Responde con '__ 시예요' (en punto) o '__ 시 반이에요' (y media). El coreano usa números nativos para horas: 한 시(1), 두 시(2), 세 시(3)... Son diferentes de los sino-coreanos (일, 이, 삼). '반' significa media (30 min), y '에' significa 'a las'.",
          },
          examples: {
            ko: "지금 몇 시예요? 세 시예요. (시간 묻고 답하기)\n두 시 반이에요. (30분 표현하기)\n박물관은 아홉 시에 열어요. ('~시에' = ~시 at)",
            en: "지금 몇 시예요? 세 시예요. (What time? It's three.)\n두 시 반이에요. (It's half past two — 반 means half.)\n박물관은 아홉 시에 열어요. (The museum opens at nine — 에 means at.)",
            es: "지금 몇 시예요? 세 시예요. (¿Qué hora? Son las tres.)\n두 시 반이에요. (Son las dos y media — 반 significa media.)\n박물관은 아홉 시에 열어요. (El museo abre a las nueve — 에 significa a las.)",
          },
          mistakes: {
            ko: "❌ 삼 시예요.\n✅ 세 시예요. (시간은 고유어 숫자! 삼이 아니라 세!)\n❌ 두 시 반예요.\n✅ 두 시 반이에요. ('반' 뒤에 '이에요'를 써요!)",
            en: "❌ 삼 시예요.\n✅ 세 시예요. (Use native Korean numbers for hours! 세 not 삼!)\n❌ 두 시 반예요.\n✅ 두 시 반이에요. (Use '이에요' after 반, not just '예요'!)",
            es: "❌ 삼 시예요.\n✅ 세 시예요. (Usa números nativos coreanos para horas: 세, no 삼.)\n❌ 두 시 반예요.\n✅ 두 시 반이에요. (Usa '이에요' después de 반, no solo '예요'.)",
          },
          rudyTip: {
            ko: "시간에는 고유어 숫자가 필수! 한 시, 두 시, 세 시... '반'만 붙이면 30분 완성! 쉽지~?",
            en: "Native Korean numbers for hours are the key! 한, 두, 세, 네... Just add '반' for half past. Simple pattern!",
            es: "Los números nativos coreanos para horas son clave: 한, 두, 세, 네... Solo agrega '반' para y media. Patrón simple.",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "지금 ___ 시예요?",
            answer: "몇",
            options: ["몇", "무슨", "어느"],
            fullSentence: "지금 몇 시예요?",
            fullSentenceMeaning: { ko: "지금 몇 시예요?", en: "What time is it?", es: "¿Qué hora es?" },
          },
          {
            type: "select",
            promptWithBlank: "___ 시예요.",
            answer: "세",
            options: ["세", "삼", "셋"],
            fullSentence: "세 시예요.",
            fullSentenceMeaning: { ko: "세 시예요.", en: "It's three o'clock.", es: "Son las tres." },
          },
          {
            type: "select",
            promptWithBlank: "두 시 ___이에요.",
            answer: "반",
            options: ["반", "삼십", "절반"],
            fullSentence: "두 시 반이에요.",
            fullSentenceMeaning: { ko: "두 시 반이에요.", en: "It's half past two.", es: "Son las dos y media." },
          },
          {
            type: "input",
            promptWithBlank: "박물관은 아홉 시___ 열어요.",
            answer: "에",
            fullSentence: "박물관은 아홉 시에 열어요.",
            fullSentenceMeaning: { ko: "박물관은 아홉 시에 열어요.", en: "The museum opens at nine.", es: "El museo abre a las nueve." },
          },
          {
            type: "listening",
            audioText: "투어는 열 시 반에 시작해요.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["투어는 열 시 반에 시작해요.", "세 시예요.", "박물관은 아홉 시에 열어요.", "두 시 반이에요."],
            correct: 0,
            audioOnly: true,
          },
        ],
      },
    },
  },

  // ─────────────── Day 10: Daily Schedule & Routine ───────────────────────────
  day_10: {
    english: {
      step1Sentences: [
        {
          text: "I wake up at seven.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "일곱 시에 일어나요.", en: "I wake up at seven.", es: "Me despierto a las siete." },
        },
        {
          text: "I eat lunch at twelve thirty.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "열두 시 반에 점심 먹어요.", en: "I eat lunch at twelve thirty.", es: "Almuerzo a las doce y media." },
        },
        {
          text: "What time do you finish?",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "몇 시에 끝나요?", en: "What time do you finish?", es: "¿A qué hora terminas?" },
        },
        {
          text: "I go to bed at eleven.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "열한 시에 자요.", en: "I go to bed at eleven.", es: "Me acuesto a las once." },
        },
        {
          text: "The meeting is at two o'clock.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "회의는 두 시예요.", en: "The meeting is at two o'clock.", es: "La reunión es a las dos." },
          recallRound: true,
        },
        {
          text: "Can you say that again?",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "다시 한번 말해 주세요.", en: "Can you say that again?", es: "¿Puede repetir eso?" },
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
            ko: "일상 루틴을 말할 때 'I ___ at ___'이라고 해요. 'wake up'(일어나다), 'eat lunch'(점심 먹다), 'go to bed'(자다)처럼 행동 뒤에 'at + 시간'을 붙이면 돼요. 시간을 물어볼 때는 'What time do you ___?'라고 해요. 한국어는 '~시에 ~해요'인데, 영어는 '나는 ~한다 at ~시'로 순서가 반대예요!",
            en: "To talk about routines, use 'I ___ at ___' — action + 'at' + time. 'Wake up', 'eat lunch', 'go to bed' are common daily actions. To ask about someone's schedule: 'What time do you ___?' Notice the order: English puts the action first, then the time.",
            es: "Para hablar de rutinas, usa 'I ___ at ___' — acción + 'at' + hora. 'Wake up', 'eat lunch', 'go to bed' son acciones diarias comunes. Para preguntar: 'What time do you ___?' Nota el orden: en inglés la acción va primero, luego la hora.",
          },
          examples: {
            ko: "I wake up at seven. (일곱 시에 일어나요.)\nI eat lunch at twelve thirty. (열두 시 반에 점심 먹어요.)\nWhat time do you finish? (몇 시에 끝나요?)",
            en: "I wake up at seven. (Describing morning routine.)\nI go to bed at eleven. (Describing bedtime.)\nWhat time do you finish? (Asking about someone's schedule.)",
            es: "I wake up at seven. (Me despierto a las siete.)\nI go to bed at eleven. (Me acuesto a las once.)\nWhat time do you finish? (¿A qué hora terminas?)",
          },
          mistakes: {
            ko: "❌ I wake up in seven.\n✅ I wake up at seven. (시간 앞에는 'at'이에요, 'in'이 아니에요!)\n❌ What time you finish?\n✅ What time do you finish? ('do'를 꼭 넣어야 해요!)",
            en: "❌ I wake up in seven.\n✅ I wake up at seven. (Use 'at' before times, not 'in'!)\n❌ What time you finish?\n✅ What time do you finish? (Don't forget 'do' in the question!)",
            es: "❌ I wake up in seven.\n✅ I wake up at seven. (Usa 'at' antes de la hora, no 'in'.)\n❌ What time you finish?\n✅ What time do you finish? (No olvides 'do' en la pregunta.)",
          },
          rudyTip: {
            ko: "일상을 말할 때는 'I ___ at ___'만 기억해! 일어나다, 먹다, 자다 — 행동만 바꾸면 하루 전체를 설명할 수 있어~",
            en: "For daily routines, just swap the action: 'I wake up at...', 'I eat at...', 'I go to bed at...'. One pattern, whole day covered!",
            es: "Para rutinas diarias, solo cambia la acción: 'I wake up at...', 'I eat at...', 'I go to bed at...'. Un patrón, todo el día cubierto.",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "I wake ___ at seven.",
            answer: "up",
            options: ["up", "on", "in"],
            fullSentence: "I wake up at seven.",
            fullSentenceMeaning: { ko: "일곱 시에 일어나요.", en: "I wake up at seven.", es: "Me despierto a las siete." },
          },
          {
            type: "select",
            promptWithBlank: "I eat lunch ___ twelve thirty.",
            answer: "at",
            options: ["at", "in", "on"],
            fullSentence: "I eat lunch at twelve thirty.",
            fullSentenceMeaning: { ko: "열두 시 반에 점심 먹어요.", en: "I eat lunch at twelve thirty.", es: "Almuerzo a las doce y media." },
          },
          {
            type: "select",
            promptWithBlank: "What time ___ you finish?",
            answer: "do",
            options: ["do", "are", "is"],
            fullSentence: "What time do you finish?",
            fullSentenceMeaning: { ko: "몇 시에 끝나요?", en: "What time do you finish?", es: "¿A qué hora terminas?" },
          },
          {
            type: "input",
            promptWithBlank: "I go to ___ at eleven.",
            answer: "bed",
            fullSentence: "I go to bed at eleven.",
            fullSentenceMeaning: { ko: "열한 시에 자요.", en: "I go to bed at eleven.", es: "Me acuesto a las once." },
          },
          {
            type: "listening",
            audioText: "The meeting is at two o'clock.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["The meeting is at two o'clock.", "I wake up at seven.", "I go to bed at eleven.", "I eat lunch at twelve thirty."],
            correct: 0,
            audioOnly: true,
          },
        ],
      },
    },

    spanish: {
      step1Sentences: [
        {
          text: "Me despierto a las siete.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "일곱 시에 일어나요.", en: "I wake up at seven.", es: "Me despierto a las siete." },
        },
        {
          text: "Almuerzo a las doce y media.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "열두 시 반에 점심 먹어요.", en: "I eat lunch at twelve thirty.", es: "Almuerzo a las doce y media." },
        },
        {
          text: "¿A qué hora terminas?",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "몇 시에 끝나요?", en: "What time do you finish?", es: "¿A qué hora terminas?" },
        },
        {
          text: "Me acuesto a las once.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "열한 시에 자요.", en: "I go to bed at eleven.", es: "Me acuesto a las once." },
        },
        {
          text: "La reunión es a las dos.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "회의는 두 시예요.", en: "The meeting is at two o'clock.", es: "La reunión es a las dos." },
          recallRound: true,
        },
        {
          text: "¿Puede repetir eso?",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "다시 한번 말해 주세요.", en: "Can you say that again?", es: "¿Puede repetir eso?" },
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
            ko: "스페인어 일상을 말할 때는 '동사 + a las + 시간'이에요. 'Me despierto'(일어나다), 'Almuerzo'(점심 먹다), 'Me acuesto'(자다)처럼 주어를 안 써도 돼요! 'Me'가 붙는 동사는 '나 자신에게' 하는 행동이에요. 시간을 물어볼 때는 '¿A qué hora ___?'인데, '몇 시에 ~하나요?'라는 뜻이에요.",
            en: "For Spanish routines, use 'verb + a las + time'. 'Me despierto' (I wake up), 'Almuerzo' (I eat lunch), 'Me acuesto' (I go to bed). Verbs with 'Me' are reflexive — the action is on yourself. To ask: '¿A qué hora ___?' (At what time do you ___?).",
            es: "Para rutinas, usa 'verbo + a las + hora'. 'Me despierto', 'Almuerzo', 'Me acuesto'. Los verbos con 'Me' son reflexivos — la acción es sobre ti mismo. Para preguntar: '¿A qué hora ___?'",
          },
          examples: {
            ko: "Me despierto a las siete. (일곱 시에 일어나요.)\nAlmuerzo a las doce y media. (열두 시 반에 점심 먹어요.)\n¿A qué hora terminas? (몇 시에 끝나요?)",
            en: "Me despierto a las siete. (I wake up at seven.)\nMe acuesto a las once. (I go to bed at eleven.)\n¿A qué hora terminas? (What time do you finish?)",
            es: "Me despierto a las siete. (Describiendo mi rutina matutina.)\nMe acuesto a las once. (Describiendo la hora de dormir.)\n¿A qué hora terminas? (Preguntando el horario de alguien.)",
          },
          mistakes: {
            ko: "❌ Me despierto en las siete.\n✅ Me despierto a las siete. ('en'이 아니라 'a las'예요!)\n❌ ¿Qué hora terminas?\n✅ ¿A qué hora terminas? ('A'를 빼먹으면 안 돼요!)",
            en: "❌ Me despierto en las siete.\n✅ Me despierto a las siete. (Use 'a las', not 'en las'!)\n❌ ¿Qué hora terminas?\n✅ ¿A qué hora terminas? (Don't forget 'A' at the beginning!)",
            es: "❌ Me despierto en las siete.\n✅ Me despierto a las siete. (Usa 'a las', no 'en las'.)\n❌ ¿Qué hora terminas?\n✅ ¿A qué hora terminas? (No olvides 'A' al principio.)",
          },
          rudyTip: {
            ko: "'Me despierto', 'Me acuesto'처럼 'Me'가 붙으면 내가 나한테 하는 행동이야! 일어나기, 자기처럼 자기 자신에게 하는 거지~",
            en: "'Me despierto', 'Me acuesto' — the 'Me' means you do it to yourself. Wake yourself up, put yourself to bed. Makes sense, right?",
            es: "'Me despierto', 'Me acuesto' — el 'Me' significa que te lo haces a ti mismo. Te despiertas, te acuestas. Tiene sentido, ¿no?",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "___ despierto a las siete.",
            answer: "Me",
            options: ["Me", "Yo", "Mi"],
            fullSentence: "Me despierto a las siete.",
            fullSentenceMeaning: { ko: "일곱 시에 일어나요.", en: "I wake up at seven.", es: "Me despierto a las siete." },
          },
          {
            type: "select",
            promptWithBlank: "Almuerzo ___ las doce y media.",
            answer: "a",
            options: ["a", "en", "por"],
            fullSentence: "Almuerzo a las doce y media.",
            fullSentenceMeaning: { ko: "열두 시 반에 점심 먹어요.", en: "I eat lunch at twelve thirty.", es: "Almuerzo a las doce y media." },
          },
          {
            type: "select",
            promptWithBlank: "¿A qué hora ___?",
            answer: "terminas",
            options: ["terminas", "termina", "termino"],
            fullSentence: "¿A qué hora terminas?",
            fullSentenceMeaning: { ko: "몇 시에 끝나요?", en: "What time do you finish?", es: "¿A qué hora terminas?" },
          },
          {
            type: "input",
            promptWithBlank: "Me ___ a las once.",
            answer: "acuesto",
            fullSentence: "Me acuesto a las once.",
            fullSentenceMeaning: { ko: "열한 시에 자요.", en: "I go to bed at eleven.", es: "Me acuesto a las once." },
          },
          {
            type: "listening",
            audioText: "La reunión es a las dos.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["La reunión es a las dos.", "Me despierto a las siete.", "Me acuesto a las once.", "Almuerzo a las doce y media."],
            correct: 0,
            audioOnly: true,
          },
        ],
      },
    },

    korean: {
      step1Sentences: [
        {
          text: "일곱 시에 일어나요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "일곱 시에 일어나요.", en: "I wake up at seven.", es: "Me despierto a las siete." },
        },
        {
          text: "열두 시 반에 점심 먹어요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "열두 시 반에 점심 먹어요.", en: "I eat lunch at twelve thirty.", es: "Almuerzo a las doce y media." },
        },
        {
          text: "몇 시에 끝나요?",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "몇 시에 끝나요?", en: "What time do you finish?", es: "¿A qué hora terminas?" },
        },
        {
          text: "열한 시에 자요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "열한 시에 자요.", en: "I go to bed at eleven.", es: "Me acuesto a las once." },
        },
        {
          text: "회의는 두 시예요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "회의는 두 시예요.", en: "The meeting is at two o'clock.", es: "La reunión es a las dos." },
          recallRound: true,
        },
        {
          text: "다시 한번 말해 주세요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "다시 한번 말해 주세요.", en: "Can you say that again?", es: "¿Puede repetir eso?" },
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
            ko: "일상을 말할 때 '__ 시에 ___해요'라고 해요. '에'는 시간 뒤에 붙여서 '~에'(at)이라는 뜻을 만들어요. 영어는 'I ___ at ___'인데, 한국어는 '시간 + 에 + 행동'으로 순서가 반대예요! 시간을 물어볼 때는 '몇 시에 ___해요?'라고 해요. '몇'은 'what number'라는 뜻이에요.",
            en: "For Korean routines, use '__ 시에 ___해요' — time + 에 + action. '에' marks 'at' after time. Notice the order is opposite to English: Korean says 'Seven o'clock-at wake up' while English says 'I wake up at seven'. To ask: '몇 시에 ___해요?' (What time do you ___?).",
            es: "Para rutinas en coreano, usa '__ 시에 ___해요' — hora + 에 + acción. '에' marca 'a las' después de la hora. El orden es opuesto al español: coreano dice 'siete hora-a despertarse' mientras español dice 'me despierto a las siete'. Para preguntar: '몇 시에 ___해요?'",
          },
          examples: {
            ko: "일곱 시에 일어나요. (7시에 일어나는 루틴)\n열두 시 반에 점심 먹어요. (12시 반 점심)\n몇 시에 끝나요? (끝나는 시간 묻기)",
            en: "일곱 시에 일어나요. (I wake up at seven.)\n열두 시 반에 점심 먹어요. (I eat lunch at twelve thirty.)\n몇 시에 끝나요? (What time do you finish?)",
            es: "일곱 시에 일어나요. (Me despierto a las siete.)\n열두 시 반에 점심 먹어요. (Almuerzo a las doce y media.)\n몇 시에 끝나요? (¿A qué hora terminas?)",
          },
          mistakes: {
            ko: "❌ 일곱 시 일어나요.\n✅ 일곱 시에 일어나요. ('에'를 빼면 안 돼요! ~시에 = at ~ o'clock)\n❌ 열두 시 반에 점심 먹어.\n✅ 열두 시 반에 점심 먹어요. (존댓말 '요'를 붙여야 해요!)",
            en: "❌ 일곱 시 일어나요.\n✅ 일곱 시에 일어나요. (Don't skip '에'! 시에 = at o'clock.)\n❌ 열두 시 반에 점심 먹어.\n✅ 열두 시 반에 점심 먹어요. (Add '요' for polite form!)",
            es: "❌ 일곱 시 일어나요.\n✅ 일곱 시에 일어나요. (No omitas '에'. 시에 = a las.)\n❌ 열두 시 반에 점심 먹어.\n✅ 열두 시 반에 점심 먹어요. (Agrega '요' para la forma cortés.)",
          },
          rudyTip: {
            ko: "'~시에 ~해요'만 외우면 하루 일과를 전부 설명할 수 있어! 일어나다, 먹다, 자다 — 행동만 바꾸면 끝~",
            en: "'~시에 ~해요' covers your whole day! Just swap the action: 일어나요(wake up), 먹어요(eat), 자요(sleep). One pattern, endless routines!",
            es: "'~시에 ~해요' cubre todo tu día. Solo cambia la acción: 일어나요(despertar), 먹어요(comer), 자요(dormir). Un patrón, rutinas infinitas.",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "일곱 시___ 일어나요.",
            answer: "에",
            options: ["에", "는", "을"],
            fullSentence: "일곱 시에 일어나요.",
            fullSentenceMeaning: { ko: "일곱 시에 일어나요.", en: "I wake up at seven.", es: "Me despierto a las siete." },
          },
          {
            type: "select",
            promptWithBlank: "열두 시 반에 점심 ___.",
            answer: "먹어요",
            options: ["먹어요", "먹어", "먹다"],
            fullSentence: "열두 시 반에 점심 먹어요.",
            fullSentenceMeaning: { ko: "열두 시 반에 점심 먹어요.", en: "I eat lunch at twelve thirty.", es: "Almuerzo a las doce y media." },
          },
          {
            type: "select",
            promptWithBlank: "___ 시에 끝나요?",
            answer: "몇",
            options: ["몇", "무슨", "어느"],
            fullSentence: "몇 시에 끝나요?",
            fullSentenceMeaning: { ko: "몇 시에 끝나요?", en: "What time do you finish?", es: "¿A qué hora terminas?" },
          },
          {
            type: "input",
            promptWithBlank: "열한 시에 ___.",
            answer: "자요",
            fullSentence: "열한 시에 자요.",
            fullSentenceMeaning: { ko: "열한 시에 자요.", en: "I go to bed at eleven.", es: "Me acuesto a las once." },
          },
          {
            type: "listening",
            audioText: "회의는 두 시예요.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["회의는 두 시예요.", "일곱 시에 일어나요.", "열한 시에 자요.", "열두 시 반에 점심 먹어요."],
            correct: 0,
            audioOnly: true,
          },
        ],
      },
    },
  },
};

// =============================================================================
// STEP 3: MISSION TALK
// =============================================================================

export const MISSION_CONTENT_D9_10: Record<string, Partial<Record<LearningLangKey, MissionTalkLangData>>> = {

  // ─────────────── Day 9: Coordinating museum tour times with Rudy ────────────
  day_9: {
    english: {
      situation: {
        ko: "루디가 박물관 투어 시간을 확인하려고 합니다. 시간을 묻고 알려주며 투어 일정을 조율해보세요!",
        en: "Rudy needs to check the museum tour times. Ask and tell the time to coordinate the tour schedule!",
        es: "Rudy necesita verificar los horarios del tour del museo. Pregunta y di la hora para coordinar el horario del tour.",
      },
      gptPrompt: `You are Rudy, a friendly fox detective at the London Museum. You need to coordinate tour times for your investigation — you want to be at certain exhibits at specific times to catch a suspect.

DETECTIVE STORY CONTEXT: A mysterious figure has been spotted visiting the museum at the same time every day. You need your partner to help coordinate tour times so you can be at the right place at the right time.

PRE-TASK — The learner should practice these 3 target expressions:
1. "What time is it?" / "It's ___ o'clock." (asking and telling time)
2. "The tour starts at ___." (stating schedule)
3. "Sorry, I don't understand." (recall from earlier)

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, gently suggest: "You could say something like 'It's three o'clock' or 'The tour starts at ten thirty'..."
- If silent for 10 seconds, use TTS to model the answer naturally.
- If silent for 15 seconds, offer direct help: "Try saying: It's three o'clock."

CONVERSATION FLOW:
1. Greet them and explain you need to coordinate tour times for the investigation
2. Ask "What time is it?" — wait for their answer
3. React and say "Great! The museum opens at nine."
4. Ask "What time does the tour start?" — wait for answer (target: ten thirty or similar)
5. Confirm the time, ask about another exhibit: "And what time is the afternoon tour?"
6. Suggest half past two: "How about half past two?"
7. End with: "Perfect! We'll catch the suspect at the right time!"

MISSION SUCCESS CRITERIA:
- 3 target expressions used = ⭐⭐⭐ "Outstanding! Our timing is perfect for the stakeout!"
- 2 target expressions used = ⭐⭐ "Great work! We almost have our schedule!"
- 1 target expression used = ⭐ "Good start! Let's practice more next time!"

LANGUAGE FOCUS REVIEW: At the end, briefly highlight one time expression they used well.

IMPORTANT: Never say "wrong" or "incorrect". Instead say "Almost!" or "Let me help you with that" or "Good try! You could also say...". Keep all sentences at A1 level. Use {targetLang} throughout.`,
      speechLang: "en-GB",
      suggestedAnswers: [
        "What time is it?",
        "It's three o'clock.",
        "It's half past two.",
        "The tour starts at ten thirty.",
        "Sorry, I don't understand.",
      ],
    },
    spanish: {
      situation: {
        ko: "루디가 박물관 투어 시간을 확인하려고 합니다. 시간을 묻고 알려주며 투어 일정을 조율해보세요!",
        en: "Rudy needs to check the museum tour times. Ask and tell the time to coordinate the tour schedule!",
        es: "Rudy necesita verificar los horarios del tour del museo. Pregunta y di la hora para coordinar el horario.",
      },
      gptPrompt: `You are Rudy, a friendly fox detective at the London Museum. You need to coordinate tour times for your investigation — you want to be at certain exhibits at specific times to catch a suspect.

DETECTIVE STORY CONTEXT: A mysterious figure has been spotted visiting the museum at the same time every day. You need your partner to help coordinate tour times so you can be at the right place at the right time.

PRE-TASK — The learner should practice these 3 target expressions:
1. "¿Qué hora es?" / "Son las ___." (asking and telling time)
2. "El tour empieza a las ___." (stating schedule)
3. "Lo siento, no entiendo." (recall from earlier)

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, gently suggest: "Puedes decir algo como 'Son las tres' o 'El tour empieza a las diez y media'..."
- If silent for 10 seconds, use TTS to model the answer naturally.
- If silent for 15 seconds, offer direct help: "Intenta decir: Son las tres."

CONVERSATION FLOW:
1. Greet them and explain you need to coordinate tour times for the investigation
2. Ask "¿Qué hora es?" — wait for their answer
3. React and say "¡Bien! El museo abre a las nueve."
4. Ask "¿A qué hora empieza el tour?" — wait for answer
5. Confirm the time, ask about another exhibit: "¿Y el tour de la tarde?"
6. Suggest half past two: "¿Qué tal a las dos y media?"
7. End with: "¡Perfecto! ¡Atraparemos al sospechoso a la hora correcta!"

MISSION SUCCESS CRITERIA:
- 3 target expressions used = ⭐⭐⭐ "¡Excelente! ¡Nuestro horario es perfecto para la vigilancia!"
- 2 target expressions used = ⭐⭐ "¡Buen trabajo! ¡Casi tenemos nuestro horario!"
- 1 target expression used = ⭐ "¡Buen comienzo! ¡Practiquemos más la próxima vez!"

LANGUAGE FOCUS REVIEW: At the end, briefly highlight one time expression they used well.

IMPORTANT: Never say "incorrecto" or "mal". Instead say "¡Casi!" or "Te ayudo con eso" or "¡Buen intento! También puedes decir...". Keep all sentences at A1 level. Use {targetLang} throughout.`,
      speechLang: "es-ES",
      suggestedAnswers: [
        "¿Qué hora es?",
        "Son las tres.",
        "Son las dos y media.",
        "El tour empieza a las diez y media.",
        "Lo siento, no entiendo.",
      ],
    },
    korean: {
      situation: {
        ko: "루디가 박물관 투어 시간을 확인하려고 합니다. 시간을 묻고 알려주며 투어 일정을 조율해보세요!",
        en: "Rudy needs to check the museum tour times. Ask and tell the time to coordinate the tour schedule!",
        es: "Rudy necesita verificar los horarios del tour del museo. Coordina el horario del tour.",
      },
      gptPrompt: `You are Rudy, a friendly fox detective at the London Museum. You need to coordinate tour times for your investigation — you want to be at certain exhibits at specific times to catch a suspect.

DETECTIVE STORY CONTEXT: A mysterious figure has been spotted visiting the museum at the same time every day. You need your partner to help coordinate tour times so you can be at the right place at the right time.

PRE-TASK — The learner should practice these 3 target expressions:
1. "지금 몇 시예요?" / "__ 시예요." (asking and telling time)
2. "투어는 ___ 시에 시작해요." (stating schedule)
3. "죄송해요, 이해를 못 했어요." (recall from earlier)

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, gently suggest: "'세 시예요' 또는 '투어는 열 시 반에 시작해요'처럼 말해보세요..."
- If silent for 10 seconds, use TTS to model the answer naturally.
- If silent for 15 seconds, offer direct help: "이렇게 말해보세요: 세 시예요."

CONVERSATION FLOW:
1. Greet them and explain you need to coordinate tour times for the investigation
2. Ask "지금 몇 시예요?" — wait for their answer
3. React and say "좋아요! 박물관은 아홉 시에 열어요."
4. Ask "투어는 몇 시에 시작해요?" — wait for answer
5. Confirm the time, ask about another tour: "오후 투어는 몇 시예요?"
6. Suggest half past two: "두 시 반은 어때요?"
7. End with: "완벽해요! 이 시간에 용의자를 잡을 수 있을 거예요!"

MISSION SUCCESS CRITERIA:
- 3 target expressions used = ⭐⭐⭐ "대단해요! 잠복근무 시간이 완벽해요!"
- 2 target expressions used = ⭐⭐ "잘했어요! 거의 다 계획을 세웠어요!"
- 1 target expression used = ⭐ "좋은 시작이에요! 다음에 더 연습해봐요!"

LANGUAGE FOCUS REVIEW: At the end, briefly highlight one time expression they used well.

IMPORTANT: Never say "틀렸어요" or "잘못했어요". Instead say "거의 다 왔어요!" or "제가 도와줄게요" or "좋은 시도예요! 이렇게도 말할 수 있어요...". Keep all sentences at A1 level. Use {targetLang} throughout.`,
      speechLang: "ko-KR",
      suggestedAnswers: [
        "지금 몇 시예요?",
        "세 시예요.",
        "두 시 반이에요.",
        "투어는 열 시 반에 시작해요.",
        "죄송해요, 이해를 못 했어요.",
      ],
    },
  },

  // ─────────────── Day 10: Planning investigation schedule with Rudy ──────────
  day_10: {
    english: {
      situation: {
        ko: "루디와 함께 수사 일정을 세우고 있습니다. 하루 일정을 공유하며 회의와 잠복근무 시간을 정해보세요!",
        en: "You're planning the investigation schedule with Rudy. Share your daily routine and set times for meetings and stakeouts!",
        es: "Estás planeando el horario de investigación con Rudy. Comparte tu rutina diaria y fija horarios para reuniones y vigilancias.",
      },
      gptPrompt: `You are Rudy, a friendly fox detective at the London Museum. You're planning the daily investigation schedule with your partner — you need to know their routine to find the best times for meetings and stakeouts.

DETECTIVE STORY CONTEXT: The investigation requires careful scheduling. You need to plan when to meet, when to do stakeouts, and when to review evidence. First, you need to know your partner's daily schedule.

PRE-TASK — The learner should practice these 3 target expressions:
1. "I wake up at ___." / "I go to bed at ___." (daily routine)
2. "The meeting is at ___." (scheduling)
3. "Can you say that again?" (recall from earlier)

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, gently suggest: "You could say something like 'I wake up at seven' or 'The meeting is at two o'clock'..."
- If silent for 10 seconds, use TTS to model the answer naturally.
- If silent for 15 seconds, offer direct help: "Try saying: I wake up at seven."

CONVERSATION FLOW:
1. Start by explaining you need to plan the investigation schedule
2. Ask "What time do you wake up?" — wait for answer
3. React: "Early bird! Good for stakeouts." Ask about lunch: "What time do you eat lunch?"
4. Share your schedule, then ask: "What time do you finish work?"
5. Suggest a meeting time: "How about the meeting at two o'clock?"
6. Ask "What time do you go to bed?" to plan evening stakeout limits
7. End with: "Great schedule! We'll solve this case in no time!"

MISSION SUCCESS CRITERIA:
- 3 target expressions used = ⭐⭐⭐ "Brilliant! Our schedule is locked and loaded!"
- 2 target expressions used = ⭐⭐ "Good planning! Almost got the full schedule!"
- 1 target expression used = ⭐ "Nice start! Let's finalize the plan next time!"

LANGUAGE FOCUS REVIEW: At the end, briefly highlight one routine expression they used well.

IMPORTANT: Never say "wrong" or "incorrect". Instead say "Almost!" or "Let me help you with that" or "Good try! You could also say...". Keep all sentences at A1 level. Use {targetLang} throughout.`,
      speechLang: "en-GB",
      suggestedAnswers: [
        "I wake up at seven.",
        "I eat lunch at twelve thirty.",
        "The meeting is at two o'clock.",
        "I go to bed at eleven.",
        "Can you say that again?",
      ],
    },
    spanish: {
      situation: {
        ko: "루디와 함께 수사 일정을 세우고 있습니다. 하루 일정을 공유하며 회의와 잠복근무 시간을 정해보세요!",
        en: "You're planning the investigation schedule with Rudy. Share your routine and set meeting times!",
        es: "Estás planeando el horario de investigación con Rudy. Comparte tu rutina y fija horarios para reuniones y vigilancias.",
      },
      gptPrompt: `You are Rudy, a friendly fox detective at the London Museum. You're planning the daily investigation schedule with your partner — you need to know their routine to find the best times for meetings and stakeouts.

DETECTIVE STORY CONTEXT: The investigation requires careful scheduling. You need to plan when to meet, when to do stakeouts, and when to review evidence. First, you need to know your partner's daily schedule.

PRE-TASK — The learner should practice these 3 target expressions:
1. "Me despierto a las ___." / "Me acuesto a las ___." (daily routine)
2. "La reunión es a las ___." (scheduling)
3. "¿Puede repetir eso?" (recall from earlier)

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, gently suggest: "Puedes decir algo como 'Me despierto a las siete' o 'La reunión es a las dos'..."
- If silent for 10 seconds, use TTS to model the answer naturally.
- If silent for 15 seconds, offer direct help: "Intenta decir: Me despierto a las siete."

CONVERSATION FLOW:
1. Start by explaining you need to plan the investigation schedule
2. Ask "¿A qué hora te despiertas?" — wait for answer
3. React: "¡Tempranero! Bueno para vigilancias." Ask about lunch: "¿A qué hora almuerzas?"
4. Share your schedule, then ask: "¿A qué hora terminas?"
5. Suggest a meeting time: "¿Qué tal la reunión a las dos?"
6. Ask "¿A qué hora te acuestas?" to plan evening stakeout limits
7. End with: "¡Buen horario! ¡Resolveremos este caso en poco tiempo!"

MISSION SUCCESS CRITERIA:
- 3 target expressions used = ⭐⭐⭐ "¡Brillante! ¡Nuestro horario está listo!"
- 2 target expressions used = ⭐⭐ "¡Buena planificación! ¡Casi tenemos el horario completo!"
- 1 target expression used = ⭐ "¡Buen comienzo! ¡Finalicemos el plan la próxima vez!"

LANGUAGE FOCUS REVIEW: At the end, briefly highlight one routine expression they used well.

IMPORTANT: Never say "incorrecto" or "mal". Instead say "¡Casi!" or "Te ayudo con eso" or "¡Buen intento! También puedes decir...". Keep all sentences at A1 level. Use {targetLang} throughout.`,
      speechLang: "es-ES",
      suggestedAnswers: [
        "Me despierto a las siete.",
        "Almuerzo a las doce y media.",
        "La reunión es a las dos.",
        "Me acuesto a las once.",
        "¿Puede repetir eso?",
      ],
    },
    korean: {
      situation: {
        ko: "루디와 함께 수사 일정을 세우고 있습니다. 하루 일정을 공유하며 회의와 잠복근무 시간을 정해보세요!",
        en: "You're planning the investigation schedule with Rudy. Share your routine and set meeting times!",
        es: "Estás planeando el horario de investigación con Rudy. Comparte tu rutina y fija horarios.",
      },
      gptPrompt: `You are Rudy, a friendly fox detective at the London Museum. You're planning the daily investigation schedule with your partner — you need to know their routine to find the best times for meetings and stakeouts.

DETECTIVE STORY CONTEXT: The investigation requires careful scheduling. You need to plan when to meet, when to do stakeouts, and when to review evidence. First, you need to know your partner's daily schedule.

PRE-TASK — The learner should practice these 3 target expressions:
1. "일곱 시에 일어나요." / "열한 시에 자요." (daily routine)
2. "회의는 두 시예요." (scheduling)
3. "다시 한번 말해 주세요." (recall from earlier)

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, gently suggest: "'일곱 시에 일어나요' 또는 '회의는 두 시예요'처럼 말해보세요..."
- If silent for 10 seconds, use TTS to model the answer naturally.
- If silent for 15 seconds, offer direct help: "이렇게 말해보세요: 일곱 시에 일어나요."

CONVERSATION FLOW:
1. Start by explaining you need to plan the investigation schedule
2. Ask "몇 시에 일어나요?" — wait for answer
3. React: "일찍 일어나시네요! 잠복근무에 딱이에요." Ask about lunch: "몇 시에 점심 먹어요?"
4. Share your schedule, then ask: "몇 시에 끝나요?"
5. Suggest a meeting time: "회의는 두 시 어때요?"
6. Ask "몇 시에 자요?" to plan evening stakeout limits
7. End with: "완벽한 일정이에요! 금방 사건을 해결할 수 있을 거예요!"

MISSION SUCCESS CRITERIA:
- 3 target expressions used = ⭐⭐⭐ "대단해요! 수사 일정이 완벽해요!"
- 2 target expressions used = ⭐⭐ "잘했어요! 거의 다 계획을 세웠어요!"
- 1 target expression used = ⭐ "좋은 시작이에요! 다음에 계획을 마무리해봐요!"

LANGUAGE FOCUS REVIEW: At the end, briefly highlight one routine expression they used well.

IMPORTANT: Never say "틀렸어요" or "잘못했어요". Instead say "거의 다 왔어요!" or "제가 도와줄게요" or "좋은 시도예요! 이렇게도 말할 수 있어요...". Keep all sentences at A1 level. Use {targetLang} throughout.`,
      speechLang: "ko-KR",
      suggestedAnswers: [
        "일곱 시에 일어나요.",
        "열두 시 반에 점심 먹어요.",
        "회의는 두 시예요.",
        "열한 시에 자요.",
        "다시 한번 말해 주세요.",
      ],
    },
  },
};

// =============================================================================
// STEP 4: REVIEW
// =============================================================================

export const REVIEW_CONTENT_D9_10: Record<string, Partial<Record<LearningLangKey, ReviewQuestion[]>>> = {

  // ─────────────── Day 9 Review ──────────────────────────────────────────────
  // First 2 review Day 8 (isYesterdayReview: true), then 3 from today
  day_9: {
    english: [
      {
        type: "speak",
        sentence: "Today is Monday. I work from Monday to Friday.",
        speechLang: "en-GB",
        meaning: { ko: "오늘은 월요일이에요. 월요일부터 금요일까지 일해요.", en: "Today is Monday. I work from Monday to Friday.", es: "Hoy es lunes. Trabajo de lunes a viernes." },
        isYesterdayReview: true,
      },
      {
        type: "fill_blank",
        promptWithBlank: "See you ___ Wednesday!",
        answer: "on",
        options: ["on", "at", "in"],
        fullSentence: "See you on Wednesday!",
        fullSentenceMeaning: { ko: "수요일에 봐요!", en: "See you on Wednesday!", es: "¡Te veo el miércoles!" },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "What time is it? It's three o'clock.",
        speechLang: "en-GB",
        meaning: { ko: "지금 몇 시예요? 세 시예요.", en: "What time is it? It's three o'clock.", es: "¿Qué hora es? Son las tres." },
      },
      {
        type: "fill_blank",
        promptWithBlank: "It's ___ past two.",
        answer: "half",
        options: ["half", "thirty", "mid"],
        fullSentence: "It's half past two.",
        fullSentenceMeaning: { ko: "두 시 반이에요.", en: "It's half past two.", es: "Son las dos y media." },
      },
      {
        type: "speak",
        sentence: "The museum opens at nine. The tour starts at ten thirty.",
        speechLang: "en-GB",
        meaning: { ko: "박물관은 아홉 시에 열어요. 투어는 열 시 반에 시작해요.", en: "The museum opens at nine. The tour starts at ten thirty.", es: "El museo abre a las nueve. El tour empieza a las diez y media." },
      },
    ],
    spanish: [
      {
        type: "speak",
        sentence: "Hoy es lunes. Trabajo de lunes a viernes.",
        speechLang: "es-ES",
        meaning: { ko: "오늘은 월요일이에요. 월요일부터 금요일까지 일해요.", en: "Today is Monday. I work from Monday to Friday.", es: "Hoy es lunes. Trabajo de lunes a viernes." },
        isYesterdayReview: true,
      },
      {
        type: "fill_blank",
        promptWithBlank: "¡Te veo ___ miércoles!",
        answer: "el",
        options: ["el", "en", "a"],
        fullSentence: "¡Te veo el miércoles!",
        fullSentenceMeaning: { ko: "수요일에 봐요!", en: "See you on Wednesday!", es: "¡Te veo el miércoles!" },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "¿Qué hora es? Son las tres.",
        speechLang: "es-ES",
        meaning: { ko: "지금 몇 시예요? 세 시예요.", en: "What time is it? It's three o'clock.", es: "¿Qué hora es? Son las tres." },
      },
      {
        type: "fill_blank",
        promptWithBlank: "Son las dos y ___.",
        answer: "media",
        options: ["media", "medio", "treinta"],
        fullSentence: "Son las dos y media.",
        fullSentenceMeaning: { ko: "두 시 반이에요.", en: "It's half past two.", es: "Son las dos y media." },
      },
      {
        type: "speak",
        sentence: "El museo abre a las nueve. El tour empieza a las diez y media.",
        speechLang: "es-ES",
        meaning: { ko: "박물관은 아홉 시에 열어요. 투어는 열 시 반에 시작해요.", en: "The museum opens at nine. The tour starts at ten thirty.", es: "El museo abre a las nueve. El tour empieza a las diez y media." },
      },
    ],
    korean: [
      {
        type: "speak",
        sentence: "오늘은 월요일이에요. 월요일부터 금요일까지 일해요.",
        speechLang: "ko-KR",
        meaning: { ko: "오늘은 월요일이에요. 월요일부터 금요일까지 일해요.", en: "Today is Monday. I work from Monday to Friday.", es: "Hoy es lunes. Trabajo de lunes a viernes." },
        isYesterdayReview: true,
      },
      {
        type: "fill_blank",
        promptWithBlank: "수요일___ 봐요!",
        answer: "에",
        options: ["에", "은", "이"],
        fullSentence: "수요일에 봐요!",
        fullSentenceMeaning: { ko: "수요일에 봐요!", en: "See you on Wednesday!", es: "¡Te veo el miércoles!" },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "지금 몇 시예요? 세 시예요.",
        speechLang: "ko-KR",
        meaning: { ko: "지금 몇 시예요? 세 시예요.", en: "What time is it? It's three o'clock.", es: "¿Qué hora es? Son las tres." },
      },
      {
        type: "fill_blank",
        promptWithBlank: "두 시 ___이에요.",
        answer: "반",
        options: ["반", "삼십", "절반"],
        fullSentence: "두 시 반이에요.",
        fullSentenceMeaning: { ko: "두 시 반이에요.", en: "It's half past two.", es: "Son las dos y media." },
      },
      {
        type: "speak",
        sentence: "박물관은 아홉 시에 열어요. 투어는 열 시 반에 시작해요.",
        speechLang: "ko-KR",
        meaning: { ko: "박물관은 아홉 시에 열어요. 투어는 열 시 반에 시작해요.", en: "The museum opens at nine. The tour starts at ten thirty.", es: "El museo abre a las nueve. El tour empieza a las diez y media." },
      },
    ],
  },

  // ─────────────── Day 10 Review ─────────────────────────────────────────────
  // First 2 review Day 9 (isYesterdayReview: true), then 3 from today
  day_10: {
    english: [
      {
        type: "speak",
        sentence: "What time is it? It's half past two.",
        speechLang: "en-GB",
        meaning: { ko: "지금 몇 시예요? 두 시 반이에요.", en: "What time is it? It's half past two.", es: "¿Qué hora es? Son las dos y media." },
        isYesterdayReview: true,
      },
      {
        type: "fill_blank",
        promptWithBlank: "The museum opens ___ nine.",
        answer: "at",
        options: ["at", "in", "on"],
        fullSentence: "The museum opens at nine.",
        fullSentenceMeaning: { ko: "박물관은 아홉 시에 열어요.", en: "The museum opens at nine.", es: "El museo abre a las nueve." },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "I wake up at seven. I eat lunch at twelve thirty.",
        speechLang: "en-GB",
        meaning: { ko: "일곱 시에 일어나요. 열두 시 반에 점심 먹어요.", en: "I wake up at seven. I eat lunch at twelve thirty.", es: "Me despierto a las siete. Almuerzo a las doce y media." },
      },
      {
        type: "fill_blank",
        promptWithBlank: "What time ___ you finish?",
        answer: "do",
        options: ["do", "are", "is"],
        fullSentence: "What time do you finish?",
        fullSentenceMeaning: { ko: "몇 시에 끝나요?", en: "What time do you finish?", es: "¿A qué hora terminas?" },
      },
      {
        type: "speak",
        sentence: "The meeting is at two o'clock. I go to bed at eleven.",
        speechLang: "en-GB",
        meaning: { ko: "회의는 두 시예요. 열한 시에 자요.", en: "The meeting is at two o'clock. I go to bed at eleven.", es: "La reunión es a las dos. Me acuesto a las once." },
      },
    ],
    spanish: [
      {
        type: "speak",
        sentence: "¿Qué hora es? Son las dos y media.",
        speechLang: "es-ES",
        meaning: { ko: "지금 몇 시예요? 두 시 반이에요.", en: "What time is it? It's half past two.", es: "¿Qué hora es? Son las dos y media." },
        isYesterdayReview: true,
      },
      {
        type: "fill_blank",
        promptWithBlank: "El museo abre ___ las nueve.",
        answer: "a",
        options: ["a", "en", "por"],
        fullSentence: "El museo abre a las nueve.",
        fullSentenceMeaning: { ko: "박물관은 아홉 시에 열어요.", en: "The museum opens at nine.", es: "El museo abre a las nueve." },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "Me despierto a las siete. Almuerzo a las doce y media.",
        speechLang: "es-ES",
        meaning: { ko: "일곱 시에 일어나요. 열두 시 반에 점심 먹어요.", en: "I wake up at seven. I eat lunch at twelve thirty.", es: "Me despierto a las siete. Almuerzo a las doce y media." },
      },
      {
        type: "fill_blank",
        promptWithBlank: "¿A qué hora ___?",
        answer: "terminas",
        options: ["terminas", "termina", "termino"],
        fullSentence: "¿A qué hora terminas?",
        fullSentenceMeaning: { ko: "몇 시에 끝나요?", en: "What time do you finish?", es: "¿A qué hora terminas?" },
      },
      {
        type: "speak",
        sentence: "La reunión es a las dos. Me acuesto a las once.",
        speechLang: "es-ES",
        meaning: { ko: "회의는 두 시예요. 열한 시에 자요.", en: "The meeting is at two o'clock. I go to bed at eleven.", es: "La reunión es a las dos. Me acuesto a las once." },
      },
    ],
    korean: [
      {
        type: "speak",
        sentence: "지금 몇 시예요? 두 시 반이에요.",
        speechLang: "ko-KR",
        meaning: { ko: "지금 몇 시예요? 두 시 반이에요.", en: "What time is it? It's half past two.", es: "¿Qué hora es? Son las dos y media." },
        isYesterdayReview: true,
      },
      {
        type: "fill_blank",
        promptWithBlank: "박물관은 아홉 시___ 열어요.",
        answer: "에",
        options: ["에", "는", "을"],
        fullSentence: "박물관은 아홉 시에 열어요.",
        fullSentenceMeaning: { ko: "박물관은 아홉 시에 열어요.", en: "The museum opens at nine.", es: "El museo abre a las nueve." },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "일곱 시에 일어나요. 열두 시 반에 점심 먹어요.",
        speechLang: "ko-KR",
        meaning: { ko: "일곱 시에 일어나요. 열두 시 반에 점심 먹어요.", en: "I wake up at seven. I eat lunch at twelve thirty.", es: "Me despierto a las siete. Almuerzo a las doce y media." },
      },
      {
        type: "fill_blank",
        promptWithBlank: "___ 시에 끝나요?",
        answer: "몇",
        options: ["몇", "무슨", "어느"],
        fullSentence: "몇 시에 끝나요?",
        fullSentenceMeaning: { ko: "몇 시에 끝나요?", en: "What time do you finish?", es: "¿A qué hora terminas?" },
      },
      {
        type: "speak",
        sentence: "회의는 두 시예요. 열한 시에 자요.",
        speechLang: "ko-KR",
        meaning: { ko: "회의는 두 시예요. 열한 시에 자요.", en: "The meeting is at two o'clock. I go to bed at eleven.", es: "La reunión es a las dos. Me acuesto a las once." },
      },
    ],
  },
};
