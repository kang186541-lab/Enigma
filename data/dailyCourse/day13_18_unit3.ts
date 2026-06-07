/**
 * NEW Day 13-18 Content (Unit 3: Food & Ordering)
 *
 * Day 13: Food Names & Favourite Food (What food do you like?)
 * Day 14: Ordering at a Restaurant (Ordering at a restaurant)
 * Day 15: Asking About Prices (How much is this?)
 * Day 16: Expressing Food Feelings (This is delicious!)
 * Day 17: Recommending Food (I recommend the...)
 * Day 18: Unit 3 Review
 *
 * Each day has:
 * - STEP 1: 5 sentences (Listen & Repeat)
 * - STEP 2: 4-5 quizzes (mix of select + input)
 * - STEP 3: Mission Talk GPT prompt + suggested answers
 * - STEP 4: 5 review questions (mix of speak + fill_blank, with yesterday review)
 *
 * Vocabulary from Day 1-12 naturally reappears for spaced repetition.
 *
 * To apply: Add these entries to LESSON_CONTENT, MISSION_CONTENT, and
 * REVIEW_CONTENT in lib/lessonContent.ts. Also add Day 13-18 to UNITS in
 * lib/dailyCourseData.ts.
 */

import type { Tri } from "../../lib/dailyCourseData";
import type {
  DayLessonData,
  MissionTalkLangData,
  ReviewQuestion,
  LearningLangKey,
  GrammarExplanation,
} from "../../lib/lessonContent";

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1 + STEP 2 (LESSON_CONTENT)
// ═══════════════════════════════════════════════════════════════════════════════

