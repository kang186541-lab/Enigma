/**
 * Day 5-6 v2 Partial (A1 Unit 1: Greetings & Self-Introduction)
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

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1 + STEP 2 (LESSON_CONTENT)
// ═══════════════════════════════════════════════════════════════════════════════

export const LESSON_CONTENT_V2_D5_6: Record<string, Partial<Record<LearningLangKey, DayLessonData>>> = {

  // ─────────────── Day 5: Feelings & Basic Needs ───────────────
  day_5: {
    english: {
      step1Sentences: [
        { text: "I'm hungry.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "배가 고파요.", en: "I'm hungry.", es: "Tengo hambre." } },
        { text: "I'm tired.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "피곤해요.", en: "I'm tired.", es: "Estoy cansado." } },
        { text: "I'm happy to be here!", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "여기 와서 기뻐요!", en: "I'm happy to be here!", es: "¡Estoy feliz de estar aquí!" } },
        { text: "I need water, please.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "물 좀 주세요.", en: "I need water, please.", es: "Necesito agua, por favor." } },
        { text: "I want coffee.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "커피 마시고 싶어요.", en: "I want coffee.", es: "Quiero café." } },
        { text: "Sorry, I don't understand.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "기분을 말할 때는 'I'm ___'을 써요. 'I'm hungry'(배고파요), 'I'm tired'(피곤해요), 'I'm happy'(행복해요) — 전부 같은 패턴이에요! 뭔가 필요하면 'I need ___', 갖고 싶으면 'I want ___'이라고 해요. 영어에서는 배고픈 것도 감정처럼 'I'm hungry'라고 하는데, 스페인어에서는 'Tengo hambre'(배고픔을 가지고 있다)라고 해요. 언어마다 다르죠!", en: "To express feelings, just say 'I'm ___' — hungry, tired, happy, it all works the same way! Need something? 'I need ___.' Want something? 'I want ___.' Notice how English treats hunger as a feeling ('I'm hungry'), while Spanish treats it as something you have ('Tengo hambre' = I have hunger). Different languages, different logic!", es: "Para expresar sentimientos en inglés, usa 'I'm ___' — hungry, tired, happy, todo funciona igual. ¿Necesitas algo? 'I need ___.' ¿Quieres algo? 'I want ___.' Nota que en inglés el hambre es un sentimiento ('I'm hungry'), mientras que en español es algo que tienes ('Tengo hambre'). ¡Diferente lógica!" },
          examples: { ko: "I'm hungry. (배고파요.)\nI'm tired. (피곤해요.)\nI need water, please. (물 좀 주세요.)\nI want coffee. (커피 마시고 싶어요.)", en: "I'm hungry. (Expressing a physical feeling.)\nI'm happy to be here! (Expressing an emotion.)\nI need water, please. (Asking for something you need.)\nI want coffee. (Saying what you'd like.)", es: "I'm hungry. (Tengo hambre.)\nI'm tired. (Estoy cansado/a.)\nI need water, please. (Necesito agua, por favor.)\nI want coffee. (Quiero café.)" },
          mistakes: { ko: "❌ I'm hunger.\n✅ I'm hungry. ('hunger'는 명사, 'hungry'가 형용사예요!)\n❌ I want to coffee.\n✅ I want coffee. (want 다음에 바로 명사가 와요, 'to'는 필요 없어요)", en: "❌ I'm hunger.\n✅ I'm hungry. ('hunger' is a noun — you need the adjective 'hungry'!)\n❌ I need to water.\n✅ I need water, please. (Drop the 'to' — just 'I need' + the thing!)", es: "❌ I'm hunger.\n✅ I'm hungry. ('hunger' es sustantivo — necesitas el adjetivo 'hungry')\n❌ I want to coffee.\n✅ I want coffee. (Quita el 'to' — solo 'I want' + la cosa)" },
          rudyTip: { ko: "'I'm ___'이 기분 표현의 만능 열쇠야! hungry, tired, happy, thirsty — 뒤에 단어만 바꾸면 되니까 진짜 쉬워~", en: "'I'm ___' is your master key for feelings! Just swap the word after it — hungry, tired, happy, cold — and you can express almost anything!", es: "'I'm ___' es tu llave maestra para sentimientos. Solo cambia la palabra — hungry, tired, happy — ¡y puedes expresar casi todo!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "I'm ___.", answer: "hungry", options: ["hungry", "hunger", "hungrier"], fullSentence: "I'm hungry.", fullSentenceMeaning: { ko: "배가 고파요.", en: "I'm hungry.", es: "Tengo hambre." } },
          { type: "select", promptWithBlank: "I ___ water, please.", answer: "need", options: ["need", "want", "have"], fullSentence: "I need water, please.", fullSentenceMeaning: { ko: "물 좀 주세요.", en: "I need water, please.", es: "Necesito agua, por favor." } },
          { type: "select", promptWithBlank: "I ___ coffee.", answer: "want", options: ["want", "need", "like"], fullSentence: "I want coffee.", fullSentenceMeaning: { ko: "커피 마시고 싶어요.", en: "I want coffee.", es: "Quiero café." } },
          { type: "input", promptWithBlank: "I'm ___ to be here!", answer: "happy", fullSentence: "I'm happy to be here!", fullSentenceMeaning: { ko: "여기 와서 기뻐요!", en: "I'm happy to be here!", es: "¡Estoy feliz de estar aquí!" } },
          { type: "listening", audioText: "I need water, please.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["I need water, please.", "I want coffee.", "I'm hungry.", "I'm tired."], correct: 0, audioOnly: true },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Tengo hambre.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "배가 고파요.", en: "I'm hungry.", es: "Tengo hambre." } },
        { text: "Estoy cansado.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "피곤해요.", en: "I'm tired.", es: "Estoy cansado." } },
        { text: "¡Estoy feliz de estar aquí!", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "여기 와서 기뻐요!", en: "I'm happy to be here!", es: "¡Estoy feliz de estar aquí!" } },
        { text: "Necesito agua, por favor.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "물 좀 주세요.", en: "I need water, please.", es: "Necesito agua, por favor." } },
        { text: "Quiero café.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "커피 마시고 싶어요.", en: "I want coffee.", es: "Quiero café." } },
        { text: "Lo siento, no entiendo.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "스페인어에서는 기분에 따라 동사가 달라요! 일시적인 상태(피곤, 행복)는 'Estoy ___'를 쓰고, 배고프거나 목마른 건 'Tengo ___'(~을 가지고 있다)를 써요. 뭔가 필요하면 'Necesito ___', 원하면 'Quiero ___'. 영어에서는 전부 'I'm ___'인데 스페인어는 구분해야 해요. 헷갈려도 괜찮아요, 현지인들도 다 알아들어요!", en: "In Spanish, feelings use different verbs! Temporary states (tired, happy) use 'Estoy ___' (estar), but hunger and thirst use 'Tengo ___' (literally 'I have ___'). Need something? 'Necesito ___.' Want something? 'Quiero ___.' In English everything is 'I'm ___', but Spanish distinguishes — don't worry, context makes it clear!", es: "En español, los sentimientos usan verbos diferentes. Estados temporales (cansado, feliz) usan 'Estoy ___' (estar), pero hambre y sed usan 'Tengo ___' (literalmente 'tengo ___'). ¿Necesitas algo? 'Necesito ___.' ¿Quieres algo? 'Quiero ___.' Cada verbo tiene su lógica." },
          examples: { ko: "Tengo hambre. (배고파요. — 배고픔을 '가지고 있다'고 표현해요)\nEstoy cansado. (피곤해요. — 일시적인 상태라 estar를 써요)\nNecesito agua, por favor. (물 좀 주세요.)\nQuiero café. (커피 마시고 싶어요.)", en: "Tengo hambre. (I'm hungry — literally 'I have hunger'!)\nEstoy cansado. (I'm tired — using estar for temporary states.)\nNecesito agua, por favor. (I need water, please.)\nQuiero café. (I want coffee.)", es: "Tengo hambre. (Uso 'tener' para hambre y sed.)\nEstoy cansado. (Uso 'estar' para estados temporales.)\nNecesito agua, por favor. (Uso 'necesitar' para necesidades.)\nQuiero café. (Uso 'querer' para deseos.)" },
          mistakes: { ko: "❌ Estoy hambre.\n✅ Tengo hambre. (배고픔은 'Estoy'가 아니라 'Tengo'예요!)\n❌ Soy cansado.\n✅ Estoy cansado. (피곤은 일시적이라 'Soy'가 아니라 'Estoy'!)", en: "❌ Estoy hambre.\n✅ Tengo hambre. (Hunger uses 'Tengo', not 'Estoy'!)\n❌ Soy cansado.\n✅ Estoy cansado. (Tired is temporary — use 'Estoy', not 'Soy'!)", es: "❌ Estoy hambre.\n✅ Tengo hambre. (El hambre usa 'Tengo', no 'Estoy')\n❌ Soy cansado.\n✅ Estoy cansado. (Cansado es temporal — usa 'Estoy', no 'Soy')" },
          rudyTip: { ko: "'Tengo hambre'는 직역하면 '배고픔을 가지고 있다'야! 스페인어에서는 배고픔이나 갈증을 '소유'하는 거래. 재밌지?", en: "'Tengo hambre' literally means 'I have hunger' — in Spanish you don't feel hungry, you HAVE hunger! Once you get this logic, 'Tengo sed' (I have thirst) makes perfect sense too.", es: "'Tengo hambre' es literal — tienes el hambre. Igual con 'Tengo sed'. Una vez que entiendes esta lógica, todo tiene sentido." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ hambre.", answer: "Tengo", options: ["Tengo", "Estoy", "Soy"], fullSentence: "Tengo hambre.", fullSentenceMeaning: { ko: "배가 고파요.", en: "I'm hungry.", es: "Tengo hambre." } },
          { type: "select", promptWithBlank: "___ cansado.", answer: "Estoy", options: ["Estoy", "Tengo", "Soy"], fullSentence: "Estoy cansado.", fullSentenceMeaning: { ko: "피곤해요.", en: "I'm tired.", es: "Estoy cansado." } },
          { type: "select", promptWithBlank: "___ agua, por favor.", answer: "Necesito", options: ["Necesito", "Quiero", "Tengo"], fullSentence: "Necesito agua, por favor.", fullSentenceMeaning: { ko: "물 좀 주세요.", en: "I need water, please.", es: "Necesito agua, por favor." } },
          { type: "input", promptWithBlank: "___ café.", answer: "Quiero", fullSentence: "Quiero café.", fullSentenceMeaning: { ko: "커피 마시고 싶어요.", en: "I want coffee.", es: "Quiero café." } },
          { type: "listening", audioText: "Necesito agua, por favor.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Necesito agua, por favor.", "Quiero café.", "Tengo hambre.", "Estoy cansado."], correct: 0, audioOnly: true },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "배가 고파요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "배가 고파요.", en: "I'm hungry.", es: "Tengo hambre." } },
        { text: "피곤해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "피곤해요.", en: "I'm tired.", es: "Estoy cansado." } },
        { text: "여기 와서 기뻐요!", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "여기 와서 기뻐요!", en: "I'm happy to be here!", es: "¡Estoy feliz de estar aquí!" } },
        { text: "물 좀 주세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "물 좀 주세요.", en: "I need water, please.", es: "Necesito agua, por favor." } },
        { text: "커피 마시고 싶어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "커피 마시고 싶어요.", en: "I want coffee.", es: "Quiero café." } },
        { text: "죄송해요, 이해를 못 했어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "기분을 말할 때 한국어는 표현마다 형태가 달라요. '배고프다'→'배가 고파요', '피곤하다'→'피곤해요', '기쁘다'→'기뻐요'. 뭔가 원할 때는 '~고 싶어요' (커피 마시고 싶어요), 뭔가 달라고 할 때는 '~주세요' (물 좀 주세요). 영어처럼 'I'm ___' 하나로 다 되는 게 아니라, 각각 패턴이 달라요. 하지만 자주 쓰다 보면 입에 붙어요!", en: "Korean feelings each have their own form! '배고프다'→'배가 고파요' (I'm hungry), '피곤하다'→'피곤해요' (I'm tired), '기쁘다'→'기뻐요' (I'm happy). To want something, add '~고 싶어요' (커피 마시고 싶어요 = I want to drink coffee). To ask for something politely, use '~주세요' (물 좀 주세요 = please give me water). Unlike English's universal 'I'm ___', each Korean feeling has its own shape!", es: "Los sentimientos en coreano tienen formas diferentes. '배고프다'→'배가 고파요' (tengo hambre), '피곤하다'→'피곤해요' (estoy cansado). Para querer algo: '~고 싶어요' (커피 마시고 싶어요 = quiero café). Para pedir: '~주세요' (물 좀 주세요 = agua por favor). A diferencia del inglés, cada sentimiento tiene su propia forma." },
          examples: { ko: "배가 고파요. (배고픈 상태)\n피곤해요. (피곤한 상태)\n물 좀 주세요. (~주세요로 부탁하기)\n커피 마시고 싶어요. (~고 싶어요로 원하는 것 말하기)", en: "배가 고파요. (I'm hungry — literally 'stomach is empty'.)\n피곤해요. (I'm tired.)\n물 좀 주세요. (Water please — 주세요 means 'please give me'.)\n커피 마시고 싶어요. (I want coffee — 마시고 싶어요 = want to drink.)", es: "배가 고파요. (Tengo hambre — literalmente 'estómago vacío'.)\n피곤해요. (Estoy cansado.)\n물 좀 주세요. (Agua por favor — 주세요 = por favor deme.)\n커피 마시고 싶어요. (Quiero café — 마시고 싶어요 = quiero beber.)" },
          mistakes: { ko: "❌ 배 고파요.\n✅ 배가 고파요. ('가'를 빼먹지 마세요! 배가 주어예요)\n❌ 커피 싶어요.\n✅ 커피 마시고 싶어요. ('마시고'가 빠지면 안 돼요! 동사+고 싶어요)", en: "❌ 배 고파요.\n✅ 배가 고파요. (Don't forget 가 — it marks 배 as the subject!)\n❌ 커피 싶어요.\n✅ 커피 마시고 싶어요. (You need the verb 마시다 before 고 싶어요!)", es: "❌ 배 고파요.\n✅ 배가 고파요. (No olvides 가 — marca 배 como sujeto)\n❌ 커피 싶어요.\n✅ 커피 마시고 싶어요. (Necesitas el verbo 마시다 antes de 고 싶어요)" },
          rudyTip: { ko: "'주세요'만 기억하면 한국에서 뭐든 부탁할 수 있어! '물 주세요', '커피 주세요', '메뉴 주세요' — 마법의 단어야~", en: "Just remember '주세요' (please give me) and you can ask for anything in Korea! Water 주세요, coffee 주세요, menu 주세요 — it's your magic word!", es: "Solo recuerda '주세요' (por favor deme) y puedes pedir cualquier cosa en Corea. Agua 주세요, café 주세요, menú 주세요 — ¡es tu palabra mágica!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "배___ 고파요.", answer: "가", options: ["가", "는", "을"], fullSentence: "배가 고파요.", fullSentenceMeaning: { ko: "배가 고파요.", en: "I'm hungry.", es: "Tengo hambre." } },
          { type: "select", promptWithBlank: "물 좀 ___.", answer: "주세요", options: ["주세요", "해요", "가요"], fullSentence: "물 좀 주세요.", fullSentenceMeaning: { ko: "물 좀 주세요.", en: "I need water, please.", es: "Necesito agua, por favor." } },
          { type: "select", promptWithBlank: "커피 마시고 ___.", answer: "싶어요", options: ["싶어요", "좋아요", "해요"], fullSentence: "커피 마시고 싶어요.", fullSentenceMeaning: { ko: "커피 마시고 싶어요.", en: "I want coffee.", es: "Quiero café." } },
          { type: "input", promptWithBlank: "___해요.", answer: "피곤", fullSentence: "피곤해요.", fullSentenceMeaning: { ko: "피곤해요.", en: "I'm tired.", es: "Estoy cansado." } },
          { type: "listening", audioText: "물 좀 주세요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["물 좀 주세요.", "커피 마시고 싶어요.", "배가 고파요.", "피곤해요."], correct: 0, audioOnly: true },
        ],
      },
    },
  },

  // ─────────────── Day 6: Unit 1 Comprehensive Review ───────────────
  day_6: {
    english: {
      step1Sentences: [
        { text: "Hello, my name is Rudy.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, recallRound: true },
        { text: "I'm from London. I live in England.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "런던에서 왔어요. 영국에 살아요.", en: "I'm from London. I live in England.", es: "Soy de Londres. Vivo en Inglaterra." } },
        { text: "I'm a detective. I like mysteries.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "저는 탐정이에요. 미스터리를 좋아해요.", en: "I'm a detective. I like mysteries.", es: "Soy detective. Me gustan los misterios." } },
        { text: "This is my partner.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "이분은 제 파트너예요.", en: "This is my partner.", es: "Este es mi compañero." } },
        { text: "I need a snack. Can I have some tea?", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "간식이 필요해요. 차 좀 마실 수 있을까요?", en: "I need a snack. Can I have some tea?", es: "Necesito un snack. ¿Puedo tomar un té?" }, recallRound: true },
        { text: "Thank you! Goodbye!", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "감사합니다! 안녕히 가세요!", en: "Thank you! Goodbye!", es: "¡Gracias! ¡Adiós!" } },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "오늘은 이번 주에 배운 것을 전부 정리해 볼게요! 자기소개('My name is ___'), 출신/거주지('I'm from ___ / I live in ___'), 직업/취미('I'm a ___ / I like ___'), 소개('This is my ___'), 필요한 것('I need ___ / Can I have ___?'), 인사('Thank you / Goodbye'). 이 패턴들을 자유롭게 섞어서 쓸 수 있으면 Unit 1 완벽 클리어!", en: "Today we're reviewing EVERYTHING from this week! Self-intro ('My name is ___'), origin ('I'm from ___'), residence ('I live in ___'), job ('I'm a ___'), likes ('I like ___'), introductions ('This is my ___'), needs ('I need ___ / Can I have ___?'), and farewells ('Thank you / Goodbye'). Mix and match these patterns freely — that's real conversation!", es: "Hoy repasamos TODO de esta semana. Presentación ('My name is ___'), origen ('I'm from ___'), residencia ('I live in ___'), trabajo ('I'm a ___'), gustos ('I like ___'), presentar a otros ('This is my ___'), necesidades ('I need ___ / Can I have ___?'), y despedidas ('Thank you / Goodbye'). ¡Mezcla estos patrones libremente!" },
          examples: { ko: "Hello, my name is Rudy. (자기소개)\nI'm from London. I live in England. (출신+거주지)\nI'm a detective. I like mysteries. (직업+취미)\nThis is my partner. (다른 사람 소개)\nI need a snack. Can I have some tea? (필요+요청)", en: "Hello, my name is Rudy. (Self-introduction)\nI'm from London. I live in England. (Origin + residence)\nI'm a detective. I like mysteries. (Job + interests)\nThis is my partner. (Introducing someone else)\nI need a snack. Can I have some tea? (Needs + requests)", es: "Hello, my name is Rudy. (Autopresentación)\nI'm from London. I live in England. (Origen + residencia)\nI'm a detective. I like mysteries. (Trabajo + gustos)\nThis is my partner. (Presentar a alguien)\nI need a snack. Can I have some tea? (Necesidades + peticiones)" },
          mistakes: { ko: "❌ I'm from in London.\n✅ I'm from London. (from 다음에 in 안 넣어요!)\n❌ I'm like mysteries.\n✅ I like mysteries. (좋아한다고 할 때 'I'm'이 아니라 'I like'!)\n❌ Can I have a tea?\n✅ Can I have some tea? ('a tea'보다 'some tea'가 자연스러워요)", en: "❌ I'm from in London.\n✅ I'm from London. (No 'in' after 'from'!)\n❌ I'm like mysteries.\n✅ I like mysteries. ('I'm' is for feelings, 'I like' is for preferences!)\n❌ This is mine partner.\n✅ This is my partner. ('my' not 'mine' before a noun!)", es: "❌ I'm from in London.\n✅ I'm from London. (Sin 'in' después de 'from')\n❌ I'm like mysteries.\n✅ I like mysteries. ('I'm' para sentimientos, 'I like' para gustos)\n❌ This is mine partner.\n✅ This is my partner. ('my' antes del sustantivo, no 'mine')" },
          rudyTip: { ko: "축하해! 이번 주에 배운 표현들만 잘 조합하면 진짜 대화를 할 수 있어! 자기소개 + 출신 + 직업 + 필요한 것 = 완전한 대화!~", en: "Congrats! You now have all the building blocks for a real conversation: intro + origin + job + needs = complete interaction! You've come so far this week!", es: "¡Felicidades! Ya tienes todos los bloques para una conversación real: presentación + origen + trabajo + necesidades = interacción completa. ¡Has avanzado mucho!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "My ___ is Rudy.", answer: "name", options: ["name", "names", "named"], fullSentence: "My name is Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "I'm ___ London.", answer: "from", options: ["from", "in", "at"], fullSentence: "I'm from London.", fullSentenceMeaning: { ko: "런던에서 왔어요.", en: "I'm from London.", es: "Soy de Londres." } },
          { type: "select", promptWithBlank: "I ___ mysteries.", answer: "like", options: ["like", "am", "want"], fullSentence: "I like mysteries.", fullSentenceMeaning: { ko: "미스터리를 좋아해요.", en: "I like mysteries.", es: "Me gustan los misterios." } },
          { type: "input", promptWithBlank: "I ___ a snack.", answer: "need", fullSentence: "I need a snack.", fullSentenceMeaning: { ko: "간식이 필요해요.", en: "I need a snack.", es: "Necesito un snack." } },
          { type: "listening", audioText: "This is my partner.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["This is my partner.", "I'm a detective.", "I'm from London.", "Thank you! Goodbye!"], correct: 0, audioOnly: true },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Hola, me llamo Rudy.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, recallRound: true },
        { text: "Soy de Londres. Vivo en Inglaterra.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "런던에서 왔어요. 영국에 살아요.", en: "I'm from London. I live in England.", es: "Soy de Londres. Vivo en Inglaterra." } },
        { text: "Soy detective. Me gustan los misterios.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "저는 탐정이에요. 미스터리를 좋아해요.", en: "I'm a detective. I like mysteries.", es: "Soy detective. Me gustan los misterios." } },
        { text: "Este es mi compañero.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "이분은 제 파트너예요.", en: "This is my partner.", es: "Este es mi compañero." } },
        { text: "Necesito un snack. ¿Puedo tomar un té?", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "간식이 필요해요. 차 좀 마실 수 있을까요?", en: "I need a snack. Can I have some tea?", es: "Necesito un snack. ¿Puedo tomar un té?" }, recallRound: true },
        { text: "¡Gracias! ¡Adiós!", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "감사합니다! 안녕히 가세요!", en: "Thank you! Goodbye!", es: "¡Gracias! ¡Adiós!" } },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "이번 주에 배운 스페인어 패턴 총정리! 자기소개('Me llamo ___'), 출신('Soy de ___'), 거주지('Vivo en ___'), 직업('Soy ___'), 취미('Me gusta ___'), 소개('Este es mi ___'), 필요('Necesito ___'), 요청('¿Puedo tener ___?'), 인사('¡Gracias! ¡Adiós!'). 이걸 자유롭게 조합할 수 있으면 진짜 대화가 되는 거예요!", en: "Full review of this week's Spanish patterns! Self-intro ('Me llamo ___'), origin ('Soy de ___'), residence ('Vivo en ___'), job ('Soy ___'), likes ('Me gusta/gustan ___'), introductions ('Este es mi ___'), needs ('Necesito ___'), requests ('¿Puedo tomar ___?'), farewells ('¡Gracias! ¡Adiós!'). Mix them up freely!", es: "¡Repaso total de los patrones de esta semana! Presentación ('Me llamo ___'), origen ('Soy de ___'), residencia ('Vivo en ___'), trabajo ('Soy ___'), gustos ('Me gusta/gustan ___'), presentar ('Este es mi ___'), necesidades ('Necesito ___'), peticiones ('¿Puedo tomar ___?'), despedidas ('¡Gracias! ¡Adiós!'). ¡Mézclalos libremente!" },
          examples: { ko: "Hola, me llamo Rudy. (자기소개)\nSoy de Londres. Vivo en Inglaterra. (출신+거주지)\nSoy detective. Me gustan los misterios. (직업+취미)\nEste es mi compañero. (다른 사람 소개)\nNecesito un snack. ¿Puedo tomar un té? (필요+요청)", en: "Hola, me llamo Rudy. (Self-introduction)\nSoy de Londres. Vivo en Inglaterra. (Origin + residence)\nSoy detective. Me gustan los misterios. (Job + interests)\nEste es mi compañero. (Introducing someone)\nNecesito un snack. ¿Puedo tomar un té? (Needs + requests)", es: "Hola, me llamo Rudy. (Autopresentación)\nSoy de Londres. Vivo en Inglaterra. (Origen + residencia)\nSoy detective. Me gustan los misterios. (Trabajo + gustos)\nEste es mi compañero. (Presentar a alguien)\nNecesito un snack. ¿Puedo tomar un té? (Necesidades + peticiones)" },
          mistakes: { ko: "❌ Me llamo es Rudy.\n✅ Me llamo Rudy. ('es'를 넣으면 안 돼요!)\n❌ Soy de en Londres.\n✅ Soy de Londres. ('de' 다음에 'en' 안 넣어요!)\n❌ Me gusta los misterios.\n✅ Me gustan los misterios. (복수 명사라 'gustan'이에요!)", en: "❌ Me llamo es Rudy.\n✅ Me llamo Rudy. (Don't add 'es' — 'llamo' is already the verb!)\n❌ Soy de en Londres.\n✅ Soy de Londres. (No 'en' after 'de'!)\n❌ Me gusta los misterios.\n✅ Me gustan los misterios. (Plural noun = 'gustan' not 'gusta'!)", es: "❌ Me llamo es Rudy.\n✅ Me llamo Rudy. (No agregues 'es' — 'llamo' ya es el verbo)\n❌ Soy de en Londres.\n✅ Soy de Londres. (Sin 'en' después de 'de')\n❌ Me gusta los misterios.\n✅ Me gustan los misterios. (Sustantivo plural = 'gustan' no 'gusta')" },
          rudyTip: { ko: "이번 주 스페인어 패턴을 전부 익혔어! 'Soy', 'Estoy', 'Tengo', 'Necesito', 'Quiero' — 이 5개 동사만으로 엄청나게 많은 말을 할 수 있어~", en: "You've learned all the key Spanish verbs this week! 'Soy', 'Estoy', 'Tengo', 'Necesito', 'Quiero' — with just these 5 verbs you can say SO much. Amazing progress!", es: "¡Has aprendido todos los verbos clave! 'Soy', 'Estoy', 'Tengo', 'Necesito', 'Quiero' — con solo estos 5 verbos puedes decir muchísimo. ¡Progreso increíble!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Me ___ Rudy.", answer: "llamo", options: ["llamo", "llamas", "nombre"], fullSentence: "Me llamo Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "Soy ___ Londres.", answer: "de", options: ["de", "en", "a"], fullSentence: "Soy de Londres.", fullSentenceMeaning: { ko: "런던에서 왔어요.", en: "I'm from London.", es: "Soy de Londres." } },
          { type: "select", promptWithBlank: "Me ___ los misterios.", answer: "gustan", options: ["gustan", "gusta", "gusto"], fullSentence: "Me gustan los misterios.", fullSentenceMeaning: { ko: "미스터리를 좋아해요.", en: "I like mysteries.", es: "Me gustan los misterios." } },
          { type: "input", promptWithBlank: "___ un snack.", answer: "Necesito", fullSentence: "Necesito un snack.", fullSentenceMeaning: { ko: "간식이 필요해요.", en: "I need a snack.", es: "Necesito un snack." } },
          { type: "listening", audioText: "Este es mi compañero.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Este es mi compañero.", "Soy detective.", "Soy de Londres.", "¡Gracias! ¡Adiós!"], correct: 0, audioOnly: true },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "안녕하세요, 제 이름은 루디예요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, recallRound: true },
        { text: "런던에서 왔어요. 영국에 살아요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "런던에서 왔어요. 영국에 살아요.", en: "I'm from London. I live in England.", es: "Soy de Londres. Vivo en Inglaterra." } },
        { text: "저는 탐정이에요. 미스터리를 좋아해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "저는 탐정이에요. 미스터리를 좋아해요.", en: "I'm a detective. I like mysteries.", es: "Soy detective. Me gustan los misterios." } },
        { text: "이분은 제 파트너예요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "이분은 제 파트너예요.", en: "This is my partner.", es: "Este es mi compañero." } },
        { text: "간식이 필요해요. 차 한 잔 주세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "간식이 필요해요. 차 한 잔 주세요.", en: "I need a snack. Can I have some tea?", es: "Necesito un snack. ¿Puedo tomar un té?" }, recallRound: true },
        { text: "감사합니다! 안녕히 가세요!", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "감사합니다! 안녕히 가세요!", en: "Thank you! Goodbye!", es: "¡Gracias! ¡Adiós!" } },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 2,
      },
      step2: {
        explanation: {
          pattern: { ko: "이번 주 한국어 패턴 총정리! 자기소개('제 이름은 ___예요'), 출신('___에서 왔어요'), 거주지('___에 살아요'), 직업('저는 ___이에요'), 취미('___을/를 좋아해요'), 소개('이분은 제 ___예요'), 필요('___이/가 필요해요'), 요청('___주세요'), 인사('감사합니다! 안녕히 가세요!'). 이 패턴들을 자유롭게 섞어 쓸 수 있으면 완벽!", en: "Full review of this week's Korean! Self-intro ('제 이름은 ___예요'), origin ('___에서 왔어요'), residence ('___에 살아요'), job ('저는 ___이에요'), likes ('___을/를 좋아해요'), introductions ('이분은 제 ___예요'), needs ('___이/가 필요해요'), requests ('___주세요'), farewells ('감사합니다! 안녕히 가세요!'). Mix and match freely!", es: "¡Repaso total del coreano de esta semana! Presentación ('제 이름은 ___예요'), origen ('___에서 왔어요'), residencia ('___에 살아요'), trabajo ('저는 ___이에요'), gustos ('___을/를 좋아해요'), presentar ('이분은 제 ___예요'), necesidades ('___이/가 필요해요'), peticiones ('___주세요'), despedidas ('감사합니다! 안녕히 가세요!')." },
          examples: { ko: "안녕하세요, 제 이름은 루디예요. (자기소개)\n런던에서 왔어요. 영국에 살아요. (출신+거주지)\n저는 탐정이에요. 미스터리를 좋아해요. (직업+취미)\n이분은 제 파트너예요. (다른 사람 소개)\n간식이 필요해요. 차 한 잔 주세요. (필요+요청)", en: "안녕하세요, 제 이름은 루디예요. (Self-introduction)\n런던에서 왔어요. 영국에 살아요. (Origin + residence)\n저는 탐정이에요. 미스터리를 좋아해요. (Job + interests)\n이분은 제 파트너예요. (Introducing someone)\n간식이 필요해요. 차 한 잔 주세요. (Needs + requests)", es: "안녕하세요, 제 이름은 루디예요. (Autopresentación)\n런던에서 왔어요. 영국에 살아요. (Origen + residencia)\n저는 탐정이에요. 미스터리를 좋아해요. (Trabajo + gustos)\n이분은 제 파트너예요. (Presentar a alguien)\n간식이 필요해요. 차 한 잔 주세요. (Necesidades + peticiones)" },
          mistakes: { ko: "❌ 저는 탐정예요.\n✅ 저는 탐정이에요. ('탐정'은 받침이 있으니 '이에요'!)\n❌ 미스터리 좋아해요.\n✅ 미스터리를 좋아해요. ('를'을 빼먹지 마세요!)\n❌ 차 한 잔 주세요을.\n✅ 차 한 잔 주세요. ('주세요' 뒤에 아무것도 안 붙여요!)", en: "❌ 저는 탐정예요.\n✅ 저는 탐정이에요. (탐정 ends in consonant — use 이에요 not 예요!)\n❌ 미스터리 좋아해요.\n✅ 미스터리를 좋아해요. (Don't forget the object marker 를!)\n❌ 이분은 제 파트너이에요.\n✅ 이분은 제 파트너예요. (파트너 ends in vowel — use 예요!)", es: "❌ 저는 탐정예요.\n✅ 저는 탐정이에요. (탐정 termina en consonante — usa 이에요)\n❌ 미스터리 좋아해요.\n✅ 미스터리를 좋아해요. (No olvides el marcador de objeto 를)\n❌ 이분은 제 파트너이에요.\n✅ 이분은 제 파트너예요. (파트너 termina en vocal — usa 예요)" },
          rudyTip: { ko: "이번 주 진짜 많이 배웠어! '예요/이에요', '에서/에', '을/를', '주세요', '고 싶어요' — 이걸 다 익혔으면 한국어 초급 완료! 자랑스러워~", en: "You've learned so much this week! 예요/이에요, 에서/에, 을/를, 주세요, 고 싶어요 — mastering these basics means you've completed Korean beginner level! So proud of you!", es: "¡Has aprendido muchísimo! 예요/이에요, 에서/에, 을/를, 주세요, 고 싶어요 — dominar estos básicos significa que completaste el nivel principiante. ¡Estoy orgulloso!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "제 이름___ 루디예요.", answer: "은", options: ["은", "이", "가"], fullSentence: "제 이름은 루디예요.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "런던___서 왔어요.", answer: "에", options: ["에", "을", "는"], fullSentence: "런던에서 왔어요.", fullSentenceMeaning: { ko: "런던에서 왔어요.", en: "I'm from London.", es: "Soy de Londres." } },
          { type: "select", promptWithBlank: "미스터리___ 좋아해요.", answer: "를", options: ["를", "이", "은"], fullSentence: "미스터리를 좋아해요.", fullSentenceMeaning: { ko: "미스터리를 좋아해요.", en: "I like mysteries.", es: "Me gustan los misterios." } },
          { type: "input", promptWithBlank: "간식이 ___해요.", answer: "필요", fullSentence: "간식이 필요해요.", fullSentenceMeaning: { ko: "간식이 필요해요.", en: "I need a snack.", es: "Necesito un snack." } },
          { type: "listening", audioText: "이분은 제 파트너예요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["이분은 제 파트너예요.", "저는 탐정이에요.", "런던에서 왔어요.", "감사합니다! 안녕히 가세요!"], correct: 0, audioOnly: true },
        ],
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: MISSION TALK
// ═══════════════════════════════════════════════════════════════════════════════

export const MISSION_CONTENT_V2_D5_6: Record<string, Partial<Record<LearningLangKey, MissionTalkLangData>>> = {

  // ─────────────── Day 5: Museum Café Break ───────────────
  day_5: {
    english: {
      situation: {
        ko: "루디와 파트너가 박물관 카페에서 잠시 쉬고 있습니다. 배도 고프고 피곤하네요. 음식과 음료를 주문해 보세요!",
        en: "Rudy and his partner are taking a break at the museum café. They're hungry and tired. Order some food and drinks!",
        es: "Rudy y su compañero descansan en la cafetería del museo. Tienen hambre y están cansados. ¡Pide comida y bebidas!",
      },
      gptPrompt: "You are Rudy the fox detective taking a break at a London museum café with your partner. Have a simple A1-level conversation in {targetLang}.\n\nPre-Task: Today's 3 target expressions are: 1) 'I'm hungry/tired' (feelings) 2) 'I need ___' (needs) 3) 'I want ___' (wants).\n\nAnticipation: After each prompt, wait 3 seconds for the user to respond.\n\nSilence handling: If 5 seconds pass with no response, show suggested answers. If 10 seconds pass, use TTS to model the answer. If 15 seconds pass, offer explicit help.\n\nConversation flow: 1) Rudy says 'I'm so tired after all that investigating!' — prompt user to say how they feel 2) Ask what they want to eat or drink 3) Practice 'I need ___' and 'I want ___' at the café counter 4) Recall a survival phrase — say something confusing so user can practice 'Sorry, I don't understand' 5) End with ordering and enjoying the break.\n\nSuccess scoring: 3 targets hit = ⭐⭐⭐.\n\nLanguage Focus: After conversation, review feelings (I'm + adjective) and needs/wants patterns.\n\nNever say the user is wrong — rephrase and guide naturally.",
      speechLang: "en-GB",
      suggestedAnswers: ["I'm hungry.", "I'm tired.", "I need water, please.", "I want coffee.", "I'm happy to be here!"],
    },
    spanish: {
      situation: {
        ko: "루디와 파트너가 박물관 카페에서 잠시 쉬고 있습니다. 배도 고프고 피곤하네요. 음식과 음료를 주문해 보세요!",
        en: "Rudy and his partner are taking a break at the museum café. Order some food and drinks!",
        es: "Rudy y su compañero descansan en la cafetería del museo. Tienen hambre y están cansados. ¡Pide comida y bebidas!",
      },
      gptPrompt: "You are Rudy the fox detective taking a break at a London museum café with your partner. Have a simple A1-level conversation in {targetLang}.\n\nPre-Task: Today's 3 target expressions are: 1) 'Tengo hambre / Estoy cansado' (feelings) 2) 'Necesito ___' (needs) 3) 'Quiero ___' (wants).\n\nAnticipation: After each prompt, wait 3 seconds for the user to respond.\n\nSilence handling: If 5 seconds pass with no response, show suggested answers. If 10 seconds pass, use TTS to model the answer. If 15 seconds pass, offer explicit help.\n\nConversation flow: 1) Rudy says '¡Estoy muy cansado después de investigar!' — prompt user to say how they feel 2) Ask what they want to eat or drink 3) Practice 'Necesito ___' and 'Quiero ___' at the café counter 4) Recall a survival phrase — say something confusing so user can practice 'Lo siento, no entiendo' 5) End with ordering and enjoying the break.\n\nSuccess scoring: 3 targets hit = ⭐⭐⭐.\n\nLanguage Focus: After conversation, review Tengo vs Estoy for feelings, and Necesito/Quiero patterns.\n\nNever say the user is wrong — rephrase and guide naturally.",
      speechLang: "es-ES",
      suggestedAnswers: ["Tengo hambre.", "Estoy cansado.", "Necesito agua, por favor.", "Quiero café.", "¡Estoy feliz de estar aquí!"],
    },
    korean: {
      situation: {
        ko: "루디와 파트너가 박물관 카페에서 잠시 쉬고 있습니다. 배도 고프고 피곤하네요. 음식과 음료를 주문해 보세요!",
        en: "Rudy and his partner are taking a break at the museum café. Order some food and drinks!",
        es: "Rudy y su compañero descansan en la cafetería del museo. ¡Pide comida y bebidas!",
      },
      gptPrompt: "You are Rudy the fox detective taking a break at a London museum café with your partner. Have a simple A1-level conversation in {targetLang}.\n\nPre-Task: Today's 3 target expressions are: 1) '배가 고파요 / 피곤해요' (feelings) 2) '물 좀 주세요' (requests with 주세요) 3) '커피 마시고 싶어요' (wants with ~고 싶어요).\n\nAnticipation: After each prompt, wait 3 seconds for the user to respond.\n\nSilence handling: If 5 seconds pass with no response, show suggested answers. If 10 seconds pass, use TTS to model the answer. If 15 seconds pass, offer explicit help.\n\nConversation flow: 1) Rudy says '수사하느라 너무 피곤해요!' — prompt user to say how they feel 2) Ask what they want to eat or drink 3) Practice '~주세요' and '~고 싶어요' at the café counter 4) Recall a survival phrase — say something confusing so user can practice '죄송해요, 이해를 못 했어요' 5) End with ordering and enjoying the break.\n\nSuccess scoring: 3 targets hit = ⭐⭐⭐.\n\nLanguage Focus: After conversation, review feeling expressions and 주세요/고 싶어요 patterns.\n\nNever say the user is wrong — rephrase and guide naturally.",
      speechLang: "ko-KR",
      suggestedAnswers: ["배가 고파요.", "피곤해요.", "물 좀 주세요.", "커피 마시고 싶어요.", "여기 와서 기뻐요!"],
    },
  },

  // ─────────────── Day 6: End-of-Week Museum Party ───────────────
  day_6: {
    english: {
      situation: {
        ko: "박물관에서 한 주를 마무리하는 파티가 열렸습니다! 새로운 사람들을 만나고, 자기소개하고, 가족을 소개하고, 간식을 주문하세요. 이번 주에 배운 모든 표현을 총동원하세요!",
        en: "End-of-week party at the museum! Meet new people, introduce yourself, talk about your family, and order snacks. Use EVERYTHING you learned this week!",
        es: "¡Fiesta de fin de semana en el museo! Conoce gente nueva, preséntate, habla de tu familia y pide snacks. ¡Usa TODO lo aprendido!",
      },
      gptPrompt: "You are Rudy hosting an end-of-week celebration party at the London museum. Test ALL Unit 1 expressions in a natural A1 {targetLang} conversation.\n\nPre-Task: Today's 3 target areas are: 1) Full self-introduction (name, origin, job, likes) 2) Introducing others (This is my ___) 3) Expressing needs and ordering (I need ___ / Can I have ___?).\n\nAnticipation: After each prompt, wait 3 seconds for the user to respond.\n\nSilence handling: If 5 seconds pass with no response, show suggested answers. If 10 seconds pass, use TTS to model the answer. If 15 seconds pass, offer explicit help.\n\nConversation flow: 1) Welcome guests — user introduces themselves (name, origin, job) 2) Introduce 2-3 different party guests with different backgrounds 3) User introduces their partner to a guest ('This is my ___') 4) Move to the snack table — order food and drinks ('I need ___', 'I want ___', 'Can I have ___?') 5) Quick check of survival phrases ('I don't understand', 'Can you say that again?') 6) Say goodbye and thank everyone.\n\nSuccess scoring: 3 target areas hit = ⭐⭐⭐.\n\nLanguage Focus: After conversation, review all Unit 1 patterns comprehensively.\n\nThis is a celebration — be enthusiastic and encouraging! Never say the user is wrong — rephrase and guide naturally.",
      speechLang: "en-GB",
      suggestedAnswers: ["Hello, my name is ___.", "I'm from ___. I live in ___.", "I'm a ___. I like ___.", "This is my partner.", "I need a snack. Can I have some tea?", "Sorry, I don't understand.", "Thank you! Goodbye!"],
    },
    spanish: {
      situation: {
        ko: "박물관에서 한 주를 마무리하는 파티가 열렸습니다! 새로운 사람들을 만나고, 자기소개하고, 가족을 소개하고, 간식을 주문하세요!",
        en: "End-of-week party at the museum! Use everything you learned this week!",
        es: "¡Fiesta de fin de semana en el museo! Conoce gente nueva, preséntate, habla de tu familia y pide snacks. ¡Usa todo lo aprendido!",
      },
      gptPrompt: "You are Rudy hosting an end-of-week celebration party at the London museum. Test ALL Unit 1 expressions in a natural A1 {targetLang} conversation.\n\nPre-Task: Today's 3 target areas are: 1) Full self-introduction (Me llamo ___, Soy de ___, Soy ___) 2) Introducing others (Este es mi ___) 3) Expressing needs and ordering (Necesito ___ / ¿Puedo tomar ___?).\n\nAnticipation: After each prompt, wait 3 seconds for the user to respond.\n\nSilence handling: If 5 seconds pass with no response, show suggested answers. If 10 seconds pass, use TTS to model the answer. If 15 seconds pass, offer explicit help.\n\nConversation flow: 1) Welcome guests — user introduces themselves (name, origin, job) 2) Introduce 2-3 guests 3) User introduces their partner ('Este es mi ___') 4) Snack table — order food/drinks ('Necesito ___', 'Quiero ___', '¿Puedo tomar ___?') 5) Survival phrase check ('No entiendo', '¿Puede repetir eso?') 6) Say goodbye and thank everyone.\n\nSuccess scoring: 3 target areas hit = ⭐⭐⭐.\n\nLanguage Focus: After conversation, review all Unit 1 patterns.\n\nBe enthusiastic and encouraging! Never say the user is wrong.",
      speechLang: "es-ES",
      suggestedAnswers: ["Hola, me llamo ___.", "Soy de ___. Vivo en ___.", "Soy ___. Me gusta ___.", "Este es mi compañero.", "Necesito un snack. ¿Puedo tomar un té?", "Lo siento, no entiendo.", "¡Gracias! ¡Adiós!"],
    },
    korean: {
      situation: {
        ko: "박물관에서 한 주를 마무리하는 파티가 열렸습니다! 새로운 사람들을 만나고, 자기소개하고, 가족을 소개하고, 간식을 주문하세요. 이번 주에 배운 모든 표현을 총동원하세요!",
        en: "End-of-week party at the museum! Use everything you learned this week!",
        es: "¡Fiesta de fin de semana en el museo! ¡Usa todo lo aprendido!",
      },
      gptPrompt: "You are Rudy hosting an end-of-week celebration party at the London museum. Test ALL Unit 1 expressions in a natural A1 {targetLang} conversation.\n\nPre-Task: Today's 3 target areas are: 1) Full self-introduction (제 이름은 ___예요, ___에서 왔어요, 저는 ___이에요) 2) Introducing others (이분은 제 ___예요) 3) Expressing needs and ordering (___이/가 필요해요 / ___주세요).\n\nAnticipation: After each prompt, wait 3 seconds for the user to respond.\n\nSilence handling: If 5 seconds pass with no response, show suggested answers. If 10 seconds pass, use TTS to model the answer. If 15 seconds pass, offer explicit help.\n\nConversation flow: 1) Welcome guests — user introduces themselves (name, origin, job) 2) Introduce 2-3 guests 3) User introduces their partner ('이분은 제 ___예요') 4) Snack table — order food/drinks ('___이/가 필요해요', '___주세요', '___마시고 싶어요') 5) Survival phrase check ('이해를 못 했어요', '다시 한번 말해 주시겠어요?') 6) Say goodbye and thank everyone.\n\nSuccess scoring: 3 target areas hit = ⭐⭐⭐.\n\nLanguage Focus: After conversation, review all Unit 1 patterns.\n\nBe enthusiastic and encouraging! Never say the user is wrong.",
      speechLang: "ko-KR",
      suggestedAnswers: ["안녕하세요, 제 이름은 ___예요.", "___에서 왔어요. ___에 살아요.", "저는 ___이에요. ___을 좋아해요.", "이분은 제 파트너예요.", "간식이 필요해요. 차 한 잔 주세요.", "죄송해요, 이해를 못 했어요.", "감사합니다! 안녕히 가세요!"],
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4: REVIEW (SM-2 spaced repetition with yesterday review)
// ═══════════════════════════════════════════════════════════════════════════════

export const REVIEW_CONTENT_V2_D5_6: Record<string, Partial<Record<LearningLangKey, ReviewQuestion[]>>> = {

  // ─────────────── Day 5: Review (first 2 = Day 4 review) ───────────────
  day_5: {
    english: [
      { type: "speak", sentence: "Goodbye! See you later!", speechLang: "en-GB", meaning: { ko: "안녕히 가세요! 다음에 봐요!", en: "Goodbye! See you later!", es: "¡Adiós! ¡Hasta luego!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "___ is the bathroom?", answer: "Where", options: ["Where", "What", "How"], fullSentence: "Where is the bathroom?", fullSentenceMeaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" }, isYesterdayReview: true },
      { type: "speak", sentence: "I'm hungry. I need water, please.", speechLang: "en-GB", meaning: { ko: "배가 고파요. 물 좀 주세요.", en: "I'm hungry. I need water, please.", es: "Tengo hambre. Necesito agua, por favor." } },
      { type: "fill_blank", promptWithBlank: "I ___ coffee.", answer: "want", options: ["want", "need", "am"], fullSentence: "I want coffee.", fullSentenceMeaning: { ko: "커피 마시고 싶어요.", en: "I want coffee.", es: "Quiero café." } },
      { type: "speak", sentence: "I'm tired. I'm happy to be here!", speechLang: "en-GB", meaning: { ko: "피곤해요. 여기 와서 기뻐요!", en: "I'm tired. I'm happy to be here!", es: "Estoy cansado. ¡Estoy feliz de estar aquí!" } },
    ],
    spanish: [
      { type: "speak", sentence: "¡Adiós! ¡Hasta luego!", speechLang: "es-ES", meaning: { ko: "안녕히 가세요! 다음에 봐요!", en: "Goodbye! See you later!", es: "¡Adiós! ¡Hasta luego!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿___ está el baño?", answer: "Dónde", options: ["Dónde", "Qué", "Cómo"], fullSentence: "¿Dónde está el baño?", fullSentenceMeaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Tengo hambre. Necesito agua, por favor.", speechLang: "es-ES", meaning: { ko: "배가 고파요. 물 좀 주세요.", en: "I'm hungry. I need water, please.", es: "Tengo hambre. Necesito agua, por favor." } },
      { type: "fill_blank", promptWithBlank: "___ café.", answer: "Quiero", options: ["Quiero", "Tengo", "Estoy"], fullSentence: "Quiero café.", fullSentenceMeaning: { ko: "커피 마시고 싶어요.", en: "I want coffee.", es: "Quiero café." } },
      { type: "speak", sentence: "Estoy cansado. ¡Estoy feliz de estar aquí!", speechLang: "es-ES", meaning: { ko: "피곤해요. 여기 와서 기뻐요!", en: "I'm tired. I'm happy to be here!", es: "Estoy cansado. ¡Estoy feliz de estar aquí!" } },
    ],
    korean: [
      { type: "speak", sentence: "안녕히 가세요! 다음에 봐요!", speechLang: "ko-KR", meaning: { ko: "안녕히 가세요! 다음에 봐요!", en: "Goodbye! See you later!", es: "¡Adiós! ¡Hasta luego!" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "화장실이 ___예요?", answer: "어디", options: ["어디", "뭐", "어떻게"], fullSentence: "화장실이 어디예요?", fullSentenceMeaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" }, isYesterdayReview: true },
      { type: "speak", sentence: "배가 고파요. 물 좀 주세요.", speechLang: "ko-KR", meaning: { ko: "배가 고파요. 물 좀 주세요.", en: "I'm hungry. I need water, please.", es: "Tengo hambre. Necesito agua, por favor." } },
      { type: "fill_blank", promptWithBlank: "커피 마시고 ___.", answer: "싶어요", options: ["싶어요", "좋아요", "주세요"], fullSentence: "커피 마시고 싶어요.", fullSentenceMeaning: { ko: "커피 마시고 싶어요.", en: "I want coffee.", es: "Quiero café." } },
      { type: "speak", sentence: "피곤해요. 여기 와서 기뻐요!", speechLang: "ko-KR", meaning: { ko: "피곤해요. 여기 와서 기뻐요!", en: "I'm tired. I'm happy to be here!", es: "Estoy cansado. ¡Estoy feliz de estar aquí!" } },
    ],
  },

  // ─────────────── Day 6: Comprehensive Unit Review (first 2 = Day 5 review, rest = mixed Unit 1) ───────────────
  day_6: {
    english: [
      { type: "speak", sentence: "I'm hungry. I need water, please.", speechLang: "en-GB", meaning: { ko: "배가 고파요. 물 좀 주세요.", en: "I'm hungry. I need water, please.", es: "Tengo hambre. Necesito agua, por favor." }, isYesterdayReview: true },
      { type: "speak", sentence: "I want coffee. I'm tired.", speechLang: "en-GB", meaning: { ko: "커피 마시고 싶어요. 피곤해요.", en: "I want coffee. I'm tired.", es: "Quiero café. Estoy cansado." }, isYesterdayReview: true },
      { type: "speak", sentence: "Hello, my name is Rudy. I'm from London.", speechLang: "en-GB", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 런던에서 왔어요.", en: "Hello, my name is Rudy. I'm from London.", es: "Hola, me llamo Rudy. Soy de Londres." } },
      { type: "speak", sentence: "I'm a detective. I like mysteries. This is my partner.", speechLang: "en-GB", meaning: { ko: "저는 탐정이에요. 미스터리를 좋아해요. 이분은 제 파트너예요.", en: "I'm a detective. I like mysteries. This is my partner.", es: "Soy detective. Me gustan los misterios. Este es mi compañero." } },
      { type: "speak", sentence: "Sorry, I don't understand. Can you say that again? Thank you!", speechLang: "en-GB", meaning: { ko: "죄송해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요? 감사합니다!", en: "Sorry, I don't understand. Can you say that again? Thank you!", es: "Lo siento, no entiendo. ¿Puede repetir eso? ¡Gracias!" } },
    ],
    spanish: [
      { type: "speak", sentence: "Tengo hambre. Necesito agua, por favor.", speechLang: "es-ES", meaning: { ko: "배가 고파요. 물 좀 주세요.", en: "I'm hungry. I need water, please.", es: "Tengo hambre. Necesito agua, por favor." }, isYesterdayReview: true },
      { type: "speak", sentence: "Quiero café. Estoy cansado.", speechLang: "es-ES", meaning: { ko: "커피 마시고 싶어요. 피곤해요.", en: "I want coffee. I'm tired.", es: "Quiero café. Estoy cansado." }, isYesterdayReview: true },
      { type: "speak", sentence: "Hola, me llamo Rudy. Soy de Londres.", speechLang: "es-ES", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 런던에서 왔어요.", en: "Hello, my name is Rudy. I'm from London.", es: "Hola, me llamo Rudy. Soy de Londres." } },
      { type: "speak", sentence: "Soy detective. Me gustan los misterios. Este es mi compañero.", speechLang: "es-ES", meaning: { ko: "저는 탐정이에요. 미스터리를 좋아해요. 이분은 제 파트너예요.", en: "I'm a detective. I like mysteries. This is my partner.", es: "Soy detective. Me gustan los misterios. Este es mi compañero." } },
      { type: "speak", sentence: "Lo siento, no entiendo. ¿Puede repetir eso? ¡Gracias!", speechLang: "es-ES", meaning: { ko: "죄송해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요? 감사합니다!", en: "Sorry, I don't understand. Can you say that again? Thank you!", es: "Lo siento, no entiendo. ¿Puede repetir eso? ¡Gracias!" } },
    ],
    korean: [
      { type: "speak", sentence: "배가 고파요. 물 좀 주세요.", speechLang: "ko-KR", meaning: { ko: "배가 고파요. 물 좀 주세요.", en: "I'm hungry. I need water, please.", es: "Tengo hambre. Necesito agua, por favor." }, isYesterdayReview: true },
      { type: "speak", sentence: "커피 마시고 싶어요. 피곤해요.", speechLang: "ko-KR", meaning: { ko: "커피 마시고 싶어요. 피곤해요.", en: "I want coffee. I'm tired.", es: "Quiero café. Estoy cansado." }, isYesterdayReview: true },
      { type: "speak", sentence: "안녕하세요, 제 이름은 루디예요. 런던에서 왔어요.", speechLang: "ko-KR", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 런던에서 왔어요.", en: "Hello, my name is Rudy. I'm from London.", es: "Hola, me llamo Rudy. Soy de Londres." } },
      { type: "speak", sentence: "저는 탐정이에요. 미스터리를 좋아해요. 이분은 제 파트너예요.", speechLang: "ko-KR", meaning: { ko: "저는 탐정이에요. 미스터리를 좋아해요. 이분은 제 파트너예요.", en: "I'm a detective. I like mysteries. This is my partner.", es: "Soy detective. Me gustan los misterios. Este es mi compañero." } },
      { type: "speak", sentence: "죄송해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요? 감사합니다!", speechLang: "ko-KR", meaning: { ko: "죄송해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요? 감사합니다!", en: "Sorry, I don't understand. Can you say that again? Thank you!", es: "Lo siento, no entiendo. ¿Puede repetir eso? ¡Gracias!" } },
    ],
  },
};
