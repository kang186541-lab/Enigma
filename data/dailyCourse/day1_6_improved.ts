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
  },

  day_2: {
    english: { situation: { ko: "루디가 다른 나라에서 온 동료들과 이야기하고 있습니다. 출신과 사는 곳에 대해 대화해보세요!", en: "Rudy is chatting with colleagues from different countries. Talk about where you're from!", es: "Rudy habla con colegas de diferentes países. ¡Habla sobre tu origen!" }, gptPrompt: "You are Rudy chatting with your new partner about where you're both from. Simple A1 conversation in {targetLang}. Ask about: 1) their country 2) their city 3) what it's like there 4) if they like it. Share that you're from London. At one point, speak slightly fast so the user can practice 'Can you say that again?' If they do, slow down and repeat. Reinforce yes/no practice. Keep it simple and encouraging.", speechLang: "en-GB", suggestedAnswers: ["I'm from Korea.", "I live in Seoul.", "Yes!", "No.", "Can you say that again, please?", "It's a big city."] },
    spanish: { situation: { ko: "루디가 다른 나라에서 온 동료들과 이야기하고 있습니다.", en: "Rudy is chatting with colleagues from different countries.", es: "Rudy habla con colegas de diferentes países." }, gptPrompt: "You are Rudy chatting with your new partner about where you're both from. Simple A1 conversation in {targetLang}. Ask about: 1) their country 2) their city 3) what it's like there 4) if they like it. At one point, speak slightly fast so the user can practice '¿Puede repetir eso?' Reinforce sí/no practice. Keep simple.", speechLang: "es-ES", suggestedAnswers: ["Soy de Corea.", "Vivo en Seúl.", "¡Sí!", "No.", "¿Puede repetir eso, por favor?", "Es una ciudad grande."] },
    korean: { situation: { ko: "루디가 다른 나라에서 온 동료들과 이야기하고 있습니다.", en: "Rudy is chatting with colleagues from different countries.", es: "Rudy habla con colegas de diferentes países." }, gptPrompt: "You are Rudy chatting with your new partner about where you're both from. Simple A1 conversation in {targetLang}. Ask about: 1) their country 2) their city 3) what it's like there 4) if they like it. At one point, speak slightly fast so the user can practice '다시 한번 말해 주시겠어요?' Reinforce 네/아니요 practice. Keep simple.", speechLang: "ko-KR", suggestedAnswers: ["저는 한국에서 왔어요.", "서울에 살아요.", "네!", "아니요.", "다시 한번 말해 주시겠어요?", "큰 도시예요."] },
  },

  day_3: {
    english: { situation: { ko: "박물관에서 여러 직업의 사람들을 만나고 있습니다. 직업과 언어에 대해 이야기해보세요!", en: "Meeting people with different jobs at the museum. Talk about jobs and languages!", es: "Conociendo personas con diferentes trabajos. ¡Habla de trabajos e idiomas!" }, gptPrompt: "You are Rudy at a museum event meeting your new partner. Talk about jobs in simple A1 {targetLang}. Ask about: 1) what they do 2) where they work 3) if they like their job 4) what languages they speak. Practice 'Do you speak ___?' and 'A little bit.' Share your job as detective. Keep very simple.", speechLang: "en-GB", suggestedAnswers: ["I'm a student.", "I work at a school.", "Do you speak English?", "A little bit.", "That's interesting!", "Yes, I like it."] },
    spanish: { situation: { ko: "박물관에서 여러 직업의 사람들을 만나고 있습니다.", en: "Meeting people with different jobs at the museum.", es: "Conociendo personas con diferentes trabajos en el museo." }, gptPrompt: "You are Rudy at a museum event meeting your new partner. Talk about jobs in simple A1 {targetLang}. Ask about: 1) what they do 2) where they work 3) what languages they speak. Practice '¿Hablas ___?' and 'Un poquito.' Keep very simple.", speechLang: "es-ES", suggestedAnswers: ["Soy estudiante.", "Trabajo en una escuela.", "¿Hablas español?", "Un poquito.", "¡Qué interesante!", "Sí, me gusta."] },
    korean: { situation: { ko: "박물관에서 여러 직업의 사람들을 만나고 있습니다.", en: "Meeting people with different jobs at the museum.", es: "Conociendo personas con diferentes trabajos." }, gptPrompt: "You are Rudy at a museum event meeting your new partner. Talk about jobs in simple A1 {targetLang}. Ask about: 1) what they do 2) where they work 3) what languages they speak. Practice '___할 줄 아세요?' and '조금이요.' Keep very simple.", speechLang: "ko-KR", suggestedAnswers: ["저는 학생이에요.", "학교에서 일해요.", "한국어 할 줄 아세요?", "조금이요.", "재미있네요!", "네, 좋아해요."] },
  },

  day_4: {
    english: { situation: { ko: "루디가 런던 도심에서 용의자를 미행하고 있습니다. 출구와 화장실 위치를 파악해야 해요!", en: "Rudy is tailing a suspect through London. He needs to know where the exits and bathrooms are to stay on the trail!", es: "Rudy sigue a un sospechoso por Londres. ¡Necesita conocer las salidas y los baños para no perderlo!" }, gptPrompt: "You are Rudy's field partner helping him tail a suspect through a busy London building. Simple A1 {targetLang}. Practice: 1) Rudy needs to say goodbye quickly to a bystander without blowing his cover 2) ask 'Where is the exit?' and 'Where is the bathroom?' naturally as cover — he needs to know the layout 3) end with quick goodbyes as the suspect moves. The vocabulary is identical — only the detective framing makes it exciting. Keep very simple and tense.", speechLang: "en-GB", suggestedAnswers: ["Excuse me, where is the exit?", "Where is the bathroom?", "Take care! See you later!", "Goodbye — I have to go!", "It was nice meeting you.", "See you tomorrow!"] },
    spanish: { situation: { ko: "루디가 런던 도심에서 용의자를 미행하고 있습니다. 위치를 파악해야 해요!", en: "Rudy is tailing a suspect through London. He needs to know the exits!", es: "Rudy sigue a un sospechoso. ¡Necesita conocer las salidas para no perderlo!" }, gptPrompt: "You are Rudy's field partner. He is tailing a suspect and needs the building layout. Simple A1 {targetLang}. Practice: 1) quick goodbye without blowing cover 2) ask '¿Dónde está la salida?' and '¿Dónde está el baño?' as cover 3) urgent quick farewells as the suspect moves. Keep very simple and tense.", speechLang: "es-ES", suggestedAnswers: ["Disculpe, ¿dónde está la salida?", "¿Dónde está el baño?", "¡Cuídate! ¡Hasta luego!", "¡Adiós, tengo que irme!", "Fue un placer conocerte.", "¡Hasta mañana!"] },
    korean: { situation: { ko: "루디가 런던 도심에서 용의자를 미행하고 있습니다. 위치를 파악해야 해요!", en: "Rudy is tailing a suspect. He needs to know the exits!", es: "Rudy sigue a un sospechoso. ¡Necesita las salidas!" }, gptPrompt: "You are Rudy's field partner. He is tailing a suspect and needs the building layout. Simple A1 {targetLang}. Practice: 1) quick goodbye without blowing cover 2) ask '출구가 어디예요?' and '화장실이 어디예요?' as cover 3) urgent quick farewells as the suspect moves. Keep very simple and tense.", speechLang: "ko-KR", suggestedAnswers: ["실례합니다, 출구가 어디예요?", "화장실이 어디예요?", "잘 가요! 다음에 봐요!", "안녕히 가세요, 가야 해요!", "만나서 반가웠어요.", "내일 봐요!"] },
  },

  day_5: {
    english: { situation: { ko: "루디가 수사에 필요한 물품을 구매해야 합니다. 가게에서 가격을 확인하고 동료와 안부도 나눠요!", en: "Rudy needs to buy supplies for the investigation. Check prices at the shop and greet a fellow agent!", es: "Rudy necesita comprar suministros para la investigación. ¡Verifica precios en la tienda y saluda a un agente!" }, gptPrompt: "You are a fellow agent Rudy meets while buying investigation supplies at a London shop. Simple A1 {targetLang}. Practice: 1) morning greeting — asking how they are 2) Rudy is buying disguise supplies, ask 'How much is this?' for items 3) if confused about a price, practice 'I don't understand' 4) if something is wrong, use 'Help, please!'. The detective framing makes every 'How much?' transaction feel meaningful. Keep very simple.", speechLang: "en-GB", suggestedAnswers: ["I'm great, thanks!", "Not bad, and you?", "How much is this?", "I don't understand.", "Help, please!", "That's expensive!"] },
    spanish: { situation: { ko: "루디가 수사 물품을 구매하면서 동료 요원과 안부를 나눕니다.", en: "Rudy buys investigation supplies and greets a fellow agent.", es: "Rudy compra suministros de investigación y saluda a un agente." }, gptPrompt: "You are a fellow agent Rudy meets while buying investigation supplies. Simple A1 {targetLang}. Practice: 1) morning greeting 2) buying supplies — ask '¿Cuánto cuesta esto?' for items 3) if confused, practice 'No entiendo' 4) use '¡Ayuda!' if something goes wrong. Detective framing makes the shopping feel real. Keep simple.", speechLang: "es-ES", suggestedAnswers: ["¡Estoy genial, gracias!", "No está mal, ¿y tú?", "¿Cuánto cuesta esto?", "No entiendo.", "¡Ayuda, por favor!", "¡Eso es caro!"] },
    korean: { situation: { ko: "루디가 수사 물품을 구매하면서 동료 요원과 안부를 나눕니다.", en: "Rudy buys investigation supplies and greets a fellow agent.", es: "Rudy compra suministros y saluda a un agente." }, gptPrompt: "You are a fellow agent Rudy meets while buying investigation supplies. Simple A1 {targetLang}. Practice: 1) morning greeting 2) buying supplies — ask '이거 얼마예요?' for items 3) if confused, practice '이해를 못 했어요' 4) use '도와주세요!' if something goes wrong. Detective framing makes it real. Keep simple.", speechLang: "ko-KR", suggestedAnswers: ["잘 지내요, 감사해요!", "괜찮아요, 당신은요?", "이거 얼마예요?", "이해를 못 했어요.", "도와주세요!", "비싸요!"] },
  },

  day_6: {
    english: { situation: { ko: "박물관 환영 파티에서 새로운 사람들을 여러 명 만나는 상황입니다. 이번 주에 배운 모든 표현을 활용하세요!", en: "Welcome party at the museum! Meet several new people and use EVERYTHING you've learned this week!", es: "¡Fiesta de bienvenida en el museo! ¡Usa TODO lo aprendido esta semana!" }, gptPrompt: "You are Rudy hosting a welcome party at the museum. Test ALL of Unit 1 in a natural A1 {targetLang} conversation. Cover: greeting, self-introduction (name, origin, job), asking how they are, asking 'Do you speak ___?', AND survival phrases ('Where is the bathroom?', 'How much is this?' at the snack table, 'I don't understand', 'Can you say that again?'). Introduce 2-3 different 'guests'. This is a review day so test everything but be encouraging.", speechLang: "en-GB", suggestedAnswers: ["Hello! My name is ___.", "I'm from ___.", "Do you speak English?", "Where is the bathroom?", "How much is this?", "Sorry, I don't understand.", "Goodbye! See you later!"] },
    spanish: { situation: { ko: "박물관 환영 파티에서 새로운 사람들을 여러 명 만나는 상황입니다.", en: "Welcome party at the museum! Use everything you've learned!", es: "¡Fiesta de bienvenida! ¡Usa todo lo aprendido!" }, gptPrompt: "You are Rudy hosting a welcome party at the museum. Test ALL of Unit 1 in a natural A1 {targetLang} conversation. Cover: greeting, self-introduction, asking how they are, '¿Hablas ___?', AND survival phrases ('¿Dónde está el baño?', '¿Cuánto cuesta esto?', 'No entiendo', '¿Puede repetir eso?'). Introduce 2-3 different 'guests'. Be encouraging.", speechLang: "es-ES", suggestedAnswers: ["¡Hola! Me llamo ___.", "Soy de ___.", "¿Hablas español?", "¿Dónde está el baño?", "¿Cuánto cuesta esto?", "No entiendo.", "¡Adiós! ¡Hasta luego!"] },
    korean: { situation: { ko: "박물관 환영 파티에서 새로운 사람들을 여러 명 만나는 상황입니다. 배운 모든 표현을 활용하세요!", en: "Welcome party at the museum! Use everything!", es: "¡Fiesta de bienvenida! ¡Usa todo!" }, gptPrompt: "You are Rudy hosting a welcome party at the museum. Test ALL of Unit 1 in a natural A1 {targetLang} conversation. Cover: greeting, self-introduction, asking how they are, '___할 줄 아세요?', AND survival phrases ('화장실이 어디예요?', '이거 얼마예요?', '이해를 못 했어요', '다시 한번 말해 주시겠어요?'). Introduce 2-3 different 'guests'. Be encouraging.", speechLang: "ko-KR", suggestedAnswers: ["안녕하세요! 제 이름은 ___이에요.", "___에서 왔어요.", "한국어 할 줄 아세요?", "화장실이 어디예요?", "이거 얼마예요?", "이해를 못 했어요.", "안녕히 가세요! 다음에 봐요!"] },
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
  },
};