export const LESSON_CONTENT_UNIT3: Record<string, Partial<Record<LearningLangKey, DayLessonData>>> = {

  // ─────────────── Day 13: Food Names & Favourite Food ─────────────────────
  day_13: {
    english: {
      step1Sentences: [
        { text: "I like pizza and pasta.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "저는 피자와 파스타를 좋아해요.", en: "I like pizza and pasta.", es: "Me gusta la pizza y la pasta." } },
        { text: "What food do you like?", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "어떤 음식을 좋아하세요?", en: "What food do you like?", es: "¿Qué comida te gusta?" } },
        { text: "I love Korean food.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "한국 음식을 정말 좋아해요.", en: "I love Korean food.", es: "Me encanta la comida coreana." } },
        { text: "I don't like spicy food.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "매운 음식을 안 좋아해요.", en: "I don't like spicy food.", es: "No me gusta la comida picante." }, recallRound: true },
        { text: "Are you hungry?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "배고프세요?", en: "Are you hungry?", es: "¿Tienes hambre?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: I like ___ / I love ___ / I don't like ___. 질문: What food do you like? 좋아하면 like, 정말 좋아하면 love, 싫으면 don't like.", en: "Pattern: I like ___ / I love ___ / I don't like ___. Question: What food do you like? Use 'like' for preference, 'love' for strong preference, 'don't like' for dislikes.", es: "Patrón: I like ___ / I love ___ / I don't like ___. Pregunta: What food do you like? 'like' = gustar, 'love' = encantar, 'don't like' = no gustar." },
          examples: { ko: "I like chicken and rice. (치킨이랑 밥을 좋아해요.)\nI love Italian food. (이탈리아 음식을 정말 좋아해요.)\nI don't like bitter coffee. (쓴 커피를 안 좋아해요.)", en: "I like chicken and rice. (Stating a food preference.)\nI love Italian food. (Expressing strong liking.)\nI don't like bitter coffee. (Saying what you dislike.)", es: "I like chicken and rice. (Expresando una preferencia.)\nI love Italian food. (Expresando que te encanta.)\nI don't like bitter coffee. (Diciendo lo que no te gusta.)" },
          mistakes: { ko: "❌ I like eat pizza.\n✅ I like pizza. (like 뒤에 바로 음식 이름이 와요!)\n\n❌ I am like spicy food.\n✅ I like spicy food. (like는 동사라 am 필요 없어요!)", en: "❌ I like eat pizza.\n✅ I like pizza. (Put the food directly after 'like' — no extra verb needed!)\n\n❌ I am like spicy food.\n✅ I like spicy food. ('Like' is already a verb — don't add 'am'!)", es: "❌ I like eat pizza.\n✅ I like pizza. (Pon la comida directamente después de 'like'.)\n\n❌ I am like spicy food.\n✅ I like spicy food. ('Like' ya es verbo — ¡no agregues 'am'!)" },
          rudyTip: { ko: "탐정 루디의 팁: 잠입 수사의 기본은 상대방과 대화를 이끄는 거야! 'What food do you like?'로 먼저 물어보고, 답이 오면 'Me too!' 하면 자연스럽게 친해질 수 있어~", en: "Detective Rudy's tip: The key to going undercover? Start with 'What food do you like?' — people love talking about food! Say 'Me too!' and you've got instant rapport.", es: "Consejo del detective Rudy: ¿La clave para ir encubierto? Empieza con 'What food do you like?' — ¡a todos les gusta hablar de comida! Di 'Me too!' y tendrás conexión instantánea." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "I ___ pizza and pasta.", answer: "like", options: ["like", "want", "eat"], fullSentence: "I like pizza and pasta.", fullSentenceMeaning: { ko: "저는 피자와 파스타를 좋아해요.", en: "I like pizza and pasta.", es: "Me gusta la pizza y la pasta." } },
          { type: "select", promptWithBlank: "What food do you ___?", answer: "like", options: ["like", "eat", "want"], fullSentence: "What food do you like?", fullSentenceMeaning: { ko: "어떤 음식을 좋아하세요?", en: "What food do you like?", es: "¿Qué comida te gusta?" } },
          { type: "select", promptWithBlank: "I don't like ___ food.", answer: "spicy", options: ["spicy", "spice", "hot"], fullSentence: "I don't like spicy food.", fullSentenceMeaning: { ko: "매운 음식을 안 좋아해요.", en: "I don't like spicy food.", es: "No me gusta la comida picante." } },
          { type: "input", promptWithBlank: "Are you ___?", answer: "hungry", fullSentence: "Are you hungry?", fullSentenceMeaning: { ko: "배고프세요?", en: "Are you hungry?", es: "¿Tienes hambre?" } },
          { type: "input", promptWithBlank: "I ___ Korean food.", answer: "love", fullSentence: "I love Korean food.", fullSentenceMeaning: { ko: "한국 음식을 정말 좋아해요.", en: "I love Korean food.", es: "Me encanta la comida coreana." } },
          { type: "listening", audioText: "Are you hungry?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Are you hungry?", "I love Korean food.", "I don't like spicy food.", "What food do you like?"], correct: 0, audioOnly: true },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Me gusta la pizza y la pasta.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "저는 피자와 파스타를 좋아해요.", en: "I like pizza and pasta.", es: "Me gusta la pizza y la pasta." } },
        { text: "¿Qué comida te gusta?", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "어떤 음식을 좋아하세요?", en: "What food do you like?", es: "¿Qué comida te gusta?" } },
        { text: "Me encanta la comida coreana.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "한국 음식을 정말 좋아해요.", en: "I love Korean food.", es: "Me encanta la comida coreana." } },
        { text: "No me gusta la comida picante.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "매운 음식을 안 좋아해요.", en: "I don't like spicy food.", es: "No me gusta la comida picante." }, recallRound: true },
        { text: "¿Tienes hambre?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "배고프세요?", en: "Are you hungry?", es: "¿Tienes hambre?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Me gusta ___ / Me encanta ___ / No me gusta ___. 질문: ¿Qué comida te gusta? 스페인어에서는 '나에게 좋다'라는 구조예요!", en: "Pattern: Me gusta ___ / Me encanta ___ / No me gusta ___. Question: ¿Qué comida te gusta? In Spanish, you literally say 'it pleases me' — the food is the subject!", es: "Patrón: Me gusta ___ / Me encanta ___ / No me gusta ___. Pregunta: ¿Qué comida te gusta? En español, la comida es el sujeto — '(a mí) me gusta la pizza'." },
          examples: { ko: "Me gusta el arroz con pollo. (치킨 라이스를 좋아해요.)\nMe encanta la comida mexicana. (멕시코 음식을 정말 좋아해요.)\nNo me gusta el café amargo. (쓴 커피를 안 좋아해요.)", en: "Me gusta el arroz con pollo. (I like chicken and rice.)\nMe encanta la comida mexicana. (I love Mexican food.)\nNo me gusta el café amargo. (I don't like bitter coffee.)", es: "Me gusta el arroz con pollo. (Dices lo que te gusta comer.)\nMe encanta la comida mexicana. (Expresas algo que te fascina.)\nNo me gusta el café amargo. (Dices lo que no te gusta.)" },
          mistakes: { ko: "❌ Yo gusto la pizza.\n✅ Me gusta la pizza. ('나는 좋아해'가 아니라 '나에게 좋다' 구조예요!)\n\n❌ Me gusta las frutas.\n✅ Me gustan las frutas. (복수 음식이면 gustan으로 바뀌어요!)", en: "❌ Yo gusto la pizza.\n✅ Me gusta la pizza. (It's not 'I like' — it's 'it pleases me'! The structure is reversed.)\n\n❌ Me gusta las frutas.\n✅ Me gustan las frutas. (Plural foods need 'gustan', not 'gusta'!)", es: "❌ Yo gusto la pizza.\n✅ Me gusta la pizza. (No es 'yo gusto' — es 'me gusta'. ¡La comida es el sujeto!)\n\n❌ Me gusta las frutas.\n✅ Me gustan las frutas. (Con plural, usa 'gustan', no 'gusta'.)" },
          rudyTip: { ko: "탐정 루디의 팁: 스페인어에서 '좋아하다'는 거꾸로야! 'Me gusta la pizza'는 '피자가 나를 기쁘게 한다'란 뜻이거든. 음식이 주어라니, 음식이 주인공인 나라구나~", en: "Detective Rudy's tip: In Spanish, food is the star! 'Me gusta la pizza' literally means 'pizza pleases me.' Think of the food doing the action — a tasty clue to remember!", es: "Consejo del detective Rudy: ¡En español, la comida es la protagonista! 'Me gusta la pizza' = la pizza te agrada a ti. ¡Piénsalo así y nunca lo olvidarás!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Me ___ la pizza y la pasta.", answer: "gusta", options: ["gusta", "gusto", "gustan"], fullSentence: "Me gusta la pizza y la pasta.", fullSentenceMeaning: { ko: "피자와 파스타를 좋아해요.", en: "I like pizza and pasta.", es: "Me gusta la pizza y la pasta." } },
          { type: "select", promptWithBlank: "¿Qué ___ te gusta?", answer: "comida", options: ["comida", "comer", "cocina"], fullSentence: "¿Qué comida te gusta?", fullSentenceMeaning: { ko: "어떤 음식을 좋아하세요?", en: "What food do you like?", es: "¿Qué comida te gusta?" } },
          { type: "select", promptWithBlank: "No me gusta la comida ___.", answer: "picante", options: ["picante", "caliente", "fuerte"], fullSentence: "No me gusta la comida picante.", fullSentenceMeaning: { ko: "매운 음식을 안 좋아해요.", en: "I don't like spicy food.", es: "No me gusta la comida picante." } },
          { type: "input", promptWithBlank: "¿Tienes ___?", answer: "hambre", fullSentence: "¿Tienes hambre?", fullSentenceMeaning: { ko: "배고프세요?", en: "Are you hungry?", es: "¿Tienes hambre?" } },
          { type: "input", promptWithBlank: "Me ___ la comida coreana.", answer: "encanta", fullSentence: "Me encanta la comida coreana.", fullSentenceMeaning: { ko: "한국 음식을 정말 좋아해요.", en: "I love Korean food.", es: "Me encanta la comida coreana." } },
          { type: "listening", audioText: "¿Tienes hambre?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["¿Tienes hambre?", "Me encanta la comida coreana.", "No me gusta la comida picante.", "¿Qué comida te gusta?"], correct: 0, audioOnly: true },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "저는 피자와 파스타를 좋아해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "저는 피자와 파스타를 좋아해요.", en: "I like pizza and pasta.", es: "Me gusta la pizza y la pasta." } },
        { text: "어떤 음식을 좋아하세요?", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "어떤 음식을 좋아하세요?", en: "What food do you like?", es: "¿Qué comida te gusta?" } },
        { text: "한국 음식을 정말 좋아해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "한국 음식을 정말 좋아해요.", en: "I love Korean food.", es: "Me encanta la comida coreana." } },
        { text: "매운 음식을 안 좋아해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "매운 음식을 안 좋아해요.", en: "I don't like spicy food.", es: "No me gusta la comida picante." }, recallRound: true },
        { text: "배고프세요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "배고프세요?", en: "Are you hungry?", es: "¿Tienes hambre?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: ___을/를 좋아해요 / 정말 좋아해요 / 안 좋아해요. 질문: 어떤 음식을 좋아하세요? 받침 있으면 '을', 없으면 '를'.", en: "Pattern: ___을/를 좋아해요 / 정말 좋아해요 / 안 좋아해요. Question: 어떤 음식을 좋아하세요? Use 을 after consonant, 를 after vowel.", es: "Patrón: ___을/를 좋아해요 / 정말 좋아해요 / 안 좋아해요. Pregunta: 어떤 음식을 좋아하세요? Usa 을 tras consonante, 를 tras vocal." },
          examples: { ko: "치킨을 좋아해요. (치킨을 좋아한다는 표현)\n한국 음식을 정말 좋아해요. (정말 좋아할 때)\n쓴 커피를 안 좋아해요. (싫은 음식을 말할 때)", en: "치킨을 좋아해요. (I like chicken. — 을 after ㄴ consonant.)\n한국 음식을 정말 좋아해요. (I really like Korean food — 정말 for emphasis.)\n쓴 커피를 안 좋아해요. (I don't like bitter coffee — 안 before verb for negation.)", es: "치킨을 좋아해요. (Me gusta el pollo. — 을 después de consonante.)\n한국 음식을 정말 좋아해요. (Me encanta la comida coreana — 정말 para énfasis.)\n쓴 커피를 안 좋아해요. (No me gusta el café amargo — 안 antes del verbo para negar.)" },
          mistakes: { ko: "❌ 피자를 좋아해요. (피자 → 받침 없으니 '를' 맞아요! 이건 OK)\n❌ 치킨를 좋아해요.\n✅ 치킨을 좋아해요. (ㄴ 받침 있으니 '을'이에요!)\n\n❌ 좋아해요 안.\n✅ 안 좋아해요. ('안'은 동사 앞에 와요!)", en: "❌ 치킨를 좋아해요.\n✅ 치킨을 좋아해요. (치킨 ends in ㄴ consonant → use 을, not 를!)\n\n❌ 좋아해요 안.\n✅ 안 좋아해요. ('안' goes BEFORE the verb, not after!)", es: "❌ 치킨를 좋아해요.\n✅ 치킨을 좋아해요. (치킨 termina en ㄴ consonante → usa 을, no 를.)\n\n❌ 좋아해요 안.\n✅ 안 좋아해요. ('안' va ANTES del verbo, no después.)" },
          rudyTip: { ko: "탐정 루디의 팁: 을/를 헷갈리면 마지막 글자를 봐! 받침이 있으면 '을', 없으면 '를'이야. 피자→를, 치킨→을! 단서만 잘 보면 틀릴 일 없지~", en: "Detective Rudy's tip: Confused by 을 vs 를? Check the last letter! If it ends in a consonant (받침), use 을. No consonant? Use 를. 피자→를, 치킨→을. Follow the clue!", es: "Consejo del detective Rudy: ¿Confundido con 을 vs 를? ¡Mira la última letra! Si termina en consonante (받침), usa 을. ¿Sin consonante? Usa 를. 피자→를, 치킨→을." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "피자와 파스타를 ___해요.", answer: "좋아", options: ["좋아", "싫어", "먹어"], fullSentence: "피자와 파스타를 좋아해요.", fullSentenceMeaning: { ko: "피자와 파스타를 좋아해요.", en: "I like pizza and pasta.", es: "Me gusta la pizza y la pasta." } },
          { type: "select", promptWithBlank: "어떤 ___을 좋아하세요?", answer: "음식", options: ["음식", "사람", "날씨"], fullSentence: "어떤 음식을 좋아하세요?", fullSentenceMeaning: { ko: "어떤 음식을 좋아하세요?", en: "What food do you like?", es: "¿Qué comida te gusta?" } },
          { type: "select", promptWithBlank: "매운 음식을 ___ 좋아해요.", answer: "안", options: ["안", "못", "잘"], fullSentence: "매운 음식을 안 좋아해요.", fullSentenceMeaning: { ko: "매운 음식을 안 좋아해요.", en: "I don't like spicy food.", es: "No me gusta la comida picante." } },
          { type: "input", promptWithBlank: "___프세요?", answer: "배고", fullSentence: "배고프세요?", fullSentenceMeaning: { ko: "배고프세요?", en: "Are you hungry?", es: "¿Tienes hambre?" } },
          { type: "input", promptWithBlank: "한국 음식을 ___ 좋아해요.", answer: "정말", fullSentence: "한국 음식을 정말 좋아해요.", fullSentenceMeaning: { ko: "한국 음식을 정말 좋아해요.", en: "I love Korean food.", es: "Me encanta la comida coreana." } },
          { type: "listening", audioText: "배고프세요?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["배고프세요?", "한국 음식을 정말 좋아해요.", "매운 음식을 안 좋아해요.", "어떤 음식을 좋아하세요?"], correct: 0, audioOnly: true },
        ],
      },
    },
    indonesian: {
      step1Sentences: [
        { text: "Saya suka pizza dan pasta.", speechLang: "id-ID", meaning: { ko: "저는 피자와 파스타를 좋아해요.", en: "I like pizza and pasta.", es: "Me gusta la pizza y la pasta." } },
        { text: "Kamu suka makanan apa?", speechLang: "id-ID", meaning: { ko: "어떤 음식을 좋아하세요?", en: "What food do you like?", es: "¿Qué comida te gusta?" } },
        { text: "Saya sangat suka makanan Korea.", speechLang: "id-ID", meaning: { ko: "한국 음식을 정말 좋아해요.", en: "I love Korean food.", es: "Me encanta la comida coreana." } },
        { text: "Saya tidak suka makanan pedas.", speechLang: "id-ID", meaning: { ko: "매운 음식을 안 좋아해요.", en: "I don't like spicy food.", es: "No me gusta la comida picante." }, recallRound: true },
        { text: "Apakah kamu lapar?", speechLang: "id-ID", meaning: { ko: "배고프세요?", en: "Are you hungry?", es: "¿Tienes hambre?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Saya suka ___ (좋아해요) / Saya sangat suka ___ (정말 좋아해요) / Saya tidak suka ___ (안 좋아해요). 질문: Kamu suka makanan apa? 'suka'는 '좋아하다', 'tidak'은 부정, 'sangat'은 '아주'예요.", en: "Pattern: Saya suka ___ (I like) / Saya sangat suka ___ (I love, literally 'I very much like') / Saya tidak suka ___ (I don't like). Question: Kamu suka makanan apa? 'suka' = like, 'tidak' = not, 'sangat' = very.", es: "Patrón: Saya suka ___ (me gusta) / Saya sangat suka ___ (me encanta) / Saya tidak suka ___ (no me gusta). Pregunta: Kamu suka makanan apa? 'suka' = gustar, 'tidak' = no, 'sangat' = muy." },
          examples: { ko: "Saya suka ayam dan nasi. (치킨이랑 밥을 좋아해요.)\nSaya sangat suka makanan Italia. (이탈리아 음식을 정말 좋아해요.)\nSaya tidak suka kopi pahit. (쓴 커피를 안 좋아해요.)", en: "Saya suka ayam dan nasi. (I like chicken and rice.)\nSaya sangat suka makanan Italia. (I love Italian food.)\nSaya tidak suka kopi pahit. (I don't like bitter coffee.)", es: "Saya suka ayam dan nasi. (Me gusta el pollo y el arroz.)\nSaya sangat suka makanan Italia. (Me encanta la comida italiana.)\nSaya tidak suka kopi pahit. (No me gusta el café amargo.)" },
          mistakes: { ko: "❌ Saya suka makan pizza.\n✅ Saya suka pizza. (suka 뒤에 바로 음식 이름! '먹다(makan)'를 넣을 필요 없어요.)\n\n❌ Saya no suka pedas.\n✅ Saya tidak suka makanan pedas. (부정은 'no'가 아니라 'tidak'이에요!)", en: "❌ Saya suka makan pizza.\n✅ Saya suka pizza. (Put the food right after 'suka' — no need to add 'makan' (eat)!)\n\n❌ Saya no suka pedas.\n✅ Saya tidak suka makanan pedas. (Use 'tidak' for 'not', never the English/Spanish 'no'!)", es: "❌ Saya suka makan pizza.\n✅ Saya suka pizza. (Pon la comida justo después de 'suka' — no agregues 'makan' (comer).)\n\n❌ Saya no suka pedas.\n✅ Saya tidak suka makanan pedas. (Usa 'tidak' para 'no', nunca 'no' como en español.)" },
          rudyTip: { ko: "탐정 루디의 팁: 잠입 수사의 기본은 대화를 이끄는 거야! 'Kamu suka makanan apa?'로 먼저 물어보고, 답이 오면 'Saya juga!'(저도요!) 하면 금방 친해질 수 있어~", en: "Detective Rudy's tip: The key to going undercover? Ask 'Kamu suka makanan apa?' first — everyone loves talking food! When they answer, say 'Saya juga!' (Me too!) for instant rapport.", es: "Consejo del detective Rudy: ¿La clave para ir encubierto? Pregunta 'Kamu suka makanan apa?' primero — ¡a todos les gusta hablar de comida! Cuando respondan, di 'Saya juga!' (¡Yo también!)." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Saya ___ pizza dan pasta.", answer: "suka", options: ["suka", "mau", "makan"], fullSentence: "Saya suka pizza dan pasta.", fullSentenceMeaning: { ko: "저는 피자와 파스타를 좋아해요.", en: "I like pizza and pasta.", es: "Me gusta la pizza y la pasta." } },
          { type: "select", promptWithBlank: "Kamu suka makanan ___?", answer: "apa", options: ["apa", "siapa", "mana"], fullSentence: "Kamu suka makanan apa?", fullSentenceMeaning: { ko: "어떤 음식을 좋아하세요?", en: "What food do you like?", es: "¿Qué comida te gusta?" } },
          { type: "select", promptWithBlank: "Saya tidak suka makanan ___.", answer: "pedas", options: ["pedas", "panas", "cepat"], fullSentence: "Saya tidak suka makanan pedas.", fullSentenceMeaning: { ko: "매운 음식을 안 좋아해요.", en: "I don't like spicy food.", es: "No me gusta la comida picante." } },
          { type: "input", promptWithBlank: "Apakah kamu ___?", answer: "lapar", fullSentence: "Apakah kamu lapar?", fullSentenceMeaning: { ko: "배고프세요?", en: "Are you hungry?", es: "¿Tienes hambre?" } },
          { type: "input", promptWithBlank: "Saya ___ suka makanan Korea.", answer: "sangat", fullSentence: "Saya sangat suka makanan Korea.", fullSentenceMeaning: { ko: "한국 음식을 정말 좋아해요.", en: "I love Korean food.", es: "Me encanta la comida coreana." } },
          { type: "listening", audioText: "Apakah kamu lapar?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Apakah kamu lapar?", "Saya sangat suka makanan Korea.", "Saya tidak suka makanan pedas.", "Kamu suka makanan apa?"], correct: 0, audioOnly: true },
        ],
      },
    },
    arabic: {
      step1Sentences: [
        { text: "أنا أُحِبّ البيتزا والمَعْكَرونة. (anā uḥibb al-bītzā wal-maʿkarūna)", speechLang: "ar-EG", meaning: { ko: "저는 피자와 파스타를 좋아해요.", en: "I like pizza and pasta.", es: "Me gusta la pizza y la pasta." } },
        { text: "ماذا تُحِبّ مِنَ الطَّعام؟ (māḏā tuḥibb mina ṭ-ṭaʿām?)", speechLang: "ar-EG", meaning: { ko: "어떤 음식을 좋아하세요?", en: "What food do you like?", es: "¿Qué comida te gusta?" } },
        { text: "أنا أُحِبّ الطَّعام الكورِيّ جِدًّا. (anā uḥibb aṭ-ṭaʿām al-kūriyy jiddan)", speechLang: "ar-EG", meaning: { ko: "한국 음식을 정말 좋아해요.", en: "I love Korean food.", es: "Me encanta la comida coreana." } },
        { text: "أنا لا أُحِبّ الطَّعام الحارّ. (anā lā uḥibb aṭ-ṭaʿām al-ḥārr)", speechLang: "ar-EG", meaning: { ko: "매운 음식을 안 좋아해요.", en: "I don't like spicy food.", es: "No me gusta la comida picante." }, recallRound: true },
        { text: "هَلْ أَنْتَ جائِع؟ (hal anta jāʾiʿ?)", speechLang: "ar-EG", meaning: { ko: "배고프세요?", en: "Are you hungry?", es: "¿Tienes hambre?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: أنا أُحِبّ ___ (좋아해요) / أنا أُحِبّ ___ جِدًّا (정말 좋아해요) / أنا لا أُحِبّ ___ (안 좋아해요). 질문: ماذا تُحِبّ مِنَ الطَّعام؟ 'أُحِبّ(uḥibb)'는 '좋아하다', 'لا(lā)'는 부정, 'جِدًّا(jiddan)'는 '아주'예요.", en: "Pattern: أنا أُحِبّ ___ (I like) / أنا أُحِبّ ___ جِدًّا (I love, lit. 'I like ___ a lot') / أنا لا أُحِبّ ___ (I don't like). Question: ماذا تُحِبّ مِنَ الطَّعام؟ 'uḥibb' = like, 'lā' = not, 'jiddan' = very/a lot.", es: "Patrón: أنا أُحِبّ ___ (me gusta) / أنا أُحِبّ ___ جِدًّا (me encanta) / أنا لا أُحِبّ ___ (no me gusta). Pregunta: ماذا تُحِبّ مِنَ الطَّعام؟ 'uḥibb' = gustar, 'lā' = no, 'jiddan' = mucho." },
          examples: { ko: "أنا أُحِبّ الدَّجاج والأَرُزّ. (anā uḥibb ad-dajāj wal-aruzz — 치킨이랑 밥을 좋아해요.)\nأنا أُحِبّ الطَّعام الإيطالِيّ جِدًّا. (anā uḥibb aṭ-ṭaʿām al-īṭāliyy jiddan — 이탈리아 음식을 정말 좋아해요.)\nأنا لا أُحِبّ القَهْوة المُرّة. (anā lā uḥibb al-qahwa al-murra — 쓴 커피를 안 좋아해요.)", en: "أنا أُحِبّ الدَّجاج والأَرُزّ. (anā uḥibb ad-dajāj wal-aruzz — I like chicken and rice.)\nأنا أُحِبّ الطَّعام الإيطالِيّ جِدًّا. (anā uḥibb aṭ-ṭaʿām al-īṭāliyy jiddan — I love Italian food.)\nأنا لا أُحِبّ القَهْوة المُرّة. (anā lā uḥibb al-qahwa al-murra — I don't like bitter coffee.)", es: "أنا أُحِبّ الدَّجاج والأَرُزّ. (anā uḥibb ad-dajāj wal-aruzz — Me gusta el pollo y el arroz.)\nأنا أُحِبّ الطَّعام الإيطالِيّ جِدًّا. (anā uḥibb aṭ-ṭaʿām al-īṭāliyy jiddan — Me encanta la comida italiana.)\nأنا لا أُحِبّ القَهْوة المُرّة. (anā lā uḥibb al-qahwa al-murra — No me gusta el café amargo.)" },
          mistakes: { ko: "❌ أنا أُحِبّ آكُل بيتزا. (anā uḥibb ākul bītzā)\n✅ أنا أُحِبّ البيتزا. (anā uḥibb al-bītzā — أُحِبّ 뒤에 바로 음식 이름! '먹다(آكُل)'를 넣을 필요 없어요.)\n\n✅ أنا لا أُحِبّ الطَّعام الحارّ. (anā lā uḥibb aṭ-ṭaʿām al-ḥārr — 표준어 부정은 'لا(lā)'예요.)\n💬 이집트 구어로는 'مش(mesh)'로 부정하고 매운 음식은 'حرّاق(ḥarrāʾ)'라고 하지만, 표준어는 'لا(lā)'와 'حارّ(ḥārr)' ✓", en: "❌ أنا أُحِبّ آكُل بيتزا. (anā uḥibb ākul bītzā)\n✅ أنا أُحِبّ البيتزا. (anā uḥibb al-bītzā — Put the food right after أُحِبّ — no need to add آكُل (eat)!)\n\n✅ أنا لا أُحِبّ الطَّعام الحارّ. (anā lā uḥibb aṭ-ṭaʿām al-ḥārr — In MSA, negate with 'lā'.)\n💬 In Egyptian dialect you'd negate with 'mesh' and say 'ḥarrāʾ' for spicy, but MSA uses 'lā' and 'ḥārr' ✓", es: "❌ أنا أُحِبّ آكُل بيتزا. (anā uḥibb ākul bītzā)\n✅ أنا أُحِبّ البيتزا. (anā uḥibb al-bītzā — Pon la comida justo después de أُحِبّ — no agregues آكُل (comer).)\n\n✅ أنا لا أُحِبّ الطَّعام الحارّ. (anā lā uḥibb aṭ-ṭaʿām al-ḥārr — En MSA se niega con 'lā'.)\n💬 En dialecto egipcio negarías con 'mesh' y dirías 'ḥarrāʾ' para picante, pero el MSA usa 'lā' y 'ḥārr' ✓" },
          rudyTip: { ko: "탐정 루디의 팁: 잠입 수사의 기본은 대화를 이끄는 거야! 'ماذا تُحِبّ مِنَ الطَّعام؟(māḏā tuḥibb mina ṭ-ṭaʿām?)'로 먼저 물어보고, 답이 오면 'وأنا أَيْضًا!(wa-anā ayḍan!)'(저도요!) 하면 금방 친해질 수 있어~", en: "Detective Rudy's tip: The key to going undercover? Ask 'māḏā tuḥibb mina ṭ-ṭaʿām?' first — everyone loves talking food! When they answer, say 'wa-anā ayḍan!' (Me too!) for instant rapport.", es: "Consejo del detective Rudy: ¿La clave para ir encubierto? Pregunta 'māḏā tuḥibb mina ṭ-ṭaʿām?' primero — ¡a todos les gusta hablar de comida! Cuando respondan, di 'wa-anā ayḍan!' (¡Yo también!)." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "أنا ___ البيتزا والمَعْكَرونة.", answer: "أُحِبّ", options: ["أُحِبّ", "أُريد", "آكُل"], fullSentence: "أنا أُحِبّ البيتزا والمَعْكَرونة.", fullSentenceMeaning: { ko: "저는 피자와 파스타를 좋아해요.", en: "I like pizza and pasta.", es: "Me gusta la pizza y la pasta." } },
          { type: "select", promptWithBlank: "ماذا تُحِبّ مِنَ ___؟", answer: "الطَّعام", options: ["الطَّعام", "أَحَد", "مَطْعَم"], fullSentence: "ماذا تُحِبّ مِنَ الطَّعام؟", fullSentenceMeaning: { ko: "어떤 음식을 좋아하세요?", en: "What food do you like?", es: "¿Qué comida te gusta?" } },
          { type: "select", promptWithBlank: "أنا لا أُحِبّ الطَّعام ___.", answer: "الحارّ", options: ["الحارّ", "السّاخِن", "السَّريع"], fullSentence: "أنا لا أُحِبّ الطَّعام الحارّ.", fullSentenceMeaning: { ko: "매운 음식을 안 좋아해요.", en: "I don't like spicy food.", es: "No me gusta la comida picante." } },
          { type: "input", promptWithBlank: "هَلْ أَنْتَ ___؟", answer: "جائِع", fullSentence: "هَلْ أَنْتَ جائِع؟", fullSentenceMeaning: { ko: "배고프세요?", en: "Are you hungry?", es: "¿Tienes hambre?" } },
          { type: "input", promptWithBlank: "أنا أُحِبّ الطَّعام الكورِيّ ___.", answer: "جِدًّا", fullSentence: "أنا أُحِبّ الطَّعام الكورِيّ جِدًّا.", fullSentenceMeaning: { ko: "한국 음식을 정말 좋아해요.", en: "I love Korean food.", es: "Me encanta la comida coreana." } },
          { type: "listening", audioText: "هَلْ أَنْتَ جائِع؟", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["هَلْ أَنْتَ جائِع؟", "أنا أُحِبّ الطَّعام الكورِيّ جِدًّا.", "أنا لا أُحِبّ الطَّعام الحارّ.", "ماذا تُحِبّ مِنَ الطَّعام؟"], correct: 0, audioOnly: true },
        ],
      },
    },
  },

  // ─────────────── Day 14: Ordering at a Restaurant ────────────────────────
  day_14: {
    english: {
      step1Sentences: [
        { text: "Can I have the menu, please?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "메뉴판 좀 주시겠어요?", en: "Can I have the menu, please?", es: "¿Puedo ver el menú, por favor?" } },
        { text: "I'd like a coffee, please.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "커피 한 잔 주세요.", en: "I'd like a coffee, please.", es: "Quiero un café, por favor." } },
        { text: "Can I have water, please?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "물 좀 주세요.", en: "Can I have water, please?", es: "¿Puedo tener agua, por favor?" } },
        { text: "I'll have the chicken, please.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "치킨으로 할게요.", en: "I'll have the chicken, please.", es: "Voy a pedir el pollo, por favor." }, recallRound: true },
        { text: "For here or to go?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "여기서 드실 건가요, 가져가실 건가요?", en: "For here or to go?", es: "¿Para aquí o para llevar?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: I'd like ___ / Can I have ___ / I'll have ___. 항상 끝에 ', please'를 붙여요! 메뉴 요청: Can I have the menu, please?", en: "Pattern: I'd like ___ / Can I have ___ / I'll have ___. Always end with ', please'! Menu request: Can I have the menu, please?", es: "Patrón: I'd like ___ / Can I have ___ / I'll have ___. Siempre termina con ', please'. Pedir menú: Can I have the menu, please?" },
          examples: { ko: "I'd like a steak and a salad, please. (스테이크랑 샐러드 주세요.)\nCan I have orange juice, please? (오렌지 주스 주시겠어요?)\nI'll have the pasta, please. (파스타로 할게요.)", en: "I'd like a steak and a salad, please. (Polite way to order two items.)\nCan I have orange juice, please? (Asking nicely for a drink.)\nI'll have the pasta, please. (Deciding on your order.)", es: "I'd like a steak and a salad, please. (Forma educada de pedir dos cosas.)\nCan I have orange juice, please? (Pidiendo una bebida amablemente.)\nI'll have the pasta, please. (Decidiendo tu pedido.)" },
          mistakes: { ko: "❌ I want a coffee.\n✅ I'd like a coffee, please. ('I want'는 너무 직접적이에요! 'I'd like'가 예의 바른 표현이에요.)\n\n❌ Give me the menu.\n✅ Can I have the menu, please? (명령형 대신 정중한 요청을 써요!)", en: "❌ I want a coffee.\n✅ I'd like a coffee, please. ('I want' sounds demanding — 'I'd like' is polite!)\n\n❌ Give me the menu.\n✅ Can I have the menu, please? (Use a question to be polite, not a command!)", es: "❌ I want a coffee.\n✅ I'd like a coffee, please. ('I want' suena exigente — 'I'd like' es cortés.)\n\n❌ Give me the menu.\n✅ Can I have the menu, please? (Usa pregunta para ser cortés, no una orden.)" },
          rudyTip: { ko: "탐정 루디의 팁: 잠입 수사할 때 예의 바르게 주문하면 의심받지 않아! 'I'd like'는 'I would like'의 줄임말이야. please만 붙이면 어디서든 환영받지~", en: "Detective Rudy's tip: Going undercover? 'I'd like' is your best friend — it's short for 'I would like' and sounds polite everywhere. Add 'please' and no one suspects a thing!", es: "Consejo del detective Rudy: ¿Vas encubierto? 'I'd like' es tu mejor amigo — es la forma corta de 'I would like' y suena cortés. ¡Agrega 'please' y nadie sospechará!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Can I have the ___, please?", answer: "menu", options: ["menu", "food", "table"], fullSentence: "Can I have the menu, please?", fullSentenceMeaning: { ko: "메뉴판 좀 주시겠어요?", en: "Can I have the menu, please?", es: "¿Puedo ver el menú, por favor?" } },
          { type: "select", promptWithBlank: "I'd ___ a coffee, please.", answer: "like", options: ["like", "want", "have"], fullSentence: "I'd like a coffee, please.", fullSentenceMeaning: { ko: "커피 한 잔 주세요.", en: "I'd like a coffee, please.", es: "Quiero un café, por favor." } },
          { type: "select", promptWithBlank: "For here or to ___?", answer: "go", options: ["go", "take", "leave"], fullSentence: "For here or to go?", fullSentenceMeaning: { ko: "여기서 드실 건가요, 가져가실 건가요?", en: "For here or to go?", es: "¿Para aquí o para llevar?" } },
          { type: "input", promptWithBlank: "I'll ___ the chicken, please.", answer: "have", fullSentence: "I'll have the chicken, please.", fullSentenceMeaning: { ko: "치킨으로 할게요.", en: "I'll have the chicken, please.", es: "Voy a pedir el pollo, por favor." } },
          { type: "input", promptWithBlank: "Can I have ___, please?", answer: "water", fullSentence: "Can I have water, please?", fullSentenceMeaning: { ko: "물 좀 주세요.", en: "Can I have water, please?", es: "¿Puedo tener agua, por favor?" } },
          { type: "listening", audioText: "For here or to go?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["For here or to go?", "I'll have the chicken, please.", "Can I have the menu, please?", "I'd like a coffee, please."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Hello, my name is ___.", es: "Hola, me llamo ___.", ko: "안녕하세요, 제 이름은 ___이에요." }, fromDay: 4, context: { ko: "자기소개 복습", en: "Self-introduction review", es: "Repaso de presentación" } },
        { sentence: { en: "Nice to meet you.", es: "Mucho gusto.", ko: "만나서 반가워요." }, fromDay: 4, context: { ko: "자기소개 복습", en: "Self-introduction review", es: "Repaso de presentación" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "¿Puedo ver el menú, por favor?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "메뉴판 좀 주시겠어요?", en: "Can I have the menu, please?", es: "¿Puedo ver el menú, por favor?" } },
        { text: "Quiero un café, por favor.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "커피 한 잔 주세요.", en: "I'd like a coffee, please.", es: "Quiero un café, por favor." } },
        { text: "¿Puedo tener agua, por favor?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "물 좀 주세요.", en: "Can I have water, please?", es: "¿Puedo tener agua, por favor?" } },
        { text: "Voy a pedir el pollo, por favor.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "치킨으로 할게요.", en: "I'll have the chicken, please.", es: "Voy a pedir el pollo, por favor." }, recallRound: true },
        { text: "¿Para aquí o para llevar?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "여기서 드실 건가요, 가져가실 건가요?", en: "For here or to go?", es: "¿Para aquí o para llevar?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Quiero ___ / ¿Puedo tener ___? / Voy a pedir ___. 항상 끝에 ', por favor'를 붙여요! 메뉴 요청: ¿Puedo ver el menú, por favor?", en: "Pattern: Quiero ___ / ¿Puedo tener ___? / Voy a pedir ___. Always add ', por favor'! Menu: ¿Puedo ver el menú, por favor?", es: "Patrón: Quiero ___ / ¿Puedo tener ___? / Voy a pedir ___. Siempre con ', por favor'. Menú: ¿Puedo ver el menú, por favor?" },
          examples: { ko: "Quiero un bistec y una ensalada, por favor. (스테이크랑 샐러드 주세요.)\n¿Puedo tener jugo de naranja, por favor? (오렌지 주스 주시겠어요?)\nVoy a pedir la pasta, por favor. (파스타로 할게요.)", en: "Quiero un bistec y una ensalada, por favor. (I'd like a steak and salad.)\n¿Puedo tener jugo de naranja, por favor? (Can I have orange juice?)\nVoy a pedir la pasta, por favor. (I'll order the pasta.)", es: "Quiero un bistec y una ensalada, por favor. (Pidiendo dos cosas.)\n¿Puedo tener jugo de naranja, por favor? (Pidiendo una bebida.)\nVoy a pedir la pasta, por favor. (Decidiendo tu pedido.)" },
          mistakes: { ko: "❌ Yo quiero un café. Dame.\n✅ Quiero un café, por favor. ('Dame'는 무례해요! 'por favor'를 쓰세요.)\n\n❌ Puedo tener agua?\n✅ ¿Puedo tener agua, por favor? (물음표를 앞뒤로 ¿?로 써요!)", en: "❌ Dame un café.\n✅ Quiero un café, por favor. ('Dame' sounds rude — use 'Quiero' + 'por favor'!)\n\n❌ Puedo tener agua?\n✅ ¿Puedo tener agua, por favor? (Don't forget the upside-down question mark ¿ at the start!)", es: "❌ Dame un café.\n✅ Quiero un café, por favor. ('Dame' es muy directo — usa 'Quiero' + 'por favor'.)\n\n❌ Puedo tener agua?\n✅ ¿Puedo tener agua, por favor? (¡No olvides el ¿ al inicio!)" },
          rudyTip: { ko: "탐정 루디의 팁: 스페인어에서 'Quiero'는 영어의 'I want'인데, 식당에서는 괜찮아! 'por favor'만 붙이면 예의 바른 주문이 돼. 영어랑 다른 점이지?", en: "Detective Rudy's tip: Unlike English, 'Quiero' (I want) is perfectly polite in Spanish restaurants! Just add 'por favor' and you're golden. Different culture, different clues!", es: "Consejo del detective Rudy: ¡En español, 'Quiero' es perfectamente cortés en restaurantes! Solo agrega 'por favor' y listo. ¡Cada idioma tiene sus propias reglas!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "¿Puedo ver el ___, por favor?", answer: "menú", options: ["menú", "comida", "mesa"], fullSentence: "¿Puedo ver el menú, por favor?", fullSentenceMeaning: { ko: "메뉴판 좀 주시겠어요?", en: "Can I have the menu?", es: "¿Puedo ver el menú, por favor?" } },
          { type: "select", promptWithBlank: "___ un café, por favor.", answer: "Quiero", options: ["Quiero", "Tengo", "Soy"], fullSentence: "Quiero un café, por favor.", fullSentenceMeaning: { ko: "커피 한 잔 주세요.", en: "I'd like a coffee.", es: "Quiero un café, por favor." } },
          { type: "select", promptWithBlank: "¿Para aquí o para ___?", answer: "llevar", options: ["llevar", "ir", "salir"], fullSentence: "¿Para aquí o para llevar?", fullSentenceMeaning: { ko: "여기서 드실 건가요, 가져가실 건가요?", en: "For here or to go?", es: "¿Para aquí o para llevar?" } },
          { type: "input", promptWithBlank: "Voy a ___ el pollo, por favor.", answer: "pedir", fullSentence: "Voy a pedir el pollo, por favor.", fullSentenceMeaning: { ko: "치킨으로 할게요.", en: "I'll have the chicken.", es: "Voy a pedir el pollo, por favor." } },
          { type: "input", promptWithBlank: "¿Puedo tener ___, por favor?", answer: "agua", fullSentence: "¿Puedo tener agua, por favor?", fullSentenceMeaning: { ko: "물 좀 주세요.", en: "Can I have water?", es: "¿Puedo tener agua, por favor?" } },
          { type: "listening", audioText: "¿Para aquí o para llevar?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["¿Para aquí o para llevar?", "Voy a pedir el pollo.", "¿Puedo ver el menú?", "Quiero un café, por favor."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Hello, my name is ___.", es: "Hola, me llamo ___.", ko: "안녕하세요, 제 이름은 ___이에요." }, fromDay: 4, context: { ko: "자기소개 복습", en: "Self-introduction review", es: "Repaso de presentación" } },
        { sentence: { en: "Nice to meet you.", es: "Mucho gusto.", ko: "만나서 반가워요." }, fromDay: 4, context: { ko: "자기소개 복습", en: "Self-introduction review", es: "Repaso de presentación" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "메뉴판 좀 주시겠어요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "메뉴판 좀 주시겠어요?", en: "Can I have the menu, please?", es: "¿Puedo ver el menú, por favor?" } },
        { text: "커피 한 잔 주세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "커피 한 잔 주세요.", en: "I'd like a coffee, please.", es: "Quiero un café, por favor." } },
        { text: "물 좀 주세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "물 좀 주세요.", en: "Can I have water, please?", es: "¿Puedo tener agua, por favor?" } },
        { text: "치킨으로 할게요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "치킨으로 할게요.", en: "I'll have the chicken, please.", es: "Voy a pedir el pollo, por favor." }, recallRound: true },
        { text: "여기서 드실 건가요, 포장인가요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "여기서 드실 건가요, 포장인가요?", en: "For here or to go?", es: "¿Para aquí o para llevar?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: ___ 주세요 / ___으로 할게요 / ___ 좀 주시겠어요? 한국어 주문의 핵심은 '주세요'! 공손하게는 '주시겠어요?'", en: "Pattern: ___ 주세요 / ___으로 할게요 / ___ 좀 주시겠어요? The key word is 주세요 (please give me). More polite: 주시겠어요?", es: "Patrón: ___ 주세요 / ___으로 할게요 / ___ 좀 주시겠어요? La palabra clave es 주세요 (por favor). Más cortés: 주시겠어요?" },
          examples: { ko: "비빔밥 하나 주세요. (비빔밥 주문할 때)\n삼겹살로 할게요. (메뉴를 고를 때)\n물 좀 주시겠어요? (공손하게 요청할 때)", en: "비빔밥 하나 주세요. (One bibimbap, please — basic order.)\n삼겹살로 할게요. (I'll have the samgyeopsal — choosing from menu.)\n물 좀 주시겠어요? (Could I have water? — extra polite request.)", es: "비빔밥 하나 주세요. (Un bibimbap, por favor — pedido básico.)\n삼겹살로 할게요. (Pido el samgyeopsal — eligiendo del menú.)\n물 좀 주시겠어요? (¿Podría darme agua? — petición muy cortés.)" },
          mistakes: { ko: "❌ 커피 줘.\n✅ 커피 주세요. ('줘'는 반말이에요! 식당에서는 '주세요'로 말해요.)\n\n❌ 치킨를 할게요.\n✅ 치킨으로 할게요. ('를'이 아니라 '으로'예요! ~으로 = ~로 선택할 때)", en: "❌ 커피 줘.\n✅ 커피 주세요. ('줘' is casual/rude! Use '주세요' in restaurants — it's polite.)\n\n❌ 치킨를 할게요.\n✅ 치킨으로 할게요. (Use 으로 for choosing, not 를! 으로 means 'I'll go with...')", es: "❌ 커피 줘.\n✅ 커피 주세요. ('줘' es informal/grosero. Usa '주세요' en restaurantes.)\n\n❌ 치킨를 할게요.\n✅ 치킨으로 할게요. (Usa 으로 para elegir, no 를. 으로 = 'voy con...')" },
          rudyTip: { ko: "탐정 루디의 팁: '주세요'는 마법의 단어야! 뭐든 원하는 것 뒤에 '주세요'만 붙이면 주문 완료! '물 주세요', '메뉴 주세요', '치킨 주세요'~", en: "Detective Rudy's tip: 주세요 is the magic word! Put anything you want before it and boom — instant order. 물 주세요, 메뉴 주세요, 치킨 주세요. Case closed!", es: "Consejo del detective Rudy: ¡주세요 es la palabra mágica! Pon cualquier cosa antes y listo — pedido instantáneo. 물 주세요, 메뉴 주세요, 치킨 주세요. ¡Caso cerrado!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "메뉴판 좀 ___어요?", answer: "주시겠", options: ["주시겠", "보시겠", "하시겠"], fullSentence: "메뉴판 좀 주시겠어요?", fullSentenceMeaning: { ko: "메뉴판 좀 주시겠어요?", en: "Can I have the menu?", es: "¿Puedo ver el menú?" } },
          { type: "select", promptWithBlank: "커피 한 잔 ___.", answer: "주세요", options: ["주세요", "하세요", "가세요"], fullSentence: "커피 한 잔 주세요.", fullSentenceMeaning: { ko: "커피 한 잔 주세요.", en: "A coffee, please.", es: "Un café, por favor." } },
          { type: "select", promptWithBlank: "치킨___ 할게요.", answer: "으로", options: ["으로", "에서", "하고"], fullSentence: "치킨으로 할게요.", fullSentenceMeaning: { ko: "치킨으로 할게요.", en: "I'll have the chicken.", es: "Pido el pollo." } },
          { type: "input", promptWithBlank: "___ 좀 주세요.", answer: "물", fullSentence: "물 좀 주세요.", fullSentenceMeaning: { ko: "물 좀 주세요.", en: "Water, please.", es: "Agua, por favor." } },
          { type: "input", promptWithBlank: "여기서 드실 건가요, ___인가요?", answer: "포장", fullSentence: "여기서 드실 건가요, 포장인가요?", fullSentenceMeaning: { ko: "여기서 드실 건가요, 포장인가요?", en: "For here or to go?", es: "¿Para aquí o para llevar?" } },
          { type: "listening", audioText: "여기서 드실 건가요, 포장인가요?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["여기서 드실 건가요, 포장인가요?", "치킨으로 할게요.", "메뉴판 좀 주시겠어요?", "커피 한 잔 주세요."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Hello, my name is ___.", es: "Hola, me llamo ___.", ko: "안녕하세요, 제 이름은 ___이에요." }, fromDay: 4, context: { ko: "자기소개 복습", en: "Self-introduction review", es: "Repaso de presentación" } },
        { sentence: { en: "Nice to meet you.", es: "Mucho gusto.", ko: "만나서 반가워요." }, fromDay: 4, context: { ko: "자기소개 복습", en: "Self-introduction review", es: "Repaso de presentación" } },
      ],
    },
    indonesian: {
      step1Sentences: [
        { text: "Boleh saya minta menu?", speechLang: "id-ID", meaning: { ko: "메뉴판 좀 주시겠어요?", en: "Can I have the menu, please?", es: "¿Puedo ver el menú, por favor?" } },
        { text: "Saya mau kopi, tolong.", speechLang: "id-ID", meaning: { ko: "커피 한 잔 주세요.", en: "I'd like a coffee, please.", es: "Quiero un café, por favor." } },
        { text: "Boleh saya minta air?", speechLang: "id-ID", meaning: { ko: "물 좀 주세요.", en: "Can I have water, please?", es: "¿Puedo tener agua, por favor?" } },
        { text: "Saya pesan ayam, tolong.", speechLang: "id-ID", meaning: { ko: "치킨으로 할게요.", en: "I'll have the chicken, please.", es: "Voy a pedir el pollo, por favor." }, recallRound: true },
        { text: "Makan di sini atau bawa pulang?", speechLang: "id-ID", meaning: { ko: "여기서 드실 건가요, 가져가실 건가요?", en: "For here or to go?", es: "¿Para aquí o para llevar?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Saya mau ___ (주세요) / Boleh saya minta ___? (~좀 주시겠어요?) / Saya pesan ___ (~으로 할게요). 끝에 'tolong'(부탁해요)을 붙이면 더 공손해요! 메뉴 요청: Boleh saya minta menu?", en: "Pattern: Saya mau ___ (I'd like) / Boleh saya minta ___? (Can I have ___?) / Saya pesan ___ (I'll order). Add 'tolong' (please) at the end to be polite! Menu request: Boleh saya minta menu?", es: "Patrón: Saya mau ___ (quiero) / Boleh saya minta ___? (¿Puedo pedir ___?) / Saya pesan ___ (voy a pedir). ¡Agrega 'tolong' (por favor) al final para ser cortés! Menú: Boleh saya minta menu?" },
          examples: { ko: "Saya mau steak dan salad, tolong. (스테이크랑 샐러드 주세요.)\nBoleh saya minta jus jeruk? (오렌지 주스 주시겠어요?)\nSaya pesan pasta, tolong. (파스타로 할게요.)", en: "Saya mau steak dan salad, tolong. (I'd like a steak and a salad, please.)\nBoleh saya minta jus jeruk? (Can I have orange juice, please?)\nSaya pesan pasta, tolong. (I'll have the pasta, please.)", es: "Saya mau steak dan salad, tolong. (Quiero un bistec y una ensalada, por favor.)\nBoleh saya minta jus jeruk? (¿Puedo tener jugo de naranja, por favor?)\nSaya pesan pasta, tolong. (Voy a pedir la pasta, por favor.)" },
          mistakes: { ko: "❌ Beri saya menu!\n✅ Boleh saya minta menu? (명령형 'Beri'(줘) 대신 'Boleh saya minta?'(주시겠어요?)가 공손해요!)\n\n❌ Saya mau kopi mau.\n✅ Saya mau kopi, tolong. ('mau'를 두 번 쓰지 마세요! 끝에는 'tolong'을 붙여요.)", en: "❌ Beri saya menu!\n✅ Boleh saya minta menu? (Use the polite 'Boleh saya minta?' (May I have?) instead of the command 'Beri' (give)!)\n\n❌ Saya mau kopi mau.\n✅ Saya mau kopi, tolong. (Don't repeat 'mau'! End with 'tolong' to be polite.)", es: "❌ Beri saya menu!\n✅ Boleh saya minta menu? (Usa el cortés 'Boleh saya minta?' (¿Puedo pedir?) en vez del mandato 'Beri' (dame).)\n\n❌ Saya mau kopi mau.\n✅ Saya mau kopi, tolong. (¡No repitas 'mau'! Termina con 'tolong' para ser cortés.)" },
          rudyTip: { ko: "탐정 루디의 팁: 잠입 수사할 때 'tolong'만 붙이면 어디서든 환영받아! 'Boleh saya minta ___?'는 '~좀 주시겠어요?'라는 만능 주문 표현이야. 의심받을 일 없지~", en: "Detective Rudy's tip: Going undercover? Just add 'tolong' and you're welcome anywhere! 'Boleh saya minta ___?' is your all-purpose polite order — no one suspects a thing.", es: "Consejo del detective Rudy: ¿Vas encubierto? ¡Solo agrega 'tolong' y serás bienvenido! 'Boleh saya minta ___?' es tu pedido cortés todoterreno — nadie sospechará." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Boleh saya minta ___?", answer: "menu", options: ["menu", "makanan", "meja"], fullSentence: "Boleh saya minta menu?", fullSentenceMeaning: { ko: "메뉴판 좀 주시겠어요?", en: "Can I have the menu, please?", es: "¿Puedo ver el menú, por favor?" } },
          { type: "select", promptWithBlank: "Saya ___ kopi, tolong.", answer: "mau", options: ["mau", "ada", "pergi"], fullSentence: "Saya mau kopi, tolong.", fullSentenceMeaning: { ko: "커피 한 잔 주세요.", en: "I'd like a coffee, please.", es: "Quiero un café, por favor." } },
          { type: "select", promptWithBlank: "Makan di sini atau bawa ___?", answer: "pulang", options: ["pulang", "pergi", "keluar"], fullSentence: "Makan di sini atau bawa pulang?", fullSentenceMeaning: { ko: "여기서 드실 건가요, 가져가실 건가요?", en: "For here or to go?", es: "¿Para aquí o para llevar?" } },
          { type: "input", promptWithBlank: "Saya ___ ayam, tolong.", answer: "pesan", fullSentence: "Saya pesan ayam, tolong.", fullSentenceMeaning: { ko: "치킨으로 할게요.", en: "I'll have the chicken, please.", es: "Voy a pedir el pollo, por favor." } },
          { type: "input", promptWithBlank: "Boleh saya minta ___?", answer: "air", fullSentence: "Boleh saya minta air?", fullSentenceMeaning: { ko: "물 좀 주세요.", en: "Can I have water, please?", es: "¿Puedo tener agua, por favor?" } },
          { type: "listening", audioText: "Makan di sini atau bawa pulang?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Makan di sini atau bawa pulang?", "Saya pesan ayam, tolong.", "Boleh saya minta menu?", "Saya mau kopi, tolong."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Hello, my name is ___.", es: "Hola, me llamo ___.", ko: "안녕하세요, 제 이름은 ___이에요." }, fromDay: 4, context: { ko: "자기소개 복습", en: "Self-introduction review", es: "Repaso de presentación" } },
        { sentence: { en: "Nice to meet you.", es: "Mucho gusto.", ko: "만나서 반가워요." }, fromDay: 4, context: { ko: "자기소개 복습", en: "Self-introduction review", es: "Repaso de presentación" } },
      ],
    },
    arabic: {
      step1Sentences: [
        { text: "مُمْكِن القائِمة لَوْ سَمَحْت؟ (mumkin al-qāʾima law samaḥt?)", speechLang: "ar-EG", meaning: { ko: "메뉴판 좀 주시겠어요?", en: "Can I have the menu, please?", es: "¿Puedo ver el menú, por favor?" } },
        { text: "أُريد قَهْوة، لَوْ سَمَحْت. (urīd qahwa, law samaḥt)", speechLang: "ar-EG", meaning: { ko: "커피 한 잔 주세요.", en: "I'd like a coffee, please.", es: "Quiero un café, por favor." } },
        { text: "مُمْكِن ماء لَوْ سَمَحْت؟ (mumkin māʾ law samaḥt?)", speechLang: "ar-EG", meaning: { ko: "물 좀 주세요.", en: "Can I have water, please?", es: "¿Puedo tener agua, por favor?" } },
        { text: "سَآخُذ الدَّجاج، لَوْ سَمَحْت. (saʾākhuḏ ad-dajāj, law samaḥt)", speechLang: "ar-EG", meaning: { ko: "치킨으로 할게요.", en: "I'll have the chicken, please.", es: "Voy a pedir el pollo, por favor." }, recallRound: true },
        { text: "هُنا أَمْ سَفَرِيّ؟ (hunā am safariyy?)", speechLang: "ar-EG", meaning: { ko: "여기서 드실 건가요, 가져가실 건가요?", en: "For here or to go?", es: "¿Para aquí o para llevar?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: أُريد ___ (주세요) / مُمْكِن ___؟ (~좀 주시겠어요?) / سَآخُذ ___ (~으로 할게요). 끝에 'لَوْ سَمَحْت(law samaḥt)'(부탁해요)을 붙이면 더 공손해요! 메뉴 요청: مُمْكِن القائِمة لَوْ سَمَحْت؟", en: "Pattern: أُريد ___ (I'd like) / مُمْكِن ___؟ (Can I have ___?) / سَآخُذ ___ (I'll have/take). Add 'law samaḥt' (please) to be polite! Menu request: mumkin al-qāʾima law samaḥt?", es: "Patrón: أُريد ___ (quiero) / مُمْكِن ___؟ (¿Puedo pedir ___?) / سَآخُذ ___ (voy a tomar). ¡Agrega 'law samaḥt' (por favor) para ser cortés! Menú: mumkin al-qāʾima law samaḥt?" },
          examples: { ko: "أُريد سِتيك وسَلَطة، لَوْ سَمَحْت. (urīd sitēk wa-salaṭa, law samaḥt — 스테이크랑 샐러드 주세요.)\nمُمْكِن عَصير بُرْتُقال لَوْ سَمَحْت؟ (mumkin ʿaṣīr burtuqāl law samaḥt? — 오렌지 주스 주시겠어요?)\nسَآخُذ المَعْكَرونة، لَوْ سَمَحْت. (saʾākhuḏ al-maʿkarūna, law samaḥt — 파스타로 할게요.)", en: "أُريد سِتيك وسَلَطة، لَوْ سَمَحْت. (urīd sitēk wa-salaṭa, law samaḥt — I'd like a steak and a salad, please.)\nمُمْكِن عَصير بُرْتُقال لَوْ سَمَحْت؟ (mumkin ʿaṣīr burtuqāl law samaḥt? — Can I have orange juice, please?)\nسَآخُذ المَعْكَرونة، لَوْ سَمَحْت. (saʾākhuḏ al-maʿkarūna, law samaḥt — I'll have the pasta, please.)", es: "أُريد سِتيك وسَلَطة، لَوْ سَمَحْت. (urīd sitēk wa-salaṭa, law samaḥt — Quiero un bistec y una ensalada, por favor.)\nمُمْكِن عَصير بُرْتُقال لَوْ سَمَحْت؟ (mumkin ʿaṣīr burtuqāl law samaḥt? — ¿Puedo tener jugo de naranja, por favor?)\nسَآخُذ المَعْكَرونة، لَوْ سَمَحْت. (saʾākhuḏ al-maʿkarūna, law samaḥt — Voy a pedir la pasta, por favor.)" },
          mistakes: { ko: "❌ أَعْطِني القائِمة! (aʿṭinī al-qāʾima!)\n✅ مُمْكِن القائِمة لَوْ سَمَحْت؟ (mumkin al-qāʾima law samaḥt? — 명령형 대신 'مُمْكِن... لَوْ سَمَحْت؟'가 공손해요!)\n\n✅ أُريد قَهْوة، لَوْ سَمَحْت. (urīd qahwa, law samaḥt — 표준어로 '원하다'는 'أُريد(urīd)'예요.)\n💬 이집트 구어로는 'عايز(ʿāyez)' 라고 하지만 표준어는 'أُريد(urīd)' ✓", en: "❌ أَعْطِني القائِمة! (aʿṭinī al-qāʾima!)\n✅ مُمْكِن القائِمة لَوْ سَمَحْت؟ (mumkin al-qāʾima law samaḥt? — Use the polite 'mumkin... law samaḥt?' instead of a bare command!)\n\n✅ أُريد قَهْوة، لَوْ سَمَحْت. (urīd qahwa, law samaḥt — In MSA, 'I want' is 'urīd'.)\n💬 In Egyptian dialect you'd say 'ʿāyez', but MSA uses 'urīd' ✓", es: "❌ أَعْطِني القائِمة! (aʿṭinī al-qāʾima!)\n✅ مُمْكِن القائِمة لَوْ سَمَحْت؟ (mumkin al-qāʾima law samaḥt? — Usa el cortés 'mumkin... law samaḥt?' en vez de una orden seca.)\n\n✅ أُريد قَهْوة، لَوْ سَمَحْت. (urīd qahwa, law samaḥt — En MSA, 'quiero' es 'urīd'.)\n💬 En dialecto egipcio dirías 'ʿāyez', pero el MSA usa 'urīd' ✓" },
          rudyTip: { ko: "탐정 루디의 팁: 잠입 수사할 때 'لَوْ سَمَحْت(law samaḥt)'만 붙이면 어디서든 환영받아! 'مُمْكِن ___؟(mumkin ___?)'는 '~좀 주시겠어요?'라는 만능 주문 표현이야. 의심받을 일 없지~", en: "Detective Rudy's tip: Going undercover? Just add 'law samaḥt' and you're welcome anywhere! 'mumkin ___?' is your all-purpose polite order — no one suspects a thing.", es: "Consejo del detective Rudy: ¿Vas encubierto? ¡Solo agrega 'law samaḥt' y serás bienvenido! 'mumkin ___?' es tu pedido cortés todoterreno — nadie sospechará." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "مُمْكِن ___ لَوْ سَمَحْت؟", answer: "القائِمة", options: ["القائِمة", "الطَّعام", "الطاوِلة"], fullSentence: "مُمْكِن القائِمة لَوْ سَمَحْت؟", fullSentenceMeaning: { ko: "메뉴판 좀 주시겠어요?", en: "Can I have the menu, please?", es: "¿Puedo ver el menú, por favor?" } },
          { type: "select", promptWithBlank: "___ قَهْوة، لَوْ سَمَحْت.", answer: "أُريد", options: ["أُريد", "عِنْدي", "ذاهِب"], fullSentence: "أُريد قَهْوة، لَوْ سَمَحْت.", fullSentenceMeaning: { ko: "커피 한 잔 주세요.", en: "I'd like a coffee, please.", es: "Quiero un café, por favor." } },
          { type: "select", promptWithBlank: "هُنا أَمْ ___؟", answer: "سَفَرِيّ", options: ["سَفَرِيّ", "ذاهِب", "خارِج"], fullSentence: "هُنا أَمْ سَفَرِيّ؟", fullSentenceMeaning: { ko: "여기서 드실 건가요, 가져가실 건가요?", en: "For here or to go?", es: "¿Para aquí o para llevar?" } },
          { type: "input", promptWithBlank: "___ الدَّجاج، لَوْ سَمَحْت.", answer: "سَآخُذ", fullSentence: "سَآخُذ الدَّجاج، لَوْ سَمَحْت.", fullSentenceMeaning: { ko: "치킨으로 할게요.", en: "I'll have the chicken, please.", es: "Voy a pedir el pollo, por favor." } },
          { type: "input", promptWithBlank: "مُمْكِن ___ لَوْ سَمَحْت؟", answer: "ماء", fullSentence: "مُمْكِن ماء لَوْ سَمَحْت؟", fullSentenceMeaning: { ko: "물 좀 주세요.", en: "Can I have water, please?", es: "¿Puedo tener agua, por favor?" } },
          { type: "listening", audioText: "هُنا أَمْ سَفَرِيّ؟", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["هُنا أَمْ سَفَرِيّ؟", "سَآخُذ الدَّجاج، لَوْ سَمَحْت.", "مُمْكِن القائِمة لَوْ سَمَحْت؟", "أُريد قَهْوة، لَوْ سَمَحْت."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Hello, my name is ___.", es: "Hola, me llamo ___.", ko: "안녕하세요, 제 이름은 ___이에요." }, fromDay: 4, context: { ko: "자기소개 복습", en: "Self-introduction review", es: "Repaso de presentación" } },
        { sentence: { en: "Nice to meet you.", es: "Mucho gusto.", ko: "만나서 반가워요." }, fromDay: 4, context: { ko: "자기소개 복습", en: "Self-introduction review", es: "Repaso de presentación" } },
      ],
    },
  },

  // ─────────────── Day 15: Asking About Prices ─────────────────────────────
  day_15: {
    english: {
      step1Sentences: [
        { text: "How much is this?", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
        { text: "It's ten dollars.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "10달러예요.", en: "It's ten dollars.", es: "Son diez dólares." } },
        { text: "That's too expensive!", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "너무 비싸요!", en: "That's too expensive!", es: "¡Eso es muy caro!" } },
        { text: "Can I pay by card?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" }, recallRound: true },
        { text: "The bill, please.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "계산서 주세요.", en: "The bill, please.", es: "La cuenta, por favor." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: How much is ___? → It's ___ dollars. 비쌀 때: That's too expensive! 결제: Can I pay by card? / The bill, please.", en: "Pattern: How much is ___? → It's ___ dollars. Too pricey: That's too expensive! Paying: Can I pay by card? / The bill, please.", es: "Patrón: How much is ___? → It's ___ dollars. Caro: That's too expensive! Pagar: Can I pay by card? / The bill, please." },
          examples: { ko: "How much is the soup? It's eight dollars. (수프 얼마예요? 8달러예요.)\nHow much is a large pizza? It's fifteen dollars. (큰 피자 얼마예요? 15달러예요.)\nCan I pay by card? Sure! (카드로 돼요? 네!)", en: "How much is the soup? It's eight dollars. (Asking and understanding a price.)\nHow much is a large pizza? It's fifteen dollars. (Prices with bigger numbers.)\nCan I pay by card? Sure! (Asking about payment method.)", es: "How much is the soup? It's eight dollars. (Preguntando y entendiendo precio.)\nHow much is a large pizza? It's fifteen dollars. (Precios con números más grandes.)\nCan I pay by card? Sure! (Preguntando por método de pago.)" },
          mistakes: { ko: "❌ How much is this costs?\n✅ How much is this? (is와 costs를 같이 쓰면 안 돼요!)\n\n❌ How many is this?\n✅ How much is this? (가격은 항상 'much'! 'many'는 셀 수 있는 것에 써요.)", en: "❌ How much is this costs?\n✅ How much is this? (Don't use 'is' and 'costs' together — pick one!)\n\n❌ How many is this?\n✅ How much is this? (Use 'much' for prices — 'many' is for counting items!)", es: "❌ How much is this costs?\n✅ How much is this? (No uses 'is' y 'costs' juntos.)\n\n❌ How many is this?\n✅ How much is this? (Usa 'much' para precios — 'many' es para contar cosas.)" },
          rudyTip: { ko: "탐정 루디의 팁: 'How much'와 'How many' 헷갈리지? 돈이나 양은 much, 개수는 many야! 식당에서 가격 물을 때는 항상 'How much is this?' 기억해~", en: "Detective Rudy's tip: 'How much' vs 'How many' — here's the clue! 'Much' is for money and uncountable things, 'many' is for counting. At restaurants, it's always 'How much?'", es: "Consejo del detective Rudy: 'How much' vs 'How many' — ¡aquí está la pista! 'Much' es para dinero, 'many' para contar. En restaurantes, siempre 'How much?'" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "How ___ is this?", answer: "much", options: ["much", "many", "old"], fullSentence: "How much is this?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
          { type: "select", promptWithBlank: "That's too ___!", answer: "expensive", options: ["expensive", "much", "big"], fullSentence: "That's too expensive!", fullSentenceMeaning: { ko: "너무 비싸요!", en: "That's too expensive!", es: "¡Eso es muy caro!" } },
          { type: "select", promptWithBlank: "Can I pay by ___?", answer: "card", options: ["card", "money", "cash"], fullSentence: "Can I pay by card?", fullSentenceMeaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" } },
          { type: "input", promptWithBlank: "The ___, please.", answer: "bill", fullSentence: "The bill, please.", fullSentenceMeaning: { ko: "계산서 주세요.", en: "The bill, please.", es: "La cuenta, por favor." } },
          { type: "input", promptWithBlank: "It's ___ dollars.", answer: "ten", fullSentence: "It's ten dollars.", fullSentenceMeaning: { ko: "10달러예요.", en: "It's ten dollars.", es: "Son diez dólares." } },
          { type: "listening", audioText: "The bill, please.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["The bill, please.", "Can I pay by card?", "How much is this?", "That's too expensive!"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again, please?", es: "¿Puede repetirlo, por favor?", ko: "다시 한번 말해 주시겠어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "¿Cuánto cuesta esto?", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
        { text: "Son diez dólares.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "10달러예요.", en: "It's ten dollars.", es: "Son diez dólares." } },
        { text: "¡Eso es muy caro!", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "너무 비싸요!", en: "That's too expensive!", es: "¡Eso es muy caro!" } },
        { text: "¿Puedo pagar con tarjeta?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" }, recallRound: true },
        { text: "La cuenta, por favor.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "계산서 주세요.", en: "The bill, please.", es: "La cuenta, por favor." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: ¿Cuánto cuesta ___? → Son ___ dólares. 비쌀 때: ¡Muy caro! 결제: ¿Puedo pagar con tarjeta? / La cuenta, por favor.", en: "Pattern: ¿Cuánto cuesta ___? → Son ___ dólares. Too pricey: ¡Muy caro! Paying: ¿Puedo pagar con tarjeta? / La cuenta, por favor.", es: "Patrón: ¿Cuánto cuesta ___? → Son ___ dólares. Caro: ¡Muy caro! Pagar: ¿Puedo pagar con tarjeta? / La cuenta, por favor." },
          examples: { ko: "¿Cuánto cuesta la sopa? Son ocho dólares. (수프 얼마예요? 8달러예요.)\n¿Cuánto cuesta una pizza grande? Son quince dólares. (큰 피자 얼마예요? 15달러예요.)\n¿Puedo pagar con tarjeta? ¡Claro! (카드로 돼요? 물론이죠!)", en: "¿Cuánto cuesta la sopa? Son ocho dólares. (How much is the soup? Eight dollars.)\n¿Cuánto cuesta una pizza grande? Son quince dólares. (Large pizza? Fifteen dollars.)\n¿Puedo pagar con tarjeta? ¡Claro! (Can I pay by card? Of course!)", es: "¿Cuánto cuesta la sopa? Son ocho dólares. (Preguntando y entendiendo precio.)\n¿Cuánto cuesta una pizza grande? Son quince dólares. (Precios con números más grandes.)\n¿Puedo pagar con tarjeta? ¡Claro! (Preguntando por método de pago.)" },
          mistakes: { ko: "❌ ¿Cuánto es cuesta esto?\n✅ ¿Cuánto cuesta esto? ('es'와 'cuesta'를 같이 쓰면 안 돼요!)\n\n❌ La bill, por favor.\n✅ La cuenta, por favor. (영어 'bill'이 아니라 스페인어 'cuenta'를 써요!)", en: "❌ ¿Cuánto es cuesta esto?\n✅ ¿Cuánto cuesta esto? (Don't use 'es' and 'cuesta' together — 'cuesta' already means 'costs'!)\n\n❌ La bill, por favor.\n✅ La cuenta, por favor. (Use 'cuenta' not the English word 'bill'!)", es: "❌ ¿Cuánto es cuesta esto?\n✅ ¿Cuánto cuesta esto? (No uses 'es' con 'cuesta' — ¡'cuesta' ya significa el costo!)\n\n❌ La bill, por favor.\n✅ La cuenta, por favor. (Usa 'cuenta', no la palabra inglesa 'bill'.)" },
          rudyTip: { ko: "탐정 루디의 팁: 'cuesta'가 핵심 단서야! '¿Cuánto cuesta?' = '얼마나 비용이 드나요?' 가격 답을 들을 때 Unit 2 숫자가 중요하니까 복습해둬~", en: "Detective Rudy's tip: 'Cuesta' is the key clue! '¿Cuánto cuesta?' literally means 'How much does it cost?' Listen for numbers from Unit 2 in the answer — that's your evidence!", es: "Consejo del detective Rudy: '¿Cuánto cuesta?' es la pregunta clave. ¡Escucha los números de la Unidad 2 en la respuesta — esa es tu evidencia!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "¿Cuánto ___ esto?", answer: "cuesta", options: ["cuesta", "es", "tiene"], fullSentence: "¿Cuánto cuesta esto?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
          { type: "select", promptWithBlank: "¡Eso es muy ___!", answer: "caro", options: ["caro", "mucho", "grande"], fullSentence: "¡Eso es muy caro!", fullSentenceMeaning: { ko: "너무 비싸요!", en: "Too expensive!", es: "¡Eso es muy caro!" } },
          { type: "select", promptWithBlank: "¿Puedo ___ con tarjeta?", answer: "pagar", options: ["pagar", "tener", "dar"], fullSentence: "¿Puedo pagar con tarjeta?", fullSentenceMeaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" } },
          { type: "input", promptWithBlank: "La ___, por favor.", answer: "cuenta", fullSentence: "La cuenta, por favor.", fullSentenceMeaning: { ko: "계산서 주세요.", en: "The bill, please.", es: "La cuenta, por favor." } },
          { type: "input", promptWithBlank: "Son ___ dólares.", answer: "diez", fullSentence: "Son diez dólares.", fullSentenceMeaning: { ko: "10달러예요.", en: "It's ten dollars.", es: "Son diez dólares." } },
          { type: "listening", audioText: "La cuenta, por favor.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["La cuenta, por favor.", "¿Puedo pagar con tarjeta?", "¿Cuánto cuesta esto?", "¡Eso es muy caro!"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again, please?", es: "¿Puede repetirlo, por favor?", ko: "다시 한번 말해 주시겠어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "이거 얼마예요?", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
        { text: "만 원이에요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "만 원이에요.", en: "It's ten thousand won.", es: "Son diez mil won." } },
        { text: "너무 비싸요!", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "너무 비싸요!", en: "That's too expensive!", es: "¡Muy caro!" } },
        { text: "카드로 결제할 수 있어요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" }, recallRound: true },
        { text: "계산서 주세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "계산서 주세요.", en: "The bill, please.", es: "La cuenta, por favor." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: 이거 얼마예요? → ___(원)이에요. 비쌀 때: 너무 비싸요! 결제: 카드로 결제할 수 있어요? / 계산서 주세요.", en: "Pattern: 이거 얼마예요? → ___(원)이에요. Too pricey: 너무 비싸요! Paying: 카드로 결제할 수 있어요? / 계산서 주세요.", es: "Patrón: 이거 얼마예요? → ___(원)이에요. Caro: 너무 비싸요! Pagar: 카드로 결제할 수 있어요? / 계산서 주세요." },
          examples: { ko: "이 수프 얼마예요? 팔천 원이에요. (수프 가격을 물을 때)\n큰 피자 얼마예요? 만오천 원이에요. (큰 피자 가격)\n카드로 결제할 수 있어요? 네, 가능합니다! (결제 방법 물을 때)", en: "이 수프 얼마예요? 팔천 원이에요. (How much is the soup? 8,000 won.)\n큰 피자 얼마예요? 만오천 원이에요. (Big pizza? 15,000 won.)\n카드로 결제할 수 있어요? 네! (Can I pay by card? Yes!)", es: "이 수프 얼마예요? 팔천 원이에요. (¿Cuánto es la sopa? 8.000 won.)\n큰 피자 얼마예요? 만오천 원이에요. (¿Pizza grande? 15.000 won.)\n카드로 결제할 수 있어요? 네! (¿Tarjeta? ¡Sí!)" },
          mistakes: { ko: "❌ 이거 얼마입니까?\n✅ 이거 얼마예요? (일상에서는 '예요'가 자연스러워요! '입니까'는 너무 격식체.)\n\n❌ 카드를 결제할 수 있어요?\n✅ 카드로 결제할 수 있어요? ('를'이 아니라 '로'예요! '카드로' = 카드로써)", en: "❌ 이거 얼마입니까?\n✅ 이거 얼마예요? (Use 예요 in everyday speech — 입니까 is too formal for restaurants!)\n\n❌ 카드를 결제할 수 있어요?\n✅ 카드로 결제할 수 있어요? (Use 로 'by/with', not 를! 카드로 = by card.)", es: "❌ 이거 얼마입니까?\n✅ 이거 얼마예요? (Usa 예요 en el habla diaria — 입니까 es demasiado formal.)\n\n❌ 카드를 결제할 수 있어요?\n✅ 카드로 결제할 수 있어요? (Usa 로 'con/por', no 를. 카드로 = con tarjeta.)" },
          rudyTip: { ko: "탐정 루디의 팁: 한국에서는 거의 다 카드 결제가 돼! '카드로 결제할 수 있어요?'만 알면 어디서든 OK. 현금이 필요하면 '현금으로 할게요'라고 해~", en: "Detective Rudy's tip: Almost everywhere in Korea accepts cards! Just say '카드로 결제할 수 있어요?' and you're set. Korean won has big numbers — 만 원 = 10,000 won!", es: "Consejo del detective Rudy: ¡Casi todo en Corea acepta tarjeta! Di '카드로 결제할 수 있어요?' y listo. ¡Los won coreanos usan números grandes — 만 원 = 10.000 won!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "이거 ___예요?", answer: "얼마", options: ["얼마", "뭐", "어디"], fullSentence: "이거 얼마예요?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta?" } },
          { type: "select", promptWithBlank: "너무 ___요!", answer: "비싸", options: ["비싸", "싸", "좋아"], fullSentence: "너무 비싸요!", fullSentenceMeaning: { ko: "너무 비싸요!", en: "Too expensive!", es: "¡Muy caro!" } },
          { type: "select", promptWithBlank: "카드___ 결제할 수 있어요?", answer: "로", options: ["로", "에", "을"], fullSentence: "카드로 결제할 수 있어요?", fullSentenceMeaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" } },
          { type: "input", promptWithBlank: "___ 주세요.", answer: "계산서", fullSentence: "계산서 주세요.", fullSentenceMeaning: { ko: "계산서 주세요.", en: "The bill, please.", es: "La cuenta, por favor." } },
          { type: "input", promptWithBlank: "___ 원이에요.", answer: "만", fullSentence: "만 원이에요.", fullSentenceMeaning: { ko: "만 원이에요.", en: "It's 10,000 won.", es: "Son 10.000 won." } },
          { type: "listening", audioText: "계산서 주세요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["계산서 주세요.", "카드로 결제할 수 있어요?", "이거 얼마예요?", "너무 비싸요!"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again, please?", es: "¿Puede repetirlo, por favor?", ko: "다시 한번 말해 주시겠어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    indonesian: {
      step1Sentences: [
        { text: "Ini berapa harganya?", speechLang: "id-ID", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
        { text: "Harganya sepuluh dolar.", speechLang: "id-ID", meaning: { ko: "10달러예요.", en: "It's ten dollars.", es: "Son diez dólares." } },
        { text: "Itu terlalu mahal!", speechLang: "id-ID", meaning: { ko: "너무 비싸요!", en: "That's too expensive!", es: "¡Eso es muy caro!" } },
        { text: "Boleh saya bayar dengan kartu?", speechLang: "id-ID", meaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" }, recallRound: true },
        { text: "Minta bonnya, tolong.", speechLang: "id-ID", meaning: { ko: "계산서 주세요.", en: "The bill, please.", es: "La cuenta, por favor." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: ___ berapa harganya? (얼마예요?) → Harganya ___ (가격은 ~예요). 비쌀 때: Itu terlalu mahal! 결제: Boleh saya bayar dengan kartu? / Minta bonnya, tolong.", en: "Pattern: ___ berapa harganya? (How much?) → Harganya ___ (The price is ___). Too pricey: Itu terlalu mahal! Paying: Boleh saya bayar dengan kartu? / Minta bonnya, tolong.", es: "Patrón: ___ berapa harganya? (¿Cuánto cuesta?) → Harganya ___ (El precio es ___). Caro: Itu terlalu mahal! Pagar: Boleh saya bayar dengan kartu? / Minta bonnya, tolong." },
          examples: { ko: "Sup ini berapa harganya? Harganya delapan dolar. (이 수프 얼마예요? 8달러예요.)\nPizza besar berapa harganya? Harganya lima belas dolar. (큰 피자 얼마예요? 15달러예요.)\nBoleh saya bayar dengan kartu? Tentu! (카드로 돼요? 물론이죠!)", en: "Sup ini berapa harganya? Harganya delapan dolar. (How much is this soup? It's eight dollars.)\nPizza besar berapa harganya? Harganya lima belas dolar. (How much is a large pizza? Fifteen dollars.)\nBoleh saya bayar dengan kartu? Tentu! (Can I pay by card? Of course!)", es: "Sup ini berapa harganya? Harganya delapan dolar. (¿Cuánto cuesta esta sopa? Ocho dólares.)\nPizza besar berapa harganya? Harganya lima belas dolar. (¿Una pizza grande? Quince dólares.)\nBoleh saya bayar dengan kartu? Tentu! (¿Puedo pagar con tarjeta? ¡Claro!)" },
          mistakes: { ko: "❌ Ini berapa mahal?\n✅ Ini berapa harganya? (가격을 물을 때는 'berapa harganya'(얼마)! 'mahal'은 '비싼'이라는 뜻이에요.)\n\n❌ Saya bayar kartu.\n✅ Boleh saya bayar dengan kartu? ('카드로'는 'dengan kartu'! 'dengan'(~로)을 빼먹지 마세요.)", en: "❌ Ini berapa mahal?\n✅ Ini berapa harganya? (Ask price with 'berapa harganya' (how much) — 'mahal' means 'expensive'!)\n\n❌ Saya bayar kartu.\n✅ Boleh saya bayar dengan kartu? ('By card' is 'dengan kartu' — don't drop 'dengan' (with/by)!)", es: "❌ Ini berapa mahal?\n✅ Ini berapa harganya? (Pregunta el precio con 'berapa harganya' — '¡mahal' significa 'caro'!)\n\n❌ Saya bayar kartu.\n✅ Boleh saya bayar dengan kartu? ('Con tarjeta' es 'dengan kartu' — ¡no omitas 'dengan' (con)!)" },
          rudyTip: { ko: "탐정 루디의 팁: 'berapa harganya?'가 핵심 단서야! 가격 답을 들을 때는 Unit 2에서 배운 숫자가 중요하니까 복습해둬. 인도네시아에서는 흥정도 가능하니 'terlalu mahal!'도 알아두면 좋아~", en: "Detective Rudy's tip: 'berapa harganya?' is the key clue! Listen for Unit 2 numbers in the answer. In Indonesia you can often haggle, so 'terlalu mahal!' (too expensive!) is handy evidence!", es: "Consejo del detective Rudy: '¡berapa harganya?' es la pista clave! Escucha los números de la Unidad 2. En Indonesia se puede regatear, así que 'terlalu mahal!' es muy útil." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Ini berapa ___?", answer: "harganya", options: ["harganya", "mahal", "uang"], fullSentence: "Ini berapa harganya?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
          { type: "select", promptWithBlank: "Itu terlalu ___!", answer: "mahal", options: ["mahal", "murah", "besar"], fullSentence: "Itu terlalu mahal!", fullSentenceMeaning: { ko: "너무 비싸요!", en: "That's too expensive!", es: "¡Eso es muy caro!" } },
          { type: "select", promptWithBlank: "Boleh saya bayar ___ kartu?", answer: "dengan", options: ["dengan", "di", "untuk"], fullSentence: "Boleh saya bayar dengan kartu?", fullSentenceMeaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" } },
          { type: "input", promptWithBlank: "Minta ___, tolong.", answer: "bonnya", fullSentence: "Minta bonnya, tolong.", fullSentenceMeaning: { ko: "계산서 주세요.", en: "The bill, please.", es: "La cuenta, por favor." } },
          { type: "input", promptWithBlank: "Harganya ___ dolar.", answer: "sepuluh", fullSentence: "Harganya sepuluh dolar.", fullSentenceMeaning: { ko: "10달러예요.", en: "It's ten dollars.", es: "Son diez dólares." } },
          { type: "listening", audioText: "Minta bonnya, tolong.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Minta bonnya, tolong.", "Boleh saya bayar dengan kartu?", "Ini berapa harganya?", "Itu terlalu mahal!"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again, please?", es: "¿Puede repetirlo, por favor?", ko: "다시 한번 말해 주시겠어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    arabic: {
      step1Sentences: [
        { text: "هٰذا بِكَمْ؟ (hāḏā bikam?)", speechLang: "ar-EG", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
        { text: "بِعَشَرة دولار. (bi-ʿashara dūlār)", speechLang: "ar-EG", meaning: { ko: "10달러예요.", en: "It's ten dollars.", es: "Son diez dólares." } },
        { text: "هٰذا غالي جِدًّا! (hāḏā ghālī jiddan!)", speechLang: "ar-EG", meaning: { ko: "너무 비싸요!", en: "That's too expensive!", es: "¡Eso es muy caro!" } },
        { text: "مُمْكِن أَدْفَع بِالبِطاقة؟ (mumkin adfaʿ bil-biṭāqa?)", speechLang: "ar-EG", meaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" }, recallRound: true },
        { text: "الحِساب، لَوْ سَمَحْت. (al-ḥisāb, law samaḥt)", speechLang: "ar-EG", meaning: { ko: "계산서 주세요.", en: "The bill, please.", es: "La cuenta, por favor." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: ___ بِكَمْ؟ (얼마예요?) → بـ ___ (가격은 ~예요). 비쌀 때: هٰذا غالي جِدًّا! 결제: مُمْكِن أَدْفَع بِالبِطاقة؟ / الحِساب، لَوْ سَمَحْت. 'بِكَمْ(bikam)'는 '얼마', 'غالي(ghālī)'는 '비싼'이에요.", en: "Pattern: ___ بِكَمْ؟ (How much?) → بـ ___ (It's ___). Too pricey: hāḏā ghālī jiddan! Paying: mumkin adfaʿ bil-biṭāqa? / al-ḥisāb, law samaḥt. 'bikam' = how much, 'ghālī' = expensive.", es: "Patrón: ___ بِكَمْ؟ (¿Cuánto cuesta?) → بـ ___ (Son ___). Caro: hāḏā ghālī jiddan! Pagar: mumkin adfaʿ bil-biṭāqa? / al-ḥisāb, law samaḥt. 'bikam' = cuánto, 'ghālī' = caro." },
          examples: { ko: "هٰذا الحَساء بِكَمْ؟ بِثَمانية دولار. (hāḏā al-ḥasāʾ bikam? bi-thamāniya dūlār — 이 수프 얼마예요? 8달러예요.)\nالبيتزا الكَبيرة بِكَمْ؟ بِخَمْسة عَشَر دولار. (al-bītzā al-kabīra bikam? bi-khamsata ʿashar dūlār — 큰 피자 얼마예요? 15달러예요.)\nمُمْكِن أَدْفَع بِالبِطاقة؟ بِالتَّأْكيد! (mumkin adfaʿ bil-biṭāqa? bit-taʾkīd! — 카드로 돼요? 물론이죠!)", en: "هٰذا الحَساء بِكَمْ؟ بِثَمانية دولار. (hāḏā al-ḥasāʾ bikam? bi-thamāniya dūlār — How much is this soup? It's eight dollars.)\nالبيتزا الكَبيرة بِكَمْ؟ بِخَمْسة عَشَر دولار. (al-bītzā al-kabīra bikam? bi-khamsata ʿashar dūlār — How much is a large pizza? Fifteen dollars.)\nمُمْكِن أَدْفَع بِالبِطاقة؟ بِالتَّأْكيد! (mumkin adfaʿ bil-biṭāqa? bit-taʾkīd! — Can I pay by card? Of course!)", es: "هٰذا الحَساء بِكَمْ؟ بِثَمانية دولار. (hāḏā al-ḥasāʾ bikam? bi-thamāniya dūlār — ¿Cuánto cuesta esta sopa? Ocho dólares.)\nالبيتزا الكَبيرة بِكَمْ؟ بِخَمْسة عَشَر دولار. (al-bītzā al-kabīra bikam? bi-khamsata ʿashar dūlār — ¿Una pizza grande? Quince dólares.)\nمُمْكِن أَدْفَع بِالبِطاقة؟ بِالتَّأْكيد! (mumkin adfaʿ bil-biṭāqa? bit-taʾkīd! — ¿Puedo pagar con tarjeta? ¡Claro!)" },
          mistakes: { ko: "❌ هٰذا كَمْ غالي؟ (hāḏā kam ghālī?)\n✅ هٰذا بِكَمْ؟ (hāḏā bikam? — 가격을 물을 때는 'بِكَمْ(bikam)'(얼마)! 'غالي(ghālī)'는 '비싼'이라는 뜻이에요.)\n\n✅ هٰذا بِكَمْ؟ / كَمْ ثَمَنُهُ؟ (hāḏā bikam? / kam thamanuhu? — 표준어에서 가격은 'بِكَمْ' 또는 'كَمْ ثَمَنُهُ'로 물어요.)\n💬 이집트 구어로도 'بكام(bekām)'이라 하지만 표준어 발음은 'bikam' ✓", en: "❌ هٰذا كَمْ غالي؟ (hāḏā kam ghālī?)\n✅ هٰذا بِكَمْ؟ (hāḏā bikam? — Ask price with 'bikam' (how much) — 'ghālī' means 'expensive'!)\n\n✅ هٰذا بِكَمْ؟ / كَمْ ثَمَنُهُ؟ (hāḏā bikam? / kam thamanuhu? — In MSA, ask the price with 'bikam' or 'kam thamanuhu'.)\n💬 Egyptian dialect also says 'bekām', but the MSA pronunciation is 'bikam' ✓", es: "❌ هٰذا كَمْ غالي؟ (hāḏā kam ghālī?)\n✅ هٰذا بِكَمْ؟ (hāḏā bikam? — Pregunta el precio con 'bikam' (cuánto) — '¡ghālī' significa 'caro'!)\n\n✅ هٰذا بِكَمْ؟ / كَمْ ثَمَنُهُ؟ (hāḏā bikam? / kam thamanuhu? — En MSA, pregunta el precio con 'bikam' o 'kam thamanuhu'.)\n💬 El dialecto egipcio también dice 'bekām', pero la pronunciación MSA es 'bikam' ✓" },
          rudyTip: { ko: "탐정 루디의 팁: 'بِكَمْ؟(bikam?)'가 핵심 단서야! 가격 답을 들을 때는 Unit 2에서 배운 숫자가 중요하니까 복습해둬. 비싸면 'غالي جِدًّا!(ghālī jiddan!)'도 알아두면 좋아~", en: "Detective Rudy's tip: 'bikam?' is the key clue! Listen for Unit 2 numbers in the answer. If it's pricey, 'ghālī jiddan!' (too expensive!) is handy evidence!", es: "Consejo del detective Rudy: '¡bikam?' es la pista clave! Escucha los números de la Unidad 2. Si es caro, 'ghālī jiddan!' es muy útil." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "هٰذا ___؟", answer: "بِكَمْ", options: ["بِكَمْ", "غالي", "نُقود"], fullSentence: "هٰذا بِكَمْ؟", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
          { type: "select", promptWithBlank: "هٰذا ___ جِدًّا!", answer: "غالي", options: ["غالي", "رَخيص", "كَبير"], fullSentence: "هٰذا غالي جِدًّا!", fullSentenceMeaning: { ko: "너무 비싸요!", en: "That's too expensive!", es: "¡Eso es muy caro!" } },
          { type: "select", promptWithBlank: "مُمْكِن أَدْفَع ___؟", answer: "بِالبِطاقة", options: ["بِالبِطاقة", "في البِطاقة", "لِلْبِطاقة"], fullSentence: "مُمْكِن أَدْفَع بِالبِطاقة؟", fullSentenceMeaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" } },
          { type: "input", promptWithBlank: "___، لَوْ سَمَحْت.", answer: "الحِساب", fullSentence: "الحِساب، لَوْ سَمَحْت.", fullSentenceMeaning: { ko: "계산서 주세요.", en: "The bill, please.", es: "La cuenta, por favor." } },
          { type: "input", promptWithBlank: "بِ___ دولار.", answer: "عَشَرة", fullSentence: "بِعَشَرة دولار.", fullSentenceMeaning: { ko: "10달러예요.", en: "It's ten dollars.", es: "Son diez dólares." } },
          { type: "listening", audioText: "الحِساب، لَوْ سَمَحْت.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["الحِساب، لَوْ سَمَحْت.", "مُمْكِن أَدْفَع بِالبِطاقة؟", "هٰذا بِكَمْ؟", "هٰذا غالي جِدًّا!"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", ko: "죄송해요, 이해를 못 했어요." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Can you say that again, please?", es: "¿Puede repetirlo, por favor?", ko: "다시 한번 말해 주시겠어요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
  },

  // ─────────────── Day 16: Expressing Food Feelings ────────────────────────
  day_16: {
    english: {
      step1Sentences: [
        { text: "This is delicious!", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "이거 맛있어요!", en: "This is delicious!", es: "¡Esto está delicioso!" } },
        { text: "It's very good.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "정말 맛있어요.", en: "It's very good.", es: "Está muy bueno." } },
        { text: "It's too salty.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "너무 짜요.", en: "It's too salty.", es: "Está muy salado." } },
        { text: "It's too sweet.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "너무 달아요.", en: "It's too sweet.", es: "Está muy dulce." }, recallRound: true },
        { text: "I'm full. Thank you!", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "배불러요. 감사합니다!", en: "I'm full. Thank you!", es: "Estoy lleno. ¡Gracias!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: This is + 맛 형용사! / It's too + 맛. 긍정: delicious, very good. 부정: too salty, too sweet, too spicy. 끝날 때: I'm full.", en: "Pattern: This is + taste adjective! / It's too + taste. Positive: delicious, very good. Negative: too salty, too sweet, too spicy. Finished: I'm full.", es: "Patrón: This is + adjetivo! / It's too + sabor. Positivo: delicious, very good. Negativo: too salty, too sweet, too spicy. Terminaste: I'm full." },
          examples: { ko: "This is delicious! I love it! (이거 맛있어요! 정말 좋아요!)\nIt's too spicy for me. (저한테는 너무 매워요.)\nI'm full. That was amazing! (배불러요. 정말 맛있었어요!)", en: "This is delicious! I love it! (Expressing enthusiasm about food.)\nIt's too spicy for me. (Explaining food is too strong for your taste.)\nI'm full. That was amazing! (Saying you've had enough.)", es: "This is delicious! I love it! (Expresando entusiasmo.)\nIt's too spicy for me. (Explicando que la comida es muy fuerte.)\nI'm full. That was amazing! (Diciendo que ya comiste suficiente.)" },
          mistakes: { ko: "❌ This is delicious food!\n✅ This is delicious! ('food'를 안 넣어도 돼요! 음식을 먹으며 말하면 뭔지 다 알아요.)\n\n❌ I'm fool.\n✅ I'm full. ('fool'은 바보라는 뜻! 'full'은 배부르다예요. 발음 주의!)", en: "❌ The food is too much salty.\n✅ The food is too salty. (Don't add 'much' with 'too' — 'too' already means excessively!)\n\n❌ I'm fool.\n✅ I'm full. ('fool' means silly person! 'full' means satisfied — watch the spelling!)", es: "❌ The food is too much salty.\n✅ The food is too salty. (No agregues 'much' con 'too' — 'too' ya significa excesivamente.)\n\n❌ I'm fool.\n✅ I'm full. ('fool' = tonto. 'full' = satisfecho. ¡Cuidado con la ortografía!)" },
          rudyTip: { ko: "탐정 루디의 팁: 'too'는 '너무'라는 뜻이야! too salty, too sweet, too spicy — 맛이 너무 강할 때 쓰는 단서야. 맛있을 때는 'delicious!' 한 마디면 충분해~", en: "Detective Rudy's tip: 'Too' is your clue for 'excessively'! Too salty, too sweet, too spicy — use it when the taste is overdone. For yummy food, just say 'Delicious!' Case solved!", es: "Consejo del detective Rudy: 'Too' = 'demasiado'. Too salty, too sweet, too spicy — cuando el sabor es excesivo. ¿Rica? ¡Solo di 'Delicious!' Caso resuelto!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "This is ___!", answer: "delicious", options: ["delicious", "hungry", "thirsty"], fullSentence: "This is delicious!", fullSentenceMeaning: { ko: "이거 맛있어요!", en: "This is delicious!", es: "¡Esto está delicioso!" } },
          { type: "select", promptWithBlank: "It's too ___.", answer: "salty", options: ["salty", "salt", "salting"], fullSentence: "It's too salty.", fullSentenceMeaning: { ko: "너무 짜요.", en: "It's too salty.", es: "Está muy salado." } },
          { type: "select", promptWithBlank: "I'm ___. Thank you!", answer: "full", options: ["full", "hungry", "good"], fullSentence: "I'm full. Thank you!", fullSentenceMeaning: { ko: "배불러요. 감사합니다!", en: "I'm full. Thank you!", es: "Estoy lleno. ¡Gracias!" } },
          { type: "input", promptWithBlank: "It's very ___.", answer: "good", fullSentence: "It's very good.", fullSentenceMeaning: { ko: "정말 맛있어요.", en: "It's very good.", es: "Está muy bueno." } },
          { type: "input", promptWithBlank: "It's too ___.", answer: "sweet", fullSentence: "It's too sweet.", fullSentenceMeaning: { ko: "너무 달아요.", en: "It's too sweet.", es: "Está muy dulce." } },
          { type: "listening", audioText: "I'm full. Thank you!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["I'm full. Thank you!", "It's too sweet.", "This is delicious!", "It's too salty."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Where is the exit?", es: "¿Dónde está la salida?", ko: "출구가 어디에요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Excuse me.", es: "Disculpe.", ko: "실례합니다." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "¡Esto está delicioso!", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "이거 맛있어요!", en: "This is delicious!", es: "¡Esto está delicioso!" } },
        { text: "Está muy bueno.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "정말 맛있어요.", en: "It's very good.", es: "Está muy bueno." } },
        { text: "Está muy salado.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "너무 짜요.", en: "It's too salty.", es: "Está muy salado." } },
        { text: "Está muy dulce.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "너무 달아요.", en: "It's too sweet.", es: "Está muy dulce." }, recallRound: true },
        { text: "Estoy lleno. ¡Gracias!", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "배불러요. 감사합니다!", en: "I'm full. Thank you!", es: "Estoy lleno. ¡Gracias!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Está + 맛 형용사. 긍정: delicioso, muy bueno. 부정: muy salado, muy dulce, muy picante. 끝: Estoy lleno/a. 음식은 'Está', 사람은 'Estoy'!", en: "Pattern: Está + taste adjective. Positive: delicioso, muy bueno. Negative: muy salado, muy dulce, muy picante. Done: Estoy lleno/a. Food = 'Está', person = 'Estoy'!", es: "Patrón: Está + adjetivo. Positivo: delicioso, muy bueno. Negativo: muy salado, muy dulce, muy picante. Fin: Estoy lleno/a. Comida = 'Está', persona = 'Estoy'." },
          examples: { ko: "¡Está delicioso! Me encanta. (맛있어요! 정말 좋아요.)\nEstá muy picante para mí. (저한테는 너무 매워요.)\nEstoy lleno. ¡Estuvo increíble! (배불러요. 정말 맛있었어요!)", en: "¡Está delicioso! Me encanta. (This is delicious! I love it.)\nEstá muy picante para mí. (It's too spicy for me.)\nEstoy lleno. ¡Estuvo increíble! (I'm full. That was amazing!)", es: "¡Está delicioso! Me encanta. (Expresando entusiasmo.)\nEstá muy picante para mí. (Explicando que es muy fuerte.)\nEstoy lleno. ¡Estuvo increíble! (Ya comiste suficiente.)" },
          mistakes: { ko: "❌ Es delicioso.\n✅ Está delicioso. (음식 맛은 'es'가 아니라 'está'를 써요! 상태를 표현하니까.)\n\n❌ Soy lleno.\n✅ Estoy lleno. (배부른 건 상태! 'soy'가 아니라 'estoy'예요.)", en: "❌ Es delicioso.\n✅ Está delicioso. (Use 'está' for taste — it's a temporary state, not a permanent trait!)\n\n❌ Soy lleno.\n✅ Estoy lleno. (Being full is a state — use 'estoy', not 'soy'!)", es: "❌ Es delicioso.\n✅ Está delicioso. (Usa 'está' para sabor — es un estado temporal, no permanente.)\n\n❌ Soy lleno.\n✅ Estoy lleno. (Estar lleno es un estado — usa 'estoy', no 'soy'.)" },
          rudyTip: { ko: "탐정 루디의 팁: ser vs estar 구별이 중요한 단서야! 음식 맛은 항상 'Está' — 지금 이 순간의 상태니까. 'Es delicioso'라고 하면 원래부터 항상 맛있다는 뜻이 돼버려~", en: "Detective Rudy's tip: ser vs estar — the critical clue! Food taste always uses 'está' because it's about right now. 'Es delicioso' would mean it's inherently always delicious!", es: "Consejo del detective Rudy: ser vs estar — ¡la pista clave! El sabor siempre usa 'está' porque es sobre ahora mismo. ¡'Es delicioso' significaría que es siempre delicioso!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "¡Esto está ___!", answer: "delicioso", options: ["delicioso", "hambriento", "sediento"], fullSentence: "¡Esto está delicioso!", fullSentenceMeaning: { ko: "이거 맛있어요!", en: "This is delicious!", es: "¡Esto está delicioso!" } },
          { type: "select", promptWithBlank: "Está muy ___.", answer: "salado", options: ["salado", "sal", "salsa"], fullSentence: "Está muy salado.", fullSentenceMeaning: { ko: "너무 짜요.", en: "Too salty.", es: "Está muy salado." } },
          { type: "select", promptWithBlank: "Estoy ___. ¡Gracias!", answer: "lleno", options: ["lleno", "hambre", "bueno"], fullSentence: "Estoy lleno. ¡Gracias!", fullSentenceMeaning: { ko: "배불러요. 감사합니다!", en: "I'm full. Thanks!", es: "Estoy lleno. ¡Gracias!" } },
          { type: "input", promptWithBlank: "Está muy ___.", answer: "bueno", fullSentence: "Está muy bueno.", fullSentenceMeaning: { ko: "정말 맛있어요.", en: "It's very good.", es: "Está muy bueno." } },
          { type: "input", promptWithBlank: "Está muy ___.", answer: "dulce", fullSentence: "Está muy dulce.", fullSentenceMeaning: { ko: "너무 달아요.", en: "Too sweet.", es: "Está muy dulce." } },
          { type: "listening", audioText: "Estoy lleno. ¡Gracias!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Estoy lleno. ¡Gracias!", "Está muy dulce.", "¡Esto está delicioso!", "Está muy salado."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Where is the exit?", es: "¿Dónde está la salida?", ko: "출구가 어디에요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Excuse me.", es: "Disculpe.", ko: "실례합니다." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "이거 맛있어요!", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "이거 맛있어요!", en: "This is delicious!", es: "¡Esto está delicioso!" } },
        { text: "정말 맛있어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "정말 맛있어요.", en: "It's very good.", es: "Está muy bueno." } },
        { text: "너무 짜요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "너무 짜요.", en: "It's too salty.", es: "Está muy salado." } },
        { text: "너무 달아요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "너무 달아요.", en: "It's too sweet.", es: "Está muy dulce." }, recallRound: true },
        { text: "배불러요. 감사합니다!", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "배불러요. 감사합니다!", en: "I'm full. Thank you!", es: "Estoy lleno. ¡Gracias!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: 맛 형용사 + 아/어요. 긍정: 맛있어요, 정말 맛있어요. 부정: 너무 짜요, 너무 달아요, 너무 매워요. 다 먹으면: 배불러요.", en: "Pattern: taste adjective + 아/어요. Positive: 맛있어요, 정말 맛있어요. Negative: 너무 짜요, 너무 달아요, 너무 매워요. Finished: 배불러요.", es: "Patrón: adjetivo + 아/어요. Positivo: 맛있어요, 정말 맛있어요. Negativo: 너무 짜요, 너무 달아요, 너무 매워요. Fin: 배불러요." },
          examples: { ko: "이거 정말 맛있어요! 최고예요! (맛있을 때)\n저한테는 너무 매워요. (매울 때)\n배불러요. 정말 맛있었어요! (다 먹었을 때)", en: "이거 정말 맛있어요! 최고예요! (This is really delicious! The best!)\n저한테는 너무 매워요. (It's too spicy for me.)\n배불러요. 정말 맛있었어요! (I'm full. It was really good!)", es: "이거 정말 맛있어요! 최고예요! (¡Esto es delicioso! ¡Lo mejor!)\n저한테는 너무 매워요. (Es muy picante para mí.)\n배불러요. 정말 맛있었어요! (Estoy lleno. ¡Estaba muy bueno!)" },
          mistakes: { ko: "❌ 이거 맛있다!\n✅ 이거 맛있어요! (반말 '맛있다'가 아니라 존댓말 '맛있어요'를 써요!)\n\n❌ 너무 짠요.\n✅ 너무 짜요. (짜다 → 짜+아요 → 짜요! 'ㄴ'이 안 들어가요.)", en: "❌ 이거 맛있다!\n✅ 이거 맛있어요! (Use polite form 맛있어요, not casual 맛있다 — especially in restaurants!)\n\n❌ 너무 짠요.\n✅ 너무 짜요. (짜다 → 짜+아요 → 짜요. No extra ㄴ!)", es: "❌ 이거 맛있다!\n✅ 이거 맛있어요! (Usa forma cortés 맛있어요, no casual 맛있다.)\n\n❌ 너무 짠요.\n✅ 너무 짜요. (짜다 → 짜+아요 → 짜요. ¡Sin ㄴ extra!)" },
          rudyTip: { ko: "탐정 루디의 팁: '너무'는 맛이 과할 때 쓰는 단서야! 너무 짜요, 너무 달아요, 너무 매워요. 근데 '너무 맛있어요'도 가능해 — 이때는 '진짜 맛있다'란 뜻이야!", en: "Detective Rudy's tip: '너무' means 'too much' — but here's a twist! With negative tastes (짜요, 매워요), it means 'too.' But '너무 맛있어요' means 'SO delicious' — a positive clue!", es: "Consejo del detective Rudy: '너무' = 'demasiado' — ¡pero tiene un giro! Con sabores negativos (짜요, 매워요) = 'demasiado'. Pero '너무 맛있어요' = 'TAN delicioso'." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "이거 ___어요!", answer: "맛있", options: ["맛있", "맛없", "배고프"], fullSentence: "이거 맛있어요!", fullSentenceMeaning: { ko: "이거 맛있어요!", en: "This is delicious!", es: "¡Delicioso!" } },
          { type: "select", promptWithBlank: "너무 ___요.", answer: "짜", options: ["짜", "싸", "차"], fullSentence: "너무 짜요.", fullSentenceMeaning: { ko: "너무 짜요.", en: "Too salty.", es: "Muy salado." } },
          { type: "select", promptWithBlank: "___러요. 감사합니다!", answer: "배불", options: ["배불", "배고", "기쁘"], fullSentence: "배불러요. 감사합니다!", fullSentenceMeaning: { ko: "배불러요. 감사합니다!", en: "I'm full. Thanks!", es: "Estoy lleno. ¡Gracias!" } },
          { type: "input", promptWithBlank: "___ 맛있어요.", answer: "정말", fullSentence: "정말 맛있어요.", fullSentenceMeaning: { ko: "정말 맛있어요.", en: "It's really good.", es: "Está muy bueno." } },
          { type: "input", promptWithBlank: "너무 ___요.", answer: "달아", fullSentence: "너무 달아요.", fullSentenceMeaning: { ko: "너무 달아요.", en: "Too sweet.", es: "Muy dulce." } },
          { type: "listening", audioText: "배불러요. 감사합니다!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["배불러요. 감사합니다!", "너무 달아요.", "이거 맛있어요!", "너무 짜요."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Where is the exit?", es: "¿Dónde está la salida?", ko: "출구가 어디에요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Excuse me.", es: "Disculpe.", ko: "실례합니다." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    indonesian: {
      step1Sentences: [
        { text: "Ini enak sekali!", speechLang: "id-ID", meaning: { ko: "이거 맛있어요!", en: "This is delicious!", es: "¡Esto está delicioso!" } },
        { text: "Ini sangat enak.", speechLang: "id-ID", meaning: { ko: "정말 맛있어요.", en: "It's very good.", es: "Está muy bueno." } },
        { text: "Ini terlalu asin.", speechLang: "id-ID", meaning: { ko: "너무 짜요.", en: "It's too salty.", es: "Está muy salado." } },
        { text: "Ini terlalu manis.", speechLang: "id-ID", meaning: { ko: "너무 달아요.", en: "It's too sweet.", es: "Está muy dulce." }, recallRound: true },
        { text: "Saya kenyang. Terima kasih!", speechLang: "id-ID", meaning: { ko: "배불러요. 감사합니다!", en: "I'm full. Thank you!", es: "Estoy lleno. ¡Gracias!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Ini enak! (맛있어요!) / Ini terlalu ___ (너무 ~해요). 긍정: enak, sangat enak. 부정: terlalu asin(짜다), terlalu manis(달다), terlalu pedas(맵다). 다 먹으면: Saya kenyang.", en: "Pattern: Ini enak! (It's delicious!) / Ini terlalu ___ (It's too ___). Positive: enak, sangat enak. Negative: terlalu asin (salty), terlalu manis (sweet), terlalu pedas (spicy). Finished: Saya kenyang.", es: "Patrón: Ini enak! (¡Está delicioso!) / Ini terlalu ___ (Está muy ___). Positivo: enak, sangat enak. Negativo: terlalu asin (salado), terlalu manis (dulce), terlalu pedas (picante). Lleno: Saya kenyang." },
          examples: { ko: "Ini enak sekali! Saya suka! (이거 정말 맛있어요! 좋아요!)\nIni terlalu pedas buat saya. (저한테는 너무 매워요.)\nSaya kenyang. Tadi enak sekali! (배불러요. 정말 맛있었어요!)", en: "Ini enak sekali! Saya suka! (This is so delicious! I like it!)\nIni terlalu pedas buat saya. (It's too spicy for me.)\nSaya kenyang. Tadi enak sekali! (I'm full. That was so good!)", es: "Ini enak sekali! Saya suka! (¡Esto está delicioso! ¡Me gusta!)\nIni terlalu pedas buat saya. (Es muy picante para mí.)\nSaya kenyang. Tadi enak sekali! (Estoy lleno. ¡Estuvo muy bueno!)" },
          mistakes: { ko: "❌ Saya enak.\n✅ Ini enak. (음식이 맛있다고 할 때는 'Ini'(이것)! 'Saya enak'은 내가 맛있다는 이상한 뜻이 돼요.)\n\n❌ Saya penuh.\n✅ Saya kenyang. (배부르다는 'kenyang'! 'penuh'는 물건이 가득 찼다는 뜻이에요.)", en: "❌ Saya enak.\n✅ Ini enak. (For tasty food, use 'Ini' (this) — 'Saya enak' awkwardly means 'I am tasty'!)\n\n❌ Saya penuh.\n✅ Saya kenyang. ('Full (from food)' is 'kenyang' — 'penuh' means a container is full!)", es: "❌ Saya enak.\n✅ Ini enak. (Para comida rica usa 'Ini' (esto) — '¡Saya enak' significa 'yo soy rico'!)\n\n❌ Saya penuh.\n✅ Saya kenyang. ('Lleno (de comida)' es 'kenyang' — '¡penuh' es un recipiente lleno!)" },
          rudyTip: { ko: "탐정 루디의 팁: 'enak'은 맛있을 때 쓰는 마법의 단어야! 강조하려면 'enak sekali'(아주 맛있어요)나 'sangat enak'을 써. 'terlalu'(너무)는 맛이 과할 때 쓰는 단서지~", en: "Detective Rudy's tip: 'enak' is the magic word for tasty! To emphasize, say 'enak sekali' or 'sangat enak' (very delicious). 'terlalu' (too) is your clue for an overdone taste!", es: "Consejo del detective Rudy: '¡enak' es la palabra mágica para 'rico'! Para enfatizar, di 'enak sekali' o 'sangat enak'. 'terlalu' (demasiado) es tu pista para un sabor excesivo." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Ini ___ sekali!", answer: "enak", options: ["enak", "lapar", "haus"], fullSentence: "Ini enak sekali!", fullSentenceMeaning: { ko: "이거 맛있어요!", en: "This is delicious!", es: "¡Esto está delicioso!" } },
          { type: "select", promptWithBlank: "Ini terlalu ___.", answer: "asin", options: ["asin", "garam", "asam"], fullSentence: "Ini terlalu asin.", fullSentenceMeaning: { ko: "너무 짜요.", en: "It's too salty.", es: "Está muy salado." } },
          { type: "select", promptWithBlank: "Saya ___. Terima kasih!", answer: "kenyang", options: ["kenyang", "lapar", "enak"], fullSentence: "Saya kenyang. Terima kasih!", fullSentenceMeaning: { ko: "배불러요. 감사합니다!", en: "I'm full. Thank you!", es: "Estoy lleno. ¡Gracias!" } },
          { type: "input", promptWithBlank: "Ini ___ enak.", answer: "sangat", fullSentence: "Ini sangat enak.", fullSentenceMeaning: { ko: "정말 맛있어요.", en: "It's very good.", es: "Está muy bueno." } },
          { type: "input", promptWithBlank: "Ini terlalu ___.", answer: "manis", fullSentence: "Ini terlalu manis.", fullSentenceMeaning: { ko: "너무 달아요.", en: "It's too sweet.", es: "Está muy dulce." } },
          { type: "listening", audioText: "Saya kenyang. Terima kasih!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Saya kenyang. Terima kasih!", "Ini terlalu manis.", "Ini enak sekali!", "Ini terlalu asin."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Where is the exit?", es: "¿Dónde está la salida?", ko: "출구가 어디에요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Excuse me.", es: "Disculpe.", ko: "실례합니다." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    arabic: {
      step1Sentences: [
        { text: "هٰذا لَذيذ جِدًّا! (hāḏā laḏīḏ jiddan!)", speechLang: "ar-EG", meaning: { ko: "이거 맛있어요!", en: "This is delicious!", es: "¡Esto está delicioso!" } },
        { text: "هٰذا حُلْو جِدًّا. (hāḏā ḥulw jiddan)", speechLang: "ar-EG", meaning: { ko: "정말 맛있어요.", en: "It's very good.", es: "Está muy bueno." } },
        { text: "هٰذا مالِح جِدًّا. (hāḏā māliḥ jiddan)", speechLang: "ar-EG", meaning: { ko: "너무 짜요.", en: "It's too salty.", es: "Está muy salado." } },
        { text: "هٰذا سُكَّرِيّ جِدًّا. (hāḏā sukkariyy jiddan)", speechLang: "ar-EG", meaning: { ko: "너무 달아요.", en: "It's too sweet.", es: "Está muy dulce." }, recallRound: true },
        { text: "أنا شَبْعان. شُكْرًا! (anā shabʿān. shukran!)", speechLang: "ar-EG", meaning: { ko: "배불러요. 감사합니다!", en: "I'm full. Thank you!", es: "Estoy lleno. ¡Gracias!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: هٰذا + 맛 형용사 + جِدًّا! 긍정: لَذيذ(laḏīḏ, 맛있는), حُلْو(ḥulw, 좋은/달콤한). 부정: مالِح(māliḥ, 짠), سُكَّرِيّ(sukkariyy, 단), حارّ(ḥārr, 매운). 'جِدًّا(jiddan)'는 '아주/너무'. 끝날 때: أنا شَبْعان(anā shabʿān).", en: "Pattern: هٰذا + taste adjective + جِدًّا! Positive: laḏīḏ (delicious), ḥulw (good/sweet-nice). Negative: māliḥ (salty), sukkariyy (too sweet), ḥārr (spicy). 'jiddan' = very/too. Finished: anā shabʿān (I'm full).", es: "Patrón: هٰذا + adjetivo + جِدًّا! Positivo: laḏīḏ (delicioso), ḥulw (bueno). Negativo: māliḥ (salado), sukkariyy (dulce), ḥārr (picante). 'jiddan' = muy/demasiado. Lleno: anā shabʿān." },
          examples: { ko: "هٰذا لَذيذ جِدًّا! أنا أُحِبُّه! (hāḏā laḏīḏ jiddan! anā uḥibbuhu! — 이거 맛있어요! 정말 좋아요!)\nهٰذا حارّ جِدًّا بِالنِّسْبة لي. (hāḏā ḥārr jiddan bin-nisba lī — 저한테는 너무 매워요.)\nأنا شَبْعان. كانَ لَذيذًا جِدًّا! (anā shabʿān. kāna laḏīḏan jiddan! — 배불러요. 정말 맛있었어요!)", en: "هٰذا لَذيذ جِدًّا! أنا أُحِبُّه! (hāḏā laḏīḏ jiddan! anā uḥibbuhu! — This is delicious! I love it!)\nهٰذا حارّ جِدًّا بِالنِّسْبة لي. (hāḏā ḥārr jiddan bin-nisba lī — It's too spicy for me.)\nأنا شَبْعان. كانَ لَذيذًا جِدًّا! (anā shabʿān. kāna laḏīḏan jiddan! — I'm full. That was so good!)", es: "هٰذا لَذيذ جِدًّا! أنا أُحِبُّه! (hāḏā laḏīḏ jiddan! anā uḥibbuhu! — ¡Esto está delicioso! ¡Me encanta!)\nهٰذا حارّ جِدًّا بِالنِّسْبة لي. (hāḏā ḥārr jiddan bin-nisba lī — Es muy picante para mí.)\nأنا شَبْعان. كانَ لَذيذًا جِدًّا! (anā shabʿān. kāna laḏīḏan jiddan! — Estoy lleno. ¡Estuvo muy bueno!)" },
          mistakes: { ko: "❌ أنا لَذيذ. (anā laḏīḏ)\n✅ هٰذا لَذيذ. (hāḏā laḏīḏ — 음식이 맛있다고 할 때는 'هٰذا(hāḏā)'(이거)! 'أنا لَذيذ'는 내가 맛있다는 이상한 뜻이 돼요.)\n\n❌ أنا مَلْآن. (anā malʾān)\n✅ أنا شَبْعان. (anā shabʿān — 배부르다는 'شَبْعان(shabʿān)'! 'مَلْآن(malʾān)'은 물건이 가득 찼다는 뜻이에요.)", en: "❌ أنا لَذيذ. (anā laḏīḏ)\n✅ هٰذا لَذيذ. (hāḏā laḏīḏ — For tasty food, use 'hāḏā' (this) — 'anā laḏīḏ' awkwardly means 'I am tasty'!)\n\n❌ أنا مَلْآن. (anā malʾān)\n✅ أنا شَبْعان. (anā shabʿān — 'Full (from food)' is 'shabʿān' — 'malʾān' means a container is full!)", es: "❌ أنا لَذيذ. (anā laḏīḏ)\n✅ هٰذا لَذيذ. (hāḏā laḏīḏ — Para comida rica usa 'hāḏā' (esto) — '¡anā laḏīḏ' significa 'yo soy rico'!)\n\n❌ أنا مَلْآن. (anā malʾān)\n✅ أنا شَبْعان. (anā shabʿān — 'Lleno (de comida)' es 'shabʿān' — '¡malʾān' es un recipiente lleno!)" },
          rudyTip: { ko: "탐정 루디의 팁: 'لَذيذ(laḏīḏ)'는 맛있을 때 쓰는 마법의 단어야! 강조하려면 'لَذيذ جِدًّا(laḏīḏ jiddan)'(아주 맛있어요)를 써. 'جِدًّا(jiddan)'(너무)는 맛이 과할 때도 쓰는 단서지 — مالِح جِدًّا(māliḥ jiddan)처럼~", en: "Detective Rudy's tip: 'laḏīḏ' is the magic word for tasty! To emphasize, say 'laḏīḏ jiddan' (very delicious). 'jiddan' (too/very) is also your clue for an overdone taste — like 'māliḥ jiddan' (too salty)!", es: "Consejo del detective Rudy: '¡laḏīḏ' es la palabra mágica para 'rico'! Para enfatizar, di 'laḏīḏ jiddan'. 'jiddan' (demasiado/muy) es tu pista para un sabor excesivo — como 'māliḥ jiddan' (muy salado)." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "هٰذا ___ جِدًّا!", answer: "لَذيذ", options: ["لَذيذ", "جائِع", "عَطْشان"], fullSentence: "هٰذا لَذيذ جِدًّا!", fullSentenceMeaning: { ko: "이거 맛있어요!", en: "This is delicious!", es: "¡Esto está delicioso!" } },
          { type: "select", promptWithBlank: "هٰذا ___ جِدًّا.", answer: "مالِح", options: ["مالِح", "مِلْح", "صَلْصة"], fullSentence: "هٰذا مالِح جِدًّا.", fullSentenceMeaning: { ko: "너무 짜요.", en: "It's too salty.", es: "Está muy salado." } },
          { type: "select", promptWithBlank: "أنا ___. شُكْرًا!", answer: "شَبْعان", options: ["شَبْعان", "جائِع", "لَذيذ"], fullSentence: "أنا شَبْعان. شُكْرًا!", fullSentenceMeaning: { ko: "배불러요. 감사합니다!", en: "I'm full. Thank you!", es: "Estoy lleno. ¡Gracias!" } },
          { type: "input", promptWithBlank: "هٰذا ___ جِدًّا.", answer: "حُلْو", fullSentence: "هٰذا حُلْو جِدًّا.", fullSentenceMeaning: { ko: "정말 맛있어요.", en: "It's very good.", es: "Está muy bueno." } },
          { type: "input", promptWithBlank: "هٰذا ___ جِدًّا.", answer: "سُكَّرِيّ", fullSentence: "هٰذا سُكَّرِيّ جِدًّا.", fullSentenceMeaning: { ko: "너무 달아요.", en: "It's too sweet.", es: "Está muy dulce." } },
          { type: "listening", audioText: "أنا شَبْعان. شُكْرًا!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["أنا شَبْعان. شُكْرًا!", "هٰذا سُكَّرِيّ جِدًّا.", "هٰذا لَذيذ جِدًّا!", "هٰذا مالِح جِدًّا."], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Where is the exit?", es: "¿Dónde está la salida?", ko: "출구가 어디에요?" }, fromDay: 2, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Excuse me.", es: "Disculpe.", ko: "실례합니다." }, fromDay: 1, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
  },

  // ─────────────── Day 17: Recommending Food ───────────────────────────────
  day_17: {
    english: {
      step1Sentences: [
        { text: "I recommend the steak.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "스테이크를 추천해요.", en: "I recommend the steak.", es: "Recomiendo el bistec." } },
        { text: "You should try the soup.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "수프를 한번 드셔보세요.", en: "You should try the soup.", es: "Deberías probar la sopa." } },
        { text: "What do you recommend?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "뭘 추천하세요?", en: "What do you recommend?", es: "¿Qué recomiendas?" } },
        { text: "The salad is very fresh.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "샐러드가 아주 신선해요.", en: "The salad is very fresh.", es: "La ensalada está muy fresca." }, recallRound: true },
        { text: "Let's eat together!", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "같이 먹어요!", en: "Let's eat together!", es: "¡Comamos juntos!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: I recommend ___. / You should try ___. / What do you recommend? 추천할 때 recommend, 제안할 때 should try. 묻기: What do you recommend?", en: "Pattern: I recommend ___. / You should try ___. / What do you recommend? Use 'recommend' to suggest, 'should try' to encourage. Ask: What do you recommend?", es: "Patrón: I recommend ___. / You should try ___. / What do you recommend? 'recommend' para sugerir, 'should try' para animar. Preguntar: What do you recommend?" },
          examples: { ko: "I recommend the grilled fish. It's amazing! (생선구이를 추천해요. 대박 맛있어요!)\nYou should try the chocolate cake. (초콜릿 케이크를 한번 드셔보세요.)\nWhat do you recommend for dessert? (디저트 뭘 추천하세요?)", en: "I recommend the grilled fish. It's amazing! (Suggesting a specific dish.)\nYou should try the chocolate cake. (Encouraging someone to try something.)\nWhat do you recommend for dessert? (Asking for a suggestion.)", es: "I recommend the grilled fish. It's amazing! (Sugiriendo un plato específico.)\nYou should try the chocolate cake. (Animando a alguien a probar algo.)\nWhat do you recommend for dessert? (Pidiendo una sugerencia.)" },
          mistakes: { ko: "❌ I recommend you the steak.\n✅ I recommend the steak. ('you'를 넣지 마세요! recommend 바로 뒤에 음식이 와요.)\n\n❌ You should to try the soup.\n✅ You should try the soup. (should 뒤에는 'to' 없이 동사원형이 와요!)", en: "❌ I recommend you the steak.\n✅ I recommend the steak. (Don't put 'you' between recommend and the food!)\n\n❌ You should to try the soup.\n✅ You should try the soup. (After 'should', use the base verb — no 'to' needed!)", es: "❌ I recommend you the steak.\n✅ I recommend the steak. (No pongas 'you' entre recommend y la comida.)\n\n❌ You should to try the soup.\n✅ You should try the soup. (Después de 'should', verbo base — ¡sin 'to'!)" },
          rudyTip: { ko: "탐정 루디의 팁: 잠입 수사 중 친해지고 싶을 때 음식 추천이 최고야! 'You should try this!'라고 하면 상대방이 좋아하고, 대화도 자연스럽게 이어져~", en: "Detective Rudy's tip: Want to build trust undercover? Recommend food! 'You should try this!' makes people smile and keeps the conversation going. Best intel-gathering trick!", es: "Consejo del detective Rudy: ¿Quieres ganar confianza encubierto? ¡Recomienda comida! 'You should try this!' hace sonreír y mantiene la conversación. ¡El mejor truco!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "I ___ the steak.", answer: "recommend", options: ["recommend", "like", "want"], fullSentence: "I recommend the steak.", fullSentenceMeaning: { ko: "스테이크를 추천해요.", en: "I recommend the steak.", es: "Recomiendo el bistec." } },
          { type: "select", promptWithBlank: "You should ___ the soup.", answer: "try", options: ["try", "eat", "have"], fullSentence: "You should try the soup.", fullSentenceMeaning: { ko: "수프를 한번 드셔보세요.", en: "You should try the soup.", es: "Deberías probar la sopa." } },
          { type: "select", promptWithBlank: "What do you ___?", answer: "recommend", options: ["recommend", "want", "like"], fullSentence: "What do you recommend?", fullSentenceMeaning: { ko: "뭘 추천하세요?", en: "What do you recommend?", es: "¿Qué recomiendas?" } },
          { type: "input", promptWithBlank: "The salad is very ___.", answer: "fresh", fullSentence: "The salad is very fresh.", fullSentenceMeaning: { ko: "샐러드가 아주 신선해요.", en: "The salad is very fresh.", es: "La ensalada está muy fresca." } },
          { type: "input", promptWithBlank: "Let's ___ together!", answer: "eat", fullSentence: "Let's eat together!", fullSentenceMeaning: { ko: "같이 먹어요!", en: "Let's eat together!", es: "¡Comamos juntos!" } },
          { type: "listening", audioText: "Let's eat together!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Let's eat together!", "The salad is very fresh.", "I recommend the steak.", "What do you recommend?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Do you speak English?", es: "¿Habla inglés?", ko: "영어 하세요?" }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdeme.", ko: "도와주세요! 제발 도와주세요." }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    spanish: {
      step1Sentences: [
        { text: "Recomiendo el bistec.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "스테이크를 추천해요.", en: "I recommend the steak.", es: "Recomiendo el bistec." } },
        { text: "Deberías probar la sopa.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "수프를 한번 드셔보세요.", en: "You should try the soup.", es: "Deberías probar la sopa." } },
        { text: "¿Qué recomiendas?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "뭘 추천하세요?", en: "What do you recommend?", es: "¿Qué recomiendas?" } },
        { text: "La ensalada está muy fresca.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "샐러드가 아주 신선해요.", en: "The salad is very fresh.", es: "La ensalada está muy fresca." }, recallRound: true },
        { text: "¡Comamos juntos!", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "같이 먹어요!", en: "Let's eat together!", es: "¡Comamos juntos!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Recomiendo ___. / Deberías probar ___. / ¿Qué recomiendas? 추천: Recomiendo, 제안: Deberías probar. 묻기: ¿Qué recomiendas?", en: "Pattern: Recomiendo ___. / Deberías probar ___. / ¿Qué recomiendas? Suggest: Recomiendo. Encourage: Deberías probar. Ask: ¿Qué recomiendas?", es: "Patrón: Recomiendo ___. / Deberías probar ___. / ¿Qué recomiendas? Sugerir: Recomiendo. Animar: Deberías probar. Preguntar: ¿Qué recomiendas?" },
          examples: { ko: "Recomiendo el pescado a la parrilla. ¡Es increíble! (생선구이를 추천해요. 대박!)\nDeberías probar el pastel de chocolate. (초콜릿 케이크를 드셔보세요.)\n¿Qué recomiendas de postre? (디저트 뭘 추천하세요?)", en: "Recomiendo el pescado a la parrilla. ¡Es increíble! (I recommend the grilled fish. Amazing!)\nDeberías probar el pastel de chocolate. (You should try the chocolate cake.)\n¿Qué recomiendas de postre? (What do you recommend for dessert?)", es: "Recomiendo el pescado a la parrilla. ¡Es increíble! (Sugiriendo un plato.)\nDeberías probar el pastel de chocolate. (Animando a probar algo.)\n¿Qué recomiendas de postre? (Pidiendo sugerencia.)" },
          mistakes: { ko: "❌ Yo recomendo el bistec.\n✅ Recomiendo el bistec. (recomendar는 불규칙! e→ie로 바뀌어요: recomiendo!)\n\n❌ Deberías a probar la sopa.\n✅ Deberías probar la sopa. ('a'를 넣지 마세요! deberías + 동사원형!)", en: "❌ Yo recomendo el bistec.\n✅ Recomiendo el bistec. ('Recomendar' is irregular — the 'e' changes to 'ie': recomiendo!)\n\n❌ Deberías a probar la sopa.\n✅ Deberías probar la sopa. (No 'a' needed — 'deberías' + infinitive directly!)", es: "❌ Yo recomendo el bistec.\n✅ Recomiendo el bistec. ('Recomendar' es irregular — la 'e' cambia a 'ie': recomiendo.)\n\n❌ Deberías a probar la sopa.\n✅ Deberías probar la sopa. (Sin 'a' — 'deberías' + infinitivo directamente.)" },
          rudyTip: { ko: "탐정 루디의 팁: 'Recomiendo'는 불규칙 동사라 외우는 게 빨라! recomendar → recomiendo. e가 ie로 바뀌는 패턴은 스페인어에서 자주 나오는 단서야~", en: "Detective Rudy's tip: 'Recomiendo' is irregular — memorize it! The e→ie change in recomendar is a pattern you'll see in many Spanish verbs. Spot the pattern, crack the code!", es: "Consejo del detective Rudy: 'Recomiendo' es irregular — ¡memorízalo! El cambio e→ie en recomendar es un patrón que verás en muchos verbos. ¡Encuentra el patrón, descifra el código!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ el bistec.", answer: "Recomiendo", options: ["Recomiendo", "Quiero", "Tengo"], fullSentence: "Recomiendo el bistec.", fullSentenceMeaning: { ko: "스테이크를 추천해요.", en: "I recommend the steak.", es: "Recomiendo el bistec." } },
          { type: "select", promptWithBlank: "Deberías ___ la sopa.", answer: "probar", options: ["probar", "comer", "tener"], fullSentence: "Deberías probar la sopa.", fullSentenceMeaning: { ko: "수프를 드셔보세요.", en: "You should try the soup.", es: "Deberías probar la sopa." } },
          { type: "select", promptWithBlank: "¿Qué ___?", answer: "recomiendas", options: ["recomiendas", "quieres", "tienes"], fullSentence: "¿Qué recomiendas?", fullSentenceMeaning: { ko: "뭘 추천하세요?", en: "What do you recommend?", es: "¿Qué recomiendas?" } },
          { type: "input", promptWithBlank: "La ensalada está muy ___.", answer: "fresca", fullSentence: "La ensalada está muy fresca.", fullSentenceMeaning: { ko: "샐러드가 아주 신선해요.", en: "The salad is very fresh.", es: "La ensalada está muy fresca." } },
          { type: "input", promptWithBlank: "¡___ juntos!", answer: "Comamos", fullSentence: "¡Comamos juntos!", fullSentenceMeaning: { ko: "같이 먹어요!", en: "Let's eat together!", es: "¡Comamos juntos!" } },
          { type: "listening", audioText: "¡Comamos juntos!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["¡Comamos juntos!", "La ensalada está muy fresca.", "Recomiendo el bistec.", "¿Qué recomiendas?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Do you speak English?", es: "¿Habla inglés?", ko: "영어 하세요?" }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdeme.", ko: "도와주세요! 제발 도와주세요." }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    korean: {
      step1Sentences: [
        { text: "스테이크를 추천해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "스테이크를 추천해요.", en: "I recommend the steak.", es: "Recomiendo el bistec." } },
        { text: "수프를 한번 드셔보세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "수프를 한번 드셔보세요.", en: "You should try the soup.", es: "Deberías probar la sopa." } },
        { text: "뭘 추천하세요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "뭘 추천하세요?", en: "What do you recommend?", es: "¿Qué recomiendas?" } },
        { text: "샐러드가 아주 신선해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "샐러드가 아주 신선해요.", en: "The salad is very fresh.", es: "La ensalada está muy fresca." }, recallRound: true },
        { text: "같이 먹어요!", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "같이 먹어요!", en: "Let's eat together!", es: "¡Comamos juntos!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: ___를/을 추천해요. / ___를/을 드셔보세요. / 뭘 추천하세요? 추천: 추천해요, 제안: 드셔보세요 (존댓말). 묻기: 뭘 추천하세요?", en: "Pattern: ___를/을 추천해요. / ___를/을 드셔보세요. / 뭘 추천하세요? Recommend: 추천해요. Suggest politely: 드셔보세요. Ask: 뭘 추천하세요?", es: "Patrón: ___를/을 추천해요. / ___를/을 드셔보세요. / 뭘 추천하세요? Recomendar: 추천해요. Sugerir: 드셔보세요. Preguntar: 뭘 추천하세요?" },
          examples: { ko: "생선구이를 추천해요. 정말 맛있어요! (추천할 때)\n초콜릿 케이크를 한번 드셔보세요. (정중하게 제안할 때)\n디저트 뭘 추천하세요? (추천을 물을 때)", en: "생선구이를 추천해요. 정말 맛있어요! (I recommend the grilled fish. Really delicious!)\n초콜릿 케이크를 한번 드셔보세요. (You should try the chocolate cake.)\n디저트 뭘 추천하세요? (What do you recommend for dessert?)", es: "생선구이를 추천해요. 정말 맛있어요! (Recomiendo el pescado. ¡Muy rico!)\n초콜릿 케이크를 한번 드셔보세요. (Deberías probar el pastel de chocolate.)\n디저트 뭘 추천하세요? (¿Qué recomiendas de postre?)" },
          mistakes: { ko: "❌ 스테이크를 추천합니다.\n✅ 스테이크를 추천해요. (일상 대화에서는 '합니다'보다 '해요'가 자연스러워요!)\n\n❌ 수프를 먹어보세요.\n✅ 수프를 드셔보세요. ('먹다'의 존댓말은 '드시다'! 드셔보세요가 예의 바른 표현이에요.)", en: "❌ 스테이크를 추천합니다.\n✅ 스테이크를 추천해요. (Use 해요 in casual settings — 합니다 is too formal for friends!)\n\n❌ 수프를 먹어보세요.\n✅ 수프를 드셔보세요. (Use 드시다 not 먹다 when recommending politely — 드셔보세요 is the honorific form!)", es: "❌ 스테이크를 추천합니다.\n✅ 스테이크를 추천해요. (Usa 해요 en situaciones casuales — 합니다 es muy formal.)\n\n❌ 수프를 먹어보세요.\n✅ 수프를 드셔보세요. (Usa 드시다 no 먹다 al recomendar — ¡드셔보세요 es la forma honorífica!)" },
          rudyTip: { ko: "탐정 루디의 팁: '드셔보세요'는 '먹어보세요'의 높임말이야! 식당이나 윗사람에게 추천할 때는 꼭 '드셔보세요'를 쓰자. 예의 바른 탐정이 정보도 더 잘 얻지~", en: "Detective Rudy's tip: '드셔보세요' is the polite way to say 'try eating this.' In Korean, showing respect gets you further — and better food recommendations too!", es: "Consejo del detective Rudy: '드셔보세요' es la forma cortés de 'prueba esto'. En coreano, ¡mostrar respeto te lleva más lejos — y consigues mejores recomendaciones!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "스테이크를 ___해요.", answer: "추천", options: ["추천", "주문", "좋아"], fullSentence: "스테이크를 추천해요.", fullSentenceMeaning: { ko: "스테이크를 추천해요.", en: "I recommend the steak.", es: "Recomiendo el bistec." } },
          { type: "select", promptWithBlank: "수프를 한번 ___보세요.", answer: "드셔", options: ["드셔", "먹어", "해"], fullSentence: "수프를 한번 드셔보세요.", fullSentenceMeaning: { ko: "수프를 한번 드셔보세요.", en: "Try the soup.", es: "Prueba la sopa." } },
          { type: "select", promptWithBlank: "뭘 ___하세요?", answer: "추천", options: ["추천", "주문", "좋아"], fullSentence: "뭘 추천하세요?", fullSentenceMeaning: { ko: "뭘 추천하세요?", en: "What do you recommend?", es: "¿Qué recomiendas?" } },
          { type: "input", promptWithBlank: "샐러드가 아주 ___해요.", answer: "신선", fullSentence: "샐러드가 아주 신선해요.", fullSentenceMeaning: { ko: "샐러드가 아주 신선해요.", en: "The salad is very fresh.", es: "La ensalada está fresca." } },
          { type: "input", promptWithBlank: "같이 ___요!", answer: "먹어", fullSentence: "같이 먹어요!", fullSentenceMeaning: { ko: "같이 먹어요!", en: "Let's eat together!", es: "¡Comamos juntos!" } },
          { type: "listening", audioText: "같이 먹어요!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["같이 먹어요!", "샐러드가 아주 신선해요.", "스테이크를 추천해요.", "뭘 추천하세요?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Do you speak English?", es: "¿Habla inglés?", ko: "영어 하세요?" }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdeme.", ko: "도와주세요! 제발 도와주세요." }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    indonesian: {
      step1Sentences: [
        { text: "Saya merekomendasikan steak.", speechLang: "id-ID", meaning: { ko: "스테이크를 추천해요.", en: "I recommend the steak.", es: "Recomiendo el bistec." } },
        { text: "Kamu harus coba supnya.", speechLang: "id-ID", meaning: { ko: "수프를 한번 드셔보세요.", en: "You should try the soup.", es: "Deberías probar la sopa." } },
        { text: "Apa yang kamu rekomendasikan?", speechLang: "id-ID", meaning: { ko: "뭘 추천하세요?", en: "What do you recommend?", es: "¿Qué recomiendas?" } },
        { text: "Saladnya sangat segar.", speechLang: "id-ID", meaning: { ko: "샐러드가 아주 신선해요.", en: "The salad is very fresh.", es: "La ensalada está muy fresca." }, recallRound: true },
        { text: "Ayo makan bersama!", speechLang: "id-ID", meaning: { ko: "같이 먹어요!", en: "Let's eat together!", es: "¡Comamos juntos!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: Saya merekomendasikan ___ (추천해요) / Kamu harus coba ___ (한번 드셔보세요) / Apa yang kamu rekomendasikan? (뭘 추천하세요?). 추천: merekomendasikan, 제안: kamu harus coba(꼭 해봐).", en: "Pattern: Saya merekomendasikan ___ (I recommend) / Kamu harus coba ___ (You should try) / Apa yang kamu rekomendasikan? (What do you recommend?). Recommend: merekomendasikan. Encourage: kamu harus coba.", es: "Patrón: Saya merekomendasikan ___ (recomiendo) / Kamu harus coba ___ (deberías probar) / Apa yang kamu rekomendasikan? (¿Qué recomiendas?). Recomendar: merekomendasikan. Animar: kamu harus coba." },
          examples: { ko: "Saya merekomendasikan ikan bakar. Enak sekali! (생선구이를 추천해요. 대박 맛있어요!)\nKamu harus coba kue cokelatnya. (초콜릿 케이크를 한번 드셔보세요.)\nApa yang kamu rekomendasikan untuk pencuci mulut? (디저트 뭘 추천하세요?)", en: "Saya merekomendasikan ikan bakar. Enak sekali! (I recommend the grilled fish. So delicious!)\nKamu harus coba kue cokelatnya. (You should try the chocolate cake.)\nApa yang kamu rekomendasikan untuk pencuci mulut? (What do you recommend for dessert?)", es: "Saya merekomendasikan ikan bakar. Enak sekali! (Recomiendo el pescado a la parrilla. ¡Muy rico!)\nKamu harus coba kue cokelatnya. (Deberías probar el pastel de chocolate.)\nApa yang kamu rekomendasikan untuk pencuci mulut? (¿Qué recomiendas de postre?)" },
          mistakes: { ko: "❌ Kamu harus untuk coba supnya.\n✅ Kamu harus coba supnya. ('harus'(해야 한다) 뒤에 'untuk' 없이 바로 동사가 와요!)\n\n❌ Saya rekomendasi steak.\n✅ Saya merekomendasikan steak. (동사는 'merekomendasikan'! 'rekomendasi'는 명사예요.)", en: "❌ Kamu harus untuk coba supnya.\n✅ Kamu harus coba supnya. (After 'harus' (must), the verb comes directly — no 'untuk'!)\n\n❌ Saya rekomendasi steak.\n✅ Saya merekomendasikan steak. (The verb is 'merekomendasikan' — 'rekomendasi' is the noun!)", es: "❌ Kamu harus untuk coba supnya.\n✅ Kamu harus coba supnya. (Tras 'harus' (deber), el verbo va directo — ¡sin 'untuk'!)\n\n❌ Saya rekomendasi steak.\n✅ Saya merekomendasikan steak. (El verbo es 'merekomendasikan' — '¡rekomendasi' es el sustantivo!)" },
          rudyTip: { ko: "탐정 루디의 팁: 잠입 수사 중 친해지고 싶을 때 음식 추천이 최고야! 'Kamu harus coba ___!'(꼭 드셔보세요!)라고 하면 상대방이 좋아하고 대화가 자연스럽게 이어져~", en: "Detective Rudy's tip: Want to build trust undercover? Recommend food! 'Kamu harus coba ___!' (You should try this!) makes people light up and keeps the conversation flowing.", es: "Consejo del detective Rudy: ¿Quieres ganar confianza encubierto? ¡Recomienda comida! 'Kamu harus coba ___!' hace sonreír y mantiene la conversación." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Saya ___ steak.", answer: "merekomendasikan", options: ["merekomendasikan", "suka", "mau"], fullSentence: "Saya merekomendasikan steak.", fullSentenceMeaning: { ko: "스테이크를 추천해요.", en: "I recommend the steak.", es: "Recomiendo el bistec." } },
          { type: "select", promptWithBlank: "Kamu harus ___ supnya.", answer: "coba", options: ["coba", "makan", "ada"], fullSentence: "Kamu harus coba supnya.", fullSentenceMeaning: { ko: "수프를 한번 드셔보세요.", en: "You should try the soup.", es: "Deberías probar la sopa." } },
          { type: "select", promptWithBlank: "Apa yang kamu ___?", answer: "rekomendasikan", options: ["rekomendasikan", "mau", "suka"], fullSentence: "Apa yang kamu rekomendasikan?", fullSentenceMeaning: { ko: "뭘 추천하세요?", en: "What do you recommend?", es: "¿Qué recomiendas?" } },
          { type: "input", promptWithBlank: "Saladnya sangat ___.", answer: "segar", fullSentence: "Saladnya sangat segar.", fullSentenceMeaning: { ko: "샐러드가 아주 신선해요.", en: "The salad is very fresh.", es: "La ensalada está muy fresca." } },
          { type: "input", promptWithBlank: "Ayo makan ___!", answer: "bersama", fullSentence: "Ayo makan bersama!", fullSentenceMeaning: { ko: "같이 먹어요!", en: "Let's eat together!", es: "¡Comamos juntos!" } },
          { type: "listening", audioText: "Ayo makan bersama!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Ayo makan bersama!", "Saladnya sangat segar.", "Saya merekomendasikan steak.", "Apa yang kamu rekomendasikan?"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Do you speak English?", es: "¿Habla inglés?", ko: "영어 하세요?" }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdeme.", ko: "도와주세요! 제발 도와주세요." }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
    arabic: {
      step1Sentences: [
        { text: "أنا أُرَشِّح السِّتيك. (anā urashshiḥ as-sitēk)", speechLang: "ar-EG", meaning: { ko: "스테이크를 추천해요.", en: "I recommend the steak.", es: "Recomiendo el bistec." } },
        { text: "يَجِبُ أَنْ تُجَرِّب الحَساء. (yajibu an tujarrib al-ḥasāʾ)", speechLang: "ar-EG", meaning: { ko: "수프를 한번 드셔보세요.", en: "You should try the soup.", es: "Deberías probar la sopa." } },
        { text: "ماذا تُرَشِّح؟ (māḏā turashshiḥ?)", speechLang: "ar-EG", meaning: { ko: "뭘 추천하세요?", en: "What do you recommend?", es: "¿Qué recomiendas?" } },
        { text: "السَّلَطة طازَجة جِدًّا. (as-salaṭa ṭāzaja jiddan)", speechLang: "ar-EG", meaning: { ko: "샐러드가 아주 신선해요.", en: "The salad is very fresh.", es: "La ensalada está muy fresca." }, recallRound: true },
        { text: "هَيّا نَأْكُل مَعًا! (hayyā naʾkul maʿan!)", speechLang: "ar-EG", meaning: { ko: "같이 먹어요!", en: "Let's eat together!", es: "¡Comamos juntos!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "패턴: أنا أُرَشِّح ___ (추천해요) / يَجِبُ أَنْ تُجَرِّب ___ (한번 드셔보세요) / ماذا تُرَشِّح؟ (뭘 추천하세요?). 추천: أُرَشِّح(urashshiḥ), 제안: يَجِبُ أَنْ تُجَرِّب(yajibu an tujarrib, 꼭 해봐). 'أَنْ' 뒤에는 동사가 접속법으로 와요.", en: "Pattern: أنا أُرَشِّح ___ (I recommend) / يَجِبُ أَنْ تُجَرِّب ___ (You should try) / ماذا تُرَشِّح؟ (What do you recommend?). Recommend: urashshiḥ. Encourage: yajibu an tujarrib (you must try) — the verb after أَنْ is subjunctive.", es: "Patrón: أنا أُرَشِّح ___ (recomiendo) / يَجِبُ أَنْ تُجَرِّب ___ (deberías probar) / ماذا تُرَشِّح؟ (¿Qué recomiendas?). Recomendar: urashshiḥ. Animar: yajibu an tujarrib — el verbo tras أَنْ va en subjuntivo." },
          examples: { ko: "أنا أُرَشِّح السَّمَك المَشْوِيّ. لَذيذ جِدًّا! (anā urashshiḥ as-samak al-mashwiyy. laḏīḏ jiddan! — 생선구이를 추천해요. 대박 맛있어요!)\nيَجِبُ أَنْ تُجَرِّب كَعْكة الشوكولاتة. (yajibu an tujarrib kaʿkat ash-shokolāta — 초콜릿 케이크를 한번 드셔보세요.)\nماذا تُرَشِّح مِنَ الحَلْوى؟ (māḏā turashshiḥ mina l-ḥalwā? — 디저트 뭘 추천하세요?)", en: "أنا أُرَشِّح السَّمَك المَشْوِيّ. لَذيذ جِدًّا! (anā urashshiḥ as-samak al-mashwiyy. laḏīḏ jiddan! — I recommend the grilled fish. So delicious!)\nيَجِبُ أَنْ تُجَرِّب كَعْكة الشوكولاتة. (yajibu an tujarrib kaʿkat ash-shokolāta — You should try the chocolate cake.)\nماذا تُرَشِّح مِنَ الحَلْوى؟ (māḏā turashshiḥ mina l-ḥalwā? — What do you recommend for dessert?)", es: "أنا أُرَشِّح السَّمَك المَشْوِيّ. لَذيذ جِدًّا! (anā urashshiḥ as-samak al-mashwiyy. laḏīḏ jiddan! — Recomiendo el pescado a la parrilla. ¡Muy rico!)\nيَجِبُ أَنْ تُجَرِّب كَعْكة الشوكولاتة. (yajibu an tujarrib kaʿkat ash-shokolāta — Deberías probar el pastel de chocolate.)\nماذا تُرَشِّح مِنَ الحَلْوى؟ (māḏā turashshiḥ mina l-ḥalwā? — ¿Qué recomiendas de postre?)" },
          mistakes: { ko: "❌ يَجِبُ أَنْ أَنْتَ تُجَرِّب الحَساء. (yajibu an anta tujarrib...)\n✅ يَجِبُ أَنْ تُجَرِّب الحَساء. (yajibu an tujarrib... — 'أَنْ' 뒤에 주어 없이 바로 동사가 접속법으로 와요!)\n\n❌ أنا تَوْصِية بِالسِّتيك. (anā tawṣiya...)\n✅ أنا أُرَشِّح السِّتيك. (anā urashshiḥ... — 동사는 'أُرَشِّح(urashshiḥ)'! 'تَوْصِية(tawṣiya)'는 명사예요.)\n💬 이집트 구어로는 'لازم تجرّب(lāzem tegarrab)'라고 하지만 표준어는 'يَجِبُ أَنْ تُجَرِّب' ✓", en: "❌ يَجِبُ أَنْ أَنْتَ تُجَرِّب الحَساء. (yajibu an anta tujarrib...)\n✅ يَجِبُ أَنْ تُجَرِّب الحَساء. (yajibu an tujarrib... — After 'an', the verb comes directly in the subjunctive — no separate pronoun!)\n\n❌ أنا تَوْصِية بِالسِّتيك. (anā tawṣiya...)\n✅ أنا أُرَشِّح السِّتيك. (anā urashshiḥ... — The verb is 'urashshiḥ' — 'tawṣiya' is the noun (a recommendation)!)\n💬 In Egyptian dialect you'd say 'lāzem tegarrab', but MSA uses 'yajibu an tujarrib' ✓", es: "❌ يَجِبُ أَنْ أَنْتَ تُجَرِّب الحَساء. (yajibu an anta tujarrib...)\n✅ يَجِبُ أَنْ تُجَرِّب الحَساء. (yajibu an tujarrib... — Tras 'an', el verbo va directo en subjuntivo — ¡sin pronombre aparte!)\n\n❌ أنا تَوْصِية بِالسِّتيك. (anā tawṣiya...)\n✅ أنا أُرَشِّح السِّتيك. (anā urashshiḥ... — El verbo es 'urashshiḥ' — 'tawṣiya' es el sustantivo.)\n💬 En dialecto egipcio dirías 'lāzem tegarrab', pero el MSA usa 'yajibu an tujarrib' ✓" },
          rudyTip: { ko: "탐정 루디의 팁: 잠입 수사 중 친해지고 싶을 때 음식 추천이 최고야! 'يَجِبُ أَنْ تُجَرِّب ___!(yajibu an tujarrib ___!)'(꼭 드셔보세요!)라고 하면 상대방이 좋아하고 대화가 자연스럽게 이어져~", en: "Detective Rudy's tip: Want to build trust undercover? Recommend food! 'yajibu an tujarrib ___!' (You should try this!) makes people light up and keeps the conversation flowing.", es: "Consejo del detective Rudy: ¿Quieres ganar confianza encubierto? ¡Recomienda comida! 'yajibu an tujarrib ___!' hace sonreír y mantiene la conversación." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "أنا ___ السِّتيك.", answer: "أُرَشِّح", options: ["أُرَشِّح", "أُحِبّ", "أُريد"], fullSentence: "أنا أُرَشِّح السِّتيك.", fullSentenceMeaning: { ko: "스테이크를 추천해요.", en: "I recommend the steak.", es: "Recomiendo el bistec." } },
          { type: "select", promptWithBlank: "يَجِبُ أَنْ ___ الحَساء.", answer: "تُجَرِّب", options: ["تُجَرِّب", "تَأْكُل", "عِنْدَك"], fullSentence: "يَجِبُ أَنْ تُجَرِّب الحَساء.", fullSentenceMeaning: { ko: "수프를 한번 드셔보세요.", en: "You should try the soup.", es: "Deberías probar la sopa." } },
          { type: "select", promptWithBlank: "ماذا ___؟", answer: "تُرَشِّح", options: ["تُرَشِّح", "تُريد", "تُحِبّ"], fullSentence: "ماذا تُرَشِّح؟", fullSentenceMeaning: { ko: "뭘 추천하세요?", en: "What do you recommend?", es: "¿Qué recomiendas?" } },
          { type: "input", promptWithBlank: "السَّلَطة ___ جِدًّا.", answer: "طازَجة", fullSentence: "السَّلَطة طازَجة جِدًّا.", fullSentenceMeaning: { ko: "샐러드가 아주 신선해요.", en: "The salad is very fresh.", es: "La ensalada está muy fresca." } },
          { type: "input", promptWithBlank: "هَيّا نَأْكُل ___!", answer: "مَعًا", fullSentence: "هَيّا نَأْكُل مَعًا!", fullSentenceMeaning: { ko: "같이 먹어요!", en: "Let's eat together!", es: "¡Comamos juntos!" } },
          { type: "listening", audioText: "هَيّا نَأْكُل مَعًا!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["هَيّا نَأْكُل مَعًا!", "السَّلَطة طازَجة جِدًّا.", "أنا أُرَشِّح السِّتيك.", "ماذا تُرَشِّح؟"], correct: 0, audioOnly: true },
        ],
      },
      crossUnitReview: [
        { sentence: { en: "Do you speak English?", es: "¿Habla inglés?", ko: "영어 하세요?" }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
        { sentence: { en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdeme.", ko: "도와주세요! 제발 도와주세요." }, fromDay: 3, context: { ko: "생존 표현 복습", en: "Survival phrase review", es: "Repaso de supervivencia" } },
      ],
    },
  },

  // ─────────────── Day 18: Unit 3 Review ───────────────────────────────────
  day_18: {
    english: {
      step1Sentences: [
        { text: "I like pizza. What food do you like?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "저는 피자를 좋아해요. 어떤 음식을 좋아하세요?", en: "I like pizza. What food do you like?", es: "Me gusta la pizza. ¿Qué comida te gusta?" } },
        { text: "I'd like a coffee and the chicken, please.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "커피 한 잔이랑 치킨 주세요.", en: "I'd like a coffee and the chicken, please.", es: "Quiero un café y el pollo, por favor." } },
        { text: "How much is the bill? Can I pay by card?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "계산이 얼마예요? 카드로 결제할 수 있어요?", en: "How much is the bill? Can I pay by card?", es: "¿Cuánto es la cuenta? ¿Puedo pagar con tarjeta?" } },
        { text: "This is delicious! I recommend it.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "이거 맛있어요! 추천해요.", en: "This is delicious! I recommend it.", es: "¡Está delicioso! Lo recomiendo." }, recallRound: true },
        { text: "I'm full. Thank you, goodbye!", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "배불러요. 감사합니다, 안녕히 계세요!", en: "I'm full. Thank you, goodbye!", es: "Estoy lleno. ¡Gracias, adiós!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "Unit 3 총정리! 좋아하는 음식: I like/love ___. 주문: I'd like ___. 가격: How much? 맛: This is delicious! / It's too salty. 추천: I recommend ___.", en: "Unit 3 Review! Likes: I like/love ___. Order: I'd like ___. Price: How much? Taste: Delicious! / Too salty. Recommend: I recommend ___.", es: "Repaso Unidad 3! Gustar: I like/love ___. Pedir: I'd like ___. Precio: How much? Sabor: Delicious! / Too salty. Recomendar: I recommend ___." },
          examples: { ko: "I'd like a pizza, please. How much is it? (피자 주세요. 얼마예요?)\nThis is delicious! I recommend it. (맛있어요! 추천해요.)\nI'm full. Can I pay by card? Thank you! (배불러요. 카드로 돼요? 감사합니다!)", en: "I'd like a pizza, please. How much is it? (Ordering and asking price — Day 14 + 15.)\nThis is delicious! I recommend it. (Taste + recommendation — Day 16 + 17.)\nI'm full. Can I pay by card? Thank you! (Finishing a meal — Day 16 + 15.)", es: "I'd like a pizza, please. How much is it? (Pidiendo y preguntando precio.)\nThis is delicious! I recommend it. (Sabor + recomendación.)\nI'm full. Can I pay by card? Thank you! (Terminando la comida.)" },
          mistakes: { ko: "❌ I want a coffee. How many is it?\n✅ I'd like a coffee, please. How much is it? (정중한 주문 + 가격은 much!)\n\n❌ I recommend you try the very delicious steak.\n✅ I recommend the steak. It's delicious! (간단하게! 짧은 문장으로 나누세요.)", en: "❌ I want a coffee. How many is it?\n✅ I'd like a coffee, please. How much is it? (Polite ordering + prices use 'much'!)\n\n❌ I recommend you try the very delicious steak.\n✅ I recommend the steak. It's delicious! (Keep it simple — use two short sentences!)", es: "❌ I want a coffee. How many is it?\n✅ I'd like a coffee, please. How much is it? (Pedido cortés + precios usan 'much'.)\n\n❌ I recommend you try the very delicious steak.\n✅ I recommend the steak. It's delicious! (¡Sé simple — usa dos frases cortas!)" },
          rudyTip: { ko: "탐정 루디의 팁: Unit 3 완료! 이제 식당에서 주문부터 결제까지 혼자 할 수 있어. 잠입 수사 성공이야! 다음 유닛에서 또 만나~", en: "Detective Rudy's tip: Unit 3 complete! You can now order, taste, recommend, and pay — all in English. Undercover mission success! Ready for the next case?", es: "Consejo del detective Rudy: ¡Unidad 3 completa! Ahora puedes pedir, probar, recomendar y pagar — todo en inglés. ¡Misión encubierta exitosa! ¿Listo para el próximo caso?" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "I'd ___ a coffee, please.", answer: "like", options: ["like", "want", "have"], fullSentence: "I'd like a coffee, please.", fullSentenceMeaning: { ko: "커피 한 잔 주세요.", en: "I'd like a coffee.", es: "Quiero un café." } },
          { type: "select", promptWithBlank: "This is ___!", answer: "delicious", options: ["delicious", "hungry", "expensive"], fullSentence: "This is delicious!", fullSentenceMeaning: { ko: "맛있어요!", en: "This is delicious!", es: "¡Delicioso!" } },
          { type: "select", promptWithBlank: "I ___ the steak.", answer: "recommend", options: ["recommend", "order", "eat"], fullSentence: "I recommend the steak.", fullSentenceMeaning: { ko: "스테이크를 추천해요.", en: "I recommend the steak.", es: "Recomiendo el bistec." } },
          { type: "input", promptWithBlank: "How ___ is this?", answer: "much", fullSentence: "How much is this?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta?" } },
          { type: "input", promptWithBlank: "I'm ___. Thank you!", answer: "full", fullSentence: "I'm full. Thank you!", fullSentenceMeaning: { ko: "배불러요. 감사합니다!", en: "I'm full. Thanks!", es: "Estoy lleno. ¡Gracias!" } },
          { type: "listening", audioText: "I'm full. Thank you, goodbye!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["I'm full. Thank you, goodbye!", "This is delicious! I recommend it.", "How much is the bill?", "I'd like a coffee, please."], correct: 0, audioOnly: true },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Me gusta la pizza. ¿Qué comida te gusta?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "피자를 좋아해요. 어떤 음식을 좋아하세요?", en: "I like pizza. What food do you like?", es: "Me gusta la pizza. ¿Qué comida te gusta?" } },
        { text: "Quiero un café y el pollo, por favor.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "커피 한 잔이랑 치킨 주세요.", en: "I'd like a coffee and the chicken.", es: "Quiero un café y el pollo, por favor." } },
        { text: "¿Cuánto es la cuenta? ¿Puedo pagar con tarjeta?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "계산이 얼마예요? 카드로 되나요?", en: "How much is the bill? Card?", es: "¿Cuánto es la cuenta? ¿Puedo pagar con tarjeta?" } },
        { text: "¡Está delicioso! Lo recomiendo.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "맛있어요! 추천해요.", en: "It's delicious! I recommend it.", es: "¡Está delicioso! Lo recomiendo." }, recallRound: true },
        { text: "Estoy lleno. ¡Gracias, adiós!", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "배불러요. 감사합니다, 안녕!", en: "I'm full. Thanks, bye!", es: "Estoy lleno. ¡Gracias, adiós!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "Unit 3 총정리! 좋아하는 음식: Me gusta/encanta ___. 주문: Quiero ___. 가격: ¿Cuánto cuesta? 맛: ¡Está delicioso! / Muy salado. 추천: Recomiendo ___.", en: "Unit 3 Review! Likes: Me gusta/encanta ___. Order: Quiero ___. Price: ¿Cuánto cuesta? Taste: ¡Está delicioso! Recommend: Recomiendo ___.", es: "Repaso Unidad 3! Gustar: Me gusta/encanta ___. Pedir: Quiero ___. Precio: ¿Cuánto cuesta? Sabor: ¡Delicioso! Recomendar: Recomiendo ___." },
          examples: { ko: "Quiero una pizza, por favor. ¿Cuánto cuesta? (피자 주세요. 얼마예요?)\n¡Está delicioso! Lo recomiendo. (맛있어요! 추천해요.)\nEstoy lleno. ¿Puedo pagar con tarjeta? ¡Gracias! (배불러요. 카드로 돼요? 감사!)", en: "Quiero una pizza, por favor. ¿Cuánto cuesta? (Ordering and asking price.)\n¡Está delicioso! Lo recomiendo. (Taste + recommendation.)\nEstoy lleno. ¿Puedo pagar con tarjeta? ¡Gracias! (Finishing a meal.)", es: "Quiero una pizza, por favor. ¿Cuánto cuesta? (Pidiendo y preguntando precio.)\n¡Está delicioso! Lo recomiendo. (Sabor + recomendación.)\nEstoy lleno. ¿Puedo pagar con tarjeta? ¡Gracias! (Terminando la comida.)" },
          mistakes: { ko: "❌ Me gusta las pizzas. ¿Cuánto es cuesta?\n✅ Me gustan las pizzas. ¿Cuánto cuesta? (복수→gustan, cuesta 앞에 es 빼세요!)\n\n❌ Es delicioso. Soy lleno.\n✅ Está delicioso. Estoy lleno. (맛은 está, 상태는 estoy! ser vs estar 주의!)", en: "❌ Me gusta las pizzas. ¿Cuánto es cuesta?\n✅ Me gustan las pizzas. ¿Cuánto cuesta? (Plural → gustan. No 'es' before 'cuesta'!)\n\n❌ Es delicioso. Soy lleno.\n✅ Está delicioso. Estoy lleno. (Taste = está, state = estoy — ser vs estar matters!)", es: "❌ Me gusta las pizzas. ¿Cuánto es cuesta?\n✅ Me gustan las pizzas. ¿Cuánto cuesta? (Plural → gustan. Sin 'es' antes de 'cuesta'.)\n\n❌ Es delicioso. Soy lleno.\n✅ Está delicioso. Estoy lleno. (Sabor = está, estado = estoy — ¡ser vs estar importa!)" },
          rudyTip: { ko: "탐정 루디의 팁: Unit 3 완료! 이제 스페인어로 식당에서 주문부터 결제까지 혼자 할 수 있어. 잠입 수사 대성공! 다음 유닛에서 또 만나~", en: "Detective Rudy's tip: Unit 3 done! You can now order, taste, recommend, and pay — all in Spanish. ser vs estar was the toughest clue, but you cracked it! Next case awaits!", es: "Consejo del detective Rudy: ¡Unidad 3 completada! Ahora puedes pedir, probar, recomendar y pagar en español. ser vs estar fue la pista más difícil, ¡pero lo lograste!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ un café, por favor.", answer: "Quiero", options: ["Quiero", "Tengo", "Soy"], fullSentence: "Quiero un café, por favor.", fullSentenceMeaning: { ko: "커피 한 잔 주세요.", en: "I'd like a coffee.", es: "Quiero un café." } },
          { type: "select", promptWithBlank: "¡Está ___!", answer: "delicioso", options: ["delicioso", "hambriento", "caro"], fullSentence: "¡Está delicioso!", fullSentenceMeaning: { ko: "맛있어요!", en: "Delicious!", es: "¡Delicioso!" } },
          { type: "select", promptWithBlank: "___ el bistec.", answer: "Recomiendo", options: ["Recomiendo", "Quiero", "Tengo"], fullSentence: "Recomiendo el bistec.", fullSentenceMeaning: { ko: "스테이크를 추천해요.", en: "I recommend the steak.", es: "Recomiendo el bistec." } },
          { type: "input", promptWithBlank: "¿Cuánto ___ esto?", answer: "cuesta", fullSentence: "¿Cuánto cuesta esto?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much?", es: "¿Cuánto cuesta?" } },
          { type: "input", promptWithBlank: "Estoy ___. ¡Gracias!", answer: "lleno", fullSentence: "Estoy lleno. ¡Gracias!", fullSentenceMeaning: { ko: "배불러요. 감사!", en: "I'm full. Thanks!", es: "Estoy lleno. ¡Gracias!" } },
          { type: "listening", audioText: "Estoy lleno. ¡Gracias, adiós!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Estoy lleno. ¡Gracias, adiós!", "¡Está delicioso! Lo recomiendo.", "¿Cuánto es la cuenta?", "Quiero un café, por favor."], correct: 0, audioOnly: true },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "저는 피자를 좋아해요. 어떤 음식을 좋아하세요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "피자를 좋아해요. 어떤 음식?", en: "I like pizza. What food do you like?", es: "Me gusta la pizza. ¿Qué comida te gusta?" } },
        { text: "커피 한 잔이랑 치킨 주세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "커피 한 잔이랑 치킨 주세요.", en: "A coffee and chicken, please.", es: "Un café y pollo, por favor." } },
        { text: "계산이 얼마예요? 카드로 결제할 수 있어요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "계산이 얼마? 카드 되나요?", en: "How much is the bill? Card?", es: "¿La cuenta? ¿Tarjeta?" } },
        { text: "이거 맛있어요! 추천해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "맛있어요! 추천해요.", en: "Delicious! I recommend it.", es: "¡Delicioso! Lo recomiendo." }, recallRound: true },
        { text: "배불러요. 감사합니다, 안녕히 계세요!", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "배불러요. 감사합니다, 안녕!", en: "I'm full. Thanks, goodbye!", es: "Lleno. ¡Gracias, adiós!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "Unit 3 총정리! 좋아하는 음식: ___를 좋아해요. 주문: ___주세요. 가격: 얼마예요? 맛: 맛있어요! / 너무 짜요. 추천: ___를 추천해요.", en: "Unit 3 Review! Likes: ___를 좋아해요. Order: ___주세요. Price: 얼마예요? Taste: 맛있어요! / 너무 짜요. Recommend: ___를 추천해요.", es: "Repaso Unidad 3! Gustar: ___를 좋아해요. Pedir: ___주세요. Precio: 얼마예요? Sabor: 맛있어요! Recomendar: ___를 추천해요." },
          examples: { ko: "피자 한 판 주세요. 얼마예요? (주문하고 가격 묻기)\n이거 맛있어요! 추천해요. (맛 표현하고 추천하기)\n배불러요. 카드로 결제할 수 있어요? 감사합니다! (식사 마무리)", en: "피자 한 판 주세요. 얼마예요? (Ordering and asking price — Day 14 + 15.)\n이거 맛있어요! 추천해요. (Taste + recommendation — Day 16 + 17.)\n배불러요. 카드로 결제할 수 있어요? 감사합니다! (Finishing a meal.)", es: "피자 한 판 주세요. 얼마예요? (Pidiendo y preguntando precio.)\n이거 맛있어요! 추천해요. (Sabor + recomendación.)\n배불러요. 카드로 결제할 수 있어요? 감사합니다! (Terminando la comida.)" },
          mistakes: { ko: "❌ 피자를 주세요. 얼마입니까?\n✅ 피자 주세요. 얼마예요? (일상 대화에서는 '예요/이에요'가 자연스러워요!)\n\n❌ 맛있다! 추천한다!\n✅ 맛있어요! 추천해요! (식당에서는 존댓말 '해요체'를 쓰세요!)", en: "❌ 피자를 주세요. 얼마입니까?\n✅ 피자 주세요. 얼마예요? (Use 예요 in daily conversation — 입니까 is too stiff!)\n\n❌ 맛있다! 추천한다!\n✅ 맛있어요! 추천해요! (Use 해요 polite form in restaurants, not casual 다 form!)", es: "❌ 피자를 주세요. 얼마입니까?\n✅ 피자 주세요. 얼마예요? (Usa 예요 en conversación — 입니까 es demasiado rígido.)\n\n❌ 맛있다! 추천한다!\n✅ 맛있어요! 추천해요! (Usa forma cortés 해요 en restaurantes, no la forma casual 다.)" },
          rudyTip: { ko: "탐정 루디의 팁: Unit 3 완료! 이제 한국어로 식당에서 주문부터 결제까지 혼자 할 수 있어. 을/를, 으로, 주세요 — 다 마스터했지? 다음 유닛에서 또 만나~", en: "Detective Rudy's tip: Unit 3 complete! You've mastered 주세요, 을/를, 으로 — ordering to paying, all in Korean! The particles were tricky clues, but you solved them all!", es: "Consejo del detective Rudy: ¡Unidad 3 completada! Dominaste 주세요, 을/를, 으로 — desde pedir hasta pagar en coreano. ¡Las partículas fueron pistas difíciles, pero las resolviste!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "커피 한 잔 ___.", answer: "주세요", options: ["주세요", "하세요", "가세요"], fullSentence: "커피 한 잔 주세요.", fullSentenceMeaning: { ko: "커피 한 잔 주세요.", en: "A coffee, please.", es: "Un café, por favor." } },
          { type: "select", promptWithBlank: "이거 ___어요!", answer: "맛있", options: ["맛있", "맛없", "비싸"], fullSentence: "이거 맛있어요!", fullSentenceMeaning: { ko: "맛있어요!", en: "Delicious!", es: "¡Delicioso!" } },
          { type: "select", promptWithBlank: "스테이크를 ___해요.", answer: "추천", options: ["추천", "주문", "좋아"], fullSentence: "스테이크를 추천해요.", fullSentenceMeaning: { ko: "스테이크를 추천해요.", en: "I recommend the steak.", es: "Recomiendo el bistec." } },
          { type: "input", promptWithBlank: "이거 ___예요?", answer: "얼마", fullSentence: "이거 얼마예요?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much?", es: "¿Cuánto cuesta?" } },
          { type: "input", promptWithBlank: "___러요. 감사합니다!", answer: "배불", fullSentence: "배불러요. 감사합니다!", fullSentenceMeaning: { ko: "배불러요. 감사!", en: "I'm full. Thanks!", es: "Lleno. ¡Gracias!" } },
          { type: "listening", audioText: "배불러요. 감사합니다, 안녕히 계세요!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["배불러요. 감사합니다, 안녕히 계세요!", "이거 맛있어요! 추천해요.", "계산이 얼마예요?", "커피 한 잔이랑 치킨 주세요."], correct: 0, audioOnly: true },
        ],
      },
    },
    indonesian: {
      step1Sentences: [
        { text: "Saya suka pizza. Kamu suka makanan apa?", speechLang: "id-ID", meaning: { ko: "저는 피자를 좋아해요. 어떤 음식을 좋아하세요?", en: "I like pizza. What food do you like?", es: "Me gusta la pizza. ¿Qué comida te gusta?" } },
        { text: "Saya mau kopi dan ayam, tolong.", speechLang: "id-ID", meaning: { ko: "커피 한 잔이랑 치킨 주세요.", en: "I'd like a coffee and the chicken, please.", es: "Quiero un café y el pollo, por favor." } },
        { text: "Berapa harga bonnya? Boleh saya bayar dengan kartu?", speechLang: "id-ID", meaning: { ko: "계산이 얼마예요? 카드로 결제할 수 있어요?", en: "How much is the bill? Can I pay by card?", es: "¿Cuánto es la cuenta? ¿Puedo pagar con tarjeta?" } },
        { text: "Ini enak sekali! Saya merekomendasikannya.", speechLang: "id-ID", meaning: { ko: "이거 맛있어요! 추천해요.", en: "This is delicious! I recommend it.", es: "¡Está delicioso! Lo recomiendo." }, recallRound: true },
        { text: "Saya kenyang. Terima kasih, sampai jumpa!", speechLang: "id-ID", meaning: { ko: "배불러요. 감사합니다, 안녕히 계세요!", en: "I'm full. Thank you, goodbye!", es: "Estoy lleno. ¡Gracias, adiós!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "Unit 3 총정리! 좋아하는 음식: Saya suka/sangat suka ___. 주문: Saya mau ___, tolong. 가격: Berapa harganya? 맛: Ini enak! / Ini terlalu asin. 추천: Saya merekomendasikan ___.", en: "Unit 3 Review! Likes: Saya suka/sangat suka ___. Order: Saya mau ___, tolong. Price: Berapa harganya? Taste: Ini enak! / Ini terlalu asin. Recommend: Saya merekomendasikan ___.", es: "Repaso Unidad 3! Gustar: Saya suka/sangat suka ___. Pedir: Saya mau ___, tolong. Precio: Berapa harganya? Sabor: Ini enak! / Ini terlalu asin. Recomendar: Saya merekomendasikan ___." },
          examples: { ko: "Saya mau pizza, tolong. Berapa harganya? (피자 주세요. 얼마예요?)\nIni enak sekali! Saya merekomendasikannya. (맛있어요! 추천해요.)\nSaya kenyang. Boleh saya bayar dengan kartu? Terima kasih! (배불러요. 카드로 돼요? 감사합니다!)", en: "Saya mau pizza, tolong. Berapa harganya? (I'd like a pizza, please. How much is it?)\nIni enak sekali! Saya merekomendasikannya. (This is delicious! I recommend it.)\nSaya kenyang. Boleh saya bayar dengan kartu? Terima kasih! (I'm full. Can I pay by card? Thank you!)", es: "Saya mau pizza, tolong. Berapa harganya? (Quiero una pizza, por favor. ¿Cuánto cuesta?)\nIni enak sekali! Saya merekomendasikannya. (¡Está delicioso! Lo recomiendo.)\nSaya kenyang. Boleh saya bayar dengan kartu? Terima kasih! (Estoy lleno. ¿Puedo pagar con tarjeta? ¡Gracias!)" },
          mistakes: { ko: "❌ Saya suka makan pizza. Ini berapa mahal?\n✅ Saya suka pizza. Ini berapa harganya? (suka 뒤에 바로 음식! 가격은 'berapa harganya'!)\n\n❌ Saya enak. Saya penuh.\n✅ Ini enak. Saya kenyang. (음식은 'Ini enak', 배부른 건 'Saya kenyang'!)", en: "❌ Saya suka makan pizza. Ini berapa mahal?\n✅ Saya suka pizza. Ini berapa harganya? (Food right after 'suka'; price is 'berapa harganya'!)\n\n❌ Saya enak. Saya penuh.\n✅ Ini enak. Saya kenyang. (Food = 'Ini enak', full = 'Saya kenyang'!)", es: "❌ Saya suka makan pizza. Ini berapa mahal?\n✅ Saya suka pizza. Ini berapa harganya? (Comida tras 'suka'; precio es 'berapa harganya'.)\n\n❌ Saya enak. Saya penuh.\n✅ Ini enak. Saya kenyang. (Comida = 'Ini enak', lleno = 'Saya kenyang'.)" },
          rudyTip: { ko: "탐정 루디의 팁: Unit 3 완료! 이제 인도네시아어로 식당에서 주문부터 결제까지 혼자 할 수 있어. suka, tolong, berapa harganya, enak — 다 마스터했지? 잠입 수사 대성공! 다음 유닛에서 또 만나~", en: "Detective Rudy's tip: Unit 3 complete! You can now order, taste, recommend, and pay — all in Indonesian. suka, tolong, berapa harganya, enak — all mastered! Undercover mission success! Next case awaits!", es: "Consejo del detective Rudy: ¡Unidad 3 completada! Ahora puedes pedir, probar, recomendar y pagar en indonesio. suka, tolong, berapa harganya, enak — ¡todo dominado! ¡Misión exitosa!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Saya ___ kopi, tolong.", answer: "mau", options: ["mau", "ada", "pergi"], fullSentence: "Saya mau kopi, tolong.", fullSentenceMeaning: { ko: "커피 한 잔 주세요.", en: "I'd like a coffee.", es: "Quiero un café." } },
          { type: "select", promptWithBlank: "Ini ___ sekali!", answer: "enak", options: ["enak", "lapar", "mahal"], fullSentence: "Ini enak sekali!", fullSentenceMeaning: { ko: "맛있어요!", en: "Delicious!", es: "¡Delicioso!" } },
          { type: "select", promptWithBlank: "Saya ___ steak.", answer: "merekomendasikan", options: ["merekomendasikan", "pesan", "makan"], fullSentence: "Saya merekomendasikan steak.", fullSentenceMeaning: { ko: "스테이크를 추천해요.", en: "I recommend the steak.", es: "Recomiendo el bistec." } },
          { type: "input", promptWithBlank: "Ini berapa ___?", answer: "harganya", fullSentence: "Ini berapa harganya?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta?" } },
          { type: "input", promptWithBlank: "Saya ___. Terima kasih!", answer: "kenyang", fullSentence: "Saya kenyang. Terima kasih!", fullSentenceMeaning: { ko: "배불러요. 감사합니다!", en: "I'm full. Thanks!", es: "Estoy lleno. ¡Gracias!" } },
          { type: "listening", audioText: "Saya kenyang. Terima kasih, sampai jumpa!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Saya kenyang. Terima kasih, sampai jumpa!", "Ini enak sekali! Saya merekomendasikannya.", "Berapa harga bonnya?", "Saya mau kopi, tolong."], correct: 0, audioOnly: true },
        ],
      },
    },
    arabic: {
      step1Sentences: [
        { text: "أنا أُحِبّ البيتزا. ماذا تُحِبّ مِنَ الطَّعام؟ (anā uḥibb al-bītzā. māḏā tuḥibb mina ṭ-ṭaʿām?)", speechLang: "ar-EG", meaning: { ko: "저는 피자를 좋아해요. 어떤 음식을 좋아하세요?", en: "I like pizza. What food do you like?", es: "Me gusta la pizza. ¿Qué comida te gusta?" } },
        { text: "أُريد قَهْوة ودَجاج، لَوْ سَمَحْت. (urīd qahwa wa-dajāj, law samaḥt)", speechLang: "ar-EG", meaning: { ko: "커피 한 잔이랑 치킨 주세요.", en: "I'd like a coffee and the chicken, please.", es: "Quiero un café y el pollo, por favor." } },
        { text: "الحِساب بِكَمْ؟ مُمْكِن أَدْفَع بِالبِطاقة؟ (al-ḥisāb bikam? mumkin adfaʿ bil-biṭāqa?)", speechLang: "ar-EG", meaning: { ko: "계산이 얼마예요? 카드로 결제할 수 있어요?", en: "How much is the bill? Can I pay by card?", es: "¿Cuánto es la cuenta? ¿Puedo pagar con tarjeta?" } },
        { text: "هٰذا لَذيذ جِدًّا! أنا أُرَشِّحُه. (hāḏā laḏīḏ jiddan! anā urashshiḥuhu)", speechLang: "ar-EG", meaning: { ko: "이거 맛있어요! 추천해요.", en: "This is delicious! I recommend it.", es: "¡Está delicioso! Lo recomiendo." }, recallRound: true },
        { text: "أنا شَبْعان. شُكْرًا، مَعَ السَّلامة! (anā shabʿān. shukran, maʿa s-salāma!)", speechLang: "ar-EG", meaning: { ko: "배불러요. 감사합니다, 안녕히 계세요!", en: "I'm full. Thank you, goodbye!", es: "Estoy lleno. ¡Gracias, adiós!" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "Unit 3 총정리! 좋아하는 음식: أنا أُحِبّ ___. 주문: أُريد ___، لَوْ سَمَحْت. 가격: ___ بِكَمْ؟ 맛: هٰذا لَذيذ! / هٰذا مالِح جِدًّا. 추천: أنا أُرَشِّح ___.", en: "Unit 3 Review! Likes: أنا أُحِبّ ___. Order: أُريد ___, law samaḥt. Price: ___ بِكَمْ؟ Taste: hāḏā laḏīḏ! / hāḏā māliḥ jiddan. Recommend: أنا أُرَشِّح ___.", es: "Repaso Unidad 3! Gustar: أنا أُحِبّ ___. Pedir: أُريد ___, law samaḥt. Precio: ___ بِكَمْ؟ Sabor: hāḏā laḏīḏ! / hāḏā māliḥ jiddan. Recomendar: أنا أُرَشِّح ___." },
          examples: { ko: "أُريد بيتزا، لَوْ سَمَحْت. هِيَ بِكَمْ؟ (urīd bītzā, law samaḥt. hiya bikam? — 피자 주세요. 얼마예요?)\nهٰذا لَذيذ جِدًّا! أنا أُرَشِّحُه. (hāḏā laḏīḏ jiddan! anā urashshiḥuhu — 맛있어요! 추천해요.)\nأنا شَبْعان. مُمْكِن أَدْفَع بِالبِطاقة؟ شُكْرًا! (anā shabʿān. mumkin adfaʿ bil-biṭāqa? shukran! — 배불러요. 카드로 돼요? 감사합니다!)", en: "أُريد بيتزا، لَوْ سَمَحْت. هِيَ بِكَمْ؟ (urīd bītzā, law samaḥt. hiya bikam? — I'd like a pizza, please. How much is it?)\nهٰذا لَذيذ جِدًّا! أنا أُرَشِّحُه. (hāḏā laḏīḏ jiddan! anā urashshiḥuhu — This is delicious! I recommend it.)\nأنا شَبْعان. مُمْكِن أَدْفَع بِالبِطاقة؟ شُكْرًا! (anā shabʿān. mumkin adfaʿ bil-biṭāqa? shukran! — I'm full. Can I pay by card? Thank you!)", es: "أُريد بيتزا، لَوْ سَمَحْت. هِيَ بِكَمْ؟ (urīd bītzā, law samaḥt. hiya bikam? — Quiero una pizza, por favor. ¿Cuánto cuesta?)\nهٰذا لَذيذ جِدًّا! أنا أُرَشِّحُه. (hāḏā laḏīḏ jiddan! anā urashshiḥuhu — ¡Está delicioso! Lo recomiendo.)\nأنا شَبْعان. مُمْكِن أَدْفَع بِالبِطاقة؟ شُكْرًا! (anā shabʿān. mumkin adfaʿ bil-biṭāqa? shukran! — Estoy lleno. ¿Puedo pagar con tarjeta? ¡Gracias!)" },
          mistakes: { ko: "❌ أنا أُحِبّ آكُل بيتزا. هٰذا كَمْ غالي؟\n✅ أنا أُحِبّ البيتزا. هٰذا بِكَمْ؟ (أُحِبّ 뒤에 바로 음식! 가격은 'بِكَمْ(bikam)'!)\n\n❌ أنا لَذيذ. أنا مَلْآن.\n✅ هٰذا لَذيذ. أنا شَبْعان. (음식은 'هٰذا لَذيذ(hāḏā laḏīḏ)', 배부른 건 'أنا شَبْعان(anā shabʿān)'!)", en: "❌ أنا أُحِبّ آكُل بيتزا. هٰذا كَمْ غالي؟\n✅ أنا أُحِبّ البيتزا. هٰذا بِكَمْ؟ (Food right after أُحِبّ; price is 'bikam'!)\n\n❌ أنا لَذيذ. أنا مَلْآن.\n✅ هٰذا لَذيذ. أنا شَبْعان. (Food = 'hāḏā laḏīḏ', full = 'anā shabʿān'!)", es: "❌ أنا أُحِبّ آكُل بيتزا. هٰذا كَمْ غالي؟\n✅ أنا أُحِبّ البيتزا. هٰذا بِكَمْ؟ (Comida tras أُحِبّ; precio es 'bikam'.)\n\n❌ أنا لَذيذ. أنا مَلْآن.\n✅ هٰذا لَذيذ. أنا شَبْعان. (Comida = 'hāḏā laḏīḏ', lleno = 'anā shabʿān'.)" },
          rudyTip: { ko: "탐정 루디의 팁: Unit 3 완료! 이제 표준 아랍어로 식당에서 주문부터 결제까지 혼자 할 수 있어. أُحِبّ، لَوْ سَمَحْت، بِكَمْ، لَذيذ — 다 마스터했지? 잠입 수사 대성공! 다음 유닛에서 또 만나~", en: "Detective Rudy's tip: Unit 3 complete! You can now order, taste, recommend, and pay — all in Modern Standard Arabic. uḥibb, law samaḥt, bikam, laḏīḏ — all mastered! Undercover mission success! Next case awaits!", es: "Consejo del detective Rudy: ¡Unidad 3 completada! Ahora puedes pedir, probar, recomendar y pagar en árabe estándar. uḥibb, law samaḥt, bikam, laḏīḏ — ¡todo dominado! ¡Misión exitosa!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ قَهْوة، لَوْ سَمَحْت.", answer: "أُريد", options: ["أُريد", "عِنْدي", "ذاهِب"], fullSentence: "أُريد قَهْوة، لَوْ سَمَحْت.", fullSentenceMeaning: { ko: "커피 한 잔 주세요.", en: "I'd like a coffee.", es: "Quiero un café." } },
          { type: "select", promptWithBlank: "هٰذا ___ جِدًّا!", answer: "لَذيذ", options: ["لَذيذ", "جائِع", "غالي"], fullSentence: "هٰذا لَذيذ جِدًّا!", fullSentenceMeaning: { ko: "맛있어요!", en: "Delicious!", es: "¡Delicioso!" } },
          { type: "select", promptWithBlank: "أنا ___ السِّتيك.", answer: "أُرَشِّح", options: ["أُرَشِّح", "آكُل", "أَطْلُب"], fullSentence: "أنا أُرَشِّح السِّتيك.", fullSentenceMeaning: { ko: "스테이크를 추천해요.", en: "I recommend the steak.", es: "Recomiendo el bistec." } },
          { type: "input", promptWithBlank: "هٰذا ___؟", answer: "بِكَمْ", fullSentence: "هٰذا بِكَمْ؟", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta?" } },
          { type: "input", promptWithBlank: "أنا ___. شُكْرًا!", answer: "شَبْعان", fullSentence: "أنا شَبْعان. شُكْرًا!", fullSentenceMeaning: { ko: "배불러요. 감사합니다!", en: "I'm full. Thanks!", es: "Estoy lleno. ¡Gracias!" } },
          { type: "listening", audioText: "أنا شَبْعان. شُكْرًا، مَعَ السَّلامة!", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["أنا شَبْعان. شُكْرًا، مَعَ السَّلامة!", "هٰذا لَذيذ جِدًّا! أنا أُرَشِّحُه.", "الحِساب بِكَمْ؟", "أُريد قَهْوة، لَوْ سَمَحْت."], correct: 0, audioOnly: true },
        ],
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: MISSION TALK (Unit 3)
// ═══════════════════════════════════════════════════════════════════════════════

export const MISSION_CONTENT_UNIT3: Record<string, Partial<Record<LearningLangKey, MissionTalkLangData>>> = {

  day_13: {
    english: { situation: { ko: "탐정 루디가 작전을 시작합니다! 용의자가 자주 가는 식당에 잠입 수사를 나섰어요. 음식을 좋아하는 척 하면서 정보를 모아야 해요!", en: "Detective Rudy's mission begins! You're going undercover at a restaurant to gather intel on a suspect. Talk about food preferences while staying in character!", es: "¡La misión del detective Rudy comienza! Vas encubierto a un restaurante para recopilar información sobre un sospechoso. ¡Habla de comida mientras mantienes tu cobertura!" }, gptPrompt: "You are Rudy the detective fox, and your partner is going undercover at a suspect's favourite restaurant to gather intel. Stay in detective/mystery framing throughout. Simple A1 {targetLang}. Practice: 1) asking what food they like (as cover conversation) 2) sharing food favourites to blend in 3) asking if they're hungry 4) talking about food you don't like. If they struggle, remind them to say 'I don't understand' (from Unit 1). Keep very simple and fun.", speechLang: "en-GB", suggestedAnswers: ["I like pizza.", "What food do you like?", "I love Korean food.", "I don't like spicy food.", "Are you hungry?", "Yes, I'm very hungry!"] },
    spanish: { situation: { ko: "탐정 루디와 함께 용의자 식당에 잠입! 음식 이야기로 위장하면서 정보를 모으세요.", en: "Undercover at the suspect's restaurant with Detective Rudy! Use food talk as your cover.", es: "¡Encubierto en el restaurante del sospechoso con el detective Rudy! Usa la charla sobre comida como cobertura." }, gptPrompt: "You are Rudy the detective fox, and your partner is going undercover at a suspect's restaurant to gather intel. Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: food preferences, asking about hunger, likes/dislikes as cover conversation. Remind them to use 'No entiendo' if stuck. Keep simple and fun.", speechLang: "es-ES", suggestedAnswers: ["Me gusta la pizza.", "¿Qué comida te gusta?", "Me encanta la comida coreana.", "No me gusta la comida picante.", "¿Tienes hambre?", "¡Sí, mucha hambre!"] },
    korean: { situation: { ko: "탐정 루디와 함께 용의자가 자주 가는 식당에 잠입 수사! 음식 이야기로 위장하면서 정보를 수집하세요!", en: "Undercover at the suspect's favourite restaurant with Detective Rudy! Gather intel while talking food.", es: "¡Encubierto en el restaurante favorito del sospechoso con el detective Rudy!" }, gptPrompt: "You are Rudy the detective fox, and your partner is going undercover at a suspect's favourite restaurant to gather intel. Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: food preferences, asking about hunger, likes/dislikes. Remind them to use '이해를 못 했어요' if stuck. Keep simple and fun.", speechLang: "ko-KR", suggestedAnswers: ["피자를 좋아해요.", "어떤 음식을 좋아하세요?", "한국 음식을 정말 좋아해요.", "매운 음식을 안 좋아해요.", "배고프세요?", "네, 정말 배고파요!"] },
    indonesian: { situation: { ko: "탐정 루디와 함께 용의자가 자주 가는 식당에 잠입 수사! 음식 이야기로 위장하면서 정보를 수집하세요!", en: "Undercover at the suspect's favourite restaurant with Detective Rudy! Gather intel while talking food.", es: "¡Encubierto en el restaurante favorito del sospechoso con el detective Rudy!" }, gptPrompt: "You are Rudy the detective fox, and your partner is going undercover at a suspect's favourite restaurant to gather intel. Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: food preferences ('Saya suka ___'), asking what they like ('Kamu suka makanan apa?'), asking about hunger ('Apakah kamu lapar?'), and dislikes ('Saya tidak suka ___') as cover conversation. Remind them to use 'Saya tidak mengerti' if stuck. Keep simple and fun.", speechLang: "id-ID", suggestedAnswers: ["Saya suka pizza.", "Kamu suka makanan apa?", "Saya sangat suka makanan Korea.", "Saya tidak suka makanan pedas.", "Apakah kamu lapar?", "Ya, saya sangat lapar!"] },
    arabic: { situation: { ko: "탐정 루디와 함께 용의자가 자주 가는 식당에 잠입 수사! 음식 이야기로 위장하면서 정보를 수집하세요!", en: "Undercover at the suspect's favourite restaurant with Detective Rudy! Gather intel while talking food.", es: "¡Encubierto en el restaurante favorito del sospechoso con el detective Rudy!" }, gptPrompt: "You are Rudy the detective fox, and your partner is going undercover at a suspect's favourite restaurant to gather intel. Detective/mystery framing throughout. Use simple A1 Modern Standard Arabic (MSA, pausal — drop final case endings). Practice: food preferences ('anā uḥibb ___'), asking what they like ('māḏā tuḥibb mina ṭ-ṭaʿām?'), asking about hunger ('hal anta jāʾiʿ?'), and dislikes ('anā lā uḥibb ___') as cover conversation. Use MSA forms (lā for negation, urīd for 'I want', jiddan for 'very'). Remind them to use 'anā lā afham' if stuck. Keep simple and fun.", speechLang: "ar-EG", suggestedAnswers: ["أنا أُحِبّ البيتزا.", "ماذا تُحِبّ مِنَ الطَّعام؟", "أنا أُحِبّ الطَّعام الكورِيّ جِدًّا.", "أنا لا أُحِبّ الطَّعام الحارّ.", "هَلْ أَنْتَ جائِع؟", "نَعَم، أنا جائِع جِدًّا!"] },
  },

  day_14: {
    english: { situation: { ko: "탐정 루디의 다음 임무: 용의자가 단골로 가는 카페를 미행해야 해요! 주문을 하면서 용의자를 관찰하세요.", en: "Detective Rudy's next mission: shadow a suspect at their usual café! Order food and drinks while keeping an eye on the target.", es: "¡La siguiente misión del detective Rudy: seguir a un sospechoso en su café habitual! Pide comida y bebida mientras vigilas al objetivo." }, gptPrompt: "You are Rudy the detective fox, and your partner is shadowing a suspect at their usual café. Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: 1) asking for the menu as cover 2) ordering food and drinks ('I'd like ___', 'Can I have ___') 3) 'For here or to go?' — choosing to stay to keep watching 4) confirming the order. If they forget 'please', gently remind them. Keep very simple.", speechLang: "en-GB", suggestedAnswers: ["Can I have the menu, please?", "I'd like a coffee, please.", "I'll have the chicken.", "Can I have water, please?", "For here, please.", "Thank you!"] },
    spanish: { situation: { ko: "용의자의 단골 카페를 미행 중! 주문을 하면서 감시를 계속하세요.", en: "Shadowing the suspect at their usual café! Keep your cover by ordering.", es: "¡Siguiendo al sospechoso en su café habitual! Mantén tu cobertura pidiendo." }, gptPrompt: "You are Rudy the detective fox. Your partner is shadowing a suspect at their usual café. Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: asking for menu, ordering food/drinks, 'para aquí o para llevar?' (staying to keep watch), confirm order. Remind them of 'por favor'. Keep simple.", speechLang: "es-ES", suggestedAnswers: ["¿Puedo ver el menú, por favor?", "Quiero un café, por favor.", "Voy a pedir el pollo.", "¿Puedo tener agua, por favor?", "Para aquí, por favor.", "¡Gracias!"] },
    korean: { situation: { ko: "탐정 루디와 함께 용의자의 단골 카페를 미행! 주문하면서 자연스럽게 위장하세요.", en: "Shadowing the suspect at their usual café with Detective Rudy! Order to blend in.", es: "¡Siguiendo al sospechoso en su café habitual con el detective Rudy!" }, gptPrompt: "You are Rudy the detective fox. Your partner is shadowing a suspect at their usual café. Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: asking for menu, ordering food/drinks, for here or takeout (staying to keep watch), confirm order. Remind them of '주세요'. Keep simple.", speechLang: "ko-KR", suggestedAnswers: ["메뉴판 좀 주시겠어요?", "커피 한 잔 주세요.", "치킨으로 할게요.", "물 좀 주세요.", "여기서 먹을게요.", "감사합니다!"] },
    indonesian: { situation: { ko: "탐정 루디와 함께 용의자의 단골 카페를 미행! 주문하면서 자연스럽게 위장하세요.", en: "Shadowing the suspect at their usual café with Detective Rudy! Order to blend in.", es: "¡Siguiendo al sospechoso en su café habitual con el detective Rudy!" }, gptPrompt: "You are Rudy the detective fox. Your partner is shadowing a suspect at their usual café. Detective/mystery framing throughout. Simple A1 {targetLang}. Practice: asking for the menu as cover ('Boleh saya minta menu?'), ordering food and drinks ('Saya mau ___, tolong', 'Boleh saya minta ___?'), 'Makan di sini atau bawa pulang?' (choosing to stay and keep watch), and confirming the order. If they forget 'tolong', gently remind them. Keep simple.", speechLang: "id-ID", suggestedAnswers: ["Boleh saya minta menu?", "Saya mau kopi, tolong.", "Saya pesan ayam, tolong.", "Boleh saya minta air?", "Makan di sini, tolong.", "Terima kasih!"] },
    arabic: { situation: { ko: "탐정 루디와 함께 용의자의 단골 카페를 미행! 주문하면서 자연스럽게 위장하세요.", en: "Shadowing the suspect at their usual café with Detective Rudy! Order to blend in.", es: "¡Siguiendo al sospechoso en su café habitual con el detective Rudy!" }, gptPrompt: "You are Rudy the detective fox. Your partner is shadowing a suspect at their usual café. Detective/mystery framing throughout. Use simple A1 Modern Standard Arabic (MSA, pausal — drop final case endings). Practice: asking for the menu as cover ('mumkin al-qāʾima law samaḥt?'), ordering food and drinks ('urīd ___, law samaḥt', 'mumkin ___?'), 'hunā am safariyy?' (choosing to stay and keep watch), and confirming the order. Use MSA forms (urīd for 'I want', mumkin, law samaḥt). If they forget 'law samaḥt', gently remind them. Keep simple.", speechLang: "ar-EG", suggestedAnswers: ["مُمْكِن القائِمة لَوْ سَمَحْت؟", "أُريد قَهْوة، لَوْ سَمَحْت.", "سَآخُذ الدَّجاج، لَوْ سَمَحْت.", "مُمْكِن ماء لَوْ سَمَحْت؟", "هُنا، لَوْ سَمَحْت.", "شُكْرًا!"] },
  },

  day_15: {
    english: { situation: { ko: "식사를 마치고 계산할 시간입니다. 가격을 확인하고 결제해보세요! Unit 2에서 배운 숫자도 활용하세요.", en: "Time to pay after your meal. Check prices and pay! Use numbers from Unit 2.", es: "Hora de pagar. ¡Revisa precios y paga! Usa números de la Unidad 2." }, gptPrompt: "You are Rudy helping your partner pay at the restaurant. Simple A1 {targetLang}. Practice: 1) asking 'How much is this?' for items 2) understanding prices using numbers from Unit 2 3) saying 'That's too expensive!' 4) asking to pay by card 5) asking for the bill. Mix in previous vocabulary naturally (numbers, 'thank you'). Keep very simple.", speechLang: "en-GB", suggestedAnswers: ["How much is this?", "It's ten dollars.", "That's too expensive!", "Can I pay by card?", "The bill, please.", "Thank you!"] },
    spanish: { situation: { ko: "식사 후 계산할 시간입니다. 숫자도 활용하세요!", en: "Time to pay. Use numbers too!", es: "Hora de pagar. ¡Usa números!" }, gptPrompt: "You are Rudy helping your partner pay at the restaurant. Simple A1 {targetLang}. Practice: asking prices, understanding amounts (numbers from Unit 2), saying too expensive, paying by card, asking for the bill. Keep simple.", speechLang: "es-ES", suggestedAnswers: ["¿Cuánto cuesta esto?", "Son diez dólares.", "¡Muy caro!", "¿Puedo pagar con tarjeta?", "La cuenta, por favor.", "¡Gracias!"] },
    korean: { situation: { ko: "식사 후 계산할 시간입니다. Unit 2 숫자도 활용하세요!", en: "Time to pay. Use numbers!", es: "Hora de pagar. ¡Números!" }, gptPrompt: "You are Rudy helping your partner pay at the restaurant. Simple A1 {targetLang}. Practice: asking prices, understanding amounts, saying expensive, paying by card, asking for the bill. Use numbers from Unit 2. Keep simple.", speechLang: "ko-KR", suggestedAnswers: ["이거 얼마예요?", "만 원이에요.", "너무 비싸요!", "카드로 결제할 수 있어요?", "계산서 주세요.", "감사합니다!"] },
    indonesian: { situation: { ko: "식사 후 계산할 시간입니다. Unit 2 숫자도 활용하세요!", en: "Time to pay. Use numbers!", es: "Hora de pagar. ¡Números!" }, gptPrompt: "You are Rudy helping your partner pay at the restaurant. Simple A1 {targetLang}. Practice: asking 'Ini berapa harganya?' for items, understanding prices using numbers from Unit 2, saying 'Itu terlalu mahal!', asking 'Boleh saya bayar dengan kartu?', and asking for the bill ('Minta bonnya, tolong'). Mix in previous vocabulary naturally (numbers, 'terima kasih'). Keep simple.", speechLang: "id-ID", suggestedAnswers: ["Ini berapa harganya?", "Harganya sepuluh dolar.", "Itu terlalu mahal!", "Boleh saya bayar dengan kartu?", "Minta bonnya, tolong.", "Terima kasih!"] },
    arabic: { situation: { ko: "식사 후 계산할 시간입니다. Unit 2 숫자도 활용하세요!", en: "Time to pay. Use numbers!", es: "Hora de pagar. ¡Números!" }, gptPrompt: "You are Rudy helping your partner pay at the restaurant. Use simple A1 Modern Standard Arabic (MSA, pausal — drop final case endings). Practice: asking 'هٰذا بِكَمْ؟ (hāḏā bikam?)' for items, understanding prices using numbers from Unit 2, saying 'هٰذا غالي جِدًّا! (hāḏā ghālī jiddan!)', asking 'مُمْكِن أَدْفَع بِالبِطاقة؟ (mumkin adfaʿ bil-biṭāqa?)', and asking for the bill ('al-ḥisāb, law samaḥt'). Use MSA forms (bikam, jiddan). Mix in previous vocabulary naturally (numbers, 'shukran'). Keep simple.", speechLang: "ar-EG", suggestedAnswers: ["هٰذا بِكَمْ؟", "بِعَشَرة دولار.", "هٰذا غالي جِدًّا!", "مُمْكِن أَدْفَع بِالبِطاقة؟", "الحِساب، لَوْ سَمَحْت.", "شُكْرًا!"] },
  },

  day_16: {
    english: { situation: { ko: "음식을 받았습니다! 맛을 표현해보세요. 루디에게 맛이 어떤지 이야기해주세요.", en: "The food has arrived! Express how it tastes. Tell Rudy what you think!", es: "¡Llegó la comida! Expresa el sabor. ¡Dile a Rudy qué piensas!" }, gptPrompt: "You are Rudy eating with your partner at the restaurant. Simple A1 {targetLang}. Practice: 1) asking how the food tastes 2) saying 'delicious', 'very good' 3) complaining 'too salty', 'too sweet' 4) saying 'I'm full' at the end. Also naturally use 'Thank you' from Unit 1. Try different foods so they can practise multiple taste words. Keep very simple and fun.", speechLang: "en-GB", suggestedAnswers: ["This is delicious!", "It's very good.", "It's too salty.", "It's too sweet.", "I'm full. Thank you!", "Can you say that again?"] },
    spanish: { situation: { ko: "음식이 도착했습니다! 맛을 표현해보세요.", en: "Food has arrived! Express the taste.", es: "¡Llegó la comida! Expresa el sabor." }, gptPrompt: "You are Rudy eating with your partner. Simple A1 {targetLang}. Practice: taste expressions (delicious, good, salty, sweet), saying I'm full, using Gracias. Try different foods. Keep simple and fun.", speechLang: "es-ES", suggestedAnswers: ["¡Esto está delicioso!", "Está muy bueno.", "Está muy salado.", "Está muy dulce.", "Estoy lleno. ¡Gracias!", "¿Puede repetir eso?"] },
    korean: { situation: { ko: "음식이 도착했어요! 맛을 표현해보세요.", en: "Food is here! Express the taste.", es: "¡Llegó la comida!" }, gptPrompt: "You are Rudy eating with your partner. Simple A1 {targetLang}. Practice: taste expressions (맛있어요, 짜요, 달아요), 배불러요, 감사합니다. Try different foods. Keep simple and fun.", speechLang: "ko-KR", suggestedAnswers: ["이거 맛있어요!", "정말 맛있어요.", "너무 짜요.", "너무 달아요.", "배불러요. 감사합니다!", "다시 한번 말해 주시겠어요?"] },
    indonesian: { situation: { ko: "음식이 도착했어요! 맛을 표현해보세요.", en: "Food is here! Express the taste.", es: "¡Llegó la comida!" }, gptPrompt: "You are Rudy eating with your partner. Simple A1 {targetLang}. Practice: taste expressions ('Ini enak!', 'Ini terlalu asin', 'Ini terlalu manis'), saying 'Saya kenyang' at the end, and 'Terima kasih'. Try different foods so they can practise multiple taste words. Keep simple and fun.", speechLang: "id-ID", suggestedAnswers: ["Ini enak sekali!", "Ini sangat enak.", "Ini terlalu asin.", "Ini terlalu manis.", "Saya kenyang. Terima kasih!", "Bisa tolong ulangi?"] },
    arabic: { situation: { ko: "음식이 도착했어요! 맛을 표현해보세요.", en: "Food is here! Express the taste.", es: "¡Llegó la comida!" }, gptPrompt: "You are Rudy eating with your partner. Use simple A1 Modern Standard Arabic (MSA, pausal — drop final case endings). Practice: taste expressions ('hāḏā laḏīḏ!', 'hāḏā māliḥ jiddan', 'hāḏā sukkariyy jiddan'), saying 'anā shabʿān' at the end, and 'shukran'. Use MSA forms (hāḏā for 'this', jiddan for 'very/too'). Try different foods so they can practise multiple taste words. Keep simple and fun.", speechLang: "ar-EG", suggestedAnswers: ["هٰذا لَذيذ جِدًّا!", "هٰذا حُلْو جِدًّا.", "هٰذا مالِح جِدًّا.", "هٰذا سُكَّرِيّ جِدًّا.", "أنا شَبْعان. شُكْرًا!", "مُمْكِن تُعيد ثانِيةً؟"] },
  },

  day_17: {
    english: { situation: { ko: "루디가 새로운 동료를 식당에 데려왔습니다. 좋아하는 음식을 추천해주세요!", en: "Rudy brought a new colleague to the restaurant. Recommend your favourite dishes!", es: "Rudy trajo un nuevo colega. ¡Recomienda tus platos favoritos!" }, gptPrompt: "You are Rudy at the restaurant with your partner and a new colleague. Simple A1 {targetLang}. Practice: 1) recommending dishes ('I recommend ___', 'You should try ___') 2) asking what they recommend 3) describing food ('fresh', 'delicious') 4) suggesting to eat together. Also reinforce ordering from Day 14 and taste from Day 16 naturally. Keep very simple and encouraging.", speechLang: "en-GB", suggestedAnswers: ["I recommend the steak.", "You should try the soup.", "What do you recommend?", "The salad is very fresh.", "Let's eat together!", "This is delicious!"] },
    spanish: { situation: { ko: "루디가 새 동료를 식당에 데려왔습니다. 추천해주세요!", en: "Rudy brought a new colleague. Recommend dishes!", es: "Rudy trajo un colega nuevo. ¡Recomienda!" }, gptPrompt: "You are Rudy at the restaurant with your partner and a new colleague. Simple A1 {targetLang}. Practice: recommending, asking recommendations, describing food, suggesting to eat together. Reinforce ordering and taste. Keep simple.", speechLang: "es-ES", suggestedAnswers: ["Recomiendo el bistec.", "Deberías probar la sopa.", "¿Qué recomiendas?", "La ensalada está muy fresca.", "¡Comamos juntos!", "¡Está delicioso!"] },
    korean: { situation: { ko: "루디가 새 동료를 데려왔어요. 맛있는 음식을 추천해주세요!", en: "New colleague! Recommend dishes!", es: "¡Nuevo colega! ¡Recomienda!" }, gptPrompt: "You are Rudy at the restaurant with your partner and a new colleague. Simple A1 {targetLang}. Practice: recommending, asking recommendations, describing food, eating together. Reinforce ordering and taste. Keep simple.", speechLang: "ko-KR", suggestedAnswers: ["스테이크를 추천해요.", "수프를 한번 드셔보세요.", "뭘 추천하세요?", "샐러드가 아주 신선해요.", "같이 먹어요!", "이거 맛있어요!"] },
    indonesian: { situation: { ko: "루디가 새 동료를 데려왔어요. 맛있는 음식을 추천해주세요!", en: "New colleague! Recommend dishes!", es: "¡Nuevo colega! ¡Recomienda!" }, gptPrompt: "You are Rudy at the restaurant with your partner and a new colleague. Simple A1 {targetLang}. Practice: recommending dishes ('Saya merekomendasikan ___', 'Kamu harus coba ___'), asking 'Apa yang kamu rekomendasikan?', describing food ('segar', 'enak'), and suggesting to eat together ('Ayo makan bersama!'). Reinforce ordering and taste naturally. Keep simple and encouraging.", speechLang: "id-ID", suggestedAnswers: ["Saya merekomendasikan steak.", "Kamu harus coba supnya.", "Apa yang kamu rekomendasikan?", "Saladnya sangat segar.", "Ayo makan bersama!", "Ini enak sekali!"] },
    arabic: { situation: { ko: "루디가 새 동료를 데려왔어요. 맛있는 음식을 추천해주세요!", en: "New colleague! Recommend dishes!", es: "¡Nuevo colega! ¡Recomienda!" }, gptPrompt: "You are Rudy at the restaurant with your partner and a new colleague. Use simple A1 Modern Standard Arabic (MSA, pausal — drop final case endings). Practice: recommending dishes ('anā urashshiḥ ___', 'yajibu an tujarrib ___'), asking 'māḏā turashshiḥ?', describing food ('ṭāzaj', 'laḏīḏ'), and suggesting to eat together ('hayyā naʾkul maʿan!'). Use MSA forms (yajibu an + subjunctive, jiddan, hayyā). Reinforce ordering and taste naturally. Keep simple and encouraging.", speechLang: "ar-EG", suggestedAnswers: ["أنا أُرَشِّح السِّتيك.", "يَجِبُ أَنْ تُجَرِّب الحَساء.", "ماذا تُرَشِّح؟", "السَّلَطة طازَجة جِدًّا.", "هَيّا نَأْكُل مَعًا!", "هٰذا لَذيذ جِدًّا!"] },
  },

  day_18: {
    english: { situation: { ko: "박물관 팀 저녁 모임에서 이번 주에 배운 모든 음식 표현을 활용하세요! Unit 1-2의 인사, 숫자, 시간도 자연스럽게 섞어보세요!", en: "Museum team dinner! Use ALL food expressions from this week, plus greetings, numbers, and time from Units 1-2!", es: "¡Cena del equipo del museo! ¡Usa TODAS las expresiones de comida más saludos, números y hora!" }, gptPrompt: "You are Rudy hosting a team dinner at a restaurant near the museum. Test ALL of Unit 3 in natural A1 {targetLang} conversation. Cover: 1) talking about food preferences 2) ordering food and drinks 3) asking about prices and paying 4) expressing taste (delicious, salty, sweet) 5) recommending dishes. Also reinforce Unit 1 (greetings, introductions, 'I don't understand') and Unit 2 (numbers for prices, time for reservation). Create 2-3 mini-scenarios: arriving at restaurant, ordering, paying. Be encouraging but thorough.", speechLang: "en-GB", suggestedAnswers: ["I like pizza. What food do you like?", "I'd like a coffee, please.", "How much is this?", "This is delicious!", "I recommend the steak.", "I'm full. Thank you, goodbye!"] },
    spanish: { situation: { ko: "박물관 팀 저녁 모임입니다!", en: "Museum team dinner! Use everything!", es: "¡Cena del equipo! ¡Usa todo!" }, gptPrompt: "You are Rudy hosting a team dinner. Test ALL of Unit 3 in A1 {targetLang}: food preferences, ordering, prices/paying, taste, recommendations. Also reinforce Units 1-2 (greetings, numbers, time). Create 2-3 mini-scenarios. Be encouraging.", speechLang: "es-ES", suggestedAnswers: ["Me gusta la pizza. ¿Qué te gusta?", "Quiero un café, por favor.", "¿Cuánto cuesta esto?", "¡Está delicioso!", "Recomiendo el bistec.", "Estoy lleno. ¡Gracias, adiós!"] },
    korean: { situation: { ko: "박물관 팀 저녁 모임입니다! 이번 주 배운 모든 표현을 활용하세요!", en: "Team dinner! Use everything!", es: "¡Cena! ¡Usa todo!" }, gptPrompt: "You are Rudy hosting a team dinner. Test ALL of Unit 3 in A1 {targetLang}: food preferences, ordering, prices/paying, taste, recommendations. Also reinforce Units 1-2 (greetings, numbers, time). Create 2-3 mini-scenarios. Be encouraging.", speechLang: "ko-KR", suggestedAnswers: ["피자를 좋아해요. 뭘 좋아하세요?", "커피 한 잔 주세요.", "이거 얼마예요?", "이거 맛있어요!", "스테이크를 추천해요.", "배불러요. 감사합니다, 안녕히 계세요!"] },
    indonesian: { situation: { ko: "박물관 팀 저녁 모임입니다! 이번 주 배운 모든 표현을 활용하세요!", en: "Team dinner! Use everything!", es: "¡Cena! ¡Usa todo!" }, gptPrompt: "You are Rudy hosting a team dinner at a restaurant near the museum. Test ALL of Unit 3 in natural A1 {targetLang}: food preferences ('Saya suka ___'), ordering food and drinks ('Saya mau ___, tolong'), asking prices and paying ('Berapa harganya?', 'Boleh saya bayar dengan kartu?'), expressing taste ('Ini enak!', 'Ini terlalu asin'), and recommending dishes ('Saya merekomendasikan ___'). Also reinforce Unit 1 (greetings, introductions, 'Saya tidak mengerti') and Unit 2 (numbers for prices, time for a reservation). Create 2-3 mini-scenarios: arriving, ordering, paying. Be encouraging but thorough.", speechLang: "id-ID", suggestedAnswers: ["Saya suka pizza. Kamu suka makanan apa?", "Saya mau kopi, tolong.", "Ini berapa harganya?", "Ini enak sekali!", "Saya merekomendasikan steak.", "Saya kenyang. Terima kasih, sampai jumpa!"] },
    arabic: { situation: { ko: "박물관 팀 저녁 모임입니다! 이번 주 배운 모든 표현을 활용하세요!", en: "Team dinner! Use everything!", es: "¡Cena! ¡Usa todo!" }, gptPrompt: "You are Rudy hosting a team dinner at a restaurant near the museum. Test ALL of Unit 3 in natural A1 Modern Standard Arabic (MSA, pausal — drop final case endings): food preferences ('anā uḥibb ___'), ordering food and drinks ('urīd ___, law samaḥt'), asking prices and paying ('___ bikam?', 'mumkin adfaʿ bil-biṭāqa?'), expressing taste ('hāḏā laḏīḏ!', 'hāḏā māliḥ jiddan'), and recommending dishes ('anā urashshiḥ ___'). Use MSA forms (uḥibb, urīd, lā, bikam, jiddan). Also reinforce Unit 1 (greetings, introductions, 'anā lā afham') and Unit 2 (numbers for prices, time for a reservation). Create 2-3 mini-scenarios: arriving, ordering, paying. Be encouraging but thorough.", speechLang: "ar-EG", suggestedAnswers: ["أنا أُحِبّ البيتزا. ماذا تُحِبّ مِنَ الطَّعام؟", "أُريد قَهْوة، لَوْ سَمَحْت.", "هٰذا بِكَمْ؟", "هٰذا لَذيذ جِدًّا!", "أنا أُرَشِّح السِّتيك.", "أنا شَبْعان. شُكْرًا، مَعَ السَّلامة!"] },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4: REVIEW (Unit 3)
// ═══════════════════════════════════════════════════════════════════════════════

export const REVIEW_CONTENT_UNIT3: Record<string, Partial<Record<LearningLangKey, ReviewQuestion[]>>> = {

  day_13: {
    english: [
      { type: "speak", sentence: "I like the blue one. Do you have a bigger size?", speechLang: "en-GB", meaning: { ko: "파란색이 좋아요. 더 큰 사이즈 있어요?", en: "I like blue. Bigger size?", es: "Me gusta azul. ¿Más grande?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "How ___ is this?", answer: "much", options: ["much", "many", "old"], fullSentence: "How much is this?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta?" }, isYesterdayReview: true },
      { type: "speak", sentence: "I like pizza and pasta.", speechLang: "en-GB", meaning: { ko: "피자와 파스타를 좋아해요.", en: "I like pizza and pasta.", es: "Me gusta la pizza y la pasta." } },
      { type: "fill_blank", promptWithBlank: "What food do you ___?", answer: "like", options: ["like", "eat", "want"], fullSentence: "What food do you like?", fullSentenceMeaning: { ko: "어떤 음식을 좋아하세요?", en: "What food do you like?", es: "¿Qué comida te gusta?" } },
      { type: "speak", sentence: "Are you hungry? I love Korean food!", speechLang: "en-GB", meaning: { ko: "배고프세요? 한국 음식을 정말 좋아해요!", en: "Hungry? I love Korean food!", es: "¿Hambre? ¡Me encanta la comida coreana!" } },
    ],
    spanish: [
      { type: "speak", sentence: "Me gusta el azul. ¿Tiene una talla más grande?", speechLang: "es-ES", meaning: { ko: "파란색 좋아요. 큰 사이즈?", en: "I like blue. Bigger?", es: "Me gusta el azul. ¿Más grande?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿Cuánto ___ esto?", answer: "cuesta", options: ["cuesta", "es", "tiene"], fullSentence: "¿Cuánto cuesta esto?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much?", es: "¿Cuánto cuesta?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Me gusta la pizza y la pasta.", speechLang: "es-ES", meaning: { ko: "피자와 파스타를 좋아해요.", en: "I like pizza and pasta.", es: "Me gusta la pizza y la pasta." } },
      { type: "fill_blank", promptWithBlank: "¿Qué ___ te gusta?", answer: "comida", options: ["comida", "comer", "cocina"], fullSentence: "¿Qué comida te gusta?", fullSentenceMeaning: { ko: "어떤 음식 좋아하세요?", en: "What food do you like?", es: "¿Qué comida te gusta?" } },
      { type: "speak", sentence: "¿Tienes hambre? ¡Me encanta la comida coreana!", speechLang: "es-ES", meaning: { ko: "배고프세요? 한국 음식 좋아해요!", en: "Hungry? I love Korean food!", es: "¿Hambre? ¡Me encanta la comida coreana!" } },
    ],
    korean: [
      { type: "speak", sentence: "파란색이 좋아요. 더 큰 사이즈 있어요?", speechLang: "ko-KR", meaning: { ko: "파란색 좋아요. 큰 사이즈?", en: "I like blue. Bigger?", es: "Azul. ¿Más grande?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "이거 ___예요?", answer: "얼마", options: ["얼마", "뭐", "어디"], fullSentence: "이거 얼마예요?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much?", es: "¿Cuánto?" }, isYesterdayReview: true },
      { type: "speak", sentence: "피자와 파스타를 좋아해요.", speechLang: "ko-KR", meaning: { ko: "피자와 파스타를 좋아해요.", en: "I like pizza and pasta.", es: "Me gusta pizza y pasta." } },
      { type: "fill_blank", promptWithBlank: "어떤 ___을 좋아하세요?", answer: "음식", options: ["음식", "사람", "날씨"], fullSentence: "어떤 음식을 좋아하세요?", fullSentenceMeaning: { ko: "어떤 음식?", en: "What food?", es: "¿Qué comida?" } },
      { type: "speak", sentence: "배고프세요? 한국 음식을 정말 좋아해요!", speechLang: "ko-KR", meaning: { ko: "배고프세요? 한국 음식!", en: "Hungry? I love Korean food!", es: "¿Hambre? ¡Comida coreana!" } },
    ],
    indonesian: [
      { type: "speak", sentence: "Saya suka yang biru. Ada ukuran lebih besar?", speechLang: "id-ID", meaning: { ko: "파란색 좋아요. 큰 사이즈?", en: "I like blue. Bigger?", es: "Me gusta azul. ¿Más grande?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Ini berapa ___?", answer: "harganya", options: ["harganya", "mahal", "uang"], fullSentence: "Ini berapa harganya?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much?", es: "¿Cuánto?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Saya suka pizza dan pasta.", speechLang: "id-ID", meaning: { ko: "피자와 파스타를 좋아해요.", en: "I like pizza and pasta.", es: "Me gusta pizza y pasta." } },
      { type: "fill_blank", promptWithBlank: "Kamu suka makanan ___?", answer: "apa", options: ["apa", "siapa", "mana"], fullSentence: "Kamu suka makanan apa?", fullSentenceMeaning: { ko: "어떤 음식?", en: "What food?", es: "¿Qué comida?" } },
      { type: "speak", sentence: "Apakah kamu lapar? Saya sangat suka makanan Korea!", speechLang: "id-ID", meaning: { ko: "배고프세요? 한국 음식!", en: "Hungry? I love Korean food!", es: "¿Hambre? ¡Comida coreana!" } },
    ],
    arabic: [
      { type: "speak", sentence: "أنا أُحِبّ الأَزْرَق. هَلْ عِنْدَك مَقاس أَكْبَر؟ (anā uḥibb al-azraq. hal ʿindak maqās akbar?)", speechLang: "ar-EG", meaning: { ko: "파란색 좋아요. 큰 사이즈?", en: "I like blue. Bigger?", es: "Me gusta azul. ¿Más grande?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "هٰذا ___؟", answer: "بِكَمْ", options: ["بِكَمْ", "غالي", "نُقود"], fullSentence: "هٰذا بِكَمْ؟", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much?", es: "¿Cuánto?" }, isYesterdayReview: true },
      { type: "speak", sentence: "أنا أُحِبّ البيتزا والمَعْكَرونة. (anā uḥibb al-bītzā wal-maʿkarūna)", speechLang: "ar-EG", meaning: { ko: "피자와 파스타를 좋아해요.", en: "I like pizza and pasta.", es: "Me gusta pizza y pasta." } },
      { type: "fill_blank", promptWithBlank: "ماذا تُحِبّ مِنَ ___؟", answer: "الطَّعام", options: ["الطَّعام", "أَحَد", "مَطْعَم"], fullSentence: "ماذا تُحِبّ مِنَ الطَّعام؟", fullSentenceMeaning: { ko: "어떤 음식?", en: "What food?", es: "¿Qué comida?" } },
      { type: "speak", sentence: "هَلْ أَنْتَ جائِع؟ أنا أُحِبّ الطَّعام الكورِيّ جِدًّا! (hal anta jāʾiʿ? anā uḥibb aṭ-ṭaʿām al-kūriyy jiddan!)", speechLang: "ar-EG", meaning: { ko: "배고프세요? 한국 음식!", en: "Hungry? I love Korean food!", es: "¿Hambre? ¡Comida coreana!" } },
    ],
  },

  day_14: {
    english: [
      { type: "speak", sentence: "I like pizza. What food do you like?", speechLang: "en-GB", meaning: { ko: "피자를 좋아해요. 뭘 좋아하세요?", en: "I like pizza. What do you like?", es: "Me gusta la pizza. ¿Qué te gusta?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Are you ___?", answer: "hungry", options: ["hungry", "thirsty", "full"], fullSentence: "Are you hungry?", fullSentenceMeaning: { ko: "배고프세요?", en: "Are you hungry?", es: "¿Tienes hambre?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Can I have the menu, please?", speechLang: "en-GB", meaning: { ko: "메뉴판 좀 주시겠어요?", en: "Menu, please?", es: "¿El menú, por favor?" } },
      { type: "fill_blank", promptWithBlank: "I'd ___ a coffee, please.", answer: "like", options: ["like", "want", "have"], fullSentence: "I'd like a coffee, please.", fullSentenceMeaning: { ko: "커피 한 잔 주세요.", en: "A coffee, please.", es: "Un café, por favor." } },
      { type: "speak", sentence: "I'll have the chicken, please. For here.", speechLang: "en-GB", meaning: { ko: "치킨으로 할게요. 여기서 먹을게요.", en: "Chicken, please. For here.", es: "Pollo, por favor. Para aquí." } },
    ],
    spanish: [
      { type: "speak", sentence: "Me gusta la pizza. ¿Qué comida te gusta?", speechLang: "es-ES", meaning: { ko: "피자 좋아해요. 뭘 좋아하세요?", en: "I like pizza. You?", es: "Me gusta la pizza. ¿Y tú?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿Tienes ___?", answer: "hambre", options: ["hambre", "sed", "sueño"], fullSentence: "¿Tienes hambre?", fullSentenceMeaning: { ko: "배고프세요?", en: "Are you hungry?", es: "¿Tienes hambre?" }, isYesterdayReview: true },
      { type: "speak", sentence: "¿Puedo ver el menú, por favor?", speechLang: "es-ES", meaning: { ko: "메뉴판 주세요.", en: "Menu, please?", es: "¿El menú?" } },
      { type: "fill_blank", promptWithBlank: "___ un café, por favor.", answer: "Quiero", options: ["Quiero", "Tengo", "Soy"], fullSentence: "Quiero un café, por favor.", fullSentenceMeaning: { ko: "커피 주세요.", en: "A coffee, please.", es: "Un café, por favor." } },
      { type: "speak", sentence: "Voy a pedir el pollo, por favor. Para aquí.", speechLang: "es-ES", meaning: { ko: "치킨으로요. 여기서.", en: "Chicken, for here.", es: "Pollo. Para aquí." } },
    ],
    korean: [
      { type: "speak", sentence: "피자를 좋아해요. 어떤 음식을 좋아하세요?", speechLang: "ko-KR", meaning: { ko: "피자 좋아해요. 뭘?", en: "I like pizza. You?", es: "Me gusta pizza. ¿Y tú?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "___프세요?", answer: "배고", options: ["배고", "배불", "기쁘"], fullSentence: "배고프세요?", fullSentenceMeaning: { ko: "배고프세요?", en: "Hungry?", es: "¿Hambre?" }, isYesterdayReview: true },
      { type: "speak", sentence: "메뉴판 좀 주시겠어요?", speechLang: "ko-KR", meaning: { ko: "메뉴판 주세요.", en: "Menu, please.", es: "¿El menú?" } },
      { type: "fill_blank", promptWithBlank: "커피 한 잔 ___.", answer: "주세요", options: ["주세요", "하세요", "가세요"], fullSentence: "커피 한 잔 주세요.", fullSentenceMeaning: { ko: "커피 주세요.", en: "Coffee, please.", es: "Café, por favor." } },
      { type: "speak", sentence: "치킨으로 할게요. 여기서 먹을게요.", speechLang: "ko-KR", meaning: { ko: "치킨으로. 여기서.", en: "Chicken. For here.", es: "Pollo. Aquí." } },
    ],
    indonesian: [
      { type: "speak", sentence: "Saya suka pizza. Kamu suka makanan apa?", speechLang: "id-ID", meaning: { ko: "피자 좋아해요. 뭘?", en: "I like pizza. You?", es: "Me gusta pizza. ¿Y tú?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Apakah kamu ___?", answer: "lapar", options: ["lapar", "haus", "kenyang"], fullSentence: "Apakah kamu lapar?", fullSentenceMeaning: { ko: "배고프세요?", en: "Hungry?", es: "¿Hambre?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Boleh saya minta menu?", speechLang: "id-ID", meaning: { ko: "메뉴판 주세요.", en: "Menu, please.", es: "¿El menú?" } },
      { type: "fill_blank", promptWithBlank: "Saya ___ kopi, tolong.", answer: "mau", options: ["mau", "ada", "pergi"], fullSentence: "Saya mau kopi, tolong.", fullSentenceMeaning: { ko: "커피 주세요.", en: "A coffee, please.", es: "Un café, por favor." } },
      { type: "speak", sentence: "Saya pesan ayam, tolong. Makan di sini.", speechLang: "id-ID", meaning: { ko: "치킨으로. 여기서.", en: "Chicken. For here.", es: "Pollo. Aquí." } },
    ],
    arabic: [
      { type: "speak", sentence: "أنا أُحِبّ البيتزا. ماذا تُحِبّ مِنَ الطَّعام؟ (anā uḥibb al-bītzā. māḏā tuḥibb mina ṭ-ṭaʿām?)", speechLang: "ar-EG", meaning: { ko: "피자 좋아해요. 뭘?", en: "I like pizza. You?", es: "Me gusta pizza. ¿Y tú?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "هَلْ أَنْتَ ___؟", answer: "جائِع", options: ["جائِع", "عَطْشان", "شَبْعان"], fullSentence: "هَلْ أَنْتَ جائِع؟", fullSentenceMeaning: { ko: "배고프세요?", en: "Hungry?", es: "¿Hambre?" }, isYesterdayReview: true },
      { type: "speak", sentence: "مُمْكِن القائِمة لَوْ سَمَحْت؟ (mumkin al-qāʾima law samaḥt?)", speechLang: "ar-EG", meaning: { ko: "메뉴판 주세요.", en: "Menu, please.", es: "¿El menú?" } },
      { type: "fill_blank", promptWithBlank: "___ قَهْوة، لَوْ سَمَحْت.", answer: "أُريد", options: ["أُريد", "عِنْدي", "ذاهِب"], fullSentence: "أُريد قَهْوة، لَوْ سَمَحْت.", fullSentenceMeaning: { ko: "커피 주세요.", en: "A coffee, please.", es: "Un café, por favor." } },
      { type: "speak", sentence: "سَآخُذ الدَّجاج، لَوْ سَمَحْت. هُنا. (saʾākhuḏ ad-dajāj, law samaḥt. hunā)", speechLang: "ar-EG", meaning: { ko: "치킨으로. 여기서.", en: "Chicken. For here.", es: "Pollo. Aquí." } },
    ],
  },

  day_15: {
    english: [
      { type: "speak", sentence: "I'd like a coffee and the chicken, please.", speechLang: "en-GB", meaning: { ko: "커피 한 잔이랑 치킨 주세요.", en: "Coffee and chicken, please.", es: "Café y pollo, por favor." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "For here or to ___?", answer: "go", options: ["go", "take", "leave"], fullSentence: "For here or to go?", fullSentenceMeaning: { ko: "여기서 드실 건가요, 가져가실 건가요?", en: "For here or to go?", es: "¿Para aquí o para llevar?" }, isYesterdayReview: true },
      { type: "speak", sentence: "How much is this? That's too expensive!", speechLang: "en-GB", meaning: { ko: "이거 얼마예요? 너무 비싸요!", en: "How much? Too expensive!", es: "¿Cuánto? ¡Muy caro!" } },
      { type: "fill_blank", promptWithBlank: "Can I pay by ___?", answer: "card", options: ["card", "money", "cash"], fullSentence: "Can I pay by card?", fullSentenceMeaning: { ko: "카드로 결제할 수 있어요?", en: "Can I pay by card?", es: "¿Puedo pagar con tarjeta?" } },
      { type: "speak", sentence: "The bill, please. Thank you!", speechLang: "en-GB", meaning: { ko: "계산서 주세요. 감사합니다!", en: "The bill, please. Thanks!", es: "La cuenta, por favor. ¡Gracias!" } },
      { type: "speak", sentence: "Sorry, I don't understand.", speechLang: "en-GB", meaning: { ko: "죄송해요, 이해가 안 돼요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, isYesterdayReview: true },
      { type: "speak", sentence: "Can you say that again, please?", speechLang: "en-GB", meaning: { ko: "다시 한 번 말해 주세요.", en: "Can you say that again, please?", es: "¿Puede repetirlo, por favor?" }, isYesterdayReview: true },
    ],
    spanish: [
      { type: "speak", sentence: "Quiero un café y el pollo, por favor.", speechLang: "es-ES", meaning: { ko: "커피랑 치킨 주세요.", en: "Coffee and chicken, please.", es: "Café y pollo, por favor." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿Para aquí o para ___?", answer: "llevar", options: ["llevar", "ir", "salir"], fullSentence: "¿Para aquí o para llevar?", fullSentenceMeaning: { ko: "여기서? 포장?", en: "Here or to go?", es: "¿Aquí o para llevar?" }, isYesterdayReview: true },
      { type: "speak", sentence: "¿Cuánto cuesta esto? ¡Muy caro!", speechLang: "es-ES", meaning: { ko: "얼마예요? 비싸요!", en: "How much? Expensive!", es: "¿Cuánto? ¡Caro!" } },
      { type: "fill_blank", promptWithBlank: "¿Puedo ___ con tarjeta?", answer: "pagar", options: ["pagar", "tener", "dar"], fullSentence: "¿Puedo pagar con tarjeta?", fullSentenceMeaning: { ko: "카드로요?", en: "Card?", es: "¿Tarjeta?" } },
      { type: "speak", sentence: "La cuenta, por favor. ¡Gracias!", speechLang: "es-ES", meaning: { ko: "계산서요. 감사합니다!", en: "The bill. Thanks!", es: "La cuenta. ¡Gracias!" } },
      { type: "speak", sentence: "Lo siento, no entiendo.", speechLang: "es-ES", meaning: { ko: "죄송해요, 이해가 안 돼요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, isYesterdayReview: true },
      { type: "speak", sentence: "¿Puede repetirlo, por favor?", speechLang: "es-ES", meaning: { ko: "다시 한 번 말해 주세요.", en: "Can you say that again, please?", es: "¿Puede repetirlo, por favor?" }, isYesterdayReview: true },
    ],
    korean: [
      { type: "speak", sentence: "커피 한 잔이랑 치킨 주세요.", speechLang: "ko-KR", meaning: { ko: "커피랑 치킨 주세요.", en: "Coffee and chicken, please.", es: "Café y pollo, por favor." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "여기서 드실 건가요, ___인가요?", answer: "포장", options: ["포장", "배달", "가게"], fullSentence: "여기서 드실 건가요, 포장인가요?", fullSentenceMeaning: { ko: "여기서? 포장?", en: "Here or to go?", es: "¿Aquí o para llevar?" }, isYesterdayReview: true },
      { type: "speak", sentence: "이거 얼마예요? 너무 비싸요!", speechLang: "ko-KR", meaning: { ko: "얼마? 비싸요!", en: "How much? Expensive!", es: "¿Cuánto? ¡Caro!" } },
      { type: "fill_blank", promptWithBlank: "카드___ 결제할 수 있어요?", answer: "로", options: ["로", "에", "을"], fullSentence: "카드로 결제할 수 있어요?", fullSentenceMeaning: { ko: "카드로요?", en: "Card?", es: "¿Tarjeta?" } },
      { type: "speak", sentence: "계산서 주세요. 감사합니다!", speechLang: "ko-KR", meaning: { ko: "계산서요. 감사!", en: "Bill. Thanks!", es: "Cuenta. ¡Gracias!" } },
      { type: "speak", sentence: "죄송해요, 이해가 안 돼요.", speechLang: "ko-KR", meaning: { ko: "죄송해요, 이해가 안 돼요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, isYesterdayReview: true },
      { type: "speak", sentence: "다시 한 번 말해 주세요.", speechLang: "ko-KR", meaning: { ko: "다시 한 번 말해 주세요.", en: "Can you say that again, please?", es: "¿Puede repetirlo, por favor?" }, isYesterdayReview: true },
    ],
    indonesian: [
      { type: "speak", sentence: "Saya mau kopi dan ayam, tolong.", speechLang: "id-ID", meaning: { ko: "커피랑 치킨 주세요.", en: "Coffee and chicken, please.", es: "Café y pollo, por favor." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Makan di sini atau bawa ___?", answer: "pulang", options: ["pulang", "pergi", "keluar"], fullSentence: "Makan di sini atau bawa pulang?", fullSentenceMeaning: { ko: "여기서? 포장?", en: "Here or to go?", es: "¿Aquí o para llevar?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Ini berapa harganya? Itu terlalu mahal!", speechLang: "id-ID", meaning: { ko: "얼마? 비싸요!", en: "How much? Expensive!", es: "¿Cuánto? ¡Caro!" } },
      { type: "fill_blank", promptWithBlank: "Boleh saya ___ dengan kartu?", answer: "bayar", options: ["bayar", "minta", "ada"], fullSentence: "Boleh saya bayar dengan kartu?", fullSentenceMeaning: { ko: "카드로요?", en: "Card?", es: "¿Tarjeta?" } },
      { type: "speak", sentence: "Minta bonnya, tolong. Terima kasih!", speechLang: "id-ID", meaning: { ko: "계산서요. 감사!", en: "Bill. Thanks!", es: "Cuenta. ¡Gracias!" } },
      { type: "speak", sentence: "Maaf, saya tidak mengerti.", speechLang: "id-ID", meaning: { ko: "죄송해요, 이해가 안 돼요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, isYesterdayReview: true },
      { type: "speak", sentence: "Bisa tolong ulangi?", speechLang: "id-ID", meaning: { ko: "다시 한 번 말해 주세요.", en: "Can you say that again, please?", es: "¿Puede repetirlo, por favor?" }, isYesterdayReview: true },
    ],
    arabic: [
      { type: "speak", sentence: "أُريد قَهْوة ودَجاج، لَوْ سَمَحْت. (urīd qahwa wa-dajāj, law samaḥt)", speechLang: "ar-EG", meaning: { ko: "커피랑 치킨 주세요.", en: "Coffee and chicken, please.", es: "Café y pollo, por favor." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "هُنا أَمْ ___؟", answer: "سَفَرِيّ", options: ["سَفَرِيّ", "ذاهِب", "خارِج"], fullSentence: "هُنا أَمْ سَفَرِيّ؟", fullSentenceMeaning: { ko: "여기서? 포장?", en: "Here or to go?", es: "¿Aquí o para llevar?" }, isYesterdayReview: true },
      { type: "speak", sentence: "هٰذا بِكَمْ؟ هٰذا غالي جِدًّا! (hāḏā bikam? hāḏā ghālī jiddan!)", speechLang: "ar-EG", meaning: { ko: "얼마? 비싸요!", en: "How much? Expensive!", es: "¿Cuánto? ¡Caro!" } },
      { type: "fill_blank", promptWithBlank: "مُمْكِن أَدْفَع ___؟", answer: "بِالبِطاقة", options: ["بِالبِطاقة", "في البِطاقة", "لِلْبِطاقة"], fullSentence: "مُمْكِن أَدْفَع بِالبِطاقة؟", fullSentenceMeaning: { ko: "카드로요?", en: "Card?", es: "¿Tarjeta?" } },
      { type: "speak", sentence: "الحِساب، لَوْ سَمَحْت. شُكْرًا! (al-ḥisāb, law samaḥt. shukran!)", speechLang: "ar-EG", meaning: { ko: "계산서요. 감사!", en: "Bill. Thanks!", es: "Cuenta. ¡Gracias!" } },
      { type: "speak", sentence: "آسِف، أنا لا أَفْهَم. (āsif, anā lā afham)", speechLang: "ar-EG", meaning: { ko: "죄송해요, 이해가 안 돼요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, isYesterdayReview: true },
      { type: "speak", sentence: "مُمْكِن تُعيد ثانِيةً؟ (mumkin tuʿīd thāniyatan?)", speechLang: "ar-EG", meaning: { ko: "다시 한 번 말해 주세요.", en: "Can you say that again, please?", es: "¿Puede repetirlo, por favor?" }, isYesterdayReview: true },
    ],
  },

  day_16: {
    english: [
      { type: "speak", sentence: "How much is this? It's ten dollars.", speechLang: "en-GB", meaning: { ko: "이거 얼마예요? 10달러예요.", en: "How much? Ten dollars.", es: "¿Cuánto? Diez dólares." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "The ___, please.", answer: "bill", options: ["bill", "food", "menu"], fullSentence: "The bill, please.", fullSentenceMeaning: { ko: "계산서 주세요.", en: "The bill, please.", es: "La cuenta, por favor." }, isYesterdayReview: true },
      { type: "speak", sentence: "This is delicious! It's very good.", speechLang: "en-GB", meaning: { ko: "맛있어요! 정말 맛있어요.", en: "Delicious! Very good.", es: "¡Delicioso! Muy bueno." } },
      { type: "fill_blank", promptWithBlank: "It's too ___.", answer: "salty", options: ["salty", "salt", "spicy"], fullSentence: "It's too salty.", fullSentenceMeaning: { ko: "너무 짜요.", en: "Too salty.", es: "Muy salado." } },
      { type: "speak", sentence: "I'm full. Thank you!", speechLang: "en-GB", meaning: { ko: "배불러요. 감사합니다!", en: "I'm full. Thanks!", es: "Estoy lleno. ¡Gracias!" } },
    ],
    spanish: [
      { type: "speak", sentence: "¿Cuánto cuesta esto? Son diez dólares.", speechLang: "es-ES", meaning: { ko: "얼마예요? 10달러.", en: "How much? Ten dollars.", es: "¿Cuánto? Diez dólares." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "La ___, por favor.", answer: "cuenta", options: ["cuenta", "comida", "mesa"], fullSentence: "La cuenta, por favor.", fullSentenceMeaning: { ko: "계산서 주세요.", en: "The bill, please.", es: "La cuenta, por favor." }, isYesterdayReview: true },
      { type: "speak", sentence: "¡Esto está delicioso! Está muy bueno.", speechLang: "es-ES", meaning: { ko: "맛있어요! 정말!", en: "Delicious! Very good.", es: "¡Delicioso! Muy bueno." } },
      { type: "fill_blank", promptWithBlank: "Está muy ___.", answer: "salado", options: ["salado", "sal", "picante"], fullSentence: "Está muy salado.", fullSentenceMeaning: { ko: "너무 짜요.", en: "Too salty.", es: "Muy salado." } },
      { type: "speak", sentence: "Estoy lleno. ¡Gracias!", speechLang: "es-ES", meaning: { ko: "배불러요. 감사!", en: "I'm full. Thanks!", es: "Lleno. ¡Gracias!" } },
    ],
    korean: [
      { type: "speak", sentence: "이거 얼마예요? 만 원이에요.", speechLang: "ko-KR", meaning: { ko: "얼마? 만 원.", en: "How much? 10,000 won.", es: "¿Cuánto? 10.000 won." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "___ 주세요.", answer: "계산서", options: ["계산서", "메뉴판", "물"], fullSentence: "계산서 주세요.", fullSentenceMeaning: { ko: "계산서 주세요.", en: "The bill.", es: "La cuenta." }, isYesterdayReview: true },
      { type: "speak", sentence: "이거 맛있어요! 정말 맛있어요.", speechLang: "ko-KR", meaning: { ko: "맛있어요! 정말!", en: "Delicious! Really!", es: "¡Delicioso! ¡De verdad!" } },
      { type: "fill_blank", promptWithBlank: "너무 ___요.", answer: "짜", options: ["짜", "싸", "달아"], fullSentence: "너무 짜요.", fullSentenceMeaning: { ko: "너무 짜요.", en: "Too salty.", es: "Muy salado." } },
      { type: "speak", sentence: "배불러요. 감사합니다!", speechLang: "ko-KR", meaning: { ko: "배불러요. 감사!", en: "Full. Thanks!", es: "Lleno. ¡Gracias!" } },
    ],
    indonesian: [
      { type: "speak", sentence: "Ini berapa harganya? Harganya sepuluh dolar.", speechLang: "id-ID", meaning: { ko: "얼마예요? 10달러.", en: "How much? Ten dollars.", es: "¿Cuánto? Diez dólares." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Minta ___, tolong.", answer: "bonnya", options: ["bonnya", "menunya", "airnya"], fullSentence: "Minta bonnya, tolong.", fullSentenceMeaning: { ko: "계산서 주세요.", en: "The bill, please.", es: "La cuenta, por favor." }, isYesterdayReview: true },
      { type: "speak", sentence: "Ini enak sekali! Ini sangat enak.", speechLang: "id-ID", meaning: { ko: "맛있어요! 정말 맛있어요.", en: "Delicious! Very good.", es: "¡Delicioso! Muy bueno." } },
      { type: "fill_blank", promptWithBlank: "Ini terlalu ___.", answer: "asin", options: ["asin", "garam", "pedas"], fullSentence: "Ini terlalu asin.", fullSentenceMeaning: { ko: "너무 짜요.", en: "Too salty.", es: "Muy salado." } },
      { type: "speak", sentence: "Saya kenyang. Terima kasih!", speechLang: "id-ID", meaning: { ko: "배불러요. 감사!", en: "Full. Thanks!", es: "Lleno. ¡Gracias!" } },
    ],
    arabic: [
      { type: "speak", sentence: "هٰذا بِكَمْ؟ بِعَشَرة دولار. (hāḏā bikam? bi-ʿashara dūlār)", speechLang: "ar-EG", meaning: { ko: "얼마예요? 10달러.", en: "How much? Ten dollars.", es: "¿Cuánto? Diez dólares." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "___، لَوْ سَمَحْت.", answer: "الحِساب", options: ["الحِساب", "القائِمة", "الماء"], fullSentence: "الحِساب، لَوْ سَمَحْت.", fullSentenceMeaning: { ko: "계산서 주세요.", en: "The bill, please.", es: "La cuenta, por favor." }, isYesterdayReview: true },
      { type: "speak", sentence: "هٰذا لَذيذ جِدًّا! هٰذا حُلْو جِدًّا. (hāḏā laḏīḏ jiddan! hāḏā ḥulw jiddan)", speechLang: "ar-EG", meaning: { ko: "맛있어요! 정말 맛있어요.", en: "Delicious! Very good.", es: "¡Delicioso! Muy bueno." } },
      { type: "fill_blank", promptWithBlank: "هٰذا ___ جِدًّا.", answer: "مالِح", options: ["مالِح", "مِلْح", "حارّ"], fullSentence: "هٰذا مالِح جِدًّا.", fullSentenceMeaning: { ko: "너무 짜요.", en: "Too salty.", es: "Muy salado." } },
      { type: "speak", sentence: "أنا شَبْعان. شُكْرًا! (anā shabʿān. shukran!)", speechLang: "ar-EG", meaning: { ko: "배불러요. 감사!", en: "Full. Thanks!", es: "Lleno. ¡Gracias!" } },
    ],
  },

  day_17: {
    english: [
      { type: "speak", sentence: "This is delicious! It's very good.", speechLang: "en-GB", meaning: { ko: "맛있어요! 정말 좋아요.", en: "Delicious! Very good.", es: "¡Delicioso! Muy bueno." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "I'm ___. Thank you!", answer: "full", options: ["full", "hungry", "good"], fullSentence: "I'm full. Thank you!", fullSentenceMeaning: { ko: "배불러요. 감사합니다!", en: "I'm full. Thanks!", es: "Estoy lleno. ¡Gracias!" }, isYesterdayReview: true },
      { type: "speak", sentence: "I recommend the steak. You should try it.", speechLang: "en-GB", meaning: { ko: "스테이크를 추천해요. 드셔보세요.", en: "I recommend the steak. Try it.", es: "Recomiendo el bistec. Pruébalo." } },
      { type: "fill_blank", promptWithBlank: "What do you ___?", answer: "recommend", options: ["recommend", "want", "like"], fullSentence: "What do you recommend?", fullSentenceMeaning: { ko: "뭘 추천하세요?", en: "What do you recommend?", es: "¿Qué recomiendas?" } },
      { type: "speak", sentence: "The salad is fresh. Let's eat together!", speechLang: "en-GB", meaning: { ko: "샐러드가 신선해요. 같이 먹어요!", en: "Salad is fresh. Let's eat!", es: "Ensalada fresca. ¡Comamos!" } },
    ],
    spanish: [
      { type: "speak", sentence: "¡Está delicioso! Está muy bueno.", speechLang: "es-ES", meaning: { ko: "맛있어요! 정말!", en: "Delicious! Very good.", es: "¡Delicioso! Muy bueno." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Estoy ___. ¡Gracias!", answer: "lleno", options: ["lleno", "hambre", "bueno"], fullSentence: "Estoy lleno. ¡Gracias!", fullSentenceMeaning: { ko: "배불러요. 감사!", en: "Full. Thanks!", es: "Lleno. ¡Gracias!" }, isYesterdayReview: true },
      { type: "speak", sentence: "Recomiendo el bistec. Deberías probarlo.", speechLang: "es-ES", meaning: { ko: "스테이크 추천. 드셔보세요.", en: "I recommend the steak. Try it.", es: "Recomiendo el bistec. Pruébalo." } },
      { type: "fill_blank", promptWithBlank: "¿Qué ___?", answer: "recomiendas", options: ["recomiendas", "quieres", "tienes"], fullSentence: "¿Qué recomiendas?", fullSentenceMeaning: { ko: "뭘 추천하세요?", en: "What do you recommend?", es: "¿Qué recomiendas?" } },
      { type: "speak", sentence: "La ensalada está fresca. ¡Comamos juntos!", speechLang: "es-ES", meaning: { ko: "샐러드 신선. 같이 먹어요!", en: "Salad is fresh. Let's eat!", es: "Ensalada fresca. ¡Comamos!" } },
    ],
    korean: [
      { type: "speak", sentence: "이거 맛있어요! 정말 맛있어요.", speechLang: "ko-KR", meaning: { ko: "맛있어요! 정말!", en: "Delicious! Really!", es: "¡Delicioso!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "___러요. 감사합니다!", answer: "배불", options: ["배불", "배고", "기쁘"], fullSentence: "배불러요. 감사합니다!", fullSentenceMeaning: { ko: "배불러요. 감사!", en: "Full. Thanks!", es: "Lleno. ¡Gracias!" }, isYesterdayReview: true },
      { type: "speak", sentence: "스테이크를 추천해요. 드셔보세요.", speechLang: "ko-KR", meaning: { ko: "스테이크 추천. 드셔보세요.", en: "Steak. Try it.", es: "Bistec. Pruébalo." } },
      { type: "fill_blank", promptWithBlank: "뭘 ___하세요?", answer: "추천", options: ["추천", "주문", "좋아"], fullSentence: "뭘 추천하세요?", fullSentenceMeaning: { ko: "뭘 추천하세요?", en: "What do you recommend?", es: "¿Qué recomiendas?" } },
      { type: "speak", sentence: "샐러드가 신선해요. 같이 먹어요!", speechLang: "ko-KR", meaning: { ko: "샐러드 신선. 같이!", en: "Salad fresh. Let's eat!", es: "Ensalada fresca. ¡Comamos!" } },
    ],
    indonesian: [
      { type: "speak", sentence: "Ini enak sekali! Ini sangat enak.", speechLang: "id-ID", meaning: { ko: "맛있어요! 정말 좋아요.", en: "Delicious! Very good.", es: "¡Delicioso! Muy bueno." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Saya ___. Terima kasih!", answer: "kenyang", options: ["kenyang", "lapar", "enak"], fullSentence: "Saya kenyang. Terima kasih!", fullSentenceMeaning: { ko: "배불러요. 감사합니다!", en: "I'm full. Thanks!", es: "Estoy lleno. ¡Gracias!" }, isYesterdayReview: true },
      { type: "speak", sentence: "Saya merekomendasikan steak. Kamu harus coba.", speechLang: "id-ID", meaning: { ko: "스테이크 추천. 드셔보세요.", en: "I recommend the steak. Try it.", es: "Recomiendo el bistec. Pruébalo." } },
      { type: "fill_blank", promptWithBlank: "Apa yang kamu ___?", answer: "rekomendasikan", options: ["rekomendasikan", "mau", "suka"], fullSentence: "Apa yang kamu rekomendasikan?", fullSentenceMeaning: { ko: "뭘 추천하세요?", en: "What do you recommend?", es: "¿Qué recomiendas?" } },
      { type: "speak", sentence: "Saladnya segar. Ayo makan bersama!", speechLang: "id-ID", meaning: { ko: "샐러드 신선. 같이!", en: "Salad fresh. Let's eat!", es: "Ensalada fresca. ¡Comamos!" } },
    ],
    arabic: [
      { type: "speak", sentence: "هٰذا لَذيذ جِدًّا! هٰذا حُلْو جِدًّا. (hāḏā laḏīḏ jiddan! hāḏā ḥulw jiddan)", speechLang: "ar-EG", meaning: { ko: "맛있어요! 정말!", en: "Delicious! Very good.", es: "¡Delicioso!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "أنا ___. شُكْرًا!", answer: "شَبْعان", options: ["شَبْعان", "جائِع", "لَذيذ"], fullSentence: "أنا شَبْعان. شُكْرًا!", fullSentenceMeaning: { ko: "배불러요. 감사!", en: "Full. Thanks!", es: "Lleno. ¡Gracias!" }, isYesterdayReview: true },
      { type: "speak", sentence: "أنا أُرَشِّح السِّتيك. يَجِبُ أَنْ تُجَرِّبَه. (anā urashshiḥ as-sitēk. yajibu an tujarribahu)", speechLang: "ar-EG", meaning: { ko: "스테이크 추천. 드셔보세요.", en: "I recommend the steak. Try it.", es: "Recomiendo el bistec. Pruébalo." } },
      { type: "fill_blank", promptWithBlank: "ماذا ___؟", answer: "تُرَشِّح", options: ["تُرَشِّح", "تُريد", "تُحِبّ"], fullSentence: "ماذا تُرَشِّح؟", fullSentenceMeaning: { ko: "뭘 추천하세요?", en: "What do you recommend?", es: "¿Qué recomiendas?" } },
      { type: "speak", sentence: "السَّلَطة طازَجة. هَيّا نَأْكُل مَعًا! (as-salaṭa ṭāzaja. hayyā naʾkul maʿan!)", speechLang: "ar-EG", meaning: { ko: "샐러드 신선. 같이!", en: "Salad fresh. Let's eat!", es: "Ensalada fresca. ¡Comamos!" } },
    ],
  },

  day_18: {
    english: [
      { type: "speak", sentence: "I like pizza. I'd like a coffee, please.", speechLang: "en-GB", meaning: { ko: "피자 좋아해요. 커피 한 잔 주세요.", en: "I like pizza. Coffee, please.", es: "Me gusta pizza. Café, por favor." } },
      { type: "speak", sentence: "How much is this? Can I pay by card?", speechLang: "en-GB", meaning: { ko: "이거 얼마예요? 카드로요?", en: "How much? Card?", es: "¿Cuánto? ¿Tarjeta?" } },
      { type: "speak", sentence: "This is delicious! I recommend the steak.", speechLang: "en-GB", meaning: { ko: "맛있어요! 스테이크 추천해요.", en: "Delicious! I recommend steak.", es: "¡Delicioso! Recomiendo bistec." } },
      { type: "speak", sentence: "You should try the soup. The salad is very fresh.", speechLang: "en-GB", meaning: { ko: "수프 드셔보세요. 샐러드가 신선해요.", en: "Try the soup. Salad is fresh.", es: "Prueba la sopa. Ensalada fresca." } },
      { type: "speak", sentence: "I'm full. Thank you! Goodbye, see you tomorrow!", speechLang: "en-GB", meaning: { ko: "배불러요. 감사합니다! 내일 봐요!", en: "Full. Thanks! Bye, see you tomorrow!", es: "Lleno. ¡Gracias! ¡Adiós, hasta mañana!" } },
    ],
    spanish: [
      { type: "speak", sentence: "Me gusta la pizza. Quiero un café, por favor.", speechLang: "es-ES", meaning: { ko: "피자 좋아해요. 커피 주세요.", en: "I like pizza. Coffee, please.", es: "Me gusta pizza. Café, por favor." } },
      { type: "speak", sentence: "¿Cuánto cuesta esto? ¿Puedo pagar con tarjeta?", speechLang: "es-ES", meaning: { ko: "얼마? 카드로?", en: "How much? Card?", es: "¿Cuánto? ¿Tarjeta?" } },
      { type: "speak", sentence: "¡Está delicioso! Recomiendo el bistec.", speechLang: "es-ES", meaning: { ko: "맛있어요! 스테이크 추천.", en: "Delicious! I recommend steak.", es: "¡Delicioso! Recomiendo bistec." } },
      { type: "speak", sentence: "Deberías probar la sopa. La ensalada está muy fresca.", speechLang: "es-ES", meaning: { ko: "수프 드셔보세요. 샐러드 신선.", en: "Try soup. Salad is fresh.", es: "Prueba la sopa. Ensalada fresca." } },
      { type: "speak", sentence: "Estoy lleno. ¡Gracias! ¡Adiós, hasta mañana!", speechLang: "es-ES", meaning: { ko: "배불러요. 감사! 내일 봐요!", en: "Full. Thanks! Bye, tomorrow!", es: "Lleno. ¡Gracias! ¡Adiós!" } },
    ],
    korean: [
      { type: "speak", sentence: "피자를 좋아해요. 커피 한 잔 주세요.", speechLang: "ko-KR", meaning: { ko: "피자 좋아해요. 커피 주세요.", en: "I like pizza. Coffee, please.", es: "Pizza. Café, por favor." } },
      { type: "speak", sentence: "이거 얼마예요? 카드로 결제할 수 있어요?", speechLang: "ko-KR", meaning: { ko: "얼마? 카드로?", en: "How much? Card?", es: "¿Cuánto? ¿Tarjeta?" } },
      { type: "speak", sentence: "이거 맛있어요! 스테이크를 추천해요.", speechLang: "ko-KR", meaning: { ko: "맛있어요! 스테이크 추천.", en: "Delicious! Steak.", es: "¡Delicioso! Bistec." } },
      { type: "speak", sentence: "수프를 드셔보세요. 샐러드가 아주 신선해요.", speechLang: "ko-KR", meaning: { ko: "수프요. 샐러드 신선.", en: "Try soup. Salad is fresh.", es: "Sopa. Ensalada fresca." } },
      { type: "speak", sentence: "배불러요. 감사합니다! 안녕히 계세요, 내일 봐요!", speechLang: "ko-KR", meaning: { ko: "배불러요. 감사! 내일 봐요!", en: "Full. Thanks! See you!", es: "Lleno. ¡Gracias! ¡Hasta mañana!" } },
    ],
    indonesian: [
      { type: "speak", sentence: "Saya suka pizza. Saya mau kopi, tolong.", speechLang: "id-ID", meaning: { ko: "피자 좋아해요. 커피 한 잔 주세요.", en: "I like pizza. Coffee, please.", es: "Me gusta pizza. Café, por favor." } },
      { type: "speak", sentence: "Ini berapa harganya? Boleh saya bayar dengan kartu?", speechLang: "id-ID", meaning: { ko: "이거 얼마예요? 카드로요?", en: "How much? Card?", es: "¿Cuánto? ¿Tarjeta?" } },
      { type: "speak", sentence: "Ini enak sekali! Saya merekomendasikan steak.", speechLang: "id-ID", meaning: { ko: "맛있어요! 스테이크 추천해요.", en: "Delicious! I recommend steak.", es: "¡Delicioso! Recomiendo bistec." } },
      { type: "speak", sentence: "Kamu harus coba supnya. Saladnya sangat segar.", speechLang: "id-ID", meaning: { ko: "수프 드셔보세요. 샐러드가 신선해요.", en: "Try the soup. Salad is fresh.", es: "Prueba la sopa. Ensalada fresca." } },
      { type: "speak", sentence: "Saya kenyang. Terima kasih! Sampai jumpa besok!", speechLang: "id-ID", meaning: { ko: "배불러요. 감사합니다! 내일 봐요!", en: "Full. Thanks! See you tomorrow!", es: "Lleno. ¡Gracias! ¡Hasta mañana!" } },
    ],
    arabic: [
      { type: "speak", sentence: "أنا أُحِبّ البيتزا. أُريد قَهْوة، لَوْ سَمَحْت. (anā uḥibb al-bītzā. urīd qahwa, law samaḥt)", speechLang: "ar-EG", meaning: { ko: "피자 좋아해요. 커피 한 잔 주세요.", en: "I like pizza. Coffee, please.", es: "Me gusta pizza. Café, por favor." } },
      { type: "speak", sentence: "هٰذا بِكَمْ؟ مُمْكِن أَدْفَع بِالبِطاقة؟ (hāḏā bikam? mumkin adfaʿ bil-biṭāqa?)", speechLang: "ar-EG", meaning: { ko: "이거 얼마예요? 카드로요?", en: "How much? Card?", es: "¿Cuánto? ¿Tarjeta?" } },
      { type: "speak", sentence: "هٰذا لَذيذ جِدًّا! أنا أُرَشِّح السِّتيك. (hāḏā laḏīḏ jiddan! anā urashshiḥ as-sitēk)", speechLang: "ar-EG", meaning: { ko: "맛있어요! 스테이크 추천해요.", en: "Delicious! I recommend steak.", es: "¡Delicioso! Recomiendo bistec." } },
      { type: "speak", sentence: "يَجِبُ أَنْ تُجَرِّب الحَساء. السَّلَطة طازَجة جِدًّا. (yajibu an tujarrib al-ḥasāʾ. as-salaṭa ṭāzaja jiddan)", speechLang: "ar-EG", meaning: { ko: "수프 드셔보세요. 샐러드가 신선해요.", en: "Try the soup. Salad is fresh.", es: "Prueba la sopa. Ensalada fresca." } },
      { type: "speak", sentence: "أنا شَبْعان. شُكْرًا! مَعَ السَّلامة، أَراكَ غَدًا! (anā shabʿān. shukran! maʿa s-salāma, arāka ghadan!)", speechLang: "ar-EG", meaning: { ko: "배불러요. 감사합니다! 내일 봐요!", en: "Full. Thanks! See you tomorrow!", es: "Lleno. ¡Gracias! ¡Hasta mañana!" } },
    ],
  },
};
