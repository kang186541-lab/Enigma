/**
 * Day 3-4 v2 Partial (A1 Unit 1: Greetings & Self-Introduction)
 * UPGRADED: Pimsleur Anticipation, Chunking, TBL missions, SM-2 review
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

export const LESSON_CONTENT_V2_D3_4: Record<string, Partial<Record<LearningLangKey, DayLessonData>>> = {

  // ─────────────── Day 3: Jobs & Hobbies ─────────────────────────────────────
  day_3: {
    english: {
      step1Sentences: [
        {
          text: "I'm a student.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." },
        },
        {
          text: "What do you do?",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" },
        },
        {
          text: "I like reading.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "독서를 좋아해요.", en: "I like reading.", es: "Me gusta leer." },
        },
        {
          text: "Do you speak English?",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Hablas inglés?" },
        },
        {
          text: "A little bit.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "조금이요.", en: "A little bit.", es: "Un poquito." },
        },
        {
          text: "Nice to meet you!",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "만나서 반갑습니다!", en: "Nice to meet you!", es: "¡Mucho gusto!" },
        },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "직업을 말할 때 'I'm a ___'라고 해요. 'I'm'은 'I am'을 줄인 거예요. 좋아하는 걸 말할 때는 'I like ___'이라고 하고, 뒤에 동사가 오면 -ing를 붙여요. 예를 들어 'read'는 'reading'이 되는 거죠. 한국어로는 '저는 ___이에요' / '___를 좋아해요'랑 비슷한데, 영어는 'a'를 꼭 붙여야 해요!",
            en: "To talk about your job, say 'I'm a ___' — 'I'm' is short for 'I am'. To say what you like, use 'I like ___' and add -ing to the verb. So 'read' becomes 'reading'. Notice that you need 'a' before the job — 'I'm a student', not 'I'm student'.",
            es: "Para hablar de tu trabajo, di 'I'm a ___' — 'I'm' es la forma corta de 'I am'. Para decir lo que te gusta, usa 'I like ___' y agrega -ing al verbo. Así 'read' se convierte en 'reading'. Nota que necesitas 'a' antes del trabajo — 'I'm a student', no 'I'm student'.",
          },
          examples: {
            ko: "I'm a student. (저는 학생이에요.)\nI like reading. (독서를 좋아해요.)\nDo you speak English? — A little bit. (영어 할 줄 아세요? — 조금이요.)",
            en: "I'm a student. (Talking about your job.)\nI like reading. (Talking about your hobby.)\nWhat do you do? (Asking someone about their job.)",
            es: "I'm a student. (Soy estudiante.)\nI like reading. (Me gusta leer.)\nDo you speak English? — A little bit. (¿Hablas inglés? — Un poquito.)",
          },
          mistakes: {
            ko: "❌ I'm student.\n✅ I'm a student. (직업 앞에 'a'를 꼭 붙여요!)\n❌ I like read.\n✅ I like reading. (like 뒤에는 -ing 형태!)",
            en: "❌ I'm student.\n✅ I'm a student. (Don't forget 'a' before the job!)\n❌ I like read.\n✅ I like reading. (After 'like', use the -ing form!)",
            es: "❌ I'm student.\n✅ I'm a student. (No olvides 'a' antes del trabajo.)\n❌ I like read.\n✅ I like reading. (Después de 'like', usa la forma -ing.)",
          },
          rudyTip: {
            ko: "'I'm a ___'만 기억하면 어디서든 직업 소개 가능! 취미도 'I like ___ing'이면 끝이야~",
            en: "Just remember 'I'm a ___' for jobs and 'I like ___ing' for hobbies — two phrases and you can talk about yourself all day!",
            es: "Solo recuerda 'I'm a ___' para trabajos e 'I like ___ing' para pasatiempos — con dos frases puedes hablar de ti todo el día.",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "I'm ___ student.",
            answer: "a",
            options: ["a", "the", "an"],
            fullSentence: "I'm a student.",
            fullSentenceMeaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." },
          },
          {
            type: "select",
            promptWithBlank: "I like ___.",
            answer: "reading",
            options: ["reading", "read", "reads"],
            fullSentence: "I like reading.",
            fullSentenceMeaning: { ko: "독서를 좋아해요.", en: "I like reading.", es: "Me gusta leer." },
          },
          {
            type: "select",
            promptWithBlank: "What do you ___?",
            answer: "do",
            options: ["do", "are", "is"],
            fullSentence: "What do you do?",
            fullSentenceMeaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" },
          },
          {
            type: "input",
            promptWithBlank: "Do you ___ English?",
            answer: "speak",
            fullSentence: "Do you speak English?",
            fullSentenceMeaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Hablas inglés?" },
          },
          {
            type: "listening",
            audioText: "I like reading.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["I like reading.", "I'm a student.", "Do you speak English?", "A little bit."],
            correct: 0,
            audioOnly: true,
          },
        ],
      },
    },

    spanish: {
      step1Sentences: [
        {
          text: "Soy estudiante.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." },
        },
        {
          text: "¿A qué te dedicas?",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" },
        },
        {
          text: "Me gusta leer.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "독서를 좋아해요.", en: "I like reading.", es: "Me gusta leer." },
        },
        {
          text: "¿Hablas inglés?",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Hablas inglés?" },
        },
        {
          text: "Un poquito.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "조금이요.", en: "A little bit.", es: "Un poquito." },
        },
        {
          text: "¡Mucho gusto!",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "만나서 반갑습니다!", en: "Nice to meet you!", es: "¡Mucho gusto!" },
        },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "스페인어로 직업을 말할 때 'Soy ___'라고 해요. 영어처럼 'a'를 안 붙여도 돼서 더 쉬워요! 좋아하는 걸 말할 때는 'Me gusta ___'인데, 직역하면 '나에게 ___가 좋다'라는 뜻이에요. 한국어 '___를 좋아해요'와 순서가 반대죠!",
            en: "To say your job in Spanish, use 'Soy ___' — no article needed! Easier than English. To say what you like, use 'Me gusta ___'. Literally it means '___ pleases me'. So 'Me gusta leer' = 'Reading pleases me' = 'I like reading'.",
            es: "Para decir tu trabajo, usa 'Soy ___' — sin artículo. Para lo que te gusta, usa 'Me gusta ___'. Literalmente significa '___ me agrada'. Así 'Me gusta leer' es directo y natural.",
          },
          examples: {
            ko: "Soy estudiante. (저는 학생이에요.)\nMe gusta leer. (독서를 좋아해요.)\n¿Hablas inglés? — Un poquito. (영어 할 줄 아세요? — 조금이요.)",
            en: "Soy estudiante. (I'm a student — no 'a' needed!)\nMe gusta leer. (I like reading.)\n¿A qué te dedicas? (What do you do for a living?)",
            es: "Soy estudiante. (Hablo de mi trabajo.)\nMe gusta leer. (Hablo de mi pasatiempo.)\n¿A qué te dedicas? (Pregunto por el trabajo de alguien.)",
          },
          mistakes: {
            ko: "❌ Yo soy un estudiante.\n✅ Soy estudiante. (직업 앞에 관사 안 붙여요! 'Yo'도 생략 가능!)\n❌ Me gusto leer.\n✅ Me gusta leer. ('gusto'가 아니라 'gusta'!)",
            en: "❌ Yo soy un estudiante.\n✅ Soy estudiante. (No article before jobs! 'Yo' is optional too.)\n❌ Me gusto leer.\n✅ Me gusta leer. (It's 'gusta', not 'gusto' — the subject is the thing you like!)",
            es: "❌ Yo soy un estudiante.\n✅ Soy estudiante. (Sin artículo antes de profesiones, y 'Yo' es opcional.)\n❌ Me gusto leer.\n✅ Me gusta leer. (Es 'gusta' porque el sujeto es lo que te agrada.)",
          },
          rudyTip: {
            ko: "'Soy ___'는 영어보다 더 쉬워! 'a' 같은 거 없이 바로 직업 이름만 붙이면 끝이거든~",
            en: "Good news — 'Soy ___' is even easier than English because you skip the 'a'. One word before your job and done!",
            es: "Buena noticia — 'Soy ___' es super fácil. Una palabra antes de tu profesión y listo.",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "___ estudiante.",
            answer: "Soy",
            options: ["Soy", "Estoy", "Tengo"],
            fullSentence: "Soy estudiante.",
            fullSentenceMeaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." },
          },
          {
            type: "select",
            promptWithBlank: "Me ___ leer.",
            answer: "gusta",
            options: ["gusta", "gusto", "gustan"],
            fullSentence: "Me gusta leer.",
            fullSentenceMeaning: { ko: "독서를 좋아해요.", en: "I like reading.", es: "Me gusta leer." },
          },
          {
            type: "select",
            promptWithBlank: "¿___ inglés?",
            answer: "Hablas",
            options: ["Hablas", "Habla", "Hablo"],
            fullSentence: "¿Hablas inglés?",
            fullSentenceMeaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Hablas inglés?" },
          },
          {
            type: "input",
            promptWithBlank: "¿A qué te ___?",
            answer: "dedicas",
            fullSentence: "¿A qué te dedicas?",
            fullSentenceMeaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" },
          },
          {
            type: "listening",
            audioText: "Me gusta leer.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["Me gusta leer.", "Soy estudiante.", "¿Hablas inglés?", "Un poquito."],
            correct: 0,
            audioOnly: true,
          },
        ],
      },
    },

    korean: {
      step1Sentences: [
        {
          text: "저는 학생이에요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." },
        },
        {
          text: "무슨 일 하세요?",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" },
        },
        {
          text: "독서를 좋아해요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "독서를 좋아해요.", en: "I like reading.", es: "Me gusta leer." },
        },
        {
          text: "영어 할 줄 아세요?",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Hablas inglés?" },
        },
        {
          text: "조금이요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "조금이요.", en: "A little bit.", es: "Un poquito." },
        },
        {
          text: "만나서 반갑습니다!",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "만나서 반갑습니다!", en: "Nice to meet you!", es: "¡Mucho gusto!" },
        },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "직업을 말할 때 '저는 ___이에요/예요'라고 해요. 받침이 있으면 '이에요', 없으면 '예요'를 써요. '학생' 끝에 받침 'ㅇ'이 있으니까 '학생이에요'! 좋아하는 걸 말할 때는 '___를/을 좋아해요'. 받침 있으면 '을', 없으면 '를'이에요. 영어의 'I like ___'과 비슷한데 순서가 반대죠!",
            en: "To say your job in Korean, use '저는 ___이에요' (if the word ends in a consonant) or '___예요' (if it ends in a vowel). For hobbies, use '___를 좋아해요' (after a vowel) or '___을 좋아해요' (after a consonant). The object comes before the verb — opposite of English!",
            es: "Para decir tu trabajo en coreano, usa '저는 ___이에요' (si termina en consonante) o '___예요' (si termina en vocal). Para pasatiempos, usa '___를 좋아해요' (tras vocal) o '___을 좋아해요' (tras consonante). El objeto va antes del verbo, al revés del español.",
          },
          examples: {
            ko: "저는 학생이에요. (직업 소개 — 받침 있으니 '이에요')\n독서를 좋아해요. (취미 — '독서' 받침 없으니 '를')\n영어 할 줄 아세요? — 조금이요. (능력 질문과 대답)",
            en: "저는 학생이에요. (I'm a student — 학생 ends in ㅇ, so 이에요.)\n독서를 좋아해요. (I like reading — 독서 ends in a vowel, so 를.)\n영어 할 줄 아세요? (Do you speak English? — asking about ability.)",
            es: "저는 학생이에요. (Soy estudiante — 학생 termina en ㅇ, así que 이에요.)\n독서를 좋아해요. (Me gusta leer — 독서 termina en vocal, así que 를.)\n영어 할 줄 아세요? (¿Hablas inglés? — preguntando habilidad.)",
          },
          mistakes: {
            ko: "❌ 저는 학생예요.\n✅ 저는 학생이에요. ('학생'은 받침이 있으니까 '이에요'!)\n❌ 독서을 좋아해요.\n✅ 독서를 좋아해요. ('독서'는 받침이 없으니까 '를'!)",
            en: "❌ 저는 학생예요.\n✅ 저는 학생이에요. (학생 ends in a consonant, so use 이에요 not 예요!)\n❌ 독서을 좋아해요.\n✅ 독서를 좋아해요. (독서 ends in a vowel, so use 를 not 을!)",
            es: "❌ 저는 학생예요.\n✅ 저는 학생이에요. (학생 termina en consonante, usa 이에요 no 예요.)\n❌ 독서을 좋아해요.\n✅ 독서를 좋아해요. (독서 termina en vocal, usa 를 no 을.)",
          },
          rudyTip: {
            ko: "받침이 있냐 없냐가 핵심이야! 헷갈리면 손가락으로 글자 밑을 짚어보면 바로 알 수 있어~",
            en: "The key is whether the last character has a bottom consonant! If you're unsure, try saying the word slowly — if it ends on a hard sound, it's a consonant ending.",
            es: "La clave es si el último carácter tiene consonante final. Si no estás seguro, di la palabra lentamente — si termina en sonido duro, tiene consonante.",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "저는 학생___.",
            answer: "이에요",
            options: ["이에요", "예요", "이요"],
            fullSentence: "저는 학생이에요.",
            fullSentenceMeaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." },
          },
          {
            type: "select",
            promptWithBlank: "독서___ 좋아해요.",
            answer: "를",
            options: ["를", "을", "이"],
            fullSentence: "독서를 좋아해요.",
            fullSentenceMeaning: { ko: "독서를 좋아해요.", en: "I like reading.", es: "Me gusta leer." },
          },
          {
            type: "select",
            promptWithBlank: "영어 할 줄 ___?",
            answer: "아세요",
            options: ["아세요", "있어요", "해요"],
            fullSentence: "영어 할 줄 아세요?",
            fullSentenceMeaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Hablas inglés?" },
          },
          {
            type: "input",
            promptWithBlank: "무슨 ___ 하세요?",
            answer: "일",
            fullSentence: "무슨 일 하세요?",
            fullSentenceMeaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" },
          },
          {
            type: "listening",
            audioText: "독서를 좋아해요.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["독서를 좋아해요.", "저는 학생이에요.", "영어 할 줄 아세요?", "조금이요."],
            correct: 0,
            audioOnly: true,
          },
        ],
      },
    },
  },

  // ─────────────── Day 4: Family & People (Round 3 introduced!) ──────────────
  day_4: {
    english: {
      step1Sentences: [
        {
          text: "This is my mother.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "이분은 제 어머니예요.", en: "This is my mother.", es: "Esta es mi madre." },
        },
        {
          text: "I have two brothers.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "형이 두 명 있어요.", en: "I have two brothers.", es: "Tengo dos hermanos." },
        },
        {
          text: "My sister is a doctor.",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "누나는 의사예요.", en: "My sister is a doctor.", es: "Mi hermana es doctora." },
        },
        {
          text: "How many people in your family?",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "가족이 몇 명이에요?", en: "How many people in your family?", es: "¿Cuántas personas hay en tu familia?" },
        },
        {
          text: "Thank you very much!",
          speechLang: "en-GB",
          ttsVoice: "en-GB-RyanNeural",
          meaning: { ko: "정말 감사합니다!", en: "Thank you very much!", es: "¡Muchas gracias!" },
          recallRound: true,
        },
        {
          text: "Where are you from?",
          speechLang: "en-GB",
          ttsVoice: "en-GB-SoniaNeural",
          meaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" },
        },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "가족을 소개할 때 'This is my ___'라고 해요. 'This is'는 '이 사람은'이라는 뜻이에요. 가족 수를 말할 때는 'I have ___'를 쓰는데, 한국어의 '___가 있어요'와 비슷해요. 영어는 '나는 가지고 있다(have)'라고 표현하고, 한국어는 '있다'로 표현하는 차이가 있어요!",
            en: "To introduce family, say 'This is my ___' — simple and direct. To talk about how many, use 'I have ___'. Notice English says 'I have two brothers' while you might say 'There are two brothers' in other languages. English focuses on possession with 'have'.",
            es: "Para presentar familia, di 'This is my ___' — simple y directo. Para hablar de cuántos, usa 'I have ___'. Nota que en inglés se dice 'I have two brothers' (tengo dos hermanos), igual que en español con 'tengo'.",
          },
          examples: {
            ko: "This is my mother. (이분은 제 어머니예요.)\nI have two brothers. (형이 두 명 있어요.)\nMy sister is a doctor. (누나는 의사예요.)",
            en: "This is my mother. (Introducing a family member.)\nI have two brothers. (Talking about family size.)\nHow many people in your family? (Asking about someone's family.)",
            es: "This is my mother. (Esta es mi madre.)\nI have two brothers. (Tengo dos hermanos.)\nMy sister is a doctor. (Mi hermana es doctora.)",
          },
          mistakes: {
            ko: "❌ This is my the mother.\n✅ This is my mother. ('my'와 'the'를 같이 쓰면 안 돼요!)\n❌ I have two brother.\n✅ I have two brothers. (2명이니까 's'를 붙여요!)",
            en: "❌ This is my the mother.\n✅ This is my mother. (Don't use 'my' and 'the' together!)\n❌ I have two brother.\n✅ I have two brothers. (Two = plural, so add 's'!)",
            es: "❌ This is my the mother.\n✅ This is my mother. (No uses 'my' y 'the' juntos.)\n❌ I have two brother.\n✅ I have two brothers. (Dos = plural, agrega 's'.)",
          },
          rudyTip: {
            ko: "가족 소개는 'This is my ___'만 외우면 돼! 엄마, 아빠, 형, 누나 — 빈칸만 바꾸면 끝이야~",
            en: "Family introductions are a breeze — 'This is my ___' and just swap the family member. Mother, father, brother, sister — done!",
            es: "Presentar familia es fácil — 'This is my ___' y solo cambia el miembro. Mother, father, brother, sister — listo.",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "This ___ my mother.",
            answer: "is",
            options: ["is", "are", "am"],
            fullSentence: "This is my mother.",
            fullSentenceMeaning: { ko: "이분은 제 어머니예요.", en: "This is my mother.", es: "Esta es mi madre." },
          },
          {
            type: "select",
            promptWithBlank: "I ___ two brothers.",
            answer: "have",
            options: ["have", "am", "has"],
            fullSentence: "I have two brothers.",
            fullSentenceMeaning: { ko: "형이 두 명 있어요.", en: "I have two brothers.", es: "Tengo dos hermanos." },
          },
          {
            type: "select",
            promptWithBlank: "My sister is a ___.",
            answer: "doctor",
            options: ["doctor", "student", "mother"],
            fullSentence: "My sister is a doctor.",
            fullSentenceMeaning: { ko: "누나는 의사예요.", en: "My sister is a doctor.", es: "Mi hermana es doctora." },
          },
          {
            type: "input",
            promptWithBlank: "How ___ people in your family?",
            answer: "many",
            fullSentence: "How many people in your family?",
            fullSentenceMeaning: { ko: "가족이 몇 명이에요?", en: "How many people in your family?", es: "¿Cuántas personas hay en tu familia?" },
          },
          {
            type: "listening",
            audioText: "This is my mother.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["This is my mother.", "I have two brothers.", "My sister is a doctor.", "Thank you very much!"],
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
          text: "Esta es mi madre.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "이분은 제 어머니예요.", en: "This is my mother.", es: "Esta es mi madre." },
        },
        {
          text: "Tengo dos hermanos.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "형이 두 명 있어요.", en: "I have two brothers.", es: "Tengo dos hermanos." },
        },
        {
          text: "Mi hermana es doctora.",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "누나는 의사예요.", en: "My sister is a doctor.", es: "Mi hermana es doctora." },
        },
        {
          text: "¿Cuántas personas hay en tu familia?",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "가족이 몇 명이에요?", en: "How many people in your family?", es: "¿Cuántas personas hay en tu familia?" },
        },
        {
          text: "¡Muchas gracias!",
          speechLang: "es-ES",
          ttsVoice: "es-ES-AlvaroNeural",
          meaning: { ko: "정말 감사합니다!", en: "Thank you very much!", es: "¡Muchas gracias!" },
          recallRound: true,
        },
        {
          text: "¿De dónde eres?",
          speechLang: "es-ES",
          ttsVoice: "es-ES-ElviraNeural",
          meaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" },
        },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "가족을 소개할 때 'Esta es mi ___' (여자) / 'Este es mi ___' (남자)라고 해요. 스페인어는 남녀에 따라 형태가 달라요! 'Tengo ___'는 '___가 있어요'라는 뜻인데, 영어의 'I have'와 같아요. 한국어는 '있다'를 쓰지만 스페인어는 영어처럼 '가지다(tener)'를 써요!",
            en: "To introduce family in Spanish, say 'Esta es mi ___' (for women) or 'Este es mi ___' (for men). Spanish changes based on gender! For 'I have', use 'Tengo ___'. 'Tengo' comes from 'tener' — same idea as English 'have'.",
            es: "Para presentar familia, di 'Esta es mi ___' (mujer) o 'Este es mi ___' (hombre). Para decir cuántos tienes, usa 'Tengo ___'. Es directo y natural.",
          },
          examples: {
            ko: "Esta es mi madre. (이분은 제 어머니예요.)\nTengo dos hermanos. (형이 두 명 있어요.)\nMi hermana es doctora. (누나는 의사예요.)",
            en: "Esta es mi madre. (This is my mother — 'esta' for female.)\nTengo dos hermanos. (I have two brothers.)\n¿Cuántas personas hay en tu familia? (How many people in your family?)",
            es: "Esta es mi madre. (Presento a mi mamá.)\nTengo dos hermanos. (Hablo de mi familia.)\nMi hermana es doctora. (Digo la profesión de mi hermana.)",
          },
          mistakes: {
            ko: "❌ Este es mi madre.\n✅ Esta es mi madre. (어머니는 여자니까 'Esta'! 'Este'는 남자용!)\n❌ Mi hermana es doctor.\n✅ Mi hermana es doctora. (여자니까 'doctora'로 바꿔요!)",
            en: "❌ Este es mi madre.\n✅ Esta es mi madre. (Mother is female, so use 'esta' not 'este'!)\n❌ Mi hermana es doctor.\n✅ Mi hermana es doctora. (Female = doctora, not doctor!)",
            es: "❌ Este es mi madre.\n✅ Esta es mi madre. (Madre es femenino, usa 'esta' no 'este'.)\n❌ Mi hermana es doctor.\n✅ Mi hermana es doctora. (Femenino = doctora, no doctor.)",
          },
          rudyTip: {
            ko: "스페인어는 남녀 구분이 중요해! 엄마(madre)는 'esta', 아빠(padre)는 'este'로 시작해~",
            en: "Spanish loves gender! Remember: 'esta' for women, 'este' for men. Mother = esta, father = este. Easy pattern!",
            es: "Recuerda: 'esta' para mujeres, 'este' para hombres. Madre = esta, padre = este. Patrón fácil.",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "___ es mi madre.",
            answer: "Esta",
            options: ["Esta", "Este", "Esto"],
            fullSentence: "Esta es mi madre.",
            fullSentenceMeaning: { ko: "이분은 제 어머니예요.", en: "This is my mother.", es: "Esta es mi madre." },
          },
          {
            type: "select",
            promptWithBlank: "___ dos hermanos.",
            answer: "Tengo",
            options: ["Tengo", "Tiene", "Tenemos"],
            fullSentence: "Tengo dos hermanos.",
            fullSentenceMeaning: { ko: "형이 두 명 있어요.", en: "I have two brothers.", es: "Tengo dos hermanos." },
          },
          {
            type: "select",
            promptWithBlank: "Mi hermana es ___.",
            answer: "doctora",
            options: ["doctora", "doctor", "doctores"],
            fullSentence: "Mi hermana es doctora.",
            fullSentenceMeaning: { ko: "누나는 의사예요.", en: "My sister is a doctor.", es: "Mi hermana es doctora." },
          },
          {
            type: "input",
            promptWithBlank: "¿___ personas hay en tu familia?",
            answer: "Cuántas",
            fullSentence: "¿Cuántas personas hay en tu familia?",
            fullSentenceMeaning: { ko: "가족이 몇 명이에요?", en: "How many people in your family?", es: "¿Cuántas personas hay en tu familia?" },
          },
          {
            type: "listening",
            audioText: "Esta es mi madre.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["Esta es mi madre.", "Tengo dos hermanos.", "Mi hermana es doctora.", "¡Muchas gracias!"],
            correct: 0,
            audioOnly: true,
          },
          {
            type: "select",
            promptWithBlank: "¡Muchas ___!",
            answer: "gracias",
            options: ["gracias", "gustos", "personas"],
            fullSentence: "¡Muchas gracias!",
            fullSentenceMeaning: { ko: "정말 감사합니다!", en: "Thank you very much!", es: "¡Muchas gracias!" },
          },
        ],
      },
    },

    korean: {
      step1Sentences: [
        {
          text: "이분은 제 어머니예요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "이분은 제 어머니예요.", en: "This is my mother.", es: "Esta es mi madre." },
        },
        {
          text: "형이 두 명 있어요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "형이 두 명 있어요.", en: "I have two brothers.", es: "Tengo dos hermanos." },
        },
        {
          text: "누나는 의사예요.",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "누나는 의사예요.", en: "My sister is a doctor.", es: "Mi hermana es doctora." },
        },
        {
          text: "가족이 몇 명이에요?",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "가족이 몇 명이에요?", en: "How many people in your family?", es: "¿Cuántas personas hay en tu familia?" },
        },
        {
          text: "정말 감사합니다!",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-InJoonNeural",
          meaning: { ko: "정말 감사합니다!", en: "Thank you very much!", es: "¡Muchas gracias!" },
          recallRound: true,
        },
        {
          text: "어디에서 오셨어요?",
          speechLang: "ko-KR",
          ttsVoice: "ko-KR-SunHiNeural",
          meaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" },
        },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: {
            ko: "가족을 소개할 때 '이분은 제 ___예요/이에요'라고 해요. 사람을 높여 부를 때 '이분'을 쓰고, 가족 호칭은 상황에 따라 달라요! 형(남자의 형), 누나(남자의 언니), 언니(여자의 언니), 오빠(여자의 오빠) — 말하는 사람의 성별에 따라 바뀌는 게 영어와 다른 점이에요. '있어요'는 영어의 'have'와 같은 뜻이에요.",
            en: "To introduce family in Korean, say '이분은 제 ___예요'. Use '이분' (this person — polite) instead of '이것' (this thing). Korean has different words for siblings depending on YOUR gender: 형/누나 (if you're male), 오빠/언니 (if you're female). '있어요' means both 'there is' and 'I have'.",
            es: "Para presentar familia en coreano, di '이분은 제 ___예요'. Usa '이분' (esta persona — cortés). El coreano tiene palabras diferentes para hermanos según TU género: 형/누나 (si eres hombre), 오빠/언니 (si eres mujer). '있어요' significa 'hay' y también 'tengo'.",
          },
          examples: {
            ko: "이분은 제 어머니예요. (가족 소개 — '이분'은 높임말)\n형이 두 명 있어요. (남자가 말할 때 — 형)\n누나는 의사예요. (남자가 누나를 소개할 때)",
            en: "이분은 제 어머니예요. (This is my mother — '이분' is polite.)\n형이 두 명 있어요. (I have two older brothers — male speaker says 형.)\n가족이 몇 명이에요? (How many in your family?)",
            es: "이분은 제 어머니예요. (Esta es mi madre — '이분' es cortés.)\n형이 두 명 있어요. (Tengo dos hermanos mayores — hombre dice 형.)\n누나는 의사예요. (Mi hermana mayor es doctora — hombre dice 누나.)",
          },
          mistakes: {
            ko: "❌ 이것은 제 어머니예요.\n✅ 이분은 제 어머니예요. (사람한테는 '이것'이 아니라 '이분'!)\n❌ 형이 두 개 있어요.\n✅ 형이 두 명 있어요. (사람은 '개'가 아니라 '명'으로 세요!)",
            en: "❌ 이것은 제 어머니예요.\n✅ 이분은 제 어머니예요. (Use '이분' for people, '이것' is for things!)\n❌ 형이 두 개 있어요.\n✅ 형이 두 명 있어요. (Count people with '명', not '개'!)",
            es: "❌ 이것은 제 어머니예요.\n✅ 이분은 제 어머니예요. (Usa '이분' para personas, '이것' es para cosas.)\n❌ 형이 두 개 있어요.\n✅ 형이 두 명 있어요. (Cuenta personas con '명', no '개'.)",
          },
          rudyTip: {
            ko: "사람한테는 꼭 '이분'! 그리고 사람은 '명'으로 세는 거 잊지 마~ 하나, 둘, 셋... 한 명, 두 명, 세 명!",
            en: "Always use '이분' for people — it's the polite way! And count people with '명'. One person = 한 명, two = 두 명!",
            es: "Siempre usa '이분' para personas, es la forma cortés. Y cuenta personas con '명'. Una persona = 한 명, dos = 두 명.",
          },
        } as GrammarExplanation,
        quizzes: [
          {
            type: "select",
            promptWithBlank: "___은 제 어머니예요.",
            answer: "이분",
            options: ["이분", "이것", "이거"],
            fullSentence: "이분은 제 어머니예요.",
            fullSentenceMeaning: { ko: "이분은 제 어머니예요.", en: "This is my mother.", es: "Esta es mi madre." },
          },
          {
            type: "select",
            promptWithBlank: "형이 두 ___ 있어요.",
            answer: "명",
            options: ["명", "개", "번"],
            fullSentence: "형이 두 명 있어요.",
            fullSentenceMeaning: { ko: "형이 두 명 있어요.", en: "I have two brothers.", es: "Tengo dos hermanos." },
          },
          {
            type: "select",
            promptWithBlank: "누나는 의사___.",
            answer: "예요",
            options: ["예요", "이에요", "에요"],
            fullSentence: "누나는 의사예요.",
            fullSentenceMeaning: { ko: "누나는 의사예요.", en: "My sister is a doctor.", es: "Mi hermana es doctora." },
          },
          {
            type: "input",
            promptWithBlank: "가족이 ___ 명이에요?",
            answer: "몇",
            fullSentence: "가족이 몇 명이에요?",
            fullSentenceMeaning: { ko: "가족이 몇 명이에요?", en: "How many people in your family?", es: "¿Cuántas personas hay en tu familia?" },
          },
          {
            type: "listening",
            audioText: "이분은 제 어머니예요.",
            question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" },
            options: ["이분은 제 어머니예요.", "형이 두 명 있어요.", "누나는 의사예요.", "정말 감사합니다!"],
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

export const MISSION_CONTENT_V2_D3_4: Record<string, Partial<Record<LearningLangKey, MissionTalkLangData>>> = {

  // ─────────────── Day 3: Meeting museum staff, exchanging backgrounds ───────
  day_3: {
    english: {
      situation: {
        ko: "루디가 런던 박물관 직원들을 만나고 있습니다. 서로의 직업과 취미에 대해 이야기해보세요!",
        en: "Rudy is meeting the museum staff in London. Talk about each other's jobs and hobbies!",
        es: "Rudy conoce al personal del museo en Londres. ¡Habla sobre trabajos y pasatiempos!",
      },
      gptPrompt: `You are Rudy, a friendly fox detective at the London Museum. You are meeting your new partner for the first time and want to learn about their background.

DETECTIVE STORY CONTEXT: You need a new partner for your museum investigation. You're interviewing candidates by chatting casually about their jobs and interests.

PRE-TASK — The learner should practice these 3 target expressions:
1. "I'm a ___." (stating their job)
2. "I like ___." (stating a hobby)
3. "Nice to meet you!" (recall from Day 1-2)

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, gently suggest: "You could say something like 'I'm a student' or 'I like reading'..."
- If silent for 10 seconds, use TTS to model the answer naturally.
- If silent for 15 seconds, offer direct help: "Try saying: I'm a student."

CONVERSATION FLOW:
1. Greet them warmly and introduce yourself as Detective Rudy
2. Ask "What do you do?" — wait for their job
3. React positively, share that you're a detective
4. Ask about hobbies: "What do you like?" — wait for hobby
5. Ask "Do you speak English?" to practice language questions
6. Accept any answer warmly ("A little bit" is great!)
7. End with "Nice to meet you! You're perfect for the team!"

MISSION SUCCESS CRITERIA:
- 3 target expressions used = ⭐⭐⭐ "Outstanding! You're a natural partner!"
- 2 target expressions used = ⭐⭐ "Great work! Almost got them all!"
- 1 target expression used = ⭐ "Good start! Let's practice more next time!"

LANGUAGE FOCUS REVIEW: At the end, briefly highlight one expression they used well.

IMPORTANT: Never say "wrong" or "incorrect". Instead say "Almost!" or "Let me help you with that" or "Good try! You could also say...". Keep all sentences at A1 level. Use {targetLang} throughout.`,
      speechLang: "en-GB",
      suggestedAnswers: [
        "I'm a student.",
        "I like reading.",
        "Do you speak English?",
        "A little bit.",
        "Nice to meet you!",
      ],
    },
    spanish: {
      situation: {
        ko: "루디가 런던 박물관 직원들을 만나고 있습니다. 서로의 직업과 취미에 대해 이야기해보세요!",
        en: "Rudy is meeting the museum staff in London. Talk about jobs and hobbies!",
        es: "Rudy conoce al personal del museo en Londres. ¡Habla sobre trabajos y pasatiempos!",
      },
      gptPrompt: `You are Rudy, a friendly fox detective at the London Museum. You are meeting your new partner for the first time and want to learn about their background.

DETECTIVE STORY CONTEXT: You need a new partner for your museum investigation. You're interviewing candidates by chatting casually about their jobs and interests.

PRE-TASK — The learner should practice these 3 target expressions:
1. "Soy ___." (stating their job)
2. "Me gusta ___." (stating a hobby)
3. "¡Mucho gusto!" (recall from Day 1-2)

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, gently suggest: "Puedes decir algo como 'Soy estudiante' o 'Me gusta leer'..."
- If silent for 10 seconds, use TTS to model the answer naturally.
- If silent for 15 seconds, offer direct help: "Intenta decir: Soy estudiante."

CONVERSATION FLOW:
1. Greet them warmly and introduce yourself as Detective Rudy
2. Ask "¿A qué te dedicas?" — wait for their job
3. React positively, share that you're a detective
4. Ask about hobbies: "¿Qué te gusta hacer?" — wait for hobby
5. Ask "¿Hablas inglés?" to practice language questions
6. Accept any answer warmly ("Un poquito" is great!)
7. End with "¡Mucho gusto! ¡Eres perfecto para el equipo!"

MISSION SUCCESS CRITERIA:
- 3 target expressions used = ⭐⭐⭐ "¡Excelente! ¡Eres un compañero natural!"
- 2 target expressions used = ⭐⭐ "¡Buen trabajo! ¡Casi las tienes todas!"
- 1 target expression used = ⭐ "¡Buen comienzo! ¡Practiquemos más la próxima vez!"

LANGUAGE FOCUS REVIEW: At the end, briefly highlight one expression they used well.

IMPORTANT: Never say "incorrecto" or "mal". Instead say "¡Casi!" or "Te ayudo con eso" or "¡Buen intento! También puedes decir...". Keep all sentences at A1 level. Use {targetLang} throughout.`,
      speechLang: "es-ES",
      suggestedAnswers: [
        "Soy estudiante.",
        "Me gusta leer.",
        "¿Hablas inglés?",
        "Un poquito.",
        "¡Mucho gusto!",
      ],
    },
    korean: {
      situation: {
        ko: "루디가 런던 박물관 직원들을 만나고 있습니다. 서로의 직업과 취미에 대해 이야기해보세요!",
        en: "Rudy is meeting the museum staff in London. Talk about jobs and hobbies!",
        es: "Rudy conoce al personal del museo. ¡Habla sobre trabajos y pasatiempos!",
      },
      gptPrompt: `You are Rudy, a friendly fox detective at the London Museum. You are meeting your new partner for the first time and want to learn about their background.

DETECTIVE STORY CONTEXT: You need a new partner for your museum investigation. You're interviewing candidates by chatting casually about their jobs and interests.

PRE-TASK — The learner should practice these 3 target expressions:
1. "저는 ___이에요/예요." (stating their job)
2. "___를/을 좋아해요." (stating a hobby)
3. "만나서 반갑습니다!" (recall from Day 1-2)

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, gently suggest: "'저는 학생이에요' 또는 '독서를 좋아해요'처럼 말해보세요..."
- If silent for 10 seconds, use TTS to model the answer naturally.
- If silent for 15 seconds, offer direct help: "이렇게 말해보세요: 저는 학생이에요."

CONVERSATION FLOW:
1. Greet them warmly and introduce yourself as Detective Rudy
2. Ask "무슨 일 하세요?" — wait for their job
3. React positively, share that you're a detective
4. Ask about hobbies: "뭘 좋아하세요?" — wait for hobby
5. Ask "영어 할 줄 아세요?" to practice language questions
6. Accept any answer warmly ("조금이요" is great!)
7. End with "만나서 반갑습니다! 우리 팀에 딱이에요!"

MISSION SUCCESS CRITERIA:
- 3 target expressions used = ⭐⭐⭐ "대단해요! 천생 파트너감이에요!"
- 2 target expressions used = ⭐⭐ "잘했어요! 거의 다 했어요!"
- 1 target expression used = ⭐ "좋은 시작이에요! 다음에 더 연습해봐요!"

LANGUAGE FOCUS REVIEW: At the end, briefly highlight one expression they used well.

IMPORTANT: Never say "틀렸어요" or "잘못했어요". Instead say "거의 다 왔어요!" or "제가 도와줄게요" or "좋은 시도예요! 이렇게도 말할 수 있어요...". Keep all sentences at A1 level. Use {targetLang} throughout.`,
      speechLang: "ko-KR",
      suggestedAnswers: [
        "저는 학생이에요.",
        "독서를 좋아해요.",
        "영어 할 줄 아세요?",
        "조금이요.",
        "만나서 반갑습니다!",
      ],
    },
  },

  // ─────────────── Day 4: Rudy asking a witness about family ─────────────────
  day_4: {
    english: {
      situation: {
        ko: "루디가 박물관에서 목격자의 신원을 확인하기 위해 가족에 대해 물어보고 있습니다. 가족을 소개하며 대화해보세요!",
        en: "Rudy is asking a witness about their family to verify their identity at the museum. Introduce your family!",
        es: "Rudy pregunta a un testigo sobre su familia para verificar su identidad. ¡Presenta a tu familia!",
      },
      gptPrompt: `You are Rudy, a fox detective at the London Museum. A painting has gone missing, and you need to verify a witness's identity by asking about their family.

DETECTIVE STORY CONTEXT: Someone reported seeing a suspicious person near the missing painting. You found a witness and need to verify who they are by cross-referencing family details with museum visitor records.

PRE-TASK — The learner should practice these 3 target expressions:
1. "This is my ___." (introducing a family member)
2. "I have ___." (talking about family members)
3. "Thank you very much!" (recall from Day 1-2)

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, gently suggest: "You could say something like 'This is my mother' or 'I have two brothers'..."
- If silent for 10 seconds, use TTS to model the answer naturally.
- If silent for 15 seconds, offer direct help: "Try saying: This is my mother."

CONVERSATION FLOW:
1. Introduce yourself as Detective Rudy investigating the museum case
2. Ask "How many people in your family?" — wait for answer
3. Ask them to introduce family members: "Tell me about your family"
4. React to each introduction warmly, ask follow-up: "What does your ___ do?"
5. Ask "Where are you from?" to cross-reference records (recall)
6. Thank them: "Thank you very much! Your information is very helpful."
7. End warmly: "Your family sounds lovely. Thank you for helping with the case!"

MISSION SUCCESS CRITERIA:
- 3 target expressions used = ⭐⭐⭐ "Brilliant detective work! Case file updated!"
- 2 target expressions used = ⭐⭐ "Good investigation! Almost got all the details!"
- 1 target expression used = ⭐ "Nice start, partner! We'll crack the case next time!"

LANGUAGE FOCUS REVIEW: At the end, briefly highlight one expression they used well.

IMPORTANT: Never say "wrong" or "incorrect". Instead say "Almost!" or "Let me help you with that" or "Good try! You could also say...". Keep all sentences at A1 level. Use {targetLang} throughout.`,
      speechLang: "en-GB",
      suggestedAnswers: [
        "This is my mother.",
        "I have two brothers.",
        "My sister is a doctor.",
        "Thank you very much!",
        "Where are you from?",
      ],
    },
    spanish: {
      situation: {
        ko: "루디가 박물관에서 목격자의 신원을 확인하기 위해 가족에 대해 물어보고 있습니다.",
        en: "Rudy is asking a witness about their family to verify their identity.",
        es: "Rudy pregunta a un testigo sobre su familia para verificar su identidad en el museo.",
      },
      gptPrompt: `You are Rudy, a fox detective at the London Museum. A painting has gone missing, and you need to verify a witness's identity by asking about their family.

DETECTIVE STORY CONTEXT: Someone reported seeing a suspicious person near the missing painting. You found a witness and need to verify who they are by cross-referencing family details with museum visitor records.

PRE-TASK — The learner should practice these 3 target expressions:
1. "Esta es mi ___." (introducing a family member)
2. "Tengo ___." (talking about family members)
3. "¡Muchas gracias!" (recall from Day 1-2)

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, gently suggest: "Puedes decir algo como 'Esta es mi madre' o 'Tengo dos hermanos'..."
- If silent for 10 seconds, use TTS to model the answer naturally.
- If silent for 15 seconds, offer direct help: "Intenta decir: Esta es mi madre."

CONVERSATION FLOW:
1. Introduce yourself as Detective Rudy investigating the museum case
2. Ask "¿Cuántas personas hay en tu familia?" — wait for answer
3. Ask them to introduce family: "Cuéntame de tu familia"
4. React warmly, ask follow-up: "¿Qué hace tu ___?"
5. Ask "¿De dónde eres?" to cross-reference records (recall)
6. Thank them: "¡Muchas gracias! Tu información es muy útil."
7. End warmly: "Tu familia suena encantadora. ¡Gracias por ayudar con el caso!"

MISSION SUCCESS CRITERIA:
- 3 target expressions used = ⭐⭐⭐ "¡Trabajo de detective brillante! ¡Expediente actualizado!"
- 2 target expressions used = ⭐⭐ "¡Buena investigación! ¡Casi tienes todos los detalles!"
- 1 target expression used = ⭐ "¡Buen comienzo! ¡Resolveremos el caso la próxima vez!"

LANGUAGE FOCUS REVIEW: At the end, briefly highlight one expression they used well.

IMPORTANT: Never say "incorrecto" or "mal". Instead say "¡Casi!" or "Te ayudo con eso" or "¡Buen intento! También puedes decir...". Keep all sentences at A1 level. Use {targetLang} throughout.`,
      speechLang: "es-ES",
      suggestedAnswers: [
        "Esta es mi madre.",
        "Tengo dos hermanos.",
        "Mi hermana es doctora.",
        "¡Muchas gracias!",
        "¿De dónde eres?",
      ],
    },
    korean: {
      situation: {
        ko: "루디가 박물관에서 목격자의 신원을 확인하기 위해 가족에 대해 물어보고 있습니다. 가족을 소개하며 대화해보세요!",
        en: "Rudy is asking a witness about their family to verify their identity.",
        es: "Rudy pregunta a un testigo sobre su familia para verificar su identidad.",
      },
      gptPrompt: `You are Rudy, a fox detective at the London Museum. A painting has gone missing, and you need to verify a witness's identity by asking about their family.

DETECTIVE STORY CONTEXT: Someone reported seeing a suspicious person near the missing painting. You found a witness and need to verify who they are by cross-referencing family details with museum visitor records.

PRE-TASK — The learner should practice these 3 target expressions:
1. "이분은 제 ___예요/이에요." (introducing a family member)
2. "___이/가 ___ 명 있어요." (talking about family members)
3. "정말 감사합니다!" (recall from Day 1-2)

ANTICIPATION PROTOCOL:
- After asking a question, wait 3 seconds before offering any help.
- If the user is silent for 5 seconds, gently suggest: "'이분은 제 어머니예요' 또는 '형이 두 명 있어요'처럼 말해보세요..."
- If silent for 10 seconds, use TTS to model the answer naturally.
- If silent for 15 seconds, offer direct help: "이렇게 말해보세요: 이분은 제 어머니예요."

CONVERSATION FLOW:
1. Introduce yourself as Detective Rudy investigating the museum case
2. Ask "가족이 몇 명이에요?" — wait for answer
3. Ask them to introduce family: "가족을 소개해 주세요"
4. React warmly, ask follow-up: "___은/는 무슨 일 하세요?"
5. Ask "어디에서 오셨어요?" to cross-reference records (recall)
6. Thank them: "정말 감사합니다! 정보가 아주 도움이 돼요."
7. End warmly: "가족분들이 멋지시네요. 사건 해결에 도와주셔서 감사합니다!"

MISSION SUCCESS CRITERIA:
- 3 target expressions used = ⭐⭐⭐ "대단해요! 사건 파일 업데이트 완료!"
- 2 target expressions used = ⭐⭐ "좋은 조사였어요! 거의 다 알아냈어요!"
- 1 target expression used = ⭐ "좋은 시작이에요! 다음에 사건을 해결해봐요!"

LANGUAGE FOCUS REVIEW: At the end, briefly highlight one expression they used well.

IMPORTANT: Never say "틀렸어요" or "잘못했어요". Instead say "거의 다 왔어요!" or "제가 도와줄게요" or "좋은 시도예요! 이렇게도 말할 수 있어요...". Keep all sentences at A1 level. Use {targetLang} throughout.`,
      speechLang: "ko-KR",
      suggestedAnswers: [
        "이분은 제 어머니예요.",
        "형이 두 명 있어요.",
        "누나는 의사예요.",
        "정말 감사합니다!",
        "어디에서 오셨어요?",
      ],
    },
  },
};

// =============================================================================
// STEP 4: REVIEW
// =============================================================================

export const REVIEW_CONTENT_V2_D3_4: Record<string, Partial<Record<LearningLangKey, ReviewQuestion[]>>> = {

  // ─────────────── Day 3 Review ──────────────────────────────────────────────
  // First 2 review Day 2 (isYesterdayReview: true), then 3 from today
  day_3: {
    english: [
      {
        type: "speak",
        sentence: "I'm from Korea. I live in Seoul.",
        speechLang: "en-GB",
        meaning: { ko: "저는 한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." },
        isYesterdayReview: true,
      },
      {
        type: "fill_blank",
        promptWithBlank: "Can you say that ___, please?",
        answer: "again",
        options: ["again", "more", "once"],
        fullSentence: "Can you say that again, please?",
        fullSentenceMeaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "I'm a student. I like reading.",
        speechLang: "en-GB",
        meaning: { ko: "저는 학생이에요. 독서를 좋아해요.", en: "I'm a student. I like reading.", es: "Soy estudiante. Me gusta leer." },
      },
      {
        type: "fill_blank",
        promptWithBlank: "Do you ___ English?",
        answer: "speak",
        options: ["speak", "talk", "say"],
        fullSentence: "Do you speak English?",
        fullSentenceMeaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Hablas inglés?" },
      },
      {
        type: "speak",
        sentence: "Nice to meet you! A little bit.",
        speechLang: "en-GB",
        meaning: { ko: "만나서 반갑습니다! 조금이요.", en: "Nice to meet you! A little bit.", es: "¡Mucho gusto! Un poquito." },
      },
    ],
    spanish: [
      {
        type: "speak",
        sentence: "Soy de Corea. Vivo en Seúl.",
        speechLang: "es-ES",
        meaning: { ko: "저는 한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." },
        isYesterdayReview: true,
      },
      {
        type: "fill_blank",
        promptWithBlank: "¿Puede ___ eso, por favor?",
        answer: "repetir",
        options: ["repetir", "decir", "hablar"],
        fullSentence: "¿Puede repetir eso, por favor?",
        fullSentenceMeaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "Soy estudiante. Me gusta leer.",
        speechLang: "es-ES",
        meaning: { ko: "저는 학생이에요. 독서를 좋아해요.", en: "I'm a student. I like reading.", es: "Soy estudiante. Me gusta leer." },
      },
      {
        type: "fill_blank",
        promptWithBlank: "¿___ inglés?",
        answer: "Hablas",
        options: ["Hablas", "Habla", "Hablo"],
        fullSentence: "¿Hablas inglés?",
        fullSentenceMeaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Hablas inglés?" },
      },
      {
        type: "speak",
        sentence: "¡Mucho gusto! Un poquito.",
        speechLang: "es-ES",
        meaning: { ko: "만나서 반갑습니다! 조금이요.", en: "Nice to meet you! A little bit.", es: "¡Mucho gusto! Un poquito." },
      },
    ],
    korean: [
      {
        type: "speak",
        sentence: "저는 한국에서 왔어요. 서울에 살아요.",
        speechLang: "ko-KR",
        meaning: { ko: "저는 한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." },
        isYesterdayReview: true,
      },
      {
        type: "fill_blank",
        promptWithBlank: "다시 한번 ___ 주시겠어요?",
        answer: "말해",
        options: ["말해", "해", "가"],
        fullSentence: "다시 한번 말해 주시겠어요?",
        fullSentenceMeaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "저는 학생이에요. 독서를 좋아해요.",
        speechLang: "ko-KR",
        meaning: { ko: "저는 학생이에요. 독서를 좋아해요.", en: "I'm a student. I like reading.", es: "Soy estudiante. Me gusta leer." },
      },
      {
        type: "fill_blank",
        promptWithBlank: "영어 할 줄 ___?",
        answer: "아세요",
        options: ["아세요", "있어요", "해요"],
        fullSentence: "영어 할 줄 아세요?",
        fullSentenceMeaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Hablas inglés?" },
      },
      {
        type: "speak",
        sentence: "만나서 반갑습니다! 조금이요.",
        speechLang: "ko-KR",
        meaning: { ko: "만나서 반갑습니다! 조금이요.", en: "Nice to meet you! A little bit.", es: "¡Mucho gusto! Un poquito." },
      },
    ],
  },

  // ─────────────── Day 4 Review ──────────────────────────────────────────────
  // First 2 review Day 3 (isYesterdayReview: true), then 3 from today
  day_4: {
    english: [
      {
        type: "speak",
        sentence: "I'm a student. I like reading.",
        speechLang: "en-GB",
        meaning: { ko: "저는 학생이에요. 독서를 좋아해요.", en: "I'm a student. I like reading.", es: "Soy estudiante. Me gusta leer." },
        isYesterdayReview: true,
      },
      {
        type: "fill_blank",
        promptWithBlank: "I like ___.",
        answer: "reading",
        options: ["reading", "read", "reads"],
        fullSentence: "I like reading.",
        fullSentenceMeaning: { ko: "독서를 좋아해요.", en: "I like reading.", es: "Me gusta leer." },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "This is my mother.",
        speechLang: "en-GB",
        meaning: { ko: "이분은 제 어머니예요.", en: "This is my mother.", es: "Esta es mi madre." },
      },
      {
        type: "fill_blank",
        promptWithBlank: "I ___ two brothers.",
        answer: "have",
        options: ["have", "am", "has"],
        fullSentence: "I have two brothers.",
        fullSentenceMeaning: { ko: "형이 두 명 있어요.", en: "I have two brothers.", es: "Tengo dos hermanos." },
      },
      {
        type: "speak",
        sentence: "Thank you very much! Where are you from?",
        speechLang: "en-GB",
        meaning: { ko: "정말 감사합니다! 어디에서 오셨어요?", en: "Thank you very much! Where are you from?", es: "¡Muchas gracias! ¿De dónde eres?" },
      },
    ],
    spanish: [
      {
        type: "speak",
        sentence: "Soy estudiante. Me gusta leer.",
        speechLang: "es-ES",
        meaning: { ko: "저는 학생이에요. 독서를 좋아해요.", en: "I'm a student. I like reading.", es: "Soy estudiante. Me gusta leer." },
        isYesterdayReview: true,
      },
      {
        type: "fill_blank",
        promptWithBlank: "Me ___ leer.",
        answer: "gusta",
        options: ["gusta", "gusto", "gustan"],
        fullSentence: "Me gusta leer.",
        fullSentenceMeaning: { ko: "독서를 좋아해요.", en: "I like reading.", es: "Me gusta leer." },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "Esta es mi madre.",
        speechLang: "es-ES",
        meaning: { ko: "이분은 제 어머니예요.", en: "This is my mother.", es: "Esta es mi madre." },
      },
      {
        type: "fill_blank",
        promptWithBlank: "___ dos hermanos.",
        answer: "Tengo",
        options: ["Tengo", "Tiene", "Tenemos"],
        fullSentence: "Tengo dos hermanos.",
        fullSentenceMeaning: { ko: "형이 두 명 있어요.", en: "I have two brothers.", es: "Tengo dos hermanos." },
      },
      {
        type: "speak",
        sentence: "¡Muchas gracias! ¿De dónde eres?",
        speechLang: "es-ES",
        meaning: { ko: "정말 감사합니다! 어디에서 오셨어요?", en: "Thank you very much! Where are you from?", es: "¡Muchas gracias! ¿De dónde eres?" },
      },
    ],
    korean: [
      {
        type: "speak",
        sentence: "저는 학생이에요. 독서를 좋아해요.",
        speechLang: "ko-KR",
        meaning: { ko: "저는 학생이에요. 독서를 좋아해요.", en: "I'm a student. I like reading.", es: "Soy estudiante. Me gusta leer." },
        isYesterdayReview: true,
      },
      {
        type: "fill_blank",
        promptWithBlank: "독서___ 좋아해요.",
        answer: "를",
        options: ["를", "을", "이"],
        fullSentence: "독서를 좋아해요.",
        fullSentenceMeaning: { ko: "독서를 좋아해요.", en: "I like reading.", es: "Me gusta leer." },
        isYesterdayReview: true,
      },
      {
        type: "speak",
        sentence: "이분은 제 어머니예요.",
        speechLang: "ko-KR",
        meaning: { ko: "이분은 제 어머니예요.", en: "This is my mother.", es: "Esta es mi madre." },
      },
      {
        type: "fill_blank",
        promptWithBlank: "형이 두 ___ 있어요.",
        answer: "명",
        options: ["명", "개", "번"],
        fullSentence: "형이 두 명 있어요.",
        fullSentenceMeaning: { ko: "형이 두 명 있어요.", en: "I have two brothers.", es: "Tengo dos hermanos." },
      },
      {
        type: "speak",
        sentence: "정말 감사합니다! 어디에서 오셨어요?",
        speechLang: "ko-KR",
        meaning: { ko: "정말 감사합니다! 어디에서 오셨어요?", en: "Thank you very much! Where are you from?", es: "¡Muchas gracias! ¿De dónde eres?" },
      },
    ],
  },
};
