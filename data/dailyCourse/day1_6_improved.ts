/**
 * IMPROVED Day 1-6 Content (Unit 1: First Encounters)
 *
 * Changes from original:
 * - STEP 1: Increased from 3 to 5 sentences per day
 * - STEP 1: Added survival phrases throughout (I don't understand, Thank you,
 *   Sorry, Can you repeat that, Where is, How much, Help, Yes/No)
 * - STEP 2: Increased from 2 to 4-5 quizzes per day
 * - STEP 2: Added "input" type quizzes (user types answer from memory)
 * - STEP 3: Mission Talk prompts updated to incorporate survival phrases
 * - STEP 4: Review expanded with more speak + fill_blank variety
 *
 * To apply: Replace the corresponding entries in LESSON_CONTENT, MISSION_CONTENT,
 * and REVIEW_CONTENT in lib/lessonContent.ts
 */

import type { Tri } from "../../lib/dailyCourseData";
import type {
  DayLessonData,
  LessonSentence,
  FillBlankQuiz,
  MissionTalkLangData,
  ReviewQuestion,
  LearningLangKey,
} from "../../lib/lessonContent";
import type { GrammarExplanation } from "../../lib/lessonContent";

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1 + STEP 2 (LESSON_CONTENT)
// ═══════════════════════════════════════════════════════════════════════════════

