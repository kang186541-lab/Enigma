/**
 * NEW Day 25-30 Content (Unit 5: People & Social)
 *
 * Day 25: Family & People
 * Day 26: Describing People
 * Day 27: Hobbies & Free Time
 * Day 28: Feelings & Emotions
 * Day 29: Making Plans
 * Day 30: Final Review + A1 Complete Celebration
 *
 * Each day has:
 * - STEP 1: 5-6 sentences (Listen & Repeat)
 * - STEP 2: 4-5 quizzes (mix of select + input)
 * - STEP 3: Mission Talk GPT prompt + suggested answers
 * - STEP 4: 5 review questions (mix of speak + fill_blank, with yesterday review)
 *
 * Story connection: Chapter 5 (Babel Tower) requires social vocabulary.
 * Users who complete Day 25-30 can handle Babel Tower's social puzzles.
 */

import type { Tri } from "../../lib/dailyCourseData";
import type {
  DayLessonData,
  GrammarExplanation,
  MissionTalkLangData,
  ReviewQuestion,
  LearningLangKey,
} from "../../lib/lessonContent";

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1 + STEP 2 (LESSON_CONTENT)
// ═══════════════════════════════════════════════════════════════════════════════

export const LESSON_CONTENT_UNIT5: Record<string, Partial<Record<LearningLangKey, DayLessonData>>> = {

  // ─────────────── Day 25: Family & People ─────────────────────────────────
  day_25: {
    english: {
      step1Sentences: [
        { text: "This is my family.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "이것은 제 가족이에요.", en: "This is my family.", es: "Esta es mi familia." } },
        { text: "I have two brothers and one sister.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "저는 형제 둘과 자매 하나가 있어요.", en: "I have two brothers and one sister.", es: "Tengo dos hermanos y una hermana." } },
        { text: "My mother is a teacher.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "저의 어머니는 선생님이에요.", en: "My mother is a teacher.", es: "Mi madre es profesora." } },
        { text: "My father works at a hospital.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "저의 아버지는 병원에서 일해요.", en: "My father works at a hospital.", es: "Mi padre trabaja en un hospital." }, recallRound: true },
        { text: "Do you have any children?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "자녀가 있으세요?", en: "Do you have any children?", es: "¿Tienes hijos?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "가족 소개: 'This is my ___' / 가족 수: 'I have ___ brothers/sisters' / 직업: 'My ___ is a ___' 또는 'works at a ___'", en: "'This is my ___' → introduce family / 'I have ___ brothers/sisters' → count / 'My ___ is a ___' or 'works at a ___' → jobs", es: "'This is my ___' → presentar familia / 'I have ___ brothers/sisters' → contar / 'My ___ is a ___' o 'works at a ___' → trabajos" },
          examples: { ko: "This is my mother. / I have one sister and two brothers. / My father works at a bank.", en: "This is my mother. / I have one sister and two brothers. / My father works at a bank.", es: "This is my mother. / I have one sister and two brothers. / My father works at a bank." },
          mistakes: { ko: "❌ This is my the family.\n✅ This is my family.\n\n❌ I have two sister.\n✅ I have two sisters.", en: "❌ This is my the family.\n✅ This is my family.\n\n❌ I have two sister.\n✅ I have two sisters.", es: "❌ This is my the family.\n✅ This is my family.\n\n❌ I have two sister.\n✅ I have two sisters." },
          rudyTip: { ko: "가족 소개는 'This is my ___' 하나면 끝! 형제자매 수는 복수형 잊지 마, brothers처럼 s 붙이는 거야!", en: "Family intros are easy — 'This is my ___' covers it all! Just remember: brothers, sisters — always plural with numbers!", es: "Presentar familia es fácil: 'This is my ___'. Y recuerda: brothers, sisters — siempre plural con números." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "This is my ___.", answer: "family", options: ["family", "friend", "house"], fullSentence: "This is my family.", fullSentenceMeaning: { ko: "이것은 제 가족이에요.", en: "This is my family.", es: "Esta es mi familia." } },
          { type: "select", promptWithBlank: "I have two ___ and one sister.", answer: "brothers", options: ["brothers", "friends", "teachers"], fullSentence: "I have two brothers and one sister.", fullSentenceMeaning: { ko: "형제 둘과 자매 하나.", en: "Two brothers and one sister.", es: "Dos hermanos y una hermana." } },
          { type: "select", promptWithBlank: "My mother is a ___.", answer: "teacher", options: ["teacher", "student", "doctor"], fullSentence: "My mother is a teacher.", fullSentenceMeaning: { ko: "어머니는 선생님.", en: "My mother is a teacher.", es: "Mi madre es profesora." } },
          { type: "input", promptWithBlank: "My father ___ at a hospital.", answer: "works", fullSentence: "My father works at a hospital.", fullSentenceMeaning: { ko: "아버지는 병원에서 일해요.", en: "My father works at a hospital.", es: "Mi padre trabaja en un hospital." } },
          { type: "input", promptWithBlank: "Do you have any ___?", answer: "children", fullSentence: "Do you have any children?", fullSentenceMeaning: { ko: "자녀가 있으세요?", en: "Do you have any children?", es: "¿Tienes hijos?" } },
          { type: "listening", audioText: "Do you have any children?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Do you have any children?", "This is my family.", "I have two brothers and one sister.", "My mother is a teacher."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "My name is Rudy.", es: "Mi nombre es Rudy.", ko: "제 이름은 루디예요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Nice to meet you.", es: "Encantado de conocerle.", ko: "만나서 반가워요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "Esta es mi familia.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "이것은 제 가족이에요.", en: "This is my family.", es: "Esta es mi familia." } },
        { text: "Tengo dos hermanos y una hermana.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "형제 둘과 자매 하나가 있어요.", en: "I have two brothers and one sister.", es: "Tengo dos hermanos y una hermana." } },
        { text: "Mi madre es profesora.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "어머니는 선생님이에요.", en: "My mother is a teacher.", es: "Mi madre es profesora." } },
        { text: "Mi padre trabaja en un hospital.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "아버지는 병원에서 일해요.", en: "My father works at a hospital.", es: "Mi padre trabaja en un hospital." }, recallRound: true },
        { text: "¿Tienes hijos?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "자녀가 있으세요?", en: "Do you have any children?", es: "¿Tienes hijos?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "가족 소개: 'Esta es mi ___' / 가족 수: 'Tengo ___ hermanos/hermanas' / 직업: 'Mi ___ es ___' 또는 'trabaja en ___'", en: "'Esta es mi ___' → introduce family / 'Tengo ___ hermanos/hermanas' → count / 'Mi ___ es ___' or 'trabaja en ___' → jobs", es: "'Esta es mi ___' → presentar familia / 'Tengo ___ hermanos/hermanas' → contar / 'Mi ___ es ___' o 'trabaja en ___' → trabajos" },
          examples: { ko: "Esta es mi madre. / Tengo una hermana y dos hermanos. / Mi padre trabaja en un banco.", en: "Esta es mi madre. / Tengo una hermana y dos hermanos. / Mi padre trabaja en un banco.", es: "Esta es mi madre. / Tengo una hermana y dos hermanos. / Mi padre trabaja en un banco." },
          mistakes: { ko: "❌ Este es mi madre.\n✅ Esta es mi madre.\n\n❌ Tengo dos hermano.\n✅ Tengo dos hermanos.", en: "❌ Este es mi madre.\n✅ Esta es mi madre. (feminine 'esta' for women)\n\n❌ Tengo dos hermano.\n✅ Tengo dos hermanos. (plural needed)", es: "❌ Este es mi madre.\n✅ Esta es mi madre. (femenino con 'esta')\n\n❌ Tengo dos hermano.\n✅ Tengo dos hermanos. (plural con números)" },
          rudyTip: { ko: "스페인어에선 성별이 중요해! 엄마는 'Esta es mi madre', 아빠는 'Este es mi padre' — 이것/이것이 달라져!", en: "Gender matters in Spanish! Mom = 'Esta es mi madre', Dad = 'Este es mi padre'. The 'this' changes with gender!", es: "El género importa: mamá = 'Esta es mi madre', papá = 'Este es mi padre'. El demostrativo cambia con el género." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Esta es mi ___.", answer: "familia", options: ["familia", "amiga", "casa"], fullSentence: "Esta es mi familia.", fullSentenceMeaning: { ko: "이것은 제 가족.", en: "This is my family.", es: "Esta es mi familia." } },
          { type: "select", promptWithBlank: "Tengo dos ___ y una hermana.", answer: "hermanos", options: ["hermanos", "amigos", "profesores"], fullSentence: "Tengo dos hermanos y una hermana.", fullSentenceMeaning: { ko: "형제 둘, 자매 하나.", en: "Two brothers, one sister.", es: "Dos hermanos, una hermana." } },
          { type: "select", promptWithBlank: "Mi madre es ___.", answer: "profesora", options: ["profesora", "estudiante", "doctora"], fullSentence: "Mi madre es profesora.", fullSentenceMeaning: { ko: "어머니는 선생님.", en: "My mother is a teacher.", es: "Mi madre es profesora." } },
          { type: "input", promptWithBlank: "Mi padre ___ en un hospital.", answer: "trabaja", fullSentence: "Mi padre trabaja en un hospital.", fullSentenceMeaning: { ko: "아버지는 병원에서 일해요.", en: "Father works at hospital.", es: "Padre trabaja en hospital." } },
          { type: "input", promptWithBlank: "¿Tienes ___?", answer: "hijos", fullSentence: "¿Tienes hijos?", fullSentenceMeaning: { ko: "자녀 있으세요?", en: "Do you have children?", es: "¿Tienes hijos?" } },
          { type: "listening", audioText: "¿Tienes hijos?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["¿Tienes hijos?", "Esta es mi familia.", "Tengo dos hermanos y una hermana.", "Mi madre es profesora."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "My name is Rudy.", es: "Mi nombre es Rudy.", ko: "제 이름은 루디예요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Nice to meet you.", es: "Encantado de conocerle.", ko: "만나서 반가워요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "이것은 제 가족이에요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "이것은 제 가족이에요.", en: "This is my family.", es: "Esta es mi familia." } },
        { text: "저는 남자 형제가 둘, 여자 형제가 하나 있어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "남자 형제 둘, 여자 형제 하나 있어요.", en: "I have two brothers and one sister.", es: "Tengo dos hermanos y una hermana." } },
        { text: "저의 어머니는 선생님이에요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "어머니는 선생님.", en: "My mother is a teacher.", es: "Mi madre es profesora." } },
        { text: "저의 아버지는 병원에서 일해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "아버지는 병원에서 일해요.", en: "My father works at a hospital.", es: "Mi padre trabaja en un hospital." }, recallRound: true },
        { text: "자녀가 있으세요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "자녀가 있으세요?", en: "Do you have any children?", es: "¿Tienes hijos?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "가족 소개: '이것은 제 ___이에요' / 가족 수: '___이/가 ___명 있어요' / 직업: '___는/은 ___이에요' 또는 '___에서 일해요'", en: "'이것은 제 ___이에요' → introduce family / '___이/가 ___명 있어요' → count / '___는/은 ___이에요' or '___에서 일해요' → jobs", es: "'이것은 제 ___이에요' → presentar familia / '___이/가 ___명 있어요' → contar / '___는/은 ___이에요' o '___에서 일해요' → trabajos" },
          examples: { ko: "이것은 제 어머니예요. / 언니가 한 명 있어요. / 아버지는 은행에서 일해요.", en: "이것은 제 어머니예요. / 언니가 한 명 있어요. / 아버지는 은행에서 일해요.", es: "이것은 제 어머니예요. / 언니가 한 명 있어요. / 아버지는 은행에서 일해요." },
          mistakes: { ko: "❌ 형제가 두 있어요.\n✅ 형제가 둘 있어요.\n\n❌ 어머니는 선생님이요.\n✅ 어머니는 선생님이에요.", en: "❌ 형제가 두 있어요.\n✅ 형제가 둘 있어요. (use 둘 not 두 when counting alone)\n\n❌ 어머니는 선생님이요.\n✅ 어머니는 선생님이에요. (need 에 before 요)", es: "❌ 형제가 두 있어요.\n✅ 형제가 둘 있어요. (usa 둘 no 두 al contar solo)\n\n❌ 어머니는 선생님이요.\n✅ 어머니는 선생님이에요. (necesitas 에 antes de 요)" },
          rudyTip: { ko: "한국어 숫자가 헷갈려? 혼자 쓸 때는 '둘', 명 앞에서는 '두 명' — 이 규칙만 알면 가족 수 세기 완벽해!", en: "Korean numbers tricky? Use 둘 alone, but 두 명 before counters. Get this rule down and counting family is a breeze!", es: "Los números coreanos confunden. Usa 둘 solo, pero 두 명 con contadores. Domina esta regla y contar familia será fácil." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "이것은 제 ___이에요.", answer: "가족", options: ["가족", "친구", "집"], fullSentence: "이것은 제 가족이에요.", fullSentenceMeaning: { ko: "이것은 제 가족.", en: "This is my family.", es: "Esta es mi familia." } },
          { type: "select", promptWithBlank: "남자 형제가 ___명 있어요.", answer: "둘", options: ["둘", "셋", "하나"], fullSentence: "남자 형제가 둘 있어요.", fullSentenceMeaning: { ko: "남자 형제가 둘 있어요.", en: "I have two brothers.", es: "Tengo dos hermanos." } },
          { type: "select", promptWithBlank: "어머니는 ___이에요.", answer: "선생님", options: ["선생님", "학생", "의사"], fullSentence: "어머니는 선생님이에요.", fullSentenceMeaning: { ko: "어머니는 선생님.", en: "Mother is a teacher.", es: "Madre es profesora." } },
          { type: "input", promptWithBlank: "아버지는 병원에서 ___요.", answer: "일해", fullSentence: "아버지는 병원에서 일해요.", fullSentenceMeaning: { ko: "아버지는 병원에서 일해요.", en: "Father works at hospital.", es: "Padre trabaja en hospital." } },
          { type: "input", promptWithBlank: "___가 있으세요?", answer: "자녀", fullSentence: "자녀가 있으세요?", fullSentenceMeaning: { ko: "자녀가 있으세요?", en: "Have children?", es: "¿Tienes hijos?" } },
          { type: "listening", audioText: "자녀가 있으세요?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["자녀가 있으세요?", "이것은 제 가족이에요.", "저는 남자 형제가 둘, 여자 형제가 하나 있어요.", "저의 어머니는 선생님이에요."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "My name is Rudy.", es: "Mi nombre es Rudy.", ko: "제 이름은 루디예요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Nice to meet you.", es: "Encantado de conocerle.", ko: "만나서 반가워요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
  },

  // ─────────────── Day 26: Describing People ───────────────────────────────
  day_26: {
    english: {
      step1Sentences: [
        { text: "She is tall and has long hair.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "그녀는 키가 크고 머리카락이 길어요.", en: "She is tall and has long hair.", es: "Ella es alta y tiene el pelo largo." } },
        { text: "He is wearing a blue jacket.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "그는 파란색 재킷을 입고 있어요.", en: "He is wearing a blue jacket.", es: "Él lleva una chaqueta azul." } },
        { text: "My friend is very kind.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "제 친구는 매우 친절해요.", en: "My friend is very kind.", es: "Mi amigo es muy amable." } },
        { text: "The man with glasses is my teacher.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "안경 쓴 남자가 제 선생님이에요.", en: "The man with glasses is my teacher.", es: "El hombre con gafas es mi profesor." }, recallRound: true },
        { text: "She is very tall and has long hair.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "그녀는 키가 크고 머리가 길어요.", en: "She is very tall and has long hair.", es: "Ella es muy alta y tiene el pelo largo." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "외모: 'She/He is ___' (tall, short) / 옷: 'is wearing a ___' / 특징: 'the man/woman with ___' / 성격: 'She/He is very ___'", en: "'She/He is ___' → appearance / 'is wearing a ___' → clothes / 'the man/woman with ___' → identifying features / 'She/He is very ___' → personality", es: "'She/He is ___' → apariencia / 'is wearing a ___' → ropa / 'the man/woman with ___' → rasgos / 'She/He is very ___' → personalidad" },
          examples: { ko: "She is tall and has brown hair. / He is wearing a red shirt. / The woman with the hat is my friend.", en: "She is tall and has brown hair. / He is wearing a red shirt. / The woman with the hat is my friend.", es: "She is tall and has brown hair. / He is wearing a red shirt. / The woman with the hat is my friend." },
          mistakes: { ko: "❌ He is wear a jacket.\n✅ He is wearing a jacket.\n\n❌ She is has long hair.\n✅ She has long hair.", en: "❌ He is wear a jacket.\n✅ He is wearing a jacket. (need -ing for present continuous)\n\n❌ She is has long hair.\n✅ She has long hair. (don't combine 'is' + 'has')", es: "❌ He is wear a jacket.\n✅ He is wearing a jacket. (necesitas -ing)\n\n❌ She is has long hair.\n✅ She has long hair. (no combines 'is' + 'has')" },
          rudyTip: { ko: "사람 찾을 때 핵심 세 가지: 키(tall/short), 옷(wearing), 특징(with glasses)! 이 세 개면 누구든 찾을 수 있어!", en: "Three keys to spot anyone: height (tall/short), clothes (wearing), features (with glasses). Master these and you're a detective!", es: "Tres claves para identificar: altura (tall/short), ropa (wearing), rasgos (with glasses). Con estas tres eres detective." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "She is tall and has ___ hair.", answer: "long", options: ["long", "big", "many"], fullSentence: "She is tall and has long hair.", fullSentenceMeaning: { ko: "키 크고 머리 길어요.", en: "Tall with long hair.", es: "Alta con pelo largo." } },
          { type: "select", promptWithBlank: "He is ___ a blue jacket.", answer: "wearing", options: ["wearing", "having", "doing"], fullSentence: "He is wearing a blue jacket.", fullSentenceMeaning: { ko: "파란 재킷 입고 있어요.", en: "Wearing a blue jacket.", es: "Lleva chaqueta azul." } },
          { type: "select", promptWithBlank: "My friend is very ___.", answer: "kind", options: ["kind", "tall", "blue"], fullSentence: "My friend is very kind.", fullSentenceMeaning: { ko: "친구는 매우 친절해요.", en: "My friend is very kind.", es: "Mi amigo es muy amable." } },
          { type: "input", promptWithBlank: "The man with ___ is my teacher.", answer: "glasses", fullSentence: "The man with glasses is my teacher.", fullSentenceMeaning: { ko: "안경 쓴 남자가 선생님.", en: "Man with glasses is teacher.", es: "Hombre con gafas es profesor." } },
          { type: "input", promptWithBlank: "She is very ___ and has long hair.", answer: "tall", fullSentence: "She is very tall and has long hair.", fullSentenceMeaning: { ko: "그녀는 키가 크고 머리가 길어요.", en: "She is very tall and has long hair.", es: "Ella es muy alta y tiene el pelo largo." } },
          { type: "listening", audioText: "She is very tall and has long hair.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["She is very tall and has long hair.", "He is wearing a blue jacket.", "My friend is very kind.", "The man with glasses is my teacher."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "That's fifteen dollars, please.", es: "Son quince dólares, por favor.", ko: "15달러예요." }, fromDay: 6, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "How much does it cost?", es: "¿Cuánto cuesta?", ko: "얼마예요?" }, fromDay: 6, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "Ella es alta y tiene el pelo largo.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "키 크고 머리 길어요.", en: "She is tall and has long hair.", es: "Ella es alta y tiene el pelo largo." } },
        { text: "Él lleva una chaqueta azul.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "파란 재킷 입고 있어요.", en: "He is wearing a blue jacket.", es: "Él lleva una chaqueta azul." } },
        { text: "Mi amigo es muy amable.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "친구는 매우 친절해요.", en: "My friend is very kind.", es: "Mi amigo es muy amable." } },
        { text: "El hombre con gafas es mi profesor.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "안경 쓴 남자가 선생님.", en: "The man with glasses is my teacher.", es: "El hombre con gafas es mi profesor." }, recallRound: true },
        { text: "Ella es muy alta y tiene el pelo largo.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "그녀는 키가 크고 머리가 길어요.", en: "She is very tall and has long hair.", es: "Ella es muy alta y tiene el pelo largo." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "외모: 'Ella/Él es ___' (alto/a, bajo/a) / 옷: 'lleva un/una ___' / 특징: 'el hombre/la mujer con ___' / 나이: 'tiene ___ años'", en: "'Ella/Él es ___' → appearance / 'lleva un/una ___' → clothes / 'el hombre/la mujer con ___' → features / 'tiene ___ años' → age", es: "'Ella/Él es ___' → apariencia / 'lleva un/una ___' → ropa / 'el hombre/la mujer con ___' → rasgos / 'tiene ___ años' → edad" },
          examples: { ko: "Ella es alta y tiene el pelo castaño. / Él lleva una camisa roja. / La mujer con el sombrero es mi amiga.", en: "Ella es alta y tiene el pelo castaño. / Él lleva una camisa roja. / La mujer con el sombrero es mi amiga.", es: "Ella es alta y tiene el pelo castaño. / Él lleva una camisa roja. / La mujer con el sombrero es mi amiga." },
          mistakes: { ko: "❌ Ella es alto.\n✅ Ella es alta.\n\n❌ Él lleva una chaqueta azula.\n✅ Él lleva una chaqueta azul.", en: "❌ Ella es alto.\n✅ Ella es alta. (adjective must match gender: -o → -a)\n\n❌ Él lleva una chaqueta azula.\n✅ Él lleva una chaqueta azul. (azul doesn't change)", es: "❌ Ella es alto.\n✅ Ella es alta. (adjetivo debe concordar: -o → -a)\n\n❌ Él lleva una chaqueta azula.\n✅ Él lleva una chaqueta azul. (azul no cambia)" },
          rudyTip: { ko: "스페인어 묘사의 핵심: 형용사 성별 일치! 남자 alto, 여자 alta. 하지만 azul 같은 건 안 변해 — 이게 함정이야!", en: "Key to Spanish descriptions: adjective gender! Man = alto, woman = alta. But colors like azul stay the same — that's the trap!", es: "La clave: concordancia de género. Hombre = alto, mujer = alta. Pero colores como azul no cambian. Esa es la trampa." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Ella es alta y tiene el pelo ___.", answer: "largo", options: ["largo", "grande", "mucho"], fullSentence: "Ella es alta y tiene el pelo largo.", fullSentenceMeaning: { ko: "키 크고 머리 길어요.", en: "Tall with long hair.", es: "Alta, pelo largo." } },
          { type: "select", promptWithBlank: "Él ___ una chaqueta azul.", answer: "lleva", options: ["lleva", "tiene", "hace"], fullSentence: "Él lleva una chaqueta azul.", fullSentenceMeaning: { ko: "파란 재킷 입고 있어요.", en: "Wearing blue jacket.", es: "Lleva chaqueta azul." } },
          { type: "select", promptWithBlank: "Mi amigo es muy ___.", answer: "amable", options: ["amable", "alto", "azul"], fullSentence: "Mi amigo es muy amable.", fullSentenceMeaning: { ko: "친구는 매우 친절.", en: "Friend is very kind.", es: "Amigo muy amable." } },
          { type: "input", promptWithBlank: "El hombre con ___ es mi profesor.", answer: "gafas", fullSentence: "El hombre con gafas es mi profesor.", fullSentenceMeaning: { ko: "안경 쓴 남자가 선생님.", en: "Man with glasses is teacher.", es: "Hombre con gafas, profesor." } },
          { type: "input", promptWithBlank: "Ella es muy ___ y tiene el pelo largo.", answer: "alta", fullSentence: "Ella es muy alta y tiene el pelo largo.", fullSentenceMeaning: { ko: "그녀는 키가 크고 머리가 길어요.", en: "She is very tall and has long hair.", es: "Ella es muy alta y tiene el pelo largo." } },
          { type: "listening", audioText: "Ella es muy alta y tiene el pelo largo.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Ella es muy alta y tiene el pelo largo.", "Él lleva una chaqueta azul.", "Mi amigo es muy amable.", "El hombre con gafas es mi profesor."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "That's fifteen dollars, please.", es: "Son quince dólares, por favor.", ko: "15달러예요." }, fromDay: 6, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "How much does it cost?", es: "¿Cuánto cuesta?", ko: "얼마예요?" }, fromDay: 6, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "그녀는 키가 크고 머리가 길어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "키 크고 머리 길어요.", en: "She is tall with long hair.", es: "Alta con pelo largo." } },
        { text: "그는 파란색 재킷을 입고 있어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "파란 재킷 입고 있어요.", en: "He is wearing a blue jacket.", es: "Lleva chaqueta azul." } },
        { text: "제 친구는 매우 친절해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "친구는 매우 친절해요.", en: "My friend is very kind.", es: "Mi amigo es muy amable." } },
        { text: "안경 쓴 남자가 제 선생님이에요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "안경 쓴 남자가 선생님.", en: "Man with glasses is my teacher.", es: "Hombre con gafas es mi profesor." }, recallRound: true },
        { text: "그녀는 키가 크고 머리가 길어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "그녀는 키가 크고 머리가 길어요.", en: "She is very tall and has long hair.", es: "Ella es muy alta y tiene el pelo largo." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "외모: '___는/은 키가 크다/작다' / 옷: '___을/를 입고 있어요' / 특징: '___쓴/한 사람' / 나이: '___ 살이에요'", en: "'___는/은 키가 크다/작다' → height / '___을/를 입고 있어요' → clothes / '___쓴/한 사람' → features / '___ 살이에요' → age", es: "'___는/은 키가 크다/작다' → altura / '___을/를 입고 있어요' → ropa / '___쓴/한 사람' → rasgos / '___ 살이에요' → edad" },
          examples: { ko: "그녀는 키가 크고 머리가 갈색이에요. / 그는 빨간 셔츠를 입고 있어요. / 모자 쓴 여자가 제 친구예요.", en: "그녀는 키가 크고 머리가 갈색이에요. / 그는 빨간 셔츠를 입고 있어요. / 모자 쓴 여자가 제 친구예요.", es: "그녀는 키가 크고 머리가 갈색이에요. / 그는 빨간 셔츠를 입고 있어요. / 모자 쓴 여자가 제 친구예요." },
          mistakes: { ko: "❌ 재킷을 입어 있어요.\n✅ 재킷을 입고 있어요.\n\n❌ 안경 쓰는 남자.\n✅ 안경 쓴 남자.", en: "❌ 재킷을 입어 있어요.\n✅ 재킷을 입고 있어요. (use -고 있어요 for ongoing state)\n\n❌ 안경 쓰는 남자.\n✅ 안경 쓴 남자. (past form 쓴 for describing features)", es: "❌ 재킷을 입어 있어요.\n✅ 재킷을 입고 있어요. (usa -고 있어요 para estado actual)\n\n❌ 안경 쓰는 남자.\n✅ 안경 쓴 남자. (forma pasada 쓴 para rasgos)" },
          rudyTip: { ko: "사람 묘사의 꿀팁! 옷은 '-고 있어요', 특징은 과거형 '-ㄴ/은'을 써! '안경 쓴 남자' 이렇게 말하면 찰떡이야!", en: "Description shortcut: clothes use -고 있어요, features use past form -ㄴ/은. '안경 쓴 남자' sounds super natural!", es: "Atajo: ropa usa -고 있어요, rasgos usan forma pasada -ㄴ/은. '안경 쓴 남자' suena muy natural." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "그녀는 키가 크고 머리가 ___요.", answer: "길어", options: ["길어", "커요", "많아"], fullSentence: "그녀는 키가 크고 머리가 길어요.", fullSentenceMeaning: { ko: "키 크고 머리 길어요.", en: "Tall, long hair.", es: "Alta, pelo largo." } },
          { type: "select", promptWithBlank: "파란색 재킷을 ___ 있어요.", answer: "입고", options: ["입고", "하고", "먹고"], fullSentence: "파란색 재킷을 입고 있어요.", fullSentenceMeaning: { ko: "파란 재킷 입고 있어요.", en: "Wearing blue jacket.", es: "Lleva chaqueta azul." } },
          { type: "select", promptWithBlank: "친구는 매우 ___해요.", answer: "친절", options: ["친절", "키가", "파란"], fullSentence: "친구는 매우 친절해요.", fullSentenceMeaning: { ko: "친구는 매우 친절.", en: "Friend is very kind.", es: "Amigo muy amable." } },
          { type: "input", promptWithBlank: "___ 쓴 남자가 선생님이에요.", answer: "안경", fullSentence: "안경 쓴 남자가 선생님이에요.", fullSentenceMeaning: { ko: "안경 쓴 남자가 선생님.", en: "Man with glasses is teacher.", es: "Hombre con gafas, profesor." } },
          { type: "input", promptWithBlank: "그녀는 키가 크고 ___가 길어요.", answer: "머리", fullSentence: "그녀는 키가 크고 머리가 길어요.", fullSentenceMeaning: { ko: "그녀는 키가 크고 머리가 길어요.", en: "She is very tall and has long hair.", es: "Ella es muy alta y tiene el pelo largo." } },
          { type: "listening", audioText: "그녀는 키가 크고 머리가 길어요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["그녀는 키가 크고 머리가 길어요.", "그는 파란색 재킷을 입고 있어요.", "제 친구는 매우 친절해요.", "안경 쓴 남자가 제 선생님이에요."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "That's fifteen dollars, please.", es: "Son quince dólares, por favor.", ko: "15달러예요." }, fromDay: 6, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "How much does it cost?", es: "¿Cuánto cuesta?", ko: "얼마예요?" }, fromDay: 6, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
  },

  // ─────────────── Day 27: Hobbies & Free Time ─────────────────────────────
  day_27: {
    english: {
      step1Sentences: [
        { text: "What do you like to do in your free time?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "여가 시간에 뭘 좋아하세요?", en: "What do you like to do in your free time?", es: "¿Qué te gusta hacer en tu tiempo libre?" } },
        { text: "I like reading books and watching movies.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "저는 책 읽기와 영화 보기를 좋아해요.", en: "I like reading books and watching movies.", es: "Me gusta leer libros y ver películas." } },
        { text: "Do you play any sports?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "스포츠를 하세요?", en: "Do you play any sports?", es: "¿Practicas algún deporte?" } },
        { text: "I play football every weekend.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "매주 주말에 축구를 해요.", en: "I play football every weekend.", es: "Juego al fútbol todos los fines de semana." }, recallRound: true },
        { text: "My hobby is cooking.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "제 취미는 요리에요.", en: "My hobby is cooking.", es: "Mi hobby es cocinar." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "취미 질문: 'What do you like to do?' / 대답: 'I like ___ing' / 스포츠: 'I play ___' / 취미: 'My hobby is ___'", en: "'What do you like to do?' → ask hobbies / 'I like ___ing' → answer / 'I play ___' → sports / 'My hobby is ___' → hobbies", es: "'What do you like to do?' → preguntar hobbies / 'I like ___ing' → responder / 'I play ___' → deportes / 'My hobby is ___' → hobbies" },
          examples: { ko: "I like swimming in the summer. / I play tennis on Saturdays. / My hobby is drawing.", en: "I like swimming in the summer. / I play tennis on Saturdays. / My hobby is drawing.", es: "I like swimming in the summer. / I play tennis on Saturdays. / My hobby is drawing." },
          mistakes: { ko: "❌ I like swim.\n✅ I like swimming.\n\n❌ I play the cooking.\n✅ My hobby is cooking.", en: "❌ I like swim.\n✅ I like swimming. (need -ing after 'like')\n\n❌ I play the cooking.\n✅ My hobby is cooking. ('play' is for sports only)", es: "❌ I like swim.\n✅ I like swimming. (necesitas -ing después de 'like')\n\n❌ I play the cooking.\n✅ My hobby is cooking. ('play' solo para deportes)" },
          rudyTip: { ko: "'I like' 뒤에는 항상 -ing! swimming, reading, cooking 이렇게. 스포츠는 'play'만 쓰고, 요리 같은 취미는 'My hobby is'로!", en: "After 'I like', always add -ing! swimming, reading, cooking. Use 'play' only for sports — for hobbies like cooking, say 'My hobby is'!", es: "Después de 'I like', siempre -ing: swimming, reading, cooking. 'Play' solo para deportes. Para hobbies: 'My hobby is'." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "What do you like to ___ in your free time?", answer: "do", options: ["do", "go", "make"], fullSentence: "What do you like to do in your free time?", fullSentenceMeaning: { ko: "여가에 뭘 좋아하세요?", en: "What do you like to do?", es: "¿Qué te gusta hacer?" } },
          { type: "select", promptWithBlank: "I like ___ books.", answer: "reading", options: ["reading", "doing", "playing"], fullSentence: "I like reading books.", fullSentenceMeaning: { ko: "책 읽기를 좋아해요.", en: "I like reading books.", es: "Me gusta leer libros." } },
          { type: "select", promptWithBlank: "I ___ football every weekend.", answer: "play", options: ["play", "do", "read"], fullSentence: "I play football every weekend.", fullSentenceMeaning: { ko: "매주 주말 축구해요.", en: "I play football every weekend.", es: "Juego fútbol cada fin de semana." } },
          { type: "input", promptWithBlank: "Do you play any ___?", answer: "sports", fullSentence: "Do you play any sports?", fullSentenceMeaning: { ko: "스포츠 하세요?", en: "Do you play sports?", es: "¿Practicas deportes?" } },
          { type: "input", promptWithBlank: "My ___ is cooking.", answer: "hobby", fullSentence: "My hobby is cooking.", fullSentenceMeaning: { ko: "취미는 요리.", en: "My hobby is cooking.", es: "Mi hobby es cocinar." } },
          { type: "listening", audioText: "My hobby is cooking.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["My hobby is cooking.", "What do you like to do in your free time?", "I like reading books and watching movies.", "Do you play any sports?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "I would like to order, please.", es: "Quisiera pedir, por favor.", ko: "주문할게요." }, fromDay: 11, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Are you hungry?", es: "¿Tienes hambre?", ko: "배고프세요?" }, fromDay: 11, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "¿Qué te gusta hacer en tu tiempo libre?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "여가에 뭘 좋아하세요?", en: "What do you like to do in your free time?", es: "¿Qué te gusta hacer en tu tiempo libre?" } },
        { text: "Me gusta leer libros y ver películas.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "책 읽기와 영화 보기를 좋아해요.", en: "I like reading books and watching movies.", es: "Me gusta leer libros y ver películas." } },
        { text: "¿Practicas algún deporte?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "스포츠 하세요?", en: "Do you play any sports?", es: "¿Practicas algún deporte?" } },
        { text: "Juego al fútbol todos los fines de semana.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "매주 주말 축구해요.", en: "I play football every weekend.", es: "Juego al fútbol todos los fines de semana." }, recallRound: true },
        { text: "Mi hobby es cocinar.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "취미는 요리.", en: "My hobby is cooking.", es: "Mi hobby es cocinar." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "취미 질문: '¿Qué te gusta hacer?' / 대답: 'Me gusta + 동사원형' / 스포츠: 'Juego al ___' / 취미: 'Mi hobby es ___'", en: "'¿Qué te gusta hacer?' → ask hobbies / 'Me gusta + infinitive' → answer / 'Juego al ___' → sports / 'Mi hobby es ___' → hobbies", es: "'¿Qué te gusta hacer?' → preguntar / 'Me gusta + infinitivo' → responder / 'Juego al ___' → deportes / 'Mi hobby es ___' → hobby" },
          examples: { ko: "Me gusta nadar en verano. / Juego al tenis los sábados. / Mi hobby es dibujar.", en: "Me gusta nadar en verano. / Juego al tenis los sábados. / Mi hobby es dibujar.", es: "Me gusta nadar en verano. / Juego al tenis los sábados. / Mi hobby es dibujar." },
          mistakes: { ko: "❌ Me gusta nado.\n✅ Me gusta nadar.\n\n❌ Juego fútbol.\n✅ Juego al fútbol.", en: "❌ Me gusta nado.\n✅ Me gusta nadar. (infinitive after 'gusta', not conjugated)\n\n❌ Juego fútbol.\n✅ Juego al fútbol. (need 'al' before the sport)", es: "❌ Me gusta nado.\n✅ Me gusta nadar. (infinitivo después de 'gusta')\n\n❌ Juego fútbol.\n✅ Juego al fútbol. (necesitas 'al' antes del deporte)" },
          rudyTip: { ko: "'Me gusta' 뒤에는 동사원형! nadar, leer, cocinar. 스포츠할 때는 'Juego al' — 'al' 잊지 마, 이게 스페인어 함정이야!", en: "After 'Me gusta', always use infinitive! nadar, leer, cocinar. For sports: 'Juego al' — don't forget 'al', that's the Spanish trap!", es: "Después de 'Me gusta', infinitivo: nadar, leer, cocinar. Deportes: 'Juego al' — no olvides 'al', es la trampa clásica." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "¿Qué te gusta ___ en tu tiempo libre?", answer: "hacer", options: ["hacer", "ir", "ser"], fullSentence: "¿Qué te gusta hacer en tu tiempo libre?", fullSentenceMeaning: { ko: "여가에 뭘 좋아해?", en: "What do you like to do?", es: "¿Qué te gusta hacer?" } },
          { type: "select", promptWithBlank: "Me gusta ___ libros.", answer: "leer", options: ["leer", "jugar", "hacer"], fullSentence: "Me gusta leer libros.", fullSentenceMeaning: { ko: "책 읽기 좋아해요.", en: "I like reading.", es: "Me gusta leer." } },
          { type: "select", promptWithBlank: "___ al fútbol los fines de semana.", answer: "Juego", options: ["Juego", "Leo", "Cocino"], fullSentence: "Juego al fútbol los fines de semana.", fullSentenceMeaning: { ko: "주말에 축구해요.", en: "I play football on weekends.", es: "Juego fútbol los fines de semana." } },
          { type: "input", promptWithBlank: "¿Practicas algún ___?", answer: "deporte", fullSentence: "¿Practicas algún deporte?", fullSentenceMeaning: { ko: "스포츠 하세요?", en: "Do you play sports?", es: "¿Practicas deporte?" } },
          { type: "input", promptWithBlank: "Mi hobby es ___.", answer: "cocinar", fullSentence: "Mi hobby es cocinar.", fullSentenceMeaning: { ko: "취미는 요리.", en: "Hobby is cooking.", es: "Hobby es cocinar." } },
          { type: "listening", audioText: "Mi hobby es cocinar.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Mi hobby es cocinar.", "¿Qué te gusta hacer en tu tiempo libre?", "Me gusta leer libros y ver películas.", "¿Practicas algún deporte?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "I would like to order, please.", es: "Quisiera pedir, por favor.", ko: "주문할게요." }, fromDay: 11, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Are you hungry?", es: "¿Tienes hambre?", ko: "배고프세요?" }, fromDay: 11, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "여가 시간에 뭘 좋아하세요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "여가에 뭘 좋아하세요?", en: "What do you like to do in your free time?", es: "¿Qué te gusta hacer?" } },
        { text: "저는 책 읽기와 영화 보기를 좋아해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "책 읽기와 영화 보기를 좋아해요.", en: "I like reading and watching movies.", es: "Me gusta leer y ver películas." } },
        { text: "운동을 하세요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "운동 하세요?", en: "Do you play any sports?", es: "¿Practicas deporte?" } },
        { text: "매주 주말에 축구를 해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "매주 주말 축구해요.", en: "I play football every weekend.", es: "Juego fútbol cada fin de semana." }, recallRound: true },
        { text: "제 취미는 요리예요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "취미는 요리.", en: "My hobby is cooking.", es: "Mi hobby es cocinar." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "취미 질문: '뭘 좋아하세요?' / 대답: '___를/을 좋아해요' / 운동: '___를/을 해요' / 취미: '제 취미는 ___예요'", en: "'뭘 좋아하세요?' → ask hobbies / '___를/을 좋아해요' → answer / '___를/을 해요' → sports / '제 취미는 ___예요' → hobbies", es: "'뭘 좋아하세요?' → preguntar / '___를/을 좋아해요' → responder / '___를/을 해요' → deportes / '제 취미는 ___예요' → hobbies" },
          examples: { ko: "수영을 좋아해요. / 토요일에 테니스를 해요. / 제 취미는 그림 그리기예요.", en: "수영을 좋아해요. / 토요일에 테니스를 해요. / 제 취미는 그림 그리기예요.", es: "수영을 좋아해요. / 토요일에 테니스를 해요. / 제 취미는 그림 그리기예요." },
          mistakes: { ko: "❌ 수영 좋아해요.\n✅ 수영을 좋아해요.\n\n❌ 제 취미는 요리.\n✅ 제 취미는 요리예요.", en: "❌ 수영 좋아해요.\n✅ 수영을 좋아해요. (need particle 을/를 after the object)\n\n❌ 제 취미는 요리.\n✅ 제 취미는 요리예요. (need 예요/이에요 at the end)", es: "❌ 수영 좋아해요.\n✅ 수영을 좋아해요. (necesitas partícula 을/를)\n\n❌ 제 취미는 요리.\n✅ 제 취미는 요리예요. (necesitas 예요/이에요 al final)" },
          rudyTip: { ko: "한국어 취미 말할 때 조사가 핵심이야! '을/를 좋아해요'에서 조사 빼먹으면 안 돼. 그리고 문장 끝에 '예요' 꼭 붙여!", en: "Particles are key in Korean hobbies! Don't skip 을/를 in '좋아해요'. And always end with 예요 — it's how Koreans complete sentences!", es: "Las partículas son clave: no olvides 을/를 en '좋아해요'. Y siempre termina con 예요 para completar la oración." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "여가 시간에 ___ 좋아하세요?", answer: "뭘", options: ["뭘", "언제", "어디"], fullSentence: "여가 시간에 뭘 좋아하세요?", fullSentenceMeaning: { ko: "여가에 뭘 좋아해?", en: "What do you like?", es: "¿Qué te gusta?" } },
          { type: "select", promptWithBlank: "책 ___를 좋아해요.", answer: "읽기", options: ["읽기", "하기", "보기"], fullSentence: "책 읽기를 좋아해요.", fullSentenceMeaning: { ko: "책 읽기 좋아해요.", en: "I like reading.", es: "Me gusta leer." } },
          { type: "select", promptWithBlank: "매주 주말에 ___를 해요.", answer: "축구", options: ["축구", "책", "요리"], fullSentence: "매주 주말에 축구를 해요.", fullSentenceMeaning: { ko: "매주 주말 축구.", en: "Football every weekend.", es: "Fútbol cada fin de semana." } },
          { type: "input", promptWithBlank: "___을 하세요?", answer: "운동", fullSentence: "운동을 하세요?", fullSentenceMeaning: { ko: "운동 하세요?", en: "Do you exercise?", es: "¿Haces ejercicio?" } },
          { type: "input", promptWithBlank: "제 취미는 ___예요.", answer: "요리", fullSentence: "제 취미는 요리예요.", fullSentenceMeaning: { ko: "취미는 요리.", en: "Hobby is cooking.", es: "Hobby es cocinar." } },
          { type: "listening", audioText: "제 취미는 요리예요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["제 취미는 요리예요.", "여가 시간에 뭘 좋아하세요?", "저는 책 읽기와 영화 보기를 좋아해요.", "운동을 하세요?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "I would like to order, please.", es: "Quisiera pedir, por favor.", ko: "주문할게요." }, fromDay: 11, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Are you hungry?", es: "¿Tienes hambre?", ko: "배고프세요?" }, fromDay: 11, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
  },

  // ─────────────── Day 28: Feelings & Emotions ─────────────────────────────
  day_28: {
    english: {
      step1Sentences: [
        { text: "How are you feeling today?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "오늘 기분이 어떠세요?", en: "How are you feeling today?", es: "¿Cómo te sientes hoy?" } },
        { text: "I am very happy today.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "오늘 매우 행복해요.", en: "I am very happy today.", es: "Estoy muy feliz hoy." } },
        { text: "I am tired because I worked all day.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "하루 종일 일해서 피곤해요.", en: "I am tired because I worked all day.", es: "Estoy cansado porque trabajé todo el día." } },
        { text: "Are you okay? You look worried.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "괜찮아요? 걱정되어 보여요.", en: "Are you okay? You look worried.", es: "¿Estás bien? Pareces preocupado." }, recallRound: true },
        { text: "I am excited about the trip!", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "여행이 기대돼요!", en: "I am excited about the trip!", es: "¡Estoy emocionado por el viaje!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "감정 질문: 'How are you feeling?' / 대답: 'I am ___' / 이유: 'because ___' / 상대 감정: 'You look ___'", en: "'How are you feeling?' → ask feelings / 'I am ___' → express feelings / 'because ___' → give reason / 'You look ___' → observe others", es: "'How are you feeling?' → preguntar sentimientos / 'I am ___' → expresar / 'because ___' → razón / 'You look ___' → observar" },
          examples: { ko: "I am tired because I didn't sleep well. / You look happy today! / I am excited about the party.", en: "I am tired because I didn't sleep well. / You look happy today! / I am excited about the party.", es: "I am tired because I didn't sleep well. / You look happy today! / I am excited about the party." },
          mistakes: { ko: "❌ I am feel happy.\n✅ I am happy. 또는 I feel happy.\n\n❌ I am exciting about the trip.\n✅ I am excited about the trip.", en: "❌ I am feel happy.\n✅ I am happy. or I feel happy. (don't combine 'am' + 'feel')\n\n❌ I am exciting about the trip.\n✅ I am excited about the trip. (-ed for feelings, -ing for things)", es: "❌ I am feel happy.\n✅ I am happy. o I feel happy. (no combines 'am' + 'feel')\n\n❌ I am exciting about the trip.\n✅ I am excited about the trip. (-ed para sentir, -ing para cosas)" },
          rudyTip: { ko: "excited vs exciting — 사람 감정은 -ed, 물건이 주는 느낌은 -ing! 'I am excited' (내가 신나), 'The trip is exciting' (여행이 신나는). 이것만 알면 감정 마스터!", en: "excited vs exciting — people feel -ed, things are -ing! 'I am excited' but 'The trip is exciting'. Nail this and you've cracked the code!", es: "excited vs exciting: personas sienten -ed, cosas son -ing. 'I am excited' pero 'The trip is exciting'. Domina esto y caso resuelto." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "How are you ___ today?", answer: "feeling", options: ["feeling", "doing", "going"], fullSentence: "How are you feeling today?", fullSentenceMeaning: { ko: "오늘 기분 어때?", en: "How are you feeling?", es: "¿Cómo te sientes?" } },
          { type: "select", promptWithBlank: "I am very ___ today.", answer: "happy", options: ["happy", "tall", "blue"], fullSentence: "I am very happy today.", fullSentenceMeaning: { ko: "오늘 매우 행복해요.", en: "I am very happy.", es: "Estoy muy feliz." } },
          { type: "select", promptWithBlank: "I am tired ___ I worked all day.", answer: "because", options: ["because", "but", "and"], fullSentence: "I am tired because I worked all day.", fullSentenceMeaning: { ko: "일해서 피곤해요.", en: "Tired because I worked.", es: "Cansado porque trabajé." } },
          { type: "input", promptWithBlank: "Are you okay? You look ___.", answer: "worried", fullSentence: "Are you okay? You look worried.", fullSentenceMeaning: { ko: "괜찮아요? 걱정돼 보여요.", en: "OK? You look worried.", es: "¿Bien? Pareces preocupado." } },
          { type: "input", promptWithBlank: "I am ___ about the trip!", answer: "excited", fullSentence: "I am excited about the trip!", fullSentenceMeaning: { ko: "여행이 기대돼요!", en: "Excited about the trip!", es: "¡Emocionado por el viaje!" } },
          { type: "listening", audioText: "I am excited about the trip!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["I am excited about the trip!", "How are you feeling today?", "I am very happy today.", "I am tired because I worked all day."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Where is the subway station?", es: "¿Dónde está la estación de metro?", ko: "지하철역이 어디에 있나요?" }, fromDay: 19, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "How far is it?", es: "¿A qué distancia está?", ko: "얼마나 멀어요?" }, fromDay: 19, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "¿Cómo te sientes hoy?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "오늘 기분 어때요?", en: "How are you feeling today?", es: "¿Cómo te sientes hoy?" } },
        { text: "Estoy muy feliz hoy.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "오늘 매우 행복해요.", en: "I am very happy today.", es: "Estoy muy feliz hoy." } },
        { text: "Estoy cansado porque trabajé todo el día.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "하루 종일 일해서 피곤해요.", en: "I am tired because I worked all day.", es: "Estoy cansado porque trabajé todo el día." } },
        { text: "¿Estás bien? Pareces preocupado.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "괜찮아요? 걱정돼 보여요.", en: "Are you okay? You look worried.", es: "¿Estás bien? Pareces preocupado." }, recallRound: true },
        { text: "¡Estoy emocionado por el viaje!", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "여행이 기대돼요!", en: "I am excited about the trip!", es: "¡Estoy emocionado por el viaje!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "감정 질문: '¿Cómo te sientes?' / 대답: 'Estoy ___' / 이유: 'porque ___' / 상대 감정: 'Pareces ___'", en: "'¿Cómo te sientes?' → ask feelings / 'Estoy ___' → express / 'porque ___' → reason / 'Pareces ___' → observe others", es: "'¿Cómo te sientes?' → preguntar / 'Estoy ___' → expresar / 'porque ___' → razón / 'Pareces ___' → observar" },
          examples: { ko: "Estoy cansado porque no dormí bien. / Pareces feliz hoy. / Estoy emocionado por la fiesta.", en: "Estoy cansado porque no dormí bien. / Pareces feliz hoy. / Estoy emocionado por la fiesta.", es: "Estoy cansado porque no dormí bien. / Pareces feliz hoy. / Estoy emocionado por la fiesta." },
          mistakes: { ko: "❌ Soy cansado.\n✅ Estoy cansado.\n\n❌ Estoy emocionado por viaje.\n✅ Estoy emocionado por el viaje.", en: "❌ Soy cansado.\n✅ Estoy cansado. (feelings use 'estoy' not 'soy')\n\n❌ Estoy emocionado por viaje.\n✅ Estoy emocionado por el viaje. (need article 'el')", es: "❌ Soy cansado.\n✅ Estoy cansado. (sentimientos con 'estoy', no 'soy')\n\n❌ Estoy emocionado por viaje.\n✅ Estoy emocionado por el viaje. (necesitas artículo 'el')" },
          rudyTip: { ko: "스페인어 감정의 핵심: 'Estoy' vs 'Soy' 구별! 감정처럼 변하는 건 'Estoy', 성격처럼 안 변하는 건 'Soy'. Estoy feliz (지금 행복), Soy amable (원래 친절)!", en: "The key: Estoy vs Soy! Estoy = temporary feelings, Soy = permanent traits. Estoy feliz (happy now), Soy amable (always kind). Case closed!", es: "La clave: Estoy vs Soy. Estoy = sentimientos temporales, Soy = rasgos permanentes. Estoy feliz (ahora), Soy amable (siempre). Caso cerrado." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "¿Cómo te ___ hoy?", answer: "sientes", options: ["sientes", "haces", "vas"], fullSentence: "¿Cómo te sientes hoy?", fullSentenceMeaning: { ko: "오늘 기분 어때?", en: "How do you feel?", es: "¿Cómo te sientes?" } },
          { type: "select", promptWithBlank: "Estoy muy ___ hoy.", answer: "feliz", options: ["feliz", "alto", "azul"], fullSentence: "Estoy muy feliz hoy.", fullSentenceMeaning: { ko: "오늘 매우 행복.", en: "Very happy today.", es: "Muy feliz hoy." } },
          { type: "select", promptWithBlank: "Estoy cansado ___ trabajé todo el día.", answer: "porque", options: ["porque", "pero", "y"], fullSentence: "Estoy cansado porque trabajé todo el día.", fullSentenceMeaning: { ko: "일해서 피곤.", en: "Tired because I worked.", es: "Cansado porque trabajé." } },
          { type: "input", promptWithBlank: "¿Estás bien? Pareces ___.", answer: "preocupado", fullSentence: "¿Estás bien? Pareces preocupado.", fullSentenceMeaning: { ko: "괜찮아? 걱정돼 보여.", en: "OK? You look worried.", es: "¿Bien? Pareces preocupado." } },
          { type: "input", promptWithBlank: "Estoy ___ por el viaje.", answer: "emocionado", fullSentence: "Estoy emocionado por el viaje.", fullSentenceMeaning: { ko: "여행이 기대돼!", en: "Excited about the trip!", es: "¡Emocionado por el viaje!" } },
          { type: "listening", audioText: "¡Estoy emocionado por el viaje!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["¡Estoy emocionado por el viaje!", "¿Cómo te sientes hoy?", "Estoy muy feliz hoy.", "Estoy cansado porque trabajé todo el día."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Where is the subway station?", es: "¿Dónde está la estación de metro?", ko: "지하철역이 어디에 있나요?" }, fromDay: 19, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "How far is it?", es: "¿A qué distancia está?", ko: "얼마나 멀어요?" }, fromDay: 19, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "오늘 기분이 어떠세요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "오늘 기분 어때요?", en: "How are you feeling today?", es: "¿Cómo te sientes hoy?" } },
        { text: "오늘 매우 행복해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "오늘 매우 행복해요.", en: "I am very happy today.", es: "Estoy muy feliz hoy." } },
        { text: "하루 종일 일해서 피곤해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "일해서 피곤해요.", en: "I'm tired from working all day.", es: "Cansado de trabajar todo el día." } },
        { text: "괜찮아요? 걱정되어 보여요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "괜찮아요? 걱정돼 보여요.", en: "Are you okay? You look worried.", es: "¿Estás bien? Pareces preocupado." }, recallRound: true },
        { text: "여행이 너무 기대돼요!", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "여행이 기대돼요!", en: "I'm so excited about the trip!", es: "¡Estoy emocionado por el viaje!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "감정 질문: '기분이 어떠세요?' / 대답: '___해요' / 이유: '___아서/어서' / 상대 감정: '___보여요'", en: "'기분이 어떠세요?' → ask feelings / '___해요' → express / '___아서/어서' → reason / '___보여요' → observe others", es: "'기분이 어떠세요?' → preguntar / '___해요' → expresar / '___아서/어서' → razón / '___보여요' → observar" },
          examples: { ko: "잠을 못 자서 피곤해요. / 오늘 행복해 보여요! / 파티가 기대돼요.", en: "잠을 못 자서 피곤해요. / 오늘 행복해 보여요! / 파티가 기대돼요.", es: "잠을 못 자서 피곤해요. / 오늘 행복해 보여요! / 파티가 기대돼요." },
          mistakes: { ko: "❌ 피곤이에요.\n✅ 피곤해요.\n\n❌ 일해서 때문에 피곤해요.\n✅ 일해서 피곤해요.", en: "❌ 피곤이에요.\n✅ 피곤해요. (emotions use 해요, not 이에요)\n\n❌ 일해서 때문에 피곤해요.\n✅ 일해서 피곤해요. (아서/어서 already means 'because')", es: "❌ 피곤이에요.\n✅ 피곤해요. (emociones con 해요, no 이에요)\n\n❌ 일해서 때문에 피곤해요.\n✅ 일해서 피곤해요. (아서/어서 ya significa 'porque')" },
          rudyTip: { ko: "한국어 감정 표현의 비밀: '-아서/어서'만 붙이면 이유 설명 끝! '일해서 피곤해요' 처럼 원인+결과를 한 문장에 담을 수 있어!", en: "Korean feelings secret: just add -아서/어서 and you've got cause + effect in one sentence! '일해서 피곤해요' = worked so tired. Easy!", es: "Secreto de emociones en coreano: -아서/어서 une causa + efecto. '일해서 피곤해요' = trabajé, así que cansado. Fácil." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "오늘 ___이 어떠세요?", answer: "기분", options: ["기분", "날씨", "이름"], fullSentence: "오늘 기분이 어떠세요?", fullSentenceMeaning: { ko: "오늘 기분 어때?", en: "How do you feel?", es: "¿Cómo te sientes?" } },
          { type: "select", promptWithBlank: "오늘 매우 ___요.", answer: "행복해", options: ["행복해", "키가 커", "멀어"], fullSentence: "오늘 매우 행복해요.", fullSentenceMeaning: { ko: "오늘 매우 행복.", en: "Very happy today.", es: "Muy feliz hoy." } },
          { type: "select", promptWithBlank: "일___서 피곤해요.", answer: "해", options: ["해", "하", "한"], fullSentence: "일해서 피곤해요.", fullSentenceMeaning: { ko: "일해서 피곤.", en: "Tired from working.", es: "Cansado de trabajar." } },
          { type: "input", promptWithBlank: "괜찮아요? ___되어 보여요.", answer: "걱정", fullSentence: "괜찮아요? 걱정되어 보여요.", fullSentenceMeaning: { ko: "괜찮아? 걱정돼 보여.", en: "OK? Look worried.", es: "¿Bien? Preocupado." } },
          { type: "input", promptWithBlank: "여행이 너무 ___요!", answer: "기대돼", fullSentence: "여행이 너무 기대돼요!", fullSentenceMeaning: { ko: "여행이 기대돼!", en: "So excited about the trip!", es: "¡Emocionado por el viaje!" } },
          { type: "listening", audioText: "여행이 너무 기대돼요!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["여행이 너무 기대돼요!", "오늘 기분이 어떠세요?", "오늘 매우 행복해요.", "하루 종일 일해서 피곤해요."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Where is the subway station?", es: "¿Dónde está la estación de metro?", ko: "지하철역이 어디에 있나요?" }, fromDay: 19, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "How far is it?", es: "¿A qué distancia está?", ko: "얼마나 멀어요?" }, fromDay: 19, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
  },

  // ─────────────── Day 29: Making Plans ────────────────────────────────────
  day_29: {
    english: {
      step1Sentences: [
        { text: "Are you free this weekend?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "이번 주말에 시간 있어요?", en: "Are you free this weekend?", es: "¿Estás libre este fin de semana?" } },
        { text: "Let's meet at the cafe at three o'clock.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "3시에 카페에서 만나요.", en: "Let's meet at the cafe at three o'clock.", es: "Encontrémonos en el café a las tres." } },
        { text: "Would you like to go to the cinema?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "영화관에 갈래요?", en: "Would you like to go to the cinema?", es: "¿Te gustaría ir al cine?" } },
        { text: "Sorry, I can't. I have plans.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "미안해요, 안 돼요. 약속이 있어요.", en: "Sorry, I can't. I have plans.", es: "Lo siento, no puedo. Tengo planes." }, recallRound: true },
        { text: "That sounds great! See you there.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "좋아요! 거기서 봐요.", en: "That sounds great! See you there.", es: "¡Suena genial! Nos vemos allí." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "시간 확인: 'Are you free ___?' / 제안: 'Let's ___' 또는 'Would you like to ___?' / 거절: 'Sorry, I can't' / 수락: 'That sounds great!'", en: "'Are you free ___?' → check availability / 'Let's ___' or 'Would you like to ___?' → suggest / 'Sorry, I can't' → decline / 'That sounds great!' → accept", es: "'Are you free ___?' → disponibilidad / 'Let's ___' o 'Would you like to ___?' → sugerir / 'Sorry, I can't' → rechazar / 'That sounds great!' → aceptar" },
          examples: { ko: "Are you free on Saturday? / Let's go to the park together. / Would you like to have lunch?", en: "Are you free on Saturday? / Let's go to the park together. / Would you like to have lunch?", es: "Are you free on Saturday? / Let's go to the park together. / Would you like to have lunch?" },
          mistakes: { ko: "❌ Let's to go to the cinema.\n✅ Let's go to the cinema.\n\n❌ Would you like go?\n✅ Would you like to go?", en: "❌ Let's to go to the cinema.\n✅ Let's go to the cinema. (no 'to' after Let's)\n\n❌ Would you like go?\n✅ Would you like to go? (need 'to' after 'would you like')", es: "❌ Let's to go to the cinema.\n✅ Let's go to the cinema. (sin 'to' después de Let's)\n\n❌ Would you like go?\n✅ Would you like to go? ('to' necesario después de 'would you like')" },
          rudyTip: { ko: "약속 잡기 공식: 1) Are you free? 2) Let's ___! 3) 상대가 OK면 'Sounds great!', 안 되면 'Sorry, I can't'. 이 세 단계면 완벽해!", en: "Plan-making formula: 1) Are you free? 2) Let's ___! 3) They say yes = 'Sounds great!', no = 'Sorry, I can't'. Three steps to any plan!", es: "Fórmula: 1) Are you free? 2) Let's ___! 3) Sí = 'Sounds great!', No = 'Sorry, I can't'. Tres pasos para cualquier plan." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Are you ___ this weekend?", answer: "free", options: ["free", "busy", "here"], fullSentence: "Are you free this weekend?", fullSentenceMeaning: { ko: "이번 주말 시간 있어?", en: "Free this weekend?", es: "¿Libre este fin de semana?" } },
          { type: "select", promptWithBlank: "___ meet at the cafe.", answer: "Let's", options: ["Let's", "I'm", "You're"], fullSentence: "Let's meet at the cafe.", fullSentenceMeaning: { ko: "카페에서 만나요.", en: "Let's meet at the cafe.", es: "Encontrémonos en el café." } },
          { type: "select", promptWithBlank: "Would you ___ to go to the cinema?", answer: "like", options: ["like", "want", "have"], fullSentence: "Would you like to go to the cinema?", fullSentenceMeaning: { ko: "영화관에 갈래요?", en: "Like to go to the cinema?", es: "¿Ir al cine?" } },
          { type: "input", promptWithBlank: "Sorry, I ___. I have plans.", answer: "can't", fullSentence: "Sorry, I can't. I have plans.", fullSentenceMeaning: { ko: "미안, 안 돼. 약속 있어.", en: "Sorry, can't. Have plans.", es: "Lo siento, no puedo." } },
          { type: "input", promptWithBlank: "That sounds ___! See you there.", answer: "great", fullSentence: "That sounds great! See you there.", fullSentenceMeaning: { ko: "좋아! 거기서 봐.", en: "Sounds great! See you.", es: "¡Genial! Nos vemos." } },
          { type: "listening", audioText: "That sounds great! See you there.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["That sounds great! See you there.", "Are you free this weekend?", "Let's meet at the cafe at three o'clock.", "Would you like to go to the cinema?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "¿Estás libre este fin de semana?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "이번 주말 시간 있어요?", en: "Are you free this weekend?", es: "¿Estás libre este fin de semana?" } },
        { text: "Encontrémonos en el café a las tres.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "3시에 카페에서 만나요.", en: "Let's meet at the cafe at three.", es: "Encontrémonos en el café a las tres." } },
        { text: "¿Te gustaría ir al cine?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "영화관에 갈래요?", en: "Would you like to go to the cinema?", es: "¿Te gustaría ir al cine?" } },
        { text: "Lo siento, no puedo. Tengo planes.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "미안, 안 돼요. 약속 있어요.", en: "Sorry, I can't. I have plans.", es: "Lo siento, no puedo. Tengo planes." }, recallRound: true },
        { text: "¡Suena genial! Nos vemos allí.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "좋아요! 거기서 봐요.", en: "Sounds great! See you there.", es: "¡Suena genial! Nos vemos allí." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "시간 확인: '¿Estás libre ___?' / 제안: 'Encontrémonos ___' 또는 '¿Te gustaría ___?' / 거절: 'Lo siento, no puedo' / 수락: '¡Suena genial!'", en: "'¿Estás libre ___?' → availability / 'Encontrémonos ___' or '¿Te gustaría ___?' → suggest / 'Lo siento, no puedo' → decline / '¡Suena genial!' → accept", es: "'¿Estás libre ___?' → disponibilidad / 'Encontrémonos ___' o '¿Te gustaría ___?' → sugerir / 'Lo siento, no puedo' → rechazar / '¡Suena genial!' → aceptar" },
          examples: { ko: "¿Estás libre el sábado? / Encontrémonos en el parque. / ¿Te gustaría almorzar juntos?", en: "¿Estás libre el sábado? / Encontrémonos en el parque. / ¿Te gustaría almorzar juntos?", es: "¿Estás libre el sábado? / Encontrémonos en el parque. / ¿Te gustaría almorzar juntos?" },
          mistakes: { ko: "❌ ¿Te gustaría vas al cine?\n✅ ¿Te gustaría ir al cine?\n\n❌ Encontrémonos a el café.\n✅ Encontrémonos en el café.", en: "❌ ¿Te gustaría vas al cine?\n✅ ¿Te gustaría ir al cine? (infinitive after 'gustaría')\n\n❌ Encontrémonos a el café.\n✅ Encontrémonos en el café. ('en' for location, not 'a el')", es: "❌ ¿Te gustaría vas al cine?\n✅ ¿Te gustaría ir al cine? (infinitivo después de 'gustaría')\n\n❌ Encontrémonos a el café.\n✅ Encontrémonos en el café. ('en' para lugar, no 'a el')" },
          rudyTip: { ko: "'¿Te gustaría ___?' 뒤에는 항상 동사원형! ir, comer, ver 이렇게. 그리고 장소는 'en' — 'Encontrémonos en el café'처럼!", en: "After '¿Te gustaría ___?' always infinitive: ir, comer, ver. And places use 'en' — 'Encontrémonos en el café'. Now go make plans!", es: "Después de '¿Te gustaría ___?' siempre infinitivo: ir, comer, ver. Y lugares con 'en': 'Encontrémonos en el café'. A hacer planes." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "¿Estás ___ este fin de semana?", answer: "libre", options: ["libre", "ocupado", "aquí"], fullSentence: "¿Estás libre este fin de semana?", fullSentenceMeaning: { ko: "이번 주말 시간 있어?", en: "Free this weekend?", es: "¿Libre este fin de semana?" } },
          { type: "select", promptWithBlank: "___ en el café a las tres.", answer: "Encontrémonos", options: ["Encontrémonos", "Estoy", "Eres"], fullSentence: "Encontrémonos en el café a las tres.", fullSentenceMeaning: { ko: "3시에 카페에서.", en: "Meet at cafe at three.", es: "En el café a las tres." } },
          { type: "select", promptWithBlank: "¿Te ___ ir al cine?", answer: "gustaría", options: ["gustaría", "gusta", "quiere"], fullSentence: "¿Te gustaría ir al cine?", fullSentenceMeaning: { ko: "영화관 갈래?", en: "Like to go to cinema?", es: "¿Ir al cine?" } },
          { type: "input", promptWithBlank: "Lo siento, no ___. Tengo planes.", answer: "puedo", fullSentence: "Lo siento, no puedo. Tengo planes.", fullSentenceMeaning: { ko: "미안, 안 돼. 약속 있어.", en: "Sorry, can't. Have plans.", es: "No puedo, tengo planes." } },
          { type: "input", promptWithBlank: "¡Suena ___! Nos vemos allí.", answer: "genial", fullSentence: "¡Suena genial! Nos vemos allí.", fullSentenceMeaning: { ko: "좋아! 거기서.", en: "Sounds great! See you.", es: "¡Genial! Nos vemos." } },
          { type: "listening", audioText: "¡Suena genial! Nos vemos allí.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["¡Suena genial! Nos vemos allí.", "¿Estás libre este fin de semana?", "Encontrémonos en el café a las tres.", "¿Te gustaría ir al cine?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "이번 주말에 시간 있어요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "이번 주말 시간 있어?", en: "Are you free this weekend?", es: "¿Estás libre este fin de semana?" } },
        { text: "3시에 카페에서 만나요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "3시에 카페에서 만나요.", en: "Let's meet at the cafe at three.", es: "Encontrémonos en el café a las tres." } },
        { text: "영화관에 갈래요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "영화관에 갈래?", en: "Want to go to the cinema?", es: "¿Quieres ir al cine?" } },
        { text: "미안해요, 안 돼요. 약속이 있어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "미안, 안 돼. 약속 있어.", en: "Sorry, I can't. I have plans.", es: "Lo siento, no puedo. Tengo planes." }, recallRound: true },
        { text: "좋아요! 거기서 봐요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "좋아! 거기서 봐.", en: "Great! See you there.", es: "¡Genial! Nos vemos allí." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "시간 확인: '시간 있어요?' / 제안: '___에서 만나요' 또는 '___에 갈래요?' / 거절: '미안해요, 안 돼요' / 수락: '좋아요!'", en: "'시간 있어요?' → availability / '___에서 만나요' or '___에 갈래요?' → suggest / '미안해요, 안 돼요' → decline / '좋아요!' → accept", es: "'시간 있어요?' → disponibilidad / '___에서 만나요' o '___에 갈래요?' → sugerir / '미안해요, 안 돼요' → rechazar / '좋아요!' → aceptar" },
          examples: { ko: "토요일에 시간 있어요? / 공원에서 만나요. / 같이 점심 먹을래요?", en: "토요일에 시간 있어요? / 공원에서 만나요. / 같이 점심 먹을래요?", es: "토요일에 시간 있어요? / 공원에서 만나요. / 같이 점심 먹을래요?" },
          mistakes: { ko: "❌ 카페에 만나요.\n✅ 카페에서 만나요.\n\n❌ 영화관에서 갈래요?\n✅ 영화관에 갈래요?", en: "❌ 카페에 만나요.\n✅ 카페에서 만나요. (에서 for meeting places, action at location)\n\n❌ 영화관에서 갈래요?\n✅ 영화관에 갈래요? (에 for destination with movement verbs)", es: "❌ 카페에 만나요.\n✅ 카페에서 만나요. (에서 para acciones en un lugar)\n\n❌ 영화관에서 갈래요?\n✅ 영화관에 갈래요? (에 para destino con verbos de movimiento)" },
          rudyTip: { ko: "'에' vs '에서' 구별이 핵심! 가는 곳은 '에' (영화관에 갈래요?), 만나는 곳은 '에서' (카페에서 만나요). 이 차이만 알면 약속 잡기 완벽!", en: "에 vs 에서 is the key! Destination = 에 (영화관에 갈래요?), meeting place = 에서 (카페에서 만나요). Master this and your plans are perfect!", es: "에 vs 에서 es la clave. Destino = 에 (영화관에 갈래요?), punto de encuentro = 에서 (카페에서 만나요). Domina esto y tus planes serán perfectos." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "이번 주말에 ___ 있어요?", answer: "시간", options: ["시간", "돈", "음식"], fullSentence: "이번 주말에 시간 있어요?", fullSentenceMeaning: { ko: "이번 주말 시간 있어?", en: "Free this weekend?", es: "¿Libre este fin de semana?" } },
          { type: "select", promptWithBlank: "3시에 카페에서 ___요.", answer: "만나", options: ["만나", "먹어", "가"], fullSentence: "3시에 카페에서 만나요.", fullSentenceMeaning: { ko: "3시에 카페.", en: "Meet at cafe at three.", es: "Café a las tres." } },
          { type: "select", promptWithBlank: "영화관에 ___요?", answer: "갈래", options: ["갈래", "먹을래", "할래"], fullSentence: "영화관에 갈래요?", fullSentenceMeaning: { ko: "영화관 갈래?", en: "Go to cinema?", es: "¿Ir al cine?" } },
          { type: "input", promptWithBlank: "미안해요, ___ 돼요.", answer: "안", fullSentence: "미안해요, 안 돼요.", fullSentenceMeaning: { ko: "미안, 안 돼.", en: "Sorry, can't.", es: "Lo siento, no puedo." } },
          { type: "input", promptWithBlank: "좋아요! 거기서 ___요.", answer: "봐", fullSentence: "좋아요! 거기서 봐요.", fullSentenceMeaning: { ko: "좋아! 거기서 봐.", en: "Great! See you.", es: "¡Genial! Nos vemos." } },
          { type: "listening", audioText: "좋아요! 거기서 봐요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["좋아요! 거기서 봐요.", "이번 주말에 시간 있어요?", "3시에 카페에서 만나요.", "영화관에 갈래요?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again slowly?", es: "¿Puede repetirlo más despacio?", ko: "천천히 다시 말해줄 수 있어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
  },

  // ─────────────── Day 30: Final Review + A1 Celebration ───────────────────
  day_30: {
    english: {
      step1Sentences: [
        { text: "Hello, my name is Rudy. I am from Korea.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "안녕, 제 이름은 루디. 한국에서 왔어요.", en: "Hello, my name is Rudy. I am from Korea.", es: "Hola, me llamo Rudy. Soy de Corea." } },
        { text: "I have two brothers. My mother is a teacher.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "형제가 둘. 어머니는 선생님.", en: "Two brothers. Mother is a teacher.", es: "Dos hermanos. Mi madre es profesora." } },
        { text: "I am happy because I finished my lessons!", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "수업을 끝내서 행복해요!", en: "Happy because I finished my lessons!", es: "¡Feliz porque terminé mis lecciones!" } },
        { text: "Are you free tomorrow? Let's celebrate!", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "내일 시간 있어요? 축하해요!", en: "Free tomorrow? Let's celebrate!", es: "¿Libre mañana? ¡Celebremos!" }, recallRound: true },
        { text: "Thank you for everything. See you next time!", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "모든 것에 감사해요. 다음에 봐요!", en: "Thank you for everything. See you next time!", es: "Gracias por todo. ¡Hasta la próxima!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "A1 종합 복습: 자기소개 + 가족 + 묘사 + 취미 + 감정 + 약속 잡기 — 30일간 배운 모든 패턴 총정리!", en: "A1 Full Review: introductions + family + descriptions + hobbies + feelings + making plans — all 30 days of patterns combined!", es: "Repaso A1: presentaciones + familia + descripciones + hobbies + sentimientos + planes — todos los patrones de 30 días." },
          examples: { ko: "My name is Rudy. I have two brothers. / I am happy because I finished! / Are you free tomorrow? Let's celebrate!", en: "My name is Rudy. I have two brothers. / I am happy because I finished! / Are you free tomorrow? Let's celebrate!", es: "My name is Rudy. I have two brothers. / I am happy because I finished! / Are you free tomorrow? Let's celebrate!" },
          mistakes: { ko: "❌ I am have two brothers.\n✅ I have two brothers.\n\n❌ I happy because I finished.\n✅ I am happy because I finished.", en: "❌ I am have two brothers.\n✅ I have two brothers. (don't add 'am' before 'have')\n\n❌ I happy because I finished.\n✅ I am happy because I finished. (need 'am' before adjectives)", es: "❌ I am have two brothers.\n✅ I have two brothers. (no añadas 'am' antes de 'have')\n\n❌ I happy because I finished.\n✅ I am happy because I finished. ('am' necesario antes de adjetivos)" },
          rudyTip: { ko: "30일 완주, 축하해! 이제 자기소개부터 약속까지 영어로 다 할 수 있어. 가장 중요한 건 계속 말하는 거야 — 다음 레벨에서 보자!", en: "30 days done, congrats! From intros to plans, you've got it all. The real secret? Keep talking! See you at the next level, partner!", es: "30 días completados. Desde presentaciones hasta planes, lo tienes todo. El secreto: sigue hablando. Nos vemos en el siguiente nivel." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "My ___ is Rudy.", answer: "name", options: ["name", "family", "hobby"], fullSentence: "My name is Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "I am ___ because I finished!", answer: "happy", options: ["happy", "tired", "worried"], fullSentence: "I am happy because I finished!", fullSentenceMeaning: { ko: "끝내서 행복!", en: "Happy because I finished!", es: "¡Feliz porque terminé!" } },
          { type: "select", promptWithBlank: "Are you ___ tomorrow?", answer: "free", options: ["free", "good", "nice"], fullSentence: "Are you free tomorrow?", fullSentenceMeaning: { ko: "내일 시간 있어?", en: "Free tomorrow?", es: "¿Libre mañana?" } },
          { type: "input", promptWithBlank: "Thank you for ___.", answer: "everything", fullSentence: "Thank you for everything.", fullSentenceMeaning: { ko: "모든 것에 감사.", en: "Thank you for everything.", es: "Gracias por todo." } },
          { type: "input", promptWithBlank: "See you ___ time!", answer: "next", fullSentence: "See you next time!", fullSentenceMeaning: { ko: "다음에 봐요!", en: "See you next time!", es: "¡Hasta la próxima!" } },
          { type: "listening", audioText: "Thank you for everything. See you next time!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Thank you for everything. See you next time!", "Hello, my name is Rudy. I am from Korea.", "I have two brothers. My mother is a teacher.", "Are you free tomorrow? Let's celebrate!"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Hello, nice to meet you.", es: "Hola, encantado de conocerle.", ko: "안녕하세요, 만나서 반가워요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Where is the bathroom? I'm lost!", es: "¿Dónde está el baño? ¡Estoy perdido!", ko: "화장실이 어디에 있나요? 길을 잃었어요!" }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "Hola, me llamo Rudy. Soy de Corea.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "안녕, 이름은 루디. 한국에서 왔어요.", en: "Hello, my name is Rudy. I'm from Korea.", es: "Hola, me llamo Rudy. Soy de Corea." } },
        { text: "Tengo dos hermanos. Mi madre es profesora.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "형제 둘. 어머니는 선생님.", en: "Two brothers. Mother is a teacher.", es: "Dos hermanos. Madre es profesora." } },
        { text: "¡Estoy feliz porque terminé mis lecciones!", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "수업 끝내서 행복!", en: "Happy because I finished lessons!", es: "¡Feliz porque terminé mis lecciones!" } },
        { text: "¿Estás libre mañana? ¡Celebremos!", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "내일 시간 있어? 축하!", en: "Free tomorrow? Let's celebrate!", es: "¿Libre mañana? ¡Celebremos!" }, recallRound: true },
        { text: "Gracias por todo. ¡Hasta la próxima!", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "모든 것에 감사. 다음에!", en: "Thanks for everything. Until next time!", es: "Gracias por todo. ¡Hasta la próxima!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "A1 종합 복습: 자기소개 + 가족 + 묘사 + 취미 + 감정 + 약속 — 30일 스페인어 패턴 총정리!", en: "A1 Full Review: introductions + family + descriptions + hobbies + feelings + plans — all 30 days of Spanish patterns!", es: "Repaso A1: presentaciones + familia + descripciones + hobbies + sentimientos + planes — todos los patrones de 30 días." },
          examples: { ko: "Me llamo Rudy. Tengo dos hermanos. / ¡Estoy feliz porque terminé! / ¿Estás libre mañana? ¡Celebremos!", en: "Me llamo Rudy. Tengo dos hermanos. / ¡Estoy feliz porque terminé! / ¿Estás libre mañana? ¡Celebremos!", es: "Me llamo Rudy. Tengo dos hermanos. / ¡Estoy feliz porque terminé! / ¿Estás libre mañana? ¡Celebremos!" },
          mistakes: { ko: "❌ Soy llamo Rudy.\n✅ Me llamo Rudy.\n\n❌ Soy feliz porque terminé.\n✅ Estoy feliz porque terminé.", en: "❌ Soy llamo Rudy.\n✅ Me llamo Rudy. ('me llamo' not 'soy llamo')\n\n❌ Soy feliz porque terminé.\n✅ Estoy feliz porque terminé. (temporary feeling = estoy)", es: "❌ Soy llamo Rudy.\n✅ Me llamo Rudy. ('me llamo' no 'soy llamo')\n\n❌ Soy feliz porque terminé.\n✅ Estoy feliz porque terminé. (sentimiento temporal = estoy)" },
          rudyTip: { ko: "30일 스페인어 완주! ser/estar 구별, 성별 일치, 동사원형 — 이 세 가지가 스페인어의 기둥이야. 계속 말하면 더 쉬워져!", en: "30 days of Spanish done! ser/estar, gender agreement, infinitives — these three pillars hold up all of Spanish. Keep talking and it gets easier!", es: "30 días completados. ser/estar, concordancia de género, infinitivos: los tres pilares del español. Sigue hablando y será cada vez más fácil." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Me ___ Rudy.", answer: "llamo", options: ["llamo", "tengo", "soy"], fullSentence: "Me llamo Rudy.", fullSentenceMeaning: { ko: "이름은 루디.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "Estoy ___ porque terminé.", answer: "feliz", options: ["feliz", "cansado", "preocupado"], fullSentence: "Estoy feliz porque terminé.", fullSentenceMeaning: { ko: "끝내서 행복!", en: "Happy because finished!", es: "¡Feliz porque terminé!" } },
          { type: "select", promptWithBlank: "¿Estás ___ mañana?", answer: "libre", options: ["libre", "bien", "bueno"], fullSentence: "¿Estás libre mañana?", fullSentenceMeaning: { ko: "내일 시간 있어?", en: "Free tomorrow?", es: "¿Libre mañana?" } },
          { type: "input", promptWithBlank: "Gracias por ___.", answer: "todo", fullSentence: "Gracias por todo.", fullSentenceMeaning: { ko: "모든 것에 감사.", en: "Thanks for everything.", es: "Gracias por todo." } },
          { type: "input", promptWithBlank: "¡Hasta la ___!", answer: "próxima", fullSentence: "¡Hasta la próxima!", fullSentenceMeaning: { ko: "다음에!", en: "Until next time!", es: "¡Hasta la próxima!" } },
          { type: "listening", audioText: "Gracias por todo. ¡Hasta la próxima!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Gracias por todo. ¡Hasta la próxima!", "Hola, me llamo Rudy. Soy de Corea.", "Tengo dos hermanos. Mi madre es profesora.", "¿Estás libre mañana? ¡Celebremos!"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Hello, nice to meet you.", es: "Hola, encantado de conocerle.", ko: "안녕하세요, 만나서 반가워요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Where is the bathroom? I'm lost!", es: "¿Dónde está el baño? ¡Estoy perdido!", ko: "화장실이 어디에 있나요? 길을 잃었어요!" }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "안녕하세요, 제 이름은 루디예요. 한국에서 왔어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "안녕, 이름은 루디. 한국 출신.", en: "Hello, I'm Rudy. From Korea.", es: "Hola, soy Rudy. De Corea." } },
        { text: "형제가 둘 있어요. 어머니는 선생님이에요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "형제 둘. 어머니는 선생님.", en: "Two brothers. Mother is teacher.", es: "Dos hermanos. Madre profesora." } },
        { text: "수업을 다 끝내서 행복해요!", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "수업 끝내서 행복!", en: "Happy I finished lessons!", es: "¡Feliz por terminar!" } },
        { text: "내일 시간 있어요? 축하해요!", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "내일 시간 있어? 축하!", en: "Free tomorrow? Congratulations!", es: "¿Libre mañana? ¡Felicidades!" }, recallRound: true },
        { text: "모든 것에 감사해요. 다음에 봐요!", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "모든 것에 감사. 다음에!", en: "Thanks for everything. See you!", es: "Gracias por todo. ¡Nos vemos!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "A1 종합 복습: 자기소개 + 가족 + 묘사 + 취미 + 감정 + 약속 — 30일 한국어 패턴 총정리!", en: "A1 Full Review: introductions + family + descriptions + hobbies + feelings + plans — all 30 days of Korean patterns!", es: "Repaso A1: presentaciones + familia + descripciones + hobbies + sentimientos + planes — todos los patrones de 30 días de coreano." },
          examples: { ko: "제 이름은 루디예요. 형제가 둘 있어요. / 끝내서 행복해요! / 내일 시간 있어요? 축하해요!", en: "제 이름은 루디예요. 형제가 둘 있어요. / 끝내서 행복해요! / 내일 시간 있어요? 축하해요!", es: "제 이름은 루디예요. 형제가 둘 있어요. / 끝내서 행복해요! / 내일 시간 있어요? 축하해요!" },
          mistakes: { ko: "❌ 저 이름 루디예요.\n✅ 제 이름은 루디예요.\n\n❌ 행복해요 끝내서.\n✅ 끝내서 행복해요.", en: "❌ 저 이름 루디예요.\n✅ 제 이름은 루디예요. (need 제 + 은 particle)\n\n❌ 행복해요 끝내서.\n✅ 끝내서 행복해요. (reason comes first in Korean)", es: "❌ 저 이름 루디예요.\n✅ 제 이름은 루디예요. (necesitas 제 + partícula 은)\n\n❌ 행복해요 끝내서.\n✅ 끝내서 행복해요. (la razón va primero en coreano)" },
          rudyTip: { ko: "30일 한국어 완주! 조사(은/는, 이/가, 을/를), 어미(-아서/어서, -고 있어요), 높임말(-세요) — 이 세 가지가 한국어의 핵심이야. 계속 가자!", en: "30 days of Korean done! Particles, endings, and honorifics — these three are the backbone of Korean. Keep going, partner!", es: "30 días de coreano. Partículas, terminaciones y honoríficos: los tres pilares del coreano. Sigue adelante, compañero." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "제 ___은 루디예요.", answer: "이름", options: ["이름", "가족", "취미"], fullSentence: "제 이름은 루디예요.", fullSentenceMeaning: { ko: "이름은 루디.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "수업을 끝내서 ___요!", answer: "행복해", options: ["행복해", "피곤해", "걱정돼"], fullSentence: "수업을 끝내서 행복해요!", fullSentenceMeaning: { ko: "끝내서 행복!", en: "Happy I finished!", es: "¡Feliz por terminar!" } },
          { type: "select", promptWithBlank: "내일 ___ 있어요?", answer: "시간", options: ["시간", "돈", "음식"], fullSentence: "내일 시간 있어요?", fullSentenceMeaning: { ko: "내일 시간 있어?", en: "Free tomorrow?", es: "¿Libre mañana?" } },
          { type: "input", promptWithBlank: "모든 것에 ___해요.", answer: "감사", fullSentence: "모든 것에 감사해요.", fullSentenceMeaning: { ko: "모든 것에 감사.", en: "Thanks for everything.", es: "Gracias por todo." } },
          { type: "input", promptWithBlank: "___에 봐요!", answer: "다음", fullSentence: "다음에 봐요!", fullSentenceMeaning: { ko: "다음에!", en: "See you next time!", es: "¡Hasta la próxima!" } },
          { type: "listening", audioText: "모든 것에 감사해요. 다음에 봐요!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["모든 것에 감사해요. 다음에 봐요!", "안녕하세요, 제 이름은 루디예요. 한국에서 왔어요.", "형제가 둘 있어요. 어머니는 선생님이에요.", "내일 시간 있어요? 축하해요!"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Hello, nice to meet you.", es: "Hola, encantado de conocerle.", ko: "안녕하세요, 만나서 반가워요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Where is the bathroom? I'm lost!", es: "¿Dónde está el baño? ¡Estoy perdido!", ko: "화장실이 어디에 있나요? 길을 잃었어요!" }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: MISSION TALK (Unit 5)
// ═══════════════════════════════════════════════════════════════════════════════

export const MISSION_CONTENT_UNIT5: Record<string, Partial<Record<LearningLangKey, MissionTalkLangData>>> = {

  day_25: {
    english: { situation: { ko: "바벨탑에서 루디가 다른 요원의 가족에 대해 물어야 합니다. 신뢰를 쌓으세요!", en: "At Babel Tower, Rudy must ask about another agent's family to build trust!", es: "En la Torre de Babel, Rudy debe preguntar sobre la familia de otro agente." }, gptPrompt: "You are a fellow agent at Babel Tower. The user needs to build trust by talking about family. Simple A1 {targetLang}. Practice: introducing family members, asking about family, sharing jobs. Be friendly and share your own family details. Mix in greetings from Unit 1.", speechLang: "en-GB", suggestedAnswers: ["This is my family.", "I have two brothers.", "My mother is a teacher.", "Do you have children?", "What does your father do?", "Nice to meet your family!"] },
    spanish: { situation: { ko: "바벨탑에서 다른 요원의 가족을 알아야 해요!", en: "Babel Tower: learn about the agent's family!", es: "Torre de Babel: conoce a la familia del agente." }, gptPrompt: "You are a fellow agent at Babel Tower. Build trust through family talk. Simple A1 {targetLang}. Practice: introducing family, jobs, numbers. Be friendly.", speechLang: "es-ES", suggestedAnswers: ["Esta es mi familia.", "Tengo dos hermanos.", "Mi madre es profesora.", "¿Tienes hijos?", "¿Qué hace tu padre?", "¡Encantado de conocer a tu familia!"] },
    korean: { situation: { ko: "바벨탑에서 다른 요원과 가족 이야기를 하며 신뢰를 쌓으세요!", en: "Babel Tower: build trust through family talk!", es: "Torre de Babel: confianza a través de familia." }, gptPrompt: "You are a fellow agent at Babel Tower. Build trust through family talk. Simple A1 {targetLang}. Practice: 가족, 직업, 숫자. Be friendly.", speechLang: "ko-KR", suggestedAnswers: ["이것은 제 가족이에요.", "형이 둘 있어요.", "어머니는 선생님이에요.", "자녀가 있으세요?", "아버지는 뭘 하세요?", "가족을 만나서 반가워요!"] },
  },

  day_26: {
    english: { situation: { ko: "루디가 용의자를 묘사해야 합니다. 정확하게 설명하세요!", en: "Rudy must describe a suspect accurately. Be precise!", es: "Rudy debe describir un sospechoso con precisión." }, gptPrompt: "You are Rudy's handler. Show the user a suspect description and ask them to describe the person back to you in simple A1 {targetLang}. Practice: height, hair, clothes, glasses, age. Ask follow-up questions like 'What is he wearing?' and 'How old does she look?'. Correct gently if descriptions are wrong.", speechLang: "en-GB", suggestedAnswers: ["She is tall.", "He has long hair.", "She is wearing a blue jacket.", "The man with glasses.", "He looks young.", "She is about thirty."] },
    spanish: { situation: { ko: "용의자를 묘사해야 해요! 정확하게!", en: "Describe the suspect precisely!", es: "¡Describe al sospechoso con precisión!" }, gptPrompt: "You are Rudy's handler. User must describe a suspect in A1 {targetLang}. Practice: height, hair, clothes, glasses, age. Ask follow-ups. Correct gently.", speechLang: "es-ES", suggestedAnswers: ["Ella es alta.", "Tiene el pelo largo.", "Lleva una chaqueta azul.", "El hombre con gafas.", "Parece joven.", "Tiene unos treinta años."] },
    korean: { situation: { ko: "용의자를 정확하게 묘사해야 해요!", en: "Describe the suspect!", es: "¡Describe al sospechoso!" }, gptPrompt: "You are Rudy's handler. User must describe a suspect in A1 {targetLang}. Practice: 키, 머리, 옷, 안경, 나이. Ask follow-ups. Correct gently.", speechLang: "ko-KR", suggestedAnswers: ["키가 커요.", "머리가 길어요.", "파란 재킷을 입고 있어요.", "안경 쓴 남자예요.", "어려 보여요.", "서른 살 정도예요."] },
  },

  day_27: {
    english: { situation: { ko: "바벨탑 파티에서 루디가 새 친구를 사귀어야 합니다. 취미에 대해 이야기하세요!", en: "At the Babel Tower party, Rudy must make friends by talking about hobbies!", es: "En la fiesta de Babel, Rudy hace amigos hablando de hobbies." }, gptPrompt: "You are a friendly guest at a Babel Tower party. The user is trying to make friends. Simple A1 {targetLang}. Talk about hobbies, sports, free time. Ask what they like to do, share your hobbies. Be enthusiastic and find common interests. Mix in food vocabulary from Unit 3 (cooking hobby).", speechLang: "en-GB", suggestedAnswers: ["What do you like to do?", "I like reading books.", "Do you play sports?", "I play football.", "My hobby is cooking.", "That sounds fun!"] },
    spanish: { situation: { ko: "바벨탑 파티에서 취미로 친구를 사귀세요!", en: "Babel party: make friends through hobbies!", es: "Fiesta Babel: amigos por hobbies." }, gptPrompt: "You are a friendly guest at a Babel Tower party. Simple A1 {targetLang}. Talk about hobbies, sports, free time. Find common interests. Mix in food from Unit 3.", speechLang: "es-ES", suggestedAnswers: ["¿Qué te gusta hacer?", "Me gusta leer.", "¿Practicas algún deporte?", "Juego al fútbol.", "Mi hobby es cocinar.", "¡Suena divertido!"] },
    korean: { situation: { ko: "바벨탑 파티에서 취미로 친구를 사귀세요!", en: "Babel party: hobbies and friends!", es: "Fiesta Babel: hobbies y amigos." }, gptPrompt: "You are a friendly guest at Babel Tower party. Simple A1 {targetLang}. 취미, 운동, 여가. Find common interests. Mix in 음식 from Unit 3.", speechLang: "ko-KR", suggestedAnswers: ["뭘 좋아하세요?", "책 읽기를 좋아해요.", "운동을 하세요?", "축구를 해요.", "제 취미는 요리예요.", "재미있겠어요!"] },
  },

  day_28: {
    english: { situation: { ko: "루디의 팀원이 힘들어하고 있습니다. 감정을 물어보고 격려하세요!", en: "Rudy's teammate is struggling. Ask about feelings and encourage them!", es: "El compañero de Rudy sufre. Pregunta cómo se siente y anímalo." }, gptPrompt: "You are Rudy's teammate who is feeling down after a tough mission. The user should ask how you're feeling, understand your emotions, and encourage you. Simple A1 {targetLang}. Express: tired, worried, then gradually become happier as the user cheers you up. Practice all emotion vocabulary. End on a positive note.", speechLang: "en-GB", suggestedAnswers: ["How are you feeling?", "Are you okay?", "You look tired.", "Don't worry!", "I am excited about tomorrow!", "That sounds great!"] },
    spanish: { situation: { ko: "팀원이 힘들어해요. 격려하세요!", en: "Teammate is down. Encourage them!", es: "Compañero desanimado. ¡Anímalo!" }, gptPrompt: "You are a teammate feeling down. Simple A1 {targetLang}. User asks about feelings and encourages. Express: tired, worried, then happier. End positive.", speechLang: "es-ES", suggestedAnswers: ["¿Cómo te sientes?", "¿Estás bien?", "Pareces cansado.", "¡No te preocupes!", "¡Estoy emocionado por mañana!", "¡Suena genial!"] },
    korean: { situation: { ko: "팀원이 힘들어하고 있어요. 감정을 물어보고 격려하세요!", en: "Teammate struggling. Ask and encourage!", es: "Compañero mal. ¡Pregunta y anima!" }, gptPrompt: "You are a teammate feeling down. Simple A1 {targetLang}. User asks about feelings and encourages. Express: 피곤, 걱정, then 행복. End positive.", speechLang: "ko-KR", suggestedAnswers: ["기분이 어때요?", "괜찮아요?", "피곤해 보여요.", "걱정 마세요!", "내일이 기대돼요!", "좋아요!"] },
  },

  day_29: {
    english: { situation: { ko: "미션 성공! 루디가 팀원들과 축하 파티를 계획합니다!", en: "Mission success! Rudy plans a celebration party with teammates!", es: "¡Misión cumplida! Rudy planea una fiesta de celebración." }, gptPrompt: "You are Rudy's teammate planning a celebration. Simple A1 {targetLang}. Practice: asking if free, suggesting activities (cinema, restaurant, cafe), agreeing/declining, setting time and place. Mix in vocabulary from ALL previous units: food (Unit 3), places (Unit 4), feelings (Unit 5). Create a fun, multi-turn planning conversation.", speechLang: "en-GB", suggestedAnswers: ["Are you free this weekend?", "Let's meet at the cafe.", "Would you like to go to the cinema?", "That sounds great!", "Sorry, I can't.", "See you at three o'clock!"] },
    spanish: { situation: { ko: "미션 성공! 축하 파티를 계획하세요!", en: "Mission success! Plan the party!", es: "¡Misión cumplida! ¡Planea la fiesta!" }, gptPrompt: "You are Rudy's teammate planning a celebration. Simple A1 {targetLang}. Practice: free, suggest activities, agree/decline, time/place. Mix ALL units. Fun conversation.", speechLang: "es-ES", suggestedAnswers: ["¿Estás libre este fin de semana?", "Encontrémonos en el café.", "¿Te gustaría ir al cine?", "¡Suena genial!", "Lo siento, no puedo.", "¡Nos vemos a las tres!"] },
    korean: { situation: { ko: "미션 성공! 팀원들과 축하 파티를 계획하세요!", en: "Mission success! Plan the party!", es: "¡Misión! ¡Planea la fiesta!" }, gptPrompt: "You are Rudy's teammate planning a celebration. Simple A1 {targetLang}. Practice: 시간, activities, agree/decline, 장소. Mix ALL units. Fun conversation.", speechLang: "ko-KR", suggestedAnswers: ["이번 주말에 시간 있어요?", "카페에서 만나요.", "영화관에 갈래요?", "좋아요!", "미안해요, 안 돼요.", "3시에 봐요!"] },
  },

  day_30: {
    english: { situation: { ko: "A1 과정의 마지막 미션! 루디가 모든 것을 종합해서 자기소개부터 약속 잡기까지 해야 합니다!", en: "Final A1 mission! Rudy must combine EVERYTHING: introductions to making plans!", es: "¡Misión final A1! Rudy combina TODO: presentaciones hasta hacer planes." }, gptPrompt: "You are the final mission coordinator at Babel Tower. This is the A1 graduation test. Simple A1 {targetLang}. Test the user on ALL 30 days of vocabulary in a natural conversation: 1) They introduce themselves and family 2) Describe someone 3) Talk about hobbies 4) Express feelings 5) Make plans to meet again. Be encouraging and celebrate their progress. This should feel like a victory lap, not a test. End with congratulations on completing A1!", speechLang: "en-GB", suggestedAnswers: ["Hello, my name is Rudy.", "I have two brothers.", "I am happy today!", "My hobby is cooking.", "Are you free tomorrow?", "Thank you for everything!"] },
    spanish: { situation: { ko: "A1 마지막 미션! 모든 것을 종합하세요!", en: "Final A1 mission! Combine everything!", es: "¡Misión final A1! ¡Combina todo!" }, gptPrompt: "You are the final mission coordinator. A1 graduation test. Simple A1 {targetLang}. Test ALL 30 days naturally: intro, family, describe, hobbies, feelings, plans. Celebrate! Victory lap.", speechLang: "es-ES", suggestedAnswers: ["Hola, me llamo Rudy.", "Tengo dos hermanos.", "¡Estoy feliz hoy!", "Mi hobby es cocinar.", "¿Estás libre mañana?", "¡Gracias por todo!"] },
    korean: { situation: { ko: "A1 마지막 미션! 30일 동안 배운 모든 것을 사용하세요!", en: "Final A1 mission! Use everything!", es: "¡Misión final! ¡Usa todo!" }, gptPrompt: "You are the final mission coordinator. A1 graduation. Simple A1 {targetLang}. Test ALL 30 days: 자기소개, 가족, 묘사, 취미, 감정, 약속. Celebrate! Victory lap.", speechLang: "ko-KR", suggestedAnswers: ["안녕하세요, 루디예요.", "형이 둘 있어요.", "오늘 행복해요!", "취미는 요리예요.", "내일 시간 있어요?", "모든 것에 감사해요!"] },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4: REVIEW (Unit 5)
// ═══════════════════════════════════════════════════════════════════════════════

export const REVIEW_CONTENT_UNIT5: Record<string, Partial<Record<LearningLangKey, ReviewQuestion[]>>> = {

  day_25: {
    english: [
      { type: "speak", sentence: "Excuse me, I'm lost. Can you show me on the map?", speechLang: "en-GB", meaning: { ko: "길 잃었어요. 지도에서 보여주세요.", en: "Lost. Show me on the map?", es: "Perdido. ¿Mapa?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Take the subway to exit ___.", answer: "three", options: ["three", "left", "far"], fullSentence: "Take the subway to exit three.", fullSentenceMeaning: { ko: "지하철 3번 출구.", en: "Subway exit three.", es: "Metro salida tres." }, isYesterdayReview: true },
      { type: "speak", sentence: "This is my family. I have two brothers.", speechLang: "en-GB", meaning: { ko: "제 가족이에요. 형제가 둘.", en: "My family. Two brothers.", es: "Mi familia. Dos hermanos." } },
      { type: "fill_blank", promptWithBlank: "My mother is a ___.", answer: "teacher", options: ["teacher", "brother", "child"], fullSentence: "My mother is a teacher.", fullSentenceMeaning: { ko: "어머니는 선생님.", en: "Mother is a teacher.", es: "Madre es profesora." } },
      { type: "speak", sentence: "Do you have any children?", speechLang: "en-GB", meaning: { ko: "자녀가 있으세요?", en: "Have children?", es: "¿Tienes hijos?" } },
    ],
    spanish: [
      { type: "speak", sentence: "Perdone, estoy perdido. ¿Me puede señalar en el mapa?", speechLang: "es-ES", meaning: { ko: "길 잃었어요. 지도에서 보여주세요.", en: "Lost. Map?", es: "Perdido. ¿Mapa?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Toma el metro hasta la salida ___.", answer: "tres", options: ["tres", "izquierda", "lejos"], fullSentence: "Toma el metro hasta la salida tres.", fullSentenceMeaning: { ko: "지하철 3번 출구.", en: "Subway exit three.", es: "Metro salida tres." }, isYesterdayReview: true },
      { type: "speak", sentence: "Esta es mi familia. Tengo dos hermanos.", speechLang: "es-ES", meaning: { ko: "제 가족. 형제 둘.", en: "My family. Two brothers.", es: "Mi familia. Dos hermanos." } },
      { type: "fill_blank", promptWithBlank: "Mi madre es ___.", answer: "profesora", options: ["profesora", "hermano", "hijo"], fullSentence: "Mi madre es profesora.", fullSentenceMeaning: { ko: "어머니는 선생님.", en: "Mother is teacher.", es: "Madre profesora." } },
      { type: "speak", sentence: "¿Tienes hijos?", speechLang: "es-ES", meaning: { ko: "자녀 있으세요?", en: "Have children?", es: "¿Hijos?" } },
    ],
    korean: [
      { type: "speak", sentence: "실례합니다, 길 잃었어요. 지도에서 보여주세요.", speechLang: "ko-KR", meaning: { ko: "길 잃었어요. 지도.", en: "Lost. Map.", es: "Perdido. Mapa." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "지하철 ___ 출구로 가세요.", answer: "3번", options: ["3번", "왼쪽", "먼"], fullSentence: "지하철 3번 출구로 가세요.", fullSentenceMeaning: { ko: "지하철 3번 출구.", en: "Subway exit 3.", es: "Metro salida 3." }, isYesterdayReview: true },
      { type: "speak", sentence: "이것은 제 가족이에요. 형이 둘 있어요.", speechLang: "ko-KR", meaning: { ko: "제 가족. 형 둘.", en: "My family. Two brothers.", es: "Mi familia. Dos hermanos." } },
      { type: "fill_blank", promptWithBlank: "어머니는 ___이에요.", answer: "선생님", options: ["선생님", "형", "아이"], fullSentence: "어머니는 선생님이에요.", fullSentenceMeaning: { ko: "어머니는 선생님.", en: "Mother is teacher.", es: "Madre profesora." } },
      { type: "speak", sentence: "자녀가 있으세요?", speechLang: "ko-KR", meaning: { ko: "자녀 있으세요?", en: "Have children?", es: "¿Hijos?" } },
    ],
  },

  day_26: {
    english: [
      { type: "speak", sentence: "This is my family. My father works at a hospital.", speechLang: "en-GB", meaning: { ko: "제 가족. 아버지는 병원에서 일해요.", en: "My family. Father works at hospital.", es: "Mi familia. Padre trabaja en hospital." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "I have two ___ and one sister.", answer: "brothers", options: ["brothers", "mothers", "teachers"], fullSentence: "I have two brothers and one sister.", fullSentenceMeaning: { ko: "형제 둘, 자매 하나.", en: "Two brothers, one sister.", es: "Dos hermanos, una hermana." }, isYesterdayReview: true },
      { type: "speak", sentence: "She is tall and has long hair.", speechLang: "en-GB", meaning: { ko: "키 크고 머리 길어요.", en: "Tall, long hair.", es: "Alta, pelo largo." } },
      { type: "fill_blank", promptWithBlank: "He is ___ a blue jacket.", answer: "wearing", options: ["wearing", "eating", "reading"], fullSentence: "He is wearing a blue jacket.", fullSentenceMeaning: { ko: "파란 재킷 입고 있어요.", en: "Wearing blue jacket.", es: "Lleva chaqueta azul." } },
      { type: "speak", sentence: "The man with glasses is my teacher.", speechLang: "en-GB", meaning: { ko: "안경 쓴 남자가 선생님.", en: "Man with glasses is teacher.", es: "Hombre con gafas es profesor." } },
    ],
    spanish: [
      { type: "speak", sentence: "Esta es mi familia. Mi padre trabaja en un hospital.", speechLang: "es-ES", meaning: { ko: "제 가족. 아버지는 병원.", en: "My family. Father at hospital.", es: "Mi familia. Padre en hospital." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Tengo dos ___ y una hermana.", answer: "hermanos", options: ["hermanos", "madres", "profesores"], fullSentence: "Tengo dos hermanos y una hermana.", fullSentenceMeaning: { ko: "형제 둘, 자매 하나.", en: "Two brothers, one sister.", es: "Dos hermanos, una hermana." }, isYesterdayReview: true },
      { type: "speak", sentence: "Ella es alta y tiene el pelo largo.", speechLang: "es-ES", meaning: { ko: "키 크고 머리 길어요.", en: "Tall, long hair.", es: "Alta, pelo largo." } },
      { type: "fill_blank", promptWithBlank: "Él ___ una chaqueta azul.", answer: "lleva", options: ["lleva", "come", "lee"], fullSentence: "Él lleva una chaqueta azul.", fullSentenceMeaning: { ko: "파란 재킷 입고 있어요.", en: "Wearing blue jacket.", es: "Lleva chaqueta azul." } },
      { type: "speak", sentence: "El hombre con gafas es mi profesor.", speechLang: "es-ES", meaning: { ko: "안경 쓴 남자가 선생님.", en: "Man with glasses is teacher.", es: "Hombre con gafas, profesor." } },
    ],
    korean: [
      { type: "speak", sentence: "제 가족이에요. 아버지는 병원에서 일해요.", speechLang: "ko-KR", meaning: { ko: "가족. 아버지는 병원.", en: "Family. Father at hospital.", es: "Familia. Padre en hospital." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "형이 ___ 있어요.", answer: "둘", options: ["둘", "셋", "넷"], fullSentence: "형이 둘 있어요.", fullSentenceMeaning: { ko: "형 둘.", en: "Two brothers.", es: "Dos hermanos." }, isYesterdayReview: true },
      { type: "speak", sentence: "키가 크고 머리가 길어요.", speechLang: "ko-KR", meaning: { ko: "키 크고 머리 길어요.", en: "Tall, long hair.", es: "Alta, pelo largo." } },
      { type: "fill_blank", promptWithBlank: "파란색 재킷을 ___ 있어요.", answer: "입고", options: ["입고", "먹고", "읽고"], fullSentence: "파란색 재킷을 입고 있어요.", fullSentenceMeaning: { ko: "파란 재킷 입고 있어요.", en: "Wearing blue jacket.", es: "Lleva chaqueta azul." } },
      { type: "speak", sentence: "안경 쓴 남자가 선생님이에요.", speechLang: "ko-KR", meaning: { ko: "안경 쓴 남자가 선생님.", en: "Man with glasses is teacher.", es: "Hombre con gafas, profesor." } },
    ],
  },

  day_27: {
    english: [
      { type: "speak", sentence: "She is tall and has long hair. She is wearing a blue jacket.", speechLang: "en-GB", meaning: { ko: "키 크고 머리 길어요. 파란 재킷.", en: "Tall, long hair. Blue jacket.", es: "Alta, pelo largo. Chaqueta azul." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "The man with ___ is my teacher.", answer: "glasses", options: ["glasses", "hair", "jacket"], fullSentence: "The man with glasses is my teacher.", fullSentenceMeaning: { ko: "안경 쓴 남자가 선생님.", en: "Man with glasses, teacher.", es: "Hombre con gafas, profesor." }, isYesterdayReview: true },
      { type: "speak", sentence: "I like reading books and watching movies.", speechLang: "en-GB", meaning: { ko: "책 읽기와 영화 보기를 좋아해요.", en: "Like reading and movies.", es: "Leer y ver películas." } },
      { type: "fill_blank", promptWithBlank: "I ___ football every weekend.", answer: "play", options: ["play", "read", "cook"], fullSentence: "I play football every weekend.", fullSentenceMeaning: { ko: "매주 주말 축구.", en: "Football every weekend.", es: "Fútbol cada fin de semana." } },
      { type: "speak", sentence: "My hobby is cooking. What do you like to do?", speechLang: "en-GB", meaning: { ko: "취미는 요리. 뭘 좋아해요?", en: "Hobby: cooking. What do you like?", es: "Hobby: cocinar. ¿Qué te gusta?" } },
      { type: "speak", sentence: "Where is the bathroom?", speechLang: "en-GB", meaning: { ko: "화장실이 어디에요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" }, isYesterdayReview: true },
      { type: "speak", sentence: "How much is this?", speechLang: "en-GB", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" }, isYesterdayReview: true },
    ],
    spanish: [
      { type: "speak", sentence: "Ella es alta y tiene pelo largo. Lleva chaqueta azul.", speechLang: "es-ES", meaning: { ko: "키 크고 머리 길어요. 파란 재킷.", en: "Tall, long hair. Blue jacket.", es: "Alta, pelo largo. Chaqueta azul." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "El hombre con ___ es mi profesor.", answer: "gafas", options: ["gafas", "pelo", "chaqueta"], fullSentence: "El hombre con gafas es mi profesor.", fullSentenceMeaning: { ko: "안경 쓴 남자가 선생님.", en: "Man with glasses, teacher.", es: "Hombre con gafas, profesor." }, isYesterdayReview: true },
      { type: "speak", sentence: "Me gusta leer libros y ver películas.", speechLang: "es-ES", meaning: { ko: "책 읽기와 영화 보기 좋아해요.", en: "Like reading and movies.", es: "Leer y ver películas." } },
      { type: "fill_blank", promptWithBlank: "___ al fútbol los fines de semana.", answer: "Juego", options: ["Juego", "Leo", "Cocino"], fullSentence: "Juego al fútbol los fines de semana.", fullSentenceMeaning: { ko: "주말에 축구.", en: "Football on weekends.", es: "Fútbol fines de semana." } },
      { type: "speak", sentence: "Mi hobby es cocinar. ¿Qué te gusta hacer?", speechLang: "es-ES", meaning: { ko: "취미는 요리. 뭘 좋아해?", en: "Hobby: cooking. You?", es: "Hobby: cocinar. ¿Tú?" } },
      { type: "speak", sentence: "¿Dónde está el baño?", speechLang: "es-ES", meaning: { ko: "화장실이 어디에요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" }, isYesterdayReview: true },
      { type: "speak", sentence: "¿Cuánto cuesta esto?", speechLang: "es-ES", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" }, isYesterdayReview: true },
    ],
    korean: [
      { type: "speak", sentence: "키가 크고 머리가 길어요. 파란 재킷을 입었어요.", speechLang: "ko-KR", meaning: { ko: "키 크고 머리 길어요. 파란 재킷.", en: "Tall, long hair. Blue jacket.", es: "Alta, pelo largo. Chaqueta azul." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "___ 쓴 남자가 선생님이에요.", answer: "안경", options: ["안경", "머리", "재킷"], fullSentence: "안경 쓴 남자가 선생님이에요.", fullSentenceMeaning: { ko: "안경 쓴 남자가 선생님.", en: "Man with glasses, teacher.", es: "Hombre con gafas, profesor." }, isYesterdayReview: true },
      { type: "speak", sentence: "책 읽기와 영화 보기를 좋아해요.", speechLang: "ko-KR", meaning: { ko: "책 읽기, 영화 보기 좋아해요.", en: "Like reading and movies.", es: "Leer y películas." } },
      { type: "fill_blank", promptWithBlank: "매주 주말에 ___를 해요.", answer: "축구", options: ["축구", "책", "요리"], fullSentence: "매주 주말에 축구를 해요.", fullSentenceMeaning: { ko: "매주 주말 축구.", en: "Football every weekend.", es: "Fútbol cada fin de semana." } },
      { type: "speak", sentence: "취미는 요리예요. 뭘 좋아하세요?", speechLang: "ko-KR", meaning: { ko: "취미는 요리. 뭘 좋아해요?", en: "Hobby: cooking. You?", es: "Hobby: cocinar. ¿Tú?" } },
      { type: "speak", sentence: "화장실이 어디에요?", speechLang: "ko-KR", meaning: { ko: "화장실이 어디에요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" }, isYesterdayReview: true },
      { type: "speak", sentence: "이거 얼마예요?", speechLang: "ko-KR", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" }, isYesterdayReview: true },
    ],
  },

  day_28: {
    english: [
      { type: "speak", sentence: "I like reading books. My hobby is cooking.", speechLang: "en-GB", meaning: { ko: "책 읽기 좋아해요. 취미는 요리.", en: "Like reading. Hobby: cooking.", es: "Leer. Hobby: cocinar." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Do you play any ___?", answer: "sports", options: ["sports", "books", "food"], fullSentence: "Do you play any sports?", fullSentenceMeaning: { ko: "스포츠 하세요?", en: "Play sports?", es: "¿Practicas deporte?" }, isYesterdayReview: true },
      { type: "speak", sentence: "I am very happy today. I am excited about the trip!", speechLang: "en-GB", meaning: { ko: "오늘 행복해요. 여행이 기대돼!", en: "Happy today. Excited about trip!", es: "Feliz hoy. ¡Emocionado por el viaje!" } },
      { type: "fill_blank", promptWithBlank: "I am tired ___ I worked all day.", answer: "because", options: ["because", "but", "and"], fullSentence: "I am tired because I worked all day.", fullSentenceMeaning: { ko: "일해서 피곤해요.", en: "Tired because worked.", es: "Cansado porque trabajé." } },
      { type: "speak", sentence: "Are you okay? You look worried.", speechLang: "en-GB", meaning: { ko: "괜찮아요? 걱정돼 보여요.", en: "OK? Look worried.", es: "¿Bien? Preocupado." } },
    ],
    spanish: [
      { type: "speak", sentence: "Me gusta leer. Mi hobby es cocinar.", speechLang: "es-ES", meaning: { ko: "책 읽기 좋아해요. 취미는 요리.", en: "Like reading. Hobby: cooking.", es: "Leer. Hobby: cocinar." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿Practicas algún ___?", answer: "deporte", options: ["deporte", "libro", "comida"], fullSentence: "¿Practicas algún deporte?", fullSentenceMeaning: { ko: "스포츠 하세요?", en: "Play sports?", es: "¿Deporte?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Estoy muy feliz hoy. ¡Estoy emocionado por el viaje!", speechLang: "es-ES", meaning: { ko: "오늘 행복. 여행 기대!", en: "Happy. Excited about trip!", es: "Feliz. ¡Emocionado!" } },
      { type: "fill_blank", promptWithBlank: "Estoy cansado ___ trabajé todo el día.", answer: "porque", options: ["porque", "pero", "y"], fullSentence: "Estoy cansado porque trabajé todo el día.", fullSentenceMeaning: { ko: "일해서 피곤.", en: "Tired because worked.", es: "Cansado porque trabajé." } },
      { type: "speak", sentence: "¿Estás bien? Pareces preocupado.", speechLang: "es-ES", meaning: { ko: "괜찮아? 걱정돼 보여.", en: "OK? Worried?", es: "¿Bien? ¿Preocupado?" } },
    ],
    korean: [
      { type: "speak", sentence: "책 읽기를 좋아해요. 취미는 요리예요.", speechLang: "ko-KR", meaning: { ko: "책 읽기 좋아해요. 취미는 요리.", en: "Like reading. Hobby: cooking.", es: "Leer. Hobby: cocinar." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "___을 하세요?", answer: "운동", options: ["운동", "책", "음식"], fullSentence: "운동을 하세요?", fullSentenceMeaning: { ko: "운동 하세요?", en: "Exercise?", es: "¿Ejercicio?" }, isYesterdayReview: true },
      { type: "speak", sentence: "오늘 매우 행복해요. 여행이 기대돼요!", speechLang: "ko-KR", meaning: { ko: "오늘 행복. 여행 기대!", en: "Happy. Excited about trip!", es: "Feliz. ¡Emocionado!" } },
      { type: "fill_blank", promptWithBlank: "일___서 피곤해요.", answer: "해", options: ["해", "하", "한"], fullSentence: "일해서 피곤해요.", fullSentenceMeaning: { ko: "일해서 피곤.", en: "Tired from work.", es: "Cansado de trabajar." } },
      { type: "speak", sentence: "괜찮아요? 걱정되어 보여요.", speechLang: "ko-KR", meaning: { ko: "괜찮아? 걱정돼 보여.", en: "OK? Worried?", es: "¿Bien? ¿Preocupado?" } },
    ],
  },

  day_29: {
    english: [
      { type: "speak", sentence: "I am happy today! I am excited about the weekend.", speechLang: "en-GB", meaning: { ko: "오늘 행복! 주말이 기대돼.", en: "Happy! Excited for weekend.", es: "¡Feliz! ¡Emocionado por el fin de semana!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Are you okay? You look ___.", answer: "worried", options: ["worried", "happy", "tall"], fullSentence: "Are you okay? You look worried.", fullSentenceMeaning: { ko: "괜찮아? 걱정돼 보여.", en: "OK? Worried?", es: "¿Bien? ¿Preocupado?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Are you free this weekend? Let's meet at the cafe.", speechLang: "en-GB", meaning: { ko: "주말에 시간 있어? 카페에서 만나요.", en: "Free? Meet at cafe.", es: "¿Libre? Café." } },
      { type: "fill_blank", promptWithBlank: "Would you ___ to go to the cinema?", answer: "like", options: ["like", "want", "have"], fullSentence: "Would you like to go to the cinema?", fullSentenceMeaning: { ko: "영화관 갈래요?", en: "Cinema?", es: "¿Cine?" } },
      { type: "speak", sentence: "That sounds great! See you at three o'clock.", speechLang: "en-GB", meaning: { ko: "좋아요! 3시에 봐요.", en: "Great! See you at three.", es: "¡Genial! A las tres." } },
    ],
    spanish: [
      { type: "speak", sentence: "¡Estoy feliz hoy! Estoy emocionado por el fin de semana.", speechLang: "es-ES", meaning: { ko: "오늘 행복! 주말 기대!", en: "Happy! Excited for weekend!", es: "¡Feliz! ¡Emocionado!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿Estás bien? Pareces ___.", answer: "preocupado", options: ["preocupado", "feliz", "alto"], fullSentence: "¿Estás bien? Pareces preocupado.", fullSentenceMeaning: { ko: "괜찮아? 걱정돼 보여.", en: "OK? Worried?", es: "¿Bien? ¿Preocupado?" }, isYesterdayReview: true },
      { type: "speak", sentence: "¿Estás libre este fin de semana? Encontrémonos en el café.", speechLang: "es-ES", meaning: { ko: "주말 시간 있어? 카페에서.", en: "Free? Meet at cafe.", es: "¿Libre? Café." } },
      { type: "fill_blank", promptWithBlank: "¿Te ___ ir al cine?", answer: "gustaría", options: ["gustaría", "gusta", "quiere"], fullSentence: "¿Te gustaría ir al cine?", fullSentenceMeaning: { ko: "영화관 갈래?", en: "Cinema?", es: "¿Cine?" } },
      { type: "speak", sentence: "¡Suena genial! Nos vemos a las tres.", speechLang: "es-ES", meaning: { ko: "좋아! 3시에.", en: "Great! At three.", es: "¡Genial! A las tres." } },
    ],
    korean: [
      { type: "speak", sentence: "오늘 행복해요! 주말이 기대돼요.", speechLang: "ko-KR", meaning: { ko: "오늘 행복! 주말 기대!", en: "Happy! Excited for weekend!", es: "¡Feliz! ¡Emocionado!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "괜찮아요? ___되어 보여요.", answer: "걱정", options: ["걱정", "행복", "키가"], fullSentence: "괜찮아요? 걱정되어 보여요.", fullSentenceMeaning: { ko: "괜찮아? 걱정돼 보여.", en: "OK? Worried?", es: "¿Bien? ¿Preocupado?" }, isYesterdayReview: true },
      { type: "speak", sentence: "이번 주말에 시간 있어요? 카페에서 만나요.", speechLang: "ko-KR", meaning: { ko: "주말 시간 있어? 카페.", en: "Free? Cafe.", es: "¿Libre? Café." } },
      { type: "fill_blank", promptWithBlank: "영화관에 ___요?", answer: "갈래", options: ["갈래", "먹을래", "할래"], fullSentence: "영화관에 갈래요?", fullSentenceMeaning: { ko: "영화관 갈래?", en: "Cinema?", es: "¿Cine?" } },
      { type: "speak", sentence: "좋아요! 3시에 봐요.", speechLang: "ko-KR", meaning: { ko: "좋아! 3시에.", en: "Great! At three.", es: "¡Genial! A las tres." } },
    ],
  },

  day_30: {
    english: [
      { type: "speak", sentence: "Are you free this weekend? Let's meet at the cafe at three.", speechLang: "en-GB", meaning: { ko: "주말 시간 있어? 3시에 카페.", en: "Free? Cafe at three.", es: "¿Libre? Café a las tres." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Sorry, I ___. I have plans.", answer: "can't", options: ["can't", "don't", "won't"], fullSentence: "Sorry, I can't. I have plans.", fullSentenceMeaning: { ko: "미안, 안 돼. 약속 있어.", en: "Sorry, can't. Plans.", es: "Lo siento, no puedo." }, isYesterdayReview: true },
      { type: "speak", sentence: "Hello, my name is Rudy. I am from Korea. I have two brothers.", speechLang: "en-GB", meaning: { ko: "안녕, 루디예요. 한국. 형제 둘.", en: "Hi, Rudy. Korea. Two brothers.", es: "Hola, Rudy. Corea. Dos hermanos." } },
      { type: "fill_blank", promptWithBlank: "I am ___ because I finished all my lessons!", answer: "happy", options: ["happy", "tired", "worried"], fullSentence: "I am happy because I finished all my lessons!", fullSentenceMeaning: { ko: "수업 다 끝내서 행복!", en: "Happy, finished lessons!", es: "¡Feliz, terminé lecciones!" } },
      { type: "speak", sentence: "Thank you for everything. See you next time!", speechLang: "en-GB", meaning: { ko: "모든 것에 감사. 다음에!", en: "Thanks! See you!", es: "¡Gracias! ¡Nos vemos!" } },
    ],
    spanish: [
      { type: "speak", sentence: "¿Estás libre? Encontrémonos en el café a las tres.", speechLang: "es-ES", meaning: { ko: "시간 있어? 3시에 카페.", en: "Free? Cafe at three.", es: "¿Libre? Café a las tres." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Lo siento, no ___. Tengo planes.", answer: "puedo", options: ["puedo", "quiero", "voy"], fullSentence: "Lo siento, no puedo. Tengo planes.", fullSentenceMeaning: { ko: "미안, 안 돼. 약속 있어.", en: "Sorry, can't. Plans.", es: "No puedo. Planes." }, isYesterdayReview: true },
      { type: "speak", sentence: "Hola, me llamo Rudy. Soy de Corea. Tengo dos hermanos.", speechLang: "es-ES", meaning: { ko: "안녕, 루디. 한국. 형제 둘.", en: "Hi, Rudy. Korea. Two brothers.", es: "Hola, Rudy. Corea. Dos hermanos." } },
      { type: "fill_blank", promptWithBlank: "Estoy ___ porque terminé todas mis lecciones.", answer: "feliz", options: ["feliz", "cansado", "preocupado"], fullSentence: "Estoy feliz porque terminé todas mis lecciones.", fullSentenceMeaning: { ko: "수업 끝내서 행복!", en: "Happy, finished!", es: "¡Feliz, terminé!" } },
      { type: "speak", sentence: "Gracias por todo. ¡Hasta la próxima!", speechLang: "es-ES", meaning: { ko: "모든 것에 감사. 다음에!", en: "Thanks! Until next time!", es: "¡Gracias! ¡Próxima!" } },
    ],
    korean: [
      { type: "speak", sentence: "시간 있어요? 3시에 카페에서 만나요.", speechLang: "ko-KR", meaning: { ko: "시간 있어? 3시 카페.", en: "Free? Cafe at three.", es: "¿Libre? Café a las tres." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "미안해요, ___ 돼요. 약속이 있어요.", answer: "안", options: ["안", "잘", "못"], fullSentence: "미안해요, 안 돼요. 약속이 있어요.", fullSentenceMeaning: { ko: "미안, 안 돼. 약속 있어.", en: "Sorry, can't. Plans.", es: "Lo siento, no puedo." }, isYesterdayReview: true },
      { type: "speak", sentence: "안녕하세요, 루디예요. 한국에서 왔어요. 형이 둘 있어요.", speechLang: "ko-KR", meaning: { ko: "안녕, 루디. 한국. 형 둘.", en: "Hi, Rudy. Korea. Two brothers.", es: "Hola, Rudy. Corea. Dos hermanos." } },
      { type: "fill_blank", promptWithBlank: "수업을 끝내서 ___요!", answer: "행복해", options: ["행복해", "피곤해", "걱정돼"], fullSentence: "수업을 끝내서 행복해요!", fullSentenceMeaning: { ko: "끝내서 행복!", en: "Happy, finished!", es: "¡Feliz, terminé!" } },
      { type: "speak", sentence: "모든 것에 감사해요. 다음에 봐요!", speechLang: "ko-KR", meaning: { ko: "감사. 다음에!", en: "Thanks! See you!", es: "¡Gracias! ¡Nos vemos!" } },
    ],
  },
};