export const LESSON_CONTENT_IMPROVED: Record<string, Partial<Record<LearningLangKey, DayLessonData>>> = {

  // ─────────────── Day 1: Meeting & Greeting + Survival Basics ───────────────
  day_1: {
    english: {
      step1Sentences: [
        { text: "Hello, my name is Rudy.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." } },
        { text: "Nice to meet you.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." } },
        { text: "Where are you from?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" } },
        { text: "Thank you.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "감사합니다.", en: "Thank you.", es: "Gracias." }, recallRound: false },
        { text: "Sorry, I don't understand.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "미안해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, recallRound: false },
        { text: "Help! Please help me.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "도와주세요! 도움이 필요해요.", en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdame." } },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: { ko: "영어로 자기소개할 때는 'My name is ___' 아니면 짧게 'I'm ___'이라고 해요. 둘 다 같은 뜻이지만 I'm이 더 자연스럽고 캐주얼해요. 모르는 말이 나오면 'Sorry, I don't understand'라고 하면 되고, 위급할 때는 'Help!'만 기억하세요!", en: "When introducing yourself, you can say 'My name is ___' or just 'I'm ___'. Both work, but 'I'm' sounds more casual and natural. If something goes over your head, just say 'Sorry, I don't understand'. And in an emergency? Just shout 'Help!' — that one word can save you.", es: "Para presentarte, puedes decir 'My name is ___' o simplemente 'I'm ___'. Ambas funcionan, pero 'I'm' suena más natural. Si no entiendes algo, di 'Sorry, I don't understand'. Y en emergencia, solo grita 'Help!'." },
          examples: { ko: "My name is Rudy. (제 이름은 루디예요.)\nI'm a student. (저는 학생이에요.)\nSorry, I don't understand. (미안해요, 이해를 못 했어요.)", en: "My name is Rudy. (I'm introducing myself formally.)\nI'm Rudy. (Same thing, just shorter and more casual!)\nHelp! Please help me. (Use this in any emergency.)", es: "My name is Rudy. (Me llamo Rudy.)\nI'm a student. (Soy estudiante.)\nSorry, I don't understand. (Lo siento, no entiendo.)" },
          mistakes: { ko: "❌ My name is am Rudy.\n✅ My name is Rudy. (is랑 am 둘 다 쓰면 안 돼요!)\n❌ I don't understand not.\n✅ I don't understand. (don't가 이미 부정이에요)", en: "❌ My name is am Rudy.\n✅ My name is Rudy. (Don't double up 'is' and 'am'!)\n❌ I no understand.\n✅ I don't understand. (Use 'don't', not just 'no')", es: "❌ My name is am Rudy.\n✅ My name is Rudy. (No uses 'is' y 'am' juntos.)\n❌ I no understand.\n✅ I don't understand. (Usa 'don't', no solo 'no')" },
          rudyTip: { ko: "처음 만나는 사람한테 'I'm ___'만 기억해도 절반은 성공이야! 나머지는 웃으면서 해결되거든 ^^", en: "Just remember 'I'm ___' and you're halfway there! A smile does the rest of the talking.", es: "Solo recuerda 'I'm ___' y ya tienes la mitad hecha. Una sonrisa hace el resto." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "My name ___ Rudy.", answer: "is", options: ["is", "am", "are"], fullSentence: "My name is Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "Nice to ___ you.", answer: "meet", options: ["meet", "see", "have"], fullSentence: "Nice to meet you.", fullSentenceMeaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." } },
          { type: "select", promptWithBlank: "Sorry, I don't ___.", answer: "understand", options: ["understand", "know", "speak"], fullSentence: "Sorry, I don't understand.", fullSentenceMeaning: { ko: "미안해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." } },
          { type: "input", promptWithBlank: "___ you.", answer: "Thank", fullSentence: "Thank you.", fullSentenceMeaning: { ko: "감사합니다.", en: "Thank you.", es: "Gracias." } },
          { type: "listening", audioText: "Hello, my name is Rudy.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Hello, my name is Rudy.", "Nice to meet you.", "Where are you from?", "Thank you."], correct: 0, audioOnly: true },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Hola, me llamo Rudy.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." } },
        { text: "Mucho gusto.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." } },
        { text: "¿De dónde eres?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" } },
        { text: "Gracias.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "감사합니다.", en: "Thank you.", es: "Gracias." }, recallRound: false },
        { text: "Lo siento, no entiendo.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "미안해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, recallRound: false },
        { text: "¡Ayuda! Por favor, ayúdame.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "도와주세요! 도움이 필요해요.", en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdame." } },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: { ko: "스페인어로 자기소개할 때 'Me llamo ___'라고 해요. 'llamo'는 '부르다'라는 뜻이라, 직역하면 '나를 ___라고 불러요'가 돼요. 처음 만나면 'Mucho gusto'(반갑습니다)라고 하고, 못 알아들으면 'No entiendo', 위급하면 '¡Ayuda!'라고 하세요!", en: "To introduce yourself in Spanish, say 'Me llamo ___' — it literally means 'I call myself ___'. When you meet someone, say 'Mucho gusto' (pleased to meet you). If you're lost in conversation, 'No entiendo' is your lifeline. Emergency? Just yell '¡Ayuda!'", es: "Para presentarte, di 'Me llamo ___', que literalmente significa 'me llamo a mí mismo ___'. Al conocer a alguien, di 'Mucho gusto'. Si no entiendes algo, 'No entiendo' te salva. ¿Emergencia? Grita '¡Ayuda!'" },
          examples: { ko: "Me llamo Rudy. (제 이름은 루디예요.)\nMucho gusto. (만나서 반갑습니다.)\nNo entiendo. (이해를 못 했어요.)", en: "Me llamo Rudy. (My name is Rudy.)\nMucho gusto. (Nice to meet you.)\n¡Ayuda! Por favor, ayúdame. (Help! Please help me.)", es: "Me llamo Rudy. (Mi nombre es Rudy.)\nMucho gusto. (Encantado de conocerte.)\nNo entiendo, lo siento. (No entiendo, perdón.)" },
          mistakes: { ko: "❌ Mi llamo Rudy.\n✅ Me llamo Rudy. ('Mi'가 아니라 'Me'예요! Mi는 '나의'라는 뜻이에요)\n❌ Mucho gusto a ti.\n✅ Mucho gusto. (그냥 이 두 단어면 충분해요)", en: "❌ Mi llamo Rudy.\n✅ Me llamo Rudy. ('Mi' means 'my' — you need 'Me' here!)\n❌ No entendo.\n✅ No entiendo. (Watch that 'ie' — it's entIEndo)", es: "❌ Mi llamo Rudy.\n✅ Me llamo Rudy. ('Mi' significa posesión — aquí necesitas 'Me')\n❌ No entendo.\n✅ No entiendo. (Cuidado con la 'ie' — es entIEndo)" },
          rudyTip: { ko: "'Me llamo'만 외워두면 스페인어권 어디서든 자기소개 가능! 발음은 '메 야모'에 가까워요~", en: "Fun fact: 'Me llamo' literally means 'I call myself.' Once you nail this phrase, you can introduce yourself anywhere in the Spanish-speaking world!", es: "Dato curioso: 'Me llamo' es reflexivo. Una vez que domines esta frase, puedes presentarte en cualquier lugar hispanohablante." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Me ___ Rudy.", answer: "llamo", options: ["llamo", "llamas", "llaman"], fullSentence: "Me llamo Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "Mucho ___.", answer: "gusto", options: ["gusto", "bueno", "bien"], fullSentence: "Mucho gusto.", fullSentenceMeaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." } },
          { type: "select", promptWithBlank: "Lo siento, no ___.", answer: "entiendo", options: ["entiendo", "hablo", "sé"], fullSentence: "Lo siento, no entiendo.", fullSentenceMeaning: { ko: "미안해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." } },
          { type: "input", promptWithBlank: "___.", answer: "Gracias", fullSentence: "Gracias.", fullSentenceMeaning: { ko: "감사합니다.", en: "Thank you.", es: "Gracias." } },
          { type: "listening", audioText: "Hola, me llamo Rudy.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Hola, me llamo Rudy.", "Mucho gusto.", "¿De dónde eres?", "Gracias."], correct: 0, audioOnly: true },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "안녕하세요, 제 이름은 루디예요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." } },
        { text: "만나서 반갑습니다.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." } },
        { text: "어디에서 오셨어요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" } },
        { text: "감사합니다.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "감사합니다.", en: "Thank you.", es: "Gracias." }, recallRound: false },
        { text: "죄송해요, 이해를 못 했어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, recallRound: false },
        { text: "도와주세요! 도움이 필요해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "도와주세요! 도움이 필요해요.", en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdame." } },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: { ko: "'제 이름은 ___예요'는 격식 있는 자기소개 표현이에요. 편하게는 '저는 ___예요'라고도 해요. 이름 끝에 받침이 있으면 '이에요', 없으면 '예요'를 써요. 못 알아들었을 때 '이해를 못 했어요', 위험할 때 '도와주세요!'는 꼭 기억하세요!", en: "To introduce yourself in Korean, say '제 이름은 ___예요' (My name is ___). The tricky part: if the name ends in a consonant, use '이에요' instead of '예요'. Can't follow what someone said? Say '이해를 못 했어요'. Need help? Shout '도와주세요!'", es: "Para presentarte en coreano, di '제 이름은 ___예요' (Mi nombre es ___). La parte difícil: si el nombre termina en consonante, usa '이에요' en vez de '예요'. ¿No entiendes? Di '이해를 못 했어요'. ¿Emergencia? Grita '도와주세요!'" },
          examples: { ko: "제 이름은 루디예요. (자기소개 기본형)\n만나서 반갑습니다. (처음 만났을 때 인사)\n도와주세요! 도움이 필요해요. (위급할 때)", en: "제 이름은 루디예요. (My name is Rudy.)\n만나서 반갑습니다. (Nice to meet you.)\n이해를 못 했어요. (I didn't understand.)", es: "제 이름은 루디예요. (Me llamo Rudy.)\n만나서 반갑습니다. (Mucho gusto.)\n도와주세요! (¡Ayuda!)" },
          mistakes: { ko: "❌ 제 이름은 루디이에요.\n✅ 제 이름은 루디예요. (루디는 받침이 없으니까 '예요'!)\n❌ 이해 못 했어요.\n✅ 이해를 못 했어요. ('를'을 빼먹지 마세요)", en: "❌ 제 이름은 루디이에요.\n✅ 제 이름은 루디예요. (루디 ends in a vowel, so use 예요 not 이에요!)\n❌ 제 이름은 민준예요.\n✅ 제 이름은 민준이에요. (민준 ends in a consonant, so use 이에요!)", es: "❌ 제 이름은 루디이에요.\n✅ 제 이름은 루디예요. (루디 termina en vocal, usa 예요 no 이에요)\n❌ 제 이름은 민준예요.\n✅ 제 이름은 민준이에요. (민준 termina en consonante, usa 이에요)" },
          rudyTip: { ko: "이름 뒤에 '예요' 붙이면 끝! 받침 있으면 '이에요'인데, 처음엔 헷갈려도 괜찮아~ 자주 쓰다 보면 입에 붙어!", en: "Just add 예요 after your name and you're done! If your name ends in a consonant, switch to 이에요. Don't stress about getting it perfect — Koreans will totally appreciate the effort!", es: "Solo agrega 예요 después de tu nombre. Si termina en consonante, cambia a 이에요. No te estreses por hacerlo perfecto, los coreanos van a apreciar el esfuerzo." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "제 이름___ 루디예요.", answer: "은", options: ["은", "이", "가"], fullSentence: "제 이름은 루디예요.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "만나서 ___습니다.", answer: "반갑", options: ["반갑", "고맙", "감사"], fullSentence: "만나서 반갑습니다.", fullSentenceMeaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." } },
          { type: "select", promptWithBlank: "이해를 ___ 했어요.", answer: "못", options: ["못", "안", "잘"], fullSentence: "이해를 못 했어요.", fullSentenceMeaning: { ko: "이해를 못 했어요.", en: "I don't understand.", es: "No entiendo." } },
          { type: "input", promptWithBlank: "___합니다.", answer: "감사", fullSentence: "감사합니다.", fullSentenceMeaning: { ko: "감사합니다.", en: "Thank you.", es: "Gracias." } },
          { type: "listening", audioText: "안녕하세요, 제 이름은 루디예요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["안녕하세요, 제 이름은 루디예요.", "만나서 반갑습니다.", "어디에서 오셨어요?", "감사합니다."], correct: 0, audioOnly: true },
        ],
      },
    },
    indonesian: {
      step1Sentences: [
        { text: "Halo, nama saya Rudy.", speechLang: "id-ID", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." } },
        { text: "Senang bertemu dengan Anda.", speechLang: "id-ID", meaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." } },
        { text: "Anda berasal dari mana?", speechLang: "id-ID", meaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" } },
        { text: "Terima kasih.", speechLang: "id-ID", meaning: { ko: "감사합니다.", en: "Thank you.", es: "Gracias." }, recallRound: false },
        { text: "Maaf, saya tidak mengerti.", speechLang: "id-ID", meaning: { ko: "미안해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, recallRound: false },
        { text: "Tolong! Tolong bantu saya.", speechLang: "id-ID", meaning: { ko: "도와주세요! 도움이 필요해요.", en: "Help! Please help me.", es: "¡Ayuda! Por favor, ayúdame." } },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: { ko: "인도네시아어로 자기소개할 때는 'Nama saya ___'(제 이름은 ___예요)라고 해요. 'nama'는 '이름', 'saya'는 '저/제'라는 뜻이에요. 처음 만나면 'Senang bertemu'(반갑습니다), 못 알아들으면 'Saya tidak mengerti', 위급할 때는 'Tolong!'(도와주세요)만 기억하세요!", en: "To introduce yourself in Indonesian, say 'Nama saya ___' — literally 'name my ___'. (Indonesian puts the possessor after the noun!) When you meet someone, say 'Senang bertemu'. Lost in the conversation? 'Saya tidak mengerti' is your lifeline. Emergency? Just shout 'Tolong!' — it means both 'help' and 'please'.", es: "Para presentarte en indonesio, di 'Nama saya ___' — literalmente 'nombre mi ___'. Al conocer a alguien, di 'Senang bertemu'. ¿No entiendes? 'Saya tidak mengerti' te salva. ¿Emergencia? Grita '¡Tolong!' — significa 'ayuda' y 'por favor'." },
          examples: { ko: "Nama saya Rudy. (제 이름은 루디예요.)\nSenang bertemu dengan Anda. (만나서 반갑습니다.)\nSaya tidak mengerti. (이해를 못 했어요.)", en: "Nama saya Rudy. (My name is Rudy.)\nSenang bertemu dengan Anda. (Nice to meet you.)\nTolong! Tolong bantu saya. (Help! Please help me.)", es: "Nama saya Rudy. (Me llamo Rudy.)\nSenang bertemu dengan Anda. (Mucho gusto.)\n¡Tolong! (¡Ayuda!)" },
          mistakes: { ko: "❌ Saya nama Rudy.\n✅ Nama saya Rudy. (인도네시아어는 명사가 먼저! '이름 나의' 순서예요)\n❌ Saya tidak mengerti tidak.\n✅ Saya tidak mengerti. ('tidak'이 이미 부정이에요)", en: "❌ Saya nama Rudy.\n✅ Nama saya Rudy. (Noun comes first in Indonesian — 'name my', not 'my name'!)\n❌ Saya no mengerti.\n✅ Saya tidak mengerti. (Use 'tidak' for verbs, not 'no')", es: "❌ Saya nama Rudy.\n✅ Nama saya Rudy. (El sustantivo va primero: 'nombre mi')\n❌ Saya no mengerti.\n✅ Saya tidak mengerti. (Usa 'tidak' con verbos, no 'no')" },
          rudyTip: { ko: "'Nama saya ___'만 외워도 절반은 성공! 'Tolong'은 '도와주세요'랑 '~해 주세요' 둘 다 되니까 진짜 만능이야~", en: "Just remember 'Nama saya ___' and you're halfway there! And 'Tolong' is magic — it means both 'help!' and 'please', so you'll use it everywhere.", es: "Solo recuerda 'Nama saya ___' y ya tienes la mitad. Y 'Tolong' es mágico: significa '¡ayuda!' y 'por favor'." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ saya Rudy.", answer: "Nama", options: ["Nama", "Saya", "Orang"], fullSentence: "Nama saya Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "___ bertemu dengan Anda.", answer: "Senang", options: ["Senang", "Sedih", "Cepat"], fullSentence: "Senang bertemu dengan Anda.", fullSentenceMeaning: { ko: "만나서 반갑습니다.", en: "Nice to meet you.", es: "Mucho gusto." } },
          { type: "select", promptWithBlank: "Maaf, saya tidak ___.", answer: "mengerti", options: ["mengerti", "tahu", "bisa"], fullSentence: "Maaf, saya tidak mengerti.", fullSentenceMeaning: { ko: "미안해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." } },
          { type: "input", promptWithBlank: "Terima ___.", answer: "kasih", fullSentence: "Terima kasih.", fullSentenceMeaning: { ko: "감사합니다.", en: "Thank you.", es: "Gracias." } },
          { type: "listening", audioText: "Halo, nama saya Rudy.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Halo, nama saya Rudy.", "Senang bertemu dengan Anda.", "Anda berasal dari mana?", "Terima kasih."], correct: 0, audioOnly: true },
        ],
      },
    },
    arabic: {
      step1Sentences: [
        { text: "أَهْلًا، أَنَا اسْمِي رودي.", speechLang: "ar-EG", meaning: { ko: "ahlan, ana esmi Rudy · 안녕하세요, 제 이름은 루디예요.", en: "ahlan, ana esmi Rudy · Hello, my name is Rudy.", es: "ahlan, ana esmi Rudy · Hola, me llamo Rudy.", id: "ahlan, ana esmi Rudy · Halo, nama saya Rudy." } },
        { text: "فُرْصة سَعيدة.", speechLang: "ar-EG", meaning: { ko: "forsa sa3ida · 만나서 반갑습니다.", en: "forsa sa3ida · Nice to meet you.", es: "forsa sa3ida · Mucho gusto.", id: "forsa sa3ida · Senang bertemu dengan Anda." } },
        { text: "مِنْ أَيْنَ أَنْتَ؟", speechLang: "ar-EG", meaning: { ko: "enta minein? · 어디에서 오셨어요?", en: "enta minein? · Where are you from?", es: "enta minein? · ¿De dónde eres?", id: "enta minein? · Anda berasal dari mana?" } },
        { text: "شُكْرًا.", speechLang: "ar-EG", meaning: { ko: "shokran · 감사합니다.", en: "shokran · Thank you.", es: "shokran · Gracias.", id: "shokran · Terima kasih." }, recallRound: false },
        { text: "آسِف، أَنَا لا أَفْهَم.", speechLang: "ar-EG", meaning: { ko: "aasef, ana mesh fahem · 미안해요, 이해를 못 했어요.", en: "aasef, ana mesh fahem · Sorry, I don't understand.", es: "aasef, ana mesh fahem · Lo siento, no entiendo.", id: "aasef, ana mesh fahem · Maaf, saya tidak mengerti." }, recallRound: false },
        { text: "النَّجْدة! ساعِدْني مِنْ فَضْلِك.", speechLang: "ar-EG", meaning: { ko: "el-nagda! sa3edni men fadlak · 도와주세요! 도움이 필요해요.", en: "el-nagda! sa3edni men fadlak · Help! Please help me.", es: "el-nagda! sa3edni men fadlak · ¡Ayuda! Por favor, ayúdame.", id: "el-nagda! sa3edni men fadlak · Tolong! Tolong bantu saya." } },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: { ko: "표준어(MSA)로 자기소개할 때는 'أنا اسمي ___'(anā ismī ___, 제 이름은 ___예요)라고 해요. 'anā'는 '저', 'ismī'는 '제 이름'이에요. 출신을 물을 땐 'مِنْ أَيْنَ أَنْتَ؟'(min ayna anta?, 어디 출신이세요?) — 'أَيْنَ'(ayna)가 '어디'예요. 못 알아들으면 'أنا لا أَفْهَم'(anā lā afham) — 'لا'(lā)가 부정이에요. 위급하면 'النَّجْدة!'(an-najda!)!", en: "To introduce yourself in MSA, say 'أنا اسمي ___' (anā ismī ___) — 'anā' is 'I', 'ismī' is 'my name'. To ask where someone's from, say 'مِنْ أَيْنَ أَنْتَ؟' (min ayna anta?) — 'أَيْنَ' (ayna) means 'where'. Can't follow? Say 'أنا لا أَفْهَم' (anā lā afham); 'لا' (lā) is the standard 'not'. Emergency? Shout 'النَّجْدة!' (an-najda!).", es: "Para presentarte en árabe estándar (MSA), di 'أنا اسمي ___' (anā ismī ___) — 'anā' es 'yo', 'ismī' es 'mi nombre'. Para preguntar de dónde es alguien, di 'مِنْ أَيْنَ أَنْتَ؟' (min ayna anta?) — 'أَيْنَ' (ayna) significa 'dónde'. ¿No entiendes? Di 'أنا لا أَفْهَم' (anā lā afham); 'لا' (lā) es el 'no' estándar. ¿Emergencia? Grita 'النَّجْدة!' (an-najda!)." },
          examples: { ko: "أنا اسمي رودي. (anā ismī Rudy · 제 이름은 루디예요.)\nفُرْصة سعيدة. (furṣa saʿīda · 만나서 반갑습니다.)\nأنا لا أَفْهَم. (anā lā afham · 이해를 못 했어요.)", en: "أنا اسمي رودي. (anā ismī Rudy · My name is Rudy.)\nفُرْصة سعيدة. (furṣa saʿīda · Nice to meet you.)\nالنَّجْدة! ساعِدني مِن فَضْلِك. (an-najda! sāʿidnī min faḍlik · Help! Please help me.)", es: "أنا اسمي رودي. (anā ismī Rudy · Me llamo Rudy.)\nفُرْصة سعيدة. (furṣa saʿīda · Mucho gusto.)\nالنَّجْدة! (an-najda · ¡Ayuda!)" },
          mistakes: { ko: "❌ أنا مِش فاهِم. (مِش/mesh는 이집트 구어체 부정)\n✅ أنا لا أَفْهَم. (anā lā afham — 표준어는 'لا'를 써요!)\n💬 참고: 이집트에선 'إنْت مِنين؟'(enta minein?)라고도 하지만, 표준어 ✅는 'مِنْ أَيْنَ أَنْتَ؟'(min ayna anta?)예요.", en: "❌ أنا مِش فاهِم. (مِش / mesh is Egyptian colloquial negation)\n✅ أنا لا أَفْهَم. (anā lā afham — MSA uses 'لا'!)\n💬 Note: Egyptians also say 'إنْت مِنين؟' (enta minein?) in dialect, but the MSA ✅ is 'مِنْ أَيْنَ أَنْتَ؟' (min ayna anta?).", es: "❌ أنا مِش فاهِم. (مِش / mesh es negación coloquial egipcia)\n✅ أنا لا أَفْهَم. (anā lā afham — ¡el MSA usa 'لا'!)\n💬 Nota: en Egipto también dicen 'إنْت مِنين؟' (enta minein?) en dialecto, pero el ✅ en MSA es 'مِنْ أَيْنَ أَنْتَ؟' (min ayna anta?)." },
          rudyTip: { ko: "'أنا اسمي ___'(anā ismī)만 외워도 절반은 성공! 'أَيْنَ؟'(ayna?, 어디)랑 'لا'(lā, 아니다)만 알면 표준어로 어느 아랍 나라에서나 통해~ 한 번 배우면 전 세계 공통이야!", en: "Just remember 'أنا اسمي ___' (anā ismī) and you're halfway there! Learn 'أَيْنَ؟' (ayna? — where) and 'لا' (lā — not), and your MSA works across the whole Arab world — learn it once, use it everywhere!", es: "Solo recuerda 'أنا اسمي ___' (anā ismī) y ya tienes la mitad. Aprende 'أَيْنَ؟' (ayna? — dónde) y 'لا' (lā — no), y tu MSA funciona en todo el mundo árabe: ¡apréndelo una vez y úsalo en todas partes!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "أَنَا ___ رودي.", answer: "اسْمِي", options: ["اسْمِي", "أَنَا", "أَنْتَ"], fullSentence: "أَنَا اسْمِي رودي.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy.", id: "Nama saya Rudy." } },
          { type: "select", promptWithBlank: "أَنْتَ ___؟", answer: "مِنْ أَيْنَ", options: ["مِنْ أَيْنَ", "ماذا", "مَنْ"], fullSentence: "مِنْ أَيْنَ أَنْتَ؟", fullSentenceMeaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?", id: "Anda berasal dari mana?" } },
          { type: "select", promptWithBlank: "آسِف، أَنَا ___ أَفْهَم.", answer: "لا", options: ["لا", "لَيْسَ", "ما"], fullSentence: "آسِف، أَنَا لا أَفْهَم.", fullSentenceMeaning: { ko: "미안해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", id: "Maaf, saya tidak mengerti." } },
          { type: "input", promptWithBlank: "___.", answer: "شُكْرًا", fullSentence: "شُكْرًا.", fullSentenceMeaning: { ko: "감사합니다.", en: "Thank you.", es: "Gracias.", id: "Terima kasih." } },
          { type: "listening", audioText: "أَهْلًا، أَنَا اسْمِي رودي.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["أَهْلًا، أَنَا اسْمِي رودي.", "فُرْصة سَعيدة.", "مِنْ أَيْنَ أَنْتَ؟", "شُكْرًا."], correct: 0, audioOnly: true },
        ],
      },
    },
  },

  // ─────────────── Day 2: Where You're From + Yes/No + Repeat ────────────────
  day_2: {
    english: {
      step1Sentences: [
        { text: "I'm from Korea.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
        { text: "I live in Seoul.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
        { text: "What's your city like?", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "당신의 도시는 어때요?", en: "What's your city like?", es: "¿Cómo es tu ciudad?" } },
        { text: "Yes, I understand. Thank you!", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "네, 이해했어요. 감사합니다!", en: "Yes, I understand. Thank you!", es: "Sí, entiendo. ¡Gracias!" } },
        { text: "Can you say that again, please?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" }, recallRound: false },
        { text: "Can you speak more slowly, please?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "더 천천히 말해 주세요?", en: "Can you speak more slowly, please?", es: "¿Puede hablar más despacio?" }, recallRound: false },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: { ko: "어디에서 왔는지 말할 때 'I'm from ___'이라고 해요. 사는 곳은 'I live in ___'. 못 알아들었으면 'Can you say that again?'이 마법의 문장이에요. 너무 빠르면 'Can you speak more slowly?'라고 하면 돼요!", en: "Say 'I'm from ___' to tell people where you're from, and 'I live in ___' for where you live now. These two are different! And here's a lifesaver: 'Can you say that again?' and 'Can you speak more slowly?' — you'll use these in every real conversation.", es: "Di 'I'm from ___' para decir de dónde eres y 'I live in ___' para dónde vives. Son diferentes. Y estas frases te salvan la vida: 'Can you say that again?' y 'Can you speak more slowly?' Las usarás en cada conversación real." },
          examples: { ko: "I'm from Korea. (저는 한국에서 왔어요.)\nI live in Seoul. (서울에 살고 있어요.)\nCan you say that again, please? (다시 한번 말해 주시겠어요?)", en: "I'm from Korea. (That's where I was born or grew up.)\nI live in Seoul. (That's where I am now.)\nCan you speak more slowly, please? (Perfect for when someone talks too fast!)", es: "I'm from Korea. (Soy de Corea.)\nI live in Seoul. (Vivo en Seúl.)\nCan you say that again, please? (¿Puede repetir eso, por favor?)" },
          mistakes: { ko: "❌ I'm from in Korea.\n✅ I'm from Korea. (from 다음에 in 넣으면 안 돼요!)\n❌ I'm from Seoul. (= 서울 출신이에요)\n✅ I live in Seoul. (= 서울에 살고 있어요) — 뜻이 달라요!", en: "❌ I'm from in Korea.\n✅ I'm from Korea. (Don't add 'in' after 'from'!)\n❌ Where you from? (casual but grammatically incomplete)\n✅ Where are you from? (Don't forget 'are'!)", es: "❌ I'm from in Korea.\n✅ I'm from Korea. (No agregues 'in' después de 'from')\n❌ Where you from?\n✅ Where are you from? (No olvides el 'are')" },
          rudyTip: { ko: "'I'm from ___'은 고향, 'I live in ___'은 지금 사는 곳! 이 두 개 구분만 잘하면 대화가 확 자연스러워져~", en: "Quick trick: 'from' = where you're originally from. 'Live in' = where you are now. Two tiny phrases, but they unlock so many conversations!", es: "Truco rápido: 'from' = tu origen. 'Live in' = donde vives ahora. Dos frases pequeñas que abren muchas conversaciones." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "I'm ___ Korea.", answer: "from", options: ["from", "in", "at"], fullSentence: "I'm from Korea.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "select", promptWithBlank: "I ___ in Seoul.", answer: "live", options: ["live", "from", "go"], fullSentence: "I live in Seoul.", fullSentenceMeaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
          { type: "select", promptWithBlank: "Can you say that ___, please?", answer: "again", options: ["again", "more", "once"], fullSentence: "Can you say that again, please?", fullSentenceMeaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" } },
          { type: "input", promptWithBlank: "I'm ___ Korea.", answer: "from", fullSentence: "I'm from Korea.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "listening", audioText: "Can you speak more slowly, please?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Can you speak more slowly, please?", "Can you say that again, please?", "I'm from Korea.", "Yes, I understand."], correct: 0, audioOnly: true },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Soy de Corea.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
        { text: "Vivo en Seúl.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
        { text: "¿Cómo es tu ciudad?", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "당신의 도시는 어때요?", en: "What's your city like?", es: "¿Cómo es tu ciudad?" } },
        { text: "Sí, entiendo. ¡Gracias!", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "네, 이해했어요. 감사합니다!", en: "Yes, I understand. Thank you!", es: "Sí, entiendo. ¡Gracias!" } },
        { text: "¿Puede repetir eso, por favor?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" }, recallRound: false },
        { text: "¿Puede hablar más despacio?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "더 천천히 말해 주세요?", en: "Can you speak more slowly, please?", es: "¿Puede hablar más despacio?" }, recallRound: false },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: { ko: "스페인어로 출신을 말할 때 'Soy de ___'라고 해요. 'Soy'는 '나는 ~이다', 'de'는 '~에서'라는 뜻이에요. 사는 곳은 'Vivo en ___'. 못 알아들었으면 '¿Puede repetir eso?', 너무 빠르면 '¿Puede hablar más despacio?'라고 하세요!", en: "To say where you're from in Spanish, use 'Soy de ___' (I'm from ___). For where you live now, it's 'Vivo en ___'. Two absolute lifesavers: '¿Puede repetir eso?' (Can you repeat that?) and '¿Puede hablar más despacio?' (Can you speak more slowly?).", es: "Para decir de dónde eres, usa 'Soy de ___'. Para dónde vives ahora, 'Vivo en ___'. Dos frases salvavidas: '¿Puede repetir eso?' y '¿Puede hablar más despacio?' Las vas a necesitar en toda conversación real." },
          examples: { ko: "Soy de Corea. (저는 한국에서 왔어요.)\nVivo en Seúl. (서울에 살고 있어요.)\n¿Puede hablar más despacio? (더 천천히 말해 주세요.)", en: "Soy de Corea. (I'm from Korea.)\nVivo en Seúl. (I live in Seoul.)\n¿Puede repetir eso, por favor? (Can you say that again, please?)", es: "Soy de Corea. (Digo mi origen.)\nVivo en Seúl. (Digo dónde vivo ahora.)\n¿Puede hablar más despacio? (Pido que hablen más lento.)" },
          mistakes: { ko: "❌ Soy en Corea.\n✅ Soy de Corea. (출신은 'de'예요, 'en'이 아니에요!)\n❌ Vivo de Seúl.\n✅ Vivo en Seúl. (사는 곳은 'en'이에요!)", en: "❌ Soy en Corea.\n✅ Soy de Corea. (Origin uses 'de', not 'en'!)\n❌ Vivo de Seúl.\n✅ Vivo en Seúl. (Living somewhere uses 'en'!)", es: "❌ Soy en Corea.\n✅ Soy de Corea. (El origen lleva 'de', no 'en')\n❌ Vivo de Seúl.\n✅ Vivo en Seúl. (Donde vives lleva 'en')" },
          rudyTip: { ko: "'Soy de'는 고향, 'Vivo en'은 지금 사는 곳! 영어의 from/live in이랑 같은 느낌이야~ 쉽지?", en: "'Soy de' = where you're from. 'Vivo en' = where you live. Same idea as English 'from' vs 'live in' — easy swap!", es: "'Soy de' = tu origen. 'Vivo en' = donde vives. Es la misma lógica que en inglés, solo cambian las palabras." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Soy ___ Corea.", answer: "de", options: ["de", "en", "a"], fullSentence: "Soy de Corea.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "select", promptWithBlank: "___ en Seúl.", answer: "Vivo", options: ["Vivo", "Soy", "Estoy"], fullSentence: "Vivo en Seúl.", fullSentenceMeaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
          { type: "select", promptWithBlank: "¿Puede ___ eso, por favor?", answer: "repetir", options: ["repetir", "decir", "hablar"], fullSentence: "¿Puede repetir eso, por favor?", fullSentenceMeaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" } },
          { type: "input", promptWithBlank: "Soy ___ Corea.", answer: "de", fullSentence: "Soy de Corea.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "listening", audioText: "¿Puede hablar más despacio?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["¿Puede hablar más despacio?", "¿Puede repetir eso, por favor?", "Soy de Corea.", "Sí. / No."], correct: 0, audioOnly: true },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "저는 한국에서 왔어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
        { text: "서울에 살고 있어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
        { text: "당신의 도시는 어때요?", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "당신의 도시는 어때요?", en: "What's your city like?", es: "¿Cómo es tu ciudad?" } },
        { text: "네, 이해했어요. 감사합니다!", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "네, 이해했어요. 감사합니다!", en: "Yes, I understand. Thank you!", es: "Sí, entiendo. ¡Gracias!" } },
        { text: "다시 한번 말해 주시겠어요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" }, recallRound: false },
        { text: "더 천천히 말해 주세요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "더 천천히 말해 주세요.", en: "Can you speak more slowly, please?", es: "¿Puede hablar más despacio?" }, recallRound: false },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: { ko: "어디에서 왔는지 말할 때 '저는 ___에서 왔어요'라고 해요. '에서'가 출발점을 나타내요. 사는 곳은 '___에 살고 있어요'로, '에'가 위치를 나타내요. 못 알아들었으면 '다시 한번 말해 주시겠어요?', 빠르면 '더 천천히 말해 주세요'라고 하면 돼요!", en: "To say where you're from in Korean, use '저는 ___에서 왔어요'. The key particle is 에서 (from a place). For where you live, say '___에 살고 있어요' with 에 (at a place). And two phrases you'll use constantly: '다시 한번 말해 주시겠어요?' (Can you say that again?) and '더 천천히 말해 주세요' (Please speak more slowly).", es: "Para decir de dónde eres en coreano, usa '저는 ___에서 왔어요'. La partícula clave es 에서 (desde un lugar). Para donde vives: '___에 살고 있어요' con 에 (en un lugar). Y dos frases que usarás siempre: '다시 한번 말해 주시겠어요?' y '더 천천히 말해 주세요'." },
          examples: { ko: "저는 한국에서 왔어요. (출신 말하기)\n서울에 살고 있어요. (사는 곳 말하기)\n다시 한번 말해 주시겠어요? (못 알아들었을 때)", en: "저는 한국에서 왔어요. (I'm from Korea.)\n서울에 살고 있어요. (I live in Seoul.)\n더 천천히 말해 주세요. (Please speak more slowly.)", es: "저는 한국에서 왔어요. (Soy de Corea.)\n서울에 살고 있어요. (Vivo en Seúl.)\n다시 한번 말해 주시겠어요? (¿Puede repetir eso?)" },
          mistakes: { ko: "❌ 저는 한국에 왔어요.\n✅ 저는 한국에서 왔어요. (출신은 '에서'! '에'가 아니에요)\n❌ 서울에서 살고 있어요. (틀린 건 아니지만)\n✅ 서울에 살고 있어요. (사는 곳은 보통 '에'를 써요)", en: "❌ 저는 한국에 왔어요.\n✅ 저는 한국에서 왔어요. (Use 에서 for 'from', not 에!)\n❌ 한국에서 살아요.\n✅ 한국에 살고 있어요. (Use 에 for 'living at', not 에서)", es: "❌ 저는 한국에 왔어요.\n✅ 저는 한국에서 왔어요. (Usa 에서 para 'desde', no 에)\n❌ 한국에서 살아요.\n✅ 한국에 살고 있어요. (Usa 에 para 'vivir en', no 에서)" },
          rudyTip: { ko: "'에서'는 출발점, '에'는 위치! 이 두 개만 구분하면 한국어 장소 표현 마스터야~", en: "Here's the trick: 에서 = from somewhere, 에 = at/in somewhere. Master these two tiny particles and you'll sound way more natural!", es: "El truco: 에서 = desde algún lugar, 에 = en algún lugar. Domina estas dos partículas y sonarás mucho más natural." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "저는 한국___ 왔어요.", answer: "에서", options: ["에서", "에", "을"], fullSentence: "저는 한국에서 왔어요.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "select", promptWithBlank: "서울에 ___ 있어요.", answer: "살고", options: ["살고", "있고", "가고"], fullSentence: "서울에 살고 있어요.", fullSentenceMeaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
          { type: "select", promptWithBlank: "다시 한번 ___ 주시겠어요?", answer: "말해", options: ["말해", "해", "가"], fullSentence: "다시 한번 말해 주시겠어요?", fullSentenceMeaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" } },
          { type: "input", promptWithBlank: "저는 한국___ 왔어요.", answer: "에서", fullSentence: "저는 한국에서 왔어요.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "listening", audioText: "더 천천히 말해 주세요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["더 천천히 말해 주세요.", "다시 한번 말해 주시겠어요?", "저는 한국에서 왔어요.", "네. / 아니요."], correct: 0, audioOnly: true },
        ],
      },
    },
    indonesian: {
      step1Sentences: [
        { text: "Saya berasal dari Korea.", speechLang: "id-ID", meaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
        { text: "Saya tinggal di Seoul.", speechLang: "id-ID", meaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
        { text: "Bagaimana kota Anda?", speechLang: "id-ID", meaning: { ko: "당신의 도시는 어때요?", en: "What's your city like?", es: "¿Cómo es tu ciudad?" } },
        { text: "Ya, saya mengerti. Terima kasih!", speechLang: "id-ID", meaning: { ko: "네, 이해했어요. 감사합니다!", en: "Yes, I understand. Thank you!", es: "Sí, entiendo. ¡Gracias!" } },
        { text: "Bisa tolong ulangi?", speechLang: "id-ID", meaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" }, recallRound: false },
        { text: "Bisa bicara lebih pelan?", speechLang: "id-ID", meaning: { ko: "더 천천히 말해 주세요?", en: "Can you speak more slowly, please?", es: "¿Puede hablar más despacio?" }, recallRound: false },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: { ko: "출신을 말할 때 'Saya berasal dari ___'(저는 ___에서 왔어요)라고 해요. 'berasal dari'가 '~출신이다'예요. 사는 곳은 'Saya tinggal di ___'. 못 알아들으면 'Bisa tolong ulangi?'(다시 말해 주시겠어요?), 너무 빠르면 'Bisa bicara lebih pelan?'(더 천천히요?)라고 하세요!", en: "To say where you're from, use 'Saya berasal dari ___' (I come from ___). For where you live now: 'Saya tinggal di ___'. Two absolute lifesavers: 'Bisa tolong ulangi?' (Can you repeat that?) and 'Bisa bicara lebih pelan?' (Can you speak more slowly?). 'Bisa' just means 'can' — super handy for polite requests.", es: "Para decir de dónde eres, usa 'Saya berasal dari ___'. Para dónde vives ahora: 'Saya tinggal di ___'. Dos frases salvavidas: 'Bisa tolong ulangi?' (¿Puede repetir?) y 'Bisa bicara lebih pelan?' (¿Más despacio?). 'Bisa' significa 'poder'." },
          examples: { ko: "Saya berasal dari Korea. (저는 한국에서 왔어요.)\nSaya tinggal di Seoul. (서울에 살고 있어요.)\nBisa bicara lebih pelan? (더 천천히 말해 주세요.)", en: "Saya berasal dari Korea. (I'm from Korea.)\nSaya tinggal di Seoul. (I live in Seoul.)\nBisa tolong ulangi? (Can you say that again, please?)", es: "Saya berasal dari Korea. (Soy de Corea.)\nSaya tinggal di Seoul. (Vivo en Seúl.)\nBisa tolong ulangi? (¿Puede repetir eso?)" },
          mistakes: { ko: "❌ Saya berasal di Korea.\n✅ Saya berasal dari Korea. (출신은 'dari'예요, 'di'가 아니에요!)\n❌ Saya tinggal dari Seoul.\n✅ Saya tinggal di Seoul. (사는 곳은 'di'예요!)", en: "❌ Saya berasal di Korea.\n✅ Saya berasal dari Korea. (Origin uses 'dari' = from, not 'di'!)\n❌ Saya tinggal dari Seoul.\n✅ Saya tinggal di Seoul. (Living somewhere uses 'di' = at/in!)", es: "❌ Saya berasal di Korea.\n✅ Saya berasal dari Korea. (El origen lleva 'dari' = de, no 'di')\n❌ Saya tinggal dari Seoul.\n✅ Saya tinggal di Seoul. (Donde vives lleva 'di' = en)" },
          rudyTip: { ko: "'dari'는 '~에서/부터'(출신), 'di'는 '~에서/에'(위치)! 이 두 개만 구분하면 인도네시아어 장소 표현이 확 쉬워져~", en: "Here's the trick: 'dari' = from (origin), 'di' = at/in (location). Master these two little words and Indonesian place phrases click instantly!", es: "El truco: 'dari' = de (origen), 'di' = en (ubicación). Domina estas dos palabritas y las frases de lugar fluyen." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Saya berasal ___ Korea.", answer: "dari", options: ["dari", "di", "ke"], fullSentence: "Saya berasal dari Korea.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "select", promptWithBlank: "Saya ___ di Seoul.", answer: "tinggal", options: ["tinggal", "berasal", "pergi"], fullSentence: "Saya tinggal di Seoul.", fullSentenceMeaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl." } },
          { type: "select", promptWithBlank: "Bisa tolong ___?", answer: "ulangi", options: ["ulangi", "bicara", "pergi"], fullSentence: "Bisa tolong ulangi?", fullSentenceMeaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" } },
          { type: "input", promptWithBlank: "Saya berasal ___ Korea.", answer: "dari", fullSentence: "Saya berasal dari Korea.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea." } },
          { type: "listening", audioText: "Bisa bicara lebih pelan?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Bisa bicara lebih pelan?", "Bisa tolong ulangi?", "Saya berasal dari Korea.", "Ya. / Tidak."], correct: 0, audioOnly: true },
        ],
      },
    },
    arabic: {
      step1Sentences: [
        { text: "أَنَا مِنْ كوريا.", speechLang: "ar-EG", meaning: { ko: "ana men Korea · 저는 한국에서 왔어요.", en: "ana men Korea · I'm from Korea.", es: "ana men Korea · Soy de Corea.", id: "ana men Korea · Saya berasal dari Korea." } },
        { text: "أَنَا ساكِن في سيول.", speechLang: "ar-EG", meaning: { ko: "ana saken fi Seoul · 서울에 살고 있어요.", en: "ana saken fi Seoul · I live in Seoul.", es: "ana saken fi Seoul · Vivo en Seúl.", id: "ana saken fi Seoul · Saya tinggal di Seoul." } },
        { text: "كَيْفَ مَدينَتُك؟", speechLang: "ar-EG", meaning: { ko: "madinetak 3amla eh? · 당신의 도시는 어때요?", en: "madinetak 3amla eh? · What's your city like?", es: "madinetak 3amla eh? · ¿Cómo es tu ciudad?", id: "madinetak 3amla eh? · Bagaimana kota Anda?" } },
        { text: "نَعَم، أَنَا فاهِم. شُكْرًا!", speechLang: "ar-EG", meaning: { ko: "aah, ana fahem. shokran! · 네, 이해했어요. 감사합니다!", en: "aah, ana fahem. shokran! · Yes, I understand. Thank you!", es: "aah, ana fahem. shokran! · Sí, entiendo. ¡Gracias!", id: "aah, ana fahem. shokran! · Ya, saya mengerti. Terima kasih!" } },
        { text: "مُمْكِن تَقول مَرّة ثانِية؟", speechLang: "ar-EG", meaning: { ko: "momken te'ool tani? · 다시 한번 말해 주시겠어요?", en: "momken te'ool tani? · Can you say that again, please?", es: "momken te'ool tani? · ¿Puede repetir eso, por favor?", id: "momken te'ool tani? · Bisa tolong ulangi?" }, recallRound: false },
        { text: "مُمْكِن تَتَكَلَّم بِبُطْء؟", speechLang: "ar-EG", meaning: { ko: "momken tetkallem be-raaha? · 더 천천히 말해 주세요?", en: "momken tetkallem be-raaha? · Can you speak more slowly, please?", es: "momken tetkallem be-raaha? · ¿Puede hablar más despacio?", id: "momken tetkallem be-raaha? · Bisa bicara lebih pelan?" }, recallRound: false },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: { ko: "출신을 말할 땐 'أنا مِن ___'(anā min ___, 저는 ___에서 왔어요)라고 해요. 사는 곳은 'أنا ساكِن في ___'(anā sākin fī ___) — 'ساكِن'(sākin)이 '살다/거주하다'예요. 못 알아들으면 'مُمْكِن تَقول مَرّة ثانِية؟'(mumkin taqūl marra thāniya?, 다시 말해 주실래요?), 너무 빠르면 'مُمْكِن تَتَكَلَّم بِبُطْء؟'(bi-buṭʾ = 천천히)라고 하세요. 'مُمْكِن'(mumkin)은 정중한 부탁의 만능 단어예요!", en: "To say where you're from, use 'أنا مِن ___' (anā min ___). For where you live: 'أنا ساكِن في ___' (anā sākin fī ___) — 'ساكِن' (sākin) means 'living/residing'. Lost? 'مُمْكِن تَقول مَرّة ثانِية؟' (mumkin taqūl marra thāniya? — can you say it again?). Too fast? 'مُمْكِن تَتَكَلَّم بِبُطْء؟' ('bi-buṭʾ' = slowly). 'مُمْكِن' (mumkin) is your magic word for any polite request!", es: "Para decir de dónde eres, usa 'أنا مِن ___' (anā min ___). Para dónde vives: 'أنا ساكِن في ___' (anā sākin fī ___) — 'ساكِن' (sākin) significa 'que vive/reside'. ¿Perdido? 'مُمْكِن تَقول مَرّة ثانِية؟' (mumkin taqūl marra thāniya? — ¿puede repetir?). ¿Muy rápido? 'مُمْكِن تَتَكَلَّم بِبُطْء؟' ('bi-buṭʾ' = despacio). '¡مُمْكِن' (mumkin) es tu palabra mágica para cualquier petición educada!" },
          examples: { ko: "أنا مِن كوريا. (anā min Korea · 저는 한국에서 왔어요.)\nأنا ساكِن في سيول. (anā sākin fī Seoul · 서울에 살고 있어요.)\nمُمْكِن تَتَكَلَّم بِبُطْء؟ (mumkin tatakallam bi-buṭʾ? · 더 천천히 말해 주세요.)", en: "أنا مِن كوريا. (anā min Korea · I'm from Korea.)\nأنا ساكِن في سيول. (anā sākin fī Seoul · I live in Seoul.)\nمُمْكِن تَقول مَرّة ثانِية؟ (mumkin taqūl marra thāniya? · Can you say that again?)", es: "أنا مِن كوريا. (anā min Korea · Soy de Corea.)\nأنا ساكِن في سيول. (anā sākin fī Seoul · Vivo en Seúl.)\nمُمْكِن تَقول مَرّة ثانِية؟ (mumkin taqūl marra thāniya? · ¿Puede repetir eso?)" },
          mistakes: { ko: "❌ مُمْكِن تِقول تاني؟ (تاني/tani는 이집트 구어체)\n✅ مُمْكِن تَقول مَرّة ثانِية؟ (mumkin taqūl marra thāniya — 표준어는 'مَرّة ثانِية'!)\n💬 참고: 이집트에선 'بِراحة'(be-raaha, 천천히)라고도 하지만, 표준어 ✅는 'بِبُطْء'(bi-buṭʾ)예요.", en: "❌ مُمْكِن تِقول تاني؟ (تاني / tani is Egyptian colloquial)\n✅ مُمْكِن تَقول مَرّة ثانِية؟ (mumkin taqūl marra thāniya — MSA uses 'مَرّة ثانِية'!)\n💬 Note: Egyptians also say 'بِراحة' (be-raaha — slowly) in dialect, but the MSA ✅ is 'بِبُطْء' (bi-buṭʾ).", es: "❌ مُمْكِن تِقول تاني؟ (تاني / tani es coloquial egipcio)\n✅ مُمْكِن تَقول مَرّة ثانِية؟ (mumkin taqūl marra thāniya — ¡el MSA usa 'مَرّة ثانِية'!)\n💬 Nota: en Egipto también dicen 'بِراحة' (be-raaha — despacio) en dialecto, pero el ✅ en MSA es 'بِبُطْء' (bi-buṭʾ)." },
          rudyTip: { ko: "'مُمْكِن ___؟'(mumkin ___?)는 정중하게 부탁할 때 만능이야! 'مَرّة ثانِية'(marra thāniya, 다시)랑 'بِبُطْء'(bi-buṭʾ, 천천히)만 붙이면 표준어로 대화가 술술 풀려~", en: "'مُمْكِن ___؟' (mumkin ___?) is your all-purpose polite request! Just add 'مَرّة ثانِية' (marra thāniya — again) or 'بِبُطْء' (bi-buṭʾ — slowly) and your MSA conversations flow.", es: "'مُمْكِن ___؟' (mumkin ___?) es tu petición educada para todo. Añade 'مَرّة ثانِية' (marra thāniya — otra vez) o 'بِبُطْء' (bi-buṭʾ — despacio) y tu conversación en MSA fluye." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "أنا ___ كوريا.", answer: "مِنْ", options: ["مِنْ", "في", "عَلى"], fullSentence: "أَنَا مِنْ كوريا.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea.", id: "Saya berasal dari Korea." } },
          { type: "select", promptWithBlank: "أنا ___ في سيول.", answer: "ساكِن", options: ["ساكِن", "مِنْ", "ذاهِب"], fullSentence: "أَنَا ساكِن في سيول.", fullSentenceMeaning: { ko: "서울에 살고 있어요.", en: "I live in Seoul.", es: "Vivo en Seúl.", id: "Saya tinggal di Seoul." } },
          { type: "select", promptWithBlank: "مُمْكِن تَقول ___؟", answer: "مَرّة ثانِية", options: ["مَرّة ثانِية", "بِبُطْء", "كَثيرًا"], fullSentence: "مُمْكِن تَقول مَرّة ثانِية؟", fullSentenceMeaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?", id: "Bisa tolong ulangi?" } },
          { type: "input", promptWithBlank: "أنا ___ كوريا.", answer: "مِنْ", fullSentence: "أَنَا مِنْ كوريا.", fullSentenceMeaning: { ko: "저는 한국에서 왔어요.", en: "I'm from Korea.", es: "Soy de Corea.", id: "Saya berasal dari Korea." } },
          { type: "listening", audioText: "مُمْكِن تَتَكَلَّم بِبُطْء؟", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["مُمْكِن تَتَكَلَّم بِبُطْء؟", "مُمْكِن تَقول مَرّة ثانِية؟", "أَنَا مِنْ كوريا.", "نَعَم. / لا."], correct: 0, audioOnly: true },
        ],
      },
    },
  },

  // ─────────────── Day 3: Jobs + Do you speak ___? ───────────────────────────
  day_3: {
    english: {
      step1Sentences: [
        { text: "What do you do?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" } },
        { text: "I'm a student.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
        { text: "I work at a company.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "저는 회사에 다녀요.", en: "I work at a company.", es: "Trabajo en una empresa." } },
        { text: "Do you speak English?", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Hablas inglés?" }, recallRound: false },
        { text: "A little bit.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "조금이요.", en: "A little bit.", es: "Un poquito." }, recallRound: false },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: { ko: "직업을 말할 때 'I'm a ___'이라고 해요. a를 빼먹으면 안 돼요! 일하는 곳은 'I work at ___'. 상대방에게 언어를 물을 때 'Do you speak ___?'라고 하고, 대답은 'A little bit' 또는 'No, sorry'라고 하면 돼요.", en: "For jobs, say 'I'm a ___' (don't forget the 'a'!). For your workplace, use 'I work at ___'. Want to ask about languages? 'Do you speak ___?' is your go-to. Answer with 'Yes, a little bit' or just 'A little bit' — both are totally fine.", es: "Para trabajos, di 'I'm a ___' (no olvides la 'a'). Para tu lugar de trabajo: 'I work at ___'. Para preguntar sobre idiomas: 'Do you speak ___?' Responde con 'A little bit' o 'No, sorry'." },
          examples: { ko: "I'm a student. (저는 학생이에요.)\nI work at a company. (저는 회사에 다녀요.)\nDo you speak English? — A little bit. (영어 하세요? — 조금이요.)", en: "I'm a teacher. (Talking about your job.)\nI work at a hospital. (Saying where you work.)\nDo you speak Korean? — A little bit. (Asking about someone's language skills.)", es: "I'm a student. (Soy estudiante.)\nI work at a company. (Trabajo en una empresa.)\nDo you speak English? — A little bit. (¿Hablas inglés? — Un poquito.)" },
          mistakes: { ko: "❌ I'm student. (관사 빠졌어요!)\n✅ I'm a student. (직업 앞에 a를 꼭 넣으세요)\n❌ Do you speak in English?\n✅ Do you speak English? (in 넣으면 안 돼요!)", en: "❌ I'm student.\n✅ I'm a student. (Always use 'a' before the job!)\n❌ What are you do?\n✅ What do you do? (The question uses 'do', not 'are')", es: "❌ I'm student.\n✅ I'm a student. (Siempre usa 'a' antes del trabajo)\n❌ What are you do?\n✅ What do you do? (La pregunta usa 'do', no 'are')" },
          rudyTip: { ko: "'Do you speak ___?'는 여행할 때 진짜 유용해! 'A little bit'이라고 겸손하게 대답하면 상대방이 쉽게 말해줄 거야~", en: "'Do you speak ___?' is honestly one of the most useful travel phrases ever. And answering 'A little bit' is a great strategy — people will slow down for you!", es: "'Do you speak ___?' es una de las frases más útiles para viajar. Responder 'A little bit' es gran estrategia: la gente hablará más lento." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "I'm ___ student.", answer: "a", options: ["a", "an", "the"], fullSentence: "I'm a student.", fullSentenceMeaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
          { type: "select", promptWithBlank: "I work ___ a company.", answer: "at", options: ["at", "in", "on"], fullSentence: "I work at a company.", fullSentenceMeaning: { ko: "저는 회사에 다녀요.", en: "I work at a company.", es: "Trabajo en una empresa." } },
          { type: "select", promptWithBlank: "Do you ___ English?", answer: "speak", options: ["speak", "talk", "say"], fullSentence: "Do you speak English?", fullSentenceMeaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Hablas inglés?" } },
          { type: "input", promptWithBlank: "A ___ bit.", answer: "little", fullSentence: "A little bit.", fullSentenceMeaning: { ko: "조금이요.", en: "A little bit.", es: "Un poquito." } },
          { type: "input", promptWithBlank: "What do you ___?", answer: "do", fullSentence: "What do you do?", fullSentenceMeaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" } },
          { type: "listening", audioText: "Do you speak English? A little bit.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Do you speak English? A little bit.", "What do you do?", "I'm a student.", "I work at a company."], correct: 0, audioOnly: true },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "¿A qué te dedicas?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" } },
        { text: "Soy estudiante.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
        { text: "Trabajo en una empresa.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "저는 회사에 다녀요.", en: "I work at a company.", es: "Trabajo en una empresa." } },
        { text: "¿Hablas español?", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "스페인어 할 줄 아세요?", en: "Do you speak Spanish?", es: "¿Hablas español?" }, recallRound: false },
        { text: "Un poquito.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "조금이요.", en: "A little bit.", es: "Un poquito." }, recallRound: false },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: { ko: "스페인어로 직업을 말할 때 'Soy ___'라고 해요 — 영어와 달리 관사(a/an)가 필요 없어요! 일하는 곳은 'Trabajo en ___'. 언어를 물을 때 '¿Hablas ___?'라고 하고, 대답은 'Un poquito'(조금이요)라고 하면 돼요.", en: "In Spanish, say 'Soy ___' for your job — no article needed! (Unlike English 'I'm a teacher', Spanish just says 'Soy profesor'.) For workplace: 'Trabajo en ___'. To ask about languages: '¿Hablas ___?' Answer with 'Un poquito' (a little bit).", es: "Para tu trabajo, di 'Soy ___' sin artículo. Para tu lugar de trabajo: 'Trabajo en ___'. Para preguntar sobre idiomas: '¿Hablas ___?' Responde con 'Un poquito' o 'Sí, un poco'." },
          examples: { ko: "Soy estudiante. (저는 학생이에요.)\nTrabajo en una empresa. (회사에 다녀요.)\n¿Hablas español? — Un poquito. (스페인어 하세요? — 조금이요.)", en: "Soy estudiante. (I'm a student — no article!)\nTrabajo en una empresa. (I work at a company.)\n¿Hablas inglés? — Un poquito. (Do you speak English? — A little bit.)", es: "Soy estudiante. (Digo mi trabajo.)\nTrabajo en una empresa. (Digo dónde trabajo.)\n¿Hablas español? — Un poquito. (Pregunto sobre idiomas.)" },
          mistakes: { ko: "❌ Soy un estudiante.\n✅ Soy estudiante. (스페인어는 직업 앞에 관사 안 써요!)\n❌ ¿Hablas en español?\n✅ ¿Hablas español? ('en' 빼세요!)", en: "❌ Soy un estudiante.\n✅ Soy estudiante. (No article before jobs in Spanish!)\n❌ ¿Habla español? (formal 'usted')\n✅ ¿Hablas español? (Use 'hablas' for informal 'tú')", es: "❌ Soy un estudiante.\n✅ Soy estudiante. (Sin artículo antes de profesiones)\n❌ ¿Hablas en español?\n✅ ¿Hablas español? (Sin 'en' después de 'hablas')" },
          rudyTip: { ko: "영어는 'I'm a student'인데 스페인어는 그냥 'Soy estudiante'! 관사가 없으니까 오히려 더 쉽지? ^^", en: "Unlike English, Spanish drops the article for jobs: 'Soy profesor' not 'Soy un profesor.' One less thing to remember!", es: "A diferencia del inglés, el español no usa artículo para profesiones: 'Soy profesor', no 'Soy un profesor.' Una cosa menos que recordar." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Soy ___.", answer: "estudiante", options: ["estudiante", "profesor", "detective"], fullSentence: "Soy estudiante.", fullSentenceMeaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
          { type: "select", promptWithBlank: "Trabajo ___ una empresa.", answer: "en", options: ["en", "a", "de"], fullSentence: "Trabajo en una empresa.", fullSentenceMeaning: { ko: "저는 회사에 다녀요.", en: "I work at a company.", es: "Trabajo en una empresa." } },
          { type: "select", promptWithBlank: "¿___ español?", answer: "Hablas", options: ["Hablas", "Habla", "Hablo"], fullSentence: "¿Hablas español?", fullSentenceMeaning: { ko: "스페인어 할 줄 아세요?", en: "Do you speak Spanish?", es: "¿Hablas español?" } },
          { type: "input", promptWithBlank: "Un ___.", answer: "poquito", fullSentence: "Un poquito.", fullSentenceMeaning: { ko: "조금이요.", en: "A little bit.", es: "Un poquito." } },
          { type: "input", promptWithBlank: "¿A qué te ___?", answer: "dedicas", fullSentence: "¿A qué te dedicas?", fullSentenceMeaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" } },
          { type: "listening", audioText: "¿Hablas español? Un poquito.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["¿Hablas español? Un poquito.", "¿A qué te dedicas?", "Soy estudiante.", "Trabajo en una empresa."], correct: 0, audioOnly: true },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "무슨 일 하세요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" } },
        { text: "저는 학생이에요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
        { text: "저는 회사에 다녀요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "저는 회사에 다녀요.", en: "I work at a company.", es: "Trabajo en una empresa." } },
        { text: "한국어 할 줄 아세요?", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "한국어 할 줄 아세요?", en: "Do you speak Korean?", es: "¿Hablas coreano?" }, recallRound: false },
        { text: "조금이요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "조금이요.", en: "A little bit.", es: "Un poquito." }, recallRound: false },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: { ko: "직업을 말할 때 '저는 ___이에요/예요'라고 해요. 일하는 곳은 '___에 다녀요'나 '___에서 일해요'. 언어를 물을 때 '___할 줄 아세요?'라고 하면 돼요. '할 줄 알다'는 '할 수 있다'보다 자연스러운 표현이에요!", en: "For jobs in Korean, say '저는 ___이에요' (I'm a ___). For workplace: '___에 다녀요' (I go to ___) or '___에서 일해요' (I work at ___). To ask about languages: '___할 줄 아세요?' This literally means 'Do you know how to do ___?' — it's how Koreans naturally ask about language skills.", es: "Para trabajos en coreano, di '저는 ___이에요' (Soy ___). Para lugar de trabajo: '___에 다녀요' o '___에서 일해요'. Para preguntar idiomas: '___할 줄 아세요?' Literalmente significa '¿Sabes hacer ___?' — así preguntan los coreanos sobre habilidades lingüísticas." },
          examples: { ko: "저는 학생이에요. (직업 말하기)\n저는 회사에 다녀요. (일하는 곳 말하기)\n한국어 할 줄 아세요? — 조금이요. (언어 물어보기)", en: "저는 학생이에요. (I'm a student.)\n저는 회사에 다녀요. (I work at a company.)\n한국어 할 줄 아세요? — 조금이요. (Do you speak Korean? — A little.)", es: "저는 학생이에요. (Soy estudiante.)\n저는 회사에 다녀요. (Trabajo en una empresa.)\n한국어 할 줄 아세요? — 조금이요. (¿Hablas coreano? — Un poquito.)" },
          mistakes: { ko: "❌ 저는 학생예요.\n✅ 저는 학생이에요. (학생은 받침이 있으니까 '이에요'!)\n❌ 영어 할 수 아세요?\n✅ 영어 할 줄 아세요? ('수'가 아니라 '줄'이에요!)", en: "❌ 저는 학생예요.\n✅ 저는 학생이에요. (학생 ends in ㅇ consonant, so use 이에요!)\n❌ 영어 할 수 아세요?\n✅ 영어 할 줄 아세요? (Use 줄 not 수 with 알다!)", es: "❌ 저는 학생예요.\n✅ 저는 학생이에요. (학생 termina en consonante, usa 이에요)\n❌ 영어 할 수 아세요?\n✅ 영어 할 줄 아세요? (Usa 줄 no 수 con 알다)" },
          rudyTip: { ko: "'할 줄 아세요?'는 진짜 한국 사람처럼 들리는 표현이야! '조금이요'라고 겸손하게 대답하면 한국인들이 엄청 좋아해~", en: "'할 줄 아세요?' sounds super natural in Korean! And answering with '조금이요' (just a little) is the perfect humble response — Koreans love it!", es: "'할 줄 아세요?' suena súper natural en coreano. Y responder con '조금이요' (solo un poco) es la respuesta humilde perfecta: a los coreanos les encanta." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "저는 ___이에요.", answer: "학생", options: ["학생", "선생님", "탐정"], fullSentence: "저는 학생이에요.", fullSentenceMeaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
          { type: "select", promptWithBlank: "저는 회사___ 다녀요.", answer: "에", options: ["에", "에서", "이"], fullSentence: "저는 회사에 다녀요.", fullSentenceMeaning: { ko: "저는 회사에 다녀요.", en: "I work at a company.", es: "Trabajo en una empresa." } },
          { type: "select", promptWithBlank: "한국어 할 ___ 아세요?", answer: "줄", options: ["줄", "것", "수"], fullSentence: "한국어 할 줄 아세요?", fullSentenceMeaning: { ko: "한국어 할 줄 아세요?", en: "Do you speak Korean?", es: "¿Hablas coreano?" } },
          { type: "input", promptWithBlank: "___이요.", answer: "조금", fullSentence: "조금이요.", fullSentenceMeaning: { ko: "조금이요.", en: "A little bit.", es: "Un poquito." } },
          { type: "input", promptWithBlank: "무슨 ___ 하세요?", answer: "일", fullSentence: "무슨 일 하세요?", fullSentenceMeaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" } },
          { type: "listening", audioText: "한국어 할 줄 아세요? 조금이요.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["한국어 할 줄 아세요? 조금이요.", "무슨 일 하세요?", "저는 학생이에요.", "저는 회사에 다녀요."], correct: 0, audioOnly: true },
        ],
      },
    },
    indonesian: {
      step1Sentences: [
        { text: "Apa pekerjaan Anda?", speechLang: "id-ID", meaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" } },
        { text: "Saya seorang pelajar.", speechLang: "id-ID", meaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
        { text: "Saya bekerja di sebuah perusahaan.", speechLang: "id-ID", meaning: { ko: "저는 회사에 다녀요.", en: "I work at a company.", es: "Trabajo en una empresa." } },
        { text: "Apakah kamu bisa bahasa Inggris?", speechLang: "id-ID", meaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Hablas inglés?" }, recallRound: false },
        { text: "Sedikit saja.", speechLang: "id-ID", meaning: { ko: "조금이요.", en: "A little bit.", es: "Un poquito." }, recallRound: false },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: { ko: "직업을 말할 때 'Saya seorang ___'(저는 ___예요)라고 해요. 'seorang'은 사람을 셀 때 쓰는 말이에요. 일하는 곳은 'Saya bekerja di ___'. 상대방에게 언어를 물을 때 'Apakah kamu bisa bahasa ___?'라고 하고, 대답은 'Sedikit saja'(조금이요)라고 하면 돼요.", en: "For jobs, say 'Saya seorang ___' (I'm a ___). 'Seorang' is a counter word for people. For your workplace: 'Saya bekerja di ___'. To ask about languages: 'Apakah kamu bisa bahasa ___?' Answer with 'Sedikit saja' (just a little). 'Bisa' literally means 'can', so it's 'Can you do English language?'", es: "Para trabajos, di 'Saya seorang ___' (Soy ___). 'Seorang' cuenta personas. Para tu trabajo: 'Saya bekerja di ___'. Para preguntar idiomas: 'Apakah kamu bisa bahasa ___?' Responde con 'Sedikit saja' (solo un poco)." },
          examples: { ko: "Saya seorang pelajar. (저는 학생이에요.)\nSaya bekerja di sebuah perusahaan. (저는 회사에 다녀요.)\nApakah kamu bisa bahasa Inggris? — Sedikit saja. (영어 하세요? — 조금이요.)", en: "Saya seorang pelajar. (I'm a student.)\nSaya bekerja di sebuah perusahaan. (I work at a company.)\nApakah kamu bisa bahasa Inggris? — Sedikit saja. (Do you speak English? — A little bit.)", es: "Saya seorang pelajar. (Soy estudiante.)\nSaya bekerja di sebuah perusahaan. (Trabajo en una empresa.)\nApakah kamu bisa bahasa Inggris? — Sedikit saja. (¿Hablas inglés? — Un poquito.)" },
          mistakes: { ko: "❌ Saya bekerja di Inggris bahasa.\n✅ Apakah kamu bisa bahasa Inggris? ('bahasa' 다음에 언어 이름! 'bahasa Inggris' 순서예요)\n❌ Saya pelajar seorang.\n✅ Saya seorang pelajar. ('seorang'이 직업 앞에 와요!)", en: "❌ Apakah kamu bisa Inggris bahasa?\n✅ Apakah kamu bisa bahasa Inggris? (Language name comes after 'bahasa' — 'bahasa Inggris')\n❌ Saya pelajar seorang.\n✅ Saya seorang pelajar. ('Seorang' goes before the job!)", es: "❌ Apakah kamu bisa Inggris bahasa?\n✅ Apakah kamu bisa bahasa Inggris? (El idioma va después de 'bahasa')\n❌ Saya pelajar seorang.\n✅ Saya seorang pelajar. ('Seorang' va antes del trabajo)" },
          rudyTip: { ko: "'Apakah kamu bisa bahasa Inggris?'는 여행할 때 진짜 유용해! 'Sedikit saja'(조금이요)라고 겸손하게 대답하면 상대가 쉽게 말해줘~", en: "'Apakah kamu bisa bahasa Inggris?' is super useful when traveling! Answer 'Sedikit saja' (just a little) and people will slow down for you.", es: "'Apakah kamu bisa bahasa Inggris?' es muy útil al viajar. Responde 'Sedikit saja' y la gente hablará más lento." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Saya ___ pelajar.", answer: "seorang", options: ["seorang", "sebuah", "sedikit"], fullSentence: "Saya seorang pelajar.", fullSentenceMeaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante." } },
          { type: "select", promptWithBlank: "Saya ___ di sebuah perusahaan.", answer: "bekerja", options: ["bekerja", "tinggal", "berasal"], fullSentence: "Saya bekerja di sebuah perusahaan.", fullSentenceMeaning: { ko: "저는 회사에 다녀요.", en: "I work at a company.", es: "Trabajo en una empresa." } },
          { type: "select", promptWithBlank: "Apakah kamu bisa ___ Inggris?", answer: "bahasa", options: ["bahasa", "kata", "suara"], fullSentence: "Apakah kamu bisa bahasa Inggris?", fullSentenceMeaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Hablas inglés?" } },
          { type: "input", promptWithBlank: "Sedikit ___.", answer: "saja", fullSentence: "Sedikit saja.", fullSentenceMeaning: { ko: "조금이요.", en: "A little bit.", es: "Un poquito." } },
          { type: "input", promptWithBlank: "Apa ___ Anda?", answer: "pekerjaan", fullSentence: "Apa pekerjaan Anda?", fullSentenceMeaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" } },
          { type: "listening", audioText: "Apakah kamu bisa bahasa Inggris? Sedikit saja.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Apakah kamu bisa bahasa Inggris? Sedikit saja.", "Apa pekerjaan Anda?", "Saya seorang pelajar.", "Saya bekerja di sebuah perusahaan."], correct: 0, audioOnly: true },
        ],
      },
    },
    arabic: {
      step1Sentences: [
        { text: "ماذا تَعْمَل؟", speechLang: "ar-EG", meaning: { ko: "beteshtaghal eh? · 무슨 일 하세요?", en: "beteshtaghal eh? · What do you do?", es: "beteshtaghal eh? · ¿A qué te dedicas?", id: "beteshtaghal eh? · Apa pekerjaan Anda?" } },
        { text: "أَنَا طالِب.", speechLang: "ar-EG", meaning: { ko: "ana taleb · 저는 학생이에요.", en: "ana taleb · I'm a student.", es: "ana taleb · Soy estudiante.", id: "ana taleb · Saya seorang pelajar." } },
        { text: "أَنَا أَعْمَل في شَرِكة.", speechLang: "ar-EG", meaning: { ko: "ana bashtaghal fi sherka · 저는 회사에 다녀요.", en: "ana bashtaghal fi sherka · I work at a company.", es: "ana bashtaghal fi sherka · Trabajo en una empresa.", id: "ana bashtaghal fi sherka · Saya bekerja di sebuah perusahaan." } },
        { text: "هَلْ تَتَكَلَّم الإنْجِليزِيّة؟", speechLang: "ar-EG", meaning: { ko: "beteklem engelizi? · 영어 할 줄 아세요?", en: "beteklem engelizi? · Do you speak English?", es: "beteklem engelizi? · ¿Hablas inglés?", id: "beteklem engelizi? · Apakah kamu bisa bahasa Inggris?" }, recallRound: false },
        { text: "قَليلًا.", speechLang: "ar-EG", meaning: { ko: "shwaya · 조금이요.", en: "shwaya · A little bit.", es: "shwaya · Un poquito.", id: "shwaya · Sedikit saja." }, recallRound: false },
      ],
      step1Config: {
        hasAudioOnlyRound: false,
      },
      step2: {
        explanation: {
          pattern: { ko: "직업을 물을 땐 'ماذا تَعْمَل؟'(mādhā taʿmal?, 무슨 일 해요?)라고 해요 — 'ماذا'(mādhā)가 표준어 '뭐?'예요. 직업은 'أنا ___'(anā ___, 저는 ___예요), 일하는 곳은 'أَعْمَل في ___'(aʿmal fī ___, ~에서 일해요). 언어를 물을 땐 'هَل تَتَكَلَّم ___؟'(hal tatakallam ___?), 대답은 'قَليلًا'(qalīlan, 조금)!", en: "To ask about jobs, say 'ماذا تَعْمَل؟' (mādhā taʿmal? — what do you do?). 'ماذا' (mādhā) is the standard 'what?'. Your job: 'أنا ___' (anā ___). Where you work: 'أَعْمَل في ___' (aʿmal fī ___ — I work at ___). Ask about languages with 'هَل تَتَكَلَّم ___؟' (hal tatakallam ___?) and answer 'قَليلًا' (qalīlan — a little)!", es: "Para preguntar por el trabajo, di 'ماذا تَعْمَل؟' (mādhā taʿmal? — ¿a qué te dedicas?). 'ماذا' (mādhā) es el '¿qué?' estándar. Tu trabajo: 'أنا ___' (anā ___). Dónde trabajas: 'أَعْمَل في ___' (aʿmal fī ___ — trabajo en ___). Pregunta por idiomas con 'هَل تَتَكَلَّم ___؟' (hal tatakallam ___?) y responde 'قَليلًا' (qalīlan — un poco)." },
          examples: { ko: "أنا طالِب. (anā ṭālib · 저는 학생이에요.)\nأنا أَعْمَل في شَرِكة. (anā aʿmal fī sharika · 저는 회사에 다녀요.)\nهَل تَتَكَلَّم الإنْجِليزِيّة؟ — قَليلًا. (hal tatakallam al-injilīziyya? — qalīlan · 영어 하세요? — 조금이요.)", en: "أنا طالِب. (anā ṭālib · I'm a student.)\nأنا أَعْمَل في شَرِكة. (anā aʿmal fī sharika · I work at a company.)\nهَل تَتَكَلَّم الإنْجِليزِيّة؟ — قَليلًا. (hal tatakallam al-injilīziyya? — qalīlan · Do you speak English? — A little.)", es: "أنا طالِب. (anā ṭālib · Soy estudiante.)\nأنا أَعْمَل في شَرِكة. (anā aʿmal fī sharika · Trabajo en una empresa.)\nهَل تَتَكَلَّم الإنْجِليزِيّة؟ — قَليلًا. (hal tatakallam al-injilīziyya? — qalīlan · ¿Hablas inglés? — Un poquito.)" },
          mistakes: { ko: "❌ بِتِشْتَغَل إيه؟ (إيه/eh는 이집트 구어체 '뭐?')\n✅ ماذا تَعْمَل؟ (mādhā taʿmal? — 표준어는 'ماذا'!)\n💬 참고: 이집트에선 'شْوَيّة'(shwaya, 조금)라고도 하지만, 표준어 ✅는 'قَليلًا'(qalīlan)예요.", en: "❌ بِتِشْتَغَل إيه؟ (إيه / eh is the Egyptian colloquial 'what?')\n✅ ماذا تَعْمَل؟ (mādhā taʿmal? — MSA uses 'ماذا'!)\n💬 Note: Egyptians also say 'شْوَيّة' (shwaya — a little) in dialect, but the MSA ✅ is 'قَليلًا' (qalīlan).", es: "❌ بِتِشْتَغَل إيه؟ (إيه / eh es el '¿qué?' coloquial egipcio)\n✅ ماذا تَعْمَل؟ (mādhā taʿmal? — ¡el MSA usa 'ماذا'!)\n💬 Nota: en Egipto también dicen 'شْوَيّة' (shwaya — un poco) en dialecto, pero el ✅ en MSA es 'قَليلًا' (qalīlan)." },
          rudyTip: { ko: "'ماذا؟'(mādhā?)만 알면 표준어 질문 절반은 끝! 동사 앞에 'ماذا'를 붙여 'ماذا تَعْمَل؟'처럼 물으면 돼~ 'قَليلًا'(qalīlan)는 어디서나 쓰는 겸손한 대답이야!", en: "Learn 'ماذا؟' (mādhā?) and half your MSA questions are done! Put 'ماذا' before the verb, like 'ماذا تَعْمَل؟'. And 'قَليلًا' (qalīlan) is a humble answer that works anywhere!", es: "Aprende 'ماذا؟' (mādhā?) y la mitad de tus preguntas en MSA están listas. Pon 'ماذا' antes del verbo, como 'ماذا تَعْمَل؟'. ¡Y 'قَليلًا' (qalīlan) es una respuesta modesta que sirve en todas partes!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ تَعْمَل؟", answer: "ماذا", options: ["ماذا", "مَنْ", "أَيْنَ"], fullSentence: "ماذا تَعْمَل؟", fullSentenceMeaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?", id: "Apa pekerjaan Anda?" } },
          { type: "select", promptWithBlank: "أَنَا أَعْمَل ___ شَرِكة.", answer: "في", options: ["في", "مِنْ", "عَلى"], fullSentence: "أَنَا أَعْمَل في شَرِكة.", fullSentenceMeaning: { ko: "저는 회사에 다녀요.", en: "I work at a company.", es: "Trabajo en una empresa.", id: "Saya bekerja di sebuah perusahaan." } },
          { type: "select", promptWithBlank: "هَلْ تَتَكَلَّم ___؟", answer: "الإنْجِليزِيّة", options: ["الإنْجِليزِيّة", "شَرِكة", "طالِب"], fullSentence: "هَلْ تَتَكَلَّم الإنْجِليزِيّة؟", fullSentenceMeaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Hablas inglés?", id: "Apakah kamu bisa bahasa Inggris?" } },
          { type: "input", promptWithBlank: "___.", answer: "قَليلًا", fullSentence: "قَليلًا.", fullSentenceMeaning: { ko: "조금이요.", en: "A little bit.", es: "Un poquito.", id: "Sedikit saja." } },
          { type: "input", promptWithBlank: "أنا ___.", answer: "طالِب", fullSentence: "أَنَا طالِب.", fullSentenceMeaning: { ko: "저는 학생이에요.", en: "I'm a student.", es: "Soy estudiante.", id: "Saya seorang pelajar." } },
          { type: "listening", audioText: "هَلْ تَتَكَلَّم الإنْجِليزِيّة؟ قَليلًا.", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["هَلْ تَتَكَلَّم الإنْجِليزِيّة؟ قَليلًا.", "ماذا تَعْمَل؟", "أَنَا طالِب.", "أَنَا أَعْمَل في شَرِكة."], correct: 0, audioOnly: true },
        ],
      },
    },
  },

  // ─────────────── Day 4: Goodbye + Where is ___? ────────────────────────────
  day_4: {
    english: {
      step1Sentences: [
        { text: "Goodbye! See you later.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "안녕히 가세요! 다음에 봐요.", en: "Goodbye! See you later.", es: "¡Adiós! Hasta luego." } },
        { text: "Take care!", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "잘 가요!", en: "Take care!", es: "¡Cuídate!" } },
        { text: "It was nice meeting you.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
        { text: "Where is the bathroom?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" }, recallRound: true },
        { text: "Excuse me, where is the exit?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "실례합니다, 출구가 어디예요?", en: "Excuse me, where is the exit?", es: "Disculpe, ¿dónde está la salida?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "작별 인사는 상황에 따라 달라요. 'Goodbye'는 격식, 'Bye'는 캐주얼, 'See you later'는 다시 만날 때. 장소를 물을 때 'Where is ___?'를 쓰고, 앞에 'Excuse me'를 붙이면 훨씬 예의 바른 표현이 돼요!", en: "Goodbye has levels! 'Goodbye' = formal. 'Bye' = casual with friends. 'See you later' = when you'll meet again. For asking directions, use 'Where is ___?' and always start with 'Excuse me' — it makes a huge difference in politeness.", es: "Despedirse tiene niveles. 'Goodbye' = formal. 'Bye' = casual. 'See you later' = cuando te verás de nuevo. Para pedir direcciones: 'Where is ___?' Y siempre empieza con 'Excuse me' — hace una gran diferencia en educación." },
          examples: { ko: "Goodbye! See you later. (안녕히 가세요! 다음에 봐요.)\nWhere is the bathroom? (화장실이 어디예요?)\nExcuse me, where is the exit? (실례합니다, 출구가 어디예요?)", en: "See you later! (Casual goodbye when you'll meet again.)\nWhere is the bathroom? (The #1 question every traveler needs!)\nExcuse me, where is the exit? (Polite way to ask for directions.)", es: "See you later! (Adiós casual cuando te verás de nuevo.)\nWhere is the bathroom? (¿Dónde está el baño?)\nExcuse me, where is the exit? (Disculpe, ¿dónde está la salida?)" },
          mistakes: { ko: "❌ Where is bathroom?\n✅ Where is the bathroom? ('the'를 꼭 넣으세요!)\n❌ See you after.\n✅ See you later. ('after'가 아니라 'later'예요!)", en: "❌ Where is bathroom?\n✅ Where is the bathroom? (Don't forget 'the'!)\n❌ It was nice to meeting you.\n✅ It was nice meeting you. (No 'to' before 'meeting'!)", es: "❌ Where is bathroom?\n✅ Where is the bathroom? (No olvides 'the')\n❌ It was nice to meeting you.\n✅ It was nice meeting you. (Sin 'to' antes de 'meeting')" },
          rudyTip: { ko: "'Excuse me, where is ___?'는 여행할 때 가장 많이 쓰는 문장이야! 이것만 외워두면 어디서든 길을 찾을 수 있어~", en: "'Excuse me, where is ___?' is THE travel phrase. Master this one pattern and you can find anything, anywhere!", es: "'Excuse me, where is ___?' es LA frase de viaje. Domina este patrón y podrás encontrar cualquier cosa, en cualquier lugar." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "See you ___!", answer: "later", options: ["later", "after", "next"], fullSentence: "See you later!", fullSentenceMeaning: { ko: "다음에 봐요!", en: "See you later!", es: "¡Hasta luego!" } },
          { type: "select", promptWithBlank: "It was nice ___ you.", answer: "meeting", options: ["meeting", "meet", "met"], fullSentence: "It was nice meeting you.", fullSentenceMeaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
          { type: "select", promptWithBlank: "___ is the bathroom?", answer: "Where", options: ["Where", "What", "How"], fullSentence: "Where is the bathroom?", fullSentenceMeaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" } },
          { type: "input", promptWithBlank: "___ me, where is the exit?", answer: "Excuse", fullSentence: "Excuse me, where is the exit?", fullSentenceMeaning: { ko: "실례합니다, 출구가 어디예요?", en: "Excuse me, where is the exit?", es: "Disculpe, ¿dónde está la salida?" } },
          { type: "input", promptWithBlank: "Take ___!", answer: "care", fullSentence: "Take care!", fullSentenceMeaning: { ko: "잘 가요!", en: "Take care!", es: "¡Cuídate!" } },
          { type: "listening", audioText: "Excuse me, where is the exit?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Excuse me, where is the exit?", "Where is the bathroom?", "Goodbye! See you later.", "Take care!"], correct: 0, audioOnly: true },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "¡Adiós! Hasta luego.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "안녕히 가세요! 다음에 봐요.", en: "Goodbye! See you later.", es: "¡Adiós! Hasta luego." } },
        { text: "¡Cuídate!", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "잘 가요!", en: "Take care!", es: "¡Cuídate!" } },
        { text: "Fue un placer conocerte.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
        { text: "¿Dónde está el baño?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" }, recallRound: true },
        { text: "Disculpe, ¿dónde está la salida?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "실례합니다, 출구가 어디예요?", en: "Excuse me, where is the exit?", es: "Disculpe, ¿dónde está la salida?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "'Adiós'는 격식 있는 작별, 'Hasta luego'는 '다음에 봐요' 느낌이에요. 장소를 찾을 때 '¿Dónde está ___?'를 쓰고, 앞에 'Disculpe'(실례합니다)를 붙이면 훨씬 공손해져요!", en: "'Adiós' is the formal goodbye, while 'Hasta luego' means 'see you later' — more casual and friendly. To find places, ask '¿Dónde está ___?' Starting with 'Disculpe' (excuse me) instantly makes you sound more polite.", es: "'Adiós' es la despedida formal, y 'Hasta luego' es más casual, como decir 'nos vemos'. Para encontrar lugares: '¿Dónde está ___?' Empezar con 'Disculpe' te hace sonar mucho más educado." },
          examples: { ko: "¡Adiós! Hasta luego. (안녕히 가세요! 다음에 봐요.)\n¿Dónde está el baño? (화장실이 어디예요?)\nDisculpe, ¿dónde está la salida? (실례합니다, 출구가 어디예요?)", en: "¡Adiós! Hasta luego. (Goodbye! See you later.)\n¿Dónde está el baño? (Where is the bathroom?)\nDisculpe, ¿dónde está la salida? (Excuse me, where is the exit?)", es: "¡Adiós! Hasta luego. (Despedida completa.)\n¿Dónde está el baño? (Pregunta esencial para viajeros.)\nDisculpe, ¿dónde está la salida? (Forma educada de preguntar.)" },
          mistakes: { ko: "❌ ¿Donde está el baño?\n✅ ¿Dónde está el baño? ('Dónde'에 악센트 잊지 마세요!)\n❌ Hasta later.\n✅ Hasta luego. (스페인어랑 영어 섞지 마세요 ^^)", en: "❌ ¿Donde está el baño?\n✅ ¿Dónde está el baño? (Don't forget the accent on Dónde!)\n❌ ¿Dónde es el baño?\n✅ ¿Dónde está el baño? (Use 'está' for location, not 'es'!)", es: "❌ ¿Donde está el baño?\n✅ ¿Dónde está el baño? (No olvides la tilde en Dónde)\n❌ ¿Dónde es el baño?\n✅ ¿Dónde está el baño? (Usa 'está' para ubicación, no 'es')" },
          rudyTip: { ko: "'¿Dónde está ___?'만 알면 스페인어권 어디서든 길 찾기 성공! 'Disculpe' 한마디면 사람들이 더 친절하게 알려줘~", en: "'¿Dónde está ___?' — memorize this pattern and you can find anything in any Spanish-speaking country! Adding 'Disculpe' makes people way more willing to help.", es: "'¿Dónde está ___?' — memoriza este patrón y podrás encontrar cualquier cosa. Agregar 'Disculpe' hace que la gente quiera ayudarte más." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "¡Hasta ___!", answer: "luego", options: ["luego", "mañana", "pronto"], fullSentence: "¡Hasta luego!", fullSentenceMeaning: { ko: "다음에 봐요!", en: "See you later!", es: "¡Hasta luego!" } },
          { type: "select", promptWithBlank: "Fue ___ placer conocerte.", answer: "un", options: ["un", "el", "una"], fullSentence: "Fue un placer conocerte.", fullSentenceMeaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
          { type: "select", promptWithBlank: "¿___ está el baño?", answer: "Dónde", options: ["Dónde", "Qué", "Cómo"], fullSentence: "¿Dónde está el baño?", fullSentenceMeaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" } },
          { type: "input", promptWithBlank: "___, ¿dónde está la salida?", answer: "Disculpe", fullSentence: "Disculpe, ¿dónde está la salida?", fullSentenceMeaning: { ko: "실례합니다, 출구가 어디예요?", en: "Excuse me, where is the exit?", es: "Disculpe, ¿dónde está la salida?" } },
          { type: "input", promptWithBlank: "¡___!", answer: "Cuídate", fullSentence: "¡Cuídate!", fullSentenceMeaning: { ko: "잘 가요!", en: "Take care!", es: "¡Cuídate!" } },
          { type: "listening", audioText: "Disculpe, ¿dónde está la salida?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Disculpe, ¿dónde está la salida?", "¿Dónde está el baño?", "¡Adiós! Hasta luego.", "¡Cuídate!"], correct: 0, audioOnly: true },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "안녕히 가세요! 다음에 봐요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "안녕히 가세요! 다음에 봐요.", en: "Goodbye! See you later.", es: "¡Adiós! Hasta luego." } },
        { text: "잘 가요!", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "잘 가요!", en: "Take care!", es: "¡Cuídate!" } },
        { text: "만나서 반가웠어요.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
        { text: "화장실이 어디예요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" }, recallRound: true },
        { text: "실례합니다, 출구가 어디예요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "실례합니다, 출구가 어디예요?", en: "Excuse me, where is the exit?", es: "Disculpe, ¿dónde está la salida?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "'안녕히 가세요'는 떠나는 사람에게, '안녕히 계세요'는 남는 사람에게 하는 인사예요. 장소를 물을 때 '___이/가 어디예요?'를 쓰고, 받침 있으면 '이', 없으면 '가'를 써요. '실례합니다'로 시작하면 더 예의 바른 느낌이에요!", en: "Korean farewells have a twist: '안녕히 가세요' = said to someone leaving, '안녕히 계세요' = said to someone staying. For directions, use '___이/가 어디예요?' The particle changes: 이 after consonant, 가 after vowel. Start with '실례합니다' (excuse me) for extra politeness.", es: "Las despedidas en coreano tienen truco: '안녕히 가세요' = al que se va, '안녕히 계세요' = al que se queda. Para direcciones: '___이/가 어디예요?' La partícula cambia: 이 después de consonante, 가 después de vocal. Empieza con '실례합니다' para ser más educado." },
          examples: { ko: "안녕히 가세요! 다음에 봐요. (공손한 작별 인사)\n화장실이 어디예요? (장소 물어보기)\n실례합니다, 출구가 어디예요? (예의 바르게 질문하기)", en: "안녕히 가세요! (Goodbye — said to someone leaving.)\n화장실이 어디예요? (Where is the bathroom?)\n실례합니다, 출구가 어디예요? (Excuse me, where is the exit?)", es: "안녕히 가세요! (Adiós — se dice al que se va.)\n화장실이 어디예요? (¿Dónde está el baño?)\n실례합니다, 출구가 어디예요? (Disculpe, ¿dónde está la salida?)" },
          mistakes: { ko: "❌ 화장실가 어디예요?\n✅ 화장실이 어디예요? (화장실은 받침 'ㄹ'이 있으니까 '이'!)\n❌ 출구이 어디예요?\n✅ 출구가 어디예요? (출구는 받침이 없으니까 '가'!)", en: "❌ 화장실가 어디예요?\n✅ 화장실이 어디예요? (화장실 ends in ㄹ, so use 이 not 가!)\n❌ 출구이 어디예요?\n✅ 출구가 어디예요? (출구 ends in a vowel, so use 가!)", es: "❌ 화장실가 어디예요?\n✅ 화장실이 어디예요? (화장실 termina en consonante, usa 이)\n❌ 출구이 어디예요?\n✅ 출구가 어디예요? (출구 termina en vocal, usa 가)" },
          rudyTip: { ko: "'이/가 어디예요?'는 한국 여행에서 제일 많이 쓸 문장이야! '실례합니다'까지 붙이면 한국인들이 진짜 친절하게 알려줘~", en: "'___이/가 어디예요?' is the ultimate Korean travel phrase! Pair it with '실례합니다' and watch how helpful everyone becomes.", es: "'___이/가 어디예요?' es la frase coreana definitiva para viajar. Combínala con '실례합니다' y verás lo amable que se vuelve la gente." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "잘 ___!", answer: "가요", options: ["가요", "봐요", "해요"], fullSentence: "잘 가요!", fullSentenceMeaning: { ko: "잘 가요!", en: "Take care!", es: "¡Cuídate!" } },
          { type: "select", promptWithBlank: "만나서 ___어요.", answer: "반가웠", options: ["반가웠", "고마웠", "즐거웠"], fullSentence: "만나서 반가웠어요.", fullSentenceMeaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
          { type: "select", promptWithBlank: "화장실이 ___예요?", answer: "어디", options: ["어디", "뭐", "어떻게"], fullSentence: "화장실이 어디예요?", fullSentenceMeaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" } },
          { type: "input", promptWithBlank: "___합니다, 출구가 어디예요?", answer: "실례", fullSentence: "실례합니다, 출구가 어디예요?", fullSentenceMeaning: { ko: "실례합니다, 출구가 어디예요?", en: "Excuse me, where is the exit?", es: "Disculpe, ¿dónde está la salida?" } },
          { type: "input", promptWithBlank: "다음에 ___!", answer: "봐요", fullSentence: "다음에 봐요!", fullSentenceMeaning: { ko: "다음에 봐요!", en: "See you later!", es: "¡Hasta luego!" } },
          { type: "listening", audioText: "실례합니다, 출구가 어디예요?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["실례합니다, 출구가 어디예요?", "화장실이 어디예요?", "안녕히 가세요! 다음에 봐요.", "잘 가요!"], correct: 0, audioOnly: true },
        ],
      },
    },
    indonesian: {
      step1Sentences: [
        { text: "Selamat tinggal! Sampai jumpa nanti.", speechLang: "id-ID", meaning: { ko: "안녕히 가세요! 다음에 봐요.", en: "Goodbye! See you later.", es: "¡Adiós! Hasta luego." } },
        { text: "Hati-hati!", speechLang: "id-ID", meaning: { ko: "잘 가요!", en: "Take care!", es: "¡Cuídate!" } },
        { text: "Senang bertemu dengan Anda tadi.", speechLang: "id-ID", meaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
        { text: "Di mana toilet?", speechLang: "id-ID", meaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" }, recallRound: true },
        { text: "Permisi, di mana pintu keluar?", speechLang: "id-ID", meaning: { ko: "실례합니다, 출구가 어디예요?", en: "Excuse me, where is the exit?", es: "Disculpe, ¿dónde está la salida?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "작별 인사는 'Selamat tinggal'(떠나는 사람이 남는 사람에게)과 'Sampai jumpa'(다음에 봐요)가 있어요. '잘 가요/조심히 가요'는 'Hati-hati'. 장소를 물을 때 'Di mana ___?'를 쓰고, 앞에 'Permisi'(실례합니다)를 붙이면 훨씬 공손해져요!", en: "Indonesian farewells: 'Selamat tinggal' (said by the one leaving) and 'Sampai jumpa' (see you / see you later). 'Hati-hati' means 'take care / be careful'. To ask for places, use 'Di mana ___?' and start with 'Permisi' (excuse me) — it instantly makes you sound polite.", es: "Despedidas en indonesio: 'Selamat tinggal' (lo dice quien se va) y 'Sampai jumpa' (hasta luego). 'Hati-hati' significa 'cuídate'. Para lugares: 'Di mana ___?' Empieza con 'Permisi' (disculpe) para sonar educado." },
          examples: { ko: "Selamat tinggal! Sampai jumpa nanti. (안녕히 가세요! 다음에 봐요.)\nDi mana toilet? (화장실이 어디예요?)\nPermisi, di mana pintu keluar? (실례합니다, 출구가 어디예요?)", en: "Selamat tinggal! Sampai jumpa nanti. (Goodbye! See you later.)\nDi mana toilet? (Where is the bathroom?)\nPermisi, di mana pintu keluar? (Excuse me, where is the exit?)", es: "Selamat tinggal! Sampai jumpa nanti. (¡Adiós! Hasta luego.)\nDi mana toilet? (¿Dónde está el baño?)\nPermisi, di mana pintu keluar? (Disculpe, ¿dónde está la salida?)" },
          mistakes: { ko: "❌ Mana toilet?\n✅ Di mana toilet? ('di'를 빼먹지 마세요!)\n❌ Selamat tinggal를 남는 사람이 쓰기\n✅ 떠나는 사람이 'Selamat tinggal', 남는 사람은 'Selamat jalan'을 써요!", en: "❌ Mana toilet?\n✅ Di mana toilet? (Don't drop 'di'!)\n❌ Using 'Selamat tinggal' when you're the one staying\n✅ The person leaving says 'Selamat tinggal'; the one staying says 'Selamat jalan'!", es: "❌ Mana toilet?\n✅ Di mana toilet? (No omitas 'di')\n❌ Usar 'Selamat tinggal' si te quedas\n✅ Quien se va dice 'Selamat tinggal'; quien se queda dice 'Selamat jalan'." },
          rudyTip: { ko: "'Permisi, di mana ___?'는 여행할 때 제일 많이 쓰는 문장이야! 이 패턴만 외우면 어디서든 길을 찾을 수 있어~", en: "'Permisi, di mana ___?' is THE travel phrase. Master this one pattern and you can find anything, anywhere in Indonesia!", es: "'Permisi, di mana ___?' es LA frase de viaje. Domina este patrón y encontrarás todo en Indonesia." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Selamat ___! Sampai jumpa nanti.", answer: "tinggal", options: ["tinggal", "pagi", "makan"], fullSentence: "Selamat tinggal! Sampai jumpa nanti.", fullSentenceMeaning: { ko: "안녕히 가세요! 다음에 봐요.", en: "Goodbye! See you later.", es: "¡Adiós! Hasta luego." } },
          { type: "select", promptWithBlank: "Senang ___ dengan Anda tadi.", answer: "bertemu", options: ["bertemu", "tinggal", "makan"], fullSentence: "Senang bertemu dengan Anda tadi.", fullSentenceMeaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte." } },
          { type: "select", promptWithBlank: "___ mana toilet?", answer: "Di", options: ["Di", "Ke", "Dari"], fullSentence: "Di mana toilet?", fullSentenceMeaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" } },
          { type: "input", promptWithBlank: "___, di mana pintu keluar?", answer: "Permisi", fullSentence: "Permisi, di mana pintu keluar?", fullSentenceMeaning: { ko: "실례합니다, 출구가 어디예요?", en: "Excuse me, where is the exit?", es: "Disculpe, ¿dónde está la salida?" } },
          { type: "input", promptWithBlank: "___-hati!", answer: "Hati", fullSentence: "Hati-hati!", fullSentenceMeaning: { ko: "잘 가요!", en: "Take care!", es: "¡Cuídate!" } },
          { type: "listening", audioText: "Permisi, di mana pintu keluar?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Permisi, di mana pintu keluar?", "Di mana toilet?", "Selamat tinggal! Sampai jumpa nanti.", "Hati-hati!"], correct: 0, audioOnly: true },
        ],
      },
    },
    arabic: {
      step1Sentences: [
        { text: "مَعَ السَّلامة! أَراك لاحِقًا.", speechLang: "ar-EG", meaning: { ko: "ma3a el-salama! ashoofak ba3dein · 안녕히 가세요! 다음에 봐요.", en: "ma3a el-salama! ashoofak ba3dein · Goodbye! See you later.", es: "ma3a el-salama! ashoofak ba3dein · ¡Adiós! Hasta luego.", id: "ma3a el-salama! ashoofak ba3dein · Selamat tinggal! Sampai jumpa nanti." } },
        { text: "اِعْتَنِ بِنَفْسِك!", speechLang: "ar-EG", meaning: { ko: "khalli balak men nafsak! · 잘 가요!", en: "khalli balak men nafsak! · Take care!", es: "khalli balak men nafsak! · ¡Cuídate!", id: "khalli balak men nafsak! · Hati-hati!" } },
        { text: "تَشَرَّفْت بِمَعْرِفَتِك.", speechLang: "ar-EG", meaning: { ko: "ana etsharreft be-ma3reftak · 만나서 반가웠어요.", en: "ana etsharreft be-ma3reftak · It was nice meeting you.", es: "ana etsharreft be-ma3reftak · Fue un placer conocerte.", id: "ana etsharreft be-ma3reftak · Senang bertemu dengan Anda tadi." } },
        { text: "أَيْنَ الحَمّام؟", speechLang: "ar-EG", meaning: { ko: "fein el-hammam? · 화장실이 어디예요?", en: "fein el-hammam? · Where is the bathroom?", es: "fein el-hammam? · ¿Dónde está el baño?", id: "fein el-hammam? · Di mana toilet?" }, recallRound: true },
        { text: "لَو سَمَحْت، أَيْنَ المَخْرَج؟", speechLang: "ar-EG", meaning: { ko: "law samaht, fein el-khoroog? · 실례합니다, 출구가 어디예요?", en: "law samaht, fein el-khoroog? · Excuse me, where is the exit?", es: "law samaht, fein el-khoroog? · Disculpe, ¿dónde está la salida?", id: "law samaht, fein el-khoroog? · Permisi, di mana pintu keluar?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "작별 인사는 'مع السَّلامة'(maʿa s-salāma, 잘 가요)와 'أَراك لاحِقًا'(arāka lāḥiqan, 나중에 봐요)가 있어요. '조심해'는 'اِعْتَنِ بِنَفْسِك'(iʿtani bi-nafsik). 장소를 물을 땐 'أَيْنَ ___؟'(ayna ___?)를 써요 — 'أَيْنَ'(ayna)가 표준어 '어디'예요! 앞에 'لو سَمَحْت'(law samaḥt, 실례합니다)를 붙이면 훨씬 공손해져요.", en: "MSA farewells: 'مع السَّلامة' (maʿa s-salāma — goodbye / go in peace) and 'أَراك لاحِقًا' (arāka lāḥiqan — see you later). 'Take care' is 'اِعْتَنِ بِنَفْسِك' (iʿtani bi-nafsik). To ask for places, use 'أَيْنَ ___؟' (ayna ___?) — 'أَيْنَ' (ayna) is the standard 'where'! Start with 'لو سَمَحْت' (law samaḥt — excuse me/please) and you instantly sound polite.", es: "Despedidas en MSA: 'مع السَّلامة' (maʿa s-salāma — adiós / ve en paz) y 'أَراك لاحِقًا' (arāka lāḥiqan — hasta luego). 'Cuídate' es 'اِعْتَنِ بِنَفْسِك' (iʿtani bi-nafsik). Para lugares, usa 'أَيْنَ ___؟' (ayna ___?) — ¡'أَيْنَ' (ayna) es el 'dónde' estándar! Empieza con 'لو سَمَحْت' (law samaḥt — disculpe) y suenas educado al instante." },
          examples: { ko: "مع السَّلامة! أَراك لاحِقًا. (maʿa s-salāma! arāka lāḥiqan · 안녕히 가세요! 다음에 봐요.)\nأَيْنَ الحَمّام؟ (ayna l-ḥammām? · 화장실이 어디예요?)\nلو سَمَحْت، أَيْنَ المَخْرَج؟ (law samaḥt, ayna l-makhraj? · 실례합니다, 출구가 어디예요?)", en: "مع السَّلامة! أَراك لاحِقًا. (maʿa s-salāma! arāka lāḥiqan · Goodbye! See you later.)\nأَيْنَ الحَمّام؟ (ayna l-ḥammām? · Where is the bathroom?)\nلو سَمَحْت، أَيْنَ المَخْرَج؟ (law samaḥt, ayna l-makhraj? · Excuse me, where is the exit?)", es: "مع السَّلامة! أَراك لاحِقًا. (maʿa s-salāma! arāka lāḥiqan · ¡Adiós! Hasta luego.)\nأَيْنَ الحَمّام؟ (ayna l-ḥammām? · ¿Dónde está el baño?)\nلو سَمَحْت، أَيْنَ المَخْرَج؟ (law samaḥt, ayna l-makhraj? · Disculpe, ¿dónde está la salida?)" },
          mistakes: { ko: "❌ فين الحَمّام؟ (فين/fein은 이집트 구어체 '어디')\n✅ أَيْنَ الحَمّام؟ (ayna l-ḥammām? — 표준어는 'أَيْنَ'!)\n💬 참고: 이집트에선 'أشوفَك بَعْدين'(ashoofak baʿdēn, 나중에 봐요)라고도 하지만, 표준어 ✅는 'أَراك لاحِقًا'(arāka lāḥiqan)예요.", en: "❌ فين الحَمّام؟ (فين / fein is the Egyptian colloquial 'where')\n✅ أَيْنَ الحَمّام؟ (ayna l-ḥammām? — MSA uses 'أَيْنَ'!)\n💬 Note: Egyptians also say 'أشوفَك بَعْدين' (ashoofak baʿdēn — see you later) in dialect, but the MSA ✅ is 'أَراك لاحِقًا' (arāka lāḥiqan).", es: "❌ فين الحَمّام؟ (فين / fein es el 'dónde' coloquial egipcio)\n✅ أَيْنَ الحَمّام؟ (ayna l-ḥammām? — ¡el MSA usa 'أَيْنَ'!)\n💬 Nota: en Egipto también dicen 'أشوفَك بَعْدين' (ashoofak baʿdēn — hasta luego) en dialecto, pero el ✅ en MSA es 'أَراك لاحِقًا' (arāka lāḥiqan)." },
          rudyTip: { ko: "'لو سَمَحْت، أَيْنَ ___؟'(law samaḥt, ayna ___?)는 여행할 때 제일 많이 쓰는 문장이야! 'أَيْنَ'(ayna)만 알면 표준어로 어느 아랍 나라에서든 길을 찾을 수 있어~", en: "'لو سَمَحْت، أَيْنَ ___؟' (law samaḥt, ayna ___?) is THE travel phrase. Learn 'أَيْنَ' (ayna) and your MSA lets you find anything, anywhere in the Arab world!", es: "'لو سَمَحْت، أَيْنَ ___؟' (law samaḥt, ayna ___?) es LA frase de viaje. ¡Aprende 'أَيْنَ' (ayna) y tu MSA te permite encontrar todo en cualquier país árabe!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "مَعَ ___! أَراك لاحِقًا.", answer: "السَّلامة", options: ["السَّلامة", "الخَيْر", "النَّجْدة"], fullSentence: "مَعَ السَّلامة! أَراك لاحِقًا.", fullSentenceMeaning: { ko: "안녕히 가세요! 다음에 봐요.", en: "Goodbye! See you later.", es: "¡Adiós! Hasta luego.", id: "Selamat tinggal! Sampai jumpa nanti." } },
          { type: "select", promptWithBlank: "___ بِمَعْرِفَتِك.", answer: "تَشَرَّفْت", options: ["تَشَرَّفْت", "ذَهَبْت", "أَكَلْت"], fullSentence: "تَشَرَّفْت بِمَعْرِفَتِك.", fullSentenceMeaning: { ko: "만나서 반가웠어요.", en: "It was nice meeting you.", es: "Fue un placer conocerte.", id: "Senang bertemu dengan Anda tadi." } },
          { type: "select", promptWithBlank: "___ الحَمّام؟", answer: "أَيْنَ", options: ["أَيْنَ", "ماذا", "مَتى"], fullSentence: "أَيْنَ الحَمّام؟", fullSentenceMeaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?", id: "Di mana toilet?" } },
          { type: "input", promptWithBlank: "لَو ___، أَيْنَ المَخْرَج؟", answer: "سَمَحْت", fullSentence: "لَو سَمَحْت، أَيْنَ المَخْرَج؟", fullSentenceMeaning: { ko: "실례합니다, 출구가 어디예요?", en: "Excuse me, where is the exit?", es: "Disculpe, ¿dónde está la salida?", id: "Permisi, di mana pintu keluar?" } },
          { type: "input", promptWithBlank: "___ بِنَفْسِك!", answer: "اِعْتَنِ", fullSentence: "اِعْتَنِ بِنَفْسِك!", fullSentenceMeaning: { ko: "잘 가요!", en: "Take care!", es: "¡Cuídate!", id: "Hati-hati!" } },
          { type: "listening", audioText: "لَو سَمَحْت، أَيْنَ المَخْرَج؟", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["لَو سَمَحْت، أَيْنَ المَخْرَج؟", "أَيْنَ الحَمّام؟", "مَعَ السَّلامة! أَراك لاحِقًا.", "اِعْتَنِ بِنَفْسِك!"], correct: 0, audioOnly: true },
        ],
      },
    },
  },

  // ─────────────── Day 5: How Are You + How much / Help ─────────────────────
  day_5: {
    english: {
      step1Sentences: [
        { text: "How are you today?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?" } },
        { text: "I'm fine, thank you.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "잘 지내요, 감사합니다.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
        { text: "Not bad, how about you?", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "괜찮아요, 당신은요?", en: "Not bad, how about you?", es: "No está mal, ¿y tú?" } },
        { text: "How much is this?", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" }, recallRound: true },
        { text: "Help! I need help, please.", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "도와주세요! 도움이 필요해요.", en: "Help! I need help, please.", es: "¡Ayuda! Necesito ayuda, por favor." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "'How are you?'라고 물어보면 'I'm fine' 말고도 다양하게 대답할 수 있어요! 'I'm great!'(최고), 'Not bad'(괜찮아), 'A little tired'(좀 피곤해). 물건 가격은 'How much is this?', 위험할 때는 'Help!'이라고 하세요!", en: "When someone asks 'How are you?', don't just say 'I'm fine'! Mix it up: 'I'm great!' (super positive), 'Not bad' (pretty good), 'A little tired' (honest and real). For prices, ask 'How much is this?' And in an emergency, 'Help!' is universal.", es: "Cuando alguien pregunte 'How are you?', no solo digas 'I'm fine'. Varía: 'I'm great!' (súper positivo), 'Not bad' (bastante bien), 'A little tired' (honesto). Para precios: 'How much is this?' Y en emergencia: 'Help!'" },
          examples: { ko: "How are you? — I'm great, thanks! (어떻게 지내요? — 아주 잘 지내요!)\nHow much is this? — It's $5. (이거 얼마예요? — 5달러예요.)\nHelp! I need help, please. (도와주세요! 도움이 필요해요.)", en: "How are you? — I'm great, thanks! (Positive and natural.)\nNot bad, how about you? (Casual, keeps the conversation going.)\nHow much is this? (Point at something and ask — works every time!)", es: "How are you? — I'm great, thanks! (¿Cómo estás? — ¡Genial, gracias!)\nNot bad, how about you? (No está mal, ¿y tú?)\nHow much is this? (¿Cuánto cuesta esto?)" },
          mistakes: { ko: "❌ How much is it cost?\n✅ How much is this? ('cost' 넣으면 안 돼요!)\n❌ I'm fine, and you?\n✅ I'm fine, how about you? (더 자연스러운 표현이에요)", en: "❌ How much is it cost?\n✅ How much is this? (Don't add 'cost' with 'is'!)\n❌ How are you? — I'm fine. (Not wrong, but boring!)\n✅ How are you? — Not bad, how about you? (Much more natural!)", es: "❌ How much is it cost?\n✅ How much is this? (No agregues 'cost' con 'is')\n❌ I'm fine. (No está mal, pero es aburrido)\n✅ Not bad, how about you? (Mucho más natural)" },
          rudyTip: { ko: "'I'm fine'만 쓰면 로봇 같아! 'Not bad'이나 'Pretty good' 같은 표현을 써보면 훨씬 자연스러워져~", en: "Pro tip: 'I'm fine' is okay but sounds robotic. Try 'Not bad!' or 'Pretty good!' — you'll sound way more like a native speaker!", es: "Consejo pro: 'I'm fine' está bien pero suena robótico. Prueba 'Not bad!' o 'Pretty good!' — sonarás mucho más nativo." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "How ___ you?", answer: "are", options: ["are", "is", "am"], fullSentence: "How are you?", fullSentenceMeaning: { ko: "어떻게 지내요?", en: "How are you?", es: "¿Cómo estás?" } },
          { type: "select", promptWithBlank: "I'm fine, ___ you.", answer: "thank", options: ["thank", "thanks", "and"], fullSentence: "I'm fine, thank you.", fullSentenceMeaning: { ko: "잘 지내요, 감사합니다.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
          { type: "select", promptWithBlank: "How ___ is this?", answer: "much", options: ["much", "many", "long"], fullSentence: "How much is this?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
          { type: "input", promptWithBlank: "Not bad, how ___ you?", answer: "about", fullSentence: "Not bad, how about you?", fullSentenceMeaning: { ko: "괜찮아요, 당신은요?", en: "Not bad, how about you?", es: "No está mal, ¿y tú?" } },
          { type: "input", promptWithBlank: "I need ___, please.", answer: "help", fullSentence: "I need help, please.", fullSentenceMeaning: { ko: "도움이 필요해요.", en: "I need help, please.", es: "Necesito ayuda, por favor." } },
          { type: "listening", audioText: "How much is this?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["How much is this?", "How are you today?", "Help! I need help.", "Not bad, how about you?"], correct: 0, audioOnly: true },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "¿Cómo estás hoy?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?" } },
        { text: "Estoy bien, gracias.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "잘 지내요, 감사합니다.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
        { text: "No está mal, ¿y tú?", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "괜찮아요, 당신은요?", en: "Not bad, how about you?", es: "No está mal, ¿y tú?" } },
        { text: "¿Cuánto cuesta esto?", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" }, recallRound: true },
        { text: "¡Ayuda! Necesito ayuda, por favor.", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "도와주세요! 도움이 필요해요.", en: "Help! I need help, please.", es: "¡Ayuda! Necesito ayuda, por favor." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "'¿Cómo estás?'에 'Estoy bien' 말고도 다양하게 대답할 수 있어요! '¡Estoy genial!'(최고), 'Más o menos'(그저 그래), 'Estoy cansado/a'(피곤해). 가격을 물을 때 '¿Cuánto cuesta esto?', 위급하면 '¡Ayuda!'라고 하세요!", en: "When asked '¿Cómo estás?', go beyond 'Estoy bien'! Try '¡Estoy genial!' (I'm great!), 'Más o menos' (so-so), or 'Estoy cansado/a' (I'm tired — add 'a' if you're female). For prices: '¿Cuánto cuesta esto?' Emergency: '¡Ayuda!'", es: "Cuando pregunten '¿Cómo estás?', no solo digas 'Estoy bien'. Varía: '¡Estoy genial!' (genial), 'Más o menos' (regular), 'Estoy cansado/a' (cansado). Para precios: '¿Cuánto cuesta esto?' Emergencia: '¡Ayuda!'" },
          examples: { ko: "¿Cómo estás? — ¡Estoy genial! (어떻게 지내요? — 아주 잘 지내요!)\n¿Cuánto cuesta esto? — Cinco euros. (이거 얼마예요? — 5유로예요.)\n¡Ayuda! Necesito ayuda. (도와주세요! 도움이 필요해요.)", en: "¿Cómo estás? — ¡Estoy genial! (How are you? — I'm great!)\nMás o menos. (So-so — honest and very common.)\n¿Cuánto cuesta esto? (How much does this cost?)", es: "¿Cómo estás? — ¡Estoy genial! (Respuesta positiva.)\nMás o menos, ¿y tú? (Respuesta casual, mantiene la conversación.)\n¿Cuánto cuesta esto? (Preguntar el precio, señalando algo.)" },
          mistakes: { ko: "❌ ¿Cómo eres?\n✅ ¿Cómo estás? (기분을 물을 때는 'estás'! 'eres'는 성격을 물어보는 거예요)\n❌ Estoy cansado/a mucho.\n✅ Estoy muy cansado/a. ('muy'는 형용사 앞에!)", en: "❌ ¿Cómo eres?\n✅ ¿Cómo estás? ('Eres' = personality, 'Estás' = how you feel right now!)\n❌ Cuánto cuesta?\n✅ ¿Cuánto cuesta esto? (Add 'esto' to specify 'this thing')", es: "❌ ¿Cómo eres?\n✅ ¿Cómo estás? ('Eres' = personalidad, 'Estás' = estado actual)\n❌ Cuánto cuesta?\n✅ ¿Cuánto cuesta esto? (Agrega 'esto' para especificar)" },
          rudyTip: { ko: "스페인어는 ser(eres)랑 estar(estás) 구분이 중요해! 기분은 항상 'estar'야. '¿Cómo estás?'로 외워두면 절대 안 틀려~", en: "Big Spanish secret: 'ser' = permanent things (personality), 'estar' = temporary things (mood). So it's always '¿Cómo estás?' for 'how are you' — never 'eres'!", es: "Secreto importante: 'ser' = cosas permanentes, 'estar' = cosas temporales. Siempre es '¿Cómo estás?' para el estado de ánimo, nunca 'eres'." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "¿Cómo ___ hoy?", answer: "estás", options: ["estás", "eres", "tienes"], fullSentence: "¿Cómo estás hoy?", fullSentenceMeaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?" } },
          { type: "select", promptWithBlank: "Estoy ___, gracias.", answer: "bien", options: ["bien", "mal", "así"], fullSentence: "Estoy bien, gracias.", fullSentenceMeaning: { ko: "잘 지내요, 감사합니다.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
          { type: "select", promptWithBlank: "¿Cuánto ___ esto?", answer: "cuesta", options: ["cuesta", "es", "tiene"], fullSentence: "¿Cuánto cuesta esto?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
          { type: "input", promptWithBlank: "No está mal, ¿y ___?", answer: "tú", fullSentence: "No está mal, ¿y tú?", fullSentenceMeaning: { ko: "괜찮아요, 당신은요?", en: "Not bad, how about you?", es: "No está mal, ¿y tú?" } },
          { type: "input", promptWithBlank: "Necesito ___, por favor.", answer: "ayuda", fullSentence: "Necesito ayuda, por favor.", fullSentenceMeaning: { ko: "도움이 필요해요.", en: "I need help, please.", es: "Necesito ayuda, por favor." } },
          { type: "listening", audioText: "¿Cuánto cuesta esto?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["¿Cuánto cuesta esto?", "¿Cómo estás hoy?", "¡Ayuda! Necesito ayuda.", "No está mal, ¿y tú?"], correct: 0, audioOnly: true },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "오늘 어떻게 지내요?", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?" } },
        { text: "잘 지내요, 감사합니다.", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "잘 지내요, 감사합니다.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
        { text: "괜찮아요, 당신은요?", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "괜찮아요, 당신은요?", en: "Not bad, how about you?", es: "No está mal, ¿y tú?" } },
        { text: "이거 얼마예요?", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" }, recallRound: true },
        { text: "도와주세요! 도움이 필요해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "도와주세요! 도움이 필요해요.", en: "Help! I need help, please.", es: "¡Ayuda! Necesito ayuda, por favor." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "'어떻게 지내요?'라고 물어보면 다양하게 대답할 수 있어요! '잘 지내요'(좋아요), '괜찮아요'(무난해요), '조금 피곤해요'(솔직하게). 물건 가격은 '이거 얼마예요?', 도움이 필요하면 '도와주세요!'라고 하세요!", en: "When someone asks '어떻게 지내요?' (How are you?), you have options: '잘 지내요' (I'm good), '괜찮아요' (I'm okay), '조금 피곤해요' (A bit tired). For prices, say '이거 얼마예요?' while pointing. Emergency: '도와주세요!'", es: "Cuando pregunten '어떻게 지내요?' (¿Cómo estás?), puedes responder: '잘 지내요' (Estoy bien), '괜찮아요' (Estoy regular), '조금 피곤해요' (Estoy cansado). Precios: '이거 얼마예요?' Emergencia: '도와주세요!'" },
          examples: { ko: "어떻게 지내요? — 잘 지내요! (안부 인사 기본형)\n이거 얼마예요? — 만 원이에요. (가격 물어보기)\n도와주세요! 도움이 필요해요. (위급 상황)", en: "어떻게 지내요? — 잘 지내요! (How are you? — I'm good!)\n이거 얼마예요? (How much is this? — point and ask!)\n도와주세요! (Help! — the universal emergency word in Korean.)", es: "어떻게 지내요? — 잘 지내요! (¿Cómo estás? — Estoy bien.)\n이거 얼마예요? (¿Cuánto cuesta esto?)\n도와주세요! (¡Ayuda!)" },
          mistakes: { ko: "❌ 어떻게 있어요?\n✅ 어떻게 지내요? ('있다'가 아니라 '지내다'를 써요!)\n❌ 이거 얼마?\n✅ 이거 얼마예요? ('예요'를 붙여야 예의 바른 표현이에요)", en: "❌ 어떻게 있어요?\n✅ 어떻게 지내요? (Use 지내다 not 있다 for 'how are you'!)\n❌ 이거 얼마?\n✅ 이거 얼마예요? (Add 예요 to be polite!)", es: "❌ 어떻게 있어요?\n✅ 어떻게 지내요? (Usa 지내다, no 있다 para '¿cómo estás?')\n❌ 이거 얼마?\n✅ 이거 얼마예요? (Agrega 예요 para ser educado)" },
          rudyTip: { ko: "'이거 얼마예요?'는 시장이나 쇼핑할 때 진짜 많이 써! 물건 가리키면서 말하면 돼서 쉬워~", en: "'이거 얼마예요?' is the shopping phrase you'll use the most in Korea! Just point at something and ask — no extra grammar needed!", es: "'이거 얼마예요?' es la frase de compras que más usarás en Corea. Solo señala algo y pregunta, no necesitas más gramática." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "오늘 어떻게 ___요?", answer: "지내", options: ["지내", "있어", "해"], fullSentence: "오늘 어떻게 지내요?", fullSentenceMeaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?" } },
          { type: "select", promptWithBlank: "잘 ___, 감사합니다.", answer: "지내요", options: ["지내요", "있어요", "해요"], fullSentence: "잘 지내요, 감사합니다.", fullSentenceMeaning: { ko: "잘 지내요, 감사합니다.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
          { type: "select", promptWithBlank: "이거 ___예요?", answer: "얼마", options: ["얼마", "뭐", "어디"], fullSentence: "이거 얼마예요?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
          { type: "input", promptWithBlank: "괜찮아요, ___은요?", answer: "당신", fullSentence: "괜찮아요, 당신은요?", fullSentenceMeaning: { ko: "괜찮아요, 당신은요?", en: "Not bad, how about you?", es: "No está mal, ¿y tú?" } },
          { type: "input", promptWithBlank: "___이 필요해요.", answer: "도움", fullSentence: "도움이 필요해요.", fullSentenceMeaning: { ko: "도움이 필요해요.", en: "I need help.", es: "Necesito ayuda." } },
          { type: "listening", audioText: "이거 얼마예요?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["이거 얼마예요?", "오늘 어떻게 지내요?", "도와주세요! 도움이 필요해요.", "괜찮아요, 당신은요?"], correct: 0, audioOnly: true },
        ],
      },
    },
    indonesian: {
      step1Sentences: [
        { text: "Apa kabar hari ini?", speechLang: "id-ID", meaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?" } },
        { text: "Saya baik-baik saja, terima kasih.", speechLang: "id-ID", meaning: { ko: "잘 지내요, 감사합니다.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
        { text: "Lumayan, bagaimana dengan Anda?", speechLang: "id-ID", meaning: { ko: "괜찮아요, 당신은요?", en: "Not bad, how about you?", es: "No está mal, ¿y tú?" } },
        { text: "Ini berapa harganya?", speechLang: "id-ID", meaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" }, recallRound: true },
        { text: "Tolong! Saya butuh bantuan.", speechLang: "id-ID", meaning: { ko: "도와주세요! 도움이 필요해요.", en: "Help! I need help, please.", es: "¡Ayuda! Necesito ayuda, por favor." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "'Apa kabar?'(어떻게 지내요?)에 'Saya baik-baik saja'(잘 지내요), 'Lumayan'(그저 그래요) 등으로 대답할 수 있어요. 물건 가격은 'Berapa harganya?'(얼마예요?), 위험할 때는 'Tolong!'(도와주세요!)이라고 하세요. 'butuh bantuan'은 '도움이 필요하다'예요!", en: "When asked 'Apa kabar?' (How are you?), reply with 'Saya baik-baik saja' (I'm fine), 'Lumayan' (not bad / so-so). For prices, ask 'Berapa harganya?' (literally 'how much is its price?'). Emergency: 'Tolong!' (Help!). 'Butuh bantuan' means 'need help'.", es: "Cuando pregunten 'Apa kabar?' (¿Cómo estás?), responde 'Saya baik-baik saja' (Estoy bien), 'Lumayan' (regular). Precios: 'Berapa harganya?' Emergencia: '¡Tolong!' (¡Ayuda!). 'Butuh bantuan' = necesitar ayuda." },
          examples: { ko: "Apa kabar? — Saya baik-baik saja! (어떻게 지내요? — 잘 지내요!)\nIni berapa harganya? — Lima puluh ribu. (이거 얼마예요? — 5만 루피아예요.)\nTolong! Saya butuh bantuan. (도와주세요! 도움이 필요해요.)", en: "Apa kabar? — Saya baik-baik saja! (How are you? — I'm fine!)\nIni berapa harganya? (How much is this? — point and ask!)\nTolong! Saya butuh bantuan. (Help! I need help.)", es: "Apa kabar? — Saya baik-baik saja! (¿Cómo estás? — ¡Estoy bien!)\nIni berapa harganya? (¿Cuánto cuesta esto?)\nTolong! Saya butuh bantuan. (¡Ayuda! Necesito ayuda.)" },
          mistakes: { ko: "❌ Berapa ini?\n✅ Ini berapa harganya? ('harganya'(그 가격)를 넣어야 자연스러워요!)\n❌ Saya baik. (틀린 건 아니지만)\n✅ Saya baik-baik saja. (반복형이 더 자연스러워요)", en: "❌ Berapa ini?\n✅ Ini berapa harganya? (Add 'harganya' = its price to sound natural!)\n❌ Saya baik. (Not wrong, but bare)\n✅ Saya baik-baik saja. (The doubled form sounds more natural)", es: "❌ Berapa ini?\n✅ Ini berapa harganya? (Agrega 'harganya' = su precio)\n❌ Saya baik.\n✅ Saya baik-baik saja. (La forma duplicada suena más natural)" },
          rudyTip: { ko: "'Berapa harganya?'는 시장이나 쇼핑할 때 진짜 많이 써! 물건 가리키면서 말하면 돼서 쉬워~ 인도네시아 시장에서는 흥정도 잊지 마!", en: "'Berapa harganya?' is THE shopping phrase in Indonesia! Just point and ask. Bonus tip: at markets, this opens the door to friendly bargaining!", es: "'Berapa harganya?' es LA frase de compras en Indonesia. Solo señala y pregunta. ¡En los mercados abre la puerta al regateo!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Apa ___ hari ini?", answer: "kabar", options: ["kabar", "nama", "harga"], fullSentence: "Apa kabar hari ini?", fullSentenceMeaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?" } },
          { type: "select", promptWithBlank: "Saya ___ saja, terima kasih.", answer: "baik-baik", options: ["baik-baik", "lumayan", "sedikit"], fullSentence: "Saya baik-baik saja, terima kasih.", fullSentenceMeaning: { ko: "잘 지내요, 감사합니다.", en: "I'm fine, thank you.", es: "Estoy bien, gracias." } },
          { type: "select", promptWithBlank: "Ini berapa ___?", answer: "harganya", options: ["harganya", "kabar", "nama"], fullSentence: "Ini berapa harganya?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
          { type: "input", promptWithBlank: "Lumayan, bagaimana dengan ___?", answer: "Anda", fullSentence: "Lumayan, bagaimana dengan Anda?", fullSentenceMeaning: { ko: "괜찮아요, 당신은요?", en: "Not bad, how about you?", es: "No está mal, ¿y tú?" } },
          { type: "input", promptWithBlank: "Saya butuh ___.", answer: "bantuan", fullSentence: "Saya butuh bantuan.", fullSentenceMeaning: { ko: "도움이 필요해요.", en: "I need help.", es: "Necesito ayuda." } },
          { type: "listening", audioText: "Ini berapa harganya?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Ini berapa harganya?", "Apa kabar hari ini?", "Tolong! Saya butuh bantuan.", "Lumayan, bagaimana dengan Anda?"], correct: 0, audioOnly: true },
        ],
      },
    },
    arabic: {
      step1Sentences: [
        { text: "كَيْفَ حالُك اليَوْم؟", speechLang: "ar-EG", meaning: { ko: "ezzayyak el-naharda? · 오늘 어떻게 지내요?", en: "ezzayyak el-naharda? · How are you today?", es: "ezzayyak el-naharda? · ¿Cómo estás hoy?", id: "ezzayyak el-naharda? · Apa kabar hari ini?" } },
        { text: "أَنَا بِخَيْر، شُكْرًا.", speechLang: "ar-EG", meaning: { ko: "ana kwayyes, shokran · 잘 지내요, 감사합니다.", en: "ana kwayyes, shokran · I'm fine, thank you.", es: "ana kwayyes, shokran · Estoy bien, gracias.", id: "ana kwayyes, shokran · Saya baik-baik saja, terima kasih." } },
        { text: "لا بَأْس، وَأَنْتَ؟", speechLang: "ar-EG", meaning: { ko: "mesh battal, wenta? · 괜찮아요, 당신은요?", en: "mesh battal, wenta? · Not bad, how about you?", es: "mesh battal, wenta? · No está mal, ¿y tú?", id: "mesh battal, wenta? · Lumayan, bagaimana dengan Anda?" } },
        { text: "بِكَمْ هٰذَا؟", speechLang: "ar-EG", meaning: { ko: "bekam da? · 이거 얼마예요?", en: "bekam da? · How much is this?", es: "bekam da? · ¿Cuánto cuesta esto?", id: "bekam da? · Ini berapa harganya?" }, recallRound: true },
        { text: "النَّجْدة! أَحْتاج مُساعَدة، لَو سَمَحْت.", speechLang: "ar-EG", meaning: { ko: "el-nagda! mehtaag mosa3da, law samaht · 도와주세요! 도움이 필요해요.", en: "el-nagda! mehtaag mosa3da, law samaht · Help! I need help, please.", es: "el-nagda! mehtaag mosa3da, law samaht · ¡Ayuda! Necesito ayuda, por favor.", id: "el-nagda! mehtaag mosa3da, law samaht · Tolong! Saya butuh bantuan." }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "안부를 물을 땐 'كَيْفَ حالُك؟'(kayfa ḥāluk?, 어떻게 지내요?)라고 해요 — 'كَيْفَ'(kayfa)가 표준어 '어떻게'예요. '오늘'은 'اليَوْم'(al-yawm)이에요. 대답은 'أنا بِخَيْر'(anā bi-khayr, 잘 지내요), 'لا بَأْس'(lā baʾs, 나쁘지 않아요). 가격은 'بِكَمْ هٰذَا؟'(bikam hādhā?, 이거 얼마?), 위급하면 'النَّجْدة!'(an-najda!).", en: "To ask how someone is, say 'كَيْفَ حالُك؟' (kayfa ḥāluk?) — 'كَيْفَ' (kayfa) is the standard 'how'. 'Today' is 'اليَوْم' (al-yawm). Reply with 'أنا بِخَيْر' (anā bi-khayr — I'm fine) or 'لا بَأْس' (lā baʾs — not bad). Prices: 'بِكَمْ هٰذَا؟' (bikam hādhā? — how much is this?). Emergency: 'النَّجْدة!' (an-najda!).", es: "Para preguntar cómo está alguien, di 'كَيْفَ حالُك؟' (kayfa ḥāluk?) — 'كَيْفَ' (kayfa) es el 'cómo' estándar. 'Hoy' es 'اليَوْم' (al-yawm). Responde 'أنا بِخَيْر' (anā bi-khayr — estoy bien) o 'لا بَأْس' (lā baʾs — no está mal). Precios: 'بِكَمْ هٰذَا؟' (bikam hādhā? — ¿cuánto es esto?). Emergencia: 'النَّجْدة!' (an-najda!)." },
          examples: { ko: "كَيْفَ حالُك؟ — أنا بِخَيْر! (kayfa ḥāluk? — anā bi-khayr · 어떻게 지내요? — 잘 지내요!)\nبِكَمْ هٰذَا؟ (bikam hādhā? · 이거 얼마예요?)\nالنَّجْدة! أَحْتاج مُساعَدة. (an-najda! aḥtāj musāʿada · 도와주세요! 도움이 필요해요.)", en: "كَيْفَ حالُك؟ — أنا بِخَيْر! (kayfa ḥāluk? — anā bi-khayr · How are you? — I'm fine!)\nلا بَأْس، وَأَنْتَ؟ (lā baʾs, wa-anta? · Not bad, how about you?)\nبِكَمْ هٰذَا؟ (bikam hādhā? · How much is this? — point and ask!)", es: "كَيْفَ حالُك؟ — أنا بِخَيْر! (kayfa ḥāluk? — anā bi-khayr · ¿Cómo estás? — ¡Bien!)\nلا بَأْس، وَأَنْتَ؟ (lā baʾs, wa-anta? · No está mal, ¿y tú?)\nبِكَمْ هٰذَا؟ (bikam hādhā? · ¿Cuánto cuesta esto?)" },
          mistakes: { ko: "❌ إزَّيَّك؟ (ezzayyak?는 이집트 구어체 '어떻게 지내?')\n✅ كَيْفَ حالُك؟ (kayfa ḥāluk? — 표준어는 'كَيْفَ'!)\n💬 참고: 이집트에선 'بِكام ده؟'(bekam da?, 이거 얼마?)라고도 하지만, 표준어 ✅는 'بِكَمْ هٰذَا؟'(bikam hādhā?)예요.", en: "❌ إزَّيَّك؟ (ezzayyak? is the Egyptian colloquial 'how are you?')\n✅ كَيْفَ حالُك؟ (kayfa ḥāluk? — MSA uses 'كَيْفَ'!)\n💬 Note: Egyptians also say 'بِكام ده؟' (bekam da? — how much?) in dialect, but the MSA ✅ is 'بِكَمْ هٰذَا؟' (bikam hādhā?).", es: "❌ إزَّيَّك؟ (ezzayyak? es el 'cómo estás' coloquial egipcio)\n✅ كَيْفَ حالُك؟ (kayfa ḥāluk? — ¡el MSA usa 'كَيْفَ'!)\n💬 Nota: en Egipto también dicen 'بِكام ده؟' (bekam da? — ¿cuánto?) en dialecto, pero el ✅ en MSA es 'بِكَمْ هٰذَا؟' (bikam hādhā?)." },
          rudyTip: { ko: "'كَيْفَ حالُك؟'(kayfa ḥāluk?)랑 'بِكَمْ؟'(bikam?) 이 두 개만 알면 표준어로 일상 절반은 끝! 'بِخَيْر'(bi-khayr)는 '잘 지내요'고 어느 아랍 나라에서나 통해~", en: "Master just 'كَيْفَ حالُك؟' (kayfa ḥāluk?) and 'بِكَمْ؟' (bikam?) and half of daily MSA is covered! 'بِخَيْر' (bi-khayr — fine) works across the whole Arab world too.", es: "Domina solo 'كَيْفَ حالُك؟' (kayfa ḥāluk?) y 'بِكَمْ؟' (bikam?) y ya tienes media vida diaria en MSA. 'بِخَيْر' (bi-khayr — bien) sirve en todo el mundo árabe." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ اليَوْم؟", answer: "كَيْفَ حالُك", options: ["كَيْفَ حالُك", "أَيْنَ", "بِكَمْ"], fullSentence: "كَيْفَ حالُك اليَوْم؟", fullSentenceMeaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?", id: "Apa kabar hari ini?" } },
          { type: "select", promptWithBlank: "أَنَا ___، شُكْرًا.", answer: "بِخَيْر", options: ["بِخَيْر", "سَيِّئ", "مُتْعَب"], fullSentence: "أَنَا بِخَيْر، شُكْرًا.", fullSentenceMeaning: { ko: "잘 지내요, 감사합니다.", en: "I'm fine, thank you.", es: "Estoy bien, gracias.", id: "Saya baik-baik saja, terima kasih." } },
          { type: "select", promptWithBlank: "___ هٰذَا؟", answer: "بِكَمْ", options: ["بِكَمْ", "أَيْنَ", "كَيْفَ حالُك"], fullSentence: "بِكَمْ هٰذَا؟", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?", id: "Ini berapa harganya?" } },
          { type: "input", promptWithBlank: "لا ___، وَأَنْتَ؟", answer: "بَأْس", fullSentence: "لا بَأْس، وَأَنْتَ؟", fullSentenceMeaning: { ko: "괜찮아요, 당신은요?", en: "Not bad, how about you?", es: "No está mal, ¿y tú?", id: "Lumayan, bagaimana dengan Anda?" } },
          { type: "input", promptWithBlank: "أَحْتاج ___، لَو سَمَحْت.", answer: "مُساعَدة", fullSentence: "أَحْتاج مُساعَدة، لَو سَمَحْت.", fullSentenceMeaning: { ko: "도움이 필요해요.", en: "I need help, please.", es: "Necesito ayuda, por favor.", id: "Saya butuh bantuan." } },
          { type: "listening", audioText: "بِكَمْ هٰذَا؟", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["بِكَمْ هٰذَا؟", "كَيْفَ حالُك اليَوْم؟", "النَّجْدة! أَحْتاج مُساعَدة.", "لا بَأْس، وَأَنْتَ؟"], correct: 0, audioOnly: true },
        ],
      },
    },
  },

  // ─────────────── Day 6: Unit 1 Review (all survival + intro phrases) ───────
  day_6: {
    english: {
      step1Sentences: [
        { text: "Hello, my name is Rudy. Nice to meet you.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 만나서 반갑습니다.", en: "Hello, my name is Rudy. Nice to meet you.", es: "Hola, me llamo Rudy. Mucho gusto." } },
        { text: "I'm from London. I work as a detective.", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "저는 런던에서 왔어요. 탐정으로 일해요.", en: "I'm from London. I work as a detective.", es: "Soy de Londres. Trabajo como detective." } },
        { text: "How are you? I'm great, thanks! See you later!", speechLang: "en-GB", ttsVoice: "en-GB-RyanNeural", meaning: { ko: "어떻게 지내세요? 잘 지내요, 감사합니다! 다음에 봐요!", en: "How are you? I'm great, thanks! See you later!", es: "¿Cómo estás? ¡Estoy genial, gracias! ¡Hasta luego!" } },
        { text: "Sorry, I don't understand. Can you say that again?", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "미안해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요?", en: "Sorry, I don't understand. Can you say that again?", es: "Lo siento, no entiendo. ¿Puede repetir eso?" }, recallRound: true },
        { text: "Excuse me, where is the bathroom? How much is this?", speechLang: "en-GB", ttsVoice: "en-GB-SoniaNeural", meaning: { ko: "실례합니다, 화장실이 어디예요? 이거 얼마예요?", en: "Excuse me, where is the bathroom? How much is this?", es: "Disculpe, ¿dónde está el baño? ¿Cuánto cuesta esto?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "이번 주에 배운 모든 표현을 총정리해요! 자기소개(My name is / I'm from / I'm a ___), 인사(How are you? / Goodbye), 그리고 생존 표현(I don't understand / Where is / How much / Help)을 자연스럽게 연결해서 써보세요!", en: "Time to put it all together! This week you learned introductions (My name is / I'm from / I'm a ___), greetings (How are you? / Goodbye), AND survival phrases (I don't understand / Where is / How much / Help). Let's connect them naturally!", es: "Es hora de juntar todo. Esta semana aprendiste presentaciones (My name is / I'm from / I'm a ___), saludos (How are you? / Goodbye) Y frases de supervivencia (I don't understand / Where is / How much / Help). Conectemos todo naturalmente." },
          examples: { ko: "Hello, my name is Rudy. I'm from Korea. (자기소개 콤보!)\nHow are you? — I'm great! See you later! (인사 + 작별 콤보!)\nExcuse me, where is the bathroom? How much is this? (생존 콤보!)", en: "Hello, my name is Rudy. I'm from Korea. (Introduction combo!)\nHow are you? — I'm great! See you later! (Greeting + farewell combo!)\nSorry, I don't understand. Can you say that again? (Survival combo!)", es: "Hello, my name is Rudy. I'm from Korea. (Combo de presentación.)\nHow are you? — I'm great! See you later! (Combo de saludo + despedida.)\nSorry, I don't understand. Can you say that again? (Combo de supervivencia.)" },
          mistakes: { ko: "❌ 각 표현을 따로따로만 외우기\n✅ 표현들을 연결해서 자연스럽게 말해보세요! 실제 대화는 여러 문장이 이어져요.", en: "❌ Memorizing each phrase separately\n✅ Connect phrases into real conversations! In real life, you chain multiple sentences together.", es: "❌ Memorizar cada frase por separado\n✅ Conecta las frases en conversaciones reales. En la vida real, encadenas varias oraciones." },
          rudyTip: { ko: "이번 주 표현들을 다 합치면 진짜 대화가 돼! 자기소개 → 안부 → 질문 → 작별, 이 흐름을 기억해~", en: "You now have enough phrases for a REAL conversation! Introduction, greeting, questions, goodbye — that's a complete chat flow. You're doing amazing!", es: "Ya tienes suficientes frases para una conversación REAL. Presentación, saludo, preguntas, despedida: un flujo completo. Lo estás haciendo increíble." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "My name ___ Rudy.", answer: "is", options: ["is", "am", "are"], fullSentence: "My name is Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "How ___ you?", answer: "are", options: ["are", "is", "am"], fullSentence: "How are you?", fullSentenceMeaning: { ko: "어떻게 지내요?", en: "How are you?", es: "¿Cómo estás?" } },
          { type: "input", promptWithBlank: "Sorry, I don't ___.", answer: "understand", fullSentence: "Sorry, I don't understand.", fullSentenceMeaning: { ko: "미안해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." } },
          { type: "input", promptWithBlank: "___ is the bathroom?", answer: "Where", fullSentence: "Where is the bathroom?", fullSentenceMeaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" } },
          { type: "input", promptWithBlank: "How ___ is this?", answer: "much", fullSentence: "How much is this?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
          { type: "listening", audioText: "Sorry, I don't understand. Can you say that again?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Sorry, I don't understand. Can you say that again?", "How much is this?", "Where is the bathroom?", "My name is Rudy."], correct: 0, audioOnly: true },
        ],
      },
    },
    spanish: {
      step1Sentences: [
        { text: "Hola, me llamo Rudy. Mucho gusto.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 만나서 반갑습니다.", en: "Hello, my name is Rudy. Nice to meet you.", es: "Hola, me llamo Rudy. Mucho gusto." } },
        { text: "Soy de Londres. Trabajo como detective.", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "저는 런던에서 왔어요. 탐정으로 일해요.", en: "I'm from London. I work as a detective.", es: "Soy de Londres. Trabajo como detective." } },
        { text: "¿Cómo estás? ¡Estoy genial, gracias! ¡Hasta luego!", speechLang: "es-ES", ttsVoice: "es-ES-AlvaroNeural", meaning: { ko: "어떻게 지내세요? 잘 지내요, 감사합니다! 다음에 봐요!", en: "How are you? I'm great, thanks! See you later!", es: "¿Cómo estás? ¡Estoy genial, gracias! ¡Hasta luego!" } },
        { text: "Lo siento, no entiendo. ¿Puede repetir eso?", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "미안해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요?", en: "Sorry, I don't understand. Can you say that again?", es: "Lo siento, no entiendo. ¿Puede repetir eso?" }, recallRound: true },
        { text: "Disculpe, ¿dónde está el baño? ¿Cuánto cuesta esto?", speechLang: "es-ES", ttsVoice: "es-ES-ElviraNeural", meaning: { ko: "실례합니다, 화장실이 어디예요? 이거 얼마예요?", en: "Excuse me, where is the bathroom? How much is this?", es: "Disculpe, ¿dónde está el baño? ¿Cuánto cuesta esto?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "이번 주 스페인어를 총정리해요! 자기소개(Me llamo / Soy de / Soy + 직업), 인사(¿Cómo estás? / Adiós / Hasta luego), 생존 표현(No entiendo / ¿Dónde está? / ¿Cuánto cuesta? / ¡Ayuda!)을 자연스럽게 연결해 보세요!", en: "Time to review all your Spanish! Introductions (Me llamo / Soy de / Soy + job), greetings (¿Cómo estás? / Adiós / Hasta luego), and survival phrases (No entiendo / ¿Dónde está? / ¿Cuánto cuesta? / ¡Ayuda!). Let's put them all together!", es: "Hora de repasar todo el español. Presentaciones (Me llamo / Soy de / Soy + trabajo), saludos (¿Cómo estás? / Adiós / Hasta luego) y frases de supervivencia (No entiendo / ¿Dónde está? / ¿Cuánto cuesta? / ¡Ayuda!). Juntemos todo." },
          examples: { ko: "Hola, me llamo Rudy. Soy de Londres. (자기소개 콤보!)\n¿Cómo estás? — ¡Estoy genial! ¡Hasta luego! (인사 + 작별 콤보!)\nDisculpe, ¿dónde está el baño? ¿Cuánto cuesta esto? (생존 콤보!)", en: "Hola, me llamo Rudy. Soy de Londres. (Introduction combo!)\n¿Cómo estás? — ¡Estoy genial! ¡Hasta luego! (Greeting + farewell combo!)\nLo siento, no entiendo. ¿Puede repetir eso? (Survival combo!)", es: "Hola, me llamo Rudy. Soy de Londres. (Combo de presentación.)\n¿Cómo estás? — ¡Estoy genial! ¡Hasta luego! (Combo de saludo + despedida.)\nLo siento, no entiendo. ¿Puede repetir eso? (Combo de supervivencia.)" },
          mistakes: { ko: "❌ 단어만 외우고 연결 못 하기\n✅ 이번 주 배운 문장들을 순서대로 연결해 보세요! 인사→자기소개→질문→작별 순서로요.", en: "❌ Knowing words but not connecting them\n✅ Chain this week's phrases together: greeting, introduction, questions, goodbye. That's a real conversation!", es: "❌ Saber palabras pero no conectarlas\n✅ Encadena las frases: saludo, presentación, preguntas, despedida. Eso es una conversación real." },
          rudyTip: { ko: "이번 주 스페인어만으로도 진짜 대화가 가능해! 자기소개부터 작별까지 한 세트로 연습해보자~", en: "With just this week's Spanish, you can have a real conversation! Practice the full flow: introduce yourself, chat, ask questions, say goodbye. You got this!", es: "Solo con el español de esta semana puedes tener una conversación real. Practica todo el flujo: preséntate, conversa, pregunta, despídete. Tú puedes." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "Me ___ Rudy.", answer: "llamo", options: ["llamo", "llamas", "llaman"], fullSentence: "Me llamo Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "¿Cómo ___ hoy?", answer: "estás", options: ["estás", "eres", "tienes"], fullSentence: "¿Cómo estás hoy?", fullSentenceMeaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?" } },
          { type: "input", promptWithBlank: "Lo siento, no ___.", answer: "entiendo", fullSentence: "Lo siento, no entiendo.", fullSentenceMeaning: { ko: "미안해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." } },
          { type: "input", promptWithBlank: "¿___ está el baño?", answer: "Dónde", fullSentence: "¿Dónde está el baño?", fullSentenceMeaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" } },
          { type: "input", promptWithBlank: "¿Cuánto ___ esto?", answer: "cuesta", fullSentence: "¿Cuánto cuesta esto?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
          { type: "listening", audioText: "Lo siento, no entiendo. ¿Puede repetir eso?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Lo siento, no entiendo. ¿Puede repetir eso?", "¿Cuánto cuesta esto?", "¿Dónde está el baño?", "Me llamo Rudy."], correct: 0, audioOnly: true },
        ],
      },
    },
    korean: {
      step1Sentences: [
        { text: "안녕하세요, 제 이름은 루디예요. 만나서 반갑습니다.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 만나서 반갑습니다.", en: "Hello, my name is Rudy. Nice to meet you.", es: "Hola, me llamo Rudy. Mucho gusto." } },
        { text: "저는 런던에서 왔어요. 탐정으로 일해요.", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "저는 런던에서 왔어요. 탐정으로 일해요.", en: "I'm from London. I work as a detective.", es: "Soy de Londres. Trabajo como detective." } },
        { text: "어떻게 지내세요? 잘 지내요, 감사합니다! 다음에 봐요!", speechLang: "ko-KR", ttsVoice: "ko-KR-InJoonNeural", meaning: { ko: "어떻게 지내세요? 잘 지내요, 감사합니다! 다음에 봐요!", en: "How are you? I'm great, thanks! See you later!", es: "¿Cómo estás? ¡Estoy genial, gracias! ¡Hasta luego!" } },
        { text: "죄송해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요?", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "죄송해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요?", en: "Sorry, I don't understand. Can you say that again?", es: "Lo siento, no entiendo. ¿Puede repetir eso?" }, recallRound: true },
        { text: "실례합니다, 화장실이 어디예요? 이거 얼마예요?", speechLang: "ko-KR", ttsVoice: "ko-KR-SunHiNeural", meaning: { ko: "실례합니다, 화장실이 어디예요? 이거 얼마예요?", en: "Excuse me, where is the bathroom? How much is this?", es: "Disculpe, ¿dónde está el baño? ¿Cuánto cuesta esto?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "이번 주 한국어를 총정리해요! 자기소개(제 이름은 / ___에서 왔어요 / ___이에요), 인사(어떻게 지내요? / 안녕히 가세요), 생존 표현(이해를 못 했어요 / 어디예요? / 얼마예요? / 도와주세요!)을 자연스럽게 이어서 말해보세요!", en: "Let's review all the Korean! Introductions (제 이름은 / ___에서 왔어요 / ___이에요), greetings (어떻게 지내요? / 안녕히 가세요), and survival phrases (이해를 못 했어요 / 어디예요? / 얼마예요? / 도와주세요!). Time to connect them all!", es: "Repasemos todo el coreano. Presentaciones (제 이름은 / ___에서 왔어요 / ___이에요), saludos (어떻게 지내요? / 안녕히 가세요) y frases de supervivencia (이해를 못 했어요 / 어디예요? / 얼마예요? / 도와주세요!). Conectemos todo." },
          examples: { ko: "안녕하세요, 제 이름은 루디예요. 한국에서 왔어요. (자기소개 콤보!)\n어떻게 지내요? — 잘 지내요! 안녕히 가세요! (인사 + 작별 콤보!)\n실례합니다, 화장실이 어디예요? 이거 얼마예요? (생존 콤보!)", en: "안녕하세요, 제 이름은 루디예요. (Introduction combo!)\n어떻게 지내요? — 잘 지내요! 안녕히 가세요! (Greeting + farewell combo!)\n이해를 못 했어요. 다시 한번 말해 주시겠어요? (Survival combo!)", es: "안녕하세요, 제 이름은 루디예요. (Combo de presentación.)\n어떻게 지내요? — 잘 지내요! 안녕히 가세요! (Combo de saludo + despedida.)\n실례합니다, 화장실이 어디예요? (Combo de supervivencia.)" },
          mistakes: { ko: "❌ 문장을 따로따로만 외우기\n✅ 실제 대화처럼 문장을 연결해서 말해보세요! 자기소개→안부→질문→작별 흐름으로!", en: "❌ Only memorizing isolated phrases\n✅ Connect them like a real conversation! Introduction, greeting, questions, goodbye — practice the whole flow.", es: "❌ Solo memorizar frases aisladas\n✅ Conéctalas como una conversación real. Presentación, saludo, preguntas, despedida: practica todo el flujo." },
          rudyTip: { ko: "이번 주에 배운 것만으로도 한국어로 기본 대화가 가능해! 자기소개부터 작별까지 한 세트로 연습해보자~ 넌 이미 잘하고 있어!", en: "With just this week's Korean, you can hold a basic conversation! From hello to goodbye — that's real progress. You're doing amazing!", es: "Solo con el coreano de esta semana puedes tener una conversación básica. Desde hola hasta adiós: eso es progreso real. Lo estás haciendo increíble." },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "제 이름___ 루디예요.", answer: "은", options: ["은", "이", "가"], fullSentence: "제 이름은 루디예요.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "오늘 어떻게 ___요?", answer: "지내", options: ["지내", "있어", "해"], fullSentence: "오늘 어떻게 지내요?", fullSentenceMeaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?" } },
          { type: "input", promptWithBlank: "이해를 ___ 했어요.", answer: "못", fullSentence: "이해를 못 했어요.", fullSentenceMeaning: { ko: "이해를 못 했어요.", en: "I don't understand.", es: "No entiendo." } },
          { type: "input", promptWithBlank: "화장실이 ___예요?", answer: "어디", fullSentence: "화장실이 어디예요?", fullSentenceMeaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" } },
          { type: "input", promptWithBlank: "이거 ___예요?", answer: "얼마", fullSentence: "이거 얼마예요?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
          { type: "listening", audioText: "죄송해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["죄송해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요?", "이거 얼마예요?", "화장실이 어디예요?", "제 이름은 루디예요."], correct: 0, audioOnly: true },
        ],
      },
    },
    indonesian: {
      step1Sentences: [
        { text: "Halo, nama saya Rudy. Senang bertemu dengan Anda.", speechLang: "id-ID", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 만나서 반갑습니다.", en: "Hello, my name is Rudy. Nice to meet you.", es: "Hola, me llamo Rudy. Mucho gusto." } },
        { text: "Saya berasal dari London. Saya bekerja sebagai detektif.", speechLang: "id-ID", meaning: { ko: "저는 런던에서 왔어요. 탐정으로 일해요.", en: "I'm from London. I work as a detective.", es: "Soy de Londres. Trabajo como detective." } },
        { text: "Apa kabar? Saya baik-baik saja, terima kasih! Sampai jumpa nanti!", speechLang: "id-ID", meaning: { ko: "어떻게 지내세요? 잘 지내요, 감사합니다! 다음에 봐요!", en: "How are you? I'm great, thanks! See you later!", es: "¿Cómo estás? ¡Estoy genial, gracias! ¡Hasta luego!" } },
        { text: "Maaf, saya tidak mengerti. Bisa tolong ulangi?", speechLang: "id-ID", meaning: { ko: "미안해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요?", en: "Sorry, I don't understand. Can you say that again?", es: "Lo siento, no entiendo. ¿Puede repetir eso?" }, recallRound: true },
        { text: "Permisi, di mana toilet? Ini berapa harganya?", speechLang: "id-ID", meaning: { ko: "실례합니다, 화장실이 어디예요? 이거 얼마예요?", en: "Excuse me, where is the bathroom? How much is this?", es: "Disculpe, ¿dónde está el baño? ¿Cuánto cuesta esto?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "이번 주 인도네시아어를 총정리해요! 자기소개(Nama saya / Saya berasal dari / Saya seorang ___), 인사(Apa kabar? / Selamat tinggal / Sampai jumpa), 생존 표현(Saya tidak mengerti / Di mana ___? / Berapa harganya? / Tolong!)을 자연스럽게 이어서 말해보세요!", en: "Let's review all the Indonesian! Introductions (Nama saya / Saya berasal dari / Saya seorang ___), greetings (Apa kabar? / Selamat tinggal / Sampai jumpa), and survival phrases (Saya tidak mengerti / Di mana ___? / Berapa harganya? / Tolong!). Time to connect them all!", es: "Repasemos todo el indonesio. Presentaciones (Nama saya / Saya berasal dari / Saya seorang ___), saludos (Apa kabar? / Selamat tinggal / Sampai jumpa) y frases de supervivencia (Saya tidak mengerti / Di mana ___? / Berapa harganya? / Tolong!). Conectemos todo." },
          examples: { ko: "Halo, nama saya Rudy. Saya berasal dari Korea. (자기소개 콤보!)\nApa kabar? — Saya baik-baik saja! Sampai jumpa! (인사 + 작별 콤보!)\nPermisi, di mana toilet? Ini berapa harganya? (생존 콤보!)", en: "Halo, nama saya Rudy. Saya berasal dari Korea. (Introduction combo!)\nApa kabar? — Saya baik-baik saja! Sampai jumpa! (Greeting + farewell combo!)\nMaaf, saya tidak mengerti. Bisa tolong ulangi? (Survival combo!)", es: "Halo, nama saya Rudy. Saya berasal dari Korea. (Combo de presentación.)\nApa kabar? — Saya baik-baik saja! Sampai jumpa! (Combo de saludo + despedida.)\nMaaf, saya tidak mengerti. Bisa tolong ulangi? (Combo de supervivencia.)" },
          mistakes: { ko: "❌ 문장을 따로따로만 외우기\n✅ 실제 대화처럼 문장을 연결해서 말해보세요! 자기소개→안부→질문→작별 흐름으로!", en: "❌ Only memorizing isolated phrases\n✅ Connect them like a real conversation! Introduction, greeting, questions, goodbye — practice the whole flow.", es: "❌ Solo memorizar frases aisladas\n✅ Conéctalas como una conversación real. Presentación, saludo, preguntas, despedida: practica todo el flujo." },
          rudyTip: { ko: "이번 주에 배운 것만으로도 인도네시아어로 기본 대화가 가능해! 자기소개부터 작별까지 한 세트로 연습해보자~ 넌 이미 잘하고 있어!", en: "With just this week's Indonesian, you can hold a basic conversation! From hello to goodbye — that's real progress. You're doing amazing!", es: "Solo con el indonesio de esta semana puedes tener una conversación básica. Desde hola hasta adiós: eso es progreso real. ¡Increíble!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "___ saya Rudy.", answer: "Nama", options: ["Nama", "Saya", "Orang"], fullSentence: "Nama saya Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
          { type: "select", promptWithBlank: "Apa ___ hari ini?", answer: "kabar", options: ["kabar", "nama", "harga"], fullSentence: "Apa kabar hari ini?", fullSentenceMeaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?" } },
          { type: "input", promptWithBlank: "Maaf, saya tidak ___.", answer: "mengerti", fullSentence: "Maaf, saya tidak mengerti.", fullSentenceMeaning: { ko: "미안해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." } },
          { type: "input", promptWithBlank: "Di mana ___?", answer: "toilet", fullSentence: "Di mana toilet?", fullSentenceMeaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" } },
          { type: "input", promptWithBlank: "Ini berapa ___?", answer: "harganya", fullSentence: "Ini berapa harganya?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
          { type: "listening", audioText: "Maaf, saya tidak mengerti. Bisa tolong ulangi?", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["Maaf, saya tidak mengerti. Bisa tolong ulangi?", "Ini berapa harganya?", "Di mana toilet?", "Nama saya Rudy."], correct: 0, audioOnly: true },
        ],
      },
    },
    arabic: {
      step1Sentences: [
        { text: "أَهْلًا، أَنَا اسْمِي رودي. فُرْصة سَعيدة.", speechLang: "ar-EG", meaning: { ko: "ahlan, ana esmi Rudy. forsa sa3ida · 안녕하세요, 제 이름은 루디예요. 만나서 반갑습니다.", en: "ahlan, ana esmi Rudy. forsa sa3ida · Hello, my name is Rudy. Nice to meet you.", es: "ahlan, ana esmi Rudy. forsa sa3ida · Hola, me llamo Rudy. Mucho gusto.", id: "ahlan, ana esmi Rudy. forsa sa3ida · Halo, nama saya Rudy. Senang bertemu dengan Anda." } },
        { text: "أَنَا مِنْ لَنْدَن. أَنَا أَعْمَل مُحَقِّقًا.", speechLang: "ar-EG", meaning: { ko: "ana men Landan. ana bashtaghal mohaqqeq · 저는 런던에서 왔어요. 탐정으로 일해요.", en: "ana men Landan. ana bashtaghal mohaqqeq · I'm from London. I work as a detective.", es: "ana men Landan. ana bashtaghal mohaqqeq · Soy de Londres. Trabajo como detective.", id: "ana men Landan. ana bashtaghal mohaqqeq · Saya berasal dari London. Saya bekerja sebagai detektif." } },
        { text: "كَيْفَ حالُك؟ أَنَا بِخَيْر، شُكْرًا! أَراك لاحِقًا!", speechLang: "ar-EG", meaning: { ko: "ezzayyak? ana tamam, shokran! ashoofak ba3dein! · 어떻게 지내세요? 잘 지내요, 감사합니다! 다음에 봐요!", en: "ezzayyak? ana tamam, shokran! ashoofak ba3dein! · How are you? I'm great, thanks! See you later!", es: "ezzayyak? ana tamam, shokran! ashoofak ba3dein! · ¿Cómo estás? ¡Estoy genial, gracias! ¡Hasta luego!", id: "ezzayyak? ana tamam, shokran! ashoofak ba3dein! · Apa kabar? Saya baik-baik saja, terima kasih! Sampai jumpa nanti!" } },
        { text: "آسِف، أَنَا لا أَفْهَم. مُمْكِن تَقول مَرّة ثانِية؟", speechLang: "ar-EG", meaning: { ko: "aasef, ana mesh fahem. momken te'ool tani? · 미안해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요?", en: "aasef, ana mesh fahem. momken te'ool tani? · Sorry, I don't understand. Can you say that again?", es: "aasef, ana mesh fahem. momken te'ool tani? · Lo siento, no entiendo. ¿Puede repetir eso?", id: "aasef, ana mesh fahem. momken te'ool tani? · Maaf, saya tidak mengerti. Bisa tolong ulangi?" }, recallRound: true },
        { text: "لَو سَمَحْت، أَيْنَ الحَمّام؟ بِكَمْ هٰذَا؟", speechLang: "ar-EG", meaning: { ko: "law samaht, fein el-hammam? bekam da? · 실례합니다, 화장실이 어디예요? 이거 얼마예요?", en: "law samaht, fein el-hammam? bekam da? · Excuse me, where is the bathroom? How much is this?", es: "law samaht, fein el-hammam? bekam da? · Disculpe, ¿dónde está el baño? ¿Cuánto cuesta esto?", id: "law samaht, fein el-hammam? bekam da? · Permisi, di mana toilet? Ini berapa harganya?" }, recallRound: true },
      ],
      step1Config: {
        hasAudioOnlyRound: true,
        audioOnlyCount: 1,
      },
      step2: {
        explanation: {
          pattern: { ko: "이번 주 표준어(MSA)를 총정리해요! 자기소개(أنا اسمي / أنا مِن / أنا ___), 인사(كَيْفَ حالُك؟ / مع السَّلامة), 생존 표현(أنا لا أَفْهَم / أَيْنَ ___؟ / بِكَمْ؟ / النَّجْدة!)을 자연스럽게 이어서 말해보세요!", en: "Let's review all your MSA! Introductions (أنا اسمي / أنا مِن / أنا ___), greetings (كَيْفَ حالُك؟ / مع السَّلامة), and survival phrases (أنا لا أَفْهَم / أَيْنَ ___؟ / بِكَمْ؟ / النَّجْدة!). Time to connect them all!", es: "Repasemos todo tu árabe estándar (MSA). Presentaciones (أنا اسمي / أنا مِن / أنا ___), saludos (كَيْفَ حالُك؟ / مع السَّلامة) y frases de supervivencia (أنا لا أَفْهَم / أَيْنَ ___؟ / بِكَمْ؟ / النَّجْدة!). Conectemos todo." },
          examples: { ko: "أهلاً، أنا اسمي رودي. أنا مِن كوريا. (ahlan, anā ismī Rudy. anā min Korea · 자기소개 콤보!)\nكَيْفَ حالُك؟ — أنا بِخَيْر! أَراك لاحِقًا! (kayfa ḥāluk? — anā bi-khayr! arāka lāḥiqan · 인사 + 작별 콤보!)\nلو سَمَحْت، أَيْنَ الحَمّام؟ بِكَمْ هٰذَا؟ (law samaḥt, ayna l-ḥammām? bikam hādhā? · 생존 콤보!)", en: "أهلاً، أنا اسمي رودي. أنا مِن كوريا. (ahlan, anā ismī Rudy. anā min Korea · Introduction combo!)\nكَيْفَ حالُك؟ — أنا بِخَيْر! أَراك لاحِقًا! (kayfa ḥāluk? — anā bi-khayr! arāka lāḥiqan · Greeting + farewell combo!)\nآسِف، أنا لا أَفْهَم. مُمْكِن تَقول مَرّة ثانِية؟ (āsif, anā lā afham. mumkin taqūl marra thāniya? · Survival combo!)", es: "أهلاً، أنا اسمي رودي. أنا مِن كوريا. (ahlan, anā ismī Rudy. anā min Korea · ¡Combo de presentación!)\nكَيْفَ حالُك؟ — أنا بِخَيْر! أَراك لاحِقًا! (kayfa ḥāluk? — anā bi-khayr! arāka lāḥiqan · ¡Combo de saludo + despedida!)\nآسِف، أنا لا أَفْهَم. مُمْكِن تَقول مَرّة ثانِية؟ (āsif, anā lā afham. mumkin taqūl marra thāniya? · ¡Combo de supervivencia!)" },
          mistakes: { ko: "❌ 문장을 따로따로만 외우기\n✅ 실제 대화처럼 문장을 연결해서 말해보세요! 자기소개→안부→질문→작별 흐름으로!\n💬 참고: 이집트 구어체(فين/إزَّيَّك/مِش)도 있지만, 우리가 배우는 ✅는 표준어(أَيْنَ/كَيْفَ/لا)예요. 한 번 배우면 전 아랍권에서 통해요~", en: "❌ Only memorizing isolated phrases\n✅ Connect them like a real conversation! Introduction, greeting, questions, goodbye.\n💬 Note: Egyptian dialect (fein/ezzayyak/mesh) exists too, but the ✅ we learn is MSA (ayna/kayfa/lā) — learn it once and it works across the whole Arab world.", es: "❌ Solo memorizar frases aisladas\n✅ Conéctalas como una conversación real. Presentación, saludo, preguntas, despedida.\n💬 Nota: el dialecto egipcio (fein/ezzayyak/mesh) también existe, pero el ✅ que aprendemos es MSA (ayna/kayfa/lā): apréndelo una vez y sirve en todo el mundo árabe." },
          rudyTip: { ko: "이번 주에 배운 표준어만으로도 진짜 대화가 돼! 자기소개부터 작별까지 한 세트로 연습해보자~ 표준어는 어느 아랍 나라에서나 통하니까 넌 이미 잘하고 있어!", en: "With just this week's MSA, you can hold a real conversation! From hello to goodbye — and MSA works across the whole Arab world. You're doing amazing!", es: "Solo con el MSA de esta semana puedes tener una conversación real. Desde hola hasta adiós, y el MSA sirve en todo el mundo árabe. ¡Increíble!" },
        } as GrammarExplanation,
        quizzes: [
          { type: "select", promptWithBlank: "أَنَا ___ رودي.", answer: "اسْمِي", options: ["اسْمِي", "أَنْتَ", "مِنْ"], fullSentence: "أَنَا اسْمِي رودي.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy.", id: "Nama saya Rudy." } },
          { type: "select", promptWithBlank: "___ اليَوْم؟", answer: "كَيْفَ حالُك", options: ["كَيْفَ حالُك", "بِكَمْ", "أَيْنَ"], fullSentence: "كَيْفَ حالُك اليَوْم؟", fullSentenceMeaning: { ko: "오늘 어떻게 지내요?", en: "How are you today?", es: "¿Cómo estás hoy?", id: "Apa kabar hari ini?" } },
          { type: "input", promptWithBlank: "آسِف، أَنَا ___ أَفْهَم.", answer: "لَيْسَ", fullSentence: "آسِف، أَنَا لا أَفْهَم.", fullSentenceMeaning: { ko: "미안해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo.", id: "Maaf, saya tidak mengerti." } },
          { type: "input", promptWithBlank: "___ الحَمّام؟", answer: "أَيْنَ", fullSentence: "أَيْنَ الحَمّام؟", fullSentenceMeaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?", id: "Di mana toilet?" } },
          { type: "input", promptWithBlank: "___ هٰذَا؟", answer: "بِكَمْ", fullSentence: "بِكَمْ هٰذَا؟", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?", id: "Ini berapa harganya?" } },
          { type: "listening", audioText: "آسِف، أَنَا لا أَفْهَم. مُمْكِن تَقول مَرّة ثانِية؟", question: { ko: "방금 뭐라고 했나요?", en: "What was just said?", es: "¿Qué se acaba de decir?" }, options: ["آسِف، أَنَا لا أَفْهَم. مُمْكِن تَقول مَرّة ثانِية؟", "بِكَمْ هٰذَا؟", "أَيْنَ الحَمّام؟", "أَنَا اسْمِي رودي."], correct: 0, audioOnly: true },
        ],
      },
    },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: MISSION TALK (updated prompts to incorporate survival phrases)
// ═══════════════════════════════════════════════════════════════════════════════

export const MISSION_CONTENT_IMPROVED: Record<string, Partial<Record<LearningLangKey, MissionTalkLangData>>> = {

  day_1: {
    english: { situation: { ko: "루디가 런던 박물관에서 새 동료를 만났습니다. 인사하고 자기소개를 해보세요!", en: "Rudy meets a new colleague at the London museum. Greet and introduce yourself!", es: "Rudy conoce a un nuevo colega en el museo de Londres. ¡Saluda y preséntate!" }, gptPrompt: "You are Rudy the fox detective meeting a new partner at the London museum. Have a simple A1-level introduction conversation in {targetLang}. Guide through: 1) greeting 2) asking name 3) asking where they're from 4) saying nice to meet you. At some point, say something slightly unclear so the user can practice 'I don't understand' or 'Can you say that again?'. If they use these phrases, praise them. Also end with 'Thank you, nice to meet you!' to reinforce thank you. Keep sentences very short. After 5-6 exchanges, say goodbye warmly.", speechLang: "en-GB", suggestedAnswers: ["Hello!", "My name is ___.", "I'm from ___.", "Nice to meet you too!", "Sorry, I don't understand.", "Thank you!"] },
    spanish: { situation: { ko: "루디가 런던 박물관에서 새 동료를 만났습니다. 인사하고 자기소개를 해보세요!", en: "Rudy meets a new colleague at the London museum. Greet and introduce yourself!", es: "Rudy conoce a un nuevo colega en el museo. ¡Saluda y preséntate!" }, gptPrompt: "You are Rudy the fox detective meeting a new partner at the London museum. Have a simple A1-level introduction conversation in {targetLang}. Guide through: 1) greeting 2) asking name 3) asking where they're from 4) saying nice to meet you. At some point, say something slightly unclear so the user can practice 'No entiendo' or '¿Puede repetir eso?'. If they use these phrases, praise them. End with 'Gracias, mucho gusto!' to reinforce gracias. Keep sentences very short.", speechLang: "es-ES", suggestedAnswers: ["¡Hola!", "Me llamo ___.", "Soy de ___.", "¡Mucho gusto!", "No entiendo.", "¡Gracias!"] },
    korean: { situation: { ko: "루디가 런던 박물관에서 새 동료를 만났습니다. 인사하고 자기소개를 해보세요!", en: "Rudy meets a new colleague at the London museum. Greet and introduce yourself!", es: "Rudy conoce a un nuevo colega. ¡Saluda y preséntate!" }, gptPrompt: "You are Rudy the fox detective meeting a new partner at the London museum. Have a simple A1-level introduction conversation in {targetLang}. Guide through: 1) greeting 2) asking name 3) asking where they're from 4) saying nice to meet you. At some point, say something slightly unclear so the user can practice '이해를 못 했어요' or '다시 한번 말해 주시겠어요?'. If they use these phrases, praise them. End with '감사합니다, 만나서 반가워요!' to reinforce 감사합니다. Keep sentences very short.", speechLang: "ko-KR", suggestedAnswers: ["안녕하세요!", "제 이름은 ___이에요.", "저는 ___에서 왔어요.", "만나서 반가워요!", "이해를 못 했어요.", "감사합니다!"] },
    indonesian: { situation: { ko: "루디가 런던 박물관에서 새 동료를 만났습니다. 인사하고 자기소개를 해보세요!", en: "Rudy meets a new colleague at the London museum. Greet and introduce yourself!", es: "Rudy conoce a un nuevo colega. ¡Saluda y preséntate!" }, gptPrompt: "You are Rudy the fox detective meeting a new partner at the London museum. Have a simple A1-level introduction conversation in {targetLang}. Guide through: 1) greeting 2) asking name 3) asking where they're from 4) saying nice to meet you. At some point, say something slightly unclear so the user can practice 'Saya tidak mengerti' or 'Bisa tolong ulangi?'. If they use these phrases, praise them. End with 'Terima kasih, senang bertemu dengan Anda!' to reinforce terima kasih. Keep sentences very short.", speechLang: "id-ID", suggestedAnswers: ["Halo!", "Nama saya ___.", "Saya berasal dari ___.", "Senang bertemu dengan Anda!", "Saya tidak mengerti.", "Terima kasih!"] },
    arabic: { situation: { ko: "루디가 런던 박물관에서 새 동료를 만났습니다. 인사하고 자기소개를 해보세요!", en: "Rudy meets a new colleague at the London museum. Greet and introduce yourself!", es: "Rudy conoce a un nuevo colega. ¡Saluda y preséntate!" }, gptPrompt: "You are Rudy the fox detective meeting a new partner at the London museum. Have a simple A1-level introduction conversation in EGYPTIAN COLLOQUIAL Arabic (NOT Modern Standard Arabic — use everyday spoken Egyptian like 'إزَّيَّك', 'إنْت مِنين', 'مِش', never MSA forms). Guide through: 1) greeting 2) asking name 3) asking where they're from 4) saying nice to meet you. At some point, say something slightly unclear so the user can practice 'أنا مِش فاهِم' or 'مُمْكِن تِقول تاني؟'. If they use these phrases, praise them. End with 'شُكْراً، فُرْصة سعيدة!' to reinforce شُكْراً. Keep sentences very short and write Arabic with harakat (short vowels).", speechLang: "ar-EG", suggestedAnswers: ["أَهْلًا!", "أَنَا اسْمِي ___.", "أَنَا مِنْ ___.", "فُرْصة سَعيدة!", "أَنَا لا أَفْهَم.", "شُكْرًا!"] },
  },

  day_2: {
    english: { situation: { ko: "루디가 다른 나라에서 온 동료들과 이야기하고 있습니다. 출신과 사는 곳에 대해 대화해보세요!", en: "Rudy is chatting with colleagues from different countries. Talk about where you're from!", es: "Rudy habla con colegas de diferentes países. ¡Habla sobre tu origen!" }, gptPrompt: "You are Rudy chatting with your new partner about where you're both from. Simple A1 conversation in {targetLang}. Ask about: 1) their country 2) their city 3) what it's like there 4) if they like it. Share that you're from London. At one point, speak slightly fast so the user can practice 'Can you say that again?' If they do, slow down and repeat. Reinforce yes/no practice. Keep it simple and encouraging.", speechLang: "en-GB", suggestedAnswers: ["I'm from Korea.", "I live in Seoul.", "Yes!", "No.", "Can you say that again, please?", "It's a big city."] },
    spanish: { situation: { ko: "루디가 다른 나라에서 온 동료들과 이야기하고 있습니다.", en: "Rudy is chatting with colleagues from different countries.", es: "Rudy habla con colegas de diferentes países." }, gptPrompt: "You are Rudy chatting with your new partner about where you're both from. Simple A1 conversation in {targetLang}. Ask about: 1) their country 2) their city 3) what it's like there 4) if they like it. At one point, speak slightly fast so the user can practice '¿Puede repetir eso?' Reinforce sí/no practice. Keep simple.", speechLang: "es-ES", suggestedAnswers: ["Soy de Corea.", "Vivo en Seúl.", "¡Sí!", "No.", "¿Puede repetir eso, por favor?", "Es una ciudad grande."] },
    korean: { situation: { ko: "루디가 다른 나라에서 온 동료들과 이야기하고 있습니다.", en: "Rudy is chatting with colleagues from different countries.", es: "Rudy habla con colegas de diferentes países." }, gptPrompt: "You are Rudy chatting with your new partner about where you're both from. Simple A1 conversation in {targetLang}. Ask about: 1) their country 2) their city 3) what it's like there 4) if they like it. At one point, speak slightly fast so the user can practice '다시 한번 말해 주시겠어요?' Reinforce 네/아니요 practice. Keep simple.", speechLang: "ko-KR", suggestedAnswers: ["저는 한국에서 왔어요.", "서울에 살아요.", "네!", "아니요.", "다시 한번 말해 주시겠어요?", "큰 도시예요."] },
    indonesian: { situation: { ko: "루디가 다른 나라에서 온 동료들과 이야기하고 있습니다.", en: "Rudy is chatting with colleagues from different countries.", es: "Rudy habla con colegas de diferentes países." }, gptPrompt: "You are Rudy chatting with your new partner about where you're both from. Simple A1 conversation in {targetLang}. Ask about: 1) their country 2) their city 3) what it's like there 4) if they like it. At one point, speak slightly fast so the user can practice 'Bisa tolong ulangi?' or 'Bisa bicara lebih pelan?' Reinforce ya/tidak practice. Keep simple.", speechLang: "id-ID", suggestedAnswers: ["Saya berasal dari Korea.", "Saya tinggal di Seoul.", "Ya!", "Tidak.", "Bisa tolong ulangi?", "Ini kota besar."] },
    arabic: { situation: { ko: "루디가 다른 나라에서 온 동료들과 이야기하고 있습니다.", en: "Rudy is chatting with colleagues from different countries.", es: "Rudy habla con colegas de diferentes países." }, gptPrompt: "You are Rudy chatting with your new partner about where you're both from. Simple A1 conversation in EGYPTIAN COLLOQUIAL Arabic (NOT MSA — use spoken Egyptian: 'إنْت مِنين', 'أنا ساكِن في', 'مَدينْتَك عامْلة إيه', never textbook forms). Ask about: 1) their country 2) their city 3) what it's like there 4) if they like it. Share that you're from London (لَنْدَن). At one point, speak slightly fast so the user can practice 'مُمْكِن تِقول تاني؟' or 'مُمْكِن تِتْكَلِّم بِراحة؟' Reinforce آه/لأ (yes/no) practice. Keep simple and write Arabic with harakat.", speechLang: "ar-EG", suggestedAnswers: ["أَنَا مِنْ كوريا.", "أَنَا ساكِن في سيول.", "نَعَم!", "لا.", "مُمْكِن تَقول مَرّة ثانِية؟", "هٰذِهِ مَدينة كَبيرة."] },
  },

  day_3: {
    english: { situation: { ko: "박물관에서 여러 직업의 사람들을 만나고 있습니다. 직업과 언어에 대해 이야기해보세요!", en: "Meeting people with different jobs at the museum. Talk about jobs and languages!", es: "Conociendo personas con diferentes trabajos. ¡Habla de trabajos e idiomas!" }, gptPrompt: "You are Rudy at a museum event meeting your new partner. Talk about jobs in simple A1 {targetLang}. Ask about: 1) what they do 2) where they work 3) if they like their job 4) what languages they speak. Practice 'Do you speak ___?' and 'A little bit.' Share your job as detective. Keep very simple.", speechLang: "en-GB", suggestedAnswers: ["I'm a student.", "I work at a school.", "Do you speak English?", "A little bit.", "That's interesting!", "Yes, I like it."] },
    spanish: { situation: { ko: "박물관에서 여러 직업의 사람들을 만나고 있습니다.", en: "Meeting people with different jobs at the museum.", es: "Conociendo personas con diferentes trabajos en el museo." }, gptPrompt: "You are Rudy at a museum event meeting your new partner. Talk about jobs in simple A1 {targetLang}. Ask about: 1) what they do 2) where they work 3) what languages they speak. Practice '¿Hablas ___?' and 'Un poquito.' Keep very simple.", speechLang: "es-ES", suggestedAnswers: ["Soy estudiante.", "Trabajo en una escuela.", "¿Hablas español?", "Un poquito.", "¡Qué interesante!", "Sí, me gusta."] },
    korean: { situation: { ko: "박물관에서 여러 직업의 사람들을 만나고 있습니다.", en: "Meeting people with different jobs at the museum.", es: "Conociendo personas con diferentes trabajos." }, gptPrompt: "You are Rudy at a museum event meeting your new partner. Talk about jobs in simple A1 {targetLang}. Ask about: 1) what they do 2) where they work 3) what languages they speak. Practice '___할 줄 아세요?' and '조금이요.' Keep very simple.", speechLang: "ko-KR", suggestedAnswers: ["저는 학생이에요.", "학교에서 일해요.", "한국어 할 줄 아세요?", "조금이요.", "재미있네요!", "네, 좋아해요."] },
    indonesian: { situation: { ko: "박물관에서 여러 직업의 사람들을 만나고 있습니다.", en: "Meeting people with different jobs at the museum.", es: "Conociendo personas con diferentes trabajos." }, gptPrompt: "You are Rudy at a museum event meeting your new partner. Talk about jobs in simple A1 {targetLang}. Ask about: 1) what they do 2) where they work 3) what languages they speak. Practice 'Apakah kamu bisa bahasa ___?' and 'Sedikit saja.' Keep very simple.", speechLang: "id-ID", suggestedAnswers: ["Saya seorang pelajar.", "Saya bekerja di sekolah.", "Apakah kamu bisa bahasa Inggris?", "Sedikit saja.", "Menarik sekali!", "Ya, saya suka."] },
    arabic: { situation: { ko: "박물관에서 여러 직업의 사람들을 만나고 있습니다.", en: "Meeting people with different jobs at the museum.", es: "Conociendo personas con diferentes trabajos." }, gptPrompt: "You are Rudy at a museum event meeting your new partner. Talk about jobs in simple A1 EGYPTIAN COLLOQUIAL Arabic (NOT MSA — use 'بِتِشْتَغَل إيه؟', 'بِتِتْكَلِّم إنجِليزي؟', the question word 'إيه', never the textbook 'ماذا'). Ask about: 1) what they do 2) where they work 3) what languages they speak. Practice 'بِتِتْكَلِّم ___؟' and 'شْوَيّة.' Keep very simple and write Arabic with harakat.", speechLang: "ar-EG", suggestedAnswers: ["أَنَا طالِب.", "أَنَا أَعْمَل في مَدْرَسة.", "هَلْ تَتَكَلَّم الإنْجِليزِيّة؟", "قَليلًا.", "هٰذَا شَيْء جَميل!", "نَعَم، أَنَا أُحِبُّه."] },
  },

  day_4: {
    english: { situation: { ko: "루디가 런던 도심에서 용의자를 미행하고 있습니다. 출구와 화장실 위치를 파악해야 해요!", en: "Rudy is tailing a suspect through London. He needs to know where the exits and bathrooms are to stay on the trail!", es: "Rudy sigue a un sospechoso por Londres. ¡Necesita conocer las salidas y los baños para no perderlo!" }, gptPrompt: "You are Rudy's field partner helping him tail a suspect through a busy London building. Simple A1 {targetLang}. Practice: 1) Rudy needs to say goodbye quickly to a bystander without blowing his cover 2) ask 'Where is the exit?' and 'Where is the bathroom?' naturally as cover — he needs to know the layout 3) end with quick goodbyes as the suspect moves. The vocabulary is identical — only the detective framing makes it exciting. Keep very simple and tense.", speechLang: "en-GB", suggestedAnswers: ["Excuse me, where is the exit?", "Where is the bathroom?", "Take care! See you later!", "Goodbye — I have to go!", "It was nice meeting you.", "See you tomorrow!"] },
    spanish: { situation: { ko: "루디가 런던 도심에서 용의자를 미행하고 있습니다. 위치를 파악해야 해요!", en: "Rudy is tailing a suspect through London. He needs to know the exits!", es: "Rudy sigue a un sospechoso. ¡Necesita conocer las salidas para no perderlo!" }, gptPrompt: "You are Rudy's field partner. He is tailing a suspect and needs the building layout. Simple A1 {targetLang}. Practice: 1) quick goodbye without blowing cover 2) ask '¿Dónde está la salida?' and '¿Dónde está el baño?' as cover 3) urgent quick farewells as the suspect moves. Keep very simple and tense.", speechLang: "es-ES", suggestedAnswers: ["Disculpe, ¿dónde está la salida?", "¿Dónde está el baño?", "¡Cuídate! ¡Hasta luego!", "¡Adiós, tengo que irme!", "Fue un placer conocerte.", "¡Hasta mañana!"] },
    korean: { situation: { ko: "루디가 런던 도심에서 용의자를 미행하고 있습니다. 위치를 파악해야 해요!", en: "Rudy is tailing a suspect. He needs to know the exits!", es: "Rudy sigue a un sospechoso. ¡Necesita las salidas!" }, gptPrompt: "You are Rudy's field partner. He is tailing a suspect and needs the building layout. Simple A1 {targetLang}. Practice: 1) quick goodbye without blowing cover 2) ask '출구가 어디예요?' and '화장실이 어디예요?' as cover 3) urgent quick farewells as the suspect moves. Keep very simple and tense.", speechLang: "ko-KR", suggestedAnswers: ["실례합니다, 출구가 어디예요?", "화장실이 어디예요?", "잘 가요! 다음에 봐요!", "안녕히 가세요, 가야 해요!", "만나서 반가웠어요.", "내일 봐요!"] },
    indonesian: { situation: { ko: "루디가 런던 도심에서 용의자를 미행하고 있습니다. 위치를 파악해야 해요!", en: "Rudy is tailing a suspect. He needs to know the exits!", es: "Rudy sigue a un sospechoso. ¡Necesita las salidas!" }, gptPrompt: "You are Rudy's field partner. He is tailing a suspect and needs the building layout. Simple A1 {targetLang}. Practice: 1) quick goodbye without blowing cover 2) ask 'Di mana pintu keluar?' and 'Di mana toilet?' as cover 3) urgent quick farewells as the suspect moves. Keep very simple and tense.", speechLang: "id-ID", suggestedAnswers: ["Permisi, di mana pintu keluar?", "Di mana toilet?", "Hati-hati! Sampai jumpa nanti!", "Selamat tinggal, saya harus pergi!", "Senang bertemu dengan Anda tadi.", "Sampai jumpa besok!"] },
    arabic: { situation: { ko: "루디가 런던 도심에서 용의자를 미행하고 있습니다. 위치를 파악해야 해요!", en: "Rudy is tailing a suspect. He needs to know the exits!", es: "Rudy sigue a un sospechoso. ¡Necesita las salidas!" }, gptPrompt: "You are Rudy's field partner. He is tailing a suspect and needs the building layout. Simple A1 EGYPTIAN COLLOQUIAL Arabic (NOT MSA — use 'فين' for where, never 'أين'; 'لو سَمَحْت' for excuse me). Practice: 1) quick goodbye without blowing cover 2) ask 'فين الخُروج؟' and 'فين الحَمّام؟' as cover 3) urgent quick farewells as the suspect moves. Keep very simple and tense, write Arabic with harakat.", speechLang: "ar-EG", suggestedAnswers: ["لَو سَمَحْت، أَيْنَ المَخْرَج؟", "أَيْنَ الحَمّام؟", "اِعْتَنِ بِنَفْسِك! أَراك لاحِقًا!", "مَعَ السَّلامة، يَجِب أَنْ أَذْهَب!", "تَشَرَّفْت بِمَعْرِفَتِك.", "أَراك غَدًا!"] },
  },

  day_5: {
    english: { situation: { ko: "루디가 수사에 필요한 물품을 구매해야 합니다. 가게에서 가격을 확인하고 동료와 안부도 나눠요!", en: "Rudy needs to buy supplies for the investigation. Check prices at the shop and greet a fellow agent!", es: "Rudy necesita comprar suministros para la investigación. ¡Verifica precios en la tienda y saluda a un agente!" }, gptPrompt: "You are a fellow agent Rudy meets while buying investigation supplies at a London shop. Simple A1 {targetLang}. Practice: 1) morning greeting — asking how they are 2) Rudy is buying disguise supplies, ask 'How much is this?' for items 3) if confused about a price, practice 'I don't understand' 4) if something is wrong, use 'Help, please!'. The detective framing makes every 'How much?' transaction feel meaningful. Keep very simple.", speechLang: "en-GB", suggestedAnswers: ["I'm great, thanks!", "Not bad, and you?", "How much is this?", "I don't understand.", "Help, please!", "That's expensive!"] },
    spanish: { situation: { ko: "루디가 수사 물품을 구매하면서 동료 요원과 안부를 나눕니다.", en: "Rudy buys investigation supplies and greets a fellow agent.", es: "Rudy compra suministros de investigación y saluda a un agente." }, gptPrompt: "You are a fellow agent Rudy meets while buying investigation supplies. Simple A1 {targetLang}. Practice: 1) morning greeting 2) buying supplies — ask '¿Cuánto cuesta esto?' for items 3) if confused, practice 'No entiendo' 4) use '¡Ayuda!' if something goes wrong. Detective framing makes the shopping feel real. Keep simple.", speechLang: "es-ES", suggestedAnswers: ["¡Estoy genial, gracias!", "No está mal, ¿y tú?", "¿Cuánto cuesta esto?", "No entiendo.", "¡Ayuda, por favor!", "¡Eso es caro!"] },
    korean: { situation: { ko: "루디가 수사 물품을 구매하면서 동료 요원과 안부를 나눕니다.", en: "Rudy buys investigation supplies and greets a fellow agent.", es: "Rudy compra suministros y saluda a un agente." }, gptPrompt: "You are a fellow agent Rudy meets while buying investigation supplies. Simple A1 {targetLang}. Practice: 1) morning greeting 2) buying supplies — ask '이거 얼마예요?' for items 3) if confused, practice '이해를 못 했어요' 4) use '도와주세요!' if something goes wrong. Detective framing makes it real. Keep simple.", speechLang: "ko-KR", suggestedAnswers: ["잘 지내요, 감사해요!", "괜찮아요, 당신은요?", "이거 얼마예요?", "이해를 못 했어요.", "도와주세요!", "비싸요!"] },
    indonesian: { situation: { ko: "루디가 수사 물품을 구매하면서 동료 요원과 안부를 나눕니다.", en: "Rudy buys investigation supplies and greets a fellow agent.", es: "Rudy compra suministros y saluda a un agente." }, gptPrompt: "You are a fellow agent Rudy meets while buying investigation supplies. Simple A1 {targetLang}. Practice: 1) morning greeting 2) buying supplies — ask 'Ini berapa harganya?' for items 3) if confused, practice 'Saya tidak mengerti' 4) use 'Tolong!' if something goes wrong. Detective framing makes it real. Keep simple.", speechLang: "id-ID", suggestedAnswers: ["Saya baik-baik saja, terima kasih!", "Lumayan, bagaimana dengan Anda?", "Ini berapa harganya?", "Saya tidak mengerti.", "Tolong, bantu saya!", "Ini mahal!"] },
    arabic: { situation: { ko: "루디가 수사 물품을 구매하면서 동료 요원과 안부를 나눕니다.", en: "Rudy buys investigation supplies and greets a fellow agent.", es: "Rudy compra suministros y saluda a un agente." }, gptPrompt: "You are a fellow agent Rudy meets while buying investigation supplies. Simple A1 EGYPTIAN COLLOQUIAL Arabic (NOT MSA — use 'إزَّيَّك؟', 'بِكام ده؟', never 'كيف حالك' or 'كم ثمن'). Practice: 1) morning greeting (asking how they are) 2) buying supplies — ask 'بِكام ده؟' for items 3) if confused about a price, practice 'أنا مِش فاهِم' 4) use 'النَّجْدة!' if something goes wrong. Detective framing makes every 'بِكام؟' feel real. Keep simple and write Arabic with harakat.", speechLang: "ar-EG", suggestedAnswers: ["أَنَا بِخَيْر، شُكْرًا!", "لا بَأْس، وَأَنْتَ؟", "بِكَمْ هٰذَا؟", "أَنَا لا أَفْهَم.", "النَّجْدة، ساعِدْني!", "هٰذَا غالي!"] },
  },

  day_6: {
    english: { situation: { ko: "박물관 환영 파티에서 새로운 사람들을 여러 명 만나는 상황입니다. 이번 주에 배운 모든 표현을 활용하세요!", en: "Welcome party at the museum! Meet several new people and use EVERYTHING you've learned this week!", es: "¡Fiesta de bienvenida en el museo! ¡Usa TODO lo aprendido esta semana!" }, gptPrompt: "You are Rudy hosting a welcome party at the museum. Test ALL of Unit 1 in a natural A1 {targetLang} conversation. Cover: greeting, self-introduction (name, origin, job), asking how they are, asking 'Do you speak ___?', AND survival phrases ('Where is the bathroom?', 'How much is this?' at the snack table, 'I don't understand', 'Can you say that again?'). Introduce 2-3 different 'guests'. This is a review day so test everything but be encouraging.", speechLang: "en-GB", suggestedAnswers: ["Hello! My name is ___.", "I'm from ___.", "Do you speak English?", "Where is the bathroom?", "How much is this?", "Sorry, I don't understand.", "Goodbye! See you later!"] },
    spanish: { situation: { ko: "박물관 환영 파티에서 새로운 사람들을 여러 명 만나는 상황입니다.", en: "Welcome party at the museum! Use everything you've learned!", es: "¡Fiesta de bienvenida! ¡Usa todo lo aprendido!" }, gptPrompt: "You are Rudy hosting a welcome party at the museum. Test ALL of Unit 1 in a natural A1 {targetLang} conversation. Cover: greeting, self-introduction, asking how they are, '¿Hablas ___?', AND survival phrases ('¿Dónde está el baño?', '¿Cuánto cuesta esto?', 'No entiendo', '¿Puede repetir eso?'). Introduce 2-3 different 'guests'. Be encouraging.", speechLang: "es-ES", suggestedAnswers: ["¡Hola! Me llamo ___.", "Soy de ___.", "¿Hablas español?", "¿Dónde está el baño?", "¿Cuánto cuesta esto?", "No entiendo.", "¡Adiós! ¡Hasta luego!"] },
    korean: { situation: { ko: "박물관 환영 파티에서 새로운 사람들을 여러 명 만나는 상황입니다. 배운 모든 표현을 활용하세요!", en: "Welcome party at the museum! Use everything!", es: "¡Fiesta de bienvenida! ¡Usa todo!" }, gptPrompt: "You are Rudy hosting a welcome party at the museum. Test ALL of Unit 1 in a natural A1 {targetLang} conversation. Cover: greeting, self-introduction, asking how they are, '___할 줄 아세요?', AND survival phrases ('화장실이 어디예요?', '이거 얼마예요?', '이해를 못 했어요', '다시 한번 말해 주시겠어요?'). Introduce 2-3 different 'guests'. Be encouraging.", speechLang: "ko-KR", suggestedAnswers: ["안녕하세요! 제 이름은 ___이에요.", "___에서 왔어요.", "한국어 할 줄 아세요?", "화장실이 어디예요?", "이거 얼마예요?", "이해를 못 했어요.", "안녕히 가세요! 다음에 봐요!"] },
    indonesian: { situation: { ko: "박물관 환영 파티에서 새로운 사람들을 여러 명 만나는 상황입니다. 배운 모든 표현을 활용하세요!", en: "Welcome party at the museum! Use everything!", es: "¡Fiesta de bienvenida! ¡Usa todo!" }, gptPrompt: "You are Rudy hosting a welcome party at the museum. Test ALL of Unit 1 in a natural A1 {targetLang} conversation. Cover: greeting, self-introduction, asking how they are, 'Apakah kamu bisa bahasa ___?', AND survival phrases ('Di mana toilet?', 'Ini berapa harganya?', 'Saya tidak mengerti', 'Bisa tolong ulangi?'). Introduce 2-3 different 'guests'. Be encouraging.", speechLang: "id-ID", suggestedAnswers: ["Halo! Nama saya ___.", "Saya berasal dari ___.", "Apakah kamu bisa bahasa Inggris?", "Di mana toilet?", "Ini berapa harganya?", "Saya tidak mengerti.", "Selamat tinggal! Sampai jumpa nanti!"] },
    arabic: { situation: { ko: "박물관 환영 파티에서 새로운 사람들을 여러 명 만나는 상황입니다. 배운 모든 표현을 활용하세요!", en: "Welcome party at the museum! Use everything!", es: "¡Fiesta de bienvenida! ¡Usa todo!" }, gptPrompt: "You are Rudy hosting a welcome party at the museum. Test ALL of Unit 1 in a natural A1 EGYPTIAN COLLOQUIAL Arabic conversation (NOT MSA — stay fully Egyptian: 'إزَّيَّك؟', 'إنْت مِنين؟', 'فين', 'بِكام', 'مِش', 'إيه'). Cover: greeting, self-introduction (name, origin, job), asking how they are, 'بِتِتْكَلِّم ___؟', AND survival phrases ('فين الحَمّام؟', 'بِكام ده؟' at the snack table, 'أنا مِش فاهِم', 'مُمْكِن تِقول تاني؟'). Introduce 2-3 different 'guests'. Be encouraging and write Arabic with harakat.", speechLang: "ar-EG", suggestedAnswers: ["أَهْلًا! أَنَا اسْمِي ___.", "أَنَا مِنْ ___.", "هَلْ تَتَكَلَّم الإنْجِليزِيّة؟", "أَيْنَ الحَمّام؟", "بِكَمْ هٰذَا؟", "أَنَا لا أَفْهَم.", "مَعَ السَّلامة! أَراك لاحِقًا!"] },
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4: REVIEW (updated with survival phrases, more speaking, yesterday review)
// ═══════════════════════════════════════════════════════════════════════════════

export const REVIEW_CONTENT_IMPROVED: Record<string, Partial<Record<LearningLangKey, ReviewQuestion[]>>> = {

  day_1: {
    english: [
      { type: "speak", sentence: "Hello, nice to meet you.", speechLang: "en-GB", meaning: { ko: "안녕하세요, 만나서 반갑습니다.", en: "Hello, nice to meet you.", es: "Hola, mucho gusto." } },
      { type: "fill_blank", promptWithBlank: "My name ___ Rudy.", answer: "is", options: ["is", "am", "are"], fullSentence: "My name is Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
      { type: "speak", sentence: "Sorry, I don't understand.", speechLang: "en-GB", meaning: { ko: "미안해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." } },
      { type: "fill_blank", promptWithBlank: "Where are you ___?", answer: "from", options: ["from", "to", "at"], fullSentence: "Where are you from?", fullSentenceMeaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" } },
      { type: "speak", sentence: "Thank you. Nice to meet you.", speechLang: "en-GB", meaning: { ko: "감사합니다. 만나서 반갑습니다.", en: "Thank you. Nice to meet you.", es: "Gracias. Mucho gusto." } },
    ],
    spanish: [
      { type: "speak", sentence: "Hola, mucho gusto.", speechLang: "es-ES", meaning: { ko: "안녕하세요, 만나서 반갑습니다.", en: "Hello, nice to meet you.", es: "Hola, mucho gusto." } },
      { type: "fill_blank", promptWithBlank: "Me ___ Rudy.", answer: "llamo", options: ["llamo", "llamas", "llaman"], fullSentence: "Me llamo Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
      { type: "speak", sentence: "Lo siento, no entiendo.", speechLang: "es-ES", meaning: { ko: "미안해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." } },
      { type: "fill_blank", promptWithBlank: "¿De ___ eres?", answer: "dónde", options: ["dónde", "qué", "cuándo"], fullSentence: "¿De dónde eres?", fullSentenceMeaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" } },
      { type: "speak", sentence: "Gracias. Mucho gusto.", speechLang: "es-ES", meaning: { ko: "감사합니다. 만나서 반갑습니다.", en: "Thank you. Nice to meet you.", es: "Gracias. Mucho gusto." } },
    ],
    korean: [
      { type: "speak", sentence: "안녕하세요, 만나서 반갑습니다.", speechLang: "ko-KR", meaning: { ko: "안녕하세요, 만나서 반갑습니다.", en: "Hello, nice to meet you.", es: "Hola, mucho gusto." } },
      { type: "fill_blank", promptWithBlank: "제 이름___ 루디예요.", answer: "은", options: ["은", "이", "가"], fullSentence: "제 이름은 루디예요.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
      { type: "speak", sentence: "죄송해요, 이해를 못 했어요.", speechLang: "ko-KR", meaning: { ko: "죄송해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." } },
      { type: "fill_blank", promptWithBlank: "어디에서 ___어요?", answer: "오셨", options: ["오셨", "갔", "있"], fullSentence: "어디에서 오셨어요?", fullSentenceMeaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" } },
      { type: "speak", sentence: "감사합니다. 만나서 반갑습니다.", speechLang: "ko-KR", meaning: { ko: "감사합니다. 만나서 반갑습니다.", en: "Thank you. Nice to meet you.", es: "Gracias. Mucho gusto." } },
    ],
    indonesian: [
      { type: "speak", sentence: "Halo, senang bertemu dengan Anda.", speechLang: "id-ID", meaning: { ko: "안녕하세요, 만나서 반갑습니다.", en: "Hello, nice to meet you.", es: "Hola, mucho gusto." } },
      { type: "fill_blank", promptWithBlank: "___ saya Rudy.", answer: "Nama", options: ["Nama", "Saya", "Orang"], fullSentence: "Nama saya Rudy.", fullSentenceMeaning: { ko: "제 이름은 루디예요.", en: "My name is Rudy.", es: "Me llamo Rudy." } },
      { type: "speak", sentence: "Maaf, saya tidak mengerti.", speechLang: "id-ID", meaning: { ko: "미안해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." } },
      { type: "fill_blank", promptWithBlank: "Anda berasal dari ___?", answer: "mana", options: ["mana", "apa", "siapa"], fullSentence: "Anda berasal dari mana?", fullSentenceMeaning: { ko: "어디에서 오셨어요?", en: "Where are you from?", es: "¿De dónde eres?" } },
      { type: "speak", sentence: "Terima kasih. Senang bertemu dengan Anda.", speechLang: "id-ID", meaning: { ko: "감사합니다. 만나서 반갑습니다.", en: "Thank you. Nice to meet you.", es: "Gracias. Mucho gusto." } },
    ],
    arabic: [
      { type: "speak", sentence: "أَهْلًا، فُرْصة سَعيدة.", speechLang: "ar-EG", meaning: { ko: "ahlan, forsa sa3ida · 안녕하세요, 만나서 반갑습니다.", en: "ahlan, forsa sa3ida · Hello, nice to meet you.", es: "ahlan, forsa sa3ida · Hola, mucho gusto.", id: "ahlan, forsa sa3ida · Halo, senang bertemu." } },
      { type: "fill_blank", promptWithBlank: "أَنَا ___ رودي.", answer: "اسْمِي", options: ["اسْمِي", "أَنَا", "أَنْتَ"], fullSentence: "أَنَا اسْمِي رودي.", fullSentenceMeaning: { ko: "ana esmi Rudy · 제 이름은 루디예요.", en: "ana esmi Rudy · My name is Rudy.", es: "ana esmi Rudy · Me llamo Rudy.", id: "ana esmi Rudy · Nama saya Rudy." } },
      { type: "speak", sentence: "آسِف، أَنَا لا أَفْهَم.", speechLang: "ar-EG", meaning: { ko: "aasef, ana mesh fahem · 미안해요, 이해를 못 했어요.", en: "aasef, ana mesh fahem · Sorry, I don't understand.", es: "aasef, ana mesh fahem · Lo siento, no entiendo.", id: "aasef, ana mesh fahem · Maaf, saya tidak mengerti." } },
      { type: "fill_blank", promptWithBlank: "أَنْتَ ___؟", answer: "مِنْ أَيْنَ", options: ["مِنْ أَيْنَ", "ماذا", "مَنْ"], fullSentence: "مِنْ أَيْنَ أَنْتَ؟", fullSentenceMeaning: { ko: "enta minein? · 어디에서 오셨어요?", en: "enta minein? · Where are you from?", es: "enta minein? · ¿De dónde eres?", id: "enta minein? · Anda berasal dari mana?" } },
      { type: "speak", sentence: "شُكْرًا. فُرْصة سَعيدة.", speechLang: "ar-EG", meaning: { ko: "shokran. forsa sa3ida · 감사합니다. 만나서 반갑습니다.", en: "shokran. forsa sa3ida · Thank you. Nice to meet you.", es: "shokran. forsa sa3ida · Gracias. Mucho gusto.", id: "shokran. forsa sa3ida · Terima kasih. Senang bertemu." } },
    ],
  },

  day_2: {
    english: [
      { type: "speak", sentence: "Hello, my name is Rudy.", speechLang: "en-GB", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Sorry, I don't ___.", answer: "understand", options: ["understand", "know", "speak"], fullSentence: "Sorry, I don't understand.", fullSentenceMeaning: { ko: "미안해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, isYesterdayReview: true },
      { type: "speak", sentence: "I'm from Korea. I live in Seoul.", speechLang: "en-GB", meaning: { ko: "저는 한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." } },
      { type: "fill_blank", promptWithBlank: "Can you say that ___, please?", answer: "again", options: ["again", "more", "once"], fullSentence: "Can you say that again, please?", fullSentenceMeaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" } },
      { type: "speak", sentence: "Can you say that again, please?", speechLang: "en-GB", meaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" } },
    ],
    spanish: [
      { type: "speak", sentence: "Hola, me llamo Rudy.", speechLang: "es-ES", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Lo siento, no ___.", answer: "entiendo", options: ["entiendo", "hablo", "sé"], fullSentence: "Lo siento, no entiendo.", fullSentenceMeaning: { ko: "미안해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, isYesterdayReview: true },
      { type: "speak", sentence: "Soy de Corea. Vivo en Seúl.", speechLang: "es-ES", meaning: { ko: "저는 한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." } },
      { type: "fill_blank", promptWithBlank: "¿Puede ___ eso, por favor?", answer: "repetir", options: ["repetir", "decir", "hablar"], fullSentence: "¿Puede repetir eso, por favor?", fullSentenceMeaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" } },
      { type: "speak", sentence: "¿Puede repetir eso, por favor?", speechLang: "es-ES", meaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" } },
    ],
    korean: [
      { type: "speak", sentence: "안녕하세요, 제 이름은 루디예요.", speechLang: "ko-KR", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "이해를 ___ 했어요.", answer: "못", options: ["못", "안", "잘"], fullSentence: "이해를 못 했어요.", fullSentenceMeaning: { ko: "이해를 못 했어요.", en: "I don't understand.", es: "No entiendo." }, isYesterdayReview: true },
      { type: "speak", sentence: "저는 한국에서 왔어요. 서울에 살아요.", speechLang: "ko-KR", meaning: { ko: "저는 한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." } },
      { type: "fill_blank", promptWithBlank: "다시 한번 ___ 주시겠어요?", answer: "말해", options: ["말해", "해", "가"], fullSentence: "다시 한번 말해 주시겠어요?", fullSentenceMeaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" } },
      { type: "speak", sentence: "다시 한번 말해 주시겠어요?", speechLang: "ko-KR", meaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" } },
    ],
    indonesian: [
      { type: "speak", sentence: "Halo, nama saya Rudy.", speechLang: "id-ID", meaning: { ko: "안녕하세요, 제 이름은 루디예요.", en: "Hello, my name is Rudy.", es: "Hola, me llamo Rudy." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Maaf, saya tidak ___.", answer: "mengerti", options: ["mengerti", "tahu", "bisa"], fullSentence: "Maaf, saya tidak mengerti.", fullSentenceMeaning: { ko: "미안해요, 이해를 못 했어요.", en: "Sorry, I don't understand.", es: "Lo siento, no entiendo." }, isYesterdayReview: true },
      { type: "speak", sentence: "Saya berasal dari Korea. Saya tinggal di Seoul.", speechLang: "id-ID", meaning: { ko: "저는 한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." } },
      { type: "fill_blank", promptWithBlank: "Bisa tolong ___?", answer: "ulangi", options: ["ulangi", "bicara", "pergi"], fullSentence: "Bisa tolong ulangi?", fullSentenceMeaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" } },
      { type: "speak", sentence: "Bisa tolong ulangi?", speechLang: "id-ID", meaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" } },
    ],
    arabic: [
      { type: "speak", sentence: "أَهْلًا، أَنَا اسْمِي رودي.", speechLang: "ar-EG", meaning: { ko: "ahlan, ana esmi Rudy · 안녕하세요, 제 이름은 루디예요.", en: "ahlan, ana esmi Rudy · Hello, my name is Rudy.", es: "ahlan, ana esmi Rudy · Hola, me llamo Rudy.", id: "ahlan, ana esmi Rudy · Halo, nama saya Rudy." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "آسِف، أَنَا ___ أَفْهَم.", answer: "لا", options: ["لا", "لَيْسَ", "ما"], fullSentence: "آسِف، أَنَا لا أَفْهَم.", fullSentenceMeaning: { ko: "aasef, ana mesh fahem · 미안해요, 이해를 못 했어요.", en: "aasef, ana mesh fahem · Sorry, I don't understand.", es: "aasef, ana mesh fahem · Lo siento, no entiendo.", id: "aasef, ana mesh fahem · Maaf, saya tidak mengerti." }, isYesterdayReview: true },
      { type: "speak", sentence: "أَنَا مِنْ كوريا. أَنَا ساكِن في سيول.", speechLang: "ar-EG", meaning: { ko: "ana men Korea. ana saken fi Seoul · 저는 한국에서 왔어요. 서울에 살아요.", en: "ana men Korea. ana saken fi Seoul · I'm from Korea. I live in Seoul.", es: "ana men Korea. ana saken fi Seoul · Soy de Corea. Vivo en Seúl.", id: "ana men Korea. ana saken fi Seoul · Saya berasal dari Korea. Saya tinggal di Seoul." } },
      { type: "fill_blank", promptWithBlank: "مُمْكِن تَقول ___؟", answer: "مَرّة ثانِية", options: ["مَرّة ثانِية", "بِبُطْء", "كَثيرًا"], fullSentence: "مُمْكِن تَقول مَرّة ثانِية؟", fullSentenceMeaning: { ko: "momken te'ool tani? · 다시 한번 말해 주시겠어요?", en: "momken te'ool tani? · Can you say that again, please?", es: "momken te'ool tani? · ¿Puede repetir eso, por favor?", id: "momken te'ool tani? · Bisa tolong ulangi?" } },
      { type: "speak", sentence: "مُمْكِن تَقول مَرّة ثانِية؟", speechLang: "ar-EG", meaning: { ko: "momken te'ool tani? · 다시 한번 말해 주시겠어요?", en: "momken te'ool tani? · Can you say that again, please?", es: "momken te'ool tani? · ¿Puede repetir eso, por favor?", id: "momken te'ool tani? · Bisa tolong ulangi?" } },
    ],
  },

  day_3: {
    english: [
      { type: "speak", sentence: "I'm from Korea. I live in Seoul.", speechLang: "en-GB", meaning: { ko: "저는 한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Can you say that ___, please?", answer: "again", options: ["again", "more", "once"], fullSentence: "Can you say that again, please?", fullSentenceMeaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again, please?", es: "¿Puede repetir eso, por favor?" }, isYesterdayReview: true },
      { type: "speak", sentence: "I'm a student. I work at a school.", speechLang: "en-GB", meaning: { ko: "저는 학생이에요. 학교에서 일해요.", en: "I'm a student. I work at a school.", es: "Soy estudiante. Trabajo en una escuela." } },
      { type: "fill_blank", promptWithBlank: "Do you ___ English?", answer: "speak", options: ["speak", "talk", "say"], fullSentence: "Do you speak English?", fullSentenceMeaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Hablas inglés?" } },
      { type: "speak", sentence: "Do you speak English? A little bit.", speechLang: "en-GB", meaning: { ko: "영어 할 줄 아세요? 조금이요.", en: "Do you speak English? A little bit.", es: "¿Hablas inglés? Un poquito." } },
    ],
    spanish: [
      { type: "speak", sentence: "Soy de Corea. Vivo en Seúl.", speechLang: "es-ES", meaning: { ko: "저는 한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿Puede ___ eso?", answer: "repetir", options: ["repetir", "decir", "hablar"], fullSentence: "¿Puede repetir eso?", fullSentenceMeaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again?", es: "¿Puede repetir eso?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Soy estudiante. Trabajo en una escuela.", speechLang: "es-ES", meaning: { ko: "저는 학생이에요. 학교에서 일해요.", en: "I'm a student. I work at a school.", es: "Soy estudiante. Trabajo en una escuela." } },
      { type: "fill_blank", promptWithBlank: "¿___ español?", answer: "Hablas", options: ["Hablas", "Habla", "Hablo"], fullSentence: "¿Hablas español?", fullSentenceMeaning: { ko: "스페인어 할 줄 아세요?", en: "Do you speak Spanish?", es: "¿Hablas español?" } },
      { type: "speak", sentence: "¿Hablas español? Un poquito.", speechLang: "es-ES", meaning: { ko: "스페인어 할 줄 아세요? 조금이요.", en: "Do you speak Spanish? A little bit.", es: "¿Hablas español? Un poquito." } },
    ],
    korean: [
      { type: "speak", sentence: "저는 한국에서 왔어요. 서울에 살아요.", speechLang: "ko-KR", meaning: { ko: "저는 한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "다시 한번 ___ 주시겠어요?", answer: "말해", options: ["말해", "해", "가"], fullSentence: "다시 한번 말해 주시겠어요?", fullSentenceMeaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again?", es: "¿Puede repetir eso?" }, isYesterdayReview: true },
      { type: "speak", sentence: "저는 학생이에요. 학교에서 일해요.", speechLang: "ko-KR", meaning: { ko: "저는 학생이에요. 학교에서 일해요.", en: "I'm a student. I work at a school.", es: "Soy estudiante. Trabajo en una escuela." } },
      { type: "fill_blank", promptWithBlank: "한국어 할 ___ 아세요?", answer: "줄", options: ["줄", "것", "수"], fullSentence: "한국어 할 줄 아세요?", fullSentenceMeaning: { ko: "한국어 할 줄 아세요?", en: "Do you speak Korean?", es: "¿Hablas coreano?" } },
      { type: "speak", sentence: "한국어 할 줄 아세요? 조금이요.", speechLang: "ko-KR", meaning: { ko: "한국어 할 줄 아세요? 조금이요.", en: "Do you speak Korean? A little bit.", es: "¿Hablas coreano? Un poquito." } },
    ],
    indonesian: [
      { type: "speak", sentence: "Saya berasal dari Korea. Saya tinggal di Seoul.", speechLang: "id-ID", meaning: { ko: "저는 한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Bisa tolong ___?", answer: "ulangi", options: ["ulangi", "bicara", "pergi"], fullSentence: "Bisa tolong ulangi?", fullSentenceMeaning: { ko: "다시 한번 말해 주시겠어요?", en: "Can you say that again?", es: "¿Puede repetir eso?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Saya seorang pelajar. Saya bekerja di sekolah.", speechLang: "id-ID", meaning: { ko: "저는 학생이에요. 학교에서 일해요.", en: "I'm a student. I work at a school.", es: "Soy estudiante. Trabajo en una escuela." } },
      { type: "fill_blank", promptWithBlank: "Apakah kamu bisa ___ Inggris?", answer: "bahasa", options: ["bahasa", "kata", "suara"], fullSentence: "Apakah kamu bisa bahasa Inggris?", fullSentenceMeaning: { ko: "영어 할 줄 아세요?", en: "Do you speak English?", es: "¿Hablas inglés?" } },
      { type: "speak", sentence: "Apakah kamu bisa bahasa Inggris? Sedikit saja.", speechLang: "id-ID", meaning: { ko: "영어 할 줄 아세요? 조금이요.", en: "Do you speak English? A little bit.", es: "¿Hablas inglés? Un poquito." } },
    ],
    arabic: [
      { type: "speak", sentence: "أَنَا مِنْ كوريا. أَنَا ساكِن في سيول.", speechLang: "ar-EG", meaning: { ko: "ana men Korea. ana saken fi Seoul · 저는 한국에서 왔어요. 서울에 살아요.", en: "ana men Korea. ana saken fi Seoul · I'm from Korea. I live in Seoul.", es: "ana men Korea. ana saken fi Seoul · Soy de Corea. Vivo en Seúl.", id: "ana men Korea. ana saken fi Seoul · Saya berasal dari Korea. Saya tinggal di Seoul." }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "مُمْكِن تَقول ___؟", answer: "مَرّة ثانِية", options: ["مَرّة ثانِية", "بِبُطْء", "كَثيرًا"], fullSentence: "مُمْكِن تَقول مَرّة ثانِية؟", fullSentenceMeaning: { ko: "momken te'ool tani? · 다시 한번 말해 주시겠어요?", en: "momken te'ool tani? · Can you say that again?", es: "momken te'ool tani? · ¿Puede repetir eso?", id: "momken te'ool tani? · Bisa tolong ulangi?" }, isYesterdayReview: true },
      { type: "speak", sentence: "أَنَا طالِب. أَنَا أَعْمَل في مَدْرَسة.", speechLang: "ar-EG", meaning: { ko: "ana taleb. ana bashtaghal fi madrasa · 저는 학생이에요. 학교에서 일해요.", en: "ana taleb. ana bashtaghal fi madrasa · I'm a student. I work at a school.", es: "ana taleb. ana bashtaghal fi madrasa · Soy estudiante. Trabajo en una escuela.", id: "ana taleb. ana bashtaghal fi madrasa · Saya seorang pelajar. Saya bekerja di sekolah." } },
      { type: "fill_blank", promptWithBlank: "هَلْ تَتَكَلَّم ___؟", answer: "الإنْجِليزِيّة", options: ["الإنْجِليزِيّة", "شَرِكة", "طالِب"], fullSentence: "هَلْ تَتَكَلَّم الإنْجِليزِيّة؟", fullSentenceMeaning: { ko: "beteklem engelizi? · 영어 할 줄 아세요?", en: "beteklem engelizi? · Do you speak English?", es: "beteklem engelizi? · ¿Hablas inglés?", id: "beteklem engelizi? · Apakah kamu bisa bahasa Inggris?" } },
      { type: "speak", sentence: "هَلْ تَتَكَلَّم الإنْجِليزِيّة؟ قَليلًا.", speechLang: "ar-EG", meaning: { ko: "beteklem engelizi? shwaya · 영어 할 줄 아세요? 조금이요.", en: "beteklem engelizi? shwaya · Do you speak English? A little bit.", es: "beteklem engelizi? shwaya · ¿Hablas inglés? Un poquito.", id: "beteklem engelizi? shwaya · Apakah kamu bisa bahasa Inggris? Sedikit saja." } },
    ],
  },

  day_4: {
    english: [
      { type: "speak", sentence: "I'm a student. Do you speak English?", speechLang: "en-GB", meaning: { ko: "저는 학생이에요. 영어 할 줄 아세요?", en: "I'm a student. Do you speak English?", es: "Soy estudiante. ¿Hablas inglés?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "What do you ___?", answer: "do", options: ["do", "go", "have"], fullSentence: "What do you do?", fullSentenceMeaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Goodbye! See you later! Take care!", speechLang: "en-GB", meaning: { ko: "안녕히 가세요! 다음에 봐요! 잘 가요!", en: "Goodbye! See you later! Take care!", es: "¡Adiós! ¡Hasta luego! ¡Cuídate!" } },
      { type: "fill_blank", promptWithBlank: "___ is the bathroom?", answer: "Where", options: ["Where", "What", "How"], fullSentence: "Where is the bathroom?", fullSentenceMeaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" } },
      { type: "speak", sentence: "Excuse me, where is the exit?", speechLang: "en-GB", meaning: { ko: "실례합니다, 출구가 어디예요?", en: "Excuse me, where is the exit?", es: "Disculpe, ¿dónde está la salida?" } },
    ],
    spanish: [
      { type: "speak", sentence: "Soy estudiante. ¿Hablas español?", speechLang: "es-ES", meaning: { ko: "저는 학생이에요. 스페인어 할 줄 아세요?", en: "I'm a student. Do you speak Spanish?", es: "Soy estudiante. ¿Hablas español?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¿A qué te ___?", answer: "dedicas", options: ["dedicas", "trabajas", "haces"], fullSentence: "¿A qué te dedicas?", fullSentenceMeaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" }, isYesterdayReview: true },
      { type: "speak", sentence: "¡Adiós! ¡Hasta luego! ¡Cuídate!", speechLang: "es-ES", meaning: { ko: "안녕히 가세요! 다음에 봐요! 잘 가요!", en: "Goodbye! See you later! Take care!", es: "¡Adiós! ¡Hasta luego! ¡Cuídate!" } },
      { type: "fill_blank", promptWithBlank: "¿___ está el baño?", answer: "Dónde", options: ["Dónde", "Qué", "Cómo"], fullSentence: "¿Dónde está el baño?", fullSentenceMeaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" } },
      { type: "speak", sentence: "Disculpe, ¿dónde está la salida?", speechLang: "es-ES", meaning: { ko: "실례합니다, 출구가 어디예요?", en: "Excuse me, where is the exit?", es: "Disculpe, ¿dónde está la salida?" } },
    ],
    korean: [
      { type: "speak", sentence: "저는 학생이에요. 한국어 할 줄 아세요?", speechLang: "ko-KR", meaning: { ko: "저는 학생이에요. 한국어 할 줄 아세요?", en: "I'm a student. Do you speak Korean?", es: "Soy estudiante. ¿Hablas coreano?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "무슨 ___ 하세요?", answer: "일", options: ["일", "것", "걸"], fullSentence: "무슨 일 하세요?", fullSentenceMeaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" }, isYesterdayReview: true },
      { type: "speak", sentence: "안녕히 가세요! 다음에 봐요! 잘 가요!", speechLang: "ko-KR", meaning: { ko: "안녕히 가세요! 다음에 봐요! 잘 가요!", en: "Goodbye! See you later! Take care!", es: "¡Adiós! ¡Hasta luego! ¡Cuídate!" } },
      { type: "fill_blank", promptWithBlank: "화장실이 ___예요?", answer: "어디", options: ["어디", "뭐", "어떻게"], fullSentence: "화장실이 어디예요?", fullSentenceMeaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" } },
      { type: "speak", sentence: "실례합니다, 출구가 어디예요?", speechLang: "ko-KR", meaning: { ko: "실례합니다, 출구가 어디예요?", en: "Excuse me, where is the exit?", es: "Disculpe, ¿dónde está la salida?" } },
    ],
    indonesian: [
      { type: "speak", sentence: "Saya seorang pelajar. Apakah kamu bisa bahasa Inggris?", speechLang: "id-ID", meaning: { ko: "저는 학생이에요. 영어 할 줄 아세요?", en: "I'm a student. Do you speak English?", es: "Soy estudiante. ¿Hablas inglés?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Apa ___ Anda?", answer: "pekerjaan", options: ["pekerjaan", "kabar", "nama"], fullSentence: "Apa pekerjaan Anda?", fullSentenceMeaning: { ko: "무슨 일 하세요?", en: "What do you do?", es: "¿A qué te dedicas?" }, isYesterdayReview: true },
      { type: "speak", sentence: "Selamat tinggal! Sampai jumpa nanti! Hati-hati!", speechLang: "id-ID", meaning: { ko: "안녕히 가세요! 다음에 봐요! 잘 가요!", en: "Goodbye! See you later! Take care!", es: "¡Adiós! ¡Hasta luego! ¡Cuídate!" } },
      { type: "fill_blank", promptWithBlank: "___ mana toilet?", answer: "Di", options: ["Di", "Ke", "Dari"], fullSentence: "Di mana toilet?", fullSentenceMeaning: { ko: "화장실이 어디예요?", en: "Where is the bathroom?", es: "¿Dónde está el baño?" } },
      { type: "speak", sentence: "Permisi, di mana pintu keluar?", speechLang: "id-ID", meaning: { ko: "실례합니다, 출구가 어디예요?", en: "Excuse me, where is the exit?", es: "Disculpe, ¿dónde está la salida?" } },
    ],
    arabic: [
      { type: "speak", sentence: "أَنَا طالِب. هَلْ تَتَكَلَّم الإنْجِليزِيّة؟", speechLang: "ar-EG", meaning: { ko: "ana taleb. beteklem engelizi? · 저는 학생이에요. 영어 할 줄 아세요?", en: "ana taleb. beteklem engelizi? · I'm a student. Do you speak English?", es: "ana taleb. beteklem engelizi? · Soy estudiante. ¿Hablas inglés?", id: "ana taleb. beteklem engelizi? · Saya seorang pelajar. Apakah kamu bisa bahasa Inggris?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "___ تَعْمَل؟", answer: "ماذا", options: ["ماذا", "مَنْ", "أَيْنَ"], fullSentence: "ماذا تَعْمَل؟", fullSentenceMeaning: { ko: "beteshtaghal eh? · 무슨 일 하세요?", en: "beteshtaghal eh? · What do you do?", es: "beteshtaghal eh? · ¿A qué te dedicas?", id: "beteshtaghal eh? · Apa pekerjaan Anda?" }, isYesterdayReview: true },
      { type: "speak", sentence: "مَعَ السَّلامة! أَراك لاحِقًا! اِعْتَنِ بِنَفْسِك!", speechLang: "ar-EG", meaning: { ko: "ma3a el-salama! ashoofak ba3dein! khalli balak! · 안녕히 가세요! 다음에 봐요! 잘 가요!", en: "ma3a el-salama! ashoofak ba3dein! khalli balak! · Goodbye! See you later! Take care!", es: "ma3a el-salama! ashoofak ba3dein! khalli balak! · ¡Adiós! ¡Hasta luego! ¡Cuídate!", id: "ma3a el-salama! ashoofak ba3dein! khalli balak! · Selamat tinggal! Sampai jumpa nanti! Hati-hati!" } },
      { type: "fill_blank", promptWithBlank: "___ الحَمّام؟", answer: "أَيْنَ", options: ["أَيْنَ", "ماذا", "مَتى"], fullSentence: "أَيْنَ الحَمّام؟", fullSentenceMeaning: { ko: "fein el-hammam? · 화장실이 어디예요?", en: "fein el-hammam? · Where is the bathroom?", es: "fein el-hammam? · ¿Dónde está el baño?", id: "fein el-hammam? · Di mana toilet?" } },
      { type: "speak", sentence: "لَو سَمَحْت، أَيْنَ المَخْرَج؟", speechLang: "ar-EG", meaning: { ko: "law samaht, fein el-khoroog? · 실례합니다, 출구가 어디예요?", en: "law samaht, fein el-khoroog? · Excuse me, where is the exit?", es: "law samaht, fein el-khoroog? · Disculpe, ¿dónde está la salida?", id: "law samaht, fein el-khoroog? · Permisi, di mana pintu keluar?" } },
    ],
  },

  day_5: {
    english: [
      { type: "speak", sentence: "Goodbye! Take care! Where is the exit?", speechLang: "en-GB", meaning: { ko: "안녕히 가세요! 잘 가요! 출구가 어디예요?", en: "Goodbye! Take care! Where is the exit?", es: "¡Adiós! ¡Cuídate! ¿Dónde está la salida?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "See you ___!", answer: "later", options: ["later", "after", "next"], fullSentence: "See you later!", fullSentenceMeaning: { ko: "다음에 봐요!", en: "See you later!", es: "¡Hasta luego!" }, isYesterdayReview: true },
      { type: "speak", sentence: "I'm fine, thank you. And you?", speechLang: "en-GB", meaning: { ko: "잘 지내요, 감사합니다. 당신은요?", en: "I'm fine, thank you. And you?", es: "Estoy bien, gracias. ¿Y tú?" } },
      { type: "fill_blank", promptWithBlank: "How ___ is this?", answer: "much", options: ["much", "many", "long"], fullSentence: "How much is this?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
      { type: "speak", sentence: "Help! I need help, please.", speechLang: "en-GB", meaning: { ko: "도와주세요! 도움이 필요해요.", en: "Help! I need help, please.", es: "¡Ayuda! Necesito ayuda, por favor." } },
    ],
    spanish: [
      { type: "speak", sentence: "¡Adiós! ¡Cuídate! ¿Dónde está la salida?", speechLang: "es-ES", meaning: { ko: "안녕히 가세요! 잘 가요! 출구가 어디예요?", en: "Goodbye! Take care! Where is the exit?", es: "¡Adiós! ¡Cuídate! ¿Dónde está la salida?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "¡Hasta ___!", answer: "luego", options: ["luego", "mañana", "pronto"], fullSentence: "¡Hasta luego!", fullSentenceMeaning: { ko: "다음에 봐요!", en: "See you later!", es: "¡Hasta luego!" }, isYesterdayReview: true },
      { type: "speak", sentence: "Estoy bien, gracias. ¿Y tú?", speechLang: "es-ES", meaning: { ko: "잘 지내요, 감사합니다. 당신은요?", en: "I'm fine, thank you. And you?", es: "Estoy bien, gracias. ¿Y tú?" } },
      { type: "fill_blank", promptWithBlank: "¿Cuánto ___ esto?", answer: "cuesta", options: ["cuesta", "es", "tiene"], fullSentence: "¿Cuánto cuesta esto?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
      { type: "speak", sentence: "¡Ayuda! Necesito ayuda, por favor.", speechLang: "es-ES", meaning: { ko: "도와주세요! 도움이 필요해요.", en: "Help! I need help, please.", es: "¡Ayuda! Necesito ayuda, por favor." } },
    ],
    korean: [
      { type: "speak", sentence: "안녕히 가세요! 잘 가요! 출구가 어디예요?", speechLang: "ko-KR", meaning: { ko: "안녕히 가세요! 잘 가요! 출구가 어디예요?", en: "Goodbye! Take care! Where is the exit?", es: "¡Adiós! ¡Cuídate! ¿Dónde está la salida?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "다음에 ___!", answer: "봐요", options: ["봐요", "가요", "해요"], fullSentence: "다음에 봐요!", fullSentenceMeaning: { ko: "다음에 봐요!", en: "See you later!", es: "¡Hasta luego!" }, isYesterdayReview: true },
      { type: "speak", sentence: "잘 지내요, 감사합니다. 당신은요?", speechLang: "ko-KR", meaning: { ko: "잘 지내요, 감사합니다. 당신은요?", en: "I'm fine, thank you. And you?", es: "Estoy bien, gracias. ¿Y tú?" } },
      { type: "fill_blank", promptWithBlank: "이거 ___예요?", answer: "얼마", options: ["얼마", "뭐", "어디"], fullSentence: "이거 얼마예요?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
      { type: "speak", sentence: "도와주세요! 도움이 필요해요.", speechLang: "ko-KR", meaning: { ko: "도와주세요! 도움이 필요해요.", en: "Help! I need help, please.", es: "¡Ayuda! Necesito ayuda, por favor." } },
    ],
    indonesian: [
      { type: "speak", sentence: "Selamat tinggal! Hati-hati! Di mana pintu keluar?", speechLang: "id-ID", meaning: { ko: "안녕히 가세요! 잘 가요! 출구가 어디예요?", en: "Goodbye! Take care! Where is the exit?", es: "¡Adiós! ¡Cuídate! ¿Dónde está la salida?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "Sampai jumpa ___!", answer: "nanti", options: ["nanti", "besok", "pagi"], fullSentence: "Sampai jumpa nanti!", fullSentenceMeaning: { ko: "다음에 봐요!", en: "See you later!", es: "¡Hasta luego!" }, isYesterdayReview: true },
      { type: "speak", sentence: "Saya baik-baik saja, terima kasih. Bagaimana dengan Anda?", speechLang: "id-ID", meaning: { ko: "잘 지내요, 감사합니다. 당신은요?", en: "I'm fine, thank you. And you?", es: "Estoy bien, gracias. ¿Y tú?" } },
      { type: "fill_blank", promptWithBlank: "Ini berapa ___?", answer: "harganya", options: ["harganya", "kabar", "nama"], fullSentence: "Ini berapa harganya?", fullSentenceMeaning: { ko: "이거 얼마예요?", en: "How much is this?", es: "¿Cuánto cuesta esto?" } },
      { type: "speak", sentence: "Tolong! Saya butuh bantuan.", speechLang: "id-ID", meaning: { ko: "도와주세요! 도움이 필요해요.", en: "Help! I need help, please.", es: "¡Ayuda! Necesito ayuda, por favor." } },
    ],
    arabic: [
      { type: "speak", sentence: "مَعَ السَّلامة! اِعْتَنِ بِنَفْسِك! أَيْنَ المَخْرَج؟", speechLang: "ar-EG", meaning: { ko: "ma3a el-salama! khalli balak! fein el-khoroog? · 안녕히 가세요! 잘 가요! 출구가 어디예요?", en: "ma3a el-salama! khalli balak! fein el-khoroog? · Goodbye! Take care! Where is the exit?", es: "ma3a el-salama! khalli balak! fein el-khoroog? · ¡Adiós! ¡Cuídate! ¿Dónde está la salida?", id: "ma3a el-salama! khalli balak! fein el-khoroog? · Selamat tinggal! Hati-hati! Di mana pintu keluar?" }, isYesterdayReview: true },
      { type: "fill_blank", promptWithBlank: "مَعَ ___! أَراك لاحِقًا.", answer: "السَّلامة", options: ["السَّلامة", "الخَيْر", "النَّجْدة"], fullSentence: "مَعَ السَّلامة! أَراك لاحِقًا.", fullSentenceMeaning: { ko: "ma3a el-salama! ashoofak ba3dein · 안녕히 가세요! 다음에 봐요!", en: "ma3a el-salama! ashoofak ba3dein · Goodbye! See you later!", es: "ma3a el-salama! ashoofak ba3dein · ¡Adiós! ¡Hasta luego!", id: "ma3a el-salama! ashoofak ba3dein · Selamat tinggal! Sampai jumpa nanti!" }, isYesterdayReview: true },
      { type: "speak", sentence: "أَنَا بِخَيْر، شُكْرًا. وَأَنْتَ؟", speechLang: "ar-EG", meaning: { ko: "ana kwayyes, shokran. wenta? · 잘 지내요, 감사합니다. 당신은요?", en: "ana kwayyes, shokran. wenta? · I'm fine, thank you. And you?", es: "ana kwayyes, shokran. wenta? · Estoy bien, gracias. ¿Y tú?", id: "ana kwayyes, shokran. wenta? · Saya baik-baik saja, terima kasih. Bagaimana dengan Anda?" } },
      { type: "fill_blank", promptWithBlank: "___ هٰذَا؟", answer: "بِكَمْ", options: ["بِكَمْ", "أَيْنَ", "كَيْفَ حالُك"], fullSentence: "بِكَمْ هٰذَا؟", fullSentenceMeaning: { ko: "bekam da? · 이거 얼마예요?", en: "bekam da? · How much is this?", es: "bekam da? · ¿Cuánto cuesta esto?", id: "bekam da? · Ini berapa harganya?" } },
      { type: "speak", sentence: "النَّجْدة! أَحْتاج مُساعَدة، لَو سَمَحْت.", speechLang: "ar-EG", meaning: { ko: "el-nagda! mehtaag mosa3da, law samaht · 도와주세요! 도움이 필요해요.", en: "el-nagda! mehtaag mosa3da, law samaht · Help! I need help, please.", es: "el-nagda! mehtaag mosa3da, law samaht · ¡Ayuda! Necesito ayuda, por favor.", id: "el-nagda! mehtaag mosa3da, law samaht · Tolong! Saya butuh bantuan." } },
    ],
  },

  day_6: {
    english: [
      { type: "speak", sentence: "Hello, my name is Rudy. Nice to meet you.", speechLang: "en-GB", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 반갑습니다.", en: "Hello, my name is Rudy. Nice to meet you.", es: "Hola, me llamo Rudy. Mucho gusto." } },
      { type: "speak", sentence: "I'm from Korea. I live in Seoul.", speechLang: "en-GB", meaning: { ko: "한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." } },
      { type: "speak", sentence: "Sorry, I don't understand. Can you say that again?", speechLang: "en-GB", meaning: { ko: "미안해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요?", en: "Sorry, I don't understand. Can you say that again?", es: "Lo siento, no entiendo. ¿Puede repetir eso?" } },
      { type: "speak", sentence: "Where is the bathroom? How much is this?", speechLang: "en-GB", meaning: { ko: "화장실이 어디예요? 이거 얼마예요?", en: "Where is the bathroom? How much is this?", es: "¿Dónde está el baño? ¿Cuánto cuesta esto?" } },
      { type: "speak", sentence: "Goodbye! Take care! See you tomorrow!", speechLang: "en-GB", meaning: { ko: "안녕히 가세요! 잘 가요! 내일 봐요!", en: "Goodbye! Take care! See you tomorrow!", es: "¡Adiós! ¡Cuídate! ¡Hasta mañana!" } },
    ],
    spanish: [
      { type: "speak", sentence: "Hola, me llamo Rudy. Mucho gusto.", speechLang: "es-ES", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 반갑습니다.", en: "Hello, my name is Rudy. Nice to meet you.", es: "Hola, me llamo Rudy. Mucho gusto." } },
      { type: "speak", sentence: "Soy de Corea. Vivo en Seúl.", speechLang: "es-ES", meaning: { ko: "한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." } },
      { type: "speak", sentence: "Lo siento, no entiendo. ¿Puede repetir eso?", speechLang: "es-ES", meaning: { ko: "미안해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요?", en: "Sorry, I don't understand. Can you say that again?", es: "Lo siento, no entiendo. ¿Puede repetir eso?" } },
      { type: "speak", sentence: "¿Dónde está el baño? ¿Cuánto cuesta esto?", speechLang: "es-ES", meaning: { ko: "화장실이 어디예요? 이거 얼마예요?", en: "Where is the bathroom? How much is this?", es: "¿Dónde está el baño? ¿Cuánto cuesta esto?" } },
      { type: "speak", sentence: "¡Adiós! ¡Cuídate! ¡Hasta mañana!", speechLang: "es-ES", meaning: { ko: "안녕히 가세요! 잘 가요! 내일 봐요!", en: "Goodbye! Take care! See you tomorrow!", es: "¡Adiós! ¡Cuídate! ¡Hasta mañana!" } },
    ],
    korean: [
      { type: "speak", sentence: "안녕하세요, 제 이름은 루디예요. 반갑습니다.", speechLang: "ko-KR", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 반갑습니다.", en: "Hello, my name is Rudy. Nice to meet you.", es: "Hola, me llamo Rudy. Mucho gusto." } },
      { type: "speak", sentence: "한국에서 왔어요. 서울에 살아요.", speechLang: "ko-KR", meaning: { ko: "한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." } },
      { type: "speak", sentence: "죄송해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요?", speechLang: "ko-KR", meaning: { ko: "죄송해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요?", en: "Sorry, I don't understand. Can you say that again?", es: "Lo siento, no entiendo. ¿Puede repetir eso?" } },
      { type: "speak", sentence: "화장실이 어디예요? 이거 얼마예요?", speechLang: "ko-KR", meaning: { ko: "화장실이 어디예요? 이거 얼마예요?", en: "Where is the bathroom? How much is this?", es: "¿Dónde está el baño? ¿Cuánto cuesta esto?" } },
      { type: "speak", sentence: "안녕히 가세요! 잘 가요! 내일 봐요!", speechLang: "ko-KR", meaning: { ko: "안녕히 가세요! 잘 가요! 내일 봐요!", en: "Goodbye! Take care! See you tomorrow!", es: "¡Adiós! ¡Cuídate! ¡Hasta mañana!" } },
    ],
    indonesian: [
      { type: "speak", sentence: "Halo, nama saya Rudy. Senang bertemu dengan Anda.", speechLang: "id-ID", meaning: { ko: "안녕하세요, 제 이름은 루디예요. 반갑습니다.", en: "Hello, my name is Rudy. Nice to meet you.", es: "Hola, me llamo Rudy. Mucho gusto." } },
      { type: "speak", sentence: "Saya berasal dari Korea. Saya tinggal di Seoul.", speechLang: "id-ID", meaning: { ko: "한국에서 왔어요. 서울에 살아요.", en: "I'm from Korea. I live in Seoul.", es: "Soy de Corea. Vivo en Seúl." } },
      { type: "speak", sentence: "Maaf, saya tidak mengerti. Bisa tolong ulangi?", speechLang: "id-ID", meaning: { ko: "미안해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요?", en: "Sorry, I don't understand. Can you say that again?", es: "Lo siento, no entiendo. ¿Puede repetir eso?" } },
      { type: "speak", sentence: "Di mana toilet? Ini berapa harganya?", speechLang: "id-ID", meaning: { ko: "화장실이 어디예요? 이거 얼마예요?", en: "Where is the bathroom? How much is this?", es: "¿Dónde está el baño? ¿Cuánto cuesta esto?" } },
      { type: "speak", sentence: "Selamat tinggal! Hati-hati! Sampai jumpa besok!", speechLang: "id-ID", meaning: { ko: "안녕히 가세요! 잘 가요! 내일 봐요!", en: "Goodbye! Take care! See you tomorrow!", es: "¡Adiós! ¡Cuídate! ¡Hasta mañana!" } },
    ],
    arabic: [
      { type: "speak", sentence: "أَهْلًا، أَنَا اسْمِي رودي. فُرْصة سَعيدة.", speechLang: "ar-EG", meaning: { ko: "ahlan, ana esmi Rudy. forsa sa3ida · 안녕하세요, 제 이름은 루디예요. 반갑습니다.", en: "ahlan, ana esmi Rudy. forsa sa3ida · Hello, my name is Rudy. Nice to meet you.", es: "ahlan, ana esmi Rudy. forsa sa3ida · Hola, me llamo Rudy. Mucho gusto.", id: "ahlan, ana esmi Rudy. forsa sa3ida · Halo, nama saya Rudy. Senang bertemu dengan Anda." } },
      { type: "speak", sentence: "أَنَا مِنْ كوريا. أَنَا ساكِن في سيول.", speechLang: "ar-EG", meaning: { ko: "ana men Korea. ana saken fi Seoul · 한국에서 왔어요. 서울에 살아요.", en: "ana men Korea. ana saken fi Seoul · I'm from Korea. I live in Seoul.", es: "ana men Korea. ana saken fi Seoul · Soy de Corea. Vivo en Seúl.", id: "ana men Korea. ana saken fi Seoul · Saya berasal dari Korea. Saya tinggal di Seoul." } },
      { type: "speak", sentence: "آسِف، أَنَا لا أَفْهَم. مُمْكِن تَقول مَرّة ثانِية؟", speechLang: "ar-EG", meaning: { ko: "aasef, ana mesh fahem. momken te'ool tani? · 미안해요, 이해를 못 했어요. 다시 한번 말해 주시겠어요?", en: "aasef, ana mesh fahem. momken te'ool tani? · Sorry, I don't understand. Can you say that again?", es: "aasef, ana mesh fahem. momken te'ool tani? · Lo siento, no entiendo. ¿Puede repetir eso?", id: "aasef, ana mesh fahem. momken te'ool tani? · Maaf, saya tidak mengerti. Bisa tolong ulangi?" } },
      { type: "speak", sentence: "أَيْنَ الحَمّام؟ بِكَمْ هٰذَا؟", speechLang: "ar-EG", meaning: { ko: "fein el-hammam? bekam da? · 화장실이 어디예요? 이거 얼마예요?", en: "fein el-hammam? bekam da? · Where is the bathroom? How much is this?", es: "fein el-hammam? bekam da? · ¿Dónde está el baño? ¿Cuánto cuesta esto?", id: "fein el-hammam? bekam da? · Di mana toilet? Ini berapa harganya?" } },
      { type: "speak", sentence: "مَعَ السَّلامة! اِعْتَنِ بِنَفْسِك! أَراك غَدًا!", speechLang: "ar-EG", meaning: { ko: "ma3a el-salama! khalli balak! ashoofak bokra! · 안녕히 가세요! 잘 가요! 내일 봐요!", en: "ma3a el-salama! khalli balak! ashoofak bokra! · Goodbye! Take care! See you tomorrow!", es: "ma3a el-salama! khalli balak! ashoofak bokra! · ¡Adiós! ¡Cuídate! ¡Hasta mañana!", id: "ma3a el-salama! khalli balak! ashoofak bokra! · Selamat tinggal! Hati-hati! Sampai jumpa besok!" } },
    ],
  },
};
